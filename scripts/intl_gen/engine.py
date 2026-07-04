# -*- coding: utf-8 -*-
"""서울비디치과 다국어 페이지 생성 엔진 v2"""
import json, html

BASE = 'https://bdbddc.com'
PHONE_INTL = '+82-41-415-2892'
PHONE_DISP = '041-415-2892'
ADDR_EN = '14, Buldang 34-gil, Seobuk-gu, Cheonan-si, Chungnam, South Korea'
GEO = (36.8061852, 127.1063344)
INSTA = 'https://www.instagram.com/seoul_bddc'

OG_LOCALE = {'en':'en_US','ja':'ja_JP','zh':'zh_CN','vi':'vi_VN','th':'th_TH','ru':'ru_RU','ko':'ko_KR'}
HREFLANG_CODE = {'en':'en','ja':'ja','zh':'zh-CN','vi':'vi','th':'th','ru':'ru','ko':'ko'}

def esc(s): return html.escape(str(s), quote=True)

def _hreflang_links(hreflang):
    out = []
    for lang, url in hreflang.items():
        code = HREFLANG_CODE.get(lang, lang)
        out.append(f'<link rel="alternate" hreflang="{code}" href="{BASE}{url}">')
    if 'en' in hreflang:
        out.append(f'<link rel="alternate" hreflang="x-default" href="{BASE}{hreflang["en"]}">')
    return '\n'.join(out)

