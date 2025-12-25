# 🏥 병원 프리미엄 웹사이트 복제 마스터 프롬프트

> **사용법**: 아래 프롬프트 전체를 Claude에게 제공하고, `{{변수}}` 부분만 새 병원 정보로 교체하세요.
> 이 프롬프트는 서울비디치과 웹사이트 구조와 디자인을 그대로 복제합니다.

---

# 🚀 마스터 프롬프트 시작

```
당신은 최고급 병원 웹사이트 전문 개발자입니다. 아래 명세에 따라 프리미엄 치과/병원 웹사이트를 처음부터 끝까지 완벽하게 구축해주세요.

## ⚠️ 중요 지침

1. **모든 파일을 직접 생성**해주세요 (HTML, CSS, JS 전체)
2. **디자인 시스템을 먼저 구축**하고 일관성을 유지해주세요
3. **SEO/AEO/GEO 최적화**를 모든 페이지에 적용해주세요
4. **반응형 디자인**으로 모바일/태블릿/데스크톱 완벽 대응해주세요
5. **웹 접근성(WCAG 2.1 AA)** 기준을 준수해주세요
6. **성능 최적화** (Critical CSS, 지연 로딩, Preconnect)를 적용해주세요

---

## 📌 SECTION 1: 병원 기본 정보

### 1.1 병원 식별 정보
- **병원명 (한글)**: {{병원명}}
- **병원명 (영문)**: {{영문명}}
- **슬로건/브랜드 메시지**: {{슬로건}}
- **슬로건 풀네임**: {{슬로건_풀네임}} (예: BD = Best Dedication)

### 1.2 연락처 정보
- **전화번호**: {{전화번호}}
- **팩스번호**: {{팩스번호}}
- **이메일**: {{이메일}}
- **카카오톡 채널 URL**: {{카카오톡_URL}}
- **네이버 예약 URL**: {{네이버예약_URL}}
- **네이버 플레이스 URL**: {{네이버플레이스_URL}}
- **유튜브 채널 URL**: {{유튜브_URL}}
- **인스타그램 URL**: {{인스타그램_URL}}
- **블로그 URL**: {{블로그_URL}}

### 1.3 위치 정보 (지역 SEO 필수)
- **도로명 주소**: {{도로명주소}}
- **지번 주소**: {{지번주소}}
- **우편번호**: {{우편번호}}
- **위도 (Latitude)**: {{위도}}
- **경도 (Longitude)**: {{경도}}
- **대표 지역 1**: {{대표지역1}} (예: 천안)
- **대표 지역 2**: {{대표지역2}} (예: 아산)
- **세부 지역들**: {{세부지역들}} (예: 불당동, 쌍용동, 두정동)
- **광역 지역**: {{광역지역}} (예: 충청남도)

### 1.4 진료 시간
- **평일**: {{평일_시작}} ~ {{평일_종료}} (예: 09:00 ~ 20:00)
- **토요일**: {{토요일_시작}} ~ {{토요일_종료}}
- **일요일**: {{일요일_시작}} ~ {{일요일_종료}} (휴진 시 "휴진")
- **공휴일**: {{공휴일_시작}} ~ {{공휴일_종료}} (휴진 시 "휴진")
- **점심시간**: {{점심_시작}} ~ {{점심_종료}}
- **야간 진료 여부**: {{야간진료}} (예: "평일 20시까지" 또는 "없음")
- **365일 진료 여부**: {{365일진료}} (예: "Y" 또는 "N")

---

## 📌 SECTION 2: 브랜드 디자인 시스템

### 2.1 컬러 팔레트
```css
/* 필수: 아래 값을 병원 브랜드에 맞게 교체 */
:root {
  /* Primary Brand Colors */
  --brand-primary: {{브랜드_메인색상}};      /* 예: #8B5A2B (브라운) */
  --brand-secondary: {{브랜드_보조색상}};    /* 예: #A67C52 (밝은 브라운) */
  --brand-dark: {{브랜드_다크색상}};         /* 예: #5D3A1A (다크 브라운) */
  --brand-accent: {{브랜드_강조색상}};       /* 예: #C9A962 (골드) */
  --brand-light: {{브랜드_라이트색상}};      /* 예: #D4B896 (베이지) */
  
  /* Gradient */
  --brand-gradient: linear-gradient(135deg, {{브랜드_메인색상}} 0%, {{브랜드_강조색상}} 100%);
}
```

### 2.2 테마 설정
- **테마 모드**: {{테마_모드}} (다크/라이트)
- **글래스모피즘 사용**: Y
- **배경색**: {{배경색}} (다크 테마 시: #0a0a0a)
- **텍스트 기본색**: {{텍스트색}} (다크 테마 시: #e5e5e5)

### 2.3 폰트 설정
- **메인 폰트**: Pretendard (한글)
- **영문 폰트**: Pretendard
- **아이콘**: Font Awesome 6.4

---

## 📌 SECTION 3: 의료진 정보

### 3.1 의료진 개요
- **총 원장 수**: {{원장수}}명
- **주요 학력 배경**: {{학력배경}} (예: "서울대 출신")
- **협진 시스템**: {{협진시스템}} (예: "체계적 협진 시스템")

### 3.2 의료진 상세 (원장별 반복)

#### 원장 1
- **이름**: {{원장1_이름}}
- **직책**: {{원장1_직책}} (예: 대표원장)
- **전문 분야**: {{원장1_전문분야}}
- **프로필 이미지**: {{원장1_이미지URL}} (없으면 placeholder)
- **학력**:
  - {{원장1_학력1}}
  - {{원장1_학력2}}
- **경력**:
  - {{원장1_경력1}}
  - {{원장1_경력2}}
  - {{원장1_경력3}}
- **자격/수료**:
  - {{원장1_자격1}}
  - {{원장1_자격2}}
- **한마디**: "{{원장1_한마디}}"

#### 원장 2
(위와 동일 형식으로 반복... 총 {{원장수}}명까지)

---

## 📌 SECTION 4: 시설 정보

### 4.1 층별 안내
| 층 | 시설명 | 설명 | 아이콘 |
|----|--------|------|--------|
| {{층1_번호}} | {{층1_시설명}} | {{층1_설명}} | {{층1_아이콘}} |
| {{층2_번호}} | {{층2_시설명}} | {{층2_설명}} | {{층2_아이콘}} |
| {{층3_번호}} | {{층3_시설명}} | {{층3_설명}} | {{층3_아이콘}} |
| {{층4_번호}} | {{층4_시설명}} | {{층4_설명}} | {{층4_아이콘}} |
| {{층5_번호}} | {{층5_시설명}} | {{층5_설명}} | {{층5_아이콘}} |

### 4.2 특수 시설
- **수술실 수**: {{수술실수}}개
- **회복실 수**: {{회복실수}}개
- **CT/X-ray 장비**: {{CT장비}}
- **기공소**: {{기공소}} (원내/외주)
- **주차 공간**: {{주차공간}} (예: 건물 내 50대)

---

## 📌 SECTION 5: 진료 과목

### 5.1 전문센터 (메인 강조 - 최대 5개)

#### 전문센터 1 (가장 강조)
- **센터명**: {{전문센터1_이름}}
- **영문명**: {{전문센터1_영문}}
- **짧은 설명**: {{전문센터1_짧은설명}}
- **강조 배지**: {{전문센터1_배지}} (예: "HOT", "국내 최대", "6개 수술실")
- **아이콘**: {{전문센터1_아이콘}} (Font Awesome 클래스)
- **상세 설명**: {{전문센터1_상세설명}}
- **특징 리스트**:
  1. {{전문센터1_특징1}}
  2. {{전문센터1_특징2}}
  3. {{전문센터1_특징3}}
  4. {{전문센터1_특징4}}
- **FAQ (10개)**:
  1. Q: {{전문센터1_FAQ1_질문}} / A: {{전문센터1_FAQ1_답변}}
  2. Q: {{전문센터1_FAQ2_질문}} / A: {{전문센터1_FAQ2_답변}}
  ... (10개까지)

#### 전문센터 2~5
(위와 동일 형식으로 반복)

### 5.2 일반/보존 진료
| 진료명 | 영문명 | 짧은 설명 | 아이콘 |
|--------|--------|-----------|--------|
| 충치치료 | Cavity Treatment | {{충치_설명}} | fa-tooth |
| 레진치료 | Resin Treatment | {{레진_설명}} | fa-fill-drip |
| 인레이/온레이 | Inlay/Onlay | {{인레이_설명}} | fa-cube |
| 크라운 | Crown | {{크라운_설명}} | fa-crown |
| 신경치료 | Root Canal | {{신경치료_설명}} | fa-syringe |

### 5.3 잇몸/치주 치료
| 진료명 | 영문명 | 짧은 설명 |
|--------|--------|-----------|
| 스케일링 | Scaling | {{스케일링_설명}} |
| 잇몸치료 | Gum Treatment | {{잇몸치료_설명}} |
| 잇몸수술 | Gum Surgery | {{잇몸수술_설명}} |
| 치주염 | Periodontitis | {{치주염_설명}} |

### 5.4 구강외과/기타
| 진료명 | 영문명 | 짧은 설명 |
|--------|--------|-----------|
| 사랑니발치 | Wisdom Tooth | {{사랑니_설명}} |
| 턱관절장애 | TMJ | {{턱관절_설명}} |
| 이갈이/이악물기 | Bruxism | {{이갈이_설명}} |
| 응급치료 | Emergency | {{응급_설명}} |

### 5.5 보철
| 진료명 | 영문명 | 짧은 설명 |
|--------|--------|-----------|
| 브릿지 | Bridge | {{브릿지_설명}} |
| 틀니 | Denture | {{틀니_설명}} |

---

## 📌 SECTION 6: 차별화 포인트 & 신뢰 지표

### 6.1 병원 강점 (Why Choose Us - 6개)

#### 강점 1 (가장 중요 - 큰 카드)
- **제목**: {{강점1_제목}} (예: "과잉진료? 절대 없습니다")
- **부제목**: {{강점1_부제목}} (예: "No 과잉진료")
- **설명**: {{강점1_설명}}
- **아이콘**: {{강점1_아이콘}}
- **체크리스트**:
  - {{강점1_체크1}}
  - {{강점1_체크2}}
  - {{강점1_체크3}}

#### 강점 2~6
- **제목**: {{강점N_제목}}
- **설명**: {{강점N_설명}}
- **아이콘**: {{강점N_아이콘}}

### 6.2 환자 고민 해결 (Concerns Grid - 4개)
| 아이콘 | 고민 | 해결 |
|--------|------|------|
| {{고민1_아이콘}} | {{고민1_고민}} | {{고민1_해결}} |
| {{고민2_아이콘}} | {{고민2_고민}} | {{고민2_해결}} |
| {{고민3_아이콘}} | {{고민3_고민}} | {{고민3_해결}} |
| {{고민4_아이콘}} | {{고민4_고민}} | {{고민4_해결}} |

### 6.3 신뢰 지표 (숫자 강조)
| 항목 | 숫자 | 단위 |
|------|------|------|
| 환자 만족도 | {{만족도}} | % |
| 재방문율 | {{재방문율}} | % |
| 지인소개율 | {{지인소개율}} | % |
| 네이버 평점 | {{네이버평점}} | 점 |
| 누적 환자 수 | {{누적환자수}} | 명+ |
| 임플란트 수술 | {{임플란트수술수}} | 건+ |
| 교정 케이스 | {{교정케이스수}} | 건+ |

---

## 📌 SECTION 7: 웹사이트 구조 (사이트맵)

### 7.1 필수 페이지 (반드시 생성)
```
/ (index.html)                    - 메인 홈페이지
├── /reservation.html             - 예약 페이지
├── /pricing.html                 - 비용 안내
├── /directions.html              - 오시는 길
├── /faq.html                     - 자주 묻는 질문
├── /floor-guide.html             - 층별 안내
│
├── /treatments/                  - 진료 안내
│   ├── index.html                - 진료 안내 메인
│   ├── {{전문센터1_파일명}}.html  - 전문센터 1
│   ├── {{전문센터2_파일명}}.html  - 전문센터 2
│   ├── {{전문센터3_파일명}}.html  - 전문센터 3
│   ├── {{전문센터4_파일명}}.html  - 전문센터 4
│   ├── {{전문센터5_파일명}}.html  - 전문센터 5
│   ├── cavity.html               - 충치치료
│   ├── resin.html                - 레진치료
│   ├── inlay.html                - 인레이/온레이
│   ├── crown.html                - 크라운
│   ├── root-canal.html           - 신경치료
│   ├── scaling.html              - 스케일링
│   ├── gum.html                  - 잇몸치료
│   ├── wisdom-tooth.html         - 사랑니발치
│   ├── whitening.html            - 미백
│   ├── bridge.html               - 브릿지
│   ├── denture.html              - 틀니
│   ├── tmj.html                  - 턱관절장애
│   ├── bruxism.html              - 이갈이
│   ├── prevention.html           - 예방치료
│   └── emergency.html            - 응급치료
│
├── /doctors/                     - 의료진 소개
│   ├── index.html                - 전체 의료진
│   └── {{원장N_파일명}}.html     - 개별 원장 프로필 (원장수만큼)
│
├── /cases/                       - Before/After
│   └── gallery.html              - 치료 전후 갤러리
│
├── /area/                        - 지역 SEO 페이지
│   ├── {{대표지역1_파일명}}.html  - 지역1 랜딩
│   ├── {{대표지역2_파일명}}.html  - 지역2 랜딩
│   └── {{세부지역_파일명}}.html   - 세부지역 랜딩
│
├── /auth/                        - 회원 시스템
│   ├── login.html                - 로그인
│   ├── register.html             - 회원가입
│   └── mypage.html               - 마이페이지
│
├── /sitemap.xml                  - SEO 사이트맵
├── /robots.txt                   - 크롤러 설정
└── /offline.html                 - 오프라인 페이지 (PWA)
```

### 7.2 CSS 파일 구조 (반드시 생성)
```
css/
├── design-system.css      - 디자인 토큰, CSS 변수, 기본 컴포넌트
├── main.css               - 기본 레이아웃, 타이포그래피
├── gnb.css                - 헤더, 네비게이션, 메가 드롭다운
├── hero-marketing.css     - 히어로 섹션, 마케팅 배너
├── homepage-sections.css  - 홈페이지 각 섹션 스타일
├── mobile-optimize.css    - 모바일 최적화, Safe Area
└── language-switcher.css  - 다국어 전환 UI
```

### 7.3 JS 파일 구조 (반드시 생성)
```
js/
├── main.js                - 기본 인터랙션, FAQ 아코디언
├── gnb.js                 - GNB 드롭다운, 모바일 메뉴
├── translations.js        - 4개국어 번역 데이터
├── language-switcher.js   - 언어 전환 로직
└── firebase-auth.js       - Firebase 회원 인증 (선택)
```

---

## 📌 SECTION 8: 페이지별 상세 구현 명세

### 8.1 메인 페이지 (index.html)

#### 8.1.1 HTML 구조
```html
<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <!-- SEO Meta Tags (필수) -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <meta name="description" content="{{병원명}} - {{대표지역1}}·{{대표지역2}} {{365일진료여부}}일 진료 치과...">
  <meta name="keywords" content="{{대표지역1}}치과, {{대표지역2}}치과, {{세부지역}}치과...">
  <meta name="author" content="{{병원명}}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  
  <!-- Canonical -->
  <link rel="canonical" href="https://{{도메인}}/">
  
  <!-- Geo Tags -->
  <meta name="geo.region" content="KR-{{지역코드}}">
  <meta name="geo.placename" content="{{대표지역1}}, {{광역지역}}">
  <meta name="geo.position" content="{{위도}};{{경도}}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="{{병원명}} | {{슬로건}}">
  <meta property="og:description" content="...">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://{{도메인}}/">
  <meta property="og:image" content="https://{{도메인}}/images/og-image.jpg">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  ...
  
  <title>{{병원명}} | {{대표지역1}} {{365일진료}} 치과 - {{전문센터1}}·{{전문센터2}} 전문</title>
  
  <!-- Critical CSS (인라인) -->
  <style>
    /* 최소 필수 CSS 인라인 */
  </style>
  
  <!-- External CSS -->
  <link rel="stylesheet" href="css/design-system.css">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/gnb.css">
  ...
  
  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": "{{병원명}}",
    "telephone": "{{전화번호}}",
    "address": {...},
    "geo": {...},
    "openingHoursSpecification": [...],
    ...
  }
  </script>
