# THE CROWD operational status v0.3
Date: 2026-10-28 (Europe/Rome)

## Verified
- Independent project directory: /home/unknown/THE_CROWD_DEMO.
- Reacting animated crowd/city demo, local simulated chat, message intention and raid control.
- Real Twitch EventSub integration code: server-side OAuth validation, channel.chat.message and channel.raid subscriptions, SSE, duplicate suppression, reconnect.
- Twitch device authorization helper for user:read:chat with local credentials file mode 0600.
- Automated mocked EventSub and HTTP/SSE checks pass.\n- 60-second scenario with three Codex-authored conclusions (guardian / predator / witness).\n- Actual Codex session: 01a1818f-01b5-7591-8657-8173e60b027f.\n- Viewer names can appear anchored to individually assigned cells in the body.
- No npm runtime dependencies, source and .env are not exposed by HTTP.

## Unverified / blocked
- Actual broadcaster Twitch OAuth authorization (requires the owner to sign in to Twitch and consent). No live Twitch messages received yet.
- Browser visual/mobile verification on the actual iPhone.
- Durable public hosting. Cloudflare account workers.dev subdomain exists but Worker upload was blocked by a platform security check; leave it untouched rather than work around the check.
- Hackathon: Devpost video, genuine Twitch recording, public repository and verified Codex session for THE CROWD not completed.

## Operator instructions
npm test
npm start
Open http://127.0.0.1:3107
For real Twitch:
node twitch-login.mjs CLIENT_ID
node --env-file=.env server.mjs
Never publish or copy .env or tokens.

Decision: preserve RETCON separately; do not replace other projects or bypass administrative security constraints.
