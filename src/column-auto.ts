/**
 * 원장 컬럼 자동발행 엔진 — v5.50 / 2026-08-01
 * ==============================================
 * 사용자 승인 조건: "내가 지금까지 한 퀄리티를 유지할 수 있으면 자동발행"
 *   → 승인 게이트(사람) 대신 기계 게이트(src/column-gate.ts)가 문을 지킨다.
 *     게이트를 통과하지 못한 초안은 발행되지 않는다. 3회 연속 탈락 시 draft 격리.
 *
 * 파이프라인
 *   ① D1 column_queue 에서 status='pending' 중 기회점수 최고 1건 선점(processing)
 *   ② LLM 으로 초안 생성 (모델: gpt-5)
 *   ③ 품질 게이트 (구조/DOI실재/의료법§56/누출/이스케이프/메타/반복/코퍼스중복)
 *   ④ 탈락 시 탈락사유를 프롬프트에 되먹여 재생성 (최대 3회)
 *   ⑤ 통과 시 R2 data/columns.json 에 append + 썸네일 런타임 생성(Workers AI)
 *   ⑥ 모든 판정을 column_auto_runs 에 기록
 *
 * 배포가 필요 없는 구조인 이유
 *   · 컬럼 본문은 R2(런타임 로드) → 새 컬럼 추가에 배포 불필요
 *   · 썸네일은 Workers AI(flux-1-schnell)로 그려 R2 에 넣고 GET /api/images/* 로 서빙
 *     (/images/* 는 _routes.json exclude 라 워커를 우회하는 CDN 자산 → 런타임 생성 불가.
 *      반면 /api/images/* 는 워커가 R2 를 직접 읽어 주는 공개 경로이고
 *      Cache-Control: immutable 이 붙으므로 정적 자산과 성능이 같다.)
 *   · Workers AI 는 계정 무료 할당을 쓰므로 이미지 생성 크레딧이 들지 않고 개수 제한이 없다.
 *     주제별 전용 썸네일이 나오므로 유한한 '뱅크'보다 결과물이 좋다. 뱅크는 폴백으로만 남긴다.
 */
import { gateColumn, type ColumnDraft, type GateResult } from './column-gate'

export interface AutoEnv {
  DB: D1Database
  R2: R2Bucket
  AI?: { run: (model: string, input: any) => Promise<any> }
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  AUTO_MODEL?: string
  CRON_SECRET?: string
}

const COLUMNS_KEY = 'data/columns.json'
const DEFAULT_MODEL = 'gpt-5'
const DEFAULT_BASE = 'https://www.genspark.ai/api/llm_proxy/v1'
const MAX_ATTEMPTS = 3

/** 병원 확정 사실 — 할루시네이션 방지용. 이 목록 밖의 수치는 쓰지 못하게 한다. */
const CLINIC_FACTS = `
[서울비디치과 확정 사실 — 이 목록에 없는 수치·실적은 절대 쓰지 말 것]
- 충남 천안시 서북구 불당34길 14, 1~5층 (우 31166) / 대표전화 041-415-2892
- 400평(1,320㎡) 5개 층, 진료과목별 층 분리, 독립 수술실 6개, 에어샤워
- 서울대 출신 의료진 14인, 소아치과 전문의 3인, 원내 기공소, 3D CT(CBCT)
- 임플란트 누적 30,000건 이상, 치과 백과사전 838개 용어 운영
- 진료시간: 365일 / 평일 09:00–20:00(점심 12:30–14:00) / 주말·공휴일 09:00–13:00
- 글로우네이트(자체 라미네이트 프로그램) 10년 보증, 라미네이트 프리미엄 1본 80만원
- 라미네이트 삭제량 0.3~0.5mm, 세라믹은 E.max 계열
- 심미레진 15~25만원, 워킹 블리치 15만원~, 크라운 60~120만원
- 치아미백 소프트 4.9만원 / 하드 8만원
- 접근성: 아산 15~25분, 세종 30분, 대전 40분
`.trim()

