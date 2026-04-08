#!/usr/bin/env node
/**
 * 임플란트 세부 진료 페이지 자동 생성 스크립트
 * - 12개 임플란트 종류별 개별 페이지 생성
 * - 메인 implant.html의 헤더/네비/푸터 구조 재사용
 * - SEO: meta, OG, Twitter, Schema.org JSON-LD 포함
 */

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'treatments');

// 12개 임플란트 세부 진료 데이터
const implantTypes = [
  {
    slug: 'implant-sedation',
    title: '수면 임플란트',
    shortTitle: '수면 임플란트',
    metaTitle: '천안 수면 임플란트 | 무통·무공포 수술 — 서울비디치과',
    metaDesc: '천안 수면 임플란트 — 수면 상태에서 편안하게 수술. 치과 공포증 환자도 안심. 전문 마취 시스템, 6개 수술실 운영. 서울대 출신 전문의 ☎041-415-2892',
    keywords: '수면 임플란트, 천안 수면 임플란트, 무통 임플란트, 치과 공포증',
    icon: 'fa-bed',
    heroSub: '수면 상태에서 편안하게, 깨어나면 이미 완료',
    heroDesc: '전문 마취과와 협진하여 안전한 수면진정 하에 수술합니다. 치과 공포증, 다수 식립, 고령 환자분들께 특히 추천드립니다.',
    features: [
      { icon: 'fa-shield-alt', title: '수술 공포 완전 해결', desc: '의식하지 못하는 상태에서 수술이 진행되어 공포감 없이 편안하게 치료받으실 수 있습니다.' },
      { icon: 'fa-user-md', title: '전문 마취 시스템', desc: '마취과 전문의와 협진하며, 실시간 생체 모니터링으로 안전을 최우선으로 합니다.' },
      { icon: 'fa-teeth', title: '다수 동시 식립 가능', desc: '여러 개의 임플란트를 한 번의 수면 수술로 동시에 진행하여 내원 횟수를 줄입니다.' },
      { icon: 'fa-heartbeat', title: '고령 환자 안심 시스템', desc: '전신 상태를 정밀 체크하고, 고혈압·당뇨 환자도 안전하게 수술받을 수 있도록 관리합니다.' }
    ],
    process: ['사전 상담 및 건강 체크', '마취 전 검사 (혈압, 혈당, 심전도)', '수면진정 마취 시작', '임플란트 식립 수술', '회복실 안정 관찰', '귀가 안내 및 사후 관리'],
    recommend: '치과 공포증, 다수 임플란트, 고령 환자, 구역반사 심한 분',
    faqs: [
      { q: '수면 임플란트가 전신마취인가요?', a: '아닙니다. 수면진정(의식하 진정)으로 전신마취와 다릅니다. 자연스러운 수면 상태를 유도하며, 호흡은 스스로 하시고, 수술 후 빠르게 회복됩니다.' },
      { q: '수면 임플란트 비용이 추가되나요?', a: '네, 수면진정 관련 비용이 별도로 발생합니다. 정확한 비용은 상담 시 안내드리며, 수술 범위에 따라 달라집니다.' },
      { q: '수면 임플란트 후 당일 귀가 가능한가요?', a: '네, 가능합니다. 회복실에서 30~60분 안정 후 귀가하실 수 있습니다. 다만 당일 운전은 삼가시고, 보호자 동반을 권합니다.' }
    ]
  },
  {
    slug: 'implant-flapless',
    title: '비절개 임플란트',
    shortTitle: '비절개 임플란트',
    metaTitle: '천안 비절개 임플란트 | 절개 없는 최소침습 — 서울비디치과',
    metaDesc: '천안 비절개 임플란트 — 잇몸 절개 없이 최소 침습 수술. 당일 일상 복귀, 출혈·붓기 최소화. 디지털 가이드 정밀 식립 ☎041-415-2892',
    keywords: '비절개 임플란트, 천안 비절개, 무절개 임플란트, 최소침습',
    icon: 'fa-cut',
    heroSub: '절개 없이, 붓기 없이, 당일 일상으로',
    heroDesc: '잇몸을 절개하지 않고 작은 구멍(펀칭)만으로 식립합니다. 디지털 가이드를 사용해 정확한 위치에 식립하며, 출혈과 붓기가 현저히 적습니다.',
    features: [
      { icon: 'fa-band-aid', title: '잇몸 절개 없는 수술', desc: '잇몸을 크게 열지 않고 작은 구멍만으로 식립하여 조직 손상을 최소화합니다.' },
      { icon: 'fa-running', title: '당일 일상 복귀', desc: '수술 후 붓기와 통증이 적어 바로 일상생활로 돌아갈 수 있습니다.' },
      { icon: 'fa-tint-slash', title: '출혈·붓기 최소화', desc: '절개가 없으므로 기존 수술 대비 출혈과 붓기가 80% 이상 감소합니다.' },
      { icon: 'fa-laptop-medical', title: '디지털 가이드 사용', desc: '3D CT 데이터를 기반으로 제작된 가이드를 사용해 정밀하게 식립합니다.' }
    ],
    process: ['3D CT 촬영 및 분석', '디지털 가이드 제작', '가이드 장착 후 펀칭', '임플란트 정밀 식립', '즉시 치유지대주 장착', '당일 귀가'],
    recommend: '빠른 회복 원하는 분, 바쁜 직장인, 출혈 걱정되는 분',
    faqs: [
      { q: '비절개 임플란트는 누구나 가능한가요?', a: '잇몸뼈(치조골)가 충분한 경우에 가능합니다. CT 촬영 후 정확한 판단이 가능하며, 뼈가 부족한 경우 뼈이식 후 진행할 수 있습니다.' },
      { q: '비절개 수술이 기존 수술보다 안전한가요?', a: '디지털 가이드를 사용하므로 오히려 더 정밀합니다. 조직 손상이 적어 감염 위험도 낮습니다.' },
      { q: '비절개 임플란트 비용이 더 비싼가요?', a: '디지털 가이드 제작 비용이 추가될 수 있지만, 회복 기간 단축으로 전체적인 치료 기간과 내원 횟수가 줄어듭니다.' }
    ]
  },
  {
    slug: 'implant-navigation',
    title: '네비게이션 임플란트',
    shortTitle: '네비게이션 임플란트',
    metaTitle: '천안 네비게이션 임플란트 | 0.1mm 정밀 식립 — 서울비디치과',
    metaDesc: '천안 네비게이션 임플란트 — 3D CT 기반 시뮬레이션, 0.1mm 오차 정밀 식립. 수술 시간 단축, 신경 안전 회피. 서울대 출신 전문의 ☎041-415-2892',
    keywords: '네비게이션 임플란트, 천안 네비게이션, 디지털 임플란트, 가이드 임플란트',
    icon: 'fa-crosshairs',
    heroSub: '0.1mm 단위의 정밀함, 네비게이션이 안내합니다',
    heroDesc: '3D CT와 구강스캐너 데이터를 결합하여 컴퓨터 시뮬레이션으로 최적의 식립 위치를 사전 설계합니다. 수술 중 실시간 네비게이션으로 0.1mm 단위의 정밀 식립을 실현합니다.',
    features: [
      { icon: 'fa-desktop', title: '3D CT 시뮬레이션', desc: '수술 전 컴퓨터로 뼈 상태, 신경 위치, 식립 각도를 정밀 분석하여 최적의 계획을 수립합니다.' },
      { icon: 'fa-crosshairs', title: '0.1mm 오차 정밀 식립', desc: '실시간 네비게이션 시스템이 수술 중 정확한 위치, 각도, 깊이를 안내합니다.' },
      { icon: 'fa-clock', title: '수술 시간 대폭 단축', desc: '사전 계획대로 진행하므로 수술 시간이 일반 대비 30~50% 단축됩니다.' },
      { icon: 'fa-shield-alt', title: '신경 안전 회피', desc: '하악 신경관, 상악동 등 위험 구조물을 정밀 회피하여 합병증을 예방합니다.' }
    ],
    process: ['3D CT + 구강스캐너 촬영', '디지털 시뮬레이션 설계', '수술 가이드 제작', '네비게이션 시스템 세팅', '실시간 가이드 식립', '결과 확인 및 사후 관리'],
    recommend: '정밀 수술 원하는 분, 신경 인접 케이스, 고난도 케이스',
    faqs: [
      { q: '네비게이션 임플란트가 일반 임플란트보다 좋은 이유는?', a: '사전 시뮬레이션과 실시간 가이드로 정확도가 높아 합병증 위험이 낮고, 최적의 위치에 식립됩니다.' },
      { q: '네비게이션 시스템이 정말 필요한가요?', a: '특히 신경 가까운 부위, 뼈가 좁은 부위, 다수 식립 시 필수적입니다. 안전성과 정확도가 크게 향상됩니다.' },
      { q: '모든 케이스에 적용 가능한가요?', a: '대부분 적용 가능합니다. 특히 고난도 케이스에서 더 큰 효과를 발휘하며, 상담 시 적합 여부를 안내드립니다.' }
    ]
  },
  {
    slug: 'implant-advanced',
    title: '고난도 임플란트',
    shortTitle: '고난도 임플란트',
    metaTitle: '천안 고난도 임플란트 | 뼈이식·타원불가 전문 — 서울비디치과',
    metaDesc: '천안 고난도 임플란트 — 타원 불가 판정 케이스도 상담 가능. 뼈이식(GBR), 상악동 거상술, 블록뼈 이식 전문. 서울대 출신 전문의 ☎041-415-2892',
    keywords: '고난도 임플란트, 뼈이식 임플란트, 타원 불가, GBR',
    icon: 'fa-bone',
    heroSub: '다른 곳에서 안 된다고 하셨나요? 방법을 찾겠습니다',
    heroDesc: '뼈가 부족하거나 다른 치과에서 임플란트가 불가하다는 판정을 받으셨어도 포기하지 마세요. 뼈이식(GBR), 상악동 거상술, 블록뼈 이식 등 다양한 고난도 술식으로 임플란트를 가능하게 합니다.',
    features: [
      { icon: 'fa-bone', title: '뼈이식 (GBR)', desc: '부족한 잇몸뼈를 인공뼈와 차단막을 이용해 재생시킨 후 임플란트를 식립합니다.' },
      { icon: 'fa-layer-group', title: '상악동 거상술', desc: '위턱 어금니 부위 뼈가 부족할 때, 상악동 공간에 뼈를 보강하여 식립 기반을 만듭니다.' },
      { icon: 'fa-cubes', title: '블록뼈 이식', desc: '심하게 흡수된 뼈를 블록 형태의 뼈로 보강하여 충분한 식립 기반을 확보합니다.' },
      { icon: 'fa-project-diagram', title: '올온포 임플란트', desc: '4~6개 임플란트로 전체 치아를 복원하는 전악 재건 솔루션입니다.' }
    ],
    process: ['3D CT 정밀 분석', '뼈 상태 평가 및 치료 계획', '뼈이식 수술', '골유착 대기 (3~6개월)', '임플란트 식립', '최종 보철물 장착'],
    recommend: '타원 불가 판정, 뼈 부족, 오래된 발치 부위, 전악 재건',
    faqs: [
      { q: '뼈이식 후 임플란트까지 기간은?', a: '뼈이식 종류에 따라 3~6개월 정도 골유착 기간이 필요합니다. 일부 케이스에서는 뼈이식과 임플란트 식립을 동시에 진행할 수 있습니다.' },
      { q: '뼈이식이 실패할 수도 있나요?', a: '성공률은 95% 이상입니다. 금연, 구강 위생 관리, 정기 검진이 성공률을 높이는 핵심 요인입니다.' },
      { q: '타원에서 안 된다고 했는데 정말 가능한가요?', a: '네, 가능한 경우가 많습니다. 고난도 술식 경험이 풍부한 전문의가 CT 분석 후 가능 여부를 정확히 판단해드립니다.' }
    ]
  },
  {
    slug: 'implant-revision',
    title: '임플란트 재수술',
    shortTitle: '재수술',
    metaTitle: '천안 임플란트 재수술 | 실패 임플란트 전문 — 서울비디치과',
    metaDesc: '천안 임플란트 재수술 — 실패한 임플란트 정밀 분석 후 안전하게 재식립. 타원 케이스도 환영. 서울대 출신 전문의 ☎041-415-2892',
    keywords: '임플란트 재수술, 임플란트 실패, 재식립, 임플란트 제거',
    icon: 'fa-sync-alt',
    heroSub: '실패한 임플란트, 다시 살리겠습니다',
    heroDesc: '임플란트가 실패하는 원인은 다양합니다. 정밀 분석으로 원인을 파악하고, 안전하게 제거한 뒤 골재생 후 재식립합니다.',
    features: [
      { icon: 'fa-search', title: '실패 원인 정밀 분석', desc: 'CT, X-ray로 실패 원인(임플란트 주위염, 골유착 실패, 보철 문제 등)을 정확히 진단합니다.' },
      { icon: 'fa-minus-circle', title: '안전한 임플란트 제거', desc: '주변 뼈 손상을 최소화하면서 실패한 임플란트를 안전하게 제거합니다.' },
      { icon: 'fa-bone', title: '골재생 후 재식립', desc: '제거 부위의 뼈를 재생시킨 후, 충분한 골량이 확보되면 새 임플란트를 식립합니다.' },
      { icon: 'fa-handshake', title: '타원 케이스 환영', desc: '다른 치과에서 수술한 임플란트도 분석·재수술이 가능합니다.' }
    ],
    process: ['실패 원인 정밀 진단', '치료 계획 수립', '임플란트 안전 제거', '감염 조직 제거 + 뼈이식', '골유착 대기 (3~6개월)', '재식립 및 보철'],
    recommend: '임플란트 실패, 흔들리는 임플란트, 임플란트 주위염, 타원 재수술',
    faqs: [
      { q: '재수술 성공률은 얼마나 되나요?', a: '원인에 따라 다르지만, 정확한 진단과 적절한 처치 후 재수술 성공률은 90% 이상입니다.' },
      { q: '다른 치과에서 수술한 것도 가능한가요?', a: '네, 어디서 수술하셨든 상관없이 분석과 재수술이 가능합니다.' },
      { q: '재수술 비용은 어떻게 되나요?', a: '기존 임플란트 제거, 뼈이식, 재식립 등 단계별 비용이 발생합니다. 상담 시 정확한 견적을 안내드립니다.' }
    ]
  },
  {
    slug: 'implant-holiday',
    title: '공휴일 수술',
    shortTitle: '공휴일 수술',
    metaTitle: '천안 공휴일 임플란트 | 365일·야간 수술 — 서울비디치과',
    metaDesc: '천안 공휴일 임플란트 수술 — 일요일·공휴일·야간(20시)까지 수술 가능. 365일 운영, 당일 응급 대응. ☎041-415-2892',
    keywords: '공휴일 임플란트, 일요일 임플란트, 야간 임플란트, 365일 치과',
    icon: 'fa-calendar-alt',
    heroSub: '바쁜 일정? 365일, 야간까지 수술합니다',
    heroDesc: '일요일, 공휴일에도 임플란트 수술이 가능합니다. 평일 20시까지 야간 진료, 당일 응급 수술도 대응합니다.',
    features: [
      { icon: 'fa-calendar-check', title: '365일 수술 운영', desc: '연중무휴로 임플란트 수술을 진행합니다. 명절에도 응급 대응이 가능합니다.' },
      { icon: 'fa-moon', title: '평일 야간 진료', desc: '평일 20시까지 진료하여 퇴근 후에도 내원 가능합니다.' },
      { icon: 'fa-calendar-day', title: '주말·공휴일 수술', desc: '토요일·일요일·공휴일에도 수술을 진행합니다. 직장인분들도 편하게 일정을 잡으세요.' },
      { icon: 'fa-ambulance', title: '당일 응급 수술', desc: '급성 통증, 임플란트 탈락 등 응급 상황 시 당일 수술 대응이 가능합니다.' }
    ],
    process: ['전화/온라인 예약', '원하는 날짜·시간 선택', '사전 CT 촬영 및 상담', '수술 진행', '사후 관리 안내', '정기 검진 스케줄'],
    recommend: '바쁜 직장인, 주말만 가능한 분, 응급 수술 필요',
    faqs: [
      { q: '일요일에도 정말 수술이 가능한가요?', a: '네, 가능합니다. 일요일·공휴일에도 전문의가 상주하며 수술을 진행합니다.' },
      { q: '야간 수술도 가능한가요?', a: '평일 20시까지 진료하므로 저녁 시간 수술 예약이 가능합니다. 예약 시 문의해주세요.' },
      { q: '공휴일 수술 비용이 추가되나요?', a: '공휴일이라고 추가 비용이 발생하지 않습니다. 동일한 비용으로 수술받으실 수 있습니다.' }
    ]
  },
  {
    slug: 'implant-sinus-lift',
    title: '상악동거상술',
    shortTitle: '상악동거상술',
    metaTitle: '천안 상악동거상술 | 윗잇몸 뼈 보강 전문 — 서울비디치과',
    metaDesc: '천안 상악동거상술 — 윗잇몸뼈 부족 시 상악동 공간에 뼈 보강 후 임플란트 식립. 측방·수직 접근법, CT 정밀 분석 ☎041-415-2892',
    keywords: '상악동거상술, 상악동 리프트, 사이너스 리프트, 윗잇몸 임플란트',
    icon: 'fa-layer-group',
    heroSub: '위턱 뼈가 부족해도 임플란트가 가능합니다',
    heroDesc: '상악동(부비강) 아래쪽 뼈가 부족할 때, 상악동 막을 들어올리고 그 공간에 뼈를 채워 임플란트 식립 기반을 만드는 수술입니다.',
    features: [
      { icon: 'fa-arrows-alt-v', title: '측방·수직 접근법', desc: '뼈 부족 정도에 따라 측방(직접) 또는 수직(간접) 접근법을 선택합니다.' },
      { icon: 'fa-bone', title: '자가골·합성골 이식', desc: '환자 상태에 맞는 최적의 골이식재를 선택하여 뼈를 보강합니다.' },
      { icon: 'fa-bolt', title: '임플란트 동시 식립 가능', desc: '잔존 뼈가 5mm 이상이면 상악동거상술과 임플란트를 동시에 진행할 수 있습니다.' },
      { icon: 'fa-x-ray', title: 'CT 정밀 사전 분석', desc: '3D CT로 상악동 형태, 중격, 막 두께를 정밀 분석하여 안전한 수술을 계획합니다.' }
    ],
    process: ['3D CT 정밀 분석', '상악동 형태 평가', '접근법 결정 (측방/수직)', '상악동 막 거상', '골이식재 충전', '임플란트 식립 (동시 또는 분리)'],
    recommend: '상악 뼈 부족, 오래된 발치 부위, 위턱 어금니 임플란트',
    faqs: [
      { q: '상악동거상술이 위험하지 않나요?', a: '숙련된 전문의가 시행하면 매우 안전한 수술입니다. CT 정밀 분석으로 상악동 막 천공을 예방합니다.' },
      { q: '수술 후 코에 문제가 생기지 않나요?', a: '상악동 막을 조심스럽게 거상하므로 코에 영향을 주지 않습니다. 단, 수술 후 1~2주간 코를 세게 풀지 않도록 주의합니다.' },
      { q: '상악동거상술 후 바로 임플란트가 되나요?', a: '잔존 뼈 높이에 따라 다릅니다. 5mm 이상이면 동시 진행, 그 미만이면 4~6개월 골유착 후 식립합니다.' }
    ]
  },
  {
    slug: 'implant-immediate',
    title: '발치즉시 임플란트',
    shortTitle: '발치즉시',
    metaTitle: '천안 발치즉시 임플란트 | 당일 발치+식립 — 서울비디치과',
    metaDesc: '천안 발치즉시 임플란트 — 발치와 동시에 당일 식립. 내원 횟수 최소화, 잇몸뼈 흡수 방지, 심미성 극대화 ☎041-415-2892',
    keywords: '발치즉시 임플란트, 즉시 식립, 당일 임플란트, 발치 동시 임플란트',
    icon: 'fa-bolt',
    heroSub: '발치와 동시에, 기다림 없이 바로 식립',
    heroDesc: '치아를 발치하면서 동시에 임플란트를 식립합니다. 별도의 치유 기간 없이 한 번의 수술로 진행하여 전체 치료 기간을 획기적으로 줄입니다.',
    features: [
      { icon: 'fa-bolt', title: '발치 당일 식립', desc: '발치와 동시에 임플란트를 식립하여 추가 수술 없이 한 번에 진행합니다.' },
      { icon: 'fa-calendar-minus', title: '내원 횟수 최소화', desc: '발치와 식립을 분리하면 최소 2번 이상 수술이 필요하지만, 즉시 식립은 1번으로 끝납니다.' },
      { icon: 'fa-bone', title: '잇몸뼈 흡수 방지', desc: '발치 후 빈 공간에 바로 임플란트가 들어가 뼈 흡수를 최소화합니다.' },
      { icon: 'fa-smile', title: '심미성 극대화', desc: '잇몸 라인이 살아있는 상태에서 식립하므로 자연스러운 잇몸 형태를 유지합니다.' }
    ],
    process: ['CT 촬영 및 사전 계획', '안전한 발치', '발치 부위 정리', '즉시 임플란트 식립', '뼈이식 (필요 시)', '치유지대주 장착'],
    recommend: '발치 예정, 빠른 복원 희망, 앞니 부위, 심미 중시',
    faqs: [
      { q: '모든 발치 부위에 즉시 식립이 가능한가요?', a: '발치 부위 감염이 없고 뼈 상태가 양호한 경우 가능합니다. CT 분석 후 정확한 판단을 드립니다.' },
      { q: '발치즉시 임플란트의 성공률은?', a: '적절한 케이스 선정 시 일반 임플란트와 동일한 95~98% 성공률을 보입니다.' },
      { q: '앞니에도 가능한가요?', a: '네, 특히 앞니 부위에서 심미적 장점이 큽니다. 잇몸 라인을 유지하면서 자연스러운 결과를 얻을 수 있습니다.' }
    ]
  },
  {
    slug: 'implant-immediate-loading',
    title: '즉시 로딩 임플란트',
    shortTitle: '즉시 로딩',
    metaTitle: '천안 즉시 로딩 임플란트 | 당일 임시치아 — 서울비디치과',
    metaDesc: '천안 즉시 로딩 임플란트 — 식립 당일 임시 치아 장착. 빈 치아 기간 없이 바로 일상 복귀. 앞니 부위 특히 적합 ☎041-415-2892',
    keywords: '즉시 로딩 임플란트, 당일 치아, 즉시 하중, 임시 치아',
    icon: 'fa-magic',
    heroSub: '식립 당일, 치아가 생깁니다',
    heroDesc: '임플란트 식립 직후 임시 치아를 바로 장착합니다. 빈 치아 없이 바로 일상으로 돌아갈 수 있어, 대인 업무가 많은 분께 특히 적합합니다.',
    features: [
      { icon: 'fa-magic', title: '당일 임시 치아 장착', desc: '식립 직후 맞춤 임시 치아를 바로 장착하여 빈 치아 기간이 없습니다.' },
      { icon: 'fa-smile-beam', title: '빈 치아 걱정 없음', desc: '식립 당일부터 치아가 있으므로 말하기, 미소 짓기에 불편이 없습니다.' },
      { icon: 'fa-eye', title: '심미·기능 즉시 회복', desc: '외관상 자연스럽고, 가벼운 식사도 바로 가능합니다.' },
      { icon: 'fa-tooth', title: '앞니 부위 특히 적합', desc: '사회생활에 지장 없이 앞니 임플란트를 진행할 수 있습니다.' }
    ],
    process: ['CT 촬영 및 적합성 평가', '식립 전 임시 치아 제작', '임플란트 식립', '즉시 임시 치아 장착', '골유착 기간 (2~4개월)', '최종 보철물 장착'],
    recommend: '앞니 부위, 대인 업무 많은 분, 심미 중시, 빈 치아 거부감',
    faqs: [
      { q: '즉시 로딩 임시 치아로 식사가 가능한가요?', a: '부드러운 음식은 가능하지만, 단단한 음식은 골유착 완료 후 최종 보철물 장착 후에 드시는 것이 좋습니다.' },
      { q: '즉시 로딩이 일반 임플란트보다 좋은 건가요?', a: '심미성과 편의성 면에서 우수하지만, 뼈 상태가 양호해야 적용 가능합니다. 상담 시 최적의 방법을 안내드립니다.' },
      { q: '앞니 외 어금니에도 가능한가요?', a: '가능하지만, 어금니는 저작력이 강하므로 뼈 상태가 매우 양호한 경우에 적용합니다.' }
    ]
  },
  {
    slug: 'implant-hybrid',
    title: '하이브리드 임플란트(올온4/올온6)',
    shortTitle: '올온4·올온6',
    metaTitle: '천안 올온4 올온6 임플란트 | 전악 복원 전문 — 서울비디치과',
    metaDesc: '천안 올온4·올온6 하이브리드 임플란트 — 4~6개 임플란트로 전체 치아 복원. 당일 임시 보철, 뼈이식 최소화 ☎041-415-2892',
    keywords: '올온4, 올온6, All-on-4, 하이브리드 임플란트, 전악 임플란트',
    icon: 'fa-project-diagram',
    heroSub: '4~6개로 전체를, 하이브리드가 답입니다',
    heroDesc: '4~6개의 임플란트만으로 상악 또는 하악 전체 치아를 고정형 보철로 복원합니다. 틀니에서 벗어나 자연치아처럼 먹고, 웃고, 생활하세요.',
    features: [
      { icon: 'fa-project-diagram', title: 'All-on-4 / All-on-6', desc: '4개(하악) 또는 6개(상악)의 임플란트로 전체 12~14개 치아를 지지합니다.' },
      { icon: 'fa-compress-arrows-alt', title: '최소 임플란트로 전악 복원', desc: '개별 임플란트 10개 이상 필요했던 것을 4~6개로 줄여 비용과 수술 부담을 최소화합니다.' },
      { icon: 'fa-clock', title: '당일 임시 보철 가능', desc: '수술 당일 임시 고정 보철을 장착하여 빈 치아 기간 없이 생활할 수 있습니다.' },
      { icon: 'fa-bone', title: '뼈이식 최소화', desc: '경사 식립 기법으로 뼈가 부족한 부위도 뼈이식 없이 또는 최소 뼈이식으로 진행합니다.' }
    ],
    process: ['종합 구강 검사 및 CT', '디지털 치료 계획 수립', '발치 (필요 시)', '4~6개 임플란트 식립', '당일 임시 고정 보철 장착', '4~6개월 후 최종 보철'],
    recommend: '전악 재건, 다수 치아 상실, 틀니 탈출, 전악 고정 보철 희망',
    faqs: [
      { q: 'All-on-4와 All-on-6의 차이는?', a: 'All-on-4는 4개, All-on-6는 6개의 임플란트를 사용합니다. 뼈 상태에 따라 6개가 더 안정적일 수 있으며, 상담 시 최적의 개수를 안내드립니다.' },
      { q: '틀니보다 정말 좋은가요?', a: '네, 고정형이라 빠지지 않고, 저작력이 틀니 대비 3배 이상입니다. 말하기, 먹기, 웃기 모두 자연치아에 가깝습니다.' },
      { q: '올온4 수술이 하루에 끝나나요?', a: '식립은 하루에 완료되며, 당일 임시 보철도 장착됩니다. 최종 보철은 4~6개월 후 제작합니다.' }
    ]
  },
  {
    slug: 'implant-overdenture',
    title: '임플란트 틀니(오버덴처)',
    shortTitle: '오버덴처',
    metaTitle: '천안 임플란트 틀니(오버덴처) | 안정적 틀니 — 서울비디치과',
    metaDesc: '천안 임플란트 틀니(오버덴처) — 2~4개 임플란트로 틀니 고정. 빠지지 않는 안정적 틀니, 비용 효율적 선택 ☎041-415-2892',
    keywords: '오버덴처, 임플란트 틀니, 임플란트 의치, 고정식 틀니',
    icon: 'fa-hand-holding-medical',
    heroSub: '빠지지 않는 틀니, 임플란트가 잡아줍니다',
    heroDesc: '2~4개의 임플란트로 틀니를 단단히 고정합니다. 틀니가 움직이지 않아 식사와 대화가 편안해지며, 탈착이 가능해 관리도 쉽습니다.',
    features: [
      { icon: 'fa-lock', title: '2~4개 임플란트 고정', desc: '2~4개의 임플란트에 특수 연결 장치를 부착하여 틀니를 단단히 고정합니다.' },
      { icon: 'fa-hand-holding', title: '탈착식 편리한 관리', desc: '환자가 직접 착탈이 가능하여 청소와 관리가 간편합니다.' },
      { icon: 'fa-utensils', title: '틀니 흔들림 완전 해소', desc: '임플란트가 틀니를 잡아주므로 식사, 말하기 중 빠질 걱정이 없습니다.' },
      { icon: 'fa-coins', title: '비용 효율적 선택', desc: '고정형 전악 보철 대비 비용이 낮으면서도 안정적인 결과를 제공합니다.' }
    ],
    process: ['구강 검사 및 상담', '2~4개 임플란트 식립', '골유착 대기 (2~3개월)', '어태치먼트 장착', '맞춤 틀니 제작', '장착 및 조정'],
    recommend: '틀니 불편, 고령자, 경제적 전악 복원, 전악 고정 부담되는 분',
    faqs: [
      { q: '기존 틀니와 어떻게 다른가요?', a: '일반 틀니는 잇몸에 올려놓는 방식이라 움직이지만, 오버덴처는 임플란트가 잡아주어 움직이지 않습니다.' },
      { q: '관리가 어렵지 않나요?', a: '오히려 쉽습니다. 틀니를 빼서 씻을 수 있어 위생 관리가 간편합니다. 임플란트 부위만 잘 관리하면 됩니다.' },
      { q: '올온4와 오버덴처 중 뭐가 좋나요?', a: '올온4는 고정형으로 더 강한 저작력을, 오버덴처는 경제적이고 관리가 쉽습니다. 환자 상태와 예산에 따라 추천드립니다.' }
    ]
  },
  {
    slug: 'implant-full-mouth',
    title: '전체 임플란트',
    shortTitle: '전체 임플란트',
    metaTitle: '천안 전체 임플란트 | 상·하악 전악 복원 — 서울비디치과',
    metaDesc: '천안 전체 임플란트 — 상·하악 전체 치아를 임플란트로 복원. 자연치아급 저작력, 맞춤형 치료 계획 수립 ☎041-415-2892',
    keywords: '전체 임플란트, 전악 임플란트, 전악 복원, 풀마우스 임플란트',
    icon: 'fa-teeth',
    heroSub: '모든 치아를 되찾는 완전한 복원',
    heroDesc: '상·하악 전체 치아를 임플란트로 복원합니다. 개별 식립, 올온4/6, 오버덴처 등 환자 상태에 맞는 최적의 방법을 제안합니다.',
    features: [
      { icon: 'fa-teeth', title: '상·하악 전체 복원', desc: '상악, 하악 또는 양악 전체를 임플란트 기반으로 완전히 복원합니다.' },
      { icon: 'fa-utensils', title: '자연치아급 저작력', desc: '고정형 보철로 자연 치아의 80~90% 수준의 저작력을 회복합니다.' },
      { icon: 'fa-clipboard-list', title: '맞춤형 치료 계획', desc: '개별 식립, 올온4, 올온6, 오버덴처 중 최적의 방법을 조합하여 계획합니다.' },
      { icon: 'fa-tasks', title: '단계별 식립 가능', desc: '한 번에 모두 식립하거나, 상황에 따라 단계별로 나누어 진행할 수 있습니다.' }
    ],
    process: ['종합 구강·전신 건강 평가', '3D CT 정밀 분석', '맞춤형 치료 계획 수립', '단계별 식립 수술', '임시 보철 장착', '최종 고정 보철 완성'],
    recommend: '전체 치아 상실, 틀니 거부감, 완전 복원 희망, 삶의 질 개선',
    faqs: [
      { q: '전체 임플란트 비용은 얼마인가요?', a: '식립 방법(개별, 올온4, 올온6 등)과 보철 재료에 따라 크게 달라집니다. 상담 시 맞춤 견적을 안내드리며 무이자 할부도 가능합니다.' },
      { q: '전체 임플란트 기간은 얼마나 걸리나요?', a: '방법에 따라 4~12개월 정도 소요됩니다. 올온4의 경우 당일 임시 보철 장착이 가능합니다.' },
      { q: '나이가 많아도 가능한가요?', a: '네, 전신 건강 상태가 양호하면 나이에 관계없이 가능합니다. 수면 마취로 편안하게 진행할 수도 있습니다.' }
    ]
  }
];