</head>
<body>
  <!-- Header with Mega Dropdown -->
  <header class="site-header">
    <!-- 로고 + 진료상태 + 네비게이션 + 예약버튼 -->
  </header>
  
  <!-- Hero Section -->
  <section class="hero">
    <!-- 배지들 (365일 진료, 야간진료) -->
    <!-- 슬로건 (BD = Best Dedication) -->
    <!-- 메인 카피 -->
    <!-- CTA 버튼들 -->
    <!-- 숫자 카드들 (원장수, 진료일, 층수, 수술실) -->
  </section>
  
  <!-- Features Banner (Ticker) -->
  <section class="features-banner">
    <!-- 365일 진료, 야간진료, 원장수, 대학병원급, 감염관리 -->
  </section>
  
  <!-- Why Choose Us Section -->
  <section class="why-choose-section">
    <!-- 강점 6개 그리드 -->
    <!-- 환자 고민 해결 4개 -->
  </section>
  
  <!-- Treatments Preview Section -->
  <section class="treatments-section">
    <!-- 전문센터 6개 카드 -->
  </section>
  
  <!-- Floor Guide Section -->
  <section class="floor-section">
    <!-- 층별 안내 -->
  </section>
  
  <!-- Trust Indicators Section -->
  <section class="trust-section">
    <!-- 만족도, 재방문율, 지인소개율, 평점 -->
  </section>
  
  <!-- Reviews Section -->
  <section class="reviews-section">
    <!-- 환자 후기 캐러셀 -->
  </section>
  
  <!-- CTA Section -->
  <section class="cta-section">
    <!-- 최종 예약 유도 -->
  </section>
  
  <!-- Footer -->
  <footer class="site-footer">
    <!-- 병원 정보, 진료시간, 연락처, 소셜 링크 -->
  </footer>
  
  <!-- Floating Widgets -->
  <div class="floating-widgets">
    <!-- 빠른 예약, 전화, 카카오톡, 길찾기 -->
  </div>
  
  <!-- Mobile Quick Bar -->
  <nav class="mobile-quickbar">
    <!-- 홈, 진료, 예약(중앙강조), 전화, 메뉴 -->
  </nav>
  
  <!-- AI Chatbot Widget (선택) -->
  
  <!-- Scripts -->
  <script defer src="js/main.js"></script>
  <script defer src="js/gnb.js"></script>
  <script defer src="js/translations.js"></script>
  <script defer src="js/language-switcher.js"></script>
