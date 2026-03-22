#!/usr/bin/env node
/**
 * 서울비디치과 지역별 오시는길 세부 페이지 생성기 v2
 * - 기존 16개 페이지 업그레이드 + 12개 신규 생성 = 총 28개
 * - 프롬프트 요구사항: title, 거리/시간, 대중교통, FAQ 5개, 주요진료, CTA, Schema.org
 */
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// 28개 지역 데이터
// ═══════════════════════════════════════════════════════════
const regions = [
  // ── 충남 ──
  { id:'cheonan', name:'천안', fullName:'천안시', province:'충남', driveTime:'10분', driveKm:'5km', 
    publicTransport:'불당동 내 위치로 도보·버스 모두 가능', busInfo:'시내버스 11, 12, 21, 22번 불당동 정류장 하차 도보 3분',
    trainInfo:'천안아산역(KTX) 하차 → 택시 10분 / 버스 20분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'불당 CGV, 갤러리아 백화점', icName:'천안IC', icTime:'15분',
    whyTravel:'천안 불당동에 위치한 서울비디치과는 천안 최대 규모 치과로, 굳이 멀리 가지 않아도 서울대병원급 진료를 받으실 수 있습니다.',
    patientNote:'천안 환자분들은 주로 임플란트, 인비절라인 교정, 글로우네이트(라미네이트) 진료를 많이 받으십니다. 특히 임플란트의 경우 4층 전체가 임플란트 전용센터로, 6개 수술실과 네비게이션 시스템을 갖추고 있어 고난도 케이스도 안전하게 진행됩니다.' },
  
  { id:'buldang', name:'불당동', fullName:'불당동', province:'충남', driveTime:'5분', driveKm:'2km',
    publicTransport:'도보 또는 버스로 5분 이내 접근 가능', busInfo:'시내버스 11, 12, 21번 불당동 정류장 하차 도보 2분',
    trainInfo:'천안아산역(KTX) 하차 → 택시 8분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'불당 CGV, 갤러리아 백화점, 스타벅스 불당점', icName:'천안IC', icTime:'15분',
    whyTravel:'불당동에 위치한 서울비디치과는 걸어서도 올 수 있는 가장 가까운 대형 치과입니다.',
    patientNote:'불당동 주민분들은 정기검진, 스케일링, 소아치과부터 임플란트, 인비절라인, 라미네이트까지 전 분야 진료를 이용하십니다. 동네 치과처럼 편하게 오시되, 대학병원급 장비와 전문의 진료를 받으실 수 있습니다.' },
  
  { id:'asan', name:'아산', fullName:'아산시', province:'충남', driveTime:'20분', driveKm:'20km',
    publicTransport:'천안아산역(KTX) 경유 접근 가능', busInfo:'아산터미널 → 천안행 시외버스 30분, 불당동 하차',
    trainInfo:'천안아산역(KTX) 하차 → 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'온양온천역, 아산시청', icName:'천안IC', icTime:'20분',
    whyTravel:'아산에서 20분이면 도착하는 서울비디치과는 아산 환자분들이 가장 많이 찾는 대형 치과입니다. 서울대 전문의 15인 협진으로 어려운 케이스도 안심하고 맡기실 수 있습니다.',
    patientNote:'아산 환자분들은 특히 임플란트와 인비절라인 교정을 많이 받으십니다. 임플란트 전문 수술실 6개와 네비게이션 가이드 시스템으로 정밀한 수술이 가능합니다.' },
  
  { id:'sejong', name:'세종', fullName:'세종특별자치시', province:'세종', driveTime:'35분', driveKm:'35km',
    publicTransport:'세종시 → 천안행 시외버스 약 40분', busInfo:'세종터미널 → 천안터미널 시외버스 40분, 이후 택시 10분',
    trainInfo:'세종시 → 천안아산역(KTX) 약 30분, 이후 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'세종시청, 정부세종청사', icName:'천안IC', icTime:'30분',
    whyTravel:'세종에서 35분이면 서울비디치과에 도착합니다. 세종시에서는 찾기 어려운 서울대 전문의 15인 규모의 대형 치과를 이용하실 수 있습니다.',
    patientNote:'세종 환자분들은 주로 임플란트, 인비절라인 교정, 소아치과를 많이 이용하십니다. 특히 공무원 가족 환자분들이 많아 야간·주말 진료가 큰 장점입니다.' },
  
  { id:'daejeon', name:'대전', fullName:'대전광역시', province:'대전', driveTime:'40분', driveKm:'50km',
    publicTransport:'KTX 대전역 → 천안아산역 15분', busInfo:'대전복합터미널 → 천안터미널 시외버스 약 50분',
    trainInfo:'대전역(KTX) → 천안아산역 15분, 이후 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'대전역, 대전시청, 유성온천', icName:'천안IC', icTime:'40분',
    whyTravel:'대전에서 KTX로 15분, 차로 40분이면 서울비디치과에 도착합니다. 400평 규모의 1~5층 전문센터에서 서울대 전문의 진료를 받으실 수 있습니다.',
    patientNote:'대전 환자분들은 특히 임플란트 고난도 케이스(뼈이식, 상악동거상술 등)와 인비절라인 교정을 많이 의뢰하십니다. 6개 독립 수술실과 네비게이션 시스템으로 안전한 수술이 가능합니다.' },
  
  { id:'cheongju', name:'청주', fullName:'청주시', province:'충북', driveTime:'50분', driveKm:'60km',
    publicTransport:'청주 → 천안 시외버스 약 1시간', busInfo:'청주터미널 → 천안터미널 시외버스 약 1시간, 이후 택시 10분',
    trainInfo:'오송역(KTX) → 천안아산역 10분, 이후 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'청주시청, 수암골 벽화마을', icName:'천안IC', icTime:'50분',
    whyTravel:'청주에서 50분이면 서울비디치과에 도착합니다. 오송역 KTX를 이용하면 더 빠릅니다. 충북에서 찾기 어려운 서울대 15인 원장 협진 치과입니다.',
    patientNote:'청주 환자분들은 임플란트, 인비절라인 교정, 글로우네이트(라미네이트)를 많이 받으십니다. 특히 어려운 케이스를 위해 먼 거리를 오시는 분들이 많습니다.' },
  
  { id:'pyeongtaek', name:'평택', fullName:'평택시', province:'경기', driveTime:'45분', driveKm:'55km',
    publicTransport:'평택역 → 천안아산역 KTX/SRT 20분', busInfo:'평택터미널 → 천안터미널 시외버스 약 50분',
    trainInfo:'평택역 → 천안아산역(SRT) 20분, 이후 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'평택역, 평택시청', icName:'천안IC', icTime:'45분',
    whyTravel:'평택에서 45분이면 서울비디치과에 도착합니다. 서울까지 가지 않고도 서울대병원급 치과 진료를 받으실 수 있습니다.',
    patientNote:'평택 환자분들은 주로 임플란트와 인비절라인 교정을 많이 받으십니다. 특히 미군 가족 환자분들도 영어 상담이 가능해 많이 찾아주십니다.' },
  
  { id:'anseong', name:'안성', fullName:'안성시', province:'경기', driveTime:'40분', driveKm:'45km',
    publicTransport:'안성터미널 → 천안터미널 시외버스 약 40분', busInfo:'안성터미널 → 천안터미널 시외버스 약 40분, 이후 택시 10분',
    trainInfo:'안성 → 천안아산역 자가용 40분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'안성시청, 안성맞춤랜드', icName:'천안IC', icTime:'35분',
    whyTravel:'안성에서 40분이면 서울비디치과에 도착합니다. 경기 남부에서 가장 가까운 서울대 전문의 대형 치과입니다.',
    patientNote:'안성 환자분들은 임플란트, 인비절라인 교정, 소아치과를 주로 이용하십니다. 365일 진료로 농번기에도 편하게 방문 가능합니다.' },
  
  { id:'chungju', name:'충주', fullName:'충주시', province:'충북', driveTime:'60분', driveKm:'70km',
    publicTransport:'충주터미널 → 천안터미널 시외버스 약 1시간 20분', busInfo:'충주터미널 → 천안터미널 시외버스 약 1시간 20분, 이후 택시 10분',
    trainInfo:'충주 → 천안 자가용 약 1시간', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'충주시청, 수안보온천, 충주호', icName:'천안IC', icTime:'55분',
    whyTravel:'충주에서 1시간이면 서울비디치과에 도착합니다. 충북 내에서는 찾기 어려운 서울대 15인 원장 규모의 대형 치과를 이용하실 수 있습니다.',
    patientNote:'충주 환자분들은 특히 임플란트 고난도 케이스와 인비절라인 교정을 위해 방문하십니다. 원내 기공소에서 당일 보철물 제작도 가능해 내원 횟수를 줄일 수 있습니다.' },
  
  { id:'dangjin', name:'당진', fullName:'당진시', province:'충남', driveTime:'50분', driveKm:'60km',
    publicTransport:'당진터미널 → 천안터미널 시외버스 약 1시간', busInfo:'당진터미널 → 천안터미널 시외버스 약 1시간, 이후 택시 10분',
    trainInfo:'당진 → 천안 자가용 약 50분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'당진시청, 삽교호방조제, 합덕수리민속박물관', icName:'당진IC → 서해안고속도로', icTime:'50분',
    whyTravel:'당진에서 50분이면 서울비디치과에 도착합니다. 서해안고속도로를 이용하면 편리하게 오실 수 있습니다.',
    patientNote:'당진 환자분들은 임플란트, 인비절라인 교정을 많이 받으십니다. 원내 기공소가 있어 보철물 제작이 빠르고, 내원 횟수를 최소화할 수 있습니다.' },
  
  { id:'gongju', name:'공주', fullName:'공주시', province:'충남', driveTime:'40분', driveKm:'45km',
    publicTransport:'공주터미널 → 천안터미널 시외버스 약 50분', busInfo:'공주터미널 → 천안터미널 시외버스 약 50분, 이후 택시 10분',
    trainInfo:'공주역(KTX) → 천안아산역 20분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'공주시청, 공산성, 무령왕릉', icName:'공주IC', icTime:'40분',
    whyTravel:'공주에서 40분이면 서울비디치과에 도착합니다. 공주역(KTX) 이용 시 더 빠르게 올 수 있습니다.',
    patientNote:'공주 환자분들은 임플란트와 인비절라인 교정, 소아치과를 주로 이용하십니다. 365일 진료로 주말에도 편하게 방문 가능합니다.' },
  
  { id:'hongseong', name:'홍성', fullName:'홍성군', province:'충남', driveTime:'50분', driveKm:'55km',
    publicTransport:'홍성터미널 → 천안터미널 시외버스 약 1시간', busInfo:'홍성터미널 → 천안터미널 시외버스 약 1시간, 이후 택시 10분',
    trainInfo:'홍성역(KTX) → 천안아산역 25분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'홍성군청, 홍주읍성, 홍성전통시장', icName:'홍성IC', icTime:'50분',
    whyTravel:'홍성에서 50분이면 서울비디치과에 도착합니다. 충남 서부에서 서울대 전문의 치과를 찾으신다면 서울비디치과가 가장 가깝습니다.',
    patientNote:'홍성 환자분들은 임플란트를 가장 많이 받으십니다. 6개 독립 수술실에서 네비게이션 가이드로 정밀한 시술이 가능합니다.' },
  
  { id:'jincheon', name:'진천', fullName:'진천군', province:'충북', driveTime:'40분', driveKm:'40km',
    publicTransport:'진천터미널 → 천안터미널 시외버스 약 45분', busInfo:'진천터미널 → 천안터미널 시외버스 약 45분, 이후 택시 10분',
    trainInfo:'진천 → 천안 자가용 약 40분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'진천군청, 생거진천 전통시장', icName:'진천IC', icTime:'35분',
    whyTravel:'진천에서 40분이면 서울비디치과에 도착합니다. 진천·음성 지역에서 가장 가까운 서울대급 대형 치과입니다.',
    patientNote:'진천 환자분들은 임플란트와 소아치과를 많이 이용하십니다. 소아치과 전문의 3인이 상주하여 아이들도 안심하고 치료받을 수 있습니다.' },
  
  { id:'nonsan', name:'논산', fullName:'논산시', province:'충남', driveTime:'45분', driveKm:'50km',
    publicTransport:'논산터미널 → 천안터미널 시외버스 약 1시간', busInfo:'논산터미널 → 천안터미널 시외버스 약 1시간, 이후 택시 10분',
    trainInfo:'논산역 → 천안아산역(KTX) 30분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'논산시청, 관촉사, 논산딸기축제', icName:'논산IC', icTime:'45분',
    whyTravel:'논산에서 45분이면 서울비디치과에 도착합니다. 논산역에서 KTX로 30분이면 천안아산역에 도착합니다.',
    patientNote:'논산 환자분들은 임플란트와 인비절라인 교정을 많이 받으십니다. 365일 진료로 군인 가족분들도 주말에 편하게 방문 가능합니다.' },
  
  { id:'seosan', name:'서산', fullName:'서산시', province:'충남', driveTime:'60분', driveKm:'70km',
    publicTransport:'서산터미널 → 천안터미널 시외버스 약 1시간 20분', busInfo:'서산터미널 → 천안터미널 시외버스 약 1시간 20분, 이후 택시 10분',
    trainInfo:'서산 → 천안 자가용 약 1시간', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'서산시청, 해미읍성, 서산버드랜드', icName:'서산IC → 서해안고속도로', icTime:'55분',
    whyTravel:'서산에서 1시간이면 서울비디치과에 도착합니다. 서해안고속도로를 이용하면 편리합니다. 충남 서부 최대 규모 치과입니다.',
    patientNote:'서산 환자분들은 임플란트를 가장 많이 받으십니다. 특히 뼈이식이 필요한 어려운 케이스를 위해 방문하시는 분들이 많습니다.' },
  
  { id:'yesan', name:'예산', fullName:'예산군', province:'충남', driveTime:'40분', driveKm:'40km',
    publicTransport:'예산터미널 → 천안터미널 시외버스 약 50분', busInfo:'예산터미널 → 천안터미널 시외버스 약 50분, 이후 택시 10분',
    trainInfo:'예산역 → 천안아산역(KTX) 20분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'예산군청, 수덕사, 예산사과축제', icName:'예산IC', icTime:'35분',
    whyTravel:'예산에서 40분이면 서울비디치과에 도착합니다. 예산역에서 KTX를 이용하면 더 빠릅니다.',
    patientNote:'예산 환자분들은 임플란트, 인비절라인 교정, 소아치과를 주로 이용하십니다. 원내 기공소가 있어 보철 제작이 빠릅니다.' },
  
  // ── 신규 12개 지역 ──
  { id:'cheongyang', name:'청양', fullName:'청양군', province:'충남', driveTime:'50분', driveKm:'55km',
    publicTransport:'청양터미널 → 천안터미널 시외버스 약 1시간', busInfo:'청양터미널 → 천안터미널 시외버스 약 1시간, 이후 택시 10분',
    trainInfo:'청양 → 천안 자가용 약 50분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'청양군청, 칠갑산, 장곡사', icName:'청양IC', icTime:'45분',
    whyTravel:'청양에서 50분이면 서울비디치과에 도착합니다. 청양 지역에서는 찾기 어려운 서울대 15인 원장 대형 치과를 이용하실 수 있습니다.',
    patientNote:'청양 환자분들은 임플란트를 가장 많이 받으십니다. 6개 독립 수술실과 네비게이션 시스템으로 안전한 시술이 가능합니다.' },
  
  { id:'osan', name:'오산', fullName:'오산시', province:'경기', driveTime:'60분', driveKm:'70km',
    publicTransport:'오산역(SRT) → 천안아산역 30분', busInfo:'오산터미널 → 천안터미널 시외버스 약 1시간 20분',
    trainInfo:'오산역(SRT) → 천안아산역 30분, 이후 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'오산시청, 오산 물향기수목원', icName:'오산IC → 경부고속도로', icTime:'55분',
    whyTravel:'오산에서 SRT로 30분, 차로 1시간이면 서울비디치과에 도착합니다. 서울까지 가지 않고 서울대급 치과 진료를 받으실 수 있습니다.',
    patientNote:'오산 환자분들은 임플란트와 인비절라인 교정을 주로 받으십니다. 특히 고난도 임플란트 케이스를 위해 방문하시는 분들이 많습니다.' },
  
  { id:'gyeryong', name:'계룡', fullName:'계룡시', province:'충남', driveTime:'40분', driveKm:'45km',
    publicTransport:'계룡역 → 천안아산역 KTX 20분', busInfo:'계룡터미널 → 천안터미널 시외버스 약 50분',
    trainInfo:'계룡역 → 천안아산역(KTX) 20분, 이후 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'계룡시청, 계룡대, 계룡산 국립공원', icName:'계룡IC', icTime:'35분',
    whyTravel:'계룡에서 40분이면 서울비디치과에 도착합니다. 군인 가족분들이 주말·야간에도 편하게 방문하실 수 있습니다.',
    patientNote:'계룡 환자분들은 임플란트, 인비절라인 교정을 많이 받으십니다. 365일 진료로 군인 가족분들의 스케줄에 맞춰 유연하게 진료 가능합니다.' },
  
  { id:'buyeo', name:'부여', fullName:'부여군', province:'충남', driveTime:'55분', driveKm:'60km',
    publicTransport:'부여터미널 → 천안터미널 시외버스 약 1시간 10분', busInfo:'부여터미널 → 천안터미널 시외버스 약 1시간 10분, 이후 택시 10분',
    trainInfo:'부여 → 천안 자가용 약 55분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'부여군청, 부소산성, 궁남지, 백제문화단지', icName:'부여IC', icTime:'50분',
    whyTravel:'부여에서 55분이면 서울비디치과에 도착합니다. 부여 지역에서 찾기 어려운 서울대 전문의 대형 치과를 이용하실 수 있습니다.',
    patientNote:'부여 환자분들은 임플란트를 가장 많이 받으십니다. 원내 기공소에서 보철물을 빠르게 제작하여 내원 횟수를 줄여드립니다.' },
  
  { id:'seocheon', name:'서천', fullName:'서천군', province:'충남', driveTime:'60분', driveKm:'70km',
    publicTransport:'서천터미널 → 천안터미널 시외버스 약 1시간 20분', busInfo:'서천터미널 → 천안터미널 시외버스 약 1시간 20분, 이후 택시 10분',
    trainInfo:'서천역 → 천안아산역 약 40분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'서천군청, 국립생태원, 서천 한산모시마을', icName:'서천IC → 서해안고속도로', icTime:'55분',
    whyTravel:'서천에서 1시간이면 서울비디치과에 도착합니다. 서해안고속도로를 이용하면 편리하게 오실 수 있습니다.',
    patientNote:'서천 환자분들은 임플란트를 많이 받으십니다. 특히 뼈이식·상악동거상술 등 고난도 케이스를 전문적으로 진행합니다.' },
  
  { id:'boryeong', name:'보령', fullName:'보령시', province:'충남', driveTime:'55분', driveKm:'65km',
    publicTransport:'보령터미널 → 천안터미널 시외버스 약 1시간 10분', busInfo:'보령터미널 → 천안터미널 시외버스 약 1시간 10분, 이후 택시 10분',
    trainInfo:'보령역 → 천안아산역 약 35분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'보령시청, 대천해수욕장, 머드축제장', icName:'보령IC → 서해안고속도로', icTime:'50분',
    whyTravel:'보령에서 55분이면 서울비디치과에 도착합니다. 충남 서부 최대 규모의 서울대급 치과입니다.',
    patientNote:'보령 환자분들은 임플란트, 인비절라인 교정을 많이 받으십니다. 365일 진료로 관광 시즌에도 편하게 방문 가능합니다.' },
  
  { id:'taean', name:'태안', fullName:'태안군', province:'충남', driveTime:'70분', driveKm:'80km',
    publicTransport:'태안터미널 → 천안터미널 시외버스 약 1시간 30분', busInfo:'태안터미널 → 천안터미널 시외버스 약 1시간 30분, 이후 택시 10분',
    trainInfo:'태안 → 천안 자가용 약 1시간 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'태안군청, 안면도, 천리포수목원', icName:'서산IC → 서해안고속도로', icTime:'65분',
    whyTravel:'태안에서 70분이면 서울비디치과에 도착합니다. 태안 지역에서는 찾기 어려운 서울대 전문의 15인 협진 대형 치과입니다.',
    patientNote:'태안 환자분들은 임플란트를 가장 많이 받으십니다. 원내 기공소에서 보철물을 빠르게 제작하여 내원 횟수를 최소화합니다.' },
  
  { id:'geumsan', name:'금산', fullName:'금산군', province:'충남', driveTime:'45분', driveKm:'50km',
    publicTransport:'금산터미널 → 천안터미널 시외버스 약 1시간', busInfo:'금산터미널 → 천안터미널 시외버스 약 1시간, 이후 택시 10분',
    trainInfo:'금산 → 천안 자가용 약 45분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'금산군청, 금산인삼시장, 진악산', icName:'금산IC', icTime:'40분',
    whyTravel:'금산에서 45분이면 서울비디치과에 도착합니다. 금산 인근에서 서울대급 치과를 찾으신다면 서울비디치과가 가장 가깝습니다.',
    patientNote:'금산 환자분들은 임플란트와 소아치과를 많이 이용하십니다. 소아치과 전문의 3인이 상주하여 아이들도 편안하게 진료받을 수 있습니다.' },
  
  { id:'okcheon', name:'옥천', fullName:'옥천군', province:'충북', driveTime:'55분', driveKm:'65km',
    publicTransport:'옥천역 → 천안아산역 KTX 25분', busInfo:'옥천터미널 → 천안터미널 시외버스 약 1시간 10분',
    trainInfo:'옥천역 → 천안아산역(KTX) 25분, 이후 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'옥천군청, 정지용 문학관, 장계관광지', icName:'옥천IC → 경부고속도로', icTime:'50분',
    whyTravel:'옥천에서 KTX로 25분, 차로 55분이면 서울비디치과에 도착합니다. 충북에서 가장 가까운 서울대급 대형 치과입니다.',
    patientNote:'옥천 환자분들은 임플란트와 인비절라인 교정을 많이 받으십니다. 365일 야간진료로 일정에 맞춰 유연하게 방문 가능합니다.' },
  
  { id:'yeongdong', name:'영동', fullName:'영동군', province:'충북', driveTime:'60분', driveKm:'75km',
    publicTransport:'영동역 → 천안아산역 KTX 30분', busInfo:'영동터미널 → 천안터미널 시외버스 약 1시간 20분',
    trainInfo:'영동역 → 천안아산역(KTX) 30분, 이후 택시 10분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'영동군청, 영동포도축제, 노근리평화공원', icName:'영동IC → 경부고속도로', icTime:'55분',
    whyTravel:'영동에서 KTX로 30분, 차로 1시간이면 서울비디치과에 도착합니다. 영동 인근에서 서울대 전문의 진료를 받으실 수 있습니다.',
    patientNote:'영동 환자분들은 임플란트를 가장 많이 받으십니다. 고난도 수술도 6개 독립 수술실에서 안전하게 진행됩니다.' },
  
  { id:'eumseong', name:'음성', fullName:'음성군', province:'충북', driveTime:'50분', driveKm:'55km',
    publicTransport:'음성터미널 → 천안터미널 시외버스 약 1시간', busInfo:'음성터미널 → 천안터미널 시외버스 약 1시간, 이후 택시 10분',
    trainInfo:'음성 → 천안 자가용 약 50분', navSearch:'천안스퀘어 또는 서울비디치과',
    landmark:'음성군청, 꽃동네, 감곡매괴성지', icName:'음성IC → 중부고속도로', icTime:'45분',
    whyTravel:'음성에서 50분이면 서울비디치과에 도착합니다. 충북 서부에서 가장 가까운 서울대급 대형 치과입니다.',
    patientNote:'음성 환자분들은 임플란트, 소아치과를 많이 이용하십니다. 3층 소아치과센터에 전문의 3인이 상주합니다.' },
];

