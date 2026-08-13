// en 페이지 인라인 <script> 내 한글 문자열 리터럴 일괄 번역 (en)
// translate-js-literals.mjs(jp판) 복제. 사용: node scripts/i18n/translate-js-literals-en.mjs en/checkup.html en/flight.html
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../..')
const envFile = fs.readFileSync(path.join(ROOT, '.dev.vars'), 'utf8')
const env = Object.fromEntries(envFile.split('\n').filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]))
const API_KEY = env.OPENAI_API_KEY
const BASE_URL = env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
const MODEL = 'gpt-5'

const glossary = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/i18n/glossary-en.json'), 'utf8'))
const glossaryText = Object.entries({ ...glossary.brand, ...glossary.treatments }).map(([k, v]) => `${k} → ${v}`).join('\n')

const SYSTEM = `You are a professional Korean→English translator for a dental clinic website (Seoul BD Dental, targeting US military families near Camp Humphreys).
Translate each Korean string to natural American English. These are UI strings from an interactive quiz/game (casual, playful tone with emoji — keep the emoji and the light humorous nuance, e.g. ㅋㅋ → lol/haha).
Rules:
- Keep emoji, numbers, punctuation structure.
- Keep any HTML tags inside strings unchanged.
- Do NOT translate proper nouns already in English.
- Keep KRW prices as-is.
- Korean street addresses stay in original Korean.
- Use this glossary for dental terms:
${glossaryText}
Return JSON: {"items":[{"i":<index>,"t":"<translated>"}]} — one item per input, same index.`

async function callLLM(batch) {
  const user = JSON.stringify({ items: batch.map((s, i) => ({ i, s })) })
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
      if (map.size !== batch.length) throw new Error(`incomplete: ${map.size}/${batch.length}`)
      return batch.map((_, i) => map.get(i))
    } catch (e) {
      console.error(`  [retry ${attempt}] ${e.message}`)
      if (attempt === 6) throw e
      const wait = /429/.test(e.message) ? 8000 + Math.random() * 7000 : 3000 * attempt
      await new Promise(r => setTimeout(r, wait))
    }
  }
}

const HANGUL = /[가-힣]/
// 데이터 키로 쓰여 번역하면 안 되는 리터럴 (schedule 요일 키, API category 키 등)
const SKIP = new Set(["'일'", "'월'", "'화'", "'수'", "'목'", "'금'", "'토'"])
// 한국 주소·법인명은 원문 유지
const KEEP_RE = /불당34길|서울비디치과의원|사업자/

function extractLiterals(html) {
  const found = new Set()
  const scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/g
  let sm
  while ((sm = scriptRe.exec(html))) {
    if (sm[1].includes('ld+json')) continue
    const body = sm[2]
    const litRe = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g
    let m
    while ((m = litRe.exec(body))) {
      const lit = m[0]
      if (!HANGUL.test(lit)) continue
      if (SKIP.has(lit)) continue
      if (KEEP_RE.test(lit)) continue
      found.add(lit)
    }
  }
  return [...found]
}

const files = process.argv.slice(2)
if (!files.length) { console.error('usage: node translate-js-literals-en.mjs <file...>'); process.exit(1) }

for (const rel of files) {
  const fp = path.join(ROOT, rel)
  let html = fs.readFileSync(fp, 'utf8')
  const lits = extractLiterals(html)
  console.log(`${rel}: ${lits.length} literals`)
  if (!lits.length) continue

  const inner = lits.map(l => l.slice(1, -1))
  const translated = []
  for (let i = 0; i < inner.length; i += 30) {
    const batch = inner.slice(i, i + 30)
    console.log(`  batch ${i / 30 + 1}/${Math.ceil(inner.length / 30)} (${batch.length})`)
    const out = await callLLM(batch)
    translated.push(...out)
  }

  const pairs = lits.map((l, i) => {
    const q = l[0]
    let t = translated[i].replaceAll('\\', '\\\\')
    t = q === "'" ? t.replaceAll("'", "\\'") : t.replaceAll('"', '\\"')
    return [l, q + t + q]
  }).sort((a, b) => b[0].length - a[0].length)

  for (const [o, n] of pairs) html = html.replaceAll(o, n)
  fs.writeFileSync(fp, html)

  const left = extractLiterals(html)
  console.log(`  done. 잔여 한글 리터럴: ${left.length}`)
  if (left.length) left.slice(0, 5).forEach(l => console.log('   ', l.slice(0, 80)))
}
