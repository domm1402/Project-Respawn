# Respawn roadmap

## Phase 1 - Mobile foundation
- [x] Expo / React Native project
- [x] Dark mobile-first navigation and dashboard
- [x] Game discovery and local collection
- [x] Demo mode for exploring the UI without backend credentials
- [x] Supabase secure session storage and email/password sign-up/sign-in
- [x] Automatic player profile creation
- [x] Live player profile and sign-out
- [x] Live feed with post creation
- [x] Live community creation and joining
- [x] Live guild creation and joining
- [x] Live event creation and RSVP
- [x] Direct messages with realtime updates and player search
- [x] Server-side Steam OpenID identity linking
- [x] Server-side Microsoft/Xbox identity linking flow
- [x] LiveKit voice room metadata, short-lived token function and native voice UI
- [x] Supabase migrations, starter catalogue and RLS policies
- [x] CI TypeScript check for the React Native app
- [ ] Profile editing UI and profile privacy controls
- [ ] Persistent local game library and richer catalogue management

## Phase 2 - Real social network
- [x] Account registration, sign-in and password reset foundation
- [x] Profile creation
- [x] Direct messages and realtime delivery
- [x] Community creation, membership and text-channel schema
- [x] Guild creation, membership and recruitment flag
- [x] Event creation and RSVP
- [ ] Friend request UI and management
- [ ] Community text-channel UI, roles and moderation dashboard
- [ ] Guild applications, ranks and roster management
- [ ] LFG listing UI and filters
- [ ] Push notifications and preferences
- [ ] Post comments, reactions and media uploads

## Phase 3 - Voice and connected identity
- [x] LiveKit native voice client and microphone controls
- [x] Server-issued short-lived voice tokens with membership checks
- [x] Steam OpenID server-side identity verification
- [x] Microsoft/Xbox OAuth and Xbox Live identity exchange
- [ ] Configure a LiveKit server and deploy the voice token function
- [ ] Configure Steam and Microsoft app registrations/secrets
- [ ] Test provider flows with approved developer accounts
- [ ] PlayStation linking (requires official Sony partner/API access; not available as a general consumer integration)
- [ ] Other providers: Epic, Nintendo, EA, Ubisoft, Battle.net and Riot, subject to each provider's official access

## Phase 4 - Production readiness
- [ ] Moderation dashboard, appeals and audit logs
- [ ] Rate limiting and abuse prevention
- [ ] Account export and deletion
- [ ] Privacy, terms and age-appropriate onboarding
- [ ] Accessibility and localization pass
- [ ] Load, security and authorization testing
- [ ] Android and iOS release builds and store submission

## External setup still required
The code is committed, but this repository does not create third-party accounts or secrets on your behalf. A Supabase project, Microsoft app registration, Steam callback configuration and LiveKit server are required before live services can connect. PlayStation consumer game-library access is not generally available. See [backend setup](docs/SETUP_BACKEND.md).

Respawn is designed to be free to users and not depend on paid AI. Hosting, storage, bandwidth, voice infrastructure and some provider integrations can still have operating costs or approval requirements.
