# -*- coding: utf-8 -*-
"""다국어 페이지 일괄 생성 러너 — python3 generate.py (from scripts/intl_gen/)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import engine
import content_en, content_jp, content_cn, content_vi, content_th, content_ru

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

MODULES = [
    ('EN', content_en), ('JP', content_jp), ('CN', content_cn),
    ('VI', content_vi), ('TH', content_th), ('RU', content_ru),
]

def main():
    total = 0
    for name, mod in MODULES:
        for page in mod.PAGES:
            html = engine.render_page(page, mod.LANG_CFG)
            out = os.path.join(ROOT, page['path'])
            os.makedirs(os.path.dirname(out), exist_ok=True)
            with open(out, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f'[{name}] {page["path"]}  ({len(html):,} bytes)')
            total += 1
    print(f'\n✅ {total} pages generated.')

if __name__ == '__main__':
    main()
