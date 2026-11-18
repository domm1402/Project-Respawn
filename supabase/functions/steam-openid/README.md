# Steam sign-in (server-side only)

Steam identity uses OpenID 2.0 rather than a normal OAuth bearer-token flow. Implement the callback in a trusted server/Edge Function:
1. Generate and store a one-time state/nonce bound to the signed-in Respawn session.
2. Redirect to `https://steamcommunity.com/openid/login` with the OpenID 2.0 parameters and your exact callback URL.
3. On callback, validate the response by POSTing all returned OpenID fields to Steam with `check_authentication`.
4. Require `is_valid:true`, validate the return_to URL and state, then extract the SteamID64 from the claimed_id identifier.
5. Fetch only permitted public profile data using a server-side Steam Web API key stored as a function secret.
6. Upsert the verified provider identity into `platform_connections`. Never send the Steam API key to the app.

This folder intentionally contains deployment instructions rather than an unverified client-side shortcut. Configure an HTTPS callback and test replay/state protections before enabling it.
