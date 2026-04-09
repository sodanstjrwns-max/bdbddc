#!/usr/bin/env python3
"""
서울비디치과 — 진료 페이지 본문에 백과사전 인라인 링크 자동 삽입 v2
=====================================================================
위키피디아 스타일: 본문 텍스트에서 백과사전 용어가 나오면 첫 번째 "링크 가능한" 출현에 링크를 건다.

v2 핵심 개선:
1. 첫 출현이 <a> 태그 안이면 포기하지 않고 다음 출현에서 링크 (v1은 포기)
2. FAQ 답변 본문도 링크 대상 포함
3. 정확한 <a> depth 추적 (중첩 <a> 태그 정확 계산)
4. encyclopedia-terms-section 내부만 정확히 건너뜀
5. 기존 enc-inline-link, enc-term-link 내부 건너뜀

규칙:
1. <main> 내부만 대상 — <head>, <nav>, <footer>, <script>, <style> 무시
2. 이미 <a> 태그 안에 있는 텍스트는 건너뜀 (HTML 중첩 방지)
3. 각 용어는 페이지당 "링크 가능한 첫 출현" 1회만 링크 (위키피디아 방식)
4. 3자 이상 용어만 매칭 (오탐 방지)
5. 긴 용어부터 먼저 매칭 (부분 매칭 방지)
6. 링크 스타일: 밑줄 + 툴팁
"""

import json
import os
import re
import sys
from html.parser import HTMLParser

# ===== 설정 =====
ENCYCLOPEDIA_JSON = 'public/data/encyclopedia.json'
TREATMENT_DIR = 'treatments'
FAQ_DIR = 'faq'
FAQ_MAIN = 'faq.html'
MIN_TERM_LENGTH = 3
DRY_RUN = '--dry-run' in sys.argv

# HTML에서 절대 건드리지 않을 태그들
# button은 FAQ 질문 토글이므로 내부에 <a> 링크 삽입하면 HTML 깨짐 → SKIP 유지
SKIP_TAGS = {'script', 'style', 'noscript', 'code', 'pre', 'input', 'textarea', 'select', 'option', 'button'}
# Self-closing 태그들
VOID_TAGS = {'br', 'hr', 'img', 'input', 'meta', 'link', 'col', 'area', 'base', 'embed', 'source', 'track', 'wbr'}


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
    
    # 동의어 → canonical 매핑에서 동의어도 독립적으로 링크 가능하게
    # 예: "3D CT"는 canonical이 "CBCT"지만, "CBCT"가 이미 링크되어도 "3D CT"도 별도로 링크
    # 이를 위해 search_term 자체를 linked_terms 키로 사용 (canonical 아닌)
    
    # 긴 용어부터 정렬 (부분 매칭 방지)
    sorted_terms = sorted(term_map.keys(), key=lambda x: -len(x))
    return term_map, sorted_terms


