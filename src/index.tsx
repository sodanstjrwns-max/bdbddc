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

// 301 Redirect: /column/* → /blog/ (SEO migration)
app.get('/column/columns.html', (c) => c.redirect('/blog/', 301))
app.get('/column/columns', (c) => c.redirect('/blog/', 301))
app.get('/column/', (c) => c.redirect('/blog/', 301))
app.get('/column', (c) => c.redirect('/blog/', 301))

// 301 Redirect: old .html URLs → clean URLs (prevent 308 chain)
app.get('/directions.html', (c) => c.redirect('/directions', 301))
app.get('/pricing.html', (c) => c.redirect('/pricing', 301))
app.get('/reservation.html', (c) => c.redirect('/reservation', 301))
app.get('/faq.html', (c) => c.redirect('/faq', 301))
app.get('/floor-guide.html', (c) => c.redirect('/floor-guide', 301))
app.get('/privacy.html', (c) => c.redirect('/privacy', 301))
app.get('/terms.html', (c) => c.redirect('/terms', 301))
app.get('/mission.html', (c) => c.redirect('/mission', 301))
app.get('/index.html', (c) => c.redirect('/', 301))

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
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=rating,user_ratings_total,reviews,url&key=${GOOGLE_API_KEY}&language=ko&reviews_sort=newest`
    
    const response = await fetch(url)
    const data: any = await response.json()
    
    // 캐시 헤더 설정 (1시간)
    c.header('Cache-Control', 'public, max-age=3600')
    
    // 리뷰 데이터 정제
    const reviews = (data?.result?.reviews || []).map((r: any) => ({
      author_name: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.time,
      relative_time_description: r.relative_time_description,
      profile_photo_url: r.profile_photo_url
    }))

    return c.json({
      status: data.status,
      result: {
        rating: data?.result?.rating || 4.9,
        user_ratings_total: data?.result?.user_ratings_total || 2847,
        url: data?.result?.url || 'https://g.page/seoulbd-dental',
        reviews: reviews
      }
    })
  } catch (error) {
    return c.json({ 
      status: 'error',
      result: { rating: 4.9, user_ratings_total: 2847, url: '', reviews: [] }
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

// 유튜브 영상 캐시 JSON 제공 (빌드 시 생성됨)
// 정적 파일: /data/youtube-cache.json (public/data/youtube-cache.json)
app.use('/data/*', serveStatic())

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
app.use('/llms.txt', serveStatic())

// ============================================
// IndexNow API Key Verification File
// ============================================
const INDEXNOW_KEY = '6f74445f7ec14eccb522a4d3f253128c'

// Serve key file directly (fallback if static file not found)
app.get(`/${INDEXNOW_KEY}.txt`, (c) => {
  c.header('Content-Type', 'text/plain; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=86400')
  return c.text(INDEXNOW_KEY)
})

// IndexNow Submit API (서버사이드에서 Bing/Yandex/Naver에 즉시 색인 요청)
app.post('/api/indexnow', async (c) => {
  const SITE_HOST = 'bdbddc.com'
  const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`
  
  // 색인할 전체 URL 목록
  const urlList: string[] = [
    '/',
    '/reservation', '/pricing', '/directions',
    '/treatments/', '/treatments/implant', '/treatments/invisalign',
    '/treatments/pediatric', '/treatments/aesthetic', '/treatments/glownate',
    '/treatments/cavity', '/treatments/resin', '/treatments/crown',
    '/treatments/inlay', '/treatments/root-canal', '/treatments/re-root-canal',
    '/treatments/whitening', '/treatments/bridge', '/treatments/denture',
    '/treatments/scaling', '/treatments/gum', '/treatments/periodontitis',
    '/treatments/gum-surgery', '/treatments/wisdom-tooth', '/treatments/apicoectomy',
    '/treatments/prevention', '/treatments/tmj', '/treatments/bruxism',
    '/treatments/emergency',
    '/doctors/', '/doctors/moon', '/doctors/kim', '/doctors/hyun',
    '/doctors/choi', '/doctors/lee', '/doctors/park', '/doctors/kang',
    '/doctors/jo', '/doctors/seo', '/doctors/lim',
    '/doctors/kim-mg', '/doctors/kim-mj', '/doctors/kang-mj',
    '/doctors/park-sb', '/doctors/lee-bm',
    '/blog/', '/video/', '/cases/', '/cases/gallery',
    '/encyclopedia/',
    '/mission', '/floor-guide', '/faq', '/notice/',
    '/faq/implant', '/faq/orthodontics',
    // 28개 지역 페이지 (area) - clean URLs
    '/area/cheonan', '/area/asan', '/area/buldang',
    '/area/daejeon', '/area/sejong',
    '/area/pyeongtaek', '/area/anseong',
    '/area/cheongju', '/area/chungju', '/area/jincheon',
    '/area/yesan', '/area/hongseong', '/area/dangjin',
    '/area/seosan', '/area/nonsan', '/area/gongju',
    '/area/cheongyang', '/area/osan', '/area/gyeryong',
    '/area/buyeo', '/area/seocheon', '/area/boryeong',
    '/area/taean', '/area/geumsan', '/area/okcheon',
    '/area/yeongdong', '/area/eumseong', '/area/yeongi',
    '/privacy', '/terms',
    // 500개 백과사전 개별 URL은 sitemap.xml에서 자동 인덱싱되므로 여기서는 주요 URL만 제출
  ].map(p => `https://${SITE_HOST}${p}`)

  // IndexNow 엔드포인트 (Bing, Yandex, Naver 동시 제출)
  const engines = [
    { name: 'Bing/IndexNow', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Bing Direct', url: 'https://www.bing.com/indexnow' },
    { name: 'Yandex', url: 'https://yandex.com/indexnow' },
    { name: 'Naver', url: 'https://searchadvisor.naver.com/indexnow' },
  ]

  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList,
  }

  const results: Array<{ engine: string; status: number | string; ok: boolean }> = []

  for (const engine of engines) {
    try {
      const resp = await fetch(engine.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      })
      results.push({ engine: engine.name, status: resp.status, ok: resp.ok || resp.status === 200 || resp.status === 202 })
    } catch (err) {
      results.push({ engine: engine.name, status: `error: ${(err as Error).message}`, ok: false })
    }
  }

  return c.json({
    submitted: urlList.length,
    key: INDEXNOW_KEY,
    results,
    timestamp: new Date().toISOString(),
  })
})

