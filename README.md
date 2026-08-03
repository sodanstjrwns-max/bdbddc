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

## Current Version: v5.48

### v5.48 — 글로우네이트 스토리텔링 전면 리뉴얼 (2026-07-31)

`treatments/glownate.html` 을 「기능 나열형 진료 페이지」에서 **「제품 상세페이지형 12막 스토리텔링」** 으로 재구성.
GSC 진단상 라미네이트/심미 카테고리는 **31,436노출 / CTR 0.55%** 로 최고 객단가(1본 80만원 × 4~10본) 대비 전환이 가장 낮은 구간이었음.

#### 🅐 1단계 — 의료광고 리스크·자기모순 해소 (commit `41ce8f73`)

| # | 문제 | 조치 |
|---|---|---|
| ① | **무삭제 포지션 자기모순** — glownate은 "네, 가능합니다"+`alternateName` 등록+"부작용 우려 분께 추천"인데, `guide/laminate` 는 「"무삭제 100% 가능" 과장광고」를 **피해야 할 치과(Red Flag)** 로 명시 → 자사를 Red Flag로 자기지정 | 14개 치환군. `alternateName` 에서 제거, FAQ 답변을 「무삭제는 상당 부분 마케팅 표현입니다」로 전환, 재료 카드·비교표 헤더/셀/각주·쇼츠 설명 정리 |
| ② | 「연예인, 인플루언서들이 많이 선택하는」 (스키마+가시 FAQ+DSD 팁) | 전량 제거 → 삭제량·기공소·보증 기준 서술로 대체 |
| ③ | 「광중합 접착제로 **영구** 부착」, 색조 「**반영구**」 ×3 — 의료법 §56 효과보장 표현 | 「고정 접착」 / 「장기 안정」 |

**무삭제 역할 분리 원칙 확정** — 검색수요(`/blog/no-prep-veneers-cost` 5,614노출)는 버리지 않고 **`guide/*` + `/blog/*` 가 비판적으로 수용**, `treatments/glownate` 는 **최소삭제 단일 포지션**. 영상 제목·챕터 20건은 원래 논조가 「오해와 진실」 계열이라 유지.

#### 🎬 2단계 — 12막 재구성

| 막 | 내용 | 근거 |
|---|---|---|
| **0** | 히어로 + **3초 요약 박스** | 80만원 · 0.3~0.5mm · 2~3주/2~3회 · 10년 보증서 · 현정민/박수빈 · E.max. 히어로 스탯도 「14인·최소삭제·5F」(모호) → **하드넘버 3종** |
| **1** | 거울 앞 3초 — 주소증 6종 | R2 케이스 38건 실제 분포(깨짐12·변색11·벌어짐6·재치료5·왜소치4·돌출2) |
| **2** | 미백으로 안 지워지는 변색의 정체 | 외인성(표면) vs 내인성(상아질) 2컬럼 |
| **3** | **선택지 4개 분기표** | 「색만이면 미백. 배열이면 교정. 한두 개면 심미레진 15만원.」 — 타 치료 **비방 없이 분기**. 의료법 §56④ 회피 + 페이지 자체 원칙(「가장 침습도가 낮은 방법부터」)과 정합 |
| **4** | 자가 판정 체크 6항목 | 기존 「추천되나요」 블록 재활용 |
| **5** | **2차 불안 — 비가역성** (신규) | 1차(못생김)→DSD+임시라미 / 2차(못 되돌림)→법랑질 0.5~1.0mm 대비 삭제 0.3~0.5mm 시각 바. **"법랑질은 재생되지 않습니다"를 그대로 명시** |
| **6** | **불안 대응표 4행** | 기능 6나열(USP6) + 차별점 6나열(DIFF6) **2개 섹션 폐기** → 대응표 + 시스템 칩 6개로 통합. 최소삭제 3중복→1, DSD 2→1, 10년보증 2→1 |
| **6.5** | 스타일 3택 | `laminateStyle` 실제 분포 natural-pretty 25 / bright-pretty 8 / white-pretty 5 |
| **7** | **케이스 12건 정적 임베드 + 담당원장 결합** | 기존엔 JS로만 6건 주입 → **크롤러 미노출**. SSR 정적 12건(주소증 4그룹×3)으로 전환, 카드마다 원장·기간·연령. `afterLocked` 유지(의료법 §56 로그인 게이트) |
| **8** | 가격·보증 (맨 끝 → 중간) | 80만원 **단일가** 명시 + **10년 보증서 적용/제외 카드 신설** |
| **9** | **「이런 경우엔 말립니다」 후방 배치** | 앞에 있으면 이탈, 뒤면 결정타 |
| **10** | FAQ **19개 유지** + 4카테고리 접기 | 삭제량·안전성 5 / 비용·기간 4 / 수명·관리·재시술 6 / 병원선택·지역 4 |
| **11** | CTA | 중간 예약 CTA를 **케이스 직후**로 이동 |

#### 검증

- 태그 밸런스 **이상 0건** (HTMLParser 전수)
- JSON-LD **9블록 / 10노드 / 파싱실패 0** — `BreadcrumbList, HowTo, MedicalProcedure, FAQPage, Dentist, MedicalWebPage, VideoObject×4`
- FAQPage **1개 / 19문항 / 가시 미노출 0건**
- SEO 자산 보존: title 32자 · **h1↔title 자카드 0.947** · `enc-inline-link` 20 · 내부링크 200
- 의료광고 위험 표현 — 연예인0 / 영구부착0 / 반영구0 / 무삭제추천0 / 효과보장0
- 케이스 이미지 14개 프로덕션 R2 **200 전수 확인**, `loading=lazy decoding=async fetchpriority=low`
- `scripts/audit.py` **치명 0건**, 로컬 32/32 + 라미네이트 계열 18/18, 브라우저 콘솔 에러 0

#### 미채택 (기록)

- **FAQ 8~10개 축소** — 거부. 19문항은 후회969·부작용840·가격605 검색수요를 받는 자산
- **애프터 사진 공개** — 거부. 의료법 §56 로그인 게이트 유지
- **단점으로 드리블** — 거부. §56④ 비방 리스크 + 페이지 자체 원칙과 모순 → **분기(分岐)** 로 대체

### v5.47 — 라미네이트 계열 정리: 「글로우네이트」 → 「라미네이트」 (2026-07-30)

- 커밋 `8164cf23` (215 files) · 배포 `da505fe0.seoul-bd-dental.pages.dev`
- 프로덕션 검증: `lv.py` 32/32 (pages.dev + bdbddc.com 양쪽) · 계열 18타깃 18/18 · `reg.py` 26타깃 실패 0건
- glownate 실측: JSON-LD 9블록/10노드 · FAQPage 1개 19문항 · 가시 미노출 문항 0건 · gzip 전송 38,386B · TTFB 0.15s
- 백업: https://www.genspark.ai/api/files/s/paEm6fQo (238,185,517 B)

메인 진료(라미네이트)가 GSC 카테고리 **노출 4위(31,436)인데 CTR 꼴찌권(0.55%)** 인 원인을
전수 진단하고 교정했다. 근본 원인은 **앵커 텍스트**였다.

#### 진단 — 카테고리 규모 vs CTR (2026-04-26~07-25)

| 노출 | 클릭 | CTR | 카테고리 |
|---|---|---|---|
| 44,970 | 1,281 | 2.85% | 사랑니 |
| 41,921 | 1,028 | 2.45% | 임플란트 |
| 37,959 | 718 | 1.89% | 교정/인비절라인 |
| **31,436** | **172** | **0.55%** | **라미네이트/심미** ← 최고 객단가(1본 80만원 × 4~10본) |
| 13,804 | 481 | 3.48% | 미백 (노출 1/2.3인데 클릭 2.8배) |

**핵심 발견**: `/treatments/glownate` 로 들어오는 내부링크 **481개 중 「라미네이트」를 포함한 앵커는 9개(1.9%)**.
178p「✨ 글로우네이트」 · 131p「글로우네이트」 · 78p「심미레진」(오표기) · 61p「글로우네이트 안내」 · 20p「글로우네이트 자세히 보기」.
즉 구글에게 481번 “이 페이지는 글로우네이트 페이지”라고 말해온 셈이고,
**「글로우네이트」 브랜드 검색어는 GSC 상위 500개 중 0건**이었다.

#### 🅐 계열 정리 — 노출을 메인으로 몰아주기

| | 내용 | 결과 |
|---|---|---|
| A1 | 앵커 텍스트 키워드화 (nav/footer/chip/버튼 5패턴) | **646곳 / 228 files** — 「라미네이트」 앵커 **9 → 456/461 (98.9%)** |
| A2 | 역할 분리 + 상호링크 (`guide/laminate`=정보, `treatments/glownate`=진료, `guide/regret/laminate`=후회) | 3페이지 완전 연결 + `pricing/prosthetic` |
| A3 | `area/daejeon-laminate` (6,197노출 / **0.10%** — 계열 최대 노출·최악 CTR) 인텐트 정직화 | title 23→**28자**, 거리 선노출 |

- footer 「심미레진」 78곳은 `/treatments/glownate` 를 가리키는 **오표기**였다 → 「라미네이트」로 통일 (UX 수정 + 키워드 확보)
- `guide/laminate`(5,658노출·25,431자)는 본문에서 진료 페이지로 가는 링크가 **0개**였다 → 인텐트 라벨 CTA 박스 신설
- `guide/regret/laminate`(1,940노출)는 형제 페이지로부터 **인바운드 0** 고아였다 → 양방향 연결
- `area/*-laminate` 20p 스팸 의혹은 **무혐의**: 6-gram 자카드 평균 22.1% (문서 ③ 기준 통과)

#### 🅑 title/H1 탈브랜드화 — `treatments/glownate`

```
title  천안 라미네이트 글로우네이트 | 최소 삭제 포세린 · 10년 보증 — 서울비디치과  (43자, 모바일 절단)
   →   천안 라미네이트 80만원 | 0.3mm 최소삭제·10년보증                     (32자 ✅)
H1     라미네이트의 새로운 기준, 글로우네이트
   →   천안 라미네이트, 0.3mm 최소삭제·10년 보증           (title↔H1 2-gram 자카드 0.947)
```
브랜드명과 백과사전 인라인 링크는 `hero-desc`로 이관해 **브랜딩 손실 0**.
`area/daejeon-laminate`: title `대전 라미네이트 | 차로 40분·0.3mm 최소삭제`(28자) / H1 `대전에서 차로 40분, 0.3mm 최소삭제 라미네이트`(자카드 0.810) — **거리를 숨기지 않고 앞세워** 오인 노출을 걸러내고 메인 페이지와의 일반 키워드 경쟁을 해소.

#### 🅒 구조화 데이터 정리 — `treatments/glownate`

| 항목 | 전 | 후 |
|---|---|---|
| JSON-LD 블록 | 11개 | **9개** |
| `FAQPage` | **2개** (문서 ⑨ 위반) | **1개 / 19문항** |
| 가시 HTML에 없는 FAQ 문항 | **6건** (구글 정책 위반) | **0건** |
| `VideoObject` | 5개 (`-2vBN2jVClM` 중복) | **4개 (전부 유니크)** |

- 삭제한 `FAQPage`의 6문항 중 **실질 신규 4개는 가시 FAQ 아코디언(faq-21~24)으로 신설** 후 병합
  (부작용 / 무삭제 라미네이트 / 실제 임상 사례 / 아산·세종·대전 거리)
- 「사례」 문항은 **의료법 §56 준수** — 후기·비포애프터 표현 대신 「본인 인증 후 열람」(기존 로그인 게이트 설계와 일치)
- `MedicalProcedure.performer` 의 `Dentist` 는 `@id` 참조이므로 **중복 아님** → 유지

#### 검증

- `scripts/audit.py` **치명 이슈 0건** · JSON-LD 파싱 실패 0건 · title 중복/남용 0건
- title 모바일 절단 초과 140p → **139p** · 로컬 `lv.py` **32/32** + 계열 18타깃 **18/18**

#### 미채택 (사용자 판단)

- 🅓 「후회·부작용」 블록 신설 / 🅔 `cases/*` 증설 — 이미 존재하여 제외
- 홈페이지 `<title>`(47자) — 유지 결정
- `AggregateRating`/`Review` — 의료법 §56 검토 전까지 보류

### v5.46 — 구글 공식문서 18종 기준 전면 정합화 (2026-07-30)

### v5.46 상세 — 구글 공식문서 18종 기준 전면 정합화

- 커밋 `bdd315da` (215 files, +2638/-1776) · 배포 `33f885a5.seoul-bd-dental.pages.dev`
- 프로덕션 검증: `lv.py` 32/32 통과 (pages.dev + bdbddc.com 양쪽) · `reg.py` 26타깃 실패 0건
- 백업: https://www.genspark.ai/api/files/s/IHa5HYKH (234,215,104 B)

「구글_공식문서_마스터가이드」(공식문서 18종 + 부록 A~D)를 우리 사이트에 대입해 전수 감사하고,
검출된 위반을 **한 번에 전부** 교정했다. 감사 자체를 `scripts/audit.py`로 상설화해
부록 B「월간 15분 점검 루틴」을 자동화했다.

#### 감사 결과 요약 (색인대상 292p)

