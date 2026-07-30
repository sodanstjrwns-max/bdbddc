#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
서울비디치과 — 구글 공식문서 기준 월간 자동 감사
=================================================
근거: 「구글_공식문서_마스터가이드」 18개 공식 문서 + 부록 B 월간 15분 점검 루틴

사용법
  python3 scripts/audit.py               # 로컬 파일 감사
  python3 scripts/audit.py --json out.json
  python3 scripts/audit.py --prod        # 운영 사이트 샘플 검증 추가

문서 대응
  ③ 스팸 정책       — 키워드 남용 (지역명/시술명 과다 반복)
  ④ E-E-A-T         — author 메타 명시
  ⑤ Search Essentials — 색인 가능성 (noindex ↔ sitemap 충돌)
  ⑨ 구조화 데이터   — 병원 핵심 3종 (Dentist / Physician / FAQPage)
  ⑩ sitemap         — lastmod 정직성
  ⑪ robots.txt      — AI 크롤러 차단 없음
  ⑫ canonical       — 정규 URL 선언
  ⑯ 이미지 alt      — alt 누락 / 남용
  ⑰ page experience — 페이지 용량 (CWV)
  ⑱ title link      — 고유성·길이·H1 정합·키워드 남용
"""
import argparse
import collections
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE_DIRS = ('node_modules', 'dist', '.wrangler', '.git', 'scripts')

# 모바일 구글 SERP 절단 기준 (실측)
TITLE_CUT_KO = 32      # 한글/CJK
TITLE_CUT_LATIN = 65   # 라틴/키릴
DESC_CUT = 80
LATIN_DIRS = ('en', 'ru', 'vi')
PAGE_SIZE_WARN = 140_000

C = {'g': '\033[92m', 'y': '\033[93m', 'r': '\033[91m', 'b': '\033[1m', '0': '\033[0m'}
if not sys.stdout.isatty():
    C = {k: '' for k in C}


def strip_tags(x):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', x)).strip()


def collect():
    """감사 대상 HTML 수집 + 메타 파싱"""
    os.chdir(ROOT)
    pages = []
    for f in sorted(glob.glob('**/*.html', recursive=True)):
        if f.startswith(EXCLUDE_DIRS):
            continue
        s = open(f, encoding='utf-8', errors='ignore').read()
        t = re.search(r'<title>(.*?)</title>', s, re.S)
        d = re.search(r'<meta\s+name="description"\s+content="(.*?)"', s, re.S)
        h = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
        rb = re.search(r'<meta[^>]+name="robots"[^>]+content="([^"]*)"', s)
        au = re.search(r'<meta[^>]+name="author"[^>]+content="([^"]*)"', s)
        cn = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]*)"', s)
        jl = []
        for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
            try:
                jl.append(json.loads(m.group(1)))
            except Exception:
                jl.append('__PARSE_FAIL__')
        imgs = re.findall(r'<img\b[^>]*>', s)
        pages.append({
            'file': f,
            'dir': f.split('/')[0] if '/' in f else 'ROOT',
            'size': os.path.getsize(f),
            'title': strip_tags(t.group(1)) if t else '',
            'desc': strip_tags(d.group(1)) if d else '',
            'h1': strip_tags(h.group(1)) if h else '',
            'robots': rb.group(1) if rb else '',
            'author': au.group(1) if au else '',
            'canonical': cn.group(1) if cn else '',
            'jsonld': jl,
            'imgs': imgs,
        })
    return pages


def jsonld_types(d):
    if isinstance(d, list):
        return [t for x in d for t in jsonld_types(x)]
    if not isinstance(d, dict):
        return []
    if '@graph' in d:
        return [t for x in d['@graph'] for t in jsonld_types(x)]
    t = d.get('@type')
    return t if isinstance(t, list) else ([t] if t else [])


def audit(pages):
    R = {}
    idxable = [p for p in pages if 'noindex' not in p['robots']]
    R['총_HTML'] = len(pages)
    R['색인대상'] = len(idxable)
    R['noindex'] = len(pages) - len(idxable)

    # ⑱ title
    def cut(p):
        return TITLE_CUT_LATIN if p['dir'] in LATIN_DIRS else TITLE_CUT_KO
    R['title_누락'] = [p['file'] for p in idxable if not p['title']]
    R['title_절단초과'] = [(p['file'], len(p['title'])) for p in idxable if len(p['title']) > cut(p)]
    tc = collections.Counter(p['title'] for p in idxable if p['title'])
    R['title_중복'] = [(k, v) for k, v in tc.items() if v > 1]
    # title ↔ H1 정합 — 한글 조사(교착어) 때문에 어절 완전일치는 부정확.
    # 문자 2-gram 자카드 유사도로 측정한다.
    def grams(x):
        x = re.sub(r'[^0-9A-Za-z가-힣ぁ-んァ-ヶ一-龥]', '', x.lower())
        return {x[i:i + 2] for i in range(len(x) - 1)}

    mism = []
    for p in idxable:
        if not p['h1'] or not p['title']:
            continue
        gh, gt = grams(p['h1']), grams(p['title'])
        if not gh:
            continue
        p['h1_overlap'] = round(len(gh & gt) / len(gh), 3)
        if p['h1_overlap'] < 0.30:
            mism.append((p['file'], p['h1_overlap']))
    R['title_H1_불일치'] = mism

    # ③ 키워드 남용 — title 내 동일 2자+ 토큰 3회 이상
    stuff = []
    for p in idxable:
        for w, n in collections.Counter(
                w for w in re.split(r'[\s,·|—\-()]+', p['title']) if len(w) >= 2).items():
            if n >= 3:
                stuff.append((p['file'], w, n))
    R['title_키워드남용'] = stuff

    # description
    R['desc_누락'] = [p['file'] for p in idxable if not p['desc']]
    R['desc_절단초과'] = len([p for p in idxable if len(p['desc']) > DESC_CUT])
    dc = collections.Counter(p['desc'] for p in idxable if p['desc'])
    R['desc_중복'] = [(k[:60], v) for k, v in dc.items() if v > 1]

    # ④ E-E-A-T
    R['author_누락'] = [p['file'] for p in idxable if not p['author']]
    # ⑫ canonical (noindex 페이지는 canonical 불필요 — 상충 신호)
    R['canonical_누락'] = [p['file'] for p in idxable if not p['canonical']]

    # ⑨ 구조화 데이터
    tcount = collections.Counter()
    fail = []
    for p in pages:
        for j in p['jsonld']:
            if j == '__PARSE_FAIL__':
                fail.append(p['file'])
                continue
            for t in jsonld_types(j):
                tcount[t] += 1
    R['jsonld_파싱실패'] = fail
    R['jsonld_타입'] = dict(tcount.most_common(20))
    R['핵심3종'] = {
        'Dentist/LocalBusiness': tcount.get('Dentist', 0) + tcount.get('MedicalClinic', 0),
        'Physician': tcount.get('Physician', 0),
        'FAQPage': tcount.get('FAQPage', 0),
    }

    # ⑯ 이미지 alt
    noalt = 0
    stuffalt = 0
    total = 0
    # 장식/추적용 이미지(1×1 픽셀, display:none)는 alt="" 가 정답 — 집계 제외
    def decorative(tag):
        return (re.search(r'\b(width|height)="1"', tag)
                or 'display:none' in tag.replace(' ', '')
                or 'facebook.com/tr' in tag)

    for p in idxable:
        for tag in p['imgs']:
            if decorative(tag):
                continue
            total += 1
            m = re.search(r'''\salt=(?:"([^"]*)"|'([^']*)')''', tag)
            if not m:
                noalt += 1
                continue
            av = m.group(1) if m.group(1) is not None else m.group(2)
            if not av.strip():
                noalt += 1
            elif len(av) > 125 or max(
                    [0] + list(collections.Counter(
                        w for w in re.split(r'[\s,·|—\-()]+', av) if len(w) >= 2).values())) >= 3:
                stuffalt += 1
    R['img_총'] = total
    R['img_alt누락'] = noalt
    R['img_alt남용'] = stuffalt

    # ⑰ page experience
    R['대용량_140KB+'] = sorted(
        [(p['size'], p['file']) for p in idxable if p['size'] > PAGE_SIZE_WARN], reverse=True)
    # 반복 인라인 style (경량화 여지)
    inline = collections.Counter()
    for p in idxable:
        s = open(p['file'], encoding='utf-8', errors='ignore').read()
        for st in re.findall(r'style="([^"]{25,})"', s):
            inline[st] += 1
    R['인라인style_기회KB'] = round(
        sum(v * (len(k) + 9) for k, v in inline.items() if v >= 20) / 1024, 1)

    # ⑪ robots.txt
    rb = os.path.join(ROOT, 'robots.txt')
    if os.path.exists(rb):
        rt = open(rb, encoding='utf-8').read()
        AI = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'Google-Extended', 'ClaudeBot',
              'anthropic-ai', 'PerplexityBot', 'Applebot-Extended', 'CCBot', 'Bytespider']
        blocked = []
        for bot in AI:
            m = re.search(r'User-agent:\s*' + re.escape(bot) + r'\s*\n((?:(?!User-agent)[^\n]*\n)*)',
                          rt, re.I)
            if m and re.search(r'Disallow:\s*/\s*$', m.group(1), re.M):
                blocked.append(bot)
        R['robots_AI차단'] = blocked
        R['robots_sitemap수'] = len(re.findall(r'^Sitemap:', rt, re.M))
    else:
        R['robots_AI차단'] = ['robots.txt 없음']
        R['robots_sitemap수'] = 0

    # ⑤+⑩ sitemap
    sm = {}
    conflict = []
    canon_set = {p['canonical'].rstrip('/') for p in pages if p['canonical']}
    noidx_urls = {p['canonical'].rstrip('/') for p in pages
                  if p['canonical'] and 'noindex' in p['robots']}
    for f in sorted(glob.glob(os.path.join(ROOT, 'sitemap*.xml'))):
        x = open(f, encoding='utf-8', errors='ignore').read()
        urls = re.findall(r'<loc>(.*?)</loc>', x)
        lm = collections.Counter(re.findall(r'<lastmod>(\d{4}-\d{2}-\d{2})', x))
        sm[os.path.basename(f)] = {'urls': len(urls),
                                   'lastmod_최다': lm.most_common(1)[0] if lm else None}
        for u in urls:
            if u.rstrip('/') in noidx_urls:
                conflict.append(u)
    R['sitemap'] = sm
    R['sitemap_noindex충돌'] = conflict

    return R


def report(R):
    def line(ok, label, val, note=''):
        icon = f"{C['g']}✅{C['0']}" if ok == 1 else (
            f"{C['y']}⚠️{C['0']} " if ok == 0 else f"{C['r']}❌{C['0']}")
        print(f'  {icon} {label:30s} {val}  {note}')

    print(f"\n{C['b']}{'='*78}{C['0']}")
    print(f"{C['b']}  서울비디치과 — 구글 공식문서 기준 자동 감사{C['0']}")
    print(f"{C['b']}{'='*78}{C['0']}")
    print(f"\n  대상 HTML {R['총_HTML']}p  (색인대상 {R['색인대상']}p / noindex {R['noindex']}p)\n")

    print(f"{C['b']}── ⑱ title link ─────────────────────────────────────────{C['0']}")
    line(1 if not R['title_누락'] else 2, 'title 누락', f"{len(R['title_누락'])}p")
    line(1 if not R['title_중복'] else 2, 'title 중복', f"{len(R['title_중복'])}건")
    line(1 if not R['title_절단초과'] else 0, '모바일 절단 초과',
         f"{len(R['title_절단초과'])}p", '(한글 32자 / 라틴 65자)')
    line(1 if not R['title_키워드남용'] else 2, '키워드 남용 (③)', f"{len(R['title_키워드남용'])}건")
    line(1 if len(R['title_H1_불일치']) < R['색인대상'] * 0.2 else 0,
         'title↔H1 불일치', f"{len(R['title_H1_불일치'])}p")

    print(f"\n{C['b']}── description ──────────────────────────────────────────{C['0']}")
    line(1 if not R['desc_누락'] else 2, 'description 누락', f"{len(R['desc_누락'])}p")
    line(1 if not R['desc_중복'] else 2, 'description 중복', f"{len(R['desc_중복'])}건")
    line(0 if R['desc_절단초과'] else 1, '80자 초과(꼬리 비노출)', f"{R['desc_절단초과']}p")

    print(f"\n{C['b']}── ④ E-E-A-T / ⑫ canonical ──────────────────────────────{C['0']}")
    line(1 if not R['author_누락'] else 2, 'author 메타 누락', f"{len(R['author_누락'])}p")
    line(1 if not R['canonical_누락'] else 2, 'canonical 누락', f"{len(R['canonical_누락'])}p")

    print(f"\n{C['b']}── ⑨ 구조화 데이터 (병원 핵심 3종) ──────────────────────{C['0']}")
    line(1 if not R['jsonld_파싱실패'] else 2, 'JSON-LD 파싱실패', f"{len(R['jsonld_파싱실패'])}건")
    for k, v in R['핵심3종'].items():
        line(1 if v > 0 else 2, k, f'{v}개')

    print(f"\n{C['b']}── ⑯ 이미지 alt ─────────────────────────────────────────{C['0']}")
    line(1 if R['img_alt누락'] == 0 else 0, 'alt 누락',
         f"{R['img_alt누락']}/{R['img_총']}개")
    line(1 if R['img_alt남용'] == 0 else 0, 'alt 남용(125자+/반복)', f"{R['img_alt남용']}개")

    print(f"\n{C['b']}── ⑰ page experience (CWV) ──────────────────────────────{C['0']}")
    line(1 if not R['대용량_140KB+'] else 0, '140KB 초과 페이지', f"{len(R['대용량_140KB+'])}p")
    for sz, f in R['대용량_140KB+'][:5]:
        print(f'        {sz/1024:7.1f}KB  {f}')
    line(0 if R['인라인style_기회KB'] > 50 else 1, '인라인 style 경량화 여지',
         f"{R['인라인style_기회KB']}KB")

    print(f"\n{C['b']}── ⑪ robots.txt ─────────────────────────────────────────{C['0']}")
    line(1 if not R['robots_AI차단'] else 2, 'AI 크롤러 차단',
         '없음 (전면 허용)' if not R['robots_AI차단'] else ', '.join(R['robots_AI차단']))
    line(1 if R['robots_sitemap수'] else 2, 'Sitemap 선언', f"{R['robots_sitemap수']}개")

    print(f"\n{C['b']}── ⑤ 색인 가능성 / ⑩ lastmod 정직성 ─────────────────────{C['0']}")
    for k, v in R['sitemap'].items():
        lm = v['lastmod_최다']
        print(f"    {k:28s} {v['urls']:>4} URL   최다 lastmod {lm[0] if lm else '-'}"
              f" ×{lm[1] if lm else 0}")
    line(1 if not R['sitemap_noindex충돌'] else 2, 'sitemap↔noindex 충돌',
         f"{len(R['sitemap_noindex충돌'])}건")

    print(f"\n{C['b']}── 부록 B. 월간 15분 루틴 (사람이 직접 할 항목) ─────────{C['0']}")
    for t in ['GSC 실적 보고서에서 AI 기능 노출·클릭 확인·기록 (⑦)',
              '이번 달 신규 페이지에 원장 실명·경험 단락 삽입 (④)',
              '가장 오래된 시술 페이지 1개 실제 갱신 + lastmod 정직 기록 (⑩)',
              'GBP 빈칸·구버전 정보 점검 + 리뷰에 시술명 포함 답글 (⑧)',
              '순위 변동 컸다면 코어 업데이트 여부 우선 확인 (⑭)']:
        print(f'    ☐  {t}')

    hard = (len(R['title_누락']) + len(R['title_중복']) + len(R['desc_누락'])
            + len(R['desc_중복']) + len(R['jsonld_파싱실패']) + len(R['author_누락'])
            + len(R['canonical_누락']) + len(R['title_키워드남용'])
            + len(R['robots_AI차단']) + len(R['sitemap_noindex충돌']))
    print(f"\n{C['b']}{'='*78}{C['0']}")
    if hard == 0:
        print(f"  {C['g']}치명 이슈 0건 — 구글 공식문서 필수 요건 전부 충족{C['0']}")
    else:
        print(f"  {C['r']}치명 이슈 {hard}건 — 위 ❌ 항목 확인 필요{C['0']}")
    print(f"{C['b']}{'='*78}{C['0']}\n")
    return hard


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', help='결과를 JSON 파일로 저장')
    ap.add_argument('-v', '--verbose', action='store_true', help='위반 파일 목록 전체 출력')
    a = ap.parse_args()

    res = audit(collect())
    hard = report(res)

    if a.verbose:
        for k in ('title_절단초과', 'title_H1_불일치', 'title_키워드남용',
                  'author_누락', 'canonical_누락', 'desc_중복'):
            if res[k]:
                print(f"\n[{k}] {len(res[k])}건")
                for x in res[k][:60]:
                    print('   ', x)
    if a.json:
        json.dump(res, open(a.json, 'w'), ensure_ascii=False, indent=1, default=str)
        print(f'  → {a.json} 저장')
    sys.exit(1 if hard else 0)
