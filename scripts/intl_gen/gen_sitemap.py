# -*- coding: utf-8 -*-
"""sitemap-intl.xml 자동 생성 — 콘텐츠 모듈의 hreflang과 100% 일치 보장"""
import os, sys, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content_en, content_jp, content_cn, content_vi, content_th, content_ru

BASE = 'https://bdbddc.com'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TODAY = '2026-07-04'

MODULES = [content_en, content_jp, content_cn, content_vi, content_th, content_ru]
HREFLANG_CODE = {'en':'en','ja':'ja','zh':'zh-CN','vi':'vi','th':'th','ru':'ru','ko':'ko'}

# 우선순위 규칙
def priority(url):
    if url in ('/', '/en/'): return '1.0'
    if url.endswith('/') or url.endswith('dental'): return '0.9'
    if 'pricing' in url or 'implant' in url: return '0.9'
    return '0.8'

def entry(loc, hreflang, prio):
    lines = [f'  <url>', f'    <loc>{BASE}{loc}</loc>']
    for lang, url in hreflang.items():
        code = HREFLANG_CODE.get(lang, lang)
        lines.append(f'    <xhtml:link rel="alternate" hreflang="{code}" href="{BASE}{url}"/>')
    if 'en' in hreflang:
        lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{BASE}{hreflang["en"]}"/>')
    lines += [f'    <lastmod>{TODAY}</lastmod>',
              f'    <changefreq>monthly</changefreq>',
              f'    <priority>{prio}</priority>', '  </url>']
    return '\n'.join(lines)

def main():
    seen = set()
    entries = []

    # 1) 생성된 모든 다국어 페이지 (+ 각 hreflang 그룹의 ko/jp/cn 대표 URL 포함)
    for mod in MODULES:
        for page in mod.PAGES:
            loc = page['canonical']
            if loc not in seen:
                seen.add(loc)
                entries.append(entry(loc, page['hreflang'], priority(loc)))
            # hreflang 그룹 내 아직 없는 URL(ko 원본, jp/, cn/ 등)도 등재
            for lang, url in page['hreflang'].items():
                if url not in seen:
                    seen.add(url)
                    entries.append(entry(url, page['hreflang'], priority(url)))

    # 2) 가이드 페이지 (별도 유지 — 4개 언어 x 4페이지 그룹)
    GUIDE_HREF = lambda slug: {'ko':f'/guide/{slug}','ja':f'/jp/guide/{slug}','en':f'/en/guide/{slug}','zh':f'/cn/guide/{slug}'}
    for slug in ['', 'implant', 'invisalign', 'laminate']:
        h = GUIDE_HREF(slug)
        for lang in ['ja','en','zh']:
            url = h[lang]
            if url not in seen:
                seen.add(url)
                entries.append(entry(url, h, '0.85' if slug=='' else '0.9'))

    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
           '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
           f'  <!-- 다국어 SEO 사이트맵 — 서울비디치과 International Pages -->\n'
           f'  <!-- 자동 생성: scripts/intl_gen/gen_sitemap.py · {TODAY} -->\n\n'
           + '\n\n'.join(entries) + '\n\n</urlset>\n')

    out = os.path.join(ROOT, 'sitemap-intl.xml')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(xml)
    print(f'✅ sitemap-intl.xml: {len(seen)} URLs')

if __name__ == '__main__':
    main()
