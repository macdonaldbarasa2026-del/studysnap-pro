# Chrome/Search + Cross-device Scroll + Button Pass

- Removed the browser-loaded Programmable Search script from the client.
- Replaced the fragile client-side search widget with authenticated StudySnap server-side web research.
- Added `/api/gemini/search` using grounded web research.
- Added one-scroll-owner behavior for touch/mobile layouts to prevent nested scroll traps.
- Added safe-area and small-screen navigation safeguards.
- Added semantic button variants (`ss-btn-primary`, `ss-btn-secondary`, `ss-btn-accent`, `ss-btn-selected`, `ss-btn-success`, `ss-btn-danger`).
- Updated Search UI to use the semantic button system.
- Removed external Google identity script from the main HTML shell because authentication already uses the app auth layer.
