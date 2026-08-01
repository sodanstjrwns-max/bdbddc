/**
 * TS 게이트(src/column-gate.ts) ↔ 파이썬 게이트(scripts/column-gate.py) 회귀 동등성 검증
 * =====================================================================================
 * 기존 74개 컬럼을 두 구현에 똑같이 통과시켜 탈락 건수/사유가 일치하는지 본다.
 * 파이썬 실측 기준값: 탈락 10건 (DOI N개 7 / 목록항목 N개 3 / HN N개 2 / 표 N개 2 / 본문 N자 1)
 *
 * 실행:  node scripts/gate-parity.mjs
 *   (사전에 esbuild 로 /tmp/gate.mjs 번들 필요 — 아래 npm 스크립트가 처리)
 */
import { readFileSync } from 'node:fs'
import { gateColumn } from '/tmp/gate.mjs'

const CORPUS = '/home/user/gsc-work/columns.clean.json'
const cols = JSON.parse(readFileSync(CORPUS, 'utf-8')).filter(c => c.status === 'published')

const agg = new Map()
let fail = 0
const failed = []
for (const c of cols) {
  // 파이썬 --corpus 회귀와 동일 조건: DOI 네트워크 검증 OFF, 코퍼스 중복검사 OFF
  const r = await gateColumn(c, { online: false })
  if (!r.pass) {
    fail++
    failed.push([c.slug, r.blocks])
    for (const b of r.blocks) {
      const key = b.split(':')[0].split('(')[0].trim().replace(/\d+/g, 'N')
      agg.set(key, (agg.get(key) || 0) + 1)
    }
  }
}

console.log(`[TS] 기존 ${cols.length}건 중 게이트 탈락 ${fail}건 (${Math.round(fail / cols.length * 100)}%)`)
for (const [k, v] of [...agg].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(3)}× ${k}`)
}

// 파이썬 실측 기준값과 대조
const EXPECT = { total: 10, 'DOI N개': 7, '목록항목 N개': 3, 'HN N개': 2, '표 N개': 2, '본문 N자': 1 }
let ok = fail === EXPECT.total
const diffs = []
if (!ok) diffs.push(`탈락 총계 ${fail} ≠ 파이썬 ${EXPECT.total}`)
for (const [k, v] of Object.entries(EXPECT)) {
  if (k === 'total') continue
  const got = agg.get(k) || 0
  if (got !== v) { ok = false; diffs.push(`${k}: TS ${got} ≠ PY ${v}`) }
}
console.log(ok ? '\n✅ 파이썬 게이트와 판정 동등 — 워커 게이트 신뢰 가능'
              : `\n❌ 불일치:\n  ${diffs.join('\n  ')}`)
if (!ok) {
  console.log('\n탈락 상세:')
  for (const [slug, bl] of failed) console.log(`  ${slug}\n    ${bl.join('\n    ')}`)
}
process.exit(ok ? 0 : 1)
