#!/usr/bin/env python3
"""
서울비디치과 — 진료 페이지 본문에 백과사전 인라인 링크 자동 삽입
=====================================================================
위키피디아 스타일: 본문 텍스트에서 백과사전 용어가 나오면 첫 번째 출현에만 링크를 건다.

규칙:
1. 본문(<main> 내부)만 대상 — <head>, <nav>, <footer>, <script>, <style> 무시
2. 이미 <a> 태그 안에 있는 텍스트는 건너뜀 (이중 링크 방지)
3. 이미 기존 enc-term-link 클래스의 링크도 건너뜀
4. JSON-LD, 메타 태그 등 구조화 데이터 영역 무시
5. 각 용어는 페이지당 첫 출현 1회만 링크 (위키피디아 방식)
6. 3자 이상 용어만 매칭 (오탐 방지)
7. 긴 용어부터 먼저 매칭 (부분 매칭 방지: "네비게이션 임플란트"가 "임플란트"보다 먼저)
8. 링크 스타일: 밑줄 + 책 아이콘 툴팁으로 백과사전 링크임을 표시
"""

import json
import os
import re
import sys
from html.parser import HTMLParser

# ===== 설정 =====
ENCYCLOPEDIA_JSON = 'public/data/encyclopedia.json'
TREATMENT_DIR = 'treatments'
MIN_TERM_LENGTH = 3
DRY_RUN = '--dry-run' in sys.argv

# 링크로 변환하지 않을 영역의 태그들
SKIP_TAGS = {'script', 'style', 'noscript', 'code', 'pre', 'a', 'button', 'input', 'textarea', 'select', 'option', 'head'}
# 링크를 삽입할 본문 태그들 (이 안에 있는 텍스트만)
CONTENT_TAGS = {'p', 'li', 'td', 'th', 'span', 'div', 'strong', 'em', 'b', 'i', 'dd', 'dt', 'label', 'h2', 'h3', 'h4', 'h5', 'h6'}

