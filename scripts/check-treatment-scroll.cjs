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

const { inject, singleShotErrors, singleShotTimeline, validateSourceRangeEvidence, validateChunkBytes, runtimeFileNames, SINGLE_SHOT_KIND, SINGLE_SHOT_STATUS, CLINICAL_PROCESS_KIND, CLINICAL_PROCESS_STATUS, clinicalProcessErrors, validateClinicalProcessEvidence, validateClinicalRepresentative } = require('./treatment-scroll.cjs');
const {readProcessCopy} = require('./treatment-process-journey.cjs');
const {readMotionDisplayPolicy,motionDisplayDecision,displayDOMErrors} = require('./treatment-motion-display.cjs');
const processCopy = readProcessCopy(source);
const editorialImages = JSON.parse(fs.readFileSync(path.join(source,'src/data/treatment-editorial-images.json'),'utf8')).images;
const scrollData = JSON.parse(fs.readFileSync(path.join(source, 'src/data/treatment-scroll.json'), 'utf8'));
const motionManifestRelative = 'src/data/treatment-motion-assets.json';
const motionManifestBytes = fs.readFileSync(path.join(source, motionManifestRelative));
const motionManifest = JSON.parse(motionManifestBytes.toString('utf8'));
check(motionManifest.version === 1, 'motion manifest', 'Unsupported manifest version');
check(motionManifest.profiles && typeof motionManifest.profiles === 'object' && !Array.isArray(motionManifest.profiles), 'motion manifest', 'Profile map must be an object');
check(motionManifest.sets && typeof motionManifest.sets === 'object' && !Array.isArray(motionManifest.sets), 'motion manifest', 'Visual sets must be an object');
const motionProfiles = motionManifest.profiles || {}, motionSets = motionManifest.sets || {};
const expectedProfiles = Object.keys(scrollData.profiles).sort();
const displayPolicy=readMotionDisplayPolicy(source,expectedProfiles);
const displayDecisions=new Map();
for(const slug of [...expectedProfiles,'index']) {
  try { displayDecisions.set(slug,motionDisplayDecision(slug,motionManifest,processCopy,displayPolicy)); }
  catch(error) { check(false,slug,'Display policy: '+error.message); }
}
const suppressedDetailMotionProfiles=[...displayDecisions.values()].filter(d=>d.mode==='body-only').length;
const displayedClinicalProcessProfiles=[...displayDecisions.values()].filter(d=>d.mode==='clinical-process').length;
check(expectedProfiles.length === 55, 'motion coverage', 'Expected exactly 55 reviewed treatment content profiles');
check(jsonSame(Object.keys(motionProfiles).sort(), expectedProfiles), 'motion coverage', 'Motion mapping must cover the exact 55 treatment slugs, with no missing or extra slug');
check(typeof motionManifest.hub === 'string' && !!motionSets[motionManifest.hub], 'motion hub', 'Hub must reference an existing reviewed visual set');
const allowedKinds = new Set(['generated-sequence', 'existing-sequence', 'clinic-photo-sequence', SINGLE_SHOT_KIND, CLINICAL_PROCESS_KIND]);
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
function checkSequence(config, label, set, size) {
  if ([SINGLE_SHOT_KIND,CLINICAL_PROCESS_KIND].includes(set?.kind)) {
    const timeline = set.kind === CLINICAL_PROCESS_KIND ? {valid:!clinicalProcessErrors(set).length,frameCount:set.timeline?.frameCount} : singleShotTimeline(set.source), frameCount = timeline.frameCount, framesPerChunk = set.kind === CLINICAL_PROCESS_KIND ? 16 : 8, chunkCount = frameCount/framesPerChunk;
    if (!timeline.valid || !config || config.format !== 'webp-chunks-v1' || config.count !== frameCount || config.chunkCount !== chunkCount || config.framesPerChunk !== framesPerChunk || config.start !== 1 || config.pad !== 4) return;
    const receipts = set.technicalOutput?.packaging?.[size]?.chunks;
    if (!Array.isArray(receipts) || receipts.length !== chunkCount) return;
    for (let index = 0; index < chunkCount; index++) {
      const file = resolveVisualAsset(frameUrl(config, index + 1), label);
      if (!file) continue;
      try { validateChunkBytes(fs.readFileSync(file), receipts[index], {framesPerChunk}); }
      catch (error) { check(false, label + ' chunk ' + (index + 1), error.message); }
    }
    return;
  }
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
for (const [slug, setKey] of Object.entries(motionProfiles)) {
  const set = motionSets[setKey];
  check(typeof setKey === 'string' && !!set, slug, 'Treatment references a missing visual set');
  if (!set) continue;
  check(set.desktop?.count > 1 && set.mobile?.count > 1, slug, 'Treatment detail needs source movement on desktop and mobile');
  check(!set.cameraPan && !set.motion && !set.component, slug, 'A camera pan or synthetic cutout transform cannot stand in for treatment motion');
}
const referencedSets = new Set([...Object.values(motionProfiles), motionManifest.hub]);
for (const setKey of referencedSets) {
  const set = motionSets[setKey];
  if (!set) continue;
  check((set.kind === SINGLE_SHOT_KIND ? [SINGLE_SHOT_STATUS] : set.kind === CLINICAL_PROCESS_KIND ? [CLINICAL_PROCESS_STATUS] : ['visual-review-passed', 'process-sample-reviewed']).includes(set.status), setKey, 'Visual set is missing a recorded review status');
  if (set.kind === SINGLE_SHOT_KIND) {
    for (const error of singleShotErrors(set)) check(false, setKey, error);
    try { validateSourceRangeEvidence(set); } catch(error) { check(false,setKey,error.message); }
    const record = set.review?.record;
    try {
      check(typeof record === 'string' && path.isAbsolute(record) && path.resolve(record).startsWith('/Volumes/MSJ_WORK/Workspaces/') && fs.realpathSync(record) === path.resolve(record) && fs.statSync(record).isFile() && fs.statSync(record).size > 0, setKey, 'Saved review evidence is missing or outside a real SSD path');
      check(hash(fs.readFileSync(record)) === set.review?.recordSHA256, setKey, 'Saved review evidence SHA differs from the accepted record');
    } catch (_) { check(false, setKey, 'Saved review evidence file is unavailable'); }
    const posterFile = resolveVisualAsset(set.poster, setKey + ' poster');
    if (posterFile) check(fs.statSync(posterFile).size === set.technicalOutput?.poster?.bytes && hash(fs.readFileSync(posterFile)) === set.technicalOutput?.poster?.sha256, setKey, 'Poster bytes differ from the prepared receipt');
  }
  if (set.kind === CLINICAL_PROCESS_KIND) {
    for (const error of clinicalProcessErrors(set)) check(false,setKey,error);
    try { validateClinicalProcessEvidence(set); } catch(error) { check(false,setKey,error.message); }
    const posterFile=resolveVisualAsset(set.poster,setKey+' shared representative');
    if(posterFile) check(fs.statSync(posterFile).size===set.technicalOutput?.poster?.bytes && hash(fs.readFileSync(posterFile))===set.technicalOutput?.poster?.sha256,setKey,'Shared representative bytes differ');
  }
  check(allowedKinds.has(set.kind), setKey, 'Unsupported visual sequence kind');
  check(typeof set.cameraPan === 'boolean', setKey, 'Explicit camera motion policy is required');
  if (set.cameraPan) check(set.desktop?.count === 1 && set.mobile?.count === 1, setKey, 'Camera-only stills must use exactly one reviewed image per size');
  if (set.kind !== 'existing-sequence' && set.kind !== SINGLE_SHOT_KIND && set.kind !== CLINICAL_PROCESS_KIND && !set.processStages) check(!!set.motion, setKey, 'Every generated/photo visual must define an explicit visible camera path');
  if (set.motion !== undefined) {
    const m = set.motion;
    check(m && typeof m === 'object' && !Array.isArray(m), setKey, 'Motion must be an object');
    for (const [field, min, max] of [['scales', .65, 1], ['x', -1, 1], ['y', -1, 1]]) {
      check(Array.isArray(m?.[field]) && m[field].length === 4 && m[field].every(value => Number.isFinite(value) && value >= min && value <= max), setKey, 'Motion requires four bounded ' + field + ' values');
    }
    // A zoom range is not evidence of treatment-specific motion or visual quality.
  }
  if (set.component !== undefined) {
    const c = set.component;
    check(c && c.type === 'rigid-lift', setKey, 'Only reviewed rigid separation is supported');
    const polygonValid = Array.isArray(c?.polygon) && c.polygon.length >= 3 && c.polygon.length <= 64 && c.polygon.every(point => Array.isArray(point) && point.length === 2 && point.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
    const offsetsValid = Array.isArray(c?.offsets) && c.offsets.length === 4 && c.offsets.every(value => Number.isFinite(value) && value >= -.1 && value <= 0);
    check(polygonValid, setKey, 'Component polygon must be bounded normalized points');
    check(offsetsValid, setKey, 'Four component offsets must preserve the original or greater separation');
    if (polygonValid && offsetsValid) check(c.polygon.every(point => point[1] + Math.min(...c.offsets) >= 0), setKey, 'Raised component would leave source containment bounds');
    check(Array.isArray(c?.background) && c.background.length === 2 && c.background.every(color => /^#[0-9a-f]{6}$/i.test(color)), setKey, 'Component needs two explicit neutral background colors');
    check(typeof c?.note === 'string' && c.note.length >= 20, setKey, 'Component needs an explanatory provenance note');
  }

  if (set.processStages !== undefined) {
    const stages = set.processStages;
    check(Array.isArray(stages) && stages.length === 4 && stages.every((stage, i) =>
      stage && Number.isInteger(stage.start) && Number.isInteger(stage.end) && stage.start >= 0 &&
      stage.end >= stage.start && stage.end < Math.min(set.desktop?.count || 0, set.mobile?.count || 0) &&
      (!i || stage.start > stages[i - 1].end)), setKey, 'Invalid process chapter frame ranges');
    check(!set.component && !set.cameraPan && !set.motion, setKey, 'Process chapters must show source movement without simulated camera or component transforms');
  }
  check(set.source && typeof set.source === 'object' && Object.keys(set.source).length > 0, setKey, 'Visual source/provenance record is missing');
  const anchors = set.anchors;
  check(Array.isArray(anchors) && anchors.length === 4 && anchors.every(Number.isFinite) && anchors[0] === 0 && anchors[3] === 1 && anchors.every((value, index) => value >= 0 && value <= 1 && (!index || value > anchors[index - 1])), setKey, 'Exactly four ordered progress anchors from 0 to 1 are required');
  resolveVisualAsset(set.poster, setKey + ' poster');
  checkSequence(set.desktop, setKey + ' desktop', set, 'desktop');
  checkSequence(set.mobile, setKey + ' mobile', set, 'mobile');
  visualSetReport.push({ key: setKey, kind: set.kind, status: set.status, poster: set.poster, desktopFrames: set.desktop?.count || 0, mobileFrames: set.mobile?.count || 0, explicitCameraMotion: !!set.motion, rigidComponent: !!set.component });
}
const singleShotProfiles = Object.entries(motionProfiles).filter(([, key]) => motionSets[key]?.kind === SINGLE_SHOT_KIND);
for (const [slug,key] of singleShotProfiles) check(['desktop','mobile'].every(size => typeof motionSets[key][size]?.pattern === 'string' && motionSets[key][size].pattern.startsWith('/static/treatment-motion/new-continuous-chunks/' + slug + '/')), slug, 'Single-shot asset namespace belongs to a different treatment');
check(new Set(singleShotProfiles.map(([,key]) => key)).size === singleShotProfiles.length, 'single-shot coverage', 'Each replacement treatment must have its own new visual set');
for (const media of ['image','video']) {
  for (const field of ['sha256','sourceJob']) {
    const values = singleShotProfiles.map(([,key]) => motionSets[key]?.source?.[media]?.[field]);
    check(new Set(values).size === values.length, 'single-shot sources', 'Replacement treatments must not share ' + media + ' ' + field);
  }
}
const clinicalProcessProfiles=Object.entries(motionProfiles).filter(([,key])=>motionSets[key]?.kind===CLINICAL_PROCESS_KIND);
const processOriginals=[];
for(const [slug,key] of clinicalProcessProfiles) {
  const set=motionSets[key], row=processCopy?.rows.find(row=>row.slug===slug);
  check(!!row && hash(JSON.stringify(row))===set.processCopySHA256,slug,'Clinical media must match the exact installed four-state process row');
  check(validateClinicalRepresentative(set,editorialImages[slug]),slug,'Poster/hero/OG must reference the same approved representative image');
  check(['desktop','mobile'].every(size=>set[size]?.pattern?.startsWith('/static/treatment-motion/clinical-process/'+slug+'/')),slug,'Clinical asset namespace belongs to another treatment');
  processOriginals.push(...(set.source?.keyframes||[]),...(set.source?.transitions||[]));
}
for(const field of ['sourceJob','sha256']) check(new Set(processOriginals.map(asset=>asset[field])).size===processOriginals.length,'clinical process originals','Clinical treatment sets must not reuse original '+field);

function checkClinicalBody(doc, main, slug, lang, relative, expectedUrl) {
  if (slug === 'index') return;
  const row = processCopy?.rows.find(item => item.slug === slug), text = row?.[lang];
  check(!!text, relative, 'Clinical process copy is required even without motion');
  const representative=editorialImages[slug], imageURL=representative ? origin+representative.src : null;
  check(!!representative,relative,'Representative image record is missing');
  const absolute=value=>{try{return new URL(value,origin).href;}catch{return null;}};
  check(absolute(main.querySelector('img')?.getAttribute('src'))===imageURL,relative,'First body image differs from the representative');
  check(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')===imageURL,relative,'OG image differs from representative');
  check(doc.querySelector('meta[property="og:image:width"]')?.getAttribute('content')==='1200' && doc.querySelector('meta[property="og:image:height"]')?.getAttribute('content')==='630',relative,'Representative OG dimensions must remain 1200x630');
  const journey = one(main, '#tg-journey', relative);
  if (!journey || !text) return;
  check(journey.getAttribute('data-clinical-process') === slug && journey.getAttribute('data-process-copy-sha256') === hash(JSON.stringify(text)), relative, 'Clinical body must bind the exact installed locale copy');
  check(norm(journey.querySelector('h2')?.text) === norm(text.title), relative, 'Clinical body heading differs from copy');
  check(norm(journey.querySelector('.tg-copy')?.text) === norm(text.intro), relative, 'Clinical body introduction differs from copy');
  const steps = journey.querySelectorAll('ol.tg-steps > li');
  check(steps.length === 4, relative, 'Clinical body requires four visible treatment steps');
  steps.forEach((step,index) => {
    check(step.id === 'tg-process-step-' + (index+1), relative, 'Clinical step anchor differs');
    check(norm(step.querySelector('h3')?.text) === norm(text.steps[index]?.title) && norm(step.querySelector('p')?.text) === norm(text.steps[index]?.text), relative, 'Clinical body step differs from copy');
    check(!step.hasAttribute('hidden') && step.getAttribute('aria-hidden') !== 'true', relative, 'Clinical body must remain visible without motion');
  });
  if (processCopy.sourceMap) check(jsonSame(journey.querySelectorAll('.tg-process-sources a').map(a => a.getAttribute('href')), row.sourceIds.map(id => processCopy.sourceMap[id].url)), relative, 'Clinical body sources differ from approved source map');
  function inspectSchema(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(inspectSchema); return; }
    const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (types.includes('MedicalWebPage') && value.url===expectedUrl) {
      check(value.image===imageURL && value.primaryImageOfPage?.url===imageURL,relative,'Clinical page schema representative differs from visible image');
    }
    if (types.includes('HowTo')) {
      check(value.name === text.title && value.description === text.intro, relative, 'HowTo title/description differs from visible clinical body');
      check(!['totalTime','prepTime','performTime'].some(key => Object.prototype.hasOwnProperty.call(value,key)), relative, 'HowTo must not retain unsupported duration');
      const expected = text.steps.map((step,index) => ({'@type':'HowToStep',position:index+1,name:step.title,text:step.text,url:expectedUrl+'#tg-process-step-'+(index+1)}));
      check(jsonSame(value.step, expected), relative, 'HowTo steps differ from visible clinical body');
    } else if (types.includes('MedicalProcedure') || types.includes('SurgicalProcedure')) {
      check(value.howPerformed === text.steps.map(step => step.title+': '+step.text).join(' '), relative, 'Procedure sequence differs from visible clinical body');
      check(typeof text.followup === 'string' && text.followup.trim() ? value.followup === text.followup.trim() : !Object.prototype.hasOwnProperty.call(value,'followup'), relative, 'Procedure followup differs from installed copy');
    } else Object.values(value).forEach(inspectSchema);
  }
  try { doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => inspectSchema(JSON.parse(script.text))); }
  catch (error) { check(false, relative, 'Invalid clinical structured data: '+error.message); }
}
function checkPreservationAndGeneration(doc, html, profile, lang, slug, relative) {
  try {
    preservation(doc);
    if (baseline) {
      const old = oldHtml(relative), before = preservation(parse(old)), after = preservation(doc);
      const markers = text => text.match(/<!--\s*treatment-(?:patient|choice)[\s\S]*?-->/g) || [];
      check(jsonSame(markers(old),markers(html)), relative, 'Protected patient/choice markers changed');
      for (const field of Object.keys(before)) check(jsonSame(before[field],after[field]), relative, 'Existing '+field+' changed outside the scroll enhancement');
    }
    const regenerated = inject(html, profile, lang, slug, 'idempotence-audit');
    check(regenerated === inject(regenerated, profile, lang, slug, 'idempotence-audit'), relative, 'Repeated generation must not duplicate or alter the page');
  } catch (error) { check(false, relative, 'Preservation/generation audit failed: '+error.message); }
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
    check(norm(doc.querySelector('title')?.text).length>5,relative,'Missing document title');
    check(norm(doc.querySelector('meta[name="description"]')?.getAttribute('content')).length>10,relative,'Missing page description');
    check(!doc.querySelectorAll('meta[name="robots"],meta[name="googlebot"],meta[name="bingbot"]').some(meta=>/noindex|none/i.test(meta.getAttribute('content')||'')),relative,'Treatment page must remain indexable');
    const ids = doc.querySelectorAll('[id]').map(node => node.id);
    check(ids.length === new Set(ids).size, relative, 'Duplicate document IDs');
    const decision=displayDecisions.get(slug);
    if (!main || !decision) continue;
    checkClinicalBody(doc,main,slug,lang,relative,expectedUrl);
    for(const error of displayDOMErrors(doc,decision)) check(false,relative,error);
    if (!decision.renderMotion) {
      checkPreservationAndGeneration(doc,html,scrollData.profiles[slug],lang,slug,relative);
      report.push({path:expectedUrl,mode:decision.mode,scene:null,variant:slug,visualSet:null,clinicalSteps:4,motionDisplayed:false});
      continue;
    }
    const scene = one(doc, '.bd-scroll', relative);
    if (!scene) continue;
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
    if ([SINGLE_SHOT_KIND,CLINICAL_PROCESS_KIND].includes(visualSet?.kind)) check(poster?.getAttribute('width') === '1200' && poster?.getAttribute('height') === '630', relative, 'Single-shot poster dimensions must match the actual JPEG');
    try {
      const config = JSON.parse(art?.getAttribute('data-sequence') || 'null');
      check(config && typeof config === 'object', relative, 'Missing parseable sequence configuration');
      for (const field of ['poster', 'desktop', 'mobile', 'anchors', 'kind', 'cameraPan', 'motion', 'component', 'processStages', 'timeline']) check(jsonSame(config?.[field], visualSet?.[field]), relative, 'Embedded sequence ' + field + ' differs from the reviewed manifest');
      if ([SINGLE_SHOT_KIND,CLINICAL_PROCESS_KIND].includes(visualSet?.kind)) check(config?.posterWidth === 1200 && config?.posterHeight === 630, relative, 'Embedded poster dimensions differ from the prepared asset');
    } catch (error) { check(false, relative, 'Invalid data-sequence JSON: ' + error.message); }
    if (slug !== 'index' && processCopy) {
      const row=processCopy.rows.find(row=>row.slug===slug), text=row?.[lang], journey=one(main,'#tg-journey',relative);
      check(journey?.getAttribute('data-clinical-process')===slug && journey?.getAttribute('data-process-copy-sha256')===hash(JSON.stringify(text)),relative,'Clinical process body does not match installed copy');
      if(visualSet?.kind===CLINICAL_PROCESS_KIND) {
        check(norm(heading?.text)===norm(text?.title),relative,'Scroll title differs from the matched clinical process');
        steps.forEach((step,i)=>check(norm(step.querySelector('h3')?.text)===norm(text?.steps[i]?.title) && norm(step.querySelector('p')?.text)===norm(text?.steps[i]?.text),relative,'Scroll action text differs from the matched clinical process'));
        check(main.querySelector('img')?.getAttribute('src')===visualSet.poster,relative,'First body image differs from the process representative');
        check(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')===origin+visualSet.poster,relative,'OG image differs from the process representative');
      }
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
    const profile = scrollData.profiles[slug] || { scene: family, variant: 'hub', [lang]: { title: heading.text, intro: scene.querySelector('.bd-scroll-intro > p:not(.bd-scroll-eyebrow)').text, steps: steps.map(step => ({ title: step.querySelector('h3').text, text: step.querySelector('p').text, label: step.getAttribute('data-label') })) } };
    checkPreservationAndGeneration(doc,html,profile,lang,slug,relative);
    report.push({ path: expectedUrl, mode:decision.mode, scene: family, variant, visualSet: visualSetKey, steps: steps.length,motionDisplayed:true });
  }
}
check(report.length === 168, 'coverage', 'Expected all 165 details plus 3 treatment hubs');
check(new Set(Object.values(scrollData.profiles).map(profile=>profile.scene)).size >= 8, 'coverage', 'Configured treatment families need distinct explanatory scenes');
const assetDirectory = path.join(root, mode === 'source' ? 'public/static' : 'static');
const runtimeFiles = runtimeFileNames(source);
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
const sequenceImports = importsFrom(moduleText);
const chunkHelpers = runtimeFiles.slice(4);
const expectedChunkImports = chunkHelpers.map(name => './' + name);
check(sequenceImports.length <= 1 && jsonSame(sequenceImports, expectedChunkImports) && !/\bimport\s*\(/.test(moduleText) && !/\bimport\s*["']/.test(moduleText), 'sequence module', 'Only one content-addressed local chunk helper import is permitted');
if (singleShotProfiles.length || clinicalProcessProfiles.length) check(chunkHelpers.length === 1, 'sequence module', 'Single-shot chunks require the reviewed local chunk decoder');
for (let index = 4; index < runtimeFiles.length; index++) {
  const name = runtimeFiles[index], bytes = runtimeBuffers[index];
  if (!bytes) continue;
  check(name === 'treatment-frame-chunks.' + hash(bytes).slice(0,12) + '.js', name, 'Chunk helper filename does not match its content hash');
  const helperText = bytes.toString('utf8');
  check(importsFrom(helperText).length === 0 && !/\bimport\s*(?:\(|["'])/.test(helperText), name, 'Chunk helper must be standalone without external imports');
  check(bytes.length < 100 * 1024, name, 'Chunk helper unexpectedly large');
}
check(!/three\.module|WebGLRenderer|treatment-scroll-3d/.test(moduleText), 'sequence module', 'Old procedural Three.js rendering must not remain in the photoreal module');
const runtimeText = runtimeBuffers[0]?.toString('utf8') || '';
check(/const\s+sequenceURL\s*=\s*['"]\/static\/treatment-scroll-sequence\.js['"]\s*\+\s*assetQuery/.test(runtimeText), 'scroll runtime', 'Sequence module must inherit the page asset query version');
check(/const\s+compositorURL\s*=\s*['"]\/static\/treatment-scroll-compositor\.js['"]\s*\+\s*assetQuery/.test(runtimeText), 'scroll runtime', 'Compositor must inherit the page asset query version');
check(jsonSame([...runtimeText.matchAll(/\bimport\s*\(\s*([^)]*)\)/g)].map(match => match[1].trim()), ['sequenceURL', 'compositorURL']), 'scroll runtime', 'Only the known local sequence and compositor modules may be dynamically imported');
const compositorText = runtimeBuffers[3]?.toString('utf8') || '';
check(importsFrom(compositorText).length === 0 && !/\bimport\s*(?:\(|["'])/.test(compositorText), 'compositor module', 'Compositor must have no external or additional imports');
check(!/three\.module|WebGLRenderer|treatment-scroll-3d/.test(compositorText), 'compositor module', 'Old procedural rendering must not be loaded');
check(importsFrom(runtimeText).length === 0 && !/\bimport\s*["']/.test(runtimeText), 'scroll runtime', 'Unexpected static runtime module import');
check(!/treatment-scroll-3d|three\.module/.test(runtimeText), 'scroll runtime', 'Old procedural Three.js module must not be loaded');
for (const type of ['css', 'js']) {
  check(versions[type].size === 1, type, 'All rendered motion pages must use the same versioned asset');
  for (const url of versions[type]) {
    check(/\?v=[a-zA-Z0-9_-]+/.test(url), type, 'Missing asset cache version');
    check(assetVersion && new URL(url, origin).searchParams.get('v') === assetVersion, type, 'Page asset version does not match current JS + CSS + sequence + compositor + manifest bytes');
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
  fs.writeFileSync(output, JSON.stringify({ scope: 'delivery-integrity', qualityAssessed: false, passed: !errors.length, checkedAt: new Date().toISOString(), mode, baseline: baseline || null, assetVersion, suppressedDetailMotionProfiles, displayedClinicalProcessProfiles, renderedMotionPages:report.filter(item=>item.motionDisplayed).length, singleShotProfiles: singleShotProfiles.length, clinicalProcessProfiles: clinicalProcessProfiles.length, clinicalProcessBodies: processCopy ? processCopy.rows.length : 0, visualSets: visualSetReport, visualAssets: assetExistenceCache.size, checks: report, errors }, null, 2) + '\n', { flag: 'wx' });
}
if (errors.length) {
  console.error(JSON.stringify({ scope: 'delivery-integrity', qualityAssessed: false, passed: false, mode, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ scope: 'delivery-integrity', qualityAssessed: false, passed: true, mode, pages: report.length, preservedImplantFrames: implantFrames.length, baseline: baseline || null, sceneFamilies: scenes.size, assetVersion, suppressedDetailMotionProfiles, displayedClinicalProcessProfiles, renderedMotionPages:report.filter(item=>item.motionDisplayed).length, singleShotProfiles: singleShotProfiles.length, clinicalProcessProfiles: clinicalProcessProfiles.length, clinicalProcessBodies: processCopy ? processCopy.rows.length : 0, visualSets: visualSetReport.length, visualAssets: assetExistenceCache.size, locales: languages.map(({ folder, lang }) => ({ lang, pages: report.filter(item => new URL(item.path).pathname.startsWith((folder ? '/' + folder : '') + '/treatments/')).length })) }));
}
