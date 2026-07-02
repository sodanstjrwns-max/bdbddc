# 서울비디치과 웹사이트 (Seoul BD Dental)

## Project Overview
- **Name**: seoul-bd-dental
- **Goal**: 서울비디치과 공식 웹사이트 — 51+ 서브페이지, 라이트 테마, 반응형 UX, SEO 최적화
- **Platform**: Cloudflare Pages + Hono Framework + R2 Storage
- **Design System**: site-v5.css (통합 디자인 시스템)

## URLs
- **Production**: https://seoul-bd-dental.pages.dev
- **Canonical Domain**: https://bdbddc.com
- **Sandbox Preview**: https://3000-ij595eoqjfhonf0rq8pba-18e660f9.sandbox.novita.ai
- **GitHub**: https://github.com/sodanstjrwns-max/bdbddc

## Current Version: v5.6

### Completed Features

#### Core System
- 전면 라이트 테마 디자인 (site-v5.css)
- 51+ 서브페이지 통일 구조
- Hono SSR 백엔드 (Cloudflare Workers)
- R2 클라우드 스토리지 (케이스 데이터, 이미지, 회원 데이터)
- GPT 챗봇 API (OpenAI GPT-4o-mini)
- 실시간 진료 상태 표시 (GNB)

#### 회원 시스템 (v5.1)
- **회원가입** (`/auth/register`): 3단계 폼 (이메일+비밀번호 → 이름+전화번호 → 약관동의)
  - 비밀번호 강도 바, 일치 확인, 전화번호 자동 포맷 (010-xxxx-xxxx)
  - 필수: 이메일, 비밀번호(8자+, 영문+숫자), 이름, 전화번호, 개인정보 동의
  - 선택: 마케팅 동의
  - 가입 완료 시 자동 로그인 → 마이페이지 리다이렉트
- **로그인** (`/auth/login`): 이메일+비밀번호, `?redirect=` 파라미터 지원, 무차별대입 방어(IP당 15분 20회)
- **Google 소셜 로그인** (`/api/auth/google`): OAuth 2.0, 자동 가입 + 기존 이메일 계정 자동 연동, CSRF state 검증
- **비밀번호 찾기** (`/auth/reset-password`, v5.4): 이메일 재설정 링크(Resend) → 새 비밀번호 설정
  - 토큰 SHA-256 해시만 DB 저장, 1시간 유효, 1회용(재사용 차단), 계정 존재 유출 방지 동일응답, IP당 15분 5회 제한
- **마이페이지** (`/auth/mypage`): 사용자 정보 표시, 로그아웃
- **세션 관리**: HMAC 기반 쿠키 세션 (httpOnly, 30일 유효), PBKDF2 비밀번호 해싱
- **회원 저장소 D1 이관** (v5.4): R2 JSON → D1 `members` 테이블 (UNIQUE 이메일, race condition 해소)
  - 기존 R2 `data/members.json`은 최초 요청 시 자동 1회 이관(lazy migration) 후 백업으로 보존
- **GNB 전역 로그인 동기화** (v5.2): 모든 페이지에서 로그인 시 헤더에 사용자이름+로그아웃 표시

#### Before/After 갤러리 (v5.1)
- **갤러리** (`/cases/gallery`): R2 API 연동, 24개 카테고리 → 6개 필터 그룹
- **케이스 상세** (`/cases/:id`): SSR, 로그인 필요 (미로그인 시 잠금 페이지 → 로그인 유도)
- **반응형 레이아웃** (v5.2): 3열(데스크톱), 2열(태블릿), 1열(모바일)
- 이미지 없는 케이스 하단 정렬, 블러/잠금 오버레이

#### 관리자 시스템
- **관리자 패널** (`/admin/`): 다크 테마, 독립 레이아웃
- **케이스 CRUD**: R2 JSON 기반 (localStorage 완전 제거)
- **이미지 업로드**: R2 스토리지 (최대 10MB, JPG/PNG/WebP/GIF)
- **비밀번호 인증**: HMAC 세션 쿠키

