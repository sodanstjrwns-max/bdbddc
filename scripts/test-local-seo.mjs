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

  // The Asan article has a regional destination; ordinary orthodontic articles
  // must retain their general treatment destination.
  for (const [slug, destination, promoted] of [
    ['asan-dental-orthodontics', '/area/asan-orthodontics', true],
    ['adult-orthodontics-guide', '/treatments/orthodontics', false],
  ]) {
    const url = `https://bdbddc.com/blog/${slug}`
    const upstream = `<html><head><title>치아교정 상담 안내</title><link rel="canonical" href="${url}"></head><body><article><h1>치아교정 상담에서 확인할 내용</h1><p id="post-start">치아교정 검사와 내원에 관한 본문</p></article></body></html>`
    globalThis.fetch = async () => new Response(upstream, { headers: { 'Content-Type': 'text/html' } })
    const response = await app.request(url, {}, {})
    assert.equal(response.status, 200, slug)
    const body = await response.text()
    const document = parse(body)
    const boxes = document.querySelectorAll('[data-bd-related-treatment]')
    assert.equal(boxes.length, 1, `${slug}: one related box`)
    assert(boxes[0].querySelector(`a[href="${destination}"]`), `${slug}: intended destination`)
    assert.equal(document.querySelector('title').text, '치아교정 상담 안내')
    assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), url)
    assert.doesNotMatch(body, /name="robots" content="noindex/)
    if (promoted) {
      assert(body.indexOf('data-bd-related-treatment') > body.indexOf('</h1>'))
      assert(body.indexOf('data-bd-related-treatment') < body.indexOf('id="post-start"'))
      assert.equal(document.querySelectorAll('script[src^="/static/blog-implant-link.js"]').length, 1)
    } else {
      assert(!boxes[0].querySelector('a[href="/area/asan-orthodontics"]'))
    }
    globalThis.fetch = async () => new Response(body, { headers: { 'Content-Type': 'text/html' } })
    const second = parse(await (await app.request(url, {}, {})).text())
    assert.equal(second.querySelectorAll('[data-bd-related-treatment]').length, 1, `${slug}: idempotent box`)
    if (promoted) assert.equal(second.querySelectorAll('script[src^="/static/blog-implant-link.js"]').length, 1)
  }

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

  const normalize = text => text.replace(/\s+/g, ' ').trim()
  const flattenSchema = value => Array.isArray(value) ? value.flatMap(flattenSchema) :
    value && typeof value === 'object' ? [value, ...flattenSchema(value['@graph'] || [])] : []
  const asanPages = new Map()
  const areaSitemap = parse(await readFile('sitemap-area.xml', 'utf8'))
  const sitemapUrls = areaSitemap.querySelectorAll('loc').map(loc => loc.text.trim())
  for (const slug of ['asan', 'asan-implant', 'asan-invisalign', 'asan-orthodontics', 'asan-laminate']) {
    const source = await readFile(`area/${slug}.html`, 'utf8')
    const document = parse(source)
    const main = document.querySelector('main')
    const url = `https://bdbddc.com/area/${slug}`
    asanPages.set(slug, document)
    assert(main, `${slug}: main content`)
    assert.equal(document.querySelectorAll('h1').length, 1, `${slug}: one H1`)
    assert.match(document.querySelector('h1').text, /아산/, `${slug}: regional H1`)
    assert.match(document.querySelector('title').text, /아산/, `${slug}: regional title`)
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1)
    assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), url)
    assert.equal(document.querySelector('meta[property="og:url"]').getAttribute('content'), url)
    assert(document.querySelector('meta[name="description"]').getAttribute('content').trim())
    assert.doesNotMatch(document.querySelector('meta[name="robots"]')?.getAttribute('content') || '', /noindex/i)
    const charset = source.search(/<meta\s+charset=["']UTF-8["']/i)
    assert(charset >= 0 && Buffer.byteLength(source.slice(0, charset)) < 1024, `${slug}: early UTF-8 declaration`)
    assert(sitemapUrls.includes(url), `${slug}: sitemap inclusion`)

    const schema = document.querySelectorAll('script[type="application/ld+json"]').flatMap(s => flattenSchema(JSON.parse(s.text)))
    const hasType = (item, type) => [item['@type']].flat().includes(type)
    assert(!schema.some(item => hasType(item, 'Review') || hasType(item, 'AggregateRating')), `${slug}: no clinic review schema`)
    const dentist = schema.find(item => hasType(item, 'Dentist'))
    assert(dentist, `${slug}: dentist identity`)
    assert.equal(dentist['@id'], 'https://bdbddc.com/#dentist')
    assert.match(JSON.stringify(dentist.address), /천안/, `${slug}: actual clinic city`)
    assert.match(JSON.stringify(dentist.address), /불당/, `${slug}: actual clinic address`)
    const mainText = normalize(main.text)
    assert.match(mainText, /불당34길\s*14/, `${slug}: visible clinic address`)
    const faqSchema = schema.filter(item => hasType(item, 'FAQPage'))
    assert.equal(faqSchema.length, 1, `${slug}: one FAQ schema`)
    assert(faqSchema[0].mainEntity.length > 0, `${slug}: FAQ entries`)
    // Visible FAQ may be disclosure elements or editorial cards. Test content
    // parity without coupling the contract to either presentation.
    for (const question of faqSchema[0].mainEntity) {
      assert(mainText.includes(normalize(question.name)), `${slug}: visible FAQ question ${question.name}`)
      assert(mainText.includes(normalize(question.acceptedAnswer.text)), `${slug}: visible FAQ answer ${question.name}`)
    }
    const ids = main.querySelectorAll('[id]').map(element => element.getAttribute('id'))
    assert.equal(new Set(ids).size, ids.length, `${slug}: unique content anchors`)
    for (const link of main.querySelectorAll('a[href^="#"]')) {
      const target = link.getAttribute('href').slice(1)
      if (target) assert(document.querySelector(`[id="${target}"]`), `${slug}: anchor ${target}`)
    }
    for (const link of main.querySelectorAll('a[href^="/area/asan"]')) {
      assert.doesNotMatch(link.getAttribute('href'), /\.html(?:[?#]|$)/, `${slug}: clean regional link`)
    }
  }
  for (const slug of ['asan-implant', 'asan-invisalign', 'asan-orthodontics', 'asan-laminate']) {
    assert(asanPages.get('asan').querySelector(`main a[href="/area/${slug}"]`), `Asan hub links to ${slug}`)
    assert(asanPages.get(slug).querySelector('main a[href="/area/asan"]'), `${slug} links back to Asan hub`)
  }
  for (const slug of ['asan-implant', 'asan-invisalign', 'asan-laminate']) {
    assert(asanPages.get(slug).querySelector('main a[href="/area/asan-orthodontics"]'), `${slug}: general orthodontic destination`)
  }
  for (const destination of ['/area/asan-implant', '/area/asan-invisalign', '/treatments/orthodontics', '/guide/orthodontics']) {
    assert(asanPages.get('asan-orthodontics').querySelector(`main a[href="${destination}"]`), `Orthodontic guide links to ${destination}`)
  }
  assert(home.querySelector('main a[href="/area/asan"]'), 'Home links to Asan hub')
  console.log('PASS: RSS; missing blog GET/HEAD; implant/Asan/general orthodontic article links and idempotence; home destinations; Buldang FAQ; Cheonan visits; Asan five-page metadata, charset, clinic identity, visible FAQ parity, anchors, sitemap and reciprocal links')
} finally {
  globalThis.fetch = realFetch
  await rm(temp, { recursive: true, force: true })
}
