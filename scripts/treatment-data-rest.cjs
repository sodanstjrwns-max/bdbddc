/**
 * 나머지 21개 페이지 데이터
 * rebuild-all-treatments.cjs 에서 require()로 로드
 */

function getNav(file) {
  const NAV_ORDER = [
    { file: 'glownate.html', title: '글로우네이트' },
    { file: 'implant.html', title: '임플란트' },
    { file: 'invisalign.html', title: '치아교정' },
    { file: 'pediatric.html', title: '소아치과' },
    { file: 'aesthetic.html', title: '심미치료' },
    { file: 'cavity.html', title: '충치치료' },
    { file: 'resin.html', title: '레진치료' },
    { file: 'crown.html', title: '크라운' },
    { file: 'inlay.html', title: '인레이/온레이' },
    { file: 'root-canal.html', title: '신경치료' },
    { file: 'whitening.html', title: '미백' },
    { file: 'bridge.html', title: '브릿지' },
    { file: 'denture.html', title: '틀니' },
    { file: 're-root-canal.html', title: '재신경치료' },
    { file: 'apicoectomy.html', title: '치근단절제술' },
    { file: 'scaling.html', title: '스케일링' },
    { file: 'gum.html', title: '잇몸치료' },
    { file: 'gum-surgery.html', title: '잇몸수술' },
    { file: 'periodontitis.html', title: '치주염' },
    { file: 'wisdom-tooth.html', title: '사랑니 발치' },
    { file: 'emergency.html', title: '응급진료' },
    { file: 'tmj.html', title: '턱관절장애' },
    { file: 'bruxism.html', title: '이갈이/이악물기' },
    { file: 'prevention.html', title: '예방치료' },
  ];
  const idx = NAV_ORDER.findIndex(n => n.file === file);
  return {
    prevPage: idx > 0 ? NAV_ORDER[idx - 1] : null,
    nextPage: idx < NAV_ORDER.length - 1 ? NAV_ORDER[idx + 1] : null,
  };
}

const pages = [];

// ═══ 4. 소아치과 ═══
pages.push({
  file: 'pediatric.html', title: '소아치과',
  metaDesc: '서울비디치과 소아치과 — 소아치과 전문의 3인 상주, 아이 맞춤 진료 — 우리 아이 치아 건강의 시작',
  keywords: '천안 소아치과, 서울비디치과 소아치과, 어린이 치과',
  badgeIcon: 'fas fa-child', badgeText: '전문센터',
  heroH1: '우리 아이 <span class="text-gradient">치아 건강</span>의 시작',
  heroDesc: '소아치과 전문의 3인이 상주하여 아이의 성장 단계에 맞는 맞춤 진료를 제공합니다. 치과가 무섭지 않은 경험을 선물합니다.',
  heroStats: [{ value: '전문의 3인', label: '소아치과 전문' }, { value: '아이 맞춤', label: '행동 유도' }, { value: '365일', label: '진료 가능' }],
  concernCards: [
    { icon: 'fas fa-tooth', title: '유치 충치가 있어요', desc: '유치 충치를 방치하면 영구치에 영향을 줄 수 있습니다. 조기 치료가 중요합니다.' },
    { icon: 'fas fa-meh', title: '치과를 무서워해요', desc: '전문 행동 유도 기법으로 아이가 편안하게 치료받을 수 있도록 합니다.' },
    { icon: 'fas fa-teeth', title: '치아 배열이 걱정돼요', desc: '성장기 교정 적기를 놓치지 않도록 정기 검진을 권장합니다.' },
  ],
  concernCardsTitle: '우리 아이, 혹시 이런 <span class="text-gradient">걱정</span>이 있으신가요?',
  concernCardsSub: '소아치과 전문의가 해결해 드리겠습니다',
  typeCards: [
    { icon: 'fas fa-shield-alt', title: '실란트', desc: '어금니 씹는 면의 홈을 메워 충치를 예방합니다. 영구치가 나오면 바로 하는 것이 좋습니다.', features: ['통증 없는 시술', '충치 예방 효과 90%+', '건강보험 적용 (만 18세 이하)', '5분 내 시술 완료'], recommend: '6세 이상 영구 어금니' },
    { icon: 'fas fa-atom', title: '불소 도포', desc: '치아 표면을 강화하여 충치 발생을 예방합니다. 3~6개월마다 정기적으로 받으면 효과적입니다.', features: ['무통 시술', '치아 법랑질 강화', '초기 충치 진행 억제', '정기적 도포 권장'], recommend: '충치 위험이 높은 아이' },
    { icon: 'fas fa-fill-drip', title: '유치 충치 치료', desc: '유치 충치를 치아 색 레진으로 자연스럽게 치료합니다. 아이 맞춤 행동 유도로 편안한 치료를 제공합니다.', features: ['치아색 레진 사용', '행동 유도 기법', '통증 최소화', '빠른 치료 완료'], recommend: '유치 충치가 있는 아이' },
    { icon: 'fas fa-teeth-open', title: '성장기 교정', desc: '성장기에 맞춰 올바른 치아 배열과 턱 성장을 유도합니다. 적절한 시기가 중요합니다.', features: ['성장기 턱 교정', '공간 유지 장치', '교정 적기 판단', '교정과 전문의 협진'], recommend: '부정교합이 우려되는 아이' },
  ],
  typeTitle: '소아치과 <span class="text-gradient">주요 진료</span>',
  typeSub: '아이의 성장 단계에 맞는 맞춤 진료',
  diffs: [
    { title: '소아치과 전문의 3인', desc: '소아치과 전문의 3인이 상주합니다. 아이의 행동과 심리를 이해하는 전문 진료를 제공합니다.' },
    { title: '아이 맞춤 행동 유도', desc: 'Tell-Show-Do 기법으로 아이가 치과를 무서워하지 않도록 합니다. 긍정적인 경험을 만들어 줍니다.' },
    { title: '성장 맞춤 치료 계획', desc: '아이의 성장 단계를 고려한 장기적 치료 계획을 수립합니다. 교정 적기도 함께 판단합니다.' },
    { title: '부모 동반 진료', desc: '보호자가 함께 진료실에 들어올 수 있습니다. 치료 과정을 직접 보시고 안심하세요.' },
  ],
  diffTitle: '서울비디 <span class="text-gradient">소아치과</span>가 다른 이유',
  diffSub: '아이를 위한 전문 진료 시스템',
  faqs: [
    { q: '아이가 치과를 너무 무서워해요. 어떻게 하나요?', a: '소아치과 전문의가 아이의 심리를 이해하고 단계적 행동 유도(Tell-Show-Do)로 공포감을 줄여줍니다. 첫 방문에는 환경 적응부터 시작합니다.' },
    { q: '유치 충치도 꼭 치료해야 하나요?', a: '네, 반드시 치료해야 합니다. 유치 충치를 방치하면 영구치 형성에 영향을 주고, 씹기 기능과 발음 발달에 문제가 생길 수 있습니다.' },
    { q: '실란트는 언제 하는 것이 좋나요?', a: '첫 번째 영구 어금니가 나오는 만 6세경에 하는 것이 좋습니다. 두 번째 영구 어금니가 나오는 만 12세경에도 추가로 해주세요.' },
    { q: '교정은 몇 살부터 가능한가요?', a: '일반적으로 만 7세 전후에 첫 교정 상담을 권장합니다. 성장기 턱 교정은 이 시기에 시작하는 것이 효과적입니다.' },
    { q: '불소 도포는 얼마나 자주 해야 하나요?', a: '3~6개월마다 정기적으로 하는 것이 좋습니다. 충치 위험이 높은 아이는 3개월마다 권장합니다.' },
  ],
  ctaH2: '우리 아이 치아 건강, 지금 시작하세요',
  ctaDesc: '소아치과 전문의 3인이 아이에게 맞는 치료를 제안해드립니다.',
  ...getNav('pediatric.html'),
});

// ═══ 5. 심미치료 ═══
pages.push({
  file: 'aesthetic.html', title: '심미치료',
  metaDesc: '서울비디치과 심미치료 — 라미네이트, 올세라믹, 잇몸성형 등 자연스러운 아름다움을 완성합니다',
  keywords: '천안 심미치료, 서울비디치과 심미치료, 라미네이트, 올세라믹',
  badgeIcon: 'fas fa-gem', badgeText: '전문센터',
  heroH1: '자연스러운 <span class="text-gradient">아름다움</span>을 완성합니다',
  heroDesc: '치아의 색상, 형태, 배열을 아름답게 개선합니다. 원내 기공소에서 프리미엄 보철물을 직접 제작하여 최상의 심미 결과를 만듭니다.',
  typeCards: [
    { icon: 'fas fa-gem', title: '라미네이트', desc: '치아 표면에 얇은 세라믹을 부착하여 색상과 형태를 동시에 개선합니다.', features: ['최소 삭제 (0.3~0.5mm)', '자연스러운 투명감', '변색 없음', '10년+ 수명'], recommend: '변색, 벌어진 치아, 형태 개선' },
    { icon: 'fas fa-crown', title: '올세라믹 크라운', desc: '금속 없는 세라믹 크라운으로 자연 치아와 구분되지 않는 결과를 만듭니다.', features: ['금속 프리', '뛰어난 심미성', '생체 친화적', '높은 내구성'], recommend: '앞니 보철, 심미 크라운' },
    { icon: 'fas fa-cut', title: '잇몸성형', desc: '잇몸 라인을 정돈하여 거미스마일을 개선하고 치아가 더 아름답게 보이도록 합니다.', features: ['레이저 시술', '빠른 회복', '비대칭 개선', '자연스러운 결과'], recommend: '거미스마일, 잇몸 비대칭' },
    { icon: 'fas fa-sun', title: '치아 미백', desc: '전문의가 진행하는 고농도 미백으로 밝고 화사한 치아를 만듭니다.', features: ['전문의 직접 시술', '시린 증상 최소화', '6개월+ 유지', '즉각적 톤 업'], recommend: '누런 치아, 착색' },
  ],
  typeTitle: '<span class="text-gradient">심미치료</span> 프로그램',
  typeSub: '각 시술의 장점을 조합하여 최적의 결과를 만듭니다',
  diffs: [
    { title: '원내 기공소', desc: '충남권 대규모 원내 기공소에서 보철물을 직접 제작합니다. 색상·형태 디테일까지 정밀 컨트롤 가능합니다.' },
    { title: '디지털 스마일 디자인', desc: '디지털 장비로 시술 전 결과를 미리 시뮬레이션하여 환자와 함께 확인합니다.' },
    { title: '보철·심미 전문의 협진', desc: '보철과·심미 전문의가 협진하여 기능과 아름다움을 모두 충족하는 결과를 만듭니다.' },
    { title: '자연스러움 추구', desc: '"했는데 안 한 것 같은" 자연스러운 결과를 목표로 합니다. 과하지 않은 심미 치료를 지향합니다.' },
  ],
  diffTitle: '서울비디 <span class="text-gradient">심미치료</span>의 차이',
  diffSub: '원내 기공소에서 완성하는 프리미엄 심미',
  faqs: [
    { q: '라미네이트와 올세라믹 크라운의 차이는?', a: '라미네이트는 치아 앞면에만 부착하여 삭제량이 적고, 올세라믹 크라운은 치아 전체를 덮어 보호합니다. 치아 상태에 따라 적합한 방법이 다릅니다.' },
    { q: '심미치료 후 관리는 어떻게 하나요?', a: '정기 검진, 올바른 양치, 착색 음식 주의가 기본입니다. 라미네이트는 딱딱한 음식에 주의하고, 미백은 정기적 터치업으로 유지합니다.' },
    { q: '비용은 얼마인가요?', a: '시술 종류와 범위에 따라 다릅니다. 상담 시 정확한 비용을 안내드리며 무이자 할부가 가능합니다.' },
    { q: '통증이 있나요?', a: '국소 마취 하에 진행되므로 시술 중 통증은 없습니다. 시술 후 약간의 불편감이 있을 수 있으나 빠르게 사라집니다.' },
  ],
  ctaH2: '당신의 미소가 달라집니다',
  ctaDesc: '심미치료 상담으로 더 아름다운 미소를 시작하세요.',
  ...getNav('aesthetic.html'),
});