| 항목 | 근거 문서 | 전 | 후 |
|---|---|---|---|
| 원장 수 표기 불일치 (15인/15位/15人/15 คน) | ④ ⑬ 의료법 §56 | **64곳** | **0곳** |
| title 중복 | ⑱ | 1건 | **0건** |
| title 키워드 남용 | ③ | 2건 | **0건** |
| title 모바일 절단 초과 | ⑱ | 210p | **140p** |
| title↔H1 불일치 | ⑱ | 203p | **64p** |
| description 중복 | ⑱ | 1건 | **0건** |
| author 메타 누락 | ④ E-E-A-T | 73p | **0p** |
| canonical 누락 | ⑫ | 11p(오진) | **0p** — 전부 이미 `noindex` |
| `Physician` 구조화 데이터 | ⑨ 병원 핵심 3종 | **0개** | **14개** |
| JSON-LD 파싱 실패 | ⑨ | 0건 | **0건** |
| 이미지 alt 누락 | ⑯ | 0/383 | **0/383** |
| `<img>` self-closing 마크업 오류 | — | 105곳 | **0곳** |
| `encyclopedia/index.html` 용량 | ⑰ CWV | 263.1KB | **227.4KB (−13.6%)** |
| robots.txt AI 크롤러 차단 | ⑪ | 없음 | **없음 (전면 허용 유지)** |
| sitemap↔noindex 충돌 | ⑤ | 0건 | **0건** |
| **치명 이슈 합계** | — | 78건 | **0건** |

#### P0 — 원장 수 「14인」 단일화 (7개 언어 / 64곳)

`doctors/` 실측 = 개별 원장 페이지 14개 + 허브 9개. `doctors/index.html` H1도 "서울대 출신 14인 원장 협진".
반면 다국어 7p가 `15`를 말하고 있었다. 한국어 178p·1,435회는 이미 14인이므로 **다국어가 틀린 것**.
YMYL(⑬)·의료광고(의료법 §56) 영역에서 자사 인력 수 불일치는 신뢰(④ Trust) 직격이라 최우선 처리했다.

`en/index` 12곳 · `jp/dental` 10 · `ru/index` 10 · `vi/index` 10 · `cn/dental` 9 · `th/index` 10 ·
`jp/pricing` 1 · `cn/pricing` 1 · `doctors/index` 주석 1. title·description·og·twitter·JSON-LD·H1·본문·통계박스 전 계층.

#### P1a — 다국어 title 단축 (26p)

라틴/키릴은 데스크톱 SERP 폭이 ~65자. `en/index` 110자, `vi/implant` 106자 등이 **뒤 40%가 통째로 비노출**이었다.
일본어·중국어는 이미 43~58자로 적정이어서 제외. 26p 전부 46~62자로 재작성하고 og:title·twitter:title 동기화.

#### P1b — `area/*` 88p 자기잠식 해소 ★

가장 큰 발견. 허브 `{지역}.html`과 `{지역}-implant.html`이 **title 앞머리·H1이 완전 동일**한 쌍이 19개.
같은 검색어로 자사 페이지끼리 경쟁하고 있었다 (area 전체 CTR 0.55%의 유력 원인).

- **허브 20p** → title `{지역} 치과 | 서울비디치과 오시는 길·진료과목`, H1 `{지역}에서 가까운 서울대 14인 원장 치과`로 분화
- **시술 랜딩 60p** → title `{지역} {시술} 잘하는 치과 | 서울비디치과` (기존 H1과 완전 정합)
- **단독 허브 7p + 천안 1p** → 임플란트 의도 유지
- title 내 지역명 반복 **평균 2.97회 → 1.00회** (③ 키워드 남용 회피)
- title 평균 **34.1자 → 24.5자**, 32자 초과 **0p**, 중복 **0건**
- description 꼬리 `{지역} 치아미백 할인` → `치아미백 할인` (87p), `asan`/`cheonan` 지역명 나열 6회 → 1~2회

#### P2 — `Physician` 구조화 데이터 신설 (14p)

문서 ⑨의 병원 핵심 3종 중 `Dentist`(221개)·`FAQPage`(269개)는 있었으나 `Physician`이 **0개**였다.
기존 `Person` 스키마가 이미 면허번호·학력·학회까지 갖춘 우량 자산이라 **파괴 없이 타입만 승격**:

- `"@type": "Person"` → `["Person", "Physician"]`
- `medicalSpecialty` 추가 — `hasCredential`의 전문의 항목에서 자동 추출 (치과보존과/치과교정과/소아치과/구강내과/통합치의학과)
- `url`(canonical) · `address` · `telephone` · `availableService` · `isAcceptingNewPatients` 추가

#### P3 — E-E-A-T·CWV 정비

- **author 68p 추가** (④) — 언어별 표기: 한국어 `서울비디치과` / `Seoul BD Dental` / `ソウルBD歯科` / `首尔BD牙科`. noindex 7p는 대상 제외
- **canonical은 수정 불필요로 판명** — 누락 18p 전부 이미 `noindex`. noindex+canonical 병기는 상충 신호이므로 현 상태가 정답
- **`encyclopedia/index.html` −35.8KB** — 링크 835개가 각각 동일한 60바이트 인라인 `style`을 물고 있었다. CSS 클래스 1개로 치환(`!important`로 렌더링 동일성 보장). 링크 838개 무결
- **`<img>` 마크업 오류 105곳 교정** — Facebook 픽셀의 `"/ alt=""` → `" alt="" />`
- `doctors/oral-medicine` ↔ `treatments/oral-medicine` title 중복 해소, `lee-bm`과의 description 중복도 해소

#### P4 — 고노출 페이지 title 32자 최적화 (15p)

GSC 내부 증거가 결정적이었다. **35~38자 `guide/regret/*`는 CTR 2.72~6.37%**,
**47~64자 페이지는 0.03~1.60%.** 짧은 제목이 압승이다. 노출 상위 15p에 이 패턴을 이식했다.

| 페이지 | 노출 | 기존 CTR | 자수 |
|---|---|---|---|
| `treatments/pediatric` | 17,379 | **0.03%** | 55→30 |
| `guide/wisdom-tooth` | 11,046 | 1.38% | 50→29 |
| `guide/root-canal` | 10,845 | 1.60% | 50→24 |
| `guide/insurance` | 9,478 | 0.75% | 58→23 |
| `guide/denture` | 7,365 | 1.55% | 50→28 |
| `guide/invisalign` | 7,044 | 1.28% | 62→23 |
| `guide/orthodontics` | 6,425 | 1.17% | 49→25 |
| `guide/implant` | 5,891 | **0.49%** | 50→23 |
| `guide/laminate` | 5,658 | **0.23%** | 62→27 |
| `doctors/pediatric` | 4,567 | **0.13%** | 50→24 |
| `pricing` | 4,367 | 0.87% | 56→24 |
| `encyclopedia` | 4,203 | 0.45% | 37→26 |
| `guide/whitening` | 4,202 | 1.12% | 48→22 |
| `treatments/invisalign` | 2,977 | 0.54% | 55→28 |
| `pricing/ortho-guide` | 2,826 | 1.27% | 64→30 |

GSC 최대 비용 쿼리 「신경치료 비용」(1,301노출)·「틀니 가격」(1,030)·「치아교정 비용」(693)·
「라미네이트 가격」(605)을 제목 앞머리로 끌어올렸다.
**홈페이지 `index.html`(47자)은 사용자 결정에 따라 유지.**

#### 상설화 — `scripts/audit.py`

```bash
python3 scripts/audit.py              # 요약 리포트
python3 scripts/audit.py -v           # 위반 파일 목록까지
python3 scripts/audit.py --json a.json
```

문서 ③④⑤⑨⑩⑪⑫⑯⑰⑱을 자동 검사하고, ⑦⑧⑭ 등 사람이 해야 하는 항목은
부록 B 체크리스트로 출력한다. 치명 이슈가 있으면 **exit code 1**을 반환해 CI에 물릴 수 있다.

한글 형태소 특성을 감안해 title↔H1 정합은 **문자 2-gram 자카드 유사도**로 측정하며,
1×1 추적 픽셀·`display:none` 이미지는 alt 집계에서 제외한다(`alt=""`가 정답인 케이스).

#### 남은 ⚠️ (위반 아님 — 최적화 여지)

- title 절단 초과 **140p** — 잔여 대부분은 GSC 노출 0인 롱테일. 노출 발생 시 순차 처리
- title↔H1 불일치 **64p** — 검색 의도(title)와 페이지 내 메시지(H1)를 의도적으로 분리한 케이스 포함
- description 80자 초과 **258p** — 꼬리가 모바일 비노출. 앞 80자에 핵심은 이미 배치됨
- 인라인 style 경량화 여지 **995KB** (사이트 전체) — 300p 시각 회귀 위험이 있어 별도 QA 세션 필요
- `AggregateRating`/`Review` 스키마 — **의료법 제56조 검토 전까지 착수 금지**

---

### v5.45 — 후회 백서 12→24종 확장 + 「천안 치과 추천」 전용 랜딩 (2026-07-29)

두 작업을 동시 투입했다. 공통 근거는 GSC 실측(2026-04-26~07-25)이며, 둘 다 **신규 페이지 생성**이라 기존 페이지 성적에 영향이 없다.

#### Task B — `/guide/regret/*` 12p → 24p

**근거.** 기존 12p = **1,093클릭 / 28,424노출 / 3.85%** 로 전 섹션 최고 CTR(사이트 평균 1.77%의 2.2배). 이미 검증된 패턴을 노출은 있으나 전용 페이지가 없던 주제로 복제하는 것이 가장 확실한 확장이다.

패턴: 제목 `{주제} 후회 N가지와 부작용 총정리 — {구체 경고}` / 설명 `{키워드} 후회, {키워드} 부작용이 궁금하신가요? {4항목} — {약속}을 치과의사가 솔직하게 정리했습니다.`

| slug | 주제 | 실측 노출 | CTR |
|---|---|---|---|
| `bone-graft` | 임플란트 뼈이식 | 3,167 | 1.67% |
| `inlay` | 인레이 | 1,950 | 2.77% |
| `periodontitis` | 치주염 | 1,437 | 1.04% |
| `malocclusion` | 부정교합 교정 | 1,392 | 3.02% |
| `sedation` | 치과 수면마취 | 965 | 4.04% |
| `implant-denture` | 임플란트 틀니 | 845 | 3.20% |
| `resin` | 레진 | 729 | 8.64% |
| `bruxism` | 이갈이 | 679 | 1.91% |
| `front-teeth` | 앞니 치료 | 381 | 7.35% |
| `tooth-crack` | 치아 크랙 | 139 | 9.35% |
| `bridge` | 브릿지 | 42 | 9.52% |
| `retainer` | 유지장치 | — | 교정 클러스터 보완 |

**주제 선정 시 배제한 것.** 「과잉진료」는 노출 규모가 컸으나 **v5.41에서 이미 `/blog/dental-over-treatment-guide`(45클릭/8,151노출)로 301 통합**한 주제다. 신규 페이지를 만들면 v5.41 작업을 되돌리는 자기 잠식이 된다. 대신 `retainer`(유지장치)로 대체해 교정 클러스터(`orthodontics`·`invisalign`·`malocclusion`)를 완성했다.

**페이지 구성**(각 29KB): 30초 요약 / 후회 5가지 3열 그리드(후회·왜 생기나·예방책) / 부작용 빈도표 6행 / 비적응증 5항목 / 치료 전 체크리스트 7항목 / FAQ 6문 + `Article`·`BreadcrumbList`·`FAQPage` JSON-LD 3종.

**내부링크 전략.** `sibling-strip`을 **기존 12p까지 포함해 전 24p에서 24종 상호연결**로 확장했다. 실측 1,093클릭이 이미 흐르는 페이지에서 신규 페이지로 링크를 보내 인덱싱을 가속하는 것이 목적이다. 허브 `/guide/regret`은 `ItemList` JSON-LD 12→24, `deep-card` +12, H2·안내문단 수치 갱신.

#### Task A — `/guide/cheonan-dentist-choice` 신설

**근거.** 「천안 치과 추천」계 실측 합계 **1,034노출 / 20클릭 / 1.93%**.

| 검색어 | 클릭 | 노출 | CTR |
|---|---|---|---|
| 천안 치과 추천 | 5 | 588 | 0.85% |
| 천안 치과 잘하는 병원 | 2 | 137 | 1.46% |
| 천안 임플란트 잘하는 곳 | 3 | 110 | 2.73% |
| 천안치과 추천 | 3 | 105 | 2.86% |
| 천안 치과 추천 디시 | 7 | 94 | 7.45% |

**왜 기존 페이지로 안 되는가.** `/area/cheonan`(634노출/7클릭/**1.10%**)은 「천안 임플란트·교정·라미네이트 진료 안내」 인텐트다. 「추천·고르는 법」은 *병원을 아직 못 정한 사람*의 정보 인텐트로, 진료 안내 페이지가 흡수하지 못한다. 인텐트가 다르면 페이지를 나누는 것이 정석이다.

**의료법 제56조 준수 설계**(사용자 승인 방침 — 자기홍보 0%)
- 병원 순위·추천 목록 **0건**. 상단에 *"이 페이지에는 병원 순위나 추천 목록이 없습니다"* 고지 배치
- **본문 01~05 전 섹션에 자기 병원 언급 0건** (구역별 감사 완료: HEAD 6건=메타 스키마 필수 / CTA 1건=승인된 하단 CTA / FOOTER 3건=전 사이트 공통)
- CTA 버튼 **1개만** (다른 후회 백서는 2개)
- 「1위」·「최고」 등장 2건은 모두 *"의료광고는 심의 대상이라 병원이 스스로 「1위」나 「최고」를 말할 수 없습니다"* 라는 **부정문 인용** — 오히려 준법 안내

**구성**(29KB): 판단 기준 6가지(전문성·진단 근거·서면 총비용·보증 문서화·결제 압박 여부·병원 지속성) / 진료과목별 확인표 7행 / 추천 정보 오해 5가지 / 상담 질문 7가지 / FAQ 6문 + `Article`·`BreadcrumbList`·`HowTo`·`FAQPage` JSON-LD 4종.

#### 라우팅 — 🚨 `/guide/:slug` catch-all 함정

`src/index.tsx`의 `mapDeadGuideSlug()`는 미등록 `/guide/*` 슬러그를 전부 301로 흡수한다. 신규 슬러그를 `EXISTING_GUIDES`에 넣지 않으면 **파일이 존재해도 `/guide/`로 삼켜진다.** 3중 조치:

```typescript
app.get('/guide/cheonan-dentist-choice', serveStatic({ path: './guide/cheonan-dentist-choice.html' }))
app.get('/guide/cheonan-dentist-choice.html', (c) => c.redirect('/guide/cheonan-dentist-choice', 301))
const EXISTING_GUIDES = new Set([ /* … */ 'cheonan-dentist-choice' ])   // ← catch-all 안전망
const REGRET_SLUGS = [ /* 기존 12 */ , 'periodontitis','bone-graft','inlay','resin','bridge',
  'implant-denture','malocclusion','retainer','front-teeth','tooth-crack','bruxism','sedation' ]
