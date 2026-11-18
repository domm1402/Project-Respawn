# Respawn community chat backend

The Community screen uses the public Worker routes:
- `GET /api/community/messages?channel_id=general`
- `POST /api/community/messages` with `channel_id`, `author_name`, and `body`

The chat uses the existing Cloudflare Worker and D1 database. It is not live until the Worker is deployed and the app is given its URL.

## Deploy

1. Install Wrangler and sign in to your Cloudflare account: `npm install -g wrangler` then `wrangler login`.
2. From this directory's parent (the repository root), create a D1 database named `respawn-db`: `npx wrangler d1 create respawn-db`.
3. Copy the returned database ID into `worker/wrangler.toml`, replacing `REPLACE_WITH_DATABASE_ID`.
4. Set a long random signing secret: `npx wrangler secret put TOKEN_SECRET` (the chat endpoints themselves are public; this secret is needed by the other API routes).
5. Apply the migrations: `npx wrangler d1 migrations apply respawn-db --remote --config worker/wrangler.toml`.
6. Deploy: `npx wrangler deploy --config worker/wrangler.toml`.
7. Copy the deployed Worker URL (for example, `https://respawn-api.<your-subdomain>.workers.dev`).
8. In GitHub, open Settings → Secrets and variables → Actions → Variables and add `EXPO_PUBLIC_API_URL` with that Worker URL. Then rerun the Android APK workflow.

The app polls the selected channel for new messages every seven seconds. Messages are public and shared across installs using the same deployed Worker. The current simple public chat does not require account sign-in; users choose the display name shown beside their messages. Do not put passwords or private information in public channels.
