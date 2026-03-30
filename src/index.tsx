import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Bindings = {
  DB?: D1Database
  R2?: R2Bucket
  OPENAI_API_KEY?: string
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
}

const app = new Hono<{ Bindings: Bindings }>()

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
  return c.json({ loggedIn: true, user: { id: m.id, email: m.email, name: m.name, phone: m.phone } })
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
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) return c.json({ error: '10MB 이하 파일만 업로드 가능합니다' }, 400)
    
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
app.get('/api/images/*', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.text('R2 not configured', 500)

  const key = c.req.path.replace('/api/images/', '')
  const object = await r2.get(key)
  if (!object) return c.notFound()

  const headers = new Headers()
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('ETag', object.etag)

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
  
  // 민감정보 제외 (beforeImage, afterImage 제외 → 썸네일만 제공)
  const safe = published.map((cs: any) => ({
    id: cs.id,
    title: cs.title,
    category: cs.category,
    doctorName: cs.doctorName,
    treatmentPeriod: cs.treatmentPeriod,
    description: cs.description,
    beforeImage: cs.beforeImage, // 썸네일용
    createdAt: cs.createdAt,
  }))
  
  c.header('Cache-Control', 'public, max-age=60')
  return c.json(safe)
})

// [인증] 케이스 상세 (before + after 이미지 포함) — 로그인 사용자만
app.get('/api/cases/:id', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ error: '스토리지 없음' }, 500)
  
  const id = c.req.param('id')
  const allCases = await getCases(r2)
  const cs = allCases.find((x: any) => x.id === id && x.status === 'published')
  
  if (!cs) return c.json({ error: '케이스를 찾을 수 없습니다' }, 404)
  
  // 로그인 체크 (사이트 회원 또는 관리자)
  const secret = c.env.ADMIN_SESSION_SECRET || 'bd-dental-secret-2026'
  const adminToken = getCookie(c, ADMIN_SESSION_COOKIE)
  const siteToken = getCookie(c, 'bd_session')
  
  let authed = false
  if (adminToken && await verifySessionToken(adminToken, secret)) authed = true
  if (siteToken && await verifySiteSession(siteToken, secret)) authed = true
  
  if (!authed) {
    return c.json({ error: '로그인이 필요합니다', loginUrl: '/auth/login' }, 401)
  }
  
  return c.json(cs)
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

    // R2에 예약 데이터 저장 (실패해도 예약 성공 처리)
    try {
      const r2 = (c.env as any).R2
      if (r2) {
        let reservations: any[] = []
        try {
          const existing = await r2.get('data/reservations.json')
          if (existing) {
            const text = await existing.text()
            if (text) reservations = JSON.parse(text)
          }
        } catch (_) { /* 기존 데이터 없음 - 무시 */ }
        reservations.push(reservation)
        await r2.put('data/reservations.json', JSON.stringify(reservations, null, 2), {
          httpMetadata: { contentType: 'application/json' }
        })
      }
    } catch (r2Err) {
      console.error('R2 save error (reservation still accepted):', r2Err)
    }

    return c.json({ success: true, reservation: { id: reservation.id, name: reservation.name, date: reservation.date, time: reservation.time, treatment: reservation.treatment } })
  } catch (e: any) {
    console.error('Reservation error:', e?.message || e)
    return c.json({ error: '예약 처리 중 오류가 발생했습니다. 전화(041-415-2892)로 예약해주세요.' }, 500)
  }
})

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
    implant:'임플란트', invisalign:'교정(인비절라인)', pediatric:'소아치과',
    aesthetic:'심미치료', glownate:'글로우네이트', cavity:'충치치료',
    resin:'레진치료', crown:'크라운', inlay:'인레이/온레이',
    'root-canal':'신경치료', 're-root-canal':'재신경치료',
    whitening:'미백', bridge:'브릿지', denture:'틀니',
    scaling:'스케일링', gum:'잇몸치료', periodontitis:'치주염',
    'gum-surgery':'잇몸수술', 'wisdom-tooth':'사랑니발치',
    apicoectomy:'치근단절제술', prevention:'예방치료',
    tmj:'턱관절(TMJ)', bruxism:'이갈이/브럭시즘', emergency:'응급치료'
  }
  
  const catLabel = CATS[cs.category] || cs.category || ''
  const dateStr = new Date(cs.createdAt || Date.now()).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })
  
  // 로그인 안 된 경우 → 로그인 유도 페이지
  if (!authed) {
    return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cs.title} | Before/After — 서울비디치과</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/css/site-v5.css?v=0b6913b4">
