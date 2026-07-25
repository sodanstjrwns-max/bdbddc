// ============================================================
// 채용 지원 API — v5.36 라우트 분할 (순수 이동, 동작 변경 없음)
// 지원서 제출 / 관리자 조회·수정·삭제 / 이메일 알림
// ============================================================
import type { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import type { Bindings } from '../types'
import { ADMIN_SESSION_COOKIE, getSessionSecret, verifySessionToken, isRateLimitedD1 } from '../lib/security'

type Deps = {
  hasSuspiciousInput: (body: Record<string, any>) => string | null
  verifyTurnstile: (token: string, secret: string, ip?: string) => Promise<boolean>
}

export function registerCareerApis(app: Hono<{ Bindings: Bindings }>, deps: Deps) {
const { hasSuspiciousInput, verifyTurnstile } = deps
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
    const row = await db.prepare('SELECT photo_key FROM career_applications WHERE id = ?').bind(id).first<{ photo_key: string | null }>()
    if (row?.photo_key) {
      try { await r2.delete(row.photo_key) } catch {}
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
}
