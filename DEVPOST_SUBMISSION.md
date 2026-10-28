# THE CROWD — Devpost submission packet (2026-10-28)

Hackathon: Codex x TwitchCon Hackathon
Project ID: 1514787
Draft submission ID: 1269212
Devpost project page: https://devpost.com/software/the-crowd-the-chat-is-the-monster
Deadline: 2026-11-02 22:00 UTC (23:00 Italy)
Status: DRAFT, not submitted.

## Known truthful form answers

- 29286 Submitter Type: Individual
- 29287 Submitter Country of Residence: Italy
- 29288 Code repository URL: BLOCKED, GitHub CLI authorization invalid and connected GitHub tool cannot create a new repository. Do not link to an unrelated repository.
- 29289 Codex session ID: 01a1818f-01b5-7591-8657-8173e60b027f.
- 29290 Technology requirement:
"We used OpenAI Codex to generate the deterministic gameplay-ending evaluator in crowd-ending.mjs and incorporated it into the 60-second browser game. The archived Codex session ID and code are included. The Twitch integration is a Node.js server bridge using Twitch EventSub WebSockets for channel.chat.message and channel.raid, with user OAuth validation and same-origin SSE events to the canvas scene. Automated tests simulate Twitch events, verify deduplication and subscriptions, and check SSE delivery. Actual-channel connectivity awaits broadcaster authorization; we do not claim live testing."
- 29291 Streamer and community usage:
"The streamer adds THE CROWD as a browser scene. Viewers type natural-language chat messages; a speaker can become a named cell in the collective creature. Protective or hostile messages alter the creature's trust, fear and final behavior. Twitch raid notifications can introduce the viewer count as new cells, visibly changing the monster. Synthetic mode allows instant exploration without an account."
- 29292 Personal skill development: participant's subjective answer REQUIRED.
- 29293 Future Codex likelihood: participant's subjective answer REQUIRED.
- 29294 Age majority: participant previously confirmed age >=18.
- 29295 Eligible jurisdiction: participant states legal residence in Italy.
- 29296 Not a sponsor employee: participant declaration REQUIRED.
- Video URL: REQUIRED. Under 3 min, hosted on public/unlisted YouTube, with actual Twitch functionality and Codex proof. NOT PROVIDED.
- Website: optional; temporary tunnels are not durable.

## Blocked actions needed for final submission
1. Authorize GitHub CLI device login or create a fresh public repo named the-crowd-twitch; do not reuse an unrelated repository. Push this project without the .env file.
2. Register a Twitch developer application at https://dev.twitch.tv/console/apps. Use the PUBLIC Client ID to launch node twitch-login.mjs CLIENT_ID. Log in and authorize on your own Twitch browser, never paste access tokens.
3. Record actual Twitch interaction, then upload a <=179-second demo to YouTube. DEMO_VIDEO_SCRIPT.md contains storyboard and narration.
4. Supply subjective survey answers and confirm employer eligibility, then submit the draft. A draft is not an entry.

Do not claim Submitted unless Devpost returns status Submitted and a real timestamp.
