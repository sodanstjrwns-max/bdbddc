#!/usr/bin/env python3
"""
푸터에 사업자 정보 추가 스크립트
"""

import os
import re

# 추가할 사업자 정보 HTML
business_info = '''      <!-- 사업자 정보 -->
      <div class="footer-business" style="padding: 24px 0; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 24px;">
        <div style="display: flex; flex-wrap: wrap; gap: 16px 32px; justify-content: center; font-size: 0.8125rem; color: rgba(255,255,255,0.5); line-height: 1.8;">
          <span><strong>상호명:</strong> 서울비디치과의원</span>
          <span><strong>대표자:</strong> 문석준</span>
          <span><strong>사업자등록번호:</strong> 312-91-42580</span>
          <span><strong>전화:</strong> 041-415-2892</span>
          <span><strong>주소:</strong> 충남 천안시 서북구 불당34길 14, 1~5층</span>
        </div>
      </div>
      
      <div class="footer-legal">'''

def process_file(filepath):
    """파일에 사업자 정보 추가"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 사업자 정보가 있으면 스킵
        if 'footer-business' in content or '사업자등록번호' in content:
            return False
        
        # footer-legal 앞에 사업자 정보 추가
        if '<div class="footer-legal">' in content:
            modified = content.replace(
                '      <div class="footer-legal">',
                business_info
            )
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified)
            return True
        
        return False
    except Exception as e:
        print(f"Error: {filepath} - {e}")
        return False

def main():
    public_dir = '/home/user/webapp/public'
    updated = []
    
    for root, dirs, files in os.walk(public_dir):
        dirs[:] = [d for d in dirs if d != 'backup']
        
        for file in files:
            if file.endswith('.html') and 'backup' not in file:
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    rel_path = os.path.relpath(filepath, public_dir)
                    updated.append(rel_path)
    
    print(f"✅ {len(updated)}개 파일에 사업자 정보 추가됨:")
    for f in updated:
        print(f"  - {f}")

if __name__ == '__main__':
    main()
