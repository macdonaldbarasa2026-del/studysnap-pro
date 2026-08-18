# StudySnap Chrome/Search + Scroll + Button Security Audit — 2026-08-18

## Scope
- Browser/search integration
- Mobile/tablet scroll ownership
- Button identification/accessibility
- External script surface
- Authentication and AI search route

## Changes
- Removed client-side Programmable Search Engine script loading.
- Removed the external Google identity script from the HTML shell; authentication is handled by the app auth layer.
- Added authenticated `/api/gemini/search` using server-side grounded web research.
- Kept web-search API behind the existing `/api/gemini` Firebase-auth middleware and AI profile policy/rate limiter.
- Added provider-neutral UI labels so third-party provider names are not presented as product features.
- Added semantic button variants for primary, secondary, selected, accent, success and danger actions.
- Added touch-device one-scroll-owner rules to prevent nested scroll traps.
- Added safe-area and narrow-phone navigation constraints.

## Static checks
- No `cse.google.com`, `programmablesearchengine`, or client CSE script identifiers remain in source/HTML.
- No browser-specific search engine script remains in `index.html`.
- Search endpoint is under `/api/gemini` and therefore inherits authentication, profile-policy enforcement, and rate limiting.
- Search query is trimmed and capped at 500 characters.
- Search sources are deduplicated and capped at 8 results.
- External source links use `noopener noreferrer`.
- No raw shell/browser-control feature introduced.

## Validation limitation
`npm ci --ignore-scripts --no-audit --no-fund` timed out in this environment before dependencies were installed, so a complete TypeScript/build run could not be honestly reported as passed.

## Recommended release validation
1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. Android Chrome: 320/360/390/412/480 CSS px widths; verify one document scroll.
5. Android PWA standalone: verify bottom navigation and safe-area padding.
6. iOS Safari/PWA: verify keyboard, dynamic browser chrome, and bottom inset.
7. Tablet landscape/portrait: verify no nested scroll trap.
8. Search: verify authenticated web research, source links, rate-limit behavior and provider failure message.
