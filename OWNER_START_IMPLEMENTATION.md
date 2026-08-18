# StudySnap Pro — Owner /start Implementation Pass

## Implemented

- Research Hub search now performs authenticated live web research through Gemini Google Search grounding and still searches Firestore-backed research projects.
- Research projects, collaborators, and discussion comments now use real Firestore-backed API routes instead of hardcoded discussion data.
- Study Room Game Zone no longer disables games for non-admin learners.
- Memory Match now uses real pair IDs so matching actually works.
- Game result accuracy is no longer hardcoded to 100%.
- Institution directory now exposes only verified institutions.
- Institution owners can submit a portal for strict verification with official website, official portal, official email, registration number, address, phone, and uploaded evidence.
- Institution verification documents are uploaded to Firebase Storage under the submitting owner's account.
- Institution registration remains `pending` until an administrator explicitly verifies or rejects it.
- Added server-side admin verification queue/decision endpoints.
- Added verified-institution payment configuration and payment-intent primitives. StudySnap never claims an external payment is paid without provider confirmation.
- Added official institution portal links so a verified institution can connect users to its real-world portal.
- Added `institution_owner` role.
- New profiles require a real authenticated account email, full name, and phone number; anonymous/guest accounts cannot complete the full profile.
- Added live YouTube Data API integration for Baby/Kids learning videos with strict SafeSearch, embeddable/syndicated filters, age-specific duration filters, and optional owner-approved channel allowlist.
- Added Kids Videos and Videos & Episodes views.
- Removed several hardcoded demo datasets from challenges, timeline, problem solver fallback, study twin input history, live classroom remote stream simulation, statistics cards, and server demo problem/bite endpoints.
- Removed fake avatar services from affected screens.

## Required production configuration

### YouTube
Set:

- `YOUTUBE_API_KEY`
- `YOUTUBE_REGION` (default `KE`)
- `YOUTUBE_ALLOWED_CHANNEL_IDS` — strongly recommended; comma-separated channel IDs approved by the StudySnap owner for Baby/Kids content.

Without a YouTube key, the app shows a real configuration error instead of fake videos.

### Firebase
Deploy both:

- `firestore.rules`
- `storage.rules`

The server must have Firebase Admin credentials available for the institution and research APIs.

### Institution verification
The existing admin console uses `ADMIN_PASSWORD`. Verification is intentionally explicit: a submission is never published merely because a document was uploaded.

## Important integration boundary

StudySnap cannot generically impersonate or directly transact with every school/university in the world. The implementation therefore uses verified institution-owned portal URLs and configurable payment providers. Institution-specific APIs can be connected later per institution/provider without pretending that a payment, result, admission, or enrollment succeeded when the external system has not confirmed it.

## Verification status

A TypeScript parse/type pass was run after the changes. The environment currently has no installed project dependencies, so the remaining compiler output is dominated by missing package/type declarations. The touched files no longer show new syntax errors. A full `npm install` + Vite production build should be run in a normal networked development environment before deployment.
