#!/usr/bin/env node
/**
 * 국문 HTML → 영어 HTML 1:1 변환 파이프라인 (2026-08-13, jp 파이프라인 기반)
 * 사용: node scripts/i18n/translate-page-en.mjs <src.html> <out.html> <enPath>
 *  - 텍스트 노드/메타/alt/JSON-LD만 추출해 배치 번역 → 원위치 재삽입 (구조 무손상)
 *  - 용어집(glossary-en.json) 강제 + 가격 고정
 *  - lang=en, canonical/og:url → /en 경로, hreflang(ko/en/+ja) 재작성
 *  - 내부 링크: en-sitemap.json에 있는 경로만 /en 접두사로 재작성
 */
import { parse } from 'node-html-parser'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

const [,, srcArg, outArg, enPathArg] = process.argv
if (!srcArg || !outArg || !enPathArg) {
  console.error('usage: translate-page-en.mjs <src.html> <out.html> </en/url-path>')
  process.exit(1)
}

const API_KEY = process.env.OPENAI_API_KEY
const BASE_URL = (process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1').replace(/\/+$/, '')
const MODEL = process.env.I18N_MODEL || 'gpt-5'
if (!API_KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1) }

const glossary = JSON.parse(fs.readFileSync(path.join(__dirname, 'glossary-en.json'), 'utf8'))
let enMap = new Set()
try {
  enMap = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'en-sitemap.json'), 'utf8')))
} catch {}
let jpMap = new Set()
try {
  jpMap = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'jp-sitemap.json'), 'utf8')))
} catch {}

const hasKorean = (s) => /[가-힣]/.test(s)
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA'])

// ---------- 1) 추출 ----------
const html = fs.readFileSync(srcArg, 'utf8')
const root = parse(html, { comment: true })

const items = []   // { kind:'text'|'attr'|'ld', ref, attr?, text }
function walk(node) {
  if (node.nodeType === 3) { // text
    const t = node.rawText
    if (t && hasKorean(t)) items.push({ kind: 'text', ref: node, text: t })
    return
  }
  if (node.nodeType !== 1) return
  const tag = node.rawTagName ? node.rawTagName.toUpperCase() : ''
  if (SKIP_TAGS.has(tag)) return
  for (const a of ['title', 'alt', 'placeholder', 'aria-label', 'data-tooltip']) {
    const v = node.getAttribute(a)
    if (v && hasKorean(v)) items.push({ kind: 'attr', ref: node, attr: a, text: v })
  }
  if (tag === 'META') {
    const name = (node.getAttribute('name') || node.getAttribute('property') || '').toLowerCase()
    if (/description|keywords|og:title|og:description|og:site_name|og:image:alt|twitter:title|twitter:description|twitter:image:alt|abstract|ai-summary|subject|author|geo\.placename|application-name|apple-mobile-web-app-title/.test(name)) {
      const v = node.getAttribute('content')
      if (v && hasKorean(v)) items.push({ kind: 'attr', ref: node, attr: 'content', text: v })
    }
  }
  for (const c of node.childNodes) walk(c)
}
walk(root)

// JSON-LD: 화이트리스트 키의 한글 문자열만
const LD_KEYS = new Set(['name', 'alternateName', 'description', 'text', 'headline', 'caption', 'jobTitle', 'answerText', 'title', 'itemListElement_name'])
const ldScripts = root.querySelectorAll('script[type="application/ld+json"]')
const ldDocs = []
for (const s of ldScripts) {
  try {
    const doc = JSON.parse(s.text)
    const slots = []
    ;(function walkLd(o) {
      if (Array.isArray(o)) return o.forEach(walkLd)
      if (o && typeof o === 'object') {
        for (const k of Object.keys(o)) {
          if (typeof o[k] === 'string' && hasKorean(o[k]) && LD_KEYS.has(k)) {
            slots.push({ obj: o, key: k })
            items.push({ kind: 'ld', ref: slots[slots.length - 1], text: o[k] })
          } else walkLd(o[k])
        }
      }
    })(doc)
    ldDocs.push({ node: s, doc })
  } catch {}
}

console.log(`[extract] ${items.length} korean segments from ${srcArg}`)

// ---------- 2) 배치 번역 ----------
const SYSTEM = `You are a professional medical translator localizing the official website of "Seoul BD Dental", a dental clinic in Cheonan, South Korea, into natural American English for international patients (including US military families near Camp Humphreys).

Absolute rules:
1. Keep all numbers, prices, phone numbers, URLs and brand names exactly as in the source. Convert 원/만원 prices per the fixed price list below.
2. Always apply this glossary: ${JSON.stringify({ ...glossary.brand, ...glossary.treatments, ...glossary.people, ...glossary.place })}
3. Fixed prices (never alter): ${JSON.stringify(glossary.prices_fixed)}
4. ${glossary.style_rules.join(' / ')}
5. Input items are HTML text fragments. Preserve leading/trailing whitespace and line breaks exactly. Never change HTML tags or entities (&amp; etc.).
6. Even if a fragment is part of a sentence, choose a natural translation using the context of the whole list.
7. Output MUST be JSON: {"items":[{"i":<index>,"t":"<translation>"}]} — return every index without omission.`

async function callLLM(batch) {
  const user = JSON.stringify({ items: batch.map((b, i) => ({ i, s: b.text })) })
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
          response_format: { type: 'json_object' },
          stream: true,
        }),
      })
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 8000 + Math.random() * 7000))
        throw new Error('HTTP 429 (rate limited)')
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      let full = ''
      const reader = res.body.getReader()
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
      if (attempt === 6) throw e
      await new Promise(r => setTimeout(r, 4000 * attempt))
    }
  }
}

