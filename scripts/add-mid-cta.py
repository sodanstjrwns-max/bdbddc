#!/usr/bin/env python3
"""
v5.18d: 진료 페이지 중간 예약 CTA 밴드 삽입 (Clarity 스크롤 데이터 기반, 컨설턴트 제안)

배경:
- Clarity 확인 결과 비포애프터·예약 CTA가 페이지 최하단에 있어 도달률이 매우 낮음
- 중간(3번째 섹션 뒤, 약 30~40% 스크롤 지점)에 예약 CTA 밴드를 삽입
- treatment-cases.js가 이 밴드(#mid-cta) 바로 앞에 Before/After 섹션을 삽입하도록 연동

대상: treatments/*.html (index.html 제외)
"""
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MID_CTA = '''
    <!-- v5.18d: 중간 예약 CTA (Clarity 스크롤 데이터 기반 — 하단 CTA 도달률 개선) -->
    <section class="mid-cta-band" id="mid-cta" style="padding:36px 0;background:linear-gradient(135deg,#6B4226,#8B5E3C);">
      <div class="container" style="max-width:900px;margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <p style="font-size:1.15rem;font-weight:800;color:#fff;margin:0 0 4px;">읽어보시고 고민되신다면, 편하게 물어보세요</p>
          <p style="font-size:0.88rem;color:rgba(255,255,255,.85);margin:0;">서울대 출신 전문의가 과잉진료 없이 딱 필요한 것만 말씀드립니다</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <a href="/reservation" style="display:inline-flex;align-items:center;gap:8px;padding:12px 26px;background:#fff;color:#6B4226;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem;box-shadow:0 4px 14px rgba(0,0,0,.15);"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>
          <a href="tel:041-415-2892" style="display:inline-flex;align-items:center;gap:8px;padding:12px 22px;background:rgba(255,255,255,.15);color:#fff;border:1.5px solid rgba(255,255,255,.4);border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;"><i class="fas fa-phone"></i> 전화 문의</a>
        </div>
      </div>
    </section>
'''

def insert_mid_cta(html: str) -> str:
    if 'id="mid-cta"' in html:
        return html  # 이미 있음 (멱등)
    # </section> 위치들 수집
    positions = []
    idx = 0
    while True:
        idx = html.find('</section>', idx)
        if idx == -1:
            break
        positions.append(idx + len('</section>'))
        idx += len('</section>')
    if len(positions) < 3:
        return html  # 섹션이 너무 적으면 건너뜀
    # 3번째 </section> 뒤에 삽입 (히어로 + 콘텐츠 2개 뒤 ≈ 30~40% 지점)
    # 단, 마지막 섹션(하단 CTA) 앞이어야 함 → 섹션이 4개 미만이면 2번째 뒤
    n = 2 if len(positions) >= 4 else 1
    pos = positions[n]
    return html[:pos] + '\n' + MID_CTA + html[pos:]

def main():
    targets = sorted(glob.glob(os.path.join(ROOT, 'treatments', '*.html')))
    changed = 0
    for path in targets:
        if os.path.basename(path) == 'index.html':
            continue
        with open(path, encoding='utf-8') as f:
            html = f.read()
        new_html = insert_mid_cta(html)
        # treatment-cases.js 캐시 버전 갱신
        new_html = new_html.replace('treatment-cases.js?v=20260416v1', 'treatment-cases.js?v=20260711')
        if new_html != html:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_html)
            changed += 1
            print(f'  {os.path.relpath(path, ROOT)}')
    print(f'\n✅ 완료: {changed}개 파일에 중간 CTA 삽입')

if __name__ == '__main__':
    main()
