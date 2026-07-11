#!/usr/bin/env python3
"""
v5.18c: 진료/FAQ 페이지의 백과사전 인라인 링크를 '툴팁 전용'으로 전환 (컨설턴트 제안)

배경:
- 진료 안내 페이지 본문 곳곳의 백과사전 링크(<a class="enc-inline-link">)가
  클릭 시 진료 페이지 → 백과사전으로 이탈을 유발
- 마우스오버 툴팁(뜻 설명)은 유지하되, 클릭 이동 기능만 제거

동작:
- <a href="/encyclopedia/..." class="enc-inline-link" ...>텍스트</a>
  → <span class="enc-inline-link" ...>텍스트</span> (href만 제거, title/data-enc-term 유지)
- 대상: treatments/, faq/, faq.html (백과사전 자체 페이지는 제외)
"""
import re
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# <a ... class="enc-inline-link" ...>content</a>  (content에 중첩 <a> 없음 전제 — 검증됨)
PATTERN = re.compile(
    r'<a\s+href="[^"]*"\s+class="enc-inline-link"([^>]*)>(.*?)</a>',
    re.DOTALL
)

def convert(html: str):
    count = 0
    def repl(m):
        nonlocal count
        count += 1
        attrs = m.group(1)  # title, data-enc-term, style 등 유지
        inner = m.group(2)
        return f'<span class="enc-inline-link"{attrs}>{inner}</span>'
    return PATTERN.sub(repl, html), count

def main():
    targets = sorted(
        glob.glob(os.path.join(ROOT, 'treatments', '*.html')) +
        glob.glob(os.path.join(ROOT, 'faq', '*.html')) +
        [os.path.join(ROOT, 'faq.html')]
    )
    total = 0
    changed_files = 0
    for path in targets:
        with open(path, encoding='utf-8') as f:
            html = f.read()
        new_html, n = convert(html)
        if n:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_html)
            total += n
            changed_files += 1
            print(f'  {os.path.relpath(path, ROOT)}: {n}건')
    print(f'\n✅ 완료: {changed_files}개 파일, 총 {total}건 <a>→<span> 변환')

if __name__ == '__main__':
    main()
