#!/usr/bin/env python3
"""쉽디 쉬운 치과이야기(@BDtube) 최신 영상을 원장 소개·진료 페이지 원본 HTML에 넣는다.

2026-11-10 문석준 대표원장 지시. 출연 원장은 원장님이 직접 확인해 준 것만 쓴다
(영상 설명에는 원장 이름이 없다). 같은 블록이 이미 있으면 교체하므로 여러 번 돌려도 된다.
실행: python3 scripts/add-bdtube-latest.py
"""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

import json

# 출연 원장이 확인된 영상 목록. 원장님이 확인 페이지에서 고른 묶음, 영상 설명에 이름이 있는 영상,
# 홈페이지에 이미 원장 이름으로 실려 있던 영상만 들어 있다(2026-11-10). 새 영상은 이 파일에 추가한다.
CAST = json.loads((ROOT / 'data/bdtube-cast.json').read_text(encoding='utf-8'))
VIDEOS = {v['id']: (v['title'], v['shorts']) for v in CAST}
SLUGS = {'문석준': 'moon', '김민수': 'kim', '현정민': 'hyun', '이승엽': 'lee', '최종훈': 'choi', '박수빈': 'park-sb',
         '임지원': 'lim', '김민규': 'kim-mg', '강민지': 'kang-mj', '조설아': 'jo', '김민진': 'kim-mj', '서희원': 'seo',
         '박상현': 'park', '이병민': 'lee-bm'}
DEPT = {'jo': '보존과', 'lee-bm': '구강내과', 'lee': '임플란트센터', 'kim-mg': '교정과'}
TITLE = {'moon': '문석준 대표원장', 'kim': '김민수 대표원장', 'hyun': '현정민 대표원장'}
DOCTORS = {}
# 최신 묶음부터, 묶음 안에서는 긴 영상이 먼저
for v in sorted(CAST, key=lambda v: (v['date'][:7], not v['shorts'], v['date']), reverse=True):
    slug = SLUGS[v['doctor']]
    DOCTORS.setdefault(slug, (TITLE.get(slug, v['doctor'] + ' 원장'), DEPT.get(slug, ''), []))[2].append(v['id'])
WHO = {vid: (name, dept, slug) for slug, (name, dept, vids) in DOCTORS.items() for vid in vids}

# 본인 채널이 있는 원장의 소개 페이지는 그 채널 영상을 쓴다 (2026-11-11 문석준 대표원장 지시).
# 진료 페이지에는 쉽디 쉬운 치과이야기 출연 영상이 그대로 들어간다.
JJ_PAGES = {v['id']: v['slug'] for v in json.loads((ROOT / 'data/jinjeong-videos.json').read_text(encoding='utf-8'))}
OWN = {
    'moon': {
        'data': 'data/jinjeong-cast.json', 'who': '문석준 대표원장', 'channel': '진정 임플란트 문석준',
        'about': '논문을 근거로 임플란트를 설명합니다.',
        'url': 'https://www.youtube.com/@%EC%A7%84%EC%A0%95%EC%9E%84%ED%94%8C%EB%9E%80%ED%8A%B8%EB%AC%B8%EC%84%9D%EC%A4%80',
        'extra': ' &nbsp;·&nbsp; <a href="/video/jinjeong/">영상 해설 모아 보기 →</a>',
    },
    'hyun': {
        'data': 'data/hyun-cast.json', 'who': '현정민 대표원장', 'channel': '앞니는 현정민',
        'about': '라미네이트와 앞니 심미치료를 설명합니다.',
        'url': 'https://www.youtube.com/@%EC%95%9E%EB%8B%88%EB%8A%94%ED%98%84%EC%A0%95%EB%AF%BC',
        'extra': '',
    },
}
for slug, own in OWN.items():
    own['videos'] = sorted(json.loads((ROOT / own['data']).read_text(encoding='utf-8')), key=lambda v: v['date'], reverse=True)
    for v in own['videos']:
        VIDEOS.setdefault(v['id'], (v['title'], v['shorts']))
        WHO.setdefault(v['id'], (own['who'], '', slug))

