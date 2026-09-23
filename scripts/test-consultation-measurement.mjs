import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { build } from 'esbuild'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const collector = await readFile('public/static/bd-conversions.js', 'utf8')
function browser(path = '/concerns/example', host = 'bdbddc.com', storage = new Map()) {
  const events = [], listeners = {}, elements = [], callbacks = [], timers = new Map()
  const location = new URL('https://' + host + path)
  const document = { visibilityState: 'visible', readyState: 'loading', documentElement: { scrollHeight: 2000 },
    addEventListener: (name, fn) => (listeners[name] ||= []).push(fn), querySelectorAll: () => elements }
  const window = { dataLayer: [], innerHeight: 500, scrollY: 0, addEventListener: (name, fn) => (listeners[name] ||= []).push(fn), setInterval: fn => callbacks.push(fn), setTimeout: (fn, ms) => { timers.set(fn, ms); return fn }, clearTimeout: id => timers.delete(id), gtag: (...args) => events.push(args) }
  const sessionStorage = { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) }
  const context = vm.createContext({ window, document, location, sessionStorage, URL, Date, console })
  vm.runInContext(collector, context)
  return { context, window, events, listeners, elements, storage, timers, click: href => {
    const a = { getAttribute: k => k === 'href' ? href : null, closest: selector => selector === 'a[href]' ? a : null }
    listeners.click?.forEach(fn => fn({ target: a }))
  } }
}
for (const [href, event] of [['tel:0414152892', 'phone_call_click'], ['https://pf.kakao.com/_Cxivlxb', 'kakao_click'], ['https://naver.me/5yPnKmqQ', 'naver_booking_click'], ['/reservation', 'reservation_click'], ['../reservation.html', 'reservation_click']]) {
  const b = browser(); b.click(href); b.window.bdConversions.intent(event, 'legacy_inline')
  assert.equal(b.events.length, 1, href + ': capture plus legacy must emit only once')
  assert.equal(b.events[0][1], event)
  assert.equal(b.events[0][2].page_type, 'concern')
  assert.equal(JSON.stringify(b.events[0][2].send_to), JSON.stringify(['G-LM9VKJSB9F', 'G-3NQP355YQM']), 'Each intent explicitly routes to both existing GA destinations')
  vm.runInContext(collector, b.context)
  assert.equal(b.listeners.click.length, 1, 'Duplicate script load has one listener')
}
for (const href of ['https://naver.me/not-the-booking-link', 'https://evil.test/?next=booking.naver.com', 'https://booking.naver.com.evil.test/', 'https://map.kakao.com/', '#visit', '/reservation/thank-you']) {
  const b = browser(); b.click(href); assert.equal(b.events.length, 0, 'Non-consultation link: ' + href)
}
const b = browser('/reservation')
assert.equal(b.window.bdConversions.reservationAccepted(''), false)
assert.equal(b.window.bdConversions.reservationAccepted('rsv-123456-abc123'), true)
assert.equal(b.window.bdConversions.reservationAccepted('rsv-123456-abc123'), false)
assert.equal(b.events.filter(e => e[1] === 'generate_lead').length, 1)
assert.equal(JSON.stringify(b.events[0][2].send_to), JSON.stringify(['G-LM9VKJSB9F', 'G-3NQP355YQM']), 'Saved request uses the same explicit destinations')
assert.doesNotMatch(JSON.stringify(b.events), /abc123|100000|treatment|phone|name|message/)
const reload = browser('/reservation/thank-you', 'bdbddc.com', b.storage)
assert.equal(reload.events.length, 0, 'Direct thank-you does not emit completion')
assert.equal(reload.window.bdConversions.reservationAccepted('rsv-123456-abc123'), false)
const local = browser('/concerns/example', 'localhost'); local.click('/reservation'); assert.equal(local.events.length, 0)
const blocked = browser('/reservation'); blocked.context.sessionStorage.getItem = () => { throw Error('blocked') }
assert.equal(blocked.window.bdConversions.reservationAccepted('rsv-123457-abc123'), true)
assert.equal(blocked.window.bdConversions.reservationAccepted('rsv-123457-abc123'), false)
// A navigation must wait for both destinations, then finish only once; blocked tags time out.
const delayed = browser('/reservation'); let completed = 0
delayed.window.bdConversions.reservationAccepted('rsv-123458-abc123', () => completed++)
assert.equal(completed, 0)
assert.equal(delayed.events.length, 2)
assert.equal(delayed.events[0][2].send_to, 'G-LM9VKJSB9F')
assert.equal(delayed.events[1][2].send_to, 'G-3NQP355YQM')
delayed.events[0][2].event_callback(); delayed.events[0][2].event_callback()
assert.equal(completed, 0, 'Duplicate callback from one destination must not navigate early')
delayed.events[1][2].event_callback(); delayed.events[1][2].event_callback()
assert.equal(completed, 1); assert.equal(delayed.timers.size, 0)
const stalled = browser('/reservation'); let fallback = 0
stalled.window.bdConversions.reservationAccepted('rsv-123459-abc123', () => fallback++)
for (const [fn, ms] of stalled.timers) { assert.equal(ms, 700); fn() }
assert.equal(fallback, 1)
stalled.events.forEach(e => e[2].event_callback()); assert.equal(fallback, 1)
const navigation = browser(); const destinations = []
navigation.window.location = { assign: href => destinations.push(href) }
const anchor = { href: 'https://bdbddc.com/reservation', getAttribute: k => k === 'href' ? '/reservation' : null, closest: s => s === 'a[href]' ? anchor : null }
let prevented = false
navigation.listeners.click[0]({ target: anchor, button: 0, preventDefault: () => { prevented = true } })
assert(prevented); assert.equal(destinations.length, 0)
navigation.events.forEach(e => e[2].event_callback())
assert.deepEqual(destinations, ['https://bdbddc.com/reservation'])
// Real handler regression: the href changes after binding, or contains CSS punctuation / Korean.
const main = await readFile('js/main.js', 'utf8')
const smooth = main.slice(main.indexOf('function initSmoothScroll()'), main.indexOf('/**\n * Utility: Debounce'))
for (const href of ['/treatments/scaling', '/treatments/whitening', '/encyclopedia/%EC%B9%98%ED%83%9C', '#치태', '#a:b', '#%E0', '#']) {
  let handler, prevented = false, lookedUp = ''
  const anchor = { addEventListener: (_, f) => { handler = f }, getAttribute: () => href }
  const d = { querySelectorAll: () => [anchor], getElementById: id => { lookedUp = id; return null }, querySelector: () => { throw Error('Must not treat URL as selector') } }
  vm.runInNewContext(smooth + '\ninitSmoothScroll();', { document: d })
  handler.call(anchor, { preventDefault: () => { prevented = true } })
  assert.equal(prevented, false)
  if (href === '#치태') assert.equal(lookedUp, '치태')
  if (href === '#a:b') assert.equal(lookedUp, 'a:b')
}
// The previous implementation throws for the exact paths reported by Clarity.
assert.throws(() => vm.runInNewContext('document.querySelector("/treatments/scaling")', { document: { querySelector: s => { if (s.startsWith('/')) throw new SyntaxError('invalid selector') } } }), /invalid selector/)

