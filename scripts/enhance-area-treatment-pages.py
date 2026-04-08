#!/usr/bin/env python3
"""
서울비디치과 지역×치료 60페이지 고도화 스크립트
================================================
1. "에서에서" 조사 중복 버그 수정 (33개 파일)
2. 잘못된 GTM/GA4/Amplitude ID 통일 (21개 파일)
3. analytics.js 추가 (21개 파일)
4. 모든 CTA에 data-area, data-treatment, data-cta 속성 삽입 (60개 파일)
5. "왜 [지역]에서 서울비디치과인가?" 고유 콘텐츠 섹션 삽입 (60개 파일)
"""

import os, re, json, sys

AREA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'area')

# ═══════════════════════════════════════════
# 지역별 고유 데이터 (콘텐츠 차별화 핵심)
# ═══════════════════════════════════════════
REGION_DATA = {
    "asan": {
        "name": "아산", "suffix": "시", "pop": "약 35만",
        "drive_min": 20, "drive_km": 20,
        "highway": "천안-아산 고속도로",
        "ktx": "천안아산역(KTX) 하차 → 택시 10분",
        "bus": "아산역에서 시외버스 또는 택시 이용",
        "landmarks": "온양온천, 현충사, 아산시청, 아산 테크노밸리",
        "why_unique": "아산은 삼성 디스플레이·반도체 클러스터가 있어 직장인 환자분이 많습니다. 퇴근 후 야간진료(20시)와 주말진료를 활용해 내원 부담 없이 치료받으실 수 있습니다.",
        "patient_profile": "삼성단지 직장인·아산신도시 가족 단위 환자분이 주로 방문합니다.",
        "tip": "천안아산역(KTX)에서 택시 10분이면 도착하므로, 삼성 셔틀버스 이용자도 출퇴근 경로에 쉽게 들를 수 있습니다."
    },
    "sejong": {
        "name": "세종", "suffix": "시", "pop": "약 40만",
        "drive_min": 35, "drive_km": 40,
        "highway": "세종-천안 고속도로 / 국도 1호선",
        "ktx": "오송역(KTX) → 택시 25분 또는 세종고속터미널 → 천안행 버스 35분",
        "bus": "세종고속터미널 → 천안행 시외버스(약 35분)",
        "landmarks": "세종시청, 정부세종청사, 세종호수공원, 조치원역",
        "why_unique": "세종은 공무원·공공기관 종사자 가족이 많아 꼼꼼한 치료 설명과 체계적인 치료 계획을 원하시는 분이 많습니다. 서울비디치과는 15인 원장이 사전 회의 후 치료 계획을 제안하는 '협진 시스템'으로 이런 니즈를 충족합니다.",
        "patient_profile": "정부청사 공무원·세종시 신도시 가족 단위 환자분이 주로 방문합니다.",
        "tip": "세종시에서 오시는 분은 조치원 방면 국도 1호선 이용 시 40분 이내로 도착할 수 있습니다."
    },
    "dangjin": {
        "name": "당진", "suffix": "시", "pop": "약 17만",
        "drive_min": 50, "drive_km": 60,
        "highway": "서해안고속도로 → 당진-천안 연결도로",
        "ktx": "해당 없음 (자가용 또는 버스 권장)",
        "bus": "당진종합터미널 → 천안행 시외버스(약 70분)",
        "landmarks": "당진시청, 삽교호관광지, 합덕수리시설, 현대제철",
        "why_unique": "당진은 현대제철 등 대규모 산업단지가 있어 산업재해 후 치아 보철이나 고난도 임플란트 수요가 높습니다. 서울비디치과는 15인 원장 협진으로 고난도 케이스도 자신 있게 진행합니다.",
        "patient_profile": "현대제철 직장인·당진시 거주 중장년 환자분이 주로 방문합니다.",
        "tip": "서해안고속도로 송악IC 경유 시 약 50분이면 도착합니다. 주말 나들이 겸 내원하시는 분도 많습니다."
    },
    "hongseong": {
        "name": "홍성", "suffix": "군", "pop": "약 10만",
        "drive_min": 45, "drive_km": 50,
        "highway": "서해안고속도로 → 홍성IC → 천안",
        "ktx": "홍성역(KTX) → 천안아산역(KTX) 약 20분 + 택시 10분",
        "bus": "홍성터미널 → 천안행 시외버스(약 60분)",
        "landmarks": "홍성군청, 홍주읍성, 홍성전통시장, 홍북읍 내포신도시",
        "why_unique": "홍성은 내포신도시가 성장하면서 젊은 가족 환자가 늘고 있습니다. 소아치과 전문의 3인이 상주하는 서울비디치과에서 자녀와 함께 가족 치과 진료를 받으시는 분이 많습니다.",
        "patient_profile": "내포신도시 입주 가족·홍성읍 중장년 환자분이 주로 방문합니다.",
        "tip": "홍성역에서 KTX 이용 시 천안아산역까지 20분이면 도착합니다."
    },
    "yesan": {
        "name": "예산", "suffix": "군", "pop": "약 8만",
        "drive_min": 40, "drive_km": 45,
        "highway": "당진-대전고속도로 → 예산IC",
        "ktx": "예산역(KTX 미정차) → 천안아산역 환승",
        "bus": "예산터미널 → 천안행 시외버스(약 50분)",
        "landmarks": "예산군청, 덕산온천, 수덕사, 예당호 출렁다리",
        "why_unique": "예산은 덕산온천·수덕사 관광객이 많은 지역으로, 관광 일정에 맞춰 치과 상담을 받으시는 분도 계십니다. 365일 진료하므로 주말·공휴일 방문도 가능합니다.",
        "patient_profile": "예산읍·덕산면 거주 환자분, 관광객 겸 내원 환자분이 방문합니다.",
        "tip": "당진-대전고속도로 예산IC에서 약 40분이면 도착합니다. 덕산온천 여행 전후 내원 가능합니다."
    },
    "seosan": {
        "name": "서산", "suffix": "시", "pop": "약 18만",
        "drive_min": 55, "drive_km": 65,
        "highway": "서해안고속도로 서산IC → 천안",
        "ktx": "해당 없음 (자가용 또는 버스 권장)",
        "bus": "서산터미널 → 천안행 시외버스(약 80분)",
        "landmarks": "서산시청, 해미읍성, 서산 버드랜드, 용현자연휴양림",
        "why_unique": "서산은 서해안 산업벨트의 중심지로, 현대오일뱅크·롯데케미칼 직장인 환자분이 많습니다. 발치 즉시 임플란트로 내원 횟수를 최소화하는 치료 계획을 세워드립니다.",
        "patient_profile": "서산 산업단지 직장인·서산시내 중장년 환자분이 주로 방문합니다.",
        "tip": "서해안고속도로 서산IC 경유, 야간진료(20시)를 활용하면 퇴근 후 내원도 가능합니다."
    },
    "gongju": {
        "name": "공주", "suffix": "시", "pop": "약 10만",
        "drive_min": 40, "drive_km": 45,
        "highway": "천안-논산고속도로 공주IC",
        "ktx": "공주역(KTX) → 천안아산역(KTX) 약 15분 + 택시 10분",
        "bus": "공주종합터미널 → 천안행 시외버스(약 50분)",
        "landmarks": "공산성(유네스코), 무령왕릉, 공주대학교, 공주시청",
        "why_unique": "공주는 유네스코 세계유산 도시로 문화적 자부심이 높은 지역입니다. 서울비디치과는 서울대병원급 시설을 갖춘 충남 유일의 대형 치과로, 공주 환자분들의 '제대로 된 치료' 기대에 부응합니다.",
        "patient_profile": "공주대학교 교직원·공주시 거주 환자분이 주로 방문합니다.",
        "tip": "공주역에서 KTX로 천안아산역까지 15분이면 도착합니다. 대중교통이 가장 편리한 루트입니다."
    },
    "cheongyang": {
        "name": "청양", "suffix": "군", "pop": "약 3만",
        "drive_min": 50, "drive_km": 55,
        "highway": "천안-논산고속도로 공주IC 경유",
        "ktx": "해당 없음 (자가용 권장)",
        "bus": "청양터미널 → 공주 환승 → 천안(약 70분)",
        "landmarks": "청양군청, 칠갑산, 고운식물원, 청양고추축제",
        "why_unique": "청양은 농촌 지역으로 고령 환자분 비율이 높습니다. 서울비디치과의 수면 임플란트와 전신질환 관리 하 안전 시술이 고령 환자분에게 특히 적합합니다.",
        "patient_profile": "청양읍·정산면 거주 중장년·고령 환자분이 주로 방문합니다.",
        "tip": "자녀분이 운전해서 모시고 오시는 경우가 많습니다. 건물 내 무료 주차 30대 가능합니다."
    },
    "taean": {
        "name": "태안", "suffix": "군", "pop": "약 6만",
        "drive_min": 65, "drive_km": 75,
        "highway": "서해안고속도로 → 태안방면",
        "ktx": "해당 없음 (자가용 권장)",
        "bus": "태안터미널 → 천안행 시외버스(약 90분)",
        "landmarks": "태안군청, 안면도, 태안해안국립공원, 만리포해수욕장",
        "why_unique": "태안은 관광·수산업 중심 지역으로, 주말 관광객이 많습니다. 서울비디치과는 일요일·공휴일에도 진료하므로, 안면도 여행과 치과 상담을 동시에 계획하실 수 있습니다.",
        "patient_profile": "태안읍·안면읍 거주 환자분, 주말 관광 겸 방문 환자분이 계십니다.",
        "tip": "안면도에서 오시는 경우 서해안고속도로 이용 시 약 65분 소요됩니다."
    },
    "anseong": {
        "name": "안성", "suffix": "시", "pop": "약 19만",
        "drive_min": 45, "drive_km": 50,
        "highway": "경부고속도로 → 안성IC → 평택-천안",
        "ktx": "해당 없음 (자가용 권장)",
        "bus": "안성터미널 → 천안행 시외버스(약 60분)",
        "landmarks": "안성시청, 안성맞춤랜드, 안성팜랜드, 서운산",
        "why_unique": "안성은 경기 남부에서 충남으로 넘어오는 길목에 있어, 서울·수도권 치과 대비 합리적인 비용에 서울대병원급 시설을 이용할 수 있다는 점이 매력입니다.",
        "patient_profile": "안성시 거주 가족·경기 남부 직장인 환자분이 주로 방문합니다.",
        "tip": "평택-천안 구간 고속도로 이용 시 약 45분이면 도착합니다."
    },
    "pyeongtaek": {
        "name": "평택", "suffix": "시", "pop": "약 58만",
        "drive_min": 40, "drive_km": 50,
        "highway": "경부고속도로 → 평택-천안 구간",
        "ktx": "평택역 → 천안아산역(KTX) 약 20분",
        "bus": "평택역 주변 → 천안행 시외버스(약 50분)",
        "landmarks": "평택시청, 미군기지(험프리스), 삼성전자 평택캠퍼스, 평택호",
        "why_unique": "평택은 삼성전자 반도체 캠퍼스·미군기지가 있어 한국인뿐 아니라 외국인 환자도 방문합니다. 서울비디치과는 Weglot 다국어 지원으로 영어 상담이 가능합니다.",
        "patient_profile": "삼성전자 평택 직장인·주한미군 가족·평택시 거주 환자분이 방문합니다.",
        "tip": "평택역에서 전철·KTX로 천안아산역까지 20분이면 이동 가능합니다."
    },
    "osan": {
        "name": "오산", "suffix": "시", "pop": "약 23만",
        "drive_min": 50, "drive_km": 60,
        "highway": "경부고속도로 → 오산IC → 천안",
        "ktx": "오산역(1호선) → 천안아산역 약 40분 (전철 환승)",
        "bus": "오산터미널 → 천안행 시외버스(약 70분)",
        "landmarks": "오산시청, 오산 죽미령평화공원, 물향기수목원",
        "why_unique": "오산은 수도권 남부에서 접근성이 좋은 위치입니다. 서울 강남·분당 치과 대비 대기 없이 바로 진료받을 수 있고, 비용도 합리적입니다.",
        "patient_profile": "오산시 거주 가족·동탄신도시 환자분이 주로 방문합니다.",
        "tip": "경부고속도로 이용 시 약 50분, 퇴근 시간대는 1시간 정도 예상하세요."
    },
    "jincheon": {
        "name": "진천", "suffix": "군", "pop": "약 9만",
        "drive_min": 35, "drive_km": 35,
        "highway": "중부고속도로 진천IC → 천안",
        "ktx": "해당 없음 (자가용 권장)",
        "bus": "진천터미널 → 천안행 시외버스(약 40분)",
        "landmarks": "진천군청, 농다리, 진천종박물관, 초평호",
        "why_unique": "진천은 충북 혁신도시가 있어 공공기관 종사자 가족이 늘고 있습니다. 서울비디치과까지 35분이면 도착하는 가까운 거리로, 점심시간 상담도 가능합니다.",
        "patient_profile": "진천 혁신도시 공공기관 직원·진천읍 거주 환자분이 방문합니다.",
        "tip": "중부고속도로 진천IC에서 35분이면 도착합니다. 가장 가까운 지역 중 하나입니다."
    },
    "daejeon": {
        "name": "대전", "suffix": "광역시", "pop": "약 150만",
        "drive_min": 40, "drive_km": 50,
        "highway": "경부고속도로 → 천안IC",
        "ktx": "대전역(KTX) → 천안아산역(KTX) 약 15분 + 택시 10분",
        "bus": "대전복합터미널 → 천안행 시외버스(약 50분) → 택시 10분",
        "landmarks": "대전역, 유성온천, 엑스포과학공원, 대전시청, KAIST, 대전둔산",
        "why_unique": "대전에는 대형 치과가 많지만, 서울비디치과는 400평 규모에 6개 독립 수술실, 15인 원장 협진, 네비게이션 가이드·수면 마취 전문의 상주 등 대전에서도 찾기 어려운 시설을 갖추고 있습니다. KTX 15분이면 올 수 있습니다.",
        "patient_profile": "대전 유성구·둔산동 거주 환자분, KAIST·충남대 관계자분이 방문합니다.",
        "tip": "대전역에서 KTX로 천안아산역까지 15분! 가장 빠르고 편리한 교통수단입니다."
    },
    "cheongju": {
        "name": "청주", "suffix": "시", "pop": "약 85만",
        "drive_min": 45, "drive_km": 55,
        "highway": "경부고속도로 → 남이JC → 천안",
        "ktx": "오송역(KTX) → 천안아산역(KTX) 약 10분 + 택시 10분",
        "bus": "청주시외버스터미널 → 천안행(약 60분)",
        "landmarks": "청주시청, 수암골벽화마을, 청주 무심천, 국립청주박물관, 오송역",
        "why_unique": "청주는 충북 최대 도시로 의료 인프라가 잘 되어있지만, 서울비디치과의 15인 원장 협진과 6개 독립 수술실 규모는 청주에서도 찾기 어렵습니다. 오송역(KTX)에서 10분이면 도착합니다.",
        "patient_profile": "청주 흥덕구·서원구 거주 환자분, 오송 바이오밸리 직장인이 방문합니다.",
        "tip": "오송역(KTX)에서 천안아산역까지 단 10분! 가장 빠른 접근 루트입니다."
    },
    "nonsan": {
        "name": "논산", "suffix": "시", "pop": "약 12만",
        "drive_min": 40, "drive_km": 45,
        "highway": "천안-논산고속도로 → 천안IC",
        "ktx": "논산역 → 천안아산역 환승(약 30분)",
        "bus": "논산터미널 → 천안행 시외버스(약 50분)",
        "landmarks": "논산시청, 관촉사, 논산딸기축제, 육군훈련소",
        "why_unique": "논산은 육군훈련소 면회 길에 치과 상담을 겸하시는 분이 계십니다. 천안-논산고속도로 개통으로 40분이면 도착하는 가까운 거리입니다.",
        "patient_profile": "논산시 거주 환자분·군입대 전 치과 검진 환자분이 방문합니다.",
        "tip": "천안-논산고속도로 이용 시 가장 빠릅니다. 40분이면 도착합니다."
    },
    "gyeryong": {
        "name": "계룡", "suffix": "시", "pop": "약 4만",
        "drive_min": 35, "drive_km": 40,
        "highway": "천안-논산고속도로 → 천안IC",
        "ktx": "해당 없음 (자가용 권장)",
        "bus": "계룡시 → 대전 환승 → 천안(약 60분)",
        "landmarks": "계룡시청, 계룡대(3군사령부), 계룡산국립공원",
        "why_unique": "계룡은 3군사령부가 있는 군사도시로, 군인·군무원 가족 환자분이 많습니다. 서울비디치과는 365일 진료로 주말·공휴일에도 편하게 내원하실 수 있습니다.",
        "patient_profile": "계룡대 군인·군무원 가족, 계룡시 거주 환자분이 방문합니다.",
        "tip": "천안-논산고속도로 이용 시 약 35분이면 도착합니다."
    },
    "chungju": {
        "name": "충주", "suffix": "시", "pop": "약 21만",
        "drive_min": 55, "drive_km": 65,
        "highway": "중부고속도로 → 천안IC",
        "ktx": "충주역 → 오송역(KTX) 환승 → 천안아산역",
        "bus": "충주터미널 → 천안행 시외버스(약 80분)",
        "landmarks": "충주시청, 탄금대, 수안보온천, 충주호, 중앙탑",
        "why_unique": "충주는 수안보온천 관광객이 많고, 중장년 환자분 비율이 높은 지역입니다. 서울비디치과의 수면 임플란트는 고령·전신질환 환자분도 안전하게 시술받으실 수 있어 충주에서 특히 선호됩니다.",
        "patient_profile": "충주시 거주 중장년·수안보온천 관광 겸 방문 환자분이 계십니다.",
        "tip": "중부고속도로 이용 시 약 55분. 수안보온천 여행과 치과 상담을 동시에 계획하세요."
    },
    "eumseong": {
        "name": "음성", "suffix": "군", "pop": "약 10만",
        "drive_min": 35, "drive_km": 40,
        "highway": "중부고속도로 음성IC → 천안",
        "ktx": "해당 없음 (자가용 권장)",
        "bus": "음성터미널 → 천안행 시외버스(약 45분)",
        "landmarks": "음성군청, 꽃동네, 감곡생태공원, 음성 맹동산업단지",
        "why_unique": "음성은 충북 혁신도시와 인접하고, 맹동산업단지 직장인 환자분이 많습니다. 서울비디치과까지 35분이면 도착하는 가까운 거리입니다.",
        "patient_profile": "음성읍·맹동면 산업단지 직장인, 음성군 거주 가족 환자분이 방문합니다.",
        "tip": "중부고속도로 음성IC에서 35분이면 도착합니다. 진천·음성 환자분은 가장 접근성이 좋습니다."
    },
    "buyeo": {
        "name": "부여", "suffix": "군", "pop": "약 6만",
        "drive_min": 55, "drive_km": 65,
        "highway": "천안-논산고속도로 경유",
        "ktx": "논산역 환승 → 천안아산역(KTX) + 택시 10분",
        "bus": "부여터미널 → 논산 환승 → 천안(약 70분)",
        "landmarks": "부여군청, 백제문화단지, 부소산성, 궁남지, 정림사지",
        "why_unique": "부여는 유네스코 세계유산 백제 역사도시로, 관광객이 많습니다. 서울비디치과는 발치 즉시 임플란트로 먼 거리에서 오시는 분의 내원 횟수를 최소화합니다.",
        "patient_profile": "부여읍 거주 중장년·관광 겸 내원 환자분이 방문합니다.",
        "tip": "천안-논산고속도로 경유 시 약 55분. 백제문화단지 여행과 병행 가능합니다."
    },
}