// 배치: 문자 예산 4500자 or 40개
const batches = []
let cur = [], budget = 0
for (const it of items) {
  cur.push(it); budget += it.text.length
  if (cur.length >= 40 || budget >= 4500) { batches.push(cur); cur = []; budget = 0 }
}
if (cur.length) batches.push(cur)
console.log(`[batch] ${batches.length} batches`)

const CONCURRENCY = parseInt(process.env.I18N_CONC || '4', 10)
let done = 0
async function runBatch(b) {
  const out = await callLLM(b)
  b.forEach((it, i) => { it.translated = out[i] })
  done++
  console.log(`  [${done}/${batches.length}] ok (${b.length} items)`)
}
for (let i = 0; i < batches.length; i += CONCURRENCY) {
  await Promise.all(batches.slice(i, i + CONCURRENCY).map(runBatch))
}

// ---------- 3) 재삽입 ----------
for (const it of items) {
  if (it.translated == null) continue
  if (it.kind === 'text') it.ref.rawText = it.translated
  else if (it.kind === 'attr') it.ref.setAttribute(it.attr, it.translated.replace(/"/g, '&quot;'))
  else if (it.kind === 'ld') it.ref.obj[it.ref.key] = it.translated
}
for (const { node, doc } of ldDocs) node.set_content(JSON.stringify(doc))

// ---------- 4) 메타/링크 재작성 ----------
const htmlEl = root.querySelector('html')
if (htmlEl) htmlEl.setAttribute('lang', 'en')

const koPath = enPathArg.replace(/^\/en/, '') || '/'
const ORIGIN = 'https://bdbddc.com'

for (const l of root.querySelectorAll('link[rel="canonical"]')) l.setAttribute('href', ORIGIN + enPathArg)
for (const m of root.querySelectorAll('meta[property="og:url"]')) m.setAttribute('content', ORIGIN + enPathArg)
for (const m of root.querySelectorAll('meta[property="og:locale"]')) m.setAttribute('content', 'en_US')

// 기존 hreflang 제거 후 ko/en(/ja) 재삽입
for (const l of root.querySelectorAll('link[rel="alternate"][hreflang]')) l.remove()
const head = root.querySelector('head')
if (head) {
  const koClean = koPath === '/' ? '/' : koPath.replace(/\/$/, '')
  const jaTag = jpMap.has(koClean) ? `\n<link rel="alternate" hreflang="ja" href="${ORIGIN}/jp${koClean === '/' ? '/' : koClean}">` : ''
  head.insertAdjacentHTML('beforeend',
    `\n<link rel="alternate" hreflang="ko" href="${ORIGIN}${koPath}">` +
    `\n<link rel="alternate" hreflang="en" href="${ORIGIN}${enPathArg}">` +
    jaTag +
    `\n<link rel="alternate" hreflang="x-default" href="${ORIGIN}${koPath}">\n`)
}

// 상대경로 → 절대경로 변환
const koDir = koPath.endsWith('/') ? koPath : koPath.replace(/\/[^/]*$/, '/')
function toAbs(ref) {
  if (!ref || /^(https?:|\/\/|\/|#|mailto:|tel:|javascript:|data:)/.test(ref)) return null
  const u = new URL(ref, 'https://x.invalid' + koDir)
  return u.pathname + u.search + u.hash
}
let absFixed = 0
for (const el of root.querySelectorAll('[href],[src],[data-src],[srcset],[poster],[content]')) {
  for (const attr of ['href', 'src', 'data-src', 'poster']) {
    const v = el.getAttribute(attr)
    const abs = toAbs(v)
    if (abs) { el.setAttribute(attr, abs); absFixed++ }
  }
  const ss = el.getAttribute('srcset')
  if (ss && !/^(https?:|\/)/.test(ss.trim())) {
    el.setAttribute('srcset', ss.split(',').map(p => {
      const [u, d] = p.trim().split(/\s+/)
      return (toAbs(u) || u) + (d ? ' ' + d : '')
    }).join(', '))
    absFixed++
  }
}
console.log(`[abs] relative→absolute fixed=${absFixed}`)

// 내부 링크: en-sitemap에 있는 경로만 /en 재작성
let rewritten = 0, kept = 0
for (const a of root.querySelectorAll('a[href]')) {
  const href = a.getAttribute('href')
  if (!href || !href.startsWith('/') || href.startsWith('//') || href.startsWith('/en') || href.startsWith('/jp')) continue
  const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/'
  if (enMap.has(clean)) {
    a.setAttribute('href', '/en' + (clean === '/' ? '/' : clean) + (href.includes('#') ? '#' + href.split('#')[1] : ''))
    rewritten++
  } else kept++
}
console.log(`[links] rewritten=${rewritten} kept-korean=${kept}`)

// JSON-LD url/inLanguage 갱신
for (const { node, doc } of ldDocs) {
  ;(function fix(o) {
    if (Array.isArray(o)) return o.forEach(fix)
    if (o && typeof o === 'object') {
      if (typeof o.url === 'string' && o.url === ORIGIN + koPath) o.url = ORIGIN + enPathArg
      if ('inLanguage' in o) o.inLanguage = 'en'
      Object.values(o).forEach(fix)
    }
  })(doc)
  node.set_content(JSON.stringify(doc))
}

fs.mkdirSync(path.dirname(outArg), { recursive: true })
fs.writeFileSync(outArg, root.toString())
console.log(`[done] ${outArg} (${Math.round(fs.statSync(outArg).size / 1024)}KB)`)
