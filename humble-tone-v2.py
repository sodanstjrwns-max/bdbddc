#!/usr/bin/env python3
"""
착한 톤 수정 스크립트 v2
- 혁신/업계/선도 → 환자 중심 표현
- 최적의 → 적합한/맞춤
"""

import os

# 수정할 표현들
replacements = [
    # 혁신 표현 수정
    ("치과 경험의 혁신을 위한 헌신", "더 나은 치과 경험을 위해 노력합니다"),
    ("예방과 혁신", "예방과 관리"),
    
    # 최적의 → 환자 맞춤으로
    ("최적의 치과 서비스 제공", "치과 서비스를 제공"),
    ("환자별 최적의 치료를 설계", "환자분께 맞는 치료를 설계"),
    ("최적의 치료 계획을 수립", "적합한 치료 계획을 수립"),
    ("최적의 치료 계획을 세웁니다", "적합한 치료 계획을 세웁니다"),
    ("최적의 치료를 제안", "적합한 치료를 제안"),
    ("최적의 디자인을 결정", "적합한 디자인을 결정"),
    ("최적의 결과를 얻을", "좋은 결과를 얻을"),
    
    # 충청권 대표 규모 → 중립 표현
    ("충청권 대표 규모 치과", "치과"),
]

def apply_replacements(content):
    """텍스트에 교체 적용"""
    modified = content
    changes = []
    
    for old, new in replacements:
        if old in modified:
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
    
    for root, dirs, files in os.walk(public_dir):
        dirs[:] = [d for d in dirs if d != 'backup']
        
        for file in files:
            if file.endswith('.html') and 'backup' not in file:
                filepath = os.path.join(root, file)
                changes = process_html_file(filepath)
                if changes:
                    rel_path = os.path.relpath(filepath, public_dir)
                    all_changes[rel_path] = changes
    
    print("=" * 60)
    print("🙏 착한 톤 v2 적용 완료")
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
