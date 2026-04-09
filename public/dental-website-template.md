# 치과 홈페이지 템플릿 — 완전 복제 설계서

> **이 문서 하나만 있으면**, 새로운 채팅방에서 "이 MD 보고 똑같이 만들어줘"라고 하면
> 디자인과 내용만 다른 **쌍둥이 홈페이지**가 나옵니다.

---

## 0. 한줄 요약

Hono(TypeScript) + Cloudflare Pages + R2 + D1 기반의 **치과 전용 풀스택 홈페이지**.
환자 퍼널(인지→검색→방문→예약→상담→치료→만족→소개)을 코드로 구현한 시스템.

---

## 1. 기술 스택

| 영역 | 기술 | 역할 |
|------|------|------|
| **프레임워크** | Hono v4 | 백엔드 라우팅 + SSR |
| **런타임** | Cloudflare Workers | 글로벌 엣지 배포 |
| **호스팅** | Cloudflare Pages | 정적+동적 하이브리드 |
| **오브젝트 스토리지** | Cloudflare R2 | 이미지, 회원, 케이스, 예약, 컬럼 JSON 저장 |
| **SQL DB** | Cloudflare D1 (SQLite) | 게임 점수, 페이지 조회수 |
| **빌드** | Vite + @hono/vite-cloudflare-pages | TS → _worker.js 빌드 |
| **프론트엔드** | Vanilla JS + Tailwind CDN + Font Awesome | 프레임워크 없음, 순수 HTML/CSS/JS |
| **이메일** | Resend API | 예약 알림 이메일 |
| **AI 챗봇** | OpenAI GPT-4o-mini | 실시간 상담 챗봇 |
| **OAuth** | Google OAuth 2.0 | 소셜 로그인 |
| **분석** | GA4 + GTM + Meta Pixel + Amplitude | 풀 마케팅 트래킹 |
| **다국어** | Weglot | 자동 다국어 번역 |
| **블로그** | InBlog (외부) → 프록시 | 블로그 콘텐츠 |
| **SEO** | IndexNow + Google Ping + JSON-LD | 검색엔진 최적화 |

---

## 2. 프로젝트 디렉토리 구조

