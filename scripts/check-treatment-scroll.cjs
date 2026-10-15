"use strict";

// Read-only release checks for the treatment scroll explanations.
// Usage: node scripts/check-treatment-scroll.cjs [source|dist] [--baseline=<git-ref>] [--output=<new-SSD-json>]
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const { parse } = require('node-html-parser');
const source = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const mode = args.find(value => !value.startsWith('--')) || 'source';
if (!['source', 'dist'].includes(mode)) throw Error('Expected source or dist');
const root = mode === 'dist' ? path.join(source, 'dist') : source;
const baseline = args.find(value => value.startsWith('--baseline='))?.slice(11);
if (baseline && !/^[A-Za-z0-9_./-]+$/.test(baseline)) throw Error('Invalid baseline ref');
const origin = 'https://bdbddc.com';
const languages = [{ folder: '', lang: 'ko' }, { folder: 'en', lang: 'en' }, { folder: 'jp', lang: 'ja' }];
const errors = [], report = [];
const norm = value => String(value ?? '').replace(/\s+/gu, ' ').trim();
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const check = (ok, label, detail) => { if (!ok) errors.push(`${label}: ${detail}`); return !!ok; };
const jsonSame = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function one(doc, selector, label) {
  const nodes = doc.querySelectorAll(selector);
  check(nodes.length === 1, label, `${selector}: expected one, found ${nodes.length}`);
  return nodes[0];
}
function oldHtml(relative) {
  if (!baseline) return null;
  return cp.execFileSync('git', ['show', baseline + ':' + relative], { cwd: source, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}
function preservation(doc) {
  const originalMain = doc.querySelector('main')?.clone();
  originalMain?.querySelectorAll('.bd-scroll').forEach(node => node.remove());
  const metaNames = ['description', 'twitter:title', 'twitter:description', 'twitter:image'];
  const metaProps = ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height'];
  return {
    title: norm(doc.querySelector('title')?.text),
    mainText: norm(originalMain?.text),
    mainLinks: originalMain?.querySelectorAll('a[href]').map(node => node.getAttribute('href')) || [],
    h1: doc.querySelectorAll('h1').map(node => norm(node.text)),
    canonical: doc.querySelectorAll('link[rel="canonical"]').map(node => node.getAttribute('href')),
    alternates: doc.querySelectorAll('link[hreflang]').map(node => [node.getAttribute('hreflang'), node.getAttribute('href')]),
    meta: [...metaNames.map(name => ['name', name]), ...metaProps.map(name => ['property', name])].map(([key, value]) => [key, value, doc.querySelectorAll(`meta[${key}="${value}"]`).map(node => node.getAttribute('content'))]),
    firstImage: originalMain?.querySelector('img')?.getAttribute('src') || null,
    schemas: doc.querySelectorAll('script[type="application/ld+json"]').map(node => JSON.parse(node.text)),
    existingFrames: doc.querySelectorAll('script').filter(node => node.text.includes('FRAME_COUNT')).map(node => hash(node.toString())),
    canvases: originalMain?.querySelectorAll('canvas').map(node => node.id) || []
  };
}

const { inject } = require('./treatment-scroll.cjs');
const scrollData = JSON.parse(fs.readFileSync(path.join(source, 'src/data/treatment-scroll.json'), 'utf8'));
const motionManifestRelative = 'src/data/treatment-motion-assets.json';
const motionManifestBytes = fs.readFileSync(path.join(source, motionManifestRelative));
const motionManifest = JSON.parse(motionManifestBytes.toString('utf8'));
check(motionManifest.version === 1, 'motion manifest', 'Unsupported manifest version');
check(motionManifest.profiles && typeof motionManifest.profiles === 'object' && !Array.isArray(motionManifest.profiles), 'motion manifest', 'Profile map must be an object');
check(motionManifest.sets && typeof motionManifest.sets === 'object' && !Array.isArray(motionManifest.sets), 'motion manifest', 'Visual sets must be an object');
const motionProfiles = motionManifest.profiles || {}, motionSets = motionManifest.sets || {};
const expectedProfiles = Object.keys(scrollData.profiles).sort();
check(expectedProfiles.length === 55, 'motion coverage', 'Expected exactly 55 reviewed treatment content profiles');
check(jsonSame(Object.keys(motionProfiles).sort(), expectedProfiles), 'motion coverage', 'Motion mapping must cover the exact 55 treatment slugs, with no missing or extra slug');
check(typeof motionManifest.hub === 'string' && !!motionSets[motionManifest.hub], 'motion hub', 'Hub must reference an existing reviewed visual set');
const allowedKinds = new Set(['generated-sequence', 'existing-sequence', 'clinic-photo-sequence']);
const assetExistenceCache = new Map();
const visualSetReport = [];
function resolveVisualAsset(url, label) {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//') || url.includes('\\') || /[\0\r\n]/.test(url)) {
    check(false, label, 'Visual asset must be a local absolute URL path');
    return null;
  }
  let pathname;
  try {
    const parsed = new URL(url, origin);
    check(parsed.origin === origin, label, 'External visual asset is not permitted');
    pathname = decodeURIComponent(parsed.pathname);
    if (url.split(/[?#]/, 1)[0].split('/').some(part => decodeURIComponent(part) === '..') || pathname.includes('\\') || pathname.split('/').includes('..')) throw Error('Traversal is not permitted');
  } catch (error) { check(false, label, 'Invalid visual asset URL: ' + error.message); return null; }
  if (assetExistenceCache.has(pathname)) return assetExistenceCache.get(pathname);
  const relative = pathname.replace(/^\/+/, '');
  const candidates = mode === 'source' ? [path.join(source, 'public', relative), path.join(source, relative)] : [path.join(root, relative)];
  const file = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!check(!!file, label, 'Missing local visual asset ' + pathname)) { assetExistenceCache.set(pathname, null); return null; }
  check(fs.statSync(file).size > 0, label, 'Visual asset is empty: ' + pathname);
  if (mode === 'dist') {
    const sourceFile = [path.join(source, 'public', relative), path.join(source, relative)].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    check(!!sourceFile, label, 'Built visual asset has no source: ' + pathname);
    if (sourceFile) check(hash(fs.readFileSync(file)) === hash(fs.readFileSync(sourceFile)), label, 'Built visual asset differs from source: ' + pathname);
  }
  assetExistenceCache.set(pathname, file);
  return file;
}
function frameUrl(config, index) {
  const value = String(index).padStart(config.pad, '0');
  if (/\{(?:frame|index)\}/.test(config.pattern)) return config.pattern.replace(/\{(?:frame|index)\}/g, value);
  return config.pattern.replace(/%0?(\d*)d/g, (_, width) => String(index).padStart(width ? Number(width) : config.pad, '0'));
}
function checkSequence(config, label) {
  if (!check(config && typeof config === 'object', label, 'Sequence configuration is required')) return;
  const fields = ['count', 'width', 'height', 'start', 'pad'];
  for (const key of fields) check(Number.isSafeInteger(config[key]) && (key === 'start' ? config[key] >= 0 : config[key] > 0), label, `Invalid sequence ${key}`);
  const validPattern = typeof config.pattern === 'string' && config.pattern.includes('{index}');
  if (!check(validPattern, label, 'Sequence pattern must contain a numeric frame placeholder')) return;
  if (!Number.isSafeInteger(config.count) || config.count < 1 || config.count > 360 || !Number.isSafeInteger(config.start) || !Number.isSafeInteger(config.pad) || config.pad < 1 || config.pad > 8) {
    check(false, label, 'Invalid or unbounded frame range');
    return;
  }
  const urls = Array.from({ length: config.count }, (_, index) => frameUrl(config, config.start + index));
  check(new Set(urls).size === config.count, label, 'Sequence frames must have unique URLs');
  urls.forEach(url => resolveVisualAsset(url, label));
}
for (const [slug, setKey] of Object.entries(motionProfiles)) check(typeof setKey === 'string' && !!motionSets[setKey], slug, 'Treatment references a missing visual set');
const referencedSets = new Set([...Object.values(motionProfiles), motionManifest.hub]);
for (const setKey of referencedSets) {
  const set = motionSets[setKey];
  if (!set) continue;
  check(set.status === 'visual-review-passed', setKey, 'Visual set has not passed the recorded visual review');
  check(allowedKinds.has(set.kind), setKey, 'Unsupported visual sequence kind');
  check(typeof set.cameraPan === 'boolean', setKey, 'Explicit camera motion policy is required');
  if (set.cameraPan) check(set.desktop?.count === 1 && set.mobile?.count === 1, setKey, 'Camera-only stills must use exactly one reviewed image per size');
  check(set.source && typeof set.source === 'object' && Object.keys(set.source).length > 0, setKey, 'Visual source/provenance record is missing');
  const anchors = set.anchors;
  check(Array.isArray(anchors) && anchors.length === 4 && anchors.every(Number.isFinite) && anchors[0] === 0 && anchors[3] === 1 && anchors.every((value, index) => value >= 0 && value <= 1 && (!index || value > anchors[index - 1])), setKey, 'Exactly four ordered progress anchors from 0 to 1 are required');
  resolveVisualAsset(set.poster, setKey + ' poster');
  checkSequence(set.desktop, setKey + ' desktop');
  checkSequence(set.mobile, setKey + ' mobile');
  visualSetReport.push({ key: setKey, kind: set.kind, status: set.status, poster: set.poster, desktopFrames: set.desktop?.count || 0, mobileFrames: set.mobile?.count || 0 });
}
const versions = { css: new Set(), js: new Set() };
const scenes = new Set();
for (const { folder, lang } of languages) {
  const directory = path.join(root, folder, 'treatments');
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.html')).sort();
  check(files.length === 56, folder || 'ko', 'Expected 55 details and one hub');
  for (const file of files) {
    const slug = file.slice(0, -5);
    const relative = [folder, 'treatments', file].filter(Boolean).join('/');
    const html = read(relative), doc = parse(html);
    const main = one(doc, 'main', relative);
    one(doc, 'h1', relative);
    const canonical = one(doc, 'link[rel="canonical"]', relative);
    const expectedUrl = origin + (folder ? '/' + folder : '') + '/treatments/' + (slug === 'index' ? '' : slug);
    check(canonical?.getAttribute('href') === expectedUrl, relative, 'Canonical URL changed');
    check(doc.querySelector('html')?.getAttribute('lang')?.startsWith(lang), relative, 'Wrong document language');
    const ids = doc.querySelectorAll('[id]').map(node => node.id);
    check(ids.length === new Set(ids).size, relative, 'Duplicate document IDs');
    const scene = one(doc, '.bd-scroll', relative);
    if (!main || !scene) continue;
    check(scene.closest('main') === main, relative, 'Scroll explanation must be inside main');
    const family = scene.getAttribute('data-scene'), variant = scene.getAttribute('data-variant');
    check(!!family && !!variant, relative, 'Scene family and treatment variant required');
    check(variant === slug, relative, 'Treatment variant must match the current URL');
    if (slug !== 'index') check(family === scrollData.profiles[slug]?.scene, relative, 'Scene family differs from reviewed content');
    scenes.add(family);
    const heading = one(scene, '.bd-scroll-intro h2', relative);
    check(norm(heading?.text).length > 5, relative, 'Missing descriptive scene heading');
    const labelId = scene.getAttribute('aria-labelledby');
    if (labelId) check(ids.includes(labelId), relative, 'Broken scene accessible label');
    const steps = scene.querySelectorAll('ol.bd-scroll-steps > li.bd-scroll-step');
    check(steps.length === 4, relative, 'Exactly four server-rendered explanation steps required');
    for (const step of steps) {
      check(!!norm(step.getAttribute('data-label')), relative, 'Missing state label');
      check(norm(step.querySelector('h3')?.text).length >= 3, relative, 'Missing step heading');
      check(norm(step.querySelector('p')?.text).length >= 12, relative, 'Missing readable step explanation');
      check(!step.hasAttribute('hidden') && step.getAttribute('aria-hidden') !== 'true', relative, 'Text must remain readable without motion');
    }
    check(new Set(steps.map(node => norm(node.text))).size === 4, relative, 'Repeated explanation steps');
    const visualSetKey = scene.getAttribute('data-visual-set');
    const expectedSetKey = slug === 'index' ? motionManifest.hub : motionProfiles[slug];
    check(visualSetKey === expectedSetKey, relative, 'Page visual set differs from the reviewed manifest mapping');
    const visualSet = motionSets[expectedSetKey];
    const art = one(scene, '.bd-scroll-art', relative);
    check(art?.querySelectorAll('svg').length === 0, relative, 'Photoreal sequence must not retain the old SVG illustration');
    const poster = one(scene, 'img.bd-sequence-poster', relative);
    check(poster?.closest('.bd-scroll-art') === art, relative, 'Sequence poster must appear inside the visual panel');
    check(poster?.hasAttribute('alt'), relative, 'Poster needs descriptive alt text or explicit decorative alt');
    check(poster?.getAttribute('src') === visualSet?.poster, relative, 'Poster differs from the reviewed visual set');
    try {
      const config = JSON.parse(art?.getAttribute('data-sequence') || 'null');
      check(config && typeof config === 'object', relative, 'Missing parseable sequence configuration');
      for (const field of ['poster', 'desktop', 'mobile', 'anchors', 'kind', 'cameraPan']) check(jsonSame(config?.[field], visualSet?.[field]), relative, 'Embedded sequence ' + field + ' differs from the reviewed manifest');
    } catch (error) { check(false, relative, 'Invalid data-sequence JSON: ' + error.message); }
    const controls = scene.querySelectorAll('button.bd-scroll-step-control');
    check(controls.length === 4, relative, 'Four explicit navigation controls required');
    controls.forEach((button, index) => {
      check(button.getAttribute('type') === 'button', relative, 'Scene controls must not submit surrounding forms');
      check(button.getAttribute('data-step') === String(index), relative, 'Scene control order does not match steps');
      check(!!norm(button.getAttribute('aria-label') || button.text), relative, 'Unlabelled scene control');
    });
    const toggle = one(scene, 'button.bd-scroll-toggle', relative);
    check(!!toggle?.getAttribute('data-pause') && !!toggle?.getAttribute('data-resume'), relative, 'Localized pause/resume labels required');
    const skip = one(scene, 'a.bd-scroll-skip', relative);
    const after = one(doc, '#bd-scroll-after', relative);
    check(skip?.getAttribute('href') === '#bd-scroll-after', relative, 'Skip link must reach explanation end');
    check(html.indexOf('id="bd-scroll-after"') > html.indexOf('class="bd-scroll'), relative, 'Skip target must follow explanation');
    check(norm(scene.querySelector('.bd-scroll-disclaimer')?.text).length >= 15, relative, 'Missing visual explanation caveat');
    if (slug !== 'index') {
      const empathy = one(main, '#tg-understand', relative);
      const balance = one(main, '#tg-balance', relative);
      const provider = one(main, '#tg-provider', relative);
      if (empathy && balance && provider) {
        check(html.indexOf(empathy.toString()) < html.indexOf(scene.toString()), relative, 'Patient empathy must precede visualization');
        check(html.indexOf(scene.toString()) < html.indexOf(balance.toString()), relative, 'Visualization must precede the options/burdens section');
        check(html.indexOf(scene.toString()) < html.indexOf(provider.toString()), relative, 'Provider introduction must remain later');
      }
    } else {
      const hero = one(main, '.tg-hero', relative);
      if (hero) check(html.indexOf(hero.toString()) < html.indexOf(scene.toString()), relative, 'Hub patient introduction must precede visualization');
    }
    const css = one(doc, 'link[href*="/static/treatment-scroll.css"]', relative);
    const js = one(doc, 'script[src*="/static/treatment-scroll.js"]', relative);
    if (css) versions.css.add(css.getAttribute('href'));
    if (js) {
      versions.js.add(js.getAttribute('src'));
      check(js.hasAttribute('defer'), relative, 'Scroll runtime must defer until HTML is parsed');
    }
    try {
      preservation(doc); // Parsing every JSON-LD also detects accidental HTML corruption.
      if (baseline) {
        const old = oldHtml(relative);
        const before = preservation(parse(old)), afterState = preservation(doc);
        const markers = text => text.match(/<!--\s*treatment-(?:patient|choice)[\s\S]*?-->/g) || [];
        check(jsonSame(markers(old), markers(html)), relative, 'Original editorial regeneration markers changed');
        for (const field of Object.keys(before)) check(jsonSame(before[field], afterState[field]), relative, `Preserved ${field} changed`);
      }
    } catch (error) { check(false, relative, error.message); }
    {
      const profile = scrollData.profiles[slug] || { scene: family, variant: 'hub', [lang]: { title: heading.text, intro: scene.querySelector('.bd-scroll-intro > p:not(.bd-scroll-eyebrow)').text, steps: steps.map(step => ({ title: step.querySelector('h3').text, text: step.querySelector('p').text, label: step.getAttribute('data-label') })) } };
      const regenerated = inject(html, profile, lang, slug, 'idempotence-audit');
      check(regenerated === inject(regenerated, profile, lang, slug, 'idempotence-audit'), relative, 'Repeated generation must not duplicate or alter the page');
    }
    report.push({ path: expectedUrl, scene: family, variant, visualSet: visualSetKey, steps: steps.length });
  }
}
check(report.length === 168, 'coverage', 'Expected all 165 details plus 3 treatment hubs');
check(scenes.size >= 8, 'coverage', 'Treatment families need distinct explanatory scenes');
const assetDirectory = path.join(root, mode === 'source' ? 'public/static' : 'static');
const runtimeFiles = ['treatment-scroll.js', 'treatment-scroll.css', 'treatment-scroll-sequence.js'];
const runtimeBuffers = runtimeFiles.map(file => {
  const full = path.join(assetDirectory, file);
  if (!check(fs.existsSync(full), file, 'Local scroll runtime asset is missing')) return null;
  const bytes = fs.readFileSync(full);
  if (mode === 'dist') check(hash(bytes) === hash(fs.readFileSync(path.join(source, 'public/static', file))), file, 'Built asset is stale compared with source');
  return bytes;
});
const assetVersion = runtimeBuffers.every(Boolean)
  ? hash([...runtimeBuffers, motionManifestBytes].map(bytes => bytes.toString('utf8')).join('\n')).slice(0, 12)
  : null;
const importsFrom = text => [...text.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map(match => match[1]);
const moduleText = runtimeBuffers[2]?.toString('utf8') || '';
check(importsFrom(moduleText).length === 0 && !/\bimport\s*\(/.test(moduleText) && !/\bimport\s*["']/.test(moduleText), 'sequence module', 'Photoreal sequence module must have no external or additional module imports');
check(!/three\.module|WebGLRenderer|treatment-scroll-3d/.test(moduleText), 'sequence module', 'Old procedural Three.js rendering must not remain in the photoreal module');
const runtimeText = runtimeBuffers[0]?.toString('utf8') || '';
check(/const\s+sequenceURL\s*=\s*['"]\/static\/treatment-scroll-sequence\.js['"]\s*\+\s*assetQuery/.test(runtimeText), 'scroll runtime', 'Sequence module must inherit the page asset query version');
check(jsonSame([...runtimeText.matchAll(/\bimport\s*\(\s*([^)]*)\)/g)].map(match => match[1].trim()), ['sequenceURL']), 'scroll runtime', 'Only the known local sequence module may be dynamically imported');
check(importsFrom(runtimeText).length === 0 && !/\bimport\s*["']/.test(runtimeText), 'scroll runtime', 'Unexpected static runtime module import');
check(!/treatment-scroll-3d|three\.module/.test(runtimeText), 'scroll runtime', 'Old procedural Three.js module must not be loaded');
for (const type of ['css', 'js']) {
  check(versions[type].size === 1, type, 'All treatment pages must use the same versioned asset');
  for (const url of versions[type]) {
    check(/\?v=[a-zA-Z0-9_-]+/.test(url), type, 'Missing asset cache version');
    check(assetVersion && new URL(url, origin).searchParams.get('v') === assetVersion, type, 'Page asset version does not match current JS + CSS + sequence + manifest bytes');
    const pathname = new URL(url, origin).pathname;
    const asset = path.join(root, mode === 'source' ? 'public' : '', pathname);
    check(fs.existsSync(asset), type, 'Linked runtime asset is absent from release');
    if (fs.existsSync(asset)) check(fs.statSync(asset).size < 100 * 1024, type, 'Scroll runtime asset unexpectedly large');
  }
}


const implantFrames = fs.readdirSync(path.join(root, 'implant/frames')).filter(file => /^frame_\d{4}\.webp$/.test(file));
check(implantFrames.length === 67, 'implant', 'Original 67 frame images must remain available');
const originalCanvasScripts = {
  implant: '42f7e552076c8c304485b85bba6b5eb26e8d35df70188b9c4fa17388614a03ce',
  glownate: '427da2106aaedea933bf1be56b61f2ed7e2106e3160da582a1d3be40d9356671',
  invisalign: '7fc80e39f90c6110c121ccb706b5c314cd0ccf40bf5b5ade587af96c7cbd6ba2'
};
for (const [slug, expected] of Object.entries(originalCanvasScripts)) {
  const doc = parse(read('treatments/' + slug + '.html'));
  check(preservation(doc).existingFrames.includes(expected), slug, 'Original canvas sequence script changed');
}
if (baseline) {
  for (const relative of ['src/data/patient-notes.ts', 'src/data/patient-note-details.ts', 'src/routes/patient-notes.ts']) {
    const before = cp.execFileSync('git', ['show', baseline + ':' + relative], { cwd: source, maxBuffer: 20 * 1024 * 1024 });
    check(hash(before) === hash(fs.readFileSync(path.join(source, relative))), relative, 'Patient-note pipeline changed during animation work');
  }
  const changedFrames = cp.execFileSync('git', ['diff', '--name-only', baseline, '--', 'implant/frames', 'invisalign/frames', 'laminate/frames'], { cwd: source, encoding: 'utf8' });
  check(!changedFrames.trim(), 'original frames', 'Original frame assets changed');
}
const output = args.find(value => value.startsWith('--output='))?.slice(9);
if (output) {
  if (!path.isAbsolute(output) || !path.resolve(output).startsWith('/Volumes/MSJ_WORK/Workspaces/')) throw Error('Report output must be an absolute SSD workspace path');
  fs.writeFileSync(output, JSON.stringify({ passed: !errors.length, checkedAt: new Date().toISOString(), mode, baseline: baseline || null, assetVersion, visualSets: visualSetReport, visualAssets: assetExistenceCache.size, checks: report, errors }, null, 2) + '\n', { flag: 'wx' });
}
if (errors.length) {
  console.error(JSON.stringify({ passed: false, mode, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ passed: true, mode, pages: report.length, preservedImplantFrames: implantFrames.length, baseline: baseline || null, sceneFamilies: scenes.size, assetVersion, visualSets: visualSetReport.length, visualAssets: assetExistenceCache.size, locales: languages.map(({ folder, lang }) => ({ lang, pages: report.filter(item => new URL(item.path).pathname.startsWith((folder ? '/' + folder : '') + '/treatments/')).length })) }));
}