# ═══════════════════════════════════════════
# 치료별 관련 링크 데이터
# ═══════════════════════════════════════════
TREATMENT_DATA = {
    "implant": {
        "name_ko": "임플란트",
        "icon": "fas fa-tooth",
        "related_links": [
            ("/treatments/implant", "임플란트 센터 자세히 보기"),
            ("/treatments/implant-sedation", "수면 임플란트"),
            ("/treatments/implant-navigation", "네비게이션 임플란트"),
            ("/treatments/implant-sinus-lift", "상악동거상술"),
        ]
    },
    "invisalign": {
        "name_ko": "인비절라인",
        "icon": "fas fa-teeth",
        "related_links": [
            ("/treatments/invisalign", "인비절라인 센터 자세히 보기"),
            ("/treatments/orthodontics", "치아교정 전체"),
            ("/treatments/ortho-best", "인비절라인 종합교정"),
            ("/treatments/ortho-light", "인비절라인 라이트"),
        ]
    },
    "laminate": {
        "name_ko": "라미네이트",
        "icon": "fas fa-magic",
        "related_links": [
            ("/treatments/glownate", "글로우네이트 심미레진"),
            ("/treatments/whitening", "치아 미백"),
            ("/treatments/aesthetic", "심미 치료"),
            ("/treatments/crown", "크라운 보철"),
        ]
    }
}

