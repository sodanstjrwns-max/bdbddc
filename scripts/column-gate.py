#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
컬럼 자동발행 품질 게이트 (v1)  — 2026-08-01
=============================================
기존 74개 컬럼의 실측 분포에서 문턱을 역산했다. 통과하지 못하면 발행하지 않는다.

  실측 분포 (published 74건)
    본문 글자수  min 1071 / p10 3465 / 중위 4343 / p90 5158 / max 6015
    H3          min 0 / p10 7 / 중위 7 / p90 9 / max 11
    표           p10 1 / 중위 1 / max 3
    목록항목      p10 8 / 중위 12 / p90 21
    DOI         p10 1 / 중위 2 / max 3
    DOI 실재율    93/94 = 98.9%  (404 1건: 10.4317/medoral.23371 — 2개 컬럼에 인용됨)

  ⚠️ 단순 금칙어 매칭은 쓰지 않는다.
     '영구/100%/최고/1위/유일한' 를 단어로 막으면 기존 우수 컬럼이 전부 탈락한다.
     실제 용례는 전부 정당했다:
       "영구적 마비 위험 1%"(위험 고지) / "생존율 81.8~100%"(통계)
       "100% 회복은 아니지만"(효과 부정) / "통증 최고조"(경과)
       "입냄새 원인 1위는 혀백태"(원인 순위) / "조기 발견하는 유일한 방법은 정기 점검"(권고)
     → 금칙은 '주체 + 효과보장' 이 결합된 패턴으로만 판정한다.

사용:
  python3 scripts/column-gate.py draft.json          # 단일 초안 검사
  python3 scripts/column-gate.py --corpus            # 기존 74건 자체 회귀검사
