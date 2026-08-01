#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
컬럼 자동발행 주제 큐 빌더 (A+C 전략)
=====================================
GSC 에서 "노출은 있는데 우리가 제대로 답하지 않은 질문"을 영구 채굴한다.
GSC 는 매달 새 쿼리를 내놓으므로 재고가 마르지 않는다.

기회점수 = 노출 × 미커버도 × CTR갭
  미커버도 : 기존 74개 컬럼 + 205개 정적페이지 제목과의 최대 유사도의 역수
  CTR갭   : 목표 CTR(3.19%, 현재 /column/ 실적) 대비 부족분
"""
import json, re, html, os, sys

W = '/home/user/gsc-work'
BRAND = re.compile(r'비디치과|서울비디|bdbddc|불당|천안.*치과$|치과.*불당')
STOP = re.compile(r'^(치과|임플란트|교정|라미네이트)$')


def grams(s, n=2):
    s = re.sub(r'[^가-힣0-9a-z]', '', (s or '').lower())
    return set(s[i:i + n] for i in range(max(0, len(s) - n + 1)))


def jac(a, b):
    if not a or not b:
        return 0.0
    i = len(a & b)
    return i / (len(a) + len(b) - i)


def text(s):
    s = re.sub(r'<(script|style)[\s\S]*?</\1>', ' ', s or '', flags=re.I)
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', ' ', s))).strip()


# ── 커버리지 코퍼스: 컬럼 74 + 정적 페이지 제목 ──
cols = [c for c in json.load(open(f'{W}/columns.clean.json', encoding='utf-8'))
        if c.get('status') == 'published']
cov = []
for c in cols:
    cov.append(('column:' + c['slug'],
                grams(' '.join(str(c.get(k) or '') for k in ('title', 'metaTitle', 'focusKeyword'))
                      + ' ' + text(c.get('content') or '')[:800])))
for d in ('treatments', 'guide', 'guide/regret', 'area', 'pricing', 'doctors', 'encyclopedia'):
    p = os.path.join('/home/user/webapp', d)
    if not os.path.isdir(p):
        continue
    for fn in sorted(os.listdir(p)):
        if not fn.endswith('.html'):
            continue
        s = open(os.path.join(p, fn), encoding='utf-8').read()
        t = re.search(r'<title>(.*?)</title>', s, re.S)
        h = re.search(r'<h1[^>]*>([\s\S]*?)</h1>', s)
        k = re.search(r'<meta\s+name="keywords"\s+content="([^"]*)"', s)
        blob = ' '.join(filter(None, [
            text(t.group(1)) if t else '',
            text(h.group(1)) if h else '',
            k.group(1) if k else '']))
        cov.append((f'{d}/{fn}', grams(blob)))

# ── GSC 쿼리 ──
Q = []
for line in open(f'{W}/queries.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) < 3:
        continue
    try:
        Q.append((p[0].strip(), int(p[1]), int(p[2])))
    except ValueError:
        continue

TARGET_CTR = 0.0319
# 검색 의도 분류 — 컬럼이 답할 질문과 백과사전이 답할 용어를 분리한다.
# 용어형(법랑질/소구치/치조골)에 컬럼을 쓰면 백과사전과 자기잠식만 일어난다.
DECISION = re.compile(r'(안|않|말|해도|하면|되나|될까|일까|까요|나요|는지|얼마|가격|비용|기간|'
                      r'며칠|몇|후회|추천|비교|차이|vs|보다|어디|언제|왜|어떻게|방법|순서|'
                      r'통증|아파|아플|붓|부작용|실패|재수술|주의|관리|음식|먹|양치|보험|'
                      r'실비|후|전|중|당일|회복|기다|참|괜찮|위험|장점|단점|종류|선택)')
TERM = re.compile(r'^[가-힣a-z0-9]{2,6}$')          # 단일 용어
def intent(q):
    if DECISION.search(q): return 'column'
    if TERM.match(q.replace(' ', '')): return 'encyclopedia'
    return 'column' if len(q.split()) >= 2 else 'encyclopedia'
rows = []
for q, clicks, imp in Q:
    if BRAND.search(q) or STOP.match(q) or imp < 20:
        continue
    g = grams(q)
    best, who = 0.0, ''
    for name, cg in cov:
        s = jac(g, cg)
        if s > best:
            best, who = s, name
    ctr = clicks / imp if imp else 0
    gap = max(0.0, TARGET_CTR - ctr) / TARGET_CTR      # 0~1
    uncov = max(0.0, 1 - best / 0.16)                  # 유사도 0.16 이상이면 커버로 간주
    score = imp * uncov * (0.35 + 0.65 * gap)
    it = intent(q)
    if it != 'column':
        score *= 0.12          # 용어형은 컬럼 큐에서 강하게 후순위 (백과사전 CTR 개선 대상)
    rows.append({'intent': it, 'query': q, 'clicks': clicks, 'impressions': imp,
                 'ctr': round(ctr * 100, 2), 'coverage': round(best, 3),
                 'nearest': who, 'score': round(score, 1)})

rows.sort(key=lambda r: -r['score'])
json.dump(rows, open(f'{W}/column-queue.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)

COL = [r for r in rows if r['intent'] == 'column']
ENC = [r for r in rows if r['intent'] == 'encyclopedia']
FRESH = [r for r in COL if r['coverage'] < 0.10]
print(f'GSC 쿼리 {len(Q)}개 → 브랜드/저노출 제외 후 {len(rows)}개')
print(f'  의도 분류: 컬럼형 {len(COL)}개 / 용어형 {len(ENC)}개(백과사전 몫)')
print(f'  컬럼형 중 완전 미커버(유사도<0.10): {len(FRESH)}개  ← 신규 컬럼 재고')
print(f'  미회수 노출: {sum(r["impressions"] for r in FRESH):,}회 / 하루 1건이면 {len(FRESH)}일치\n')
print(f'{"순위":>3} {"기회점수":>7} {"노출":>6} {"CTR":>6}  {"커버":>5}  쿼리')
for i, r in enumerate([x for x in rows if x['intent'] == 'column'][:20], 1):
    print(f'{i:3d} {r["score"]:7.0f} {r["impressions"]:6d} {r["ctr"]:5.2f}% {r["coverage"]:5.3f}  {r["query"]}')
print('\n── 백과사전 CTR 개선 대상 (컬럼 아님) ──')
for r in ENC[:8]:
    print(f'    {r["impressions"]:6d}회 {r["ctr"]:5.2f}%  {r["query"]:14s} ← {r["nearest"][:44]}')
