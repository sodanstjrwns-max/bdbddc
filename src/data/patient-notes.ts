export type NoteLink = { title: string; href: string }
export type PatientNote = {
  slug: string
  title: string
  region: string
  areaPath: string
  topic: string
  concern: string
  description: string
  situation: string
  answer: string
  checks: string[]
  choices: { condition: string; option: string; limit: string }[]
  unknown: string
  prepare: string[]
  localHeading: string
  localAdvice: string
  related: NoteLink[]
  sources: NoteLink[]
  updated: string
  publishedAt?: string
}

const fda = { title: 'FDA · 임플란트 구조, 기록 보관 및 불편 시 상담', href: 'https://www.fda.gov/medical-devices/dental-devices/dental-implants-what-you-should-know' }
const screw = { title: '캐나다치과의사협회 JCDA · 임플란트 연결 나사 풀림의 평가와 치료', href: 'https://jcda.ca/article/e22' }
const retreat = { title: '미국근관치료학회 AAE · 신경치료 후 재치료', href: 'https://www.aae.org/patients/root-canal-treatment/endodontic-treatment-options/endodontic-retreatment/' }
const crack = { title: '미국근관치료학회 AAE · 치아 균열의 증상과 치료', href: 'https://www.aae.org/patients/dental-symptoms/cracked-teeth/' }
const efp = { title: '유럽치주학회 EFP · 임플란트 주위질환 치료', href: 'https://www.efp.org/for-patients/dental-implants/peri-implant-disease-treatment/' }

// 지역은 글에서 설명하는 방문 맥락이다. 병원의 소재지나 환자의 실제 거주지를 의미하지 않는다.
// 초기 여섯 질문은 2026-09-16 사용자 제공, 이후는 승인된 편집 후보에서 선정한다.
// 모두 가상 상담 상황이며 환자 후기나 실제 의료진 감수 사례가 아니다.
// updated는 실제 본문 수정일만 기록한다. 자동 일일 갱신 금지.
export const patientNotes: PatientNote[] = [
  {
    slug: 'implant-clinic-closed',
    publishedAt: '2026-09-17T00:00:00+09:00',
    title: '임플란트를 심었던 치과가 폐업했어요. 다른 곳에서 상담받을 수 있나요?',
    region: '천안', areaPath: '/area/cheonan', topic: '임플란트', concern: '예전 치과에 갈 수 없어요',
    description: '천안에서 기존 치과 폐업 후 임플란트 상담을 준비할 때 확인할 기록, 제품 정보와 치료 가능 범위를 정리합니다.',
    situation: '예전에 심은 임플란트가 불편해 천안에서 상담할 치과를 찾고 있습니다. 원래 치과는 문을 닫았고 제품 이름도 정확히 기억나지 않습니다.',
    answer: '기존 치과를 방문할 수 없어도 현재 상태를 평가하는 상담은 가능합니다. 다만 수리 가능 여부와 필요한 부품은 기록과 검사로 확인해야 하므로, 전화나 사진만으로 당일 수리까지 약속할 수는 없습니다.',
    checks: ['어느 치아를 언제 치료했고, 불편은 언제부터 시작됐는지 정리합니다.', '보증서나 제품 카드에서 제조사·모델을 확인할 수 있는지 살펴봅니다.', '흔들리는 곳이 보철·연결부인지, 뼈에 고정된 부분까지 문제인지 진료실에서 구분합니다.'],
    choices: [
      { condition: '연결부 문제로 확인되고 부품을 확인할 수 있다면', option: '보철·나사 수리 또는 교체 가능성을 검토합니다.', limit: '부품 수급과 보철 상태에 따라 방문 횟수가 달라집니다.' },
      { condition: '임플란트 주변 조직에 문제가 있다면', option: '잇몸과 뼈 상태를 평가한 뒤 필요한 치료를 계획합니다.', limit: '폐업 여부만으로 재수술 필요성을 판단하지 않습니다.' }
    ],
    unknown: '제품 호환성, 기존 치료 보증의 적용 여부, 수리 비용과 완료 시점은 개별 확인 사항입니다. 다른 병원에서 기존 보증이 그대로 적용된다고 가정하지 마세요.',
    prepare: ['보유 중인 임플란트 보증서·제품 카드·진료내역', '기존 영상이나 치료계획서가 있다면 사본', '불편한 위치와 시작 시점, 최근 수리 여부'],
    localHeading: '천안에서 임플란트 상담을 예약하기 전',
    localAdvice: '예약할 때 “기존 치과가 폐업했고 임플란트 제품 정보를 모른다”는 점부터 알려주세요. 자료가 없다는 이유로 불편한 상태를 방치하지 말고 상담 가능한 일정을 확인하세요. 서울비디치과의 진료 장소는 천안 불당동입니다.',
    related: [{ title: '임플란트 치료 가이드', href: '/guide/implant' }, { title: '임플란트가 또 흔들릴 때', href: '/concerns/repeated-implant-screw-loosening' }],
    sources: [fda, screw], updated: '2026-09-16'
  },
  {
    slug: 'repeated-implant-screw-loosening',
    publishedAt: '2026-09-17T00:00:00+09:00',
    title: '임플란트 나사를 두 번 조였는데 또 흔들려요.',
    region: '아산', areaPath: '/area/asan', topic: '임플란트', concern: '다시 불편해졌어요',
    description: '아산에서 반복되는 임플란트 흔들림으로 상담을 준비할 때, 이전 수리 내용과 이번에 확인할 부분을 정리합니다.',
    situation: '아산에 살며 임플란트 나사를 두 차례 조였습니다. 며칠 또는 몇 주 뒤 다시 움직이는 느낌이 나서 같은 수리를 반복해도 되는지 궁금합니다.',
    answer: '반복되는 흔들림은 다시 조이는 것에 앞서 어느 부분이 왜 움직이는지 확인할 이유가 됩니다. 나사와 보철의 상태, 맞물림, 임플란트 자체의 고정을 함께 평가한 뒤 수리 범위를 정합니다.',
    checks: ['이전 두 번의 처치가 단순 조임인지, 나사 교체나 보철 수리까지 포함했는지 확인합니다.', '치료 후 얼마 동안 괜찮았고 어떤 상황에서 다시 불편해졌는지 비교합니다.', '진료실에서 연결 부품의 손상·보철의 맞음새·씹는 접촉을 살펴봅니다.'],
    choices: [
      { condition: '나사 또는 연결부 문제로 확인되면', option: '상태에 따라 나사 교체, 적절한 조임과 맞물림 조정을 검토합니다.', limit: '같은 처치를 반복해도 원인이 남으면 다시 불편할 수 있습니다.' },
      { condition: '보철 손상이나 맞음새 문제가 있다면', option: '보철 수리 또는 재제작 가능성을 비교합니다.', limit: '기존 보철을 그대로 사용할 수 있는지는 확인이 필요합니다.' },
      { condition: '임플란트 자체나 주변 조직 문제라면', option: '보철 수리와 구분해 추가 치료 계획을 세웁니다.', limit: '흔들리는 느낌만으로 제거·재식립을 결정하지 않습니다.' }
    ],
    unknown: '“더 세게 조이면 해결된다”거나 “세 번째이니 무조건 다시 심어야 한다”고 단정할 수 없습니다. 직접 도구로 조이거나 반복해서 흔들어 확인하지 말고 진료를 요청하세요.',
    prepare: ['두 차례 조임을 받은 날짜와 처치 내역', '임플란트 제조사·모델 정보가 있다면 함께 준비', '씹을 때, 가만히 있을 때 등 불편이 나타나는 조건'],
    localHeading: '아산에서 임플란트 흔들림 상담을 준비한다면',
    localAdvice: '천안으로 방문하기 전 반복 수리 이력과 제품 정보 유무를 전달하세요. 부품 확인이나 보철 제작이 필요하면 추가 방문이 생길 수 있으므로, 첫 방문에서 가능한 평가와 이후 일정은 나누어 확인하는 것이 좋습니다.',
    related: [{ title: '임플란트 흔들림의 원인과 검사', href: '/column/implant-loosening-symptoms-causes-diagnosis-treatment' }, { title: '수리와 재식립 설명이 다를 때', href: '/concerns/implant-repair-or-replace' }],
    sources: [screw, fda], updated: '2026-09-16'
  },
  {
    slug: 'root-canal-pain-years-later',
    publishedAt: '2026-09-18T09:00:00+09:00',
    title: '신경치료한 지 몇 년 지났는데 씹을 때만 아파요.',
    region: '홍성', areaPath: '/area/hongseong', topic: '신경치료', concern: '다시 불편해졌어요',
    description: '홍성에서 오래된 신경치료 부위의 씹을 때 통증을 상담하려는 분을 위한 증상 기록과 재치료 선택의 확인 사항입니다.',
    situation: '몇 년 동안 문제없이 사용한 신경치료 치아가 최근 씹을 때만 아픕니다. 홍성에서 다른 병원 의견을 듣기 전에 무엇을 준비할지 알고 싶습니다.',
    answer: '신경치료를 마친 치아도 시간이 지난 뒤 새로운 문제가 생길 수 있습니다. 씹을 때 아프다는 증상만으로 재신경치료나 발치를 정하지 않고, 해당 치아와 보철·주변 상태를 함께 확인합니다.',
    checks: ['예전 신경치료와 크라운 치료 시기, 최근 충격이나 수리 여부를 전달합니다.', '누를 때와 힘을 뺄 때 중 언제 아픈지, 특정 음식에서만 느끼는지 적습니다.', '현재 검사와 이전 영상이 있다면 비교해 재감염·보철 문제·균열 등의 가능성을 평가합니다.'],
    choices: [
      { condition: '치아 내부의 재감염이 확인되고 보존 가능하다면', option: '재신경치료 등 치아를 유지하는 방법을 검토합니다.', limit: '기존 보철과 치아 상태에 따라 접근 방법과 예후가 달라집니다.' },
      { condition: '크라운이나 치아 구조의 문제가 확인되면', option: '수복 치료로 해결 가능한 범위를 확인합니다.', limit: '균열 범위 등에 따라 보존이 어려운 경우도 있어 개별 평가가 필요합니다.' }
    ],
    unknown: '통증이 약하거나 씹을 때만 있다는 사실은 상태가 가볍다는 보장이 아닙니다. 사진 한 장으로 원인이나 필요한 치료 횟수를 확정하기 어렵습니다.',
    prepare: ['신경치료·크라운을 받은 대략적인 연도', '이전 영상과 최근 상담 내용이 있다면 준비', '아픈 위치, 시작일, 씹는 동작과 통증의 관계'],
    localHeading: '홍성에서 신경치료 후 통증 상담을 준비한다면',
    localAdvice: '천안 방문 일정을 잡을 때 “새로 생긴 치통”과 “오래된 신경치료 치아의 통증”을 구분해 알려주세요. 기존 영상 자료를 가져갈 수 있는지 확인하고, 재치료가 필요할 경우 여러 번 방문할 가능성까지 상담하세요.',
    related: [{ title: '신경치료 가이드', href: '/guide/root-canal' }, { title: '재신경치료와 임플란트 비교', href: '/guide/compare/re-root-canal-vs-implant' }, { title: '검사는 괜찮다는데 계속 불편할 때', href: '/concerns/molar-discomfort-normal-xray' }],
    sources: [retreat, crack], updated: '2026-09-16'
  },
  {
    slug: 'molar-discomfort-normal-xray',
    publishedAt: '2026-09-18T09:00:00+09:00',
    title: '엑스레이는 괜찮다는데 어금니가 계속 불편해요.',
    region: '예산', areaPath: '/area/yesan', topic: '어금니 불편', concern: '검사 설명과 느낌이 달라요',
    description: '예산에서 지속되는 어금니 불편으로 상담을 고민할 때, 정상이라는 영상 설명과 실제 증상을 함께 전달하는 방법을 정리합니다.',
    situation: '예산에서 검사를 받고 엑스레이에 큰 이상이 없다는 설명을 들었습니다. 그런데 어떤 음식을 씹을 때는 어금니가 계속 불편해 다시 물어보고 싶습니다.',
    answer: '영상에서 뚜렷한 이상이 보이지 않는다는 설명과 불편감이 지속된다는 사실을 함께 평가해야 합니다. 검사 종류와 당시 확인한 범위를 살피고, 증상이 생기는 조건을 진료실에서 다시 설명하는 것이 출발점입니다.',
    checks: ['어떤 영상을 언제 촬영했고 무엇을 확인했다는 설명을 들었는지 정리합니다.', '차거나 뜨거운 것, 씹기, 힘을 빼는 순간 등 증상 조건을 구분합니다.', '치아 균열처럼 증상이 일정하지 않거나 위치를 찾기 어려운 문제도 있어, 영상 외 임상 검사를 함께 고려합니다.'],
    choices: [
      { condition: '추가 검사로 원인이 확인되면', option: '확인된 문제에 맞춰 보존·수복 등 치료 범위를 설명받습니다.', limit: '어금니 불편을 모두 균열이나 충치로 간주하지 않습니다.' },
      { condition: '원인이 아직 분명하지 않다면', option: '필요한 추가 평가나 경과 확인 계획을 상의합니다.', limit: '재평가 시점과 증상이 변할 때 연락할 기준을 확인하세요.' }
    ],
    unknown: '이 글만으로 치아에 금이 갔다고 진단하거나 특정 검사를 반드시 받아야 한다고 결정할 수 없습니다. 원인을 찾기 위해 아픈 치아를 일부러 강하게 물어 시험하지 마세요.',
    prepare: ['기존 영상 또는 촬영 날짜·검사 종류', '불편한 위치와 유발 조건을 적은 짧은 메모', '최근 충전·크라운 치료나 외상 여부'],
    localHeading: '예산에서 어금니 불편으로 다시 상담받는다면',
    localAdvice: '천안 방문 전 “영상은 괜찮다고 들었지만 특정 동작에서 불편이 반복된다”고 설명해 주세요. 이전 검사 자료를 비교할 수 있는지 먼저 확인하면, 같은 설명을 처음부터 되풀이하는 부담을 줄이는 데 도움이 됩니다.',
    related: [{ title: '치아 균열에 관한 가이드', href: '/guide/regret/tooth-crack' }, { title: '신경치료한 치아가 다시 아플 때', href: '/concerns/root-canal-pain-years-later' }],
    sources: [crack], updated: '2026-09-16'
  },
  {
    slug: 'implant-repair-or-replace',
    publishedAt: '2026-09-19T09:00:00+09:00',
    title: '한 병원은 임플란트를 수리하자고, 다른 병원은 다시 심자고 해요.',
    region: '당진', areaPath: '/area/dangjin', topic: '임플란트', concern: '병원마다 설명이 달라요',
    description: '당진에서 임플란트 수리와 재수술 사이에서 고민할 때, 두 치료계획의 근거와 범위를 비교하는 질문을 정리합니다.',
    situation: '당진에서 임플란트 불편으로 서로 다른 치료계획을 들었습니다. 비용도 다르고 설명도 달라 어느 쪽을 선택할지 막막합니다.',
    answer: '먼저 두 병원이 같은 부분의 문제를 설명하고 있는지 확인해야 합니다. “수리”와 “재수술”이라는 이름만 비교하기보다 무엇을 남기고 무엇을 바꾸는지, 그 판단 근거가 무엇인지 설명받으세요.',
    checks: ['수리 대상이 보철·나사인지, 재수술 대상이 임플란트 자체인지 구분합니다.', '고정 상태, 주변 조직 상태와 영상에서 확인한 내용을 각각 물어봅니다.', '현재 임플란트를 유지할 때의 한계와 제거할 때의 이유를 같은 기준으로 비교합니다.'],
    choices: [
      { condition: '보철·연결부에 국한된 문제로 평가되면', option: '현재 임플란트를 유지하며 수리할 가능성을 검토합니다.', limit: '부품 상태와 재발 원인에 따라 유지 가능 범위가 달라집니다.' },
      { condition: '주위 조직에 질환이 있다면', option: '상태에 따른 치료와 재평가, 필요한 경우 수술을 논의합니다.', limit: '주위염이라는 진단만으로 모든 임플란트를 제거하는 것은 아닙니다.' },
      { condition: '현재 임플란트를 유지하기 어렵다고 판단되면', option: '제거 이유와 이후 보철 회복 계획을 설명받습니다.', limit: '다시 심는 시점·뼈이식·임시 치아 필요성은 별도로 확인합니다.' }
    ],
    unknown: '온라인에서 두 병원 중 누가 옳은지 판정할 수 없습니다. 검사 시점이나 확보한 정보가 달랐을 수도 있으므로 두 치료계획과 진단 근거를 함께 가져오세요.',
    prepare: ['두 곳에서 받은 치료계획서와 영상 자료', '각 견적에 포함된 치료·부품·방문 단계', '가장 중요한 조건: 치아 유지, 비용, 방문 횟수 등'],
    localHeading: '당진에서 임플란트 재수술 의견을 더 듣고 싶다면',
    localAdvice: '천안에 예약할 때 “수리와 재식립 두 의견을 비교하려는 상담”임을 알려주세요. 비용 총액뿐 아니라 단계별 방문, 임시 보철, 경과 확인이 포함되는지 같은 항목으로 질문하면 이동 일정을 세우기 수월합니다.',
    related: [{ title: '임플란트 재수술 진료 안내', href: '/treatments/implant-revision' }, { title: '임플란트 치료 전후 고민 가이드', href: '/guide/regret/implant' }],
    sources: [efp, fda, screw], updated: '2026-09-16'
  },
  {
    slug: 'implant-consultation-records-seosan',
    publishedAt: '2026-09-19T09:00:00+09:00',
    title: '서산에서 임플란트 상담을 가려는데, 어떤 자료를 가져가야 하나요?',
    region: '서산', areaPath: '/area/seosan', topic: '임플란트', concern: '방문 준비가 막막해요',
    description: '서산에서 천안으로 임플란트 불편 상담을 방문하기 전 준비할 기록, 자료가 없을 때 전달할 내용과 일정 확인 질문입니다.',
    situation: '서산에서 천안으로 임플란트 상담을 갈 예정입니다. 예전에 받은 자료가 흩어져 있고 여러 번 이동하기 어려워 첫 방문 준비를 정리하고 싶습니다.',
    answer: '가지고 있는 자료를 모으되, 자료를 완벽히 갖추는 것보다 어떤 불편으로 상담받는지 먼저 전달하는 것이 좋습니다. 기록이 있더라도 현재 검사가 필요할 수 있고 첫날 상담과 치료 완료는 별개의 일정입니다.',
    checks: ['상담 목적이 새 임플란트, 기존 임플란트 불편, 다른 치료계획 확인 중 무엇인지 정합니다.', '제품 카드·진료내역·영상 자료 중 보유한 것과 없는 것을 구분합니다.', '첫 방문 평가 범위와 이후 치료에 필요한 방문을 나누어 문의합니다.'],
    choices: [
      { condition: '임플란트 제품 정보와 기존 영상이 있다면', option: '예약할 때 보유 사실을 알리고 가져갈 자료 형식을 확인합니다.', limit: '기록이 있어도 현재 상태에 대한 검사를 생략할 수 있다고 단정하지 않습니다.' },
      { condition: '자료가 없거나 기존 치과에 연락하기 어렵다면', option: '치료 시기·부위·현재 불편부터 정리해 상담을 요청합니다.', limit: '제품 식별이나 부품 확인에 추가 시간이 필요할 수 있습니다.' }
    ],
    unknown: '사전 자료만으로 최종 치료비, 필요한 모든 방문 횟수, 당일 치료 가능 여부를 확정할 수 없습니다. 예약은 내원 시간을 상의하는 과정이며 치료 완료 약속은 아닙니다.',
    prepare: ['보유 중인 보증서·제품 카드·치료계획서', '기존 영상 파일이나 출력물: 병원에서 확인 가능한 형식 문의', '복용 중인 약과 주요 질환을 정리한 목록', '현재 불편, 상담 목적, 이동 가능한 날짜를 적은 메모'],
    localHeading: '서산에서 천안으로 방문하기 전 확인할 세 가지',
    localAdvice: '자료를 어떤 형식으로 가져갈지, 첫 상담에 어느 정도 시간을 잡을지, 추가 방문이 필요하면 어떤 간격으로 진행할지 문의하세요. 실제 이동 시간은 출발지와 교통 상황에 따라 달라지므로 오시는 길에서 경로를 확인하세요. 서울비디치과는 서산 지점이 아닌 천안 불당동에서 진료합니다.',
    related: [{ title: '기존 치과가 폐업한 경우', href: '/concerns/implant-clinic-closed' }, { title: '임플란트 치료 가이드', href: '/guide/implant' }, { title: '오시는 길', href: '/directions' }],
    sources: [fda, { title: 'NHS · 치과 감염에서 신속한 진료가 필요한 증상', href: 'https://www.nhs.uk/conditions/dental-abscess/' }], updated: '2026-09-16'
  },
  {
    "slug": "crown-fell-out-with-tooth-piece",
    "title": "크라운이 빠졌는데, 안쪽에 치아 조각 같은 게 붙어 있어요.",
    "region": "천안",
    "areaPath": "/area/cheonan",
    "topic": "크라운",
    "concern": "치아까지 부러진 건지 무서워요",
    "description": "천안에서 빠진 크라운 안쪽의 조각 때문에 걱정된다면, 보철 재사용과 남은 치아 보존을 어떻게 구분해 상담할지 정리해 보세요.",
    "situation": "천안에 살며 예전에 씌운 크라운이 식사 중 빠졌습니다. 안쪽이 비어 있지 않고 단단한 덩어리가 붙어 있어, 내 치아까지 부러져 나온 건지 걱정됩니다.",
    "answer": "빠진 크라운 안쪽의 덩어리는 접착 재료나 치아를 보강했던 재료, 실제 치아 일부 등 여러 가능성이 있습니다. 겉모습만으로 구분하거나 다시 붙일 수 있다고 판단하지 않고, 빠진 보철과 입안에 남은 치아를 함께 확인해야 합니다.",
    "checks": [
      "빠진 시점과 직전의 흔들림·씹을 때 불편, 이전 신경치료나 기둥 치료 여부를 전달합니다.",
      "크라운 자체의 손상과 안쪽에 붙은 구조, 입안에 남은 치아의 충치·파절·지지 상태를 구분해 평가합니다.",
      "기존 크라운을 사용할 수 있는지와 치아를 남길 수 있는지는 별도로 설명받습니다. 필요한 경우 영상 검사와 추가 평가를 함께 진행합니다."
    ],
    "choices": [
      {
        "condition": "남은 치아와 기존 크라운 상태가 재부착에 적합하다면",
        "option": "기존 보철을 다시 사용하는 방안을 검토합니다.",
        "limit": "밖에서 보기에 멀쩡하다는 이유만으로 재사용을 확정하지 않습니다."
      },
      {
        "condition": "치아를 보존할 수 있지만 지지 구조나 크라운의 회복이 필요하다면",
        "option": "남은 치아를 보강하고 보철을 다시 만드는 등 수복 범위를 상의합니다.",
        "limit": "신경치료나 추가 처치의 필요성은 현재 검사 결과에 따라 달라집니다."
      },
      {
        "condition": "깊은 파절 등으로 치아를 유지하기 어렵다고 판단되면",
        "option": "보존이 어려운 근거와 다른 치료 선택을 설명받습니다.",
        "limit": "안쪽에 조각이 붙어 있다는 사실만으로 발치를 결정하지 않습니다."
      }
    ],
    "unknown": "사진에 보이는 색이나 모양만으로 충치, 치근 파절, 재사용 가능성을 확정할 수 없습니다. 가정용 접착제로 붙이거나, 맞는지 보려고 반복해서 끼우거나, 안쪽 재료를 긁어내지 마세요.",
    "prepare": [
      "빠진 크라운을 잃어버리지 않게 보관해 가져오기. 붙어 있는 부분은 임의로 분리하지 않기",
      "신경치료·기둥·크라운을 받은 대략적인 시기와 보유한 이전 영상",
      "빠지기 전후의 통증·부기·출혈·씹기 어려움과 시작 시점",
      "첫날 가장 필요한 도움: 통증 확인, 치아 보호, 보철 재사용 가능성 등"
    ],
    "localHeading": "천안에서 크라운 탈락 상담을 준비한다면",
    "localAdvice": "예약할 때 “크라운이 빠졌고 안쪽에 단단한 조각이 붙어 있다”고 알려주세요. 다시 붙이기만 원하는지보다 치아까지 손상됐는지가 걱정된다고 말씀하셔도 됩니다. 서울비디치과는 천안 불당동에서 진료하며, 첫날 가능한 평가·보호 처치와 최종 보철 완료 일정은 나누어 확인하세요.",
    "related": [
      {
        "title": "크라운 치료 안내",
        "href": "/treatments/crown"
      },
      {
        "title": "치아 균열에 관한 가이드",
        "href": "/guide/regret/tooth-crack"
      },
      {
        "title": "신경치료한 치아가 다시 아플 때",
        "href": "/concerns/root-canal-pain-years-later"
      }
    ],
    "sources": [
      {
        "title": "NHS Wales · 빠진 크라운의 보관, 진료 및 치료 선택",
        "href": "https://111.wales.nhs.uk/LostFillingorCrown/"
      },
      {
        "title": "NHS Health Education England · 크라운 탈락 시 치아 파절 여부 확인",
        "href": "https://london.wtepharmacy.nhs.uk/dyn/_assets/_folder4/community-pharmacy/dental-fact-sheets/PharmacyDentalFactSheetsFinal.pdf"
      },
      {
        "title": "미국근관치료학회 AAE · 치아 균열의 범위와 치료",
        "href": "https://www.aae.org/patients/dental-symptoms/cracked-teeth/"
      },
      {
        "title": "미국근관치료학회 AAE · 신경치료 후 보철과 기둥의 역할",
        "href": "https://www.aae.org/patients/root-canal-treatment/what-is-a-root-canal/root-canal-explained/"
      },
      {
        "title": "NHS · 치과 감염에서 신속한 진료가 필요한 증상",
        "href": "https://www.nhs.uk/conditions/dental-abscess/"
      }
    ],
    "updated": "2026-09-20",
    "publishedAt": "2026-09-20T14:24:51+09:00"
  },
  {
    "slug": "unfinished-root-canal-after-moving",
    "title": "신경치료를 중간에 멈추고 이사했어요. 다른 치과에서 이어서 받을 수 있나요?",
    "region": "아산",
    "areaPath": "/area/asan",
    "topic": "신경치료",
    "concern": "중단한 치료를 다시 시작하고 싶어요",
    "description": "아산으로 이사한 뒤 중단된 신경치료를 다시 시작하려는 분을 위해, 이전 치료 단계와 현재 상태, 기록·비용·방문 일정을 확인할 질문을 정리합니다.",
    "situation": "아산으로 이사하면서 신경치료 예약을 놓쳤습니다. 마지막에 임시로 막았다는 기억은 있지만 어디까지 치료했는지 모르고, 예전 치과에 다시 다니기는 어렵습니다.",
    "answer": "다른 치과에서 중단된 신경치료의 현재 상태를 평가받을 수 있습니다. 다만 방문 횟수나 통증이 줄었다는 기억만으로 남은 단계를 정할 수는 없습니다. 이전 기록과 현재 검사로 어느 단계였는지, 치아를 어떻게 보호하고 있었는지 확인한 뒤 이어갈 치료를 계획합니다.",
    "checks": [
      "마지막 진료 날짜, 치료한 부위, 다음에 무엇을 하자고 들었는지를 기억나는 범위에서 정리합니다.",
      "치아 내부 치료가 진행 중인지, 내부 치료를 마치고 최종 수복만 남았는지 기록과 검사로 구분합니다.",
      "임시 재료의 유지 상태, 통증·부기·씹을 때 변화와 남은 치아 구조를 함께 평가합니다."
    ],
    "choices": [
      {
        "condition": "치아 내부 치료가 미완료이고 보존 치료가 가능하다면",
        "option": "현재 상태에 필요한 세척·소독·충전 등 남은 근관치료 단계를 계획합니다.",
        "limit": "이전 처치 일부를 다시 확인하거나 시행할 수 있어 예전 일정표를 그대로 옮기지는 않습니다."
      },
      {
        "condition": "내부 치료는 마쳤고 최종 수복이 남았다면",
        "option": "치아 상태에 맞는 충전·크라운 등 보호와 기능 회복 계획을 세웁니다.",
        "limit": "임시 재료가 보인다는 사실만으로 내부 치료의 완료 여부를 구분할 수 없습니다."
      },
      {
        "condition": "새 감염이나 구조적 손상 등 추가 문제가 확인되면",
        "option": "추가 근관치료나 수복의 가능성과 한계, 다른 선택지를 함께 검토합니다.",
        "limit": "중단 기간만으로 재치료나 발치를 자동 결정하지 않습니다."
      }
    ],
    "unknown": "며칠 또는 몇 달 중단했다는 사실만으로 치아 상태나 남은 방문 횟수를 예측할 수 없습니다. 임시 재료가 빠졌거나 불편이 새로 생겼다면 스스로 안쪽을 청소하거나 채우지 말고 치과에 알려 진료 시점을 안내받으세요.",
    "prepare": [
      "가능하다면 이전 진료기록과 영상 사본, 치료계획서",
      "마지막 방문일과 다음 예약을 놓친 뒤의 증상 변화",
      "임시로 막은 부분이 빠졌거나 깨진 기억, 최종 크라운을 했는지 여부",
      "복용 약과 주요 질환, 앞으로 방문 가능한 요일·시간과 이동 제약"
    ],
    "localHeading": "아산에서 중단된 신경치료를 이어가려면",
    "localAdvice": "아산에서 천안 불당동 서울비디치과로 상담을 고려한다면 “이사 후 신경치료를 이어가지 못했고 마지막 단계는 모른다”고 먼저 알려주세요. 첫 평가와 치료·최종 보철·경과 확인의 방문을 나누어 문의하고, 아산에서 반복 이동할 수 있는 요일과 시간도 함께 상의하세요.",
    "related": [
      {
        "title": "신경치료의 단계와 관리 가이드",
        "href": "/guide/root-canal"
      },
      {
        "title": "치아를 남기는 치료와 발치 후 치료 비교",
        "href": "/guide/compare/root-canal-vs-implant"
      },
      {
        "title": "아산에서 오시는 길 안내",
        "href": "/area/asan"
      }
    ],
    "sources": [
      {
        "title": "미국근관치료학회 AAE · 근관치료의 단계와 최종 수복",
        "href": "https://www.aae.org/patients/root-canal-treatment/what-is-a-root-canal/root-canal-explained/"
      },
      {
        "title": "미국근관치료학회 AAE · 보철 지연·오염과 재치료 평가",
        "href": "https://www.aae.org/patients/root-canal-treatment/endodontic-treatment-options/endodontic-retreatment/"
      },
      {
        "title": "NHS · 신경치료의 여러 방문과 임시 충전",
        "href": "https://www.nhs.uk/tests-and-treatments/root-canal-treatment/"
      },
      {
        "title": "NHS · 치과 감염의 신속한 평가와 응급 증상",
        "href": "https://www.nhs.uk/conditions/dental-abscess/"
      }
    ],
    "updated": "2026-09-20",
    "publishedAt": "2026-09-20T14:24:51+09:00"
  },
  {
    "slug": "chipped-filling-repair-or-replace",
    "title": "레진 가장자리만 조금 깨졌는데, 전부 뜯어내고 다시 해야 하나요?",
    "region": "홍성",
    "areaPath": "/area/hongseong",
    "topic": "레진",
    "concern": "치아를 더 깎게 될까 봐 걱정돼요",
    "description": "홍성에서 레진의 작은 깨짐으로 재치료를 고민한다면, 부분 수리와 전체 교체의 판단 근거, 남은 치아와 방문 부담을 함께 확인해 보세요.",
    "situation": "홍성에 살며 어금니에 때운 레진의 끝부분이 조금 깨진 것을 알게 됐습니다. 크게 아프지는 않은데 전체를 제거하고 다시 치료하자는 설명을 들어, 멀쩡한 치아까지 더 깎게 될까 걱정됩니다.",
    "answer": "겉으로 보이는 깨짐의 크기만으로 부분 수리와 전체 교체를 정하지 않습니다. 손상이 국소적인지, 남은 충전물과 치아가 어떤 상태인지, 충치나 균열 등 다른 문제가 있는지 평가한 뒤 보존 가능한 범위를 설명받는 것이 먼저입니다.",
    "checks": [
      "깨진 부위가 충전물인지 치아 일부인지, 언제 알게 됐고 무엇이 달라졌는지 전달합니다.",
      "충전물의 나머지 부분과 경계, 주변 치아의 상태를 진찰하고 필요한 검사를 확인합니다.",
      "이번에 부분만 다룰 수 있는 조건과 전체를 바꿔야 한다는 판단 근거를 각각 물어봅니다."
    ],
    "choices": [
      {
        "condition": "문제가 표면이나 국소적인 손상에 한정되고 나머지 상태가 적절하다면",
        "option": "표면 정리나 부분 수리 등 보존적인 방법을 검토합니다.",
        "limit": "모든 작은 깨짐이 수리 대상인 것은 아니며 경과 확인이 필요할 수 있습니다."
      },
      {
        "condition": "충전물의 넓은 범위나 아래쪽 치아에 문제가 있다면",
        "option": "제거·재수복 범위와 적합한 재료를 현재 상태에 맞춰 계획합니다.",
        "limit": "겉에서 작게 보였다는 사실만으로 내부 손상까지 작다고 정할 수 없습니다."
      },
      {
        "condition": "치아 구조의 손상 등 단순 충전 이상의 문제가 확인된다면",
        "option": "치아를 보호할 수복 범위와 필요한 추가 평가를 상의합니다.",
        "limit": "깨졌다는 이유만으로 인레이·크라운·신경치료가 자동으로 정해지지는 않습니다."
      }
    ],
    "unknown": "사진이나 혀에 닿는 느낌만으로 남은 충전물 아래 상태까지 알 수 없습니다. 날카로운 도구로 경계를 긁거나 손상 부위를 직접 다듬지 말고, 집에서 접착제나 충전 재료로 메우려 하지 마세요.",
    "prepare": [
      "레진 치료와 이후 수리의 대략적인 시기",
      "깨짐을 발견한 때와 그전부터 있던 시림·씹을 때 불편·음식물 끼임",
      "가지고 있다면 이전 영상이나 치료계획, 이번 상담에서 받은 설명",
      "가장 걱정되는 점: 치아 삭제, 재발, 비용, 방문 횟수 등"
    ],
    "localHeading": "홍성에서 레진 수리·교체 상담을 준비한다면",
    "localAdvice": "홍성에서 천안 불당동 서울비디치과로 방문을 고려한다면 “레진 일부가 깨졌고 부분 수리와 전체 교체를 비교하고 싶다”고 알려주세요. 첫 평가와 실제 수복을 같은 날 할 수 있는지는 미리 확인하고, 추가 방문이 생길 경우 이동 가능한 일정도 함께 전달하세요.",
    "related": [
      {
        "title": "레진 치료 안내",
        "href": "/treatments/resin"
      },
      {
        "title": "레진과 인레이 선택 가이드",
        "href": "/guide/compare/resin-vs-inlay"
      },
      {
        "title": "치아 균열에 관한 가이드",
        "href": "/guide/regret/tooth-crack"
      }
    ],
    "sources": [
      {
        "title": "세계치과의사연맹 FDI · 수복물의 수리와 교체 판단",
        "href": "https://www.fdiworlddental.org/repair-restorations"
      },
      {
        "title": "미국치과의사협회 ADA · 복합레진 충전의 적용과 한계",
        "href": "https://www.mouthhealthy.org/all-topics-a-z/fillings-tooth-colored"
      },
      {
        "title": "미국 국립치과두개안면연구소 NIDCR · 충전과 치아 손상 치료",
        "href": "https://www.nidcr.nih.gov/health-info/dental-fillings"
      },
      {
        "title": "NHS · 깨지거나 금이 간 치아의 평가와 치료",
        "href": "https://www.nhs.uk/conditions/chipped-broken-or-cracked-tooth/"
      }
    ],
    "updated": "2026-09-21",
    "publishedAt": "2026-09-21T09:03:39+09:00"
  },
  {
    "slug": "front-gap-with-fixed-retainer",
    "title": "고정식 유지장치가 붙어 있는데, 앞니 틈이 다시 보이는 것 같아요.",
    "region": "예산",
    "areaPath": "/area/yesan",
    "topic": "교정 유지장치",
    "concern": "열심히 관리했는데 다시 벌어지는 것 같아요",
    "description": "예산에서 교정 후 앞니 틈과 고정식 유지장치 상태가 걱정된다면, 장치 점검과 치아 위치 평가를 구분하고 재상담을 준비해 보세요.",
    "situation": "예산에 살며 교정을 마친 뒤 앞니 안쪽에 고정식 유지장치를 붙이고 지냈습니다. 철사는 그대로인 것 같은데 최근 앞니 사이가 전보다 벌어져 보여, 다시 교정해야 할까 걱정됩니다.",
    "answer": "철사가 보인다는 사실만으로 모든 접착 부위와 치아 위치가 안정적이라고 판단할 수는 없습니다. 유지장치의 부착·변형 여부와 실제 치아의 변화를 함께 확인하고, 장치를 관리하는 일과 이미 생긴 위치 변화를 다루는 일을 구분해 상담합니다.",
    "checks": [
      "교정을 마친 시기, 틈을 처음 알게 된 때, 이전 유지장치 수리 여부를 전달합니다.",
      "고정식 장치가 연결된 치아의 접착과 철사 상태, 치아 배열과 맞물림을 진료실에서 확인합니다.",
      "함께 쓰던 착탈식 장치가 있다면 현재 맞음새와 안내받았던 착용 계획을 설명합니다."
    ],
    "choices": [
      {
        "condition": "장치의 일부 접착이나 상태에 문제가 확인되면",
        "option": "재부착·수리·교체 등 유지 관리 방법을 검토합니다.",
        "limit": "장치 수리만으로 이미 생긴 모든 틈이 닫히는 것은 아닙니다."
      },
      {
        "condition": "치아 위치 변화가 확인돼 교정적 조정이 필요하다면",
        "option": "변화의 범위와 맞물림을 평가해 가능한 재치료 범위를 상의합니다.",
        "limit": "작은 틈이라는 이유만으로 짧은 부분교정이나 특정 장치를 확정할 수 없습니다."
      },
      {
        "condition": "변화 여부나 원인을 더 확인해야 한다면",
        "option": "이전 기록과 비교하고 필요한 검사·관찰 계획을 설명받습니다.",
        "limit": "확인되지 않은 상태에서 집에서 철사를 조정하거나 오래된 장치를 강제로 끼우지 않습니다."
      }
    ],
    "unknown": "거울이나 휴대전화 사진만으로 틈의 원인과 재교정 필요성을 확정할 수 없습니다. 접착이 떨어졌는지 보려고 철사를 잡아당기거나, 치아를 밀어 틈을 닫거나, 직접 접착·절단하지 마세요.",
    "prepare": [
      "교정 종료와 유지장치 제작·수리의 대략적인 시기",
      "보관 중인 이전 사진·교정 기록과 변화가 처음 보인 시점",
      "현재 사용하는 착탈식 유지장치가 있다면 보관함에 넣어 가져오기",
      "느슨함·찌름·통증·맞물림 변화와 다시 치료할 때 부담되는 일정"
    ],
    "localHeading": "예산에서 교정 유지장치 상담을 준비한다면",
    "localAdvice": "예산에서 천안 불당동 서울비디치과 방문을 고려한다면 “고정식 유지장치는 보이지만 앞니 틈이 달라진 것 같다”고 설명하세요. 기존 교정 치과에 계속 다니기 어려운 사정과 기록 유무, 반복 방문 가능한 요일을 함께 알려 첫 점검과 이후 치료 일정을 나누어 상의하세요.",
    "related": [
      {
        "title": "유지장치 관리와 교정 후 고민 가이드",
        "href": "/guide/regret/retainer"
      },
      {
        "title": "앞니 틈의 레진·교정 비교 가이드",
        "href": "/guide/compare/resin-vs-ortho-gap"
      },
      {
        "title": "예산에서 오시는 길 안내",
        "href": "/area/yesan"
      }
    ],
    "sources": [
      {
        "title": "영국교정학회 BOS · 고정식 유지장치 접착 점검과 치아 이동",
        "href": "https://bos.org.uk/patients/treatments/orthodontics-for-adults/everything-you-need-to-know-before-having-your-teeth-straightened/"
      },
      {
        "title": "미국교정학회 AAO · 교정 후 치아 변화와 재평가",
        "href": "https://aaoinfo.org/whats-trending/will-my-teeth-stay-where-my-orthodontist-moved-them/"
      },
      {
        "title": "미국교정학회 AAO · 잘 맞지 않거나 아픈 유지장치",
        "href": "https://aaoinfo.org/whats-trending/my-retainer-feels-tight-can-i-still-wear-it/"
      },
      {
        "title": "NHS Nottingham University Hospitals · 유지장치 관리와 점검",
        "href": "https://www.nuh.nhs.uk/orthodontics-retainers"
      }
    ],
    "updated": "2026-09-21",
    "publishedAt": "2026-09-21T09:03:39+09:00"
  },
  {
    "slug": "extraction-pain-worse-on-day-four",
    "title": "이를 뺀 지 나흘째인데 처음보다 더 아파요. 실밥 풀 때까지 기다려도 될까요?",
    "region": "당진",
    "areaPath": "/area/dangjin",
    "topic": "발치 후 통증",
    "concern": "예정된 진료일까지 참아도 될까요",
    "description": "당진에서 발치 나흘째 심해진 통증 때문에 재방문을 고민한다면, 예약일 전에 연락할 기준과 드라이소켓·감염 평가, 이동 전 전달할 내용을 확인해 보세요.",
    "situation": "당진에 살며 며칠 전 이를 뺐습니다. 처음 이틀은 버틸 만했는데 나흘째 더 아프고 잠도 설칩니다. 실밥을 빼는 날은 아직 남아 있어, 정상적으로 낫는 중인지 먼저 가 봐야 하는지 망설여집니다.",
    "answer": "발치 후 며칠이 지나 통증이 더 심해지거나 처방받은 진통제로도 조절되지 않는다면, 실밥 제거일까지 기다리지 말고 발치한 치과에 당일 연락해 진료 시점을 안내받으세요. 드라이소켓과 감염 등은 증상만으로 구분하기 어려워 발치 부위를 직접 확인해야 합니다.",
    "checks": [
      "발치한 날짜와 부위, 처음보다 더 아파진 시점, 잠이나 식사에 미치는 영향을 전달합니다.",
      "붓기가 커지는지, 열·불쾌한 맛·계속되는 출혈·입 벌리기 어려움이 함께 있는지 알립니다.",
      "복용한 약의 이름과 마지막 복용 시각, 진통 효과가 어느 정도였는지 준비합니다."
    ],
    "choices": [
      {
        "condition": "진찰에서 드라이소켓으로 판단되면",
        "option": "치과에서 발치 부위를 세척하고 필요에 따라 드레싱 등 통증을 줄이는 처치를 검토합니다.",
        "limit": "집에서 상처를 씻어내거나 재료를 채우는 방법이 아니며, 추가 경과 확인이 필요할 수 있습니다."
      },
      {
        "condition": "감염이 의심되거나 다른 이상이 확인되면",
        "option": "감염 범위와 전신 상태에 맞춰 필요한 처치와 약물 치료 여부를 결정합니다.",
        "limit": "아프다는 이유만으로 항생제를 추가하거나 남은 약을 임의로 먹지 않습니다."
      },
      {
        "condition": "호흡·삼킴이 어렵거나 입안과 목 주변이 크게 붓는다면",
        "option": "일반 예약을 기다리지 말고 119 또는 가까운 응급실을 통해 즉시 평가받습니다.",
        "limit": "먼 치과까지 이동하는 계획보다 현재 위치에서 안전하게 도움받는 것이 먼저입니다."
      }
    ],
    "unknown": "통증이 생긴 날짜나 상처 사진만으로 드라이소켓이라고 확정할 수 없습니다. 발치 구멍을 면봉·이쑤시개로 만지거나 직접 약을 넣지 말고, 안내받은 용량을 넘겨 진통제를 복용하지 마세요.",
    "prepare": [
      "발치 날짜·부위와 받은 주의사항 안내문",
      "복용 중인 약 봉투 또는 약 이름을 확인할 수 있는 자료",
      "언제부터 더 아팠는지, 발열·붓기·출혈 등 함께 달라진 점",
      "원래 잡힌 재진 날짜와 오늘 이동 가능한 범위"
    ],
    "localHeading": "당진에서 발치 후 통증으로 연락하거나 방문한다면",
    "localAdvice": "당진에서 천안으로 출발하기 전에 발치했던 치과에 증상 변화를 먼저 알리세요. 그곳과 연락이 어렵다면 가까운 진료 가능한 치과에 평가를 문의할 수 있습니다. 서울비디치과의 실제 진료 장소는 천안 불당동이며, 응급 신호가 있으면 장거리 방문을 기다리지 마세요.",
    "related": [
      {
        "title": "사랑니 발치 과정과 관리 가이드",
        "href": "/guide/wisdom-tooth"
      },
      {
        "title": "당진에서 오시는 길과 방문 준비",
        "href": "/area/dangjin"
      }
    ],
    "sources": [
      {
        "title": "NHS Wirral · 발치 3일 이후 악화되는 통증의 연락 기준",
        "href": "https://www.wchc.nhs.uk/resources/advice-after-tooth-extractions/"
      },
      {
        "title": "NHS Guy’s and St Thomas’ · 발치 후 회복과 드라이소켓 처치",
        "href": "https://www.guysandstthomas.nhs.uk/health-information/dental-surgery-and-recovery"
      },
      {
        "title": "NHS · 사랑니 발치 후 통증·출혈·발열의 신속한 진료 기준",
        "href": "https://www.nhs.uk/tests-and-treatments/wisdom-tooth-removal/"
      },
      {
        "title": "NHS · 치과 감염과 호흡·삼킴 곤란 등 응급 신호",
        "href": "https://www.nhs.uk/conditions/dental-abscess/"
      }
    ],
    "updated": "2026-09-22",
    "publishedAt": "2026-09-22T09:00:00+09:00"
  },
  {
    "slug": "denture-sore-same-spot",
    "title": "틀니를 끼면 같은 자리만 헐어요. 적응할 때까지 참아야 하나요?",
    "region": "서산",
    "areaPath": "/area/seosan",
    "topic": "틀니",
    "concern": "잘 적응하지 못하는 제 탓 같아요",
    "description": "서산에서 틀니의 반복되는 잇몸 상처로 상담을 고민한다면, 적응 과정과 점검이 필요한 통증을 구분하고 조정·수리·재제작 전에 물어볼 내용을 정리해 보세요.",
    "situation": "서산에 살며 틀니를 쓰고 있는데 끼울 때마다 같은 잇몸이 쓸리고 헙니다. 빼면 조금 편하지만 사람을 만나거나 식사할 때는 다시 끼워야 해서, 아파도 적응 연습을 계속해야 하는지 고민됩니다.",
    "answer": "틀니에 익숙해지는 시간이 필요할 수 있지만, 같은 부위가 반복해서 헐거나 식사를 못 할 정도의 통증을 계속 참는 것이 적응의 목표는 아닙니다. 틀니가 닿는 부분과 입안의 상처를 함께 점검하고, 조정이 필요한지 다른 원인을 확인해야 하는지 상담하세요.",
    "checks": [
      "틀니를 끼우는 순간, 씹을 때, 오래 착용한 뒤 중 언제 아픈지 구분해 전달합니다.",
      "같은 위치의 상처가 언제부터 있었는지, 틀니를 빼고 있어도 남는지 알립니다.",
      "새 틀니인지 오래 쓴 틀니인지, 최근 발치·조정·헐거워짐이 있었는지 함께 확인합니다."
    ],
    "choices": [
      {
        "condition": "틀니가 국소적으로 누르거나 마찰을 일으키는 부분이 확인되면",
        "option": "치과에서 해당 부위의 조정과 이후 경과 확인을 계획합니다.",
        "limit": "어디를 얼마나 조정할지는 틀니와 입안을 같이 확인해야 하며 직접 갈아내지 않습니다."
      },
      {
        "condition": "잇몸 형태의 변화나 틀니의 손상·맞음새 문제가 있다면",
        "option": "현재 틀니를 조정·수리할 수 있는지, 안쪽 면 보완이나 재제작이 필요한지 비교합니다.",
        "limit": "불편하다는 이유만으로 새 틀니나 임플란트 치료가 자동으로 정해지지는 않습니다."
      },
      {
        "condition": "상처가 오래 낫지 않거나 양상이 달라졌다면",
        "option": "틀니 조정만으로 설명되는지 구강 점막 자체의 추가 평가가 필요한지 확인합니다.",
        "limit": "3주 이상 지속되는 궤양은 반드시 진료받고, 통증·출혈이 악화되면 그 전에도 연락하세요."
      }
    ],
    "unknown": "상처의 모양이나 틀니를 뺐을 때 편해지는 느낌만으로 원인을 확정할 수 없습니다. 틀니를 사포로 갈거나 철사를 구부리고, 접착제·수리 재료로 임의로 모양을 바꾸지 마세요.",
    "prepare": [
      "현재 틀니를 보관함에 담아 준비하기",
      "제작과 최근 조정·발치의 대략적인 시기",
      "상처가 처음 생긴 날, 아픈 위치와 식사·착용에 미치는 영향",
      "사용 중인 세정제나 고정제 이름, 야간 착용 여부와 가장 부담되는 방문 일정"
    ],
    "localHeading": "서산에서 틀니 통증 상담을 준비한다면",
    "localAdvice": "서산에서 천안 불당동 서울비디치과 방문을 고려한다면, 틀니 조정 상담과 입안 상처 확인을 함께 받고 싶다고 알려주세요. 출발 전에 진료 전 착용 방법을 문의하고 틀니를 가져오세요. 반복 방문이 어렵다면 가능한 요일을 말하되, 상처가 오래 남는 경우 점검을 미루지는 마세요.",
    "related": [
      {
        "title": "틀니 사용과 관리의 기본 가이드",
        "href": "/guide/denture"
      },
      {
        "title": "틀니 치료 뒤 불편과 후회 가이드",
        "href": "/guide/regret/denture"
      },
      {
        "title": "서산에서 오시는 길과 방문 준비",
        "href": "/area/seosan"
      }
    ],
    "sources": [
      {
        "title": "NHS · 틀니 적응·통증·맞음새와 정기 점검",
        "href": "https://www.nhs.uk/tests-and-treatments/dentures/"
      },
      {
        "title": "NHS Leeds · 부분틀니의 통증과 전문적인 조정",
        "href": "https://www.leedsth.nhs.uk/patients/resources/removable-partial-dentures/"
      },
      {
        "title": "NHS Leeds · 발치 직후 틀니의 착용과 잇몸 변화",
        "href": "https://www.leedsth.nhs.uk/patients/resources/immediate-dentures/"
      },
      {
        "title": "NHS · 지속되는 구강 궤양과 진료가 필요한 변화",
        "href": "https://www.nhs.uk/conditions/mouth-ulcers/"
      }
    ],
    "updated": "2026-09-22",
    "publishedAt": "2026-09-22T09:00:00+09:00"
  },
  {
    "slug": "gaps-between-teeth-after-scaling",
    "title": "스케일링 뒤 앞니 사이가 비어 보여요. 치아가 깎인 건가요?",
    "region": "천안",
    "areaPath": "/area/cheonan",
    "topic": "스케일링",
    "concern": "치료 뒤 모습이 달라 보여요",
    "description": "천안에서 스케일링 뒤 앞니 사이의 검은 틈과 시림이 걱정될 때, 잇몸 변화와 치아 손상을 구분하고 다음 상담에서 확인할 내용을 정리합니다.",
    "situation": "천안에서 스케일링을 받고 집에 왔는데 아래 앞니 사이가 전보다 휑해 보입니다. 혀로 만지면 낯설고 찬물도 시려, 치석이 아니라 치아까지 깎인 것은 아닌지 걱정됩니다.",
    "answer": "스케일링 뒤 틈이 눈에 띈다는 이유만으로 치아가 깎였다고 판단할 수는 없습니다. 특히 염증이 있던 잇몸을 치료하면 부기가 줄고 잇몸선이 달라지면서 사이가 더 드러날 수 있습니다. 다만 새로 느껴지는 결손이나 계속되는 통증까지 모두 정상 반응으로 넘기지는 말고, 치료 전 기록과 현재 잇몸·치아 상태를 확인해야 합니다.",
    "checks": [
      "언제 스케일링을 했고, 틈·시림·출혈 중 무엇이 언제부터 눈에 띄었는지 나누어 적습니다.",
      "일반적인 치석 제거만 받았는지, 잇몸 아래쪽 치료도 받았는지 확인합니다.",
      "치료 전 사진이나 잇몸 검사 기록이 있다면 현재 모습과 함께 설명을 요청합니다."
    ],
    "choices": [
      {
        "condition": "염증이 줄어드는 과정과 기존 잇몸 퇴축이 주된 원인이라면",
        "option": "잇몸 관리와 시림 대처를 안내받고 정한 시점에 경과를 확인합니다.",
        "limit": "기다리면 모든 틈이 원래대로 채워진다고 약속할 수는 없습니다."
      },
      {
        "condition": "치아 결손·수복물 문제나 남아 있는 잇몸질환이 확인된다면",
        "option": "확인된 원인에 맞춰 필요한 치료와 범위를 따로 상의합니다.",
        "limit": "빈틈 사진만으로 수복이나 수술의 필요성을 정하지 않습니다."
      }
    ],
    "unknown": "사진만으로 변화의 원인, 손상 여부, 틈이 줄어들 정도와 기간을 알 수는 없습니다. 모양을 개선하는 치료가 가능한지와 비용은 잇몸 건강·치아 형태를 확인한 뒤 별도로 설명받으세요.",
    "prepare": [
      "치료 날짜와 기억나는 치료 내용, 기존 잇몸 진단",
      "가지고 있다면 이전 구강 사진과 현재 같은 부위의 사진",
      "시림이 생기는 상황, 지속 시간, 식사·양치에서 불편한 점"
    ],
    "localHeading": "천안에서 스케일링 뒤 변화를 다시 확인받으려면",
    "localAdvice": "예약할 때 단순 검진이라고만 말하기보다 ‘스케일링 뒤 앞니 틈과 시림이 신경 쓰인다’고 알려주세요. 원래 치료한 곳에 기록 설명을 요청하거나, 다른 곳에서 현재 상태를 평가받을 수 있습니다. 서울비디치과의 진료 장소는 천안 불당동이며, 첫 방문에서 확인할 범위와 이후 점검 일정을 따로 상의하세요.",
    "related": [
      {
        "title": "스케일링의 목적과 관리 가이드",
        "href": "/guide/scaling"
      },
      {
        "title": "교정 유지장치가 있는데 앞니 사이가 벌어졌다면",
        "href": "/concerns/front-gap-with-fixed-retainer"
      },
      {
        "title": "천안에서 첫 상담 준비하기",
        "href": "/area/cheonan#visit-preparation"
      }
    ],
    "sources": [
      {
        "title": "NHS Guy’s and St Thomas’ · 잇몸 치료 후 시림·잇몸 퇴축과 치아 사이 변화",
        "href": "https://www.guysandstthomas.nhs.uk/health-information/managing-advanced-gum-disease-undergraduate-students"
      },
      {
        "title": "유럽치주학회 EFP · 잇몸 퇴축의 원인과 치주 검사",
        "href": "https://www.efp.org/for-patients/gum-diseases/faqs/"
      },
      {
        "title": "NHS · 치아 사이 청소 도구와 올바른 사용",
        "href": "https://www.nhs.uk/live-well/healthy-teeth-and-gums/how-to-keep-your-teeth-clean/"
      },
      {
        "title": "NHS · 잇몸질환의 증상과 진료가 필요한 변화",
        "href": "https://www.nhs.uk/conditions/gum-disease/"
      }
    ],
    "updated": "2026-09-23",
    "publishedAt": "2026-09-23T09:00:00+09:00"
  },
  {
    "slug": "toothache-early-pregnancy-xray-worry",
    "title": "임신 초기인데 어금니가 아파요. 엑스레이가 무서워 출산까지 미뤄야 할까요?",
    "region": "아산",
    "areaPath": "/area/asan",
    "topic": "임신 중 치과진료",
    "concern": "아기에게 영향이 갈까 두려워요",
    "description": "아산에서 임신 초기 치통으로 치과 방문을 망설일 때, 필요한 검사·국소마취와 치료 시기, 산부인과와 확인할 사항을 차분히 정리합니다.",
    "situation": "아산에서 임신 초기 진료를 받고 있는데 어금니가 아프기 시작했습니다. 치과에 가면 엑스레이와 마취부터 할까 봐 무섭고, 참고 버티자니 잠과 식사가 불편해집니다.",
    "answer": "임신 초기라는 이유만으로 치통 평가와 필요한 치료를 출산 뒤까지 미뤄야 하는 것은 아닙니다. 미국치과의사협회는 필요한 치과 영상검사와 국소마취, 응급 치과치료가 임신 중 시행될 수 있다고 안내합니다. 실제 검사·약제·일정은 증상과 임신 경과를 확인해 정하며, 고위험 임신이나 약물·진정 관련 판단은 산부인과와 필요한 내용을 조율합니다.",
    "checks": [
      "임신 주수와 출산 예정일, 산부인과에서 받은 주의 사항을 치과에 먼저 알립니다.",
      "통증의 시작·변화와 붓기·발열 여부, 먹거나 잠드는 데 지장이 있는지 설명합니다.",
      "현재 복용하는 약과 알레르기, 가지고 있는 기존 치과 영상의 날짜를 확인합니다."
    ],
    "choices": [
      {
        "condition": "통증 원인 확인이나 감염에 대한 처치가 지금 필요하다면",
        "option": "임신 상태를 고려해 필요한 검사와 치료를 계획합니다.",
        "limit": "안정기나 출산까지 일괄적으로 기다리는 것으로 정하지 않습니다."
      },
      {
        "condition": "급하지 않은 치료로 판단되고 일정을 조정할 수 있다면",
        "option": "몸 상태와 산과적 주의 사항에 맞춰 방문 시기와 진료 시간을 상의합니다.",
        "limit": "진단 없이 통증의 정도만으로 미뤄도 된다고 판단하지 않습니다."
      }
    ],
    "unknown": "어떤 촬영이 필요한지, 치아를 어떻게 치료할지, 사용할 약제와 방문 횟수는 이 글만으로 결정할 수 없습니다. 임신 중 필요한 진료가 가능하다는 안내가 모든 검사·약·진정 방법에 대한 일괄 허용을 뜻하지는 않습니다.",
    "prepare": [
      "임신 주수·예정일과 산부인과의 개별 주의 사항",
      "복용 약의 정확한 이름, 알레르기와 최근 복용 내역",
      "치통의 위치·시작일·경과, 기존 검사 자료가 있다면 해당 기록"
    ],
    "localHeading": "아산에서 임신 중 치과진료를 준비한다면",
    "localAdvice": "아산에서 천안 불당동으로 방문하기 전 임신 주수와 치통을 함께 알려주세요. 입덧이 심한 시간대, 이동과 누운 자세에서의 불편, 산부인과와 확인할 내용도 미리 상의할 수 있습니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 붓기나 발열이 동반되면 먼 곳의 예약만 기다리지 말고 가까운 치과에서 먼저 진료 필요성을 확인하세요.",
    "related": [
      {
        "title": "치아를 남기는 치료와 발치의 판단 기준",
        "href": "/guide/compare/root-canal-vs-implant"
      },
      {
        "title": "검사상 괜찮다는데 어금니 불편이 계속된다면",
        "href": "/concerns/molar-discomfort-normal-xray"
      },
      {
        "title": "아산에서 첫 상담 준비하기",
        "href": "/area/asan#visit-preparation"
      }
    ],
    "sources": [
      {
        "title": "미국치과의사협회 ADA · 임신 중 영상검사·국소마취·필요한 치과치료",
        "href": "https://www.ada.org/resources/ada-library/oral-health-topics/pregnancy"
      },
      {
        "title": "미국 보건자원서비스청 HRSA · 임신 중 구강 관리와 의료진에게 알릴 내용",
        "href": "https://www.hrsa.gov/oral-health/pregnancy"
      },
      {
        "title": "미국치과의사협회 ADA · 진단에 필요한 치과 영상검사의 선택",
        "href": "https://www.ada.org/resources/practice/practice-management/radiographic-imaging"
      },
      {
        "title": "NHS · 치성 농양과 즉시 진료가 필요한 증상",
        "href": "https://www.nhs.uk/conditions/dental-abscess/"
      }
    ],
    "updated": "2026-09-23",
    "publishedAt": "2026-09-23T09:00:00+09:00"
  },
{
  "slug": "food-stuck-between-crown-and-tooth",
  "title": "크라운 옆에 매번 음식이 껴요. 치실만 쓰면서 지내도 될까요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "크라운",
  "concern": "식사할 때마다 같은 자리가 불편해요",
  "description": "홍성에서 크라운 옆 음식물 끼임과 잇몸 불편으로 고민할 때, 청소 방법만 바꾸면 되는지 보철과 치아 사이를 다시 확인해야 하는지 상담 준비를 돕습니다.",
  "situation": "홍성에 살고 있는데 크라운을 씌운 어금니 옆에 식사할 때마다 음식이 낍니다. 치실로 빼면 잠깐 괜찮지만 다음 끼니에 반복되고, 다시 만들자고 할까 봐 치과에 말을 꺼내기 어렵습니다.",
  "answer": "같은 자리에 음식이 반복해서 끼면 청소 습관만의 문제로 넘기지 말고 확인받는 것이 좋습니다. 치아 사이의 닿는 부분, 크라운의 형태와 가장자리, 잇몸 상태, 충치와 씹는 관계 등을 함께 평가합니다. 음식이 낀다는 사실만으로 크라운 전체 교체를 결정하거나, 반대로 치실만 쓰면 된다고 단정하지는 않습니다.",
  "checks": [
    "크라운을 씌운 직후부터인지, 한동안 괜찮다가 시작됐는지 구분합니다.",
    "음식을 뺀 뒤에도 아픈지, 출혈·시림·씹을 때 통증이 함께 있는지 알립니다.",
    "치실이 걸리거나 찢어지는 곳, 음식이 끼는 위치를 진료실에서 함께 확인합니다."
  ],
  "choices": [
    {
      "condition": "치아 사이 관리와 잇몸 상태를 먼저 살필 필요가 있다면",
      "option": "해당 부위에 맞는 청소 방법과 필요한 잇몸 관리를 안내받습니다.",
      "limit": "청소 방법을 바꾸었다는 이유로 반복되는 원인 평가를 생략하지 않습니다."
    },
    {
      "condition": "음식물 끼임에 관여하는 수복물 문제가 확인된다면",
      "option": "문제가 있는 부위와 개선할 방법, 보철 교체 필요성을 구체적으로 상의합니다.",
      "limit": "크라운을 다시 만들기만 하면 모든 끼임이 사라진다고 보장할 수는 없습니다."
    }
  ],
  "unknown": "음식물 끼임의 정확한 원인, 기존 보철을 유지할 수 있는지, 교체 범위와 비용·보증 적용은 검사와 기존 기록 없이는 알 수 없습니다. 치료 시점과 불편의 시작만으로 이전 진료의 잘못을 확정하지 않습니다.",
  "prepare": [
    "크라운 치료 시기와 처음 불편해진 때",
    "음식 종류별 불편, 출혈·통증과 치실 사용 시 느낌",
    "보유한 진료내역·영상과 평소 쓰는 치간 청소 도구의 이름 또는 사진"
  ],
  "localHeading": "홍성에서 크라운 주변 불편을 상담하러 온다면",
  "localAdvice": "홍성에서 천안 불당동으로 이동하기 전 ‘크라운 옆에 매번 음식이 끼고 빼도 반복된다’고 알려주세요. 첫날 원인을 확인하는 상담과 보철 제작·교체 일정은 다를 수 있습니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 방문 횟수와 비용은 검사 후 설명받고 결정하세요.",
  "related": [
    {
      "title": "크라운 치료 뒤 후회와 불편을 정리하는 가이드",
      "href": "/guide/regret/crown"
    },
    {
      "title": "치실과 치간칫솔 선택 가이드",
      "href": "/guide/compare/floss-vs-interdental-brush"
    },
    {
      "title": "홍성에서 첫 상담 준비하기",
      "href": "/area/hongseong#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "캐나다치과의사협회 JCDA · 음식물 끼임의 원인·검사·치료 원칙(2014)",
      "href": "https://jcda.ca/article/e5"
    },
    {
      "title": "미국치과의사협회 ADA · 치아 사이 청소와 치실 사용",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/flossing"
    },
    {
      "title": "NHS · 치간 청소 도구와 잇몸 손상을 피하는 관리",
      "href": "https://www.nhs.uk/live-well/healthy-teeth-and-gums/how-to-keep-your-teeth-clean/"
    },
    {
      "title": "NHS · 잇몸 출혈·부기와 진료가 필요한 증상",
      "href": "https://www.nhs.uk/conditions/gum-disease/"
    }
  ],
  "updated": "2026-09-23",
  "publishedAt": "2026-09-23T10:11:47+09:00"
},
{
  "slug": "jaw-clicking-without-pain",
  "title": "아프지는 않은데 턱에서 딱 소리가 나요. 장치를 꼭 해야 하나요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "턱관절",
  "concern": "지켜보다가 치료 시기를 놓칠까 걱정돼요",
  "description": "예산에서 통증 없는 턱관절 소리로 걱정할 때, 소리만 있는 상태와 통증·입 벌림 제한을 구분하고 장치·영상검사 제안에서 확인할 질문을 정리합니다.",
  "situation": "예산에 살고 있고 입을 벌리면 한쪽 턱에서 딱 소리가 납니다. 먹거나 말할 때 아프지는 않지만 검색에서 턱이 잠길 수 있다는 글을 보고, 비싼 장치를 지금 해야 하는지 고민됩니다.",
  "answer": "통증 없이 턱에서 소리만 나는 경우는 흔하며, 미국 국립치과두개안면연구소는 이런 소리 자체에 치료가 필요하지 않다고 안내합니다. 다만 통증이나 입 벌림 제한·잠김·씹는 불편이 동반되면 평가가 달라집니다. 소리의 크기만으로 장치나 수술 필요성을 결정하지 말고, 현재 기능과 제안된 치료의 목적부터 확인하세요.",
  "checks": [
    "소리 외에 통증, 턱이 걸리는 느낌, 식사·말하기의 제한이 있는지 구분합니다.",
    "시작 시점과 다친 적, 변화가 있는 시간대, 이전 치료·장치 사용을 알립니다.",
    "검사나 장치를 제안받으면 무엇을 확인하고 어떤 불편을 개선하려는 것인지 묻습니다."
  ],
  "choices": [
    {
      "condition": "통증이나 기능 제한 없이 소리만 확인된다면",
      "option": "소리 자체를 없애는 치료보다 설명과 필요에 따른 경과 확인을 상의합니다.",
      "limit": "개인의 향후 경과를 소리만으로 예측할 수는 없습니다."
    },
    {
      "condition": "통증·입 벌림 제한이나 잠김이 동반된다면",
      "option": "원인을 평가하고 상태에 맞는 보존적인 관리·치료부터 논의합니다.",
      "limit": "장치 하나로 모든 턱관절 증상을 해결한다고 보장하지 않습니다."
    }
  ],
  "unknown": "녹음한 소리나 거울 속 움직임만으로 관절 내부 상태, 검사 필요성, 치료 기간을 알 수 없습니다. 이 글은 특정 장치를 권하거나 처방하는 자료가 아닙니다.",
  "prepare": [
    "소리가 시작된 때와 통증·잠김이 있었던 상황",
    "먹기·하품·말하기에서 실제로 어려운 점",
    "기존 영상·장치가 있다면 해당 자료와 사용 경험"
  ],
  "localHeading": "예산에서 턱관절 소리 상담을 준비한다면",
  "localAdvice": "예산에서 천안 불당동으로 방문하기 전 소리만 있는지, 통증이나 입 벌림 문제가 있는지 함께 알려주세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 장치 제작을 먼저 정하기보다 첫 상담에서 평가할 항목과 필요한 방문 일정을 확인하세요. 먹고 마시기 어렵거나 턱이 잠긴 상태라면 먼 곳의 예약만 기다리지 말고 가까운 의료기관에 신속히 문의하세요.",
  "related": [
    {
      "title": "턱관절 진료 안내",
      "href": "/treatments/tmj"
    },
    {
      "title": "이갈이 장치를 고민할 때의 확인 가이드",
      "href": "/guide/regret/bruxism"
    },
    {
      "title": "예산에서 첫 상담 준비하기",
      "href": "/area/yesan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국 NIDCR · 통증 없는 턱관절 소리와 검사·치료 원칙",
      "href": "https://www.nidcr.nih.gov/health-info/tmd"
    },
    {
      "title": "NHS UCLH · 턱관절 증상과 단계적인 관리(2026년 갱신)",
      "href": "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/temporomandibular-disorder"
    },
    {
      "title": "NHS · 턱관절 증상과 신속한 평가가 필요한 변화",
      "href": "https://www.nhs.uk/conditions/temporomandibular-disorder-tmd/"
    },
    {
      "title": "미국 NIDCR · 턱관절 치료 선택과 주의할 치료",
      "href": "https://www.nidcr.nih.gov/health-info/tmd/summary-treatment-temporomandibular-disorders-tmds-text-alternative"
    }
  ],
  "updated": "2026-09-23",
  "publishedAt": "2026-09-23T10:11:47+09:00"
},
{
  "slug": "tooth-extraction-while-taking-blood-thinners",
  "title": "피 묽게 하는 약을 먹는데 이를 빼야 한대요. 약부터 끊어야 하나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "발치",
  "concern": "먹는 약 때문에 치료가 걱정돼요",
  "description": "당진에서 항응고제·항혈소판제를 복용하며 발치 상담을 준비할 때, 임의 중단 대신 확인할 약 정보와 출혈 관리·방문 계획을 정리합니다.",
  "situation": "당진에서 치아를 빼야 한다는 설명을 들었습니다. 심장이나 혈관 문제로 약을 먹고 있어 피가 멎지 않을까 걱정되고, 약을 쉬었다 가야 하는지도 모르겠습니다.",
  "answer": "발치를 앞두었다고 항응고제나 항혈소판제를 먼저 끊지 마세요. 약의 종류·복용 이유·다른 질환과 발치 범위를 확인해 계획합니다. 약을 유지하며 국소 지혈로 치료하는 경우도 많지만, 개인별 복용 지시는 진료진이 확인해 알려드려야 합니다.",
  "checks": [
    "처방전에서 정확한 약 이름·용량·복용 시간과 처방 목적을 확인합니다.",
    "이전에 피가 오래 났던 경험, 함께 먹는 약·건강기능식품과 주요 질환을 전달합니다.",
    "발치 범위와 지혈 방법, 필요한 의과 협의나 검사, 귀가 후 연락 방법을 확인합니다."
  ],
  "choices": [
    {
      "condition": "현재 약을 유지하며 치료할 수 있다고 평가되면",
      "option": "국소 지혈과 경과 확인 계획에 따라 발치를 진행합니다.",
      "limit": "약을 먹어도 괜찮다는 말이 출혈 위험이 전혀 없다는 뜻은 아닙니다."
    },
    {
      "condition": "추가 정보나 처방 의료진과의 조율이 필요하면",
      "option": "진료진이 확인할 내용을 정리하고 발치 일정과 복용 지침을 조율합니다.",
      "limit": "환자분이 인터넷의 중단 일수나 타인의 처방을 그대로 적용하지 않습니다."
    }
  ],
  "unknown": "이 글은 어떤 약을 며칠 쉬거나 언제 다시 먹을지 정하는 처방이 아닙니다. 이미 복용을 거르셨다면 숨기지 말고 약 이름과 마지막 복용 시각을 알려 즉시 개별 지침을 받으세요.",
  "prepare": [
    "현재 처방전 또는 약 이름·용량이 보이는 약 봉투",
    "복용 이유와 처방 병원, 최근 검사 결과가 있다면 해당 기록",
    "이전 발치·수술 후 출혈 경험과 이동 가능한 일정"
  ],
  "localHeading": "당진에서 발치 상담을 오기 전 약 정보를 먼저 알려주세요",
  "localAdvice": "당진에서 천안 불당동으로 방문하실 때는 “피 묽게 하는 약을 복용 중이며 발치 상담이 필요하다”고 예약 단계에서 전하세요. 필요한 자료를 먼저 확인하고, 상담과 발치가 같은 날 가능한지는 따로 문의하세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 출혈이 심하고 멎지 않거나 어지럼·의식 변화가 있으면 먼 예약을 기다리지 말고 가까운 응급의료기관의 도움을 받으세요.",
  "related": [
    {
      "title": "사랑니 발치와 준비 과정",
      "href": "/guide/wisdom-tooth"
    },
    {
      "title": "발치 후 불편과 확인할 사항",
      "href": "/guide/regret/wisdom-tooth"
    },
    {
      "title": "당진에서 첫 상담 준비하기",
      "href": "/area/dangjin#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국치과의사협회 ADA · 항응고·항혈소판 약과 치과 치료",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/oral-anticoagulant-and-antiplatelet-medications-and-dental-procedures"
    },
    {
      "title": "NHS Scotland SDCEP · 약을 복용하는 환자분의 치과 치료 안내",
      "href": "https://www.sdcep.org.uk/media/202dy54j/sdcep-anticoagulant-or-antiplatelet-medication-and-your-dental-treatment.pdf"
    },
    {
      "title": "SDCEP · 항응고·항혈소판제 복용 환자의 진료 지침과 개별 안내 자료",
      "href": "https://www.sdcep.org.uk/published-guidance/anticoagulants-and-antiplatelets/"
    }
  ],
  "updated": "2026-09-24",
  "publishedAt": "2026-09-24T09:00:00+09:00"
},
{
  "slug": "wisdom-tooth-swelling-keeps-returning",
  "title": "사랑니 잇몸이 부었다 가라앉기를 반복해요. 안 아픈 날에는 안 빼도 되나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "사랑니",
  "concern": "괜찮아졌다가 다시 불편해져요",
  "description": "서산에서 반복되는 사랑니 잇몸 붓기로 발치를 고민할 때, 증상이 없는 날의 상담과 재발 기록·발치와 경과 관찰의 판단 근거를 정리합니다.",
  "situation": "서산에서 지내며 몇 달 사이 사랑니 주변이 여러 번 부었습니다. 예약하려고 하면 가라앉아 다시 미루게 되고, 지금 안 아픈데 발치까지 해야 하는지 망설여집니다.",
  "answer": "오늘 통증이 없더라도 같은 부위의 붓기가 반복됐다면 그 이력을 함께 평가해야 합니다. 사랑니 주위 잇몸 염증인지, 다른 치아의 문제인지 확인하고 재발 양상·주변 치아 상태·발치 위험을 비교해 결정합니다. 모든 사랑니를 예방적으로 빼거나 붓기 횟수만으로 발치를 확정하지 않습니다.",
  "checks": [
    "붓기가 생긴 날짜와 지속 기간, 식사·입 벌리기에 미친 영향을 정리합니다.",
    "음식 끼임, 좋지 않은 맛, 열감·발열과 이전 처방 또는 처치 경험을 전달합니다.",
    "사랑니 위치와 주변 치아·잇몸, 필요한 영상과 발치 위험을 함께 확인합니다."
  ],
  "choices": [
    {
      "condition": "반복되는 사랑니 주위 염증 등 치료가 필요한 문제가 확인되면",
      "option": "현재 염증에 대한 처치와 발치 필요성·시기를 함께 검토합니다.",
      "limit": "그날 바로 뺄 수 있는지, 어느 진료기관이 적합한지는 검사 후 판단합니다."
    },
    {
      "condition": "현재 질환이 없고 관리·관찰이 적합하다면",
      "option": "점검 시점과 다시 연락할 증상, 관리 방법을 정합니다.",
      "limit": "오늘 안 아프다는 사실만으로 앞으로도 문제가 없다고 보장하지 않습니다."
    }
  ],
  "unknown": "사진만으로 치아와 신경의 거리, 발치 난이도나 회복 기간을 확정할 수 없습니다. 남은 항생제를 임의로 다시 복용하거나 잇몸 아래를 날카로운 도구로 찌르지 마세요.",
  "prepare": [
    "최근 붓기·통증이 반복된 시점과 이전 처방 내역",
    "기존 사랑니 영상과 과거 상담 내용이 있다면 준비",
    "식사·입 벌림의 어려움과 발치 후 쉬기 어려운 일정"
  ],
  "localHeading": "서산에서 사랑니 상담을 준비할 때는 괜찮아진 날도 이력을 알려주세요",
  "localAdvice": "서산에서 천안 불당동으로 방문하기 전 “현재는 덜 아프지만 같은 부위가 반복해서 부었다”고 설명하세요. 첫 상담과 실제 발치 일정을 나누어 확인하고, 귀가 뒤 연락할 곳과 경과 확인 방법을 문의하세요. 서울비디치과는 천안 불당동에서 진료합니다. 붓기가 빠르게 퍼지거나 열·심한 입 벌림 제한이 생기면 신속히 진료받고, 숨쉬기·삼키기가 어렵다면 가까운 응급실 또는 119 도움을 받으세요.",
  "related": [
    {
      "title": "사랑니 발치와 지켜보기 비교",
      "href": "/guide/compare/wisdom-extraction-vs-wait"
    },
    {
      "title": "사랑니 치료 가이드",
      "href": "/guide/wisdom-tooth"
    },
    {
      "title": "서산에서 첫 상담 준비하기",
      "href": "/area/seosan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "NICE · 사랑니 발치 적응증과 반복 치관주위염 권고",
      "href": "https://www.nice.org.uk/guidance/ta1/chapter/1-Recommendations"
    },
    {
      "title": "NHS · 사랑니 문제의 평가와 발치",
      "href": "https://www.nhs.uk/tests-and-treatments/wisdom-tooth-removal/"
    },
    {
      "title": "NHS Gloucestershire · 사랑니 발치 전 확인과 위험 설명",
      "href": "https://www.gloshospitals.nhs.uk/your-visit/patient-information-leaflets/advice-patients-having-wisdom-teeth-removed/"
    },
    {
      "title": "NHS · 치성 감염과 긴급 평가가 필요한 증상",
      "href": "https://www.nhs.uk/conditions/dental-abscess/"
    }
  ],
  "updated": "2026-09-24",
  "publishedAt": "2026-09-24T09:00:00+09:00"
},
{
  "slug": "implant-gums-bleed-without-pain",
  "title": "임플란트 옆 잇몸에서 피가 나는데 아프지는 않아요. 양치를 멈춰야 하나요?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "임플란트",
  "concern": "아프지 않아도 확인해야 하나요",
  "description": "천안에서 임플란트 주변 잇몸 출혈을 발견했을 때, 관리에 대한 자책보다 먼저 확인할 잇몸·뼈 상태와 세정 방법, 다음 점검의 질문을 정리합니다.",
  "situation": "천안에서 생활하며 오래 사용한 임플란트 옆을 닦다가 피를 봤습니다. 통증은 없어 칫솔이 센 것인지 염증인지 모르겠고, 더 건드리면 임플란트가 잘못될까 걱정됩니다.",
  "answer": "통증이 없더라도 반복되는 임플란트 주변 출혈은 상태를 확인할 이유가 됩니다. 잇몸에 국한된 염증인지 뼈 지지에도 변화가 있는지 진찰과 필요한 영상으로 구분합니다. 출혈 하나만으로 임플란트 실패나 제거를 결정하지 않으며, 청소를 전부 중단하거나 세게 문지르기보다 본인에게 맞는 방법을 안내받으세요.",
  "checks": [
    "어느 임플란트에서 언제부터 피가 났고 어떤 도구를 사용할 때 보이는지 전달합니다.",
    "붓기·좋지 않은 맛·고름·흔들림이 함께 있는지 확인하되 일부러 눌러 재현하지 않습니다.",
    "주변 잇몸 검사와 필요한 영상, 이전 기록을 비교해 치료 범위를 설명받습니다."
  ],
  "choices": [
    {
      "condition": "염증이 임플란트 주변 연조직에 국한된 경우",
      "option": "전문적인 세정과 일상 관리 방법을 조정하고 반응을 확인합니다.",
      "limit": "몇 번 닦으면 낫는지나 모든 분께 같은 점검 간격을 약속할 수는 없습니다."
    },
    {
      "condition": "뼈 지지의 변화까지 확인된 경우",
      "option": "임플란트 주위염의 범위와 접근 가능한 치료를 검토합니다.",
      "limit": "수술 또는 제거 필요성은 출혈 여부만으로 결정하지 않습니다."
    }
  ],
  "unknown": "출혈 사진이나 통증 유무만으로 뼈 상태를 알 수 없습니다. 임플란트를 직접 흔들거나 날카로운 도구로 주변을 긁지 말고, 가글만으로 문제가 해결됐다고 판단하지 마세요.",
  "prepare": [
    "임플란트 치료 시점과 마지막 점검 시점",
    "현재 사용하는 칫솔·치간도구의 종류와 사용 중 어려운 점",
    "보유 중인 제품 정보·이전 영상과 최근 수리 이력"
  ],
  "localHeading": "천안에서 임플란트 잇몸 출혈 상담을 준비한다면",
  "localAdvice": "천안 불당동으로 예약할 때 “통증은 없지만 임플란트 옆에서 피가 반복된다”고 알려주세요. 임플란트를 심은 곳이 달라도 보유 자료와 현재 불편부터 전달할 수 있습니다. 출혈이 멎지 않거나 붓기·고름·흔들림이 생기면 더 빠른 평가가 필요한지 문의하세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다.",
  "related": [
    {
      "title": "임플란트 치료와 유지관리 가이드",
      "href": "/guide/implant"
    },
    {
      "title": "임플란트 치료 후 걱정되는 문제",
      "href": "/guide/regret/implant"
    },
    {
      "title": "천안 방문 전 상담 준비",
      "href": "/area/cheonan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "EFP · 임플란트 주위질환과 출혈 등의 신호",
      "href": "https://www.efp.org/for-patients/dental-implants/peri-implant-diseases/"
    },
    {
      "title": "EFP · 임플란트 주위질환의 치료와 관리",
      "href": "https://www.efp.org/for-patients/dental-implants/peri-implant-disease-treatment/"
    },
    {
      "title": "EFP · 임플란트 주위질환 예방·치료 임상진료지침",
      "href": "https://www.efp.org/education/continuing-education/clinical-guidelines/guideline-on-treatment-of-peri-implant-diseases/"
    },
    {
      "title": "FDA · 임플란트의 관리와 문제 발생 시 상담",
      "href": "https://www.fda.gov/medical-devices/dental-devices/dental-implants-what-you-should-know"
    }
  ],
  "updated": "2026-09-24",
  "publishedAt": "2026-09-24T09:00:00+09:00"
},
{
  "slug": "dry-mouth-after-medication-new-cavities",
  "title": "약을 먹은 뒤 입이 마르고 충치가 자꾸 생겨요. 약을 끊어야 할까요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "입마름",
  "concern": "관리하는데도 문제가 반복돼요",
  "description": "아산에서 약 복용 뒤 시작된 입마름과 반복 충치로 고민할 때, 임의 중단 대신 원인 평가·처방기관 상담·불편 완화와 충치 예방을 함께 준비하는 방법입니다.",
  "situation": "아산에서 생활하며 평소처럼 양치하는데 입이 끈적하고 밤에 물을 찾게 됩니다. 최근 충치도 더 발견돼 새로 먹는 약 때문인지, 치아를 지키려면 약부터 끊어야 하는지 걱정됩니다.",
  "answer": "일부 약은 입마름에 영향을 줄 수 있고 침의 보호 기능이 줄면 충치 위험이 커질 수 있습니다. 다만 복용 뒤 시작됐다는 이유만으로 원인을 확정하거나 처방약을 끊지 마세요. 약 목록과 시작 시점, 입안 상태를 확인하고 처방 의료진과 조정 가능성을 상의하면서 불편 완화와 충치 예방을 함께 계획합니다.",
  "checks": [
    "복용 중인 처방약·일반약과 시작 또는 변경 시점을 정리합니다.",
    "낮과 밤의 차이, 말하기·식사·수면의 불편, 눈마름 등 동반 변화를 전달합니다.",
    "현재 충치와 잇몸·점막 상태, 필요한 추가 평가와 예방 계획을 확인합니다."
  ],
  "choices": [
    {
      "condition": "약과의 관련성을 검토할 필요가 있다면",
      "option": "처방 의료진과 약의 조정 가능성을 상의합니다.",
      "limit": "치과 방문 전 스스로 복용을 중단하거나 용량·시간을 바꾸지 않습니다."
    },
    {
      "condition": "입마름과 충치 위험 관리가 필요하다면",
      "option": "불편 완화 방법과 불소 사용·개별 점검 계획을 함께 정합니다.",
      "limit": "입안이 촉촉해지는 느낌이 충치 예방이나 원인 해결을 보장하지는 않습니다."
    }
  ],
  "unknown": "입마름의 원인은 약 외에도 다양합니다. 느끼는 건조감과 실제 침 분비량이 항상 일치하지 않으며, 온라인 질문만으로 특정 질환이나 약의 부작용을 확정할 수 없습니다.",
  "prepare": [
    "복용약 이름과 최근 변경 날짜를 확인할 자료",
    "불편한 시간대와 식사·수면에 미치는 영향 메모",
    "현재 사용하는 치약·가글·입마름 제품과 최근 충치 치료 이력"
  ],
  "localHeading": "아산에서 입마름과 반복 충치 상담을 준비한다면",
  "localAdvice": "아산에서 천안 불당동으로 방문하기 전 입마름과 충치가 함께 걱정된다고 알려주세요. 약 목록은 진료진이 확인할 수 있게 준비하되 공개 게시판에 올릴 필요는 없습니다. 처방기관과 치과에 각각 확인할 내용을 정리하면 반복 방문 부담을 계획하는 데 도움이 됩니다. 서울비디치과는 천안 불당동에서 진료합니다.",
  "related": [
    {
      "title": "충치 치료 후 반복되는 걱정 살펴보기",
      "href": "/guide/regret/cavity"
    },
    {
      "title": "아산에서 상담 전 준비할 자료",
      "href": "/area/asan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국 국립치과두개안면연구소 NIDCR · 구강건조의 원인과 관리",
      "href": "https://www.nidcr.nih.gov/health-info/dry-mouth"
    },
    {
      "title": "미국치과의사협회 ADA · 입마름 평가와 합병증 예방",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/xerostomia"
    },
    {
      "title": "NHS · 입마름의 생활 관리와 처방약 상담",
      "href": "https://www.nhs.uk/symptoms/dry-mouth/"
    },
    {
      "title": "NIDCR · 충치의 과정과 불소를 포함한 예방",
      "href": "https://www.nidcr.nih.gov/health-info/tooth-decay"
    }
  ],
  "updated": "2026-09-24",
  "publishedAt": "2026-09-24T09:00:00+09:00"
},
{
  "slug": "gum-pimple-keeps-coming-back-without-pain",
  "title": "잇몸에 뾰루지가 생겼다 없어져요. 아프지 않으면 그냥 둬도 되나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "잇몸 염증",
  "concern": "아프지 않은데 자꾸 반복돼요",
  "description": "홍성에서 통증 없이 반복되는 잇몸 뾰루지로 상담을 고민할 때, 사라진 날에도 확인할 이유와 치아·잇몸 원인에 따라 달라지는 치료 질문을 정리합니다.",
  "situation": "홍성에서 생활하며 양치할 때마다 같은 치아 위 잇몸을 살펴보게 됩니다. 작은 뾰루지가 생겼다가 가라앉기를 반복하는데 아프지는 않아, 예약을 해야 할지 망설여집니다.",
  "answer": "같은 자리의 잇몸 뾰루지가 반복되면 통증이 없어도 치과에 연락해 빠른 확인을 받으세요. 치아 뿌리나 잇몸의 감염 등 여러 원인이 가능하며, 겉으로 가라앉았다는 이유만으로 원인이 해결됐다고 볼 수는 없습니다. 모양만 보고 신경치료나 발치를 확정하지 않습니다.",
  "checks": [
    "처음 발견한 때와 반복 횟수, 같은 자리인지 다른 자리인지 전달합니다.",
    "해당 치아의 충치·크라운·신경치료·외상 이력과 잇몸 상태를 함께 확인합니다.",
    "진찰과 필요한 영상으로 원인을 평가하고 치료 후 다시 확인할 항목을 설명받습니다."
  ],
  "choices": [
    {
      "condition": "치아 내부나 뿌리 주변의 감염으로 확인되면",
      "option": "치아를 보존할 수 있는지 평가해 신경치료 또는 기존 치료의 재평가 등을 상의합니다.",
      "limit": "뾰루지가 있다는 사실 하나로 재신경치료·수술·발치 중 하나를 정하지 않습니다."
    },
    {
      "condition": "잇몸에서 시작한 문제나 다른 병변이 의심되면",
      "option": "잇몸 검사와 원인에 맞는 처치, 필요한 추가 검사나 의뢰를 계획합니다.",
      "limit": "겉으로 보이는 부위만 없애는 것이 원인 치료와 같은 것은 아닙니다."
    }
  ],
  "unknown": "온라인 사진이나 통증 유무만으로 농양인지, 어느 치아에서 시작됐는지, 치아를 살릴 수 있는지 판단할 수 없습니다. 직접 짜거나 바늘로 찌르지 말고, 남은 항생제를 임의로 복용하지 마세요.",
  "prepare": [
    "뾰루지가 보였던 날의 사진이 있다면 날짜와 함께 준비",
    "해당 부위의 과거 치료 시점·치과와 보유 중인 영상 자료",
    "붓기·좋지 않은 맛·열 등 함께 있었던 변화의 메모"
  ],
  "localHeading": "홍성에서 잇몸 뾰루지 상담을 준비하신다면",
  "localAdvice": "홍성에서 천안 불당동으로 방문을 계획할 때는 “아프지 않지만 같은 잇몸에 뾰루지가 반복된다”고 먼저 알려 진료 시점을 문의하세요. 사진이 없어도 상담할 수 있으며, 검사와 치료가 같은 날 끝나는지는 개별 확인이 필요합니다. 서울비디치과의 진료 장소는 천안 불당동입니다. 얼굴 붓기가 커지거나 열이 나면 빠르게 진료받고, 숨쉬기·삼키기가 어렵거나 입안이 심하게 붓는다면 먼 예약을 기다리지 말고 119 또는 가까운 응급의료기관의 도움을 받으세요.",
  "related": [
    {
      "title": "신경치료에서 확인하는 치아 내부의 문제",
      "href": "/guide/root-canal"
    },
    {
      "title": "잇몸 치료 뒤 남는 걱정과 점검",
      "href": "/guide/regret/gum"
    },
    {
      "title": "홍성에서 방문 전 준비할 사항",
      "href": "/area/hongseong#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국근관치료학회 AAE · 통증이 없을 수도 있는 치아 농양",
      "href": "https://www.aae.org/patients/dental-symptoms/abscessed-teeth/"
    },
    {
      "title": "미국치과의사협회 ADA · 치아·잇몸 농양의 원인과 치료",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/abscess"
    },
    {
      "title": "NHS · 치아 농양과 긴급하게 도움을 받을 증상",
      "href": "https://www.nhs.uk/conditions/dental-abscess/"
    }
  ],
  "updated": "2026-09-25",
  "publishedAt": "2026-09-25T09:00:00+09:00"
},
{
  "slug": "cold-sensitivity-after-new-crown",
  "title": "크라운을 씌운 뒤 찬물에 시려요. 결국 신경치료를 해야 하나요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "크라운",
  "concern": "치료가 끝났는데 새로운 불편이 생겼어요",
  "description": "예산에서 신경치료 없이 크라운을 씌운 뒤 찬물에 시릴 때, 경과 확인과 추가 치료를 구분하고 기존 치료 기록·비용·재방문을 상담하는 질문을 정리합니다.",
  "situation": "예산에서 생활하며 충치 치료 후 신경치료 없이 어금니에 크라운을 씌웠습니다. 이제 끝났다고 생각했는데 찬물을 마실 때 시려서, 새 크라운을 버리고 다시 치료해야 할까 걱정됩니다.",
  "answer": "신경치료를 하지 않은 치아는 크라운을 씌운 뒤 온도에 민감할 수 있습니다. 다만 시림이 오래 남거나 심해지거나 가만히 있어도 아프면 빨리 재평가해야 합니다. 짧게 시리다는 이유만으로 안전하다고 단정하거나, 시린 증상 하나로 신경치료를 확정하지 않습니다.",
  "checks": [
    "크라운을 씌운 날짜와 그 전부터 있던 증상, 이전 신경치료 여부를 확인합니다.",
    "찬 자극이 사라진 뒤 불편이 얼마나 남는지, 자발통·야간통·씹는 통증이 있는지 말합니다.",
    "치아 내부 상태뿐 아니라 물리는 느낌과 주변 치아·잇몸을 살펴 필요한 검사를 정합니다."
  ],
  "choices": [
    {
      "condition": "진찰 후 경과 관찰이 적절하다고 판단되면",
      "option": "민감함을 줄일 관리와 재확인 날짜, 먼저 연락할 증상을 안내받습니다.",
      "limit": "관찰은 무조건 참으라는 뜻이 아니며, 악화하면 예정일 전에 다시 확인합니다."
    },
    {
      "condition": "물림 등 조정할 문제가 확인되면",
      "option": "확인된 원인에 맞게 조정 또는 보철 상태 점검을 진행합니다.",
      "limit": "조정 한 번으로 모든 시림이 없어질 것이라고 약속할 수는 없습니다."
    },
    {
      "condition": "치아 내부의 치료가 필요한 상태로 확인되면",
      "option": "신경치료 필요성과 기존 크라운을 어떻게 처리할지 함께 상의합니다.",
      "limit": "새 크라운의 유지·교체 여부와 비용은 실제 상태와 치료 계획에 따라 달라집니다."
    }
  ],
  "unknown": "이 글은 신경치료 없이 씌운 치아의 새 시림을 다룹니다. 이미 신경치료한 치아나 임플란트의 불편에는 같은 설명을 그대로 적용하지 마세요. 반복해서 찬물이나 얼음을 대며 스스로 검사하지 않습니다.",
  "prepare": [
    "크라운을 씌운 시점, 임시 치아 때부터 시렸는지에 대한 메모",
    "기존 치료 설명과 보유한 영상·치료계획서",
    "자극·지속 시간·수면과 식사 영향, 이전보다 좋아졌는지의 간단한 기록"
  ],
  "localHeading": "예산에서 크라운 시림을 상담하러 오기 전",
  "localAdvice": "예산에서 천안 불당동으로 방문하실 때는 새 크라운을 씌운 날짜와 신경치료 여부를 먼저 알려주세요. 기존 치과의 경과 확인을 받거나 자료를 준비해 다른 의견을 상담할 수 있습니다. 검사와 조정·신경치료가 같은 날 가능한지는 따로 확인하세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 붓기나 심해지는 통증이 있으면 먼 예약일까지 참지 말고 가까운 치과에 먼저 연락하세요.",
  "related": [
    {
      "title": "크라운 뒤 불편과 치료 전후 확인할 사항",
      "href": "/guide/regret/crown"
    },
    {
      "title": "신경치료가 필요한지 확인하는 과정",
      "href": "/guide/root-canal"
    },
    {
      "title": "예산에서 방문 전 준비할 사항",
      "href": "/area/yesan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국 국립의학도서관 MedlinePlus · 크라운 후 민감함과 재진 신호",
      "href": "https://medlineplus.gov/ency/article/007631.htm"
    },
    {
      "title": "미국근관치료학회 AAE · 온도 자극·치료 후 치통의 평가",
      "href": "https://www.aae.org/patients/dental-symptoms/tooth-pain/"
    }
  ],
  "updated": "2026-09-25",
  "publishedAt": "2026-09-25T09:00:00+09:00"
},
{
  "slug": "child-permanent-tooth-behind-baby-tooth",
  "title": "아이 아랫니 뒤로 새 이가 나왔는데 유치는 단단해요. 당장 뽑아야 하나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "어린이 치아 교환",
  "concern": "아이 치료 시기를 놓칠까 걱정돼요",
  "description": "당진에서 아이의 아래 앞니 뒤로 영구치가 올라왔을 때, 유치를 바로 뽑아야 하는지의 불안과 관찰·발치·교정 상담을 나누어 준비하는 방법을 설명합니다.",
  "situation": "당진에서 아이 양치를 도와주다가 아래 앞니 뒤에 새 이가 올라온 것을 발견했습니다. 앞쪽 유치는 거의 안 흔들리고 아이는 아프지 않다는데, 늦게 뽑으면 평생 덧니가 될까 걱정됩니다.",
  "answer": "아래 앞니 뒤로 영구치가 보인다는 이유만으로 유치를 당장 뽑거나 교정을 시작하는 것은 아닙니다. 유치의 흔들림과 상태, 새 이가 나오는 정도와 공간·물림을 함께 확인해 관찰 또는 처치를 결정합니다. 단단한 치아를 집에서 억지로 뽑지 말고 치과에 상황을 알려 확인 시점을 잡으세요.",
  "checks": [
    "아이 나이와 새 이를 처음 발견한 때, 앞쪽 치아가 흔들리는지 전달합니다.",
    "어느 치아가 유치·영구치인지 확인하고 공간과 나오는 방향, 물림을 살펴봅니다.",
    "앞니 외상이나 과거 신경치료 이력, 통증·붓기·씹기 불편 여부를 알려줍니다."
  ],
  "choices": [
    {
      "condition": "진찰 후 자연스러운 교환 경과를 볼 수 있다면",
      "option": "위생 관리와 재확인 시점을 정하고 유치·영구치의 변화를 관찰합니다.",
      "limit": "관찰한다는 말이 이후 치열까지 반드시 가지런해진다는 보장은 아닙니다."
    },
    {
      "condition": "남은 유치의 상태나 맹출 방해 등 처치 이유가 확인되면",
      "option": "발치 등 권고하는 처치의 목적·시점과 아이의 진료 준비를 설명받습니다.",
      "limit": "유치 하나를 빼는 것만으로 공간 부족이나 전체 치열 문제가 모두 해결되지는 않습니다."
    },
    {
      "condition": "공간이나 물림을 더 평가할 필요가 있으면",
      "option": "성장 단계에 맞춘 추가 진단이나 소아치과·교정 상담을 계획합니다.",
      "limit": "상담을 받는 것과 곧바로 장치를 시작하는 것은 별개의 결정입니다."
    }
  ],
  "unknown": "이 글은 주로 아래 앞니가 교환되는 상황을 다룹니다. 윗니·송곳니·어금니, 다친 치아나 통증이 있는 경우에는 같은 기준을 그대로 적용하지 마세요. 사진만으로 발치 시기나 미래의 교정 필요성을 확정할 수 없습니다.",
  "prepare": [
    "새 이를 처음 알아차린 시점과 아이 나이",
    "자연스럽게 찍어둔 치아 사진과 과거 검진·외상 기록이 있다면 해당 자료",
    "아이의 진료 경험·두려워하는 부분과 보호자가 가능한 재방문 일정"
  ],
  "localHeading": "당진에서 아이의 치아 교환 상담을 준비하신다면",
  "localAdvice": "당진에서 천안 불당동으로 오기 전 아이 나이와 “아랫니 뒤로 새 이가 나왔는데 유치는 단단하다”는 점을 전하세요. 첫 방문에서 평가할 범위와 소아 진료 가능 일정, 필요한 자료를 확인하면 준비에 도움이 됩니다. 당일 발치나 교정 시작을 약속하는 안내는 아닙니다. 서울비디치과의 진료 장소는 천안 불당동입니다. 아이에게 통증·붓기·열이 있거나 먹기 어려워지면 먼 일정까지 기다리지 말고 가까운 치과에 먼저 연락하세요.",
  "related": [
    {
      "title": "치아 배열과 물림을 살피는 교정 가이드",
      "href": "/guide/orthodontics"
    },
    {
      "title": "아이와 보호자가 상담에서 확인할 치과 선택 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "당진에서 첫 방문 준비하기",
      "href": "/area/dangjin#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국소아치과학회 AAPD · 발육 중 치열과 교합 관리 지침",
      "href": "https://www.aapd.org/research/oral-health-policies--recommendations/management-of-the-developing-dentition-and-occlusion-in-pediatric-dentistry/"
    },
    {
      "title": "Nationwide Children’s Hospital · 유치 뒤로 나오는 영구치 안내",
      "href": "https://www.nationwidechildrens.org/family-resources-education/700childrens/2024/11/shark-teeth"
    }
  ],
  "updated": "2026-09-25",
  "publishedAt": "2026-09-25T09:00:00+09:00"
},
{
  "slug": "mouth-ulcer-same-spot-over-three-weeks",
  "title": "입안이 같은 자리에서 3주째 헐어 있어요. 구내염 약만 계속 발라도 되나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "입안 상처",
  "concern": "늘 있던 구내염인 줄 알았는데 낫지 않아요",
  "description": "서산에서 같은 입안 상처가 3주 가까이 낫지 않아 걱정될 때, 반복되는 구내염과 지속되는 병변을 구분해 말하고 검사·의뢰·약 사용을 상담하는 질문을 정리합니다.",
  "situation": "서산에서 생활하며 혀 옆이나 볼 안쪽이 헐어 구내염 약을 발랐습니다. 덜 아픈 날은 있지만 같은 자리가 3주째 남아 있어, 더 센 약을 사야 할지 치과에 가야 할지 고민입니다.",
  "answer": "같은 입안 상처가 낫지 않고 3주 가까이 지속되거나 3주를 넘겼다면 약만 바꾸며 기다리지 말고 치과나 의료기관에서 확인받으세요. 오래 남는 상처가 모두 암이라는 뜻은 아닙니다. 반복 자극 등 가능한 원인과 병변 상태를 살피고 필요하면 전문 진료나 조직검사를 안내받습니다.",
  "checks": [
    "같은 상처가 계속 남았는지, 완전히 나은 뒤 새 상처가 생겼는지 구분해 전달합니다.",
    "처음 발견한 날짜와 위치·크기 변화, 출혈·덩이·삼킴 불편 등 동반 변화를 말합니다.",
    "사용한 구내염 약과 복용약, 치아·보철 접촉, 입 밖의 증상과 전신 건강을 확인합니다."
  ],
  "choices": [
    {
      "condition": "국소 자극 등 평가 가능한 원인이 확인되면",
      "option": "원인에 맞는 처치와 증상 관리를 하고 정해진 시점에 회복을 확인합니다.",
      "limit": "자극으로 보인다는 설명만으로 이후 낫지 않는 상처를 계속 방치하지 않습니다."
    },
    {
      "condition": "병변 성격이 불분명하거나 추가 확인이 필요하면",
      "option": "구강내과·구강악안면외과 등 적절한 전문 진료와 필요한 검사를 상의합니다.",
      "limit": "의뢰나 조직검사 권유는 진단을 확인하는 과정이며 암 확정과 같은 말이 아닙니다."
    }
  ],
  "unknown": "이 글로 구내염 종류나 암 여부를 판별할 수 없습니다. 오래 지속된 부위에 임의로 약을 계속 덧바르거나 자극을 가하지 말고 현재 제품의 적정 사용 여부를 의료진·약사에게 확인하세요. 처방약을 임의로 끊지도 마세요.",
  "prepare": [
    "최초 발견 시점과 가능하다면 날짜별 사진",
    "바르거나 가글한 약의 제품명·사용 기간 및 복용약 목록",
    "기존 진찰·처치 내용, 보유한 검사나 의뢰 자료"
  ],
  "localHeading": "서산에서 오래 낫지 않는 입안 상처를 상담하신다면",
  "localAdvice": "서산에서 진료를 알아보실 때는 “구내염 같다”는 표현에 더해 “같은 자리가 3주 가까이 낫지 않는다”고 전하세요. 천안 불당동 방문을 원하면 해당 증상의 평가 범위와 필요한 진료과를 먼저 문의하세요. 서울비디치과의 진료 장소는 천안 불당동이며 조직검사나 전문 진료의 당일 가능 여부를 약속하지 않습니다. 먼 예약을 기다리느라 평가를 미루지 말고 가까운 의료기관을 이용할 수 있습니다. 삼키기 어렵거나 빠르게 붓는 등 변화가 있으면 신속히 도움을 받고, 호흡이 어렵다면 119 등 응급 도움을 받으세요.",
  "related": [
    {
      "title": "내 증상에 맞는 진료와 상담을 고르는 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "틀니가 닿는 같은 자리가 아플 때",
      "href": "/concerns/denture-sore-same-spot"
    },
    {
      "title": "서산에서 상담 전에 준비할 사항",
      "href": "/area/seosan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "NHS · 입안 궤양이 오래 남을 때 진료받을 기준",
      "href": "https://www.nhs.uk/conditions/mouth-ulcers/"
    },
    {
      "title": "Cambridge University Hospitals NHS · 반복되는 구강 궤양과 지속 병변",
      "href": "https://www.cuh.nhs.uk/patient-information/recurrent-oral-ulceration/"
    },
    {
      "title": "NHS · 구강 증상 평가와 전문 진료 의뢰의 의미",
      "href": "https://www.nhs.uk/conditions/mouth-cancer/symptoms/"
    },
    {
      "title": "Guy’s and St Thomas’ NHS · 구강 조직검사의 목적",
      "href": "https://www.guysandstthomas.nhs.uk/oral-biopsy"
    }
  ],
  "updated": "2026-09-25",
  "publishedAt": "2026-09-25T09:00:00+09:00"
},
{
  "slug": "chipped-front-tooth-without-pain",
  "title": "앞니가 부러졌는데 아프지 않아요. 조각을 다시 붙일 수 있나요?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "앞니 파절",
  "concern": "다시 웃을 때 티가 날까 걱정돼요",
  "description": "천안에서 앞니 끝이 부러졌지만 통증은 없을 때, 조각 보관과 진료 시점, 접착·충전·크라운을 결정하기 전 확인할 내용과 외상 후 경과 관찰을 정리합니다.",
  "situation": "천안에서 생활하다 앞니를 부딪혔습니다. 거울을 보니 끝이 떨어져 나갔는데 아프지는 않습니다. 내일 사람을 만나야 해서 모양이 신경 쓰이고, 조각만 붙이면 끝날지 이를 크게 깎아야 할지 걱정됩니다.",
  "answer": "아프지 않아도 다친 앞니는 치과에 신속히 연락해 확인받으세요. 떨어진 치아 조각은 우유나 본인의 침을 담은 용기에 넣어 가져가면 재부착 가능성을 평가하는 데 도움이 됩니다. 조각을 다시 붙이거나 치아색 재료로 수복할 수 있는 경우가 있지만, 손상 범위에 따라 다른 치료가 필요합니다. 치아 전체가 빠진 경우는 더 긴급한 별도의 외상입니다.",
  "checks": [
    "언제 무엇에 부딪혔는지, 조각만 떨어졌는지 치아 위치도 달라졌는지 알립니다.",
    "손상된 치아와 주변 치아, 잇몸·입술을 함께 진찰하고 필요한 검사를 정합니다.",
    "오늘 할 처치와 이후 모양·기능을 완성할 과정, 다시 확인할 시점을 구분합니다."
  ],
  "choices": [
    {
      "condition": "남은 치아와 조각 상태가 재부착에 적합하다면",
      "option": "조각 재부착의 가능성과 한계, 이후 확인할 사항을 상의합니다.",
      "limit": "조각을 잘 보관했더라도 반드시 붙일 수 있거나 영구적으로 유지된다고 보장할 수는 없습니다."
    },
    {
      "condition": "조각이 없거나 손상 범위가 더 넓다면",
      "option": "치아색 충전, 크라운 또는 치수 상태에 따른 추가 치료를 평가합니다.",
      "limit": "통증 유무나 빠진 조각의 크기만으로 신경치료·발치 여부를 확정하지 않습니다."
    }
  ],
  "unknown": "겉으로 보이는 부러진 면만으로 치아 내부와 뿌리, 주변 치아의 상태를 알 수 없습니다. 조각을 접착제로 붙이거나 날카로운 치아를 직접 갈지 마세요. 큰 얼굴 외상·멎지 않는 출혈·호흡 곤란이 있으면 119 또는 가까운 응급의료기관의 도움이 우선입니다.",
  "prepare": [
    "치아 조각이 있다면 우유 또는 본인의 침을 담은 용기에 보관해 지참",
    "부딪힌 시각·물체·방향과 이후 달라진 느낌",
    "이전 앞니 치료 이력, 보유한 치료 전 사진과 영상"
  ],
  "localHeading": "천안에서 앞니 파절 상담을 준비하신다면",
  "localAdvice": "천안에서 앞니 파절로 연락할 때는 “아프지는 않지만 부딪힌 뒤 일부가 부러졌다”고 설명하고 진료 시점을 안내받으세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 조각 유무와 치아의 흔들림·위치 변화를 함께 알리면 좋습니다. 가까운 곳에서 먼저 외상을 평가받아야 하는 상황이라면 특정 병원의 예약을 기다리지 마세요. 당일 모양까지 완성할 수 있는지는 진찰 후 확인합니다.",
  "related": [
    {
      "title": "앞니 치료를 결정하기 전 남는 걱정",
      "href": "/guide/regret/front-teeth"
    },
    {
      "title": "치아색 재료와 라미네이트의 차이를 상담할 때",
      "href": "/guide/compare/laminate-vs-resin"
    },
    {
      "title": "천안에서 첫 방문 준비",
      "href": "/area/cheonan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "NHS · 부러진 치아 조각의 보관과 치료 선택",
      "href": "https://www.nhs.uk/conditions/chipped-broken-or-cracked-tooth/"
    },
    {
      "title": "미국근관치료학회 AAE · 치아 외상 평가와 추적 진료",
      "href": "https://www.aae.org/patients/dental-symptoms/traumatic-dental-injuries/"
    },
    {
      "title": "NHS · 얼굴 외상·출혈 등 응급 진료가 필요한 상황",
      "href": "https://www.nhs.uk/nhs-services/dentists/how-to-find-an-nhs-dentist-in-an-emergency/"
    }
  ],
  "updated": "2026-09-26",
  "publishedAt": "2026-09-26T09:17:17+09:00"
},
{
  "slug": "sensitive-teeth-after-whitening",
  "title": "미백 뒤 앞니가 찌릿해요. 더 하얘질 때까지 계속해도 될까요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "치아 미백",
  "concern": "시린 것을 참아야 효과가 나는 건가요",
  "description": "아산에서 치아 미백 후 시림으로 고민할 때, 사용을 더 늘리지 말아야 할 이유와 제품·증상 기록, 일정 조정 및 재개 전에 치과에 물을 질문을 정리합니다.",
  "situation": "아산에서 생활하며 중요한 촬영을 앞두고 치아 미백을 시작했습니다. 앞니가 찌릿하지만 아직 기대한 만큼 하얗지 않아, 중단하면 돈과 시간을 낭비하는 것 같고 계속하면 치아가 상할까 걱정됩니다.",
  "answer": "미백 후 시림이나 잇몸 자극이 생길 수 있지만, 아픈 것을 참아야 효과가 나는 것은 아닙니다. 불편이 생겼다면 추가 미백을 멈추고 담당 치과에 연락해 사용 제품과 증상, 재개 가능 시점을 확인하세요. 사용량·시간·횟수를 임의로 늘리거나 다른 미백 제품을 겹쳐 쓰지 않습니다. 한 치아의 지속 통증 등은 미백 탓이라고만 여기지 말고 평가받으세요.",
  "checks": [
    "제품 이름·성분 표시·사용 시간·횟수와 마지막 사용 시점을 전달합니다.",
    "여러 치아가 시린지 특정 치아만 아픈지, 자극이 없을 때도 불편한지 구분합니다.",
    "기존 충전·크라운과 치아·잇몸 상태를 확인하고 목표 색과 안전한 계획을 상의합니다."
  ],
  "choices": [
    {
      "condition": "미백 관련 일시적 시림이나 자극으로 평가되면",
      "option": "쉬는 기간과 관리, 방법 조정 또는 중단 여부를 담당 치과와 상의합니다.",
      "limit": "모든 분에게 같은 휴식 일수나 재개 횟수를 적용할 수는 없습니다."
    },
    {
      "condition": "특정 치아의 통증이나 다른 치아·잇몸 문제가 의심되면",
      "option": "원인을 확인하고 필요한 치료를 우선한 뒤 미백 계획을 다시 논의합니다.",
      "limit": "온라인 증상 설명만으로 충치·균열·치수 문제를 확정하거나 배제하지 않습니다."
    }
  ],
  "unknown": "치아가 시리다는 느낌만으로 영구 손상 여부나 미백 효과를 판단할 수 없습니다. 제품 농도와 적정 사용법도 개인별 확인이 필요합니다. 진통제나 마취 성분으로 감각을 가린 채 미백을 계속하지 말고 불편을 알리세요.",
  "prepare": [
    "제품·설명서·트레이가 있다면 준비",
    "사용한 날짜와 한 번 사용한 시간, 함께 쓴 제품 메모",
    "시림이 생기는 상황과 기존 치과 치료 이력"
  ],
  "localHeading": "아산에서 치아 미백 후 시림을 상담하신다면",
  "localAdvice": "아산에서 미백 후 불편으로 천안 불당동 방문을 계획한다면, 예약 전에 사용 제품과 마지막 사용 시각을 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 다른 곳에서 미백을 받았거나 집에서 제품을 사용한 경우도 그대로 설명하면 됩니다. 원인 확인과 미백 재개를 같은 날 할 수 있다고 가정하지 마세요. 심한 통증이나 붓기는 신속히 진료받고, 호흡·삼킴 곤란이 있으면 가까운 응급의료기관의 도움을 받으세요.",
  "related": [
    {
      "title": "치아 미백 방법과 상담 준비",
      "href": "/guide/whitening"
    },
    {
      "title": "미백 뒤 남는 걱정과 확인할 사항",
      "href": "/guide/regret/whitening"
    },
    {
      "title": "자가 미백과 치과 미백을 비교할 때",
      "href": "/guide/compare/self-vs-office-whitening"
    },
    {
      "title": "아산에서 방문 준비",
      "href": "/area/asan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국치과의사협회 ADA · 미백의 시림·잇몸 자극과 치료 고려사항",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/whitening"
    },
    {
      "title": "NHS · 미백 전 구강 확인과 부작용 상담",
      "href": "https://www.nhs.uk/tests-and-treatments/teeth-whitening/"
    },
    {
      "title": "미국치과의사협회 ADA MouthHealthy · 치아 미백의 범위와 사용 상담",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/teeth-whitening"
    }
  ],
  "updated": "2026-09-26",
  "publishedAt": "2026-09-26T09:17:17+09:00"
},
{
  "slug": "temporary-crown-fell-out-before-next-visit",
  "title": "임시 크라운이 빠졌는데 안 아파요. 다음 예약까지 그냥 둬도 되나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "임시 크라운",
  "concern": "완성까지 며칠 안 남았는데 또 가야 하나요",
  "description": "홍성에서 최종 보철을 기다리다 임시 크라운이 빠졌을 때, 통증이 없어도 치과에 연락할 이유와 부품 보관, 임시 처치와 최종 장착 일정을 나누어 물을 내용을 정리합니다.",
  "situation": "홍성에서 시간을 내어 치아를 다듬고 임시 크라운을 씌웠습니다. 최종 보철 예약은 며칠 뒤인데 식사 중 임시 것이 빠졌습니다. 아프지 않으니 그냥 기다리고 싶지만, 안쪽 치아가 그대로 드러난 것이 마음에 걸립니다.",
  "answer": "임시 크라운이 빠지면 아프지 않아도 치료한 치과에 연락해 진료 시점을 안내받으세요. 임시 크라운은 최종 보철을 기다리는 동안 치아를 보호하는 역할이 있습니다. 빠진 것은 보관해 가져가고, 생활용 접착제로 붙이거나 헐거운 상태로 끼운 채 지내지 마세요. 예정된 장착일까지 기다려도 되는지는 치아 상태와 남은 일정에 따라 확인해야 합니다.",
  "checks": [
    "임시 크라운을 씌운 날과 빠진 시각, 최종 보철 예약일을 알립니다.",
    "빠진 보철과 남은 치아를 확인하고 통증·붓기·물릴 때 변화가 있는지 전달합니다.",
    "임시 보철 재부착·재제작 또는 최종 장착 계획 중 현재 가능한 일을 구분합니다."
  ],
  "choices": [
    {
      "condition": "치아와 임시 보철 상태가 재사용에 적합하다면",
      "option": "진찰 후 다시 부착할 수 있는지 평가하고 이후 관리법을 안내받습니다.",
      "limit": "눈으로 멀쩡해 보인다는 이유만으로 집에서 부착하거나 재사용을 확정하지 않습니다."
    },
    {
      "condition": "임시 보철이 깨졌거나 치아에 추가 확인이 필요하다면",
      "option": "새로운 임시 보호나 필요한 처치 후 최종 장착 일정을 조정할 수 있습니다.",
      "limit": "임시 크라운 탈락만으로 최종 크라운을 반드시 다시 만들어야 한다고 단정하지 않습니다."
    }
  ],
  "unknown": "빠진 보철의 안쪽 사진만으로 접착재인지 치아 일부인지, 재부착만으로 충분한지 판단할 수 없습니다. 직접 긁거나 갈지 마세요. 심해지는 통증·붓기는 신속히 알리고, 호흡·삼킴 곤란이나 멎지 않는 심한 출혈이 있으면 가까운 응급의료기관의 도움을 받으세요.",
  "prepare": [
    "빠진 임시 보철을 분실하지 않도록 용기에 보관",
    "현재 치료 단계와 다음 예약 날짜",
    "신경치료 여부, 빠지기 전후 느낀 불편과 씹는 변화"
  ],
  "localHeading": "홍성에서 임시 크라운 탈락으로 연락하신다면",
  "localAdvice": "홍성에서 천안 불당동까지 다시 이동해야 한다면 출발 전에 “최종 보철을 기다리는 중 임시 크라운이 빠졌다”고 알려주세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 가까운 곳에서 먼저 임시 처치가 필요한지, 기존 치과에 어떤 기록을 전달할지 상담할 수 있습니다. 당일 최종 보철 장착을 약속받은 것으로 이해하지 말고, 방문 목적과 가능한 처치 범위를 확인하세요.",
  "related": [
    {
      "title": "크라운 치료 뒤 불편과 재평가를 상의할 때",
      "href": "/guide/regret/crown"
    },
    {
      "title": "인레이와 크라운의 치료 범위 비교",
      "href": "/guide/compare/inlay-vs-crown"
    },
    {
      "title": "홍성에서 방문 준비",
      "href": "/area/hongseong#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "Leeds Teaching Hospitals NHS · 임시 크라운의 보호 역할과 제작 과정",
      "href": "https://www.leedsth.nhs.uk/patients/resources/crowns/"
    },
    {
      "title": "미국 국립의학도서관 MedlinePlus · 임시 크라운 관리와 탈락 시 연락",
      "href": "https://medlineplus.gov/ency/article/007631.htm"
    },
    {
      "title": "Oral Health Foundation · 최종 크라운의 적합도 확인",
      "href": "https://www.dentalhealth.org/crowns"
    },
    {
      "title": "NHS · 보철 탈락·통증에 대한 긴급 진료 안내",
      "href": "https://www.nhs.uk/nhs-services/dentists/how-to-find-an-nhs-dentist-in-an-emergency/"
    }
  ],
  "updated": "2026-09-26",
  "publishedAt": "2026-09-26T09:17:17+09:00"
},
{
  "slug": "jaw-stuck-open-after-yawning",
  "title": "하품한 뒤 입이 다물어지지 않아요. 턱을 직접 맞춰도 되나요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "턱관절 잠김",
  "concern": "갑자기 말도 제대로 못 해서 무서워요",
  "description": "예산에서 하품 뒤 입이 열린 채 다물어지지 않을 때, 즉시 진료가 필요한 이유와 피해야 할 자가 처치, 도움을 요청하는 문장과 응급 처치 후 확인할 계획을 정리합니다.",
  "situation": "예산에서 크게 하품한 뒤 입이 열린 상태로 다물어지지 않습니다. 말하기도 어색하고 침을 다루기 어려워 당황스럽습니다. 인터넷에는 손으로 턱을 맞추는 영상이 있지만 따라 해도 될지 무섭습니다.",
  "answer": "지금 입이 열린 채 다물어지지 않는다면 턱을 직접 맞추려 하지 말고 즉시 가까운 응급실 등 의료기관의 평가를 받으세요. 턱관절 탈구 등이 가능하지만 온라인으로 확정할 수 없습니다. 호흡 곤란·심한 출혈·큰 얼굴 외상이 있으면 119에 도움을 요청하세요. 먼 병원의 예약이나 이 글을 끝까지 읽는 것보다 현재 상태 확인이 우선입니다.",
  "checks": [
    "입이 안 벌어지는 것인지, 벌어진 입이 안 다물어지는 것인지 먼저 알립니다.",
    "시작 시각·하품이나 충격 같은 계기·이전 반복 여부를 전달합니다.",
    "의료진이 관절 상태와 동반 손상을 평가하고 필요한 검사·처치를 결정합니다."
  ],
  "choices": [
    {
      "condition": "진찰에서 턱관절 탈구로 확인된다면",
      "option": "의료진이 통증 조절과 관절 위치를 되돌리는 처치 등 필요한 치료를 시행합니다.",
      "limit": "손으로 맞추는 절차를 혼자 또는 가족이 영상만 보고 따라 하지 않습니다."
    },
    {
      "condition": "외상이나 다른 잠김 원인이 의심된다면",
      "option": "필요한 검사와 적절한 진료과 평가를 통해 치료 방향을 정합니다.",
      "limit": "모든 잠김을 같은 탈구로 보거나 장치·수술 중 하나로 미리 결정하지 않습니다."
    }
  ],
  "unknown": "거울에 보이는 턱 위치나 통증 정도만으로 탈구·골절·관절 내부 문제를 구별할 수 없습니다. 강제로 다물거나 손가락·도구를 넣어 맞추지 마세요. 과거에 저절로 돌아온 적이 있어도 이번 상태가 안전하게 풀릴 것이라고 가정하지 않습니다.",
  "prepare": [
    "먼저 진료 도움 요청: 자료 준비 때문에 출발을 늦추지 않기",
    "말하기 어려우면 시작 시각·외상 유무를 휴대전화 메모로 전달",
    "이전 탈구·턱관절 치료 및 복용 약 정보는 아는 만큼만 준비"
  ],
  "localHeading": "예산에서 턱관절 잠김이 생겼다면 가까운 평가가 우선입니다",
  "localAdvice": "예산에서 지금 입을 다물지 못하는 상황이라면 천안까지의 예약 진료를 기다리기보다 가까운 응급의료기관에 즉시 도움을 요청하세요. 서울비디치과의 실제 진료 장소는 천안 불당동이며, 이 글은 응급실 운영이나 당일 탈구 처치를 보장하는 안내가 아닙니다. 급한 처치 후 지속 불편이나 재발 상담을 계획할 때 받은 진료 내용과 주의사항을 준비해 상담 범위를 문의하세요.",
  "related": [
    {
      "title": "급한 처치 후 턱관절 상담을 이어갈 때",
      "href": "/treatments/tmj"
    },
    {
      "title": "후속 치과 상담에서 확인할 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "통증 없는 소리만 나는 상황과 구분하기",
      "href": "/concerns/jaw-clicking-without-pain"
    },
    {
      "title": "예산에서 후속 방문 준비",
      "href": "/area/yesan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "호주 공공보건정보 healthdirect · 턱 탈구와 즉시 진료·자가 정복 금지",
      "href": "https://www.healthdirect.gov.au/jaw-dislocation"
    },
    {
      "title": "미국 국립의학도서관 MedlinePlus · 턱 탈구·골절의 응급 평가와 치료",
      "href": "https://medlineplus.gov/ency/article/000019.htm"
    },
    {
      "title": "미국 NIDCR · 턱관절 질환의 진단과 치료 상담",
      "href": "https://www.nidcr.nih.gov/health-info/tmd"
    }
  ],
  "updated": "2026-09-26",
  "publishedAt": "2026-09-26T09:17:17+09:00"
},
{
  "slug": "osteoporosis-medication-before-tooth-extraction",
  "title": "골다공증 약을 먹는데 이를 빼야 한대요. 약부터 끊어야 하나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "발치와 복용약",
  "concern": "이를 빼는 것도 약을 끊는 것도 무서워요",
  "description": "당진에서 골다공증 치료 중 발치를 권유받았을 때, 약 이름·주사 일정 확인과 처방 의료진 협의, 치아 보존 가능성 및 발치 후 경과 확인을 준비하는 안내입니다.",
  "situation": "당진에서 골다공증 약을 복용하며 지내는데 어금니를 빼야 한다는 말을 들었습니다. 검색하다 턱뼈 괴사라는 단어를 보고 겁이 났습니다. 약을 계속 먹어도 걱정이고, 끊었다가 뼈가 약해질까 봐 무엇부터 해야 할지 모르겠습니다.",
  "answer": "약부터 임의로 중단하지 마세요. 골다공증 치료 중이라는 사실만으로 발치가 금지되는 것은 아니며, 정확한 약·투여 목적과 기간·치아 상태에 따라 계획을 세웁니다. 발치의 필요성과 치아 보존 가능성을 확인하고, 약 조정이 필요한지는 치과와 처방 의료진이 협의하도록 요청하세요. 특히 데노수맙 주사 일정을 스스로 미루지 않습니다.",
  "checks": [
    "약 이름, 먹는 약인지 주사인지, 시작 시점과 마지막·다음 투여 날짜를 확인합니다.",
    "이를 빼야 하는 이유와 보존 가능한 범위, 감염의 정도를 설명받습니다.",
    "처방 의료진과의 협의 필요 여부 및 발치 후 확인 일정을 나누어 정합니다."
  ],
  "choices": [
    {
      "condition": "검사 결과 치아를 보존할 여지가 있다면",
      "option": "현재 치아에서 가능한 보존 치료와 그 한계를 상담합니다.",
      "limit": "약을 복용한다는 이유만으로 이미 회복하기 어려운 치아를 무조건 남기는 것은 아닙니다."
    },
    {
      "condition": "발치가 필요하다고 판단되면",
      "option": "약 이력과 전신 상태를 함께 검토해 발치·경과 확인 계획을 세우고 필요한 협진을 요청합니다.",
      "limit": "누구에게나 같은 휴약 기간이나 안전을 보장하는 검사 수치를 적용할 수는 없습니다."
    }
  ],
  "unknown": "인터넷의 턱뼈 괴사 사진이나 약 이름 하나로 개인의 위험과 수술 가능 여부를 정할 수 없습니다. 처방 약을 임의로 끊거나 다음 주사를 취소하지 마세요. 통증·부기·고름, 낫지 않는 상처나 뼈 노출이 의심되면 치과에 알려 평가받습니다.",
  "prepare": [
    "현재와 과거 골다공증 약의 이름이 보이는 처방전·투약 목록",
    "주사 날짜와 다음 예약일, 처방받는 의료기관 정보",
    "발치 권유 이유·기존 영상 유무·최근 통증과 부기 변화"
  ],
  "localHeading": "당진에서 발치 상담을 위해 이동하시기 전에",
  "localAdvice": "당진에서 서울비디치과로 방문할 때 실제 진료 장소는 천안 불당동입니다. 출발 전에 골다공증 치료 사실과 약 정보를 알리고, 첫날 검사·설명이 가능한 범위와 처방기관의 회신이 필요한지 문의하세요. 내과 방문과 발치를 같은 날 모두 끝낸다고 가정하지 않고, 발치 후 확인을 어디서 어떻게 받을지도 상의하면 이동 부담을 줄이는 데 도움이 됩니다.",
  "related": [
    {
      "title": "치아 보존과 임플란트를 비교하기 전",
      "href": "/guide/compare/root-canal-vs-implant"
    },
    {
      "title": "임플란트 상담에서 확인할 조건",
      "href": "/guide/implant"
    },
    {
      "title": "당진에서 방문 전 준비",
      "href": "/area/dangjin#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국치과의사협회 ADA · 골다공증 약과 치과 치료 계획",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/osteoporosis-medications"
    },
    {
      "title": "영국 의약품안전청 MHRA · 데노수맙 중단·지연 시 주의",
      "href": "https://www.gov.uk/drug-safety-update/denosumab-60mg-prolia-increased-risk-of-multiple-vertebral-fractures-after-stopping-or-delaying-ongoing-treatment"
    },
    {
      "title": "SDCEP · 약물 관련 턱뼈 괴사 위험 환자의 구강 관리",
      "href": "https://companion.sdcep.org.uk/prevention-of-medication-related-osteonecrosis-of-the-jaw/initial-management/recommendations/"
    }
  ],
  "updated": "2026-09-27",
  "publishedAt": "2026-09-27T09:00:00+09:00"
},
{
  "slug": "burning-tongue-with-normal-appearance",
  "title": "혀가 계속 화끈거리는데 겉으로는 멀쩡하대요. 어디서 확인해야 하나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "혀 화끈거림",
  "concern": "보이지 않는 불편을 어떻게 설명할지 모르겠어요",
  "description": "서산에서 혀가 화끈거리지만 눈에 띄는 상처가 없을 때, 불편을 기록하는 방법과 구강작열감의 평가, 필요한 진료 연결 및 상담에서 확인할 질문을 안내합니다.",
  "situation": "서산에서 지내며 혀끝이 데인 것처럼 화끈거리는 날이 이어집니다. 뜨거운 것을 먹은 것도 아니고 거울에는 상처가 보이지 않습니다. 괜찮아 보인다는 말을 들었지만 식사와 대화가 신경 쓰여 다시 어디를 찾아가야 할지 막막합니다.",
  "answer": "겉으로 정상처럼 보여도 혀의 화끈거림은 평가가 필요한 불편입니다. 바로 구강작열감증후군이라고 단정하지 않고 구강 상태·약 이력·동반 증상을 살펴 다른 원인이 있는지 확인합니다. 먼저 치과에서 상담하고 필요하면 구강내과 등 적절한 진료과로 연결받으세요. 검사 결과와 증상 경과를 함께 가져가면 다음 평가에 도움이 됩니다.",
  "checks": [
    "불편이 시작된 때, 위치, 하루 중 달라지는 양상과 식사·말하기의 영향을 적습니다.",
    "입마름·맛 변화·새 상처 여부와 현재 약·사용 중인 구강 제품을 알립니다.",
    "이미 확인한 항목과 추가로 평가할 항목, 다음 진료과·재진 시점을 구분합니다."
  ],
  "choices": [
    {
      "condition": "화끈거림을 설명할 구강·전신 문제가 확인된다면",
      "option": "그 문제에 맞는 치료와 필요한 진료과 협의를 진행합니다.",
      "limit": "증상 하나로 영양 부족·감염·약 부작용 중 하나를 미리 정하지 않습니다."
    },
    {
      "condition": "다른 원인을 평가한 뒤 구강작열감증후군을 고려한다면",
      "option": "통증 관리와 생활의 불편을 줄이는 목표를 세우고 경과를 확인합니다.",
      "limit": "한 가지 약이나 한 번의 진료로 모두 해결된다고 약속할 수는 없습니다."
    }
  ],
  "unknown": "혀 사진 한 장이나 정상이라는 검사 결과 하나로 화끈거림의 원인을 확정할 수 없습니다. 처방약 중단, 고용량 영양제 복용, 보철 제거를 스스로 결정하지 마세요. 새 상처·출혈 등 눈에 보이는 변화가 생기면 이전에 정상이라고 들었어도 다시 의료진에게 알립니다.",
  "prepare": [
    "시작 시점·위치·강해지는 시간·식사와 대화에 미치는 영향 메모",
    "이전 검사 결과와 받은 설명, 시도한 치료 및 변화",
    "처방약·영양제·치약·가글 등 현재 사용하는 제품 목록"
  ],
  "localHeading": "서산에서 혀의 불편으로 상담을 준비하신다면",
  "localAdvice": "서산에서 방문을 계획할 때는 “혀가 화끈거리지만 뚜렷한 상처가 보이지 않는다”고 먼저 알려 진료 범위와 필요한 자료를 문의하세요. 서울비디치과는 천안 불당동에 있으며, 구강내과 등 다른 진료과 평가가 필요한지는 상담에서 확인합니다. 여러 기관을 같은 날 무조건 방문하기보다 기존 검사 자료를 연결하고 다음 진료 목적을 정리해 이동 일정을 잡으세요.",
  "related": [
    {
      "title": "첫 치과 상담에서 확인할 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "가글과 칫솔질의 역할을 구분하기",
      "href": "/guide/compare/mouthwash-vs-brushing"
    },
    {
      "title": "약 복용 뒤 입마름이 생겼을 때",
      "href": "/concerns/dry-mouth-after-medication-new-cavities"
    },
    {
      "title": "서산에서 첫 방문 자료 준비",
      "href": "/area/seosan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국 국립치과두개안면연구소 NIDCR · 구강작열감증후군 평가와 관리",
      "href": "https://www.nidcr.nih.gov/health-info/burning-mouth"
    },
    {
      "title": "Ashford and St Peter’s NHS · 구강작열감의 진단과 추적 관리",
      "href": "https://www.ashfordstpeters.nhs.uk/leaflets/3553-oral-surgery-leaflet-burning-mouth-syndrome-bms"
    },
    {
      "title": "영국·아일랜드 구강내과학회 BISOM · 구강작열감 환자 안내",
      "href": "https://www.qvh.nhs.uk/wp-content/uploads/2022/07/Burning-mouth-syndrome-PIL-leaflet.pdf"
    }
  ],
  "updated": "2026-09-27",
  "publishedAt": "2026-09-27T09:00:00+09:00"
},
{
  "slug": "removable-retainer-no-longer-fits",
  "title": "유지장치를 한동안 안 꼈더니 안 들어가요. 세게 눌러 끼워도 되나요?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "교정 유지장치",
  "concern": "다시 교정해야 할까 봐 연락을 망설여요",
  "description": "천안에서 탈착식 교정 유지장치가 끝까지 들어가지 않을 때, 억지로 끼우지 말아야 할 상황과 장치·치열 평가, 재제작과 재교정을 구분해 상담하는 방법을 안내합니다.",
  "situation": "천안에서 지내며 바쁜 일정 때문에 유지장치를 한동안 빼두었습니다. 다시 끼워 보니 한쪽이 뜨고 눌러도 끝까지 들어가지 않습니다. 교정에 들인 시간과 비용을 내가 망친 것 같아 예전 치과에 연락하기도 겁이 납니다.",
  "answer": "끝까지 들어가지 않거나 통증을 주는 유지장치는 힘으로 밀어 넣지 말고 교정 담당 치과에 연락하세요. 치아 위치의 변화와 장치의 변형·손상을 함께 확인해야 합니다. 새 유지장치가 필요한지, 치아 위치를 다시 조정할지 여부는 진찰 후 판단하며, 맞지 않는다는 사실만으로 전체 재교정이 확정되는 것은 아닙니다.",
  "checks": [
    "마지막으로 편하게 착용한 때와 착용하지 못한 기간을 대략 정리합니다.",
    "장치가 어디서 뜨는지, 통증·갈라짐·변형이 있는지 알리고 실제 장치를 가져갑니다.",
    "현재 치열을 유지하는 계획인지 위치를 다시 조정하는 계획인지 구분해 설명받습니다."
  ],
  "choices": [
    {
      "condition": "현재 치아 위치를 유지하는 방향으로 결정된다면",
      "option": "장치 상태를 확인하고 적합한 유지장치 조정·재제작 가능성을 평가합니다.",
      "limit": "현재 치열에 맞게 새로 만든 유지장치가 예전 치열로 되돌리는 치료와 같은 것은 아닙니다."
    },
    {
      "condition": "치아 위치의 추가 조정이 필요하고 환자분도 원한다면",
      "option": "이동 범위와 교합을 확인해 재치료의 방법·기간·이후 유지 계획을 상담합니다.",
      "limit": "한 장의 사진이나 장치가 뜨는 정도만으로 부분교정 가능 여부를 확정할 수 없습니다."
    }
  ],
  "unknown": "처음 장치를 받았을 때의 밀착감과 지금 끝까지 들어가지 않는 상태를 혼자 같은 것으로 판단하지 마세요. 꽉 깨물어 넣거나 뜨거운 물로 모양을 바꾸거나 철사를 직접 구부리지 않습니다. 착용을 못 하는 상태를 그대로 알리고 다음 진료 전까지의 사용 여부를 안내받으세요.",
  "prepare": [
    "현재 유지장치와 보관 케이스, 보유한 예전 장치",
    "교정 종료 시기·마지막 착용 시점·장치 수리 및 재제작 이력",
    "교정 완료 당시 사진·자료와 지금 특히 신경 쓰이는 치아 위치"
  ],
  "localHeading": "천안에서 유지장치가 맞지 않아 상담하신다면",
  "localAdvice": "천안에서 유지장치 상담을 예약할 때 “탈착식 장치가 한쪽에서 뜨고 끝까지 들어가지 않는다”고 설명하세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 기존 교정 자료가 있는지 알리고 장치를 꼭 가져오세요. 첫날 확인할 범위와 재제작·치아 위치 조정의 가능성은 나누어 상담하며, 그날 새 장치를 받아갈 수 있다고 미리 가정하지 않습니다.",
  "related": [
    {
      "title": "유지장치 때문에 남는 걱정",
      "href": "/guide/regret/retainer"
    },
    {
      "title": "교정 치료와 유지 과정 이해하기",
      "href": "/guide/orthodontics"
    },
    {
      "title": "고정 유지장치가 있는데 앞니가 벌어졌을 때",
      "href": "/concerns/front-gap-with-fixed-retainer"
    },
    {
      "title": "천안에서 첫 방문 준비",
      "href": "/area/cheonan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국교정학회 AAO · 맞지 않거나 아픈 유지장치 상담",
      "href": "https://aaoinfo.org/resources/faqs/page/13/"
    },
    {
      "title": "미국교정학회 AAO · 유지장치 변형·균열과 관리",
      "href": "https://aaoinfo.org/whats-trending/how-to-clean-your-retainer/"
    },
    {
      "title": "University Hospitals Plymouth NHS · 유지장치 착용과 문제 발생 시 연락",
      "href": "https://www.plymouthhospitals.nhs.uk/display-pil/pil-retainer-instructions-5949"
    }
  ],
  "updated": "2026-09-27",
  "publishedAt": "2026-09-27T09:00:00+09:00"
},
{
  "slug": "gag-reflex-keeps-delaying-dental-care",
  "title": "입안에 기구만 들어와도 구역질이 나요. 치과 치료를 계속 미루게 됩니다.",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "구역반사와 진료 불안",
  "concern": "또 진료를 못 끝내고 나올까 봐 두려워요",
  "description": "아산에서 심한 구역반사로 치과 검사와 치료를 미루고 있을 때, 첫 연락에서 알릴 내용과 단계별 진료 계획, 진정치료 상담 및 이동 준비를 정리합니다.",
  "situation": "아산에서 치과에 가야 한다고 생각하지만 입안에 기구가 닿으면 구역질이 올라옵니다. 예전에 본을 뜨다가 중단한 기억 때문에 예약부터 겁이 납니다. 또 직원들에게 미안한 상황이 생길까 봐 아픈 곳을 참고 지냅니다.",
  "answer": "구역반사 때문에 진료가 어려웠던 경험을 예약 때부터 알려주세요. 유발 상황과 과거 경험, 필요한 치료와 건강 상태를 확인해 진료 방식과 속도를 상의할 수 있습니다. 진정치료가 도움이 될 가능성도 평가하지만 누구에게나 필요하거나 구역반사를 반드시 없애는 방법은 아닙니다. 첫날 할 수 있는 평가와 다음 단계를 구분해 상담하세요.",
  "checks": [
    "어떤 기구·자세·검사에서 힘들었는지와 이전에 중단했던 경험을 알립니다.",
    "먼저 설명받기, 중단 신호, 쉬는 시점과 첫 방문의 범위를 상의합니다.",
    "진정치료를 검토한다면 건강 상태·복용약·동행 및 귀가 계획을 함께 확인합니다."
  ],
  "choices": [
    {
      "condition": "진료 방식과 속도를 조정하며 평가를 시도할 수 있다면",
      "option": "사전에 합의한 신호와 단계에 따라 가능한 범위를 확인합니다.",
      "limit": "첫 방문에 모든 검사와 치료를 마칠 수 있다고 약속하지 않습니다."
    },
    {
      "condition": "구역반사와 불안으로 필요한 진료가 계속 어려우면",
      "option": "진정치료의 적합성이나 추가 지원·적절한 진료기관 연결을 상담합니다.",
      "limit": "진정치료와 전신마취는 다르며 적합성·효과·제공 가능 여부는 개별 확인이 필요합니다."
    }
  ],
  "unknown": "구역반사만으로 필요한 검사나 치료 방법을 온라인에서 정할 수는 없습니다. 진료를 버티려고 술이나 수면제·진정제를 임의로 사용하지 마세요. 식사·금식·복용약·보호자·운전 관련 안내는 실제로 정한 진료 방식에 맞춰 해당 의료기관에서 받습니다.",
  "prepare": [
    "검사·본뜨기·양치 등 구역질이 생기는 구체적인 상황",
    "도움이 됐거나 더 힘들었던 과거 진료 경험과 현재 필요한 치료",
    "복용약·건강 상태·진정 및 마취 경험, 동행과 이동 가능 일정"
  ],
  "localHeading": "아산에서 구역반사 때문에 치과 방문을 망설이신다면",
  "localAdvice": "아산에서 서울비디치과로 오실 때 진료 장소는 천안 불당동입니다. 예약 전에 구역반사로 검사를 중단한 경험과 첫날 상담부터 받고 싶은지 알려주세요. 진정치료 여부와 제공 가능한 방법은 미리 확인해야 하며, 운전해 왔다가 즉시 진정치료를 받고 혼자 귀가하는 일정으로 가정하지 않습니다. 출퇴근 시간과 동행 가능 여부까지 포함해 계획을 상의하세요.",
  "related": [
    {
      "title": "진정치료와 일반 진료를 상담할 때",
      "href": "/guide/compare/sedation-vs-normal"
    },
    {
      "title": "진정치료 전에 남는 걱정",
      "href": "/guide/regret/sedation"
    },
    {
      "title": "처음 방문할 치과에서 확인할 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "아산에서 방문 전 준비",
      "href": "/area/asan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "Guy’s and St Thomas’ NHS · 진료를 어렵게 하는 구역반사의 지원",
      "href": "https://www.guysandstthomas.nhs.uk/our-services/dental-psychology/appointments"
    },
    {
      "title": "Guy’s and St Thomas’ NHS · 치과 불안의 단계별 평가와 지원",
      "href": "https://www.guysandstthomas.nhs.uk/our-services/dental-psychology/dental-anxiety-support"
    },
    {
      "title": "Ashford and St Peter’s NHS · 의식하 진정의 목적·위험·준비",
      "href": "https://www.ashfordstpeters.nhs.uk/leaflets/3554-oral-surgery-leaflet-conscious-sedation"
    }
  ],
  "updated": "2026-09-27",
  "publishedAt": "2026-09-27T09:00:00+09:00"
},
{
  "slug": "front-tooth-turning-dark-after-injury",
  "title": "앞니를 부딪힌 뒤 색이 어두워져요. 안 아파도 신경치료를 해야 하나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "앞니 외상",
  "concern": "겉모습이 달라져 걱정돼요",
  "description": "홍성에서 앞니 외상 후 변색을 상담하려는 분을 위해 통증이 없을 때의 검사, 신경치료 판단과 색을 개선하는 치료의 순서를 설명합니다.",
  "situation": "홍성에 살고 있습니다. 예전에 앞니를 부딪혔지만 크게 깨지지 않아 지냈는데, 최근 사진에서 그 치아만 어둡게 보입니다. 아프지 않은 치아를 신경치료해야 하는지 걱정됩니다.",
  "answer": "외상 뒤 변색은 치아 내부 상태를 확인할 이유가 되지만, 색만으로 신경치료를 결정하지는 않습니다. 다친 과정과 시점, 치아의 반응, 주변 조직과 영상 소견을 함께 평가합니다. 통증이 없다는 이유로 확인을 계속 미루거나 미백부터 시작하지 마세요.",
  "checks": [
    "부딪힌 시점과 당시 흔들림·위치 변화·응급처치 여부를 확인합니다.",
    "치아 반응 검사와 두드림·주변 조직 검사, 필요한 영상을 종합합니다.",
    "이전 사진·검사와 비교하고 관찰이 가능하다면 재검 시점과 치료로 바꿀 기준을 정합니다."
  ],
  "choices": [
    {
      "condition": "검사상 당장 근관치료가 필요하다는 근거가 부족하면",
      "option": "외상 종류에 맞춰 경과를 관찰하고 재검을 계획합니다.",
      "limit": "관찰은 확인 없이 통증이 생길 때까지 기다린다는 뜻이 아닙니다."
    },
    {
      "condition": "치수 괴사·감염 등 근관치료 적응증이 확인되면",
      "option": "치아를 보존할 수 있는지 평가하고 필요한 치료를 상담합니다.",
      "limit": "통증 유무나 색 한 가지로 치료 범위·예후를 확정하지 않습니다."
    },
    {
      "condition": "치아 건강 상태와 필요한 치료가 정리된 뒤 색이 고민이면",
      "option": "현재 치아에 적합한 심미적 개선 방법을 별도로 비교합니다.",
      "limit": "신경치료를 하면 색도 저절로 해결된다고 보장하지 않습니다."
    }
  ],
  "unknown": "이 글은 외상 후 영구치 변색에 대한 상담 준비입니다. 유치는 판단과 치료가 다르므로 아이의 유치에 그대로 적용하지 마세요. 새로 다친 치아가 흔들리거나 위치가 달라졌다면 색이 변하는지 기다리지 말고 신속히 진료받으세요. 부기·고름·심해지는 통증도 예약 때 바로 알립니다.",
  "prepare": [
    "외상 날짜 또는 대략적인 시기와 응급처치·기존 치료 기록",
    "색 변화가 보이는 이전 사진과 최근 사진, 새 증상 발생일",
    "이전 영상이 있다면 사본과 첫 상담에서 묻고 싶은 내용"
  ],
  "localHeading": "홍성에서 앞니 외상과 변색 상담을 준비한다면",
  "localAdvice": "서울비디치과의 진료 장소는 천안 불당동입니다. 홍성에서 방문하기 전 외상 시기와 색이 달라진 시점, 통증·부기 유무를 알려주세요. 첫 검사와 이후 관찰·치료가 여러 방문으로 나뉠 수 있어 이동 가능한 일정을 함께 상의하세요. 막 다친 치아의 위치 변화나 심한 증상은 장거리 예약일까지 기다리지 말고 가까운 곳에서 먼저 평가받습니다.",
  "related": [
    {
      "title": "신경치료의 검사와 치료 과정",
      "href": "/guide/root-canal"
    },
    {
      "title": "앞니 치료를 결정하기 전의 고민",
      "href": "/guide/regret/front-teeth"
    },
    {
      "title": "앞니가 깨졌지만 아프지 않을 때",
      "href": "/concerns/chipped-front-tooth-without-pain"
    },
    {
      "title": "홍성에서 방문 전 준비",
      "href": "/area/hongseong#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "유럽근관치료학회 ESE · 외상 영구치의 검사와 근관치료 판단",
      "href": "https://onlinelibrary.wiley.com/doi/10.1111/iej.13543"
    },
    {
      "title": "미국근관치료학회 AAE · 외상 치아의 치료와 추적 관찰",
      "href": "https://www.aae.org/patients/dental-symptoms/traumatic-dental-injuries/"
    }
  ],
  "updated": "2026-09-28",
  "publishedAt": "2026-09-28T09:00:00+09:00"
},
{
  "slug": "numb-lip-after-lower-wisdom-tooth-removal",
  "title": "아래 사랑니를 뺀 뒤 입술 감각이 둔해요. 마취가 덜 풀린 걸까요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "사랑니 발치",
  "concern": "치료 뒤 새로운 불편이 생겼어요",
  "description": "예산에서 아래 사랑니 발치 후 입술·턱끝·혀의 감각 변화를 겪는 분을 위해 수술한 곳에 알릴 내용과 재평가, 일상에서 조심할 점을 정리합니다.",
  "situation": "예산에서 아래 사랑니를 뺀 뒤 시간이 지났는데 입술 한쪽과 턱끝이 아직 남의 살처럼 느껴집니다. 마취가 오래가는 것인지, 다시 연락하면 유난스럽게 보일지 걱정됩니다.",
  "answer": "마취가 풀릴 것으로 안내받은 시간이 지났는데도 감각이 계속 둔하거나 양상이 걱정된다면 수술한 치과·구강악안면외과에 연락해 평가 시점을 안내받으세요. 아래 사랑니 주변 신경에 영향이 생기면 감각 변화가 나타날 수 있지만, 집에서 원인·회복 시기·영구 손상 여부를 정할 수는 없습니다.",
  "checks": [
    "수술 날짜·부위와 마취 뒤부터 계속인지, 감각이 돌아왔다가 다시 달라졌는지 확인합니다.",
    "입술·턱끝·혀 중 어느 범위인지, 둔함·저림·화끈거림과 일상 불편을 기록합니다.",
    "의료진이 수술 전 영상과 수술 내용, 현재 감각 검사를 바탕으로 재평가·추적·의뢰 필요성을 판단합니다."
  ],
  "choices": [
    {
      "condition": "안내받은 마취 지속 시간 안이며 감각이 돌아오는 중이면",
      "option": "받은 수술 후 지침을 따르며 상태를 살핍니다.",
      "limit": "예상 시간을 모르거나 걱정되는 변화가 있으면 수술한 곳에 문의합니다."
    },
    {
      "condition": "예상 시간을 넘어 감각 변화가 남거나 악화되면",
      "option": "수술한 곳에 연락해 감각 범위와 경과를 평가받습니다.",
      "limit": "실밥 제거일까지 무조건 기다리거나 온라인 회복 기간을 자신의 경과로 적용하지 않습니다."
    },
    {
      "condition": "검사 결과 추가 평가가 필요하면",
      "option": "구강악안면외과 등 적절한 진료 연결과 추적 계획을 상담합니다.",
      "limit": "누구나 수술이나 약물치료가 필요한 것은 아니며 방법과 시기는 개별 판단입니다."
    }
  ],
  "unknown": "감각 저하가 있다고 모두 영구 손상은 아니지만, 저절로 반드시 회복된다고 약속할 수도 없습니다. 바늘·뜨거운 물·강한 마사지로 감각을 시험하거나 처방 없이 약을 추가하지 마세요. 빠르게 커지는 부기와 호흡·삼킴 곤란, 멎지 않는 심한 출혈은 즉시 응급 진료가 필요한 신호입니다.",
  "prepare": [
    "수술 일시와 좌우 위치, 받은 안내문·처방 및 연락처",
    "감각이 달라진 부위와 시작 시점·변화, 씹기·말하기의 불편",
    "수술 전 영상과 의뢰서가 있다면 사본, 복용 중인 약 목록"
  ],
  "localHeading": "예산에서 사랑니 발치 후 감각 변화로 상담하신다면",
  "localAdvice": "예산에서 불편이 시작되면 우선 수술한 의료기관에 연락해 현재 증상과 평가 시점을 확인하세요. 서울비디치과로 상담을 계획하실 경우 실제 진료 장소는 천안 불당동이며, 기존 수술 기록·영상의 준비 방법과 해당 증상의 진료 가능 범위를 미리 문의합니다. 감각 변화나 응급 증상을 장거리 방문 일정 때문에 오래 기다리지 마세요.",
  "related": [
    {
      "title": "사랑니 발치 전후 확인할 내용",
      "href": "/guide/wisdom-tooth"
    },
    {
      "title": "사랑니 치료 뒤 남는 걱정",
      "href": "/guide/regret/wisdom-tooth"
    },
    {
      "title": "발치 나흘째 통증이 더 심해질 때",
      "href": "/concerns/extraction-pain-worse-on-day-four"
    },
    {
      "title": "예산에서 방문 전 준비",
      "href": "/area/yesan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "영국구강악안면외과학회 BAOMS · 아래 사랑니와 감각 신경",
      "href": "https://www.baoms.org.uk/patients/procedures/23/removal_of_impacted_wisdom_teeth"
    },
    {
      "title": "NHS · 사랑니 발치 후 회복·감각 변화·진료가 필요한 신호",
      "href": "https://www.nhs.uk/tests-and-treatments/wisdom-tooth-removal/"
    },
    {
      "title": "Hull University Teaching Hospitals NHS · 사랑니 발치 후 합병증 평가",
      "href": "https://www.hey.nhs.uk/patient-leaflet/removal-wisdom-teeth/"
    }
  ],
  "updated": "2026-09-28",
  "publishedAt": "2026-09-28T09:00:00+09:00"
},
{
  "slug": "child-new-molar-yellow-and-crumbling",
  "title": "아이 새 어금니가 누렇고 조금씩 부서져요. 양치를 못 시킨 탓인가요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "어린이 영구치",
  "concern": "제가 관리를 잘못한 걸까요",
  "description": "당진에서 아이의 새 영구치 어금니 변색·시림·부서짐으로 고민하는 보호자를 위해 MIH를 포함한 검사와 보존·발치 상담의 순서를 설명합니다.",
  "situation": "당진에서 초등학생 아이의 양치를 도와주다 새로 난 뒤쪽 어금니가 누렇고 가장자리가 부서진 것을 봤습니다. 아이는 닦을 때 아프다고 하는데 관리를 잘못한 탓인지, 영구치를 벌써 뽑아야 하는지 걱정됩니다.",
  "answer": "새 영구치의 변색과 부서짐은 충치뿐 아니라 치아가 만들어질 때 법랑질의 질이 달라지는 MIH 같은 문제도 확인해야 합니다. 사진이나 색만으로 진단할 수는 없습니다. 아이가 아프다는 반응을 먼저 듣고, 어떤 치아가 얼마나 영향을 받았는지 검사해 보호·수복·필요시 발치와 장기 계획을 나누어 상담하세요.",
  "checks": [
    "새로 난 영구치인지 확인하고 다른 첫 어금니와 앞니도 함께 살핍니다.",
    "얼룩·깨짐·충치의 범위와 시림, 식사·양치·기존 치료 때의 어려움을 확인합니다.",
    "나이뿐 아니라 치아 발육과 맞물림, 보존 가능성에 따라 필요한 검사와 치료를 정합니다."
  ],
  "choices": [
    {
      "condition": "상태가 비교적 가볍고 치아 보호가 가능하면",
      "option": "불소 도포나 적합한 치면열구전색 등 예방·시림 관리와 관찰을 상담합니다.",
      "limit": "이미 소실된 치아가 양치나 불소만으로 원래 모양으로 자라는 것은 아닙니다."
    },
    {
      "condition": "부분적인 손상이나 충치가 있어 수복이 필요하면",
      "option": "충전 또는 치아를 덮어 보호하는 방법 등 현재 치아에 맞는 계획을 세웁니다.",
      "limit": "치아가 나온 정도·남은 구조·아이의 협조와 통증 조절을 함께 고려합니다."
    },
    {
      "condition": "손상과 증상이 심해 유지가 어렵다면",
      "option": "소아치과·교정 평가를 포함해 발치 필요성과 시기, 이후 치열을 상담합니다.",
      "limit": "나이 하나로 발치 날짜를 정하거나 다음 어금니가 반드시 빈자리를 채운다고 보장하지 않습니다."
    }
  ],
  "unknown": "누런 치아가 모두 MIH는 아니며 충치와 함께 있을 수도 있습니다. 원인이 완전히 밝혀지지 않은 발달 문제를 특정 음식·약 복용이나 보호자의 잘못으로 단정하지 않습니다. 심한 통증·부기·고름·열이 있거나 먹고 마시기 어렵다면 정기검진일까지 기다리지 말고 진료 시점을 문의하세요.",
  "prepare": [
    "처음 발견한 시기와 시림·씹기·양치 때의 반응",
    "사용하는 치약과 기존 치료·검진 자료, 아이의 건강 이력",
    "보호자가 궁금한 보존 가능성·통증 조절·학교와 방문 일정"
  ],
  "localHeading": "당진에서 어린이 영구치 상담을 준비한다면",
  "localAdvice": "당진에서 서울비디치과 방문을 준비하실 때 실제 진료 장소는 천안 불당동입니다. 아이 나이, 새 어금니의 부서짐과 통증, 이전 진료에서 힘들었던 점을 예약 때 전달하고 해당 진료의 가능 범위를 확인하세요. 장기적으로 소아치과·교정과 평가가 필요할 수 있어 첫날 모든 치료가 끝난다고 계획하지 않습니다. 통증이 심하면 이동 일정보다 가까운 진료를 먼저 상의하세요.",
  "related": [
    {
      "title": "충치 치료를 결정할 때의 고민",
      "href": "/guide/regret/cavity"
    },
    {
      "title": "아이 유치 뒤로 영구치가 보일 때",
      "href": "/concerns/child-permanent-tooth-behind-baby-tooth"
    },
    {
      "title": "처음 방문할 치과에서 확인할 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "당진에서 방문 전 준비",
      "href": "/area/dangjin#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "Guy’s and St Thomas’ NHS · 어린이 MIH의 검사와 치료",
      "href": "https://www.guysandstthomas.nhs.uk/health-information/molar-incisor-hypomineralisation-children"
    },
    {
      "title": "Wirral Community NHS · MIH의 원인·시림·치아 보호",
      "href": "https://www.wchc.nhs.uk/resources/molar-incisor-hypomineralisationmih-in-children/"
    },
    {
      "title": "King’s College Hospital NHS · MIH와 발치·교정 계획",
      "href": "https://www.kch.nhs.uk/wp-content/uploads/2023/01/pl-1074.1-molar-incisor-hypomineralisation-mih-in-children.pdf"
    }
  ],
  "updated": "2026-09-28",
  "publishedAt": "2026-09-28T09:00:00+09:00"
},
{
  "slug": "teeth-grinding-with-loud-snoring",
  "title": "이갈이도 하고 코골이도 심하대요. 마우스피스부터 맞추면 될까요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "이갈이",
  "concern": "어디서 먼저 확인해야 할까요",
  "description": "서산에서 이갈이와 심한 코골이로 고민하는 분을 위해 치아 보호장치와 수면호흡 평가의 목적, 치과와 수면 진료에서 확인할 질문을 구분합니다.",
  "situation": "서산에 살며 가족에게 자는 동안 이를 갈고 코도 심하게 곤다는 말을 들었습니다. 아침에는 턱이 뻐근하고 낮에는 졸린데, 치과에서 마우스피스를 만들면 모두 해결되는지 궁금합니다.",
  "answer": "이갈이로 인한 치아·턱의 문제와 자는 동안의 호흡 문제는 함께 이야기하되 각각 평가해야 합니다. 특히 숨이 멎는 모습을 들었거나 헐떡이며 깨고 낮 졸림이 심하면 수면 진료를 상담하세요. 치아 보호용 장치를 수면무호흡 치료장치로 간주하거나, 코골이만으로 수면무호흡을 확정하지는 않습니다.",
  "checks": [
    "치아 마모·파절·시림과 아침 턱의 불편, 낮 동안 이를 악무는지 확인합니다.",
    "가족이 본 코골이·호흡 멈춤, 자다 깨는 양상과 낮 졸림을 전달합니다.",
    "기존 수면검사·양압기·구강장치 사용과 복용약, 실제 진료기관의 검사·의뢰 범위를 확인합니다."
  ],
  "choices": [
    {
      "condition": "치아 손상과 이갈이에 대한 보호가 필요하다면",
      "option": "치아·턱 검사 후 적절한 보호장치와 관리 방법을 상담합니다.",
      "limit": "장치를 낀다고 이갈이 자체나 코골이의 모든 원인이 없어지는 것은 아닙니다."
    },
    {
      "condition": "수면 중 호흡 이상이 의심되는 증상이 함께 있다면",
      "option": "수면 진료와 필요시 수면검사로 확인합니다.",
      "limit": "스마트폰 녹음·시계 측정·치아 마모만으로 확진하지 않습니다."
    },
    {
      "condition": "수면무호흡이 확인되어 치료가 필요하다면",
      "option": "의료진과 양압기나 적합한 구강장치 등 개인에게 맞는 방법을 논의합니다.",
      "limit": "일반 이갈이 장치로 처방된 호흡 치료를 임의로 대체하지 않습니다."
    }
  ],
  "unknown": "이갈이와 코골이가 함께 있다고 한쪽이 다른 쪽의 원인이라고 단정할 수 없습니다. 수면제·진정제나 술로 잠을 해결하려 하지 말고, 처방약 변경은 담당 의료진과 상의하세요. 운전 중 졸음이 심하거나 깜빡 잠드는 일이 있으면 직접 운전을 피하고 진료를 서두릅니다.",
  "prepare": [
    "아침 턱·치아 불편과 낮 졸림이 생활에 미치는 영향",
    "동거인이 관찰한 호흡 멈춤·헐떡임·코골이와 대략적인 빈도",
    "기존 검사 결과·사용 중인 장치·복용약, 안전한 이동 방법"
  ],
  "localHeading": "서산에서 이갈이와 코골이 상담을 준비한다면",
  "localAdvice": "서울비디치과는 천안 불당동에서 진료합니다. 서산에서 방문 전 치아 불편과 함께 코골이·낮 졸림을 알리고, 치과에서 평가할 범위와 별도 수면 진료가 필요한지 문의하세요. 수면검사나 호흡 치료를 이곳에서 모두 제공한다고 가정하지 않습니다. 졸음이 심하다면 장거리 직접 운전 대신 동행이나 다른 교통편을 준비하세요.",
  "related": [
    {
      "title": "이갈이 장치를 고민할 때 확인할 내용",
      "href": "/guide/regret/bruxism"
    },
    {
      "title": "턱에서 소리만 날 때의 고민",
      "href": "/concerns/jaw-clicking-without-pain"
    },
    {
      "title": "처음 방문할 치과에서 확인할 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "서산에서 방문 전 준비",
      "href": "/area/seosan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국 국립치의학연구소 NIDCR · 이갈이의 검사와 치아 보호",
      "href": "https://www.nidcr.nih.gov/health-info/bruxism"
    },
    {
      "title": "미국 국립심장폐혈액연구소 NHLBI · 수면무호흡 증상",
      "href": "https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms"
    },
    {
      "title": "미국 국립심장폐혈액연구소 NHLBI · 수면무호흡의 호흡·구강장치 치료",
      "href": "https://www.nhlbi.nih.gov/health/sleep-apnea/treatment"
    },
    {
      "title": "NHS · 수면무호흡의 진료와 졸림 안전 안내",
      "href": "https://www.nhs.uk/conditions/sleep-apnoea/"
    }
  ],
  "updated": "2026-09-28",
  "publishedAt": "2026-09-28T09:00:00+09:00"
},
{
  "slug": "bad-breath-despite-brushing-afraid-to-talk",
  "title": "양치를 해도 입냄새가 신경 쓰여서, 가까이서 말하기가 두려워요.",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "입냄새",
  "concern": "사람을 만날 때 자꾸 입을 가려요",
  "description": "천안에서 양치 후에도 계속되는 입냄새 때문에 대화가 부담스러운 분을 위한 구취 상담 준비, 구강 원인 확인과 다른 진료가 필요한 경우의 안내입니다.",
  "situation": "양치와 가글을 반복하는데도 입냄새가 나는 것 같아 말할 때 거리를 둡니다. 천안에서 구취 상담을 받아보고 싶지만, 냄새 이야기를 꺼내는 것부터 부끄럽습니다.",
  "answer": "입냄새가 지속되면 치아·잇몸·혀와 입마름 등을 먼저 살펴보고, 확인된 원인에 맞춰 관리합니다. 냄새가 걱정된다는 느낌만으로 원인이나 강도를 확정할 수 없고, 구강 상태에 따라 다른 진료가 필요할 수도 있습니다. 양치 횟수를 무작정 늘리는 것보다 무엇을 확인했는지 설명받는 것이 좋습니다.",
  "checks": [
    "언제부터 신경 쓰였고 아침·공복·식후 등 특정 시간과 관계있는지 정리합니다.",
    "잇몸 출혈, 음식 끼임, 입마름, 코·목 불편과 역류 증상이 있는지 전달합니다.",
    "복용약과 사용 중인 치약·가글을 알려주고, 진료 전 준비 방법은 예약한 기관에 확인합니다."
  ],
  "choices": [
    {
      "condition": "잇몸·치아 문제나 관리가 어려운 부위가 확인되면",
      "option": "해당 부위 치료와 일상 관리 방법을 함께 정합니다.",
      "limit": "스케일링 한 번으로 모든 구취가 없어지는 것은 아닙니다."
    },
    {
      "condition": "입마름이나 보철·틀니 관리 문제가 함께 있다면",
      "option": "복용약과 구강 상태를 살펴 개인에게 맞는 관리 방법을 상담합니다.",
      "limit": "약을 임의로 끊거나 세정제를 더 강하게 쓰지 않습니다."
    },
    {
      "condition": "구강 검사만으로 설명되지 않거나 코·목·소화기 증상이 동반되면",
      "option": "필요한 진료과와 추가 확인 순서를 상의합니다.",
      "limit": "냄새만으로 위장병이나 특정 전신질환을 진단하지 않습니다."
    }
  ],
  "unknown": "냄새의 느낌, 주변 사람의 반응, 손이나 마스크에 남은 냄새만으로 질환을 판정할 수 없습니다. 잇몸이 붓거나 피가 나고 치통이 있다면 구취 제품만 바꾸며 진료를 미루지 마세요.",
  "prepare": [
    "냄새가 신경 쓰이는 시간과 함께 느끼는 증상",
    "복용약·가글·치약 이름과 최근 치과 치료 이력",
    "다른 사람이 직접 말한 적이 있는지와 일상에서 가장 힘든 상황"
  ],
  "localHeading": "천안에서 입냄새 상담을 준비한다면",
  "localAdvice": "서울비디치과의 진료 장소는 천안 불당동입니다. 예약할 때 구취와 함께 잇몸·혀·입마름을 확인하고 싶다고 알려주세요. 특수 구취 측정 장비가 있거나 한 번에 원인을 확정할 수 있다고 가정하지 말고, 첫 방문에서 가능한 평가와 준비 사항을 확인하세요.",
  "related": [
    {
      "title": "스케일링과 잇몸 관리 가이드",
      "href": "/guide/scaling"
    },
    {
      "title": "잇몸 치료를 고민할 때 확인할 내용",
      "href": "/guide/regret/gum"
    },
    {
      "title": "약을 먹은 뒤 입이 마르고 충치가 늘었을 때",
      "href": "/concerns/dry-mouth-after-medication-new-cavities"
    },
    {
      "title": "천안에서 방문 준비",
      "href": "/area/cheonan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "NHS · 입냄새의 원인과 치과 진료가 필요한 경우",
      "href": "https://www.nhs.uk/symptoms/bad-breath/"
    },
    {
      "title": "미국치과의사협회 ADA · 구취와 입마름·잇몸·가글의 역할",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/bad-breath"
    }
  ],
  "updated": "2026-09-29",
  "publishedAt": "2026-09-29T09:00:00+09:00"
},
{
  "slug": "implant-delayed-because-of-high-blood-sugar",
  "title": "혈당이 높아 임플란트를 미루자는데, 그동안 어떻게 먹고 지내야 하나요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "당뇨와 임플란트",
  "concern": "치료가 미뤄져 식사도 더 어려워졌어요",
  "description": "아산에서 당뇨와 높은 혈당 때문에 임플란트 시기를 고민하는 분을 위한 내과·치과 협의, 기다리는 동안의 씹기 불편과 재평가 준비 안내입니다.",
  "situation": "아산에서 임플란트 상담을 받았는데 혈당을 먼저 관리하자는 설명을 들었습니다. 치아가 없어 식사도 불편한데 언제 다시 치료를 시작할 수 있을지 막막합니다.",
  "answer": "당뇨라는 진단명만으로 임플란트를 영구히 포기한다고 정하지는 않습니다. 혈당 조절 상태와 잇몸·전신 상태를 함께 평가하고, 위험을 낮춘 뒤 수술 시기를 다시 정할 수 있습니다. 수술을 미루는 동안에도 통증·감염 평가와 씹기 불편을 줄일 방법을 별도로 상의해야 합니다.",
  "checks": [
    "최근 당화혈색소 검사 날짜와 결과, 평소 혈당 변화와 저혈당 경험을 전달합니다.",
    "당뇨약·인슐린을 포함한 복용약과 다른 질환, 흡연·잇몸 치료 이력을 알립니다.",
    "수술을 미루는 이유와 다시 평가할 조건, 치과와 당뇨 진료 담당자 사이에 필요한 자료를 확인합니다."
  ],
  "choices": [
    {
      "condition": "혈당 조절이나 활동성 잇몸 문제의 개선이 먼저 필요하다면",
      "option": "담당 의료진과 관리 계획을 세우고 수술 재평가 시점을 정합니다.",
      "limit": "정해진 기간만 기다리면 자동으로 수술할 수 있는 것은 아닙니다."
    },
    {
      "condition": "치아가 없어 식사·말하기 불편이 크다면",
      "option": "치아가 빠진 위치와 주변 상태에 맞는 임시 보철 등 가능한 대안을 상담합니다.",
      "limit": "모든 위치에 같은 임시 방법을 적용하거나 당일 제작할 수 있다고 약속하지 않습니다."
    },
    {
      "condition": "검사와 협의 후 수술을 고려할 수 있는 상태라면",
      "option": "수술 전후 식사·약·경과 관리 계획까지 포함해 진행 여부를 정합니다.",
      "limit": "혈당 수치가 좋아져도 임플란트 결과를 보장하는 것은 아닙니다."
    }
  ],
  "unknown": "모든 환자분에게 적용되는 수술 허용 혈당 숫자를 이 글로 정할 수 없습니다. 임플란트를 빨리 받으려고 굶거나 약·인슐린 용량을 임의로 바꾸지 마세요. 치통·고름·부기가 생기면 혈당 관리가 끝날 때까지 기다리지 말고 의료진에게 알리세요.",
  "prepare": [
    "최근 검사 결과와 검사 날짜, 당뇨 진료 기관",
    "약 이름·복용 방법과 저혈당 경험",
    "현재 먹기 힘든 음식·체중이나 식사량 변화, 기존 임시 보철 여부"
  ],
  "localHeading": "아산에서 당뇨와 임플란트 상담을 준비한다면",
  "localAdvice": "서울비디치과는 천안 불당동에서 진료합니다. 아산에서 방문 전 최근 혈당 검사 자료를 준비할 수 있는지 확인하고, 첫 방문은 수술 가능 여부 평가인지 실제 수술 일정인지 구분해 문의하세요. 당뇨 진료와 치과 일정을 함께 계획하되 자료가 부족하다고 통증·부기 상담을 미루지는 마세요.",
  "related": [
    {
      "title": "임플란트 치료 과정 가이드",
      "href": "/guide/implant"
    },
    {
      "title": "잇몸질환 치료를 고민할 때",
      "href": "/guide/regret/periodontitis"
    },
    {
      "title": "틀니와 식사 기능 회복 가이드",
      "href": "/guide/denture"
    },
    {
      "title": "아산에서 방문 준비",
      "href": "/area/asan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국 국립치의학연구소 NIDCR · 당뇨와 잇몸·회복의 관계",
      "href": "https://www.nidcr.nih.gov/health-info/diabetes"
    },
    {
      "title": "유럽치주학회 EFP · 임플란트 전 혈당·잇몸 위험 평가 권고",
      "href": "https://www.efp.org/fileadmin/uploads/efp/Documents/Other_publications/Clinical_guidelines/peri-implantitis-guideline-01-prevention.pdf"
    },
    {
      "title": "미국치과의사협회 ADA · 당뇨와 치과 관리 협력",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/diabetes"
    },
    {
      "title": "EFP·국제당뇨병연맹 · 구강 수술 전 협력과 씹기 기능 회복 권고",
      "href": "https://www.efp.org/fileadmin/uploads/efp/Documents/Campaigns/Perio_and_Diabetes/Recommendations/recommendations_03-medical.pdf"
    }
  ],
  "updated": "2026-09-29",
  "publishedAt": "2026-09-29T09:00:00+09:00"
},
{
  "slug": "acid-reflux-with-thinning-sensitive-teeth",
  "title": "신물이 자주 올라오는데 앞니가 얇아지고 시려요. 치아부터 씌워야 하나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "역류와 치아 마모",
  "concern": "속도 불편한데 치아까지 상한 것 같아요",
  "description": "홍성에서 신물·속쓰림과 함께 치아가 얇아지고 시린 느낌을 상담하려는 분을 위한 산 부식·마모 평가, 생활 기록과 수복 치료 전 확인 사항입니다.",
  "situation": "홍성에서 지내며 신물이 올라오는 일이 반복됐고, 최근 앞니 끝이 얇아 보이고 찬물도 시립니다. 위장 문제로 치아가 상한 건지, 크라운부터 해야 하는지 걱정됩니다.",
  "answer": "입안으로 올라오는 위산은 치아의 산 부식에 관여할 수 있지만, 시림이나 앞니 모양만으로 역류가 원인이라고 확정하지는 않습니다. 치아 표면의 손상과 진행 여부, 식음료·역류·마모 관련 요인을 함께 평가하고 원인 관리와 필요한 수복의 순서를 정합니다.",
  "checks": [
    "시림과 모양 변화를 언제 처음 느꼈는지, 이전 사진이나 검사 기록이 있는지 살펴봅니다.",
    "신물·속쓰림·구토, 산성 음료를 자주 마시는 습관, 복용약과 입마름을 알립니다.",
    "치아에서 확인되는 손상 범위와 아직 추정인 원인, 관찰·보호·수복의 목적을 구분해 설명받습니다."
  ],
  "choices": [
    {
      "condition": "초기 손상으로 원인 관리와 관찰을 우선할 수 있다면",
      "option": "산 노출을 줄이는 방법과 구강 관리, 재평가 계획을 정합니다.",
      "limit": "없어진 치아 모양이 양치나 영양제로 저절로 되돌아오는 것은 아닙니다."
    },
    {
      "condition": "시림이나 구조·기능 문제로 치아 보호가 필요하다면",
      "option": "상태에 맞는 민감도 관리나 수복 범위를 상담합니다.",
      "limit": "모든 치아를 한꺼번에 씌우는 계획이 자동으로 필요한 것은 아닙니다."
    },
    {
      "condition": "역류 증상이 반복되거나 생활에 영향을 준다면",
      "option": "소화기 증상은 담당 의사에게 평가받고 치과 계획과 함께 조정합니다.",
      "limit": "치과 수복만으로 역류 질환 자체를 치료하지는 않습니다."
    }
  ],
  "unknown": "치아 사진만으로 역류 질환이나 부식 원인을 진단할 수 없습니다. 음식을 삼키기 어렵거나 이유 없이 체중이 줄고 구토가 반복되는 등 다른 증상이 있으면 의과 진료를 미루지 마세요. 처방약은 스스로 끊거나 바꾸지 않습니다.",
  "prepare": [
    "기존 치아 사진·검사 기록과 시림의 시작 시점",
    "신물·속쓰림의 빈도와 현재 치료·약 정보",
    "음료를 마시는 방식과 구강 관리, 수복 치료에서 가장 걱정되는 점"
  ],
  "localHeading": "홍성에서 역류와 치아 마모 상담을 준비한다면",
  "localAdvice": "서울비디치과의 진료 장소는 천안 불당동입니다. 홍성에서 방문 전 신물·속쓰림과 치아 시림을 함께 알리고, 이전 치과 기록과 현재 의과 치료 정보를 준비하세요. 치과 평가와 별도 소화기 진료가 필요한 범위를 구분해 이동 일정을 계획하며, 첫날 보철 치료가 확정된다고 생각하지 않습니다.",
  "related": [
    {
      "title": "크라운을 결정하기 전 확인할 내용",
      "href": "/guide/regret/crown"
    },
    {
      "title": "레진 수복을 고민할 때",
      "href": "/guide/regret/resin"
    },
    {
      "title": "입마름과 새 충치가 함께 걱정될 때",
      "href": "/concerns/dry-mouth-after-medication-new-cavities"
    },
    {
      "title": "홍성에서 방문 준비",
      "href": "/area/hongseong#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "미국치과의사협회 ADA · 치아 산 부식의 평가와 예방·관리",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/dental-erosion"
    },
    {
      "title": "NHS · 위산 역류의 증상과 진료가 필요한 경우",
      "href": "https://www.nhs.uk/conditions/heartburn-and-acid-reflux/"
    },
    {
      "title": "미국치과의사협회 ADA · 산성 식음료와 치아 표면 보호",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/dietary-acids-and-your-teeth"
    }
  ],
  "updated": "2026-09-29",
  "publishedAt": "2026-09-29T09:00:00+09:00"
},
{
  "slug": "swelling-under-jaw-during-meals",
  "title": "밥을 먹으면 턱밑이 붓다가 가라앉아요. 치아 문제인지 모르겠어요.",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "식사 때 턱밑 부기",
  "concern": "예약하려고 하면 가라앉아서 또 미뤘어요",
  "description": "예산에서 식사할 때 반복되는 턱밑·입안 부기로 고민하는 분을 위한 침샘과 치아 원인의 구분, 진료 준비와 신속한 평가가 필요한 증상 안내입니다.",
  "situation": "예산에서 지내며 식사할 때 한쪽 턱밑이 뻐근하게 붓고 시간이 지나면 줄어듭니다. 어금니 때문인지 침샘 때문인지 몰라 치과와 이비인후과 중 어디에 문의할지 망설입니다.",
  "answer": "식사와 함께 반복되는 부기는 침이 나오는 통로의 막힘 등 침샘 문제에서 나타날 수 있지만, 그 양상만으로 침샘돌이라고 확정할 수 없습니다. 위치와 경과, 치아·구강 상태를 확인한 뒤 침샘 진료나 필요한 검사를 안내받습니다. 진료 당일 가라앉았더라도 반복된 사실을 전달하세요.",
  "checks": [
    "붓는 위치와 좌우, 식사 시작과의 관계, 가라앉는 데 걸린 대략적인 시간을 기록합니다.",
    "열·붉어짐·고름 같은 느낌, 치통, 입마름, 삼킴이나 호흡의 어려움을 함께 알립니다.",
    "치과의 구강 평가 범위와 이비인후과·구강악안면외과 등 별도 침샘 진료가 필요한지 확인합니다."
  ],
  "choices": [
    {
      "condition": "치아·잇몸에서 부기의 원인이 확인되면",
      "option": "해당 부위에 필요한 치과 치료를 계획합니다.",
      "limit": "턱밑이 붓는다는 말만으로 치아를 발치하거나 신경치료하지 않습니다."
    },
    {
      "condition": "침샘 통로의 막힘이나 돌이 의심되면",
      "option": "전문 진료에서 검사와 적합한 제거·통로 치료 가능성을 검토합니다.",
      "limit": "모든 경우가 내시경 대상은 아니며 특정 시술의 제공 여부를 별도로 확인합니다."
    },
    {
      "condition": "감염 징후나 지속되는 덩이가 있다면",
      "option": "가라앉기를 기다리기보다 의료진에게 상태를 알려 평가 시점을 앞당깁니다.",
      "limit": "반복되는 부기를 단순 침샘돌로 간주하고 항생제를 스스로 먹지 않습니다."
    }
  ],
  "unknown": "부기가 줄어드는 것만으로 원인이 해결됐다고 볼 수 없습니다. 입·목의 부기로 숨쉬기, 침 삼키기, 말하기가 어려우면 일반 예약을 기다리지 말고 119 또는 가까운 응급실의 도움을 받으세요. 열·고름·심해지는 통증은 당일 의료진에게 알립니다.",
  "prepare": [
    "자연스럽게 부었을 때의 사진과 발생 날짜·식사와의 관계",
    "통증·열·치아 증상·삼킴 상태, 이전 검사나 치료 기록",
    "복용약과 다른 질환, 현재 먹고 마시는 데 어려운 정도"
  ],
  "localHeading": "예산에서 식사 때 턱밑 부기 상담을 준비한다면",
  "localAdvice": "서울비디치과는 천안 불당동에 있습니다. 예산에서 출발하기 전 ‘식사 때 턱밑이 반복해서 붓는다’고 설명하고 구강 평가가 가능한지, 침샘 진료를 위해 다른 기관에 먼저 문의할지 확인하세요. 이곳에서 침샘내시경이나 모든 관련 검사를 제공한다고 가정하지 않습니다. 호흡·삼킴 문제가 있다면 장거리 이동보다 가까운 응급 진료가 우선입니다.",
  "related": [
    {
      "title": "첫 치과 상담에서 확인할 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "영상은 괜찮다는데 어금니가 계속 불편할 때",
      "href": "/concerns/molar-discomfort-normal-xray"
    },
    {
      "title": "약 복용 뒤 입마름이 생겼을 때",
      "href": "/concerns/dry-mouth-after-medication-new-cavities"
    },
    {
      "title": "예산에서 방문 준비",
      "href": "/area/yesan#visit-preparation"
    }
  ],
  "sources": [
    {
      "title": "NHS · 침샘돌의 식사 관련 부기·감염·치료 안내",
      "href": "https://www.nhs.uk/conditions/salivary-gland-stones/"
    },
    {
      "title": "Oxford University Hospitals NHS · 침샘내시경 환자 안내, 2025년 12월",
      "href": "https://www.ouh.nhs.uk/media/3x2hic10/118337sialendoscopy.pdf"
    },
    {
      "title": "NHS · 구강·목 부기와 호흡·삼킴의 응급 기준",
      "href": "https://www.nhs.uk/symptoms/toothache/"
    }
  ],
  "updated": "2026-09-29",
  "publishedAt": "2026-09-29T09:00:00+09:00"
},
{
  "slug": "receding-gums-exposed-roots-brushing-blame",
  "title": "잇몸이 내려가 뿌리가 보여요. 세게 닦은 제 잘못인가요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "잇몸 퇴축",
  "concern": "관리를 열심히 했는데 달라졌어요",
  "description": "당진에서 잇몸 퇴축과 드러난 치아 뿌리, 시린 증상으로 상담을 준비할 때 확인할 원인과 관리·이식 치료의 차이를 정리합니다.",
  "situation": "당진에서 지내며 양치질을 빠뜨리지 않았는데 앞니 잇몸이 내려가고 뿌리가 길게 보입니다. 찬물도 시려서 세게 닦은 탓인지, 잇몸을 다시 덮어야 하는지 걱정됩니다.",
  "answer": "잇몸 퇴축은 칫솔질만의 결과라고 단정할 수 없습니다. 잇몸 염증과 뼈 지지, 조직 두께, 치아 위치와 닦는 습관을 함께 살펴본 뒤 진행을 줄이는 관리와 시림 완화, 필요한 경우 잇몸 이식의 목표를 나누어 정합니다.",
  "checks": [
    "한 치아인지 여러 치아인지, 예전 사진과 비교해 언제부터 달라졌는지 확인합니다.",
    "시림·출혈·흔들림과 잇몸 염증, 치아를 지지하는 조직의 상태를 함께 평가합니다.",
    "평소 칫솔과 닦는 힘·방향을 보여주고, 뿌리 표면의 마모나 충치가 있는지 확인합니다."
  ],
  "choices": [
    {
      "condition": "활동성 염증이나 닦는 습관의 문제가 확인된다면",
      "option": "원인에 맞는 잇몸 치료와 위생 관리를 먼저 조정합니다.",
      "limit": "진행을 관리하는 것과 내려간 잇몸을 원래 높이로 되돌리는 것은 다릅니다."
    },
    {
      "condition": "노출된 뿌리가 시리거나 표면 손상이 함께 있다면",
      "option": "시림 관리와 필요한 수복 치료를 구분해 검토합니다.",
      "limit": "시림의 원인을 확인해야 하며 치약이나 충전만으로 잇몸 자체가 자라지는 않습니다."
    },
    {
      "condition": "조직 보강이나 뿌리 덮기가 필요한 상태라면",
      "option": "잇몸 이식의 기대 범위와 다른 선택을 비교합니다.",
      "limit": "치아 사이 조직과 뼈 상태 등에 따라 덮을 수 있는 범위가 달라집니다."
    }
  ],
  "unknown": "사진만으로 퇴축 원인이나 진행 속도, 이식 필요성을 확정할 수 없습니다. 뿌리가 보인다는 사실만으로 발치가 정해지는 것도 아닙니다.",
  "prepare": [
    "평소 사용하는 칫솔과 치약 이름",
    "잇몸 높이를 비교할 수 있는 과거 사진이나 검진 기록",
    "시림이 생기는 조건과 출혈·흔들림 여부"
  ],
  "localHeading": "당진에서 잇몸 퇴축 상담을 준비한다면",
  "localAdvice": "당진에서 천안으로 이동하기 전 잇몸 퇴축의 위치와 시림 여부를 전달하세요. 첫 진찰과 이식 수술을 같은 일정으로 가정하지 말고, 검사 뒤 필요한 치료와 재점검을 나누어 확인하면 좋습니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다.",
  "related": [
    {
      "title": "잇몸 치료를 결정하기 전 확인할 점",
      "href": "/guide/regret/gum"
    },
    {
      "title": "치주염 치료와 관리에 대한 고민",
      "href": "/guide/regret/periodontitis"
    },
    {
      "title": "당진에서 방문을 준비하는 분께",
      "href": "/area/dangjin"
    }
  ],
  "sources": [
    {
      "title": "유럽치주학회 EFP · 잇몸 퇴축과 치주질환에 관한 질문",
      "href": "https://www.efp.org/for-patients/gum-diseases/faqs/"
    },
    {
      "title": "케임브리지대학병원 NHS · 잇몸 이식의 원인 평가·효과와 한계 (2025)",
      "href": "https://www.cuh.nhs.uk/patient-information/gum-grafting-procedure/"
    },
    {
      "title": "미국치주학회 AAP · 잇몸 이식 등 치주 수술 안내",
      "href": "https://www.perio.org/for-patients/periodontal-treatments-and-procedures/surgical-procedures/"
    },
    {
      "title": "영국치주학회 BSP · 시린 치아의 원인 감별과 관리 (2023)",
      "href": "https://www.bsperio.org.uk/assets/downloads/Hypersensitivity_leaflet_v3-Final_Vanessa.pdf"
    }
  ],
  "updated": "2026-09-30",
  "publishedAt": "2026-09-30T09:00:00+09:00"
},
{
  "slug": "root-canal-recommended-without-toothache",
  "title": "아프지 않은 어금니를 신경치료하자는데, 꼭 해야 하나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "신경치료",
  "concern": "증상이 없는데 치료를 권유받았어요",
  "description": "서산에서 통증 없는 어금니의 신경치료 권유를 받은 분을 위해 진단 근거, 치수 보존 가능성, 다른 의견을 들을 때 필요한 질문을 정리합니다.",
  "situation": "서산에서 검진을 받다가 아프지 않은 어금니에 깊은 충치가 있어 신경치료가 필요하다는 설명을 들었습니다. 멀쩡하게 쓰던 치아를 치료해야 하는 이유와 다른 선택이 있는지 알고 싶습니다.",
  "answer": "통증 유무만으로 신경치료의 필요성을 정하지 않습니다. 치아 내부 조직인 치수와 뿌리 주변의 상태, 충치 범위와 수복 가능성을 함께 확인해야 합니다. 치수가 살아 있다면 일부 경우 보존 치료를 검토할 수 있으나 모든 치아에 적용되는 것은 아닙니다.",
  "checks": [
    "치수와 뿌리 주변에 각각 어떤 진단이 내려졌고, 그 근거가 무엇인지 묻습니다.",
    "방사선사진 외에 온도 반응·두드림 검사 등 어떤 결과를 함께 판단했는지 확인합니다.",
    "치수를 보존할 가능성과 신경치료가 필요한 이유, 치료 후 남은 치아를 보호할 계획을 나누어 듣습니다."
  ],
  "choices": [
    {
      "condition": "치수가 살아 있고 보존 치료에 적합한 조건이라면",
      "option": "충치 치료와 치수 보존 방법을 검토합니다.",
      "limit": "치료 중 확인되는 조직 상태와 이후 경과에 따라 계획이 달라질 수 있습니다."
    },
    {
      "condition": "치수 괴사나 감염 등으로 근관치료가 필요하고 치아를 살릴 수 있다면",
      "option": "치아 내부를 치료한 뒤 수복하는 계획을 세웁니다.",
      "limit": "통증이 없더라도 치료가 필요할 수 있으며 방문 횟수는 개별 확인 사항입니다."
    },
    {
      "condition": "검사 결과가 분명하지 않거나 설명을 더 확인해야 한다면",
      "option": "재평가나 추가 의견을 통해 진단 근거를 정리합니다.",
      "limit": "기다려도 되는 상태인지와 재진 시점을 먼저 확인해야 합니다."
    }
  ],
  "unknown": "엑스레이 한 장이나 현재 아프지 않다는 사실만으로 신경치료가 꼭 필요하다거나 불필요하다고 단정할 수 없습니다. 치수 보존과 근관치료 모두 개별 진단과 경과 확인이 필요합니다.",
  "prepare": [
    "권유받은 치아의 위치와 진단·치료계획 메모",
    "기존 영상과 큰 충전·치아 손상 이력이 있다면 자료",
    "예전에 아팠던 시점과 현재 반응, 복용약 정보"
  ],
  "localHeading": "서산에서 신경치료의 다른 의견을 구한다면",
  "localAdvice": "서산에서 천안으로 이동하기 전 ‘통증 없는 어금니에 신경치료를 권유받아 진단 설명을 듣고 싶다’고 알려주세요. 평가와 치료 시작을 같은 날로 단정하지 말고, 기존 영상을 가져오는 방법과 방문 계획을 확인하세요. 서울비디치과는 천안 불당동에서 진료합니다.",
  "related": [
    {
      "title": "신경치료의 과정과 확인 사항",
      "href": "/guide/root-canal"
    },
    {
      "title": "신경치료와 임플란트를 비교할 때",
      "href": "/guide/compare/root-canal-vs-implant"
    },
    {
      "title": "서산에서 방문 준비하기",
      "href": "/area/seosan"
    }
  ],
  "sources": [
    {
      "title": "미국근관치료학회 AAE · 치수·치근단 진단의 종합 평가",
      "href": "https://www.aae.org/specialty/wp-content/uploads/sites/2/2023/12/Fall2013-EndoDiagnosis.pdf"
    },
    {
      "title": "미국근관치료학회 AAE · 생활치수치료 입장문 (2021)",
      "href": "https://www.aae.org/wp-content/uploads/2021/05/VitalPulpTherapy_PositionStatement_v2.pdf"
    },
    {
      "title": "NHS · 신경치료의 필요성과 치료 과정",
      "href": "https://www.nhs.uk/tests-and-treatments/root-canal-treatment/"
    },
    {
      "title": "미국근관치료학회 AAE · 환자를 위한 신경치료 안내",
      "href": "https://www.aae.org/patients/root-canal-treatment/what-is-a-root-canal/"
    }
  ],
  "updated": "2026-09-30",
  "publishedAt": "2026-09-30T09:00:00+09:00"
},
{
  "slug": "permanent-front-tooth-not-coming-after-baby-tooth",
  "title": "아이 위앞니가 빠진 뒤 새 이가 몇 달째 안 나와요. 더 기다려도 되나요?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "영구치 맹출 지연",
  "concern": "기다려도 되는지 모르겠어요",
  "description": "천안에서 아이의 위앞니 영구치 맹출 지연을 걱정하는 보호자를 위해 좌우 차이와 발달 순서, 검사와 관찰·치료 계획을 설명합니다.",
  "situation": "천안에서 초등학생 아이를 키우고 있습니다. 위쪽 유치 앞니가 빠진 뒤 몇 달이 지났는데 새 이가 보이지 않습니다. 반대쪽은 올라와 있어 계속 기다려도 되는지, 유치를 너무 일찍 뺀 탓인지 걱정됩니다.",
  "answer": "유치가 빠진 뒤 지난 기간만으로 정상이나 이상을 정하지 않습니다. 반대편 앞니가 나온 시점과 다른 치아의 발달 순서, 영구치의 존재·위치·나올 공간을 함께 확인한 뒤 관찰할지, 방해 요소나 공간 문제를 치료할지 판단합니다.",
  "checks": [
    "어느 위앞니가 언제 빠졌고 반대편 영구치는 언제 보이기 시작했는지 정리합니다.",
    "예전에 앞니를 부딪친 일과 유치를 뺀 이유, 이전 치과 영상을 확인합니다.",
    "입안 검사와 필요한 영상으로 새 치아의 위치와 방향, 공간과 방해 요소를 평가합니다."
  ],
  "choices": [
    {
      "condition": "발달 상태와 나올 경로가 관찰에 적합하다면",
      "option": "재진 날짜와 비교할 항목을 정해 경과를 봅니다.",
      "limit": "정확히 어느 날 나올지 보장할 수 없으며 변화가 없으면 계획을 다시 평가합니다."
    },
    {
      "condition": "나올 공간이 부족하거나 경로를 막는 요소가 있다면",
      "option": "공간을 마련하거나 확인된 방해 요소를 다루는 치료를 검토합니다.",
      "limit": "원인을 해결해도 자연스럽게 나올지와 추가 치료 필요성은 경과를 봐야 합니다."
    },
    {
      "condition": "치아 위치나 방향 때문에 스스로 나오기 어렵다면",
      "option": "필요한 진료과와 수술적 노출·교정적 유도 등을 논의합니다.",
      "limit": "모든 맹출 지연에 수술이나 전체 교정이 필요한 것은 아닙니다."
    }
  ],
  "unknown": "이 글은 위쪽 영구치 앞니가 늦게 보이는 상황을 다룹니다. 유치가 빠진 뒤 일정 개월이 지났다는 이유만으로 과잉치·매복·치아 결손을 확정하거나 치료 시기를 획일적으로 정할 수 없습니다.",
  "prepare": [
    "유치가 빠진 시기와 반대편 앞니가 나온 시기의 메모",
    "앞니 외상·발치·치료 이력과 기존 영상이 있다면 사본",
    "아이의 학교 일정과 진료에서 특히 두려워하는 부분"
  ],
  "localHeading": "천안에서 영구치 맹출 지연 상담을 준비한다면",
  "localAdvice": "천안에서 영구치 맹출 지연 상담을 예약할 때 아이 나이와 어느 위앞니가 안 나오는지 알려주세요. 첫 방문은 발달 상태를 확인하는 과정으로 준비하고, 필요한 영상이나 추가 진료는 검사 뒤 상의하세요. 서울비디치과의 진료 장소는 천안 불당동입니다.",
  "related": [
    {
      "title": "교정 상담에서 확인할 치료 범위",
      "href": "/guide/orthodontics"
    },
    {
      "title": "천안에서 치과를 선택할 때 확인할 점",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "천안 지역 방문 안내",
      "href": "/area/cheonan"
    }
  ],
  "sources": [
    {
      "title": "영국왕립외과학회 RCS · 맹출하지 않은 위앞니의 평가와 관리 (2022 갱신본)",
      "href": "https://www.rcseng.ac.uk/-/media/Files/RCS/FDS/Management-of-Unerupted-Maxillary-Incisors-2022-update.pdf"
    },
    {
      "title": "미국치과의사협회 ADA · 유치·영구치의 맹출 시기 안내",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/eruption-charts"
    },
    {
      "title": "미국치과의사협회 ADA · 어린이 치아의 공간 유지",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/space-maintainers"
    }
  ],
  "updated": "2026-09-30",
  "publishedAt": "2026-09-30T09:00:00+09:00"
},
{
  "slug": "missing-tooth-bridge-or-implant-healthy-neighbors",
  "title": "치아 하나가 없는데, 브리지를 하려면 멀쩡한 옆 치아도 깎아야 하나요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "브리지·임플란트",
  "concern": "빈자리를 채우려다 다른 치아까지 손댈까 두려워요",
  "description": "아산에서 치아 한 개의 빈자리를 브리지·임플란트로 치료하려는 분을 위해 옆 치아 삭제, 접착성 브리지, 수술과 유지 관리의 차이를 설명합니다.",
  "situation": "아산에서 지내며 빠진 치아 하나를 치료하려 합니다. 브리지는 옆 치아를 깎을 수 있다고 하고 임플란트는 수술이 부담됩니다. 멀쩡한 치아를 지키면서 선택하려면 무엇을 비교해야 할지 궁금합니다.",
  "answer": "전통적인 브리지는 지지할 옆 치아를 다듬어 씌우는 경우가 많지만, 적합한 조건에서는 삭제를 줄이는 접착성 브리지도 검토할 수 있습니다. 옆 치아 상태와 맞물림, 빈자리 위치, 수술 가능성 및 관리 부담을 확인한 뒤 임플란트 등과 비교합니다.",
  "checks": [
    "양옆 치아가 실제로 건강한지, 이미 큰 충전이나 크라운이 있는지 확인합니다.",
    "제안받은 브리지가 어떤 종류이고 어느 치아를 얼마나 치료하는지 설명받습니다.",
    "임플란트의 뼈·잇몸과 전신 상태 평가, 각 방법의 유지 관리와 추가 치료 가능성을 비교합니다."
  ],
  "choices": [
    {
      "condition": "지지할 치아가 이미 크라운이나 큰 수복을 필요로 한다면",
      "option": "전통적인 브리지가 적합한지 검토합니다.",
      "limit": "지지 치아의 충치·치수·잇몸 상태와 장기 관리 부담을 함께 봐야 합니다."
    },
    {
      "condition": "삭제를 줄이는 접착성 브리지에 적합한 조건이라면",
      "option": "옆 치아에 붙이는 방식의 장점과 한계를 비교합니다.",
      "limit": "위치와 맞물림 등에 따라 적용이 어렵거나 탈락이 생길 수 있습니다."
    },
    {
      "condition": "옆 치아를 보존하며 임플란트를 고려한다면",
      "option": "수술 가능성과 필요한 준비, 회복 및 보철 계획을 평가합니다.",
      "limit": "수술·주변 조직의 위험과 지속적인 관리가 있으며 누구에게나 적합하지는 않습니다."
    }
  ],
  "unknown": "브리지와 임플란트의 이름만으로 어느 쪽이 항상 더 보존적이거나 오래 간다고 정할 수 없습니다. 검사 없이 삭제량, 뼈 이식 여부, 총비용과 완료 시점을 확정할 수는 없습니다.",
  "prepare": [
    "치아가 빠진 시기와 이유, 기존 영상이 있다면 사본",
    "옆 치아의 충전·크라운·신경치료 이력",
    "수술·비용·방문 일정·관리 중 가장 부담되는 부분"
  ],
  "localHeading": "아산에서 브리지·임플란트를 비교하려면",
  "localAdvice": "아산에서 브리지·임플란트 상담을 준비할 때 빈자리 위치와 옆 치아 치료 이력을 알려주세요. 첫 방문에서 선택지별 치료 범위와 이후 일정을 설명받고 이동 계획을 세우면 좋습니다. 서울비디치과의 진료 장소는 천안 불당동이며, 특정 방법의 당일 완료를 보장하지 않습니다.",
  "related": [
    {
      "title": "브리지와 임플란트 선택 기준",
      "href": "/guide/compare/bridge-vs-implant"
    },
    {
      "title": "브리지 치료 전 다시 확인할 점",
      "href": "/guide/regret/bridge"
    },
    {
      "title": "임플란트 치료 가이드",
      "href": "/guide/implant"
    }
  ],
  "sources": [
    {
      "title": "리즈교육병원 NHS · 일반·접착성 브리지와 대안 (2025)",
      "href": "https://www.leedsth.nhs.uk/patients/resources/bridges/"
    },
    {
      "title": "미국치과의사협회 ADA · 브리지와 지지 치아 관리",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/bridges"
    },
    {
      "title": "미국 FDA · 임플란트의 적합성·위험·유지 관리",
      "href": "https://www.fda.gov/medical-devices/dental-devices/dental-implants-what-you-should-know"
    }
  ],
  "updated": "2026-09-30",
  "publishedAt": "2026-09-30T09:00:00+09:00"
},
{
  "slug": "loose-front-tooth-can-it-be-saved",
  "title": "앞니가 흔들려요. 잇몸 치료로 살릴 수 있을까요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "잇몸 치료",
  "concern": "이를 빼야 할까 봐 두려워요",
  "description": "홍성에서 앞니 흔들림과 발치 걱정으로 상담을 준비할 때, 잇몸·뼈 검사와 보존 가능성, 치료 후 재평가와 방문 계획을 정리합니다.",
  "situation": "앞니가 움직이는 것 같아 혀로 자꾸 확인하게 됩니다. 홍성에서 잇몸 치료 상담을 알아보지만 바로 발치를 권할까 봐 예약을 망설입니다.",
  "answer": "앞니가 흔들린다는 사실만으로 발치를 결정하지는 않습니다. 치아를 지지하는 잇몸·뼈, 맞물림과 다른 손상 여부를 검사하고 보존을 시도할 조건과 한계를 함께 판단합니다.",
  "checks": [
    "흔들림을 처음 느낀 시기, 부딪힘과 통증·출혈 여부를 알립니다.",
    "잇몸 주머니·출혈·치아 움직임·맞물림·영상에서 보이는 뼈 상태를 함께 확인합니다.",
    "보존 치료의 목표와 다시 평가할 시점, 발치 판단을 바꿀 조건을 묻습니다."
  ],
  "choices": [
    {
      "condition": "보존 치료를 시도할 조건이 있으면",
      "option": "상태에 맞는 치주 치료와 관리 후 반응을 다시 평가합니다.",
      "limit": "치료 후 움직임이 완전히 사라지거나 소실된 지지가 모두 회복된다고 보장하지 않습니다."
    },
    {
      "condition": "치아를 유지하기 어렵다고 판단되면",
      "option": "그 판단의 근거와 다른 평가 가능성, 빈자리의 중간 대책을 상담합니다.",
      "limit": "흔들림 정도 하나나 온라인 사진만으로 발치를 확정할 수 없습니다."
    }
  ],
  "unknown": "이 글은 서서히 느낀 성인 자연치 앞니의 흔들림 상담을 위한 안내입니다. 충격 직후 치아가 움직이거나 위치가 변한 상황은 외상 평가가 우선입니다.",
  "prepare": [
    "증상 시작 시점과 외상·교정·치주 치료 이력",
    "복용약과 전신질환 정보, 이전 영상이 있다면 사본",
    "발치·외형·식사·이동 중 가장 걱정되는 점"
  ],
  "localHeading": "홍성에서 앞니 흔들림 상담을 준비한다면",
  "localAdvice": "홍성에서 천안 불당동으로 방문하기 전 앞니 위치, 시작 시점, 붓기와 외상 여부를 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 첫 평가와 이후 치주 치료·재평가 일정은 나누어 확인하세요.",
  "related": [
    {
      "title": "치주염 치료를 고민할 때",
      "href": "/guide/regret/periodontitis"
    },
    {
      "title": "잇몸 치료 가이드",
      "href": "/guide/regret/gum"
    },
    {
      "title": "잇몸이 내려가 뿌리가 보일 때",
      "href": "/concerns/receding-gums-exposed-roots-brushing-blame"
    }
  ],
  "sources": [
    {
      "title": "미국 NIH NIDCR · 치주질환의 증상·검사·치료",
      "href": "https://www.nidcr.nih.gov/health-info/gum-disease"
    },
    {
      "title": "미국치주학회 AAP · 치주 진료에서 확인하는 항목",
      "href": "https://www.perio.org/for-patients/what-is-a-periodontist/"
    },
    {
      "title": "미국치주학회 AAP · 비수술 치주 치료와 유지 관리",
      "href": "https://www.perio.org/for-patients/periodontal-treatments-and-procedures/non-surgical-treatments/"
    }
  ],
  "updated": "2026-10-01",
  "publishedAt": "2026-10-01T09:00:00+09:00"
},
{
  "slug": "root-canal-finished-crown-cost-delay",
  "title": "신경치료는 끝났는데 크라운 비용이 부담돼요. 씌우는 치료를 미뤄도 될까요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "신경치료",
  "concern": "마무리 치료의 비용과 일정이 부담돼요",
  "description": "예산에서 신경치료 후 크라운 비용 때문에 마무리를 망설일 때, 내부 치료와 최종 수복의 차이, 지연 상담과 임시 상태의 주의점을 정리합니다.",
  "situation": "신경치료를 받고 통증은 줄었지만 씌우는 치료 비용이 걱정됩니다. 예산에서 여러 차례 방문한 뒤라 일정을 더 내기도 어려워 몇 달 뒤로 미뤄도 되는지 궁금합니다.",
  "answer": "신경치료가 끝나도 치아를 밀폐하고 씹는 힘에서 보호하는 최종 수복이 남을 수 있습니다. 미뤄도 되는 기간을 일괄 정할 수 없으므로 현재 임시 재료와 남은 치아 상태를 확인하고, 비용·일정 제약을 알린 뒤 마무리 계획을 잡으세요.",
  "checks": [
    "신경치료가 실제로 끝났는지, 현재 위쪽을 막은 재료가 무엇인지 확인합니다.",
    "남은 치아 양과 위치에 맞는 수복 범위, 크라운을 권하는 이유를 묻습니다.",
    "지연이 불가피하면 임시 관리와 재점검 시점, 연락해야 할 증상을 구체적으로 정합니다."
  ],
  "choices": [
    {
      "condition": "최종 수복을 바로 계획할 수 있으면",
      "option": "치아 상태에 맞는 보호 방법과 일정을 정합니다.",
      "limit": "모든 신경치료 치아에 똑같은 수복 방식이 필요한 것은 아닙니다."
    },
    {
      "condition": "비용이나 방문 제약으로 지연이 불가피하면",
      "option": "치료한 치과에 먼저 알리고 현재 상태의 점검과 단계별 계획을 상담합니다.",
      "limit": "임시 상태를 장기간 안전하게 유지할 수 있다고 약속할 수는 없습니다."
    }
  ],
  "unknown": "며칠 또는 몇 달이라는 공통 안전기간, 비용·분납·보험 적용이나 당일 제작 가능 여부는 이 글에서 확정할 수 없습니다.",
  "prepare": [
    "치료한 치아 위치와 마지막 신경치료 날짜",
    "현재 임시 재료·코어·크라운 설명 및 견적서가 있다면 준비",
    "방문 가능한 일정과 가장 부담되는 비용 단계"
  ],
  "localHeading": "예산에서 신경치료 마무리를 준비한다면",
  "localAdvice": "예산에서 천안 불당동으로 방문하기 전 마지막 치료 날짜와 임시 재료의 이상 여부를 전달하세요. 서울비디치과의 진료 장소는 천안 불당동이며, 첫 확인과 보철 제작·장착 일정을 각각 문의할 수 있습니다.",
  "related": [
    {
      "title": "신경치료 가이드",
      "href": "/guide/root-canal"
    },
    {
      "title": "크라운 치료를 결정하기 전",
      "href": "/guide/regret/crown"
    },
    {
      "title": "임시 크라운이 빠졌을 때",
      "href": "/concerns/temporary-crown-fell-out-before-next-visit"
    }
  ],
  "sources": [
    {
      "title": "미국근관치료학회 AAE · 치료 후 관리와 최종 수복",
      "href": "https://www.aae.org/patients/your-office-visit/post-treatment-care/"
    },
    {
      "title": "미국근관치료학회 AAE · 신경치료와 치아 수복 과정",
      "href": "https://www.aae.org/patients/root-canal-treatment/what-is-a-root-canal/root-canal-explained/"
    },
    {
      "title": "미국근관치료학회 AAE · 수복 지연·누출과 재치료",
      "href": "https://www.aae.org/patients/root-canal-treatment/endodontic-treatment-options/endodontic-retreatment/"
    },
    {
      "title": "영국 NHS · 신경치료와 충전·크라운",
      "href": "https://www.nhs.uk/tests-and-treatments/root-canal-treatment/"
    }
  ],
  "updated": "2026-10-01",
  "publishedAt": "2026-10-01T09:00:00+09:00"
},
{
  "slug": "baby-molar-cavity-treat-before-falling-out",
  "title": "어차피 빠질 유치인데, 충치를 꼭 치료해야 하나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "소아 충치",
  "concern": "아이에게 필요한 치료인지 모르겠어요",
  "description": "당진에서 아이 유치 어금니 충치 상담을 준비할 때, 교환 시기·충치 진행·통증과 치료 부담을 함께 비교하고 관찰과 수복의 조건을 정리합니다.",
  "situation": "아이 유치 어금니에 충치가 있다는 말을 들었습니다. 당진에서 치료를 위해 이동해야 하고 아이도 치과를 무서워해 빠질 때까지 기다려도 되는지 고민합니다.",
  "answer": "유치는 빠질 치아라도 그때까지 씹고 말하며 영구치가 나올 길을 유지하는 역할이 있습니다. 모든 충치를 같은 방법으로 치료하지는 않으며, 교환까지 남은 시간과 충치의 깊이·진행, 증상과 아이의 진료 적응을 함께 평가합니다.",
  "checks": [
    "해당 치아가 유치인지와 교환까지의 예상 경과를 확인합니다.",
    "충치의 깊이·구멍·진행 여부와 통증·감염 징후를 구분합니다.",
    "관찰한다면 관리 방법과 재검 시점을, 치료한다면 방식과 방문 단계를 묻습니다."
  ],
  "choices": [
    {
      "condition": "예방 관리와 관찰이 적합하다고 판단되면",
      "option": "진행 위험에 맞는 관리와 계획된 재검을 이어갑니다.",
      "limit": "빠질 때까지 아무 확인 없이 기다린다는 뜻은 아닙니다."
    },
    {
      "condition": "치아를 수복할 필요가 있으면",
      "option": "남은 구조와 병변 범위에 맞춰 충전이나 크라운 등을 검토합니다.",
      "limit": "치아마다 필요한 범위가 다르며 모든 유치에 크라운이 필요한 것은 아닙니다."
    }
  ],
  "unknown": "유치라는 이유만으로 치료가 불필요하지도, 충치라는 말만으로 모두 크게 깎아야 하지도 않습니다. 보호자가 보이는 색이나 아이의 통증 표현만으로 치료 범위를 확정할 수 없습니다.",
  "prepare": [
    "아이 나이와 불편이 시작된 때, 식사·수면의 변화",
    "이전 영상·치료 계획·복용약과 알레르기 정보",
    "아이의 두려움과 방문 가능한 일정"
  ],
  "localHeading": "당진에서 유치 충치 상담을 준비한다면",
  "localAdvice": "당진에서 천안 불당동으로 오기 전 아이 나이, 아픈 위치, 붓기와 밤에 깨는 증상 여부를 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 검사와 실제 치료의 범위, 추가 방문 가능성을 먼저 확인하세요.",
  "related": [
    {
      "title": "충치 치료를 결정하기 전",
      "href": "/guide/regret/cavity"
    },
    {
      "title": "아이 영구치 어금니가 누렇고 부서질 때",
      "href": "/concerns/child-new-molar-yellow-and-crumbling"
    },
    {
      "title": "당진에서 방문 준비",
      "href": "/area/dangjin"
    }
  ],
  "sources": [
    {
      "title": "미국소아치과학회 AAPD · 유치의 역할과 보호자 질문",
      "href": "https://www.aapd.org/resources/parent/faq/"
    },
    {
      "title": "미국소아치과학회 AAPD · 소아 수복 치료 권고",
      "href": "https://www.aapd.org/research/oral-health-policies--recommendations/pediatric-restorative-dentistry/"
    },
    {
      "title": "미국소아치과학회 AAPD · 충치 위험 평가와 개별 관리",
      "href": "https://www.aapd.org/research/oral-health-policies--recommendations/caries-risk-assessment-and-management-for-infants-children-and-adolescents/"
    },
    {
      "title": "미국소아치과학회 AAPD · 어린이 충치 치료 정책 자료",
      "href": "https://www.aapd.org/globalassets/media/policy-center/treatingtoothdecay.pdf"
    }
  ],
  "updated": "2026-10-01",
  "publishedAt": "2026-10-01T09:00:00+09:00"
},
{
  "slug": "sharp-pain-when-releasing-bite-cracked-tooth",
  "title": "씹었다가 힘을 뺄 때 찌릿해요. 금이 갔다면 무조건 뽑아야 하나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "치아 균열",
  "concern": "금이 갔다는 말에 발치부터 떠올라요",
  "description": "서산에서 씹고 힘을 뺄 때 찌릿한 통증과 치아 균열을 걱정한다면, 검사로 확인할 범위와 보존·발치 판단, 단계별 치료 계획을 정리해 보세요.",
  "situation": "평소에는 괜찮다가 음식을 씹고 힘을 뺄 때 한 번씩 찌릿합니다. 서산에서 치아 균열 검사를 알아보지만 금이 갔다는 말을 들으면 바로 뽑아야 할까 봐 두렵습니다.",
  "answer": "씹거나 힘을 뺄 때의 통증은 균열에서 나타날 수 있지만 그 느낌만으로 확진하지 않습니다. 균열의 형태·범위, 치수와 잇몸 상태, 남은 구조를 함께 평가해 보존 치료 가능성과 한계를 설명받아야 합니다.",
  "checks": [
    "통증이 물 때인지 힘을 뺄 때인지, 차갑거나 뜨거운 것에도 반응하는지 알립니다.",
    "증상·씹기 검사·잇몸 검사·치수 반응·영상 등을 종합해 확인한 점과 불확실한 점을 나눠 듣습니다.",
    "보호 수복·신경치료·발치가 각각 어떤 조건에서 필요한지와 재평가 시점을 묻습니다."
  ],
  "choices": [
    {
      "condition": "수복하여 유지할 조건이 있으면",
      "option": "균열과 남은 치아 상태에 맞는 보호 치료를 상담합니다.",
      "limit": "크라운으로 금이 사라지거나 장기 결과가 보장되는 것은 아닙니다."
    },
    {
      "condition": "치수의 상태가 치료를 필요로 하면",
      "option": "신경치료와 이후 치아 보호를 함께 검토할 수 있습니다.",
      "limit": "통증이나 균열이 있다는 이유만으로 모든 치아에 신경치료를 적용하지는 않습니다."
    },
    {
      "condition": "유지하기 어렵다고 평가되면",
      "option": "발치 판단의 근거와 대안·일정에 대한 설명을 듣습니다.",
      "limit": "집에서 보이는 선이나 통증 양상만으로 이 단계라고 확정할 수 없습니다."
    }
  ],
  "unknown": "이 글은 자연치의 균열 의심 증상에 대한 상담 안내입니다. 실제 균열의 깊이와 치료 가능성, 비용·방문 횟수는 온라인으로 확정할 수 없습니다.",
  "prepare": [
    "어느 쪽에서 어떤 음식·동작 때 아픈지 적은 메모",
    "오래된 충전·크라운·신경치료 여부와 보유한 영상",
    "서산에서 가능한 방문 일정과 치료 선택에서 가장 두려운 점"
  ],
  "localHeading": "서산에서 치아 균열 상담을 준비한다면",
  "localAdvice": "서산에서 천안 불당동으로 방문하기 전 씹을 때와 힘을 뺄 때의 통증, 기존 보철 여부를 알려주세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 첫 평가와 치료·재평가 일정을 나누어 문의하세요.",
  "related": [
    {
      "title": "신경치료 가이드",
      "href": "/guide/root-canal"
    },
    {
      "title": "신경치료와 임플란트를 비교하기 전",
      "href": "/guide/compare/root-canal-vs-implant"
    },
    {
      "title": "어금니가 불편한데 엑스레이는 괜찮다고 할 때",
      "href": "/concerns/molar-discomfort-normal-xray"
    }
  ],
  "sources": [
    {
      "title": "미국근관치료학회 AAE · 치아 균열의 증상과 유형",
      "href": "https://www.aae.org/patients/dental-symptoms/cracked-teeth/"
    },
    {
      "title": "미국근관치료학회 AAE · 균열 검사와 예후 판단의 한계",
      "href": "https://www.aae.org/specialty/cracking-the-cracked-tooth-code-from-unpredictability-to-predictability/"
    },
    {
      "title": "미국근관치료학회 AAE · 균열 치아의 보존 여부를 판단할 때",
      "href": "https://www.aae.org/specialty/cracked-teeth-to-treat-or-not-to-treat/"
    }
  ],
  "updated": "2026-10-01",
  "publishedAt": "2026-10-01T09:00:00+09:00"
},
{
  "slug": "root-canal-fear-after-pain-despite-anesthesia",
  "title": "전에 마취를 해도 아팠어요. 신경치료를 다시 받을 용기가 안 납니다.",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "신경치료",
  "concern": "마취 후에도 아팠던 기억",
  "description": "천안에서 이전 마취 중 통증 때문에 신경치료를 미루고 있다면, 당시 경험을 전달하고 마취 확인·중단 신호·진료 단계를 상의하는 방법을 살펴봅니다.",
  "situation": "천안에서 어금니 신경치료를 권유받았지만 예전에 입술은 얼얼한데 치아는 아팠던 기억 때문에 예약을 망설입니다. 아프다고 말해도 치료를 계속할까 봐 걱정됩니다.",
  "answer": "마취 후 통증을 겪었다는 사실만으로 앞으로도 모든 마취가 안 듣는다고 결론 내리지는 않습니다. 입술의 얼얼함과 치료할 치아의 마취 상태는 같지 않을 수 있습니다. 이전 경험을 미리 알리고, 시작 전 확인 방법과 통증이 생겼을 때 멈추고 재평가하는 계획을 상의하세요.",
  "checks": [
    "어떤 치아의 어느 치료 단계에서 아팠는지, 마취 추가 뒤 변화가 있었는지 확인합니다.",
    "현재 치아의 염증과 통증, 이전 마취 반응 및 복용약을 함께 평가합니다.",
    "치료 시작 전 마취 확인과 중단 신호, 불편 시 다음 조치를 합의합니다."
  ],
  "choices": [
    {
      "condition": "통증이 두려워 진료 자체를 미룬 경우",
      "option": "검사와 설명부터 시작하는 진료 범위를 상의합니다.",
      "limit": "현재 상태에 따라 먼저 필요한 처치가 있을 수 있습니다."
    },
    {
      "condition": "마취 뒤에도 치료 부위에 통증이 있는 경우",
      "option": "진료 중 알리고 마취 상태 및 추가 방법을 재평가합니다.",
      "limit": "환자분이 약 종류나 주사 횟수를 직접 정하지 않습니다."
    },
    {
      "condition": "불안 조절을 위한 진정을 고려하는 경우",
      "option": "적합성·가능한 방법·귀가와 동행 조건을 별도로 상담합니다.",
      "limit": "진정과 국소마취는 목적이 다르며 당일 시행을 보장할 수 없습니다."
    }
  ],
  "unknown": "지난 치료 기록과 현재 검사가 없으면 당시 통증의 원인이나 이번에 필요한 마취 방법을 확정할 수 없습니다.",
  "prepare": [
    "이전 치료 부위와 아팠던 순간을 적은 메모",
    "복용약과 확인된 알레르기·마취 후 이상 반응 기록",
    "검사만 먼저 받고 싶은지, 가장 두려운 단계가 무엇인지"
  ],
  "localHeading": "천안에서 신경치료 상담을 다시 시작한다면",
  "localAdvice": "서울비디치과의 진료 장소는 천안 불당동입니다. 천안에서 신경치료 상담을 예약할 때 과거 마취 후 통증 경험과 설명에 필요한 시간을 알려주세요. 검사·처치 범위와 다음 방문을 구분해 문의할 수 있습니다.",
  "related": [
    {
      "title": "신경치료 과정 이해하기",
      "href": "/guide/root-canal"
    },
    {
      "title": "진정치료와 일반 진료를 비교할 때",
      "href": "/guide/compare/sedation-vs-normal"
    },
    {
      "title": "중간에 멈춘 신경치료를 다시 이어갈 때",
      "href": "/concerns/unfinished-root-canal-after-moving"
    }
  ],
  "sources": [
    {
      "title": "미국근관치료학회 AAE · 치료 중 불편과 마취 조절",
      "href": "https://www.aae.org/patients/root-canal-treatment/myths-root-canals/"
    },
    {
      "title": "미국근관치료학회 AAE · 입술 감각과 치아 마취 확인",
      "href": "https://www.aae.org/specialty/pain-control/"
    },
    {
      "title": "NHS · 국소마취의 목적과 반응 확인",
      "href": "https://www.nhs.uk/tests-and-treatments/local-anaesthesia/"
    },
    {
      "title": "NHS · 치성 농양과 응급 증상",
      "href": "https://www.nhs.uk/conditions/dental-abscess/"
    }
  ],
  "updated": "2026-10-02",
  "publishedAt": "2026-10-02T09:00:00+09:00"
},
{
  "slug": "gums-bleed-only-when-flossing",
  "title": "양치할 때는 괜찮은데 치실만 쓰면 피가 나요. 치실을 끊어야 하나요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "잇몸 관리",
  "concern": "치실 때문에 잇몸을 망친 것 같아요",
  "description": "아산에서 치실 사용 때만 잇몸 출혈이 생겨 청소를 중단할지 고민한다면, 자극과 잇몸 염증을 구분하기 위한 상담과 자신에게 맞는 치간 관리 방법을 살펴봅니다.",
  "situation": "아산에서 잇몸 관리를 시작하려고 치실을 샀는데 사용할 때마다 피가 묻습니다. 양치할 때는 괜찮아 치실로 잇몸에 상처를 낸 것 같고, 더 비싼 세정기를 사야 하는지도 고민됩니다.",
  "answer": "치실 사용 때 피가 난다는 사실만으로 치실이 해롭거나 잇몸 질환이 심하다고 단정하지 않습니다. 사용 방법에 따른 자극과 잇몸 염증 등 여러 가능성을 확인해야 합니다. 반복되거나 걱정될 정도의 출혈은 치과에 알리고, 무리하게 자극하지 않는 치아 사이 청소 방법을 안내받으세요.",
  "checks": [
    "출혈이 한 곳인지 여러 곳인지, 언제부터 반복됐는지 확인합니다.",
    "치실이 잇몸을 세게 때리는지, 치아 사이에서 걸리거나 아픈지 살펴봅니다.",
    "잇몸 상태·치석·보철과 치아 사이 형태, 복용약을 함께 평가합니다."
  ],
  "choices": [
    {
      "condition": "치실이 갑자기 잇몸으로 튀어 들어가는 경우",
      "option": "치아 면을 따라 부드럽게 사용하는 방법을 진료실에서 확인합니다.",
      "limit": "출혈이 모두 사용법 때문이라는 뜻은 아닙니다."
    },
    {
      "condition": "같은 부위 출혈이 반복되는 경우",
      "option": "잇몸과 주변 치아를 검사하고 필요한 관리를 정합니다.",
      "limit": "통증이 없어도 검사 결과 없이 괜찮다고 단정하지 않습니다."
    },
    {
      "condition": "손 조작이 어려워 치실을 계속 포기하는 경우",
      "option": "손잡이형 도구·치간칫솔·구강세정기 등 적합한 방법을 상담합니다.",
      "limit": "공간과 보철 상태에 맞게 선택하며 기기 구입만으로 출혈 원인을 해결하지는 못합니다."
    }
  ],
  "unknown": "사진이나 출혈 여부만으로 잇몸 질환의 단계, 치실 자극의 정도, 필요한 치료 범위를 정할 수 없습니다.",
  "prepare": [
    "평소 쓰는 치실·치간칫솔 또는 제품 사진",
    "피가 나는 위치와 사용 시작 시점, 멎는 양상 메모",
    "복용약과 최근 잇몸 검사·스케일링 시기"
  ],
  "localHeading": "아산에서 잇몸 관리 상담을 준비한다면",
  "localAdvice": "아산에서 천안 불당동으로 방문하기 전 치실 사용 때 출혈이 나는 위치와 빈도를 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 잇몸 관리 도구를 가져와 사용법을 확인받고 검사와 치료 일정을 구분해 상의할 수 있습니다.",
  "related": [
    {
      "title": "스케일링과 이후 관리",
      "href": "/guide/scaling"
    },
    {
      "title": "치실과 치간칫솔을 선택할 때",
      "href": "/guide/compare/floss-vs-interdental-brush"
    },
    {
      "title": "크라운 옆에 음식이 반복해서 낄 때",
      "href": "/concerns/food-stuck-between-crown-and-tooth"
    }
  ],
  "sources": [
    {
      "title": "미국치과의사협회 ADA · 잇몸 출혈의 원인과 상담 시점",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/bleeding-gums"
    },
    {
      "title": "미국치과의사협회 ADA · 부드러운 치실 사용과 치간 청소",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/flossing"
    },
    {
      "title": "미국치과의사협회 ADA · 잇몸 질환과 검사",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/gum-disease"
    },
    {
      "title": "미국치과의사협회 ADA · 구강세정기의 역할",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/water-flossers"
    }
  ],
  "updated": "2026-10-02",
  "publishedAt": "2026-10-02T09:00:00+09:00"
},
{
  "slug": "child-dental-sealant-came-off",
  "title": "아이 어금니에 해 준 실란트가 떨어진 것 같아요. 다시 하면 치아가 상하지 않나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "소아 충치 예방",
  "concern": "예방했는데 다시 치료해야 하나요",
  "description": "홍성에서 아이 어금니 실란트가 떨어진 듯해 걱정된다면, 재료 탈락과 치아 손상을 구분하고 보완·재적용 또는 충치 치료가 필요한 조건을 살펴봅니다.",
  "situation": "홍성에서 아이 어금니 홈 메우기를 했는데 하얗던 부분이 줄고 홈이 다시 보입니다. 예방하려고 한 치료가 오히려 치아를 약하게 한 건지, 다시 비용을 들여야 하는지 걱정됩니다.",
  "answer": "실란트는 어금니 씹는 면의 홈을 보호하는 재료로, 시간이 지나 상태를 확인하고 필요하면 보완하거나 다시 적용할 수 있습니다. 하얀 부분이 줄었다는 것만으로 치아가 상했다고 단정하지 않습니다. 재료가 남은 범위와 치아 표면·충치 여부를 확인한 뒤 다음 관리를 정합니다.",
  "checks": [
    "실란트를 한 날짜와 치아 위치, 보이는 변화와 통증 유무를 확인합니다.",
    "재료 탈락인지 치아 자체의 손상인지, 씹는 면에 충치가 있는지 평가합니다.",
    "아이의 충치 위험과 관리 상황, 다음 점검 시기를 함께 살펴봅니다."
  ],
  "choices": [
    {
      "condition": "재료 일부가 소실되고 치아 상태가 예방 관리에 적합한 경우",
      "option": "필요한 부분의 보완이나 재적용을 상의합니다.",
      "limit": "사진만 보고 모든 치아를 다시 해야 한다고 정하지 않습니다."
    },
    {
      "condition": "초기 충치 변화가 있지만 뚜렷한 구멍이 없는 경우",
      "option": "검사 결과에 따라 실란트 등 비수복적 관리를 검토합니다.",
      "limit": "초기 변화와 진행된 충치의 구분은 진료실에서 해야 합니다."
    },
    {
      "condition": "치아 손상이나 진행된 충치가 확인된 경우",
      "option": "단순 홈 메우기를 넘어 필요한 치료를 설명받습니다.",
      "limit": "실란트를 덧바르는 것만으로 모든 충치를 치료할 수는 없습니다."
    }
  ],
  "unknown": "집에서 보이는 색이나 홈의 모양만으로 재료가 얼마나 남았는지, 충치 깊이와 치료 범위를 결정할 수 없습니다.",
  "prepare": [
    "실란트 시기와 대상 치아를 알 수 있는 기록",
    "변화를 처음 본 시점과 아이가 말한 시림·씹기 불편",
    "기존 충치 치료와 평소 양치·간식 습관"
  ],
  "localHeading": "홍성에서 소아 충치 예방 상담을 준비한다면",
  "localAdvice": "홍성에서 천안 불당동으로 이동하기 전 아이 실란트 시기와 불편 유무를 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 소아 충치 예방 검사와 필요한 처치, 다음 점검을 나누어 문의하면 이동 계획을 세우기 좋습니다.",
  "related": [
    {
      "title": "충치 치료를 결정하기 전 확인할 점",
      "href": "/guide/regret/cavity"
    },
    {
      "title": "새 어금니가 누렇고 부서지는 경우",
      "href": "/concerns/child-new-molar-yellow-and-crumbling"
    },
    {
      "title": "유치 충치를 치료해야 하는지 고민할 때",
      "href": "/concerns/baby-molar-cavity-treat-before-falling-out"
    }
  ],
  "sources": [
    {
      "title": "미국 CDC · 실란트의 예방 역할과 적용 부위",
      "href": "https://www.cdc.gov/oral-health/prevention/about-dental-sealants.html"
    },
    {
      "title": "미국치과의사협회 ADA · 실란트 점검과 재적용",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/sealants"
    },
    {
      "title": "미국소아치과학회 AAPD · 건전한 면과 비와동성 충치의 실란트 지침",
      "href": "https://www.aapd.org/research/oral-health-policies--recommendations/pit_and_fissure_sealants/"
    }
  ],
  "updated": "2026-10-02",
  "publishedAt": "2026-10-02T09:00:00+09:00"
},
{
  "slug": "sleeping-with-dentures-afraid-to-remove",
  "title": "틀니를 빼면 입이 꺼져 보여요. 잘 때도 끼고 있으면 안 되나요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "틀니 관리",
  "concern": "틀니를 빼는 모습이 신경 쓰여요",
  "description": "예산에서 틀니를 빼고 자는 것이 어색하고 불안하다면, 야간 분리의 이유와 발치 직후 예외, 세척·보관·탈착의 어려움을 상담하는 방법을 살펴봅니다.",
  "situation": "예산에서 틀니를 사용하고 있는데 빼면 입 주위가 꺼져 보여 가족 앞에서도 신경이 쓰입니다. 밤새 끼면 안 좋다는 말을 들었지만 없으면 허전하고, 아침에 다시 끼우기 어려울까 걱정됩니다.",
  "answer": "일반적인 탈착식 틀니는 담당 치과의 별도 지시가 없다면 잘 때 빼고 관리하는 것이 권장됩니다. 밤에도 계속 착용하면 잇몸 감염 등 문제가 생길 수 있습니다. 발치 직후 틀니처럼 일정 시간 착용하도록 지시받은 경우는 예외가 있으므로, 내 틀니의 종류와 현재 단계에 맞춰 안내받으세요.",
  "checks": [
    "스스로 빼는 틀니인지 고정 보철인지, 최근 발치나 새 장착이 있었는지 확인합니다.",
    "밤에 빼기 어려운 이유가 외모·불안인지 통증·손 조작 문제인지 나누어 듣습니다.",
    "잇몸과 남은 치아, 틀니의 맞음새 및 세척·보관 방법을 점검합니다."
  ],
  "choices": [
    {
      "condition": "일반 탈착식 틀니를 오래 착용 중인 경우",
      "option": "야간 분리와 세척·보관을 일상에 맞게 계획합니다.",
      "limit": "개별 지시가 있다면 적용 이유와 기간을 확인합니다."
    },
    {
      "condition": "발치 직후 즉시 틀니를 받은 경우",
      "option": "담당 치과가 지시한 초기 착용·분리 시점을 따릅니다.",
      "limit": "첫날 지시를 평생 밤마다 끼라는 의미로 확대하지 않습니다."
    },
    {
      "condition": "빼거나 다시 끼울 때 아프고 잘 안 되는 경우",
      "option": "탈착 방법과 틀니 상태를 진료실에서 확인합니다.",
      "limit": "집에서 갈거나 고리를 구부리고 억지로 당기지 않습니다."
    }
  ],
  "unknown": "입이 꺼져 보인다는 느낌만으로 틀니의 적합성, 잇몸 변화의 원인, 재제작 필요성을 판단할 수 없습니다.",
  "prepare": [
    "현재 틀니와 평소 쓰는 보관통·세정 제품 정보",
    "발치·장착 시기와 기존 야간 착용 지시",
    "빼고 끼울 때의 통증, 손 조작과 생활상의 어려움"
  ],
  "localHeading": "예산에서 틀니 관리 상담을 준비한다면",
  "localAdvice": "예산에서 천안 불당동으로 방문하기 전 밤에 틀니를 빼기 어려운 이유와 탈착 시 통증을 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 틀니 관리 안내와 적합성 검사, 필요한 조정 일정을 구분해 문의할 수 있습니다.",
  "related": [
    {
      "title": "틀니의 종류와 사용 관리",
      "href": "/guide/denture"
    },
    {
      "title": "틀니 치료 후 고민을 상담할 때",
      "href": "/guide/regret/denture"
    },
    {
      "title": "틀니를 끼면 같은 자리가 헐 때",
      "href": "/concerns/denture-sore-same-spot"
    }
  ],
  "sources": [
    {
      "title": "NHS · 틀니 야간 분리와 구강 관리",
      "href": "https://www.nhs.uk/tests-and-treatments/dentures/"
    },
    {
      "title": "Guy’s and St Thomas’ NHS · 발치 직후 착용 예외와 틀니 세척·보관",
      "href": "https://www.guysandstthomas.nhs.uk/health-information/dentures"
    }
  ],
  "updated": "2026-10-02",
  "publishedAt": "2026-10-02T09:00:00+09:00"
},
  {
    "slug": "deep-gum-treatment-after-recent-scaling",
    "title": "스케일링을 했는데 잇몸 속 치료를 또 하자고 해요. 같은 치료를 반복하는 건가요?",
    "region": "당진",
    "areaPath": "/area/dangjin",
    "topic": "잇몸 치료",
    "concern": "이미 치료했는데 또 해야 하나요",
    "description": "당진에서 최근 스케일링 후 추가 잇몸 치료를 권유받았다면, 이전 처치 범위와 치주 검사 결과를 비교하고 방문·비용·마취 계획을 확인하는 방법을 살펴봅니다.",
    "situation": "당진에서 시간을 내 스케일링을 받았는데 잇몸 안쪽을 몇 번 더 치료하자고 합니다. 깨끗하게 했다는 느낌인데 왜 다시 해야 하는지, 치료가 끝없이 이어질지 걱정됩니다.",
    "answer": "일상에서 스케일링이라고 부르는 처치와 잇몸 아래 치주질환을 치료하는 범위는 다를 수 있습니다. 최근 받았다는 사실만으로 추가 치료가 불필요하거나 반드시 필요하다고 정하지 않습니다. 이전에 어느 부위를 치료했는지와 현재 잇몸 주머니·출혈·뼈 상태를 함께 확인하세요.",
    "checks": [
      "이전 스케일링 날짜와 치료한 부위·범위를 확인합니다.",
      "잇몸 주머니 깊이, 출혈과 치아를 지지하는 뼈 상태를 설명받습니다.",
      "이번 처치의 목적과 부위, 마취 여부 및 재평가 계획을 구분합니다."
    ],
    "choices": [
      {
        "condition": "염증이 잇몸 표면에 머물고 기본 관리에 반응하는 경우",
        "option": "전문적인 청소와 일상 관리를 조정하며 확인합니다.",
        "limit": "검사 없이 깊은 치료가 필요 없다고 단정하지 않습니다."
      },
      {
        "condition": "잇몸 아래 치근면과 주머니에 치료할 문제가 있는 경우",
        "option": "비수술적 치주 치료의 범위와 순서를 상의합니다.",
        "limit": "방문 수나 치료비는 진단과 계획을 확인해야 합니다."
      },
      {
        "condition": "초기 치료 뒤에도 깊은 주머니와 염증이 남는 경우",
        "option": "재평가 결과에 따라 추가 치료나 전문 진료를 검토합니다.",
        "limit": "처음부터 모든 분에게 잇몸 수술을 정하는 것은 아닙니다."
      }
    ],
    "unknown": "스케일링이라는 이름과 영수증 금액만으로 이전 처치가 충분했는지, 이번 치료가 중복인지 판단할 수 없습니다.",
    "prepare": [
      "최근 스케일링 날짜와 가지고 있는 진료내역",
      "출혈·시림·음식 끼임의 위치와 변화",
      "복용약·당뇨 등 건강 상태와 방문 가능한 일정"
    ],
    "localHeading": "당진에서 잇몸 치료 상담을 준비한다면",
    "localAdvice": "당진에서 천안 불당동으로 이동하기 전에 최근 스케일링을 받은 날짜와 추가 치료 설명 중 궁금한 점을 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 첫 검사와 치료 범위, 이후 방문 및 재평가 일정을 나누어 상의할 수 있습니다.",
    "related": [
      {
        "title": "스케일링과 잇몸 관리",
        "href": "/guide/scaling"
      },
      {
        "title": "스케일링 뒤 치아 사이가 비어 보일 때",
        "href": "/concerns/gaps-between-teeth-after-scaling"
      },
      {
        "title": "앞니가 흔들려 잇몸 치료를 고민할 때",
        "href": "/concerns/loose-front-tooth-can-it-be-saved"
      }
    ],
    "sources": [
      {
        "title": "미국 국립치의학연구소 NIDCR · 치주질환 검사와 치료",
        "href": "https://www.nidcr.nih.gov/health-info/gum-disease"
      },
      {
        "title": "미국치과의사협회 ADA · 잇몸 아래 청소와 치근면 치료",
        "href": "https://www.mouthhealthy.org/all-topics-a-z/scaling-and-root-planing"
      },
      {
        "title": "유럽치주학회 EFP · 단계별 잇몸 치료와 재평가",
        "href": "https://www.efp.org/for-patients/gum-diseases/gum-disease-treatment/"
      }
    ],
    "updated": "2026-10-03",
    "publishedAt": "2026-10-03T09:00:00+09:00"
  },
  {
    "slug": "toothache-returns-after-antibiotics",
    "title": "항생제를 먹으면 치통이 가라앉아요. 치료 없이 약으로 버틸 수는 없나요?",
    "region": "서산",
    "areaPath": "/area/seosan",
    "topic": "치통",
    "concern": "약이 들으면 치료를 미뤄도 될까요",
    "description": "서산에서 약을 먹는 동안 치통이 줄어 진료를 미루고 있다면, 증상 완화와 원인 치료의 차이, 항생제가 필요한 조건과 빠른 평가가 필요한 변화를 살펴봅니다.",
    "situation": "서산에서 어금니 통증 때문에 약을 처방받았습니다. 약을 먹으면 덜 아프지만 치료를 시작하자니 비용과 방문 일정이 부담돼, 다시 아플 때 약만 받아도 되는지 고민합니다.",
    "answer": "약을 먹고 덜 아프다는 사실만으로 치아의 원인이 해결됐다고 판단하지 않습니다. 치통은 모두 항생제가 필요한 것도 아니며, 감염 원인에 대한 치과 처치가 필요한 경우 약만 반복해서 대신할 수 없습니다. 처방받은 약은 지시에 따라 사용하고 재발·부기·발열을 알려 다음 진료를 정하세요.",
    "checks": [
      "처방약 이름과 복용 시점, 통증이 줄었다 다시 생긴 시점을 확인합니다.",
      "치아·잇몸 원인과 부기, 발열 등 감염 확산 징후를 평가합니다.",
      "약의 목적과 원인 치료, 재평가 및 빠른 연락 기준을 나눠 설명받습니다."
    ],
    "choices": [
      {
        "condition": "치아 내부나 뿌리 주변 원인에 대한 처치가 필요한 경우",
        "option": "검사에 따라 신경치료·배농 등 적절한 치과 치료를 계획합니다.",
        "limit": "약에 대한 반응만으로 치료 종류나 발치를 정하지 않습니다."
      },
      {
        "condition": "전신 증상이나 건강 상태 때문에 항생제가 필요한 경우",
        "option": "진료자가 약과 처치 및 재평가 시점을 함께 정합니다.",
        "limit": "항생제를 모든 치통에 쓰거나 필요할 때도 피하라는 뜻은 아닙니다."
      },
      {
        "condition": "호흡·삼킴 어려움 등 위험 신호가 있는 경우",
        "option": "119 또는 가까운 응급실을 통해 즉시 평가받습니다.",
        "limit": "원래 치과 예약이나 약 효과를 기다리지 않습니다."
      }
    ],
    "unknown": "약을 먹고 좋아졌는지 여부만으로 원인 치아, 감염 범위, 치료 없이 기다릴 수 있는 기간을 확정할 수 없습니다.",
    "prepare": [
      "처방전·약 봉투 또는 복용약 이름을 알 수 있는 사진",
      "복용 전후 통증과 부기·발열 변화 기록",
      "알레르기·기저질환·임신 여부와 다른 복용약 정보"
    ],
    "localHeading": "서산에서 반복되는 치통 상담을 준비한다면",
    "localAdvice": "서산에서 천안 불당동 방문을 계획할 때 약 복용 뒤 다시 아픈지와 얼굴 부기·발열 유무를 먼저 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 호흡·삼킴 어려움 등 응급 증상은 먼 이동이나 예약을 기다리지 말고 가까운 응급의료를 이용하세요.",
    "related": [
      {
        "title": "신경치료 과정과 확인할 점",
        "href": "/guide/root-canal"
      },
      {
        "title": "아프지 않아도 신경치료를 권유받았을 때",
        "href": "/concerns/root-canal-recommended-without-toothache"
      },
      {
        "title": "잇몸 뾰루지가 반복될 때",
        "href": "/concerns/gum-pimple-keeps-coming-back-without-pain"
      }
    ],
    "sources": [
      {
        "title": "미국치과의사협회 ADA · 치성 통증·감염과 항생제 적정 사용",
        "href": "https://www.ada.org/resources/ada-library/oral-health-topics/antibiotic-stewardship"
      },
      {
        "title": "미국 CDC · 항생제 복용 원칙과 부작용 상담",
        "href": "https://www.cdc.gov/antibiotic-use/about/"
      },
      {
        "title": "NHS · 치성 농양의 치료와 응급 증상",
        "href": "https://www.nhs.uk/conditions/dental-abscess/"
      },
      {
        "title": "NHS · 약물 관련 심한 알레르기와 응급 증상",
        "href": "https://www.nhs.uk/conditions/anaphylaxis/"
      }
    ],
    "updated": "2026-10-03",
    "publishedAt": "2026-10-03T09:00:00+09:00"
  },
  {
    "slug": "white-marks-around-orthodontic-brackets",
    "title": "교정장치 주변에 하얀 자국이 보여요. 가지런해져도 얼룩이 남는 건가요?",
    "region": "천안",
    "areaPath": "/area/cheonan",
    "topic": "교정",
    "concern": "교정이 끝나도 웃기 어려울까 봐 걱정돼요",
    "description": "천안에서 교정 브라켓 주변의 흰 자국 때문에 걱정된다면, 치아 표면 변화와 초기 충치를 확인하고 교정·예방 관리 계획을 함께 상의하는 방법을 살펴봅니다.",
    "situation": "천안에서 고정식 교정장치를 사용 중인데 앞니 브라켓 주변에 하얀 테두리 같은 자국이 보입니다. 양치가 부족했던 탓인지 자책되고, 교정이 끝난 뒤 앞니를 깎아야 할까 걱정됩니다.",
    "answer": "교정장치 주변의 흰 자국은 치아 표면의 무기질이 빠져나간 초기 충치 변화일 수 있지만 사진이나 색만으로 단정할 수 없습니다. 담당 치과에서 이전 사진과 현재 표면 상태를 확인하세요. 진행을 막는 관리와 남은 색 차이를 다루는 계획은 구분하며, 모든 자국을 곧바로 깎거나 덮는 것은 아닙니다.",
    "checks": [
      "흰 자국을 처음 본 시점과 교정 전 사진을 비교합니다.",
      "치아 표면 손상·충치 진행 여부와 장치 주변 청소 상태를 살핍니다.",
      "불소 사용·식사 간격·장치 관리와 확인 시점을 함께 정합니다."
    ],
    "choices": [
      {
        "condition": "표면이 유지된 초기 충치 변화로 평가되는 경우",
        "option": "불소와 구강위생·식습관 등 비수복적 관리 가능성을 상의합니다.",
        "limit": "진행 억제와 흰색의 완전한 소실은 같은 결과가 아닙니다."
      },
      {
        "condition": "구멍이나 진행된 손상이 확인되는 경우",
        "option": "치아 상태에 맞는 치료와 교정 일정 조정을 검토합니다.",
        "limit": "장치를 임의로 떼거나 글만 보고 치료법을 선택하지 않습니다."
      },
      {
        "condition": "건강 상태를 안정시킨 뒤 색 차이가 고민으로 남는 경우",
        "option": "표면 상태에 맞는 외관 개선의 선택과 한계를 설명받습니다.",
        "limit": "곧바로 미백·삭제·크라운을 정하거나 얼룩 제거를 보장하지 않습니다."
      }
    ],
    "unknown": "집에서 찍은 사진만으로 초기 충치인지, 진행이 멈췄는지, 자국이 얼마나 남을지 판단할 수 없습니다.",
    "prepare": [
      "교정 시작 전 또는 변화 전 사진이 있다면 준비",
      "평소 칫솔·치간칫솔·치약 정보와 관리가 어려운 부위",
      "간식·음료를 먹는 시간과 최근 시림·통증 여부"
    ],
    "localHeading": "천안에서 교정 중 치아 표면 상담을 준비한다면",
    "localAdvice": "천안에서 상담을 예약할 때 현재 교정 중이라는 점과 흰 자국이 보이는 위치를 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 기존 교정 담당 치과의 계획과 자료를 함께 확인하고, 장치 조정과 치아 표면 평가의 역할을 구분해 상의하세요.",
    "related": [
      {
        "title": "교정 치료와 관리 가이드",
        "href": "/guide/orthodontics"
      },
      {
        "title": "충치 치료를 결정하기 전",
        "href": "/guide/regret/cavity"
      },
      {
        "title": "미백 뒤 시림이 생겼을 때",
        "href": "/concerns/sensitive-teeth-after-whitening"
      }
    ],
    "sources": [
      {
        "title": "미국 국립치의학연구소 NIDCR · 흰 자국과 초기 충치의 진행",
        "href": "https://www.nidcr.nih.gov/health-info/tooth-decay/more-info/tooth-decay-process"
      },
      {
        "title": "NHS · 고정식 교정장치 관리와 정기 검사",
        "href": "https://www.nhs.uk/tests-and-treatments/braces/"
      },
      {
        "title": "South Tees Hospitals NHS · 교정 중 백색 변화와 충치 위험",
        "href": "https://www.southtees.nhs.uk/services/orthodontics/frequently-asked-questions/"
      }
    ],
    "updated": "2026-10-03",
    "publishedAt": "2026-10-03T09:00:00+09:00"
  },
  {
    "slug": "old-amalgam-filling-mercury-removal-worry",
    "title": "오래된 아말감에 수은이 있다는데, 안 아파도 전부 바꿔야 하나요?",
    "region": "아산",
    "areaPath": "/area/asan",
    "topic": "충전물",
    "concern": "그동안 몸에 해로운 것을 두고 산 건가요",
    "description": "아산에서 오래된 은색 충전물의 수은 때문에 불안하다면, 아말감 상태와 교체 이유를 확인하고 새 재료 선택과 정상 충전물 제거를 구분하는 상담 방법을 살펴봅니다.",
    "situation": "아산에서 오래전 어금니를 은색 재료로 메운 뒤 잘 지냈는데 수은 관련 영상을 보고 불안해졌습니다. 여러 개를 한꺼번에 바꾸면 비용도 크고 멀쩡한 치아를 더 깎을까 걱정됩니다.",
    "answer": "FDA는 충전물이 온전하고 아래에 충치가 없다면 질병 예방만을 이유로 아말감을 제거하는 것을 권하지 않습니다. 제거할 때 건강한 치아가 더 손실되거나 일시적으로 수은 증기 노출이 늘 수 있기 때문입니다. 파손·충치·확인된 알레르기 등 개별 사유와 건강 상태를 살펴 교체 필요성을 상담하세요.",
    "checks": [
      "은색 충전물이 아말감인지와 현재 파손·충치 여부를 확인합니다.",
      "교체 이유가 치아 문제, 재료에 대한 우려, 외관 중 무엇인지 나눕니다.",
      "임신·수유·신장/신경 질환·확인된 재료 알레르기 등 건강 이력을 전달합니다."
    ],
    "choices": [
      {
        "condition": "기존 충전물이 온전하고 추가 충치가 확인되지 않는 경우",
        "option": "일률적 제거보다 상태를 기록하고 정기적으로 점검합니다.",
        "limit": "아프지 않다는 느낌만으로 온전하다고 판단하지 않습니다."
      },
      {
        "condition": "충전물 파손이나 충치 등 치과적 문제가 확인된 경우",
        "option": "보존할 치아와 필요한 수복 범위에 맞춰 치료를 비교합니다.",
        "limit": "모든 은색 충전물을 같은 방법으로 한꺼번에 교체하지 않습니다."
      },
      {
        "condition": "특정 건강 상태나 재료 알레르기가 우려되는 경우",
        "option": "치과 및 필요한 경우 담당 의사와 개별 위험·이점을 상의합니다.",
        "limit": "새 아말감 사용을 피하라는 권고와 정상 충전물 제거 권고는 다릅니다."
      }
    ],
    "unknown": "색이나 사용 기간, 막연한 피로감만으로 충전물 상태 또는 수은으로 인한 건강 문제를 진단할 수 없습니다.",
    "prepare": [
      "기존 충전 시기나 진료 기록을 알고 있다면 준비",
      "치아 불편의 위치와 파손·음식 끼임 변화",
      "알레르기 검사 또는 관련 질환·복용약 자료"
    ],
    "localHeading": "아산에서 오래된 충전물 상담을 준비한다면",
    "localAdvice": "아산에서 천안 불당동으로 방문하기 전 충전물의 불편과 수은에 대한 걱정 중 무엇이 상담 이유인지 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 치아별 점검과 치료 필요성, 재료 선택 및 방문 계획을 구분해 상의할 수 있습니다.",
    "related": [
      {
        "title": "충치 치료 전 확인할 점",
        "href": "/guide/regret/cavity"
      },
      {
        "title": "레진과 인레이 치료 범위 비교",
        "href": "/guide/compare/resin-vs-inlay"
      },
      {
        "title": "충전물 가장자리만 깨졌을 때",
        "href": "/concerns/chipped-filling-repair-or-replace"
      }
    ],
    "sources": [
      {
        "title": "미국 FDA · 아말감의 위험 평가와 기존 충전물 제거 안내",
        "href": "https://www.fda.gov/medical-devices/dental-amalgam-fillings/information-patients-about-dental-amalgam-fillings"
      },
      {
        "title": "미국 FDA · 새 아말감 선택과 기존 충전물에 대한 권고 구분",
        "href": "https://www.fda.gov/medical-devices/dental-amalgam-fillings/dental-amalgam-fillings-recommendations-graphics"
      },
      {
        "title": "미국 FDA · 충치 수복 재료의 선택",
        "href": "https://www.fda.gov/medical-devices/dental-amalgam-fillings/treatment-options-dental-caries"
      }
    ],
    "updated": "2026-10-03",
    "publishedAt": "2026-10-03T09:00:00+09:00"
  },
{
  "slug": "dental-anesthesia-while-breastfeeding",
  "title": "수유 중인데 치통이 심해요. 마취하면 모유를 버려야 하나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "치과 마취",
  "concern": "아이에게 영향이 갈까 두려워요",
  "description": "홍성에서 수유 중 치통으로 치과 방문을 망설일 때, 국소마취와 다른 약을 구분하고 수유·돌봄 일정을 상담하는 방법을 정리합니다.",
  "situation": "홍성에서 아기를 돌보며 모유 수유를 하고 있습니다. 치통으로 잠을 못 자지만 마취약이 아기에게 갈까 걱정되고, 유축해 둔 모유도 넉넉하지 않아 치료를 미루고 있습니다.",
  "answer": "수유 중이라는 이유만으로 필요한 치과 치료와 국소마취를 모두 미룰 필요는 없습니다. 리도카인에 대한 LactMed 안내는 일반적으로 수유를 중단하거나 모유를 버리는 특별한 조치가 필요하지 않다고 설명합니다. 다만 실제 마취제·함께 쓰는 약·진정 여부와 아기 상태를 확인해 개별 안내를 받으세요.",
  "checks": [
    "수유 중임을 예약과 진료 때 알리고 아기 나이, 미숙아 출생이나 황달 이력을 전달합니다.",
    "국소마취만 하는지, 진정제와 치료 후 약도 쓰는지 구분합니다.",
    "통증 시작 시점과 부기, 복용 중인 약 및 알레르기 정보를 정리합니다."
  ],
  "choices": [
    {
      "condition": "일반적인 치과 국소마취가 필요한 경우",
      "option": "사용할 약을 확인하고 수유를 이어 가면서 치료할 수 있는지 상담합니다.",
      "limit": "리도카인의 안내를 모든 약이나 진정치료에 그대로 적용하지 않습니다."
    },
    {
      "condition": "진정치료나 추가 약이 필요한 경우",
      "option": "약별 수유 안내와 치료 당일 아기 돌봄·귀가 계획을 함께 확인합니다.",
      "limit": "진료 내용이 정해지기 전에 수유 재개 시각을 일괄 약속할 수 없습니다."
    }
  ],
  "unknown": "수유 중이라고 임의로 처방약을 끊거나, 통증을 참으려고 마취를 거부하지 마세요. 특정 약에 대한 설명을 받았다면 약 이름과 권고 이유를 확인하세요.",
  "prepare": [
    "아기 나이·출생 관련 의료 정보 중 약 선택에 필요한 내용",
    "현재 복용약과 이미 먹은 진통제 이름 또는 약 봉투",
    "치통 경과와 치료 당일 돌봄을 도와줄 수 있는 시간"
  ],
  "localHeading": "홍성에서 수유 중 치과 마취 상담을 준비한다면",
  "localAdvice": "홍성에서 이동하면서 수유 간격과 돌봄까지 맞춰야 한다면 예약 시 가능한 체류 시간과 동행 여부를 알려주세요. 첫 방문 평가와 실제 치료 시간이 같은지는 확인이 필요합니다. 서울비디치과의 실제 진료 장소는 천안 불당동이며, 이동 준비 때문에 심해지는 통증의 평가를 미루지 마세요.",
  "related": [
    {
      "title": "치과 상담을 준비하는 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "마취를 해도 아팠던 기억이 무서울 때",
      "href": "/concerns/root-canal-fear-after-pain-despite-anesthesia"
    }
  ],
  "sources": [
    {
      "title": "미국 NIH LactMed · 리도카인과 수유",
      "href": "https://www.ncbi.nlm.nih.gov/sites/books/NBK501230/"
    },
    {
      "title": "영국 NHS · 수유 중 약과 치과 국소마취",
      "href": "https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-and-lifestyle/medicines/"
    },
    {
      "title": "영국 NHS · 치과 응급 진료와 전신·얼굴 손상 시 도움",
      "href": "https://www.nhs.uk/nhs-services/dentists/how-to-find-an-nhs-dentist-in-an-emergency/"
    }
  ],
  "updated": "2026-10-04",
  "publishedAt": "2026-10-04T09:00:00+09:00"
},
{
  "slug": "permanent-tooth-knocked-out-in-accident",
  "title": "넘어져 영구치가 통째로 빠졌어요. 다시 살릴 수 있나요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "치아 외상",
  "concern": "갑자기 앞니를 잃을까 두려워요",
  "description": "예산에서 사고로 영구치가 통째로 빠졌을 때, 즉시 진료를 연결하고 치아를 다루는 방법과 유치와의 차이, 이후 확인할 과정을 안내합니다.",
  "situation": "예산에서 넘어지거나 운동하다가 앞니가 통째로 빠졌습니다. 손에 든 치아를 씻어야 할지, 다시 넣어야 할지 모르겠고 앞니가 영영 없어질까 두렵습니다.",
  "answer": "영구치가 통째로 빠진 경우에는 기다리지 말고 즉시 가까운 치과에 연락해 응급 평가를 받으세요. 치아는 뿌리가 아닌 머리 부분을 잡고 마르지 않게 보관합니다. 다시 넣기 어렵다면 우유나 전용 치아 보존액에 담아 함께 가져가세요. 유치는 다시 넣지 않습니다. 의식 저하·호흡 문제·심한 얼굴 손상이 있으면 119 등 응급의료가 먼저입니다.",
  "checks": [
    "영구치인지 유치인지, 빠진 시각과 이후 건조했던 시간을 알립니다.",
    "뿌리를 만지거나 문질러 닦지 말고 현재 보관한 방법을 전달합니다.",
    "머리·얼굴 손상과 의식·호흡 문제를 먼저 확인해 응급의료 연결이 필요한지 판단합니다."
  ],
  "choices": [
    {
      "condition": "영구치가 빠졌고 의식이 명료한 경우",
      "option": "즉시 응급 치과와 연결하고 치아를 마르지 않게 보호합니다.",
      "limit": "아이이거나 삼킬 위험이 있으면 입안에 보관하지 마세요. 억지로 밀어 넣지 않습니다."
    },
    {
      "condition": "유치가 빠졌거나 구분이 안 되는 경우",
      "option": "유치는 재삽입하지 않고, 구분이 안 되면 치아를 보관해 즉시 진료자에게 문의합니다.",
      "limit": "크기나 아이 나이만으로 영구치라고 확신하지 마세요."
    }
  ],
  "unknown": "빠진 시간, 치아 뿌리의 발달과 손상, 보관 상태 등을 평가해야 합니다. 시간이 지났다는 이유로 버리지 말고, 다시 심는 처치가 가능해도 장기 유지가 보장되는 것은 아닙니다.",
  "prepare": [
    "빠진 치아와 담아 둔 용기",
    "사고 시각·건조 시간·보관액을 아는 범위에서 기록",
    "다친 상황과 현재 복용약·알레르기 정보"
  ],
  "localHeading": "예산에서 치아 외상 직후 진료를 찾는다면",
  "localAdvice": "예산에서 영구치가 빠졌다면 특정 병원의 예약이나 장거리 이동을 기다리지 말고 가장 빨리 응급 평가를 받을 수 있는 가까운 치과에 먼저 연락하세요. 서울비디치과의 진료 장소는 천안 불당동이며 즉시 처치 가능 여부는 확인해야 합니다. 심한 전신·얼굴 손상은 119 등 응급의료 안내를 우선하세요.",
  "related": [
    {
      "title": "치료 결정을 앞두고 확인할 질문",
      "href": "/guide/regret"
    },
    {
      "title": "앞니 조각이 깨졌지만 통증이 없을 때",
      "href": "/concerns/chipped-front-tooth-without-pain"
    }
  ],
  "sources": [
    {
      "title": "영국 NHS · 빠진 치아의 응급 대처와 유치 주의",
      "href": "https://www.nhs.uk/conditions/knocked-out-tooth/"
    },
    {
      "title": "미국근관치료학회 AAE · 빠진 영구치의 보존과 즉시 진료",
      "href": "https://www.aae.org/patients/dental-symptoms/knocked-out-teeth/"
    },
    {
      "title": "미국근관치료학회 AAE · 치아 외상 평가와 경과 확인",
      "href": "https://www.aae.org/patients/dental-symptoms/traumatic-dental-injuries/"
    },
    {
      "title": "영국 NHS · 치과 응급 진료와 전신·얼굴 손상 시 도움",
      "href": "https://www.nhs.uk/nhs-services/dentists/how-to-find-an-nhs-dentist-in-an-emergency/"
    }
  ],
  "updated": "2026-10-04",
  "publishedAt": "2026-10-04T09:00:00+09:00"
},
{
  "slug": "adult-repeat-cavities-fluoride-treatment",
  "title": "충치가 자꾸 생기는데, 어른도 불소를 발라야 하나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "충치 예방",
  "concern": "열심히 관리해도 또 치료하게 돼요",
  "description": "당진에서 성인의 반복 충치로 불소 도포를 권유받았을 때, 개인 위험 평가와 치약·전문가 도포의 차이, 치료가 필요한 충치와의 구분을 안내합니다.",
  "situation": "당진에서 정기검진을 받을 때마다 다른 치아에 충치가 있다고 듣습니다. 양치도 열심히 하는데 어른에게 불소를 바르자는 설명을 들으니 필요한 예방인지 추가 치료인지 헷갈립니다.",
  "answer": "불소를 이용한 충치 예방은 어린이에게만 해당하지 않습니다. 성인도 충치 위험이 높다면 전문가 도포나 처방 불소 제품을 검토할 수 있습니다. 최근 충치, 입마름, 뿌리 노출과 생활습관을 평가해 방법을 정하며, 이미 구멍이 생긴 충치를 불소만으로 모두 메우거나 해결할 수는 없습니다.",
  "checks": [
    "새 충치가 생긴 시기와 위치, 과거 치료 주변인지 확인합니다.",
    "입마름·복용약·노출된 뿌리와 간식·음료를 먹는 빈도를 함께 상담합니다.",
    "현재 치약과 구강세정제, 도포를 권유한 이유를 기록합니다."
  ],
  "choices": [
    {
      "condition": "충치 위험이 높고 추가 예방이 필요한 경우",
      "option": "치과에서 불소 도포 또는 개인에게 맞는 처방 제품을 검토합니다.",
      "limit": "제품과 사용 간격을 모든 성인에게 같은 방식으로 정하지 않습니다."
    },
    {
      "condition": "구멍이 생기기 전 초기 변화로 평가된 경우",
      "option": "불소와 일상 관리, 경과 확인으로 관리할 수 있는지 살펴봅니다.",
      "limit": "색깔만 보고 초기 충치라고 자가 판단하지 않습니다."
    },
    {
      "condition": "구멍이나 수복이 필요한 손상이 확인된 경우",
      "option": "필요한 치료와 이후 새 충치를 줄이는 예방 계획을 나눠 설명받습니다.",
      "limit": "예방 도포가 이미 손상된 치아의 수복을 모두 대신하지 않습니다."
    }
  ],
  "unknown": "충치가 생겼다는 사실만으로 양치를 게을리했다고 단정할 수 없습니다. 어떤 치아가 치료 대상이고 어느 곳을 예방·관찰할지 구분해 설명받으세요.",
  "prepare": [
    "최근 충치 치료 시기와 기존 검사 자료가 있다면 사본",
    "평소 치약·구강세정제 제품 정보",
    "입마름과 약 복용, 업무 중 간식·음료 습관"
  ],
  "localHeading": "당진에서 충치 예방 상담을 준비한다면",
  "localAdvice": "당진에서 방문할 때 최근 치료 내역과 사용 제품을 알려 예방 상담 범위를 확인하세요. 매번 도포만 받으러 오기 부담스럽다면 평소 집에서 할 관리와 재평가 일정을 함께 상의할 수 있습니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 도포 여부와 간격은 검사 결과에 따라 정합니다.",
  "related": [
    {
      "title": "치과 선택과 상담 준비",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "입이 마른 뒤 충치가 늘었다면",
      "href": "/concerns/dry-mouth-after-medication-new-cavities"
    },
    {
      "title": "잇몸이 내려가 치아 뿌리가 보인다면",
      "href": "/concerns/receding-gums-exposed-roots-brushing-blame"
    }
  ],
  "sources": [
    {
      "title": "미국치과의사협회 ADA · 국소 불소와 충치 위험별 적용",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/fluoride-topical-and-systemic-supplements"
    },
    {
      "title": "미국 NIDCR · 충치의 진행·예방과 초기 병소 관리",
      "href": "https://www.nidcr.nih.gov/health-info/tooth-decay"
    },
    {
      "title": "미국치과의사협회 MouthHealthy · 성인의 불소 치약과 전문가 도포",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/fluoride/"
    }
  ],
  "updated": "2026-10-04",
  "publishedAt": "2026-10-04T09:00:00+09:00"
},
{
  "slug": "dental-ct-after-recent-panoramic-xray",
  "title": "얼마 전에 엑스레이를 찍었는데 CT를 또 찍자고 해요. 꼭 필요한가요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "치과 CT",
  "concern": "검사가 겹치고 방사선이 걱정돼요",
  "description": "서산에서 최근 치과 엑스레이 이후 CBCT 촬영을 권유받았을 때, 검사 목적과 기존 영상 활용, 촬영 범위 및 설명받을 질문을 정리합니다.",
  "situation": "서산에서 치과 상담을 받고 파노라마 사진을 찍었습니다. 다른 진료 계획을 상담하는 중 CT가 더 필요하다는 설명을 들어, 같은 검사를 반복하는 것인지 방사선과 비용이 걱정됩니다.",
  "answer": "일반 치과 엑스레이와 치과용 콘빔 CT는 제공하는 정보가 다르지만, CT가 항상 필요한 것은 아닙니다. 기존 영상으로 답하기 어려운 구체적인 진료 질문이 있는지, CT 결과가 치료 계획을 어떻게 바꾸는지 설명받으세요. 최근 영상을 전달해 중복을 줄이고, 필요한 범위와 촬영 조건을 확인할 수 있습니다.",
  "checks": [
    "기존 검사 종류·촬영 날짜·부위를 정리하고 원본 영상 전달 방법을 문의합니다.",
    "이번 CT로 추가 확인하려는 구조와 치료 결정에 미치는 영향을 묻습니다.",
    "임신 가능성이나 어린이 검사 여부, 촬영 중 자세 유지의 어려움을 미리 알립니다."
  ],
  "choices": [
    {
      "condition": "기존 영상으로 필요한 판단을 할 수 있는 경우",
      "option": "추가 CT 없이 평가할 수 있는지 확인합니다.",
      "limit": "영상의 날짜뿐 아니라 촬영 범위와 질도 확인해야 합니다."
    },
    {
      "condition": "일반 영상만으로 필요한 정보를 얻기 어려운 경우",
      "option": "진료 목적에 맞춘 CT의 이점과 위험을 비교합니다.",
      "limit": "CT를 찍는다고 모든 통증 원인이나 치료 결과를 확정하는 것은 아닙니다."
    }
  ],
  "unknown": "촬영 횟수 하나나 “정밀검사”라는 말만으로 필요 여부를 결정할 수 없습니다. 다른 병원에서 촬영했다는 사실만으로 재촬영이 당연한 것도 아니며, 최근 사진이 있다는 이유로 언제나 추가 검사가 불필요한 것도 아닙니다.",
  "prepare": [
    "최근 치과 영상의 날짜·검사 종류·판독 또는 설명 내용",
    "영상 원본을 받을 수 있는지와 전달 방법",
    "현재 증상, 이전 치료계획, 검사에서 가장 걱정되는 점"
  ],
  "localHeading": "서산에서 치과 CT 상담을 위해 이동하기 전",
  "localAdvice": "서산에서 천안으로 방문하기 전에 보유 영상을 어떤 형식으로 전달할지 문의하세요. 자료를 가져와도 필요한 정보가 부족하면 추가 검사가 논의될 수 있습니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 첫 상담과 촬영 가능 범위·비용은 예약과 진찰 과정에서 개별 확인하세요.",
  "related": [
    {
      "title": "치과 선택 전 설명받을 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "임플란트 진료 과정 알아보기",
      "href": "/guide/implant"
    },
    {
      "title": "엑스레이는 괜찮은데 어금니가 불편할 때",
      "href": "/concerns/molar-discomfort-normal-xray"
    }
  ],
  "sources": [
    {
      "title": "미국 FDA · 치과용 콘빔 CT의 필요성·방사선 최적화·중복 촬영 검토",
      "href": "https://www.fda.gov/radiation-emitting-products/medical-x-ray-imaging/dental-cone-beam-computed-tomography"
    },
    {
      "title": "ACR·RSNA RadiologyInfo · 치과용 콘빔 CT의 용도와 한계",
      "href": "https://www.radiologyinfo.org/en/info/dentalconect"
    }
  ],
  "updated": "2026-10-04",
  "publishedAt": "2026-10-04T09:00:00+09:00"
},
{
  "slug": "apicoectomy-after-root-canal-save-tooth",
  "title": "신경치료한 치아의 뿌리 끝을 수술하자는데, 그냥 다시 치료하면 안 되나요?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "신경치료",
  "concern": "다시 치료받아도 치아를 잃을까 봐 두려울 때",
  "description": "신경치료 뒤 치근단 수술을 제안받아 망설이는 천안 환자분을 위한 안내. 재신경치료와 뿌리 끝 수술의 차이, 치아 보존 조건과 수술 후 확인할 일을 정리합니다.",
  "situation": "천안에서 신경치료와 크라운까지 마쳤는데 뿌리 끝을 수술하자는 설명을 들은 상황입니다. 이미 시간과 비용을 들였는데 다시 잇몸을 열어야 한다니, 치아를 살리는 시도인지 발치를 미루는 것뿐인지 판단하기 어렵습니다.",
  "answer": "치근단 수술은 잇몸 쪽에서 뿌리 끝과 주변 병소에 접근하는 치료입니다. 치아 안으로 다시 들어가는 재신경치료가 가능한지, 치아 자체를 유지할 조건이 남아 있는지부터 함께 평가해야 합니다. 수술 권유만으로 발치가 확정된 것도, 수술하면 반드시 보존되는 것도 아닙니다.",
  "checks": [
    "처음 신경치료와 보철을 마친 시점, 이후 통증·붓기·고름의 경과",
    "기존 영상과 현재 소견을 비교한 이유, 치아 안쪽으로 다시 접근하기 어려운 부분",
    "치아 균열 가능성, 남은 치질과 잇몸·지지뼈 상태, 수술 부위 주변 구조",
    "재신경치료·수술·발치 각각의 목표와 한계, 치료 뒤 다시 평가할 일정"
  ],
  "choices": [
    {
      "condition": "치아 안쪽에 다시 접근해 원인을 다룰 수 있다면",
      "option": "비수술적 재신경치료의 가능성과 필요한 보철 처치를 상담합니다.",
      "limit": "크라운이나 기둥을 다뤄야 할 수 있어 치아 손상 위험과 재수복 범위를 함께 확인해야 합니다."
    },
    {
      "condition": "일반적인 재접근이 어렵거나 치료 뒤 뿌리 끝 문제가 지속된다면",
      "option": "치근단 수술로 접근할 이유와 기대하는 이득을 검토합니다.",
      "limit": "모든 치아에 적용되는 방법은 아니며 위치와 주변 구조에 따라 수술 부담이 달라집니다."
    },
    {
      "condition": "치아를 지탱하거나 복원할 조건이 좋지 않다면",
      "option": "보존 시도의 한계와 발치 후 대안을 비교해 설명받습니다.",
      "limit": "뿌리 끝만 치료해도 해결되지 않는 문제가 있는지 확인해야 하며 사진 한 장으로 확정할 수 없습니다."
    }
  ],
  "unknown": "이 글로 수술 적합성, 성공 가능성, 크라운 유지 여부나 정확한 치료비를 판단할 수 없습니다. 같은 이름의 수술이라도 원인과 치아 상태가 달라 진찰과 영상, 이전 치료 기록을 함께 봐야 합니다.",
  "prepare": [
    "이전 치과의 영상·신경치료·보철 기록과 수술 권유 내용을 요청하기",
    "복용약·알레르기·전신질환 및 이전 마취 경험을 정리하기",
    "남기고 싶은 치아의 이유와 비용·휴가·식사에서 가장 부담되는 점을 적기"
  ],
  "localHeading": "천안에서 신경치료 다음 단계를 결정하기 전에",
  "localAdvice": "천안 안에서도 직장과 돌봄 일정 때문에 여러 번 내원하기 어려울 수 있습니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 예약할 때 뿌리 끝 수술을 권유받았다고 알리고 기존 자료 전달과 보존 가능성 상담 범위를 확인하세요. 첫날 검사와 설명, 이후 치료·경과 확인을 나누어 계획하며 당일 수술 가능 여부를 미리 단정하지 않습니다.",
  "related": [
    {
      "title": "신경치료 진료 가이드",
      "href": "/guide/root-canal"
    },
    {
      "title": "신경치료와 임플란트 선택을 비교할 때",
      "href": "/guide/compare/root-canal-vs-implant"
    },
    {
      "title": "오래전 신경치료한 치아가 다시 아플 때",
      "href": "/concerns/root-canal-pain-years-later"
    }
  ],
  "sources": [
    {
      "title": "AAE · 치근단 수술의 목적과 접근",
      "href": "https://www.aae.org/patients/root-canal-treatment/endodontic-treatment-options/endodontic-surgery/"
    },
    {
      "title": "AAE · 재신경치료를 검토하는 이유와 과정",
      "href": "https://www.aae.org/patients/root-canal-treatment/endodontic-treatment-options/endodontic-retreatment/"
    },
    {
      "title": "Leeds Teaching Hospitals NHS · 치근단 수술과 대안",
      "href": "https://www.leedsth.nhs.uk/patients/resources/apical-surgery/"
    }
  ],
  "updated": "2026-10-05",
  "publishedAt": "2026-10-05T09:00:00+09:00"
},
{
  "slug": "wisdom-tooth-coronectomy-leaving-roots",
  "title": "사랑니 뿌리를 남겨 두자는데, 덜 빼는 치료여도 괜찮나요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "사랑니",
  "concern": "뿌리를 남기면 나중에 더 큰 문제가 생길까 걱정될 때",
  "description": "아래 사랑니의 뿌리를 남기는 치관절제술을 제안받은 아산 환자분을 위한 안내. 신경과 뿌리의 관계, 적용 조건, 추적 확인과 추가 수술 가능성을 차근히 살펴봅니다.",
  "situation": "아산에서 아래 사랑니를 상담하다가 신경과 가깝다며 뿌리는 두고 머리 부분만 제거하자는 설명을 들었습니다. 덜 빼면 위험이 줄어든다는데, 남아 있는 뿌리가 나중에 곪거나 다시 수술해야 할까 봐 마음이 놓이지 않습니다.",
  "answer": "치관절제술은 일부 아래 사랑니에서 신경 손상 위험을 줄이기 위해 치관을 제거하고 뿌리를 의도적으로 남기는 선택입니다. 모든 사랑니에 맞는 방법은 아니며 뿌리의 건강 상태와 신경의 위치 등을 평가합니다. 남긴 뿌리의 변화와 추후 처치 가능성까지 설명받아야 합니다.",
  "checks": [
    "사랑니 치료가 필요한 이유와 지금까지 통증·붓기가 반복된 양상",
    "아래턱 감각신경과 뿌리의 관계, 기존 영상으로 확인되는 부분과 추가 검사 목적",
    "충치·뿌리 주변 감염·치아 움직임 등 뿌리를 남길 수 있는 조건",
    "수술 중 계획이 바뀔 가능성, 수술 후 감각 확인과 추적 진찰 계획"
  ],
  "choices": [
    {
      "condition": "치료가 필요하고 뿌리가 감각신경에 매우 가까우며 남길 조건에 맞는다면",
      "option": "치관절제술과 완전 발치의 이득·위험을 비교합니다.",
      "limit": "신경 손상 위험을 줄이는 목적이지 통증이나 합병증을 없애는 보장은 아닙니다."
    },
    {
      "condition": "뿌리 자체의 감염이나 움직임 등 남기기 어려운 소견이 있다면",
      "option": "완전 발치 등 다른 접근이 필요한 이유를 설명받습니다.",
      "limit": "신경과 가깝다는 한 가지 정보만으로 치관절제술을 선택할 수는 없습니다."
    },
    {
      "condition": "현재 수술이 꼭 필요한지부터 불확실하다면",
      "option": "증상·병변과 주변 치아 상태를 확인하고 관찰 가능성을 상담합니다.",
      "limit": "관찰을 택하더라도 확인 일정과 상태가 달라졌을 때의 대응이 필요합니다."
    }
  ],
  "unknown": "입안 사진이나 파노라마 설명 한 문장만으로 어떤 수술이 더 적절한지 결정할 수 없습니다. 신경과의 관계, 뿌리 상태, 수술 접근과 전신 상태를 종합해 판단하며 이후 추가 수술 여부도 미리 확정할 수 없습니다.",
  "prepare": [
    "기존 파노라마·CT 촬영 날짜와 전달 가능한 파일 확인하기",
    "붓기·고름·통증이 있었던 시점과 치료·약 복용 기록 정리하기",
    "입술·턱끝 감각이 원래 어땠는지와 현재 느끼는 변화 적기",
    "추적 내원이 가능한 일정과 이동·휴가·식사 부담 미리 전달하기"
  ],
  "localHeading": "아산에서 사랑니 수술과 이후 확인을 함께 준비한다면",
  "localAdvice": "아산에서 천안 불당동 서울비디치과로 방문을 생각한다면 치관절제술을 제안받았다는 점과 촬영 자료가 있는지 먼저 알려주세요. 실제 진료 장소는 천안 불당동이며 아산 분원을 뜻하지 않습니다. 해당 치료의 적용·시행 가능성은 진찰 후 확인해야 합니다. 첫 상담뿐 아니라 상처와 감각, 남긴 뿌리를 확인할 계획까지 이동 일정과 함께 상의하세요.",
  "related": [
    {
      "title": "사랑니 진료 가이드",
      "href": "/guide/wisdom-tooth"
    },
    {
      "title": "사랑니 발치와 관찰을 비교할 때",
      "href": "/guide/compare/wisdom-extraction-vs-wait"
    },
    {
      "title": "아래 사랑니 발치 후 감각이 낯설 때",
      "href": "/concerns/numb-lip-after-lower-wisdom-tooth-removal"
    }
  ],
  "sources": [
    {
      "title": "BAOMS · 사랑니 치관절제술의 목적·조건·한계",
      "href": "https://www.baoms.org.uk/patients/procedures/44/coronectomy"
    },
    {
      "title": "UCLH NHS · 치관절제술을 고려하는 환자 안내",
      "href": "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/wisdom-tooth-surgery-advice-patients-considering-coronectomy"
    }
  ],
  "updated": "2026-10-05",
  "publishedAt": "2026-10-05T09:00:00+09:00"
},
{
  "slug": "clear-aligner-not-fitting-next-tray",
  "title": "투명교정 장치가 끝까지 안 들어가요. 다음 장치로 넘어가도 되나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "투명교정",
  "concern": "장치가 뜨는데 내가 교정을 망친 건 아닐까 불안할 때",
  "description": "투명교정 중 새 장치가 끝까지 맞지 않아 다음 단계가 걱정되는 홍성 환자분을 위한 안내. 착용 순서와 간격, 장치 손상·부착물 상태를 확인하고 치과에 전달할 내용을 정리합니다.",
  "situation": "홍성에서 투명교정을 진행하며 안내받은 날짜에 새 장치를 꺼냈는데 한쪽이 뜨고 끝까지 들어가지 않습니다. 지난주에 착용 시간이 부족했던 날이 떠올라 자책도 되고, 다음 장치로 넘어가지 못하면 치료비와 기간이 늘어날까 걱정됩니다.",
  "answer": "새 장치가 맞지 않으면 달력의 교체 날짜만 보고 다음 단계로 밀어붙이지 말고 치료 중인 치과에 연락하세요. 현재·직전 장치의 번호와 착용 기록, 맞지 않는 위치를 알려 어떤 장치를 어떻게 착용할지 확인해야 합니다. 사진만으로 원인을 확정하거나 모든 환자분에게 같은 교체 간격을 적용할 수는 없습니다.",
  "checks": [
    "장치 번호와 위·아래 구분, 교체한 날짜와 실제 착용 양상",
    "직전 장치는 맞는지, 전체가 안 맞는지 특정 치아만 뜨는지",
    "장치의 균열·변형과 치아에 붙인 부착물의 변화 여부",
    "통증·상처·붓기 등 동반 불편, 다음 내원 전 착용 지침을 받았는지"
  ],
  "choices": [
    {
      "condition": "현재 장치가 잘 맞지 않거나 다음 단계 착용이 어렵다면",
      "option": "진행 중인 치과에 상태를 알리고 사용할 장치와 교체 시점을 확인합니다.",
      "limit": "임의로 여러 단계를 건너뛰거나 인터넷의 공통 일수에 맞추지 않습니다."
    },
    {
      "condition": "장치가 깨졌거나 없어졌다면",
      "option": "직전·현재·다음 장치의 보유 상태를 전달하고 대체 방법을 안내받습니다.",
      "limit": "분실했다고 새 장치를 억지로 끼우거나 장치 없이 오래 지내기로 스스로 결정하지 않습니다."
    },
    {
      "condition": "부착물이 떨어지거나 특정 부위가 계속 뜬다면",
      "option": "치아 이동과 장치 적합을 확인하고 계획 조정이 필요한지 평가받습니다.",
      "limit": "어떤 부착물인지와 치료 단계가 달라 사진만으로 다음 단계 진행을 일괄 판단할 수 없습니다."
    }
  ],
  "unknown": "장치가 뜨는 이유와 추가 장치·검사가 필요한지는 진찰과 치료 계획을 함께 봐야 알 수 있습니다. 이 글은 치료 중인 치과의 개별 착용 지침을 대신하지 않으며 며칠 더 끼면 반드시 맞는다고 약속하지 않습니다.",
  "prepare": [
    "현재·직전 장치와 포장 번호를 버리지 않고 상담 때 가져가기",
    "치과가 요청하는 방식으로 착용 상태를 촬영하고 어느 쪽이 뜨는지 표시하기",
    "착용하지 못한 시간과 이유를 숨기지 않고 가능한 범위에서 적기",
    "분실·파손 시 연락 경로와 다음 방문 전 지침을 확인하기"
  ],
  "localHeading": "홍성에서 투명교정 중 이동 일정까지 고민된다면",
  "localAdvice": "홍성에서 통원한다면 장치가 맞지 않는다는 사실을 예약일 직전까지 참기보다 진행 중인 치과에 먼저 알려주세요. 필요한 내원 시기와 가져올 장치를 확인하면 방문 준비에 도움이 됩니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 다른 곳에서 시작한 치료에 대한 상담이라면 기록 검토와 진료 범위를 사전 문의하고, 첫 방문에 기존 계획을 그대로 이어갈 수 있다고 가정하지 마세요.",
  "related": [
    {
      "title": "교정치료 진료 가이드",
      "href": "/guide/orthodontics"
    },
    {
      "title": "교정 후 유지장치가 맞지 않는 경우",
      "href": "/concerns/removable-retainer-no-longer-fits"
    },
    {
      "title": "교정 중 치아 표면의 하얀 흔적이 걱정될 때",
      "href": "/concerns/white-marks-around-orthodontic-brackets"
    }
  ],
  "sources": [
    {
      "title": "BOS · 투명교정의 원리와 치료 계획",
      "href": "https://bos.org.uk/clear-aligners/"
    },
    {
      "title": "AAO · 교정 중 장치 파손·분실과 착용 순서 안내",
      "href": "https://aaoinfo.org/whats-trending/life-during-treatment/"
    },
    {
      "title": "BOS · 대면 진료가 어려울 때의 투명교정 안내, 코로나 시기 자료",
      "href": "https://www.bos.org.uk/wp-content/uploads/2022/02/Clear-Aligner-Fact-Sheet-FINAL.pdf"
    }
  ],
  "updated": "2026-10-05",
  "publishedAt": "2026-10-05T09:00:00+09:00"
},
{
  "slug": "denture-cracked-cannot-eat-repair",
  "title": "틀니가 금 가고 갈라졌어요. 붙여서 쓰면 안 될까요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "틀니",
  "concern": "당장 밥을 먹고 사람을 만나야 하는데 틀니가 깨졌을 때",
  "description": "틀니가 금 가거나 갈라져 식사와 외출이 걱정되는 예산 환자분을 위한 안내. 조각 보관과 자가 접착을 피할 이유, 수리와 재제작을 구분해 상담할 내용을 정리합니다.",
  "situation": "예산에서 쓰던 틀니를 씻다가 떨어뜨렸거나 식사 중 갈라진 것을 발견했습니다. 새로 맞출 비용도 걱정이지만 당장 점심을 어떻게 먹고 사람을 만날지가 더 급합니다. 조금만 붙이면 쓸 수 있을 것 같아 집에 있는 접착제를 떠올리게 됩니다.",
  "answer": "깨진 틀니는 조각을 보관해 치과에서 수리 가능성과 입안 상태를 함께 확인받으세요. 가정용 접착제로 붙이거나 금속 부분을 직접 구부리지 마세요. 파절 위치와 재료, 기존 적합 상태에 따라 수리·조정·재제작의 선택이 달라지며, 깨졌다는 이유만으로 새 틀니나 임플란트가 자동으로 필요한 것은 아닙니다.",
  "checks": [
    "떨어뜨린 뒤인지, 쓰던 중 갈라졌는지와 파손 시점",
    "틀니 바닥·인공치아·고리 중 손상된 곳과 보관 중인 조각",
    "파손 전부터 들뜸·통증·씹기 어려움이 있었는지",
    "입안 상처·남은 치아의 불편과 현재 식사·수분 섭취가 가능한 정도"
  ],
  "choices": [
    {
      "condition": "부분 손상이며 기존 틀니의 다른 조건이 유지될 수 있다면",
      "option": "수리가 가능한 범위와 수리 뒤 맞물림·적합 확인을 상담합니다.",
      "limit": "조각만 보고 수리 여부와 내구성을 확정할 수 없고 입안에서의 확인이 필요할 수 있습니다."
    },
    {
      "condition": "기존부터 잘 맞지 않거나 파절이 반복됐다면",
      "option": "틀니와 잇몸·남은 치아 상태를 함께 평가하고 조정 또는 재제작을 비교합니다.",
      "limit": "깨진 선만 붙여도 같은 불편이 해결되는지 확인해야 하며 새 제작을 바로 전제로 삼지는 않습니다."
    },
    {
      "condition": "날카롭거나 느슨한 조각 때문에 착용이 어렵다면",
      "option": "무리한 착용을 멈추고 진료 전 식사·생활 대응을 먼저 문의합니다.",
      "limit": "급한 약속이 있어도 안전하지 않은 틀니를 접착제로 붙여 계속 사용하는 방법을 권하지 않습니다."
    }
  ],
  "unknown": "이 글로 수리 가능성, 당일 반환 여부, 수리비나 보험 적용을 확정할 수 없습니다. 파손 재료와 범위, 현재 입안 상태를 확인하고 필요한 진료와 제작 과정을 나누어 설명받아야 합니다.",
  "prepare": [
    "깨진 조각을 빠뜨리지 않도록 전용 보관통 등 보호되는 용기에 담기",
    "파손 전 불편과 과거 수리 횟수·제작 시점을 아는 범위에서 적기",
    "기존 틀니와 반대편 틀니, 있으면 제작·수리 관련 자료 가져가기",
    "현재 먹을 수 있는 음식과 중요한 일정, 틀니 없이 지내기 어려운 사정 알리기"
  ],
  "localHeading": "예산에서 틀니 수리 상담을 준비한다면",
  "localAdvice": "예산에서 천안 불당동 서울비디치과로 이동을 준비한다면 깨진 위치와 조각 보유 여부, 식사 가능한 정도를 먼저 알려주세요. 실제 진료 장소는 천안 불당동입니다. 첫 방문에 입안 확인이 필요한지, 틀니를 맡겨야 하는지, 이후 착용 확인은 언제인지 문의하세요. 먼 길을 한 번 움직였다는 이유로 수리와 조정이 모두 당일 끝난다고 약속할 수는 없습니다.",
  "related": [
    {
      "title": "틀니 진료 가이드",
      "href": "/guide/denture"
    },
    {
      "title": "틀니를 다시 결정하기 전에 살필 것",
      "href": "/guide/regret/denture"
    },
    {
      "title": "틀니가 같은 자리에 계속 상처를 낼 때",
      "href": "/concerns/denture-sore-same-spot"
    }
  ],
  "sources": [
    {
      "title": "NHS · 손상된 틀니와 조각을 가져가 수리 가능성 확인하기",
      "href": "https://www.nhs.uk/tests-and-treatments/dentures/"
    },
    {
      "title": "NHS Health Education England · 깨진 보철의 치과 평가와 자가 접착 주의",
      "href": "https://london.wtepharmacy.nhs.uk/dyn/_assets/_folder4/dental-factsheets-2022/dental_factsheets_final.pdf"
    },
    {
      "title": "Guy’s and St Thomas’ NHS · 틀니 적합과 입안 관리",
      "href": "https://www.guysandstthomas.nhs.uk/health-information/dentures"
    }
  ],
  "updated": "2026-10-05",
  "publishedAt": "2026-10-05T09:00:00+09:00"
},
{
  "slug": "bone-graft-at-extraction-before-implant-decision",
  "title": "이를 빼면서 뼈이식도 하자는데, 임플란트는 아직 결정 못 했어요.",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "발치 후 뼈이식",
  "concern": "치아를 잃는 것도 힘든데 다음 치료까지 바로 결정해야 할 때",
  "description": "당진에서 발치와 뼈이식을 함께 권유받았지만 임플란트를 결정하지 못한 환자분을 위한 안내. 발치 부위 보존의 목적, 이식 시기와 재료, 대안과 비용을 나누어 상담할 질문을 정리합니다.",
  "situation": "당진에서 어금니 발치를 상담하다가 같은 날 뼈이식도 하자는 설명을 들었습니다. 이를 빼야 한다는 말도 아직 받아들이기 어려운데, 임플란트 비용과 이후 방문 일정까지 한 번에 정해야 할 것 같아 막막합니다.",
  "answer": "발치 부위 보존을 위한 뼈이식은 이후 치료를 준비하는 선택일 수 있지만, 모든 발치에 자동으로 필요한 것은 아닙니다. 현재 뼈와 잇몸 상태, 이식의 목적, 예정된 보철 방법을 확인하고 지금 시행할 때와 나중에 평가할 때의 차이를 설명받으세요. 뼈이식만으로 임플란트 식립 가능성이나 추가 이식이 필요 없음을 보장할 수 없습니다.",
  "checks": [
    "발치가 필요한 근거와 치아 보존 가능성에 대한 설명",
    "발치 부위 보존인지 이미 부족한 뼈의 재건인지 이번 이식의 목적",
    "임플란트·브리지·틀니 등 이후 계획과 아직 결정하지 못한 부분",
    "이식 재료와 막의 종류, 회복 확인과 추가 처치 가능성"
  ],
  "choices": [
    {
      "condition": "향후 임플란트를 고려하며 발치 부위 보존이 도움이 될 조건이라면",
      "option": "발치 시점의 이식과 회복 후 평가 계획을 상담합니다.",
      "limit": "모든 뼈 변화가 막히거나 나중의 추가 이식이 없어지는 것은 아닙니다."
    },
    {
      "condition": "이후 보철 방법을 정하지 못했거나 바로 이식하기 어려운 사정이 있다면",
      "option": "지금 필요한 처치와 결정을 미룰 수 있는 부분, 재평가 시점을 구분합니다.",
      "limit": "미뤄도 조건이 그대로 유지된다고 약속할 수 없고, 반대로 나중 치료가 불가능하다고 일괄 단정하지 않습니다."
    },
    {
      "condition": "임플란트 외의 방법을 우선 생각한다면",
      "option": "해당 보철 계획에서도 이식이 필요한 이유가 있는지 확인합니다.",
      "limit": "치아를 대체하는 방법마다 고려할 장단점이 달라 가격만으로 동일한 치료처럼 비교하기 어렵습니다."
    }
  ],
  "unknown": "이식 범위와 재료, 발치 당일 시행 여부, 회복 기간 및 향후 보철은 실제 검사 후 정합니다. 특정 재료나 일정, 보험 적용, 전체 비용을 이 글에서 약속하지 않습니다.",
  "prepare": [
    "기존 영상과 발치·보철 치료계획서",
    "복용약·주사 치료 및 흡연 여부",
    "결정 가능한 예산 범위와 통원 가능한 시기",
    "동물 유래 재료 등에 관한 개인적인 선호와 질문"
  ],
  "localHeading": "당진에서 발치 후 뼈이식을 상담하러 오신다면",
  "localAdvice": "당진에서 이동한다면 첫 상담, 발치·이식, 회복 확인, 이후 보철 결정을 각각 나누어 문의하세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 여러 번 오기 어렵다는 사정을 전달하되 이동 부담 때문에 충분히 이해하지 못한 치료까지 한 번에 결정할 필요는 없습니다. 필요한 진료 시기는 상태에 맞게 설명받으세요.",
  "related": [
    {
      "title": "임플란트 진료 가이드",
      "href": "/guide/implant"
    },
    {
      "title": "치아 하나가 없을 때 브리지와 임플란트 상담",
      "href": "/concerns/missing-tooth-bridge-or-implant-healthy-neighbors"
    },
    {
      "title": "골다공증 약을 사용하는 분의 발치 상담",
      "href": "/concerns/osteoporosis-medication-before-tooth-extraction"
    }
  ],
  "sources": [
    {
      "title": "AAOMS · 발치 후 뼈 보존과 향후 치료 계획, 2026년 9월 갱신",
      "href": "https://myoms.org/what-we-do/extractions-and-dentoalveolar-surgery/preserving-bone-for-dental-implants-and-oral-health/"
    },
    {
      "title": "AAOMS · 뼈이식 재료와 차폐막, 회복의 개인차",
      "href": "https://myoms.org/what-we-do/extractions-and-dentoalveolar-surgery/bone-grafts/"
    },
    {
      "title": "Cambridge University Hospitals NHS · 임플란트 뼈이식의 목적·위험·대안",
      "href": "https://www.cuh.nhs.uk/patient-information/bone-grafting-for-dental-implants/"
    }
  ],
  "updated": "2026-10-06",
  "publishedAt": "2026-10-06T09:00:00+09:00"
},
{
  "slug": "water-enters-nose-after-upper-molar-extraction",
  "title": "윗어금니를 뺀 뒤 물이 코로 새는 느낌이에요. 상처가 아물 때까지 기다려도 되나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "발치 후 불편",
  "concern": "분명 이를 뺐는데 코에서 이상한 느낌이 나서 겁이 날 때",
  "description": "서산에서 윗어금니 발치 후 물이 코로 새거나 공기가 통하는 느낌을 겪는 환자분을 위한 안내. 입과 상악동 사이 연결 가능성, 빠른 확인이 필요한 이유와 진료 전 주의사항을 설명합니다.",
  "situation": "서산에서 윗어금니를 뺀 뒤 물을 마시다가 같은 쪽 코로 물이 나오는 듯했습니다. 통증이 심하지 않아 괜찮은 건지, 다시 수술해야 하는 건지 알 수 없고 멀리 진료를 받으러 가야 할까 봐 망설여집니다.",
  "answer": "윗어금니 발치 뒤 물이 코로 새거나 발치 자리에 공기가 통하는 느낌이 있다면, 입과 상악동 사이에 연결이 생겼는지 확인이 필요합니다. 통증이 적어도 예정된 재진까지 그냥 기다리지 말고 발치한 치과에 증상을 알리고 빠르게 진료 시기를 안내받으세요. 코를 세게 풀거나 물을 반복해서 마시며 스스로 시험하지 마세요.",
  "checks": [
    "발치한 치아의 위치와 날짜, 증상이 처음 생긴 시각",
    "물이 코로 나온 느낌과 공기 통과 느낌의 양상",
    "한쪽 코막힘·분비물·볼의 압박감 등 함께 생긴 변화",
    "발치 당시 설명과 처치, 이후 복용한 약과 주의사항"
  ],
  "choices": [
    {
      "condition": "물을 마신 뒤 코로 새거나 상처에 공기가 통하는 느낌이 있다면",
      "option": "발치한 치과에 먼저 연락해 진찰과 필요한 평가를 받습니다.",
      "limit": "느낌만으로 연결의 유무나 크기를 집에서 판단할 수 없습니다."
    },
    {
      "condition": "검사 후 작은 연결이며 경과 관찰이 적절하다고 판단된다면",
      "option": "의료진의 보호 지침과 재평가 일정을 따릅니다.",
      "limit": "작아 보인다는 이유로 스스로 기다리는 것과는 다릅니다."
    },
    {
      "condition": "연결이 크거나 지속되거나 다른 문제가 함께 확인된다면",
      "option": "폐쇄 처치 및 필요한 구강악안면외과 진료 등을 상담합니다.",
      "limit": "한 가지 수술법이나 당일 해결 가능 여부를 미리 정할 수 없습니다."
    }
  ],
  "unknown": "상악동과의 연결 여부, 감염 동반 여부와 치료 범위는 진찰 후 판단합니다. 이 글은 발치 과정의 잘못을 판정하거나 특정 처치의 성공을 보장하지 않습니다.",
  "prepare": [
    "발치 날짜와 치아 위치, 기존 영상이 있다면 그 자료",
    "새 증상의 시작 시점과 변화 메모",
    "처방전과 현재 복용약 목록",
    "발치한 치과에서 받은 안내 및 연락처"
  ],
  "localHeading": "서산에서 발치 후 불편을 확인받으신다면",
  "localAdvice": "서산에서 이동을 준비하기 전에 발치한 치과에 코로 물이 새는 듯한 발치 후 불편을 구체적으로 알리세요. 서울비디치과의 진료 장소는 천안 불당동이며 서산 분원이 아닙니다. 이동 거리가 부담스럽다면 현재 위치와 가능한 시간을 말하고 가까운 진료가 필요한지부터 안내받으세요. 먼 예약 날짜에 맞추려고 새 증상을 참지 마세요.",
  "related": [
    {
      "title": "사랑니와 발치 진료 가이드",
      "href": "/guide/wisdom-tooth"
    },
    {
      "title": "발치 나흘 뒤 통증이 더 심해졌을 때",
      "href": "/concerns/extraction-pain-worse-on-day-four"
    },
    {
      "title": "혈액을 묽게 하는 약을 복용 중인 분의 발치 상담",
      "href": "/concerns/tooth-extraction-while-taking-blood-thinners"
    }
  ],
  "sources": [
    {
      "title": "Newcastle Hospitals NHS · 윗어금니 발치 후 상악동 연결과 관리",
      "href": "https://www.newcastle-hospitals.nhs.uk/resources/surgical-removal-of-teeth/"
    },
    {
      "title": "University Hospitals of Leicester NHS · 구강상악동 교통 환자 안내, 2024년 제작·2027년 검토 예정",
      "href": "https://yourhealth.leicestershospitals.nhs.uk/library/musculoskeletal-specialist-surgery-mss/maxillofacial/3373-oro-antral-communication-oac/file"
    }
  ],
  "updated": "2026-10-06",
  "publishedAt": "2026-10-06T09:00:00+09:00"
},
{
  "slug": "heart-racing-after-dental-local-anesthetic",
  "title": "치과 마취 뒤 심장이 두근거렸어요. 마취약 알레르기라면 치료를 어떻게 받죠?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "치과 마취",
  "concern": "지난번 마취 때의 두근거림이 떠올라 치료 예약을 미루고 있을 때",
  "description": "천안에서 치과 마취 뒤 두근거림을 경험한 환자분을 위한 안내. 긴장·약 성분 반응과 알레르기를 구분할 기록, 응급 증상, 다음 진료를 준비하는 상담 질문을 정리합니다.",
  "situation": "천안에서 충치 치료 중 마취 주사를 맞은 뒤 심장이 빠르게 뛰고 손이 떨렸습니다. 잠시 쉬자 나아졌지만 또 같은 일이 생길까 두려워 치료를 미루고 있습니다. 마취 알레르기라면 앞으로 치과 치료를 못 받는 건 아닐까 걱정됩니다.",
  "answer": "두근거림만으로 치과 마취약 알레르기를 확정하지는 않습니다. 긴장이나 마취액에 포함되는 혈관수축제 반응 등 여러 가능성을 당시 기록과 함께 살펴야 합니다. 다음 예약 전에 증상의 시작·지속 시간과 동반 증상을 알리세요. 현재 두근거림이 가라앉지 않거나 가슴 통증·숨참·실신, 혀나 목의 부종이 있으면 119 등 응급 도움을 받으세요.",
  "checks": [
    "주사 전부터인지 맞은 직후인지 등 증상의 시작 시점",
    "두근거림의 지속 시간과 당시 받은 관찰·처치 기록",
    "발진·부종·숨참·가슴 통증·의식 변화 등 동반 증상",
    "사용한 마취제와 복용약, 기존 심장 질환 및 평소 두근거림"
  ],
  "choices": [
    {
      "condition": "이전 두근거림이 가라앉았고 현재 응급 증상이 없다면",
      "option": "다음 치료 전에 당시 경과와 기록을 검토하고 마취 계획을 상담합니다.",
      "limit": "오래전 기억만으로 원인을 하나로 확정하기 어렵습니다."
    },
    {
      "condition": "알레르기가 의심되는 동반 증상이나 기록이 있다면",
      "option": "의료진 판단에 따라 관련 전문 평가와 사용할 약에 대한 확인을 받습니다.",
      "limit": "마취 주사를 임의로 다시 맞아 반응을 시험하지 않습니다."
    },
    {
      "condition": "현재 지속되는 두근거림이나 가슴 통증·호흡 곤란·실신이 있다면",
      "option": "일반 치과 예약을 기다리지 말고 응급 도움을 받습니다.",
      "limit": "과거에도 긴장한 적이 있다는 이유로 현재 증상을 단순 불안으로 넘기지 않습니다."
    }
  ],
  "unknown": "이 글만으로 알레르기·부정맥·불안 반응을 진단하거나 특정 마취제가 안전하다고 보장할 수 없습니다. 개인 상태와 당시 기록을 확인한 뒤 진료 환경과 약제 선택을 정합니다.",
  "prepare": [
    "당시 치료 날짜와 치과, 가능한 경우 마취 및 처치 기록",
    "증상의 순서와 지속 시간, 피부·호흡 증상 메모",
    "복용약과 건강보조제 목록, 확인된 알레르기 정보",
    "가장 두려운 순간과 진료 중 멈춤 신호에 대한 요청"
  ],
  "localHeading": "천안에서 치과 마취가 걱정되어 상담하신다면",
  "localAdvice": "천안에서 치과 마취 경험 때문에 치료를 미뤘다면 예약 때 미리 알려 설명을 위한 시간을 문의하세요. 서울비디치과는 천안 불당동에서 진료합니다. 첫 상담에서 기록 확인과 치료 계획을 나누어 듣고, 진료 중 불편을 알릴 방법도 정할 수 있습니다. 응급 증상이 현재 있다면 치과 상담 예약보다 응급 평가가 먼저입니다.",
  "related": [
    {
      "title": "신경치료 진료 가이드",
      "href": "/guide/root-canal"
    },
    {
      "title": "마취했는데 아팠던 기억 때문에 신경치료가 두려울 때",
      "href": "/concerns/root-canal-fear-after-pain-despite-anesthesia"
    },
    {
      "title": "구역질 때문에 치과 치료를 미루고 있을 때",
      "href": "/concerns/gag-reflex-keeps-delaying-dental-care"
    }
  ],
  "sources": [
    {
      "title": "NHS Specialist Pharmacy Service · 치과 국소마취 주사 후 반응의 구분과 기록",
      "href": "https://sps.nhs.uk/articles/managing-reactions-to-dental-local-anaesthetic-injections/"
    },
    {
      "title": "NHS · 국소마취의 역할과 이상 반응, 2025년 12월 검토",
      "href": "https://www.nhs.uk/tests-and-treatments/local-anaesthesia/"
    },
    {
      "title": "NHS · 두근거림과 응급 평가 신호, 2026년 3월 검토",
      "href": "https://www.nhs.uk/symptoms/heart-palpitations/"
    }
  ],
  "updated": "2026-10-06",
  "publishedAt": "2026-10-06T09:00:00+09:00"
},
{
  "slug": "child-early-baby-molar-loss-space-maintainer",
  "title": "아이 유치를 일찍 뽑았는데 공간유지장치를 하자고 해요. 꼭 필요한가요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "공간유지장치",
  "concern": "아이 이를 지켜주지 못했다는 미안함에 추가 장치 설명까지 어렵게 들릴 때",
  "description": "아산에서 아이의 유치 조기 발치 뒤 공간유지장치를 권유받은 보호자를 위한 안내. 장치의 목적과 관찰할 수 있는 조건, 관리와 재진, 이후 교정과의 차이를 설명합니다.",
  "situation": "아산에서 아이의 썩은 유치 어금니를 일찍 뽑았습니다. 아픈 치료가 끝나 한숨 돌렸는데 빈자리에 공간유지장치를 해야 한다고 합니다. 젖니 하나 때문에 치료가 커지는 것 같고, 늦게 데려온 제 탓인가 싶어 설명을 차분히 듣기 어렵습니다.",
  "answer": "공간유지장치는 일찍 없어진 유치의 빈자리를 관리하기 위한 선택이며, 유치를 뺐다고 모든 아이에게 자동으로 필요하지는 않습니다. 빠진 치아의 위치와 시기, 남은 공간, 후속 영구치의 발육과 맹출 상태, 관리 가능성을 함께 평가합니다. 장치를 해도 이후 교정이 필요 없다고 보장할 수 없으며, 장착 후 확인과 적절한 제거 시점까지 계획해야 합니다.",
  "checks": [
    "빠진 유치가 어느 치아인지와 발치 시기",
    "뒤이어 날 영구치의 유무·발육·위치와 남은 공간",
    "주변 치아와 전체 치열, 이미 생긴 공간 변화",
    "아이의 협조와 위생 관리, 정기 확인이 가능한 일정"
  ],
  "choices": [
    {
      "condition": "남은 공간을 유지할 필요가 있다고 판단된다면",
      "option": "맞는 장치 종류와 관리 방법, 점검·제거 계획을 설명받습니다.",
      "limit": "장치가 모든 치열 문제나 향후 교정 치료를 예방하지는 않습니다."
    },
    {
      "condition": "현재 상태에서 장치 없이 관찰할 수 있다면",
      "option": "무엇을 언제 다시 확인할지 정하고 경과를 살핍니다.",
      "limit": "아무런 확인 없이 영구치가 나올 때까지 기다리는 계획은 아닙니다."
    },
    {
      "condition": "이미 공간이 줄었거나 다른 맹출 문제가 있다면",
      "option": "단순 유지와 공간 회복 등 필요한 평가를 구분해 상담합니다.",
      "limit": "수동적으로 공간을 지키는 장치만으로 모든 변화를 되돌릴 수는 없습니다."
    }
  ],
  "unknown": "장치의 필요성·종류와 사용 기간은 아이의 발육과 실제 검사를 보고 정합니다. 나이만으로 시작·제거 날짜를 정하거나 특정 장치의 비용, 교정 회피 가능성을 약속하지 않습니다.",
  "prepare": [
    "발치 날짜와 치아 위치, 기존 영상과 진료 내용",
    "현재 불편과 아이가 걱정하는 점",
    "양치·식사 습관과 보호자가 도울 수 있는 부분",
    "학교 일정과 통원 가능 시기, 비용 문의 항목"
  ],
  "localHeading": "아산에서 공간유지장치 상담을 준비하신다면",
  "localAdvice": "아산에서 공간유지장치 진료를 위해 이동한다면 장착일뿐 아니라 점검과 제거를 위한 방문도 함께 문의하세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 학교와 보호자 근무 일정에 맞출 수 있는 범위를 말하되, 장치 불편이나 흔들림이 생겼을 때 연락할 경로도 정해 두세요.",
  "related": [
    {
      "title": "교정 진료 가이드",
      "href": "/guide/orthodontics"
    },
    {
      "title": "곧 빠질 유치의 충치도 치료해야 할까요?",
      "href": "/concerns/baby-molar-cavity-treat-before-falling-out"
    },
    {
      "title": "유치가 빠졌는데 앞니 영구치가 늦게 나올 때",
      "href": "/concerns/permanent-front-tooth-not-coming-after-baby-tooth"
    }
  ],
  "sources": [
    {
      "title": "AAPD · 발육 중 치열과 교합 관리, 2024년 개정·2026–2027 참고 매뉴얼",
      "href": "https://www.aapd.org/research/oral-health-policies--recommendations/management-of-the-developing-dentition-and-occlusion-in-pediatric-dentistry/"
    },
    {
      "title": "NHS · 유치의 역할과 어린이 치아 관리",
      "href": "https://www.nhs.uk/best-start-in-life/how-to-take-care-of-your-baby-or-toddlers-teeth/"
    },
    {
      "title": "East Sussex Healthcare NHS · 가철식 장치의 용도와 한계",
      "href": "https://www.esht.nhs.uk/leaflet/removable-appliances/"
    }
  ],
  "updated": "2026-10-06",
  "publishedAt": "2026-10-06T09:00:00+09:00"
},
{
  "slug": "smoked-after-implant-surgery-worried-about-failure",
  "title": "임플란트 수술 뒤 담배를 다시 피웠어요. 이미 실패한 건가요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "임플란트와 흡연",
  "concern": "금연 약속을 지키지 못한 미안함 때문에 수술한 치과에 연락하기 어려울 때",
  "description": "홍성에서 임플란트 수술 뒤 다시 흡연해 실패가 걱정될 때, 자책보다 먼저 확인할 증상과 금연 지원, 수술 후 점검을 정리합니다.",
  "situation": "홍성에서 임플란트 수술을 받고 금연하겠다고 했는데 며칠 뒤 다시 담배를 피웠습니다. 아직 크게 아프지는 않지만 뼈가 붙지 않으면 어쩌나 걱정되고, 혼날 것 같아 치과에 전화하기도 망설여집니다.",
  "answer": "흡연은 임플란트 주변의 치유와 장기 유지에 불리한 위험요인이지만, 다시 피웠다는 사실만으로 이미 실패했다고 판정할 수는 없습니다. 수술한 곳에 흡연 시점과 현재 증상을 알리고 예정된 점검을 이어가세요. 지금부터 중단을 다시 시도하고, 혼자 어렵다면 의료진과 금연 지원을 상의하는 것이 다음 행동입니다.",
  "checks": [
    "수술 날짜와 부위, 뼈이식 등 함께 받은 처치",
    "흡연을 다시 시작한 시점과 평소 사용량, 전자담배 등 다른 제품",
    "통증·붓기·출혈이 처음보다 어떻게 변했는지",
    "복용약, 잇몸 관리 방법과 다음 점검 일정"
  ],
  "choices": [
    {
      "condition": "특별한 이상 없이 치유 상태를 확인하는 단계라면",
      "option": "수술 부위를 점검하고 개인별 관리·금연 계획을 다시 정합니다.",
      "limit": "통증이 적다는 이유만으로 뼈와의 결합이 끝났다고 판단하지 않습니다."
    },
    {
      "condition": "통증이나 붓기가 심해지거나 움직임이 느껴진다면",
      "option": "예약일을 기다리지 말고 치료한 치과에 증상을 알려 진료 시점을 안내받습니다.",
      "limit": "흡연 때문이라고 스스로 원인을 정하거나 항생제만 추가하지 않습니다."
    },
    {
      "condition": "중단을 반복해서 시도하지만 유지하기 어렵다면",
      "option": "흡연 습관과 수술 상태에 맞는 금연 상담·치료 지원을 문의합니다.",
      "limit": "니코틴 대체제나 약의 종류는 임의로 정하지 않고 의료진과 확인합니다."
    }
  ],
  "unknown": "흡연 횟수나 잇몸 사진만으로 개인의 실패 확률·재수술 필요성을 계산할 수 없습니다. 나사를 만지거나 단단한 것을 씹어 고정을 시험하지 마세요. 숨쉬기나 삼키기가 어렵거나 출혈이 멎지 않는 상황은 응급 평가가 필요합니다.",
  "prepare": [
    "수술 후 안내문과 처방 목록",
    "증상이 달라진 날짜를 적은 짧은 메모",
    "사용하는 담배·전자담배 및 금연 보조제 이름",
    "다음 방문이 가능한 날짜와 이동 계획"
  ],
  "localHeading": "홍성에서 다시 방문하기 전, 걱정과 증상을 먼저 알려주세요.",
  "localAdvice": "홍성에서 천안 불당동으로 임플란트와 흡연 상담을 오신다면 수술 기록과 안내문이 있는지 알려주세요. 수술 직후 불편은 먼저 수술한 치과에 연락해 현재 상태를 설명하는 것이 좋습니다. 이동이 어렵다는 이유로 점검을 생략하기보다 어떤 증상일 때 더 일찍 확인해야 하는지 함께 정하세요.",
  "related": [
    {
      "title": "임플란트 치료와 관리 가이드",
      "href": "/guide/implant"
    },
    {
      "title": "임플란트 옆 잇몸에서 피가 날 때",
      "href": "/concerns/implant-gums-bleed-without-pain"
    },
    {
      "title": "재수술을 고민할 때 확인할 것",
      "href": "/treatments/implant-revision"
    }
  ],
  "sources": [
    {
      "title": "FDA · 임플란트 치료의 위험요인과 수술 후 관리",
      "href": "https://www.fda.gov/medical-devices/dental-devices/dental-implants-what-you-should-know"
    },
    {
      "title": "FDA · 담배와 전자담배의 구강 건강 영향",
      "href": "https://www.fda.gov/tobacco-products/health-effects-tobacco-use/how-tobacco-use-affects-oral-health"
    },
    {
      "title": "Guy’s and St Thomas’ NHS · 임플란트 수술 후 관리와 금연",
      "href": "https://www.guysandstthomas.nhs.uk/health-information/dental-implants/after-having-dental-implant"
    }
  ],
  "updated": "2026-10-07",
  "publishedAt": "2026-10-07T09:00:00+09:00"
},
{
  "slug": "loose-dentures-afraid-to-speak-adhesive",
  "title": "틀니가 자꾸 들떠 말하기가 겁나요. 접착제를 더 쓰면 괜찮을까요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "들뜨는 틀니",
  "concern": "사람들 앞에서 틀니가 빠질까 말을 아끼고 식사 약속을 피하게 될 때",
  "description": "예산에서 틀니가 들떠 대화와 식사가 불안할 때, 적응과 맞음새 문제를 구분하고 틀니 접착제·조정·내면 보완·재제작을 상담하는 방법입니다.",
  "situation": "예산에서 쓰는 틀니가 말하거나 식사할 때 살짝 들립니다. 밖에서 빠질까 봐 입을 작게 벌리고 웃는 것도 조심합니다. 새로 만들 비용이 부담돼 접착제를 더 바르면 버틸 수 있을지 궁금합니다.",
  "answer": "틀니가 들뜨면 잇몸과 틀니의 맞음새, 씹을 때의 접촉과 틀니 상태를 확인해야 합니다. 전용 접착제는 적절하게 사용할 때 보조가 될 수 있지만 맞지 않는 틀니를 계속 버티게 하는 해결책은 아닙니다. 필요한 경우 조정·내면 보완·재제작을 구분해 설명받고, 사용량을 늘리기 전에 치과에 문의하세요.",
  "checks": [
    "새 틀니인지, 잘 쓰다가 언제부터 들뜨기 시작했는지",
    "대화·기침·씹기 중 어느 상황에서 어느 쪽이 움직이는지",
    "통증·헐음·식사 곤란과 틀니 치아의 마모·파절 여부",
    "접착제 제품과 사용 빈도·양, 잇몸과 남은 치아의 상태"
  ],
  "choices": [
    {
      "condition": "초기 적응과 부분적인 조정이 필요한 경우",
      "option": "착용·발음 연습과 필요한 조정, 재확인 일정을 상담합니다.",
      "limit": "아픈 곳을 계속 눌러가며 참는 것을 적응이라고 보지 않습니다."
    },
    {
      "condition": "틀니 안쪽과 잇몸 사이가 맞지 않는 경우",
      "option": "기존 틀니를 활용한 내면 보완이 가능한지 확인합니다.",
      "limit": "치아 배열·맞물림 등 다른 문제가 함께 있으면 보완만으로 충분하지 않을 수 있습니다."
    },
    {
      "condition": "마모나 손상·전체 맞음새 문제로 재제작이 필요한 경우",
      "option": "당장 쓸 수 있는 대책과 새 틀니 제작 과정·비용을 나누어 설명받습니다.",
      "limit": "들뜬다는 이유만으로 임플란트나 새 틀니가 무조건 필요한 것은 아닙니다."
    }
  ],
  "unknown": "접착제의 권장량은 제품과 사용 조건에 따라 다릅니다. 설명서를 넘겨 바르거나 가정용 접착제를 사용하지 마세요. 틀니나 고리를 스스로 갈거나 구부려 맞추지 말고, 계속 헐거나 먹기 어려우면 진료를 요청하세요.",
  "prepare": [
    "현재 쓰는 틀니와 이전 틀니가 있다면 함께 준비",
    "접착제 포장·설명서와 대략적인 사용량",
    "발치·틀니 제작·조정 시기",
    "먹기 어려운 음식과 불편한 상황, 가능한 방문 일정"
  ],
  "localHeading": "예산에서 오는 길이 부담돼도, 일상의 불편을 작게 말하지 않으셔도 됩니다.",
  "localAdvice": "예산에서 천안 불당동으로 들뜨는 틀니 상담을 오신다면 틀니를 가져오고 접착제 사용 여부를 알려주세요. 이동 전에 상담·조정 가능한 범위와 준비를 문의하되 한 번에 모든 적응과 수리가 끝날 것으로 가정하지 마세요. 수술 직후 틀니는 평소 관리와 다를 수 있어 받은 안내를 먼저 확인합니다.",
  "related": [
    {
      "title": "틀니 치료와 적응 가이드",
      "href": "/guide/denture"
    },
    {
      "title": "틀니와 임플란트 선택 비교",
      "href": "/guide/compare/denture-vs-implant"
    },
    {
      "title": "틀니가 같은 자리만 헐게 할 때",
      "href": "/concerns/denture-sore-same-spot"
    }
  ],
  "sources": [
    {
      "title": "FDA · 틀니 접착제의 역할과 과량 사용 주의",
      "href": "https://www.fda.gov/medical-devices/dental-devices/denture-adhesives"
    },
    {
      "title": "Cambridge University Hospitals NHS · 틀니 적응·관리와 내면 보완",
      "href": "https://www.cuh.nhs.uk/patient-information/denture-care-looking-after-your-dentures/"
    }
  ],
  "updated": "2026-10-07",
  "publishedAt": "2026-10-07T09:00:00+09:00"
},
{
  "slug": "recurrent-blister-inside-lower-lip",
  "title": "입술 안쪽 물집이 터졌다 다시 생겨요. 직접 짜도 되나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "입술 안쪽 물집",
  "concern": "사라졌다고 생각할 때마다 같은 곳이 다시 볼록해져 신경 쓰일 때",
  "description": "당진에서 입술 안쪽 물집이 반복돼 걱정될 때, 점액낭종 등 가능한 원인과 진찰 후 관찰·제거를 나누는 기준, 조직검사와 방문 준비를 정리합니다.",
  "situation": "당진에서 생활하며 아랫입술 안쪽에 말랑한 물집이 생겼습니다. 식사하다 터지면 나은 것 같은데 며칠 지나 다시 올라옵니다. 아프지는 않아 미루다가 계속 씹히니 직접 짜고 싶고, 검색한 사진과 비슷한지 비교할수록 걱정됩니다.",
  "answer": "터졌다 다시 차는 입술 안쪽 물집은 작은 침샘과 관련된 점액낭종에서 볼 수 있지만, 모습만으로 확정할 수는 없습니다. 바늘로 찌르거나 짜지 말고 반복된 기간과 변화를 정리해 진찰받으세요. 진찰로 성격을 확인한 작은 병변은 관찰할 수 있고, 계속 씹히거나 생활에 불편을 주면 제거 등 처치를 검토합니다.",
  "checks": [
    "처음 생긴 날짜와 터졌다 다시 부풀기까지의 경과",
    "크기·색·단단함이 달라지는지와 통증·출혈 여부",
    "식사나 말할 때 씹히는 위치, 입술을 무는 습관",
    "같은 부위에 이전 처치가 있었는지와 복용약"
  ],
  "choices": [
    {
      "condition": "진찰에서 작은 점액낭종으로 판단되고 별다른 불편이 없다면",
      "option": "관찰 가능 여부와 다시 확인할 시점을 정합니다.",
      "limit": "진단받지 않은 모든 입안 혹을 그대로 두어도 된다는 뜻은 아닙니다."
    },
    {
      "condition": "반복해서 씹히거나 먹고 말하는 데 방해가 된다면",
      "option": "병변과 관련된 작은 침샘을 함께 평가해 제거 등 처치 범위를 상의합니다.",
      "limit": "스스로 물만 빼는 것과 원인을 평가해 처치하는 것은 다릅니다."
    },
    {
      "condition": "모양이 불분명하거나 계속 커지고 다른 변화가 있다면",
      "option": "조직검사 또는 적절한 진료과 평가가 필요한지 확인합니다.",
      "limit": "검사를 권했다는 사실만으로 악성 질환을 의미하지는 않습니다."
    }
  ],
  "unknown": "입안 사진이나 물집의 색만으로 점액낭종·염증·다른 병변을 구분할 수 없습니다. 빠르게 커지는 부종, 호흡·삼킴 곤란은 즉시 진료가 필요합니다. 잘 낫지 않는 상처나 지속되는 덩어리도 통증이 없다는 이유로 미루지 마세요.",
  "prepare": [
    "부풀었을 때 이미 찍어 둔 사진과 촬영 날짜",
    "반복 횟수와 불편한 식사·말하기 상황",
    "복용약 목록과 출혈·알레르기 관련 병력",
    "이전에 처치했다면 해당 기록이나 검사 결과"
  ],
  "localHeading": "당진에서 입술 안쪽 물집을 확인하러 오신다면",
  "localAdvice": "당진에서 천안 불당동으로 입술 안쪽 물집 상담을 계획한다면 반복된 기간과 크기 변화, 씹혀서 불편한 정도를 예약 시 알려주세요. 진찰만 하는 날과 처치·결과 설명을 받는 날이 나뉠 수 있으므로 이동 일정을 함께 상의하세요. 서울비디치과의 실제 진료 장소는 천안 불당동이며, 필요한 진료 범위나 다른 진료과 의뢰 여부는 상태를 확인한 뒤 안내합니다.",
  "related": [
    {
      "title": "증상에 맞는 진료와 상담을 고르는 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "입안이 같은 자리에서 오래 헐어 있을 때",
      "href": "/concerns/mouth-ulcer-same-spot-over-three-weeks"
    },
    {
      "title": "구강내과 진료 안내",
      "href": "/treatments/oral-medicine"
    }
  ],
  "sources": [
    {
      "title": "Royal Berkshire NHS · 침샘 점액낭종의 경과와 치료 선택, 2026년 5월",
      "href": "https://www.royalberkshire.nhs.uk/media/5mpbcsud/salivary-mucoceles_may26.pdf"
    },
    {
      "title": "UCLH NHS · 구강 점막 조직검사의 목적과 과정",
      "href": "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/oral-mucosal-biopsy"
    },
    {
      "title": "NHS · 입안의 지속되는 덩어리·상처와 진료가 필요한 변화",
      "href": "https://www.nhs.uk/conditions/mouth-cancer/symptoms/"
    }
  ],
  "updated": "2026-10-07",
  "publishedAt": "2026-10-07T09:00:00+09:00"
},
{
  "slug": "iv-dental-sedation-awake-memory-worry",
  "title": "진정치료를 하면 완전히 자나요? 치료 중 기억이 남을까 봐 걱정돼요.",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "치과 진정치료",
  "concern": "무섭지 않게 치료받고 싶지만 의식을 잃거나 중간에 깨어날까 걱정될 때",
  "description": "서산에서 치과 정맥 진정치료를 고민할 때, 의식과 기억·국소마취의 차이, 불안 전달 방법과 사전 평가, 보호자 동행 및 귀가 준비를 설명합니다.",
  "situation": "서산에서 치과 치료를 알아보다 수면치료라는 말을 들었습니다. 아무것도 모르고 끝나면 좋겠는데 완전히 의식을 잃는 것도 무섭습니다. 중간에 깨어나 아프다고 말하지 못하거나 무서운 장면이 기억에 남을까 봐 결정을 미루고 있습니다.",
  "answer": "수면치료라는 표현만으로 의식 상태를 알 수는 없습니다. 정맥 의식하 진정은 긴장을 낮추면서 말이나 지시에 반응할 수 있는 상태를 목표로 하며 전신마취와 다릅니다. 기억이 적게 남는 분도 있지만 기억이 전혀 없다고 보장하지 않습니다. 통증 조절에는 별도의 국소마취가 쓰일 수 있으므로 예정된 진정 방법과 마취·안전 관찰·귀가 계획을 각각 확인하세요.",
  "checks": [
    "예정된 치료와 진정 방법, 목표로 하는 의식 수준",
    "이전 마취·진정 경험에서 힘들었던 점과 원하는 설명 방식",
    "질환·복용약·수면무호흡 등 사전 평가에 필요한 정보",
    "보호자 동행과 귀가 후 돌봄, 운전·업무 일정"
  ],
  "choices": [
    {
      "condition": "설명과 중간 휴식, 국소마취로 치료를 시도할 수 있다면",
      "option": "멈춤 신호와 짧은 치료 계획을 먼저 상의합니다.",
      "limit": "진정치료를 받지 않는 선택이 무조건 참아야 한다는 뜻은 아닙니다."
    },
    {
      "condition": "불안이 커서 정맥 의식하 진정을 고려한다면",
      "option": "적합성을 평가하고 통증 조절·관찰·회복 계획을 함께 정합니다.",
      "limit": "완전한 수면이나 기억 소실, 모든 치료의 당일 완료를 보장하지 않습니다."
    },
    {
      "condition": "건강 상태나 필요한 처치가 현재 진료 환경과 맞지 않는다면",
      "option": "다른 방법이나 적절한 진료기관 평가를 논의합니다.",
      "limit": "불안이 크다는 이유만으로 약을 더 쓰거나 전신마취를 바로 결정하지 않습니다."
    }
  ],
  "unknown": "진정 약의 종류·용량·식사와 복약 안내는 개인 상태 및 치료기관의 계획에 따라 달라집니다. 인터넷의 금식 시간을 그대로 적용하거나 평소 약을 임의로 끊지 마세요. 현재 글은 일반적인 정맥 의식하 진정 설명이며 특정 환자분에게 가능한 방법을 확정하지 않습니다.",
  "prepare": [
    "복용 중인 약·보조제 목록과 주요 질환",
    "이전 진정·마취 기록이 있다면 준비",
    "가장 무서운 장면과 도움이 되는 대처 방식 메모",
    "동행 가능한 성인 보호자와 귀가 후 일정"
  ],
  "localHeading": "서산에서 치과 진정치료를 준비하신다면",
  "localAdvice": "서산에서 천안 불당동으로 치과 진정치료 상담을 오신다면 치료 당일 본인이 운전해서 돌아가는 계획은 세우지 마세요. 진정 시행 여부를 정하기 전 보호자 동행·귀가 방법과 회복 후 주의 시간을 확인해야 합니다. 상담일과 실제 치료일이 다를 수 있고 첫 방문에서 가능한 범위도 달라집니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다.",
  "related": [
    {
      "title": "진정치료와 일반 치료를 비교할 때",
      "href": "/guide/compare/sedation-vs-normal"
    },
    {
      "title": "진정치료 전 놓치기 쉬운 질문",
      "href": "/guide/regret/sedation"
    },
    {
      "title": "진정치료 진료 안내",
      "href": "/treatments/sedation"
    },
    {
      "title": "입안 기구에 구역질이 나서 치료를 미룰 때",
      "href": "/concerns/gag-reflex-keeps-delaying-dental-care"
    }
  ],
  "sources": [
    {
      "title": "Guy’s and St Thomas’ NHS · 치과 진정 방법과 전신마취의 차이, 2026년 5월",
      "href": "https://www.guysandstthomas.nhs.uk/health-information/sedation-options-dental-treatment"
    },
    {
      "title": "Wirral Community NHS · 정맥 의식하 진정의 의식·기억·국소마취와 안전 관찰",
      "href": "https://www.wchc.nhs.uk/resources/having-dental-treatment-under-intravenous-conscious-sedation/"
    },
    {
      "title": "Rotherham NHS · 치과 정맥 진정 후 보호자와 귀가 준비",
      "href": "https://www.therotherhamft.nhs.uk/patients-and-visitors/patient-information/dental-iv-sedation-escort-information"
    }
  ],
  "updated": "2026-10-07",
  "publishedAt": "2026-10-07T09:00:00+09:00"
},
{
  "slug": "deep-cavity-can-the-nerve-be-preserved",
  "title": "충치가 깊다는데 신경을 살려 볼 수 있대요. 치료를 미루는 건 아닐까요?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "충치 치료",
  "concern": "설명이 달라 결정하기 어려워요",
  "description": "천안에서 깊은 충치의 신경 보존을 제안받았을 때 선택적 충치 제거·치수 치료와 신경치료의 차이, 치료 중 계획 변경과 이후 관찰을 준비합니다.",
  "situation": "천안에서 어금니 충치 치료를 상담받았습니다. 신경치료가 필요할 수 있다는 말과 신경을 살려 보자는 말을 함께 들으니, 덜 치료했다가 나중에 더 아파지는 것은 아닌지 걱정됩니다.",
  "answer": "깊은 충치라도 치아 안쪽 치수의 상태와 남은 치아 구조에 따라 보존을 고려할 수 있습니다. 선택적으로 충치를 제거하고 밀폐하는 방법과 노출된 치수를 치료하는 방법은 다르며, 치료 중 확인한 소견에 따라 신경치료로 계획이 바뀔 수 있습니다. 시도할 조건과 바꿀 기준, 재검 계획을 함께 확인하세요.",
  "checks": [
    "찬 자극이 사라진 뒤에도 통증이 이어지는지, 가만히 있거나 밤에도 아픈지",
    "충치 깊이와 치수 사이의 구조, 치아를 다시 수복할 수 있는지",
    "노출된 치수가 있다면 실제 조직 상태와 출혈 조절 가능 여부",
    "치료 뒤 밀폐·최종 수복·재검까지의 계획"
  ],
  "choices": [
    {
      "condition": "치수가 정상 또는 회복 가능한 염증으로 평가되고 깊은 충치가 있다면",
      "option": "치수 노출을 줄이는 선택적 충치 제거와 밀폐 수복 등을 검토합니다.",
      "limit": "충치를 무조건 남겨도 된다는 뜻은 아니며 적절한 대상 선정이 필요합니다."
    },
    {
      "condition": "치수가 노출됐어도 보존 조건이 맞는다면",
      "option": "치수복조나 부분·전체 치수절단술 등 생활치수 치료를 고려합니다.",
      "limit": "남길 조직의 상태를 확인해야 하며 모든 깊은 충치에 적용하지 않습니다."
    },
    {
      "condition": "치수 보존이 적절하지 않은 상태로 확인된다면",
      "option": "신경치료 등 다른 치료로 전환할 이유와 치아 유지 가능성을 설명받습니다.",
      "limit": "처음의 희망과 치료 도중 확인된 사실을 구분해야 합니다."
    }
  ],
  "unknown": "통증의 유무나 엑스레이 한 장만으로 신경을 반드시 살릴 수 있다고 약속할 수 없습니다. 얼굴이 붓거나 열이 나고 통증이 커지면 예정일보다 빨리 진료를 요청하세요. 호흡·삼킴 곤란이 동반되면 즉시 응급 평가가 필요합니다.",
  "prepare": [
    "통증이 시작된 시점과 자극 후 지속 양상",
    "기존 영상·견적·설명 중 이해되지 않았던 부분",
    "복용약과 치료받을 수 있는 날짜",
    "보존 시도 후 추가 치료가 필요한 경우의 비용 질문"
  ],
  "localHeading": "천안에서 충치 치료 상담을 준비하신다면",
  "localAdvice": "천안에서 깊은 충치 치료를 고민하신다면 신경 보존을 원하는 마음과 다시 아플까 걱정되는 부분을 함께 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 첫 검사에서 알 수 있는 범위와 치료 도중 판단할 부분, 추후 재검 일정을 나누어 상의하세요.",
  "related": [
    {
      "title": "신경치료 가이드",
      "href": "/guide/root-canal"
    },
    {
      "title": "신경치료와 임플란트를 비교하기 전",
      "href": "/guide/compare/root-canal-vs-implant"
    },
    {
      "title": "통증이 없는데 신경치료를 권유받았을 때",
      "href": "/concerns/root-canal-recommended-without-toothache"
    }
  ],
  "sources": [
    {
      "title": "AAPD · 영구치 생활치수 치료 지침, 2025",
      "href": "https://www.aapd.org/research/oral-health-policies--recommendations/silver-diamine-fluoride-for-dental-caries-management-in-children-and-adolescents-including-those-with-special-health-care-needs2/"
    },
    {
      "title": "AAE · 생활치수 치료 입장문, 2021",
      "href": "https://www.aae.org/wp-content/uploads/2021/05/VitalPulpTherapy_PositionStatement_v2.pdf"
    },
    {
      "title": "ADA · 보존적인 충치 제거와 수복 치료 지침 안내, 2023",
      "href": "https://www.ada.org/about/press-releases/american-dental-association-releases-new-tooth-decay-treatment-guideline"
    },
    {
      "title": "NHS · 치아 감염에서 신속한 평가가 필요한 증상",
      "href": "https://www.nhs.uk/conditions/dental-abscess/"
    }
  ],
  "updated": "2026-10-08",
  "publishedAt": "2026-10-08T09:00:00+09:00"
},
{
  "slug": "orthodontic-wire-poking-cheek-before-visit",
  "title": "교정 철사가 볼을 찔러요. 다음 예약일까지 참아야 하나요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "치아교정",
  "concern": "다음 예약까지 버티기 힘들어요",
  "description": "아산에서 교정 철사가 볼을 찌르거나 장치가 느슨해졌을 때 임시 보호와 치과 연락, 조기 점검이 필요한 불편을 나누어 정리합니다.",
  "situation": "아산에서 치아교정을 받고 있는데 뒤쪽 철사가 볼 안쪽을 긁어 식사와 대화가 불편합니다. 다음 예약은 아직 남았고, 사소한 일로 연락하는 것 같아 망설여집니다.",
  "answer": "교정 장치가 볼을 찌르거나 상처를 내면 정기 예약일까지 무조건 참지 말고 치료 중인 치과에 연락하세요. 교정용 왁스는 마찰을 잠시 줄이는 데 쓰지만 수리를 대신하지 않습니다. 철사 파손·이탈·브래킷 흔들림과 식사·수면에 미치는 영향을 알려 점검 시점을 정해야 합니다.",
  "checks": [
    "위아래·좌우 어느 부위가 언제부터 찌르는지",
    "철사 끝인지, 붙인 장치나 어금니 고리가 흔들리는지",
    "왁스로 보호해도 계속 아픈지, 식사·수면이 어려운지",
    "부품이 떨어진 뒤 기침·호흡 곤란 등 다른 문제가 생겼는지"
  ],
  "choices": [
    {
      "condition": "장치가 문지르는 불편이 있고 임시 보호가 가능하다면",
      "option": "안내받은 교정용 왁스로 마찰을 줄이고 치과에 점검 시점을 문의합니다.",
      "limit": "왁스를 붙였다고 장치가 정상으로 돌아온 것은 아닙니다."
    },
    {
      "condition": "철사가 찌르거나 장치가 느슨해 통증이 계속된다면",
      "option": "정기 예약보다 빠른 장치 점검·조정이 필요한지 안내받습니다.",
      "limit": "직접 잡아당기거나 자르기보다 상태에 맞는 지시를 먼저 받으세요."
    },
    {
      "condition": "부품 이탈 뒤 숨쉬기 어렵거나 질식 증상이 있다면",
      "option": "즉시 119 등 응급 도움을 요청합니다.",
      "limit": "일반적인 장치 수리 예약을 기다리는 상황과 다릅니다."
    }
  ],
  "unknown": "사진만으로 철사의 위치와 상처 깊이, 부품 상태를 모두 알 수 없습니다. 입을 다물기 어렵거나 출혈이 멎지 않는 경우, 부종·발열이 동반되는 경우에도 빠른 평가가 필요합니다. 삼킨 것 같다는 추측만으로 안전하다고 판단하지 마세요.",
  "prepare": [
    "불편한 위치가 보이는 사진은 치과가 안내한 경로로 전달",
    "최근 장치를 조정한 날짜와 다음 예약일",
    "씹기·말하기·잠자기 중 특히 힘든 상황",
    "떨어진 부품이 이미 입 밖에 있다면 깨끗한 용기에 보관"
  ],
  "localHeading": "아산에서 치아교정 상담을 준비하신다면",
  "localAdvice": "아산에서 천안 불당동으로 치아교정 장치 점검을 계획한다면 먼저 치료 중인 치과에 연락해 불편한 부위와 장치 종류를 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 다른 치과에서 치료 중이라면 임시 불편 완화와 전체 교정 계획의 변경을 구분해 가능한 진료 범위부터 확인하세요.",
  "related": [
    {
      "title": "치아교정 가이드",
      "href": "/guide/orthodontics"
    },
    {
      "title": "투명교정 장치가 잘 맞지 않을 때",
      "href": "/concerns/clear-aligner-not-fitting-next-tray"
    },
    {
      "title": "유지장치가 맞지 않을 때",
      "href": "/concerns/removable-retainer-no-longer-fits"
    }
  ],
  "sources": [
    {
      "title": "Royal Devon NHS · 교정 장치의 통증·파손·철사 자극, 2025년 4월",
      "href": "https://www.royaldevon.nhs.uk/media/hzsiu5vu/what-to-do-if-you-have-a-problem-with-your-brace-rd-18-236-003.pdf"
    },
    {
      "title": "Plymouth NHS · 고정식 교정 장치가 손상됐을 때",
      "href": "https://www.plymouthhospitals.nhs.uk/display-pil/pil-what-to-do-if-your-fixed-brace-breaks-5549"
    },
    {
      "title": "NHS · 호흡 곤란과 질식 증상의 응급 평가",
      "href": "https://www.nhs.uk/symptoms/shortness-of-breath/"
    },
    {
      "title": "NHS · 긴급 치과 평가가 필요한 출혈·부종·통증",
      "href": "https://www.nhs.uk/nhs-services/dentists/how-to-find-an-nhs-dentist-in-an-emergency/"
    }
  ],
  "updated": "2026-10-08",
  "publishedAt": "2026-10-08T09:00:00+09:00"
},
{
  "slug": "heart-valve-antibiotics-before-dental-scaling",
  "title": "심장 판막 수술을 했는데 스케일링 전에 항생제를 먹어야 하나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "스케일링",
  "concern": "기존 질환 때문에 치료가 걱정돼요",
  "description": "홍성에서 심장 판막 수술 후 스케일링을 준비할 때 예방 항생제의 대상, 심장 진료 기록과 복용약 확인, 처방과 방문 일정을 나누어 정리합니다.",
  "situation": "홍성에서 잇몸 출혈 때문에 스케일링을 예약하려는데 예전 심장 판막 수술이 마음에 걸립니다. 항생제를 미리 먹으라는 말을 들은 것 같지만 약 이름과 복용 시점이 기억나지 않습니다.",
  "answer": "인공 심장 판막이나 판막 수리에 사용한 인공 재료가 있는 경우 등 일부 고위험 심장 상태에서는 잇몸을 조작하는 치과 처치 전 예방 항생제가 권고됩니다. 모든 심장병이나 모든 치과 방문에 필요한 것은 아닙니다. 수술 종류와 예정된 처치를 확인한 뒤 담당 의료진이 필요 여부와 처방·복용 시점을 정해야 합니다.",
  "checks": [
    "판막 교체인지 수리인지, 인공 판막·재료의 종류와 수술 기록",
    "과거 감염성 심내막염 여부와 심장 주치의의 안내",
    "약물 알레르기와 현재 항생제·항응고제 등 복용약",
    "이번 방문이 검사만인지 스케일링 등 잇몸 처치를 포함하는지"
  ],
  "choices": [
    {
      "condition": "예방이 권고되는 심장 상태이며 해당 치과 처치를 한다면",
      "option": "심장 병력과 알레르기를 확인한 뒤 예방 항생제 처방·복용 안내를 받습니다.",
      "limit": "남은 약이나 예전 처방을 스스로 재사용하지 마세요."
    },
    {
      "condition": "수술 종류나 예방 필요 여부가 명확하지 않다면",
      "option": "수술 요약·판막 카드·주치의 의견 등을 치과와 공유해 확인합니다.",
      "limit": "환자분 혼자 병명을 추측하거나 약을 선택할 필요는 없습니다."
    },
    {
      "condition": "해당 고위험 심장 상태가 아니라면",
      "option": "현재 지침과 개인 상태에 맞게 예방 약이 필요한지 설명받습니다.",
      "limit": "불안하다는 이유만으로 모든 방문에 항생제를 추가하지 않습니다."
    }
  ],
  "unknown": "예방 항생제와 항응고제 조절은 서로 다른 문제입니다. 평소 심장약을 스스로 끊지 마세요. 원인 모를 발열이나 오한, 새로 심해진 전신 증상이 있으면 스케일링 준비보다 의료진 평가가 먼저일 수 있으므로 심장 병력을 알리고 신속히 상담하세요.",
  "prepare": [
    "심장 수술 요약·판막 카드 또는 주치의 진료 안내",
    "현재 약 목록과 과거 항생제 이상 반응",
    "스케일링 예정일과 처방 받을 수 있는 기관",
    "이미 항생제를 복용했다면 약 이름·시각·양"
  ],
  "localHeading": "홍성에서 스케일링 상담을 준비하신다면",
  "localAdvice": "홍성에서 천안 불당동으로 스케일링 상담을 오신다면 예약할 때 심장 판막 수술 이력을 먼저 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 필요한 심장 진료 자료와 예방 처방 확인이 방문 전에 가능한지 상의하면, 긴 이동 후 준비가 부족해 다시 방문하는 일을 줄이는 데 도움이 됩니다.",
  "related": [
    {
      "title": "스케일링 가이드",
      "href": "/guide/scaling"
    },
    {
      "title": "혈액을 묽게 하는 약을 먹고 발치가 필요할 때",
      "href": "/concerns/tooth-extraction-while-taking-blood-thinners"
    },
    {
      "title": "최근 스케일링 후 잇몸 치료를 권유받았을 때",
      "href": "/concerns/deep-gum-treatment-after-recent-scaling"
    }
  ],
  "sources": [
    {
      "title": "미국심장협회 AHA · 감염성 심내막염과 치과 처치, 2026년 7월 검토",
      "href": "https://www.heart.org/en/health-topics/infective-endocarditis"
    },
    {
      "title": "ADA · 치과 처치 전 예방 항생제의 대상과 적용",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/antibiotic-prophylaxis"
    },
    {
      "title": "AHA · 감염성 심내막염 예방 환자 카드",
      "href": "https://professional.heart.org/-/media/files/health-topics/infective-endocarditis/infective-endocarditis-wallet-card.pdf?la=en"
    },
    {
      "title": "ADA · 치과 처치와 항응고제·항혈소판제 복용 조정",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/oral-anticoagulant-and-antiplatelet-medications-and-dental-procedures"
    }
  ],
  "updated": "2026-10-08",
  "publishedAt": "2026-10-08T09:00:00+09:00"
},
{
  "slug": "child-cavity-silver-fluoride-black-stain",
  "title": "아이 충치에 약을 바르면 검게 변한대요. 그냥 썩게 두는 건 아닌가요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "소아 충치",
  "concern": "아이에게 맞는 치료인지 걱정돼요",
  "description": "예산에서 아이 충치에 SDF를 제안받았을 때 검은 착색과 충치 진행 억제의 차이, 적용 조건·다른 치료·재검 계획을 살펴봅니다.",
  "situation": "예산에서 아이 소아 충치 상담을 받았는데 약을 바르면 충치 부분이 검게 변할 수 있다고 합니다. 아이가 기계 소리를 무서워해 반가운 방법 같다가도 검은 치아로 지내게 하는 것이 미안합니다.",
  "answer": "SDF는 적절한 충치 병소에 발라 진행을 억제하는 데 쓰는 약제이며, 치료한 충치 부위가 검게 착색될 수 있습니다. 구멍을 채우거나 모든 치아 감염을 치료하는 방법은 아닙니다. 적용할 치아의 상태와 색 변화, 다른 선택지, 효과 확인과 추가 치료 계획을 설명받고 결정해야 합니다.",
  "checks": [
    "아이가 가만히 있거나 밤에도 아픈지, 잇몸 부종이나 고름은 없는지",
    "충치의 깊이·위치와 약을 바를 수 있는지",
    "앞니 등 웃을 때 보이는 부위에 남을 착색 범위",
    "치료 협조 정도, 다른 수복 방법과 재검 가능 일정"
  ],
  "choices": [
    {
      "condition": "치수 문제가 없는 적절한 충치로 평가된다면",
      "option": "SDF를 충치 관리 계획의 일부로 사용할지 상의할 수 있습니다.",
      "limit": "검게 변하는 점과 효과가 지속되는지 확인할 재검을 이해해야 합니다."
    },
    {
      "condition": "구멍의 모양이나 씹는 기능을 회복해야 한다면",
      "option": "충치 진행 억제와 별도로 수복 등 후속 치료를 검토합니다.",
      "limit": "약을 발랐다고 손상된 치아 모양이 돌아오는 것은 아닙니다."
    },
    {
      "condition": "자발통·지속 통증·붓기 등 다른 문제가 있다면",
      "option": "치수 상태를 평가하고 필요한 다른 치료를 계획합니다.",
      "limit": "아이에게 치료가 어렵다는 이유로 SDF만으로 해결된다고 가정하지 않습니다."
    }
  ],
  "unknown": "검은색이 됐다는 사실만으로 충치가 멈췄다고 확정할 수 없습니다. 치과에서 병소 상태를 확인해야 합니다. 제품 성분 알레르기 등 병력을 알리고, 국내에서 사용하는 제품과 실제 시행 가능 여부·비용은 진료 기관에 별도로 확인하세요.",
  "prepare": [
    "아이 나이와 통증·식사·잠의 변화",
    "알레르기와 복용약, 이전 치과 치료 경험",
    "색 변화에 관해 가족과 아이가 걱정하는 점",
    "재검을 받을 수 있는 일정과 궁금한 다른 치료 방법"
  ],
  "localHeading": "예산에서 소아 충치 상담을 준비하신다면",
  "localAdvice": "예산에서 천안 불당동으로 소아 충치 상담을 오신다면 아이가 힘들어하는 상황과 현재 통증 여부를 먼저 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. SDF 시행 여부나 당일 처치를 전제로 예약하지 말고, 검사 후 가능한 선택과 후속 방문 계획을 확인하세요.",
  "related": [
    {
      "title": "아이 진료를 상담할 때 살필 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "곧 빠질 젖니의 충치도 치료해야 할까요?",
      "href": "/concerns/baby-molar-cavity-treat-before-falling-out"
    },
    {
      "title": "새로 난 어금니가 누렇고 부서질 때",
      "href": "/concerns/child-new-molar-yellow-and-crumbling"
    }
  ],
  "sources": [
    {
      "title": "AAPD · SDF 충치 관리 진료 지침, 2025 개정",
      "href": "https://www.aapd.org/globalassets/media/policies_guidelines/r_chairside--guide25.pdf"
    },
    {
      "title": "ADA · SDF의 역할·착색·추가 수복과 추적 관찰",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/silver-diamine-fluoride"
    },
    {
      "title": "미국소아과학회 AAP · SDF 설명과 보호자의 동의",
      "href": "https://www.aap.org/en/patient-care/silver-diamine-fluoride-application-in-the-pediatric-medical-setting/silver-diamine-fluoride-discussing-indications-and-obtaining-informed-consent/"
    },
    {
      "title": "AAP · SDF 이후 관리와 치아 착색",
      "href": "https://www.aap.org/en/patient-care/silver-diamine-fluoride-application-in-the-pediatric-medical-setting/silver-diamine-fluoride-aftercare/"
    }
  ],
  "updated": "2026-10-08",
  "publishedAt": "2026-10-08T09:00:00+09:00"
},
{
  "slug": "dental-check-before-chemotherapy-extraction-worry",
  "title": "항암치료 전에 치과부터 가라는데, 안 아픈 이도 빼야 하나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "항암 전 치과검사",
  "concern": "큰 치료를 앞두고 더 막막해요",
  "description": "당진에서 항암치료 전 치과검사를 준비할 때 발치가 필요한 근거, 치아를 남길 가능성, 항암 일정과 회복 기간을 의료진 사이에서 조율하는 방법을 정리합니다.",
  "situation": "당진에서 항암치료를 앞두고 치과검사를 권유받았습니다. 지금은 이가 아프지 않은데 발치까지 필요할까 봐 걱정되고, 치과 치료 때문에 항암 시작이 늦어질까 마음이 급합니다.",
  "answer": "항암 전 치과검사는 앞으로 감염이나 통증을 일으킬 수 있는 문제를 찾아 관리 계획을 세우는 과정입니다. 모든 치아를 예방적으로 빼는 것은 아닙니다. 치아를 남길 수 있는지와 치료할 시간, 항암치료 종류·일정·혈액검사 등을 함께 검토하고 치과와 종양내과가 필요한 처치와 시점을 조율해야 합니다.",
  "checks": [
    "항암치료 시작 예정일과 약제·치료 계획",
    "현재 충치·잇몸병·뿌리 주변 감염과 치아를 유지할 가능성",
    "최근 혈액검사, 복용약과 뼈에 영향을 주는 주사 치료 여부",
    "처치 후 회복 확인과 항암 중 연락할 진료팀"
  ],
  "choices": [
    {
      "condition": "치아를 보존할 수 있고 치료·확인 시간이 확보된다면",
      "option": "충치·신경·잇몸 치료 등으로 문제를 안정시키는 방법을 검토합니다.",
      "limit": "남길 수 있다는 판단과 항암 전 필요한 범위는 치아마다 다릅니다."
    },
    {
      "condition": "보존이 어렵거나 감염 위험이 큰 치아가 있다면",
      "option": "발치 필요성과 상처 회복을 확인할 일정을 항암 진료팀과 협의합니다.",
      "limit": "통증 유무나 인터넷 기준만으로 발치를 결정하지 않습니다."
    },
    {
      "condition": "항암 시작이 임박해 모든 처치를 마치기 어렵다면",
      "option": "지금 필요한 처치와 나중에 할 수 있는 치료의 우선순위를 정합니다.",
      "limit": "환자분이 항암 날짜를 임의로 미루거나 치과 처치를 서둘러 확정하지 않습니다."
    }
  ],
  "unknown": "치과검사를 받았다고 항암 중 구강 합병증이 전혀 생기지 않는 것은 아닙니다. 항암 중 발열·오한, 갑자기 커지는 부종, 지속 출혈이나 물을 마시기 어려운 통증이 생기면 정기 치과 예약을 기다리지 말고 항암 진료팀에 즉시 연락하세요. 숨쉬기·삼키기가 어렵다면 응급 평가가 우선입니다.",
  "prepare": [
    "항암 계획서·시작 예정일과 담당 진료팀 연락 방법",
    "치과에 제공 가능한 최근 혈액검사와 약 목록",
    "기존 영상·치료계획, 흔들리거나 반복해서 붓는 위치",
    "발치 두려움·식사 문제·함께 이동할 보호자 일정"
  ],
  "localHeading": "당진에서 항암 전 치과검사를 준비하신다면",
  "localAdvice": "당진에서 천안 불당동으로 항암 전 치과검사를 오신다면 예약 단계에서 항암 시작 예정일을 먼저 알려주세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 검사, 필요한 처치, 회복 확인을 나누어 상의하고 항암 진료기관과 자료를 어떻게 주고받을지 확인하세요. 당일 발치나 치료 완료를 전제로 이동하지 않는 것이 좋습니다.",
  "related": [
    {
      "title": "치과 상담을 준비할 때 살필 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "신경치료의 과정과 판단",
      "href": "/guide/root-canal"
    },
    {
      "title": "골다공증 약을 먹고 발치를 권유받았을 때",
      "href": "/concerns/osteoporosis-medication-before-tooth-extraction"
    }
  ],
  "sources": [
    {
      "title": "NCI · 항암치료 전 구강 평가와 치료 우선순위",
      "href": "https://www.cancer.gov/about-cancer/treatment/side-effects/mouth-throat/oral-complications-hp-pdq"
    },
    {
      "title": "NCI · 환자를 위한 암 치료의 구강 합병증 안내",
      "href": "https://www.cancer.gov/about-cancer/treatment/side-effects/mouth-throat/oral-complications-pdq"
    },
    {
      "title": "NIDCR · 암 치료 전 치과검사와 진료팀 간 협력",
      "href": "https://www.nidcr.nih.gov/health-info/cancer-treatments"
    }
  ],
  "updated": "2026-10-10",
  "publishedAt": "2026-10-10T22:27:06+09:00"
},
{
  "slug": "dark-root-canal-tooth-internal-bleaching-or-crown",
  "title": "신경치료한 앞니 하나만 어두워요. 색 때문에 크라운을 해야 하나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "치아미백",
  "concern": "웃을 때마다 한 치아가 신경 쓰여요",
  "description": "서산에서 신경치료한 앞니의 변색을 상담할 때 내부 미백과 레진·라미네이트·크라운의 차이, 치아 구조와 재치료 여부, 색의 한계와 후속 관리를 정리합니다.",
  "situation": "서산에서 예전에 신경치료한 앞니 하나가 어두워져 웃을 때 신경 쓰입니다. 색을 맞추려면 멀쩡해 보이는 치아를 많이 깎거나 옆 치아까지 함께 씌워야 할까 걱정됩니다.",
  "answer": "색이 어두워졌다는 이유만으로 바로 크라운이 필요한 것은 아닙니다. 기존 신경치료와 충전 상태, 남은 치아 구조, 변색 원인을 먼저 확인합니다. 조건에 따라 내부 미백을 검토할 수 있고 수복 치료가 필요할 수도 있습니다. 색을 밝히는 목적과 치아를 보호·회복하는 목적을 나누어 설명받으세요.",
  "checks": [
    "신경치료 시기와 과거 외상, 변색의 변화",
    "통증·잇몸 부기와 기존 뿌리 치료·충전의 상태",
    "남은 치아 양, 균열과 큰 충전물·보철 여부",
    "원하는 색과 인접 치아 색, 감수할 치료 범위"
  ],
  "choices": [
    {
      "condition": "기존 치료와 구조를 확인한 뒤 미백을 시도할 수 있다면",
      "option": "내부 미백의 적합성, 경과 확인과 최종 충전 계획을 상담합니다.",
      "limit": "옆 치아와 완벽한 색 일치나 영구적인 결과를 보장하지 않습니다."
    },
    {
      "condition": "색뿐 아니라 치아 손상·큰 충전 등 수복할 이유가 있다면",
      "option": "레진·라미네이트·크라운 등 가능한 방법의 범위를 비교합니다.",
      "limit": "각 방법의 삭제량과 관리·재치료 부담이 다릅니다."
    },
    {
      "condition": "기존 신경치료나 뿌리 주변에 해결할 문제가 있다면",
      "option": "문제의 평가와 필요한 치료를 먼저 계획합니다.",
      "limit": "겉을 밝게 만드는 것만으로 내부의 문제가 해결되지는 않습니다."
    }
  ],
  "unknown": "미백 반응, 필요한 횟수와 최종 색은 검사 전에 확정할 수 없습니다. 미백에는 잇몸 자극 등 부작용과 드물게 치근 흡수 같은 합병증이 있어 적합성 평가와 추적 확인이 필요합니다. 부기·씹을 때 통증·잇몸 뾰루지가 생기면 미용 상담만 기다리지 말고 먼저 알려주세요.",
  "prepare": [
    "예전 신경치료·외상 시기와 영상이 있다면 사본",
    "평소 빛에서 찍은 색 변화 사진",
    "중요한 일정과 원하는 개선 정도",
    "치아를 깎는 범위·비용·추가 방문에 대한 걱정"
  ],
  "localHeading": "서산에서 앞니 치아미백 상담을 준비하신다면",
  "localAdvice": "서산에서 천안 불당동으로 치아미백 상담을 오신다면 앞니 하나의 신경치료 이력과 기존 보철 유무를 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 내부 미백 시행 여부와 본인에게 맞는 방법은 검사 후 확인하며, 색 확인이나 최종 충전을 위한 추가 방문도 함께 상의하세요.",
  "related": [
    {
      "title": "치아미백 가이드",
      "href": "/guide/whitening"
    },
    {
      "title": "미백 전에 생각할 기대와 한계",
      "href": "/guide/regret/whitening"
    },
    {
      "title": "신경치료 후 시간이 지나 아플 때",
      "href": "/concerns/root-canal-pain-years-later"
    }
  ],
  "sources": [
    {
      "title": "Leeds NHS · 신경치료 치아의 미백, 한계와 대안",
      "href": "https://www.leedsth.nhs.uk/patients/resources/tooth-whitening-information-for-adult-patients/"
    },
    {
      "title": "ADA · 치아 변색의 평가와 미백의 역할",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/whitening"
    },
    {
      "title": "AAE · 내부 미백을 통한 보존적 색 개선",
      "href": "https://endoondemand.aae.org/products/sp-19-internal-micro-bleaching-lessons-from-private-endodontic-practice"
    },
    {
      "title": "AAE · 신경치료 후 재치료가 필요한 상황",
      "href": "https://www.aae.org/patients/root-canal-treatment/endodontic-treatment-options/endodontic-retreatment/"
    }
  ],
  "updated": "2026-10-10",
  "publishedAt": "2026-10-10T22:27:06+09:00"
},
{
  "slug": "blood-pressure-high-only-at-dentist",
  "title": "치과에만 가면 혈압이 올라 치료를 못 받아요. 또 돌려보내질까 겁납니다.",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "치과 치료와 혈압",
  "concern": "검사 숫자부터 무서워요",
  "description": "천안에서 치과 방문 때 혈압이 높아져 치료가 미뤄진 경우, 가정혈압 기록과 재측정, 약물 확인, 치과·내과 협의와 불안 조절을 준비하는 방법을 정리합니다.",
  "situation": "천안에서 치과 치료를 받으려는데 진료실 혈압이 높아 일정이 미뤄졌습니다. 집에서는 덜 높은 것 같은데 다음 방문에도 같은 일이 생길까 두렵고, 아픈 치아를 계속 방치하게 될까 걱정됩니다.",
  "answer": "치과에서의 통증이나 불안 때문에 혈압이 일시적으로 높아질 수 있지만, 한 번의 높은 수치를 단순한 긴장으로 단정해서도 안 됩니다. 안정 후 재측정, 평소 혈압·약·동반 질환과 치과 치료의 긴급도를 함께 평가합니다. 반복된다면 내과와 치과가 정보를 공유해 안전한 다음 단계를 정하는 것이 필요합니다.",
  "checks": [
    "치과에서 측정한 혈압과 재측정 결과·당시 증상",
    "올바른 방법으로 잰 가정혈압 기록과 기기",
    "평소 약 이름·복용 시각·최근 변경과 다른 약",
    "치통·부종의 정도, 필요한 처치의 긴급도와 불안 경험"
  ],
  "choices": [
    {
      "condition": "안정 후 재측정과 평소 기록을 함께 볼 수 있다면",
      "option": "진료실과 일상에서의 차이를 확인하고 치료 계획을 상담합니다.",
      "limit": "집에서 한 번 낮게 나왔다는 사실만으로 당일 처치를 확정하지 않습니다."
    },
    {
      "condition": "높은 혈압이 반복되거나 조절 상태가 불분명하다면",
      "option": "내과 평가와 치과 치료 시점·방법의 협의를 진행합니다.",
      "limit": "진료실 수치를 낮추려고 혈압약을 추가 복용하지 않습니다."
    },
    {
      "condition": "치통·감염 때문에 신속한 처치가 필요한 상황이라면",
      "option": "혈압과 전신 상태를 고려한 응급 처치·진료기관을 상의합니다.",
      "limit": "혈압이 높다는 이유로 모든 증상을 계속 집에서 참는 계획은 적절하지 않습니다."
    }
  ],
  "unknown": "가슴 통증, 숨참, 갑작스러운 시야 변화, 한쪽 힘 빠짐이나 말이 어눌해지는 증상은 혈압 숫자가 낮아지기를 기다리지 말고 119 등 응급 평가를 요청하세요. 증상이 없더라도 수축기 혈압이 180mmHg를 초과하거나 이완기 혈압이 120mmHg를 초과하면 최소 1분 뒤 다시 재고, 여전히 매우 높으면 즉시 의료진에게 연락하세요. 이는 치과 치료 가능 여부를 정하는 기준은 아닙니다. 이 글의 설명은 개인의 치료 허용 수치를 정하지 않습니다.",
  "prepare": [
    "최근 가정혈압의 날짜·시각·수치 기록",
    "혈압약과 감기약·진통제·보충제를 포함한 목록",
    "이전 치과에서 치료가 미뤄진 이유와 기록",
    "무서운 순간과 도움이 됐던 대응 방법"
  ],
  "localHeading": "천안에서 치과 치료와 혈압을 함께 상담하신다면",
  "localAdvice": "천안에서 치과 치료와 혈압 때문에 고민한다면 예약할 때 이전에 치료가 미뤄졌다는 점부터 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 당일 처치 가능 여부를 미리 단정하기보다 필요한 내과 자료와 상담 범위를 확인하고, 급히 도착해 바로 혈압을 재지 않도록 일정에 여유를 두세요.",
  "related": [
    {
      "title": "진료를 선택하고 상담하는 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "진정치료의 기대와 주의점",
      "href": "/guide/regret/sedation"
    },
    {
      "title": "마취 후 두근거린 경험이 있을 때",
      "href": "/concerns/heart-racing-after-dental-local-anesthetic"
    }
  ],
  "sources": [
    {
      "title": "ADA · 고혈압 환자의 치과 평가와 진료 고려사항",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/hypertension"
    },
    {
      "title": "AHA · 가정혈압 측정과 높은 수치의 대응",
      "href": "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home"
    },
    {
      "title": "AHA · 혈압약과 다른 약의 복용 관리",
      "href": "https://www.heart.org/en/health-topics/high-blood-pressure/changes-you-can-make-to-manage-high-blood-pressure/managing-high-blood-pressure-medications"
    }
  ],
  "updated": "2026-10-10",
  "publishedAt": "2026-10-10T22:27:06+09:00"
},
{
  "slug": "child-bit-lip-after-dental-anesthesia",
  "title": "아이가 마취 후 입술을 씹었어요. 하얗게 붓고 헐었는데 감염인가요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "소아 치과 마취",
  "concern": "제가 잘 못 봐준 것 같아요",
  "description": "아산에서 아이가 치과 마취 후 입술을 씹어 붓고 헐었을 때 확인할 변화, 추가 손상 예방, 재진료와 응급 평가가 필요한 신호를 정리합니다.",
  "situation": "아산에서 아이가 치과 치료를 마치고 돌아오는 동안 입술을 씹었습니다. 처음엔 아프지 않다고 하더니 입술이 붓고 안쪽이 하얗게 헐어 보호자가 감염이나 마취 알레르기를 걱정하고 있습니다.",
  "answer": "마취로 감각이 둔한 동안 입술·볼·혀를 씹어 상처가 생길 수 있습니다. 이런 손상은 대개 회복되지만 출혈이나 감염이 동반될 수 있으므로 색만으로 정상 또는 감염을 단정하지 마세요. 치료한 치과에 상황을 알리고, 붓기·통증·열·식사와 수분 섭취 상태를 함께 전달해 필요한 평가를 받으세요.",
  "checks": [
    "치료와 마취를 받은 시각, 씹은 위치와 시점",
    "입술에 국한된 상처인지 얼굴·혀·목으로 번지는 부종인지",
    "발열·통증 악화·지속 출혈과 감각 회복 여부",
    "물을 마실 수 있는지, 아이의 활동과 전신 상태"
  ],
  "choices": [
    {
      "condition": "씹은 부위의 국소 상처로 평가되고 전신 상태가 괜찮다면",
      "option": "추가로 씹거나 뜯지 않도록 살피고 안내받은 통증·위생 관리를 합니다.",
      "limit": "하얗게 보인다는 이유로 상처 표면을 벗기지 않습니다."
    },
    {
      "condition": "부기·통증이 악화되거나 열·분비물·섭취 곤란이 있다면",
      "option": "치료한 치과 또는 소아 진료기관에 신속히 연락해 재평가를 받습니다.",
      "limit": "며칠 기다리면 낫는다고 정해 두고 악화를 참지 않습니다."
    },
    {
      "condition": "혀·목이 갑자기 붓거나 호흡·삼킴에 문제가 있다면",
      "option": "119 등 즉각적인 응급 평가를 요청합니다.",
      "limit": "씹어서 생긴 상처라고 가정하고 치과 연락만 기다리지 않습니다."
    }
  ],
  "unknown": "입술 부종의 원인과 상처 깊이, 약의 필요성은 직접 확인해야 합니다. 항생제나 성인용 구내염 약을 임의로 사용하지 마세요. 마취 감각이 안내받은 시간보다 오래 남거나 이상 증상이 지속되는 경우에도 치과에 알려 확인받으세요.",
  "prepare": [
    "처치 내용과 마취 시각, 귀가 후 관찰한 행동",
    "상처의 변화를 비교할 수 있는 사진",
    "아이 나이·체중, 약과 알레르기 정보",
    "통증·체온·물 마시는 양·소변 감소 여부"
  ],
  "localHeading": "아산에서 소아 치과 마취 뒤 입술 손상을 상담하신다면",
  "localAdvice": "아산에서 아이의 소아 치과 마취 후 상처 때문에 문의하신다면 먼저 치료한 치과에 마취 시각과 증상을 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 재방문 필요 여부와 현재 가능한 관리를 확인한 뒤 이동하고, 호흡 곤란이나 급격한 부종이 있다면 가까운 응급 진료가 우선입니다.",
  "related": [
    {
      "title": "아이 치과 진료를 상담하는 기준",
      "href": "/guide/cheonan-dentist-choice"
    },
    {
      "title": "곧 빠질 유치의 충치 치료",
      "href": "/concerns/baby-molar-cavity-treat-before-falling-out"
    },
    {
      "title": "마취 뒤 두근거림과 알레르기가 걱정될 때",
      "href": "/concerns/heart-racing-after-dental-local-anesthetic"
    }
  ],
  "sources": [
    {
      "title": "AAPD · 소아 국소마취와 치료 후 입술·볼 손상",
      "href": "https://www.aapd.org/globalassets/media/policies_guidelines/bp_localanesthesia25.pdf"
    },
    {
      "title": "Guy’s and St Thomas’ NHS · 아이의 국소마취 후 입안 관리, 2026년 7월 검토",
      "href": "https://www.guysandstthomas.nhs.uk/health-information/caring-your-childs-mouth-after-tooth-removal-under-local-anaesthetic"
    },
    {
      "title": "NHS SPS · 치과 국소마취 후 반응과 응급 알레르기 평가",
      "href": "https://sps.nhs.uk/articles/managing-reactions-to-dental-local-anaesthetic-injections/"
    },
    {
      "title": "Cambridge NHS · 소아 치과 수술 뒤 악화·감염 신호",
      "href": "https://www.cuh.nhs.uk/patient-information/post-operative-mouth-care-for-children-following-dental-extractions/"
    }
  ],
  "updated": "2026-10-10",
  "publishedAt": "2026-10-10T22:27:06+09:00"
},
{
  "slug": "black-triangles-after-gum-treatment-composite-bonding",
  "title": "잇몸 치료 뒤 앞니 사이가 검은 삼각형처럼 보여요. 레진으로 메우면 되나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "잇몸 치료 후 심미 수복",
  "concern": "빈틈을 메웠다가 관리가 어려워질까 걱정돼요",
  "description": "홍성에서 잇몸 치료 뒤 앞니 사이 검은 공간을 레진으로 줄일지 고민하는 환자분을 위해 치아 형태, 청소 가능성, 잇몸 재평가와 치료 선택의 한계를 정리합니다.",
  "situation": "홍성에 살며 잇몸 치료를 받은 뒤 앞니 사이의 검은 삼각형 공간이 신경 쓰입니다. 출혈은 줄었지만 웃는 모습이 어색해, 레진을 조금 붙여 바로 메울 수 있는지 알고 싶습니다.",
  "answer": "잇몸 상태가 안정되고 치아 형태와 청소 조건이 맞으면 레진으로 검은 공간을 줄이는 방법을 검토할 수 있습니다. 다만 치아에 재료를 더하는 치료가 잃어버린 잇몸과 뼈를 재생하는 것은 아닙니다. 빈틈을 얼마나 줄일지와 치료 뒤에도 관리할 수 있을지를 함께 판단해야 합니다.",
  "checks": [
    "치료 뒤 잇몸 출혈과 부기가 줄었는지, 추가 잇몸 치료가 필요한지 확인합니다.",
    "검은 공간의 크기뿐 아니라 치아 폭·접촉 위치·배열과 주변 조직을 평가합니다.",
    "레진을 더한 뒤 치아 사이를 어떤 도구로 청소할 수 있을지 설명받습니다."
  ],
  "choices": [
    {
      "condition": "잇몸 상태가 안정되고 무리한 형태 변화 없이 공간을 줄일 수 있다면",
      "option": "레진 수복으로 기대할 모양과 관리 방법을 비교합니다.",
      "limit": "공간의 완전한 폐쇄나 일정한 수명을 보장할 수는 없습니다."
    },
    {
      "condition": "빈틈을 막으려면 치아가 지나치게 넓어지거나 청소가 어려워진다면",
      "option": "일부 공간을 남기는 방법, 경과 관찰 또는 다른 치료의 평가를 상의합니다.",
      "limit": "교정이나 잇몸 수술이 누구에게나 필요한 대안은 아닙니다."
    },
    {
      "condition": "출혈·부기 등 잇몸 문제가 남아 있다면",
      "option": "필요한 잇몸 치료와 재평가 순서를 먼저 정합니다.",
      "limit": "레진으로 보이는 틈을 가려도 잇몸질환 자체가 치료되지는 않습니다."
    }
  ],
  "unknown": "사진만으로 레진의 적합성, 필요한 치아 수, 삭제 범위와 비용을 정할 수 없습니다. 이 글은 치료 선택을 위한 일반 정보이며 개인의 진단이나 결과를 대신하지 않습니다.",
  "prepare": [
    "잇몸 치료 날짜와 받은 치료 내용, 보유한 검사·사진 기록",
    "가장 신경 쓰이는 위치와 음식 끼임·발음·외관 중 우선순위",
    "현재 쓰는 치실·치간칫솔과 사용하기 어려운 부분"
  ],
  "localHeading": "홍성에서 앞니 사이 공간 상담을 준비한다면",
  "localAdvice": "예약할 때 ‘잇몸 치료 뒤 남은 검은 공간의 레진 수복 가능성을 상담하고 싶다’고 알려주세요. 서울비디치과의 진료 장소는 천안 불당동입니다. 첫 방문 평가와 실제 수복, 이후 점검이 각각 필요한지 확인해 이동 일정을 계획하세요.",
  "related": [
    {
      "title": "스케일링 뒤 틈과 시림이 생겼을 때",
      "href": "/concerns/gaps-between-teeth-after-scaling"
    },
    {
      "title": "스케일링과 잇몸 관리 가이드",
      "href": "/guide/scaling"
    },
    {
      "title": "홍성에서 방문 상담 준비하기",
      "href": "/area/hongseong"
    }
  ],
  "sources": [
    {
      "title": "스코틀랜드 치과 임상효과 프로그램 SDCEP · 치주치료 단계, 치간 퇴축과 돌출 수복물 관리",
      "href": "https://www.periodontalcare.sdcep.org.uk/guidance/managing-disease/periodontitis/"
    },
    {
      "title": "BMC Oral Health · 앞니 검은 공간의 레진 수복에 관한 무작위 임상연구",
      "href": "https://link.springer.com/article/10.1186/s12903-023-03102-y"
    },
    {
      "title": "미국치과의사협회 ADA · 심미 수복 전 질환 치료와 레진 수복물 관리",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/veneers"
    }
  ],
  "updated": "2026-10-11",
  "publishedAt": "2026-10-11T18:09:30+09:00"
},
{
  "slug": "upper-molars-hurt-after-cold-sinus-or-tooth",
  "title": "감기 뒤 윗어금니 여러 개가 아파요. 신경치료를 받아야 하나요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "감기 뒤 윗어금니 통증",
  "concern": "여러 이를 치료해야 할까 겁나요",
  "description": "예산에서 감기 뒤 여러 윗어금니가 아플 때 코·상악동 증상과 치아 원인을 함께 확인하고, 검사와 진료 의뢰, 치료 순서를 상담하는 방법을 정리합니다.",
  "situation": "감기를 앓은 뒤 코가 막히고 윗어금니 여러 개가 묵직하게 아픕니다. 예산에서 치과와 이비인후과 중 어디부터 가야 할지, 한꺼번에 신경치료를 받아야 하는지 걱정됩니다.",
  "answer": "감기 뒤 부비동염으로 치통을 느낄 수 있지만 치아 감염이 상악동에 영향을 주는 경우도 있습니다. 아픈 치아 수나 코 증상만으로 원인을 정하지 않고, 치아 검사와 필요한 의과 평가를 함께 고려합니다. 신경치료는 치료할 치아와 근거를 확인한 뒤 결정합니다.",
  "checks": [
    "감기·코막힘과 치통이 각각 시작된 시점",
    "한쪽인지 양쪽인지, 특정 치아에서 더 뚜렷한지",
    "씹기·온도 자극과의 관계, 잇몸·얼굴의 부기와 열",
    "이전 신경치료·발치 등의 기록과 현재 복용약"
  ],
  "choices": [
    {
      "condition": "검사에서 치아 내부 감염 등 치료할 원인이 확인되면",
      "option": "해당 치아의 보존 가능성과 필요한 처치를 상담합니다.",
      "limit": "주변 치아까지 아프게 느껴진다는 이유로 여러 치아의 신경치료를 함께 정하지 않습니다."
    },
    {
      "condition": "코·부비동 평가가 필요하거나 치아 검사만으로 설명이 어렵다면",
      "option": "이비인후과 등 필요한 진료를 의뢰받고 결과를 공유합니다.",
      "limit": "치과 검사에 큰 이상이 없다는 설명만으로 상악동염을 확정하지 않습니다."
    },
    {
      "condition": "원인이 아직 명확하지 않고 급한 위험 신호가 없다면",
      "option": "추가 평가와 재확인 시점, 악화 시 연락 방법을 정합니다.",
      "limit": "원인이 불분명한 상태에서 시험 삼아 신경치료를 시작하거나 무기한 기다리지 않습니다."
    }
  ],
  "unknown": "숨쉬거나 삼키기 어렵거나, 입안이 심하게 붓거나 입을 벌리기 어려워지면 즉시 응급 평가를 받으세요. 눈 주위의 부기·통증이나 갑작스러운 시야 문제가 있어도 응급실로 가야 하며, 호흡 곤란 등 위급한 상황에는 119를 요청하세요. 남은 항생제를 임의로 복용하지 마세요.",
  "prepare": [
    "증상 시작일과 좋아졌다 다시 심해진 시점",
    "코 증상·치아 통증·부기·체온을 구분한 메모",
    "기존 치과·이비인후과의 영상과 설명이 있다면 사본",
    "감기약·진통제·항생제 등의 이름과 복용 기간"
  ],
  "localHeading": "예산에서 감기 뒤 윗어금니 통증을 상담하신다면",
  "localAdvice": "예산에서 천안 방문을 준비한다면 예약할 때 감기 뒤 여러 윗어금니가 아프고 코 증상도 있다는 점을 함께 알려주세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 첫 방문에서 어떤 평가가 가능한지 확인하고, 위급한 증상이 있다면 장거리 이동보다 가까운 응급 진료를 우선하세요.",
  "related": [
    {
      "title": "신경치료의 과정과 상담 기준",
      "href": "/guide/root-canal"
    },
    {
      "title": "엑스레이는 괜찮다는데 어금니가 계속 불편할 때",
      "href": "/concerns/molar-discomfort-normal-xray"
    },
    {
      "title": "신경치료한 치아가 몇 년 뒤 다시 아플 때",
      "href": "/concerns/root-canal-pain-years-later"
    }
  ],
  "sources": [
    {
      "title": "NHS · 부비동염의 증상과 진료가 필요한 경우",
      "href": "https://www.nhs.uk/conditions/sinusitis-sinus-infection/"
    },
    {
      "title": "AAE · 치아 내부 감염에서 비롯된 상악동염의 진단과 치료",
      "href": "https://www.aae.org/specialty/wp-content/uploads/sites/2/2018/04/MaxillarySinusitis_PositionStatement_v1.pdf"
    },
    {
      "title": "NHS · 치성 농양의 치료와 응급 신호",
      "href": "https://www.nhs.uk/conditions/dental-abscess/"
    }
  ],
  "updated": "2026-10-11",
  "publishedAt": "2026-10-11T18:09:30+09:00"
},
{
  "slug": "painless-impacted-wisdom-tooth-remove-or-monitor",
  "title": "사랑니가 누워 있지만 안 아파요. 예방적으로 뽑아야 할까요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "사랑니",
  "concern": "안 아픈 이를 미리 빼야 할까요",
  "description": "당진에서 무증상 매복 사랑니의 예방 발치와 관찰을 고민하는 환자분을 위한 안내. 현재 병변과 앞으로의 위험, 수술 부담과 정기 점검 계획을 나누어 상담할 질문을 정리합니다.",
  "situation": "검진 영상을 보다가 아래 사랑니가 옆으로 누워 있다는 설명을 들었습니다. 당진에서 지내며 지금까지 별다른 통증 없이 식사했는데, 미리 빼자는 말에 괜히 수술을 받는 건지, 그대로 두었다가 앞 어금니까지 상하는 건지 걱정됩니다.",
  "answer": "사랑니가 누워 있다는 모양이나 통증 유무만으로 예방 발치를 결정하지 않습니다. 현재 사랑니와 앞 어금니에 병변이 있는지, 앞으로 문제가 생길 위험과 발치 자체의 위험은 어떤지 함께 평가합니다. 질환이나 상당한 위험이 없다면 정기 관찰을 선택할 수 있지만, 안 아프다는 이유만으로 검사와 점검을 생략하지는 않습니다.",
  "checks": [
    "정말 한 번도 불편하지 않았는지, 과거 붓기·음식 끼임·좋지 않은 맛이 있었는지 구분해 전달합니다.",
    "사랑니와 앞 어금니에 현재 확인된 충치·잇몸 문제·다른 병변이 있는지 설명받습니다.",
    "발치를 권하는 근거가 이미 생긴 손상인지, 앞으로의 위험인지 나누어 묻습니다.",
    "관찰과 수술 각각의 부담, 다음 검사 시점과 계획을 바꿀 기준을 확인합니다."
  ],
  "choices": [
    {
      "condition": "현재 병변이 확인되고 사랑니와 관련된 치료가 필요하다면",
      "option": "병변의 종류와 앞 어금니 상태를 바탕으로 발치 등 필요한 치료를 검토합니다.",
      "limit": "아프지 않아도 치료가 필요할 수 있지만, 영상에 누워 보인다는 이유만으로 수술을 확정하지 않습니다."
    },
    {
      "condition": "현재 질환이 없고 앞으로의 위험도 크지 않다고 평가된다면",
      "option": "검진에서 확인할 항목과 재평가 시점을 정해 관찰하는 방법을 논의합니다.",
      "limit": "평생 문제가 없다는 보장은 아니며, 변화가 생기면 계획을 다시 판단합니다."
    },
    {
      "condition": "향후 질환 위험과 수술 위험을 비교하기 어렵다면",
      "option": "영상과 설명을 정리해 사랑니 수술 경험이 있는 의료진의 추가 의견을 구합니다.",
      "limit": "추가 상담이 반드시 발치로 이어지는 것은 아니며, 모든 경우에 추가 촬영이 필요한 것도 아닙니다."
    }
  ],
  "unknown": "언제 문제가 생길지, 앞으로 반드시 발치하게 될지, 개인의 수술 후 회복이 어떨지는 현재 증상이나 사진만으로 확정할 수 없습니다. 관찰을 선택할 때도 다음 점검 계획이 필요합니다.",
  "prepare": [
    "기존 사랑니 영상과 촬영 날짜, 이전에 들은 발치 또는 관찰 권고",
    "현재는 괜찮더라도 과거 붓기·통증·음식 끼임이 있었던 기록",
    "복용 중인 약과 질환, 수술 후 휴식이나 재방문이 어려운 일정",
    "가장 걱정되는 점이 수술 후 감각 변화인지, 앞 어금니 손상인지 정리한 질문"
  ],
  "localHeading": "당진에서 사랑니 상담을 준비한다면",
  "localAdvice": "서울비디치과의 진료 장소는 천안 불당동입니다. 당진에서 방문하기 전 무증상 매복 사랑니의 발치 필요성을 상담하고 싶다고 알려주세요. 기존 영상이 있으면 가져가는 방법을 확인하고, 첫 평가와 실제 수술 일정을 나누어 문의하세요. 관찰을 선택할 때도 어느 곳에서 정기 점검을 이어갈지 정하면 이동 부담 때문에 확인이 끊기는 일을 줄일 수 있습니다.",
  "related": [
    {
      "title": "사랑니 진료 가이드",
      "href": "/guide/wisdom-tooth"
    },
    {
      "title": "사랑니 발치와 지켜보기 비교",
      "href": "/guide/compare/wisdom-extraction-vs-wait"
    },
    {
      "title": "사랑니 잇몸이 부었다 가라앉기를 반복할 때",
      "href": "/concerns/wisdom-tooth-swelling-keeps-returning"
    },
    {
      "title": "신경과 가까운 사랑니의 뿌리를 남기자고 할 때",
      "href": "/concerns/wisdom-tooth-coronectomy-leaving-roots"
    }
  ],
  "sources": [
    {
      "title": "NHS · 사랑니 발치와 문제없는 사랑니의 정기 관찰",
      "href": "https://www.nhs.uk/tests-and-treatments/wisdom-tooth-removal/"
    },
    {
      "title": "NICE TA1 · 병변 없는 매복 사랑니와 발치 적응증",
      "href": "https://www.nice.org.uk/guidance/ta1/chapter/1-Recommendations"
    },
    {
      "title": "AAOMS · 사랑니의 질환 위험 평가와 적극적 관찰",
      "href": "https://aaoms.org/wp-content/uploads/2024/03/management_third_molar_white_paper.pdf"
    }
  ],
  "updated": "2026-10-11",
  "publishedAt": "2026-10-11T18:09:30+09:00"
},
{
  "slug": "new-dentures-speech-saliva-adaptation",
  "title": "틀니를 새로 했는데 발음이 새고 침이 많아요. 다시 만들어야 하나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "새 틀니 적응",
  "concern": "사람들 앞에서 말을 꺼내기가 망설여져요",
  "description": "서산에서 새 틀니를 사용한 뒤 발음과 침 때문에 당황한 환자분을 위해 적응 과정과 맞음새 점검, 연습 방법, 조정 상담을 구분해 안내합니다.",
  "situation": "서산에서 생활하며 새 틀니를 받은 뒤 말을 할 때 혀가 걸리고 침이 고이는 느낌이 납니다. 가족은 시간이 지나면 괜찮다고 하지만 전화 통화도 조심스럽고, 큰맘 먹고 만든 틀니를 다시 제작해야 할까 걱정됩니다.",
  "answer": "새 틀니를 사용할 때 입안이 꽉 찬 느낌, 발음 변화와 침 증가를 경험할 수 있습니다. 다만 모든 불편을 적응 문제로 돌리지는 않습니다. 틀니가 움직이거나 딸깍거리고 통증이 있으면 맞음새와 입안 상태를 확인받으세요. 발음이 낯설다는 이유만으로 재제작부터 정하지 않고, 연습과 점검이 각각 필요한 부분을 나누어 봅니다.",
  "checks": [
    "처음 착용한 날짜와 발음이 특히 어려운 말이나 상황",
    "말할 때 틀니가 움직이는지, 소리가 나는지, 통증이 동반되는지",
    "침이 고이는 느낌이 언제 심하고 식사나 삼킴도 불편한지",
    "이전 틀니 사용 경험과 새 틀니의 착용·관리 안내"
  ],
  "choices": [
    {
      "condition": "큰 움직임이나 통증 없이 발음이 낯설게 느껴진다면",
      "option": "진료실에서 안내받은 착용법을 지키며 짧은 문장부터 소리 내어 읽고 변화와 어려움을 기록합니다.",
      "limit": "정해진 며칠 안에 모두 적응한다고 보장하지 않으며 불편이 지속되면 재평가합니다."
    },
    {
      "condition": "말할 때 틀니가 들뜨거나 딸깍거리고 아프다면",
      "option": "치과에서 맞음새와 맞물림, 닿는 부분을 점검하고 조정 가능성을 상담합니다.",
      "limit": "집에서 갈거나 구부리거나 접착제로 형태를 바꾸지 않습니다."
    },
    {
      "condition": "조정 후에도 불편이 남거나 제작 형태의 평가가 필요하다면",
      "option": "어떤 문제가 남았는지 확인한 뒤 추가 조정과 재제작 등 가능한 방법을 비교합니다.",
      "limit": "증상만으로 재제작 필요성이나 추가 비용을 확정할 수 없습니다."
    }
  ],
  "unknown": "갑자기 말이 어눌해지거나 얼굴 한쪽이 처지거나 한쪽 팔에 힘이 빠지는 증상은 하나만 나타나도 틀니 적응 문제로 기다리지 말고 즉시 119를 요청하세요. 틀니와 관련된 불편의 원인과 조정 범위는 실제 검사가 필요합니다.",
  "prepare": [
    "새 틀니와 이전 틀니가 있다면 함께 지참",
    "어려운 단어와 문장, 불편한 시간대를 적은 메모",
    "현재 받은 착용·세척 지침과 조정 이력",
    "곧 예정된 모임·업무·이동 일정과 가장 해결하고 싶은 불편"
  ],
  "localHeading": "서산에서 새 틀니 점검을 준비한다면",
  "localAdvice": "서울비디치과의 진료 장소는 천안 불당동입니다. 서산에서 방문할 때는 새 틀니 사용 뒤 발음과 침이 불편하고, 움직임이나 통증이 있는지도 예약 시 함께 알려주세요. 첫 평가와 조정 뒤 재점검이 나뉠 수 있으므로 방문 계획을 확인하고, 진료 전에 어느 정도 착용하고 올지는 해당 치과의 안내를 받으세요.",
  "related": [
    {
      "title": "틀니 치료와 관리 가이드",
      "href": "/guide/denture"
    },
    {
      "title": "틀니 선택 뒤 후회를 줄이기 위한 질문",
      "href": "/guide/regret/denture"
    },
    {
      "title": "부분 틀니와 전체 틀니 비교",
      "href": "/guide/compare/partial-vs-complete-denture"
    },
    {
      "title": "틀니가 늘 같은 잇몸을 누르고 아플 때",
      "href": "/concerns/denture-sore-same-spot"
    }
  ],
  "sources": [
    {
      "title": "Cambridge University Hospitals · 새 틀니의 침 증가와 발음 연습, 관리",
      "href": "https://www.cuh.nhs.uk/patient-information/denture-care-looking-after-your-dentures/"
    },
    {
      "title": "NHS · 틀니 적응과 치과에서 점검받을 증상",
      "href": "https://www.nhs.uk/tests-and-treatments/dentures/"
    },
    {
      "title": "Leeds Teaching Hospitals · 부분 틀니 적응과 임의 조정 금지",
      "href": "https://www.leedsth.nhs.uk/patients/resources/removable-partial-dentures/"
    },
    {
      "title": "NHS · 갑작스러운 말하기 어려움과 뇌졸중 응급 신호",
      "href": "https://www.nhs.uk/conditions/stroke/symptoms/"
    }
  ],
  "updated": "2026-10-11",
  "publishedAt": "2026-10-11T18:09:30+09:00"
},
{
  "slug": "broken-night-guard-repair-or-replace",
  "title": "이갈이 장치에 금이 갔어요. 안 끼면 치아가 상할까 봐 겁나요.",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "턱관절",
  "concern": "장치가 깨져 불안해요",
  "description": "천안에서 깨진 이갈이 장치와 교합안정장치를 점검할 때, 사용 중단과 수리·재제작의 조건 및 치아와 턱 불편 상담을 정리합니다.",
  "situation": "천안에서 밤마다 이갈이 장치를 사용하다가 한쪽에 금이 간 것을 발견했습니다. 장치 없이 자면 치아가 깨질 것 같고, 새로 만드는 비용도 부담돼 계속 끼워도 될지 망설입니다.",
  "answer": "금이 가거나 조각이 떨어진 장치는 사용을 멈추고 제공한 치과에 점검을 요청하세요. 다시 끼워지는 것만으로 안전한 사용을 확인할 수 없습니다. 장치의 손상과 맞음새, 현재 치아와 턱 증상을 함께 살핀 뒤 수리 또는 재제작을 비교합니다.",
  "checks": [
    "장치를 만든 시점, 손상을 처음 발견한 날, 떨어진 조각 유무를 확인합니다.",
    "최근 크라운·충전·교정 등 치아 치료 후 맞음새가 달라졌는지 알립니다.",
    "치아 통증·턱 통증·잠에서 깬 뒤 맞물림 변화가 있는지 따로 정리합니다."
  ],
  "choices": [
    {
      "condition": "손상 부위가 제한적이고 수리 뒤 적합성을 확보할 수 있다면",
      "option": "치과에서 수리 가능성을 평가합니다.",
      "limit": "사진이나 금의 길이만으로 수리 가능 여부를 확정할 수 없습니다."
    },
    {
      "condition": "변형·마모·파절 때문에 안정적인 사용이 어렵다면",
      "option": "재제작과 장치 사용 목적을 다시 상담합니다.",
      "limit": "새 장치의 재료·설계·제작 기간과 비용은 개별 확인 사항입니다."
    },
    {
      "condition": "장치 사용과 별개로 새 치아·턱 증상이 생겼다면",
      "option": "증상의 원인을 먼저 평가하고 관리 계획을 조정합니다.",
      "limit": "장치가 깨졌다는 사실만으로 치아가 이미 손상됐다고 단정하지 않습니다."
    }
  ],
  "unknown": "이 글은 밤에 사용하는 이갈이 장치·교합안정장치에 관한 안내입니다. 교정 유지장치, 수면무호흡 장치, 외상 치아를 고정한 철사는 목적과 대응이 다릅니다. 접착제로 붙이거나 끓는 물로 모양을 바꾸지 말고 장치 종류부터 확인하세요.",
  "prepare": [
    "깨진 장치와 찾을 수 있는 조각, 원래 보관함",
    "제작 병원과 날짜, 장치 사용 지시가 남아 있다면 함께 준비",
    "최근 치과 치료와 사용 전후 통증·맞물림 변화 메모"
  ],
  "localHeading": "천안에서 턱관절 장치 점검을 준비한다면",
  "localAdvice": "천안 불당동 서울비디치과로 방문할 때는 기존 장치의 종류와 제작 병원, 금이 간 위치를 먼저 알리세요. 첫 방문의 장치 평가와 수리·재제작 완료는 구분해 일정을 문의할 수 있습니다. 다른 병원에서 만든 장치의 보증이나 부품·재료 조건이 그대로 적용된다고 가정하지 마세요.",
  "related": [
    {
      "title": "턱관절 진료 가이드",
      "href": "/guide/inside-out/tmj"
    },
    {
      "title": "통증 없는 턱 소리와 장치 고민",
      "href": "/concerns/jaw-clicking-without-pain"
    }
  ],
  "sources": [
    {
      "title": "NHS Wales · 교합 장치의 사용 목적·맞음새·맞물림 변화 시 상담",
      "href": "https://primarycareone.nhs.wales/files/information-for-dental-service/all-wales-oral-surgery-referral-handbook-for-general-dental-practitioners-pdf/"
    },
    {
      "title": "Manchester University NHS · 깨진 구강 장치의 사용 중단과 치과 연락",
      "href": "https://mft.nhs.uk/app/uploads/sites/3/2018/09/UDH-121.pdf"
    },
    {
      "title": "NHS Business Services Authority · 교합 장치의 적합성 및 증상 재평가",
      "href": "https://faq.nhsbsa.nhs.uk/knowledgebase/article/KA-02042/en-us"
    },
    {
      "title": "Royal Berkshire NHS · 교합안정장치 점검과 손상·마모 뒤 상담(2025)",
      "href": "https://www.royalberkshire.nhs.uk/media/qy5b5zl4/caring-for-your-hard-bite-raising-appliance-michigan-splint_may25.pdf"
    }
  ],
  "updated": "2026-10-12",
  "publishedAt": "2026-10-12T09:00:00+09:00"
},
{
  "slug": "child-baby-tooth-knocked-out-do-not-replant",
  "title": "아이가 넘어져 유치가 통째로 빠졌어요. 다시 끼워 넣어야 하나요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "소아치과",
  "concern": "아이 앞니가 빠졌어요",
  "description": "아산에서 아이 유치가 외상으로 빠졌을 때, 영구치와 다른 응급 대응과 치아를 찾지 못한 경우의 확인, 이후 관찰을 정리합니다.",
  "situation": "아산에서 어린아이가 넘어져 앞니가 보이지 않습니다. 바닥에서 치아를 찾았지만 다시 끼워야 한다는 영구치 응급 안내가 떠올라 유치도 그렇게 해야 할지 혼란스럽습니다.",
  "answer": "외상으로 통째로 빠진 유치는 다시 심지 않습니다. 영구치 탈락과 대응이 다르므로 치아 종류가 불확실하면 즉시 치과에 문의하세요. 유치가 빠졌더라도 입안과 다른 손상은 확인해야 하며, 치아를 찾지 못했거나 호흡 이상이 있다면 그 사실을 바로 알리세요.",
  "checks": [
    "넘어진 시간과 부딪힌 장소, 빠진 치아를 찾았는지 정리합니다.",
    "치아가 원래 유치였는지, 최근 새로 난 영구치였는지 알립니다. 모르면 추측하지 않습니다.",
    "호흡 이상·의식 변화·반복 구토·멈추지 않는 출혈 등 동반 손상을 확인합니다."
  ],
  "choices": [
    {
      "condition": "통째로 빠진 유치로 확인된다면",
      "option": "재식하지 않고 상처와 주변 치아, 이후 영구치 발육을 관찰하는 계획을 상담합니다.",
      "limit": "빈자리가 생겼다는 이유만으로 모든 아이에게 장치가 필요한 것은 아닙니다."
    },
    {
      "condition": "치아를 찾지 못했거나 잇몸 안으로 들어간 가능성이 있다면",
      "option": "실제 탈락인지 다른 손상인지 진찰과 필요한 검사를 받습니다.",
      "limit": "눈에 안 보인다는 사실만으로 삼켰거나 빠졌다고 단정하지 않습니다."
    },
    {
      "condition": "영구치 탈락이거나 치아 종류가 불확실하다면",
      "option": "시간을 지체하지 말고 치과 응급 안내를 받습니다.",
      "limit": "이 유치 노트의 재식 금지 안내를 영구치에 그대로 적용하지 마세요."
    }
  ],
  "unknown": "유치 외상 뒤 영구치가 정상으로 나올지, 장치나 추가 처치가 필요한지는 손상과 발육 상태를 확인해야 합니다. 보호자가 직접 빈자리를 찌르거나 유치를 끼워 넣지 마세요. 호흡곤란·의식 이상이 있으면 119 등 응급 의료가 우선입니다.",
  "prepare": [
    "찾은 치아는 용기에 담아 가져가되 유치 재식을 시도하지 않기",
    "사고 시각·장소·아이 나이와 동반 증상 메모",
    "가능하면 이전 치아 사진과 이미 시행한 처치 정보"
  ],
  "localHeading": "아산에서 소아치과 외상 상담을 준비한다면",
  "localAdvice": "아산에서 천안 불당동 서울비디치과로 이동하기 전 아이 나이와 사고 시각, 치아를 찾았는지, 호흡이나 의식 변화 여부를 먼저 전달하세요. 응급 의료가 필요한 아이를 특정 치과까지 이동시키느라 지연하지 마세요. 진찰 가능한 일정과 필요한 진료 연결을 확인합니다.",
  "related": [
    {
      "title": "소아치과 진료 가이드",
      "href": "/guide/inside-out/pediatric"
    },
    {
      "title": "영구치가 통째로 빠진 경우",
      "href": "/concerns/permanent-tooth-knocked-out-in-accident"
    },
    {
      "title": "유치를 일찍 잃은 뒤 공간유지장치 고민",
      "href": "/concerns/child-early-baby-molar-loss-space-maintainer"
    }
  ],
  "sources": [
    {
      "title": "IADT · 현재 제공되는 치아 외상 지침과 유치·영구치 구분",
      "href": "https://iadt-dentaltrauma.org/guidelines-and-resources/guidelines/"
    },
    {
      "title": "AAPD · IADT 유치 외상 지침",
      "href": "https://www.aapd.org/research/oral-health-policies--recommendations/guidelines-for-the-management-of-traumatic-dental-injuries-in-the-primary-dentition/"
    },
    {
      "title": "American Academy of Pediatrics · 유치 재식 금지와 찾지 못한 치아 평가",
      "href": "https://publications.aap.org/pediatrics/article/133/2/e466/30896/Management-of-Dental-Trauma-in-a-Primary-Care"
    },
    {
      "title": "IADT·Academy for Sports Dentistry · 2024 응급처치 교육 지침: 유치·영구치 구분",
      "href": "https://doi.org/10.1111/edt.12931"
    }
  ],
  "updated": "2026-10-12",
  "publishedAt": "2026-10-12T09:00:00+09:00"
},
{
  "slug": "white-lacy-mouth-patches-oral-lichen-planus",
  "title": "볼 안쪽에 하얀 그물무늬가 생겼어요. 편평태선이라는데 암인가요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "구강내과",
  "concern": "낯선 진단명이 두려워요",
  "description": "홍성에서 구강 편평태선 설명을 들었을 때, 흰무늬의 확인과 조직검사·증상 치료·정기 관찰을 구분해 상담을 준비합니다.",
  "situation": "홍성에서 볼 안쪽 흰무늬를 발견해 치과에 갔다가 구강 편평태선이라는 설명을 들었습니다. 아프지 않은데 조직검사와 정기 관찰 이야기가 나와 암이라는 뜻인지 걱정됩니다.",
  "answer": "구강 편평태선은 구강 점막의 염증성 질환이며 진단명 자체가 암을 뜻하지 않습니다. 다만 흰무늬만 보고 집에서 진단할 수 없고, 필요하면 조직검사로 확인합니다. 증상이 적으면 약 없이 관찰할 수 있어도 새 궤양·덩어리·변화가 생기면 다시 평가해야 합니다.",
  "checks": [
    "정확한 진단명과 조직검사를 이미 했는지, 결과를 확인할 날짜를 정리합니다.",
    "흰무늬가 시작된 시기와 통증·따가움·식사 불편, 최근 변화 부위를 알립니다.",
    "복용약과 최근 치과 재료 치료, 피부 등 입 밖의 증상이 있는지 함께 전달합니다."
  ],
  "choices": [
    {
      "condition": "진찰과 필요 검사로 확인되고 생활 불편이 적다면",
      "option": "정해진 간격으로 변화를 관찰하며 관리합니다.",
      "limit": "약을 안 쓰는 결정이 이후 검진까지 생략하라는 의미는 아닙니다."
    },
    {
      "condition": "따가움·통증 때문에 식사와 위생 관리가 어렵다면",
      "option": "증상 치료와 사용 방법, 재평가 시점을 상담합니다.",
      "limit": "처방 없이 피부용 스테로이드 등을 입안에 바르지 마세요."
    },
    {
      "condition": "새로운 궤양·덩어리 또는 양상이 다른 부위가 생겼다면",
      "option": "정기 예약을 기다리기보다 평가 시기를 다시 문의합니다.",
      "limit": "기존 진단명이 모든 새 변화를 설명한다고 단정하지 않습니다."
    }
  ],
  "unknown": "개인별 장기 경과나 위험을 사진 한 장으로 예측할 수 없습니다. 암이 아니니 영원히 걱정할 필요 없다는 보장과 반드시 암으로 변한다는 단정 모두 피해야 합니다. 조직검사 이유와 추적 관찰 기준을 설명받고 필요한 전문 진료 연결을 상담하세요.",
  "prepare": [
    "이전 진찰·조직검사 결과가 있다면 사본",
    "복용약 이름과 시작·변경 시점, 관련 치과 치료 기록",
    "평소 식사와 양치에서 불편한 자극, 새 변화 메모"
  ],
  "localHeading": "홍성에서 구강내과 상담을 준비한다면",
  "localAdvice": "홍성에서 천안 불당동 서울비디치과로 방문하려면 처음 들은 진단명과 조직검사 유무를 먼저 전달하세요. 구강내과 평가 또는 전문기관 연결이 필요한지, 첫 진찰과 검사 결과 확인을 어떻게 나눌지 문의합니다. 병원은 천안 불당동에 있으며 홍성 분원이 있다는 의미가 아닙니다.",
  "related": [
    {
      "title": "구강내과 진료 가이드",
      "href": "/guide/inside-out/oral-medicine"
    },
    {
      "title": "입안 상처가 오래 낫지 않을 때",
      "href": "/concerns/mouth-ulcer-same-spot-over-three-weeks"
    }
  ],
  "sources": [
    {
      "title": "Cambridge University Hospitals · 구강 편평태선의 진단·증상 치료·관찰",
      "href": "https://www.cuh.nhs.uk/patient-information/lichen-planus-of-the-mouth/"
    },
    {
      "title": "University College London Hospitals · 구강 편평태선과 정기 재평가",
      "href": "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/lichen-planus"
    },
    {
      "title": "NHS · 편평태선과 구강 증상 관리",
      "href": "https://www.nhs.uk/conditions/lichen-planus/"
    }
  ],
  "updated": "2026-10-12",
  "publishedAt": "2026-10-12T09:00:00+09:00"
},
{
  "slug": "diarrhoea-after-dental-antibiotics",
  "title": "치과 항생제를 먹고 설사가 나요. 끝까지 먹어야 한다는데 참아야 하나요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "응급진료",
  "concern": "약 부작용이 걱정돼요",
  "description": "예산에서 치과 처방 항생제 복용 뒤 설사가 생겼을 때, 약 이름과 증상으로 상담을 준비하고 심한 설사·혈변·알레르기 응급 신호를 구분합니다.",
  "situation": "예산에서 치과 감염 치료를 받고 항생제를 복용한 뒤 설사가 시작됐습니다. 약을 끝까지 먹으라는 설명과 부작용이 걱정되는 마음 사이에서 다음 복용을 어떻게 해야 할지 망설입니다.",
  "answer": "항생제 복용 중 설사가 생기면 참으면서 계속 먹을지 혼자 정하기보다 처방 의료진이나 약사에게 바로 알리세요. 약 이름·복용 시각·설사 정도가 판단에 필요합니다. 심한 설사나 혈액·점액이 섞인 변, 탈수 등은 신속한 의료 평가가 필요하며 호흡곤란·입술이나 혀 부종은 119 응급 대응이 우선입니다.",
  "checks": [
    "약 봉투에서 항생제 이름과 용량, 복용을 시작한 날을 확인합니다.",
    "설사 시작 시각·횟수·혈액이나 점액·복통·열·소변 감소를 알립니다.",
    "최근 다른 항생제·다른 약 복용과 치과 감염의 붓기·통증 변화도 전달합니다."
  ],
  "choices": [
    {
      "condition": "항생제 복용 중 새 설사가 생겼으나 심한 증상이 없다면",
      "option": "처방 의료진 또는 약사에게 약 이름과 증상을 전하고 다음 복용 지시를 확인합니다.",
      "limit": "가벼워 보인다는 이유만으로 아무 연락 없이 오래 참지 마세요."
    },
    {
      "condition": "심한 설사·혈변·점액변·심한 복통이나 탈수 의심이 있다면",
      "option": "다음 복용 전 신속한 의료 평가를 받으며 해당 약의 중단·변경 지시를 확인합니다.",
      "limit": "지사제를 임의로 추가해 증상을 가리고 버티지 마세요."
    },
    {
      "condition": "숨쉬기 어렵거나 입술·혀·목이 붓는다면",
      "option": "119 등 응급 의료로 연결하며 의심 약을 다시 복용하지 않습니다.",
      "limit": "치과 연락이나 다음 예약을 기다리지 마세요."
    }
  ],
  "unknown": "설사만으로 약 알레르기나 C. difficile 감염을 확진할 수 없습니다. 항생제별 주의사항이 달라 이 글은 특정 용량의 복용·중단 처방을 대신하지 않습니다. 아목시실린 안내에는 심한 설사나 혈액·점액이 섞인 설사 시 중단하고 즉시 의료 도움을 받도록 명시돼 있습니다. 실제 약 이름을 확인하세요.",
  "prepare": [
    "약 봉투·처방전과 복용한 다른 약의 이름",
    "최근 복용 시각과 설사·열·복통·수분 섭취·소변 변화",
    "치과에서 받은 감염 치료와 이후 붓기·통증 경과"
  ],
  "localHeading": "예산에서 응급진료와 처방 상담을 준비한다면",
  "localAdvice": "예산에서 천안 불당동 서울비디치과로 이동하기 전에 처방 약과 설사 증상을 전화로 먼저 전달하세요. 심한 설사나 탈수는 가까운 의료기관 평가가 필요할 수 있어 특정 치과까지 이동하느라 지연하지 않습니다. 치아 감염 치료 일정과 약 부작용 평가를 함께 조정할 방법을 상의합니다.",
  "related": [
    {
      "title": "치과 응급진료 가이드",
      "href": "/guide/inside-out/emergency"
    },
    {
      "title": "항생제로 치통이 가라앉아도 치료가 필요한 이유",
      "href": "/concerns/toothache-returns-after-antibiotics"
    }
  ],
  "sources": [
    {
      "title": "NHS · 항생제의 부작용과 처방별 주의사항",
      "href": "https://www.nhs.uk/medicines/antibiotics/"
    },
    {
      "title": "NHS · 아목시실린의 설사·중대한 부작용 안내",
      "href": "https://www.nhs.uk/medicines/amoxicillin/side-effects-of-amoxicillin/"
    },
    {
      "title": "NHS · C. difficile 감염과 항생제 복용 후 설사 평가",
      "href": "https://www.nhs.uk/conditions/c-difficile/"
    },
    {
      "title": "NHS · 아목시실린 복용과 누락된 용량 안내",
      "href": "https://www.nhs.uk/medicines/amoxicillin/how-and-when-to-take-amoxicillin/"
    }
  ],
  "updated": "2026-10-12",
  "publishedAt": "2026-10-12T09:00:00+09:00"
},
{
  "slug": "full-arch-implant-food-trapped-under-bridge",
  "title": "전체 임플란트 아래에 음식이 껴요. 고정된 치아를 빼서 닦아야 하나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "임플란트",
  "concern": "고정식 풀아치 아래 음식 끼임과 청소의 어려움",
  "description": "전체 임플란트 아래 음식이 끼고 냄새가 걱정될 때, 청소 도구가 닿는지와 잇몸 염증·보철 흔들림을 나누어 확인합니다. 보철을 분리할 조건과 진료 준비를 정리합니다.",
  "situation": "당진에서 생활하며 식사 뒤 고정된 치아 아래에 음식이 남는 느낌이 들고, 다시 큰 치료가 필요할까 봐 청소할 때마다 조심스러운 상황입니다.",
  "answer": "음식이 낀다는 이유만으로 전체 보철을 매번 분리하지는 않습니다. 집에서 닿지 않는 곳, 잇몸 상태와 보철의 안정성을 확인한 뒤 의료진이 전문 청소와 분리 필요성을 결정합니다.",
  "checks": [
    "어느 쪽에 무엇이 끼며 청소 뒤에도 남는지",
    "출혈·붓기·고름·나쁜 맛이나 흔들림이 있는지",
    "도구가 보철 아래를 실제로 통과하는지"
  ],
  "choices": [
    {
      "condition": "보철이 안정적이고 청소할 통로를 사용할 수 있을 때",
      "option": "현재 구조에 맞는 도구와 방법을 배워 관리",
      "limit": "잇몸 염증 여부는 별도로 확인해야 합니다."
    },
    {
      "condition": "도구가 닿지 않거나 같은 곳의 불편이 반복될 때",
      "option": "전문 청소와 보철 형태·청소 접근성 평가",
      "limit": "조정 또는 분리 범위는 진찰 뒤 정합니다."
    },
    {
      "condition": "출혈·붓기·고름 또는 흔들림이 동반될 때",
      "option": "잇몸과 임플란트 주위, 연결 부품을 함께 검사",
      "limit": "증상만으로 재수술이나 단순 나사 문제를 구분할 수 없습니다."
    }
  ],
  "unknown": "사진만으로 청소 공간의 적절함, 뼈 상태, 나사나 보철의 손상 여부를 확정할 수 없습니다.",
  "prepare": [
    "사용 중인 칫솔·치간 도구",
    "보철을 장착한 시기와 최근 점검 기록",
    "불편한 위치·시점과 증상 메모"
  ],
  "localHeading": "당진에서 이동한다면, 청소 교육과 필요한 검사를 함께 확인하세요",
  "localAdvice": "실제 진료 장소는 천안 불당동입니다. 당진에서 방문하기 전 기존 임플란트 보철 정보와 증상을 알려 필요한 자료를 확인하고, 정기 관리 장소와 갑작스러운 불편 때 연락할 곳을 구분해 두세요.",
  "related": [
    {
      "title": "임플란트 치료와 관리 가이드",
      "href": "/guide/implant"
    },
    {
      "title": "전체 임플란트와 올온 방식 비교",
      "href": "/guide/compare/full-implant-vs-all-on"
    }
  ],
  "sources": [
    {
      "title": "ACP · 고정식 풀아치 임플란트 보철의 유지관리 입장문",
      "href": "https://www.prosthodontics.org/about-acp/position-statement-maintenance-of-full-arch-implant-restorations/"
    },
    {
      "title": "EFP · 임플란트 주위 질환 예방·치료 임상지침",
      "href": "https://www.efp.org/education/continuing-education/clinical-guidelines/guideline-on-treatment-of-peri-implant-diseases/"
    },
    {
      "title": "EFP · 임플란트 주위 질환과 경고 증상",
      "href": "https://www.efp.org/for-patients/dental-implants/peri-implant-diseases/"
    },
    {
      "title": "EFP · 임플란트 주위 질환 예방",
      "href": "https://www.efp.org/for-patients/dental-implants/peri-implant-disease-prevention/"
    }
  ],
  "updated": "2026-10-13",
  "publishedAt": "2026-10-13T14:25:59.347Z"
},
{
  "slug": "partial-denture-metal-clasp-visible",
  "title": "부분틀니의 금속 고리가 보여 웃기가 불편해요. 고리를 없앨 수 있나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "틀니",
  "concern": "웃을 때 보이는 부분틀니 고리와 남은 치아에 대한 걱정",
  "description": "부분틀니 금속 고리가 보여 웃음을 숨기게 될 때, 고리의 역할과 남은 치아 상태를 먼저 살핍니다. 덜 보이는 연결 방식과 브리지·임플란트의 조건, 조정 전 확인할 질문을 정리합니다.",
  "situation": "서산에서 생활하며 씹는 것은 나아졌지만 웃을 때마다 금속 고리가 눈에 들어와, 틀니를 했다는 사실이 드러날까 신경 쓰이는 상황입니다.",
  "answer": "금속 고리는 틀니가 제자리에 머물도록 돕는 부품이라 임의로 없애면 안 됩니다. 덜 보이는 방식이 가능한지, 남은 치아와 잇몸이 감당할 수 있는지를 함께 비교해야 합니다.",
  "checks": [
    "어떤 표정에서 어느 고리가 보이는지",
    "씹을 때 들뜸이나 치아 통증이 있는지",
    "고리를 거는 치아와 잇몸의 건강 상태"
  ],
  "choices": [
    {
      "condition": "현재 틀니는 편하고 보이는 부분만 신경 쓰일 때",
      "option": "기존 설계에서 개선 가능한 범위 평가",
      "limit": "부분 조정만으로 고리가 완전히 사라진다고 약속할 수 없습니다."
    },
    {
      "condition": "다른 연결 방식을 고려할 수 있을 때",
      "option": "어태치먼트 등 덜 보이는 방식 비교",
      "limit": "남은 치아의 치료와 비용·관리 부담이 추가될 수 있습니다."
    },
    {
      "condition": "틀니 이외의 방법도 비교하고 싶을 때",
      "option": "브리지 또는 임플란트 적합성 평가",
      "limit": "치아 삭제나 수술 여부 등 새로운 부담을 함께 고려해야 합니다."
    }
  ],
  "unknown": "사진만으로 고리를 옮기거나 없앨 수 있는지, 기존 틀니를 수정할 수 있는지 확정할 수 없습니다.",
  "prepare": [
    "현재 사용하는 부분틀니",
    "고리가 신경 쓰이는 표정의 사진",
    "제작 시기와 아프거나 헐거운 위치 메모"
  ],
  "localHeading": "서산에서 방문한다면, 지금 쓰는 틀니와 원하는 변화를 함께 가져오세요",
  "localAdvice": "실제 진료 장소는 천안 불당동입니다. 서산에서 이동하기 전 부분틀니 조정 상담임을 알리고, 첫 검사와 필요할 수 있는 제작·조정 방문을 나누어 일정과 비용 설명을 받으세요.",
  "related": [
    {
      "title": "틀니 선택과 적응 가이드",
      "href": "/guide/denture"
    },
    {
      "title": "부분틀니와 전체틀니 비교",
      "href": "/guide/compare/partial-vs-complete-denture"
    }
  ],
  "sources": [
    {
      "title": "ADA·ACP · 부분틀니 연결 방식과 관리 안내",
      "href": "https://www.mouthhealthy.org/all-topics-a-z/dentures-partial"
    },
    {
      "title": "Leeds NHS · 가철성 부분틀니 안내",
      "href": "https://www.leedsth.nhs.uk/patients/resources/removable-partial-dentures/"
    },
    {
      "title": "Leeds NHS · 브리지의 종류와 대안",
      "href": "https://www.leedsth.nhs.uk/patients/resources/bridges/"
    },
    {
      "title": "NHS · 틀니의 사용·관리와 점검이 필요한 증상",
      "href": "https://www.nhs.uk/tests-and-treatments/dentures/"
    }
  ],
  "updated": "2026-10-13",
  "publishedAt": "2026-10-13T14:25:59.347Z"
},
{
  "slug": "orthodontic-roots-shortened-on-xray",
  "title": "교정 중 치아 뿌리가 짧아졌대요. 교정을 멈춰야 하나요?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "치아교정",
  "concern": "치근흡수 때문에 치아를 잃을까 두렵고, 계속할지 멈출지 결정하기 어려운 상황",
  "description": "교정 중 엑스레이에서 발견한 치근흡수. 변화의 범위와 진행 여부, 남은 이동의 필요성을 비교하고 치료 조정과 유지계획을 질문하는 순서를 살펴봅니다.",
  "situation": "천안에서 치아교정을 받고 있습니다. 치아는 가지런해지고 있는데 뿌리가 짧아졌다는 말을 들었습니다. 끝까지 치료해도 되는지, 지금 멈추면 들인 시간과 비용이 헛될지 걱정됩니다.",
  "answer": "짧아졌다는 한마디만으로 교정 중단이나 치아의 수명을 결정하지 않습니다. 처음과 현재 영상의 변화, 남은 뿌리와 잇몸 지지, 추가 이동의 이익과 위험을 함께 평가해 계획을 다시 정합니다.",
  "checks": [
    "어느 치아의 어느 부위가 이전 영상과 달라졌는지",
    "촬영 조건을 고려해 실제 변화와 진행 여부를 확인했는지",
    "이전에 부딪힌 치아나 기존에 짧았던 뿌리가 있는지",
    "남은 이동의 목적과 계획을 줄였을 때 생기는 차이"
  ],
  "choices": [
    {
      "condition": "변화가 작고 남은 치료의 이익이 있다고 판단되는 경우",
      "option": "힘과 이동 계획, 확인 간격을 조정하며 진행을 논의합니다.",
      "limit": "작은 변화라는 이유만으로 이후 진행이 없다고 보장하지 않습니다."
    },
    {
      "condition": "진행이 의심되거나 변화가 커서 위험 재평가가 필요한 경우",
      "option": "능동적인 이동의 휴지, 해당 치아 이동 제한, 목표 수정 또는 종료를 검토합니다.",
      "limit": "휴지기간과 재개 여부를 인터넷 기준으로 정하지 않습니다."
    },
    {
      "condition": "교정 관련 변화인지 다른 치근흡수인지 분명하지 않은 경우",
      "option": "필요한 추가 검사와 관련 진료과 평가로 원인을 구분합니다.",
      "limit": "모든 경우에 CT나 신경치료가 필요한 것은 아닙니다."
    }
  ],
  "unknown": "검사 전에는 흡수의 원인과 정도, 앞으로의 진행 여부, 가능한 최종 배열을 확정할 수 없습니다. 현재 사진 한 장으로 치아가 몇 년 남았는지도 계산할 수 없습니다.",
  "prepare": [
    "교정 전·중간 영상과 촬영 날짜",
    "교정 시작 시점과 장치 변경 기록",
    "치아 외상·신경치료 이력 및 새로 생긴 증상",
    "계속 치료할 때와 줄여 마칠 때 각각 가장 걱정되는 점"
  ],
  "localHeading": "천안에서 치아교정 경과를 다시 상담한다면",
  "localAdvice": "천안에서 치아교정 중 치근흡수 설명을 들었다면 기존 병원 기록을 먼저 확보하고 상담 목적을 정리해 보세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 직장·학교 일정과 이동 부담을 고려해 기록 검토에 필요한 자료, 추가 검사 여부와 추적 방문 계획을 예약 전에 확인하면 도움이 됩니다.",
  "related": [
    {
      "title": "치아교정 선택 전에 살펴볼 가이드",
      "href": "/guide/orthodontics"
    },
    {
      "title": "교정 후 후회와 계획 변경을 고민할 때",
      "href": "/guide/regret/orthodontics"
    }
  ],
  "sources": [
    {
      "title": "영국교정학회 — 교정치료 위험 설명 지침(2023 검토)",
      "href": "https://bos.org.uk/wp-content/uploads/2024/12/RISKS-OF-ORTHODONTIC-TREATMENT-GUIDANCE-ON-INFORMING-PATIENTS-2024.pdf"
    },
    {
      "title": "유럽근관치료학회 — 치근흡수 입장문(2023)",
      "href": "https://www.e-s-e.eu/fileadmin/user_upload/ESE_Position_Statement_-_Root_Resorption_2023_Final.pdf"
    },
    {
      "title": "네덜란드교정학회 승인 치근흡수 진료지침 연구(2019 공개·2020 게재)",
      "href": "https://academic.oup.com/ejo/article/42/2/115/5489277"
    },
    {
      "title": "영국교정학회 — 교정치료 동의와 계획 변경(2025)",
      "href": "https://bos.org.uk/wp-content/uploads/2025/05/CONSENT-IN-ORTHODONTICS-MAY-2025.pdf"
    }
  ],
  "updated": "2026-10-13",
  "publishedAt": "2026-10-13T14:25:59.347Z"
},
{
  "slug": "child-baby-molar-stainless-steel-crown-worry",
  "title": "아이 유치에 은색 크라운을 씌우자는데, 너무 큰 치료 아닌가요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "소아치과",
  "concern": "곧 빠질 유치에 금속관을 씌워야 하는지, 아이가 힘들어하거나 눈에 띄어 속상해하지 않을지 걱정되는 상황",
  "description": "유치 어금니의 은색 크라운을 권유받았을 때 충치 범위, 신경치료 여부, 씹는 기능과 외관, 치료 후 관리까지 비교하며 결정하는 질문을 정리합니다.",
  "situation": "아산에서 아이 충치를 상담했습니다. 작은 충치인 줄 알았는데 치아 전체에 은색 모자를 씌운다고 합니다. 그냥 메울 수는 없는지, 유치인데 꼭 해야 하는지 마음이 복잡합니다.",
  "answer": "은색 크라운이 필요한지는 유치라는 이름보다 충치 범위와 남은 치아, 치수 상태, 앞으로 사용할 기간을 함께 보고 판단합니다. 작은 수복이 가능한 경우와 치아 전체를 보호하는 편이 나은 경우를 구분해 설명받으세요.",
  "checks": [
    "어느 유치의 몇 개 면이 손상되었고 남은 치아가 얼마나 되는지",
    "치수 치료가 필요한지, 크라운만 계획된 것인지",
    "영구치로 교환되기까지 예상되는 기간과 현재 증상",
    "메우기·크라운·다른 대안의 이익과 한계",
    "마취와 치료 방법, 아이가 받아들일 수 있는 진행 방식"
  ],
  "choices": [
    {
      "condition": "손상 범위가 제한되고 적절한 수복이 가능한 경우",
      "option": "부분 수복과 예방·경과 관찰 계획을 비교합니다.",
      "limit": "작은 치료가 모든 큰 충치에서도 오래 유지되는 것은 아닙니다."
    },
    {
      "condition": "여러 면이 손상되거나 남은 치아를 감싸 보호할 필요가 있는 경우",
      "option": "기성 금속관 등 전체를 덮는 수복을 검토합니다.",
      "limit": "금속 색, 초기 물림의 변화, 추후 탈락·마모 가능성과 관리를 함께 설명받습니다."
    },
    {
      "condition": "깊은 충치나 감염, 수복하기 어려운 손상이 의심되는 경우",
      "option": "치수 상태와 치아 보존 가능성을 먼저 평가합니다.",
      "limit": "크라운만 씌우면 모두 해결되는 상황은 아니며 별도 치료 판단이 필요합니다."
    }
  ],
  "unknown": "입안을 보기 전에는 단순 수복이 가능한지, 치수 치료가 필요한지, 어떤 크라운이 적합한지 알 수 없습니다. 나이만으로 유치가 곧 빠질 것이라고 단정할 수도 없습니다.",
  "prepare": [
    "통증·식사 불편·붓기를 처음 느낀 시점",
    "이전 엑스레이와 충치 치료 기록",
    "알려진 금속 등 재료 알레르기와 복용 약 정보",
    "아이의 이전 진료 경험과 특히 두려워하는 과정"
  ],
  "localHeading": "아산에서 아이의 소아치과 상담을 준비한다면",
  "localAdvice": "아산에서 소아치과 진료를 위해 이동한다면 아이의 등하원과 보호자 일정까지 조정해야 할 수 있습니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 기존 검사 자료를 가져갈 수 있는지, 상담과 치료가 나뉘는지, 치료 후 불편할 때 어떤 절차로 연락하는지 미리 확인해 이동 계획을 세워 보세요.",
  "related": [
    {
      "title": "부모 마음부터 살피는 소아치과 안내",
      "href": "/guide/inside-out/pediatric"
    },
    {
      "title": "아이의 소아치과 진료 안내",
      "href": "/treatments/pediatric"
    },
    {
      "title": "크라운 치료의 선택 기준",
      "href": "/treatments/crown"
    }
  ],
  "sources": [
    {
      "title": "미국소아치과학회 — 소아 수복치료 지침(2022 개정)",
      "href": "https://www.aapd.org/media/Policies_Guidelines/BP_RestorativeDent.pdf"
    },
    {
      "title": "케임브리지대학병원 — 유치 금속관의 일반적인 시술 방법(2023)",
      "href": "https://www.cuh.nhs.uk/patient-information/stainless-steel-crowns-conventional-technique-a-parents-guide/"
    },
    {
      "title": "가이스·세인트토머스 NHS — 어린이 금속관과 이후 관리(2026년 7월 검토)",
      "href": "https://www.guysandstthomas.nhs.uk/health-information/stainless-steel-crowns-children"
    },
    {
      "title": "위럴 NHS — Hall 방식의 금속관 부모 안내(2025 검토)",
      "href": "https://www.wchc.nhs.uk/resources/stainless-steel-crowns-using-the-hall-technique/"
    }
  ],
  "updated": "2026-10-13",
  "publishedAt": "2026-10-13T14:25:59.347Z"
},
{
  "slug": "broken-instrument-left-in-root-canal",
  "title": "신경치료 중 기구가 부러져 안에 남았대요. 빼내지 않으면 위험한가요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "신경치료",
  "concern": "치아 안에 기구가 남았대요",
  "description": "홍성에서 신경치료 중 기구 파절 이야기를 듣고 불안한 분을 위한 안내. 제거·우회·경과 관찰의 판단 기준과 치아를 지키기 위해 확인할 질문을 정리합니다.",
  "situation": "홍성에서 신경치료를 받다가 가느다란 기구 일부가 뿌리 안에 남았다는 설명을 들었습니다. 그대로 두자니 몸에 문제가 생길까 두렵고, 꺼내려다 치아를 잃을 수 있다는 말도 이해하기 어렵습니다.",
  "answer": "기구가 남았다는 사실만으로 신경치료 실패나 발치가 결정되지는 않습니다. 조각의 위치, 그때까지 진행된 세척·소독, 감염과 남은 치아 구조를 함께 평가합니다. 제거의 이득과 치아 손상 위험을 비교해 제거·우회·유지 후 추적 또는 다른 치료를 검토합니다.",
  "checks": [
    "어느 치아의 어느 뿌리에 조각이 있고, 남은 길을 세척할 수 있는지 확인합니다.",
    "기구가 분리된 시점과 이전 감염 상태, 현재 증상·영상 소견을 비교합니다.",
    "제거를 시도할 때 잃을 치아 구조와 의뢰 필요성, 시도를 멈출 기준을 묻습니다."
  ],
  "choices": [
    {
      "condition": "접근할 수 있고 치아 손상을 줄이며 제거할 가능성이 있다면",
      "option": "기구 제거를 고려하고 이후 신경치료를 이어갑니다.",
      "limit": "조각을 꺼냈다고 치아의 장기 유지까지 보장되는 것은 아닙니다."
    },
    {
      "condition": "제거 위험이 크지만 필요한 치료와 추적을 할 수 있다면",
      "option": "조각 옆으로 길을 찾는 우회 또는 조각을 남기는 계획을 비교합니다.",
      "limit": "그대로 두는 결정에도 이유와 추적 일정, 계획을 바꿀 조건이 필요합니다."
    },
    {
      "condition": "감염이 지속되거나 접근·치아 보존에 한계가 있다면",
      "option": "근관치료에 숙련된 치과의사의 평가와 추가 치료 선택지를 상의합니다.",
      "limit": "수술이나 발치는 기구 파절 자체만으로 자동 결정하지 않습니다."
    }
  ],
  "unknown": "제거 가능성, 치아 보존 전망, 추가 비용과 방문 횟수는 조각의 존재만으로 정할 수 없습니다. 현재 평가에서 확인된 것과 아직 확인이 어려운 것을 나누어 설명받으세요.",
  "prepare": [
    "파절 전후 영상과 치료한 날짜·단계를 알 수 있는 기록",
    "통증·부기 등 변화와 설명받은 선택지의 메모",
    "복용약·알레르기 정보와 장거리 방문 때 어려운 일정"
  ],
  "localHeading": "홍성에서 신경치료 상담을 준비한다면",
  "localAdvice": "홍성에서 천안으로 이동하기 전, 신경치료 중 기구 파절을 평가받고 싶다고 알리고 기존 영상 전달 방법을 문의하세요. 첫날 검사와 제거 시도가 같은 날 가능한지는 미리 확정할 수 없습니다. 서울비디치과의 실제 진료 장소는 천안 불당동입니다.",
  "related": [
    {
      "title": "신경치료의 과정과 선택 기준",
      "href": "/guide/root-canal"
    },
    {
      "title": "재신경치료와 임플란트를 비교할 때",
      "href": "/guide/compare/re-root-canal-vs-implant"
    },
    {
      "title": "치근단수술의 판단 기준",
      "href": "/guide/inside-out/apicoectomy"
    }
  ],
  "sources": [
    {
      "title": "AAE 임상 해설 · 근관치료 합병증과 기구 파절 시 판단 (2026)",
      "href": "https://www.aae.org/specialty/what-happens-when-everything-goes-wrong-errors-and-complications-in-nonsurgical-root-canal-treatment-and-how-to-make-it-right/"
    },
    {
      "title": "Leeds NHS · 신경치료·재신경치료의 과정과 한계",
      "href": "https://www.leedsth.nhs.uk/patients/resources/understanding-your-endodontic-root-canal-treatment/"
    },
    {
      "title": "Wirral NHS · 신경치료 중 기구 분리와 후속 상담",
      "href": "https://www.wchc.nhs.uk/resources/having-root-canal-treatment/"
    },
    {
      "title": "AAE · 비수술 치료 이후 근관수술 선택",
      "href": "https://www.aae.org/patients/root-canal-treatment/endodontic-treatment-options/endodontic-surgery/"
    }
  ],
  "updated": "2026-10-14",
  "publishedAt": "2026-10-14T09:00:00+09:00"
},
{
  "slug": "sinus-lift-before-upper-molar-implant",
  "title": "비염이 있는데 상악동 거상술을 해도 되나요? 코 치료부터 해야 할까요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "임플란트",
  "concern": "비염 때문에 수술 순서가 걱정돼요",
  "description": "예산에서 비염이 있는 상태로 윗어금니 임플란트와 상악동 거상술을 준비하는 분을 위한 안내. 코 증상·병력 평가, 이비인후과 협진과 치료 순서의 질문을 정리합니다.",
  "situation": "예산에서 윗어금니 임플란트를 상담하다가 상악동을 올려야 한다는 말을 들었습니다. 평소 코가 자주 막히는데, 치아를 하나 채우려다 코 수술까지 받게 되는 건 아닌지 걱정됩니다.",
  "answer": "상악동 거상술은 윗어금니 위쪽 공기 공간의 안쪽 막을 들어 올려 임플란트를 위한 뼈 공간을 확보하는 과정입니다. 코 모양을 바꾸거나 코 안의 질환을 치료하는 수술과 목적이 다릅니다. 다만 코 증상과 과거 부비동 치료 이력에 따라 이비인후과 평가나 선행 치료가 필요한지 따로 확인합니다.",
  "checks": [
    "현재 코막힘·분비물·얼굴 불편과 반복 여부, 과거 부비동염 진단·수술 이력을 알립니다.",
    "임플란트를 놓을 자리의 남은 뼈와 상악동 상태를 영상과 진찰로 평가합니다.",
    "상악동 거상술의 필요성과 코 질환 치료의 필요성을 나누고 각각의 판단 근거를 묻습니다."
  ],
  "choices": [
    {
      "condition": "현재 조건에서 뼈 높이를 늘리는 방법이 적절하다면",
      "option": "상악동 거상술의 접근 방법과 임플란트 동시 식립 또는 단계적 식립을 비교합니다.",
      "limit": "남은 뼈와 초기 고정 조건에 따라 일정이 달라지고 수술 중 계획이 바뀔 수도 있습니다."
    },
    {
      "condition": "코 증상·병력이나 영상에서 추가 확인이 필요하다면",
      "option": "필요한 이비인후과 평가와 치과 치료의 순서를 정합니다.",
      "limit": "비염이라는 이름만으로 수술 가능 여부를 결정하거나 모두 코 수술을 받는 것은 아닙니다."
    },
    {
      "condition": "추가 수술 부담이 크거나 다른 회복 방법도 가능하다면",
      "option": "짧은 임플란트, 브릿지·틀니 등 적용 가능한 대안을 비교합니다.",
      "limit": "대안도 남은 뼈·주변 치아·맞물림에 조건이 있으며 누구에게나 수술을 피할 방법이 있는 것은 아닙니다."
    }
  ],
  "unknown": "코 증상만으로 상악동 상태나 수술 가능 여부를 확정할 수 없습니다. 필요한 검사, 이식재, 수술 범위, 회복 기간과 전체 비용은 개별 평가 후 확인할 사항입니다.",
  "prepare": [
    "기존 치과 영상과 임플란트 치료계획서가 있다면 사본",
    "비염·부비동염 진단과 코 수술 이력, 현재 사용하는 약 정보",
    "쉬기 어려운 날짜와 이동·운전·동행에 관한 현실적인 사정"
  ],
  "localHeading": "예산에서 첫 상담을 준비한다면",
  "localAdvice": "예산에서 천안으로 임플란트 상담을 오기 전 상악동 거상술 권유와 평소 코 증상을 함께 알려주세요. 검사와 이비인후과 평가가 필요한지부터 상의하고 수술 당일 완료를 전제로 일정을 잡지 마세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다.",
  "related": [
    {
      "title": "임플란트 치료 전체 과정",
      "href": "/guide/implant"
    },
    {
      "title": "브릿지와 임플란트의 조건 비교",
      "href": "/guide/compare/bridge-vs-implant"
    },
    {
      "title": "상악동 거상술 진료 안내",
      "href": "/treatments/implant-sinus-lift"
    }
  ],
  "sources": [
    {
      "title": "Cambridge NHS · 상악동 거상술의 과정·위험·대안",
      "href": "https://www.cuh.nhs.uk/patient-information/sinus-lift-procedures/"
    },
    {
      "title": "ITI 임상 해설 · 상악동 거상술 전 코 증상·병력 평가",
      "href": "https://blog.iti.org/clinical-insights/sinus-floor-elevation-in-implant-dentistry/"
    },
    {
      "title": "ITI 합의문 · 짧은 임플란트의 적응 조건과 비교",
      "href": "https://academy.iti.org/academy/consensus-database/consensus-statement/-/consensus/survival-rates-of-short-dental-implants-6-mm-compared-with-implants-longer-than-6-mm-in-posterior-jaw-areas/1806"
    },
    {
      "title": "Guy’s and St Thomas’ NHS · 임플란트 단계와 준비할 건강 정보",
      "href": "https://www.guysandstthomas.nhs.uk/health-information/dental-implants"
    }
  ],
  "updated": "2026-10-14",
  "publishedAt": "2026-10-14T09:00:00+09:00"
},
{
  "slug": "crown-lengthening-gum-surgery-before-crown",
  "title": "크라운을 씌우려면 잇몸부터 내려야 한대요. 치아가 길어져도 괜찮나요?",
  "region": "당진",
  "areaPath": "/area/dangjin",
  "topic": "잇몸치료",
  "concern": "치아를 살리려다 잇몸이 상할까 두려워요",
  "description": "당진에서 크라운 전 치관연장술을 권유받았을 때, 잇몸과 뼈를 조정하는 이유, 치아 보존 가능성과 시림·잇몸선 변화, 회복 및 보철 비용을 나누어 확인합니다.",
  "situation": "당진에서 충치가 깊은 치아를 크라운으로 씌우려는데, 잇몸을 내려 치아를 더 드러내는 수술부터 필요하다는 말을 들었습니다. 치아는 남기고 싶지만 잇몸과 뼈를 건드린 뒤 더 시리거나 웃을 때 길어 보일까 걱정됩니다.",
  "answer": "치관연장술은 잇몸 아래에 있는 치아를 드러내 수복할 여건을 마련하는 방법입니다. 잇몸과 필요한 경우 뼈의 위치를 조정하지만, 모든 크라운에 필요한 것은 아닙니다. 확보할 건강한 치아 구조와 남는 지지 조직, 예상되는 잇몸선 변화를 함께 평가해야 합니다.",
  "checks": [
    "충치나 파절이 잇몸 아래 어디까지 이어졌고, 크라운을 지탱할 건강한 치아가 얼마나 남는지 확인합니다.",
    "잇몸만 다루는지 뼈도 조정하는지, 옆 치아와 웃을 때 보이는 잇몸선에 어떤 영향을 예상하는지 묻습니다.",
    "수술 후 최종 크라운까지의 회복·임시보철·재평가 단계를 나누어 설명받습니다."
  ],
  "choices": [
    {
      "condition": "수복에 필요한 치아 구조를 확보하고 지지 상태도 유지할 수 있다면",
      "option": "치관연장술 뒤 회복을 확인하고 보철 치료를 이어가는 계획을 검토합니다.",
      "limit": "치아를 드러낼 수 있다는 것과 장기간 사용할 수 있다는 것은 같은 약속이 아닙니다."
    },
    {
      "condition": "잇몸선 변화나 지지 조직의 손실 부담이 크다면",
      "option": "치아를 남기는 다른 수복 접근이나 추가 전문 평가가 가능한지 비교합니다.",
      "limit": "모든 대안이 같은 치아에 가능하지 않으며, 추가 단계와 비용도 함께 확인해야 합니다."
    },
    {
      "condition": "남는 치아와 지지 상태로 유지가 어렵다고 판단되면",
      "option": "보존을 더 시도할 이점과 한계, 발치 후 회복을 포함한 선택을 설명받습니다.",
      "limit": "수술이 두렵다는 이유만으로 발치를 서두르거나, 반대로 무조건 보존을 보장할 수는 없습니다."
    }
  ],
  "unknown": "필요한 수술 범위, 신경치료 필요성, 최종 크라운을 만드는 시기, 예상 수명과 비용은 진찰 전 확정할 수 없습니다. 같은 치관연장술이라는 이름이라도 미용 목적과 깊은 충치의 수복 목적은 다를 수 있습니다.",
  "prepare": [
    "기존 영상·치료계획과 충치 또는 파절에 대해 들은 설명",
    "앞니 모양, 찬물 시림, 수술 통증 중 가장 걱정되는 부분",
    "복용약과 건강 상태, 휴가·이동·총비용에서 조정이 필요한 조건"
  ],
  "localHeading": "당진에서 크라운 전 잇몸치료를 상담받는다면",
  "localAdvice": "당진에서 천안으로 이동한다면 크라운 전 잇몸치료 상담이라는 점과 치관연장술 권유 내용을 알려주세요. 첫 검사, 수술, 회복 확인, 보철 제작을 한 번의 방문으로 가정하지 말고 단계별로 문의하세요. 서울비디치과의 실제 진료 장소는 천안 불당동이며, 수술 가능 여부와 일정은 개별 평가 후 안내합니다.",
  "related": [
    {
      "title": "잇몸수술의 장점과 한계",
      "href": "/guide/inside-out/gum-surgery"
    },
    {
      "title": "크라운을 결정하기 전에 확인할 것",
      "href": "/guide/regret/crown"
    },
    {
      "title": "잇몸치료 뒤 남는 관리 부담",
      "href": "/guide/regret/gum"
    }
  ],
  "sources": [
    {
      "title": "미국치주학회 AAP · 치관연장술의 목적과 잇몸·뼈 조정",
      "href": "https://www.perio.org/for-patients/periodontal-treatments-and-procedures/surgical-procedures/"
    },
    {
      "title": "Cambridge University Hospitals NHS · 치관연장술의 과정·위험·회복 (2025)",
      "href": "https://www.cuh.nhs.uk/patient-information/crown-lengthening-surgery/"
    },
    {
      "title": "미국근관치료학회 AAE · 치아 수복 가능성 평가",
      "href": "https://www.aae.org/specialty/fundamentals-of-restorability/"
    },
    {
      "title": "미국근관치료학회 AAE · 손상된 치아의 치료 선택 안내",
      "href": "https://www.aae.org/specialty/clinical-resources/treatment-planning/treatment-options-guide/"
    }
  ],
  "updated": "2026-10-14",
  "publishedAt": "2026-10-14T09:00:00+09:00"
},
{
  "slug": "red-tongue-patches-changing-location",
  "title": "혀의 붉은 반점이 옮겨 다녀요. 지도설이라는데 계속 지켜봐도 되나요?",
  "region": "서산",
  "areaPath": "/area/seosan",
  "topic": "구강점막",
  "concern": "괜찮다는데 모양이 자꾸 달라져 불안해요",
  "description": "서산에서 혀의 옮겨 다니는 붉은 반점과 지도설을 상담할 때, 진단을 확인하는 방법과 식사 불편, 가족에게 전염될 걱정, 다시 진찰받아야 할 변화를 나누어 정리합니다.",
  "situation": "서산에서 혀의 붉은 반점 때문에 진료를 받고 지도설이라는 설명을 들었습니다. 한쪽이 나아지면 다른 쪽이 붉어지고 음식을 먹을 때 따끔한 날도 있어, 계속 기다려도 되는지와 다른 병을 놓친 것은 아닌지 걱정됩니다.",
  "answer": "진찰로 확인된 지도설은 혀 표면의 붉고 매끈한 부위가 위치와 모양을 바꾸며 나타날 수 있는 양성 상태입니다. 전염성 질환이나 암으로 변하는 병으로 보지 않지만, 혀의 모든 붉은 반점이 지도설은 아닙니다. 처음 생긴 변화나 기존 양상과 다른 부위는 다시 평가받아야 합니다.",
  "checks": [
    "처음 생긴 시점과 반점의 위치·크기가 변하는지, 같은 자리에 고정된 부분이 있는지 구분해 전달합니다.",
    "따끔거림을 유발하는 음식이나 제품, 식사에 지장이 있는 정도, 함께 나타난 다른 증상을 설명합니다.",
    "이전 진단이 어떤 관찰에 근거했는지, 어느 변화가 생기면 재평가할지 확인합니다."
  ],
  "choices": [
    {
      "condition": "진찰에서 전형적인 지도설로 확인되고 불편이 적다면",
      "option": "질환의 특성과 관찰 방법을 설명받으며 경과를 확인할 수 있습니다.",
      "limit": "이번 진단이 이후에 생기는 모든 혀 변화를 설명하는 것은 아닙니다."
    },
    {
      "condition": "따끔거림이나 화끈거림 때문에 식사가 불편하다면",
      "option": "본인에게 자극이 되는 조건을 줄이고 필요한 증상 조절을 상담합니다.",
      "limit": "불편을 줄이는 치료와 반점이 다시 생기지 않게 하는 치료는 같은 목표가 아닙니다."
    },
    {
      "condition": "한 부위가 고정되거나 낫지 않는 상처·덩이가 새로 생긴다면",
      "option": "기존 지도설로 넘기지 말고 다른 원인 여부를 진찰받습니다.",
      "limit": "겉모습이나 사진만으로 감염·영양 문제·종양 등을 스스로 구분할 수 없습니다."
    }
  ],
  "unknown": "혀 사진만으로 지도설을 확진하거나, 반복되는 모든 반점을 스트레스·영양 부족 때문이라고 단정할 수 없습니다. 검사나 약물이 필요한지는 병력과 실제 진찰에 따라 달라집니다.",
  "prepare": [
    "날짜가 표시된 변화 사진이 있다면 몇 장과 처음 발견한 때의 기억",
    "특정 음식·치약·가글과 불편의 관계, 복용약·건강 상태",
    "이전 진단명과 처방, 같은 자리에 계속 남는 부위가 있는지에 대한 메모"
  ],
  "localHeading": "서산에서 혀와 구강점막 변화를 상담받는다면",
  "localAdvice": "서산에서 천안으로 이동하기 전 혀의 반점에 대해 지도설 설명을 들었는지, 고정된 상처나 식사 불편이 생겼는지 알려주세요. 구강점막 상담에서 첫날 확인할 범위와 필요 시 추가 평가·의뢰 경로를 문의할 수 있습니다. 서울비디치과의 실제 진료 장소는 천안 불당동이며, 사진 상담만으로 진단이나 모든 검사 가능 여부를 약속하지 않습니다.",
  "related": [
    {
      "title": "구강내과 진료에서 확인할 것",
      "href": "/guide/inside-out/oral-medicine"
    },
    {
      "title": "구강내과 진료 안내",
      "href": "/treatments/oral-medicine"
    },
    {
      "title": "가글과 칫솔질의 역할 비교",
      "href": "/guide/compare/mouthwash-vs-brushing"
    }
  ],
  "sources": [
    {
      "title": "미국구강내과학회 AAOM · 지도설의 특징과 비전염성",
      "href": "https://www.aaom.com/geographic-tongue"
    },
    {
      "title": "University Hospitals of Leicester NHS · 지도설의 평가와 불편 관리 (2025)",
      "href": "https://yourhealth.leicestershospitals.nhs.uk/library/musculoskeletal-specialist-surgery-mss/maxillofacial/2157-managing-geographic-tongue/file"
    },
    {
      "title": "NHS · 혀 통증·색 변화와 진찰 필요성",
      "href": "https://www.nhs.uk/symptoms/sore-or-white-tongue/"
    },
    {
      "title": "NHS · 지속되는 구강 변화의 진료 기준",
      "href": "https://www.nhs.uk/conditions/mouth-cancer/symptoms/"
    }
  ],
  "updated": "2026-10-14",
  "publishedAt": "2026-10-14T09:00:00+09:00"
},
{
  "slug": "orthodontic-premolar-extraction-facial-change",
  "title": "멀쩡한 작은어금니를 빼고 교정하래요. 얼굴이 꺼지면 어떡하죠?",
  "region": "천안",
  "areaPath": "/area/cheonan",
  "topic": "치아교정",
  "concern": "발치 결정이 두려워요",
  "description": "발치교정을 권유받았을 때 필요한 공간의 이유, 얼굴 변화에 대한 기대와 한계, 비발치 대안의 부담을 비교하고 결정 전에 확인할 질문을 정리합니다.",
  "situation": "천안에서 치아교정 상담을 받다가 충치도 없는 작은어금니를 빼자는 설명을 들었습니다. 배열은 좋아져도 입이 너무 들어가거나 얼굴이 꺼질까 불안합니다.",
  "answer": "발치 개수만으로 교정 후 얼굴을 예측하지 않습니다. 어떤 문제를 해결할 공간인지, 앞니와 입술의 현재 상태와 목표가 무엇인지, 비발치로 가능한 범위와 한계를 검사 자료로 비교해 설명받는 것이 먼저입니다.",
  "checks": [
    "발치로 얻는 공간을 어떤 문제 해결에 사용할 계획인지",
    "현재 입술과 앞니 위치에서 원하는 변화와 원하지 않는 변화",
    "비발치 대안이 가능한지와 그때 남는 배열·교합의 한계",
    "뺄 치아의 정확한 위치와 선택 이유, 발치 시점",
    "계획 변경이 필요할 때 다시 설명하고 결정하는 방식"
  ],
  "choices": [
    {
      "condition": "필요한 이동 공간을 다른 방법으로 충분히 확보하기 어렵다고 판단되는 경우",
      "option": "발치로 얻을 이익과 제거할 치아, 이후 이동 목표를 함께 검토합니다.",
      "limit": "발치 자체가 원하는 얼굴이나 안정적인 결과를 보장하지는 않습니다."
    },
    {
      "condition": "검사상 비발치 접근이 합리적인 대안이 되는 경우",
      "option": "치열 확장이나 치아 사이 공간 확보 등 가능한 방법을 비교합니다.",
      "limit": "만들 수 있는 공간과 치아 이동에는 한계가 있으며 모든 사람에게 적용할 수 없습니다."
    },
    {
      "condition": "발치 필요성이나 예상 변화에 대한 설명이 충분하지 않은 경우",
      "option": "자료와 서면 계획을 확인하고 추가 상담 또는 독립적인 의견을 구합니다.",
      "limit": "치료를 미루는 선택에도 현재 상태에 따른 고려점이 있으므로 확인 없이 방치하지 않습니다."
    }
  ],
  "unknown": "검사 전에는 발치 필요성, 적절한 치아 수, 실제 가능한 입술·교합 변화를 확정할 수 없습니다. 다른 사람의 전후 사진이나 화면 속 예측 이미지가 자신의 결과를 보장하지 않습니다.",
  "prepare": [
    "기존 상담의 영상·사진과 서면 치료계획",
    "발치를 권한 치아 위치와 설명받은 이유",
    "외형에서 바꾸고 싶은 점과 꼭 유지하고 싶은 점",
    "치료 기간·비용·방문 일정 중 가장 부담되는 항목"
  ],
  "localHeading": "천안에서 발치교정 설명을 다시 듣고 싶다면",
  "localAdvice": "천안에서 치아교정의 발치 여부를 고민한다면 이전 검사 자료와 질문을 정리해 상담을 준비해 보세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 직장·학교 일정에 맞춰 필요한 기록과 상담 시간을 미리 확인하고, 발치 결정을 위한 설명과 장기 방문 계획을 구분해 살펴보면 좋습니다.",
  "related": [
    {
      "title": "치아교정 방법과 선택 기준 살펴보기",
      "href": "/guide/orthodontics"
    },
    {
      "title": "발치교정과 비발치교정 비교",
      "href": "/guide/compare/extraction-vs-nonextraction"
    },
    {
      "title": "교정 결정 전에 후회를 줄이는 질문",
      "href": "/guide/regret/orthodontics"
    }
  ],
  "sources": [
    {
      "title": "영국교정학회 — 발치와 비발치에 관한 환자 질문",
      "href": "https://bos.org.uk/patients/treatments/faqs/"
    },
    {
      "title": "영국교정학회 — 교정치료에 대한 과장 주장과 개별 평가",
      "href": "https://bos.org.uk/news/claims-about-orthodontics/"
    },
    {
      "title": "영국교정학회 — 교정치료 동의와 대안 설명(2025)",
      "href": "https://bos.org.uk/wp-content/uploads/2025/05/CONSENT-IN-ORTHODONTICS-MAY-2025.pdf"
    },
    {
      "title": "영국교정학회 — 교정 목적 발치의 확인·의뢰 지침",
      "href": "https://bos.org.uk/wp-content/uploads/2024/12/ORTHODONTIC-EXTRACTIONS-RISK-MANAGEMENT-GUIDELINES-2024.pdf"
    }
  ],
  "updated": "2026-10-15",
  "publishedAt": "2026-10-15T09:00:00+09:00"
},
{
  "slug": "child-baby-molar-sinking-below-bite",
  "title": "아이 유치 어금니가 옆 치아보다 낮아졌어요. 잇몸 속으로 가라앉는 건가요?",
  "region": "아산",
  "areaPath": "/area/asan",
  "topic": "소아치과",
  "concern": "관찰해도 괜찮을까요",
  "description": "옆 치아보다 낮아 보이는 유치 어금니. 저위교합과 유착 가능성을 어떻게 평가하고, 영구치와 주변 치아 상태에 따라 관찰·발치 계획을 비교하는지 살펴봅니다.",
  "situation": "아산에서 아이 양치를 도와주다 한쪽 유치 어금니만 낮아진 모습을 보았습니다. 아프다는 말은 없지만 치아가 묻히는 것 같아 걱정됩니다.",
  "answer": "낮아 보이는 모습만으로 유착을 확정하거나 바로 발치하지 않습니다. 높이 변화와 주변 치아, 뒤따르는 영구치의 유무·위치를 확인하고, 지금 관찰할 수 있는 조건과 치료가 필요한 신호를 구분합니다.",
  "checks": [
    "어느 치아가 낮아졌고 이전 기록과 비교해 변화가 있는지",
    "주변 치아가 기울거나 영구치가 나올 길에 문제가 있는지",
    "해당 유치 뒤에 영구치가 있는지와 발육·위치",
    "씹기 불편, 음식 끼임, 통증 등 생활 변화",
    "관찰 중 확인할 항목과 다음 진료 시점"
  ],
  "choices": [
    {
      "condition": "검사상 관찰이 적절하다고 판단되는 경우",
      "option": "비교할 기록을 남기고 정해진 일정에 경과를 확인합니다.",
      "limit": "관찰은 치아가 저절로 정상 높이로 회복된다는 약속이 아닙니다."
    },
    {
      "condition": "영구치 맹출 방해나 주변 치아 이동 등의 문제가 확인되는 경우",
      "option": "원인과 발치 필요성을 평가하고 이후 공간 관리까지 논의합니다.",
      "limit": "발치만 하면 모든 문제가 해결된다고 보장하지 않으며 추가 진료가 필요할 수 있습니다."
    },
    {
      "condition": "뒤따르는 영구치가 없거나 장기 계획이 복잡한 경우",
      "option": "유치의 상태와 성장, 전체 치열 계획을 함께 검토합니다.",
      "limit": "무조건 오래 남기거나 바로 빼는 한 가지 원칙을 적용하기 어렵습니다."
    }
  ],
  "unknown": "겉모습만으로 유착 여부나 진행 속도, 발치 시점과 방법을 확정할 수 없습니다. 영구치가 있다는 사실만으로 정상 위치에 저절로 나온다고 약속할 수도 없습니다.",
  "prepare": [
    "처음 높이 차이를 알아차린 때와 이전 치과 기록",
    "아이의 씹는 습관 변화와 불편한 위치",
    "과거 외상·치료 이력과 현재 건강 정보",
    "관찰 방문과 치료 일정에서 가족이 어려운 점"
  ],
  "localHeading": "아산에서 아이의 낮아진 유치를 상담한다면",
  "localAdvice": "아산에서 소아치과 진료를 준비한다면 기존 검사 자료를 가져올 수 있는지 먼저 확인해 보세요. 서울비디치과의 실제 진료 장소는 천안 불당동입니다. 등하원과 보호자 근무 시간을 고려해 검사·상담의 목적, 다음 경과 확인 일정과 연락 방법을 정리하면 반복 이동을 계획하는 데 도움이 됩니다.",
  "related": [
    {
      "title": "부모 마음부터 살피는 소아치과 가이드",
      "href": "/guide/inside-out/pediatric"
    },
    {
      "title": "아이의 소아치과 진료 안내",
      "href": "/treatments/pediatric"
    }
  ],
  "sources": [
    {
      "title": "미국소아치과학회 — 성장기 치열·교합 관리와 유착(2024 개정)",
      "href": "https://www.aapd.org/media/Policies_Guidelines/BP_DevelopDentition.pdf"
    },
    {
      "title": "미국소아치과학회 — 어린이 치과 영상검사의 선택과 시기(2025)",
      "href": "https://www.aapd.org/globalassets/media/policies_guidelines/bp_radiographs25.pdf"
    },
    {
      "title": "미국소아치과학회 — 소아 구강외과 치료 고려사항(2025)",
      "href": "https://www.aapd.org/media/Policies_Guidelines/BP_OralSurgery.pdf"
    },
    {
      "title": "미국소아치과학회 — 어린이 진료 불안과 행동 안내(2024 개정)",
      "href": "https://www.aapd.org/globalassets/media/policies_guidelines/bp_behavguide25.pdf"
    }
  ],
  "updated": "2026-10-15",
  "publishedAt": "2026-10-15T09:00:00+09:00"
},
{
  "slug": "inhaler-white-mouth-patches-thrush",
  "title": "천식 흡입기를 쓴 뒤 입안에 하얀 막이 생겼어요. 약을 끊어야 하나요?",
  "region": "홍성",
  "areaPath": "/area/hongseong",
  "topic": "구강질환",
  "concern": "약을 계속 써도 될까요",
  "description": "흡입기 사용 중 입안이 하얗고 따가워졌다면 칸디다증인지 다른 점막 문제인지 확인해야 합니다. 약을 스스로 끊지 않으면서 사용법 점검과 구강 치료를 함께 계획하는 방법을 정리합니다.",
  "situation": "홍성에서 천식 치료를 받는 중 하얀 막과 따가움 같은 구강질환 증상이 생겨, 흡입기를 계속 쓰자니 입안이 걱정되고 끊자니 숨이 찰까 두려운 상황입니다.",
  "answer": "스테로이드 성분 흡입기는 구강 칸디다증과 관련될 수 있지만 하얀 부위가 모두 곰팡이 감염은 아닙니다. 흡입약을 자의로 중단하거나 줄이지 말고 입안 진찰과 처방 의료진의 사용법 점검을 함께 받으세요.",
  "checks": [
    "흡입기 이름·성분과 최근 용량 변경",
    "하얀 부위의 위치·지속 기간과 식사 불편",
    "최근 항생제·틀니 사용 및 다른 복용약"
  ],
  "choices": [
    {
      "condition": "진찰에서 칸디다증으로 판단될 때",
      "option": "적절한 항진균 치료와 흡입기 사용법 점검",
      "limit": "약 선택과 기간은 증상·병력에 따라 달라집니다."
    },
    {
      "condition": "하얀 부위가 계속 남거나 다른 점막 질환이 의심될 때",
      "option": "추가 평가와 필요한 진료 의뢰",
      "limit": "사진이나 닦이는 정도만으로 진단할 수 없습니다."
    },
    {
      "condition": "물이나 음식을 삼키기 어렵거나 통증이 심해질 때",
      "option": "예약을 미루지 말고 의료진에게 신속히 문의",
      "limit": "갑작스러운 호흡곤란·혀나 목의 부종은 응급 평가가 필요합니다."
    }
  ],
  "unknown": "흡입기 사용 이후 생겼다는 사실만으로 원인·진단·처방 변경 필요성을 확정할 수 없습니다.",
  "prepare": [
    "실제 흡입기와 설명서·처방 목록",
    "처음 생긴 날과 악화·호전 메모",
    "최근 찍은 입안 사진과 기존 치료 정보"
  ],
  "localHeading": "홍성에서 이동하기 전, 입안 증상과 천식 치료 정보를 함께 정리하세요",
  "localAdvice": "실제 진료 장소는 천안 불당동입니다. 홍성에서 구강질환 상담을 오기 전 흡입기 이름과 증상을 알려 필요한 자료를 확인하고, 천식 처방 의료진과 연락할 경로도 준비하세요.",
  "related": [
    {
      "title": "구강내과 진료에서 확인할 것",
      "href": "/guide/inside-out/oral-medicine"
    },
    {
      "title": "치과 상담에서 확인할 진료 선택 기준",
      "href": "/guide/cheonan-dentist-choice"
    }
  ],
  "sources": [
    {
      "title": "NHS · 구강 칸디다증의 증상과 치료",
      "href": "https://www.nhs.uk/conditions/oral-thrush-mouth-thrush/"
    },
    {
      "title": "NHS · 베클로메타손 흡입기의 구강 부작용",
      "href": "https://www.nhs.uk/medicines/beclometasone-inhalers/side-effects-of-beclometasone-inhalers/"
    },
    {
      "title": "NHS · 부데소니드 흡입기 사용법과 중단 주의",
      "href": "https://www.nhs.uk/medicines/budesonide-inhalers/how-and-when-to-use-budesonide-inhalers/"
    },
    {
      "title": "NHS · 아프거나 하얗게 변한 혀의 감별",
      "href": "https://www.nhs.uk/symptoms/sore-or-white-tongue/"
    }
  ],
  "updated": "2026-10-15",
  "publishedAt": "2026-10-15T09:00:00+09:00"
},
{
  "slug": "worn-short-teeth-full-mouth-crowns-worry",
  "title": "이가 짧아져 여러 치아를 씌우자는데, 남은 치아를 더 깎아도 괜찮을까요?",
  "region": "예산",
  "areaPath": "/area/yesan",
  "topic": "보철치료",
  "concern": "더 깎을까 봐 두려워요",
  "description": "치아가 짧아져 여러 개의 크라운을 권유받았다면 마모의 원인과 진행, 치아별 필요성을 먼저 확인하세요. 관찰·접착 수복·크라운의 장단점과 전악 보철치료를 결정할 질문을 정리합니다.",
  "situation": "예산에서 치아 마모로 보철치료 상담을 받은 뒤 여러 치아를 씌워야 한다는 말을 듣고, 이미 짧아진 치아를 더 깎으면 되돌릴 수 없을까 걱정되는 상황입니다.",
  "answer": "치아가 짧다는 이유만으로 모두 같은 크라운을 해야 하는 것은 아닙니다. 마모 원인과 진행 여부, 남은 치아 조직과 씹는 기능을 평가하고 관찰·접착 수복·크라운의 필요성과 범위를 비교해야 합니다.",
  "checks": [
    "예전 기록과 비교한 마모의 변화",
    "이갈이·이 악물기와 산성 음식·역류 병력",
    "치아마다 남은 조직·기존 수복물·통증과 씹는 불편"
  ],
  "choices": [
    {
      "condition": "마모가 경미하고 기능 문제가 크지 않을 때",
      "option": "원인 관리와 기록을 통한 경과 관찰",
      "limit": "변화를 정기적으로 확인해야 하며 이미 닳은 형태가 저절로 복구되지는 않습니다."
    },
    {
      "condition": "덧붙이는 방식으로 회복을 시도할 수 있을 때",
      "option": "접착 수복과 필요한 부분의 치료 비교",
      "limit": "깨짐·탈락·착색과 향후 수리 가능성을 고려합니다."
    },
    {
      "condition": "조직 손상이 크고 보호·회복이 필요한 치아가 있을 때",
      "option": "크라운 등 보철치료를 치아별로 평가",
      "limit": "추가 삭제와 치수 문제, 이후 교체·관리 부담을 설명받아야 합니다."
    }
  ],
  "unknown": "사진 한 장이나 짧아 보인다는 인상만으로 전악 수복 필요성, 삭제량, 치료 수명을 확정할 수 없습니다.",
  "prepare": [
    "이전 치아 사진·검사 자료와 치료계획서",
    "시린 곳·씹기 어려운 음식·깨짐 메모",
    "이갈이·역류와 식음료 습관, 사용 중인 장치 정보"
  ],
  "localHeading": "예산에서 여러 번 방문해야 한다면, 결정 단계와 치료 단계를 나누세요",
  "localAdvice": "실제 진료 장소는 천안 불당동입니다. 예산에서 보철치료를 상담할 때 검사·계획 설명·제작·조정·유지관리에 필요한 방문을 나누고, 원인 관리와 단계별 비용을 함께 확인하세요.",
  "related": [
    {
      "title": "크라운을 결정하기 전에 확인할 것",
      "href": "/guide/regret/crown"
    },
    {
      "title": "인레이와 크라운의 선택 기준 비교",
      "href": "/guide/compare/inlay-vs-crown"
    },
    {
      "title": "레진 치료의 기대와 관리 부담",
      "href": "/guide/regret/resin"
    }
  ],
  "sources": [
    {
      "title": "Leicester NHS · 치아 마모의 평가와 치료 선택",
      "href": "https://yourhealth.leicestershospitals.nhs.uk/library/musculoskeletal-specialist-surgery-mss/restorative-dentistry-orthodontics/348-335-022019-tooth-wear/file"
    },
    {
      "title": "ADA · 산에 의한 치아 침식의 원인과 관리",
      "href": "https://www.ada.org/resources/ada-library/oral-health-topics/dental-erosion"
    },
    {
      "title": "NIDCR · 이갈이와 이 악물기의 진단·관리",
      "href": "https://www.nidcr.nih.gov/health-info/bruxism"
    },
    {
      "title": "Leeds NHS · 크라운의 적용과 대안",
      "href": "https://www.leedsth.nhs.uk/patients/resources/crowns/"
    }
  ],
  "updated": "2026-10-15",
  "publishedAt": "2026-10-15T09:00:00+09:00"
}
]

export const noteRegions = ['천안', '아산', '홍성', '예산', '당진', '서산'] as const
export const noteTopics = [...new Set(patientNotes.map(n => n.topic))]

// Publication is evaluated on every request. Draft/future notes remain available only in previews.
export function visiblePatientNotes(preview = false, now = Date.now()): PatientNote[] {
  return preview ? patientNotes : patientNotes.filter(note => note.publishedAt && Date.parse(note.publishedAt) <= now)
}
