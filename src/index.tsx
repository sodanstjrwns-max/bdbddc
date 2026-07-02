import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Bindings } from './types'
import { registerGscReport } from './routes/gsc-report-dash'

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
<!-- Amplitude Analytics (지연 로더 — LCP 개선) -->
<script src="/static/bd-tag-loader.js" defer></script>
<script src="/static/bd-analytics.js" defer></script>
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
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7일 (컬럼 장시간 작성 중 세션 만료 방지)

// ▶ 보안: 시크릿은 반드시 환경변수에서만 가져온다 (하드코딩 fallback 금지)
// 미설정 시 빈 문자열 반환 → 모든 인증이 거부됨 (fail-closed)
function getSessionSecret(env: Bindings): string {
  return env.ADMIN_SESSION_SECRET || ''
}

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
  if (!secret) return false // 시크릿 미설정 시 모든 세션 거부 (fail-closed)
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
  // ▶ 보안: 환경변수 미설정 시 로그인 자체를 차단 (fail-closed)
  const adminPw = c.env.ADMIN_PASSWORD
  const secret = getSessionSecret(c.env)
  if (!adminPw || !secret) {
    console.error('ADMIN_PASSWORD / ADMIN_SESSION_SECRET not configured')
    return c.html(adminLoginPage('관리자 인증이 설정되지 않았습니다. 관리자에게 문의하세요.'), 503)
  }

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

  const secret = getSessionSecret(c.env)
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
app.get('/admin/intl-inquiries', serveStatic({ path: './admin/intl-inquiries.html' }))
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
  if (!secret) return null // 시크릿 미설정 시 모든 세션 거부 (fail-closed)
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

// ============================================
// 회원 데이터 저장소: D1 (v5.4에서 R2 JSON → D1 이관)
// R2 JSON은 동시 가입 시 race condition(마지막 쓰기 승리)으로 데이터 유실 위험
// 기존 R2 data/members.json은 최초 1회 lazy migration 후 백업으로 보존
// ============================================

// D1 row(snake_case) → member 객체(camelCase)
function memberFromRow(r: any): any {
  if (!r) return null
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    phone: r.phone || '',
    passwordHash: r.password_hash || '',
    passwordSalt: r.password_salt || '',
    googleId: r.google_id || '',
    profileImage: r.profile_image || '',
    provider: r.provider || 'email',
    privacyConsent: !!r.privacy_consent,
    marketingConsent: !!r.marketing_consent,
    marketingConsentUpdatedAt: r.marketing_consent_updated_at || '',
    createdAt: r.created_at || '',
  }
}

