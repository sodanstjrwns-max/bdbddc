/**
 * 28개 지역별 "오시는 길" 페이지 일괄 생성 스크립트
 * - 기존 16개 업그레이드 + 신규 12개 생성
 * - Schema.org: BreadcrumbList + FAQPage + Dentist + SpeakableSpecification + MedicalBusiness
 * - SEO: title, description, keywords, OG, Twitter, ai-summary
 * - 5개 FAQ per region
 * - 모바일 최적화, 네이비 디자인 통일
 */

const fs = require('fs');
const path = require('path');

// ═══════ 28개 지역 데이터 ═══════
const regions = [
  // ── 충청남도 ──
  { slug:'cheonan', name:'천안', fullName:'천안시', province:'충청남도', provCode:'KR-44',
    distKm:5, carMin:10, transitDesc:'시내버스 11, 12, 21, 22번 불당동 정류장 하차 도보 3분',
    ktxStation:'천안아산역(KTX)', ktxTaxi:10, ktxBus:20,
    carRoute:'천안IC → 불당대로 → 불당34길 (약 15분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'불당 CGV, 갤러리아 백화점',
    whyText:'천안 불당동에 위치한 서울비디치과는 천안 최대 규모 치과로, 굳이 멀리 가지 않아도 서울대병원급 진료를 받으실 수 있습니다.',
    reviewerName:'김', reviewText:'천안에서 왔는데 임플란트 수술이 정말 편안했어요. 4층 전체가 수술센터라 전문적이고, 수술 후 죽까지 주시는 세심한 배려에 감동!', reviewTag:'임플란트' },
  { slug:'buldang', name:'불당동', fullName:'불당동', province:'충청남도', provCode:'KR-44',
    distKm:1, carMin:3, transitDesc:'도보 5~10분 거리, 불당동 CGV 옆',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'불당동 내 도보 이동 가능',
    navQuery:'서울비디치과',
    landmark:'불당 CGV, 스타벅스 불당점',
    whyText:'불당동 주민분들은 도보로 5~10분이면 서울비디치과에 오실 수 있습니다. 동네 치과의 편리함에 서울대병원급 의료 시스템을 경험하세요.',
    reviewerName:'박', reviewText:'불당동에 이렇게 큰 치과가 있다는 게 감사해요. 걸어서 다니니까 교정 치료도 부담 없이 다닐 수 있어요!', reviewTag:'인비절라인' },
  { slug:'asan', name:'아산', fullName:'아산시', province:'충청남도', provCode:'KR-44',
    distKm:15, carMin:20, transitDesc:'천안아산역(KTX) 하차 → 택시 10분 / 버스 20분',
    ktxStation:'천안아산역(KTX)', ktxTaxi:10, ktxBus:20,
    carRoute:'아산IC → 1번국도 → 불당대로 (약 20분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'아산 신정호, 온양온천역',
    whyText:'아산에서 20분이면 도착하는 서울대급 의료 시스템을 경험할 수 있습니다. 15인 원장 협진, 6개 수술실, 네비게이션 임플란트 등 동네 치과와 차원이 다른 진료 환경입니다.',
    reviewerName:'이', reviewText:'아산에서 오는데 20분밖에 안 걸려서 좋아요. 임플란트 상담부터 수술까지 한 곳에서 다 되니 편합니다.', reviewTag:'임플란트' },
  { slug:'dangjin', name:'당진', fullName:'당진시', province:'충청남도', provCode:'KR-44',
    distKm:55, carMin:50, transitDesc:'당진종합버스터미널 → 천안행 시외버스 (약 1시간) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'당진IC → 서해안고속도로 → 천안JC → 불당대로 (약 50분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'당진 삽교호, 합덕수리민속박물관',
    whyText:'당진에서 50분 거리지만, 서울대 출신 15인 원장이 협진하는 충남 최대 규모 치과에서 임플란트·교정·라미네이트 전문 진료를 받으실 수 있습니다.',
    reviewerName:'최', reviewText:'당진에서 왔는데 수면 임플란트로 편하게 받았어요. 먼 거리를 온 보람이 있습니다!', reviewTag:'수면임플란트' },
  { slug:'seosan', name:'서산', fullName:'서산시', province:'충청남도', provCode:'KR-44',
    distKm:70, carMin:60, transitDesc:'서산종합버스터미널 → 천안행 시외버스 (약 1시간 20분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'서산IC → 서해안고속도로 → 천안JC → 불당대로 (약 60분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'서산 해미읍성, 삼성전자 서산',
    whyText:'서산에서 1시간 거리지만, 네비게이션 임플란트·인비절라인 등 고난도 진료를 위해 서산 환자분들이 많이 찾아오십니다.',
    reviewerName:'강', reviewText:'서산에서 임플란트 하러 왔는데, 네비게이션 수술로 정확하게 해주셔서 회복도 빨랐어요.', reviewTag:'네비게이션 임플란트' },
  { slug:'hongseong', name:'홍성', fullName:'홍성군', province:'충청남도', provCode:'KR-44',
    distKm:55, carMin:50, transitDesc:'홍성종합버스터미널 → 천안행 시외버스 (약 1시간) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'홍성IC → 서해안고속도로 → 천안JC → 불당대로 (약 50분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'홍성 홍주읍성, 내포신도시',
    whyText:'홍성에서 50분이면 충남 최대 규모 치과를 만나실 수 있습니다. 내원 횟수를 최소화하는 집중 진료로 홍성 환자분들의 편의를 고려합니다.',
    reviewerName:'윤', reviewText:'홍성에서 왔는데 한 번에 집중적으로 치료해줘서 내원 횟수가 적어 좋았어요.', reviewTag:'집중진료' },
  { slug:'yesan', name:'예산', fullName:'예산군', province:'충청남도', provCode:'KR-44',
    distKm:45, carMin:40, transitDesc:'예산역(장항선) → 천안행 무궁화호 (약 30분) → 택시 10분',
    ktxStation:'예산역(장항선)', ktxTaxi:null, ktxBus:null,
    carRoute:'예산 → 21번국도 → 천안 (약 40분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'예산 수덕사, 예산시장',
    whyText:'예산에서 40분이면 서울대 출신 전문의 15인이 협진하는 대규모 치과에서 진료받으실 수 있습니다.',
    reviewerName:'장', reviewText:'예산에서 교정하러 다니는데, 인비절라인 전문이라 믿음이 가요. 40분 거리도 괜찮아요!', reviewTag:'인비절라인' },
  { slug:'gongju', name:'공주', fullName:'공주시', province:'충청남도', provCode:'KR-44',
    distKm:40, carMin:40, transitDesc:'공주종합버스터미널 → 천안행 시외버스 (약 50분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'공주IC → 천안논산고속도로 → 천안JC → 불당대로 (약 40분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'공주 공산성, 백제역사유적지구',
    whyText:'공주에서 40분이면 6개 수술실을 갖춘 임플란트 전문센터에서 진료받으실 수 있습니다.',
    reviewerName:'한', reviewText:'공주에서 임플란트하러 왔는데, 6개 수술실이 있는 큰 치과라서 안심이 됐어요.', reviewTag:'임플란트' },
  { slug:'nonsan', name:'논산', fullName:'논산시', province:'충청남도', provCode:'KR-44',
    distKm:50, carMin:45, transitDesc:'논산역(호남선) → 천안행 무궁화호 (약 40분) → 택시 10분',
    ktxStation:'논산역(호남선)', ktxTaxi:null, ktxBus:null,
    carRoute:'논산IC → 천안논산고속도로 → 천안JC → 불당대로 (약 45분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'논산 관촉사, 육군훈련소',
    whyText:'논산에서 45분이면 서울대병원급 진료 시스템을 경험하실 수 있습니다. 고난도 임플란트부터 인비절라인 교정까지 한 곳에서.',
    reviewerName:'임', reviewText:'논산에서 아이 소아치과 치료하러 왔는데, 전문의 3분이 계셔서 안심했어요.', reviewTag:'소아치과' },
  { slug:'cheongyang', name:'청양', fullName:'청양군', province:'충청남도', provCode:'KR-44',
    distKm:50, carMin:50, transitDesc:'청양종합버스터미널 → 천안행 시외버스 (약 1시간 10분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'청양 → 39번국도 → 공주 → 천안논산고속도로 (약 50분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'청양 칠갑산, 장곡사',
    whyText:'청양에서 50분 거리이지만, 서울대 출신 전문의 협진과 최첨단 장비를 갖춘 치과에서 임플란트 전문 진료를 받으실 수 있습니다.',
    reviewerName:'신', reviewText:'청양에서 오는 길이 좀 되지만, 이 정도 규모의 치과는 없어서 꼭 옵니다.', reviewTag:'전문진료' },
  { slug:'buyeo', name:'부여', fullName:'부여군', province:'충청남도', provCode:'KR-44',
    distKm:60, carMin:55, transitDesc:'부여종합버스터미널 → 천안행 시외버스 (약 1시간 20분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'부여 → 40번국도 → 공주 → 천안논산고속도로 (약 55분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'부여 부소산성, 백마강',
    whyText:'부여에서 약 55분 거리입니다. 내원 횟수를 최소화하는 집중 진료 시스템으로 부여 환자분들의 이동 부담을 줄여드립니다.',
    reviewerName:'오', reviewText:'부여에서 멀리 왔지만 한 번 올 때 집중적으로 치료해줘서 내원 횟수가 적어 좋았어요.', reviewTag:'집중진료' },
  { slug:'seocheon', name:'서천', fullName:'서천군', province:'충청남도', provCode:'KR-44',
    distKm:70, carMin:60, transitDesc:'서천종합버스터미널 → 천안행 시외버스 (약 1시간 30분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'서천IC → 서해안고속도로 → 천안JC → 불당대로 (약 60분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'서천 국립생태원, 한산모시축제',
    whyText:'서천에서 약 1시간 거리입니다. 멀리서 오시는 분들을 위해 내원 횟수를 최소화하고, 당일 집중 진료를 제공합니다.',
    reviewerName:'조', reviewText:'서천에서 임플란트 수술받았는데, 수면임플란트로 편하게 했어요. 먼 거리 올 가치 있습니다!', reviewTag:'수면임플란트' },
  { slug:'boryeong', name:'보령', fullName:'보령시', province:'충청남도', provCode:'KR-44',
    distKm:70, carMin:60, transitDesc:'보령종합버스터미널 → 천안행 시외버스 (약 1시간 20분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'보령IC → 서해안고속도로 → 천안JC → 불당대로 (약 60분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'보령 대천해수욕장, 머드축제장',
    whyText:'보령에서 약 1시간 거리입니다. 6개 수술실과 네비게이션 임플란트 시스템을 갖춘 충남 최대 규모 치과에서 진료받으실 수 있습니다.',
    reviewerName:'배', reviewText:'보령에서 왔는데 6개 수술실이 있는 규모에 놀랐어요. 임플란트 전문이라 안심됩니다.', reviewTag:'임플란트' },
  { slug:'taean', name:'태안', fullName:'태안군', province:'충청남도', provCode:'KR-44',
    distKm:85, carMin:70, transitDesc:'태안종합버스터미널 → 천안행 시외버스 (약 1시간 40분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'태안 → 서해안고속도로 → 천안JC → 불당대로 (약 70분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'태안 안면도, 만리포해수욕장',
    whyText:'태안에서 약 70분 거리입니다. 멀리서 오시는 분들을 위해 원데이 임플란트, 집중 진료 시스템을 운영하고 있습니다.',
    reviewerName:'성', reviewText:'태안에서 멀리 왔지만 원데이 임플란트로 한 번에 해결했어요. 다음에도 여기로 올게요!', reviewTag:'원데이 임플란트' },
  { slug:'geumsan', name:'금산', fullName:'금산군', province:'충청남도', provCode:'KR-44',
    distKm:55, carMin:50, transitDesc:'금산종합버스터미널 → 대전 경유 → 천안행 (약 1시간 20분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'금산 → 대전통영고속도로 → 호남고속도로 → 천안 (약 50분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'금산 인삼시장, 금산인삼축제',
    whyText:'금산에서 약 50분 거리입니다. 서울대 출신 15인 원장 협진으로 고난도 임플란트부터 인비절라인까지 전문 진료를 받으실 수 있습니다.',
    reviewerName:'류', reviewText:'금산에서 왔는데 15인 원장이 협진하는 시스템이 인상적이었어요. 믿음이 갑니다.', reviewTag:'협진시스템' },
  { slug:'gyeryong', name:'계룡', fullName:'계룡시', province:'충청남도', provCode:'KR-44',
    distKm:35, carMin:35, transitDesc:'계룡시 → 천안행 시외버스 (약 50분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'계룡 → 천안논산고속도로 → 천안JC → 불당대로 (약 35분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'계룡대, 계룡산 국립공원',
    whyText:'계룡에서 35분이면 서울대병원급 치과 진료를 받으실 수 있습니다. 군인 가족분들도 많이 찾아오십니다.',
    reviewerName:'권', reviewText:'계룡대에서 가깝고 365일 진료라 군인 가족도 편하게 다닐 수 있어요!', reviewTag:'365일 진료' },
  // ── 세종·대전 ──
  { slug:'sejong', name:'세종', fullName:'세종시', province:'세종특별자치시', provCode:'KR-50',
    distKm:30, carMin:35, transitDesc:'세종시 → 천안행 시외버스 (약 40분) → 택시 10분',
    ktxStation:'오송역(KTX)', ktxTaxi:25, ktxBus:40,
    carRoute:'세종 → 세종천안고속도로 → 천안JC → 불당대로 (약 35분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'세종 정부청사, 세종호수공원',
    whyText:'세종에서 35분이면 충남 최대 규모 치과에서 진료받으실 수 있습니다. 세종시 공무원분들도 많이 찾아오십니다.',
    reviewerName:'정', reviewText:'세종에서 35분이면 오니까 퇴근 후 야간진료 받기 좋아요. 과잉진료 없이 솔직해서 좋습니다.', reviewTag:'야간진료' },
  { slug:'yeongi', name:'연기', fullName:'연기(세종)', province:'세종특별자치시', provCode:'KR-50',
    distKm:25, carMin:30, transitDesc:'연기면 → 천안행 시외버스 (약 35분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'연기 → 1번국도 → 천안 (약 30분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'연기 밀마루전망대, 세종시청',
    whyText:'연기(세종)에서 30분이면 서울대 출신 전문의 15인이 협진하는 치과에서 진료받으실 수 있습니다.',
    reviewerName:'김', reviewText:'연기에서 30분이면 도착! 인비절라인 교정 중인데 전문의가 직접 봐주셔서 안심이에요.', reviewTag:'인비절라인' },
  { slug:'daejeon', name:'대전', fullName:'대전광역시', province:'대전광역시', provCode:'KR-30',
    distKm:45, carMin:40, transitDesc:'대전역(KTX) → 천안아산역 KTX (약 15분) → 택시 10분',
    ktxStation:'대전역(KTX)', ktxTaxi:null, ktxBus:null,
    carRoute:'대전IC → 경부고속도로 → 천안IC → 불당대로 (약 40분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'대전 엑스포 과학공원, 유성온천',
    whyText:'대전에서 KTX로 15분, 자가용 40분이면 서울대급 진료를 받으실 수 있습니다. 대전 환자분들도 많이 찾아오십니다.',
    reviewerName:'송', reviewText:'대전에서 KTX 타면 15분! 글로우네이트 라미네이트 상담받았는데 DSD로 미리 결과를 볼 수 있어서 좋았어요.', reviewTag:'글로우네이트' },
  // ── 충청북도 ──
  { slug:'cheongju', name:'청주', fullName:'청주시', province:'충청북도', provCode:'KR-43',
    distKm:55, carMin:50, transitDesc:'청주시외버스터미널 → 천안행 시외버스 (약 1시간) → 택시 10분',
    ktxStation:'오송역(KTX)', ktxTaxi:20, ktxBus:35,
    carRoute:'청주IC → 중부고속도로 → 천안JC → 불당대로 (약 50분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'청주 수암골벽화마을, 국립청주박물관',
    whyText:'청주에서 50분이면 서울대 출신 15인 원장이 협진하는 충남 최대 규모 치과에서 진료받으실 수 있습니다.',
    reviewerName:'노', reviewText:'청주에서 왔는데 규모가 정말 크고 전문적이에요. 임플란트 6개 수술실이 따로 있어서 안심됩니다.', reviewTag:'임플란트' },
  { slug:'jincheon', name:'진천', fullName:'진천군', province:'충청북도', provCode:'KR-43',
    distKm:35, carMin:40, transitDesc:'진천종합버스터미널 → 천안행 시외버스 (약 45분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'진천IC → 중부고속도로 → 천안JC → 불당대로 (약 40분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'진천 종박물관, 진천농다리',
    whyText:'진천에서 40분이면 6개 수술실을 갖춘 임플란트 전문센터에서 진료받으실 수 있습니다.',
    reviewerName:'문', reviewText:'진천에서 40분이면 오니까 괜찮아요. 소아치과 전문의가 3분이나 계셔서 아이 치료도 안심!', reviewTag:'소아치과' },
  { slug:'chungju', name:'충주', fullName:'충주시', province:'충청북도', provCode:'KR-43',
    distKm:70, carMin:60, transitDesc:'충주시외버스터미널 → 천안행 시외버스 (약 1시간 30분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'충주IC → 중부고속도로 → 천안JC → 불당대로 (약 60분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'충주 탄금대, 충주호',
    whyText:'충주에서 약 1시간 거리입니다. 내원 횟수를 최소화하는 집중 진료로 충주 환자분들의 이동 부담을 줄여드립니다.',
    reviewerName:'서', reviewText:'충주에서 1시간 걸리지만 이 정도 규모의 치과는 충주에 없어요. 올 가치가 있습니다!', reviewTag:'전문진료' },
  { slug:'eumseong', name:'음성', fullName:'음성군', province:'충청북도', provCode:'KR-43',
    distKm:50, carMin:50, transitDesc:'음성종합버스터미널 → 천안행 시외버스 (약 1시간) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'음성IC → 중부고속도로 → 천안JC → 불당대로 (약 50분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'음성 꽃동네, 음성 미래산업단지',
    whyText:'음성에서 50분이면 서울대 출신 전문의 15인이 협진하는 대규모 치과에서 진료받으실 수 있습니다.',
    reviewerName:'안', reviewText:'음성에서 왔는데 과잉진료 없이 솔직하게 설명해주셔서 신뢰가 갑니다.', reviewTag:'NO 과잉진료' },
  { slug:'okcheon', name:'옥천', fullName:'옥천군', province:'충청북도', provCode:'KR-43',
    distKm:65, carMin:55, transitDesc:'옥천역(경부선) → 천안역 무궁화호 (약 40분) → 택시 10분',
    ktxStation:'옥천역(경부선)', ktxTaxi:null, ktxBus:null,
    carRoute:'옥천IC → 경부고속도로 → 천안IC → 불당대로 (약 55분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'옥천 정지용 생가, 금강유원지',
    whyText:'옥천에서 약 55분 거리입니다. 서울대 출신 전문의 팀이 고난도 임플란트와 교정 치료를 전문적으로 진행합니다.',
    reviewerName:'유', reviewText:'옥천에서 왔는데 15인 원장 협진이라 복잡한 케이스도 안심이에요.', reviewTag:'협진시스템' },
  { slug:'yeongdong', name:'영동', fullName:'영동군', province:'충청북도', provCode:'KR-43',
    distKm:80, carMin:60, transitDesc:'영동역(경부선) → 천안역 무궁화호 (약 50분) → 택시 10분',
    ktxStation:'영동역(경부선)', ktxTaxi:null, ktxBus:null,
    carRoute:'영동IC → 경부고속도로 → 천안IC → 불당대로 (약 60분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'영동 난계국악박물관, 포도밭',
    whyText:'영동에서 약 1시간 거리입니다. 집중 진료 시스템으로 내원 횟수를 최소화하여 영동 환자분들의 편의를 고려합니다.',
    reviewerName:'홍', reviewText:'영동에서 멀리 왔지만 한 번에 상담부터 치료까지 집중적으로 해주셔서 만족합니다.', reviewTag:'집중진료' },
  // ── 경기도 ──
  { slug:'pyeongtaek', name:'평택', fullName:'평택시', province:'경기도', provCode:'KR-41',
    distKm:40, carMin:45, transitDesc:'평택역(1호선) → 천안역 (약 30분) → 택시 10분',
    ktxStation:'평택역(1호선/SRT)', ktxTaxi:null, ktxBus:null,
    carRoute:'평택IC → 경부고속도로 → 천안IC → 불당대로 (약 45분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'평택 국제중앙시장, 평택호',
    whyText:'평택에서 45분이면 서울대 출신 15인 원장이 협진하는 충남 최대 규모 치과에서 진료받으실 수 있습니다.',
    reviewerName:'남', reviewText:'평택에서 45분이면 오니까 서울 가는 것보다 가깝고, 서울대급 진료를 받을 수 있어 좋아요!', reviewTag:'서울대급' },
  { slug:'anseong', name:'안성', fullName:'안성시', province:'경기도', provCode:'KR-41',
    distKm:35, carMin:40, transitDesc:'안성종합버스터미널 → 천안행 시외버스 (약 40분) → 택시 10분',
    ktxStation:null, ktxTaxi:null, ktxBus:null,
    carRoute:'안성IC → 경부고속도로 → 천안IC → 불당대로 (약 40분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'안성맞춤랜드, 안성 남사당놀이',
    whyText:'안성에서 40분이면 서울대병원급 진료를 받으실 수 있습니다. 서울보다 가까운 대규모 전문 치과입니다.',
    reviewerName:'황', reviewText:'안성에서 서울 가려면 1시간 넘는데, 천안 서울비디치과는 40분! 시설도 서울 못지않아요.', reviewTag:'대규모 시설' },
  { slug:'osan', name:'오산', fullName:'오산시', province:'경기도', provCode:'KR-41',
    distKm:60, carMin:60, transitDesc:'오산역(1호선) → 천안역 (약 50분) → 택시 10분',
    ktxStation:'오산역(1호선)', ktxTaxi:null, ktxBus:null,
    carRoute:'오산IC → 경부고속도로 → 천안IC → 불당대로 (약 60분)',
    navQuery:'천안스퀘어 또는 서울비디치과',
    landmark:'오산 독산성, 오산세교지구',
    whyText:'오산에서 약 1시간 거리입니다. 서울 가는 것보다 가깝고, 서울대 출신 15인 원장의 전문 진료를 받으실 수 있습니다.',
    reviewerName:'전', reviewText:'오산에서 1시간이지만 서울대급 치과라 만족합니다. 인비절라인 교정 중인데 결과가 좋아요!', reviewTag:'인비절라인' },
];

// ═══════ HTML 템플릿 생성 함수 ═══════
function generatePage(r) {
  const distText = r.distKm < 3 ? `도보 ${r.carMin}분` : `차로 ${r.carMin}분 (약 ${r.distKm}km)`;
  const distShort = r.distKm < 3 ? `도보 ${r.carMin}분` : `차로 ${r.carMin}분`;

  // FAQ 데이터
  const faqs = [
    { q: `${r.name}에서 서울비디치과까지 얼마나 걸리나요?`,
      a: `${r.fullName}에서 서울비디치과(천안시 서북구 불당동)까지 ${r.distKm < 3 ? '도보 약 '+r.carMin+'분' : '약 '+r.distKm+'km이며, 차량 약 '+r.carMin+'분'}으로 오실 수 있습니다.${r.ktxStation ? ' '+r.ktxStation+' 하차 → 택시 '+r.ktxTaxi+'분 / 버스 '+r.ktxBus+'분' : ''} 네비게이션에 "${r.navQuery}"을 검색하세요.` },
    { q: `${r.name}에서 갈 만한 임플란트 잘하는 치과 추천해주세요`,
      a: `서울비디치과는 ${r.name} 인근 최대 규모 치과로, 서울대 출신 15인 원장이 협진합니다. 4층 전체가 임플란트센터이며, 6개 독립 수술실과 네비게이션 가이드 시스템을 갖추고 있습니다. 뼈이식, 상악동거상술 등 고난도 수술도 전문적으로 진행합니다.` },
    { q: `${r.name}에서 출발하면 주차가 가능한가요?`,
      a: `네, 서울비디치과는 건물 내 무료 주차장을 운영하고 있습니다(약 30대). ${r.name}에서 자가용으로 오시는 분들도 편하게 주차하실 수 있습니다. 네비게이션에 "${r.navQuery}"을 검색하세요.` },
    { q: `${r.name}에서 야간이나 주말에도 진료 가능한가요?`,
      a: `서울비디치과는 365일 진료합니다. 평일 09:00~20:00(야간진료), 토·일요일 09:00~17:00, 공휴일 09:00~13:00 운영하여 ${r.name}에서 주말이나 야간에도 편하게 방문하실 수 있습니다.` },
    { q: `${r.name}에서 왜 서울비디치과까지 가야 하나요?`,
      a: r.whyText }
  ];

  const faqSchemaItems = faqs.map(f => `    {
      "@type": "Question",
      "name": "${f.q}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${f.a.replace(/"/g, '\\"')}"
      }
    }`).join(',\n');

  // transit info for card
  const transitCard = r.ktxStation
    ? `<p>${r.transitDesc}</p>\n              <div class="why-card-stat"><span class="num"><i class="fas fa-train"></i></span><span class="unit">KTX/버스 이용 가능</span></div>`
    : `<p>${r.transitDesc}</p>\n              <div class="why-card-stat"><span class="num"><i class="fas fa-bus"></i></span><span class="unit">시외버스 이용 가능</span></div>`;

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

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${r.name} 임플란트 | ${r.name}에서 천안 서울비디치과 오시는 길</title>
  <meta name="description" content="${r.fullName}에서 ${distShort}, 서울비디치과 임플란트·인비절라인·라미네이트. 365일 진료, 서울대 15인 원장 협진. ${r.name} 환자분들 오시는 길 안내. ☎041-415-2892">
  <meta name="keywords" content="${r.name} 임플란트, ${r.name} 치과, ${r.name} 인비절라인, ${r.name} 라미네이트, ${r.name}에서 천안 치과, ${r.name} 치과 추천, 서울비디치과">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/area/${r.slug}.html">
  <meta name="geo.region" content="${r.provCode}">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${r.name} 임플란트 | ${r.name}에서 천안 서울비디치과 오시는 길">
  <meta property="og:description" content="${r.fullName}에서 ${distShort}! 서울대 15인 원장 365일 진료. ${r.name} 임플란트·인비절라인·라미네이트 추천.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/area/${r.slug}.html">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${r.name} 임플란트 | ${r.name}에서 천안 서울비디치과 오시는 길">
  <meta name="twitter:description" content="${r.fullName}에서 ${distShort}! 서울대 15인 원장 365일 진료. ${r.name} 임플란트·인비절라인·라미네이트.">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-image.jpg">
  <link rel="icon" type="image/svg+xml" href="../images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="../manifest.json">
  <meta name="theme-color" content="#6B4226">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="../css/site-v5.css?v=4a7fbcd0">
  <link rel="prefetch" href="../reservation.html" as="document">

  <!-- Schema: BreadcrumbList -->
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"오시는 길","item":"https://bdbddc.com/directions.html"},{"@type":"ListItem","position":3,"name":"${r.name}에서 오시는 길","item":"https://bdbddc.com/area/${r.slug}.html"}]}</script>

  <!-- Schema: FAQPage -->
  <script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${faqSchemaItems}
  ],
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".treatment-intro", ".faq-answer", "meta[name='description']"]
  }
}</script>

  <!-- Schema: Dentist + LocalBusiness -->
  <script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": ["Dentist", "MedicalBusiness"],
  "@id": "https://bdbddc.com/#dentist",
  "name": "서울비디치과",
  "description": "${r.name} 인근 서울대 출신 15인 원장 협진 치과. 365일 진료, 임플란트 6개 수술방, 인비절라인 교정센터, 글로우네이트(라미네이트), 소아치과 전문의 3인.",
  "url": "https://bdbddc.com",
  "telephone": "+82-41-415-2892",
  "email": "info@bdbddc.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "불당34길 14, 1~5층",
    "addressLocality": "천안시 서북구 불당동",
    "addressRegion": "충청남도",
    "postalCode": "31156",
    "addressCountry": "KR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.8151,
    "longitude": 127.1139
  },
  "areaServed": {
    "@type": "City",
    "name": "${r.fullName}"
  },
  "openingHoursSpecification": [
    {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"20:00"},
    {"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"09:00","closes":"17:00"},
    {"@type":"OpeningHoursSpecification","dayOfWeek":["PublicHolidays"],"opens":"09:00","closes":"13:00"}
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "2847",
    "bestRating": "5"
  },
  "priceRange": "₩₩",
  "medicalSpecialty": ["Implantology","Orthodontics","PediatricDentistry","CosmeticDentistry"],
  "availableService": [
    {"@type":"MedicalProcedure","name":"임플란트","description":"네비게이션 가이드 임플란트, 6개 수술실"},
    {"@type":"MedicalProcedure","name":"인비절라인","description":"다이아몬드 프로바이더, 서울대 교정 전문의"},
    {"@type":"MedicalProcedure","name":"글로우네이트(라미네이트)","description":"최소삭제 포세린 라미네이트"}
  ],
  "isAcceptingNewPatients": true,
  "currenciesAccepted": "KRW",
  "paymentAccepted": "Cash, Credit Card, Insurance"
}</script>

  <!-- Schema: WebPage + SpeakableSpecification -->
  <script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${r.name}에서 천안 서울비디치과 오시는 길",
  "description": "${r.fullName}에서 ${distShort}, 서울비디치과 임플란트·인비절라인·라미네이트. 365일 진료.",
  "url": "https://bdbddc.com/area/${r.slug}.html",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".section-subtitle", ".faq-answer"]
  }
}</script>

  <meta name="ai-summary" content="${r.fullName}에서 서울비디치과까지 ${distText}. 서울대 출신 15인 원장 협진, 365일 진료, 임플란트·인비절라인·라미네이트 전문.">
  <meta name="abstract" content="${r.fullName}에서 서울비디치과까지 ${distText}. 서울대 출신 15인 원장 협진, 365일 진료, 임플란트·인비절라인·라미네이트 전문.">
  <script src="/js/analytics.js" defer></script>
  <!-- Weglot Multilingual -->
  <script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
  <script>Weglot.initialize({ api_key: 'wg_cd7087d43782c81ecb41e27570c3bfcd2' });</script>
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
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
            <a href="../treatments/index.html">진료 안내</a>
            <div class="mega-dropdown"><div class="mega-dropdown-grid">
              <div class="mega-dropdown-section"><strong class="section-heading">전문센터</strong><ul><li><a href="../treatments/glownate.html">✨ 글로우네이트 <span class="badge badge-hot">HOT</span></a></li><li><a href="../treatments/implant.html">임플란트 <span class="badge">6개 수술실</span></a></li><li><a href="../treatments/invisalign.html">치아교정 <span class="badge">대규모</span></a></li><li><a href="../treatments/pediatric.html">소아치과 <span class="badge">전문의 3인</span></a></li><li><a href="../treatments/aesthetic.html">심미치료</a></li></ul></div>
              <div class="mega-dropdown-section"><strong class="section-heading">일반/보존 진료</strong><ul><li><a href="../treatments/cavity.html">충치치료</a></li><li><a href="../treatments/resin.html">레진치료</a></li><li><a href="../treatments/crown.html">크라운</a></li><li><a href="../treatments/inlay.html">인레이/온레이</a></li><li><a href="../treatments/root-canal.html">신경치료</a></li><li><a href="../treatments/whitening.html">미백</a></li></ul></div>
              <div class="mega-dropdown-section"><strong class="section-heading">잇몸/외과</strong><ul><li><a href="../treatments/scaling.html">스케일링</a></li><li><a href="../treatments/gum.html">잇몸치료</a></li><li><a href="../treatments/periodontitis.html">치주염</a></li><li><a href="../treatments/wisdom-tooth.html">사랑니 발치</a></li><li><a href="../treatments/tmj.html">턱관절장애</a></li><li><a href="../treatments/bruxism.html">이갈이/이악물기</a></li></ul></div>
            </div></div>
          </li>
          <li class="nav-item"><a href="../doctors/index.html">의료진 소개</a></li>
          <li class="nav-item"><a href="../mission.html">비디미션</a></li>
          <li class="nav-item has-dropdown"><a href="../blog/">콘텐츠</a><ul class="simple-dropdown"><li><a href="../blog/"><i class="fas fa-blog"></i> 블로그</a></li><li><a href="../video/index.html"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="../cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li></ul></li>
          <li class="nav-item has-dropdown"><a href="../directions.html">병원 안내</a><ul class="simple-dropdown"><li><a href="../pricing.html" class="nav-highlight">💰 비용 안내</a></li><li><a href="../floor-guide.html">층별 안내</a></li><li><a href="../directions.html">오시는 길</a></li><li><a href="../faq.html">자주 묻는 질문</a></li><li><a href="../notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
        <div class="auth-buttons"><a href="../auth/login.html" class="btn-auth btn-login"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="../auth/register.html" class="btn-auth btn-register"><i class="fas fa-user-plus"></i> 회원가입</a></div>
        <a href="../reservation.html" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
  <div class="header-spacer"></div>

  <main id="main-content" role="main">

  <!-- HERO -->
  <section class="hero" aria-label="${r.name} 임플란트 서울비디치과">
    <div class="hero-bg-pattern" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-1" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-2" aria-hidden="true"></div>
    <div class="container hero-content">
      <div class="hero-text">
        <p class="hero-brand-name reveal">SEOUL BD DENTAL CLINIC</p>
        <h1 class="hero-headline reveal delay-1">
          ${r.name}에서 찾는<br><em>임플란트 잘하는 치과</em>
        </h1>
        <p class="hero-sub reveal delay-2">
          ${r.fullName}에서 ${distShort} — 서울대 출신 15인 원장이<br>
          365일 임플란트·인비절라인·라미네이트를 진료합니다.
        </p>
        <div class="hero-trust-row reveal delay-3">
          <span class="hero-trust-item"><i class="fas fa-graduation-cap"></i> 서울대 15인 협진</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-calendar-check"></i> 365일 진료</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-car"></i> ${r.name}에서 ${distShort}</span>
          <span class="hero-trust-divider desktop-only"></span>
          <span class="hero-trust-item desktop-only"><i class="fas fa-map-marker-alt"></i> 천안 불당동</span>
        </div>
        <div class="hero-cta-group reveal delay-4">
          <a href="../reservation.html" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>
          <a href="tel:0414152892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
        </div>
      </div>
    </div>
    <div class="hero-scroll-hint" aria-hidden="true"><span>SCROLL</span><div class="scroll-line"></div></div>
  </section>

  <!-- 오시는 길 상세 -->
  <section class="why-section section" aria-label="${r.name}에서 오시는 길">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-route"></i> 오시는 길</span>
        <h2 class="section-title">${r.name}에서 <span class="text-gradient">서울비디치과까지</span></h2>
        <p class="section-subtitle">${r.fullName}에서 ${distText} — 충남 천안시 서북구 불당34길 14</p>
      </div>
      <div class="why-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="why-card reveal delay-1">
          <div class="why-card-icon"><i class="fas fa-car"></i></div>
          <h3>자가용으로 오시는 길</h3>
          <p>네비게이션에 <strong>"${r.navQuery}"</strong>을 검색하세요.<br>${r.carRoute}<br>건물 내 <strong>무료 주차</strong> 가능 (약 30대).</p>
          <div class="why-card-stat"><span class="num">${r.carMin}분</span><span class="unit">차량 소요시간</span></div>
        </div>
        <div class="why-card reveal delay-2">
          <div class="why-card-icon"><i class="fas fa-bus"></i></div>
          <h3>대중교통으로 오시는 길</h3>
          ${transitCard}
        </div>
      </div>
      <div class="why-hero-card reveal" style="margin-top:32px;">
        <h3><i class="fas fa-map-marker-alt"></i> 서울비디치과 위치 정보</h3>
        <p><strong>주소:</strong> 충남 천안시 서북구 불당34길 14, 1~5층<br>
        <strong>전화:</strong> 041-415-2892<br>
        <strong>진료시간:</strong> 평일 09:00-20:00 · 토·일 09:00-17:00 · 공휴일 09:00-13:00<br>
        <strong>주변 랜드마크:</strong> ${r.landmark}<br>
        <strong>카카오톡:</strong> <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" style="color:var(--brand-primary);">카카오톡 상담 →</a></p>
      </div>
      <div style="margin-top:24px;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);" class="reveal">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3180.7589788377!2d127.1051!3d36.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b285e48d9f1d1%3A0x7c0c3f4d5e5f6a7b!2z7LWo64Ko7LKc7JWI7Iuc7ISc67aP6rWsIOu2iOuLuTM06ri4IDE0!5e0!3m2!1sko!2skr!4v1701500000000!5m2!1sko!2skr" width="100%" height="300" style="border:0;border-radius:16px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="서울비디치과 위치"></iframe>
        <div style="display:flex;gap:8px;padding:12px;flex-wrap:wrap;">
          <a href="https://www.google.com/maps/search/충남+천안시+서북구+불당34길+14" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#4285F4;color:white;border-radius:8px;text-decoration:none;font-size:0.85rem;"><i class="fab fa-google"></i> 구글 지도</a>
          <a href="https://map.naver.com/v5/search/서울비디치과" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#03C75A;color:white;border-radius:8px;text-decoration:none;font-size:0.85rem;"><i class="fas fa-map"></i> 네이버 지도</a>
          <a href="https://map.kakao.com/?q=서울비디치과" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#FEE500;color:#000;border-radius:8px;text-decoration:none;font-size:0.85rem;"><i class="fas fa-map-marker-alt"></i> 카카오맵</a>
        </div>
      </div>
    </div>
  </section>

  <!-- WHY CHOOSE US -->
  <section class="why-section section" style="padding-top:0;" aria-label="왜 서울비디치과인가">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-heart"></i> 왜 서울비디치과일까요?</span>
        <h2 class="section-title">${r.name}에서 <span class="text-gradient">서울비디치과를 선택하는 이유</span></h2>
        <p class="section-subtitle">${r.fullName}에서 ${distShort}, 서울대병원급 진료를 받으실 수 있습니다</p>
      </div>
      <div class="why-hero-card reveal">
        <h3>"이건 안 해도 돼요"<br>라고 솔직히 말하는 치과</h3>
        <p>필요 없는 치료는 권하지 않습니다. ${r.name}에서 오신 환자분께도 정말 필요한 치료만 추천드립니다.</p>
        <span class="why-hero-badge"><i class="fas fa-shield-alt"></i> No 과잉진료</span>
      </div>
      <div class="why-grid">
        <div class="why-card reveal delay-1"><div class="why-card-icon"><i class="fas fa-users-cog"></i></div><h3>15인 원장이 함께 고민</h3><p>어려운 케이스도 포기하지 않습니다. 서울대 출신 15인 원장이 모여 최적의 치료법을 찾습니다.</p><div class="why-card-stat"><span class="num">15</span><span class="unit">명의 전문의 협진</span></div></div>
        <div class="why-card reveal delay-2"><div class="why-card-icon"><i class="fas fa-calendar-check"></i></div><h3>일요일에도 진료합니다</h3><p>바쁜 일상 때문에 치료를 미루셨나요? 365일, 평일 야간까지 진료합니다.</p><div class="why-card-stat"><span class="num">365</span><span class="unit">일 연중무휴</span></div></div>
        <div class="why-card reveal delay-3"><div class="why-card-icon"><i class="fas fa-hospital-alt"></i></div><h3>전문 의료 규모</h3><p>1~5층 전문 센터 구성, 6개 수술방, 원내 기공소, 첨단 디지털 장비 보유.</p><div class="why-card-stat"><span class="num">5</span><span class="unit">층 전문센터</span></div></div>
        <div class="why-card reveal delay-1"><div class="why-card-icon"><i class="fas fa-chalkboard-teacher"></i></div><h3>눈으로 보며 설명드려요</h3><p>덴탈커넥트와 시각 자료로 이해하실 때까지 충분히 설명드립니다.</p><div class="why-card-stat"><span class="num">100</span><span class="unit">% 이해될 때까지</span></div></div>
        <div class="why-card reveal delay-2"><div class="why-card-icon"><i class="fas fa-shield-virus"></i></div><h3>철저한 감염관리</h3><p>1인 1기구 원칙, 개별 멸균 패키지, 에어샤워 시스템으로 철저한 위생 관리.</p><div class="why-card-stat"><span class="num">1:1</span><span class="unit">기구 멸균 원칙</span></div></div>
        <div class="why-card reveal delay-3"><div class="why-card-icon"><i class="fas fa-tools"></i></div><h3>원내 기공소 운영</h3><p>충남권 대규모 원내 기공소, 5인 전문 기공사가 정밀한 보철물을 빠르게 제작합니다.</p><div class="why-card-stat"><span class="num">5</span><span class="unit">인 전문 기공사</span></div></div>
      </div>
    </div>
  </section>

  <!-- 주요 진료 -->
  <section class="treatment-section section" aria-label="${r.name} 환자 주요 진료">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-tooth"></i> ${r.name} 환자 주요 진료</span>
        <h2 class="section-title">${r.name}에서 오시는 환자분들의 <span class="text-gradient">인기 진료</span></h2>
        <p class="section-subtitle">${r.name} 환자분들은 주로 임플란트, 인비절라인 교정, 글로우네이트(라미네이트) 진료를 많이 받으십니다. 특히 임플란트의 경우 4층 전체가 임플란트 전용센터로, 6개 수술실과 네비게이션 시스템을 갖추고 있어 고난도 케이스도 안전하게 진행됩니다.</p>
      </div>
      <div class="treatment-grid">
        <a href="../treatments/implant.html" class="treatment-card featured reveal delay-1"><span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span><div class="treatment-card-icon"><i class="fas fa-tooth"></i></div><h3>임플란트</h3><p>6개 수술방 · 네비게이션 가이드<br>수면임플란트 · 고난도 전문 · 4F</p><span class="treatment-tag hot">BEST</span></a>
        <a href="../treatments/invisalign.html" class="treatment-card reveal delay-1"><span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span><div class="treatment-card-icon"><i class="fas fa-teeth"></i></div><h3>인비절라인</h3><p>서울대 교정 전문의 2인<br>대규모 센터 · 1F</p></a>
        <a href="../treatments/glownate.html" class="treatment-card reveal delay-2"><span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span><div class="treatment-card-icon"><i class="fas fa-sparkles"></i></div><h3>글로우네이트(라미네이트)</h3><p>최소삭제 포세린 라미네이트<br>프리미엄 심미 치료</p><span class="treatment-tag hot">HOT</span></a>
        <a href="../treatments/pediatric.html" class="treatment-card reveal delay-1"><span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span><div class="treatment-card-icon"><i class="fas fa-child"></i></div><h3>소아치과</h3><p>소아전문의 3인 진료<br>웃음가스 · 수면치료 · 3F</p></a>
        <a href="../treatments/aesthetic.html" class="treatment-card reveal delay-2"><span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span><div class="treatment-card-icon"><i class="fas fa-smile-beam"></i></div><h3>심미치료</h3><p>라미네이트 · 미백<br>자연스러운 아름다움 · 5F</p></a>
      </div>
      <div class="text-center mt-8 reveal"><a href="../treatments/index.html" class="btn btn-outline btn-lg">전체 진료 안내 보기 <i class="fas fa-arrow-right"></i></a></div>
    </div>
  </section>

  <!-- FEATURES BANNER -->
  <section class="features-banner" aria-label="핵심 특징">
    <div class="container"><div class="features-ticker">
      <div class="feature-item"><i class="fas fa-clock"></i> 365일 진료 (일요일·공휴일 포함)</div>
      <div class="feature-item"><i class="fas fa-moon"></i> 평일 매일 야간진료 20시</div>
      <div class="feature-item"><i class="fas fa-user-md"></i> 서울대 출신 15인 원장</div>
      <div class="feature-item"><i class="fas fa-building"></i> 1~5층 전문 의료 규모</div>
      <div class="feature-item"><i class="fas fa-car"></i> ${r.name}에서 ${distShort}</div>
      <div class="feature-item"><i class="fas fa-clock"></i> 365일 진료 (일요일·공휴일 포함)</div>
      <div class="feature-item"><i class="fas fa-moon"></i> 평일 매일 야간진료 20시</div>
      <div class="feature-item"><i class="fas fa-user-md"></i> 서울대 출신 15인 원장</div>
      <div class="feature-item"><i class="fas fa-building"></i> 1~5층 전문 의료 규모</div>
      <div class="feature-item"><i class="fas fa-car"></i> ${r.name}에서 ${distShort}</div>
    </div></div>
  </section>

  <!-- FAQ -->
  <section class="why-section section" aria-label="${r.name} 자주 묻는 질문">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-question-circle"></i> 자주 묻는 질문</span>
        <h2 class="section-title">${r.name} 환자분들이 <span class="text-gradient">자주 물어보시는 질문</span></h2>
      </div>
      <div class="faq-list" style="max-width:800px;margin:0 auto;">
${faqs.map((f, i) => `        <div class="why-hero-card reveal delay-${(i%3)+1}" style="margin-bottom:16px;text-align:left;">
          <h3 style="font-size:1.05rem;margin-bottom:8px;"><i class="fas fa-q" style="color:var(--brand-gold);margin-right:8px;"></i>${f.q}</h3>
          <p class="faq-answer" style="font-size:0.95rem;line-height:1.7;">${f.a}</p>
        </div>`).join('\n')}
      </div>
    </div>
  </section>

  <!-- REVIEWS -->
  <section class="reviews-section section" aria-label="환자 후기">
    <div class="reviews-container">
      <div class="reviews-header reveal">
        <span class="section-badge">전국 각지에서</span>
        <h2>50,000명 이상의 환자분들이<br><span class="highlight">서울비디치과</span>를 선택했습니다</h2>
        <p>네이버, 카카오, 구글에서 검증된 실제 리뷰입니다</p>
      </div>
      <div class="reviews-stats reveal">
        <div class="reviews-stat-item"><span class="stat-icon naver"><i class="fas fa-star"></i></span><span class="stat-number">4.85</span><span class="stat-label">네이버</span></div>
        <div class="reviews-stat-item"><span class="stat-icon google"><i class="fab fa-google"></i></span><span class="stat-number">4.9</span><span class="stat-label">구글</span></div>
        <div class="reviews-stat-item"><span class="stat-icon"><i class="fas fa-smile-beam" style="color:var(--brand-gold)"></i></span><span class="stat-number">98%</span><span class="stat-label">만족도</span></div>
      </div>
      <div class="reviews-grid reveal">
        <div class="review-card">
          <div class="review-card-header"><div class="review-avatar">${r.reviewerName}</div><div class="review-author-info"><div class="author-name">${r.reviewerName}**님</div><span class="review-source naver"><i class="fas fa-check-circle"></i> 네이버</span></div></div>
          <div class="review-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          <p class="review-text"><span class="highlight">${r.reviewText}</span></p>
          <div class="review-tags"><span class="review-tag">${r.reviewTag}</span><span class="review-tag">${r.name}에서 방문</span></div>
        </div>
        <div class="review-card">
          <div class="review-card-header"><div class="review-avatar">이</div><div class="review-author-info"><div class="author-name">이**님</div><span class="review-source naver"><i class="fas fa-check-circle"></i> 네이버</span></div></div>
          <div class="review-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          <p class="review-text">인비절라인 교정 중인데, <span class="highlight">ClinCheck 3D로 결과를 미리 볼 수 있어서</span> 안심이 돼요. ${r.name}에서 다니기도 괜찮아요!</p>
          <div class="review-tags"><span class="review-tag">인비절라인</span><span class="review-tag">3D 시뮬레이션</span></div>
        </div>
        <div class="review-card">
          <div class="review-card-header"><div class="review-avatar">정</div><div class="review-author-info"><div class="author-name">정**님</div><span class="review-source google"><i class="fab fa-google"></i> 구글</span></div></div>
          <div class="review-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          <p class="review-text"><span class="highlight">과잉진료 없이 솔직하게 말씀해주셔서</span> 신뢰가 갑니다. ${r.name}에서 좀 멀지만 올 만한 가치가 있어요!</p>
          <div class="review-tags"><span class="review-tag">NO 과잉진료</span><span class="review-tag">친절한 설명</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section section" aria-label="상담 예약">
    <div class="container">
      <div class="cta-box reveal">
        <p class="cta-badge">365일 진료 · 평일 야간진료</p>
        <h2>${r.name}에서 서울비디치과까지<br>지금 바로 상담 받아보세요</h2>
        <p class="cta-desc">서울대 출신 15인 원장이<br>정확한 진단과 맞춤 치료 계획을 제안드립니다.</p>
        <div class="cta-buttons">
          <a href="https://naver.me/5yPnKmqQ" target="_blank" rel="noopener" class="btn-naver"><i class="fas fa-calendar-check"></i> 네이버 예약하기</a>
          <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="btn-kakao"><i class="fas fa-comment"></i> 카카오톡 상담</a>
        </div>
        <p class="cta-phone"><i class="fas fa-phone"></i> 전화 예약: <a href="tel:041-415-2892">041-415-2892</a></p>
      </div>
    </div>
  </section>

  </main>

  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand"><a href="../" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p></div>
        <div class="footer-links">
          <div class="footer-col"><strong class="section-heading">전문센터</strong><ul><li><a href="../treatments/implant.html">임플란트센터</a></li><li><a href="../treatments/invisalign.html">교정센터</a></li><li><a href="../treatments/pediatric.html">소아치과</a></li><li><a href="../treatments/glownate.html">심미치료</a></li></ul></div>
          <div class="footer-col"><strong class="section-heading">병원 안내</strong><ul><li><a href="../doctors/index.html">의료진 소개</a></li><li><a href="../mission.html">비디미션</a></li><li><a href="../floor-guide.html">층별 안내</a></li><li><a href="../cases/gallery.html">Before/After</a></li></ul></div>
          <div class="footer-col"><strong class="section-heading">고객 지원</strong><ul><li><a href="../reservation.html">예약/상담</a></li><li><a href="../blog/">블로그/콘텐츠</a></li><li><a href="../faq.html">자주 묻는 질문</a></li><li><a href="../directions.html">오시는 길</a></li></ul></div>
        </div>
      </div>
      <div class="footer-info">
        <div class="footer-contact"><p><i class="fas fa-map-marker-alt"></i> 충남 천안시 서북구 불당34길 14, 1~5층</p><p><i class="fas fa-phone"></i> 041-415-2892</p><div class="footer-hours"><p><i class="fas fa-clock"></i> <strong>365일 진료</strong></p><p>평일 09:00-20:00 (점심 12:30-14:00)</p><p>토·일 09:00-17:00</p><p>공휴일 09:00-13:00</p></div></div>
        <div class="footer-social"><a href="https://naver.me/5yPnKmqQ" target="_blank" rel="noopener" aria-label="네이버 예약"><i class="fas fa-calendar-check"></i></a><a href="https://www.youtube.com/c/%EC%89%BD%EB%94%94%EC%89%AC%EC%9A%B4%EC%B9%98%EA%B3%BC%EC%9D%B4%EC%95%BC%EA%B8%B0Bdtube" target="_blank" rel="noopener" aria-label="유튜브"><i class="fab fa-youtube"></i></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" aria-label="카카오톡"><i class="fas fa-comment"></i></a></div>
      </div>
      <div class="footer-legal">
        <div class="legal-links"><a href="../privacy.html">개인정보 처리방침</a><span>|</span><a href="../terms.html">이용약관</a><span>|</span><a href="../sitemap.xml">사이트맵</a></div>
        <p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수하여 제공하고 있으며, 특정 개인의 결과는 개인에 따라 달라질 수 있습니다.</p>
        <p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <nav class="mobile-nav" id="mobileNav" aria-label="모바일 메뉴">
    <div class="mobile-nav-header"><span class="logo-icon">🦷</span><button class="mobile-nav-close" id="mobileNavClose" aria-label="메뉴 닫기"><i class="fas fa-times"></i></button></div>
    <ul class="mobile-nav-menu">
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-tooth"></i> 진료 안내 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="../treatments/index.html">전체 진료</a></li><li class="submenu-divider">전문센터</li><li><a href="../treatments/glownate.html" style="color:#6B4226;font-weight:600;">✨ 글로우네이트</a></li><li><a href="../treatments/implant.html">임플란트센터</a></li><li><a href="../treatments/invisalign.html">교정센터</a></li><li><a href="../treatments/pediatric.html">소아치과</a></li><li><a href="../treatments/aesthetic.html">심미치료</a></li><li class="submenu-divider">일반 진료</li><li><a href="../treatments/cavity.html">충치치료</a></li><li><a href="../treatments/resin.html">레진치료</a></li><li><a href="../treatments/scaling.html">스케일링</a></li><li><a href="../treatments/gum.html">잇몸치료</a></li></ul></li>
      <li><a href="../doctors/index.html"><i class="fas fa-user-md"></i> 의료진 소개</a></li>
      <li><a href="../mission.html"><i class="fas fa-heart"></i> 비디미션</a></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-newspaper"></i> 콘텐츠 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="../blog/"><i class="fas fa-blog"></i> 블로그</a></li><li><a href="../video/index.html"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="../cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li></ul></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-hospital"></i> 병원 안내 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="../pricing.html">💰 비용 안내</a></li><li><a href="../floor-guide.html">층별 안내</a></li><li><a href="../directions.html">오시는 길</a></li><li><a href="../faq.html">자주 묻는 질문</a></li><li><a href="../notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
      <li><a href="../reservation.html" class="highlight"><i class="fas fa-calendar-check"></i> 예약하기</a></li>
    </ul>
    <div class="mobile-auth-buttons"><a href="../auth/login.html" class="btn-auth"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="../auth/register.html" class="btn-auth"><i class="fas fa-user-plus"></i> 회원가입</a></div>
    <div class="mobile-nav-footer"><p class="mobile-nav-hours"><i class="fas fa-clock"></i> 365일 진료 | 평일 야간진료</p><div class="mobile-nav-quick-btns"><a href="../pricing.html" class="btn btn-secondary btn-lg"><i class="fas fa-won-sign"></i> 비용 안내</a><a href="tel:041-415-2892" class="btn btn-primary btn-lg"><i class="fas fa-phone"></i> 전화 예약</a></div></div>
  </nav>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>
  <div class="floating-cta desktop-only"><a href="javascript:void(0)" class="floating-btn top" aria-label="맨 위로" id="scrollToTopBtn"><i class="fas fa-arrow-up"></i><span class="tooltip">맨 위로</span></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="floating-btn kakao" aria-label="카카오톡 상담"><i class="fas fa-comment-dots"></i><span class="tooltip">카카오톡 상담</span></a><a href="tel:0414152892" class="floating-btn phone" aria-label="전화 상담"><i class="fas fa-phone"></i><span class="tooltip">전화 상담</span></a></div>
  <div class="mobile-bottom-cta mobile-only" aria-label="빠른 연락"><a href="tel:041-415-2892" class="mobile-cta-btn phone"><i class="fas fa-phone-alt"></i><span>전화</span></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="mobile-cta-btn kakao"><i class="fas fa-comment"></i><span>카카오톡</span></a><a href="../reservation.html" class="mobile-cta-btn reserve primary"><i class="fas fa-calendar-check"></i><span>예약</span></a><a href="../directions.html" class="mobile-cta-btn location"><i class="fas fa-map-marker-alt"></i><span>오시는 길</span></a></div>
  <script src="../js/main.js" defer></script>
  <script src="../js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});els.forEach(function(el){obs.observe(el);});});
  </script>
</body>
</html>`;
}

// ═══════ 실행 ═══════
const areaDir = path.join(__dirname, '..', 'area');
if (!fs.existsSync(areaDir)) fs.mkdirSync(areaDir, { recursive: true });

let created = 0, updated = 0;
regions.forEach(r => {
  const filePath = path.join(areaDir, `${r.slug}.html`);
  const existed = fs.existsSync(filePath);
  fs.writeFileSync(filePath, generatePage(r), 'utf8');
  if (existed) { updated++; } else { created++; }
  console.log(`${existed ? 'UPDATED' : 'CREATED'} → area/${r.slug}.html (${r.name})`);
});

console.log(`\n=== 완료: ${created}개 생성, ${updated}개 업데이트 (총 ${regions.length}개) ===`);
console.log('Schema 포함: BreadcrumbList + FAQPage(5개) + Dentist/MedicalBusiness + WebPage/SpeakableSpecification');
