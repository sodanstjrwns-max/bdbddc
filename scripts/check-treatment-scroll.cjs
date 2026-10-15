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
    firstImage: doc.querySelector('main img')?.getAttribute('src') || null,
    schemas: doc.querySelectorAll('script[type="application/ld+json"]').map(node => JSON.parse(node.text)),
    existingFrames: doc.querySelectorAll('script').filter(node => node.text.includes('FRAME_COUNT')).map(node => hash(node.toString())),
    canvases: originalMain?.querySelectorAll('canvas').map(node => node.id) || []
  };
}

const { inject } = require('./treatment-scroll.cjs');
const scrollData = JSON.parse(fs.readFileSync(path.join(source, 'src/data/treatment-scroll.json'), 'utf8'));
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
    const svg = one(scene, '.bd-scroll-art svg', relative);
    check(svg?.getAttribute('viewBox') || svg?.getAttribute('viewbox'), relative, 'Scalable SVG viewBox missing');
    if (svg) {
      const decorative = svg.getAttribute('aria-hidden') === 'true';
      const svgLabels = (svg.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
      check(decorative || !!svg.getAttribute('aria-label') || (svgLabels.length && svgLabels.every(id => ids.includes(id))), relative, 'Illustration lacks accessible text or decorative marking');
      check(svg.querySelectorAll('script,foreignObject').length === 0, relative, 'Unexpected executable SVG content');
      const stages = [...new Set(svg.querySelectorAll('[data-motion-stage]').map(node => node.getAttribute('data-motion-stage')))];
      const continuous = svg.querySelectorAll('[data-motion="align"],[data-motion="reveal"]').length > 0;
      check(stages.length >= 2 && (continuous || ['0','1','2','3'].every(stage => stages.includes(stage))), relative, 'Scene needs progressive geometry or four distinct visual states');
    }
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
    report.push({ path: expectedUrl, scene: family, variant, steps: steps.length });
  }
}
check(report.length === 168, 'coverage', 'Expected all 165 details plus 3 treatment hubs');
check(scenes.size >= 8, 'coverage', 'Treatment families need distinct explanatory scenes');
const assetDirectory = path.join(root, mode === 'source' ? 'public/static' : 'static');
const runtimeFiles = ['treatment-scroll.js', 'treatment-scroll.css', 'treatment-scroll-3d.js'];
const runtimeBuffers = runtimeFiles.map(file => {
  const full = path.join(assetDirectory, file);
  if (!check(fs.existsSync(full), file, 'Local scroll runtime asset is missing')) return null;
  const bytes = fs.readFileSync(full);
  if (mode === 'dist') check(hash(bytes) === hash(fs.readFileSync(path.join(source, 'public/static', file))), file, 'Built asset is stale compared with source');
  return bytes;
});
const assetVersion = runtimeBuffers.every(Boolean)
  ? hash(Buffer.concat(runtimeBuffers)).slice(0, 12)
  : null;
const moduleText = runtimeBuffers[2]?.toString('utf8') || '';
const importsFrom = text => [...text.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map(match => match[1]);
check(jsonSame(importsFrom(moduleText), ['/js/arcade/vendor/three.module.min.js']), '3D module', '3D explanation must import only the existing local Three.js module');
check(!/\bimport\s*\(/.test(moduleText) && !/\bimport\s*["']/.test(moduleText), '3D module', 'Unexpected additional dynamic or side-effect import');
const runtimeText = runtimeBuffers[0]?.toString('utf8') || '';
check(/const\s+moduleURL\s*=\s*['"]\/static\/treatment-scroll-3d\.js['"]\s*\+\s*assetQuery/.test(runtimeText), 'scroll runtime', '3D module must inherit the page asset query version');
check(jsonSame([...runtimeText.matchAll(/\bimport\s*\(\s*([^)]*)\)/g)].map(match => match[1].trim()), ['moduleURL']), 'scroll runtime', 'Only the known local 3D module may be dynamically imported');
for (const file of ['three.module.min.js', 'three.core.min.js']) {
  const relative = 'js/arcade/vendor/' + file;
  const full = path.join(root, relative);
  if (!check(fs.existsSync(full), file, 'Local Three.js vendor dependency is missing')) continue;
  const bytes = fs.readFileSync(full), text = bytes.toString('utf8');
  const targets = importsFrom(text);
  check(file === 'three.module.min.js'
    ? targets.length > 0 && targets.every(target => target === './three.core.min.js')
    : targets.length === 0, file, 'Unexpected vendor module import');
  check(!/\bimport\s*\(/.test(text), file, 'Unexpected dynamic vendor import');
  if (mode === 'dist') check(hash(bytes) === hash(fs.readFileSync(path.join(source, relative))), file, 'Built Three.js dependency differs from local source');
}
for (const type of ['css', 'js']) {
  check(versions[type].size === 1, type, 'All treatment pages must use the same versioned asset');
  for (const url of versions[type]) {
    check(/\?v=[a-zA-Z0-9_-]+/.test(url), type, 'Missing asset cache version');
    check(assetVersion && new URL(url, origin).searchParams.get('v') === assetVersion, type, 'Page asset version does not match current JS + CSS + 3D bytes');
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
  fs.writeFileSync(output, JSON.stringify({ passed: !errors.length, checkedAt: new Date().toISOString(), mode, baseline: baseline || null, assetVersion, local3DDependencies: 3, checks: report, errors }, null, 2) + '\n', { flag: 'wx' });
}
if (errors.length) {
  console.error(JSON.stringify({ passed: false, mode, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ passed: true, mode, pages: report.length, preservedImplantFrames: implantFrames.length, baseline: baseline || null, sceneFamilies: scenes.size, assetVersion, local3DDependencies: 3, locales: languages.map(({ folder, lang }) => ({ lang, pages: report.filter(item => new URL(item.path).pathname.startsWith((folder ? '/' + folder : '') + '/treatments/')).length })) }));
}
