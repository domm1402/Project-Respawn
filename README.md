# Project Respawn

**One account. Every game. Your entire gaming community.**

Respawn is a free-first gaming social platform concept built with Expo and React Native. It brings game discovery, player matching, communities, guilds, events, messaging and gaming identity into one place.

## Current prototype
- Dark, mobile-first dashboard and navigation
- Discover search and filters for games, players, communities, guilds, events and feed posts
- Local game collection
- Sample player discovery in demo mode
- Live Supabase feed, guild and community creation/joining, event scheduling and RSVP when configured
- Live direct messages with realtime updates
- Native LiveKit voice-room screen with server-issued short-lived tokens
- Server-side Steam OpenID and Microsoft/Xbox identity linking flows
- Local join/leave, event RSVP and post-like interactions
- Message list preview and local notes
- Player profile and platform connection placeholders

**Important:** The app currently uses sample/local data. It is not yet a live social network. Live authentication, profiles, direct messaging, feed, guilds, events and community data are wired to Supabase when configured. Steam and Xbox linking require provider registration and server secrets. Voice requires a LiveKit deployment and a native development build. PlayStation linking requires official partner API access and is not enabled.

## Tech
- Expo SDK 54
- React Native 0.81
- TypeScript
- Supabase-ready PostgreSQL schema with Row Level Security starter policies

## Run locally
```bash
npm install
npm run typecheck
npx expo start
```

## Backend setup
1. Create a Supabase project.
2. Review and apply [supabase/schema.sql](supabase/schema.sql) to a fresh project.
3. Copy `.env.example` to `.env` and add the project URL and anon key.
4. Implement and test server-side auth, OAuth callbacks, storage policies and moderation before exposing the app to real users.

The SQL is a starter, not a production security certification. Review every policy, add automated authorization tests, and keep OAuth tokens and service-role credentials server-side.

## Documentation
- [Feature map and milestones](docs/FEATURES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Platform integration constraints](docs/INTEGRATIONS.md)
- [Safety and moderation](docs/SAFETY.md)
- [Roadmap](ROADMAP.md)

## Product principles
- Free to use, no subscriptions or pay-to-win mechanics.
- No paid AI dependency.
- Official provider authorization only. Never collect platform passwords.
- Privacy, blocking and reporting are core requirements.


## Native voice builds

LiveKit uses native WebRTC modules and does not run in Expo Go. Build a development client after configuring the Supabase and LiveKit services:
```bash
npm install
npx expo prebuild
npx eas build --platform android --profile development
``
For an installable preview APK after setup:
```bash
npx eas build --platform android --profile preview
``
