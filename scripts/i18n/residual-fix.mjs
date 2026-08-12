#!/usr/bin/env node
/**
 * 번역 잔재 정밀 제거: srcdoc 내부 alt / 놓친 텍스트노드 / meta content의 한글을
 * 원문 그대로 수집 → 한 번의 LLM 호출로 번역 → 문자열 치환.
 * 사용: node scripts/i18n/residual-fix.mjs <file1> <file2> ...
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const glossary = JSON.parse(fs.readFileSync(path.join(__dirname, 'glossary-jp.json'), 'utf8'))
const API_KEY = process.env.OPENAI_API_KEY
const BASE_URL = (process.env.OPENAI_BASE_URL || '').replace(/\/+$/, '')
const MODEL = process.env.I18N_MODEL || 'gpt-5'

const SKIP = [/서울비디치과의원/, /사업자/, /@서울비디치과/]

function collect(html) {
  const found = new Set()
  // script/style 본문과 data-* 속성은 건드리지 않기 위해 마스킹한 사본에서 수집
  const masked = html
    .replace(/<script[\s\S]*?<\/script>/g, (m) => '\0'.repeat(m.length))
    .replace(/<style[\s\S]*?<\/style>/g, (m) => '\0'.repeat(m.length))
    .replace(/<!--[\s\S]*?-->/g, (m) => '\0'.repeat(m.length))
    .replace(/data-[a-z-]+="[^"]*"/g, (m) => '\0'.repeat(m.length))
    .replace(/(href|src|action|value)="[^"]*"/g, (m) => '\0'.repeat(m.length))
  // 한글 포함 연속 구절 (한글+주변 문장부호, 3자 이상 문맥 유지)
  const re = /[가-힣][가-힣0-9A-Za-z\s·,.?!"'…()\-—:%~]*[가-힣]|[가-힣]/g
  for (const m of masked.matchAll(re)) {
    const s = m[0].trim()
    if (!s || SKIP.some(r => r.test(s))) continue
    found.add(s)
  }
  return [...found].sort((a, b) => b.length - a.length) // 긴 것부터 치환 (부분포함 방지)
}

async function translate(strings) {
  const SYSTEM = `韓国の歯科医院サイトの残存韓国語断片を自然な日本語に翻訳。用語集: ${JSON.stringify({ ...glossary.brand, ...glossary.treatments, ...glossary.people, ...glossary.place })}
規則: 人名はカタカナ表記（例: 현정민→ヒョン・ジョンミン）。数字・記号は保持。「치BTI」は「歯BTI」。出力JSON: {"items":[{"i":0,"t":"訳"}]} 全index必須。`
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: JSON.stringify({ items: strings.map((s, i) => ({ i, s })) }) }],
      response_format: { type: 'json_object' }, stream: true,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  let full = ''
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ''
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
  return new Map(out.items.map(x => [x.i, x.t]))
}

for (const file of process.argv.slice(2)) {
  let html = fs.readFileSync(file, 'utf8')
  const strings = collect(html)
  if (!strings.length) { console.log(`= ${file}: clean`); continue }
  console.log(`~ ${file}: ${strings.length} residuals`)
  // 100개 단위 배치
  for (let i = 0; i < strings.length; i += 100) {
    const chunk = strings.slice(i, i + 100)
    let map
    for (let a = 1; a <= 3; a++) {
      try { map = await translate(chunk); break } catch (e) { if (a === 3) throw e; await new Promise(r => setTimeout(r, 3000)) }
    }
    chunk.forEach((s, j) => {
      const t = map.get(j)
      if (!t || t === s) return
      // script/style 내부 오치환 방지: 마스킹 위치 기반 split-replace
      const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|data-[a-z-]+="[^"]*")/g)
      html = parts.map(p => (/^<script|^<style|^data-/.test(p) ? p : p.split(s).join(t))).join('')
    })
  }
  fs.writeFileSync(file, html)
  const remain = collect(html).length
  console.log(`  -> remain ${remain}`)
}