// 공통 헤더 (GTM, GA4, 메타픽셀, Amplitude)
function getHead(type) {
  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<!-- End Google Tag Manager -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3NQP355YQM"></script>
<script src="https://cdn.amplitude.com/script/87529341cb075dcdbefabce3994958aa.js"></script>
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '971255062435276');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=971255062435276&ev=PageView&noscript=1"
/></noscript>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${type.metaTitle}</title>
  <meta name="description" content="${type.metaDesc}">
  <meta name="keywords" content="${type.keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/${type.slug}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${type.metaTitle}">
  <meta property="og:description" content="${type.metaDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/${type.slug}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-implant.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${type.metaTitle}">
  <meta name="twitter:description" content="${type.metaDesc}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-implant.jpg">
  <link rel="icon" type="image/svg+xml" href="../images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="../manifest.json">
  <meta name="theme-color" content="#6B4226">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="../css/site-v5.css?v=b413d3a5">`;
}

// Schema.org JSON-LD
function getSchema(type) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": type.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://bdbddc.com/" },
      { "@type": "ListItem", "position": 2, "name": "임플란트", "item": "https://bdbddc.com/treatments/implant" },
      { "@type": "ListItem", "position": 3, "name": type.title, "item": `https://bdbddc.com/treatments/${type.slug}` }
    ]
  };
  const medicalProc = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": type.title,
    "description": type.heroDesc,
    "procedureType": "https://schema.org/SurgicalProcedure",
    "body": { "@type": "AnatomicalStructure", "name": "치아·잇몸뼈" },
    "howPerformed": type.process.join(' → '),
    "provider": {
      "@type": "Dentist",
      "name": "서울비디치과",
      "telephone": "+82-41-415-2892",
      "address": { "@type": "PostalAddress", "addressLocality": "천안시", "addressRegion": "충청남도", "addressCountry": "KR" }
    }
  };
  return `
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(medicalProc)}</script>`;
}

