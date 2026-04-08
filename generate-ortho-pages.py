#!/usr/bin/env python3
"""Generate 5 orthodontic (Invisalign) program detail pages for Seoul BD Dental."""

import os

PAGES = [
    {
        "slug": "invisalign-best",
        "badge_label": "BEST",
        "badge_bg": "#6B4226",
        "name_ko": "인비절라인 컴프리헨시브",
        "name_en": "Comprehensive",
        # Already exists, skip
        "skip": True,
    },
    {
        "slug": "invisalign-moderate",
        "badge_label": "MODERATE",
        "badge_bg": "#0369a1",
        "name_ko": "인비절라인 모더레이트",
        "name_en": "Moderate",
        "skip": True,  # Already exists
    },
    {
        "slug": "invisalign-light",
        "badge_label": "LIGHT",
        "badge_bg": "#059669",
        "name_ko": "인비절라인 라이트",
        "name_en": "Light",
        "skip": True,
    },
    {
        "slug": "invisalign-express",
        "badge_label": "EXPRESS",
        "badge_bg": "#d97706",
        "name_ko": "인비절라인 익스프레스",
        "name_en": "Express",
        "skip": True,
    },
    {
        "slug": "invisalign-first",
        "badge_label": "FIRST",
        "badge_bg": "#7c3aed",
        "name_ko": "인비절라인 퍼스트",
        "name_en": "First",
        "skip": True,
    },
]

