import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { backendConfigured, supabase } from "./backend";

export default function AuthGate({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(!backendConfigured);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) setSession(data.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function submit() {
    if (!supabase) return;
    setBusy(true); setError("");
    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) setError("Check your email to confirm your account, then sign in.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed.");
    } finally { setBusy(false); }
  }

  if (session || demo) return <>{children}</>;

  return <SafeAreaView style={styles.safe}><View style={styles.card}>
    <Text style={styles.brand}>RESPAWN</Text>
    <Text style={styles.title}>{mode === "signin" ? "Welcome back" : "Create your player account"}</Text>
    <Text style={styles.sub}>One account. Every game. Your community.</Text>
    <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email address" placeholderTextColor="#89879C" style={styles.input} />
    <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password (at least 8 characters)" placeholderTextColor="#89879C" style={styles.input} />
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Pressable disabled={busy || !email.trim() || password.length < 8} onPress={submit} style={styles.primary}>
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{mode === "signin" ? "Sign in" : "Create account"}</Text>}
    </Pressable>
    <Pressable onPress={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}><Text style={styles.switch}>{mode === "signin" ? "New to Respawn? Create an account" : "Already have an account? Sign in"}</Text></Pressable>
    <Text style={styles.foot}>Your account is stored securely by your configured Supabase project. Respawn never asks for your gaming platform passwords.</Text>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#090910", justifyContent: "center", padding: 22 },
  card: { backgroundColor: "#12121D", borderColor: "#28283A", borderWidth: 1, borderRadius: 22, padding: 22, gap: 13 },
  brand: { color: "#A78BFA", fontSize: 13, fontWeight: "900", letterSpacing: 3 },
  title: { color: "#F5F4FF", fontSize: 25, fontWeight: "900" },
  sub: { color: "#9291A8", fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: "#191927", borderColor: "#343349", borderWidth: 1, borderRadius: 12, color: "#fff", padding: 14, fontSize: 13 },
  primary: { backgroundColor: "#8B5CF6", padding: 15, borderRadius: 12, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900" },
  switch: { color: "#BDA8FF", textAlign: "center", fontSize: 12, padding: 8 },
  error: { color: "#FF9D8C", fontSize: 11 },
  foot: { color: "#77758B", fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 8 }
});
