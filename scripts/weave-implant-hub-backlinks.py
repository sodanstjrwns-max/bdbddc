#!/usr/bin/env python3
"""v6.18 임플란트 허브 역링크 직조 — 스포크 38페이지에 /guide/implant 역링크 배너 삽입.
</main> 직전에 삽입. 이미 href="/guide/implant" 있는 페이지는 스킵. 재실행 안전(id 검사)."""
import glob, os

os.chdir(os.path.join(os.path.dirname(__file__), '..'))

BANNER = '''
  <!-- [v6.18] 임플란트 종합 가이드 허브 역링크 -->
  <section id="implant-hub-backlink" style="max-width:960px;margin:48px auto;padding:0 20px">
    <a href="/guide/implant" style="display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,#f8f5f0,#f1e9dd);border:1px solid #e0d3bf;border-radius:14px;padding:22px 26px;text-decoration:none;color:#1a1917;transition:box-shadow .3s">
      <span style="font-size:1.8rem">&#128214;</span>
      <span style="flex:1">
        <strong style="display:block;font-size:1.05rem;margin-bottom:4px;color:#6B4226">임플란트 종합 가이드 보기</strong>
        <span style="font-size:0.88rem;color:#6b6560">구조·종류·비용·수명·부작용·보험까지 — 임플란트의 모든 것을 한 페이지에 정리했습니다.</span>
      </span>
      <span style="color:#C8A97E;font-size:1.1rem">&#8594;</span>
    </a>
  </section>
'''

targets = []
# 시술 서브페이지 12종 + 픽스처 3종
targets += sorted(glob.glob('treatments/implant-*.html'))
targets += sorted(glob.glob('treatments/fixture-*.html'))
# area 임플란트 지역페이지
targets += sorted(glob.glob('area/*-implant.html'))
# 고아 페이지 2개
targets += ['implant/estimate-check.html', 'pricing/implant-guide.html']

inserted, skipped, missing = [], [], []
for path in targets:
    if not os.path.exists(path):
        missing.append(path); continue
    with open(path, encoding='utf-8') as f:
        html = f.read()
    if 'id="implant-hub-backlink"' in html:
        skipped.append(path + ' (already woven)'); continue
    if 'href="/guide/implant"' in html:
        skipped.append(path + ' (already links hub)'); continue
    if '</main>' not in html:
        missing.append(path + ' (no </main>)'); continue
    html = html.replace('</main>', BANNER + '</main>', 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    inserted.append(path)

print(f"inserted: {len(inserted)}")
for p in inserted: print("  +", p)
print(f"skipped: {len(skipped)}")
for p in skipped: print("  =", p)
if missing:
    print(f"MISSING: {missing}")
