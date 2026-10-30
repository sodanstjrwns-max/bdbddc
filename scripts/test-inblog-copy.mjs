// Run: node scripts/test-inblog-copy.mjs [saved-upstream.html ...]
// Exercises the public transformer and independently validates Flight byte framing.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { transform } from 'esbuild'

const source = fs.readFileSync(new URL('../src/lib/review-copy.ts', import.meta.url), 'utf8')
const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' })
const { rewriteInblogCopy, rewriteReviewFlight, removeLegacyBlogTestimonials } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const fear = '놓치면 교정 선택 후회할지도 몰라요!'
const calm = '내 치아가 인비절라인 적응증에 맞는지, 미리 확인해보세요.'
const fear2 = '지금 확인 안 하면 진짜 놓칠지도 몰라요.'
const calm2 = '협진 기준을 알면 진료과 선택이 훨씬 쉬워집니다.'
const intro = '<p>비용과 치료 과정을 파악하셨다면, 실제 환자들의 후기와 첫 예약을 진행하는 방법을 통해 방문 준비를 마무리하실 수 있습니다.</p>'
const removedId = '교정-실사용-후기-핵심-요약-18'
const removedHeading = `<h3 id="${removedId}">교정 실사용 후기 핵심 요약</h3>`
const removedParagraph = '<p>증례 B는 교정 후 돌출된 옆앞니를 세라믹 비니어로 정렬해 만족도를 높인 경우입니다. 환자 후기에서도 색 안정성 평가가 높게 나타났습니다.</p>'
const unicode = '한글 🦷 👨‍👩‍👧 · 인용 "문장" \\ 경로\n다음 줄 ])'
const untouched = '<p>환자분의 고민 질문, 문헌 systematic review, 대한모 씨의사협회</p>'
const tRecord = (id, text) => `${id}:T${Buffer.byteLength(text).toString(16)},${text}`
const jRecord = (id, value) => `${id}:${JSON.stringify(value)}\n`
const jsonForScript = value => JSON.stringify(value).replace(/</g, '\\u003c')
const pushes = chunks => chunks.map(chunk => `<script>self.__next_f.push(${jsonForScript([1, chunk])})</script>`).join('')
const document = (body, stream, extra = '') => `<html><head>${extra}</head><body><article>${body}</article>${pushes([stream])}</body></html>`

// Parse the JSON argument without executing any upstream JavaScript.
// This independent reader avoids using the production regular expression as its oracle.
function flightStream(html) {
  const chunks = []
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const content = match[1].trim()
    if (!content.startsWith('self.__next_f.push(')) continue
    const closing = content.lastIndexOf(')')
    const value = JSON.parse(content.slice('self.__next_f.push('.length, closing))
    if (value[0] === 1) chunks.push(value[1])
  }
  return chunks.join('')
}

function readFlight(stream) {
  const data = Buffer.from(stream)
  const records = []
  let cursor = 0
  while (cursor < data.length) {
    const colon = data.indexOf(58, cursor)
    assert.ok(colon >= cursor, 'each record has an ID')
    const id = data.toString('ascii', cursor, colon)
    assert.match(id, /^[0-9a-f]*$/) // Resource-hint rows such as :HL have no ID.
    if (data[colon + 1] === 84) {
      const comma = data.indexOf(44, colon + 2)
      assert.ok(comma > colon + 2)
      const length = Number.parseInt(data.toString('ascii', colon + 2, comma), 16)
      const end = comma + 1 + length
      assert.ok(end <= data.length, 'T record is complete')
      const text = new TextDecoder('utf-8', { fatal: true }).decode(data.subarray(comma + 1, end))
      assert.equal(Buffer.byteLength(text), length)
      records.push({ id, text })
      cursor = end
    } else {
      let end = data.indexOf(10, colon + 1)
      if (end < 0) end = data.length
      const payload = data.toString('utf8', colon + 1, end).replace(/^[A-Z]+/, '')
      records.push({ id, value: JSON.parse(payload) })
      cursor = end + 1
    }
  }
  return records
}

function jsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(match => JSON.parse(match[1]))
}
let tests = 0
function test(name, run) {
  run()
  tests++
  console.log(`PASS ${name}`)
}

test('unrelated copy and upstream corruption remain byte-for-byte unchanged', () => {
  const html = document(untouched, jRecord('a', { text: unicode, reference: '$L1' }))
  assert.equal(rewriteInblogCopy(html), html)
  const unknown = document(untouched, 'a:Tffff,unrelated truncated upstream record')
  assert.equal(rewriteInblogCopy(unknown), unknown)
})

