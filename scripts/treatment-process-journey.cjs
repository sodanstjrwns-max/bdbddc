'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { parse } = require('node-html-parser');
const DATA_FILE = 'src/data/treatment-process-copy.json';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validVisualSpecification(value) {
  // Older planning rows used a single string; production copy carries an explicit scene contract.
  if (typeof value === 'string') return Boolean(value.trim());
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return ['requiredScene','requiredEndpoint','continuity'].every(key => typeof value[key] === 'string' && value[key].trim()) &&
    Array.isArray(value.exclusions) && value.exclusions.length > 0 && value.exclusions.every(item => typeof item === 'string' && item.trim());
}
function validSource(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source) || typeof source.title !== 'string' || !source.title.trim() || typeof source.url !== 'string' || !/^https?:\/\//i.test(source.url) || /[\u0000-\u0020\u007f]/.test(source.url)) return false;
  try { const url = new URL(source.url); return ['http:','https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password; }
  catch { return false; }
}
function hasSourceMap(data) { return Object.prototype.hasOwnProperty.call(data, 'sourceMap'); }
function processSources(row, locale, data) {
  if (!hasSourceMap(data)) return '';
  const heading = {ko:'참고 자료',en:'Sources',ja:'参考資料'}[locale];
  return '<div class="tg-process-sources"><p class="tg-kicker" id="tg-process-sources-title">' + heading + '</p><ul class="tg-sources" aria-labelledby="tg-process-sources-title">' + row.sourceIds.map(id => {
    const source = data.sourceMap[id];
    return '<li><a href="' + escape(source.url) + '" target="_blank" rel="noopener noreferrer">' + escape(source.title) + '</a></li>';
  }).join('') + '</ul></div>';
}
function processCopyErrors(data, expectedSlugs) {
  const errors = [], rows = data?.rows;
  if (!Array.isArray(rows)) return ['Process copy must contain rows'];
  const mapped = hasSourceMap(data), sourceMap = data.sourceMap;
  if (mapped && (!sourceMap || typeof sourceMap !== 'object' || Array.isArray(sourceMap))) errors.push('Process sourceMap must be an object');
  const slugs = rows.map(row => row?.slug);
  if (new Set(slugs).size !== slugs.length || slugs.some(slug => typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug))) errors.push('Process copy slugs must be valid and unique');
  if (expectedSlugs && JSON.stringify([...slugs].sort()) !== JSON.stringify([...expectedSlugs].sort())) errors.push('Process copy must cover the exact expected treatment set');
  for (const row of rows) {
    for (const locale of ['ko','en','ja']) {
      const text = row?.[locale];
      if (!text || !['title','intro'].every(key => typeof text[key] === 'string' && text[key].trim()) || !Array.isArray(text.steps) || text.steps.length !== 4 || text.steps.some(step => !['title','text','label'].every(key => typeof step?.[key] === 'string' && step[key].trim()))) errors.push(row?.slug + ': invalid four-step ' + locale + ' process copy');
      else if (new Set(text.steps.map(step => step.title + '\n' + step.text)).size !== 4) errors.push(row.slug + ': repeated ' + locale + ' process steps');
    }
    if (!Array.isArray(row?.stages) || row.stages.length !== 4 || row.stages.some(stage => !validVisualSpecification(stage?.visualSpecification))) errors.push(row?.slug + ': missing four clinical state descriptions');
    if (!Array.isArray(row?.sourceIds) || !row.sourceIds.length || row.sourceIds.some(id => typeof id !== 'string' || !id.trim())) errors.push(row?.slug + ': missing source references');
    else if (mapped) for (const id of row.sourceIds) {
      if (!sourceMap || !Object.prototype.hasOwnProperty.call(sourceMap, id) || !validSource(sourceMap[id])) errors.push(row.slug + ': unresolved or invalid HTTP(S) source ' + id);
    }
  }
  return errors;
}
function readProcessCopy(siteRoot) {
  const file = path.join(siteRoot, DATA_FILE);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const expected = Object.keys(JSON.parse(fs.readFileSync(path.join(siteRoot, 'src/data/treatment-page-editorial.json'), 'utf8')).profiles);
  const errors = processCopyErrors(data, expected);
  if (errors.length) throw Error(errors.join('; '));
  return data;
}
function processProfile(profile, slug, data) {
  const row = data?.rows.find(item => item.slug === slug);
  return row ? {...profile, ko:row.ko, en:row.en, ja:row.ja} : profile;
}
function syncProcessJourney(html, slug, locale, data) {
  if (slug === 'index' || !data) return html;
  const row = data.rows.find(item => item.slug === slug);
  if (!row) throw Error('Missing clinical process copy for ' + slug);
  const errors = processCopyErrors({rows:[row], ...(hasSourceMap(data) ? {sourceMap:data.sourceMap} : {})});
  if (errors.length) throw Error(errors.join('; '));
  const doc = parse(html, {comment:true}), main = doc.querySelector('main'), text = row[locale];
  if (!main) throw Error('Missing main for clinical process ' + slug);
  let old = main.querySelectorAll('#tg-journey'), legacyId = '';
  if (!old.length && locale === 'ko' && ['implant','invisalign','glownate'].includes(slug)) {
    old = main.querySelectorAll('section#treatmentTimeline'); legacyId = 'treatmentTimeline';
  }
  if (!old.length && locale === 'ko' && slug === 'implant-revision') { old = main.querySelectorAll('section#treatment-path'); legacyId = 'treatment-path'; }
  if (!old.length && locale === 'ko' && slug === 'whitening') old = main.querySelectorAll('section').filter(node => node.querySelector('h2')?.text.trim() === '미백 환자 여정 5단계');
  if (old.length !== 1) throw Error('Expected one replaceable clinical process section for ' + locale + '/' + slug + ', found ' + old.length);
  for(const alias of ['treatmentTimeline','treatment-path']) if(old[0].querySelector('#'+alias)) legacyId=alias;
  const stamp = crypto.createHash('sha256').update(JSON.stringify(text)).digest('hex');
  const alias = legacyId ? '<span id="'+escape(legacyId)+'" aria-hidden="true"></span>' : '';
  const section = '<section class="tg-section tg-journey" id="tg-journey" data-clinical-process="' + escape(slug) + '" data-process-copy-sha256="' + stamp + '">' + alias + '<div class="tg-wrap"><h2>' + escape(text.title) + '</h2><p class="tg-copy">' + escape(text.intro) + '</p><ol class="tg-steps">' + text.steps.map((step,index) => '<li id="tg-process-step-' + (index + 1) + '" data-process-state="step-' + (index + 1) + '"><span class="tg-step-number">0' + (index + 1) + '</span><div><h3>' + escape(step.title) + '</h3><p>' + escape(step.text) + '</p></div></li>').join('') + '</ol>' + processSources(row, locale, data) + '</div></section>';
  const ancestorClasses = new Set();
  for (let ancestor = old[0].parentNode; ancestor; ancestor = ancestor.parentNode) {
    for (const name of (ancestor.getAttribute?.('class') || '').split(/\s+/)) ancestorClasses.add(name);
  }
  const needsStyleScope = !ancestorClasses.has('tg') || !ancestorClasses.has('tg-patient-first');
  old[0].replaceWith(needsStyleScope ? '<div class="tg tg-patient-first" data-process-style-scope="' + escape(slug) + '">' + section + '</div>' : section);
  const canonical=doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  function updateHowTo(value) {
    if(!value || typeof value!=='object') return;
    if(Array.isArray(value)) { value.forEach(updateHowTo); return; }
    const types=Array.isArray(value['@type'])?value['@type']:[value['@type']];
    if(types.includes('HowTo')) {
      value.name=text.title; value.description=text.intro;
      delete value.totalTime; delete value.prepTime; delete value.performTime;
      value.step=text.steps.map((step,index)=>({'@type':'HowToStep',position:index+1,name:step.title,text:step.text,...(canonical?{url:canonical+'#tg-process-step-'+(index+1)}:{})}));
    } else if(types.includes('MedicalProcedure') || types.includes('SurgicalProcedure')) {
      value.howPerformed=text.steps.map(step=>step.title+': '+step.text).join(' ');
      if(typeof text.followup==='string' && text.followup.trim()) value.followup=text.followup.trim();
      else delete value.followup;
    } else Object.values(value).forEach(updateHowTo);
  }
  for(const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    const value=JSON.parse(script.text),before=JSON.stringify(value);updateHowTo(value);
    if(JSON.stringify(value)!==before) script.set_content(JSON.stringify(value).replace(/</g,'\\u003c'));
  }
  return doc.toString();
}
module.exports = { DATA_FILE, processCopyErrors, readProcessCopy, processProfile, syncProcessJourney };