# ── Orthodontic (bracket) program detail pages ──
ORTHO_PAGES = [
    {
        "slug": "ortho-best",
        "badge_label": "BEST",
        "badge_bg": "#6B4226",
        "name_ko": "컴프리헨시브 교정",
        "name_en": "Comprehensive Orthodontics",
        "title_tag": "천안 브라켓교정 컴프리헨시브 | 전체교정·5년보장 — 서울비디치과",
        "meta_desc": "천안 브라켓교정 컴프리헨시브(BEST) — 무제한 장치교체 5년 보장, 전체 교정, 클리피씨·클라리티울트라. 서울대 교정 전문의. ☎041-415-2892",
        "keywords": "브라켓교정 컴프리헨시브, 천안 교정 전체, 클리피씨 전체교정, 5년 보장 교정, 천안 치아교정 비용",
        "hero_sub": "무제한 장치 교체, 5년의 확실한 보장",
        "hero_desc": "가장 복잡한 교정도 끝까지 책임집니다. 클리피씨·클라리티울트라 최상위 프로그램 — 무제한 장치 교체(5년 보장)로 완벽한 결과를 추구하는 \"올인원\" 교정 솔루션입니다.",
        "stats": [("무제한", "장치 교체"), ("5년", "보장 기간"), ("700만원", "투자 비용")],
        "definition_title": "컴프리헨시브 교정이란?",
        "definition": "컴프리헨시브 교정은 클리피씨(자가결찰) 또는 클라리티울트라(세라믹) 브라켓을 사용한 전체 치열 교정 프로그램입니다. 5년간 무제한 장치 교체가 가능하며, 발치 교정·복잡한 부정교합·돌출입 등 모든 유형의 교정 케이스를 커버합니다. 중간에 장치를 교체하거나 와이어를 변경하더라도 추가 비용 없이 진행할 수 있어 가장 안정적인 선택입니다.",
        "concerns": [
            ("교정 범위가 넓은데 가능할까요?", "컴프리헨시브는 전체 교정 전문"),
            ("중간에 계획이 바뀌면 추가 비용이?", "5년간 무제한 교체, 추가 비용 없음"),
            ("교정 기간이 오래 걸릴까 걱정돼요", "자가결찰 시스템으로 기간 단축"),
            ("발치 교정이 필요한데 가능한가요?", "발치 교정 전문, 정밀 계획 수립"),
            ("직장인인데 장치가 눈에 띌까요?", "세라믹 장치로 심미성 확보"),
            ("비용이 부담되는데 가치가 있을까?", "가장 확실한 결과, 장기적 가성비 최고"),
        ],
        "features": [
            ("fas fa-infinity", "무제한 장치 교체", "5년간 장치를 무제한 교체할 수 있습니다. 중간 수정, 와이어 변경이 모두 포함되어 추가 비용 걱정이 없습니다."),
            ("fas fa-teeth", "전체 치열 교정", "앞니부터 어금니까지 전체 치열을 교정합니다. 총생(덧니), 벌어짐, 돌출입, 교합 불일치 등 모든 케이스에 대응합니다."),
            ("fas fa-cube", "디지털 정밀 진단", "3D CT, 구강스캐너, 교합 분석으로 최적의 교정 계획을 수립합니다. 디지털 시뮬레이션으로 예상 결과를 확인합니다."),
            ("fas fa-sync-alt", "무제한 조정", "교정 중 미세 조정이 필요하면 언제든 와이어와 장치를 교체합니다. 완벽해질 때까지 멈추지 않습니다."),
            ("fas fa-user-md", "서울대 교정 전문의", "서울대 교정과 전문의가 직접 진료합니다. 풍부한 경험이 정확한 진단으로 이어집니다."),
            ("fas fa-shield-alt", "클리피씨·클라리티울트라 선택", "자가결찰(클리피씨)과 프리미엄 세라믹(클라리티울트라) 중 최적의 장치를 선택합니다."),
        ],
        "diffs": [
            ("5년 무제한 — 업계 최장 보장", "5년간 장치 교체, 와이어 변경, 추가 조정 모두 무상입니다."),
            ("발치 교정도 정밀하게", "발치 후 공간 폐쇄를 브라켓과 와이어로 정밀 컨트롤합니다."),
            ("복잡한 케이스 전문", "과개교합, 개방교합, 3급 부정교합 등 난이도 높은 케이스를 해결합니다."),
            ("교정·보철·심미 원스톱 설계", "15인 전문의 협진으로 교정과 동시에 보철, 심미 치료를 통합 계획합니다."),
        ],
        "price": "700",
        "price_display": "700만원 (무이자 할부 가능)",
        "reviews": [
            ("정", "정**님", "naver", "네이버", "돌출입 발치 교정을 클리피씨로 했는데 <mark>정말 자연스럽게 변해서 주변에서 놀라워해요.</mark> 5년 보장이라 안심하고 진행했습니다.", ["발치 교정", "클리피씨"]),
            ("이", "이**님", "google", "구글", "교정 8개월차인데 <mark>매달 와이어 교체할 때마다 변하는 게 눈에 보여요.</mark> 세라믹이라 회사에서도 모릅니다.", ["세라믹 교정", "직장인"]),
            ("박", "박**님", "naver", "네이버", "다른 병원에서 2년 이상 걸린다고 했는데 <mark>클리피씨 자가결찰이라 더 빨리 끝날 수 있다고</mark> 하셔서 여기로 왔어요.", ["클리피씨", "기간 단축"]),
        ],
        "recommends": ["전체 교정이 필요한 분", "발치 교정이 필요한 분", "복잡한 부정교합인 분", "확실한 결과를 위해 장기 보장을 원하는 분", "돌출입 교정을 원하는 분"],
        "faqs": [
            ("컴프리헨시브와 다른 프로그램의 가장 큰 차이는?", "장치 교체 횟수와 보장 기간입니다. 컴프리헨시브는 5년간 무제한 교체가 가능하고, 모더레이트는 23단계, 라이트는 14단계로 제한됩니다. 교정 범위가 넓거나 추가 조정이 필요한 경우 컴프리헨시브를 추천합니다."),
            ("5년 보장이 끝나면 어떻게 되나요?", "5년 내에 교정이 완료되는 것이 일반적입니다. 만약 추가 조정이 필요하면 전문의와 상의하여 연장 여부를 결정합니다."),
            ("발치 교정도 브라켓 교정으로 가능한가요?", "네, 컴프리헨시브는 발치 교정에 최적화되어 있습니다. 브라켓과 와이어로 발치 후 공간을 정밀하게 폐쇄합니다."),
            ("클리피씨와 클라리티울트라 중 어떤 걸 선택하나요?", "전문의가 케이스에 따라 최적의 장치를 추천합니다. 빠른 교정과 적은 통증을 원하면 클리피씨(자가결찰), 최고 심미성을 원하면 클라리티울트라를 권합니다."),
            ("교정 기간은 얼마나 걸리나요?", "일반적으로 12~24개월이며, 케이스 난이도에 따라 달라집니다. 클리피씨 자가결찰은 기간 단축이 가능합니다."),
            ("교정 중 통증이 심한가요?", "장치 부착 후 2~3일간 뻐근한 느낌이 있지만, 일주일 이내 적응됩니다. 클리피씨는 마찰이 적어 통증이 덜합니다."),
            ("성인도 교정이 가능한가요?", "물론입니다. 연령 제한 없이 가능하며, 서울비디치과에서는 20~50대 성인 교정 경험이 풍부합니다."),
            ("인비절라인과 브라켓 교정 중 어떤 게 나은가요?", '케이스에 따라 다릅니다. 심미성과 편의성을 원하면 <a href="/treatments/invisalign" style="color:var(--brand);font-weight:600;">인비절라인</a>, 복잡한 교합 문제가 있으면 브라켓 교정이 유리합니다.'),
            ("무이자 할부가 가능한가요?", '네, 서울비디치과는 장기 무이자 할부를 지원합니다. <a href="/pricing" style="color:var(--brand);font-weight:600;">비용 안내 페이지</a>에서 확인하세요.'),
        ],
        "compare_table": True,
        "enc_terms": [
            ("클리피씨", "자가결찰 세라믹 브라켓. 클립으로 와이어 고정"),
            ("클라리티울트라", "3M사의 프리미엄 투명 세라믹 브라켓"),
            ("자가결찰", "클립으로 와이어를 자동 고정하는 방식"),
            ("부정교합", "위아래 치아의 맞물림이 비정상인 상태"),
            ("교정", "치아 배열과 교합을 바로잡는 치료"),
            ("리테이너", "교정 후 치아 위치를 유지하는 장치"),
            ("교정 발치", "교정을 위해 치아를 뽑는 것"),
            ("과개교합", "윗니가 아랫니를 과도하게 덮는 상태"),
        ],
    },
    {
        "slug": "ortho-moderate",
        "badge_label": "MODERATE",
        "badge_bg": "#0369a1",
        "name_ko": "모더레이트 교정",
        "name_en": "Moderate Orthodontics",
        "title_tag": "천안 브라켓교정 모더레이트 | 중등도 교정 최적 — 서울비디치과",
        "meta_desc": "천안 브라켓교정 모더레이트 — 23단계 장치 세트, 중등도 부정교합 최적, ClinCheck 3D, 클리피씨·클라리티울트라. ☎041-415-2892",
        "keywords": "브라켓교정 모더레이트, 천안 중등도 교정, 23단계 교정, 효율적 교정, 천안 치아교정 비용",
        "hero_sub": "꼭 필요한 만큼, 합리적으로",
        "hero_desc": "중등도 부정교합에 최적화된 프로그램입니다. 23단계 장치 세트로 효율적인 교정을 진행하며, 비용 대비 만족도가 높은 합리적 선택입니다.",
        "stats": [("23단계", "장치 세트"), ("10~18개월", "교정 기간"), ("550만원", "투자 비용")],
        "definition_title": "모더레이트 교정이란?",
        "definition": "모더레이트 교정은 중등도 부정교합에 최적화된 교정 프로그램입니다. 23단계의 체계적인 장치 세트로 효율적인 교정을 진행합니다. 전체 교정까지는 필요 없지만 단순 부분 교정으로는 해결이 어려운 케이스에 적합합니다. 디지털 정밀 진단으로 최적의 교정 계획을 수립하고, 리파인먼트 2회가 포함되어 세밀한 마무리가 가능합니다.",
        "concerns": [
            ("전체 교정까지는 아닌 것 같은데…", "중등도 맞춤 프로그램으로 딱 맞게"),
            ("비용 대비 효과가 궁금해요", "23단계 최적화로 합리적 비용"),
            ("교정 기간이 너무 길까봐요", "10~18개월 내 효율적 완료"),
            ("부분 교정으로 해결될까요?", "전문의 진단 후 최적 프로그램 추천"),
            ("장치가 눈에 띌까 걱정돼요", "세라믹 장치로 심미성 확보"),
            ("추가 조정이 필요하면?", "리파인먼트 2회 포함"),
        ],
        "features": [
            ("fas fa-layer-group", "23단계 체계적 교정", "23단계의 정밀한 교정 과정으로 중등도 부정교합을 효율적으로 해결합니다."),
            ("fas fa-bullseye", "중등도 부정교합 최적", "앞니 비뚤림, 중간 정도의 총생, 가벼운 교합 불일치 등에 효과적입니다."),
            ("fas fa-cube", "디지털 정밀 진단", "3D CT, 구강스캐너로 정밀 진단 후 최적의 교정 계획을 수립합니다."),
            ("fas fa-redo", "리파인먼트 2회 포함", "교정 후 미세 조정이 필요하면 2회까지 추가 조정이 가능합니다."),
            ("fas fa-gem", "세라믹 장치", "치아색 세라믹 브라켓으로 교정 중에도 심미성을 유지합니다."),
            ("fas fa-coins", "합리적 비용", "전체 교정 대비 비용을 절약하면서도 충분한 교정 효과를 얻을 수 있습니다."),
        ],
        "diffs": [
            ("23단계 최적 설계", "불필요한 과잉 교정 없이, 딱 필요한 만큼 효율적으로 설계합니다."),
            ("비용 효율성 최고", "전체 교정(컴프리헨시브) 대비 합리적 비용으로 충분한 교정 효과를 얻습니다."),
            ("리파인먼트 2회 포함", "교정 후 미세 조정이 필요하면 추가 비용 없이 2회까지 리파인먼트합니다."),
            ("교정·보철·심미 원스톱", "15인 전문의 협진으로 교정과 동시에 보철, 심미 치료를 통합 계획합니다."),
        ],
        "price": "550",
        "price_display": "550만원 (무이자 할부 가능)",
        "reviews": [
            ("김", "김**님", "naver", "네이버", "모더레이트로 시작했는데 <mark>1년 만에 치아가 정말 가지런해졌어요.</mark> 비용도 합리적이고 결과도 만족스럽습니다.", ["모더레이트", "합리적 비용"]),
            ("최", "최**님", "google", "구글", "앞니가 살짝 튀어나왔었는데 <mark>모더레이트로 딱 맞게 교정됐어요.</mark> 전체 교정까지 안 해도 돼서 좋았습니다.", ["앞니 교정", "효율적"]),
            ("한", "한**님", "naver", "네이버", "직장인이라 교정 시간이 걱정이었는데 <mark>클리피씨라 내원 간격이 길어서</mark> 회사 다니면서도 편하게 했어요.", ["직장인", "클리피씨"]),
        ],
        "recommends": ["중등도 부정교합인 분", "합리적 비용으로 교정을 원하는 분", "전체 교정까지는 필요 없는 분", "앞니 배열 + 약간의 교합 개선이 필요한 분", "10~18개월 내 완료를 원하는 분"],
        "faqs": [
            ("모더레이트와 컴프리헨시브의 차이는?", "교정 범위와 보장 기간이 다릅니다. 모더레이트는 23단계+리파인먼트 2회, 컴프리헨시브는 5년 무제한입니다. 중등도 케이스라면 모더레이트가 비용 효율적입니다."),
            ("모더레이트로 충분한지 어떻게 아나요?", "전문의 정밀 진단 후 최적의 프로그램을 추천합니다. 진단 결과에 따라 컴프리헨시브나 라이트를 권할 수도 있습니다."),
            ("23단계로 교정이 끝나지 않으면?", "리파인먼트 2회가 포함되어 있어 미세 조정이 가능합니다. 매우 드물지만 추가 단계가 필요하면 전문의와 상의합니다."),
            ("교정 기간은 얼마나 걸리나요?", "일반적으로 10~18개월입니다. 케이스 난이도와 환자 협조도에 따라 달라집니다."),
            ("클리피씨와 클라리티울트라 중 어떤 걸 사용하나요?", "전문의가 케이스에 따라 추천합니다. 빠른 교정을 원하면 클리피씨, 최고 심미성을 원하면 클라리티울트라입니다."),
            ("교정 중 통증이 심한가요?", "장치 부착 후 2~3일간 뻐근함이 있지만, 일주일 이내 적응됩니다. 클리피씨는 마찰이 적어 통증이 덜합니다."),
            ("성인도 모더레이트가 가능한가요?", "물론입니다. 성인 교정에서 모더레이트는 가장 많이 선택되는 프로그램입니다."),
            ("무이자 할부가 가능한가요?", '네, 장기 무이자 할부를 지원합니다. <a href="/pricing" style="color:var(--brand);font-weight:600;">비용 안내 페이지</a>에서 확인하세요.'),
        ],
        "compare_table": True,
        "enc_terms": [
            ("클리피씨", "자가결찰 세라믹 브라켓. 클립으로 와이어 고정"),
            ("클라리티울트라", "3M사의 프리미엄 투명 세라믹 브라켓"),
            ("부정교합", "위아래 치아의 맞물림이 비정상인 상태"),
            ("총생", "치아가 겹쳐서 나는 상태 (덧니)"),
            ("교정", "치아 배열과 교합을 바로잡는 치료"),
            ("리테이너", "교정 후 치아 위치를 유지하는 장치"),
        ],
    },
    {
        "slug": "ortho-light",
        "badge_label": "LIGHT",
        "badge_bg": "#059669",
        "name_ko": "라이트 교정",
        "name_en": "Light Orthodontics",
        "title_tag": "천안 브라켓교정 라이트 | 가벼운 교정·짧은 기간 — 서울비디치과",
        "meta_desc": "천안 브라켓교정 라이트 — 14단계 장치 세트, 짧은 치료 기간, 경제적 비용. 앞니 교정·재교정에 적합. ☎041-415-2892",
        "keywords": "브라켓교정 라이트, 천안 부분 교정, 14단계 교정, 앞니 교정, 가벼운 교정, 천안 치아교정 비용",
        "hero_sub": "가볍게 시작하는 확실한 변화",
        "hero_desc": "가벼운 교정이 필요한 분을 위한 경제적 프로그램입니다. 14단계 장치 세트로 앞니 배열, 재교정, 경미한 부정교합을 짧은 기간 안에 효과적으로 교정합니다.",
        "stats": [("14단계", "장치 세트"), ("6~12개월", "교정 기간"), ("450만원", "투자 비용")],
        "definition_title": "라이트 교정이란?",
        "definition": "라이트 교정은 경미한 부정교합을 위한 경제적 교정 프로그램입니다. 14단계의 간결한 장치 세트로 앞니 배열, 가벼운 총생, 재교정 등을 6~12개월 내에 해결합니다. 전체 교정이 필요 없는 분에게 합리적 비용으로 만족스러운 결과를 제공합니다. 리파인먼트 1회가 포함됩니다.",
        "concerns": [
            ("앞니만 살짝 고치고 싶은데", "라이트로 앞니 집중 교정"),
            ("전체 교정은 부담스러워요", "14단계로 딱 필요한 만큼만"),
            ("교정 기간이 짧았으면 좋겠어요", "6~12개월 내 완료 가능"),
            ("비용을 절약하고 싶어요", "경제적 비용으로 효과적 교정"),
            ("이전 교정 후 약간 틀어졌어요", "재교정에 최적화된 프로그램"),
            ("장치가 눈에 띌까 걱정돼요", "세라믹 장치로 심미성 확보"),
        ],
        "features": [
            ("fas fa-feather-alt", "14단계 간결한 교정", "14단계의 간결한 교정 과정으로 경미한 부정교합을 빠르게 해결합니다."),
            ("fas fa-magic", "앞니 집중 교정", "앞니 배열, 가벼운 총생, 미세 벌어짐 등 앞니 중심 교정에 효과적입니다."),
            ("fas fa-clock", "짧은 치료 기간", "6~12개월 내 완료. 바쁜 직장인, 학생에게 적합한 빠른 교정입니다."),
            ("fas fa-redo", "리파인먼트 1회 포함", "교정 후 미세 조정이 필요하면 1회 추가 조정이 가능합니다."),
            ("fas fa-gem", "세라믹 장치", "치아색 세라믹 브라켓으로 교정 중에도 자연스러운 외모를 유지합니다."),
            ("fas fa-piggy-bank", "경제적 비용", "필요한 만큼만 교정하여 비용을 절약합니다."),
        ],
        "diffs": [
            ("14단계 집중 설계", "불필요한 과잉 교정 없이, 앞니 중심으로 집중 설계합니다."),
            ("6~12개월 완료", "짧은 기간 안에 눈에 보이는 변화를 만듭니다."),
            ("재교정에 최적", "이전 교정 후 약간 틀어진 치아를 다시 바로잡습니다."),
            ("전문의 정밀 진단", "서울대 교정 전문의가 라이트로 충분한지 정확히 판단합니다."),
        ],
        "price": "450",
        "price_display": "450만원 (무이자 할부 가능)",
        "reviews": [
            ("민", "민**님", "naver", "네이버", "앞니 2개만 살짝 삐뚤었는데 <mark>라이트로 8개월 만에 완전 가지런해졌어요!</mark> 비용도 합리적이고 대만족.", ["앞니 교정", "라이트"]),
            ("서", "서**님", "google", "구글", "대학생 때 교정했는데 약간 틀어져서 재교정했어요. <mark>라이트라 기간도 짧고 비용도 절약됐어요.</mark>", ["재교정", "경제적"]),
            ("윤", "윤**님", "naver", "네이버", "결혼 전에 빨리 교정하고 싶었는데 <mark>6개월 만에 끝나서 딱 맞았어요.</mark> 세라믹이라 사진 찍어도 안 보여요.", ["빠른 교정", "세라믹"]),
        ],
        "recommends": ["앞니 배열만 교정하고 싶은 분", "짧은 기간 내 교정을 원하는 분", "이전 교정 후 재교정이 필요한 분", "경제적 비용으로 교정을 원하는 분", "경미한 부정교합인 분"],
        "faqs": [
            ("라이트로 교정 가능한 범위는?", "앞니 비뚤림, 가벼운 총생, 미세 벌어짐, 재교정 등 경미한 케이스에 적합합니다. 정밀 진단 후 전문의가 판단합니다."),
            ("라이트와 모더레이트의 차이는?", "라이트는 14단계+리파인먼트 1회, 모더레이트는 23단계+리파인먼트 2회입니다. 교정 범위에 따라 전문의가 추천합니다."),
            ("교정 기간은 얼마나 걸리나요?", "일반적으로 6~12개월입니다. 경미한 케이스는 6개월 내외로 완료될 수 있습니다."),
            ("앞니만 교정해도 효과가 있나요?", "네, 앞니 배열만으로도 미소 라인이 크게 개선됩니다. 전체 인상이 달라지는 효과가 있습니다."),
            ("교정 중 통증이 심한가요?", "라이트는 이동 범위가 작아 통증이 더 적습니다. 대부분 2~3일 내 적응합니다."),
            ("성인도 가능한가요?", "물론입니다. 앞니 교정과 재교정은 성인에게 가장 인기 있는 프로그램입니다."),
            ("무이자 할부가 가능한가요?", '네, 장기 무이자 할부를 지원합니다. <a href="/pricing" style="color:var(--brand);font-weight:600;">비용 안내 페이지</a>에서 확인하세요.'),
        ],
        "compare_table": True,
        "enc_terms": [
            ("클리피씨", "자가결찰 세라믹 브라켓. 클립으로 와이어 고정"),
            ("클라리티울트라", "3M사의 프리미엄 투명 세라믹 브라켓"),
            ("총생", "치아가 겹쳐서 나는 상태 (덧니)"),
            ("교정", "치아 배열과 교합을 바로잡는 치료"),
            ("리테이너", "교정 후 치아 위치를 유지하는 장치"),
            ("부분 교정", "일부 치아만을 대상으로 하는 교정 치료"),
        ],
    },
    {
        "slug": "ortho-express",
        "badge_label": "EXPRESS",
        "badge_bg": "#d97706",
        "name_ko": "익스프레스 교정",
        "name_en": "Express Orthodontics",
        "title_tag": "천안 브라켓교정 익스프레스 | 가장 빠른 미니 교정 — 서울비디치과",
        "meta_desc": "천안 브라켓교정 익스프레스 — 7단계 장치 세트, 가장 빠른 완료, 최저 비용. 미세 배열 교정에 최적. ☎041-415-2892",
        "keywords": "브라켓교정 익스프레스, 천안 미니교정, 7단계 교정, 빠른 교정, 최저비용 교정, 미세배열",
        "hero_sub": "가장 빠르고, 가장 경제적인 변화",
        "hero_desc": "아주 간단한 치아 배열 개선을 위한 최소 프로그램입니다. 7단계 장치 세트로 3~6개월 내에 빠르게 완료하며, 가장 경제적인 교정 옵션입니다.",
        "stats": [("7단계", "장치 세트"), ("3~6개월", "교정 기간"), ("300만원", "투자 비용")],
        "definition_title": "익스프레스 교정이란?",
        "definition": "익스프레스 교정은 아주 간단한 치아 배열 개선을 위한 미니 교정 프로그램입니다. 7단계의 최소 장치 세트로 3~6개월 내에 빠르게 완료합니다. 미세한 앞니 삐뚤림, 경미한 벌어짐, 간단한 재교정 등 소규모 교정에 적합합니다. 가장 경제적인 비용으로 빠른 결과를 원하는 분께 추천합니다.",
        "concerns": [
            ("치아 한두 개만 살짝 고치고 싶어요", "익스프레스로 딱 필요한 만큼만"),
            ("교정 기간이 최대한 짧았으면", "3~6개월 내 완료"),
            ("비용을 최소화하고 싶어요", "가장 경제적인 교정 옵션"),
            ("미세한 벌어짐만 교정하고 싶어요", "미세 배열에 최적화"),
            ("이벤트 전에 빨리 교정하고 싶어요", "가장 빠른 교정 완료"),
            ("간단한 재교정이 필요해요", "소규모 재교정에 적합"),
        ],
        "features": [
            ("fas fa-bolt", "7단계 초고속 교정", "7단계의 최소 교정 과정으로 가장 빠르게 완료합니다."),
            ("fas fa-crosshairs", "미세 배열 전문", "치아 한두 개의 미세한 위치 교정, 경미한 벌어짐 해소에 최적화됩니다."),
            ("fas fa-stopwatch", "3~6개월 완료", "가장 짧은 교정 기간. 이벤트, 면접, 결혼 등 일정에 맞춰 완료합니다."),
            ("fas fa-gem", "세라믹 장치", "짧은 기간이지만 세라믹 장치로 심미성을 유지합니다."),
            ("fas fa-coins", "최저 비용", "300만원으로 교정의 변화를 경험할 수 있습니다."),
            ("fas fa-user-md", "전문의 직접 진료", "간단한 교정도 서울대 전문의가 직접 진단하고 진료합니다."),
        ],
        "diffs": [
            ("7단계 — 가장 빠른 완료", "3~6개월 내에 눈에 보이는 변화를 만듭니다."),
            ("300만원 — 가장 경제적", "교정의 첫 걸음을 가장 합리적인 비용으로 시작합니다."),
            ("소규모 교정 전문", "미세한 배열 개선, 간단한 재교정에 최적화된 프로그램입니다."),
            ("전문의 정밀 진단", "익스프레스로 충분한지, 더 넓은 교정이 필요한지 정확히 판단합니다."),
        ],
        "price": "300",
        "price_display": "300만원 (무이자 할부 가능)",
        "reviews": [
            ("조", "조**님", "naver", "네이버", "앞니 하나만 살짝 삐뚤었는데 <mark>익스프레스로 4개월 만에 끝!</mark> 빠르고 저렴해서 진작 할 걸 그랬어요.", ["미니교정", "빠른 완료"]),
            ("송", "송**님", "google", "구글", "면접 전에 급하게 교정해야 했는데 <mark>3개월 만에 앞니가 가지런해져서</mark> 자신감 생겼어요.", ["면접 전 교정", "익스프레스"]),
            ("정", "정**님", "naver", "네이버", "교정 끝나고 살짝 벌어진 거 <mark>익스프레스로 재교정했는데 5개월이면 끝나서</mark> 부담 없었어요.", ["재교정", "경제적"]),
        ],
        "recommends": ["미세한 치아 배열만 교정하고 싶은 분", "가장 짧은 기간 내 교정을 원하는 분", "비용을 최소화하고 싶은 분", "이벤트/면접 전 빠른 교정이 필요한 분", "간단한 재교정이 필요한 분"],
        "faqs": [
            ("익스프레스로 교정 가능한 범위는?", "치아 한두 개의 미세 비뚤림, 경미한 벌어짐, 간단한 재교정 등 소규모 케이스에 적합합니다."),
            ("익스프레스와 라이트의 차이는?", "익스프레스는 7단계, 라이트는 14단계입니다. 교정 범위가 좀 더 넓으면 라이트를 추천합니다."),
            ("교정 기간은 얼마나 걸리나요?", "3~6개월이며, 아주 간단한 케이스는 3개월 내 완료됩니다."),
            ("통증이 있나요?", "이동 범위가 매우 작아 통증이 거의 없습니다. 대부분 1~2일 내 적응합니다."),
            ("성인도 가능한가요?", "물론입니다. 성인 미니교정에서 가장 인기 있는 프로그램입니다."),
            ("무이자 할부가 가능한가요?", '네, 무이자 할부를 지원합니다. <a href="/pricing" style="color:var(--brand);font-weight:600;">비용 안내 페이지</a>에서 확인하세요.'),
        ],
        "compare_table": True,
        "enc_terms": [
            ("클리피씨", "자가결찰 세라믹 브라켓. 클립으로 와이어 고정"),
            ("클라리티울트라", "3M사의 프리미엄 투명 세라믹 브라켓"),
            ("부분 교정", "일부 치아만을 대상으로 하는 교정 치료"),
            ("교정", "치아 배열과 교합을 바로잡는 치료"),
            ("리테이너", "교정 후 치아 위치를 유지하는 장치"),
        ],
    },
    {
        "slug": "ortho-first",
        "badge_label": "FIRST",
        "badge_bg": "#7c3aed",
        "name_ko": "퍼스트 교정",
        "name_en": "First Orthodontics",
        "title_tag": "천안 어린이 교정 퍼스트 | 성장기 교정 전문 — 서울비디치과",
        "meta_desc": "천안 어린이 교정 퍼스트 — 6~10세 성장기 교정, 영구치 맹출 유도, 악궁 확장. 서울대 교정 전문의 ☎041-415-2892",
        "keywords": "어린이 교정, 성장기 교정, 천안 소아 교정, 6세 교정, 악궁 확장, 영구치 유도, 퍼스트 교정",
        "hero_sub": "우리 아이의 바른 성장을 위한 첫 번째 교정",
        "hero_desc": "6~10세 성장기 어린이를 위한 전용 교정 프로그램입니다. 영구치가 올바르게 맹출하도록 유도하고 악궁을 확장하여 2단계 교정의 기간과 비용을 줄여줍니다.",
        "stats": [("6~10세", "대상 연령"), ("성장기", "맞춤 교정"), ("상담 후 안내", "비용")],
        "definition_title": "퍼스트 교정이란?",
        "definition": "퍼스트 교정은 6~10세 성장기 어린이를 위한 1단계 교정 프로그램입니다. 영구치와 유치가 혼재하는 혼합치열기에 시작하여 영구치의 올바른 맹출을 유도하고, 좁은 악궁을 확장하며, 위아래 턱의 성장 균형을 맞춥니다. 성장기에 미리 교정하면 2단계(전체) 교정의 기간과 난이도를 크게 줄일 수 있습니다.",
        "concerns": [
            ("우리 아이 치아가 삐뚤게 나와요", "성장기 교정으로 올바른 맹출 유도"),
            ("교정 시작 시기가 언제인지 모르겠어요", "6~10세가 최적 시기"),
            ("아이가 교정 장치를 불편해할까봐요", "아이 맞춤 장치로 편안하게"),
            ("비용이 이중으로 들까봐 걱정돼요", "1단계 교정으로 2단계 비용 절감"),
            ("영구치가 나올 자리가 부족해요", "악궁 확장으로 공간 확보"),
            ("아래턱이 앞으로 나왔어요", "성장기에 턱 성장 균형 조절"),
        ],
        "features": [
            ("fas fa-child", "6~10세 성장기 전용", "유치와 영구치가 혼재하는 시기에 최적화된 교정 프로그램입니다."),
            ("fas fa-seedling", "영구치 맹출 유도", "영구치가 올바른 위치에 나올 수 있도록 유도합니다. 덧니를 사전에 예방합니다."),
            ("fas fa-expand-arrows-alt", "악궁 확장", "좁은 위턱(상악)을 넓혀 영구치가 나올 공간을 확보합니다."),
            ("fas fa-balance-scale", "턱 성장 균형", "위아래 턱의 성장 균형을 맞춰 골격성 부정교합을 예방합니다."),
            ("fas fa-chart-line", "2단계 교정 간소화", "1단계에서 기반을 잡으면 2단계 전체 교정의 기간과 비용이 줄어듭니다."),
            ("fas fa-user-md", "소아 교정 전문", "서울대 교정 전문의 + 소아치과 전문의 협진으로 아이를 안전하게 케어합니다."),
        ],
        "diffs": [
            ("성장기 골든타임 활용", "뼈가 성장하는 시기에 교정하면 효과가 극대화됩니다."),
            ("2단계 교정 부담 경감", "1단계에서 기반을 잡아 2단계 교정의 기간·비용·난이도를 줄입니다."),
            ("소아치과 전문의 협진", "교정 전문의와 소아치과 전문의가 함께 아이의 구강 건강을 관리합니다."),
            ("아이 친화적 환경", "서울비디치과는 소아 전용 진료실을 운영하여 아이가 편안하게 내원할 수 있습니다."),
        ],
        "price": "상담 후",
        "price_display": "상담 후 안내 (아이의 상태에 따라 달라짐)",
        "reviews": [
            ("박", "박**님", "naver", "네이버", "아이 앞니가 삐뚤게 나왔는데 <mark>퍼스트 교정으로 영구치가 예쁘게 자리 잡았어요!</mark> 소아치과 전문의도 계셔서 안심이에요.", ["소아 교정", "영구치 유도"]),
            ("이", "이**님", "google", "구글", "위턱이 좁아서 치아가 겹칠까봐 걱정했는데 <mark>악궁 확장으로 공간이 생겨서</mark> 영구치가 잘 나오고 있어요.", ["악궁 확장", "성장기"]),
            ("김", "김**님", "naver", "네이버", "전문의 선생님이 <mark>1단계에서 잡으면 나중에 교정이 훨씬 쉬워진다</mark>고 설명해주셔서 바로 시작했어요. 아이도 잘 적응하고 있어요.", ["교정 전문의", "1단계 교정"]),
        ],
        "recommends": ["6~10세 성장기 자녀를 둔 부모님", "아이의 앞니가 삐뚤게 나오는 경우", "영구치가 나올 공간이 부족한 경우", "위아래 턱 성장 불균형이 걱정되는 경우", "덧니를 사전에 예방하고 싶은 경우"],
        "faqs": [
            ("퍼스트 교정은 몇 살에 시작하나요?", "6~10세가 최적 시기입니다. 첫 번째 영구치(6세 어금니)가 나올 때 검진을 받으시면 됩니다."),
            ("퍼스트 교정 후 2단계 교정이 꼭 필요한가요?", "아이의 상태에 따라 다릅니다. 1단계에서 충분히 교정되면 2단계가 불필요하거나 간소화됩니다."),
            ("아이가 장치를 불편해하지 않나요?", "아이의 구강에 맞는 소형 장치를 사용하며, 대부분 1~2주 내에 적응합니다. 소아치과 전문의가 아이를 편안하게 케어합니다."),
            ("교정 기간은 얼마나 걸리나요?", "일반적으로 6~18개월이며, 아이의 성장 속도와 교정 목표에 따라 달라집니다."),
            ("유치가 있는데 교정이 가능한가요?", "네, 퍼스트 교정은 유치와 영구치가 혼재하는 혼합치열기에 시작합니다. 유치의 존재를 활용하여 교정합니다."),
            ("비용은 얼마인가요?", "아이의 상태에 따라 달라지므로 상담 후 안내드립니다. 무이자 할부도 가능합니다."),
            ("인비절라인 퍼스트와 차이가 있나요?", '인비절라인 퍼스트는 투명 교정장치, 교정 퍼스트는 브라켓 교정장치를 사용합니다. 아이의 상태에 따라 전문의가 추천합니다. <a href="/treatments/invisalign-first" style="color:var(--brand);font-weight:600;">인비절라인 퍼스트 보기</a>'),
        ],
        "compare_table": False,
        "enc_terms": [
            ("혼합치열", "유치와 영구치가 함께 있는 시기의 치열"),
            ("악궁 확장", "좁은 위턱을 넓혀 치아 공간을 확보하는 교정"),
            ("부정교합", "위아래 치아의 맞물림이 비정상인 상태"),
            ("영구치", "유치가 빠진 후 나오는 성인 치아"),
            ("교정", "치아 배열과 교합을 바로잡는 치료"),
            ("리테이너", "교정 후 치아 위치를 유지하는 장치"),
        ],
    },
]


