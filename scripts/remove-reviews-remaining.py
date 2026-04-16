#!/usr/bin/env python3
"""남아있는 리뷰 섹션 + AggregateRating 정리"""

import re
import os
import glob

BASE = '/home/user/webapp'

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

# 1. 남은 치료 페이지 리뷰 카드 제거
print("--- 남은 치료 페이지 리뷰 제거 ---")
remaining_files = [
    'treatments/glownate.html',
    'treatments/orthodontics.html',
    'treatments/orthodontic-clippy-c.html',
]

for fname in remaining_files:
    fpath = os.path.join(BASE, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 패턴들 시도
    patterns = [
        # <!-- 환자 후기 --> 주석 포함 블록
        r'    <!-- 환자 후기 -->.*?<section[^>]*>.*?환자 후기.*?</section>',
        # 라미네이트 환자 후기 등 특수 제목
        r'    <section class="section">\s*\n\s*<div class="container">\s*\n\s*<div class="section-header">\s*\n\s*<h2>[^<]*<span class="text-gradient">환자 후기</span></h2>.*?</section>',
    ]
    
    for p in patterns:
        content = re.sub(p, TREATMENT_REVIEW_REPLACEMENT, content, flags=re.DOTALL)
    
    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  ✅ {fname}')
    else:
        print(f'  ⚠️ {fname} - no match')

# 2. 남은 AggregateRating 제거
print("\n--- 남은 AggregateRating 제거 ---")
all_html = (
    glob.glob(os.path.join(BASE, '*.html')) +
    glob.glob(os.path.join(BASE, 'treatments', '*.html')) +
    glob.glob(os.path.join(BASE, 'faq', '*.html')) +
    glob.glob(os.path.join(BASE, 'cases', '*.html')) +
    glob.glob(os.path.join(BASE, 'blog', '*.html')) +
    glob.glob(os.path.join(BASE, 'encyclopedia', '*.html')) +
    glob.glob(os.path.join(BASE, 'notice', '*.html')) +
    glob.glob(os.path.join(BASE, 'video', '*.html'))
)

schema_count = 0
for fpath in sorted(set(all_html)):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'AggregateRating' not in content and 'ratingValue' not in content and 'reviewCount' not in content:
            continue
            
        original = content
        
        # JSON-LD 내 aggregateRating 객체 제거
        content = re.sub(r',\s*"aggregateRating"\s*:\s*\{[^}]*\}', '', content)
        content = re.sub(r'"aggregateRating"\s*:\s*\{[^}]*\}\s*,?', '', content)
        
        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            schema_count += 1
            print(f'  ✅ {os.path.relpath(fpath, BASE)}')
    except Exception as e:
        print(f'  ❌ {fpath}: {e}')

print(f"\n  Schema 추가 제거: {schema_count}개")