// ═══ 6. 충치치료 ═══
pages.push({
  file: 'cavity.html', title: '충치치료',
  metaDesc: '서울비디치과 충치치료 — 충치의 범위와 깊이에 따라 레진, 인레이, 크라운 등 최적의 치료를 제공합니다',
  keywords: '천안 충치치료, 서울비디치과 충치치료, 레진, 인레이',
  badgeIcon: 'fas fa-tooth', badgeText: '보존치료',
  heroH1: '<span class="text-gradient">충치치료</span>',
  heroDesc: '충치 조기 발견부터 치료까지. 레진, 인레이, 크라운 등 상황에 맞는 최적의 충치치료를 제공합니다.',
  concernCards: [
    { icon: 'fas fa-ice-cream', title: '찬 음식에 시린 느낌', desc: '아이스크림, 찬 음료를 마실 때 치아가 시려오거나 찌릿한 느낌이 드시나요?' },
    { icon: 'fas fa-cookie-bite', title: '단 것에 불편함', desc: '초콜릿이나 사탕을 먹을 때 특정 치아에서 불편함이 느껴지시나요?' },
    { icon: 'fas fa-search', title: '검은 점이 보임', desc: '거울로 볼 때 치아에 검은 점이나 구멍 같은 게 보이시나요?' },
  ],
  concernCardsTitle: '혹시 이런 <span class="text-gradient">증상</span>이 있으신가요?',
  concernCardsSub: '작은 증상도 방치하면 큰 치료로 이어집니다',
  stages: [
    { title: '법랑질 충치 (초기)', label: '경미', labelClass: 'mild', desc: '치아 가장 바깥층인 법랑질에만 충치가 있는 상태입니다. 대부분 증상이 없어 발견이 어렵습니다.', symptoms: ['대부분 무증상', '흰 반점 (탈회)', '검진 시 발견'], treatment: '레진 충전 또는 불소 도포' },
    { title: '상아질 충치 (중기)', label: '주의', labelClass: 'caution', desc: '법랑질을 넘어 상아질까지 진행된 상태입니다. 시린 증상이 나타나기 시작합니다.', symptoms: ['찬 것에 시림', '단 것에 불편감', '검은 점 보임'], treatment: '레진 또는 인레이/온레이' },
    { title: '치수 침범 (심한 충치)', label: '위험', labelClass: 'danger', desc: '충치가 신경(치수)까지 도달한 상태입니다. 심한 통증이 발생합니다.', symptoms: ['자발통', '뜨거운 것에 예민', '밤에 더 심한 통증'], treatment: '신경치료 + 크라운' },
    { title: '치근단 염증 (말기)', label: '심각', labelClass: 'critical', desc: '신경이 괴사하고 치아 뿌리 끝에 염증이나 농양이 생긴 상태입니다.', symptoms: ['잇몸 붓기/고름', '극심한 통증', '얼굴 부종'], treatment: '신경치료 or 발치 + 임플란트' },
  ],
  stageTitle: '충치 <span class="text-gradient">단계별 치료</span>',
  stageSub: '충치의 진행 정도에 따라 치료 방법이 달라집니다',
  treatmentOptions: [
    { icon: 'fas fa-fill-drip', title: '레진 (Resin)', desc: '작은 충치에 적합한 직접 충전 방법입니다. 치아 색과 유사하여 자연스럽고, 당일 치료가 완료됩니다.', tags: ['당일 완료', '자연스러운 색상', '최소 삭제'], link: 'resin.html' },
    { icon: 'fas fa-puzzle-piece', title: '인레이/온레이', desc: '중간~큰 충치에 적합한 간접 수복 방법입니다. 기공소에서 정밀 제작되어 내구성이 뛰어납니다.', tags: ['높은 내구성', '정밀 맞춤', '10년+ 수명'], link: 'inlay.html' },
    { icon: 'fas fa-crown', title: '크라운 (Crown)', desc: '신경치료 후 또는 큰 손상이 있는 치아를 전체적으로 덮어 보호합니다.', tags: ['전체 보호', '파절 방지', '심미성 우수'], link: 'crown.html' },
  ],
  treatmentOptionsTitle: '충치 <span class="text-gradient">수복 방법</span>',
  treatmentOptionsSub: '충치 크기와 위치에 따라 최적의 재료를 선택합니다',
  diffs: [
    { title: '최소 침습 치료', desc: '충치만 정확히 제거하고 건강한 치질은 최대한 보존합니다.' },
    { title: '우식 검지액 사용', desc: '충치 부위만 선택적으로 염색되는 검지액으로 완전 제거를 확인합니다.' },
    { title: '정밀 인상 채득', desc: '인레이, 크라운 제작 시 정밀한 인상으로 수복물이 꼭 맞게 제작됩니다.' },
    { title: '고품질 재료 사용', desc: '검증된 글로벌 브랜드(3M, GC 등)의 레진과 세라믹을 사용합니다.' },
    { title: '치료 후 교합 조정', desc: '수복 후 꼼꼼한 교합 조정으로 씹을 때 불편함이 없도록 합니다.' },
    { title: '정기 검진 시스템', desc: '치료 후 정기 검진으로 2차 충치 발생을 조기에 발견합니다.' },
  ],
  diffTitle: '서울비디 충치치료 <span class="text-gradient">차별점</span>',
  diffSub: '꼼꼼한 진단과 정밀한 치료',
  prevention: [
    { icon: 'fas fa-toothbrush', title: '올바른 양치', desc: '하루 3번, 식후 3분 이내, 3분 이상 양치하세요.' },
    { icon: 'fas fa-wind', title: '치실 & 치간 칫솔', desc: '하루 한 번 치실이나 치간 칫솔로 치아 사이를 청결히 유지하세요.' },
    { icon: 'fas fa-calendar-check', title: '정기 검진 & 스케일링', desc: '6개월마다 검진과 스케일링을 받으세요.' },
    { icon: 'fas fa-atom', title: '불소 활용', desc: '불소 치약 사용, 정기적 불소 도포로 치아를 강화하세요.' },
    { icon: 'fas fa-candy-cane', title: '당분 섭취 줄이기', desc: '당분이 많은 음식과 탄산음료를 줄이세요.' },
    { icon: 'fas fa-child', title: '실란트 (어린이)', desc: '어금니 씹는 면의 홈을 메워 충치를 예방합니다.' },
  ],
  preventionTitle: '충치 <span class="text-gradient">예방법</span>',
  preventionSub: '가장 좋은 치료는 예방입니다',
  faqs: [
    { q: '충치가 아프지 않은데 치료해야 하나요?', a: '네, 반드시 치료해야 합니다. 초기 충치는 통증이 없습니다. 통증이 생기면 이미 신경 근처까지 진행된 상태입니다.' },
    { q: '충치가 저절로 낫나요?', a: '아니요, 충치는 절대 저절로 낫지 않습니다. 한 번 시작되면 계속 진행됩니다.' },
    { q: '충치 치료 비용은 얼마인가요?', a: '레진 5-15만원, 인레이 20-40만원, 크라운 40-70만원 정도입니다. 정확한 비용은 검진 후 안내드립니다.' },
    { q: '레진과 인레이 중 무엇이 좋나요?', a: '충치 크기에 따라 다릅니다. 작은 충치는 레진, 중간~큰 충치는 인레이가 더 내구성이 좋습니다.' },
    { q: '충치 치료는 아프나요?', a: '작은 초기 충치는 마취 없이도 거의 통증 없이 치료 가능합니다. 깊은 충치는 국소 마취 후 치료합니다.' },
    { q: '충치 예방은 어떻게 하나요?', a: '식후 양치, 하루 한 번 치실, 6개월마다 스케일링과 검진, 불소 치약 사용이 기본입니다.' },
  ],
  ctaH2: '충치는 빠를수록 간단합니다',
  ctaDesc: '정기 검진으로 초기에 발견하고 간단하게 치료하세요.',
  ...getNav('cavity.html'),
});