```
webapp/
├── src/
│   └── index.tsx              # ★ 메인 백엔드 (3,500줄+, 모든 API + SSR 라우트)
│
├── css/
│   └── site-v5.css            # 전역 CSS (GNB, 푸터, 공통 컴포넌트)
│
├── js/
│   ├── analytics.js           # GA4+GTM+Amplitude 통합 트래킹
│   ├── gnb.js                 # 글로벌 네비게이션 바 (모바일 메뉴 포함)
│   ├── main.js                # 메인페이지 전용 로직
│   ├── gallery.js             # 비포/애프터 갤러리 (필터, 카드, 로그인 체크)
│   ├── blog.js                # 블로그 목록/필터
│   ├── column.js              # 원장 컬럼 리스트
│   ├── encyclopedia.js        # 치과 백과사전 검색/필터
│   ├── video.js               # 유튜브 영상 갤러리
│   └── mission-motion-v4.js   # 미션 페이지 애니메이션
│
├── index.html                 # 메인 홈페이지
├── pricing.html               # 비용 안내
├── reservation.html           # 예약 페이지
├── directions.html            # 오시는 길
├── faq.html                   # FAQ 메인
├── floor-guide.html           # 층별 안내
├── mission.html               # 병원 미션/비전
├── privacy.html               # 개인정보 처리방침
├── terms.html                 # 이용약관
├── 404.html                   # 404 에러 페이지
│
├── treatments/                # 진료과목 페이지 (51개)
│   ├── index.html             # 전체 진료 목록
│   ├── implant.html           # 임플란트 메인
│   ├── implant-*.html         # 임플란트 서브 (12개: navigation, sinus-lift 등)
│   ├── invisalign.html        # 인비절라인 메인
│   ├── invisalign-*.html      # 인비절라인 서브 (5개)
│   ├── orthodontics.html      # 치아교정
│   ├── ortho-*.html           # 교정 서브 (5개)
│   ├── pediatric.html         # 소아치과
│   └── [기타 27개 진료].html  # cavity, crown, scaling 등
│
├── doctors/                   # 의료진 페이지 (16개)
│   ├── index.html             # 전체 의료진 목록
│   └── [slug].html            # 개별 의료진 (moon, kim, hyun 등)
│
├── cases/                     # 비포/애프터
│   ├── gallery.html           # 갤러리 목록 (JS로 동적 로드)
│   └── index.html             # 리다이렉트
│
├── auth/                      # 인증 페이지
│   ├── login.html             # 로그인
│   ├── register.html          # 회원가입
│   └── mypage.html            # 마이페이지
│
├── admin/                     # 관리자 패널
│   ├── index.html             # 대시보드
│   ├── cases.html             # 케이스 관리 (CRUD)
│   ├── reservations.html      # 예약 관리
│   ├── columns.html           # 컬럼 관리
│   └── notices.html           # 공지사항 관리
│
├── blog/
│   └── index.html             # 블로그 (InBlog 프록시)
│
├── video/
│   └── index.html             # 유튜브 영상 갤러리
│
├── notice/
│   └── index.html             # 공지사항
│
├── encyclopedia/
│   └── index.html             # 치과 백과사전 (SSR)
│
├── column/
│   ├── index.html             # 원장 컬럼 리스트 (레거시, /blog로 리다이렉트)
│   └── columns.html           # (레거시)
│
├── area/                      # 지역 SEO 페이지 (88개)
│   ├── cheonan.html           # 천안 메인
│   ├── cheonan-implant.html   # 천안 임플란트
│   └── [지역]-[치료].html     # 지역×치료 조합
│
├── faq/                       # FAQ 진료별 (16개)
│   ├── implant.html
│   └── [치료].html
│
├── images/                    # 정적 이미지
│   ├── doctors/               # 의료진 프로필/진료 사진 (webp+jpg)
│   ├── facility/              # 시설 사진
│   ├── icons/                 # 파비콘, PWA 아이콘
│   └── og-*.jpg               # OG 이미지
│
├── data/
│   ├── encyclopedia.json      # 백과사전 데이터 (빌드 시 사용)
│   └── youtube-cache.json     # 유튜브 RSS 캐시 (빌드 시 생성)
│
├── public/
│   ├── _headers               # Cloudflare 커스텀 헤더
│   ├── _routes.json            # Cloudflare 라우트 설정
│   ├── data/                  # 빌드 결과물 데이터
│   └── js/
│       └── treatment-cases.js # 진료 페이지 내 비포/애프터 카드 삽입
│
├── migrations/                # D1 SQL 마이그레이션
│   ├── 0001_chbti_results.sql
│   ├── 0002_flight_scores.sql
│   ├── 0003_run_scores.sql
│   └── 0004_page_views.sql
│
├── scripts/                   # 빌드/유틸 스크립트
│   ├── fetch-youtube.cjs      # 유튜브 RSS → JSON 캐시
│   ├── post-build.cjs         # 빌드 후 정적파일 복사 + _routes.json 패치
│   └── [기타 생성 스크립트]
│
├── _headers                   # 보안/캐시 헤더 규칙
├── _redirects                 # 301 리다이렉트 규칙
├── robots.txt                 # 크롤러 접근 규칙
├── sitemap.xml                # 메인 사이트맵
├── sitemap-main.xml           # 주요 페이지 사이트맵
├── sitemap-area.xml           # 지역 SEO 사이트맵
├── sitemap-encyclopedia.xml   # 백과사전 사이트맵
├── manifest.json              # PWA 매니페스트
├── llms.txt                   # LLM 봇용 사이트 설명
├── llms-full.txt              # LLM 봇용 상세 설명
│
├── package.json               # 의존성 + 스크립트
├── vite.config.ts             # Vite 빌드 설정
├── wrangler.jsonc             # Cloudflare Workers 설정
├── ecosystem.config.cjs       # PM2 로컬 개발 설정
├── tsconfig.json              # TypeScript 설정
└── .dev.vars                  # 로컬 환경변수 (시크릿)
```

---

## 3. 백엔드 API 엔드포인트 전체 맵 (src/index.tsx)

### 3-1. 인증 시스템

