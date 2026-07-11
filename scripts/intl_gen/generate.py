# -*- coding: utf-8 -*-
"""다국어 페이지 일괄 생성 러너 — python3 generate.py (from scripts/intl_gen/)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import engine
import content_en, content_jp, content_cn, content_vi, content_th, content_ru
import content_extra

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

MODULES = [
    ('EN', content_en), ('JP', content_jp), ('CN', content_cn),
    ('VI', content_vi), ('TH', content_th), ('RU', content_ru),
]

def merge_extra(page):
    """content_extra.EXTRA 섹션을 CTA 직전에 삽입 + QA(즉답 박스) 주입한 사본 반환"""
    canon = page.get('canonical')
    extra = content_extra.EXTRA.get(canon, [])
    qa = getattr(content_extra, 'QA', {}).get(canon)
    if not extra and not qa:
        return page
    merged = dict(page)
    if extra:
        sections = list(page['sections'])
        cta_idx = next((i for i in range(len(sections) - 1, -1, -1)
                        if sections[i].get('type') == 'cta'), None)
        if cta_idx is None:
            sections.extend(extra)
        else:
            sections[cta_idx:cta_idx] = extra
        merged['sections'] = sections
    if qa:
        merged['qa'] = qa
    return merged

def main():
    total = 0
    extra_used = 0
    for name, mod in MODULES:
        for page in mod.PAGES:
            merged = merge_extra(page)
            if merged is not page:
                extra_used += 1
            html = engine.render_page(merged, mod.LANG_CFG)
            out = os.path.join(ROOT, page['path'])
            os.makedirs(os.path.dirname(out), exist_ok=True)
            with open(out, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f'[{name}] {page["path"]}  ({len(html):,} bytes)')
            total += 1
    print(f'\n✅ {total} pages generated ({extra_used} with EXTRA sections).')

if __name__ == '__main__':
    main()
