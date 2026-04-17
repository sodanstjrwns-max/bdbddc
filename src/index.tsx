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
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// seoulbddc.com → bdbddc.com 301 리디렉트
// ============================================
app.use('*', async (c, next) => {
  const host = new URL(c.req.url).hostname
  if (host === 'seoulbddc.com' || host === 'www.seoulbddc.com') {
    const url = new URL(c.req.url)
    url.hostname = 'bdbddc.com'
    url.protocol = 'https:'
    return c.redirect(url.toString(), 301)
  }
  await next()
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
<div class="mega-dropdown-section"><strong class="section-heading">잇몸/외과</strong><ul>
<li><a href="/treatments/scaling">스케일링</a></li>
<li><a href="/treatments/gum">잇몸치료</a></li>
<li><a href="/treatments/periodontitis">치주염</a></li>
<li><a href="/treatments/wisdom-tooth">사랑니 발치</a></li>
<li><a href="/treatments/tmj">턱관절장애</a></li>
<li><a href="/treatments/bruxism">이갈이/이악물기</a></li>
</ul></div>
</div></div></li>
<li class="nav-item"><a href="/doctors/">의료진</a></li>
<li class="nav-item"><a href="/mission">비디미션</a></li>
<li class="nav-item has-dropdown"><a href="/cases/gallery">콘텐츠</a>
<ul class="simple-dropdown">
<li><a href="/cases/gallery" style="color:#6B4226;font-weight:600;">🔥 비포/애프터</a></li>
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
<li><a href="/treatments/scaling">스케일링</a></li>
<li><a href="/treatments/gum">잇몸치료</a></li>
</ul>
</li>
<li><a href="/doctors/"><i class="fas fa-user-md"></i> 의료진</a></li>
<li><a href="/mission"><i class="fas fa-heart"></i> 비디미션</a></li>
<li class="mobile-nav-item has-submenu">
<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
<i class="fas fa-newspaper"></i> 콘텐츠 <i class="fas fa-chevron-down toggle-icon"></i></a>
<ul class="mobile-nav-submenu">
<li><a href="/cases/gallery" style="color:#6B4226;font-weight:600;">🔥 비포/애프터</a></li>
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
  html = html.replace('</head>', inblogCustomCSS + '</head>')

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
    '/treatments/prevention', '/treatments/tmj', '/treatments/bruxism',
    '/treatments/emergency', '/treatments/sedation', '/treatments/orthodontics',
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

// Doctors directory — index는 정적, 개별 페이지는 SSR
app.get('/doctors', serveStatic({ path: './doctors/index.html' }))
app.get('/doctors/', serveStatic({ path: './doctors/index.html' }))
// 정적 자산 (CSS/JS/이미지 등 . 포함 경로)
app.use('/doctors/*', async (c, next) => {
  const path = c.req.path
  // .html/.css/.js/.jpg 등 확장자가 있는 건 정적 서빙
  if (/\.\w+$/.test(path)) return serveStatic()(c, next)
  // 확장자 없으면 SSR 라우트로 넘김
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
      'moon': { videoId: 'JV7JDndC3ug', name: '서울비디치과 문석준 원장', description: '서울비디치과 문석준 대표원장 소개 영상. 서울대 출신 통합치의학과 전문의, 페이션트 퍼널 창립자.' },
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
      '턱관절장애': '/treatments/tmj',
      '만성 구강안면통증': '/treatments/tmj',
      '이갈이·이악물기': '/treatments/bruxism',
      '코골이·수면질환': '/treatments/tmj',
      '구강건조증': '/treatments/gum',
      '구강점막질환': '/treatments/gum',
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
      moon: { name: '문석준 원장', specialty: '대표원장 · 통합치의학과 전문의' },
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
    moon: { specialty: '대표원장 · 통합치의학과 전문의' },
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
<link rel="canonical" href="https://bdbddc.com/column/${doctorFilter ? '?doctor=' + doctorFilter : ''}">
<meta property="og:title" content="${filterTitle}원장 컬럼 | 서울비디치과">
<meta property="og:type" content="website">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/css/site-v5.css?v=74364b38">
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

@media(max-width:700px){
  .col-list-grid{grid-template-columns:1fr}
  .col-hero h1{font-size:1.4rem}
}
@media(min-width:701px) and (max-width:900px){
  .col-list-grid{grid-template-columns:repeat(2,1fr);gap:18px}
}
</style>
</head>
<body>
${ssrHeader()}
<main>
<div class="col-page">
<div class="col-hero">
<span class="col-hero-badge"><i class="fas fa-pen-nib"></i> 원장 컬럼</span>
<h1>${filterTitle}이야기</h1>
<p>서울비디치과 원장님들이 전하는 진료 철학과 치과 이야기</p>
</div>
${filterBtns}
<div class="col-list-grid">
${colCards || '<div class="col-empty"><i class="fas fa-pen-nib"></i><h3>아직 작성된 컬럼이 없습니다</h3><p>곧 원장님들의 이야기가 게재됩니다</p></div>'}
</div>
</div>
</main>
${ssrMobileNav()}
<script src="/js/main.js" defer></script>
<script src="/js/gnb.js" defer></script>
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
    moon: { specialty: '대표원장 · 통합치의학과 전문의' },
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
<link rel="stylesheet" href="/css/site-v5.css?v=74364b38">
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
    "jobTitle":"치과의사",
    "worksFor":{"@type":"Dentist","@id":"https://bdbddc.com/#dentist","name":"서울비디치과"}
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
<script src="/js/gnb.js" defer></script>
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
<link rel="stylesheet" href="/css/site-v5.css?v=74364b38">
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
<script src="/js/gnb.js" defer></script>
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
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/site-v5.css?v=74364b38">
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
<p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수합니다.</p>
<p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
</div>
</div>
</footer>

${ssrMobileNav()}
<script src="/js/main.js" defer></script>
<script src="/js/gnb.js" defer></script>
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
<link rel="stylesheet" href="/css/site-v5.css?v=74364b38">
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
<p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수합니다.</p>
<p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
</div>
</div>
</footer>

${ssrMobileNav()}
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

// [공개] 지원서 제출
app.post('/api/careers/apply', async (c) => {
  try {
    const db = c.env.DB
    const r2 = c.env.R2
    if (!db) return c.json({ error: 'DB not available' }, 500)

    const body = await c.req.json()
    const { name, phone, email, birth, position, experience, workDays, startDate, license, message, careers, photo, appliedAt } = body

    // 유효성 검사
    if (!name || !name.trim()) return c.json({ error: '이름을 입력해주세요.' }, 400)
    if (!phone || !phone.trim()) return c.json({ error: '연락처를 입력해주세요.' }, 400)
    if (!position) return c.json({ error: '지원 분야를 선택해주세요.' }, 400)

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
- **4F 임플란트센터**: 6개 수술방, 2개 회복실, 네비게이션 (이승엽, 강경민 원장 등)
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
- 담당: 이승엽(30,000건+), 강경민, 문석준, 김민수 원장 등

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
- **무료 주차**: 건물 내 주차장 약 30대, 진료 중 무료 (안내데스크 주차 도장)
- 인근 불당동 공영주차장 도보 2분 (시간당 1,000원)
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
10. "대표원장이 누구냐"고 물으면 문석준, 김민수, 현정민 3인이라고 답하되, 문석준 원장은 통합치의학과 전문의가 아님을 유의하세요.`;

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

// Catch-all fallback to index.html (SPA style, but not needed here)
// app.get('*', serveStatic({ path: './index.html' }))

export default app
