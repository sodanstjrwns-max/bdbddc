import type { Hono } from 'hono'
import { normalizeFaviconHead } from './favicon-head.mjs'

/** Register before routes so dynamic and Worker-served HTML use the build's icon set. */
export function registerFaviconResponse(app: Hono<any>) {
  app.use('*', async (c, next) => {
    await next()
    if (c.req.method === 'HEAD' || c.res.status !== 200 || !c.res.headers.get('content-type')?.includes('text/html')) return
    const original = c.res
    const html = await original.text()
    const updated = normalizeFaviconHead(html).replace(/(\/js\/gnb-v2\.js)(?:\?v=[^"'\s>]*)?(?=["'])/g, '$1?v=20261014retreatment2')
    const headers = new Headers(original.headers)
    // Keep existing Cache-Control, CSP, cookies and preview noindex policies intact.
    c.res = new Response(updated, { status: original.status, statusText: original.statusText, headers })
    if (updated !== html) {
      // Hono merges original response headers on assignment, so remove stale validators afterward.
      c.header('content-length', undefined)
      c.header('etag', undefined)
    }
  })
}
