// ============================================
// lib/security.ts — 관리자 세션 + Rate Limiting
// (v5.7 모듈 분리 2단계: index.tsx에서 추출)
// ============================================
import type { Bindings } from '../types'

// === 관리자 인증 시스템 (비밀번호 + 쿠키 세션) ===
export const ADMIN_SESSION_COOKIE = 'bd_admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7일 (컬럼 장시간 작성 중 세션 만료 방지)

// ▶ 보안: 시크릿은 반드시 환경변수에서만 가져온다 (하드코딩 fallback 금지)
// 미설정 시 빈 문자열 반환 → 모든 인증이 거부됨 (fail-closed)
export function getSessionSecret(env: Bindings): string {
  return env.ADMIN_SESSION_SECRET || ''
}

// === 세션 역할 (v6.16 직원 전용 로그인) ===
// 'admin' = 대표원장 (전체 접근) / 'staff' = 직원 (비포애프터·채용만)
export type SessionRole = 'admin' | 'staff'

// HMAC 서명 헬퍼
async function hmacHex(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// HMAC 기반 세션 토큰 생성
// admin: `${timestamp}.${sig}` (레거시 호환 포맷 유지 — 기존 로그인 세션 안 끊김)
// staff: `${timestamp}.staff.${sig}` (sig = HMAC(`staff:${timestamp}`))
export async function createSessionToken(secret: string, role: SessionRole = 'admin'): Promise<string> {
  const timestamp = Date.now().toString()
  if (role === 'staff') {
    const sigHex = await hmacHex(secret, `staff:${timestamp}`)
    return `${timestamp}.staff.${sigHex}`
  }
  const sigHex = await hmacHex(secret, timestamp)
  return `${timestamp}.${sigHex}`
}

// 세션 토큰의 역할 판별 (만료·서명 검증 포함)
// 반환: 'admin' | 'staff' | null(무효)
export async function getSessionRole(token: string, secret: string): Promise<SessionRole | null> {
  if (!secret) return null // 시크릿 미설정 시 모든 세션 거부 (fail-closed)
  try {
    const parts = token.split('.')

    // 3세그먼트 = staff 토큰: `${timestamp}.staff.${sig}`
    if (parts.length === 3) {
      const [timestamp, roleSeg, sigHex] = parts
      if (roleSeg !== 'staff' || !timestamp || !sigHex) return null
      const age = Date.now() - parseInt(timestamp)
      if (age > SESSION_MAX_AGE * 1000) return null
      const expectedHex = await hmacHex(secret, `staff:${timestamp}`)
      return sigHex === expectedHex ? 'staff' : null
    }

    // 2세그먼트 = admin 토큰 (레거시 포맷)
    const [timestamp, sigHex] = parts
    if (!timestamp || !sigHex) return null
    const age = Date.now() - parseInt(timestamp)
    if (age > SESSION_MAX_AGE * 1000) return null
    const expectedHex = await hmacHex(secret, timestamp)
    return sigHex === expectedHex ? 'admin' : null
  } catch {
    return null
  }
}

// 세션 토큰 검증 — ⚠️ admin 전용 (기존 21개 인라인 가드가 이 함수를 쓰므로,
// staff 토큰은 여기서 false → 컬럼/공지/예약 등 나머지 관리자 API 자동 차단)
export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  return (await getSessionRole(token, secret)) === 'admin'
}

// admin 또는 staff 모두 허용 (비포애프터·채용·업로드 API 전용)
export async function verifyStaffOrAdmin(token: string, secret: string): Promise<boolean> {
  return (await getSessionRole(token, secret)) !== null
}

// ▶ 보안: Rate Limiting (D1 기반 — Workers는 isolate 간 메모리 비공유라 in-memory Map은 무력)
// scope별 정책 예: login(15분 20건), careers(5분 3건), chat(1분 10건 + 1시간 60건)
export async function isRateLimitedD1(
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
