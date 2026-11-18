import React, { useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, StatusBar, Image, Platform
} from "react-native";
import {
  Home, Compass, Gamepad2, MessageCircle, UserRound, Search,
  Bell, Plus, ChevronRight, Users, Trophy, Zap, Flame, Radio,
  Shield, Clock3, Star, SlidersHorizontal, Play, Send, Settings,
  Link2, CircleDot, Hash, Headphones, Gamepad, Bookmark, Sparkles
} from "lucide-react-native";

type Tab = "Home" | "Discover" | "Games" | "Messages" | "Profile";

const C = {
  bg: "#090910", panel: "#12121D", panel2: "#191927", line: "#28283A",
  text: "#F5F4FF", muted: "#9291A8", purple: "#8B5CF6", purple2: "#A78BFA",
  green: "#45D483", orange: "#FF9D57", blue: "#62A9FF", pink: "#F17BC8"
};

const games = [
  { name: "Fortnite", genre: "Battle Royale", players: "2.4k online", color: "#7954D8", mark: "F" },
  { name: "Minecraft", genre: "Sandbox", players: "1.8k online", color: "#438B58", mark: "M" },
  { name: "Call of Duty", genre: "FPS", players: "986 online", color: "#9B8A58", mark: "C" },
  { name: "Rocket League", genre: "Sports", players: "742 online", color: "#397AB8", mark: "R" },
  { name: "Grand Theft Auto V", genre: "Open world", players: "1.1k online", color: "#4A9B78", mark: "V" },
  { name: "Apex Legends", genre: "Battle Royale", players: "634 online", color: "#B95B50", mark: "A" }
];

const communities = [
  { name: "Fortnite LFG", tag: "FIND A SQUAD", members: "18.2k", game: "Fortnite", color: "#7954D8" },
  { name: "Minecraft Builders", tag: "BUILD TOGETHER", members: "9.6k", game: "Minecraft", color: "#438B58" },
  { name: "The Ranked Hub", tag: "COMPETITIVE", members: "6.1k", game: "Multi-game", color: "#397AB8" }
];

const guilds = [
  { name: "Respawn Raiders", tag: "CASUAL · ALL PLATFORMS", members: "2.4k", game: "Multi-game", color: "#8B5CF6" },
  { name: "The Endgame", tag: "COMPETITIVE · EU", members: "860", game: "FPS games", color: "#397AB8" },
  { name: "Block Party", tag: "CREATIVE · FRIENDLY", members: "1.2k", game: "Minecraft", color: "#438B58" }
];

const events = [
  { name: "Friday Night Squad-Up", date: "FRI · 19:00", game: "Fortnite", host: "Respawn Raiders", spots: "8 places" },
  { name: "Community Build Night", date: "SAT · 16:00", game: "Minecraft", host: "Block Party", spots: "Open invite" },
  { name: "Ranked Climb Session", date: "SUN · 18:30", game: "Rocket League", host: "The Endgame", spots: "4 places" }
];

const feedPosts = [
  { id: "p1", author: "Nova", handle: "@nova.exe", text: "Finally hit the next rank. Who's up for a few games tonight?", game: "Fortnite", likes: 24, color: "#A78BFA" },
  { id: "p2", author: "Kai", handle: "@kaiplays", text: "Started a new survival world. Looking for builders to join the project.", game: "Minecraft", likes: 18, color: "#55B98A" },
  { id: "p3", author: "Milo", handle: "@miloFPS", text: "What game has the best soundtrack? Drop your picks below.", game: "Gaming discussion", likes: 31, color: "#E69A61" }
];

const people = [
  { name: "Nova", handle: "@nova.exe", games: "Fortnite · Rocket League", status: "Looking for players", color: "#A78BFA" },
  { name: "Kai", handle: "@kaiplays", games: "Minecraft · GTA V", status: "Online", color: "#55B98A" },
  { name: "Milo", handle: "@miloFPS", games: "Call of Duty · Apex", status: "In a match", color: "#E69A61" }
];

