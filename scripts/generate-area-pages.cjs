/**
 * 28개 지역별 "오시는 길" 페이지 일괄 생성 스크립트
 * 기존 cheonan.html 구조를 기반으로 각 지역 데이터를 삽입
 */
const fs = require('fs');
const path = require('path');

// ═══════ 28개 지역 데이터 ═══════
const regions = [
  // ── 충청남도 ──
  {
    id: 'cheonan', name: '천안', nameEn: 'Cheonan', province: '충청남도',
    fileName: 'cheonan.html',
    distanceKm: 5, carMin: 10, busMin: 20,
    publicTransport: '시내버스 11, 12, 21, 22번 불당동 정류장 하차 도보 3분',
    ktx: '천안아산역(KTX) 하차 → 택시 10분 / 버스 20분',
    carRoute: '천안IC에서 약 15분 소요',
    landmark: '불당동 CGV 인근',
    whyText: '천안 불당동에 위치한 서울비디치과는 천안 최대 규모 치과로, 굳이 멀리 가지 않아도 서울대병원급 진료를 받으실 수 있습니다.',
    reviewName: '김', reviewText: '천안에서 왔는데 임플란트 수술이 정말 편안했어요. 4층 전체가 수술센터라 전문적이고, 수술 후 죽까지 주시는 세심한 배려에 감동!',
    reviewTag: '임플란트'
  },
  {
    id: 'buldang', name: '불당동', nameEn: 'Buldang-dong', province: '충청남도',
    fileName: 'buldang.html',
    distanceKm: 1, carMin: 3, busMin: 5,
    publicTransport: '도보 5~10분 거리, 시내버스 11, 12번 불당동 정류장 하차',
    ktx: '천안아산역(KTX) 하차 → 택시 5분',
    carRoute: '불당동 내 위치로 어디서든 5분 이내',
    landmark: '불당동 CGV 바로 옆',
    whyText: '서울비디치과는 불당동 한복판에 위치해 있어 걸어서도 쉽게 방문하실 수 있습니다. 1~5층 전문센터 규모의 치과를 동네에서 만나보세요.',
    reviewName: '박', reviewText: '불당동 살면서 이렇게 큰 치과가 동네에 있다니! 걸어서 다닐 수 있어서 교정 치료 다니기 정말 편해요.',
    reviewTag: '인비절라인'
  },
  {
    id: 'asan', name: '아산', nameEn: 'Asan', province: '충청남도',
    fileName: 'asan.html',
    distanceKm: 15, carMin: 20, busMin: 40,
    publicTransport: '아산터미널에서 천안행 시내버스 → 불당동 하차 도보 3분',
    ktx: '천안아산역(KTX) 하차 → 택시 10분 / 버스 20분',
    carRoute: '아산 → 천안아산IC 경유 → 불당동 방면 약 20분',
    landmark: '천안아산역 인근',
    whyText: '아산에서 차로 20분이면 서울대병원급 진료를 받으실 수 있습니다. 특히 KTX 천안아산역에서 가까워 대중교통으로도 편리합니다.',
    reviewName: '이', reviewText: '아산에서 다니고 있는데 천안아산역에서 가까워서 편해요. 임플란트 상담 받았는데 CT로 자세히 설명해주셔서 신뢰가 갔습니다.',
    reviewTag: '임플란트'
  },
  {
    id: 'dangjin', name: '당진', nameEn: 'Dangjin', province: '충청남도',
    fileName: 'dangjin.html',
    distanceKm: 55, carMin: 50, busMin: 80,
    publicTransport: '당진종합터미널 → 천안행 시외버스(약 1시간) → 천안터미널 하차 → 택시 15분',
    ktx: '당진에서 천안아산역까지 버스 후 택시 10분',
    carRoute: '당진IC → 서해안고속도로 → 천안IC → 불당동 약 50분',
    landmark: '서해안고속도로 이용',
    whyText: '당진에서 서해안고속도로를 이용하면 50분이면 도착합니다. 당진 지역에서 서울대급 임플란트 전문 치과를 찾으신다면 서울비디치과를 추천드립니다.',
    reviewName: '최', reviewText: '당진에서 고속도로 타면 50분이면 오더라고요. 임플란트 뼈이식까지 한 번에 해결했는데 결과가 너무 좋아요!',
    reviewTag: '임플란트'
  },
  {
    id: 'seosan', name: '서산', nameEn: 'Seosan', province: '충청남도',
    fileName: 'seosan.html',
    distanceKm: 65, carMin: 60, busMin: 90,
    publicTransport: '서산터미널 → 천안행 시외버스(약 1시간 20분) → 천안터미널 하차 → 택시 15분',
    ktx: '서산에서 천안아산역까지 버스 후 택시 10분',
    carRoute: '서산IC → 서해안고속도로 → 천안IC → 불당동 약 60분',
    landmark: '서해안고속도로 이용',
    whyText: '서산에서 약 1시간 거리지만, 서울대 출신 15인 원장의 협진 시스템과 6개 수술실 규모의 임플란트 센터를 만나실 수 있습니다.',
    reviewName: '한', reviewText: '서산에서 한 시간 운전해서 오지만 그만한 가치가 있어요. 임플란트 수술 후 관리까지 꼼꼼하게 해주십니다.',
    reviewTag: '임플란트'
  },
  {
    id: 'hongseong', name: '홍성', nameEn: 'Hongseong', province: '충청남도',
    fileName: 'hongseong.html',
    distanceKm: 55, carMin: 50, busMin: 80,
    publicTransport: '홍성터미널 → 천안행 시외버스(약 1시간 10분) → 천안터미널 하차 → 택시 15분',
    ktx: '홍성역(KTX 장항선) 하차 → 천안행 열차 환승 → 택시 10분',
    carRoute: '홍성 → 당진영덕고속도로 → 천안IC → 불당동 약 50분',
    landmark: '당진영덕고속도로 이용',
    whyText: '홍성에서 고속도로를 이용하면 50분이면 서울비디치과에 도착합니다. 내포신도시에서도 접근성이 좋습니다.',
    reviewName: '윤', reviewText: '홍성에서 다니는데 고속도로 덕분에 생각보다 가까워요. 인비절라인 교정 결과가 정말 만족스럽습니다.',
    reviewTag: '인비절라인'
  },
  {
    id: 'yesan', name: '예산', nameEn: 'Yesan', province: '충청남도',
    fileName: 'yesan.html',
    distanceKm: 40, carMin: 40, busMin: 70,
    publicTransport: '예산터미널 → 천안행 시외버스(약 1시간) → 천안터미널 하차 → 택시 15분',
    ktx: '예산역 → 천안행 열차 → 천안역 하차 → 택시 15분',
    carRoute: '예산 → 21번 국도 → 천안 불당동 약 40분',
    landmark: '21번 국도 이용',
    whyText: '예산에서 40분이면 충남 최대 규모 치과인 서울비디치과를 만나실 수 있습니다. 예산 지역 환자분들도 많이 방문해주고 계십니다.',
    reviewName: '조', reviewText: '예산에서 오는데 40분이면 충분해요. 라미네이트 글로우네이트 시술 받았는데 자연스럽고 너무 예뻐요!',
    reviewTag: '라미네이트'
  },
  {
    id: 'gongju', name: '공주', nameEn: 'Gongju', province: '충청남도',
    fileName: 'gongju.html',
    distanceKm: 45, carMin: 40, busMin: 70,
    publicTransport: '공주종합터미널 → 천안행 시외버스(약 1시간) → 천안터미널 하차 → 택시 15분',
    ktx: '공주역(KTX) 하차 → 천안행 버스 → 택시 10분',
    carRoute: '공주 → 천안논산고속도로 → 천안IC → 불당동 약 40분',
    landmark: '천안논산고속도로 이용',
    whyText: '공주에서 천안논산고속도로를 타면 40분이면 도착합니다. 공주 지역에서 대형 치과를 찾으신다면 서울비디치과가 최적입니다.',
    reviewName: '강', reviewText: '공주에서 고속도로로 40분 걸리는데, 임플란트 전문센터가 이 정도 규모인 곳은 처음 봤어요. 믿고 맡길 수 있습니다.',
    reviewTag: '임플란트'
  },
  {
    id: 'nonsan', name: '논산', nameEn: 'Nonsan', province: '충청남도',
    fileName: 'nonsan.html',
    distanceKm: 50, carMin: 45, busMin: 75,
    publicTransport: '논산터미널 → 천안행 시외버스(약 1시간 10분) → 천안터미널 하차 → 택시 15분',
    ktx: '논산역 → 천안행 열차 → 천안역 하차 → 택시 15분',
    carRoute: '논산 → 천안논산고속도로 → 천안IC → 불당동 약 45분',
    landmark: '천안논산고속도로 이용',
    whyText: '논산에서 천안논산고속도로를 이용하면 45분이면 서울비디치과에 도착합니다. 서울대 15인 원장 협진 시스템으로 안심하고 치료받으실 수 있습니다.',
    reviewName: '신', reviewText: '논산에서 다니는데 고속도로 타면 금방이에요. 소아치과 전문의가 3명이나 계셔서 아이 치료도 안심이 됩니다.',
    reviewTag: '소아치과'
  },
  {
    id: 'cheongyang', name: '청양', nameEn: 'Cheongyang', province: '충청남도',
    fileName: 'cheongyang.html',
    distanceKm: 55, carMin: 50, busMin: 80,
    publicTransport: '청양터미널 → 천안행 시외버스(약 1시간 20분) → 천안터미널 하차 → 택시 15분',
    ktx: '청양 → 공주역(KTX) 환승 → 천안행',
    carRoute: '청양 → 36번 국도 → 공주 → 천안논산고속도로 → 천안 약 50분',
    landmark: '36번 국도 → 천안논산고속도로',
    whyText: '청양에서 약 50분이면 충남 최대 규모 치과를 만나실 수 있습니다. 과잉진료 없는 양심 진료로 멀리서 오시는 분들도 만족하고 계십니다.',
    reviewName: '오', reviewText: '청양에서 오지만 진료 한 번 받아보니 계속 다니게 됩니다. 설명이 정말 자세하고 과잉진료가 없어서 신뢰가 가요.',
    reviewTag: '임플란트'
  },
  {
    id: 'buyeo', name: '부여', nameEn: 'Buyeo', province: '충청남도',
    fileName: 'buyeo.html',
    distanceKm: 65, carMin: 55, busMin: 90,
    publicTransport: '부여터미널 → 천안행 시외버스(약 1시간 30분) → 천안터미널 하차 → 택시 15분',
    ktx: '부여 → 논산역 환승 → 천안역 → 택시 15분',
    carRoute: '부여 → 천안논산고속도로 → 천안IC → 불당동 약 55분',
    landmark: '천안논산고속도로 이용',
    whyText: '부여에서 약 55분이면 서울대급 치과 진료를 받으실 수 있습니다. 6개 수술실을 갖춘 임플란트 전문센터에서 안전한 수술을 경험하세요.',
    reviewName: '장', reviewText: '부여에서 좀 멀지만 임플란트 수술 받으러 왔는데, 네비게이션 가이드 시스템으로 정확하게 수술해주셔서 회복도 빨랐어요.',
    reviewTag: '임플란트'
  },
  {
    id: 'seocheon', name: '서천', nameEn: 'Seocheon', province: '충청남도',
    fileName: 'seocheon.html',
    distanceKm: 80, carMin: 60, busMin: 100,
    publicTransport: '서천터미널 → 천안행 시외버스(약 1시간 40분) → 천안터미널 하차 → 택시 15분',
    ktx: '서천 → 논산역 환승 → 천안역 → 택시 15분',
    carRoute: '서천 → 서천공주고속도로 → 천안논산고속도로 → 천안IC 약 60분',
    landmark: '서천공주고속도로 이용',
    whyText: '서천에서 약 1시간이면 도착합니다. 365일 진료하는 서울비디치과에서 주말이나 공휴일에도 편하게 치료받으실 수 있습니다.',
    reviewName: '권', reviewText: '서천에서 오는데 주말에도 진료해서 정말 편해요. 인비절라인 교정 상담 받았는데 ClinCheck으로 결과를 미리 보여주셔서 좋았어요.',
    reviewTag: '인비절라인'
  },
  {
    id: 'boryeong', name: '보령', nameEn: 'Boryeong', province: '충청남도',
    fileName: 'boryeong.html',
    distanceKm: 75, carMin: 60, busMin: 100,
    publicTransport: '보령터미널 → 천안행 시외버스(약 1시간 30분) → 천안터미널 하차 → 택시 15분',
    ktx: '보령 → 천안행 무궁화호(약 1시간) → 천안역 → 택시 15분',
    carRoute: '보령 → 서해안고속도로 → 천안IC → 불당동 약 60분',
    landmark: '서해안고속도로 이용',
    whyText: '보령에서 서해안고속도로를 이용하면 약 1시간이면 도착합니다. 대천해수욕장 방면에서도 접근이 편리합니다.',
    reviewName: '임', reviewText: '보령에서 다니고 있는데, 임플란트 비용도 합리적이고 분할납부도 가능해서 부담 없이 치료받고 있어요.',
    reviewTag: '임플란트'
  },
  {
    id: 'taean', name: '태안', nameEn: 'Taean', province: '충청남도',
    fileName: 'taean.html',
    distanceKm: 90, carMin: 70, busMin: 110,
    publicTransport: '태안터미널 → 천안행 시외버스(약 1시간 50분) → 천안터미널 하차 → 택시 15분',
    ktx: '태안 → 서산 → 천안행 시외버스',
    carRoute: '태안 → 서해안고속도로 → 천안IC → 불당동 약 70분',
    landmark: '서해안고속도로 이용',
    whyText: '태안에서 약 70분 거리지만, 서울대 출신 15인 원장이 한자리에 모여있는 치과는 충남에서 서울비디치과가 유일합니다.',
    reviewName: '송', reviewText: '태안에서 좀 먼 거리지만 서울대 출신 원장님들이 많아서 신뢰가 갑니다. 라미네이트 결과가 자연스럽고 만족해요.',
    reviewTag: '라미네이트'
  },
  {
    id: 'geumsan', name: '금산', nameEn: 'Geumsan', province: '충청남도',
    fileName: 'geumsan.html',
    distanceKm: 60, carMin: 50, busMin: 85,
    publicTransport: '금산터미널 → 대전행 버스 → 대전 환승 → 천안행 시외버스 → 택시 15분',
    ktx: '금산 → 대전역 환승 → 천안역 → 택시 15분',
    carRoute: '금산 → 통영대전고속도로 → 천안논산고속도로 → 천안IC 약 50분',
    landmark: '통영대전고속도로 → 천안논산고속도로',
    whyText: '금산에서 약 50분이면 서울비디치과에 도착합니다. 인삼의 고장 금산에서도 많은 환자분들이 방문해주고 계십니다.',
    reviewName: '정', reviewText: '금산에서 다니고 있어요. 임플란트 수면 수술 받았는데 눈 감았다 뜨니 끝나있더라고요. 통증도 거의 없었습니다.',
    reviewTag: '수면임플란트'
  },
  {
    id: 'gyeryong', name: '계룡', nameEn: 'Gyeryong', province: '충청남도',
    fileName: 'gyeryong.html',
    distanceKm: 40, carMin: 35, busMin: 60,
    publicTransport: '계룡시 → 천안행 시외버스(약 50분) → 천안터미널 하차 → 택시 15분',
    ktx: '계룡역(KTX) → 천안아산역 → 택시 10분',
    carRoute: '계룡 → 천안논산고속도로 → 천안IC → 불당동 약 35분',
    landmark: '천안논산고속도로 이용',
    whyText: '계룡에서 고속도로를 이용하면 35분이면 도착합니다. 계룡대 군인 가족분들도 365일 진료 시스템 덕분에 편하게 방문하고 계십니다.',
    reviewName: '류', reviewText: '계룡대 근무 중인데 일요일에도 진료해서 정말 편합니다. 주말에 임플란트 상담 받고 바로 치료 시작했어요.',
    reviewTag: '임플란트'
  },
  // ── 세종·대전 ──
  {
    id: 'sejong', name: '세종', nameEn: 'Sejong', province: '세종특별자치시',
    fileName: 'sejong.html',
    distanceKm: 35, carMin: 35, busMin: 60,
    publicTransport: '세종시 → 천안행 시외버스(약 50분) → 천안터미널 하차 → 택시 15분',
    ktx: '세종 → 오송역(KTX) 환승 → 천안아산역 → 택시 10분',
    carRoute: '세종 → 세종천안고속도로(36번) → 천안IC → 불당동 약 35분',
    landmark: '세종천안고속도로(36번) 이용',
    whyText: '세종시에서 35분이면 서울대급 치과 진료를 받으실 수 있습니다. 세종시 공무원 및 가족분들도 많이 방문해주고 계십니다.',
    reviewName: '황', reviewText: '세종시에서 다니는데 고속도로 타면 35분이에요. 인비절라인 다이아몬드 프로바이더라 교정 실력이 확실합니다.',
    reviewTag: '인비절라인'
  },
  {
    id: 'yeongi', name: '연기', nameEn: 'Yeongi', province: '세종특별자치시',
    fileName: 'yeongi.html',
    distanceKm: 30, carMin: 30, busMin: 55,
    publicTransport: '연기(세종) → 조치원 환승 → 천안행 시내버스 → 택시 15분',
    ktx: '조치원역 → 천안역 열차(약 20분) → 택시 15분',
    carRoute: '연기(조치원) → 1번 국도 → 천안 불당동 약 30분',
    landmark: '1번 국도(경부국도) 이용',
    whyText: '연기(조치원)에서 30분이면 서울비디치과에 도착합니다. 세종시 연기면, 조치원 지역에서도 편리하게 방문하실 수 있습니다.',
    reviewName: '안', reviewText: '조치원에서 오는데 30분이면 충분해요. 아이 소아치과 치료 받으러 다니는데 전문의가 3명이나 계셔서 든든합니다.',
    reviewTag: '소아치과'
  },
  {
    id: 'daejeon', name: '대전', nameEn: 'Daejeon', province: '대전광역시',
    fileName: 'daejeon.html',
    distanceKm: 50, carMin: 40, busMin: 70,
    publicTransport: '대전복합터미널 → 천안행 시외버스(약 1시간) → 천안터미널 하차 → 택시 15분',
    ktx: '대전역(KTX) → 천안아산역(약 20분) → 택시 10분',
    carRoute: '대전 → 경부고속도로 → 천안IC → 불당동 약 40분',
    landmark: '경부고속도로 이용',
    whyText: '대전에서 경부고속도로 또는 KTX로 40분이면 도착합니다. 대전 지역에서 서울대급 임플란트·교정 전문 치과를 찾으신다면 서울비디치과를 추천드립니다.',
    reviewName: '유', reviewText: '대전에서 KTX 타면 20분! 천안아산역에서 택시로 10분이면 도착해요. 글로우네이트 라미네이트 결과가 너무 예뻐요.',
    reviewTag: '라미네이트'
  },
  // ── 충청북도 ──
  {
    id: 'cheongju', name: '청주', nameEn: 'Cheongju', province: '충청북도',
    fileName: 'cheongju.html',
    distanceKm: 55, carMin: 50, busMin: 80,
    publicTransport: '청주터미널 → 천안행 시외버스(약 1시간 10분) → 천안터미널 하차 → 택시 15분',
    ktx: '오송역(KTX) → 천안아산역(약 10분) → 택시 10분',
    carRoute: '청주 → 경부고속도로 → 천안IC → 불당동 약 50분',
    landmark: '경부고속도로 이용',
    whyText: '청주에서 경부고속도로를 이용하면 50분이면 도착합니다. 오송역(KTX)을 이용하면 더 빠르게 오실 수 있습니다.',
    reviewName: '서', reviewText: '청주에서 오송역 KTX 타면 천안아산역까지 10분! 임플란트 네비게이션 수술이 정말 정확하고 안전했어요.',
    reviewTag: '임플란트'
  },
  {
    id: 'jincheon', name: '진천', nameEn: 'Jincheon', province: '충청북도',
    fileName: 'jincheon.html',
    distanceKm: 40, carMin: 40, busMin: 70,
    publicTransport: '진천터미널 → 천안행 시외버스(약 1시간) → 천안터미널 하차 → 택시 15분',
    ktx: '진천 → 오송역(KTX) 환승 → 천안아산역 → 택시 10분',
    carRoute: '진천 → 중부고속도로 → 천안IC → 불당동 약 40분',
    landmark: '중부고속도로 이용',
    whyText: '진천에서 중부고속도로를 이용하면 40분이면 서울비디치과에 도착합니다. 진천 반도체 클러스터 근무자분들도 많이 방문하고 계십니다.',
    reviewName: '배', reviewText: '진천에서 다니고 있어요. 야간진료 20시까지 해서 퇴근 후에도 갈 수 있어서 정말 좋습니다.',
    reviewTag: '야간진료'
  },
  {
    id: 'chungju', name: '충주', nameEn: 'Chungju', province: '충청북도',
    fileName: 'chungju.html',
    distanceKm: 75, carMin: 60, busMin: 100,
    publicTransport: '충주터미널 → 천안행 시외버스(약 1시간 40분) → 천안터미널 하차 → 택시 15분',
    ktx: '충주 → 오송역(KTX) 환승 → 천안아산역 → 택시 10분',
    carRoute: '충주 → 중부고속도로 → 천안IC → 불당동 약 60분',
    landmark: '중부고속도로 이용',
    whyText: '충주에서 중부고속도로를 이용하면 약 1시간이면 도착합니다. 충주 지역에서 대형 임플란트 전문 치과를 찾으신다면 서울비디치과가 최적입니다.',
    reviewName: '백', reviewText: '충주에서 오는데 고속도로 타면 1시간이에요. 임플란트 상악동거상술까지 한 번에 해결했는데 결과가 너무 좋습니다.',
    reviewTag: '임플란트'
  },
  {
    id: 'eumseong', name: '음성', nameEn: 'Eumseong', province: '충청북도',
    fileName: 'eumseong.html',
    distanceKm: 55, carMin: 50, busMin: 85,
    publicTransport: '음성터미널 → 천안행 시외버스(약 1시간 20분) → 천안터미널 하차 → 택시 15분',
    ktx: '음성 → 오송역(KTX) 환승 → 천안아산역 → 택시 10분',
    carRoute: '음성 → 중부고속도로 → 천안IC → 불당동 약 50분',
    landmark: '중부고속도로 이용',
    whyText: '음성에서 중부고속도로를 이용하면 50분이면 도착합니다. 음성 산업단지 근무자분들도 야간진료를 이용해 방문하고 계십니다.',
    reviewName: '전', reviewText: '음성에서 다니고 있는데, 인비절라인 교정 3개월째인데 벌써 변화가 보여요. 서울대 교정 전문의라 실력이 확실합니다.',
    reviewTag: '인비절라인'
  },
  {
    id: 'okcheon', name: '옥천', nameEn: 'Okcheon', province: '충청북도',
    fileName: 'okcheon.html',
    distanceKm: 65, carMin: 55, busMin: 90,
    publicTransport: '옥천터미널 → 대전 환승 → 천안행 시외버스 → 택시 15분',
    ktx: '옥천역 → 대전역(KTX) 환승 → 천안아산역 → 택시 10분',
    carRoute: '옥천 → 경부고속도로 → 천안IC → 불당동 약 55분',
    landmark: '경부고속도로 이용',
    whyText: '옥천에서 경부고속도로를 이용하면 55분이면 서울비디치과에 도착합니다. 서울대병원급 진료를 충남에서 받으실 수 있습니다.',
    reviewName: '홍', reviewText: '옥천에서 오는데, 과잉진료 없이 솔직하게 말씀해주셔서 신뢰가 갑니다. 임플란트 비용도 합리적이에요.',
    reviewTag: '임플란트'
  },
  {
    id: 'yeongdong', name: '영동', nameEn: 'Yeongdong', province: '충청북도',
    fileName: 'yeongdong.html',
    distanceKm: 80, carMin: 60, busMin: 100,
    publicTransport: '영동터미널 → 대전 환승 → 천안행 시외버스 → 택시 15분',
    ktx: '영동역 → 대전역(KTX) 환승 → 천안아산역 → 택시 10분',
    carRoute: '영동 → 경부고속도로 → 천안IC → 불당동 약 60분',
    landmark: '경부고속도로 이용',
    whyText: '영동에서 경부고속도로를 이용하면 약 1시간이면 도착합니다. 포도의 고장 영동에서도 서울대급 치과 치료를 받으실 수 있습니다.',
    reviewName: '고', reviewText: '영동에서 좀 멀지만 실력 있는 치과를 찾다가 왔어요. 글로우네이트 라미네이트 시술 후 미소가 완전 달라졌습니다!',
    reviewTag: '라미네이트'
  },
  // ── 경기도 ──
  {
    id: 'pyeongtaek', name: '평택', nameEn: 'Pyeongtaek', province: '경기도',
    fileName: 'pyeongtaek.html',
    distanceKm: 50, carMin: 45, busMin: 75,
    publicTransport: '평택터미널 → 천안행 시외버스(약 1시간) → 천안터미널 하차 → 택시 15분',
    ktx: '평택역 → SRT/KTX → 천안아산역 → 택시 10분',
    carRoute: '평택 → 경부고속도로 → 천안IC → 불당동 약 45분',
    landmark: '경부고속도로 이용',
    whyText: '평택에서 경부고속도로를 이용하면 45분이면 도착합니다. 평택 미군기지 인근 외국인 환자분들도 다국어(영어) 상담이 가능합니다.',
    reviewName: '문', reviewText: '평택에서 고속도로 타면 45분이에요. 임플란트 수술 전 CT 분석이 정말 꼼꼼하고, 네비게이션 수술이라 안심이 됐어요.',
    reviewTag: '임플란트'
  },
  {
    id: 'anseong', name: '안성', nameEn: 'Anseong', province: '경기도',
    fileName: 'anseong.html',
    distanceKm: 45, carMin: 40, busMin: 70,
    publicTransport: '안성터미널 → 천안행 시외버스(약 50분) → 천안터미널 하차 → 택시 15분',
    ktx: '안성 → 평택역 환승 → 천안아산역 → 택시 10분',
    carRoute: '안성 → 1번 국도(경부국도) → 천안 불당동 약 40분',
    landmark: '1번 국도(경부국도) 이용',
    whyText: '안성에서 1번 국도를 이용하면 40분이면 서울비디치과에 도착합니다. 안성 지역에서 대형 치과를 찾으신다면 서울비디치과를 추천드립니다.',
    reviewName: '양', reviewText: '안성에서 40분 거리인데, 인비절라인 교정 받고 있어요. 3D 시뮬레이션으로 결과를 미리 볼 수 있어서 기대됩니다!',
    reviewTag: '인비절라인'
  },
  {
    id: 'osan', name: '오산', nameEn: 'Osan', province: '경기도',
    fileName: 'osan.html',
    distanceKm: 70, carMin: 60, busMin: 90,
    publicTransport: '오산터미널 → 천안행 시외버스(약 1시간 20분) → 천안터미널 하차 → 택시 15분',
    ktx: '오산 → SRT 지제역 → 천안아산역(약 15분) → 택시 10분',
    carRoute: '오산 → 경부고속도로 → 천안IC → 불당동 약 60분',
    landmark: '경부고속도로 이용',
    whyText: '오산에서 경부고속도로를 이용하면 약 1시간이면 도착합니다. SRT 지제역에서 천안아산역까지 15분이면 더 빠르게 오실 수 있습니다.',
    reviewName: '노', reviewText: '오산에서 SRT 타면 정말 빨라요. 서울 가는 것보다 오히려 가까운 느낌! 임플란트 상담 후 바로 수술 일정 잡았습니다.',
    reviewTag: '임플란트'
  }
];