// Google Ping API (sitemap 변경 알림)
app.post('/api/google-ping', async (c) => {
  const sitemapUrl = 'https://bdbddc.com/sitemap.xml'
  const pingUrls = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ]

  const results: Array<{ engine: string; status: number | string; ok: boolean }> = []

  for (const pingUrl of pingUrls) {
    try {
      const resp = await fetch(pingUrl)
      results.push({ engine: 'Google', status: resp.status, ok: resp.ok })
    } catch (err) {
      results.push({ engine: 'Google', status: `error: ${(err as Error).message}`, ok: false })
    }
  }

  return c.json({
    sitemap: sitemapUrl,
    results,
    timestamp: new Date().toISOString(),
  })
})

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

// Column directory - handled by 301 redirects above, no static serving needed

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

// Encyclopedia directory (치과 백과사전)
app.get('/encyclopedia', serveStatic({ path: './encyclopedia/index.html' }))
app.get('/encyclopedia/', serveStatic({ path: './encyclopedia/index.html' }))

// ============================================
// 백과사전 개별 용어 페이지 (SSR - SEO 500개 URL)
// /encyclopedia/:term → 각 용어별 전용 페이지
// ============================================
import encyclopediaData from '../public/data/encyclopedia.json'

const encItems: Array<{id:number; term:string; chosung?:string; category:string; short:string; detail:string; tags?:string[]; synonyms?:string[]; link?:string}> = (encyclopediaData as any).items || []

