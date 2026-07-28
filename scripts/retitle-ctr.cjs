#!/usr/bin/env node
/**
 * v5.41 — 고노출·저CTR 페이지 title/description 재설계
 * --------------------------------------------------
 * GSC(2026-04-26~07-25) 근거:
 *   「후회·부작용·하지마」 인텐트 CTR 5.54%  vs  「단어 정의」 인텐트 0.35% (16배)
 *   → 기관 소개형 제목을 "환자의 실제 불안/의문" 언어로 교체한다.
 *
 * 의료광고법 준수: 최상급(최고·1위·유일) 금지, 치료 효과 보장 표현 금지,
 *                  경쟁 의료기관 비방 금지, 가격은 기존 페이지 표기 범위 유지.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

/** @type {Array<{file:string, impr:number, ctr:string, title:string, desc:string}>} */
const TARGETS = [
  {
    file: 'treatments/pediatric.html',
    impr: 17379, ctr: '0.03%',
    title: '천안 소아치과 | 아이가 치과를 무서워할 때 — 수면치료 안전한가요? 유치 충치 꼭 때워야 하나요?',
    desc: '"우리 아이가 울어서 치료를 못 받아요" — 천안 소아치과 서울비디치과. 웃음가스·수면치료가 어떤 경우에 필요한지, 유치 충치를 치료해야 하는 기준은 무엇인지 서울대 출신 소아치과 전문의 3인이 설명드립니다. 실란트·불소도포·영유아검진, 365일 진료 ☎041-415-2892',
  },
  {
    file: 'doctors/pediatric.html',
    impr: 4567, ctr: '0.13%',
    title: '천안 소아치과 전문의 3인 | 우리 아이 담당 선생님은 어떤 분? — 진료 스타일까지 공개',
    desc: '아이를 맡기기 전에 먼저 보세요. 천안 서울비디치과 소아치과 전문의 3인 — 김민진·서희원·박상현 원장의 전공·경력과 아이를 대하는 진료 방식을 소개합니다. 영유아 구강검진, 성장기 관찰, 행동조절, 진정치료. 서울대 출신 ☎041-415-2892',
  },
  {
    file: 'guide/laminate.html',
    impr: 5658, ctr: '0.23%',
    // /guide/regret/laminate 와의 「후회」 키워드 중복 제거 — 이쪽은 비용·선택 정보로 분화
    title: '라미네이트 비용·종류·수명 총정리 2026 | emax vs 지르코니아, 몇 개를 해야 할까 — 치과의사 가이드',
    desc: '라미네이트를 고민 중이라면 먼저 읽어야 할 것들. 2026년 비용(1개당 50~100만원), 5가지 종류 강도·수명 비교, 삭제량 차이, 몇 개를 해야 자연스러운지, 어떤 경우에 권하지 않는지까지. 치과의사가 직접 정리했습니다.',
  },
  {
    file: 'guide/implant.html',
    impr: 5891, ctr: '0.49%',
    title: '임플란트 비용 2026 | 병원마다 가격이 다른 이유 — 종류·수명·부작용 치과의사 총정리',
    desc: '같은 임플란트인데 왜 견적이 다를까? 픽스처·지대주·보철 어디서 차이가 생기는지, 2026년 비용(국내 평균 약 139만원, 병원·종류별 상이), 8가지 종류 비교, 수술 과정 7단계, 수명과 관리, 건강보험 적용 조건까지 치과의사가 설명합니다.',
  },
  {
    file: 'guide/insurance.html',
    impr: 9478, ctr: '0.75%',
    title: '치과 실비보험 되는 것 안 되는 것 | 사랑니·신경치료 O, 임플란트·레진 X — 청구 서류까지 2026',
    desc: '치과 실비(실손)보험, 헷갈리는 기준을 항목별로 정리했습니다. 2009년 10월 이후 가입자라면 사랑니 발치·신경치료·치료 목적 스케일링 등 급여 본인부담금 청구 가능. 임플란트·레진·미백이 안 되는 이유, 필요한 서류 3가지, 청구 순서까지.',
  },
  {
    file: 'pricing.html',
    impr: 4367, ctr: '0.87%',
    title: '천안 치과 비용 전체 공개 2026 | 임플란트·교정·라미네이트 수가표 — 상담 전에 미리 확인하세요',
    desc: '견적을 듣기 전에 먼저 보고 오세요. 서울비디치과 비급여 수가표 전체 공개 — 천안 임플란트 80~160만원, 인비절라인 300~700만원, 라미네이트(글로우네이트) 80만원, 스케일링·레진·크라운·사랑니까지 항목별 가격. 추가 비용 발생 조건도 함께 안내합니다.',
  },
  {
    file: 'area/daejeon-laminate.html',
    impr: 6197, ctr: '0.10%',
    title: '대전 라미네이트 가격·병원 고르는 법 | 후회 줄이는 확인 사항 5가지 — 서울비디치과',
    desc: '대전에서 라미네이트를 알아보신다면, 병원을 정하기 전에 확인할 5가지. 삭제량·재료·보증 기준·디자인 과정·재치료 조건을 어떻게 물어봐야 하는지 정리했습니다. 서울비디치과는 대전에서 차로 약 40분 — 글로우네이트, 최소삭제 포세린 라미네이트, DSD 디자인.',
  },
]

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

let changed = 0
let skipped = 0

for (const t of TARGETS) {
  const p = path.join(ROOT, t.file)
  if (!fs.existsSync(p)) {
    console.log(`  ⚠️  SKIP (없음): ${t.file}`)
    skipped++
    continue
  }
  let html = fs.readFileSync(p, 'utf8')
  const before = html

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t.title}</title>`)
  // meta description
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(t.desc)}$2`)
  // og:title / og:description
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${esc(t.title)}$2`)
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${esc(t.desc)}$2`)
  // twitter
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${esc(t.title)}$2`)
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${esc(t.desc)}$2`)

  if (html === before) {
    console.log(`  ⚠️  변경 없음: ${t.file}`)
    skipped++
    continue
  }
  fs.writeFileSync(p, html)
  console.log(`  ✅ ${t.file}  (노출 ${t.impr.toLocaleString()} / CTR ${t.ctr})`)
  console.log(`     └ ${t.title.slice(0, 70)}${t.title.length > 70 ? '…' : ''}`)
  changed++
}

console.log(`\nretitle-ctr: ${changed}개 변경, ${skipped}개 건너뜀`)
