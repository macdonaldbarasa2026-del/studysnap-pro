# StudySnap Pro — Changes (this pass)

## Environment limitation (read first)
This review ran in a sandboxed environment with no access to the npm
registry, so `npm install` / `npm run build` / `npm run lint` could not be
executed here — same limitation the project's own STRICT_AUDIT.md and
RELEASE_AUDIT.md already documented. Nothing below is a claim that a build
was run; it's the result of manually reading the source. Before shipping,
run on a machine with network access:

```
npm install
npm run lint
npm run build
npm start
```

## Real security bug found and fixed
**Admin console had no server-side authentication.** The "Admin Inspection"
panel unlocked in the browser against a hardcoded password (`123456`)
checked entirely in React state. The `/api/admin/*` Express routes
(feature-flag toggles, app registry add/delete, "optimize" presets, shell
command bridge) had **zero server-side check** — anyone who knew or guessed
the routes could call them directly with `curl`/`fetch`, bypassing the UI
lock completely.

Fixed:
- Added `POST /api/admin/auth` on the server, which checks the password
  against a new `ADMIN_PASSWORD` environment variable (constant-time
  compare) and issues a random session token.
- Added `requireAdmin` middleware in front of every other `/api/admin/*`
  route, so a valid, non-expired token is required server-side.
- If `ADMIN_PASSWORD` isn't set, the admin console is disabled server-side
  by default (fails closed, not open).
- Updated `AdminInspection.tsx` to authenticate against the real endpoint
  and attach the token to every admin request instead of trusting a
  client-only check.
- `.env.example` now documents `ADMIN_PASSWORD` and `CLIENT_ORIGIN` (the
  latter was already used by the Socket.IO CORS config but was undocumented).

**You must set a strong `ADMIN_PASSWORD` in your deployment environment**
for the admin console to work — there is no default password anymore.

## Second issue found and fixed
**No rate limiting on any `/api/gemini/*` route**, despite FIXES_APPLIED.md
claiming this had already been added — it wasn't present in the actual
code. Every AI call (OCR, TTS, chat, video generation, etc.) costs money per
request and had no cap. Added a simple in-memory per-IP sliding-window
limiter (30 requests/minute per IP) in front of all `/api/gemini/*` routes.
This is a basic first line of defense — for real production traffic,
consider a proper store-backed rate limiter (Redis) since this one resets
if the server restarts and doesn't share state across multiple instances.

## What I did NOT change
This is a large codebase (~90 TSX/TS files). I focused this pass on
verifying and fixing exploitable server-side gaps rather than re-touching
UI/UX, which prior passes already reworked. I did not re-verify every claim
in STRICT_AUDIT.md / FIXES_APPLIED.md line by line — only the two above,
which I could check without a build. Treat older claims (e.g. "0 TypeScript
errors") as unverified until you run `npm run lint` yourself with network
access.

## Recommended next steps, in priority order
1. Run `npm install && npm run lint && npm run build` on a networked
   machine (or in Claude Code, which has network access) and send me the
   actual error output — I can fix real compiler errors far more reliably
   than guessing at them.
2. Set `ADMIN_PASSWORD` and `CLIENT_ORIGIN` before deploying.
3. Review `firestore.rules` against real auth flows (guest/Google/Apple) —
   I read them but didn't have a live Firebase project to test writes/reads
   against.
4. Swap the in-memory rate limiter/admin sessions for something that
   survives a server restart if you're deploying more than one instance.
