# Cross-device pass

- Removed the Home screen's nested vertical scroll container so phone scrolling uses the document rather than a scrollable page inside the app.
- Reworked the bottom navigation to be compact and less overlay-heavy on phones while retaining a desktop-sized dock.
- Made the empty Subject card an explicit first-subject call-to-action instead of an ambiguous empty slot.
- Fixed search race conditions when typing quickly and added a deterministic local fallback if the optimized search engine fails.
- Search back now returns to the actual previous view through the app navigation stack instead of always forcing Home.
- Kept the existing Firebase/backend architecture intact.
