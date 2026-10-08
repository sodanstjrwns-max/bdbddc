import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { parse } from 'node-html-parser'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'

const temp = await mkdtemp(join(tmpdir(), 'bd-local-seo-'))
const realFetch = globalThis.fetch
try {
  await build({ entryPoints: ['src/index.tsx'], bundle: true, format: 'esm', platform: 'node', target: 'node22', outfile: join(temp, 'app.mjs'), logLevel: 'error' })
  const { default: app } = await import(pathToFileURL(join(temp, 'app.mjs')))
  const R2 = { get: async () => ({ json: async () => [
    { status: 'published', slug: 'rss-special', title: 'A & B ]]> 치과', content: '<p>비교 &amp; 확인 ]]> 끝</p>', category: '검사 & 상담', doctorName: '진료 <안내>', createdAt: '2026-10-07T09:00:00+09:00' },
    { status: 'draft', slug: 'unpublished', title: 'Do not publish', content: 'Draft' },
  ] }) }
  const rss = await app.request('https://bdbddc.com/feed.xml', {}, { R2 })
  assert.equal(rss.status, 200)
  assert.equal(rss.headers.get('content-type'), 'application/rss+xml; charset=utf-8')
  const xml = await rss.text()
  execFileSync('python3', ['-c', `import sys,xml.etree.ElementTree as E
r=E.fromstring(sys.stdin.read()); items=r.findall('./channel/item')
assert len(items)==1
assert items[0].findtext('title')=='A & B ]]> 치과'
assert items[0].findtext('category')=='검사 & 상담'
assert items[0].findtext('author')=='진료 <안내>'
assert items[0].findtext('link')=='https://bdbddc.com/column/rss-special'
assert items[0].findtext('guid')==items[0].findtext('link')
`], { input: xml })
  const rssAlias = await app.request('https://bdbddc.com/rss.xml', {}, {})
  assert.equal(rssAlias.status, 301); assert.equal(rssAlias.headers.get('location'), '/feed.xml')

  globalThis.fetch = async () => new Response('Missing upstream post', { status: 404 })
  for (const method of ['GET', 'HEAD']) {
    const missing = await app.request('https://bdbddc.com/blog/does-not-exist', { method }, {})
    assert.equal(missing.status, 404, method + ' unknown blog')
    assert.equal(missing.headers.get('location'), null)
    if (method === 'GET') {
      const html = await missing.text()
      assert.match(html, /name="robots" content="noindex"/)
      assert.match(html, /href="\/blog\/"/)
    }
  }
  const post = '<html><head><title>비용 5가지</title><link rel="canonical" href="https://bdbddc.com/blog/천안임플란트"></head><body><h1>천안임플란트 숨은 비용 5가지</h1><p id="post-start">임플란트 비용을 알아보는 본문</p></body></html>'
  globalThis.fetch = async () => new Response(post, { headers: { 'Content-Type': 'text/html' } })
  const page = await app.request('https://bdbddc.com/blog/' + encodeURIComponent('천안임플란트'), {}, {})
  const html = await page.text()
  assert.equal(page.status, 200)
  assert.equal((html.match(/data-bd-related-treatment/g) || []).length, 1)
  assert.match(html, /천안 임플란트 진료 보기/)
  assert(html.indexOf('data-bd-related-treatment') > html.indexOf('</h1>'))
  assert(html.indexOf('data-bd-related-treatment') < html.indexOf('id="post-start"'))
  assert.match(html, /<title>비용 5가지<\/title>/)
  assert.doesNotMatch(html, /name="robots" content="noindex/)
  globalThis.fetch = async () => new Response(html, { headers: { 'Content-Type': 'text/html' } })
  const again = await app.request('https://bdbddc.com/blog/' + encodeURIComponent('천안임플란트'), {}, {})
  assert.equal(((await again.text()).match(/data-bd-related-treatment/g) || []).length, 1)

  const home = parse(await readFile('index.html', 'utf8'))
  const card = home.querySelectorAll('a').find(a => a.querySelector('h3')?.text.trim() === '천안 임플란트')
  assert.equal(card?.getAttribute('href'), '/treatments/implant')
  assert(home.querySelector('main a[href="/area/buldang"]'))
  const local = parse(await readFile('area/buldang.html', 'utf8'))
  assert.equal(local.querySelectorAll('h1').length, 1)
  assert.match(local.querySelector('h1').text, /불당동 치과/)
  assert.equal(local.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://bdbddc.com/area/buldang')
  const faq = local.querySelectorAll('script[type="application/ld+json"]').map(s => JSON.parse(s.text)).find(d => d['@type'] === 'FAQPage')
  const details = local.querySelectorAll('details.lv-faq')
  assert.equal(details.length, 6)
  assert.deepEqual(details.map(d => [d.querySelector('summary').text.trim(), d.querySelector('p').text.trim()]), faq.mainEntity.map(q => [q.name, q.acceptedAnswer.text]))
  assert.doesNotMatch(local.querySelector('main').text, /차로 5분|약 2km|명의 전문의|서울대병원급|최대 규모/)
  assert(!local.querySelector('#mainNav a[href="/area/buldang"]'))
  const region = await readFile('area/cheonan.html', 'utf8')
  assert.doesNotMatch(region, /천안시에서 차로 10분|약 5km|11, 12, 21, 22번/)
  assert.match(region, /id="cheonan-visit-plan"/)
  console.log('PASS: RSS MIME/XML escaping/drafts; missing blog GET/HEAD; article link position/idempotence; home destination; Buldang FAQ parity; Cheonan visit content')
} finally {
  globalThis.fetch = realFetch
  await rm(temp, { recursive: true, force: true })
}