async function insertMemberD1(db: D1Database, m: any) {
  await db.prepare(`INSERT OR IGNORE INTO members
    (id, email, name, phone, password_hash, password_salt, google_id, profile_image, provider, privacy_consent, marketing_consent, marketing_consent_updated_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      m.id, (m.email || '').toLowerCase().trim(), m.name || '', m.phone || '',
      m.passwordHash || '', m.passwordSalt || '', m.googleId || '', m.profileImage || '',
      m.provider || 'email', m.privacyConsent ? 1 : 0, m.marketingConsent ? 1 : 0,
      m.marketingConsentUpdatedAt || '', m.createdAt || new Date().toISOString()
    ).run()
}

// R2 members.json → D1 최초 1회 자동 이관 (isolate 캐시 + R2 플래그로 중복 방지)
let membersMigrationChecked = false
async function ensureMembersMigrated(db: D1Database, r2?: R2Bucket) {
  if (membersMigrationChecked || !r2) { membersMigrationChecked = true; return }
  try {
    const flag = await r2.head('data/members-migrated.flag')
    if (!flag) {
      const obj = await r2.get(MEMBERS_JSON_KEY)
      if (obj) {
        const arr = await obj.json() as any
        if (Array.isArray(arr)) {
          for (const m of arr) {
            if (m && m.id && m.email) await insertMemberD1(db, m)
          }
          console.log(`✅ members migration: R2 → D1 ${arr.length}건 이관 완료`)
        }
      }
      await r2.put('data/members-migrated.flag', new Date().toISOString(), { httpMetadata: { contentType: 'text/plain' } })
    }
    membersMigrationChecked = true
  } catch (e) {
    console.error('members migration check failed:', e)
    // 실패 시 다음 요청에서 재시도 (membersMigrationChecked 유지 안 함)
  }
}

async function findMemberByEmail(db: D1Database, email: string): Promise<any|null> {
  const row = await db.prepare('SELECT * FROM members WHERE email = ?').bind(email.toLowerCase().trim()).first()
  return memberFromRow(row)
}
async function findMemberById(db: D1Database, id: string): Promise<any|null> {
  const row = await db.prepare('SELECT * FROM members WHERE id = ?').bind(id).first()
  return memberFromRow(row)
}

// 비밀번호 재설정 토큰: SHA-256 해시만 DB 저장 (원문 노출 방지)
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}

// [공개] 회원가입
app.post('/api/auth/register', async (c) => {
  const db = c.env.DB
  if (!db) return c.json({ error: '서버 오류' }, 500)
  await ensureMembersMigrated(db, c.env.R2)

  const { email, password, name, phone, privacyConsent, marketingConsent } = await c.req.json()

  // 유효성 검사
  if (!email || !password || !name || !phone) return c.json({ error: '모든 필수 항목을 입력해주세요.' }, 400)
  if (!privacyConsent) return c.json({ error: '개인정보 수집·이용에 동의해주세요.' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: '올바른 이메일 형식이 아닙니다.' }, 400)
  if (password.length < 6) return c.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, 400)
  if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g,''))) return c.json({ error: '올바른 휴대폰 번호를 입력해주세요.' }, 400)

  if (await findMemberByEmail(db, email)) return c.json({ error: '이미 가입된 이메일입니다.' }, 409)

  const { hash, salt } = await hashPassword(password)
  const member = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    phone: phone.replace(/\s/g,'').trim(),
    passwordHash: hash,
    passwordSalt: salt,
    provider: 'email',
    privacyConsent: true,
    marketingConsent: !!marketingConsent,
    createdAt: new Date().toISOString(),
  }
  try {
    await db.prepare(`INSERT INTO members
      (id, email, name, phone, password_hash, password_salt, provider, privacy_consent, marketing_consent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'email', 1, ?, ?)`)
      .bind(member.id, member.email, member.name, member.phone, hash, salt, member.marketingConsent ? 1 : 0, member.createdAt).run()
  } catch (e: any) {
    if (String(e?.message || e).includes('UNIQUE')) return c.json({ error: '이미 가입된 이메일입니다.' }, 409)
    throw e
  }

  // 자동 로그인 (세션 발급)
  const secret = getSessionSecret(c.env)
  const token = await createSiteSession(member.id, secret)
  const isSecure = c.req.url.startsWith('https')
  setCookie(c, SITE_SESSION_COOKIE, token, { path: '/', httpOnly: true, secure: isSecure, sameSite: 'Lax', maxAge: SITE_SESSION_MAX_AGE })

  return c.json({ success: true, user: { id: member.id, email: member.email, name: member.name } })
})

// [공개] 로그인
app.post('/api/auth/login', async (c) => {
  const db = c.env.DB
  if (!db) return c.json({ error: '서버 오류' }, 500)
  await ensureMembersMigrated(db, c.env.R2)

  const { email, password } = await c.req.json()
  if (!email || !password) return c.json({ error: '이메일과 비밀번호를 입력해주세요.' }, 400)

  // 무차별 대입 방어: 15분 20회
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  if (await isRateLimitedD1(db, 'login', ip, 15 * 60 * 1000, 20)) {
    return c.json({ error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.' }, 429)
  }

  const member = await findMemberByEmail(db, email)
  if (!member || !member.passwordHash) return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)

  const { hash } = await hashPassword(password, member.passwordSalt)
  if (hash !== member.passwordHash) return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)

  const secret = getSessionSecret(c.env)
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
  const db = c.env.DB
  if (!db) return c.json({ loggedIn: false })
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, SITE_SESSION_COOKIE)
  if (!token) return c.json({ loggedIn: false })
  const userId = await verifySiteSession(token, secret)
  if (!userId) return c.json({ loggedIn: false })
  await ensureMembersMigrated(db, c.env.R2)
  const m = await findMemberById(db, userId)
  if (!m) return c.json({ loggedIn: false })
  return c.json({ loggedIn: true, user: { id: m.id, email: m.email, name: m.name, phone: m.phone, marketingConsent: !!m.marketingConsent, createdAt: m.createdAt || '' } })
})

// [인증] 마케팅 수신 동의 변경
app.put('/api/auth/marketing', async (c) => {
  const db = c.env.DB
  if (!db) return c.json({ error: '서버 오류' }, 500)
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, SITE_SESSION_COOKIE)
  if (!token) return c.json({ error: '로그인이 필요합니다' }, 401)
  const userId = await verifySiteSession(token, secret)
  if (!userId) return c.json({ error: '로그인이 필요합니다' }, 401)

  const { marketingConsent } = await c.req.json()
  const res = await db.prepare('UPDATE members SET marketing_consent = ?, marketing_consent_updated_at = ? WHERE id = ?')
    .bind(marketingConsent ? 1 : 0, new Date().toISOString(), userId).run()
  if (!res.meta.changes) return c.json({ error: '회원 정보를 찾을 수 없습니다' }, 404)

  return c.json({ success: true, marketingConsent: !!marketingConsent })
})

// ============================================
// 비밀번호 찾기 (재설정 링크 이메일 발송)
// ============================================

// [공개] 비밀번호 재설정 요청 → 이메일로 링크 발송
app.post('/api/auth/forgot-password', async (c) => {
  const db = c.env.DB
  if (!db) return c.json({ error: '서버 오류' }, 500)
  await ensureMembersMigrated(db, c.env.R2)

  const { email } = await c.req.json()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: '올바른 이메일을 입력해주세요.' }, 400)

  // 남용 방지: IP당 15분 5회
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  if (await isRateLimitedD1(db, 'pwreset', ip, 15 * 60 * 1000, 5)) {
    return c.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, 429)
  }

  // 이메일 존재 여부와 무관하게 동일 응답 (계정 존재 유출 방지)
  const okMsg = { success: true, message: '가입된 이메일이라면 재설정 링크가 발송됩니다. 메일함(스팸함 포함)을 확인해주세요.' }

  const member = await findMemberByEmail(db, email)
  if (!member) return c.json(okMsg)
  // 구글 전용 계정(비밀번호 미설정)도 재설정 허용 → 이메일 로그인 겸용 가능

  // 토큰 생성: 원문은 이메일로만, DB에는 SHA-256 해시 저장 (1시간 유효)
  const rawToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const tokenHash = await sha256Hex(rawToken)
  const expires = Date.now() + 60 * 60 * 1000
  await db.prepare('UPDATE members SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?')
    .bind(tokenHash, expires, member.id).run()

  const resendKey = (c.env as any).RESEND_API_KEY
  if (!resendKey) {
    console.error('RESEND_API_KEY 미설정 — 비밀번호 재설정 메일 발송 불가')
    return c.json({ error: '메일 발송 설정이 완료되지 않았습니다. 병원(041-415-2892)으로 문의해주세요.' }, 500)
  }

  const origin = new URL(c.req.url).origin
  const resetUrl = `${origin}/auth/reset-password?token=${rawToken}`
  const emailHtml = `<div style="max-width:480px;margin:0 auto;font-family:'Apple SD Gothic Neo',sans-serif;border:1px solid #eee;border-radius:12px;overflow:hidden;">
  <div style="background:#6B4226;color:#fff;padding:20px 24px;font-size:18px;font-weight:700;">🦷 서울비디치과</div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#333;">안녕하세요, <strong>${member.name}</strong>님.</p>
    <p style="font-size:14px;color:#555;line-height:1.7;">비밀번호 재설정 요청을 받았습니다.<br>아래 버튼을 눌러 새 비밀번호를 설정해주세요. <strong>링크는 1시간 동안만 유효</strong>합니다.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#6B4226;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">비밀번호 재설정하기</a>
    </div>
    <p style="font-size:12px;color:#999;line-height:1.6;">본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다. 비밀번호는 변경되지 않습니다.</p>
  </div>
  <div style="padding:12px;text-align:center;font-size:10px;color:#ccc;background:#fafafa;">서울비디치과 | 천안시 서북구 불당34길 14 | 041-415-2892</div>
</div>`

  const sendEmail = fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: '서울비디치과 <noreply@patientview.kr>',
      to: [member.email],
      subject: '[서울비디치과] 비밀번호 재설정 안내',
      html: emailHtml
    })
  }).then(res => {
    if (!res.ok) res.text().then(t => console.error('Resend pwreset error:', t))
  }).catch(err => console.error('Resend pwreset fetch error:', err))
  if (c.executionCtx?.waitUntil) c.executionCtx.waitUntil(sendEmail)
  else await sendEmail

  return c.json(okMsg)
})

// [공개] 재설정 토큰 검증 + 새 비밀번호 설정
app.post('/api/auth/reset-password', async (c) => {
  const db = c.env.DB
  if (!db) return c.json({ error: '서버 오류' }, 500)

  const { token, password } = await c.req.json()
  if (!token || typeof token !== 'string' || token.length < 32) return c.json({ error: '유효하지 않은 요청입니다.' }, 400)
  if (!password || password.length < 6) return c.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, 400)

  const tokenHash = await sha256Hex(token)
  const row = await db.prepare('SELECT * FROM members WHERE reset_token_hash = ? AND reset_token_expires > ?')
    .bind(tokenHash, Date.now()).first()
  if (!row) return c.json({ error: '링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요.' }, 400)

  const { hash, salt } = await hashPassword(password)
  await db.prepare(`UPDATE members SET password_hash = ?, password_salt = ?, reset_token_hash = '', reset_token_expires = 0 WHERE id = ?`)
    .bind(hash, salt, (row as any).id).run()

  return c.json({ success: true, message: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.' })
})

// [인증] 로그인 상태에서 비밀번호 변경 (마이페이지)
app.post('/api/auth/change-password', async (c) => {
  const db = c.env.DB
  if (!db) return c.json({ error: '서버 오류' }, 500)
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, SITE_SESSION_COOKIE)
  if (!token) return c.json({ error: '로그인이 필요합니다' }, 401)
  const userId = await verifySiteSession(token, secret)
  if (!userId) return c.json({ error: '로그인이 필요합니다' }, 401)

  const { currentPassword, newPassword } = await c.req.json()
  if (!newPassword || newPassword.length < 6) return c.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, 400)

  const member = await findMemberById(db, userId)
  if (!member) return c.json({ error: '회원 정보를 찾을 수 없습니다' }, 404)

  if (member.passwordHash) {
    // 기존 비밀번호가 있는 계정 → 현재 비밀번호 확인 필수
    if (!currentPassword) return c.json({ error: '현재 비밀번호를 입력해주세요.' }, 400)
    // 무차별 대입 방어: 계정당 15분 10회
    if (await isRateLimitedD1(db, 'pwchange', userId, 15 * 60 * 1000, 10)) {
      return c.json({ error: '시도가 너무 많습니다. 잠시 후 다시 시도해주세요.' }, 429)
    }
    const { hash } = await hashPassword(currentPassword, member.passwordSalt)
    if (hash !== member.passwordHash) return c.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, 401)
    if (currentPassword === newPassword) return c.json({ error: '새 비밀번호가 기존과 동일합니다.' }, 400)
  }
  // Google 전용 계정(passwordHash 없음)은 현재 비밀번호 없이 최초 설정 허용

  const { hash: newHash, salt: newSalt } = await hashPassword(newPassword)
  await db.prepare(`UPDATE members SET password_hash = ?, password_salt = ?, reset_token_hash = '', reset_token_expires = 0 WHERE id = ?`)
    .bind(newHash, newSalt, userId).run()

  return c.json({ success: true, message: '비밀번호가 변경되었습니다.' })
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
  const db = c.env.DB
  if (!db) return c.text('서버 오류', 500)

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

    // 3. 기존 회원 확인 또는 자동 가입 (D1)
    await ensureMembersMigrated(db, c.env.R2)
    let member = await findMemberByEmail(db, email)

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
      await insertMemberD1(db, member)
    } else if (!member.googleId) {
      // 기존 이메일 회원 → Google 연동
      const newProvider = member.provider ? `${member.provider},google` : 'google'
      await db.prepare('UPDATE members SET google_id = ?, profile_image = ?, provider = ? WHERE id = ?')
        .bind(googleUser.id, member.profileImage || googleUser.picture || '', newProvider, member.id).run()
    }

    // 4. 세션 발급
    const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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

// slug 헬퍼: case 객체에서 URL용 slug 반환 (slug 없으면 id 폴백)
function caseSlug(cs: any): string { return cs.slug || cs.id }
// 케이스 찾기: slug OR id로 매칭
function findCaseByParam(all: any[], param: string): any {
  return all.find((x: any) => (x.slug === param || x.id === param) && x.status === 'published')
}

// 케이스 카테고리 → 치료 URL 매핑 (SEO 양방향 링크용)
const CASE_CATEGORY_TREATMENT_MAP: Record<string, { href: string, label: string, icon: string }> = {
  'implant': { href: '/treatments/implant', label: '임플란트', icon: 'fas fa-tooth' },
  'invisalign': { href: '/treatments/invisalign', label: '인비절라인', icon: 'fas fa-teeth-open' },
  'orthodontics': { href: '/treatments/orthodontics', label: '치아교정', icon: 'fas fa-teeth' },
  'aesthetic': { href: '/treatments/aesthetic', label: '심미치료', icon: 'fas fa-sparkles' },
  'front-crown': { href: '/treatments/crown', label: '앞니크라운', icon: 'fas fa-crown' },
  'glownate': { href: '/treatments/glownate', label: '글로우네이트', icon: 'fas fa-star' },
  'cavity': { href: '/treatments/cavity', label: '충치치료', icon: 'fas fa-tooth' },
  'resin': { href: '/treatments/resin', label: '레진치료', icon: 'fas fa-fill-drip' },
  'crown': { href: '/treatments/crown', label: '크라운', icon: 'fas fa-crown' },
  'inlay': { href: '/treatments/inlay', label: '인레이/온레이', icon: 'fas fa-puzzle-piece' },
  'root-canal': { href: '/treatments/root-canal', label: '신경치료', icon: 'fas fa-syringe' },
  're-root-canal': { href: '/treatments/re-root-canal', label: '재신경치료', icon: 'fas fa-redo' },
  'whitening': { href: '/treatments/whitening', label: '미백', icon: 'fas fa-sun' },
  'bridge': { href: '/treatments/bridge', label: '브릿지', icon: 'fas fa-bridge' },
  'scaling': { href: '/treatments/scaling', label: '스케일링', icon: 'fas fa-teeth' },
  'gum': { href: '/treatments/gum', label: '잇몸치료', icon: 'fas fa-heart' },
  'wisdom-tooth': { href: '/treatments/wisdom-tooth', label: '사랑니발치', icon: 'fas fa-tooth' },
  'pediatric': { href: '/treatments/pediatric', label: '소아치과', icon: 'fas fa-child' },
  'sedation': { href: '/treatments/implant-sedation', label: '수면치료', icon: 'fas fa-moon' },
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
  const secret = getSessionSecret(c.env)
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
      slug: cs.slug || '',
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

// [공개] 케이스 상세 — ★ 비로그인 시 after 이미지 미노출 (slug OR id 지원)
app.get('/api/cases/:param', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ error: '스토리지 없음' }, 500)
  
  const param = c.req.param('param')
  const allCases = await getCases(r2)
  const cs = findCaseByParam(allCases, param)
  
  if (!cs) return c.json({ error: '케이스를 찾을 수 없습니다' }, 404)
  
  // 로그인 여부 확인
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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

// [관리자] 개별 케이스 저장/수정 (slug 검증 포함)
app.put('/api/admin/cases/:id', async (c) => {
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) {
    return c.json({ error: '인증이 필요합니다' }, 401)
  }
  
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  
  const id = c.req.param('id')
  const data = await c.req.json()
  const allCases = await getCases(r2)
  
  // slug 중복 체크 (slug가 있을 때만)
  if (data.slug) {
    data.slug = data.slug.toLowerCase().replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const dup = allCases.find((x: any) => x.slug === data.slug && x.id !== id)
    if (dup) return c.json({ error: `slug "${data.slug}"가 이미 사용 중입니다` }, 400)
  }
  
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
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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

// ===== 해외 환자 예약 API (글로우네이트 /jp, /cn 전용) =====
app.post('/api/reservations', async (c) => {
  try {
    let body: any
    try { body = await c.req.json() } catch { return c.json({ error: 'Invalid request' }, 400) }
    const { name, contact, visit_date, teeth_count, message, language, source_page } = body
    if (!name || !contact) return c.json({ error: 'Name and contact are required' }, 400)

    const langMap: Record<string,string> = { ja: '日本語', zh: '中文', en: 'English', ko: '한국어' }
    const reservation = {
      id: `intl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: String(name).trim(),
      contact: String(contact).trim(),
      visitDate: visit_date ? String(visit_date) : '',
      teethCount: teeth_count ? String(teeth_count) : '',
      message: message ? String(message).trim() : '',
      language: langMap[language] || language || 'Unknown',
      sourcePage: source_page || '',
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    // R2에 저장
    try {
      const r2 = (c.env as any).R2
      if (r2) {
        await r2.put(`data/intl-reservations/${reservation.id}.json`, JSON.stringify(reservation, null, 2), {
          httpMetadata: { contentType: 'application/json' }
        })
      }
    } catch (r2Err) { console.error('R2 intl-reservation save error:', r2Err) }

    // 이메일 알림 (Resend)
    try {
      const resendKey = (c.env as any).RESEND_API_KEY
      const notifyEmail = (c.env as any).NOTIFICATION_EMAIL || 'sodanstjrwns@gmail.com'
      if (resendKey) {
        const kstTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
        const emailHtml = `
<div style="font-family:sans-serif;max-width:440px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a2e;padding:20px 24px;text-align:center;">
    <div style="color:#c9a96e;font-size:20px;font-weight:900;letter-spacing:2px;">GLOWNATE</div>
    <div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:4px;">🌏 해외 환자 문의 — ${reservation.language}</div>
  </div>
  <div style="padding:24px;">
    <div style="background:#FFF8F0;border:2px solid #c9a96e;border-radius:12px;padding:20px;">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#c9a96e,#e8d5a8);line-height:48px;color:#1a1a2e;font-size:20px;font-weight:900;">${reservation.name.charAt(0)}</div>
        <div style="font-size:18px;font-weight:800;color:#1a1a2e;margin-top:8px;">${reservation.name}</div>
        <div style="font-size:13px;color:#c9a96e;font-weight:600;">글로우네이트 해외 문의 · ${reservation.language}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px;border-bottom:1px solid #f0ebe4;color:#999;font-size:11px;">📱 연락처</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #f0ebe4;font-weight:700;color:#1a1a2e;">${reservation.contact}</td></tr>
        ${reservation.visitDate ? `<tr><td style="padding:8px;border-bottom:1px solid #f0ebe4;color:#999;font-size:11px;">📅 방문 예정일</td></tr><tr><td style="padding:8px;border-bottom:1px solid #f0ebe4;font-weight:700;">${reservation.visitDate}</td></tr>` : ''}
        ${reservation.teethCount ? `<tr><td style="padding:8px;border-bottom:1px solid #f0ebe4;color:#999;font-size:11px;">🦷 시술 본수</td></tr><tr><td style="padding:8px;border-bottom:1px solid #f0ebe4;font-weight:700;">${reservation.teethCount}</td></tr>` : ''}
        ${reservation.message ? `<tr><td style="padding:8px;border-bottom:1px solid #f0ebe4;color:#999;font-size:11px;">💬 문의 내용</td></tr><tr><td style="padding:8px;border-bottom:1px solid #f0ebe4;">${reservation.message}</td></tr>` : ''}
        <tr><td style="padding:8px;font-size:11px;color:#999;">접수: ${kstTime} | 출처: ${reservation.sourcePage}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin-top:16px;">
      <a href="https://bdbddc.com/admin/intl-inquiries" style="display:inline-block;background:#1a1a2e;color:#c9a96e;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:13px;">관리자에서 확인하기 →</a>
    </div>
  </div>
</div>`
        const sendEmail = fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: '글로우네이트 알림 <noreply@patientview.kr>',
            to: [notifyEmail],
            subject: `[🌏 글로우네이트 해외문의] ${reservation.name} · ${reservation.language} · ${reservation.contact}`,
            html: emailHtml
          })
        }).then(res => { if (!res.ok) res.text().then(t => console.error('Resend intl error:', t)) })
          .catch(err => console.error('Resend intl fetch error:', err))
        if (c.executionCtx?.waitUntil) c.executionCtx.waitUntil(sendEmail)
      }
    } catch (emailErr) { console.error('Intl email error:', emailErr) }

    return c.json({ success: true, id: reservation.id })
  } catch (e: any) {
    console.error('Intl reservation error:', e?.message || e)
    return c.json({ error: 'Server error. Please try again.' }, 500)
  }
})

// ===== 해외 환자 예약 관리자 API =====
app.get('/api/admin/intl-reservations', async (c) => {
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증 필요' }, 401)
  try {
    const r2 = (c.env as any).R2
    if (!r2) return c.json({ error: 'R2 없음' }, 500)
    const listed = await r2.list({ prefix: 'data/intl-reservations/' })
    const items: any[] = []
    for (const obj of listed.objects) {
      if (obj.key.endsWith('.json')) {
        try {
          const item = await r2.get(obj.key)
          if (item) items.push(JSON.parse(await item.text()))
        } catch (_) {}
      }
    }
    items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return c.json(items, 200, { 'Cache-Control': 'no-cache' })
  } catch (e: any) { return c.json({ error: '조회 실패' }, 500) }
})

app.put('/api/admin/intl-reservations/:id', async (c) => {
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증 필요' }, 401)
  try {
    const r2 = (c.env as any).R2
    if (!r2) return c.json({ error: 'R2 없음' }, 500)
    const id = c.req.param('id')
    const body = await c.req.json()
    const key = `data/intl-reservations/${id}.json`
    const existing = await r2.get(key)
    if (!existing) return c.json({ error: '없음' }, 404)
    const data = JSON.parse(await existing.text())
    if (body.status) data.status = body.status
    if (body.adminMemo !== undefined) data.adminMemo = body.adminMemo
    data.updatedAt = new Date().toISOString()
    await r2.put(key, JSON.stringify(data, null, 2), { httpMetadata: { contentType: 'application/json' } })
    return c.json({ success: true, data })
  } catch (e: any) { return c.json({ error: '업데이트 실패' }, 500) }
})

app.delete('/api/admin/intl-reservations/:id', async (c) => {
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증 필요' }, 401)
  try {
    const r2 = (c.env as any).R2
    if (!r2) return c.json({ error: 'R2 없음' }, 500)
    await r2.delete(`data/intl-reservations/${c.req.param('id')}.json`)
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: '삭제 실패' }, 500) }
})

