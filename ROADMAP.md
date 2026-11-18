# Respawn roadmap

## Phase 1 - Mobile foundation
- [x] Expo / React Native project
- [x] Dark mobile-first navigation and dashboard
- [x] Game discovery and local collection
- [x] Sample player and community discovery
- [x] Guild discovery with local join state
- [x] Gaming events with local RSVP state
- [x] Community feed with local likes
- [x] Architecture, safety and provider integration docs
- [x] Starter PostgreSQL schema and RLS policies
- [ ] Run CI typecheck and resolve any build issues
- [ ] Persist prototype preferences locally
- [ ] Add editable profile and settings

## Phase 2 - Real accounts and social graph
- [ ] Supabase Auth registration, sign-in and password reset
- [ ] Profile creation and privacy settings
- [ ] Friends, requests, blocks and follows
- [ ] Community creation, invites, channels, roles and moderation
- [ ] Guild creation, recruitment and applications
- [ ] Game catalogue management

## Phase 3 - Real-time community
- [ ] Direct and group messaging
- [ ] Realtime community text channels
- [ ] Push notifications and notification preferences
- [ ] LFG listings and filters
- [ ] Events, RSVP limits and reminders
- [ ] Posts, comments, reactions and media uploads

## Phase 4 - Connected gaming identity
- [ ] Steam OpenID and permitted public data
- [ ] Microsoft/Xbox identity and approved APIs
- [ ] Evaluate PlayStation, Epic, Nintendo, EA, Ubisoft, Battle.net and Riot access
- [ ] Secure server-side OAuth token storage and disconnect/revoke flow
- [ ] Verified account and data provenance indicators

## Phase 5 - Production readiness
- [ ] Voice rooms
- [ ] Moderator dashboard and appeals
- [ ] Abuse prevention, rate limits and audit logs
- [ ] Account export and deletion
- [ ] Accessibility and localization pass
- [ ] Privacy, terms and age-appropriate onboarding
- [ ] Load, security and authorization testing
- [ ] Android and iOS release builds

## Constraints
Respawn is designed to be free for users and not depend on paid AI. Hosting, storage, bandwidth, push delivery and some provider integrations can still have costs or approval requirements. Never promise universal platform integration until access is verified.
