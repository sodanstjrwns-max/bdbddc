#!/bin/bash
cd /home/user/webapp

# OG 이미지 매핑 테이블
# 새 이미지 경로 base: https://bdbddc.com/images/og/
# 기존 이미지 유지: og-implant.jpg, og-invisalign.jpg, og-pediatric.jpg, og-sedation.jpg, og-glownate.jpg, og-checkup.jpg

OLD_DEFAULT="https://bdbddc.com/images/og-image-v2.jpg"
NEW_BASE="https://bdbddc.com/images/og"

count=0

replace_og() {
  local file="$1"
  local new_image="$2"
  local old_image
  old_image=$(grep -o 'og:image" content="[^"]*"' "$file" 2>/dev/null | head -1 | sed 's/og:image" content="//;s/"$//')
  
  if [ -z "$old_image" ]; then
    return  # og:image 태그 없으면 스킵
  fi
  
  if [ "$old_image" != "$new_image" ]; then
    sed -i "s|${old_image}|${new_image}|g" "$file"
    echo "✅ $file: $old_image → $new_image"
    count=$((count + 1))
  fi
}

echo "=== OG 이미지 일괄 매핑 시작 ==="
echo ""

# ─── 1. 메인 페이지 (기존 유지) ───
echo "--- 메인 페이지 ---"
# index.html은 기존 og-image-v2.jpg 유지

# ─── 2. 임플란트 관련 ───
echo "--- 임플란트 ---"
for f in treatments/implant.html treatments/implant-*.html treatments/fixture-*.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/implant.jpg"
done

# ─── 3. 교정 관련 ───
echo "--- 교정 ---"
for f in treatments/orthodontics.html treatments/orthodontic-*.html treatments/ortho-*.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/orthodontics.jpg"
done
for f in treatments/invisalign.html treatments/invisalign-*.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/orthodontics.jpg"
done

# ─── 4. 소아치과 ───
echo "--- 소아치과 ---"
replace_og "treatments/pediatric.html" "${NEW_BASE}/pediatric.jpg"

# ─── 5. 보존과 (충치/신경치료/레진/인레이/크라운) ───
echo "--- 보존과 ---"
for f in treatments/cavity.html treatments/root-canal.html treatments/re-root-canal.html treatments/resin.html treatments/inlay.html treatments/crown.html treatments/apicoectomy.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/conservative.jpg"
done

# ─── 6. 수면치료 ───
echo "--- 수면치료 ---"
replace_og "treatments/sedation.html" "${NEW_BASE}/sedation.jpg"

# ─── 7. 심미치료 (글로우네이트/라미네이트/미백/브릿지/틀니) ───
echo "--- 심미치료 ---"
for f in treatments/aesthetic.html treatments/glownate.html treatments/whitening.html treatments/bridge.html treatments/denture.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/aesthetic.jpg"
done

# ─── 8. 잇몸/치주 ───
echo "--- 잇몸 ---"
for f in treatments/gum.html treatments/gum-surgery.html treatments/periodontitis.html treatments/scaling.html treatments/prevention.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/conservative.jpg"
done

# ─── 9. 구강내과 (턱관절/이갈이/응급) ───
echo "--- 구강내과 ---"
for f in treatments/tmj.html treatments/bruxism.html treatments/oral-medicine.html treatments/emergency.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/conservative.jpg"
done

# ─── 10. 사랑니 ───
echo "--- 사랑니 ---"
replace_og "treatments/wisdom-tooth.html" "${NEW_BASE}/conservative.jpg"

# ─── 11. 진료 인덱스 ───
echo "--- 진료 인덱스 ---"
replace_og "treatments/index.html" "${NEW_BASE}/implant.jpg"

# ─── 12. 의료진 관련 전체 ───
echo "--- 의료진 ---"
for f in doctors/index.html doctors/moon.html doctors/representative.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/doctors.jpg"
done
for f in doctors/choi.html doctors/hyun.html doctors/jo.html doctors/kang.html doctors/kang-mj.html doctors/kim.html doctors/kim-mg.html doctors/kim-mj.html doctors/lee.html doctors/lee-bm.html doctors/lim.html doctors/park.html doctors/park-sb.html doctors/seo.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/doctors.jpg"
done
for f in doctors/orthodontics.html doctors/pediatric.html doctors/conservative.html doctors/oral-medicine.html doctors/integrated-dentistry.html doctors/general.html doctors/implant.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/doctors.jpg"
done

# ─── 13. 병원안내 ───
echo "--- 병원안내 ---"
replace_og "reservation.html" "${NEW_BASE}/reservation.jpg"
replace_og "directions.html" "${NEW_BASE}/directions.jpg"
replace_og "pricing.html" "${NEW_BASE}/pricing.jpg"
replace_og "mission.html" "${NEW_BASE}/doctors.jpg"
replace_og "floor-guide.html" "${NEW_BASE}/directions.jpg"
replace_og "careers.html" "${NEW_BASE}/doctors.jpg"
replace_og "flight.html" "${NEW_BASE}/directions.jpg"
replace_og "checkup.html" "${NEW_BASE}/reservation.jpg"

# ─── 14. FAQ 관련 ───
echo "--- FAQ ---"
replace_og "faq.html" "${NEW_BASE}/faq.jpg"
for f in faq/*.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/faq.jpg"
done

# ─── 15. 블로그/칼럼/비디오/공지 ───
echo "--- 콘텐츠 ---"
replace_og "blog/index.html" "${NEW_BASE}/blog.jpg"
replace_og "video/index.html" "${NEW_BASE}/blog.jpg"
replace_og "notice/index.html" "${NEW_BASE}/blog.jpg"
for f in column/index.html column/columns.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/blog.jpg"
done

# ─── 16. 백과사전 ───
echo "--- 백과사전 ---"
replace_og "encyclopedia/index.html" "${NEW_BASE}/encyclopedia.jpg"

# ─── 17. 지역 SEO 페이지 전체 (88개) ───
echo "--- 지역 SEO ---"
for f in area/*.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/area-seo.jpg"
done

# ─── 18. 기타 ───
echo "--- 기타 ---"
replace_og "games.html" "${NEW_BASE}/faq.jpg"
replace_og "symptom-checker.html" "${NEW_BASE}/faq.jpg"
replace_og "run.html" "${NEW_BASE}/reservation.jpg"
replace_og "404.html" "${OLD_DEFAULT}"  # 404는 기본 유지

# ─── 19. 케이스/갤러리 ───
echo "--- 케이스 ---"
for f in cases/index.html cases/gallery.html; do
  [ -f "$f" ] && replace_og "$f" "${NEW_BASE}/aesthetic.jpg"
done

echo ""
echo "=== 완료: ${count}개 파일 업데이트 ==="
