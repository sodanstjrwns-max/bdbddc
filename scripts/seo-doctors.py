#!/usr/bin/env python3
"""
의료진 개별 페이지 SEO 슈퍼 강화 스크립트
- title 태그 강화 (지역 + 전문분야 키워드)
- meta description 강화 (행동 유도, 키워드 밀도)
- meta keywords 확장 (롱테일 키워드)
- ai-summary 수정 (정확한 정보)
- Schema.org Person 수정 (이름, 전문분야, 자격증)
- Schema.org FAQPage 확장 (3~5개 질문)
- 지역 SEO 강화 (천안, 아산, 세종 등)
"""

import re, json, os

# ────────────────────────────────────────
# 의료진 데이터 정의
# ────────────────────────────────────────
DOCTORS = {
    "moon": {
        "name": "문석준",
        "role": "대표원장",
        "specialty_short": "통합치의학과 전문의",
        "specialty_detail": "임플란트 · 정밀 진단 · 치과 공포증 맞춤 진료",
        "gender": "Male",
        "license": "29649",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사"],
        "credentials": ["통합치의학과 전문의"],
        "knows": ["Implantology", "Comprehensive Dentistry", "Dental Phobia Management"],
        "memberships": ["대한치과의사협회", "대한통합치의학회"],
        "seo_title": "문석준 대표원장 | 치과 공포증·수면진료·임플란트 전문 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 문석준 대표원장 — 서울대 치의학대학원 석사, 통합치의학과 전문의. 치과겁통령으로 유명한 치과 공포증 전문가. 천안 불당동 365일 진료, 수면진료·임플란트·정밀진단. ☎041-415-2892",
        "seo_keywords": "문석준 원장,서울비디치과 대표원장,천안 치과 공포증,치과겁통령,천안 수면진료,천안 임플란트,통합치의학과 전문의,서울대 치과의사,천안 불당동 치과,페이션트 퍼널",
        "ai_summary": "문석준 대표원장 — 서울비디치과 대표원장, 서울대 치의학대학원 석사, 통합치의학과 전문의. 치과겁통령으로 치과 공포증 맞춤 진료 전문. 페이션트 퍼널 창립자.",
        "faqs": [
            ("문석준 원장의 전문 분야는 무엇인가요?", "문석준 대표원장은 서울대 치의학대학원 석사 출신 통합치의학과 전문의로, 임플란트·정밀 진단·치과 공포증 맞춤 진료를 전문으로 합니다. '치과겁통령'이라는 별명으로 유명하며, 치과를 무서워하는 환자분들도 안심하고 진료받을 수 있도록 세심한 진료를 제공합니다."),
            ("치과 공포증이 심한데 진료 받을 수 있나요?", "네, 문석준 대표원장은 치과 공포증 환자를 위한 맞춤 진료 시스템을 운영하고 있습니다. 수면진료, 단계적 탈감작 프로토콜 등을 통해 공포증이 심한 분들도 편안하게 치료받으실 수 있습니다. 유튜브 '치과겁통령' 채널에서도 관련 정보를 확인하실 수 있습니다."),
            ("문석준 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '문석준 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다. 서울비디치과는 365일 진료하며, 평일 야간 20시까지 운영합니다.")
        ]
    },
    "kim": {
        "name": "김민수",
        "role": "대표원장",
        "specialty_short": "통합치의학과 전문의",
        "specialty_detail": "통합치의학과 전문의 · 임플란트 · 보철",
        "gender": "Male",
        "license": "29684",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사"],
        "credentials": ["통합치의학과 전문의"],
        "knows": ["Comprehensive Dentistry", "Prosthodontics", "Implantology"],
        "memberships": ["대한치과의사협회", "대한통합치의학회"],
        "seo_title": "김민수 대표원장 | 통합치의학과 전문의·임플란트·보철 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 김민수 대표원장 — 서울대 치의학대학원 석사, 통합치의학과 전문의. 임플란트·보철 전문. 천안 불당동 365일 진료, 서울대 15인 원장 협진. ☎041-415-2892",
        "seo_keywords": "김민수 원장,서울비디치과 대표원장,천안 임플란트,통합치의학과 전문의,서울대 치과의사,천안 보철,천안 불당동 치과,서울비디치과 김민수",
        "ai_summary": "김민수 대표원장 — 서울비디치과 대표원장, 서울대 치의학대학원 석사, 통합치의학과 전문의. 임플란트·보철 전문.",
        "faqs": [
            ("김민수 원장의 전문 분야는 무엇인가요?", "김민수 대표원장은 서울대 치의학대학원 석사 출신 통합치의학과 전문의로, 임플란트와 보철 진료를 전문으로 합니다. 서울비디치과의 대표원장으로서 15인 원장 협진 체계를 이끌고 있습니다."),
            ("김민수 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '김민수 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다. 서울비디치과는 천안 불당동에서 365일 진료합니다.")
        ]
    },
    "hyun": {
        "name": "현정민",
        "role": "대표원장",
        "specialty_short": "통합치의학과 전문의",
        "specialty_detail": "글로우네이트(라미네이트) · 심미레진 · DSD 디지털 스마일 디자인",
        "gender": "Male",
        "license": "29635",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사"],
        "credentials": ["통합치의학과 전문의"],
        "knows": ["Cosmetic Dentistry", "Dental Veneers", "Composite Resin", "Digital Smile Design"],
        "memberships": ["대한치과의사협회", "대한심미치과학회"],
        "seo_title": "현정민 대표원장 | 글로우네이트·라미네이트·심미레진 전문 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 현정민 대표원장 — 서울대 석사, 통합치의학과 전문의. 글로우네이트(삭제 최소화 라미네이트)·심미레진·DSD 디지털 스마일 디자인 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "현정민 원장,서울비디치과 글로우네이트,천안 라미네이트,천안 심미치과,라미네이트 전문 치과,심미레진,앞니 라미네이트,디지털 스마일 디자인,DSD,천안 불당동 치과,삭제없는 라미네이트",
        "ai_summary": "현정민 대표원장 — 서울비디치과 대표원장, 서울대 석사, 통합치의학과 전문의. 글로우네이트(라미네이트)·심미레진·DSD 디지털 스마일 디자인 전문.",
        "faqs": [
            ("글로우네이트란 무엇인가요?", "글로우네이트(Glownate)는 서울비디치과에서 개발한 심미치료 브랜드입니다. 기존 라미네이트보다 치아 삭제량을 최소화하면서도 자연스러운 심미 효과를 제공합니다. 현정민 대표원장이 DSD(디지털 스마일 디자인) 기술을 활용해 맞춤 시술합니다."),
            ("천안에서 라미네이트 잘하는 치과는 어디인가요?", "서울비디치과 현정민 대표원장은 글로우네이트(라미네이트)·심미레진 전문으로, DSD 디지털 스마일 디자인을 활용한 정밀 시술을 제공합니다. 서울대 석사 출신 통합치의학과 전문의가 직접 진료합니다."),
            ("현정민 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '현정민 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다. 천안 불당동에서 365일 진료합니다.")
        ]
    },
    "lee-bm": {
        "name": "이병민",
        "role": "원장",
        "specialty_short": "구강내과 전문의",
        "specialty_detail": "구강내과 전문의 · 턱관절장애 · 만성통증 · 이갈이 · 코골이",
        "gender": "Male",
        "license": "29682",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 박사"],
        "credentials": ["구강내과 전문의"],
        "knows": ["Oral Medicine", "TMJ Disorders", "Orofacial Pain", "Bruxism", "Sleep Disorders", "Oral Mucosal Disease"],
        "memberships": ["대한치과의사협회", "대한구강내과학회"],
        "seo_title": "이병민 원장 | 구강내과 전문의·턱관절·이갈이·코골이 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 이병민 원장 — 서울대 치의학대학원 박사, 구강내과 전문의(천안 유일). 턱관절장애·만성 구강안면통증·이갈이·코골이·구강건조증·구강점막질환 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "이병민 원장,서울비디치과 구강내과,천안 구강내과 전문의,천안 턱관절,턱관절장애 치료,이갈이 치료,코골이 치과,구강안면통증,구강내과,천안 불당동 치과,구강건조증,구강점막질환,TMJ,아산 구강내과,세종 구강내과",
        "ai_summary": "이병민 원장 — 서울비디치과 구강내과 전문의(천안 유일), 서울대 치의학대학원 박사. 턱관절장애·만성 구강안면통증·이갈이·코골이·구강건조증·구강점막질환 전문.",
        "faqs": [
            ("천안에 구강내과 전문의가 있나요?", "네, 서울비디치과 이병민 원장은 천안 지역 유일의 구강내과 전문의입니다. 서울대 치의학대학원 박사 학위를 취득했으며, 턱관절장애·만성 구강안면통증·이갈이·코골이·구강건조증·구강점막질환을 전문으로 진료합니다. 천안·아산·세종 지역에서 구강내과 진료가 필요하시면 방문해 주세요."),
            ("구강내과는 어떤 경우에 방문해야 하나요?", "턱관절에서 소리가 나거나 아프신 경우, 입을 크게 벌리기 어려운 경우, 원인 모를 구강안면 통증, 이갈이·이악물기, 코골이, 구강건조증, 입안 점막 질환 등 다양한 증상에서 구강내과 진료가 도움이 됩니다. 다른 치과에서 원인을 찾지 못했던 증상도 편하게 상담해 주세요."),
            ("턱관절 치료는 어떻게 진행되나요?", "이병민 원장은 환자분의 상태에 따라 물리치료, 약물치료, 스플린트(구강내 장치) 등 다양한 방법을 적용합니다. 최근에는 3D 프린팅 기술을 활용해 더욱 정밀한 맞춤형 장치 제작이 가능해졌습니다. 정확한 진단 후 최적의 치료 계획을 함께 상의드립니다."),
            ("이병민 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '이병민 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다. 이병민 원장은 수·목요일에 진료합니다."),
            ("천안·아산 지역에서 이갈이 치료 받을 수 있나요?", "네, 서울비디치과 이병민 원장(구강내과 전문의)이 이갈이·이악물기 전문 진료를 제공합니다. 3D 프린팅 기반 맞춤형 스플린트 제작 등 최신 치료법을 적용합니다. 천안시 서북구 불당동에 위치하며, 아산·세종에서도 많은 환자분들이 내원하십니다.")
        ]
    },
    "lee": {
        "name": "이승엽",
        "role": "임플란트센터장",
        "specialty_short": "임플란트 전문",
        "specialty_detail": "임플란트 · 뼈이식 · 전악 임플란트 전문",
        "gender": "Male",
        "license": "29594",
        "education": ["서울대학교 치의학과"],
        "credentials": [],
        "knows": ["Implantology", "Bone Grafting", "Full Mouth Rehabilitation"],
        "memberships": ["대한치과의사협회", "대한구강악안면임플란트학회"],
        "seo_title": "이승엽 원장 | 임플란트센터장·뼈이식·전악임플란트 전문 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 이승엽 임플란트센터장 — 서울대 치의학과 졸업. 임플란트 수술 30,000건+ 경험. 뼈이식·전악 임플란트·네비게이션 임플란트 전문. 천안 6개 수술실 보유. ☎041-415-2892",
        "seo_keywords": "이승엽 원장,서울비디치과 임플란트,천안 임플란트,임플란트 전문,뼈이식,전악 임플란트,네비게이션 임플란트,천안 불당동 치과,임플란트 수술 3만건,아산 임플란트,세종 임플란트",
        "ai_summary": "이승엽 원장 — 서울비디치과 임플란트센터장, 서울대 졸업. 임플란트 수술 30,000건+ 경험. 뼈이식·전악 임플란트 전문.",
        "faqs": [
            ("천안에서 임플란트 잘하는 치과는 어디인가요?", "서울비디치과 이승엽 임플란트센터장은 누적 임플란트 수술 30,000건 이상의 풍부한 경험을 보유하고 있습니다. 6개 전용 수술실과 네비게이션 임플란트 시스템을 갖추고 있어 정밀한 시술이 가능합니다."),
            ("뼈이식이 필요한 경우에도 임플란트가 가능한가요?", "네, 이승엽 원장은 뼈이식 전문으로 뼈가 부족한 경우에도 다양한 골이식 기법을 적용하여 임플란트 시술이 가능합니다. 정확한 CT 진단 후 최적의 치료 계획을 수립합니다."),
            ("이승엽 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '이승엽 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다. 서울비디치과는 365일 진료합니다.")
        ]
    },
    "jo": {
        "name": "조설아",
        "role": "원장",
        "specialty_short": "치과보존과 전문의",
        "specialty_detail": "치과보존과 전문의 · 재신경치료 전문",
        "gender": "Female",
        "license": "29621",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사", "서울대학교 치의학대학원 박사 수료"],
        "credentials": ["치과보존과 전문의"],
        "knows": ["Conservative Dentistry", "Endodontics", "Root Canal Retreatment"],
        "memberships": ["대한치과의사협회", "대한치과보존학회"],
        "seo_title": "조설아 원장 | 치과보존과 전문의·재신경치료 전문 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 조설아 원장 — 서울대 석사, 박사 수료, 치과보존과 전문의. 재신경치료·신경치료·자연치아 보존 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "조설아 원장,서울비디치과 보존과,천안 신경치료,치과보존과 전문의,재신경치료,자연치아 보존,천안 불당동 치과,서울대 치과의사",
        "ai_summary": "조설아 원장 — 서울비디치과 치과보존과 전문의, 서울대 석사, 박사 수료. 재신경치료·자연치아 보존 전문.",
        "faqs": [
            ("조설아 원장의 전문 분야는 무엇인가요?", "조설아 원장은 서울대 치의학대학원 석사·박사 수료의 치과보존과 전문의입니다. 재신경치료와 자연치아 보존을 전문으로 하며, 발치 전 자연치아를 최대한 살리는 정밀 진료를 제공합니다."),
            ("조설아 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '조설아 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "kang-mj": {
        "name": "강민지",
        "role": "원장",
        "specialty_short": "치과보존과 전문의",
        "specialty_detail": "치과보존과 전문의 · 자연치아 보존 전문",
        "gender": "Female",
        "license": "30467",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사", "서울대학교 치의학대학원 박사 수료"],
        "credentials": ["치과보존과 전문의"],
        "knows": ["Conservative Dentistry", "Endodontics", "Natural Tooth Preservation"],
        "memberships": ["대한치과의사협회", "대한치과보존학회"],
        "seo_title": "강민지 원장 | 치과보존과 전문의·자연치아 보존 전문 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 강민지 원장 — 서울대 석사, 박사 수료, 치과보존과 전문의. 자연치아 보존·신경치료 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "강민지 원장,서울비디치과 보존과,천안 신경치료,치과보존과 전문의,자연치아 보존,천안 불당동 치과",
        "ai_summary": "강민지 원장 — 서울비디치과 치과보존과 전문의, 서울대 석사, 박사 수료. 자연치아 보존·신경치료 전문.",
        "faqs": [
            ("강민지 원장의 전문 분야는 무엇인가요?", "강민지 원장은 서울대 치의학대학원 석사·박사 수료의 치과보존과 전문의입니다. 자연치아 보존과 정밀 신경치료를 전문으로 합니다."),
            ("강민지 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '강민지 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "kang": {
        "name": "강경민",
        "role": "원장",
        "specialty_short": "임플란트 및 외과 진료 전문",
        "specialty_detail": "임플란트 · 외과진료 · 구강소수술",
        "gender": "Male",
        "license": "36098",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사", "서울대학교 치과병원 종합진료실"],
        "credentials": [],
        "knows": ["Implantology", "Oral Surgery", "Minor Oral Surgery"],
        "memberships": ["대한치과의사협회"],
        "seo_title": "강경민 원장 | 임플란트·외과진료·구강소수술 전문 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 강경민 원장 — 서울대 치의학대학원 석사. 임플란트·외과진료·구강소수술 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "강경민 원장,서울비디치과 임플란트,천안 임플란트,외과진료,구강소수술,천안 불당동 치과,서울대 치과의사",
        "ai_summary": "강경민 원장 — 서울비디치과, 서울대 석사. 임플란트·외과진료·구강소수술 전문.",
        "faqs": [
            ("강경민 원장의 전문 분야는 무엇인가요?", "강경민 원장은 서울대 치의학대학원 석사 출신으로, 임플란트·외과진료·구강소수술을 전문으로 합니다."),
            ("강경민 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '강경민 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "kim-mg": {
        "name": "김민규",
        "role": "원장",
        "specialty_short": "치과교정과 전문의",
        "specialty_detail": "교정과 전문의 · 인비절라인 · 디지털교정",
        "gender": "Male",
        "license": "29636",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사", "서울대학교 치의학대학원 박사 수료"],
        "credentials": ["치과교정과 전문의"],
        "knows": ["Orthodontics", "Invisalign", "Digital Orthodontics"],
        "memberships": ["대한치과의사협회", "대한치과교정학회"],
        "seo_title": "김민규 원장 | 치과교정과 전문의·인비절라인·디지털교정 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 김민규 원장 — 서울대 석사, 박사 수료, 치과교정과 전문의. 인비절라인·디지털교정 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "김민규 원장,서울비디치과 교정,천안 치아교정,치과교정과 전문의,인비절라인,천안 인비절라인,디지털교정,천안 불당동 치과,아산 교정,세종 교정",
        "ai_summary": "김민규 원장 — 서울비디치과 치과교정과 전문의, 서울대 석사, 박사 수료. 인비절라인·디지털교정 전문.",
        "faqs": [
            ("천안에서 인비절라인 잘하는 치과는 어디인가요?", "서울비디치과 김민규 원장은 치과교정과 전문의로, 인비절라인 및 디지털교정을 전문으로 합니다. 서울대 치의학대학원 석사·박사 수료의 전문성으로 정밀한 교정 치료를 제공합니다."),
            ("김민규 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '김민규 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "kim-mj": {
        "name": "김민진",
        "role": "원장",
        "specialty_short": "소아치과 전문의",
        "specialty_detail": "소아치과 전문의 · 영유아검진 · 성장기 교정",
        "gender": "Female",
        "license": "29815",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사", "서울대학교 치의학대학원 박사 수료"],
        "credentials": ["소아치과 전문의"],
        "knows": ["Pediatric Dentistry", "Child Dental Checkup", "Growth Stage Orthodontics"],
        "memberships": ["대한치과의사협회", "대한소아치과학회"],
        "seo_title": "김민진 원장 | 소아치과 전문의·영유아검진·성장기교정 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 김민진 원장 — 서울대 석사, 박사 수료, 소아치과 전문의. 영유아 구강검진·성장기 교정·소아 수면진료 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "김민진 원장,서울비디치과 소아치과,천안 소아치과,소아치과 전문의,영유아 검진,성장기 교정,천안 어린이 치과,소아 수면진료,천안 불당동 치과",
        "ai_summary": "김민진 원장 — 서울비디치과 소아치과 전문의, 서울대 석사, 박사 수료. 영유아검진·성장기 교정 전문.",
        "faqs": [
            ("천안에서 소아치과 전문의가 있는 치과는 어디인가요?", "서울비디치과에는 소아치과 전문의 3인이 상주합니다. 김민진 원장은 서울대 석사·박사 수료의 소아치과 전문의로, 영유아 구강검진부터 성장기 교정까지 전문 진료를 제공합니다."),
            ("김민진 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '김민진 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "lim": {
        "name": "임지원",
        "role": "원장",
        "specialty_short": "치아교정 전문",
        "specialty_detail": "치아교정 · 인비절라인 · 비수술 교정치료 전문",
        "gender": "Female",
        "license": "30724",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사"],
        "credentials": ["인비절라인 인증의"],
        "knows": ["Orthodontics", "Invisalign", "Non-surgical Orthodontics", "Class III Malocclusion"],
        "memberships": ["대한치과의사협회", "대한치과교정학회"],
        "seo_title": "임지원 원장 | 인비절라인 인증의·비수술교정·치아교정 전문 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 임지원 원장 — 서울대 석사, 인비절라인 인증의. 비수술 교정치료·3급 부정교합 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "임지원 원장,서울비디치과 교정,천안 교정,인비절라인,비수술 교정,부정교합,천안 불당동 치과,인비절라인 인증의",
        "ai_summary": "임지원 원장 — 서울비디치과, 서울대 석사, 인비절라인 인증의. 비수술 교정치료·3급 부정교합 전문.",
        "faqs": [
            ("임지원 원장의 전문 분야는 무엇인가요?", "임지원 원장은 서울대 치의학대학원 석사 출신으로, 인비절라인 인증의입니다. 비수술 교정치료와 3급 부정교합 치료를 전문으로 합니다."),
            ("임지원 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '임지원 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "choi": {
        "name": "최종훈",
        "role": "종합진료센터 센터장",
        "specialty_short": "통합치의학과 전문의",
        "specialty_detail": "사랑니 발치 · 종합진료 전문",
        "gender": "Male",
        "license": "29707",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사"],
        "credentials": ["통합치의학과 전문의"],
        "knows": ["Comprehensive Dentistry", "Wisdom Tooth Extraction", "General Dentistry"],
        "memberships": ["대한치과의사협회", "대한통합치의학회"],
        "seo_title": "최종훈 원장 | 통합치의학과 전문의·사랑니발치·종합진료 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 최종훈 원장 — 서울대 석사, 통합치의학과 전문의, 종합진료센터장. 사랑니 발치·종합진료 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "최종훈 원장,서울비디치과 종합진료,천안 사랑니,사랑니 발치,통합치의학과 전문의,천안 불당동 치과,서울대 치과의사",
        "ai_summary": "최종훈 원장 — 서울비디치과 종합진료센터장, 서울대 석사, 통합치의학과 전문의. 사랑니 발치·종합진료 전문.",
        "faqs": [
            ("최종훈 원장의 전문 분야는 무엇인가요?", "최종훈 원장은 서울대 석사 출신 통합치의학과 전문의로, 종합진료센터장을 맡고 있습니다. 사랑니 발치와 종합진료를 전문으로 합니다."),
            ("최종훈 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '최종훈 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "park-sb": {
        "name": "박수빈",
        "role": "원장",
        "specialty_short": "글로우네이트·심미레진 전문",
        "specialty_detail": "글로우네이트(라미네이트) · 심미레진 · 종합진료 · 임플란트",
        "gender": "Female",
        "license": "36650",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사", "서울대학교 치과병원 종합진료실"],
        "credentials": [],
        "knows": ["Cosmetic Dentistry", "Dental Veneers", "Composite Resin", "Implantology"],
        "memberships": ["대한치과의사협회"],
        "seo_title": "박수빈 원장 | 글로우네이트·라미네이트·심미레진·종합진료 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 박수빈 원장 — 서울대 석사. 글로우네이트(라미네이트)·심미레진·종합진료·임플란트 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "박수빈 원장,서울비디치과 글로우네이트,천안 라미네이트,심미레진,종합진료,천안 불당동 치과,서울대 치과의사",
        "ai_summary": "박수빈 원장 — 서울비디치과, 서울대 석사. 글로우네이트(라미네이트)·심미레진·종합진료·임플란트 전문.",
        "faqs": [
            ("박수빈 원장의 전문 분야는 무엇인가요?", "박수빈 원장은 서울대 석사 출신으로, 글로우네이트(라미네이트)·심미레진·종합진료·임플란트를 전문으로 합니다."),
            ("박수빈 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '박수빈 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "park": {
        "name": "박상현",
        "role": "원장",
        "specialty_short": "소아치과 전문의",
        "specialty_detail": "소아·청소년 치과 · 소아외과 · 맞춤예방관리",
        "gender": "Male",
        "license": "32197",
        "education": ["서울대학교 치의학대학원 소아치과 전문의", "서울대학교 어린이치과병원 수련"],
        "credentials": ["소아치과 전문의", "인비절라인 퍼스트 공인의", "웃음가스 진정치료 인증의"],
        "knows": ["Pediatric Dentistry", "Pediatric Oral Surgery", "Preventive Dentistry", "Invisalign First"],
        "memberships": ["대한치과의사협회", "대한소아치과학회"],
        "seo_title": "박상현 원장 | 소아치과 전문의·인비절라인 퍼스트·소아외과 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 박상현 원장 — 서울대 소아치과 전문의, 서울대 어린이치과병원 수련. 소아외과·인비절라인 퍼스트·웃음가스 진정치료 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "박상현 원장,서울비디치과 소아치과,천안 소아치과,소아치과 전문의,소아 수면진료,인비절라인 퍼스트,천안 어린이 치과,웃음가스,천안 불당동 치과",
        "ai_summary": "박상현 원장 — 서울비디치과 소아치과 전문의, 서울대 어린이치과병원 수련. 소아외과·인비절라인 퍼스트·웃음가스 진정치료 전문.",
        "faqs": [
            ("박상현 원장의 전문 분야는 무엇인가요?", "박상현 원장은 서울대 어린이치과병원에서 수련한 소아치과 전문의입니다. 소아외과·인비절라인 퍼스트·웃음가스 진정치료·소아 행동조절을 전문으로 합니다."),
            ("박상현 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '박상현 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
    "seo": {
        "name": "서희원",
        "role": "원장",
        "specialty_short": "소아치과 전문의",
        "specialty_detail": "소아치과 · 행동조절 · 성장기 교정",
        "gender": "Female",
        "license": "29630",
        "education": ["서울대학교 치의학과", "서울대학교 치의학대학원 석사", "서울대학교 치의학대학원 박사 수료"],
        "credentials": ["소아치과 전문의"],
        "knows": ["Pediatric Dentistry", "Behavior Management", "Growth Stage Orthodontics"],
        "memberships": ["대한치과의사협회", "대한소아치과학회"],
        "seo_title": "서희원 원장 | 소아치과 전문의·행동조절·성장기교정 — 서울비디치과 천안",
        "seo_desc": "서울비디치과 서희원 원장 — 서울대 석사, 박사 수료, 소아치과 전문의. 소아 행동조절·성장기 교정 전문. 천안 불당동 365일 진료. ☎041-415-2892",
        "seo_keywords": "서희원 원장,서울비디치과 소아치과,천안 소아치과,소아치과 전문의,소아 행동조절,성장기 교정,천안 어린이 치과,천안 불당동 치과",
        "ai_summary": "서희원 원장 — 서울비디치과 소아치과 전문의, 서울대 석사, 박사 수료. 소아 행동조절·성장기 교정 전문.",
        "faqs": [
            ("서희원 원장의 전문 분야는 무엇인가요?", "서희원 원장은 서울대 석사·박사 수료의 소아치과 전문의입니다. 소아 행동조절과 성장기 교정을 전문으로 하며, 아이들이 편안하게 진료받을 수 있도록 세심한 진료를 제공합니다."),
            ("서희원 원장 진료 예약은 어떻게 하나요?", "온라인 예약(bdbddc.com/reservation)에서 '서희원 원장'을 지정하시거나, 전화(041-415-2892)로 예약하시면 됩니다.")
        ]
    },
}

def process_file(slug, doc):
    filepath = f"doctors/{slug}.html"
    if not os.path.exists(filepath):
        print(f"  ⚠️ {filepath} not found, skipping")
        return False
    
    html = open(filepath, 'r', encoding='utf-8').read()
    original = html
    
    # 1. title 교체
    html = re.sub(r'<title>[^<]+</title>', f'<title>{doc["seo_title"]}</title>', html, count=1)
    
    # 2. meta description
    html = re.sub(
        r'<meta name="description" content="[^"]*">',
        f'<meta name="description" content="{doc["seo_desc"]}">',
        html, count=1
    )
    
    # 3. meta abstract
    html = re.sub(
        r'<meta name="abstract" content="[^"]*">',
        f'<meta name="abstract" content="{doc["seo_desc"]}">',
        html, count=1
    )
    
    # 4. ai-summary
    html = re.sub(
        r'<meta name="ai-summary" content="[^"]*">',
        f'<meta name="ai-summary" content="{doc["ai_summary"]}">',
        html, count=1
    )
    
    # 5. meta keywords
    html = re.sub(
        r'<meta name="keywords" content="[^"]*">',
        f'<meta name="keywords" content="{doc["seo_keywords"]}">',
        html, count=1
    )
    
    # 6. OG title
    html = re.sub(
        r'<meta property="og:title" content="[^"]*">',
        f'<meta property="og:title" content="{doc["seo_title"]}">',
        html, count=1
    )
    
    # 7. OG description
    html = re.sub(
        r'<meta property="og:description" content="[^"]*">',
        f'<meta property="og:description" content="{doc["seo_desc"]}">',
        html, count=1
    )
    
    # 8. Twitter title
    html = re.sub(
        r'<meta name="twitter:title" content="[^"]*">',
        f'<meta name="twitter:title" content="{doc["seo_title"]}">',
        html, count=1
    )
    
    # 9. Twitter description
    html = re.sub(
        r'<meta name="twitter:description" content="[^"]*">',
        f'<meta name="twitter:description" content="{doc["seo_desc"]}">',
        html, count=1
    )
    
    # 10. Schema.org Person - 이름, 직함, 설명 수정
    # @id 수정
    html = re.sub(
        r'"@id": "https://bdbddc\.com/#[^"]*"',
        f'"@id": "https://bdbddc.com/#{doc["name"]}"',
        html, count=1
    )
    # name 수정 (Person schema 내부)
    html = re.sub(
        r'("@type": "Person"[^}]*?"name": ")[^"]*(")',
        lambda m: m.group(1) + doc["name"] + m.group(2),
        html, count=1
    )
    # jobTitle 수정
    html = re.sub(
        r'"jobTitle": "[^"]*"',
        f'"jobTitle": "{doc["role"]} · {doc["specialty_short"]}"',
        html, count=1
    )
    # description 수정 (Person schema)
    desc_schema = f'{doc["name"]} — 서울비디치과 {doc["role"]}, {doc["specialty_detail"]}'
    html = re.sub(
        r'("@type": "Person"[^}]*?"description": ")[^"]*(")',
        lambda m: m.group(1) + desc_schema + m.group(2),
        html, count=1
    )
    # gender 수정
    html = re.sub(
        r'"gender": "[^"]*"',
        f'"gender": "{doc["gender"]}"',
        html, count=1
    )
    
    # knowsAbout 수정
    knows_json = json.dumps(doc["knows"], ensure_ascii=False)
    html = re.sub(
        r'"knowsAbout": \[[^\]]*\]',
        f'"knowsAbout": {knows_json}',
        html, count=1
    )
    
    # 11. FAQPage Schema 교체
    faq_entries = []
    for q, a in doc["faqs"]:
        faq_entries.append({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": a
            }
        })
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq_entries
    }
    faq_json = json.dumps(faq_schema, ensure_ascii=False, separators=(',', ': '))
    
    # 기존 FAQPage 교체
    html = re.sub(
        r'<script type="application/ld\+json">\s*\{[^<]*"@type":\s*"FAQPage"[^<]*\}\s*</script>',
        f'<script type="application/ld+json">\n  {faq_json}\n  </script>',
        html, count=1
    )
    
    if html != original:
        open(filepath, 'w', encoding='utf-8').write(html)
        return True
    return False

# ────────────────────────────────────────
# 실행
# ────────────────────────────────────────
os.chdir('/home/user/webapp')
changed = 0
for slug, doc in DOCTORS.items():
    print(f"Processing {slug} ({doc['name']})...")
    if process_file(slug, doc):
        changed += 1
        print(f"  ✅ Updated")
    else:
        print(f"  ⏭️ No changes")

print(f"\n✅ {changed}/{len(DOCTORS)} files updated")
