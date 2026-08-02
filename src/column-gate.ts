/**
 * 컬럼 자동발행 품질 게이트 — Cloudflare Worker 판(scripts/column-gate.py 의 TS 포팅)
 * =================================================================================
 * v5.50 / 2026-08-01
 *
 * 이 파일은 "자동발행을 허용하되 품질은 유지한다"는 조건을 기계적으로 집행하는 장치다.
 * 통과하지 못한 초안은 발행되지 않는다. 사람의 승인 대신 이 게이트가 문을 지킨다.
 *
 * 문턱은 기존 74개 컬럼의 실측 분포에서 역산했다 (p10 = 하위 10%도 통과하는 선).
 *   본문 글자수  min 1071 / p10 3465 / 중위 4343 / p90 5158 / max 6015
 *   H3 중위 7 · 표 중위 1 · 목록 중위 12 · DOI 중위 2
 *   DOI 실재율 93/94 = 98.9%
 *
 * ⚠️ 단순 금칙어 매칭은 쓰지 않는다. '영구/100%/최고/1위/유일한'을 단어로 막으면
 *    기존 우수 컬럼이 100% 탈락한다. 실측된 정당 용례:
 *      "영구적 마비 위험 1%"(위험 고지) / "생존율 81.8~100%"(통계)
 *      "100% 회복은 아니지만"(효과 부정) / "통증 최고조"(경과)
 *      "입냄새 원인 1위는 혀백태" / "조기 발견하는 유일한 방법은 정기 점검"
 *    → 금칙은 '주체 + 효과보장'이 결합된 패턴 + 부정문맥 인식으로만 판정한다.
 *
 * 파이썬 원본과의 회귀 동등성은 scripts/gate-parity.mjs 로 검증한다(기존 74건 탈락 10건).
 */

export interface ColumnDraft {
  slug?: string
  title?: string
  metaTitle?: string
  metaDescription?: string
  content?: string
  category?: string
  author?: string
  [k: string]: any
}

export interface GateResult {
  pass: boolean
  blocks: string[]
  warns: string[]
  metrics: Record<string, number | string>
}

/* ── 문턱 ───────────────────────────────────────────── */
const MIN_LEN = 2800, MAX_LEN = 7000
const MIN_H3 = 5, MIN_TABLE = 1, MIN_LI = 6, MIN_DOI = 1
const MAX_REPEAT_RATIO = 0.06
const MIN_MARK = 3, MAX_MARK = 12          // v5.51 형광펜(<mark>) — layout 모드에서만 적용
const MIN_TITLE = 10, MAX_TITLE = 60
const MIN_DESC = 60, MAX_DESC = 160
const MAX_CORPUS_OVERLAP = 0.28

/* 부정/반박 문맥 — 붙어 있으면 위반이 아니라 '주장을 부정하는 서술'이다. */
const NEGATION = new RegExp(
  '아닙니다|아니고|아니라|않습니다|않으셔도|않아도|않으실|느끼지 않|근거가 부족|표현이 아니|' +
  '보장(?:할|되지)\\s*(?:수\\s*)?없|불가능|장담할 수 없|케이스마다|편차|' +
  '권하는 경우가 많|권합니다|권장|목적입니다|것이 목표')
const CLINICAL_OK = /자연치|본인 치아|내 치아|유지장치|리테이너|금연|치아를/

/* 의료법 §56 — 문맥 결합형 패턴 */
const LAW_PATTERNS: [RegExp, string][] = [
  [/(영구(?:적)?(?:으로)?|평생)\s*(?:유지|보장|지속|사용|씁니|쓸 수)/g, '효과 영구 보장'],
  [/100\s*%\s*(?:성공|완치|보장|안전|만족)/g, '100% 보장'],
  [/(?:부작용|합병증)\s*(?:이|은|가)?\s*(?:전혀\s*)?없습니다/g, '부작용 없음 단정'],
  [/(?:절대|무조건)\s*(?:안전|성공|괜찮)/g, '절대 안전'],
  [/(?:지역|천안|충남|국내)\s*(?:최고|최상|1위|넘버원|no\.?\s*1)/g, '최상급 표현'],
  [/(?:저희|본원|우리 병원)(?:가|는|이)?\s*(?:유일|최초|최고|1위)/g, '자기 최상급'],
  [/(?:완치|완전히 낫|재발 없)/g, '완치 단정'],
  [/(?:환자|고객)\s*(?:분)?(?:께서|이|가)\s*(?:후기|경험담|간증)/g, '치료경험담 광고'],
  [/(?:연예인|셀럽|아이돌|배우)\s*(?:도|이|가)?\s*(?:내원|시술|선택)/g, '연예인 유인'],
  [/(?:이벤트|할인|무료)\s*(?:진료|시술|임플란트)/g, '가격 유인'],
]

