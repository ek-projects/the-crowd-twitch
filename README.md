# THE CROWD — interactive Twitch prototype v0.3

An interactive experiment where viewers form one evolving creature in an abandoned city. The streamer avatar is simulated; messages and raids physically influence the creature.

- SIMULATED: autonomous fake viewers, local chat input, click to attract the creature, and +150 raid simulation.
- TWITCH LIVE: genuine Twitch EventSub WebSocket bridge for channel.chat.message and channel.raid. Browser credentials are never used. Read-only server-sent events forward verified messages from Twitch to the game. The synthetic chat stops automatically when Twitch connects.

## Quick start

Requires Node.js 24 or newer. On the Linux host:

    node server.mjs

Open http://127.0.0.1:3107

No third-party npm packages are required. The server exposes only the demo, /api/status and /events. Source files and secrets are inaccessible over HTTP.

## Connect Twitch

1. Register an application at https://dev.twitch.tv/console/apps and obtain its CLIENT ID. Do not disclose your client secret.
2. Run node twitch-login.mjs YOUR_CLIENT_ID on the same machine.
3. Open the Twitch verification URL displayed in the terminal, sign in and authorize read-chat. The helper waits for approval, validates your account and writes a private .env file with file mode 0600. Do not paste any token or password in ChatGPT.
4. Run node --env-file=.env server.mjs
5. Open http://127.0.0.1:3107 on the streaming computer and show the browser in OBS or equivalent. When the EventSub subscription succeeds, the display changes to TWITCH · CHAT REALE. A real Twitch message influences the creature. A real raid adds the actual viewer count when Twitch delivers the notification.

The Twitch connection requires a live authorized broadcaster account, application and internet. OAuth refresh is not yet implemented; reauthorize when the token expires. Account access and a real Twitch event are prerequisites for an end-to-end live test.

## Files

- index.html: self-contained interactive canvas demo.
- twitch.mjs: EventSub WebSocket bridge, chat/raid subscriptions, OAuth validation, bounded payloads, deduplication and reconnect.
- server.mjs: HTTP server, same-origin SSE, read-only security.
- twitch-login.mjs: OAuth device code login helper.
- tests/integration.test.mjs: mocked Twitch notifications and HTTP/SSE integration tests.
- .env.example: safe sample configuration (no secrets).

## Test

    node --test tests/*.test.mjs
    node --check server.mjs
    node --check twitch.mjs
    node --check twitch-login.mjs

Tests do not certify visual/browser behavior or a live Twitch connection. The authentic Codex gameplay session ID is recorded in CODEX_SESSION.txt. The hackathon entry was submitted on 2026-10-28. A YouTube video is linked in the Devpost entry; the repository's automated tests do not verify its content, accessibility, or live Twitch footage.

## Timed gameplay and Codex provenance

A 60-second round now resolves into one of three endings driven by trust and fear. The pure gameplay evaluation function in crowd-ending.mjs was authored with OpenAI Codex in session 01a1818f-01b5-7591-8657-8173e60b027f and is embedded in the standalone browser experience. The browser labels up to 12 distinct viewer identities alongside their cells so a spectator can see the collective creature physically incorporate them. This is a concept demonstration, not proof of full game balance.

## Current limitations

The avatar shown is generated within the demo, not an actual human streamer. Browser instances keep independent creature state; the canonical experience is intended to be displayed by one broadcaster and watched through the Twitch stream. No persistent game-room database, automatic OAuth refresh or production-scale viewer aggregation exists yet. Do not use this as a production Twitch service without further security and reliability work.

## Hackathon entry

The project description, setup instructions, testing instructions, and Codex evidence are in English. The organizer requested English captions for the linked YouTube video by 2026-11-02 14:00 PT. Video subtitle availability must be confirmed in YouTube Studio; a text document alone cannot satisfy the video's caption requirement.


The Codex x TwitchCon Hackathon submission was sent on 2026-10-28 and is visible on Devpost. See DEVPOST_SUBMISSION.md for the English submission details and tester instructions, and DEMO_VIDEO_SCRIPT.md for the planned three-minute demonstration. A submission is not evidence that the live Twitch integration was successfully tested.

## Online preview and source

- Stable simulated demo: https://ek-projects.github.io/the-crowd-twitch/
- Public source repository: https://github.com/ek-projects/the-crowd-twitch
- Devpost project (submitted 2026-10-28): https://devpost.com/software/the-crowd-the-chat-is-the-monster

The GitHub Pages site is STATIC and necessarily shows simulated viewers. It does not run the Node EventSub bridge. Run the Node server after Twitch authorization for real chat; do not claim Github Pages demonstrates Twitch integration.
