# Connect the live Respawn backend

The repository now contains the Supabase client, email/password authentication gate, data-access functions, realtime channel subscription helper and SQL schema. The app remains usable in demo mode until you configure a backend.

## 1. Create Supabase
Create a free Supabase project. This repository contains a complete initial migration plus follow-up migrations. Run `supabase link --project-ref YOUR_PROJECT_REF` and `supabase db push` to create the tables, security policies and starter game catalogue. If you are using the Supabase dashboard only, run the SQL files in the SQL Editor in this exact order: `202611180000_initial_schema.sql`, `202611180001_live_social.sql`, `202611180002_oauth_state.sql`, `202611180003_auth_profile_trigger.sql`, then `202611180004_seed_game_catalogue.sql`. Copy the Project URL and anon/public key from Project Settings → API.

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


## 8. Deploy the server functions

Install the Supabase CLI and link this repository to your project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy steam-openid --no-verify-jwt
supabase functions deploy xbox-oauth --no-verify-jwt
supabase functions deploy voice-token
``

Set function secrets in the Supabase project, never in the app:
```bash
supabase secrets set STEAM_CALLBACK_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/steam-openid
supabase secrets set XBOX_CALLBACK_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/xbox-oauth
supabase secrets set RESPAWN_REDIRECT_URL=respawn://platform
supabase secrets set MICROSOFT_CLIENT_ID=YOUR_APP_CLIENT_ID
supabase secrets set MICROSOFT_CLIENT_SECRET=YOUR_APP_CLIENT_SECRET
supabase secrets set LIVEKIT_URL=wss://YOUR_LIVEKIT_HOST
supabase secrets set LIVEKIT_API_KEY=YOUR_LIVEKIT_KEY
supabase secrets set LIVEKIT_API_SECRET=YOUR_LIVEKIT_SECRET
``

For Xbox, register a Microsoft app that supports personal Microsoft accounts and the XboxLive.signin scope. Set the exact Xbox callback URL above in the app registration. Microsoft/Xbox service eligibility and API access can vary; verify the current provider terms before release.

For Steam, set the exact Steam callback URL in the OpenID configuration and use HTTPS. The Edge Function validates the OpenID response server-side and stores only the verified SteamID64.

For voice, deploy a LiveKit server or use a LiveKit Cloud project. The Edge Function issues short-lived room tokens after checking room membership. **The app includes a LiveKit voice-room client and microphone controls. It is not available in Expo Go because WebRTC uses native code. Run `npx expo prebuild` and build with `npx eas build --platform android --profile development` after configuring the LiveKit server secrets.**

PlayStation Network linking remains blocked on official partner access. Do not use unofficial scraping or ask for a PSN password.
