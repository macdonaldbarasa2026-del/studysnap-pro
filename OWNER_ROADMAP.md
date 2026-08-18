# StudySnap Pro — Owner Roadmap

This pass treats the application as a product, not a collection of isolated screens.

## Priority gates

- P0: stability, blank-screen prevention, honest states, navigation, no dead controls.
- P1: core Home/Study/Chat/Community flows and recovery paths.
- P2: accessibility, readable language, touch targets, responsive layouts.
- P3: performance, lazy routes, smaller initial JavaScript, smooth Android behavior.
- P4: real feature plumbing: Firebase-backed realtime data, offline queueing, sync/reconnect.
- P5: security, authorization, validation, rate limits, dependency hygiene, release checks.

## Feature additions in this pass

- Smart Study Plan on Home: three actionable study steps based on the user's real local activity/stats.
- Route-level lazy loading for heavy study features to reduce the initial application bundle.
- Product audit command: `npm run audit:ui`.
- Honest fallback states for unsupported or unavailable interactions.
- Safer server defaults: HTTP hardening, unified AI rate limiting, validated classroom messages, and admin-login throttling.

## Non-negotiables

1. A visible feature must work, or clearly explain why it cannot work yet.
2. Primary mobile interaction is vertical discovery; horizontal carousels are not used for core navigation.
3. Back returns to the previous task before leaving the feature.
4. Firebase remains the source of truth for authenticated academic data.
5. No fabricated user metrics are presented as real activity.