| Method | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/auth/register` | 공개 | 회원가입 (이메일, 비밀번호, 이름, 전화, 마케팅동의) |
| POST | `/api/auth/login` | 공개 | 이메일 로그인 |
| POST | `/api/auth/logout` | 공개 | 로그아웃 (쿠키 삭제) |
| GET | `/api/auth/me` | 공개 | 현재 로그인 상태 + 회원정보 반환 |
| PUT | `/api/auth/marketing` | 회원 | 마케팅 수신 동의 변경 |
| GET | `/api/auth/google` | 공개 | Google OAuth 시작 (리다이렉트) |
| GET | `/api/auth/google/callback` | 공개 | Google OAuth 콜백 → 자동가입/로그인 |

**인증 방식**: HMAC 기반 세션 토큰 → HttpOnly 쿠키
- 관리자: `bd_admin_session` 쿠키 (24시간)
- 회원: `bd_session` 쿠키 (30일)

### 3-2. 관리자 시스템

| Method | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/admin/login` | 공개 | 관리자 로그인 페이지 |
| POST | `/admin/login` | 공개 | 관리자 비밀번호 인증 |
| GET | `/admin/logout` | 공개 | 관리자 로그아웃 |
| GET | `/admin/*` | 관리자 | 관리자 패널 (미들웨어로 인증 체크) |

### 3-3. 케이스(비포/애프터) 관리

| Method | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/cases` | 공개 | 케이스 목록 (비로그인 시 이미지 URL 제거) |
| GET | `/api/cases/:id` | 회원 | 케이스 상세 (비로그인 시 401) |
| GET | `/api/admin/cases` | 관리자 | 전체 케이스 (미공개 포함) |
| POST | `/api/admin/cases` | 관리자 | 새 케이스 생성 |
| PUT | `/api/admin/cases/:id` | 관리자 | 케이스 수정 |
| DELETE | `/api/admin/cases/:id` | 관리자 | 케이스 삭제 |

### 3-4. 이미지 관리

| Method | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/admin/upload` | 관리자 | 이미지 업로드 → R2 저장 |
| GET | `/api/images/*` | **회원** | 이미지 조회 (비로그인 시 403, 의료법 준수) |
| DELETE | `/api/admin/images/*` | 관리자 | 이미지 삭제 |

**핵심: 의료법 이미지 보호 3중 방어**
1. API 레이어: `/api/cases` 비로그인 시 이미지 URL을 빈 문자열로 반환
2. 이미지 엔드포인트: `/api/images/cases/*` 인증 쿠키 없으면 403
3. SSR 상세페이지: `/cases/:id` 비로그인 시 HTML에 img src 미포함 + 블러 오버레이

### 3-5. 예약 시스템

| Method | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/reservation` | 공개 | 예약 접수 → R2 저장 + Resend 이메일 알림 |
| GET | `/api/admin/reservations` | 관리자 | 예약 목록 조회 |
| PUT | `/api/admin/reservations/:id` | 관리자 | 예약 상태 변경 |
| DELETE | `/api/admin/reservations/:id` | 관리자 | 예약 삭제 |

### 3-6. 컬럼/블로그

| Method | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/columns` | 공개 | 공개 컬럼 목록 |
| GET | `/api/columns/:id` | 공개 | 컬럼 상세 |
| GET | `/api/admin/columns` | 관리자 | 전체 컬럼 |
| POST | `/api/admin/columns` | 관리자 | 새 컬럼 |
| DELETE | `/api/admin/columns/:id` | 관리자 | 컬럼 삭제 |
| GET | `/api/inblog-rss` | 공개 | InBlog RSS 프록시 |

### 3-7. 기타 API

