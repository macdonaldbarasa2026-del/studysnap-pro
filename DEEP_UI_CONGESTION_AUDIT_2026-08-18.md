# StudySnap Pro — Deep UI Congestion Audit

## Problems identified
1. Mobile primary navigation had five labeled destinations plus a separate Menu control and a separate Add control. This created seven competing targets in a narrow horizontal bar and caused label wrapping.
2. Home repeated navigation intent in several places: Quick Start, Find/Search, More Tools, and the floating contextual assistant.
3. The floating StudySnap AI assistant appeared on Home even though Home already has a prominent Ask StudySnap action.
4. The Home quick-action grid collapsed to one column on phones, increasing scroll length unnecessarily.
5. Subjects also collapsed to one column, producing long vertical lists.
6. Install prompts and contextual floating actions could occupy the same bottom-right control zone.
7. Search retained an old provider-named component even though the implementation is server-side and provider-neutral.
8. A few visible video-generation labels still exposed a third-party product name.
9. A stale Google Programmable Search CSS block remained even though the browser widget was no longer used.

## Changes applied
- Mobile bottom navigation is now four destinations plus a single More entry. Add is kept inside the More/menu workflow rather than consuming a permanent slot.
- Community is shortened to Groups on small screens so labels remain readable.
- Home quick actions use a two-column mobile grid; an odd final action spans the row.
- Home subject cards use a two-column mobile grid.
- Home More Tools is hidden on mobile because the global More navigation already exposes the same discovery path.
- Home no longer mounts the floating contextual AI assistant; the hero Ask StudySnap action remains the primary AI entry point.
- Install popup is positioned above the mobile navigation and the contextual assistant is suppressed while installation is visible.
- Search component was renamed from GoogleWebSearch to WebResearchPanel.
- Visible video-generation provider names were replaced with StudySnap-neutral product language.
- Removed stale Google Programmable Search styling.
- Preserved one main touch scroll owner and existing safe-area handling.

## Validation
- Strict functionality audit: PASS.
- Product UI audit: PASS, 100 source files, 0 flagged patterns.
- No browser-specific search widget references remain in the active source path.
- No new fixed overlay was introduced by this pass.