# ===== 2. HTML 파싱 후 안전한 링크 삽입 =====
def add_links_to_html(html_content, term_map, sorted_terms, filename=""):
    """
    전략: HTML을 토큰으로 분리하고, 각 텍스트 토큰의 "링크 가능성"을 정확히 판단.
    
    핵심 개선: "링크 가능한 첫 출현"에 링크를 건다.
    - <a> 태그 내부 → 스킵 (다음 출현 시도)
    - <script>/<style> 내부 → 무시
    - encyclopedia-terms-section 내부 → 무시
    - hero 섹션 내부 → 스킵 (다음 출현 시도)
    - 그 외 텍스트 노드 → 링크!
    """
    
    linked_terms = set()  # 이미 링크한 용어 (canonical term 기준)
    stats = {'total_links': 0, 'terms': []}
    
    # main 태그 영역 찾기
    main_start = re.search(r'<main[^>]*>', html_content, re.IGNORECASE)
    main_end_pos = html_content.rfind('</main>')
    
    if not main_start or main_end_pos < 0:
        main_start_pos = 0
        main_end_pos = len(html_content)
    else:
        main_start_pos = main_start.end()
    
    before = html_content[:main_start_pos]
    main_body = html_content[main_start_pos:main_end_pos]
    after = html_content[main_end_pos:]
    
    # ---- 건너뛸 영역 식별 ----
    skip_ranges = []  # (start, end, type)
    
    # encyclopedia-terms-section (하단 백과사전 용어 목록)
    for m in re.finditer(r'<section[^>]*id="encyclopedia-terms-section"[^>]*>.*?</section>', main_body, re.DOTALL):
        skip_ranges.append((m.start(), m.end(), 'enc_section'))
    
    # breadcrumb 영역
    for m in re.finditer(r'<div[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>.*?</div>', main_body, re.DOTALL):
        skip_ranges.append((m.start(), m.end(), 'breadcrumb'))
    
    # hero 섹션은 스킵하지 않음 — 핵심 키워드가 포함되어 있어 링크 가치 있음
    # hero에서 링크 걸린 용어는 본문에서 중복 링크되지 않음 (첫 출현 1회 규칙)
    
    # ---- HTML을 토큰으로 분리 ----
    token_pattern = re.compile(r'(<[^>]+>)')
    tokens = token_pattern.split(main_body)
    
    # ---- 각 토큰의 상태 분석 ----
    # tag_stack: 현재 열린 태그 리스트
    # a_depth: <a> 태그 중첩 깊이 (0이면 <a> 밖)
    tag_stack = []
    a_depth = 0
    in_skip_tag = set()  # 현재 들어가 있는 SKIP_TAGS
    current_pos = 0
    
    result_tokens = []
    
    for token in tokens:
        token_start = current_pos
        token_end = current_pos + len(token)
        
        # 건너뛸 영역인지 체크 (encyclopedia 섹션, breadcrumb, hero 등)
        in_skip_range = any(s <= token_start < e for s, e, t in skip_ranges)
        
        if token.startswith('<'):
            # HTML 태그 처리
            result_tokens.append(token)
            
            close_match = re.match(r'</(\w+)', token)
            if close_match:
                tag_name = close_match.group(1).lower()
                # 닫는 태그
                if tag_name == 'a':
                    a_depth = max(0, a_depth - 1)
                
                if tag_name in in_skip_tag:
                    in_skip_tag.discard(tag_name)
                
                # tag_stack에서 해당 태그 제거 (가장 가까운 것)
                for idx in range(len(tag_stack) - 1, -1, -1):
                    if tag_stack[idx] == tag_name:
                        tag_stack.pop(idx)
                        break
            else:
                open_match = re.match(r'<(\w+)', token)
                if open_match:
                    tag_name = open_match.group(1).lower()
                    
                    # self-closing 체크
                    is_void = tag_name in VOID_TAGS or token.rstrip().endswith('/>')
                    
                    if not is_void:
                        tag_stack.append(tag_name)
                        
                        if tag_name == 'a':
                            a_depth += 1
                        
                        if tag_name in SKIP_TAGS:
                            in_skip_tag.add(tag_name)
        else:
            # 텍스트 노드
            # 스킵 조건 판단
            should_skip = (
                bool(in_skip_tag) or       # script/style 등 안
                in_skip_range or            # 하단 백과사전 섹션, breadcrumb, hero 등
                not token.strip()           # 공백만 있는 토큰
            )
            
            # <a> 안에 있으면 링크 삽입 불가 (HTML 중첩 방지)
            in_anchor = a_depth > 0
            
            if should_skip:
                result_tokens.append(token)
            else:
                # 용어 매칭 시도
                modified_token = token
                
                for search_term in sorted_terms:
                    canonical = term_map[search_term]['term']
                    
                    # 같은 URL로 연결되는 용어는 중복 링크 방지
                    # canonical 기준: "CBCT"가 링크되면 "3D CT"(→CBCT)도 스킵
                    if canonical in linked_terms:
                        continue
                    
                    idx = modified_token.find(search_term)
                    if idx < 0:
                        continue
                    
                    if in_anchor:
                        # <a> 안이면 이 토큰에서는 링크 못 함
                        # 하지만 linked_terms에 추가하지 않음! → 다음 출현에서 재시도
                        continue
                    
                    # 이전 치환으로 생긴 <a> 태그 안인지 확인
                    before_text = modified_token[:idx]
                    open_a_count = len(re.findall(r'<a ', before_text))
                    close_a_count = len(re.findall(r'</a>', before_text))
                    if open_a_count > close_a_count:
                        continue
                    
                    info = term_map[search_term]
                    # 툴팁에서 HTML 특수문자 이스케이프
                    tooltip_text = info['short'][:50].replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
                    
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
    if 'enc-inline-link' in html_content and '<style' in html_content:
        head_part = html_content.split('</head>')[0]
        if 'enc-inline-link' in head_part:
            return html_content
    
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
    return html_content.replace('</head>', css + '</head>', 1)


# ===== 4. 기존 인라인 링크 제거 (clean start) =====
def remove_existing_inline_links(html_content):
    """이전 실행으로 삽입된 enc-inline-link를 원래 텍스트로 복원"""
    pattern = re.compile(r'<a[^>]*class="enc-inline-link"[^>]*>(.*?)</a>')
    cleaned = pattern.sub(r'\1', html_content)
    
    # CSS 블록도 제거
    css_pattern = re.compile(
        r'\s*<!-- Encyclopedia Inline Link Style -->\s*<style>.*?\.enc-inline-link.*?</style>\s*',
        re.DOTALL
    )
    cleaned = css_pattern.sub('', cleaned)
    
    return cleaned


