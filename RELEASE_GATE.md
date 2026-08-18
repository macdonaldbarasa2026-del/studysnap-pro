# StudySnap Pro Release Gate

Run these checks before shipping a build.

```bash
npm ci
npm run audit:ui
npm run build
npm run dev
```

## Device smoke test

- Login / guest login
- Home vertical scroll only
- Smart Study Plan actions
- Subject → Note → Quiz → Back → Note
- Baby Mode → activity → Back → Exit
- Chats → conversation → send → Back
- Communities → search → open → Back
- Offline banner → Offline Hub
- Reconnect after airplane mode
- Settings / theme / text size
- Android system Back

## Release evidence

Record the Termux build output, audit output, and screenshots/video of the smoke-test flows. Do not call a release clean if a check was skipped.