def get_head(p):
    return f'''<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3NQP355YQM"></script>
<script src="https://cdn.amplitude.com/script/87529341cb075dcdbefabce3994958aa.js"></script>
<script>
!function(f,b,e,v,n,t,s)
{{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)}};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '971255062435276');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=971255062435276&ev=PageView&noscript=1"
/></noscript>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>{p["title_tag"]}</title>
  <meta name="description" content="{p["meta_desc"]}">
  <meta name="keywords" content="{p["keywords"]}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/{p["slug"]}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="{p["title_tag"]}">
  <meta property="og:description" content="{p["meta_desc"]}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/{p["slug"]}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{p["title_tag"]}">
  <meta name="twitter:description" content="{p["meta_desc"]}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-image-v2.jpg">
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
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"}},{{"@type":"ListItem","position":2,"name":"치아교정","item":"https://bdbddc.com/treatments/orthodontics"}},{{"@type":"ListItem","position":3,"name":"{p["name_ko"]}","item":"https://bdbddc.com/treatments/{p["slug"]}"}}]}}</script>'''


def get_faq_schema(p):
    entities = []
    for q, a in p["faqs"]:
        import html as html_mod
        clean_a = a.replace('"', '\\"').replace('<a ', '').replace('</a>', '')
        # Simple strip for schema
        import re
        clean_a = re.sub(r'<[^>]+>', '', a).replace('"', '\\"')
        entities.append(f'{{"@type":"Question","name":"{q}","acceptedAnswer":{{"@type":"Answer","text":"{clean_a}"}}}}')
    return '  <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[' + ','.join(entities) + ']}</script>'


