#!/usr/bin/env python3
"""
착한 톤으로 문장 수정 스크립트
- 자랑 표현 → 겸손한 표현
- 최상급 → 노력하는 자세
- 대규모/프리미엄 → 환자 중심 표현
"""

import os
import re

# 수정할 표현들 (순서 중요 - 긴 것부터)
replacements = [
    # 메타/SEO에서 대규모 표현 완화
    ("충남권 대규모 원내 기공소", "원내 기공소 운영"),
    ("대규모 인비절라인센터", "인비절라인센터"),
    ("인비절라인 대규모", "인비절라인센터"),
    ("대규모 센터", "교정센터"),
    ("대규모", ""),  # 단독 사용 시 제거
    
    # 프리미엄 표현 수정
    ("프리미엄 심미 치료", "맞춤 심미 치료"),
    ("프리미엄 환경", "깨끗한 환경"),
    ("프리미엄 로비", "편안한 로비"),
    ("프리미엄 세라믹", "맞춤 세라믹"),
    ("프리미엄 비주얼", "시설 안내"),
    ("프리미엄", "정성을 담은"),
    
    # Schema.org에서 과장된 숫자 표현 완화
    ("30,000건 이상의 임플란트 시술 경력과 6,000명 이상의 치과 원장 교육 이력 보유.", "다년간의 임플란트 시술 경험이 있습니다."),
    ("30,000건 이상", "다년간"),
    ("6,000명 이상", "많은"),
    
    # 전문/고급 표현 완화 (실제 자격은 유지)
    ("고난도 케이스 전문", "어려운 케이스도 진료"),
    ("전문 의료 시설", "의료 시설 안내"),
    
    # 충남권/천안 최대/대형 등
    ("천안 대규모 임플란트센터", "임플란트센터"),
    ("충남 대형 치과", "365일 진료 치과"),
    ("천안·아산 지역 대규모 치과", "천안·아산 지역 치과"),
    ("지역 대규모 치과", "지역 치과"),
]

def apply_replacements(content):
    """텍스트에 교체 적용"""
    modified = content
    changes = []
    
    for old, new in replacements:
        if old in modified:
            # 실제 변경될 횟수 카운트
            count = modified.count(old)
            if count > 0:
                modified = modified.replace(old, new)
                changes.append(f"  '{old}' → '{new}' ({count}회)")
    
    return modified, changes

def process_html_file(filepath):
    """HTML 파일 처리"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified, changes = apply_replacements(content)
        
        if changes:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified)
            return changes
        return []
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return []

def main():
    public_dir = '/home/user/webapp/public'
    all_changes = {}
    
    # HTML 파일들 처리
    for root, dirs, files in os.walk(public_dir):
        # 백업 파일 제외
        dirs[:] = [d for d in dirs if d != 'backup']
        
        for file in files:
            if file.endswith('.html') and 'backup' not in file:
                filepath = os.path.join(root, file)
                changes = process_html_file(filepath)
                if changes:
                    rel_path = os.path.relpath(filepath, public_dir)
                    all_changes[rel_path] = changes
    
    # 결과 출력
    print("=" * 60)
    print("🙏 착한 톤 적용 완료")
    print("=" * 60)
    
    if all_changes:
        print(f"\n총 {len(all_changes)}개 파일 수정됨:\n")
        for filepath, changes in all_changes.items():
            print(f"📄 {filepath}")
            for change in changes:
                print(change)
            print()
    else:
        print("변경 사항 없음")
    
    return len(all_changes)

if __name__ == '__main__':
    count = main()
    print(f"\n✅ 완료: {count}개 파일 수정")