</body>
</html>
```

#### 8.1.2 필수 섹션 스타일

**Hero Section**
- 높이: min-height: 100vh (또는 90vh)
- 배경: 다크 그라데이션 + 미묘한 골드 래디얼
- 배지: 글래스모피즘 + 브랜드 컬러 하이라이트
- CTA 버튼: Primary(그라데이션), Secondary(아웃라인), Accent(반투명)
- 숫자 카드: 3D 호버 효과, 카운트업 애니메이션
- 스크롤 인디케이터: 하단 바운스 애니메이션

**Features Banner**
- Ticker 무한 스크롤 애니메이션
- 브랜드 그라데이션 배경
- 아이콘 + 텍스트 조합

**Why Choose Us**
- 3열 그리드 (모바일: 1열)
- 첫 번째 카드: span 3, 큰 아이콘, 체크리스트 포함
- 나머지 카드: 아이콘 + 제목 + 설명
- 호버: 브랜드 컬러 글로우

**Treatments Preview**
- 2x3 그리드 (모바일: 1열)
- 카드: 글래스모피즘, 아이콘 상단
- 호버: 위로 살짝 이동 + 그림자 강화
- 배지: 각 센터별 강조 텍스트

### 8.2 진료 상세 페이지 (treatments/*.html)

각 진료 페이지 필수 요소:
1. **SEO 메타태그** (title, description, keywords)
2. **Schema.org MedicalProcedure**
3. **FAQPage Schema (10개 질문)**
4. **히어로 섹션** (진료명 + 짧은 설명)
5. **이런 분께 추천** 섹션
6. **치료 과정** 타임라인
7. **장점/특징** 그리드
8. **FAQ 아코디언** (10개)
9. **관련 의료진** 소개
10. **CTA** (예약 유도)

### 8.3 의료진 페이지 (doctors/*.html)

**목록 페이지 (index.html)**
- 필터: 전체/분야별
- 카드: 사진 + 이름 + 직책 + 전문분야 뱃지
- 호버: 간략 경력 표시

**상세 페이지 (개별 원장)**
- 히어로: 큰 프로필 사진 + 이름 + 한마디
- 학력/경력/자격 섹션
- 인터뷰 섹션 (선택)
- 해당 원장 전문 진료 링크

---

## 📌 SECTION 9: 기능 구현 상세

### 9.1 헤더/네비게이션 (gnb.js)
```javascript
// 필수 기능
- 스크롤 시 헤더 배경 변화
- 메가 드롭다운 호버/클릭 토글
- 모바일 햄버거 메뉴 (Bottom Sheet)
- 실시간 진료 상태 표시 (시간 기반)
- 현재 페이지 활성화 표시
```

### 9.2 다국어 시스템 (translations.js)
```javascript
// 지원 언어
const LANGUAGES = ['ko', 'en', 'ja', 'zh'];

