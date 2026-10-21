import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'

// Run the real middleware and publication filter without producing build artifacts.
const bundled = await build({
  stdin: {
    contents: `export { Hono } from 'hono'; export { registerPatientJourney } from './src/lib/patient-journey'; export { patientNotes } from './src/data/patient-notes';`,
    resolveDir: process.cwd(), loader: 'ts'
  },
  bundle: true, format: 'esm', platform: 'node', target: 'node22', write: false, logLevel: 'error'
})
const { Hono, registerPatientJourney, patientNotes } = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const asan = await readFile('area/asan.html', 'utf8')
const minimal = '<!doctype html><html><head></head><body><main><h1>Fixture</h1></main><footer>Footer</footer></body></html>'
const savedNotes = [...patientNotes]
const realNow = Date.now
let clock = Date.parse('2026-10-21T08:59:59+09:00')
Date.now = () => clock
const fixture = (slug, region, publishedAt) => ({ ...savedNotes[0], slug, title: slug, region, publishedAt, related: [{ href: '/guide/implant', label: 'Fixture guide' }] })
const future = fixture('scheduled-asan', '아산', '2026-10-21T09:00:00+09:00')
const get = async (path, markup = minimal, status = 200, type = 'text/html') => {
  const app = new Hono()
  registerPatientJourney(app)
  app.get('*', () => new Response(markup, { status, headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', ETag: 'fixture', 'Content-Length': String(Buffer.byteLength(markup)) } }))
  const response = await app.request('https://bdbddc.com' + path)
  return { response, html: await response.text() }
}
const linkedNotes = html => {
  const list = html.match(/<ul class="bd-journey-links">([\s\S]*?)<\/ul>/)?.[1] || ''
  return [...list.matchAll(/href="\/concerns\/([^"]+)"/g)].map(match => match[1])
}
const assertFresh = response => {
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.headers.get('etag'), null)
  assert.equal(response.headers.get('content-length'), null)
}
try {
  assert.equal((asan.match(/id="visit-preparation"/g) || []).length, 1, 'Legacy anchor resolves exactly once in the static Asan page')
  const staticPreparation = asan.match(/<section id="asan-first"[\s\S]*?<\/section>/)?.[0]
  assert(staticPreparation?.includes('id="visit-preparation"'), 'Legacy and section navigation anchors target the same static preparation content')

  patientNotes.splice(0, patientNotes.length, future)
  let result = await get('/area/asan', asan)
  assert.equal(result.html, asan, 'Before the first publication, retain the entire static page without generic preparation')
  assertFresh(result.response) // A cached empty list must not hide the scheduled note at release time.
  clock = Date.parse(future.publishedAt)
  result = await get('/area/asan', asan)
  assert.deepEqual(linkedNotes(result.html), ['scheduled-asan'], 'The first note appears at the exact publication boundary')

  const older = Array.from({ length: 7 }, (_, i) => fixture('older-asan-' + i, '아산', `2026-10-${String(10 + i).padStart(2, '0')}T09:00:00+09:00`))
  const other = fixture('other-region', '천안', '2026-10-20T09:00:00+09:00')
  patientNotes.splice(0, patientNotes.length, older[2], future, other, ...older.filter((_, i) => i !== 2))
  clock = Date.parse('2026-10-21T08:59:59+09:00')
  result = await get('/area/asan.html', asan)
  assert.deepEqual(linkedNotes(result.html), [6, 5, 4, 3, 2, 1].map(i => 'older-asan-' + i), 'Only the latest six published Asan notes appear, regardless of source order')
  assert.equal((result.html.match(/id="visit-preparation"/g) || []).length, 1)
  assert(!result.html.includes('첫 상담을 준비하는 마음'), 'Existing preparation suppresses only the generic preparation block')
  assert(result.html.includes(staticPreparation), 'The static preparation content is preserved byte for byte')
  assertFresh(result.response)

  clock = Date.parse(future.publishedAt)
  result = await get('/area/asan', asan)
  assert.deepEqual(linkedNotes(result.html), ['scheduled-asan', ...[6, 5, 4, 3, 2].map(i => 'older-asan-' + i)])
  assert(result.html.indexOf('class="bd-journey-links"') < result.html.indexOf('</main>'), 'Dynamic notes remain inside main')
  assertFresh(result.response)

  result = await get('/area/cheonan')
  assert.equal((result.html.match(/id="visit-preparation"/g) || []).length, 1, 'Uncustomized regional pages retain generic preparation')
  assert.deepEqual(linkedNotes(result.html), ['other-region'])
  result = await get('/reservation.html')
  assert.equal((result.html.match(/id="visit-preparation"/g) || []).length, 1, 'Reservation preparation is unchanged')
  assert.deepEqual(linkedNotes(result.html), [])
  const guide = minimal.replace('<h1>Fixture</h1>', '<div id="visit-preparation">Custom preparation</div><!-- patient-notes-links --><section>Old fixed teaser</section>')
  result = await get('/guide/implant', guide)
  assert.equal(linkedNotes(result.html).length, 6, 'An existing anchor never suppresses related guide notes')
  assert(!result.html.includes('Old fixed teaser'), 'The guide teaser is still replaced with current links')
  assert(result.html.includes('Custom preparation'))
  for (const [path, status, type] of [['/unrelated', 200, 'text/html'], ['/area/asan', 404, 'text/html'], ['/area/asan', 200, 'application/json']]) {
    result = await get(path, minimal, status, type)
    assert.equal(result.html, minimal, 'Unrelated or ineligible responses remain unchanged')
    assert.equal(result.response.headers.get('cache-control'), 'public, max-age=3600')
  }
  console.log('PASS: static preparation and legacy anchor, exact publication boundary, latest six regional notes, cache safety, reservation and guide behavior, ineligible responses')
} finally {
  Date.now = realNow
  patientNotes.splice(0, patientNotes.length, ...savedNotes)
}
