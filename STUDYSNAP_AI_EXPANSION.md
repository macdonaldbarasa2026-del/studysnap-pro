# StudySnap AI Expansion Pass

## Goal
Make StudySnap AI a contextual intelligence layer inside StudySnap instead of a separate destination users must open for every task.

## Implemented
- Added `StudySnapAIQuickAssist` as a small, device-adaptive contextual assistant.
- The assistant is available only when the user's verified feature policy allows `studysnap-ai`.
- Teen mode now explicitly includes `studysnap-ai`; baby/kid modes remain excluded.
- The assistant uses the current view, selected note, and selected subject as context.
- Quick prompts are specialized by workspace: notes, quizzes, research, videos, documents, revision, exam simulator, teacher insights, institution portal, etc.
- The full StudySnap AI workspace remains available from the contextual assistant.
- AI responses continue to use the verified profile/age/role policy from `buildAIProfileContext`.
- The assistant does not invent profile information or treat user-controlled learning-mode text as authorization.
- The contextual UI is intentionally small so AI expansion does not reintroduce the congestion problem previously removed from StudySnap.

## Architecture

`Current StudySnap feature -> contextual AI prompt + verified profile -> StudySnap AI server -> response`

The feature stays the primary workspace. StudySnap AI supplies guidance, explanation, planning, transformation, and contextual assistance on demand.

## Validation
- UI/product audit: PASS — 96 source files scanned; 0 flagged congestion/overflow patterns.
- Source wiring audit: PASS — contextual assistant is mounted only outside the full AI/login/onboarding views and is guarded by `canUseView`.
- Full `tsc --noEmit`: NOT VERIFIED in this environment because `node_modules` is not installed; the compiler reports missing `node` and `vite/client` type definitions before source checking can complete.
- No claim is made that a production build has passed until dependencies are installed and `npm run check:product` succeeds.