// ═══ 7. 레진치료 ═══
pages.push({
  file: 'resin.html', title: '레진치료',
  metaDesc: '서울비디치과 레진치료 — 당일 완료, 자연스러운 색상, 최소 삭제 — 작은 충치부터 심미 수복까지',
  keywords: '천안 레진치료, 서울비디치과 레진, 당일 충치치료',
  badgeIcon: 'fas fa-fill-drip', badgeText: '보존치료',
  heroH1: '<span class="text-gradient">레진치료</span>',
  heroDesc: '당일 완료되는 자연스러운 충치 치료. 치아색 레진으로 충치 부위를 정밀하게 수복합니다.',
  diffs: [
    { title: '당일 완료', desc: '레진 치료는 한 번의 방문으로 완료됩니다. 바쁜 분들도 부담 없이 치료받으세요.' },
    { title: '자연스러운 색상 매칭', desc: '다양한 색상의 레진 중 환자 치아 색에 가장 잘 맞는 것을 선택합니다.' },
    { title: '최소 삭제', desc: '충치 부위만 정확히 제거하고 건강한 치질은 최대한 보존합니다.' },
    { title: '고품질 레진 사용', desc: '3M, GC 등 글로벌 브랜드의 고품질 복합 레진을 사용합니다.' },
    { title: '다층 충전 기법', desc: '여러 층으로 나눠 충전하여 레진 수축을 최소화하고 내구성을 높입니다.' },
    { title: '정밀 교합 조정', desc: '충전 후 꼼꼼한 교합 조정으로 불편함 없는 결과를 만듭니다.' },
  ],
  diffTitle: '서울비디 레진치료 <span class="text-gradient">차별점</span>',
  diffSub: '세심한 시술로 자연스럽고 오래가는 결과',
  process: [
    { title: '충치 진단', desc: '디지털 X-ray와 직접 검사로 충치 범위를 정확히 파악합니다.' },
    { title: '충치 제거', desc: '충치 부위만 정확히 제거합니다. 우식 검지액으로 완전 제거를 확인합니다.' },
    { title: '레진 충전', desc: '치아색 레진을 다층으로 충전하고 광중합기로 경화시킵니다.' },
    { title: '형태 조정 & 연마', desc: '교합 조정과 정밀 연마로 자연스러운 형태와 광택을 완성합니다.' },
  ],
  processTitle: '레진치료 <span class="text-gradient">과정</span>',
  processSub: '당일 완료되는 간단한 4단계',
  faqs: [
    { q: '레진 치료 시간은 얼마나 걸리나요?', a: '보통 30분~1시간 정도입니다. 충치 크기와 개수에 따라 달라집니다.' },
    { q: '레진 수명은 얼마나 되나요?', a: '관리에 따라 5~10년 정도 사용 가능합니다. 정기 검진으로 상태를 확인하세요.' },
    { q: '레진이 변색되나요?', a: '시간이 지나면 약간의 변색이 있을 수 있습니다. 커피, 와인, 카레 등 착색 음식을 줄이면 오래 유지됩니다.' },
    { q: '비용은 얼마인가요?', a: '충치 크기에 따라 5~15만원 정도입니다. 정확한 비용은 검진 후 안내드립니다.' },
  ],
  ctaH2: '작은 충치, 빠르게 해결하세요',
  ctaDesc: '당일 완료되는 레진치료로 깔끔하게.',
  ...getNav('resin.html'),
});

// ═══ 8. 크라운 ═══
pages.push({
  file: 'crown.html', title: '크라운',
  metaDesc: '서울비디치과 크라운 — 지르코니아, 올세라믹, PFM 크라운 — 원내 기공소에서 프리미엄 보철물 직접 제작',
  keywords: '천안 크라운, 서울비디치과 크라운, 지르코니아 크라운',
  badgeIcon: 'fas fa-crown', badgeText: '보존치료',
  heroH1: '<span class="text-gradient">크라운</span> 치료',
  heroDesc: '신경치료 후 또는 손상된 치아를 보호하고 기능을 회복합니다. 원내 기공소에서 맞춤 제작하여 정확한 핏과 뛰어난 심미성을 제공합니다.',
  treatmentOptions: [
    { icon: 'fas fa-gem', title: '지르코니아 크라운', desc: '가장 단단한 세라믹 크라운입니다. 강도와 심미성을 모두 갖추고 있어 어금니와 앞니 모두에 적합합니다.', tags: ['최고 강도', '뛰어난 심미성', '변색 없음', '어금니+앞니'] },
    { icon: 'fas fa-crown', title: '올세라믹 크라운', desc: '금속 없는 세라믹 크라운으로 자연 치아와 가장 유사한 투명도를 가집니다. 앞니에 특히 추천합니다.', tags: ['자연스러운 투명도', '금속 프리', '앞니 추천', '생체 친화'] },
    { icon: 'fas fa-shield-alt', title: 'PFM 크라운', desc: '금속 위에 세라믹을 올린 크라운입니다. 내구성이 뛰어나 어금니에 적합하며 합리적인 비용입니다.', tags: ['높은 내구성', '합리적 비용', '어금니 적합', '검증된 방법'] },
  ],
  treatmentOptionsTitle: '<span class="text-gradient">크라운</span> 종류',
  treatmentOptionsSub: '치아 위치와 상태에 따라 최적의 크라운을 선택합니다',
  diffs: [
    { title: '원내 기공소', desc: '충남권 대규모 원내 기공소에서 크라운을 직접 제작합니다. 색상과 형태를 정밀하게 맞춥니다.' },
    { title: '디지털 인상', desc: '구강스캐너로 정밀한 디지털 인상을 채득하여 정확한 크라운을 제작합니다.' },
    { title: '교합 정밀 조정', desc: '크라운 장착 후 꼼꼼한 교합 조정으로 편안한 사용감을 보장합니다.' },
    { title: '보철과 전문의', desc: '보철과 전문의가 크라운 설계부터 장착까지 직접 관리합니다.' },
  ],
  diffTitle: '서울비디 크라운의 <span class="text-gradient">차이</span>',
  diffSub: '원내 기공소에서 완성하는 프리미엄 크라운',
  faqs: [
    { q: '크라운 수명은 얼마나 되나요?', a: '관리에 따라 10~20년 이상 사용 가능합니다. 정기 검진과 올바른 구강 관리가 중요합니다.' },
    { q: '크라운 치료 기간은?', a: '보통 2회 방문으로 완료됩니다. 첫 방문에 치아 삭제 및 인상을, 두 번째 방문에 크라운을 장착합니다.' },
    { q: '비용은 얼마인가요?', a: '크라운 종류에 따라 40~70만원 정도입니다. 정확한 비용은 검진 후 안내드립니다.' },
    { q: '크라운이 빠질 수 있나요?', a: '드물지만 가능합니다. 빠지면 바로 내원해주시면 재접착하거나 새로 제작합니다.' },
  ],
  ctaH2: '치아를 지키는 가장 확실한 방법',
  ctaDesc: '프리미엄 크라운으로 치아를 오래 보호하세요.',
  ...getNav('crown.html'),
});

// ═══ 9. 인레이/온레이 ═══
pages.push({
  file: 'inlay.html', title: '인레이/온레이',
  metaDesc: '서울비디치과 인레이/온레이 — 세라믹, 골드, 지르코니아 — 정밀 맞춤 제작으로 오래가는 충치 수복',
  keywords: '천안 인레이, 서울비디치과 인레이, 온레이, 세라믹 인레이',
  badgeIcon: 'fas fa-puzzle-piece', badgeText: '보존치료',
  heroH1: '<span class="text-gradient">인레이/온레이</span>',
  heroDesc: '중간~큰 충치에 적합한 간접 수복 방법입니다. 기공소에서 정밀 제작되어 레진보다 내구성이 뛰어나고 오래 지속됩니다.',
  treatmentOptions: [
    { icon: 'fas fa-gem', title: '세라믹 인레이', desc: '치아색 세라믹으로 제작하여 자연스럽고 내구성이 뛰어납니다.', tags: ['자연스러운 색상', '높은 내구성', '변색 없음', '10년+'] },
    { icon: 'fas fa-coins', title: '골드 인레이', desc: '생체 친화적인 금으로 제작합니다. 교합면에 가장 부드럽고 내구성이 뛰어납니다.', tags: ['최고 내구성', '생체 친화', '교합 적합', '20년+'] },
    { icon: 'fas fa-shield-alt', title: '지르코니아 인레이', desc: '가장 단단한 세라믹으로 강도와 심미성을 모두 갖춘 인레이입니다.', tags: ['최고 강도', '심미성', '변색 없음', '내구성'] },
  ],
  treatmentOptionsTitle: '<span class="text-gradient">인레이</span> 종류',
  treatmentOptionsSub: '재료별 특성을 비교하여 최적의 인레이를 선택합니다',
  compareTable: {
    title: '인레이 <span class="text-gradient">재료 비교</span>',
    sub: '재료별 특성을 한눈에 비교하세요',
    headers: ['비교 항목', '세라믹', '골드', '지르코니아'],
    highlightCol: 1,
    rows: [
      ['심미성', '★★★★★', '★★☆☆☆', '★★★★☆'],
      ['내구성', '★★★★☆', '★★★★★', '★★★★★'],
      ['생체 친화성', '★★★★☆', '★★★★★', '★★★★☆'],
      ['가격대', '중간', '높음', '중간~높음'],
      ['추천 부위', '앞니~어금니', '어금니', '어금니'],
    ],
    note: '환자의 치아 상태와 위치에 따라 최적의 재료를 추천드립니다.',
  },
  diffs: [
    { title: '원내 기공소', desc: '인레이를 원내에서 직접 제작하여 정확한 핏과 색상 매칭을 보장합니다.' },
    { title: '디지털 인상', desc: '구강스캐너로 정밀한 디지털 인상을 채득합니다.' },
    { title: '정밀 교합 조정', desc: '장착 후 꼼꼼한 교합 조정으로 편안한 사용감을 보장합니다.' },
  ],
  diffTitle: '서울비디 인레이의 <span class="text-gradient">차이</span>',
  diffSub: '원내 기공소에서 완성하는 정밀 인레이',
  faqs: [
    { q: '인레이와 레진의 차이는?', a: '레진은 직접 충전하고, 인레이는 기공소에서 정밀 제작합니다. 인레이가 내구성과 밀착도가 더 뛰어나 중간~큰 충치에 적합합니다.' },
    { q: '치료 기간은?', a: '보통 2회 방문입니다. 첫 방문에 충치 제거와 인상, 두 번째 방문에 인레이를 장착합니다.' },
    { q: '비용은 얼마인가요?', a: '재료에 따라 20~40만원 정도입니다. 골드가 가장 높고 세라믹이 합리적입니다.' },
    { q: '인레이 수명은?', a: '세라믹 10년+, 골드 20년+ 사용 가능합니다. 정기 검진과 관리가 중요합니다.' },
  ],
  ctaH2: '오래가는 충치 수복, 인레이로',
  ctaDesc: '정밀 맞춤 인레이로 치아를 튼튼하게.',
  ...getNav('inlay.html'),
});