/** 절대 쓰면 안 되는 문구 — v5.49에서 367건 세탁한 프롬프트 지시문 계열 */
const FORBIDDEN_PHRASES = [
  '먼저 이 글에서 … 가져가셨으면', '가져가셨으면 하는 것은', '인용 가능한 한 줄',
  '통념 하나를 부드럽게', '데이터로 답을 드리겠습니다.', '한 달에 N 분 넘게',
  '환자분 통념 하나', '여기서 한 가지 안심시켜 드리고 싶습니다.',
]

function systemPrompt(): string {
  return `당신은 서울비디치과 대표원장 문석준입니다. 통합치의학과 전문의이며, 환자에게
직접 말하듯 쓰되 근거를 반드시 논문으로 붙이는 사람입니다.

${CLINIC_FACTS}

[의료법 제56조 — 위반 시 발행 자체가 차단됩니다]
- 효과 보장 금지: "영구히 유지", "평생 보장", "100% 성공", "부작용 없습니다", "완치"
- 최상급/비교 금지: "지역 최고", "1위", "저희가 유일" 같은 자기 최상급
- 치료경험담 광고 금지, 연예인 유인 금지, 이벤트·할인·무료 진료 유인 금지
- 위험·부작용은 은폐하지 말고 수치와 함께 정직하게 고지할 것

[절대 쓰지 말 것 — 지시문 누출로 간주되어 차단됩니다]
${FORBIDDEN_PHRASES.map(p => `- 「${p}」`).join('\n')}
- 그 외 "이 글에서는 ~을 다루겠습니다" 류의 메타 서술 일체

[근거]
- 실제로 존재하는 논문 DOI 를 1~3개 본문에 넣습니다.
- DOI 는 발행 전 doi.org 로 실재 여부를 자동 검증합니다. 존재하지 않는 DOI 를 쓰면 차단됩니다.
- 확실히 아는 DOI 만 쓰십시오. Cochrane 리뷰(10.1002/14651858.*), JADA, J Clin Periodontol,
  Int J Oral Maxillofac Surg 등 널리 인용되는 논문이 안전합니다.
- 인용 시 저자·연도·저널명·DOI 가 서로 일치해야 합니다.`
}

function userPrompt(query: string, meta: { impressions: number; ctr: number; position: number | null },
                    existingTitles: string[], feedback?: string[]): string {
  const pos = meta.position != null ? `현재 이 검색어에서 우리 사이트 평균 게재순위 ${meta.position}위.` : ''
  return `아래 검색어로 구글에 들어오는 환자에게 답하는 원장 컬럼 1편을 작성하세요.

[검색어] ${query}
[검색 수요] 월 노출 ${meta.impressions.toLocaleString()}회, 현재 CTR ${meta.ctr}%. ${pos}
이 검색어에 대한 전용 콘텐츠가 우리 사이트에 아직 없습니다. 이 글이 그 답이 됩니다.

[분량·구조 — 기존 컬럼 74편의 실측 분포에 맞춥니다]
- 본문(태그 제거 후) 3,400~5,200자
- <h3> 소제목 5~9개 (h1·h2 는 넣지 마세요. h1은 렌더러가 생성합니다)
- <table> 1~2개 — 비교·비용·기간처럼 표로 봐야 이해되는 내용
- <li> 항목 8~20개
- 문단은 <p>, 강조는 <strong>. script/iframe 금지. style 속성 최소화

[글의 태도]
- 검색어에 담긴 실제 불안을 첫 문단에서 정면으로 다룹니다. 서론을 길게 끌지 마세요.
- 숫자와 기간을 구체적으로 씁니다. 모르면 "케이스마다 편차가 있다"고 정직하게 씁니다.
- 단점·한계·실패 가능성을 반드시 한 섹션 이상 다룹니다.
- 마지막에 내원 안내를 1~2문장으로 담백하게. 과장·유인 금지.

[이미 발행된 컬럼 제목 — 주제·문장이 겹치면 차단됩니다]
${existingTitles.slice(0, 60).map(t => `- ${t}`).join('\n')}
${feedback && feedback.length ? `
[⚠️ 직전 초안이 품질 게이트에서 차단되었습니다. 아래를 모두 고쳐 다시 쓰세요]
${feedback.map(f => `- ${f}`).join('\n')}` : ''}

[출력 형식] 아래 키만 가진 JSON 객체 하나만 출력하세요. 설명·코드펜스 금지.
{
  "slug": "영문 소문자-하이픈, 8~90자, 검색어 의미를 담을 것",
  "title": "10~60자. 검색어의 질문에 답하는 제목",
  "metaTitle": "34자 이내. SERP 노출용 짧은 제목",
  "metaDescription": "60~160자. 큰따옴표(\\") 절대 사용 금지",
  "focusKeyword": "핵심 키워드 1개",
  "category": "임플란트|교정|심미치료|보존치료|구강외과|예방·관리|소아치과|보험·비용 중 하나",
  "content": "<p>…</p> 형태의 본문 HTML"
}`
}