def get_speakable():
    return '  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","speakable":{"@type":"SpeakableSpecification","cssSelector":["h1",".section-subtitle",".hero-desc"]}}</script>'


def get_header():
    return '''  <header class="site-header" id="siteHeader">
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
  <div class="header-spacer"></div>'''


def get_footer():
    return '''  <footer class="footer" role="contentinfo">
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
  </footer>'''


def get_compare_table(current_slug):
    hl = {
        "ortho-best": 0,
        "ortho-moderate": 1,
        "ortho-light": 2,
    }
    highlight_col = hl.get(current_slug, 0)
    
    data = [
        ("장치 교체", ["<strong>무제한 (5년)</strong>", "23단계", "14단계"]),
        ("교정 범위", ["<strong>전체 교정</strong>", "중등도", "가벼운 교정"]),
        ("리파인먼트", ["<strong>무제한</strong>", "2회", "1회"]),
        ("디지털 진단", ["✅", "✅", "✅"]),
        ("발치 교정", ["<strong>✅ 가능</strong>", "제한적", "❌"]),
        ("교정 기간", ["12~24개월", "10~18개월", "6~12개월"]),
        ("비용", ["700만원", "550만원", "450만원"]),
        ("추천 케이스", ["<strong>전체/복잡</strong>", "중등도", "경미"]),
    ]
    
    headers = ["컴프리헨시브 (BEST)", "모더레이트", "라이트"]
    
    rows = ""
    for label, vals in data:
        cells = ""
        for i, v in enumerate(vals):
            cls = ' class="col-highlight"' if i == highlight_col else ""
            cells += f'<td{cls}>{v}</td>'
        rows += f'              <tr><td>{label}</td>{cells}</tr>\n'
    
    hdr_cells = ""
    for i, h in enumerate(headers):
        cls = ' class="col-highlight"' if i == highlight_col else ""
        hdr_cells += f'<th scope="col"{cls}>{h}</th>'
    
    return f'''    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2><span class="text-gradient">프로그램 비교</span></h2>
        </div>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead><tr><th scope="col">비교 항목</th>{hdr_cells}</tr></thead>
            <tbody>
{rows}            </tbody>
          </table>
        </div>
      </div>
    </section>'''