function Avatar({ label, color = C.purple, size = 42 }: { label: string; color?: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + "30", borderColor: color + "80", borderWidth: 1, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color, fontWeight: "900", fontSize: size * 0.34 }}>{label.slice(0, 1).toUpperCase()}</Text>
  </View>;
}

function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View style={s.sectionHead}><Text style={s.sectionTitle}>{title}</Text>{action ? <Pressable onPress={onPress}><Text style={s.link}>{action}  ›</Text></Pressable> : null}</View>;
}

function GameTile({ game, compact = false, onPress }: { game: typeof games[number]; compact?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={[s.gameTile, compact && s.gameTileCompact]}>
    <View style={[s.gameArt, { backgroundColor: game.color }]}>
      <Text style={s.gameMark}>{game.mark}</Text>
      <View style={s.artGlow} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.gameName} numberOfLines={1}>{game.name}</Text>
      <Text style={s.smallMuted}>{compact ? game.genre : game.players}</Text>
    </View>
    <ChevronRight color={C.muted} size={17} />
  </Pressable>;
}

function HomeScreen({ setTab }: { setTab: (tab: Tab) => void }) {
  return <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.greetingRow}>
      <View><Text style={s.eyebrow}>YOUR GAMING HOME</Text><Text style={s.heading}>Your lobby, <Text style={{ color: C.purple2 }}>your rules.</Text></Text></View>
      <Pressable style={s.iconButton}><Bell color={C.text} size={20} /><View style={s.notificationDot} /></Pressable>
    </View>
    <View style={s.hero}>
      <View style={s.heroOrb} />
      <Text style={s.heroEyebrow}>WELCOME TO RESPAWN</Text>
      <Text style={s.heroTitle}>Your whole{ "\n" }gaming world.</Text>
      <Text style={s.heroText}>Find your people. Build your squad. Play more together.</Text>
      <Pressable onPress={() => setTab("Discover")} style={s.primaryButton}><Text style={s.primaryButtonText}>Explore Respawn</Text><ChevronRight color="#fff" size={17} /></Pressable>
      <View style={s.heroStamp}><Gamepad2 color="#D6C8FF" size={32} /></View>
    </View>
    <View style={s.statRow}>
      <View style={s.statCard}><Text style={s.statValue}>12</Text><Text style={s.statLabel}>GAMES TO EXPLORE</Text></View>
      <View style={s.statCard}><Text style={s.statValue}>3</Text><Text style={s.statLabel}>COMMUNITIES LIVE</Text></View>
      <View style={s.statCard}><Text style={s.statValue}>24/7</Text><Text style={s.statLabel}>GAMING ENERGY</Text></View>
    </View>
    <SectionTitle title="Your gaming circle" action="Find players" onPress={() => setTab("Discover")} />
    <View style={s.panel}>
      {people.slice(0, 2).map((p, i) => <View key={p.handle} style={[s.personRow, i > 0 && s.topBorder]}>
        <Avatar label={p.name} color={p.color} />
        <View style={{ flex: 1 }}><Text style={s.personName}>{p.name}</Text><Text style={s.smallMuted}>{p.games}</Text></View>
        <View style={s.onlinePill}><View style={s.greenDot} /><Text style={s.onlineText}>{p.status === "Online" ? "ONLINE" : "LFG"}</Text></View>
      </View>)}
    </View>
    <SectionTitle title="Communities to check out" action="See all" onPress={() => setTab("Discover")} />
    {communities.slice(0, 2).map(c => <View key={c.name} style={s.communityCard}>
      <View style={[s.communityIcon, { backgroundColor: c.color + "25" }]}><Users color={c.color} size={22} /></View>
      <View style={{ flex: 1 }}><Text style={s.cardTitle}>{c.name}</Text><Text style={s.smallMuted}>{c.members} members · {c.game}</Text></View>
      <Pressable style={s.joinSmall}><Text style={s.joinSmallText}>View</Text></Pressable>
    </View>)}
    <SectionTitle title="Games people are playing" action="My games" onPress={() => setTab("Games")} />
    {games.slice(0, 3).map(g => <GameTile key={g.name} game={g} compact />)}
    <View style={{ height: 20 }} />
  </ScrollView>;
}

function DiscoverScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [joined, setJoined] = useState<string[]>([]);\n  const [joinedGuilds, setJoinedGuilds] = useState<string[]>([]);\n  const [rsvps, setRsvps] = useState<string[]>([]);\n  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const filteredGames = games.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
  const filters = ["All", "Games", "Players", "Communities", "Guilds", "Events", "Feed"];
  return <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.eyebrow}>FIND YOUR NEXT PARTY</Text><Text style={s.heading}>Discover</Text>
    <View style={s.searchBox}><Search color={C.muted} size={19} /><TextInput value={query} onChangeText={setQuery} placeholder="Search games, players, communities..." placeholderTextColor={C.muted} style={s.searchInput} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>{filters.map(f => <Pressable key={f} onPress={() => setFilter(f)} style={[s.filterChip, filter === f && s.filterChipActive]}><Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text></Pressable>)}</ScrollView>
    {(filter === "All" || filter === "Games") && <><SectionTitle title="Popular games" action="View library" /><View style={s.grid}>{filteredGames.slice(0, 4).map(g => <Pressable key={g.name} onPress={() => setQuery(g.name)} style={s.discoverGame}><View style={[s.discoverArt, { backgroundColor: g.color }]}><Text style={s.discoverMark}>{g.mark}</Text></View><Text style={s.cardTitle} numberOfLines={1}>{g.name}</Text><Text style={s.smallMuted}>{g.genre}</Text></Pressable>)}</View></>}
    {(filter === "All" || filter === "Communities") && <><SectionTitle title="Communities" action="Browse all" />{communities.filter(c => (c.name + c.game).toLowerCase().includes(query.toLowerCase())).map(c => <View key={c.name} style={s.communityCard}><View style={[s.communityIcon, { backgroundColor: c.color + "25" }]}><Shield color={c.color} size={22} /></View><View style={{ flex: 1 }}><Text style={s.cardTitle}>{c.name}</Text><Text style={s.smallMuted}>{c.tag} · {c.members} members</Text></View><Pressable onPress={() => setJoined(old => old.includes(c.name) ? old.filter(x => x !== c.name) : [...old, c.name])} style={[s.joinSmall, joined.includes(c.name) && s.joinedButton]}><Text style={s.joinSmallText}>{joined.includes(c.name) ? "Joined" : "Join"}</Text></Pressable></View>)}</>}
    {(filter === "All" || filter === "Players") && <><SectionTitle title="Players looking for teammates" />{people.filter(p => (p.name + p.games).toLowerCase().includes(query.toLowerCase())).map(p => <View key={p.handle} style={s.personCard}><Avatar label={p.name} color={p.color} size={46} /><View style={{ flex: 1 }}><Text style={s.personName}>{p.name} <Text style={s.handle}>{p.handle}</Text></Text><Text style={s.smallMuted}>{p.games}</Text><Text style={s.lfgText}>{p.status}</Text></View><Pressable style={s.iconButtonSmall}><Plus color={C.text} size={18} /></Pressable></View>)}</>}
    {(filter === "All" || filter === "Guilds") && <><SectionTitle title="Guilds recruiting" action="Explore guilds" />{guilds.filter(g => (g.name + g.game + g.tag).toLowerCase().includes(query.toLowerCase())).map(g => <View key={g.name} style={s.communityCard}><View style={[s.communityIcon, { backgroundColor: g.color + "25" }]}><Shield color={g.color} size={22} /></View><View style={{ flex: 1 }}><Text style={s.cardTitle}>{g.name}</Text><Text style={s.smallMuted}>{g.tag} · {g.members} members</Text><Text style={s.smallMuted}>{g.game}</Text></View><Pressable onPress={() => setJoinedGuilds(old => old.includes(g.name) ? old.filter(x => x !== g.name) : [...old, g.name])} style={[s.joinSmall, joinedGuilds.includes(g.name) && s.joinedButton]}><Text style={s.joinSmallText}>{joinedGuilds.includes(g.name) ? "Joined" : "Join"}</Text></Pressable></View>)}</>}
    {(filter === "All" || filter === "Events") && <><SectionTitle title="Upcoming gaming events" />{events.filter(e => (e.name + e.game + e.host).toLowerCase().includes(query.toLowerCase())).map(e => <View key={e.name} style={s.communityCard}><View style={[s.communityIcon, { backgroundColor: "#8B5CF625" }]}><Clock3 color={C.purple2} size={22} /></View><View style={{ flex: 1 }}><Text style={s.cardTitle}>{e.name}</Text><Text style={s.smallMuted}>{e.date} · {e.game}</Text><Text style={s.smallMuted}>Hosted by {e.host} · {e.spots}</Text></View><Pressable onPress={() => setRsvps(old => old.includes(e.name) ? old.filter(x => x !== e.name) : [...old, e.name])} style={[s.joinSmall, rsvps.includes(e.name) && s.joinedButton]}><Text style={s.joinSmallText}>{rsvps.includes(e.name) ? "Going" : "Join"}</Text></Pressable></View>)}</>}
    {(filter === "All" || filter === "Feed") && <><SectionTitle title="Community feed" />{feedPosts.filter(p => (p.author + p.text + p.game).toLowerCase().includes(query.toLowerCase())).map(p => <View key={p.id} style={{ backgroundColor: C.panel, borderColor: C.line, borderWidth: 1, borderRadius: 15, padding: 13, gap: 9 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}><Avatar label={p.author} color={p.color} size={36} /><View style={{ flex: 1 }}><Text style={s.personName}>{p.author} <Text style={s.handle}>{p.handle}</Text></Text><Text style={s.smallMuted}>{p.game}</Text></View><Text style={s.smallMuted}>POST</Text></View><Text style={{ color: C.text, fontSize: 12, lineHeight: 18 }}>{p.text}</Text><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={s.smallMuted}>{p.likes + (likedPosts.includes(p.id) ? 1 : 0)} likes</Text><Pressable onPress={() => setLikedPosts(old => old.includes(p.id) ? old.filter(x => x !== p.id) : [...old, p.id])} style={s.filterChip}><Text style={[s.filterText, likedPosts.includes(p.id) && s.filterTextActive]}>{likedPosts.includes(p.id) ? "♥ Liked" : "♡ Like"}</Text></Pressable></View></View>)}</>}
    <View style={s.infoNote}><Sparkles color={C.purple2} size={17} /><Text style={s.infoText}>Discover is running on sample content while the community backend is being built.</Text></View>
  </ScrollView>;
}

