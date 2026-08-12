#!/usr/bin/env node
/**
 * 배치 번역 러너 + 자동 QA 게이트 (2026-08-11)
 * 사용: node scripts/i18n/run-batch.mjs scripts/i18n/batch1.json
 *  1) jp-sitemap.json에 배치 전체 경로 등록 (내부링크 상호 재작성 위해 선행)
 *  2) 페이지별 translate-page.mjs 실행 (이미 존재하면 스킵, --force로 재생성)
 *  3) QA: 한글 잔재 / JSON-LD 파싱 / 금지 패턴(Light 티어·30만 미백) / 상대경로 잔재
 *  4) 국문 원본에 hreflang ja 역링크 주입 (기존 hreflang 세트 보존형)
 */
import fs from 'fs'
import path from 'path'
import { execSync, spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const batchFile = process.argv[2]
const FORCE = process.argv.includes('--force')
const batch = JSON.parse(fs.readFileSync(batchFile, 'utf8'))

// 1) jp-sitemap 갱신 (누적)
const smPath = path.join(__dirname, 'jp-sitemap.json')
let sm = new Set()
try { sm = new Set(JSON.parse(fs.readFileSync(smPath, 'utf8'))) } catch {}
for (const b of batch) {
  const ko = b.path.replace(/^\/jp/, '') || '/'
  sm.add(ko === '/' ? '/' : ko.replace(/\/$/, ''))
}
sm.add('/doctors/moon')
fs.writeFileSync(smPath, JSON.stringify([...sm].sort(), null, 1))
console.log(`[sitemap] ${sm.size} ko paths registered`)

// 2) 번역 실행
const results = []
for (const b of batch) {
  const outAbs = path.join(ROOT, b.out)
  if (fs.existsSync(outAbs) && !FORCE && b.out !== 'jp/index.html' && b.out !== 'jp/pricing.html') {
    // 기존 jp 수제 페이지(index/pricing 등)는 새 1:1판으로 교체해야 하므로 예외 없음 — 단 파일럿 moon은 스킵
    if (b.out === 'jp/doctors/moon.html') { console.log(`[skip] ${b.out}`); results.push({ ...b, status: 'skip' }); continue }
  }
  console.log(`\n=== translate: ${b.src} -> ${b.out}`)
  const r = spawnSync('node', [path.join(__dirname, 'translate-page.mjs'), b.src, b.out, b.path], {
    cwd: ROOT, stdio: 'inherit', env: process.env, timeout: 900000,
  })
  results.push({ ...b, status: r.status === 0 ? 'ok' : 'fail' })
  if (r.status !== 0) console.error(`[FAIL] ${b.src}`)
}

// 3) QA 게이트
console.log('\n===== QA GATE =====')
const BAN = [/Glownate\s*Light/i, /ライト（?60万/, /ホワイトニング[^。]{0,20}30万/, /600,000.{0,8}800,000/]
let pass = 0, fail = 0
for (const b of results) {
  if (b.status === 'fail') { fail++; continue }
  const f = path.join(ROOT, b.out)
  const h = fs.readFileSync(f, 'utf8')
  const issues = []
  // 한글 잔재 (script/style/주석 제외, 사업자상호 허용)
  let body = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '')
  // 기능성 한글 제외: URL 내 한글(맵 주소·쿼리), data-* 속성값(JS 로직 의존), value 속성
  body = body.replace(/(href|src|action)="[^"]*"/g, '')
             .replace(/data-[a-z-]+="[^"]*"/g, '')
             .replace(/value="[^"]*"/g, '')
  const koLines = body.split('\n').filter(l => /[가-힣]/.test(l) && !/서울비디치과의원|사업자|@서울비디치과/.test(l))
  if (koLines.length > 3) issues.push(`korean x${koLines.length}`)
  // JSON-LD
  const lds = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  for (const m of lds) { try { JSON.parse(m[1]) } catch { issues.push('ld-parse') } }
  // 금지 패턴
  for (const re of BAN) if (re.test(body)) issues.push(`ban:${re}`)
  // 상대경로 잔재
  if (/(href|src)="\.\.?\//.test(h)) issues.push('relpath')
  // lang
  if (!/<html[^>]+lang="ja"/.test(h)) issues.push('lang')
  if (issues.length) { fail++; console.log(`  ❌ ${b.out}: ${issues.join(', ')}${koLines.length ? ' | 예: ' + (koLines[0] || '').trim().slice(0, 80) : ''}`) }
  else { pass++; console.log(`  ✅ ${b.out}`) }
}
console.log(`QA: ${pass} pass / ${fail} fail`)

// 4) 국문 원본 hreflang ja 역링크 주입
console.log('\n===== KO hreflang backlink =====')
for (const b of batch) {
  const koFile = path.join(ROOT, b.src)
  let h = fs.readFileSync(koFile, 'utf8')
  const koPath = b.path.replace(/^\/jp/, '') || '/'
  const jaHref = `https://bdbddc.com${b.path}`
  if (h.includes(`hreflang="ja" href="${jaHref}"`)) { console.log(`  = ${b.src}`); continue }
  if (/hreflang="ja"/.test(h)) {
    // 기존 ja 항목 교체 (구 jp 페이지 가리키던 것 → 새 1:1 경로)
    h = h.replace(/(<link rel="alternate" hreflang="ja" href=")[^"]*(")/, `$1${jaHref}$2`)
    console.log(`  ~ ${b.src} (ja replaced)`)
  } else if (/rel="canonical"/.test(h)) {
    h = h.replace(/(<link rel="canonical"[^>]*>)/,
      `$1\n  <link rel="alternate" hreflang="ko" href="https://bdbddc.com${koPath}">\n  <link rel="alternate" hreflang="ja" href="${jaHref}">\n  <link rel="alternate" hreflang="x-default" href="https://bdbddc.com${koPath}">`)
    console.log(`  + ${b.src} (ko/ja/x-default added)`)
  } else console.log(`  ! ${b.src} no canonical — skipped`)
  fs.writeFileSync(koFile, h)
}
console.log('\ndone.')
