import React,{useState} from "react";
import {ActivityIndicator,Linking,Pressable,StyleSheet,Text,TextInput,View} from "react-native";
import * as SecureStore from "expo-secure-store";
import {Gamepad2,Search,Plus} from "lucide-react-native";
import { theme } from "./theme";

const C=theme.colors;
const STEAM_KEY="respawn_steam_web_api_key_v1";
type Game={appid:number;name:string;playtime_forever:number;img_icon_url?:string};
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

const s=StyleSheet.create({
 panel:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:15,padding:13,gap:11,marginTop:10},
 row:{flexDirection:"row",alignItems:"center",gap:8},
 heading:{fontSize:13,fontWeight:"900",color:C.text},
 muted:{fontSize:9,color:C.muted,lineHeight:14},
 chips:{flexDirection:"row",flexWrap:"wrap",gap:6},
 chip:{paddingHorizontal:10,paddingVertical:7,borderRadius:18,backgroundColor:C.panel2,borderWidth:1,borderColor:C.line},
 chipOn:{backgroundColor:C.purple+"30",borderColor:C.purple},
 chipText:{fontSize:9,color:C.muted,fontWeight:"800"},
 chipTextOn:{color:C.lav},
 input:{height:42,borderRadius:10,backgroundColor:C.panel2,borderWidth:1,borderColor:C.line,color:C.text,paddingHorizontal:11,fontSize:10},
 tiny:{fontSize:8,color:C.muted,lineHeight:12},
 primary:{height:42,borderRadius:10,backgroundColor:C.purple,alignItems:"center",justifyContent:"center",flexDirection:"row",gap:7},
 primaryText:{fontSize:10,color:"#fff",fontWeight:"900"},
 error:{fontSize:9,color:C.red,lineHeight:14},
 note:{fontSize:9,color:C.green,lineHeight:14},
 subheading:{fontSize:8,color:C.lav,fontWeight:"900",letterSpacing:1,marginTop:4},
 game:{flexDirection:"row",alignItems:"center",paddingVertical:8,borderTopWidth:1,borderTopColor:C.line},
 gameName:{fontSize:10,color:C.text,fontWeight:"800"},
 add:{flexDirection:"row",alignItems:"center",gap:4,padding:8,backgroundColor:C.panel2,borderRadius:8},
 addText:{fontSize:8,color:C.lav,fontWeight:"900"},
 secondary:{padding:11,alignItems:"center",borderRadius:9,borderWidth:1,borderColor:C.line},
 secondaryText:{fontSize:9,color:C.text,fontWeight:"800"}
});
