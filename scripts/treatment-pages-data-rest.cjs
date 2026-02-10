/**
 * 나머지 21개 치료 페이지 데이터 (소아치과 ~ 예방진료)
 */

const ORDER = [
  'glownate.html','implant.html','invisalign.html','pediatric.html','aesthetic.html',
  'cavity.html','resin.html','inlay.html','crown.html','root-canal.html',
  're-root-canal.html','apicoectomy.html','whitening.html','bridge.html','denture.html',
  'scaling.html','gum.html','gum-surgery.html','periodontitis.html',
  'wisdom-tooth.html','emergency.html','tmj.html','bruxism.html','prevention.html'
];
const TITLES = {
  'glownate.html':'글로우네이트','implant.html':'임플란트','invisalign.html':'치아교정(인비절라인)',
  'pediatric.html':'소아치과','aesthetic.html':'심미치료','cavity.html':'충치치료',
  'resin.html':'레진치료','inlay.html':'인레이/온레이','crown.html':'크라운',
  'root-canal.html':'신경치료','re-root-canal.html':'재신경치료','apicoectomy.html':'치근단절제술',
  'whitening.html':'미백','bridge.html':'브릿지','denture.html':'틀니',
  'scaling.html':'스케일링','gum.html':'잇몸치료','gum-surgery.html':'잇몸수술',
  'periodontitis.html':'치주염','wisdom-tooth.html':'사랑니 발치','emergency.html':'응급진료',
  'tmj.html':'턱관절장애','bruxism.html':'이갈이/이악물기','prevention.html':'예방진료'
};
function nav(file) {
  const idx = ORDER.indexOf(file);
  return {
    prevPage: idx > 0 ? { file: ORDER[idx-1], title: TITLES[ORDER[idx-1]] } : null,
    nextPage: idx < ORDER.length-1 ? { file: ORDER[idx+1], title: TITLES[ORDER[idx+1]] } : null
  };
}