// 301 Redirect: International landing pages (alternate URLs)
app.get('/japan', (c) => c.redirect('/jp/', 301))
app.get('/japan/', (c) => c.redirect('/jp/', 301))
app.get('/china', (c) => c.redirect('/cn/', 301))
app.get('/china/', (c) => c.redirect('/cn/', 301))
// GSC 빈 200 응답 해결: /treatments/glownate/jp,cn → 실제 LP로 301 (2026-05-14)
app.get('/treatments/glownate/jp', (c) => c.redirect('/jp/', 301))
app.get('/treatments/glownate/cn', (c) => c.redirect('/cn/', 301))

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

// slug 헬퍼: col 객체에서 URL용 slug 반환 (slug 없으면 id 폴백)
function colSlug(col: any): string { return col.slug || col.id }
// 컬럼 찾기: slug OR id로 매칭
function findColumnByParam(all: any[], param: string): any {
  return all.find((x: any) => (x.slug === param || x.id === param) && x.status === 'published')
}

// doctorName → slug 매핑
const DOCTOR_SLUG_MAP: Record<string,string> = {
  '문석준 원장':'moon','김민수 원장':'kim','현정민 원장':'hyun',
  '이승엽 원장':'lee','김민규 원장':'kim-mg','임지원 원장':'lim',
  '조설아 원장':'jo','강민지 원장':'kang-mj','김민진 원장':'kim-mj',
  '박상현 원장':'park','서희원 원장':'seo','이병민 원장':'lee-bm',
  '최종훈 원장':'choi','박수빈 원장':'park-sb',
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
    id: col.id, slug: colSlug(col), title: col.title, excerpt: (col.content || '').replace(/<[^>]*>/g, '').slice(0, 120),
    doctorName: col.doctorName, category: col.category || '',
    thumbnailImage: col.thumbnailImage || '', createdAt: col.createdAt,
  })))
})

// [공개] 컬럼 상세 API (slug OR id)
app.get('/api/columns/:param', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.json({ error: '스토리지 없음' }, 500)
  const all = await getColumns(r2)
  const col = findColumnByParam(all, c.req.param('param'))
  if (!col) return c.json({ error: '컬럼을 찾을 수 없습니다' }, 404)
  return c.json(col)
})

// [관리자] 컬럼 전체 목록
app.get('/api/admin/columns', async (c) => {
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증이 필요합니다' }, 401)
  const r2 = c.env.R2
  if (!r2) return c.json([])
  return c.json(await getColumns(r2))
})

// [관리자] 컬럼 생성/수정
app.post('/api/admin/columns', async (c) => {
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증이 필요합니다' }, 401)
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  const body = await c.req.json()
  const all = await getColumns(r2)
  
  // slug 중복 체크 (slug가 있을 때만)
  if (body.slug) {
    body.slug = body.slug.toLowerCase().replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const dup = all.find((x: any) => x.slug === body.slug && x.id !== (body.id || ''))
    if (dup) return c.json({ error: `slug "${body.slug}"가 이미 사용 중입니다` }, 400)
  }
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
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증이 필요합니다' }, 401)
  const r2 = c.env.R2
  if (!r2) return c.json({ error: 'R2 없음' }, 500)
  const all = await getColumns(r2)
  const filtered = all.filter((x: any) => x.id !== c.req.param('id'))
  await saveColumns(r2, filtered)
  return c.json({ success: true })
})

// ===== 관리자 회원 목록 API (D1) =====
app.get('/api/admin/members', async (c) => {
  const secret = getSessionSecret(c.env)
  const token = getCookie(c, ADMIN_SESSION_COOKIE)
  if (!token || !(await verifySessionToken(token, secret))) return c.json({ error: '인증이 필요합니다' }, 401)
  const db = c.env.DB
  if (!db) return c.json({ error: 'DB 없음' }, 500)
  await ensureMembersMigrated(db, c.env.R2)
  const { results } = await db.prepare(
    'SELECT id, email, name, phone, provider, privacy_consent, marketing_consent, created_at FROM members ORDER BY created_at DESC'
  ).all()
  const safe = (results || []).map((m: any) => ({
    id: m.id,
    email: m.email,
    name: m.name,
    phone: m.phone || '',
    provider: m.provider || 'email',
    privacyConsent: !!m.privacy_consent,
    marketingConsent: !!m.marketing_consent,
    createdAt: m.created_at,
  }))
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
// GSC "크롤링됨-미색인" 74건 해결 (2026-05-14)
// ============================================
// A) .html 확장자 URL → clean URL 301 리디렉션 (빈 200 응답 문제 해결)
app.get('/cases/index.html', (c) => c.redirect('/cases/', 301))
app.get('/cases/gallery.html', (c) => c.redirect('/cases/gallery', 301))
app.get('/column/index.html', (c) => c.redirect('/column/', 301))
app.get('/video/index.html', (c) => c.redirect('/video/', 301))
app.get('/treatments/prevention.html', (c) => c.redirect('/treatments/prevention', 301))
app.get('/treatments/gum-surgery.html', (c) => c.redirect('/treatments/gum-surgery', 301))
app.get('/treatments/implant.html', (c) => c.redirect('/treatments/implant', 301))
app.get('/treatments/apicoectomy.html', (c) => c.redirect('/treatments/apicoectomy', 301))
app.get('/faq/orthodontics.html', (c) => c.redirect('/faq/orthodontics', 301))
app.get('/area/seosan.html', (c) => c.redirect('/area/seosan', 301))
app.get('/area/daejeon.html', (c) => c.redirect('/area/daejeon', 301))
app.get('/area/hongseong.html', (c) => c.redirect('/area/hongseong', 301))
app.get('/auth/register.html', (c) => c.redirect('/auth/register', 301))
// B) 존재하지 않는 treatments 경로 → 301 리디렉트
app.get('/treatments/front-crown', (c) => c.redirect('/treatments/crown', 301))

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

// ============================================
// 천안 진료 특화 URL → /area/cheonan 통합 (2026-05-29 복구)
// ============================================
// 사이트 전체 주제가 천안 치과이므로 천안 진료 특화 페이지를 별도로 두지 않음.
// 모든 천안+진료 키워드는 /area/cheonan 메인 페이지(이미 임플란트·인비절라인·라미네이트 H2 포함)로 통합.
// 이전 1528줄 잘못된 301이 구글에서 천안 임플란트 키워드 증발을 일으켰으므로,
// 메인 페이지(/area/cheonan) 자체를 강력한 천안 허브로 유지하는 것이 최선.
//
// ❌ 슬래시 형식 (빈 200 응답이었던 URL들) → /area/cheonan으로 301
app.get('/area/cheonan/implant', (c) => c.redirect('/area/cheonan', 301))
app.get('/area/cheonan/laminate', (c) => c.redirect('/area/cheonan', 301))
app.get('/area/cheonan/invisalign', (c) => c.redirect('/area/cheonan', 301))
// ❌ 하이픈 형식은 /area/cheonan으로 자연스럽게 301 (의도는 같지만 메인 페이지가 핵심 허브)
app.get('/area/cheonan-implant', (c) => c.redirect('/area/cheonan', 301))
app.get('/area/cheonan-laminate', (c) => c.redirect('/area/cheonan', 301))
app.get('/area/cheonan-invisalign', (c) => c.redirect('/area/cheonan', 301))

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
      <link>https://bdbddc.com/column/${colSlug(col)}</link>
      <guid isPermaLink="true">https://bdbddc.com/column/${colSlug(col)}</guid>
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

// ============================================
// 동적 사이트맵: 컬럼 개별 URL (R2 실시간)
// ============================================
app.get('/sitemap-columns.xml', async (c) => {
  const r2 = c.env.R2
  let columns: any[] = []
  if (r2) {
    const all = await getColumns(r2)
    columns = all.filter((col: any) => col.status === 'published')
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }
  const urls = columns.map((col: any) => {
    const lastmod = (col.updatedAt || col.createdAt || new Date().toISOString()).split('T')[0]
    return `  <url>
    <loc>https://bdbddc.com/column/${colSlug(col)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>`
  }).join('\n')
  // 컬럼 목록 페이지도 포함
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 서울비디치과 원장 컬럼 동적 사이트맵 (R2 실시간) -->
  <!-- 총 ${columns.length}개 컬럼 + 목록 페이지 -->
  <url>
    <loc>https://bdbddc.com/column/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
${urls}
</urlset>`
  // c.text()는 Content-Type을 text/plain으로 강제 덮어쓰므로 c.body() 사용
  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  })
})

// ============================================
// 동적 사이트맵: 케이스(Before/After) 개별 URL (R2 실시간)
// ============================================
app.get('/sitemap-cases.xml', async (c) => {
  const r2 = c.env.R2
  let cases: any[] = []
  if (r2) {
    const all = await getCases(r2)
    cases = all.filter((cs: any) => cs.status === 'published')
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }
  const urls = cases.map((cs: any) => {
    const lastmod = (cs.updatedAt || cs.createdAt || new Date().toISOString()).split('T')[0]
    return `  <url>
    <loc>https://bdbddc.com/cases/${caseSlug(cs)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`
  }).join('\n')
  // 갤러리 목록 페이지도 포함
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 서울비디치과 Before/After 동적 사이트맵 (R2 실시간) -->
  <!-- 총 ${cases.length}개 케이스 + 갤러리 페이지 -->
  <url>
    <loc>https://bdbddc.com/cases/gallery</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
${urls}
</urlset>`
  // c.text()는 Content-Type을 text/plain으로 강제 덮어쓰므로 c.body() 사용
  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  })
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
<li><a href="/treatments/whitening" style="color:#0369a1;font-weight:600;">치아미백 <span class="badge">전문센터</span></a></li>
</ul></div>
<div class="mega-dropdown-section"><strong class="section-heading">일반/보존 진료</strong><ul>
<li><a href="/treatments/cavity">충치치료</a></li>
<li><a href="/treatments/resin">레진치료</a></li>
<li><a href="/treatments/aesthetic">심미레진</a></li>
<li><a href="/treatments/crown">크라운</a></li>
<li><a href="/treatments/inlay">인레이/온레이</a></li>
<li><a href="/treatments/root-canal">신경치료</a></li>
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
<li><a href="/doctors/">전체 의료진 <span class="badge">14인</span></a></li>
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
<li><a href="/guide/regret"><i class="fas fa-heart-crack"></i> 후회 백서</a></li>
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
<li><a href="/treatments/whitening" style="color:#0369a1;font-weight:600;">치아미백 전문센터</a></li>
<li class="submenu-divider">일반 진료</li>
<li><a href="/treatments/cavity">충치치료</a></li>
<li><a href="/treatments/resin">레진치료</a></li>
<li><a href="/treatments/aesthetic">심미레진</a></li>
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
<li><a href="/guide/regret"><i class="fas fa-heart-crack"></i> 후회 백서</a></li>
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
  "description": "서울대 출신 14인 원장이 직접 작성하는 치과 치료 정보 블로그",
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

  // 6) [C] 치료 페이지 권위 회수 — 블로그 본문에 등장하는 치료 키워드를
  //    해당 /treatments/ 페이지로 연결하는 "관련 진료" 박스를 본문 끝에 1회 주입.
  //    (인블로그가 빨아먹던 키워드 권위를 치료 페이지로 PageRank 전달)
  //    안전: 기존 본문 텍스트는 변경하지 않고, 등장한 키워드에 대해서만 박스를 추가.
  const treatmentKeywordMap: Array<{ kw: string; href: string; label: string }> = [
    { kw: '인비절라인', href: '/treatments/invisalign', label: '인비절라인(투명교정)' },
    { kw: '치아교정', href: '/treatments/orthodontics', label: '치아교정' },
    { kw: '라미네이트', href: '/treatments/glownate', label: '라미네이트(글로우네이트)' },
    { kw: '임플란트', href: '/treatments/implant', label: '임플란트' },
  ]
  // 본문(스크립트/스타일 제외)에 키워드가 등장하는지 검사용으로 태그를 거칠게 제거한 텍스트
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
  const matched = treatmentKeywordMap.filter(t => bodyText.includes(t.kw))
  if (matched.length > 0) {
    const linksHtml = matched.map(t =>
      `<a href="${t.href}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#fff;border:1px solid #c9a96e;border-radius:50px;text-decoration:none;color:#6B4226;font-weight:600;font-size:0.9rem;"><i class="fas fa-stethoscope" style="font-size:0.8rem;"></i> ${t.label} 진료 보기</a>`
    ).join('')
    const relatedTreatmentBox = `
<aside data-bd-related-treatment style="max-width:768px;margin:32px auto;padding:24px;background:#faf7f3;border:1px solid #e8d9c1;border-radius:16px;">
<p style="font-size:0.9rem;color:#888;margin:0 0 12px;"><i class="fas fa-link" style="color:#c9a96e;margin-right:6px;"></i> 이 글에서 다룬 치료 — 서울비디치과 진료 안내</p>
<div style="display:flex;flex-wrap:wrap;gap:10px;">${linksHtml}</div>
</aside>`
    // 본문 끝(</article> 우선, 없으면 <footer> 앞, 그것도 없으면 </body> 앞)에 1회 삽입
    if (/<\/article>/i.test(html)) {
      html = html.replace(/<\/article>/i, relatedTreatmentBox + '</article>')
    } else if (/<footer/i.test(html)) {
      html = html.replace(/<footer/i, relatedTreatmentBox + '<footer')
    } else {
      html = html.replace('</body>', relatedTreatmentBox + '</body>')
    }
  }

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

// ============================================
// 동적 사이트맵 인덱스 — 동적 사이트맵(columns/cases)의 lastmod를 항상 당일로 반영
// 정적 사이트맵(main/area/encyclopedia/intl)은 빌드 시점 날짜 유지
// ============================================
app.get('/sitemap.xml', (c) => {
  const today = new Date().toISOString().split('T')[0]
  const STATIC_LASTMOD = '2026-05-30' // 정적 사이트맵 최종 갱신일 (배포 시 갱신)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 서울비디치과 사이트맵 인덱스 (https://bdbddc.com) — 동적 생성 -->
  <sitemap>
    <loc>https://bdbddc.com/sitemap-main.xml</loc>
    <lastmod>${STATIC_LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://bdbddc.com/sitemap-area.xml</loc>
    <lastmod>${STATIC_LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://bdbddc.com/sitemap-encyclopedia.xml</loc>
    <lastmod>${STATIC_LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://bdbddc.com/sitemap-intl.xml</loc>
    <lastmod>${STATIC_LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://bdbddc.com/sitemap-columns.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://bdbddc.com/sitemap-cases.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`
  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  })
})

