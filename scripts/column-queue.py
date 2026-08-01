#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
컬럼 자동발행 주제 큐 빌더 (A+C 전략)
=====================================
GSC 에서 "노출은 있는데 우리가 제대로 답하지 않은 질문"을 영구 채굴한다.
GSC 는 매달 새 쿼리를 내놓으므로 재고가 마르지 않는다.

기회점수 = 노출 × 미커버도 × CTR갭

■ v2 (2026-08-01) 코퍼스 이원화 — 중요
  v1 은 백과사전을 `encyclopedia/` 디렉토리 워크로 읽으려 했으나 그 디렉토리에는
  index.html 1개뿐이다. 838개 용어는 정적 HTML 이 아니라 동적 라우트
  (src/index.tsx `app.get('/encyclopedia/:term')`)가 런타임에
  `/data/encyclopedia.json` 을 읽어 렌더한다. → 838개가 코퍼스에서 통째로 누락.

  그런데 단순히 같은 코퍼스에 합치면 더 나쁘다(실측):
      사랑니 안 뽑으면 ↔ 백과사전[사랑니]   유사도 0.333
      라미네이트 후회  ↔ 백과사전[라미네이트] 유사도 0.667
      신경치료 비용    ↔ 백과사전[신경치료]   유사도 0.600
  → 커버 임계 0.16 을 전부 넘겨 미커버도 0, 즉 컬럼 큐 상위가 전멸한다.

  백과사전 「사랑니」는 *정의*를 답하고 「사랑니 안 뽑으면」은 *의사결정*을 묻는다.
  둘은 대체재가 아니다. 그래서 코퍼스를 의도별로 분리한다.
      COV_COL : 컬럼 74 + 정적 205  → 컬럼형(의사결정) 쿼리의 커버리지 판정
      COV_ENC : 백과사전 838(용어+동의어/태그/요약) → 용어형 쿼리의 커버리지 판정
  용어형 쿼리는 다시 두 갈래로 나뉜다.
      커버됨(coverage≥0.35)  → 페이지는 있는데 CTR 이 죽은 것. 백과사전 개선 과제.
      미커버(coverage<0.35)  → 백과사전에 없는 용어. 신규 용어 등록 과제.
