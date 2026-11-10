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

# id: (제목, 쇼츠 여부)
VIDEOS = {
    'g8U7MbzX3sM': ('신경치료 한 번으로 끝내고 싶다면?', True),
    '9RoEQ-r_e8w': ('잇몸에 뾰루지가 생겼다면? 절대 그냥 넘기지 마세요!', True),
    'fmeVXiZJ2z4': ('신경치료 했는데 계속 아프다면?', True),
    '_WsDBrY8L0k': ('신경치료까지 했는데 또 아프다면? 재신경치료 해야할까?', False),
    'aguNbIjDDc4': ('70ㆍ80대도 풀아치 임플란트 가능할까?', True),
    'CckSmroVus0': ('풀아치임플란트 vs 틀니, 뭐가 더 좋을까?', True),
    'CsmGBrb1vCs': ('틀니 오래 쓰면 생기는 문제?', True),
    'eu-KKi0Tafg': ('틀니 vs 풀아치 임플란트, 뭐가 더 좋을까?', False),
    'L6Q5SpEdoqc': ('자꾸 턱이 빠진다면? 이렇게 치료하세요!', True),
    't2EY5KHTNbE': ('턱이 빠진 후, 이 행동은 조심하세요!', True),
    'DoIgKvbUvWY': ('턱 빠졌을 때 가장 먼저 해야할 일!', True),
    'HYmZt2aNb8o': ('턱 빠졌을 때 이렇게 해보세요! | 턱이 빠지는 원인과 대처 방법!', False),
    'pC7GdSFoAHk': ('치아 교정 부작용, 턱관절 질환?', True),
    'eMHV7ohd6WM': ('이런 사람은 교정하지 마세요!', True),
    'T4QmNRCESRU': ('치아 교정 후, 잇몸병 부작용?', True),
}

DOCTORS = {
    'jo': ('조설아 원장', '보존과', ['_WsDBrY8L0k', 'g8U7MbzX3sM', 'fmeVXiZJ2z4', '9RoEQ-r_e8w']),
    'lee-bm': ('이병민 원장', '구강내과', ['HYmZt2aNb8o', 'DoIgKvbUvWY', 't2EY5KHTNbE', 'L6Q5SpEdoqc']),
    'lee': ('이승엽 원장', '임플란트센터', ['eu-KKi0Tafg', 'aguNbIjDDc4', 'CckSmroVus0', 'CsmGBrb1vCs']),
    'kim-mg': ('김민규 원장', '교정과', ['eMHV7ohd6WM', 'T4QmNRCESRU', 'pC7GdSFoAHk']),
}
WHO = {vid: (name, dept, slug) for slug, (name, dept, vids) in DOCTORS.items() for vid in vids}

TREATMENTS = {
    'root-canal': ['_WsDBrY8L0k', 'g8U7MbzX3sM', 'fmeVXiZJ2z4', '9RoEQ-r_e8w'],
    're-root-canal': ['_WsDBrY8L0k', 'fmeVXiZJ2z4', 'g8U7MbzX3sM'],
    'apicoectomy': ['9RoEQ-r_e8w', '_WsDBrY8L0k'],
    'tmj': ['HYmZt2aNb8o', 'DoIgKvbUvWY', 't2EY5KHTNbE', 'L6Q5SpEdoqc'],
    'oral-medicine': ['HYmZt2aNb8o', 'DoIgKvbUvWY', 't2EY5KHTNbE', 'L6Q5SpEdoqc'],
    'implant-full-mouth': ['eu-KKi0Tafg', 'aguNbIjDDc4', 'CckSmroVus0'],
    'implant-hybrid': ['eu-KKi0Tafg', 'aguNbIjDDc4', 'CckSmroVus0'],
    'implant-overdenture': ['eu-KKi0Tafg', 'CckSmroVus0', 'CsmGBrb1vCs'],
    'denture': ['eu-KKi0Tafg', 'CsmGBrb1vCs', 'CckSmroVus0'],
    'orthodontics': ['eMHV7ohd6WM', 'T4QmNRCESRU', 'pC7GdSFoAHk'],
    'invisalign': ['eMHV7ohd6WM', 'pC7GdSFoAHk'],
}

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
    credit = (f'<a href="/doctors/{slug}" style="color:#6B4226;font-weight:700;text-decoration:none;">{name}</a> ({dept}) · '
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


def block(heading, sub, vids, show_doctor):
    cards = ''.join(card(v, show_doctor) for v in vids)
    return (
        f'\n<section class="section-sm" {MARK} aria-label="{html.escape(heading, quote=True)}" style="padding:32px 0 0;">'
        '<div class="container"><div style="background:#faf7f3;border-radius:20px;padding:28px 24px;border:1px solid #ede6dd;">'
        f'<h2 style="font-size:1.15rem;font-weight:800;color:#6B4226;margin:0 0 6px;display:flex;align-items:center;gap:8px;">'
        f'<i class="fab fa-youtube" style="color:#f00;"></i> {html.escape(heading)}</h2>'
        f'<p style="font-size:14px;color:#78716C;margin:0 0 16px;line-height:1.6;">{html.escape(sub)}</p>'
        f'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;align-items:start;">{cards}</div>'
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


# 원장 페이지: 「원장 소개 영상」 섹션 바로 뒤
for slug, (name, dept, vids) in DOCTORS.items():
    put(f'doctors/{slug}.html',
        block(f'{name} 출연 영상', f'{name}이 쉽디 쉬운 치과이야기에서 직접 설명한 최근 영상입니다.', vids, False),
        re.compile(r'<section class="video-intro-section">.*?</section>', re.S))

# 진료 페이지: 기존 「관련 영상」 섹션 바로 뒤
for slug, vids in TREATMENTS.items():
    put(f'treatments/{slug}.html',
        block('의료진이 설명하는 최근 영상', '서울비디치과 원장이 쉽디 쉬운 치과이야기에서 직접 설명한 영상입니다.', vids, True),
        re.compile(r'<section class="section-sm" id="related-videos-section".*?</section>', re.S))

print('doctors', len(DOCTORS), 'treatments', len(TREATMENTS))