// Other static files
app.use('/manifest.json', serveStatic())
app.use('/sitemap-main.xml', serveStatic())
app.use('/sitemap-area.xml', serveStatic())
app.use('/sitemap-encyclopedia.xml', serveStatic())
app.use('/sitemap-intl.xml', serveStatic())
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
    '/doctors/choi', '/doctors/lee', '/doctors/park',
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
      return `<a href="/cases/${caseSlug(cs)}" class="dr-case-card" style="text-decoration:none;color:inherit;">
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
      return `<a href="/column/${colSlug(col)}" class="dr-col-card" style="text-decoration:none;color:inherit;">
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
    return `<a href="/column/${colSlug(col)}" class="cc-card">
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
<meta name="ai-summary" content="서울비디치과 원장 컬럼 — 서울대 출신 14인 원장이 직접 쓰는 진료 철학, 치과 지식, 환자 이야기.">
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
<link rel="stylesheet" href="/css/site-v5.css?v=24d559d1">
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
  "description": "서울대 출신 14인 원장이 직접 쓰는 진료 철학, 치과 지식, 환자 이야기",
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
<script src="/js/gnb-v2.js?v=e0c7aede" defer></script>
</body>
</html>`)
})

// 컬럼 상세 페이지 SSR (slug 우선, col-xxx ID는 301 리다이렉트)
app.get('/column/:param', async (c) => {
  const param = c.req.param('param')
  if (param.includes('.')) return c.notFound()
  
  const r2 = c.env.R2
  if (!r2) return c.redirect('/column/', 302)
  
  const all = await getColumns(r2)
  const col = findColumnByParam(all, param)
  if (!col) return c.redirect('/column/', 302)
  
  // 기존 col-xxx ID로 접근 시 → slug URL로 301 리다이렉트 (SEO 가치 이전)
  if (col.slug && param !== col.slug) {
    return c.redirect(`/column/${col.slug}`, 301)
  }
  const id = col.id
  
  const doctorSlug = DOCTOR_SLUG_MAP[col.doctorName] || ''
  const dateStr = new Date(col.createdAt || Date.now()).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })
  const isoDate = col.createdAt ? new Date(col.createdAt).toISOString() : ''
  const isoUpdated = col.updatedAt ? new Date(col.updatedAt).toISOString() : isoDate
  const plainExcerpt = (col.content || '').replace(/<[^>]*>/g, '').slice(0, 160)
  
  // FAQ Schema용: 본문에서 h2/h3→다음텍스트 쌍 추출 (AEO 최적화)
  const faqPairs: {q: string; a: string}[] = []
  const contentStr = col.content || ''
  const headingRegex = /<(h[23])[^>]*>(.*?)<\/\1>/gi
  let hMatch
  while ((hMatch = headingRegex.exec(contentStr)) !== null) {
    const question = hMatch[2].replace(/<[^>]*>/g, '').trim()
    if (!question || question.length < 5) continue
    // 제목 뒤 텍스트를 다음 h2/h3 전까지 추출
    const afterH = contentStr.slice(hMatch.index + hMatch[0].length)
    const nextHIdx = afterH.search(/<h[23]/i)
    const segment = nextHIdx > 0 ? afterH.slice(0, nextHIdx) : afterH.slice(0, 1000)
    const answer = segment.replace(/<[^>]*>/g, '').trim().slice(0, 300)
    if (answer.length >= 20) faqPairs.push({ q: question, a: answer })
  }
  const faqSchema = faqPairs.length >= 2 ? `
<!-- FAQPage Schema (AEO) -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${faqPairs.slice(0, 8).map(f => `{"@type":"Question","name":"${f.q.replace(/"/g, '\\"')}","acceptedAnswer":{"@type":"Answer","text":"${f.a.replace(/"/g, '\\"')}"}}`).join(',')}]}
</script>` : ''
  
  // SEO 메타필드 활용 (에디터에서 입력한 값 우선, 없으면 자동 생성)
  const seoTitle = col.metaTitle || col.title
  const seoDesc = col.metaDescription || plainExcerpt
  const rawThumb = col.thumbnailImage || ''
  const ogImage = rawThumb.startsWith('http') ? rawThumb : rawThumb ? `https://bdbddc.com${rawThumb}` : 'https://bdbddc.com/images/og-image-v2.jpg'
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

  // ===== 관련 컬럼 (같은 저자 or 전체에서 최신 5개, 자기 자신 제외) =====
  const otherCols = all.filter((x: any) => x.id !== id && x.status === 'published')
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)
  const relatedColumnsHtml = otherCols.length > 0 ? `
<!-- 관련 컬럼 내부 링크 블록 (SEO 토픽 클러스터) -->
<section style="margin-top:40px;padding:28px 24px;background:linear-gradient(135deg,#faf7f3 0%,#f5f0eb 100%);border-radius:20px;border:1px solid #ede6dd;">
<h2 style="font-size:1.1rem;font-weight:800;color:#6B4226;margin:0 0 16px;display:flex;align-items:center;gap:8px;"><i class="fas fa-pen-nib"></i> 다른 컬럼도 읽어보세요</h2>
<div style="display:flex;flex-direction:column;gap:10px;">
${otherCols.map((rc: any) => {
  const rcDate = new Date(rc.createdAt || Date.now()).toLocaleDateString('ko-KR', { month:'short', day:'numeric' })
  const rcExcerpt = (rc.content || '').replace(/<[^>]*>/g, '').slice(0, 60) + '...'
  return `<a href="/column/${colSlug(rc)}" style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:#fff;border-radius:14px;text-decoration:none;color:inherit;border:1px solid #ede6dd;transition:all .2s;">
${rc.thumbnailImage ? `<img src="${rc.thumbnailImage}" alt="" style="width:56px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0;">` : `<div style="width:56px;height:56px;border-radius:10px;background:#f5f0eb;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-pen-nib" style="color:#d4c5b3;font-size:1.2rem;"></i></div>`}
<div style="min-width:0;flex:1;">
<div style="font-size:.92rem;font-weight:700;color:#333;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${rc.title}</div>
<div style="font-size:.78rem;color:#999;margin-top:3px;">${rc.doctorName || ''} · ${rcDate}</div>
</div>
</a>`
}).join('\n')}
</div>
</section>` : ''

  // ===== 관련 치료 페이지 매핑 (키워드 기반) =====
  const COLUMN_TREATMENT_MAP: Record<string, { href: string, label: string, icon: string }[]> = {
    '임플란트': [
      { href: '/treatments/implant', label: '임플란트 센터', icon: 'fas fa-tooth' },
      { href: '/treatments/implant-sedation', label: '수면 임플란트', icon: 'fas fa-moon' },
      { href: '/treatments/implant-immediate', label: '즉시 임플란트', icon: 'fas fa-bolt' },
      { href: '/treatments/implant-full-mouth', label: '전악 임플란트', icon: 'fas fa-teeth' },
      { href: '/treatments/implant-sinus-lift', label: '뼈이식·상악동거상술', icon: 'fas fa-bone' },
      { href: '/treatments/implant-navigation', label: '네비게이션 임플란트', icon: 'fas fa-crosshairs' },
    ],
    '수면': [
      { href: '/treatments/implant-sedation', label: '수면 임플란트', icon: 'fas fa-moon' },
    ],
    '마취': [
      { href: '/treatments/implant-sedation', label: '수면 임플란트', icon: 'fas fa-moon' },
    ],
    '공포': [
      { href: '/treatments/implant-sedation', label: '수면 임플란트', icon: 'fas fa-moon' },
    ],
    '뼈이식': [
      { href: '/treatments/implant-sinus-lift', label: '뼈이식·상악동거상술', icon: 'fas fa-bone' },
      { href: '/treatments/implant-advanced', label: '고난도 임플란트', icon: 'fas fa-medal' },
    ],
    '가격': [
      { href: '/pricing', label: '비용 안내', icon: 'fas fa-won-sign' },
      { href: '/treatments/implant', label: '임플란트 센터', icon: 'fas fa-tooth' },
    ],
    '통증': [
      { href: '/treatments/implant-sedation', label: '수면 임플란트', icon: 'fas fa-moon' },
      { href: '/treatments/implant', label: '임플란트 센터', icon: 'fas fa-tooth' },
    ],
    '붓기': [
      { href: '/treatments/implant', label: '임플란트 센터', icon: 'fas fa-tooth' },
    ],
    '출혈': [
      { href: '/treatments/implant', label: '임플란트 센터', icon: 'fas fa-tooth' },
    ],
    '교정': [
      { href: '/treatments/invisalign', label: '인비절라인', icon: 'fas fa-teeth-open' },
      { href: '/treatments/orthodontics', label: '치아교정', icon: 'fas fa-teeth' },
    ],
    '인비절라인': [
      { href: '/treatments/invisalign', label: '인비절라인 센터', icon: 'fas fa-teeth-open' },
    ],
    '충치': [
      { href: '/treatments/cavity', label: '충치치료', icon: 'fas fa-tooth' },
    ],
    '스케일링': [
      { href: '/treatments/scaling', label: '스케일링', icon: 'fas fa-teeth' },
    ],
    '사랑니': [
      { href: '/treatments/wisdom-tooth', label: '사랑니 발치', icon: 'fas fa-tooth' },
    ],
  }
  const titleLower = (col.title || '') + ' ' + (col.focusKeyword || '') + ' ' + (col.category || '')
  const matchedTreatments = new Map<string, { href: string, label: string, icon: string }>()
  for (const [kw, treats] of Object.entries(COLUMN_TREATMENT_MAP)) {
    if (titleLower.includes(kw)) {
      for (const t of treats) {
        if (!matchedTreatments.has(t.href)) matchedTreatments.set(t.href, t)
      }
    }
  }
  // 기본 링크: 홈, 의료진, 예약, 가격
  const defaultLinks = [
    { href: '/', label: '서울비디치과 홈', icon: 'fas fa-home' },
    { href: '/doctors/', label: '의료진 소개', icon: 'fas fa-user-md' },
    { href: '/pricing', label: '비용 안내', icon: 'fas fa-won-sign' },
    { href: '/area/cheonan', label: '천안 치과', icon: 'fas fa-map-marker-alt' },
    { href: '/area/asan', label: '아산 치과', icon: 'fas fa-map-marker-alt' },
  ]
  const treatmentLinks = [...matchedTreatments.values()].slice(0, 6)
  const relatedTreatmentsHtml = `
<!-- 관련 치료 + 네비게이션 내부 링크 (SEO 양방향 링크) -->
<section style="margin-top:20px;padding:24px;background:linear-gradient(135deg,#f0f4f8 0%,#e8eef5 100%);border-radius:20px;border:1px solid #dde4ed;">
${treatmentLinks.length > 0 ? `<h2 style="font-size:1rem;font-weight:800;color:#3b5998;margin:0 0 12px;display:flex;align-items:center;gap:8px;"><i class="fas fa-stethoscope"></i> 관련 진료 안내</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
${treatmentLinks.map(t => `<a href="${t.href}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#fff;border-radius:50px;text-decoration:none;color:#3b5998;font-size:.84rem;font-weight:600;border:1px solid #dde4ed;transition:all .2s;"><i class="${t.icon}" style="font-size:.8rem;"></i> ${t.label}</a>`).join('\n')}
</div>` : ''}
<h3 style="font-size:.9rem;font-weight:700;color:#666;margin:0 0 10px;display:flex;align-items:center;gap:6px;"><i class="fas fa-compass"></i> 바로가기</h3>
<div style="display:flex;flex-wrap:wrap;gap:8px;">
${defaultLinks.map(t => `<a href="${t.href}" style="display:inline-flex;align-items:center;gap:5px;padding:7px 14px;background:#fff;border-radius:50px;text-decoration:none;color:#666;font-size:.82rem;font-weight:500;border:1px solid #e0e0e0;transition:all .2s;"><i class="${t.icon}" style="font-size:.75rem;color:#999;"></i> ${t.label}</a>`).join('\n')}
</div>
</section>`

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
<link rel="canonical" href="https://bdbddc.com/column/${colSlug(col)}">
<meta property="og:title" content="${seoTitle} | 서울비디치과">
<meta property="og:description" content="${seoDesc}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://bdbddc.com/column/${colSlug(col)}">
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
<link rel="stylesheet" href="/css/site-v5.css?v=24d559d1">
<!-- BreadcrumbList -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"원장 컬럼","item":"https://bdbddc.com/column/"},{"@type":"ListItem","position":3,"name":"${col.title}","item":"https://bdbddc.com/column/${colSlug(col)}"}]}
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
  "url":"https://bdbddc.com/column/${colSlug(col)}",
  "mainEntityOfPage":{"@type":"WebPage","@id":"https://bdbddc.com/column/${colSlug(col)}"},
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
${faqSchema}
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