// 네비게이션 (메인 implant.html과 동일)
function getNav() {
  return `
  <header class="site-header" id="siteHeader">
    <div class="header-container">
      <div class="header-brand">
        <a href="../" class="site-logo" aria-label="서울비디치과 홈"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a>
        <div class="clinic-status open" aria-live="polite"><span class="status-dot"></span><span class="status-text">진료중</span><span class="status-time">20:00까지</span></div>
      </div>
      <nav class="main-nav" id="mainNav" aria-label="메인 네비게이션">
        <ul>
          <li class="nav-item has-dropdown">
            <a href="/treatments/">진료</a>
            <div class="mega-dropdown"><div class="mega-dropdown-grid">
              <div class="mega-dropdown-section"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/glownate">✨ 글로우네이트 <span class="badge badge-hot">HOT</span></a></li><li><a href="/treatments/implant">임플란트 <span class="badge">6개 수술실</span></a></li><li><a href="/treatments/invisalign">인비절라인 <span class="badge">다이아몬드</span></a></li><li><a href="/treatments/orthodontics">치아교정 <span class="badge badge-hot">NEW</span></a></li><li><a href="/treatments/pediatric">소아치과 <span class="badge">전문의 3인</span></a></li><li><a href="/treatments/aesthetic">심미레진</a></li></ul></div>
              <div class="mega-dropdown-section"><strong class="section-heading">일반/보존 진료</strong><ul><li><a href="/treatments/cavity">충치치료</a></li><li><a href="/treatments/resin">레진치료</a></li><li><a href="/treatments/crown">크라운</a></li><li><a href="/treatments/inlay">인레이/온레이</a></li><li><a href="/treatments/root-canal">신경치료</a></li><li><a href="/treatments/whitening">미백</a></li></ul></div>
              <div class="mega-dropdown-section"><strong class="section-heading">잇몸/외과</strong><ul><li><a href="/treatments/scaling">스케일링</a></li><li><a href="/treatments/gum">잇몸치료</a></li><li><a href="/treatments/periodontitis">치주염</a></li><li><a href="/treatments/wisdom-tooth">사랑니 발치</a></li><li><a href="/treatments/tmj">턱관절장애</a></li><li><a href="/treatments/bruxism">이갈이/이악물기</a></li></ul></div>
            </div></div>
          </li>
          <li class="nav-item has-dropdown"><a href="/doctors/">의료진</a><ul class="simple-dropdown"><li><a href="/doctors/">전체 의료진</a></li><li><a href="/doctors/moon">문석준 대표원장</a></li></ul></li>
          <li class="nav-item"><a href="/reviews/">후기</a></li>
          <li class="nav-item"><a href="/faq">FAQ</a></li>
          <li class="nav-item"><a href="/directions">오시는 길</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="tel:041-415-2892" class="header-phone" aria-label="전화"><i class="fas fa-phone"></i></a>
        <a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약</a>
      </div>
    </div>
  </header>
  <div class="header-spacer"></div>`;
}

