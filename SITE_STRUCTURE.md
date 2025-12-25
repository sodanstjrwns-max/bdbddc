# 서울비디치과 사이트 구조

> 최종 업데이트: 2024-12-12

## 📌 메뉴 구조

```
🏠 메인 (index.html)
│
├── 🦷 진료 안내 ▼
│   ├── 전문센터
│   │   ├── ✨ 글로우네이트 (HOT)
│   │   ├── 임플란트센터
│   │   ├── 교정센터 (인비절라인)
│   │   ├── 소아치과
│   │   └── 심미치료
│   ├── 일반/보존 진료
│   │   ├── 충치치료
│   │   ├── 레진치료
│   │   ├── 크라운
│   │   ├── 인레이/온레이
│   │   ├── 신경치료
│   │   └── 미백
│   └── 잇몸/외과
│       ├── 스케일링
│       ├── 잇몸치료
│       ├── 치주염
│       ├── 사랑니 발치
│       ├── 턱관절장애
│       └── 이갈이/이악물기
│
├── 👨‍⚕️ 의료진 소개
│   └── doctors/index.html
│
├── 🔬 검진센터
│   └── bdx/index.html
│
├── 📰 콘텐츠 ▼ (3개)
│   ├── 📝 칼럼 → /column/columns.html (Inblog RSS)
│   ├── 🎬 영상 → /video/index.html (YouTube API)
│   └── 🔒 비포/애프터 → /cases/gallery.html (회원 전용)
│
└── 🏥 병원 안내 ▼ (5개)
    ├── 💰 비용 안내 → /pricing.html
    ├── 🏢 층별 안내 → /floor-guide.html
    ├── 📍 오시는 길 → /directions.html
    ├── ❓ 자주 묻는 질문 → /faq.html
    └── 📢 공지사항 → /notice/index.html
```

---

## 📁 폴더 구조

```
bdbddc.com/
│
├── index.html                 # 메인 페이지
├── reservation.html           # 예약 페이지
├── pricing.html               # 비용 안내
├── directions.html            # 오시는 길
├── floor-guide.html           # 층별 안내
├── faq.html                   # 자주 묻는 질문
├── privacy.html               # 개인정보처리방침
├── terms.html                 # 이용약관
├── 404.html                   # 404 에러 페이지
├── offline.html               # 오프라인 페이지 (PWA)
│
├── sitemap.xml                # 사이트맵
├── robots.txt                 # 검색엔진 설정
├── manifest.json              # PWA 매니페스트
├── sw.js                      # Service Worker
│
├── vercel.json                # Vercel 배포 설정
├── netlify.toml               # Netlify 배포 설정
├── _redirects                 # Cloudflare 리다이렉트
│
├── treatments/                # 진료 안내
│   ├── index.html             # 진료 전체
│   ├── glownate.html          # 글로우네이트
│   ├── implant.html           # 임플란트
│   ├── invisalign.html        # 인비절라인
│   ├── pediatric.html         # 소아치과
│   ├── aesthetic.html         # 심미치료
│   ├── cavity.html            # 충치치료
│   ├── resin.html             # 레진치료
│   ├── crown.html             # 크라운
│   ├── inlay.html             # 인레이/온레이
│   ├── root-canal.html        # 신경치료
│   ├── whitening.html         # 미백
│   ├── scaling.html           # 스케일링
│   ├── gum.html               # 잇몸치료
│   ├── periodontitis.html     # 치주염
│   ├── wisdom-tooth.html      # 사랑니
│   ├── tmj.html               # 턱관절
│   └── bruxism.html           # 이갈이
│
├── doctors/                   # 의료진 소개
│   ├── index.html             # 의료진 전체
│   ├── moon.html              # 문원장
│   ├── kim.html               # 김원장
│   └── ...                    # 기타 원장님들
│
├── bdx/                       # 검진센터
│   └── index.html
│
├── column/                    # 칼럼 (콘텐츠)
│   └── columns.html           # Inblog RSS 연동
│
├── video/                     # 영상 (콘텐츠)
│   └── index.html             # YouTube API 연동
│
├── cases/                     # 비포/애프터 (콘텐츠)
│   └── gallery.html           # 회원 전용
│
├── notice/                    # 공지사항 (병원 안내)
│   └── index.html
│
├── admin/                     # 관리자 페이지
│   ├── index.html             # 대시보드
│   ├── notices.html           # 공지사항 관리
│   └── cases.html             # 케이스 관리
│
├── auth/                      # 인증
│   ├── login.html
│   ├── register.html
│   └── mypage.html
│
├── area/                      # 지역 페이지 (SEO)
│   ├── cheonan.html
│   ├── asan.html
│   └── buldang.html
│
├── faq/                       # FAQ 서브페이지
│   ├── implant.html
│   └── orthodontics.html
│
├── css/                       # 스타일시트
│   ├── design-system.css
│   ├── main.css
│   ├── gnb.css
│   ├── pricing.css
│   └── ...
│
├── js/                        # 자바스크립트
│   ├── header-loader.js       # ⭐ 공통 헤더 로더
│   ├── main.js
│   └── ...
│
├── images/                    # 이미지
│   ├── icons/
│   ├── doctors/
│   └── ...
│
├── components/                # 컴포넌트 템플릿
│   ├── header.html
│   └── footer.html
│
└── docs/                      # 문서
    └── cloudflare-worker-inblog.js
```

