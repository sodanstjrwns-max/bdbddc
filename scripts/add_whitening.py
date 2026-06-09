#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
전 지역(area) 페이지에 '치아미백 할인' 키워드 + 본문 섹션 추가
- 가격: 소프트 블리칭 4.9만원 / 하드 블리칭 8만원 (부가세 별도)
- 대상: area/*.html 88개
"""
import os
import re
import glob

AREA_DIR = os.path.join(os.path.dirname(__file__), "..", "area")
AREA_DIR = os.path.abspath(AREA_DIR)

WHITENING_LINK = "../treatments/whitening.html"


def get_region(html):
    """title 첫 토큰에서 지역 한글명 추출"""
    m = re.search(r"<title>\s*([^\s|—<]+)", html)
    if m:
        return m.group(1).strip()
    return None


def update_title(html, region):
    """title에 '{지역} 치아미백' 키워드가 없으면 추가"""
    def repl(m):
        inner = m.group(1)
        if "치아미백" in inner:
            return m.group(0)
        # '— 서울비디치과' 앞에 끼워넣기, 없으면 맨 끝 서울비디치과 앞
        kw = f" · {region} 치아미백"
        if "—" in inner:
            parts = inner.rsplit("—", 1)
            new = parts[0].rstrip() + kw + " —" + parts[1]
        elif "|" in inner:
            new = inner.rstrip() + kw
        else:
            new = inner.rstrip() + kw
        return f"<title>{new}</title>"
    return re.sub(r"<title>(.*?)</title>", repl, html, count=1, flags=re.S)


def update_description(html, region):
    """description 끝부분에 미백 할인 문구 추가"""
    def repl(m):
        content = m.group(1)
        if "치아미백" in content:
            return m.group(0)
        add = f" {region} 치아미백 할인 — 소프트 블리칭 4.9만원·하드 블리칭 8만원(부가세 별도)."
        # 전화번호 앞에 끼워넣기
        if "☎" in content:
            idx = content.rfind("☎")
            new = content[:idx].rstrip() + add + " " + content[idx:]
        else:
            new = content.rstrip() + add
        return f'<meta name="description" content="{new}"'
    return re.sub(r'<meta name="description" content="([^"]*)"', repl, html, count=1)


def update_keywords(html, region):
    """keywords에 '{지역} 치아미백, {지역} 치아미백 할인' 추가"""
    def repl(m):
        content = m.group(1)
        if "치아미백" in content:
            return m.group(0)
        add = f", {region} 치아미백, {region} 치아미백 할인, {region} 미백 가격"
        new = content.rstrip().rstrip(",") + add
        return f'<meta name="keywords" content="{new}"'
    return re.sub(r'<meta name="keywords" content="([^"]*)"', repl, html, count=1)


def whitening_card(region):
    """treatment-grid에 넣을 치아미백 카드"""
    return f'''        <a href="{WHITENING_LINK}" class="treatment-card reveal delay-2">
          <span class="treatment-card-arrow"><i class="fas fa-arrow-right"></i></span>
          <div class="treatment-card-icon"><i class="fas fa-star"></i></div>
          <h3>{region} 치아미백</h3>
          <p>소프트 블리칭 4.9만원 · 하드 블리칭 8만원<br>전문 치과위생사 직접 시술 · 30분</p>
          <span class="treatment-tag hot">할인중</span>
        </a>
'''


def insert_whitening_card(html, region):
    """treatment-grid 첫 카드 앞에 미백 카드 삽입 (그리드 있을 때만)"""
    if 'treatment-grid' not in html:
        return html, False
    if f'{region} 치아미백</h3>' in html:
        return html, False
    card = whitening_card(region)
    # treatment-grid div 시작 직후에 삽입
    pattern = re.compile(r'(<div class="treatment-grid">\s*)')
    if pattern.search(html):
        html = pattern.sub(lambda m: m.group(1) + "\n" + card, html, count=1)
        return html, True
    return html, False


def whitening_section(region):
    """CTA 앞에 넣을 치아미백 할인 강조 섹션"""
    return f'''  <section class="why-section section" id="whitening-promo" aria-label="{region} 치아미백 할인" style="background:linear-gradient(135deg,#ecfdf5 0%,#f0fdfa 100%);">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge" style="background:#10b981;color:#fff;"><i class="fas fa-star"></i> {region} 치아미백 할인중</span>
        <h2 class="section-title">{region}에서 부담 없이 받는 <span class="text-gradient">치아미백</span></h2>
        <p class="section-subtitle">"5만원도 안 하니 한 번 받아봤어요" — {region} 환자분들이 가장 많이 하시는 말씀입니다. 서울대 출신 원장 진단 후 전문 치과위생사가 직접 시술하는 안전한 치아미백을, {region} 어디서든 부담 없는 가격에 받으실 수 있습니다.</p>
      </div>
      <div class="treatment-grid" style="max-width:760px;margin:0 auto;">
        <div class="treatment-card reveal delay-1" style="text-align:center;">
          <div class="treatment-card-icon"><i class="fas fa-tooth"></i></div>
          <h3>소프트 블리칭</h3>
          <p style="font-size:1.8rem;font-weight:800;color:#059669;margin:8px 0;">4.9만원<span style="font-size:0.8rem;font-weight:500;color:#64748b;"> /부가세 별도</span></p>
          <p>1회 30분 · 처음 미백하거나<br>가벼운 착색 개선에 추천</p>
        </div>
        <div class="treatment-card reveal delay-2" style="text-align:center;">
          <div class="treatment-card-icon"><i class="fas fa-star"></i></div>
          <h3>하드 블리칭</h3>
          <p style="font-size:1.8rem;font-weight:800;color:#b45309;margin:8px 0;">8만원<span style="font-size:0.8rem;font-weight:500;color:#64748b;"> /부가세 별도</span></p>
          <p>2회 60분 · 진한 색조 개선이<br>필요할 때 추천</p>
        </div>
      </div>
      <div style="text-align:center;margin-top:28px;">
        <a href="{WHITENING_LINK}" class="btn-naver" style="display:inline-flex;align-items:center;gap:8px;"><i class="fas fa-star"></i> {region} 치아미백 자세히 보기</a>
      </div>
    </div>
  </section>

'''


def insert_whitening_section(html, region):
    """cta-section 앞에 미백 할인 섹션 삽입"""
    if 'id="whitening-promo"' in html:
        return html, False
    section = whitening_section(region)
    pattern = re.compile(r'(\s*)(<section class="cta-section section")')
    if pattern.search(html):
        html = pattern.sub(lambda m: "\n" + section + m.group(1) + m.group(2), html, count=1)
        return html, True
    return html, False


def process_file(path):
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    region = get_region(html)
    if not region:
        return f"SKIP (no region): {os.path.basename(path)}"

    orig = html
    html = update_title(html, region)
    html = update_description(html, region)
    html = update_keywords(html, region)
    html, card_added = insert_whitening_card(html, region)
    html, sec_added = insert_whitening_section(html, region)

    if html != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        flags = []
        if card_added:
            flags.append("card")
        if sec_added:
            flags.append("section")
        return f"OK [{region}] {os.path.basename(path)} (+meta, {', '.join(flags) if flags else 'meta only'})"
    return f"NOCHANGE: {os.path.basename(path)}"


def main():
    files = sorted(glob.glob(os.path.join(AREA_DIR, "*.html")))
    print(f"대상 파일: {len(files)}개\n")
    ok = 0
    for path in files:
        result = process_file(path)
        print(result)
        if result.startswith("OK"):
            ok += 1
    print(f"\n=== 완료: {ok}/{len(files)} 처리됨 ===")


if __name__ == "__main__":
    main()
