import * as SecureStore from "expo-secure-store";
export const apiUrl=(process.env.EXPO_PUBLIC_RESPAWN_API_URL||"").replace(/\/$/,"");
export const backendConfigured=Boolean(apiUrl);
const KEY="respawn_access_token";
export const getAccessToken=()=>SecureStore.getItemAsync(KEY);
export const setAccessToken=(v:string|null)=>v?SecureStore.setItemAsync(KEY,v):SecureStore.deleteItemAsync(KEY);
export async function apiRequest<T=any>(path:string,options:RequestInit={}):Promise<T>{
 if(!apiUrl) throw new Error("Respawn API is not configured. See docs/SETUP_BACKEND.md.");
 const token=await getAccessToken();
 const r=await fetch(apiUrl+path,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(options.headers||{})}});
 const data=await r.json().catch(()=>({}));
 if(!r.ok) throw new Error(data.error||"Respawn API request failed ("+r.status+").");
 return data as T;
}