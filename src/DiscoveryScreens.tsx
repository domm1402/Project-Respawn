import React,{useState} from "react";
import {ActivityIndicator,Linking,Pressable,StyleSheet,Text,TextInput,View} from "react-native";
import * as SecureStore from "expo-secure-store";
import {ExternalLink,Gamepad2,Search,Tv,Youtube,Twitch,RefreshCw,Plus} from "lucide-react-native";

const C={bg:"#090910",panel:"#12121D",panel2:"#191927",line:"#29283A",text:"#F5F3FF",muted:"#9290A8",purple:"#8B5CF6",lav:"#B9A0FF",green:"#4BD49A"};
const STEAM_KEY="respawn_steam_web_api_key_v1";
const YOUTUBE_KEY="respawn_youtube_api_key_v1";
const TWITCH_ID="respawn_twitch_client_id_v1";
const TWITCH_TOKEN="respawn_twitch_app_token_v1";
type Game={appid:number;name:string;playtime_forever:number;img_icon_url?:string};
type MediaItem={id:string;title:string;creator:string;url:string;platform:"Twitch"|"YouTube";live?:boolean;thumbnail?:string;viewers?:number};
const platforms=["Steam","Xbox","Epic Games","PlayStation","Nintendo"];
export function GameAccountFinder({onAddGames}:{onAddGames:(names:string[])=>void}){
 const [platform,setPlatform]=useState("Steam"),[username,setUsername]=useState(""),[apiKey,setApiKey]=useState(""),[games,setGames]=useState<Game[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[note,setNote]=useState("");
 React.useEffect(()=>{SecureStore.getItemAsync(STEAM_KEY).then(v=>{if(v)setApiKey(v)}).catch(()=>{})},[]);
 async function lookup(){
  setError("");setNote("");setGames([]);
  if(!username.trim()){setError("Enter a public profile name or account ID.");return}
  if(platform!=="Steam"){
   const q=encodeURIComponent(platform+" "+username.trim()+" public game library games");
   const url=platform==="Xbox"?"https://www.google.com/search?q="+q:platform==="Epic Games"?"https://www.google.com/search?q="+q:platform==="PlayStation"?"https://www.google.com/search?q="+q:"https://www.google.com/search?q="+q;
   setNote(platform+" does not provide a reliable public game-library lookup by username. You can search public profile information, but Respawn cannot promise a complete games list without the platform's authorised account access.");
   Linking.openURL(url).catch(()=>{});
   return;
  }
  if(!apiKey.trim()){setError("Add a Steam Web API key first. It is not your Steam password and does not sign you in.");return}
  setBusy(true);
  try{
   await SecureStore.setItemAsync(STEAM_KEY,apiKey.trim());
   let steamId=username.trim();
   if(!/^\d{17}$/.test(steamId)){
    const resolve=await fetch("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key="+encodeURIComponent(apiKey.trim())+"&vanityurl="+encodeURIComponent(steamId));
    if(!resolve.ok)throw new Error("Steam could not resolve that profile. Check the username and API key.");
    const resolved=await resolve.json();
    if(resolved?.response?.success!==1||!resolved?.response?.steamid)throw new Error("Steam profile not found. Use the profile's custom URL name or 17-digit SteamID.");
    steamId=resolved.response.steamid;
   }
   const response=await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key="+encodeURIComponent(apiKey.trim())+"&steamid="+encodeURIComponent(steamId)+"&include_appinfo=true&include_played_free_games=true");
   if(!response.ok)throw new Error("Steam library request failed. Check the API key and make sure the profile's game details are public.");
   const result=await response.json();
   const owned:Game[]=result?.response?.games||[];
   if(!owned.length)throw new Error("No public games were returned. The profile may be private, empty, or hiding its game details.");
   setGames(owned.sort((a,b)=>b.playtime_forever-a.playtime_forever));
   setNote("Found "+owned.length+" publicly visible games. Private games and hidden profile data cannot be read.");
  }catch(e){setError(e instanceof Error?e.message:"Could not load this public library.")}finally{setBusy(false)}
 }
 return <View style={s.panel}>
  <View style={s.row}><Gamepad2 color={C.lav} size={19}/><Text style={s.heading}>Find games from an account</Text></View>
  <Text style={s.muted}>Look up public libraries by username. No platform password or sign-in is requested.</Text>
  <View style={s.chips}>{platforms.map(p=><Pressable key={p} onPress={()=>{setPlatform(p);setGames([]);setError("");setNote("")}} style={[s.chip,platform===p&&s.chipOn]}><Text style={[s.chipText,platform===p&&s.chipTextOn]}>{p}</Text></Pressable>)}</View>
  <TextInput value={username} onChangeText={setUsername} autoCapitalize="none" placeholder={platform==="Xbox"?"Xbox gamertag":platform==="Steam"?"Steam username or 17-digit SteamID":"Public profile username"} placeholderTextColor={C.muted} style={s.input}/>
  {platform==="Steam"? <><TextInput value={apiKey} onChangeText={setApiKey} autoCapitalize="none" placeholder="Steam Web API key" placeholderTextColor={C.muted} style={s.input} secureTextEntry/><Text style={s.tiny}>Get a key from steamcommunity.com/dev/apikey. This is an API key, not your account password.</Text></>:null}
  <Pressable onPress={lookup} disabled={busy} style={s.primary}>{busy?<ActivityIndicator color="#fff"/>:<><Search color="#fff" size={16}/><Text style={s.primaryText}>{platform==="Steam"?"Find public Steam games":"Search public profile"}</Text></>}</Pressable>
  {error?<Text style={s.error}>{error}</Text>:null}{note?<Text style={s.note}>{note}</Text>:null}
  {games.length>0?<><Text style={s.subheading}>PUBLIC LIBRARY · {games.length} GAMES</Text>{games.slice(0,80).map(g=><View key={g.appid} style={s.game}><View style={{flex:1}}><Text style={s.gameName}>{g.name}</Text><Text style={s.tiny}>{Math.round((g.playtime_forever||0)/60)} hours played</Text></View><Pressable onPress={()=>onAddGames([g.name])} style={s.add}><Plus color={C.lav} size={15}/><Text style={s.addText}>ADD</Text></Pressable></View>)}<Pressable onPress={()=>onAddGames(games.map(g=>g.name))} style={s.secondary}><Text style={s.secondaryText}>Add all {games.length} games to my vault</Text></Pressable></>:null}
 </View>
}
export function WatchScreen(){
 const [query,setQuery]=useState(""),[youtubeKey,setYoutubeKey]=useState(""),[twitchId,setTwitchId]=useState(""),[twitchToken,setTwitchToken]=useState(""),[items,setItems]=useState<MediaItem[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[mode,setMode]=useState<"All"|"Twitch"|"YouTube">("All");
 React.useEffect(()=>{Promise.all([SecureStore.getItemAsync(YOUTUBE_KEY),SecureStore.getItemAsync(TWITCH_ID),SecureStore.getItemAsync(TWITCH_TOKEN)]).then(([y,t,tt])=>{if(y)setYoutubeKey(y);if(t)setTwitchId(t);if(tt)setTwitchToken(tt)}).catch(()=>{})},[]);
 async function search(){
  const q=query.trim();if(!q){setError("Search for a game, creator or topic.");return}
  setBusy(true);setError("");setItems([]);
  const found:MediaItem[]=[];
  try{
   if(mode!=="Twitch"&&youtubeKey.trim()){
    await SecureStore.setItemAsync(YOUTUBE_KEY,youtubeKey.trim());
    const url="https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&order=relevance&q="+encodeURIComponent(q)+"&key="+encodeURIComponent(youtubeKey.trim());
    const r=await fetch(url);const d=await r.json();if(!r.ok)throw new Error(d?.error?.message||"YouTube search failed.");
    for(const v of d.items||[])found.push({id:v.id.videoId,title:v.snippet.title,creator:v.snippet.channelTitle,url:"https://www.youtube.com/watch?v="+v.id.videoId,platform:"YouTube",thumbnail:v.snippet.thumbnails?.medium?.url});
   }
   if(mode!=="YouTube"&&twitchId.trim()&&twitchToken.trim()){
    await SecureStore.setItemAsync(TWITCH_ID,twitchId.trim());await SecureStore.setItemAsync(TWITCH_TOKEN,twitchToken.trim());
    const r=await fetch("https://api.twitch.tv/helix/search/channels?query="+encodeURIComponent(q)+"&first=20",{headers:{"Client-Id":twitchId.trim(),"Authorization":"Bearer "+twitchToken.trim()}});
    const d=await r.json();if(!r.ok)throw new Error(d?.message||"Twitch search failed.");
    for(const v of (d.data||[]).filter((x:any)=>x.is_live))found.push({id:v.id,title:v.title||v.display_name,creator:v.display_name,url:"https://www.twitch.tv/"+v.broadcaster_login,platform:"Twitch",live:true,viewers:v.game_name?undefined:undefined});
   }
   setItems(found);
   if(!found.length)setError("No API results. Add a YouTube API key and/or Twitch Client ID plus app access token below. You can still open the official search pages.");
  }catch(e){setError(e instanceof Error?e.message:"Search could not be completed.")}finally{setBusy(false)}
 }
 const openSearch=(platform:"Twitch"|"YouTube")=>Linking.openURL(platform==="Twitch"?"https://www.twitch.tv/search?term="+encodeURIComponent(query):"https://www.youtube.com/results?search_query="+encodeURIComponent(query)).catch(()=>{});
 return <View style={s.panel}>
  <View style={s.row}><Tv color={C.lav} size={19}/><Text style={s.heading}>Watch gaming</Text></View>
  <Text style={s.muted}>Discover live Twitch channels and YouTube gaming videos. Open anything you want to watch.</Text>
  <View style={s.chips}>{(["All","Twitch","YouTube"] as const).map(p=><Pressable key={p} onPress={()=>setMode(p)} style={[s.chip,mode===p&&s.chipOn]}><Text style={[s.chipText,mode===p&&s.chipTextOn]}>{p}</Text></Pressable>)}</View>
  <TextInput value={query} onChangeText={setQuery} placeholder="Search Minecraft, Fortnite, GTA..." placeholderTextColor={C.muted} style={s.input}/>
  <Pressable onPress={search} disabled={busy} style={s.primary}>{busy?<ActivityIndicator color="#fff"/>:<><Search color="#fff" size={16}/><Text style={s.primaryText}>Search connected feeds</Text></>}</Pressable>
  <View style={s.quickRow}><Pressable onPress={()=>openSearch("Twitch")} style={s.quick}><Text style={s.quickText}>Browse Twitch search ↗</Text></Pressable><Pressable onPress={()=>openSearch("YouTube")} style={s.quick}><Text style={s.quickText}>Browse YouTube ↗</Text></Pressable></View>
  {error?<Text style={s.note}>{error}</Text>:null}
  {items.map(item=><Pressable key={item.platform+item.id} onPress={()=>Linking.openURL(item.url).catch(()=>{})} style={s.mediaCard}><View style={[s.mediaIcon,{backgroundColor:item.platform==="Twitch"?"#6541A5":"#B91C1C"}]}>{item.platform==="Twitch"?<Twitch color="#fff" size={19}/>:<Youtube color="#fff" size={19}/>}</View><View style={{flex:1}}><Text style={s.gameName} numberOfLines={2}>{item.title}</Text><Text style={s.tiny}>{item.platform} · {item.creator}{item.live?" · LIVE NOW":""}</Text></View><ExternalLink color={C.lav} size={17}/></Pressable>)}
  <View style={s.apiBox}><Text style={s.subheading}>OPTIONAL API CONNECTIONS</Text><Text style={s.tiny}>For in-app result lists, add your own free developer credentials. These are saved securely on this device.</Text>
   <TextInput value={youtubeKey} onChangeText={setYoutubeKey} placeholder="YouTube Data API key" placeholderTextColor={C.muted} secureTextEntry style={s.input}/>
   <TextInput value={twitchId} onChangeText={setTwitchId} placeholder="Twitch Client ID" placeholderTextColor={C.muted} style={s.input}/>
   <TextInput value={twitchToken} onChangeText={setTwitchToken} placeholder="Twitch app access token" placeholderTextColor={C.muted} secureTextEntry style={s.input}/>
   <Text style={s.tiny}>YouTube: Google Cloud Console, enable YouTube Data API v3. Twitch: Twitch Developer Console, create an app and generate an app access token. Without keys, the official Twitch and YouTube search links still work.</Text>
  </View>
 </View>
}
const s=StyleSheet.create({panel:{backgroundColor:C.panel,borderColor:C.line,borderWidth:1,borderRadius:17,padding:14,gap:10,marginTop:12},row:{flexDirection:"row",alignItems:"center",gap:9},heading:{color:C.text,fontSize:15,fontWeight:"900"},muted:{color:C.muted,fontSize:10,lineHeight:15},chips:{flexDirection:"row",flexWrap:"wrap",gap:7},chip:{backgroundColor:C.panel2,borderWidth:1,borderColor:C.line,borderRadius:18,paddingHorizontal:11,paddingVertical:8},chipOn:{backgroundColor:"#8B5CF633",borderColor:C.purple},chipText:{color:C.muted,fontSize:9,fontWeight:"800"},chipTextOn:{color:C.lav},input:{backgroundColor:C.panel2,borderColor:C.line,borderWidth:1,borderRadius:11,padding:12,color:C.text,fontSize:11},tiny:{color:C.muted,fontSize:9,lineHeight:14},primary:{backgroundColor:C.purple,borderRadius:11,padding:13,alignItems:"center",justifyContent:"center",flexDirection:"row",gap:8},primaryText:{color:"#fff",fontSize:10,fontWeight:"900"},error:{color:"#FF9D8C",fontSize:10,lineHeight:15},note:{color:"#D4C8F2",fontSize:10,lineHeight:15,backgroundColor:"#8B5CF622",padding:10,borderRadius:9},subheading:{color:C.lav,fontSize:9,fontWeight:"900",letterSpacing:1.2,marginTop:4},game:{flexDirection:"row",alignItems:"center",gap:8,paddingVertical:9,borderBottomWidth:1,borderBottomColor:C.line},gameName:{color:C.text,fontSize:11,fontWeight:"800"},add:{flexDirection:"row",alignItems:"center",gap:4,padding:8,backgroundColor:"#8B5CF622",borderRadius:8},addText:{color:C.lav,fontSize:8,fontWeight:"900"},secondary:{padding:12,borderWidth:1,borderColor:C.purple,borderRadius:10,alignItems:"center"},secondaryText:{color:C.lav,fontSize:10,fontWeight:"900"},quickRow:{flexDirection:"row",gap:8},quick:{flex:1,backgroundColor:C.panel2,padding:10,borderRadius:9,alignItems:"center"},quickText:{color:C.lav,fontSize:9,fontWeight:"800"},mediaCard:{flexDirection:"row",alignItems:"center",gap:10,backgroundColor:C.panel2,borderWidth:1,borderColor:C.line,borderRadius:12,padding:10},mediaIcon:{width:37,height:37,borderRadius:10,alignItems:"center",justifyContent:"center"},apiBox:{borderTopWidth:1,borderTopColor:C.line,paddingTop:12,gap:9,marginTop:5}});
