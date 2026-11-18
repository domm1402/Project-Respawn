import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createDirectConversation, listDirectConversations, listDirectMessages, searchPlayers, sendDirectMessage, subscribeToDirectMessages } from "./api";
import VoiceRoomScreen from "./VoiceRoomScreen";

type Conversation = { id: string; title: string | null; is_group: boolean; created_at: string };
type Message = { id: string; author_id: string; body: string; created_at: string };

export default function LiveMessagingScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [players, setPlayers] = useState<Array<{id:string;username:string;display_name:string}>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const refresh = useCallback(async () => {
    try { setConversations(await listDirectConversations()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load conversations."); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!active) return;
    let alive = true;
    listDirectMessages(active.id).then(rows => { if (alive) setMessages(rows as Message[]); }).catch(e => setError(e instanceof Error ? e.message : "Could not load messages."));
    const unsubscribe = subscribeToDirectMessages(active.id, row => {
      const message = row as Message;
      setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message]);
    });
    return () => { alive = false; unsubscribe(); };
  }, [active?.id]);

  async function findPlayers() {
    setBusy(true); setError("");
    try { setPlayers(await searchPlayers(participantId) as typeof players); }
    catch (e) { setError(e instanceof Error ? e.message : "Player search failed."); }
    finally { setBusy(false); }
  }

  async function startConversation(targetId = participantId) {
    if (!participantId.trim()) return;
    setBusy(true); setError("");
    try {
      const conversation = await createDirectConversation([targetId.trim()]);
      setActive(conversation as Conversation); setParticipantId(""); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create conversation."); }
    finally { setBusy(false); }
  }

  async function send() {
    if (!active || !draft.trim()) return;
    setBusy(true); setError("");
    try {
      const message = await sendDirectMessage(active.id, draft.trim());
      setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message]);
      setDraft("");
    } catch (e) { setError(e instanceof Error ? e.message : "Message failed to send."); }
    finally { setBusy(false); }
  }

  if (voiceOpen) return <VoiceRoomScreen onBack={() => setVoiceOpen(false)} />;

  return <View style={styles.root}>
    <Text style={styles.eyebrow}>LIVE DIRECT MESSAGES</Text>
    <Text style={styles.title}>Messages</Text>
    <Pressable onPress={() => setVoiceOpen(true)} style={styles.voiceButton}><Text style={styles.voiceButtonText}>Join a voice channel</Text></Pressable>
    {!active ? <>
      <Text style={styles.sub}>Start a private conversation using the other player's Respawn profile ID.</Text>
      <View style={styles.startRow}>
        <TextInput value={participantId} onChangeText={setParticipantId} placeholder="Search username or display name" placeholderTextColor="#89879C" style={styles.input} autoCapitalize="none" />
        <Pressable onPress={findPlayers} disabled={busy || participantId.trim().length < 2} style={styles.button}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Search</Text>}</Pressable>
      </View>
      {players.map(p => <View key={p.id} style={styles.conversation}><View style={styles.avatar}><Text style={styles.avatarText}>{p.display_name.slice(0,1).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={styles.name}>{p.display_name}</Text><Text style={styles.meta}>@{p.username}</Text></View><Pressable onPress={() => startConversation(p.id)} style={styles.button}><Text style={styles.buttonText}>Message</Text></Pressable></View>)}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 8 }}>
        {conversations.map(c => <Pressable key={c.id} onPress={() => setActive(c)} style={styles.conversation}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(c.title || (c.is_group ? "Group" : "DM")).slice(0,1).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.name}>{c.title || (c.is_group ? "Group conversation" : "Direct conversation")}</Text><Text style={styles.meta}>{c.is_group ? "Group" : "Direct"} · {new Date(c.created_at).toLocaleDateString()}</Text></View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>)}
        {!conversations.length ? <Text style={styles.empty}>No conversations yet. Start one above.</Text> : null}
      </ScrollView>
    </> : <>
      <Pressable onPress={() => setActive(null)}><Text style={styles.back}>‹ All conversations</Text></Pressable>
      <Text style={styles.conversationTitle}>{active.title || (active.is_group ? "Group conversation" : "Direct conversation")}</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
        {messages.map(m => <View key={m.id} style={styles.message}><Text style={styles.body}>{m.body}</Text><Text style={styles.meta}>{new Date(m.created_at).toLocaleTimeString()}</Text></View>)}
        {!messages.length ? <Text style={styles.empty}>No messages yet. Send the first one.</Text> : null}
      </ScrollView>
      <View style={styles.startRow}><TextInput value={draft} onChangeText={setDraft} placeholder="Write a message..." placeholderTextColor="#89879C" style={styles.input} multiline /><Pressable onPress={send} disabled={busy || !draft.trim()} style={styles.button}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send</Text>}</Pressable></View>
    </>}
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090910", padding: 19, gap: 12 },
  eyebrow: { color: "#9291A8", fontSize: 9, fontWeight: "900", letterSpacing: 1.7 },
  title: { color: "#F5F4FF", fontSize: 27, fontWeight: "900" },
  sub: { color: "#9291A8", fontSize: 11, lineHeight: 16 },
  startRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: { flex: 1, minHeight: 44, maxHeight: 100, backgroundColor: "#191927", borderColor: "#343349", borderWidth: 1, borderRadius: 12, color: "#fff", paddingHorizontal: 12, paddingVertical: 10, fontSize: 12 },
  button: { minWidth: 62, backgroundColor: "#8B5CF6", borderRadius: 11, paddingHorizontal: 13, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "900", fontSize: 11 },
  conversation: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#12121D", borderColor: "#28283A", borderWidth: 1, borderRadius: 14, padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#8B5CF630", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#C8B5FF", fontWeight: "900" },
  name: { color: "#F5F4FF", fontSize: 12, fontWeight: "800" },
  meta: { color: "#9291A8", fontSize: 9, marginTop: 4 },
  arrow: { color: "#A78BFA", fontSize: 24 },
  empty: { color: "#9291A8", fontSize: 11, textAlign: "center", padding: 18 },
  back: { color: "#BDA8FF", fontSize: 11, fontWeight: "800" },
  conversationTitle: { color: "#F5F4FF", fontSize: 16, fontWeight: "900" },
  message: { alignSelf: "flex-start", maxWidth: "88%", backgroundColor: "#191927", borderColor: "#343349", borderWidth: 1, borderRadius: 13, padding: 11 },
  body: { color: "#F5F4FF", fontSize: 12, lineHeight: 17 },
  error: { color: "#FF9D8C", fontSize: 10 },
  voiceButton: { alignSelf: "flex-start", backgroundColor: "#8B5CF625", borderColor: "#8B5CF6", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  voiceButtonText: { color: "#C8B5FF", fontSize: 10, fontWeight: "900" }
});
