// Read-only HTTP audit. Build inventory is the default; --sitemaps includes runtime content.
// Production: node scripts/seo-http-audit.cjs https://bdbddc.com --sitemaps
const fs = require('node:fs');
const { parse } = require('node-html-parser');
const base = new URL(process.argv[2] || 'http://localhost:3000').origin;
const official = require('../data/clinic-profile.json').url;
const sitemapMode = process.argv.includes('--sitemaps');
const normalize = value => {
  try { const u = new URL(value, official); return decodeURIComponent(u.pathname) + u.search; } catch { return null; }
};
const issues = [];
const add = (url, code, detail) => issues.push({ url, code, detail });
const delay = ms => new Promise(r => setTimeout(r, ms));
async function request(url, method = 'GET') {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { method, redirect: 'manual', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'SeoulBD-SEO-Audit/1.0' } });
      const text = method === 'HEAD' ? '' : await response.text();
      if ((response.status === 429 || response.status >= 500) && attempt === 0) { await delay(1000); continue; }
      return { status: response.status, headers: response.headers, text };
    } catch (e) { if (attempt === 1) throw e; await delay(1000); }
  }
}
async function main() {
  const urls = new Map();
  if (sitemapMode) {
    const index = await request(base + '/sitemap.xml');
    if (index.status !== 200) throw Error('Sitemap index HTTP ' + index.status);
    const maps = [...index.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    for (const map of maps) {
      const location = new URL(map);
      if (location.origin !== official) throw Error('External sitemap: ' + map);
      const response = await request(base + location.pathname);
      if (response.status !== 200) { add(map, 'sitemap-http', response.status); continue; }
      for (const block of response.text.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
        const loc = /<loc>([^<]+)<\/loc>/.exec(block[1])?.[1]?.replace(/&amp;/g, '&');
        if (!loc || new URL(loc).origin !== official) { add(map, 'invalid-loc', loc); continue; }
        urls.set(normalize(loc), loc);
      }
    }
  } else {
    const report = JSON.parse(fs.readFileSync('dist/admin/seo-health.json', 'utf8'));
    for (const page of report.pages) urls.set(normalize(page.url), official + page.url);
  }
  let checked = 0;
  const jobs = [...urls.values()];
  async function worker() {
    while (jobs.length) {
      const url = jobs.shift();
      const target = base + new URL(url).pathname;
      try {
        const get = await request(target);
        if (get.status !== 200) add(url, 'get-status', { status: get.status, location: get.headers.get('location') });
        else if (!get.text.trim()) add(url, 'empty-response', 'Empty HTTP 200');
        else {
          const root = parse(get.text);
          const canonical = root.querySelectorAll('link[rel="canonical"]');
          const href = canonical[0]?.getAttribute('href');
          if (canonical.length !== 1 || !href || new URL(href, official).origin !== official || normalize(href) !== normalize(url)) add(url, 'canonical', href || 'missing');
          if (root.querySelectorAll('title').length !== 1 || !root.querySelector('title')?.text.trim()) add(url, 'title', 'Expected one nonempty title');
          if (root.querySelectorAll('h1').length !== 1) add(url, 'h1', root.querySelectorAll('h1').length);
          const desc = root.querySelectorAll('meta[name="description"]');
          if (desc.length !== 1 || !desc[0]?.getAttribute('content')?.trim()) add(url, 'description', 'Expected one nonempty description');
          const og = root.querySelector('meta[property="og:url"]')?.getAttribute('content');
          if (!og || normalize(og) !== normalize(href)) add(url, 'og-url', og || 'missing');
          if (/noindex/i.test((root.querySelector('meta[name="robots"]')?.getAttribute('content') || '') + ' ' + (get.headers.get('x-robots-tag') || ''))) add(url, 'noindex', 'Index inventory URL is noindex');
        }
        const head = await request(target, 'HEAD');
        if (head.status !== get.status) add(url, 'head-get-mismatch', { get: get.status, head: head.status });
      } catch (e) { add(url, 'request-error', e.message); }
      checked++;
      if (checked % 100 === 0) console.log(`Checked ${checked}/${urls.size}`);
      await delay(75);
    }
  }
  await Promise.all([worker(), worker()]);
  const report = { checkedAt: new Date().toISOString(), base, mode: sitemapMode ? 'sitemaps' : 'static-build', checked, issues };
  fs.mkdirSync('.wrangler', { recursive: true });
  fs.writeFileSync('.wrangler/seo-http-audit.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ checked, issues }, null, 2));
  if (issues.length) process.exitCode = 1;
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
