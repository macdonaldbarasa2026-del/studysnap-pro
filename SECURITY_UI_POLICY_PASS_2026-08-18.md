# StudySnap Security / UI Policy Pass — 2026-08-18

## Completed

### Institution registration and admin review
- Institution registration is now server-authorized for `admin` and `institution_owner` roles only.
- Verification documents are constrained to the authenticated user's `institution-verification/<uid>/` storage namespace.
- Server validates allowed verification MIME types.
- Admin verification now creates/merges the public institution record correctly instead of assuming the document already exists.
- Added an Admin Console Institution Verification queue with explicit Verify & Publish / Reject actions.
- Added `technical_college` as a first-class institution type.

### Institution / campus terminology
- User-facing Campus Mode is now **Institution Hub**.
- Institution Network copy now covers universities, colleges, technical colleges/TVET and research/training institutions.
- Campus Map is now **Locations** and collaboration is **Community**.
- Navigation label is **Institutions & Campuses**.

### Live Voice UX
- Provider-specific voice names are presented as StudySnap voice personas: Clear, Bright, Calm, Warm, Direct, Expressive.
- Header renamed to **StudySnap Live Tutor**.
- Added a privacy/session-status indicator.
- Added a focused Live Learning Workspace introduction.
- Kept audio-quality status indicators for echo protection, noise reduction, microphone level and conversation state.
- Provider branding was removed from user-facing voice copy while retaining the underlying service implementation.

### Provider-neutral UI
- Removed provider branding from the visible multimodal AI workspace and replaced it with StudySnap AI / StudySnap model terminology.
- Removed provider branding from Study Workspace UI copy where it was only a product label; real authentication/integration URLs remain unchanged.

### Admin safety
- Removed the browser-facing raw shell-command UI and endpoint usage.
- Added read-only admin diagnostics instead.
- Added `Permissions-Policy` for camera, microphone, geolocation and payment capabilities.
- Existing Firebase authentication and AI route rate limiting remain enabled.

## Validation
- Existing StudySnap UI audit: **99 source files, 0 flagged patterns**.
- Strict functionality audit: **PASS, no blocking source-level issues**.
- Provider-branding UI scan: **PASS** for Gemini/ChatGPT/Claude/Copilot/Perplexity strings in scanned UI components.
- Browser shell-command usage scan: **PASS** — no `/api/admin/shell-cmd` usage remains.
- Institution policy scan confirms server-side role enforcement, document namespace validation, verification record creation, and security headers.

## Environment limitation
A full TypeScript build could not be executed in this offline environment because the project dependency tree is not installed; the available `tsc` invocation reports missing `node` and `vite/client` type definitions. A networked CI/deployment environment should run `npm ci`, `npm run lint`, and `npm run build` before release.

## Provider implementation note
Provider-specific identifiers remain in internal service modules and API routes because those are implementation details, not user-facing branding. They should not be removed unless the underlying provider is also being replaced.
