import fs from 'node:fs';
import path from 'node:path';

// Replace the previous theme's exact colour literals, preserving alpha values.
// Image pixels, translations, data and unrelated colours are not modified.
const palette = {
  '99775c': '26483E',
  '33271f': '182F28',
  '574437': '405C51',
  '665548': '51695E',
  '221a15': '13251F',
};
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!/\.(css|tsx)$/.test(file) || file.includes('/i18n/')) continue;
    const before = fs.readFileSync(file, 'utf8');
    let after = before.replace(/#(99775c|33271f|574437|665548|221a15)([\da-f]{2})?(?![\da-f])/gi,
      (_, hex, alpha = '') => `#${palette[hex.toLowerCase()]}${alpha}`);
    after = after.replace(/(rgba?\()\s*153\s*,\s*119\s*,\s*92\b/g, '$138,72,62');
    if (before !== after) fs.writeFileSync(file, after);
  }
}
walk('src');