종료코드 0=발행가능, 1=차단
"""
import json, re, sys, html, os, subprocess

# ── 문턱 (p10 기준 = 기존 컬럼 하위 10%도 통과하는 선) ────────
MIN_LEN, MAX_LEN = 2800, 7000
MIN_H3, MIN_TABLE, MIN_LI, MIN_DOI = 5, 1, 6, 1
MAX_REPEAT_RATIO = 0.06          # 동일 문장 반복 허용 상한
MIN_TITLE, MAX_TITLE = 10, 60
MIN_DESC, MAX_DESC = 60, 160

# 의료법 §56 — 효과 보장 / 최상급 / 치료경험담 유인 패턴 (문맥 결합형)
# 부정/반박 문맥 — 이게 붙으면 위반이 아니라 '주장을 부정하는 서술'이다.
# 실측: 기존 컬럼의 의료법 탐지 5건이 전부 부정문이었다.
#   "평생 보장"은 데이터 기반 표현이 아닙니다 / 한 번 하면 평생 유지되는 시술이 아닙니다
#   가능하면 평생 유지하는 것을 권합니다(유지장치) / 자연치아를 평생 사용(치아 보존 목적)
NEGATION = (r'아닙니다|아니고|아니라|않습니다|않으셔도|않아도|않으실|느끼지 않|근거가 부족|표현이 아니|'
            r'보장(?:할|되지)\s*(?:수\s*)?없|불가능|장담할 수 없|케이스마다|편차|'
            r'권하는 경우가 많|권합니다|권장|목적입니다|것이 목표')
CLINICAL_OK = r'자연치|본인 치아|내 치아|유지장치|리테이너|금연|치아를'

LAW_PATTERNS = [
    (r'(영구(?:적)?(?:으로)?|평생)\s*(?:유지|보장|지속|사용|씁니|쓸 수)', '효과 영구 보장'),
    (r'100\s*%\s*(?:성공|완치|보장|안전|만족)', '100% 보장'),
    (r'(?:부작용|합병증)\s*(?:이|은|가)?\s*(?:전혀\s*)?없습니다', '부작용 없음 단정'),
    (r'(?:절대|무조건)\s*(?:안전|성공|괜찮)', '절대 안전'),
    (r'(?:지역|천안|충남|국내)\s*(?:최고|최상|1위|넘버원|no\.?\s*1)', '최상급 표현'),
    (r'(?:저희|본원|우리 병원)(?:가|는|이)?\s*(?:유일|최초|최고|1위)', '자기 최상급'),
    (r'(?:완치|완전히 낫|재발 없)', '완치 단정'),
    (r'(?:환자|고객)\s*(?:분)?(?:께서|이|가)\s*(?:후기|경험담|간증)', '치료경험담 광고'),
    (r'(?:연예인|셀럽|아이돌|배우)\s*(?:도|이|가)?\s*(?:내원|시술|선택)', '연예인 유인'),
    (r'(?:이벤트|할인|무료)\s*(?:진료|시술|임플란트)', '가격 유인'),
]
# 프롬프트 지시문 누출 (v5.49에서 348건 세탁한 계열의 재발 감시)
LEAK_PATTERNS = [
    # ⚠️ 'r여기서 …드리겠습니다\.' 같은 광역 패턴은 쓰지 않는다.
    #    「여기서 걱정 하나는 덜어드리겠습니다.」 는 자연스러운 한국어 전환문인데
    #    광역 패턴이 19건을 오탐했다. 지시문 고유 어구만 좁게 잡는다.
    r'먼저 이 글에서 [^.]{0,20}가져가셨으면',
    r'가져가셨으면 하는 것[은을]',
    r'인용 가능한 한 줄',
    r'통념 하나를 부드럽게',
    r'데이터로 답을 드리겠습니다\.',
    r'한 달에 (?:세|네|다섯|여섯|일곱) 분 넘게',
    r'환자분 통념 하나',
    r'여기서 한 가지 안심시켜 드리고 싶습니다\.',
    r'(?:다음|아래)(?:과|와) 같은 (?:형식|구조)로',
    r'\[(?:여기에|삽입|TODO|TBD)',
    r'(?:as an AI|I cannot|죄송하지만 저는)',
]


def text(s):
    s = re.sub(r'<(script|style)[\s\S]*?</\1>', ' ', s or '', flags=re.I)
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', ' ', s))).strip()


def check_dois(body, online=True):
    """DOI 실재 검증 — 할루시네이션 차단의 핵심. doi.org 302 = 실재."""
    dois = sorted(set(re.sub(r'[.,;]+$', '', d)
                      for d in re.findall(r'10\.\d{4,9}/[^\s"<>)\]]+', body)))
    if not online:
        return dois, []
    dead = []
    for d in dois:
        try:
            r = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
                                '--max-time', '12', '-A', 'Mozilla/5.0',
                                f'https://doi.org/{d}'], capture_output=True, text=True, timeout=20)
            if r.stdout.strip() not in ('302', '301', '200'):
                dead.append((d, r.stdout.strip()))
        except Exception as e:
            dead.append((d, f'ERR {e}'))
    return dois, dead


def gate(col, online=True, corpus=None):
    """returns (ok, blocks, warns)"""
    B, W = [], []
    body = col.get('content') or ''
    x = text(body)
    title = (col.get('title') or '').strip()
    mt = (col.get('metaTitle') or '').strip()
    desc = (col.get('metaDescription') or '').strip()

    # ① 구조
    if not (MIN_LEN <= len(x) <= MAX_LEN):
        B.append(f'본문 {len(x)}자 (허용 {MIN_LEN}~{MAX_LEN})')
    h3 = len(re.findall(r'<h3', body))
    if h3 < MIN_H3:
        B.append(f'H3 {h3}개 (최소 {MIN_H3})')
    if len(re.findall(r'<h1', body)):
        B.append('본문에 h1 존재 (h1은 렌더러가 생성)')
    tb = len(re.findall(r'<table', body))
    if tb < MIN_TABLE:
        B.append(f'표 {tb}개 (최소 {MIN_TABLE})')
    li = len(re.findall(r'<li', body))
    if li < MIN_LI:
        B.append(f'목록항목 {li}개 (최소 {MIN_LI})')

    # ② 근거 — DOI 실재 검증
    dois, dead = check_dois(body, online)
    if len(dois) < MIN_DOI:
        B.append(f'DOI {len(dois)}개 (최소 {MIN_DOI})')
    for d, code in dead:
        B.append(f'DOI 미실재 {d} → HTTP {code}')

    # ③ 의료법 §56
    for pat, label in LAW_PATTERNS:
        for m in re.finditer(pat, x):
            before = x[max(0, m.start() - 45):m.start()]
            after = x[m.end():m.end() + 45]
            if re.search(NEGATION, after) or re.search(NEGATION, before):
                continue                      # 주장을 부정하는 서술
            if re.search(CLINICAL_OK, before):
                continue                      # 자연치 보존·유지장치 착용 등 정당 용례
            B.append(f'의료법 위험({label}): …{x[max(0,m.start()-25):m.end()+25]}…')
            break

    # ④ 프롬프트 누출
    for pat in LEAK_PATTERNS:
        m = re.search(pat, x)
        if m:
            B.append(f'프롬프트 누출: 「{m.group(0)[:40]}」')

    # ⑤ 이스케이프 안전성 (v5.49 파싱 실패 6건의 재발 방지)
    # title 큰따옴표는 v5.49 attrEsc/jEsc 로 안전해졌고 통념 인용("…"는 말)은
    # CTR 에 유효한 수사다 → 경고로만. metaDescription 은 노출 지점이 많아 차단 유지.
    for fld, v in (('title', title), ('metaTitle', mt)):
        if '"' in v:
            W.append(f'{fld} 에 큰따옴표 — 렌더러는 이스케이프됨, 「」 권장: {v[:40]}')
    if '"' in desc:
        B.append(f'metaDescription 에 원따옴표 → 속성/JSON-LD 조기종료 위험: {desc[:40]}')
    if re.search(r'</?(script|iframe|object|embed)\b', body, re.I):
        B.append('본문에 script/iframe 태그')

    # ⑥ 메타
    if not (MIN_TITLE <= len(title) <= MAX_TITLE):
        B.append(f'title {len(title)}자')
    if mt and len(mt) > 34:
        W.append(f'metaTitle {len(mt)}자 — SERP 32자 절단 (CJK)')
    if not (MIN_DESC <= len(desc) <= MAX_DESC):
        B.append(f'metaDescription {len(desc)}자 (허용 {MIN_DESC}~{MAX_DESC})')
    if not re.match(r'^[a-z0-9-]{8,90}$', col.get('slug') or ''):
        B.append(f'slug 형식 위반: {col.get("slug")}')

    # ⑦ 내부 반복 (같은 문장 재사용)
    sents = [s.strip() for s in re.split(r'(?<=[.?!])\s+', x) if len(s.strip()) > 18]
    if sents:
        from collections import Counter
        c = Counter(sents).most_common(1)[0]
        if c[1] > 1 and c[1] / len(sents) > MAX_REPEAT_RATIO:
            B.append(f'동일 문장 {c[1]}회 반복: 「{c[0][:40]}」')

    # ⑧ 기존 코퍼스와의 중복 (표절/자기복제)
    if corpus:
        def grams(s):
            s2 = re.sub(r'[^가-힣0-9a-z]', '', s.lower())
            return set(s2[i:i + 12] for i in range(0, max(0, len(s2) - 11), 4))
        mine = grams(x)
        for other in corpus:
            if other.get('slug') == col.get('slug'):
                continue
            og = grams(text(other.get('content') or ''))
            if not og or not mine:
                continue
            ov = len(mine & og) / len(mine)
            if ov > 0.28:
                B.append(f'기존 컬럼과 {ov:.0%} 중복: {other.get("slug")}')
                break
        if any(o.get('slug') == col.get('slug') for o in corpus):
            B.append(f'slug 중복: {col.get("slug")}')

    return (len(B) == 0), B, W


def main():
    if '--corpus' in sys.argv:
        # 기존 74건 자체 회귀검사 — 게이트가 우수 컬럼을 오탈락시키지 않는지 확인
        p = '/home/user/gsc-work/columns.clean.json'
        C = [c for c in json.load(open(p, encoding='utf-8')) if c.get('status') == 'published']
        online = '--online' in sys.argv
        nb = 0
        agg = {}
        for c in C:
            ok, B, W = gate(c, online=online, corpus=None)
            if not ok:
                nb += 1
                for b in B:
                    key = b.split(':')[0].split('(')[0].strip()
                    key = re.sub(r'\d+', 'N', key)
                    agg[key] = agg.get(key, 0) + 1
        print(f'기존 {len(C)}건 중 게이트 탈락 {nb}건 ({nb/len(C):.0%})')
        for k, v in sorted(agg.items(), key=lambda z: -z[1]):
            print(f'  {v:3d}× {k}')
        return 0

    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    col = json.load(open(sys.argv[1], encoding='utf-8'))
    if isinstance(col, list):
        col = col[0]
    corpus = None
    cp = '/home/user/gsc-work/columns.clean.json'
    if os.path.exists(cp):
        corpus = json.load(open(cp, encoding='utf-8'))
    ok, B, W = gate(col, online='--offline' not in sys.argv, corpus=corpus)
    print(f"── 게이트: {col.get('slug')} ──")
    for b in B:
        print(f'  ❌ {b}')
    for w in W:
        print(f'  ⚠️  {w}')
    print('  ✅ 통과 — 발행 가능' if ok else f'  🚫 차단 {len(B)}건 — 발행 불가')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