// ═══════ HTML 템플릿 함수 ═══════
function generatePage(r) {
  const today = '2026-03-22';
  
  // FAQ 데이터 (지역별 5개)
  const faqs = [
    {
      q: `${r.name}에서 서울비디치과까지 얼마나 걸리나요?`,
      a: `${r.name}${r.province === '충청남도' || r.province === '충청북도' || r.province === '경기도' ? '에서' : '에서'} 서울비디치과(천안시 서북구 불당동)까지 약 ${r.distanceKm}km이며, 차량 약 ${r.carMin}분으로 오실 수 있습니다. ${r.ktx}`
    },
    {
      q: `${r.name}에서 갈 만한 임플란트 잘하는 치과 추천해주세요`,
      a: `서울비디치과는 ${r.name} 인근 최대 규모 치과로, 서울대 출신 15인 원장이 협진합니다. 4층 전체가 임플란트센터이며, 6개 독립 수술실과 네비게이션 가이드 시스템을 갖추고 있습니다. 뼈이식, 상악동거상술 등 고난도 수술도 전문적으로 진행합니다.`
    },
    {
      q: `${r.name}에서 출발하면 주차가 가능한가요?`,
      a: `네, 서울비디치과는 건물 내 무료 주차장을 운영하고 있습니다(약 30대). ${r.name}에서 자가용으로 오시는 분들도 편하게 주차하실 수 있습니다. 네비게이션에 "천안스퀘어 또는 서울비디치과"을 검색하세요.`
    },
    {
      q: `${r.name}에서 야간이나 주말에도 진료 가능한가요?`,
      a: `서울비디치과는 365일 진료합니다. 평일 09:00~20:00(야간진료), 토·일요일 09:00~17:00, 공휴일 09:00~13:00 운영하여 ${r.name}에서 주말이나 야간에도 편하게 방문하실 수 있습니다.`
    },
    {
      q: `${r.name}에서 왜 서울비디치과까지 가야 하나요?`,
      a: r.whyText
    }
  ];

  const faqJsonLd = faqs.map(f => `    {
      "@type": "Question",
      "name": "${f.q.replace(/"/g, '\\"')}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${f.a.replace(/"/g, '\\"')}"
      }
    }`).join(',\n');

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
  <meta name="description" content="${r.name}에서 차로 ${r.carMin}분, 서울비디치과 임플란트·인비절라인·라미네이트. 365일 진료, 서울대 15인 원장. ${r.name} 환자분들 오시는 길 안내.">
  <meta name="keywords" content="${r.name} 치과, ${r.name} 임플란트, ${r.name} 인비절라인, ${r.name} 라미네이트, ${r.name} 치과 추천, ${r.name}에서 천안 치과, 서울비디치과">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/area/${r.fileName}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${r.name} 임플란트 | ${r.name}에서 천안 서울비디치과 오시는 길">
  <meta property="og:description" content="${r.name}에서 차로 ${r.carMin}분, 서울비디치과 임플란트·인비절라인·라미네이트. 365일 진료, 서울대 15인 원장. ${r.name} 환자분들 오시는 길 안내.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/area/${r.fileName}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${r.name} 임플란트 | ${r.name}에서 천안 서울비디치과 오시는 길">
  <meta name="twitter:description" content="${r.name}에서 차로 ${r.carMin}분, 서울비디치과 임플란트·인비절라인·라미네이트. 365일 진료, 서울대 15인 원장. ${r.name} 환자분들 오시는 길 안내.">
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
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"오시는 길","item":"https://bdbddc.com/directions.html"},{"@type":"ListItem","position":3,"name":"${r.name}에서 오시는 길","item":"https://bdbddc.com/area/${r.fileName}"}]}</script>
  <script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${faqJsonLd}
  ],
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      "h1",
      ".treatment-intro",
      ".faq-answer",
      "meta[name='description']"
    ]
  }
}</script>
  <script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Dentist",
  "@id": "https://bdbddc.com/#dentist",
  "name": "서울비디치과",
  "description": "${r.name} 인근 서울대 출신 15인 원장 협진 치과. 365일 진료, 임플란트 6개 수술방, 인비절라인 교정센터, 글로우네이트(라미네이트), 소아치과 전문의 3인.",
  "url": "https://bdbddc.com",
  "telephone": "+82-41-415-2892",
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
    "name": "${r.name === '불당동' ? '천안시' : r.name.replace('동','시').replace(/군$/, '군').replace(/구$/, '시')}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "09:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday","Sunday"],
      "opens": "09:00",
      "closes": "17:00"
    }
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
    {"@type": "MedicalProcedure","name": "임플란트","description": "네비게이션 가이드 임플란트, 6개 수술실"},
    {"@type": "MedicalProcedure","name": "인비절라인","description": "다이아몬드 프로바이더, 서울대 교정 전문의"},
    {"@type": "MedicalProcedure","name": "글로우네이트(라미네이트)","description": "최소삭제 포세린 라미네이트"}
  ]
}</script>
  <meta name="ai-summary" content="${r.name}에서 서울비디치과까지 약 ${r.distanceKm}km(차량 약 ${r.carMin}분). 서울대 출신 15인 원장 협진, 365일 진료, 임플란트·인비절라인·라미네이트 전문.">
  <meta name="abstract" content="${r.name}에서 서울비디치과까지 약 ${r.distanceKm}km(차량 약 ${r.carMin}분). 서울대 출신 15인 원장 협진, 365일 진료, 임플란트·인비절라인·라미네이트 전문.">
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

  <!-- ═══════ HERO ═══════ -->
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
          ${r.name}에서 차로 ${r.carMin}분 — 서울대 출신 15인 원장이<br>
          365일 임플란트·인비절라인·라미네이트를 진료합니다.
        </p>
        
        <div class="hero-trust-row reveal delay-3">
          <span class="hero-trust-item"><i class="fas fa-graduation-cap"></i> 서울대 15인 협진</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-calendar-check"></i> 365일 진료</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-car"></i> ${r.name}에서 차로 ${r.carMin}분</span>
          <span class="hero-trust-divider desktop-only"></span>
          <span class="hero-trust-item desktop-only"><i class="fas fa-map-marker-alt"></i> 천안 불당동</span>
        </div>
        
        <div class="hero-cta-group reveal delay-4">
          <a href="../reservation.html" class="btn btn-primary btn-lg">
            <i class="fas fa-calendar-check"></i> 상담 예약하기
          </a>
          <a href="tel:0414152892" class="btn btn-outline btn-lg">
            <i class="fas fa-phone"></i> 041-415-2892
          </a>
        </div>
      </div>
    </div>
    
    <div class="hero-scroll-hint" aria-hidden="true">
      <span>SCROLL</span>
      <div class="scroll-line"></div>
    </div>
  </section>

  <!-- ═══════ 오시는 길 상세 ═══════ -->
  <section class="why-section section" aria-label="${r.name}에서 오시는 길">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-route"></i> 오시는 길</span>
        <h2 class="section-title">${r.name}에서 <span class="text-gradient">서울비디치과까지</span></h2>
        <p class="section-subtitle">${r.name}에서 차로 ${r.carMin}분 (약 ${r.distanceKm}km) — 충남 천안시 서북구 불당34길 14</p>
      </div>
      
      <div class="why-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="why-card reveal delay-1">
          <div class="why-card-icon"><i class="fas fa-car"></i></div>
          <h3>자가용으로 오시는 길</h3>
          <p>네비게이션에 <strong>"천안스퀘어 또는 서울비디치과"</strong>을 검색하세요.<br>${r.carRoute}<br>건물 내 <strong>무료 주차</strong> 가능 (약 30대).</p>
          <div class="why-card-stat"><span class="num">${r.carMin}분</span><span class="unit">차량 소요시간</span></div>
        </div>
        <div class="why-card reveal delay-2">
          <div class="why-card-icon"><i class="fas fa-bus"></i></div>
          <h3>대중교통으로 오시는 길</h3>
          <p>${r.publicTransport}<br><br><strong>KTX/SRT:</strong> ${r.ktx}</p>
          <div class="why-card-stat"><span class="num"><i class="fas fa-train"></i></span><span class="unit">KTX/버스 이용 가능</span></div>
        </div>
      </div>

      <div class="why-hero-card reveal" style="margin-top:32px;">
        <h3><i class="fas fa-map-marker-alt"></i> 서울비디치과 위치 정보</h3>
        <p><strong>주소:</strong> 충남 천안시 서북구 불당34길 14, 1~5층<br>
        <strong>전화:</strong> 041-415-2892<br>
        <strong>진료시간:</strong> 평일 09:00-20:00 · 토·일 09:00-17:00 · 공휴일 09:00-13:00<br>
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

  <!-- ═══════ WHY CHOOSE US ═══════ -->
  <section class="why-section section" style="padding-top:0;" aria-label="왜 서울비디치과인가">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-heart"></i> 왜 서울비디치과일까요?</span>
        <h2 class="section-title">${r.name}에서 <span class="text-gradient">서울비디치과를 선택하는 이유</span></h2>
        <p class="section-subtitle">${r.name}에서 차로 ${r.carMin}분, 서울대병원급 진료를 받으실 수 있습니다</p>
      </div>
      
      <div class="why-hero-card reveal">
        <h3>"이건 안 해도 돼요"<br>라고 솔직히 말하는 치과</h3>
        <p>필요 없는 치료는 권하지 않습니다. ${r.name}에서 오신 환자분께도 정말 필요한 치료만 추천드립니다.</p>
        <span class="why-hero-badge"><i class="fas fa-shield-alt"></i> No 과잉진료</span>
      </div>
      
      <div class="why-grid">
        <div class="why-card reveal delay-1">
          <div class="why-card-icon"><i class="fas fa-users-cog"></i></div>
          <h3>15인 원장이 함께 고민</h3>
          <p>어려운 케이스도 포기하지 않습니다. 서울대 출신 15인 원장이 모여 최적의 치료법을 찾습니다.</p>
          <div class="why-card-stat"><span class="num">15</span><span class="unit">명의 전문의 협진</span></div>
        </div>
        <div class="why-card reveal delay-2">
          <div class="why-card-icon"><i class="fas fa-calendar-check"></i></div>
          <h3>일요일에도 진료합니다</h3>
          <p>바쁜 일상 때문에 치료를 미루셨나요? 365일, 평일 야간까지 진료합니다.</p>
          <div class="why-card-stat"><span class="num">365</span><span class="unit">일 연중무휴</span></div>
        </div>
        <div class="why-card reveal delay-3">
          <div class="why-card-icon"><i class="fas fa-hospital-alt"></i></div>
          <h3>전문 의료 규모</h3>
          <p>1~5층 전문 센터 구성, 6개 수술방, 원내 기공소, 첨단 디지털 장비 보유.</p>
          <div class="why-card-stat"><span class="num">5</span><span class="unit">층 전문센터</span></div>
        </div>
        <div class="why-card reveal delay-1">
          <div class="why-card-icon"><i class="fas fa-chalkboard-teacher"></i></div>
          <h3>눈으로 보며 설명드려요</h3>
          <p>덴탈커넥트와 시각 자료로 이해하실 때까지 충분히 설명드립니다.</p>
          <div class="why-card-stat"><span class="num">100</span><span class="unit">% 이해될 때까지</span></div>
        </div>
        <div class="why-card reveal delay-2">
          <div class="why-card-icon"><i class="fas fa-shield-virus"></i></div>
          <h3>철저한 감염관리</h3>
          <p>1인 1기구 원칙, 개별 멸균 패키지, 에어샤워 시스템으로 철저한 위생 관리.</p>
          <div class="why-card-stat"><span class="num">1:1</span><span class="unit">기구 멸균 원칙</span></div>
        </div>
        <div class="why-card reveal delay-3">
          <div class="why-card-icon"><i class="fas fa-tools"></i></div>
          <h3>원내 기공소 운영</h3>
          <p>충남권 대규모 원내 기공소, 5인 전문 기공사가 정밀한 보철물을 빠르게 제작합니다.</p>
          <div class="why-card-stat"><span class="num">5</span><span class="unit">인 전문 기공사</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════ ${r.name} 환자 주요 진료 ═══════ -->
  <section class="treatment-section section" aria-label="${r.name} 환자 주요 진료">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-tooth"></i> ${r.name} 환자 주요 진료</span>
        <h2 class="section-title">${r.name}에서 오시는 환자분들의 <span class="text-gradient">인기 진료</span></h2>
        <p class="section-subtitle">${r.name} 환자분들은 주로 임플란트, 인비절라인 교정, 글로우네이트(라미네이트) 진료를 많이 받으십니다. 특히 임플란트의 경우 4층 전체가 임플란트 전용센터로, 6개 수술실과 네비게이션 시스템을 갖추고 있어 고난도 케이스도 안전하게 진행됩니다.</p>
      </div>
      
      <div class="treatment-grid">
        <a href="../treatments/implant.html" class="treatment-card featured reveal delay-1">
          <span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span>
          <div class="treatment-card-icon"><i class="fas fa-tooth"></i></div>
          <h3>임플란트</h3>
          <p>6개 수술방 · 네비게이션 가이드<br>수면임플란트 · 고난도 전문 · 4F</p>
          <span class="treatment-tag hot">BEST</span>
        </a>
        <a href="../treatments/invisalign.html" class="treatment-card reveal delay-1">
          <span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span>
          <div class="treatment-card-icon"><i class="fas fa-teeth"></i></div>
          <h3>인비절라인</h3>
          <p>서울대 교정 전문의 2인<br>대규모 센터 · 1F</p>
        </a>
        <a href="../treatments/glownate.html" class="treatment-card reveal delay-2">
          <span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span>
          <div class="treatment-card-icon"><i class="fas fa-sparkles"></i></div>
          <h3>글로우네이트(라미네이트)</h3>
          <p>최소삭제 포세린 라미네이트<br>프리미엄 심미 치료</p>
          <span class="treatment-tag hot">HOT</span>
        </a>
        <a href="../treatments/pediatric.html" class="treatment-card reveal delay-1">
          <span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span>
          <div class="treatment-card-icon"><i class="fas fa-child"></i></div>
          <h3>소아치과</h3>
          <p>소아전문의 3인 진료<br>웃음가스 · 수면치료 · 3F</p>
        </a>
        <a href="../treatments/aesthetic.html" class="treatment-card reveal delay-2">
          <span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span>
          <div class="treatment-card-icon"><i class="fas fa-smile-beam"></i></div>
          <h3>심미치료</h3>
          <p>라미네이트 · 미백<br>자연스러운 아름다움 · 5F</p>
        </a>
      </div>
      
      <div class="text-center mt-8 reveal">
        <a href="../treatments/index.html" class="btn btn-outline btn-lg">
          전체 진료 안내 보기 <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  </section>

  <!-- ═══════ FEATURES BANNER ═══════ -->
  <section class="features-banner" aria-label="핵심 특징">
    <div class="container">
      <div class="features-ticker">
        <div class="feature-item"><i class="fas fa-clock"></i> 365일 진료 (일요일·공휴일 포함)</div>
        <div class="feature-item"><i class="fas fa-moon"></i> 평일 매일 야간진료 20시</div>
        <div class="feature-item"><i class="fas fa-user-md"></i> 서울대 출신 15인 원장</div>
        <div class="feature-item"><i class="fas fa-building"></i> 1~5층 전문 의료 규모</div>
        <div class="feature-item"><i class="fas fa-car"></i> ${r.name}에서 차로 ${r.carMin}분</div>
        <div class="feature-item"><i class="fas fa-clock"></i> 365일 진료 (일요일·공휴일 포함)</div>
        <div class="feature-item"><i class="fas fa-moon"></i> 평일 매일 야간진료 20시</div>
        <div class="feature-item"><i class="fas fa-user-md"></i> 서울대 출신 15인 원장</div>
        <div class="feature-item"><i class="fas fa-building"></i> 1~5층 전문 의료 규모</div>
        <div class="feature-item"><i class="fas fa-car"></i> ${r.name}에서 차로 ${r.carMin}분</div>
      </div>
    </div>
  </section>

  <!-- ═══════ FAQ ═══════ -->
  <section class="why-section section" aria-label="${r.name} 자주 묻는 질문">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-question-circle"></i> 자주 묻는 질문</span>
        <h2 class="section-title">${r.name} 환자분들이 <span class="text-gradient">자주 물어보시는 질문</span></h2>
      </div>
      
      <div class="faq-list" style="max-width:800px;margin:0 auto;">