// ═══ 10. 신경치료 ═══
pages.push({
  file: 'root-canal.html', title: '신경치료',
  metaDesc: '서울비디치과 신경치료 — 정밀 기구와 첨단 장비로 안전한 신경치료 — 치아를 살리는 마지막 기회',
  keywords: '천안 신경치료, 서울비디치과 신경치료, 근관치료',
  badgeIcon: 'fas fa-heartbeat', badgeText: '보존치료',
  heroH1: '치아를 살리는 <span class="text-gradient">신경치료</span>',
  heroDesc: '충치가 신경까지 진행된 경우, 발치 대신 신경치료로 치아를 보존합니다. 정밀 기구와 첨단 장비로 안전하게 치료합니다.',
  concerns: [
    { problem: '"신경치료가 아프다던데"', solution: '충분한 마취로 통증 없이' },
    { problem: '"치아를 뽑아야 하나요?"', solution: '신경치료로 치아 보존' },
    { problem: '"여러 번 와야 하나요?"', solution: '최소 방문으로 빠르게' },
    { problem: '"치료 후 치아가 약해진다는데"', solution: '크라운으로 보호하면 오래 사용' },
  ],
  process: [
    { title: '정밀 진단', desc: 'X-ray와 전기 치수 검사로 신경 상태를 정확히 파악합니다.' },
    { title: '마취 & 접근', desc: '충분한 국소 마취 후 감염된 신경에 접근합니다.' },
    { title: '신경 제거 & 소독', desc: '정밀 기구로 감염된 신경 조직을 제거하고 근관 내부를 철저히 소독합니다.' },
    { title: '근관 충전', desc: '깨끗해진 근관을 생체 친화적 재료로 빈틈없이 채웁니다.' },
    { title: '크라운 보철', desc: '신경치료 완료 후 크라운을 씌워 치아를 보호합니다.' },
  ],
  processTitle: '<span class="text-gradient">신경치료</span> 과정',
  processSub: '정밀한 5단계 치료',
  diffs: [
    { title: 'NiTi 정밀 기구', desc: '유연한 니켈-티타늄 기구로 구불구불한 근관도 안전하게 치료합니다.' },
    { title: '전자 근관 길이 측정', desc: '전자 기기로 근관 길이를 정확히 측정하여 과도한 치료나 부족한 치료를 방지합니다.' },
    { title: '러버댐 사용', desc: '러버댐(방습장치)을 사용하여 세균 오염을 방지하고 치료 성공률을 높입니다.' },
    { title: '3D CT 활용', desc: '3D CT로 근관의 수, 형태, 곡률을 입체적으로 파악합니다.' },
  ],
  diffTitle: '서울비디 신경치료 <span class="text-gradient">차별점</span>',
  diffSub: '정밀 장비로 치료 성공률을 높입니다',
  faqs: [
    { q: '신경치료가 아프나요?', a: '충분한 국소 마취 하에 진행되므로 치료 중 통증은 거의 없습니다. 치료 후 며칠간 약간의 불편감이 있을 수 있습니다.' },
    { q: '신경치료 후 크라운은 필수인가요?', a: '대부분 필수입니다. 신경치료 후 치아는 수분이 줄어 약해지므로, 크라운으로 보호해야 파절을 방지합니다.' },
    { q: '치료 기간은?', a: '보통 2~3회 방문으로 완료됩니다. 감염 정도에 따라 추가 방문이 필요할 수 있습니다.' },
    { q: '신경치료한 치아는 얼마나 사용할 수 있나요?', a: '크라운을 씌우고 잘 관리하면 10년 이상 사용 가능합니다. 정기 검진이 중요합니다.' },
  ],
  ctaH2: '발치 전에, 신경치료를 먼저 고려하세요',
  ctaDesc: '치아를 살릴 수 있는 마지막 기회입니다.',
  ...getNav('root-canal.html'),
});

// ═══ 11. 미백 ═══
pages.push({
  file: 'whitening.html', title: '미백',
  metaDesc: '서울비디치과 치아 미백 — 전문의 직접 시술, 고농도 미백 — 밝고 화사한 미소를 만듭니다',
  keywords: '천안 치아미백, 서울비디치과 미백, 전문 미백',
  badgeIcon: 'fas fa-sun', badgeText: '심미치료',
  heroH1: '밝고 <span class="text-gradient">화사한 미소</span>',
  heroDesc: '전문의가 직접 시술하는 고농도 전문 미백으로 확실한 톤 업 효과를 경험하세요.',
  treatmentOptions: [
    { icon: 'fas fa-hospital', title: '전문가 미백 (In-Office)', desc: '치과에서 전문의가 직접 고농도 미백제를 도포하고 특수 광선으로 활성화합니다. 1회 시술로 즉각적인 효과를 볼 수 있습니다.', tags: ['즉각적 효과', '전문의 시술', '1시간 소요', '안전관리'] },
    { icon: 'fas fa-home', title: '자가 미백 (Home)', desc: '맞춤 제작된 트레이에 미백제를 넣어 집에서 사용합니다. 2~4주간 꾸준히 사용하면 자연스러운 미백 효과가 나타납니다.', tags: ['편리한 자가 관리', '점진적 효과', '맞춤 트레이', '경제적'] },
    { icon: 'fas fa-star', title: '듀얼 미백', desc: '전문가 미백과 자가 미백을 병행하여 최대 효과를 냅니다. 가장 확실하고 오래 지속됩니다.', tags: ['최대 효과', '오래 지속', '추천 프로그램', '프리미엄'] },
  ],
  treatmentOptionsTitle: '<span class="text-gradient">미백</span> 프로그램',
  treatmentOptionsSub: '원하는 밝기와 예산에 맞는 프로그램을 선택하세요',
  diffs: [
    { title: '전문의 직접 시술', desc: '숙련된 전문의가 잇몸 보호부터 미백제 도포까지 직접 관리합니다.' },
    { title: '시린 증상 최소화', desc: '시술 전 디센시타이저(감감제) 처리로 시린 증상을 최소화합니다.' },
    { title: '맞춤 트레이 제작', desc: '자가 미백용 트레이를 환자 치아에 맞춤 제작하여 미백제가 균일하게 작용합니다.' },
    { title: '유지관리 프로그램', desc: '미백 후 정기적 터치업으로 밝은 미소를 오래 유지하도록 돕습니다.' },
  ],
  diffTitle: '서울비디 미백의 <span class="text-gradient">차이</span>',
  diffSub: '안전하고 확실한 미백 결과',
  faqs: [
    { q: '미백이 치아에 해롭나요?', a: '전문의가 적절한 농도와 시간을 관리하면 치아에 해롭지 않습니다. 법랑질 구조에 영향을 주지 않습니다.' },
    { q: '미백 효과는 얼마나 지속되나요?', a: '생활 습관에 따라 6개월~2년 정도 유지됩니다. 정기 터치업으로 더 오래 유지할 수 있습니다.' },
    { q: '시린 증상이 있나요?', a: '일시적으로 시린 증상이 있을 수 있으나 보통 1~2일 내 사라집니다. 디센시타이저로 최소화합니다.' },
    { q: '비용은 얼마인가요?', a: '프로그램에 따라 다릅니다. 상담 시 정확한 비용을 안내드립니다.' },
  ],
  ctaH2: '더 밝은 미소, 지금 시작하세요',
  ctaDesc: '전문 미백으로 자신감을 되찾으세요.',
  ...getNav('whitening.html'),
});

// ═══ 12. 브릿지 ═══
pages.push({
  file: 'bridge.html', title: '브릿지',
  metaDesc: '서울비디치과 브릿지 — 상실된 치아를 양쪽 치아를 이용해 복원 — 빠른 치료, 경제적 보철',
  keywords: '천안 브릿지, 서울비디치과 브릿지, 치아 보철',
  badgeIcon: 'fas fa-bridge', badgeText: '보철치료',
  heroH1: '<span class="text-gradient">브릿지</span>',
  heroDesc: '상실된 치아를 양쪽 인접 치아를 이용해 복원합니다. 임플란트가 어려운 경우 효과적인 대안입니다.',
  diffs: [
    { title: '빠른 치료', desc: '2~3회 방문으로 완료됩니다. 임플란트에 비해 치료 기간이 짧습니다.' },
    { title: '경제적 비용', desc: '임플란트 대비 비용이 합리적입니다.' },
    { title: '원내 기공소', desc: '원내에서 직접 제작하여 정확한 핏과 심미성을 보장합니다.' },
    { title: '검증된 방법', desc: '오랜 역사의 검증된 보철 방법입니다.' },
  ],
  diffTitle: '서울비디 브릿지의 <span class="text-gradient">장점</span>',
  diffSub: '빠르고 경제적인 치아 복원',
  faqs: [
    { q: '브릿지와 임플란트의 차이는?', a: '브릿지는 양쪽 치아를 삭제하여 지지대로 사용하고, 임플란트는 인공 뿌리를 식립합니다. 장단점이 다르니 상담을 권합니다.' },
    { q: '브릿지 수명은?', a: '관리에 따라 7~15년 정도입니다. 정기 검진과 올바른 구강 관리가 중요합니다.' },
    { q: '비용은?', a: '지대치 수와 재료에 따라 달라집니다. 상담 시 정확한 비용을 안내드립니다.' },
  ],
  ctaH2: '빈 자리를 채우는 확실한 방법',
  ctaDesc: '브릿지 보철 상담을 시작하세요.',
  ...getNav('bridge.html'),
});