// 번역 키 구조
window.TRANSLATIONS = {
  common: {
    clinicName: { ko: '{{병원명}}', en: '{{영문명}}', ja: '...', zh: '...' },
    reserve: { ko: '예약하기', en: 'Book Now', ja: '予約する', zh: '预约' },
    // ... 모든 UI 텍스트
  },
  nav: { ... },
  home: { ... },
  treatments: { ... },
  // ...
};
```

### 9.3 숫자 카운터 애니메이션
```javascript
// Intersection Observer로 뷰포트 진입 시 실행
// 0부터 목표값까지 카운트업
// duration: 2초
// easing: easeOutQuad
```

### 9.4 FAQ 아코디언
```javascript
// 클릭 시 smooth height transition
// 한 번에 하나만 열림 (선택적)
// 키보드 접근성 (Enter, Space, 화살표)
```

### 9.5 플로팅 위젯
```javascript
// 스크롤 300px 후 표시
// 예약, 전화, 카카오톡, 길찾기
// 모바일: 하단 퀵바로 대체
```

---

## 📌 SECTION 10: SEO/AEO/GEO 구현

### 10.1 robots.txt
```
User-agent: *
Allow: /

# AI Bots (GEO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://{{도메인}}/sitemap.xml
```

### 10.2 sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://{{도메인}}/</loc>
    <lastmod>{{오늘날짜}}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 모든 페이지 포함 -->
</urlset>
```