<style>
.lock-page{min-height:60vh;display:flex;align-items:center;justify-content:center;padding:40px 20px}
.lock-card{max-width:480px;width:100%;text-align:center;background:#fff;border-radius:20px;padding:48px 36px;box-shadow:0 4px 24px rgba(107,66,38,.08)}
.lock-icon{font-size:3rem;color:#c9a96e;margin-bottom:16px}
.lock-title{font-size:1.3rem;font-weight:800;color:#333;margin-bottom:8px}
.lock-desc{font-size:.9rem;color:#888;line-height:1.6;margin-bottom:24px}
.lock-preview{display:flex;gap:12px;justify-content:center;margin-bottom:24px}
.lock-thumb{width:140px;height:100px;border-radius:12px;overflow:hidden;position:relative;background:#f0ebe4}
.lock-thumb img{width:100%;height:100%;object-fit:cover;filter:blur(12px) brightness(.9)}
.lock-thumb::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center}
.lock-label{position:absolute;bottom:6px;left:6px;font-size:.65rem;font-weight:700;color:#fff;background:rgba(0,0,0,.5);padding:2px 8px;border-radius:4px}
.lock-meta{display:flex;gap:16px;justify-content:center;font-size:.8rem;color:#999;margin-bottom:20px}
.btn-login-lg{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:700;font-size:1rem;transition:background .2s}
.btn-login-lg:hover{background:#8B5E3C}
</style>
</head>
<body>
<header class="site-header" id="siteHeader">
<div class="header-container">
<div class="header-brand"><a href="/" class="site-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a></div>
<div class="header-actions"><a href="tel:0414152892" class="header-phone"><i class="fas fa-phone"></i></a><a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a></div>
</div>
</header>
<div class="header-spacer"></div>
<main>
<div class="lock-page">
<div class="lock-card">
<div class="lock-icon"><i class="fas fa-lock"></i></div>
<div class="lock-title">${cs.title}</div>
<div style="margin-bottom:8px;"><span style="font-size:.78rem;padding:3px 12px;background:#f5f0eb;color:#6B4226;border-radius:50px;font-weight:600;">${catLabel}</span></div>
<div class="lock-preview">
${cs.beforeImage ? `<div class="lock-thumb"><img src="${cs.beforeImage}" alt="Before"><span class="lock-label">Before</span></div>` : ''}
${cs.afterImage ? `<div class="lock-thumb"><img src="${cs.afterImage}" alt="After"><span class="lock-label">After</span></div>` : ''}
</div>
<div class="lock-meta">
<span><i class="fas fa-user-md" style="color:#c9a96e;margin-right:3px;"></i> ${cs.doctorName || ''}</span>
${cs.treatmentPeriod ? `<span><i class="fas fa-clock" style="margin-right:3px;"></i> ${cs.treatmentPeriod}</span>` : ''}
<span><i class="far fa-calendar" style="margin-right:3px;"></i> ${dateStr}</span>
</div>
<div class="lock-desc">Before/After 상세 사진은<br><strong>로그인 후 확인</strong>하실 수 있습니다.</div>
<a href="/auth/login?redirect=/cases/${id}" class="btn-login-lg"><i class="fas fa-sign-in-alt"></i> 로그인하고 보기</a>
<div style="margin-top:16px;font-size:.8rem;"><a href="/cases/gallery" style="color:#888;text-decoration:none;"><i class="fas fa-arrow-left" style="margin-right:4px;"></i> 전체 갤러리로 돌아가기</a></div>
</div>
</div>
</main>
<script src="/js/main.js" defer></script>
<script src="/js/gnb.js" defer></script>
</body>
</html>`)
  }
  
  // 로그인 됨 → 상세 페이지
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cs.title} | Before/After — 서울비디치과</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/css/site-v5.css?v=0b6913b4">
<style>
.case-detail{max-width:800px;margin:0 auto;padding:40px 20px}
.case-header{margin-bottom:32px}
.case-title{font-size:1.6rem;font-weight:800;color:#333;margin-bottom:8px}
.case-meta{display:flex;flex-wrap:wrap;gap:16px;font-size:.85rem;color:#888}
.case-meta span{display:flex;align-items:center;gap:4px}
.case-images{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}
.case-img-box{position:relative;border-radius:16px;overflow:hidden;background:#f0ebe4;aspect-ratio:16/9}
.case-img-box img{width:100%;height:100%;object-fit:cover}
.case-img-label{position:absolute;top:12px;left:12px;font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:50px;color:#fff}
.case-img-label.before{background:#f59e0b}
.case-img-label.after{background:#22c55e}
.case-desc{font-size:1rem;color:#555;line-height:1.8;margin-bottom:32px;padding:20px 24px;background:#faf7f3;border-radius:16px}
.case-cta{text-align:center;padding:32px;background:linear-gradient(135deg,#6B4226,#8B5E3C);border-radius:16px;color:#fff}
@media(max-width:600px){.case-images{grid-template-columns:1fr}.case-title{font-size:1.3rem}}
</style>
</head>
<body>
<header class="site-header" id="siteHeader">
<div class="header-container">
<div class="header-brand"><a href="/" class="site-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a></div>
<div class="header-actions"><a href="tel:0414152892" class="header-phone"><i class="fas fa-phone"></i></a><a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a></div>
</div>
</header>
<div class="header-spacer"></div>
<main>
<div class="case-detail">
<nav style="font-size:.85rem;color:#888;margin-bottom:20px;">
<a href="/" style="color:#6B4226;text-decoration:none;">홈</a> &gt;
<a href="/cases/gallery" style="color:#6B4226;text-decoration:none;">Before/After</a> &gt;
<span>${cs.title}</span>
</nav>
<div class="case-header">
<div class="case-title">${cs.title}</div>
<div style="margin-bottom:10px;"><span style="font-size:.8rem;padding:4px 14px;background:#f5f0eb;color:#6B4226;border-radius:50px;font-weight:600;">${catLabel}</span></div>
<div class="case-meta">
<span><i class="fas fa-user-md" style="color:#c9a96e;"></i> ${cs.doctorName || ''}</span>
${cs.treatmentPeriod ? `<span><i class="fas fa-clock" style="color:#c9a96e;"></i> ${cs.treatmentPeriod}</span>` : ''}
<span><i class="far fa-calendar" style="color:#c9a96e;"></i> ${dateStr}</span>
</div>
</div>
<div class="case-images">
${cs.beforeImage ? `<div class="case-img-box"><img src="${cs.beforeImage}" alt="Before"><span class="case-img-label before">Before</span></div>` : ''}
${cs.afterImage ? `<div class="case-img-box"><img src="${cs.afterImage}" alt="After"><span class="case-img-label after">After</span></div>` : ''}
</div>
${cs.description ? `<div class="case-desc"><h3 style="font-size:1rem;font-weight:700;color:#333;margin-bottom:8px;"><i class="fas fa-stethoscope" style="color:#c9a96e;margin-right:6px;"></i> 치료 설명</h3>${cs.description}</div>` : ''}
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
<script src="/js/main.js" defer></script>
<script src="/js/gnb.js" defer></script>
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
    const linkHtml = `<a href="/encyclopedia/${encodeURIComponent(item.term)}" style="color:#6B4226;text-decoration:underline;text-decoration-style:dotted;font-weight:600;" title="${item.short}">${item.term}</a>`
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
<link rel="stylesheet" href="/css/site-v5.css?v=0b6913b4">
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

// 카테고리별 소개문 및 아이콘
const categoryMeta: Record<string, {icon: string; intro: string; keywords: string[]}> = {
  '치아 구조': { icon: 'fa-tooth', intro: '치아의 구조와 기능을 이해하면 구강 건강 관리가 쉬워집니다. 법랑질부터 치근까지, 치아를 구성하는 각 부위의 역할과 특징을 알아보세요.', keywords: ['치아 구조', '치아 해부학', '법랑질', '상아질', '치수', '치근'] },
  '치과 질환': { icon: 'fa-viruses', intro: '충치, 치주염, 부정교합 등 흔한 치과 질환의 원인·증상·예방법을 정리했습니다. 조기 발견과 치료가 건강한 치아의 핵심입니다.', keywords: ['치과 질환', '충치', '치주염', '잇몸 질환', '구강 질환', '치아 통증'] },
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
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
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
<meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${catName} 치과 용어 ${catItems.length}개 | 서울비디치과 백과사전">
<meta name="twitter:description" content="${meta.intro.slice(0, 120)}">
<meta name="twitter:image" content="https://bdbddc.com/images/og-image.jpg">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/site-v5.css?v=0b6913b4">
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
