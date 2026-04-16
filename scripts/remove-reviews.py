#!/usr/bin/env python3
"""
리뷰/후기 섹션을 '네이버/구글 리뷰 확인하러 가기' 외부 링크로 대체하는 스크립트
의료법 준수를 위해 사이트 내 직접 환자 후기 게재를 제거합니다.
"""

import re
import os
import glob

# 대체할 HTML (외부 리뷰 링크 섹션)
REVIEW_REPLACEMENT = '''  <!-- ═══════ REVIEWS (외부 리뷰 링크) ═══════ -->
  <section class="reviews-section section" aria-label="리뷰 확인">
    <div class="reviews-container">
      <div class="reviews-header reveal">
        <span class="section-badge">환자분들의 생생한 이야기</span>
        <h2>서울비디치과의<br><span class="highlight">리뷰를 확인해보세요</span></h2>
        <p>네이버, 구글에서 직접 확인하실 수 있습니다</p>
      </div>
      
      <div class="reviews-external-links reveal" style="display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:32px;margin-bottom:24px;">
        <a href="https://m.place.naver.com/hospital/1100944042/review/visitor" target="_blank" rel="noopener" 
           style="display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:#03C75A;color:white;border-radius:12px;text-decoration:none;font-size:1rem;font-weight:700;transition:all 0.3s;box-shadow:0 4px 14px rgba(3,199,90,0.3);">
          <i class="fas fa-star" style="font-size:1.2rem;"></i> 네이버 리뷰 확인하기
        </a>
        <a href="https://www.google.com/maps/place/%EC%84%9C%EC%9A%B8%EB%B9%84%EB%94%94%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90+%EB%B6%88%EB%8B%B9%EB%B3%B8%EC%A0%90/@36.8098754,127.1089753/reviews" target="_blank" rel="noopener"
           style="display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:#4285F4;color:white;border-radius:12px;text-decoration:none;font-size:1rem;font-weight:700;transition:all 0.3s;box-shadow:0 4px 14px rgba(66,133,244,0.3);">
          <i class="fab fa-google" style="font-size:1.2rem;"></i> 구글 리뷰 확인하기
        </a>
      </div>
    </div>
  </section>'''

# 치료 페이지용 대체 HTML (v2 스타일)
TREATMENT_REVIEW_REPLACEMENT = '''    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>환자 <span class="text-gradient">리뷰 확인</span></h2>
          <p class="section-subtitle">네이버·구글에서 실제 리뷰를 확인해보세요</p>
        </div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:24px;">
          <a href="https://m.place.naver.com/hospital/1100944042/review/visitor" target="_blank" rel="noopener" 
             style="display:inline-flex;align-items:center;gap:10px;padding:14px 28px;background:#03C75A;color:white;border-radius:12px;text-decoration:none;font-size:0.95rem;font-weight:700;transition:all 0.3s;box-shadow:0 4px 14px rgba(3,199,90,0.3);">
            <i class="fas fa-star"></i> 네이버 리뷰 확인하기
          </a>
          <a href="https://www.google.com/maps/place/%EC%84%9C%EC%9A%B8%EB%B9%84%EB%94%94%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90+%EB%B6%88%EB%8B%B9%EB%B3%B8%EC%A0%90/@36.8098754,127.1089753/reviews" target="_blank" rel="noopener"
             style="display:inline-flex;align-items:center;gap:10px;padding:14px 28px;background:#4285F4;color:white;border-radius:12px;text-decoration:none;font-size:0.95rem;font-weight:700;transition:all 0.3s;box-shadow:0 4px 14px rgba(66,133,244,0.3);">
            <i class="fab fa-google"></i> 구글 리뷰 확인하기
          </a>
        </div>
      </div>
    </section>'''

BASE = '/home/user/webapp'
stats = {'area': 0, 'treatments': 0, 'index': 0, 'schema': 0, 'api': 0, 'errors': []}

