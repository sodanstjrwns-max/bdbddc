#!/bin/bash
# 리뷰 섹션을 "네이버/구글 리뷰 확인하러 가기" 외부 링크로 대체하는 스크립트

REPLACEMENT='  <!-- ═══════ REVIEWS (외부 리뷰 링크) ═══════ -->
  <section class="reviews-section section" aria-label="리뷰 확인">
    <div class="reviews-container">
      <div class="reviews-header reveal">
        <span class="section-badge">환자분들의 생생한 이야기</span>
        <h2>서울비디치과의<br><span class="highlight">리뷰를 확인해보세요</span></h2>
        <p>네이버, 구글에서 직접 확인하실 수 있습니다</p>
      </div>
      
      <div class="reviews-external-links reveal" style="display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:32px;margin-bottom:24px;">
        <a href="https://m.place.naver.com/hospital/1100944042/review/visitor" target="_blank" rel="noopener" 
           style="display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:#03C75A;color:white;border-radius:12px;text-decoration:none;font-size:1rem;font-weight:700;transition:all 0.3s;box-shadow:0 4px 14px rgba(3,199,90,0.3);"
           onmouseover="this.style.transform='"'"'translateY(-2px)'"'"';this.style.boxShadow='"'"'0 6px 20px rgba(3,199,90,0.4)'"'"'" 
           onmouseout="this.style.transform='"'"'translateY(0)'"'"';this.style.boxShadow='"'"'0 4px 14px rgba(3,199,90,0.3)'"'"'">
          <i class="fas fa-star" style="font-size:1.2rem;"></i> 네이버 리뷰 확인하기
        </a>
        <a href="https://www.google.com/maps/place/%EC%84%9C%EC%9A%B8%EB%B9%84%EB%94%94%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90+%EB%B6%88%EB%8B%B9%EB%B3%B8%EC%A0%90/reviews" target="_blank" rel="noopener"
           style="display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:#4285F4;color:white;border-radius:12px;text-decoration:none;font-size:1rem;font-weight:700;transition:all 0.3s;box-shadow:0 4px 14px rgba(66,133,244,0.3);"
           onmouseover="this.style.transform='"'"'translateY(-2px)'"'"';this.style.boxShadow='"'"'0 6px 20px rgba(66,133,244,0.4)'"'"'" 
           onmouseout="this.style.transform='"'"'translateY(0)'"'"';this.style.boxShadow='"'"'0 4px 14px rgba(66,133,244,0.3)'"'"'">
          <i class="fab fa-google" style="font-size:1.2rem;"></i> 구글 리뷰 확인하기
        </a>
      </div>
    </div>
  </section>'

echo "========================================="
echo "  리뷰 섹션 제거 및 대체 스크립트"
echo "========================================="

# 1. area/*.html - 리뷰 섹션 교체 (88개 파일)
echo ""
echo "--- 1. area/*.html 처리 중 ---"
area_count=0
for f in area/*.html; do
  if grep -q 'reviews-section' "$f" 2>/dev/null; then
    # sed로 reviews-section 전체를 삭제 (<!-- ═══════ REVIEWS ═══════ --> 부터 </section> 까지)
    python3 -c "
import re, sys
with open('$f', 'r') as fp:
    content = fp.read()
# reviews-section 블록 전체 교체
pattern = r'  <!-- ═+\s*REVIEWS\s*═+ -->.*?</section>'
replacement = '''$REPLACEMENT'''
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
if new_content != content:
    with open('$f', 'w') as fp:
        fp.write(new_content)
    print(f'  Updated: $f')
    sys.exit(0)
else:
    # 대안: reviews-section section 찾기
    pattern2 = r'<section class=\"reviews-section section\"[^>]*>.*?</section>'
    new_content2 = re.sub(pattern2, replacement, content, flags=re.DOTALL)
    if new_content2 != content:
        with open('$f', 'w') as fp:
            fp.write(new_content2)
        print(f'  Updated (alt): $f')
        sys.exit(0)
    else:
        print(f'  SKIPPED: $f')
        sys.exit(1)
"
    if [ $? -eq 0 ]; then
      area_count=$((area_count + 1))
    fi
  fi
done
echo "  Area files updated: ${area_count}"

echo ""
echo "--- 완료 ---"
