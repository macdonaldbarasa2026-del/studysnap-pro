# StudySnap Security + Product Quality Pass — 2026-08-18

## Scope

Repository-wide static pass focused on the requested professional UI renovation, navigation/layout reliability, authentication boundaries, broken/mock/demo runtime surfaces, and error behavior.

## Codex Security-oriented checks

- Parsed 104 TypeScript/TSX/server files with the TypeScript compiler parser: **PASS — 0 parse errors**.
- Existing UI audit (`scripts/audit-ui.mjs`): **PASS — 99 source files, 0 flagged patterns**.
- Client/server source scan for embedded API keys/private-key material: **PASS — no hardcoded secret markers found**.
- Runtime scan for `mock`, `demo mode`, `fake data`, TODO/FIXME, `coming soon`, and `not implemented`: **PASS — no remaining runtime markers in `src`/`server`**.
- AI API authentication boundary: **PASS** — `/api/gemini/*` is behind `requireAuth` before the rate limiter.
- Admin boundary: **PASS** — `/api/admin/*` is protected by the server-issued admin session middleware after `/api/admin/auth`.
- Institution API: **PASS** — directory, lookup, and registration routes require Firebase authentication.
- Socket.IO authentication: **PASS** — Firebase ID token is verified before realtime connection use.
- Live Voice WebSocket authentication: **PASS** — session creation remains gated by Firebase token verification in the handler.

## Findings fixed in this pass

### HIGH — Campus portal called a missing API and used fabricated campus locations

The Campus portal requested `/api/institutions/:id`, but the server had no matching normal-user route. It also contained hard-coded campus markers and Boston coordinates that were not sourced from an institution record.

**Fix:** added authenticated institution directory/lookup/registration APIs, switched the client to `authedFetch`, removed fabricated map coordinates, and show a clear configuration state until verified campus coordinates exist.

### MEDIUM — Institution directory enumeration was unauthenticated on the client path

The institution portal fetched `/api/institutions` without the authenticated fetch helper.

**Fix:** server route requires Firebase authentication and the client now uses `authedFetch`.

### MEDIUM — Admin diagnostic UI could report simulated success when the server was unavailable

Several admin actions had local fallback mutations, including generated memory values and fake shell-success messages. This could make an operator believe a change occurred when it did not.

**Fix:** failed control-plane operations now surface an error and preserve the last confirmed server state. Unknown diagnostic shell commands are rejected rather than reported as successfully dispatched. Fake memory optimization values were removed.

### MEDIUM — Admin telemetry contained fabricated hardware/application claims

The previous control-plane state advertised C++ SIMD, HD autofocus, GPU acceleration, and pre-populated fictional apps as active runtime capabilities.

**Fix:** telemetry now starts from measured runtime values and conservative capability flags; the app registry starts empty rather than presenting fictional installed modules.

### LOW — Command palette styling was inconsistent with the product UI

The command palette used terminal-like black/orange styling and command syntax that conflicted with the rest of the product.

**Fix:** redesigned it as a neutral, accessible AI-workspace palette with familiar search behavior and `Ctrl/Cmd + K` activation.

## Product/UI changes

- Persistent responsive navigation now remains available across authenticated views instead of only five routes.
- Desktop receives a persistent sidebar, tablet a compact rail, and phones a bottom navigation bar.
- Added a professional workspace top bar with breadcrumb, global search/command access, online/offline status, and account shortcut.
- Light theme moved toward a neutral AI-product workspace aesthetic; dark theme moved toward a balanced charcoal surface system while retaining StudySnap blue branding.
- Layout spacing and navigation behavior remain safe-area and dynamic-viewport aware.
- Removed false demo/mock runtime labels and fabricated campus/admin activity.

## Validation limitations

A full dependency-backed `npm run lint` / Vite production build could not be completed in this environment because `npm ci --ignore-scripts` timed out and the repository has no usable `node_modules` installation afterward. TypeScript source parsing and the repository's static UI audit both pass.

Before production release, run in networked CI:

```text
npm ci
npm run lint
npm run build
npm run audit:ui
```

Then run Firebase Emulator tests for `firestore.rules` and `storage.rules`, plus authenticated integration tests for `/api/institutions`, `/api/gemini/*`, `/api/admin/*`, Socket.IO, and Live Voice.

## Identity expansion — 2026-08-18
- Added Firebase-backed phone SMS verification UI with country selection and reCAPTCHA.
- Added Google, Apple, Microsoft and GitHub provider flows using Firebase Auth provider objects.
- Provider failures are surfaced honestly; no local success fallback is used for OAuth providers.
- Phone verification uses a 6-digit OTP and does not persist raw phone data in browser storage.
- Firebase provider enablement remains an operator configuration requirement; UI does not pretend a disabled provider is active.
