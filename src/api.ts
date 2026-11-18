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


export async function createDirectConversation(participantIds: string[], title?: string) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data: conversation, error } = await client.from("direct_conversations")
    .insert({ created_by: user.id, title: title ?? null, is_group: participantIds.length > 1 })
    .select().single();
  if (error) throw error;
  const uniqueIds = [...new Set(participantIds)].filter(id => id !== user.id);
  if (uniqueIds.length) {
    const { error: membersError } = await client.from("direct_conversation_members")
      .insert(uniqueIds.map(profile_id => ({ conversation_id: conversation.id, profile_id })));
    if (membersError) throw membersError;
  }
  return conversation;
}

export async function listDirectMessages(conversationId: string) {
  const { data, error } = await db().from("direct_messages").select("*, profiles(username, display_name, avatar_url)")
    .eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(100);
  if (error) throw error;
  return data;
}

export async function sendDirectMessage(conversationId: string, body: string) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("direct_messages")
    .insert({ conversation_id: conversationId, author_id: user.id, body }).select().single();
  if (error) throw error;
  return data;
}

export function subscribeToDirectMessages(conversationId: string, onMessage: (message: unknown) => void) {
  const client = db();
  const channel = client.channel("direct:" + conversationId)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: "conversation_id=eq." + conversationId }, payload => onMessage(payload.new))
    .subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function requestVoiceToken(roomId: string) {
  const { data, error } = await db().functions.invoke("voice-token", { body: { room_id: roomId } });
  if (error) throw error;
  if (!data?.token || !data?.url) throw new Error("Voice service is not configured. Deploy the LiveKit token function first.");
  return data as { token: string; url: string };
}

export async function connectSteam() {
  const { data, error } = await db().functions.invoke("steam-openid", { body: { action: "begin" } });
  if (error) throw error;
  if (!data?.url) throw new Error("Steam sign-in is not deployed or configured.");
  return data.url as string;
}


export async function connectXbox() {
  const { data, error } = await db().functions.invoke("xbox-oauth", { body: { action: "begin" } });
  if (error) throw error;
  if (!data?.url) throw new Error("Xbox connection is not configured. See the backend setup guide.");
  return data.url as string;
}

export async function listPlatformConnections() {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("platform_connections")
    .select("provider, provider_user_id, display_name, status, connected_at")
    .eq("profile_id", user.id);
  if (error) throw error;
  return data;
}


export async function listDirectConversations() {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data: memberships, error: memberError } = await client.from("direct_conversation_members")
    .select("conversation_id").eq("profile_id", user.id);
  if (memberError) throw memberError;
  const ids = (memberships ?? []).map(row => row.conversation_id);
  if (!ids.length) return [];
  const { data, error } = await client.from("direct_conversations").select("*").in("id", ids).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}


export async function listGuilds() {
  const { data, error } = await db().from("guilds").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data;
}

export async function joinGuild(guildId: string) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { error } = await client.from("guild_members").insert({ guild_id: guildId, profile_id: user.id, role: "member" });
  if (error) throw error;
}

export async function listEvents() {
  const { data, error } = await db().from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at").limit(100);
  if (error) throw error;
  return data;
}

export async function listCommunities() {
  const { data, error } = await db().from("communities").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data;
}


export async function createVoiceRoom(input: { name: string; community_id?: string; guild_id?: string }) {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data, error } = await client.from("voice_rooms").insert({ ...input, created_by: user.id }).select().single();
  if (error) throw error;
  return data;
}
