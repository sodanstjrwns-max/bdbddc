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

## Current Version: v5.12

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
| POST | `/api/cavity-defense/score` | 충치 디펜스 점수 등록 (닉네임+점수, 상위% 반환) |
| GET | `/api/cavity-defense/leaderboard` | 충치 디펜스 주간 랭킹 TOP 100 (월요일 리셋) |

### Data Architecture
- **D1 Database**: 회원(`members`), 게임 점수(chbti/flight/run/cavity_defense), 페이지뷰, 채용 지원, rate limits (migrations 0001~0009)

### 게임존 (플레이)
| 게임 | URL | 설명 |
|---|---|---|
| **충치 디펜스** | `/game/cavity-defense` | PixiJS v8 타워 디펜스. 타워 5종×3단계, 적 7종+보스 3종, 스테이지 3종(20웨이브), 궁극기 '양치 타임', D1 주간 랭킹, 게임오버→검진 예약 깔때기. 소스: `js/cavity-defense/` (data/art/game/app 4모듈) |
| 치석 플라이트 | `/flight` | 드래곤 플라이트 스타일 |
| TOOTH RUN | `/run` | 무한 러너 |
| 치BTI | `/checkup` | 16유형 성격테스트 |
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
- **Last Updated**: 2026-07-02 (v5.9)
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

## v5.7 (2026-07-02) — 성능 리팩터링: 워커 번들 82% 감량 + 모듈 분리 2단계

### 1) encyclopedia.json 런타임 로드 전환 (워커 번들 감량)
- **문제**: 1.7MB `encyclopedia.json`을 정적 import로 워커 번들에 임베드 → `_worker.js` 1,982.56 kB
- **해결**: `getEncItems()` — ASSETS 바인딩 fetch(내부 정적 자산, 네트워크 비용 없음) + 일반 fetch 폴백 + 모듈 캐시(isolate당 1회, single-flight 중복 방지)
- **결과**: `_worker.js` **1,982.56 kB → 352.13 kB (-82%)**, 콜드스타트·배포 속도 개선
- `/encyclopedia/:term`, `/encyclopedia/category/:name` 라우트 async 전환, 로드 실패 시 백과 메인 302 (fail-safe)

### 2) index.tsx 모듈 분리 2단계 (6,357줄 → 6,206줄)
- `src/lib/layout.ts` — TRACKING_HEAD/BODY (GTM + Amplitude 지연로더 + Meta Pixel)
- `src/lib/security.ts` — 관리자 HMAC 세션 (createSessionToken/verifySessionToken/getSessionSecret) + D1 Rate Limiting (isRateLimitedD1)
- `src/lib/auth.ts` — 회원 인증 헬퍼 (PBKDF2 hashPassword, 사이트 세션, D1 회원 CRUD, R2→D1 lazy migration, sha256Hex)

### 3) wrangler 3.78 → 4.106 업그레이드
- Node 22.14.0 확보 (`/usr/local/bin`, 샌드박스 기본 v20과 병행)
- `ecosystem.config.cjs` PM2 env에 PATH 주입으로 Node 22 우선 사용

### 회귀 테스트 (로컬 + 프로덕션 bdbddc.com 전부 통과)
- 백과 용어/동의어/카테고리 SSR 200, 없는 용어 302
- /admin 가드 302, /gsc-report 가드 302, /api/health 200
- 회원 로그인 API 401(미존재 계정), 케이스 갤러리 200, sitemap 200

## v5.12 (2026-07-03) — OG 이미지 14장 네이버 세이프존 재제작

### 문제 진단
- 네이버 통합검색 OG 썸네일 = 중앙 기준 1:1 크롭 → 기존 서브페이지 OG 14장(좌아이콘+우텍스트 가로배치)은 텍스트 절단 ("심미치", "임플란" 등) — PIL 크롭 시뮬레이션으로 확인
- 설계 규칙: 캔버스 1200×630 유지 + 핵심 요소(로고·병원명·카피)는 중앙 630×630 세이프존 안, 좌우 285px는 배경 확장 영역