| Method | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/members` | 관리자 | 전체 회원 목록 |
| GET | `/api/health` | 공개 | 헬스체크 |
| GET | `/api/google-reviews` | 공개 | Google Place 리뷰 프록시 |
| POST | `/api/chat` | 공개 | GPT-4o-mini 챗봇 |
| POST | `/api/views` | 공개 | 페이지 조회수 기록 (D1) |
| GET | `/api/views` | 공개 | 전체 조회수 통계 |
| GET | `/api/views/:type/:id` | 공개 | 개별 조회수 |
| POST | `/api/indexnow` | 관리자 | IndexNow SEO 핑 |
| POST | `/api/google-ping` | 관리자 | Google Ping SEO 알림 |

### 3-8. 게임/이벤트 (바이럴 마케팅용)

| Method | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/chbti/result` | 공개 | 치BTI 결과 저장 (D1) |
| GET | `/api/chbti/stats` | 공개 | 치BTI 통계 |
| POST | `/api/flight/result` | 공개 | 치석 플라이트 점수 저장 |
| GET | `/api/flight/stats` | 공개 | 치석 플라이트 랭킹 |
| POST | `/api/run/result` | 공개 | TOOTH RUN 점수 저장 |
| GET | `/api/run/stats` | 공개 | TOOTH RUN 랭킹 |

### 3-9. SSR 페이지 (서버사이드 렌더링)

아래 페이지들은 **index.tsx에서 동적 HTML을 생성**:

| 경로 | 설명 |
|------|------|
| `/doctors/:slug` | 의료진 상세 (R2 데이터 연동, 케이스+컬럼 포함) |
| `/cases/:id` | 비포/애프터 상세 (인증 체크, SEO 메타, JSON-LD) |
| `/column/` | 컬럼 목록 (R2 데이터 + 필터) |
| `/column/:id` | 컬럼 상세 (R2 데이터) |
| `/blog/*` | InBlog 프록시 (외부 블로그를 자체 도메인으로) |
| `/encyclopedia/:term` | 백과사전 상세 (JSON 데이터 기반 SSR) |
| `/encyclopedia/category/:name` | 백과사전 카테고리 |

---

## 4. 데이터 모델

### 4-1. R2 오브젝트 스토리지 구조

```
R2 버킷/
├── data/
│   ├── members.json          # 전체 회원 목록
│   ├── cases.json            # 전체 케이스 목록
│   ├── columns.json          # 전체 컬럼 목록
│   ├── reservations.json     # 예약 목록 (관리자 조회용)
│   └── reservations/
│       └── rsv-[id].json     # 개별 예약 (race condition 방지)
│
├── images/
│   └── cases/
│       └── [timestamp]-[random].jpg  # 비포/애프터 이미지
│
└── notices/                  # 공지사항 데이터
```

### 4-2. 회원 (Member) 스키마

```typescript
{
  id: string              // Date.now().toString(36) + random
  email: string           // 소문자, 유니크
  name: string
  phone: string
  passwordHash: string    // PBKDF2 해시
  passwordSalt: string
  privacyConsent: boolean
  marketingConsent: boolean
  marketingConsentUpdatedAt?: string  // ISO 날짜
  createdAt: string       // ISO 날짜
  // Google OAuth 사용자:
  googleId?: string
  profileImage?: string
}
```

### 4-3. 케이스 (Case) 스키마

```typescript
{
  id: string              // nanoid 스타일
  title: string           // "앞니 심미레진 수복"
  category: string        // 'implant' | 'invisalign' | ... (27개 카테고리)
  doctorName: string      // "문석준 원장"
  treatmentPeriod?: string // "3개월"
  description?: string    // 케이스 설명
  beforeImage?: string    // R2 이미지 경로
  afterImage?: string
  panBeforeImage?: string // 파노라마
  panAfterImage?: string
  status: 'published' | 'draft'
  createdAt: string
}
```

### 4-4. 예약 (Reservation) 스키마

```typescript
{
  id: string              // "rsv-{timestamp}-{random}"
  treatment: string       // 진료과목 한글명
  date: string            // 희망 날짜
  time: string            // 희망 시간
  name: string
  phone: string
  message?: string
  marketing: boolean
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}
```

### 4-5. 컬럼 (Column) 스키마

```typescript
{
  id: string
  title: string
  content: string         // HTML 본문
  doctorName: string
  thumbnail?: string
  status: 'published' | 'draft'
  createdAt: string
}
```

### 4-6. D1 테이블 (SQLite)

```sql
-- 치BTI 결과
chbti_results (id, type_code, created_at)

-- 치석 플라이트 점수
flight_scores (id, score, grade, created_at)

-- TOOTH RUN 점수
run_scores (id, survival_time, grade, created_at)

-- 페이지 조회수
page_views (id, page_type, page_id, view_count, last_viewed_at, created_at)
```

