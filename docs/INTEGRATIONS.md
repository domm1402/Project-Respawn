# Gaming platform integrations

Respawn should connect accounts through official authorization flows and documented APIs only.

| Provider | Integration approach | Notes |
|---|---|---|
| Steam | Steam OpenID for identity; Steam Web API for permitted public data | API key stays on the server. Private profiles remain private. |
| Xbox / Microsoft | Microsoft identity platform and applicable Xbox services | Requires app registration, consent and eligibility for the requested APIs. |
| PlayStation Network | Official partner/API access where available | Public consumer access is limited. Do not scrape private endpoints or request PSN passwords. |
| Epic Games | Epic account services and approved OAuth/API products | Access depends on Epic product approval and scopes. |
| Nintendo | Official services where available | Do not promise a general-purpose public game-library API. |
| EA / Ubisoft / Battle.net / Riot | Each provider's official developer or account program | Approval, scopes, regional availability and terms vary. |

## Connection flow
1. User chooses a provider inside Respawn.
2. App opens the provider's official authorization page using OAuth / OpenID as supported.
3. Provider redirects to a server-side callback.
4. Server validates state, nonce, issuer and redirect URI, exchanges the code, and stores tokens encrypted.
5. Server fetches only data permitted by the granted scopes.
6. App displays a verified connection and the data the user chose to share.
7. User can disconnect and request token revocation/deletion.

## Rules
- Never ask users to type their Xbox, PlayStation, Steam or other platform password into Respawn.
- Never scrape account pages or reverse-engineer private APIs.
- Never display friends, online status, playtime, achievements or ownership unless the provider actually supplies that data and the user has permitted it.
- Provide manual game-library entries when a provider does not expose the required data.
- Provider logos and trademarks must follow each brand's usage rules.
