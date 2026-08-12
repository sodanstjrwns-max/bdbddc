/**
 * 컬럼 일어 자동번역 엔진 — v5.82 / 2026-08-12
 * ==============================================
 * 백필 번역기(scripts/i18n/translate-column.mjs)의 Worker 이식판.
 * 크론 발행 ④단계에서 호출되어 당일 국문 컬럼의 일어판을
 * R2 data/columns-jp.json 에 append 한다.
 *
 * 백필판과의 차이
 *   · node-html-parser 대신 태그/텍스트 분리 정규식 (Worker 번들 최소화)
 *     — 컬럼 본문은 <p>/<h3>/<ul> 수준의 단순 HTML 이라 충분하다.
 *   · LLM 호출은 column-auto 와 같은 스트리밍 SSE (125초 엣지 절벽 회피)
 *   · 잔재 QA 내장: 번역 후 한글이 남은 세그먼트만 모아 1회 재번역.
 *
 * ⚠️ 용어집(glossary-jp.json)은 백필 번역기와 반드시 같은 파일을 공유한다.
 *    (다른 용어집을 쓰면 86편 백필분과 신규분의 용어가 갈라진다)
 */
import glossary from '../scripts/i18n/glossary-jp.json'

export interface TranslateEnv {
  R2: R2Bucket
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  AUTO_MODEL?: string
}

const COLUMNS_KEY = 'data/columns.json'
const COLUMNS_JP_KEY = 'data/columns-jp.json'
const COLUMNS_JP_SLUGS_KEY = 'data/columns-jp-slugs.json'
const DEFAULT_BASE = 'https://www.genspark.ai/api/llm_proxy/v1'
const DEFAULT_MODEL = 'gpt-5'

const hasKorean = (s: string) => /[가-힣]/.test(s)

// ── 시스템 프롬프트 — 백필판(translate-column.mjs)과 동일 규칙 ──
function systemPrompt(): string {
  const g = glossary as any
  return `あなたは韓国の歯科医院「ソウルBD歯科」の院長コラム（患者向け医療解説記事）を日本語化する医療翻訳の専門家です。
韓国語の断片を自然で正確な日本語（です・ます調）に翻訳してください。読み物なので直訳調を避け、日本の患者が読んで自然な文体に。

絶対規則:
1. 数字・価格・電話番号・URL・英字は原文のまま。DOI（10.xxxx/…）は一字も変更禁止。
2. 論文の書誌引用 [著者名 et al., 年, 誌名, DOI: …] は著者名・誌名・年・DOIをそのまま保持。韓国語の助詞（등→ら 等）だけ日本語化。
3. 用語集を必ず適用: ${JSON.stringify({ ...g.brand, ...g.treatments, ...g.people, ...g.place })}
4. 固定価格(改変禁止): ${JSON.stringify(g.prices_fixed)}
5. ${(g.style_rules || []).join(' / ')}
6. 韓国の保険制度（급여/비급여/건강보험）は「韓国の健康保険適用/自由診療」と明示的に訳す（日本の保険と混同させない）。
7. 入力はHTMLテキスト断片。前後の空白・改行は維持。HTMLタグ・エンティティは変更しない。
8. 出力は必ずJSON: {"items":[{"i":<index>,"t":"<訳文>"}]} — 全indexを漏れなく返す。`
}

// ── LLM 호출 (스트리밍 SSE — column-auto.callLLM 과 동일 패턴) ──
async function callLLM(env: TranslateEnv, batch: string[]): Promise<string[]> {
  const base = (env.OPENAI_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '')
  const model = env.AUTO_MODEL || DEFAULT_MODEL
  const user = JSON.stringify({ items: batch.map((s, i) => ({ i, s })) })
  let lastErr: any = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY || ''}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt() }, { role: 'user', content: user }],
          response_format: { type: 'json_object' },
          stream: true,
        }),
      })
      if (!r.ok) throw new Error(`LLM ${r.status} ${(await r.text()).slice(0, 200)}`)
      if (!r.body) throw new Error('LLM 응답에 body 없음')
      const reader = r.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        let nl: number
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim()
          buf = buf.slice(nl + 1)
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (!payload || payload === '[DONE]') continue
          try {
            const j: any = JSON.parse(payload)
            const d = j?.choices?.[0]?.delta?.content
            if (typeof d === 'string') full += d
            const m = j?.choices?.[0]?.message?.content
            if (!d && typeof m === 'string') full += m
          } catch { /* keep-alive */ }
        }
      }
      const out = JSON.parse(full)
      const map = new Map<number, string>((out.items || []).map((x: any) => [Number(x.i), String(x.t)]))
      if (map.size !== batch.length) throw new Error(`incomplete: got ${map.size}/${batch.length}`)
      return batch.map((_, i) => map.get(i)!)
    } catch (e: any) {
      lastErr = e
      if (attempt < 3) await new Promise(x => setTimeout(x, 3000 * attempt))
    }
  }
  throw lastErr
}

