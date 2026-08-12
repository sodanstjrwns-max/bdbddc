#!/usr/bin/env node
/**
 * 잔여 표시 텍스트 최종 소탕: jp/ 전체에서 남은 한글 표시 텍스트를 수집→LLM 일괄 번역→전역 치환
 * 기능성(한글 srcdoc 임베드 제목 제외 가능, data-*, href, value)은 건드리지 않음
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
const globSync = (pat, { cwd }) => execSync(`cd ${cwd} && ls jp/*.html jp/*/*.html 2>/dev/null`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const API_KEY = process.env.OPENAI_API_KEY
const BASE_URL = (process.env.OPENAI_BASE_URL || '').replace(/\/+$/, '')
const glossary = JSON.parse(fs.readFileSync(path.join(__dirname, 'glossary-jp.json'), 'utf8'))

const files = globSync('jp/**/*.html', { cwd: ROOT }).map(f => path.join(ROOT, f))
const KO = /[가-힣]/

// 텍스트 노드/title·alt·placeholder·content 속성에서만 잔여 한글 수집 (정규식 기반, 단순·안전)
const segs = new Map() // segment -> Set(files)
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8')
  let body = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '')
  body = body.replace(/srcdoc="[^"]*"/g, '').replace(/data-[a-z-]+="[^"]*"/g, '')
    .replace(/(href|src|action|value)="[^"]*"/g, '')
  // 태그 사이 텍스트 + 허용 속성값
  const found = []
  for (const m of body.matchAll(/>([^<>]*[가-힣][^<>]*)</g)) found.push(m[1])
  for (const m of body.matchAll(/(?:title|alt|placeholder|aria-label|content)="([^"]*[가-힣][^"]*)"/g)) found.push(m[1])
  for (let t of found) {
    t = t.trim()
    if (!t || t.length > 300) continue
    if (/서울비디치과의원|사업자|@서울비디치과/.test(t)) continue
    if (/^[월화수목금토일]$/.test(t)) continue // 요일 기능값
    if (!segs.has(t)) segs.set(t, new Set())
    segs.get(t).add(f)
  }
}
const list = [...segs.keys()]
console.log(`[sweep] ${list.length} unique segments`)
if (!list.length) process.exit(0)

const SYSTEM = `韓国の歯科医院サイトの日本語化。次の韓国語(または韓日混在)断片を自然な日本語に翻訳。
規則: 用語集適用 ${JSON.stringify({ ...glossary.brand, ...glossary.treatments })} / 数字・価格保持 / 韓国の住所は原文保持+カタカナ読み不要 / です・ます調。
住所(불당34길 등)はそのまま維持してよい。既に日本語の部分は変えない。
出力JSON: {"items":[{"i":<index>,"t":"<訳>"}]} 全index必須。`

async function translate(batch, base) {
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
  for (let a = 1; a <= 3; a++) {
    try { const m = await translate(batch); m.forEach((v, k) => mapping.set(k, v)); break }
    catch (e) { console.error('retry', a, e.message); if (a === 3) throw e; await new Promise(r => setTimeout(r, 3000)) }
  }
  console.log(`  translated ${Math.min(i + 35, list.length)}/${list.length}`)
}

// 주소 등 원문 유지 판정: 번역 결과가 동일하면 스킵
let replaced = 0
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8'); const o = h
  for (const [ko, ja] of mapping) {
    if (!ja || ja === ko) continue
    h = h.split('>' + ko + '<').join('>' + ja + '<')
    for (const attr of ['title', 'alt', 'placeholder', 'aria-label', 'content']) {
      h = h.split(`${attr}="${ko}"`).join(`${attr}="${ja.replace(/"/g, '&quot;')}"`)
    }
  }
  if (h !== o) { fs.writeFileSync(f, h); replaced++ }
}
console.log(`[sweep] patched ${replaced} files`)
