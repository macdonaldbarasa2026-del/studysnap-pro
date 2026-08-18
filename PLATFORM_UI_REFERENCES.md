# StudySnap Platform UI References

This pass follows platform guidance while keeping StudySnap's product identity and content model shared.

- Android adaptive layouts and navigation: https://developer.android.com/design/ui/mobile/guides/layout-and-content/adapt-layout
- Android navigation patterns: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- Android Material 3 adaptive: https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive
- Android Navigation 3 adaptive navigation: https://developer.android.com/guide/navigation/navigation-3
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Microsoft Windows design guidelines: https://learn.microsoft.com/en-us/windows/apps/design/guidelines-overview
- Microsoft Fluent 2 layout: https://fluent2.microsoft.design/layout
- MDN container queries: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries

Implementation principle:

1. Shared StudySnap information architecture.
2. Platform-specific navigation and visual conventions.
3. Window-size adaptation independent from platform detection.
4. No hard-coded academic subject or discipline.
5. One primary scroll owner on touch devices.
6. Content reflows instead of being horizontally squeezed.