${relatedColumnsHtml}
${relatedTreatmentsHtml}

<div class="col-detail-footer">
<a href="/column/" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:.88rem;"><i class="fas fa-arrow-left"></i> 컬럼 목록</a>
<a href="/reservation" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:.88rem;"><i class="fas fa-calendar-check"></i> 진료 예약</a>
</div>
</div>
</main>
${ssrMobileNav()}
<script src="/js/main.js" defer></script>
<script src="/js/gnb-v2.js?v=e0c7aede" defer></script>
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

// 케이스 상세 페이지 SSR (slug 우선, 기존 ID는 301 리다이렉트)
app.get('/cases/:param', async (c) => {
  const param = c.req.param('param')
  // .html 확장자 요청 → clean URL로 301 리디렉트 (GSC 빈 200 응답 방지)
  if (param.endsWith('.html')) {
    const clean = param.replace(/\.html$/, '')
    return c.redirect(`/cases/${clean || 'gallery'}`, 301)
  }
  // 기타 정적 파일 (.js, .css, .png 등)은 serveStatic에 위임
  if (param.includes('.')) return c.notFound()
  
  const r2 = c.env.R2
  if (!r2) return c.redirect('/cases/gallery', 302)
  
  const allCases = await getCases(r2)
  const cs = findCaseByParam(allCases, param)
  
  if (!cs) return c.redirect('/cases/gallery', 302)
  
  // 기존 ID로 접근 시 → slug URL로 301 리다이렉트 (SEO 가치 이전)
  if (cs.slug && param !== cs.slug) {
    return c.redirect(`/cases/${cs.slug}`, 301)
  }
  const id = cs.id  // 내부 로직용 (조회수 등)
  
  // 로그인 체크
  const secret = getSessionSecret(c.env)
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

  // ===== 관련 케이스 블록 (같은 카테고리, 최대 6개) =====
  const relatedCases = allCases
    .filter((x: any) => x.status === 'published' && x.id !== cs.id && x.category === cs.category)
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 6)
  const relatedCasesHtml = relatedCases.length > 0 ? `
<!-- 관련 케이스 (같은 카테고리 — SEO 내부 링크) -->
<section style="margin-top:36px;">
<h3 style="font-size:1.05rem;font-weight:700;color:#333;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
<i class="fas fa-images" style="color:#c9a96e;"></i> ${catLabel} 관련 다른 사례
</h3>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
${relatedCases.map((rc: any) => {
  const rcThumb = rc.beforeImage || rc.panBeforeImage || ''
  return `<a href="/cases/${caseSlug(rc)}" style="text-decoration:none;color:inherit;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:transform .2s,box-shadow .2s;" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 20px rgba(107,66,38,.12)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,.06)'">
  <div style="aspect-ratio:16/9;background:#f0ebe4;overflow:hidden;">${rcThumb ? `<img src="${rcThumb}" alt="${rc.title}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><i class="fas fa-tooth" style="font-size:1.5rem;color:#d4c5b3;"></i></div>'}</div>
  <div style="padding:10px 12px;"><h4 style="font-size:.85rem;font-weight:600;color:#333;margin:0 0 4px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${rc.title}</h4>
  <span style="font-size:.75rem;color:#888;">${rc.doctorName || ''}</span></div>
</a>`
}).join('\n')}
</div>
</section>` : ''

  // ===== 관련 치료 + 네비게이션 링크 (SEO 양방향 링크) =====
  const caseTreatment = CASE_CATEGORY_TREATMENT_MAP[cs.category]
  const caseDefaultLinks = [
    { href: '/', label: '서울비디치과 홈', icon: 'fas fa-home' },
    { href: '/doctors/', label: '의료진 소개', icon: 'fas fa-user-md' },
    { href: '/cases/gallery', label: '전체 갤러리', icon: 'fas fa-th' },
    { href: '/pricing', label: '비용 안내', icon: 'fas fa-won-sign' },
    { href: '/area/cheonan', label: '천안 치과', icon: 'fas fa-map-marker-alt' },
    { href: '/area/asan', label: '아산 치과', icon: 'fas fa-map-marker-alt' },
  ]
  const caseTreatLinks = caseTreatment ? [caseTreatment] : []
  const caseRelatedTreatmentsHtml = `
