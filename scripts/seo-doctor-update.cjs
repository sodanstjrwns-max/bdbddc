#!/usr/bin/env node
/**
 * SEO Super Enhancement Script for All 15 Doctor Pages
 * Fixes: wrong names in schema, wrong specialties, missing keywords, weak FAQ, etc.
 */
const fs = require('fs');
const path = require('path');

// ============================================================
// MASTER DATA: 15 doctors — verified against actual page content
// ============================================================
const DOCTORS = {
  'moon': {
    name: '문석준',
    nameEn: 'Moon Seok-jun',
    gender: 'Male',
    role: '대표원장',
    jobTitle: '대표원장',
    specialty: '통합치의학과 전문의',
    specialtyShort: '임플란트·수면진료·치과 공포증',
    license: '29649',
    degree: '치의학 석사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/moon-profile.webp',
    slug: 'moon',
    title: '문석준 원장 | 치과 공포증·겁쟁이도 안심 — 서울비디치과 대표원장',
    description: '문석준 대표원장 — 서울비디치과 치과겁통령. 치과 공포증 맞춤 속도 진료, 임플란트·수면진료 전문. 천안 불당동 365일 진료 ☎041-415-2892',
    ogDescription: '치과가 무섭고 불안한 분도 괜찮습니다. 문석준 대표원장 — 치과겁통령, 치과 공포증 환자 맞춤 속도 진료 전문. 천안 임플란트·수면진료.',
    keywords: '문석준 원장,서울비디치과 문석준,천안 임플란트 잘하는 치과,치과 공포증,치과 겁쟁이,치과 무서움,수면진료,치과겁통령,천안 임플란트,천안 수면치과,불당동 치과,천안 치과 추천,통합치의학과 전문의,서울대 치과의사,페이션트 퍼널',
    knowsAbout: ['Implant Dentistry','Dental Phobia Treatment','Dental Anxiety Management','Sleep Dentistry','Prosthodontics','Comprehensive Dentistry'],
    memberOf: ['대한치과의사협회'],
    schemaDescription: '서울비디치과 대표원장. 서울대학교 치의학과 졸업, 치의학대학원 석사. 통합치의학과 전문의. 치과겁통령 — 치과 공포증·불안 환자 맞춤 속도 진료 전문. 페이션트 퍼널(Patient Funnel) 창립자. 천안 임플란트·수면진료.',
    hasSpecialistCert: true,
    specialistName: '통합치의학과 전문의',
    faqs: [
      { q: '문석준 원장의 전문 분야는 무엇인가요?', a: '문석준 대표원장은 통합치의학과 전문의로, 임플란트·수면진료·치과 공포증 맞춤 진료를 전문으로 합니다. 치과겁통령으로 불리며, 치과가 무서운 환자도 편안하게 진료받을 수 있는 맞춤 속도 진료를 실천합니다.' },
      { q: '치과 공포증이 심한데 문석준 원장에게 진료받을 수 있나요?', a: '네, 문석준 대표원장은 치과 공포증·불안·겁쟁이 환자 전문입니다. 환자가 감당할 수 있는 속도로 진료하며, 수면진료도 가능합니다. 유튜브 치과겁통령 채널에서 미리 원장님을 만나보실 수 있습니다.' },
      { q: '천안에서 임플란트 잘하는 치과를 찾고 있는데 문석준 원장에게 예약하려면?', a: '온라인 예약 시 문석준 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 서울비디치과는 365일 진료하며, 평일 야간 20시까지 운영합니다.' },
      { q: '문석준 원장이 쓴 책이 있나요?', a: '네, 「개원 5년, 연 매출 100억 원을 만든 질문들」과 「쉽디쉬운 임플란트 이야기」 두 권을 집필했습니다. 교보문고 등 주요 서점에서 구매하실 수 있습니다.' }
    ]
  },
  'kim': {
    name: '김민수',
    nameEn: 'Kim Min-su',
    gender: 'Male',
    role: '대표원장',
    jobTitle: '대표원장',
    specialty: '통합치의학과 전문의',
    specialtyShort: '임플란트·보철·종합진료',
    license: '29684',
    degree: '치의학 석사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/kim-profile.webp',
    slug: 'kim',
    title: '김민수 원장 | 임플란트·보철 전문 대표원장 — 서울비디치과',
    description: '김민수 대표원장 — 서울비디치과 임플란트·보철 전문. 서울대 통합치의학과 전문의, 풍부한 수술 경험. 천안 불당동 365일 진료 ☎041-415-2892',
    ogDescription: '서울비디치과 김민수 대표원장 — 통합치의학과 전문의, 임플란트·보철 전문. 서울대 출신, 천안 불당동.',
    keywords: '김민수 원장,서울비디치과 김민수,천안 임플란트,천안 보철,통합치의학과 전문의,천안 치과 추천,불당동 치과,서울대 치과의사,임플란트 전문의,천안 치과 잘하는 곳',
    knowsAbout: ['Implant Dentistry','Prosthodontics','Comprehensive Dentistry','Dental Crowns','Dental Bridges'],
    memberOf: ['대한치과의사협회'],
    schemaDescription: '서울비디치과 대표원장. 서울대학교 치의학과 졸업, 치의학대학원 석사. 통합치의학과 전문의. 임플란트·보철 전문, 풍부한 수술 경험으로 최적의 결과를 제공합니다.',
    hasSpecialistCert: true,
    specialistName: '통합치의학과 전문의',
    faqs: [
      { q: '김민수 원장의 전문 분야는 무엇인가요?', a: '김민수 대표원장은 통합치의학과 전문의로, 임플란트·보철을 전문으로 합니다. 서울대학교 치의학과를 졸업하고 풍부한 임상 경험을 보유하고 있습니다.' },
      { q: '천안에서 임플란트 상담받으려면 김민수 원장에게 어떻게 예약하나요?', a: '온라인 예약 시 김민수 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 서울비디치과는 365일 진료하며, 평일 야간 20시까지 운영합니다.' }
    ]
  },
  'hyun': {
    name: '현정민',
    nameEn: 'Hyun Jeong-min',
    gender: 'Male',
    role: '대표원장',
    jobTitle: '대표원장',
    specialty: '글로우네이트(라미네이트)·심미레진 전문',
    specialtyShort: '글로우네이트·라미네이트·심미레진',
    license: '29635',
    degree: '치의학 석사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/hyun-profile.webp',
    slug: 'hyun',
    title: '현정민 원장 | 글로우네이트·라미네이트·심미레진 전문 — 서울비디치과 대표원장',
    description: '현정민 대표원장 — 서울비디치과 글로우네이트(라미네이트)·심미레진 전문. 삭제 없는 보존적 심미치료, DSD 디지털 스마일 디자인. 천안 불당동 ☎041-415-2892',
    ogDescription: '현정민 대표원장 — 서울비디치과 글로우네이트(라미네이트) 전문. 삭제 없는 보존적 심미레진, DSD 디지털 스마일 디자인. 서울대 출신.',
    keywords: '현정민 원장,서울비디치과 글로우네이트,천안 라미네이트,라미네이트 전문 치과,심미레진,삭제없는 라미네이트,앞니 라미네이트,디지털 스마일 디자인,DSD,천안 심미치과,글로우네이트,천안 앞니 치료,서울대 치과의사',
    knowsAbout: ['Dental Veneers','Laminate Veneers','Cosmetic Dentistry','Composite Resin','Digital Smile Design','Aesthetic Dentistry'],
    memberOf: ['대한치과의사협회'],
    schemaDescription: '서울비디치과 대표원장. 서울대학교 치의학과 졸업, 치의학대학원 석사. 글로우네이트(라미네이트)·심미레진 전문. 삭제 없는 보존적 라미네이트, 앞니 복원, DSD 디지털 스마일 디자인.',
    hasSpecialistCert: false,
    faqs: [
      { q: '현정민 원장의 전문 분야는 무엇인가요?', a: '현정민 대표원장은 글로우네이트(라미네이트)·심미레진을 전문으로 합니다. 삭제 없는 보존적 라미네이트, DSD 디지털 스마일 디자인을 통해 자연스럽고 아름다운 미소를 만들어 드립니다.' },
      { q: '글로우네이트와 일반 라미네이트의 차이는 무엇인가요?', a: '글로우네이트는 서울비디치과만의 심미레진 브랜드로, 치아 삭제를 최소화하면서 자연스러운 심미 효과를 제공합니다. 기존 라미네이트보다 보존적이고 경제적인 시술입니다.' },
      { q: '천안에서 라미네이트 잘하는 치과를 찾고 있는데 현정민 원장에게 예약하려면?', a: '온라인 예약 시 현정민 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 글로우네이트 상담은 무료입니다. 365일 진료, 평일 야간 20시까지.' }
    ]
  },
  'lee-bm': {
    name: '이병민',
    nameEn: 'Lee Byung-min',
    gender: 'Male',
    role: '원장',
    jobTitle: '원장',
    specialty: '구강내과 전문의',
    specialtyShort: '턱관절장애·만성구강안면통증·수면질환',
    license: '29682',
    degree: '치의학 박사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/lee-bm-profile.webp',
    slug: 'lee-bm',
    title: '이병민 원장 | 천안 유일 구강내과 전문의 · 턱관절·만성통증 — 서울비디치과',
    description: '이병민 원장 — 천안 유일 구강내과 전문의. 턱관절장애·만성구강안면통증·이갈이·코골이·구강건조증 전문. 서울대 치의학 박사. 서울비디치과 ☎041-415-2892',
    ogDescription: '천안에서 유일한 구강내과 전문의 이병민 원장. 턱관절장애, 만성구강안면통증, 이갈이, 코골이, 구강건조증 전문 진료. 서울대 치의학 박사.',
    keywords: '이병민 원장,서울비디치과 이병민,천안 구강내과,구강내과 전문의,천안 턱관절,턱관절장애,턱관절 치료,만성 구강안면통증,이갈이 치료,코골이 치료,구강건조증,구강점막질환,천안 이갈이,천안 코골이,수면무호흡,삼차신경통,구강내과,천안 구강내과 전문의,서울대 치과의사,3D프린팅 구강장치',
    knowsAbout: ['Oral Medicine','TMJ Disorders','Temporomandibular Joint Dysfunction','Chronic Orofacial Pain','Bruxism Treatment','Sleep Apnea','Oral Mucosal Disease','Dry Mouth Treatment','Trigeminal Neuralgia','3D Printed Oral Appliances'],
    memberOf: ['대한치과의사협회','대한구강내과학회'],
    schemaDescription: '서울비디치과 원장, 천안 유일 구강내과 전문의. 서울대학교 치의학과 졸업, 치의학대학원 박사. 턱관절장애·만성구강안면통증·이갈이·코골이·수면무호흡·구강건조증·구강점막질환 전문. 3D 프린팅 기반 구강내 장치 정밀 제작.',
    hasSpecialistCert: true,
    specialistName: '구강내과 전문의',
    faqs: [
      { q: '천안에 구강내과 전문의가 있나요?', a: '네, 서울비디치과 이병민 원장이 천안 유일의 구강내과 전문의입니다. 턱관절장애, 만성구강안면통증, 이갈이, 코골이, 구강건조증, 구강점막질환 등을 전문으로 진료합니다.' },
      { q: '구강내과는 어떤 경우에 방문해야 하나요?', a: '턱에서 소리가 나거나 아픈 경우, 입을 크게 벌리기 어려운 경우, 원인 모를 구강안면 통증, 이갈이·이악물기, 코골이·수면무호흡, 구강건조증, 입안 점막 질환 등이 있을 때 구강내과 전문의 진료가 필요합니다.' },
      { q: '턱관절 장애는 어떻게 치료하나요?', a: '물리치료, 약물치료, 스플린트(구강내 장치) 등 환자 상태에 맞는 맞춤 치료를 적용합니다. 이병민 원장은 3D 프린팅 기술을 활용해 더욱 정밀한 맞춤형 장치를 제작합니다.' },
      { q: '이갈이나 코골이도 치과에서 치료가 되나요?', a: '네, 구강내과에서 전문적으로 다루는 영역입니다. 이갈이는 치아 손상과 턱관절 문제를 유발할 수 있고, 코골이는 수면무호흡과 연결될 수 있습니다. 구강내 장치 등으로 효과적으로 관리합니다.' },
      { q: '이병민 원장에게 진료 예약하려면 어떻게 하나요?', a: '온라인 예약 시 이병민 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 이병민 원장은 수·목요일에 진료합니다.' }
    ]
  },
  'lee': {
    name: '이승엽',
    nameEn: 'Lee Seung-yeop',
    gender: 'Male',
    role: '임플란트센터장',
    jobTitle: '임플란트센터장',
    specialty: '임플란트 전문',
    specialtyShort: '임플란트·뼈이식·전악임플란트',
    license: '29594',
    degree: '치의학 학사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학과',
    profileImg: 'https://bdbddc.com/images/doctors/lee-profile.webp',
    slug: 'lee',
    title: '이승엽 원장 | 임플란트 3만건+ · 뼈이식·전악 전문 — 서울비디치과 임플란트센터장',
    description: '이승엽 임플란트센터장 — 서울비디치과 임플란트 누적 30,000건+. 뼈이식·전악 임플란트 전문. 천안 불당동 365일 진료 ☎041-415-2892',
    ogDescription: '서울비디치과 이승엽 원장 — 임플란트 3만건+ 수술 경험, 뼈이식·전악 임플란트 전문. 천안 불당동 임플란트센터장.',
    keywords: '이승엽 원장,서울비디치과 이승엽,천안 임플란트,임플란트 전문,뼈이식,전악 임플란트,천안 임플란트 잘하는 곳,임플란트 3만건,천안 뼈이식,임플란트센터,서울대 치과의사,불당동 임플란트',
    knowsAbout: ['Dental Implants','Bone Grafting','Full Mouth Implants','All-on-4','Guided Implant Surgery','Sinus Lift'],
    memberOf: ['대한치과의사협회'],
    schemaDescription: '서울비디치과 임플란트센터장. 서울대학교 치의학과 졸업. 임플란트 진료 10년+, 누적 임플란트 수술 30,000건+. 뼈이식·전악 임플란트 전문.',
    hasSpecialistCert: false,
    faqs: [
      { q: '이승엽 원장의 임플란트 수술 경력은 어떻게 되나요?', a: '이승엽 원장은 10년 이상의 임플란트 진료 경력으로 누적 30,000건 이상의 임플란트 수술 경험을 보유하고 있습니다. 뼈이식·전악 임플란트 전문입니다.' },
      { q: '천안에서 임플란트 잘하는 치과를 찾고 있는데 이승엽 원장에게 예약하려면?', a: '온라인 예약 시 이승엽 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 서울비디치과는 365일 진료하며, 6개의 독립 임플란트 수술실을 갖추고 있습니다.' }
    ]
  },
  'choi': {
    name: '최종훈',
    nameEn: 'Choi Jong-hun',
    gender: 'Male',
    role: '종합진료센터 센터장',
    jobTitle: '종합진료센터 센터장',
    specialty: '통합치의학과 전문의',
    specialtyShort: '사랑니 발치·종합진료·외과',
    license: '29707',
    degree: '치의학 석사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/choi-profile.webp',
    slug: 'choi',
    title: '최종훈 원장 | 사랑니 발치·종합진료 전문 — 서울비디치과 종합진료센터장',
    description: '최종훈 원장 — 서울비디치과 종합진료센터장, 통합치의학과 전문의. 사랑니 발치·종합진료 전문. 천안 불당동 365일 진료 ☎041-415-2892',
    ogDescription: '서울비디치과 최종훈 원장 — 통합치의학과 전문의, 사랑니 발치·종합진료 전문. 천안 불당동 종합진료센터장.',
    keywords: '최종훈 원장,서울비디치과 최종훈,천안 사랑니 발치,통합치의학과 전문의,천안 종합진료,사랑니 발치 잘하는 치과,천안 치과,불당동 치과,서울대 치과의사',
    knowsAbout: ['Wisdom Tooth Extraction','Comprehensive Dentistry','Oral Surgery','General Dentistry'],
    memberOf: ['대한치과의사협회'],
    schemaDescription: '서울비디치과 종합진료센터 센터장. 서울대학교 치의학과 졸업, 치의학대학원 석사. 통합치의학과 전문의. 사랑니 발치·종합진료 전문.',
    hasSpecialistCert: true,
    specialistName: '통합치의학과 전문의',
    faqs: [
      { q: '최종훈 원장의 전문 분야는 무엇인가요?', a: '최종훈 원장은 통합치의학과 전문의로 서울비디치과 종합진료센터장입니다. 사랑니 발치, 종합진료, 외과적 치과 시술을 전문으로 합니다.' },
      { q: '천안에서 사랑니 발치 잘하는 치과를 찾고 있는데 최종훈 원장에게 예약하려면?', a: '온라인 예약 시 최종훈 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 365일 진료, 평일 야간 20시까지 운영합니다.' }
    ]
  },
  'jo': {
    name: '조설아',
    nameEn: 'Jo Seol-a',
    gender: 'Female',
    role: '원장',
    jobTitle: '원장',
    specialty: '치과보존과 전문의',
    specialtyShort: '보존과·재신경치료·자연치아 보존',
    license: '29621',
    degree: '치의학 석사, 박사 수료',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/jo-profile.webp',
    slug: 'jo',
    title: '조설아 원장 | 치과보존과 전문의 · 재신경치료 — 서울비디치과',
    description: '조설아 원장 — 서울비디치과 치과보존과 전문의. 재신경치료·자연치아 보존 전문. 서울대 석사, 박사 수료. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 조설아 원장 — 치과보존과 전문의. 재신경치료·자연치아 보존 전문. 서울대 석사, 박사 수료.',
    keywords: '조설아 원장,서울비디치과 조설아,천안 신경치료,치과보존과 전문의,재신경치료,천안 보존과,자연치아 보존,천안 치과,서울대 치과의사,불당동 치과',
    knowsAbout: ['Endodontics','Root Canal Treatment','Retreatment','Conservative Dentistry','Natural Tooth Preservation'],
    memberOf: ['대한치과의사협회','대한치과보존학회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학과 졸업, 치의학대학원 석사, 박사 수료. 치과보존과 전문의. 재신경치료·자연치아 보존 전문.',
    hasSpecialistCert: true,
    specialistName: '치과보존과 전문의',
    faqs: [
      { q: '조설아 원장의 전문 분야는 무엇인가요?', a: '조설아 원장은 치과보존과 전문의로, 재신경치료와 자연치아 보존을 전문으로 합니다. 다른 치과에서 발치를 권유받은 경우에도 자연치아를 살릴 수 있는지 정밀 진단해 드립니다.' },
      { q: '조설아 원장에게 진료 예약하려면 어떻게 하나요?', a: '온라인 예약 시 조설아 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 365일 진료, 평일 야간 20시까지 운영합니다.' }
    ]
  },
  'kang-mj': {
    name: '강민지',
    nameEn: 'Kang Min-ji',
    gender: 'Female',
    role: '원장',
    jobTitle: '원장',
    specialty: '치과보존과 전문의',
    specialtyShort: '보존과·자연치아 보존',
    license: '30467',
    degree: '치의학 석사, 박사 수료',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/kang-mj-profile.webp',
    slug: 'kang-mj',
    title: '강민지 원장 | 치과보존과 전문의 · 자연치아 보존 — 서울비디치과',
    description: '강민지 원장 — 서울비디치과 치과보존과 전문의. 자연치아 보존·신경치료 전문. 서울대 석사, 박사 수료. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 강민지 원장 — 치과보존과 전문의. 자연치아 보존·신경치료 전문. 서울대 석사, 박사 수료.',
    keywords: '강민지 원장,서울비디치과 강민지,천안 보존과,치과보존과 전문의,자연치아 보존,천안 신경치료,천안 치과,서울대 치과의사,불당동 치과',
    knowsAbout: ['Conservative Dentistry','Endodontics','Root Canal Treatment','Natural Tooth Preservation'],
    memberOf: ['대한치과의사협회','대한치과보존학회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학과 졸업, 치의학대학원 석사, 박사 수료. 치과보존과 전문의. 자연치아 보존 전문.',
    hasSpecialistCert: true,
    specialistName: '치과보존과 전문의',
    faqs: [
      { q: '강민지 원장의 전문 분야는 무엇인가요?', a: '강민지 원장은 치과보존과 전문의로, 자연치아 보존과 신경치료를 전문으로 합니다. 발치 전 자연치아를 살릴 수 있는지 정밀 진단해 드립니다.' },
      { q: '강민지 원장에게 진료 예약하려면 어떻게 하나요?', a: '온라인 예약 시 강민지 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 365일 진료, 평일 야간 20시까지 운영합니다.' }
    ]
  },
  'kang': {
    name: '강경민',
    nameEn: 'Kang Gyeong-min',
    gender: 'Male',
    role: '원장',
    jobTitle: '원장',
    specialty: '임플란트 및 외과 진료 전문',
    specialtyShort: '임플란트·외과진료·구강소수술',
    license: '36098',
    degree: '치의학 석사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/kang-profile.webp',
    slug: 'kang',
    title: '강경민 원장 | 임플란트·외과 진료 전문 — 서울비디치과',
    description: '강경민 원장 — 서울비디치과 임플란트·외과 진료 전문. 서울대 석사, 서울대 치과병원 종합진료실 출신. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 강경민 원장 — 임플란트·외과진료·구강소수술 전문. 서울대 출신.',
    keywords: '강경민 원장,서울비디치과 강경민,천안 임플란트,임플란트 전문,외과 진료,구강소수술,천안 치과,서울대 치과의사,불당동 치과',
    knowsAbout: ['Dental Implants','Oral Surgery','Minor Oral Surgery','General Dentistry'],
    memberOf: ['대한치과의사협회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학과 졸업, 치의학대학원 석사. 서울대 치과병원 종합진료실 출신. 임플란트·외과진료·구강소수술 전문.',
    hasSpecialistCert: false,
    faqs: [
      { q: '강경민 원장의 전문 분야는 무엇인가요?', a: '강경민 원장은 임플란트와 외과 진료를 전문으로 합니다. 서울대 치과병원 종합진료실에서 수련하였으며, 구강소수술도 능숙하게 시행합니다.' },
      { q: '강경민 원장에게 진료 예약하려면 어떻게 하나요?', a: '온라인 예약 시 강경민 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 365일 진료, 평일 야간 20시까지 운영합니다.' }
    ]
  },
  'kim-mg': {
    name: '김민규',
    nameEn: 'Kim Min-gyu',
    gender: 'Male',
    role: '원장',
    jobTitle: '원장',
    specialty: '치과교정과 전문의',
    specialtyShort: '교정·인비절라인·디지털교정',
    license: '29636',
    degree: '치의학 석사, 박사 수료',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/kim-mg-profile.webp',
    slug: 'kim-mg',
    title: '김민규 원장 | 치과교정과 전문의 · 인비절라인 — 서울비디치과',
    description: '김민규 원장 — 서울비디치과 치과교정과 전문의. 인비절라인·디지털 교정 전문. 서울대 석사, 박사 수료. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 김민규 원장 — 치과교정과 전문의, 인비절라인·디지털 교정 전문. 서울대 석사, 박사 수료.',
    keywords: '김민규 원장,서울비디치과 김민규,천안 교정,치과교정과 전문의,천안 인비절라인,디지털 교정,투명교정,천안 치아교정,천안 치과,서울대 치과의사,불당동 치과',
    knowsAbout: ['Orthodontics','Invisalign','Digital Orthodontics','Clear Aligners','Dental Braces'],
    memberOf: ['대한치과의사협회','대한치과교정학회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학과 졸업, 치의학대학원 석사, 박사 수료. 치과교정과 전문의. 인비절라인·디지털 교정 전문.',
    hasSpecialistCert: true,
    specialistName: '치과교정과 전문의',
    faqs: [
      { q: '김민규 원장의 전문 분야는 무엇인가요?', a: '김민규 원장은 치과교정과 전문의로, 인비절라인(투명교정)·디지털 교정을 전문으로 합니다. 서울대 치과교정학 석사 및 박사 수료 과정을 이수했습니다.' },
      { q: '천안에서 인비절라인 교정을 받으려면 김민규 원장에게 어떻게 예약하나요?', a: '온라인 예약 시 김민규 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 교정 상담은 정밀 진단 후 맞춤 계획을 세워드립니다.' }
    ]
  },
  'kim-mj': {
    name: '김민진',
    nameEn: 'Kim Min-jin',
    gender: 'Female',
    role: '원장',
    jobTitle: '원장',
    specialty: '소아치과 전문의',
    specialtyShort: '소아치과·영유아검진·성장기 교정',
    license: '29815',
    degree: '치의학 석사, 박사 수료',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/kim-mj-profile.webp',
    slug: 'kim-mj',
    title: '김민진 원장 | 소아치과 전문의 · 영유아검진 — 서울비디치과',
    description: '김민진 원장 — 서울비디치과 소아치과 전문의. 영유아 구강검진·성장기 교정 전문. 서울대 석사, 박사 수료. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 김민진 원장 — 소아치과 전문의, 영유아 구강검진·성장기 교정 전문. 아이들의 편안한 진료.',
    keywords: '김민진 원장,서울비디치과 김민진,천안 소아치과,소아치과 전문의,영유아 구강검진,성장기 교정,천안 어린이 치과,아이 치과,천안 치과,서울대 치과의사,불당동 치과',
    knowsAbout: ['Pediatric Dentistry','Child Dental Care','Infant Oral Examination','Growth Period Orthodontics','Preventive Dentistry'],
    memberOf: ['대한치과의사협회','대한소아치과학회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학과 졸업, 치의학대학원 석사, 박사 수료. 소아치과 전문의. 영유아 구강검진·성장기 교정 전문.',
    hasSpecialistCert: true,
    specialistName: '소아치과 전문의',
    faqs: [
      { q: '김민진 원장의 전문 분야는 무엇인가요?', a: '김민진 원장은 소아치과 전문의로, 영유아 구강검진과 성장기 교정을 전문으로 합니다. 아이들이 편안하게 진료받을 수 있도록 친근한 분위기에서 치료합니다.' },
      { q: '천안에서 소아치과 전문의에게 아이 치과 예약하려면?', a: '온라인 예약 시 김민진 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 365일 진료, 소아치과 전문의 3인이 함께합니다.' }
    ]
  },
  'lim': {
    name: '임지원',
    nameEn: 'Lim Ji-won',
    gender: 'Female',
    role: '원장',
    jobTitle: '원장',
    specialty: '치아교정 전문',
    specialtyShort: '치아교정·비수술 교정·인비절라인',
    license: '30724',
    degree: '치의학 석사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/lim-profile.webp',
    slug: 'lim',
    title: '임지원 원장 | 치아교정·비수술 교정·인비절라인 — 서울비디치과',
    description: '임지원 원장 — 서울비디치과 치아교정 전문. 비수술 교정치료·인비절라인 인증의. 3급 부정교합 비수술 치료 전문. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 임지원 원장 — 치아교정·비수술 교정·인비절라인 전문. 3급 부정교합 비수술 치료.',
    keywords: '임지원 원장,서울비디치과 임지원,천안 교정,치아교정,비수술 교정,인비절라인,3급 부정교합,천안 치아교정,투명교정,천안 치과,서울대 치과의사,불당동 치과',
    knowsAbout: ['Orthodontics','Non-surgical Orthodontics','Invisalign','Class III Malocclusion','Clear Aligners'],
    memberOf: ['대한치과의사협회','대한치과교정학회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학과 졸업, 치의학대학원 석사. 치아교정·비수술 교정 전문. 인비절라인 인증의, 3급 부정교합 비수술 치료 전문.',
    hasSpecialistCert: false,
    faqs: [
      { q: '임지원 원장의 전문 분야는 무엇인가요?', a: '임지원 원장은 치아교정을 전문으로 합니다. 인비절라인 인증의이며, 특히 3급 부정교합(주걱턱)의 비수술 교정치료에 전문성을 갖추고 있습니다.' },
      { q: '천안에서 인비절라인이나 치아교정을 받으려면 임지원 원장에게 어떻게 예약하나요?', a: '온라인 예약 시 임지원 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 교정 초진 상담을 통해 맞춤 치료 계획을 세워드립니다.' }
    ]
  },
  'park': {
    name: '박상현',
    nameEn: 'Park Sang-hyun',
    gender: 'Male',
    role: '원장',
    jobTitle: '원장',
    specialty: '소아치과 전문의',
    specialtyShort: '소아치과·소아외과·맞춤예방관리',
    license: '32197',
    degree: '소아치과 전문의',
    school: '서울대학교 치의학대학원',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/park-profile.webp',
    slug: 'park',
    title: '박상현 원장 | 소아치과 전문의 · 소아외과·예방관리 — 서울비디치과',
    description: '박상현 원장 — 서울비디치과 소아치과 전문의. 소아외과·맞춤예방관리 전문. 서울대 어린이치과병원 수련. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 박상현 원장 — 소아치과 전문의, 서울대 어린이치과병원 수련. 소아외과·맞춤예방관리 전문.',
    keywords: '박상현 원장,서울비디치과 박상현,천안 소아치과,소아치과 전문의,소아외과,천안 어린이 치과,아이 치과,맞춤예방관리,웃음가스,소아 행동조절,인비절라인 퍼스트,천안 치과,서울대 치과의사',
    knowsAbout: ['Pediatric Dentistry','Pediatric Oral Surgery','Preventive Dental Care','Behavior Management','Nitrous Oxide Sedation','Invisalign First'],
    memberOf: ['대한치과의사협회','대한소아치과학회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학대학원 소아치과 전문의. 서울대 어린이치과병원 수련. 소아외과·맞춤예방관리 전문. 소아 행동조절·웃음가스 진정치료·인비절라인 퍼스트 인증.',
    hasSpecialistCert: true,
    specialistName: '소아치과 전문의',
    faqs: [
      { q: '박상현 원장의 전문 분야는 무엇인가요?', a: '박상현 원장은 소아치과 전문의로, 소아외과·맞춤예방관리를 전문으로 합니다. 서울대 어린이치과병원에서 수련하였으며, 소아 행동조절과 웃음가스 진정치료에도 전문성을 갖추고 있습니다.' },
      { q: '아이가 치과를 무서워하는데 박상현 원장에게 예약하려면?', a: '온라인 예약 시 박상현 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 소아 행동조절 전문으로 아이가 편안하게 진료받을 수 있습니다.' }
    ]
  },
  'park-sb': {
    name: '박수빈',
    nameEn: 'Park Su-bin',
    gender: 'Female',
    role: '원장',
    jobTitle: '원장',
    specialty: '글로우네이트·심미레진·종합진료',
    specialtyShort: '글로우네이트·심미레진·임플란트',
    license: '36650',
    degree: '치의학 석사',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/park-sb-profile.webp',
    slug: 'park-sb',
    title: '박수빈 원장 | 글로우네이트·심미레진·종합진료 — 서울비디치과',
    description: '박수빈 원장 — 서울비디치과 글로우네이트·심미레진·종합진료 전문. 서울대 석사, 서울대 치과병원 종합진료실 출신. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 박수빈 원장 — 글로우네이트·심미레진·종합진료 전문. 서울대 출신.',
    keywords: '박수빈 원장,서울비디치과 박수빈,천안 글로우네이트,글로우네이트,심미레진,천안 라미네이트,종합진료,천안 치과,서울대 치과의사,불당동 치과',
    knowsAbout: ['Cosmetic Dentistry','Composite Resin','Dental Veneers','Comprehensive Dentistry','Dental Implants'],
    memberOf: ['대한치과의사협회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학과 졸업, 치의학대학원 석사. 서울대 치과병원 종합진료실 출신. 글로우네이트·심미레진·종합진료·임플란트 전문.',
    hasSpecialistCert: false,
    faqs: [
      { q: '박수빈 원장의 전문 분야는 무엇인가요?', a: '박수빈 원장은 글로우네이트(라미네이트)·심미레진·종합진료·임플란트를 전문으로 합니다. 서울대 치과병원 종합진료실에서 수련하였습니다.' },
      { q: '박수빈 원장에게 진료 예약하려면 어떻게 하나요?', a: '온라인 예약 시 박수빈 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 365일 진료, 평일 야간 20시까지 운영합니다.' }
    ]
  },
  'seo': {
    name: '서희원',
    nameEn: 'Seo Hee-won',
    gender: 'Female',
    role: '원장',
    jobTitle: '원장',
    specialty: '소아치과 전문의',
    specialtyShort: '소아치과·행동조절·성장기 교정',
    license: '29630',
    degree: '치의학 석사, 박사 수료',
    school: '서울대학교 치의학과',
    gradSchool: '서울대학교 치의학대학원',
    profileImg: 'https://bdbddc.com/images/doctors/seo-profile.webp',
    slug: 'seo',
    title: '서희원 원장 | 소아치과 전문의 · 행동조절·성장기 교정 — 서울비디치과',
    description: '서희원 원장 — 서울비디치과 소아치과 전문의. 행동조절·성장기 교정 전문. 서울대 석사, 박사 수료. 천안 불당동 ☎041-415-2892',
    ogDescription: '서울비디치과 서희원 원장 — 소아치과 전문의, 행동조절·성장기 교정 전문. 진정성 있는 어린이 진료.',
    keywords: '서희원 원장,서울비디치과 서희원,천안 소아치과,소아치과 전문의,행동조절,성장기 교정,천안 어린이 치과,아이 치과,천안 치과,서울대 치과의사,불당동 치과',
    knowsAbout: ['Pediatric Dentistry','Behavior Management','Growth Period Orthodontics','Child Dental Care','Preventive Dentistry'],
    memberOf: ['대한치과의사협회','대한소아치과학회'],
    schemaDescription: '서울비디치과 원장. 서울대학교 치의학과 졸업, 치의학대학원 석사, 박사 수료. 소아치과 전문의. 행동조절·성장기 교정 전문.',
    hasSpecialistCert: true,
    specialistName: '소아치과 전문의',
    faqs: [
      { q: '서희원 원장의 전문 분야는 무엇인가요?', a: '서희원 원장은 소아치과 전문의로, 행동조절과 성장기 교정을 전문으로 합니다. 아이들의 심리를 이해하며 진정성 있는 진료를 실천합니다.' },
      { q: '서희원 원장에게 아이 치과 예약하려면?', a: '온라인 예약 시 서희원 원장을 지정하시거나, 전화(041-415-2892)로 요청하시면 됩니다. 365일 진료, 소아치과 전문의 3인 진료 체계.' }
    ]
  }
};

// ============================================================
// BUILD FUNCTIONS
// ============================================================

function buildPersonSchema(d) {
  const credentials = [];
  // Degree
  credentials.push({
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "학위",
    "name": d.degree
  });
  // License
  credentials.push({
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "면허",
    "name": "치과의사 면허",
    "identifier": d.license,
    "recognizedBy": { "@type": "Organization", "name": "보건복지부" }
  });
  // Specialist cert
  if (d.hasSpecialistCert) {
    credentials.push({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "전문의",
      "name": d.specialistName,
      "recognizedBy": { "@type": "Organization", "name": "보건복지부" }
    });
  }

  const memberOf = d.memberOf.map(m => ({ "@type": "Organization", "name": m }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://bdbddc.com/#${d.name}`,
    "name": d.name,
    "alternateName": d.nameEn,
    "jobTitle": d.jobTitle,
    "gender": d.gender,
    "description": d.schemaDescription,
    "worksFor": {
      "@type": "Dentist",
      "@id": "https://bdbddc.com/#dentist",
      "name": "서울비디치과",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "불당34길 14, 1~5층",
        "addressLocality": "천안시 서북구",
        "addressRegion": "충청남도",
        "postalCode": "31166",
        "addressCountry": "KR"
      },
      "telephone": "+82-41-415-2892",
      "url": "https://bdbddc.com",
      "sameAs": [
        "https://pf.kakao.com/_Cxivlxb",
        "https://www.youtube.com/@BDtube",
        "https://www.youtube.com/@geoptongryung",
        "https://naver.me/5yPnKmqQ"
      ]
    },
    "alumniOf": [
      { "@type": "CollegeOrUniversity", "name": d.school },
      { "@type": "CollegeOrUniversity", "name": d.gradSchool }
    ],
    "hasCredential": credentials,
    "knowsAbout": d.knowsAbout,
    "memberOf": memberOf.length === 1 ? memberOf[0] : memberOf,
    "image": d.profileImg
  };

  return schema;
}

function buildFAQSchema(d) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": d.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };
}

function buildMedicalWebPageSchema(d) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": d.title,
    "url": `https://bdbddc.com/doctors/${d.slug}`,
    "description": d.description,
    "lastReviewed": "2026-04-15",
    "about": {
      "@type": "Person",
      "@id": `https://bdbddc.com/#${d.name}`
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".hero-headline", ".hero-sub", ".profile-name", ".profile-specialty", ".section-title"]
    },
    "mainContentOfPage": {
      "@type": "WebPageElement",
      "cssSelector": ".profile-content"
    }
  };
}


// ============================================================
// APPLY UPDATES
// ============================================================

const doctorsDir = path.join(__dirname, '..', 'doctors');
let totalUpdated = 0;
let totalErrors = 0;

for (const [slug, d] of Object.entries(DOCTORS)) {
  const filePath = path.join(doctorsDir, `${slug}.html`);
  if (!fs.existsSync(filePath)) {
    console.error(`[SKIP] ${filePath} not found`);
    totalErrors++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const originalHtml = html;

  // ---- 1. TITLE ----
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${d.title}</title>`);

  // ---- 2. META DESCRIPTION ----
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${d.description}">`
  );

  // ---- 3. META ABSTRACT ----
  html = html.replace(
    /<meta name="abstract" content="[^"]*">/,
    `<meta name="abstract" content="${d.description}">`
  );

  // ---- 4. META AI-SUMMARY ----
  html = html.replace(
    /<meta name="ai-summary" content="[^"]*">/,
    `<meta name="ai-summary" content="${d.schemaDescription}">`
  );

  // ---- 5. META KEYWORDS ----
  html = html.replace(
    /<meta name="keywords" content="[^"]*">/,
    `<meta name="keywords" content="${d.keywords}">`
  );

  // ---- 6. OG TAGS ----
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${d.title}">`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${d.ogDescription}">`
  );

  // ---- 7. TWITTER TAGS ----
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${d.title}">`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${d.ogDescription}">`
  );

  // ---- 8. REPLACE ALL JSON-LD SCHEMA ----
  // Remove all existing JSON-LD blocks
  const jsonLdBlocks = html.match(/<script type="application\/ld\+json">[^]*?<\/script>/g) || [];
  
  // Keep only the BreadcrumbList, remove all others
  const breadcrumbBlock = jsonLdBlocks.find(b => b.includes('BreadcrumbList'));
  
  // Remove all JSON-LD blocks
  for (const block of jsonLdBlocks) {
    html = html.replace(block, '');
  }

  // Build new breadcrumb
  const newBreadcrumb = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"의료진","item":"https://bdbddc.com/doctors/"},{"@type":"ListItem","position":3,"name":"${d.name} 원장","item":"https://bdbddc.com/doctors/${d.slug}"}]}