"""
import json, re, html, os, sys

W = '/home/user/gsc-work'
ROOT = '/home/user/webapp'
BRAND = re.compile(r'비디치과|서울비디|bdbddc|불당|천안.*치과$|치과.*불당|문석준|현정민|박수빈')
STOP = re.compile(r'^(치과|임플란트|교정|라미네이트)$')
ENC_COVERED = 0.35          # 이 이상이면 "백과사전에 이미 있다"고 본다


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


# ── 코퍼스 ①: 컬럼 74 + 정적 페이지 205 (컬럼형 쿼리 판정용) ──
cols = [c for c in json.load(open(f'{W}/columns.clean.json', encoding='utf-8'))
        if c.get('status') == 'published']
COV_COL = []
for c in cols:
    COV_COL.append(('column:' + c['slug'],
                    grams(' '.join(str(c.get(k) or '') for k in ('title', 'metaTitle', 'focusKeyword'))
                          + ' ' + text(c.get('content') or '')[:800])))
# 주의: 'encyclopedia' 는 넣지 않는다 (index.html 1개뿐이고, 코퍼스 ②가 담당)
for d in ('treatments', 'guide', 'guide/regret', 'area', 'pricing', 'doctors'):
    p = os.path.join(ROOT, d)
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
        COV_COL.append((f'{d}/{fn}', grams(blob)))

# ── 코퍼스 ②: 백과사전 838 (용어형 쿼리 판정용) ──
# 동적 라우트가 읽는 실제 소스를 그대로 읽는다. public/ 사본이 최신(2.9MB).
ENC_SRC = next((p for p in (f'{ROOT}/public/data/encyclopedia.json',
                            f'{ROOT}/data/encyclopedia.json') if os.path.isfile(p)), None)
COV_ENC = []
if ENC_SRC:
    ed = json.load(open(ENC_SRC, encoding='utf-8'))
    for it in ed.get('items', []):
        term = (it.get('term') or '').strip()
        if not term:
            continue
        alias = [term] + [str(x) for x in (it.get('synonyms') or [])]
        # ⚠️ 동의어를 한 줄로 이어붙여 grams 하면 경계에 없던 gram 이 생겨
        #    정확 일치가 희석된다(실측: '치아 번호' ↔ enc:치아 번호 = 0.333).
        #    → 별칭은 각각 독립 gram 집합으로 두고 최대값을 취한다.
        tights = [g for g in (grams(a) for a in alias if a) if g]
        widefields = [grams(x) for x in
                      alias + [str(x) for x in (it.get('tags') or [])] + [it.get('short') or '']
                      if x]
        wide = set().union(*widefields) if widefields else set()
        COV_ENC.append(('enc:' + term, tights, wide))
else:
    print('!! encyclopedia.json 을 찾지 못했습니다 — 용어형 판정 불가', file=sys.stderr)


def best_col(g):
    b, who = 0.0, ''
    for name, cg in COV_COL:
        s = jac(g, cg)
        if s > b:
            b, who = s, name
    return b, who


def best_enc(g):
    b, who = 0.0, ''
    for name, tights, wide in COV_ENC:
        s = jac(g, wide)
        for t in tights:
            v = jac(g, t)
            if v > s:
                s = v
        if s > b:
            b, who = s, name
    return b, who


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
    ctr = clicks / imp if imp else 0
    gap = max(0.0, TARGET_CTR - ctr) / TARGET_CTR      # 0~1
    it = intent(q)
    if it == 'column':
        best, who = best_col(g)
        uncov = max(0.0, 1 - best / 0.16)              # 유사도 0.16 이상이면 커버로 간주
        score = imp * uncov * (0.35 + 0.65 * gap)
        task = 'new-column' if best < 0.10 else 'strengthen'
    else:
        # 용어형: 커버리지는 백과사전 코퍼스로 판정한다.
        best, who = best_enc(g)
        uncov = 1.0 if best < ENC_COVERED else 0.0
        # 백과사전은 페이지가 이미 있어도 CTR 이 죽어 있으면 기회다 → uncov 로 죽이지 않는다.
        score = imp * (0.35 + 0.65 * gap) * 0.12       # 컬럼 큐에서는 강하게 후순위
        task = 'new-term' if best < ENC_COVERED else 'enc-ctr-fix'
    rows.append({'intent': it, 'task': task, 'query': q, 'clicks': clicks,
                 'impressions': imp, 'ctr': round(ctr * 100, 2),
                 'coverage': round(best, 3), 'nearest': who, 'score': round(score, 1)})

rows.sort(key=lambda r: -r['score'])
json.dump(rows, open(f'{W}/column-queue.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)

COL = [r for r in rows if r['intent'] == 'column']
ENC = [r for r in rows if r['intent'] == 'encyclopedia']
FRESH = [r for r in COL if r['coverage'] < 0.10]
NEWTERM = [r for r in ENC if r['task'] == 'new-term']
CTRFIX = [r for r in ENC if r['task'] == 'enc-ctr-fix']
print(f'코퍼스: 컬럼형 {len(COV_COL)}개(컬럼74+정적) / 용어형 {len(COV_ENC)}개(백과사전)')
print(f'GSC 쿼리 {len(Q)}개 → 브랜드/저노출 제외 후 {len(rows)}개')
print(f'  의도 분류: 컬럼형 {len(COL)}개 / 용어형 {len(ENC)}개(백과사전 몫)')
print(f'  컬럼형 중 완전 미커버(유사도<0.10): {len(FRESH)}개  ← 신규 컬럼 재고')
print(f'  미회수 노출: {sum(r["impressions"] for r in FRESH):,}회 / 하루 1건이면 {len(FRESH)}일치\n')
print(f'{"순위":>3} {"기회점수":>7} {"노출":>6} {"CTR":>6}  {"커버":>5}  쿼리')
for i, r in enumerate(COL[:20], 1):
    print(f'{i:3d} {r["score"]:7.0f} {r["impressions"]:6d} {r["ctr"]:5.2f}% {r["coverage"]:5.3f}  {r["query"]}')
print(f'\n── 백과사전 A: 페이지 있는데 CTR 붕괴 ({len(CTRFIX)}건, 컬럼 아님) ──')
for r in CTRFIX[:10]:
    print(f'    {r["impressions"]:6d}회 {r["ctr"]:5.2f}% 유사도{r["coverage"]:5.3f}  {r["query"]:14s} ← {r["nearest"][:40]}')
print(f'\n── 백과사전 B: 용어 자체가 없음 → 신규 등록 ({len(NEWTERM)}건) ──')
for r in NEWTERM[:10]:
    print(f'    {r["impressions"]:6d}회 {r["ctr"]:5.2f}% 유사도{r["coverage"]:5.3f}  {r["query"]:14s} ← 최근접 {r["nearest"][:40] or "(없음)"}')
