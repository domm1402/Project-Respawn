# Respawn architecture

## Current client
- Expo SDK 54
- React Native 0.81
- TypeScript
- lucide-react-native icons
- Android-first mobile layout with iOS compatibility in mind

## Target architecture
- **Mobile:** Expo / React Native client.
- **Identity and database:** Respawn Worker API + Cloudflare D1 database with server-side authorization.
- **Realtime:** Worker-backed polling initially; add authenticated realtime transport when the messaging service is ready; evaluate scale and message retention before production.
- **Media:** private object storage buckets with signed URLs, upload limits and moderation.
- **Server-side integrations:** Respawn Worker API for OAuth exchanges, provider API calls, webhook validation and notification fan-out.
- **Builds:** GitHub Actions for type checks; EAS Build for Android/iOS binaries when configured with the required Expo account and credentials.

## Security boundaries
- Never put service-role keys, OAuth client secrets, signing keys or provider refresh tokens in the mobile bundle.
- Keep provider access tokens encrypted server-side. The client receives only connection status and safe public profile data.
- Enforce authorization in database policies and server endpoints, not only in UI conditions.
- Treat all user-generated text, links, images and uploaded files as untrusted.
- Add rate limits, spam detection, block/report flows and moderator audit logs before opening public signups.
- Do not claim an account is connected until the provider OAuth flow completes and the server verifies it.

## Local development
1. Install Node.js LTS.
2. Run `npm install`.
3. Run `npm run typecheck`.
4. Run `npx expo start` and open the project in Expo Go or a development build.

See `.env.example` for client-safe configuration placeholders. Never commit real secrets.
