#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
공개 페이지 og:image / og 블록 / H1 / JSON-LD 보강
- admin/report/blueprint/docs 등 내부 페이지는 제외
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OG_IMAGE = "https://bdbddc.com/images/og-image-v2.jpg"
SITE = "서울비디치과"

# og:image만 누락된 공개 페이지 (og 블록은 있음)
OG_IMAGE_ONLY = [
    "guide/index.html",
    "en/guide/index.html", "en/guide/implant.html",
    "en/guide/invisalign.html", "en/guide/laminate.html",
    "jp/guide/invisalign.html", "jp/guide/laminate.html",
    "cn/guide/index.html", "cn/guide/implant.html",
    "cn/guide/invisalign.html", "cn/guide/laminate.html",
    "vi/index.html",
]

# og 블록 전체가 없는 공개 페이지
OG_FULL = [
    "column/index.html",
    "column/columns.html",
    "reservation/thank-you.html",
]


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write(path, html):
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


def get_title(html):
    m = re.search(r"<title>(.*?)</title>", html, re.S)
    return m.group(1).strip() if m else SITE


def get_desc(html):
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    return m.group(1).strip() if m else ""


def get_canonical(html):
    m = re.search(r'<link rel="canonical" href="([^"]*)"', html)
    return m.group(1).strip() if m else "https://bdbddc.com/"


def add_og_image(html):
    """og 블록 있는 페이지에 og:image / twitter:image 추가"""
    if "og:image" in html:
        return html, False
    block = (
        f'  <meta property="og:image" content="{OG_IMAGE}">\n'
        f'  <meta property="og:image:width" content="1200">\n'
        f'  <meta property="og:image:height" content="630">\n'
        f'  <meta property="og:image:alt" content="{SITE}">\n'
        f'  <meta name="twitter:card" content="summary_large_image">\n'
        f'  <meta name="twitter:image" content="{OG_IMAGE}">\n'
    )
    # og:site_name 뒤 → 없으면 og:locale 뒤 → 없으면 마지막 og 태그 뒤
    for anchor in [
        r'(<meta property="og:site_name"[^>]*>\n)',
        r'(<meta property="og:locale"[^>]*>\n)',
        r'(<meta property="og:url"[^>]*>\n)',
        r'(<meta property="og:type"[^>]*>\n)',
    ]:
        if re.search(anchor, html):
            html = re.sub(anchor, lambda m: m.group(1) + block, html, count=1)
            return html, True
    return html, False


def add_og_full(html):
    """og 블록 없는 페이지에 전체 og + twitter 추가 (canonical 뒤 또는 description 뒤)"""
    if "og:image" in html:
        return html, False
    title = get_title(html)
    desc = get_desc(html) or title
    url = get_canonical(html)
    # 너무 긴 description은 og용으로 자르기
    og_desc = desc[:150]
    block = (
        f'  <meta property="og:title" content="{title}">\n'
        f'  <meta property="og:description" content="{og_desc}">\n'
        f'  <meta property="og:type" content="website">\n'
        f'  <meta property="og:url" content="{url}">\n'
        f'  <meta property="og:locale" content="ko_KR">\n'
        f'  <meta property="og:site_name" content="{SITE}">\n'
        f'  <meta property="og:image" content="{OG_IMAGE}">\n'
        f'  <meta property="og:image:width" content="1200">\n'
        f'  <meta property="og:image:height" content="630">\n'
        f'  <meta property="og:image:alt" content="{SITE}">\n'
        f'  <meta name="twitter:card" content="summary_large_image">\n'
        f'  <meta name="twitter:title" content="{title}">\n'
        f'  <meta name="twitter:description" content="{og_desc}">\n'
        f'  <meta name="twitter:image" content="{OG_IMAGE}">\n'
    )
    # canonical 뒤 → 없으면 description 뒤
    for anchor in [
        r'(<link rel="canonical"[^>]*>\n)',
        r'(<meta name="description"[^>]*>\n)',
    ]:
        if re.search(anchor, html):
            html = re.sub(anchor, lambda m: m.group(1) + block, html, count=1)
            return html, True
    return html, False


def main():
    print("=== og:image만 추가 (10~12개) ===")
    for rel in OG_IMAGE_ONLY:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print(f"  SKIP(없음): {rel}")
            continue
        html = read(path)
        html, changed = add_og_image(html)
        if changed:
            write(path, html)
            print(f"  OK: {rel}")
        else:
            print(f"  NOCHANGE: {rel}")

    print("\n=== og 전체 블록 추가 (3개) ===")
    for rel in OG_FULL:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print(f"  SKIP(없음): {rel}")
            continue
        html = read(path)
        html, changed = add_og_full(html)
        if changed:
            write(path, html)
            print(f"  OK: {rel}")
        else:
            print(f"  NOCHANGE: {rel}")


if __name__ == "__main__":
    main()
