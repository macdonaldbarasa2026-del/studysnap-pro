# StudySnap Frontend Button / Dormant Action Audit

## Scope

Audited the current frontend source for:
- empty/no-op click handlers
- placeholder hrefs
- actions that visually look interactive but did not mutate state
- event creation actions that ignored backend failure
- basic TypeScript/TSX source integrity

## Findings fixed

### 1. Doubt Solver — Like doubt was a no-op
`src/components/DoubtSolver.tsx`

The Like button previously executed:
`setSelectedDoubt(prev => prev ? { ...prev, replies: prev.replies } : prev)`

That produced no observable state change and made the button effectively dormant.

Fixed with dedicated `likedDoubts` state, pressed state, and accessible Like/Unlike labels.

### 2. Academic Events — Host Event could appear successful after backend failure
`src/components/AcademicEvents.tsx`

The UI previously appended the event locally regardless of the POST response.

Fixed with:
- validation for title/start time
- response status check
- publishing state
- disabled submit while saving
- failure feedback
- only adding the event locally after a successful response
- draft reset after successful creation

## Automated checks

- TS/TSX transpilation: **PASS — 96 files, 0 diagnostics**
- Empty click handlers: **0 found**
- Placeholder hrefs: **0 found**
- Former Doubt Solver no-op: **removed**

## Runtime limitation

A browser/device-level click-through test was not available in this extracted environment. The full dependency-backed build also requires the project's installed npm dependencies. These limitations are not represented as successful runtime verification.

## Remaining product-level candidates

Some actions intentionally use local state or browser APIs and should be connected to backend persistence during their respective feature renovations (for example event joins, marketplace drafts, and some share/bookmark actions). They were not falsely labeled as broken when the current source provides a visible result.
