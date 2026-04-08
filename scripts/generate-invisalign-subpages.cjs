/**
 * Invisalign 5종 상세 페이지 자동 생성 스크립트
 * BEST(Comprehensive), MODERATE, LIGHT, EXPRESS, FIRST
 * - 15 섹션: Hero, 정의, 고민 공감, 특징 6개, 차별점 4개, 치료 과정, 비교표, 비용, 후기, 추천 대상, FAQ 8-10개, 용어집, 다른 프로그램 카드, CTA, 법적 고지
 * - Full SEO: meta, OG, Twitter, Schema.org (BreadcrumbList, FAQPage, MedicalProcedure, Speakable)
 */
const fs = require('fs');
const path = require('path');

const PROGRAMS = [
  /* ────── 1. BEST (Comprehensive) ────── */
  {
    slug: 'invisalign-best',
    badge: 'BEST',
    badgeColor: '#6B4226',
    title: '인비절라인 컴프리헨시브',
    titleEn: 'Invisalign Comprehensive',
    icon: 'fa-eye-slash',
    metaTitle: '천안 인비절라인 컴프리헨시브 | 무제한 장치교체 5년 보장 — 서울비디치과',
    metaDesc: '천안 인비절라인 컴프리헨시브(BEST) — 무제한 장치 교체 5년 보장, 전체 교정, ClinCheck 3D 시뮬레이션. 서울대 교정 전문의, 다이아몬드 프로바이더. ☎041-415-2892',
    metaKeywords: '인비절라인 컴프리헨시브, 인비절라인 BEST, 인비절라인 전체교정, 천안 인비절라인 비용, 무제한 장치교체, ClinCheck, 투명교정 전체',
    heroSub: '무제한 장치 교체, 5년의 확실한 보장',
    heroDesc: '가장 복잡한 교정도 끝까지 책임집니다. 인비절라인 최상위 프로그램 — 무제한 장치 교체(5년 보장)로 완벽한 결과를 추구하는 "올인원" 교정 솔루션입니다.',
    heroStats: [
      {value:'무제한',label:'장치 교체'},
      {value:'5년',label:'보장 기간'},
      {value:'700만원',label:'투자 비용'}
    ],
    definition: '인비절라인 컴프리헨시브(Comprehensive)는 인비절라인의 최상위 패키지로, 5년간 무제한 장치 교체가 가능한 프로그램입니다. 전체 치열 교정, 복잡한 부정교합, 발치 교정 등 모든 유형의 교정 케이스를 커버합니다. ClinCheck 3D 시뮬레이션으로 최종 결과를 미리 확인하고, 중간에 계획을 수정하더라도 추가 비용 없이 새 장치 세트를 제작할 수 있어 가장 안정적인 선택입니다.',
    painPoints: [
      {problem:'"교정 범위가 큰데 투명교정이 가능할까?"', solution:'컴프리헨시브는 전체 교정 전문'},
      {problem:'"중간에 계획이 바뀌면 추가 비용이?"', solution:'5년간 무제한 교체, 추가 비용 없음'},
      {problem:'"교정 기간이 길어질까 걱정돼요"', solution:'AI 최적화 + 전문의 경험으로 단축'},
      {problem:'"발치 교정인데 투명교정이 되나요?"', solution:'컴프리헨시브라면 가능합니다'},
      {problem:'"교정 실패 후 재교정이 필요해요"', solution:'무제한 리파인먼트로 끝까지 보장'},
      {problem:'"비용이 부담되는데 가치가 있을까?"', solution:'가장 확실한 결과, 장기적 가성비 최고'}
    ],
    features: [
      {icon:'fa-infinity',title:'무제한 장치 교체',desc:'5년간 얼라이너를 무제한 교체할 수 있습니다. 중간 수정, 리파인먼트가 모두 포함되어 추가 비용 걱정이 없습니다.'},
      {icon:'fa-teeth',title:'전체 치열 교정',desc:'앞니부터 어금니까지 전체 치열을 움직입니다. 총생(덧니), 벌어짐, 돌출입, 교합 불일치 등 모든 케이스에 대응합니다.'},
      {icon:'fa-cube',title:'ClinCheck 3D 시뮬레이션',desc:'교정 전 최종 결과를 3D로 미리 확인합니다. 치아 이동 과정을 단계별 애니메이션으로 시뮬레이션합니다.'},
      {icon:'fa-sync-alt',title:'무제한 리파인먼트',desc:'교정 중 미세 조정이 필요하면 언제든 새 세트를 주문합니다. 완벽해질 때까지 멈추지 않습니다.'},
      {icon:'fa-user-md',title:'다이아몬드 프로바이더',desc:'서울비디치과는 연간 150+ 케이스의 다이아몬드 등급입니다. 풍부한 경험이 정확한 설계로 이어집니다.'},
      {icon:'fa-shield-alt',title:'서울대 교정 전문의 직접 설계',desc:'서울대 교정과 전문의가 ClinCheck 설계를 직접 검토하고 조정합니다. 본사 알고리즘 + 전문의 경험의 시너지입니다.'}
    ],
    diffs: [
      {title:'5년 무제한 — 업계 최장 보장',desc:'인비절라인 정식 5년 패키지. 중간 수정, 추가 세트 모두 무상입니다.'},
      {title:'발치 교정도 투명교정으로',desc:'컴프리헨시브만의 강점. 발치 후 공간 폐쇄도 투명 얼라이너로 정밀 컨트롤합니다.'},
      {title:'복잡한 케이스 전문',desc:'과개교합, 개방교합, 3급 부정교합 등 난이도 높은 케이스를 투명교정으로 해결합니다.'},
      {title:'교정·보철·심미 원스톱 설계',desc:'15인 전문의 협진으로 교정과 동시에 보철, 심미 치료를 통합 계획합니다.'}
    ],
    processSteps: [
      {title:'정밀 상담 & 3D 검진',desc:'3D CT, iTero 구강스캐너, 교합 분석, 안모 분석을 통해 현재 상태를 정확히 파악합니다.'},
      {title:'ClinCheck 설계 & 환자 확인',desc:'인비절라인 본사 AI + 전문의가 치료 계획을 설계합니다. 3D 시뮬레이션으로 최종 결과를 미리 확인합니다.'},
      {title:'맞춤 얼라이너 제작',desc:'미국 인비절라인 본사에서 환자 맞춤 얼라이너를 제작합니다. 약 2~3주 소요.'},
      {title:'장치 장착 & 착용 교육',desc:'첫 세트 장치를 장착하고 착용법, 관리법, 교체 주기를 안내합니다. 어태치먼트를 부착합니다.'},
      {title:'정기 내원 & 경과 관찰',desc:'4~8주 간격으로 내원. 치아 이동 상태를 확인하고 다음 장치 세트를 전달합니다.'},
      {title:'교정 완료 & 유지장치',desc:'목표 달성 후 유지장치(리테이너)를 장착합니다. 정기 검진으로 결과를 안정적으로 유지합니다.'}
    ],
    compareTable: {
      headers: ['비교 항목', '컴프리헨시브 (BEST)', '모더레이트', '라이트'],
      rows: [
        ['장치 교체', '<strong>무제한 (5년)</strong>', '23단계', '14단계'],
        ['교정 범위', '<strong>전체 교정</strong>', '중등도', '가벼운 교정'],
        ['리파인먼트', '<strong>무제한</strong>', '2회', '1회'],
        ['ClinCheck 3D', '✅', '✅', '✅'],
        ['발치 교정', '<strong>✅ 가능</strong>', '제한적', '❌'],
        ['교정 기간', '12~24개월', '10~18개월', '6~12개월'],
        ['비용', '700만원', '550만원', '450만원'],
        ['추천 케이스', '<strong>전체/복잡</strong>', '중등도', '경미']
      ]
    },
    reviews: [
      {name:'한',fullName:'한**님',source:'naver',text:'돌출입 발치 교정을 투명교정으로 했는데 <mark>정말 자연스럽게 변해서 주변에서 몰라요.</mark> 컴프리헨시브라 리파인먼트도 추가비용 없이 해줘서 좋았습니다.',tags:['발치 교정','컴프리헨시브']},
      {name:'이',fullName:'이**님',source:'google',text:'교정 5개월차인데 <mark>ClinCheck으로 최종 모습을 미리 봤을 때 확신이 생겼어요.</mark> 매번 장치 교체할 때마다 변하는 게 눈에 보여요.',tags:['ClinCheck','투명교정']},
      {name:'박',fullName:'박**님',source:'naver',text:'다른 병원에서 브라켓만 가능하다고 했는데 <mark>서울비디 다이아몬드 등급이라 투명교정으로 가능했어요.</mark> 직장인에게 투명교정 진짜 최고.',tags:['다이아몬드','직장인 교정']}
    ],
    recommends: ['전체 교정이 필요한 분','발치 교정 + 투명교정을 원하는 분','복잡한 부정교합인 분','완벽한 결과를 위해 리파인먼트를 원하는 분','장기간 교정이 예상되는 분'],
    costInfo: '700만원 (무이자 할부 가능)',
    faqs: [
      {q:'컴프리헨시브와 라이트의 가장 큰 차이는?',a:'장치 교체 횟수입니다. 컴프리헨시브는 5년간 무제한 교체가 가능하고, 라이트는 14단계로 제한됩니다. 교정 범위가 넓거나 리파인먼트가 필요한 경우 컴프리헨시브를 추천합니다.'},
      {q:'5년 보장이 끝나면 어떻게 되나요?',a:'5년 내에 교정이 완료되는 것이 일반적입니다. 만약 추가 조정이 필요하면 전문의와 상의하여 연장 여부를 결정합니다.'},
      {q:'발치 교정도 인비절라인으로 가능한가요?',a:'네, 컴프리헨시브 패키지는 발치 교정에 적합합니다. 발치 후 공간을 얼라이너로 정밀하게 폐쇄합니다. 다만 전문의 판단이 중요합니다.'},
      {q:'교정 중 장치를 잃어버리면?',a:'컴프리헨시브는 무제한 교체이므로 새 장치를 재제작할 수 있습니다. 다만 제작 기간이 필요하므로 이전 단계 장치를 착용하며 기다립니다.'},
      {q:'교정 기간은 얼마나 걸리나요?',a:'일반적으로 12~24개월이며, 케이스 난이도에 따라 달라집니다. ClinCheck 시뮬레이션으로 예상 기간을 미리 확인할 수 있습니다.'},
      {q:'하루에 몇 시간 착용해야 하나요?',a:'하루 20~22시간 착용이 권장됩니다. 식사와 양치 시에만 제거합니다.'},
      {q:'어태치먼트가 뭔가요?',a:'치아 표면에 부착하는 작은 레진 돌기입니다. 얼라이너가 치아를 더 효과적으로 이동시키도록 도와줍니다. 치아색이라 눈에 잘 띄지 않습니다.'},
      {q:'교정 중 충치가 생기면?',a:'얼라이너를 제거하고 충치 치료를 먼저 진행합니다. 치료 후 필요하면 얼라이너를 재제작합니다. 컴프리헨시브는 무제한 교체라 걱정 없습니다.'},
      {q:'인비절라인 vs 브라켓 교정, 어떤 게 나은가요?',a:'케이스에 따라 다릅니다. 심미성과 편의성을 원하면 인비절라인, 매우 복잡한 교합 문제가 있으면 <a href="/treatments/orthodontics" style="color:var(--brand);font-weight:600;">브라켓 교정</a>이 유리할 수 있습니다.'},
      {q:'무이자 할부가 가능한가요?',a:'네, 서울비디치과는 장기 무이자 할부를 지원합니다. <a href="/pricing" style="color:var(--brand);font-weight:600;">비용 안내 페이지</a>에서 자세한 할부 조건을 확인하세요.'}
    ],
    glossary: [
      {term:'컴프리헨시브',desc:'인비절라인의 최상위 패키지. 5년 무제한 장치 교체'},
      {term:'ClinCheck',desc:'인비절라인의 3D 디지털 치료 시뮬레이션 소프트웨어'},
      {term:'얼라이너',desc:'투명한 플라스틱 교정 장치. 2주마다 교체'},
      {term:'어태치먼트',desc:'치아에 부착하는 레진 돌기. 치아 이동 보조'},
      {term:'리파인먼트',desc:'추가 미세 조정을 위한 새 얼라이너 세트'},
      {term:'IPR',desc:'인접면 삭제. 치아 사이를 미세하게 다듬어 공간 확보'},
      {term:'오버바이트',desc:'과개교합. 윗니가 아랫니를 과도하게 덮는 상태'},
      {term:'리테이너',desc:'교정 후 치아 위치를 유지하는 유지장치'}
    ],
    price: '700'
  },

  /* ────── 2. MODERATE ────── */
  {
    slug: 'invisalign-moderate',
    badge: 'MODERATE',
    badgeColor: '#0369a1',
    title: '인비절라인 모더레이트',
    titleEn: 'Invisalign Moderate',
    icon: 'fa-sliders-h',
    metaTitle: '천안 인비절라인 모더레이트 | 중등도 교정 최적 — 서울비디치과',
    metaDesc: '천안 인비절라인 모더레이트 — 23단계 장치, ClinCheck 3D, 중등도 부정교합 최적. 합리적 비용의 효율적 교정. ☎041-415-2892',
    metaKeywords: '인비절라인 모더레이트, 인비절라인 Moderate, 중등도 교정, 23단계, ClinCheck, 천안 교정 비용',
    heroSub: '꼭 필요한 만큼, 합리적으로',
    heroDesc: '컴프리헨시브까지는 필요 없고, 라이트로는 부족한 분을 위한 골든 밸런스. 23단계 장치 세트로 중등도 부정교합을 효율적으로 교정합니다.',
    heroStats: [
      {value:'23단계',label:'장치 세트'},
      {value:'2회',label:'리파인먼트'},
      {value:'550만원',label:'합리적 비용'}
    ],
    definition: '인비절라인 모더레이트(Moderate)는 2025년 새롭게 추가된 중간 등급 패키지입니다. 23단계의 얼라이너와 2회의 리파인먼트가 포함되어, 컴프리헨시브보다 합리적인 비용으로 라이트보다 넓은 범위의 교정이 가능합니다. 앞니~소구치까지의 배열 교정, 가벼운 공간 폐쇄, 약간의 교합 조정이 필요한 케이스에 최적입니다.',
    painPoints: [
      {problem:'"컴프리헨시브는 비싸고 라이트는 부족해요"', solution:'딱 중간! 모더레이트가 정답'},
      {problem:'"앞니도 어금니도 좀 고쳐야 해요"', solution:'23단계로 넓은 범위 커버'},
      {problem:'"비용 대비 효과가 좋은 건?"', solution:'합리적 비용 + 충분한 교정력'},
      {problem:'"리파인먼트가 있으면 좋겠어요"', solution:'2회 리파인먼트 포함'},
      {problem:'"6개월이면 안 되고, 2년은 길어요"', solution:'10~18개월 적절한 기간'},
      {problem:'"ClinCheck 시뮬레이션 해보고 싶어요"', solution:'모더레이트도 ClinCheck 포함'}
    ],
    features: [
      {icon:'fa-layer-group',title:'23단계 맞춤 얼라이너',desc:'23단계의 정밀 설계된 얼라이너로 치아를 단계별로 이동시킵니다. 라이트(14단계)보다 넓은 범위를 커버합니다.'},
      {icon:'fa-cube',title:'ClinCheck 3D 시뮬레이션',desc:'교정 전 최종 결과를 3D로 미리 확인합니다. 치료 시작 전 결과에 대한 확신을 가질 수 있습니다.'},
      {icon:'fa-redo',title:'2회 리파인먼트 포함',desc:'교정 진행 중 미세 조정이 필요하면 2회까지 추가 세트를 제작할 수 있습니다. 완성도를 높입니다.'},
      {icon:'fa-balance-scale',title:'가격 대비 최적의 밸런스',desc:'컴프리헨시브의 80% 효과를 70% 비용으로. 가장 합리적인 가격 대 성능비를 제공합니다.'},
      {icon:'fa-user-md',title:'다이아몬드 프로바이더',desc:'서울비디치과의 풍부한 경험으로 23단계 내에서 최적의 결과를 설계합니다.'},
      {icon:'fa-clock',title:'적절한 치료 기간',desc:'10~18개월의 적절한 기간. 너무 길지도, 짧지도 않은 효율적인 교정입니다.'}
    ],
    diffs: [
      {title:'2025년 신규 패키지',desc:'인비절라인이 새롭게 추가한 골든 밸런스 등급입니다.'},
      {title:'컴프리헨시브 대비 150만원 절약',desc:'충분한 교정력을 유지하면서 비용은 합리적입니다.'},
      {title:'리파인먼트 2회 포함',desc:'라이트(1회)보다 여유 있는 미세 조정이 가능합니다.'},
      {title:'교정 전문의 + AI 협업 설계',desc:'23단계를 최대한 효율적으로 활용하도록 전문의가 설계합니다.'}
    ],
    processSteps: [
      {title:'정밀 상담 & 3D 검진',desc:'3D CT, iTero 구강스캐너로 현재 상태를 분석합니다. 모더레이트 적합 여부를 판단합니다.'},
      {title:'ClinCheck 설계 & 확인',desc:'23단계 내에서 최적의 치료 계획을 수립합니다. 3D 시뮬레이션으로 결과를 미리 확인합니다.'},
      {title:'맞춤 얼라이너 제작',desc:'인비절라인 본사에서 23개의 맞춤 얼라이너를 제작합니다. 약 2~3주 소요.'},
      {title:'장치 장착 & 착용 교육',desc:'첫 세트를 장착하고 착용법과 관리법을 안내합니다.'},
      {title:'정기 내원 & 경과 관찰',desc:'4~6주 간격으로 내원하여 치아 이동을 확인합니다.'},
      {title:'교정 완료 & 유지장치',desc:'교정 완료 후 유지장치를 장착하여 결과를 유지합니다.'}
    ],
    compareTable: {
      headers: ['비교 항목', '컴프리헨시브', '모더레이트 (현재)', '라이트'],
      rows: [
        ['장치 교체', '무제한 (5년)', '<strong>23단계</strong>', '14단계'],
        ['리파인먼트', '무제한', '<strong>2회</strong>', '1회'],
        ['교정 범위', '전체', '<strong>중등도</strong>', '경미'],
        ['ClinCheck 3D', '✅', '✅', '✅'],
        ['교정 기간', '12~24개월', '<strong>10~18개월</strong>', '6~12개월'],
        ['비용', '700만원', '<strong>550만원</strong>', '450만원'],
        ['가격 대비 효율', '★★★★☆', '<strong>★★★★★</strong>', '★★★★☆']
      ]
    },
    reviews: [
      {name:'정',fullName:'정**님',source:'naver',text:'컴프리헨시브까지는 필요 없다고 해서 모더레이트로 했어요. <mark>23단계인데 충분히 좋아졌어요.</mark> 150만원 아꼈습니다!',tags:['모더레이트','비용 절약']},
      {name:'최',fullName:'최**님',source:'google',text:'앞니가 좀 삐뚤고 어금니도 살짝 틀어져 있었는데 <mark>모더레이트가 딱 맞는 범위</mark>였어요.',tags:['중등도 교정','모더레이트']},
      {name:'김',fullName:'김**님',source:'naver',text:'라이트로는 부족하다는데 컴프리헨시브는 과하다고. <mark>모더레이트가 정답이었어요.</mark>',tags:['골든 밸런스','합리적']}
    ],
    recommends: ['라이트로는 부족하고 컴프리헨시브까지는 필요 없는 분','앞니~소구치 범위의 배열 교정이 필요한 분','비용 대비 효율을 중시하는 분','10~18개월 교정 기간이 적절한 분','가벼운 교합 조정이 필요한 분'],
    costInfo: '550만원 (무이자 할부 가능)',
    faqs: [
      {q:'모더레이트는 언제 출시됐나요?',a:'2025년에 인비절라인이 새롭게 추가한 패키지입니다. 컴프리헨시브와 라이트 사이의 갭을 메우기 위해 만들어졌습니다.'},
      {q:'23단계가 부족하면 어떻게 하나요?',a:'2회의 리파인먼트가 포함되어 있어 미세 조정이 가능합니다. 만약 더 큰 범위의 교정이 필요하다면 컴프리헨시브로 업그레이드할 수 있습니다.'},
      {q:'모더레이트로 어떤 교정이 가능한가요?',a:'중등도 총생(덧니), 약간의 공간 폐쇄, 전치부 배열, 가벼운 교합 조정 등이 가능합니다. 심한 돌출입이나 발치 교정은 컴프리헨시브를 추천합니다.'},
      {q:'교정 기간은 얼마나 걸리나요?',a:'일반적으로 10~18개월입니다. 23단계 x 2주 교체 = 약 46주가 기본이며, 리파인먼트 포함 시 더 걸릴 수 있습니다.'},
      {q:'라이트와의 가장 큰 차이는?',a:'장치 수(23 vs 14)와 리파인먼트 횟수(2회 vs 1회)입니다. 교정 범위가 더 넓고 미세 조정의 여유가 더 있습니다.'},
      {q:'하루에 몇 시간 착용해야 하나요?',a:'하루 20~22시간 착용이 권장됩니다. 식사와 양치 시에만 제거합니다.'},
      {q:'교정 중 음식 제한이 있나요?',a:'없습니다. 식사 시 얼라이너를 제거하고 양치 후 다시 착용하면 됩니다.'},
      {q:'무이자 할부가 가능한가요?',a:'네, 서울비디치과는 장기 무이자 할부를 지원합니다.'}
    ],
    glossary: [
      {term:'모더레이트',desc:'인비절라인의 중간 등급 패키지. 23단계 + 2회 리파인먼트'},
      {term:'ClinCheck',desc:'인비절라인의 3D 디지털 치료 시뮬레이션'},
      {term:'얼라이너',desc:'투명한 플라스틱 교정 장치'},
      {term:'리파인먼트',desc:'추가 미세 조정을 위한 새 얼라이너 세트'},
      {term:'총생',desc:'치아가 겹쳐 나는 상태. 덧니'},
      {term:'어태치먼트',desc:'치아에 부착하는 레진 돌기'},
      {term:'IPR',desc:'인접면 삭제. 치아 사이를 미세하게 다듬어 공간 확보'},
      {term:'리테이너',desc:'교정 후 유지장치'}
    ],
    price: '550'
  },

  /* ────── 3. LIGHT ────── */
  {
    slug: 'invisalign-light',
    badge: 'LIGHT',
    badgeColor: '#059669',
    title: '인비절라인 라이트',
    titleEn: 'Invisalign Lite',
    icon: 'fa-magic',
    metaTitle: '천안 인비절라인 라이트 | 가벼운 교정 · 짧은 기간 — 서울비디치과',
    metaDesc: '천안 인비절라인 라이트 — 14단계 장치, 6~12개월 단기 교정. 앞니 배열, 가벼운 부정교합 전문. 경제적 투명교정. ☎041-415-2892',
    metaKeywords: '인비절라인 라이트, 인비절라인 Lite, 앞니 교정, 부분교정, 단기교정, 14단계, 경제적 교정',
    heroSub: '가볍게 시작하는 투명한 변화',
    heroDesc: '앞니 배열만 살짝 고치고 싶다면? 14단계 얼라이너로 6~12개월 내 교정을 완료합니다. 짧은 기간, 경제적 비용의 스마트한 선택입니다.',
    heroStats: [
      {value:'14단계',label:'장치 세트'},
      {value:'6~12개월',label:'교정 기간'},
      {value:'450만원',label:'경제적 비용'}
    ],
    definition: '인비절라인 라이트(Lite)는 가벼운 부정교합을 짧은 기간 내에 효율적으로 교정하는 패키지입니다. 14단계의 얼라이너와 1회 리파인먼트가 포함됩니다. 앞니 배열, 약간의 공간 폐쇄, 이전 교정 후 재발(재교정) 등 비교적 간단한 케이스에 적합하며, 6~12개월의 짧은 교정 기간이 특징입니다.',
    painPoints: [
      {problem:'"앞니만 살짝 삐뚤어요"', solution:'라이트 14단계로 충분'},
      {problem:'"교정이 오래 걸리는 건 싫어요"', solution:'6~12개월 단기 완료'},
      {problem:'"비용이 부담돼요"', solution:'450만원, 가장 합리적'},
      {problem:'"예전에 교정했는데 다시 틀어졌어요"', solution:'재교정에 라이트 딱'},
      {problem:'"결혼식/면접 전에 빨리 교정하고 싶어요"', solution:'중요한 날까지 맞춰 완료'},
      {problem:'"큰 교정은 아닌데 신경 쓰여요"', solution:'작은 변화, 큰 만족'}
    ],
    features: [
      {icon:'fa-bolt',title:'14단계 효율적 교정',desc:'14개의 정밀 설계 얼라이너로 핵심 부위를 집중 교정합니다. 필요한 만큼만 효율적으로.'},
      {icon:'fa-calendar-check',title:'6~12개월 단기 완료',desc:'결혼, 면접, 사진 촬영 등 중요한 이벤트에 맞춰 빠르게 완료합니다.'},
      {icon:'fa-won-sign',title:'경제적 비용',desc:'450만원으로 투명교정의 모든 장점을 누립니다. 무이자 할부도 가능합니다.'},
      {icon:'fa-cube',title:'ClinCheck 3D 시뮬레이션',desc:'라이트에도 ClinCheck이 포함됩니다. 교정 전 결과를 미리 확인합니다.'},
      {icon:'fa-redo',title:'1회 리파인먼트 포함',desc:'교정 후 미세 조정이 필요하면 1회 추가 세트를 제작합니다.'},
      {icon:'fa-tooth',title:'앞니 집중 교정',desc:'가장 눈에 띄는 전치부를 집중적으로 교정하여 미소 라인을 만듭니다.'}
    ],
    diffs: [
      {title:'딱 필요한 만큼만',desc:'과잉 교정 없이 핵심 부위만 집중합니다.'},
      {title:'직장인·대학생에게 최적',desc:'짧은 기간, 적은 내원, 투명한 장치. 일상에 방해 없는 교정.'},
      {title:'재교정 전문',desc:'이전 교정 후 약간 틀어진 치열을 빠르게 바로잡습니다.'},
      {title:'다이아몬드 프로바이더 경험',desc:'14단계를 최대한 효율적으로 설계합니다.'}
    ],
    processSteps: [
      {title:'정밀 상담 & 검진',desc:'라이트 적합 여부를 판단합니다. 3D CT, 구강스캐너로 분석합니다.'},
      {title:'ClinCheck 설계',desc:'14단계 내에서 최적의 결과를 설계합니다.'},
      {title:'맞춤 얼라이너 제작',desc:'인비절라인 본사에서 14개의 맞춤 얼라이너를 제작합니다.'},
      {title:'장치 장착 & 착용 교육',desc:'첫 세트를 장착하고 관리법을 안내합니다.'},
      {title:'정기 내원 & 경과 관찰',desc:'4~6주 간격으로 경과를 확인합니다.'},
      {title:'교정 완료 & 유지장치',desc:'목표 달성 후 유지장치를 장착합니다.'}
    ],
    compareTable: {
      headers: ['비교 항목', '컴프리헨시브', '모더레이트', '라이트 (현재)'],
      rows: [
        ['장치 교체', '무제한 (5년)', '23단계', '<strong>14단계</strong>'],
        ['리파인먼트', '무제한', '2회', '<strong>1회</strong>'],
        ['교정 범위', '전체', '중등도', '<strong>경미~중등도</strong>'],
        ['ClinCheck 3D', '✅', '✅', '✅'],
        ['교정 기간', '12~24개월', '10~18개월', '<strong>6~12개월</strong>'],
        ['비용', '700만원', '550만원', '<strong>450만원</strong>'],
        ['추천', '전체/복잡', '중등도', '<strong>앞니 교정/재교정</strong>']
      ]
    },
    reviews: [
      {name:'송',fullName:'송**님',source:'naver',text:'앞니 2개만 살짝 삐뚤었는데 <mark>라이트로 8개월 만에 끝났어요.</mark> 비용도 합리적이고 진짜 만족!',tags:['앞니 교정','단기 완료']},
      {name:'윤',fullName:'윤**님',source:'google',text:'중학교 때 교정했는데 다시 틀어져서 <mark>재교정으로 라이트 했어요. 6개월이면 끝!</mark>',tags:['재교정','라이트']},
      {name:'조',fullName:'조**님',source:'naver',text:'결혼식 전에 급하게 했는데 <mark>10개월 만에 완성!</mark> 사진 찍을 때 자신 있었어요.',tags:['결혼 준비','단기교정']}
    ],
    recommends: ['앞니 배열만 교정하고 싶은 분','이전 교정 후 재발된 분(재교정)','6~12개월 단기 교정을 원하는 분','경제적인 투명교정을 원하는 분','결혼/면접 등 이벤트 전 빠른 교정이 필요한 분'],
    costInfo: '450만원 (무이자 할부 가능)',
    faqs: [
      {q:'라이트로 어금니까지 교정 가능한가요?',a:'라이트는 주로 전치부(앞니)와 소구치까지의 교정에 적합합니다. 어금니까지 이동이 필요하면 모더레이트나 컴프리헨시브를 추천합니다.'},
      {q:'14단계가 부족하면?',a:'1회의 리파인먼트가 포함되어 있어 추가 미세 조정이 가능합니다. 더 넓은 범위가 필요하면 모더레이트로 업그레이드할 수 있습니다.'},
      {q:'교정 기간이 정말 6개월이면 되나요?',a:'가벼운 케이스(약간의 앞니 삐뚤림)는 6개월 내외 가능합니다. 정확한 기간은 상담 후 ClinCheck으로 확인합니다.'},
      {q:'재교정에 라이트가 적합한 이유는?',a:'이전 교정 후 재발은 대부분 경미한 수준이므로 14단계로 충분합니다. 비용도 절약할 수 있어 재교정에 가장 많이 선택됩니다.'},
      {q:'착용 시간은 같나요?',a:'네, 다른 패키지와 동일하게 하루 20~22시간 착용합니다.'},
      {q:'라이트도 ClinCheck이 되나요?',a:'네, 라이트에도 ClinCheck 3D 시뮬레이션이 포함됩니다.'},
      {q:'비용 450만원 외 추가 비용은?',a:'기본적으로 450만원에 모든 비용이 포함됩니다. 유지장치 비용이 별도일 수 있으니 상담 시 확인하세요.'},
      {q:'익스프레스와의 차이는?',a:'라이트는 14단계 + 1회 리파인먼트, 익스프레스는 7단계입니다. 라이트가 더 넓은 범위의 교정이 가능합니다.'}
    ],
    glossary: [
      {term:'라이트',desc:'인비절라인의 경량 패키지. 14단계 + 1회 리파인먼트'},
      {term:'전치부',desc:'앞니 영역. 상하 각 6개의 앞니를 포함'},
      {term:'재교정',desc:'이전 교정 후 재발하여 다시 교정하는 것'},
      {term:'ClinCheck',desc:'인비절라인의 3D 디지털 시뮬레이션'},
      {term:'얼라이너',desc:'투명한 플라스틱 교정 장치'},
      {term:'리파인먼트',desc:'추가 미세 조정용 얼라이너 세트'},
      {term:'IPR',desc:'인접면 삭제. 공간 확보를 위한 미세 삭제'},
      {term:'리테이너',desc:'교정 후 유지장치'}
    ],
    price: '450'
  },

  /* ────── 4. EXPRESS ────── */
  {
    slug: 'invisalign-express',
    badge: 'EXPRESS',
    badgeColor: '#d97706',
    title: '인비절라인 익스프레스',
    titleEn: 'Invisalign Express',
    icon: 'fa-bolt',
    metaTitle: '천안 인비절라인 익스프레스 | 가장 빠른 미니 교정 — 서울비디치과',
    metaDesc: '천안 인비절라인 익스프레스 — 7단계 장치, 최단 기간 완료. 미세 배열, 간단 교정. 최저 비용. ☎041-415-2892',
    metaKeywords: '인비절라인 익스프레스, 인비절라인 Express, 미니교정, 7단계, 단기교정, 최저비용, 간단교정',
    heroSub: '가장 빠르고, 가장 경제적인 변화',
    heroDesc: '아주 작은 차이가 큰 변화를 만듭니다. 7단계 얼라이너로 미세한 배열 문제를 빠르게 해결합니다. 인비절라인의 가장 간결한 솔루션입니다.',
    heroStats: [
      {value:'7단계',label:'장치 세트'},
      {value:'3~6개월',label:'초단기 완료'},
      {value:'300만원',label:'최저 비용'}
    ],
    definition: '인비절라인 익스프레스(Express)는 아주 간단한 배열 문제를 최단 기간에 해결하기 위한 미니 패키지입니다. 7단계의 얼라이너로 구성되며, 미세한 앞니 삐뚤림, 약간의 치아 간격, 이전 교정 후 경미한 재발 등을 3~6개월 내에 교정합니다. 인비절라인 전 제품군 중 가장 경제적입니다.',
    painPoints: [
      {problem:'"딱 한두 개 치아만 살짝 맞추고 싶어요"', solution:'7단계면 충분합니다'},
      {problem:'"빠르게 끝내고 싶어요"', solution:'3~6개월 초단기 완료'},
      {problem:'"교정에 큰 돈 쓰기 부담돼요"', solution:'300만원 최저 비용'},
      {problem:'"교정 후 살짝 틀어진 것만 잡고 싶어요"', solution:'재발 미세 교정에 최적'},
      {problem:'"보철(크라운) 전 치아 위치 조정이 필요해요"', solution:'보철 전 pre-ortho에 딱'},
      {problem:'"투명교정 체험해보고 싶어요"', solution:'가장 부담 없이 시작'}
    ],
    features: [
      {icon:'fa-rocket',title:'7단계 초고속 교정',desc:'7개의 얼라이너로 핵심만 집중 교정합니다. 군더더기 없는 가장 효율적인 솔루션입니다.'},
      {icon:'fa-hourglass-half',title:'3~6개월 완료',desc:'인비절라인 전 제품군 중 가장 빠릅니다. 중요한 일정에 맞춰 빠르게 끝냅니다.'},
      {icon:'fa-coins',title:'300만원 최저 비용',desc:'투명교정의 모든 장점을 가장 경제적으로 누립니다.'},
      {icon:'fa-cube',title:'ClinCheck 3D 포함',desc:'익스프레스에도 ClinCheck 시뮬레이션이 포함됩니다. 결과를 미리 확인합니다.'},
      {icon:'fa-bullseye',title:'정밀 포인트 교정',desc:'한두 개 치아의 미세한 위치 조정에 최적화되어 있습니다.'},
      {icon:'fa-smile-beam',title:'부담 없는 첫 교정',desc:'교정이 처음이라 망설이는 분께 가장 부담 없는 입문 패키지입니다.'}
    ],
    diffs: [
      {title:'인비절라인의 미니멀리스트',desc:'꼭 필요한 것만. 7단계로 핵심 결과를 만듭니다.'},
      {title:'보철 전 교정(Pre-ortho)',desc:'크라운이나 라미네이트 전 치아 위치를 미세 조정합니다.'},
      {title:'졸업사진/결혼식 급행 교정',desc:'3~6개월이면 완료. 급한 일정에 맞춥니다.'},
      {title:'교정 입문 체험',desc:'투명교정이 궁금하신 분의 첫 경험으로 최적입니다.'}
    ],
    processSteps: [
      {title:'정밀 상담 & 검진',desc:'익스프레스 적합 여부를 판단합니다. 간단한 케이스에 한해 적용합니다.'},
      {title:'ClinCheck 설계',desc:'7단계로 최적의 결과를 설계합니다.'},
      {title:'맞춤 얼라이너 제작',desc:'7개의 맞춤 얼라이너를 제작합니다.'},
      {title:'장치 장착',desc:'첫 세트를 장착하고 관리법을 안내합니다.'},
      {title:'중간 체크',desc:'4주 후 경과를 확인합니다.'},
      {title:'교정 완료 & 유지장치',desc:'목표 달성 후 유지장치를 장착합니다.'}
    ],
    compareTable: {
      headers: ['비교 항목', '라이트', '익스프레스 (현재)', '비교 포인트'],
      rows: [
        ['장치 단계', '14단계', '<strong>7단계</strong>', '절반'],
        ['리파인먼트', '1회', '<strong>미포함</strong>', '간단 케이스'],
        ['교정 범위', '앞니~소구치', '<strong>앞니 미세 조정</strong>', '더 집중'],
        ['교정 기간', '6~12개월', '<strong>3~6개월</strong>', '더 빠름'],
        ['비용', '450만원', '<strong>300만원</strong>', '150만원 절약'],
        ['ClinCheck', '✅', '✅', '동일'],
        ['추천', '앞니 교정', '<strong>미세 조정</strong>', '더 간단']
      ]
    },
    reviews: [
      {name:'강',fullName:'강**님',source:'naver',text:'앞니 하나만 살짝 삐뚤었는데 <mark>익스프레스로 4개월 만에 끝!</mark> 300만원이라 부담도 없었어요.',tags:['익스프레스','4개월']},
      {name:'임',fullName:'임**님',source:'google',text:'크라운 하기 전에 치아 위치 조정이 필요했는데 <mark>익스프레스로 깔끔하게 정리했어요.</mark>',tags:['Pre-ortho','미세 조정']},
      {name:'유',fullName:'유**님',source:'naver',text:'졸업사진 찍기 전에 앞니를 맞추고 싶어서 <mark>3개월 만에 완료!</mark> 사진 결과 대만족.',tags:['졸업 사진','단기교정']}
    ],
    recommends: ['앞니 한두 개만 미세 조정이 필요한 분','이전 교정 후 경미하게 재발된 분','3~6개월 내 빠른 교정을 원하는 분','보철(크라운/라미네이트) 전 위치 조정이 필요한 분','최저 비용으로 투명교정을 체험하고 싶은 분'],
    costInfo: '300만원 (무이자 할부 가능)',
    faqs: [
      {q:'익스프레스로 얼마나 교정할 수 있나요?',a:'미세한 앞니 삐뚤림, 약간의 치아 간격, 경미한 재발 등 아주 간단한 케이스에 적합합니다. 넓은 범위의 교정은 라이트 이상을 추천합니다.'},
      {q:'리파인먼트가 없다고요?',a:'네, 익스프레스는 7단계로 완료되는 간단한 케이스를 대상으로 하므로 리파인먼트가 미포함됩니다. 더 정밀한 조정이 필요하면 라이트를 추천합니다.'},
      {q:'7단계면 정말 효과가 있나요?',a:'네, 적합한 케이스에 적용하면 7단계로도 충분한 변화가 가능합니다. 전문의가 적합 여부를 정확히 판단합니다.'},
      {q:'교정 기간이 정말 3개월?',a:'아주 간단한 케이스는 3개월(7단계 x 2주) 내에 완료됩니다. 약간 복잡한 경우 6개월까지 걸릴 수 있습니다.'},
      {q:'착용 시간은 동일한가요?',a:'네, 하루 20~22시간 동일합니다.'},
      {q:'익스프레스에서 라이트로 업그레이드 가능한가요?',a:'가능합니다. 교정 진행 중 더 넓은 범위가 필요하다 판단되면 전문의와 상의하여 업그레이드합니다.'},
      {q:'어떤 나이에도 가능한가요?',a:'성인이라면 연령 제한 없이 가능합니다. 단, 성장기 아이(6~10세)는 인비절라인 퍼스트를 추천합니다.'},
      {q:'Pre-ortho가 뭔가요?',a:'보철(크라운, 라미네이트 등) 치료 전에 치아 위치를 미리 정리하는 교정입니다. 보철 결과를 더 좋게 만드는 사전 작업입니다.'}
    ],
    glossary: [
      {term:'익스프레스',desc:'인비절라인의 미니 패키지. 7단계 얼라이너'},
      {term:'Pre-ortho',desc:'보철 전 치아 위치 미세 조정 교정'},
      {term:'ClinCheck',desc:'인비절라인의 3D 디지털 시뮬레이션'},
      {term:'얼라이너',desc:'투명한 플라스틱 교정 장치'},
      {term:'리파인먼트',desc:'추가 미세 조정용 얼라이너 세트'},
      {term:'어태치먼트',desc:'치아에 부착하는 레진 돌기'},
      {term:'IPR',desc:'인접면 삭제. 공간 확보를 위한 미세 삭제'},
      {term:'리테이너',desc:'교정 후 유지장치'}
    ],
    price: '300'
  },

  /* ────── 5. FIRST ────── */
  {
    slug: 'invisalign-first',
    badge: 'FIRST',
    badgeColor: '#7c3aed',
    title: '인비절라인 퍼스트',
    titleEn: 'Invisalign First',
    icon: 'fa-child',
    metaTitle: '천안 인비절라인 퍼스트 | 어린이 성장기 교정 — 서울비디치과',
    metaDesc: '천안 인비절라인 퍼스트 — 6~10세 성장기 아이를 위한 교정 프로그램. 악궁 확장, 영구치 맹출 유도. 소아치과 전문의 협진. ☎041-415-2892',
    metaKeywords: '인비절라인 퍼스트, 인비절라인 First, 어린이 교정, 성장기 교정, 악궁 확장, 소아교정, 6세 교정, 소아치과',
    heroSub: '우리 아이의 바른 성장을 위한 첫 번째 교정',
    heroDesc: '성장기(6~10세)에 시작하면 영구치가 올바른 위치에 맹출하도록 유도하고, 악궁(턱뼈)을 넓혀 미래의 복잡한 교정을 예방합니다. 투명 장치라 아이도 편하게 착용합니다.',
    heroStats: [
      {value:'6~10세',label:'적정 시작 연령'},
      {value:'악궁 확장',label:'턱뼈 성장 유도'},
      {value:'투명 장치',label:'아이도 편안'}
    ],
    definition: '인비절라인 퍼스트(First)는 유치와 영구치가 혼재하는 혼합치열기(6~10세) 아이를 위한 전용 교정 프로그램입니다. 좁은 악궁을 확장하여 영구치가 올바른 위치에 맹출하도록 유도하고, 교차교합이나 전치부 반대교합을 조기에 교정합니다. 1단계(퍼스트) 교정 후 영구치열이 완성되면 2단계 교정(컴프리헨시브 등)을 진행할 수 있습니다.',
    painPoints: [
      {problem:'"우리 아이 이가 삐뚤삐뚤해요"', solution:'성장기에 미리 잡으면 효과적'},
      {problem:'"영구치가 나올 자리가 없어 보여요"', solution:'악궁 확장으로 공간 확보'},
      {problem:'"아이가 철사 교정을 싫어해요"', solution:'투명 장치라 거부감 없음'},
      {problem:'"언제 교정을 시작해야 하나요?"', solution:'6~10세가 골든 타임'},
      {problem:'"소아 교정은 어디서 해야 하나요?"', solution:'소아치과 전문의 + 교정 전문의 협진'},
      {problem:'"나중에 큰 교정이 필요하면 어쩌죠?"', solution:'1단계로 미리 잡아 2단계 부담 축소'}
    ],
    features: [
      {icon:'fa-child',title:'6~10세 전용 설계',desc:'유치와 영구치가 혼재하는 혼합치열기에 최적화된 장치입니다. 성장 중인 턱뼈에 맞게 설계됩니다.'},
      {icon:'fa-expand-arrows-alt',title:'악궁(턱뼈) 확장',desc:'좁은 턱뼈를 넓혀 영구치가 올바른 위치에 나올 수 있는 충분한 공간을 만듭니다.'},
      {icon:'fa-seedling',title:'영구치 맹출 유도',desc:'아직 나지 않은 영구치가 올바른 방향으로 맹출하도록 안내합니다.'},
      {icon:'fa-eye-slash',title:'투명 장치 — 아이도 OK',desc:'금속 장치가 아닌 투명 플라스틱이라 아이들의 거부감이 적습니다. 학교에서도 자연스럽게 착용합니다.'},
      {icon:'fa-shield-alt',title:'2단계 교정 부담 감소',desc:'1단계에서 기반을 잡으면 영구치열 완성 후 2단계 교정이 더 가벼워지거나 불필요할 수 있습니다.'},
      {icon:'fa-users-cog',title:'소아치과 + 교정과 협진',desc:'소아치과 전문의 3인 + 교정과 전문의가 함께 아이의 성장과 교정을 통합 관리합니다.'}
    ],
    diffs: [
      {title:'골든 타임을 놓치지 마세요',desc:'성장기(6~10세)에 교정하면 턱뼈 성장을 활용할 수 있어 훨씬 효과적입니다.'},
      {title:'소아치과 전문의 3인 + 교정 전문의',desc:'서울비디치과만의 전문의 협진 체계로 아이의 성장과 교정을 통합 관리합니다.'},
      {title:'양치·충치 관리 동시',desc:'탈착 가능한 투명 장치라 양치가 쉽습니다. 교정 중 충치 위험을 줄입니다.'},
      {title:'미래 교정 비용 절감',desc:'조기 교정으로 2단계 교정의 난이도와 기간을 줄여 장기적 비용을 절약합니다.'}
    ],
    processSteps: [
      {title:'성장 발달 검진',desc:'3D CT, 구강스캐너, 성장판 평가로 아이의 현재 상태와 성장 가능성을 분석합니다.'},
      {title:'교정 계획 수립 (부모 상담)',desc:'교정 전문의 + 소아치과 전문의가 함께 치료 계획을 수립합니다. 부모님과 목표를 공유합니다.'},
      {title:'맞춤 장치 제작',desc:'아이의 구강에 맞는 퍼스트 전용 얼라이너를 제작합니다.'},
      {title:'장치 장착 & 아이 교육',desc:'아이가 스스로 착용·관리할 수 있도록 재미있게 교육합니다.'},
      {title:'정기 내원 & 성장 관찰',desc:'4~8주 간격으로 내원. 치아 이동과 성장 상태를 함께 체크합니다.'},
      {title:'1단계 완료 & 2단계 평가',desc:'1단계 교정 완료 후 영구치열이 완성되면 2단계 교정 필요 여부를 평가합니다.'}
    ],
    compareTable: {
      headers: ['비교 항목', '인비절라인 퍼스트', '기존 확장장치', '메탈 소아교정'],
      rows: [
        ['대상 연령', '<strong>6~10세</strong>', '6~12세', '12세 이상'],
        ['장치 형태', '<strong>투명 (탈착)</strong>', '고정식/탈착식', '고정식 금속'],
        ['아이 수용도', '<strong>매우 높음</strong>', '보통', '낮음'],
        ['양치 편의성', '<strong>우수 (탈착)</strong>', '보통', '불편'],
        ['악궁 확장', '✅', '✅', '제한적'],
        ['영구치 유도', '<strong>✅</strong>', '제한적', '❌'],
        ['심미성', '<strong>★★★★★</strong>', '★★★☆☆', '★★☆☆☆']
      ]
    },
    reviews: [
      {name:'박',fullName:'박**님(학부모)',source:'naver',text:'7살 아이 교정 시작했는데 <mark>투명이라 아이가 전혀 거부감 없어요.</mark> 학교에서도 친구들이 모른대요!',tags:['퍼스트','학부모 후기']},
      {name:'김',fullName:'김**님(학부모)',source:'google',text:'악궁이 좁아서 영구치 나올 자리가 없다고 하셨는데 <mark>퍼스트로 턱을 넓히니 이가 잘 나오고 있어요.</mark>',tags:['악궁 확장','영구치']},
      {name:'이',fullName:'이**님(학부모)',source:'naver',text:'소아치과 전문의 선생님이 아이를 너무 잘 다뤄주셔서 <mark>울지도 않고 교정을 잘 받고 있어요.</mark>',tags:['소아치과 전문의','아이 케어']}
    ],
    recommends: ['6~10세 성장기 아이','영구치 나올 공간이 부족한 아이','앞니가 거꾸로 물리는(반대교합) 아이','턱뼈가 좁은 아이','교차교합이 있는 아이'],
    costInfo: '상담 후 안내',
    faqs: [
      {q:'퍼스트는 몇 살에 시작하는 게 좋은가요?',a:'6~10세, 유치와 영구치가 혼재하는 혼합치열기가 가장 적합합니다. 영구치가 완전히 나온 후에는 일반 인비절라인을 진행합니다.'},
      {q:'아이가 장치를 제대로 착용할 수 있나요?',a:'인비절라인 퍼스트는 아이들을 위해 설계되었으며, 대부분의 아이들이 잘 적응합니다. 탈착이 가능해 스트레스가 적습니다.'},
      {q:'퍼스트만으로 교정이 끝나나요?',a:'퍼스트는 1단계(성장 유도) 교정입니다. 영구치열이 완성된 후 2단계 교정이 필요할 수 있습니다. 다만 1단계를 통해 2단계 교정이 크게 줄어들거나 불필요할 수 있습니다.'},
      {q:'소아치과 전문의가 진료하나요?',a:'네, 서울비디치과는 소아치과 전문의 3인이 상주합니다. 교정 전문의와 협진하여 성장과 교정을 통합 관리합니다.'},
      {q:'착용 시간은 어떻게 되나요?',a:'하루 20~22시간 착용이 권장됩니다. 식사, 양치, 운동 시에만 제거합니다.'},
      {q:'비용은 얼마인가요?',a:'아이의 상태와 치료 범위에 따라 달라집니다. 정밀 검진 후 정확한 비용을 안내드립니다.'},
      {q:'기존 확장장치와 뭐가 다른가요?',a:'투명하고 탈착 가능하여 아이의 수용도가 높습니다. 기존 확장장치는 고정식이 많아 불편감이 클 수 있습니다.'},
      {q:'교정 중 충치 관리는?',a:'탈착 가능하므로 양치가 쉽습니다. 소아치과 전문의가 교정과 동시에 충치 관리를 해드립니다.'}
    ],
    glossary: [
      {term:'퍼스트',desc:'인비절라인의 소아 전용 교정 프로그램 (6~10세)'},
      {term:'혼합치열기',desc:'유치와 영구치가 함께 있는 시기'},
      {term:'악궁',desc:'치아가 배열된 턱뼈의 아치 형태'},
      {term:'교차교합',desc:'일부 윗니가 아랫니 안쪽에 물리는 상태'},
      {term:'반대교합',desc:'아랫니가 윗니 앞으로 나온 상태'},
      {term:'맹출',desc:'치아가 잇몸 밖으로 나오는 것'},
      {term:'2단계 교정',desc:'영구치열 완성 후 진행하는 본격 교정'},
      {term:'리테이너',desc:'교정 후 유지장치'}
    ],
    price: null
  }
];