# ===== 메인 실행 =====
def main():
    print("=" * 70)
    print("  서울비디치과 — 백과사전 인라인 링크 자동 삽입 v2")
    print("  (개선: <a> 안 첫 출현 스킵 → 다음 출현에서 링크)")
    print("=" * 70)
    
    if DRY_RUN:
        print("  DRY RUN 모드 — 파일 변경 없이 시뮬레이션만 합니다\n")
    
    # 1. 용어 로드
    term_map, sorted_terms = load_terms()
    print(f"  백과사전 용어: {len(term_map)}개 (3자 이상, 동의어 포함)")
    
    treatment_files = [f for f in sorted(os.listdir(TREATMENT_DIR)) if f.endswith('.html')]
    print(f"  진료 페이지: {len(treatment_files)}개\n")
    
    # 2. 각 진료 페이지 처리
    total_links = 0
    total_files = 0
    all_results = []
    
    for fname in treatment_files:
        filepath = os.path.join(TREATMENT_DIR, fname)
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()
        
        # 기존 인라인 링크 제거 (clean start)
        cleaned = remove_existing_inline_links(original)
        
        # 링크 삽입
        modified, stats = add_links_to_html(cleaned, term_map, sorted_terms, fname)
        
        # CSS 추가
        modified = add_inline_link_css(modified)
        
        if stats['total_links'] > 0:
            total_links += stats['total_links']
            total_files += 1
            
            terms_preview = ', '.join(stats['terms'][:10])
            more = f" ... +{len(stats['terms'])-10}" if len(stats['terms']) > 10 else ""
            print(f"  {fname:42s} {stats['total_links']:3d}개 | {terms_preview}{more}")
            
            all_results.append((fname, stats['total_links'], stats['terms']))
            
            if not DRY_RUN:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(modified)
        else:
            print(f"  {fname:42s}   0개 (매칭 없음)")
    
    treatment_links = total_links
    treatment_file_count = total_files
    
    print(f"\n  진료 페이지 소계: {total_files}개 파일, {total_links}개 링크")
    
    # ========================================
    # 3. FAQ 페이지 처리
    # ========================================
    print(f"\n{'─' * 70}")
    print(f"  FAQ 페이지 처리")
    print(f"{'─' * 70}\n")
    
    # FAQ 파일 목록: faq.html + faq/*.html
    faq_files = []
    if os.path.exists(FAQ_MAIN):
        faq_files.append(FAQ_MAIN)
    if os.path.isdir(FAQ_DIR):
        for fname in sorted(os.listdir(FAQ_DIR)):
            if fname.endswith('.html'):
                faq_files.append(os.path.join(FAQ_DIR, fname))
    
    print(f"  FAQ 파일: {len(faq_files)}개\n")
    
    faq_links = 0
    faq_file_count = 0
    
    for filepath in faq_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()
        
        # 기존 인라인 링크 제거 (clean start)
        cleaned = remove_existing_inline_links(original)
        
        # 링크 삽입
        modified, stats = add_links_to_html(cleaned, term_map, sorted_terms, filepath)
        
        # CSS 추가
        modified = add_inline_link_css(modified)
        
        if stats['total_links'] > 0:
            faq_links += stats['total_links']
            faq_file_count += 1
            total_links += stats['total_links']
            total_files += 1
            
            terms_preview = ', '.join(stats['terms'][:10])
            more = f" ... +{len(stats['terms'])-10}" if len(stats['terms']) > 10 else ""
            print(f"  {filepath:42s} {stats['total_links']:3d}개 | {terms_preview}{more}")
            
            if not DRY_RUN:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(modified)
        else:
            print(f"  {filepath:42s}   0개 (매칭 없음)")
    
    print(f"\n  FAQ 소계: {faq_file_count}개 파일, {faq_links}개 링크")
    
    # ========================================
    # 4. 최종 요약
    # ========================================
    print(f"\n{'=' * 70}")
    print(f"  최종 결과")
    print(f"{'=' * 70}")
    print(f"  진료 페이지: {treatment_file_count}개 파일, {treatment_links}개 링크")
    print(f"  FAQ 페이지:  {faq_file_count}개 파일, {faq_links}개 링크")
    print(f"  ─────────────────────────")
    print(f"  합계:        {total_files}개 파일, {total_links}개 인라인 링크")
    if total_links > 0:
        avg = total_links / total_files if total_files > 0 else 0
        print(f"  평균:        파일당 {avg:.1f}개 링크")
    
    if DRY_RUN:
        print("\n  DRY RUN — 실제 파일은 변경되지 않았습니다")
    print(f"{'=' * 70}")


if __name__ == '__main__':
    main()
