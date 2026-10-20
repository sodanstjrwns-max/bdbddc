'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { CLINICAL_PROCESS_KIND, CLINICAL_PROCESS_STATUS, clinicalProcessErrors } = require('./treatment-clinical-process.cjs');
const { processCopyErrors } = require('./treatment-process-journey.cjs');
const DATA_FILE = 'src/data/treatment-motion-display.json';
const LEGACY_KINDS = new Set(['generated-sequence','existing-sequence','clinic-photo-sequence','single-shot-sequence']);
function policyErrors(policy, expectedSlugs) {
  const errors = [];
  if (policy?.version !== 1 || policy?.detailMode !== 'clinical-process-only' || policy?.hubMode !== 'existing-reviewed') errors.push('Invalid treatment motion display policy');
  const slugs = policy?.detailSlugs;
  if (!Array.isArray(slugs) || slugs.length !== 55 || new Set(slugs).size !== slugs.length || slugs.some(slug => typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug))) errors.push('Display policy requires exactly 55 unique treatment slugs');
  if (Array.isArray(slugs) && expectedSlugs && JSON.stringify([...slugs].sort()) !== JSON.stringify([...expectedSlugs].sort())) errors.push('Display policy must cover the exact treatment set');
  return errors;
}
function readMotionDisplayPolicy(siteRoot, expectedSlugs) {
  const policy = JSON.parse(fs.readFileSync(path.join(siteRoot, DATA_FILE), 'utf8'));
  const errors = policyErrors(policy, expectedSlugs);
  if (errors.length) throw Error(errors.join('; '));
  return policy;
}
function motionDisplayDecision(slug, manifest, processCopy, policy) {
  const errors = policyErrors(policy, Object.keys(manifest?.profiles || {}));
  if (errors.length) throw Error(errors.join('; '));
  const key = slug === 'index' ? manifest.hub : manifest.profiles[slug], set = manifest.sets?.[key];
  if (!set) throw Error('Missing configured visual for ' + slug);
  if (slug === 'index') {
    if (!LEGACY_KINDS.has(set.kind) || !['visual-review-passed','process-sample-reviewed'].includes(set.status)) throw Error('Hub requires its existing reviewed visual');
    return {mode:'existing-hub',renderMotion:true,key,set};
  }
  if (!policy.detailSlugs.includes(slug)) throw Error('Treatment is not covered by the display policy: ' + slug);
  const row = processCopy?.rows?.find(item => item.slug === slug);
  if (!row) throw Error('Missing clinical process copy for ' + slug);
  const copyErrors = processCopyErrors({rows:[row], ...(Object.prototype.hasOwnProperty.call(processCopy,'sourceMap') ? {sourceMap:processCopy.sourceMap} : {})});
  if (copyErrors.length) throw Error(copyErrors.join('; '));
  if (set.kind !== CLINICAL_PROCESS_KIND) {
    if (!LEGACY_KINDS.has(set.kind) || set.status === CLINICAL_PROCESS_STATUS) throw Error('Invalid non-clinical visual classification for ' + slug);
    return {mode:'body-only',renderMotion:false,key,set};
  }
  const mediaErrors = clinicalProcessErrors(set);
  if (mediaErrors.length) throw Error(slug + ': ' + mediaErrors.join('; '));
  const rowSHA = crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex');
  if (set.processCopySHA256 !== rowSHA) throw Error('Clinical process row differs from matched media ' + slug);
  return {mode:'clinical-process',renderMotion:true,key,set};
}

function displayDOMErrors(doc, decision) {
  const errors=[];
  if (!decision || typeof decision.renderMotion!=='boolean') return ['Missing validated display decision'];
  const scenes=doc.querySelectorAll('.bd-scroll');
  if (decision.renderMotion) {
    if (scenes.length!==1) errors.push('Enabled motion requires exactly one rendered section');
    if (doc.querySelectorAll('[data-treatment-motion-alias]').length) errors.push('Enabled motion cannot retain a journey alias');
    return errors;
  }
  if (scenes.length || doc.querySelectorAll('.bd-scroll-art,[data-sequence]').length) errors.push('Suppressed legacy motion must not remain in the DOM');
  if (doc.querySelectorAll('link[href*="/static/treatment-scroll.css"],script[src*="/static/treatment-scroll.js"]').length) errors.push('Suppressed detail must not load the dedicated motion runtime');
  if (/<!--\s*bd-treatment-scroll:/.test(doc.toString())) errors.push('Suppressed legacy motion comment markers must be removed');
  const aliases=doc.querySelectorAll('#treatment-in-motion');
  if (aliases.length!==1 || aliases[0].getAttribute('data-treatment-motion-alias')!=='clinical-process' || aliases[0].closest('#tg-journey')!==doc.querySelector('#tg-journey')) errors.push('Legacy deep link must resolve uniquely inside the clinical journey');
  return errors;
}

module.exports = {displayDOMErrors, DATA_FILE, policyErrors, readMotionDisplayPolicy, motionDisplayDecision};
