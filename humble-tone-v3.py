#!/usr/bin/env python3
"""
착한 톤 수정 스크립트 v3
- 완벽한/뛰어난 → 겸손한 표현
"""

import os

# 수정할 표현들
replacements = [
    # 완벽 → 자연스러운/좋은
    ("완벽한 결과를 만듭니다", "좋은 결과를 위해 노력합니다"),
    ("완벽하게 보호합니다", "튼튼하게 보호합니다"),
    ("완벽한 적합도를 구현합니다", "높은 적합도를 추구합니다"),
    ("완벽하게 조화되는", "자연스럽게 조화되는"),
    ("완벽한 색상", "자연스러운 색상"),
    ("완벽한 품질", "좋은 품질"),
    
    # 뛰어난 → 좋은
    ("뛰어난 저작력", "좋은 저작력"),
    ("뛰어난 심미성", "자연스러운 심미성"),
    ("뛰어난 내구성", "좋은 내구성"),
    ("뛰어난 기술", "숙련된 기술"),
    
    # 최적의 착용감 → 편안한 착용감
    ("최적의 착용감을 제공합니다", "편안한 착용감을 추구합니다"),
    ("최적의 재료를 선택합니다", "적합한 재료를 선택합니다"),
    
    # 충청권 대표 규모 → 중립 표현
    ("충청권 대표 규모", "원내 기공소"),
    
    # 최대한 보존 → 최대한은 OK (환자 이익)
    # 단, "최대" 단독 사용은 수정
    ("최대의 효과", "좋은 효과"),
    ("최대의 결과", "좋은 결과"),
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
    print("🙏 착한 톤 v3 적용 완료")
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
