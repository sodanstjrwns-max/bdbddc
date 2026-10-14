import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeFaviconHead } from '../src/lib/favicon-head.mjs';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(process.argv[2] || path.join(site, 'dist'));
if (root !== path.join(site, 'dist')) throw new Error('Favicon normalization only writes this site dist directory.');
const stats = { scanned: 0, updated: 0, noHead: 0 };
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!entry.isFile() || !/\.html$/i.test(entry.name)) continue;
    stats.scanned++;
    const before = fs.readFileSync(file, 'utf8');
    if (!/<head\b[^>]*>[\s\S]*?<\/head\s*>/i.test(before)) { stats.noHead++; continue; }
    const after = normalizeFaviconHead(before);
    if (after !== before) { fs.writeFileSync(file, after); stats.updated++; }
  }
}
walk(root);
console.log('[favicon-head]', JSON.stringify(stats));