// ═══ 13. 틀니 ═══
pages.push({
  file: 'denture.html', title: '틀니',
  metaDesc: '서울비디치과 틀니 — 정밀 맞춤 틀니, 임플란트 틀니 — 편안한 식사와 자연스러운 미소',
  keywords: '천안 틀니, 서울비디치과 틀니, 임플란트 틀니',
  badgeIcon: 'fas fa-teeth', badgeText: '보철치료',
  heroH1: '편안한 <span class="text-gradient">틀니</span>',
  heroDesc: '정밀 맞춤 제작으로 편안한 착용감과 자연스러운 외관을 제공합니다. 임플란트 틀니로 더 안정적인 사용이 가능합니다.',
  treatmentOptions: [
    { icon: 'fas fa-teeth', title: '총의치 (완전 틀니)', desc: '치아가 모두 없는 경우 사용합니다. 정밀 인상으로 잇몸에 꼭 맞게 제작합니다.', tags: ['전체 치아 대체', '정밀 맞춤', '경제적'] },
    { icon: 'fas fa-teeth-open', title: '부분 틀니', desc: '일부 치아가 남아 있는 경우 사용합니다. 남은 치아에 걸어 고정합니다.', tags: ['일부 치아 보존', '탈착 가능', '관리 용이'] },
    { icon: 'fas fa-hospital', title: '임플란트 틀니', desc: '임플란트로 틀니를 고정합니다. 일반 틀니보다 훨씬 안정적이고 씹는 힘이 강합니다.', tags: ['강한 고정력', '우수한 저작력', '가장 안정적'] },
  ],
  treatmentOptionsTitle: '<span class="text-gradient">틀니</span> 종류',
  treatmentOptionsSub: '구강 상태에 맞는 최적의 틀니를 선택합니다',
  diffs: [
    { title: '정밀 인상 채득', desc: '정밀한 인상으로 잇몸에 꼭 맞는 틀니를 제작합니다.' },
    { title: '원내 기공소', desc: '원내에서 직접 제작하여 빠른 수정과 정밀한 핏을 보장합니다.' },
    { title: '사후 관리', desc: '정기적 조정으로 항상 편안한 착용감을 유지합니다.' },
  ],
  diffTitle: '서울비디 틀니의 <span class="text-gradient">차이</span>',
  diffSub: '정밀 맞춤 제작으로 편안한 틀니',
  faqs: [
    { q: '틀니 적응 기간은?', a: '보통 2~4주 정도 적응 기간이 필요합니다. 초기에는 불편할 수 있으나 점차 적응됩니다.' },
    { q: '임플란트 틀니란?', a: '2~4개의 임플란트로 틀니를 고정하는 방법입니다. 일반 틀니보다 훨씬 안정적이고 씹는 힘이 강합니다.' },
    { q: '비용은?', a: '틀니 종류에 따라 달라집니다. 정확한 비용은 검진 후 안내드립니다.' },
  ],
  ctaH2: '편안한 틀니로 식사의 즐거움을',
  ctaDesc: '맞춤 틀니 상담을 시작하세요.',
  ...getNav('denture.html'),
});

// ═══ 14. 재신경치료 ═══
pages.push({
  file: 're-root-canal.html', title: '재신경치료',
  metaDesc: '서울비디치과 재신경치료 — 이전 신경치료 실패 시 재치료로 치아 보존 — 정밀 기구와 미세현미경',
  keywords: '천안 재신경치료, 서울비디치과 재신경치료',
  badgeIcon: 'fas fa-redo', badgeText: '보존치료',
  heroH1: '<span class="text-gradient">재신경치료</span>',
  heroDesc: '이전 신경치료가 실패한 경우, 재치료로 치아를 다시 살립니다. 정밀 기구와 첨단 장비로 성공률을 높입니다.',
  concerns: [
    { problem: '"신경치료한 치아가 또 아파요"', solution: '재치료로 해결 가능' },
    { problem: '"뽑아야 한다고 하는데"', solution: '재신경치료 후 보존 가능' },
    { problem: '"다시 치료해도 되나요?"', solution: '성공률 높은 정밀 재치료' },
  ],
  diffs: [
    { title: '정밀 기구 사용', desc: '이전 충전물을 안전하게 제거하고 미처리 근관을 찾아 치료합니다.' },
    { title: '3D CT 분석', desc: '근관의 구조와 이전 치료 상태를 입체적으로 파악합니다.' },
    { title: '초음파 기구', desc: '초음파를 이용하여 이전 충전물과 포스트를 안전하게 제거합니다.' },
    { title: '철저한 소독', desc: '이전 치료에서 남은 감염을 완전히 제거하고 새로 충전합니다.' },
  ],
  diffTitle: '서울비디 재신경치료 <span class="text-gradient">차별점</span>',
  diffSub: '첨단 장비로 성공률을 높입니다',
  faqs: [
    { q: '재신경치료 성공률은?', a: '정밀 장비를 사용하면 70~90%의 높은 성공률을 보입니다.' },
    { q: '아프나요?', a: '충분한 마취 하에 진행되므로 통증은 거의 없습니다.' },
    { q: '발치가 필요한 경우도 있나요?', a: '재치료가 불가능한 경우 치근단절제술이나 발치를 고려할 수 있습니다.' },
  ],
  ctaH2: '치아를 포기하기 전에 상담하세요',
  ctaDesc: '재신경치료로 치아를 살릴 수 있습니다.',
  ...getNav('re-root-canal.html'),
});

// ═══ 15. 치근단절제술 ═══
pages.push({
  file: 'apicoectomy.html', title: '치근단절제술',
  metaDesc: '서울비디치과 치근단절제술 — 신경치료 후에도 염증이 남았을 때 — 수술로 치아를 보존합니다',
  keywords: '천안 치근단절제술, 서울비디치과 치근단절제술',
  badgeIcon: 'fas fa-scalpel', badgeText: '외과치료',
  heroH1: '<span class="text-gradient">치근단절제술</span>',
  heroDesc: '신경치료 후에도 치아 뿌리 끝에 염증이 남아있을 때, 수술적 방법으로 감염 부위를 제거하여 치아를 보존합니다.',
  process: [
    { title: '정밀 진단', desc: '3D CT로 뿌리 끝 염증의 범위와 위치를 정확히 파악합니다.' },
    { title: '마취 & 절개', desc: '국소 마취 후 잇몸을 절개하여 뿌리 끝에 접근합니다.' },
    { title: '감염 제거', desc: '뿌리 끝의 감염된 조직과 낭종을 제거합니다.' },
    { title: '역충전 & 봉합', desc: '뿌리 끝을 생체 친화적 재료로 밀봉하고 잇몸을 봉합합니다.' },
  ],
  processTitle: '<span class="text-gradient">치근단절제술</span> 과정',
  processSub: '정밀한 외과적 처치',
  diffs: [
    { title: '3D CT 정밀 진단', desc: '뿌리 끝 병변의 크기와 인접 구조물을 정확히 파악합니다.' },
    { title: '미세 수술 기법', desc: '최소한의 절개와 정밀한 수술로 회복을 빠르게 합니다.' },
    { title: '생체 친화적 재료', desc: 'MTA 등 최신 재료로 뿌리 끝을 밀봉하여 재발을 방지합니다.' },
  ],
  diffTitle: '서울비디 치근단절제술 <span class="text-gradient">차별점</span>',
  diffSub: '치아 보존을 위한 정밀 외과',
  faqs: [
    { q: '치근단절제술 후 통증은?', a: '수술 후 2~3일간 약간의 부기와 불편감이 있을 수 있으나, 처방된 약을 복용하면 관리 가능합니다.' },
    { q: '성공률은?', a: '약 85~95%의 높은 성공률을 보입니다.' },
    { q: '회복 기간은?', a: '보통 1~2주면 일상에 복귀 가능합니다. 봉합사는 7~10일 후 제거합니다.' },
  ],
  ctaH2: '발치 전 마지막 방법, 치근단절제술',
  ctaDesc: '치아를 살릴 수 있는 방법을 찾아드리겠습니다.',
  ...getNav('apicoectomy.html'),
});

// ═══ 16. 스케일링 ═══
pages.push({
  file: 'scaling.html', title: '스케일링',
  metaDesc: '서울비디치과 스케일링 — 치석 제거로 잇몸 건강을 지키는 기본 — 건강보험 적용',
  keywords: '천안 스케일링, 서울비디치과 스케일링, 치석 제거',
  badgeIcon: 'fas fa-sparkles', badgeText: '예방치료',
  heroH1: '잇몸 건강의 <span class="text-gradient">시작, 스케일링</span>',
  heroDesc: '치석을 제거하여 잇몸 질환을 예방하고 구강 건강을 유지합니다. 건강보험 적용으로 합리적인 비용입니다.',
  infoQuick: [
    { icon: 'fas fa-clock', label: '소요 시간', value: '30~40분' },
    { icon: 'fas fa-calendar', label: '권장 주기', value: '6개월' },
    { icon: 'fas fa-shield-alt', label: '보험 적용', value: '연 1회' },
    { icon: 'fas fa-smile', label: '일상 복귀', value: '즉시' },
  ],
  diffs: [
    { title: '꼼꼼한 치석 제거', desc: '초음파 스케일러와 수기구를 병행하여 눈에 보이지 않는 치석까지 꼼꼼하게 제거합니다.' },
    { title: '잇몸 상태 점검', desc: '스케일링과 함께 잇몸 상태를 점검하고 필요시 추가 치료를 안내합니다.' },
    { title: '후 관리 안내', desc: '스케일링 후 올바른 양치 방법과 관리법을 안내합니다.' },
    { title: '건강보험 적용', desc: '만 19세 이상 연 1회 건강보험 적용으로 합리적인 비용입니다.' },
  ],
  diffTitle: '서울비디 스케일링 <span class="text-gradient">차별점</span>',
  diffSub: '단순 치석 제거를 넘어 잇몸 건강까지',
  faqs: [
    { q: '스케일링 후 이가 시릴 수 있나요?', a: '치석이 제거되면 일시적으로 시린 증상이 있을 수 있습니다. 보통 1~2주 내 사라집니다.' },
    { q: '얼마나 자주 받아야 하나요?', a: '6개월마다 받는 것이 좋습니다. 잇몸 질환이 있는 경우 3~4개월 간격을 권장합니다.' },
    { q: '비용은?', a: '건강보험 적용 시 본인부담금 약 1.5~2만원입니다. (만 19세 이상, 연 1회)' },
    { q: '스케일링 후 주의사항은?', a: '당일 뜨겁거나 자극적인 음식을 피하고, 부드러운 칫솔로 양치하세요.' },
  ],
  ctaH2: '잇몸 건강, 스케일링부터 시작하세요',
  ctaDesc: '정기 스케일링으로 잇몸 질환을 예방합니다.',
  ...getNav('scaling.html'),
});

