# Home floating action cleanup — 2026-08-18

## Change
Removed the Home-screen floating Search contextual action.

## Reason
Search already has a dedicated navigation destination and the Home screen exposes a “Find something” entry. The extra floating magnifier competed visually with the separate AI/Live action, especially on narrow phones.

## Result
- Home: no floating Search button.
- Search remains available from bottom navigation and Home “Find something”.
- Contextual actions remain available on Subject/Note/Quiz screens.
- No new API, storage, authentication, or security surface was introduced.
