import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const extensions = new Set(['.ts', '.tsx', '.css']);
const patterns = [
  [/overflow-x-auto(?![^\n]*data-horizontal-scroller=\"carousel\")/g, 'horizontal overflow'],
  [/scrollLeft/g, 'scrollLeft usage'],
  [/scrollSnap|scroll-snap/g, 'horizontal snap'],
  [/window\.alert\s*\(|\balert\s*\(/g, 'browser alert'],
  [/window\.prompt\s*\(/g, 'browser prompt'],
  [/about:blank/g, 'about:blank navigation'],
];

let files = 0;
let flagged = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name))) {
      files++;
      const text = fs.readFileSync(full, 'utf8');
      for (const [pattern, label] of patterns) {
        const matches = text.match(pattern);
        if (matches?.length) {
          flagged += matches.length;
          console.log(`${label}: ${path.relative(process.cwd(), full)} (${matches.length})`);
        }
      }
    }
  }
}

walk(root);
console.log(`\nStudySnap product audit: ${files} source files scanned; ${flagged} flagged pattern occurrence(s).`);
process.exitCode = flagged ? 1 : 0;