def process_file(filepath, patterns, replacement, category):
    """파일에서 패턴을 찾아 대체"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for pattern in patterns:
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            stats[category] += 1
            print(f'  ✅ {filepath}')
            return True
        return False
    except Exception as e:
        stats['errors'].append(f'{filepath}: {e}')
        print(f'  ❌ {filepath}: {e}')
        return False


print("=" * 50)
print("  리뷰 섹션 제거 & 외부 링크 대체 스크립트")
print("=" * 50)

# ━━━ 1. area/*.html (88개) ━━━
print("\n--- 1. area/*.html ---")
area_files = sorted(glob.glob(os.path.join(BASE, 'area', '*.html')))
for f in area_files:
    # <!-- ═══════ REVIEWS ═══════ --> 부터 해당 </section> 까지
    patterns = [
        r'  <!-- ═+\s*REVIEWS\s*═+ -->.*?</section>',
        r'<section class="reviews-section section"[^>]*>.*?</section>',
    ]
    process_file(f, patterns, REVIEW_REPLACEMENT, 'area')
print(f"  Total area files: {stats['area']}/{len(area_files)}")

# ━━━ 2. treatments/*.html (50개) ━━━
print("\n--- 2. treatments/*.html ---")
treatment_files = sorted(glob.glob(os.path.join(BASE, 'treatments', '*.html')))
for f in treatment_files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    if 'review-card-v2' not in content and 'review-card' not in content:
        continue
    
    # 치료 페이지의 후기 섹션 (v2 스타일)
    # <section class="section"> 안에 "환자 후기" h2가 있는 블록
    patterns = [
        r'    <section class="section">\s*\n\s*<div class="container">\s*\n\s*<div class="section-header">\s*\n\s*<h2>실제 <span class="text-gradient">환자 후기</span></h2>.*?</section>',
    ]
    process_file(f, patterns, TREATMENT_REVIEW_REPLACEMENT, 'treatments')
print(f"  Total treatment files: {stats['treatments']}/{len(treatment_files)}")

# ━━━ 3. index.html ━━━
print("\n--- 3. index.html ---")
index_path = os.path.join(BASE, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# index.html의 리뷰 섹션 전체 교체
# reviews-section 시작부터 해당 section 끝까지 (구글 실시간 리뷰, 후기 작성 CTA 포함)
pattern = r'  <section class="reviews-section section" aria-label="환자 후기">.*?</section>'
content = re.sub(pattern, REVIEW_REPLACEMENT, content, flags=re.DOTALL)

# 구글 리뷰 API 호출 JS 제거
content = re.sub(
    r"    fetch\('/api/google-reviews'\).*?(?=\n    (?:fetch|document\.|window\.|//|<|}\s*\)))",
    '',
    content,
    flags=re.DOTALL
)

if content != original:
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    stats['index'] = 1
    print(f'  ✅ index.html')
else:
    print(f'  ⚠️ index.html - no change')

# ━━━ 4. Schema.org AggregateRating 제거 ━━━
print("\n--- 4. Schema.org AggregateRating 제거 ---")
schema_files = glob.glob(os.path.join(BASE, '*.html')) + \
               glob.glob(os.path.join(BASE, 'area', '*.html')) + \
               glob.glob(os.path.join(BASE, 'doctors', '*.html')) + \
               glob.glob(os.path.join(BASE, 'treatments', '*.html'))

for f in sorted(set(schema_files)):
    try:
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
        
        original = content
        
        # "aggregateRating" 객체 제거 (JSON-LD 내)
        # 패턴: ,"aggregateRating":{...} 또는 "aggregateRating":{...},
        content = re.sub(r',\s*"aggregateRating"\s*:\s*\{[^}]*\}', '', content)
        content = re.sub(r'"aggregateRating"\s*:\s*\{[^}]*\}\s*,?', '', content)
        
        if content != original:
            with open(f, 'w', encoding='utf-8') as fp:
                fp.write(content)
            stats['schema'] += 1
            print(f'  ✅ {f}')
    except Exception as e:
        stats['errors'].append(f'{f}: {e}')

print(f"  Total schema files updated: {stats['schema']}")

# ━━━ 5. src/index.tsx - 구글 리뷰 API 확인 ━━━
print("\n--- 5. src/index.tsx API 확인 ---")
tsx_path = os.path.join(BASE, 'src', 'index.tsx')
with open(tsx_path, 'r', encoding='utf-8') as f:
    tsx = f.read()

if 'google-reviews' in tsx:
    print('  ⚠️ src/index.tsx에 google-reviews API가 있습니다 (별도 처리 필요)')
    stats['api'] = 1
else:
    print('  ✅ google-reviews API 없음')

# ━━━ 결과 요약 ━━━
print("\n" + "=" * 50)
print("  결과 요약")
print("=" * 50)
print(f"  area/*.html:       {stats['area']}개 수정")
print(f"  treatments/*.html: {stats['treatments']}개 수정")
print(f"  index.html:        {stats['index']}개 수정")
print(f"  Schema.org 제거:   {stats['schema']}개 수정")
print(f"  API 확인:          {'있음 (별도처리)' if stats['api'] else '없음'}")
if stats['errors']:
    print(f"\n  ❌ 에러: {len(stats['errors'])}건")
    for e in stats['errors'][:5]:
        print(f"    {e}")
print()
