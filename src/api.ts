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
  const steamId = returned.searchParams.get("openid.claimed_id")?.match(/\/id\/(\d+)$/)?.[1];
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

const getMicrosoftAccessToken = async () => {
  const clientId = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;
  if (!clientId) throw new Error("Add EXPO_PUBLIC_MICROSOFT_CLIENT_ID to the app build to enable Microsoft sign-in.");
  const discovery = await AuthSession.fetchDiscoveryAsync("https://login.microsoftonline.com/consumers/v2.0");
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "respawn", path: "microsoft-auth" });
  const request = new AuthSession.AuthRequest({
    clientId, redirectUri, responseType: AuthSession.ResponseType.Code,
    scopes: ["openid", "profile", "offline_access", "XboxLive.signin"],
    usePKCE: true
  });
  const auth = await request.promptAsync(discovery);
  if (auth.type !== "success" || !auth.params.code || !request.codeVerifier) {
    throw new Error("Microsoft sign-in was cancelled or did not return an authorization code.");
  }
  const tokens = await AuthSession.exchangeCodeAsync({
    clientId, code: auth.params.code, redirectUri,
    extraParams: { code_verifier: request.codeVerifier }
  }, discovery);
  if (!tokens.accessToken) throw new Error("Microsoft did not return an access token.");
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
};

const getXboxIdentity = async (microsoftAccessToken: string, relyingParty = "http://xboxlive.com") => {
  const xboxAuth = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
    method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      Properties: { AuthMethod: "RPS", SiteName: "user.auth.xboxlive.com", RpsTicket: "d=" + microsoftAccessToken },
      RelyingParty: "http://auth.xboxlive.com", TokenType: "JWT"
    })
  });
  const xboxData = await xboxAuth.json();
  if (!xboxAuth.ok || !xboxData.Token) throw new Error("Microsoft sign-in succeeded, but Xbox Live did not accept this account.");
  const xstsResponse = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
    method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      Properties: { SandboxId: "RETAIL", UserTokens: [xboxData.Token] },
      RelyingParty: relyingParty, TokenType: "JWT"
    })
  });
  const xsts = await xstsResponse.json();
  if (!xstsResponse.ok || !xsts.Token) {
    throw new Error(xsts.XErr ? "Xbox authentication was rejected (code " + xsts.XErr + ")." : "Xbox authentication failed.");
  }
  const user = xsts.DisplayClaims?.xui?.[0];
  if (!user?.uhs) throw new Error("Xbox authentication did not return a user hash.");
  return { token: xsts.Token as string, userHash: user.uhs as string, xuid: user.xid as string | undefined };
};

export const connectXbox = async () => {
  const microsoft = await getMicrosoftAccessToken();
  const xbox = await getXboxIdentity(microsoft.accessToken);
  if (!xbox.xuid) throw new Error("Xbox Live did not return an Xbox profile ID.");
  const profileResponse = await fetch("https://profile.xboxlive.com/users/xuid(" + xbox.xuid + ")/profile/settings?settings=Gamertag", {
    headers: { "x-xbl-contract-version": "2", "Authorization": "XBL3.0 x=" + xbox.userHash + ";" + xbox.token }
  });
  const profile = await profileResponse.json();
  const gamertag = profile.profileUsers?.[0]?.settings?.find((item: any) => item.id === "Gamertag")?.value || "Xbox player";
  await storePlatformAccount({
    provider: "xbox", accountId: String(xbox.xuid), displayName: gamertag,
    accessToken: xbox.token, refreshToken: microsoft.refreshToken
  });
  return { provider: "xbox", accountId: String(xbox.xuid), displayName: gamertag };
};

export const connectMinecraft = async () => {
  const microsoft = await getMicrosoftAccessToken();
  const xbox = await getXboxIdentity(microsoft.accessToken, "rp://api.minecraftservices.com/");
  let accountId = xbox.xuid || xbox.userHash;
  let displayName = "Minecraft player";
  let minecraftAccessToken = xbox.token;

  // If this Microsoft account also has a Java Edition profile, use its official Minecraft profile.
  // Xbox/Bedrock-linked accounts can still be represented by their Xbox identity.
  try {
    const minecraftLogin = await fetch("https://api.minecraftservices.com/authentication/login_with_xbox", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identityToken: "XBL3.0 x=" + xbox.userHash + ";" + xbox.token })
    });
    const minecraftTokens = await minecraftLogin.json();
    if (minecraftLogin.ok && minecraftTokens.access_token) {
      const profileResponse = await fetch("https://api.minecraftservices.com/minecraft/profile", {
        headers: { "Authorization": "Bearer " + minecraftTokens.access_token }
      });
      const profile = await profileResponse.json();
      if (profileResponse.ok && profile.id && profile.name) {
        accountId = profile.id;
        displayName = profile.name;
        minecraftAccessToken = minecraftTokens.access_token;
      }
    }
  } catch {
    // Keep the verified Microsoft/Xbox identity for Bedrock-linked accounts.
  }

  if (displayName === "Minecraft player" && xbox.xuid) {
    try {
      const xboxProfileResponse = await fetch("https://profile.xboxlive.com/users/xuid(" + xbox.xuid + ")/profile/settings?settings=Gamertag", {
        headers: { "x-xbl-contract-version": "2", "Authorization": "XBL3.0 x=" + xbox.userHash + ";" + xbox.token }
      });
      const xboxProfile = await xboxProfileResponse.json();
      displayName = xboxProfile.profileUsers?.[0]?.settings?.find((item: any) => item.id === "Gamertag")?.value || "Minecraft player";
    } catch {}
  }

  await storePlatformAccount({
    provider: "minecraft", accountId: String(accountId), displayName,
    accessToken: minecraftAccessToken, refreshToken: microsoft.refreshToken
  });
  return { provider: "minecraft", accountId: String(accountId), displayName };
};
export const listPlatformConnections=()=>apiRequest("/api/platform-connections");
export const listDirectConversations=()=>apiRequest("/api/direct-conversations");
export const listGuilds=()=>apiRequest("/api/guilds");
export const listEvents=()=>apiRequest("/api/events");
export const listCommunities=()=>apiRequest("/api/communities");
export const createVoiceRoom=(v:any)=>post("/api/voice-rooms",v);
export const searchPlayers=(query:string)=>apiRequest("/api/players?q="+encodeURIComponent(query));