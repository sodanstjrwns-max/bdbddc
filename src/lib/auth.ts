// ============================================
// lib/auth.ts — 회원 인증 헬퍼 (이메일+비밀번호, D1 저장)
// (v5.7 모듈 분리 2단계: index.tsx에서 추출)
// ============================================

export const MEMBERS_JSON_KEY = 'data/members.json'
export const SITE_SESSION_COOKIE = 'bd_session'
export const SITE_SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30일

// 비밀번호 해싱 (PBKDF2)
export async function hashPassword(password: string, salt?: string): Promise<{hash: string; salt: string}> {
  const encoder = new TextEncoder()
  const s = salt || Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,'0')).join('')
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt: encoder.encode(s), iterations: 100000, hash:'SHA-256'}, key, 256)
  const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('')
  return { hash, salt: s }
}

// 사이트 세션 토큰 생성
export async function createSiteSession(userId: string, secret: string): Promise<string> {
  const payload = `${userId}:${Date.now()}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('')
  return `${btoa(payload)}.${sigHex}`
}

// 사이트 세션 검증 → userId 반환
export async function verifySiteSession(token: string, secret: string): Promise<string|null> {
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
export function memberFromRow(r: any): any {
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

export async function insertMemberD1(db: D1Database, m: any) {
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
export async function ensureMembersMigrated(db: D1Database, r2?: R2Bucket) {
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

export async function findMemberByEmail(db: D1Database, email: string): Promise<any|null> {
  const row = await db.prepare('SELECT * FROM members WHERE email = ?').bind(email.toLowerCase().trim()).first()
  return memberFromRow(row)
}
export async function findMemberById(db: D1Database, id: string): Promise<any|null> {
  const row = await db.prepare('SELECT * FROM members WHERE id = ?').bind(id).first()
  return memberFromRow(row)
}

// 비밀번호 재설정 토큰: SHA-256 해시만 DB 저장 (원문 노출 방지)
export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}
