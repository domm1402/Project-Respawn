import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AudioSession, LiveKitRoom, useRoomContext } from "@livekit/react-native";
import { requestVoiceToken } from "./api";

function Controls({ onLeave }: { onLeave: () => void }) {
  const room = useRoomContext();
  const [muted, setMuted] = useState(false);
  const [busy, setBusy] = useState(false);
  async function toggleMute() {
    const next = !muted;
    setBusy(true);
    try { await room.localParticipant.setMicrophoneEnabled(!next); setMuted(next); }
    finally { setBusy(false); }
  }
  return <View style={styles.controls}>
    <Text style={styles.connected}>Connected to voice room</Text>
    <Pressable onPress={toggleMute} disabled={busy} style={styles.button}><Text style={styles.buttonText}>{muted ? "Unmute microphone" : "Mute microphone"}</Text></Pressable>
    <Pressable onPress={onLeave} style={styles.leave}><Text style={styles.buttonText}>Leave voice</Text></Pressable>
  </View>;
}

export default function VoiceRoomScreen({ onBack, initialRoomId = "" }: { onBack: () => void; initialRoomId?: string }) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    void AudioSession.startAudioSession();
    return () => { void AudioSession.stopAudioSession(); };
  }, [token]);

  async function join() {
    setBusy(true); setError("");
    try {
      const result = await requestVoiceToken(roomId.trim());
      setServerUrl(result.url); setToken(result.token);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not join voice room."); }
    finally { setBusy(false); }
  }

  if (token) return <LiveKitRoom serverUrl={serverUrl} token={token} connect={true} audio={true} video={false} onDisconnected={() => setToken("")}>
    <View style={styles.root}><Text style={styles.title}>RESPAWN VOICE</Text><Text style={styles.sub}>Your microphone is live only while connected.</Text><Controls onLeave={() => { setToken(""); onBack(); }} /></View>
  </LiveKitRoom>;

  return <View style={styles.root}>
    <Pressable onPress={onBack}><Text style={styles.back}>‹ Back to messages</Text></Pressable>
    <Text style={styles.eyebrow}>REAL-TIME VOICE</Text>
    <Text style={styles.title}>Voice channels</Text>
    <Text style={styles.sub}>Enter the ID of a voice room you belong to. Respawn checks membership before issuing a short-lived audio token.</Text>
    <TextInput value={roomId} onChangeText={setRoomId} placeholder="Voice room UUID" placeholderTextColor="#89879C" autoCapitalize="none" style={styles.input} />
    <Pressable onPress={join} disabled={busy || !roomId.trim()} style={styles.button}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join voice room</Text>}</Pressable>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Text style={styles.note}>Requires a deployed LiveKit server, the Supabase voice-token function and a native development build. Expo Go does not include the required WebRTC native module.</Text>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090910", padding: 20, gap: 14, justifyContent: "center" },
  back: { color: "#BDA8FF", fontSize: 11, fontWeight: "800" },
  eyebrow: { color: "#9291A8", fontSize: 9, fontWeight: "900", letterSpacing: 1.7 },
  title: { color: "#F5F4FF", fontSize: 24, fontWeight: "900" },
  sub: { color: "#9291A8", fontSize: 11, lineHeight: 17 },
  input: { backgroundColor: "#191927", borderColor: "#343349", borderWidth: 1, borderRadius: 12, color: "#fff", padding: 14, fontSize: 12 },
  button: { backgroundColor: "#8B5CF6", borderRadius: 12, padding: 14, alignItems: "center" },
  leave: { backgroundColor: "#8A3544", borderRadius: 12, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  error: { color: "#FF9D8C", fontSize: 10 },
  note: { color: "#77758B", fontSize: 10, lineHeight: 15 },
  controls: { backgroundColor: "#12121D", borderColor: "#28283A", borderWidth: 1, borderRadius: 18, padding: 18, gap: 13 },
  connected: { color: "#45D483", fontWeight: "900", fontSize: 13, textAlign: "center", marginBottom: 8 }
});
