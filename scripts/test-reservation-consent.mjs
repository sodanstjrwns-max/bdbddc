import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import { parse } from 'node-html-parser'

// Execute the actual submit handlers against in-memory fixtures. No network or email.
for (const file of ['reservation.html', 'en/reservation.html', 'jp/reservation.html']) {
  const html = await readFile(file, 'utf8')
  const dom = parse(html)
  for (const id of ['rsvPrivacy', 'rsvSensitive']) {
    assert(dom.querySelector('#' + id).hasAttribute('required'), file)
    assert(!dom.querySelector('#' + id).hasAttribute('checked'), file)
  }
  assert(!dom.querySelector('#rsvMarketing').hasAttribute('required'))
  assert(!dom.querySelector('#rsvMarketing').hasAttribute('checked'))
  const code = html.slice(html.indexOf("document.getElementById('rsvForm').addEventListener('submit'"), html.indexOf('// FAQ toggle'))
  for (const [privacy, sensitive, expectedCalls] of [[false, false, 0], [true, false, 0], [false, true, 0], [true, true, 1]]) {
    let submit
    const calls = [], errors = [], elements = {}
    for (const id of ['rsvForm', 'rsvName', 'rsvPhone', 'rsvMsg', 'rsvPrivacy', 'rsvSensitive', 'rsvDate', 'rsvTime', 'rsvMarketing', 'rsvLoader', 'rsvSubmit']) {
      elements[id] = { value: '', checked: false, classList: { add() {}, remove() {} }, addEventListener: (_, fn) => { submit = fn } }
    }
    Object.assign(elements.rsvName, { value: 'LOCAL TEST' })
    Object.assign(elements.rsvPhone, { value: '01000000000' })
    Object.assign(elements.rsvMsg, { value: 'synthetic test message' })
    elements.rsvPrivacy.checked = privacy
    elements.rsvSensitive.checked = sensitive
    const context = {
      document: { getElementById: id => elements[id], querySelector: () => ({ value: 'other' }) },
      window: { _bdRsvGtag() {}, location: {} }, sessionStorage: { setItem() {}, removeItem() {} },
      hideMsg() {}, showErr: message => errors.push(message),
      fetch: async (url, options) => { calls.push({ url, data: JSON.parse(options.body) }); return { ok: true, json: async () => ({ success: true, reservation: { id: 'local-fixture' } }) } }
    }
    vm.runInNewContext(code, context)
    await submit({ preventDefault() {} })
    assert.equal(calls.length, expectedCalls, file)
    if (expectedCalls) {
      assert.equal(errors.length, 0, errors.join(';'))
      assert.equal(calls[0].url, '/api/reservation')
      assert.deepEqual([calls[0].data.privacyConsent, calls[0].data.sensitiveConsent, calls[0].data.consentVersion, calls[0].data.marketing], [true, true, '2026-09-23', false])
      assert.equal(context.window.location.href, '/reservation/thank-you')
    } else assert.equal(errors.length, 1)
  }
}

const chatbot = await readFile('public/static/chatbot.js', 'utf8')
const translations = chatbot.slice(chatbot.indexOf('  var UI_TEXT ='), chatbot.indexOf('  // Booking consent'))
const notice = chatbot.slice(chatbot.indexOf('  function getBookingConsentText()'), chatbot.indexOf('  // ───', chatbot.indexOf('  function getBookingConsentText()')))
const createForm = chatbot.slice(chatbot.indexOf('  function createBookingFormHTML()'), chatbot.indexOf('  // ─── 예약 폼 이벤트 바인딩'))
for (const lang of ['ko', 'en', 'ja', 'zh', 'vi']) {
  const context = { detectLang: () => lang, Date }
  const markup = vm.runInNewContext(translations + notice + createForm + '\ncreateBookingFormHTML()', context)
  const form = parse(markup)
  for (const id of ['bdBookPrivacy', 'bdBookSensitive']) assert(!form.querySelector('#' + id).hasAttribute('checked'))
  assert(form.querySelector('a[href="/privacy#online-consultation"]'))
  assert(!markup.includes('undefined'), lang)
}
const submitBooking = chatbot.slice(chatbot.indexOf('  function submitBooking('), chatbot.indexOf('  function formatText('))
for (const [privacy, sensitive, expectedCalls] of [[false, true, 0], [true, false, 0], [true, true, 1]]) {
  const calls = [], elements = {}
  for (const id of ['bdBookDate', 'bdBookTime', 'bdBookName', 'bdBookPhone', 'bdBookTreatment', 'bdBookError', 'bdBookSubmit', 'bdBookSpinner', 'bdBookSubmitText', 'bdBookPrivacy', 'bdBookSensitive']) elements[id] = { value: '', style: {} }
  elements.bdBookName.value = 'LOCAL TEST'; elements.bdBookPhone.value = '01000000000'
  elements.bdBookPrivacy.checked = privacy; elements.bdBookSensitive.checked = sensitive
  const context = { detectLang: () => 'ko', form: { querySelector: selector => elements[selector.slice(1)] },
    fetch: async (url, options) => { calls.push({ url, data: JSON.parse(options.body) }); return { json: async () => ({ success: false, error: 'local fixture' }) } } }
  vm.runInNewContext(translations + notice + submitBooking + '\nsubmitBooking(form, null)', context)
  assert.equal(calls.length, expectedCalls)
  if (expectedCalls) assert.deepEqual([calls[0].data.privacyConsent, calls[0].data.sensitiveConsent, calls[0].data.consentVersion, calls[0].data.marketing], [true, true, '2026-09-23', false])
}
console.log('PASS: KR/EN/JP separate unchecked consent, optional marketing, missing-consent blocking, actual payload/receipt flow; chatbot consent in all supported language paths. No external requests.')
