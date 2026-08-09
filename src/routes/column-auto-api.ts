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
import { runAutoPublish, genThumb, genFigure, THUMB_STYLE, type AutoEnv } from '../column-auto'

function authed(c: any): boolean {
  const want = c.env?.CRON_SECRET
  const got = c.req.header('X-Cron-Secret') || ''
  if (!want || !got || want.length !== got.length) return false
  let diff = 0
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i)
  return diff === 0
}

/** 오늘(KST) 이미 발행된 컬럼이 있으면 그 컬럼을 돌려준다. 없으면 null. */
async function publishedTodayKST(env: any): Promise<{ slug: string; createdAt: string } | null> {
  try {
    const obj = await env.R2?.get('data/columns.json')
    if (!obj) return null
    const cols: any[] = await obj.json()
    const dayKST = (t: string) =>
      new Date(new Date(t).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10)
    const today = dayKST(new Date().toISOString())
    for (const x of cols) {
      if (x?.status !== 'published' || !x?.createdAt) continue
      if (dayKST(x.createdAt) === today) return { slug: x.slug, createdAt: x.createdAt }
    }
    return null
  } catch {
    // R2 를 못 읽으면 잠그지 않는다(발행 자체가 멈추는 쪽이 더 나쁘다).
    return null
  }
}