<!-- 관련 치료 + 네비게이션 내부 링크 (SEO 양방향 링크) -->
<section style="margin-top:36px;padding:24px;background:#faf7f3;border-radius:16px;">
<h3 style="font-size:1rem;font-weight:700;color:#333;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
<i class="fas fa-link" style="color:#c9a96e;"></i> 관련 진료 안내
</h3>
<div style="display:flex;flex-wrap:wrap;gap:10px;">
${[...caseTreatLinks, ...caseDefaultLinks].map(link => `<a href="${link.href}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#fff;color:#6B4226;border-radius:50px;text-decoration:none;font-size:.85rem;font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.06);transition:all .2s;" onmouseover="this.style.background='#6B4226';this.style.color='#fff'" onmouseout="this.style.background='#fff';this.style.color='#6B4226'"><i class="${link.icon}"></i> ${link.label}</a>`).join('\n')}
</div>
</section>`

  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
${TRACKING_HEAD}
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cs.title}${cs.region ? ' | ' + cs.region : ''} | Before/After — 서울비디치과</title>
<meta name="description" content="${cs.title} — ${cs.doctorName || '서울비디치과'} ${catLabel} 치료 전후 사진.${cs.region ? ' ' + cs.region + '에서 내원.' : ''} ${cs.treatmentPeriod ? '치료기간 ' + cs.treatmentPeriod + '.' : ''} 서울비디치과 비포/애프터.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://bdbddc.com/cases/${caseSlug(cs)}">
<meta property="og:title" content="${cs.title} | Before/After — 서울비디치과">
<meta property="og:description" content="${catLabel} 치료 전후 사진 — ${cs.doctorName || '서울비디치과'}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://bdbddc.com/cases/${caseSlug(cs)}">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<link rel="stylesheet" href="/css/site-v5.css?v=24d559d1">
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"MedicalWebPage",
  "name":"${cs.title}",
  "description":"${catLabel} 치료 전후 — ${cs.doctorName || '서울비디치과'}",
  "url":"https://bdbddc.com/cases/${caseSlug(cs)}",
  "datePublished":"${cs.createdAt || ''}",
  "author":{"@type":"Dentist","name":"서울비디치과","telephone":"+82-41-415-2892"${cs.region ? ',"areaServed":{"@type":"City","name":"' + cs.region + '"}' : ''}},
  "breadcrumb":{"@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},
    {"@type":"ListItem","position":2,"name":"Before/After","item":"https://bdbddc.com/cases/gallery"},
    {"@type":"ListItem","position":3,"name":"${cs.title}","item":"https://bdbddc.com/cases/${caseSlug(cs)}"}
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
${cs.category ? `<a href="/treatments/${catSlugMap[cs.category] || cs.category}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#f5f0eb;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:.9rem;margin-left:8px;"><i class="fas fa-tooth"></i> ${catLabel} 진료 안내</a>` : ''}
</div>
${relatedCasesHtml}
${caseRelatedTreatmentsHtml}
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
<script src="/js/gnb-v2.js?v=e0c7aede" defer></script>
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
app.get('/auth/reset-password', serveStatic({ path: './auth/reset-password.html' }))
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

// ============================================
// 제로클릭 거인 키워드 — CTR 최적화 타이틀/메타 오버라이드
// (GSC 2026.3~6 데이터 기반: 노출 수천 회인데 클릭이 거의 없는 용어들)
// 원칙: 용어를 타이틀 맨 앞에 유지(순위 보존) + 답변·숫자·가치 추가(클릭 유발)
// ============================================
const ENC_SEO_OVERRIDES: Record<string, { title: string; desc: string }> = {
  '치아 번호': {
    title: '치아 번호 읽는 법 — 11~48번 FDI 치식 한눈에 정리 (사랑니=8번) | 서울비디치과',
    desc: '치아 번호(치식)는 FDI 2자리 체계: 첫째 자리는 상하좌우 사분면(1~4), 둘째 자리는 앞니부터 1~8번. 예) #26=왼쪽 위 첫 큰어금니, #48=오른쪽 아래 사랑니. 유치는 51~85번. 진료기록·견적서 읽는 법을 서울대 출신 전문의가 쉽게 정리했습니다.'
  },
  '치아 번호 체계': {
    title: '치아 번호 체계 총정리 — FDI vs 유니버설 표기법 차이, 치식 읽기 | 서울비디치과',
    desc: '치아 번호 체계는 한국 표준 FDI(2자리)와 미국식 유니버설(1~32번)이 있습니다. #11은 오른쪽 위 앞니, #36은 왼쪽 아래 첫 큰어금니. 내 진료기록의 숫자가 어떤 치아인지 바로 확인하세요.'
  },
  '틀니': {
    title: '틀니 영어로 Denture(덴처) — 완전·부분틀니 차이, 65세 건강보험 적용 | 서울비디치과',
    desc: '틀니는 영어로 Denture(덴처)입니다. 완전틀니·부분틀니 차이, 만 65세 이상 건강보험 적용(본인부담 30%), 적응 기간과 관리법까지 한 페이지에 정리. 천안 서울비디치과 보철 전문의 감수.'
  },
  '석션': {
    title: '석션(Suction) 뜻 — 치과에서 침 빨아들이는 기구, 원리·종류 | 서울비디치과',
    desc: '치과 석션은 진료 중 물과 타액을 흡입하는 장비입니다. 치료 중 입에 넣는 이유, 일반 석션과 고압 석션의 차이, 감염관리와의 관계까지 쉽게 설명해 드립니다.'
  },
  '소구치': {
    title: '소구치(작은어금니) 위치 — 4번·5번 치아, 교정 발치와의 관계 | 서울비디치과',
    desc: '소구치는 송곳니 뒤 4번·5번 치아(작은어금니)로 위아래 총 8개입니다. 음식을 부수는 역할을 하며 교정 시 발치 대상으로 자주 언급됩니다. 대구치와의 차이, 위치 그림으로 정리.'
  },
  '대구치': {
    title: '대구치(큰어금니) 위치 — 6번·7번 치아, 사랑니(8번)와의 차이 | 서울비디치과',
    desc: '대구치는 치열 맨 뒤 6번·7번 치아(큰어금니)로 음식을 분쇄하는 핵심 치아입니다. 제1대구치는 만 6세에 나오는 평생 치아 — 충치가 가장 잘 생기는 위치와 관리법까지 정리.'
  },
  '법랑질': {
    title: '법랑질(에나멜)이란? 몸에서 가장 단단하지만 재생 안 되는 조직 | 서울비디치과',
    desc: '법랑질은 치아 겉면을 덮는 인체에서 가장 단단한 조직이지만, 한번 손상되면 재생되지 않습니다. 시린 증상과의 관계, 법랑질을 지키는 양치법, 손상 시 치료까지 전문의가 정리했습니다.'
  },
  '치관': {
    title: '치관이란? 잇몸 위로 보이는 치아 머리 — 크라운 치료와의 관계 | 서울비디치과',
    desc: '치관은 잇몸 위로 드러난 치아의 머리 부분입니다. 치관이 크게 손상되면 크라운(씌우기)으로 보호합니다. 치근(뿌리)과의 구분, 치관 파절 시 대처법까지 쉽게 설명합니다.'
  },
  '치근': {
    title: '치근(치아 뿌리)이란? 잇몸 아래 숨은 부분 — 치근 노출·흡수 증상 | 서울비디치과',
    desc: '치근은 잇몸뼈 속에 박혀 치아를 지탱하는 뿌리입니다. 잇몸이 내려가 치근이 노출되면 시림이 시작됩니다. 치근 흡수·치근단 염증 등 관련 질환과 치료법까지 정리했습니다.'
  },
}

app.get('/encyclopedia/:term', (c) => {
  // ▶ 방어: 잘리거나 깨진 퍼센트 인코딩(예: %ED%84%B1%EA%B4%8)이 들어오면
  //   decodeURIComponent가 URIError를 던져 500(5xx)이 된다 → try-catch로 흡수해 백과 메인으로 보냄
  let termParam: string
  try {
    termParam = decodeURIComponent(c.req.param('term'))
  } catch {
    return c.redirect('/encyclopedia/', 301)
  }
  
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

  // ★ 정보성 vs 진료성 항목 분기: 정보검색러(치아번호·치식 등)는 부드러운 브릿지 CTA로 전환
  //   AI 인용 폭발 키워드(치아번호 102회)는 순수 정보성이라 "무료상담" 직격은 비약 → 검진으로 자연 연결
  const infoOnlyCategories = ['치아 구조', '전문 용어', '구강 해부', '발음·교합']
  const isInfoTerm = infoOnlyCategories.includes(item.category)
  const ctaHeadline = isInfoTerm
    ? `${term}, 이제 아셨죠? 그럼 내 치아는 어떤 상태일까요?`
    : '이 글이 도움이 되셨나요?'
  const ctaSubtext = isInfoTerm
    ? `용어를 아는 것보다 중요한 건 <strong style="color:#6B4226;">내 치아의 실제 상태</strong>입니다.<br>서울대 출신 전문의가 <strong style="color:#6B4226;">무료 정밀 검진</strong>으로 직접 확인해드립니다.`
    : `${term}, 검색만으로는 내 경우가 맞는지 알기 어렵습니다.<br>서울대 출신 전문의가 <strong style="color:#6B4226;">무료로</strong> 내 상태를 직접 봐드립니다.`
  const ctaButtonLabel = isInfoTerm ? '내 치아 무료 검진받기' : '무료 상담받기'
  const ctaEventLabel = isInfoTerm ? 'encyclopedia_info_bridge' : 'encyclopedia_helpful'
  const tagsHtml = (item.tags || []).map(t => `<span style="display:inline-block;font-size:0.8rem;padding:4px 12px;border-radius:50px;background:#f5f0eb;color:#6B4226;margin:0 4px 4px 0;">#${t}</span>`).join('')
  
  // 진료 페이지 연결 링크 (상담 단계)
  const treatmentLinkHtml = item.link ? `
<div style="background:#fff;border:2px solid #c9a96e;border-radius:16px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
<div>
<p style="font-size:0.85rem;color:#888;margin:0 0 4px;"><i class="fas fa-stethoscope" style="color:#c9a96e;margin-right:4px;"></i> 관련 진료과목 · 상담 받기</p>
<p style="font-size:1.05rem;font-weight:700;color:#333;margin:0;">${term} 진료 상세 보기</p>
</div>
<a href="${item.link}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.9rem;white-space:nowrap;"><i class="fas fa-arrow-right"></i> 진료 안내 바로가기</a>
</div>` : `
<div style="background:#fff;border:2px solid #c9a96e;border-radius:16px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
<div>
<p style="font-size:0.85rem;color:#888;margin:0 0 4px;"><i class="fas fa-clipboard-check" style="color:#c9a96e;margin-right:4px;"></i> 내 증상이 궁금하다면</p>
<p style="font-size:1.05rem;font-weight:700;color:#333;margin:0;">증상 선택하면 맞춤 치료와 실제 케이스를 보여드립니다</p>
</div>
<a href="/symptom-checker" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.9rem;white-space:nowrap;"><i class="fas fa-stethoscope"></i> 증상 체커 해보기</a>
</div>`

  // 가이드 페이지 연결 링크 (더 자세한 정보 단계)
  // item.guide 필드가 있으면 우선 사용, 없으면 link로부터 자동 추론
  const guidePath = (item as any).guide || (() => {
    if (!item.link) return null
    if (item.link.includes('implant')) return '/guide/implant'
    if (item.link.includes('invisalign') || item.link.includes('orthodontic') || item.link.includes('ortho')) return '/guide/invisalign'
    if (item.link.includes('laminate') || item.link.includes('glownate') || item.link.includes('aesthetic')) return '/guide/laminate'
    return null
  })()
  const guideLinkHtml = guidePath ? `
<div style="background:#faf7f3;border:2px solid #e8d9c1;border-radius:16px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
<div>
<p style="font-size:0.85rem;color:#888;margin:0 0 4px;"><i class="fas fa-book-open" style="color:#c9a96e;margin-right:4px;"></i> 심층 가이드 · 더 자세한 정보</p>
<p style="font-size:1.05rem;font-weight:700;color:#333;margin:0;">${term} 완벽 가이드 — 비용·과정·후기까지</p>
</div>
<a href="${guidePath}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#fff;color:#6B4226;border:2px solid #6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.9rem;white-space:nowrap;"><i class="fas fa-book-open"></i> 가이드 읽기</a>
</div>` : ''

  // 이전/다음 용어 네비게이션
  const currentIdx = encItems.findIndex(i => i.id === item!.id)
  const prevItem = currentIdx > 0 ? encItems[currentIdx - 1] : null
  const nextItem = currentIdx < encItems.length - 1 ? encItems[currentIdx + 1] : null

  // === JSON-LD/메타용 텍스트 정제: HTML 태그 제거 + 공백 정리 (구조화 데이터 파싱 오류 방지) ===
  const plainText = (s: string) => String(s || '')
    .replace(/<[^>]+>/g, '')        // <strong> 등 HTML 태그 제거
    .replace(/\s+/g, ' ')            // 줄바꿈·연속 공백 → 단일 공백
    .trim()

  // === 카테고리별 맞춤 FAQ 생성 ===
  const faqGenerator = categoryFaqTemplates[item.category] || categoryFaqTemplates['전문 용어']
  const dynamicFaqs = faqGenerator(term, item.short, item.detail)
  // 기본 2개 + 카테고리별 3~5개 = 총 5~7개 FAQ
  const allFaqs = [
    { q: `${term}이란 무엇인가요?`, a: `${item.short} ${item.detail}` },
    ...dynamicFaqs,
    { q: `${term} 관련 상담은 어디서 받을 수 있나요?`, a: `서울비디치과는 서울대 출신 14인 전문의 협진 시스템으로 ${item.category} 분야를 포함한 종합 치과 진료를 제공합니다. 365일 진료, 전화 041-415-2892 또는 온라인 예약(bdbddc.com/reservation)으로 무료 상담을 받으실 수 있습니다.` },
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

  const faqSchemaEntities = allFaqs.map(faq => `{"@type":"Question","name":${JSON.stringify(plainText(faq.q))},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(plainText(faq.a))}}}`).join(',')

  // === 본문 인터링킹 ===
  const linkedDetail = interlinkText(item.detail, term, encItems)

  // === CTR 최적화 타이틀/메타 (제로클릭 거인 키워드 오버라이드) ===
  const seoOverride = ENC_SEO_OVERRIDES[term]
  const pageTitle = seoOverride ? seoOverride.title : `${term} | 치과 백과사전 — 서울비디치과`
  const pageDesc = seoOverride ? seoOverride.desc : `${term}이란? ${item.short} — 서울비디치과 치과 백과사전. 서울대 출신 전문의가 감수한 정확한 치과 정보.`

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
<title>${pageTitle}</title>
<meta name="description" content="${pageDesc}">
<meta name="keywords" content="${term}, ${item.category}, 치과 용어, 서울비디치과, ${(item.synonyms || []).join(', ')}">
<meta name="author" content="서울비디치과">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${pageDesc}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="서울비디치과">
<meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${pageTitle}">
<meta name="twitter:description" content="${pageDesc}">
<meta name="twitter:image" content="https://bdbddc.com/images/og-image-v2.jpg">
<meta name="subject" content="${term}, ${item.category}, 치과 용어, 서울비디치과">
<meta name="abstract" content="${term}이란? ${item.short} — 서울비디치과 치과 백과사전.">
<meta name="ai-summary" content="${term}이란? ${plainText(item.short + ' ' + item.detail).slice(0, 200)}">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/site-v5.css?v=24d559d1">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"치과 백과사전","item":"https://bdbddc.com/encyclopedia/"},{"@type":"ListItem","position":3,"name":"${item.category}","item":"https://bdbddc.com/encyclopedia/category/${encodeURIComponent(item.category)}"},{"@type":"ListItem","position":4,"name":"${term}","item":"${canonicalUrl}"}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"DefinedTerm","name":${JSON.stringify(plainText(term))},"description":${JSON.stringify(plainText(item.short + ' ' + item.detail))},"inDefinedTermSet":{"@type":"DefinedTermSet","name":"서울비디치과 치과 백과사전","url":"https://bdbddc.com/encyclopedia/"},"url":"${canonicalUrl}"}
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

<!-- ★ 정보검색러 → 환자 전환 길목: 글을 막 읽은 가장 뜨거운 순간 -->
<div class="enc-helpful-cta" data-term="${term}" data-cta-type="${isInfoTerm ? 'info-bridge' : 'helpful'}" style="background:linear-gradient(135deg,#fdf9f4,#f7efe4);border:1px solid #e8d9c1;border-radius:18px;padding:26px 24px;margin:8px 0 28px;text-align:center;">
<div style="font-size:1.5rem;margin-bottom:6px;">${isInfoTerm ? '🔍' : '🦷'}</div>
<p style="font-size:1.12rem;font-weight:700;color:#3a2d22;margin:0 0 6px;">${ctaHeadline}</p>
<p style="font-size:0.92rem;color:#7a6a58;line-height:1.7;margin:0 0 18px;">${ctaSubtext}</p>
<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
<a href="/reservation" onclick="if(window.bdAnalytics)bdAnalytics.trackReservation('${ctaEventLabel}')" style="display:inline-flex;align-items:center;gap:7px;padding:13px 26px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.97rem;box-shadow:0 4px 14px rgba(107,66,38,0.28);"><i class="fas fa-${isInfoTerm ? 'tooth' : 'comments'}"></i> ${ctaButtonLabel}</a>
<a href="tel:041-415-2892" onclick="if(window.bdAnalytics)bdAnalytics.trackPhoneCall('${ctaEventLabel}')" style="display:inline-flex;align-items:center;gap:7px;padding:13px 24px;background:#fff;color:#6B4226;border:2px solid #6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;"><i class="fas fa-phone"></i> 전화 문의</a>
</div>
<p style="font-size:0.78rem;color:#a8997f;margin:16px 0 0;"><i class="fas fa-clock" style="margin-right:4px;"></i> 365일 진료 · 당일 상담 가능</p>
</div>

${treatmentLinkHtml}
${guideLinkHtml}

<div style="margin-bottom:32px;">
<h2 style="font-size:1.2rem;font-weight:700;color:#333;margin-bottom:16px;"><i class="fas fa-question-circle" style="color:#c9a96e;margin-right:6px;"></i> ${term} 자주 묻는 질문</h2>
${faqHtml}
</div>

<div style="background:linear-gradient(135deg, #6B4226, #8B5E3C);border-radius:16px;padding:28px 24px;text-align:center;color:#fff;margin-bottom:40px;">
<p style="font-size:1.1rem;font-weight:600;margin-bottom:8px;">${term}에 대해 더 궁금하신가요?</p>
<p style="font-size:0.85rem;color:rgba(255,255,255,0.85);margin-bottom:18px;">서울비디치과 전문의가 직접 상담해 드립니다</p>
<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
<a href="/reservation" style="display:inline-flex;align-items:center;gap:6px;padding:12px 22px;background:#fff;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem;"><i class="fas fa-calendar-check"></i> 예약하기</a>
${item.link ? `<a href="${item.link}" style="display:inline-flex;align-items:center;gap:6px;padding:12px 22px;background:rgba(255,255,255,0.15);color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid rgba(255,255,255,0.4);"><i class="fas fa-stethoscope"></i> 진료 안내</a>` : ''}
${guidePath ? `<a href="${guidePath}" style="display:inline-flex;align-items:center;gap:6px;padding:12px 22px;background:rgba(255,255,255,0.15);color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid rgba(255,255,255,0.4);"><i class="fas fa-book-open"></i> 가이드 읽기</a>` : ''}
<a href="tel:041-415-2892" style="display:inline-flex;align-items:center;gap:6px;padding:12px 22px;background:rgba(255,255,255,0.15);color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid rgba(255,255,255,0.4);"><i class="fas fa-phone"></i> 041-415-2892</a>
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
<script src="/js/gnb-v2.js?v=e0c7aede" defer></script>
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
    { q: `${catName} 관련 진료를 받으려면 어떻게 해야 하나요?`, a: `서울비디치과에서는 ${catName} 분야의 전문 진료를 제공합니다. 서울대 출신 14인 전문의 협진 시스템으로 정확한 진단과 치료를 받으실 수 있습니다. 전화 041-415-2892 또는 온라인 예약으로 상담하세요.` },
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
<link rel="stylesheet" href="/css/site-v5.css?v=24d559d1">
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
<script src="/js/gnb-v2.js?v=e0c7aede" defer></script>
</body>
</html>`

  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return c.html(catHtml)
})

// ▶ 슬래시 포함 옛 백과 URL(예: /encyclopedia/CAD/CAM, /방사선 투과상/불투과상,
//   /근심면/원심면, /협측/설측)은 대응 콘텐츠가 없고 5xx/404를 유발.
//   category 라우트보다 뒤에 두어 충돌을 피하고, 나머지 2-depth는 백과 메인으로 301.
app.get('/encyclopedia/:term/:sub', (c) => c.redirect('/encyclopedia/', 301))
app.get('/encyclopedia/:term/:sub/*', (c) => c.redirect('/encyclopedia/', 301))

// Area directory (지역 페이지)
app.use('/area/*', serveStatic())

// FAQ directory
app.use('/faq/*', serveStatic())

// ============================================
// Root level HTML pages (without .html extension)
// ============================================
app.get('/pricing', serveStatic({ path: './pricing.html' }))
app.get('/reservation', serveStatic({ path: './reservation.html' }))
app.get('/reservation/thank-you', serveStatic({ path: './reservation/thank-you.html' }))
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

// ============================================
// 가이드 페이지 (백과사전 토픽 클러스터의 "더 자세한 정보" 스포크)
// ============================================
app.get('/guide', serveStatic({ path: './guide/index.html' }))
app.get('/guide/', serveStatic({ path: './guide/index.html' }))
app.get('/guide/implant', serveStatic({ path: './guide/implant.html' }))
app.get('/guide/invisalign', serveStatic({ path: './guide/invisalign.html' }))
app.get('/guide/laminate', serveStatic({ path: './guide/laminate.html' }))
app.get('/guide/scaling', serveStatic({ path: './guide/scaling.html' }))
app.get('/guide/whitening', serveStatic({ path: './guide/whitening.html' }))
app.get('/guide/wisdom-tooth', serveStatic({ path: './guide/wisdom-tooth.html' }))
app.get('/guide/denture', serveStatic({ path: './guide/denture.html' }))
app.get('/guide/root-canal', serveStatic({ path: './guide/root-canal.html' }))
app.get('/guide/orthodontics', serveStatic({ path: './guide/orthodontics.html' }))
app.get('/guide/insurance', serveStatic({ path: './guide/insurance.html' }))
app.get('/guide/regret', serveStatic({ path: './guide/regret.html' }))
// 후회 백서 진료별 세부 페이지 (SEO/AEO 스포크: "<진료명> 후회", "<진료명> 부작용")
const REGRET_SLUGS = ['implant', 'orthodontics', 'invisalign', 'laminate', 'whitening', 'wisdom-tooth', 'root-canal', 'crown', 'denture', 'scaling', 'cavity', 'gum']
for (const slug of REGRET_SLUGS) {
  app.get(`/guide/regret/${slug}`, serveStatic({ path: `./guide/regret/${slug}.html` }))
  app.get(`/guide/regret/${slug}.html`, (c) => c.redirect(`/guide/regret/${slug}`, 301))
}
app.get('/guide/regret/', (c) => c.redirect('/guide/regret', 301))
// .html 확장자 접근은 301로 클린 URL로 강제
app.get('/guide/index.html', (c) => c.redirect('/guide/', 301))
app.get('/guide/implant.html', (c) => c.redirect('/guide/implant', 301))
app.get('/guide/invisalign.html', (c) => c.redirect('/guide/invisalign', 301))
app.get('/guide/laminate.html', (c) => c.redirect('/guide/laminate', 301))
app.get('/guide/scaling.html', (c) => c.redirect('/guide/scaling', 301))
app.get('/guide/whitening.html', (c) => c.redirect('/guide/whitening', 301))
app.get('/guide/wisdom-tooth.html', (c) => c.redirect('/guide/wisdom-tooth', 301))
app.get('/guide/denture.html', (c) => c.redirect('/guide/denture', 301))
app.get('/guide/root-canal.html', (c) => c.redirect('/guide/root-canal', 301))
app.get('/guide/orthodontics.html', (c) => c.redirect('/guide/orthodontics', 301))
app.get('/guide/insurance.html', (c) => c.redirect('/guide/insurance', 301))
app.get('/guide/regret.html', (c) => c.redirect('/guide/regret', 301))

// ============================================
// /guide/* 스마트 catch-all 301 (GSC 404 해결)
// ── 백과사전 자동 인터링킹이 가리키던 미존재 가이드 경로(약 98종)를
//    가장 관련 있는 "실제 존재하는" 가이드/진료 페이지로 영구 이전한다.
//    실제 존재하는 /guide/* 정적 라우트는 위에서 이미 처리되므로
//    여기까지 도달하는 건 "정의되지 않은" 경로뿐이다.
// ============================================
const EXISTING_GUIDES = new Set([
  'implant', 'invisalign', 'laminate', 'scaling', 'whitening',
  'wisdom-tooth', 'denture', 'root-canal', 'orthodontics', 'insurance', 'regret',
])

function mapDeadGuideSlug(slug: string): string {
  const s = decodeURIComponent(slug).toLowerCase().replace(/\/$/, '')
  // 이미 존재하는 가이드면 그대로 (안전망)
  if (EXISTING_GUIDES.has(s)) return `/guide/${s}`

  // 키워드 기반 매핑 (구체적 → 일반 순서)
  const has = (...kw: string[]) => kw.some((k) => s.includes(k))

  if (has('implant', 'gbr', 'bone-graft', 'sinus', 'digital-implant', 'all-on')) return '/guide/implant'
  if (has('ortho', 'aligner', 'invisalign', 'elastics', 'orthognathic', 'midline', 'spacing', 'diastema')) return '/guide/invisalign'
  if (has('laminate', 'glownate', 'veneer', 'aesthetic', 'smile', 'gummy')) return '/guide/laminate'
  if (has('whiten', 'bleach')) return '/guide/whitening'
  if (has('scaling', 'periodontal', 'gum', 'gingiv', 'pocket', 'root-coverage', 'srp', 'maintenance')) return '/guide/scaling'
  if (has('wisdom', 'extraction', 'extrusion', 'intrusion', 'luxation', 'trauma', 'replantation', 'surgical')) return '/guide/wisdom-tooth'
  if (has('denture', 'prosthet', 'crown', 'pfm', 'zirconia', 'bridge')) return '/guide/denture'
  if (has('root-canal', 'endo', 'pulp', 'perforation', 'file-separation', 'microscope', 'apico')) return '/guide/root-canal'
  if (has('tmj', 'disc', 'headache', 'botox', 'masseter')) return '/guide/regret'
  if (has('insurance', 'cost', 'checkup', 'national', 'caries-risk', 'saliva')) return '/guide/insurance'
  if (has('pediatric', 'child', 'baby', 'primary-tooth', 'sealant', 'sedation', 'thumb')) return '/treatments/pediatric'
  if (has('cancer', 'leukoplakia', 'erythroplakia', 'selfexam', 'oral-medicine')) return '/treatments/oral-medicine'
  if (has('cavity', 'tooth-anatomy', 'infection-control', 'hygiene', 'regular', 'preventive', 'prevention')) return '/treatments/prevention'

  // 매칭 실패 → 가이드 허브
  return '/guide/'
}

app.get('/guide/:slug', (c) => {
  const slug = c.req.param('slug')
  return c.redirect(mapDeadGuideSlug(slug), 301)
})
// 슬래시로 끝나거나 한 단계 더 깊은 죽은 경로도 흡수
app.get('/guide/:slug/*', (c) => {
  const slug = c.req.param('slug')
  return c.redirect(mapDeadGuideSlug(slug), 301)
})

// Root level HTML files with .html extension → handled by 301 redirects above

// ============================================
// 페이지 조회수 추적 API
// ============================================

// ─────────────────────────────────────────────────────────────
// 봇 탐지 (User-Agent 기반)
// ─────────────────────────────────────────────────────────────
// 반환: { isBot: boolean, botName: string | null }
function detectBot(ua: string): { isBot: boolean; botName: string | null } {
  if (!ua) return { isBot: true, botName: 'no-ua' }  // UA 없는 요청도 봇 취급
  const u = ua.toLowerCase()
  // 검색엔진 크롤러
  const knownBots: Array<[RegExp, string]> = [
    [/googlebot/, 'googlebot'],
    [/bingbot/, 'bingbot'],
    [/yandex(bot|images|metrika)/, 'yandexbot'],
    [/yeti/, 'naver-yetibot'],          // Naver
    [/daum(oa)?/, 'daumbot'],           // Daum/Kakao
    [/baiduspider/, 'baidubot'],
    [/duckduckbot/, 'duckduckbot'],
    [/applebot/, 'applebot'],
    [/facebookexternalhit|facebot/, 'facebook'],
    [/twitterbot/, 'twitterbot'],
    [/linkedinbot/, 'linkedinbot'],
    [/whatsapp/, 'whatsapp'],
    [/telegrambot/, 'telegrambot'],
    [/slackbot/, 'slackbot'],
    [/discordbot/, 'discordbot'],
    [/kakaotalk-scrap/, 'kakaotalk'],
    // AI 크롤러
    [/gptbot/, 'gptbot'],
    [/chatgpt-user/, 'chatgpt-user'],
    [/oai-searchbot/, 'oai-searchbot'],
    [/claudebot|claude-web/, 'claudebot'],
    [/anthropic-ai/, 'anthropic'],
    [/perplexitybot|perplexity-user/, 'perplexity'],
    [/google-extended/, 'google-extended'],
    [/ccbot/, 'commoncrawl'],
    [/bytespider/, 'bytespider'],
    [/amazonbot/, 'amazonbot'],
    // 모니터링/SEO 도구
    [/ahrefsbot/, 'ahrefs'],
    [/semrushbot/, 'semrush'],
    [/mj12bot/, 'majestic'],
    [/dotbot/, 'dotbot'],
    [/petalbot/, 'petalbot'],
    [/seznambot/, 'seznam'],
    [/uptimerobot/, 'uptimerobot'],
    [/pingdom/, 'pingdom'],
    [/screaming\s?frog/, 'screamingfrog'],
    // 일반 패턴
    [/headlesschrome|phantomjs|puppeteer|playwright|selenium/, 'headless'],
    [/curl|wget|httpie|python-requests|axios\//, 'cli-tool'],
    [/\bbot\b|crawler|spider|scraper|fetcher/, 'generic-bot'],
  ]
  for (const [re, name] of knownBots) {
    if (re.test(u)) return { isBot: true, botName: name }
  }
  return { isBot: false, botName: null }
}

// SHA-256 16자 해시 (Web Crypto API - Workers 호환)
async function shortHash(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s)
  const hash = await crypto.subtle.digest('SHA-256', enc)
  const arr = Array.from(new Uint8Array(hash))
  return arr.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('')
}

// POST /api/views — 조회수 증가 + 상세 로그 (콘텐츠 페이지에서 호출)
app.post('/api/views', async (c) => {
  try {
    const { page_type, page_id } = await c.req.json<{ page_type: string; page_id: string }>()
    if (!page_type || !page_id) return c.json({ error: 'Missing page_type or page_id' }, 400)

    const validTypes = ['case', 'column', 'notice']
    if (!validTypes.includes(page_type)) return c.json({ error: 'Invalid page_type' }, 400)

    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)

    // ─── 봇 + 출처 + IP 정보 수집 ───
    const ua = c.req.header('user-agent') || ''
    const referer = c.req.header('referer') || ''
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    const country = c.req.header('cf-ipcountry') || ''

    const { isBot, botName } = detectBot(ua)
    const ipHash = ip === 'unknown' ? 'unknown' : await shortHash(ip)

    // ─── Referer 검증: bdbddc.com 또는 같은 호스트가 아닌 외부 직접 호출은 봇 취급 ───
    let suspicious = false
    if (!isBot && referer) {
      try {
        const refHost = new URL(referer).hostname
        if (
          !refHost.endsWith('bdbddc.com') &&
          !refHost.endsWith('pages.dev') &&
          !refHost.includes('localhost')
        ) {
          // 외부 도메인에서 직접 API 호출 = 의심
          suspicious = true
        }
      } catch { /* invalid referer */ }
    } else if (!isBot && !referer) {
      // Referer 없음 + 사람 UA = 직접 API 호출이나 privacy 모드. 일단 사람으로 카운팅
    }

    const finalIsBot = isBot || suspicious
    const finalBotName = botName || (suspicious ? 'no-referer-suspicious' : null)

    // ─── 상세 로그 INSERT (모든 요청 기록 — 봇 포함, 분석용) ───
    await db.prepare(`
      INSERT INTO page_view_logs (page_type, page_id, ip_hash, ua_short, is_bot, bot_name, referer, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      page_type,
      page_id,
      ipHash,
      ua.slice(0, 200),
      finalIsBot ? 1 : 0,
      finalBotName,
      referer.slice(0, 200) || null,
      country || null
    ).run()

    // ─── 봇이면 누적 카운터(page_views)는 증가시키지 않음 ───
    // 그래도 success 응답은 정상으로 반환 (봇이 동작을 추론하지 못하도록)
    if (finalIsBot) {
      const r = await db.prepare(
        'SELECT view_count FROM page_views WHERE page_type = ? AND page_id = ?'
      ).bind(page_type, page_id).first<{ view_count: number }>()
      return c.json({ success: true, views: r?.view_count || 0 })
    }

    // ─── IP 기반 중복 조회 차단: 같은 IP가 같은 페이지를 60초 이내 재조회 → 카운트 X ───
    const dup = await db.prepare(`
      SELECT id FROM page_view_logs
      WHERE page_type = ? AND page_id = ? AND ip_hash = ? AND is_bot = 0
        AND viewed_at >= datetime('now', '-60 seconds')
        AND id != (SELECT MAX(id) FROM page_view_logs WHERE page_type = ? AND page_id = ? AND ip_hash = ?)
      LIMIT 1
    `).bind(page_type, page_id, ipHash, page_type, page_id, ipHash).first()

    if (!dup) {
      // 첫 조회 또는 60초 경과 → 누적 카운터 +1
      await db.prepare(`
        INSERT INTO page_views (page_type, page_id, view_count, last_viewed_at)
        VALUES (?, ?, 1, datetime('now'))
        ON CONFLICT(page_type, page_id)
        DO UPDATE SET view_count = view_count + 1, last_viewed_at = datetime('now')
      `).bind(page_type, page_id).run()
    }

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

// ▶ 보안: Rate Limiting (D1 기반 — Workers는 isolate 간 메모리 비공유라 in-memory Map은 무력)
// scope별 정책: careers(5분 3건), chat(1분 10건 + 1시간 60건)
async function isRateLimitedD1(
  db: D1Database | undefined,
  scope: string,
  ip: string,
  windowMs: number,
  maxCount: number
): Promise<boolean> {
  if (!db) return false // DB 미연결 시 차단하지 않음 (서비스 우선)
  const key = `${scope}:${ip}`
  const now = Date.now()
  const windowStart = now - windowMs
  try {
    const row = await db.prepare(
      'SELECT COUNT(*) AS cnt FROM rate_limits WHERE key = ? AND ts > ?'
    ).bind(key, windowStart).first<{ cnt: number }>()
    if ((row?.cnt || 0) >= maxCount) return true
    // 기록 추가 + 오래된 기록 정리 (확률적: 10%만 청소해 쓰기 부하 절감)
    await db.prepare('INSERT INTO rate_limits (key, ts) VALUES (?, ?)').bind(key, now).run()
    if (Math.random() < 0.1) {
      await db.prepare('DELETE FROM rate_limits WHERE ts < ?').bind(now - 60 * 60 * 1000).run()
    }
    return false
  } catch (e) {
    console.error('rate limit check failed:', e)
    return false // 오류 시 서비스 우선 (fail-open)
  }
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

    // ▶ 방어막 1: Rate Limiting (D1 공유 카운터, 5분 3건)
    const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    if (await isRateLimitedD1(db, 'careers', clientIP, 5 * 60 * 1000, 3)) {
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
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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
  const secret = getSessionSecret(c.env)
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
2. **14인 서울대 원장 협진**: 어려운 케이스도 최적 치료법 도출
3. **365일 진료**: 일요일·공휴일 포함, 평일 야간 20시까지
4. **5개 층 전문 공간**: 각 층별 전문 진료 센터 운영
5. **충분한 설명**: 덴탈커넥트와 시각 자료로 100% 이해될 때까지
6. **철저한 감염관리**: 1인 1기구 원칙, 개별 멸균 패키지, 에어샤워
7. **원내 기공소**: 5인 전문 기공사, 빠르고 정밀한 보철물 제작

## 진료시간
- 평일 (월~금): 09:00 ~ 20:00 (야간진료)
- 토요일: 09:00 ~ 13:00
- 일요일: 09:00 ~ 13:00
- 공휴일: 09:00 ~ 13:00
- 점심시간 (평일): 12:30 ~ 14:00
- ⭐ 365일 진료 (일요일, 공휴일 포함)

## 층별 안내
- **1F 인비절라인 치아교정센터**: 서울대 교정 전문의 2인 (김민규, 임지원), 대규모 교정 전용
- **2F 디지털기공센터 · 위생관리센터**: 원내 기공소, 위생관리, 글로우네이트/심미레진 (현정민, 박수빈 원장)
- **3F BDX검진센터 · 소아치과센터**: 정밀검진, 소아전문의 3인 (김민진, 서희원, 박상현)
- **4F 임플란트센터**: 6개 수술방, 2개 회복실, 네비게이션 (이승엽, 문석준, 김민수, 최종훈 원장 등)
- **5F 종합진료센터**: 일반진료, 사랑니, 잇몸, 신경, 미백 (최종훈 원장 등)

## 의료진 상세 (14인 전원 서울대 출신)

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
   - 진료시간: 수 10:30-17:00, 금 10:30-17:00, 그 외 휴진

10. **조설아 원장** — 치과보존과 전문의 (재신경치료 전문)
    - 서울대 치의학과 / 서울대 치의학대학원 석사·박사 수료 / 보존과 전문의
    - 대한치과보존학회 정회원, 재신경치료 전문
    - 진료시간: 월·화·목 10:00-15:30, 일 10:00-14:00(2,4주), 그 외 휴진

### 임플란트·외과 전문
11. **이승엽 원장** — 임플란트 전문 (누적 30,000건+)
    - 서울대 치의학과 / 임플란트 10년+ 경력
    - 뼈이식 전문, 전악 임플란트 전문
    - 진료시간: 월 09:00-20:00, 화·수 09:00-18:00, 목 15:30-20:00, 금 10:00-17:00, 토 09:00-13:00(2,4,5주), 일 휴진

### 종합진료
12. **최종훈 원장** — 종합진료, 통합치의학과 전문의, 사랑니 발치 전문
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
- **임플란트 담당 원장 (중요!)**: 이승엽(가장 많이 시행, 30,000건+), 문석준(가장 많이 시행), 김민수, 최종훈, 박수빈, 박상현 — 이 6명입니다. 임플란트 관련 질문 시 반드시 이 6명을 안내하세요.
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
- 담당: 이승엽(30,000건+), 문석준, 김민수, 최종훈, 박수빈, 박상현 원장 (현정민·보존과·교정과는 임플란트 미시행)

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
  const secret = getSessionSecret(c.env)
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
  let viewsTopCases: any[] = []
  let viewsTopColumns: any[] = []
  let viewsRecentActivity: any[] = []
  try {
    if (db) {
      // 전체 조회수 통계: 누적(page_views, 봇포함·역사전체) + 봇제외 실측(page_view_logs) 둘 다 제공
      const { results } = await db.prepare(
        `SELECT page_type, SUM(view_count) as total_views, COUNT(*) as page_count FROM page_views GROUP BY page_type`
      ).all()
      viewStats = results || []
      // 봇 제외 실측 조회수(로그 추적 시작 이후)를 viewStats에 병합
      try {
        const human = await db.prepare(
          `SELECT page_type, COUNT(*) as human_views FROM page_view_logs WHERE is_bot = 0 GROUP BY page_type`
        ).all()
        const humanMap: Record<string, number> = {}
        for (const h of (human.results || []) as any[]) humanMap[h.page_type] = h.human_views
        viewStats = (viewStats as any[]).map(v => ({ ...v, human_views: humanMap[v.page_type] ?? null }))
      } catch { }

      // TOP 10 B/A: 봇 제외 실제 사람 조회수 기준 (page_view_logs).
      //   누적(page_views)은 봇이 포함돼 순위가 왜곡되므로 사용하지 않음.
      //   조회수 컬럼명은 프론트 호환을 위해 view_count로 alias.
      try {
        const topCases = await db.prepare(`
          SELECT page_id, COUNT(*) as view_count, MAX(viewed_at) as last_viewed_at
          FROM page_view_logs
          WHERE page_type = 'case' AND is_bot = 0
          GROUP BY page_id ORDER BY view_count DESC LIMIT 10
        `).all()
        viewsTopCases = topCases.results || []

        const topCols = await db.prepare(`
          SELECT page_id, COUNT(*) as view_count, MAX(viewed_at) as last_viewed_at
          FROM page_view_logs
          WHERE page_type = 'column' AND is_bot = 0
          GROUP BY page_id ORDER BY view_count DESC LIMIT 10
        `).all()
        viewsTopColumns = topCols.results || []
      } catch {
        // page_view_logs 미적용 환경: 누적 기준으로 폴백
        const topCases = await db.prepare(
          `SELECT page_id, view_count, last_viewed_at FROM page_views WHERE page_type = 'case' ORDER BY view_count DESC LIMIT 10`
        ).all()
        viewsTopCases = topCases.results || []
        const topCols = await db.prepare(
          `SELECT page_id, view_count, last_viewed_at FROM page_views WHERE page_type = 'column' ORDER BY view_count DESC LIMIT 10`
        ).all()
        viewsTopColumns = topCols.results || []
      }

      // ✅ 진짜 "최근 7일 발생 조회수": page_view_logs의 실제 로그를 날짜별로 COUNT.
      //    - is_bot = 0 (봇/크롤러 제외, 진짜 사람 트래픽만)
      //    - viewed_at = 실제 조회가 발생한 시각 (조회 1건 = 1행)
      //    - DATE(viewed_at)별 COUNT(*) = 그날 실제로 발생한 조회수
      //    → 누적 view_count 합산이 아니라 "그 주에 진짜 일어난 조회"를 센다.
      try {
        const recentViews = await db.prepare(`
          SELECT page_type, DATE(viewed_at) as view_date, COUNT(*) as total
          FROM page_view_logs
          WHERE is_bot = 0
            AND viewed_at >= datetime('now', '-7 days')
            AND page_type IN ('case', 'column')
          GROUP BY page_type, DATE(viewed_at)
          ORDER BY view_date
        `).all()
        viewsRecentActivity = recentViews.results || []
      } catch {
        // page_view_logs 마이그레이션 미적용 환경 대비: 빈 배열로 폴백
        viewsRecentActivity = []
      }
    }
  } catch { }

  // ─────────────────────────────────────────────────────────────
  // 3-B. 진짜 트래픽 (page_view_logs 기반, 봇 제외)
  // ─────────────────────────────────────────────────────────────
  let realTraffic: any = {
    available: false,                       // 마이그레이션 적용 전이면 false
    sinceTrackingStarted: null,             // 추적 시작 시각
    today:        { human: 0, bot: 0 },
    last24h:      { human: 0, bot: 0 },
    last7days:    { human: 0, bot: 0 },
    last30days:   { human: 0, bot: 0 },
    daily7:       [] as Array<{date: string; human: number; bot: number}>,
    daily30:      [] as Array<{date: string; human: number; bot: number}>,
    topBotsLast7: [] as Array<{bot_name: string; hits: number}>,
    topReferers:  [] as Array<{referer: string; hits: number}>,
    countries:    [] as Array<{country: string; hits: number}>,
    topPagesHuman7: { cases: [] as any[], columns: [] as any[] },
  }
  try {
    if (db) {
      // 추적 시작 시점
      const firstRow = await db.prepare(
        `SELECT MIN(viewed_at) as first_at, COUNT(*) as total FROM page_view_logs`
      ).first<{ first_at: string | null; total: number }>()

      if (firstRow && firstRow.total > 0) {
        realTraffic.available = true
        realTraffic.sinceTrackingStarted = firstRow.first_at

        // 기간별 사람/봇 카운트
        const periods: Array<[string, string]> = [
          ['today',      "datetime('now', 'start of day')"],
          ['last24h',    "datetime('now', '-24 hours')"],
          ['last7days',  "datetime('now', '-7 days')"],
          ['last30days', "datetime('now', '-30 days')"],
        ]
        for (const [key, since] of periods) {
          const row = await db.prepare(`
            SELECT
              SUM(CASE WHEN is_bot = 0 THEN 1 ELSE 0 END) as human,
              SUM(CASE WHEN is_bot = 1 THEN 1 ELSE 0 END) as bot
            FROM page_view_logs
            WHERE viewed_at >= ${since}
          `).first<{ human: number | null; bot: number | null }>()
          realTraffic[key] = { human: row?.human || 0, bot: row?.bot || 0 }
        }

        // 최근 7일 일별 (사람/봇)
        const d7 = await db.prepare(`
          SELECT DATE(viewed_at) as d,
                 SUM(CASE WHEN is_bot = 0 THEN 1 ELSE 0 END) as human,
                 SUM(CASE WHEN is_bot = 1 THEN 1 ELSE 0 END) as bot
          FROM page_view_logs
          WHERE viewed_at >= datetime('now', '-7 days')
          GROUP BY DATE(viewed_at)
          ORDER BY d
        `).all<{ d: string; human: number; bot: number }>()
        realTraffic.daily7 = d7.results || []

        // 최근 30일 일별
        const d30 = await db.prepare(`
          SELECT DATE(viewed_at) as d,
                 SUM(CASE WHEN is_bot = 0 THEN 1 ELSE 0 END) as human,
                 SUM(CASE WHEN is_bot = 1 THEN 1 ELSE 0 END) as bot
          FROM page_view_logs
          WHERE viewed_at >= datetime('now', '-30 days')
          GROUP BY DATE(viewed_at)
          ORDER BY d
        `).all<{ d: string; human: number; bot: number }>()
        realTraffic.daily30 = d30.results || []

        // 최근 7일 봇 TOP10 (어떤 봇이 많이 들어오는지)
        const botTop = await db.prepare(`
          SELECT COALESCE(bot_name, 'unknown-bot') as bot_name, COUNT(*) as hits
          FROM page_view_logs
          WHERE is_bot = 1 AND viewed_at >= datetime('now', '-7 days')
          GROUP BY bot_name
          ORDER BY hits DESC
          LIMIT 10
        `).all<{ bot_name: string; hits: number }>()
        realTraffic.topBotsLast7 = botTop.results || []

        // 최근 7일 Referer TOP10 (사람만)
        const refTop = await db.prepare(`
          SELECT
            CASE
              WHEN referer IS NULL OR referer = '' THEN '(direct)'
              ELSE referer
            END as referer,
            COUNT(*) as hits
          FROM page_view_logs
          WHERE is_bot = 0 AND viewed_at >= datetime('now', '-7 days')
          GROUP BY referer
          ORDER BY hits DESC
          LIMIT 10
        `).all<{ referer: string; hits: number }>()
        realTraffic.topReferers = refTop.results || []

        // 최근 7일 국가별 (사람만)
        const ctTop = await db.prepare(`
          SELECT COALESCE(NULLIF(country, ''), '?') as country, COUNT(*) as hits
          FROM page_view_logs
          WHERE is_bot = 0 AND viewed_at >= datetime('now', '-7 days')
          GROUP BY country
          ORDER BY hits DESC
          LIMIT 10
        `).all<{ country: string; hits: number }>()
        realTraffic.countries = ctTop.results || []

        // 최근 7일 진짜 TOP 케이스/컬럼 (봇 제외)
        const topCaseHuman = await db.prepare(`
          SELECT page_id, COUNT(*) as views, MAX(viewed_at) as last_viewed
          FROM page_view_logs
          WHERE is_bot = 0 AND page_type = 'case' AND viewed_at >= datetime('now', '-7 days')
          GROUP BY page_id
          ORDER BY views DESC
          LIMIT 10
        `).all()
        const topColHuman = await db.prepare(`
          SELECT page_id, COUNT(*) as views, MAX(viewed_at) as last_viewed
          FROM page_view_logs
          WHERE is_bot = 0 AND page_type = 'column' AND viewed_at >= datetime('now', '-7 days')
          GROUP BY page_id
          ORDER BY views DESC
          LIMIT 10
        `).all()
        realTraffic.topPagesHuman7 = {
          cases: topCaseHuman.results || [],
          columns: topColHuman.results || [],
        }
      }
    }
  } catch (e) {
    // page_view_logs 테이블이 아직 없는 경우 → available = false로 유지
    console.error('realTraffic query failed:', (e as any)?.message)
  }

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
    viewsTopCases,
    viewsTopColumns,
    viewsRecentActivity,
    realTraffic,
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

  // ▶ 보안: 챗봇 Rate Limiting (OpenAI 과금 보호 — 1분 10건 + 1시간 60건)
  const chatIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  if (await isRateLimitedD1(c.env.DB, 'chat1m', chatIP, 60 * 1000, 10)) {
    return c.json({ error: '요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.' }, 429);
  }
  if (await isRateLimitedD1(c.env.DB, 'chat1h', chatIP, 60 * 60 * 1000, 60)) {
    return c.json({ error: '시간당 상담 한도에 도달했습니다. 잠시 후 다시 이용해주세요. 급하신 경우 041-415-2892로 전화 주세요.' }, 429);
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

registerGscReport(app)


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
