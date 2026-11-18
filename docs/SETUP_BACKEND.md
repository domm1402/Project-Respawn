# Connect the live Respawn backend

The repository now contains the Supabase client, email/password authentication gate, data-access functions, realtime channel subscription helper and SQL schema. The app remains usable in demo mode until you configure a backend.

## 1. Create Supabase
Create a free Supabase project, open its SQL Editor and run `supabase/schema.sql` on a fresh database. Copy the Project URL and anon/public key from Project Settings → API.

## 2. Configure the mobile app
Copy `.env.example` to `.env` and fill in:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

These are public client values. Never add a service-role key, OAuth client secret or provider API key to the app. Restart Expo after editing environment variables.

## 3. Install dependencies
Run `npm install`, then `npx expo start`. With both variables configured, the app opens the sign-in/create-account screen. Without them it opens in local demo mode.

## 4. Seed a game catalogue
Insert your approved catalogue entries into `public.games` using the Supabase SQL Editor. The client does not invent game ownership or provider stats.

## 5. Turn on real-time messages
Enable Realtime replication for the `messages` table in Supabase. Create a community, add members, create a channel and use the helpers in `src/api.ts`. Database RLS is still the authority for access.

## 6. Voice and platform accounts
Voice needs a LiveKit deployment and a server-side token issuer. Steam identity needs a server-validated OpenID callback. Xbox/Microsoft requires an app registration and approved scopes. PlayStation does not provide a generally available consumer game-library OAuth API; do not promise automatic PSN game sync without official access. Follow `docs/INTEGRATIONS.md`.

## 7. Production checklist
Review all SQL policies, add authorization tests, add account deletion and privacy controls, moderation review tools, storage policies, rate limiting and provider disconnect/revocation before inviting public users.