# ===== 1. 용어 로드 =====
def load_terms():
    with open(ENCYCLOPEDIA_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    items = data['items']
    term_map = {}  # search_string → {term, short, url}
    
    for item in items:
        term = item['term']
        short = item['short']
        url = f"/encyclopedia/#{term}"
        
        # 메인 용어
        if len(term) >= MIN_TERM_LENGTH:
            term_map[term] = {'term': term, 'short': short, 'url': url}
        
        # 동의어도 같은 URL로 매핑
        for syn in item.get('synonyms', []):
            if len(syn) >= MIN_TERM_LENGTH and syn not in term_map:
                term_map[syn] = {'term': term, 'short': short, 'url': url}
    
    # 긴 용어부터 정렬 (부분 매칭 방지)
    sorted_terms = sorted(term_map.keys(), key=lambda x: -len(x))
    return term_map, sorted_terms


# ===== 2. HTML 본문 영역에서 안전하게 용어 링크 삽입 =====
def add_links_to_html(html_content, term_map, sorted_terms, filename=""):
    """
    전략: 정규식으로 HTML을 토큰 분리 → 텍스트 노드만 치환
    
    - HTML 태그는 그대로 유지
    - <script>, <style>, <a> 등 SKIP_TAGS 내부는 건너뜀
    - <main> 안에서만 작업 (있으면)
    - 각 용어는 페이지당 1회만 링크
    """
    
    linked_terms = set()  # 이미 링크한 용어 (canonical term 기준)
    stats = {'total_links': 0, 'terms': []}
    
    # main 태그 영역 찾기
    main_start = re.search(r'<main[^>]*>', html_content, re.IGNORECASE)
    main_end = html_content.rfind('</main>')
    
    if not main_start or main_end < 0:
        # main 태그가 없으면 body 전체
        main_start_pos = 0
        main_end_pos = len(html_content)
    else:
        main_start_pos = main_start.end()
        main_end_pos = main_end
    
    # 본문 영역 추출
    before = html_content[:main_start_pos]
    main_body = html_content[main_start_pos:main_end_pos]
    after = html_content[main_end_pos:]
    
    # encyclopedia-terms-section은 건너뜀 (이미 백과사전 링크 모음이 있으므로)
    enc_section_pattern = r'(<section[^>]*id="encyclopedia-terms-section"[^>]*>.*?</section>)'
    enc_sections = list(re.finditer(enc_section_pattern, main_body, re.DOTALL))
    
    # CTA 섹션, footer, breadcrumb, hero 등 비본문 영역 제외
    skip_patterns = [
        r'(<section\s+class="cta-section"[^>]*>.*?</section>)',
        r'(<footer[^>]*>.*?</footer>)',
        r'(<nav[^>]*>.*?</nav>)',
        r'(<script[^>]*>.*?</script>)',
        r'(<style[^>]*>.*?</style>)',
        r'(<div\s+class="breadcrumb"[^>]*>.*?</div>)',  # breadcrumb 제외
        r'(<section\s+class="[^"]*hero[^"]*"[^>]*>.*?</section>)',  # hero 섹션 제외
        r'(<section\s+class="section-sm"[^>]*>\s*<div class="container">\s*<div[^>]*>\s*<a[^>]*관련 진료.*?</section>)',  # 관련 진료 링크 섹션
    ]
    
    # 건너뛸 영역 인덱스 수집
    skip_ranges = []
    for sec in enc_sections:
        skip_ranges.append((sec.start(), sec.end()))
    for pat in skip_patterns:
        for m in re.finditer(pat, main_body, re.DOTALL | re.IGNORECASE):
            skip_ranges.append((m.start(), m.end()))
    
    # 본문을 HTML 태그와 텍스트로 분리
    # 토큰: HTML 태그 or 텍스트
    token_pattern = re.compile(r'(<[^>]+>)')
    tokens = token_pattern.split(main_body)
    
    # 태그 스택 (현재 어떤 태그 안에 있는지 추적)
    tag_stack = []
    result_tokens = []
    current_pos = 0  # main_body 내 위치 추적
    
    for token in tokens:
        token_start = current_pos
        token_end = current_pos + len(token)
        
        # 건너뛸 영역인지 체크
        in_skip_range = any(s <= token_start < e for s, e in skip_ranges)
        
        if token.startswith('<'):
            # HTML 태그
            result_tokens.append(token)
            
            # 닫는 태그
            close_match = re.match(r'</(\w+)', token)
            if close_match:
                tag_name = close_match.group(1).lower()
                if tag_stack and tag_stack[-1] == tag_name:
                    tag_stack.pop()
            else:
                # 여는 태그
                open_match = re.match(r'<(\w+)', token)
                if open_match:
                    tag_name = open_match.group(1).lower()
                    # 자기 닫힘 태그가 아니면 스택에 추가
                    if not token.rstrip().endswith('/>') and tag_name not in ('br', 'hr', 'img', 'input', 'meta', 'link', 'col', 'area', 'base', 'embed', 'source', 'track', 'wbr'):
                        tag_stack.append(tag_name)
        else:
            # 텍스트 노드
            # SKIP_TAGS 안에 있으면 건너뜀
            in_skip_tag = any(t in SKIP_TAGS for t in tag_stack)
            
            if in_skip_tag or in_skip_range or not token.strip():
                result_tokens.append(token)
            else:
                # 용어 매칭 및 링크 삽입
                modified_token = token
                for search_term in sorted_terms:
                    canonical = term_map[search_term]['term']
                    
                    if canonical in linked_terms:
                        continue
                    
                    # 텍스트에서 용어 찾기 (단어 경계 유사 매칭)
                    # 한국어는 \b가 안 먹으므로 간단한 위치 체크
                    idx = modified_token.find(search_term)
                    if idx < 0:
                        continue
                    
                    # 이미 HTML 태그 안에 있는지 확인 (이전 치환으로 생긴 <a> 안)
                    before_text = modified_token[:idx]
                    # 마지막으로 열린 <a>가 닫히지 않았으면 건너뜀
                    open_a = before_text.rfind('<a ')
                    close_a = before_text.rfind('</a>')
                    if open_a > close_a:
                        continue
                    
                    info = term_map[search_term]
                    tooltip_text = info['short'][:50]
                    link_html = (
                        f'<a href="{info["url"]}" class="enc-inline-link" '
                        f'title="{tooltip_text}" '
                        f'data-enc-term="{canonical}">'
                        f'{search_term}</a>'
                    )
                    
                    # 첫 번째 출현만 치환
                    modified_token = modified_token[:idx] + link_html + modified_token[idx + len(search_term):]
                    linked_terms.add(canonical)
                    stats['total_links'] += 1
                    stats['terms'].append(canonical)
                
                result_tokens.append(modified_token)
        
        current_pos = token_end
    
    new_main_body = ''.join(result_tokens)
    new_html = before + new_main_body + after
    
    return new_html, stats


# ===== 3. CSS 스타일 삽입 =====
def add_inline_link_css(html_content):
    """enc-inline-link 스타일을 <head>에 추가 (없으면)"""
    if 'enc-inline-link' in html_content and '<style' in html_content and 'enc-inline-link' in html_content.split('</head>')[0]:
        return html_content  # 이미 있음
    
    css = """
  <!-- Encyclopedia Inline Link Style -->
  <style>
    .enc-inline-link {
      color: #6B4226;
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 3px;
      text-decoration-color: #c9a96e;
      cursor: help;
      transition: all 0.2s;
      position: relative;
    }
    .enc-inline-link:hover {
      color: #c9a96e;
      text-decoration-style: solid;
    }
    /* 툴팁 */
    .enc-inline-link:hover::after {
      content: attr(title);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.78rem;
      white-space: nowrap;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .enc-inline-link:hover::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #333;
      pointer-events: none;
      z-index: 1000;
    }
  </style>
"""
    # </head> 직전에 삽입
    return html_content.replace('</head>', css + '</head>', 1)


# ===== 메인 실행 =====
def main():
    print("=" * 70)
    print("  서울비디치과 — 백과사전 인라인 링크 자동 삽입")
    print("=" * 70)
    
    if DRY_RUN:
        print("⚠️  DRY RUN 모드 — 파일 변경 없이 시뮬레이션만 합니다\n")
    
    # 1. 용어 로드
    term_map, sorted_terms = load_terms()
    print(f"📖 백과사전 용어: {len(term_map)}개 (3자 이상, 동의어 포함)")
    print(f"📄 진료 페이지: {len(os.listdir(TREATMENT_DIR))}개\n")
    
    # 2. 각 진료 페이지 처리
    total_links = 0
    total_files = 0
    
    for fname in sorted(os.listdir(TREATMENT_DIR)):
        if not fname.endswith('.html'):
            continue
        
        filepath = os.path.join(TREATMENT_DIR, fname)
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()
        
        # 링크 삽입
        modified, stats = add_links_to_html(original, term_map, sorted_terms, fname)
        
        # CSS 추가
        modified = add_inline_link_css(modified)
        
        if stats['total_links'] > 0:
            total_links += stats['total_links']
            total_files += 1
            
            terms_preview = ', '.join(stats['terms'][:8])
            more = f" ... +{len(stats['terms'])-8}" if len(stats['terms']) > 8 else ""
            print(f"  ✅ {fname:40s} → {stats['total_links']:3d}개 링크 | {terms_preview}{more}")
            
            if not DRY_RUN:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(modified)
        else:
            print(f"  ⚪ {fname:40s} → 매칭 없음")
    
    print(f"\n{'=' * 70}")
    print(f"  완료: {total_files}개 파일에 총 {total_links}개 인라인 링크 삽입")
    if DRY_RUN:
        print("  ⚠️  DRY RUN — 실제 파일은 변경되지 않았습니다")
    print(f"{'=' * 70}")


if __name__ == '__main__':
    main()
