/**
 * 컬럼 자동발행 스케줄러 (Cloudflare Worker, Cron Trigger)
 * Cloudflare Pages 는 Cron Trigger 를 지원하지 않는다.
 * ⚠️ 이 디렉토리는 scripts/ 아래에 있다. 루트에 두면 post-build.cjs 가
 *    루트 디렉토리를 통째로 dist/ 에 복사하므로 소스가 공개 배포된다.
 * 배포:
 *   npx wrangler deploy -c scripts/cron-worker/wrangler.jsonc
 *   npx wrangler secret put CRON_SECRET -c scripts/cron-worker/wrangler.jsonc
 */
export interface Env { TARGET_URL: string; CRON_SECRET: string }

/* ⚠️⚠️ v5.55 근본 원인 규명 (2026-08-03) ⚠️⚠️
   증상: 8/2·8/3 자동발행이 조용히 유실. 크론은 정상 실행됐다(status: success).
   실측:
     · workersInvocationsAdaptive wallTime = 8/2 120.508초 / 8/3 125.086초
     · 같은 엔드포인트를 curl 로 직접 호출 → HTTP 524 / 125.096초 (소수점까지 일치)
     · dry=1(썸네일 없음) → HTTP 200 / 69.8초, 게이트 pass
   결론: 본문 생성 64초 + 썸네일 생성·R2 커밋 61초 = 125초.
         Cloudflare 엣지의 응답 상한을 넘겨 524 로 끊기고, 발행 커밋 직전에 죽었다.
         워커는 fetch 가 '응답을 받았으므로' 예외 없이 종료 → status success 로 기록.
         그래서 대시보드상 아무 에러도 안 보이는 조용한 유실이 됐다.

   대책: 한 요청에 다 하지 말고 두 개의 짧은 요청으로 쪼갠다.
     ① POST /api/cron/publish-column?nothumb=1   본문만 발행   (약 70초)
     ② POST /api/cron/thumb?slug=…&hint=…&patch=1 썸네일 + columns.json 패치 (약 55초)
   scheduled() 자체는 엣지 응답 상한이 없고 최대 15분이므로 순차 호출이 안전하다.

   ⚠️ ctx.waitUntil() 로 응답 먼저 보내고 뒤에서 돌리는 방식은 쓰지 마라.
      응답 후 연장 수명이 약 30초로 끊겨 작업이 중단되고 큐 행이 'processing' 에
      갇혔다(실측 2회). 두 핸들러 모두 promise 를 await 해서 요청 수명 안에서 끝낸다.
   그래도 실패는 가능하므로, 본 사이트 쪽 runAutoPublish 가 30분 초과 processing 행을
   자동 회수한다(다음 날 재시도). */

const UA = 'bdbddc-column-cron/2.0'

async function post(env: Env, path: string): Promise<{ status: number; body: string }> {
  const base = (env.TARGET_URL || 'https://bdbddc.com').replace(/\/+$/, '')
  const r = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'X-Cron-Secret': env.CRON_SECRET || '', 'User-Agent': UA },
  })
  return { status: r.status, body: await r.text() }
}

async function trigger(env: Env): Promise<string> {
  // ── ① 본문 발행 (썸네일 제외, LLM 1회 = 약 70초) ──────────────
  //   ★ v5.62 (2026-08-07) 게이트 탈락 시 같은 요청 안에서 LLM 을 다시 부르면
  //     125초 엣지 응답 상한을 넘겨 응답이 잘리고 조용한 유실이 된다.
  //     실측: 8/6 125,074ms · 8/7 125,076ms (status 는 success 로 거짓 보고)
  //     → 재시도를 '새 요청'으로 돌린다. scheduled() 수명 15분이므로 3회 여유.
  let slug = ''
  let hint = ''
  let verdict = ''
  for (let round = 1; round <= 3; round++) {
    let step1: { status: number; body: string }
    try {
      step1 = await post(env, '/api/cron/publish-column?nothumb=1&maxattempts=1')
    } catch (e: any) {
      console.error(`[cron] 1단계 ${round}회차 fetch 실패: ${e?.message || e}`)
      return `step1-error(r${round})`
    }
    console.log(`[cron] 1단계 ${round}회차 ${step1.status} ${step1.body.slice(0, 400)}`)
    if (step1.status !== 200) return `step1-${step1.status}(r${round})`
    try {
      const j: any = JSON.parse(step1.body)
      slug = String(j?.slug || '')
      hint = String(j?.thumbHint || j?.picked || slug)
      verdict = String(j?.verdict || (j?.skipped ? 'skipped' : ''))
    } catch {
      console.error('[cron] 1단계 응답 JSON 파싱 실패')
      return `step1-badjson(r${round})`
    }
    if (verdict === 'pass') break
    // block 이면 다음 회차에서 다시 뽑는다.
    // (게이트 지적은 D1 last_error 에 남아 다음 프롬프트로 되돌아간다 — v5.62)
    if (verdict !== 'block') return `no-publish(${verdict || 'noslug'})`
  }
  if (verdict !== 'pass' || !slug) return 'no-publish(block-x3)'

  // ── ② 썸네일 생성 + columns.json 패치 ─────────────────────────
  const qs = `slug=${encodeURIComponent(slug)}&hint=${encodeURIComponent(hint.slice(0, 300))}&patch=1`
  try {
    const step2 = await post(env, `/api/cron/thumb?${qs}`)
    console.log(`[cron] 2단계 ${step2.status} ${step2.body.slice(0, 300)}`)
    // 썸네일이 실패해도 본문은 이미 발행됐다. 실패를 상태에 남기고 끝낸다.
    return step2.status === 200 ? `ok(${slug})` : `published-nothumb(${slug},${step2.status})`
  } catch (e: any) {
    console.error(`[cron] 2단계 fetch 실패: ${e?.message || e}`)
    return `published-nothumb(${slug},fetch-error)`
  }
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    await trigger(env)          // waitUntil 아님 — 끝까지 기다린다
  },
  // 수동 점검용. 시크릿을 헤더로 다시 요구한다(공개 URL 이므로).
  // 호출자는 3~4분 연결을 유지해야 한다 (curl -m 300).
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.headers.get('X-Cron-Secret') !== env.CRON_SECRET) {
      return new Response('cron worker: scheduled only', { status: 401 })
    }
    const s = await trigger(env)
    return new Response(`triggered: ${s}\n`, { status: 200 })
  },
}