// ═══ 17. 잇몸치료 ═══
pages.push({
  file: 'gum.html', title: '잇몸치료',
  metaDesc: '서울비디치과 잇몸치료 — 잇몸 출혈, 붓기, 후퇴 등 잇몸 질환 전문 치료',
  keywords: '천안 잇몸치료, 서울비디치과 잇몸치료, 치은염',
  badgeIcon: 'fas fa-teeth-open', badgeText: '잇몸치료',
  heroH1: '<span class="text-gradient">잇몸치료</span>',
  heroDesc: '잇몸 출혈, 붓기, 시림 등 잇몸 질환을 초기에 치료하여 치아를 건강하게 지킵니다.',
  concernCards: [
    { icon: 'fas fa-tint', title: '양치 시 피가 나요', desc: '잇몸에 염증이 있으면 양치 시 출혈이 발생합니다.' },
    { icon: 'fas fa-tired', title: '잇몸이 붓고 아파요', desc: '잇몸 염증이 진행되면 붓기와 통증이 나타납니다.' },
    { icon: 'fas fa-teeth', title: '이가 길어진 것 같아요', desc: '잇몸이 후퇴하면 치아 뿌리가 노출되어 이가 길어 보입니다.' },
  ],
  concernCardsTitle: '이런 <span class="text-gradient">잇몸 증상</span>이 있으신가요?',
  concernCardsSub: '잇몸 질환은 초기 치료가 중요합니다',
  stages: [
    { title: '치은염 (초기)', label: '경미', labelClass: 'mild', desc: '잇몸에만 염증이 있는 초기 단계입니다. 스케일링과 올바른 양치로 회복 가능합니다.', symptoms: ['양치 시 출혈', '잇몸 붉어짐', '약간의 붓기'], treatment: '스케일링 + 구강 관리 교육' },
    { title: '경도 치주염', label: '주의', labelClass: 'caution', desc: '염증이 잇몸뼈까지 진행되기 시작한 단계입니다.', symptoms: ['잦은 출혈', '잇몸 붓기', '구취'], treatment: '치근면 활택술' },
    { title: '중등도 치주염', label: '위험', labelClass: 'danger', desc: '잇몸뼈 손실이 진행된 상태입니다. 치아 흔들림이 시작될 수 있습니다.', symptoms: ['치아 흔들림', '잇몸 후퇴', '고름'], treatment: '치주 수술' },
    { title: '심한 치주염', label: '심각', labelClass: 'critical', desc: '잇몸뼈가 심하게 손실되어 치아 유지가 어려운 상태입니다.', symptoms: ['심한 흔들림', '심한 구취', '씹기 어려움'], treatment: '발치 고려 + 임플란트' },
  ],
  stageTitle: '잇몸 질환 <span class="text-gradient">단계</span>',
  stageSub: '진행 정도에 따라 치료 방법이 달라집니다',
  diffs: [
    { title: '정밀 잇몸 검사', desc: '치주 탐침으로 잇몸 주머니 깊이를 정밀하게 측정합니다.' },
    { title: '체계적 치료 계획', desc: '검사 결과를 바탕으로 환자에게 최적화된 치료 계획을 수립합니다.' },
    { title: '유지관리 프로그램', desc: '치료 후 정기적 관리로 재발을 방지합니다.' },
  ],
  diffTitle: '서울비디 잇몸치료 <span class="text-gradient">차별점</span>',
  diffSub: '체계적인 잇몸 관리 시스템',
  faqs: [
    { q: '잇몸 치료는 아프나요?', a: '국소 마취 하에 진행되므로 통증은 거의 없습니다. 시술 후 약간의 불편감이 있을 수 있습니다.' },
    { q: '잇몸 치료 후 주의사항은?', a: '부드러운 음식 섭취, 올바른 양치, 금연이 중요합니다.' },
    { q: '잇몸 질환은 유전인가요?', a: '유전적 요인이 있지만, 올바른 관리로 예방할 수 있습니다. 정기 검진이 가장 중요합니다.' },
  ],
  ctaH2: '잇몸이 건강해야 치아가 건강합니다',
  ctaDesc: '잇몸 상태 점검, 지금 시작하세요.',
  ...getNav('gum.html'),
});

// ═══ 18. 잇몸수술 ═══
pages.push({
  file: 'gum-surgery.html', title: '잇몸수술',
  metaDesc: '서울비디치과 잇몸수술 — 진행된 치주질환의 외과적 치료 — 잇몸뼈 재생, 치주 판막 수술',
  keywords: '천안 잇몸수술, 서울비디치과 잇몸수술, 치주수술',
  badgeIcon: 'fas fa-scalpel', badgeText: '잇몸/외과',
  heroH1: '<span class="text-gradient">잇몸수술</span>',
  heroDesc: '진행된 치주질환은 비수술적 치료만으로 한계가 있습니다. 치주 판막 수술로 깊은 곳의 치석과 감염을 제거합니다.',
  process: [
    { title: '정밀 검사', desc: '치주 탐침 검사와 X-ray로 잇몸뼈 손실 정도를 파악합니다.' },
    { title: '마취 & 절개', desc: '국소 마취 후 잇몸을 절개하여 뿌리 표면에 접근합니다.' },
    { title: '감염 제거', desc: '뿌리 표면의 치석과 감염 조직을 직접 눈으로 확인하며 제거합니다.' },
    { title: '골이식 (필요시)', desc: '잇몸뼈 손실이 있으면 골이식재로 재생을 유도합니다.' },
    { title: '봉합 & 관리', desc: '잇몸을 봉합하고 정기적 관리 프로그램을 안내합니다.' },
  ],
  processTitle: '<span class="text-gradient">잇몸수술</span> 과정',
  processSub: '정밀한 외과적 처치로 잇몸을 살립니다',
  diffs: [
    { title: '직접 시야 확보', desc: '잇몸을 열어 뿌리 표면을 직접 보면서 치료하므로 더 정확한 치석 제거가 가능합니다.' },
    { title: '골재생 치료', desc: '잇몸뼈 손실 부위에 골이식재와 차폐막으로 뼈 재생을 유도합니다.' },
    { title: '미세 수술', desc: '미세 봉합으로 수술 후 회복을 빠르게 합니다.' },
  ],
  diffTitle: '서울비디 잇몸수술 <span class="text-gradient">차별점</span>',
  diffSub: '잇몸뼈까지 살리는 정밀 수술',
  faqs: [
    { q: '수술 후 통증은?', a: '수술 후 2~3일간 부기와 불편감이 있을 수 있습니다. 처방 약물로 관리 가능합니다.' },
    { q: '회복 기간은?', a: '봉합사 제거는 7~14일 후, 일상 복귀는 2~3일 후 가능합니다.' },
    { q: '수술 비용은?', a: '수술 범위에 따라 달라집니다. 일부 건강보험 적용이 가능합니다.' },
  ],
  ctaH2: '잇몸을 살리면 치아가 살아납니다',
  ctaDesc: '잇몸수술 상담으로 치아를 지키세요.',
  ...getNav('gum-surgery.html'),
});

// ═══ 19. 치주염 ═══
pages.push({
  file: 'periodontitis.html', title: '치주염',
  metaDesc: '서울비디치과 치주염 치료 — 치아를 잃는 가장 큰 원인, 치주염을 체계적으로 치료합니다',
  keywords: '천안 치주염, 서울비디치과 치주염, 풍치',
  badgeIcon: 'fas fa-exclamation-triangle', badgeText: '잇몸치료',
  heroH1: '치아를 잃는 가장 큰 원인<br><span class="text-gradient">치주염</span>',
  heroDesc: '치주염은 한국 성인의 약 75%가 겪는 질환입니다. 초기에 발견하면 치아를 살릴 수 있습니다.',
  concernCards: [
    { icon: 'fas fa-tint', title: '잇몸에서 자주 피가 나요', desc: '양치나 식사 시 잇몸 출혈은 치주염의 초기 신호입니다.' },
    { icon: 'fas fa-wind', title: '입냄새가 심해졌어요', desc: '치주 포켓 내 세균이 만드는 가스가 구취의 원인입니다.' },
    { icon: 'fas fa-arrows-alt-h', title: '치아가 흔들려요', desc: '잇몸뼈 손실이 진행되면 치아가 흔들리기 시작합니다.' },
  ],
  concernCardsTitle: '이런 <span class="text-gradient">증상</span>이 있으시면',
  concernCardsSub: '치주염 검사를 받아보세요',
  diffs: [
    { title: '치주 전문 검사', desc: '치주 탐침 검사, 디지털 X-ray, 구강 사진 촬영으로 정밀 진단합니다.' },
    { title: '비수술 치료 우선', desc: '스케일링, 치근면 활택술 등 비수술적 치료를 먼저 진행합니다.' },
    { title: '수술적 치료', desc: '비수술 치료로 개선되지 않는 경우 치주 판막 수술, 골재생 치료를 진행합니다.' },
    { title: '유지관리 프로그램', desc: '치료 후 3~4개월 간격 정기 관리로 재발을 방지합니다.' },
  ],
  diffTitle: '서울비디 치주염 <span class="text-gradient">치료 시스템</span>',
  diffSub: '단계적이고 체계적인 치주 치료',
  faqs: [
    { q: '치주염은 완치되나요?', a: '완전한 완치는 어렵지만, 적절한 치료와 관리로 진행을 멈추고 상태를 유지할 수 있습니다.' },
    { q: '치주염 치료 비용은?', a: '치료 범위에 따라 다릅니다. 스케일링과 치근면 활택술은 일부 보험 적용됩니다.' },
    { q: '흡연과 치주염의 관계는?', a: '흡연은 치주염의 가장 큰 위험인자입니다. 금연이 치주 치료의 성공률을 크게 높입니다.' },
    { q: '치주염 예방법은?', a: '올바른 양치, 치실 사용, 정기 스케일링(6개월마다), 금연이 기본입니다.' },
  ],
  ctaH2: '치주염, 더 늦기 전에 치료하세요',
  ctaDesc: '정기 검진으로 치주염을 조기에 발견합니다.',
  ...getNav('periodontitis.html'),
});

