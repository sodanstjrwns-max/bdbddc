# 서울비디치과 웹사이트 - 캐시 가이드라인

> 브라우저 및 서버 캐싱 최적화를 위한 가이드라인  
> Updated: 2024-12-10 | Version: 1.0.0

## 📋 목차
1. [캐시 전략 개요](#캐시-전략-개요)
2. [파일 유형별 캐시 설정](#파일-유형별-캐시-설정)
3. [Apache (.htaccess) 설정](#apache-htaccess-설정)
4. [Nginx 설정](#nginx-설정)
5. [CDN 캐시 설정](#cdn-캐시-설정)
6. [캐시 무효화 전략](#캐시-무효화-전략)

---

## 캐시 전략 개요

### 목표
- **First Contentful Paint (FCP)** 최소화
- **Largest Contentful Paint (LCP)** < 2.5s
- **재방문 시 빠른 로딩** (캐시 활용)
- **대역폭 절약** 및 서버 부하 감소

### 캐시 계층
```
[Browser Cache] → [Service Worker] → [CDN Edge] → [Origin Server]
```

---

## 파일 유형별 캐시 설정

### 📄 HTML 파일
| 설정 | 값 | 이유 |
|------|-----|------|
| Cache-Control | `no-cache, must-revalidate` | 항상 최신 콘텐츠 확인 |
| max-age | `0` | 즉시 재검증 |
| ETag | 활성화 | 조건부 요청 지원 |

### 🎨 CSS 파일
| 설정 | 값 | 이유 |
|------|-----|------|
| Cache-Control | `public, max-age=31536000, immutable` | 1년 캐시 |
| 버전 관리 | `?v=9.22.0` | 캐시 버스팅 |

### 📜 JavaScript 파일
| 설정 | 값 | 이유 |
|------|-----|------|
| Cache-Control | `public, max-age=31536000, immutable` | 1년 캐시 |
| 버전 관리 | `?v=9.22.0` | 캐시 버스팅 |

### 🖼️ 이미지 파일
| 설정 | 값 | 이유 |
|------|-----|------|
| Cache-Control | `public, max-age=31536000` | 1년 캐시 |
| 포맷 | WebP 우선 | 파일 크기 감소 |

### 🔤 폰트 파일
| 설정 | 값 | 이유 |
|------|-----|------|
| Cache-Control | `public, max-age=31536000, immutable` | 변경 없음 |
| CORS | `Access-Control-Allow-Origin: *` | 외부 폰트 사용 |

---

## Apache (.htaccess) 설정

```apache
# ============================================
# 서울비디치과 캐시 설정 (.htaccess)
# ============================================

<IfModule mod_expires.c>
  ExpiresActive On
  
  # HTML - 항상 재검증
  ExpiresByType text/html "access plus 0 seconds"
  
  # CSS & JavaScript - 1년
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  
  # 이미지 - 1년
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  
  # 폰트 - 1년
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType application/font-woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
  
  # JSON/XML
  ExpiresByType application/json "access plus 1 hour"
  ExpiresByType application/xml "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
  # 정적 자원에 대한 캐시 헤더
  <FilesMatch "\.(css|js|jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  
  # HTML에 대한 캐시 헤더
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
  
  # Service Worker
  <FilesMatch "sw\.js$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>

# Gzip 압축
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
  AddOutputFilterByType DEFLATE text/javascript application/javascript
  AddOutputFilterByType DEFLATE application/json application/xml
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# ETag 설정
FileETag MTime Size
```

---

## Nginx 설정

```nginx
# ============================================
# 서울비디치과 캐시 설정 (nginx.conf)
# ============================================

server {
    listen 80;
    server_name bdbddc.com www.bdbddc.com;
    
    # Gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1000;
    
    # 정적 자원 캐시 (1년)
    location ~* \.(css|js|jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # HTML 파일 (재검증)
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }
    
    # Service Worker (캐시 없음)
    location = /sw.js {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # manifest.json
    location = /manifest.json {
        expires 1d;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

---

## CDN 캐시 설정

### Cloudflare 권장 설정
```
Browser Cache TTL: Respect Existing Headers
Edge Cache TTL: 1 month

Page Rules:
- *.css, *.js: Cache Level: Cache Everything, Edge TTL: 1 year
- *.html: Cache Level: Standard, Edge TTL: 4 hours
- /images/*: Cache Level: Cache Everything, Edge TTL: 1 month
```

### jsDelivr CDN (외부 라이브러리)
- Pretendard 폰트: 자동 캐시 (1년)
- FontAwesome: 자동 캐시 (1년)

---

## 캐시 무효화 전략

### 1. 버전 쿼리 스트링
```html
<!-- CSS -->
<link rel="stylesheet" href="css/main.css?v=9.22.0">

<!-- JavaScript -->
<script src="js/main.js?v=9.22.0" defer></script>
```

### 2. 파일명 해시 (빌드 시스템 사용 시)
```html
<!-- 빌드 출력물 -->
<link rel="stylesheet" href="css/main.abc123.css">
<script src="js/main.xyz789.js" defer></script>
```

### 3. Service Worker 업데이트
```javascript
// sw.js에서 캐시 버전 변경
const CACHE_VERSION = 'seoulbd-v9.22.0';
```

### 4. 긴급 캐시 삭제
```javascript
// 클라이언트에서 캐시 강제 삭제
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}
```

---

## 📊 성능 측정 도구

### Google PageSpeed Insights
- [https://pagespeed.web.dev/](https://pagespeed.web.dev/)

### Chrome DevTools
- Network 탭 → Size 열에서 캐시 여부 확인
- Application 탭 → Cache Storage 확인

### Web Vitals 측정
- `js/performance.js`에서 LCP, FID, CLS 로깅

---

## ✅ 체크리스트

- [ ] Apache/Nginx 캐시 헤더 설정
- [ ] CSS/JS 버전 쿼리 스트링 적용
- [ ] Service Worker 캐시 버전 업데이트
- [ ] CDN 설정 확인 (Cloudflare 등)
- [ ] 배포 후 PageSpeed Insights 테스트

---

*마지막 업데이트: 2024-12-10*
