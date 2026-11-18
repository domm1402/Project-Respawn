# Deploy Respawn's own backend

Supabase has been removed from the mobile app. Respawn now has its own API source in `worker/` and its own D1 SQL schema. You control the Worker code and migrations in this repository. Cloudflare hosts the API and database; a deployed server is required for real accounts and cross-device social data.

## Deploy

1. Create a free Cloudflare account and open a terminal in this repository.
2. Run:

```bash
cd worker
npm install
npx wrangler d1 create respawn-db
```

3. Copy the database ID printed by Wrangler into `worker/wrangler.toml`, replacing `REPLACE_WITH_DATABASE_ID`.
4. Create a long random secret when prompted:

```bash
npx wrangler secret put TOKEN_SECRET
npx wrangler d1 migrations apply respawn-db --remote
npx wrangler deploy
```

5. Copy the deployed Worker URL (ending in `.workers.dev`). Add it as the Expo build variable:

```env
EXPO_PUBLIC_RESPAWN_API_URL=https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev
```

Rebuild the mobile app after setting the variable. Test the API at `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/health`.

## Migration status

The mobile app no longer imports the Supabase SDK. The Worker provides account signup/login, PBKDF2 password hashing, signed sessions, profile endpoints, game catalogue reads, player search, platform connection reads, and starter social resource endpoints. Sessions are stored with Expo SecureStore.

This is the first migration slice, not a claim that every social feature is complete. Some social operations still need authorization hardening and full endpoint coverage. Realtime subscriptions are temporarily disabled. Steam/Xbox OAuth callbacks and LiveKit token issuance are not migrated yet, so the app reports them as unavailable instead of pretending they work. Provider sign-in will use official OAuth/OpenID only.

Cloudflare D1 is a managed SQLite database. See the [official setup guide](https://developers.cloudflare.com/d1/get-started/) and [migration docs](https://developers.cloudflare.com/d1/reference/migrations/).