/* 프롬프트 지시문 누출 — v5.49에서 367건 세탁한 계열의 재발 감시.
   ⚠️ 광역 패턴 금지: 'r여기서 …드리겠습니다\.' 는 「걱정 하나는 덜어드리겠습니다」 19건 오탐. */
const LEAK_PATTERNS: RegExp[] = [
  /먼저 이 글에서 [^.]{0,20}가져가셨으면/,
  /가져가셨으면 하는 것[은을]/,
  /인용 가능한 한 줄/,
  /통념 하나를 부드럽게/,
  /데이터로 답을 드리겠습니다\./,
  /한 달에 (?:세|네|다섯|여섯|일곱) 분 넘게/,
  /환자분 통념 하나/,
  /여기서 한 가지 안심시켜 드리고 싶습니다\./,
  /(?:다음|아래)(?:과|와) 같은 (?:형식|구조)로/,
  /\[(?:여기에|삽입|TODO|TBD)/,
  /(?:as an AI|I cannot|죄송하지만 저는)/i,
]

const ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
}

/** 태그 제거 + 엔티티 복원 (파이썬 text() 와 동일 동작) */
export function stripTags(s: string): string {
  const noScript = (s || '').replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  const noTags = noScript.replace(/<[^>]*>/g, ' ')
  return noTags.replace(/\s+/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, m => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .trim()
}

export function extractDois(body: string): string[] {
  const found = (body || '').match(/10\.\d{4,9}\/[^\s"<>)\]]+/g) || []
  return [...new Set(found.map(d => d.replace(/[.,;]+$/, '')))].sort()
}

/**
 * DOI 실재 검증 — 할루시네이션 차단의 핵심.
 * doi.org 가 301/302/200 을 주면 실재, 404 면 존재하지 않는 논문이다.
 * (2026-08-01 실측: 기존 컬럼 94개 DOI 중 1개가 404 → 교체함)
 */
export async function verifyDois(dois: string[], timeoutMs = 12000): Promise<[string, string][]> {
  const dead: [string, string][] = []
  await Promise.all(dois.map(async d => {
    try {
      const ctl = new AbortController()
      const t = setTimeout(() => ctl.abort(), timeoutMs)
      const r = await fetch(`https://doi.org/${d}`, {
        method: 'HEAD', redirect: 'manual', signal: ctl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bdbddc-quality-gate/1.0)' },
      })
      clearTimeout(t)
      if (![301, 302, 303, 307, 308, 200].includes(r.status)) dead.push([d, String(r.status)])
    } catch (e: any) {
      dead.push([d, `ERR ${e?.name || e}`])
    }
  }))
  return dead
}

function grams12(s: string): Set<string> {
  const s2 = s.toLowerCase().replace(/[^가-힣0-9a-z]/g, '')
  const out = new Set<string>()
  for (let i = 0; i + 12 <= s2.length; i += 4) out.add(s2.slice(i, i + 12))
  return out
}

/**
 * 게이트 본체. online=false 면 DOI 네트워크 검증을 생략한다(개수만 확인).
 * corpus 를 주면 기존 컬럼과의 12-gram 중복 및 slug 충돌을 검사한다.
 */
export async function gateColumn(
  col: ColumnDraft,
  opts: { online?: boolean; corpus?: ColumnDraft[]; layout?: boolean } = {},
): Promise<GateResult> {
  const online = opts.online !== false
  const corpus = opts.corpus
  // v5.51 레이아웃 규격 검사. 기존 74편은 이 규격 이전에 쓰였으므로 기본은 꺼 둔다.
  // 자동발행 초안(runAutoPublish)만 layout:true 로 호출해 새 규격을 강제한다.
  const layout = opts.layout === true
  const B: string[] = [], W: string[] = []
  const body = col.content || ''
  const x = stripTags(body)
  const title = (col.title || '').trim()
  const mt = (col.metaTitle || '').trim()
  const desc = (col.metaDescription || '').trim()

  // ① 구조
  if (!(x.length >= MIN_LEN && x.length <= MAX_LEN)) B.push(`본문 ${x.length}자 (허용 ${MIN_LEN}~${MAX_LEN})`)
  const h3 = (body.match(/<h3/g) || []).length
  if (h3 < MIN_H3) B.push(`H3 ${h3}개 (최소 ${MIN_H3})`)
  if ((body.match(/<h1/g) || []).length) B.push('본문에 h1 존재 (h1은 렌더러가 생성)')
  const tb = (body.match(/<table/g) || []).length
  if (tb < MIN_TABLE) B.push(`표 ${tb}개 (최소 ${MIN_TABLE})`)
  const li = (body.match(/<li/g) || []).length
  if (li < MIN_LI) B.push(`목록항목 ${li}개 (최소 ${MIN_LI})`)

  // ①-b v5.51 레이아웃 규격 (자동발행 전용)
  const marks = (body.match(/<mark[\s>]/g) || []).length
  const callouts = (body.match(/class="callout/g) || []).length
  const h2 = (body.match(/<h2/g) || []).length
  if (layout) {
    if (marks < MIN_MARK) B.push(`형광펜 ${marks}개 (최소 ${MIN_MARK})`)
    if (marks > MAX_MARK) B.push(`형광펜 ${marks}개 (최대 ${MAX_MARK} — 과다 강조)`)
    if (h2 < 1) B.push('h2 도입 제목 없음')
    if (callouts < 1) W.push('강조 박스(callout) 없음')
    if (callouts < 2) W.push('callout 1개 — 요약/한계 박스 2개 권장')
    if (!/<thead/.test(body) && tb) W.push('표에 thead 없음')
  }

  // ② 근거 — DOI 실재 검증
  const dois = extractDois(body)
  if (dois.length < MIN_DOI) B.push(`DOI ${dois.length}개 (최소 ${MIN_DOI})`)
  if (online && dois.length) {
    for (const [d, code] of await verifyDois(dois)) B.push(`DOI 미실재 ${d} → HTTP ${code}`)
  }

  // ③ 의료법 §56 (부정문맥 인식)
  for (const [pat, label] of LAW_PATTERNS) {
    pat.lastIndex = 0
    for (const m of x.matchAll(pat)) {
      const st = m.index ?? 0, en = st + m[0].length
      const before = x.slice(Math.max(0, st - 45), st)
      const after = x.slice(en, en + 45)
      if (NEGATION.test(after) || NEGATION.test(before)) continue
      if (CLINICAL_OK.test(before)) continue
      B.push(`의료법 위험(${label}): …${x.slice(Math.max(0, st - 25), en + 25)}…`)
      break
    }
  }

  // ④ 프롬프트 누출
  for (const pat of LEAK_PATTERNS) {
    const m = x.match(pat)
    if (m) B.push(`프롬프트 누출: 「${m[0].slice(0, 40)}」`)
  }

  // ⑤ 이스케이프 안전성 (v5.49 JSON-LD 파싱 실패 6건의 재발 방지)
  for (const [fld, v] of [['title', title], ['metaTitle', mt]] as [string, string][]) {
    if (v.includes('"')) W.push(`${fld} 에 큰따옴표 — 렌더러는 이스케이프됨, 「」 권장: ${v.slice(0, 40)}`)
  }
  if (desc.includes('"')) B.push(`metaDescription 에 원따옴표 → 속성/JSON-LD 조기종료 위험: ${desc.slice(0, 40)}`)
  if (/<\/?(script|iframe|object|embed)\b/i.test(body)) B.push('본문에 script/iframe 태그')

  // ⑥ 메타
  if (!(title.length >= MIN_TITLE && title.length <= MAX_TITLE)) B.push(`title ${title.length}자`)
  if (mt && mt.length > 34) W.push(`metaTitle ${mt.length}자 — SERP 32자 절단 (CJK)`)
  if (!(desc.length >= MIN_DESC && desc.length <= MAX_DESC)) B.push(`metaDescription ${desc.length}자 (허용 ${MIN_DESC}~${MAX_DESC})`)
  if (!/^[a-z0-9-]{8,90}$/.test(col.slug || '')) B.push(`slug 형식 위반: ${col.slug}`)

  // ⑦ 내부 문장 반복
  const sents = x.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 18)
  if (sents.length) {
    const cnt = new Map<string, number>()
    for (const s of sents) cnt.set(s, (cnt.get(s) || 0) + 1)
    let top = '', n = 0
    for (const [s, c] of cnt) if (c > n) { top = s; n = c }
    if (n > 1 && n / sents.length > MAX_REPEAT_RATIO) B.push(`동일 문장 ${n}회 반복: 「${top.slice(0, 40)}」`)
  }

  // ⑧ 기존 코퍼스 중복 (표절/자기복제)
  if (corpus && corpus.length) {
    const mine = grams12(x)
    for (const other of corpus) {
      if (other.slug === col.slug) continue
      const og = grams12(stripTags(other.content || ''))
      if (!og.size || !mine.size) continue
      let inter = 0
      for (const g of mine) if (og.has(g)) inter++
      const ov = inter / mine.size
      if (ov > MAX_CORPUS_OVERLAP) {
        B.push(`기존 컬럼과 ${Math.round(ov * 100)}% 중복: ${other.slug}`)
        break
      }
    }
    if (corpus.some(o => o.slug === col.slug)) B.push(`slug 중복: ${col.slug}`)
  }

  return {
    pass: B.length === 0,
    blocks: B,
    warns: W,
    metrics: {
      chars: x.length, h2, h3, tables: tb, listItems: li, marks, callouts, dois: dois.length,
      titleLen: title.length, descLen: desc.length, slug: col.slug || '',
    },
  }
}