# 진료 페이지 배치: 영상 제목(없으면 같은 묶음의 대표 영상 제목)의 주제어로 정한다.
RULES = [
    (r'풀아치|올온', ['implant-full-mouth', 'implant-hybrid']),
    (r'틀니', ['denture', 'implant-overdenture']),
    (r'뼈이식', ['implant-advanced', 'implant']),
    (r'원데이|발치 ?즉시', ['implant-immediate', 'implant']),
    (r'상악동', ['implant-sinus-lift', 'implant-advanced']),
    (r'임플란트', ['implant']),
    (r'재신경', ['re-root-canal', 'root-canal']),
    (r'신경치료|치수염|뾰루지', ['root-canal']),
    (r'라미네이트', ['glownate']),
    (r'미백', ['whitening']),
    (r'반점|레진', ['aesthetic', 'resin']),
    (r'인비절라인|투명교정', ['invisalign', 'orthodontics']),
    (r'교정|유지장치', ['orthodontics']),
    (r'이갈이', ['bruxism', 'oral-medicine']),
    (r'턱 ?빠|턱이 빠|턱관절|개구|입이 잘 안|턱 보톡스|턱이 불편|턱이 뻐근|턱이 아프', ['tmj', 'oral-medicine']),
    (r'구강암|입병|구내염|혓바늘', ['oral-medicine']),
    (r'치주염|양치할 때 피', ['periodontitis', 'gum']),
    (r'잇몸|입 ?냄새', ['gum']),
    (r'스케일링', ['scaling']),
    (r'사랑니|매복', ['wisdom-tooth']),
    (r'불소', ['prevention', 'pediatric']),
    (r'소아|아이|어린이|유치', ['pediatric']),
    (r'충치', ['cavity']),
    (r'수면마취|진정', ['sedation']),
    (r'외상', ['emergency']),
    (r'벌어진|틈', ['aesthetic']),
    (r'칫솔|치약|치간', ['prevention']),
    (r'크라운', ['crown']),
]
REP = {}
for v in CAST:
    if not v['shorts'] or v['series'] not in REP:
        REP[v['series']] = v['title'] if not v['shorts'] else REP.get(v['series'], v['title'])


def topics(v):
    # 제목에 걸리는 주제를 모두 모은다(예: 「틀니 vs 풀아치 임플란트」는 틀니와 전체 임플란트 양쪽).
    for text in (v['title'], REP.get(v['series'], '')):
        found = []
        for pattern, slugs in RULES:
            if re.search(pattern, text):
                found += [x for x in slugs if x not in found]
        if found:
            return found
    return []


TREATMENTS = {}
for v in sorted(CAST, key=lambda v: (not v['shorts'], v['date']), reverse=True):  # 긴 영상 먼저, 그 안에서 최신순
    for slug in topics(v):
        TREATMENTS.setdefault(slug, []).append(v['id'])

MARK = 'data-bdtube-latest'
BLOCK_RE = re.compile(r'\n?<section[^>]*' + MARK + r'[^>]*>.*?</section><!-- /bdtube-latest -->', re.S)