module.exports = [

// ═══ 4. 소아치과 ═══
{
  file:'pediatric.html', title:'소아치과',
  desc:'서울비디치과 소아치과 — 소아치과 전문의 3인, 웃음가스·수면치료, 아이 눈높이 맞춤 진료',
  keywords:'천안 소아치과, 서울비디치과 소아치과, 소아 수면치료',
  badgeIcon:'fas fa-child', badgeText:'전문센터',
  heroH1:'우리 아이 첫 치과 경험,<br><span class="text-gradient">즐거움으로 시작</span>',
  heroDesc:'소아치과 전문의 3인이 아이의 눈높이에 맞춰 진료합니다. 웃음가스, 수면치료로 무서움 없는 치과 경험을 선물합니다.',
  heroStats:[{value:'전문의 3인',label:'소아치과'},{value:'3F',label:'소아 전용층'},{value:'수면치료',label:'통증 Zero'}],
  concernType:'rows',
  concerns:[
    {problem:'아이가 치과를 너무 무서워해요', solution:'행동유도·웃음가스로 편안하게'},
    {problem:'충치가 많은데 한번에 치료 가능?', solution:'수면치료로 한 번에 해결'},
    {problem:'유치는 어차피 빠지니까 괜찮죠?', solution:'유치 관리가 영구치 건강을 좌우'},
    {problem:'아이 교정 시기가 궁금해요', solution:'성장기 교정 적기 검진'}
  ],
  typeH2:'소아치과 <span class="text-gradient">진료 분야</span>',
  typeSub:'아이의 성장 단계에 맞는 맞춤 치료',
  types:[
    {icon:'fas fa-tooth', title:'소아 충치치료', desc:'유치·영구치 충치를 전문적으로 치료합니다. 아이의 협조도에 맞춘 행동유도 기법을 적용합니다.', features:['행동유도 기법','레진·크라운 치료','불소도포 예방','유치 발치'], recommend:'유아·소아 충치'},
    {icon:'fas fa-laugh-beam', title:'웃음가스 진정치료', desc:'아산화질소(N2O) 흡입으로 긴장을 완화합니다. 의식이 있는 상태에서 편안하게 치료받습니다.', features:['의식하 진정','빠른 회복 (5분)','안전한 시술','경미한 공포증 적합'], recommend:'가벼운 치과 공포, 3세+'},
    {icon:'fas fa-bed', title:'소아 수면치료', desc:'수면 상태에서 여러 개의 치아를 한 번에 치료합니다. 심한 공포증이나 다수 충치에 적합합니다.', featured:true, badge:'추천', features:['완전 수면 상태','다수 충치 한번에','전문 마취팀 운영','안전 모니터링'], recommend:'심한 공포증, 다수 충치'},
    {icon:'fas fa-teeth', title:'소아 교정', desc:'성장기 교정으로 영구치 맹출을 유도하고 악궁을 확장합니다. 인비절라인 퍼스트 등 최신 교정 시스템.', features:['인비절라인 퍼스트','악궁 확장','영구치 유도','성장기 활용'], recommend:'6~12세 성장기 교정'}
  ],
  diffH2:'서울비디 소아치과가 <span class="text-gradient">특별한 이유</span>',
  diffSub:'아이 전용 시설과 전문의 시스템',
  diffs:[
    {title:'소아전문의 3인 상시', desc:'소아치과 전문의 3인이 상시 진료합니다. 아이의 심리와 발달에 맞춘 전문적인 진료를 제공합니다.'},
    {title:'3층 소아 전용 공간', desc:'3층 전체를 소아치과 전용 공간으로 운영합니다. 아이 친화적인 인테리어와 놀이 공간을 갖추고 있습니다.'},
    {title:'수면치료 전문', desc:'전문 마취팀이 운영하는 안전한 수면치료 시스템으로 무서움 없는 치료를 제공합니다.'},
    {title:'성장기 교정 연계', desc:'소아치과 전문의와 교정 전문의가 협진하여 성장기에 맞는 최적의 교정 시기를 안내합니다.'}
  ],
  processH2:'소아치과 <span class="text-gradient">진료 과정</span>',
  processSub:'아이의 적응부터 치료까지',
  process:[
    {title:'첫 만남 & 적응', desc:'아이와 친해지는 시간을 가집니다. Tell-Show-Do 기법으로 치료 과정을 설명합니다.'},
    {title:'정밀 검진', desc:'파노라마, 구강 검사로 현재 상태를 확인하고 치료 계획을 수립합니다.'},
    {title:'치료 진행', desc:'행동유도, 웃음가스, 수면치료 등 아이의 상태에 맞는 방법으로 치료합니다.'},
    {title:'예방 관리', desc:'불소도포, 실란트 등 예방 치료와 올바른 칫솔질 교육을 진행합니다.'},
    {title:'정기 검진', desc:'3~6개월 간격으로 정기 검진하여 건강한 영구치 성장을 관리합니다.'}
  ],
  reviews:[
    {name:'최**님', source:'naver', text:'아이가 다른 치과에서 울고불고 했는데 <mark>여기서는 웃으면서 치료받았어요.</mark> 선생님들이 정말 아이를 잘 다루세요.', tags:['소아치과','행동유도']},
    {name:'김**님', source:'naver', text:'충치가 7개나 있어서 수면치료 받았는데 <mark>한 번에 다 해주셨어요.</mark> 아이가 기억도 못하고 아프지도 않았대요.', tags:['수면치료','다수 충치']},
    {name:'박**님', source:'google', text:'소아전문의가 3명이나 계셔서 안심이 됐어요. <mark>3층 전체가 소아치과라 아이도 편해하네요.</mark>', tags:['전문의 3인','소아 전용층']}
  ],
  faqs:[
    {q:'아이 첫 치과 방문은 언제가 좋나요?', a:'첫 유치가 나오는 생후 12개월 전후에 첫 방문을 권장합니다. 늦어도 만 2세 이전에는 첫 검진을 받으시는 것이 좋습니다.'},
    {q:'웃음가스는 안전한가요?', a:'아산화질소(N2O)는 소아치과에서 가장 오래 사용된 진정법으로 매우 안전합니다. 흡입을 중단하면 5분 이내에 정상 상태로 돌아옵니다.'},
    {q:'수면치료는 어떤 경우에 필요한가요?', a:'치과 공포증이 심하거나, 치료할 치아가 많은 경우, 장애가 있는 경우에 권장합니다. 전문 마취팀의 모니터링 하에 안전하게 진행됩니다.'},
    {q:'유치 충치도 치료해야 하나요?', a:'반드시 치료해야 합니다. 유치 충치를 방치하면 영구치에 영향을 주고, 올바른 영구치 맹출을 방해할 수 있습니다.'},
    {q:'실란트는 몇 살부터 가능한가요?', a:'만 6세경 첫 번째 영구 어금니(제1대구치)가 나오면 바로 실란트를 적용하는 것이 좋습니다.'}
  ],
  ctaH2:'우리 아이 치아 건강, 전문가에게 맡기세요',
  ctaDesc:'소아치과 전문의 3인이 아이의 건강한 치아 성장을 함께합니다.',
  ...nav('pediatric.html')
},

// ═══ 5. 심미치료 ═══
{
  file:'aesthetic.html', title:'심미치료',
  desc:'서울비디치과 심미치료 — 라미네이트, 올세라믹, 잇몸 성형 등 자연스러운 아름다움',
  keywords:'천안 심미치료, 서울비디치과 라미네이트, 올세라믹',
  badgeIcon:'fas fa-smile-beam', badgeText:'전문센터',
  heroH1:'자신 있게 웃으세요,<br><span class="text-gradient">아름다운 미소 디자인</span>',
  heroDesc:'라미네이트, 올세라믹, 잇몸 성형 등 개인 맞춤 심미 치료로 자연스럽고 아름다운 미소를 완성합니다.',
  heroStats:[{value:'5F',label:'심미 전용층'},{value:'DSD',label:'디지털 디자인'},{value:'원내기공',label:'맞춤 제작'}],
  concernType:'grid',
  concernH2:'이런 <span class="text-gradient">고민</span>이 있으신가요?',
  concernSub:'심미치료로 해결할 수 있습니다',
  concerns:[
    {icon:'fas fa-tint', title:'치아 변색', text:'커피, 와인, 흡연 등으로 치아가 변색되셨나요?'},
    {icon:'fas fa-th-large', title:'치아 모양 불만', text:'치아가 작거나, 모양이 고르지 않으신가요?'},
    {icon:'fas fa-arrows-alt-h', title:'치아 사이 공간', text:'앞니 사이가 벌어져 있거나 부정교합이 있으신가요?'},
    {icon:'fas fa-grin-beam', title:'잇몸 노출', text:'웃을 때 잇몸이 많이 보여 고민이신가요?'}
  ],
  optionH2:'심미치료 <span class="text-gradient">솔루션</span>',
  optionSub:'고민별 맞춤 심미치료를 제안드립니다',
  options:[
    {icon:'fas fa-gem', title:'포세린 라미네이트', desc:'치아 표면에 얇은 도자기를 부착하여 모양과 색상을 개선합니다. 최소 삭제로 자연치아를 보존합니다.', tags:['최소삭제','E.max 소재','10년+ 내구성'], link:'glownate.html'},
    {icon:'fas fa-crown', title:'올세라믹 크라운', desc:'금속 없이 전체 세라믹으로 제작하여 자연치아와 동일한 투명도와 색상을 재현합니다.', tags:['금속 프리','자연스러운 투명도','높은 강도'], link:'crown.html'},
    {icon:'fas fa-sun', title:'전문 미백', desc:'오피스 미백과 홈 미백을 병행하여 치아의 자연스러운 밝기를 되찾아드립니다.', tags:['오피스+홈 미백','2~4톤 업','민감도 최소화'], link:'whitening.html'},
    {icon:'fas fa-cut', title:'잇몸 성형', desc:'과도하게 보이는 잇몸(거미 스마일)을 교정하여 균형 잡힌 스마일 라인을 만들어드립니다.', tags:['거미 스마일 교정','레이저 시술','빠른 회복']}
  ],
  diffH2:'서울비디 심미치료가 <span class="text-gradient">특별한 이유</span>',
  diffSub:'결과가 다른 이유가 있습니다',
  diffs:[
    {title:'디지털 스마일 디자인', desc:'DSD 시스템으로 시술 전 최종 결과를 미리 확인합니다.'},
    {title:'원내 기공소', desc:'전담 기공사가 색상, 형태, 투명도를 정밀 맞춤 제작합니다.'},
    {title:'최소삭제 원칙', desc:'자연치아를 최대한 보존하는 최소 삭제 원칙을 지킵니다.'},
    {title:'프리미엄 소재', desc:'E.max, 지르코니아 등 세계 최고급 세라믹 소재만 사용합니다.'}
  ],
  processH2:'심미치료 <span class="text-gradient">치료 과정</span>',
  processSub:'상담부터 완성까지',
  process:[
    {title:'정밀 상담 & DSD', desc:'안면 분석과 구강 스캔으로 디지털 스마일 디자인을 진행합니다.'},
    {title:'치료 계획 확정', desc:'시뮬레이션 결과를 확인하고 최적의 치료 방법을 확정합니다.'},
    {title:'시술 진행', desc:'최소 삭제 후 정밀 인상을 채득하고 임시 보철물을 장착합니다.'},
    {title:'최종 장착', desc:'맞춤 제작된 보철물을 정밀하게 접착하고 교합을 조정합니다.'},
    {title:'사후 관리', desc:'정기 검진으로 장기적인 유지 관리를 돕습니다.'}
  ],
  reviews:[
    {name:'이**님', source:'naver', text:'앞니 라미네이트 6개 했는데 <mark>진짜 자연치아 같아요.</mark> DSD로 미리 결과를 봐서 안심이 됐어요.', tags:['라미네이트','DSD']},
    {name:'김**님', source:'google', text:'올세라믹 크라운으로 바꿨는데 <mark>기존 보철이랑 완전 달라요.</mark> 금속선이 안 보여서 좋습니다.', tags:['올세라믹','자연스러운 결과']}
  ],
  faqs:[
    {q:'라미네이트 수명은 얼마나 되나요?', a:'E.max 포세린 기준 10~15년 이상 사용 가능합니다. 정기 검진과 올바른 관리로 더 오래 유지할 수 있습니다.'},
    {q:'치아를 많이 깎아야 하나요?', a:'최소삭제 원칙으로 0.3~0.5mm만 삭제합니다. 기존 라미네이트보다 훨씬 적은 양입니다.'},
    {q:'심미치료 비용은 어떻게 되나요?', a:'치료 종류와 개수에 따라 달라집니다. <a href="../pricing.html" style="color:var(--color-primary);font-weight:600;">비용 안내 페이지</a>에서 확인하세요.'},
    {q:'시술 후 바로 식사가 가능한가요?', a:'임시 보철 기간에는 부드러운 음식을 권장합니다. 최종 장착 후에는 정상 식사가 가능합니다.'}
  ],
  ctaH2:'자신 있는 미소, 심미치료로 시작하세요',
  ...nav('aesthetic.html')
},

// ═══ 6. 충치치료 ═══
{
  file:'cavity.html', title:'충치치료',
  desc:'서울비디치과 충치치료 — 충치의 범위와 깊이에 따라 레진, 인레이, 크라운 등 최적의 치료를 제공합니다',
  keywords:'천안 충치치료, 서울비디치과 충치치료, 레진, 인레이',
  badgeIcon:'fas fa-tooth', badgeText:'보존치료',
  heroH1:'<span class="text-gradient">충치치료</span>, 조기 발견이 핵심입니다',
  heroDesc:'충치의 진행 정도에 따라 레진, 인레이, 크라운 등 상황에 맞는 최적의 치료를 제공합니다. 자연치아 보존을 최우선으로 합니다.',
  heroStats:[{value:'당일치료',label:'소형 충치'},{value:'정밀진단',label:'충치탐지 염색'},{value:'15인',label:'보존 전문의'}],
  concernType:'grid',
  concernH2:'혹시 이런 <span class="text-gradient">증상</span>이 있으신가요?',
  concernSub:'작은 증상도 방치하면 큰 치료로 이어집니다',
  concerns:[
    {icon:'fas fa-ice-cream', title:'찬 음식에 시린 느낌', text:'아이스크림, 찬 음료를 마실 때 치아가 시려오거나 찌릿한 느낌이 드시나요?'},
    {icon:'fas fa-cookie-bite', title:'단 것에 불편함', text:'초콜릿이나 사탕을 먹을 때 특정 치아에서 불편함이 느껴지시나요?'},
    {icon:'fas fa-search', title:'검은 점이 보임', text:'거울로 볼 때 치아에 검은 점이나 구멍 같은 게 보이시나요?'},
    {icon:'fas fa-bolt', title:'씹을 때 통증', text:'음식을 씹을 때 특정 치아에서 통증이 느껴지시나요?'}
  ],
  stageH2:'충치 <span class="text-gradient">단계별 치료</span>',
  stageSub:'충치의 진행 정도에 따라 치료 방법이 달라집니다',
  stages:[
    {title:'초기 충치', label:'무증상', labelClass:'mild', desc:'법랑질에만 국한된 초기 충치입니다.', symptoms:['증상 없음','검진 시 발견'], treatment:'불소도포 또는 레진 충전'},
    {title:'중기 충치', label:'시린 증상', labelClass:'caution', desc:'상아질까지 진행된 충치입니다.', symptoms:['시린 증상','단 것에 반응'], treatment:'레진 또는 인레이'},
    {title:'심부 충치', label:'통증 발생', labelClass:'danger', desc:'치수(신경)에 근접한 깊은 충치입니다.', symptoms:['자발적 통증','뜨거운 것에 반응'], treatment:'신경치료 + 크라운'},
    {title:'치수 감염', label:'응급', labelClass:'critical', desc:'신경이 감염되어 농양이 생긴 상태입니다.', symptoms:['심한 통증','잇몸 부종','발열'], treatment:'응급 신경치료 + 항생제'}
  ],
  optionH2:'충치 범위에 따른 <span class="text-gradient">치료 옵션</span>',
  optionSub:'최소 침습으로 자연치아를 최대한 보존합니다',
  options:[
    {icon:'fas fa-syringe', title:'레진 충전', desc:'작은 충치에 적합합니다. 자연치아 색상에 맞춰 당일 치료가 가능합니다.', tags:['소형 충치','당일 치료','심미적'], link:'resin.html'},
    {icon:'fas fa-puzzle-piece', title:'인레이/온레이', desc:'중~대형 충치에 적합합니다. 정밀하게 제작하여 단단하고 오래 사용합니다.', tags:['중·대형 충치','정밀 제작','높은 내구성'], link:'inlay.html'},
    {icon:'fas fa-crown', title:'크라운', desc:'치아 손상이 큰 경우 전체를 감싸는 보철입니다. 신경치료 후 필수입니다.', tags:['심한 손상','신경치료 후','완전 보호'], link:'crown.html'}
  ],
  diffH2:'서울비디 충치치료가 <span class="text-gradient">다른 이유</span>',
  diffSub:'자연치아 보존을 최우선으로 합니다',
  diffs:[
    {title:'충치탐지 염색법', desc:'충치 부분만 정확히 염색하여 건강한 치아는 보존하고 충치만 정밀 제거합니다.'},
    {title:'현미경 보존치료', desc:'고배율 현미경으로 충치 부위를 정밀하게 확인하고 최소 삭제를 실현합니다.'},
    {title:'디지털 인상', desc:'구강스캐너로 정밀한 디지털 인상을 채득하여 정확한 맞춤 수복물을 제작합니다.'},
    {title:'프리미엄 소재', desc:'변색 없는 고품질 레진과 세라믹 인레이를 사용하여 장기적 내구성을 보장합니다.'}
  ],
  processH2:'충치치료 <span class="text-gradient">치료 과정</span>',
  processSub:'정밀 진단부터 완성까지',
  process:[
    {title:'정밀 검진', desc:'엑스레이, 충치탐지 염색, 구강 검사로 충치의 범위와 깊이를 정확히 파악합니다.'},
    {title:'치료 계획 안내', desc:'충치 상태에 따른 최적의 치료 방법과 예상 비용을 투명하게 안내드립니다.'},
    {title:'충치 제거', desc:'충치탐지 염색법으로 감염 부위만 정밀하게 제거하고 건강한 치아를 최대한 보존합니다.'},
    {title:'수복물 충전/장착', desc:'레진 충전(당일) 또는 인레이/크라운 맞춤 제작 후 정밀하게 장착합니다.'},
    {title:'교합 조정 & 관리', desc:'편안한 교합이 되도록 조정하고, 정기 검진을 통한 예방 관리를 안내드립니다.'}
  ],
  preventionH2:'충치 <span class="text-gradient">예방법</span>',
  preventionSub:'올바른 습관이 최고의 예방입니다',
  prevention:[
    {icon:'fas fa-toothbrush', title:'올바른 칫솔질', text:'하루 3번, 식후 3분 이내, 3분 이상 올바른 방법으로 칫솔질하세요.'},
    {icon:'fas fa-teeth', title:'치실·치간칫솔', text:'칫솔만으로는 치아 사이 충치를 예방할 수 없습니다.'},
    {icon:'fas fa-calendar-check', title:'정기 검진', text:'6개월마다 정기 검진으로 초기 충치를 조기에 발견하세요.'},
    {icon:'fas fa-shield-alt', title:'불소도포', text:'정기적인 불소도포로 법랑질을 강화하고 충치를 예방합니다.'},
    {icon:'fas fa-candy-cane', title:'당분 섭취 줄이기', text:'사탕, 탄산음료 등 당분이 많은 음식을 줄이세요.'},
    {icon:'fas fa-child', title:'실란트', text:'어린이 영구치 어금니에 실란트를 적용하여 충치를 예방합니다.'}
  ],
  reviews:[
    {name:'정**님', source:'naver', text:'충치가 여러 개였는데 <mark>정말 필요한 치료만 해주셨어요.</mark> 과잉진료 없이 양심적으로 진료해주셔서 감사합니다.', tags:['양심 진료','보존치료']},
    {name:'이**님', source:'google', text:'충치탐지 염색으로 정확히 어디가 충치인지 보여주셔서 <mark>신뢰가 갔어요.</mark> 레진 치료도 빠르고 자연스러워요.', tags:['충치탐지','레진치료']}
  ],
  faqs:[
    {q:'충치치료는 아프나요?', a:'충분한 마취를 하기 때문에 치료 중 통증은 거의 없습니다. 마취 주사도 표면 마취 후 진행하여 불편감을 최소화합니다.'},
    {q:'충치치료 비용은 얼마인가요?', a:'레진 5~15만원, 인레이 20~40만원, 크라운 40~70만원 선입니다. 충치 범위와 재료에 따라 달라지며, <a href="../pricing.html" style="color:var(--color-primary);font-weight:600;">비용 안내</a>를 확인하세요.'},
    {q:'충치가 저절로 낫나요?', a:'아닙니다. 충치는 한번 생기면 자연 치유되지 않고 점점 진행됩니다. 초기에 치료할수록 간단하고 비용도 적게 듭니다.'},
    {q:'레진과 인레이의 차이점은?', a:'레진은 직접 충전(당일 치료)이고, 인레이는 정밀 제작(2회 내원)입니다. 충치가 크면 인레이가 더 적합합니다.'}
  ],
  ...nav('cavity.html')
},

// ═══ 7. 레진치료 ═══
{
  file:'resin.html', title:'레진치료',
  desc:'서울비디치과 레진치료 — 자연치아 색상에 맞춘 심미적 충치 수복',
  keywords:'천안 레진치료, 서울비디치과 레진, 레진 충전',
  badgeIcon:'fas fa-syringe', badgeText:'보존치료',
  heroH1:'당일 완료,<br><span class="text-gradient">자연치아 같은 레진치료</span>',
  heroDesc:'자연치아와 동일한 색상으로 충치를 수복합니다. 소형 충치는 당일 치료로 한 번에 마무리합니다.',
  concerns:[{problem:'충치가 작은데 꼭 치료해야 하나요?', solution:'작아도 진행되면 커집니다'},{problem:'레진이 오래가나요?', solution:'5~10년 이상, 정기 관리 시 더 길게'},{problem:'치료 후 티가 나지 않을까?', solution:'자연치아 색상 완벽 매칭'}],
  concernType:'rows',
  diffH2:'서울비디 레진치료가 <span class="text-gradient">다른 이유</span>',
  diffSub:'디테일이 결과를 만듭니다',
  diffs:[
    {title:'다층 레이어링 기법', desc:'여러 층으로 나누어 충전하여 자연치아의 색감과 투명도를 재현합니다.'},
    {title:'충치탐지 염색', desc:'감염된 부분만 정확히 제거하고 건강한 치아는 최대한 보존합니다.'},
    {title:'프리미엄 레진', desc:'변색 저항성이 높은 나노하이브리드 레진을 사용합니다.'},
    {title:'정밀 교합 조정', desc:'교합지, 디지털 교합 분석으로 편안한 교합을 구현합니다.'}
  ],
  processH2:'레진치료 <span class="text-gradient">과정</span>',
  processSub:'당일 완료되는 간편한 과정',
  process:[
    {title:'충치 진단', desc:'엑스레이와 충치탐지 염색으로 충치 범위를 정확히 확인합니다.'},
    {title:'마취 & 충치 제거', desc:'충분한 마취 후 감염 부위만 정밀하게 제거합니다.'},
    {title:'레진 충전', desc:'자연치아 색상에 맞는 레진을 다층으로 충전하고 광중합합니다.'},
    {title:'형태 조정 & 연마', desc:'자연치아와 동일한 형태로 조정하고 매끄럽게 연마합니다.'}
  ],
  reviews:[
    {name:'장**님', source:'naver', text:'레진 치료 받았는데 <mark>어디를 치료했는지 구분이 안 돼요.</mark> 색상 매칭이 완벽해요.', tags:['레진','심미적 결과']},
    {name:'한**님', source:'google', text:'작은 충치 2개를 <mark>30분 만에 끝냈어요.</mark> 빠르고 통증도 없었습니다.', tags:['당일치료','무통']}
  ],
  faqs:[
    {q:'레진 수명은 얼마나 되나요?', a:'일반적으로 5~10년입니다. 정기 검진과 올바른 구강 관리로 더 오래 유지할 수 있습니다.'},
    {q:'레진이 변색되나요?', a:'고품질 나노하이브리드 레진은 변색 저항성이 높습니다. 커피, 카레 등 착색 음식을 자주 드시면 약간의 변색이 있을 수 있습니다.'},
    {q:'레진과 아말감의 차이점은?', a:'레진은 치아색으로 심미적이고 접착력이 좋습니다. 아말감은 은색이며 현재 대부분 레진으로 대체되고 있습니다.'}
  ],
  ...nav('resin.html')
},

// ═══ 8. 인레이/온레이 ═══
{
  file:'inlay.html', title:'인레이/온레이',
  desc:'서울비디치과 인레이/온레이 — 중·대형 충치의 정밀 간접 수복 치료',
  keywords:'천안 인레이, 서울비디치과 온레이, 세라믹 인레이',
  badgeIcon:'fas fa-puzzle-piece', badgeText:'보존치료',
  heroH1:'정밀하게 제작,<br><span class="text-gradient">오래 가는 인레이/온레이</span>',
  heroDesc:'중·대형 충치를 정밀 제작한 수복물로 치료합니다. 세라믹, 금, 지르코니아 등 다양한 재료로 장기적인 내구성을 제공합니다.',
  concerns:[{problem:'충치가 큰데 크라운까지 해야 하나요?', solution:'인레이로 자연치아 최대 보존'},{problem:'어떤 재료가 좋은가요?', solution:'상태별 최적 소재 추천'},{problem:'인레이가 빠질 수 있나요?', solution:'정밀 접착으로 탈락 방지'}],
  concernType:'rows',
  optionH2:'인레이 <span class="text-gradient">소재 비교</span>',
  optionSub:'각 소재의 특성에 따라 최적의 선택을 안내드립니다',
  options:[
    {icon:'fas fa-gem', title:'세라믹 인레이', desc:'자연치아와 동일한 색상과 투명도를 재현합니다. 심미성이 뛰어납니다.', tags:['심미적','자연치아색','앞니·어금니']},
    {icon:'fas fa-ring', title:'금 인레이', desc:'가장 오래된 역사의 수복 재료입니다. 뛰어난 적합도와 내구성을 자랑합니다.', tags:['최고 내구성','뛰어난 적합도','어금니 추천']},
    {icon:'fas fa-shield-alt', title:'지르코니아 인레이', desc:'높은 강도와 심미성을 겸비한 소재입니다. 교합력이 강한 부위에 적합합니다.', tags:['높은 강도','심미적','강한 교합 부위']}
  ],
  diffH2:'서울비디 인레이가 <span class="text-gradient">다른 이유</span>',
  diffSub:'정밀 제작의 차이',
  diffs:[
    {title:'디지털 인상채득', desc:'구강스캐너로 정밀한 디지털 인상을 채득하여 오차를 최소화합니다.'},
    {title:'원내 기공소', desc:'기공사와 직접 소통하며 색상과 형태를 맞춤 제작합니다.'},
    {title:'현미경 정밀 치료', desc:'고배율 현미경으로 충치 제거와 인레이 적합도를 확인합니다.'},
    {title:'정밀 접착', desc:'접착면 처리와 프리미엄 접착제로 장기 유지력을 확보합니다.'}
  ],
  processH2:'인레이 <span class="text-gradient">치료 과정</span>',
  processSub:'2회 내원으로 완성',
  process:[
    {title:'정밀 검진 & 충치 제거', desc:'충치 범위를 확인하고 감염 부위를 정밀하게 제거합니다.'},
    {title:'디지털 인상채득', desc:'구강스캐너로 정밀한 인상을 채득하고 임시 충전합니다.'},
    {title:'맞춤 제작', desc:'원내 기공소에서 선택한 소재로 정밀 제작합니다.'},
    {title:'최종 장착', desc:'적합도를 확인하고 정밀 접착 후 교합을 조정합니다.'}
  ],
  reviews:[
    {name:'윤**님', source:'naver', text:'세라믹 인레이 했는데 <mark>진짜 자연치아랑 구분이 안 돼요.</mark> 디지털 스캐너로 하니까 편하더라고요.', tags:['세라믹 인레이','디지털']},
    {name:'조**님', source:'google', text:'금 인레이 10년째인데 <mark>아직도 멀쩡해요.</mark> 원내 기공소에서 맞춤 제작이라 딱 맞습니다.', tags:['금 인레이','내구성']}
  ],
  faqs:[
    {q:'인레이와 레진의 차이점은?', a:'레진은 직접 충전(당일 치료), 인레이는 정밀 제작(2회 내원)입니다. 충치가 크면 인레이가 더 적합하며 내구성이 높습니다.'},
    {q:'인레이 수명은 얼마나 되나요?', a:'세라믹 10~15년, 금 인레이 15~20년 이상 사용 가능합니다.'},
    {q:'인레이 치료 중 통증이 있나요?', a:'충분한 마취를 하므로 치료 중 통증은 없습니다. 임시 충전 기간에 약간의 시린 증상이 있을 수 있습니다.'}
  ],
  ...nav('inlay.html')
},

// ═══ 9. 크라운 ═══
{
  file:'crown.html', title:'크라운',
  desc:'서울비디치과 크라운 — 손상된 치아를 완전히 보호하는 정밀 보철 치료',
  keywords:'천안 크라운, 서울비디치과 크라운, 지르코니아 크라운',
  badgeIcon:'fas fa-crown', badgeText:'보존치료',
  heroH1:'손상된 치아를<br><span class="text-gradient">완전히 보호합니다</span>',
  heroDesc:'신경치료 후, 또는 크게 손상된 치아를 지르코니아·올세라믹 크라운으로 완전히 감싸 보호합니다.',
  concerns:[{problem:'신경치료 후 크라운이 꼭 필요한가요?', solution:'네, 치아 파절 방지 필수'},{problem:'금속 크라운이 보기 싫어요', solution:'치아색 지르코니아/세라믹'},{problem:'크라운이 빠질 수 있나요?', solution:'정밀 접착으로 장기 유지'}],
  concernType:'rows',
  optionH2:'크라운 <span class="text-gradient">소재 비교</span>',
  optionSub:'상태와 부위에 맞는 최적의 소재',
  options:[
    {icon:'fas fa-gem', title:'지르코니아', desc:'강도와 심미성을 모두 갖춘 프리미엄 소재입니다. 앞니·어금니 모두 적합합니다.', tags:['최고 강도','심미적','만능 소재']},
    {icon:'fas fa-star', title:'올세라믹 (E.max)', desc:'자연치아에 가장 가까운 투명도와 색상을 재현합니다. 앞니에 특히 적합합니다.', tags:['최고 심미성','자연스러운 투명도','앞니 추천']},
    {icon:'fas fa-crown', title:'PFM (도재 금속)', desc:'금속 위에 도자기를 소성한 전통적 크라운입니다. 보험 적용이 가능합니다.', tags:['보험 적용','경제적','일반적']}
  ],
  processH2:'크라운 <span class="text-gradient">치료 과정</span>',
  processSub:'정밀한 2회 내원 과정',
  process:[
    {title:'치아 삭제 & 인상', desc:'크라운 장착을 위해 치아를 삭제하고 디지털 인상을 채득합니다.'},
    {title:'임시 크라운 장착', desc:'맞춤 제작 기간 동안 임시 크라운을 장착하여 일상생활을 보호합니다.'},
    {title:'원내 기공소 제작', desc:'전담 기공사가 색상과 형태를 정밀하게 맞춤 제작합니다.'},
    {title:'최종 크라운 장착', desc:'적합도와 색상을 확인 후 정밀 접착하고 교합을 조정합니다.'}
  ],
  diffs:[
    {title:'원내 기공소', desc:'외주 없이 원내에서 직접 제작하여 색상·형태 맞춤도가 높습니다.'},
    {title:'디지털 인상', desc:'구강스캐너로 정밀한 인상을 채득하여 오차를 최소화합니다.'},
    {title:'프리미엄 소재', desc:'독일 Ivoclar, VITA 등 세계 최고급 소재만 사용합니다.'}
  ],
  diffH2:'서울비디 크라운이 <span class="text-gradient">다른 이유</span>',
  diffSub:'원내 기공소의 정밀 맞춤',
  reviews:[
    {name:'강**님', source:'naver', text:'앞니 올세라믹 크라운 했는데 <mark>원래 제 치아처럼 자연스러워요.</mark> 원내 기공소 덕분인 것 같습니다.', tags:['올세라믹','앞니']},
    {name:'최**님', source:'google', text:'지르코니아 크라운 추천해주셨는데 <mark>단단하고 색상도 자연스러워요.</mark>', tags:['지르코니아','내구성']}
  ],
  faqs:[
    {q:'크라운 수명은 얼마나 되나요?', a:'지르코니아/올세라믹은 10~15년 이상, PFM은 7~10년 사용 가능합니다. 관리에 따라 더 오래 유지됩니다.'},
    {q:'크라운 치료 기간은?', a:'일반적으로 2회 내원, 약 1~2주 소요됩니다.'},
    {q:'크라운이 빠지면 어떻게 하나요?', a:'빠진 크라운을 보관하시고 가능한 빨리 내원해주세요. 재접착 또는 새 크라운 제작이 필요할 수 있습니다.'}
  ],
  ...nav('crown.html')
},

// ═══ 10. 신경치료 ═══
{
  file:'root-canal.html', title:'신경치료',
  desc:'서울비디치과 신경치료 — 자연치아 보존을 위한 정밀 근관치료',
  keywords:'천안 신경치료, 서울비디치과 근관치료, 치수염',
  badgeIcon:'fas fa-heartbeat', badgeText:'보존치료',
  heroH1:'자연치아를 살리는<br><span class="text-gradient">정밀 신경치료</span>',
  heroDesc:'감염된 신경(치수)을 제거하고 근관을 정밀하게 세척·충전하여 자연치아를 보존합니다. 발치 전 최후의 보존 치료입니다.',
  heroStats:[{value:'현미경',label:'정밀 근관치료'},{value:'Ni-Ti',label:'로터리 파일'},{value:'보존',label:'자연치아 살리기'}],
  concerns:[{problem:'신경치료가 너무 아프다던데요', solution:'충분한 마취로 무통 치료'},{problem:'치아를 뽑아야 하나요?', solution:'신경치료로 자연치아 보존'},{problem:'치료가 여러 번 필요한가요?', solution:'일반 2~3회, 난이도에 따라'}],
  concernType:'rows',
  diffH2:'서울비디 신경치료가 <span class="text-gradient">다른 이유</span>',
  diffSub:'정밀함이 성공률을 결정합니다',
  diffs:[
    {title:'현미경 근관치료', desc:'고배율 현미경으로 미세한 근관을 정밀하게 확인하며 치료합니다.'},
    {title:'Ni-Ti 로터리 파일', desc:'유연한 니켈-티타늄 파일로 만곡 근관도 안전하게 성형합니다.'},
    {title:'전자근관장측정기', desc:'근관의 길이를 전자적으로 정밀 측정하여 최적의 충전을 합니다.'},
    {title:'3D CT 근관 분석', desc:'복잡한 근관 구조를 3D CT로 사전 분석하여 치료 성공률을 높입니다.'}
  ],
  processH2:'신경치료 <span class="text-gradient">과정</span>',
  processSub:'정밀한 3~4단계 치료',
  process:[
    {title:'진단 & 마취', desc:'엑스레이·3D CT로 감염 범위를 확인하고 충분히 마취합니다.'},
    {title:'근관 접근 & 세척', desc:'감염된 치수를 제거하고 근관 내부를 정밀하게 세척·소독합니다.'},
    {title:'근관 성형 & 충전', desc:'Ni-Ti 파일로 근관을 성형하고 밀봉 소재로 정밀 충전합니다.'},
    {title:'크라운 장착', desc:'신경치료 완료 후 크라운을 장착하여 치아를 보호합니다.'}
  ],
  reviews:[
    {name:'서**님', source:'naver', text:'발치하라는 치아를 <mark>신경치료로 살려주셨어요.</mark> 현미경으로 꼼꼼하게 해주셔서 결과도 좋습니다.', tags:['신경치료','치아 보존']},
    {name:'한**님', source:'google', text:'신경치료 무서웠는데 <mark>마취가 잘 되어서 전혀 안 아팠어요.</mark>', tags:['무통치료','마취']}
  ],
  faqs:[
    {q:'신경치료가 아프나요?', a:'충분한 마취를 하므로 치료 중 통증은 거의 없습니다. 치료 후 1~2일 약간의 불편감이 있을 수 있습니다.'},
    {q:'신경치료 후 크라운이 필수인가요?', a:'네, 신경치료 후 치아는 약해지므로 크라운으로 보호해야 파절을 방지합니다.'},
    {q:'신경치료 기간은?', a:'일반적으로 2~3회 내원, 1~2주 소요됩니다. 감염이 심한 경우 더 걸릴 수 있습니다.'},
    {q:'신경치료 후 치아가 변색되나요?', a:'약간의 변색이 있을 수 있으나, 크라운을 장착하면 심미적 문제는 해결됩니다.'}
  ],
  ...nav('root-canal.html')
},

// ═══ 11~24: 간결 데이터 ═══

// 11. 재신경치료
{
  file:'re-root-canal.html', title:'재신경치료',
  desc:'서울비디치과 재신경치료 — 이전 신경치료 실패 케이스의 정밀 재치료',
  keywords:'천안 재신경치료, 서울비디치과 재근관치료',
  badgeIcon:'fas fa-redo', badgeText:'보존치료',
  heroH1:'실패한 신경치료도<br><span class="text-gradient">다시 살립니다</span>',
  heroDesc:'이전 신경치료가 실패한 경우, 현미경과 3D CT를 활용한 정밀 재신경치료로 자연치아를 보존합니다.',
  heroStats:[{value:'현미경',label:'정밀 재치료'},{value:'3D CT',label:'근관 분석'},{value:'높은',label:'성공률'}],
  concerns:[{problem:'신경치료를 했는데 또 아파요', solution:'근관 내 잔존 감염 정밀 제거'},{problem:'발치하라는데 다른 방법 없나요?', solution:'재신경치료로 치아 보존 시도'},{problem:'재치료 성공률이 낮다던데', solution:'현미경+3D CT로 성공률 향상'}],
  concernType:'rows',
  diffH2:'재신경치료가 <span class="text-gradient">다른 이유</span>', diffSub:'현미경이 만드는 차이',
  diffs:[
    {title:'현미경 정밀 재치료', desc:'이전 충전재를 안전하게 제거하고 놓친 근관을 찾아 치료합니다.'},
    {title:'3D CT 정밀 분석', desc:'복잡한 근관 구조와 감염 범위를 사전에 정확히 파악합니다.'},
    {title:'초음파 기구', desc:'초음파 기구로 기존 충전재와 포스트를 안전하게 제거합니다.'},
    {title:'MTA 충전', desc:'생체적합성이 높은 MTA로 근첨부를 정밀 밀봉합니다.'}
  ],
  processH2:'재신경치료 <span class="text-gradient">과정</span>', processSub:'정밀한 단계별 치료',
  process:[
    {title:'3D CT 정밀 분석', desc:'감염 원인과 근관 구조를 3D CT로 정밀 분석합니다.'},
    {title:'기존 충전재 제거', desc:'현미경 하에서 이전 충전재와 포스트를 안전하게 제거합니다.'},
    {title:'근관 재세척·소독', desc:'놓친 근관을 찾고, 잔존 감염을 철저히 세척·소독합니다.'},
    {title:'정밀 재충전', desc:'MTA 등 생체적합 소재로 근관을 정밀하게 밀봉합니다.'},
    {title:'크라운 재장착', desc:'새 크라운을 제작·장착하여 치아를 보호합니다.'}
  ],
  reviews:[{name:'이**님', source:'naver', text:'다른 치과에서 발치하라고 했는데 <mark>재신경치료로 살려주셨어요.</mark> 현미경 치료 덕분입니다.', tags:['재신경치료','치아 보존']}],
  faqs:[
    {q:'재신경치료 성공률은 얼마나 되나요?', a:'현미경과 3D CT를 활용하면 70~80% 이상의 성공률을 보입니다.'},
    {q:'재치료 기간은 얼마나 걸리나요?', a:'일반적으로 3~5회 내원, 2~4주 소요됩니다.'},
    {q:'재치료 후에도 실패하면?', a:'치근단절제술(apicoectomy)로 추가 치료가 가능합니다.'}
  ],
  ...nav('re-root-canal.html')
},

// 12. 치근단절제술
{
  file:'apicoectomy.html', title:'치근단절제술',
  desc:'서울비디치과 치근단절제술 — 신경치료 실패 후 치아를 보존하는 마지막 치료',
  keywords:'천안 치근단절제술, 서울비디치과 apicoectomy',
  badgeIcon:'fas fa-cut', badgeText:'보존치료',
  heroH1:'발치 전 마지막 방법,<br><span class="text-gradient">치근단절제술</span>',
  heroDesc:'신경치료·재신경치료 후에도 감염이 남아있는 경우, 수술적으로 치근 끝의 감염 부위를 제거하여 치아를 보존합니다.',
  concerns:[{problem:'신경치료를 여러 번 했는데 안 낫아요', solution:'수술적 감염 제거'},{problem:'수술이 무섭고 아플 것 같아요', solution:'충분한 마취 + 미세수술'},{problem:'발치하고 임플란트가 낫지 않나요?', solution:'자연치아 보존이 우선'}],
  concernType:'rows',
  processH2:'치근단절제술 <span class="text-gradient">과정</span>', processSub:'미세수술 기법으로 정밀하게',
  process:[
    {title:'3D CT 정밀 진단', desc:'감염 범위와 주변 해부학적 구조를 3차원으로 분석합니다.'},
    {title:'마취 & 잇몸 절개', desc:'충분한 마취 후 해당 부위의 잇몸을 절개합니다.'},
    {title:'감염 조직·치근단 제거', desc:'현미경 하에서 감염 조직과 치근 끝 3mm를 절제합니다.'},
    {title:'MTA 역충전', desc:'절제된 치근단에 MTA 소재로 역충전하여 밀봉합니다.'},
    {title:'봉합 & 회복', desc:'잇몸을 봉합하고 약 1주일 후 발사합니다.'}
  ],
  diffs:[{title:'미세수술 기법', desc:'현미경과 미세수술 기구로 주변 조직 손상을 최소화합니다.'},{title:'MTA 역충전', desc:'생체적합성이 높은 MTA로 정밀 밀봉하여 재감염을 방지합니다.'},{title:'3D CT 사전 분석', desc:'수술 전 정밀한 3D 분석으로 안전한 수술을 보장합니다.'}],
  diffH2:'서울비디 치근단절제술의 <span class="text-gradient">차이</span>', diffSub:'미세수술이 결과를 만듭니다',
  reviews:[{name:'박**님', source:'naver', text:'발치하려다 <mark>치근단절제술로 치아를 살렸어요.</mark> 수술 후 통증도 적었습니다.', tags:['치근단절제술','치아 보존']}],
  faqs:[
    {q:'수술 시간은 얼마나 걸리나요?', a:'보통 30분~1시간 정도 소요됩니다.'},
    {q:'수술 후 통증이 심한가요?', a:'진통제로 관리 가능한 수준입니다. 대부분 2~3일 내 호전됩니다.'},
    {q:'성공률은 얼마나 되나요?', a:'현미경 미세수술 기법으로 85~95%의 높은 성공률을 보입니다.'}
  ],
  ...nav('apicoectomy.html')
},

// 13. 미백
{
  file:'whitening.html', title:'미백',
  desc:'서울비디치과 미백 — 전문 오피스 미백과 홈 미백으로 밝고 환한 미소',
  keywords:'천안 미백, 서울비디치과 치아미백, 화이트닝',
  badgeIcon:'fas fa-sun', badgeText:'심미치료',
  heroH1:'환하게 빛나는<br><span class="text-gradient">자신감 있는 미소</span>',
  heroDesc:'전문 오피스 미백과 맞춤 홈 미백으로 치아의 자연스러운 밝기를 되찾아드립니다. 2~4톤 업그레이드.',
  concerns:[{problem:'미백이 치아에 해롭지 않나요?', solution:'안전한 전문 미백 시스템'},{problem:'시린 증상이 걱정돼요', solution:'민감도 최소화 기술'},{problem:'효과가 오래 가나요?', solution:'1~2년, 관리로 유지 가능'}],
  concernType:'rows',
  optionH2:'미백 <span class="text-gradient">프로그램</span>', optionSub:'목표에 맞는 맞춤 미백',
  options:[
    {icon:'fas fa-clinic-medical', title:'오피스 미백', desc:'치과에서 고농도 미백제로 1~2회 시술합니다. 빠른 효과를 원하시는 분께 추천.', tags:['1~2회 시술','즉각적 효과','전문가 시술']},
    {icon:'fas fa-home', title:'홈 미백', desc:'맞춤 트레이에 저농도 미백제를 넣어 집에서 2~4주 사용합니다.', tags:['맞춤 트레이','점진적 효과','편리한 사용']},
    {icon:'fas fa-star', title:'듀얼 미백', desc:'오피스 + 홈 미백을 병행하여 최대 효과를 냅니다.', tags:['최대 효과','오피스+홈','추천']}
  ],
  processH2:'미백 <span class="text-gradient">치료 과정</span>', processSub:'간편한 미백 과정',
  process:[
    {title:'치아 상태 검진', desc:'미백 적합성을 확인하고 현재 치아 색상을 기록합니다.'},
    {title:'스케일링', desc:'치석과 착색을 제거하여 미백 효과를 극대화합니다.'},
    {title:'미백 시술', desc:'잇몸 보호 후 미백제를 도포하고 광선을 조사합니다.'},
    {title:'결과 확인 & 유지 관리', desc:'미백 결과를 확인하고 유지 방법을 안내드립니다.'}
  ],
  reviews:[{name:'김**님', source:'naver', text:'듀얼 미백 받았는데 <mark>3톤이나 밝아졌어요.</mark> 시린 증상도 거의 없었습니다.', tags:['듀얼 미백','톤 업']}],
  faqs:[
    {q:'미백 효과는 얼마나 지속되나요?', a:'개인차가 있으나 1~2년 유지됩니다. 커피, 와인 등을 자제하면 더 오래 유지됩니다.'},
    {q:'미백이 치아에 해롭나요?', a:'전문 미백은 법랑질에 영향을 주지 않습니다. 일시적 시린 증상이 있을 수 있으나 자연 회복됩니다.'}
  ],
  ...nav('whitening.html')
},

// 14. 브릿지
{
  file:'bridge.html', title:'브릿지',
  desc:'서울비디치과 브릿지 — 상실 치아를 인접 치아로 연결하는 보철 치료',
  keywords:'천안 브릿지, 서울비디치과 보철, 치아 브릿지',
  badgeIcon:'fas fa-link', badgeText:'보철치료',
  heroH1:'빈 자리를 채우는<br><span class="text-gradient">자연스러운 브릿지</span>',
  heroDesc:'상실된 치아 부위를 양쪽 인접 치아에 연결하여 기능과 심미성을 회복합니다.',
  concerns:[{problem:'빠진 치아를 방치하면 안 되나요?', solution:'인접 치아 이동·교합 장애 발생'},{problem:'임플란트가 무서워요', solution:'브릿지로 비수술적 보철'},{problem:'기간은 얼마나 걸리나요?', solution:'약 2주, 2회 내원'}],
  concernType:'rows',
  processH2:'브릿지 <span class="text-gradient">치료 과정</span>', processSub:'2회 내원으로 완성',
  process:[
    {title:'검진 & 치료 계획', desc:'상실 치아 부위를 검진하고 최적의 브릿지 설계를 수립합니다.'},
    {title:'인접 치아 삭제 & 인상', desc:'양쪽 지대치를 삭제하고 정밀 인상을 채득합니다.'},
    {title:'맞춤 제작', desc:'원내 기공소에서 지르코니아/세라믹 브릿지를 제작합니다.'},
    {title:'최종 장착', desc:'적합도를 확인하고 정밀 접착합니다.'}
  ],
  diffs:[{title:'원내 기공소', desc:'색상과 형태를 정밀하게 맞춤 제작합니다.'},{title:'프리미엄 소재', desc:'지르코니아, 올세라믹 등 고급 소재를 사용합니다.'},{title:'정밀 접착', desc:'장기 유지를 위한 프리미엄 접착 시스템을 적용합니다.'}],
  diffH2:'서울비디 브릿지의 <span class="text-gradient">차이</span>', diffSub:'정밀 맞춤의 차이',
  reviews:[{name:'조**님', source:'naver', text:'브릿지 장착 후 <mark>편하게 씹을 수 있어서 좋아요.</mark> 자연스러운 색상도 만족합니다.', tags:['브릿지','자연스러운']}],
  faqs:[
    {q:'브릿지와 임플란트 중 어떤 것이 좋나요?', a:'장기적으로는 임플란트가 유리하지만, 수술 부담이 크거나 전신 질환이 있는 경우 브릿지가 적합합니다.'},
    {q:'브릿지 수명은?', a:'7~15년 사용 가능합니다. 관리에 따라 달라집니다.'}
  ],
  ...nav('bridge.html')
},

// 15. 틀니
{
  file:'denture.html', title:'틀니',
  desc:'서울비디치과 틀니 — 정밀 맞춤 의치로 편안한 저작과 아름다운 미소',
  keywords:'천안 틀니, 서울비디치과 의치, 부분틀니',
  badgeIcon:'fas fa-smile', badgeText:'보철치료',
  heroH1:'편안하게 드시고,<br><span class="text-gradient">자신 있게 웃으세요</span>',
  heroDesc:'정밀한 맞춤 제작과 세심한 조정으로 잘 맞고 자연스러운 틀니를 제공합니다.',
  concerns:[{problem:'틀니가 잘 안 맞아 불편해요', solution:'정밀 맞춤 + 세심한 조정'},{problem:'틀니가 빠질까 걱정돼요', solution:'정밀 유지력 + 임플란트 틀니'},{problem:'음식을 제대로 못 씹어요', solution:'교합 분석 기반 최적 설계'}],
  concernType:'rows',
  optionH2:'틀니 <span class="text-gradient">종류</span>', optionSub:'상태에 맞는 최적의 의치',
  options:[
    {icon:'fas fa-teeth', title:'총의치(완전틀니)', desc:'모든 치아가 상실된 경우 사용합니다.', tags:['전체 상실','아크릴·금속상']},
    {icon:'fas fa-th-large', title:'부분의치(부분틀니)', desc:'일부 치아가 남아있는 경우 사용합니다.', tags:['일부 상실','잔존 치아 활용']},
    {icon:'fas fa-cog', title:'임플란트 오버덴쳐', desc:'임플란트 2~4개로 틀니를 고정하여 뛰어난 유지력을 제공합니다.', tags:['높은 유지력','안정적','추천']}
  ],
  processH2:'틀니 <span class="text-gradient">제작 과정</span>', processSub:'정밀한 맞춤 제작',
  process:[
    {title:'정밀 검진', desc:'잔존 치아, 잇몸 상태를 검사하고 치료 계획을 수립합니다.'},
    {title:'정밀 인상', desc:'개인 맞춤 트레이로 정밀한 인상을 채득합니다.'},
    {title:'교합 채득 & 시적', desc:'교합을 측정하고 왁스 모형으로 시적하여 확인합니다.'},
    {title:'최종 장착 & 조정', desc:'완성된 틀니를 장착하고 세밀하게 조정합니다.'}
  ],
  reviews:[{name:'김**님', source:'naver', text:'임플란트 오버덴쳐 했는데 <mark>일반 틀니와 차원이 다릅니다.</mark> 단단한 음식도 잘 씹어요.', tags:['오버덴쳐','유지력']}],
  faqs:[
    {q:'틀니 적응 기간은 얼마나 되나요?', a:'보통 2~4주 적응 기간이 필요합니다. 여러 번의 조정을 통해 편안하게 맞춰드립니다.'},
    {q:'틀니로 단단한 음식도 먹을 수 있나요?', a:'임플란트 오버덴쳐의 경우 대부분의 음식을 드실 수 있습니다. 일반 틀니는 약간의 제한이 있을 수 있습니다.'}
  ],
  ...nav('denture.html')
},

// 16. 스케일링
{
  file:'scaling.html', title:'스케일링',
  desc:'서울비디치과 스케일링 — 치석 제거와 잇몸 건강 관리',
  keywords:'천안 스케일링, 서울비디치과 치석제거',
  badgeIcon:'fas fa-spray-can', badgeText:'잇몸/예방',
  heroH1:'건강한 잇몸의 시작,<br><span class="text-gradient">전문 스케일링</span>',
  heroDesc:'초음파 스케일링으로 치석과 치태를 제거하고 잇몸 건강을 지킵니다. 보험 적용으로 부담 없이 받으세요.',
  heroStats:[{value:'보험적용',label:'연 1회'},{value:'30분',label:'시술 시간'},{value:'예방',label:'잇몸질환'}],
  concerns:[{problem:'스케일링이 아프다던데요', solution:'부분 마취로 통증 최소화'},{problem:'치아 사이가 벌어지지 않나요?', solution:'치석이 차지한 공간이 비는 것'},{problem:'얼마나 자주 해야 하나요?', solution:'6개월~1년 간격 권장'}],
  concernType:'rows',
  processH2:'스케일링 <span class="text-gradient">과정</span>', processSub:'간편하고 빠른 관리',
  process:[
    {title:'구강 검진', desc:'치석 분포와 잇몸 상태를 확인합니다.'},
    {title:'초음파 스케일링', desc:'초음파 기구로 치석과 치태를 안전하게 제거합니다.'},
    {title:'연마 & 불소도포', desc:'치아 표면을 연마하고 불소를 도포하여 강화합니다.'},
    {title:'잇몸 상태 점검', desc:'잇몸 건강 상태를 확인하고 관리 방법을 안내합니다.'}
  ],
  reviews:[{name:'이**님', source:'naver', text:'스케일링 후 <mark>입안이 개운해졌어요.</mark> 부분 마취 해주셔서 전혀 안 아팠습니다.', tags:['스케일링','무통']}],
  faqs:[
    {q:'스케일링 보험 적용이 되나요?', a:'만 19세 이상 연 1회 건강보험이 적용됩니다. 본인부담금은 약 1~2만원입니다.'},
    {q:'스케일링 후 시린 증상이 있나요?', a:'치석이 많았던 경우 일시적으로 시릴 수 있으나 1~2주 내 자연 회복됩니다.'}
  ],
  ...nav('scaling.html')
},

// 17. 잇몸치료
{
  file:'gum.html', title:'잇몸치료',
  desc:'서울비디치과 잇몸치료 — 잇몸 염증과 출혈을 치료하여 치아를 지킵니다',
  keywords:'천안 잇몸치료, 서울비디치과 치주치료, 잇몸 염증',
  badgeIcon:'fas fa-band-aid', badgeText:'잇몸치료',
  heroH1:'잇몸이 보내는 <span class="text-gradient">경고 신호</span>,<br>놓치지 마세요',
  heroDesc:'잇몸 출혈, 붓기, 시린 증상은 잇몸질환의 초기 신호입니다. 조기 치료로 치아 상실을 예방합니다.',
  heroStats:[{value:'조기치료',label:'치아 보존'},{value:'레이저',label:'잇몸치료'},{value:'정기관리',label:'재발 방지'}],
  concernType:'grid',
  concernH2:'이런 <span class="text-gradient">증상</span>이 있으신가요?',
  concernSub:'하나라도 해당되면 잇몸치료가 필요합니다',
  concerns:[
    {icon:'fas fa-tint', title:'칫솔질 시 출혈', text:'칫솔질할 때 잇몸에서 피가 나시나요?'},
    {icon:'fas fa-tooth', title:'잇몸이 붓고 빨개요', text:'잇몸이 부어오르고 빨갛게 변했나요?'},
    {icon:'fas fa-level-down-alt', title:'잇몸이 내려갔어요', text:'치아가 길어 보이거나 뿌리가 드러났나요?'},
    {icon:'fas fa-wind', title:'입냄새가 심해요', text:'양치를 해도 입냄새가 계속 나시나요?'}
  ],
  stageH2:'잇몸질환 <span class="text-gradient">단계</span>', stageSub:'조기 발견이 중요합니다',
  stages:[
    {title:'치은염', label:'초기', labelClass:'mild', desc:'잇몸에만 염증이 있는 단계입니다.', symptoms:['잇몸 출혈','약간의 붓기'], treatment:'스케일링 + 잇몸 관리'},
    {title:'초기 치주염', label:'주의', labelClass:'caution', desc:'잇몸뼈 흡수가 시작된 단계입니다.', symptoms:['잇몸 후퇴','시린 증상'], treatment:'스케일링 + 치근활택술'},
    {title:'중등도 치주염', label:'위험', labelClass:'danger', desc:'잇몸뼈가 상당히 흡수된 단계입니다.', symptoms:['치아 흔들림','농 배출'], treatment:'잇몸수술 + 골이식'},
    {title:'심도 치주염', label:'심각', labelClass:'critical', desc:'치아 유지가 어려운 단계입니다.', symptoms:['심한 흔들림','자연 탈락 위험'], treatment:'잇몸수술 또는 발치'}
  ],
  processH2:'잇몸치료 <span class="text-gradient">과정</span>', processSub:'단계별 체계적 치료',
  process:[
    {title:'잇몸 정밀 검진', desc:'잇몸 상태, 치주낭 깊이, 골 흡수 정도를 측정합니다.'},
    {title:'스케일링 & 치근활택', desc:'치석을 제거하고 치근 표면을 매끄럽게 합니다.'},
    {title:'잇몸수술 (필요 시)', desc:'중등도 이상인 경우 잇몸수술로 염증 조직을 제거합니다.'},
    {title:'정기 관리', desc:'3~4개월 간격으로 정기적인 잇몸 관리를 합니다.'}
  ],
  reviews:[{name:'최**님', source:'naver', text:'잇몸에서 피가 많이 났는데 <mark>치료 후 완전히 좋아졌어요.</mark> 정기 관리도 꼼꼼히 해주십니다.', tags:['잇몸치료','출혈 개선']}],
  faqs:[
    {q:'잇몸치료는 아프나요?', a:'스케일링·치근활택술은 부분 마취로 통증 없이 진행됩니다. 잇몸수술도 충분한 마취를 합니다.'},
    {q:'잇몸이 다시 나빠질 수 있나요?', a:'정기적인 관리를 하지 않으면 재발할 수 있습니다. 3~4개월 간격의 정기 관리가 중요합니다.'}
  ],
  ...nav('gum.html')
},

// 18. 잇몸수술
{
  file:'gum-surgery.html', title:'잇몸수술',
  desc:'서울비디치과 잇몸수술 — 중증 잇몸질환의 외과적 치료',
  keywords:'천안 잇몸수술, 서울비디치과 치주수술, 골이식',
  badgeIcon:'fas fa-procedures', badgeText:'잇몸/외과',
  heroH1:'흔들리는 치아를<br><span class="text-gradient">다시 단단하게</span>',
  heroDesc:'중증 치주질환으로 흡수된 잇몸뼈를 재건하고 치아를 보존하는 전문 잇몸수술을 제공합니다.',
  concerns:[{problem:'치아가 흔들리는데 발치해야 하나요?', solution:'잇몸수술+골이식으로 보존'},{problem:'잇몸수술이 무섭고 아플 것 같아요', solution:'충분한 마취 + 미세수술'},{problem:'수술 후 회복이 오래 걸리나요?', solution:'1~2주 기본 회복, 일상 가능'}],
  concernType:'rows',
  processH2:'잇몸수술 <span class="text-gradient">과정</span>', processSub:'정밀한 수술적 치료',
  process:[
    {title:'정밀 검진 & 계획', desc:'치주낭 측정, 3D CT로 골 흡수 범위를 파악합니다.'},
    {title:'마취 & 잇몸 절개', desc:'충분한 마취 후 잇몸을 절개하여 병변에 접근합니다.'},
    {title:'염증 조직 제거', desc:'감염된 잇몸 조직과 치석을 철저히 제거합니다.'},
    {title:'골이식 (필요 시)', desc:'흡수된 뼈 부위에 골이식재를 적용하여 뼈를 재건합니다.'},
    {title:'봉합 & 회복 관리', desc:'잇몸을 봉합하고 회복을 위한 주의사항을 안내합니다.'}
  ],
  reviews:[{name:'서**님', source:'naver', text:'치아가 많이 흔들렸는데 <mark>잇몸수술 후 다시 단단해졌어요.</mark> 발치 안 하고 살릴 수 있어서 감사합니다.', tags:['잇몸수술','치아 보존']}],
  faqs:[
    {q:'잇몸수술 후 통증이 심한가요?', a:'진통제로 관리 가능합니다. 대부분 2~3일 후 호전됩니다.'},
    {q:'잇몸수술 비용은?', a:'범위와 골이식 여부에 따라 달라집니다. 일부 보험 적용이 가능합니다.'}
  ],
  diffs:[{title:'현미경 미세수술', desc:'최소 침습으로 빠른 회복을 돕습니다.'},{title:'골이식 전문', desc:'흡수된 뼈를 재건하여 치아 보존율을 높입니다.'}],
  diffH2:'서울비디 잇몸수술의 <span class="text-gradient">차이</span>', diffSub:'미세수술 기법의 장점',
  ...nav('gum-surgery.html')
},

// 19. 치주염
{
  file:'periodontitis.html', title:'치주염',
  desc:'서울비디치과 치주염 치료 — 치주 조직의 염증성 질환 체계적 치료',
  keywords:'천안 치주염, 서울비디치과 풍치, 잇몸질환',
  badgeIcon:'fas fa-disease', badgeText:'잇몸치료',
  heroH1:'치주염,<br><span class="text-gradient">체계적으로 관리합니다</span>',
  heroDesc:'치주염은 잇몸뼈까지 파괴되는 심각한 질환입니다. 조기 발견과 체계적인 치료로 치아를 보존합니다.',
  concernType:'grid',
  concernH2:'치주염 <span class="text-gradient">위험 신호</span>', concernSub:'이런 증상이 있다면 즉시 검진하세요',
  concerns:[
    {icon:'fas fa-tint', title:'잇몸 출혈', text:'칫솔질이나 식사 시 잇몸에서 피가 납니다.'},
    {icon:'fas fa-wind', title:'심한 입냄새', text:'양치를 해도 입냄새가 지속됩니다.'},
    {icon:'fas fa-arrows-alt-v', title:'치아 흔들림', text:'치아가 흔들리거나 위치가 변합니다.'},
    {icon:'fas fa-level-down-alt', title:'잇몸 후퇴', text:'잇몸이 내려가 치아가 길어 보입니다.'}
  ],
  processH2:'치주염 <span class="text-gradient">치료 과정</span>', processSub:'단계별 체계적 치료',
  process:[
    {title:'치주 정밀 검진', desc:'치주낭 측정, 방사선 검사, 세균 검사로 정확히 진단합니다.'},
    {title:'비수술적 치료', desc:'스케일링, 치근활택술로 치석과 감염 조직을 제거합니다.'},
    {title:'수술적 치료 (필요 시)', desc:'중등도 이상은 잇몸수술, 골이식 등 수술적 치료를 합니다.'},
    {title:'유지 관리', desc:'3~4개월 간격 정기 관리로 재발을 방지합니다.'}
  ],
  reviews:[{name:'박**님', source:'naver', text:'치주염이 심했는데 <mark>체계적인 치료 후 잇몸이 많이 좋아졌어요.</mark> 정기 관리 덕분입니다.', tags:['치주염','체계적 치료']}],
  faqs:[
    {q:'치주염이 완치되나요?', a:'완전한 완치는 어렵지만, 체계적인 치료와 관리로 진행을 멈추고 상태를 유지할 수 있습니다.'},
    {q:'치주염 예방법은?', a:'올바른 칫솔질, 치실 사용, 정기 스케일링이 가장 중요합니다.'}
  ],
  ...nav('periodontitis.html')
},

// 20. 사랑니 발치
{
  file:'wisdom-tooth.html', title:'사랑니 발치',
  desc:'서울비디치과 사랑니 발치 — 매복 사랑니 안전한 발치, 수면 발치 가능',
  keywords:'천안 사랑니, 서울비디치과 사랑니 발치, 매복 사랑니',
  badgeIcon:'fas fa-tooth', badgeText:'외과',
  heroH1:'걱정 마세요,<br><span class="text-gradient">안전한 사랑니 발치</span>',
  heroDesc:'매복 사랑니, 수평 매복, 신경 인접 사랑니까지. 3D CT 분석으로 안전하게 발치합니다.',
  heroStats:[{value:'3D CT',label:'정밀 분석'},{value:'수면발치',label:'통증 Zero'},{value:'당일',label:'발치 가능'}],
  concerns:[{problem:'사랑니 발치가 너무 무서워요', solution:'수면 발치로 편안하게'},{problem:'매복 사랑니가 신경 옆이래요', solution:'3D CT 정밀 분석 후 안전 발치'},{problem:'양쪽 다 한번에 빼도 되나요?', solution:'상태에 따라 동시 발치 가능'}],
  concernType:'rows',
  typeH2:'사랑니 <span class="text-gradient">유형별 발치</span>', typeSub:'사랑니 상태에 따른 맞춤 발치',
  types:[
    {icon:'fas fa-tooth', title:'정상 맹출 사랑니', desc:'정상적으로 나왔지만 관리가 어려운 사랑니입니다.', features:['단순 발치','짧은 시술 시간','빠른 회복'], recommend:'정상 맹출, 충치 발생'},
    {icon:'fas fa-arrows-alt-h', title:'수평 매복 사랑니', desc:'옆으로 누워서 자라는 사랑니입니다. 인접 치아에 충치나 염증을 유발합니다.', features:['외과적 발치','뼈 삭제 필요','주의 깊은 수술'], recommend:'수평 매복, 인접 치아 영향'},
    {icon:'fas fa-exclamation-triangle', title:'신경 인접 사랑니', desc:'하치조 신경에 근접한 고난도 사랑니입니다.', features:['3D CT 필수','신경 손상 최소화','전문의 수술'], recommend:'고난도, 신경 인접'}
  ],
  processH2:'사랑니 발치 <span class="text-gradient">과정</span>', processSub:'안전한 단계별 발치',
  process:[
    {title:'3D CT 분석', desc:'사랑니 위치, 뿌리 형태, 신경 거리를 정밀 분석합니다.'},
    {title:'마취 (수면 선택)', desc:'충분한 마취를 합니다. 수면 발치를 원하시면 수면 마취를 적용합니다.'},
    {title:'안전한 발치', desc:'최소 침습 기법으로 주변 조직 손상을 최소화하며 발치합니다.'},
    {title:'지혈 & 사후 관리', desc:'발치 부위를 관리하고 회복을 위한 주의사항을 안내합니다.'}
  ],
  reviews:[{name:'정**님', source:'naver', text:'매복 사랑니 4개를 수면 발치로 <mark>한 번에 다 뽑았어요.</mark> 정말 편했습니다!', tags:['수면 발치','매복 사랑니']}],
  faqs:[
    {q:'사랑니를 꼭 빼야 하나요?', a:'정상적으로 나와서 관리가 가능하면 뽑지 않아도 됩니다. 매복, 충치, 염증이 있다면 발치를 권장합니다.'},
    {q:'발치 후 붓기는 얼마나 가나요?', a:'보통 2~3일째 가장 붓고, 1주일 이내에 가라앉습니다.'},
    {q:'한 번에 여러 개 뽑아도 되나요?', a:'상태에 따라 동시 발치가 가능합니다. 수면 발치 시 4개 동시 발치도 가능합니다.'}
  ],
  ...nav('wisdom-tooth.html')
},

// 21. 응급진료
{
  file:'emergency.html', title:'응급진료',
  desc:'서울비디치과 응급진료 — 365일 치과 응급 상황 대응',
  keywords:'천안 응급치과, 서울비디치과 응급진료, 야간치과',
  badgeIcon:'fas fa-ambulance', badgeText:'응급진료',
  heroH1:'365일, 치과 응급상황<br><span class="text-gradient">즉시 대응합니다</span>',
  heroDesc:'갑작스러운 치통, 치아 파절, 보철물 탈락 등 치과 응급 상황에 365일 신속하게 대응합니다.',
  heroStats:[{value:'365일',label:'응급 대응'},{value:'야간 20시',label:'평일 진료'},{value:'즉시',label:'응급 처치'}],
  concernType:'grid',
  concernH2:'이런 <span class="text-gradient">응급 상황</span>이라면', concernSub:'즉시 내원해주세요',
  concerns:[
    {icon:'fas fa-bolt', title:'극심한 치통', text:'참을 수 없는 치통이 발생했나요?'},
    {icon:'fas fa-tooth', title:'치아 파절/탈락', text:'사고나 충격으로 치아가 부러지거나 빠졌나요?'},
    {icon:'fas fa-crown', title:'보철물 탈락', text:'크라운, 브릿지 등 보철물이 빠졌나요?'},
    {icon:'fas fa-tint', title:'심한 출혈', text:'발치 후 또는 잇몸에서 심한 출혈이 있나요?'}
  ],
  processH2:'응급진료 <span class="text-gradient">대응 과정</span>', processSub:'신속한 응급 처치',
  process:[
    {title:'전화 접수', desc:'041-415-2892로 연락하시면 응급 상황을 확인하고 안내드립니다.'},
    {title:'즉시 내원', desc:'가능한 빨리 내원해주세요. 탈락된 치아는 우유에 담가 가져오세요.'},
    {title:'응급 처치', desc:'통증 관리, 지혈, 임시 보철, 치아 재식립 등 즉각적인 처치를 합니다.'},
    {title:'후속 치료 안내', desc:'응급 처치 후 필요한 후속 치료 계획을 안내드립니다.'}
  ],
  precautionH2:'응급 시 <span class="text-gradient">자가 대처</span>', precautionSub:'내원 전 이렇게 하세요',
  precautions:[
    {icon:'fas fa-tooth', title:'치아가 빠졌을 때', items:['빠진 치아를 우유에 담그세요','뿌리 부분을 만지지 마세요','30분 이내 내원하면 재식립 가능성 ↑']},
    {icon:'fas fa-tint', title:'출혈이 심할 때', items:['깨끗한 거즈를 물고 30분간 압박','고개를 약간 높이 하세요','지혈이 안 되면 즉시 내원']}
  ],
  reviews:[{name:'김**님', source:'naver', text:'주말에 치통이 심해서 연락했더니 <mark>바로 대응해주셨어요.</mark> 365일 진료가 정말 든든합니다.', tags:['365일','응급진료']}],
  faqs:[
    {q:'야간에도 응급진료가 가능한가요?', a:'평일 20시까지 진료합니다. 진료 시간 내에 연락주시면 응급 대응이 가능합니다.'},
    {q:'주말에도 응급 치료를 받을 수 있나요?', a:'토·일 09:00~17:00 진료합니다. 365일 진료 체제로 운영하고 있습니다.'}
  ],
  ...nav('emergency.html')
},

// 22. 턱관절장애
{
  file:'tmj.html', title:'턱관절장애',
  desc:'서울비디치과 턱관절장애 — 턱관절 통증, 소리, 개구장애 전문 치료',
  keywords:'천안 턱관절, 서울비디치과 TMJ, 턱관절 통증',
  badgeIcon:'fas fa-head-side-cough', badgeText:'기타 진료',
  heroH1:'턱이 아프고 소리가 나시나요?<br><span class="text-gradient">턱관절장애 전문 치료</span>',
  heroDesc:'턱관절 통증, 클릭 소리, 개구장애 등 다양한 턱관절 문제를 정확히 진단하고 체계적으로 치료합니다.',
  concernType:'grid',
  concernH2:'이런 <span class="text-gradient">증상</span>이 있으신가요?', concernSub:'턱관절장애의 대표 증상입니다',
  concerns:[
    {icon:'fas fa-volume-up', title:'턱에서 소리', text:'입을 벌릴 때 "뚝" 또는 "딱" 소리가 나시나요?'},
    {icon:'fas fa-lock', title:'입이 안 벌어져요', text:'입을 크게 벌리기 어렵거나 제한이 있나요?'},
    {icon:'fas fa-head-side-virus', title:'턱·두통', text:'턱 주변이나 관자놀이에 통증이 있나요?'},
    {icon:'fas fa-ear-listen', title:'귀 통증', text:'귀 앞쪽에 통증이 느껴지시나요?'}
  ],
  processH2:'턱관절 <span class="text-gradient">치료 과정</span>', processSub:'정확한 진단이 치료의 시작',
  process:[
    {title:'정밀 진단', desc:'턱관절 전용 검사, 3D CT, 교합 분석으로 원인을 파악합니다.'},
    {title:'교합 안정장치', desc:'맞춤 스프린트(교합 안정장치)를 제작·착용합니다.'},
    {title:'물리치료 & 약물', desc:'근육 이완, 물리치료, 필요 시 약물 치료를 병행합니다.'},
    {title:'교합 조정', desc:'교합 이상이 원인인 경우 교합 조정을 진행합니다.'},
    {title:'경과 관찰', desc:'증상 변화를 모니터링하고 치료 계획을 조정합니다.'}
  ],
  reviews:[{name:'안**님', source:'naver', text:'턱에서 계속 소리가 났는데 <mark>스프린트 착용 후 많이 좋아졌어요.</mark> 정확한 원인 진단이 중요하더라고요.', tags:['턱관절','스프린트']}],
  faqs:[
    {q:'턱관절 소리만 나고 안 아프면 괜찮나요?', a:'소리만 나는 경우에도 진행될 수 있으므로 검진을 권장합니다.'},
    {q:'턱관절장애는 완치되나요?', a:'대부분 보존적 치료로 증상이 크게 개선됩니다. 완치까지 수개월 걸릴 수 있습니다.'},
    {q:'스프린트는 언제 착용하나요?', a:'주로 수면 시 착용합니다. 증상에 따라 주간 착용이 필요할 수도 있습니다.'}
  ],
  ...nav('tmj.html')
},

// 23. 이갈이/이악물기
{
  file:'bruxism.html', title:'이갈이/이악물기',
  desc:'서울비디치과 이갈이/이악물기 치료 — 수면 중 이갈이, 이악물기 전문 치료',
  keywords:'천안 이갈이, 서울비디치과 이악물기, 브럭시즘',
  badgeIcon:'fas fa-moon', badgeText:'기타 진료',
  heroH1:'수면 중 이갈이,<br><span class="text-gradient">치아를 보호하세요</span>',
  heroDesc:'이갈이·이악물기는 치아 마모, 파절, 턱관절 장애의 주요 원인입니다. 맞춤 나이트가드로 치아를 보호합니다.',
  concernType:'grid',
  concernH2:'이런 <span class="text-gradient">증상</span>이 있으신가요?', concernSub:'이갈이의 대표적인 신호입니다',
  concerns:[
    {icon:'fas fa-tooth', title:'치아 마모', text:'치아 끝이 닳아서 짧아지거나 납작해졌나요?'},
    {icon:'fas fa-head-side-virus', title:'아침 두통', text:'아침에 일어나면 머리가 아프거나 턱이 뻐근한가요?'},
    {icon:'fas fa-bolt', title:'시린 증상', text:'원인 모를 시린 증상이 여러 치아에서 느껴지나요?'},
    {icon:'fas fa-volume-up', title:'이갈이 소리', text:'가족이 수면 중 이갈이 소리를 들었나요?'}
  ],
  processH2:'이갈이 <span class="text-gradient">치료 과정</span>', processSub:'원인을 찾고 치아를 보호합니다',
  process:[
    {title:'정밀 진단', desc:'치아 마모 패턴, 교합 분석, 턱관절 검사로 원인을 파악합니다.'},
    {title:'맞춤 나이트가드 제작', desc:'디지털 인상으로 정밀한 맞춤 나이트가드를 제작합니다.'},
    {title:'착용 교육 & 조정', desc:'나이트가드를 착용하고 교합을 정밀 조정합니다.'},
    {title:'정기 점검', desc:'정기적으로 나이트가드 상태를 점검하고 필요 시 조정합니다.'}
  ],
  reviews:[{name:'이**님', source:'naver', text:'아침마다 두통이 심했는데 <mark>나이트가드 착용 후 확 줄었어요.</mark> 치아 마모도 예방되니 일석이조입니다.', tags:['나이트가드','이갈이']}],
  faqs:[
    {q:'나이트가드를 매일 착용해야 하나요?', a:'네, 수면 시 매일 착용하는 것을 권장합니다. 착용하지 않으면 이갈이로 인한 손상이 지속됩니다.'},
    {q:'이갈이가 완치되나요?', a:'스트레스 등 원인이 해결되면 줄어들 수 있지만, 대부분 나이트가드로 지속적인 보호가 필요합니다.'},
    {q:'나이트가드 수명은?', a:'약 1~2년입니다. 마모 상태에 따라 교체 시기가 달라집니다.'}
  ],
  ...nav('bruxism.html')
},

// 24. 예방진료
{
  file:'prevention.html', title:'예방진료',
  desc:'서울비디치과 예방진료 — 정기검진, 불소도포, 실란트로 치아 건강을 지킵니다',
  keywords:'천안 예방진료, 서울비디치과 정기검진, 불소도포, 실란트',
  badgeIcon:'fas fa-shield-alt', badgeText:'예방진료',
  heroH1:'치료보다 <span class="text-gradient">예방</span>이<br>최선입니다',
  heroDesc:'정기검진, 불소도포, 실란트 등 예방 프로그램으로 충치와 잇몸질환을 사전에 방지합니다.',
  heroStats:[{value:'6개월',label:'검진 주기'},{value:'불소',label:'법랑질 강화'},{value:'실란트',label:'어금니 보호'}],
  optionH2:'예방진료 <span class="text-gradient">프로그램</span>', optionSub:'체계적인 예방 관리',
  options:[
    {icon:'fas fa-stethoscope', title:'정기 구강검진', desc:'6개월마다 구강 전체를 검진하여 문제를 조기에 발견합니다.', tags:['6개월 간격','조기 발견','엑스레이 포함']},
    {icon:'fas fa-shield-alt', title:'불소도포', desc:'치아 표면에 불소를 도포하여 법랑질을 강화하고 충치를 예방합니다.', tags:['법랑질 강화','충치 예방','소아·성인']},
    {icon:'fas fa-fill', title:'실란트', desc:'어금니 홈을 메워 음식물과 세균이 끼는 것을 방지합니다.', tags:['어금니 보호','소아 필수','보험 적용']},
    {icon:'fas fa-spray-can', title:'전문 스케일링', desc:'치석과 치태를 제거하여 잇몸 건강을 유지합니다.', tags:['보험 적용','연 1회','잇몸 건강'], link:'scaling.html'}
  ],
  preventionH2:'올바른 <span class="text-gradient">구강 관리법</span>', preventionSub:'집에서 할 수 있는 예방법',
  prevention:[
    {icon:'fas fa-toothbrush', title:'바스법 칫솔질', text:'잇몸과 치아 경계부를 45도로 기울여 진동하듯 닦으세요.'},
    {icon:'fas fa-teeth', title:'치실 사용', text:'하루 1회 치실로 치아 사이를 청소하세요.'},
    {icon:'fas fa-tint', title:'가글 사용', text:'칫솔질 후 구강 청결제로 마무리하세요.'},
    {icon:'fas fa-candy-cane', title:'당분 줄이기', text:'탄산음료, 사탕 등 당분 섭취를 줄이세요.'},
    {icon:'fas fa-smoking-ban', title:'금연', text:'흡연은 잇몸질환의 주요 원인입니다.'},
    {icon:'fas fa-calendar-check', title:'정기 방문', text:'6개월마다 치과를 방문하여 검진받으세요.'}
  ],
  processH2:'예방진료 <span class="text-gradient">과정</span>', processSub:'체계적인 예방 관리',
  process:[
    {title:'구강 검진', desc:'시진, 엑스레이, 필요 시 구강 카메라로 정밀 검진합니다.'},
    {title:'스케일링', desc:'치석과 치태를 제거합니다.'},
    {title:'불소도포', desc:'불소 젤을 치아 표면에 도포하여 법랑질을 강화합니다.'},
    {title:'칫솔질 교육', desc:'올바른 칫솔질 방법과 구강 관리 요령을 안내합니다.'},
    {title:'다음 검진 예약', desc:'6개월 후 정기 검진을 예약합니다.'}
  ],
  reviews:[{name:'최**님', source:'naver', text:'6개월마다 검진 받으면서 <mark>3년째 충치가 하나도 안 생겼어요.</mark> 예방이 최고입니다.', tags:['정기검진','충치 예방']}],
  faqs:[
    {q:'불소도포는 안전한가요?', a:'네, 매우 안전합니다. 적정량의 불소는 치아를 강화하는 데 효과적이며 부작용이 거의 없습니다.'},
    {q:'실란트는 몇 살부터 가능한가요?', a:'만 6세경 첫 번째 영구 어금니가 나오면 바로 적용하는 것이 좋습니다. 보험이 적용됩니다.'},
    {q:'성인도 불소도포가 필요한가요?', a:'네, 성인도 충치 위험도에 따라 불소도포가 효과적입니다. 특히 시린 치아나 충치 발생률이 높은 분께 권장합니다.'}
  ],
  ctaH2:'예방이 최선의 치료입니다',
  ctaDesc:'6개월마다 한 번, 정기검진으로 건강한 치아를 유지하세요.',
  ...nav('prevention.html')
}

];