// ── HTML 을 태그/텍스트로 쪼개 한국어 텍스트 노드만 뽑는다 ──
//   parts: 원본 순서 그대로의 조각 배열. 태그(<...>)는 그대로 두고
//   텍스트 조각 중 한글 포함분만 번역 대상 인덱스로 기록한다.
//   SCRIPT/STYLE 내부는 통째로 건너뛴다(컬럼 본문엔 원래 없지만 방어).
interface HtmlSeg { parts: string[]; textIdx: number[] }
function splitHtml(html: string): HtmlSeg {
  const parts = html.split(/(<[^>]*>)/)
  const textIdx: number[] = []
  let skipDepth = 0
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]
    if (p.startsWith('<')) {
      if (/^<(script|style)\b/i.test(p)) skipDepth++
      else if (/^<\/(script|style)\b/i.test(p)) skipDepth = Math.max(0, skipDepth - 1)
      continue
    }
    if (skipDepth === 0 && p && hasKorean(p)) textIdx.push(i)
  }
  return { parts, textIdx }
}

// title/alt 속성 안의 한국어 (컬럼 본문의 <img alt> 등)
function extractAttrs(parts: string[]): { partIdx: number; attr: string; value: string }[] {
  const found: { partIdx: number; attr: string; value: string }[] = []
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]
    if (!p.startsWith('<') || p.startsWith('</')) continue
    for (const attr of ['title', 'alt']) {
      const m = p.match(new RegExp(`${attr}="([^"]*)"`))
      if (m && hasKorean(m[1])) found.push({ partIdx: i, attr, value: m[1] })
    }
  }
  return found
}

export interface TranslateResult {
  ok: boolean
  slug?: string
  segments?: number
  batches?: number
  residualKo?: number
  error?: string
  skipped?: string
}

