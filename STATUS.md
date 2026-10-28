# THE CROWD — operational status 2026-10-28

Current version: 0.3.1 — draft for Codex x TwitchCon Hackathon.

## Verified
- A browser Canvas 2D creature interacts with synthetic local chat messages and raid simulations. A 60-second round has three Codex-authored guardian/predator/witness outcomes.
- 6 automated tests pass, including mocked Twitch EventSub subscriptions and read-only HTTP/SSE delivery.
- Real Twitch bridge code supports channel.chat.message, channel.raid, user token validation, deduplication and reconnect.
- Local access control restricts HTTP to the demo, status and SSE; does not serve the Twitch access token or backend source files.
- Authenticated Codex thread: 01a1818f-01b5-7591-8657-8173e60b027f. It authored the ending evaluator.
- Public source repository: https://github.com/ek-projects/the-crowd-twitch
- Permanent static simulated demo built by GitHub Pages: https://ek-projects.github.io/the-crowd-twitch/ (verified HTTP 200). This does NOT host Twitch EventSub.
- Devpost draft: https://devpost.com/software/the-crowd-the-chat-is-the-monster
  Project ID 1514787; draft submission ID 1269212.
- The project is within the Oct 23–Nov 2, 2026 submission window.

## Outstanding — submission NOT complete
- No authorized Twitch developer client ID / broadcaster user token, therefore no real Twitch chat/raid has been observed.
- Required YouTube video under 3 minutes showing real Twitch operation and Codex build session is not available.
- Required Devpost self-assessment answers for skill development and Codex reuse have not been stated by the user.
- Required declaration about not being employed by hackathon sponsors has not been independently confirmed in this conversation; do not sign it without user's confirmation.
- Browser acceptance on physical iPhone remains user-side; a 200 response does not certify usability.

## Submission deadline
Nov 2, 2026, 22:00 UTC = 23:00 in Italy.

## Operator instructions
Node.js >=24.
Run npm test.
Run node server.mjs and open http://127.0.0.1:3107 for a simulated demo.
Register a Twitch developer app; use node twitch-login.mjs CLIENT_ID to obtain a token privately, then use node --env-file=.env server.mjs. Do not publish .env or share tokens.
See DEVPOST_SUBMISSION.md and DEMO_VIDEO_SCRIPT.md.

## Decisions
Keep project distinct from RETCON and all other repositories. Public Github Pages hosts only a simulated version, not a misrepresented Twitch live feed. Do not claim Devpost submission until Devpost reports status=Submitted with a timestamp.
