import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createEvent, createGuild, createPost, joinCommunity, joinGuild, listCommunities, listEvents, listFeed, listGuilds, rsvpEvent } from "./api";

type Row = Record<string, any>;
const stamp = (date: string) => new Date(date).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function LiveDiscoverScreen() {
  const [section, setSection] = useState("Feed");
  const [posts, setPosts] = useState<Row[]>([]);
  const [guilds, setGuilds] = useState<Row[]>([]);
  const [events, setEvents] = useState<Row[]>([]);
  const [communities, setCommunities] = useState<Row[]>([]);
  const [postDraft, setPostDraft] = useState("");
  const [guildDraft, setGuildDraft] = useState("");
  const [eventDraft, setEventDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [p, g, e, c] = await Promise.all([listFeed(), listGuilds(), listEvents(), listCommunities()]);
      setPosts(p as Row[]); setGuilds(g as Row[]); setEvents(e as Row[]); setCommunities(c as Row[]); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load live discovery."); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await action(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "That action failed."); }
    finally { setBusy(false); }
  }

  const tabs = ["Feed", "Guilds", "Events", "Communities"];
  return <ScrollView style={styles.root} contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>LIVE FROM THE RESPAWN NETWORK</Text>
    <Text style={styles.title}>Discover</Text>
    <View style={styles.tabs}>{tabs.map(t => <Pressable key={t} onPress={() => setSection(t)} style={[styles.tab, section === t && styles.activeTab]}><Text style={[styles.tabText, section === t && styles.activeTabText]}>{t}</Text></Pressable>)}</View>

    {section === "Feed" ? <>
      <Text style={styles.label}>Share something with the community</Text>
      <TextInput value={postDraft} onChangeText={setPostDraft} placeholder="What are you playing?" placeholderTextColor="#89879C" multiline style={styles.input} />
      <Pressable disabled={busy || !postDraft.trim()} onPress={() => run(async () => { await createPost(postDraft.trim()); setPostDraft(""); })} style={styles.primary}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Publish post</Text>}</Pressable>
      {posts.map(p => <View key={p.id} style={styles.card}><Text style={styles.name}>{p.profiles?.display_name || p.profiles?.username || "Respawn player"}</Text><Text style={styles.meta}>{stamp(p.created_at)}</Text><Text style={styles.body}>{p.body}</Text></View>)}
      {!posts.length ? <Text style={styles.empty}>No live posts yet. Start the conversation.</Text> : null}
    </> : null}

    {section === "Guilds" ? <>
      <Text style={styles.label}>Create a guild</Text>
      <View style={styles.inline}><TextInput value={guildDraft} onChangeText={setGuildDraft} placeholder="Guild name" placeholderTextColor="#89879C" style={styles.inputInline} /><Pressable disabled={busy || guildDraft.trim().length < 3} onPress={() => run(async () => { await createGuild({ name: guildDraft.trim(), description: "A new Respawn guild" }); setGuildDraft(""); })} style={styles.primary}><Text style={styles.primaryText}>Create</Text></Pressable></View>
      {guilds.map(g => <View key={g.id} style={styles.card}><Text style={styles.name}>{g.name}</Text><Text style={styles.meta}>{g.region || "All regions"} · {g.recruiting ? "Recruiting" : "Closed"}</Text><Text style={styles.body}>{g.description || "No description yet."}</Text><Pressable onPress={() => run(() => joinGuild(g.id))} style={styles.secondary}><Text style={styles.secondaryText}>Join guild</Text></Pressable></View>)}
      {!guilds.length ? <Text style={styles.empty}>No guilds yet. Create the first one.</Text> : null}
    </> : null}

    {section === "Events" ? <>
      <Text style={styles.label}>Create a gaming event</Text>
      <View style={styles.inline}><TextInput value={eventDraft} onChangeText={setEventDraft} placeholder="Event title" placeholderTextColor="#89879C" style={styles.inputInline} /><Pressable disabled={busy || eventDraft.trim().length < 3} onPress={() => run(async () => { await createEvent({ title: eventDraft.trim(), starts_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), description: "Community gaming session" }); setEventDraft(""); })} style={styles.primary}><Text style={styles.primaryText}>Create</Text></Pressable></View>
      {events.map(e => <View key={e.id} style={styles.card}><Text style={styles.name}>{e.title}</Text><Text style={styles.meta}>{stamp(e.starts_at)}</Text><Text style={styles.body}>{e.description || "Community event"}</Text><Pressable onPress={() => run(() => rsvpEvent(e.id))} style={styles.secondary}><Text style={styles.secondaryText}>I'm going</Text></Pressable></View>)}
      {!events.length ? <Text style={styles.empty}>No upcoming events. Schedule one.</Text> : null}
    </> : null}

    {section === "Communities" ? <>
      {communities.map(c => <View key={c.id} style={styles.card}><Text style={styles.name}>{c.name}</Text><Text style={styles.meta}>{c.visibility} community</Text><Text style={styles.body}>{c.description || "A place for players to meet."}</Text><Pressable onPress={() => run(() => joinCommunity(c.id))} style={styles.secondary}><Text style={styles.secondaryText}>Join community</Text></Pressable></View>)}
      {!communities.length ? <Text style={styles.empty}>No communities are listed yet.</Text> : null}
    </> : null}

    {busy ? <ActivityIndicator color="#A78BFA" /> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Pressable onPress={() => run(refresh)} style={styles.refresh}><Text style={styles.refreshText}>Refresh live content</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090910" },
  content: { padding: 19, gap: 12, paddingBottom: 30 },
  eyebrow: { color: "#9291A8", fontSize: 9, fontWeight: "900", letterSpacing: 1.7 },
  title: { color: "#F5F4FF", fontSize: 27, fontWeight: "900" },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  tab: { backgroundColor: "#12121D", borderWidth: 1, borderColor: "#28283A", borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9 },
  activeTab: { backgroundColor: "#8B5CF630", borderColor: "#8B5CF6" },
  tabText: { color: "#9291A8", fontSize: 10, fontWeight: "800" },
  activeTabText: { color: "#C8B5FF" },
  label: { color: "#F5F4FF", fontSize: 12, fontWeight: "800" },
  input: { minHeight: 70, color: "#F5F4FF", backgroundColor: "#12121D", borderColor: "#28283A", borderWidth: 1, borderRadius: 12, padding: 12, textAlignVertical: "top", fontSize: 12 },
  inputInline: { flex: 1, color: "#F5F4FF", backgroundColor: "#12121D", borderColor: "#28283A", borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 12 },
  inline: { flexDirection: "row", gap: 8 },
  primary: { backgroundColor: "#8B5CF6", borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  secondary: { alignSelf: "flex-start", backgroundColor: "#8B5CF625", borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9, marginTop: 9 },
  secondaryText: { color: "#C8B5FF", fontSize: 10, fontWeight: "900" },
  card: { backgroundColor: "#12121D", borderColor: "#28283A", borderWidth: 1, borderRadius: 14, padding: 13, gap: 5 },
  name: { color: "#F5F4FF", fontSize: 13, fontWeight: "900" },
  meta: { color: "#9291A8", fontSize: 9 },
  body: { color: "#D5D2E2", fontSize: 11, lineHeight: 16, marginTop: 5 },
  empty: { color: "#9291A8", fontSize: 11, textAlign: "center", padding: 20 },
  error: { color: "#FF9D8C", fontSize: 10, lineHeight: 15 },
  refresh: { alignSelf: "center", padding: 10 },
  refreshText: { color: "#A78BFA", fontSize: 10, fontWeight: "800" }
});