# ═══════════════════════════════════════════
# 올바른 트래킹 ID
# ═══════════════════════════════════════════
CORRECT_GTM = "GTM-KKVMVZHK"
WRONG_GTM = "GTM-PJFW5VHL"
CORRECT_GA4 = "G-3NQP355YQM"
WRONG_GA4 = "G-WBHDS3LFCM"
CORRECT_AMP_KEY = "87529341cb075dcdbefabce3994958aa"
WRONG_AMP_KEY = "edbed1f10a9e0142bd0e5e81d1a664cc"

# ═══════════════════════════════════════════
# 처리 함수들
# ═══════════════════════════════════════════

def fix_postposition_bug(content):
    """'에서에서' → '에서' 수정"""
    return content.replace('에서에서', '에서')

def fix_tracking_ids(content):
    """잘못된 GTM/GA4/Amplitude ID를 올바른 것으로 교체"""
    content = content.replace(WRONG_GTM, CORRECT_GTM)
    content = content.replace(WRONG_GA4, CORRECT_GA4)
    content = content.replace(WRONG_AMP_KEY, CORRECT_AMP_KEY)
    return content

def remove_wrong_analytics_block(content):
    """배치 2/3의 인라인 GA4/Amplitude 스니펫을 제거하고 통합 analytics.js로 교체"""
    # Remove inline GA4 config (already in analytics.js)
    content = re.sub(
        r'<script>window\.dataLayer=window\.dataLayer\|\|\[\];function gtag\(\)\{dataLayer\.push\(arguments\);\}gtag\(\'js\',new Date\(\)\);gtag\(\'config\',\'G-3NQP355YQM\'\);</script>\n?',
        '',
        content
    )
    # Remove old inline Amplitude snippet (long block)
    content = re.sub(
        r'  <!-- Amplitude -->\n  <script>!function\(\)\{.*?</script>\n  <script>amplitude\.init\(\'[^\']+\'.*?</script>\n',
        '  <!-- Amplitude -->\n  <script src="https://cdn.amplitude.com/script/87529341cb075dcdbefabce3994958aa.js"></script>\n',
        content,
        flags=re.DOTALL
    )
    return content