### 변경 사항
- images/og/*.jpg 14장 전체 교체 (nano-banana-pro 재생성 → 1200×630 정규화, 전장 630×630 크롭 검증 통과): aesthetic, area-seo, blog, conservative, directions, doctors, encyclopedia(838개 용어로 갱신), faq, implant, orthodontics, pediatric, pricing, reservation, sedation
- 카톡/네이버 URL 단위 OG 캐시 대응: HTML 내 images/og/ 참조 전체에 `?v=sq1` 캐시버스팅 일괄 적용 (176개 파일)
- 버그 수정: blueprint.html og:image 리터럴 플레이스홀더 `{1200x630 이미지}` → 실제 URL(og-image-v2.jpg) / guide/{implant,invisalign,laminate}.html의 존재하지 않는 *-guide.jpg(404) → 실재 파일로 교체
- 메인 og-image-v2.jpg는 이미 세이프존 준수 확인되어 유지

### 검증
- 프로덕션 5장 샘플 curl 200 + 신규 파일 사이즈 일치, og:image 메타태그 ?v=sq1 반영 확인
- 배포: d789f6d5.seoul-bd-dental.pages.dev

### 추가 (2026-07-03) — 구글 검색 파비콘 미갱신 근본 해결
- 원인: SVG 파비콘만 제공 (구글봇은 ICO/PNG 선호, SVG-only는 갱신 무시 잦음) + /favicon.ico가 SVG로 301 리디렉트 + 캐시버스팅 부재
- 조치: cairosvg로 SVG→PNG 7종(16~512) 생성, 멀티사이즈 favicon.ico(16+32+48) 루트 배치, apple-touch-icon.png 실파일화
- HTML 222개 파일: SVG-only 링크 → ICO+PNG96+SVG 3종 링크(?v=2), manifest.json에 PNG 192/512 아이콘 우선 추가
- src/index.tsx: favicon.ico→SVG 301 리디렉트 제거 (실파일 정적 서빙), post-build FILE_ALLOW에 ico/png 확장자 추가, _routes.json exclude에 /favicon.ico·/apple-touch-icon.png
- 배포: babb46a8.seoul-bd-dental.pages.dev — 프로덕션 전 자산 200 확인 (구 /favicon.ico 301은 엣지캐시 max-age 4h 후 자동 소멸)
- 후속: GSC에서 홈(https://bdbddc.com/) 색인 재요청 권장 — 구글 파비콘 갱신은 재크롤 후 수일~수주 소요

### 추가 (2026-07-03) — 메인 og-image-v2.jpg도 재생성
- 기존 좌측 정렬 텍스트를 중앙 630×630 세이프존 안으로 재배치 (배경: 병원 로비 인테리어 유지)
- 630×630 크롭 시뮬레이션 통과 (타이틀·서브카피·하단 정보줄 전부 생존)
- HTML/tsx 참조 101곳 `?v=sq1` 캐시버스팅, src/index.tsx 폴백 URL 포함
- 배포: 1ebed1fb.seoul-bd-dental.pages.dev, 프로덕션 검증 완료 (200, 151KB)

## v5.11 (2026-07-02) — 라미네이트 후회 CTR 구출

### GSC 근거
- "라미네이트 후회" 노출 565 / 클릭 9 = CTR 1.6% (시리즈 벤치마크 "치아미백 후회" 15.7% 대비 1/10)
- 원인 진단: 경고형 타이틀("비가역적 치료, 시작 전 필독")이 검색자 회피 유발 — 벤치마크는 공감·안내형

### 변경 사항 (guide/regret/laminate.html)
- title/og:title/twitter:title: "— 비가역적 치료, 시작 전 필독" → "— 미리 알면 피할 수 있습니다" (공감·해결형)
- meta/og/twitter description: 후회 유형 5가지 나열형으로 재작성 + "이미 시술 후 불편할 때 해결법" 커버리지 추가
- hero lead 문단 톤 조정 (겁주기 → 차분한 안내), Article 스키마 headline/description 동기화, dateModified 2026-07-02
- sitemap-main.xml lastmod 갱신, IndexNow 핑 완료 (Yandex 202, Naver 200)

## v5.10 (2026-07-02) — AEO 가격 2차: llms.txt·내부링크·심층 가이드

### 1) llms.txt Pricing 섹션 신설
- 시술별 실가격(임플란트 80~160만원 등) KRW 병기 + 가격 앵커 URL 12개 — AI가 크롤링 없이 가격 인용 가능

### 2) 내부 링크 그물망
- faq.html: 가격 Q&A 2개 신규(임플란트·교정 실가격), 기존 답변 4곳 /pricing 앵커 링크, FAQPage 스키마 18→20
- index.html: #home-pricing-entry 섹션 — 가격 칩 8개(/pricing 앵커 직행) + 수가표 CTA

### 3) 가격 심층 가이드 2종 (질문형 제목·점잖은 톤)
- **/pricing/implant-guide** — "임플란트 80만원과 160만원, 뭐가 다른가요?": 픽스처 3종(CA/SOI/BLX) 비교표, 추가비용 해부, "저렴한 걸 골라도 괜찮지 않나요?" Q&A, 65세 보험 실계산, FAQPage 5문항+Article 스키마
- **/pricing/ortho-guide** — "교정 비용 300 vs 700만원 차이": 인비절라인 4종+브라켓 2종 가격표, 부분교정 판별 기준, 계약 전 확인 항목
- 라우트 serveStatic 2건 + /pricing/ 301, sitemap-main 2건, IndexNow 목록, pricing.html↔가이드 상호링크

### 검증 (로컬+프로덕션)
- 가이드 2종 200·타이틀 확인, JSON-LD 전부 파싱 통과, /pricing/없는경로 404 회귀 유지

## v5.9 (2026-07-02) — AEO 가격 검색어 정합 대개편

