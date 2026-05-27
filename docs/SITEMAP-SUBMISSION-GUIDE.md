# 서울비디치과 사이트맵 제출 가이드

**마지막 업데이트**: 2026-05-27
**대상 사이트**: https://bdbddc.com

---

## 📋 사이트맵 전체 목록 (총 7개)

### 정적 sitemap (5개, 파일로 관리)
| 파일 | URL 수 | 용도 |
|------|--------|------|
| `sitemap.xml` | 6 | **인덱스 파일** (sitemapindex) — 다른 6개를 묶음 |
| `sitemap-main.xml` | 119 | 메인 + 진료 + 의료진 + 병원안내 + 콘텐츠 |
| `sitemap-area.xml` | 88 | 지역 SEO (28개 도시 + 60개 진료 특화) |
| `sitemap-encyclopedia.xml` | 862 | 치과 백과사전 (카테고리 + 항목) |
| `sitemap-intl.xml` | 34 | 다국어 (EN/VI/JP/CN/TH/RU) |

### 동적 sitemap (2개, Hono 핸들러로 실시간 생성)
| 파일 | URL 수 | 용도 | 소스 |
|------|--------|------|------|
| `sitemap-columns.xml` | 23 | 원장 컬럼 | R2/D1 실시간 반영 (`src/index.tsx:1829`) |
| `sitemap-cases.xml` | 90 | Before/After 케이스 | R2 실시간 반영 (`src/index.tsx:1867`) |

**합계: 약 1,222개 URL이 검색엔진에 노출**

---

## 🚀 검색엔진별 제출 방법

### 1️⃣ Google Search Console (가장 중요)

**URL**: https://search.google.com/search-console

**제출 절차**:
1. `bdbddc.com` 속성 선택
2. 좌측 메뉴 → **Sitemaps**
3. "새 사이트맵 추가" 입력란에 **`sitemap.xml`** 입력 (인덱스 하나만 제출하면 나머지 자동 발견)
4. "제출" 클릭

**대안 — 개별 제출** (인덱스 인식 안 될 때):
```
sitemap.xml
sitemap-main.xml
sitemap-area.xml
sitemap-encyclopedia.xml
sitemap-intl.xml
sitemap-columns.xml
sitemap-cases.xml
```

**참고**: Google은 ping API (`google.com/ping?sitemap=...`)를 **2023년 6월부로 폐지**했습니다. 반드시 Search Console UI 또는 robots.txt를 통해서만 제출합니다. (robots.txt에는 이미 모두 선언되어 있음)

---

### 2️⃣ Naver 서치어드바이저 (한국 SEO 핵심)

**URL**: https://searchadvisor.naver.com

**제출 절차**:
1. `bdbddc.com` 사이트 선택
2. 좌측 **요청 → 사이트맵 제출**
3. 입력란에 `sitemap.xml` 입력
4. "확인" 클릭

**RSS 등록 (추가 SEO)**:
- 좌측 **요청 → RSS 제출** 메뉴에서 콘텐츠 RSS도 제출 가능 (현재 미운영)

**Yeti 봇 정상 크롤링 확인**:
- 좌측 **수집 → robots.txt** 메뉴에서 robots.txt 정합성 확인

---

### 3️⃣ Bing Webmaster Tools (자동 — 이미 완료)

**URL**: https://www.bing.com/webmasters

**현재 상태**: ✅ IndexNow 키(`6f74445f7ec14eccb522a4d3f253128c.txt`) 설정됨 → 사이트맵 갱신 시 **자동 통보**

**수동 확인 절차**:
1. `bdbddc.com` 사이트 선택
2. 좌측 **Sitemaps** 메뉴
3. `https://bdbddc.com/sitemap.xml` 제출

**IndexNow 직접 트리거** (스크립트):
```bash
# 별도 페이지 갱신 시 즉시 통보 (Bing + Yandex 동시)
curl -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "bdbddc.com",
    "key": "6f74445f7ec14eccb522a4d3f253128c",
    "keyLocation": "https://bdbddc.com/6f74445f7ec14eccb522a4d3f253128c.txt",
    "urlList": [
      "https://bdbddc.com/treatments/whitening"
    ]
  }'
```

---

### 4️⃣ Yandex (러시아 검색엔진 — RU 다국어 SEO)

**URL**: https://webmaster.yandex.com

