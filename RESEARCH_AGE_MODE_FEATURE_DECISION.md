# Research decision: age/mode feature gating

## Required or reasonable?

### Required / high-priority compliance controls
- Child-data protection, age-aware handling, and suitable consent/age-verification mechanisms are high-priority where children are likely users.
- Kenya's Data Protection Act section 33 specifically requires parental/guardian consent plus age-verification/consent mechanisms for processing a child's data.
- ODPC guidance also emphasises that children's data processing should protect and advance the child's rights and best interests.

### Reasonable product controls
- Developmental age bands for UI complexity and learning tools.
- High-privacy defaults for minors.
- Suppressing public social, direct-contact, commerce and location-sensitive features for minors.
- Requiring institution association for supervised teen live classes.
- Separating learner features from teacher/researcher/admin features using trusted role claims.
- Using coarse age bands rather than storing exact date of birth for routine UI personalization.

### Not enough by itself
- A self-declared age selector is not an age-verification system.
- Client-side feature hiding is not authorization.
- A requested teacher/admin role is not proof of authority.

The implementation therefore uses the age/mode layer for product experience while keeping privileged access tied to trusted server-side role/profile data.
