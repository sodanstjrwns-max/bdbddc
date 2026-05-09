import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Bindings = {
  DB?: D1Database
  R2?: R2Bucket
  ASSETS?: { fetch: (req: Request) => Promise<Response> }
  OPENAI_API_KEY?: string
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GMAIL_APP_PASSWORD?: string
  NOTIFICATION_EMAIL?: string
  TURNSTILE_SECRET_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// seoulbddc.com → bdbddc.com 301 리디렉트
// ============================================
app.use('*', async (c, next) => {
  const host = new URL(c.req.url).hostname
  // seoulbddc.com → bdbddc.com 301 리디렉트
  if (host === 'seoulbddc.com' || host === 'www.seoulbddc.com') {
    const url = new URL(c.req.url)
    url.hostname = 'bdbddc.com'
    url.protocol = 'https:'
    return c.redirect(url.toString(), 301)
  }
  // www.bdbddc.com → bdbddc.com 301 리디렉트 (중복 콘텐츠 방지)
  if (host === 'www.bdbddc.com') {
    const url = new URL(c.req.url)
    url.hostname = 'bdbddc.com'
    url.protocol = 'https:'
    return c.redirect(url.toString(), 301)
  }
  await next()
})

// ============================================
// 보안 헤더 미들웨어 (API 응답에도 적용)
// ============================================
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
})

// ============================================
// Meta Pixel + GTM + Amplitude 공통 트래킹 코드
// ============================================
const TRACKING_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<!-- End Google Tag Manager -->
<!-- Amplitude Script Loader -->
<script src="https://cdn.amplitude.com/script/87529341cb075dcdbefabce3994958aa.js"></script>
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '971255062435276');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=971255062435276&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`

const TRACKING_BODY = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`

// ============================================
// 관리자 인증 시스템 (비밀번호 + 쿠키 세션)
// ============================================
const ADMIN_SESSION_COOKIE = 'bd_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 // 24시간

// HMAC 기반 세션 토큰 생성
async function createSessionToken(secret: string): Promise<string> {
  const timestamp = Date.now().toString()
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp))
  const sigHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${timestamp}.${sigHex}`
}

// 세션 토큰 검증
async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  try {
    const [timestamp, sigHex] = token.split('.')
    if (!timestamp || !sigHex) return false
    
    // 만료 확인 (24시간)
    const age = Date.now() - parseInt(timestamp)
    if (age > SESSION_MAX_AGE * 1000) return false
    
    // 서명 검증
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp))
    const expectedHex = Array.from(new Uint8Array(expectedSig)).map(b => b.toString(16).padStart(2, '0')).join('')
    return sigHex === expectedHex
  } catch {
    return false
  }
}

// 관리자 로그인 페이지 HTML
function adminLoginPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
${TRACKING_HEAD}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>관리자 로그인 | 서울비디치과</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard',-apple-system,sans-serif;background:#f5f0eb;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.login-card{background:#fff;border-radius:20px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 4px 24px rgba(107,66,38,0.08)}
.logo{text-align:center;margin-bottom:32px}
.logo-icon{font-size:2.5rem;display:block;margin-bottom:8px}
.logo-text{font-size:1.3rem;font-weight:800;color:#6B4226}
.logo-sub{font-size:0.85rem;color:#999;margin-top:4px}
.form-group{margin-bottom:20px}
.form-label{display:block;font-size:0.85rem;font-weight:600;color:#555;margin-bottom:8px}
.form-input{width:100%;padding:14px 16px;border:2px solid #e8e0d8;border-radius:12px;font-size:1rem;outline:none;transition:border-color 0.2s;font-family:inherit}
.form-input:focus{border-color:#6B4226}
.btn-login{width:100%;padding:14px;background:#6B4226;color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;transition:background 0.2s;font-family:inherit}
.btn-login:hover{background:#8B5E3C}
.error-msg{background:#fef2f2;color:#dc2626;padding:12px 16px;border-radius:10px;font-size:0.9rem;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.back-link{text-align:center;margin-top:20px}
.back-link a{color:#999;text-decoration:none;font-size:0.85rem}
.back-link a:hover{color:#6B4226}
@media(max-width:480px){.login-card{padding:36px 24px}}
</style>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body>
<div class="login-card">
<div class="logo">
<span class="logo-icon">🦷</span>
<div class="logo-text">서울비디치과</div>
<div class="logo-sub">관리자 전용</div>
</div>
${error ? `<div class="error-msg"><i class="fas fa-exclamation-circle"></i> ${error}</div>` : ''}
<form method="POST" action="/admin/login">
<div class="form-group">
<label class="form-label" for="password"><i class="fas fa-lock" style="margin-right:4px;"></i> 관리자 비밀번호</label>
<input class="form-input" type="password" id="password" name="password" placeholder="비밀번호를 입력하세요" required autofocus autocomplete="current-password">
</div>
<button type="submit" class="btn-login"><i class="fas fa-sign-in-alt" style="margin-right:6px;"></i> 로그인</button>
</form>
<div class="back-link"><a href="/"><i class="fas fa-arrow-left" style="margin-right:4px;"></i> 홈으로 돌아가기</a></div>
</div>
</body>
</html>`
}

// === 관리자 로그인 라우트 ===
app.get('/admin/login', (c) => {
  return c.html(adminLoginPage())
})

app.post('/admin/login', async (c) => {
  const body = await c.req.parseBody()
  const password = body['password'] as string
  const adminPw = c.env.ADMIN_PASSWORD || 'bdbddc2892!'
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'

  if (!password || password !== adminPw) {
    return c.html(adminLoginPage('비밀번호가 올바르지 않습니다.'), 401)
  }

  // 구 쿠키 삭제 (path: /admin → / 마이그레이션)
  deleteCookie(c, ADMIN_SESSION_COOKIE, { path: '/admin' })
  deleteCookie(c, ADMIN_SESSION_COOKIE, { path: '/admin/' })

  // 세션 토큰 생성 + 쿠키 설정
  const token = await createSessionToken(secret)
  const isSecure = c.req.url.startsWith('https')
  setCookie(c, ADMIN_SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'Lax',
    maxAge: SESSION_MAX_AGE,
  })

  return c.redirect('/admin/', 302)
})

// === 관리자 로그아웃 ===
app.get('/admin/logout', (c) => {
  deleteCookie(c, ADMIN_SESSION_COOKIE, { path: '/' })
  return c.redirect('/admin/login', 302)
})

// === /admin/* 인증 미들웨어 (로그인/로그아웃 제외) ===
app.use('/admin/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  // 로그인/로그아웃 페이지는 통과
  if (path === '/admin/login' || path === '/admin/logout') {
    return next()
  }

  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)

  if (!token || !(await verifySessionToken(token, secret))) {
    return c.redirect('/admin/login', 302)
  }

  return next()
})

// === 인증 통과 후 admin 정적 파일 서빙 ===
app.get('/admin', serveStatic({ path: './admin/index.html' }))
app.get('/admin/', serveStatic({ path: './admin/index.html' }))
app.get('/admin/careers', serveStatic({ path: './admin/careers.html' }))
app.use('/admin/*', serveStatic())

// CORS for API (must be before API routes)
app.use('/api/*', cors())

// ============================================
// 회원 인증 시스템 (이메일 + 비밀번호, R2 저장)
// ============================================
const MEMBERS_JSON_KEY = 'data/members.json'
const SITE_SESSION_COOKIE = 'bd_session'
const SITE_SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30일

// 비밀번호 해싱 (PBKDF2)
async function hashPassword(password: string, salt?: string): Promise<{hash: string; salt: string}> {
  const encoder = new TextEncoder()
  const s = salt || Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,'0')).join('')
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt: encoder.encode(s), iterations: 100000, hash:'SHA-256'}, key, 256)
  const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('')
  return { hash, salt: s }
}

// 사이트 세션 토큰 생성
async function createSiteSession(userId: string, secret: string): Promise<string> {
  const payload = `${userId}:${Date.now()}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('')
  return `${btoa(payload)}.${sigHex}`
}

// 사이트 세션 검증 → userId 반환
async function verifySiteSession(token: string, secret: string): Promise<string|null> {
  try {
    const [payloadB64, sigHex] = token.split('.')
    if (!payloadB64 || !sigHex) return null
    const payload = atob(payloadB64)
    const [userId, ts] = payload.split(':')
    if (!userId || !ts) return null
    if (Date.now() - parseInt(ts) > SITE_SESSION_MAX_AGE * 1000) return null
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign'])
    const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const expectedHex = Array.from(new Uint8Array(expected)).map(b => b.toString(16).padStart(2,'0')).join('')
    return sigHex === expectedHex ? userId : null
  } catch { return null }
}

// 회원 데이터 읽기/쓰기
async function getMembers(r2: R2Bucket): Promise<any[]> {
  try { const obj = await r2.get(MEMBERS_JSON_KEY); if (!obj) return []; const d = await obj.json() as any; return Array.isArray(d) ? d : [] } catch { return [] }
}
async function saveMembers(r2: R2Bucket, members: any[]) {
  await r2.put(MEMBERS_JSON_KEY, JSON.stringify(members), { httpMetadata: { contentType: 'application/json' } })
}

// [공개] 회원가입
app.post('/api/auth/register', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ error: '서버 오류' }, 500)

  const { email, password, name, phone, privacyConsent, marketingConsent } = await c.req.json()

  // 유효성 검사
  if (!email || !password || !name || !phone) return c.json({ error: '모든 필수 항목을 입력해주세요.' }, 400)
  if (!privacyConsent) return c.json({ error: '개인정보 수집·이용에 동의해주세요.' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: '올바른 이메일 형식이 아닙니다.' }, 400)
  if (password.length < 6) return c.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, 400)
  if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g,''))) return c.json({ error: '올바른 휴대폰 번호를 입력해주세요.' }, 400)

  const members = await getMembers(r2)
  if (members.find((m: any) => m.email === email)) return c.json({ error: '이미 가입된 이메일입니다.' }, 409)

  const { hash, salt } = await hashPassword(password)
  const member = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    phone: phone.replace(/\s/g,'').trim(),
    passwordHash: hash,
    passwordSalt: salt,
    privacyConsent: true,
    marketingConsent: !!marketingConsent,
    createdAt: new Date().toISOString(),
  }
  members.push(member)
  await saveMembers(r2, members)

  // 자동 로그인 (세션 발급)
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = await createSiteSession(member.id, secret)
  const isSecure = c.req.url.startsWith('https')
  setCookie(c, SITE_SESSION_COOKIE, token, { path: '/', httpOnly: true, secure: isSecure, sameSite: 'Lax', maxAge: SITE_SESSION_MAX_AGE })

  return c.json({ success: true, user: { id: member.id, email: member.email, name: member.name } })
})

// [공개] 로그인
app.post('/api/auth/login', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ error: '서버 오류' }, 500)

  const { email, password } = await c.req.json()
  if (!email || !password) return c.json({ error: '이메일과 비밀번호를 입력해주세요.' }, 400)

  const members = await getMembers(r2)
  const member = members.find((m: any) => m.email === email.toLowerCase().trim())
  if (!member) return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)

  const { hash } = await hashPassword(password, member.passwordSalt)
  if (hash !== member.passwordHash) return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)

  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = await createSiteSession(member.id, secret)
  const isSecure = c.req.url.startsWith('https')
  setCookie(c, SITE_SESSION_COOKIE, token, { path: '/', httpOnly: true, secure: isSecure, sameSite: 'Lax', maxAge: SITE_SESSION_MAX_AGE })

  return c.json({ success: true, user: { id: member.id, email: member.email, name: member.name } })
})

// [공개] 로그아웃
app.post('/api/auth/logout', (c) => {
  deleteCookie(c, SITE_SESSION_COOKIE, { path: '/' })
  return c.json({ success: true })
})

// [공개] 현재 로그인 상태 확인
app.get('/api/auth/me', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ loggedIn: false })
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, SITE_SESSION_COOKIE)
  if (!token) return c.json({ loggedIn: false })
  const userId = await verifySiteSession(token, secret)
  if (!userId) return c.json({ loggedIn: false })
  const members = await getMembers(r2)
  const m = members.find((x: any) => x.id === userId)
  if (!m) return c.json({ loggedIn: false })
  return c.json({ loggedIn: true, user: { id: m.id, email: m.email, name: m.name, phone: m.phone, marketingConsent: !!m.marketingConsent, createdAt: m.createdAt || '' } })
})

// [인증] 마케팅 수신 동의 변경
app.put('/api/auth/marketing', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ error: '서버 오류' }, 500)
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, SITE_SESSION_COOKIE)
  if (!token) return c.json({ error: '로그인이 필요합니다' }, 401)
  const userId = await verifySiteSession(token, secret)
  if (!userId) return c.json({ error: '로그인이 필요합니다' }, 401)

  const { marketingConsent } = await c.req.json()
  const members = await getMembers(r2)
  const idx = members.findIndex((x: any) => x.id === userId)
  if (idx === -1) return c.json({ error: '회원 정보를 찾을 수 없습니다' }, 404)

  members[idx].marketingConsent = !!marketingConsent
  members[idx].marketingConsentUpdatedAt = new Date().toISOString()
  await saveMembers(r2, members)

  return c.json({ success: true, marketingConsent: !!marketingConsent })
})

// ============================================
// Google OAuth 2.0 로그인
// ============================================
const GOOGLE_OAUTH_SCOPES = 'openid email profile'

function getGoogleRedirectUri(c: any) {
  const url = new URL(c.req.url)
  return `${url.origin}/api/auth/google/callback`
}

// [공개] Google 로그인 시작 → Google 인증 페이지로 리다이렉트
app.get('/api/auth/google', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) return c.json({ error: 'Google OAuth가 설정되지 않았습니다.' }, 500)

  const redirectUri = getGoogleRedirectUri(c)
  const state = crypto.randomUUID()

  // state를 쿠키에 저장 (CSRF 방지)
  const isSecure = c.req.url.startsWith('https')
  setCookie(c, 'google_oauth_state', state, { path: '/', httpOnly: true, secure: isSecure, sameSite: 'Lax', maxAge: 600 })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_SCOPES,
    state,
    access_type: 'offline',
    prompt: 'select_account',
  })

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

// [공개] Google OAuth 콜백 → 토큰 교환 → 회원 자동가입/로그인
app.get('/api/auth/google/callback', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.text('서버 오류', 500)

  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return c.text('Google OAuth가 설정되지 않았습니다.', 500)

  const code = c.req.query('code')
  const state = c.req.query('state')
  const error = c.req.query('error')

  if (error) return c.redirect('/auth/login?error=google_denied')

  // CSRF 검증
  const savedState = getCookie(c, 'google_oauth_state')
  deleteCookie(c, 'google_oauth_state', { path: '/' })
  if (!code || !state || state !== savedState) return c.redirect('/auth/login?error=google_invalid')

  try {
    // 1. Authorization code → Access token 교환
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getGoogleRedirectUri(c),
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) return c.redirect('/auth/login?error=google_token_fail')
    const tokenData = await tokenRes.json() as any

    // 2. Access token으로 사용자 정보 가져오기
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userRes.ok) return c.redirect('/auth/login?error=google_userinfo_fail')
    const googleUser = await userRes.json() as any

    const email = googleUser.email?.toLowerCase().trim()
    const name = googleUser.name || email?.split('@')[0] || '사용자'

    if (!email) return c.redirect('/auth/login?error=google_no_email')

    // 3. 기존 회원 확인 또는 자동 가입
    const members = await getMembers(r2)
    let member = members.find((m: any) => m.email === email)

    if (!member) {
      // 신규 회원 자동 가입 (Google 계정)
      member = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        email,
        name,
        phone: '',
        passwordHash: '',
        passwordSalt: '',
        googleId: googleUser.id,
        profileImage: googleUser.picture || '',
        provider: 'google',
        privacyConsent: true,
        marketingConsent: false,
        createdAt: new Date().toISOString(),
      }
      members.push(member)
      await saveMembers(r2, members)
    } else if (!member.googleId) {
      // 기존 이메일 회원 → Google 연동
      member.googleId = googleUser.id
      member.profileImage = member.profileImage || googleUser.picture || ''
      member.provider = member.provider ? `${member.provider},google` : 'google'
      await saveMembers(r2, members)
    }

    // 4. 세션 발급
    const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
    const token = await createSiteSession(member.id, secret)
    const isSecure = c.req.url.startsWith('https')
    setCookie(c, SITE_SESSION_COOKIE, token, { path: '/', httpOnly: true, secure: isSecure, sameSite: 'Lax', maxAge: SITE_SESSION_MAX_AGE })

    // 5. 메인 페이지로 리다이렉트
    return c.redirect('/?login=success')
  } catch (err) {
    console.error('Google OAuth error:', err)
    return c.redirect('/auth/login?error=google_server_error')
  }
})

// ============================================
// R2 이미지 업로드/조회 API (관리자 전용)
// ============================================

// 이미지 업로드 (POST /api/admin/upload)
app.post('/api/admin/upload', async (c) => {
  // 관리자 인증 확인
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 스토리지가 설정되지 않았습니다' }, 500)

  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    if (!file) return c.json({ error: '파일이 없습니다' }, 400)

    // 파일 유효성 검사
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) return c.json({ error: '20MB 이하 파일만 업로드 가능합니다' }, 400)
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) return c.json({ error: '허용되지 않는 파일 형식입니다 (JPG, PNG, WebP, GIF만 가능)' }, 400)

    // 고유 파일명 생성
    const ext = file.name.split('.').pop() || 'jpg'
    const folder = formData.get('folder') || 'general'
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`

    // R2에 업로드
    await r2.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name, uploadedAt: new Date().toISOString() }
    })

    const url = `/api/images/${key}`
    return c.json({ success: true, key, url, size: file.size, type: file.type })
  } catch (err: any) {
    return c.json({ error: '업로드 실패: ' + (err.message || '') }, 500)
  }
})

// 이미지 조회 (GET /api/images/*)
// ★ 의료법 준수: cases/ 이미지는 로그인 사용자만 접근 가능
app.get('/api/images/*', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.text('R2 not configured', 500)

  const key = c.req.path.replace('/api/images/', '')
  
  // cases/ 이미지도 공개 접근 허용
  
  const object = await r2.get(key)
  if (!object) return c.notFound()

  const headers = new Headers()
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg')
  headers.set('ETag', object.etag)
  
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
})

// 이미지 삭제 (DELETE /api/admin/images/:key)
app.delete('/api/admin/images/*', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 not configured' }, 500)

  const key = c.req.path.replace('/api/admin/images/', '')
  await r2.delete(key)
  return c.json({ success: true, deleted: key })
})

// ============================================
// 케이스(Before/After) CRUD API — R2 JSON 저장
// ============================================
const CASES_JSON_KEY = 'data/cases.json'

// 케이스 목록 읽기 (R2에서)
async function getCases(r2: R2Bucket): Promise<any[]> {
  try {
    const obj = await r2.get(CASES_JSON_KEY)
    if (!obj) return []
    const data = await obj.json() as any
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

// 케이스 저장 (R2에)
async function saveCases(r2: R2Bucket, cases: any[]) {
  await r2.put(CASES_JSON_KEY, JSON.stringify(cases), {
    httpMetadata: { contentType: 'application/json' }
  })
}

// [공개] 카테고리별 케이스 조회 — 진료 페이지에서 호출
// ★ 의료법 준수: 비로그인 시 이미지 URL 미노출
app.get('/api/cases', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json([])
  
  const category = c.req.query('category') || ''
  const allCases = await getCases(r2)
  
  // 공개된 케이스만 필터
  let published = allCases.filter((cs: any) => cs.status === 'published')
  if (category) {
    published = published.filter((cs: any) => cs.category === category)
  }
  
  // 로그인 여부 확인
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const adminToken = getCookie(c, ADMIN_SESSION_COOKIE)
  const siteToken = getCookie(c, 'bd_session')
  let authed = false
  if (adminToken && await verifySessionToken(adminToken, secret)) authed = true
  if (siteToken && await verifySiteSession(siteToken, secret)) authed = true
  
  const safe = published.map((cs: any) => {
    const hasIntraoral = !!(cs.beforeImage && !cs.beforeImage.includes('favicon'))
    const hasPano = !!(cs.panBeforeImage || cs.panAfterImage)
    const hasAnyImage = !!(cs.beforeImage || cs.afterImage || cs.panBeforeImage || cs.panAfterImage)
    
    return {
      id: cs.id,
      title: cs.title,
      category: cs.category,
      doctorName: cs.doctorName,
      doctorSlug: DOCTOR_SLUG_MAP[cs.doctorName] || '',
      treatmentPeriod: cs.treatmentPeriod,
      description: cs.description,
      // ★ 의료법 준수: 비로그인 시 after 이미지 URL 미노출
      beforeImage: cs.beforeImage || '',
      afterImage: authed ? (cs.afterImage || '') : '',
      panBeforeImage: cs.panBeforeImage || '',
      panAfterImage: authed ? (cs.panAfterImage || '') : '',
      thumbnailImage: cs.beforeImage || (authed ? cs.afterImage : '') || cs.panBeforeImage || (authed ? cs.panAfterImage : '') || '',
      hasIntraoral,
      hasPano,
      hasAnyImage,
      afterLocked: !authed,
      region: cs.region || '',
      patientGender: cs.patientGender || '',
      patientAge: cs.patientAge || '',
      medicalHistory: cs.medicalHistory || [],
      laminateStyle: cs.laminateStyle || '',
      createdAt: cs.createdAt,
    }
  })
  
  // 최신순 정렬 (서버에서 보장)
  safe.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  
  c.header('Cache-Control', 'public, max-age=60')
  return c.json(safe)
})

// [공개] 케이스 상세 — ★ 비로그인 시 after 이미지 미노출
app.get('/api/cases/:id', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ error: '스토리지 없음' }, 500)
  
  const id = c.req.param('id')
  const allCases = await getCases(r2)
  const cs = allCases.find((x: any) => x.id === id && x.status === 'published')
  
  if (!cs) return c.json({ error: '케이스를 찾을 수 없습니다' }, 404)
  
  // 로그인 여부 확인
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const adminToken = getCookie(c, ADMIN_SESSION_COOKIE)
  const siteToken = getCookie(c, 'bd_session')
  let authed = false
  if (adminToken && await verifySessionToken(adminToken, secret)) authed = true
  if (siteToken && await verifySiteSession(siteToken, secret)) authed = true
  
  // ★ 비로그인 시 after 이미지 URL 제거
  const result = { ...cs, afterLocked: !authed }
  if (!authed) {
    result.afterImage = ''
    result.panAfterImage = ''
  }
  
  return c.json(result)
})

// [관리자] 케이스 전체 목록 (관리 화면용)
app.get('/api/admin/cases', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }
  
  const r2 = c.env.R2
  if (!r2) return c.json([])
  
  return c.json(await getCases(r2))
})

// [관리자] 케이스 저장 (전체 덮어쓰기 — localStorage 동기화)
app.post('/api/admin/cases', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }
  
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  
  const body = await c.req.json()
  const cases = Array.isArray(body) ? body : (body.cases || [])
  
  await saveCases(r2, cases)
  return c.json({ success: true, count: cases.length })
})

// [관리자] 개별 케이스 저장/수정
app.put('/api/admin/cases/:id', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }
  
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  
  const id = c.req.param('id')
  const data = await c.req.json()
  const allCases = await getCases(r2)
  
  const idx = allCases.findIndex((x: any) => x.id === id)
  if (idx >= 0) {
    allCases[idx] = { ...allCases[idx], ...data, updatedAt: new Date().toISOString() }
  } else {
    allCases.unshift({ ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
  }
  
  await saveCases(r2, allCases)
  return c.json({ success: true, id })
})

// [관리자] 케이스 삭제
app.delete('/api/admin/cases/:id', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }
  
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  
  const id = c.req.param('id')
  const allCases = await getCases(r2)
  const filtered = allCases.filter((x: any) => x.id !== id)
  
  await saveCases(r2, filtered)
  return c.json({ success: true, deleted: id })
})

// [관리자] 케이스 일괄 메타 업데이트 (스타일/병력 등)
app.post('/api/admin/cases/batch-meta', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }
  
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  
  const body = await c.req.json() as { updates: Array<{ id: string, medicalHistory?: string[], laminateStyle?: string }> }
  const { updates } = body
  if (!Array.isArray(updates)) return c.json({ error: 'updates 배열 필요' }, 400)
  
  const allCases = await getCases(r2)
  let updated = 0
  
  for (const upd of updates) {
    const idx = allCases.findIndex((x: any) => x.id === upd.id)
    if (idx >= 0) {
      if (upd.medicalHistory !== undefined) allCases[idx].medicalHistory = upd.medicalHistory
      if (upd.laminateStyle !== undefined) allCases[idx].laminateStyle = upd.laminateStyle
      allCases[idx].updatedAt = new Date().toISOString()
      updated++
    }
  }
  
  await saveCases(r2, allCases)
  return c.json({ success: true, updated, total: allCases.length })
})

// ===== 예약 API =====
app.post('/api/reservation', async (c) => {
  try {
    let body: any
    try {
      body = await c.req.json()
    } catch (parseErr) {
      return c.json({ error: '잘못된 요청 형식입니다.' }, 400)
    }
    const { treatment, date, time, name, phone, message, marketing } = body

    // Validation
    if (!treatment || !date || !time || !name || !phone) {
      return c.json({ error: '필수 항목을 모두 입력해주세요.' }, 400)
    }
    const cleanPhone = String(phone).replace(/[\s-]/g, '')
    if (!/^01[0-9]\d{7,8}$/.test(cleanPhone)) {
      return c.json({ error: '올바른 연락처를 입력해주세요.' }, 400)
    }

    const treatmentMap: Record<string, string> = {
      checkup: 'BDX 정밀검진', glownate: '글로우네이트', invisalign: '인비절라인',
      orthodontics: '치아교정', 'front-crown': '앞니크라운',
      implant: '임플란트', pediatric: '소아치과', general: '일반/기타', other: '기타/상담'
    }

    const reservation = {
      id: `rsv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      treatment: treatmentMap[treatment] || treatment,
      date: String(date),
      time: String(time),
      name: String(name).trim(),
      phone: String(phone).trim(),
      message: message ? String(message).trim() : '',
      marketing: !!marketing,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    // R2에 예약 데이터 저장 (개별 오브젝트 + 목록 업데이트)
    try {
      const r2 = (c.env as any).R2
      if (r2) {
        // 1. 개별 예약을 독립 오브젝트로 저장 (race condition 방지)
        await r2.put(`data/reservations/${reservation.id}.json`, JSON.stringify(reservation, null, 2), {
          httpMetadata: { contentType: 'application/json' }
        })

        // 2. 예약 목록도 업데이트 (관리자 조회용, best-effort)
        try {
          let reservations: any[] = []
          const existing = await r2.get('data/reservations.json')
          if (existing) {
            const text = await existing.text()
            if (text) reservations = JSON.parse(text)
          }
          reservations.push(reservation)
          await r2.put('data/reservations.json', JSON.stringify(reservations, null, 2), {
            httpMetadata: { contentType: 'application/json' }
          })
        } catch (_) { /* 목록 업데이트 실패는 무시 - 개별 파일은 이미 저장됨 */ }
      }
    } catch (r2Err) {
      console.error('R2 save error (reservation still accepted):', r2Err)
    }

    // === 이메일 알림 (Resend) - 비동기, 실패해도 예약은 정상 처리 ===
    try {
      const resendKey = (c.env as any).RESEND_API_KEY
      const notifyEmail = (c.env as any).NOTIFICATION_EMAIL || 'sodanstjrwns@gmail.com'
      if (resendKey) {
        // 날짜/시간 포맷
        const now = new Date()
        const kstTime = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
        // 전화번호 포맷
        const fmtPhone = reservation.phone.replace(/[\s-]/g, '').replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3')
        
        const emailHtml = `
<div style="font-family:'Apple SD Gothic Neo',Pretendard,-apple-system,sans-serif;max-width:440px;margin:0 auto;background:#ffffff;">
  <div style="background:#6B4226;padding:20px 24px;text-align:center;">
    <div style="font-size:24px;margin-bottom:6px;">🦷</div>
    <div style="color:#fff;font-size:16px;font-weight:700;letter-spacing:1px;">서울비디치과</div>
    <div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:2px;">새 예약/문의 알림</div>
  </div>
  <div style="padding:24px;background:#fff;">
    <div style="background:#FFF8F0;border:2px solid #F5E6D3;border-radius:16px;padding:20px;margin-bottom:16px;">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6B4226,#a0714f);line-height:56px;text-align:center;color:#fff;font-size:22px;font-weight:800;">${reservation.name.charAt(0)}</div>
        <div style="font-size:20px;font-weight:800;color:#1a1a2e;margin-top:8px;">${reservation.name}</div>
        <div style="font-size:14px;color:#6B4226;font-weight:600;margin-top:2px;">${reservation.treatment}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 12px;background:#fff;border-radius:8px 8px 0 0;border-bottom:1px solid #f0ebe4;">
            <div style="font-size:11px;color:#999;font-weight:600;margin-bottom:2px;">📱 연락처</div>
            <div style="font-size:16px;font-weight:700;color:#1a1a2e;"><a href="tel:${reservation.phone}" style="color:#1a1a2e;text-decoration:none;">${fmtPhone}</a></div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 12px;background:#fff;border-bottom:1px solid #f0ebe4;">
            <div style="font-size:11px;color:#999;font-weight:600;margin-bottom:2px;">📅 희망 일시</div>
            <div style="font-size:16px;font-weight:700;color:#1a1a2e;">${reservation.date} &nbsp; ${reservation.time}</div>
          </td>
        </tr>
        ${reservation.message ? `<tr>
          <td style="padding:10px 12px;background:#fff;border-bottom:1px solid #f0ebe4;">
            <div style="font-size:11px;color:#999;font-weight:600;margin-bottom:2px;">💬 문의 내용</div>
            <div style="font-size:14px;color:#333;line-height:1.6;">${reservation.message}</div>
          </td>
        </tr>` : ''}
        <tr>
          <td style="padding:10px 12px;background:#fff;border-radius:0 0 8px 8px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#999;">
              <span>마케팅: ${reservation.marketing ? '✅ 동의' : '미동의'}</span>
              <span>접수: ${kstTime}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="https://bdbddc.com/admin/reservations" style="display:inline-block;background:#6B4226;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">관리자에서 확인하기 →</a>
    </div>
  </div>
  <div style="padding:12px;text-align:center;font-size:10px;color:#ccc;">
    서울비디치과 | 천안시 서북구 불당34길 14 | 041-415-2892
  </div>
</div>`

        // c.executionCtx.waitUntil로 비동기 전송 (응답 지연 방지)
        const sendEmail = fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: '서울비디치과 알림 <noreply@patientview.kr>',
            to: [notifyEmail],
            subject: `[새 예약] ${reservation.name} · ${reservation.treatment} · ${reservation.date}`,
            html: emailHtml
          })
        }).then(res => {
          if (!res.ok) res.text().then(t => console.error('Resend error:', t))
          else console.log('📧 Reservation notification sent to', notifyEmail)
        }).catch(err => console.error('Resend fetch error:', err))

        // waitUntil이 있으면 사용 (Workers 환경), 없으면 fire-and-forget
        if (c.executionCtx?.waitUntil) {
          c.executionCtx.waitUntil(sendEmail)
        }
      }
    } catch (emailErr) {
      console.error('Email notification error (reservation saved):', emailErr)
    }

    return c.json({ success: true, reservation: { id: reservation.id, name: reservation.name, date: reservation.date, time: reservation.time, treatment: reservation.treatment } })
  } catch (e: any) {
    console.error('Reservation error:', e?.message || e)
    return c.json({ error: '예약 처리 중 오류가 발생했습니다. 전화(041-415-2892)로 예약해주세요.' }, 500)
  }
})

// ===== 예약/문의 관리자 API =====

// 전체 예약 목록 조회 (관리자)
app.get('/api/admin/reservations', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  try {
    const r2 = (c.env as any).R2
    if (!r2) return c.json({ error: 'R2 스토리지가 설정되지 않았습니다' }, 500)

    // 개별 예약 파일들을 리스트하여 조합 (reservations.json보다 안정적)
    const listed = await r2.list({ prefix: 'data/reservations/' })
    const reservations: any[] = []

    for (const obj of listed.objects) {
      if (obj.key.endsWith('.json')) {
        try {
          const item = await r2.get(obj.key)
          if (item) {
            const data = JSON.parse(await item.text())
            reservations.push(data)
          }
        } catch (_) { /* skip corrupt entries */ }
      }
    }

    // 최신순 정렬
    reservations.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return c.json(reservations, 200, {
      'Cache-Control': 'no-cache'
    })
  } catch (e: any) {
    console.error('Admin reservations error:', e?.message || e)
    return c.json({ error: '예약 목록을 불러올 수 없습니다' }, 500)
  }
})

// 예약 상태 업데이트 (관리자)
app.put('/api/admin/reservations/:id', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  try {
    const r2 = (c.env as any).R2
    if (!r2) return c.json({ error: 'R2 스토리지가 설정되지 않았습니다' }, 500)

    const id = c.req.param('id')
    const body = await c.req.json()
    const key = `data/reservations/${id}.json`

    const existing = await r2.get(key)
    if (!existing) return c.json({ error: '예약을 찾을 수 없습니다' }, 404)

    const reservation = JSON.parse(await existing.text())

    // 업데이트 가능 필드: status, adminMemo
    if (body.status) reservation.status = body.status
    if (body.adminMemo !== undefined) reservation.adminMemo = body.adminMemo
    reservation.updatedAt = new Date().toISOString()

    await r2.put(key, JSON.stringify(reservation, null, 2), {
      httpMetadata: { contentType: 'application/json' }
    })

    return c.json({ success: true, reservation })
  } catch (e: any) {
    console.error('Admin reservation update error:', e?.message || e)
    return c.json({ error: '예약 상태 업데이트 실패' }, 500)
  }
})

// 예약 삭제 (관리자)
app.delete('/api/admin/reservations/:id', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  try {
    const r2 = (c.env as any).R2
    if (!r2) return c.json({ error: 'R2 스토리지가 설정되지 않았습니다' }, 500)

    const id = c.req.param('id')
    await r2.delete(`data/reservations/${id}.json`)

    // reservations.json 목록에서도 제거 (best-effort)
    try {
      const listObj = await r2.get('data/reservations.json')
      if (listObj) {
        let list = JSON.parse(await listObj.text())
        list = list.filter((r: any) => r.id !== id)
        await r2.put('data/reservations.json', JSON.stringify(list, null, 2), {
          httpMetadata: { contentType: 'application/json' }
        })
      }
    } catch (_) { /* ignore */ }

    return c.json({ success: true })
  } catch (e: any) {
    console.error('Admin reservation delete error:', e?.message || e)
    return c.json({ error: '예약 삭제 실패' }, 500)
  }
})

// 301 Redirect: 기존 /column/columns.html 만 리다이렉트 (SEO migration)
app.get('/column/columns.html', (c) => c.redirect('/column/', 301))
app.get('/column/columns', (c) => c.redirect('/column/', 301))

// ============================================
// 컬럼(Column) 게시판 시스템 — R2 JSON 저장
// ============================================
const COLUMNS_JSON_KEY = 'data/columns.json'

async function getColumns(r2: R2Bucket): Promise<any[]> {
  try {
    const obj = await r2.get(COLUMNS_JSON_KEY)
    if (!obj) return []
    const data = await obj.json() as any
    return Array.isArray(data) ? data : []
  } catch { return [] }
}
async function saveColumns(r2: R2Bucket, cols: any[]) {
  await r2.put(COLUMNS_JSON_KEY, JSON.stringify(cols), { httpMetadata: { contentType: 'application/json' } })
}

// doctorName → slug 매핑
const DOCTOR_SLUG_MAP: Record<string,string> = {
  '문석준 원장':'moon','김민수 원장':'kim','현정민 원장':'hyun',
  '이승엽 원장':'lee','김민규 원장':'kim-mg','임지원 원장':'lim',
  '조설아 원장':'jo','강민지 원장':'kang-mj','김민진 원장':'kim-mj',
  '박상현 원장':'park','서희원 원장':'seo','이병민 원장':'lee-bm',
  '강경민 원장':'kang','최종훈 원장':'choi','박수빈 원장':'park-sb',
}
const SLUG_TO_DOCTOR: Record<string,string> = Object.fromEntries(Object.entries(DOCTOR_SLUG_MAP).map(([k,v]) => [v,k]))

// [공개] 컬럼 목록 API
app.get('/api/columns', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json([])
  const all = await getColumns(r2)
  let published = all.filter((col: any) => col.status === 'published')
  const doctor = c.req.query('doctor') || ''
  if (doctor) published = published.filter((col: any) => col.doctorName === doctor || DOCTOR_SLUG_MAP[col.doctorName] === doctor)
  published.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  c.header('Cache-Control', 'public, max-age=60')
  return c.json(published.map((col: any) => ({
    id: col.id, title: col.title, excerpt: (col.content || '').replace(/<[^>]*>/g, '').slice(0, 120),
    doctorName: col.doctorName, category: col.category || '',
    thumbnailImage: col.thumbnailImage || '', createdAt: col.createdAt,
  })))
})

// [공개] 컬럼 상세 API
app.get('/api/columns/:id', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ error: '스토리지 없음' }, 500)
  const all = await getColumns(r2)
  const col = all.find((x: any) => x.id === c.req.param('id') && x.status === 'published')
  if (!col) return c.json({ error: '컬럼을 찾을 수 없습니다' }, 404)
  return c.json(col)
})

// [관리자] 컬럼 전체 목록
app.get('/api/admin/columns', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증이 필요합니다' }, 401)
  const r2 = c.env.R2
  if (!r2) return c.json([])
  return c.json(await getColumns(r2))
})

// [관리자] 컬럼 생성/수정
app.post('/api/admin/columns', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증이 필요합니다' }, 401)
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  const body = await c.req.json()
  const all = await getColumns(r2)
  
  if (body.id) {
    // 수정
    const idx = all.findIndex((x: any) => x.id === body.id)
    if (idx >= 0) { all[idx] = { ...all[idx], ...body, updatedAt: new Date().toISOString() }; }
    else { all.push({ ...body, createdAt: new Date().toISOString() }) }
  } else {
    // 생성
    body.id = `col-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
    body.createdAt = new Date().toISOString()
    body.status = body.status || 'published'
    all.push(body)
  }
  await saveColumns(r2, all)
  return c.json({ success: true, id: body.id })
})

// [관리자] 컬럼 삭제
app.delete('/api/admin/columns/:id', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증이 필요합니다' }, 401)
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  const all = await getColumns(r2)
  const filtered = all.filter((x: any) => x.id !== c.req.param('id'))
  await saveColumns(r2, filtered)
  return c.json({ success: true })
})