def get_other_programs(current_slug):
    ALL = [
        ("ortho-best", "BEST", "#6B4226", "fas fa-infinity", "컴프리헨시브", "무제한 장치교체, 5년 보장", "700만원"),
        ("ortho-moderate", "MODERATE", "#0369a1", "fas fa-layer-group", "모더레이트", "꼭 필요한 만큼, 합리적으로", "550만원"),
        ("ortho-light", "LIGHT", "#059669", "fas fa-feather-alt", "라이트", "가볍게 시작하는 확실한 변화", "450만원"),
        ("ortho-express", "EXPRESS", "#d97706", "fas fa-bolt", "익스프레스", "가장 빠르고, 가장 경제적인 변화", "300만원"),
        ("ortho-first", "FIRST", "#7c3aed", "fas fa-child", "퍼스트", "우리 아이의 바른 성장을 위한 첫 교정", ""),
    ]
    cards = ""
    for slug, badge, bg, icon, name, desc, price in ALL:
        if slug == current_slug:
            continue
        price_html = f'\n            <div style="margin-top:8px;font-weight:800;color:var(--brand);">{price}</div>' if price else ""
        cards += f'''          <a href="/treatments/{slug}" class="type-card">
            <span class="type-card-arrow"><i class="fas fa-arrow-right"></i></span>
            <div style="display:inline-block;padding:4px 12px;background:{bg};color:#fff;border-radius:50px;font-size:0.72rem;font-weight:800;margin-bottom:8px;letter-spacing:0.5px;">{badge}</div>
            <div class="type-icon"><i class="{icon}"></i></div>
            <h3>{name}</h3>
            <p>{desc}</p>{price_html}
          </a>
'''
    # Add invisalign link
    cards += '''          <a href="/treatments/invisalign" class="type-card">
            <span class="type-card-arrow"><i class="fas fa-arrow-right"></i></span>
            <div class="type-icon"><i class="fas fa-eye-slash"></i></div>
            <h3>인비절라인 (투명교정)</h3>
            <p>보이지 않는 투명 교정장치</p>
          </a>
'''
    return f'''    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>다른 <span class="text-gradient">교정 프로그램</span></h2>
          <p class="section-subtitle">상태와 목표에 맞는 맞춤 프로그램을 찾아보세요</p>
        </div>
        <div class="type-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">
{cards}        </div>
        <p class="type-grid-hint"><i class="fas fa-hand-pointer"></i> 각 카드를 눌러 자세한 내용을 확인하세요</p>
      </div>
    </section>'''


