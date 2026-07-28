#!/usr/bin/env node
/**
 * 백과사전 죽은 link 교정 (v5.42)
 *
 * 배경: encyclopedia.json 의 item.link 값 117종을 로컬 서버로 전수 검사한 결과
 *       18종이 404 였고, 29개 항목이 이를 가리키고 있었습니다.
 *       (대부분 존재한 적 없는 경로거나, URL 인코딩된 한글 경로)
 *
 * 사용법:
 *   node scripts/fix-enc-dead-links.cjs --dry-run
 *   node scripts/fix-enc-dead-links.cjs
 *
 * 멱등: 이미 교정된 파일에 다시 실행해도 0건 변경.
 * 검증: 실행 후 아래로 전수 재확인 권장
 *   node -e "..." 대신 scripts/check-enc-links.sh 참고
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const ENC_PATH = path.join(ROOT, 'public', 'data', 'encyclopedia.json')
const DRY = process.argv.includes('--dry-run')

// 404 확인된 경로 → 살아있는 대체 경로
const LINK_FIX = {
  '/treatments/onlay': '/treatments/inlay',
  '/treatments/composite': '/treatments/resin',
  '/treatments/fracture': '/treatments/crown',
  '/treatments/extraction': '/treatments/wisdom-tooth',
  '/treatments/fluoride': '/treatments/prevention',
  '/treatments/diagnosis': '/treatments/prevention',
  '/treatments/insurance': '/pricing',
  '/treatments/digital-implant': '/treatments/implant-navigation',
  '/treatments/orthognathic': '/treatments/orthodontics',
  '/treatments/periodontal': '/treatments/gum-surgery',
  '/treatments/gum-graft': '/treatments/gum-surgery',
  '/treatments/gummy-smile': '/treatments/gum-surgery',
  '/treatments/gum-recession': '/treatments/gum',
  '/treatments/gum-depigmentation': '/treatments/aesthetic',
  '/treatments/replantation': '/treatments/emergency',
  '/treatments/trauma': '/treatments/emergency',
  // URL 인코딩된 한글 경로 (존재하지 않음)
  '/treatments/%EC%84%B8%EB%9D%BC%EB%AF%B9': '/treatments/aesthetic',
  '/encyclopedia/%EC%88%98%EB%A9%B4-%EC%A7%84%EC%A0%95': '/treatments/sedation',
}

const enc = JSON.parse(fs.readFileSync(ENC_PATH, 'utf-8'))
console.log(`📖 백과사전 로딩: ${enc.items.length}개 항목`)

let fixed = 0
const perTarget = {}
for (const item of enc.items) {
  const from = item.link
  if (from && LINK_FIX[from]) {
    item.link = LINK_FIX[from]
    fixed++
    perTarget[from] = (perTarget[from] || 0) + 1
    console.log(`   🔗 ${item.term}: ${from} → ${item.link}`)
  }
}

console.log(`\n📊 교정 ${fixed}건 / 대상 경로 ${Object.keys(perTarget).length}종`)

// 남은 link 값 목록 출력 (검증용)
const remaining = [...new Set(enc.items.map((i) => i.link).filter(Boolean))].sort()
console.log(`📎 현재 link 값 ${remaining.length}종`)

if (DRY) {
  console.log('\n🔍 --dry-run: 저장하지 않았습니다.')
  process.exit(0)
}
if (fixed === 0) {
  console.log('\n✅ 변경 없음 (이미 교정 완료).')
  process.exit(0)
}
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
fs.copyFileSync(ENC_PATH, path.join(ROOT, 'public', 'data', `.enc-backup-${stamp}.json`))
fs.writeFileSync(ENC_PATH, JSON.stringify(enc, null, 2), 'utf-8')
console.log(`\n💾 저장 완료: ${ENC_PATH}`)