```

`sitemap-main.xml` +13 URL (143→155) · `/guide/` 허브 카드 +1 · `/guide/regret` 허브에서 Task A 상호링크.

**검증 결과.** 프로덕션 신규 13p **전건 HTTP 200** · `.html`→301 정상 · JSON-LD 파싱 실패 0 · 마크다운 잔여 0 · 플레이스홀더 0 · 기존 12p 회귀 없음(chips 12→24 반영) · 사이트맵 5종 XML 유효 · **180p 제목 중복 0종** · 의료법 금지어 감사 통과.

**작업 스크립트** (`/home/user/gsc-work/`, 리포지토리 외부)
`skel.py`(implant.html을 4파트로 분해 → `skel/`) · `rdata1~3.py`(12주제 콘텐츠 데이터, 주제당 22키) · `gen.py`(12p 생성 + 조사 자동 선택 + `**bold**`→`<strong>` 변환) · `hub.py`(허브 ItemList·카드·사이트맵) · `sib.py`(기존 12p sibling 24종 확장) · `adata.py`+`genA.py`(Task A)

**후속 과제.**
1. **v5.45 재채점** — 2026-08-29 이후 GSC 데이터 필요. 신규 13p는 인덱싱에 2~4주 소요
2. **홈페이지 제목 개편(미착수)** — 631 브랜드 클릭 @46.71%. 리스크가 높아 3개 문안을 제시하고 사용자 선택을 받은 뒤 진행 예정
3. **`AggregateRating`/`Review` 스키마(보류)** — 의료법 제56조 검토 필요. 법률 확인 전 착수 금지
4. v5.43·v5.44 재채점 (아래 v5.44 항목 참조)

### v5.44 — /treatments/* 20p 제목·설명 CTR 개편 (2026-07-29)

**배경.** GSC 실측(2026-04-26~07-25, 상위 500페이지 9,048클릭/509,894노출, 사이트 평균 CTR 1.77%)에서 섹션별 CTR을 산출한 결과 `/treatments/*` 가 **26p / 207클릭 / 38,642노출 / 0.54%** 로 전 섹션 최하위였다. 같은 기간 `/column/*` 3.19%, `/guide/regret/*` 3.85%.

**원인.** 2026-02-12 투입된 제목 16개가 `{시술명} | 천안{시술명} | 서울비디치과` 형태였다. 키워드를 두 번 반복할 뿐 검색자에게 클릭할 이유를 제공하지 않는다. 90일 실측 CTR 0.24~1.20%.

**패턴 선정 근거 — 후회 훅을 쓰지 않은 이유.** 사이트 최고 성적 패턴은 `{주제} 후회 N가지와 부작용 총정리` (4.6~6.4%)이지만, `/guide/regret/*` 12p가 이미 cavity·crown·denture·gum·implant·invisalign·laminate·orthodontics·root-canal·scaling·whitening·wisdom-tooth 전 주제를 점유하고 있어 `/treatments/*` 에 동일 훅을 적용하면 **자기 잠식(cannibalization)** 이 발생한다. 대신 같은 `/treatments/` 폴더 내 검증된 승자 패턴을 채택:

| 기존 승자 | CTR | 구조 |
|---|---|---|
| `/treatments/invisalign-best` | 3.67% | 천안 인비절라인 컴프리헨시브 \| **무제한 장치교체 5년 보장** — 서울비디치과 |
| `/treatments/orthodontic-clarity-ultra` | 2.66% | 천안 클라리티울트라 교정 \| **3M 프리미엄 세라믹 브라켓** — 서울비디치과 |
| `/treatments/fixture-straumann-roxolid` | 1.94% | 스트라우만 록솔리드 SLActive \| **스위스 프리미엄 임플란트** — 서울비디치과 |

⇒ 채택 패턴: `{천안 시술명} | {서울비디치과 고유의 구체적 사실} — 서울비디치과`
⇒ 설명문: 실측 검색어를 첫 문장에 흡수(`…이 궁금하신가요?`) + 구체 사실 3개 + 전화번호

**3층 역할 분리 확정.**

| 층 | 인텐트 | 제목 형태 | 실측 CTR |
|---|---|---|---|
| `/guide/regret/*` | 공포·후회 | 후회 N가지와 부작용 총정리 | 3.85% |
| `/guide/*` | 정보 완전판 | 완전 가이드 2026 \| 비용·기간·과정 | 1.90% |
| `/treatments/*` | **예약 직전 · 차별점** | 천안 {시술} \| {고유 사실} | 0.54% → 개편 대상 |

**대상 20p** (모두 정적 HTML, `treatments/*.html` 직접 편집 · `ENC_SEO_OVERRIDES` 무관)

2026-02-12 코호트 16p: `inlay`(0.24%) `tmj`(0.33%) `root-canal`(0.48%) `cavity`(0.51%) `scaling`(0.64%) `wisdom-tooth`(0.75%) `bruxism`(1.00%) `resin`(1.20%) `crown` `bridge` `denture` `gum` `periodontitis` `prevention` `emergency` `whitening`(1.50%)
실측 부진 4p: `invisalign`(0.54%) `glownate`(0.74%) `implant`(0.72%) `fixture-osstem-ca`(0.55%)

**검색어 → 제목 반영 예** (GSC 실측)

| 페이지 | 최상위 실측 검색어 | 제목 반영 |
|---|---|---|
| `root-canal` | 신경치료 비용 26클릭/1,301노출 · 하면 안되는 이유 13/359 | 비용·과정 안내 · 발치 대신 살리는 |
| `wisdom-tooth` | 사랑니 발치 후 통증 75/2,742 | 발치 후 통증·붓기 관리 · 수면 발치 |
| `inlay` | 인레이 9/552 · 인레이 마취 5/82 (6.10%) | 원내 기공소 정밀 제작 |
| `cavity` | 충치 치료하면 안되는 이유 5/420 · 인접면 충치 과잉진료 6/52 | 지금 치료할 충치·기다릴 충치 구분 |
| `denture` | 틀니 가격 10/1,030 · 임플란트 틀니 가격 9/283 | 부분·완전·임플란트 틀니 비용 비교 |
| `crown` | 크라운 빠졌을 때 보관 11/48 (22.9%) | 지르코니아·골드 재질 비교 |

**교체 필드 — 페이지당 7개 (총 140개).** `<title>` · `meta[name=description]` · `og:title` · `og:description` · `twitter:title` · `twitter:description` · `og:image:alt`

> `og:image:alt` 은 1차 적용에서 누락됐다가 「본문 잔존 옛 제목」 검사에서 20/20 적발 후 추가 처리. 자동 검증 항목을 6→7필드로 확장.

**제약 준수.** 제목 35~55자(≤60) · 설명 107~122자(≤160) · 의료광고법 금지어 0건(최고/최상/1위/유일/완벽/보장합니다/100%/부작용 없/절대) · 사이트 전체 제목 중복 0건 신규 발생 · 후회 훅 침범 0건

**사실 관계 검증.** 서울대 **14인** (사이트 474곳 통일, 15인 표기 0건) · 6개 독립 수술실 · 원내 기공소 · 3D CT · 글로우네이트 10년 보증 · 미백 소프트 4.9만원/하드 8만원(부가세 별도) · 365일·야간 20시

**제외 대상과 근거.**

| 제외 | 개수 | 근거 |
|---|---|---|
| 7/28 재작성 페이지 (`/treatments/pediatric` `/guide/insurance` `/area/daejeon-laminate` `/guide/laminate` `/guide/implant` `/doctors/pediatric` `/pricing`) | 7p | **측정창(04-26~07-25) 종료 후 제목 교체 → 측정창 내 노출 0일.** 현재 수치는 옛 제목의 성적이며, 지금 손대면 신규 제목 효과를 영구 측정 불가 + 이미 작동 중일 제목을 덮어쓸 위험 |
| `/guide/regret/*` | 12p | 이미 3.85% 승자 |
| `/area/asan` `/area/osan` | 2p | 상위 500 검색어에 '아산'·'오산' 쿼리 **0건** → 데이터 없이 제목 작성 불가, 별건 진단 필요 |

> ⚠️ 이전 보고서의 「`/treatments/pediatric` 단독 +516」 은 **실행 불가**로 정정. A안 실제 규모는 +2,899 → **52p / 약 +1,532**.

**검증 결과.** 7필드 정합성 140/140 · 옛 제목 잔존 0 · JSON-LD 파싱 실패 0 · 속성 깨짐 문자 0 · 신규 제목 중복 0 · dist 반영 20/20 · 로컬 HTTP 200 + 제목 일치 **20/20**

**작업 스크립트** (`/home/user/gsc-work/`, 리포지토리 외부)
`queries.tsv`(500행) · `pages.tsv`(500행) · `analyze.py`(섹션 통계·손실 랭킹) · `deep.py`(노출 구간 층화 — Simpson's paradox 검증) · `newmeta.py`(20p 제목·설명 정의 + 길이·금지어 검사) · `apply.py`(7필드 일괄 교체, `--apply` 없으면 dry-run)

**후속 과제.**
1. **v5.43(백과사전 838p, 7/28 투입) + v5.44(20p, 7/29 투입) 재채점** — 2026-08-28 이후 GSC 데이터 필요. v5.43 오버라이드 35종 중 **29종(83%)이 측정창 내 노출 ≤2일**이라 현재 0.53% 수치는 옛 제목 성적임
2. `gsc-data.json` 갱신 — 붙여넣은 데이터에 `position`·기기·국가·일별 컬럼이 없어 `rank_distribution`/`devices`/`chart`/`monthly`/`growth` 재현 불가. GSC UI에서 「평균 게재순위」 열 활성화 + 기기/국가 탭 내보내기 필요 (미갱신 시 `gsc-report-dash.ts` 차트 4종 파손)
3. `/area/asan`(1,615노출/3클릭) `/area/osan`(705노출/4클릭) 별건 진단

### v5.43 — 백과사전 796개 제목 CTR 전면 개편 (2026-07-28)

**배경.** GSC 인텐트별 CTR 격차: 「단어 정의」 0.35% vs 「후회·부작용」 5.54% (16배). 백과사전 자동 제목 `${term} | 치과 백과사전 — 서울비디치과` 는 정보량이 0이라 노출은 나와도 클릭이 안 붙는다. 본문 심화(v5.42)보다 제목이 **답을 예고**하게 만드는 쪽이 남은 여력 대비 수익이 크다는 판단.

**왜 규칙 기반 일괄인가.** `src/data/gsc-data.json` 의 `dead_pages`/`high_perf_pages` 에 백과사전 페이지가 **0건**이고, 키워드-용어 매칭 최대 노출이 **65** (절치)에 불과해 데이터로 우선순위를 매길 수 없었다. 수동 선별이 불가능하므로 796개 전량을 콘텐츠 신호 기반으로 생성.

**구현** (`src/index.tsx`, 신설 함수·상수 11개)
- `encHasJong()` / `encIran()` — 받침 판정으로 `이란`/`란` 분기 (괄호 주석 제거 후 본체 끝 글자 기준)
- `encSignals()` — 본문 h3 구조 + 평문에서 신호 8종 추출 (증상·원인·치료·주의·장단점·적응증·과정·보험)
- `ENC_CAT_GROUP` — 23개 카테고리 → 성격 8군 (해부/용어/질환/시술/재료/비용/소아/관리)
- `encPick()` — term 해시 기반 결정적 선택 (같은 용어는 항상 같은 문구, 배포 간 흔들림 없음)
- `encHook()` — 군 × 신호 조합으로 답 예고 훅 생성
- `buildEncTitle()` — `○○이란? — <답 예고> | 서울비디치과`
- `encHookStmt()` + `ENC_HOOK_STMT_MAP` — 제목용 훅을 설명문에 넣을 수 있게 변환
- `buildEncDesc()` — short/본문 첫 문장 중복 제거 + 155자 예산 + 문장 경계 절삭

**🚨 의료광고법 안전장치**
- `ENC_CRITICAL = /암|종양|악성|괴사|BRONJ|백반|편평태선|골수염|전암|육종/` 를 `encHook()` **최우선 게이트**로 배치. 이게 없던 프로토타입에서 `구강 편평세포암이란? — 어떤 증상이면 치료가 필요한가`, `구강암이란? — 증상과 치료 시점` 같은 **공포 유발·치료 유인형 훅 18건**이 생성됐다. 게이트 통과 시 정보 전달형 4종(`어떤 질환이고 무엇을 살펴야 하나` 등)으로만 라우팅.
- 전 항목 최상급·효과 보장 표현 없음. 훅은 전부 의문·정보형.

**설명문 결함 3종 적발 → 수정**
1. `short` 와 본문 첫 문장 중복 ("…시술입니다. …시술입니다") → `norm()` 부분문자열 판정으로 중복 시 본문 첫 문장 건너뜀
2. 조사 오류 — `받기 전에 확인할 것` + `를` → 받침 분기로 `확인할 것을`
3. 274자 초과 → 155자 예산 + head 문장 경계 절삭
4. 의문형/부사형 훅이 `를/을 정리했습니다` 와 충돌 (`진단하나를`, `쉽게를`) → `encHookStmt()` 로 간접의문(`-는지`) 변환 + 부사구 5종 명시 치환

**검증 (로컬 전수 838페이지)**
- HTTP: **838/838 = 200**, non-200 0
- 구제목(`치과 백과사전 — 서울비디치과`) 잔존 **0**
- 중복 제목 **0** (자동 828건 기준. 나머지 10건은 원래 설계 — 실비 3종은 `/guide/insurance` 301, `치아 번호`는 전용 위젯 라우트, 슬래시 6종은 테스트 URL 인코딩 이슈였고 실제 전부 고유)
- 수동 오버라이드 **42종 전부 불변**
- 제목 길이 중앙 **35자** / max 58 / 60자 초과 **0**
- 설명 길이 중앙 **154자** / 자동생성분 160자 초과 **0** (초과 6건은 v5.43 이전부터 있던 수동 오버라이드)
- 어색 꼬리(`하나를 정리`/`것를`/`쉽게를` 등) **0**
- `og:title`·`og:description`·`twitter:*` 상속 40건 표집 불일치 **0**
- 중대질환 18종 게이트 이탈·위험표현 **0**
- 핵심 라우트 회귀 정상, 301/308 전부 **1홉**

**샘플** (자동 생성 규칙 결과)
```
협측이란? — 어느 부위를 가리키는 말인가 | 서울비디치과
구강암이란? — 무엇을 뜻하고 어떻게 진단하나 | 서울비디치과   ← 중대질환 게이트
지르코니아란? — 어디에 쓰이고 무엇이 다른가 | 서울비디치과
치경부 마모란? — 왜 생기나, 무엇을 조심하나 | 서울비디치과
구강건조증이란? — 증상부터 치료까지 한 번에 | 서울비디치과
```
> 주: `치주염`·`충치`·`스케일링 건강보험` 등은 2단계에서 수동 오버라이드로 승격되어 더 이상 자동 규칙 결과가 아니다.

---

### v5.43 2단계 — 상업 인텐트 상위 36종 수동 오버라이드 (2026-07-28)

**문제.** 1단계는 796개 전량에 「답 예고형」 골격을 씌웠지만, 훅은 카테고리·태그 기반 **일반 문구**다. 상업 인텐트가 강한 페이지(비용·재수술·부작용·보험)에서는 "얼마인가"가 아니라 **"얼마"** 자체가 클릭을 만든다.

**GSC 없이 우선순위를 정한 방법 (대리 점수 모델).** `gsc-data.json` 에 백과사전 페이지가 0건이라 노출 데이터를 쓸 수 없으므로, 본문 자체에서 상업 가치를 추정했다.

| 신호 | 가중치 |
|---|---|
| 비용 신호 (`비용·가격·만원·보험·본인부담`) | 5 |
| 후회·부작용 신호 (`실패·부작용·합병증·후회·재수술·통증`) | 5 |
| 비교 신호 (`vs·차이·비교·대비`) | 3 |
| 기간 신호 (`기간·수명·년·개월·주`) | 3 |
| 고단가 시술 용어 매칭 (임플란트·교정·틀니·라미네이트…) | +14 |
| 콘텐츠 두께 `3 × min(본문길이/1000, 4)` | 최대 +12 |
| 짧은 검색형 용어 (≤6자) | +4 |
| 순수 영문 약어 | −6 |

신호 카운트는 6에서 캡 후 절반 적용(스팸 문서 과대평가 방지). 796종 채점 결과 최상위 = **설측 교정 (64.0)**.

**작성 원칙.** 선정된 36종의 `detail` 본문을 전량 통독하고, **제목에 반드시 본문에 실재하는 숫자를 노출**했다. 없는 숫자는 쓰지 않았다.

```
설측 교정이란? — 정말 안 보이나, 발음은 어떻게 되나 (메탈 대비 2~3배) | 서울비디치과
치주 유지관리(SPT)란? — 안 받으면 5년 치아 상실률이 얼마나 오르나 | 서울비디치과
건강보험 적용 틀니란? — 만 65세 이상, 7년에 1회·본인부담 30% | 서울비디치과
골드 크라운이란? — 왜 아직도 쓰이나 (20~30년 사용·삭제 0.5~1.0mm) | 서울비디치과
임플란트 신경 손상이란? — 발생률과 회복 가능성은 어떻게 되나 | 서울비디치과
```

**선정 36종.** 설측 교정 · 임플란트 재수술 · 부분 틀니 · 치주 유지관리 · 임플란트 신경 손상 · 뼈이식 · 치주 재생술 · 건강보험 적용 틀니 · 라미네이트 종류 · 가이드 수술 · 임플란트 골유착 실패 · 골드 크라운 · 라미네이트 · 보철 수명 · 첫 상담 · 온레이 · 미니 임플란트 · 근관 재치료 · 임플란트 보증 · 임플란트 후 관리 · 보철물 탈락 · 사랑니 발치 · 풀지르코니아 · 틀니 건강보험 · 만성 치주염 · 충치 · 교정 재발 · 비용 상담 · 사랑니 · 치주염 · 임플란트 실패 · 치과 비용 · 치아 보험 · 즉시 임플란트 · 상악동 거상술 합병증 · 정밀 틀니

**제외 판단 2건.**
- `스케일링` — 슈퍼 콘텐츠 35종과 유일하게 겹침. 슈퍼 콘텐츠가 데이터 `detail` 을 마스킹하므로 본문 기반 제목의 근거가 불안정해 제외.
- `치주 유지관리` desc의 `완치` — 금지어 정규식에 걸렸으나 원문은 "치주염은 완치가 아닌 관리 질환"으로 **과장을 부정**하는 표현. 의료광고법상 안전 판정, 원문 유지.

**오버라이드 총계.** 기존 42 + 신규 36 = **78종** (키 교집합 0 확인).

**검증 (전부 통과).**
- 소스 diff **150 추가 / 0 삭제** — 자동 생성 함수·기존 42종 무변경이 소스 레벨로 증명
- 신규 36종 렌더 정합: 작성값과 **완전 일치 36/36**, `og:*`·`twitter:*` 상속 불일치 **0**
- 기존 42종 불변: 실질 불일치 **0** (`치아 번호` 1건은 `tooth-numbering.ts` 전용 라우트의 의도적 인터셉트)
- 838 전수 스윕: non-200 **0** · 중복 제목 **0** · 구제목 잔존 **0** · 어색 꼬리 **0**
- 내역 정합: 838 = 자동 757 + 오버라이드 78 + 실비 301 3
- 순수 자동 757종 형식 이탈 **0**, 꼬리 형식 이탈 **0**
- 길이: title median 36 / max 58 / **>60 = 0** · desc median 154 / >160 = 6 (전부 v5.43 무관한 기존 수동 오버라이드)
- 신규 36종 자체: title median 45 / **max 55** · desc median 131 / **max 145**
- 라우트 회귀 정상, 301/308 전부 **1홉**, 특례 10종(실비 3 + 치아 번호 + 슬래시 6) 전부 의도대로
- **프로덕션 검증**: 오버라이드 78종 전수를 소스 정의와 캐시버스터 대조 → 실질 불일치 **0** (`치아 번호` 1건은 전용 라우트 인터셉트). 96건 표집에서 non-200 0 · 중복 0 · 구제목 0 · 어색꼬리 0 · `og/tw` 불일치 0 · title max 55 · desc max 158
- 배포 `84469f7d` (2회 실패 후 성공 — 1회 `fetch failed`, 1회 샌드박스 프리즈로 리셋)

**다음 단계.** 효과 판정은 3~4주 후 GSC 신규 데이터로. `gsc-data.json` 갱신은 여전히 **CSV 2종(top-500 쿼리/페이지, 2026-04-26~07-25) 업로드 대기**.



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
- **Last Updated**: 2026-07-31 (v5.48)
- **v5.42 백과사전 최빈약 34항목 본문 심화 (127,886노출 / CTR 0.79% 구간 정면 타격)**: v5.41에서 배너(`ENC_GUIDE_NUDGE`)로 트래픽을 흘려보내는 처치만 했을 뿐 **본문 자체는 손대지 않았던** 구간을 채움. 진단 근거 — 백과사전 838항목이 사이트 최대 노출원(127,886)이면서 CTR 0.79%였고, 그 원인은 순위가 아니라 **"검색 결과를 눌러 들어와도 정의 한 줄뿐이라 바로 되돌아 나가는" 얇은 본문**. ①**빈약 순으로 34항목 선별 후 심화 원고 작성** — `<600자` 구간 7개를 포함한 최하위군. 전 항목 **의료광고법 안전 기준**으로 집필(최상급·1위·유일 배제, 효과 보장 표현 배제, 타 기관 비방 배제, 금액은 기존 공개 범위 내에서만 언급하고 "정확한 금액은 진단 후 안내"로 위임, 서술은 "~로 알려져 있습니다"·"~인 경우가 많습니다" 헤지 표현) ②**🚨 기존 적용 스크립트가 데이터 롤백 지뢰임을 사전 발견** — `scripts/apply-encyclopedia-updates.cjs`는 `sorted(glob(batch*.json))`으로 **모든 배치를 문자열 정렬 순 재적용**하는 구조라 `batch5`가 `batch46`보다 뒤에 정렬됨. 실행 시 **374항목이 구버전으로 퇴행**(법랑질 1,631자 → 828자, 총 1,535,595자 → 1,064,915자, -470,680자). 사용 거부 후 해당 스크립트를 `--i-know-this-overwrites-everything` 플래그 뒤로 하드 가드하고 헤더에 회귀 실측치를 문서화 ③**적용 도구를 `scripts/apply-enc-batch.cjs`로 일원화** — 배치명 명시 방식, 자동 백업(`public/data/.enc-backup-<ts>.json`), **detail 축소 시 거부**, 미존재 용어 무적용 보고, `--dry-run` 지원. `synonyms`는 Set 합집합 병합, `link`/`guide`는 키가 있을 때만 설정 ④**정본 파일 판별** — `data/encyclopedia.json`과 `public/data/encyclopedia.json`이 md5·크기가 다른 별개 사본이며, 런타임(`src/index.tsx` L4037 `new URL('/data/encyclopedia.json')`)과 전 스크립트가 읽는 **정본은 `public/data/` 쪽**. 다른 쪽을 고쳤다면 무음 실패였음 ⑤결과 — `batch47~50` 총 34항목 적용. **`<600자` 항목 7개 → 0개**, 총 본문 1,571,908자, **중앙값 1,804자**, 분포 `600-999: 12 / 1000-1499: 129 / 1500+: 697`
- **v5.42 백과사전 죽은 내부 링크 29건 수리 (`scripts/fix-enc-dead-links.cjs` 신설)**: 심화 작업 중 부수적으로 발견한 별건 버그. 백과사전 항목의 `item.link` 값 **117종을 전수 curl 테스트**한 결과 **18종이 404**였고 29개 항목이 이를 참조 중 — **링크 권위가 존재하지 않는 URL로 새고 있던 상태**. 죽은 경로: `/treatments/onlay`·`composite`·`fracture`·`extraction`·`fluoride`·`diagnosis`·`insurance`·`digital-implant`·`orthognathic`·`periodontal`·`gum-graft`·`gummy-smile`·`gum-recession`·`gum-depigmentation`·`replantation`·`trauma` + **URL 인코딩된 한글 경로 2종**(`/treatments/%EC%84%B8%EB%9D%BC%EB%AF%B9`, `/encyclopedia/%EC%88%98%EB%A9%B4-%EC%A7%84%EC%A0%95`). 각각 실존하는 최근접 페이지로 매핑(예: `onlay → /treatments/inlay`, `periodontal`·`gum-graft`·`gummy-smile` → `/treatments/gum-surgery`, `trauma`·`replantation` → `/treatments/emergency`, `insurance` → `/pricing`). **⚠️ 방법론 교훈 — 정적 분석은 거짓양성을 냄**: 파일시스템 존재 + `_redirects`/`index.tsx` grep 방식의 1차 스캔은 85종을 "죽은 것 같다"고 보고했으나, 실제 curl 결과 `/treatments/preventive`·`zirconia`·`/guide/dry-socket/`·`/about/patient-funnel` 등 다수가 **301로 정상 처리**되고 있었음. 301 체인과 catch-all 라우트 때문에 **curl 실측만이 유일한 판정 기준**. 스크립트는 멱등·자동백업·`--dry-run` 지원. 결과: `link` 값 117 → **101종 전량 정상**
- **v5.42a 슈퍼 콘텐츠 마스킹 3건 적발 → 유효 심화분 보전 (`batch51` 「불소 도포」 추가)**: v5.42에서 심화한 34항목 중 **3항목(레진·소구치·견치)이 실제로는 화면에 노출되지 않고 있었음**을 사후 렌더링 실측으로 적발. 원인 — `src/index.tsx` L4641 `const superC = ENC_SUPER[term] || ENC_SUPER_V534[term] || ENC_SUPER_V538[term]`, L4672 `const baseDetail = superC ? superC.detail : interlinkText(item.detail, ...)`. 즉 **`ENC_SUPER*` 29종에 등재된 용어는 JSON의 `detail`이 통째로 무시되고 슈퍼 콘텐츠로 대체**됨. 이 3항목에 쓴 원고는 파일에는 저장됐지만 **사용자에게는 단 한 글자도 도달하지 않는 상태**였음. ①**판정 방법론 교정** — 1차 프로브(고유 문장 1개 검색)는 `견치`를 "정상 노출"로 오판했음. 원인은 `interlinkText()`가 본문 중간에 `<a>` 태그를 삽입해 원문 문자열이 끊기기 때문. **태그 제거 + 공백 정규화 후 본문을 10등분해 9개 청크를 대조하는 방식**으로 교체하자 견치도 마스킹으로 확정(3/9). ②**대응 판단** — 슈퍼 콘텐츠 쪽이 더 우수(`ENC_SUPER_V534['소구치']` 3,213자 + `WIDGET_TOOTH_EXPLORER` 인터랙티브 위젯 + 비교표, `견치` 1,892자 + 동일 위젯)하므로 **슈퍼 콘텐츠를 유지하고 JSON 원고를 버리는 쪽**을 택함. 다만 그만큼 실효 심화 수가 줄어드므로 **슈퍼 29종과 기 작업 33종을 모두 제외한 잔여 최빈약 항목**에서 보충 — 후보 `치주 농양 902 / 불소 도포 912 / 프로바이오틱스 932 / 의도적 재식술 956` 중 **검색 수요와 보험 문의가 많은 「불소 도포」**(912자 → 2,798자, `guide: /treatments/pediatric`) 선정. 재광화 원리 / 바니시·겔·용액 3형태 / 도포 후 주의 4가지 / 권장 대상 / **실란트와의 혼동 교정** / 건강보험 기준은 시점·제품별 상이함을 명시하고 사전 확인 위임 ③**교훈 — 백과사전 데이터 수정 전에는 반드시 슈퍼 용어 29종과 대조할 것**: `grep -ohE "ENC_SUPER[A-Z0-9_]*\['[^']+'\]" src/routes/enc-super*.ts | sed "s/.*\['//;s/'\]//" | sort -u`
- **v5.42 검증**: `npm run build:fast` 성공(`dist/_worker.js` 1,046.74 kB, 중복키 경고 0) · `link` 전수 **101/101** 200|301|308 · `guide` 전수 **86/86** 200|301|308 · 항목 수는 838로 불변이므로 `sitemap-encyclopedia.xml`(859 URL) 재생성 불필요. **v5.42a 추가 검증** — 심화 35항목 렌더 **33/33 정상**(마스킹 확정 2종 제외, 태그제거 9청크 대조 방식) · `guide` 배너(`심층 가이드`) 및 href **전량 일치** · 신규 배치 내부 링크 **17/17 200** · 핵심 라우트 **21/21**(200 또는 308 정규화) · 301 체인 `/guide/overtreatment`·`/guide/itemized-bill` **각 1홉** · HEAD 대비 **퇴행 0항목** · `<600자` 0개 / `600-999` 9개 / `1000-1499` 129개 / `1500+` 700개, 총 1,576,045자, 중앙값 **1,805자**
- **v5.41 3️⃣ 과잉진료 자기잠식 봉합 (`/guide/overtreatment` → `/blog/dental-over-treatment-guide` 301 통합)**: v5.40에서 신설한 `/guide/overtreatment`가 **이미 존재하던 `/blog/dental-over-treatment-guide`(45클릭·8,151노출, 2026-03-09 발행)와 완전히 동일한 검색 의도를 놓고 경쟁**하던 구조를 해소. 신설 페이지를 살리고 기존 이력을 버리는 대신, **이력이 있는 URL을 남기고 신설 페이지의 깊이를 그쪽으로 이식**하는 방향을 택함. ①**`/blog/*`가 우리 레포가 아님을 먼저 규명** — 해당 경로는 `bdbddc.inblog.ai` 리버스 프록시(`<meta name="generator" content="inblog"/>`)로 원본 본문 편집이 불가능. 단 프록시 응답을 이미 가공하던 `cleanInblogHtml()` 훅(AEO 메타·스키마·커스텀 CSS·관련 진료 박스 주입에 사용 중)이 존재했고, 여기에 `reqPath`를 관통시켜 **슬러그별 심화 블록 SSR 주입 단계(step 7)**를 신설 ②`src/routes/blog-enrich.ts` 신설(17.8KB) — `BlogEnrichment{html,jsonld}` 인터페이스 + 슬러그 키 맵. 이식 내용: 진료비 세부내역서 4열 읽는 법 / 2차 소견 3STEP 카드 / **자가 체크 10문항 위젯**(바닐라JS, 저장·전송 없음, 4구간 판정) / 진료실 질문 목록 7개 / 공적 창구 5곳 / 반대편 함정(시기를 놓치는 손실) / 의료광고법 고지 ③JSON-LD **`HowTo` + `FAQPage`(10문항)** 를 `</head>` 직전 주입 — 프록시 페이지에 우리 스키마를 얹음 ④**앵커 충돌 방지** — inblog 원본 마크업과의 id 충돌을 피해 `#second-opinion`/`#detail-bill` → `#bd-second-opinion`/`#bd-detail-bill`로 개명 ⑤**리다이렉트 체인 제거** — `/guide/overtreatment`·`.html` 301 + `mapDeadGuideSlug`의 `overtreat`/`second-opinion`/`informed-consent`/`treatment-plan`/`estimate`/`itemized` 분기를 **중간 경유 없이 최종 목적지로 직행**(4/4 전량 `hops=1` 검증) ⑥사후 정리 — 내부 링크 22개 파일(가이드 허브 카드 1 + 가이드 계열 푸터 21) 최종 목적지로 재작성, `sitemap-main.xml` 143→142 URL, `guide/overtreatment.html`(64KB) 삭제. 검증: 프록시 응답 200 / 284,345B, `ot-checker` 1 · `HowTo` 1 · `FAQPage` 1 · `ot-q` 10
- **v5.41 🅐 CTR 구조 개편 (재제목 7종, 합계 53,537노출)**: 신규 GSC(2026-04-26~07-25, 9,670클릭/590K노출/CTR 1.6%/평균 7위)에서 **순위는 잡았는데 제목이 클릭을 못 만드는** 구간을 정면 타격. 실측 근거: 「후회·부작용·하지마」 인텐트 412클릭/7,437노출 = **5.54%** vs 「단어 정의」 64/18,494 = **0.35%** — **16배 격차**. 즉 병목은 순위가 아니라 **제목이 답을 예고하느냐**. ①`treatments/pediatric`(17,379노출·**CTR 0.03%**, 사이트 최대 이상치) → 「아이가 치과를 무서워할 때 — 수면치료 안전한가요? 유치 충치 꼭 때워야 하나요?」로 **질문형 전환** ②`doctors/pediatric`(4,567·0.13%) → 「우리 아이 담당 선생님은 어떤 분? — 진료 스타일까지 공개」 ③`guide/insurance`(9,478·0.75%) → 「되는 것 안 되는 것 \| 사랑니·신경치료 O, 임플란트·레진 X」로 **결론을 제목에 선공개** ④`guide/implant`(5,891·0.49%) → 「병원마다 가격이 다른 이유」 ⑤`guide/laminate`(5,658·0.23%) → 「emax vs 지르코니아, 몇 개를 해야 할까」. **동시에 `/guide/regret/laminate`와의 자기잠식을 끊기 위해 제목에서 「후회」를 제거**하고 비용·선택 정보 축으로 재포지셔닝 ⑥`pricing`(4,367·0.87%) → 「전체 공개 — 상담 전에 미리 확인하세요」 ⑦`area/daejeon-laminate`(6,197·0.10%) → 「후회 줄이는 확인 사항 5가지」. `scripts/retitle-ctr.cjs` 신설(멱등, `<title>`+`description`+`og:*`+`twitter:*` 6개 필드 동시 치환) — 7/7 반영 검증. 추가로 `ENC_SEO_OVERRIDES` **+8종**(치태·치과 본인부담금·리테이너·적응증·하악·CBCT·GBR·치주낭) — 작성 중 기존 v5.34/v5.38 오버라이드와 **중복 키 4건(발치·석션·설면·소구치) 발생을 빌드 경고로 포착**, 인터랙티브 위젯을 참조하는 **기존 항목이 더 우수하다고 판단해 신규 쪽을 철회**
- **v5.41 🅒 백과사전 → 가이드 유도 배너 16종 확대**: 백과사전 114개 페이지가 **127,886노출을 만들고도 CTR 0.79%**에 그치는 구조(정의만 읽고 이탈)를 개선. 노출 상위 용어 본문에 전용 가이드 유도 배너(`ENC_GUIDE_NUDGE`)를 SSR 삽입해 **정보 단계 트래픽을 전환 페이지로 흘려보냄**. 신규 16종 — 치아 미백·라미네이트·임플란트·교정·인비절라인·신경치료·스케일링·크라운·충치 → 대응 `/guide/regret/*`, 틀니 → `/guide/denture`, 사랑니 → `/guide/wisdom-tooth`, 치석·치주염·치은염 → `/guide/regret/gum`, 비급여 항목 → `/pricing`, 치과 진료비 영수증 → 과잉진료 블로그. ①**용어 키를 데이터로 검증한 것이 실수 3건을 막음** — `본인부담금`·`콘빔CT`·`치아교정`·`비급여`·`진료비 세부내역서`는 `encyclopedia.json`에 **존재하지 않는 키**였고(무음 실패), 실제 표기(`치과 본인부담금`·`CBCT`·`교정`·`비급여 항목`·`치과 진료비 영수증`)로 교정 ②검증 17/17 전량 의도한 목적지 연결(마커 `📘 전체 가이드`)
- **v5.41 🅓 일본어 클러스터 재제목 6종 (의료관광 인텐트)**: `/jp` 계열은 **CTR 6.0%로 사이트 최고 성과 구간**임에도 제목이 「費用」「料金」 같은 실제 검색어를 담지 못하던 문제 해소. `scripts/retitle-jp.cjs` 신설, 6/6 반영. ①`jp/guide/implant` → 「韓国インプラント 費用・オールオン4 料金ガイド 2026 \| 日本との比較・期間・保証」로 **オールオン4 검색어 흡수** ②`jp/guide/laminate` → 「1本いくら? 日本との費用比較・寿命・Glownate」 ③`jp/guide/invisalign` → 「何回渡韓が必要? パッケージ比較」로 **일본 환자의 실제 최대 관심사(도한 횟수)를 제목화** ④`jp/pricing` → 「韓国 歯科 料金表 2026」 ⑤`jp/travel-guide` → 「何泊必要? 空港からのアクセス・ホテル・通訳」 ⑥`jp/guide/index` → 「日本との比較」 축 명시
- **v5.41 하우스키핑**: `encyclopedia/index.html`이 실제 목록 837개를 담고도 「838개」로 표기하던 불일치 12곳 + `src/index.tsx` 1곳 수정
- **v5.40 🅐 과잉진료 신뢰 콘텐츠 신설 (`/guide/overtreatment`)** ⚠️ **v5.41에서 폐지 — 이 URL은 현재 `/blog/dental-over-treatment-guide`로 301되며, 아래 콘텐츠는 `src/routes/blog-enrich.ts`를 통해 해당 블로그 페이지에 주입됨. 사유: 동일 인텐트의 기존 페이지(45클릭/8,151노출)를 사전 확인하지 않고 신설해 자기잠식이 발생함.** GSC 실측 기준 콘텐츠가 아예 없던 채로 순위만 잡고 있던 구간을 정면으로 채움 — 「치과 과잉진료」 29노출 10.6위, 「치과 과잉진료 신고 후기」 7노출 13.0위, 합계 36노출·전용 페이지 0. `guide/overtreatment.html`(64KB) 신설. ①**의료광고법 안전 프레이밍이 설계의 출발점** — 이 주제는 조금만 어긋나도 타 의료기관 비방으로 읽히므로, 페이지 최상단과 최하단에 "특정 병원·의료진을 지목·평가하지 않으며, 같은 상태에서도 의학적으로 타당한 서로 다른 계획이 존재한다"는 고지를 배치하고 전 본문을 **일반 판단 기준** 서술로만 구성 ②**「치료가 많다 = 과잉」 전제를 먼저 해체** — 검사 범위·치료 시점 기준·계획의 시간 지평 3가지 차이로 계획이 갈리는 구조를 설명하고, 판별의 축을 "치료의 양"이 아닌 **"설명의 질"**로 이동 ③**환자가 실제로 쓸 수 있는 도구 중심 구성** — 판단 기준 7가지(각 항목마다 진료실에서 그대로 읽을 질문문 포함) / 진료비 세부내역서 4개 열 읽는 법 + 4단계 대조 절차 / 2차 소견 3단계(자료 확보 → **앞선 견적을 먼저 말하지 않고 백지 상태로 질문** → 두 계획 5축 비교) / 그대로 캡처해 쓰는 질문 목록 7개 ④**자가 체크 위젯 10문항**(바닐라JS, 저장·전송 없음) — 4구간 판정과 다음 단계 앵커 링크 제공 ⑤**공적 창구 5곳 안내**(심평원 진료비 확인 요청 / 의료분쟁조정중재원 / 소비자원 1372 / 보건소·복지부 129 / 국민신문고) + 공개 게시판 실명 게시의 역위험 경고 ⑥**반대편 함정도 명시** — 실제로 더 흔한 손실은 과잉 의심으로 시기를 놓치는 쪽이라는 점을 §07로 별도 배치해 균형 유지 ⑦**본문 가격 표기 0건** — 비급여는 기관 자율 책정이라는 원리만 설명하고 금액은 `/pricing` 링크로 위임 ⑧JSON-LD 4블록(`Article` / `BreadcrumbList` / **`HowTo`**(2차 소견 3단계) / `FAQPage` 10문항) ⑨**「라미네이트 부작용」류 의도는 흡수하지 않고 `/guide/regret/laminate`로 유도** — 기존 후회 백서 24개 하위 페이지와의 자기잠식 방지 ⑩라우트 등록(`/guide/overtreatment` + `.html` 301), `EXISTING_GUIDES`·`mapDeadGuideSlug` 키워드 매핑(`overtreat`/`second-opinion`/`itemized` 등) 추가, `sitemap-main.xml` 등재(143 URL), 가이드 허브 카드 신설, 후회 백서·실비 가이드 관련 링크 + 가이드 계열 21개 파일 푸터 링크 추가
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

---

## v5.49 — 원장 컬럼 전면 수정 (2026-08-01 배포)

**배포**: https://87c5f240.seoul-bd-dental.pages.dev → https://bdbddc.com
**커밋**: `05399139` (v5.48 글로우네이트 12막 리뉴얼 동반 배포)

### 감사 배경
`/column/` 는 CTR **3.19%** 로 사이트 전 섹션 1위(43 URL / 1,791클릭 / 56,062노출).
컬럼 1건당 41.6클릭 = treatments(8.0)의 5.2배. 그런데 기술적 결함이 성과를 갉아먹고 있었음.

### 수정 내역

| 구분 | 문제 | 조치 | 결과 |
|---|---|---|---|
| P0 | JSON-LD 파싱 실패 **6페이지** (Article 5 + BreadcrumbList 1 소실) | FAQ 스키마 문자열 수동조립 → `JSON.stringify`, `attrEsc`/`jEsc`/`htmlText` 헬퍼로 전 구간 방어 | 실패 **6 → 0건** |
| P0 | description **2건 소실** (`"` 로 시작하는 metaDescription 이 HTML 속성 조기 종료) | `attrEsc` + 3단 폴백 (`metaDescription \|\| plainExcerpt \|\| title`) | 74/74 정상 |
| P0 | category 빈값 2건 | `CATEGORY_FIX` | 0건 |
| B | 컬럼 **69/74 인링크 0** (관련 컬럼이 최신 5개 고정) | `relatedColumns()` — 슬러그 토큰 + 한글 2-gram 자카드 ×10 + 카테고리 +0.4 + 저자 +0.15, 부족분은 오래된 순 filler | 고아 0, 5→6개 노출 |
| B | 정적 페이지 → 개별 컬럼 딥링크 **7개**(전부 임플란트) | 205개 정적 HTML `</main>` 직전 딥링크 블록 주입, 슬러그 부스트 40키 + 회전 오프셋 분산 | **609 링크 / 205-205 커버 / 고아 74→0 / 최대 29회** |
| B | `COLUMN_TREATMENT_MAP` 임플란트 편중(15키) | 12개 토픽 클러스터 60+키로 확장, 매칭 소스에 metaTitle·slug·본문 400자 추가 | 2,313 → 8,991자 |
| C | Claude 프롬프트 지시문 본문 노출 (`여기서 인용 가능한 한 줄을 드리겠습니다.`×50 등 15계열) | 계열별 변형 회전 치환 (deterministic) | **348회 / 72개 컬럼**, 잔존 0, 최다 변형 10건 이하 |
| D | 썸네일 **44.5MB** (avg 630KB, max 5.7MB), R2 `/api/images` 경유 → Worker 호출 | JPEG q82 + WebP q78 (≤1376px) → `images/column/` 정적 CDN 이관, `webpOf`/`picture()` 로 4개 렌더 지점 `<picture>` 전환 | **JPEG 2.2MB(-95%) / WebP 0.8MB(-98%)**, PSNR 47.3/45.1dB, Worker 우회 |
| 기타 | 딥링크 블록 인라인 style 244KB | `css/site-v5.css` `.col-deeplinks` 이관 + 492파일 캐시버스팅(`?v=0e95e6eb`) | 인라인 994.7KB 원복 |
| 기타 | RSS 발견 경로가 HTML `rel=alternate` 뿐 | `robots.txt` 에 `RSS:` 선언 | — |

### 프로덕션 검증
- JSON-LD 파싱 실패 **0건** (기존 실패 6페이지 전수 재검)
- description 6/6 정상 · `<picture>` WebP 6/6 서빙
- 썸네일 `.jpg` 108KB / `.webp` 54KB (기존 5.7MB → -98%)
- `treatments/glownate` 딥링크 4개 · `area/asan-implant` 3개
- `scripts/audit.py` 치명 이슈 **0건**

### 데이터 파이프라인
컬럼 본문·메타는 R2 `bdbddc-images/data/columns.json` (74건 전부 `published`).
세탁된 페이로드는 `npx wrangler r2 object put ... --remote` 로 업로드.
수정 72건의 `updatedAt` 갱신 → `sitemap-columns.xml` lastmod 변경으로 재크롤 유도.

### 남은 과제
- GSC 미노출 33건 (소아 6/6 전멸, 예방 3, 턱관절 3, 외상 3, 보철 7) — IndexNow ping 또는 sitemap 재제출
- 컬럼 title 접미사 17자 축약 (62건이 32자 진입 가능하나 CTR 3.19% 성과 중 → 신중)
- 컬럼 H2 부재 17건 (H1→H3 점프), 작성자 편중 (문석준 73 / 현정민 1)
- 본문 내 인라인 링크 0/74, 본문 이미지 0/74

## v5.56 — 라미네이트 클러스터 정리 (2026-08-03)

### GSC 실측 (2026-05-01~07-31)
라미네이트 관련 페이지가 **13개**, 노출 25,717 · 클릭 146 → 합산 CTR **0.57%**.
노출은 사이트 최상위권인데 클릭이 안 나오는 최악의 구간이었다.

| 페이지 | 클릭 | 노출 | CTR |
|---|---|---|---|
| /area/daejeon-laminate | 6 | 6,197 | **0.10%** |
| /guide/laminate | 13 | 5,658 | **0.23%** |
| /cn/guide/laminate | 3 | 2,638 | 0.11% |
| /treatments/glownate | 14 | 1,891 | 0.74% |
| /guide/regret/laminate | 26 | 1,940 | 1.34% |
| /blog/* (inblog.ai 프록시, 5개) | 66 | 7,393 | 0.89% |

### 진단
1. **설명문이 전부 길었다** — 123~132자. SERP 실측 절단선 80자를 40~50자씩 초과.
   잘린 자리에 정작 중요한 숫자(80만원·10년 보증)가 있었다.
2. **`/area/daejeon-laminate` 가 클러스터의 고아였다** — 인바운드 내부링크 **0개**.
   노출 6,197로 클러스터 1위인데 사이트 어디에서도 이 페이지로 가는 길이 없었다.
3. **앵커-링크 오배선 7건** — `treatments/glownate` 의 지역 칩이 "대전 라미네이트"라고
   써놓고 링크는 `/area/daejeon`(일반 지역 페이지)으로 갔다. 라미네이트 전용
   `/area/daejeon-laminate` 가 멀쩡히 있는데도. 대전·아산·세종·청주·당진·공주·평택 7개 전부.

### 조치
**① 메타 재작성 (4페이지)**
| 페이지 | title | desc |
|---|---|---|
| /guide/laminate | 27자 유지 | 127 → **66자** |
| /area/daejeon-laminate | 28자 유지 | 123 → **71자** |
| /guide/regret/laminate | 39 → **29자** | 126 → **61자** |
| /treatments/glownate | 32자 유지 | 132 → **70자** |

og:title / twitter:title 자동 동기화. 잘려 나가던 숫자를 전부 앞으로 당겼다.

**② 역할 분리 + 상호링크 (4×4 매트릭스 전면 연결)**
```
          →  guide  daejeon  regret  glownate
guide         —       1        2        3
daejeon       1       —        1        5
regret        2       1        —        2
glownate      3       1        2        —
```
`daejeon` 인바운드 0 → **3**. 고아 해소.
- `/guide/laminate` = 정보(가격·종류·수명) · `/guide/regret/laminate` = 불안(후회·부작용)
- `/area/daejeon-laminate` = 지역·접근성 · `/treatments/glownate` = 전환(진료·예약)

**③ 앵커 오배선 7건 교정 + 천안 칩 자기참조 제거**
`/treatments/glownate` 자체가 천안 라미네이트 본진이라 `<a>` → `<span>` 강조로 전환.
전역 재스캔 결과 **잔여 오배선 0건**.

### 손대지 않은 것
- `/blog/*` 5개 (노출 7,393) — **inblog.ai 외부 CMS 프록시**라 리포에서 수정 불가.
  `src/index.tsx:2741 app.all('/blog/*')` 가 `bdbddc.inblog.ai` 를 그대로 중계한다.
  고치려면 inblog 관리자에서 직접 작업해야 한다. → 원장님께 별도 보고.
- `/cn/guide/laminate` (노출 2,638) — 중국어 페이지. 중문 카피는 별도 검토 필요.

### 배포
`ac45885e.seoul-bd-dental.pages.dev` → https://bdbddc.com
라이브 검증: 4페이지 HTTP 200 / title·desc 전부 절단선 이내 / 오배선 0 / 지역-라미 링크 7건 정상.

## v5.57 — 하루 1건 잠금 (2026-08-03)

### 사고: 8/3 하루에 2편 발행
- 01:45 「교정 비용」 — 누락분 수동 보충 curl
- 02:26 「치과 실비」 — 엣지 100초 상한을 **재현 검증**하려고 크론 워커
  fetch 핸들러를 호출했는데, 그게 실제 발행까지 완주해버림

원인은 크론 중복이 아니라 **사람(운영자)의 이중 호출**이었다.
v5.55 에서 크론 워커에 넣은 중복 확인은 *호출자 쪽* 방어라,
사람이 `curl` 로 엔드포인트를 직접 때리면 그대로 통과한다.

### 수정: 서버측 최종 방어선
`POST /api/cron/publish-column` 이 발행 직전 R2 `columns.json` 을 읽어
**오늘(KST) 발행분이 있으면 즉시 스킵**한다.

```json
{"ok":true,"skipped":"already-published-today",
 "slug":"orthodontic-cost-factors-korea","createdAt":"2026-08-03T01:45:46.262Z"}
```

- `dry=1` 리허설은 발행이 없으므로 통과
- 의도적 추가 발행(누락분 보충)은 **`force=1` 을 명시**해야 한다
- R2 를 못 읽으면 잠그지 **않는다** — 발행이 통째로 멈추는 쪽이 더 나쁘다
- 파일: `src/routes/column-auto-api.ts` (`publishedTodayKST()` + 잠금 분기)

**라이브 검증**: 발행 요청 → HTTP 200 `skipped` **0.29초** 반환, 컬럼 79편 불변 ✅

> 8/3 두 편은 삭제하지 않고 그대로 둔다(원장님 지시).
> 8/4 09:00 부터 하루 1편 페이스로 복귀.

## v5.55 — 자동발행 "조용한 유실" 근본 해결 (2026-08-03)

### 증상
8/2·8/3 자동발행이 안 됐다. 그런데 Cloudflare 대시보드에는 **에러가 하나도 없었다.**
크론 워커 status = `success`. 큐도 정상. 사이트도 정상.

### 실측 (workersInvocationsAdaptive GraphQL)
| 실행 | wallTime | status | 실제 발행 |
|---|---|---|---|
| 2026-08-02 00:00:02 UTC | **120.5초** | success | ❌ 0건 |
| 2026-08-03 00:00:02 UTC | **125.1초** | success | ❌ 0건 |

동일 엔드포인트 curl 직접 호출 → **HTTP 524 / 125.096초** (소수점까지 일치).
`?dry=1`(썸네일 없음) → **HTTP 200 / 69.8초**, 게이트 pass.

### 근본 원인
```
본문 생성 64초 + 썸네일 생성·R2 커밋 61초 = 125초
                    ↓
Cloudflare 엣지 응답 상한(~100초) 초과 → 524 로 강제 종료
                    ↓
발행 커밋 '직전'에 죽음 → 컬럼 유실
                    ↓
워커는 "fetch 가 응답(524)을 받았으므로" 예외 없이 정상 종료 → status: success
                    ↓
대시보드에 아무 에러도 안 보이는 '조용한 유실'
```
`scheduled()` 는 엣지 상한을 받지 않지만, **그 안에서 나가는 `fetch()` 는 엣지를 통과**하므로 상한에 걸린다. 이게 함정이었다.

### 대책 — 한 요청을 두 개의 짧은 요청으로 분할
```
① POST /api/cron/publish-column?nothumb=1              본문만 발행    (~70초)
② POST /api/cron/thumb?slug=…&hint=…&patch=1           썸네일+패치   (~55초)
```
- 각 단계가 100초 미만 → 524 원천 차단
- ①이 실패하면 ②를 아예 시도하지 않는다 (`verdict === 'pass'` 확인)
- ②만 실패하면 `published-nothumb(slug,status)` 로 기록 — 본문은 살아있다
- `ctx.waitUntil()` 금지 유지 (응답 후 수명 ~30초로 끊김, 실측 2회)

### 복구 결과
| 항목 | 결과 |
|---|---|
| 크론 워커 재배포 | ✅ Version `5150b68f` / schedule `0 0 * * *` |
| CRON_SECRET | ✅ 존재 확인 (REST) |
| 8/3 컬럼 ① | ✅ `orthodontic-cost-factors-korea` 「교정 비용, 무엇이 결정하고 어디까지 드나요」 |
| 8/3 컬럼 ② | ✅ `chigwa-silbi-dental-claims-coverage-korea` 「치과 실비, 어디까지 보장되고 어떻게 청구하나요」 |
| 총 컬럼 | 77 → **79편** |
| 썸네일 보유 | **79/79 (100%)** |
| 누락 썸네일 보충 | ✅ `/api/cron/thumb` 로 1건 재생성 (239 KB JPEG, HTTP 200) |
| 라이브 렌더 | ✅ 2편 모두 HTTP 200 / og:image 3개 |

### 교훈 (다음에 또 당하지 않기 위해)
1. **`status: success` 를 믿지 마라.** fetch 가 524를 *받아도* 워커는 성공으로 끝난다.
2. **wallTime 을 봐라.** 100초 근처면 엣지 상한 의심.
3. 크론 안의 `fetch()` 도 엣지 상한을 받는다. `scheduled()` 의 15분은 워커 자신의 수명일 뿐.
4. 무거운 파이프라인은 **처음부터 짧은 단계로 쪼개서** 설계한다.

## v5.55 — 크론 자동발행 근본수정 · 라미네이트 클러스터 정비 (2026-08-03)

### 1. 자동발행 크론 — 8/1·8/3 미발행 원인 규명 및 수정
Cloudflare Analytics(GraphQL `workersInvocationsAdaptive`) 실측:

| 실행시각(UTC) | 상태 | duration | 실제 발행 |
|---|---|---|---|
| 2026-08-03 00:00:02 | success | 125초 | ❌ 0건 |
| 2026-08-02 00:00:02 | success | 121초 | ❌ 0건 |

크론은 **매일 정상 실행**되고 있었다. 문제는 소요시간이었다.
크론 워커 → `https://bdbddc.com` 호출은 Cloudflare **엣지를 통과**하므로
HTTP 트리거 요청 상한 **약 100초**에 걸린다. 한 건 생성은 85~120초라
100초를 넘긴 날은 엣지가 **524로 끊고 생성물을 버렸다**. 워커 로그에는
`success` 로 남아 겉보기엔 정상이라 8/1·8/3 손실을 놓쳤다.

**수정**: `scheduled()` 는 엣지 상한을 받지 않으므로 최대 **3회 재시도**.
매 재시도 전 `/api/columns` 로 **오늘(KST) 발행분 존재를 확인**해 중복 발행을 막는다
(524로 끊겨도 origin 은 끝까지 돌아 발행에 성공하는 경우가 있음).
- 파일: `scripts/cron-worker/index.ts` (`trigger` → `attempt` + `alreadyPublishedToday` + 재시도 루프)
- 배포: `bdbddc-column-cron` Version `5150b68f`, schedule `0 0 * * *` 유지
- 8/3 누락분 2편 수동 보충 → 총 **79편**

### 2. 라미네이트 클러스터 정비 (GSC 노출 25,000+ / CTR 0.1~1.3%)
13개 페이지가 같은 질의를 나눠 갖고 있었다. `/blog/*` 4편은 inblog.ai 외부 CMS
프록시(`app.all('/blog/*')`)라 리포에서 수정 불가 → **우리 소유 4개**에 집중.

| 페이지 | 노출 | 기존 CTR | 조치 |
|---|---|---|---|
| `/area/daejeon-laminate` | 6,197 | 0.10% | title 28자·desc 123→71자, 클러스터 인바운드 0→3 |
| `/guide/laminate` | 5,658 | 0.23% | title 27자·desc 127→66자 (가격 앵커 전진배치) |
| `/guide/regret/laminate` | 1,940 | 1.34% | title 39→29자(절단 해소)·desc 126→61자 |
| `/treatments/glownate` | 1,891 | 0.74% | desc 132→70자 |

- **desc 4건 모두 80자 초과 → SERP 절단 중이었다.** 전부 61~71자로 재작성
- og:title / twitter:title 자동 동기화
- **상호링크 4×4 매트릭스 전 칸 채움** — `/area/daejeon-laminate` 는 클러스터 내
  인바운드가 **0개인 고아**였다
- 🔴 **지역 링크 오배선 7건 발견·교정**: `treatments/glownate.html` 의 앵커 텍스트는
  "대전/아산/세종/청주/당진/공주/평택 **라미네이트**" 인데 링크는 일반 지역 페이지
  (`/area/daejeon`)로 가고 있었다. 라미네이트 전용 페이지(`/area/{city}-laminate`,
  20개 존재)가 있는데도 링크주스가 엉뚱한 곳으로 샜다. 전역 스캔 후 잔여 0건 확인

**라이브 검증**: 4/4 HTTP 200 · title 27~32자 · desc 61~71자 · og 동기 4/4 ·
클러스터 내부링크 8/7/5/10개 · 오배선 잔여 0

## v5.54 — 중복 URL 통합 · 치아차트 SSR · 가이드 문맥링크 · pediatric 응급수정 (2026-08-02)

배포: https://a6d302c1.seoul-bd-dental.pages.dev (라이브 https://bdbddc.com)

### 1. 백과사전 중복 URL 18개 → 301 통합 (838 → 820항목)
같은 개념이 여러 URL로 흩어져 서로 순위를 나눠 갖고 있었다. GSC 실측으로 확인된 대표 사례:

| URL | 클릭 | 노출 | CTR |
|---|---|---|---|
| /encyclopedia/치아 번호 | 38 | 6,296 | 0.60% |
| /encyclopedia/치아 번호 체계 | 13 | 4,410 | 0.29% |
| /encyclopedia/치식 | 4 | 1,061 | 0.38% |
| **합계** | **55** | **11,767** | **0.47%** |

`ENC_MERGE_301` (src/index.tsx) 로 은퇴 용어 → 대표 용어 301. 은퇴 용어는 대표 항목의
`synonyms` 로 흡수해 사이트 내 검색·동의어 301 경로를 유지한다.

- 의미 중복 7쌍: 치아 번호(←치아 번호 체계·치식) / GBR(←GBR (골유도재생술)·골유도 재생술(GBR)) /
  e.max(←e.max (이맥스)) / 복합레진(←복합 레진) / 글래스 아이오노머(←글라스 아이오노머) /
  PRF(←PRF (혈소판 풍부 섬유소)) / 치주 포켓(←치주낭)
- 띄어쓰기 변형 9쌍: 에어샤워·정기검진·노인 구강관리·전달마취·침윤마취·소아 진정 치료·점액 낭종·치주판막수술·행동조절
- **본문 승계 규칙**: 은퇴 항목의 detail 이 대표의 1.3배 이상이면 대표가 그 본문을 물려받는다.
  → GBR 1,845자 → 3,091자 / e.max 1,167자 → 1,779자 (콘텐츠 손실 없이 URL만 통합)
- `sitemap-encyclopedia.xml` 재생성 844 URL (용어 820 + 카테고리 23 + 인덱스 1)
- ENC_SEO_OVERRIDES 의 죽은 항목('치식','치아 번호 체계') 제거, 카운트 문구 837/838 → 820

### 2. 치아 번호 차트 SVG를 SSR로 (src/routes/tooth-svg.ts 신규)
기존에는 `<div id="tn-chart"></div>` 가 빈 채로 나가고 브라우저 JS가 채웠다.
→ **GPTBot·PerplexityBot·ClaudeBot 등 JS를 실행하지 않는 크롤러에게 이 페이지의 핵심 자산이 통째로 안 보였다.**

- `renderToothSVG(mode, notation, selected)` 를 서버에서 실행해 초기 SVG를 HTML에 굽는다.
- 클라이언트 `BDToothChart.render()` 는 그대로 하이드레이션 담당 (인터랙션·모드 전환).
- ⚠️ **좌표 계산식·toFixed 자릿수를 건드리지 말 것.** 클라이언트가 마운트 직후 innerHTML을
  덮어쓰므로 출력이 다르면 화면이 튄다. 회귀 테스트로 `renderSVG` 와 **18/18 조합 바이트 일치** 검증.
- `TOOTH_SVG_STYLE` 을 `<head>` 에 선주입 — 클라이언트는 `id="bdtc-style"` 중복을 자동 회피.
- 라이브 결과: 페이지·위젯 모두 `<svg>` 1개 / 치아 `<g>` 32개 / `aria-label="FDI NN번 …"` 32개.

### 3. 컬럼 문맥 내부링크에 /guide/* 38종 추가
GSC 실측 `/guide/` 24편 = 111,990노출 CTR 1.89%, `/guide/regret/*` 는 CTR 5%대인데
컬럼에서 들어오는 내부링크가 **0개**였다.

- `COL_TREATMENT_LINKS` 에 가이드 항목 추가 (money 티어 동일 → 같은 티어 내 **길이 내림차순**이라
  '라미네이트 후회' 같은 긴 구가 '라미네이트' 보다 먼저 잡힌다. 진료 페이지 링크를 뺏지 않는다.)
- 링크 상한 8 → 11
- 회귀 테스트(77편): 총 437 → **465개** / guide 52 · treatments 140 · encyclopedia 273 / **중첩 `<a>` 0**

### 4. /treatments/pediatric title·desc 응급 수정
GSC 실측 **17,434노출 / 5클릭 / CTR 0.03%** — 사이트 최대 낭비 지점.

- title 29자: `천안 소아치과 | 전문의 3인 · 주말·공휴일도 진료`
- desc 79자: `서울대 출신 소아치과 전문의 3인. 웃음가스·수면치료, 실란트·불소도포, 영유아검진, 주말·공휴일 진료. 천안 불당동 ☎041-415-2892`
- og/twitter title·description, ai-summary 동기화
- ⚠️ CTR 0.03%는 제목만의 문제가 아닐 가능성이 크다(평균 순위가 낮으면 제목을 고쳐도 한계).
  4주 후 GSC에서 **CTR과 평균 게재순위를 분리해서** 확인할 것.

### 5. 컬럼 오타 슬러그 교정
`/column/periimplnatitis` → `/column/peri-implantitis` 301 (`COL_SLUG_301`).
R2 의 slug 를 정타로 바꾸고, **목적지가 실제로 published 상태일 때만** 리다이렉트하도록 방어했다
(코드만 먼저 배포돼도 기존 URL이 죽지 않는다).

### 검증 (라이브)
```
백과 301 12/12 통과 · 대표 페이지 7/7 200
치아 번호 페이지 119,652B | <svg>1 | 치아<g>32 | aria-label 32 | bdtc-style 선주입 O | 변환표 2
위젯 28,472B | <svg>1 | 치아<g>32
pediatric title 29자 / desc 79자 / og 동기화 O
periimplnatitis 301 → peri-implantitis 200
sitemap-encyclopedia 844 URL · 은퇴 용어 잔존 0
/data/encyclopedia.json 라이브 820항목 · /encyclopedia/ 200
```

## v5.53 — 컬럼 SEO 실측 감사 + A~F 개선 (2026-08-02)

### 감사 방법
라이브 페이지(`/column/implant-pain-duration`)를 curl로 긁어 실측 + R2 `data/columns.json` 77편 코퍼스 통계.

### 실측 결과 — 이미 갖춘 것
canonical 자기참조 · `robots: max-snippet:-1, max-image-preview:large` · JSON-LD 4블록 전부 파싱 성공
(Article/BreadcrumbList/FAQPage(Q7)/Dentist) · author Person + url + sameAs + jobTitle · datePublished/dateModified
· citation ScholarlyArticle · OG/Twitter summary_large_image · sitemap 인덱스 → `sitemap-columns.xml` 78 URL
lastmod 100% · img alt 9/10, WebP 9, lazy 7 · 68KB / TTFB 0.289s

### 실측 결과 — 빠져 있던 것 (전부 이번에 처리)
| # | 문제 | 실측 | 조치 |
|---|---|---|---|
| A | **본문 문맥 내부링크 0개** | 77편 전부 0 | 렌더 시점 자동 링커 → **총 437개(평균 5.7)** |
| B | 목차·앵커 없음 | TOC 0 | h2/h3 `id="sec-N"` 자동 + 목차 카드 → **앵커 658개, 미생성 0편** |
| C | `@type: Article` (의료 타입 아님) | — | `["Article","MedicalWebPage"]` + reviewedBy/lastReviewed/wordCount/about/specialty/audience |
| D | 최종 수정일 화면 미노출 | 0회 | `최종 수정 …` + `… 감수` 배지 |
| E | h2 없는 글 (h1→h3 점프) | **17편** | h3→h2 자동 승격 → **17편 교정** |
| F | sitemap lastmod 전부 동일 | 72편이 `2026-08-01` | updatedAt을 실제 발행일로 복원 → **고유 날짜 69개** |
| + | `/rss.xml` 404 | 404 | `/feed.xml` 301 |

### 자동 링커 규칙 (`autolinkColumnBody`)
- 대상: 진료 페이지 16종(수익 페이지 우선) → 백과사전 838개(3자 이상)
- 텍스트 노드만 치환. `<a>` / `<h1~h6>` / `<sup>`(인용 위첨자) 내부는 depth 카운터로 제외
- 긴 용어 우선 정렬 + 플레이스홀더 치환 → **중첩 `<a>` 0건** (77편 전수 검증)
- 용어당 1회, 글당 최대 8개. 초일반 용어 8개는 스톱리스트

### 파이프라인 순서 (바꾸면 깨짐)
`enrichCitations` → `promoteHeadings`(E) → `autolinkColumnBody`(A) → `buildToc`(B)
링크를 먼저 심으면 제목 정규식이 `<a>`를 물고, 앵커 ID를 먼저 달면 링커가 제목을 못 거른다.

### 보류
- desc 80자 초과 75편은 재작성하지 않음 — 구글 desc 재작성률이 높아 회수 대비 품이 큼. 신규 발행분만 프롬프트에서 조임.
- `AggregateRating`/`Review` — 의료법 §56 법률 검토 필요.

### 배포
https://bf518ddb.seoul-bd-dental.pages.dev → https://bdbddc.com

---

## v5.52 — 논문 인용 학술지 형식 승격 (2026-08-02)

렌더 시점 변환(`enrichCitations` / `renderRefs`, src/index.tsx)이라 **R2 원문은 건드리지 않고
컬럼 77편에 동시 적용**된다. 본문 안의 서지 덩어리를 골드 위첨자 번호로 압축하고,
글 끝에 「참고문헌」 카드를 자동 생성한다.

### 흡수하는 인용 표기 5종 (기존 74편이 제각각이었다)
| 형식 | 실측 예 |
|---|---|
| 대괄호 + `DOI:` | `[Tan WC et al., 2014, J Clin Periodontol, DOI: 10.1111/jcpe.12248]` |
| 괄호 + `DOI:` | `(Bui 2003, JOMS; DOI: 10.1016/j.joms.2003.04.001)` |
| 접두어 없음 | `(Emami et al., 2009, Clin Oral Implants Res, 10.1111/j.1600-0501.2008.01703.x)` |
| 괄호·접두어 없음 | `Littlewood 등, 2016, Cochrane…, DOI: 10.1002/…` → 앞 260자에서 서지 역추적 |
| 이미 링크됨 | `<a href="https://doi.org/10.x">10.x</a>` → 링크 해제 후 재조립 |

**실측: 77편 108건 전부 파싱. 본문 잔존 0 · 서지 미파싱 0.**
「근거: A / B」 식 꼬리 문단은 참고문헌 카드가 대체하므로 자동 제거한다.

### 배지 문구
「**참고 논문 N편**」으로 고정. ‘동료심사’는 사실이더라도 **개별 검증 없이 DOI 개수만 세어
자동으로 붙는 라벨**이라 의료 콘텐츠에서 위험하고, 환자분께 어려운 용어다. 세는 것만 말한다.

### 부수 효과
- Article JSON-LD 에 `citation[ScholarlyArticle]` 배열 추가 (YMYL E-E-A-T).
- 발췌·FAQ 스키마를 원문 대신 승격본(`colBody`)에서 뽑도록 교체.
  기존에는 구조화 데이터에 `[Al-Khabbaz AK et al., 2007, …, DOI: 10.1902/…]` 서지가 그대로 섞였다.
- 자동발행 프롬프트에 인용 형식 고정 + **저널 약어 금지**(JOMS ✗ → Journal of Oral and
  Maxillofacial Surgery ✓).

### ⚠️ 실측 사고 — TDZ
`colBody` 선언(3513행)이 첫 사용(3474행)보다 **뒤**에 있어 컬럼 상세가 전부 **HTTP 500**.
배포 직후 검증에서 `sup=0 refs=0` 이 일제히 0으로 찍혀 즉시 발각. 선언 호이스팅으로 복구.
→ 교훈: 기존 변수를 새 파생값으로 갈아끼울 때는 **선언 위치를 먼저 확인**한다.


## v5.51 — 컬럼 본문 레이아웃·말투 전면 개편 (2026-08-02)

### ① 「발행이 안 됐다」의 진짜 원인 — createdAt 누락
크론은 정상 작동했다(2026-08-02 09:02 KST, `틀니 가격`, pass, 120,089ms).
문제는 **사이트 전체가 `createdAt` 으로 정렬**한다는 점이었다(src/index.tsx 13곳:
목록·관련글·사이트맵·RSS·원장 페이지 등). 자동발행 레코드에는 `publishedAt` 만 있고
`createdAt` 이 없어 `new Date(0)` = 1970년으로 계산 → 새 글 3편이 목록 맨 뒤로 밀렸다.
`doctorName`, `id` 도 기존 74편이 모두 가진 필드였다.

→ 생성기 레코드 스키마 정합화(`id` / `createdAt` / `doctorName` / `category='진료 이야기'`).
   LLM 이 고른 진료과목은 `topic` 에 따로 담는다. R2 기존 3건도 백필했다.

### ② 본문 타이포그래피 전면 개편 (컬럼 77편 전체 동시 적용)
기존 `.col-detail-body` 는 h2/h3/p/img/blockquote 만 정의돼 있었다. **`ul`·`ol`·`li`·`table`
규칙이 아예 없어** 전역 `list-style:none` 리셋이 그대로 먹었고, 목록이 '그냥 줄바꿈된 문장'으로
보였다(실측 캡처). 4.4KB 타이포 시스템으로 교체.

| 요소 | 처리 |
|---|---|
| 형광 밑줄 | `<mark>` / `.hl` 글자 아래 58% 지점부터 칠하는 그라디언트. `.hl-mint` `.hl-peach` 변주 |
| ul | `li::before` 골드 원형 불릿 + 좌측 24px 들여쓰기 |
| ol | `counter()` 기반 번호 원형 뱃지 |
| table | 라운드 테두리 · `thead` 배경 · 짝수행 줄무늬 · `.table-scroll` 가로 스크롤 |
| 강조 박스 | `.callout`(민트) / `.callout-warn`(주황) + `.callout-title` |
| h2 / h3 | 좌측 골드 바 / 그라디언트 밑줄 |
| 리드 문단 | 첫 `<p>` 만 1.13rem |

### ③ 말투 — 논문체 → 진료실 대화체
`systemPrompt()` 에 `[말투 — 이게 이 글의 정체성입니다]` 블록 신설.
진료실 장면 + 환자분 대사 인용으로 시작 · 불안을 먼저 인정 · 전문용어는 즉시 괄호 풀이 ·
명령형 금지 · 짧은 문장 · 모르는 건 "케이스마다 편차가 큽니다".
`userPrompt()` 는 6단 뼈대(h2 → 진료실 장면 → 3줄 요약 박스 → h3 5~8 → 솔직하게 말씀드릴 점
박스 → 「서울비디치과에서는 이렇게 봅니다」)로 재작성.

### ④ 게이트 강화 — layout 모드
`gateColumn(draft, { layout: true })` 일 때만 신규 규격을 집행한다(기존 74편 미적용 → 패리티 유지).

| 항목 | 판정 |
|---|---|
| `<mark>` 3~12개 | **차단** |
| `<h2>` 1개 이상 | **차단** |
| `.callout` 1개 미만 / 2개 미만 | 경고 |
| 표에 `thead` 없음 | 경고 |

### ⑤ 기존 3편 재생성 실측
| 슬러그 | 글자 | h3 | 표 | 목록 | 형광펜 | 박스 | DOI | 소요 |
|---|---|---|---|---|---|---|---|---|
| `what-if-you-dont-remove-wisdom-teeth` | 3,657 | 8 | 2 | 29 | 5 | 4 | 2 | 69s |
| `dental-midline-deviation` | 3,985 | 11 | 2 | 35 | 10 | 4 | 1 | 79s |
| `dentures-price-insurance-cost-guide-korea` | 4,272 | 11 | 2 | 32 | 9 | 4 | 2 | 73s |

전부 attempt 1 통과, 경고 0.

⚠️ **실측 주의**: HTTP 로 `/api/cron/publish-column` 을 호출하면 Cloudflare 엣지 100초 제한에
걸려 **524** 가 난다(1회 발생, 큐 행이 `processing` 에 갇힘). 스케줄 크론(`scheduled` 핸들러)은
엣지를 거치지 않아 120초 실행도 성공한다. 수동 호출 실패 시 30분 초과 행은 자동 회수된다.


## v5.50 — 원장 컬럼 매일 자동발행 파이프라인 (2026-08-01 가동)

원장님 요구: **「컬럼 발행 매일 하나씩 자동화」 / 「내가 지금까지 한 퀄리티를 유지할 수 있으면 자동발행」
/ 「주제는 그냥 매일 다양하게 → GSC 미노출 키워드를 평생 잡아가는 것」 / 「썸네일도 지금 느낌으로 자동생성」**

승인 단계(사람)를 두지 않고 **기계 게이트가 문을 지킨다.** 게이트를 통과하지 못한 초안은 발행되지 않는다.

### 파이프라인
```
매일 09:00 KST  bdbddc-column-cron (별도 Worker, Cron Trigger)
      └─ POST https://bdbddc.com/api/cron/publish-column   (X-Cron-Secret)
            ⓞ 30분 초과 processing 행 회수 (좌초 방지)
            ① D1 column_queue 에서 기회점수 최고 1건 선점 → status='processing'
            ② LLM(gpt-5) 초안 생성  — 병원 확정사실 주입 + 의료법 §56 금지문 주입
            ③ 품질 게이트 8종 (src/column-gate.ts)
            ④ 탈락 시 탈락사유를 프롬프트에 되먹여 재생성 (최대 3회, 3회 실패 → draft 격리)
            ⑤ 통과 시 Workers AI 로 썸네일 생성 → R2 → data/columns.json append
            ⑥ 판정 전량을 column_auto_runs 에 기록
```
Cloudflare Pages 는 Cron Trigger 를 지원하지 않아 스케줄러만 별도 Worker 로 분리했다.
소스는 `scripts/cron-worker/` 에 둔다 — 루트에 두면 `post-build.cjs` 가 통째로 dist 에 복사해 **소스가 공개된다.**

### 주제 큐 (A+C 전략)
`scripts/column-queue.py` — GSC 실측에서 **우리가 아직 답을 안 만든 검색어**를 뽑는다.
커버리지 판정을 **두 코퍼스로 분리**한 것이 핵심이다.
- 코퍼스① 컬럼형: 컬럼 74 + 정적 205 → 컬럼으로 답할 검색어
- 코퍼스② 용어형: 백과사전 838 (`public/data/encyclopedia.json`) → 백과사전이 이미 답한 검색어

⚠️ 한 코퍼스로 합치면 안 된다(실측): `사랑니 안 뽑으면`↔`사랑니` 0.333, `라미네이트 후회`↔`라미네이트` 0.667
→ 전부 커버로 오판되어 컬럼 큐가 0건이 된다.
⚠️ 동의어를 한 줄로 이어붙여 2-gram 을 뽑으면 경계 gram 이 생겨 정확 일치가 희석된다
(`치아 번호` 0.333 → 별칭별 분리 후 1.000).

결과: **new-column 177건 / 미회수 노출 23,973회 = 177일치**. 소진되면 큐 재빌드로 계속 이어간다.

### 품질 게이트 8종 (`src/column-gate.ts`)
① 구조(본문 2,800~7,000자 / h3 ≥5 / 표 ≥1 / 목록 ≥6) ② **DOI 실재 검증**(doi.org HEAD, 404면 차단)
③ 의료법 §56(효과보장·최상급·경험담·연예인·가격유인 — 부정문 인식) ④ 프롬프트 지시문 누출
⑤ 속성 이스케이프(desc 큰따옴표=차단) ⑥ 메타 길이 ⑦ 문장 반복 ⑧ 기존 74편과 12-gram 중복

파이썬 원본(`scripts/column-gate.py`)과 판정 동등성 검증: `npm run gate:parity`
→ 기존 74편 중 탈락 10건, 사유 분포까지 완전 일치.

### 썸네일 — Workers AI 런타임 생성 (크레딧 0)
`@cf/black-forest-labs/flux-1-schnell` → R2 `column-thumbs/<slug>.jpg` → **`GET /api/images/*`** 로 서빙.
`/images/*` 는 `_routes.json` exclude(워커 우회 CDN)라 런타임 생성이 불가하지만,
`/api/images/*` 는 워커가 R2 를 직접 읽어 주는 공개 경로이고 `Cache-Control: immutable` 이라 성능이 같다.

- 검색어·키워드·카테고리를 MOTIF 15종에 매칭해 **주제별 전용 그림**을 뽑는다.
- 스타일 고정 실측 교훈: 색을 형용사로만 주면 민트가 빠진다 → **민트를 '받침 원반' 구조물로 못 박고**
  `subject fills most of the frame` 를 명시해야 16:9 크롭에서 빈약해지지 않는다.
- 출력은 1024×1024. 상세 히어로는 `.col-hero-sq`(컨테이너 `aspect-ratio:16/9` + `object-fit:cover`)로
  기존 1376×768 컬럼과 같아 보이게 크롭하고, 컨테이너가 높이를 미리 잡아 **CLS 0**.
- 개별 재생성: `POST /api/cron/thumb?slug=<슬러그>&hint=<주제>` (발행 경로와 동일 코드)

### 엔드포인트 (전부 `X-Cron-Secret` 필요)
| 메서드 | 경로 | 용도 |
|---|---|---|
| POST | `/api/cron/publish-column` | 1건 생성→게이트→발행 |
| POST | `/api/cron/publish-column?dry=1` | 발행 없이 게이트 판정만 (리허설) |
| POST | `/api/cron/thumb?slug=&hint=` | 썸네일 개별 재생성 |
| POST | `/api/cron/thumb-test?p=` | 프롬프트 실험 (임시 키) |
| GET | `/api/cron/status` | 큐 잔량 / 다음 5건 / 최근 판정 10건 |

⚠️ Hono 는 등록 순서 우선이다. 이 라우트는 `registerGameApis(app)` **직후**에 등록해야 한다
(파일 끝에 등록하면 캐치올이 먹어 홈페이지 HTML 이 돌아온다 — 실측).

### 실측 성능·주의
- 1건 왕복 **85~120초** (LLM 3,400~5,200자 + DOI 실재 검증).
- ⚠️ `ctx.waitUntil()` 로 응답 먼저 보내면 연장 수명이 약 30초로 끊겨 작업이 중단되고
  큐 행이 `processing` 에 갇힌다(실측 2회). → 크론 워커는 `await trigger(env)` 로 끝까지 기다린다.
  Workers 가 제한하는 것은 CPU 시간이고 이 작업은 거의 전부 fetch 대기라 안전하다.
- 그래도 실패는 가능하므로 `runAutoPublish` 진입 시 **30분 초과 processing 행을 자동 회수**한다(다음 날 재시도).

### 가동 검증 (2026-08-01)
| 항목 | 결과 |
|---|---|
| 리허설 `?dry=1` | ✅ pass, 1회차 통과 (3,197자 / h3 9 / 표 2 / 목록 30 / DOI 1) |
| 1차 발행 (엔드포인트 직접) | ✅ `사랑니 안 뽑으면` → `/column/if-you-dont-remove-wisdom-teeth`, 84초 |
| 2차 발행 (크론 워커 경로) | ✅ `정중선` → `/column/jeongjungseon-dental-midline`, 95초 |
| 썸네일 | ✅ 1024×1024, 185~264KB, 주제별 상이, 기존 톤 일치 |
| 사이트맵·목록 등재 | ✅ 자동 (컬럼은 R2 기반 SSR → **새 컬럼에 배포 불필요**) |
| 미인증 접근 | ✅ 401 |
| 소스 유출 | ✅ `dist/scripts` 부재 확인 |

### 운영 명령
```bash
npm run queue:build          # GSC csv → 주제 큐 재빌드
npm run queue:seed:prod      # 큐를 원격 D1 에 적재
npm run gate:parity          # 게이트 동등성 회귀 테스트
npm run cron:deploy          # 스케줄러 워커 배포
```

### 남은 일
- 큐 빌더에 `게재 순위` 반영 (현재 `seed-queue.py` 만 병합)
- 큐 소진(177일 후) 시 재빌드 자동화
- 기존 컬럼 10편 게이트 미달 보강 (DOI 0건 7편 등)