async function callLLM(env: AutoEnv, messages: any[], model: string): Promise<string> {
  const base = (env.OPENAI_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '')
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY || ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, response_format: { type: 'json_object' } }),
  })
  if (!r.ok) throw new Error(`LLM ${r.status} ${(await r.text()).slice(0, 200)}`)
  const j: any = await r.json()
  const c = j?.choices?.[0]?.message?.content
  if (!c) throw new Error('LLM 응답에 content 없음')
  return c
}

function parseDraft(raw: string): ColumnDraft {
  let s = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const o = JSON.parse(s)
  return (Array.isArray(o) ? o[0] : o) as ColumnDraft
}

async function loadColumns(env: AutoEnv): Promise<any[]> {
  const obj = await env.R2.get(COLUMNS_KEY)
  if (!obj) return []
  return await obj.json()
}

/* ────────────────────────── 썸네일 (Workers AI 런타임 생성) ──────────────────────────
   기존 74편 썸네일의 톤을 재현하는 고정 스타일 프롬프트.
   3D 클레이 / 파스텔 민트+피치 / 크림 배경 / 글자 없음.
   flux-1-schnell 은 1024x1024 고정 출력이다. 카드(.cc-thumb)와 목록(.dr-col-thumb)은
   aspect-ratio:16/9 + object-fit:cover 라 그대로 써도 되지만, 상세 히어로는
   1376x768 을 선언하고 있어 CLS 가 생긴다 → 렌더러에서 /api/images/* 는 별도 처리. */
export const THUMB_STYLE = (subject: string) =>
  `3D clay render illustration, soft matte clay texture, pastel mint green and peach coral ` +
  `color palette, ${subject}, soft studio lighting, rounded friendly shapes, ` +
  `cream beige background, minimal composition, centered, no text, no letters, no words, no numbers`

/** 주제 → 영어 모티프. 검색어·키워드·카테고리를 붙인 문자열로 매칭한다. */
const MOTIF: [RegExp, string][] = [
  [/사랑니|매복|발치|뽑/, 'a single wisdom tooth gently held by rounded clay forceps'],
  [/임플란트|식립|뼈이식|골이식/, 'a clay dental implant screw standing beside a molar tooth'],
  [/교정|투명|브라켓|덧니|돌출입|정중선/, 'a clay tooth wearing a clear aligner tray'],
  [/라미네이트|심미|미백|화이트닝|베니어|글로우네이트/, 'a bright clay front tooth with a glossy thin veneer shell floating beside it'],
  [/충치|레진|우식|때우/, 'a clay molar with a small dark cavity spot and a tiny clay filling piece'],
  [/신경치료|근관|크라운|보철|인레이|씌우/, 'a clay molar with a golden crown cap floating above it'],
  [/잇몸|치주|스케일링|풍치|치석|출혈/, 'clay gums cradling three teeth next to a soft rounded toothbrush'],
  [/틀니|의치/, 'a clay denture arch resting on a rounded pedestal'],
  [/소아|어린이|아이|유치|젖니/, 'a small smiling clay milk tooth character'],
  [/비용|가격|보험|실비|급여|할부|견적/, 'a clay tooth beside a small stack of clay coins and a tiny calculator'],
  [/턱|악관절|교합|이갈이|턱관절/, 'a clay lower jaw model with a soft glowing highlight at the joint'],
  [/구취|입냄새|구강건조|침/, 'a clay tooth with soft mint leaves and a gentle air swirl'],
  [/칫솔|양치|치실|가글|관리|예방/, 'a rounded clay toothbrush and dental floss spool beside a clean tooth'],
  [/사진|엑스레이|ct|파노라마|검진/i, 'a clay tooth next to a rounded clay magnifying glass'],
  [/치아|이빨|구강|치과|어금니|앞니/, 'a single stylized molar tooth'],
]
function motifOf(hint: string): string {
  for (const [re, m] of MOTIF) if (re.test(hint)) return m
  return 'a single stylized molar tooth beside a small rounded clay magnifying glass'
}

