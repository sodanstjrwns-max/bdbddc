'use strict';

// Checks the published reading experience, not just successful generation.
// Usage: node scripts/check-localized-treatment-guidance.cjs [dist]
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('node-html-parser');

const root = path.resolve(__dirname, '..');
const mode = process.argv[2] || 'source';
if (!['source', 'dist'].includes(mode)) {
  console.error('Usage: node scripts/check-localized-treatment-guidance.cjs [dist]');
  process.exit(1);
}
const base = mode === 'dist' ? path.join(root, 'dist') : root;
const origin = 'https://bdbddc.com';
const languages = [{ locale: 'en', folder: 'en' }, { locale: 'ja', folder: 'jp' }];
const errors = [];
const report = [];
const docs = new Map();
const unique = { title: new Map(), description: new Map(), h1: new Map() };
const norm = value => String(value ?? '').replace(/\s+/gu, ' ').trim();
const check = (ok, label, message) => { if (!ok) errors.push(`${label}: ${message}`); return !!ok; };
const canonicalFor = (folder, slug) => `${origin}${folder ? '/' + folder : ''}/treatments/${slug === 'index' ? '' : slug}`;
const textOf = node => {
  if (!node) return '';
  const clone = node.clone();
  clone.querySelectorAll('script,style,noscript').forEach(n => n.remove());
  return norm(clone.text);
};
function load(file) {
  if (!docs.has(file)) docs.set(file, parse(fs.readFileSync(file, 'utf8')));
  return docs.get(file);
}
function one(doc, selector, label) {
  const found = doc.querySelectorAll(selector);
  check(found.length === 1, label, `${selector} must occur once; found ${found.length}`);
  return found[0];
}
function addUnique(kind, value, label) {
  value = norm(value);
  check(value.length > 0, label, `missing ${kind}`);
  const previous = unique[kind].get(value);
  check(!previous, label, `duplicate ${kind}${previous ? ' shared with ' + previous : ''}`);
  unique[kind].set(value, label);
}
function structuredValues(doc, label) {
  const values = [];
  function visit(value) {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if (value['@type']) values.push(value);
    Object.values(value).forEach(visit);
  }
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try { visit(JSON.parse(script.text)); }
    catch (e) { errors.push(`${label}: invalid JSON-LD (${e.message})`); }
  }
  for (const value of values) {
    const types = [value['@type']].flat();
    for (const type of types) check(!['Review', 'AggregateRating', 'MedicalProcedure', 'HowTo'].includes(type), label, `obsolete or disallowed JSON-LD type ${type}`);
  }
  return values;
}
function validSource(url, label) {
  try {
    const parsed = new URL(url);
    return check(parsed.protocol === 'https:' && !parsed.username && !parsed.password && !!parsed.hostname, label, `invalid HTTPS source ${url}`);
  } catch { return check(false, label, `invalid source URL ${url}`); }
}
function checkLocalLinks(main, label) {
  for (const a of main.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(?:tel|mailto):/i.test(href)) continue;
    let parsed;
    try { parsed = new URL(href, origin + '/'); }
    catch { errors.push(`${label}: invalid link ${href}`); continue; }
    check(['https:', 'http:'].includes(parsed.protocol), label, `unsupported link protocol ${href}`);
    if (parsed.origin !== origin) continue;
    const decoded = decodeURIComponent(parsed.pathname);
    const file = path.resolve(base, '.' + decoded);
    if (!check(file === base || file.startsWith(base + path.sep), label, `local path escapes site ${href}`)) continue;
    const candidates = decoded.endsWith('/') ? [path.join(file, 'index.html')] : [file, file + '.html', path.join(file, 'index.html')];
    const destination = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!check(!!destination, label, `missing local link destination ${href}`)) continue;
    if (parsed.hash && /\.html$/i.test(destination)) {
      const targetId = decodeURIComponent(parsed.hash.slice(1));
      check(load(destination).querySelectorAll('[id]').some(n => n.id === targetId), label, `missing destination anchor ${href}`);
    }
  }
}
function checkPromises(text, label) {
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]?/gu) || [];
  for (const sentence of sentences) {
    const enClaim = /\b(?:100\s*%\s*(?:success|safe|effective)|guaranteed\s+(?:success|results?|cure|pain[- ]free)|(?:completely|totally)\s+(?:risk[- ]free|painless)|(?:always|never)\s+(?:succeeds?|fails?|relapses?)|permanent\s+cure)\b/iu.test(sentence);
    const enNegation = /\b(?:no|not|cannot|can't|do not|does not|without|avoid|reject|isn't|aren't|shouldn't)\b/iu.test(sentence);
    const jaClaim = /(?:100\s*[%％](?:の)?(?:成功|安全)|必ず(?:治る|成功する|治ります|成功します)|絶対(?:に)?(?:安全|治る|再発しない)|完全(?:に)?(?:無痛|治る)|再発(?:を)?完全(?:に)?防)/u.test(sentence);
    const jaNegation = /(?:ではありません|とは限りません|保証しません|できません|できない|とはいえません|言えません|避け|うたい)/u.test(sentence);
    check(!(enClaim && !enNegation) && !(jaClaim && !jaNegation), label, `possible unsupported treatment promise: ${norm(sentence).slice(0, 220)}`);
  }
}
function contentText(p) {
  return [p.story, ...p.patientQuestions.flatMap(q => [q.question, q.answer]), ...Object.values(p.tradeoff),
    ...p.sections.flatMap(s => [s.title, ...s.paragraphs]), ...p.benefits, ...p.limits, ...p.care,
    ...p.faq.flatMap(q => [q.question, q.answer]), ...p.questions].map(norm).join(' ');
}
function measure(text, locale) {
  return locale === 'en' ? (text.match(/\b[A-Za-z]+(?:['’\-][A-Za-z]+)*\b/g) || []).length : text.replace(/\s/gu, '').length;
}
function reciprocalHreflang(doc, folder, slug, label) {
  const expected = { ko: canonicalFor('', slug), en: canonicalFor('en', slug), ja: canonicalFor('jp', slug), 'x-default': canonicalFor('', slug) };
  for (const [lang, href] of Object.entries(expected)) {
    const links = doc.querySelectorAll(`link[rel="alternate"][hreflang="${lang}"]`);
    check(links.length === 1 && links[0].getAttribute('href') === href, label, `hreflang ${lang} must match ${href}`);
  }
  for (const counterpartFolder of ['', 'en', 'jp']) {
    const file = path.join(base, counterpartFolder, 'treatments', slug + '.html');
    if (!check(fs.existsSync(file), label, `missing hreflang counterpart ${counterpartFolder || 'ko'}/${slug}`)) continue;
    const counterpart = load(file);
    const targetLang = folder === 'en' ? 'en' : 'ja';
    const backlink = counterpart.querySelectorAll(`link[rel="alternate"][hreflang="${targetLang}"]`);
    check(backlink.length === 1 && backlink[0].getAttribute('href') === canonicalFor(folder, slug), label, `nonreciprocal hreflang from ${counterpartFolder || 'ko'}/${slug}`);
  }
}

for (const { locale, folder } of languages) {
  const dataFile = path.join(root, 'src/data', `treatment-guidance-${locale}.json`);
  if (!check(fs.existsSync(dataFile), locale, `missing final profile data ${dataFile}`)) continue;
  let data;
  try { data = JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
  catch (e) { errors.push(`${locale}: invalid data JSON (${e.message})`); continue; }
  const profiles = data.profiles;
  if (!check(profiles && typeof profiles === 'object' && !Array.isArray(profiles), locale, 'profiles must be an object')) continue;
  const slugs = Object.keys(profiles);
  check(data.locale === locale, locale, 'locale field mismatch');
  check(slugs.length > 0, locale, 'empty profile set');
  const koProfiles = JSON.parse(fs.readFileSync(path.join(root, 'src/data/treatment-page-editorial.json'), 'utf8')).profiles;
  check(JSON.stringify([...slugs].sort()) === JSON.stringify(Object.keys(koProfiles).sort()), locale, 'profile coverage differs from Korean treatment details');
  const directory = path.join(base, folder, 'treatments');
  if (!check(fs.existsSync(directory), locale, `missing directory ${directory}`)) continue;
  const actual = fs.readdirSync(directory).filter(f => f.endsWith('.html')).sort();
  const expected = [...slugs.map(s => s + '.html'), 'index.html'].sort();
  check(JSON.stringify(actual) === JSON.stringify(expected), locale, `HTML/profile coverage mismatch: missing ${expected.filter(x => !actual.includes(x)).join(', ') || 'none'}; extra ${actual.filter(x => !expected.includes(x)).join(', ') || 'none'}`);
  for (const file of expected) {
    const label = `${folder}/treatments/${file}`;
    const full = path.join(directory, file);
    if (!fs.existsSync(full)) continue;
    const slug = file.slice(0, -5);
    const doc = load(full);
    check(!doc.querySelector('script[src*="/js/treatment-cases.js"]'),label,'legacy case script reintroduces early promotion and untranslated content');
    const title = one(doc, 'title', label);
    const description = one(doc, 'meta[name="description"]', label);
    const h1 = one(doc, 'h1', label);
    const main = one(doc, 'main', label);
    const canonical = one(doc, 'link[rel="canonical"]', label);
    const robots = one(doc, 'meta[name="robots"]', label);
    if (!main || !h1 || !title || !description || !canonical || !robots) continue;
    addUnique('title', title.text, label);
    addUnique('description', description.getAttribute('content'), label);
    addUnique('h1', h1.text, label);
    check(doc.querySelector('html')?.getAttribute('lang') === locale, label, 'HTML language mismatch');
    check(main.getAttribute('lang') === locale, label, 'main language mismatch');
    check(canonical.getAttribute('href') === canonicalFor(folder, slug), label, 'canonical mismatch');
    const robotText = robots.getAttribute('content') || '';
    check(/(?:^|[\s,])index(?:$|[\s,])/i.test(robotText) && !/(?:noindex|none)/i.test(robotText), label, 'must explicitly allow indexing');
    for (const meta of doc.querySelectorAll('meta[name="googlebot"],meta[name="bingbot"],meta[name="Yeti"]')) check(!/(?:noindex|none)/i.test(meta.getAttribute('content') || ''), label, 'bot-specific indexing restriction');
    reciprocalHreflang(doc, folder, slug, label);
    check(main.getAttribute('data-patient-narrative') === '20261014', label, 'patient-first narrative version');
    const ids = doc.querySelectorAll('[id]').map(n => n.id);
    check(ids.length === new Set(ids).size, label, 'duplicate IDs');
    for (const a of main.querySelectorAll('a[href^="#"]')) check(ids.includes(decodeURIComponent(a.getAttribute('href').slice(1))), label, `missing main anchor ${a.getAttribute('href')}`);
    checkLocalLinks(main, label);
    const readable = textOf(main);
    const accessibleText = main.querySelectorAll('[alt],[title],[aria-label]').map(n => ['alt', 'title', 'aria-label'].map(k => n.getAttribute(k) || '').join(' ')).join(' ');
    check(!/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u.test(readable + accessibleText), label, 'Korean text leaked into localized main or accessibility text');
    check(!/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u.test(title.text + description.getAttribute('content')), label, 'Korean text leaked into localized metadata');
    checkPromises(readable, label);
    const schemas = structuredValues(doc, label);
    const types = type => schemas.filter(x => [x['@type']].flat().includes(type));
    if (slug === 'index') {
      const visible = main.querySelectorAll('a[data-treatment]');
      check(visible.length === slugs.length, label, 'hub must visibly link every profile exactly once');
      check(JSON.stringify(visible.map(n => n.getAttribute('data-treatment')).sort()) === JSON.stringify([...slugs].sort()), label, 'hub visible profile set differs from content data');
      const items = types('ItemList');
      check(items.length === 1, label, 'hub must have exactly one ItemList');
      if (items.length === 1) {
        const list = items[0].itemListElement || [];
        check(list.length === visible.length, label, 'ItemList and visible cards differ in count');
        visible.forEach((a, i) => {
          const key = a.getAttribute('data-treatment');
          check(a.getAttribute('href') === `/${folder}/treatments/${key}`, label, `hub link ${key} is not canonical`);
          const item = list[i];
          check(item && item.position === i + 1 && item['@type'] === 'ListItem' && item.url === origin + a.getAttribute('href') && norm(item.name) === norm(a.querySelector('strong')?.text), label, `ItemList card ${i + 1} differs from visible card`);
        });
      }
      check(types('FAQPage').length === 0, label, 'hub must not carry an invisible FAQ');
      report.push({ file: label, kind: 'hub', guides: visible.length, readableCharacters: readable.length });
      continue;
    }
    const p = profiles[slug];
    const mandatoryArrays = ['patientQuestions', 'sections', 'benefits', 'limits', 'care', 'faq', 'questions', 'sources', 'related'];
    if (!mandatoryArrays.every(key => check(Array.isArray(p[key]), label, `profile ${key} must be an array`)) || !check(p.tradeoff && typeof p.tradeoff === 'object', label, 'profile tradeoff missing')) continue;
    check(norm(title.text) === norm(p.seoTitle), label, 'title differs from approved profile');
    check(norm(description.getAttribute('content')) === norm(p.description), label, 'description differs from approved profile');
    check(norm(h1.text).includes(norm(p.primaryKeyword)) && norm(h1.text).includes(norm(p.heroQuestion)), label, 'H1 must retain keyword and patient question');
    check(p.patientQuestions.length === 3 && main.querySelectorAll('.tg-answer').length === 3, label, 'exactly three patient questions and answers required');
    p.patientQuestions.forEach((q, i) => {
      const answer = main.querySelector(`#tg-concern-${i + 1}`);
      check(answer && norm(answer.querySelector('h3')?.text) === norm(q.question) && norm(answer.querySelector('p')?.text) === norm(q.answer), label, `patient answer ${i + 1} differs from profile`);
    });
    const ordered = ['understand', 'balance', 'specific', 'benefits', 'limits', 'journey', 'care', 'cost', 'questions', 'provider'];
    const serialization = main.toString();
    let previous = -1;
    for (const key of ordered) {
      const selector = `#tg-${key}`;
      const node = one(main, selector, label);
      if (!node) continue;
      const position = serialization.indexOf(node.toString());
      check(position > previous, label, `patient reading order breaks at ${selector}`);
      previous = position;
    }
    check(main.querySelectorAll('#tg-balance .is-gain').length === 1 && main.querySelectorAll('#tg-balance .is-burden').length === 1, label, 'benefits and burdens must be visible side by side');
    check(p.sections.length >= 3 && main.querySelectorAll('#tg-specific .tg-chapter').length === p.sections.length, label, 'missing topic-specific chapters');
    p.sections.forEach((chapter, i) => {
      check(Array.isArray(chapter.paragraphs) && chapter.paragraphs.length > 0, label, `empty profile chapter ${i + 1}`);
      const visible = main.querySelectorAll('#tg-specific .tg-chapter')[i];
      check(visible && norm(visible.querySelector('h3')?.text) === norm(chapter.title), label, `chapter ${i + 1} title mismatch`);
      if (Array.isArray(chapter.paragraphs)) for (const paragraph of chapter.paragraphs) check(norm(paragraph).length > 0 && norm(visible?.text).includes(norm(paragraph)), label, `chapter ${i + 1} paragraph missing`);
    });
    for (const key of ['benefits', 'limits', 'care']) {
      check(p[key].length >= 2, label, `${key} needs substantive content`);
      for (const paragraph of p[key]) check(norm(main.querySelector(`#tg-${key}`)?.text).includes(norm(paragraph)), label, `${key} paragraph missing`);
    }
    check(main.querySelector('.tg-hero')?.querySelectorAll('a[href*="reservation"],a[href^="tel:"]:not([href="tel:119"])').length === 0, label, 'hero must prioritize reading before booking');
    const faqSchemas = types('FAQPage');
    check(faqSchemas.length === 1, label, 'exactly one FAQPage required');
    const visibleFaq = main.querySelectorAll('#tg-questions details').map(n => ({ question: norm(n.querySelector('summary')?.text), answer: norm(n.querySelectorAll('p').map(x => x.text).join(' ')) }));
    check(visibleFaq.length >= 4 && visibleFaq.length === p.faq.length && main.querySelectorAll('details').length === visibleFaq.length, label, 'visible FAQ count mismatch');
    check(new Set(visibleFaq.map(x => x.question)).size === visibleFaq.length, label, 'duplicate visible FAQ questions');
    const schemaFaq = faqSchemas[0]?.mainEntity || [];
    check(schemaFaq.length === visibleFaq.length, label, 'schema and visible FAQ counts differ');
    visibleFaq.forEach((q, i) => {
      check(q.question === norm(p.faq[i]?.question) && q.answer === norm(p.faq[i]?.answer), label, `visible FAQ ${i + 1} differs from profile`);
      const structured = schemaFaq[i];
      check(structured?.['@type'] === 'Question' && norm(structured.name) === q.question && structured.acceptedAnswer?.['@type'] === 'Answer' && norm(structured.acceptedAnswer.text) === q.answer, label, `schema FAQ ${i + 1} differs from visible text`);
    });
    const sourceLinks = main.querySelectorAll('#tg-sources .tg-sources a');
    check(p.sources.length > 0 && sourceLinks.length === p.sources.length, label, 'source links missing or duplicated');
    p.sources.forEach((source, i) => {
      validSource(source.url, label);
      check(norm(source.title).length > 0 && sourceLinks[i]?.getAttribute('href') === source.url && norm(sourceLinks[i]?.text).startsWith(norm(source.title)), label, `visible source ${i + 1} differs from profile`);
    });
    for (const related of p.related) {
      check(!!profiles[related] && related !== slug, label, `unknown or self-related treatment ${related}`);
      check(main.querySelectorAll('#tg-next a').some(a => a.getAttribute('href') === `/${folder}/treatments/${related}`), label, `missing related treatment link ${related}`);
    }
    let individual = '';
    try { individual = contentText(p); }
    catch (e) { errors.push(`${label}: malformed profile body (${e.message})`); }
    const threshold = locale === 'en' ? 450 : 1500;
    const profileMeasure = measure(individual, locale), renderedMeasure = measure(readable, locale);
    check(profileMeasure >= threshold, label, `individual content is too short (${profileMeasure}; minimum ${threshold} ${locale === 'en' ? 'words' : 'characters'})`);
    check(renderedMeasure >= threshold, label, `rendered main is too short (${renderedMeasure})`);
    report.push({ file: label, kind: 'detail', profileMeasure, renderedMeasure, faq: visibleFaq.length, sources: sourceLinks.length });
  }
}
const summary = {
  passed: errors.length === 0,
  mode,
  pages: report.length,
  locales: languages.map(({ locale, folder }) => {
    const rows = report.filter(r => r.file.startsWith(folder + '/'));
    const details = rows.filter(r => r.kind === 'detail');
    return { locale, pages: rows.length, details: details.length, minProfileMeasure: details.length ? Math.min(...details.map(r => r.profileMeasure)) : null, minRenderedMeasure: details.length ? Math.min(...details.map(r => r.renderedMeasure)) : null };
  }),
  errors,
  report
};
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
