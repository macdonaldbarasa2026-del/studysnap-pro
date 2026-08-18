# StudySnap Pro Security Checklist

Before production deployment:

- Keep Gemini/API secrets on the server only.
- Set `CLIENT_ORIGIN` to the exact production frontend origin.
- Verify Firebase ID tokens on every protected server endpoint.
- Authorize Socket.IO room joins against the authenticated user's permissions.
- Remove users from in-memory room membership on disconnect.
- Add rate limiting and request-size limits to AI/upload endpoints.
- Validate and sanitize all client-provided IDs, filenames, and text.
- Never store authentication secrets or private API keys in localStorage.
- Use Firestore Security Rules (or backend authorization) for private academic data.
- Add structured error logging without logging credentials or private user content.
- Run `npm install`, `npm run lint`, and `npm run build` before release.