def add_analytics_js(content):
    """analytics.js가 없는 파일에 추가"""
    if 'analytics.js' in content:
        return content
    # </head> 바로 앞에 추가
    analytics_tag = '  <script src="/js/analytics.js?v=20260408v6" defer></script>\n'
    content = content.replace('</head>', analytics_tag + '</head>')
    return content

def add_data_attributes_to_ctas(content, area_slug, treatment_slug):
    """모든 CTA 버튼에 data-area, data-treatment, data-cta 속성 추가"""
    area_name = REGION_DATA.get(area_slug, {}).get("name", area_slug)
    treatment_name = TREATMENT_DATA.get(treatment_slug, {}).get("name_ko", treatment_slug)
    
    # 전화 링크: tel:
    content = re.sub(
        r'<a\s+href="tel:([^"]+)"(?![^>]*data-cta)',
        lambda m: f'<a href="tel:{m.group(1)}" data-cta="phone" data-area="{area_slug}" data-treatment="{treatment_slug}"',
        content
    )
    
    # 예약 링크: reservation 또는 naver.me
    content = re.sub(
        r'<a\s+href="([^"]*(?:reservation|naver\.me)[^"]*)"(?![^>]*data-cta)',
        lambda m: f'<a href="{m.group(1)}" data-cta="reservation" data-area="{area_slug}" data-treatment="{treatment_slug}"',
        content
    )
    
    # 카카오 링크: kakao
    content = re.sub(
        r'<a\s+href="([^"]*(?:pf\.kakao|kakao)[^"]*)"(?![^>]*data-cta)',
        lambda m: f'<a href="{m.group(1)}" data-cta="kakao" data-area="{area_slug}" data-treatment="{treatment_slug}"',
        content
    )
    
    # 지도/길찾기 링크: directions, map
    content = re.sub(
        r'<a\s+href="([^"]*(?:\/directions|map\.naver|nmap)[^"]*)"(?![^>]*data-cta)',
        lambda m: f'<a href="{m.group(1)}" data-cta="directions" data-area="{area_slug}" data-treatment="{treatment_slug}"',
        content
    )
    
    return content

