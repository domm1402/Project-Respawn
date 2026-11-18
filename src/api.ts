import { supabase } from "./backend";

function db() {
  if (!supabase) throw new Error("Connect a Supabase project first. See the setup guide in the repository.");
  return supabase;
}

export async function getMyProfile() {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return data;
}

export async function saveProfile(input: { username: string; display_name: string; bio?: string }) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("profiles").upsert({ id: user.id, ...input }).select().single();
  if (error) throw error;
  return data;
}

export async function listGames() {
  const { data, error } = await db().from("games").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function addGame(gameId: string, platform = "manual") {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { error } = await client.from("profile_games").upsert({ profile_id: user.id, game_id: gameId, platform });
  if (error) throw error;
}

export async function createCommunity(input: { name: string; slug: string; description?: string; visibility?: "public" | "private"; game_id?: string }) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("communities").insert({ owner_id: user.id, ...input }).select().single();
  if (error) throw error;
  return data;
}

export async function joinCommunity(communityId: string) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { error } = await client.from("community_members").insert({ community_id: communityId, profile_id: user.id, role: "member" });
  if (error) throw error;
}

export async function createGuild(input: { name: string; description?: string; game_id?: string; region?: string; recruiting?: boolean }) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("guilds").insert({ owner_id: user.id, ...input }).select().single();
  if (error) throw error;
  return data;
}

export async function createLfgPost(input: { game_id: string; platform?: string; region?: string; play_style?: string; description: string; expires_at?: string }) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("lfg_posts").insert({ author_id: user.id, ...input }).select().single();
  if (error) throw error;
  return data;
}

export async function createEvent(input: { title: string; starts_at: string; description?: string; game_id?: string; community_id?: string; guild_id?: string; capacity?: number }) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("events").insert({ host_id: user.id, ...input }).select().single();
  if (error) throw error;
  return data;
}

export async function rsvpEvent(eventId: string) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { error } = await client.from("event_attendees").upsert({ event_id: eventId, profile_id: user.id, status: "going" });
  if (error) throw error;
}

export async function createPost(body: string, communityId?: string) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("posts").insert({ author_id: user.id, body, community_id: communityId ?? null }).select().single();
  if (error) throw error;
  return data;
}

export async function listFeed() {
  const { data, error } = await db().from("posts").select("*, profiles(username, display_name, avatar_url)").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data;
}

export async function sendChannelMessage(channelId: string, body: string) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("messages").insert({ channel_id: channelId, author_id: user.id, body }).select().single();
  if (error) throw error;
  return data;
}

export function subscribeToChannel(channelId: string, onMessage: (message: unknown) => void) {
  const client = db();
  const channel = client.channel("channel:" + channelId)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "channel_id=eq." + channelId }, payload => onMessage(payload.new))
    .subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function sendFriendRequest(addresseeId: string) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { error } = await client.from("friendships").insert({ requester_id: user.id, addressee_id: addresseeId });
  if (error) throw error;
}
