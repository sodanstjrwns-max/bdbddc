// Negative tests against disposable dist output only. Always restore changed files.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { run } = require('./seo-release.cjs');
const files = ['dist/treatments/index.html', 'dist/about.html', 'dist/guide/implant.html', 'dist/sitemap-main.xml'];
const originals = new Map(files.map(f => [f, fs.readFileSync(f, 'utf8')]));
try {
  fs.writeFileSync(files[0], originals.get(files[0]).replace('rel="canonical" href="https://bdbddc.com/treatments/"', 'rel="canonical" href="https://bdbddc.com/treatments/index"'));
  fs.writeFileSync(files[1], originals.get(files[1]).replace('</head>', '<meta name="description" content="duplicate test"></head>'));
  fs.writeFileSync(files[2], originals.get(files[2]).replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/, '<h4$1>$2</h4>'));
  fs.writeFileSync(files[3], originals.get(files[3]).replace('</urlset>', '<url><loc>https://bdbddc.com/doctors/index</loc></url></urlset>'));
  assert.throws(() => run(), /SEO release checks failed/);
  const report = JSON.parse(fs.readFileSync('dist/admin/seo-health.json', 'utf8'));
  for (const code of ['canonical-redirect', 'description-invalid', 'heading-skip', 'sitemap-redirect']) {
    assert(report.issues.some(i => i.code === code && i.severity === 'error'), `Missing blocking check: ${code}`);
  }
  console.log('Negative checks passed: canonical redirect, duplicate metadata, heading skip, sitemap redirect.');
} finally {
  for (const [file, html] of originals) fs.writeFileSync(file, html);
  run();
}
function fingerprint() {
  const hash = createHash('sha256');
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
      const file = dir + '/' + entry.name;
      if (entry.isDirectory()) walk(file);
      else if (/\.(html|css|xml)$/.test(file) || file === 'dist/_redirects') hash.update(file).update(fs.readFileSync(file));
    }
  }
  walk('dist');
  return hash.digest('hex');
}
const before = fingerprint();
run();
assert.equal(fingerprint(), before, 'Repeated release normalization must be idempotent.');
console.log('Restoration and idempotence passed.');
