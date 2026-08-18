# Security Review — Renovation Pass 2

This is a source-level security review, not a penetration test.

## Reviewed
- Firestore rules: default deny; owner checks on user/subject/note/activity/flashcard data; admin access gated by membership in `admins`.
- Client secret scan: no obvious API keys, service-account private keys, or `sk-` secrets found in `src/` or `server/` source files.
- XSS scan: no `dangerouslySetInnerHTML`, `eval`, or `new Function` found in `src/` or `server/`.
- UI inputs: existing React controlled-input patterns are preserved.
- Navigation: centralized back-stack behavior is preserved.

## Production checks still required
- Run `npm ci` and `npm audit` in CI.
- Deploy and validate Firestore rules against the intended production schema.
- Validate HTTPS, security headers/CSP, and server-side auth middleware in the deployment environment.
- Run authenticated E2E tests and a dynamic security scan against a staging build.
