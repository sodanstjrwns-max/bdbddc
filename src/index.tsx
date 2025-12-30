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

// Google Reviews API Proxy (CORS 우회)
const GOOGLE_PLACE_ID = 'ChIJGW_8w4coezURxnwkO_3piX0'
const GOOGLE_API_KEY = 'AIzaSyD9PuRUYq7vHfzXGlqm4v7nakzBUptk2-0'

app.get('/api/google-reviews', async (c) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=rating,user_ratings_total&key=${GOOGLE_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    // 캐시 헤더 설정 (1시간)
    c.header('Cache-Control', 'public, max-age=3600')
    
    return c.json(data)
  } catch (error) {
    return c.json({ 
      status: 'error',
      result: { rating: 4.9, user_ratings_total: 228 }
    }, 500)
  }
})

// 인블로그 RSS 프록시 API (CORS 우회)
app.get('/api/inblog-rss', async (c) => {
  try {
    const response = await fetch('https://proxy.inblog.dev/bdbddc/rss')
    const xmlText = await response.text()
    
    // 캐시 헤더 설정 (10분)
    c.header('Cache-Control', 'public, max-age=600')
    c.header('Content-Type', 'application/xml; charset=utf-8')
    
    return c.text(xmlText)
  } catch (error) {
    return c.text('<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>', 500)
  }
})

// ============================================
// 인블로그 프록시 (/blog/* → bdbddc.inblog.ai)
// ============================================
app.all('/blog/*', async (c) => {
  const path = c.req.path.replace('/blog', '') || '/'
  const inblogUrl = `https://bdbddc.inblog.ai${path}`
  
  try {
    const response = await fetch(inblogUrl, {
      method: c.req.method,
      headers: {
        'Host': 'bdbddc.inblog.ai',
        'X-Forwarded-Host': 'bdbddc.com',
        'X-Forwarded-Proto': 'https',
      },
    })
    
    // HTML 응답인 경우 내부 링크 수정
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('text/html')) {
      let html = await response.text()
      // 인블로그 내부 링크를 /blog로 변환
      html = html.replace(/href="\/(?!blog)/g, 'href="/blog/')
      html = html.replace(/href="https:\/\/bdbddc\.inblog\.ai\//g, 'href="/blog/')
      
      return new Response(html, {
        status: response.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      })
    }
    
    // 기타 리소스는 그대로 전달
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    })
  } catch (error) {
    return c.text('블로그를 불러올 수 없습니다.', 500)
  }
})

app.get('/blog', async (c) => {
  const inblogUrl = 'https://bdbddc.inblog.ai/'
  
  try {
    const response = await fetch(inblogUrl, {
      headers: {
        'Host': 'bdbddc.inblog.ai',
        'X-Forwarded-Host': 'bdbddc.com',
        'X-Forwarded-Proto': 'https',
      },
    })
    
    let html = await response.text()
    html = html.replace(/href="\/(?!blog)/g, 'href="/blog/')
    html = html.replace(/href="https:\/\/bdbddc\.inblog\.ai\//g, 'href="/blog/')
    
    return new Response(html, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    return c.text('블로그를 불러올 수 없습니다.', 500)
  }
})

// Static assets (CSS, JS, images)
app.use('/css/*', serveStatic())
app.use('/js/*', serveStatic())
app.use('/images/*', serveStatic())
app.use('/static/*', serveStatic())

// Other static files
app.use('/manifest.json', serveStatic())
app.use('/sitemap.xml', serveStatic())
app.use('/robots.txt', serveStatic())

// ============================================
// HTML Page Routes - Directory based
// ============================================

// Treatments directory
app.get('/treatments', serveStatic({ path: './treatments/index.html' }))
app.get('/treatments/', serveStatic({ path: './treatments/index.html' }))
app.use('/treatments/*', serveStatic())

// Doctors directory
app.get('/doctors', serveStatic({ path: './doctors/index.html' }))
app.get('/doctors/', serveStatic({ path: './doctors/index.html' }))
app.use('/doctors/*', serveStatic())

// BDX directory
app.get('/bdx', serveStatic({ path: './bdx/index.html' }))
app.get('/bdx/', serveStatic({ path: './bdx/index.html' }))
app.use('/bdx/*', serveStatic())

// Column directory
app.get('/column', serveStatic({ path: './column/columns.html' }))
app.get('/column/', serveStatic({ path: './column/columns.html' }))
app.get('/column/columns', serveStatic({ path: './column/columns.html' }))
app.use('/column/*', serveStatic())

// Video directory
app.get('/video', serveStatic({ path: './video/index.html' }))
app.get('/video/', serveStatic({ path: './video/index.html' }))
app.use('/video/*', serveStatic())

// Cases directory
app.get('/cases', serveStatic({ path: './cases/gallery.html' }))
app.get('/cases/', serveStatic({ path: './cases/gallery.html' }))
app.get('/cases/gallery', serveStatic({ path: './cases/gallery.html' }))
app.use('/cases/*', serveStatic())

// Notice directory
app.get('/notice', serveStatic({ path: './notice/index.html' }))
app.get('/notice/', serveStatic({ path: './notice/index.html' }))
app.use('/notice/*', serveStatic())

// Auth directory
app.get('/auth/login', serveStatic({ path: './auth/login.html' }))
app.use('/auth/*', serveStatic())

// Area directory (지역 페이지)
app.use('/area/*', serveStatic())

// FAQ directory
app.use('/faq/*', serveStatic())

// ============================================
// Root level HTML pages (without .html extension)
// ============================================
app.get('/pricing', serveStatic({ path: './pricing.html' }))
app.get('/reservation', serveStatic({ path: './reservation.html' }))
app.get('/directions', serveStatic({ path: './directions.html' }))
app.get('/faq', serveStatic({ path: './faq.html' }))
app.get('/floor-guide', serveStatic({ path: './floor-guide.html' }))
app.get('/privacy', serveStatic({ path: './privacy.html' }))
app.get('/terms', serveStatic({ path: './terms.html' }))

// Root level HTML files (with .html extension)
app.use('/pricing.html', serveStatic())
app.use('/reservation.html', serveStatic())
app.use('/directions.html', serveStatic())
app.use('/faq.html', serveStatic())
app.use('/floor-guide.html', serveStatic())
app.use('/privacy.html', serveStatic())
app.use('/terms.html', serveStatic())

// Homepage
app.get('/', serveStatic({ path: './index.html' }))

// Fallback for any .html file
app.use('/*.html', serveStatic())

// Catch-all fallback to index.html (SPA style, but not needed here)
// app.get('*', serveStatic({ path: './index.html' }))

export default app