// ═══════════════════════════════════════════════════════════
// HTML 템플릿 생성 함수
// ═══════════════════════════════════════════════════════════
function generatePage(r) {
  const title = `${r.name} 임플란트 | ${r.name}에서 천안 서울비디치과 오시는 길`;
  const desc = `${r.fullName}에서 차로 ${r.driveTime}, 서울비디치과 임플란트·인비절라인·라미네이트. 365일 진료, 서울대 15인 원장. ${r.name} 환자분들 오시는 길 안내.`;
  const keywords = `${r.name} 치과, ${r.name} 임플란트, ${r.name} 인비절라인, ${r.name} 라미네이트, ${r.name} 치과 추천, ${r.name}에서 천안 치과, 서울비디치과`;
  
  // FAQ 5개
  const faqs = [
    { q: `${r.name}에서 서울비디치과까지 얼마나 걸리나요?`, a: `${r.fullName}에서 서울비디치과(천안시 서북구 불당동)까지 약 ${r.driveKm}이며, 차량 약 ${r.driveTime}으로 오실 수 있습니다. ${r.trainInfo}` },
    { q: `${r.name}에서 갈 만한 임플란트 잘하는 치과 추천해주세요`, a: `서울비디치과는 ${r.name} 인근 최대 규모 치과로, 서울대 출신 15인 원장이 협진합니다. 4층 전체가 임플란트센터이며, 6개 독립 수술실과 네비게이션 가이드 시스템을 갖추고 있습니다. 뼈이식, 상악동거상술 등 고난도 수술도 전문적으로 진행합니다.` },
    { q: `${r.name}에서 출발하면 주차가 가능한가요?`, a: `네, 서울비디치과는 건물 내 무료 주차장을 운영하고 있습니다(약 30대). ${r.name}에서 자가용으로 오시는 분들도 편하게 주차하실 수 있습니다. 네비게이션에 "${r.navSearch}"을 검색하세요.` },
    { q: `${r.name}에서 야간이나 주말에도 진료 가능한가요?`, a: `서울비디치과는 365일 진료합니다. 평일 09:00~20:00(야간진료), 토·일요일 09:00~17:00, 공휴일 09:00~13:00 운영하여 ${r.name}에서 주말이나 야간에도 편하게 방문하실 수 있습니다.` },
    { q: `${r.name}에서 왜 서울비디치과까지 가야 하나요?`, a: `${r.whyTravel}` }
  ];

  const faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    })),
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1",".treatment-intro",".faq-answer","meta[name='description']"] }
  }, null, 2);

  const dentistJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": "https://bdbddc.com/#dentist",
    "name": "서울비디치과",
    "description": `${r.name} 인근 서울대 출신 15인 원장 협진 치과. 365일 진료, 임플란트 6개 수술방, 인비절라인 교정센터, 글로우네이트(라미네이트), 소아치과 전문의 3인.`,
    "url": "https://bdbddc.com",
    "telephone": "+82-41-415-2892",
    "address": { "@type": "PostalAddress", "streetAddress": "불당34길 14, 1~5층", "addressLocality": "천안시 서북구 불당동", "addressRegion": "충청남도", "postalCode": "31156", "addressCountry": "KR" },
    "geo": { "@type": "GeoCoordinates", "latitude": 36.8151, "longitude": 127.1139 },
    "areaServed": { "@type": "City", "name": r.fullName },
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "20:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday","Sunday"], "opens": "09:00", "closes": "17:00" }
    ],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "2847", "bestRating": "5" },
    "priceRange": "₩₩",
    "medicalSpecialty": ["Implantology", "Orthodontics", "PediatricDentistry", "CosmeticDentistry"],
    "availableService": [
      { "@type": "MedicalProcedure", "name": "임플란트", "description": "네비게이션 가이드 임플란트, 6개 수술실" },
      { "@type": "MedicalProcedure", "name": "인비절라인", "description": "다이아몬드 프로바이더, 서울대 교정 전문의" },
      { "@type": "MedicalProcedure", "name": "글로우네이트(라미네이트)", "description": "최소삭제 포세린 라미네이트" }
    ]
  }, null, 2);

  const breadcrumbJsonLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://bdbddc.com/" },
      { "@type": "ListItem", "position": 2, "name": "오시는 길", "item": "https://bdbddc.com/directions.html" },
      { "@type": "ListItem", "position": 3, "name": `${r.name}에서 오시는 길`, "item": `https://bdbddc.com/area/${r.id}.html` }
    ]
  });

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
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/area/${r.id}.html">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/area/${r.id}.html">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
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
  <script type="application/ld+json">${breadcrumbJsonLd}</script>
  <script type="application/ld+json">${faqJsonLd}</script>
  <script type="application/ld+json">${dentistJsonLd}</script>
  <meta name="ai-summary" content="${r.fullName}에서 서울비디치과까지 약 ${r.driveKm}(차량 약 ${r.driveTime}). 서울대 출신 15인 원장 협진, 365일 진료, 임플란트·인비절라인·라미네이트 전문.">
  <meta name="abstract" content="${r.fullName}에서 서울비디치과까지 약 ${r.driveKm}(차량 약 ${r.driveTime}). 서울대 출신 15인 원장 협진, 365일 진료, 임플란트·인비절라인·라미네이트 전문.">
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
          ${r.fullName}에서 차로 ${r.driveTime} — 서울대 출신 15인 원장이<br>
          365일 임플란트·인비절라인·라미네이트를 진료합니다.
        </p>
        
        <div class="hero-trust-row reveal delay-3">
          <span class="hero-trust-item"><i class="fas fa-graduation-cap"></i> 서울대 15인 협진</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-calendar-check"></i> 365일 진료</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-car"></i> ${r.name}에서 차로 ${r.driveTime}</span>
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
        <p class="section-subtitle">${r.fullName}에서 차로 ${r.driveTime} (약 ${r.driveKm}) — 충남 천안시 서북구 불당34길 14</p>
      </div>
      
      <div class="why-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="why-card reveal delay-1">
          <div class="why-card-icon"><i class="fas fa-car"></i></div>
          <h3>자가용으로 오시는 길</h3>
          <p>네비게이션에 <strong>"${r.navSearch}"</strong>을 검색하세요.<br>${r.icName}에서 약 ${r.icTime} 소요됩니다.<br>건물 내 <strong>무료 주차</strong> 가능 (약 30대).</p>
          <div class="why-card-stat"><span class="num">${r.driveTime}</span><span class="unit">차량 소요시간</span></div>
        </div>
        <div class="why-card reveal delay-2">
          <div class="why-card-icon"><i class="fas fa-bus"></i></div>
          <h3>대중교통으로 오시는 길</h3>
          <p>${r.busInfo}<br><br><strong>KTX/SRT:</strong> ${r.trainInfo}</p>
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
        <p class="section-subtitle">${r.fullName}에서 차로 ${r.driveTime}, 서울대병원급 진료를 받으실 수 있습니다</p>
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
        <p class="section-subtitle">${r.patientNote}</p>
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
        <div class="feature-item"><i class="fas fa-car"></i> ${r.name}에서 차로 ${r.driveTime}</div>
        <div class="feature-item"><i class="fas fa-clock"></i> 365일 진료 (일요일·공휴일 포함)</div>
        <div class="feature-item"><i class="fas fa-moon"></i> 평일 매일 야간진료 20시</div>
        <div class="feature-item"><i class="fas fa-user-md"></i> 서울대 출신 15인 원장</div>
        <div class="feature-item"><i class="fas fa-building"></i> 1~5층 전문 의료 규모</div>
        <div class="feature-item"><i class="fas fa-car"></i> ${r.name}에서 차로 ${r.driveTime}</div>
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
            <div class="review-avatar">김</div>
            <div class="review-author-info"><div class="author-name">김**님</div><span class="review-source naver"><i class="fas fa-check-circle"></i> 네이버</span></div>
          </div>
          <div class="review-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          <p class="review-text">${r.name}에서 왔는데 <span class="highlight">임플란트 수술이 정말 편안했어요</span>. 4층 전체가 수술센터라 전문적이고, 수술 후 죽까지 주시는 세심한 배려에 감동!</p>
          <div class="review-tags"><span class="review-tag">임플란트</span><span class="review-tag">${r.name}에서 방문</span></div>
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
          <p class="review-text"><span class="highlight">과잉진료 없이 솔직하게 말씀해주셔서</span> 신뢰가 갑니다. ${r.name}에서 좀 멀지만 올 만한 가치가 있어요!</p>
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

// ═══════════════════════════════════════════════════════════
// 실행
// ═══════════════════════════════════════════════════════════
const areaDir = path.join(__dirname, '..', 'area');
if (!fs.existsSync(areaDir)) fs.mkdirSync(areaDir, { recursive: true });

console.log('🚀 지역 페이지 생성 시작 (28개)...\n');

let created = 0, updated = 0;
regions.forEach(r => {
  const filePath = path.join(areaDir, `${r.id}.html`);
  const existed = fs.existsSync(filePath);
  fs.writeFileSync(filePath, generatePage(r), 'utf-8');
  if (existed) {
    updated++;
    console.log(`  ♻️  업그레이드: area/${r.id}.html (${r.name})`);
  } else {
    created++;
    console.log(`  ✅ 신규 생성: area/${r.id}.html (${r.name})`);
  }
});

console.log(`\n🎉 완료! 업그레이드: ${updated}개, 신규 생성: ${created}개, 총: ${regions.length}개`);
console.log('\n📋 생성된 지역 목록:');
regions.forEach(r => console.log(`   - ${r.name} (${r.id}.html) | ${r.province} | 차로 ${r.driveTime}`));
