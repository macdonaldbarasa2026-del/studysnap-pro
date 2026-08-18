# Role and age access security

Feature visibility is not treated as an authorization boundary by itself. The UI uses the trusted profile role + age group to select features, while Firestore rules now prevent a normal user from self-promoting to teacher/lecturer/researcher/admin/institution-owner.

New self-created profiles must start as `student`. Privileged roles are intended to be provisioned by an admin. Existing privileged profiles remain usable, while ordinary profile updates no longer include `role` in the user-editable field set.

The client also derives the effective learning mode from role + age and intentionally ignores any persisted `learning_mode` value for access decisions. This prevents a client-controlled mode field from widening access.
