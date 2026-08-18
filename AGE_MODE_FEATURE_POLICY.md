# StudySnap Age + Mode Feature Policy

## Decision

StudySnap uses **developmental age bands + trusted roles** to determine the learning experience.
The stored `learning_mode` is not used as an authorization source. Privileged access is derived from the trusted role and server-side profile.

### Age bands
- Early learner: 0–5 (`baby`)
- Child learner: 6–12 (`kid`)
- Teen learner: 13–17 (`teen`)
- Adult: 18+ (`adult`)

### Core behavior
- Children: learning-first UI, high privacy defaults, no public community/chat/calls/marketplace, and no self-elevation to staff roles.
- Teens: advanced study/revision/research tools, but social features remain restricted; live classroom access requires an institution association.
- Adults: advanced learner tools plus collaboration and optional community features.
- Teacher/lecturer: teaching analytics, classroom, curriculum/resource tools, institution workflows and research.
- Researcher: research, evidence, knowledge mapping and advanced file tools.
- Institution owner/admin: institution administration and platform controls.

## What is required vs. reasonable

- **Required/important in many deployments:** age-aware privacy handling when children are likely to use the service, appropriate age/consent mechanisms for children's data, data minimisation, and child-safety defaults. Kenya's Data Protection Act section 33 requires parental/guardian consent and age-verification/consent mechanisms for processing children's data. The ODPC's 2025 children's-data guidance reinforces this.
- **Strongly reasonable product design:** using age bands rather than exact birthdates for day-to-day feature personalization, hiding irrelevant features, supervised social/live learning for minors, and role-gating teacher/admin functions.
- **Not a legal guarantee:** this policy is a product/security baseline, not legal advice. Country-specific privacy, child-safety, education-sector and app-store requirements still need a formal compliance review before launch.