// ═══ 20. 사랑니 발치 ═══
pages.push({
  file: 'wisdom-tooth.html', title: '사랑니 발치',
  metaDesc: '서울비디치과 사랑니 발치 — 매복 사랑니, 수면 발치 가능 — 6개 수술실에서 안전하게',
  keywords: '천안 사랑니 발치, 서울비디치과 사랑니, 매복 사랑니',
  badgeIcon: 'fas fa-tooth', badgeText: '외과치료',
  heroH1: '<span class="text-gradient">사랑니 발치</span>',
  heroDesc: '매복 사랑니, 눕거나 뒤틀린 사랑니도 안전하게 발치합니다. 6개 수술실에서 전문적인 발치가 가능합니다.',
  concerns: [
    { problem: '"사랑니 발치가 무서워요"', solution: '수면 발치로 편안하게' },
    { problem: '"사랑니가 매복되어 있대요"', solution: '고난도 매복 사랑니 전문' },
    { problem: '"주말에만 시간이 나요"', solution: '365일 발치 가능' },
    { problem: '"부기가 심하다던데"', solution: '최소 침습으로 부기 최소화' },
  ],
  diffs: [
    { title: '3D CT 정밀 진단', desc: '매복 사랑니의 위치, 신경과의 관계를 3D로 정확히 파악합니다.' },
    { title: '수면 발치 가능', desc: '두려운 분은 수면 상태에서 편안하게 발치할 수 있습니다.' },
    { title: '최소 침습 수술', desc: '불필요한 절개를 최소화하여 부기와 통증을 줄입니다.' },
    { title: '전용 수술실', desc: '6개 독립 수술실에서 감염 걱정 없이 안전하게 시술합니다.' },
  ],
  diffTitle: '서울비디 사랑니 발치 <span class="text-gradient">차별점</span>',
  diffSub: '고난도 매복 사랑니도 안전하게',
  precautions: [
    { icon: 'fas fa-utensils', title: '식사', items: ['발치 후 2~3시간 금식', '부드러운 음식 섭취', '뜨거운 음식 피하기', '발치 반대쪽으로 씹기'] },
    { icon: 'fas fa-shield-alt', title: '관리', items: ['거즈 1시간 물고 있기', '빨대 사용 금지', '격한 운동 2~3일 자제', '처방약 꼭 복용'] },
  ],
  precautionTitle: '발치 후 <span class="text-gradient">주의사항</span>',
  precautionSub: '빠른 회복을 위해 꼭 지켜주세요',
  faqs: [
    { q: '사랑니는 무조건 발치해야 하나요?', a: '반드시 그렇지는 않습니다. 정상적으로 나와 기능을 하면 유지 가능합니다. 하지만 매복, 충치, 인접 치아에 영향을 주면 발치를 권합니다.' },
    { q: '발치 후 부기가 심한가요?', a: '매복 정도에 따라 다르지만, 최소 침습 수술로 부기를 줄입니다. 보통 3~5일이면 호전됩니다.' },
    { q: '비용은?', a: '건강보험 적용이 가능합니다. 매복 정도에 따라 본인부담금이 달라집니다.' },
    { q: '수면 발치 비용은?', a: '수면 마취 비용이 추가됩니다. 상담 시 자세히 안내드립니다.' },
  ],
  ctaH2: '사랑니, 더 아프기 전에 해결하세요',
  ctaDesc: '365일 사랑니 발치가 가능합니다.',
  ...getNav('wisdom-tooth.html'),
});

// ═══ 21. 응급진료 ═══
pages.push({
  file: 'emergency.html', title: '응급진료',
  metaDesc: '서울비디치과 응급진료 — 365일 진료, 야간 진료 — 치통, 외상, 치아 파절 등 응급 상황 대응',
  keywords: '천안 치과 응급, 서울비디치과 응급진료, 야간 치과',
  badgeIcon: 'fas fa-ambulance', badgeText: '응급진료',
  heroH1: '365일 <span class="text-gradient">응급진료</span>',
  heroDesc: '갑작스러운 치통, 치아 외상, 파절 등 응급 상황에 365일 대응합니다. 평일 야간(20시까지), 주말·공휴일에도 진료합니다.',
  infoQuick: [
    { icon: 'fas fa-clock', label: '평일', value: '09:00-20:00' },
    { icon: 'fas fa-calendar', label: '토·일', value: '09:00-17:00' },
    { icon: 'fas fa-star', label: '공휴일', value: '09:00-13:00' },
    { icon: 'fas fa-phone', label: '전화', value: '041-415-2892' },
  ],
  concernCards: [
    { icon: 'fas fa-bolt', title: '갑자기 치아가 아파요', desc: '급성 치통은 신경 염증이나 농양의 신호일 수 있습니다. 빠른 진료가 필요합니다.' },
    { icon: 'fas fa-tooth', title: '치아가 부러졌어요', desc: '외상으로 치아가 파절되면 빠른 응급 처치가 치아 보존의 핵심입니다.' },
    { icon: 'fas fa-teeth', title: '치아가 빠졌어요', desc: '빠진 치아를 우유에 담아 30분 이내 내원하시면 재식립 가능합니다.' },
  ],
  concernCardsTitle: '이런 <span class="text-gradient">응급 상황</span>이 발생했나요?',
  concernCardsSub: '지금 바로 전화해주세요',
  diffs: [
    { title: '365일 진료', desc: '평일, 주말, 공휴일 모두 진료합니다. 야간 진료(20시까지)도 가능합니다.' },
    { title: '신속한 진단', desc: '3D CT와 디지털 X-ray로 빠르고 정확한 진단이 가능합니다.' },
    { title: '즉시 치료', desc: '응급 발치, 신경치료, 접착 등 당일 치료가 가능합니다.' },
    { title: '전문의 상주', desc: '각 분야 전문의가 상시 대기하여 모든 응급 상황에 대응합니다.' },
  ],
  diffTitle: '서울비디 응급진료 <span class="text-gradient">시스템</span>',
  diffSub: '빠르고 정확한 응급 대응',
  faqs: [
    { q: '야간에도 진료 가능한가요?', a: '평일 20시까지 야간 진료가 가능합니다. 토·일은 17시, 공휴일은 13시까지입니다.' },
    { q: '치아가 빠졌을 때 응급처치는?', a: '빠진 치아를 우유나 생리식염수에 담아 30분 이내 내원해주세요. 재식립 성공률이 높습니다.' },
    { q: '예약 없이 가도 되나요?', a: '응급 상황은 예약 없이 바로 내원 가능합니다. 전화 주시면 더 빠른 대응이 가능합니다.' },
  ],
  ctaH2: '치과 응급 상황? 지금 전화하세요',
  ctaDesc: '365일 대기하고 있습니다.',
  ...getNav('emergency.html'),
});

// ═══ 22. 턱관절장애 ═══
pages.push({
  file: 'tmj.html', title: '턱관절장애',
  metaDesc: '서울비디치과 턱관절장애 치료 — 턱 통증, 소리, 개구제한 등 — 원인별 맞춤 치료',
  keywords: '천안 턱관절장애, 서울비디치과 턱관절, TMJ, TMD',
  badgeIcon: 'fas fa-head-side-virus', badgeText: '전문치료',
  heroH1: '<span class="text-gradient">턱관절장애</span> 치료',
  heroDesc: '턱 통증, 소리, 입 벌리기 어려움 등 턱관절 증상을 원인별로 정확히 진단하고 맞춤 치료합니다.',
  concernCards: [
    { icon: 'fas fa-volume-up', title: '턱에서 소리가 나요', desc: '입을 벌리거나 씹을 때 딸깍, 뚝뚝 소리가 납니다.' },
    { icon: 'fas fa-frown', title: '턱이 아파요', desc: '턱 관절 부위, 관자놀이, 귀 앞쪽에 통증이 있습니다.' },
    { icon: 'fas fa-lock', title: '입이 잘 안 벌어져요', desc: '입을 크게 벌리기 어렵거나 턱이 걸리는 느낌이 있습니다.' },
    { icon: 'fas fa-head-side-virus', title: '두통이 자주 있어요', desc: '턱관절 문제로 인한 두통, 어깨 통증이 동반될 수 있습니다.' },
  ],
  concernCardsTitle: '이런 <span class="text-gradient">증상</span>이 있으신가요?',
  concernCardsSub: '턱관절장애일 수 있습니다',
  typeCards: [
    { icon: 'fas fa-teeth', title: '스플린트 치료', desc: '맞춤 제작된 교합안정장치(스플린트)를 착용하여 턱관절의 부담을 줄이고 증상을 완화합니다.', features: ['맞춤 제작', '야간 착용', '턱관절 보호', '교합 안정'], recommend: '가장 기본적인 치료' },
    { icon: 'fas fa-syringe', title: '약물 치료', desc: '소염진통제, 근이완제 등으로 급성기 통증과 염증을 조절합니다.', features: ['통증 완화', '염증 조절', '근육 이완', '급성기 치료'], recommend: '급성 통증, 염증' },
    { icon: 'fas fa-hands', title: '물리치료', desc: '턱관절 주변 근육의 이완과 강화를 통해 증상을 개선합니다.', features: ['근육 이완', '관절 운동', '통증 경감', '재발 방지'], recommend: '근육 긴장, 만성 통증' },
  ],
  typeTitle: '턱관절장애 <span class="text-gradient">치료 방법</span>',
  typeSub: '원인과 증상에 따라 최적의 치료를 선택합니다',
  diffs: [
    { title: '정밀 진단', desc: '3D CT, 파노라마, 교합 분석으로 턱관절 상태를 정밀하게 진단합니다.' },
    { title: '원인별 맞춤 치료', desc: '턱관절장애의 원인은 다양합니다. 정확한 원인 파악 후 맞춤 치료를 진행합니다.' },
    { title: '다학제 접근', desc: '교정, 보철, 외과 전문의가 협진하여 복합적인 턱관절 문제를 해결합니다.' },
  ],
  diffTitle: '서울비디 턱관절 <span class="text-gradient">차별점</span>',
  diffSub: '원인별 정밀 진단과 맞춤 치료',
  faqs: [
    { q: '턱관절장애는 저절로 낫나요?', a: '가벼운 증상은 자연 완화될 수 있지만, 방치하면 만성화될 수 있습니다. 증상이 2주 이상 지속되면 진료를 권합니다.' },
    { q: '스플린트는 얼마나 착용해야 하나요?', a: '보통 3~6개월 착용합니다. 증상 개선 정도에 따라 기간이 달라집니다.' },
    { q: '턱관절장애 원인은?', a: '이갈이, 이악물기, 외상, 스트레스, 부정교합, 나쁜 자세 등 다양한 원인이 있습니다.' },
    { q: '비용은?', a: '진단과 치료 방법에 따라 달라집니다. 스플린트는 보험 적용이 가능한 경우가 있습니다.' },
  ],
  ctaH2: '턱관절 통증, 참지 마세요',
  ctaDesc: '정밀 진단으로 원인을 찾고 맞춤 치료를 시작하세요.',
  ...getNav('tmj.html'),
});

