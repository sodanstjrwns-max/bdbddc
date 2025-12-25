# 이미지 최적화 가이드 (WebP 변환)

## 왜 WebP를 사용해야 하나요?

| 포맷 | 압축률 | 품질 | 브라우저 지원 |
|------|--------|------|---------------|
| JPEG | 기준 | 좋음 | 100% |
| PNG | 낮음 | 무손실 | 100% |
| **WebP** | **25-35% 더 작음** | **동등 이상** | **97%+** |

WebP를 사용하면 동일 품질 대비 **파일 크기 25-35% 감소** → 로딩 속도 향상

---

## 1. 이미지 업로드 시 WebP 변환 방법

### 방법 A: 온라인 도구 (권장 - 간편)

1. **Squoosh** (Google): https://squoosh.app/
   - 드래그 앤 드롭으로 이미지 업로드
   - 오른쪽 패널에서 "WebP" 선택
   - Quality: **80-85%** 권장 (눈으로 구분 불가)
   - 다운로드 후 `/images/` 폴더에 저장

2. **CloudConvert**: https://cloudconvert.com/jpg-to-webp
   - 대량 변환 가능
   - 품질 설정 가능

### 방법 B: 로컬 도구 (대량 변환)

```bash
# macOS - Homebrew로 cwebp 설치
brew install webp

# 단일 파일 변환
cwebp -q 80 input.jpg -o output.webp

# 폴더 내 모든 이미지 일괄 변환
for file in *.jpg *.png; do
  cwebp -q 80 "$file" -o "${file%.*}.webp"
done
```

### 방법 C: Cloudflare 자동 변환 (배포 시)

Cloudflare Pages에서 자동 WebP 변환 활성화:
1. Cloudflare 대시보드 → 해당 도메인 선택
2. Speed → Optimization → Image Optimization
3. "Polish" 활성화 → WebP 자동 제공

---

## 2. 권장 이미지 설정

### 시설 사진 (facility-*.webp)
- **크기**: 1200 x 800px (16:9 비율)
- **품질**: 80%
- **예상 용량**: 50-100KB (JPEG 대비 30% 감소)

### 의료진 사진 (doctor-*.webp)
- **크기**: 600 x 800px (3:4 비율)
- **품질**: 85%
- **예상 용량**: 40-80KB

### 치료 전후 사진 (before-after-*.webp)
- **크기**: 800 x 600px
- **품질**: 85%
- **예상 용량**: 30-60KB

### 히어로/배경 이미지
- **크기**: 1920 x 1080px (최대)
- **품질**: 75-80%
- **예상 용량**: 100-200KB

---

## 3. HTML에서 WebP 사용 (Fallback 포함)

```html
<!-- 방법 1: <picture> 태그 (권장) -->
<picture>
  <source srcset="/images/facility-lobby.webp" type="image/webp">
  <source srcset="/images/facility-lobby.jpg" type="image/jpeg">
  <img src="/images/facility-lobby.jpg" 
       alt="프리미엄 로비" 
       loading="lazy" 
       decoding="async"
       width="1200" 
       height="800">
</picture>

<!-- 방법 2: WebP만 사용 (97%+ 브라우저 지원) -->
<img src="/images/facility-lobby.webp" 
     alt="프리미엄 로비" 
     loading="lazy" 
     decoding="async"
     width="1200" 
     height="800">
```

---

## 4. 체크리스트

### 업로드 전 확인
- [ ] WebP 포맷으로 변환했는가?
- [ ] 품질 80-85%로 압축했는가?
- [ ] 파일 크기가 200KB 이하인가?
- [ ] 적절한 크기로 리사이즈했는가?

### HTML 적용 시 확인
- [ ] `loading="lazy"` 추가 (히어로 제외)
- [ ] `decoding="async"` 추가
- [ ] `width`, `height` 명시 (CLS 방지)
- [ ] `alt` 텍스트 작성 (SEO/접근성)

---

## 5. 현재 필요한 이미지 목록

### 시설 사진 (우선순위 높음)
| 파일명 | 설명 | 권장 크기 |
|--------|------|-----------|
| `facility-lobby.webp` | 프리미엄 로비 | 1200x800 |
| `facility-treatment.webp` | 첨단 진료실 | 1200x800 |
| `facility-surgery.webp` | 무균 수술실 | 1200x800 |
| `facility-equipment.webp` | 3D CT | 1200x800 |
| `facility-pediatric.webp` | 소아치과 전용 | 1200x800 |
| `facility-lab.webp` | 원내 기공소 | 1200x800 |

### 히어로 이미지
| 파일명 | 설명 | 권장 크기 |
|--------|------|-----------|
| `hero-bg.webp` | 메인 히어로 배경 | 1920x1080 |
| `og-image.webp` | SNS 공유용 | 1200x630 |

---

## 6. 자동화 스크립트 (선택)

`/scripts/optimize-images.sh` 파일 생성:

```bash
#!/bin/bash
# 이미지 자동 최적화 스크립트

IMAGE_DIR="./images"
QUALITY=80

echo "🖼️ 이미지 최적화 시작..."

# JPG/PNG → WebP 변환
for file in "$IMAGE_DIR"/*.{jpg,jpeg,png}; do
  if [ -f "$file" ]; then
    output="${file%.*}.webp"
    cwebp -q $QUALITY "$file" -o "$output"
    echo "✅ 변환 완료: $output"
  fi
done

echo "🎉 모든 이미지 최적화 완료!"
```

---

## 참고 링크
- [WebP 공식 문서](https://developers.google.com/speed/webp)
- [Squoosh - 온라인 이미지 압축](https://squoosh.app/)
- [Cloudflare Image Optimization](https://developers.cloudflare.com/images/)

---

*마지막 업데이트: 2024-12-25*
