# StudySnap Feature Access Policy

StudySnap now centralizes feature eligibility in `src/lib/featurePolicy.ts`.

The effective mode is resolved from the stored `learning_mode` when present, otherwise from role (`teacher`, `lecturer`, `institution_owner`, `researcher`, `admin`) and then age (`baby`, `kid`, `teen`, `adult`).

The policy is enforced at two levels:

1. Navigation/menu filtering — unavailable features are not presented.
2. Route rendering/navigation — a direct route, stale history entry, or voice command cannot open a disallowed view.

Heavy feature modules are lazy-loaded so role/age gating also helps reduce the initial JavaScript payload.

## Example

`teacher + adult` gets teacher, research, workspace, institution and core learning tools; student-only competitive/social tools such as Arena, Brain League and Career Finder are excluded unless the policy is explicitly changed.

`baby` is limited to early learning, safe video learning, core navigation and basic account/settings surfaces.