def generate_why_section(area_slug, treatment_slug):
    """'왜 [지역]에서 서울비디치과인가?' 고유 콘텐츠 섹션 HTML 생성"""
    region = REGION_DATA.get(area_slug)
    treatment = TREATMENT_DATA.get(treatment_slug)
    if not region or not treatment:
        return ""
    
    area_name = region["name"]
    treatment_name = treatment["name_ko"]
    
    html = f'''
  <!-- ═══════ WHY BD FROM {area_slug.upper()} (고유 콘텐츠) ═══════ -->
  <section class="why-bd-section section" aria-label="왜 {area_name}에서 서울비디치과인가" data-area="{area_slug}" data-treatment="{treatment_slug}" style="background:linear-gradient(135deg,#faf8f5 0%,#f5efe8 100%);">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-map-marked-alt"></i> {area_name} 환자 안내</span>
        <h2 class="section-title">왜 <span class="text-gradient">{area_name}</span>에서<br>서울비디치과를 선택할까요?</h2>
      </div>
      <div style="max-width:800px;margin:0 auto;">
        <!-- 지역 고유 이유 -->
        <div class="why-hero-card reveal" style="margin-bottom:20px;border-left:4px solid var(--brand-gold,#B8860B);">
          <h3 style="font-size:1.1rem;margin-bottom:10px;"><i class="fas fa-lightbulb" style="color:var(--brand-gold,#B8860B);margin-right:8px;"></i>{area_name}{region["suffix"]} 환자분을 위한 안내</h3>
          <p style="font-size:0.95rem;line-height:1.8;margin-bottom:12px;">{region["why_unique"]}</p>
          <p style="font-size:0.9rem;color:#666;"><i class="fas fa-users" style="margin-right:6px;"></i>{region["patient_profile"]}</p>
        </div>
        <!-- 접근성 핵심 정보 -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:20px;" class="reveal">
          <div class="why-hero-card" style="text-align:center;padding:20px;">
            <div style="font-size:2rem;font-weight:800;color:var(--brand-primary,#6B4226);">{region["drive_min"]}분</div>
            <div style="font-size:0.85rem;color:#888;">자가용 소요시간</div>
            <div style="font-size:0.8rem;color:#aaa;margin-top:4px;">약 {region["drive_km"]}km</div>
          </div>
          <div class="why-hero-card" style="text-align:center;padding:20px;">
            <div style="font-size:2rem;font-weight:800;color:var(--brand-primary,#6B4226);">15인</div>
            <div style="font-size:0.85rem;color:#888;">서울대 출신 원장</div>
            <div style="font-size:0.8rem;color:#aaa;margin-top:4px;">협진 시스템</div>
          </div>
          <div class="why-hero-card" style="text-align:center;padding:20px;">
            <div style="font-size:2rem;font-weight:800;color:var(--brand-primary,#6B4226);">365일</div>
            <div style="font-size:0.85rem;color:#888;">연중무휴 진료</div>
            <div style="font-size:0.8rem;color:#aaa;margin-top:4px;">야간 20시까지</div>
          </div>
        </div>
        <!-- 실용 팁 -->
        <div class="why-hero-card reveal" style="background:linear-gradient(135deg,#6B4226 0%,#8B5A3C 100%);color:#fff;border:none;">
          <h3 style="font-size:1rem;margin-bottom:8px;color:#FFD700;"><i class="fas fa-star" style="margin-right:6px;"></i>{area_name}에서 오시는 꿀팁</h3>
          <p style="font-size:0.92rem;line-height:1.8;opacity:0.95;">{region["tip"]}</p>
          <p style="font-size:0.85rem;margin-top:10px;opacity:0.8;"><i class="fas fa-map-pin" style="margin-right:4px;"></i>주변 랜드마크: {region["landmarks"]}</p>
        </div>
      </div>
    </div>
  </section>
'''
    return html

