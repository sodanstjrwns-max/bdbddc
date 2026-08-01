/**
 * 컬럼 자동발행 스케줄러 (Cloudflare Worker, Cron Trigger)
 * ========================================================
 * Cloudflare Pages 는 Cron Trigger 를 지원하지 않는다.
 * 그래서 이 초경량 워커만 별도로 배포해서 매일 정해진 시각에
 * 본 사이트의 /api/cron/publish-column 을 때린다.
 *
 * ⚠️ 이 디렉토리는 scripts/ 아래에 있다. 루트에 두면 post-build.cjs 가
 *    루트 디렉토리를 통째로 dist/ 에 복사하므로 소스가 공개 배포된다.
 *
 * 배포:
 *   npx wrangler deploy -c scripts/cron-worker/wrangler.jsonc
 *   npx wrangler secret put CRON_SECRET -c scripts/cron-worker/wrangler.jsonc
 *
 * 수동 실행(리허설):
 *   curl -X POST https://bdbddc.com/api/cron/publish-column?dry=1 -H "X-Cron-Secret: …"
 */
export interface Env {
  TARGET_URL: string
  CRON_SECRET: string
}

async function trigger(env: Env): Promise<string> {
  const url = `${(env.TARGET_URL || 'https://bdbddc.com').replace(/\/+$/, '')}/api/cron/publish-column`
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'X-Cron-Secret': env.CRON_SECRET || '', 'User-Agent': 'bdbddc-column-cron/1.0' },
    })
    const body = await r.text()
    // 워커 로그(wrangler tail)에 남긴다. 실패해도 재시도하지 않는다 —
    // 큐 상태(attempts)가 D1 에 남아 다음 날 자동으로 이어진다.
    console.log(`[cron] ${r.status} ${body.slice(0, 500)}`)
    return `${r.status}`
  } catch (e: any) {
    console.error(`[cron] fetch 실패: ${e?.message || e}`)
    return 'error'
  }
}

/* ⚠️ 실측 주의 (2026-08-01)
   한 건 생성은 LLM 3,400~5,200자 + DOI 실재 검증 때문에 왕복 85~120초가 걸린다.
   ctx.waitUntil() 로 응답 먼저 보내고 뒤에서 돌리면, 응답 후 연장 수명이 약 30초로
   끊겨 작업이 중단되고 큐 행이 'processing' 에 갇혔다(실측 2회).
   → 두 핸들러 모두 promise 를 반환/await 해서 요청 수명 안에서 끝내야 한다.
   Workers 가 과금·제한하는 것은 CPU 시간이고 이 작업은 거의 전부 fetch 대기라 안전하다.
   그래도 실패는 가능하므로, 본 사이트 쪽 runAutoPublish 가 30분 초과 processing 행을
   자동 회수한다(다음 날 재시도). */
export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    await trigger(env)          // waitUntil 아님 — 끝까지 기다린다
  },
  // 수동 점검용. 시크릿을 헤더로 다시 요구한다(공개 URL 이므로).
  // 호출자는 2~3분 연결을 유지해야 한다 (curl -m 280).
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.headers.get('X-Cron-Secret') !== env.CRON_SECRET) {
      return new Response('cron worker: scheduled only', { status: 401 })
    }
    const s = await trigger(env)
    return new Response(`triggered: ${s}\n`, { status: 200 })
  },
}
