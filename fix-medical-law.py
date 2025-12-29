import os
import re
from pathlib import Path

fixes_applied = []

def fix_file(filepath, fixes):
    """파일에 여러 수정 적용"""
    content = Path(filepath).read_text(encoding='utf-8')
    original = content
    
    for old, new, desc in fixes:
        if old in content:
            content = content.replace(old, new)
            fixes_applied.append(f"{filepath}: {desc}")
    
    if content != original:
        Path(filepath).write_text(content, encoding='utf-8')
        return True
    return False

# ========================================
# 1. index.html - 리뷰 섹션 완전 제거
# ========================================
index_path = 'public/index.html'
content = Path(index_path).read_text(encoding='utf-8')

# 리뷰 섹션 제거 (1975줄 ~ 2201줄)
review_section_pattern = r'  <!-- ■ Reviews - 환자 후기.*?</section>\s*\n\s*<!-- ■ 서울비디치과에 오시면'
content = re.sub(review_section_pattern, '  <!-- ■ 서울비디치과에 오시면', content, flags=re.DOTALL)

# "50,000명 이상" 같은 검증 불가 통계 제거
content = content.replace('50,000명 이상의 환자분들이', '많은 환자분들이')

# "추천드려요" -> "안내드립니다"
content = content.replace('이런 분들께 추천드려요', '이런 분들께 안내드립니다')
content = content.replace('환자분께 정말 필요한 치료만 추천드립니다', '환자분께 정말 필요한 치료만 안내드립니다')

Path(index_path).write_text(content, encoding='utf-8')
fixes_applied.append(f"{index_path}: 리뷰 섹션 전체 제거")
fixes_applied.append(f"{index_path}: 검증 불가 통계 제거")

print("✅ index.html 리뷰 섹션 제거 완료")

# ========================================
# 2. 모든 HTML 파일에서 최상급 표현 수정
# ========================================
for html_file in Path('public').rglob('*.html'):
    if 'backup' in str(html_file):
        continue
        
    content = html_file.read_text(encoding='utf-8')
    original = content
    
    # 최상급 표현 수정
    replacements = [
        ('경기 남부 최고의 치과', '경기 남부 지역 치과'),
        ('충남권 최대 규모', '충남권 대형'),
        ('천안·아산 지역 최대 규모', '천안·아산 지역 대형'),
        ('천안·아산 최대 규모', '천안·아산 대형'),
        ('천안 최대 규모', '천안 대형'),
        ('최대 규모', '대형'),
        ('Best Dedication - 최고의 헌신', 'Best Dedication'),
        ('⭐ 최고 빠름', '빠름'),
        ('최고의 예방입니다', '좋은 예방입니다'),
        
        # 무료 관련 (환자 유인 우려)
        ('첫 방문 무료', '첫 방문 상담'),
        ('무료로 제공해 드립니다', '제공해 드립니다'),
        ('무료로 제공합니다', '제공합니다'),
        ('검진을 무료로', '검진을'),
        ('정밀 검진을 무료로 제공', '정밀 검진을 제공'),
        ('<strong>무료</strong>', '<strong>상담</strong>'),
        
        # 추천 -> 안내
        ('치과 추천', '치과 안내'),
        ('추천해줘', '알려줘'),
        ('추천해주세요', '알려주세요'),
        ('추천드려요', '안내드립니다'),
        
        # 비포/애프터 -> 치료 사례 (동의 필요 명시)
        ('비포/애프터', '치료 사례'),
        ('Before/After', '치료 사례'),
        
        # 이벤트 관련
        ('12월 인비절라인 특별 안내', '인비절라인 진료 안내'),
        
        # 만족도/평점 제거
        ('네이버 평점 4.9/5.0', ''),
        ('평점 4.85', ''),
        ('만족도 98%', ''),
    ]
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
    
    if content != original:
        html_file.write_text(content, encoding='utf-8')
        print(f"✅ {html_file} 수정됨")

print(f"\n총 {len(fixes_applied)}개 수정 적용됨")