#### 콘텐츠
- **블로그** (`/blog/`): InBlog 프록시
- **영상** (`/video/`): YouTube 캐시 (빌드 시 갱신)
- **치과 백과사전** (`/encyclopedia/`): 500개 용어, SSR, 카테고리별 FAQ, 자동 인터링킹
- **공지사항** (`/notice/`)

#### SEO
- 301 리다이렉트 (구 URL 마이그레이션)
- IndexNow API (Bing, Yandex, Naver 동시 제출)
- Google Ping (sitemap 변경 알림)
- JSON-LD 구조화 데이터 (BreadcrumbList, FAQPage, Dentist, DefinedTerm)
- Google Reviews API 프록시
- 28개 지역 페이지 (`/area/*`)

### Key Pages & URIs
| 경로 | 설명 |
|------|------|
| `/` | 메인 홈페이지 |
| `/auth/register` | 회원가입 (3단계 폼) |
| `/auth/login` | 로그인 |
| `/auth/mypage` | 마이페이지 |
| `/cases/gallery` | Before/After 갤러리 (R2 연동) |
| `/cases/:id` | 케이스 상세 (로그인 필요) |
| `/treatments/*` | 진료 안내 (24개 카테고리) |
| `/doctors/*` | 의료진 소개 (15인 원장) |
| `/guide/` | **종합 가이드 허브** (Phase 2 SEO) |
| `/guide/implant` | 임플란트 완전 가이드 (16섹션·35+FAQ·학술 근거) |
| `/guide/invisalign` | 인비절라인 완전 가이드 (19섹션·35+FAQ·7패키지 비교) |
| `/guide/laminate` | 라미네이트 완전 가이드 (16섹션·30+FAQ·글로우네이트 퍼널) |
| `/encyclopedia/` | 치과 백과사전 (500개 용어) |
| `/pricing` | 비용 안내 |
| `/reservation` | 예약/상담 |
| `/directions` | 오시는 길 |
| `/admin/` | 관리자 패널 (비밀번호 인증) |

### API Endpoints
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 로그인 상태 확인 |
| GET | `/api/auth/google` | Google OAuth 로그인 시작 |
| GET | `/api/auth/google/callback` | Google OAuth 콜백 |
| POST | `/api/auth/forgot-password` | 비밀번호 재설정 링크 발송 |
| POST | `/api/auth/reset-password` | 토큰 검증 + 새 비밀번호 설정 |
| POST | `/api/reservation` | 예약 접수 (이메일 알림) |
| GET | `/api/cases` | 공개 케이스 목록 |
| GET | `/api/cases/:id` | 케이스 상세 (인증 필요) |
| POST | `/api/admin/upload` | 이미지 업로드 (관리자) |
| GET | `/api/images/*` | 이미지 조회 |
| GET | `/api/google-reviews` | 구글 리뷰 프록시 |
| POST | `/api/chat` | AI 챗봇 |
| GET | `/api/health` | 헬스체크 |

### Data Architecture
- **D1 Database**: 회원(`members`), 게임 점수(chbti/flight/run), 페이지뷰, 채용 지원, rate limits (migrations 0001~0008)
- **R2 Storage**: 케이스 데이터 (`data/cases.json`), 이미지 파일, 구(舊) 회원 JSON 백업
- **Static HTML**: 빌드 시 dist/ 복사
- **Structured Data**: JSON-LD (BreadcrumbList, FAQPage, MedicalProcedure, DefinedTerm, Dentist)

### Tech Stack
- Hono v4 + TypeScript (백엔드)
- Vite v6 (빌드)
- Wrangler v4 (개발 서버 + 배포)
- Cloudflare D1 (회원·게임·통계) + R2 (케이스·이미지)
- Resend (트랜잭션 이메일: 예약 알림·비밀번호 재설정)
- Pretendard (폰트)
- FontAwesome 6.4 (아이콘)
- site-v5.css (통합 디자인 시스템)

