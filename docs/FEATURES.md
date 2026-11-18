# Respawn feature map

Respawn is intended to be a free, cross-platform gaming social hub. This document separates prototype behaviour from features that require a deployed service.

## Available in the mobile prototype
- Home dashboard and primary navigation
- Searchable game catalogue and local game collection
- Discover filters for games, players, communities, guilds, events and the community feed
- Local join/leave state for sample communities and guilds
- Local event RSVP state
- Local post likes
- Sample conversation list and local notes
- Player profile and connected-platform status placeholders

Prototype data is illustrative and is not live user-generated content.

## Product modules
1. **Identity:** account registration, verified email, username, avatar, banner, bio, privacy controls and profile badges.
2. **Gaming identity:** manually curated library plus official provider connections where supported; show platform, game IDs, public stats and achievement links only when permitted.
3. **Social graph:** friend requests, follows, blocks, mute controls and presence preferences.
4. **Communities:** public/private communities, invite links, roles, moderation, text channels, announcements, pinned posts and community discovery.
5. **Guilds:** recruitment, applications, ranks, roster, scheduled sessions, guild announcements and member permissions.
6. **Messaging:** direct and group conversations, message requests, attachments, reactions, read state and reporting.
7. **Voice:** opt-in voice rooms and push-to-talk. Requires a dedicated real-time voice provider or self-hosted media infrastructure.
8. **Looking for group:** game, platform, region, language, skill range, play style, age-appropriate preferences and session duration.
9. **Events:** event pages, time-zone-aware schedules, RSVP limits, reminders and attendance.
10. **Community feed:** posts, screenshots, clips, comments, reactions, bookmarks and reporting.
11. **Game pages:** description, official links, community posts, LFG listings, guides, reviews and release information.
12. **Safety:** report/block, rate limits, moderation queue, anti-spam controls, account deletion and age-appropriate defaults.
13. **Accessibility:** dynamic text sizing, screen-reader labels, reduced motion, clear contrast and keyboard support where relevant.

## Free-first principles
- No subscription or pay-to-win features.
- Prefer open-source components and free self-hostable services.
- Do not require paid AI services.
- Avoid scraping platform accounts or asking users for platform passwords.
- Be transparent about third-party hosting, bandwidth and storage limits. A public social network still has operating costs even when the app is free.

## Suggested build order
- **Milestone 1:** reliable navigation, local persistence, editable profile, game collection, guild/event/feed interactions.
- **Milestone 2:** authentication, database, profile and community CRUD, friend requests and reporting.
- **Milestone 3:** real-time chat, notifications, LFG and event scheduling.
- **Milestone 4:** official platform OAuth integrations and permitted profile/game data.
- **Milestone 5:** voice rooms, media uploads, moderation tooling and production hardening.