---

## 5. 진료 카테고리 시스템

### 5-1. 전체 카테고리 맵 (27개)

이 맵은 **admin, gallery.js, treatment-cases.js, SSR 4곳에서 동기화** 필수:

```javascript
const CATS = {
  implant: '임플란트',
  invisalign: '인비절라인',
  orthodontics: '치아교정',
  pediatric: '소아치과',
  'front-crown': '앞니크라운',
  aesthetic: '심미레진',
  glownate: '글로우네이트',
  cavity: '충치치료',
  resin: '레진치료',
  crown: '크라운',
  inlay: '인레이/온레이',
  'root-canal': '신경치료',
  're-root-canal': '재신경치료',
  whitening: '미백',
  bridge: '브릿지',
  denture: '틀니',
  scaling: '스케일링',
  gum: '잇몸치료',
  periodontitis: '치주염',
  'gum-surgery': '잇몸수술',
  'wisdom-tooth': '사랑니발치',
  apicoectomy: '치근단절제술',
  sedation: '수면치료',
  prevention: '예방치료',
  tmj: '턱관절(TMJ)',
  bruxism: '이갈이/브럭시즘',
  emergency: '응급치료'
}
```

### 5-2. 갤러리 필터 그룹 매핑

비포/애프터 갤러리에서 27개 카테고리를 8개 필터 그룹으로 묶음:

```javascript
const filterGroupMap = {
  'implant': 'implant',
  'invisalign': 'invisalign',
  'orthodontics': 'orthodontics',
  'pediatric': 'orthodontics',      // 소아치과 → 교정 그룹
  'front-crown': 'front-crown',
  'aesthetic': 'aesthetic',
  'glownate': 'glownate',
  'resin': 'resin',
  'whitening': 'whitening',
  // 일반치료 그룹
  'cavity': 'general', 'crown': 'general', 'inlay': 'general',
  'root-canal': 'general', 're-root-canal': 'general',
  'bridge': 'general', 'denture': 'general',
  'sedation': 'general', 'prevention': 'general',
  'tmj': 'general', 'bruxism': 'general', 'emergency': 'general',
  // 잇몸 그룹
  'scaling': 'gum', 'gum': 'gum', 'periodontitis': 'gum',
  'gum-surgery': 'gum', 'wisdom-tooth': 'gum', 'apicoectomy': 'gum'
}
```

---

## 6. 프론트엔드 구조

### 6-1. 공통 레이아웃 (모든 페이지)

모든 HTML 페이지는 아래 구조를 공유:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <!-- 1. 트래킹 코드 (GTM, GA4, Amplitude, Meta Pixel) -->
  <!-- 2. SEO 메타 (title, description, canonical, OG, Twitter) -->
  <!-- 3. JSON-LD 구조화 데이터 -->
  <!-- 4. CSS (Pretendard 폰트, Font Awesome, site-v5.css) -->
  <!-- 5. Weglot 다국어 -->
  <!-- 6. 페이지별 인라인 스타일 -->
  <script src="/js/analytics.js?v=..." defer></script>
</head>
<body>
  <!-- GTM noscript -->
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>

  <!-- 헤더 (site-v5.css + gnb.js) -->
  <header class="site-header">
    <!-- 로고 | 진료상태(진료중/마감) | 메가드롭다운 GNB | 로그인/예약 버튼 -->
  </header>

  <div class="header-spacer"></div>

  <main id="main-content" role="main">
    <!-- 페이지 콘텐츠 -->
  </main>

  <!-- 푸터 -->
  <footer class="footer">
    <!-- 전문센터 링크 | 병원안내 | 고객지원 | 연락처 | 소셜 | 사업자정보 -->
  </footer>

  <!-- 모바일 슬라이드 메뉴 -->
  <nav class="mobile-nav">...</nav>

  <!-- Floating CTA (데스크톱: 우측 하단) -->
  <div class="floating-cta desktop-only">
    <!-- 맨위로 | 카카오톡 | 전화 -->
  </div>

  <!-- Mobile Bottom CTA (모바일: 하단 고정) -->
  <div class="mobile-bottom-cta mobile-only">
    <!-- 전화 | 카카오톡 | 예약 | 오시는길 -->
  </div>

  <script src="/js/gnb.js" defer></script>
