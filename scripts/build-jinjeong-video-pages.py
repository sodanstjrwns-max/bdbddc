#!/usr/bin/env python3
"""진정 임플란트(문석준 원장) 롱폼 영상 해설 페이지 생성기.

입력
  data/jinjeong-videos.json      영상별 설정(유튜브 설명란 원문, 챕터, 캡처, 제외할 미확인 수치)
  data/jinjeong-transcripts/*.srt 교정 한국어 자막(유튜브 "한국어 (교정)" 트랙과 같은 파일)
  video/index.html               머리글·바닥글·추적 태그를 그대로 가져오는 기준 페이지
출력
  video/jinjeong/index.html, video/jinjeong/<slug>.html

본문은 영상에서 원장이 실제로 한 말(교정 자막)을 챕터별로 옮긴 것이다.
새 의학 주장을 만들지 않는다. 요약은 공개된 유튜브 설명란의 요약 항목만 쓰고,
출처를 확인하지 못한 수치(dropSummaryIf)는 요약·근거 목록에서 뺀다.
실행: python3 -I scripts/build-jinjeong-video-pages.py
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://bdbddc.com'
HUB = '/video/jinjeong/'
CHANNEL = 'https://www.youtube.com/@%EC%A7%84%EC%A0%95%EC%9E%84%ED%94%8C%EB%9E%80%ED%8A%B8%EB%AC%B8%EC%84%9D%EC%A4%80'
DOCTOR = {'@type': 'Person', '@id': BASE + '/#문석준', 'name': '문석준', 'jobTitle': '치과의사, 서울비디치과 대표원장', 'url': BASE + '/doctors/moon'}
ORG = {'@type': 'Dentist', '@id': BASE + '/#dentist', 'name': '서울비디치과', 'url': BASE + '/'}

esc = html.escape


def read(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return f.read()


def write(p, s):
    full = os.path.join(ROOT, p)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(s)


# ---------- 기준 페이지에서 공통 조각 ----------
TEMPLATE = read('video/index.html')
HEAD_TRACKING = TEMPLATE[TEMPLATE.index('<head>') + 6:TEMPLATE.index('<meta charset')]
head_links = TEMPLATE[TEMPLATE.index('<link rel="icon"'):TEMPLATE.index('<link rel="prefetch"')]
HEAD_LINKS = head_links.replace('href="../', 'href="/')
body_start = TEMPLATE.index('<body')
HEADER = TEMPLATE[body_start:TEMPLATE.index('<main')]
FOOTER = TEMPLATE[TEMPLATE.index('</main>') + len('</main>'):TEMPLATE.index('<script src="../js/video.js')]
SW = TEMPLATE[TEMPLATE.index('<!-- Service Worker Registration -->'):TEMPLATE.index('</body>')]
for name in ('HEADER', 'FOOTER'):
    globals()[name] = re.sub(r'(href|src)="\.\./', r'\1="/', globals()[name])
FOOTER = FOOTER.replace('href="/"', 'href="/"')


# ---------- 파싱 ----------
def parse_duration(iso):
    m = re.fullmatch(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso)
    h, mi, s = (int(x or 0) for x in m.groups())
    return h * 3600 + mi * 60 + s


def fmt_time(sec):
    return f'{sec // 60}:{sec % 60:02d}'


def parse_description(desc):
    """설명란을 섹션으로 나눈다. 반환: intro 줄, 요약 bullet, 챕터, 근거 줄, 안내(※) 줄."""
    intro, sections, cur = [], [], None
    for raw in desc.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith('#'):
            continue
        header = re.match(r'^(?:■|📊|💡)\s*(.+)$', line)
        if header:
            cur = {'name': header.group(1).strip(), 'lines': []}
            sections.append(cur)
            continue
        if line.startswith('※'):
            sections.append({'name': '※', 'lines': [line]})
            cur = None
            continue
        if cur is None:
            intro.append(line)
        else:
            cur['lines'].append(line)
    chapters, refs, summary, notes, after = [], [], [], [], []
    for s in sections:
        n = s['name']
        if n.startswith('챕터'):
            for l in s['lines']:
                m = re.match(r'^(\d+):(\d\d)\s+(.+)$', l)
                if m:
                    chapters.append((int(m.group(1)) * 60 + int(m.group(2)), m.group(3).strip()))
        elif n.startswith('근거'):
            refs += [l.lstrip('- ').strip() for l in s['lines'] if l.startswith('-')]
        elif n == '※':
            notes += s['lines']
        elif n.startswith('말하는 사람'):
            continue
        elif n.startswith('이 영상에서 다루는') or n.startswith('챕터'):
            continue
        else:
            items = [l.lstrip('- ').strip() for l in s['lines'] if l.startswith('-')]
            if items:
                summary.append((n, items))
    return intro, summary, chapters, refs, notes


def parse_srt(text):
    cues = []
    for block in re.split(r'\n\s*\n', text.strip()):
        lines = block.strip().splitlines()
        if len(lines) < 3:
            continue
        m = re.match(r'(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)', lines[1])
        if not m:
            continue
        g = [int(x) for x in m.groups()]
        start = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000
        end = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000
        cues.append((start, end, ' '.join(l.strip() for l in lines[2:]).strip()))
    return cues


ENDINGS = re.compile(r'(습니다|입니다|니다|어요|아요|에요|예요|해요|세요|죠|거든요|네요|군요|래요|데요|구요|고요|겠죠|잖아요|이에요|돼요|봐요|줘요|와요)$')
QUESTION = re.compile(r'(까요|나요|가요|ㄹ까|을까|까|죠\?)$')


def punctuate(text, punctuated):
    text = re.sub(r'\s+', ' ', text).strip()
    if punctuated or not text:
        return text
    # 편집 자막(문장부호 없음): 한 줄 안에서 끝나는 문장에도 마침표를 넣는다.
    text = re.sub(r'(까요|나요|가요|을까|ㄹ까)\s+(?=\S)', r'\1? ', text)
    text = re.sub(r'(습니다|입니다|니다|거든요|잖아요|겠죠|에요|예요|어요|아요|해요|세요|돼요|네요|죠)\s+(?=\S)', r'\1. ', text)
    if text[-1] in '.?!…,':
        return text
    if QUESTION.search(text):
        return text + '?'
    if ENDINGS.search(text):
        return text + '.'
    return text


def sentences(cues, punctuated):
    """자막을 문장으로 잇는다. 각 문장의 시각은 그 문장이 시작된 자막의 시각, gap은 앞 문장과의 쉼."""
    out, buf, t0, prev_end, gap = [], [], None, None, 0.0
    for s, e, t in cues:
        piece = punctuate(t, punctuated)
        if not piece:
            continue
        # 한 자막 안에서 문장이 끝나고 새 문장이 시작될 수 있다.
        parts = re.split(r'(?<=[.?!])\s+', piece)
        for k, part in enumerate(parts):
            if not buf:
                t0 = s
                gap = (s - prev_end) if (prev_end is not None and k == 0) else 0.0
            buf.append(part)
            if part[-1] in '.?!':
                out.append((t0, gap, ' '.join(buf)))
                buf = []
        prev_end = e
    if buf:
        out.append((t0, gap, ' '.join(buf)))
    return out


def paragraphs(sents, start, end):
    """챕터 구간의 문장을 문단으로 묶는다. 말이 1.2초 넘게 끊기거나 4문장이 차면 문단을 나눈다."""
    paras, cur = [], []
    for t, gap, text in sents:
        if t < start - 0.3 or t >= end - 0.3:
            continue
        if cur and (len(cur) >= 4 or (gap > 1.2 and len(cur) >= 2)):
            paras.append(' '.join(cur)); cur = []
        cur.append(text)
    if cur:
        paras.append(' '.join(cur))
    return [re.sub(r'\s+([.?!,])', r'\1', p).strip() for p in paras if p.strip()]


def link_ref(ref):
    out = esc(ref)
    doi = re.search(r'(?:DOI\s*|doi:)(10\.\d{4,9}/[^\s·,;)]+)', ref)
    pmid = re.search(r'PMID\s*(\d{6,9})', ref)
    links = []
    if doi:
        d = doi.group(1).rstrip('.')
        links.append(f'<a href="https://doi.org/{esc(d)}" rel="noopener" target="_blank">DOI</a>')
    if pmid:
        links.append(f'<a href="https://pubmed.ncbi.nlm.nih.gov/{pmid.group(1)}/" rel="noopener" target="_blank">PubMed</a>')
    return out + (' <span class="jj-ref-links">' + ' · '.join(links) + '</span>' if links else ''), (doi.group(1).rstrip('.') if doi else None), (pmid.group(1) if pmid else None)


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False).replace('</', '<\\/') + '</script>'


CSS = '''<style>
.jj-wrap{max-width:780px;margin:0 auto;padding:0 20px}
.jj-hero{padding:120px 0 28px;background:var(--bg-cream,#faf7f2)}
.jj-crumb{font-size:.85rem;color:#7a6a5c;margin-bottom:14px}.jj-crumb a{color:inherit}
.jj-kicker{font-size:.85rem;font-weight:700;color:#6B4226;letter-spacing:.02em;margin:0 0 8px}
.jj-hero h1{font-size:clamp(1.6rem,4.6vw,2.3rem);line-height:1.35;margin:0 0 14px;word-break:keep-all}
.jj-lede{font-size:1.05rem;line-height:1.75;color:#3b322b;margin:0 0 14px;word-break:keep-all}
.jj-by{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.9rem;color:#6b5d51}.jj-by a{color:#6B4226;font-weight:600}
.jj-player{position:relative;aspect-ratio:16/9;margin:24px 0 8px;border-radius:14px;overflow:hidden;background:#111}
.jj-player button{all:unset;cursor:pointer;position:absolute;inset:0;display:block}
.jj-player img,.jj-player iframe{width:100%;height:100%;object-fit:cover;border:0;display:block}
.jj-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:68px;height:48px;border-radius:12px;background:rgba(220,0,0,.9);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem}
.jj-player-note{font-size:.85rem;color:#7a6a5c;margin:0}
.jj-body{padding:28px 0 40px;line-height:1.85;font-size:1.02rem;color:#2c2520;word-break:keep-all}
.jj-body h2{font-size:1.35rem;line-height:1.45;margin:44px 0 12px;padding-top:6px;border-top:1px solid #eee4d8}
.jj-body h2 .jj-t{font-size:.85rem;font-weight:600;margin-left:8px;color:#6B4226;white-space:nowrap}
.jj-body h3{font-size:1.08rem;margin:20px 0 8px}
.jj-box{background:#fbf7f1;border:1px solid #eadfce;border-radius:14px;padding:18px 20px;margin:20px 0}
.jj-box ul{margin:6px 0 0;padding-left:20px}.jj-box li{margin:4px 0}
.jj-toc ol{margin:6px 0 0;padding-left:0;list-style:none;columns:2;column-gap:24px}.jj-toc li{margin:3px 0;break-inside:avoid}
.jj-toc a{color:#3b322b;text-decoration:none}.jj-toc a:hover{text-decoration:underline}.jj-toc span{color:#6B4226;font-variant-numeric:tabular-nums;margin-right:6px}
.jj-fig{margin:16px 0 18px}.jj-fig img{width:100%;height:auto;border-radius:12px;display:block}
.jj-fig figcaption{font-size:.84rem;color:#7a6a5c;margin-top:6px}
.jj-say{margin:0 0 14px}
.jj-jump{font-size:.88rem}.jj-jump a{color:#6B4226}
.jj-refs li{margin:8px 0;font-size:.95rem}.jj-ref-links a{color:#6B4226;font-weight:600}
.jj-note{font-size:.9rem;color:#6b5d51}
.jj-cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.jj-cards{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));padding:28px 0 50px}
.jj-card{display:block;border:1px solid #eadfce;border-radius:14px;overflow:hidden;text-decoration:none;color:inherit;background:#fff}
.jj-card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
.jj-card div{padding:14px 16px}.jj-card h2{font-size:1.05rem;line-height:1.45;margin:0 0 6px;word-break:keep-all}
.jj-card p{font-size:.9rem;color:#6b5d51;margin:0;line-height:1.6}
@media (max-width:640px){.jj-hero{padding-top:96px}.jj-toc ol{columns:1}}
</style>'''

PLAYER_JS = '''<script>
document.addEventListener('click',function(e){var b=e.target.closest('.jj-player button');if(!b)return;var f=document.createElement('iframe');
f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.id+'?autoplay=1&rel=0&cc_load_policy=1&cc_lang_pref=ko'+(b.dataset.t?'&start='+b.dataset.t:'');
f.title=b.getAttribute('aria-label');f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;b.replaceWith(f);});
document.addEventListener('click',function(e){var a=e.target.closest('a[data-seek]');if(!a)return;var p=document.querySelector('.jj-player');if(!p)return;e.preventDefault();
var b=p.querySelector('button'),f=p.querySelector('iframe'),id=(b||{}).dataset?b.dataset.id:p.dataset.id;
var n=document.createElement('iframe');n.src='https://www.youtube-nocookie.com/embed/'+p.dataset.id+'?autoplay=1&rel=0&cc_load_policy=1&cc_lang_pref=ko&start='+a.dataset.seek;
n.title='영상 재생';n.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';n.allowFullscreen=true;(b||f).replaceWith(n);p.scrollIntoView({behavior:'smooth',block:'center'});});
</script>'''


def page(title, description, canonical, og_image, body, schemas, og_type='article'):
    url = BASE + canonical
    return f'''<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>{HEAD_TRACKING}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <meta name="author" content="문석준">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="{url}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:type" content="{og_type}">
  <meta property="og:url" content="{url}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="{esc(og_image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(description)}">
  <meta name="twitter:image" content="{esc(og_image)}">
  {HEAD_LINKS}  <link rel="prefetch" href="/reservation" as="document">
  {''.join(ld(s) for s in schemas)}
  {CSS}
</head>
{HEADER}<main id="main-content" role="main">
{body}
</main>{FOOTER}{PLAYER_JS}
{SW}</body>
</html>
'''


def build_video(v):
    vid, slug = v['id'], v['slug']
    canonical = f'{HUB}{slug}'
    length = parse_duration(v['duration'])
    intro, summary, chapters, refs, notes = parse_description(v['description'])
    drop = v.get('dropSummaryIf', [])
    summary = [(n, [i for i in items if not any(d in i for d in drop)]) for n, items in summary]
    summary = [(n, items) for n, items in summary if items]
    refs = [r for r in refs if not any(d in r for d in drop)]
    intro = [l for l in intro if not l.startswith('문석준')]
    transcript = read(f'data/jinjeong-transcripts/{vid}.srt')
    cues = parse_srt(transcript)
    punctuated = sum(t.count('.') + t.count('?') for _, _, t in cues) > len(cues) * 0.25
    sents = sentences(cues, punctuated)
    if not chapters:
        chapters = [(0, '영상 전체')]
    thumb = f'https://i.ytimg.com/vi/{vid}/maxresdefault.jpg'
    hero_img = v['hero']['src'] if v.get('hero') else thumb
    hero_alt = v['hero']['alt'] if v.get('hero') else f'{v["h1"]} 영상 썸네일'
    published = v['publishedAt'][:10]
    caps = v.get('captures', {})

    lede = ' '.join(intro[:2])
    desc = re.sub(r'\s+', ' ', f'{v["h1"]} 문석준 원장이 논문을 근거로 설명한 영상의 내용을 글로 정리했습니다. {lede}').strip()
    if len(desc) > 155:
        desc = desc[:154].rstrip() + '…'

    toc = ''.join(f'<li><a href="#ch{i + 1}"><span>{fmt_time(t)}</span>{esc(name)}</a></li>' for i, (t, name) in enumerate(chapters))
    sum_html = ''.join(
        (f'<h3>{esc(n)}</h3>' if len(summary) > 1 or not n.startswith('핵심') else '') + '<ul>' + ''.join(f'<li>{esc(i)}</li>' for i in items) + '</ul>'
        for n, items in summary)
    sections = []
    clips = []
    for i, (t, name) in enumerate(chapters):
        end = chapters[i + 1][0] if i + 1 < len(chapters) else length
        paras = paragraphs(sents, t, end)
        cap = caps.get(str(i + 1))
        fig = ''
        if cap:
            fig = f'<figure class="jj-fig"><img src="{cap["src"]}" alt="{esc(cap["alt"])}" loading="lazy" width="1280" height="720"><figcaption>{esc(cap["alt"])} · 영상 {fmt_time(t)} 부근 화면</figcaption></figure>'
        says = ''.join(f'<p class="jj-say">{esc(p)}</p>' for p in paras)
        sections.append(f'<h2 id="ch{i + 1}">{esc(name)}<span class="jj-t">{fmt_time(t)}</span></h2>{fig}{says}'
                        f'<p class="jj-jump"><a href="https://www.youtube.com/watch?v={vid}&amp;t={t}s" data-seek="{t}">▶ 이 부분 영상으로 보기 ({fmt_time(t)})</a></p>')
        clips.append({'@type': 'Clip', 'name': name, 'startOffset': t, 'endOffset': end, 'url': f'https://www.youtube.com/watch?v={vid}&t={t}s'})

    ref_items, citations = [], []
    for r in refs:
        h, doi, pmid = link_ref(r)
        ref_items.append(f'<li>{h}</li>')
        c = {'@type': 'ScholarlyArticle', 'name': re.sub(r'\s*(DOI|doi:|PMID).*$', '', r).strip(' .·—-')[:300]}
        if doi:
            c['sameAs'] = f'https://doi.org/{doi}'
        elif pmid:
            c['sameAs'] = f'https://pubmed.ncbi.nlm.nih.gov/{pmid}/'
        citations.append(c)
    notes = [n for n in notes if 'CC' not in n]

    body = f'''
<section class="jj-hero"><div class="jj-wrap">
  <nav class="jj-crumb" aria-label="현재 위치"><a href="/">홈</a> › <a href="/video/">영상</a> › <a href="{HUB}">진정 임플란트 영상 해설</a></nav>
  <p class="jj-kicker">진정 임플란트 · 논문으로 보는 임플란트</p>
  <h1>{esc(v["h1"])}</h1>
  {''.join(f'<p class="jj-lede">{esc(l)}</p>' for l in intro[:3])}
  <div class="jj-by"><span>설명 <a href="/doctors/moon">문석준 원장</a> (서울비디치과 대표원장·치과의사)</span><span>영상 공개 {published}</span><span>길이 {fmt_time(length)}</span></div>
  <div class="jj-player" data-id="{vid}"><button type="button" data-id="{vid}" aria-label="{esc(v["youtubeTitle"])} 영상 재생"><img src="{esc(hero_img)}" alt="{esc(hero_alt)}" width="1280" height="720" fetchpriority="high"><span class="jj-play" aria-hidden="true">▶</span></button></div>
  <p class="jj-player-note">유튜브 「{esc(v["youtubeTitle"])}」 · 한국어 교정 자막(CC) 제공</p>
</div></section>
<article class="jj-body"><div class="jj-wrap">
  {f'<div class="jj-box"><h2 style="margin:0;border:0;padding:0;font-size:1.15rem">핵심 정리</h2>{sum_html}</div>' if sum_html else ''}
  <nav class="jj-box jj-toc" aria-label="목차"><strong>목차 (영상 챕터)</strong><ol>{toc}</ol></nav>
  <p class="jj-note">아래 글은 영상에서 문석준 원장이 한 설명을 교정 자막 그대로, 챕터별로 옮긴 것입니다. 말투를 살리기 위해 문장을 다시 쓰지 않았습니다.</p>
  {''.join(sections)}
  <h2 id="refs">근거 논문</h2>
  <ol class="jj-refs">{''.join(ref_items)}</ol>
  <div class="jj-box">
    <h2 style="margin:0 0 6px;border:0;padding:0;font-size:1.1rem">진료 안내</h2>
    <p style="margin:0">{''.join(esc(n.lstrip('※ ').strip()) + ' ' for n in notes) or '개인 상태에 따라 다릅니다. 치료 여부는 진찰로 결정합니다.'}</p>
    <p style="margin:8px 0 0">문석준 원장은 천안 불당동 서울비디치과에서 진료합니다.</p>
    <div class="jj-cta"><a class="btn btn-primary" href="/reservation">상담 예약</a><a class="btn btn-outline" href="/doctors/moon">문석준 원장 소개</a><a class="btn btn-outline" href="{HUB}">다른 영상 해설</a></div>
  </div>
</div></article>'''

    video_obj = {
        '@type': 'VideoObject', '@id': f'{BASE}{canonical}#video', 'name': v['youtubeTitle'], 'description': ' '.join(intro) or v['h1'],
        'thumbnailUrl': [thumb], 'uploadDate': v['publishedAt'], 'duration': v['duration'],
        'embedUrl': f'https://www.youtube.com/embed/{vid}', 'url': f'https://www.youtube.com/watch?v={vid}', 'inLanguage': 'ko',
        'author': DOCTOR, 'publisher': ORG, 'hasPart': clips,
    }
    article = {
        '@context': 'https://schema.org', '@type': 'MedicalWebPage', '@id': f'{BASE}{canonical}#webpage', 'url': BASE + canonical,
        'name': v['h1'], 'headline': v['h1'], 'description': desc, 'inLanguage': 'ko', 'datePublished': published,
        'author': DOCTOR, 'reviewedBy': DOCTOR, 'publisher': ORG, 'about': {'@type': 'MedicalProcedure', 'name': '치과 임플란트'},
        'image': BASE + hero_img if hero_img.startswith('/') else hero_img, 'citation': citations, 'video': video_obj,
        'isPartOf': {'@type': 'CollectionPage', '@id': BASE + HUB},
    }
    crumbs = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': '홈', 'item': BASE + '/'},
        {'@type': 'ListItem', 'position': 2, 'name': '영상', 'item': BASE + '/video/'},
        {'@type': 'ListItem', 'position': 3, 'name': '진정 임플란트 영상 해설', 'item': BASE + HUB},
        {'@type': 'ListItem', 'position': 4, 'name': v['h1'], 'item': BASE + canonical}]}
    title = f'{v["h1"]} | 문석준 원장 논문 해설 | 서울비디치과'
    og = BASE + hero_img if hero_img.startswith('/') else hero_img
    write(f'video/jinjeong/{slug}.html', page(title, desc, canonical, og, body, [crumbs, article]))
    return dict(slug=slug, h1=v['h1'], lede=lede, img=hero_img, alt=hero_alt, published=published, length=length, url=canonical)


def build_hub(items):
    cards = ''.join(
        f'<a class="jj-card" href="{i["url"]}"><img src="{esc(i["img"])}" alt="{esc(i["alt"])}" loading="lazy" width="1280" height="720"><div><h2>{esc(i["h1"])}</h2><p>{esc(i["lede"][:90])}{"…" if len(i["lede"]) > 90 else ""}</p><p>{i["published"]} · {fmt_time(i["length"])}</p></div></a>'
        for i in items)
    body = f'''
<section class="jj-hero"><div class="jj-wrap" style="max-width:1080px">
  <nav class="jj-crumb" aria-label="현재 위치"><a href="/">홈</a> › <a href="/video/">영상</a> › 진정 임플란트 영상 해설</nav>
  <p class="jj-kicker">진정 임플란트 · 문석준 원장</p>
  <h1>논문으로 보는 임플란트 — 영상 해설</h1>
  <p class="jj-lede">임플란트를 앞두고 가장 많이 받는 질문을, 문석준 원장이 논문을 하나씩 읽고 영상으로 설명했습니다. 각 페이지에서 영상의 내용을 글로 읽고, 근거 논문을 직접 확인할 수 있습니다.</p>
  <div class="jj-by"><span>설명 <a href="/doctors/moon">문석준 원장</a> (서울비디치과 대표원장)</span><span><a href="{CHANNEL}" rel="noopener" target="_blank">유튜브 채널 「진정 임플란트」</a></span></div>
</div></section>
<section><div class="jj-wrap" style="max-width:1080px"><div class="jj-cards">{cards}</div></div></section>'''
    schema = {'@context': 'https://schema.org', '@type': 'CollectionPage', '@id': BASE + HUB, 'url': BASE + HUB, 'name': '논문으로 보는 임플란트 — 영상 해설', 'inLanguage': 'ko', 'author': DOCTOR, 'publisher': ORG,
              'mainEntity': {'@type': 'ItemList', 'itemListElement': [{'@type': 'ListItem', 'position': n + 1, 'url': BASE + i['url'], 'name': i['h1']} for n, i in enumerate(items)]}}
    crumbs = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': '홈', 'item': BASE + '/'},
        {'@type': 'ListItem', 'position': 2, 'name': '영상', 'item': BASE + '/video/'},
        {'@type': 'ListItem', 'position': 3, 'name': '진정 임플란트 영상 해설', 'item': BASE + HUB}]}
    desc = '문석준 원장(서울비디치과)이 임플란트 수명·흡연·지병·뼈이식·즉시 식립·풀아치를 논문으로 설명한 영상과 글 해설. 근거 논문 DOI 포함.'
    write('video/jinjeong/index.html', page('논문으로 보는 임플란트 영상 해설 | 문석준 원장 | 서울비디치과', desc, HUB, BASE + items[0]['img'] if items[0]['img'].startswith('/') else items[0]['img'], body, [crumbs, schema], 'website'))


if __name__ == '__main__':
    videos = json.loads(read('data/jinjeong-videos.json'))
    items = [build_video(v) for v in videos]
    build_hub(items)
    print(f'built {len(items)} pages + hub')
