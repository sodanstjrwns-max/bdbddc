/**
 * 컬럼 자동발행 API (v5.50)
 * =========================
 * Cloudflare Pages 는 Cron Trigger 를 지원하지 않는다. 그래서 스케줄은 별도의
 * 초경량 Cron Worker(cron/index.ts)가 담당하고, 실제 작업은 이 엔드포인트가 한다.
 *
 *   POST /api/cron/publish-column          하루 1건 생성→게이트→발행
 *   POST /api/cron/publish-column?dry=1    발행 없이 게이트 판정만 (리허설)
 *   GET  /api/cron/status                  큐 잔량·썸네일 뱅크 잔량·최근 판정 로그
 *
 * 인증: 헤더 X-Cron-Secret 이 env.CRON_SECRET 과 일치해야 한다.
 *   (관리자 세션 쿠키를 쓰지 않는 이유 = 무인 스케줄러가 호출하기 때문)
 */
import type { Hono } from 'hono'
// THUMB_STYLE 은 실제 발행 경로(column-auto)와 동일해야 하므로 거기서 가져온다.
// 검증 엔드포인트가 다른 프롬프트를 쓰면 검증의 의미가 없다.
import { runAutoPublish, THUMB_STYLE, type AutoEnv } from '../column-auto'

function authed(c: any): boolean {
  const want = c.env?.CRON_SECRET
  const got = c.req.header('X-Cron-Secret') || ''
  if (!want || !got || want.length !== got.length) return false
  let diff = 0
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i)
  return diff === 0
}

export function registerColumnAutoApi(app: Hono<{ Bindings: any }>) {
  app.post('/api/cron/publish-column', async (c) => {
    if (!authed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const dry = c.req.query('dry') === '1'
    try {
      const r = await runAutoPublish(c.env as AutoEnv, { dryRun: dry })
      return c.json({ ok: r.verdict === 'pass', dryRun: dry, ...r })
    } catch (e: any) {
      return c.json({ ok: false, error: String(e?.message || e) }, 500)
    }
  })

  // 썸네일 생성 검증용 (v5.50). Workers AI 가용성과 스타일을 실제로 확인한다.
  app.post('/api/cron/thumb-test', async (c) => {
    if (!authed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const prompt = c.req.query('p') || THUMB_STYLE('a single stylized molar tooth')
    try {
      if (!c.env.AI) return c.json({ ok: false, error: 'AI 바인딩 없음' }, 500)
      const out: any = await c.env.AI.run('@cf/black-forest-labs/flux-1-schnell', { prompt })
      const b64 = out?.image
      if (!b64) return c.json({ ok: false, error: 'AI 응답에 image 없음', keys: Object.keys(out || {}) }, 500)
      const bin = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0))
      const key = `column-thumbs/test-${Date.now()}.jpg`
      await c.env.R2.put(key, bin, { httpMetadata: { contentType: 'image/jpeg' } })
      return c.json({ ok: true, url: `/api/images/${key}`, bytes: bin.length, prompt })
    } catch (e: any) {
      return c.json({ ok: false, error: String(e?.message || e) }, 500)
    }
  })

  app.get('/api/cron/status', async (c) => {
    if (!authed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
    try {
      const db = c.env.DB as D1Database
      const q = await db.prepare(
        `SELECT status, COUNT(*) n, SUM(impressions) imp FROM column_queue GROUP BY status`).all()
      const bank = await db.prepare(
        `SELECT SUM(CASE WHEN used=0 THEN 1 ELSE 0 END) free, COUNT(*) total
         FROM column_thumb_bank`).first().catch(() => null)
      const nextUp = await db.prepare(
        `SELECT query, impressions, ctr, position, score FROM column_queue
         WHERE status='pending' ORDER BY score DESC LIMIT 5`).all()
      const runs = await db.prepare(
        `SELECT query, verdict, slug, ms, created_at, reasons FROM column_auto_runs
         ORDER BY id DESC LIMIT 10`).all()
      return c.json({
        ok: true,
        queue: q.results,
        thumbBank: bank || { free: 0, total: 0, note: '뱅크 미초기화' },
        nextUp: nextUp.results,
        recentRuns: runs.results,
      })
    } catch (e: any) {
      return c.json({ ok: false, error: String(e?.message || e) }, 500)
    }
  })
}
