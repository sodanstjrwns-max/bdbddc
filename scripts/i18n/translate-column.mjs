#!/usr/bin/env node
/**
 * 컬럼 1편 일어 번역: API에서 상세 fetch → 제목/메타/본문HTML 번역 → JSON 출력 (2026-08-12)
 * 사용: node scripts/i18n/translate-column.mjs <slug>
 * 출력: scripts/i18n/jp-columns/<slug>.json
 *  - content는 R2 원문 HTML(인용승격 전) 기준 — DOI 서지 인용은 보존, 한글 조사만 일어화
 *  - slug/날짜/이미지/의사명(국문 키)은 그대로 유지 → Worker에서 국문과 동일 파이프라인 재사용
 */
import { parse } from 'node-html-parser'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'jp-columns')

const slug = process.argv[2]
if (!slug) { console.error('usage: translate-column.mjs <slug>'); process.exit(1) }

const API_KEY = process.env.OPENAI_API_KEY
const BASE_URL = (process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1').replace(/\/+$/, '')
const MODEL = process.env.I18N_MODEL || 'gpt-5'
if (!API_KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1) }

const glossary = JSON.parse(fs.readFileSync(path.join(__dirname, 'glossary-jp.json'), 'utf8'))
const hasKorean = (s) => /[가-힣]/.test(s)

// ---------- 0) 원문 fetch ----------
const res = await fetch(`https://bdbddc.com/api/columns/${encodeURIComponent(slug)}`)
if (!res.ok) { console.error(`fetch failed: ${res.status}`); process.exit(1) }
const col = await res.json()
if (!col || !col.content) { console.error('empty column'); process.exit(1) }

// ---------- 1) 추출 ----------
const items = [] // { kind:'field'|'text'|'attr', key?, ref?, attr?, text }
for (const f of ['title', 'metaTitle', 'metaDescription', 'focusKeyword', 'topic', 'category']) {
  if (col[f] && hasKorean(String(col[f]))) items.push({ kind: 'field', key: f, text: String(col[f]) })
}
const root = parse(String(col.content), { comment: true })
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE'])
function walk(node) {
  if (node.nodeType === 3) {
    const t = node.rawText
    if (t && hasKorean(t)) items.push({ kind: 'text', ref: node, text: t })
    return
  }
  if (node.nodeType !== 1) return
  const tag = node.rawTagName ? node.rawTagName.toUpperCase() : ''
  if (SKIP_TAGS.has(tag)) return
  for (const a of ['title', 'alt']) {
    const v = node.getAttribute(a)
    if (v && hasKorean(v)) items.push({ kind: 'attr', ref: node, attr: a, text: v })
  }
  for (const c of node.childNodes) walk(c)
}
walk(root)
console.log(`[extract] ${slug}: ${items.length} segments`)

// ---------- 2) 번역 ----------
const SYSTEM = `あなたは韓国の歯科医院「ソウルBD歯科」の院長コラム（患者向け医療解説記事）を日本語化する医療翻訳の専門家です。
韓国語の断片を自然で正確な日本語（です・ます調）に翻訳してください。読み物なので直訳調を避け、日本の患者が読んで自然な文体に。

絶対規則:
1. 数字・価格・電話番号・URL・英字は原文のまま。DOI（10.xxxx/…）は一字も変更禁止。
2. 論文の書誌引用 [著者名 et al., 年, 誌名, DOI: …] は著者名・誌名・年・DOIをそのまま保持。韓国語の助詞（등→ら 等）だけ日本語化。
3. 用語集を必ず適用: ${JSON.stringify({ ...glossary.brand, ...glossary.treatments, ...glossary.people, ...glossary.place })}
4. 固定価格(改変禁止): ${JSON.stringify(glossary.prices_fixed)}
5. ${glossary.style_rules.join(' / ')}
6. 韓国の保険制度（급여/비급여/건강보험）は「韓国の健康保険適用/自由診療」と明示的に訳す（日本の保険と混同させない）。
7. 入力はHTMLテキスト断片。前後の空白・改行は維持。HTMLタグ・エンティティは変更しない。
8. 出力は必ずJSON: {"items":[{"i":<index>,"t":"<訳文>"}]} — 全indexを漏れなく返す。`

async function callLLM(batch) {
  const user = JSON.stringify({ items: batch.map((b, i) => ({ i, s: b.text })) })
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
          response_format: { type: 'json_object' },
          stream: true,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`)
      let full = ''
      const reader = r.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop()
        for (const line of lines) {
          const m = line.match(/^data:\s*(.+)$/)
          if (!m || m[1] === '[DONE]') continue
          try { full += JSON.parse(m[1]).choices?.[0]?.delta?.content || '' } catch {}
        }
      }
      const out = JSON.parse(full)
      const map = new Map(out.items.map(x => [x.i, x.t]))
      if (map.size !== batch.length) throw new Error(`incomplete: got ${map.size}/${batch.length}`)
      return batch.map((_, i) => map.get(i))
    } catch (e) {
      console.error(`  [retry ${attempt}] ${e.message}`)
      if (attempt === 3) throw e
      await new Promise(x => setTimeout(x, 3000 * attempt))
    }
  }
}

const batches = []
let cur = [], budget = 0
for (const it of items) {
  cur.push(it); budget += it.text.length
  if (cur.length >= 40 || budget >= 4500) { batches.push(cur); cur = []; budget = 0 }
}
if (cur.length) batches.push(cur)

let done = 0
for (let i = 0; i < batches.length; i += 3) {
  await Promise.all(batches.slice(i, i + 3).map(async (b) => {
    const out = await callLLM(b)
    b.forEach((it, k) => { it.translated = out[k] })
    done++
    console.log(`  [${done}/${batches.length}] ok`)
  }))
}

// ---------- 3) 재삽입 ----------
const fields = {}
for (const it of items) {
  if (it.translated == null) continue
  if (it.kind === 'field') fields[it.key] = it.translated
  else if (it.kind === 'text') it.ref.rawText = it.translated
  else if (it.kind === 'attr') it.ref.setAttribute(it.attr, it.translated.replace(/"/g, '&quot;'))
}

const out = {
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
  content: root.toString(),
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

fs.mkdirSync(OUT_DIR, { recursive: true })
const outPath = path.join(OUT_DIR, `${slug}.json`)
fs.writeFileSync(outPath, JSON.stringify(out, null, 1))
console.log(`[done] ${outPath} (content ${out.content.length} chars)`)