function GamesScreen() {
  const [saved, setSaved] = useState<string[]>(["Fortnite", "Minecraft"]);
  const [query, setQuery] = useState("");
  const shown = games.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
  return <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.eyebrow}>YOUR COLLECTION</Text><Text style={s.heading}>My games</Text>
    <View style={s.libraryHero}><Gamepad2 color={C.purple2} size={25} /><View style={{ flex: 1 }}><Text style={s.cardTitle}>Your gaming library</Text><Text style={s.smallMuted}>{saved.length} games saved to your collection</Text></View><Bookmark color={C.purple2} size={20} /></View>
    <View style={s.searchBox}><Search color={C.muted} size={19} /><TextInput value={query} onChangeText={setQuery} placeholder="Search your games..." placeholderTextColor={C.muted} style={s.searchInput} /></View>
    <SectionTitle title="Game catalogue" action="Add a game" />
    {shown.map(g => <View key={g.name} style={s.libraryRow}><GameTile game={g} compact /><Pressable onPress={() => setSaved(old => old.includes(g.name) ? old.filter(x => x !== g.name) : [...old, g.name])} style={[s.saveButton, saved.includes(g.name) && s.savedButton]}><Text style={s.saveButtonText}>{saved.includes(g.name) ? "Added" : "Add"}</Text></Pressable></View>)}
    <View style={s.infoNote}><Link2 color={C.purple2} size={17} /><Text style={s.infoText}>Account linking will be added in a later milestone. No platform passwords are requested here.</Text></View>
  </ScrollView>;
}