def _jsonld_dentist(page):
    d = {
        "@context":"https://schema.org","@type":"Dentist",
        "name":"Seoul BD Dental","url":BASE+page['canonical'],
        "telephone":PHONE_INTL,"priceRange":"₩₩",
        "address":{"@type":"PostalAddress","streetAddress":"14, Buldang 34-gil, Seobuk-gu",
                   "addressLocality":"Cheonan-si","addressRegion":"Chungcheongnam-do",
                   "postalCode":"31120","addressCountry":"KR"},
        "geo":{"@type":"GeoCoordinates","latitude":GEO[0],"longitude":GEO[1]},
        "availableLanguage":["ko","en","ja","zh","vi","th","ru"],
        "openingHoursSpecification":[
            {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"20:00"},
            {"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"09:00","closes":"13:00"}]
    }
    return f'<script type="application/ld+json">{json.dumps(d, ensure_ascii=False)}</script>'

def _jsonld_faq(faqs):
    d = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
        {"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]}
    return f'<script type="application/ld+json">{json.dumps(d, ensure_ascii=False)}</script>'

def _jsonld_breadcrumb(crumbs):
    d = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":i+1,"name":n,"item":BASE+u} for i,(n,u) in enumerate(crumbs)]}
    return f'<script type="application/ld+json">{json.dumps(d, ensure_ascii=False)}</script>'

# ───────── section renderers ─────────

def sec_cards(s):
    cards = []
    for c in s['cards']:
        tag = f'<span class="iv2-card__tag">{c["tag"]}</span>' if c.get('tag') else ''
        icon = f'<div class="iv2-card__icon"><i class="{c.get("icon","fas fa-tooth")}"></i></div>'
        body = f'{icon}{tag}<h3>{c["t"]}</h3><p>{c["d"]}</p>'
        if c.get('href'):
            more = f'<div class="iv2-card__more">{c.get("more","→")}</div>'
            cards.append(f'<a href="{c["href"]}" class="iv2-card">{body}{more}</a>')
        else:
            cards.append(f'<div class="iv2-card">{body}</div>')
    grid = s.get('grid','iv2-grid')
    return f'<div class="{grid}">{"".join(cards)}</div>'

def sec_price(s):
    rows = []
    for r in s['rows']:
        if r.get('group'):
            rows.append(f'<tr><td colspan="3" class="iv2-price__group">{r["group"]}</td></tr>')
            continue
        badge = ''
        if r.get('badge'):
            cls = 'badge--hot' if r['badge'].upper() in ('HOT','人気','인기') else 'badge--best'
            badge = f'<span class="badge {cls}">{r["badge"]}</span>'
        hl = ' class="hl"' if r.get('hl') else ''
        rows.append(f'<tr{hl}><td>{r["item"]}{badge}</td><td class="price">{r["price"]}</td><td class="note">{r.get("note","")}</td></tr>')
    head = s.get('head', ['Item','Price','Note'])
    notes = ''
    if s.get('notes'):
        notes = '<ul class="iv2-price-note">' + ''.join(f'<li>{n}</li>' for n in s['notes']) + '</ul>'
    return (f'<div class="iv2-pricewrap"><table class="iv2-price">'
            f'<thead><tr><th>{head[0]}</th><th>{head[1]}</th><th>{head[2]}</th></tr></thead>'
            f'<tbody>{"".join(rows)}</tbody></table></div>{notes}')

def sec_steps(s):
    out = []
    for i, st in enumerate(s['steps'], 1):
        small = f'<small>{st["time"]}</small>' if st.get('time') else ''
        out.append(f'<div class="iv2-step"><div class="iv2-step__num">{i}</div>'
                   f'<div><h4>{st["t"]}{small}</h4><p>{st["d"]}</p></div></div>')
    return f'<div class="iv2-steps">{"".join(out)}</div>'

def sec_faq(s):
    out = []
    for q, a in s['faqs']:
        out.append(f'<details><summary>{q}</summary><p>{a}</p></details>')
    return f'<div class="iv2-faq">{"".join(out)}</div>'

def sec_info(s):
    rows = []
    for r in s['rows']:
        gold = ' gold' if r.get('gold') else ''
        rows.append(f'<div class="iv2-inforow"><span class="k">{r["k"]}</span><span class="v{gold}">{r["v"]}</span></div>')
    return f'<div style="max-width:640px;margin:0 auto">{"".join(rows)}</div>'

def sec_banner(s):
    cls = 'iv2-banner iv2-banner--center' if s.get('center') else 'iv2-banner'
    return f'<div class="{cls}">{s["html"]}</div>'

def sec_cta(s):
    chans = []
    for c in s['channels']:
        chans.append(f'<a href="{c["href"]}" class="iv2-channel"{" target=_blank rel=noopener" if c.get("ext") else ""}>'
                     f'<i class="{c["icon"]}"></i><b>{c["t"]}</b><span>{c["d"]}</span></a>')
    return (f'<div class="iv2-cta"><h2>{s["t"]}</h2><p class="iv2-cta__desc">{s["d"]}</p>'
            f'<div class="iv2-channels">{"".join(chans)}</div></div>')

def sec_compare(s):
    rows = []
    for r in s['rows']:
        cells = ''.join(f'<td class="{c[1]}">{c[0]}</td>' if isinstance(c, tuple) else f'<td>{c}</td>' for c in r)
        rows.append(f'<tr>{cells}</tr>')
    head = ''.join(f'<th>{h}</th>' for h in s['head'])
    return (f'<div class="iv2-pricewrap"><table class="iv2-price iv2-compare">'
            f'<thead><tr>{head}</tr></thead><tbody>{"".join(rows)}</tbody></table></div>')

SECTION_FN = {'cards':sec_cards,'price':sec_price,'steps':sec_steps,'faq':sec_faq,
              'info':sec_info,'banner':sec_banner,'cta':sec_cta,'compare':sec_compare,
              'html':lambda s: s['html']}

def render_section(s):
    inner = SECTION_FN[s['type']](s)
    if s.get('bare'):  # cta 등 자체 배경 있는 섹션
        return f'<section class="iv2-section" id="{s.get("id","")}"><div class="iv2-container">{inner}</div></section>'
    alt = ' iv2-section--alt' if s.get('alt') else ''
    label = f'<span class="iv2-section__label">{s["label"]}</span>' if s.get('label') else ''
    h2 = f'<h2>{s["h2"]}</h2>' if s.get('h2') else ''
    desc = f'<p class="iv2-section__desc">{s["desc"]}</p>' if s.get('desc') else ''
    return (f'<section class="iv2-section{alt}" id="{s.get("id","")}">'
            f'<div class="iv2-container">{label}{h2}{desc}{inner}</div></section>')

# ───────── page renderer ─────────

def render_page(page, lang_cfg):
    """page: dict with meta+sections. lang_cfg: per-language shared config."""
    hero = page['hero']
    stats = ''
    if hero.get('stats'):
        stats = '<div class="iv2-hero__stats">' + ''.join(
            f'<div class="iv2-stat"><b>{b}</b><span>{s}</span></div>' for b,s in hero['stats']) + '</div>'
    ctas = ''
    if hero.get('ctas'):
        ctas = '<div class="iv2-hero__ctas">' + ''.join(
            f'<a href="{c["href"]}" class="iv2-btn iv2-btn--{c.get("style","gold")}">'
            f'<i class="{c.get("icon","fas fa-phone")}"></i> {c["t"]}</a>' for c in hero['ctas']) + '</div>'
    hero_html = (f'<header class="iv2-hero"><span class="iv2-hero__badge">{hero["badge"]}</span>'
                 f'<h1>{hero["h1"]}</h1><p class="iv2-hero__sub">{hero["sub"]}</p>{ctas}{stats}</header>')

    nav_links = ''.join(
        f'<a href="{u}"{" class=active" if u == page["canonical"] or u == page["canonical"]+"/" else ""}>{t}</a>'
        for t,u in lang_cfg['nav'])
    nav_html = (f'<nav class="iv2-nav"><div class="iv2-nav__inner">'
                f'<a href="{lang_cfg["home"]}" class="iv2-nav__logo"><span class="tooth">🦷</span><span class="txt">Seoul BD Dental</span></a>'
                f'<div class="iv2-nav__links">{nav_links}</div>'
                f'<a href="tel:{PHONE_INTL}" class="iv2-nav__tel"><i class="fas fa-phone"></i><span>{PHONE_DISP}</span></a>'
                f'</div></nav>')

    body_sections = ''.join(render_section(s) for s in page['sections'])

    langbar = ''.join(
        f'<a href="{u}"{" class=active" if code == page["lang"] else ""}>{t}</a>'
        for code,t,u in [('ko','한국어','/'),('en','English','/en/'),('ja','日本語','/jp/dental'),
                          ('zh','中文','/cn/dental'),('vi','Tiếng Việt','/vi/'),('th','ไทย','/th/'),('ru','Русский','/ru/')])
    footer_html = (f'<footer class="iv2-footer"><nav class="iv2-langbar">{langbar}</nav>'
                   f'<p class="iv2-footer__addr">Seoul BD Dental · {ADDR_EN}</p>'
                   f'<p>☎ <a href="tel:{PHONE_INTL}">{PHONE_INTL}</a> · <a href="{BASE}">bdbddc.com</a></p>'
                   f'<p style="margin-top:8px">© 2026 Seoul BD Dental. All rights reserved.</p></footer>')

    jsonld = [_jsonld_dentist(page)]
    if page.get('breadcrumb'): jsonld.append(_jsonld_breadcrumb(page['breadcrumb']))
    faq_secs = [s for s in page['sections'] if s['type'] == 'faq']
    if faq_secs: jsonld.append(_jsonld_faq(faq_secs[0]['faqs']))

    og_locale = OG_LOCALE[page['lang']]
    return f'''<!DOCTYPE html>
<html lang="{page["html_lang"]}" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<title>{esc(page["title"])}</title>
<meta name="description" content="{esc(page["desc"])}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="{BASE}{page["canonical"]}">
<meta name="geo.region" content="KR-44">
<meta name="geo.placename" content="Cheonan-si, Chungcheongnam-do">
<meta name="geo.position" content="{GEO[0]};{GEO[1]}">
<meta property="og:title" content="{esc(page.get("og_title", page["title"]))}">
<meta property="og:description" content="{esc(page["desc"])[:200]}">
<meta property="og:type" content="website">
<meta property="og:url" content="{BASE}{page["canonical"]}">
<meta property="og:locale" content="{og_locale}">
<meta property="og:site_name" content="Seoul BD Dental">
<meta property="og:image" content="{BASE}/images/og-glownate.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
{_hreflang_links(page["hreflang"])}
<link rel="icon" href="/favicon.ico?v=2" sizes="48x48"><link rel="icon" type="image/png" sizes="96x96" href="/images/icons/favicon-96.png?v=2"><link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg?v=2">
<link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#C9A042">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/intl-v2.css?v=20260704">
{"".join(jsonld)}
</head>
<body>
{nav_html}
{hero_html}
<main>
{body_sections}
</main>
{footer_html}
<script src="/static/bd-tag-loader.js" defer></script>
<script src="/js/lang-switcher.js" defer></script>
</body>
</html>
'''
