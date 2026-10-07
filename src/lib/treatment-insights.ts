import type { Hono, Context } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import type { Bindings } from '../types'
import links from '../data/treatment-insight-links.json'
import { visiblePatientNotes } from '../data/patient-notes'

type SiteApp = Hono<{ Bindings: Bindings }>
const h = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
const normal = (s: string) => s.replace(/\.html$/, '').replace(/\/$/, '')
const treatments = new Map(links.flatMap(t => t.treatments.map(slug => [slug, t] as const)))

/** Public, contextual links only. No main navigation or hidden crawler-only text. */
export function registerTreatmentInsightLinks(app: SiteApp) {
  app.use('*', async (c, next) => {
    const path = normal(new URL(c.req.url).pathname)
    if (!path.startsWith('/treatments/') && !path.startsWith('/concerns/')) return next()
    let topic = treatments.get(path.slice('/treatments/'.length))
    if (path.startsWith('/concerns/')) {
      const note = visiblePatientNotes().find(n => '/concerns/' + n.slug === path)
      topic = note?.related.map(r => treatments.get(normal(r.href).replace(/^\/treatments\//, ''))).find(Boolean)
    }
    if (!topic || topic.mode === 'existing-treatment' && path === topic.path) return next()
    await next()
    if (c.res.status !== 200 || !c.res.headers.get('content-type')?.includes('text/html')) return
    let html = await c.res.text()
    const headers = new Headers(c.res.headers)
    headers.delete('content-length'); headers.delete('etag')
    if (!html.includes('data-treatment-insight-link')) {
      const target = topic.path + (topic.mode === 'existing-treatment' ? '#inside-out' : '')
      const card = `<section class="io-context" data-treatment-insight-link aria-label="치료의 안과 밖"><p class="io-context-label">치료의 안과 밖</p><p>기대할 수 있는 장점부터 부담과 한계, 적응증·금기증·주의사항까지 함께 살펴보세요.</p><a href="${h(target)}">${h(topic.name)}, 그 안과 밖 <span aria-hidden="true">→</span></a></section>`
      if (!html.includes('/css/treatment-insights.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/treatment-insights.css?v=20261007"></head>')
      html = html.includes('</main>') ? html.replace('</main>', card + '</main>') : html.replace(/<footer\b/, card + '<footer')
    }
    c.res = new Response(html, { status: c.res.status, headers })
  })
}

/** Register before the legacy /guide/* redirect fallback; unknown new slugs are real 404s. */
export function registerTreatmentInsightRoutes(app: SiteApp) {
  for (const t of links.filter(t => t.mode === 'new-guide')) {
    app.get(t.path, serveStatic())
    app.get(t.path + '.html', c => c.redirect(t.path, 301))
    app.get(t.path + '/', c => c.redirect(t.path, 301))
  }
  for (const t of links.filter(t => t.mode === 'existing-guide')) {
    app.get(t.path + '/', c => c.redirect(t.path, 301))
  }
  const missing = (c: Context<{ Bindings: Bindings }>) => {
    c.header('X-Robots-Tag', 'noindex')
    return c.html('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>안내를 찾을 수 없습니다 | 서울비디치과</title></head><body><main><h1>안내를 찾을 수 없습니다</h1><p><a href="/treatments/">진료 안내에서 다시 찾아주세요.</a></p></main></body></html>', 404)
  }
  app.get('/guide/inside-out', missing)
  app.get('/guide/inside-out/*', missing)
}
