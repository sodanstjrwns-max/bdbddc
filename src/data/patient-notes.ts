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
  }
]

export const noteRegions = ['천안', '아산', '홍성', '예산', '당진', '서산'] as const
export const noteTopics = [...new Set(patientNotes.map(n => n.topic))]

// Publication is evaluated on every request. Draft/future notes remain available only in previews.
export function visiblePatientNotes(preview = false, now = Date.now()): PatientNote[] {
  return preview ? patientNotes : patientNotes.filter(note => note.publishedAt && Date.parse(note.publishedAt) <= now)
}
