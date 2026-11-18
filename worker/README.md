# Respawn API

Cloudflare Worker + D1 backend for Project Respawn. See [../docs/SETUP_BACKEND.md](../docs/SETUP_BACKEND.md) for provisioning, migrations and deployment.

Required secret: `TOKEN_SECRET`. Required D1 binding: `DB`.

## Cloudflare Git deployment

Connect this repository to the existing `respawn-api` Worker with production branch `main` and root directory `worker`. Use `npx wrangler deploy` as the deploy command. A new commit on `main` triggers a Cloudflare build and deployment.
