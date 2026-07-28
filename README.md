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
- **위젯 갤러리 (v5.35 신설 / v5.38 확장)**: https://bdbddc.com/widgets — 치과 인터랙티브 위젯 21종 무료 임베드 허브 (프리셋 변형 5종 포함 라우트 26종). 개별 위젯은 `/widgets/:slug` (tooth-numbering, inlay-compare, crack-check, implant-anatomy, root-canal-steps, extraction-timeline, teeth-timeline, ortho-compare, whitening-compare, scaling-insurance, tooth-explorer, extrusion-type, tmj-sound, insurance-check, midline-check, tooth-surface, incisor-ratio, tongue-triage, opposing-chain, pulp-triage, powerchain-care)

- **과잉진료 판별 가이드 (v5.40 신설 → v5.41 통합)**: https://bdbddc.com/blog/dental-over-treatment-guide — 「치과 과잉진료」 검색 의도 대응. 판단 기준 7가지 · 진료비 세부내역서 읽는 법 · 2차 소견(세컨드 오피니언) 3단계 절차 · 자가 체크 10문항 위젯 · 공적 문의 창구 5곳 · FAQ 10개. **v5.41에서 `/guide/overtreatment`(v5.40 신설)는 동일 인텐트의 기존 블로그 글과 자기잠식을 일으켜 폐지되고 이 URL로 301 통합됨** — 심화 콘텐츠는 `src/routes/blog-enrich.ts`로 이식되어 프록시 HTML에 SSR 주입

- **영문 치과 사전 (v5.39 신설)**: https://bdbddc.com/en/dictionary — 영어권 환자용 증상·질환·해부 용어 30종 (개별 URL `/en/dictionary/<slug>`, 한국어 백과사전과 양방향 hreflang, 용어당 FAQ 6개). 분류: Gum & Periodontal 5 / Tooth Decay & Pulp 5 / Cracks & Trauma 2 / Wisdom & Eruption 4 / Bite & Jaw 4 / Mouth & Tongue 6 / Tooth Anatomy 4

## Current Version: v5.42

### Completed Features

