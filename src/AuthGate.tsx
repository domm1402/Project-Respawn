import React,{useEffect,useState} from "react";
import {ActivityIndicator,Pressable,SafeAreaView,StyleSheet,Text,TextInput,View} from "react-native";
import * as SecureStore from "expo-secure-store";
import {apiRequest,backendConfigured,getAccessToken,setAccessToken} from "./backend";
const GUEST_KEY="respawn_guest_mode";
export const AuthContext=React.createContext<{signOut:()=>Promise<void>;isGuest:boolean}>({signOut:async()=>{},isGuest:false});
export const useAuth=()=>React.useContext(AuthContext);
export default function AuthGate({children}:React.PropsWithChildren){
 const [ok,setOk]=useState(false),[isGuest,setIsGuest]=useState(false),[mode,setMode]=useState<"signin"|"signup">("signin"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[username,setUsername]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let live=true;(async()=>{const guest=await SecureStore.getItemAsync(GUEST_KEY);if(guest==="1"){if(live){setIsGuest(true);setOk(true)}return}const token=await getAccessToken();if(!token||!backendConfigured)return;try{await apiRequest("/auth/me");if(live)setOk(true)}catch{await setAccessToken(null)}})();return()=>{live=false}},[]);
 async function submit(){setBusy(true);setError("");try{const r=await apiRequest<{token:string}>(mode==="signup"?"/auth/signup":"/auth/login",{method:"POST",body:JSON.stringify({email:email.trim().toLowerCase(),password,username:username.trim()})});await SecureStore.deleteItemAsync(GUEST_KEY);await setAccessToken(r.token);setIsGuest(false);setOk(true)}catch(e){setError(e instanceof Error?e.message:"Sign-in failed.")}finally{setBusy(false)}}
 async function continueAsGuest(){await setAccessToken(null);await SecureStore.setItemAsync(GUEST_KEY,"1");setIsGuest(true);setOk(true)}
 async function signOut(){await setAccessToken(null);await SecureStore.deleteItemAsync(GUEST_KEY);setIsGuest(false);setOk(false);setMode("signin")}
 if(ok)return <AuthContext.Provider value={{signOut,isGuest}}>{children}</AuthContext.Provider>;
 return <SafeAreaView style={s.safe}><View style={s.card}><Text style={s.brand}>RESPAWN</Text><Text style={s.title}>{mode==="signin"?"Welcome back":"Create your player account"}</Text><Text style={s.sub}>One account. Every game. Your community.</Text>
 {!backendConfigured?<Text style={s.error}>Email accounts need the Respawn account service configured. You can still explore in guest mode.</Text>:null}
 {mode==="signup"?<TextInput value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Username" placeholderTextColor="#89879C" style={s.input}/>:null}
 <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email address" placeholderTextColor="#89879C" style={s.input}/>
 <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password (8+ characters)" placeholderTextColor="#89879C" style={s.input}/>
 {error?<Text style={s.error}>{error}</Text>:null}
 <Pressable disabled={busy||!backendConfigured||!email.trim()||password.length<8||(mode==="signup"&&username.trim().length<3)} onPress={submit} style={[s.primary,(!backendConfigured||busy)&&{opacity:0.5}]}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.primaryText}>{mode==="signin"?"Sign in":"Create account"}</Text>}</Pressable>
 <Pressable onPress={()=>{setMode(mode==="signin"?"signup":"signin");setError("")}}><Text style={s.switch}>{mode==="signin"?"New to Respawn? Create an account":"Already have an account? Sign in"}</Text></Pressable>
 <View style={s.separator}><View style={s.rule}/><Text style={s.or}>OR</Text><View style={s.rule}/></View>
 <Pressable onPress={()=>void continueAsGuest()} style={s.guest}><Text style={s.guestText}>Continue as guest</Text></Pressable>
 <Text style={s.foot}>Gaming passwords are never requested. Gaming accounts use official provider authorization. Guest mode is saved on this device.</Text></View></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:"#090910",justifyContent:"center",padding:22},card:{backgroundColor:"#12121D",borderColor:"#28283A",borderWidth:1,borderRadius:22,padding:22,gap:13},brand:{color:"#A78BFA",fontSize:13,fontWeight:"900",letterSpacing:3},title:{color:"#F5F4FF",fontSize:25,fontWeight:"900"},sub:{color:"#9291A8",fontSize:12,marginBottom:8},input:{backgroundColor:"#191927",borderColor:"#343349",borderWidth:1,borderRadius:12,color:"#fff",padding:14,fontSize:13},primary:{backgroundColor:"#8B5CF6",padding:15,borderRadius:12,alignItems:"center"},primaryText:{color:"#fff",fontWeight:"900"},switch:{color:"#BDA8FF",textAlign:"center",fontSize:12,padding:8},error:{color:"#FF9D8C",fontSize:11},separator:{flexDirection:"row",alignItems:"center",gap:10,marginVertical:2},rule:{height:1,backgroundColor:"#343349",flex:1},or:{color:"#77758B",fontSize:9,fontWeight:"800"},guest:{borderColor:"#62518B",borderWidth:1,padding:14,borderRadius:12,alignItems:"center"},guestText:{color:"#D8CCFF",fontWeight:"900",fontSize:12},foot:{color:"#77758B",fontSize:10,lineHeight:15,textAlign:"center",marginTop:8}});