function MessagesScreen() {
  const [selected, setSelected] = useState("All");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const chats = [{ name: "Fortnite LFG", last: "Anyone running ranked tonight?", time: "2m", color: "#7954D8", unread: 3 }, { name: "Nova", last: "That last match was wild 😂", time: "18m", color: "#A78BFA", unread: 1 }, { name: "Minecraft Builders", last: "Shared a new world screenshot", time: "1h", color: "#438B58", unread: 0 }, { name: "Kai", last: "I'm on after dinner", time: "3h", color: "#55B98A", unread: 0 }];
  return <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.eyebrow}>YOUR PEOPLE, ONE PLACE</Text><Text style={s.heading}>Messages</Text>
    <View style={s.searchBox}><Search color={C.muted} size={19} /><TextInput placeholder="Search conversations..." placeholderTextColor={C.muted} style={s.searchInput} /></View>
    <View style={s.messageFilters}>{["All", "Unread", "Groups"].map(f => <Pressable key={f} onPress={() => setSelected(f)} style={[s.filterChip, selected === f && s.filterChipActive]}><Text style={[s.filterText, selected === f && s.filterTextActive]}>{f}</Text></Pressable>)}</View>
    {chats.filter(c => selected !== "Unread" || c.unread > 0).filter(c => selected !== "Groups" || c.name !== "Nova" && c.name !== "Kai").map(c => <Pressable key={c.name} style={s.chatRow}><Avatar label={c.name} color={c.color} size={48} /><View style={{ flex: 1 }}><View style={s.chatTitleRow}><Text style={s.personName}>{c.name}</Text><Text style={s.chatTime}>{c.time}</Text></View><Text style={s.smallMuted} numberOfLines={1}>{c.last}</Text></View>{c.unread > 0 ? <View style={s.unreadBadge}><Text style={s.unreadText}>{c.unread}</Text></View> : null}</Pressable>)}
    <View style={s.chatPreview}><Text style={s.eyebrow}>QUICK NOTE</Text><Text style={s.cardTitle}>Messaging preview</Text><Text style={s.smallMuted}>The chat list is sample content. Real-time direct messages, group chats and voice rooms need the secure backend connection.</Text><View style={s.composeRow}><TextInput value={draft} onChangeText={setDraft} placeholder="Write a local note..." placeholderTextColor={C.muted} style={s.composeInput} /><Pressable onPress={() => { if (draft.trim()) { setSent(old => [draft.trim(), ...old]); setDraft(""); } }} style={s.sendButton}><Send color="#fff" size={17} /></Pressable></View>{sent.map((m, i) => <Text key={i} style={s.sentNote}>{m}</Text>)}</View>
  </ScrollView>;
}

