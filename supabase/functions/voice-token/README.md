# Voice room token service

Voice is not safe to implement by placing a LiveKit API secret in the app. The production flow should be:
1. User authenticates with Supabase.
2. App requests a token from a trusted Edge Function with a room ID.
3. Function verifies the user's session and room membership, applies mute/ban rules and rate limits.
4. Function signs a short-lived LiveKit JWT using server-only `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` secrets.
5. App joins the LiveKit room using the returned short-lived token and `LIVEKIT_URL`.

Set those secrets only in the Supabase function environment. A LiveKit deployment or managed project is required; the app must not fabricate room tokens or embed signing secrets.