</script>`;

  // Build new Person schema
  const personSchema = `<script type="application/ld+json">
${JSON.stringify(buildPersonSchema(d), null, 2)}
</script>`;

  // Build new MedicalWebPage schema
  const webPageSchema = `<script type="application/ld+json">
${JSON.stringify(buildMedicalWebPageSchema(d), null, 2)}
</script>`;

  // Build new FAQ schema
  const faqSchema = `<script type="application/ld+json">
${JSON.stringify(buildFAQSchema(d), null, 2)}
</script>`;

  // Insert all schemas before analytics script
  const analyticsTag = `<script src="/js/analytics.js`;
  const allSchemas = `${newBreadcrumb}\n${personSchema}\n${webPageSchema}\n${faqSchema}\n`;
  
  if (html.includes(analyticsTag)) {
    html = html.replace(analyticsTag, allSchemas + analyticsTag);
  } else {
    // fallback: insert before </head>
    html = html.replace('</head>', allSchemas + '</head>');
  }

  // Clean up any extra blank lines from removed schemas
  html = html.replace(/\n{3,}/g, '\n\n');

  // Write file
  fs.writeFileSync(filePath, html, 'utf8');
  
  // Verify
  const verify = fs.readFileSync(filePath, 'utf8');
  const hasCorrectTitle = verify.includes(`<title>${d.title}</title>`);
  const hasCorrectName = verify.includes(`"name": "${d.name}"`);
  const hasCorrectFAQ = verify.includes(d.faqs[0].q);
  
  if (hasCorrectTitle && hasCorrectName && hasCorrectFAQ) {
    console.log(`[OK] ${slug}: ${d.name} — title, schema name, FAQ all correct`);
    totalUpdated++;
  } else {
    console.error(`[WARN] ${slug}: verification issues — title:${hasCorrectTitle} name:${hasCorrectName} faq:${hasCorrectFAQ}`);
    totalErrors++;
  }
}