STYLE = (
    '<style>'
    '.bdv-box{background:#faf7f3;border-radius:20px;padding:28px 24px;border:1px solid #ede6dd}'
    '.bdv-h{font-size:1.15rem;font-weight:800;color:#6B4226;margin:0 0 6px;display:flex;align-items:center;gap:8px}'
    '.bdv-sub{font-size:14px;color:#78716C;margin:0 0 18px;line-height:1.6}'
    '.bdv-label{font-size:13px;font-weight:800;color:#78716C;letter-spacing:.04em;margin:18px 0 10px}'
    '.bdv-label:first-of-type{margin-top:0}'
    # 가로 영상과 쇼츠는 줄을 따로 쓴다. auto-fill 이라 개수가 적어도 카드가 늘어나지 않고 왼쪽부터 같은 크기로 선다.
    '.bdv-long{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}'
    '.bdv-short{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}'
    '.bdv-card{background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ede6dd;display:flex;flex-direction:column}'
    '.bdv-frame{position:relative;height:0;background:#000}'
    '.bdv-long .bdv-frame{padding-bottom:56.25%}.bdv-short .bdv-frame{padding-bottom:177.78%}'
    '.bdv-frame iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}'
    '.bdv-text{padding:10px 12px 12px}'
    # 제목은 두 줄로 자르고 두 줄 높이를 항상 확보해 카드 높이를 맞춘다.
    '.bdv-title{font-size:14px;font-weight:700;color:#292524;line-height:1.45;word-break:keep-all;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.9em}'
    '.bdv-credit{font-size:13px;color:#78716C;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    '.bdv-credit a{color:#6B4226;font-weight:700;text-decoration:none}'
    '.bdv-more{margin-top:16px}.bdv-more>summary{cursor:pointer;font-size:15px;font-weight:700;color:#6B4226;padding:10px 0}'
    '.bdv-more[open]>summary{margin-bottom:8px}'
    '.bdv-link{margin:16px 0 0;font-size:14px}.bdv-link a{color:#6B4226;font-weight:700}'
    '@media(max-width:640px){.bdv-box{padding:22px 16px}.bdv-long{grid-template-columns:1fr}.bdv-short{grid-template-columns:repeat(2,1fr)}}'
    '</style>'
)


def card(vid, show_doctor):
    title, shorts = VIDEOS[vid]
    t = html.escape(title, quote=True)
    thumb = f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg'
    srcdoc = (
        "<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%;background:#000}"
        "img{position:absolute;width:100%;height:100%;object-fit:cover}"
        "span{position:absolute;width:100%;top:0;bottom:0;margin:auto;height:1.5em;text-align:center;"
        "font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style>"
        f"<a href=https://www.youtube-nocookie.com/embed/{vid}?autoplay=1><img src={thumb} alt='{t}' loading=lazy><span>▶</span></a>"
    )
    name, dept, slug = WHO[vid]
    credit = f'<div class="bdv-credit"><a href="/doctors/{slug}">{name}</a></div>' if show_doctor else ''
    if vid in JJ_PAGES and not show_doctor:
        credit = f'<div class="bdv-credit"><a href="/video/jinjeong/{JJ_PAGES[vid]}">글로 정리한 해설 읽기 →</a></div>'
    return (
        '<div class="bdv-card"><div class="bdv-frame">'
        f'<iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/{vid}" srcdoc="{html.escape(srcdoc, quote=True)}" title="{t}" '
        'allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>'
        f'<div class="bdv-text"><div class="bdv-title">{t}</div>{credit}</div></div>'
    )


def rows(vids, show_doctor, labels):
    longs = [v for v in vids if not VIDEOS[v][1]]
    shorts = [v for v in vids if VIDEOS[v][1]]
    out = ''
    if longs:
        out += (f'<p class="bdv-label">영상</p>' if labels else '') + '<div class="bdv-long">' + ''.join(card(v, show_doctor) for v in longs) + '</div>'
    if shorts:
        out += (f'<p class="bdv-label">쇼츠</p>' if labels else '') + '<div class="bdv-short">' + ''.join(card(v, show_doctor) for v in shorts) + '</div>'
    return out


def block(heading, sub, vids, show_doctor, first_long=3, first_short=6, link=None):
    longs = [v for v in vids if not VIDEOS[v][1]]
    shorts = [v for v in vids if VIDEOS[v][1]]
    head = longs[:first_long] + shorts[:first_short]
    rest = longs[first_long:] + shorts[first_short:]
    labels = bool(longs and shorts)
    more = ''
    if rest:
        more = f'<details class="bdv-more"><summary>영상 {len(rest)}편 더 보기</summary>{rows(rest, show_doctor, labels)}</details>'
    return (
        f'\n<section class="section-sm" {MARK} aria-label="{html.escape(heading, quote=True)}" style="padding:32px 0 0;">{STYLE}'
        '<div class="container"><div class="bdv-box">'
        f'<h2 class="bdv-h"><i class="fab fa-youtube" style="color:#f00;"></i> {html.escape(heading)}</h2>'
        f'<p class="bdv-sub">{html.escape(sub)}</p>'
        f'{rows(head, show_doctor, labels)}{more}'
        + (link or '<p class="bdv-link"><a href="https://www.youtube.com/@BDtube" target="_blank" rel="noopener">쉽디 쉬운 치과이야기 채널에서 더 보기 →</a></p>') +
        '</div></div></section><!-- /bdtube-latest -->'
    )


def put(path, new_block, anchor_re):
    p = ROOT / path
    s = p.read_text(encoding='utf-8')
    s = BLOCK_RE.sub('', s)
    m = anchor_re.search(s)
    if not m:
        raise SystemExit(f'anchor not found: {path}')
    s = s[:m.end()] + new_block + s[m.end():]
    p.write_text(s, encoding='utf-8')


# 먼저 모든 원장·진료 페이지에서 이전에 넣은 블록을 지운다(목록에서 빠진 페이지에 옛 블록이 남지 않게).
for old in list((ROOT / 'doctors').glob('*.html')) + list((ROOT / 'treatments').glob('*.html')):
    text = old.read_text(encoding='utf-8')
    cleaned = BLOCK_RE.sub('', text)
    if cleaned != text:
        old.write_text(cleaned, encoding='utf-8')

# 원장 페이지: 「원장 소개 영상」 섹션 바로 뒤
for slug, (name, dept, vids) in DOCTORS.items():
    if slug in OWN:
        own = OWN[slug]
        ids = [v['id'] for v in own['videos']]
        put(f'doctors/{slug}.html',
            block(f"{own['who']} 채널 영상", f"{own['who']}이 운영하는 유튜브 채널 「{own['channel']}」의 영상 {len(ids)}편입니다. {own['about']}", ids, False,
                  link=f'<p class="bdv-link"><a href="{own["url"]}" target="_blank" rel="noopener">{own["channel"]} 채널에서 더 보기 →</a>{own["extra"]}</p>'),
            re.compile(r'<section class="video-intro-section">.*?</section>', re.S))
        continue
    put(f'doctors/{slug}.html',
        block(f'{name} 출연 영상', f'{name}이 쉽디 쉬운 치과이야기에서 직접 설명한 영상 {len(vids)}편입니다.', vids, False),
        re.compile(r'<section class="video-intro-section">.*?</section>', re.S))

# 진료 페이지: 기존 「관련 영상」 섹션 바로 뒤. 그 섹션이 없는 진료 페이지는 건너뛰고 알린다.
ANCHOR_T = re.compile(r'<section class="section-sm" id="related-videos-section".*?</section>', re.S)
skipped = []
for slug, vids in sorted(TREATMENTS.items()):
    path = ROOT / f'treatments/{slug}.html'
    if not path.exists() or not ANCHOR_T.search(path.read_text(encoding='utf-8')):
        skipped.append(slug)
        continue
    put(f'treatments/{slug}.html',
        block('의료진이 설명하는 영상', f'서울비디치과 원장이 쉽디 쉬운 치과이야기에서 직접 설명한 영상 {len(vids)}편입니다.', vids, True),
        ANCHOR_T)

print('doctors', {k: len(v[2]) for k, v in DOCTORS.items()})
print('treatments', {k: len(v) for k, v in sorted(TREATMENTS.items())}, 'skipped', skipped)