// ─── HTML 생성 함수 ───
function generatePage(p) {
  const otherPrograms = PROGRAMS.filter(x => x.slug !== p.slug);
  const priceDisplay = p.price ? `<span style="font-size:1.6rem;font-weight:800;color:var(--brand);">${p.price}</span><span style="font-size:0.9rem;color:#888;">만원</span>` : '<span style="font-size:1rem;font-weight:700;color:var(--brand);">상담 후 안내</span>';

  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
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
  <title>${p.metaTitle}</title>
  <meta name="description" content="${p.metaDesc}">
  <meta name="keywords" content="${p.metaKeywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/${p.slug}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${p.metaTitle}">
  <meta property="og:description" content="${p.metaDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/${p.slug}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-invisalign.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${p.metaTitle}">
  <meta name="twitter:description" content="${p.metaDesc}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-invisalign.jpg">
  <link rel="icon" type="image/svg+xml" href="../images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="../manifest.json">
  <meta name="theme-color" content="#6B4226">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="../css/site-v5.css?v=b413d3a5">
  <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"인비절라인","item":"https://bdbddc.com/treatments/invisalign"},{"@type":"ListItem","position":3,"name":p.title,"item":"https://bdbddc.com/treatments/"+p.slug}]})}</script>
  <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":p.faqs.map(f=>({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a.replace(/<[^>]*>/g,'')}}))})}</script>
  <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"MedicalProcedure","name":p.title,"description":p.definition,"procedureType":"https://schema.org/TherapeuticProcedure","body":{"@type":"AnatomicalStructure","name":"치아/치열"},"howPerformed":p.processSteps.map(s=>s.title+': '+s.desc).join(' → '),"provider":{"@type":"Dentist","name":"서울비디치과","@id":"https://bdbddc.com/#dentist","telephone":"+82-41-415-2892","address":{"@type":"PostalAddress","addressLocality":"천안시","addressRegion":"충청남도","addressCountry":"KR"}}})}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","speakable":{"@type":"SpeakableSpecification","cssSelector":["h1",".section-subtitle",".hero-desc"]}}</script>
  <meta name="ai-summary" content="서울비디치과 ${p.title} — ${p.heroSub}. 서울대 교정 전문의, 다이아몬드 프로바이더, 1층 전용 교정센터.">
  <script src="/js/analytics.js?v=20260408v6" defer></script>