app.get('/encyclopedia/:term', (c) => {
  const termParam = decodeURIComponent(c.req.param('term'))
  
  // 용어 찾기 (정확 매치 → 동의어 매치)
  let item = encItems.find(i => i.term === termParam)
  if (!item) {
    item = encItems.find(i => (i.synonyms || []).includes(termParam))
  }
  
  if (!item) {
    // 404 - 백과사전 목록으로 리다이렉트
    return c.redirect('/encyclopedia/', 302)
  }

  const term = item.term
  const encodedTerm = encodeURIComponent(term)
  const canonicalUrl = `https://bdbddc.com/encyclopedia/${encodedTerm}`
  const synonymsText = item.synonyms && item.synonyms.length ? item.synonyms.join(', ') : ''
  const tagsHtml = (item.tags || []).map(t => `<span style="display:inline-block;font-size:0.8rem;padding:4px 12px;border-radius:50px;background:#f5f0eb;color:#6B4226;margin:0 4px 4px 0;">#${t}</span>`).join('')
  
  // #1: 진료 페이지 연결 링크 (item.link 활용)
  const treatmentLinkHtml = item.link ? `
<div style="background:#fff;border:2px solid #c9a96e;border-radius:16px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
<div>
<p style="font-size:0.85rem;color:#888;margin:0 0 4px;"><i class="fas fa-stethoscope" style="color:#c9a96e;margin-right:4px;"></i> 관련 진료과목</p>
<p style="font-size:1.05rem;font-weight:700;color:#333;margin:0;">${term} 진료 상세 보기</p>
</div>
<a href="${item.link}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.9rem;white-space:nowrap;"><i class="fas fa-arrow-right"></i> 진료 안내 바로가기</a>
</div>` : ''

  // 이전/다음 용어 네비게이션
  const currentIdx = encItems.findIndex(i => i.id === item!.id)
  const prevItem = currentIdx > 0 ? encItems[currentIdx - 1] : null
  const nextItem = currentIdx < encItems.length - 1 ? encItems[currentIdx + 1] : null

  // 같은 카테고리 관련 용어 (최대 8개)
  const relatedItems = encItems.filter(i => i.category === item!.category && i.id !== item!.id).slice(0, 8)
  const relatedHtml = relatedItems.map(r => {
    const hasLink = r.link ? `<span style="font-size:0.7rem;color:#c9a96e;float:right;"><i class="fas fa-stethoscope"></i></span>` : ''
    return `<a href="/encyclopedia/${encodeURIComponent(r.term)}" style="display:block;padding:12px 16px;background:#fff;border:1px solid #e8e0d8;border-radius:12px;text-decoration:none;color:#333;transition:all 0.2s;"><strong style="color:#6B4226;">${r.term}</strong>${hasLink}<br><span style="font-size:0.85rem;color:#888;">${r.short.slice(0, 40)}...</span></a>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<title>${term} | 치과 백과사전 — 서울비디치과</title>
<meta name="description" content="${term}이란? ${item.short} — 서울비디치과 치과 백과사전. 서울대 출신 전문의가 감수한 정확한 치과 정보.">
<meta name="keywords" content="${term}, ${item.category}, 치과 용어, 서울비디치과, ${(item.synonyms || []).join(', ')}">
<meta name="author" content="서울비디치과">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${term} | 치과 백과사전 — 서울비디치과">
<meta property="og:description" content="${term}이란? ${item.short}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="서울비디치과">
<meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${term} | 치과 백과사전 — 서울비디치과">
<meta name="twitter:description" content="${term}이란? ${item.short}">
<meta name="twitter:image" content="https://bdbddc.com/images/og-image.jpg">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/site-v5.css?v=0bc368ac">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"치과 백과사전","item":"https://bdbddc.com/encyclopedia/"},{"@type":"ListItem","position":3,"name":"${term}","item":"${canonicalUrl}"}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"DefinedTerm","name":"${term}","description":"${item.short} ${item.detail}","inDefinedTermSet":{"@type":"DefinedTermSet","name":"서울비디치과 치과 백과사전","url":"https://bdbddc.com/encyclopedia/"},"url":"${canonicalUrl}"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"${term}이란 무엇인가요?","acceptedAnswer":{"@type":"Answer","text":"${item.short} ${item.detail}"}},{"@type":"Question","name":"${term} 치료는 서울비디치과에서 가능한가요?","acceptedAnswer":{"@type":"Answer","text":"네, 서울비디치과는 서울대 출신 15인 전문의 협진 시스템으로 ${item.category} 분야를 포함한 종합 치과 진료를 제공합니다. 365일 진료, 전화 041-415-2892로 상담 예약하세요."}}]}
</script>
<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
<script>Weglot.initialize({ api_key: 'wg_60caborb1mso4g2k2c8qe1' });</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<header class="site-header" id="siteHeader">
<div class="header-container">
<div class="header-brand">
<a href="/" class="site-logo" aria-label="서울비디치과 홈"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a>
</div>
<div class="header-actions">
<a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
<a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
</div>
</div>
</header>
<div class="header-spacer"></div>

<main id="main-content" role="main">
<nav class="content-tabs">
<a href="/blog/" class="tab-btn"><i class="fas fa-blog"></i> 블로그</a>
<a href="/video/" class="tab-btn"><i class="fab fa-youtube"></i> 영상</a>
<a href="/cases/gallery" class="tab-btn"><i class="fas fa-images"></i> 비포/애프터</a>
<a href="/encyclopedia/" class="tab-btn active"><i class="fas fa-book-medical"></i> 백과사전</a>
</nav>

<section class="content-section" style="padding: 40px 0 60px;">
<div class="container" style="max-width: 800px;">

<nav style="font-size:0.85rem;color:#888;margin-bottom:24px;">
<a href="/" style="color:#6B4226;text-decoration:none;">홈</a> &gt;
<a href="/encyclopedia/" style="color:#6B4226;text-decoration:none;">치과 백과사전</a> &gt;
<span>${term}</span>
</nav>

<article itemscope itemtype="https://schema.org/DefinedTerm">
<header style="margin-bottom:32px;">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
<span style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:#f5f0eb;color:#6B4226;font-weight:800;font-size:1.3rem;border-radius:12px;">${item.chosung || ''}</span>
<h1 itemprop="name" style="font-size:2rem;font-weight:800;color:#333;margin:0;">${term}</h1>
</div>
${synonymsText ? `<p style="font-size:0.9rem;color:#888;margin-bottom:8px;">동의어: ${synonymsText}</p>` : ''}
<span style="display:inline-block;font-size:0.8rem;font-weight:600;padding:4px 14px;border-radius:50px;background:#f5f0eb;color:#6B4226;">${item.category}</span>
</header>

<div style="background:#faf7f3;border-left:4px solid #c9a96e;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:24px;">
<p itemprop="description" style="font-size:1.1rem;font-weight:600;color:#333;line-height:1.7;margin:0;">${item.short}</p>
</div>

<div style="font-size:1rem;color:#555;line-height:1.9;margin-bottom:24px;">
<h2 style="font-size:1.2rem;font-weight:700;color:#333;margin-bottom:12px;"><i class="fas fa-info-circle" style="color:#c9a96e;margin-right:6px;"></i> 상세 설명</h2>
<p>${item.detail}</p>
</div>

${tagsHtml ? `<div style="margin-bottom:32px;">${tagsHtml}</div>` : ''}

${treatmentLinkHtml}

<div style="background:linear-gradient(135deg, #6B4226, #8B5E3C);border-radius:16px;padding:28px 24px;text-align:center;color:#fff;margin-bottom:40px;">
<p style="font-size:1.1rem;font-weight:600;margin-bottom:16px;">${term}에 대해 더 궁금하신가요?</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
<a href="/reservation" style="display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:#fff;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem;"><i class="fas fa-calendar-check"></i> 무료 상담 예약</a>
<a href="tel:041-415-2892" style="display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:rgba(255,255,255,0.15);color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid rgba(255,255,255,0.3);"><i class="fas fa-phone"></i> 041-415-2892</a>
</div>
</div>

${relatedHtml ? `
<div style="margin-bottom:40px;">
<h2 style="font-size:1.2rem;font-weight:700;color:#333;margin-bottom:16px;"><i class="fas fa-book-medical" style="color:#c9a96e;margin-right:6px;"></i> 같은 카테고리: ${item.category}</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;">
${relatedHtml}
</div>
</div>
` : ''}

<div style="display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid #e8e0d8;flex-wrap:wrap;gap:10px;">
${prevItem ? `<a href="/encyclopedia/${encodeURIComponent(prevItem.term)}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.85rem;"><i class="fas fa-chevron-left"></i> ${prevItem.term}</a>` : '<span></span>'}
<a href="/encyclopedia/" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.85rem;"><i class="fas fa-th"></i> 전체 보기</a>
${nextItem ? `<a href="/encyclopedia/${encodeURIComponent(nextItem.term)}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.85rem;">${nextItem.term} <i class="fas fa-chevron-right"></i></a>` : '<span></span>'}
</div>
</article>

</div>
</section>
</main>

<footer class="footer" role="contentinfo">
<div class="container">
<div class="footer-legal">
<p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수합니다.</p>
<p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
</div>
</div>
</footer>

<script src="/js/main.js" defer></script>
<script src="/js/gnb.js" defer></script>
</body>
</html>`

  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return c.html(html)
})

// ============================================
// 백과사전 카테고리별 페이지 (SSR - 11개 카테고리 URL)
// /encyclopedia/category/:name → 카테고리별 용어 목록
// ============================================
const encCategories = [...new Set(encItems.map(i => i.category))]

app.get('/encyclopedia/category/:name', (c) => {
  const catName = decodeURIComponent(c.req.param('name'))
  
  if (!encCategories.includes(catName)) {
    return c.redirect('/encyclopedia/', 302)
  }
  
  const catItems = encItems.filter(i => i.category === catName)
  const canonicalUrl = `https://bdbddc.com/encyclopedia/category/${encodeURIComponent(catName)}`
  
  const itemCards = catItems.map(item => {
    const linkBadge = item.link ? `<span style="font-size:0.7rem;color:#c9a96e;float:right;" title="진료 안내 연결"><i class="fas fa-stethoscope"></i></span>` : ''
    return `<a href="/encyclopedia/${encodeURIComponent(item.term)}" style="display:block;padding:14px 16px;background:#fff;border:1px solid #e8e0d8;border-radius:12px;text-decoration:none;color:#333;transition:all 0.2s;">
      <strong style="color:#6B4226;">${item.term}</strong>${linkBadge}
      <span style="display:block;font-size:0.85rem;color:#888;margin-top:4px;">${item.short.slice(0, 50)}${item.short.length > 50 ? '...' : ''}</span>
    </a>`
  }).join('')
  
  const otherCats = encCategories.filter(c2 => c2 !== catName).map(c2 =>
    `<a href="/encyclopedia/category/${encodeURIComponent(c2)}" style="display:inline-block;padding:8px 16px;background:#fff;border:1px solid #e8e0d8;border-radius:50px;text-decoration:none;color:#555;font-size:0.85rem;font-weight:500;">${c2}</a>`
  ).join('')

  const catHtml = `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<title>${catName} — 치과 백과사전 | 서울비디치과 (${catItems.length}개 용어)</title>
<meta name="description" content="${catName} 관련 치과 용어 ${catItems.length}개를 쉽게 알아보세요. 서울대 출신 전문의가 감수한 정확한 치과 정보 — 서울비디치과 치과 백과사전.">
<meta name="keywords" content="${catName}, 치과 용어, 치과 백과사전, 서울비디치과">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${catName} — 치과 백과사전 | 서울비디치과">
<meta property="og:description" content="${catName} 관련 ${catItems.length}개 용어 모아보기">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="서울비디치과">
<meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${catName} — 치과 백과사전 | 서울비디치과">
<meta name="twitter:description" content="${catName} 관련 ${catItems.length}개 용어 모아보기">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/site-v5.css?v=0bc368ac">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"치과 백과사전","item":"https://bdbddc.com/encyclopedia/"},{"@type":"ListItem","position":3,"name":"${catName}","item":"${canonicalUrl}"}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"${catName} — 치과 백과사전","description":"${catName} 관련 치과 용어 ${catItems.length}개","url":"${canonicalUrl}","isPartOf":{"@type":"WebSite","name":"서울비디치과","url":"https://bdbddc.com"},"numberOfItems":${catItems.length}}
</script>
<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
<script>Weglot.initialize({ api_key: 'wg_60caborb1mso4g2k2c8qe1' });</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<header class="site-header" id="siteHeader">
<div class="header-container">
<div class="header-brand">
<a href="/" class="site-logo" aria-label="서울비디치과 홈"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a>
</div>
<div class="header-actions">
<a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
<a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
</div>
</div>
</header>
<div class="header-spacer"></div>

<main id="main-content" role="main">
<nav class="content-tabs">
<a href="/blog/" class="tab-btn"><i class="fas fa-blog"></i> 블로그</a>
<a href="/video/" class="tab-btn"><i class="fab fa-youtube"></i> 영상</a>
<a href="/cases/gallery" class="tab-btn"><i class="fas fa-images"></i> 비포/애프터</a>
<a href="/encyclopedia/" class="tab-btn active"><i class="fas fa-book-medical"></i> 백과사전</a>
</nav>

<section class="content-section" style="padding:40px 0 60px;">
<div class="container" style="max-width:900px;">

<nav style="font-size:0.85rem;color:#888;margin-bottom:24px;">
<a href="/" style="color:#6B4226;text-decoration:none;">홈</a> &gt;
<a href="/encyclopedia/" style="color:#6B4226;text-decoration:none;">치과 백과사전</a> &gt;
<span>${catName}</span>
</nav>

<div style="margin-bottom:32px;">
<h1 style="font-size:1.8rem;font-weight:800;color:#333;margin-bottom:8px;"><i class="fas fa-folder-open" style="color:#c9a96e;margin-right:8px;"></i>${catName}</h1>
<p style="font-size:1rem;color:#666;">총 <strong style="color:#6B4226;">${catItems.length}개</strong> 용어</p>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;margin-bottom:40px;">
${itemCards}
</div>

<div style="margin-bottom:32px;">
<h2 style="font-size:1.1rem;font-weight:700;color:#333;margin-bottom:12px;">다른 카테고리</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px;">
${otherCats}
</div>
</div>

<div style="text-align:center;padding-top:20px;border-top:1px solid #e8e0d8;">
<a href="/encyclopedia/" style="display:inline-flex;align-items:center;gap:6px;padding:12px 28px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;"><i class="fas fa-th"></i> 전체 500개 용어 보기</a>
</div>

</div>
</section>
</main>

<footer class="footer" role="contentinfo">
<div class="container">
<div class="footer-legal">
<p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수합니다.</p>
<p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
</div>
</div>
</footer>

<script src="/js/main.js" defer></script>
<script src="/js/gnb.js" defer></script>
</body>
</html>`

  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return c.html(catHtml)
})

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
app.get('/blueprint', serveStatic({ path: './blueprint.html' }))

// Root level HTML files with .html extension → handled by 301 redirects above

// Homepage
app.get('/', serveStatic({ path: './index.html' }))

// Fallback for any .html file
app.use('/*.html', serveStatic())

// Catch-all fallback to index.html (SPA style, but not needed here)
// app.get('*', serveStatic({ path: './index.html' }))

export default app
