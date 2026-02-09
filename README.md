# 서울비디치과 웹사이트 (Seoul BD Dental)

## Project Overview
- **Name**: seoul-bd-dental
- **Goal**: 서울비디치과 공식 웹사이트 — 51개 서브페이지, 라이트 테마, 반응형 UX, SEO 최적화
- **Platform**: Cloudflare Pages + Hono Framework
- **Design System**: design-system-v4.css (디자인 토큰) + subpage-v4.css (컴포넌트)

## URLs
- **Sandbox Preview**: https://3000-ij595eoqjfhonf0rq8pba-18e660f9.sandbox.novita.ai
- **Canonical Domain**: https://bdbddc.com

## Current Version: v4.5

### Completed Features
- 전면 라이트 테마 디자인 (v4.0)
- 51개 서브페이지 통일 구조
- **treatments/implant.html 전면 재작성 (v4.5)** — index.html 수준 품질
  - 감성적 히어로 ("다른 곳에서 안 된다고요? 저희가 해드리겠습니다")
  - 환자 고민 해결 섹션 (concerns-grid)
  - Why Hero Card (고난도 케이스 전문 강조)
  - 환자 후기 섹션 (review-card 3개)
  - 접근성 개선: aria-expanded, aria-controls, scope, caption
  - Heading hierarchy: h1→h2→h3 완벽 순서
  - FAQ 10개 (Schema.org FAQPage JSON-LD 보존)
  - SEO 메타/JSON-LD 100% 보존 (BreadcrumbList, MedicalProcedure, HowTo)
- 7개 핵심 페이지 전면 재설계 (implant, invisalign, pediatric, aesthetic, glownate, doctors/index, doctors/moon)
- CSS 100% 커버리지 (907 CSS classes / 206 implant HTML classes / 0 missing)
- Heading hierarchy 접근성 수정
- 빌드 스크립트 버그 수정 (cp -r → cp -rT)
- 18개 페이지 HTTP 200 OK, 콘솔 에러 0건

### Key Pages & URIs
| 경로 | 설명 |
|------|------|
| `/` | 메인 홈페이지 |
| `/treatments/implant` | **임플란트센터 (v4.5 재작성)** |
| `/treatments/invisalign` | 교정센터 (인비절라인) |
| `/treatments/pediatric` | 소아치과 (전문의 3인) |
| `/treatments/aesthetic` | 심미치료 (라미네이트, 미백) |
| `/treatments/glownate` | 글로우네이트 시그니처 |
| `/doctors/` | 의료진 소개 (15인 원장) |
| `/doctors/moon` | 문석준 대표원장 프로필 |
| `/pricing` | 비용 안내 |
| `/faq` | 자주 묻는 질문 |
| `/reservation` | 예약/상담 |
| `/directions` | 오시는 길 |
| `/floor-guide` | 층별 안내 (1~5층) |
| `/bdx/` | BDX 검진센터 |

### implant.html v4.5 섹션 구조
1. **HERO** — 감성적 헤드라인, 듀얼 뱃지, 4개 스탯, 듀얼 CTA
2. **환자 고민** — 6개 concerns-grid (문제→해결)
3. **임플란트 종류** — 6개 type-card (수면, 비절개, 네비게이션BEST, 고난도, 재수술, 공휴일)
4. **왜 서울비디치과** — why-hero-card + 6개 why-card (01~06)
5. **치료 과정** — 6단계 process-timeline
6. **제품 비교** — 3사 비교표 (오스템/스트라우만/네오)
7. **환자 후기** — 3개 review-card (네이버/구글)
8. **FAQ** — 8개 아코디언 (aria-expanded/controls)
9. **CTA** — 네이버예약 + 카카오톡 듀얼 버튼

### Data Architecture
- **Storage**: Static HTML (빌드 시 dist/ 복사)
- **Structured Data**: JSON-LD (BreadcrumbList, FAQPage, MedicalProcedure, HowTo, Dentist)
- **Design Tokens**: CSS Custom Properties (colors, typography, spacing, shadows, breakpoints)

### Tech Stack
- Hono v4 + TypeScript
- Vite v6 (빌드)
- Wrangler v4 (개발 서버)
- Pretendard (폰트)
- FontAwesome 6.4 (아이콘)
- design-system-v4.css + subpage-v4.css

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
```

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: Development (v4.5)
- **Last Updated**: 2026-02-09

## Git History
- v4.5: implant.html 전면 재작성 — index.html 수준 품질, 환자 고민/후기/Why Hero 추가
- v4.4.1: CSS 100% 커버리지, heading hierarchy 수정, 빌드 버그 수정
- v4.4: 전면 레이아웃 재설계 — 모든 서브페이지 구조 통일
- v4.3: subpage-v4.css 완전 리라이트 (299개 누락 CSS 추가)
- v4.2: subpage-v4.css 전면 보강 (350+ 스타일)
- v4.1: 전체 서브페이지 79개 라이트 테마 변환
- v4.0: 전면 리디자인 — 라이트 테마, SEO 최적화, 60% 경량화

## Remaining Work
- [ ] 나머지 side-menu 페이지에 동일 접근 적용 (doctors/index.html, doctors/moon.html 등)
- [ ] 일반 치료 페이지 재설계 (cavity, crown, inlay, scaling 등)
- [ ] 개별 의사 페이지 재설계 (kim.html, hyun.html 등 12명)
- [ ] 실제 의사 프로필 이미지 교체
- [ ] Cloudflare 프로덕션 배포
- [ ] Visual QA (Playwright 스크린샷)
- [ ] Lighthouse 성능/접근성 점수 측정