// Also handle moon.html special case — keep Book schemas
const moonPath = path.join(doctorsDir, 'moon.html');
if (fs.existsSync(moonPath)) {
  let moonHtml = fs.readFileSync(moonPath, 'utf8');
  
  // Check if Book schemas were removed and need to be re-added
  if (!moonHtml.includes('"@type": "Book"')) {
    const bookSchema1 = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "개원 5년, 연 매출 100억 원을 만든 질문들",
  "isbn": "9791199493605",
  "numberOfPages": 300,
  "datePublished": "2025-10-14",
  "bookFormat": "https://schema.org/Paperback",
  "inLanguage": "ko",
  "url": "https://product.kyobobook.co.kr/detail/S000218133454",
  "author": { "@type": "Person", "name": "문석준", "@id": "https://bdbddc.com/#문석준" },
  "publisher": { "@type": "Organization", "name": "교보문고" }
}
</script>`;

    const bookSchema2 = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "쉽디쉬운 임플란트 이야기",
  "isbn": "9791138816717",
  "numberOfPages": 164,
  "datePublished": "2023-03-03",
  "bookFormat": "https://schema.org/Paperback",
  "inLanguage": "ko",
  "url": "https://product.kyobobook.co.kr/detail/S000201305749",
  "author": { "@type": "Person", "name": "문석준", "@id": "https://bdbddc.com/#문석준" },
  "publisher": { "@type": "Organization", "name": "교보문고" }
}
</script>`;

    // Insert Book schemas after FAQ schema
    const analyticsTag = `<script src="/js/analytics.js`;
    if (moonHtml.includes(analyticsTag)) {
      moonHtml = moonHtml.replace(analyticsTag, bookSchema1 + '\n' + bookSchema2 + '\n' + analyticsTag);
      fs.writeFileSync(moonPath, moonHtml, 'utf8');
      console.log(`[OK] moon: Book schemas re-added`);
    }
  }
}

console.log(`\n===== SUMMARY =====`);
console.log(`Updated: ${totalUpdated}`);
console.log(`Errors: ${totalErrors}`);
console.log(`Total doctors: ${Object.keys(DOCTORS).length}`);