// 푸터
function getFooter() {
  return `
  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand"><a href="../" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p></div>
        <div class="footer-links">
          <div class="footer-col"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/implant">임플란트센터</a></li><li><a href="/treatments/invisalign">인비절라인</a></li><li><a href="/treatments/orthodontics">치아교정</a></li><li><a href="/treatments/pediatric">소아치과</a></li><li><a href="/treatments/glownate">심미레진</a></li></ul></div>
          <div class="footer-col"><strong class="section-heading">병원 안내</strong><ul><li><a href="/doctors/">의료진</a></li><li><a href="/mission">비디미션</a></li><li><a href="/floor-guide">비디치과 둘러보기</a></li><li><a href="/cases/gallery">Before/After</a></li><li><a href="/column/">원장 컬럼</a></li></ul></div>
          <div class="footer-col"><strong class="section-heading">고객 지원</strong><ul><li><a href="/reservation">예약/상담</a></li><li><a href="../blog/">블로그/콘텐츠</a></li><li><a href="/faq">자주 묻는 질문</a></li><li><a href="/directions">오시는 길</a></li></ul></div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-info">
          <p><strong>서울비디치과의원</strong> | 대표원장: 문석준 | 사업자등록번호: 312-29-72180</p>
          <p>충남 천안시 동남구 만남로 38, 비디메디컬빌딩 2~6F | ☎ 041-415-2892</p>
          <p>평일 09:00-20:00 | 토·일·공휴일 09:00-17:00 | 365일 진료</p>
        </div>
        <p class="footer-copy">© 2025 서울비디치과의원. All rights reserved.</p>
      </div>
    </div>
  </footer>
  <script src="../js/site-v5.js" defer></script>`;
}