def find_insertion_point_for_why_section(content):
    """CTA 섹션 바로 앞에 고유 콘텐츠 삽입할 위치 찾기"""
    # CTA section 찾기 (두 가지 패턴)
    patterns = [
        r'(  <!-- ═══════ CTA ═══════ -->)',
        r'(  <!-- ═+\s*CTA\s*═+ -->)',
        r'(<section class="cta-section)',
    ]
    for pat in patterns:
        match = re.search(pat, content)
        if match:
            return match.start()
    return -1

def process_file(filepath, area_slug, treatment_slug):
    """단일 파일 처리"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    changes = []
    
    # 1. "에서에서" 수정
    if '에서에서' in content:
        content = fix_postposition_bug(content)
        changes.append("에서에서 버그 수정")
    
    # 2. 트래킹 ID 통일
    if WRONG_GTM in content or WRONG_GA4 in content or WRONG_AMP_KEY in content:
        content = fix_tracking_ids(content)
        changes.append("트래킹 ID 통일")
    
    # 3. 인라인 Amplitude 스니펫 정리 + analytics.js 추가
    if 'analytics.js' not in content:
        content = remove_wrong_analytics_block(content)
        content = add_analytics_js(content)
        changes.append("analytics.js 추가")
    
    # 4. CTA data-attribute 추가
    if 'data-cta=' not in content:
        content = add_data_attributes_to_ctas(content, area_slug, treatment_slug)
        changes.append("CTA data-attribute 추가")
    
    # 5. "왜 서울비디치과인가" 고유 섹션 추가
    if 'why-bd-section' not in content and area_slug in REGION_DATA:
        why_html = generate_why_section(area_slug, treatment_slug)
        if why_html:
            insert_pos = find_insertion_point_for_why_section(content)
            if insert_pos > 0:
                content = content[:insert_pos] + why_html + '\n' + content[insert_pos:]
                changes.append("고유 콘텐츠 섹션 삽입")
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes
    return []

# ═══════════════════════════════════════════
# 메인 실행
# ═══════════════════════════════════════════
def main():
    files = sorted([f for f in os.listdir(AREA_DIR) if f.endswith('.html') and '-' in f])
    
    total_changes = 0
    change_summary = {
        "에서에서 버그 수정": 0,
        "트래킹 ID 통일": 0,
        "analytics.js 추가": 0,
        "CTA data-attribute 추가": 0,
        "고유 콘텐츠 섹션 삽입": 0,
    }
    
    for fname in files:
        # Parse area slug and treatment slug from filename
        # e.g., "asan-implant.html" → area="asan", treatment="implant"
        base = fname.replace('.html', '')
        parts = base.rsplit('-', 1)
        if len(parts) != 2:
            print(f"  SKIP: {fname} (unexpected format)")
            continue
        area_slug, treatment_slug = parts
        
        filepath = os.path.join(AREA_DIR, fname)
        changes = process_file(filepath, area_slug, treatment_slug)
        
        if changes:
            total_changes += 1
            for c in changes:
                if c in change_summary:
                    change_summary[c] += 1
            print(f"  ✅ {fname}: {', '.join(changes)}")
        else:
            print(f"  ⏭️  {fname}: no changes needed")
    
    print(f"\n{'='*60}")
    print(f"총 {len(files)}개 파일 스캔, {total_changes}개 파일 수정됨")
    print(f"{'='*60}")
    for k, v in change_summary.items():
        print(f"  {k}: {v}개")

if __name__ == "__main__":
    main()