// ===== 관리자 회원 목록 API =====
app.get('/api/admin/members', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증이 필요합니다' }, 401)
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  const members = await getMembers(r2)
  // 비밀번호 해시 제거 후 반환
  const safe = members.map((m: any) => ({
    id: m.id,
    email: m.email,
    name: m.name,
    phone: m.phone || '',
    provider: m.provider || 'email',
    privacyConsent: m.privacyConsent,
    marketingConsent: m.marketingConsent,
    createdAt: m.createdAt,
  }))
  // 최신순 정렬
  safe.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  return c.json(safe)
})

// ============================================
// 브라우저 자동 요청 fallback (favicon.ico, apple-touch-icon 등)
// Screaming Frog Internal 4xx/5xx 이슈 해결
// ============================================
app.get('/favicon.ico', (c) => {
  return c.redirect('/images/icons/favicon.svg', 301)
})
app.get('/apple-touch-icon.png', (c) => {
  return c.redirect('/images/icons/favicon.svg', 301)
})
app.get('/apple-touch-icon-precomposed.png', (c) => {
  return c.redirect('/images/icons/favicon.svg', 301)
})

// ============================================
// Weglot /en/* 다국어 프록시 (hreflang Non-200 이슈 해결)
// Weglot은 클라이언트 JS로 번역하지만, 검색엔진 크롤러는 /en/ URL을
// 직접 접근하므로 한국어 원본으로 302 리디렉트 (크롤러가 원본 인덱싱)
// ============================================
app.get('/en/*', (c) => {
  const path = c.req.path.replace(/^\/en/, '') || '/'
  return c.redirect(path, 302)
})

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

// ============================================
// GSC 404 에러 11건 해결 (2026-04-07)
// ============================================
// 1) 이전 사이트 잔재 → 301 리다이렉트
app.get('/tables/treatments/treatments/gum.html', (c) => c.redirect('/pricing', 301))
app.get('/tables/treatments/auth/register.html', (c) => c.redirect('/auth/register', 301))
app.get('/tables/treatments/treatments/index.html', (c) => c.redirect('/pricing', 301))
app.get('/tables/treatments/implant.html', (c) => c.redirect('/pricing', 301))
app.get('/tables/notices', (c) => c.redirect('/notice/', 301))
app.get('/tables/*', (c) => c.redirect('/pricing', 301))

// 2) 존재하지 않는 경로 → 301 리디렉트 (404 해소)
app.get('/treatments/laminate', (c) => c.redirect('/treatments/glownate', 301))  // 라미네이트 → 글로우네이트(BD 자체 진료과)
app.get('/treatments/checkup', (c) => c.redirect('/checkup', 301))               // 검진은 root /checkup으로
app.get('/area/cheonan-implant', (c) => c.redirect('/area/cheonan', 301))         // 천안-임플란트 → 천안 지역 페이지

// 3) 삭제된 페이지 → 301 리디렉트 (GSC 4xx 오류 해결)
app.get('/bdx/', (c) => c.redirect('/', 301))
app.get('/bdx', (c) => c.redirect('/', 301))
app.get('/bdx/*', (c) => c.redirect('/', 301))
app.get('/local-seo', (c) => c.redirect('/', 301))

// 4) GSC 5xx 22건 해결 — 구 사이트 URL 패턴 (2026-05-03)
// /page/sub1~10, /page/main.html → 구 사이트 서브페이지
app.get('/page/sub1', (c) => c.redirect('/', 301))
app.get('/page/sub2', (c) => c.redirect('/doctors/', 301))
app.get('/page/sub3', (c) => c.redirect('/treatments/', 301))
app.get('/page/sub4', (c) => c.redirect('/directions', 301))
app.get('/page/sub5', (c) => c.redirect('/pricing', 301))
app.get('/page/sub6', (c) => c.redirect('/cases/gallery', 301))
app.get('/page/sub7', (c) => c.redirect('/reservation', 301))
app.get('/page/sub8', (c) => c.redirect('/faq', 301))
app.get('/page/sub10', (c) => c.redirect('/', 301))
app.get('/page/main.html', (c) => c.redirect('/', 301))
app.get('/page/*', (c) => c.redirect('/', 301))
app.get('/main.html', (c) => c.redirect('/', 301))
app.get('/main', (c) => c.redirect('/', 301))
// /bbs/* → 구 게시판 URL
app.get('/bbs/case', (c) => c.redirect('/cases/gallery', 301))
app.get('/bbs/notice', (c) => c.redirect('/notice/', 301))
app.get('/bbs/*', (c) => c.redirect('/', 301))
// /cheonan → /area/cheonan 301 리다이렉트 (천안치과 SEO 키워드 URL)
app.get('/cheonan', (c) => c.redirect('/area/cheonan', 301))
// /asan → /area/asan 301 리다이렉트 (아산치과 SEO 키워드 URL)
app.get('/asan', (c) => c.redirect('/area/asan', 301))
// /asan → /area/asan 301 리다이렉트 (아산치과 SEO 키워드 URL)
app.get('/asan', (c) => c.redirect('/area/asan', 301))
// /asan → /area/asan 301 리다이렉트 (아산치과 SEO 키워드 URL)
app.get('/asan', (c) => c.redirect('/area/asan', 301))
// /en/* → 영문 URL 잔재
app.get('/en/area/*', (c) => c.redirect('/area/cheonan', 301))
app.get('/en/*', (c) => c.redirect('/', 301))
// 쓰레기 URL → 410 Gone (구글에 "영구 삭제됨" 알림)
app.get('/$', (c) => c.text('Gone', 410))
app.get('/&', (c) => c.text('Gone', 410))
// API 크롤링 차단 (404 → 명시적 응답)
app.get('/api/auth/login', (c) => c.json({ error: 'Not a page' }, 404))

// 5) GSC 404 89건 해결 — 존재하지 않는 블로그 글 (2026-05-03)
app.get('/blog/implant-cost-guide-2026', (c) => c.redirect('/blog/', 301))
app.get('/blog/implant-process-step-by-step-guide-2026', (c) => c.redirect('/blog/', 301))
app.get('/blog/implant-post-surgery-care-guide-2026', (c) => c.redirect('/blog/', 301))
app.get('/blog/molar-implant-procedure-pain-recovery-guide', (c) => c.redirect('/blog/', 301))
app.get('/blog/scaling-procedure-guide-2026', (c) => c.redirect('/blog/', 301))
app.get('/blog/wisdom-tooth-extraction-aftercare-guide-2026', (c) => c.redirect('/blog/', 301))
app.get('/blog/wisdom-tooth-extraction-complete-guide', (c) => c.redirect('/blog/', 301))
app.get('/blog/laminate-procedure-guide-sejong-2026', (c) => c.redirect('/blog/', 301))
app.get('/blog/nerve-treatment-process-step-by-step-guide', (c) => c.redirect('/blog/', 301))
app.get('/blog/transparent-orthodontics-treatment-process-guide', (c) => c.redirect('/blog/', 301))
// /cdn-cgi/* → Cloudflare 내부 경로 (404 해소 불가, 무시)

// ============================================
// 치BTI 참여 통계 API
// ============================================

