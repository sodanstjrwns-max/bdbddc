import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'node-html-parser'

const RealDate = Date
let clock = RealDate.now()
globalThis.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [clock])) }
  static now() { return clock }
}
const temp = await mkdtemp(join(tmpdir(), 'bd-notes-check-'))
try {
  await build({ stdin: { contents: `export { default as app } from './src/index'; export { patientNotes, visiblePatientNotes } from './src/data/patient-notes';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', target: 'node22', outfile: join(temp, 'test.mjs'), logLevel: 'error' })
  const { app, patientNotes, visiblePatientNotes } = await import(pathToFileURL(join(temp, 'test.mjs')))
  const request = (path, host = 'https://bdbddc.com') => app.request(host + path, {}, {})
  const originalCount = patientNotes.length
  const dates = patientNotes.filter(n => n.publishedAt).map(n => Date.parse(n.publishedAt))
  assert.ok(dates.every(Number.isFinite), 'Valid publication times')
  assert.equal(dates.length, originalCount, 'Ready notes have publication times')
  clock = Math.max(RealDate.now(), ...dates) + 1000
  const slots = new Map()
  for (const note of patientNotes) {
    const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new RealDate(note.publishedAt))
    slots.set(day, (slots.get(day) || 0) + 1)
  }
  for (const [day, count] of slots) assert.ok(count <= 2, 'At most two new notes per KST day: ' + day)
  const slugs = patientNotes.map(n => n.slug)
  assert.equal(new Set(slugs).size, originalCount)
  for (const note of patientNotes) {
    const response = await request('/concerns/' + note.slug)
    assert.equal(response.status, 200, note.slug)
    const html = await response.text()
    const dom = parse(html)
    assert.equal(dom.querySelectorAll('h1').length, 1)
    assert.equal(dom.querySelector('h1').text, note.title)
    assert.equal(dom.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://bdbddc.com/concerns/' + note.slug)
    assert.match(dom.querySelector('meta[name="robots"]').getAttribute('content'), /^index,/)
    assert.ok(dom.querySelector('.pn-local').text.includes(note.region))
    assert.ok(dom.querySelector('.pn-local').text.includes(note.topic))
    assert.ok(dom.querySelector('.pn-situation').text.includes(note.region))
    assert.ok(dom.querySelectorAll('.pn-sources a').length)
    const schema = JSON.parse(dom.querySelector('script[type="application/ld+json"]').text)
    const page = schema['@graph'].find(s => s['@type'] === 'MedicalWebPage')
    assert.equal(page.spatialCoverage.name, note.region)
    assert.equal(page.publisher.address.addressLocality, '천안시')
    assert.equal(page.reviewedBy, undefined)
    assert.ok(html.includes(note.answer), 'Core answer is server-rendered')
    assert.ok(dom.querySelector('.site-header .site-logo'), 'Uses the clinic header')
    assert.ok(dom.querySelector('#mobileNav'), 'Shared mobile navigation exists')
    assert.ok(dom.querySelector('.footer .business-info').text.includes('228-11-02956'))
    assert.ok(dom.querySelector('link[href^="/css/site-v5.css"]'))
    assert.equal(dom.querySelectorAll('.site-header a[href^="/concerns"]').length, 0)
    assert.equal(dom.querySelectorAll('.site-header .btn-reserve').length, 0, 'No rotating urgency CTA on reading pages')
    assert.ok(dom.querySelector('.site-header .pn-reserve'))
    assert.equal(dom.querySelector('.pn-article section').getAttribute('id'), 'your-story', 'Empathy comes before clinical explanation')
    const ids = dom.querySelectorAll('[id]').map(el => el.getAttribute('id'))
    assert.equal(new Set(ids).size, ids.length, 'Unique page anchors')
    for (const anchor of dom.querySelectorAll('.pn-toc a[href^="#"],.pn-mobile-toc a[href^="#"]')) {
      assert.ok(dom.querySelector(anchor.getAttribute('href')), 'Every contents link has a destination')
    }
    assert.ok(dom.querySelector('.pn-say').text.includes(note.region), 'Visible local consultation example')
    assert.ok(dom.querySelector('#questions').text.includes('?'), 'Specific follow-up questions are rendered')

    const redirect = await request('/concerns/' + note.slug + '/')
    assert.equal(redirect.status, 301)
    assert.equal(redirect.headers.get('location'), '/concerns/' + note.slug)
    const preview = parse(await (await request('/concerns/' + note.slug, 'http://localhost:8791')).text())
    assert.match(preview.querySelector('meta[name="robots"]').getAttribute('content'), /^noindex/)
    assert.equal(preview.querySelectorAll('script[src*="googletagmanager"]').length, 0)
  }
  const hub = parse(await (await request('/concerns')).text())
  assert.equal(hub.querySelectorAll('.pn-card').length, Math.min(24, originalCount))
  assert.equal((await request('/concerns/')).status, 301)
  for (const region of ['천안', '아산', '홍성', '예산', '당진', '서산']) {
    const filtered = parse(await (await request('/concerns?region=' + encodeURIComponent(region))).text())
    assert.equal(filtered.querySelectorAll('.pn-card').length, Math.min(24, patientNotes.filter(n => n.region === region).length))
    assert.match(filtered.querySelector('meta[name="robots"]').getAttribute('content'), /^noindex/)
    assert.equal(filtered.querySelector('select[name="region"] option[selected]').getAttribute('value'), region)
  }
  for (const path of ['/concerns/no-such-note', '/concerns?page=0', '/concerns?page=' + (Math.ceil(originalCount / 24) + 1), '/concerns?region=unknown', '/concerns?topic=%3Cscript%3E']) {
    const response = await request(path)
    assert.equal(response.status, 404, path)
    assert.equal(response.headers.get('x-robots-tag'), 'noindex')
  }
  const empty = parse(await (await request('/concerns?region=' + encodeURIComponent('천안') + '&topic=' + encodeURIComponent('신경치료'))).text())
  const emptyCount = patientNotes.filter(n => n.region === '천안' && n.topic === '신경치료').length
  assert.equal(empty.querySelectorAll('.pn-card').length, Math.min(24, emptyCount))
  if (!emptyCount) assert.ok(empty.querySelector('.pn-empty'))
  const sitemap = await (await request('/sitemap-concerns.xml')).text()
  assert.equal((sitemap.match(/<loc>/g) || []).length, originalCount + 1)
  assert.ok(!sitemap.includes('?region='))
  assert.ok((await readFile(resolve('sitemap.xml'), 'utf8')).includes('https://bdbddc.com/sitemap-concerns.xml'))
  for (const file of ['guide/index.html', 'guide/implant.html', 'guide/root-canal.html']) {
    const dom = parse(await readFile(resolve(file), 'utf8'))
    assert.ok(dom.querySelector('main a[href^="/concerns"]'), 'Contextual inbound link: ' + file)
  }
  // Publication boundaries run against the real app: no future body, link, or sitemap leakage.
  const allPublishedClock = clock
  for (const instant of ['2026-09-16T23:59:59+09:00', '2026-09-17T09:00:00+09:00', '2026-09-18T08:59:59+09:00', '2026-09-18T09:00:00+09:00', '2026-09-19T09:00:00+09:00']) {
    clock = RealDate.parse(instant)
    const visible = visiblePatientNotes()
    const visibleSlugs = new Set(visible.map(n => n.slug))
    const page = parse(await (await request('/concerns')).text())
    assert.equal(page.querySelectorAll('.pn-card').length, Math.min(24, visible.length))
    const map = await (await request('/sitemap-concerns.xml')).text()
    assert.equal((map.match(/<loc>/g) || []).length, visible.length + 1)
    for (const n of patientNotes) {
      const response = await request('/concerns/' + n.slug)
      assert.equal(response.status, visibleSlugs.has(n.slug) ? 200 : 404, instant + ' ' + n.slug)
      assert.equal(response.headers.get('cache-control'), 'no-store')
      assert.equal(map.includes('/concerns/' + n.slug + '</loc>'), visibleSlugs.has(n.slug))
      if (visibleSlugs.has(n.slug)) {
        const dom = parse(await response.text())
        for (const link of dom.querySelectorAll('.pn-related a[href^="/concerns/"]')) assert.ok(visibleSlugs.has(link.getAttribute('href').split('/').pop()))
      }
    }
    const preview = parse(await (await request('/concerns', 'http://localhost:8791')).text())
    assert.equal(preview.querySelectorAll('.pn-card').length, Math.min(24, originalCount), 'Preview keeps scheduled notes visible')
  }
  clock = allPublishedClock
  // Exercise real pagination with a larger in-memory fixture; no site files are changed.
  const first = patientNotes[0]
  for (let i = 0; i < 50; i++) patientNotes.push({ ...first, slug: 'fixture-' + i, title: '검사 질문 ' + i })
  const secondPage = parse(await (await request('/concerns?page=2')).text())
  assert.equal(secondPage.querySelectorAll('.pn-card').length, 24)
  assert.equal(secondPage.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://bdbddc.com/concerns?page=2')
  assert.equal(secondPage.querySelectorAll('.pn-pagination a').length, Math.ceil((originalCount + 50) / 24))
  assert.match(secondPage.querySelector('meta[name="robots"]').getAttribute('content'), /^index/)
  console.log('PASS: ' + originalCount + ' notes, publication boundaries and daily limits, regional/topic filtering, shared clinic shell, empathy-first content, working anchors, SSR content, schema, canonical, 404, slash redirects, preview isolation, sitemap, inbound links and pagination')
} finally {
  globalThis.Date = RealDate
  await rm(temp, { recursive: true, force: true })
}
