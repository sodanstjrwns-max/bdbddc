import assert from 'node:assert/strict'
import { Hono } from 'hono'
import { build } from 'esbuild'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
const require = createRequire(import.meta.url)
const { repair, validate } = require('./video-schema.cjs')
const temp = await mkdtemp(join(tmpdir(), 'bd-gsc-check-'))
try {
  await build({ stdin: { contents: `export { default as app } from './src/index'; export { gscLegacyRedirects, gscLegacyTarget } from './src/data/gsc-legacy-redirects';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', target: 'node22', outfile: join(temp, 'test.mjs'), logLevel: 'error' })
  const { app, gscLegacyRedirects, gscLegacyTarget } = await import(pathToFileURL(join(temp, 'test.mjs')))
  for (const [from, to] of Object.entries(gscLegacyRedirects)) {
    for (const method of ['GET', 'HEAD']) {
      const r = await app.request('https://bdbddc.com' + encodeURI(from) + '?utm_source=test', { method }, {})
      assert.equal(r.status, 301, from)
      assert.equal(r.headers.get('location'), encodeURI(to) + '?utm_source=test', from)
    }
    assert.equal(gscLegacyTarget(encodeURI(to)), undefined, 'No redirect chain/loop: ' + to)
  }
  assert.equal(gscLegacyTarget('/encyclopedia/%E'), undefined, 'Malformed path is not guessed')
  assert.equal(gscLegacyTarget('/encyclopedia/not-a-real-term'), undefined)
  const missing = await app.request('https://bdbddc.com/definitely-unknown-seo-check', {}, {})
  assert.equal(missing.status, 404, 'Unknown pages stay 404')
  const realFetch = globalThis.fetch
  try {
    globalThis.fetch = async () => new Response('<html><head><meta name="robots" content="index,follow"><title>Author</title></head><body><h1>Archive</h1></body></html>', { headers: { 'Content-Type': 'text/html' } })
    const archive = await app.request('https://bdbddc.com/blog/author/sooyeonkim-490351', {}, {})
    const h = await archive.text()
    assert.match(h, /<meta name="robots" content="noindex,follow">/)
    assert.equal((h.match(/<meta name="robots"/g) || []).length, 1)
    const article = await app.request('https://bdbddc.com/blog/example-article', {}, {})
    assert.doesNotMatch(await article.text(), /name="robots" content="noindex/)
  } finally { globalThis.fetch = realFetch }
  // A temporary outage must never masquerade as an indexed empty page or a permanent deletion.
  const realError = console.error
  try {
    console.error = () => {}
    globalThis.fetch = async () => { throw new Error('simulated upstream outage') }
    for (const url of ['/blog', '/blog/example-article']) {
      const response = await app.request('https://bdbddc.com' + url, {}, {})
      assert.equal(response.status, 503, url + ': upstream outage')
      assert.equal(response.headers.get('retry-after'), '120')
      assert.equal(response.headers.get('cache-control'), 'no-store')
    }
    const failures = new Hono()
    failures.onError(app.errorHandler)
    failures.get('/__gsc-outage-test', () => { throw new Error('simulated render outage') })
    const unavailable = await failures.request('https://bdbddc.com/__gsc-outage-test', {}, {})
    assert.equal(unavailable.status, 503, 'Render outage is temporary, not 404')
    assert.equal(unavailable.headers.get('retry-after'), '120')
    assert.doesNotMatch(await unavailable.text(), /name="robots" content="noindex/)
    const recovered = await failures.request('https://bdbddc.com/__gsc-outage-test', {}, {
      ASSETS: { fetch: async () => new Response('<html><body>Original page</body></html>', { headers: { 'Content-Type': 'text/html' } }) }
    })
    assert.equal(recovered.status, 200, 'Existing static page remains a valid fallback')
    assert.match(await recovered.text(), /Original page/)
  } finally { globalThis.fetch = realFetch; console.error = realError }
  const html = await readFile('treatments/re-root-canal.html', 'utf8')
  assert.equal(repair(html), html, 'Video repair is idempotent')
  assert.equal(validate(html, 'valid').errors.length, 0)
  const unrelated = '<script type="application/ld+json">{"@type":"Thing","values":[0,false,null]}</script>'
  assert.equal(repair(unrelated), unrelated, 'Non-video structured data stays intact')
  const invalid = html.replace(/"uploadDate":\s*"[^"]+"/, '"uploadDate":"2026-09-21"')
  assert(validate(invalid, 'negative').errors.some(e => e.includes('invalid uploadDate')))
  const invalidClip = html.replace(/"@type":\s*"VideoObject",/, '"@type":"VideoObject","hasPart":[{"@type":"Clip","startOffset":3,"endOffset":2}],')
  assert(validate(invalidClip, 'negative').errors.some(e => e.includes('invalid clip bounds')))
  let checked = 0
  for (const file of execFileSync('git', ['ls-files', '*.html'], { encoding: 'utf8' }).trim().split('\n')) {
    const h = await readFile(file, 'utf8')
    if (!h.includes('VideoObject')) continue
    assert.equal(repair(h), h, 'Video repair idempotence: ' + file)
    assert.equal(validate(h, file).errors.length, 0, file); checked++
  }
  const robots = await readFile('robots.txt', 'utf8')
  for (const line of robots.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))) assert.match(line, /^(User-agent|Allow|Disallow|Sitemap|Crawl-delay):/i)
  console.log(JSON.stringify({ redirects: Object.keys(gscLegacyRedirects).length, methods: 2, videoFiles: checked, passed: true }))
} finally { await rm(temp, { recursive: true, force: true }) }