// ═══ 23. 이갈이/이악물기 ═══
pages.push({
  file: 'bruxism.html', title: '이갈이/이악물기',
  metaDesc: '서울비디치과 이갈이·이악물기 치료 — 치아 손상 방지, 턱관절 보호 — 맞춤 마우스가드',
  keywords: '천안 이갈이, 서울비디치과 이갈이, 이악물기, 브럭시즘',
  badgeIcon: 'fas fa-teeth', badgeText: '전문치료',
  heroH1: '<span class="text-gradient">이갈이·이악물기</span> 치료',
  heroDesc: '수면 중 이갈이나 무의식적 이악물기는 치아와 턱관절에 심각한 손상을 줄 수 있습니다. 맞춤 장치로 보호하세요.',
  concernCards: [
    { icon: 'fas fa-moon', title: '밤에 이를 갈아요', desc: '수면 중 이갈이는 치아를 심하게 마모시키고 턱관절에 부담을 줍니다.' },
    { icon: 'fas fa-tired', title: '아침에 턱이 뻐근해요', desc: '밤새 이를 악물면 아침에 턱 통증과 피로감을 느낍니다.' },
    { icon: 'fas fa-tooth', title: '치아가 갈라지거나 깨져요', desc: '이갈이의 강한 힘은 치아를 파절시킬 수 있습니다.' },
    { icon: 'fas fa-head-side-virus', title: '두통이 자주 있어요', desc: '이악물기로 인한 근육 긴장이 두통의 원인일 수 있습니다.' },
  ],
  concernCardsTitle: '이런 <span class="text-gradient">증상</span>이 있으신가요?',
  concernCardsSub: '이갈이·이악물기일 수 있습니다',
  treatmentOptions: [
    { icon: 'fas fa-shield-alt', title: '나이트가드 (교합안정장치)', desc: '맞춤 제작된 장치를 수면 시 착용하여 치아 마모와 턱관절 손상을 방지합니다.', tags: ['맞춤 제작', '야간 착용', '치아 보호', '턱관절 보호'] },
    { icon: 'fas fa-syringe', title: '보톡스 치료', desc: '저작근에 보톡스를 주입하여 근육의 과도한 힘을 줄여줍니다.', tags: ['비수술', '빠른 효과', '사각턱 개선', '3~6개월 지속'] },
    { icon: 'fas fa-brain', title: '행동 교정', desc: '자각 훈련, 스트레스 관리 등으로 주간 이악물기 습관을 교정합니다.', tags: ['습관 개선', '스트레스 관리', '자각 훈련', '근본적 접근'] },
  ],
  treatmentOptionsTitle: '이갈이 <span class="text-gradient">치료 방법</span>',
  treatmentOptionsSub: '원인과 증상에 따라 최적의 방법을 선택합니다',
  diffs: [
    { title: '정밀 교합 분석', desc: '교합 검사로 이갈이의 패턴과 강도를 분석합니다.' },
    { title: '맞춤 장치 제작', desc: '환자 교합에 완벽하게 맞는 나이트가드를 제작합니다.' },
    { title: '원인별 접근', desc: '스트레스, 교합 문제, 수면 장애 등 원인을 파악하여 근본적으로 접근합니다.' },
  ],
  diffTitle: '서울비디 이갈이 치료 <span class="text-gradient">차별점</span>',
  diffSub: '정밀 진단과 맞춤 치료',
  faqs: [
    { q: '이갈이를 완전히 치료할 수 있나요?', a: '이갈이 자체를 완전히 없애기는 어렵지만, 나이트가드와 행동 교정으로 치아와 턱관절 손상을 예방하고 증상을 크게 개선할 수 있습니다.' },
    { q: '나이트가드는 불편하지 않나요?', a: '맞춤 제작이라 초기 적응 기간(1~2주)이 지나면 편안하게 착용 가능합니다.' },
    { q: '보톡스 치료의 효과는?', a: '시술 후 1~2주부터 효과가 나타나며, 3~6개월 지속됩니다. 정기적으로 시술하면 근육이 줄어들어 사각턱 개선 효과도 있습니다.' },
    { q: '비용은?', a: '나이트가드와 보톡스 비용은 치료 범위에 따라 달라집니다. 상담 시 안내드립니다.' },
  ],
  ctaH2: '치아와 턱관절을 보호하세요',
  ctaDesc: '이갈이 진단과 맞춤 치료를 시작하세요.',
  ...getNav('bruxism.html'),
});

// ═══ 24. 예방치료 ═══
pages.push({
  file: 'prevention.html', title: '예방치료',
  metaDesc: '서울비디치과 예방치료 — 정기 검진, 스케일링, 불소 도포, 실란트 — 치아를 건강하게 지키는 가장 좋은 방법',
  keywords: '천안 예방치료, 서울비디치과 예방치료, 정기 검진',
  badgeIcon: 'fas fa-shield-alt', badgeText: '예방치료',
  heroH1: '가장 좋은 치료는 <span class="text-gradient">예방</span>입니다',
  heroDesc: '정기 검진과 예방 관리로 충치와 잇몸 질환을 미리 방지합니다. 치료보다 예방이 경제적이고 효과적입니다.',
  treatmentOptions: [
    { icon: 'fas fa-search', title: '정기 검진', desc: '6개월마다 구강 검진을 받아 충치와 잇몸 질환을 조기에 발견합니다.', tags: ['조기 발견', '비용 절감', '구강 건강 유지'] },
    { icon: 'fas fa-sparkles', title: '스케일링', desc: '치석을 제거하여 잇몸 질환을 예방합니다. 건강보험 적용으로 합리적입니다.', tags: ['치석 제거', '잇몸 건강', '보험 적용'] },
    { icon: 'fas fa-atom', title: '불소 도포', desc: '치아 표면을 강화하여 충치 발생을 예방합니다.', tags: ['치아 강화', '충치 예방', '초기 충치 억제'] },
    { icon: 'fas fa-shield-alt', title: '실란트', desc: '어금니 씹는 면의 홈을 메워 충치를 예방합니다.', tags: ['어린이 필수', '통증 없음', '보험 적용'] },
  ],
  treatmentOptionsTitle: '<span class="text-gradient">예방치료</span> 프로그램',
  treatmentOptionsSub: '치아를 건강하게 지키는 4가지 방법',
  featureList: [
    { title: '6개월마다 정기 검진', desc: '충치와 잇몸 질환을 조기에 발견하여 큰 치료를 예방합니다. 비용도 절감됩니다.' },
    { title: '올바른 양치 교육', desc: '양치 방법, 치실 사용법, 치간 칫솔 사용법을 1:1로 안내합니다.' },
    { title: '식이 상담', desc: '충치와 잇몸 질환에 영향을 주는 식습관을 점검하고 개선 방법을 안내합니다.' },
    { title: '맞춤 예방 프로그램', desc: '환자의 구강 상태와 위험 요인에 맞는 개인별 예방 프로그램을 설계합니다.' },
  ],
  featureListTitle: '서울비디 <span class="text-gradient">예방관리</span> 시스템',
  featureListSub: '치료가 아닌 예방 중심의 관리',
  diffs: [
    { title: '개인별 위험도 평가', desc: '구강 검사, X-ray, 타액 검사 등으로 충치·잇몸 질환 위험도를 평가합니다.' },
    { title: '맞춤 관리 주기', desc: '위험도에 따라 3~6개월 간격의 맞춤 관리 주기를 설정합니다.' },
    { title: '예방 중심 철학', desc: '"치료하지 않아도 되는 입"을 만드는 것이 목표입니다.' },
  ],
  diffTitle: '서울비디 예방치료 <span class="text-gradient">차별점</span>',
  diffSub: '예방이 최고의 치료입니다',
  faqs: [
    { q: '예방 검진은 얼마나 자주 받아야 하나요?', a: '일반적으로 6개월마다 받는 것이 좋습니다. 충치나 잇몸 질환 위험이 높은 분은 3개월 간격을 권장합니다.' },
    { q: '예방치료 비용은?', a: '스케일링은 건강보험 적용(연 1회), 실란트는 18세 이하 보험 적용됩니다. 기타 예방 프로그램은 상담 시 안내드립니다.' },
    { q: '어른도 불소 도포를 받아야 하나요?', a: '네, 충치 위험이 높은 성인에게도 불소 도포가 효과적입니다. 특히 잇몸 후퇴로 치근이 노출된 경우 추천합니다.' },
  ],
  ctaH2: '예방이 최고의 치료입니다',
  ctaDesc: '정기 검진으로 건강한 치아를 유지하세요.',
  ...getNav('prevention.html'),
});

module.exports = pages;