export function registerColumnAutoApi(app: Hono<{ Bindings: any }>) {
  app.post('/api/cron/publish-column', async (c) => {
    if (!authed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const dry = c.req.query('dry') === '1'
    // ★ v5.55 nothumb=1 → 썸네일을 떼고 본문만 발행한다(약 70초).
    //   썸네일까지 한 요청에 넣으면 125초가 되어 엣지 응답 상한을 넘겨 524 로 죽는다.
    //   (2026-08-03 실측: 크론 wallTime 125.086초 = 수동 curl 524 시각 125.096초)
    const nothumb = c.req.query('nothumb') === '1'
    // ★ v5.62 요청 1개당 LLM 호출 상한. 크론 워커가 maxattempts=1 로 부르고
    //   게이트 탈락 시 '새 요청'으로 재시도한다(125초 엣지 상한 회피).
    const maxAttempts = Math.max(1, Math.min(3, Number(c.req.query('maxattempts') || 0) || 3))
    // ★ v5.57 하루 1건 잠금 (서버측 최종 방어선)
    //   2026-08-03 사고: 크론 재시도 + 사람이 누른 수동 발행이 겹쳐 하루 2편이 올라갔다.
    //   호출자(크론 워커)가 중복 확인을 하긴 하지만, 사람이 curl 로 직접 때리면
    //   그 확인을 건너뛴다. 그래서 발행 직전 여기서 한 번 더 막는다.
    //   - dry=1 리허설은 발행이 없으므로 통과시킨다.
    //   - 의도적 추가 발행(누락분 보충 등)은 force=1 로 명시해야 한다.
    const force = c.req.query('force') === '1'
    if (!dry && !force) {
      const dup = await publishedTodayKST(c.env)
      if (dup) {
        return c.json(
          { ok: true, skipped: 'already-published-today', slug: dup.slug, createdAt: dup.createdAt },
          200,
        )
      }
    }
    try {
      const r = await runAutoPublish(c.env as AutoEnv, { dryRun: dry, skipThumb: nothumb, maxAttempts })
      return c.json({ ok: r.verdict === 'pass', dryRun: dry, skipThumb: nothumb, ...r })
    } catch (e: any) {
      return c.json({ ok: false, error: String(e?.message || e) }, 500)
    }
  })

  // ★ v5.74 발행 실패 알림 (2026-08-09 "내일부터 절대 안 올라가는 일 없도록")
  //   크론 워커가 최종 실패를 확정하면 이 엔드포인트를 불러 원장님께 메일을 쏜다.
  //   사이트에 이미 있는 RESEND_API_KEY / NOTIFICATION_EMAIL 시크릿을 재사용한다.
  app.post('/api/cron/notify', async (c) => {
    if (!authed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const key = (c.env as any).RESEND_API_KEY
    const to = (c.env as any).NOTIFICATION_EMAIL
    if (!key || !to) return c.json({ ok: false, error: 'RESEND_API_KEY/NOTIFICATION_EMAIL 미설정' })
    let subject = '[서울비디치과] 원장 칼럼 자동발행 실패'
    let text = ''
    try {
      const b: any = await c.req.json()
      if (b?.subject) subject = String(b.subject).slice(0, 200)
      text = String(b?.text || '').slice(0, 4000)
    } catch { /* body 없이도 동작 */ }
    const html = `<div style="font-family:sans-serif;max-width:560px;">
      <h2 style="color:#c0392b;">⚠️ 원장 칼럼 자동발행 실패</h2>
      <p>오늘 자동발행이 끝내 실패했습니다. 아래 상태를 확인해 주세요.</p>
      <pre style="background:#f7f7f7;padding:12px;border-radius:8px;white-space:pre-wrap;">${text.replace(/</g, '&lt;')}</pre>
      <p style="font-size:13px;color:#666;">수동 발행: 어시스턴트에게 "오늘 칼럼 발행해줘"라고 요청하시면 됩니다.</p>
    </div>`
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: '서울비디치과 <noreply@patientview.kr>', to: [to], subject, html }),
    })
    return c.json({ ok: r.ok, status: r.status })
  })

  // 썸네일 재생성 도구 (v5.50a). 발행 경로와 완전히 같은 코드(genThumb)를 쓴다.
  //   POST /api/cron/thumb?slug=<슬러그>&hint=<주제 힌트>  → column-thumbs/<slug>.jpg 덮어쓰기
  // 스타일이 마음에 안 드는 컬럼만 골라 다시 뽑을 수 있다.
  app.post('/api/cron/thumb', async (c) => {
    if (!authed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const slug = (c.req.query('slug') || '').trim()
    if (!/^[a-z0-9-]{4,90}$/.test(slug)) return c.json({ ok: false, error: 'slug 형식 오류' }, 400)
    const hint = c.req.query('hint') || slug
    const url = await genThumb(c.env as AutoEnv, slug, hint)
    if (!url) return c.json({ ok: false, error: '생성 실패 (AI 바인딩/응답 확인)' }, 500)

    // ★ v5.55 patch=1 → columns.json 의 해당 컬럼에 thumbnailImage 를 박아준다.
    //   2단계 발행(nothumb=1 → thumb) 에서 2단계가 이 일을 대신 해야 하기 때문이다.
    //   patch 없이 부르면 R2 이미지만 갱신하는 기존 동작(수동 재생성 도구)을 유지한다.
    let patched = false
    if (c.req.query('patch') === '1') {
      const obj = await c.env.R2.get('data/columns.json')
      if (obj) {
        const cols: any[] = await obj.json()
        const i = cols.findIndex((x: any) => x && x.slug === slug)
        if (i >= 0) {
          cols[i].thumbnailImage = url
          cols[i].updatedAt = new Date().toISOString()
          await c.env.R2.put('data/columns.json', JSON.stringify(cols), {
            httpMetadata: { contentType: 'application/json' },
          })
          patched = true
        }
      }
    }
    return c.json({ ok: true, url, hint, patched })
  })

  // ★ v5.63 ③ 본문 삽화 생성 (2026-08-07)
  //   POST /api/cron/figure?slug=<슬러그>&hint=<힌트>&patch=1
  //   → column-figures/<slug>.jpg 저장 + columns.json 의 bodyFigure 필드에 박는다.
  //   렌더러가 bodyFigure 를 읽어 본문 중간(두 번째 h3 앞)에 삽입한다.
  //   ⚠️ 본문 발행과 반드시 '다른 요청'이어야 한다(125초 엣지 상한).
  //   ?next=1 → 슬러그를 주지 않으면 삽화가 없는 가장 오래된 컬럼 1편을 자동 선택.
  app.post('/api/cron/figure', async (c) => {
    if (!authed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
    let slug = (c.req.query('slug') || '').trim()
    const r2 = c.env.R2
    let cols: any[] = []
    if (r2) {
      const obj = await r2.get('data/columns.json')
      if (obj) cols = await obj.json()
    }
    if (!slug) {
      // 삽화 없는 발행분 중 오래된 순으로 1편
      const cand = cols
        .filter((x: any) => x && x.status === 'published' && x.slug && !x.bodyFigure)
        .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())[0]
      if (!cand) return c.json({ ok: true, done: true, note: '삽화가 없는 컬럼이 없습니다' })
      slug = cand.slug
    }
    if (!/^[a-z0-9-]{4,90}$/.test(slug)) return c.json({ ok: false, error: 'slug 형식 오류' }, 400)
    const row = cols.find((x: any) => x && x.slug === slug)
    const hint = c.req.query('hint') || [row?.title, row?.focusKeyword, row?.category].filter(Boolean).join(' ') || slug
    const url = await genFigure(c.env as AutoEnv, slug, hint)
    if (!url) return c.json({ ok: false, error: '삽화 생성 실패 (AI 바인딩/응답 확인)', slug }, 500)

    let patched = false
    if (c.req.query('patch') === '1' && r2) {
      // ⚠️ 경합 방어: put 직전에 다시 읽는다(v5.58/v5.62 교훈).
      const obj2 = await r2.get('data/columns.json')
      if (obj2) {
        const fresh: any[] = await obj2.json()
        const i = fresh.findIndex((x: any) => x && x.slug === slug)
        if (i >= 0) {
          fresh[i].bodyFigure = url
          await r2.put('data/columns.json', JSON.stringify(fresh), {
            httpMetadata: { contentType: 'application/json' },
          })
          patched = true
        }
      }
    }
    return c.json({ ok: true, slug, url, hint, patched })
  })

  // 프롬프트 실험용 (임의 프롬프트 → 임시 키). 스타일 튜닝할 때만 쓴다.
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