def generate_page(p):
    parts = []
    
    # Head
    parts.append(get_head(p))
    parts.append(get_faq_schema(p))
    parts.append(get_speakable())
    parts.append(f'  <meta name="ai-summary" content="서울비디치과 {p["name_ko"]} — {p["hero_sub"]}. 서울대 교정 전문의, 1층 전용 교정센터.">')
    parts.append('  <script src="/js/analytics.js?v=20260408v6" defer></script>')
    parts.append('<!-- Weglot Multilingual -->')
    parts.append('<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>')
    parts.append("<script>Weglot.initialize({api_key:'wg_cd7087d43782c81ecb41e27570c3bfcd2'});</script>")
    parts.append('</head>')
    parts.append('<body>')
    parts.append('<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK"\nheight="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>')
    parts.append('  <a href="#main-content" class="skip-link">본문으로 바로가기</a>')
    parts.append('')
    parts.append(get_header())
    parts.append('')
    parts.append('  <main id="main-content">')
    
    # Breadcrumb
    parts.append(f'''    <div style="padding:12px 0;background:var(--gray-50);">
      <div class="container">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:var(--text-tertiary);">
          <a href="/" style="color:var(--text-secondary);">홈</a>
          <span style="margin:0 6px;">›</span>
          <a href="/treatments/orthodontics" style="color:var(--text-secondary);">치아교정</a>
          <span style="margin:0 6px;">›</span>
          <span style="color:var(--brand);font-weight:600;">{p["name_ko"]}</span>
        </nav>
      </div>
    </div>''')
    
    # Hero
    stats_html = ""
    for val, label in p["stats"]:
        stats_html += f'\n        <div class="stat-item"><span class="stat-value">{val}</span><span class="stat-label">{label}</span></div>'
    
    parts.append(f'''
    <section class="hero" style="min-height:auto;padding:var(--space-4xl) 0 var(--space-3xl);">
      <div class="hero-bg-pattern"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <p class="hero-brand-name">서울비디치과 교정센터</p>
            <div style="display:inline-block;padding:6px 18px;background:{p["badge_bg"]};color:#fff;border-radius:50px;font-size:0.85rem;font-weight:800;margin-bottom:12px;letter-spacing:1px;">{p["badge_label"]}</div>
            <h1 class="hero-headline" style="font-size:var(--fs-h1);">{p["name_ko"]}</h1>
            <p class="hero-sub">{p["hero_sub"]}</p>
            <p class="hero-desc" style="font-size:1rem;color:var(--text-secondary);line-height:1.7;max-width:600px;margin-bottom:var(--space-xl);">{p["hero_desc"]}</p>
            <div class="hero-stats">{stats_html}
            </div>
            <div class="hero-cta-group" style="margin-top:var(--space-xl);">
              <a href="/reservation" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
              <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
            </div>
          </div>
        </div>
      </div>
    </section>''')
    
    # Definition
    parts.append(f'''
    <section class="section" style="padding:var(--space-2xl) 0;">
      <div class="container">
        <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:1.2rem 1.5rem;border-radius:0 8px 8px 0;max-width:800px;margin:0 auto;">
          <h2 style="font-size:1.15rem;font-weight:700;color:#0369a1;margin:0 0 0.5rem 0;">{p["definition_title"]}</h2>
          <p style="margin:0;color:#334155;line-height:1.7;font-size:0.95rem;">{p["definition"]}</p>
        </div>
      </div>
    </section>''')
    
    # Concerns
    concerns_html = ""
    for prob, sol in p["concerns"]:
        concerns_html += f'''          <div class="concern-item-row">
            <span class="problem-icon"><i class="fas fa-times-circle"></i></span>
            <span class="problem-text">"{prob}"</span>
            <span class="arrow"><i class="fas fa-arrow-right"></i></span>
            <span class="solution-text">{sol}</span>
          </div>
'''
    parts.append(f'''
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>혹시 이런 <span class="text-gradient">고민</span> 하고 계시죠?</h2>
          <p class="section-subtitle">많은 분들이 같은 걱정을 하십니다</p>
        </div>
        <div style="max-width:700px;margin:0 auto;">
{concerns_html}        </div>
      </div>
    </section>''')
    
    # Features 6
    features_html = ""
    for icon, title, desc in p["features"]:
        features_html += f'''          <div class="why-card">
            <div class="why-card-icon"><i class="{icon}"></i></div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
'''
    parts.append(f'''
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2><span class="text-gradient">{p["name_ko"]}</span>의 특징</h2>
          <p class="section-subtitle">서울비디치과가 자신 있게 제안하는 이유</p>
        </div>
        <div class="why-grid" style="grid-template-columns:repeat(3,1fr);">
{features_html}        </div>
      </div>
    </section>''')
    
    # Diffs
    diffs_html = ""
    for i, (title, desc) in enumerate(p["diffs"], 1):
        diffs_html += f'''          <div class="diff-card">
            <div class="diff-num">{i:02d}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
'''
    parts.append(f'''
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>{p["name_ko"]}, <span class="text-gradient">어디서 하느냐</span>가 결과를 바꿉니다</h2>
          <p class="section-subtitle">서울비디치과만의 차별점</p>
        </div>
        <div class="diff-grid">
{diffs_html}        </div>
      </div>
    </section>''')
    
    # Treatment process
    steps = [
        ("정밀 상담 & 3D 검진", "3D CT, 구강스캐너, 교합 분석을 통해 현재 상태를 정확히 파악합니다."),
        ("교정 계획 수립", "검진 결과를 바탕으로 클리피씨/클라리티울트라 중 최적의 장치를 선택하고 교정 계획을 세웁니다."),
        ("장치 부착", "치아 표면에 세라믹 브라켓을 정밀하게 부착합니다. 약 1시간 소요."),
        ("정기 내원 & 와이어 조정", "4~8주 간격으로 와이어를 교체하며 치아를 이동시킵니다."),
        ("장치 제거", "목표 교정 결과에 도달하면 브라켓을 제거합니다."),
        ("유지장치 & 관리", "교정 후 유지장치(리테이너)를 장착합니다. 정기 검진으로 결과를 유지합니다."),
    ]
    if p["slug"] == "ortho-first":
        steps = [
            ("성장 검진 & 상담", "3D CT, 구강스캐너, 성장 분석으로 아이의 구강 발달 상태를 파악합니다."),
            ("1단계 교정 계획 수립", "영구치 맹출 유도, 악궁 확장 등 성장기 맞춤 계획을 세웁니다."),
            ("장치 장착", "아이의 구강에 맞는 교정 장치를 장착합니다."),
            ("정기 내원 & 경과 관찰", "4~8주 간격으로 내원하여 성장 경과를 확인하고 장치를 조정합니다."),
            ("1단계 완료 & 경과 관찰", "1단계 교정 목표 달성 후 영구치 교환을 지켜봅니다."),
            ("2단계 교정 검토", "영구치 교환 완료 후 2단계 전체 교정 필요 여부를 판단합니다."),
        ]
    
    steps_html = ""
    for i, (title, desc) in enumerate(steps, 1):
        steps_html += f'''          <div class="process-step-v2">
            <div class="step-dot">{i}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
'''
    parts.append(f'''
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>체계적인 <span class="text-gradient">6단계</span> 치료 과정</h2>
          <p class="section-subtitle">상담부터 유지까지</p>
        </div>
        <div class="process-timeline-v2">
{steps_html}        </div>
      </div>
    </section>''')
    
    # Compare table (only for best/moderate/light/express)
    if p.get("compare_table"):
        parts.append(get_compare_table(p["slug"]))
    
    # Price
    if p["price"] != "상담 후":
        price_num = p["price"]
        parts.append(f'''
    <section class="section" style="background:var(--gray-50);padding:var(--space-2xl) 0;">
      <div class="container">
        <div style="max-width:700px;margin:0 auto;padding:28px;background:var(--white);border:1px solid var(--border-color);border-radius:var(--radius-xl);text-align:center;">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:12px;"><i class="fas fa-won-sign" style="color:var(--brand-gold);margin-right:8px;"></i>비용 안내</h3>
          <div style="margin-bottom:12px;"><span style="font-size:1.6rem;font-weight:800;color:var(--brand);">{price_num}</span><span style="font-size:0.9rem;color:#888;">만원</span></div>
          <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:16px;font-size:0.9rem;">{p["price_display"]}</p>
          <a href="/pricing" class="btn btn-outline" style="font-size:0.95rem;"><i class="fas fa-calculator"></i> 비용 안내 페이지 바로가기</a>
        </div>
      </div>
    </section>''')
    else:
        parts.append(f'''
    <section class="section" style="background:var(--gray-50);padding:var(--space-2xl) 0;">
      <div class="container">
        <div style="max-width:700px;margin:0 auto;padding:28px;background:var(--white);border:1px solid var(--border-color);border-radius:var(--radius-xl);text-align:center;">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:12px;"><i class="fas fa-won-sign" style="color:var(--brand-gold);margin-right:8px;"></i>비용 안내</h3>
          <div style="margin-bottom:12px;"><span style="font-size:1rem;font-weight:700;color:var(--brand);">상담 후 안내</span></div>
          <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:16px;font-size:0.9rem;">{p["price_display"]}</p>
          <a href="/pricing" class="btn btn-outline" style="font-size:0.95rem;"><i class="fas fa-calculator"></i> 비용 안내 페이지 바로가기</a>
        </div>
      </div>
    </section>''')
    
    # Reviews
    reviews_html = ""
    for avatar, name, src_class, src_label, text, tags in p["reviews"]:
        tags_html = "".join(f"<span>{t}</span>" for t in tags)
        reviews_html += f'''          <div class="review-card-v2">
            <div class="review-header">
              <div class="review-avatar">{avatar}</div>
              <div><div class="review-name">{name}</div><span class="review-source {src_class}">{src_label}</span></div>
            </div>
            <div class="review-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            <p class="review-text">{text}</p>
            <div class="review-tags">{tags_html}</div>
          </div>
'''
    parts.append(f'''
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>실제 <span class="text-gradient">환자 후기</span></h2>
          <p class="section-subtitle">네이버·구글에서 검증된 실제 후기입니다</p>
        </div>
        <div class="review-grid-v2">
{reviews_html}        </div>
      </div>
    </section>''')
    
    # Recommends
    rec_html = ""
    for r in p["recommends"]:
        rec_html += f'            <span style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(107,66,38,0.06);border-radius:var(--radius-full);font-weight:600;color:var(--brand);font-size:0.95rem;"><i class="fas fa-check-circle" style="color:var(--brand-gold);"></i>{r}</span>\n'
    parts.append(f'''
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>이런 분께 <span class="text-gradient">추천</span>합니다</h2>
        </div>
        <div style="max-width:700px;margin:0 auto;padding:32px;background:var(--white);border:1px solid var(--border-color);border-radius:var(--radius-xl);">
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
{rec_html}          </div>
        </div>
      </div>
    </section>''')
    
    # FAQ
    faq_html = ""
    for i, (q, a) in enumerate(p["faqs"]):
        faq_html += f'''          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-{i}">
              <span class="faq-q-badge">Q</span>
              <span class="faq-q-text">{q}</span>
              <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="faq-answer" id="faq-{i}" role="region"><p>{a}</p></div>
          </div>
'''
    parts.append(f'''
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>자주 묻는 <span class="text-gradient">질문</span></h2>
          <p class="section-subtitle">{p["name_ko"]}에 대해 궁금한 점을 확인하세요</p>
        </div>
        <div class="faq-list" style="max-width:800px;margin:0 auto;">
{faq_html}        </div>
      </div>
    </section>''')
    
    # Encyclopedia terms
    import urllib.parse
    enc_html = ""
    for term, desc in p["enc_terms"]:
        encoded = urllib.parse.quote(term)
        enc_html += f'''          <a href="/encyclopedia/{encoded}" class="enc-term-link" style="display:block;padding:10px 14px;background:#fff;border:1px solid #e8e0d8;border-radius:10px;text-decoration:none;color:#333;transition:all 0.2s;">
            <strong style="color:#6B4226;font-size:0.95rem;">{term}</strong>
            <span style="display:block;font-size:0.8rem;color:#888;margin-top:2px;">{desc}</span>
          </a>
'''
    parts.append(f'''
    <section class="section-sm" style="padding:40px 0;">
      <div class="container">
        <div style="background:#faf7f3;border-radius:16px;padding:28px 24px;">
          <h2 style="font-size:1.15rem;font-weight:700;color:#333;margin-bottom:16px;">
            <i class="fas fa-book-medical" style="color:#c9a96e;margin-right:8px;"></i>
            관련 치과 백과사전 용어 ({len(p["enc_terms"])}개)
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
{enc_html}          </div>
          <div style="text-align:center;margin-top:16px;">
            <a href="/encyclopedia/" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.85rem;">
              <i class="fas fa-book-medical"></i> 전체 500개 용어 보기
            </a>
          </div>
        </div>
      </div>
    </section>''')
    
    # Other programs
    parts.append(get_other_programs(p["slug"]))
    
    # CTA
    parts.append(f'''
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <span class="cta-badge">상담 안내</span>
          <h2>{p["name_ko"]}, 서울대 교정 전문의에게</h2>
          <p>무료 상담으로 나에게 맞는 교정 프로그램을 확인하세요.</p>
          <div class="cta-buttons">
            <a href="/reservation" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
            <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
          </div>
          <p class="cta-phone"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
        </div>
      </div>
    </section>

    <section class="section-sm">
      <div class="container">
        <div class="legal-box">*본 정보는 의료법 및 의료광고 심의 기준을 준수하며, 개인에 따라 결과가 다를 수 있습니다. 반드시 전문의와 상담 후 결정하시기 바랍니다.</div>
      </div>
    </section>
  </main>''')
    
    parts.append('')
    parts.append(get_footer())
    
    # Scripts
    parts.append('''  <script src="../js/main.js" defer></script>
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
</html>''')
    
    return "\n".join(parts)


# Generate all pages
output_dir = "/home/user/webapp/treatments"
os.makedirs(output_dir, exist_ok=True)

for p in ORTHO_PAGES:
    html = generate_page(p)
    filepath = os.path.join(output_dir, f"{p['slug']}.html")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)
    lines = html.count('\n') + 1
    size = len(html.encode('utf-8'))
    print(f"  {p['slug']}.html — {lines} lines, {size/1024:.1f}KB")

print(f"\nDone! Generated {len(ORTHO_PAGES)} orthodontic detail pages.")
