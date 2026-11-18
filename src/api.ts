import {apiRequest} from "./backend";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {storePlatformAccount} from "./platformAccounts";
WebBrowser.maybeCompleteAuthSession();
const post=(p:string,b:any)=>apiRequest(p,{method:"POST",body:JSON.stringify(b)});
export const getMyProfile=()=>apiRequest("/api/profile");
export const saveProfile=(v:{username:string;display_name:string;bio?:string})=>post("/api/profile",v);
export const listGames=()=>apiRequest("/api/games");
export const addGame=(game_id:string,platform="manual")=>post("/api/profile-games",{game_id,platform});
export const createCommunity=(v:any)=>post("/api/communities",v);
export const joinCommunity=(community_id:string)=>post("/api/community-members",{community_id});
export const createGuild=(v:any)=>post("/api/guilds",v);
export const joinGuild=(guild_id:string)=>post("/api/guild-members",{guild_id});
export const createLfgPost=(v:any)=>post("/api/lfg-posts",v);
export const createEvent=(v:any)=>post("/api/events",v);
export const rsvpEvent=(event_id:string)=>post("/api/event-attendees",{event_id,status:"going"});
export const createPost=(body:string,community_id?:string)=>post("/api/posts",{body,community_id});
export const listFeed=()=>apiRequest("/api/posts");
export const sendChannelMessage=(channel_id:string,body:string)=>post("/api/messages",{channel_id,body});
export const subscribeToChannel=(_id:string,_cb:(v:unknown)=>void)=>()=>{};
export const sendFriendRequest=(addressee_id:string)=>post("/api/friendships",{addressee_id});
export const createDirectConversation=(participant_ids:string[],title?:string)=>post("/api/direct-conversations",{participant_ids,title});
export const listDirectMessages=(conversation_id:string)=>apiRequest("/api/direct-messages?conversation_id="+encodeURIComponent(conversation_id));
export const sendDirectMessage=(conversation_id:string,body:string)=>post("/api/direct-messages",{conversation_id,body});
export const subscribeToDirectMessages=(_id:string,_cb:(v:unknown)=>void)=>()=>{};
export const requestVoiceToken=(room_id:string)=>post("/api/voice-token",{room_id});
const steamReturnUrl = AuthSession.makeRedirectUri({ scheme: "respawn", path: "steam-auth" });

export const connectSteam = async () => {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": steamReturnUrl,
    "openid.realm": "respawn://",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
  });
  const result = await WebBrowser.openAuthSessionAsync("https://steamcommunity.com/openid/login?" + params.toString(), steamReturnUrl);
  if (result.type !== "success" || !result.url) throw new Error("Steam sign-in was cancelled.");
  const returned = new URL(result.url);
  const steamId = returned.searchParams.get("openid.claimed_id")?.match(/\\/id\\/(\\d+)$/)?.[1];
  if (!steamId || returned.searchParams.get("openid.mode") !== "id_res") throw new Error("Steam did not return a valid account identity.");
  const verification = new URLSearchParams();
  returned.searchParams.forEach((value, key) => { if (key.startsWith("openid.")) verification.append(key, value); });
  verification.set("openid.mode", "check_authentication");
  const verified = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: verification.toString()
  });
  const verificationText = await verified.text();
  if (!verified.ok || !/is_valid:true/i.test(verificationText)) throw new Error("Steam identity verification failed.");
  await storePlatformAccount({ provider: "steam", accountId: steamId, displayName: "Steam " + steamId, accessToken: "openid-verified:" + steamId });
  return { provider: "steam", accountId: steamId };
};

export const connectXbox = async () => {
  const clientId = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;
  if (!clientId) throw new Error("Add EXPO_PUBLIC_MICROSOFT_CLIENT_ID to the app build to enable Microsoft/Xbox sign-in.");
  const discovery = await AuthSession.fetchDiscoveryAsync("https://login.microsoftonline.com/consumers/v2.0");
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "respawn", path: "microsoft-auth" });
  const request = new AuthSession.AuthRequest({
    clientId, redirectUri, responseType: AuthSession.ResponseType.Code,
    scopes: ["openid", "profile", "offline_access", "User.Read", "XboxLive.signin"],
    usePKCE: true
  });
  const auth = await request.promptAsync(discovery);
  if (auth.type !== "success" || !auth.params.code || !request.codeVerifier) throw new Error("Microsoft sign-in was cancelled or did not return an authorization code.");
  const tokens = await AuthSession.exchangeCodeAsync({
    clientId, code: auth.params.code, redirectUri, extraParams: { code_verifier: request.codeVerifier }
  }, discovery);
  if (!tokens.accessToken) throw new Error("Microsoft did not return an access token.");
  const xboxAuth = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
    method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ Properties: { AuthMethod: "RPS", SiteName: "user.auth.xboxlive.com", RpsTicket: "d=" + tokens.accessToken }, RelyingParty: "http://auth.xboxlive.com", TokenType: "JWT" })
  });
  const xboxData = await xboxAuth.json();
  if (!xboxAuth.ok || !xboxData.Token) throw new Error("Microsoft sign-in succeeded, but Xbox Live did not accept the account token.");
  const xstsResponse = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
    method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ Properties: { SandboxId: "RETAIL", UserTokens: [xboxData.Token] }, RelyingParty: "http://xboxlive.com", TokenType: "JWT" })
  });
  const xsts = await xstsResponse.json();
  if (!xstsResponse.ok || !xsts.Token) throw new Error(xsts.XErr ? "Xbox Live rejected this account (code " + xsts.XErr + ")." : "Xbox Live authentication failed.");
  const xuid = xsts.DisplayClaims?.xui?.[0]?.xid;
  if (!xuid) throw new Error("Xbox Live did not return an Xbox profile ID.");
  const profileResponse = await fetch("https://profile.xboxlive.com/users/xuid(" + xuid + ")/profile/settings?settings=Gamertag", {
    headers: { "x-xbl-contract-version": "2", "Authorization": "XBL3.0 x=" + xsts.DisplayClaims.xui[0].uhs + ";" + xsts.Token }
  });
  const profile = await profileResponse.json();
  const gamertag = profile.profileUsers?.[0]?.settings?.find((item: any) => item.id === "Gamertag")?.value || "Xbox player";
  await storePlatformAccount({ provider: "xbox", accountId: String(xuid), displayName: gamertag, accessToken: xsts.Token, refreshToken: tokens.refreshToken });
  return { provider: "xbox", accountId: String(xuid), displayName: gamertag };
};
export const listPlatformConnections=()=>apiRequest("/api/platform-connections");
export const listDirectConversations=()=>apiRequest("/api/direct-conversations");
export const listGuilds=()=>apiRequest("/api/guilds");
export const listEvents=()=>apiRequest("/api/events");
export const listCommunities=()=>apiRequest("/api/communities");
export const createVoiceRoom=(v:any)=>post("/api/voice-rooms",v);
export const searchPlayers=(query:string)=>apiRequest("/api/players?q="+encodeURIComponent(query));