### 배경
Patient Signal AEO 진단: 비브랜드 가격 질문("천안 임플란트 가격 얼마야?")에서 AI 답변 언급률 5%, Gemini 격차 -48.3%p. 색인 문제 아님(site: 1위, AI 크롤러 전부 200) — 어휘 불일치·항목 누락·가격 스키마 부재가 원인으로 진단

### 1) P0-A. /pricing 검색어 정합 리라이트
- title/H1/meta/og → "천안 치과 비급여 수가표·가격 안내" (기존 '비용' 단일 어휘 → 가격/수가표/얼마 증량)
- meta description·ai-summary에 실제 가격 명시 (임플란트 80~160만원, 인비절라인 300~700만원 등)
- 심평원 표준 항목명 병기: "치과임플란트(1치당) — 오스템 SOI 100만원 (1,000,000원)" 형식, 원화 병기 `.price-won` 스타일
- "스켈링" 오타 → "비보험 스케일링 (치석제거)" + 보험 적용가(연 1회 약 1.5~2만원) 안내 추가

### 2) P0-C. 시술별 가격 앵커 Q&A + 스키마 확장
- `#price-faq` 섹션 신설: `#implant-price` `#ortho-price` `#scaling-price` 등 13개 앵커, 질문형 H3("천안 임플란트 가격은 얼마인가요?") + 200~400자 답변(가격 범위 + 달라지는 조건)
- FAQPage 스키마 3→16개 질문 (전멸 쿼리 문구 그대로 사용)
- Dentist 스키마(`#dentist-pricing`) 추가: priceRange + Offer 12건 (MedicalProcedure + PriceSpecification, KRW)

### 3) P1. treatments 16개 페이지 가격 섹션 이식
- `scripts/insert-price-sections.py` (마커 기반 멱등 실행) — cta-section 직전에 시술별 가격표 + /pricing 링크 + 예약 CTA 삽입
- 대상: orthodontics, invisalign, gum, scaling, wisdom-tooth, resin, cavity, crown, denture, whitening, glownate, periodontitis, implant, root-canal, bridge, pediatric
- 효과: '만원' 언급 0회였던 orthodontics/gum 등에 가격 매칭 콘텐츠 확보 → "천안 교정 비용" 류 질문에 매칭 URL 생성

### 검증 (로컬 + 프로덕션 bdbddc.com 통과)
- /pricing title·price-qna 18블록·FAQ Question 16개 확인, treatments 4종 treatment-price 섹션 렌더 확인
- 회귀: GET 없는경로 404, HEAD /pricing 200 (v5.8.1 핫픽스 유지)

## v5.8 (2026-07-02) — GSC 색인 개선

### 1) strictStatic — soft-404 (빈 200) 제거
- **문제**: `hono/cloudflare-pages`의 `serveStatic()`이 ASSETS.fetch 결과를 그대로 반환 → 존재하지 않는 경로(`/treatments/잇몸치료` 등)가 0바이트 200으로 응답. GSC "크롤링됨 - 색인 안 됨" 225건의 핵심 원인
- **해결**: `strictStatic()` 미들웨어 — 본문 있는 2xx만 반환, 3xx/304 통과, 빈 200/404는 next()로 넘겨 최종 catch-all이 진짜 404.html(status 404) 반환
- 적용 경로: `/admin/*`, `/data/*`, `/treatments/*`, `/doctors/*`(확장자 있는 정적)

### 2) 존재하지 않는 treatments 슬러그 → 유사 진료 301 (23개)
- GSC 미색인 목록에서 확인된 슬러그를 의미가 통하는 실제 페이지로 301 통합
- 예: `cost`→`/pricing`, `bone-graft`→`/treatments/implant-advanced`, `잇몸치료`→`/treatments/gum`, `dentures`→`denture`

### 3) 레거시 리다이렉트 워커 이식 (GSC 404 165건 대응)
- `dist/_redirects` 파일이 advanced mode(_worker.js)에서 동작하지 않음 확인 → 워커 라우트로 이식
- `/about`·`/intro`→`/mission`, `/contact`·`/consult`→`/reservation`, `/board`·`/news`·`/event`→`/notice/`, `/gallery`→`/cases/gallery`, `/location`·`/map`→`/directions`, `/index.php` 등 40여 규칙

### v5.8.1 핫픽스 — strictStatic HEAD 요청 오폭
- **문제**: HEAD 응답은 본문이 원래 0바이트 → strictStatic이 soft-404로 오판, 모든 strictStatic 경로가 HEAD에 404 응답 (크롤러 HEAD 프로빙 시 정상 페이지가 404로 보임)
- **해결**: HEAD는 GET으로 자산 존재를 검증 후 본문 없이(status/headers만) 반환
- 검증: `HEAD /treatments/implant` 200, `GET /treatments/nonexistent-xyz` 404(24KB 404.html), 301 리다이렉트 전부 정상
