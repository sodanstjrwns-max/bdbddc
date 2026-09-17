import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

// Only notify newly public canonical note URLs. A 200/202 is receipt, not indexing.
const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const origin = 'https://bdbddc.com'
const args = process.argv.slice(2)
const submit = args.includes('--submit')
const stateArg = args.indexOf('--state')
if (stateArg < 0 || !args[stateArg + 1]) throw new Error('Pass --state /absolute/path/notes-indexnow.json; add --submit to send')
const statePath = path.resolve(args[stateArg + 1])
const engines = [{ name: 'naver', url: 'https://searchadvisor.naver.com/indexnow' }, { name: 'bing', url: 'https://www.bing.com/indexnow' }]
const hash = value => crypto.createHash('sha256').update(value).digest('hex')
async function get(url) {
  const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000), headers: { 'user-agent': 'BD-Notes-Publication-Check/1.0' } })
  if (r.status !== 200) throw new Error(`${url}: HTTP ${r.status}`)
  return { response: r, text: await r.text() }
}
let state
try { state = JSON.parse(await fs.readFile(statePath, 'utf8')) }
catch (e) { if (e.code !== 'ENOENT') throw e; state = { version: 1, host: 'bdbddc.com', engines: {} } }
if (state.version !== 1 || state.host !== 'bdbddc.com' || !state.engines) throw new Error('Unexpected state file; refusing to overwrite')
const sitemap = await get(origin + '/sitemap-concerns.xml')
if (!sitemap.text.includes('<urlset')) throw new Error('Expected URL sitemap')
const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
if (!urls.includes(origin + '/concerns') || new Set(urls).size !== urls.length) throw new Error('Missing hub or duplicate URLs')
if (urls.some(u => !/^https:\/\/bdbddc\.com\/concerns(?:\/[a-z0-9-]+)?$/.test(u))) throw new Error('Unexpected URL in note sitemap')
const rootSitemap = await get(origin + '/sitemap.xml')
if (!rootSitemap.text.includes(origin + '/sitemap-concerns.xml')) throw new Error('Root sitemap is missing notes')
const hubRevision = hash([...urls].sort().join('\n'))
const revision = u => u === origin + '/concerns' ? hubRevision : 'first-publication'
const plans = engines.map(e => ({ ...e, urls: urls.filter(u => state.engines[e.name]?.[u]?.revision !== revision(u)) }))
const changed = [...new Set(plans.flatMap(p => p.urls))]
for (const u of changed) {
  const { text, response } = await get(u)
  const robots = (text.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)/i)?.[1] || '') + ' ' + (response.headers.get('x-robots-tag') || '')
  const canonical = text.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1]
  if (/\bnoindex\b/i.test(robots) || canonical !== u) throw new Error(`${u}: non-indexable or wrong canonical`)
  if (!text.includes('<main') || (u !== origin + '/concerns' && !text.includes('id="your-story"'))) throw new Error(`${u}: expected note content missing`)
}
const result = { checkedAt: new Date().toISOString(), mode: submit ? 'submit' : 'dry-run', sitemapUrls: urls.length, checkedUrls: changed, engines: [] }
if (submit && changed.length) {
  const source = await fs.readFile(path.join(siteRoot, 'src/index.tsx'), 'utf8')
  const key = source.match(/const INDEXNOW_KEY = '([a-fA-F0-9-]{8,128})'/)?.[1]
  if (!key) throw new Error('Existing site IndexNow key not found')
  const keyLocation = `${origin}/${key}.txt`
  const verification = await get(keyLocation)
  if (verification.text.trim() !== key) throw new Error('Live IndexNow key mismatch')
  await fs.mkdir(path.dirname(statePath), { recursive: true })
  for (const plan of plans) {
    if (!plan.urls.length) { result.engines.push({ engine: plan.name, status: 'unchanged', count: 0 }); continue }
    try {
      const r = await fetch(plan.url, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: 'bdbddc.com', key, keyLocation, urlList: plan.urls }), signal: AbortSignal.timeout(45000) })
      const receipt = { engine: plan.name, status: r.status, count: plan.urls.length, urls: plan.urls, received: r.status === 200 || r.status === 202 }
      result.engines.push(receipt)
      if (receipt.received) {
        state.engines[plan.name] ||= {}
        for (const u of plan.urls) state.engines[plan.name][u] = { revision: revision(u), receivedAt: new Date().toISOString(), status: r.status }
        const tmp = statePath + '.tmp'
        await fs.writeFile(tmp, JSON.stringify(state, null, 2) + '\n')
        await fs.rename(tmp, statePath)
      }
    } catch (e) { result.engines.push({ engine: plan.name, status: 'error', error: e.message }) }
  }
} else {
  result.engines = plans.map(p => ({ engine: p.name, status: p.urls.length ? 'ready' : 'unchanged', count: p.urls.length, urls: p.urls }))
}
console.log(JSON.stringify(result, null, 2))
if (submit && result.engines.some(r => r.received === false || r.status === 'error')) process.exitCode = 1
