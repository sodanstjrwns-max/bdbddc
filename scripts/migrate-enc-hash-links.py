#!/usr/bin/env python3
"""
백과사전 해시(#) 링크 → 경로 URL 일괄 마이그레이션 (v5.17)
============================================================
문제: /encyclopedia/#용어 링크는 구글이 프래그먼트를 무시 → 838개 용어 페이지가
      본문 내부링크를 전혀 못 받고, 1,163개 링크가 전부 백과 메인으로만 집계됨.

변환 규칙:
  1. 정확 매치      → /encyclopedia/{용어}            (SSR 용어 페이지, 사이트맵 등록됨)
  2. 동의어 매치    → /encyclopedia/{대표어}          (301 홉 없이 바로 대표어로)
  3. 공백무시 매치  → /encyclopedia/{대표어}          (예: '상악동거상술' → '상악동 거상술')
  4. 매치 실패(HTML) → <a> 언랩, 평문 유지            (깨진 목적지 링크 제거)
  5. 매치 실패(JSON) → /encyclopedia/ 메인            (JSON 내 앵커 언랩은 위험 → URL만 교체)

대상: 루트/하위 모든 .html (dist·node_modules 제외) + public/data/encyclopedia.json
      + data/encyclopedia-updates/*.json
"""
import json, os, re, sys, urllib.parse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DRY = '--dry-run' in sys.argv

# ── 용어 인덱스 구축 ──
with open(os.path.join(ROOT, 'public/data/encyclopedia.json'), encoding='utf-8') as f:
    data = json.load(f)

terms = {}          # term → term (정확)
syn_map = {}        # synonym → canonical
nospace_map = {}    # 공백제거 → canonical
for it in data['items']:
    t = it['term']
    terms[t] = t
    nospace_map.setdefault(t.replace(' ', ''), t)
    for s in it.get('synonyms', []):
        syn_map.setdefault(s, t)
        nospace_map.setdefault(s.replace(' ', ''), t)

# 수동 별칭 (사전에 없는 표기 → 대표어) — 고빈도 미해석 용어 구제
ALIAS = {
    '픽스처': '임플란트 픽스처',
    '네비게이션': '네비게이션 임플란트',
    '얼라이너': '투명 교정장치',
    '자가결찰': '셀프 라이게이팅 브라켓',
    '수면진정(세데이션)': '수면 진정',
    'IV 진정': '수면 진정',
    '즉시 로딩 임플란트': '즉시 로딩',
    '발치즉시 임플란트': '즉시 임플란트',
    '임플란트 틀니(오버덴처)': '오버덴처',
    '하이브리드 임플란트(올온4·올온6)': 'All-on-4',
    '플랩리스': '무절개 임플란트',
    '최소침습': '무절개 임플란트',
}
# 별칭 대상이 실제 사전에 존재하는 것만 채택
ALIAS = {k: v for k, v in ALIAS.items() if v in terms}

stats = {'exact': 0, 'syn': 0, 'alias': 0, 'nospace': 0, 'unwrap': 0, 'json_main': 0, 'files': 0}
unresolved = {}

HASH_URL = re.compile(r'/encyclopedia/#([^"\'<>\\]+)')
# enc-inline-link 앵커 전체 (언랩용) — href에 해시가 있는 것만
ANCHOR = re.compile(r'<a\s[^>]*href="/encyclopedia/#[^"]*"[^>]*>(.*?)</a>', re.DOTALL)

def classify(raw):
    t = urllib.parse.unquote(raw).strip()
    if t in terms: return 'exact', t
    if t in syn_map: return 'syn', syn_map[t]
    if t in ALIAS: return 'alias', ALIAS[t]
    ns = t.replace(' ', '')
    if ns in nospace_map: return 'nospace', nospace_map[ns]
    return None, t

def migrate_html(path):
    with open(path, encoding='utf-8') as f:
        html = f.read()
    if '/encyclopedia/#' not in html:
        return 0
    changed = 0

    # 1단계: 해석 가능한 해시 URL → 경로 URL 치환
    def url_sub(m):
        nonlocal changed
        kind, canon = classify(m.group(1))
        if kind:
            stats[kind] += 1
            changed += 1
            return '/encyclopedia/' + urllib.parse.quote(canon)
        return m.group(0)  # 미해석은 2단계에서 언랩
    html = HASH_URL.sub(url_sub, html)

    # 2단계: 남은 해시 앵커는 언랩 (평문 유지)
    def unwrap_sub(m):
        nonlocal changed
        um = HASH_URL.search(m.group(0))
        if um:
            t = urllib.parse.unquote(um.group(1)).strip()
            unresolved[t] = unresolved.get(t, 0) + 1
        stats['unwrap'] += 1
        changed += 1
        return m.group(1)
    html = ANCHOR.sub(unwrap_sub, html)

    if changed and not DRY:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
    return changed

def migrate_json(path):
    with open(path, encoding='utf-8') as f:
        raw = f.read()
    if '/encyclopedia/#' not in raw:
        return 0
    changed = 0
    def url_sub(m):
        nonlocal changed
        # JSON 내 URL은 \" 이스케이프 직전까지만 매치되도록 \\ 제외 문자클래스 사용
        kind, canon = classify(m.group(1))
        changed += 1
        if kind:
            stats[kind] += 1
            return '/encyclopedia/' + urllib.parse.quote(canon)
        stats['json_main'] += 1
        unresolved[urllib.parse.unquote(m.group(1)).strip()] = unresolved.get(urllib.parse.unquote(m.group(1)).strip(), 0) + 1
        return '/encyclopedia/'
    raw = HASH_URL.sub(url_sub, raw)
    if changed:
        json.loads(raw)  # 유효성 검증 (깨지면 예외 → 저장 안 함)
        if not DRY:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(raw)
    return changed

# ── 실행 ──
total = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in ('node_modules', 'dist', '.git', '.wrangler')]
    for fn in filenames:
        p = os.path.join(dirpath, fn)
        rel = os.path.relpath(p, ROOT)
        if fn.endswith('.html'):
            n = migrate_html(p)
        elif fn.endswith('.json') and ('data/encyclopedia' in rel.replace(os.sep, '/')):
            n = migrate_json(p)
        else:
            continue
        if n:
            stats['files'] += 1
            total += n
            print(f'  {rel:60s} {n:4d}건')

print(f"\n{'='*70}")
print(f"  변환 완료: {stats['files']}개 파일, 총 {total}건")
print(f"  정확 매치: {stats['exact']} | 동의어→대표어: {stats['syn']} | 별칭: {stats['alias']} | 공백정규화: {stats['nospace']}")
print(f"  언랩(평문화): {stats['unwrap']} | JSON→메인: {stats['json_main']}")
if unresolved:
    print(f"\n  [미해석 용어 상위 20]")
    for t, n in sorted(unresolved.items(), key=lambda x: -x[1])[:20]:
        print(f"    {t}: {n}건")
if DRY:
    print("\n  DRY RUN — 파일 미변경")