**현재 상태**: ✅ IndexNow로 자동 통보됨 (Bing과 동일 키 공유)

**수동 등록 (선택)**:
1. 사이트 등록 → DNS TXT 또는 HTML 메타 인증
2. **Indexing → Sitemap files** 메뉴
3. `sitemap.xml` 제출

---

### 5️⃣ Daum 검색 (네이버 외 보조)

**URL**: https://register.search.daum.net

**참고**: Daum은 별도 사이트맵 UI가 없고 **robots.txt 자동 파싱**합니다. → robots.txt에 이미 선언되어 있으므로 별도 작업 불필요.

---

## 🤖 AI 검색 (GEO — Generative Engine Optimization)

ChatGPT, Claude, Perplexity 등 AI 검색은 sitemap을 직접 제출받지는 않지만, **robots.txt에 명시된 사이트맵 URL을 크롤할 때 자동 참조**합니다.

현재 `robots.txt`에는 다음 봇이 모두 허용되어 있어 자동 학습됩니다:
- ✅ GPTBot, ChatGPT-User, OAI-SearchBot (OpenAI)
- ✅ ClaudeBot, anthropic-ai (Anthropic)
- ✅ PerplexityBot
- ✅ Google-Extended (Gemini 학습)
- ✅ Meta-ExternalAgent (Meta AI)
- ✅ Applebot, Applebot-Extended (Apple Intelligence)
- ✅ Bytespider (Doubao/TikTok)
- ✅ CCBot (Common Crawl — 모든 LLM의 1차 학습 소스)

**추가 자료**: `llms.txt`, `llms-full.txt` (https://llmstxt.org/ 표준)도 robots.txt에 선언되어 있음.

---

## 📊 제출 후 모니터링

### Google Search Console 체크리스트
- [ ] Sitemap 상태 = **성공**
- [ ] 발견된 페이지 수 = 약 1,222개 (±5%)
- [ ] **색인 생성됨** 페이지 수 = 시간이 지나면 증가
- [ ] **제외됨** 페이지 점검 (의도된 제외인지)

### Naver 서치어드바이저 체크리스트
- [ ] **요청 결과** = "수집 성공"
- [ ] **수집 URL** = 등록 URL과 일치
- [ ] **사이트 진단** 점수 확인

---

## 🔄 향후 업데이트 워크플로우

콘텐츠를 크게 변경했을 때 (예: 진료 페이지 리뉴얼, 새 백과사전 항목 추가):

```bash
# 1. 사이트맵 재생성
cd /home/user/webapp
node scripts/regenerate-all-sitemaps.cjs

# 2. 빌드 & 배포
npm run build
npx wrangler pages deploy dist --project-name seoul-bd-dental --branch main

# 3. IndexNow로 즉시 통보 (Bing + Yandex)
curl -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "bdbddc.com",
    "key": "6f74445f7ec14eccb522a4d3f253128c",
    "keyLocation": "https://bdbddc.com/6f74445f7ec14eccb522a4d3f253128c.txt",
    "urlList": ["https://bdbddc.com/sitemap.xml"]
  }'

# 4. Google/Naver는 robots.txt 자동 재크롤 (보통 24-72h 내) — 강제 트리거는 Search Console UI에서 수동 재제출
```

---

## 🚨 트러블슈팅

### 문제 1: Search Console에서 "사이트맵 가져올 수 없음"
**원인**: Cloudflare CDN이 304 Not Modified 캐시 / 임시 503
**해결**:
1. `curl -I https://bdbddc.com/sitemap.xml` 로 200 확인
2. Search Console에서 사이트맵 삭제 → 24h 후 재제출

### 문제 2: 새 페이지가 색인되지 않음
**원인**: lastmod가 갱신되지 않거나, 인덱스 사이트맵 누락
**해결**:
1. `node scripts/regenerate-all-sitemaps.cjs` 재실행 (자동으로 lastmod=오늘)
2. 해당 페이지를 Search Console **URL 검사** 도구에서 직접 색인 요청

### 문제 3: 잘못된 URL이 색인됨
**원인**: 옛 URL이 sitemap에 남아있음
**해결**:
1. 해당 URL을 sitemap에서 제거 + 301 리다이렉트 설정 (`_redirects` 파일)
2. Search Console **삭제** 도구로 임시 제거 요청