test('fear-only article repairs SSR and split UTF-8 Flight T records', () => {
  const article = `<p>${unicode}</p><h2>${fear}</h2><p>${fear2}</p>${untouched}`
  const stream = tRecord('a', article) + tRecord('b', '보존 🦷') + jRecord('c', { sentinel: unicode })
  const cut = stream.indexOf('🦷') + 1 // Split a surrogate pair across push calls.
  const html = `<article>${article}</article>${pushes([stream.slice(0, cut), stream.slice(cut, cut + 27), stream.slice(cut + 27)])}`
  const out = rewriteInblogCopy(html)
  const records = readFlight(flightStream(out))
  const expected = article.replace(fear, calm).replace(fear2, calm2)
  assert.equal(records[0].text, expected)
  assert.equal(records[1].text, '보존 🦷')
  assert.deepEqual(records[2].value, { sentinel: unicode })
  assert.ok(out.startsWith(`<article>${expected}</article>`))
  assert.equal(rewriteInblogCopy(out), out)
})

test('JSON Flight strings keep inserted link quotes, newlines, Unicode and literal ])', () => {
  const node = ['$', 'section', null, { html: intro, text: `${unicode}\n${fear}` }]
  const input = document(intro, jRecord('1', node))
  const out = rewriteInblogCopy(input)
  const value = readFlight(flightStream(out))[0].value
  assert.equal(value[3].text, `${unicode}\n${calm}`)
  assert.match(value[3].html, /href="https:\/\/map\.naver\.com\/p\/entry\/place\/1541238930/)
  assert.match(value[3].html, /href="https:\/\/www\.google\.com\/maps\/search\/불당본점서울비디치과의원"/)
  assert.match(value[3].html, /target="_blank" rel="noopener noreferrer"/)
  assert.equal(out.match(/<article>([\s\S]*?)<\/article>/)[1], value[3].html)
  assert.equal(removeLegacyBlogTestimonials(input), out)
  assert.equal(rewriteInblogCopy(out), out)
})

test('legacy blocks and both standalone and nested TOC elements are removed', () => {
  const anchor = ['$', 'a', removedId, { href: `#${removedId}`, children: '교정 실사용 후기 핵심 요약' }]
  const keep = ['$', 'a', 'keep', { href: '#예약', children: '예약 안내' }]
  const body = `${removedHeading}${removedParagraph}<a href="#${removedId}">삭제 목차</a>${untouched}`
  const stream = tRecord('a', body) + jRecord('b', anchor) + jRecord('c', ['$', 'div', null, { children: [anchor, keep] }])
  const out = rewriteInblogCopy(document(body, stream))
  const records = readFlight(flightStream(out))
  assert.equal(records[0].text, untouched)
  assert.equal(records[1].value, null)
  assert.deepEqual(records[2].value[3].children, [null, keep])
  assert.ok(!out.includes(removedId))
})

test('JSON-LD and JSON serialized within Flight remain valid and match visible copy', () => {
  const schema = { '@type': 'FAQPage', description: `${unicode}\n${fear2}`, articleBody: intro }
  const script = `<script type="application/ld+json">${jsonForScript(schema)}</script>`
  const value = { nested: JSON.stringify(schema), html: script }
  const out = rewriteInblogCopy(document(intro, jRecord('d', value), script))
  const parsed = jsonLd(out)[0]
  assert.equal(parsed.description, `${unicode}\n${calm2}`)
  assert.ok(parsed.articleBody.includes('네이버'))
  const hydrated = readFlight(flightStream(out))[0].value
  assert.deepEqual(JSON.parse(hydrated.nested), parsed)
  assert.deepEqual(jsonLd(hydrated.html)[0], parsed)
  assert.equal(rewriteInblogCopy(out), out)
})

test('JSON-LD inside a T HTML payload and escaped-only HTML receive safe replacements', () => {
  const article = `<script type="application/ld+json">${jsonForScript({ text: intro })}</script>`
  const out = rewriteInblogCopy(document('', tRecord('a', article)))
  const parsed = jsonLd(readFlight(flightStream(out))[0].text)[0]
  assert.ok(parsed.text.includes('네이버'))
  const encoded = document('', jRecord('c', { html: removedHeading }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e'))
  assert.equal(readFlight(flightStream(rewriteInblogCopy(encoded)))[0].value.html, '')
})

test('executable scripts, unaffected Flight rows and unchanged headers stay untouched', () => {
  const executable = `<script>const copy = ${JSON.stringify(fear)};</script>`
  const stream = 'a:T0004,test' + 'b: {"value" : "보존"}\n'
  const input = document(`<p>${fear}</p>`, stream, executable)
  const out = rewriteInblogCopy(input)
  assert.ok(out.includes(executable))
  assert.equal(flightStream(out), stream)
  assert.equal(rewriteInblogCopy(out), out)
})

test('truncated or mid-character T records are rejected rather than silently corrupted', () => {
  assert.throws(() => rewriteReviewFlight('a:Tffff,미완료'), /Incomplete blog Flight text record/)
  assert.throws(() => rewriteReviewFlight('a:T1,한'), /encoded data was not valid/)
})

for (const file of process.argv.slice(2)) {
  test(`saved upstream HTML: ${file}`, () => {
    const html = fs.readFileSync(file, 'utf8')
    const out = rewriteInblogCopy(html)
    assert.equal(rewriteInblogCopy(out), out)
    readFlight(flightStream(out))
    jsonLd(out)
  })
}
console.log(`Inblog copy regression: ${tests} passed`)
