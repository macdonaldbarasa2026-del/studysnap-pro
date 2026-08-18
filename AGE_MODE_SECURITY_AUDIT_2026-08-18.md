# StudySnap — Age/Mode Security Audit (2026-08-18)

## Scope
- `src/lib/featurePolicy.ts`
- `src/components/ViewRenderer.tsx`
- `src/components/AgeSelector.tsx`
- `src/components/AdaptiveHome.tsx`
- `server/profilePolicy.ts`
- `server.ts`
- `firestore.rules`

## Implemented controls
1. Trusted role + age derive the effective learning mode.
2. `learning_mode` is not an authorization source.
3. Minor profiles have high-privacy defaults and no public community/chat/call/commerce surfaces.
4. Teen live classroom requires an institution association.
5. Privileged roles are requested during onboarding but the stored role remains `student` until trusted provisioning.
6. AI requests now require a stored StudySnap profile on the server boundary.
7. Minor profiles are blocked from location-grounded, video-generation, video-download and high-thinking AI endpoints.
8. The chat endpoint ignores client-supplied role for authorization context and uses the server-trusted profile.
9. Home quick actions are filtered through the same feature policy, preventing buttons that lead to blocked routes.

## Findings addressed
- Previous role-selection UI presented privileged roles to every age band. It now presents them only for adult profiles.
- Previous teen policy included public social/collaboration views. Those are now removed for minors.
- Previous home actions could present AI tools that were later route-blocked. The home now filters actions before presentation.
- Age-band labels were inconsistent with common developmental bands. UI now uses 0–5, 6–12, 13–17, 18+ while preserving the existing data enum for compatibility.

## Remaining product/compliance decision
Age bands are product controls, not proof of age. For a child-facing production launch, add an appropriate age-verification and parent/guardian consent mechanism before processing children's personal data, as required by applicable law. In Kenya, the Data Protection Act section 33 requires parental/guardian consent and age-verification/consent mechanisms for processing children's data.