### 10.3 Schema.org 필수 타입
1. **Dentist** (메인 페이지)
2. **LocalBusiness** (지역 SEO)
3. **MedicalOrganization** (의료기관)
4. **MedicalProcedure** (진료 페이지)
5. **FAQPage** (모든 진료 페이지)
6. **Physician** (의료진 페이지)
7. **BreadcrumbList** (모든 서브페이지)

---

## 📌 SECTION 11: 반응형 브레이크포인트

```css
/* 브레이크포인트 */
--bp-mobile: 480px;
--bp-tablet: 768px;
--bp-laptop: 992px;
--bp-desktop: 1200px;
--bp-wide: 1400px;

/* 적용 */
@media (max-width: 480px) { /* 소형 모바일 */ }
@media (max-width: 768px) { /* 모바일 */ }
@media (max-width: 992px) { /* 태블릿 */ }
@media (min-width: 993px) { /* 데스크톱 */ }
```

---

## 📌 SECTION 12: 성능 최적화 체크리스트

### 12.1 Critical CSS
- [ ] Above-the-fold CSS 인라인 처리
- [ ] 헤더, 히어로 기본 스타일 인라인
- [ ] 로딩 스피너 인라인

### 12.2 리소스 최적화
- [ ] Preconnect CDN (jsdelivr, fonts.googleapis.com)
- [ ] Font display: swap
- [ ] 이미지 lazy loading
- [ ] CSS/JS defer 로딩

