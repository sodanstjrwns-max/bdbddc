#!/usr/bin/env python3
"""
모든 서브페이지 리컨스트럭션
1. subpage-extra.css 참조 제거 (homepage-v4.css만 사용)
2. <main> 내부의 subpage-hero를 메인 페이지의 hero 패턴으로 변환
3. old class 패턴들을 메인 페이지 패턴으로 변환
4. CTA 섹션을 메인 페이지 패턴으로 통일
"""
import os, re, glob

WEBAPP = "/home/user/webapp"
SKIP_FILES = {"index.html"}  # 메인 페이지는 건드리지 않음
SKIP_DIRS = {"dist", "node_modules", "public", ".git", ".wrangler", "scripts", "components"}

def get_all_subpages():
    """메인 페이지를 제외한 모든 HTML 파일 수집"""
    files = []
    for root, dirs, filenames in os.walk(WEBAPP):
        # Skip directories
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fn in filenames:
            if not fn.endswith('.html'):
                continue
            filepath = os.path.join(root, fn)
            relpath = os.path.relpath(filepath, WEBAPP)
            # Skip main index.html
            if relpath == "index.html":
                continue
            # Skip non-page files
            if fn in ("google17dbe9a80407755e.html", "offline.html", "mobile-nav-template.html"):
                continue
            # Skip templates and components
            if "template" in fn or relpath.startswith("components/"):
                continue
            # Skip area (already reconstructed)
            if relpath.startswith("area/"):
                continue
            files.append(filepath)
    return sorted(files)


def remove_subpage_extra_css(html):
    """subpage-extra.css 참조를 제거"""
    # Various patterns for subpage-extra.css link
    patterns = [
        r'\s*<link\s+rel="stylesheet"\s+href="[^"]*subpage-extra\.css"\s*/?>\s*\n?',
        r'\s*<link\s+rel="stylesheet"\s+href="[^"]*subpage-v4\.css"\s*/?>\s*\n?',
        r'\s*<link\s+rel="stylesheet"\s+href="[^"]*common-v4\.css"\s*/?>\s*\n?',
    ]
    for pat in patterns:
        html = re.sub(pat, '\n', html)
    return html


def convert_subpage_hero_to_main_hero(html):
    """
    서브페이지의 subpage-hero 섹션을 메인 페이지의 hero 섹션 패턴으로 변환
    """
    # Extract info from subpage-hero
    hero_match = re.search(
        r'<section\s+class="subpage-hero[^"]*"[^>]*>(.*?)</section>',
        html, re.DOTALL
    )
    if not hero_match:
        return html
    
    hero_content = hero_match.group(1)
    
    # Extract h1 text
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', hero_content, re.DOTALL)
    h1_text = h1_match.group(1).strip() if h1_match else "서울비디치과"
    
    # Extract hero-desc
    desc_match = re.search(r'class="hero-desc[^"]*"[^>]*>(.*?)</p>', hero_content, re.DOTALL)
    desc_text = desc_match.group(1).strip() if desc_match else ""
    
    # Extract badge text
    badge_match = re.search(r'class="hero-badge[^"]*"[^>]*>(.*?)</span>', hero_content, re.DOTALL)
    badge_text = badge_match.group(1).strip() if badge_match else ""
    
    # Extract breadcrumb
    breadcrumb_match = re.search(r'<nav\s+class="hero-breadcrumb"[^>]*>(.*?)</nav>', hero_content, re.DOTALL)
    breadcrumb_html = breadcrumb_match.group(1).strip() if breadcrumb_match else ""
    
    # Extract CTA buttons
    cta_match = re.search(r'class="hero-cta[^"]*"[^>]*>(.*?)</div>', hero_content, re.DOTALL)
    cta_html = cta_match.group(1).strip() if cta_match else ""
    
    # Extract hero stats
    stats_match = re.search(r'class="hero-stats[^"]*"[^>]*>(.*?)</div>\s*</div>', hero_content, re.DOTALL)
    stats_html = ""
    if stats_match:
        stats_html = stats_match.group(0)
    
    # Clean h1 - remove text-gradient span wrapping for re-wrapping
    # Keep the content as-is since it already has text-gradient spans
    
    # Build trust row from stats or default
    trust_row = """
        <div class="hero-trust-row reveal delay-3">
          <span class="hero-trust-item"><i class="fas fa-graduation-cap"></i> 서울대 15인 협진</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-calendar-check"></i> 365일 진료</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-clock"></i> 평일 야간 20시</span>
          <span class="hero-trust-divider desktop-only"></span>
          <span class="hero-trust-item desktop-only"><i class="fas fa-map-marker-alt"></i> 천안 불당동</span>
        </div>"""
    
    # Build CTA group
    if cta_html:
        cta_group = f'''
        <div class="hero-cta-group reveal delay-4">
          {cta_html}
        </div>'''
    else:
        # Get prefix from href patterns in the page
        prefix = "../" if "../reservation.html" in html else ""
        cta_group = f'''
        <div class="hero-cta-group reveal delay-4">
          <a href="{prefix}reservation.html" class="btn btn-primary btn-lg">
            <i class="fas fa-calendar-check"></i> 상담 예약하기
          </a>
          <a href="tel:0414152892" class="btn btn-outline btn-lg">
            <i class="fas fa-phone"></i> 041-415-2892
          </a>
        </div>'''
    
    # Build brand name line
    brand_line = '<p class="hero-brand-name reveal">SEOUL BD DENTAL CLINIC</p>'
    
    # Build new hero section
    new_hero = f'''
  <!-- ═══════ HERO ═══════ -->
  <section class="hero" aria-label="서울비디치과">
    <div class="hero-bg-pattern" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-1" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-2" aria-hidden="true"></div>
    
    <div class="container hero-content">
      <div class="hero-text">
        {brand_line}
        
        <h1 class="hero-headline reveal delay-1">
          {h1_text}
        </h1>
        
        <p class="hero-sub reveal delay-2">
          {desc_text}
        </p>
        {trust_row}
        {cta_group}
      </div>
    </div>
    
    <div class="hero-scroll-hint" aria-hidden="true">
      <span>SCROLL</span>
      <div class="scroll-line"></div>
    </div>
  </section>'''
    
    # Replace old hero with new
    html = html[:hero_match.start()] + new_hero + html[hero_match.end():]
    
    return html


