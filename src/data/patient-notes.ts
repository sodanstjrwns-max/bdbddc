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
}
]

export const noteRegions = ['천안', '아산', '홍성', '예산', '당진', '서산'] as const
export const noteTopics = [...new Set(patientNotes.map(n => n.topic))]

// Publication is evaluated on every request. Draft/future notes remain available only in previews.
export function visiblePatientNotes(preview = false, now = Date.now()): PatientNote[] {
  return preview ? patientNotes : patientNotes.filter(note => note.publishedAt && Date.parse(note.publishedAt) <= now)
}
