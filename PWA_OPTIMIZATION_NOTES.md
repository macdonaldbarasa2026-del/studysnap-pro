# StudySnap PWA Optimization

Updated the project with:

- Automatic install popup when the browser exposes `beforeinstallprompt` and the app is not already running in standalone mode.
- iOS/iPadOS fallback popup with Add to Home Screen guidance.
- Install popup dismissal is remembered for the current browser session.
- Existing `appinstalled` handling now closes the popup and marks the app installed.
- Added real 192x192 and 512x512 PNG PWA icons plus a 180x180 Apple touch icon.
- Updated `manifest.json` for stronger PWA installability, standalone display, maskable icons, theme colors, and launch behavior.
- Fixed the duplicated viewport-fit declaration.
- Improved the service worker cache version and pre-cached the PNG/Apple icons.
- Prevented the generic dynamic cache from storing third-party API/auth responses.
- Kept offline app-shell behavior and same-origin dynamic caching.