def convert_cta_sections(html):
    """CTA 섹션을 메인 페이지 패턴(cta-box)으로 통일"""
    # Find cta-wrapper and replace with cta-box
    html = html.replace('class="cta-wrapper', 'class="cta-box')
    # Fix cta-note to cta-phone
    html = re.sub(r'class="cta-note"', 'class="cta-phone"', html)
    return html


def fix_section_patterns(html):
    """서브페이지의 old 패턴들을 메인 패턴으로 변환"""
    # alt-bg -> just section (remove alt-bg)
    html = html.replace('class="section alt-bg"', 'class="section"')
    
    # implant-reviews-grid -> reviews-grid
    html = html.replace('class="implant-reviews-grid', 'class="reviews-grid')
    
    # types-grid -> treatment-grid (for treatment types)
    html = html.replace('class="types-grid"', 'class="treatment-grid"')
    
    # type-card -> treatment-card 
    # (but keep type-icon, type-desc etc as they are styled in subpage-extra)
    # Actually since we remove subpage-extra, we need to remap these
    # type-card -> card (design-system-v4 has .card)
    html = html.replace('class="type-card featured', 'class="card featured')
    html = html.replace('class="type-card ', 'class="card ')
    
    # local-hero, local-section -> section
    html = html.replace('class="local-hero"', 'class="section"')
    html = html.replace('class="local-section"', 'class="section"')
    html = re.sub(r'class="local-section"\s+style="[^"]*"', 'class="section"', html)
    
    # why-us-grid -> why-grid
    html = html.replace('class="why-us-grid"', 'class="why-grid"')
    
    # services-grid -> treatment-grid
    html = html.replace('class="services-grid"', 'class="treatment-grid"')
    html = html.replace('class="service-card"', 'class="treatment-card"')
    
    # location-section -> section
    html = html.replace('class="location-section"', 'class="section"')
    
    # area-info -> section
    html = html.replace('class="area-info"', 'class="section"')
    html = html.replace('class="area-grid"', 'class="promise-grid"')
    html = html.replace('class="area-item"', 'class="promise-card"')
    
    return html


def add_scroll_reveal_script(html):
    """Ensure scroll reveal script exists"""
    if "IntersectionObserver" not in html:
        insert_before = "</body>"
        reveal_script = '''  <script>
    document.addEventListener('DOMContentLoaded',function(){var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});els.forEach(function(el){obs.observe(el);});});
  </script>
'''
        html = html.replace(insert_before, reveal_script + insert_before)
    return html


def process_file(filepath):
    """Process a single HTML file"""
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()
    
    original = html
    
    # 1. Remove subpage-extra.css reference
    html = remove_subpage_extra_css(html)
    
    # 2. Convert subpage-hero to main hero pattern
    html = convert_subpage_hero_to_main_hero(html)
    
    # 3. Convert CTA sections
    html = convert_cta_sections(html)
    
    # 4. Fix section patterns
    html = fix_section_patterns(html)
    
    # 5. Ensure scroll reveal script
    html = add_scroll_reveal_script(html)
    
    # Clean up extra blank lines
    html = re.sub(r'\n{4,}', '\n\n', html)
    
    if html != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        return True
    return False


if __name__ == "__main__":
    files = get_all_subpages()
    changed = 0
    total = len(files)
    
    for filepath in files:
        relpath = os.path.relpath(filepath, WEBAPP)
        modified = process_file(filepath)
        status = "✅ 변경됨" if modified else "⏭️ 변경 없음"
        print(f"{status}: {relpath}")
        if modified:
            changed += 1
    
    print(f"\n총 {total}개 파일 처리, {changed}개 변경됨")