/** Workers AI 로 썸네일 1장 생성 → R2 저장 → 공개 경로 반환. 실패하면 null. */
async function genThumb(env: AutoEnv, slug: string, hint: string): Promise<string | null> {
  if (!env.AI) return null
  try {
    const prompt = THUMB_STYLE(motifOf(hint))
    const out: any = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', { prompt })
    const b64 = out?.image
    if (typeof b64 !== 'string' || b64.length < 5000) return null
    const bin = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0))
    if (bin.length < 8000) return null            // 깨진 응답 방어
    const key = `column-thumbs/${slug}.jpg`
    await env.R2.put(key, bin, {
      httpMetadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' },
    })
    return `/api/images/${key}`
  } catch {
    return null   // 썸네일 실패가 발행을 막지는 않는다
  }
}

/** 폴백: 미리 만들어 둔 정적 썸네일 뱅크에서 미사용 1장 배정 */
async function takeBankThumb(env: AutoEnv, slug: string): Promise<string | null> {
  try {
    const row: any = await env.DB.prepare(
      `SELECT id, path FROM column_thumb_bank WHERE used = 0 ORDER BY id LIMIT 1`).first()
    if (!row) return null
    await env.DB.prepare(
      `UPDATE column_thumb_bank SET used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(slug, row.id).run()
    return row.path as string
  } catch {
    return null   // 뱅크 테이블이 없어도 파이프라인은 멈추지 않는다
  }
}

/** 썸네일 확보: Workers AI 우선 → 뱅크 폴백 → 없으면 null(렌더러가 플레이스홀더 처리) */
async function takeThumb(env: AutoEnv, slug: string, hint: string): Promise<string | null> {
  return (await genThumb(env, slug, hint)) || (await takeBankThumb(env, slug))
}

export interface RunResult {
  picked?: string
  slug?: string
  verdict: 'pass' | 'block' | 'error' | 'empty'
  attempts: number
  blocks?: string[]
  warns?: string[]
  metrics?: Record<string, any>
  ms: number
}

/** 하루 1회 실행되는 본체 */
export async function runAutoPublish(env: AutoEnv, opts: { dryRun?: boolean } = {}): Promise<RunResult> {
  const t0 = Date.now()
  const model = env.AUTO_MODEL || DEFAULT_MODEL

  // ① 큐 선점 — 동시 실행되어도 한 건만 잡히도록 status 조건을 UPDATE 에 건다
  const cand: any = await env.DB.prepare(
    `SELECT * FROM column_queue WHERE status = 'pending' ORDER BY score DESC LIMIT 1`).first()
  if (!cand) return { verdict: 'empty', attempts: 0, ms: Date.now() - t0 }
  const claim = await env.DB.prepare(
    `UPDATE column_queue SET status='processing', updated_at=CURRENT_TIMESTAMP
     WHERE id = ? AND status='pending'`).bind(cand.id).run()
  if (!claim.meta.changes) return { verdict: 'empty', attempts: 0, ms: Date.now() - t0 }

  const existing = await loadColumns(env)
  const titles = existing.map((c: any) => c.title).filter(Boolean)
  const meta = { impressions: cand.impressions, ctr: cand.ctr, position: cand.position }

  let feedback: string[] | undefined
  let last: GateResult | null = null
  let draft: ColumnDraft | null = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await callLLM(env, [
        { role: 'system', content: systemPrompt() },
        { role: 'user', content: userPrompt(cand.query, meta, titles, feedback) },
      ], model)
      draft = parseDraft(raw)
    } catch (e: any) {
      await logRun(env, cand, 'error', [String(e?.message || e)], null, null, model, Date.now() - t0)
      await env.DB.prepare(
        `UPDATE column_queue SET status='pending', attempts=attempts+1, last_error=?,
         updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(String(e?.message || e).slice(0, 400), cand.id).run()
      return { picked: cand.query, verdict: 'error', attempts: attempt, blocks: [String(e?.message || e)], ms: Date.now() - t0 }
    }

    last = await gateColumn(draft, { online: true, corpus: existing })
    if (last.pass) break
    feedback = last.blocks
  }

  // ④ 판정
  if (!last || !last.pass) {
    await logRun(env, cand, 'block', last?.blocks || [], last?.metrics || null, draft?.slug || null, model, Date.now() - t0)
    await env.DB.prepare(
      `UPDATE column_queue SET status = CASE WHEN attempts+1 >= ? THEN 'draft' ELSE 'pending' END,
       attempts=attempts+1, last_error=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(MAX_ATTEMPTS, (last?.blocks || []).join(' | ').slice(0, 900), cand.id).run()
    return {
      picked: cand.query, slug: draft?.slug, verdict: 'block', attempts: MAX_ATTEMPTS,
      blocks: last?.blocks, warns: last?.warns, metrics: last?.metrics, ms: Date.now() - t0,
    }
  }

  // ⑤ 발행
  const now = new Date().toISOString()
  const thumbHint = [cand.query, draft!.focusKeyword || '', draft!.category || '', draft!.title || ''].join(' ')
  const thumb = opts.dryRun ? null : await takeThumb(env, draft!.slug!, thumbHint)
  const record: any = {
    ...draft,
    author: '문석준',
    status: 'published',
    publishedAt: now,
    updatedAt: now,
    autoGenerated: true,
    sourceQuery: cand.query,
    ...(thumb ? { thumbnailImage: thumb } : {}),
  }

  if (!opts.dryRun) {
    existing.push(record)
    await env.R2.put(COLUMNS_KEY, JSON.stringify(existing), {
      httpMetadata: { contentType: 'application/json' },
    })
    await env.DB.prepare(
      `UPDATE column_queue SET status='published', slug=?, published_at=CURRENT_TIMESTAMP,
       last_error=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(draft!.slug, cand.id).run()
  } else {
    await env.DB.prepare(
      `UPDATE column_queue SET status='pending', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(cand.id).run()
  }
  await logRun(env, cand, 'pass', last.warns, last.metrics, draft!.slug!, model, Date.now() - t0)

  return {
    picked: cand.query, slug: draft!.slug, verdict: 'pass', attempts: 1,
    warns: last.warns, metrics: { ...last.metrics, thumbnail: thumb || '(썸네일 없음)' },
    ms: Date.now() - t0,
  }
}

async function logRun(env: AutoEnv, cand: any, verdict: string, reasons: string[] | undefined,
                      metrics: any, slug: string | null, model: string, ms: number) {
  try {
    await env.DB.prepare(
      `INSERT INTO column_auto_runs (queue_id, query, verdict, reasons, metrics, slug, model, ms)
       VALUES (?,?,?,?,?,?,?,?)`)
      .bind(cand.id, cand.query, verdict, JSON.stringify(reasons || []),
            JSON.stringify(metrics || {}), slug, model, ms).run()
  } catch { /* 로그 실패가 발행을 막지는 않는다 */ }
}