### 12.3 PWA (선택)
- [ ] Service Worker (sw.js)
- [ ] Offline 페이지 (offline.html)
- [ ] Manifest 파일

---

## 📌 SECTION 13: 접근성 체크리스트

- [ ] 색상 대비 4.5:1 이상
- [ ] 키보드 네비게이션 완전 지원
- [ ] Focus visible 스타일
- [ ] ARIA 레이블 적용
- [ ] Skip navigation 링크
- [ ] 시맨틱 HTML 사용
- [ ] prefers-reduced-motion 대응

---

## 📌 SECTION 14: 최종 산출물 체크리스트

### 14.1 HTML 파일 (최소 25개)
- [ ] index.html
- [ ] reservation.html
- [ ] pricing.html
- [ ] directions.html
- [ ] faq.html
- [ ] floor-guide.html
- [ ] treatments/index.html + 개별 진료 페이지들
- [ ] doctors/index.html + 개별 원장 페이지들
- [ ] cases/gallery.html
- [ ] area/ 지역 페이지들
- [ ] auth/ 인증 페이지들
- [ ] offline.html

### 14.2 CSS 파일 (최소 7개)
- [ ] design-system.css
- [ ] main.css
- [ ] gnb.css
- [ ] hero-marketing.css
- [ ] homepage-sections.css
- [ ] mobile-optimize.css
- [ ] language-switcher.css