// 메인 콘텐츠 생성
function getContent(type) {
  const featuresHTML = type.features.map(f => `
          <div class="why-card">
            <div class="why-card-icon"><i class="fas ${f.icon}"></i></div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
          </div>`).join('');

  const processHTML = type.process.map((step, i) => `
            <div class="floor-item">
              <div class="floor-number">0${i+1}</div>
              <div class="floor-info"><h4>${step}</h4></div>
            </div>`).join('');

  const faqsHTML = type.faqs.map((f, i) => `
          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-${i}">
              <span class="faq-q-badge">Q</span>
              <span class="faq-q-text">${f.q}</span>
              <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="faq-answer" id="faq-${i}" role="region"><p>${f.a}</p></div>
          </div>`).join('');

  // 다른 임플란트 종류 카드 (현재 제외한 최대 5개)
  const otherTypes = implantTypes.filter(t => t.slug !== type.slug).slice(0, 6);
  const otherCardsHTML = otherTypes.map(t => `
          <a href="/treatments/${t.slug}" class="type-card">
            <span class="type-card-arrow"><i class="fas fa-arrow-right"></i></span>
            <div class="type-icon"><i class="fas ${t.icon}"></i></div>
            <h3>${t.shortTitle}</h3>
            <p>${t.heroSub}</p>
          </a>`).join('');

  return `
  <main id="main-content">
    <!-- Breadcrumb -->
    <div style="padding:12px 0;background:var(--gray-50);">
      <div class="container">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:var(--text-tertiary);">
          <a href="/" style="color:var(--text-secondary);">홈</a>
          <span style="margin:0 6px;">›</span>
          <a href="/treatments/implant" style="color:var(--text-secondary);">임플란트</a>
          <span style="margin:0 6px;">›</span>
          <span style="color:var(--brand);font-weight:600;">${type.title}</span>
        </nav>
      </div>
    </div>

    <!-- Hero -->
    <section class="hero" style="min-height:auto;padding:var(--space-4xl) 0 var(--space-3xl);">
      <div class="hero-bg-pattern"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <p class="hero-brand-name">서울비디치과 임플란트센터</p>
            <h1 class="hero-headline" style="font-size:var(--fs-h1);">${type.title}</h1>
            <p class="hero-sub">${type.heroSub}</p>
            <p style="font-size:1rem;color:var(--text-secondary);line-height:1.7;max-width:600px;margin-bottom:var(--space-xl);">${type.heroDesc}</p>
            <div class="hero-cta-group">
              <a href="/reservation" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
              <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 특징 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2><span class="text-gradient">${type.title}</span>의 특징</h2>
          <p class="section-subtitle">서울비디치과가 자신 있게 제안하는 이유</p>
        </div>
        <div class="why-grid" style="grid-template-columns:repeat(2,1fr);">
${featuresHTML}
        </div>
      </div>
    </section>

    <!-- 추천 대상 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>이런 분께 <span class="text-gradient">추천</span>합니다</h2>
        </div>
        <div style="max-width:600px;margin:0 auto;padding:32px;background:var(--white);border:1px solid var(--border-color);border-radius:var(--radius-xl);">
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
            ${type.recommend.split(', ').map(r => `<span style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(107,66,38,0.06);border-radius:var(--radius-full);font-weight:600;color:var(--brand);font-size:0.95rem;"><i class="fas fa-check-circle" style="color:var(--brand-gold);"></i>${r}</span>`).join('\n            ')}
          </div>
        </div>
      </div>
    </section>

    <!-- 치료 과정 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>치료 <span class="text-gradient">과정</span></h2>
          <p class="section-subtitle">체계적인 단계를 거쳐 진행됩니다</p>
        </div>
        <div class="floor-stack">
${processHTML}
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>자주 묻는 <span class="text-gradient">질문</span></h2>
        </div>
        <div class="faq-list" style="max-width:800px;margin:0 auto;">
${faqsHTML}
        </div>
      </div>
    </section>

    <!-- 다른 임플란트 종류 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>다른 <span class="text-gradient">임플란트 종류</span></h2>
          <p class="section-subtitle">환자 상태에 맞는 최적의 방법을 찾아보세요</p>
        </div>
        <div class="type-grid" style="grid-template-columns:repeat(3,1fr);">
${otherCardsHTML}
        </div>
        <p class="type-grid-hint"><i class="fas fa-hand-pointer"></i> 카드를 눌러 자세한 내용을 확인하세요</p>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <span class="cta-badge">상담 안내</span>
          <h2>${type.title}, 경험이 결과를 만듭니다</h2>
          <p>궁금한 점이 있으시면 부담 없이 상담 예약해주세요.</p>
          <div class="cta-buttons">
            <a href="/reservation" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
            <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
          </div>
          <p class="cta-phone"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
        </div>
      </div>
    </section>

    <!-- 법적 고지 -->
    <section class="section-sm">
      <div class="container">
        <div class="legal-box">*본 정보는 의료법 및 의료광고 심의 기준을 준수하며, 개인에 따라 결과가 다를 수 있습니다. 반드시 전문의와 상담 후 결정하시기 바랍니다.</div>
      </div>
    </section>
  </main>`;
}

// 페이지 생성
let count = 0;
for (const type of implantTypes) {
  const html = `${getHead(type)}
${getSchema(type)}
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
${getNav()}
${getContent(type)}
${getFooter()}
</body>
</html>`;

  const filePath = path.join(outputDir, `${type.slug}.html`);
  fs.writeFileSync(filePath, html, 'utf-8');
  const sizeKB = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
  console.log(`✅ CREATED: treatments/${type.slug}.html (${type.faqs.length} FAQs, ${sizeKB}KB)`);
  count++;
}

console.log(`\n📊 결과: ${count}개 임플란트 세부 페이지 생성 완료`);
