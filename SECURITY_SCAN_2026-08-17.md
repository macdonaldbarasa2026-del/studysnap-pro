# StudySnap Security Scan — 2026-08-17

## Scope

Static source review of the current StudySnap project, with emphasis on authentication, authorization, Firebase rules, realtime transports, AI/cost-bearing APIs, uploads, and the login/runtime error path.

The review followed the Codex Security standard repository-scan methodology and cross-checked the implementation against current OWASP and Firebase guidance.

## Online guidance consulted

- OWASP Authentication Cheat Sheet: generic authentication errors and secure authentication/session handling.
- OWASP Authorization Cheat Sheet: authentication does not imply authorization.
- OWASP File Upload Cheat Sheet: validate type/size and authorize uploads.
- Firebase Firestore Security Rules: use Authentication + Rules for client access control and validate ownership/fields.
- Firebase guidance: Security Rules are not filters; queries must satisfy the rules.

## Findings fixed in this pass

### HIGH — Age-based authorization could be bypassed through direct Firestore writes

**Root cause:** `users/{uid}` update rules allowed a signed-in owner to modify `age_group`. StudySnap uses age group to decide feature access and AI depth, so a client could attempt to change `kid`/`teen` to `adult` directly, bypassing the UI's rank restriction.

**Fix:** Added an `ageRank()` rule and only permit owner-driven age changes that keep the rank the same or lower. Admins can provision/repair age values. This preserves safe downgrades while preventing self-upgrade.

### MEDIUM — Profile integrity fields were client-editable

**Root cause:** the user profile update allow-list included `email` and `created_at`. These are identity/audit fields and should not be client-controlled after creation.

**Fix:** removed `email` and `created_at` from the self-update allow-list. They remain server/auth controlled.

### HIGH — Live Voice WebSocket was unauthenticated

**Root cause:** `/live-voice` accepted a connection before verifying a Firebase identity and trusted `userName` from the URL query string. An unauthenticated client could potentially consume the paid Live AI backend and influence the displayed identity/context.

**Fix:** Live Voice now requires a Firebase ID token as the first WebSocket message, verifies it server-side, derives the user name from the verified token, validates the selected voice against an allow-list, and bounds the topic. Sessions are not created before authentication.

### MEDIUM — YouTube API/AI endpoints were publicly callable

**Root cause:** learning-video search, YouTube search, research-video search, and AI playlist generation were exposed without authentication. These can consume third-party API quota and, for playlist generation, paid AI resources.

**Fix:** added Firebase `requireAuth` to those routes. Static mind-refresh content remains public because it does not invoke paid/search resources.

### MEDIUM — Gemini web-search endpoint remained in the server

**Root cause:** a stale `/api/gemini/search` endpoint remained even though the product direction had moved ordinary web search to Google Search and StudySnap AI reasoning.

**Fix:** removed the stale route and `handleSearchGrounding` import. Source scan now finds no `api/gemini/search`, `search-grounding`, or `handleSearchGrounding` references.

## Previously fixed issue confirmed

The login-time generic error was caused by missing icon imports in the Home renderer. The current source contains the corrected icon references and the full TS/TSX transpilation check reports zero diagnostics.

## Security controls observed

- Firestore default-deny fallback.
- Ownership checks on user-owned subjects, notes, activities, and flashcards.
- Server-side Firebase ID-token verification for protected Express APIs.
- Socket.IO Firebase token verification.
- Admin routes protected by a separate server-issued session token.
- Constant-time admin password comparison.
- AI API rate limiting by IP.
- Community reports require authentication and are stored server-side.
- File Studio and institution uploads have explicit client-side size/type limits; production storage rules remain important for server-side enforcement.

## Residual items to verify in deployment

1. Run Firebase Emulator tests against `firestore.rules` and `storage.rules` before production deployment.
2. Run `npm ci` and `npm run lint && npm run build` in a normal networked CI environment.
3. Configure Firebase App Check for Firestore/Storage where appropriate.
4. Add production rate limiting/quotas for YouTube and other third-party API routes beyond authentication.
5. Validate uploaded file MIME/type using server-side content inspection for high-risk document workflows; client-provided `Content-Type` is not sufficient by itself.
6. Keep third-party dependencies patched.

## Validation performed in this environment

- 101 TypeScript/TSX/server source files enumerated.
- Static security assertions: PASS.
- Stale Gemini web-search references: PASS — none remain.
- Unauthenticated costly YouTube routes: PASS — protected routes verified.
- Live Voice authentication wiring: PASS.
- Firestore age-rank authorization wiring: PASS.
- Full dependency-backed TypeScript/Vite build: NOT VERIFIED because `node_modules` is absent in this execution environment and dependency installation previously timed out.