#### 외국 SEO/AEO 슈퍼 업그레이드 (v5.16) — 즐답 박스 + 스키마 강화 + 타겟 세분화
- **AEO 즐답 박스 (Quick Answer)**: 32페이지 전체 히어로 직후 `#quick-answer` 섹션 — 질문형 H2 + 첫 문장 즐답 (가격·접근·NHIS 핵심 팩트 굵은글씨 하이라이트). content_extra.py의 QA 딕터러리(32키)로 관리, generate.py merge_extra()가 자동 주입
- **스키마 강화 (페이지당 JSON-LD 3~4블록, 총 124블록 0에러)**:
  - Dentist → `["Dentist","MedicalClinic"]` 복합 타입 + @id + foundingDate + paymentAccepted(WeChat Pay/Alipay/UnionPay 포함) + sameAs(인스타·유튜브·네이버블로그) + medicalSpecialty
  - 신규 WebPage 스키마: `SpeakableSpecification`(cssSelector: #quick-answer, 히어로 h1) + inLanguage + dateModified — 음성검색·AI 검색엔진 대응
- **타겟 세분화 (사용자 지시 반영)**: 관광 콘텐츠는 A그룹(JP/CN 해외거주 의료관광)만 — travel-guide 2페이지 확인 완료. B그룹(EN/VI/TH/RU 국내거주)은 로컬·실용 콘텐츠만
- **JP/CN travel-guide 의료관광 확장** (A그룹 전용, 각 +3섹션):
  - 임플란트 2박3일×2회 모델플랜 스텝 5단계 (정밀검사→수술→귀국→골결합대기→보철장착)
  - 항공·KTX 완전 액세스 가이드 (일본 LCC 2~4만엔 / 중국 직항 1,500~3,500위안, 인천→천안아산 KTX 약 14,000₩)
  - 숙박 가이드 (불당동 도보권 비즈니스호텔 5~9만₩/박, 온양온천 요양체류 옵션)
- **B그룹 로컬 강화**: en/directions 공항 카드를 "Just Arrived in Korea? (PCS / New Assignment)" 프레임으로 재구성 (관광→신규 부임자 정착 맥락). QA 박스에 Camp Humphreys/KCN Asan/นิคมอาซาน/промзона Асан 로컬 키워드 내장
- **llms.txt 갱신**: 국제 섹션 32페이지 전체 인벤토리(구 .html 경로 정리) + "Quick Answers for International Patients" 팩트 블록 추가 (가격·NHIS·접근·의료관광 플랜) + 치과의사 수 15인으로 수정
- **CSS**: `.iv2-answer` 골드 그라데이션 즐답 박스 스타일 + 캠시버스트 `?v=20260711`
- **검증**: 35 URL 전부 200 OK, JSON-LD 124블록 0에러, #quick-answer 32/32 렌더링, Playwright 콘솔 에러 0, jp/·cn/ Glownate 랜딩 무변경

#### 다국어 페이지 콘텐츠 볼륨 확장 (v5.15) — 32페이지 전체 추가 섹션 삽입
- **content_extra.py 시스템**: `scripts/intl_gen/content_extra.py` — canonical path 키(32개) → 추가 섹션 리스트. generate.py가 렌더링 시 각 페이지의 CTA 직전에 자동 삽입 (원본 content_XX.py는 무수정, 순수 additive 구조)
- **추가된 콘텐츠 유형** (언어별 현지화):
  - 층별 안내 카드 6종 (1F 인비절라인 교정센터 / 2F 디지털기공·위생센터 / 3F BDX검진·소아센터, 소아전문의 3인 / 4F 임플란트센터 6수술실+2회복실 에어샤워 / 5F 종합진료센터 / 감염관리)
  - 픽스처 비교표 (Straumann BLX vs Osstem SOI vs CA — JP은 엔화, CN은 위안화 환산 포함)
  - 임플란트 고급 옵션 카드 6종 (내비게이션·즉시부하·전악수복·재수술·수면·휴일수술) + 사후관리 스텝
  - 인비절라인 vs 브라켓 비교표 + 성공 수칙 4계명
  - 가격 근거 카드 (원내 기공소·규모의 경제·무중개) + 절약 팁 FAQ (NHIS 건강보험 활용 등)
  - 도착 후 안내 스텝 + 택시 랜드마크 / 온천·독립기념관 등 관광 카드 (JP/CN travel-guide)
  - 가족 진료 카드 (소아·수면·사랑니·시니어 틀니)
- **볼륨 증가**: 32페이지 전부 +1.1KB~+6.4KB (평균 +3.3KB, 예: th/implant 20.6→27.1KB, jp/pricing 13.3→18.0KB)
- **검증**: 34개 URL 전체 200 OK, JSON-LD 32파일 0 에러, Playwright 콘솔 에러 0, jp/·cn/ 프리미엄 랜딩 무변경 확인

#### 다국어 페이지 슈퍼 업그레이드 (v5.14) — 6개 언어 32페이지 전면 재구축
- **Python 페이지 생성 시스템**: `scripts/intl_gen/` — engine.py(렌더러) + content_XX.py(언어별 데이터) + generate.py(러너) + gen_sitemap.py(사이트맵 자동생성). 가격/시간/전화번호가 모든 언어에서 단일 소스로 일관성 보장
- **신규 디자인 시스템**: `css/intl-v2.css` (iv2-* 클래스) — 스티키 내비, 히어로+통계, 가격표(그룹/배지/하이라이트), 스텝, FAQ(details), CTA 채널, 비교표, 배너
- **페이지 구성 (총 32개 생성)**:
  - 🇺🇸 EN 7개: index/implant/invisalign/laminate 리라이트 + pricing/directions/reservation 신규 (Camp Humphreys·주한미군 타겟)
  - 🇯🇵 JP 5개: dental/implant/invisalign 리라이트 + pricing/travel-guide 신규 (의료관광, 엔화 환산, 2박3일 코스) — jp/index.html(Glownate 랜딩) 유지
  - 🇨🇳 CN 5개: dental/implant/invisalign 리라이트 + pricing/travel-guide 신규 (재한 중국인+관광) — cn/index.html 유지
  - 🇻🇳 VI 7개: index/implant/invisalign/laminate 리라이트 + pricing/directions/faq 신규 (재한 베트남 근로자·유학생, NHIS 안내)
  - 🇹🇭 TH 4개: index 리라이트 + implant/pricing/directions 신규 (아산·탕정 공단 근로자 타겟)
  - 🇷🇺 RU 4개: index 리라이트 + implant/pricing/directions 신규 (러시아어권·CIS 근로자 타겟)
- **SEO**: 페이지별 canonical + hreflang 상호참조, JSON-LD (Dentist/FAQPage/BreadcrumbList), geo 메타, sitemap-intl.xml 자동 재생성 (54 URLs, hreflang과 100% 일치)
- **가격 정합성**: 전 언어 동일 수가 — 임플란트 80만~160만, 인비절라인 300만~700만, 글로우네이트 60만/80만 등 (pricing.html 기준)

#### 다국어 시스템 개편 (v5.13) — Weglot 제거 + 자체 언어 전환 버튼
- **Weglot 완전 제거**: 15개 한국어 페이지에서 위글롯 스크립트 삭제 (JS 오버레이 기계번역 → SEO 색인 불가 문제 해소, 구독료 절감, 페이지 속도 개선)
- **자체 언어 전환 버튼** (`/js/lang-switcher.js`): 좌하단 플로팅 버튼 (우하단 챗봇/퀵액션과 충돌 방지)
  - 7개 언어 지원: 한국어/English/日本語/中文/Tiếng Việt/ไทย/Русский
  - 페이지 `<head>`의 hreflang 태그를 읽어 **같은 페이지의 번역본으로 직접 이동**, 번역본이 없으면 언어별 허브(`/en/`, `/jp/dental` 등)로 폴백
  - 적용 범위: 한국어 주요 페이지 16개 + 외국어 페이지 30개 (en 8, jp 8, cn 8, vi 4, th 1, ru 1)
- **SEO 구조 유지**: 언어별 고유 URL + hreflang 상호 연결 + `sitemap-intl.xml` — 구글이 각 언어 페이지를 개별 색인

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
- **Last Updated**: 2026-07-28 (v5.42)
- **v5.42 백과사전 최빈약 34항목 본문 심화 (127,886노출 / CTR 0.79% 구간 정면 타격)**: v5.41에서 배너(`ENC_GUIDE_NUDGE`)로 트래픽을 흘려보내는 처치만 했을 뿐 **본문 자체는 손대지 않았던** 구간을 채움. 진단 근거 — 백과사전 838항목이 사이트 최대 노출원(127,886)이면서 CTR 0.79%였고, 그 원인은 순위가 아니라 **"검색 결과를 눌러 들어와도 정의 한 줄뿐이라 바로 되돌아 나가는" 얇은 본문**. ①**빈약 순으로 34항목 선별 후 심화 원고 작성** — `<600자` 구간 7개를 포함한 최하위군. 전 항목 **의료광고법 안전 기준**으로 집필(최상급·1위·유일 배제, 효과 보장 표현 배제, 타 기관 비방 배제, 금액은 기존 공개 범위 내에서만 언급하고 "정확한 금액은 진단 후 안내"로 위임, 서술은 "~로 알려져 있습니다"·"~인 경우가 많습니다" 헤지 표현) ②**🚨 기존 적용 스크립트가 데이터 롤백 지뢰임을 사전 발견** — `scripts/apply-encyclopedia-updates.cjs`는 `sorted(glob(batch*.json))`으로 **모든 배치를 문자열 정렬 순 재적용**하는 구조라 `batch5`가 `batch46`보다 뒤에 정렬됨. 실행 시 **374항목이 구버전으로 퇴행**(법랑질 1,631자 → 828자, 총 1,535,595자 → 1,064,915자, -470,680자). 사용 거부 후 해당 스크립트를 `--i-know-this-overwrites-everything` 플래그 뒤로 하드 가드하고 헤더에 회귀 실측치를 문서화 ③**적용 도구를 `scripts/apply-enc-batch.cjs`로 일원화** — 배치명 명시 방식, 자동 백업(`public/data/.enc-backup-<ts>.json`), **detail 축소 시 거부**, 미존재 용어 무적용 보고, `--dry-run` 지원. `synonyms`는 Set 합집합 병합, `link`/`guide`는 키가 있을 때만 설정 ④**정본 파일 판별** — `data/encyclopedia.json`과 `public/data/encyclopedia.json`이 md5·크기가 다른 별개 사본이며, 런타임(`src/index.tsx` L4037 `new URL('/data/encyclopedia.json')`)과 전 스크립트가 읽는 **정본은 `public/data/` 쪽**. 다른 쪽을 고쳤다면 무음 실패였음 ⑤결과 — `batch47~50` 총 34항목 적용. **`<600자` 항목 7개 → 0개**, 총 본문 1,571,908자, **중앙값 1,804자**, 분포 `600-999: 12 / 1000-1499: 129 / 1500+: 697`
- **v5.42 백과사전 죽은 내부 링크 29건 수리 (`scripts/fix-enc-dead-links.cjs` 신설)**: 심화 작업 중 부수적으로 발견한 별건 버그. 백과사전 항목의 `item.link` 값 **117종을 전수 curl 테스트**한 결과 **18종이 404**였고 29개 항목이 이를 참조 중 — **링크 권위가 존재하지 않는 URL로 새고 있던 상태**. 죽은 경로: `/treatments/onlay`·`composite`·`fracture`·`extraction`·`fluoride`·`diagnosis`·`insurance`·`digital-implant`·`orthognathic`·`periodontal`·`gum-graft`·`gummy-smile`·`gum-recession`·`gum-depigmentation`·`replantation`·`trauma` + **URL 인코딩된 한글 경로 2종**(`/treatments/%EC%84%B8%EB%9D%BC%EB%AF%B9`, `/encyclopedia/%EC%88%98%EB%A9%B4-%EC%A7%84%EC%A0%95`). 각각 실존하는 최근접 페이지로 매핑(예: `onlay → /treatments/inlay`, `periodontal`·`gum-graft`·`gummy-smile` → `/treatments/gum-surgery`, `trauma`·`replantation` → `/treatments/emergency`, `insurance` → `/pricing`). **⚠️ 방법론 교훈 — 정적 분석은 거짓양성을 냄**: 파일시스템 존재 + `_redirects`/`index.tsx` grep 방식의 1차 스캔은 85종을 "죽은 것 같다"고 보고했으나, 실제 curl 결과 `/treatments/preventive`·`zirconia`·`/guide/dry-socket/`·`/about/patient-funnel` 등 다수가 **301로 정상 처리**되고 있었음. 301 체인과 catch-all 라우트 때문에 **curl 실측만이 유일한 판정 기준**. 스크립트는 멱등·자동백업·`--dry-run` 지원. 결과: `link` 값 117 → **101종 전량 정상**
- **v5.42 검증**: `npm run build:fast` 성공(`dist/_worker.js` 1,046.74 kB, 중복키 경고 0) · `link` 전수 **101/101** 200|301|308 · `guide` 전수 **86/86** 200|301|308 · 신규 심화 4항목 + 대표 3항목 렌더 **7/7 200**(49.7~54.5KB). 항목 수는 838로 불변이므로 `sitemap-encyclopedia.xml`(859 URL) 재생성 불필요
- **v5.41 3️⃣ 과잉진료 자기잠식 봉합 (`/guide/overtreatment` → `/blog/dental-over-treatment-guide` 301 통합)**: v5.40에서 신설한 `/guide/overtreatment`가 **이미 존재하던 `/blog/dental-over-treatment-guide`(45클릭·8,151노출, 2026-03-09 발행)와 완전히 동일한 검색 의도를 놓고 경쟁**하던 구조를 해소. 신설 페이지를 살리고 기존 이력을 버리는 대신, **이력이 있는 URL을 남기고 신설 페이지의 깊이를 그쪽으로 이식**하는 방향을 택함. ①**`/blog/*`가 우리 레포가 아님을 먼저 규명** — 해당 경로는 `bdbddc.inblog.ai` 리버스 프록시(`<meta name="generator" content="inblog"/>`)로 원본 본문 편집이 불가능. 단 프록시 응답을 이미 가공하던 `cleanInblogHtml()` 훅(AEO 메타·스키마·커스텀 CSS·관련 진료 박스 주입에 사용 중)이 존재했고, 여기에 `reqPath`를 관통시켜 **슬러그별 심화 블록 SSR 주입 단계(step 7)**를 신설 ②`src/routes/blog-enrich.ts` 신설(17.8KB) — `BlogEnrichment{html,jsonld}` 인터페이스 + 슬러그 키 맵. 이식 내용: 진료비 세부내역서 4열 읽는 법 / 2차 소견 3STEP 카드 / **자가 체크 10문항 위젯**(바닐라JS, 저장·전송 없음, 4구간 판정) / 진료실 질문 목록 7개 / 공적 창구 5곳 / 반대편 함정(시기를 놓치는 손실) / 의료광고법 고지 ③JSON-LD **`HowTo` + `FAQPage`(10문항)** 를 `</head>` 직전 주입 — 프록시 페이지에 우리 스키마를 얹음 ④**앵커 충돌 방지** — inblog 원본 마크업과의 id 충돌을 피해 `#second-opinion`/`#detail-bill` → `#bd-second-opinion`/`#bd-detail-bill`로 개명 ⑤**리다이렉트 체인 제거** — `/guide/overtreatment`·`.html` 301 + `mapDeadGuideSlug`의 `overtreat`/`second-opinion`/`informed-consent`/`treatment-plan`/`estimate`/`itemized` 분기를 **중간 경유 없이 최종 목적지로 직행**(4/4 전량 `hops=1` 검증) ⑥사후 정리 — 내부 링크 22개 파일(가이드 허브 카드 1 + 가이드 계열 푸터 21) 최종 목적지로 재작성, `sitemap-main.xml` 143→142 URL, `guide/overtreatment.html`(64KB) 삭제. 검증: 프록시 응답 200 / 284,345B, `ot-checker` 1 · `HowTo` 1 · `FAQPage` 1 · `ot-q` 10
- **v5.41 🅐 CTR 구조 개편 (재제목 7종, 합계 53,537노출)**: 신규 GSC(2026-04-26~07-25, 9,670클릭/590K노출/CTR 1.6%/평균 7위)에서 **순위는 잡았는데 제목이 클릭을 못 만드는** 구간을 정면 타격. 실측 근거: 「후회·부작용·하지마」 인텐트 412클릭/7,437노출 = **5.54%** vs 「단어 정의」 64/18,494 = **0.35%** — **16배 격차**. 즉 병목은 순위가 아니라 **제목이 답을 예고하느냐**. ①`treatments/pediatric`(17,379노출·**CTR 0.03%**, 사이트 최대 이상치) → 「아이가 치과를 무서워할 때 — 수면치료 안전한가요? 유치 충치 꼭 때워야 하나요?」로 **질문형 전환** ②`doctors/pediatric`(4,567·0.13%) → 「우리 아이 담당 선생님은 어떤 분? — 진료 스타일까지 공개」 ③`guide/insurance`(9,478·0.75%) → 「되는 것 안 되는 것 \| 사랑니·신경치료 O, 임플란트·레진 X」로 **결론을 제목에 선공개** ④`guide/implant`(5,891·0.49%) → 「병원마다 가격이 다른 이유」 ⑤`guide/laminate`(5,658·0.23%) → 「emax vs 지르코니아, 몇 개를 해야 할까」. **동시에 `/guide/regret/laminate`와의 자기잠식을 끊기 위해 제목에서 「후회」를 제거**하고 비용·선택 정보 축으로 재포지셔닝 ⑥`pricing`(4,367·0.87%) → 「전체 공개 — 상담 전에 미리 확인하세요」 ⑦`area/daejeon-laminate`(6,197·0.10%) → 「후회 줄이는 확인 사항 5가지」. `scripts/retitle-ctr.cjs` 신설(멱등, `<title>`+`description`+`og:*`+`twitter:*` 6개 필드 동시 치환) — 7/7 반영 검증. 추가로 `ENC_SEO_OVERRIDES` **+8종**(치태·치과 본인부담금·리테이너·적응증·하악·CBCT·GBR·치주낭) — 작성 중 기존 v5.34/v5.38 오버라이드와 **중복 키 4건(발치·석션·설면·소구치) 발생을 빌드 경고로 포착**, 인터랙티브 위젯을 참조하는 **기존 항목이 더 우수하다고 판단해 신규 쪽을 철회**
- **v5.41 🅒 백과사전 → 가이드 유도 배너 16종 확대**: 백과사전 114개 페이지가 **127,886노출을 만들고도 CTR 0.79%**에 그치는 구조(정의만 읽고 이탈)를 개선. 노출 상위 용어 본문에 전용 가이드 유도 배너(`ENC_GUIDE_NUDGE`)를 SSR 삽입해 **정보 단계 트래픽을 전환 페이지로 흘려보냄**. 신규 16종 — 치아 미백·라미네이트·임플란트·교정·인비절라인·신경치료·스케일링·크라운·충치 → 대응 `/guide/regret/*`, 틀니 → `/guide/denture`, 사랑니 → `/guide/wisdom-tooth`, 치석·치주염·치은염 → `/guide/regret/gum`, 비급여 항목 → `/pricing`, 치과 진료비 영수증 → 과잉진료 블로그. ①**용어 키를 데이터로 검증한 것이 실수 3건을 막음** — `본인부담금`·`콘빔CT`·`치아교정`·`비급여`·`진료비 세부내역서`는 `encyclopedia.json`에 **존재하지 않는 키**였고(무음 실패), 실제 표기(`치과 본인부담금`·`CBCT`·`교정`·`비급여 항목`·`치과 진료비 영수증`)로 교정 ②검증 17/17 전량 의도한 목적지 연결(마커 `📘 전체 가이드`)
- **v5.41 🅓 일본어 클러스터 재제목 6종 (의료관광 인텐트)**: `/jp` 계열은 **CTR 6.0%로 사이트 최고 성과 구간**임에도 제목이 「費用」「料金」 같은 실제 검색어를 담지 못하던 문제 해소. `scripts/retitle-jp.cjs` 신설, 6/6 반영. ①`jp/guide/implant` → 「韓国インプラント 費用・オールオン4 料金ガイド 2026 \| 日本との比較・期間・保証」로 **オールオン4 검색어 흡수** ②`jp/guide/laminate` → 「1本いくら? 日本との費用比較・寿命・Glownate」 ③`jp/guide/invisalign` → 「何回渡韓が必要? パッケージ比較」로 **일본 환자의 실제 최대 관심사(도한 횟수)를 제목화** ④`jp/pricing` → 「韓国 歯科 料金表 2026」 ⑤`jp/travel-guide` → 「何泊必要? 空港からのアクセス・ホテル・通訳」 ⑥`jp/guide/index` → 「日本との比較」 축 명시
- **v5.41 하우스키핑**: `encyclopedia/index.html`이 실제 목록 837개를 담고도 「838개」로 표기하던 불일치 12곳 + `src/index.tsx` 1곳 수정
- **v5.40 🅐 과잉진료 신뢰 콘텐츠 신설 (`/guide/overtreatment`)** ⚠️ **v5.41에서 폐지 — 이 URL은 현재 `/blog/dental-over-treatment-guide`로 301되며, 아래 콘텐츠는 `src/routes/blog-enrich.ts`를 통해 해당 블로그 페이지에 주입됨. 사유: 동일 인텐트의 기존 페이지(45클릭/8,151노출)를 사전 확인하지 않고 신설해 자기잠식이 발생함.** GSC 실측 기준 콘텐츠가 아예 없던 채로 순위만 잡고 있던 구간을 정면으로 채움 — 「치과 과잉진료」 29노출 10.6위, 「치과 과잉진료 신고 후기」 7노출 13.0위, 합계 36노출·전용 페이지 0. `guide/overtreatment.html`(64KB) 신설. ①**의료광고법 안전 프레이밍이 설계의 출발점** — 이 주제는 조금만 어긋나도 타 의료기관 비방으로 읽히므로, 페이지 최상단과 최하단에 "특정 병원·의료진을 지목·평가하지 않으며, 같은 상태에서도 의학적으로 타당한 서로 다른 계획이 존재한다"는 고지를 배치하고 전 본문을 **일반 판단 기준** 서술로만 구성 ②**「치료가 많다 = 과잉」 전제를 먼저 해체** — 검사 범위·치료 시점 기준·계획의 시간 지평 3가지 차이로 계획이 갈리는 구조를 설명하고, 판별의 축을 "치료의 양"이 아닌 **"설명의 질"**로 이동 ③**환자가 실제로 쓸 수 있는 도구 중심 구성** — 판단 기준 7가지(각 항목마다 진료실에서 그대로 읽을 질문문 포함) / 진료비 세부내역서 4개 열 읽는 법 + 4단계 대조 절차 / 2차 소견 3단계(자료 확보 → **앞선 견적을 먼저 말하지 않고 백지 상태로 질문** → 두 계획 5축 비교) / 그대로 캡처해 쓰는 질문 목록 7개 ④**자가 체크 위젯 10문항**(바닐라JS, 저장·전송 없음) — 4구간 판정과 다음 단계 앵커 링크 제공 ⑤**공적 창구 5곳 안내**(심평원 진료비 확인 요청 / 의료분쟁조정중재원 / 소비자원 1372 / 보건소·복지부 129 / 국민신문고) + 공개 게시판 실명 게시의 역위험 경고 ⑥**반대편 함정도 명시** — 실제로 더 흔한 손실은 과잉 의심으로 시기를 놓치는 쪽이라는 점을 §07로 별도 배치해 균형 유지 ⑦**본문 가격 표기 0건** — 비급여는 기관 자율 책정이라는 원리만 설명하고 금액은 `/pricing` 링크로 위임 ⑧JSON-LD 4블록(`Article` / `BreadcrumbList` / **`HowTo`**(2차 소견 3단계) / `FAQPage` 10문항) ⑨**「라미네이트 부작용」류 의도는 흡수하지 않고 `/guide/regret/laminate`로 유도** — 기존 후회 백서 12개 하위 페이지와의 자기잠식 방지 ⑩라우트 등록(`/guide/overtreatment` + `.html` 301), `EXISTING_GUIDES`·`mapDeadGuideSlug` 키워드 매핑(`overtreat`/`second-opinion`/`itemized` 등) 추가, `sitemap-main.xml` 등재(143 URL), 가이드 허브 카드 신설, 후회 백서·실비 가이드 관련 링크 + 가이드 계열 21개 파일 푸터 링크 추가
- **v5.40 🅑 실비 클러스터 카니발라이제이션 해소 (2️⃣+3️⃣ 병행)**: 「치과 실비」 검색 의도를 백과사전 4개 항목이 나눠 가지며 **385노출/0클릭**을 기록하고, 정작 40KB 전용 랜딩 `/guide/insurance`의 권위까지 희석하던 구조를 정리. ①**전용 랜딩 실존 확인이 진단을 바꿈** — 최초 계획은 "실비 통합 랜딩 신설"이었으나 조사 결과 `/guide/insurance`가 이미 라이브였고, 진짜 문제는 콘텐츠 부재가 아니라 **카니발라이제이션**이었음. 계획을 "생성"에서 "트래픽 정리"로 전면 수정 ②`ENC_TO_GUIDE_301` 신설 — 실질 중복 3종(「실비보험 치과 적용」169노출 18.9위 / 「실손 보험 치과」/「실비보험 청구」)을 `/guide/insurance`로 **영구 301 통합** ③「실비보험」(216노출 13.1위, v5.34 슈퍼 콘텐츠)은 **존치** — 대신 `ENC_GUIDE_NUDGE`로 본문 최상단에 전용 가이드 대형 유도 배너를 SSR 삽입해 권위를 흘려보냄 ④**리다이렉트 체인 제거** — 동의어(`실손보험 치과`·`실비 치과`·`실손 치과 보장`)가 대표어를 경유해 2홉이 되던 것을 동의어 분기에 최종 목적지 룩어헤드를 추가해 **전량 1홉**으로 해소(크롤 예산·권위 전달 손실 방지). 검증: 8종 전부 `hops=1` ⑤**알려진 리다이렉트 링크를 남기지 않도록 사후 정리** — 301된 3개 용어를 `sitemap-encyclopedia.xml`(862 → 859 URL)과 `encyclopedia/index.html` 색인 목록(840 → 837개 항목)에서 제거
- **v5.39-hotfix 🚨 `/en/*` 영문 페이지 11종 301 사망 복구**: 영문 랜딩 11개가 전부 한글 페이지로 301 튕기며 색인 0이던 치명적 버그 수정. **원인 2중 규명** — ①`scripts/post-build.cjs`가 매 빌드마다 `dist/_routes.json`을 덮어쓰는데 그 exclude 목록에 `/en/` 경로가 없었고, `include:["/*"]`이므로 Worker가 정적 파일보다 먼저 요청을 가로챔 ②`src/index.tsx`의 레거시 `/en/*` catch-all이 "실존 정적 페이지는 여기 도달 안 함"이라는 잘못된 가정으로 무조건 `/en` 접두어를 떼고 301. 동시에 `sitemap-intl.xml`은 `hreflang="en"`으로 `/en/`을 광고 중 → 구글에 "여기 있다"고 알리면서 오는 봇을 전부 되돌려보내던 상태. **수정** — `public/_routes.json`에 실존 `/en/` 정적 경로를 **개별 열거**(`/en/*` 와일드카드는 `/en/dictionary/*` Worker 라우트를 막으므로 금지)하고, catch-all을 `EN_LIVE_EXACT`(24경로) + `EN_LIVE_PREFIXES` **화이트리스트 통과 방식**으로 축소. 확장자 있는 형태와 사이트맵이 광고하는 클린 URL 양쪽 모두 등록해 프로덕션 Pages와 로컬 `wrangler pages dev`의 자산 정규화 순서 차이까지 흡수. **재발 방지**로 `npm run build:fast`(`vite build && post-build.cjs`) 스크립트를 신설 — `vite build` 단독 실행이 이 사고의 근인이었음
- **v5.39 영문 치과 사전 30종 신설 (`/en/dictionary`)**: 영어권 환자(Camp Humphreys 미군기지·주재원·유학생)의 **증상·질환 인지 단계** 검색을 잡는 퍼널 최상단 유입구 신설 (`src/routes/en-dictionary.ts`, 2,211줄). ①**자기잠식 회피 설계** — 시술·비용 키워드(implant/invisalign/veneer/whitening/scaling/crown/root canal)는 기존 `/en/implant`·`/en/invisalign`·`/en/laminate`·`/en/pricing` 랜딩이 이미 점유하므로 **의도적으로 배제**하고 증상·질환·해부 용어만 선정(슬러그 중복 0 검증). 사전은 정보 단계에서 랜딩으로 흘려보내는 역할만 담당 ②**번역이 아닌 영문 네이티브 원고** — 한국 치과를 처음 겪는 영어권 환자 맥락(NHIS 미적용 vs SOFA·방문자 신분, PCS 이동 시 영문 차트·방사선 인수, 기지에서 차로 30분) 반영 ③**가격은 본문에 일절 표기하지 않고 `/en/pricing` 링크만** — 정규식 전량 검증(`₩`/`만원`/`KRW`/`$` 0건)으로 단일 소스 원칙 유지 ④7분류 30종 — Gum & Periodontal 5(gingivitis·periodontitis·chronic-periodontitis·dental-calculus·pregnancy-gingivitis) / Tooth Decay & Pulp 5(dental-caries·pulpitis·periapical-lesion·dental-pulp·tooth-discoloration) / Cracks & Trauma 2 / Wisdom & Eruption 4 / Bite & Jaw 4(malocclusion·bruxism·tmj-disorder·tmj-clicking) / Mouth & Tongue 6(halitosis·stomatitis·geographic-tongue·oral-thrush·leukoplakia·oral-cancer) / Tooth Anatomy 4(enamel·dentin·alveolar-bone·periodontal-ligament) ⑤**전용 FAQ 180개**(30×6) + 페이지당 JSON-LD 4블록(`WebPage`+`MedicalWebPage` / `DefinedTerm`+`DefinedTermSet` / `BreadcrumbList` / `FAQPage`), 허브는 `CollectionPage`+`ItemList` ⑥**한국어 백과사전과 양방향 hreflang** — 영문 30페이지가 `hreflang="ko"`로 `/encyclopedia/<term>`을 가리키고, 한국어 30페이지도 `EN_DICT_BY_KO` 매핑으로 `hreflang="en"` 역방향 선언(단방향은 구글이 무시). 30/30 양방향 검증, 무관 백과사전 페이지 오염 0 ⑦동의어 → canonical 301(예: `/en/dictionary/tartar` → `dental-calculus`), `.html` 접미·대문자 정규화 301, 미존재 슬러그 302 ⑧`sitemap-intl.xml` 54 → **85 URL**(허브 1 + 용어 30, 전량 hreflang alternate 세트 포함) ⑨내부 링크 `D()` 30개 참조 전량 사전 유효 검증 + 마크업 오타 2건(`</textarea></table>`, 불일치 `</p></div>`) 빌드 전 차단. 의료광고법 안전 표현 적용(tmj-disorder·oral-cancer·leukoplakia 등 YMYL 항목에 "general information, not a diagnosis" 명시)
- **v5.38 제로클릭 2차 회수 8종 (슈퍼 콘텐츠 확산)**: GSC `ctr_low` 잔여분 — 순위는 좋은데 클릭이 0~1인 "제목이 병목"인 용어 8종을 슈퍼 콘텐츠화 (`src/routes/enc-super-v538.ts` 신설, 972줄). 대상: 측절치(65노출/0클릭·4.6위)·지도설(56/0·9.2위)·교두(47/0·7.2위)·대합치(46/1·3.5위)·치수강(45/1·4.1위)·중절치(45/0·6.0위)·설면(42/0·3.2위)·파워체인(36/0·7.2위) = **합계 382노출/2클릭(CTR 0.5%) 회수 타깃**. ①**제목 답 예고형 재작성 8종**(`ENC_SEO_OVERRIDES`) — 예: 「측절치란? — 앞니 옆 "2번 치아" 위치와 왜소치·결손 치료법 총정리」 ②**본문 전량 2,000자 이상 증량** — 측절치 707→2,163 / 중절치 684→2,227 / 교두 802→2,117 / 설면 648→2,338 / 대합치 784→2,264 / 치수강 895→2,262 / 지도설 735→2,256 / 파워체인 759→2,529자 ③**신규 인터랙티브 위젯 6종** — 치아 5면 탐색기(설면·교두 2개 페이지 재사용) / 앞니 황금비율 계산기(중절치 75~80%, 왜소치 판정, 측절치·중절치 재사용) / 혀 상태 트리아지(지도설 vs 칸디다증 감별) / 대합치 상실 연쇄 시뮬레이터(발치 직후~3년 이상) / 치수 통증 트리아지(가역 vs 비가역 5단계) / 파워체인 관리 Q&A(교체 주기·변색·끊어짐·통증·양치) ④**전용 FAQ 56개**(8×7) + FAQPage 스키마 자동 반영 ⑤위젯 갤러리 15종 → **21종**(공용 위젯 2종은 `galleryHidden` 프리셋 변형으로 중복 카드 방지, 라우트는 26종). 내부 링크 55종 전량 사전 유효 검증(`브리지`→`브릿지` 표기 오류 수정). 의료광고법 안전 표현 적용(지도설 "진단이 아닌 자가 참고용" + 병원 방문 기준 5가지 명시). 라미네이트 80만원·임플란트 80/100/160만원·유지장치 양악 25/편악 15만원·인비절라인 300~700만원 등 `pricing.html` 공식 수가와 4소스 정합 유지. 슈퍼 콘텐츠 총 **29종**
- **v5.37 매핑 누락 보수 + 얇은 슈퍼 콘텐츠 4종 보강**: ①**퍼가기 박스 매핑 누락 보수** — `WidgetDef`에 `galleryHidden?: boolean` 플래그 신설. 치아 탐색기 프리셋 변형 3종(`tooth-explorer-premolar`/`-molar`/`-canine`)을 추가해 소구치·대구치·견치 백과사전 페이지도 임베드 백링크 박스를 보유하도록 연결. 갤러리 그리드에서는 중복 카드를 숨겨 15종 유지(라우트는 17종). ②**v5.33 그룹 4종 본문 2배 이상 증량** — 치아 미백 820→1,969자(소프트 블리칭 4.9만원/하드 블리칭 8만원 비용표 + 미백 전 체크 3가지 + 48시간 관리 시기표 + 오해 3가지) / 인비절라인 837→2,338자(익스프레스 300·퍼스트 400·라이트 450·모더레이트 550·컴프리헨시브 700만원 패키지표 + 치료 5단계 + 얼라이너 관리 5원칙 + 유지장치 양악 25/편악 15만원) / 영구치 맹출 순서 978→1,862자(치아별 상하악 맹출 시기표 8행 + 부모 오해 3가지 + 혼합치열기 양치 가이드) / 스케일링 건강보험 900→1,803자(보험 vs 비보험 4항목 비교표 + 오해 3가지 + 연초 방문 권장 + 치주치료 별도 적용). FAQ 4종 추가로 총 36개. 전 항목 `pricing.html` 공식 수가와 4소스 정합 유지
- **v5.36 index.tsx 라우트 분할 1차 (기술 부채 상환)**: 동작 변경 없는 순수 이동으로 모놀리식 진입점 축소 — `src/routes/game-api.ts`(치BTI·치아비행·러닝·충치디펜스 8개 라우트, 253줄) / `src/routes/career-api.ts`(채용 지원 4개 라우트 + Gmail 알림 함수, 292줄) 분리. index.tsx 6,702 → 6,164줄(-538줄, -8.0%). **라우트 등록 순서를 원위치에 유지**해 Hono 매칭 우선순위 불변, 분할 전후 라우트 총수 315개 동일 검증. `app.delete('/api/admin/careers/:id')` 내 지역변수 `app` → `row` 개명(파라미터 섀도잉 제거). 의존 함수는 `Deps` 주입 패턴으로 전달
- **v5.35 위젯 임베드 허브 — 백링크 수확 구조 15종 확산**: v5.30 `/widgets/tooth-numbering` 단일 임베드 패턴을 전체 위젯으로 확장 (`src/routes/widget-embed.ts` 신설). ①`/widgets` 갤러리 허브 신설(카드 15종·원클릭 퍼가기 코드 복사·CollectionPage + WebApplication 스키마·sitemap-main 등재) ②`/widgets/:slug` 임베드 라우트 14종 신설(noindex,follow + `Content-Security-Policy: frame-ancestors *` + s-maxage 24h, canonical은 원본 백과사전으로) ③백과사전 14개 용어 본문에 "이 위젯 퍼가기" 블록 SSR 자동 삽입(`WIDGET_BY_TERM` 매핑). 모든 임베드 스니펫에 원본 백과사전 do-follow 백링크 포함 → 외부 블로그 임베드가 곧 도메인 권위로 환원되는 구조. enc-super/enc-super-v534 위젯 상수 export 전환
- **v5.34 제로클릭 거인 8종 회수 (슈퍼 콘텐츠 확산)**: GSC `ctr_low` 분석 기반 — 순위는 좋은데 클릭이 0인 "제목이 병목"인 키워드를 타깃 (`src/routes/enc-super-v534.ts` 신설, 655줄). 대상 8종: 정출·소구치·치식·대구치·견치·턱에서 소리(순위 1.0/노출 55/클릭 0)·정중선·실비보험. 신규 인터랙티브 위젯 5종 — 치아 이름·번호 탐색기(3개 페이지 재사용) / 정출 3유형 판별기 / 턱 소리 트리아지(딸깍 vs 사각사각) / 실비보험 보장 체커 / 정중선 자가 체크. 8×6=48개 전용 FAQ + FAQPage 스키마 자동 반영. **`ENC_SEO_OVERRIDES` 중복 키(소구치·대구치) 제거** — JS 객체 리터럴은 나중 키가 이기므로 신규 타이틀이 구버전에 가려지던 버그 수정. 의료광고법 안전 표현(실비보험 "최종 판단은 본인 보험사" / 턱관절 "진단이 아닌 자가 참고용") 적용
- **v5.33 백과사전 인터랙티브 위젯 (Tier 3)**: 4개 슈퍼 콘텐츠 페이지에 자기완결형 바닐라JS 위젯 추가 (`src/routes/enc-super.ts`) — ⑪영구치 맹출 순서: 아이 이갈이 시기 계산기(만 나이 선택→교체 치아·체크포인트) ⑫인비절라인: 교정 장치 비교기(투명/세라믹/메탈/설측 탭) ⑬치아 미백: 방식 비교기(오피스/자가/병행/내부/제품) ⑭스케일링 건강보험: 연 1회 적용 체커(나이·사용여부·치주목적 판정). 신규 ENC_SUPER 엔트리 4종 + SEO 오버라이드 4종. 위젯 내부 작은따옴표는 한글 인용부호(‘’)로 처리해 렌더링 안전성 확보. WebApplication/FAQPage 스키마·내부링크·4소스 팩트 정합 유지
- **v5.32 백과사전 인터랙티브 위젯 (Tier 2)**: 5개 슈퍼 콘텐츠 페이지에 자기완결형 바닐라JS 위젯 추가 (`src/routes/enc-super.ts`) — ①인레이 재료 비교기(골드/세라믹/지르코니아 탭) ②치아 크랙 증상 체커(증상 가중치→단계 판정) ③임플란트 3단 해부도(픽스처·어버트먼트·크라운 클릭) ④신경치료 단계 진행바(1~4회차) ⑤발치 후 회복 타임라인(당일~1개월 슬라이더+드라이소켓 경고). 신규 ENC_SUPER 엔트리 3종(임플란트·신경치료·발치) + SEO 오버라이드 3종 추가. WebApplication/FAQPage 스키마·내부링크·4소스 팩트 정합 유지
- **v5.31 백과사전 슈퍼 콘텐츠**: GSC 노출 상위 6개 용어(레진·인레이·틀니·치석·법랑질·치아 균열)를 "가이드급 본문 + 맞춤 FAQ + FAQPage 스키마 + 내부링크"로 오버라이드 (`src/routes/enc-super.ts`). v5.30 '치아 번호' 성공 공식(제목에 답 예고 + 표 구조 + 검색의도 100% 해소) 복제. 4소스(HTML/JSON-LD/챗봇KB/llms) 팩트 정합 유지
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