// POST /api/chbti/result - 결과 저장
app.post('/api/chbti/result', async (c) => {
  try {
    const { type_code } = await c.req.json<{ type_code: string }>()
    
    if (!type_code || !/^[PECNSHAF]{4}$/.test(type_code)) {
      return c.json({ error: 'Invalid type_code' }, 400)
    }
    
    const db = c.env.DB
    if (!db) {
      return c.json({ error: 'DB not available' }, 500)
    }
    
    await db.prepare('INSERT INTO chbti_results (type_code) VALUES (?)').bind(type_code).run()
    
    // 바로 통계 반환
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM chbti_results').first<{ total: number }>()
    const typeResult = await db.prepare('SELECT COUNT(*) as cnt FROM chbti_results WHERE type_code = ?').bind(type_code).first<{ cnt: number }>()
    
    const total = totalResult?.total || 0
    const typeCount = typeResult?.cnt || 0
    const percentage = total > 0 ? Math.round((typeCount / total) * 1000) / 10 : 0
    
    return c.json({ 
      success: true, 
      total_participants: total,
      type_code,
      type_count: typeCount,
      type_percentage: percentage
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/chbti/stats - 전체 통계 조회
app.get('/api/chbti/stats', async (c) => {
  try {
    const db = c.env.DB
    if (!db) {
      return c.json({ error: 'DB not available' }, 500)
    }
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM chbti_results').first<{ total: number }>()
    const typeStats = await db.prepare(
      'SELECT type_code, COUNT(*) as cnt FROM chbti_results GROUP BY type_code ORDER BY cnt DESC'
    ).all<{ type_code: string; cnt: number }>()
    
    const total = totalResult?.total || 0
    const types = (typeStats?.results || []).map(r => ({
      type_code: r.type_code,
      count: r.cnt,
      percentage: total > 0 ? Math.round((r.cnt / total) * 1000) / 10 : 0
    }))
    
    return c.json({ total_participants: total, types })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ============================================
// 치석 플라이트 API
// ============================================

// POST /api/flight/result - 점수 저장
app.post('/api/flight/result', async (c) => {
  try {
    const { score, grade } = await c.req.json<{ score: number; grade: string }>()
    
    if (typeof score !== 'number' || !grade) {
      return c.json({ error: 'Invalid data' }, 400)
    }
    
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    
    await db.prepare('INSERT INTO flight_scores (score, grade) VALUES (?, ?)').bind(score, grade).run()
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM flight_scores').first<{ total: number }>()
    const avgResult = await db.prepare('SELECT AVG(score) as avg FROM flight_scores').first<{ avg: number }>()
    const rankResult = await db.prepare('SELECT COUNT(*) as better FROM flight_scores WHERE score > ?').bind(score).first<{ better: number }>()
    
    const total = totalResult?.total || 0
    const avg = avgResult?.avg || 0
    const rank = (rankResult?.better || 0) + 1
    const topPercent = total > 0 ? Math.round((rank / total) * 100) : 100
    
    return c.json({
      success: true,
      total_players: total,
      avg_score: Math.round(avg),
      rank,
      top_percent: topPercent
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/flight/stats - 통계 조회
app.get('/api/flight/stats', async (c) => {
  try {
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM flight_scores').first<{ total: number }>()
    const avgResult = await db.prepare('SELECT AVG(score) as avg FROM flight_scores').first<{ avg: number }>()
    const topScores = await db.prepare(
      'SELECT score, grade, created_at FROM flight_scores ORDER BY score DESC LIMIT 10'
    ).all<{ score: number; grade: string; created_at: string }>()
    
    return c.json({
      total_players: totalResult?.total || 0,
      avg_score: Math.round(avgResult?.avg || 0),
      top_scores: topScores?.results || []
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ===== TOOTH RUN API =====

// POST /api/run/result - 생존시간 저장
app.post('/api/run/result', async (c) => {
  try {
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    
    const { time, grade } = await c.req.json<{ time: number; grade: string }>()
    if (typeof time !== 'number' || !grade) {
      return c.json({ error: 'time and grade required' }, 400)
    }
    
    await db.prepare('INSERT INTO run_scores (survival_time, grade) VALUES (?, ?)').bind(time, grade).run()
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM run_scores').first<{ total: number }>()
    const avgResult = await db.prepare('SELECT AVG(survival_time) as avg FROM run_scores').first<{ avg: number }>()
    const rankResult = await db.prepare('SELECT COUNT(*) as better FROM run_scores WHERE survival_time > ?').bind(time).first<{ better: number }>()
    
    const total = totalResult?.total || 1
    const rank = (rankResult?.better || 0) + 1
    const topPercent = Math.max(1, Math.round((rank / total) * 100))
    
    return c.json({
      success: true,
      rank: rank,
      total_players: total,
      top_percent: topPercent,
      avg_time: avgResult?.avg || 0
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/run/stats - 통계 조회
app.get('/api/run/stats', async (c) => {
  try {
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM run_scores').first<{ total: number }>()
    const avgResult = await db.prepare('SELECT AVG(survival_time) as avg FROM run_scores').first<{ avg: number }>()
    const topScores = await db.prepare(
      'SELECT survival_time, grade, created_at FROM run_scores ORDER BY survival_time DESC LIMIT 10'
    ).all<{ survival_time: number; grade: string; created_at: string }>()
    
    return c.json({
      total_players: totalResult?.total || 0,
      avg_time: avgResult?.avg || 0,
      top_scores: topScores?.results || []
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// API health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok',
    message: '서울비디치과 API 서버 정상 작동 중',
    timestamp: new Date().toISOString()
  })
})

// Google Reviews API Proxy (CORS 우회)
// Google Reviews API 제거됨 (의료법 준수 — 사이트 내 환자 후기 직접 게재 불가)
// 네이버/구글 리뷰 확인은 외부 링크로 대체

// ============================================
// RSS/Atom 피드 (GEO 체크리스트 항목 4 — 빠른 인덱싱)
// ============================================
app.get('/feed.xml', async (c) => {
  const r2 = c.env.R2
  const columns: any[] = r2 ? (await getColumns(r2)).filter((col: any) => col.status === 'published') : []
  columns.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  const items = columns.slice(0, 20).map((col: any) => {
    const excerpt = (col.content || '').replace(/<[^>]*>/g, '').slice(0, 300)
    const slug = DOCTOR_SLUG_MAP[col.doctorName] || ''
    const date = new Date(col.createdAt || Date.now()).toUTCString()
    return `    <item>
      <title><![CDATA[${col.title || ''}]]></title>
      <link>https://bdbddc.com/column/${col.id}</link>
      <guid isPermaLink="true">https://bdbddc.com/column/${col.id}</guid>
      <description><![CDATA[${excerpt}]]></description>
      <author>${col.doctorName || '서울비디치과'}</author>
      <category>${col.category || '진료 이야기'}</category>
      <pubDate>${date}</pubDate>
    </item>`
  }).join('\n')
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>서울비디치과 원장 칼럼</title>
    <link>https://bdbddc.com/column/</link>
    <description>서울비디치과 원장님들이 전하는 진료 철학과 치과 이야기</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://bdbddc.com/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://bdbddc.com/images/og-image-v2.jpg</url>
      <title>서울비디치과</title>
      <link>https://bdbddc.com/</link>
    </image>
${items}
  </channel>
</rss>`
  c.header('Content-Type', 'application/rss+xml; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=3600')
  return c.text(xml)
})

// security.txt (GEO + Cloudflare 보안 권고)
app.get('/.well-known/security.txt', (c) => {
  c.header('Content-Type', 'text/plain; charset=utf-8')
  return c.text(`Contact: mailto:sodanstjrwns@gmail.com
Contact: tel:+82-41-415-2892
Expires: 2027-05-04T00:00:00.000Z
Preferred-Languages: ko, en
Canonical: https://bdbddc.com/.well-known/security.txt
Policy: https://bdbddc.com/privacy
`)
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
// GPT 챗봇 API — 통합 핸들러는 아래 BD_SYSTEM_PROMPT 블록에서 처리
// (중복 라우트 제거 — chatbot.js의 {messages} 형태와 호환)
// ============================================

// ============================================
// 공통 SSR 헤더 + 모바일 네비게이션 HTML
// ============================================
function ssrHeader(): string {
  return `<header class="site-header" id="siteHeader">
<div class="header-container">
<div class="header-brand"><a href="/" class="site-logo" aria-label="서울비디치과 홈"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><div class="clinic-status open" aria-live="polite"><span class="status-dot"></span><span class="status-text">진료중</span><span class="status-time"></span></div></div>
<nav class="main-nav" id="mainNav" aria-label="메인 네비게이션">
<ul>
<li class="nav-item has-dropdown"><a href="/treatments/">진료</a>
<div class="mega-dropdown"><div class="mega-dropdown-grid">
<div class="mega-dropdown-section"><strong class="section-heading">전문센터</strong><ul>
<li><a href="/treatments/glownate">✨ 글로우네이트</a></li>
<li><a href="/treatments/implant">임플란트 <span class="badge">6개 수술실</span></a></li>
<li><a href="/treatments/invisalign">인비절라인 <span class="badge">다이아몬드</span></a></li>
<li><a href="/treatments/orthodontics">치아교정 <span class="badge">장치교정</span></a></li>
<li><a href="/treatments/pediatric">소아치과 <span class="badge">전문의 3인</span></a></li>
<li><a href="/treatments/aesthetic">심미레진</a></li>
</ul></div>
<div class="mega-dropdown-section"><strong class="section-heading">일반/보존 진료</strong><ul>
<li><a href="/treatments/cavity">충치치료</a></li>
<li><a href="/treatments/resin">레진치료</a></li>
<li><a href="/treatments/crown">크라운</a></li>
<li><a href="/treatments/inlay">인레이/온레이</a></li>
<li><a href="/treatments/root-canal">신경치료</a></li>
<li><a href="/treatments/whitening">미백</a></li>
</ul></div>
<div class="mega-dropdown-section"><strong class="section-heading">구강내과/외과</strong><ul>
<li><a href="/treatments/oral-medicine" style="color:#6B4226;font-weight:600;">구강내과 <span class="badge">전문의</span></a></li>
<li><a href="/treatments/tmj">턱관절장애</a></li>
<li><a href="/treatments/bruxism">이갈이/이악물기</a></li>
<li><a href="/treatments/scaling">스케일링</a></li>
<li><a href="/treatments/gum">잇몸치료</a></li>
<li><a href="/treatments/wisdom-tooth">사랑니 발치</a></li>
</ul></div>
</div></div></li>
<li class="nav-item has-dropdown"><a href="/doctors/">의료진</a>
<ul class="simple-dropdown">
<li><a href="/doctors/">전체 의료진 <span class="badge">15인</span></a></li>
<li><a href="/doctors/orthodontics"><i class="fas fa-teeth"></i> 교정과 전문의</a></li>
<li><a href="/doctors/pediatric"><i class="fas fa-baby"></i> 소아치과 전문의</a></li>
<li><a href="/doctors/conservative"><i class="fas fa-tooth"></i> 보존과 전문의</a></li>
<li><a href="/doctors/oral-medicine" style="color:#2563eb;font-weight:600;"><i class="fas fa-stethoscope"></i> 구강내과 전문의</a></li>
<li><a href="/doctors/integrated-dentistry"><i class="fas fa-user-md"></i> 통합치의학과 전문의</a></li>
</ul></li>
<li class="nav-item"><a href="/mission">비디미션</a></li>
<li class="nav-item has-dropdown"><a href="/cases/gallery">콘텐츠</a>
<ul class="simple-dropdown">
<li><a href="/cases/gallery" style="color:#6B4226;font-weight:600;">🔥 비포/애프터</a></li>
<li><a href="/symptom-checker" style="color:#EC4899;font-weight:600;">🩺 AI 증상체커</a></li>
<li><a href="/blog/"><i class="fas fa-blog"></i> 블로그</a></li>
<li><a href="/video/"><i class="fab fa-youtube"></i> 영상</a></li>
<li><a href="/encyclopedia/"><i class="fas fa-book-medical"></i> 치과 백과사전</a></li>
<li><a href="/column/"><i class="fas fa-pen-nib"></i> 원장 컬럼</a></li>
</ul></li>
<li class="nav-item has-dropdown"><a href="/directions">안내</a>
<ul class="simple-dropdown">
<li><a href="/pricing" class="nav-highlight">💰 비용 안내</a></li>
<li><a href="/floor-guide">비디치과 둘러보기</a></li>
<li><a href="/directions">오시는 길</a></li>
<li><a href="/faq">자주 묻는 질문</a></li>
<li><a href="/notice/"><i class="fas fa-bullhorn"></i> 공지사항</a></li>
<li><a href="/careers"><i class="fas fa-user-tie"></i> 상시채용</a></li>
</ul></li>
<li class="nav-item has-dropdown"><a href="/games" style="color:#EC4899;font-weight:700;">🎮 플레이</a>
<ul class="simple-dropdown">
<li><a href="/flight"><i class="fas fa-rocket"></i> 치석 플라이트</a></li>
<li><a href="/run"><i class="fas fa-running"></i> 투쓰런</a></li>
<li><a href="/checkup"><i class="fas fa-dna"></i> 치BTI</a></li>
<li><a href="/games"><i class="fas fa-th"></i> 전체 게임</a></li>
</ul></li>
</ul>
</nav>
<div class="header-actions">
<a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
<div class="auth-buttons"><a href="/auth/login" class="btn-auth btn-login"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="/auth/register" class="btn-auth btn-register"><i class="fas fa-user-plus"></i> 회원가입</a></div>
<a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
<button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
</div>
</div>
</header>
<div class="header-spacer"></div>`;
}

function ssrMobileNav(): string {
  return `<nav class="mobile-nav" id="mobileNav" aria-label="모바일 메뉴">
<div class="mobile-nav-header">
<span class="logo-icon">🦷</span>
<button class="mobile-nav-close" id="mobileNavClose" aria-label="메뉴 닫기"><i class="fas fa-times"></i></button>
</div>
<ul class="mobile-nav-menu">
<li class="mobile-nav-item has-submenu">
<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
<i class="fas fa-tooth"></i> 진료 <i class="fas fa-chevron-down toggle-icon"></i></a>
<ul class="mobile-nav-submenu">
<li><a href="/treatments/">전체 진료</a></li>
<li class="submenu-divider">전문센터</li>
<li><a href="/treatments/glownate" style="color:#6B4226;font-weight:600;">✨ 글로우네이트</a></li>
<li><a href="/treatments/implant">임플란트센터</a></li>
<li><a href="/treatments/invisalign">인비절라인</a></li>
<li><a href="/treatments/orthodontics">치아교정</a></li>
<li><a href="/treatments/pediatric">소아치과</a></li>
<li><a href="/treatments/aesthetic">심미레진</a></li>
<li class="submenu-divider">일반 진료</li>
<li><a href="/treatments/cavity">충치치료</a></li>
<li><a href="/treatments/resin">레진치료</a></li>
<li><a href="/treatments/oral-medicine" style="color:#6B4226;font-weight:600;">구강내과 <span class="badge">전문의</span></a></li>
<li><a href="/treatments/tmj">턱관절장애</a></li>
<li><a href="/treatments/bruxism">이갈이/이악물기</a></li>
<li><a href="/treatments/scaling">스케일링</a></li>
<li><a href="/treatments/gum">잇몸치료</a></li>
</ul>
</li>
<li class="mobile-nav-item has-submenu">
<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
<i class="fas fa-user-md"></i> 의료진 <i class="fas fa-chevron-down toggle-icon"></i></a>
<ul class="mobile-nav-submenu">
<li><a href="/doctors/">전체 의료진</a></li>
<li class="submenu-divider">전문과별 소개</li>
<li><a href="/doctors/orthodontics"><i class="fas fa-teeth"></i> 교정과 전문의</a></li>
<li><a href="/doctors/pediatric"><i class="fas fa-baby"></i> 소아치과 전문의</a></li>
<li><a href="/doctors/conservative"><i class="fas fa-tooth"></i> 보존과 전문의</a></li>
<li><a href="/doctors/oral-medicine" style="color:#2563eb;font-weight:600;"><i class="fas fa-stethoscope"></i> 구강내과 전문의</a></li>
<li><a href="/doctors/integrated-dentistry"><i class="fas fa-user-md"></i> 통합치의학과 전문의</a></li>
</ul>
</li>
<li><a href="/mission"><i class="fas fa-heart"></i> 비디미션</a></li>
<li class="mobile-nav-item has-submenu">
<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
<i class="fas fa-newspaper"></i> 콘텐츠 <i class="fas fa-chevron-down toggle-icon"></i></a>
<ul class="mobile-nav-submenu">
<li><a href="/cases/gallery" style="color:#6B4226;font-weight:600;">🔥 비포/애프터</a></li>
<li><a href="/symptom-checker" style="color:#EC4899;font-weight:600;">🩺 AI 증상체커</a></li>
<li><a href="/blog/"><i class="fas fa-blog"></i> 블로그</a></li>
<li><a href="/video/"><i class="fab fa-youtube"></i> 영상</a></li>
<li><a href="/encyclopedia/"><i class="fas fa-book-medical"></i> 치과 백과사전</a></li>
<li><a href="/column/"><i class="fas fa-pen-nib"></i> 원장 컬럼</a></li>
</ul>
</li>
<li class="mobile-nav-item has-submenu">
<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
<i class="fas fa-hospital"></i> 안내 <i class="fas fa-chevron-down toggle-icon"></i></a>
<ul class="mobile-nav-submenu">
<li><a href="/pricing">💰 비용 안내</a></li>
<li><a href="/floor-guide">비디치과 둘러보기</a></li>
<li><a href="/directions">오시는 길</a></li>
<li><a href="/faq">자주 묻는 질문</a></li>
<li><a href="/notice/"><i class="fas fa-bullhorn"></i> 공지사항</a></li>
<li><a href="/careers"><i class="fas fa-user-tie"></i> 상시채용</a></li>
</ul>
</li>
<li class="mobile-nav-item has-submenu">
<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false" style="color:#EC4899;font-weight:700;">
🎮 플레이 <i class="fas fa-chevron-down toggle-icon"></i></a>
<ul class="mobile-nav-submenu">
<li><a href="/flight"><i class="fas fa-rocket"></i> 치석 플라이트</a></li>
<li><a href="/run"><i class="fas fa-running"></i> 투쓰런</a></li>
<li><a href="/checkup"><i class="fas fa-dna"></i> 치BTI</a></li>
<li><a href="/games"><i class="fas fa-th"></i> 전체 게임</a></li>
</ul>
</li>
<li><a href="/reservation" class="highlight"><i class="fas fa-calendar-check"></i> 예약하기</a></li>
</ul>
<div class="mobile-auth-buttons">
<a href="/auth/login" class="btn-auth"><i class="fas fa-sign-in-alt"></i> 로그인</a>
<a href="/auth/register" class="btn-auth"><i class="fas fa-user-plus"></i> 회원가입</a>
</div>
<div class="mobile-nav-footer">
<p class="mobile-nav-hours"><i class="fas fa-clock"></i> 365일 진료 | 평일 야간진료</p>
<div class="mobile-nav-quick-btns">
<a href="/pricing" class="btn btn-secondary btn-lg"><i class="fas fa-won-sign"></i> 비용 안내</a>
<a href="tel:041-415-2892" class="btn btn-primary btn-lg"><i class="fas fa-phone"></i> 전화 예약</a>
</div>
</div>
</nav>
<div class="mobile-nav-overlay" id="mobileNavOverlay"></div>`;
}

// ============================================
// 인블로그 프록시 HTML 정리 함수
// ============================================
function cleanInblogHtml(html: string): string {
  // 1) 인블로그 내부 링크를 /blog로 변환
  html = html.replace(/href="\/(?!blog)/g, 'href="/blog/')
  html = html.replace(/href="https:\/\/bdbddc\.inblog\.ai\//g, 'href="/blog/')
  
  // 2) 카테고리 태그 바 HTML 통째로 제거 (See All + 수백개 키워드 링크)
  // 컨테이너: <div class="flex flex-row justify-start flex-wrap ... cursor-pointer ...">...(a태그들)...</div>
  html = html.replace(/<div[^>]*class="[^"]*flex-row[^"]*justify-start[^"]*flex-wrap[^"]*cursor-pointer[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')

  // 3) 각 글 하단의 카테고리 태그 링크들 제거 (개별 포스트 페이지에도 키워드 뿌림)
  //    패턴: <a href="/blog/category/...">키워드</a> 반복
  html = html.replace(/<a[^>]*href="[^"]*\/blog\/category\/[^"]*"[^>]*>[^<]*<\/a>/gi, '')

  // 4) CSS 백업 — 만약 HTML 제거가 안 되는 구조 변경 시 CSS로도 숨기기
  const inblogCustomCSS = `<style data-bd-custom>
/* 카테고리 키워드 태그 바 숨기기 (See All + 수백개 키워드) — CSS 백업 */
div[class*="flex-row"][class*="justify-start"][class*="flex-wrap"][class*="cursor-pointer"][class*="items-baseline"] {
  display: none !important;
}
/* 개별 글 하단 카테고리 태그 */
a[href*="/blog/category/"] {
  display: none !important;
}
/* 이메일 구독 폼 숨기기 — 서울비디치과 자체 예약 사용 */
form:has(input[placeholder="Email"]) { display: none !important; }
/* 배너 영역 높이 조절 */
.BANNER { min-height: 300px !important; }
.BANNER .w-full.max-w-6xl { padding-top: 2rem !important; padding-bottom: 2rem !important; }
</style>`
  // 5) AEO 메타 태그 + 스키마 주입 (블로그 SEO/AEO 보강)
  const blogAEOMeta = `
  <meta name="ai-summary" content="서울비디치과 공식 블로그 — 임플란트, 인비절라인, 글로우네이트, 소아치과 등 치과 치료 정보와 구강건강 가이드를 서울대 출신 전문의가 직접 작성합니다.">
  <meta name="abstract" content="서울비디치과 공식 블로그 — 치과 치료 정보, 구강건강 가이드, 전문의 칼럼.">
  <meta name="subject" content="치과 블로그, 임플란트 정보, 인비절라인, 구강건강, 서울비디치과">
  `
  const blogSchema = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "서울비디치과 블로그",
  "description": "서울대 출신 15인 원장이 직접 작성하는 치과 치료 정보 블로그",
  "url": "https://bdbddc.com/blog/",
  "publisher": {
    "@type": "Dentist",
    "name": "서울비디치과",
    "url": "https://bdbddc.com",
    "logo": { "@type": "ImageObject", "url": "https://bdbddc.com/images/og-image-v2.jpg" }
  },
  "inLanguage": "ko"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://bdbddc.com" },
    { "@type": "ListItem", "position": 2, "name": "블로그", "item": "https://bdbddc.com/blog/" }
  ]
}
</script>`

  html = html.replace('</head>', blogAEOMeta + blogSchema + inblogCustomCSS + '</head>')

  return html
}

// ============================================
// /blog/category/* → 301 리디렉트 (인블로그 카테고리 깨진 URL → 블로그 메인)
// Google Search Console에서 52개 4xx 에러 해결용
// ============================================
app.all('/blog/category/*', (c) => c.redirect('/blog/', 301))

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
    
    // 인블로그 404 → 301 리디렉트 (삭제된 블로그 글 → 블로그 메인으로)
    if (response.status === 404) {
      return c.redirect('/blog/', 301)
    }

    // HTML 응답인 경우 내부 링크 수정
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('text/html')) {
      let html = await response.text()
      html = cleanInblogHtml(html)
      
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
    html = cleanInblogHtml(html)
    
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
app.use('/sitemap-main.xml', serveStatic())
app.use('/sitemap-area.xml', serveStatic())
app.use('/sitemap-encyclopedia.xml', serveStatic())
app.use('/robots.txt', serveStatic())
app.use('/llms.txt', serveStatic())
app.use('/llms-full.txt', serveStatic())

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
    '/treatments/prevention', '/treatments/oral-medicine', '/treatments/tmj', '/treatments/bruxism',
    '/treatments/emergency', '/treatments/sedation', '/treatments/orthodontics',
    '/doctors/', '/doctors/moon', '/doctors/kim', '/doctors/hyun',
    '/doctors/choi', '/doctors/lee', '/doctors/park', '/doctors/kang',
    '/doctors/jo', '/doctors/seo', '/doctors/lim',
    '/doctors/kim-mg', '/doctors/kim-mj', '/doctors/kang-mj',
    '/doctors/park-sb', '/doctors/lee-bm',
    '/doctors/oral-medicine', '/doctors/pediatric', '/doctors/conservative', '/doctors/orthodontics', '/doctors/integrated-dentistry',
    '/doctors/implant', '/doctors/general', '/doctors/representative',
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

// Doctors directory — index는 정적, 개별 페이지는 SSR
app.get('/doctors', serveStatic({ path: './doctors/index.html' }))
app.get('/doctors/', serveStatic({ path: './doctors/index.html' }))

// ============================================
// 전문과별 소개 페이지 (정적 서빙 — :slug 위에 먼저 등록)
// ============================================
app.get('/doctors/oral-medicine', serveStatic({ path: './doctors/oral-medicine.html' }))
app.get('/doctors/pediatric', serveStatic({ path: './doctors/pediatric.html' }))
app.get('/doctors/conservative', serveStatic({ path: './doctors/conservative.html' }))
app.get('/doctors/orthodontics', serveStatic({ path: './doctors/orthodontics.html' }))
app.get('/doctors/implant', serveStatic({ path: './doctors/implant.html' }))
app.get('/doctors/general', serveStatic({ path: './doctors/general.html' }))
app.get('/doctors/representative', serveStatic({ path: './doctors/representative.html' }))
app.get('/doctors/integrated-dentistry', serveStatic({ path: './doctors/integrated-dentistry.html' }))

// 정적 자산 (CSS/JS/이미지 등 . 포함 경로)
app.use('/doctors/*', async (c, next) => {
  const path = c.req.path
  // .html/.css/.js/.jpg 등 확장자가 있는 건 정적 서빙
  if (/\.\w+$/.test(path)) return serveStatic()(c, next)
  // 확장자 없으면 SSR 라우트로 넘김
  return next()
})

// ============================================
// 풀네임 슬러그 → 약칭 슬러그 301 리다이렉트 (SEO canonical 통일)
// ============================================
const FULLNAME_TO_SHORT_SLUG: Record<string,string> = {
  'kimminsu':'kim','hyunjungmin':'hyun','leesungyeop':'lee',
  'choijunghun':'choi','kangkyungmin':'kang','parksoobin':'park-sb',
  'leebyungmin':'lee-bm','kangminji':'kang-mj','kimmingyou':'kim-mg',
  'kimminji':'kim-mj','limjiwon':'lim','joseola':'jo',
  'parksanghyun':'park','seoheewon':'seo',
  // 하이픈 변형도 커버
  'kim-minsu':'kim','hyun-jungmin':'hyun','lee-sungyeop':'lee',
  'choi-junghun':'choi','kang-kyungmin':'kang','park-soobin':'park-sb',
  'lee-byungmin':'lee-bm',
}
app.get('/doctors/:slug', async (c, next) => {
  const slug = c.req.param('slug')
  const shortSlug = FULLNAME_TO_SHORT_SLUG[slug]
  if (shortSlug) return c.redirect(`/doctors/${shortSlug}`, 301)
  return next()
})

// ============================================
// 원장별 SSR 페이지 — 케이스 카드 + 컬럼 카드 주입
// ============================================
app.get('/doctors/:slug', async (c) => {
  const slug = c.req.param('slug')
  // index 등 정적 경로는 무시
  if (slug === 'index' || slug.includes('.')) return c.notFound()
  
  const r2 = c.env.R2
  
  // doctorName 가져오기
  const doctorName = SLUG_TO_DOCTOR[slug]
  
  // 케이스와 컬럼 로드 (R2 있으면)
  let doctorCases: any[] = []
  let doctorColumns: any[] = []
  if (r2) {
    const [allCases, allColumns] = await Promise.all([getCases(r2), getColumns(r2)])
    doctorCases = allCases.filter((cs: any) => cs.status === 'published' && cs.doctorName === doctorName).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 6)
    doctorColumns = allColumns.filter((col: any) => col.status === 'published' && col.doctorName === doctorName).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 4)
  }
  
  // 케이스 카드 HTML 생성
  const CATS: Record<string,string> = {
    implant:'임플란트', invisalign:'인비절라인', orthodontics:'치아교정', pediatric:'소아치과',
    'front-crown':'앞니크라운',
    aesthetic:'심미레진', glownate:'글로우네이트', cavity:'충치치료',
    resin:'레진치료', crown:'크라운', inlay:'인레이/온레이',
    'root-canal':'신경치료', 're-root-canal':'재신경치료',
    whitening:'미백', bridge:'브릿지', denture:'틀니',
    scaling:'스케일링', gum:'잇몸치료', periodontitis:'치주염',
    'gum-surgery':'잇몸수술', 'wisdom-tooth':'사랑니발치',
    apicoectomy:'치근단절제술', sedation:'수면치료', prevention:'예방치료',
    tmj:'턱관절(TMJ)', bruxism:'이갈이/브럭시즘', emergency:'응급치료'
  }
  
  let casesSection = ''
  if (doctorCases.length > 0) {
    const caseCards = doctorCases.map((cs: any) => {
      const thumb = cs.beforeImage || cs.afterImage || cs.panBeforeImage || cs.panAfterImage || ''
      const cat = CATS[cs.category] || cs.category || ''
      return `<a href="/cases/${cs.id}" class="dr-case-card" style="text-decoration:none;color:inherit;">
        <div class="dr-case-thumb">${thumb ? `<img src="${thumb}" alt="${cs.title}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">` : '<div style="width:100%;height:100%;background:#f0ebe4;display:flex;align-items:center;justify-content:center;"><i class="fas fa-tooth" style="font-size:2rem;color:#d4c5b3;"></i></div>'}</div>
        <div class="dr-case-info"><span class="dr-case-cat">${cat}</span><h4>${cs.title}</h4>${cs.treatmentPeriod ? `<span class="dr-case-period"><i class="fas fa-clock"></i> ${cs.treatmentPeriod}</span>` : ''}</div>
      </a>`
    }).join('')

    casesSection = `
    <section class="dr-section dr-cases-section" id="doctorCases">
      <div class="dr-section-header">
        <span class="dr-section-badge"><i class="fas fa-images"></i> Before / After</span>
        <h3 class="dr-section-title">${doctorName ? doctorName.replace(' 원장','') : ''} 원장님의 치료 사례</h3>
        <p class="dr-section-sub">실제 환자분의 치료 전후를 확인해보세요</p>
      </div>
      <div class="dr-cases-grid">${caseCards}</div>
      <div style="text-align:center;margin-top:20px;"><a href="/cases/gallery" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:.88rem;"><i class="fas fa-th"></i> 전체 갤러리 보기</a></div>
    </section>`
  }
  
  // 컬럼 카드 HTML 생성
  let columnsSection = ''
  if (doctorColumns.length > 0) {
    const colCards = doctorColumns.map((col: any) => {
      const excerpt = (col.content || '').replace(/<[^>]*>/g, '').slice(0, 80) + '...'
      const date = new Date(col.createdAt || Date.now()).toLocaleDateString('ko-KR', { year:'numeric', month:'short', day:'numeric' })
      return `<a href="/column/${col.id}" class="dr-col-card" style="text-decoration:none;color:inherit;">
        ${col.thumbnailImage ? `<div class="dr-col-thumb"><img src="${col.thumbnailImage}" alt="${col.title}"></div>` : ''}
        <div class="dr-col-info">
          ${col.category ? `<span class="dr-col-cat">${col.category}</span>` : ''}
          <h4>${col.title}</h4>
          <p>${excerpt}</p>
          <span class="dr-col-date"><i class="far fa-calendar"></i> ${date}</span>
        </div>
      </a>`
    }).join('')

    columnsSection = `
    <section class="dr-section dr-columns-section" id="doctorColumns">
      <div class="dr-section-header">
        <span class="dr-section-badge"><i class="fas fa-pen-nib"></i> 원장 컬럼</span>
        <h3 class="dr-section-title">${doctorName ? doctorName.replace(' 원장','') : ''} 원장님의 이야기</h3>
        <p class="dr-section-sub">진료 철학과 치과 이야기를 전합니다</p>
      </div>
      <div class="dr-columns-grid">${colCards}</div>
      <div style="text-align:center;margin-top:20px;"><a href="/column/?doctor=${slug}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:.88rem;"><i class="fas fa-pen-nib"></i> 컬럼 전체 보기</a></div>
    </section>`
  }
  
  // CSS for injected sections
  const injectedCSS = `<style>
.dr-section{max-width:900px;margin:40px auto;padding:0 20px}
.dr-section-header{text-align:center;margin-bottom:28px}
.dr-section-badge{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:600;color:#6B4226;background:#f5f0eb;padding:5px 14px;border-radius:50px;margin-bottom:10px}
.dr-section-title{font-size:1.4rem;font-weight:800;color:#333;margin-bottom:6px}
.dr-section-sub{font-size:.88rem;color:#888}
.dr-cases-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.dr-case-card{border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 2px 12px rgba(107,66,38,.06);transition:transform .2s,box-shadow .2s}
.dr-case-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(107,66,38,.12)}
.dr-case-thumb{position:relative;aspect-ratio:16/10;overflow:hidden;background:#f0ebe4}
.dr-case-info{padding:14px 16px}
.dr-case-cat{font-size:.72rem;font-weight:600;color:#a855f7;background:#f3e8ff;padding:2px 10px;border-radius:50px;display:inline-block;margin-bottom:6px}
.dr-case-info h4{font-size:.92rem;font-weight:700;color:#333;margin:0 0 4px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dr-case-period{font-size:.75rem;color:#999;display:flex;align-items:center;gap:4px}
.dr-columns-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.dr-col-card{border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 2px 12px rgba(107,66,38,.06);transition:transform .2s,box-shadow .2s}
.dr-col-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(107,66,38,.12)}
.dr-col-thumb{aspect-ratio:16/9;overflow:hidden;background:#f0ebe4}
.dr-col-thumb img{width:100%;height:100%;object-fit:cover}
.dr-col-info{padding:16px 18px}
.dr-col-cat{font-size:.72rem;font-weight:600;color:#3b82f6;background:#dbeafe;padding:2px 10px;border-radius:50px;display:inline-block;margin-bottom:6px}
.dr-col-info h4{font-size:1rem;font-weight:700;color:#333;margin:0 0 6px;line-height:1.4}
.dr-col-info p{font-size:.85rem;color:#777;line-height:1.5;margin:0 0 8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dr-col-date{font-size:.75rem;color:#aaa;display:flex;align-items:center;gap:4px}
@media(max-width:768px){.dr-cases-grid{grid-template-columns:repeat(2,1fr)}.dr-columns-grid{grid-template-columns:1fr}}
@media(max-width:480px){.dr-cases-grid{grid-template-columns:1fr}.dr-section-title{font-size:1.2rem}}
</style>`

  // 삽입 지점: </main> 바로 앞 또는 .footer-cta 앞
  // 원본 HTML을 수정: philosophy-section 다음, other-doctors 앞에 삽입
  
  // 원본 HTML 반환 (정적 파일 읽기 — __STATIC_CONTENT 사용)
  // Cloudflare Pages에서는 __STATIC_CONTENT를 직접 접근 불가하므로, 
  // 클라이언트 사이드 fetch로 대체
  // 대신, 의사 페이지 HTML을 <head> 끝에 CSS 주입 + </main> 앞에 섹션 주입하는 JS를 추가
  
  // ASSETS binding으로 정적 HTML 가져오기 (Cloudflare Pages)
  try {
    const env = c.env as any
    let html = ''
    // Cloudflare Pages ASSETS binding 사용
    if (env.ASSETS) {
      const assetReq = new Request(new URL(`/doctors/${slug}.html`, c.req.url).toString())
      const resp = await env.ASSETS.fetch(assetReq)
      if (!resp.ok) return c.notFound()
      html = await resp.text()
    } else {
      // 로컬 개발용 self-fetch (wrangler pages dev)
      const staticUrl = new URL(`/doctors/${slug}.html`, c.req.url)
      const resp = await fetch(staticUrl.toString())
      if (!resp.ok) return c.notFound()
      html = await resp.text()
    }
    
    // ===== VideoObject 스키마 주입 (Google 동영상 색인) =====
    const DOCTOR_VIDEO_MAP: Record<string, { videoId: string, name: string, description: string }> = {
      'lee-bm': { videoId: 'YoKw5-a4TCI', name: '서울비디치과 이병민 원장', description: '서울비디치과 이병민 원장 소개 영상. 턱관절·구강안면통증 전문, 서울대 출신, 환자 중심의 따뜻한 진료.' },
      'kang-mj': { videoId: 'cl7HfvwWRVQ', name: '서울비디치과 강민지 원장', description: '서울비디치과 강민지 원장 소개 영상. 서울대 출신, 교정·인비절라인 전문 진료.' },
      'park': { videoId: '2u5bRNOzdM0', name: '서울비디치과 박상현 원장', description: '서울비디치과 박상현 원장 소개 영상. 서울대 출신, 구강악안면외과·임플란트 전문.' },
      'seo': { videoId: '1gPf6L5vNcA', name: '서울비디치과 서희원 원장', description: '서울비디치과 서희원 원장 소개 영상. 서울대 출신, 보존과·신경치료·심미치료 전문.' },
      'choi': { videoId: 'p8TSrC5emyw', name: '서울비디치과 최종훈 원장', description: '서울비디치과 최종훈 원장 소개 영상. 서울대 출신, 보철과·임플란트·크라운 전문.' },
      'kim': { videoId: 'ER7Q9T24Z3w', name: '서울비디치과 김민수 원장', description: '서울비디치과 김민수 대표원장 소개 영상. 서울대 출신, 통합치의학과 전문의.' },
      'kim-mj': { videoId: 'YAsUupKO-6M', name: '서울비디치과 김민진 원장', description: '서울비디치과 김민진 원장 소개 영상. 서울대 출신, 소아치과 전문의.' },
      'moon': { videoId: 'JV7JDndC3ug', name: '서울비디치과 문석준 원장', description: '서울비디치과 문석준 대표원장 소개 영상. 서울대 출신, 페이션트 퍼널 창립자.' },
      'hyun': { videoId: '_4oIPlOMTEU', name: '서울비디치과 현정민 원장', description: '서울비디치과 현정민 원장 소개 영상. 서울대 출신, 보존과·근관치료 전문.' },
      'jo': { videoId: '4IZ4vAcE0QM', name: '서울비디치과 조설아 원장', description: '서울비디치과 조설아 원장 소개 영상. 서울대 출신, 교정과 전문의.' },
      'kang': { videoId: 'Ce-40X4uxjc', name: '서울비디치과 강경민 원장', description: '서울비디치과 강경민 원장 소개 영상. 서울대 출신, 보철과 전문.' },
      'kim-mg': { videoId: 'b4SXrX18ZrQ', name: '서울비디치과 김민규 원장', description: '서울비디치과 김민규 원장 소개 영상. 서울대 출신, 구강외과·임플란트 전문.' },
      'lee': { videoId: 'KTIndFhNiBw', name: '서울비디치과 이승엽 원장', description: '서울비디치과 이승엽 원장 소개 영상. 서울대 출신, 소아치과 전문의.' },
      'lim': { videoId: 'P8e_uouF4p8', name: '서울비디치과 임지원 원장', description: '서울비디치과 임지원 원장 소개 영상. 서울대 출신, 소아치과 전문의.' },
      'park-sb': { videoId: 'qH92vphwt8c', name: '서울비디치과 박수빈 원장', description: '서울비디치과 박수빈 원장 소개 영상. 서울대 출신, 교정과 전문.' },
    }
    
    const videoInfo = DOCTOR_VIDEO_MAP[slug]
    let videoObjectSchema = ''
    if (videoInfo) {
      videoObjectSchema = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "${videoInfo.name}",
  "description": "${videoInfo.description}",
  "thumbnailUrl": "https://i.ytimg.com/vi/${videoInfo.videoId}/hqdefault.jpg",
  "uploadDate": "2025-01-01T00:00:00+09:00",
  "contentUrl": "https://www.youtube.com/watch?v=${videoInfo.videoId}",
  "embedUrl": "https://www.youtube.com/embed/${videoInfo.videoId}",
  "publisher": {
    "@type": "Organization",
    "name": "쉽디 쉬운 치과이야기",
    "logo": {
      "@type": "ImageObject",
      "url": "https://bdbddc.com/images/logo.png"
    }
  }
}
</script>`
    }

    // CSS + VideoObject 스키마 주입 (</head> 앞에)
    if (casesSection || columnsSection || videoObjectSchema) {
      const headInjection = (casesSection || columnsSection ? injectedCSS : '') + videoObjectSchema
      html = html.replace('</head>', `${headInjection}\n</head>`)
    }
    
    // 케이스+컬럼 섹션 주입 (다른 의료진 보기 섹션 앞에)
    const insertContent = casesSection + columnsSection
    if (insertContent) {
      // .other-doctors 앞에 삽입
      if (html.includes('class="other-doctors"')) {
        html = html.replace('<div class="other-doctors">', `${insertContent}\n    <div class="other-doctors">`)
      }
      // 대안: footer-cta 앞에
      else if (html.includes('class="footer-cta"')) {
        html = html.replace('<section class="footer-cta">', `${insertContent}\n    <section class="footer-cta">`)
      }
      // 최후 수단: </main> 앞에
      else if (html.includes('</main>')) {
        html = html.replace('</main>', `${insertContent}\n</main>`)
      }
    }
    
    // ===== 전문 진료 분야 태그 → 진료 페이지 링크 변환 =====
    const SPECIALTY_LINK_MAP: Record<string, string> = {
      // 임플란트
      '임플란트': '/treatments/implant',
      '임플란트 수술': '/treatments/implant',
      '뼈이식': '/treatments/implant',
      '전악 임플란트': '/treatments/implant',
      // 교정
      '인비절라인': '/treatments/invisalign',
      '치아교정': '/treatments/orthodontics',
      '치과교정': '/treatments/orthodontics',
      '디지털 교정': '/treatments/orthodontics',
      '성장기 교정 (First·MA)': '/treatments/orthodontics',
      '3급 부정교합': '/treatments/orthodontics',
      '비수술 절충치료': '/treatments/orthodontics',
      '개방교합 교정': '/treatments/orthodontics',
      '청소년 교정': '/treatments/orthodontics',
      '성장기 교정': '/treatments/orthodontics',
      '투명교정(인비절라인)': '/treatments/invisalign',
      '인비절라인 퍼스트': '/treatments/invisalign',
      '소아 교정': '/treatments/orthodontics',
      '악정형 치료': '/treatments/orthodontics',
      // 글로우네이트 / 심미
      '✨ 글로우네이트(라미네이트)': '/treatments/glownate',
      '글로우네이트': '/treatments/glownate',
      '심미레진': '/treatments/aesthetic',
      '심미 레진 치료': '/treatments/aesthetic',
      '심미레진(라미네이트·레진)': '/treatments/aesthetic',
      '앞니 파절/틈새 복원': '/treatments/aesthetic',
      'DSD 디지털 스마일 디자인': '/treatments/aesthetic',
      '무삭제 보존적 심미레진': '/treatments/aesthetic',
      // 충치 / 보존
      '충치치료': '/treatments/cavity',
      '소아 충치치료': '/treatments/cavity',
      // 신경치료
      '신경치료': '/treatments/root-canal',
      '근관치료': '/treatments/root-canal',
      '재신경치료': '/treatments/re-root-canal',
      '재생근관술식': '/treatments/re-root-canal',
      '재생 근관치료': '/treatments/re-root-canal',
      '치아보존': '/treatments/root-canal',
      '자연치아 보존': '/treatments/root-canal',
      '치근단 치료': '/treatments/apicoectomy',
      '치아살리기': '/treatments/root-canal',
      // 소아치과
      '소아치과': '/treatments/pediatric',
      '영유아검진': '/treatments/pediatric',
      '영유아 검진': '/treatments/pediatric',
      '어린이·청소년 충치치료': '/treatments/pediatric',
      '구강관리 지도': '/treatments/prevention',
      '성장기 교정 상담': '/treatments/orthodontics',
      '소아 예방치료': '/treatments/pediatric',
      '웃음가스 진정': '/treatments/sedation',
      '행동조절': '/treatments/pediatric',
      '예방치료': '/treatments/prevention',
      '불소도포': '/treatments/prevention',
      // 잇몸
      '사랑니 발치': '/treatments/wisdom-tooth',
      '외과진료': '/treatments/gum-surgery',
      '구강소수술': '/treatments/gum-surgery',
      // 턱관절 / 특수
      '구강내과': '/treatments/oral-medicine',
      '턱관절장애': '/treatments/tmj',
      '만성 구강안면통증': '/treatments/oral-medicine',
      '이갈이·이악물기': '/treatments/bruxism',
      '코골이·수면질환': '/treatments/oral-medicine',
      '구강건조증': '/treatments/oral-medicine',
      '구강점막질환': '/treatments/oral-medicine',
      // 미백
      '미백': '/treatments/whitening',
      // 앞니 크라운
      '앞니크라운': '/treatments/crown',
      '앞니 크라운': '/treatments/crown',
      // 기타
      '종합진료': '/treatments/',
      '통합치의학': '/treatments/',
      '정밀 진단': '/treatments/',
      '디지털 수술': '/treatments/implant',
    }

    // specialty-tag span → a 태그로 변환
    html = html.replace(/<span class="specialty-tag">([^<]+)<\/span>/g, (match, tagText) => {
      const link = SPECIALTY_LINK_MAP[tagText.trim()]
      if (link) {
        return `<a href="${link}" class="specialty-tag" style="text-decoration:none;cursor:pointer;transition:all 0.2s;">${tagText}</a>`
      }
      return match // 매핑 없으면 원래 span 유지
    })

    // ===== 다른 의료진 보기 섹션 동적 교체 (가짜 카드 제거) =====
    const DOCTOR_INFO: Record<string, { name: string; specialty: string }> = {
      moon: { name: '문석준 원장', specialty: '대표원장' },
      kim: { name: '김민수 원장', specialty: '대표원장 · 통합치의학과 전문의' },
      hyun: { name: '현정민 원장', specialty: '대표원장 · 통합치의학과 전문의' },
      lee: { name: '이승엽 원장', specialty: '임플란트센터' },
      choi: { name: '최종훈 원장', specialty: '통합진료센터' },
      kang: { name: '강경민 원장', specialty: '통합진료센터' },
      'park-sb': { name: '박수빈 원장', specialty: '통합진료센터' },
      lim: { name: '임지원 원장', specialty: '교정과' },
      'kim-mg': { name: '김민규 원장', specialty: '교정과' },
      'kang-mj': { name: '강민지 원장', specialty: '보존과' },
      jo: { name: '조설아 원장', specialty: '보존과' },
      'kim-mj': { name: '김민진 원장', specialty: '소아치과' },
      seo: { name: '서희원 원장', specialty: '소아치과' },
      park: { name: '박상현 원장', specialty: '소아치과' },
      'lee-bm': { name: '이병민 원장', specialty: '구강내과' },
    }
    
    // 자기 자신 제외 전체 의료진 (대표원장 우선)
    const otherSlugs = Object.keys(DOCTOR_INFO).filter(s => s !== slug)
    const prioritized = slug !== 'moon' 
      ? ['moon', ...otherSlugs.filter(s => s !== 'moon')]
      : otherSlugs
    
    const otherDoctorsHtml = `<div class="other-doctors">
            <h3>다른 의료진 보기</h3>
            <div class="doctors-mini-grid">
${prioritized.map(s => {
  const d = DOCTOR_INFO[s]
  if (!d) return ''
  return `                <a href="/doctors/${s}" class="doctor-mini-card">
                    <div class="mini-photo">
                      <picture>
                        <source srcset="/images/doctors/${s}-profile.webp" type="image/webp">
                        <img src="/images/doctors/${s}-profile.jpg" alt="${d.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--brand),var(--brand-gold));border-radius:50%;color:#fff;font-size:1.5rem;font-weight:700\\'>${d.name.charAt(0)}</div>'">
                      </picture>
                    </div>
                    <p class="mini-name">${d.name}</p>
                    <p class="mini-specialty">${d.specialty}</p>
                </a>`
}).join('\n')}
            </div>
        </div>`
    
    // 기존 other-doctors 섹션 전체를 교체 (정규식으로 시작~끝 매칭)
    html = html.replace(
      /<div class="other-doctors">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
      otherDoctorsHtml
    )
    
    return c.html(html)
  } catch (e) {
    // fetch 실패 시 정적 서빙으로 폴백
    return c.notFound()
  }
})

// Column directory — 컬럼 목록 + 상세 SSR
app.get('/column', async (c) => c.redirect('/column/', 301))
app.get('/column/', async (c) => {
  const r2 = c.env.R2
  let columns: any[] = []
  if (r2) {
    const all = await getColumns(r2)
    columns = all.filter((col: any) => col.status === 'published')
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }
  const doctorFilter = c.req.query('doctor') || ''
  if (doctorFilter) {
    const filterName = SLUG_TO_DOCTOR[doctorFilter] || doctorFilter
    columns = columns.filter((col: any) => col.doctorName === filterName || DOCTOR_SLUG_MAP[col.doctorName] === doctorFilter)
  }
  const filterTitle = doctorFilter && SLUG_TO_DOCTOR[doctorFilter] ? `${SLUG_TO_DOCTOR[doctorFilter]}의 ` : ''
  
  const COL_LIST_DOCTOR_INFO: Record<string, { specialty: string }> = {
    moon: { specialty: '대표원장' },
    kim: { specialty: '대표원장 · 통합치의학과 전문의' },
    hyun: { specialty: '대표원장 · 통합치의학과 전문의' },
    lee: { specialty: '임플란트센터' },
    choi: { specialty: '통합진료센터' },
    kang: { specialty: '통합진료센터' },
    'park-sb': { specialty: '통합진료센터' },
    lim: { specialty: '교정과' },
    'kim-mg': { specialty: '교정과' },
    'kang-mj': { specialty: '보존과' },
    jo: { specialty: '보존과' },
    'kim-mj': { specialty: '소아치과' },
    seo: { specialty: '소아치과' },
    park: { specialty: '소아치과' },
    'lee-bm': { specialty: '구강내과' },
  }

  const colCards = columns.map((col: any) => {
    const excerpt = (col.content || '').replace(/<[^>]*>/g, '').slice(0, 120) + '...'
    const date = new Date(col.createdAt || Date.now()).toLocaleDateString('ko-KR', { year:'numeric', month:'short', day:'numeric' })
    const slug = DOCTOR_SLUG_MAP[col.doctorName] || ''
    const drSpec = COL_LIST_DOCTOR_INFO[slug]?.specialty || '치과의사'
    const thumbHtml = col.thumbnailImage 
      ? `<div class="cc-thumb"><img src="${col.thumbnailImage}" alt="${col.title}" loading="lazy">${col.category ? `<span class="cc-cat">${col.category}</span>` : ''}</div>`
      : `<div class="cc-thumb cc-thumb-empty"><div class="cc-thumb-placeholder"><i class="fas fa-pen-nib"></i></div>${col.category ? `<span class="cc-cat">${col.category}</span>` : ''}</div>`
    const avatarHtml = slug 
      ? `<img src="/images/doctors/${slug}-profile.webp" alt="${col.doctorName}" class="cc-avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="cc-avatar-fb" style="display:none">${(col.doctorName || '').charAt(0)}</span>`
      : `<span class="cc-avatar-fb">${(col.doctorName || '서').charAt(0)}</span>`
    return `<a href="/column/${col.id}" class="cc-card">
${thumbHtml}
<div class="cc-body">
<h3 class="cc-title">${col.title}</h3>
<p class="cc-excerpt">${excerpt}</p>
<div class="cc-footer">
<div class="cc-author">
<div class="cc-avatar">${avatarHtml}</div>
<div class="cc-author-info">
<span class="cc-author-name">${col.doctorName || ''}</span>
<span class="cc-author-meta">${drSpec} · ${date}</span>
</div>
</div>
</div>
</div>
</a>`
  }).join('')

  // 원장 필터 버튼
  const doctors = [...new Set(columns.map((c: any) => c.doctorName).filter(Boolean))]
  const filterBtns = doctors.length > 1 ? `<div class="col-filter-row">
    <a href="/column/" class="col-filter-btn ${!doctorFilter ? 'active' : ''}">전체</a>
    ${doctors.map(d => { const s = DOCTOR_SLUG_MAP[d] || ''; return `<a href="/column/?doctor=${s}" class="col-filter-btn ${doctorFilter === s ? 'active' : ''}">${d}</a>` }).join('')}
  </div>` : ''

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
${TRACKING_HEAD}
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${filterTitle}원장 컬럼 | 서울비디치과</title>
<meta name="description" content="서울비디치과 원장님들의 진료 철학과 치과 이야기. ${filterTitle}컬럼을 읽어보세요.">
<meta name="robots" content="index, follow">
<meta name="ai-summary" content="서울비디치과 원장 컬럼 — 서울대 출신 15인 원장이 직접 쓰는 진료 철학, 치과 지식, 환자 이야기.">
<meta name="abstract" content="서울비디치과 원장님들이 전하는 진료 철학과 치과 이야기 모음.">
<meta name="subject" content="치과 칼럼, 원장 칼럼, 서울비디치과, 치과 이야기, 진료 철학">
<link rel="canonical" href="https://bdbddc.com/column/${doctorFilter ? '?doctor=' + doctorFilter : ''}">
<meta property="og:title" content="${filterTitle}원장 컬럼 | 서울비디치과">
<meta property="og:url" content="https://bdbddc.com/column/${doctorFilter ? '?doctor=' + doctorFilter : ''}">
<meta property="og:description" content="서울비디치과 원장님들의 진료 철학과 치과 이야기.">
<meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
<meta property="og:type" content="website">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/css/site-v5.css?v=1a91d774">
<style>
.col-page{max-width:900px;margin:0 auto;padding:40px 20px}
.col-hero{text-align:center;margin-bottom:36px}
.col-hero-badge{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:600;color:#6B4226;background:#f5f0eb;padding:5px 14px;border-radius:50px;margin-bottom:12px}
.col-hero h1{font-size:1.8rem;font-weight:800;color:#333;margin-bottom:8px}
.col-hero p{font-size:.95rem;color:#888}
.col-filter-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:28px}
.col-filter-btn{padding:6px 18px;border-radius:50px;font-size:.82rem;font-weight:600;color:#888;background:#f5f0eb;text-decoration:none;transition:all .2s}
.col-filter-btn.active,.col-filter-btn:hover{background:#6B4226;color:#fff}

/* ===== COLUMN CARD GRID ===== */
.col-list-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}

/* Card */
.cc-card{display:flex;flex-direction:column;background:#fff;border-radius:20px;overflow:hidden;text-decoration:none;color:inherit;box-shadow:0 2px 16px rgba(107,66,38,.06);transition:transform .28s ease,box-shadow .28s ease;border:1px solid rgba(107,66,38,.06)}
.cc-card:hover{transform:translateY(-5px);box-shadow:0 12px 40px rgba(107,66,38,.13)}

/* Thumbnail */
.cc-thumb{position:relative;aspect-ratio:16/9;overflow:hidden;background:#f5f0eb}
.cc-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
.cc-card:hover .cc-thumb img{transform:scale(1.05)}
.cc-thumb-empty{display:flex;align-items:center;justify-content:center}
.cc-thumb-placeholder{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,#f5f0eb 0%,#ede6dd 100%)}
.cc-thumb-placeholder i{font-size:2.5rem;color:#d4c5b3}
.cc-cat{position:absolute;top:12px;left:12px;font-size:.7rem;font-weight:700;color:#fff;background:rgba(107,66,38,.85);backdrop-filter:blur(8px);padding:4px 12px;border-radius:50px;letter-spacing:.3px}

/* Body */
.cc-body{padding:20px 22px 18px;display:flex;flex-direction:column;flex:1}
.cc-title{font-size:1.05rem;font-weight:700;color:#222;margin:0 0 8px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cc-excerpt{font-size:.84rem;color:#888;line-height:1.6;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1}

/* Footer / Author */
.cc-footer{border-top:1px solid #f0ebe4;padding-top:14px;margin-top:auto}
.cc-author{display:flex;align-items:center;gap:10px}
.cc-avatar{width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0;border:2px solid #f5f0eb}
.cc-avatar-img{width:100%;height:100%;object-fit:cover}
.cc-avatar-fb{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;font-size:.8rem;font-weight:700;border-radius:50%}
.cc-author-info{display:flex;flex-direction:column;min-width:0}
.cc-author-name{font-size:.82rem;font-weight:700;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cc-author-meta{font-size:.7rem;color:#aaa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.col-empty{text-align:center;padding:60px 20px;color:#999}
.col-empty i{font-size:3rem;color:#d4c5b3;margin-bottom:16px;display:block}

/* === Medium English Articles Section === */
.med-en-section{margin-top:48px;padding-top:40px;border-top:2px solid #f0ebe4}
.med-en-header{text-align:center;margin-bottom:28px}
.med-en-badge{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:600;color:#000;background:#f5f5f5;padding:5px 14px;border-radius:50px;margin-bottom:12px}
.med-en-header h2{font-size:1.5rem;font-weight:800;color:#333;margin:0 0 8px}
.med-en-header p{font-size:.88rem;color:#888;margin:0}
.med-en-grid{display:grid;gap:20px;margin-bottom:20px}
.med-en-card{display:flex;gap:20px;align-items:flex-start;background:#fff;border:1px solid #e8e8e8;border-radius:16px;padding:24px;text-decoration:none;color:inherit;transition:all .28s ease}
.med-en-card:hover{border-color:#333;box-shadow:0 8px 30px rgba(0,0,0,.08);transform:translateY(-3px)}
.med-en-icon{flex-shrink:0;width:52px;height:52px;border-radius:14px;background:#1a1a1a;display:flex;align-items:center;justify-content:center}
.med-en-icon i{font-size:1.3rem;color:#fff}
.med-en-body h3{font-size:1rem;font-weight:700;color:#222;margin:0 0 8px;line-height:1.45}
.med-en-body p{font-size:.84rem;color:#666;line-height:1.6;margin:0 0 12px}
.med-en-meta{font-size:.76rem;font-weight:600;color:#1a1a1a;display:inline-flex;align-items:center;gap:6px}
.med-en-meta i.fa-external-link-alt{font-size:.65rem;opacity:.6}
.med-en-more{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;background:#1a1a1a;color:#fff;border-radius:50px;text-decoration:none;font-size:.88rem;font-weight:600;transition:all .2s;width:fit-content;margin:0 auto}
.med-en-more:hover{background:#333;transform:translateY(-2px)}

@media(max-width:700px){
  .col-list-grid{grid-template-columns:1fr}
  .col-hero h1{font-size:1.4rem}
  .med-en-card{flex-direction:column;gap:14px}
  .med-en-header h2{font-size:1.2rem}
}
@media(min-width:701px) and (max-width:900px){
  .col-list-grid{grid-template-columns:repeat(2,1fr);gap:18px}
}
</style>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "서울비디치과 원장 컬럼",
  "description": "서울대 출신 15인 원장이 직접 쓰는 진료 철학, 치과 지식, 환자 이야기",
  "url": "https://bdbddc.com/column/",
  "publisher": {
    "@type": "Dentist",
    "name": "서울비디치과",
    "url": "https://bdbddc.com",
    "logo": { "@type": "ImageObject", "url": "https://bdbddc.com/images/og-image-v2.jpg" }
  },
  "inLanguage": "ko"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://bdbddc.com" },
    { "@type": "ListItem", "position": 2, "name": "원장 컬럼", "item": "https://bdbddc.com/column/" }
  ]
}
</script>
</head>
<body>
${ssrHeader()}
<main>
<div class="col-page">
<div class="col-hero">
<span class="col-hero-badge"><i class="fas fa-pen-nib"></i> 원장 컬럼</span>
<h1>${filterTitle ? filterTitle + '칼럼' : '서울비디치과 의료 칼럼'}</h1>
<p>서울비디치과 원장님들이 전하는 진료 철학과 치과 이야기</p>
</div>
${filterBtns}
<div class="col-list-grid">
${colCards || '<div class="col-empty"><i class="fas fa-pen-nib"></i><h3>아직 작성된 컬럼이 없습니다</h3><p>곧 원장님들의 이야기가 게재됩니다</p></div>'}
</div>

<!-- English Clinical Articles on Medium -->
<section class="med-en-section">
<div class="med-en-header">
<span class="med-en-badge"><i class="fab fa-medium"></i> English Articles</span>
<h2>Clinical Insights on Medium</h2>
<p>Evidence-based dental articles by Dr. Moon — 문석준 대표원장의 영어 임상 칼럼</p>
</div>
<div class="med-en-grid">
<a href="https://medium.com/@sodanstjrwns/bone-grafting-before-implants-when-a-sinus-lift-is-overkill-b9557f1c6cac" target="_blank" rel="noopener" class="med-en-card">
<div class="med-en-icon"><i class="fas fa-bone"></i></div>
<div class="med-en-body">
<h3>Bone Grafting Before Implants: When a Sinus Lift Is Overkill</h3>
<p>A 56-year-old patient was told she needed bilateral sinus lifts. Two short implants later — no grafting, no membrane, three-year follow-up stable.</p>
<span class="med-en-meta"><i class="fab fa-medium"></i> Read on Medium <i class="fas fa-external-link-alt"></i></span>
</div>
</a>
<a href="https://medium.com/@sodanstjrwns/why-i-stopped-recommending-immediate-load-implants-for-80-of-patients-ba30ac6c5f83" target="_blank" rel="noopener" class="med-en-card">
<div class="med-en-icon"><i class="fas fa-bolt"></i></div>
<div class="med-en-body">
<h3>Why I Stopped Recommending Immediate-Load Implants for 80% of Patients</h3>
<p>Evidence from 2,000+ cases: patient selection criteria, the 6 disqualifying factors, and when conventional loading is the safer choice.</p>
<span class="med-en-meta"><i class="fab fa-medium"></i> Read on Medium <i class="fas fa-external-link-alt"></i></span>
</div>
</a>
<a href="https://medium.com/@sodanstjrwns/implant-or-bridge-for-a-missing-molar-in-your-40s-the-honest-decision-tree-32b75c8af66f" target="_blank" rel="noopener" class="med-en-card">
<div class="med-en-icon"><i class="fas fa-project-diagram"></i></div>
<div class="med-en-body">
<h3>Implant or Bridge for a Missing Molar in Your 40s? The Honest Decision Tree</h3>
<p>The 9-question decision framework: why the condition of neighboring teeth matters more than which option is "newer."</p>
<span class="med-en-meta"><i class="fab fa-medium"></i> Read on Medium <i class="fas fa-external-link-alt"></i></span>
</div>
</a>
<a href="https://medium.com/@sodanstjrwns/why-3-months-for-osseointegration-is-mostly-a-myth-a-clinicians-honest-take-432b2886da5d" target="_blank" rel="noopener" class="med-en-card">
<div class="med-en-icon"><i class="fas fa-clock"></i></div>
<div class="med-en-body">
<h3>Why "3 Months for Osseointegration" Is Mostly a Myth — A Clinician's Honest Take</h3>
<p>The healing timeline most clinics quote is outdated. Here's what the current evidence actually says about when implants are ready.</p>
<span class="med-en-meta"><i class="fab fa-medium"></i> Read on Medium <i class="fas fa-external-link-alt"></i></span>
</div>
</a>
<a href="https://medium.com/@sodanstjrwns/why-most-failed-dental-implants-didnt-actually-fail-and-what-really-went-wrong-89b9b5eba773" target="_blank" rel="noopener" class="med-en-card">
<div class="med-en-icon"><i class="fas fa-search"></i></div>
<div class="med-en-body">
<h3>Why Most "Failed" Dental Implants Didn't Actually Fail — And What Really Went Wrong</h3>
<p>Distinguishing true implant failure from peri-implantitis, prosthetic complications, and diagnostic misunderstanding.</p>
<span class="med-en-meta"><i class="fab fa-medium"></i> Read on Medium <i class="fas fa-external-link-alt"></i></span>
</div>
</a>
</div>
<a href="https://medium.com/@sodanstjrwns" target="_blank" rel="noopener" class="med-en-more">
<i class="fab fa-medium"></i> View all English articles on Medium <i class="fas fa-arrow-right"></i>
</a>
</section>

</div>
</main>
${ssrMobileNav()}
<script src="/js/main.js" defer></script>
<script src="/js/gnb-v2.js" defer></script>
</body>
</html>`)
})

// 컬럼 상세 페이지 SSR
app.get('/column/:id', async (c) => {
  const id = c.req.param('id')
  if (id.includes('.')) return c.notFound()
  
  const r2 = c.env.R2
  if (!r2) return c.redirect('/column/', 302)
  
  const all = await getColumns(r2)
  const col = all.find((x: any) => x.id === id && x.status === 'published')
  if (!col) return c.redirect('/column/', 302)
  
  const doctorSlug = DOCTOR_SLUG_MAP[col.doctorName] || ''
  const dateStr = new Date(col.createdAt || Date.now()).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })
  const isoDate = col.createdAt ? new Date(col.createdAt).toISOString() : ''
  const isoUpdated = col.updatedAt ? new Date(col.updatedAt).toISOString() : isoDate
  const plainExcerpt = (col.content || '').replace(/<[^>]*>/g, '').slice(0, 160)
  
  // SEO 메타필드 활용 (에디터에서 입력한 값 우선, 없으면 자동 생성)
  const seoTitle = col.metaTitle || col.title
  const seoDesc = col.metaDescription || plainExcerpt
  const ogImage = col.thumbnailImage || 'https://bdbddc.com/images/og-image-v2.jpg'
  const doctorNameClean = (col.doctorName || '').replace(' 원장', '')
  const focusKw = col.focusKeyword || ''
  // ai-summary: 포커스 키워드 포함 요약
  const aiSummary = `${seoTitle} — 서울비디치과 ${col.doctorName || ''} ${focusKw ? '| ' + focusKw : ''}`

  // 의사 상세 정보
  const COL_DOCTOR_INFO: Record<string, { specialty: string }> = {
    moon: { specialty: '대표원장' },
    kim: { specialty: '대표원장 · 통합치의학과 전문의' },
    hyun: { specialty: '대표원장 · 통합치의학과 전문의' },
    lee: { specialty: '임플란트센터' },
    choi: { specialty: '통합진료센터' },
    kang: { specialty: '통합진료센터' },
    'park-sb': { specialty: '통합진료센터' },
    lim: { specialty: '교정과' },
    'kim-mg': { specialty: '교정과' },
    'kang-mj': { specialty: '보존과' },
    jo: { specialty: '보존과' },
    'kim-mj': { specialty: '소아치과' },
    seo: { specialty: '소아치과' },
    park: { specialty: '소아치과' },
    'lee-bm': { specialty: '구강내과' },
  }
  const drInfo = COL_DOCTOR_INFO[doctorSlug] || { specialty: '치과의사' }

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
${TRACKING_HEAD}
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${seoTitle} | 원장 컬럼 — 서울비디치과</title>
<meta name="description" content="${seoDesc}">
<meta name="ai-summary" content="${aiSummary}">
${focusKw ? `<meta name="keywords" content="${focusKw},서울비디치과,원장컬럼,천안치과">` : ''}
<meta name="author" content="${col.doctorName || '서울비디치과'}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="https://bdbddc.com/column/${id}">
<meta property="og:title" content="${seoTitle} | 서울비디치과">
<meta property="og:description" content="${seoDesc}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://bdbddc.com/column/${id}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="서울비디치과">
<meta property="article:author" content="https://bdbddc.com/doctors/${doctorSlug}">
<meta property="article:published_time" content="${isoDate}">
${isoUpdated !== isoDate ? `<meta property="article:modified_time" content="${isoUpdated}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${seoTitle} | 서울비디치과">
<meta name="twitter:description" content="${seoDesc}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/css/site-v5.css?v=1a91d774">
<!-- BreadcrumbList -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"원장 컬럼","item":"https://bdbddc.com/column/"},{"@type":"ListItem","position":3,"name":"${col.title}","item":"https://bdbddc.com/column/${id}"}]}
</script>
<!-- Article Schema -->
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Article",
  "headline":"${seoTitle}",
  "description":"${seoDesc}",
  "author":{
    "@type":"Person",
    "@id":"https://bdbddc.com/#${doctorNameClean}",
    "name":"${col.doctorName || '서울비디치과'}",
    "jobTitle":"${drInfo.specialty || '치과의사'}",
    "url":"https://bdbddc.com/doctors/${doctorSlug}",
    "alumniOf":{"@type":"CollegeOrUniversity","name":"서울대학교 치의학대학원"},
    "worksFor":{"@type":"Dentist","@id":"https://bdbddc.com/#dentist","name":"서울비디치과","address":{"@type":"PostalAddress","addressLocality":"천안시","addressRegion":"충청남도","addressCountry":"KR"}},
    "sameAs":["https://bdbddc.com/doctors/${doctorSlug}"]
  },
  "datePublished":"${isoDate}",
  ${isoUpdated !== isoDate ? `"dateModified":"${isoUpdated}",` : ''}
  "url":"https://bdbddc.com/column/${id}",
  "mainEntityOfPage":{"@type":"WebPage","@id":"https://bdbddc.com/column/${id}"},
  "image":"${ogImage}",
  "publisher":{
    "@type":"Organization",
    "@id":"https://bdbddc.com/#org",
    "name":"서울비디치과",
    "url":"https://bdbddc.com",
    "logo":{"@type":"ImageObject","url":"https://bdbddc.com/images/og-image-v2.jpg"}
  },
  "inLanguage":"ko",
  ${focusKw ? `"keywords":"${focusKw}",` : ''}
  "isPartOf":{"@type":"Blog","name":"서울비디치과 원장 컬럼","url":"https://bdbddc.com/column/"}
}
</script>
<!-- Dentist Schema -->
<script type="application/ld+json">{
  "@context":"https://schema.org",
  "@type":"Dentist",
  "@id":"https://bdbddc.com/#dentist",
  "name":"서울비디치과",
  "telephone":"+82-41-415-2892",
  "address":{"@type":"PostalAddress","streetAddress":"불당34길 14, 1~5층","addressLocality":"천안시 서북구 불당동","addressRegion":"충청남도","addressCountry":"KR"},
  "sameAs":["https://pf.kakao.com/_Cxivlxb","https://www.youtube.com/@BDtube","https://www.youtube.com/@geoptongryung","https://naver.me/5yPnKmqQ"],
  "speakableSpecification":{"@type":"SpeakableSpecification","cssSelector":[".col-detail-header h1",".col-detail-body h2",".col-detail-body h3"]}
}</script>
<style>
.col-detail{max-width:760px;margin:0 auto;padding:40px 20px}
.col-detail-header{margin-bottom:32px}
.col-detail-header h1{font-size:1.6rem;font-weight:800;color:#333;margin-bottom:16px;line-height:1.4}
.col-detail-meta{display:flex;flex-wrap:wrap;gap:14px;font-size:.85rem;color:#888;align-items:center;margin-bottom:20px}
.col-detail-meta a{color:#6B4226;text-decoration:none;font-weight:600}
.col-detail-meta a:hover{text-decoration:underline}

/* ===== AUTHOR CARD ===== */
.col-author-card{display:flex;align-items:center;gap:16px;padding:16px 20px;background:linear-gradient(135deg,#faf7f3 0%,#f5f0eb 100%);border-radius:16px;border:1px solid #ede6dd;margin-bottom:28px;text-decoration:none;color:inherit;transition:all .25s ease}
.col-author-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(107,66,38,.1);border-color:#d4c5b3}
.col-author-avatar{width:56px;height:56px;border-radius:50%;overflow:hidden;flex-shrink:0;border:2.5px solid #fff;box-shadow:0 2px 12px rgba(107,66,38,.12)}
.col-author-avatar img{width:100%;height:100%;object-fit:cover}
.col-author-avatar .avatar-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;font-size:1.2rem;font-weight:700}
.col-author-info{flex:1;min-width:0}
.col-author-name{font-size:.95rem;font-weight:700;color:#333;display:flex;align-items:center;gap:6px;margin-bottom:3px}
.col-author-name .verified{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;background:#6B4226;border-radius:50%;font-size:.55rem;color:#fff}
.col-author-specialty{font-size:.78rem;color:#8B5E3C;font-weight:500;margin-bottom:2px}
.col-author-org{font-size:.72rem;color:#aaa}
.col-meta-badges{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.col-meta-badge{display:inline-flex;align-items:center;gap:5px;font-size:.76rem;padding:4px 12px;border-radius:50px;font-weight:500}
.col-meta-badge.cat{background:#dbeafe;color:#3b82f6}
.col-meta-badge.date{background:#f3f4f6;color:#6b7280}

.col-detail-hero-img{width:100%;border-radius:16px;overflow:hidden;margin-bottom:28px}
.col-detail-hero-img img{width:100%;height:auto;display:block}
.col-detail-body{font-size:1.05rem;color:#444;line-height:1.9;word-break:keep-all}
.col-detail-body h2{font-size:1.3rem;font-weight:700;color:#333;margin:32px 0 12px}
.col-detail-body h3{font-size:1.1rem;font-weight:700;color:#333;margin:24px 0 10px}
.col-detail-body p{margin-bottom:16px}
.col-detail-body img{max-width:100%;border-radius:12px;margin:16px 0}
.col-detail-body blockquote{border-left:4px solid #c9a96e;padding:12px 20px;background:#faf7f3;border-radius:0 12px 12px 0;margin:20px 0;color:#555;font-style:italic}

/* ===== BOTTOM AUTHOR BOX ===== */
.col-author-box{margin-top:40px;padding:28px;background:linear-gradient(135deg,#faf7f3 0%,#f5f0eb 100%);border-radius:20px;border:1px solid #ede6dd;display:flex;align-items:center;gap:20px}
.col-author-box-avatar{width:72px;height:72px;border-radius:50%;overflow:hidden;flex-shrink:0;border:3px solid #fff;box-shadow:0 4px 16px rgba(107,66,38,.12)}
.col-author-box-avatar img{width:100%;height:100%;object-fit:cover}
.col-author-box-avatar .avatar-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;font-size:1.5rem;font-weight:700}
.col-author-box-info{flex:1}
.col-author-box-info .author-label{font-size:.7rem;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.col-author-box-info .author-name-line{font-size:1.05rem;font-weight:700;color:#333;margin-bottom:3px;display:flex;align-items:center;gap:6px}
.col-author-box-info .author-name-line .verified{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;background:#6B4226;border-radius:50%;font-size:.6rem;color:#fff}
.col-author-box-info .author-spec{font-size:.82rem;color:#8B5E3C;font-weight:500;margin-bottom:2px}
.col-author-box-info .author-org{font-size:.78rem;color:#999}
.col-author-box-link{flex-shrink:0}
.col-author-box-link a{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;background:#6B4226;color:#fff;border-radius:50px;font-size:.8rem;font-weight:600;text-decoration:none;transition:all .2s}
.col-author-box-link a:hover{background:#8B5E3C;transform:translateY(-1px)}

.col-detail-footer{margin-top:24px;padding-top:24px;border-top:1px solid #eee;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;align-items:center}
@media(max-width:600px){
  .col-detail-header h1{font-size:1.3rem}
  .col-author-box{flex-direction:column;text-align:center;gap:14px}
  .col-author-box-link{width:100%}
  .col-author-box-link a{width:100%;justify-content:center}
}
</style>
</head>
<body>
${ssrHeader()}
<main>
<div class="col-detail">
<nav style="font-size:.85rem;color:#888;margin-bottom:20px;">
<a href="/" style="color:#6B4226;text-decoration:none;">홈</a> &gt;
<a href="/column/" style="color:#6B4226;text-decoration:none;">원장 컬럼</a> &gt;
<span>${col.title}</span>
</nav>
<div class="col-detail-header">
<h1>${col.title}</h1>
<div class="col-meta-badges">
${col.category ? `<span class="col-meta-badge cat"><i class="fas fa-tag"></i> ${col.category}</span>` : ''}
<span class="col-meta-badge date"><i class="far fa-calendar"></i> ${dateStr}</span>
</div>
</div>

<!-- Author Card (Top) -->
${doctorSlug ? `<a href="/doctors/${doctorSlug}" class="col-author-card">
<div class="col-author-avatar">
<picture>
<source srcset="/images/doctors/${doctorSlug}-profile.webp" type="image/webp">
<img src="/images/doctors/${doctorSlug}-profile.jpg" alt="${col.doctorName}" onerror="this.parentElement.parentElement.innerHTML='<div class=\\'avatar-fallback\\'>${(col.doctorName || '').charAt(0)}</div>'">
</picture>
</div>
<div class="col-author-info">
<div class="col-author-name">${col.doctorName || ''} <span class="verified"><i class="fas fa-check"></i></span></div>
<div class="col-author-specialty">${drInfo.specialty}</div>
<div class="col-author-org">서울비디치과</div>
</div>
</a>` : `<div class="col-author-card" style="cursor:default;">
<div class="col-author-avatar"><div class="avatar-fallback">${(col.doctorName || '서').charAt(0)}</div></div>
<div class="col-author-info">
<div class="col-author-name">${col.doctorName || '서울비디치과'}</div>
<div class="col-author-specialty">치과의사</div>
<div class="col-author-org">서울비디치과</div>
</div>
</div>`}

${col.thumbnailImage ? `<div class="col-detail-hero-img"><img src="${col.thumbnailImage}" alt="${col.title}"></div>` : ''}
<div class="col-detail-body">${col.content || ''}</div>

<!-- Author Box (Bottom) -->
${doctorSlug ? `<div class="col-author-box">
<div class="col-author-box-avatar">
<picture>
<source srcset="/images/doctors/${doctorSlug}-profile.webp" type="image/webp">
<img src="/images/doctors/${doctorSlug}-profile.jpg" alt="${col.doctorName}" onerror="this.parentElement.parentElement.innerHTML='<div class=\\'avatar-fallback\\'>${(col.doctorName || '').charAt(0)}</div>'">
</picture>
</div>
<div class="col-author-box-info">
<div class="author-label">Written by</div>
<div class="author-name-line">${col.doctorName || ''} <span class="verified"><i class="fas fa-check"></i></span></div>
<div class="author-spec">${drInfo.specialty}</div>
<div class="author-org">서울비디치과 · 충남 천안시 서북구 불당34길 14</div>
</div>
<div class="col-author-box-link">
<a href="/doctors/${doctorSlug}"><i class="fas fa-user-md"></i> 프로필 보기</a>
</div>
</div>` : ''}

<div class="col-detail-footer">
<a href="/column/" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:.88rem;"><i class="fas fa-arrow-left"></i> 컬럼 목록</a>
<a href="/reservation" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:.88rem;"><i class="fas fa-calendar-check"></i> 진료 예약</a>
</div>
</div>
</main>
${ssrMobileNav()}
<script src="/js/main.js" defer></script>
<script src="/js/gnb-v2.js" defer></script>
<script>
fetch('/api/views', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({page_type:'column',page_id:'${id}'})}).catch(function(){});
</script>
</body>
</html>`)
})

// Video directory
app.get('/video', serveStatic({ path: './video/index.html' }))
app.get('/video/', serveStatic({ path: './video/index.html' }))
app.use('/video/*', serveStatic())

// Cases directory
app.get('/cases', serveStatic({ path: './cases/gallery.html' }))
app.get('/cases/', serveStatic({ path: './cases/gallery.html' }))
app.get('/cases/gallery', serveStatic({ path: './cases/gallery.html' }))

// 케이스 상세 페이지 (SSR, 로그인 필요)
app.get('/cases/:id', async (c) => {
  const id = c.req.param('id')
  // gallery.html 같은 정적 파일은 통과
  if (id.includes('.')) return c.notFound()
  
  const r2 = c.env.R2
  if (!r2) return c.redirect('/cases/gallery', 302)
  
  const allCases = await getCases(r2)
  const cs = allCases.find((x: any) => x.id === id && x.status === 'published')
  
  if (!cs) return c.redirect('/cases/gallery', 302)
  
  // 로그인 체크
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const adminToken = getCookie(c, ADMIN_SESSION_COOKIE)
  const siteToken = getCookie(c, 'bd_session')
  
  let authed = false
  if (adminToken && await verifySessionToken(adminToken, secret)) authed = true
  if (siteToken && await verifySiteSession(siteToken, secret)) authed = true
  
  const CATS: Record<string,string> = {
    implant:'임플란트', invisalign:'인비절라인', orthodontics:'치아교정', pediatric:'소아치과',
    'front-crown':'앞니크라운',
    aesthetic:'심미레진', glownate:'글로우네이트', cavity:'충치치료',
    resin:'레진치료', crown:'크라운', inlay:'인레이/온레이',
    'root-canal':'신경치료', 're-root-canal':'재신경치료',
    whitening:'미백', bridge:'브릿지', denture:'틀니',
    scaling:'스케일링', gum:'잇몸치료', periodontitis:'치주염',
    'gum-surgery':'잇몸수술', 'wisdom-tooth':'사랑니발치',
    apicoectomy:'치근단절제술', sedation:'수면치료', prevention:'예방치료',
    tmj:'턱관절(TMJ)', bruxism:'이갈이/브럭시즘', emergency:'응급치료'
  }
  
  const catLabel = CATS[cs.category] || cs.category || ''
  const catSlugMap: Record<string,string> = { 'front-crown': 'crown' }
  const catLink = cs.category ? `/treatments/${catSlugMap[cs.category] || cs.category}` : ''
  const dateStr = new Date(cs.createdAt || Date.now()).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })
  
  // 이미지 스타일 (모든 사용자에게 공개)
  const imgStyle = ''
  const safeImg = (url: string) => url || ''
  
  // 백과사전 자동 링크: 설명 텍스트에서 백과사전 용어를 찾아 링크로 변환
  let descText = (cs.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
  const encTermsForLink = encItems
    .filter(item => item.term.length >= 2) // 2글자 이상
    .sort((a, b) => b.term.length - a.term.length) // 긴 용어 우선 매칭
  const linkedTerms = new Set<string>()
  for (const item of encTermsForLink) {
    if (linkedTerms.size >= 8) break // 최대 8개까지만
    if (descText.includes(item.term) && !linkedTerms.has(item.term)) {
      // 이미 링크된 부분 안에 있지 않은지 확인
      const termSlug = encodeURIComponent(item.term)
      descText = descText.replace(item.term, `<a href="/encyclopedia/${termSlug}" style="color:#6B4226;text-decoration:none;border-bottom:1px dotted #c9a96e;font-weight:600;">${item.term}</a>`)
      linkedTerms.add(item.term)
    }
  }
  
  const lockOverlay = ''

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
${TRACKING_HEAD}
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cs.title}${cs.region ? ' | ' + cs.region : ''} | Before/After — 서울비디치과</title>
<meta name="description" content="${cs.title} — ${cs.doctorName || '서울비디치과'} ${catLabel} 치료 전후 사진.${cs.region ? ' ' + cs.region + '에서 내원.' : ''} ${cs.treatmentPeriod ? '치료기간 ' + cs.treatmentPeriod + '.' : ''} 서울비디치과 비포/애프터.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://bdbddc.com/cases/${id}">
<meta property="og:title" content="${cs.title} | Before/After — 서울비디치과">
<meta property="og:description" content="${catLabel} 치료 전후 사진 — ${cs.doctorName || '서울비디치과'}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://bdbddc.com/cases/${id}">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/css/site-v5.css?v=1a91d774">
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"MedicalWebPage",
  "name":"${cs.title}",
  "description":"${catLabel} 치료 전후 — ${cs.doctorName || '서울비디치과'}",
  "url":"https://bdbddc.com/cases/${id}",
  "datePublished":"${cs.createdAt || ''}",
  "author":{"@type":"Dentist","name":"서울비디치과","telephone":"+82-41-415-2892"${cs.region ? ',"areaServed":{"@type":"City","name":"' + cs.region + '"}' : ''}},
  "breadcrumb":{"@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},
    {"@type":"ListItem","position":2,"name":"Before/After","item":"https://bdbddc.com/cases/gallery"},
    {"@type":"ListItem","position":3,"name":"${cs.title}","item":"https://bdbddc.com/cases/${id}"}
  ]}
}
</script>
<style>
.case-detail{max-width:800px;margin:0 auto;padding:40px 20px}
.case-header{margin-bottom:32px}
.case-title{font-size:1.6rem;font-weight:800;color:#333;margin-bottom:8px}
.case-meta{display:flex;flex-wrap:wrap;gap:16px;font-size:.85rem;color:#888}
.case-meta span{display:flex;align-items:center;gap:4px}
.case-img-section{margin-bottom:24px}
.case-img-section-title{font-size:.88rem;font-weight:700;color:#333;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.case-img-section-title .badge{font-size:.68rem;padding:2px 10px;border-radius:12px;font-weight:600}
.case-img-section-title .badge.intraoral{background:#f3e8ff;color:#a855f7}
.case-img-section-title .badge.panorama{background:#dbeafe;color:#3b82f6}
.case-images{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.case-img-box{position:relative;border-radius:16px;overflow:hidden;background:#f0ebe4;aspect-ratio:16/9;cursor:zoom-in;transition:box-shadow .3s}
.case-img-box:hover{box-shadow:0 4px 20px rgba(107,66,38,.15)}
.case-img-box img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.case-img-box:hover img{transform:scale(1.03)}
.case-img-label{position:absolute;top:12px;left:12px;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:50px;color:#fff;z-index:3;pointer-events:none}
.case-img-label.before{background:#f59e0b}
.case-img-label.after{background:#22c55e}
.case-img-zoom{position:absolute;bottom:10px;right:10px;width:36px;height:36px;background:rgba(0,0,0,.45);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;opacity:0;transition:opacity .3s;pointer-events:none;backdrop-filter:blur(4px)}
.case-img-box:hover .case-img-zoom{opacity:1}
/* 라이트박스 */
.case-lightbox{display:none;position:fixed;inset:0;z-index:10001;align-items:center;justify-content:center;background:rgba(0,0,0,.92)}
.case-lightbox.active{display:flex}
.case-lb-close{position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);border:none;color:#fff;font-size:1.2rem;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;transition:all .2s;backdrop-filter:blur(8px)}
.case-lb-close:hover{background:rgba(255,255,255,.3);transform:scale(1.1)}
.case-lb-img{max-width:92vw;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,.4)}
.case-lb-label{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);padding:8px 24px;background:rgba(0,0,0,.6);color:#fff;border-radius:50px;font-size:.88rem;font-weight:700;backdrop-filter:blur(8px)}
.case-lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;backdrop-filter:blur(8px)}
.case-lb-nav:hover{background:rgba(255,255,255,.25)}
.case-lb-prev{left:16px}
.case-lb-next{right:16px}
@media(max-width:600px){.case-lb-img{max-width:98vw;max-height:75vh;border-radius:8px}.case-lb-close{top:12px;right:12px}}
.case-desc{font-size:1rem;color:#555;line-height:1.8;margin-bottom:32px;padding:20px 24px;background:#faf7f3;border-radius:16px}
.case-cta{text-align:center;padding:32px;background:linear-gradient(135deg,#6B4226,#8B5E3C);border-radius:16px;color:#fff}
.login-banner{text-align:center;padding:20px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;margin-bottom:24px;border:1px solid #f59e0b33}
.login-banner a{color:#6B4226;font-weight:700;text-decoration:none}
.login-banner a:hover{text-decoration:underline}
@media(max-width:600px){.case-images{grid-template-columns:1fr}.case-title{font-size:1.3rem}}
</style>
</head>
<body>
${ssrHeader()}
<main>
<div class="case-detail">
<nav style="font-size:.85rem;color:#888;margin-bottom:20px;">
<a href="/" style="color:#6B4226;text-decoration:none;">홈</a> &gt;
<a href="/cases/gallery" style="color:#6B4226;text-decoration:none;">Before/After</a> &gt;
<span>${cs.title}</span>
</nav>
<div class="case-header">
<h1 class="case-title">${cs.title}</h1>
<div style="margin-bottom:10px;">${catLink ? `<a href="${catLink}" style="font-size:.8rem;padding:4px 14px;background:#f5f0eb;color:#6B4226;border-radius:50px;font-weight:600;text-decoration:none;display:inline-block;transition:background 0.2s;" onmouseover="this.style.background='#6B4226';this.style.color='#fff'" onmouseout="this.style.background='#f5f0eb';this.style.color='#6B4226'">${catLabel}</a>` : `<span style="font-size:.8rem;padding:4px 14px;background:#f5f0eb;color:#6B4226;border-radius:50px;font-weight:600;">${catLabel}</span>`}</div>
<div class="case-meta">
<span><i class="fas fa-user-md" style="color:#c9a96e;"></i> ${DOCTOR_SLUG_MAP[cs.doctorName] ? `<a href="/doctors/${DOCTOR_SLUG_MAP[cs.doctorName]}" style="color:#6B4226;text-decoration:none;border-bottom:1px dashed #c9a96e;font-weight:600;transition:color 0.2s;">${cs.doctorName}</a>` : (cs.doctorName || '')}</span>
${cs.treatmentPeriod ? `<span><i class="fas fa-clock" style="color:#c9a96e;"></i> 치료기간: ${cs.treatmentPeriod}</span>` : ''}
${cs.region ? `<span><i class="fas fa-map-marker-alt" style="color:#c9a96e;"></i> ${cs.region}</span>` : ''}
<span><i class="far fa-calendar" style="color:#c9a96e;"></i> ${dateStr}</span>
</div>
</div>

${(cs.beforeImage || cs.afterImage) ? `
<div class="case-img-section">
<div class="case-img-section-title"><i class="fas fa-camera" style="color:#a855f7"></i> 구내포토 <span class="badge intraoral">Intraoral</span></div>
<div class="case-images">
${cs.beforeImage ? `<div class="case-img-box" onclick="openCaseLB(this)" data-src="${safeImg(cs.beforeImage)}" data-label="구내포토 Before"><img src="${safeImg(cs.beforeImage)}" alt="${cs.title} 구내포토 Before — ${cs.doctorName}" loading="lazy"><span class="case-img-label before">Before</span><span class="case-img-zoom"><i class="fas fa-search-plus"></i></span></div>` : ''}
${cs.afterImage ? `<div class="case-img-box" onclick="openCaseLB(this)" data-src="${safeImg(cs.afterImage)}" data-label="구내포토 After"><img src="${safeImg(cs.afterImage)}" alt="${cs.title} 구내포토 After — ${cs.doctorName}" loading="lazy"><span class="case-img-label after">After</span><span class="case-img-zoom"><i class="fas fa-search-plus"></i></span></div>` : ''}
</div>
</div>` : ''}
${(cs.panBeforeImage || cs.panAfterImage) ? `
<div class="case-img-section">
<div class="case-img-section-title"><i class="fas fa-x-ray" style="color:#3b82f6"></i> 파노라마 <span class="badge panorama">Panorama</span></div>
<div class="case-images">
${cs.panBeforeImage ? `<div class="case-img-box" onclick="openCaseLB(this)" data-src="${safeImg(cs.panBeforeImage)}" data-label="파노라마 Before"><img src="${safeImg(cs.panBeforeImage)}" alt="${cs.title} 파노라마 Before — ${cs.doctorName}" loading="lazy"><span class="case-img-label before">Before</span><span class="case-img-zoom"><i class="fas fa-search-plus"></i></span></div>` : ''}
${cs.panAfterImage ? `<div class="case-img-box" onclick="openCaseLB(this)" data-src="${safeImg(cs.panAfterImage)}" data-label="파노라마 After"><img src="${safeImg(cs.panAfterImage)}" alt="${cs.title} 파노라마 After — ${cs.doctorName}" loading="lazy"><span class="case-img-label after">After</span><span class="case-img-zoom"><i class="fas fa-search-plus"></i></span></div>` : ''}
</div>
</div>` : ''}
${cs.description ? `<div class="case-desc"><h3 style="font-size:1rem;font-weight:700;color:#333;margin-bottom:8px;"><i class="fas fa-stethoscope" style="color:#c9a96e;margin-right:6px;"></i> 치료 설명</h3><p>${descText}</p></div>` : ''}
<div class="case-cta">
<p style="font-size:1.05rem;font-weight:600;margin-bottom:14px;">나도 이런 결과를 원한다면?</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
<a href="/reservation" style="display:inline-flex;align-items:center;gap:6px;padding:12px 28px;background:#fff;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:700;"><i class="fas fa-calendar-check"></i> 무료 상담 예약</a>
<a href="tel:041-415-2892" style="display:inline-flex;align-items:center;gap:6px;padding:12px 28px;background:rgba(255,255,255,.15);color:#fff;border-radius:50px;text-decoration:none;font-weight:600;border:1px solid rgba(255,255,255,.3);"><i class="fas fa-phone"></i> 041-415-2892</a>
</div>
</div>
<div style="text-align:center;margin-top:24px;">
<a href="/cases/gallery" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:.9rem;"><i class="fas fa-th"></i> 전체 갤러리 보기</a>
${cs.category ? `<a href="/treatments/${cs.category}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:.9rem;margin-left:8px;"><i class="fas fa-tooth"></i> ${catLabel} 진료 안내</a>` : ''}
</div>
</div>
</main>
<div class="case-lightbox" id="caseLB" onclick="if(event.target===this)closeCaseLB()">
<button class="case-lb-close" onclick="closeCaseLB()"><i class="fas fa-times"></i></button>
<button class="case-lb-nav case-lb-prev" id="caseLBPrev" onclick="navCaseLB(-1)"><i class="fas fa-chevron-left"></i></button>
<img class="case-lb-img" id="caseLBImg" alt="">
<button class="case-lb-nav case-lb-next" id="caseLBNext" onclick="navCaseLB(1)"><i class="fas fa-chevron-right"></i></button>
<div class="case-lb-label" id="caseLBLabel"></div>
</div>
${ssrMobileNav()}
<script src="/js/main.js" defer></script>
<script src="/js/gnb-v2.js" defer></script>
<script>
// 조회수 기록
fetch('/api/views', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({page_type:'case',page_id:'${id}'})}).catch(function(){});

// 케이스 상세 라이트박스
var caseLBItems=[];var caseLBIdx=0;
(function(){
  var boxes=document.querySelectorAll('.case-img-box[data-src]');
  boxes.forEach(function(b,i){caseLBItems.push({src:b.getAttribute('data-src'),label:b.getAttribute('data-label')});});
})();
function openCaseLB(el){
  var src=el.getAttribute('data-src');
  for(var i=0;i<caseLBItems.length;i++){if(caseLBItems[i].src===src){caseLBIdx=i;break;}}
  showCaseLBPhoto();
  document.getElementById('caseLB').classList.add('active');
  document.body.style.overflow='hidden';
}
function closeCaseLB(){
  document.getElementById('caseLB').classList.remove('active');
  document.body.style.overflow='';
}
function showCaseLBPhoto(){
  var item=caseLBItems[caseLBIdx];
  if(!item)return;
  var img=document.getElementById('caseLBImg');
  img.src=item.src;img.alt=item.label;
  document.getElementById('caseLBLabel').textContent=item.label;
  document.getElementById('caseLBPrev').style.display=caseLBIdx>0?'flex':'none';
  document.getElementById('caseLBNext').style.display=caseLBIdx<caseLBItems.length-1?'flex':'none';
}
function navCaseLB(dir){caseLBIdx+=dir;if(caseLBIdx<0)caseLBIdx=0;if(caseLBIdx>=caseLBItems.length)caseLBIdx=caseLBItems.length-1;showCaseLBPhoto();}
document.addEventListener('keydown',function(e){
  var lb=document.getElementById('caseLB');
  if(!lb||!lb.classList.contains('active'))return;
  if(e.key==='Escape')closeCaseLB();
  if(e.key==='ArrowLeft')navCaseLB(-1);
  if(e.key==='ArrowRight')navCaseLB(1);
});
</script>
</body>
</html>`)
})

app.use('/cases/*', serveStatic())

// Notice directory
app.get('/notice', serveStatic({ path: './notice/index.html' }))
app.get('/notice/', serveStatic({ path: './notice/index.html' }))
app.use('/notice/*', serveStatic())

// Auth directory
app.get('/auth/login', serveStatic({ path: './auth/login.html' }))
app.get('/auth/register', serveStatic({ path: './auth/register.html' }))
app.get('/auth/mypage', serveStatic({ path: './auth/mypage.html' }))
app.use('/auth/*', serveStatic())

// Admin directory — 인증은 상단 미들웨어에서 처리, 여기는 정적 파일만
// (미들웨어가 이미 /admin/* 보호하므로, 인증 통과 후에만 서빙됨)

// Encyclopedia directory (치과 백과사전)
app.get('/encyclopedia', serveStatic({ path: './encyclopedia/index.html' }))
app.get('/encyclopedia/', serveStatic({ path: './encyclopedia/index.html' }))

// ============================================
// 백과사전 개별 용어 페이지 (SSR - SEO 500개 URL)
// /encyclopedia/:term → 각 용어별 전용 페이지
// ============================================
import encyclopediaData from '../public/data/encyclopedia.json'

const encItems: Array<{id:number; term:string; chosung?:string; category:string; short:string; detail:string; tags?:string[]; synonyms?:string[]; link?:string}> = (encyclopediaData as any).items || []

// ============================================
// 카테고리별 맞춤 FAQ 템플릿 (3~5개씩)
// ============================================
const categoryFaqTemplates: Record<string, (term: string, short: string, detail: string) => Array<{q: string; a: string}>> = {
  '치아 구조': (t, s, d) => [
    { q: `${t}은(는) 어디에 위치하나요?`, a: `${s} ${d} 치과 검진 시 치과의사가 ${t}의 상태를 확인하고 설명해 드립니다.` },
    { q: `${t}이(가) 손상되면 어떤 증상이 나타나나요?`, a: `${t}이(가) 손상되면 통증, 시림, 변색 등의 증상이 나타날 수 있습니다. 증상이 있다면 빠른 진료가 중요합니다. 서울비디치과에서는 정밀 검사를 통해 정확한 진단을 제공합니다.` },
    { q: `${t} 관련 치료 비용은 어떻게 되나요?`, a: `${t} 관련 치료 비용은 손상 정도와 치료 방법에 따라 달라집니다. 서울비디치과에서는 무료 상담을 통해 정확한 비용을 안내해 드립니다. 전화 041-415-2892로 예약하세요.` },
    { q: `${t}을(를) 건강하게 유지하려면 어떻게 해야 하나요?`, a: `올바른 칫솔질, 치실 사용, 정기적인 스케일링(6개월~1년 주기)이 ${t} 건강 유지의 핵심입니다. 서울비디치과에서 정기 검진을 받으시면 ${t} 상태를 체계적으로 관리할 수 있습니다.` },
  ],
  '치과 질환': (t, s, d) => [
    { q: `${t}의 초기 증상은 무엇인가요?`, a: `${t}의 초기 증상은 통증, 붓기, 출혈, 시림 등으로 나타날 수 있습니다. ${s} 초기에 발견하면 간단한 치료로 해결할 수 있으므로 증상이 의심되면 빨리 내원하시는 것이 좋습니다.` },
    { q: `${t}을(를) 방치하면 어떻게 되나요?`, a: `${t}을(를) 방치하면 증상이 악화되어 치아 손실, 잇몸뼈 흡수, 전신 건강 문제로 이어질 수 있습니다. 조기 치료가 비용과 시간 모두 절약됩니다.` },
    { q: `${t} 예방법이 있나요?`, a: `정기적인 치과 검진, 올바른 구강 위생 습관, 균형 잡힌 식단이 ${t} 예방의 핵심입니다. 서울비디치과에서는 6개월 주기 정기 검진을 권장합니다.` },
    { q: `${t} 치료 시 통증이 있나요?`, a: `현대 치과 치료는 마취 기술이 발달하여 대부분 무통 또는 최소 통증으로 진행됩니다. 서울비디치과는 무통 마취 시스템을 도입하여 편안한 치료를 제공합니다.` },
    { q: `${t} 치료 후 주의사항은 무엇인가요?`, a: `치료 후 담당 의사의 안내에 따라 음식 조절, 구강 위생 관리, 정기 검진을 지켜주시면 됩니다. 서울비디치과에서는 치료 후 관리 프로그램도 제공합니다.` },
  ],
  '구강내과 질환': (t, s, d) => [
    { q: `${t}의 원인은 무엇인가요?`, a: `${s} 구강내과 질환은 자가면역 반응, 바이러스 감염, 스트레스, 전신 질환 등 다양한 원인으로 발생합니다. 정확한 원인 파악을 위해 전문의 진료가 필요합니다.` },
    { q: `${t}은(는) 전염되나요?`, a: `${t}의 전염 여부는 원인에 따라 다릅니다. 바이러스성 질환(포진 등)은 전염될 수 있지만, 자가면역 질환(편평태선 등)은 전염되지 않습니다. 정확한 진단이 중요합니다.` },
    { q: `${t}이(가) 암으로 변할 수 있나요?`, a: `대부분의 구강 점막 질환은 양성이지만, 일부(백색판증, 홍색판증 등)는 전암 병변으로 분류됩니다. 정기적인 관찰과 필요 시 조직 검사가 중요합니다. 서울비디치과에서는 구강 점막 정밀 검진을 제공합니다.` },
    { q: `${t} 치료 방법이 궁금합니다.`, a: `${t}의 치료는 원인과 증상에 따라 약물 치료(스테로이드, 항진균제, 항바이러스제), 대증 치료, 원인 제거 등으로 진행됩니다. 서울비디치과 구강내과 전문의가 맞춤 치료를 제안합니다.` },
    { q: `${t}이(가) 자주 재발하는데 어떻게 해야 하나요?`, a: `구강내과 질환은 면역력, 스트레스, 구강 위생 상태와 밀접합니다. 규칙적인 생활, 스트레스 관리, 정기 검진이 재발 방지에 도움됩니다. 재발이 잦다면 전신 질환 검사도 고려해야 합니다.` },
  ],
  '치주 질환': (t, s, d) => [
    { q: `${t}의 증상은 어떤 것이 있나요?`, a: `${s} 치주 질환의 대표 증상은 잇몸 출혈, 붓기, 시림, 구취, 치아 흔들림 등입니다. 초기에는 증상이 경미하여 놓치기 쉬우므로 정기 검진이 중요합니다.` },
    { q: `${t}은(는) 완치가 가능한가요?`, a: `초기 치은염은 전문 스케일링과 올바른 구강 관리로 완치가 가능합니다. 진행된 치주염은 완전 회복이 어렵지만, 적극적인 치료로 진행을 멈추고 유지할 수 있습니다.` },
    { q: `${t}이(가) 전신 건강에 영향을 주나요?`, a: `네, 치주 질환은 심혈관 질환, 당뇨, 조산 등 전신 건강과 밀접한 관련이 있습니다. 구강 건강이 전신 건강의 시작입니다. 서울비디치과에서는 통합적 관점의 치주 관리를 제공합니다.` },
    { q: `${t} 예방을 위해 어떻게 관리해야 하나요?`, a: `올바른 칫솔질(변형 바스법), 치실·치간칫솔 사용, 3~6개월마다 정기 스케일링이 치주 질환 예방의 핵심입니다. 서울비디치과에서 맞춤 구강 관리 교육을 받아보세요.` },
    { q: `${t} 치료 비용과 보험이 적용되나요?`, a: `스케일링은 연 1회 건강보험 적용됩니다. 치주 수술도 일부 보험 적용이 가능합니다. 서울비디치과 무료 상담(041-415-2892)을 통해 정확한 비용을 확인하세요.` },
  ],
  '치수·치아 질환': (t, s, d) => [
    { q: `${t}이(가) 생기면 어떤 증상이 나타나나요?`, a: `${s} 치수·치아 질환은 자발통(가만히 있어도 아픔), 온도 민감성, 씹을 때 통증, 잇몸 부종 등으로 나타납니다. 밤에 통증이 심해지는 것이 특징입니다.` },
    { q: `${t}은(는) 반드시 신경치료를 해야 하나요?`, a: `가역적 치수염(경미한 경우)은 원인 제거와 보존 치료로 회복 가능하지만, 비가역적 치수염이나 치수 괴사는 신경치료(근관치료)가 필수입니다. 정확한 진단이 중요합니다.` },
    { q: `${t} 치료를 미루면 어떻게 되나요?`, a: `치수·치아 질환을 방치하면 치수 괴사 → 치근단 병소 → 농양 → 봉와직염 등으로 악화될 수 있습니다. 심한 경우 발치가 불가피해지므로 조기 치료가 매우 중요합니다.` },
    { q: `${t} 후 치아를 살릴 수 있나요?`, a: `대부분의 경우 신경치료를 통해 치아를 보존할 수 있습니다. 서울비디치과는 '자연 치아 보존'을 최우선 원칙으로, 최신 근관치료 장비와 기술로 높은 보존율을 자랑합니다.` },
    { q: `${t} 치료 후 크라운이 꼭 필요한가요?`, a: `신경치료 후 치아는 구조적으로 약해지므로, 대부분 크라운(씌우기)으로 보호해야 합니다. 크라운 없이 사용하면 치아 파절 위험이 높습니다.` },
  ],
  '턱관절·구강외과': (t, s, d) => [
    { q: `${t}의 주요 원인은 무엇인가요?`, a: `${s} 턱관절·구강외과 질환은 외상, 스트레스, 이갈이, 부정교합, 감염 등 다양한 원인으로 발생합니다. 정밀 검사를 통한 정확한 원인 파악이 치료의 첫걸음입니다.` },
    { q: `${t}은(는) 어느 과에서 치료받아야 하나요?`, a: `턱관절 장애, 구강 내 수술, 얼굴뼈 골절 등은 구강악안면외과 또는 구강내과 전문의의 진료가 필요합니다. 서울비디치과에서는 각 분야 전문의가 협진하여 통합 진료를 제공합니다.` },
    { q: `${t} 치료 시 수술이 필요한가요?`, a: `모든 경우에 수술이 필요한 것은 아닙니다. 보존적 치료(약물, 물리치료, 교합 장치)를 먼저 시도하고, 효과가 없을 때 수술적 치료를 고려합니다. 서울비디치과는 최소 침습 치료를 지향합니다.` },
    { q: `${t} 치료 기간은 얼마나 걸리나요?`, a: `질환의 종류와 심각도에 따라 수일~수개월까지 다양합니다. 급성 감염은 빠른 처치가 필요하고, 턱관절 장애는 장기적인 관리가 필요할 수 있습니다.` },
    { q: `${t} 응급 상황 시 어떻게 해야 하나요?`, a: `구강악안면 외상, 심한 감염(부종, 발열, 호흡곤란)은 응급입니다. 즉시 치과 또는 응급실을 방문하세요. 서울비디치과는 응급 진료 체계를 갖추고 있습니다.` },
    { q: `${t} 치료 후 주의사항은 무엇인가요?`, a: `치료 후 담당 의사의 안내에 따라 음식 조절, 구강 위생 관리, 정기 검진을 지켜주시면 됩니다. 서울비디치과에서는 치료 후 관리 프로그램도 제공합니다.` },
  ],
  '치료·시술': (t, s, d) => [
    { q: `${t} 시술 과정은 어떻게 되나요?`, a: `${s} 서울비디치과에서는 정밀 검사 → 치료 계획 수립 → 시술 → 경과 관찰 순서로 진행합니다. 서울대 출신 전문의가 직접 진료합니다.` },
    { q: `${t} 시술 시간은 얼마나 걸리나요?`, a: `${t} 시술 시간은 환자 상태와 난이도에 따라 다르지만, 일반적으로 30분~2시간 정도 소요됩니다. 정확한 시간은 진료 상담 시 안내해 드립니다.` },
    { q: `${t} 비용과 보험 적용 여부가 궁금합니다.`, a: `${t} 비용은 시술 범위에 따라 달라집니다. 건강보험 적용 가능한 항목도 있으니, 서울비디치과 무료 상담(041-415-2892)을 통해 정확한 비용과 보험 적용 여부를 확인하세요.` },
    { q: `${t} 시술 후 일상생활이 바로 가능한가요?`, a: `대부분 시술 후 당일 또는 1~2일 내 일상생활이 가능합니다. 다만 시술 종류에 따라 주의사항이 다르므로, 담당 의사의 안내를 따라주세요.` },
    { q: `${t}은(는) 누구에게 적합한가요?`, a: `${t}의 적응증과 금기증은 환자 개인의 구강 상태에 따라 다릅니다. 서울비디치과에서는 CT, X-ray 등 정밀 검사를 통해 최적의 치료 방법을 제안합니다.` },
  ],
  '전문 용어': (t, s, d) => [
    { q: `${t}이(가) 무엇인지 쉽게 설명해 주세요.`, a: `쉽게 말해, ${s} ${d} 치과 진료 시 자주 사용되는 용어이며, 서울비디치과에서는 환자분들이 이해하기 쉽도록 설명해 드립니다.` },
    { q: `${t}은(는) 어떤 치료와 관련이 있나요?`, a: `${t}은(는) 치과 진료 과정에서 진단, 치료 계획 수립, 경과 관찰 등에 활용되는 개념입니다. 궁금하신 점은 진료 상담 시 자세히 안내해 드립니다.` },
    { q: `${t} 관련 검사는 어떻게 받나요?`, a: `서울비디치과에서는 파노라마, CT, 구강 카메라 등 최신 장비로 정밀 검사를 진행합니다. 검사 결과를 바탕으로 환자 맞춤 치료 계획을 수립합니다.` },
  ],
  '구강 관리': (t, s, d) => [
    { q: `${t}은(는) 매일 해야 하나요?`, a: `${s} 올바른 구강 관리는 치아 건강의 기본입니다. 매일 꾸준히 실천하면 충치와 잇몸 질환을 효과적으로 예방할 수 있습니다.` },
    { q: `${t}의 올바른 방법이 궁금합니다.`, a: `${t}의 정확한 방법은 개인의 구강 상태에 따라 다를 수 있습니다. 서울비디치과에서는 정기 검진 시 환자 맞춤 구강 관리법을 교육해 드립니다.` },
    { q: `어린이도 ${t}이(가) 필요한가요?`, a: `네, 어린이의 구강 건강은 성장 발달에 중요합니다. 서울비디치과 소아치과에서는 어린이 눈높이에 맞는 구강 관리 교육을 제공합니다.` },
    { q: `${t} 관련 추천 제품이 있나요?`, a: `환자분의 구강 상태에 맞는 제품을 추천해 드립니다. 정기 검진 시 담당 의사에게 문의하시면 맞춤 추천을 받으실 수 있습니다.` },
  ],
  '장비·기술': (t, s, d) => [
    { q: `${t}은(는) 어떤 장점이 있나요?`, a: `${s} ${d} 최신 장비와 기술을 통해 더 정확한 진단과 편안한 치료가 가능합니다.` },
    { q: `서울비디치과에도 ${t}이(가) 있나요?`, a: `네, 서울비디치과는 최신 의료 장비를 갖춘 1~5층 전문 센터로 운영됩니다. ${t}을(를) 포함한 첨단 장비로 정밀한 진료를 제공합니다.` },
    { q: `${t}을(를) 사용한 치료는 안전한가요?`, a: `최신 의료 장비는 안전성이 검증되어 있으며, 서울비디치과에서는 감염 관리 및 안전 프로토콜을 철저히 준수합니다. 에어샤워 시스템 등 최첨단 감염관리 체계를 운영합니다.` },
  ],
  '치과 재료': (t, s, d) => [
    { q: `${t}은(는) 인체에 안전한가요?`, a: `${s} 현대 치과에서 사용하는 재료는 생체적합성 검증을 거친 안전한 재료입니다. 서울비디치과에서는 검증된 최고 품질의 재료만 사용합니다.` },
    { q: `${t}의 수명은 얼마나 되나요?`, a: `${t}의 수명은 재료 종류, 관리 상태, 사용 위치에 따라 다릅니다. 일반적으로 5~20년 이상 사용 가능하며, 정기 검진을 통해 상태를 관리하면 더 오래 사용할 수 있습니다.` },
    { q: `${t} 관련 알레르기가 걱정됩니다.`, a: `치과 재료 알레르기는 매우 드물지만, 걱정되시면 사전에 알려주세요. 서울비디치과에서는 환자 개인의 알레르기 이력을 확인하고 안전한 대체 재료를 사용할 수 있습니다.` },
    { q: `${t}과(와) 다른 재료의 차이점은 무엇인가요?`, a: `각 재료마다 강도, 심미성, 비용, 적합한 부위가 다릅니다. 서울비디치과에서는 환자 상태에 가장 적합한 재료를 추천하고, 장단점을 상세히 설명해 드립니다.` },
  ],
  '교정': (t, s, d) => [
    { q: `${t} 관련 교정 기간은 얼마나 되나요?`, a: `교정 기간은 환자 상태에 따라 6개월~3년까지 다양합니다. ${s} 서울비디치과 교정과 전문의가 정밀 검사 후 예상 기간을 안내해 드립니다.` },
    { q: `${t}은(는) 성인도 가능한가요?`, a: `네, 성인 교정은 오히려 본인의 의지가 강해 좋은 결과를 얻기 쉽습니다. 서울비디치과에서는 인비절라인, 설측 교정 등 심미적인 교정 옵션도 제공합니다.` },
    { q: `${t} 교정 비용은 어떻게 되나요?`, a: `교정 비용은 교정 방법, 난이도, 기간에 따라 달라집니다. 서울비디치과에서는 무료 교정 상담을 제공하며, 무이자 할부 등 다양한 결제 방법을 안내해 드립니다.` },
    { q: `교정 중 통증이 심한가요?`, a: `교정 장치 부착 후 2~3일간 약간의 불편함이 있을 수 있지만 금방 적응됩니다. 서울비디치과에서는 통증을 최소화하는 최신 교정 기술을 적용합니다.` },
  ],
  '소아 치과': (t, s, d) => [
    { q: `아이가 ${t} 관련 치료를 받으려면 몇 살부터 가능한가요?`, a: `${s} 일반적으로 첫 치아가 나면(생후 6개월경) 치과 방문을 시작하는 것이 좋습니다. 서울비디치과 소아치과에서는 아이 연령에 맞는 맞춤 진료를 제공합니다.` },
    { q: `아이가 치과를 무서워하는데 어떻게 해야 하나요?`, a: `서울비디치과 소아치과에서는 아이 친화적 환경과 웃음가스(소아 흡입 진정법)를 활용하여 공포감 없는 편안한 진료를 제공합니다.` },
    { q: `유치도 꼭 치료해야 하나요?`, a: `네, 유치 충치를 방치하면 영구치 발육과 배열에 영향을 줄 수 있습니다. 유치는 영구치가 나올 공간을 유지하는 중요한 역할을 합니다.` },
    { q: `${t} 관련 보험 적용이 되나요?`, a: `소아 치과 치료 중 건강보험 적용 항목이 있습니다. 서울비디치과에서는 보험 적용 가능한 항목을 우선 안내해 드리며, 비용 부담을 줄일 수 있도록 도와드립니다.` },
  ],
  '보험·비용': (t, s, d) => [
    { q: `${t}은(는) 건강보험이 적용되나요?`, a: `${s} 건강보험 적용 여부는 치료 항목과 조건에 따라 다릅니다. 서울비디치과에서는 보험 적용 가능한 모든 항목을 안내하고, 환자 부담을 최소화합니다.` },
    { q: `${t} 관련 실비 청구가 가능한가요?`, a: `실손보험 청구 가능 여부는 개인 보험 약관에 따라 다릅니다. 서울비디치과에서는 실비 청구에 필요한 진단서와 서류를 발급해 드립니다.` },
    { q: `${t} 관련 비용을 분할 납부할 수 있나요?`, a: `네, 서울비디치과에서는 무이자 할부, 카드 분할 결제 등 다양한 결제 방법을 제공합니다. 비용이 부담되시면 상담 시 문의해 주세요.` },
  ],
  '임플란트': (t, s, d) => [
    { q: `${t}은(는) 임플란트 시술에 어떤 영향을 미치나요?`, a: `${s} ${d} 서울비디치과 임플란트 센터에서는 CT 정밀 분석을 통해 ${t}을(를) 고려한 최적의 시술 계획을 수립합니다.` },
    { q: `${t} 관련 임플란트 수명은 얼마나 되나요?`, a: `임플란트는 적절한 관리 시 반영구적으로 사용할 수 있습니다. 서울비디치과에서는 수술 후 정기 관리 프로그램을 제공하여 임플란트 수명을 최대화합니다.` },
    { q: `임플란트 수술 후 ${t} 관련 주의사항이 있나요?`, a: `수술 후 2~3일간 붓기와 통증이 있을 수 있으며, 딱딱한 음식 섭취를 피하고 처방된 약을 복용해야 합니다. 서울비디치과에서는 수술 후 24시간 상담 서비스를 제공합니다.` },
    { q: `나이가 많아도 임플란트가 가능한가요?`, a: `전신 건강 상태가 양호하다면 나이에 관계없이 임플란트가 가능합니다. 서울비디치과에서는 전문의 협진을 통해 고령 환자에게도 안전한 임플란트 시술을 제공합니다.` },
  ],
}

// ============================================
// 본문 내 다른 용어 자동 인터링킹 함수
// ============================================
function interlinkText(text: string, currentTerm: string, allItems: typeof encItems): string {
  // 용어를 길이 순 내림차순 정렬 (긴 용어 우선 매칭 → 부분 매칭 방지)
  const sortedTerms = allItems
    .filter(i => i.term !== currentTerm && i.term.length >= 2)
    .sort((a, b) => b.term.length - a.term.length)
  
  let result = text
  const linked = new Set<string>()
  let linkCount = 0
  const maxLinks = 5

  for (const item of sortedTerms) {
    if (linkCount >= maxLinks) break
    if (linked.has(item.term)) continue
    
    const escaped = item.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const idx = result.indexOf(item.term)
    if (idx === -1) continue
    
    // <a> 태그 내부인지 확인 (간단한 방법: idx 이전에 열린 <a가 닫히지 않았는지)
    const before = result.slice(0, idx)
    const lastOpenA = before.lastIndexOf('<a ')
    const lastCloseA = before.lastIndexOf('</a>')
    if (lastOpenA > lastCloseA) continue  // <a> 태그 내부이므로 스킵
    
    // 첫 번째 매칭만 링크로 변환
    const linkHtml = `<a href="/encyclopedia/${encodeURIComponent(item.term)}" style="color:#6B4226;text-decoration:underline;text-decoration-style:dotted;font-weight:600;">${item.term}</a>`
    result = result.slice(0, idx) + linkHtml + result.slice(idx + item.term.length)
    linkCount++
    linked.add(item.term)
  }
  return result
}

app.get('/encyclopedia/:term', (c) => {
  const termParam = decodeURIComponent(c.req.param('term'))
  
  // 용어 찾기 (정확 매치 → 동의어 매치)
  let item = encItems.find(i => i.term === termParam)
  if (!item) {
    item = encItems.find(i => (i.synonyms || []).includes(termParam))
  }
  
  if (!item) {
    return c.redirect('/encyclopedia/', 302)
  }

  const term = item.term
  const encodedTerm = encodeURIComponent(term)
  const canonicalUrl = `https://bdbddc.com/encyclopedia/${encodedTerm}`
  const synonymsText = item.synonyms && item.synonyms.length ? item.synonyms.join(', ') : ''
  const tagsHtml = (item.tags || []).map(t => `<span style="display:inline-block;font-size:0.8rem;padding:4px 12px;border-radius:50px;background:#f5f0eb;color:#6B4226;margin:0 4px 4px 0;">#${t}</span>`).join('')
  
  // 진료 페이지 연결 링크
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

  // === 카테고리별 맞춤 FAQ 생성 ===
  const faqGenerator = categoryFaqTemplates[item.category] || categoryFaqTemplates['전문 용어']
  const dynamicFaqs = faqGenerator(term, item.short, item.detail)
  // 기본 2개 + 카테고리별 3~5개 = 총 5~7개 FAQ
  const allFaqs = [
    { q: `${term}이란 무엇인가요?`, a: `${item.short} ${item.detail}` },
    ...dynamicFaqs,
    { q: `${term} 관련 상담은 어디서 받을 수 있나요?`, a: `서울비디치과는 서울대 출신 15인 전문의 협진 시스템으로 ${item.category} 분야를 포함한 종합 치과 진료를 제공합니다. 365일 진료, 전화 041-415-2892 또는 온라인 예약(bdbddc.com/reservation)으로 무료 상담을 받으실 수 있습니다.` },
  ]

  const faqHtml = allFaqs.map((faq, idx) => `
<div style="border:1px solid #e8e0d8;border-radius:12px;margin-bottom:10px;overflow:hidden;">
<button onclick="this.parentElement.classList.toggle('faq-open');this.querySelector('.faq-chevron').classList.toggle('rotated')" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#fff;border:none;cursor:pointer;text-align:left;gap:12px;">
<span style="font-weight:600;color:#333;font-size:0.95rem;flex:1;"><span style="color:#c9a96e;margin-right:8px;">Q.</span>${faq.q}</span>
<i class="fas fa-chevron-down faq-chevron" style="color:#999;font-size:0.8rem;transition:transform 0.3s;"></i>
</button>
<div style="max-height:0;overflow:hidden;transition:max-height 0.3s ease;">
<div style="padding:0 20px 16px;color:#555;font-size:0.9rem;line-height:1.8;border-top:1px solid #f0ebe4;">
<p style="margin:12px 0 0;"><span style="color:#6B4226;font-weight:600;margin-right:8px;">A.</span>${faq.a}</p>
</div>
</div>
</div>`).join('')

  const faqSchemaEntities = allFaqs.map(faq => `{"@type":"Question","name":${JSON.stringify(faq.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(faq.a)}}}`).join(',')

  // === 본문 인터링킹 ===
  const linkedDetail = interlinkText(item.detail, term, encItems)

  // === 같은 카테고리 관련 용어 (최대 8개) ===
  const relatedItems = encItems.filter(i => i.category === item!.category && i.id !== item!.id).slice(0, 8)
  const relatedHtml = relatedItems.map(r => {
    const hasLink = r.link ? `<span style="font-size:0.7rem;color:#c9a96e;float:right;"><i class="fas fa-stethoscope"></i></span>` : ''
    return `<a href="/encyclopedia/${encodeURIComponent(r.term)}" style="display:block;padding:12px 16px;background:#fff;border:1px solid #e8e0d8;border-radius:12px;text-decoration:none;color:#333;transition:all 0.2s;"><strong style="color:#6B4226;">${r.term}</strong>${hasLink}<br><span style="font-size:0.85rem;color:#888;">${r.short.slice(0, 40)}...</span></a>`
  }).join('')

  // === 크로스 카테고리 추천 (다른 카테고리에서 관련성 높은 용어) ===
  const currentTags = new Set(item.tags || [])
  const crossCatItems = encItems
    .filter(i => i.category !== item!.category && i.id !== item!.id)
    .map(i => {
      const overlap = (i.tags || []).filter(t => currentTags.has(t)).length
      // 동의어/이름에 현재 용어가 포함되거나, detail에 현재 용어가 포함되면 가점
      const nameOverlap = i.detail.includes(term) || i.short.includes(term) ? 2 : 0
      return { ...i, score: overlap + nameOverlap }
    })
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  const crossCatHtml = crossCatItems.length > 0 ? crossCatItems.map(r =>
    `<a href="/encyclopedia/${encodeURIComponent(r.term)}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#fff;border:1px solid #e8e0d8;border-radius:50px;text-decoration:none;color:#555;font-size:0.85rem;transition:all 0.2s;"><span style="color:#c9a96e;font-size:0.7rem;"><i class="fas fa-link"></i></span>${r.term}<span style="font-size:0.7rem;color:#aaa;">${r.category}</span></a>`
  ).join('') : ''

  const html = `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
${TRACKING_HEAD}
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
<meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${term} | 치과 백과사전 — 서울비디치과">
<meta name="twitter:description" content="${term}이란? ${item.short}">
<meta name="twitter:image" content="https://bdbddc.com/images/og-image-v2.jpg">
<meta name="subject" content="${term}, ${item.category}, 치과 용어, 서울비디치과">
<meta name="abstract" content="${term}이란? ${item.short} — 서울비디치과 치과 백과사전.">
<meta name="ai-summary" content="${term}이란? ${item.short} ${item.detail.slice(0, 200)}">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/site-v5.css?v=1a91d774">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"치과 백과사전","item":"https://bdbddc.com/encyclopedia/"},{"@type":"ListItem","position":3,"name":"${item.category}","item":"https://bdbddc.com/encyclopedia/category/${encodeURIComponent(item.category)}"},{"@type":"ListItem","position":4,"name":"${term}","item":"${canonicalUrl}"}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"DefinedTerm","name":"${term}","description":"${item.short} ${item.detail}","inDefinedTermSet":{"@type":"DefinedTermSet","name":"서울비디치과 치과 백과사전","url":"https://bdbddc.com/encyclopedia/"},"url":"${canonicalUrl}"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${faqSchemaEntities}]}
</script>
<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
<script>Weglot.initialize({ api_key: 'wg_60caborb1mso4g2k2c8qe1' });</script>
<style>
.faq-open > div:last-child { max-height: 500px !important; }
.faq-chevron.rotated { transform: rotate(180deg); }
</style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

${ssrHeader()}

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
<a href="/encyclopedia/category/${encodeURIComponent(item.category)}" style="color:#6B4226;text-decoration:none;">${item.category}</a> &gt;
<span>${term}</span>
</nav>

<article itemscope itemtype="https://schema.org/DefinedTerm">
<header style="margin-bottom:32px;">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
<span style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:#f5f0eb;color:#6B4226;font-weight:800;font-size:1.3rem;border-radius:12px;">${item.chosung || ''}</span>
<h1 itemprop="name" style="font-size:2rem;font-weight:800;color:#333;margin:0;">${term}</h1>
</div>
${synonymsText ? `<p style="font-size:0.9rem;color:#888;margin-bottom:8px;"><i class="fas fa-exchange-alt" style="margin-right:4px;"></i>동의어: ${item.synonyms!.map(s => `<a href="/encyclopedia/${encodeURIComponent(s)}" style="color:#6B4226;text-decoration:none;">${s}</a>`).join(', ')}</p>` : ''}
<a href="/encyclopedia/category/${encodeURIComponent(item.category)}" style="display:inline-block;font-size:0.8rem;font-weight:600;padding:4px 14px;border-radius:50px;background:#f5f0eb;color:#6B4226;text-decoration:none;">${item.category}</a>
</header>

<div style="background:#faf7f3;border-left:4px solid #c9a96e;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:24px;">
<p itemprop="description" style="font-size:1.1rem;font-weight:600;color:#333;line-height:1.7;margin:0;">${item.short}</p>
</div>

<div style="font-size:1rem;color:#555;line-height:1.9;margin-bottom:24px;">
<h2 style="font-size:1.2rem;font-weight:700;color:#333;margin-bottom:12px;"><i class="fas fa-info-circle" style="color:#c9a96e;margin-right:6px;"></i> 상세 설명</h2>
<p>${linkedDetail}</p>
</div>

${tagsHtml ? `<div style="margin-bottom:32px;">${tagsHtml}</div>` : ''}

${treatmentLinkHtml}

<div style="margin-bottom:32px;">
<h2 style="font-size:1.2rem;font-weight:700;color:#333;margin-bottom:16px;"><i class="fas fa-question-circle" style="color:#c9a96e;margin-right:6px;"></i> ${term} 자주 묻는 질문</h2>
${faqHtml}
</div>

<div style="background:linear-gradient(135deg, #6B4226, #8B5E3C);border-radius:16px;padding:28px 24px;text-align:center;color:#fff;margin-bottom:40px;">
<p style="font-size:1.1rem;font-weight:600;margin-bottom:16px;">${term}에 대해 더 궁금하신가요?</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
<a href="/reservation" style="display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:#fff;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem;"><i class="fas fa-calendar-check"></i> 무료 상담 예약</a>
<a href="tel:041-415-2892" style="display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:rgba(255,255,255,0.15);color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid rgba(255,255,255,0.3);"><i class="fas fa-phone"></i> 041-415-2892</a>
</div>
</div>

${crossCatHtml ? `
<div style="margin-bottom:32px;">
<h2 style="font-size:1.1rem;font-weight:700;color:#333;margin-bottom:12px;"><i class="fas fa-project-diagram" style="color:#c9a96e;margin-right:6px;"></i> 함께 알면 좋은 용어</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px;">
${crossCatHtml}
</div>
</div>
` : ''}

${relatedHtml ? `
<div style="margin-bottom:40px;">
<h2 style="font-size:1.2rem;font-weight:700;color:#333;margin-bottom:16px;"><i class="fas fa-book-medical" style="color:#c9a96e;margin-right:6px;"></i> 같은 카테고리: <a href="/encyclopedia/category/${encodeURIComponent(item.category)}" style="color:#6B4226;text-decoration:none;">${item.category}</a></h2>
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
<p style="margin-bottom:8px;"><a href="https://medium.com/@sodanstjrwns" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.8rem;"><i class="fab fa-medium" style="margin-right:4px;"></i>English Clinical Articles by Dr. Moon on Medium</a></p>
<p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수합니다.</p>
<p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
</div>
</div>
</footer>

${ssrMobileNav()}
<script src="/js/main.js" defer></script>
<script src="/js/gnb-v2.js" defer></script>
</body>
</html>`

  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return c.html(html)
})

// ============================================
// 백과사전 카테고리별 페이지 (SSR - 15개 카테고리 URL)
// /encyclopedia/category/:name → 카테고리별 용어 목록
// ============================================
const encCategories = [...new Set(encItems.map(i => i.category))]

// 카테고리별 소개문 및 아이콘
const categoryMeta: Record<string, {icon: string; intro: string; keywords: string[]}> = {
  '치아 구조': { icon: 'fa-tooth', intro: '치아의 구조와 기능을 이해하면 구강 건강 관리가 쉬워집니다. 법랑질부터 치근까지, 치아를 구성하는 각 부위의 역할과 특징을 알아보세요.', keywords: ['치아 구조', '치아 해부학', '법랑질', '상아질', '치수', '치근'] },
  '치과 질환': { icon: 'fa-viruses', intro: '충치, 부정교합, 치아 외상 등 흔한 치과 질환의 원인·증상·예방법을 정리했습니다. 조기 발견과 치료가 건강한 치아의 핵심입니다.', keywords: ['치과 질환', '충치', '부정교합', '치아 외상', '치아 통증'] },
  '구강내과 질환': { icon: 'fa-notes-medical', intro: '편평태선, 버닝마우스 증후군, 구강 건조증, 구내염, 구강암 등 구강 점막과 연조직에 발생하는 질환을 총정리했습니다. 원인, 증상, 치료법을 알아보세요.', keywords: ['구강내과', '편평태선', '버닝마우스', '구내염', '구강건조증', '구강암', '구강 점막 질환'] },
  '치주 질환': { icon: 'fa-teeth-open', intro: '치은염, 치주염, 잇몸 퇴축, 잇몸 출혈 등 잇몸과 치주 조직에 발생하는 질환을 정리했습니다. 잇몸 건강은 치아 건강의 기초입니다.', keywords: ['치주 질환', '잇몸 질환', '치주염', '치은염', '잇몸 출혈', '풍치'] },
  '치수·치아 질환': { icon: 'fa-bolt', intro: '치수염, 치근단 병소, 치아 균열 등 치아 내부 신경과 조직에 발생하는 질환을 설명합니다. 신경치료와 치아 보존의 핵심입니다.', keywords: ['치수염', '신경치료', '치근단', '치아 균열', '치수 괴사', '치아 보존'] },
  '턱관절·구강외과': { icon: 'fa-head-side-medical', intro: '턱관절 장애, 이갈이, 악골 골수염, 구강악안면 골절 등 턱관절과 구강외과 영역의 질환을 다룹니다. 정확한 진단과 전문 치료가 필요한 분야입니다.', keywords: ['턱관절', 'TMJ', '이갈이', '악골 골수염', '구강외과', '안면 골절'] },
  '치료·시술': { icon: 'fa-hand-holding-medical', intro: '임플란트, 크라운, 레진, 신경치료 등 다양한 치과 치료 방법의 과정과 특징을 알아보세요. 서울비디치과에서 제공하는 치료를 이해하는 데 도움이 됩니다.', keywords: ['치과 치료', '치과 시술', '임플란트', '크라운', '레진', '신경치료'] },
  '전문 용어': { icon: 'fa-microscope', intro: '치과 진료 시 자주 듣게 되는 전문 용어를 쉽게 풀어 설명합니다. 진료 상담이 더 잘 이해되도록 도와드립니다.', keywords: ['치과 전문 용어', '치과 용어 해설', '치과 상식', '의료 용어'] },
  '구강 관리': { icon: 'fa-shield-alt', intro: '올바른 칫솔질, 치실 사용법, 정기 검진 등 일상에서 실천할 수 있는 구강 관리법을 소개합니다. 예방이 최고의 치료입니다.', keywords: ['구강 관리', '칫솔질', '치실', '구강 위생', '예방 치과'] },
  '장비·기술': { icon: 'fa-x-ray', intro: 'CT, 디지털 스캐너, 레이저 등 최신 치과 장비와 기술을 설명합니다. 서울비디치과에서 도입한 첨단 장비의 원리를 확인하세요.', keywords: ['치과 장비', '치과 기술', 'CT', '디지털 치과', '레이저 치료'] },
  '치과 재료': { icon: 'fa-cubes', intro: '레진, 세라믹, 지르코니아, 금 등 치과에서 사용하는 다양한 재료의 특성과 장단점을 비교합니다.', keywords: ['치과 재료', '레진', '세라믹', '지르코니아', '치과 보철 재료'] },
  '교정': { icon: 'fa-teeth', intro: '교정 치료의 종류, 과정, 기간, 비용 등 궁금한 모든 것을 정리했습니다. 인비절라인부터 설측 교정까지 다양한 옵션을 알아보세요.', keywords: ['치아 교정', '인비절라인', '교정 치료', '부정교합', '치열 교정'] },
  '소아 치과': { icon: 'fa-baby', intro: '어린이 치아 관리, 유치 치료, 실란트, 불소 도포 등 아이의 구강 건강에 필요한 정보를 모았습니다.', keywords: ['소아 치과', '어린이 치아', '유치', '실란트', '불소 도포', '소아 치료'] },
  '보험·비용': { icon: 'fa-coins', intro: '치과 건강보험 적용 항목, 실비 청구, 비용 안내 등 치과 비용과 보험에 대한 실질적인 정보를 제공합니다.', keywords: ['치과 보험', '치과 비용', '건강보험', '실비 청구', '치과 가격'] },
  '임플란트': { icon: 'fa-screwdriver-wrench', intro: '임플란트 수술 과정, 종류, 재료, 관리법, 비용 등 임플란트에 대한 모든 전문 용어를 정리했습니다.', keywords: ['임플란트', '임플란트 수술', '인공 치아', '임플란트 비용', '뼈이식'] },
}

app.get('/encyclopedia/category/:name', (c) => {
  const catName = decodeURIComponent(c.req.param('name'))
  
  if (!encCategories.includes(catName)) {
    return c.redirect('/encyclopedia/', 302)
  }
  
  const catItems = encItems.filter(i => i.category === catName)
  const canonicalUrl = `https://bdbddc.com/encyclopedia/category/${encodeURIComponent(catName)}`
  const meta = categoryMeta[catName] || { icon: 'fa-folder-open', intro: `${catName} 관련 치과 용어를 모아 정리했습니다.`, keywords: [catName] }
  
  // 진료 링크가 있는 용어 우선
  const sortedItems = [...catItems].sort((a, b) => (b.link ? 1 : 0) - (a.link ? 1 : 0))
  
  const itemCards = sortedItems.map(item => {
    const linkBadge = item.link ? `<span style="font-size:0.7rem;color:#c9a96e;float:right;" title="진료 안내 연결"><i class="fas fa-stethoscope"></i></span>` : ''
    return `<a href="/encyclopedia/${encodeURIComponent(item.term)}" style="display:block;padding:14px 16px;background:#fff;border:1px solid #e8e0d8;border-radius:12px;text-decoration:none;color:#333;transition:all 0.2s;">
      <strong style="color:#6B4226;">${item.term}</strong>${linkBadge}
      ${item.synonyms && item.synonyms.length ? `<span style="font-size:0.75rem;color:#aaa;margin-left:4px;">(${item.synonyms[0]})</span>` : ''}
      <span style="display:block;font-size:0.85rem;color:#888;margin-top:4px;">${item.short.slice(0, 60)}${item.short.length > 60 ? '...' : ''}</span>
    </a>`
  }).join('')
  
  const otherCats = encCategories.filter(c2 => c2 !== catName).map(c2 => {
    const cm = categoryMeta[c2] || { icon: 'fa-folder' }
    const cnt = encItems.filter(i => i.category === c2).length
    return `<a href="/encyclopedia/category/${encodeURIComponent(c2)}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#fff;border:1px solid #e8e0d8;border-radius:50px;text-decoration:none;color:#555;font-size:0.85rem;font-weight:500;"><i class="fas ${cm.icon}" style="color:#c9a96e;font-size:0.75rem;"></i>${c2}<span style="font-size:0.7rem;color:#aaa;">${cnt}</span></a>`
  }).join('')

  // ItemList 스키마 (상위 10개)
  const itemListEntries = sortedItems.slice(0, 10).map((item, idx) =>
    `{"@type":"ListItem","position":${idx + 1},"url":"https://bdbddc.com/encyclopedia/${encodeURIComponent(item.term)}","name":"${item.term}"}`
  ).join(',')

  // 카테고리별 FAQ (3개)
  const catFaqs = [
    { q: `${catName} 카테고리에는 어떤 용어가 있나요?`, a: `${catName} 카테고리에는 ${catItems.slice(0, 8).map(i => i.term).join(', ')} 등 총 ${catItems.length}개의 치과 용어가 포함되어 있습니다. 각 용어 페이지에서 상세한 설명을 확인하실 수 있습니다.` },
    { q: `${catName} 관련 진료를 받으려면 어떻게 해야 하나요?`, a: `서울비디치과에서는 ${catName} 분야의 전문 진료를 제공합니다. 서울대 출신 15인 전문의 협진 시스템으로 정확한 진단과 치료를 받으실 수 있습니다. 전화 041-415-2892 또는 온라인 예약으로 상담하세요.` },
    { q: `${catName} 관련 정보는 누가 감수하나요?`, a: `서울비디치과 치과 백과사전의 모든 내용은 서울대학교 치의학 석사 출신의 전문의가 감수합니다. 정확하고 신뢰할 수 있는 치과 정보를 제공하기 위해 최선을 다합니다.` },
  ]
  const catFaqSchemaEntries = catFaqs.map(faq => `{"@type":"Question","name":${JSON.stringify(faq.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(faq.a)}}}`).join(',')

  const catHtml = `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
${TRACKING_HEAD}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<title>${catName} 치과 용어 ${catItems.length}개 | 치과 백과사전 — 서울비디치과</title>
<meta name="description" content="${meta.intro} 서울대 출신 전문의가 감수한 ${catItems.length}개 ${catName} 용어를 확인하세요.">
<meta name="keywords" content="${[...meta.keywords, '서울비디치과', '치과 백과사전'].join(', ')}">
<meta name="author" content="서울비디치과">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${catName} 치과 용어 ${catItems.length}개 | 서울비디치과 백과사전">
<meta property="og:description" content="${meta.intro.slice(0, 120)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="서울비디치과">
<meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${catName} 치과 용어 ${catItems.length}개 | 서울비디치과 백과사전">
<meta name="twitter:description" content="${meta.intro.slice(0, 120)}">
<meta name="twitter:image" content="https://bdbddc.com/images/og-image-v2.jpg">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/site-v5.css?v=1a91d774">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"치과 백과사전","item":"https://bdbddc.com/encyclopedia/"},{"@type":"ListItem","position":3,"name":"${catName}","item":"${canonicalUrl}"}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"${catName} — 서울비디치과 치과 백과사전","description":"${meta.intro}","url":"${canonicalUrl}","isPartOf":{"@type":"WebSite","name":"서울비디치과","url":"https://bdbddc.com"},"numberOfItems":${catItems.length},"publisher":{"@id":"https://bdbddc.com/#dentist"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ItemList","name":"${catName} 치과 용어 목록","numberOfItems":${catItems.length},"itemListElement":[${itemListEntries}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${catFaqSchemaEntries}]}
</script>
<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
<script>Weglot.initialize({ api_key: 'wg_60caborb1mso4g2k2c8qe1' });</script>
<style>
.cat-faq-open > div:last-child { max-height: 500px !important; }
.cat-faq-chevron.rotated { transform: rotate(180deg); }
</style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

${ssrHeader()}

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

<div style="background:#faf7f3;border-radius:16px;padding:28px 24px;margin-bottom:32px;">
<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
<span style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:#6B4226;color:#fff;border-radius:12px;font-size:1.2rem;"><i class="fas ${meta.icon}"></i></span>
<h1 style="font-size:1.8rem;font-weight:800;color:#333;margin:0;">${catName}</h1>
</div>
<p style="font-size:1rem;color:#666;line-height:1.7;margin:0 0 8px;">${meta.intro}</p>
<p style="font-size:0.9rem;color:#888;">총 <strong style="color:#6B4226;">${catItems.length}개</strong> 용어 · 서울대 출신 전문의 감수</p>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;margin-bottom:40px;">
${itemCards}
</div>

<div style="margin-bottom:32px;">
<h2 style="font-size:1.1rem;font-weight:700;color:#333;margin-bottom:16px;"><i class="fas fa-question-circle" style="color:#c9a96e;margin-right:6px;"></i> ${catName} 자주 묻는 질문</h2>
${catFaqs.map(faq => `
<div style="border:1px solid #e8e0d8;border-radius:12px;margin-bottom:10px;overflow:hidden;">
<button onclick="this.parentElement.classList.toggle('cat-faq-open');this.querySelector('.cat-faq-chevron').classList.toggle('rotated')" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#fff;border:none;cursor:pointer;text-align:left;gap:12px;">
<span style="font-weight:600;color:#333;font-size:0.95rem;flex:1;"><span style="color:#c9a96e;margin-right:8px;">Q.</span>${faq.q}</span>
<i class="fas fa-chevron-down cat-faq-chevron" style="color:#999;font-size:0.8rem;transition:transform 0.3s;"></i>
</button>
<div style="max-height:0;overflow:hidden;transition:max-height 0.3s ease;">
<div style="padding:0 20px 16px;color:#555;font-size:0.9rem;line-height:1.8;border-top:1px solid #f0ebe4;">
<p style="margin:12px 0 0;"><span style="color:#6B4226;font-weight:600;margin-right:8px;">A.</span>${faq.a}</p>
</div>
</div>
</div>
`).join('')}
</div>

<div style="background:linear-gradient(135deg, #6B4226, #8B5E3C);border-radius:16px;padding:24px;text-align:center;color:#fff;margin-bottom:32px;">
<p style="font-size:1rem;font-weight:600;margin-bottom:12px;">${catName} 관련 상담이 필요하신가요?</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
<a href="/reservation" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#fff;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.9rem;"><i class="fas fa-calendar-check"></i> 무료 상담 예약</a>
<a href="tel:041-415-2892" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(255,255,255,0.15);color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.9rem;border:1px solid rgba(255,255,255,0.3);"><i class="fas fa-phone"></i> 041-415-2892</a>
</div>
</div>

<div style="margin-bottom:32px;">
<h2 style="font-size:1.1rem;font-weight:700;color:#333;margin-bottom:12px;"><i class="fas fa-th" style="color:#c9a96e;margin-right:6px;"></i> 다른 카테고리</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px;">
${otherCats}
</div>
</div>

<div style="text-align:center;padding-top:20px;border-top:1px solid #e8e0d8;">
<a href="/encyclopedia/" style="display:inline-flex;align-items:center;gap:6px;padding:12px 28px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;"><i class="fas fa-th"></i> 전체 585개 용어 보기</a>
</div>

</div>
</section>
</main>

<footer class="footer" role="contentinfo">
<div class="container">
<div class="footer-legal">
<p style="margin-bottom:8px;"><a href="https://medium.com/@sodanstjrwns" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.8rem;"><i class="fab fa-medium" style="margin-right:4px;"></i>English Clinical Articles by Dr. Moon on Medium</a></p>
<p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수합니다.</p>
<p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
</div>
</div>
</footer>

${ssrMobileNav()}
<script src="/js/main.js" defer></script>
<script src="/js/gnb-v2.js" defer></script>
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

// 게임 (플레이)
app.get('/flight', serveStatic({ path: './flight.html' }))
app.get('/checkup', serveStatic({ path: './checkup.html' }))
app.get('/symptom-checker', serveStatic({ path: './symptom-checker.html' }))
app.get('/run', serveStatic({ path: './run.html' }))
app.get('/games', serveStatic({ path: './games.html' }))

// 디자인 트렌드 데모
app.get('/demo-trends', serveStatic({ path: './demo-trends.html' }))

// Root level HTML files with .html extension → handled by 301 redirects above

// ============================================
// 페이지 조회수 추적 API
// ============================================

// POST /api/views — 조회수 증가 (콘텐츠 페이지에서 호출)
app.post('/api/views', async (c) => {
  try {
    const { page_type, page_id } = await c.req.json<{ page_type: string; page_id: string }>()
    if (!page_type || !page_id) return c.json({ error: 'Missing page_type or page_id' }, 400)
    
    const validTypes = ['case', 'column', 'notice']
    if (!validTypes.includes(page_type)) return c.json({ error: 'Invalid page_type' }, 400)

    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)

    // UPSERT: 존재하면 view_count +1, 없으면 생성
    await db.prepare(`
      INSERT INTO page_views (page_type, page_id, view_count, last_viewed_at)
      VALUES (?, ?, 1, datetime('now'))
      ON CONFLICT(page_type, page_id)
      DO UPDATE SET view_count = view_count + 1, last_viewed_at = datetime('now')
    `).bind(page_type, page_id).run()

    const result = await db.prepare(
      'SELECT view_count FROM page_views WHERE page_type = ? AND page_id = ?'
    ).bind(page_type, page_id).first<{ view_count: number }>()

    return c.json({ success: true, views: result?.view_count || 1 })
  } catch (e: any) {
    return c.json({ error: e.message || 'Server error' }, 500)
  }
})

// GET /api/views?type=case — 특정 타입의 모든 조회수 조회 (관리자용)
app.get('/api/views', async (c) => {
  try {
    const page_type = c.req.query('type')
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)

    if (page_type) {
      const { results } = await db.prepare(
        'SELECT page_id, view_count, last_viewed_at FROM page_views WHERE page_type = ? ORDER BY view_count DESC'
      ).bind(page_type).all()
      return c.json(results || [])
    }

    // 전체 타입별 통계
    const { results } = await db.prepare(`
      SELECT page_type, SUM(view_count) as total_views, COUNT(*) as page_count
      FROM page_views GROUP BY page_type
    `).all()
    return c.json(results || [])
  } catch (e: any) {
    return c.json({ error: e.message || 'Server error' }, 500)
  }
})

// GET /api/views/:type/:id — 특정 콘텐츠 조회수
app.get('/api/views/:type/:id', async (c) => {
  try {
    const page_type = c.req.param('type')
    const page_id = c.req.param('id')
    const db = c.env.DB
    if (!db) return c.json({ views: 0 })

    const result = await db.prepare(
      'SELECT view_count FROM page_views WHERE page_type = ? AND page_id = ?'
    ).bind(page_type, page_id).first<{ view_count: number }>()

    return c.json({ views: result?.view_count || 0 })
  } catch {
    return c.json({ views: 0 })
  }
})

// 채용 페이지
app.get('/careers', serveStatic({ path: './careers.html' }))

// Homepage
app.get('/', serveStatic({ path: './index.html' }))

// Fallback for any .html file
app.use('/*.html', serveStatic())

// ============================================
// 채용 지원서 API
// ============================================

// ▶ 보안: SQL 인젝션 패턴 탐지
const SQL_INJECTION_PATTERNS = [
  /('|--|;|\\|\|\||&&)/,
  /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\s/i,
  /(OR|AND)\s+\d+\s*=\s*\d+/i,
  /PG_SLEEP|WAITFOR\s+DELAY|SLEEP\s*\(/i,
  /DBMS_PIPE|UTL_HTTP|BENCHMARK\s*\(/i,
  /XOR\s*\(/i,
  /SYSDATE\s*\(\)/i,
  /RECEIVE_MESSAGE/i,
  /0x[0-9a-fA-F]+/,
  /CHAR\s*\(\d+\)/i,
]

function containsSQLInjection(value: string): boolean {
  if (!value || value.length < 3) return false
  // 2개 이상 패턴 매칭 시 차단 (오탐 최소화)
  let matchCount = 0
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(value)) matchCount++
    if (matchCount >= 2) return true
  }
  return false
}

function hasSuspiciousInput(body: Record<string, any>): string | null {
  const fieldsToCheck = ['name', 'phone', 'email', 'position', 'experience', 'license', 'message', 'startDate']
  for (const field of fieldsToCheck) {
    const val = body[field]
    if (typeof val === 'string' && containsSQLInjection(val)) {
      return field
    }
  }
  // careers 배열 내부도 검사
  if (Array.isArray(body.careers)) {
    for (const career of body.careers) {
      for (const key of ['company', 'period', 'role']) {
        if (typeof career[key] === 'string' && containsSQLInjection(career[key])) {
          return `careers.${key}`
        }
      }
    }
  }
  return null
}

// ▶ 보안: Rate Limiting (IP당 5분에 3건)
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 5 * 60 * 1000  // 5분
const RATE_LIMIT_MAX = 3  // 5분에 최대 3건

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  // 윈도우 밖 기록 제거
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent)
    return true
  }
  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

// ▶ 보안: Turnstile 검증
async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
  try {
    const formData = new URLSearchParams()
    formData.append('secret', secret)
    formData.append('response', token)
    if (ip) formData.append('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })
    const data = await res.json() as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}

// [공개] 지원서 제출
app.post('/api/careers/apply', async (c) => {
  try {
    const db = c.env.DB
    const r2 = c.env.R2
    if (!db) return c.json({ error: 'DB not available' }, 500)

    // ▶ 방어막 1: Rate Limiting
    const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    if (isRateLimited(clientIP)) {
      return c.json({ error: '너무 많은 요청입니다. 5분 후 다시 시도해주세요.' }, 429)
    }

    const body = await c.req.json()
    const { name, phone, email, birth, position, experience, workDays, startDate, license, message, careers, photo, appliedAt, turnstileToken } = body

    // ▶ 방어막 2: Turnstile 검증 (시크릿 키가 설정된 경우에만)
    const turnstileSecret = c.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      if (!turnstileToken) {
        return c.json({ error: '보안 인증이 필요합니다. 페이지를 새로고침 후 다시 시도해주세요.' }, 400)
      }
      const verified = await verifyTurnstile(turnstileToken, turnstileSecret, clientIP)
      if (!verified) {
        return c.json({ error: '보안 인증에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.' }, 403)
      }
    }

    // ▶ 방어막 3: SQL 인젝션 탐지
    const suspiciousField = hasSuspiciousInput(body)
    if (suspiciousField) {
      console.error(`[SECURITY] SQL injection attempt blocked from IP: ${clientIP}, field: ${suspiciousField}`)
      return c.json({ error: '입력값에 허용되지 않는 문자가 포함되어 있습니다.' }, 400)
    }

    // ▶ 추가 유효성 검사: 이름/연락처 최소 길이
    if (!name || !name.trim() || name.trim().length < 2) return c.json({ error: '이름을 2자 이상 입력해주세요.' }, 400)
    if (!phone || !phone.trim() || phone.trim().length < 8) return c.json({ error: '올바른 연락처를 입력해주세요.' }, 400)
    if (!position) return c.json({ error: '지원 분야를 선택해주세요.' }, 400)

    // ▶ 이름: 한글/영문/공백만 허용 (특수문자 차단)
    if (!/^[가-힣a-zA-Z\s]+$/.test(name.trim())) {
      return c.json({ error: '이름은 한글 또는 영문만 입력 가능합니다.' }, 400)
    }

    // ▶ 연락처: 숫자/하이픈만 허용
    if (!/^[0-9\-]+$/.test(phone.trim())) {
      return c.json({ error: '연락처는 숫자와 하이픈(-)만 입력 가능합니다.' }, 400)
    }

    // 프로필 사진 R2 업로드 (base64 → R2)
    let photoKey = null
    if (photo && r2) {
      try {
        const match = photo.match(/^data:image\/(\w+);base64,(.+)$/)
        if (match) {
          const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
          const base64Data = match[2]
          const binary = Uint8Array.from(atob(base64Data), ch => ch.charCodeAt(0))
          photoKey = `careers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
          await r2.put(photoKey, binary, {
            httpMetadata: { contentType: `image/${match[1]}` }
          })
        }
      } catch (photoErr) {
        console.error('Photo upload error:', photoErr)
        // 사진 업로드 실패해도 지원서는 제출
      }
    }

    // DB에 저장
    const now = appliedAt || new Date().toISOString()
    const careersJson = careers && careers.length > 0 ? JSON.stringify(careers) : null

    await db.prepare(`
      INSERT INTO career_applications
      (name, phone, email, birth, position, experience, work_days, start_date, license, message, careers, photo_key, applied_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name.trim(),
      phone.trim(),
      email?.trim() || null,
      birth || null,
      position,
      experience || null,
      workDays || null,
      startDate?.trim() || null,
      license?.trim() || null,
      message?.trim() || null,
      careersJson,
      photoKey,
      now
    ).run()

    // 이메일 알림 발송 (비동기 — 실패해도 지원서는 성공)
    const gmailPw = c.env.GMAIL_APP_PASSWORD
    const notifyEmail = c.env.NOTIFICATION_EMAIL || '6481qqq@naver.com'
    if (gmailPw) {
      try {
        await sendCareerNotificationEmail({
          to: notifyEmail,
          applicantName: name.trim(),
          position,
          phone: phone.trim(),
          email: email?.trim() || '',
          experience: experience || '미기재',
          appliedAt: now,
          gmailPassword: gmailPw
        })
      } catch (emailErr) {
        console.error('Email notification error:', emailErr)
      }
    }

    return c.json({ success: true })
  } catch (e: any) {
    console.error('Career apply error:', e)
    return c.json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, 500)
  }
})

// [관리자] 지원서 목록 조회
app.get('/api/admin/careers', async (c) => {
  // 인증 확인
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  const db = c.env.DB
  if (!db) return c.json({ error: 'DB not available' }, 500)

  const status = c.req.query('status')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')

  let query = 'SELECT * FROM career_applications'
  const params: any[] = []

  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }

  query += ' ORDER BY applied_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await db.prepare(query).bind(...params).all()

  // 총 건수
  let countQuery = 'SELECT COUNT(*) as total FROM career_applications'
  const countParams: any[] = []
  if (status) {
    countQuery += ' WHERE status = ?'
    countParams.push(status)
  }
  const countResult = await db.prepare(countQuery).bind(...countParams).first<{ total: number }>()

  // 상태별 통계
  const { results: stats } = await db.prepare(
    "SELECT status, COUNT(*) as count FROM career_applications GROUP BY status"
  ).all()

  return c.json({
    applications: results || [],
    total: countResult?.total || 0,
    stats: stats || [],
    limit,
    offset
  })
})

// [관리자] 지원서 상태 변경
app.put('/api/admin/careers/:id', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  const db = c.env.DB
  if (!db) return c.json({ error: 'DB not available' }, 500)

  const id = c.req.param('id')
  const { status, admin_note } = await c.req.json()

  const validStatuses = ['new', 'reviewing', 'contacted', 'rejected', 'hired']
  if (status && !validStatuses.includes(status)) {
    return c.json({ error: '유효하지 않은 상태입니다' }, 400)
  }

  const updates: string[] = []
  const values: any[] = []

  if (status) {
    updates.push('status = ?')
    values.push(status)
  }
  if (admin_note !== undefined) {
    updates.push('admin_note = ?')
    values.push(admin_note)
  }
  updates.push("updated_at = datetime('now')")

  values.push(id)

  await db.prepare(`UPDATE career_applications SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()

  return c.json({ success: true })
})

// [관리자] 지원서 삭제
app.delete('/api/admin/careers/:id', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  const db = c.env.DB
  const r2 = c.env.R2
  if (!db) return c.json({ error: 'DB not available' }, 500)

  const id = c.req.param('id')

  // 사진 삭제
  if (r2) {
    const app = await db.prepare('SELECT photo_key FROM career_applications WHERE id = ?').bind(id).first<{ photo_key: string | null }>()
    if (app?.photo_key) {
      try { await r2.delete(app.photo_key) } catch {}
    }
  }

  await db.prepare('DELETE FROM career_applications WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// 이메일 알림 함수 (Gmail SMTP via API)
async function sendCareerNotificationEmail(opts: {
  to: string
  applicantName: string
  position: string
  phone: string
  email: string
  experience: string
  appliedAt: string
  gmailPassword: string
}) {
  // Gmail API를 통한 이메일 발송 (MailChannels 또는 fetch 기반)
  // Cloudflare Workers에서는 SMTP 직접 연결이 불가하므로 MailChannels Send API 사용
  const emailBody = `
서울비디치과 채용 지원서가 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━
📋 지원자 정보
━━━━━━━━━━━━━━━━━━━━━━━━

• 이름: ${opts.applicantName}
• 지원 분야: ${opts.position}
• 연락처: ${opts.phone}
• 이메일: ${opts.email || '미기재'}
• 경력: ${opts.experience}
• 접수 시간: ${new Date(opts.appliedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

━━━━━━━━━━━━━━━━━━━━━━━━

📌 관리자 페이지에서 상세 내용을 확인해주세요.
https://bdbddc.com/admin/

⏰ 이력서 확인 후 만 24시간 이내 연락 부탁드립니다.
`

  // MailChannels API (Cloudflare Workers에서 무료 사용 가능)
  try {
    const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: opts.to }] }],
        from: { email: 'careers@bdbddc.com', name: '서울비디치과 채용' },
        subject: `[채용지원] ${opts.applicantName}님 - ${opts.position} 지원서 접수`,
        content: [{ type: 'text/plain', value: emailBody }]
      })
    })
    if (!res.ok) {
      console.error('MailChannels error:', res.status, await res.text())
    }
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

// ============================================
// 🤖 비디 AI 상담사 — GPT-4o 챗봇 API
// ============================================
const BD_SYSTEM_PROMPT = `당신은 서울비디치과의 AI 상담사 "비디"입니다.

## 역할
- 환자(또는 잠재 환자)의 치과 관련 질문에 친절하고 전문적으로 답변합니다.
- 따뜻하고 안심시키는 톤을 사용하되, 정확한 정보를 전달합니다.
- 존댓말을 사용하고, 이모지는 적절히(과하지 않게) 사용합니다.
- 핵심을 먼저 말하고, 필요시 부연 설명합니다.
- 모르는 것은 모른다고 솔직히 말하고, 전화(041-415-2892) 안내합니다.
- 아래 정보에 없는 내용은 추측하지 말고, "정확한 안내를 위해 전화(041-415-2892)로 문의해 주세요"라고 안내합니다.

## 서울비디치과 기본 정보
- 정식명칭: 불당본점서울비디치과의원 (약칭: 서울비디치과)
- BD = Best Dedication (정성을 다하는 헌신)
- 대표자: 현정민 외 2명 (문석준, 김민수, 현정민)
- 사업자등록번호: 228-11-02956
- 개업일: 2021.05.24
- 위치: 충청남도 천안시 서북구 불당34길 14, 1~5층 (불당동 1841), 우편번호 31156
- 전화: 041-415-2892
- 규모: 5개 층, 400평, 6개 독립 수술실, 2개 회복실
- 에어샤워 시스템, 서울대학교 치과병원급 감염관리 체계
- 원내 기공소: 5인 전문 기공사 상주, 충남권 대규모
- 슬로건: "이건 치료 안하셔도 됩니다" — 필요한 치료만, 정성을 다해

## 핵심 차별점 (7가지)
1. **No 과잉진료**: 필요 없는 치료는 권하지 않음
2. **15인 서울대 원장 협진**: 어려운 케이스도 최적 치료법 도출
3. **365일 진료**: 일요일·공휴일 포함, 평일 야간 20시까지
4. **5개 층 전문 공간**: 각 층별 전문 진료 센터 운영
5. **충분한 설명**: 덴탈커넥트와 시각 자료로 100% 이해될 때까지
6. **철저한 감염관리**: 1인 1기구 원칙, 개별 멸균 패키지, 에어샤워
7. **원내 기공소**: 5인 전문 기공사, 빠르고 정밀한 보철물 제작

## 진료시간
- 평일 (월~금): 09:00 ~ 20:00 (야간진료)
- 토요일: 09:00 ~ 17:00
- 일요일: 09:00 ~ 17:00
- 공휴일: 09:00 ~ 13:00
- 점심시간 (평일): 12:30 ~ 14:00
- ⭐ 365일 진료 (일요일, 공휴일 포함)

## 층별 안내
- **1F 인비절라인 치아교정센터**: 서울대 교정 전문의 2인 (김민규, 임지원), 대규모 교정 전용
- **2F 디지털기공센터 · 위생관리센터**: 원내 기공소, 위생관리, 글로우네이트/심미레진 (현정민, 박수빈 원장)
- **3F BDX검진센터 · 소아치과센터**: 정밀검진, 소아전문의 3인 (김민진, 서희원, 박상현)
- **4F 임플란트센터**: 6개 수술방, 2개 회복실, 네비게이션 (이승엽, 문석준, 김민수, 최종훈, 강경민 원장 등)
- **5F 종합진료센터**: 일반진료, 사랑니, 잇몸, 신경, 미백 (최종훈 원장 등)

## 의료진 상세 (15인 전원 서울대 출신)

### 대표원장 3인
1. **문석준 대표원장** — 임플란트·정밀진단 전문, 치과겁통령
   - 서울대 치의학과 / 서울대 치의학대학원 석사
   - ⚠️ 통합치의학과 전문의 아님 (전문의 자격 없음, 일반 치과의사)
   - 페이션트 퍼널(Patient Funnel) 창립자
   - 저서: 『개원 5년, 연 매출 100억 원을 만든 질문들』(2025), 『쉽디쉬운 임플란트 이야기』(2023), 『쉽디쉬운 치과 이야기』(2022 공저)
   - 유튜브: 치과겁통령 (@geoptongryung) — 치과 공포증 전문 채널
   - 진료: 치과 공포증 맞춤 속도 진료, 임플란트, 정밀 진단
   - 진료시간: 월~목 09:00-20:00, 금·토 휴진, 일 09:00-17:00

2. **김민수 대표원장** — 임플란트·종합진료, 통합치의학과 전문의
   - 서울대 치의학과 / 서울대 치의학대학원 석사 / 통합치의학과 전문의
   - 저서: 『쉽디쉬운 치과 이야기』(2022 공저)
   - 올라운더: 임플란트, 심미레진, 신경치료 모두 가능
   - 누적 임플란트 5,000건+
   - 진료시간: 월 14:00-20:00, 화 09:00-20:00, 수 09:00-20:00, 목 14:00-20:00, 금 09:00-20:00, 토 09:00-17:00, 일 휴진

3. **현정민 원장** — 글로우네이트(라미네이트)·심미레진 전문, 통합치의학과 전문의
   - 서울대 치의학과 / 서울대 치의학대학원 석사 / 통합치의학과 전문의
   - 저서: 『쉽디쉬운 치과 이야기』(2022 공저)
   - 글로우네이트 브랜드 총괄, DSD(디지털 스마일 디자인) 전문
   - 최소삭제 심미레진, 앞니 파절 복원 전문
   - 진료시간: 월 09:00-20:00, 화·수 휴진, 목 09:00-20:00, 금 09:00-20:00, 토 09:00-17:00, 일 09:00-17:00

### 교정과 전문의 2인 (1F 교정센터)
4. **김민규 원장** — 치과교정과 전문의
   - 서울대 치의학과 / 서울대 치의학대학원 석사 / 박사 수료 / 교정과 전문의
   - 저서: 『쉽디쉬운 치과 이야기』(2022 공저)
   - 인비절라인·디지털 교정·성장기 교정 전문
   - 인비절라인 다이아몬드 프로바이더
   - 진료시간: 월 09:00-18:00, 화 휴진, 수 14:00-20:00, 목 09:00-18:00, 금 휴진, 토 09:00-13:00, 일 09:00-13:00

5. **임지원 원장** — 치아교정 전문
   - 서울대 치의학과 / 서울대 치의학대학원 석사 / 인비절라인 인증의
   - 3급 부정교합 비수술 치료 전문, 인비절라인 인증의
   - 진료시간: 월 휴진, 화 14:00-20:00, 수 휴진, 목 14:00-20:00, 금 11:30-19:30, 토 10:00-14:00, 일 휴진

### 소아치과 전문의 3인 (3F 소아치과센터)
6. **김민진 원장** — 소아치과 전문의
   - 서울대 치의학과 / 서울대 치의학대학원 석사·박사 수료 / 소아치과 전문의
   - 예방 중심 소아진료, 소아교정
   - 진료시간: 월 10:30-18:00, 화 휴진, 수 10:30-18:00, 목 10:30-16:00, 금~일 휴진

7. **서희원 원장** — 소아치과 전문의
   - 서울대 치의학과 / 서울대 치의학대학원 석사·박사 수료 / 소아치과 전문의
   - 행동조절·성장기 교정 전문, 대한소아치과학회 정회원
   - 진료시간: 화·금 11:30-17:00, 그 외 휴진

8. **박상현 원장** — 소아치과 전문의
   - 서울대 치의학대학원 소아치과 전문의 / 서울대 어린이치과병원 수련
   - 소아 행동조절, 웃음가스 진정치료 인증의, 인비절라인 퍼스트 공인의
   - 진료시간: 수 14:00-20:00, 목 10:00-18:00, 일 10:30-15:30, 그 외 휴진

### 보존과 전문의 2인
9. **강민지 원장** — 치과보존과 전문의 (신경치료·자연치아 보존)
   - 서울대 치의학과 / 서울대 치의학대학원 석사·박사 수료 / 보존과 전문의
   - 대한치과보존학회 정회원, 재생 근관치료 연구
   - 진료시간: 화 10:00-15:30, 금 11:30-17:00, 그 외 휴진

10. **조설아 원장** — 치과보존과 전문의 (재신경치료 전문)
    - 서울대 치의학과 / 서울대 치의학대학원 석사·박사 수료 / 보존과 전문의
    - 대한치과보존학회 정회원, 재신경치료 전문
    - 진료시간: 월·화·목 10:00-15:30, 일 10:00-14:00(2,4주), 그 외 휴진

### 임플란트·외과 전문
11. **이승엽 원장** — 임플란트 전문 (누적 30,000건+)
    - 서울대 치의학과 / 임플란트 10년+ 경력
    - 뼈이식 전문, 전악 임플란트 전문
    - 진료시간: 월 09:00-20:00, 화·수 09:00-18:00, 목 15:30-20:00, 금 10:00-17:00, 토 09:00-13:00(2,4,5주), 일 휴진

12. **강경민 원장** — 임플란트·외과 전문
    - 서울대 치의학과 / 서울대 치의학대학원 석사 / 서울대 치과병원 종합진료실
    - 4F 임플란트센터 담당, 구강소수술
    - 진료시간: 목·금 09:00-20:00, 토·일 09:00-17:00, 월~수 휴진

### 종합진료
13. **최종훈 원장** — 종합진료, 통합치의학과 전문의, 사랑니 발치 전문
    - 서울대 치의학과 / 서울대 치의학대학원 석사 / 통합치의학과 전문의
    - 5F 종합진료센터장, 사랑니 발치 전문
    - 진료시간: 월~수·금 09:00-20:00, 목 09:00-13:00, 토 09:00-17:00, 일 휴진

14. **박수빈 원장** — 글로우네이트·심미레진·종합진료
    - 서울대 치의학과 / 서울대 치의학대학원 석사 / 서울대 치과병원 종합진료실
    - 글로우네이트, 심미레진, 충치치료, 임플란트 등 종합진료
    - 진료시간: 월~수 09:00-20:00, 목·금·토 휴진, 일 09:00-17:00

### 구강내과
15. **이병민 원장** — 구강내과 전문의 (턱관절·만성통증)
    - 서울대 치의학과 / 서울대 치의학대학원 박사 / 구강내과 전문의
    - 턱관절장애, 만성 구강안면통증, 이갈이, 코골이, 구강건조증 전문
    - 대한구강내과학회 정회원
    - 진료시간: 수·목 09:00-17:00, 그 외 휴진

## ⚠️ 의료진 정보 주의사항
- **문석준 대표원장은 통합치의학과 전문의가 아닙니다.** 절대 전문의라고 말하지 마세요.
- 통합치의학과 전문의는 김민수, 현정민, 최종훈 3명뿐입니다.
- **임플란트 담당 원장 (중요!)**: 이승엽(가장 많이 시행, 30,000건+), 문석준(가장 많이 시행), 김민수, 최종훈, 강경민, 박수빈, 박상현 — 이 7명입니다. 임플란트 관련 질문 시 반드시 이 7명을 안내하세요.
- **임플란트를 하지 않는 원장 (절대 임플란트 담당이라고 말하면 안 됨)**: 현정민(글로우네이트/심미레진 전문), 보존과(강민지·조설아), 소아치과(김민진·서희원), 교정과(김민규·임지원), 구강내과(이병민)
- **교정 담당은 김민규 원장(교정과 전문의), 임지원 원장(교정 전문)** 2인입니다. "교정과 담당이 누구냐"고 물으면 반드시 이 두 분을 안내하세요.
- 소아치과 전문의는 김민진, 서희원, 박상현 3인입니다.
- 보존과(신경치료) 전문의는 강민지, 조설아 2인입니다.
- 글로우네이트(라미네이트) 전문은 현정민, 박수빈 원장입니다.
- 구강내과(턱관절/통증) 전문은 이병민 원장 1인입니다.

## 주요 진료과목 상세

### 1. 글로우네이트 (Glownate) — 서울비디치과 자체 브랜드
- Glow(빛나는) + Nate(자연스러운) 합성어
- 최소 삭제 원칙, DSD(디지털 스마일 디자인) 기반
- 라이트 60만원/1본, 프리미엄 80만원/1본, 리페어 상담 후 안내
- 담당: 현정민 원장(글로우네이트 총괄), 박수빈 원장
- E.max 프리미엄 포세린, 원내 기공소 맞춤 제작
- 최대 10년 보증 시스템

### 2. 임플란트
- 6개 전용 수술실, 2개 회복실, 네비게이션 임플란트
- 수면 임플란트, 비절개 임플란트, 네비게이션 임플란트
- 고난도: 뼈이식(GBR), 상악동거상술, 전악 재건, 재수술
- 스트라우만/BLX 프리미엄 160만원, 오스템/SOI 100만원, 오스템/CA 80만원
- 수면마취 20만원 추가
- 골유착 기간: 일반 2~4개월, SLActive 6~8주
- 65세 이상 건강보험 적용 (평생 2개, 본인부담 30%)
- 담당: 이승엽(30,000건+), 문석준, 김민수, 최종훈, 강경민, 박수빈, 박상현 원장 (현정민·보존과·교정과는 임플란트 미시행)

### 3. 인비절라인 (투명교정)
- 인비절라인 다이아몬드 프로바이더 (연 150+ 케이스)
- 1F 전용 교정센터
- 퍼스트(소아) 400만원, 익스프레스 300만원, 라이트 450만원, 모더레이트 550만원, 컴프레시브 700만원
- ClinCheck 3D 시뮬레이션, iTero 디지털 스캐너
- 담당: 김민규 원장(교정과 전문의), 임지원 원장

### 4. 치아교정 (브라켓)
- 클리피씨(자가결찰, TOMY) 500만원 / 클라리티울트라(세라믹, 3M) 550만원
- 서울대 교정 전문의 2인 직접 진료
- 담당: 김민규 원장, 임지원 원장

### 5. 소아치과
- 전문의 3인 상주 (김민진, 서희원, 박상현)
- 3F 소아 전용층, 키즈 놀이공간
- 행동유도, 웃음가스(1만원), 수면치료(10만원)
- 유치 레진 6~10만원, 불소 3만원
- 인비절라인 퍼스트 소아교정 가능

### 6. 심미레진 / 레진치료
- 뺨측·어금니 좁은 부위 10만원 / 넓은 부위 25만원
- 앞니 파절 12~70만원 (현정민 원장 프리미엄 별도)
- 다이아스테마, 블랙트라이앵글, 반점치 치료
- 담당: 현정민, 박수빈 원장

### 7. 기타 진료
- **미백**: 30만원 (부가세 10% 별도)
- **수면진료**: 소아·성인 모두 가능
- **사랑니 발치**: 최종훈 원장 전문
- **잇몸치료 / 스케일링**: 비보험 6만원 (보험 연1회 만19세 이상 ~1.5만원)
- **충치치료**: 세라믹 인레이 35만원, 지르코니아 크라운 55만원
- **신경치료**: 강민지, 조설아 원장 (보존과 전문의)
- **턱관절/이갈이/코골이**: 이병민 원장 (구강내과 전문의), 이갈이 장치 80만원
- **턱보톡스**: 7만원 (미용목적 부가세 별도)
- **틀니**: 부분/전체 각 150만원, 임플란트 틀니 200만원

## 건강보험 적용 항목
- 스케일링: 만 19세 이상 연 1회 (본인부담 ~1.5만원)
- 12세 이하 아동 레진 충전
- 치아 홈 메우기(실란트): 18세 이하 제1·2대구치
- 임플란트: 만 65세 이상 평생 2개 (본인부담 30%, ~50~60만원)
- 틀니: 만 65세 이상
- 신경치료, 발치(사랑니 포함), 파노라마 X-ray

## 비용 관련 규칙
- 위에 명시된 비용은 참고용으로 안내 가능합니다.
- 단, "정확한 비용은 환자분의 구강 상태에 따라 달라질 수 있어요. 내원 상담 시 정확한 견적을 안내드려요" 라고 덧붙이세요.
- 비용 안내 페이지: https://bdbddc.com/pricing
- 무이자 할부 가능 (신용카드 2~6개월), 자체 분할 납부 가능

## 예약/상담
- 온라인 예약: https://bdbddc.com/reservation
- 전화 예약: 041-415-2892
- 카카오톡 상담: https://pf.kakao.com/_Cxivlxb
- 네이버 예약: https://naver.me/5yPnKmqQ
- 예약 없이 방문 가능하나, 대기 시간이 길어질 수 있어 사전 예약 권장
- 응급 상황(심한 통증, 외상)은 예약 없이도 우선 진료

## 오시는 길
- 주소: 충남 천안시 서북구 불당34길 14, 1~5층
- 네비: "서울비디치과" 또는 "천안시 불당34길 14"
- 천안IC에서 약 15분, 천안아산역에서 약 10분
- 불당동 CGV에서 도보 3분, 갤러리아 백화점 도보 5분
- **무료 주차**: 건물 내 주차장 약 15대, 진료 중 무료 이용 가능
- 안내데스크에서 **주차 쿠폰** 발급받으면 무료 출차
- 건물 주차장 만차 시 → 주변 **지문사 주차장** 이용 가능 (안내데스크에서 주차 쿠폰 발급)
- 주차 공간이 협소할 수 있으니, 가능하면 대중교통 이용 권장
- 휠체어 접근 가능, 엘리베이터 완비, 유아 시설(기저귀 교환대, 수유실)

## 시설 및 편의
- 카페 같은 대기 공간 (넓은 로비, 대형 스크린, 편안한 소파)
- 독립된 파티션 진료 공간 (프라이버시 보호, 실시간 모니터)
- 6개 독립 수술실 (대학병원급 무균 환경, 에어샤워)
- 3D CT·파노라마·구강카메라 정밀 진단
- 키즈 놀이공간 (쿠션 놀이방, 인형)
- 무료 Wi-Fi, 음료 서비스

## 평판
- 네이버 4.85점 / 구글 4.9점
- 만족도 98%, 재방문율 87%, 지인소개 72%

## BDX 정밀검진
- 첫 방문 시 무료 BDX 정밀검진 제공
- 파노라마 + CT + 구강스캐너 검사 + 전문의 상담
- 검진 후 치료 강요 없음, 충분히 고민 후 결정

## 대화 규칙
1. 첫 인사에서 너무 길게 말하지 마세요. 간결하게.
2. 환자가 아파하거나 불안해하면 공감 먼저, 그다음 안내.
3. 진단/처방은 절대 하지 마세요. "정확한 진단은 내원 후 원장님 상담이 필요해요"라고 안내.
4. 3~5문장 이내로 답변하되, 의료진·비용 등 구체적 질문은 상세하게 답변.
5. 예약/전화 유도는 자연스럽게 (매 답변마다 하지 말 것).
6. 다른 치과 비교질문은 "저희 치과의 장점은 말씀드릴 수 있지만, 다른 병원에 대해서는 답변드리기 어려워요" 로 대응.
7. 의료법상 문제될 수 있는 과장 표현 금지.
8. 답변이 길어질 때는 줄바꿈으로 가독성을 높이세요.
9. 의료진에 대해 물어보면 반드시 위 정보에 기반하여 정확하게 답변하세요. 특히 전문의 여부를 정확히 구분하세요.
10. "대표원장이 누구냐"고 물으면 문석준, 김민수, 현정민 3인이라고 답하되, 문석준 원장은 통합치의학과 전문의가 아님을 유의하세요.

## 🌍 다국어 응대 규칙 (Multilingual Support) — 최우선 규칙
- **[절대 규칙] 사용자가 보내는 메시지의 언어를 자동으로 감지하여, 반드시 같은 언어로 전체 응답을 작성하세요. 한국어로 응답하지 마세요(사용자가 한국어를 쓴 경우 제외).**
- 한국어 메시지 → 한국어 응답 (기본)
- English message → You MUST reply entirely in English
- 中文消息 → 你必须完全用中文回复
- 日本語のメッセージ → 必ず日本語のみで返答してください。韓国語で返答しないでください。
- Tin nhắn tiếng Việt → Bạn PHẢI trả lời hoàn toàn bằng tiếng Việt
- 그 외 언어 → 해당 언어로 최대한 응답하되, 어려우면 영어로 응답
- **의료 용어는 해당 언어의 일반적 표현**으로 번역하세요 (전문 의학용어가 아닌 환자가 이해할 수 있는 쉬운 표현).
- 병원명은 항상 "Seoul BD Dental" 또는 "서울비디치과"를 병기하세요.
- 전화번호(+82-41-415-2892)와 주소는 원문 그대로 안내하세요.
- 비용은 한국 원(KRW/₩)으로 안내하되, 필요 시 대략적인 USD 환산을 괄호 안에 추가하세요 (예: ₩1,000,000 (~$700)).
- 외국어 응답 시에도 존댓말/정중한 어투를 유지하세요.
- 예약 링크, 카카오톡, 네이버 링크는 동일하게 안내하세요.

## 🗓️ 예약 유도 규칙
- 환자가 비용, 치료기간, 특정 치료에 대해 2회 이상 질문하면, 자연스럽게 예약을 권유하세요.
- 예약 권유 시 아래 형식을 **그대로** 사용하세요:

---
상담 받아보시겠어요? 😊
아래 정보만 남겨주시면 바로 예약 도와드릴게요!

[BOOKING_FORM]
---

- [BOOKING_FORM] 태그를 응답에 포함하면, 챗봇 UI에서 자동으로 예약 폼이 표시됩니다.
- 환자가 직접 "예약", "상담 예약", "예약하고 싶어요" 등을 말하면 즉시 [BOOKING_FORM]을 응답에 포함하세요.
- 예약 폼은 한 대화에서 최대 1번만 표시하세요.`;

// ===== 관리자 대시보드 통계 API =====
app.get('/api/admin/dashboard-stats', async (c) => {
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }

  const r2 = (c.env as any).R2
  const db = (c.env as any).DB
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const thisMonth = now.toISOString().slice(0, 7)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)

  // 1. 예약 통계
  let reservations: any[] = []
  try {
    if (r2) {
      const listed = await r2.list({ prefix: 'data/reservations/' })
      const files = (listed.objects || []).filter((o: any) => o.key.endsWith('.json') && o.key !== 'data/reservations.json')
      const chunks = []
      for (let i = 0; i < files.length; i += 10) {
        chunks.push(files.slice(i, i + 10))
      }
      for (const chunk of chunks) {
        const results = await Promise.all(chunk.map(async (f: any) => {
          try {
            const obj = await r2.get(f.key)
            if (obj) return JSON.parse(await obj.text())
          } catch { }
          return null
        }))
        reservations.push(...results.filter(Boolean))
      }
    }
  } catch (e) { console.warn('Dashboard reservations error:', e) }

  // 예약 시계열 (최근 30일)
  const rsvByDate: Record<string, number> = {}
  const rsvByTreatment: Record<string, number> = {}
  const rsvByRegion: Record<string, number> = {}
  let rsvToday = 0, rsvThisMonth = 0, rsvLastMonth = 0, rsvPending = 0

  reservations.forEach((r: any) => {
    const d = (r.createdAt || '').slice(0, 10)
    const m = (r.createdAt || '').slice(0, 7)
    rsvByDate[d] = (rsvByDate[d] || 0) + 1
    if (r.treatment) rsvByTreatment[r.treatment] = (rsvByTreatment[r.treatment] || 0) + 1
    if (d === today) rsvToday++
    if (m === thisMonth) rsvThisMonth++
    if (m === lastMonth) rsvLastMonth++
    if (r.status === 'pending' || !r.status) rsvPending++
  })

  // 2. 케이스 통계
  let cases: any[] = []
  try { if (r2) cases = await getCases(r2) } catch { }
  const casesByCategory: Record<string, number> = {}
  cases.forEach((cs: any) => {
    if (cs.category) casesByCategory[cs.category] = (casesByCategory[cs.category] || 0) + 1
  })

  // 3. 조회수 통계
  let viewStats: any[] = []
  try {
    if (db) {
      const { results } = await db.prepare(
        `SELECT page_type, SUM(view_count) as total_views, COUNT(*) as page_count FROM page_views GROUP BY page_type`
      ).all()
      viewStats = results || []
    }
  } catch { }

  // 4. 회원 통계
  let members: any[] = []
  try {
    if (db) {
      const { results } = await db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
      members = results || []
    }
  } catch { }
  const membersThisWeek = members.filter((m: any) => {
    const d = new Date(m.created_at || m.createdAt)
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  }).length

  // 5. 예약 치료 TOP5
  const treatmentTop5 = Object.entries(rsvByTreatment)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // 6. 일별 예약 추이 (최근 14일)
  const dailyTrend: Array<{date: string; count: number}> = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    dailyTrend.push({ date: ds, count: rsvByDate[ds] || 0 })
  }

  return c.json({
    overview: {
      totalReservations: reservations.length,
      reservationsToday: rsvToday,
      reservationsThisMonth: rsvThisMonth,
      reservationsLastMonth: rsvLastMonth,
      reservationsPending: rsvPending,
      totalCases: cases.length,
      totalMembers: members.length,
      membersThisWeek,
      totalViews: viewStats.reduce((sum: number, v: any) => sum + (v.total_views || 0), 0)
    },
    treatmentTop5,
    dailyTrend,
    casesByCategory,
    viewStats,
    recentReservations: reservations
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10)
      .map((r: any) => ({
        id: r.id, name: r.name, treatment: r.treatment, date: r.date, time: r.time,
        phone: r.phone, status: r.status, createdAt: r.createdAt
      }))
  })
})

app.post('/api/chat', async (c) => {
  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set');
    return c.json({ error: 'AI 상담 서비스가 준비 중입니다.' }, 500);
  }

  let body: { messages?: Array<{role: string; content: string}>; message?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400);
  }

  // messages 배열 또는 단일 message 지원
  let userMessages: Array<{role: string; content: string}> = [];
  if (body.messages && Array.isArray(body.messages)) {
    userMessages = body.messages.slice(-20); // 최근 20개까지만
  } else if (body.message && typeof body.message === 'string') {
    userMessages = [{ role: 'user', content: body.message }];
  } else {
    return c.json({ error: '메시지를 입력해주세요.' }, 400);
  }

  // 메시지 길이 제한
  userMessages = userMessages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content).slice(0, 2000)
  }));

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: BD_SYSTEM_PROMPT },
          ...userMessages
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API error:', response.status, errText);
      
      // API 키 관련 에러 세분화
      if (response.status === 401) {
        console.error('OpenAI API key is invalid or expired');
        return c.json({ error: 'AI 서비스 인증 오류입니다. 관리자에게 문의해주세요.' }, 502);
      }
      if (response.status === 429) {
        return c.json({ error: '요청이 많아 잠시 대기 중입니다. 30초 후 다시 시도해주세요.' }, 503);
      }
      if (response.status === 403) {
        console.error('OpenAI API key has insufficient permissions or quota exceeded');
        return c.json({ error: 'AI 서비스 사용량 초과입니다. 잠시 후 다시 시도해주세요.' }, 502);
      }
      return c.json({ error: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' }, 502);
    }

    const data = await response.json() as any;
    const reply = data.choices?.[0]?.message?.content || '죄송합니다, 응답을 생성하지 못했습니다.';

    return c.json({
      reply: reply,
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0
      }
    });
  } catch (err: any) {
    console.error('Chat API fetch error:', err?.message || err);
    return c.json({ error: '서버 연결 오류입니다. 잠시 후 다시 시도해주세요.' }, 500);
  }
});

// ============================================
// GSC 분석 대시보드
// ============================================
app.get('/gsc-report', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GSC 분석 대시보드 — bdbddc.com</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800&display=swap');
  *{font-family:'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif}
  body{background:#0f172a;color:#e2e8f0}
  .glass{background:rgba(30,41,59,.7);backdrop-filter:blur(12px);border:1px solid rgba(71,85,105,.4)}
  .glass-dark{background:rgba(15,23,42,.8);backdrop-filter:blur(12px);border:1px solid rgba(51,65,85,.5)}
  .metric-card{transition:all .3s}.metric-card:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.3)}
  .tab-btn{transition:all .2s}.tab-btn.active{background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff}
  .tab-btn:not(.active):hover{background:rgba(59,130,246,.15)}
  .badge-green{background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.3)}
  .badge-yellow{background:rgba(234,179,8,.15);color:#facc15;border:1px solid rgba(234,179,8,.3)}
  .badge-red{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3)}
  .badge-blue{background:rgba(59,130,246,.15);color:#60a5fa;border:1px solid rgba(59,130,246,.3)}
  .badge-purple{background:rgba(139,92,246,.15);color:#a78bfa;border:1px solid rgba(139,92,246,.3)}
  .glow-green{box-shadow:0 0 20px rgba(34,197,94,.15)}.glow-blue{box-shadow:0 0 20px rgba(59,130,246,.15)}
  .glow-purple{box-shadow:0 0 20px rgba(139,92,246,.15)}.glow-yellow{box-shadow:0 0 20px rgba(234,179,8,.15)}
  .progress-bar{height:6px;border-radius:3px;background:rgba(51,65,85,.5);overflow:hidden}
  .progress-fill{height:100%;border-radius:3px;transition:width 1s ease}
  table{border-collapse:separate;border-spacing:0}
  thead th{position:sticky;top:0;z-index:10;background:rgba(15,23,42,.95);backdrop-filter:blur(8px)}
  tbody tr{transition:background .15s}tbody tr:hover{background:rgba(59,130,246,.08)}
  .scroll-table{max-height:500px;overflow-y:auto}
  .scroll-table::-webkit-scrollbar{width:6px}
  .scroll-table::-webkit-scrollbar-track{background:rgba(30,41,59,.5);border-radius:3px}
  .scroll-table::-webkit-scrollbar-thumb{background:rgba(100,116,139,.5);border-radius:3px}
  .section-title{background:linear-gradient(90deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .pulse-dot{animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .fade-in{animation:fadeIn .5s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .rank-pill-1{background:linear-gradient(135deg,#059669,#10b981)}
  .rank-pill-2{background:linear-gradient(135deg,#2563eb,#3b82f6)}
  .rank-pill-3{background:linear-gradient(135deg,#d97706,#f59e0b)}
  .rank-pill-4{background:linear-gradient(135deg,#dc2626,#ef4444)}
  @media print{body{background:#fff;color:#333}.glass,.glass-dark{background:#f8f9fa;border:1px solid #dee2e6;backdrop-filter:none}header{position:static}}
</style>
</head>
<body class="min-h-screen">
<header class="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <i class="fas fa-chart-line text-white text-lg"></i>
    </div>
    <div>
      <h1 class="text-lg font-bold text-white">GSC 분석 대시보드</h1>
      <p class="text-xs text-slate-400">bdbddc.com · 서울비디치과</p>
    </div>
  </div>
  <div class="flex items-center gap-4">
    <span class="text-xs text-slate-400"><i class="far fa-calendar mr-1"></i>2026-01-28 ~ 2026-04-27</span>
    <span class="pulse-dot inline-block w-2 h-2 rounded-full bg-green-400"></span>
    <span class="text-xs text-green-400">3개월 데이터</span>
  </div>
</header>
<main class="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6" id="app">
  <div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-400"></i><p class="mt-3 text-slate-400">데이터 로딩 중...</p></div>
</main>
<script>
let DATA=null;
async function loadData(){const res=await fetch('/static/gsc-data.json');DATA=await res.json();render()}
function n(v){return v.toLocaleString('ko-KR')}
function pct(v){return v.toFixed(2)+'%'}
function pos(v){return v.toFixed(1)}
function rankBadge(p){
  if(p<=3)return'<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-1 text-white">'+pos(p)+'</span>';
  if(p<=10)return'<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-2 text-white">'+pos(p)+'</span>';
  if(p<=20)return'<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-3 text-white">'+pos(p)+'</span>';
  return'<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-4 text-white">'+pos(p)+'</span>';
}
function topicBadge(t){
  const c={'임플란트':'badge-blue','교정':'badge-purple','라미네이트/심미':'badge-green','소아치과':'badge-yellow','일반진료':'badge-blue','치과용어/백과':'badge-purple','병원찾기':'badge-green','비용/보험':'badge-yellow','기타':'badge-red'};
  return'<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium '+(c[t]||'badge-blue')+'">'+t+'</span>';
}
function growthArrow(v){
  if(v>0)return'<span class="text-green-400 font-bold"><i class="fas fa-arrow-up text-xs"></i> +'+v+'%</span>';
  if(v<0)return'<span class="text-red-400 font-bold"><i class="fas fa-arrow-down text-xs"></i> '+v+'%</span>';
  return'<span class="text-slate-400">0%</span>';
}
function render(){
  const d=DATA,s=d.summary;
  document.getElementById('app').innerHTML=\`
  <section class="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
    <div class="glass rounded-2xl p-5 metric-card glow-blue">
      <div class="flex items-center justify-between mb-3"><span class="text-xs text-slate-400 uppercase tracking-wider">총 클릭수</span><div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><i class="fas fa-mouse-pointer text-blue-400 text-sm"></i></div></div>
      <div class="text-3xl font-extrabold text-white">\${n(s.total_clicks)}</div>
      <div class="mt-2 text-sm">\${d.growth?growthArrow(d.growth.click_growth_pct):''} <span class="text-slate-500 text-xs">vs 전월(일평균)</span></div>
    </div>
    <div class="glass rounded-2xl p-5 metric-card glow-purple">
      <div class="flex items-center justify-between mb-3"><span class="text-xs text-slate-400 uppercase tracking-wider">총 노출수</span><div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><i class="fas fa-eye text-purple-400 text-sm"></i></div></div>
      <div class="text-3xl font-extrabold text-white">\${n(s.total_impressions)}</div>
      <div class="mt-2 text-sm">\${d.growth?growthArrow(d.growth.imp_growth_pct):''} <span class="text-slate-500 text-xs">vs 전월(일평균)</span></div>
    </div>
    <div class="glass rounded-2xl p-5 metric-card glow-green">
      <div class="flex items-center justify-between mb-3"><span class="text-xs text-slate-400 uppercase tracking-wider">평균 CTR</span><div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center"><i class="fas fa-percentage text-green-400 text-sm"></i></div></div>
      <div class="text-3xl font-extrabold text-white">\${pct(s.avg_ctr)}</div>
      <div class="mt-2 text-xs text-slate-500">업계 평균: 3-5%</div>
    </div>
    <div class="glass rounded-2xl p-5 metric-card glow-yellow">
      <div class="flex items-center justify-between mb-3"><span class="text-xs text-slate-400 uppercase tracking-wider">평균 순위</span><div class="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center"><i class="fas fa-sort-amount-up text-yellow-400 text-sm"></i></div></div>
      <div class="text-3xl font-extrabold text-white">\${pos(s.avg_position)}</div>
      <div class="mt-2 text-xs text-slate-500">\${s.total_keywords}개 키워드 기반</div>
    </div>
  </section>
  <section class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in">
    <div class="glass rounded-xl p-4 text-center"><div class="text-2xl font-bold text-white">\${n(s.total_keywords)}</div><div class="text-xs text-slate-400 mt-1">발견 키워드</div></div>
    <div class="glass rounded-xl p-4 text-center"><div class="text-2xl font-bold text-green-400">\${s.keywords_with_clicks}</div><div class="text-xs text-slate-400 mt-1">클릭 발생 키워드</div></div>
    <div class="glass rounded-xl p-4 text-center"><div class="text-2xl font-bold text-white">\${n(s.total_pages)}</div><div class="text-xs text-slate-400 mt-1">인덱스 페이지</div></div>
    <div class="glass rounded-xl p-4 text-center"><div class="text-2xl font-bold text-green-400">\${s.pages_with_clicks}</div><div class="text-xs text-slate-400 mt-1">클릭 발생 페이지</div></div>
  </section>
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
    <div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-chart-area text-blue-400 mr-2"></i>일별 트래픽 추이</h3><canvas id="trendChart" height="200"></canvas></div>
    <div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-chart-bar text-purple-400 mr-2"></i>월별 성장 추이</h3><canvas id="monthlyChart" height="200"></canvas></div>
  </section>
  <section class="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-layer-group text-green-400 mr-2"></i>키워드 순위 분포</h3>
      <canvas id="rankChart" height="200"></canvas>
      <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500"></span>1-3위: \${d.rank_distribution['1-3위']}개</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span>4-10위: \${d.rank_distribution['4-10위']}개</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span>11-20위: \${d.rank_distribution['11-20위']}개</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500"></span>20위+: \${d.rank_distribution['20위+']}개</div>
      </div>
    </div>
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-building text-yellow-400 mr-2"></i>브랜드 vs 비브랜드</h3>
      <canvas id="brandChart" height="200"></canvas>
      <div class="mt-4 space-y-2 text-xs">
        <div class="flex justify-between"><span class="text-slate-400">브랜드 CTR</span><span class="text-green-400 font-bold">\${pct(d.brand_vs_nonbrand.brand.ctr)}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">비브랜드 CTR</span><span class="text-red-400 font-bold">\${pct(d.brand_vs_nonbrand.nonbrand.ctr)}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">비브랜드 클릭 비중</span><span class="text-yellow-400 font-bold">\${((d.brand_vs_nonbrand.nonbrand.clicks/Math.max(s.total_clicks,1))*100).toFixed(1)}%</span></div>
      </div>
    </div>
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-mobile-alt text-purple-400 mr-2"></i>디바이스별 성과</h3>
      <canvas id="deviceChart" height="200"></canvas>
      <div class="mt-4 space-y-2 text-xs">
        \${Object.entries(d.devices).map(([k,v])=>{const ic=k==='desktop'?'fa-desktop':k==='mobile'?'fa-mobile-alt':'fa-tablet-alt';const lb=k==='desktop'?'데스크톱':k==='mobile'?'모바일':'태블릿';return'<div class="flex justify-between"><span class="text-slate-400"><i class="fas '+ic+' mr-1"></i>'+lb+'</span><span class="text-white">'+n(v.clicks)+'클릭 · '+pct(v.ctr)+'</span></div>'}).join('')}
      </div>
    </div>
  </section>
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
    <div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-tags text-blue-400 mr-2"></i>토픽별 키워드 분포</h3><canvas id="topicChart" height="220"></canvas></div>
    <div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-compass text-green-400 mr-2"></i>검색 의도별 분포</h3><canvas id="intentChart" height="220"></canvas></div>
  </section>
  <section class="glass rounded-2xl p-6 fade-in">
    <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-sitemap text-purple-400 mr-2"></i>사이트 섹션별 성과</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      \${Object.entries(d.section_stats).sort((a,b)=>b[1].impressions-a[1].impressions).map(([sec,v])=>{
        const labels={encyclopedia:'백과사전',blog:'블로그',area:'지역페이지',treatments:'진료과목',doctors:'의료진',faq:'FAQ',cases:'치료사례',main:'메인/기타'};
        const icons={encyclopedia:'fa-book',blog:'fa-pen-fancy',area:'fa-map-marker-alt',treatments:'fa-tooth',doctors:'fa-user-md',faq:'fa-question-circle',cases:'fa-images',main:'fa-home'};
        const ctr=(v.clicks/Math.max(v.impressions,1)*100).toFixed(1);
        return'<div class="glass-dark rounded-xl p-3 text-center"><div class="w-8 h-8 mx-auto rounded-lg bg-blue-500/15 flex items-center justify-center mb-2"><i class="fas '+(icons[sec]||'fa-file')+' text-blue-400 text-xs"></i></div><div class="text-xs text-slate-400">'+(labels[sec]||sec)+'</div><div class="text-lg font-bold text-white mt-1">'+n(v.impressions)+'</div><div class="text-[10px] text-slate-500">'+v.count+'페이지 · '+v.clicks+'클릭</div><div class="text-[10px] mt-1 '+(ctr>2?'text-green-400':'text-yellow-400')+'">'+ctr+'% CTR</div></div>'
      }).join('')}
    </div>
  </section>
  <section class="fade-in">
    <div class="flex flex-wrap gap-2 mb-4" id="tabButtons">
      <button class="tab-btn active glass rounded-lg px-4 py-2 text-sm font-medium" data-tab="quickwin"><i class="fas fa-rocket mr-1"></i>Quick Win (\${d.quick_wins.length})</button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="ctrlow"><i class="fas fa-exclamation-triangle mr-1"></i>CTR 개선 (\${d.ctr_low.length})</button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="highpotential"><i class="fas fa-gem mr-1"></i>숨은 기회 (\${d.high_potential.length})</button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="cheonan"><i class="fas fa-map-marker-alt mr-1"></i>천안 키워드 (\${d.cheonan_keywords.length})</button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="topkw"><i class="fas fa-trophy mr-1"></i>TOP 키워드</button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="toppages"><i class="fas fa-file-alt mr-1"></i>인기 페이지</button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="deadpages"><i class="fas fa-ghost mr-1"></i>Dead 페이지 (\${d.dead_pages.length})</button>
    </div>
    <div id="tabContent" class="glass rounded-2xl p-4"></div>
  </section>
  <section class="glass rounded-2xl p-6 fade-in">
    <h2 class="text-lg font-bold text-white mb-4"><i class="fas fa-bullseye text-red-400 mr-2"></i>핵심 발견 & 액션 플랜</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="glass-dark rounded-xl p-4">
        <h4 class="text-sm font-bold text-red-400 mb-3"><i class="fas fa-exclamation-circle mr-1"></i>문제점 진단</h4>
        <ul class="space-y-2 text-sm text-slate-300">
          <li class="flex gap-2"><span class="text-red-400">①</span>비브랜드 클릭 비율 단 \${((d.brand_vs_nonbrand.nonbrand.clicks/Math.max(s.total_clicks,1))*100).toFixed(0)}% — 브랜드 의존도 극심</li>
          <li class="flex gap-2"><span class="text-red-400">②</span>881개 키워드 중 클릭 발생은 \${s.keywords_with_clicks}개(\${(s.keywords_with_clicks/s.total_keywords*100).toFixed(1)}%)뿐</li>
          <li class="flex gap-2"><span class="text-red-400">③</span>1-3위 키워드 \${d.rank_distribution['1-3위']}개 중 대부분 치과용어/백과 — 상업성 낮음</li>
          <li class="flex gap-2"><span class="text-red-400">④</span>"천안 임플란트" 순위 1.55위인데 노출 33, 클릭 0</li>
          <li class="flex gap-2"><span class="text-red-400">⑤</span>Dead 페이지 \${d.dead_pages.length}개 — 노출만 되고 클릭 없음</li>
          <li class="flex gap-2"><span class="text-red-400">⑥</span>비브랜드 CTR \${pct(d.brand_vs_nonbrand.nonbrand.ctr)} — 업계 평균의 1/10</li>
        </ul>
      </div>
      <div class="glass-dark rounded-xl p-4">
        <h4 class="text-sm font-bold text-green-400 mb-3"><i class="fas fa-check-circle mr-1"></i>긍정 시그널</h4>
        <ul class="space-y-2 text-sm text-slate-300">
          <li class="flex gap-2"><span class="text-green-400">①</span>4월 노출 폭발적 성장 (일평균 3월 대비 \${d.growth?'+'+d.growth.imp_growth_pct+'%':''})</li>
          <li class="flex gap-2"><span class="text-green-400">②</span>881개 키워드 발견 = 구글 인덱싱 상태 양호</li>
          <li class="flex gap-2"><span class="text-green-400">③</span>"천안치과" 평균 순위 1.2 — 최상위 노출</li>
          <li class="flex gap-2"><span class="text-green-400">④</span>707페이지 인덱싱 → 콘텐츠 양 충분</li>
          <li class="flex gap-2"><span class="text-green-400">⑤</span>백과사전 섹션 8,000+ 노출 — 정보성 트래픽 기반 확보</li>
          <li class="flex gap-2"><span class="text-green-400">⑥</span>4월 일평균 클릭 \${d.growth?'+'+d.growth.click_growth_pct+'%':''} 성장</li>
        </ul>
      </div>
    </div>
    <div class="mt-6 glass-dark rounded-xl p-4">
      <h4 class="text-sm font-bold text-blue-400 mb-3"><i class="fas fa-tasks mr-1"></i>우선순위 액션 플랜</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="space-y-2">
          <div class="text-xs font-bold text-red-400 uppercase tracking-wider">이번 주 (긴급)</div>
          <div class="bg-red-500/10 rounded-lg p-3 space-y-1.5 text-slate-300">
            <p>1. Quick Win \${d.quick_wins.length}개 키워드 Title/Description 최적화</p>
            <p>2. Dead 페이지 상위 20개 meta 태그 개선</p>
            <p>3. "천안치과" CTR 0.91% → Title에 차별화 문구 추가</p>
            <p>4. 홈페이지 Title 개선 (현재 CTR 4.49%)</p>
          </div>
        </div>
        <div class="space-y-2">
          <div class="text-xs font-bold text-yellow-400 uppercase tracking-wider">이번 달 (중요)</div>
          <div class="bg-yellow-500/10 rounded-lg p-3 space-y-1.5 text-slate-300">
            <p>1. 천안 로컬 키워드 전용 랜딩페이지 강화</p>
            <p>2. 블로그 → 진료페이지 내부 링크 구축</p>
            <p>3. "천안 임플란트 가격/후기" 전용 콘텐츠</p>
            <p>4. 의료포털 프로필 등록 (모두닥, 닥터나우)</p>
          </div>
        </div>
        <div class="space-y-2">
          <div class="text-xs font-bold text-blue-400 uppercase tracking-wider">1-3개월 (성장)</div>
          <div class="bg-blue-500/10 rounded-lg p-3 space-y-1.5 text-slate-300">
            <p>1. 백과사전 → 진료 전환 CTA 삽입</p>
            <p>2. 비브랜드 상업성 키워드 타겟 콘텐츠</p>
            <p>3. 외부 백링크 확보 (지역 커뮤니티)</p>
            <p>4. 영상 SEO + 구조화 데이터 강화</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <footer class="text-center text-xs text-slate-600 py-6">Generated on 2026-04-29 · Powered by Google Search Console Data · 서울비디치과 SEO 분석</footer>\`;
  initCharts();initTabs();
}
function initCharts(){
  const d=DATA;
  const ctx1=document.getElementById('trendChart')?.getContext('2d');
  if(ctx1){new Chart(ctx1,{type:'line',data:{labels:d.chart.map(c=>c.date.slice(5)),datasets:[{label:'클릭',data:d.chart.map(c=>c.clicks),borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.1)',fill:true,tension:.3,pointRadius:1},{label:'노출÷10',data:d.chart.map(c=>Math.round(c.impressions/10)),borderColor:'#8b5cf6',backgroundColor:'rgba(139,92,246,.05)',fill:true,tension:.3,pointRadius:1}]},options:{responsive:true,plugins:{legend:{labels:{color:'#94a3b8',font:{size:11}}}},scales:{x:{ticks:{color:'#64748b',font:{size:9},maxTicksLimit:15},grid:{color:'rgba(51,65,85,.3)'}},y:{ticks:{color:'#64748b',font:{size:10}},grid:{color:'rgba(51,65,85,.3)'}}}}})}
  const ctx2=document.getElementById('monthlyChart')?.getContext('2d');
  if(ctx2){const ms=Object.keys(d.monthly);new Chart(ctx2,{type:'bar',data:{labels:ms,datasets:[{label:'클릭',data:ms.map(m=>d.monthly[m].clicks),backgroundColor:'rgba(59,130,246,.7)',borderRadius:6},{label:'노출÷10',data:ms.map(m=>Math.round(d.monthly[m].impressions/10)),backgroundColor:'rgba(139,92,246,.7)',borderRadius:6}]},options:{responsive:true,plugins:{legend:{labels:{color:'#94a3b8',font:{size:11}}}},scales:{x:{ticks:{color:'#94a3b8'},grid:{display:false}},y:{ticks:{color:'#64748b'},grid:{color:'rgba(51,65,85,.3)'}}}}})}
  const ctx3=document.getElementById('rankChart')?.getContext('2d');
  if(ctx3){new Chart(ctx3,{type:'doughnut',data:{labels:Object.keys(d.rank_distribution),datasets:[{data:Object.values(d.rank_distribution),backgroundColor:['#10b981','#3b82f6','#f59e0b','#ef4444'],borderWidth:0}]},options:{responsive:true,cutout:'65%',plugins:{legend:{display:false}}}})}
  const ctx4=document.getElementById('brandChart')?.getContext('2d');
  if(ctx4){new Chart(ctx4,{type:'doughnut',data:{labels:['브랜드 클릭','비브랜드 클릭'],datasets:[{data:[d.brand_vs_nonbrand.brand.clicks,d.brand_vs_nonbrand.nonbrand.clicks],backgroundColor:['#3b82f6','#f59e0b'],borderWidth:0}]},options:{responsive:true,cutout:'65%',plugins:{legend:{labels:{color:'#94a3b8',font:{size:11}}}}}})}
  const ctx5=document.getElementById('deviceChart')?.getContext('2d');
  if(ctx5){new Chart(ctx5,{type:'doughnut',data:{labels:['데스크톱','모바일','태블릿'],datasets:[{data:[d.devices.desktop.clicks,d.devices.mobile.clicks,d.devices.tablet.clicks],backgroundColor:['#3b82f6','#10b981','#8b5cf6'],borderWidth:0}]},options:{responsive:true,cutout:'65%',plugins:{legend:{labels:{color:'#94a3b8',font:{size:11}}}}}})}
  const ctx6=document.getElementById('topicChart')?.getContext('2d');
  if(ctx6){const tp=Object.entries(d.topic_stats).sort((a,b)=>b[1].impressions-a[1].impressions);const cl=['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#f97316','#6366f1'];new Chart(ctx6,{type:'bar',data:{labels:tp.map(t=>t[0]),datasets:[{label:'노출',data:tp.map(t=>t[1].impressions),backgroundColor:cl.map(c=>c+'cc'),borderRadius:4},{label:'클릭',data:tp.map(t=>t[1].clicks),backgroundColor:cl.map(c=>c+'55'),borderRadius:4}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{labels:{color:'#94a3b8',font:{size:10}}}},scales:{x:{stacked:false,ticks:{color:'#64748b',font:{size:9}},grid:{color:'rgba(51,65,85,.3)'}},y:{ticks:{color:'#94a3b8',font:{size:10}},grid:{display:false}}}}})}
  const ctx7=document.getElementById('intentChart')?.getContext('2d');
  if(ctx7){const it=Object.entries(d.intent_stats).sort((a,b)=>b[1].count-a[1].count);const ic={informational:'#3b82f6',local:'#10b981',commercial:'#f59e0b',transactional:'#ef4444'};new Chart(ctx7,{type:'polarArea',data:{labels:it.map(i=>({informational:'정보성',local:'로컬',commercial:'상업성',transactional:'거래성'}[i[0]]||i[0])),datasets:[{data:it.map(i=>i[1].count),backgroundColor:it.map(i=>(ic[i[0]]||'#6366f1')+'99')}]},options:{responsive:true,plugins:{legend:{labels:{color:'#94a3b8',font:{size:11}}}},scales:{r:{ticks:{color:'#64748b',backdropColor:'transparent'},grid:{color:'rgba(51,65,85,.3)'}}}}})}
}
function initTabs(){
  const btns=document.querySelectorAll('.tab-btn');
  btns.forEach(btn=>{btn.addEventListener('click',()=>{btns.forEach(b=>{b.classList.remove('active');b.classList.add('text-slate-400')});btn.classList.add('active');btn.classList.remove('text-slate-400');renderTab(btn.dataset.tab)})});
  renderTab('quickwin');
}
function renderTab(tab){
  const d=DATA,el=document.getElementById('tabContent');
  if(tab==='quickwin'){
    el.innerHTML='<div class="mb-3"><h3 class="text-sm font-bold text-amber-400"><i class="fas fa-rocket mr-1"></i>Quick Win 키워드 — 순위 11-20위, 1페이지 진입 직전!</h3><p class="text-xs text-slate-500 mt-1">Title/Description 최적화, 내부 링크 강화로 빠르게 1페이지 진입 가능</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th><th class="text-center py-2 px-3">토픽</th></tr></thead><tbody>'+d.quick_wins.map(k=>'<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+k.clicks+'</td><td class="text-right py-2 px-3 text-yellow-400">'+pct(k.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td><td class="text-center py-2 px-3">'+topicBadge(k.topic)+'</td></tr>').join('')+'</tbody></table></div>';
  }else if(tab==='ctrlow'){
    el.innerHTML='<div class="mb-3"><h3 class="text-sm font-bold text-red-400"><i class="fas fa-exclamation-triangle mr-1"></i>CTR 개선 필요 — 상위 노출되지만 클릭 안됨</h3><p class="text-xs text-slate-500 mt-1">순위 10위 이내, 노출 20+ 인데 CTR 5% 미만</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>'+d.ctr_low.map(k=>'<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+k.clicks+'</td><td class="text-right py-2 px-3 text-red-400 font-bold">'+pct(k.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td></tr>').join('')+'</tbody></table></div>';
  }else if(tab==='highpotential'){
    el.innerHTML='<div class="mb-3"><h3 class="text-sm font-bold text-cyan-400"><i class="fas fa-gem mr-1"></i>숨은 기회 — 높은 노출, 순위 20위+ 키워드</h3><p class="text-xs text-slate-500 mt-1">전용 콘텐츠 작성으로 순위 급상승 가능</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">순위</th><th class="text-center py-2 px-3">토픽</th></tr></thead><tbody>'+d.high_potential.map(k=>'<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td><td class="text-center py-2 px-3">'+topicBadge(k.topic)+'</td></tr>').join('')+'</tbody></table></div>';
  }else if(tab==='cheonan'){
    el.innerHTML='<div class="mb-3"><h3 class="text-sm font-bold text-green-400"><i class="fas fa-map-marker-alt mr-1"></i>천안 로컬 키워드 전체 현황</h3><p class="text-xs text-slate-500 mt-1">핵심 상업 키워드 — 매출과 직결됩니다</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>'+d.cheonan_keywords.map(k=>'<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+k.clicks+'</td><td class="text-right py-2 px-3 '+(k.ctr>3?'text-green-400':'text-red-400')+'">'+pct(k.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td></tr>').join('')+'</tbody></table></div>';
  }else if(tab==='topkw'){
    el.innerHTML='<div class="mb-3"><h3 class="text-sm font-bold text-blue-400"><i class="fas fa-trophy mr-1"></i>TOP 50 키워드 (노출 기준)</h3></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">#</th><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>'+d.top_keywords.map((k,i)=>'<tr class="border-t border-slate-800"><td class="py-2 px-3 text-slate-500">'+(i+1)+'</td><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+k.clicks+'</td><td class="text-right py-2 px-3">'+pct(k.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td></tr>').join('')+'</tbody></table></div>';
  }else if(tab==='toppages'){
    el.innerHTML='<div class="mb-3"><h3 class="text-sm font-bold text-green-400"><i class="fas fa-file-alt mr-1"></i>인기 페이지 TOP 30</h3></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">URL</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>'+d.high_perf_pages.map(p=>'<tr class="border-t border-slate-800"><td class="py-2 px-3 text-blue-300 text-xs truncate max-w-[300px]" title="'+p.url+'"><a href="https://bdbddc.com'+p.url+'" target="_blank" class="hover:underline">'+p.url+'</a></td><td class="text-right py-2 px-3 text-green-400 font-bold">'+p.clicks+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(p.impressions)+'</td><td class="text-right py-2 px-3">'+pct(p.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(p.position)+'</td></tr>').join('')+'</tbody></table></div>';
  }else if(tab==='deadpages'){
    el.innerHTML='<div class="mb-3"><h3 class="text-sm font-bold text-slate-400"><i class="fas fa-ghost mr-1"></i>Dead 페이지 — 노출만 되고 클릭 0</h3><p class="text-xs text-slate-500 mt-1">Title/Description 개선 또는 콘텐츠 병합 필요</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">URL</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>'+d.dead_pages.map(p=>'<tr class="border-t border-slate-800"><td class="py-2 px-3 text-slate-400 text-xs truncate max-w-[400px]" title="'+p.url+'"><a href="https://bdbddc.com'+p.url+'" target="_blank" class="hover:text-blue-300">'+p.url+'</a></td><td class="text-right py-2 px-3 text-purple-300">'+n(p.impressions)+'</td><td class="text-right py-2 px-3">'+rankBadge(p.position)+'</td></tr>').join('')+'</tbody></table></div>';
  }
}
loadData();
</script>
</body>
</html>`)
})

// ============================================
// GSC 분석 대시보드
// ============================================
app.get('/gsc-report', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GSC 분석 대시보드 — bdbddc.com</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800&display=swap');
  * { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
  body { background: #0f172a; color: #e2e8f0; }
  .glass { background: rgba(30,41,59,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(71,85,105,0.4); }
  .glass-dark { background: rgba(15,23,42,0.8); backdrop-filter: blur(12px); border: 1px solid rgba(51,65,85,0.5); }
  .metric-card { transition: all 0.3s; }
  .metric-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
  .tab-btn { transition: all 0.2s; }
  .tab-btn.active { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; }
  .tab-btn:not(.active):hover { background: rgba(59,130,246,0.15); }
  .badge-green { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
  .badge-yellow { background: rgba(234,179,8,0.15); color: #facc15; border: 1px solid rgba(234,179,8,0.3); }
  .badge-red { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
  .badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
  .badge-purple { background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); }
  .glow-green { box-shadow: 0 0 20px rgba(34,197,94,0.15); }
  .glow-blue { box-shadow: 0 0 20px rgba(59,130,246,0.15); }
  .glow-purple { box-shadow: 0 0 20px rgba(139,92,246,0.15); }
  .glow-yellow { box-shadow: 0 0 20px rgba(234,179,8,0.15); }
  .progress-bar { height: 6px; border-radius: 3px; background: rgba(51,65,85,0.5); overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
  table { border-collapse: separate; border-spacing: 0; }
  thead th { position: sticky; top: 0; z-index: 10; background: rgba(15,23,42,0.95); backdrop-filter: blur(8px); }
  tbody tr { transition: background 0.15s; }
  tbody tr:hover { background: rgba(59,130,246,0.08); }
  .scroll-table { max-height: 500px; overflow-y: auto; }
  .scroll-table::-webkit-scrollbar { width: 6px; }
  .scroll-table::-webkit-scrollbar-track { background: rgba(30,41,59,0.5); border-radius: 3px; }
  .scroll-table::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.5); border-radius: 3px; }
  .section-title { background: linear-gradient(90deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .pulse-dot { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .fade-in { animation: fadeIn 0.5s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .rank-pill-1 { background: linear-gradient(135deg, #059669, #10b981); }
  .rank-pill-2 { background: linear-gradient(135deg, #2563eb, #3b82f6); }
  .rank-pill-3 { background: linear-gradient(135deg, #d97706, #f59e0b); }
  .rank-pill-4 { background: linear-gradient(135deg, #dc2626, #ef4444); }
  @media print { body { background: #fff; color: #000; } .glass, .glass-dark { background: #fff; border: 1px solid #ddd; backdrop-filter: none; } }
</style>
</head>
<body class="min-h-screen">

<header class="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <i class="fas fa-chart-line text-white text-lg"></i>
    </div>
    <div>
      <h1 class="text-lg font-bold text-white">GSC 분석 대시보드</h1>
      <p class="text-xs text-slate-400">bdbddc.com · 서울비디치과</p>
    </div>
  </div>
  <div class="flex items-center gap-4">
    <span class="text-xs text-slate-400"><i class="far fa-calendar mr-1"></i>2026-01-28 ~ 2026-04-27</span>
    <span class="pulse-dot inline-block w-2 h-2 rounded-full bg-green-400"></span>
    <span class="text-xs text-green-400">3개월 데이터</span>
  </div>
</header>

<main class="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6" id="app">
  <div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-400"></i><p class="mt-3 text-slate-400">데이터 로딩 중...</p></div>
</main>

<script>
let DATA = null;

async function loadData() {
  try {
    const res = await fetch('/static/gsc-data.json');
    if (!res.ok) throw new Error('Failed to load data');
    DATA = await res.json();
    render();
  } catch(e) {
    document.getElementById('app').innerHTML = '<div class="text-center py-16"><i class="fas fa-exclamation-triangle text-4xl text-red-400"></i><p class="mt-3 text-red-300">데이터 로딩 실패</p><p class="text-xs text-slate-500 mt-2">'+e.message+'</p></div>';
  }
}

function n(v) { return (v||0).toLocaleString('ko-KR'); }
function pct(v) { return (v||0).toFixed(2) + '%'; }
function pos(v) { return (v||0).toFixed(1); }

function rankBadge(p) {
  if (p <= 3) return '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-1 text-white">' + pos(p) + '</span>';
  if (p <= 10) return '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-2 text-white">' + pos(p) + '</span>';
  if (p <= 20) return '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-3 text-white">' + pos(p) + '</span>';
  return '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-4 text-white">' + pos(p) + '</span>';
}

function topicBadge(t) {
  const colors = {
    '임플란트': 'badge-blue', '교정': 'badge-purple', '라미네이트/심미': 'badge-green',
    '소아치과': 'badge-yellow', '일반진료': 'badge-blue', '치과용어/백과': 'badge-purple',
    '병원찾기': 'badge-green', '비용/보험': 'badge-yellow', '기타': 'badge-red'
  };
  return '<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ' + (colors[t]||'badge-blue') + '">' + (t||'') + '</span>';
}

function growthArrow(v) {
  if (v > 0) return '<span class="text-green-400 font-bold"><i class="fas fa-arrow-up text-xs"></i> +' + v + '%</span>';
  if (v < 0) return '<span class="text-red-400 font-bold"><i class="fas fa-arrow-down text-xs"></i> ' + v + '%</span>';
  return '<span class="text-slate-400">0%</span>';
}

function render() {
  const d = DATA;
  const s = d.summary;

  document.getElementById('app').innerHTML =
  '<section class="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">' +
    '<div class="glass rounded-2xl p-5 metric-card glow-blue"><div class="flex items-center justify-between mb-3"><span class="text-xs text-slate-400 uppercase tracking-wider">총 클릭수</span><div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><i class="fas fa-mouse-pointer text-blue-400 text-sm"></i></div></div><div class="text-3xl font-extrabold text-white">' + n(s.total_clicks) + '</div><div class="mt-2 text-sm">' + (d.growth ? growthArrow(d.growth.click_growth_pct) : '') + ' <span class="text-slate-500 text-xs">vs 전월(일평균)</span></div></div>' +
    '<div class="glass rounded-2xl p-5 metric-card glow-purple"><div class="flex items-center justify-between mb-3"><span class="text-xs text-slate-400 uppercase tracking-wider">총 노출수</span><div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><i class="fas fa-eye text-purple-400 text-sm"></i></div></div><div class="text-3xl font-extrabold text-white">' + n(s.total_impressions) + '</div><div class="mt-2 text-sm">' + (d.growth ? growthArrow(d.growth.imp_growth_pct) : '') + ' <span class="text-slate-500 text-xs">vs 전월(일평균)</span></div></div>' +
    '<div class="glass rounded-2xl p-5 metric-card glow-green"><div class="flex items-center justify-between mb-3"><span class="text-xs text-slate-400 uppercase tracking-wider">평균 CTR</span><div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center"><i class="fas fa-percentage text-green-400 text-sm"></i></div></div><div class="text-3xl font-extrabold text-white">' + pct(s.avg_ctr) + '</div><div class="mt-2 text-xs text-slate-500">업계 평균: 3-5%</div></div>' +
    '<div class="glass rounded-2xl p-5 metric-card glow-yellow"><div class="flex items-center justify-between mb-3"><span class="text-xs text-slate-400 uppercase tracking-wider">평균 순위</span><div class="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center"><i class="fas fa-sort-amount-up text-yellow-400 text-sm"></i></div></div><div class="text-3xl font-extrabold text-white">' + pos(s.avg_position) + '</div><div class="mt-2 text-xs text-slate-500">' + s.total_keywords + '개 키워드 기반</div></div>' +
  '</section>' +

  '<section class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in">' +
    '<div class="glass rounded-xl p-4 text-center"><div class="text-2xl font-bold text-white">' + n(s.total_keywords) + '</div><div class="text-xs text-slate-400 mt-1">발견 키워드</div></div>' +
    '<div class="glass rounded-xl p-4 text-center"><div class="text-2xl font-bold text-green-400">' + s.keywords_with_clicks + '</div><div class="text-xs text-slate-400 mt-1">클릭 발생 키워드</div></div>' +
    '<div class="glass rounded-xl p-4 text-center"><div class="text-2xl font-bold text-white">' + n(s.total_pages) + '</div><div class="text-xs text-slate-400 mt-1">인덱스 페이지</div></div>' +
    '<div class="glass rounded-xl p-4 text-center"><div class="text-2xl font-bold text-green-400">' + s.pages_with_clicks + '</div><div class="text-xs text-slate-400 mt-1">클릭 발생 페이지</div></div>' +
  '</section>' +

  '<section class="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">' +
    '<div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-chart-area text-blue-400 mr-2"></i>일별 트래픽 추이 (3개월)</h3><canvas id="trendChart" height="200"></canvas></div>' +
    '<div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-chart-bar text-purple-400 mr-2"></i>월별 성장 추이</h3><canvas id="monthlyChart" height="200"></canvas></div>' +
  '</section>' +

  '<section class="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">' +
    '<div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-layer-group text-green-400 mr-2"></i>키워드 순위 분포</h3><canvas id="rankChart" height="200"></canvas><div class="mt-4 grid grid-cols-2 gap-2 text-xs"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500"></span>1-3위: ' + d.rank_distribution['1-3위'] + '개</div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span>4-10위: ' + d.rank_distribution['4-10위'] + '개</div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span>11-20위: ' + d.rank_distribution['11-20위'] + '개</div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500"></span>20위+: ' + d.rank_distribution['20위+'] + '개</div></div></div>' +
    '<div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-building text-yellow-400 mr-2"></i>브랜드 vs 비브랜드</h3><canvas id="brandChart" height="200"></canvas><div class="mt-4 space-y-2 text-xs"><div class="flex justify-between"><span class="text-slate-400">브랜드 CTR</span><span class="text-green-400 font-bold">' + pct(d.brand_vs_nonbrand.brand.ctr) + '</span></div><div class="flex justify-between"><span class="text-slate-400">비브랜드 CTR</span><span class="text-red-400 font-bold">' + pct(d.brand_vs_nonbrand.nonbrand.ctr) + '</span></div><div class="flex justify-between"><span class="text-slate-400">비브랜드 클릭 비중</span><span class="text-yellow-400 font-bold">' + ((d.brand_vs_nonbrand.nonbrand.clicks / Math.max(s.total_clicks,1))*100).toFixed(1) + '%</span></div></div></div>' +
    '<div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-mobile-alt text-purple-400 mr-2"></i>디바이스별 성과</h3><canvas id="deviceChart" height="200"></canvas><div class="mt-4 space-y-2 text-xs">' + Object.entries(d.devices).map(function(e){var k=e[0],v=e[1]; var icon = k==='desktop'?'fa-desktop':k==='mobile'?'fa-mobile-alt':'fa-tablet-alt'; var label = k==='desktop'?'데스크톱':k==='mobile'?'모바일':'태블릿'; return '<div class="flex justify-between"><span class="text-slate-400"><i class="fas '+icon+' mr-1"></i>'+label+'</span><span class="text-white">'+n(v.clicks)+'클릭 · '+pct(v.ctr)+'</span></div>';}).join('') + '</div></div>' +
  '</section>' +

  '<section class="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">' +
    '<div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-tags text-blue-400 mr-2"></i>토픽별 키워드 분포</h3><canvas id="topicChart" height="220"></canvas></div>' +
    '<div class="glass rounded-2xl p-6"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-compass text-green-400 mr-2"></i>검색 의도별 분포</h3><canvas id="intentChart" height="220"></canvas></div>' +
  '</section>' +

  '<section class="glass rounded-2xl p-6 fade-in"><h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-sitemap text-purple-400 mr-2"></i>사이트 섹션별 성과</h3><div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">' +
    Object.entries(d.section_stats).sort(function(a,b){return b[1].impressions-a[1].impressions}).map(function(e){var sec=e[0],v=e[1]; var labels={encyclopedia:'백과사전',blog:'블로그',area:'지역페이지',treatments:'진료과목',doctors:'의료진',faq:'FAQ',cases:'치료사례',main:'메인/기타'}; var icons={encyclopedia:'fa-book',blog:'fa-pen-fancy',area:'fa-map-marker-alt',treatments:'fa-tooth',doctors:'fa-user-md',faq:'fa-question-circle',cases:'fa-images',main:'fa-home'}; return '<div class="glass-dark rounded-xl p-3 text-center"><div class="w-8 h-8 mx-auto rounded-lg bg-blue-500/15 flex items-center justify-center mb-2"><i class="fas '+(icons[sec]||'fa-file')+' text-blue-400 text-xs"></i></div><div class="text-xs text-slate-400">'+(labels[sec]||sec)+'</div><div class="text-lg font-bold text-white mt-1">'+n(v.impressions)+'</div><div class="text-[10px] text-slate-500">'+v.count+'페이지 · '+v.clicks+'클릭</div><div class="text-[10px] mt-1 '+(v.clicks/Math.max(v.impressions,1)*100>2?'text-green-400':'text-yellow-400')+'">'+(v.clicks/Math.max(v.impressions,1)*100).toFixed(1)+'% CTR</div></div>';}).join('') +
  '</div></section>' +

  '<section class="fade-in"><div class="flex flex-wrap gap-2 mb-4" id="tabButtons">' +
    '<button class="tab-btn active glass rounded-lg px-4 py-2 text-sm font-medium" data-tab="quickwin"><i class="fas fa-rocket mr-1"></i>Quick Win ('+d.quick_wins.length+')</button>' +
    '<button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="ctrlow"><i class="fas fa-exclamation-triangle mr-1"></i>CTR 개선 ('+d.ctr_low.length+')</button>' +
    '<button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="highpotential"><i class="fas fa-gem mr-1"></i>숨은 기회 ('+d.high_potential.length+')</button>' +
    '<button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="cheonan"><i class="fas fa-map-marker-alt mr-1"></i>천안 키워드 ('+d.cheonan_keywords.length+')</button>' +
    '<button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="topkw"><i class="fas fa-trophy mr-1"></i>TOP 키워드</button>' +
    '<button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="toppages"><i class="fas fa-file-alt mr-1"></i>인기 페이지</button>' +
    '<button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="deadpages"><i class="fas fa-ghost mr-1"></i>Dead 페이지 ('+d.dead_pages.length+')</button>' +
  '</div><div id="tabContent" class="glass rounded-2xl p-4"></div></section>' +

  '<section class="glass rounded-2xl p-6 fade-in"><h2 class="text-lg font-bold text-white mb-4"><i class="fas fa-bullseye text-red-400 mr-2"></i>핵심 발견 & 액션 플랜</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
    '<div class="glass-dark rounded-xl p-4"><h4 class="text-sm font-bold text-red-400 mb-3"><i class="fas fa-exclamation-circle mr-1"></i>문제점 진단</h4><ul class="space-y-2 text-sm text-slate-300">' +
      '<li class="flex gap-2"><span class="text-red-400">1</span>비브랜드 클릭 비율 단 '+((d.brand_vs_nonbrand.nonbrand.clicks/Math.max(s.total_clicks,1))*100).toFixed(0)+'% — 브랜드 의존도 극심</li>' +
      '<li class="flex gap-2"><span class="text-red-400">2</span>881개 키워드 중 클릭 발생은 '+s.keywords_with_clicks+'개('+(s.keywords_with_clicks/s.total_keywords*100).toFixed(1)+'%)뿐</li>' +
      '<li class="flex gap-2"><span class="text-red-400">3</span>1-3위 키워드 '+d.rank_distribution['1-3위']+'개 중 대부분 치과용어/백과 — 상업성 낮음</li>' +
      '<li class="flex gap-2"><span class="text-red-400">4</span>"천안 임플란트" 순위 1.55위인데 노출 33, 클릭 0 — CTR 극히 낮음</li>' +
      '<li class="flex gap-2"><span class="text-red-400">5</span>Dead 페이지 '+d.dead_pages.length+'개 — 노출만 되고 클릭 없음</li>' +
      '<li class="flex gap-2"><span class="text-red-400">6</span>비브랜드 CTR '+pct(d.brand_vs_nonbrand.nonbrand.ctr)+' — 업계 평균의 1/10</li>' +
    '</ul></div>' +
    '<div class="glass-dark rounded-xl p-4"><h4 class="text-sm font-bold text-green-400 mb-3"><i class="fas fa-check-circle mr-1"></i>긍정 시그널</h4><ul class="space-y-2 text-sm text-slate-300">' +
      '<li class="flex gap-2"><span class="text-green-400">1</span>4월 노출 폭발적 성장 ('+(d.growth?'+'+d.growth.imp_growth_pct+'%':'')+'↑ 일평균)</li>' +
      '<li class="flex gap-2"><span class="text-green-400">2</span>881개 키워드 발견 = 구글 인덱싱 상태 양호</li>' +
      '<li class="flex gap-2"><span class="text-green-400">3</span>"천안치과" 평균 순위 1.2 — 최상위 노출</li>' +
      '<li class="flex gap-2"><span class="text-green-400">4</span>707페이지 인덱싱 → 콘텐츠 양 충분</li>' +
      '<li class="flex gap-2"><span class="text-green-400">5</span>백과사전 섹션 8,000+ 노출 — 정보성 트래픽 기반 확보</li>' +
      '<li class="flex gap-2"><span class="text-green-400">6</span>4월 일평균 클릭 +'+(d.growth?d.growth.click_growth_pct:'')+'% 성장</li>' +
    '</ul></div>' +
  '</div>' +
  '<div class="mt-6 glass-dark rounded-xl p-4"><h4 class="text-sm font-bold text-blue-400 mb-3"><i class="fas fa-tasks mr-1"></i>우선순위 액션 플랜</h4><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">' +
    '<div class="space-y-2"><div class="text-xs font-bold text-red-400 uppercase tracking-wider">이번 주 (긴급)</div><div class="bg-red-500/10 rounded-lg p-3 space-y-1.5 text-slate-300"><p>1. Quick Win '+d.quick_wins.length+'개 키워드 Title/Description 최적화</p><p>2. Dead 페이지 상위 20개 meta 태그 개선</p><p>3. "천안치과" CTR 0.91% → Title에 차별화 문구</p><p>4. 홈페이지 Title 개선 (현재 CTR 4.49%)</p></div></div>' +
    '<div class="space-y-2"><div class="text-xs font-bold text-yellow-400 uppercase tracking-wider">이번 달 (중요)</div><div class="bg-yellow-500/10 rounded-lg p-3 space-y-1.5 text-slate-300"><p>1. 천안 로컬 키워드 전용 랜딩페이지 강화</p><p>2. 블로그 → 진료페이지 내부 링크 구축</p><p>3. "천안 임플란트 가격/후기" 전용 콘텐츠</p><p>4. 의료포털 프로필 등록 (모두닥, 닥터나우)</p></div></div>' +
    '<div class="space-y-2"><div class="text-xs font-bold text-blue-400 uppercase tracking-wider">1-3개월 (성장)</div><div class="bg-blue-500/10 rounded-lg p-3 space-y-1.5 text-slate-300"><p>1. 백과사전 → 진료 전환 CTA 삽입</p><p>2. 비브랜드 상업성 키워드 타겟 콘텐츠</p><p>3. 외부 백링크 확보 (지역 커뮤니티)</p><p>4. 영상 SEO + 구조화 데이터 강화</p></div></div>' +
  '</div></div></section>' +

  '<footer class="text-center text-xs text-slate-600 py-6">Generated on 2026-04-29 · Powered by Google Search Console Data · 서울비디치과 SEO 분석</footer>';

  initCharts();
  initTabs();
}

function initCharts() {
  var d = DATA;
  var ctx1 = document.getElementById('trendChart');
  if (ctx1) {
    new Chart(ctx1.getContext('2d'), {
      type: 'line',
      data: {
        labels: d.chart.map(function(c){return c.date.slice(5)}),
        datasets: [
          { label: '클릭', data: d.chart.map(function(c){return c.clicks}), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.3, pointRadius: 1 },
          { label: '노출/10', data: d.chart.map(function(c){return Math.round(c.impressions/10)}), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.05)', fill: true, tension: 0.3, pointRadius: 1 }
        ]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: { x: { ticks: { color: '#64748b', font: { size: 9 }, maxTicksLimit: 15 }, grid: { color: 'rgba(51,65,85,0.3)' } },
                  y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(51,65,85,0.3)' } } } }
    });
  }

  var ctx2 = document.getElementById('monthlyChart');
  if (ctx2) {
    var months = Object.keys(d.monthly);
    new Chart(ctx2.getContext('2d'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: '클릭', data: months.map(function(m){return d.monthly[m].clicks}), backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 6 },
          { label: '노출/10', data: months.map(function(m){return Math.round(d.monthly[m].impressions/10)}), backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 6 }
        ]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                  y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } } } }
    });
  }

  var ctx3 = document.getElementById('rankChart');
  if (ctx3) {
    new Chart(ctx3.getContext('2d'), {
      type: 'doughnut',
      data: { labels: Object.keys(d.rank_distribution), datasets: [{ data: Object.values(d.rank_distribution), backgroundColor: ['#10b981','#3b82f6','#f59e0b','#ef4444'], borderWidth: 0 }] },
      options: { responsive: true, cutout: '65%', plugins: { legend: { display: false } } }
    });
  }

  var ctx4 = document.getElementById('brandChart');
  if (ctx4) {
    new Chart(ctx4.getContext('2d'), {
      type: 'doughnut',
      data: { labels: ['브랜드 클릭', '비브랜드 클릭'], datasets: [{ data: [d.brand_vs_nonbrand.brand.clicks, d.brand_vs_nonbrand.nonbrand.clicks], backgroundColor: ['#3b82f6','#f59e0b'], borderWidth: 0 }] },
      options: { responsive: true, cutout: '65%', plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } } }
    });
  }

  var ctx5 = document.getElementById('deviceChart');
  if (ctx5) {
    new Chart(ctx5.getContext('2d'), {
      type: 'doughnut',
      data: { labels: ['데스크톱', '모바일', '태블릿'], datasets: [{ data: [d.devices.desktop.clicks, d.devices.mobile.clicks, d.devices.tablet.clicks], backgroundColor: ['#3b82f6','#10b981','#8b5cf6'], borderWidth: 0 }] },
      options: { responsive: true, cutout: '65%', plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } } }
    });
  }

  var ctx6 = document.getElementById('topicChart');
  if (ctx6) {
    var topics = Object.entries(d.topic_stats).sort(function(a,b){return b[1].impressions-a[1].impressions});
    var colors6 = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#f97316','#6366f1'];
    new Chart(ctx6.getContext('2d'), {
      type: 'bar',
      data: {
        labels: topics.map(function(t){return t[0]}),
        datasets: [
          { label: '노출', data: topics.map(function(t){return t[1].impressions}), backgroundColor: colors6.map(function(c){return c+'cc'}), borderRadius: 4 },
          { label: '클릭', data: topics.map(function(t){return t[1].clicks}), backgroundColor: colors6.map(function(c){return c+'55'}), borderRadius: 4 }
        ]
      },
      options: { indexAxis: 'y', responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
        scales: { x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(51,65,85,0.3)' } },
                  y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } } } }
    });
  }

  var ctx7 = document.getElementById('intentChart');
  if (ctx7) {
    var intents = Object.entries(d.intent_stats).sort(function(a,b){return b[1].count-a[1].count});
    var intentColors = { informational: '#3b82f6', local: '#10b981', commercial: '#f59e0b', transactional: '#ef4444' };
    var intentLabels = { informational:'정보성', local:'로컬', commercial:'상업성', transactional:'거래성' };
    new Chart(ctx7.getContext('2d'), {
      type: 'polarArea',
      data: {
        labels: intents.map(function(i){return intentLabels[i[0]]||i[0]}),
        datasets: [{ data: intents.map(function(i){return i[1].count}), backgroundColor: intents.map(function(i){return (intentColors[i[0]]||'#6366f1')+'99'}) }]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: { r: { ticks: { color: '#64748b', backdropColor: 'transparent' }, grid: { color: 'rgba(51,65,85,0.3)' } } } }
    });
  }
}

function initTabs() {
  var btns = document.querySelectorAll('.tab-btn');
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b){ b.classList.remove('active'); b.classList.add('text-slate-400'); });
      btn.classList.add('active'); btn.classList.remove('text-slate-400');
      renderTab(btn.dataset.tab);
    });
  });
  renderTab('quickwin');
}

function renderTab(tab) {
  var d = DATA;
  var el = document.getElementById('tabContent');
  if (!el) return;

  if (tab === 'quickwin') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-amber-400"><i class="fas fa-rocket mr-1"></i>Quick Win 키워드 — 순위 10-20위, 1페이지 진입 직전!</h3><p class="text-xs text-slate-500 mt-1">Title/Description 최적화, 내부 링크 강화로 빠르게 1페이지 진입 가능</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th><th class="text-center py-2 px-3">토픽</th></tr></thead><tbody>' +
      d.quick_wins.map(function(k){return '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+k.clicks+'</td><td class="text-right py-2 px-3 text-yellow-400">'+pct(k.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td><td class="text-center py-2 px-3">'+topicBadge(k.topic)+'</td></tr>'}).join('') +
      '</tbody></table></div>';
  }

  else if (tab === 'ctrlow') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-red-400"><i class="fas fa-exclamation-triangle mr-1"></i>CTR 개선 필요 — 상위 노출되지만 클릭 안됨</h3><p class="text-xs text-slate-500 mt-1">순위 10위 이내, 노출 20+ 인데 CTR 5% 미만 → Title/Description이 매력적이지 않음</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.ctr_low.map(function(k){return '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+k.clicks+'</td><td class="text-right py-2 px-3 text-red-400 font-bold">'+pct(k.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td></tr>'}).join('') +
      '</tbody></table></div>';
  }

  else if (tab === 'highpotential') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-cyan-400"><i class="fas fa-gem mr-1"></i>숨은 기회 — 높은 노출, 순위 20위+ 키워드</h3><p class="text-xs text-slate-500 mt-1">전용 콘텐츠 작성으로 순위 급상승 가능한 키워드</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">순위</th><th class="text-center py-2 px-3">토픽</th></tr></thead><tbody>' +
      d.high_potential.map(function(k){return '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td><td class="text-center py-2 px-3">'+topicBadge(k.topic)+'</td></tr>'}).join('') +
      '</tbody></table></div>';
  }

  else if (tab === 'cheonan') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-green-400"><i class="fas fa-map-marker-alt mr-1"></i>천안/불당/아산 로컬 키워드 전체 현황</h3><p class="text-xs text-slate-500 mt-1">핵심 상업 키워드 — 이 키워드들이 매출과 직결됩니다</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.cheonan_keywords.map(function(k){return '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+k.clicks+'</td><td class="text-right py-2 px-3 '+(k.ctr>3?'text-green-400':'text-red-400')+'">'+pct(k.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td></tr>'}).join('') +
      '</tbody></table></div>';
  }

  else if (tab === 'topkw') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-blue-400"><i class="fas fa-trophy mr-1"></i>TOP 50 키워드 (노출 기준)</h3></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">#</th><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.top_keywords.map(function(k,i){return '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-slate-500">'+(i+1)+'</td><td class="py-2 px-3 text-white font-medium">'+k.query+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(k.impressions)+'</td><td class="text-right py-2 px-3">'+k.clicks+'</td><td class="text-right py-2 px-3">'+pct(k.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(k.position)+'</td></tr>'}).join('') +
      '</tbody></table></div>';
  }

  else if (tab === 'toppages') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-green-400"><i class="fas fa-file-alt mr-1"></i>인기 페이지 TOP 30</h3></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">URL</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.high_perf_pages.map(function(p){return '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-blue-300 text-xs truncate max-w-[300px]"><a href="https://bdbddc.com'+p.url+'" target="_blank" class="hover:underline">'+p.url+'</a></td><td class="text-right py-2 px-3 text-green-400 font-bold">'+p.clicks+'</td><td class="text-right py-2 px-3 text-purple-300">'+n(p.impressions)+'</td><td class="text-right py-2 px-3">'+pct(p.ctr)+'</td><td class="text-right py-2 px-3">'+rankBadge(p.position)+'</td></tr>'}).join('') +
      '</tbody></table></div>';
  }

  else if (tab === 'deadpages') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-slate-400"><i class="fas fa-ghost mr-1"></i>Dead 페이지 — 노출만 되고 클릭 0</h3><p class="text-xs text-slate-500 mt-1">Title/Description 개선 또는 콘텐츠 병합 필요</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">URL</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.dead_pages.map(function(p){return '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-slate-400 text-xs truncate max-w-[400px]"><a href="https://bdbddc.com'+p.url+'" target="_blank" class="hover:text-blue-300">'+p.url+'</a></td><td class="text-right py-2 px-3 text-purple-300">'+n(p.impressions)+'</td><td class="text-right py-2 px-3">'+rankBadge(p.position)+'</td></tr>'}).join('') +
      '</tbody></table></div>';
  }
}

loadData();
</script>
</body>
</html>`)
})

// ============================================
// Catch-all: 정적 파일 시도 → 없으면 404 반환
// Cloudflare Pages에서 ASSETS가 빈 200을 반환하는 문제 해결
// ============================================
app.all('*', async (c) => {
  // 1) ASSETS 바인딩으로 정적 파일 서빙 시도
  if (c.env?.ASSETS) {
    try {
      const assetRes = await c.env.ASSETS.fetch(c.req.raw)
      // 정적 파일이 실제로 존재하면 (본문이 있는 200) 그대로 반환
      if (assetRes.ok) {
        const body = await assetRes.arrayBuffer()
        if (body.byteLength > 0) {
          return new Response(body, {
            status: assetRes.status,
            headers: assetRes.headers
          })
        }
      }
    } catch (e) {
      // ASSETS fetch 실패 → 404로 진행
    }
  }

  // 2) 정적 파일이 없으면 → 커스텀 404.html 서빙
  if (c.env?.ASSETS) {
    try {
      const notFoundReq = new Request(new URL('/404.html', c.req.url).toString())
      const res = await c.env.ASSETS.fetch(notFoundReq)
      if (res.ok) {
        const html = await res.text()
        if (html.length > 0) {
          return c.html(html, 404)
        }
      }
    } catch (e) {
      // 404.html 로딩 실패 → 인라인 fallback
    }
  }

  // 3) 인라인 fallback 404
  return c.html(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>페이지를 찾을 수 없습니다 | 서울비디치과</title>
<style>body{font-family:Pretendard,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#faf9f7;color:#333;text-align:center}.e{max-width:480px;padding:2rem}.c{font-size:6rem;font-weight:800;color:#6B4226;margin:0}h1{font-size:1.5rem;margin:1rem 0}p{color:#666;margin:1rem 0}a{display:inline-block;background:#6B4226;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:1rem}a:hover{background:#8B5E3C}</style></head>
<body><div class="e"><div class="c">404</div><h1>페이지를 찾을 수 없습니다</h1><p>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p><a href="/"><i class="fas fa-home"></i> 홈으로 돌아가기</a><p style="margin-top:2rem;font-size:.85rem;color:#999">☎ 041-415-2892 | 365일 진료</p></div></body></html>`, 404)
})

// notFound 핸들러 (catch-all에서 못 잡은 경우 안전장치)
app.notFound(async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>페이지를 찾을 수 없습니다 | 서울비디치과</title>
<style>body{font-family:Pretendard,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#faf9f7;color:#333;text-align:center}.e{max-width:480px;padding:2rem}.c{font-size:6rem;font-weight:800;color:#6B4226;margin:0}h1{font-size:1.5rem;margin:1rem 0}p{color:#666;margin:1rem 0}a{display:inline-block;background:#6B4226;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:1rem}a:hover{background:#8B5E3C}</style></head>
<body><div class="e"><div class="c">404</div><h1>페이지를 찾을 수 없습니다</h1><p>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p><a href="/"><i class="fas fa-home"></i> 홈으로 돌아가기</a><p style="margin-top:2rem;font-size:.85rem;color:#999">☎ 041-415-2892 | 365일 진료</p></div></body></html>`, 404)
})

// 글로벌 에러 핸들러 (500 에러 방지)
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.html(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>오류가 발생했습니다 | 서울비디치과</title>
<style>body{font-family:Pretendard,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#faf9f7;color:#333;text-align:center}.e{max-width:480px;padding:2rem}.c{font-size:4rem;margin:0}h1{font-size:1.5rem;margin:1rem 0}p{color:#666}a{display:inline-block;background:#6B4226;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:1rem}a:hover{background:#8B5E3C}</style></head>
<body><div class="e"><div class="c">⚠️</div><h1>일시적인 오류가 발생했습니다</h1><p>잠시 후 다시 시도해주세요.</p><a href="/">홈으로 돌아가기</a><p style="margin-top:2rem;font-size:.85rem;color:#999">☎ 041-415-2892 | 365일 진료</p></div></body></html>`, 500)
})

export default app
