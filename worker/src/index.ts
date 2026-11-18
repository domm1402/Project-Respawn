interface Env { DB: D1Database; TOKEN_SECRET: string }
const headers={"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type, Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
const reply=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers});
const uid=()=>crypto.randomUUID(), now=()=>new Date().toISOString();
const b64=(v:Uint8Array)=>btoa(String.fromCharCode(...v)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
async function hash(p:string,s:string){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(p),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(s),iterations:210000,hash:"SHA-256"},k,256);return s+":"+b64(new Uint8Array(bits))}
async function token(sub:string,secret:string){const h=b64(new TextEncoder().encode(JSON.stringify({alg:"HS256",typ:"JWT"}))),p=b64(new TextEncoder().encode(JSON.stringify({sub,exp:Math.floor(Date.now()/1000)+2592000})));const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(h+"."+p));return h+"."+p+"."+b64(new Uint8Array(sig))}
async function userId(r:Request,e:Env){const a=r.headers.get("Authorization")||"";if(!a.startsWith("Bearer "))throw Error("Sign in required.");const [h,p,s]=a.slice(7).split(".");const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(e.TOKEN_SECRET),{name:"HMAC",hash:"SHA-256"},false,["verify"]);const raw=Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));if(!await crypto.subtle.verify("HMAC",k,raw,new TextEncoder().encode(h+"."+p)))throw Error("Invalid session.");const d=JSON.parse(atob(p.replace(/-/g,"+").replace(/_/g,"/")));if(d.exp<Date.now()/1000)throw Error("Session expired.");return d.sub as string}
const tables:any={
 posts:{cols:["body","community_id"],owner:"author_id"},communities:{cols:["name","slug","description","visibility","game_id"],owner:"owner_id"},
 guilds:{cols:["name","description","game_id","region","recruiting"],owner:"owner_id"},events:{cols:["title","starts_at","description","game_id","community_id","guild_id","capacity"],owner:"host_id"},
 voice_rooms:{cols:["name","community_id","guild_id"],owner:"created_by"},lfg_posts:{cols:["game_id","platform","region","play_style","description","expires_at"],owner:"author_id"},
 messages:{cols:["channel_id","body"],owner:"author_id"},direct_messages:{cols:["conversation_id","body"],owner:"author_id"},
 friendships:{cols:["addressee_id"],owner:"requester_id"},community_members:{cols:["community_id"],owner:"profile_id"},
 guild_members:{cols:["guild_id"],owner:"profile_id"},event_attendees:{cols:["event_id","status"],owner:"profile_id"},
 profile_games:{cols:["game_id","platform"],owner:"profile_id"}
};
export default {async fetch(r:Request,e:Env){
 if(r.method==="OPTIONS")return reply({});
 const u=new URL(r.url),p=u.pathname;
 try{
  if(p==="/health")return reply({ok:true,service:"Respawn API",storage:"Cloudflare D1"});
  if(p==="/auth/signup"&&r.method==="POST"){const b:any=await r.json(),email=String(b.email||"").trim().toLowerCase(),name=String(b.username||"").trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||name.length<3||String(b.password||"").length<8)return reply({error:"Use a valid email, username (3+ characters) and password (8+ characters)."},400);const id=uid();await e.DB.batch([e.DB.prepare("INSERT INTO users VALUES(?,?,?,?,?)").bind(id,email,name,await hash(b.password,id),now()),e.DB.prepare("INSERT INTO profiles(id,username,display_name,created_at) VALUES(?,?,?,?)").bind(id,name,name,now())]);return reply({token:await token(id,e.TOKEN_SECRET)},201)}
  if(p==="/auth/login"&&r.method==="POST"){const b:any=await r.json(),v:any=await e.DB.prepare("SELECT id,password_hash FROM users WHERE email=?").bind(String(b.email||"").toLowerCase().trim()).first();if(!v||await hash(String(b.password||""),v.id)!==v.password_hash)return reply({error:"Email or password is incorrect."},401);return reply({token:await token(v.id,e.TOKEN_SECRET)})}
  if(p==="/api/community/messages"&&r.method==="GET"){const channel=String(u.searchParams.get("channel_id")||"general").slice(0,40);const rows=await e.DB.prepare("SELECT id,channel_id,author_name,body,created_at FROM messages WHERE channel_id=? ORDER BY created_at DESC LIMIT 100").bind(channel).all();return reply((rows.results||[]).reverse())}
  if(p==="/api/community/messages"&&r.method==="POST"){const b:any=await r.json(),channel=String(b.channel_id||"").trim(),body=String(b.body||"").trim(),author=String(b.author_name||"Player").trim().slice(0,24);const allowed=["general","minecraft","fortnite","gta-v","roblox","call-of-duty","rocket-league","apex-legends","ea-fc","other-games"];if(!allowed.includes(channel))return reply({error:"Unknown chat channel."},400);if(!body||body.length>1000)return reply({error:"Messages must contain 1 to 1000 characters."},400);const id=uid();await e.DB.prepare("INSERT INTO messages(id,channel_id,author_id,body,created_at,author_name) VALUES(?,?,?,?,?,?)").bind(id,channel,"guest:"+uid(),body,now(),author||"Player").run();return reply({id,channel_id:channel,author_name:author||"Player",body,created_at:now()},201)}
  const me=await userId(r,e);
  if(p==="/auth/me")return reply({user:{id:me},profile:await e.DB.prepare("SELECT * FROM profiles WHERE id=?").bind(me).first()});
  if(p==="/api/profile"&&r.method==="GET")return reply(await e.DB.prepare("SELECT * FROM profiles WHERE id=?").bind(me).first());
  if(p==="/api/profile"&&r.method==="POST"){const b:any=await r.json();await e.DB.prepare("UPDATE profiles SET username=?,display_name=?,bio=? WHERE id=?").bind(b.username,b.display_name,b.bio||"",me).run();return reply(await e.DB.prepare("SELECT * FROM profiles WHERE id=?").bind(me).first())}
  if(p==="/api/games")return reply((await e.DB.prepare("SELECT * FROM games ORDER BY name").all()).results);
  if(p==="/api/platform-connections")return reply((await e.DB.prepare("SELECT provider,provider_user_id,display_name,status,connected_at FROM platform_connections WHERE profile_id=?").bind(me).all()).results);
  if(p==="/api/players"){const q="%"+(u.searchParams.get("q")||"").replace(/[%_]/g,"")+"%";return reply((await e.DB.prepare("SELECT id,username,display_name,avatar_url FROM profiles WHERE username LIKE ? OR display_name LIKE ? LIMIT 20").bind(q,q).all()).results)}
  if(p==="/api/direct-conversations"&&r.method==="GET")return reply((await e.DB.prepare("SELECT c.* FROM direct_conversations c JOIN direct_conversation_members m ON m.conversation_id=c.id WHERE m.profile_id=? ORDER BY c.created_at DESC").bind(me).all()).results);
  if(p==="/api/direct-conversations"&&r.method==="POST"){const b:any=await r.json(),id=uid();await e.DB.prepare("INSERT INTO direct_conversations VALUES(?,?,?,?,?)").bind(id,me,b.title||null,(b.participant_ids||[]).length>1?1:0,now()).run();const ids=[...new Set([me,...(b.participant_ids||[])])];await e.DB.batch(ids.map(x=>e.DB.prepare("INSERT OR IGNORE INTO direct_conversation_members VALUES(?,?)").bind(id,x)));return reply({id,created_by:me,title:b.title||null},201)}
  if(p==="/api/direct-messages"&&r.method==="GET"){const cid=u.searchParams.get("conversation_id");return reply((await e.DB.prepare("SELECT d.*,p.username,p.display_name,p.avatar_url FROM direct_messages d LEFT JOIN profiles p ON p.id=d.author_id JOIN direct_conversation_members m ON m.conversation_id=d.conversation_id WHERE d.conversation_id=? AND m.profile_id=? ORDER BY d.created_at LIMIT 100").bind(cid,me).all()).results)}
  const m=p.match(/^\/api\/([a-z-]+)$/),table=m?.[1]?.replace(/-/g,"_");
  if(table&&tables[table]){
   const spec=tables[table];
   if(r.method==="GET"){const rows=await e.DB.prepare("SELECT * FROM "+table+" ORDER BY created_at DESC LIMIT 100").all();return reply(rows.results)}
   if(r.method==="POST"){const b:any=await r.json();
    if(["profile_games","community_members","guild_members","event_attendees"].includes(table)){
      const key=table==="profile_games"?"profile_id":table==="community_members"||table==="guild_members"?"profile_id":"profile_id";
      const other=table==="profile_games"?"game_id":table==="community_members"?"community_id":table==="guild_members"?"guild_id":"event_id";
      const extra=table==="event_attendees"?(b.status||"going"):"member";
      if(table==="event_attendees")await e.DB.prepare("INSERT OR REPLACE INTO "+table+"(profile_id,event_id,status) VALUES(?,?,?)").bind(me,b[other],extra).run();
      else await e.DB.prepare("INSERT OR IGNORE INTO "+table+"(profile_id,"+other+(table==="profile_games"?",platform":",role")+") VALUES(?,?,?)").bind(me,b[other],table==="profile_games"?(b.platform||"manual"):"member").run();
      return reply({ok:true},201);
    }
    const row:any={id:uid(),[spec.owner]:me,created_at:now()};for(const c of spec.cols)if(b[c]!==undefined)row[c]=b[c];if(table==="communities"&&!row.slug)row.slug=String(row.name||"community").toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+row.id.slice(0,6);if(table==="direct_messages"){row.conversation_id=b.conversation_id;row.author_id=me}
    const cols=Object.keys(row);await e.DB.prepare("INSERT INTO "+table+"("+cols.join(",")+") VALUES("+cols.map(()=>"?").join(",")+")").bind(...cols.map(c=>row[c])).run();return reply(row,201)}
  }
  if(p==="/api/voice-token")return reply({error:"LiveKit token service is not configured on the Respawn server."},503);
  if(p.startsWith("/api/oauth/"))return reply({error:"This provider's official OAuth callback is not migrated yet. No fake account connection is allowed."},503);
  return reply({error:"Route not found."},404);
 }catch(err){return reply({error:err instanceof Error?err.message:"Unexpected server error."},400)}
}};