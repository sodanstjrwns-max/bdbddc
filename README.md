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

## Current Version: v5.2

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
- **로그인** (`/auth/login`): 이메일+비밀번호, `?redirect=` 파라미터 지원
- **마이페이지** (`/auth/mypage`): 사용자 정보 표시, 로그아웃
- **세션 관리**: HMAC 기반 쿠키 세션 (httpOnly, 30일 유효), PBKDF2 비밀번호 해싱
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
| GET | `/api/cases` | 공개 케이스 목록 |
| GET | `/api/cases/:id` | 케이스 상세 (인증 필요) |
| POST | `/api/admin/upload` | 이미지 업로드 (관리자) |
| GET | `/api/images/*` | 이미지 조회 |
| GET | `/api/google-reviews` | 구글 리뷰 프록시 |
| POST | `/api/chat` | AI 챗봇 |
| GET | `/api/health` | 헬스체크 |

### Data Architecture
- **R2 Storage**: 케이스 데이터 (`data/cases.json`), 회원 데이터 (`data/members.json`), 이미지 파일
- **Static HTML**: 빌드 시 dist/ 복사
- **Structured Data**: JSON-LD (BreadcrumbList, FAQPage, MedicalProcedure, DefinedTerm, Dentist)

### Tech Stack
- Hono v4 + TypeScript (백엔드)
- Vite v6 (빌드)
- Wrangler v4 (개발 서버 + 배포)
- Cloudflare R2 (스토리지)
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
- **Last Updated**: 2026-03-28

## User Flow
1. 갤러리에서 케이스 카드 클릭
2. 미로그인 → 잠금 페이지 (블러 미리보기 + "로그인하고 보기" CTA)
3. 로그인 (또는 회원가입) → `?redirect=/cases/케이스ID`
4. 로그인 후 자동 리다이렉트 → 케이스 상세 (Before/After 사진 + 예약 CTA)

## Remaining Work
- [ ] 실제 환자 Before/After 사진 업로드
- [ ] 비밀번호 찾기 기능
- [ ] 소셜 로그인 (Google)
- [ ] 예약 시스템 연동
- [ ] Lighthouse 성능/접근성 점수 측정
- [ ] 일반 치료 페이지 재설계 (cavity, crown 등)
