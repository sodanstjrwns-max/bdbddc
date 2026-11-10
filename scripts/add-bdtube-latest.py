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


def card(vid, show_doctor):
    title, shorts = VIDEOS[vid]
    t = html.escape(title, quote=True)
    ratio = '177.78%' if shorts else '56.25%'
    thumb = f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg'
    srcdoc = (
        "<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%;background:#000}"
        "img{position:absolute;width:100%;height:100%;object-fit:cover}"
        "span{position:absolute;width:100%;top:0;bottom:0;margin:auto;height:1.5em;text-align:center;"
        "font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style>"
        f"<a href=https://www.youtube-nocookie.com/embed/{vid}?autoplay=1><img src={thumb} alt='{t}' loading=lazy><span>▶</span></a>"
    )
    name, dept, slug = WHO[vid]
    credit = (f'<a href="/doctors/{slug}" style="color:#6B4226;font-weight:700;text-decoration:none;">{name}</a>{" (" + dept + ")" if dept else ""} · '
              if show_doctor else '')
    kind = '쇼츠' if shorts else '영상'
    # 가로 영상은 두 칸을 차지해 세로 쇼츠와 높이를 맞춘다. 좁은 화면에서는 쇼츠가 두 개씩 나란히 놓인다.
    span = '' if shorts else 'grid-column:span 2;'
    return (
        f'<div style="{span}background:#fff;border-radius:14px;overflow:hidden;border:1px solid #ede6dd;">'
        f'<div style="position:relative;padding-bottom:{ratio};height:0;background:#000;">'
        f'<iframe loading="lazy" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" '
        f'src="https://www.youtube-nocookie.com/embed/{vid}" srcdoc="{html.escape(srcdoc, quote=True)}" title="{t}" '
        'allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>'
        f'<div style="padding:10px 12px;"><div style="font-size:14px;font-weight:700;color:#292524;line-height:1.45;word-break:keep-all;">{t}</div>'
        f'<div style="font-size:13px;color:#78716C;margin-top:6px;">{credit}쉽디 쉬운 치과이야기 · {kind}</div></div></div>'
    )


def block(heading, sub, vids, show_doctor, first=8):
    grid = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;align-items:start;'
    head = ''.join(card(v, show_doctor) for v in vids[:first])
    rest = vids[first:]
    more = ''
    if rest:
        more = (f'<details style="margin-top:14px;"><summary style="cursor:pointer;font-size:15px;font-weight:700;color:#6B4226;padding:10px 0;">'
                f'영상 {len(rest)}편 더 보기</summary><div style="{grid}margin-top:12px;">'
                + ''.join(card(v, show_doctor) for v in rest) + '</div></details>')
    return (
        f'\n<section class="section-sm" {MARK} aria-label="{html.escape(heading, quote=True)}" style="padding:32px 0 0;">'
        '<div class="container"><div style="background:#faf7f3;border-radius:20px;padding:28px 24px;border:1px solid #ede6dd;">'
        f'<h2 style="font-size:1.15rem;font-weight:800;color:#6B4226;margin:0 0 6px;display:flex;align-items:center;gap:8px;">'
        f'<i class="fab fa-youtube" style="color:#f00;"></i> {html.escape(heading)}</h2>'
        f'<p style="font-size:14px;color:#78716C;margin:0 0 16px;line-height:1.6;">{html.escape(sub)}</p>'
        f'<div style="{grid}">{head}</div>{more}'
        '<p style="margin:16px 0 0;font-size:14px;"><a href="https://www.youtube.com/@BDtube" target="_blank" rel="noopener" '
        'style="color:#6B4226;font-weight:700;">쉽디 쉬운 치과이야기 채널에서 더 보기 →</a></p>'
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
        block('의료진이 설명하는 영상', f'서울비디치과 원장이 쉽디 쉬운 치과이야기에서 직접 설명한 영상 {len(vids)}편입니다.', vids, True, first=6),
        ANCHOR_T)

print('doctors', {k: len(v[2]) for k, v in DOCTORS.items()})
print('treatments', {k: len(v) for k, v in sorted(TREATMENTS.items())}, 'skipped', skipped)