</body>
</html>
```

### 6-2. CSS 설계 (site-v5.css)

CSS 변수 기반 디자인 시스템:

```css
:root {
  --brand: #6B4226;          /* 메인 브랜드 컬러 — ★ 병원별 커스텀 */
  --brand-dark: #5a3720;
  --brand-gold: #a0714f;
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #e8e8e8;
  --gray-300: #d4d4d4;
  --gray-400: #a3a3a3;
  --gray-500: #737373;
  --gray-600: #525252;
  --gray-800: #262626;
  --text-primary: #1a1a2e;
  --red: #ef4444;
}
```

### 6-3. JavaScript 역할 분담

| 파일 | 역할 | 로드 위치 |
|------|------|----------|
| `analytics.js` | GTM/GA4/Amplitude 이벤트 전송 | 전체 페이지 |
| `gnb.js` | GNB 드롭다운, 모바일 메뉴, 스크롤 효과 | 전체 페이지 |
| `main.js` | 메인 히어로, Google 리뷰 로드, 유튜브 카드 | index.html만 |
| `gallery.js` | 비포/애프터 카드, 필터, 인증 체크 | cases/gallery.html |
| `treatment-cases.js` | 진료 페이지 내 관련 케이스 자동 삽입 | treatments/*.html |
| `blog.js` | InBlog RSS 파싱, 블로그 카드 렌더링 | blog/ |
| `video.js` | 유튜브 캐시 로드, 영상 그리드 | video/ |
| `encyclopedia.js` | 검색, 카테고리 필터, 무한스크롤 | encyclopedia/ |

---

## 7. 외부 서비스 연동 + 환경변수

### 7-1. 환경변수 (.dev.vars / Cloudflare Secrets)

```bash
# 관리자 인증
ADMIN_PASSWORD=          # 관리자 로그인 비밀번호
ADMIN_SESSION_SECRET=    # HMAC 세션 서명 키

# Google OAuth
GOOGLE_CLIENT_ID=        # Google Cloud Console OAuth 클라이언트 ID
GOOGLE_CLIENT_SECRET=    # Google Cloud Console OAuth 시크릿

# 이메일 알림
RESEND_API_KEY=          # Resend.com API 키
NOTIFICATION_EMAIL=      # 예약 알림 수신 이메일

# AI 챗봇 (선택)
OPENAI_API_KEY=          # OpenAI API 키 (GPT-4o-mini)
```

### 7-2. 하드코딩된 외부 서비스 키 (병원별 교체 필요)

```
# src/index.tsx 내 하드코딩 (병원별 반드시 교체)
GTM 컨테이너 ID:       GTM-XXXXXXX
GA4 측정 ID:           G-XXXXXXXXXX
Amplitude API 키:      [amplitude_api_key]
Meta Pixel ID:         [pixel_id]
Weglot API 키:         wg_XXXXX
Google Maps API 키:    [google_maps_api_key]
Google Place ID:       [place_id]
IndexNow 키:           [indexnow_key]
YouTube 채널 ID:       [channel_ids in scripts/fetch-youtube.cjs]
카카오톡 채널:          https://pf.kakao.com/[채널주소]
InBlog 도메인:          https://inblog.ai/[블로그아이디]
```

---

## 8. wrangler.jsonc (Cloudflare 설정)

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "{{PROJECT_NAME}}",           // ★ 병원별 변경
  "compatibility_date": "2025-12-20",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "{{BUCKET_NAME}}"  // ★ 병원별 R2 버킷
    }
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "{{DB_NAME}}",   // ★ 병원별 D1 DB
      "database_id": "{{DB_ID}}"
    }
  ]
}
```

---

## 9. 빌드 & 배포

### 9-1. 빌드 프로세스

```bash
npm run build
# 실제 실행되는 것:
# 1. node scripts/fetch-youtube.cjs   → public/data/youtube-cache.json 생성
# 2. vite build                        → dist/_worker.js 생성
# 3. node scripts/post-build.cjs      → 정적파일 dist 복사 + _routes.json 패치
```

