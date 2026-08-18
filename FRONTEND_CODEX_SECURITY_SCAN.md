# StudySnap Frontend Security/Bug Scan — 2026-08-17

## Scope

Frontend-focused static audit of `src/`, with supporting review of the server API contracts and Firebase auth boundary. The audit follows the Codex Security standard-scan methodology and cross-checks frontend controls against OWASP DOM/XSS guidance and Firebase security guidance.

## Verified findings and fixes

### F-01 — Google Workspace OAuth access token persisted in localStorage
- Severity: High
- Area: `src/lib/googleAuth.ts`
- Problem: a Google OAuth bearer token was persisted in `localStorage`, making it available to any JavaScript executing in the origin and unnecessarily surviving reloads.
- Fix: token is now memory-only. Workspace must reconnect after a page reload. Logout clears the in-memory token.

### F-02 — Workspace auth state could race on first render
- Severity: Medium
- Area: `src/lib/googleAuth.ts`, `src/components/WorkspaceSyncView.tsx`
- Problem: Firebase authentication and Google Workspace OAuth were treated as the same state. `onAuthStateChanged` could fire before the cached Google token was available, producing a false `needsAuth` state.
- Fix: Workspace connection now succeeds only when an actual in-memory Google access token exists; the client no longer resurrects tokens from browser storage.

### F-03 — AI/research URLs were used as navigation sinks without protocol validation
- Severity: Medium
- Areas: `ResearchHub.tsx`, `ResearchView.tsx`, `GeminiMultimodalStudio.tsx`, `InstitutionPortal.tsx`
- Problem: URLs originating from research/AI/institution data were placed directly into `href` attributes. A malicious or malformed URL could introduce a dangerous scheme such as `javascript:`.
- Fix: added `src/lib/safe_url.ts`; external destinations now accept only `http:` or `https:` and use `noopener noreferrer` for new tabs.

## Dormant/broken frontend API contracts discovered

The frontend references several `/api/*` endpoints that are not registered in the current `server.ts`/`server/*.ts` source snapshot. These are product-functionality defects that should be resolved before calling those features production-ready:

- `/api/coach/plan/*`
- `/api/coach/insights/*`
- `/api/coach/stats/*`
- `/api/coach/logs/*`
- `/api/notifications/*`
- `/api/events`
- `/api/profile`
- `/api/skill-passport/*`
- `/api/achievements/*`
- `/api/portfolio/*`
- `/api/institutions*`
- `/api/institution/report/*`
- `/api/reputation/leaderboard`
- `/api/league/*`
- `/api/teacher/insights/*`
- `/api/research*`

These were not silently replaced with fake responses. They are recorded as integration debt because implementing them correctly requires deciding the authoritative persistence model and server authorization for each feature.

## Automated checks

- TS/TSX transpilation: **PASS — 96 files, 0 diagnostics**
- Product/UI audit: **PASS — 97 source files, 0 flagged pattern occurrences**
- Strict functionality audit: **PASS — no blocking source-level issues**
- Dangerous frontend sinks (`dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, etc.): **none found**
- Google Workspace bearer token in browser storage: **removed**
- Dynamic research/institution URL sinks: **protocol-validated**

## Build limitation

`npm run lint` could not complete because this extracted environment does not contain the installed `@types/node` and `vite/client` type packages. This is an environment/dependency limitation, not a clean TypeScript build result.

## Guidance cross-check

- OWASP recommends treating untrusted data as displayable data and avoiding dangerous DOM/URL sinks.
- OWASP recommends server-side authorization rather than relying on frontend feature hiding.
- Firebase recommends Firebase Authentication + Firestore Security Rules for web/mobile access control and emulator testing for rules.
