# THE CROWD — Devpost submission and English review (updated 2026-10-30)

Hackathon: Codex x TwitchCon Hackathon
Project ID: 1514787
Submission ID: 1269212
Devpost project page: https://devpost.com/software/the-crowd-the-chat-is-the-monster
Deadline: 2026-11-02 22:00 UTC (23:00 Italy)
Status: SUBMITTED on 2026-10-28 (verified from authenticated Devpost project). Organizer's English-language materials review received 2026-10-30; final eligibility is not confirmed.

## Known truthful form answers

- 29286 Submitter Type: Individual
- 29287 Submitter Country of Residence: Italy
- 29288 Code repository URL: https://github.com/ek-projects/the-crowd-twitch (PUBLIC, uploaded and verified).
- 29289 Codex session ID: 01a1818f-01b5-7591-8657-8173e60b027f.
- 29290 Technology requirement:
"We used OpenAI Codex to generate the deterministic gameplay-ending evaluator in crowd-ending.mjs and incorporated it into the 60-second browser game. The archived Codex session ID and code are included. The Twitch integration is a Node.js server bridge using Twitch EventSub WebSockets for channel.chat.message and channel.raid, with user OAuth validation and same-origin SSE events to the canvas scene. Automated tests simulate Twitch events, verify deduplication and subscriptions, and check SSE delivery. Actual-channel connectivity awaits broadcaster authorization; we do not claim live testing."
- 29291 Streamer and community usage:
"The streamer adds THE CROWD as a browser scene. Viewers type natural-language chat messages; a speaker can become a named cell in the collective creature. Protective or hostile messages alter the creature's trust, fear and final behavior. Twitch raid notifications can introduce the viewer count as new cells, visibly changing the monster. Synthetic mode allows instant exploration without an account."
- 29292–29296: Required survey/declarations are part of the submitted entry; their saved values have not been re-read by this document's updater. Do not infer or change them.
- Video URL on the project: https://youtu.be/eBjzl7KgX90. Its English captions, actual footage, length, and public playback have not been independently verified.
- Website: https://ek-projects.github.io/the-crowd-twitch/ (permanent STATIC simulated demo; does not receive Twitch chat).

## Organizer request received 2026-10-30

The organizer requested an English translation of all non-English submitted materials, English captions that can be enabled for the YouTube demonstration, and a video that shows the project operating on Twitch and how Codex was used. Deadline: 2026-11-02 at 14:00 Pacific Time (23:00 Italy).

The current Devpost project description is already in English, including its testing guidance and Codex provenance. This repository's README is also in English. The outstanding check is in the YouTube video itself: confirm playable English captions and actual Twitch/Codex demonstration; do not represent synthetic EventSub events as a verified live broadcast. If changes to the video are necessary, update the video and the hackathon submission before the deadline.

For a live Twitch test, authorize the broadcaster with https://dev.twitch.tv/console/apps and `node twitch-login.mjs CLIENT_ID`; never disclose OAuth tokens or secrets. The local simulation and mocked integration tests are reproducible without Twitch credentials.

This document records evidence and outstanding checks; it is not proof of organizer approval.
