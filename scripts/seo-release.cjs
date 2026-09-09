// Deterministic release SEO maintenance. Mutates dist only; never calls search APIs.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parse } = require('node-html-parser');
const { Script } = require('node:vm');
const { createHash } = require('node:crypto');
const clinic = require('../data/clinic-profile.json');
const BASE = clinic.url;
const CORE = ['/', '/treatments/implant', '/treatments/sedation', '/treatments/glownate', '/treatments/invisalign', '/reservation', '/symptom-checker'];
const SKIP = new Set(['admin', 'auth', 'report', 'tables']);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.name.startsWith('.') || SKIP.has(e.name)) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
  });
}
function canonicalPath(href) {
  try { const u = new URL(href); return u.origin === BASE && !u.search && !u.hash ? u.pathname : null; } catch { return null; }
}
function sourceFor(file) {
  const rel = file.replace(/^dist\//, '');
  if (fs.existsSync(rel)) return rel;
  return fs.existsSync('public/' + rel) ? 'public/' + rel : null;
}
function run() {
  if (!fs.existsSync('dist/_worker.js')) throw new Error('Run the application build first.');
  const fixes = { languagePages: 0, languageGroups: 0, sitemapDates: 0, sitemapLanguageEntries: 0, metadataPages: 0, schemaDuplicatesRemoved: 0 };
  const records = [];
  const issues = [];
  const cssVersions = new Map();
  function issue(code, url, message, severity = 'warning') { issues.push({ code, url, message, severity }); }
  for (const file of htmlFiles('dist')) {
    let html = fs.readFileSync(file, 'utf8');
    if (file === 'dist/index.html') {
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(clinic.homeTitle)}</title>`);
      const replacements = { description: clinic.homeDescription, 'og:title': clinic.homeTitle, 'og:description': clinic.homeDescription, 'twitter:title': clinic.homeTitle, 'twitter:description': clinic.homeDescription };
      html = html.replace(/<meta\b[^>]*>/gi, tag => {
        const node = parse(tag).querySelector('meta');
        const name = node?.getAttribute('name') || node?.getAttribute('property');
        return replacements[name] ? `<meta ${name.startsWith('og:') ? 'property' : 'name'}="${name}" content="${esc(replacements[name])}">` : tag;
      });
      html = html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (all, a, body, z) => {
        try { const j = JSON.parse(body); if (j['@type'] === 'Dentist') { j.openingHoursSpecification = clinic.openingHoursSpecification; j.telephone = clinic.phone; return a + JSON.stringify(j).replace(/</g, '\\u003c') + z; } } catch {}
        return all;
      });
      fixes.metadataPages++;
    }
    html = html.replace(/(<span\b[^>]*\bdata-clinic-hours[^>]*>)[\s\S]*?(<\/span>)/g, '$1' + esc(clinic.hoursSummary) + '$2');
    // Updated heading selectors must not be paired with a browser's old cached CSS.
    html = html.replace(/<link\b[^>]*>/gi, tag => {
      const link = parse(tag).querySelector('link');
      const href = link?.getAttribute('href');
      if (!href) return tag;
      let url;
      try { url = new URL(href, BASE + '/' + file.replace(/^dist\//, '')); } catch { return tag; }
      if (url.origin !== BASE || !url.pathname.endsWith('.css')) return tag;
      const cssFile = 'dist' + url.pathname;
      if (!fs.existsSync(cssFile)) return tag;
      if (!cssVersions.has(cssFile)) cssVersions.set(cssFile, createHash('sha256').update(fs.readFileSync(cssFile)).digest('hex').slice(0, 12));
      url.searchParams.set('v', cssVersions.get(cssFile));
      link.setAttribute('href', url.pathname + url.search);
      return link.toString();
    });
    const root = parse(html);
    const cp = canonicalPath(root.querySelector('link[rel="canonical"]')?.getAttribute('href'));
    if (CORE.includes(cp)) {
      const documents = [];
      const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi;
      for (const match of html.matchAll(pattern)) {
        try {
          const j = JSON.parse(parse(match[0]).querySelector('script').rawText);
          if (j['@type'] === 'MedicalWebPage' && (!j.url || canonicalPath(j.url) === cp)) documents.push({ tag: match[0], value: j });
        } catch {}
      }
      if (documents.length > 1) {
        const merged = Object.assign({}, ...documents.map(d => d.value), { '@id': BASE + cp + '#webpage', url: BASE + cp });
        documents.forEach((d, i) => { html = html.replace(d.tag, i === 0 ? '<script type="application/ld+json">' + JSON.stringify(merged).replace(/</g, '\\u003c') + '</script>' : ''); });
        fixes.schemaDuplicatesRemoved += documents.length - 1;
      }
    }
    const lang = (root.querySelector('html')?.getAttribute('lang') || '').toLowerCase();
    const noindex = /noindex/i.test(root.querySelector('meta[name="robots"]')?.getAttribute('content') || '');
    const redirect = !!root.querySelector('meta[http-equiv="refresh"]');
    const alternates = root.querySelectorAll('link[hreflang]').map(l => ({ lang: l.getAttribute('hreflang'), href: l.getAttribute('href') }));
    // Keep only primitive metadata; neither DOM trees nor full HTML live across the scan.
    if (html !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, html);
    records.push({ file, alternates, cp, lang, noindex, redirect });
  }
  // Only actual canonical HTML counterparts join a group; never create translated URLs.
  const byPath = new Map();
  for (const r of records) if (r.cp && !r.noindex && !r.redirect) {
    if (byPath.has(r.cp)) issue('duplicate-canonical-source', r.cp, `Multiple static sources: ${byPath.get(r.cp).file}, ${r.file}`);
    else byPath.set(r.cp, r);
  }
  const membership = new Map();
  for (const ko of records.filter(r => r.lang.startsWith('ko') && r.cp && !r.noindex && !r.redirect && byPath.get(r.cp) === r)) {
    const members = new Map([['ko', ko]]);
    for (const [prefix, lang] of [['en', 'en'], ['jp', 'ja']]) {
      const candidate = byPath.get('/' + prefix + (ko.cp === '/' ? '/' : ko.cp));
      if (candidate && candidate.lang.startsWith(lang)) members.set(lang, candidate);
    }
    // Preserve explicit non-mirror translations only when the referenced canonical page exists.
    for (const link of ko.alternates) {
      const lang = link.lang;
      if (!lang || ['ko', 'en', 'ja', 'x-default'].includes(lang)) continue;
      const candidate = byPath.get(canonicalPath(link.href));
      if (candidate && candidate.lang.split('-')[0] === lang.toLowerCase().split('-')[0]) members.set(lang, candidate);
    }
    if (members.size < 2) continue;
    for (const [lang, r] of [...members]) if (membership.has(r.cp)) {
      issue('language-group-conflict', r.cp, 'Translation already belongs to another canonical group; manual review needed.'); members.delete(lang);
    }
    if (!members.has('ko') || members.size < 2) continue;
    const alternates = [...members].map(([lang, r]) => ({ lang, href: BASE + r.cp }));
    alternates.push({ lang: 'x-default', href: BASE + ko.cp });
    const tags = alternates.map(a => `<link rel="alternate" hreflang="${a.lang}" href="${esc(a.href)}">`).join('\n');
    for (const r of members.values()) {
      membership.set(r.cp, alternates);
      const old = fs.readFileSync(r.file, 'utf8');
      const updated = old.replace(/<link\b[^>]*\bhreflang\s*=[^>]*>\s*/gi, '').replace(/<\/head>/i, tags + '\n</head>');
      if (old !== updated) { fs.writeFileSync(r.file, updated); fixes.languagePages++; }
    }
    fixes.languageGroups++;
  }
  // Git dates describe source modifications, not release time or medical review time.
  let gitDates = '';
  try { gitDates = execFileSync('git', ['log', '--format=DATE:%cs', '--name-only', '--diff-filter=AM'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }); } catch {}
  const dates = new Map(); let date = '';
  for (const line of gitDates.split('\n')) {
    if (line.startsWith('DATE:')) date = line.slice(5);
    else if (line && date && !dates.has(line)) dates.set(line, date);
  }
  // Sitemap lastmod is optional. For dirty source files omit it until committed rather than invent a date.
  let dirty = [];
  try { dirty = execFileSync('git', ['diff', '--name-only', 'HEAD'], { encoding: 'utf8' }).trim().split('\n'); } catch {}
  for (const file of dirty) dates.delete(file);
  const sitemapFiles = fs.readdirSync('dist').filter(n => /^sitemap.*\.xml$/.test(n));
  for (const name of sitemapFiles.filter(n => n !== 'sitemap.xml' && n !== 'sitemap-images.xml')) {
    const file = 'dist/' + name;
    let xml = fs.readFileSync(file, 'utf8');
    xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
      const loc = /<loc>([^<]+)<\/loc>/.exec(inner)?.[1];
      const cp = canonicalPath(loc?.replace(/&amp;/g, '&'));
      const r = byPath.get(cp);
      let out = block;
      if (r) {
        const modified = dates.get(sourceFor(r.file));
        out = out.replace(/\s*<lastmod>[^<]*<\/lastmod>/g, '');
        if (modified) out = out.replace('</loc>', `</loc><lastmod>${modified}</lastmod>`);
        if (out !== block) fixes.sitemapDates++;
      }
      if (membership.has(cp)) {
        out = out.replace(/\s*<xhtml:link\b[^>]*\/?\s*>/g, '');
        const links = membership.get(cp).map(a => `<xhtml:link rel="alternate" hreflang="${a.lang}" href="${esc(a.href)}"/>`).join('\n');
        out = out.replace('</url>', links + '</url>'); fixes.sitemapLanguageEntries++;
      }
      return out;
    });
    if (xml.includes('<xhtml:link') && !xml.includes('xmlns:xhtml=')) xml = xml.replace('<urlset ', '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ');
    fs.writeFileSync(file, xml);
  }
  // Dynamic R2 content dates cannot be known at static build time: omit stale index lastmod hints.
  const indexFile = 'dist/sitemap.xml';
  fs.writeFileSync(indexFile, fs.readFileSync(indexFile, 'utf8').replace(/\s*<lastmod>[^<]*<\/lastmod>/g, ''));
  // Cloudflare treats rules after a dynamic rule as dynamic; place exact rules first.
  const redirectFile = 'dist/_redirects';
  const lines = fs.readFileSync(redirectFile, 'utf8').split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
  const dynamic = l => /[*:]/.test(l.trim().split(/\s+/)[0]);
  const exact = lines.filter(l => !dynamic(l)); const patterns = lines.filter(dynamic);
  fs.writeFileSync(redirectFile, '# Generated: exact redirects first, pattern rules last. Source: /_redirects\n' + [...exact, ...patterns].join('\n') + '\n');
  if (patterns.length > 100 || exact.length > 2000) issue('redirect-limit', '/_redirects', 'Cloudflare Pages redirect limit exceeded.', 'error');
  return audit(records, membership, fixes, issues, { exact: exact.length, dynamic: patterns.length });
}

function audit(records, membership, fixes, issues, redirects) {
  const pages = [];
  const titles = new Map();
  const descriptions = new Map();
  const redirectTargets = new Map(fs.readFileSync('dist/_redirects', 'utf8').split('\n')
    .filter(l => l.startsWith('/') && !/[*:]/.test(l.split(/\s+/)[0]))
    .map(l => l.trim().split(/\s+/)));
  const pathKey = value => { try { return decodeURIComponent(new URL(value, BASE).pathname); } catch { return null; } };
  const hiddenHeading = node => {
    for (let p = node; p?.tagName; p = p.parentNode) {
      if (p.hasAttribute('hidden') || p.getAttribute('aria-hidden') === 'true' ||
          p.id === 'imageModal' || /(?:gn|im|iv)-scrub-(?:chapter|finale)/.test(p.getAttribute('class') || '')) return true;
    }
    return false;
  };
  const existing = new Map(records.filter(r => r.cp && !r.redirect && !r.noindex).map(r => [r.cp, r]));
  const add = (code, url, message, critical = false) => issues.push({ code, url, message, severity: critical ? 'error' : 'warning' });
  // Patient-facing fallback copy must describe the current state, not an unfinished site.
  const checkPublicCopy = (root, url) => {
    for (const node of root.querySelectorAll('.profile-photo-placeholder,.gallery-item-placeholder,.game-card')) {
      if (/촬영\s*예정|coming\s*soon|shoot scheduled|to be taken|scheduled to be taken|撮影予定/i.test(node.textContent))
        add('unfinished-public-copy', url, 'Unfinished photo or game announcement in patient-facing HTML.', true);
    }
    if (root.querySelector('script[src*="bd-tag-loader.js"],script[src*="bd-analytics.js"],script[src*="cdn.amplitude.com"]'))
      add('retired-tracker', url, 'Retired analytics loader must not return after a merge.', true);
  };
  const memberHtml = fs.readFileSync('dist/auth/mypage.html', 'utf8');
  const memberRoot = parse(memberHtml);
  checkPublicCopy(memberRoot, '/auth/mypage');
  if (/준비\s*중|모든 데이터가 삭제됩니다/.test(memberHtml)) add('unfinished-member-action', '/auth/mypage', 'Member actions must not promise unimplemented updates or deletion.', true);
  for (const script of memberRoot.querySelectorAll('script')) {
    if (script.getAttribute('src') || !['', 'text/javascript', 'application/javascript'].includes(script.getAttribute('type') || '')) continue;
    try { new Script(script.rawText); } catch (e) { add('member-script-syntax', '/auth/mypage', e.message, true); }
  }
  let adminScriptsChecked = 0;
  // Admin HTML is intentionally excluded from indexing checks, not from JavaScript syntax checks.
  for (const name of fs.readdirSync('dist/admin').filter(n => n.endsWith('.html'))) {
    const root = parse(fs.readFileSync('dist/admin/' + name, 'utf8'));
    for (const s of root.querySelectorAll('script')) {
      if (s.getAttribute('src') || !['', 'text/javascript', 'application/javascript'].includes(s.getAttribute('type') || '')) continue;
      adminScriptsChecked++;
      try { new Script(s.rawText, { filename: 'admin/' + name }); }
      catch (e) { add('admin-script-syntax', '/admin/' + name, 'Inline JavaScript syntax error: ' + e.message, true); }
    }
  }
  for (const cp of CORE) if (!existing.has(cp)) add('core-page-missing', cp, 'Required canonical page missing from build.', true);
  for (const r of records) {
    if (r.noindex || r.redirect) continue;
    const html = fs.readFileSync(r.file, 'utf8');
    const root = parse(html);
    const cp = r.cp || '/' + r.file.replace(/^dist\//, '');
    const critical = CORE.includes(cp);
    checkPublicCopy(root, cp);
    const title = root.querySelector('title')?.textContent.trim() || '';
    const canonicals = root.querySelectorAll('link[rel="canonical"]');
    const h1 = root.querySelectorAll('h1');
    if (!sourceFor(r.file)) add('orphan-build-page', cp, 'Built HTML has no source; clean dist before building.', true);
    if (root.querySelectorAll('title').length !== 1 || !title) add('title-invalid', cp, 'Expected one nonempty title.', true);
    if (canonicals.length !== 1 || !r.cp) add('canonical-invalid', cp, 'Expected exactly one canonical URL on the official domain.', true);
    if (h1.length !== 1) add('heading-count', cp, `H1 count: ${h1.length}; inspect document structure.`, true);
    const metas = root.querySelectorAll('meta[name="description"]');
    const description = metas[0]?.getAttribute('content')?.trim();
    if (metas.length !== 1 || !description) add('description-invalid', cp, 'Expected one nonempty search description.', true);
    if (description) { if (!descriptions.has(description)) descriptions.set(description, []); descriptions.get(description).push(cp); }
    const ogUrls = root.querySelectorAll('meta[property="og:url"]');
    if (ogUrls.length !== 1 || !canonicalPath(ogUrls[0]?.getAttribute('content')) || pathKey(ogUrls[0]?.getAttribute('content')) !== pathKey(cp)) add('og-canonical-mismatch', cp, 'Open Graph URL must match canonical.', true);
    if (redirectTargets.has(cp)) add('canonical-redirect', cp, `Canonical is a redirect to ${redirectTargets.get(cp)}`, true);
    if (/\/index(?:\.html)?$/.test(cp)) add('canonical-index-alias', cp, 'Directory index canonical should be its final slash URL.', true);
    let previousLevel = 0;
    for (const heading of root.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
      if (hiddenHeading(heading)) continue;
      const level = Number(heading.tagName.slice(1));
      const dynamicTitle = cp === '/game/cavity-defense' && heading.id === 'resTitle';
      if (!heading.textContent.trim() && !dynamicTitle) add('empty-heading', cp, 'Empty content heading.', true);
      if (level > previousLevel + 1) add('heading-skip', cp, `H${previousLevel} to H${level}: ${heading.textContent.trim().slice(0, 100)}`, true);
      previousLevel = level;
    }
    if (title) { if (!titles.has(title)) titles.set(title, []); titles.get(title).push(cp); }
    let schemas = 0;
    for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
      try { JSON.parse(s.rawText); schemas++; } catch { add('jsonld-invalid', cp, 'Structured data is not valid JSON.', critical); }
    }
    const alts = root.querySelectorAll('link[hreflang]').map(l => ({ lang: l.getAttribute('hreflang'), href: l.getAttribute('href') }));
    if (membership.has(cp)) {
      const expected = membership.get(cp);
      if (JSON.stringify(alts) !== JSON.stringify(expected)) add('language-mismatch', cp, 'Language group does not match its counterparts.', true);
    }
    const decision = root.querySelector('[data-seo-decision]');
    if (decision) {
      for (const a of decision.querySelectorAll('a[href]')) {
        const u = new URL(a.getAttribute('href'), BASE + cp);
        if (u.origin !== BASE) continue;
        const target = existing.get(u.pathname);
        const dynamic = /^\/pricing\/(implant|prosthetic|denture|ortho|pediatric)$/.test(u.pathname);
        if (!target && !dynamic) add('decision-link-missing', cp, `Decision guide target missing: ${u.pathname}`, true);
        if (target && u.hash && !parse(fs.readFileSync(target.file, 'utf8')).getElementById(u.hash.slice(1))) add('decision-anchor-missing', cp, `Decision guide anchor missing: ${u.pathname}${u.hash}`, true);
      }
    }
    pages.push({ url: cp, title, language: r.lang, schemas, languageLinks: alts.length, decisionGuide: !!decision, htmlBytes: Buffer.byteLength(html) });
  }
  for (const [title, urls] of titles) if (urls.length > 1) add('duplicate-title', urls[0], `${title}: ${urls.join(', ')}`);
  for (const [description, urls] of descriptions) if (urls.length > 1) add('duplicate-description', urls[0], `Repeated description: ${urls.join(', ')}`);
  const sitemapCounts = {};
  for (const name of fs.readdirSync('dist').filter(n => /^sitemap.*\.xml$/.test(n))) {
    const xml = fs.readFileSync('dist/' + name, 'utf8');
    const seen = new Set();
    for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = /<loc>([^<]+)<\/loc>/.exec(block[1])?.[1]?.replace(/&amp;/g, '&');
      const cp = canonicalPath(loc);
      if (!cp) { add('sitemap-invalid-url', '/' + name, `Invalid page URL: ${loc}`, true); continue; }
      const key = pathKey(cp);
      if (seen.has(key)) add('sitemap-duplicate', '/' + name, `Duplicate URL within sitemap: ${cp}`, true);
      seen.add(key);
      if (redirectTargets.has(cp)) add('sitemap-redirect', '/' + name, `Sitemap advertises redirect: ${cp}`, true);
      const filePath = cp.endsWith('/') ? cp + 'index.html' : cp + '.html';
      const source = records.find(r => r.file === 'dist' + filePath);
      // /column/ is rendered by the Worker; its legacy static stub is not the response.
      if (source && cp !== '/column/' && (source.noindex || source.redirect || pathKey(source.cp) !== key)) add('sitemap-noncanonical', '/' + name, `Nonindexable or noncanonical entry: ${cp}`, true);
      if (/\/(?:index(?:\.html)?)$/.test(cp)) add('sitemap-index-alias', '/' + name, `Index alias: ${cp}`, true);
    }
    sitemapCounts[name] = seen.size;
  }
  const robots = fs.readFileSync('dist/robots.txt', 'utf8');
  for (const name of ['Googlebot', 'Bingbot', 'Yeti', 'OAI-SearchBot']) {
    const blocks = robots.split(/(?=^User-agent:)/mi).filter(s => new RegExp('^User-agent:\\s*' + name + '\\s*$', 'mi').test(s));
    for (const blocked of ['/admin/', '/auth/', '/api/']) if (!blocks.some(s => s.split('\n').some(l => l.trim() === 'Disallow: ' + blocked))) add('crawler-private-path', '/robots.txt', `${name} must explicitly exclude ${blocked}`, true);
  }
  const routes = JSON.parse(fs.readFileSync('dist/_routes.json', 'utf8'));
  if ((routes.exclude || []).some(p => p === '/*' || p === '/admin/*' || p === '/admin/seo-health.json')) add('audit-report-public', '/admin/seo-health.json', 'Admin audit must pass through Worker authentication.', true);
  for (const secret of ['.dev.vars', '.env', '.cloudflare-token', 'src', 'scripts', '.git']) if (fs.existsSync('dist/' + secret)) add('private-build-artifact', '/', `Private artifact in dist: ${secret}`, true);
  let commit = 'unknown';
  try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {}
  const report = {
    version: 1, generatedAt: new Date().toISOString(), commit,
    scope: 'Static build checks only; not search index status, ranking, medical validation or Core Web Vitals.',
    checkedPages: pages.length, adminScriptsChecked, sitemapCounts, fixes, redirects,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity !== 'error').length,
    issues, pages
  };
  fs.mkdirSync('dist/admin', { recursive: true });
  fs.writeFileSync('dist/admin/seo-health.json', JSON.stringify(report));
  console.log(`[seo-release] ${report.checkedPages} pages; ${report.errors} blocking errors; ${report.warnings} review warnings; ${fixes.languageGroups} language groups.`);
  if (report.errors) {
    for (const e of issues.filter(i => i.severity === 'error')) console.error(e.code, e.url, e.message);
    throw new Error('SEO release checks failed. Deployment is blocked.');
  }
  return report;
}

if (require.main === module) run();
module.exports = { run };
