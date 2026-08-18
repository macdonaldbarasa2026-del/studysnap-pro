# StudySnap Pro Voice Pipeline — 2026 hardening

## What changed

- Browser capture now requests `echoCancellation`, `noiseSuppression`, and `autoGainControl`.
- The microphone track's actual settings are inspected so the UI can report `Active` vs `Limited` instead of pretending echo cancellation is guaranteed.
- `AudioWorklet` replaces the main-thread `ScriptProcessorNode` and the limited-availability `MediaStreamTrackProcessor` path.
- The worklet converts microphone audio to mono, resamples to 16 kHz, and emits 20 ms (320-sample) 16-bit PCM frames.
- Gemini Live automatic VAD remains enabled, with explicit speech padding/silence timing.
- Gemini input/output transcriptions are forwarded to the UI.
- Server-side input validation limits audio/text packet sizes.
- Client-side playback is immediately cleared on Gemini `interrupted` events.
- AI speaker output is gently ducked while the local VAD sees user speech; this is supplemental to browser AEC, not a replacement for it.
- A microphone selector and audio-quality status strip were added to the Voice Tutor settings/UI.

## Why this architecture

The browser's built-in acoustic echo cancellation is the primary defense because it can use the playback/reference signal to suppress speaker leakage. Noise suppression and automatic gain control are also requested from the capture device. The custom worklet is deliberately after `getUserMedia()` processing: it handles low-latency PCM conversion rather than trying to implement a second acoustic echo canceller in JavaScript.

Gemini Live expects raw 16-bit PCM input at 16 kHz and produces raw 16-bit PCM output at 24 kHz. Google's current Live API guidance recommends small 20–40 ms input chunks and immediate clearing of client audio buffers on interruption. The implementation uses 20 ms chunks.

## Important limitation

No browser-only implementation can guarantee zero echo on every microphone, speaker, driver, browser, or room. Headphones/headsets remain the strongest practical fallback when the device's hardware/browser AEC is weak. The UI therefore reports whether the browser actually enabled the requested capture features instead of claiming perfect cancellation.

## References

- MDN: `getUserMedia()` echo cancellation — https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings/echoCancellation
- MDN: `AudioWorklet` — https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
- Google Gemini Live API — https://ai.google.dev/gemini-api/docs/live-api
- Google Gemini Live API best practices — https://ai.google.dev/gemini-api/docs/live-api/best-practices
