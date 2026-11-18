import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AccessToken } from "npm:livekit-server-sdk";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const auth = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const { room_id } = await req.json();
  if (typeof room_id !== "string" || !/^[0-9a-f-]{36}$/i.test(room_id)) return Response.json({ error: "Invalid room ID" }, { status: 400 });
  const { data: room, error } = await supabase.from("voice_rooms").select("id").eq("id", room_id).maybeSingle();
  if (error || !room) return Response.json({ error: "You are not allowed to join this voice room" }, { status: 403 });

  const livekitUrl = Deno.env.get("LIVEKIT_URL");
  const apiKey = Deno.env.get("LIVEKIT_API_KEY");
  const apiSecret = Deno.env.get("LIVEKIT_API_SECRET");
  if (!livekitUrl || !apiKey || !apiSecret) return Response.json({ error: "Voice service is not configured" }, { status: 503 });

  const token = new AccessToken(apiKey, apiSecret, { identity: user.id, ttl: "15m" });
  token.addGrant({ roomJoin: true, room: room_id, canPublish: true, canSubscribe: true });
  return Response.json({ url: livekitUrl, token: await token.toJwt() });
});