function ProfileScreen() {
  const [following, setFollowing] = useState(false);
  return <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.eyebrow}>YOUR PLAYER CARD</Text><Text style={s.heading}>Profile</Text>
    <View style={s.profileBanner}><View style={s.bannerOrb} /><Text style={s.bannerLabel}>RESPAWN PLAYER</Text><Avatar label="P" color={C.purple2} size={76} /><Text style={s.profileName}>Player One</Text><Text style={s.handle}>@playerone · Level 1</Text><Text style={s.profileBio}>Here for good games and better teammates.</Text><Pressable onPress={() => setFollowing(v => !v)} style={s.primaryButton}><Text style={s.primaryButtonText}>{following ? "Following yourself" : "Edit profile"}</Text><Settings color="#fff" size={16} /></Pressable></View>
    <View style={s.profileStats}><View><Text style={s.statValue}>02</Text><Text style={s.statLabel}>GAMES</Text></View><View><Text style={s.statValue}>00</Text><Text style={s.statLabel}>FRIENDS</Text></View><View><Text style={s.statValue}>00</Text><Text style={s.statLabel}>GUILDS</Text></View></View>
    <SectionTitle title="Connected platforms" action="Connect" />
    {["Xbox", "PlayStation", "Steam", "Epic Games", "Nintendo"].map((p, i) => <View key={p} style={s.platformRow}><View style={s.platformIcon}><Gamepad color={C.purple2} size={19} /></View><Text style={s.platformName}>{p}</Text><View style={s.notConnected}><CircleDot color={C.muted} size={12} /><Text style={s.notConnectedText}>Not connected</Text></View></View>)}
    <View style={s.infoNote}><Shield color={C.purple2} size={17} /><Text style={s.infoText}>Your profile is currently a local preview. Account security and verified platform connections come later.</Text></View>
  </ScrollView>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("Home");
  const [showNotifications, setShowNotifications] = useState(false);
  const nav = [
    { name: "Home" as Tab, Icon: Home },
    { name: "Discover" as Tab, Icon: Compass },
    { name: "Games" as Tab, Icon: Gamepad2 },
    { name: "Messages" as Tab, Icon: MessageCircle },
    { name: "Profile" as Tab, Icon: UserRound }
  ];
  const screen = tab === "Home" ? <HomeScreen setTab={setTab} /> : tab === "Discover" ? <DiscoverScreen /> : tab === "Games" ? <GamesScreen /> : tab === "Messages" ? <MessagesScreen /> : <ProfileScreen />;
  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="light-content" backgroundColor={C.bg} />
    <View style={s.topBar}><View style={s.brand}><View style={s.brandMark}><Zap color="#fff" size={18} fill="#fff" /></View><Text style={s.brandText}>RESPAWN</Text><Text style={s.betaTag}>BETA</Text></View><Pressable onPress={() => setShowNotifications(v => !v)} style={s.topAvatar}><Bell color={C.text} size={19} /><View style={s.notificationDot} /></Pressable></View>
    {showNotifications ? <Pressable onPress={() => setShowNotifications(false)} style={s.notificationPanel}><Text style={s.cardTitle}>You're all caught up</Text><Text style={s.smallMuted}>New friend requests, guild invites and updates will appear here.</Text></Pressable> : null}
    <View style={{ flex: 1 }}>{screen}</View>
    <View style={s.bottomNav}>{nav.map(({ name, Icon }) => <Pressable key={name} onPress={() => setTab(name)} style={s.navItem}><Icon color={tab === name ? C.purple2 : C.muted} size={21} strokeWidth={tab === name ? 2.5 : 1.8} /><Text style={[s.navLabel, tab === name && s.navLabelActive]}>{name}</Text>{tab === name ? <View style={s.navActiveDot} /> : null}</Pressable>)}</View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === "android" ? 4 : 0 },
  topBar: { height: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: C.line },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.purple, alignItems: "center", justifyContent: "center" },
  brandText: { color: C.text, fontSize: 16, fontWeight: "900", letterSpacing: 2.2 },
  betaTag: { color: C.purple2, fontSize: 9, fontWeight: "900", letterSpacing: 1, backgroundColor: "#8B5CF625", paddingHorizontal: 6, paddingVertical: 4, borderRadius: 5 },
  topAvatar: { width: 37, height: 37, borderRadius: 13, backgroundColor: C.panel2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line },
  notificationDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.orange, position: "absolute", right: 8, top: 7, borderWidth: 1, borderColor: C.panel },
  content: { paddingHorizontal: 19, paddingTop: 22, paddingBottom: 26, gap: 14 },
  greetingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  eyebrow: { color: C.muted, fontSize: 9, letterSpacing: 1.7, fontWeight: "900", marginBottom: 6 },
  heading: { color: C.text, fontSize: 27, fontWeight: "900", letterSpacing: -0.8 },
  iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.panel, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line },
  hero: { backgroundColor: "#21173A", borderRadius: 23, padding: 21, overflow: "hidden", minHeight: 220, justifyContent: "center", borderWidth: 1, borderColor: "#49356C" },
  heroOrb: { position: "absolute", width: 210, height: 210, borderRadius: 110, backgroundColor: "#8B5CF625", right: -55, top: -55 },
  heroEyebrow: { color: "#C8B5FF", fontSize: 9, letterSpacing: 2, fontWeight: "900", marginBottom: 9 },
  heroTitle: { color: "#fff", fontSize: 32, fontWeight: "900", lineHeight: 34, letterSpacing: -1 },
  heroText: { color: "#C5BBD9", fontSize: 12, marginTop: 9, maxWidth: 220, lineHeight: 18 },
  primaryButton: { backgroundColor: C.purple, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 8, marginTop: 16 },
  primaryButtonText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  heroStamp: { position: "absolute", right: 25, bottom: 31, width: 76, height: 76, borderRadius: 24, backgroundColor: "#FFFFFF12", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-9deg" }] },
  statRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, backgroundColor: C.panel, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.line },
  statValue: { color: C.text, fontSize: 20, fontWeight: "900" },
  statLabel: { color: C.muted, fontSize: 7, fontWeight: "900", letterSpacing: 0.8, marginTop: 4 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 9, marginBottom: 1 },
  sectionTitle: { color: C.text, fontSize: 15, fontWeight: "900", letterSpacing: -0.2 },
  link: { color: C.purple2, fontSize: 11, fontWeight: "800" },
  panel: { backgroundColor: C.panel, borderRadius: 16, paddingHorizontal: 13, borderWidth: 1, borderColor: C.line },
  personRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 12 },
  topBorder: { borderTopWidth: 1, borderTopColor: C.line },
  personName: { color: C.text, fontSize: 12, fontWeight: "800" },
  smallMuted: { color: C.muted, fontSize: 10, marginTop: 4 },
  onlinePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#45D48318", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20 },
  greenDot: { width: 6, height: 6, borderRadius: 4, backgroundColor: C.green },
  onlineText: { color: C.green, fontSize: 8, fontWeight: "900" },
  communityCard: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 15, padding: 12, flexDirection: "row", alignItems: "center", gap: 11 },
  communityIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: C.text, fontSize: 12, fontWeight: "800" },
  joinSmall: { backgroundColor: C.purple, borderRadius: 9, paddingHorizontal: 13, paddingVertical: 8 },
  joinSmallText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  joinedButton: { backgroundColor: "#314A3D" },
  gameTile: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, padding: 9, borderRadius: 14, flex: 1 },
  gameTileCompact: { padding: 8 },
  gameArt: { width: 48, height: 48, borderRadius: 11, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  gameMark: { color: "#fff", fontSize: 25, fontWeight: "900", textShadowColor: "#0008", textShadowRadius: 8 },
  artGlow: { position: "absolute", width: 35, height: 35, borderRadius: 20, borderWidth: 1, borderColor: "#FFFFFF30", top: -15, right: -12 },
  gameName: { color: C.text, fontSize: 11, fontWeight: "900" },
  searchBox: { height: 48, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 3 },
  searchInput: { flex: 1, color: C.text, fontSize: 11, paddingVertical: 0 },
  filterRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  filterChip: { borderRadius: 30, paddingHorizontal: 15, paddingVertical: 9, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  filterChipActive: { backgroundColor: "#8B5CF630", borderColor: C.purple },
  filterText: { color: C.muted, fontSize: 10, fontWeight: "800" },
  filterTextActive: { color: C.purple2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  discoverGame: { width: "48%", backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 15, padding: 9 },
  discoverArt: { height: 88, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 9, overflow: "hidden" },
  discoverMark: { color: "#fff", fontSize: 38, fontWeight: "900" },
  personCard: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 15, padding: 12 },
  handle: { color: C.muted, fontSize: 10, fontWeight: "500" },
  lfgText: { color: C.green, fontSize: 9, marginTop: 5, fontWeight: "800" },
  iconButtonSmall: { width: 34, height: 34, borderRadius: 11, backgroundColor: C.panel2, alignItems: "center", justifyContent: "center" },
  infoNote: { flexDirection: "row", alignItems: "flex-start", gap: 9, backgroundColor: "#8B5CF612", borderWidth: 1, borderColor: "#8B5CF638", borderRadius: 12, padding: 12, marginTop: 4 },
  infoText: { color: "#B8B3CB", fontSize: 10, lineHeight: 15, flex: 1 },
  libraryHero: { backgroundColor: "#201735", borderColor: "#49356C", borderWidth: 1, borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", gap: 12 },
  libraryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  saveButton: { borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 },
  savedButton: { backgroundColor: "#8B5CF625", borderColor: C.purple },
  saveButtonText: { color: C.text, fontSize: 9, fontWeight: "900" },
  messageFilters: { flexDirection: "row", gap: 8 },
  chatRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line },
  chatTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatTime: { color: C.muted, fontSize: 9 },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.purple, alignItems: "center", justifyContent: "center" },
  unreadText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  chatPreview: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 15, padding: 14, gap: 8, marginTop: 8 },
  composeRow: { flexDirection: "row", gap: 8, marginTop: 7 },
  composeInput: { flex: 1, backgroundColor: C.panel2, borderRadius: 10, paddingHorizontal: 12, color: C.text, fontSize: 11 },
  sendButton: { width: 40, height: 40, backgroundColor: C.purple, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  sentNote: { color: C.text, backgroundColor: C.panel2, borderRadius: 8, padding: 9, fontSize: 10 },
  profileBanner: { backgroundColor: "#201735", borderRadius: 20, borderWidth: 1, borderColor: "#49356C", alignItems: "center", padding: 20, overflow: "hidden" },
  bannerOrb: { position: "absolute", width: 220, height: 140, borderRadius: 100, backgroundColor: "#8B5CF630", top: -65 },
  bannerLabel: { color: "#C8B5FF", fontSize: 8, letterSpacing: 2, fontWeight: "900", marginBottom: 15 },
  profileName: { color: C.text, fontSize: 21, fontWeight: "900", marginTop: 9 },
  profileBio: { color: "#B9B2C9", fontSize: 10, marginTop: 7 },
  profileStats: { flexDirection: "row", justifyContent: "space-around", backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 15, padding: 14 },
  platformRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  platformIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: C.panel2, alignItems: "center", justifyContent: "center" },
  platformName: { color: C.text, fontSize: 11, fontWeight: "800", flex: 1 },
  notConnected: { flexDirection: "row", alignItems: "center", gap: 5 },
  notConnectedText: { color: C.muted, fontSize: 9 },
  bottomNav: { height: 67, backgroundColor: "#101019", borderTopWidth: 1, borderTopColor: C.line, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: Platform.OS === "ios" ? 5 : 2 },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, height: "100%" },
  navLabel: { color: C.muted, fontSize: 8, fontWeight: "700" },
  navLabelActive: { color: C.purple2, fontWeight: "900" },
  navActiveDot: { position: "absolute", bottom: 3, width: 14, height: 2, borderRadius: 2, backgroundColor: C.purple2 },
  notificationPanel: { marginHorizontal: 15, marginTop: 8, backgroundColor: C.panel2, borderColor: C.line, borderWidth: 1, borderRadius: 13, padding: 14, zIndex: 3 }
});