## Development

```bash
# Install
npm install

# Build
npm run build

# Dev server (sandbox)
pm2 start ecosystem.config.cjs

# Test
curl http://localhost:3000
curl http://localhost:3000/api/health
```

## Deployment
- **Platform**: Cloudflare Pages
- **Project Name**: seoul-bd-dental
- **Status**: Active
- **Last Updated**: 2026-07-02
- **필수 Secrets**: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `OPENAI_API_KEY`, `RESEND_API_KEY`(비밀번호 찾기·예약알림), `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`(소셜로그인)

## User Flow
1. 갤러리에서 케이스 카드 클릭
2. 미로그인 → 잠금 페이지 (블러 미리보기 + "로그인하고 보기" CTA)
3. 로그인 (또는 회원가입) → `?redirect=/cases/케이스ID`
4. 로그인 후 자동 리다이렉트 → 케이스 상세 (Before/After 사진 + 예약 CTA)

## Remaining Work
- [ ] 실제 환자 Before/After 사진 업로드
- [ ] Lighthouse 성능/접근성 점수 측정
- [ ] 일반 치료 페이지 재설계 (cavity, crown 등)
- [ ] 분석 태그 GTM 통합 (GA4/Pixel 중복 로드 정리)
- [ ] `src/index.tsx` 모듈 분리 (auth/admin/api/pages — 현재 7,000줄 단일 파일)
- [x] ~~비밀번호 찾기 기능~~ (v5.4 완료)
- [x] ~~소셜 로그인 (Google)~~ (완료)
- [x] ~~예약 시스템 연동~~ (완료 — /api/reservation + 이메일 알림)

## v5.4 (2026-07-02)
### 회원 시스템 D1 이관 + 비밀번호 찾기
- 회원 저장소 R2 JSON → D1 `members` 테이블 (migrations/0008_members.sql)
  - R2 JSON은 동시 가입 시 race condition(마지막 쓰기 승리)으로 데이터 유실 위험 → UNIQUE 제약 + 트랜잭션으로 해소
  - 기존 회원 lazy migration (최초 요청 시 자동 1회, R2 플래그로 중복 방지)
  - 로그인 rate limit 추가 (IP당 15분 20회)
- 비밀번호 찾기 전체 플로우 (`/auth/reset-password`)
  - 이메일 입력 → Resend로 재설정 링크 발송 → 새 비밀번호 설정 → 로그인 복귀
  - 보안: 토큰 SHA-256 해시 저장·1시간 유효·1회용, 계정 존재 유출 방지, rate limit(15분 5회)
  - login.html "비밀번호 찾기" alert → 실제 페이지 링크로 교체
### 이미지 최적화
- OG 이미지 14장: 확장자만 jpg인 PNG(장당 1.2~1.5MB) → 진짜 JPEG 1200×630 (합계 18.4MB → 0.9MB, −95%)
  - 카카오톡/페이스북 공유 썬네일 크롤링 안정화
- floor-illustration 2종 PNG8 변환(−70%), 사업자등록증 895KB→133KB, 호두과자 webp 재압축 962KB→109KB

## v5.3 (2026-06-11)
### Hero 벡터 리디자인
- Spline 3D iframe 제거 → 인라인 SVG 치아 일러스트 (~6KB, 외부 의존 0)
  - 웃는 어금니 + 14인 협진 궤도 도트(40s 공전) + 체크 배지 + "환자분들의 좋은 경험에 집중합니다" 라벨
  - 치아 외곽 드로잉 → 도트 순차 등장 → 배지 팝 시퀀스, prefers-reduced-motion 대응
- 헤드라인 "안하셔도 됩니다"에 손글씨 밑줄 SVG 애니메이션 (2겹 스트로크, 순수 CSS)

