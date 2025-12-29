#!/usr/bin/env python3
"""
착한 톤 수정 스크립트 v4
- 대표 치과 → 치과
- 충청권 대표 → 원내
"""

import os

# 수정할 표현들
replacements = [
    # 대표 치과 → 치과
    ("충청권 대표 원내 기공소", "원내 기공소"),
    ("불당동 대표 치과", "365일 진료 치과"),
    ("천안 불당동 대표 치과", "천안 365일 진료 치과"),
    ("충북 대표 치과 경험", "365일 진료 치과"),
    ("중부권 대표 치과", "365일 진료 치과"),
    
    # 전문 수준의 시설 → 완화
    ("전문 수준의 시설과 장비", "다양한 시설과 장비"),
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
    print("🙏 착한 톤 v4 적용 완료")
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
