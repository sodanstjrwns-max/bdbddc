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

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(trigger(env))
  },
  // 수동 점검용. 시크릿을 헤더로 다시 요구한다(공개 URL 이므로).
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.headers.get('X-Cron-Secret') !== env.CRON_SECRET) {
      return new Response('cron worker: scheduled only', { status: 401 })
    }
    const s = await trigger(env)
    return new Response(`triggered: ${s}`, { status: 200 })
  },
}
