import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'node-html-parser'

const origin = 'https://bdbddc.com'
const hubUrl = origin + '/concerns'
const requireCheck = (ok, message) => assert.ok(ok, message)

// A healthy old site is not evidence that today's two notes were published.
// Injecting the reader allows failure and schedule cases to be checked offline.
export async function auditPublication({ state, get, allowScheduled = false }) {
  requireCheck(state.allocatedToday.length === 2, `${state.kstDate}: expected two assigned notes, found ${state.allocatedToday.length}`)
  const publicUrls = new Set(state.currentlyPublicInSource.map(n => n.url))
  const pendingToday = state.allocatedToday.filter(n => !publicUrls.has(n.url))
  requireCheck(!pendingToday.length || allowScheduled, 'Today is not fully public; scheduled deployment is not publication')
  requireCheck(pendingToday.every(n => n.publishedAt === state.kstDate + 'T09:00:00+09:00'), 'Pending daily notes must be scheduled for 09:00 KST')
  const [map, rootMap, hub] = await Promise.all(['/sitemap-concerns.xml', '/sitemap.xml', '/concerns'].map(p => get(origin + p)))
  requireCheck(map.status === 200 && rootMap.status === 200 && hub.status === 200, 'Live sitemap or hub unavailable')
  requireCheck(rootMap.html.includes(origin + '/sitemap-concerns.xml'), 'Root sitemap does not include note sitemap')
  const urls = [...map.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  assert.deepEqual([...urls].sort(), [hubUrl, ...publicUrls].sort(), 'Live sitemap does not match source publication schedule')
  const hubDom = parse(hub.html)
  requireCheck(hubDom.querySelector('link[rel="canonical"]')?.getAttribute('href') === hubUrl, 'Wrong hub canonical')
  requireCheck(/^index,/.test(hubDom.querySelector('meta[name="robots"]')?.getAttribute('content') || ''), 'Hub not indexable')
  requireCheck(!/noindex/i.test(hub.headers?.['x-robots-tag'] || ''), 'Hub blocked by HTTP robots header')
  const catalogPages = new Map([[1, hubDom]])
  for (const n of state.allocatedToday.filter(n => publicUrls.has(n.url))) {
    const index = state.currentlyPublicInSource.findIndex(p => p.url === n.url)
    const page = Math.floor(index / 24) + 1
    if (catalogPages.has(page)) continue
    const pagePath = '/concerns?page=' + page
    requireCheck(hubDom.querySelector(`.pn-pagination a[href="${pagePath}"]`), `Hub does not link to catalog page ${page}`)
    const r = await get(origin + pagePath)
    requireCheck(r.status === 200, `Catalog page ${page} unavailable`)
    catalogPages.set(page, parse(r.html))
  }
  const pages = []
  for (const n of state.currentlyPublicInSource) {
    const r = await get(n.url)
    const dom = parse(r.html)
    const main = dom.querySelector('main')
    const robots = (dom.querySelector('meta[name="robots"]')?.getAttribute('content') || '') + ' ' + (r.headers?.['x-robots-tag'] || '')
    const canonical = dom.querySelector('link[rel="canonical"]')?.getAttribute('href')
    const textChars = (main?.text || '').replace(/\s+/g, ' ').trim().length
    requireCheck(r.status === 200, `${n.url}: HTTP ${r.status}`)
    requireCheck(dom.querySelectorAll('h1').length === 1 && dom.querySelector('h1').text === n.title, `${n.url}: title mismatch`)
    requireCheck(canonical === n.url && /^index,/.test(robots) && !/noindex/i.test(robots), `${n.url}: canonical or index mismatch`)
    requireCheck(dom.querySelector('.pn-article section')?.getAttribute('id') === 'your-story', `${n.url}: empathy opening missing`)
    requireCheck(dom.querySelector('.pn-local')?.text.includes(n.region) && dom.querySelector('.pn-say')?.text.includes(n.region), `${n.url}: local context missing`)
    requireCheck(textChars >= 4500 && dom.querySelectorAll('.pn-sources a').length > 0, `${n.url}: substantive content or sources missing`)
    const today = state.allocatedToday.some(t => t.url === n.url)
    if (today) requireCheck([...catalogPages.values()].some(d => d.querySelector(`a[href="/concerns/${n.slug}"]`)), `${n.url}: absent from catalog`)
    pages.push({ ...n, status: r.status, canonical, robots: robots.trim(), mainTextChars: textChars })
  }
  const future = []
  for (const n of state.upcoming) {
    const r = await get(n.url)
    const dom = parse(r.html)
    const robots = (dom.querySelector('meta[name="robots"]')?.getAttribute('content') || '') + ' ' + (r.headers?.['x-robots-tag'] || '')
    requireCheck(r.status === 404 && /noindex/i.test(robots) && !urls.includes(n.url), `${n.url}: future note leaked`)
    requireCheck(!hubDom.querySelector(`a[href="/concerns/${n.slug}"]`), `${n.url}: future note linked from live hub`)
    future.push({ url: n.url, status: r.status, noindex: true })
  }
  return { checkedAt: new Date().toISOString(), kstDate: state.kstDate, stage: pendingToday.length ? 'scheduled' : 'published', today: state.allocatedToday, publicNotes: pages.length, pages, future, sitemapUrls: urls, allPassed: true }
}

async function main() {
  const args = process.argv.slice(2)
  const allowScheduled = args.includes('--allow-scheduled')
  const outputIndex = args.indexOf('--output')
  const output = outputIndex >= 0 ? args[outputIndex + 1] : undefined
  if (outputIndex >= 0 && (!output || output.startsWith('--'))) throw Error('Pass a new output file path after --output')
  const known = args.filter((_, i) => i !== outputIndex + 1 || outputIndex < 0)
  requireCheck(known.every(a => ['--allow-scheduled', '--output'].includes(a)), 'Unknown argument')
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const state = JSON.parse(execFileSync(process.execPath, ['scripts/patient-notes-status.mjs'], { cwd: repo, encoding: 'utf8' }))
  const get = async url => {
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000), headers: { 'user-agent': 'BD-Notes-Publication-Check/2.0', 'cache-control': 'no-cache' } })
    return { status: r.status, headers: Object.fromEntries(r.headers), html: await r.text() }
  }
  let result
  try { result = await auditPublication({ state, get, allowScheduled }) }
  catch (e) { result = { checkedAt: new Date().toISOString(), kstDate: state.kstDate, stage: 'failed', allPassed: false, error: e.message }; process.exitCode = 1 }
  if (output) await writeFile(path.resolve(output), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
  console.log(JSON.stringify({ ...result, pages: result.pages?.map(p => ({ url: p.url, mainTextChars: p.mainTextChars })) }, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e.message); process.exitCode = 1 })
}