### 보안 강화
- 관리자 비밀번호/세션 시크릿 하드코딩 fallback 전면 제거 (fail-closed)
  - 프로덕션: wrangler pages secret (ADMIN_PASSWORD, ADMIN_SESSION_SECRET)
  - 로컬: .dev.vars
- Rate limiting을 in-memory Map → D1 기반으로 교체 (Workers isolate 간 공유 카운터)
  - 챗봇: 1분 10건 + 1시간 60건 / 채용 지원: 5분 3건
  - migrations/0007_rate_limits.sql

### 빌드/정리
- post-build.cjs: 수동 목록 → 자동 탐색 방식 (신규 파일 배포 누락 방지)
- 미사용 의존성 제거 (playwright, docx), 중복 gallery JS/백업 JSON 정리
- wrangler.jsonc name을 seoul-bd-dental로 통일

## v5.5 (2026-07-02)
- **마이페이지 비밀번호 변경**: `/api/auth/change-password` (현재 비밀번호 검증 + 레이트리밋 10회/15분, Google 전용 계정은 최초 설정 허용) + mypage 인라인 폼
- **LCP 개선 — Amplitude 지연 로더**: 동기 SDK 2종(~80KB 렌더 블로킹) → `/static/bd-tag-loader.js` (requestIdleCallback + 인터랙션 트리거). 215개 HTML + SSR TRACKING_HEAD + 빌더 스크립트 6종 일괄 전환, `cdn.amplitude.com` 동기 로드 0건
- **모듈 분리 1단계**: GSC 대시보드 → `src/routes/gsc-report-dash.ts`, 공통 타입 → `src/types.ts`, 죽은 중복 GSC 블록 362줄 제거 (index.tsx 7,030→6,357줄, 워커 번들 1,983→1,949KB)
- 남은 과제: lib(layout/auth/security) 분리, encyclopedia.json(1.7MB) 런타임 로드 전환

## v5.6 (2026-07-02) — 전체 점검·디버그 및 보안 강화
### 🔴 치명 버그 복구: Amplitude 전환추적 전체 사망
- v5.5 지연 로더 도입 후 analytics.js의 가드 없는 `amplitude.track()` 직접 호출이 ReferenceError로 스크립트 전체를 죽여 **전환 이벤트 31종이 전 페이지에서 유실**되던 문제 복구
- `ampTrack()` 큐잉 래퍼 (SDK 도착 전 이벤트 큐 적재 → 도착 시 플러시), `deferredIdentify()` 폴링, 로더 미탑재 페이지 폴백 주입
- 캐시버스팅 `v=20260702v8` 일괄 갱신 (207개 HTML)

### 잠복 버그 수정
- **어드민 대시보드 회원수 0 표시**: 폐기된 `users` 테이블 조회 → `members`로 교체 (v5.4 이관 누락분)
- **area 27페이지**: 존재하지 않는 `../js/gnb.js` 참조(404+MIME 차단) → `gnb-v2.js` 교체, 상대경로→절대경로 통일, 구버전 CSS 캐시버스터 통일
- **임플란트 12페이지**: 죽은 `../js/site-v5.js` 참조 제거

### 보안 강화
- **`/gsc-report` 어드민 인증 보호**: 대시보드 + 데이터 전부 어드민 세션 뒤로 이동 (미인증 → `/admin/login` 302)
- 공개돼 있던 `/static/gsc-data.json` 제거 → 워커 번들 임베드, 인증 후 `/gsc-report/data` API로만 제공 (SEO 전략 데이터 경쟁사 노출 차단)
- CDN 캐시(s-maxage 7일) 잔존분은 플레이스홀더 배포로 즉시 무효화

### 인프라/품질
- TypeScript 검사 체계 복구: typescript 설치 + @cloudflare/workers-types 등록 → tsc 에러 81→0
- compatibility_date 2025-12-20→2025-12-17 정정 (런타임 fallback 경고 제거)
- wrangler 4.106 업그레이드는 Node 22 요구로 보류 (샌드박스 Node 20)