### 9-2. 로컬 개발

```bash
npm run build
pm2 start ecosystem.config.cjs
# → wrangler pages dev dist --d1={{DB_NAME}} --local --ip 0.0.0.0 --port 3000
```

### 9-3. 프로덕션 배포

```bash
npx wrangler pages deploy dist --project-name {{PROJECT_NAME}}
```

### 9-4. D1 마이그레이션

```bash
# 로컬
npx wrangler d1 migrations apply {{DB_NAME}} --local

# 프로덕션
npx wrangler d1 migrations apply {{DB_NAME}}
```

---

## 10. SEO 전략

### 10-1. 페이지별 SEO

- 모든 페이지에 고유 `<title>`, `<meta description>`, `<link rel="canonical">`
- OG 태그 + Twitter Card 전체 설정
- JSON-LD 구조화 데이터:
  - Organization (병원 정보)
  - DentalClinic (치과 특화)
  - MedicalWebPage (진료 페이지)
  - BreadcrumbList (탐색 경로)
  - FAQPage (FAQ 페이지)
  - Article (컬럼/블로그)

### 10-2. 지역 SEO (area 페이지)

88개 지역×진료 조합 페이지로 **"[지역] [치료] 치과"** 키워드 공략:
- `area/cheonan-implant.html` → "천안 임플란트 치과"
- `area/sejong-invisalign.html` → "세종 인비절라인 치과"

### 10-3. 기술 SEO

- `sitemap.xml` (메인 + 지역 + 백과사전 분리)
- `robots.txt` 크롤러 가이드
- `llms.txt` / `llms-full.txt` LLM 봇용
- IndexNow + Google Ping 자동 제출
- `_headers`에 Cache-Control 최적화
- `_redirects`에 301 리다이렉트 (레거시 URL 관리)

---

## 11. 보안 설계

| 항목 | 구현 |
|------|------|
| **비밀번호** | PBKDF2 (SHA-256, salt 16바이트, 10만 iterations) |
| **세션** | HMAC-SHA256 서명 토큰 → HttpOnly Secure SameSite=Lax 쿠키 |
| **관리자** | 별도 세션 쿠키 + 미들웨어 인증 |
| **CORS** | `/api/*` 경로만 cors() 미들웨어 적용 |
| **CSP** | `frame-ancestors 'self' https://도메인` |
| **헤더** | X-Content-Type-Options, X-XSS-Protection, HSTS, Referrer-Policy |
| **의료법** | 비포/애프터 이미지 3중 보호 (API+이미지+SSR) |
| **시크릿** | Cloudflare Secrets으로 환경변수 관리 (.dev.vars 로컬용) |

---

## 12. 새 병원 세팅 시 교체해야 할 것

### 12-1. 필수 교체 항목 (★)

```
1. 병원 기본 정보
   - 병원명, 주소, 전화번호, 진료시간
   - 대표자명, 사업자등록번호
   - 로고, 파비콘, OG 이미지

2. 의료진 정보
   - 의료진 목록 (doctors/*.html)
   - DOCTOR_SLUG_MAP (src/index.tsx)
   - 프로필/진료 사진 (images/doctors/)

3. 진료과목 커스텀
   - 해당 병원의 진료과목만 활성화 (CATS에서 불필요한 것 제거)
   - treatments/ 폴더에서 해당 진료만 유지
   - 가격 정보 (pricing.html)

4. 외부 서비스 키
   - 모든 환경변수 (.dev.vars)
   - GTM, GA4, Meta Pixel, Amplitude ID
   - Weglot API 키
   - Google Maps API 키 + Place ID
   - YouTube 채널 ID
   - 카카오톡 채널 URL
   - InBlog 도메인 (또는 제거)

5. Cloudflare 설정
   - wrangler.jsonc (프로젝트명, R2 버킷, D1 DB)
   - 커스텀 도메인
   - Secrets 등록

6. 디자인
   - CSS 변수 (--brand, --brand-dark, --brand-gold)
   - 메인 히어로 섹션 내용
   - 푸터 정보
```

### 12-2. 선택 교체 항목

