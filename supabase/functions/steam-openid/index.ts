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
    const callback = Deno.env.get("STEAM_CALLBACK_URL");
    if (!callback) return json({ error: "STEAM_CALLBACK_URL is not configured" }, 500);
    const state = crypto.randomUUID();
    const { error: stateError } = await admin.from("oauth_states").insert({ state, profile_id: user.id, provider: "steam", expires_at: new Date(Date.now() + 10 * 60_000).toISOString() });
    if (stateError) return json({ error: "Could not start Steam connection" }, 500);
    const returnTo = callback + "?state=" + encodeURIComponent(state);
    const authUrl = new URL("https://steamcommunity.com/openid/login");
    authUrl.search = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnTo,
      "openid.realm": new URL(callback).origin + "/",
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
    }).toString();
    return json({ url: authUrl.toString() });
  }

  if (req.method === "GET") {
    const state = url.searchParams.get("state");
    const claimed = url.searchParams.get("openid.claimed_id") ?? "";
    if (!state || !claimed) return json({ error: "Invalid Steam callback" }, 400);
    const { data: record } = await admin.from("oauth_states").select("*").eq("state", state).eq("provider", "steam").gt("expires_at", new Date().toISOString()).maybeSingle();
    if (!record) return json({ error: "Expired or invalid sign-in state" }, 400);
    const verify = new URLSearchParams(url.searchParams);
    verify.set("openid.mode", "check_authentication");
    const response = await fetch("https://steamcommunity.com/openid/login", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: verify.toString() });
    const body = await response.text();
    if (!response.ok || !body.includes("is_valid:true")) return json({ error: "Steam identity verification failed" }, 401);
    const match = claimed.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
    if (!match) return json({ error: "Steam returned an invalid account identifier" }, 400);
    const steamId = match[1];
    const { error: saveError } = await admin.from("platform_connections").upsert({
      profile_id: record.profile_id, provider: "steam", provider_user_id: steamId, display_name: "Steam " + steamId, status: "connected"
    }, { onConflict: "profile_id,provider" });
    await admin.from("oauth_states").delete().eq("state", state);
    if (saveError) return json({ error: "Could not save verified Steam account" }, 500);
    const redirect = Deno.env.get("RESPAWN_REDIRECT_URL") ?? "respawn://platform/steam";
    return Response.redirect(redirect + (redirect.includes("?") ? "&" : "?") + "connected=steam", 302);
  }
  return json({ error: "Method not allowed" }, 405);
});
