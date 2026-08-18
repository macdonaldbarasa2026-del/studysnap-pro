# StudySnap Live Voice AI — Congestion & Bug Audit

Date: 2026-08-17
Scope: `src/components/VoiceTutor.tsx`, `src/App.tsx`, `server/liveVoiceHandler.ts`, `server.ts`

## Fixed bugs

1. **Conversation history loss**
   - `turnComplete` replaced the entire transcript with the current turn.
   - Fixed to append the new user/AI turns to the existing history.

2. **Authentication/microphone ordering**
   - The browser could request microphone access before verifying that a Firebase user existed.
   - Firebase authentication is now checked and the ID token acquired before microphone capture starts.

3. **Connection state race**
   - The client previously marked the WebSocket `connected` before the Live AI session was actually ready.
   - It now remains `connecting` until `session_ready` arrives and has a 12-second connection timeout.

4. **Transport cleanup**
   - Unexpected Live session failures now close the WebSocket and release the microphone/AudioWorklet path.
   - Audio contexts are closed on failed startup.
   - Mic level and speaking state reset when the session ends.

5. **Settings could imply live changes**
   - Voice and topic selection can no longer be changed while a Live session is active/connecting.

## Congestion fixes

- Root Live Voice workspace is now fixed to the device viewport (`100dvh`) instead of expanding the entire app page.
- Main content uses an internal scroll region.
- Settings is a bounded modal panel rather than a large page-expanding drawer.
- Waveform stage was reduced in height.
- Quick prompts show three by default with an explicit “more” control.
- Live Stage / Transcript controls remain accessible on small screens.
- Product-facing header now uses **StudySnap AI · Live Voice** rather than provider branding.

## Security/hardening

- Live Voice WebSocket has a 512 KB maximum payload.
- Optional `CLIENT_ORIGIN` enforcement rejects unexpected browser origins when configured.
- Audio input is rate-limited per connection to prevent excessive upstream resource use.
- Text and tool-response payloads are bounded.
- Voice-command navigation now checks StudySnap's profile feature policy before changing views, preventing the AI tool path from bypassing age/role restrictions.

## Validation

- TypeScript/TSX transpilation: **PASS — 101 files, 0 diagnostics**
- UI audit: **PASS — 97 source files, 0 findings**
- Strict functionality audit: **PASS — no blocking source-level issues**
- Full dependency-backed `tsc --noEmit` / Vite production build: **NOT VERIFIED in this extracted environment** because the project's installed dependencies are unavailable here.

## Runtime verification still recommended

Test on a real Android/iPhone and desktop browser:

1. Start Live Voice.
2. Deny microphone permission and retry.
3. Allow microphone permission.
4. Wait for a slow/failed Live API connection.
5. Speak while AI is speaking (barge-in).
6. Mute/unmute.
7. Change voice/topic before a session and verify it is disabled during a session.
8. End the session and confirm microphone permission indicator stops.
9. Re-enter Live Voice repeatedly and verify no duplicate audio streams.
10. Test with a restricted child/teen profile and verify voice navigation cannot open blocked views.