### 14.3 JS 파일 (최소 4개)
- [ ] main.js
- [ ] gnb.js
- [ ] translations.js
- [ ] language-switcher.js

### 14.4 기타 파일
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] README.md

---

## 🚀 작업 순서

1. **디자인 시스템 구축** (design-system.css)
2. **메인 레이아웃** (main.css)
3. **헤더/네비게이션** (gnb.css, gnb.js)
4. **메인 페이지** (index.html, hero-marketing.css, homepage-sections.css)
5. **진료 안내 메인** (treatments/index.html)
6. **전문센터 페이지들** (treatments/전문센터.html)
7. **일반 진료 페이지들** (treatments/일반진료.html)
8. **의료진 페이지** (doctors/)
9. **병원 안내 페이지들** (pricing, directions, faq, floor-guide)
10. **지역 SEO 페이지** (area/)
11. **다국어 시스템** (translations.js, language-switcher.js)
12. **SEO 파일** (robots.txt, sitemap.xml)
13. **모바일 최적화** (mobile-optimize.css)
14. **최종 테스트 및 README 작성**

---

이제 위 명세에 따라 모든 파일을 생성해주세요. 각 파일은 완전한 코드로 작성하고, 주석으로 구조를 명확히 표시해주세요.
```

---

# 📝 변수 빠른 교체 체크리스트

## 필수 변수 (최소한 이것만 교체하면 작동)

| 변수명 | 예시값 | 설명 |
|--------|--------|------|
| `{{병원명}}` | 서울비디치과 | 한글 병원명 |
| `{{영문명}}` | Seoul BD Dental | 영문 병원명 |
| `{{슬로건}}` | Best Dedication | 브랜드 슬로건 |
| `{{전화번호}}` | 041-415-2892 | 대표 전화 |
| `{{도로명주소}}` | 충남 천안시 서북구 불당34길 14 | 전체 주소 |
| `{{위도}}` | 36.8151 | 지도용 위도 |
| `{{경도}}` | 127.1139 | 지도용 경도 |
| `{{대표지역1}}` | 천안 | 메인 타겟 지역 |
| `{{원장수}}` | 15 | 총 원장 수 |
| `{{브랜드_메인색상}}` | #8B5A2B | CSS 메인 컬러 |
| `{{브랜드_강조색상}}` | #C9A962 | CSS 강조 컬러 |
| `{{전문센터1_이름}}` | 임플란트센터 | 메인 전문센터 |
| `{{카카오톡_URL}}` | https://pf.kakao.com/... | 카카오 채널 |

---

# 사용 예시

```
당신은 최고급 병원 웹사이트 전문 개발자입니다...

## 📌 SECTION 1: 병원 기본 정보

### 1.1 병원 식별 정보
- **병원명 (한글)**: 강남플러스치과
- **병원명 (영문)**: Gangnam Plus Dental
- **슬로건/브랜드 메시지**: Plus Care, Plus Smile
...
```

---

© 2024 Hospital Website Template - Based on Seoul BD Dental