<!-- Weglot Multilingual -->
<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
<script>Weglot.initialize({api_key:'wg_cd7087d43782c81ecb41e27570c3bfcd2'});</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>

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
          <li class="nav-item"><a href="/doctors/">의료진</a></li>
          <li class="nav-item"><a href="/mission">비디미션</a></li>
          <li class="nav-item has-dropdown"><a href="../blog/">콘텐츠</a><ul class="simple-dropdown"><li><a href="../blog/"><i class="fas fa-blog"></i> 블로그</a></li><li><a href="/video/"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="/cases/gallery"><i class="fas fa-lock"></i> 비포/애프터</a></li><li><a href="/encyclopedia/"><i class="fas fa-book-medical"></i> 치과 백과사전</a></li></ul></li>
          <li class="nav-item has-dropdown"><a href="/directions">안내</a><ul class="simple-dropdown"><li><a href="/pricing" class="nav-highlight">💰 비용 안내</a></li><li><a href="/floor-guide">비디치과 둘러보기</a></li><li><a href="/directions">오시는 길</a></li><li><a href="/faq">자주 묻는 질문</a></li><li><a href="/notice/"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
          <li class="nav-item has-dropdown"><a href="/games" style="color:#EC4899;font-weight:700;">🎮 플레이</a><ul class="simple-dropdown"><li><a href="/flight"><i class="fas fa-rocket"></i> 치석 플라이트</a></li><li><a href="/run"><i class="fas fa-running"></i> 투쓰런</a></li><li><a href="/checkup"><i class="fas fa-dna"></i> 치BTI</a></li><li><a href="/games"><i class="fas fa-th"></i> 전체 게임</a></li></ul></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
        <div class="auth-buttons"><a href="/auth/login" class="btn-auth btn-login"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="/auth/register" class="btn-auth btn-register"><i class="fas fa-user-plus"></i> 회원가입</a></div>
        <a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
  <div class="header-spacer"></div>

  <main id="main-content">
    <!-- Breadcrumb -->
    <div style="padding:12px 0;background:var(--gray-50);">
      <div class="container">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:var(--text-tertiary);">
          <a href="/" style="color:var(--text-secondary);">홈</a>
          <span style="margin:0 6px;">›</span>
          <a href="/treatments/invisalign" style="color:var(--text-secondary);">인비절라인</a>
          <span style="margin:0 6px;">›</span>
          <span style="color:var(--brand);font-weight:600;">${p.title}</span>
        </nav>
      </div>
    </div>

    <!-- Hero -->
    <section class="hero" style="min-height:auto;padding:var(--space-4xl) 0 var(--space-3xl);">
      <div class="hero-bg-pattern"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <p class="hero-brand-name">서울비디치과 교정센터</p>
            <div style="display:inline-block;padding:6px 18px;background:${p.badgeColor};color:#fff;border-radius:50px;font-size:0.85rem;font-weight:800;margin-bottom:12px;letter-spacing:1px;">${p.badge}</div>
            <h1 class="hero-headline" style="font-size:var(--fs-h1);">${p.title}</h1>
            <p class="hero-sub">${p.heroSub}</p>
            <p class="hero-desc" style="font-size:1rem;color:var(--text-secondary);line-height:1.7;max-width:600px;margin-bottom:var(--space-xl);">${p.heroDesc}</p>
            <div class="hero-stats">
