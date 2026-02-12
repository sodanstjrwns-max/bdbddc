import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'

type Bindings = {
  DB?: D1Database
  OPENAI_API_KEY?: string
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
    const response = await fetch('https://inblog.ai/bdbddc/rss')
    const xmlText = await response.text()
    
    c.header('Cache-Control', 'public, max-age=600')
    c.header('Content-Type', 'application/xml; charset=utf-8')
    c.header('Access-Control-Allow-Origin', '*')
    
    return c.text(xmlText)
  } catch (error) {
    return c.text('<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>', 500)
  }
})

// 유튜브 RSS 프록시 API (CORS 우회)
app.get('/api/youtube-rss', async (c) => {
  try {
    const channelId = 'UCakJiVviUa_FJvFWgW_FDBw' // 쉽디 쉬운 치과이야기
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
    const xmlText = await response.text()
    
    c.header('Cache-Control', 'public, max-age=600')
    c.header('Content-Type', 'application/xml; charset=utf-8')
    c.header('Access-Control-Allow-Origin', '*')
    
    return c.text(xmlText)
  } catch (error) {
    return c.text('<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"></feed>', 500)
  }
})

// ============================================
// GPT 챗봇 API
// ============================================

const SYSTEM_PROMPT = `당신은 서울비디치과의 친절한 AI 상담 도우미입니다. 

## 병원 정보
- 병원명: 서울비디치과
- 위치: 충남 천안시 서북구 불당34길 14 (불당동)
- 전화: 041-415-2892
- 진료시간:
  - 평일: 09:00 ~ 20:00
  - 토요일: 09:00 ~ 17:00
  - 일요일: 09:00 ~ 17:00
  - 공휴일: 09:00 ~ 13:00
- 특징: 365일 진료, 서울대 출신 15인 원장 협진

## 주요 진료 과목
1. 임플란트 (6개 수술실 보유, 네비게이션 임플란트)
2. 인비절라인 교정 (다이아몬드 등급)
3. 소아치과 (전문의 3인, 웃음가스/수면치료)
4. 심미치료 (라미네이트, 레진)
5. 일반치료 (충치, 신경치료, 스케일링)

## 비용 안내 (비급여)
- 임플란트: 스트라우만 BLX 160만원, 오스템 SOI 100만원, 오스템 CA 80만원
- 교정: 인비절라인 컴프리헨시브 700만원, 라이트 450만원, 클리피씨 500만원
- 심미: 지르코니아 크라운 55만원, 글로우 프리미엄 80만원

## 응답 규칙
1. 친절하고 전문적인 톤으로 응답
2. 구체적인 진료 상담은 내원 상담 권유
3. 예약은 전화(041-415-2892) 또는 온라인 예약 페이지 안내
4. 응답은 간결하게 2-3문장으로
5. 이모지를 적절히 사용해 친근하게
6. 정확하지 않은 정보는 "정확한 상담을 위해 내원 상담을 권해드려요"로 안내`

app.post('/api/chat', async (c) => {
  try {
    const { message, history = [] } = await c.req.json()
    const apiKey = c.env?.OPENAI_API_KEY || ''
    
    if (!message) {
      return c.json({ error: '메시지가 필요합니다.' }, 400)
    }
    
    if (!apiKey) {
      return c.json({ error: 'API 키가 설정되지 않았습니다.' }, 500)
    }
    
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6), // 최근 6개 대화만 유지
      { role: 'user', content: message }
    ]
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API Error:', error)
      return c.json({ error: 'AI 응답 생성에 실패했습니다.' }, 500)
    }
    
    const data = await response.json() as { choices: Array<{ message: { content: string } }> }
    const reply = data.choices[0]?.message?.content || '죄송합니다. 응답을 생성하지 못했습니다.'
    
    return c.json({ reply })
    
  } catch (error) {
    console.error('Chat API Error:', error)
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500)
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

// Admin directory
app.get('/admin', serveStatic({ path: './admin/index.html' }))
app.get('/admin/', serveStatic({ path: './admin/index.html' }))
app.use('/admin/*', serveStatic())

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
app.get('/mission', serveStatic({ path: './mission.html' }))

// Root level HTML files (with .html extension)
app.use('/pricing.html', serveStatic())
app.use('/reservation.html', serveStatic())
app.use('/directions.html', serveStatic())
app.use('/faq.html', serveStatic())
app.use('/floor-guide.html', serveStatic())
app.use('/privacy.html', serveStatic())
app.use('/terms.html', serveStatic())
app.use('/mission.html', serveStatic())

// Homepage
app.get('/', serveStatic({ path: './index.html' }))

// Fallback for any .html file
app.use('/*.html', serveStatic())

// Catch-all fallback to index.html (SPA style, but not needed here)
// app.get('*', serveStatic({ path: './index.html' }))

export default app