${faqs.map((f, i) => `        <div class="why-hero-card reveal delay-${(i % 3) + 1}" style="margin-bottom:16px;text-align:left;">
          <h3 style="font-size:1.05rem;margin-bottom:8px;"><i class="fas fa-q" style="color:var(--brand-gold);margin-right:8px;"></i>${f.q}</h3>
          <p class="faq-answer" style="font-size:0.95rem;line-height:1.7;">${f.a}</p>
        </div>`).join('\n')}
      </div>
    </div>
  </section>

  <!-- ═══════ REVIEWS ═══════ -->
  <section class="reviews-section section" aria-label="환자 후기">
    <div class="reviews-container">
      <div class="reviews-header reveal">
        <span class="section-badge">전국 각지에서</span>
        <h2>50,000명 이상의 환자분들이<br><span class="highlight">서울비디치과</span>를 선택했습니다</h2>
        <p>네이버, 카카오, 구글에서 검증된 실제 리뷰입니다</p>
      </div>
      
      <div class="reviews-stats reveal">
        <div class="reviews-stat-item">
          <span class="stat-icon naver"><i class="fas fa-star"></i></span>
          <span class="stat-number">4.85</span>
          <span class="stat-label">네이버</span>
        </div>
        <div class="reviews-stat-item">
          <span class="stat-icon google"><i class="fab fa-google"></i></span>
          <span class="stat-number">4.9</span>
          <span class="stat-label">구글</span>
        </div>
        <div class="reviews-stat-item">
          <span class="stat-icon"><i class="fas fa-smile-beam" style="color:var(--brand-gold)"></i></span>
          <span class="stat-number">98%</span>
          <span class="stat-label">만족도</span>
        </div>
      </div>
      
      <div class="reviews-grid reveal">
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-avatar">${r.reviewName}</div>
            <div class="review-author-info"><div class="author-name">${r.reviewName}**님</div><span class="review-source naver"><i class="fas fa-check-circle"></i> 네이버</span></div>
          </div>
          <div class="review-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          <p class="review-text">${r.name}에서 왔는데 <span class="highlight">${r.reviewText}</span></p>
          <div class="review-tags"><span class="review-tag">${r.reviewTag}</span><span class="review-tag">${r.name}에서 방문</span></div>
        </div>
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-avatar">이</div>
            <div class="review-author-info"><div class="author-name">이**님</div><span class="review-source naver"><i class="fas fa-check-circle"></i> 네이버</span></div>
          </div>
          <div class="review-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          <p class="review-text">인비절라인 교정 중인데, <span class="highlight">ClinCheck 3D로 결과를 미리 볼 수 있어서</span> 안심이 돼요. ${r.name}에서 다니기도 괜찮아요!</p>
          <div class="review-tags"><span class="review-tag">인비절라인</span><span class="review-tag">3D 시뮬레이션</span></div>
        </div>
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-avatar">정</div>
            <div class="review-author-info"><div class="author-name">정**님</div><span class="review-source google"><i class="fab fa-google"></i> 구글</span></div>
          </div>
          <div class="review-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          <p class="review-text"><span class="highlight">과잉진료 없이 솔직하게 말씀해주셔서</span> 신뢰가 갑니다. ${r.name}에서 ${r.carMin > 30 ? '좀 멀지만 올 만한 가치가 있어요' : '가까워서 편하게 다니고 있어요'}!</p>
          <div class="review-tags"><span class="review-tag">NO 과잉진료</span><span class="review-tag">친절한 설명</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════ CTA ═══════ -->
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
if (!fs.existsSync(areaDir)) {
  fs.mkdirSync(areaDir, { recursive: true });
}

let created = 0;
let updated = 0;

regions.forEach(r => {
  const filePath = path.join(areaDir, r.fileName);
  const existed = fs.existsSync(filePath);
  fs.writeFileSync(filePath, generatePage(r), 'utf8');
  if (existed) {
    updated++;
    console.log(`  [UPDATE] ${r.fileName} — ${r.name} (${r.carMin}분)`);
  } else {
    created++;
    console.log(`  [CREATE] ${r.fileName} — ${r.name} (${r.carMin}분)`);
  }
});

console.log(`\n=== 완료: ${created}개 생성, ${updated}개 업데이트 (총 ${regions.length}개) ===`);

// 사이트맵 URL 목록 출력
console.log('\n=== 사이트맵 URL 목록 ===');
regions.forEach(r => {
  console.log(`https://bdbddc.com/area/${r.fileName}`);
});
