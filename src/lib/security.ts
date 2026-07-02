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

// HMAC 기반 세션 토큰 생성
export async function createSessionToken(secret: string): Promise<string> {
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
export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  if (!secret) return false // 시크릿 미설정 시 모든 세션 거부 (fail-closed)
  try {
    const [timestamp, sigHex] = token.split('.')
    if (!timestamp || !sigHex) return false

    // 만료 확인
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
