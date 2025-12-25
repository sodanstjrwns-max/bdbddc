import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'

type Bindings = {
  DB?: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS for API
app.use('/api/*', cors())

// API health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: '서울비디치과 API 서버 정상 작동 중',
    timestamp: new Date().toISOString()
  })
})

// Serve all static files - Cloudflare Pages style
// The serveStatic middleware will serve files from the build output directory (dist/)
// All files in public/ are copied to dist/ during build

// Static assets
app.use('/css/*', serveStatic())
app.use('/js/*', serveStatic())
app.use('/images/*', serveStatic())
app.use('/static/*', serveStatic())

// Other static files
app.use('/manifest.json', serveStatic())
app.use('/sitemap.xml', serveStatic())
app.use('/robots.txt', serveStatic())

// HTML pages - all directories
app.use('/treatments/*', serveStatic())
app.use('/doctors/*', serveStatic())
app.use('/bdx/*', serveStatic())
app.use('/column/*', serveStatic())
app.use('/video/*', serveStatic())
app.use('/cases/*', serveStatic())
app.use('/notice/*', serveStatic())
app.use('/auth/*', serveStatic())
app.use('/area/*', serveStatic())
app.use('/faq/*', serveStatic())

// Root level HTML files
app.use('/reservation.html', serveStatic())
app.use('/directions.html', serveStatic())
app.use('/faq.html', serveStatic())
app.use('/floor-guide.html', serveStatic())
app.use('/pricing.html', serveStatic())
app.use('/privacy.html', serveStatic())
app.use('/terms.html', serveStatic())

// Homepage
app.get('/', serveStatic({ path: './index.html' }))

// Fallback - serve any .html file
app.use('/*.html', serveStatic())

export default app