/** 국문 컬럼 1편 → 일어판 생성 → columns-jp.json append. */
export async function translateColumnToJa(env: TranslateEnv, slug?: string): Promise<TranslateResult> {
  const r2 = env.R2
  if (!r2) return { ok: false, error: 'R2 바인딩 없음' }
  if (!env.OPENAI_API_KEY) return { ok: false, error: 'OPENAI_API_KEY 미설정' }

  // ① 국문 원본 + 기존 일어판 로드
  const koObj = await r2.get(COLUMNS_KEY)
  if (!koObj) return { ok: false, error: 'columns.json 없음' }
  const koCols: any[] = await koObj.json()
  const jpObj = await r2.get(COLUMNS_JP_KEY)
  const jpCols: any[] = jpObj ? await jpObj.json() : []
  const jpSlugSet = new Set(jpCols.map((x: any) => x.slug))

  // ② 대상 선택: slug 지정 없으면 '일어판 없는 최신 발행분' (누락 백필 안전망)
  let col: any = null
  if (slug) {
    col = koCols.find((x: any) => x?.slug === slug && x?.status === 'published')
    if (!col) return { ok: false, error: `국문 발행분에 없는 slug: ${slug}` }
    // 이미 번역돼 있으면 스킵 (크론 재시도 중복 방어)
    if (jpSlugSet.has(slug)) return { ok: true, slug, skipped: 'already-translated' }
  } else {
    col = koCols
      .filter((x: any) => x?.status === 'published' && x?.slug && !jpSlugSet.has(x.slug))
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0]
    if (!col) return { ok: true, skipped: 'nothing-to-translate' }
  }

  // ③ 세그먼트 추출 (필드 + 본문 텍스트 + title/alt 속성)
  type Item = { kind: 'field' | 'text' | 'attr'; key?: string; partIdx?: number; attr?: string; text: string; out?: string }
  const items: Item[] = []
  for (const f of ['title', 'metaTitle', 'metaDescription', 'focusKeyword', 'topic', 'category']) {
    if (col[f] && hasKorean(String(col[f]))) items.push({ kind: 'field', key: f, text: String(col[f]) })
  }
  const seg = splitHtml(String(col.content || ''))
  for (const i of seg.textIdx) items.push({ kind: 'text', partIdx: i, text: seg.parts[i] })
  for (const a of extractAttrs(seg.parts)) items.push({ kind: 'attr', partIdx: a.partIdx, attr: a.attr, text: a.value })
  if (!items.length) return { ok: false, slug: col.slug, error: '번역할 한국어 세그먼트 없음' }

  // ④ 배치 번역 (40개/4500자 — 백필판과 동일. 순차 실행: Worker 는 병렬 이득이 적고 안정이 우선)
  const batches: Item[][] = []
  let cur: Item[] = []
  let budget = 0
  for (const it of items) {
    cur.push(it); budget += it.text.length
    if (cur.length >= 40 || budget >= 4500) { batches.push(cur); cur = []; budget = 0 }
  }
  if (cur.length) batches.push(cur)
  for (const b of batches) {
    const out = await callLLM(env, b.map(x => x.text))
    b.forEach((it, k) => { it.out = out[k] })
  }

  // ⑤ 잔재 QA: 한글이 남은 세그먼트만 모아 1회 재번역
  const residual = items.filter(it => it.out && hasKorean(it.out))
  if (residual.length) {
    try {
      const out = await callLLM(env, residual.map(x => x.out!))
      residual.forEach((it, k) => { if (!hasKorean(out[k])) it.out = out[k] })
    } catch { /* 재번역 실패는 치명적이지 않다 — 아래 residualKo 로 보고 */ }
  }
  const residualKo = items.filter(it => it.out && hasKorean(it.out)).length

  // ⑥ 재조립
  const fields: Record<string, string> = {}
  for (const it of items) {
    if (it.out == null) continue
    if (it.kind === 'field') fields[it.key!] = it.out
    else if (it.kind === 'text') seg.parts[it.partIdx!] = it.out
    else if (it.kind === 'attr') {
      const esc = it.out.replace(/"/g, '&quot;')
      seg.parts[it.partIdx!] = seg.parts[it.partIdx!].replace(
        new RegExp(`${it.attr}="[^"]*"`), `${it.attr}="${esc}"`)
    }
  }
  const jpEntry = {
    id: col.id,
    slug: col.slug,
    title: fields.title || col.title,
    metaTitle: fields.metaTitle || fields.title || col.metaTitle,
    metaDescription: fields.metaDescription || col.metaDescription,
    focusKeyword: fields.focusKeyword || col.focusKeyword || '',
    focusKeywordKo: col.focusKeyword || '',
    topic: fields.topic || col.topic || '',
    category: fields.category || col.category || '',
    categoryKo: col.category || '',
    content: seg.parts.join(''),
    doctorName: col.doctorName, // 국문 키 유지 (DOCTOR_SLUG_MAP 매핑용)
    status: col.status,
    createdAt: col.createdAt,
    publishedAt: col.publishedAt,
    updatedAt: col.updatedAt,
    thumbnailImage: col.thumbnailImage || '',
    bodyFigure: col.bodyFigure || '',
    lang: 'ja',
    translatedAt: new Date().toISOString(),
  }

  // ⑦ R2 커밋 — 경합 방어: put 직전에 다시 읽는다 (v5.58/v5.62 교훈)
  const freshObj = await r2.get(COLUMNS_JP_KEY)
  const fresh: any[] = freshObj ? await freshObj.json() : []
  const idx = fresh.findIndex((x: any) => x?.slug === col.slug)
  if (idx >= 0) fresh[idx] = jpEntry
  else fresh.unshift(jpEntry) // 최신이 앞 (createdAt 내림차순 유지)
  fresh.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  await r2.put(COLUMNS_JP_KEY, JSON.stringify(fresh), {
    httpMetadata: { contentType: 'application/json' },
  })
  // slug 목록도 갱신 (국문 상세 hreflang / sitemap 이 이 파일을 읽는다)
  await r2.put(COLUMNS_JP_SLUGS_KEY, JSON.stringify(fresh.map((x: any) => x.slug)), {
    httpMetadata: { contentType: 'application/json' },
  })

  return { ok: true, slug: col.slug, segments: items.length, batches: batches.length, residualKo }
}
