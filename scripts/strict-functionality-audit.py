#!/usr/bin/env python3
"""StudySnap source-level functionality audit.

This deliberately avoids npm/node. It checks route coverage, navigation contracts,
obvious demo data, and common dead-action patterns. It is a fast pre-runtime gate,
not a replacement for browser/E2E tests.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
warnings = []

app = (ROOT / 'src/App.tsx').read_text()
renderer = (ROOT / 'src/components/ViewRenderer.tsx').read_text()
home = (ROOT / 'src/components/AdaptiveHome.tsx').read_text()
# 1. Every declared view should have a renderer branch, excluding authentication
#    state routes that are intentionally handled as special cases.
types = (ROOT / 'src/types.ts').read_text()
m = re.search(r"export type View = (.*?);", types, re.S)
if not m:
    errors.append('Could not parse View union from src/types.ts')
else:
    views = re.findall(r"'([^']+)'", m.group(1))
    for view in views:
        if view in {'login', 'onboarding', 'age-selection', 'role-selection'}:
            continue
        if f"view === '{view}'" not in renderer and f"view === \"{view}\"" not in renderer:
            errors.append(f'View route has no renderer branch: {view}')

# 2. Navigation should expose goBack and use it for component-level back actions.
if 'const goBack = React.useCallback' not in app:
    errors.append('App has no central goBack implementation')
if 'goBack={goBack}' not in app:
    errors.append('ViewRenderer is not receiving goBack')
if "onBack={() => setView('home')}" in renderer:
    errors.append('ViewRenderer still contains a hardcoded Home back action')

# 4. Demo/fake values that should never appear as user progress.
fake_patterns = [
    r'\b74%\b', r'\b92%\b', r'#12\b', r'42 others', r'12 Milestones',
    r'3 Weak Areas', r'5 Matches', r'Advanced Physics 101', r'2450',
]
for pattern in fake_patterns:
    for path in (ROOT / 'src').rglob('*'):
        if path.suffix not in {'.ts', '.tsx'}:
            continue
        text = path.read_text(errors='ignore')
        if re.search(pattern, text):
            warnings.append(f'Possible demo/fake value remains: {pattern} in {path.relative_to(ROOT)}')

# 5. Buttons with obvious no-op handlers.
for path in (ROOT / 'src').rglob('*.tsx'):
    text = path.read_text(errors='ignore')
    if re.search(r'onClick\s*=\s*\{\s*\(?(?:\)|\w+)?\s*=>\s*\{\s*\}\s*\}', text):
        warnings.append(f'Possible empty onClick handler in {path.relative_to(ROOT)}')

# 6. Ensure the home replacement card is wired to a real action.
if 'Next best step' not in home:
    errors.append('Home has no Next best step replacement for empty space')
if 'onFocusMode()' not in home or 'onAddSubject()' not in home:
    errors.append('Next best step does not expose actionable callbacks')

# 7. Verify real stats are not fabricated on first render and flashcards are counted.
if 'total_study_time: 120' in app or 'focus_points: 2450' in app:
    errors.append('Fabricated initial FocusStats still present')
if 'totalFlashcards += (await DataService.getFlashcards(note.id)).length' not in app:
    errors.append('Flashcard totals are not computed from stored data')

print('STRICT FUNCTIONALITY AUDIT')
print('=' * 28)
if errors:
    print(f'FAIL: {len(errors)} blocking issue(s)')
    for item in errors:
        print('  [FAIL]', item)
else:
    print('PASS: no blocking source-level issues found')

if warnings:
    print(f'WARN: {len(warnings)} review item(s)')
    for item in warnings:
        print('  [WARN]', item)
else:
    print('PASS: no warning patterns found')

sys.exit(1 if errors else 0)