---

## 🔗 주요 페이지 URL

### 메인
| 페이지 | URL | 설명 |
|--------|-----|------|
| 메인 | `/` | 홈페이지 |
| 예약 | `/reservation.html` | 온라인 예약 |

### 진료 안내
| 페이지 | URL | 우선순위 |
|--------|-----|----------|
| 진료 전체 | `/treatments/index.html` | 높음 |
| 글로우네이트 | `/treatments/glownate.html` | 최고 |
| 임플란트 | `/treatments/implant.html` | 최고 |
| 인비절라인 | `/treatments/invisalign.html` | 최고 |

### 콘텐츠 (3개)
| 페이지 | URL | 연동 |
|--------|-----|------|
| 칼럼 | `/column/columns.html` | Inblog RSS |
| 영상 | `/video/index.html` | YouTube API |
| 비포/애프터 | `/cases/gallery.html` | 회원 전용 |

### 병원 안내 (5개)
| 페이지 | URL |
|--------|-----|
| 비용 안내 | `/pricing.html` |
| 층별 안내 | `/floor-guide.html` |
| 오시는 길 | `/directions.html` |
| FAQ | `/faq.html` |
| 공지사항 | `/notice/index.html` |

---

## ⚙️ 외부 서비스 연동

### Inblog (칼럼)
```
Blog ID: bdbddc
RSS URL: https://proxy.inblog.dev/bdbddc/rss
```

### YouTube (영상)
```
API Key: AIzaSyBp8ucGAs5BKeqtk7UPQNGMHA-qkflT5po
Channel ID: UCakJiVviUa_FJvFWgW_FDBw
```

### Firebase (인증)
```
프로젝트: 서울비디치과
인증: Google 로그인
```

### Analytics
```
Google Analytics: G-3NQP355YQM
Amplitude: c4e197a17443b1059b402ec0d16fa88f
```

---

## 🚀 배포 설정

### Vercel (권장)
- 설정 파일: `vercel.json`
- Inblog 프록시: `/blog/*` → `https://proxy.inblog.dev/bdbddc/*`

### Netlify
- 설정 파일: `netlify.toml`

### Cloudflare Pages
- 설정 파일: `_redirects`

---

## 📝 TODO

- [x] 모든 페이지 상단 메뉴 일괄 수정 완료 (v9.27.0)
- [ ] 실제 의사 사진 업로드
- [ ] 실제 시설 사진 업로드
- [ ] PWA 아이콘 업로드

---

## ✅ v9.27.0 업데이트 내역 (2024-12-12)

### 수정된 파일 목록 (68개)

**루트 페이지:**
- `index.html`, `pricing.html`, `directions.html`, `faq.html`, `floor-guide.html`, `reservation.html`

**treatments/ (25개):**
- `cavity.html`, `resin.html`, `crown.html`, `inlay.html`, `root-canal.html`, `scaling.html`, `gum.html`, `wisdom-tooth.html`, `emergency.html`, `bridge.html`, `denture.html`, `bruxism.html`, `prevention.html`, `gum-surgery.html`, `re-root-canal.html`, `apicoectomy.html`, `implant.html`, `invisalign.html`, `glownate.html`, `pediatric.html`, `aesthetic.html`, `periodontitis.html`, `tmj.html`, `whitening.html`

**doctors/ (18개):**
- `index.html`, `lee-bm.html`, `park-sb.html`, `kim-mj.html`, `kang-mj.html`, `kim-mg.html`, `lim.html`, `seo.html`, `jo.html`, `kang.html`, `park.html`, `lee.html`, `choi.html`, `hyun.html`, `kim.html`, `moon.html`, `profile-template.html`, `doctor-template.html`

**기타:**
- `bdx/index.html`, `cases/index.html`, `faq/orthodontics.html`, `faq/implant.html`, `area/cheonan.html`, `area/buldang.html`, `area/asan.html`, `components/header.html`, `column/columns.html`, `video/index.html`, `notice/index.html`, `cases/gallery.html`
