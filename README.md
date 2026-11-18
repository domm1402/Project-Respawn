# Project Respawn

One account. Every game. Your entire gaming community.

Respawn is a mobile-first gaming social platform built with Expo and React Native. It brings game discovery, player matching, communities, guilds, events, messaging and gaming identity into one place.

## Backend

Respawn uses its own API server in `worker/`, built with Cloudflare Workers and D1. It does not use Supabase. See [docs/SETUP_BACKEND.md](docs/SETUP_BACKEND.md) to create the D1 database, deploy the Worker and configure `EXPO_PUBLIC_RESPAWN_API_URL`.

## Current implementation

- Expo SDK 54 / React Native 0.81
- Respawn-owned email/password auth and signed sessions
- Secure token storage on device
- Worker + D1 SQL schema and migrations
- Profile and game catalogue API foundations
- Social screens and data access routed through the Respawn API adapter
- LiveKit voice UI (requires a separately configured token service)
- Official provider OAuth integrations are being migrated and are not marked active until their callbacks are deployed and tested

## Run

```bash
npm install
npm run typecheck
npx expo start
```

## Principles

- Free-first, no paid AI dependency.
- Gaming platform passwords are never collected.
- Official provider authorization only.
- The Worker source and SQL schema are owned in this repository.