${p.heroStats.map(s=>`        <div class="stat-item"><span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span></div>`).join('\n')}
            </div>
            <div class="hero-cta-group" style="margin-top:var(--space-xl);">
              <a href="/reservation" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
              <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 정의 -->
    <section class="section" style="padding:var(--space-2xl) 0;">
      <div class="container">
        <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:1.2rem 1.5rem;border-radius:0 8px 8px 0;max-width:800px;margin:0 auto;">
          <h2 style="font-size:1.15rem;font-weight:700;color:#0369a1;margin:0 0 0.5rem 0;">${p.title}이란?</h2>
          <p style="margin:0;color:#334155;line-height:1.7;font-size:0.95rem;">${p.definition}</p>
        </div>
      </div>
    </section>

    <!-- 고민 공감 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>혹시 이런 <span class="text-gradient">고민</span> 하고 계시죠?</h2>
          <p class="section-subtitle">많은 분들이 같은 걱정을 하십니다</p>
        </div>
        <div style="max-width:700px;margin:0 auto;">
${p.painPoints.map(pp=>`          <div class="concern-item-row">
            <span class="problem-icon"><i class="fas fa-times-circle"></i></span>
            <span class="problem-text">${pp.problem}</span>
            <span class="arrow"><i class="fas fa-arrow-right"></i></span>
            <span class="solution-text">${pp.solution}</span>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- 특징 6개 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2><span class="text-gradient">${p.title}</span>의 특징</h2>
          <p class="section-subtitle">서울비디치과가 자신 있게 제안하는 이유</p>
        </div>
        <div class="why-grid" style="grid-template-columns:repeat(3,1fr);">
${p.features.map(f=>`          <div class="why-card">
            <div class="why-card-icon"><i class="fas ${f.icon}"></i></div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- 비디치과 차별점 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.title}, <span class="text-gradient">어디서 하느냐</span>가 결과를 바꿉니다</h2>
          <p class="section-subtitle">서울비디치과만의 차별점</p>
        </div>
        <div class="diff-grid">
${p.diffs.map((d,i)=>`          <div class="diff-card">
            <div class="diff-num">0${i+1}</div>
            <h3>${d.title}</h3>
            <p>${d.desc}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- 치료 과정 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>체계적인 <span class="text-gradient">${p.processSteps.length}단계</span> 치료 과정</h2>
          <p class="section-subtitle">상담부터 유지까지</p>
        </div>
        <div class="process-timeline-v2">
${p.processSteps.map((s,i)=>`          <div class="process-step-v2">
            <div class="step-dot">${i+1}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- 비교표 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2><span class="text-gradient">프로그램 비교</span></h2>
        </div>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead><tr>${p.compareTable.headers.map((h,i)=>`<th scope="col"${i===1||i===2?' class="col-highlight"':''}>${h}</th>`).join('')}</tr></thead>
            <tbody>
${p.compareTable.rows.map(r=>`              <tr>${r.map((c,i)=>`<td${i===1||i===2?' class="col-highlight"':''}>${c}</td>`).join('')}</tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 비용 안내 -->
    <section class="section" style="background:var(--gray-50);padding:var(--space-2xl) 0;">
      <div class="container">
        <div style="max-width:700px;margin:0 auto;padding:28px;background:var(--white);border:1px solid var(--border-color);border-radius:var(--radius-xl);text-align:center;">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:12px;"><i class="fas fa-won-sign" style="color:var(--brand-gold);margin-right:8px;"></i>비용 안내</h3>
          <div style="margin-bottom:12px;">${priceDisplay}</div>
          <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:16px;font-size:0.9rem;">${p.costInfo}</p>
          <a href="/pricing" class="btn btn-outline" style="font-size:0.95rem;"><i class="fas fa-calculator"></i> 비용 안내 페이지 바로가기</a>
        </div>
      </div>
    </section>

    <!-- 환자 후기 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>실제 <span class="text-gradient">환자 후기</span></h2>
          <p class="section-subtitle">네이버·구글에서 검증된 실제 후기입니다</p>
        </div>
        <div class="review-grid-v2">
${p.reviews.map(r=>`          <div class="review-card-v2">
            <div class="review-header">
              <div class="review-avatar">${r.name}</div>
              <div><div class="review-name">${r.fullName}</div><span class="review-source ${r.source}">${r.source === 'naver' ? '네이버' : '구글'}</span></div>
            </div>
            <div class="review-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            <p class="review-text">${r.text}</p>
            <div class="review-tags">${r.tags.map(t=>`<span>${t}</span>`).join('')}</div>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- 추천 대상 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>이런 분께 <span class="text-gradient">추천</span>합니다</h2>
        </div>
        <div style="max-width:700px;margin:0 auto;padding:32px;background:var(--white);border:1px solid var(--border-color);border-radius:var(--radius-xl);">
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
${p.recommends.map(r=>`            <span style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(107,66,38,0.06);border-radius:var(--radius-full);font-weight:600;color:var(--brand);font-size:0.95rem;"><i class="fas fa-check-circle" style="color:var(--brand-gold);"></i>${r}</span>`).join('\n')}
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>자주 묻는 <span class="text-gradient">질문</span></h2>
          <p class="section-subtitle">${p.title}에 대해 궁금한 점을 확인하세요</p>
        </div>
        <div class="faq-list" style="max-width:800px;margin:0 auto;">
${p.faqs.map((f,i)=>`          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-${i}">
              <span class="faq-q-badge">Q</span>
              <span class="faq-q-text">${f.q}</span>
              <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="faq-answer" id="faq-${i}" role="region"><p>${f.a}</p></div>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- 관련 용어 -->
    <section class="section-sm" style="padding:40px 0;">
      <div class="container">
        <div style="background:#faf7f3;border-radius:16px;padding:28px 24px;">
          <h2 style="font-size:1.15rem;font-weight:700;color:#333;margin-bottom:16px;">
            <i class="fas fa-book-medical" style="color:#c9a96e;margin-right:8px;"></i>
            관련 치과 백과사전 용어 (${p.glossary.length}개)
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
${p.glossary.map(g=>`          <a href="/encyclopedia/${encodeURIComponent(g.term)}" class="enc-term-link" style="display:block;padding:10px 14px;background:#fff;border:1px solid #e8e0d8;border-radius:10px;text-decoration:none;color:#333;transition:all 0.2s;">
            <strong style="color:#6B4226;font-size:0.95rem;">${g.term}</strong>
            <span style="display:block;font-size:0.8rem;color:#888;margin-top:2px;">${g.desc}</span>
          </a>`).join('\n')}
          </div>
          <div style="text-align:center;margin-top:16px;">
            <a href="/encyclopedia/" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.85rem;">
              <i class="fas fa-book-medical"></i> 전체 500개 용어 보기
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 다른 프로그램 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>다른 <span class="text-gradient">교정 프로그램</span></h2>
          <p class="section-subtitle">상태와 목표에 맞는 맞춤 프로그램을 찾아보세요</p>
        </div>
        <div class="type-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">
${otherPrograms.map(o=>`          <a href="/treatments/${o.slug}" class="type-card">
            <span class="type-card-arrow"><i class="fas fa-arrow-right"></i></span>
            <div style="display:inline-block;padding:4px 12px;background:${o.badgeColor};color:#fff;border-radius:50px;font-size:0.72rem;font-weight:800;margin-bottom:8px;letter-spacing:0.5px;">${o.badge}</div>
            <div class="type-icon"><i class="fas ${o.icon}"></i></div>
            <h3>${o.title.replace('인비절라인 ','')}</h3>
            <p>${o.heroSub}</p>${o.price ? `\n            <div style="margin-top:8px;font-weight:800;color:var(--brand);">${o.price}만원</div>` : ''}
          </a>`).join('\n')}
          <a href="/treatments/orthodontics" class="type-card">
            <span class="type-card-arrow"><i class="fas fa-arrow-right"></i></span>
            <div class="type-icon"><i class="fas fa-teeth"></i></div>
            <h3>브라켓 교정</h3>
            <p>클리피씨 · 클라리티울트라</p>
          </a>
        </div>
        <p class="type-grid-hint"><i class="fas fa-hand-pointer"></i> 각 카드를 눌러 자세한 내용을 확인하세요</p>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <span class="cta-badge">상담 안내</span>
          <h2>${p.title}, 다이아몬드 프로바이더에서</h2>
          <p>무료 3D 교정 시뮬레이션으로 변화된 모습을 미리 확인하세요.</p>
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
  </main>

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
      <div class="footer-info">
        <div class="footer-contact"><p><i class="fas fa-map-marker-alt"></i> 충남 천안시 서북구 불당34길 14, 1~5층</p><p><i class="fas fa-phone"></i> 041-415-2892</p><div class="footer-hours"><p><i class="fas fa-clock"></i> <strong>365일 진료</strong></p><p>평일 09:00-20:00 (점심 12:30-14:00)</p><p>토·일 09:00-17:00</p><p>공휴일 09:00-13:00</p></div></div>
        <div class="footer-social"><a href="https://naver.me/5yPnKmqQ" target="_blank" rel="noopener" aria-label="네이버 예약"><i class="fas fa-calendar-check"></i></a><a href="https://www.youtube.com/@BDtube" target="_blank" rel="noopener" aria-label="유튜브"><i class="fab fa-youtube"></i></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" aria-label="카카오톡"><i class="fas fa-comment"></i></a></div>
      </div>
      <div class="footer-legal">
        <div class="legal-links"><a href="/privacy">개인정보 처리방침</a><span>|</span><a href="/terms">이용약관</a><span>|</span><a href="../sitemap.xml">사이트맵</a></div>
        <p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수하여 제공하고 있으며, 특정 개인의 결과는 개인에 따라 달라질 수 있습니다.</p>
        <p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
        <div class="business-info" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:0.72rem;color:rgba(255,255,255,0.35);line-height:1.8;">
          <p>상호: 불당본점서울비디치과의원 | 대표자: 현정민 외 2명 | 사업자등록번호: 228-11-02956</p>
          <p>주소: 충청남도 천안시 서북구 불당34길 14, 1~5층 | 개업일: 2021.05.24</p>
          <p>전화: 041-415-2892 | <a href="/images/business-license.png" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.45);text-decoration:underline;">사업자등록증 보기</a></p>
        </div>
      </div>
    </div>
  </footer>
  <script src="../js/main.js" defer></script>
  <script src="../js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){
      document.querySelectorAll('.faq-question').forEach(function(btn){
        btn.addEventListener('click',function(){
          var item=this.parentElement;
          var expanded=this.getAttribute('aria-expanded')==='true';
          document.querySelectorAll('.faq-item.active').forEach(function(i){i.classList.remove('active');i.querySelector('.faq-question').setAttribute('aria-expanded','false');});
          if(!expanded){item.classList.add('active');this.setAttribute('aria-expanded','true');}
        });
      });
    });
  </script>
</body>
</html>`;
}

// ─── 실행 ───
const outDir = path.join(__dirname, '..', 'treatments');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

PROGRAMS.forEach(p => {
  const html = generatePage(p);
  const filePath = path.join(outDir, `${p.slug}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ ${p.slug}.html (${html.split('\n').length} lines, ${(Buffer.byteLength(html)/1024).toFixed(1)}KB)`);
});

console.log(`\n🎉 ${PROGRAMS.length}개 인비절라인 상세 페이지 생성 완료!`);
