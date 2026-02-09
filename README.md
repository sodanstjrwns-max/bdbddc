# 서울비디치과 웹사이트 (Seoul BD Dental)

## Project Overview
- **Name**: seoul-bd-dental
- **Goal**: 서울비디치과 공식 웹사이트 — 51개 서브페이지, 라이트 테마, 반응형 UX, SEO 최적화
- **Platform**: Cloudflare Pages + Hono Framework
- **Design System**: design-system-v4.css (디자인 토큰) + subpage-v4.css (컴포넌트)

## URLs
- **Sandbox Preview**: https://3000-ij595eoqjfhonf0rq8pba-18e660f9.sandbox.novita.ai
- **Canonical Domain**: https://bdbddc.com

## Current Version: v4.4.1

### Completed Features
- 전면 라이트 테마 디자인 (v4.0)
- 51개 서브페이지 통일 구조
- 7개 핵심 페이지 전면 재설계 (implant, invisalign, pediatric, aesthetic, glownate, doctors/index, doctors/moon)
- 10개 유틸리티 페이지 구조 통일 (pricing, faq, reservation, directions, floor-guide, bdx, column, video, cases, notice)
- CSS 100% 커버리지 (882 CSS classes / 728 HTML classes / 0 missing)
- Heading hierarchy 접근성 수정 (h2→h4 skip → h2→h3)
- 빌드 스크립트 버그 수정 (cp -r → cp -rT로 dist 중첩 방지)
- 18개 페이지 HTTP 200 OK, 콘솔 에러 0건

### Key Pages & URIs
| 경로 | 설명 |
|------|------|
| `/` | 메인 홈페이지 |
| `/treatments/implant` | 임플란트센터 (6개 수술방, 수면/비절개/고난도) |
| `/treatments/invisalign` | 교정센터 (인비절라인, 서울대 전문의 2인) |
| `/treatments/pediatric` | 소아치과 (전문의 3인, 웃음가스) |
| `/treatments/aesthetic` | 심미치료 (라미네이트, 미백) |
| `/treatments/glownate` | 글로우네이트 시그니처 시술 |
| `/doctors/` | 의료진 소개 (15인 원장) |
| `/doctors/moon` | 문석준 대표원장 프로필 |
| `/pricing` | 비용 안내 |
| `/faq` | 자주 묻는 질문 |
| `/reservation` | 예약/상담 |
| `/directions` | 오시는 길 |
| `/floor-guide` | 층별 안내 (1~5층) |
| `/bdx/` | BDX 검진센터 |

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
- **Status**: Development (v4.4.1)
- **Last Updated**: 2026-02-09

## Git History
- v4.4.1: CSS 100% 커버리지, heading hierarchy 수정, 빌드 버그 수정
- v4.4: 전면 레이아웃 재설계 — 모든 서브페이지 구조 통일
- v4.3: subpage-v4.css 완전 리라이트 (299개 누락 CSS 추가)
- v4.2: subpage-v4.css 전면 보강 (350+ 스타일)
- v4.1: 전체 서브페이지 79개 라이트 테마 변환
- v4.0: 전면 리디자인 — 라이트 테마, SEO 최적화, 60% 경량화

## Remaining Work
- [ ] 나머지 개별 의사 페이지 재설계 (kim.html, hyun.html 등 12명)
- [ ] 일반 치료 페이지 재설계 (cavity, crown, inlay, scaling 등)
- [ ] 실제 의사 프로필 이미지 교체 (현재 GitHub raw URL)
- [ ] Cloudflare 프로덕션 배포
- [ ] Visual QA (Playwright 스크린샷)
- [ ] Lighthouse 성능/접근성 점수 측정