```
- 지역 SEO 페이지 (area/) → 해당 병원 지역으로 재생성
- FAQ 페이지 (faq/) → 진료과목에 맞게
- 백과사전 (data/encyclopedia.json) → 유지 또는 커스텀
- 게임/이벤트 (checkup, flight, run) → 유지 또는 제거
- 챗봇 시스템 프롬프트 → 병원 정보로 교체
- 이메일 템플릿 HTML → 병원 브랜딩으로
```

---

## 13. 패키지 의존성

```json
{
  "dependencies": {
    "hono": "^4.11.1"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241205.0",
    "@hono/vite-build": "^1.2.0",
    "@hono/vite-cloudflare-pages": "^0.4.3",
    "@hono/vite-dev-server": "^0.18.2",
    "vite": "^6.3.5",
    "wrangler": "^4.4.0"
  }
}
```

---

## 14. vite.config.ts

```typescript
import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [pages()],
  build: { outDir: 'dist' }
})
```

---

## 15. ecosystem.config.cjs (PM2 로컬 개발)

```javascript
module.exports = {
  apps: [{
    name: '{{PROJECT_NAME}}',
    script: 'npx',
    args: 'wrangler pages dev dist --d1={{DB_NAME}} --local --ip 0.0.0.0 --port 3000',
    env: { NODE_ENV: 'development', PORT: 3000 },
    watch: false, instances: 1, exec_mode: 'fork'
  }]
}
```

---

## 16. 구현 순서 가이드

새 병원 홈페이지를 만들 때 권장하는 순서:

```
Phase 1: 기반 (1일)
  1. Hono 프로젝트 생성 + Cloudflare Pages 설정
  2. 공통 CSS (site-v5.css) + GNB + 푸터 세팅
  3. R2 버킷 생성 + D1 DB 생성 + 마이그레이션

Phase 2: 핵심 페이지 (2~3일)
  4. 메인 페이지 (index.html)
  5. 진료과목 페이지 (treatments/)
  6. 의료진 페이지 (doctors/ + SSR)
  7. 예약 시스템 (reservation.html + API)

Phase 3: 회원 + 콘텐츠 (2~3일)
  8. 인증 시스템 (가입/로그인/OAuth/마이페이지)
  9. 비포/애프터 시스템 (갤러리 + 상세 + 이미지 보호)
  10. 관리자 패널 (케이스/예약/회원 관리)

Phase 4: 부가 기능 (1~2일)
  11. 블로그 연동 (InBlog 프록시 또는 자체)
  12. 비용 안내, FAQ, 오시는 길, 층별 안내
  13. 마케팅 트래킹 (GA4, GTM, Meta Pixel, Amplitude)

Phase 5: SEO + 최적화 (1~2일)
  14. JSON-LD 구조화 데이터
  15. 사이트맵, robots.txt, llms.txt
  16. 지역 SEO 페이지 생성
  17. _headers, _redirects 보안/캐시 최적화

Phase 6: 배포 + 마무리
  18. Cloudflare Pages 배포
  19. 커스텀 도메인 연결
  20. Secrets 등록
  21. 최종 테스트
```

---

## 17. 핵심 설계 철학

> 이 홈페이지는 **"환자 경험 설계(Patient Experience Design)"** 기반:

1. **검색 → 방문**: 지역 SEO + 백과사전으로 유입
2. **방문 → 신뢰**: 의료진 소개 + Google 리뷰 + 비포/애프터 (로그인 유도)
3. **신뢰 → 예약**: CTA 버튼 (전화, 카카오, 예약) 상시 노출
4. **예약 → 방문**: Resend 이메일 알림으로 즉시 응대
5. **방문 → 재방문**: 마이페이지, 마케팅 동의 관리
6. **재방문 → 소개**: 비포/애프터 공유 (로그인 기반 바이럴)

모든 기능은 이 퍼널의 **전환율을 높이는 방향**으로 설계되어 있음.

---

*이 문서는 서울비디치과 홈페이지(bdbddc.com)의 완전 복제 설계서입니다.*
*새 채팅방에서 이 MD와 함께 "이 구조로 [병원명] 홈페이지 만들어줘"라고 하면 됩니다.*
