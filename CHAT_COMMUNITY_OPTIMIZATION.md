# StudySnap Chat & Community Optimization

## Implemented
- Chat composer now supports autosizing-friendly multiline input, IME-safe Enter handling, character count, image attachments up to 2 MB, reply context, and attachment preview.
- Message actions now include reply, copy, reaction, and report for incoming messages.
- Chat lists now track local read timestamps and show unread counts.
- New-chat picker makes AI assistants and saved contacts discoverable instead of leaving dormant entries buried in the list.
- Community hub now has Your spaces / Discover tabs, join-on-open behavior, focused community creation, search, and clearer community status copy.
- Community messages use the same reply/copy/react/report interaction model as chats.
- Reporting now attempts an authenticated backend endpoint with a local fallback when the network is unavailable.
- Socket.IO now requires a Firebase ID token. Display identity is derived server-side from the verified token rather than trusting a client-supplied name.
- Socket messages now sanitize sender identity, text length, attachment metadata, reply metadata, and allow attachment-only messages.
- Removed browser alert usage from these flows; errors/statuses are shown inline.
- Bottom navigation calls the feature Chats rather than AI, keeping StudySnap AI distinct from ordinary messaging.

## Product rationale
Modern chat composer patterns commonly combine autosizing/multiline input, attachments, clear send-state behavior, and IME-safe submission. Community guidance emphasizes clear rules, simple reporting, moderation visibility, and privacy/safety controls. See the QA references below.

## Validation
- TypeScript/TSX transpile check: PASS (96 files, 0 diagnostics)
- UI/product audit: PASS (0 flagged patterns)
- Strict functionality audit: PASS (0 blocking issues, 0 warning patterns)
- Full dependency-backed Vite build: NOT VERIFIED in this extracted environment because project dependencies are not installed and package installation may exceed the execution limit.
