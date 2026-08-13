#!/usr/bin/env node
/**
 * EN 잔여 표시 텍스트 최종 소탕: en/ 전체에서 남은 한글 표시 텍스트를 수집→LLM 일괄 번역→전역 치환
 * final-sweep.mjs(jp판) 복제. 기능성(srcdoc, data-*, href, src, action, value)은 건드리지 않음.
 * usage: OPENAI_API_KEY=... OPENAI_BASE_URL=... node scripts/i18n/final-sweep-en.mjs [--scan]
 *   --scan : 수집만 하고 번역/치환 없이 목록 출력
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const SCAN_ONLY = process.argv.includes('--scan')
const API_KEY = process.env.OPENAI_API_KEY
const BASE_URL = (process.env.OPENAI_BASE_URL || '').replace(/\/+$/, '')
const glossary = JSON.parse(fs.readFileSync(path.join(__dirname, 'glossary-en.json'), 'utf8'))

const files = execSync(`cd ${ROOT} && find en -name '*.html' | sort`, { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean).map(f => path.join(ROOT, f))
console.log(`[sweep-en] ${files.length} files`)

// 텍스트 노드/title·alt·placeholder·aria-label·content 속성에서만 잔여 한글 수집
const segs = new Map() // segment -> Set(files)
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8')
  let body = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '')
  body = body.replace(/srcdoc="[^"]*"/g, '').replace(/data-[a-z-]+="[^"]*"/g, '')
    .replace(/(href|src|action|value)="[^"]*"/g, '')
  const found = []
  for (const m of body.matchAll(/>([^<>]*[가-힣][^<>]*)</g)) found.push(m[1])
  for (const m of body.matchAll(/(?:title|alt|placeholder|aria-label|content)="([^"]*[가-힣][^"]*)"/g)) found.push(m[1])
  for (let t of found) {
    t = t.trim()
    if (!t || t.length > 300) continue
    if (/서울비디치과의원|사업자/.test(t)) continue // 법인명·사업자 정보는 원문 유지
    if (/^[월화수목금토일]$/.test(t)) continue // 요일 기능값
    if (t === '한국어' || t === '日本語' || /^🇰🇷\s*한국어$/.test(t) || /^🇯🇵\s*日本語$/.test(t)) continue // 언어 스위처 라벨은 해당 언어 표기 유지
    if (/^["“]?충?남|^충청남도/.test(t) && /불당34길/.test(t)) continue // 한국 주소 원문 유지 (내비 검색용)
    if (/만남로 38/.test(t)) continue // 동남구점 주소 원문 유지
    if (/@서울비디치과|'서울비디치과' on Naver/.test(t)) continue // 카카오 ID·네이버 검색어는 한글 유지
    if (/^\(navigate to|불당주공5단지.*1[- ]min|Stop "불당주공5단지"/.test(t)) continue // 주소 안내 혼용문 유지
    if (!segs.has(t)) segs.set(t, new Set())
    segs.get(t).add(f)
  }
}
const list = [...segs.keys()]
console.log(`[sweep-en] ${list.length} unique segments`)
if (SCAN_ONLY) {
  for (const t of list.slice(0, 200)) console.log(' -', JSON.stringify(t.slice(0, 90)), `(${segs.get(t).size} files)`)
  process.exit(0)
}
if (!list.length) process.exit(0)

const SYSTEM = `English localization of a Korean dental clinic website (Seoul BD Dental, targeting US military families near Camp Humphreys).
Translate the following Korean (or mixed Korean-English) fragments into natural American English.
Rules: apply glossary ${JSON.stringify({ ...glossary.brand, ...glossary.treatments })} / Korean street addresses stay in original Korean / already-English parts unchanged / concise marketing-friendly tone.
Fixed terms: 오스템=Osstem, 스트라우만=Straumann, 클리피씨=Clippy-C, 클라리티울트라=Clarity Ultra, 덴탈론=Dentalon, 워터픽=Waterpik, 치BTI=ChiBTI, 치석 플라이트=Tartar Flight, 투쓰런=Tooth Run, 현정민=Dr. Jeongmin Hyun, 박수빈=Dr. Subin Park, 조설아=Dr. Seola Jo, 네이버=Naver, 구글=Google, 유튜브=YouTube, 카카오톡=KakaoTalk, 의학채널 비온뒤=the medical YouTube channel 'Bionduii', GC 톳스=GC Tooth Mousse.
Prices/numbers: convert 만원 amounts to full KRW digits plus USD at 10,000 KRW ≈ $7.3 — e.g. 100만원 → 1,000,000 KRW (approx. $730); 1.5~2만원 → 15,000–20,000 KRW (approx. $11–$15); 1500~3000만원 → 15–30 million KRW (approx. $10,950–$21,900). Drop redundant Korean parentheticals like (2026년 6월) when the English date is already present. 20시 → 8 PM; 44만 → 440,000; 3만 → 30,000; 100억 원 → 10 billion KRW; 제29594호 → No. 29594; N년 → N years; N건 → N cases. If a fragment mixes English and leftover Korean, keep the English and translate only the Korean remnants. Never leave any Hangul in the output unless it is a street address.
Output JSON: {"items":[{"i":<index>,"t":"<translation>"}]} All indexes required.`

async function translate(batch) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-5',
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: JSON.stringify({ items: batch.map((s, i) => ({ i, s })) }) }],
      response_format: { type: 'json_object' }, stream: true,
    }),
  })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  let full = '', buf = ''
  const reader = res.body.getReader(), dec = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n'); buf = lines.pop()
    for (const line of lines) {
      const m = line.match(/^data:\s*(.+)$/)
      if (m && m[1] !== '[DONE]') { try { full += JSON.parse(m[1]).choices?.[0]?.delta?.content || '' } catch {} }
    }
  }
  const out = JSON.parse(full)
  return new Map(out.items.map(x => [batch[x.i], x.t]))
}

const mapping = new Map()
for (let i = 0; i < list.length; i += 35) {
  const batch = list.slice(i, i + 35)
  for (let a = 1; a <= 5; a++) {
    try { const m = await translate(batch); m.forEach((v, k) => mapping.set(k, v)); break }
    catch (e) {
      console.error('retry', a, e.message)
      if (a === 5) throw e
      const wait = /429/.test(e.message) ? 8000 + Math.random() * 7000 : 3000
      await new Promise(r => setTimeout(r, wait))
    }
  }
  console.log(`  translated ${Math.min(i + 35, list.length)}/${list.length}`)
}

let replaced = 0
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8'); const o = h
  for (const [ko, en] of mapping) {
    if (!en || en === ko) continue
    h = h.split('>' + ko + '<').join('>' + en + '<')
    for (const attr of ['title', 'alt', 'placeholder', 'aria-label', 'content']) {
      h = h.split(`${attr}="${ko}"`).join(`${attr}="${en.replace(/"/g, '&quot;')}"`)
    }
  }
  if (h !== o) { fs.writeFileSync(f, h); replaced++ }
}
console.log(`[sweep-en] patched ${replaced} files`)
