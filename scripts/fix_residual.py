#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
v5.49b 잔여 수정 — column-gate.py 회귀검사가 잡아낸 3종
  ① 프롬프트 누출 잔존 19건 (세/네/여섯 분 넘게, 가져가셨으면 하는 것은, 통념 하나를 부드럽게)
  ② 깨진 DOI 10.4317/medoral.23371 (404) → 실재 검증된 Cochrane 리뷰로 교체
  ③ metaDescription 160자 초과 16건 + 원따옴표 5건
"""
import json, re, html, datetime, collections

SRC = '/home/user/gsc-work/columns.clean.json'
C = json.load(open(SRC, encoding='utf-8'))
NOW = datetime.datetime.utcnow().isoformat() + 'Z'
stat = collections.Counter()
touched = set()


def rep(body, pat, variants, key, ctr):
    def f(m):
        v = variants[ctr[key] % len(variants)]
        ctr[key] += 1
        stat[key] += 1
        return v
    return re.sub(pat, f, body)


# ① 누출 잔존 — 회전 치환
ctr = collections.Counter()
LEAKS = [
    # '한 달에 세/네/여섯 분 넘게' — 검증 불가한 빈도 주장 + 지시문 톤
    (r'(?:저희 )?(?:진료실에서 )?한 달에 (?:세|네|다섯|여섯|일곱) 분 넘게 ',
     ['진료실에서 자주 ', '상담 중에 어렵지 않게 ', '저희 진료실에서 드물지 않게 ',
      '진료 현장에서 흔히 ', '저희가 진료실에서 자주 '], 'freq'),
    # '가져가셨으면 하는 것은/을' — 프롬프트 지시문 어투
    (r'가져가셨으면 하는 것[은을]',
     ['꼭 기억하실 점은', '먼저 정리해 드릴 것은', '결론부터 말씀드리면 핵심은',
      '이 글의 요지는', '먼저 짚어둘 것은'], 'take'),
    # '통념 하나를 부드럽게' — 프롬프트 지시문
    (r'통념 하나를 부드럽게 ?(?:반박하겠습니다|짚겠습니다)?',
     ['자주 듣는 오해를 하나 짚겠습니다', '흔한 오해를 바로잡겠습니다',
      '많이들 그렇게 알고 계신데 사실은 다릅니다', '여기서 오해 하나를 정리하겠습니다',
      '이 부분은 알려진 것과 다릅니다'], 'myth'),
]
for c in C:
    b = c.get('content') or ''
    o = b
    for pat, var, key in LEAKS:
        b = rep(b, pat, var, key, ctr)
    if b != o:
        c['content'] = b
        touched.add(c['slug'])

# ② 깨진 DOI → 실재 Cochrane 리뷰 (Crossref 검증: Ghaeminia H et al., 2016,
#    "Surgical removal versus retention for the management of asymptomatic
#     disease-free impacted wisdom teeth", Cochrane Database of Systematic Reviews)
OLD_DOI = '10.4317/medoral.23371'
for c in C:
    b = c.get('content') or ''
    if OLD_DOI not in b:
        continue
    o = b
    # 저자·연도·저널·DOI 를 한 묶음으로 교체 (DOI만 바꾸면 인용 정보가 어긋난다)
    b = re.sub(r'(?:García|Garcia|arcía|arcia)-?(?:García|Garcia)?\s*AS\s*et\s*al\.,?\s*2019',
               'Ghaeminia H et al., 2016', b)
    b = re.sub(r'<em>\s*Medicina Oral Patología Oral y Cirugía Bucal\s*</em>',
               '<em>Cochrane Database of Systematic Reviews</em>', b)
    b = b.replace('Medicina Oral Patología Oral y Cirugía Bucal',
                  'Cochrane Database of Systematic Reviews')
    b = b.replace(OLD_DOI, '10.1002/14651858.CD003879.pub4')
    if b != o:
        c['content'] = b
        touched.add(c['slug'])
        stat['doi_fix'] += 1

# ③ metaDescription — 원따옴표 제거 + 160자 이내로 문장 경계 절단
for c in C:
    d = (c.get('metaDescription') or '').strip()
    if not d:
        continue
    o = d
    if '"' in d:
        d = d.replace('"', '')          # 홑따옴표조차 남기지 않음 (속성/JSON-LD 안전)
        stat['desc_quote'] += 1
    d = re.sub(r'\s+', ' ', d).strip()
    if len(d) > 160:
        cut = d[:160]
        # 문장 경계 우선, 없으면 어절 경계
        m = max(cut.rfind('. '), cut.rfind('다.'), cut.rfind('요.'), cut.rfind('! '), cut.rfind('? '))
        if m > 90:
            d = cut[:m + 1].strip()
        else:
            sp = cut.rfind(' ')
            d = (cut[:sp] if sp > 100 else cut).strip().rstrip(',·-') + '.'
        stat['desc_trim'] += 1
    if d != o:
        c['metaDescription'] = d
        touched.add(c['slug'])

# updatedAt 갱신 (sitemap lastmod → 재크롤 유도)
for c in C:
    if c['slug'] in touched:
        c['updatedAt'] = NOW

json.dump(C, open(SRC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

print('── v5.49b 잔여 수정 ──')
for k, v in stat.most_common():
    print(f'  {k:12s} {v}건')
print(f'  수정 컬럼      {len(touched)}개 / 전체 {len(C)}개')

# 자체 검증
def t(s):
    s = re.sub(r'<(script|style)[\s\S]*?</\1>', ' ', s or '', flags=re.I)
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', ' ', s))).strip()

resid = collections.Counter()
for c in C:
    x = t(c.get('content') or '')
    for p in [r'한 달에 (?:세|네|다섯|여섯) 분 넘게', r'가져가셨으면 하는 것[은을]',
              r'통념 하나를 부드럽게', r'인용 가능한 한 줄', r'데이터로 답을 드리겠습니다\.']:
        resid[p] += len(re.findall(p, x))
    if OLD_DOI in (c.get('content') or ''):
        resid['깨진DOI'] += 1
print('  잔존 검사:', {k: v for k, v in resid.items() if v} or '전건 제거 ✅')
dl = [len(c.get('metaDescription') or '') for c in C]
q = sum(1 for c in C if '"' in (c.get('metaDescription') or ''))
print(f'  desc 길이 min {min(dl)} 중위 {sorted(dl)[len(dl)//2]} max {max(dl)} / 원따옴표 {q}건')