const temp = await mkdtemp(join(tmpdir(), 'bd-consultation-test-'))
try {
  await build({ stdin: { contents: `export { default as app } from './src/index'; export { relatedNotes, visitPreparation, visitRegions } from './src/lib/patient-journey'; export { visiblePatientNotes } from './src/data/patient-notes';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', target: 'node22', outfile: join(temp, 'test.mjs'), logLevel: 'error' })
  const { app, relatedNotes, visitRegions, visitPreparation, visiblePatientNotes } = await import(pathToFileURL(join(temp, 'test.mjs')))
  const data = { name: 'LOCAL TEST', phone: '01000000000', message: 'local synthetic fixture', treatment: 'other', privacyConsent: true, sensitiveConsent: true, consentVersion: '2026-09-23' }
  const request = env => app.request('https://bdbddc.com/api/reservation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }, env)
  const originalError = console.error
  console.error = () => {}
  try {
    assert.equal((await request({})).status, 503, 'No storage must never be success')
    assert.equal((await request({ R2: { put: async () => { throw Error('storage outage') } } })).status, 503)
  } finally { console.error = originalError }
  const records = []
  const success = await request({ R2: { put: async (key, value) => records.push({ key, value }), get: async () => null } })
  assert.equal(success.status, 200)
  const receipt = await success.json()
  assert.equal(receipt.success, true)
  assert(records.some(r => r.key === 'data/reservations/' + receipt.reservation.id + '.json'))
  const saved = JSON.parse(records.find(r => r.key.endsWith('/' + receipt.reservation.id + '.json')).value)
  assert.equal(saved.consent.privacy, true)
  assert.equal(saved.consent.sensitive, true)
  assert.equal(saved.consent.version, '2026-09-23')
  assert(Number.isFinite(Date.parse(saved.consent.recordedAt)))
  assert.equal(saved.marketing, false, 'Required consent must not opt into marketing')
  for (const override of [{ privacyConsent: false }, { sensitiveConsent: false }, { privacyConsent: 'true' }, { sensitiveConsent: 'true' }, { consentVersion: undefined }, { consentVersion: '2024-12-01' }]) {
    const rejected = await app.request('https://bdbddc.com/api/reservation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, ...override }) }, { R2: { put: async () => assert.fail('Unconsented request must not be stored') } })
    assert.equal(rejected.status, 400)
  }
  const indexFailure = await request({ R2: { put: async key => { if (key.endsWith('/reservations.json')) throw Error('index only') }, get: async () => null } })
  assert.equal(indexFailure.status, 200, 'Durable record remains accepted when the legacy list fails')
  const notes = visiblePatientNotes()
  for (const region of visitRegions) {
    assert.match(visitPreparation(region.slug), new RegExp(region.name))
    assert.match(visitPreparation(region.slug), /불당34길 14/)
  }
  assert(relatedNotes('/guide/implant').length >= 4)
  for (const n of notes) assert(n.related.some(l => !l.href.startsWith('/concerns/')), 'Every note has an established content/visit route: ' + n.slug)
  for (const file of ['reservation.html', 'en/reservation.html', 'jp/reservation.html']) {
    const form = await readFile(file, 'utf8')
    assert.match(form, /!result.success\|\|!result.reservation\|\|!result.reservation.id/)
    assert.match(form, /reservationAccepted\(result.reservation.id, resolve\)/)
  }
  const thankyou = await readFile('reservation/thank-you.html', 'utf8')
  assert.doesNotMatch(thankyou, /gtag\('event', '(generate_lead|reservation_complete)'|trackReservationComplete\(/)
  console.log('PASS: delegated click dedup, dynamic/relative/external links, preview exclusion, lead receipt dedup, blocked storage, no PII/value, URL selector regression, persisted API receipts/failures, six regional preparations, and form gates')
} finally { await rm(temp, { recursive: true, force: true }) }
