import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, GET, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = new URL(req.url);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (req.method === "POST") {
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) return json({ error: "Sign in required" }, 401);
    const clientId = Deno.env.get("MICROSOFT_CLIENT_ID");
    const redirectUri = Deno.env.get("XBOX_CALLBACK_URL");
    if (!clientId || !redirectUri) return json({ error: "Microsoft app registration is not configured" }, 503);
    const state = crypto.randomUUID();
    const { error: stateError } = await admin.from("oauth_states").insert({ state, profile_id: user.id, provider: "xbox", expires_at: new Date(Date.now() + 10 * 60_000).toISOString() });
    if (stateError) return json({ error: "Could not start Xbox connection" }, 500);
    const authUrl = new URL("https://login.live.com/oauth20_authorize.srf");
    authUrl.search = new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: redirectUri, scope: "XboxLive.signin offline_access", state }).toString();
    return json({ url: authUrl.toString() });
  }

  if (req.method === "GET") {
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    if (!state || !code) return json({ error: "Invalid Microsoft callback" }, 400);
    const { data: record } = await admin.from("oauth_states").select("*").eq("state", state).eq("provider", "xbox").gt("expires_at", new Date().toISOString()).maybeSingle();
    if (!record) return json({ error: "Expired or invalid sign-in state" }, 400);
    const clientId = Deno.env.get("MICROSOFT_CLIENT_ID")!;
    const clientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET")!;
    const redirectUri = Deno.env.get("XBOX_CALLBACK_URL")!;
    const tokenResponse = await fetch("https://login.live.com/oauth20_token.srf", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri: redirectUri })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) return json({ error: "Microsoft token exchange failed" }, 401);

    const userAuth = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ Properties: { AuthMethod: "RPS", SiteName: "user.auth.xboxlive.com", RpsTicket: "d=" + tokenData.access_token }, RelyingParty: "http://auth.xboxlive.com", TokenType: "JWT" })
    });
    const userData = await userAuth.json();
    if (!userAuth.ok || !userData.Token) return json({ error: "Xbox identity authentication failed" }, 401);

    const xstsResponse = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ Properties: { SandboxId: "RETAIL", UserTokens: [userData.Token] }, RelyingParty: "http://xboxlive.com", TokenType: "JWT" })
    });
    const xstsData = await xstsResponse.json();
    if (!xstsResponse.ok || !xstsData.Token) return json({ error: "Xbox security token exchange failed" }, 401);
    const claims = xstsData.DisplayClaims?.xui?.[0];
    const xuid = claims?.xid ?? claims?.xuid;
    const userHash = claims?.uhs;
    if (!xuid || !userHash) return json({ error: "Xbox did not return a verified XUID" }, 502);

    let gamertag = "Xbox " + xuid;
    const profileResponse = await fetch("https://profile.xboxlive.com/users/me/profile/settings?settings=Gamertag", {
      headers: { "Authorization": "XBL3.0 x=" + userHash + ";" + xstsData.Token, "X-Xbl-Contract-Version": "2" }
    });
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      gamertag = profile.profileUsers?.[0]?.settings?.find((item: { id: string }) => item.id === "Gamertag")?.value ?? gamertag;
    }

    const { error: saveError } = await admin.from("platform_connections").upsert({
      profile_id: record.profile_id, provider: "xbox", provider_user_id: String(xuid), display_name: gamertag, status: "connected"
    }, { onConflict: "profile_id,provider" });
    await admin.from("oauth_states").delete().eq("state", state);
    if (saveError) return json({ error: "Could not save verified Xbox account" }, 500);
    const redirect = Deno.env.get("RESPAWN_REDIRECT_URL") ?? "respawn://platform/xbox";
    return Response.redirect(redirect + (redirect.includes("?") ? "&" : "?") + "connected=xbox", 302);
  }
  return json({ error: "Method not allowed" }, 405);
});
