#!/usr/bin/env python3
"""
서울비디치과 — 전체 서브페이지 생성 스크립트 v5.0
Homepage DNA를 모든 서브페이지에 이식
"""
import os

WEBAPP = "/home/user/webapp"

# ─── SHARED HEAD TEMPLATE ───
def head(title, description, keywords, canonical_path, breadcrumb_name, og_title=None, prefix=""):
    og_t = og_title or title
    return f'''<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/{canonical_path}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="{og_t}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/{canonical_path}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{og_t}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-image.jpg">
  <link rel="icon" type="image/svg+xml" href="{prefix}/images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="{prefix}/images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="{prefix}/manifest.json">
  <meta name="theme-color" content="#6B4226">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="{prefix}/css/design-system-v4.css">
  <link rel="stylesheet" href="{prefix}/css/common-v4.css">
  <link rel="stylesheet" href="{prefix}/css/subpage-v4.css">
  <link rel="prefetch" href="{prefix}/reservation.html" as="document">
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"}},{{"@type":"ListItem","position":2,"name":"{breadcrumb_name}","item":"https://bdbddc.com/{canonical_path}"}}]}}
  </script>
</head>
'''

# ─── SHARED HEADER ───
def header(prefix=""):
    p = prefix
    return f'''<body>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  <header class="site-header" id="siteHeader">
    <div class="header-container">
      <div class="header-brand">
        <a href="{p}/" class="site-logo" aria-label="서울비디치과 홈"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a>
        <div class="clinic-status open" aria-live="polite"><span class="status-dot"></span><span class="status-text">진료중</span><span class="status-time">20:00까지</span></div>
      </div>
      <nav class="main-nav" id="mainNav" aria-label="메인 네비게이션">
        <ul>
          <li class="nav-item has-dropdown">
            <a href="{p}/treatments/index.html">진료 안내</a>
            <div class="mega-dropdown"><div class="mega-dropdown-grid">
              <div class="mega-dropdown-section"><h4>전문센터</h4><ul><li><a href="{p}/treatments/glownate.html">✨ 글로우네이트 <span class="badge badge-hot">HOT</span></a></li><li><a href="{p}/treatments/implant.html">임플란트 <span class="badge">6개 수술실</span></a></li><li><a href="{p}/treatments/invisalign.html">치아교정 <span class="badge">대규모</span></a></li><li><a href="{p}/treatments/pediatric.html">소아치과 <span class="badge">전문의 3인</span></a></li><li><a href="{p}/treatments/aesthetic.html">심미치료</a></li></ul></div>
              <div class="mega-dropdown-section"><h4>일반/보존 진료</h4><ul><li><a href="{p}/treatments/cavity.html">충치치료</a></li><li><a href="{p}/treatments/resin.html">레진치료</a></li><li><a href="{p}/treatments/crown.html">크라운</a></li><li><a href="{p}/treatments/inlay.html">인레이/온레이</a></li><li><a href="{p}/treatments/root-canal.html">신경치료</a></li><li><a href="{p}/treatments/whitening.html">미백</a></li></ul></div>
              <div class="mega-dropdown-section"><h4>잇몸/외과</h4><ul><li><a href="{p}/treatments/scaling.html">스케일링</a></li><li><a href="{p}/treatments/gum.html">잇몸치료</a></li><li><a href="{p}/treatments/periodontitis.html">치주염</a></li><li><a href="{p}/treatments/wisdom-tooth.html">사랑니 발치</a></li><li><a href="{p}/treatments/tmj.html">턱관절장애</a></li><li><a href="{p}/treatments/bruxism.html">이갈이/이악물기</a></li></ul></div>
            </div></div>
          </li>
          <li class="nav-item"><a href="{p}/doctors/index.html">의료진 소개</a></li>
          <li class="nav-item"><a href="{p}/bdx/index.html">검진센터</a></li>
          <li class="nav-item has-dropdown"><a href="{p}/column/columns.html">콘텐츠</a><ul class="simple-dropdown"><li><a href="{p}/column/columns.html"><i class="fas fa-pen-fancy"></i> 칼럼</a></li><li><a href="{p}/video/index.html"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="{p}/cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li></ul></li>
          <li class="nav-item has-dropdown"><a href="{p}/directions.html">병원 안내</a><ul class="simple-dropdown"><li><a href="{p}/pricing.html" class="nav-highlight">💰 비용 안내</a></li><li><a href="{p}/floor-guide.html">층별 안내</a></li><li><a href="{p}/directions.html">오시는 길</a></li><li><a href="{p}/faq.html">자주 묻는 질문</a></li><li><a href="{p}/notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
        <div class="auth-buttons"><a href="{p}/auth/login.html" class="btn-auth btn-login"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="{p}/auth/register.html" class="btn-auth btn-register"><i class="fas fa-user-plus"></i> 회원가입</a></div>
        <a href="{p}/reservation.html" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
  <div class="header-spacer"></div>
'''

# ─── CTA SECTION ───
def cta(prefix="", title="궁금한 점이 있으신가요?", subtitle="365일 진료하는 서울비디치과에 부담 없이 문의하세요"):
    p = prefix
    return f'''
  <!-- ═══════ CTA ═══════ -->
  <section class="cta-section" aria-label="상담 예약">
    <div class="container">
      <div class="cta-box reveal">
        <div class="cta-content">
          <span class="cta-badge"><i class="fas fa-calendar-check"></i> 상담 예약</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <div class="cta-buttons">
            <a href="{p}/reservation.html" class="btn-cta-primary"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>
            <a href="tel:041-415-2892" class="btn-cta-outline"><i class="fas fa-phone"></i> 041-415-2892</a>
          </div>
          <div class="cta-info">
            <span><i class="fas fa-clock"></i> 365일 진료</span>
            <span><i class="fas fa-sun"></i> 평일 09:00-20:00</span>
            <span><i class="fas fa-calendar-day"></i> 토·일 09:00-17:00</span>
          </div>
        </div>
      </div>
    </div>
  </section>
'''

# ─── FOOTER ───
def footer(prefix=""):
    p = prefix
    return f'''
  </main>
  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand"><a href="{p}/" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p></div>
        <div class="footer-links">
          <div class="footer-col"><h4>전문센터</h4><ul><li><a href="{p}/treatments/implant.html">임플란트센터</a></li><li><a href="{p}/treatments/invisalign.html">교정센터</a></li><li><a href="{p}/treatments/pediatric.html">소아치과</a></li><li><a href="{p}/treatments/glownate.html">심미치료</a></li></ul></div>
          <div class="footer-col"><h4>병원 안내</h4><ul><li><a href="{p}/doctors/index.html">의료진 소개</a></li><li><a href="{p}/bdx/index.html">BDX 검진센터</a></li><li><a href="{p}/floor-guide.html">층별 안내</a></li><li><a href="{p}/cases/gallery.html">Before/After</a></li></ul></div>
          <div class="footer-col"><h4>고객 지원</h4><ul><li><a href="{p}/reservation.html">예약/상담</a></li><li><a href="{p}/column/columns.html">칼럼/콘텐츠</a></li><li><a href="{p}/faq.html">자주 묻는 질문</a></li><li><a href="{p}/directions.html">오시는 길</a></li></ul></div>
        </div>
      </div>
      <div class="footer-info">
        <div class="footer-contact"><p><i class="fas fa-map-marker-alt"></i> 충남 천안시 서북구 불당34길 14, 1~5층</p><p><i class="fas fa-phone"></i> 041-415-2892</p><div class="footer-hours"><p><i class="fas fa-clock"></i> <strong>365일 진료</strong></p><p>평일 09:00-20:00 (점심 12:30-14:00)</p><p>토·일 09:00-17:00</p><p>공휴일 09:00-13:00</p></div></div>
        <div class="footer-social"><a href="https://naver.me/5yPnKmqQ" target="_blank" rel="noopener" aria-label="네이버 예약"><i class="fas fa-calendar-check"></i></a><a href="https://www.youtube.com/c/%EC%89%BD%EB%94%94%EC%89%AC%EC%9A%B4%EC%B9%98%EA%B3%BC%EC%9D%B4%EC%95%BC%EA%B8%B0Bdtube" target="_blank" rel="noopener" aria-label="유튜브"><i class="fab fa-youtube"></i></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" aria-label="카카오톡"><i class="fas fa-comment"></i></a></div>
      </div>
      <div class="footer-legal">
        <div class="legal-links"><a href="{p}/privacy.html">개인정보 처리방침</a><span>|</span><a href="{p}/terms.html">이용약관</a><span>|</span><a href="{p}/sitemap.xml">사이트맵</a></div>
        <p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수하여 제공하고 있으며, 특정 개인의 결과는 개인에 따라 달라질 수 있습니다.</p>
        <p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
      </div>
    </div>
  </footer>
  <nav class="mobile-nav" id="mobileNav" aria-label="모바일 메뉴">
    <div class="mobile-nav-header"><span class="logo-icon">🦷</span><button class="mobile-nav-close" id="mobileNavClose" aria-label="메뉴 닫기"><i class="fas fa-times"></i></button></div>
    <ul class="mobile-nav-menu">
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-tooth"></i> 진료 안내 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="{p}/treatments/index.html">전체 진료</a></li><li class="submenu-divider">전문센터</li><li><a href="{p}/treatments/glownate.html" style="color:#6B4226;font-weight:600;">✨ 글로우네이트</a></li><li><a href="{p}/treatments/implant.html">임플란트센터</a></li><li><a href="{p}/treatments/invisalign.html">교정센터</a></li><li><a href="{p}/treatments/pediatric.html">소아치과</a></li><li><a href="{p}/treatments/aesthetic.html">심미치료</a></li><li class="submenu-divider">일반 진료</li><li><a href="{p}/treatments/cavity.html">충치치료</a></li><li><a href="{p}/treatments/resin.html">레진치료</a></li><li><a href="{p}/treatments/scaling.html">스케일링</a></li><li><a href="{p}/treatments/gum.html">잇몸치료</a></li></ul></li>
      <li><a href="{p}/doctors/index.html"><i class="fas fa-user-md"></i> 의료진 소개</a></li>
      <li><a href="{p}/bdx/index.html"><i class="fas fa-microscope"></i> 검진센터</a></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-newspaper"></i> 콘텐츠 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="{p}/column/columns.html"><i class="fas fa-pen-fancy"></i> 칼럼</a></li><li><a href="{p}/video/index.html"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="{p}/cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li></ul></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-hospital"></i> 병원 안내 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="{p}/pricing.html">💰 비용 안내</a></li><li><a href="{p}/floor-guide.html">층별 안내</a></li><li><a href="{p}/directions.html">오시는 길</a></li><li><a href="{p}/faq.html">자주 묻는 질문</a></li><li><a href="{p}/notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
      <li><a href="{p}/reservation.html" class="highlight"><i class="fas fa-calendar-check"></i> 예약하기</a></li>
    </ul>
    <div class="mobile-auth-buttons"><a href="{p}/auth/login.html" class="btn-auth"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="{p}/auth/register.html" class="btn-auth"><i class="fas fa-user-plus"></i> 회원가입</a></div>
    <div class="mobile-nav-footer"><p class="mobile-nav-hours"><i class="fas fa-clock"></i> 365일 진료 | 평일 야간진료</p><div class="mobile-nav-quick-btns"><a href="{p}/pricing.html" class="btn btn-secondary btn-lg"><i class="fas fa-won-sign"></i> 비용 안내</a><a href="tel:041-415-2892" class="btn btn-primary btn-lg"><i class="fas fa-phone"></i> 전화 예약</a></div></div>
  </nav>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>
  <div class="floating-cta desktop-only"><a href="javascript:void(0)" class="floating-btn top" aria-label="맨 위로" id="scrollToTopBtn"><i class="fas fa-arrow-up"></i><span class="tooltip">맨 위로</span></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="floating-btn kakao" aria-label="카카오톡 상담"><i class="fas fa-comment-dots"></i><span class="tooltip">카카오톡 상담</span></a><a href="tel:0414152892" class="floating-btn phone" aria-label="전화 상담"><i class="fas fa-phone"></i><span class="tooltip">전화 상담</span></a></div>
  <div class="mobile-bottom-cta mobile-only" aria-label="빠른 연락"><a href="tel:041-415-2892" class="mobile-cta-btn phone"><i class="fas fa-phone-alt"></i><span>전화</span></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="mobile-cta-btn kakao"><i class="fas fa-comment"></i><span>카카오톡</span></a><a href="{p}/reservation.html" class="mobile-cta-btn reserve primary"><i class="fas fa-calendar-check"></i><span>예약</span></a><a href="{p}/directions.html" class="mobile-cta-btn location"><i class="fas fa-map-marker-alt"></i><span>오시는 길</span></a></div>
  <script src="{p}/js/main.js" defer></script>
  <script src="{p}/js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){{var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){{entries.forEach(function(e){{if(e.isIntersecting){{e.target.classList.add('visible');obs.unobserve(e.target);}}}});}},{{threshold:0.08,rootMargin:'0px 0px -40px 0px'}});els.forEach(function(el){{obs.observe(el);}});}});
  </script>
'''

# ─── HERO SECTION ───
def hero(badge_icon, badge_text, title_plain, title_gradient, desc, stats=None, prefix="", breadcrumb_parent=None, breadcrumb_parent_link=None, breadcrumb_current=""):
    p = prefix
    stats_html = ""
    if stats:
        items = "".join([f'<div class="hero-stat"><span class="stat-number">{s[0]}</span><span class="stat-label">{s[1]}</span></div>' for s in stats])
        stats_html = f'<div class="hero-stats">{items}</div>'
    
    bc_parts = f'<a href="{p}/">홈</a><span class="separator"><i class="fas fa-chevron-right"></i></span>'
    if breadcrumb_parent:
        bc_parts += f'<a href="{p}/{breadcrumb_parent_link}">{breadcrumb_parent}</a><span class="separator"><i class="fas fa-chevron-right"></i></span>'
    bc_parts += f'<span class="current">{breadcrumb_current}</span>'
    
    return f'''
  <main id="main-content" role="main">
  <!-- ═══════ HERO ═══════ -->
  <section class="subpage-hero" aria-label="{breadcrumb_current}">
    <div class="hero-bg-pattern" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-1" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-2" aria-hidden="true"></div>
    <div class="container">
      <nav class="breadcrumb" aria-label="현재 위치">{bc_parts}</nav>
      <span class="hero-badge"><i class="fas fa-{badge_icon}"></i> {badge_text}</span>
      <h1>{title_plain} <span class="text-gradient">{title_gradient}</span></h1>
      <p class="hero-desc">{desc}</p>
      {stats_html}
    </div>
  </section>
'''

# ─── SECTION WRAPPER ───
def section(badge_icon, badge_text, title_plain, title_gradient, subtitle, content, bg=""):
    bg_class = f" {bg}" if bg else ""
    return f'''
  <section class="content-section{bg_class}" aria-label="{badge_text}">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-{badge_icon}"></i> {badge_text}</span>
        <h2 class="section-title">{title_plain} <span class="text-gradient">{title_gradient}</span></h2>
        <p class="section-subtitle">{subtitle}</p>
      </div>
      {content}
    </div>
  </section>
'''

# ─── WRITE PAGE ───
def write_page(filepath, content):
    fullpath = os.path.join(WEBAPP, filepath)
    os.makedirs(os.path.dirname(fullpath), exist_ok=True)
    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✓ {filepath}")


# ══════════════════════════════════════════════
# PAGE DEFINITIONS
# ══════════════════════════════════════════════

def gen_faq():
    page = head("자주 묻는 질문 | 서울비디치과", "서울비디치과 자주 묻는 질문 — 임플란트, 교정, 비용, 예약 관련 궁금한 점을 안내합니다.", "천안치과 FAQ, 임플란트 질문, 교정 비용, 서울비디치과 자주 묻는 질문", "faq.html", "자주 묻는 질문")
    page += header()
    page += hero("question-circle", "FAQ", "자주 묻는", "질문", "환자분들이 가장 많이 물어보시는 질문을 모았습니다", breadcrumb_current="자주 묻는 질문")
    
    faqs = [
        ("첫 방문 시 비용은 얼마인가요?", "첫 방문 시 기본 상담과 파노라마 촬영은 건강보험이 적용됩니다. BDX 종합 구강검진은 첫 방문 시 무료로 제공됩니다. 자세한 비용은 <a href='pricing.html' style='color:var(--brand-primary);font-weight:600;'>비용 안내 페이지</a>에서 확인하실 수 있습니다."),
        ("임플란트 비용은 어느 정도인가요?", "임플란트 비용은 브랜드와 환자분의 상태에 따라 100만원대부터 시작합니다. 정확한 비용은 CT 촬영 후 맞춤 견적서를 제공해 드립니다. 65세 이상은 건강보험이 일부 적용됩니다."),
        ("인비절라인 교정 기간은 얼마나 걸리나요?", "일반적으로 인비절라인 풀 교정은 12~24개월, 라이트는 6~12개월 정도 소요됩니다. 개인의 치아 상태에 따라 기간이 달라질 수 있으며, 초진 상담 시 예상 기간을 안내드립니다."),
        ("365일 진료 맞나요? 일요일·공휴일에도 진료하나요?", "네, 서울비디치과는 365일 진료합니다. 평일 09:00-20:00, 토·일 09:00-17:00, 공휴일 09:00-13:00 운영합니다. 점심시간(12:30-14:00)에도 응급 진료가 가능합니다."),
        ("주차가 가능한가요?", "네, 건물 앞 주차장과 인근 주차시설을 이용하실 수 있습니다. 3시간 이상 진료 시 주차비를 지원해 드립니다."),
        ("소아치과 전문의가 있나요?", "네, 서울비디치과에는 소아치과 전문의 3인이 상주하고 있습니다. 아이 맞춤 진료 환경과 수면진정 진료도 가능합니다."),
        ("라미네이트 비용은 얼마인가요?", "라미네이트는 개당 50~80만원 정도이며, 시술 범위와 재질에 따라 달라집니다. 정확한 비용은 상담 시 견적서로 안내드립니다."),
        ("예약 없이 방문해도 되나요?", "예약 없이도 방문 가능하지만, 예약 환자가 우선 진료됩니다. 원활한 진료를 위해 <a href='reservation.html' style='color:var(--brand-primary);font-weight:600;'>온라인 예약</a> 또는 전화 예약(041-415-2892)을 추천드립니다."),
    ]
    
    faq_items = ""
    for q, a in faqs:
        faq_items += f'''
        <div class="faq-item">
          <button class="faq-question" aria-expanded="false">
            <span>{q}</span>
            <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
          </button>
          <div class="faq-answer"><p>{a}</p></div>
        </div>'''
    
    page += section("question-circle", "자주 묻는 질문", "궁금한 점을", "해결해 드립니다", "가장 많이 물어보시는 질문들을 모았습니다", f'<div class="faq-list reveal">{faq_items}</div>')
    page += cta(title="더 궁금한 점이 있으신가요?", subtitle="부담 없이 전화 또는 온라인으로 문의해 주세요")
    page += footer()
    page += '''
  <script>
    document.querySelectorAll('.faq-question').forEach(function(btn){
      btn.addEventListener('click',function(){
        var item=this.parentElement;
        var isActive=item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(function(i){i.classList.remove('active');});
        if(!isActive)item.classList.add('active');
      });
    });
  </script>
</body>
</html>'''
    write_page("faq.html", page)


def gen_directions():
    page = head("오시는 길 | 서울비디치과", "서울비디치과 오시는 길 — 충남 천안시 서북구 불당34길 14. 자가용, 대중교통, 주차 안내.", "천안치과 위치, 서울비디치과 길찾기, 불당동 치과, 천안 불당34길 14", "directions.html", "오시는 길")
    page += header()
    page += hero("map-marker-alt", "오시는 길", "서울비디치과", "오시는 길", "충남 천안시 서북구 불당34길 14, 1~5층", stats=[("365일", "연중무휴"), ("20:00", "야간진료"), ("5층", "전문센터")], breadcrumb_current="오시는 길")
    
    map_html = '''
      <div class="map-wrapper reveal mb-12">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3177.1!2d127.1139!3d36.8151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z7ISc7Jq467mE65SU7LmY6rO8!5e0!3m2!1sko!2skr!4v1" width="100%" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="서울비디치과 위치"></iframe>
      </div>'''
    
    page += section("map-marker-alt", "위치", "서울비디치과", "위치 안내", "충남 천안시 서북구 불당34길 14, 1~5층", map_html)
    
    transport_html = '''
      <div class="transport-grid reveal">
        <div class="transport-card">
          <div class="transport-icon"><i class="fas fa-car"></i></div>
          <h3>자가용</h3>
          <p>내비게이션에 "서울비디치과" 또는 "천안시 서북구 불당34길 14" 검색</p>
          <p style="margin-top:8px;"><strong>건물 앞 주차 가능</strong> (3시간 이상 진료 시 주차비 지원)</p>
        </div>
        <div class="transport-card">
          <div class="transport-icon"><i class="fas fa-bus"></i></div>
          <h3>대중교통 (버스)</h3>
          <p>불당사거리 정류장 하차 후 도보 5분</p>
          <p style="margin-top:8px;">주요 노선: 400번, 401번, 402번</p>
        </div>
        <div class="transport-card">
          <div class="transport-icon"><i class="fas fa-subway"></i></div>
          <h3>지하철 (수도권 전철)</h3>
          <p>천안역 또는 두정역에서 택시 15분</p>
          <p style="margin-top:8px;">KTX 천안아산역에서 택시 20분</p>
        </div>
        <div class="transport-card">
          <div class="transport-icon"><i class="fas fa-parking"></i></div>
          <h3>주차 안내</h3>
          <p>건물 앞 전용 주차공간 확보</p>
          <p style="margin-top:8px;">인근 공영주차장 이용 가능 (도보 3분)</p>
        </div>
      </div>'''
    
    page += section("directions", "교통편", "편리한", "교통 안내", "다양한 교통수단으로 방문하실 수 있습니다", transport_html, "bg-warm")
    
    hours_html = '''
      <div class="max-w-800">
        <div class="info-box reveal">
          <h3><i class="fas fa-clock"></i> 진료 시간</h3>
          <ul>
            <li><strong>평일</strong> 09:00 - 20:00 (점심 12:30-14:00)</li>
            <li><strong>토요일</strong> 09:00 - 17:00</li>
            <li><strong>일요일</strong> 09:00 - 17:00</li>
            <li><strong>공휴일</strong> 09:00 - 13:00</li>
          </ul>
        </div>
        <div class="info-box reveal">
          <h3><i class="fas fa-phone"></i> 연락처</h3>
          <ul>
            <li><strong>전화</strong> 041-415-2892</li>
            <li><strong>주소</strong> 충남 천안시 서북구 불당34길 14, 1~5층</li>
            <li><strong>카카오톡</strong> <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" style="color:var(--brand-primary);font-weight:600;">카카오톡 상담 바로가기</a></li>
          </ul>
        </div>
      </div>'''
    
    page += section("clock", "진료시간", "365일", "진료 안내", "연중무휴 — 일요일, 공휴일에도 진료합니다", hours_html)
    page += cta(title="방문 예약을 원하시나요?", subtitle="365일 진료하는 서울비디치과에서 편하게 상담받으세요")
    page += footer()
    page += '\n</body>\n</html>'
    write_page("directions.html", page)


def gen_floor_guide():
    page = head("층별 안내 | 서울비디치과", "서울비디치과 층별 안내 — 400평 규모 5층 전문센터. 1층 접수/일반진료, 2층 교정센터, 3층 임플란트, 4층 소아치과, 5층 검진센터", "천안치과 층별안내, 서울비디치과 시설, 400평 치과", "floor-guide.html", "층별 안내")
    page += header()
    page += hero("building", "층별 안내", "400평 규모", "5층 전문센터", "각 층마다 전문 진료센터를 운영합니다", stats=[("400평", "규모"), ("5층", "전문센터"), ("6개", "수술실"), ("1:1", "멸균 시스템")], breadcrumb_current="층별 안내")
    
    floors = [
        ("5F", "BDX 검진센터", "종합 구강검진, CT/X-ray 촬영, 상담실", ["구강검진", "3D CT", "상담"]),
        ("4F", "소아치과 전문센터", "소아치과 전문의 3인 상주, 어린이 맞춤 진료 환경, 수면진정 가능", ["전문의 3인", "수면진정", "키즈 공간"]),
        ("3F", "임플란트 센터", "6개 독립 수술실, 네비게이션 임플란트, 에어샤워 멸균 시스템", ["6개 수술실", "네비게이션", "에어샤워"]),
        ("2F", "교정 센터", "인비절라인 대규모 교정센터, 세라믹·메탈 교정, 투명교정", ["인비절라인", "디지털 교정", "대규모"]),
        ("1F", "접수 / 일반진료", "접수·수납, 충치치료, 신경치료, 스케일링, 잇몸치료, 응급진료", ["접수", "일반진료", "응급진료"]),
    ]
    
    floor_html = '<div class="floor-list reveal">'
    for num, name, desc, tags in floors:
        tags_html = "".join([f'<span class="floor-tag">{t}</span>' for t in tags])
        floor_html += f'''
        <div class="floor-item">
          <div class="floor-number">{num}</div>
          <div class="floor-content">
            <h3>{name}</h3>
            <p>{desc}</p>
            <div class="floor-tags">{tags_html}</div>
          </div>
        </div>'''
    floor_html += '</div>'
    
    page += section("building", "층별 안내", "전문 진료", "센터 구성", "각 층마다 전문센터를 운영하여 최적의 진료 환경을 제공합니다", floor_html)
    
    features_html = '''
      <div class="info-grid cols-4 reveal">
        <div class="info-card"><div class="card-icon"><i class="fas fa-wind"></i></div><h3>에어샤워</h3><p>수술실 입장 전 공기 세정</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-shield-virus"></i></div><h3>1:1 멸균</h3><p>환자별 개별 멸균 기구</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-x-ray"></i></div><h3>3D CT</h3><p>정밀 디지털 진단</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-couch"></i></div><h3>프리미엄 시설</h3><p>편안한 대기·진료 공간</p></div>
      </div>'''
    
    page += section("star", "시설 특장점", "프리미엄", "시설 안내", "서울대학교 치과병원과 동일한 감염관리 시스템을 운영합니다", features_html, "bg-warm")
    page += cta(title="직접 시설을 확인해 보세요", subtitle="방문 상담 시 시설을 직접 둘러보실 수 있습니다")
    page += footer()
    page += '\n</body>\n</html>'
    write_page("floor-guide.html", page)


def gen_reservation():
    page = head("예약/상담 | 서울비디치과", "서울비디치과 온라인 예약 — 365일 진료, 평일 야간 20시까지. 간편하게 온라인 예약하세요.", "천안치과 예약, 서울비디치과 상담, 임플란트 예약, 교정 상담", "reservation.html", "예약/상담")
    page += header()
    page += hero("calendar-check", "예약/상담", "간편한", "온라인 예약", "365일 진료 — 원하시는 시간에 편하게 예약하세요", stats=[("365일", "진료"), ("20:00", "야간진료"), ("1분", "간편 예약")], breadcrumb_current="예약/상담")
    
    form_content = '''
      <div class="form-section reveal">
        <div class="info-box mb-8">
          <h3><i class="fas fa-info-circle"></i> 예약 안내</h3>
          <ul>
            <li>온라인 예약 후 확인 전화를 드립니다</li>
            <li>급한 경우 전화 예약을 추천드립니다: <strong>041-415-2892</strong></li>
            <li>예약 변경/취소는 전화로 가능합니다</li>
          </ul>
        </div>
        
        <form id="reservationForm" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label">이름 <span class="required">*</span></label>
            <input type="text" class="form-input" placeholder="이름을 입력해 주세요" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">연락처 <span class="required">*</span></label>
              <input type="tel" class="form-input" placeholder="010-0000-0000" required>
            </div>
            <div class="form-group">
              <label class="form-label">희망 날짜 <span class="required">*</span></label>
              <input type="date" class="form-input" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">희망 시간</label>
            <select class="form-select">
              <option value="">시간을 선택해 주세요</option>
              <option>09:00 ~ 10:00</option><option>10:00 ~ 11:00</option><option>11:00 ~ 12:00</option>
              <option>14:00 ~ 15:00</option><option>15:00 ~ 16:00</option><option>16:00 ~ 17:00</option>
              <option>17:00 ~ 18:00</option><option>18:00 ~ 19:00</option><option>19:00 ~ 20:00</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">진료 과목</label>
            <select class="form-select">
              <option value="">진료 과목을 선택해 주세요</option>
              <option>임플란트</option><option>치아교정 (인비절라인)</option><option>소아치과</option>
              <option>충치치료</option><option>신경치료</option><option>스케일링</option>
              <option>잇몸치료</option><option>미백</option><option>심미치료 (라미네이트 등)</option>
              <option>사랑니 발치</option><option>턱관절장애</option><option>기타/상담</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">증상 / 요청사항</label>
            <textarea class="form-textarea" placeholder="증상이나 요청사항을 자유롭게 적어주세요"></textarea>
          </div>
          <div class="form-group">
            <label class="form-checkbox">
              <input type="checkbox" required>
              <span><a href="privacy.html" style="color:var(--brand-primary);text-decoration:underline;">개인정보 처리방침</a>에 동의합니다 <span class="required">*</span></span>
            </label>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">
            <i class="fas fa-calendar-check"></i> 예약 신청하기
          </button>
          <p class="form-hint mt-4 text-center">* 예약 신청 후 확인 전화를 드립니다. 전화 예약: 041-415-2892</p>
        </form>
      </div>'''
    
    page += section("calendar-check", "예약 신청", "온라인", "예약 신청", "아래 양식을 작성해 주시면 확인 후 연락드리겠습니다", form_content)
    
    alt_html = '''
      <div class="info-grid cols-2 reveal">
        <div class="info-card">
          <div class="card-icon"><i class="fab fa-naver"></i></div>
          <h3>네이버 예약</h3>
          <p>네이버에서 간편하게 예약하세요</p>
          <a href="https://naver.me/5yPnKmqQ" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="margin-top:16px;"><i class="fas fa-external-link-alt"></i> 네이버 예약</a>
        </div>
        <div class="info-card">
          <div class="card-icon"><i class="fas fa-comment"></i></div>
          <h3>카카오톡 상담</h3>
          <p>카카오톡으로 편하게 상담하세요</p>
          <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="margin-top:16px;"><i class="fas fa-comment"></i> 카카오톡 상담</a>
        </div>
      </div>'''
    
    page += section("mouse-pointer", "다른 예약 방법", "다양한", "예약 채널", "편하신 채널로 예약해 주세요", alt_html, "bg-warm")
    page += footer()
    page += '\n</body>\n</html>'
    write_page("reservation.html", page)


def gen_doctors_index():
    page = head("의료진 소개 | 서울비디치과", "서울비디치과 의료진 소개 — 서울대 출신 15인 원장 협진. 각 분야 전문의가 최적의 치료를 제공합니다.", "천안치과 의사, 서울비디치과 원장, 서울대 치과의사, 천안 치과 전문의", "doctors/index.html", "의료진 소개", prefix="..")
    page += header("..")
    page += hero("user-md", "의료진", "서울대 출신", "15인 원장 협진", "각 분야 전문의가 팀을 이루어 최적의 치료를 제공합니다", stats=[("15인", "원장 협진"), ("서울대", "출신"), ("전문의", "다수 보유")], prefix="..", breadcrumb_current="의료진 소개")
    
    doctors = [
        ("문석준", "대표원장", "통합치의학과 전문의", ["대표원장", "통합치의학", "경영"]),
        ("김민규", "원장", "치과보철과", ["보철", "임플란트"]),
        ("이병민", "원장", "구강악안면외과", ["외과", "임플란트", "사랑니"]),
        ("박성빈", "원장", "치과교정과", ["교정", "인비절라인"]),
        ("강미진", "원장", "소아치과 전문의", ["소아치과", "전문의"]),
        ("김미정", "원장", "소아치과 전문의", ["소아치과", "전문의"]),
        ("조현지", "원장", "소아치과 전문의", ["소아치과", "전문의"]),
        ("서유진", "원장", "치과보존과", ["보존", "신경치료"]),
        ("현지영", "원장", "치주과", ["잇몸", "치주치료"]),
        ("강민재", "원장", "치과보철과", ["보철", "크라운"]),
        ("이재원", "원장", "구강악안면외과", ["외과", "발치"]),
        ("박진수", "원장", "치과교정과", ["교정", "투명교정"]),
        ("김승현", "원장", "치과보존과", ["보존", "심미치료"]),
        ("최민호", "원장", "통합치의학", ["일반진료", "검진"]),
        ("임서현", "원장", "예방치의학", ["예방", "스케일링"]),
    ]
    
    cards = '<div class="doctor-grid reveal">'
    for name, role, specialty, tags in doctors:
        tags_html = "".join([f'<span class="doctor-tag">{t}</span>' for t in tags])
        cards += f'''
        <div class="doctor-card">
          <div class="doctor-photo" style="width:120px;height:120px;border-radius:50%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-5);font-size:2.5rem;color:var(--brand-primary);">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="doctor-name">{name} 원장</div>
          <div class="doctor-role">{role}</div>
          <div class="doctor-specialty">{specialty}</div>
          <div class="doctor-tags">{tags_html}</div>
        </div>'''
    cards += '</div>'
    
    page += section("user-md", "의료진", "서울비디치과", "의료진 소개", "서울대 출신 15인 원장이 팀을 이루어 진료합니다", cards)
    
    philosophy_html = '''
      <div class="max-w-800">
        <div class="why-hero-grid" style="grid-template-columns:1fr;">
          <div class="why-hero-card reveal" style="text-align:center;">
            <div class="card-icon">💎</div>
            <h3>"필요한 진료를 받지 못하는 사람이 없도록"</h3>
            <p>서울비디치과 의료진은 과잉진료 없이, 환자분께 꼭 필요한 치료만 정직하게 안내합니다. 서울대학교 출신 전문의들이 협진하여 최적의 치료 계획을 수립합니다.</p>
          </div>
        </div>
      </div>'''
    page += section("heart", "진료 철학", "정직한", "진료 철학", "", philosophy_html, "bg-warm")
    page += cta("..", "전문 의료진과 상담하세요", "각 분야 전문의가 맞춤 상담을 제공합니다")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page("doctors/index.html", page)


def gen_treatments_index():
    page = head("진료 안내 | 서울비디치과", "서울비디치과 전체 진료 안내 — 임플란트, 교정, 소아치과, 심미치료, 일반진료 등 전 분야 진료.", "천안치과 진료, 서울비디치과 진료안내, 임플란트, 교정, 소아치과", "treatments/index.html", "진료 안내", prefix="..")
    page += header("..")
    page += hero("tooth", "진료 안내", "서울비디치과", "진료 안내", "전문센터별 특화 진료로 최적의 치료를 제공합니다", stats=[("6개", "전문센터"), ("20+", "진료 과목"), ("15인", "원장 협진")], prefix="..", breadcrumb_current="진료 안내")
    
    specialty_cards = '''
      <div class="treatment-grid reveal">
        <a href="glownate.html" class="treatment-card">
          <div class="card-thumb">✨</div>
          <div class="card-body"><span class="card-category">프리미엄</span><h3>글로우네이트</h3><p>라미네이트 + 잇몸성형 + 미백을 한 번에</p><span class="card-link">자세히 보기 <i class="fas fa-arrow-right"></i></span></div>
        </a>
        <a href="implant.html" class="treatment-card">
          <div class="card-thumb"><i class="fas fa-tooth"></i></div>
          <div class="card-body"><span class="card-category">전문센터</span><h3>임플란트</h3><p>6개 수술실, 네비게이션 임플란트, 수면 임플란트</p><span class="card-link">자세히 보기 <i class="fas fa-arrow-right"></i></span></div>
        </a>
        <a href="invisalign.html" class="treatment-card">
          <div class="card-thumb"><i class="fas fa-teeth"></i></div>
          <div class="card-body"><span class="card-category">전문센터</span><h3>치아교정 (인비절라인)</h3><p>대규모 인비절라인 센터, 투명교정</p><span class="card-link">자세히 보기 <i class="fas fa-arrow-right"></i></span></div>
        </a>
        <a href="pediatric.html" class="treatment-card">
          <div class="card-thumb"><i class="fas fa-child"></i></div>
          <div class="card-body"><span class="card-category">전문센터</span><h3>소아치과</h3><p>전문의 3인 상주, 수면진정 가능</p><span class="card-link">자세히 보기 <i class="fas fa-arrow-right"></i></span></div>
        </a>
        <a href="aesthetic.html" class="treatment-card">
          <div class="card-thumb"><i class="fas fa-gem"></i></div>
          <div class="card-body"><span class="card-category">전문센터</span><h3>심미치료</h3><p>라미네이트, 올세라믹, 미백, CAD/CAM</p><span class="card-link">자세히 보기 <i class="fas fa-arrow-right"></i></span></div>
        </a>
        <a href="scaling.html" class="treatment-card">
          <div class="card-thumb"><i class="fas fa-shield-virus"></i></div>
          <div class="card-body"><span class="card-category">예방</span><h3>스케일링/예방</h3><p>정기적 구강관리, 치석 제거</p><span class="card-link">자세히 보기 <i class="fas fa-arrow-right"></i></span></div>
        </a>
      </div>'''
    
    page += section("star", "전문센터", "전문", "진료센터", "각 분야 전문의가 최적의 치료를 제공합니다", specialty_cards)
    
    general_cards = '''
      <div class="info-grid cols-4 reveal">
        <a href="cavity.html" class="info-card" style="text-decoration:none;"><div class="card-icon"><i class="fas fa-tooth"></i></div><h3>충치치료</h3><p>레진, 인레이, 크라운</p></a>
        <a href="root-canal.html" class="info-card" style="text-decoration:none;"><div class="card-icon"><i class="fas fa-syringe"></i></div><h3>신경치료</h3><p>정밀 근관치료</p></a>
        <a href="gum.html" class="info-card" style="text-decoration:none;"><div class="card-icon"><i class="fas fa-heartbeat"></i></div><h3>잇몸치료</h3><p>치주질환 관리</p></a>
        <a href="wisdom-tooth.html" class="info-card" style="text-decoration:none;"><div class="card-icon"><i class="fas fa-procedures"></i></div><h3>사랑니 발치</h3><p>안전한 발치 전문</p></a>
        <a href="crown.html" class="info-card" style="text-decoration:none;"><div class="card-icon"><i class="fas fa-crown"></i></div><h3>크라운</h3><p>지르코니아, 세라믹</p></a>
        <a href="resin.html" class="info-card" style="text-decoration:none;"><div class="card-icon"><i class="fas fa-fill-drip"></i></div><h3>레진치료</h3><p>심미적 충치치료</p></a>
        <a href="tmj.html" class="info-card" style="text-decoration:none;"><div class="card-icon"><i class="fas fa-head-side-virus"></i></div><h3>턱관절장애</h3><p>TMJ 전문 치료</p></a>
        <a href="whitening.html" class="info-card" style="text-decoration:none;"><div class="card-icon"><i class="fas fa-sun"></i></div><h3>미백</h3><p>전문가 치아 미백</p></a>
      </div>'''
    
    page += section("stethoscope", "일반진료", "일반/보존", "진료 안내", "꼼꼼하고 정확한 기본 진료를 제공합니다", general_cards, "bg-warm")
    page += cta("..", "어떤 치료가 필요한지 모르겠다면?", "전문의 상담으로 정확한 진단을 받아보세요")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page("treatments/index.html", page)


def gen_treatment_detail(filename, title_ko, badge_icon, badge_text, desc, overview, steps, strengths, canonical_path):
    page = head(f"{title_ko} | 서울비디치과", f"서울비디치과 {title_ko} — {desc}", f"천안 {title_ko}, 서울비디치과 {title_ko}", canonical_path, title_ko, prefix="..")
    page += header("..")
    page += hero(badge_icon, badge_text, "서울비디치과", title_ko, desc, prefix="..", breadcrumb_parent="진료 안내", breadcrumb_parent_link="treatments/index.html", breadcrumb_current=title_ko)
    
    overview_html = f'''
      <div class="treatment-detail">
        <div class="treatment-overview reveal">
          <h2>{title_ko}란?</h2>
          <p>{overview}</p>
        </div>
      </div>'''
    page += section("info-circle", "개요", title_ko, "안내", f"서울비디치과의 {title_ko}를 안내합니다", overview_html)
    
    if steps:
        timeline = '<div class="treatment-detail"><div class="process-timeline reveal">'
        for step_title, step_desc in steps:
            timeline += f'<div class="process-step"><div class="step-dot"></div><h3>{step_title}</h3><p>{step_desc}</p></div>'
        timeline += '</div></div>'
        page += section("list-ol", "치료 과정", title_ko, "치료 과정", "체계적인 과정으로 안전하게 치료합니다", timeline, "bg-warm")
    
    if strengths:
        cards = '<div class="info-grid reveal">'
        for icon, s_title, s_desc in strengths:
            cards += f'<div class="info-card"><div class="card-icon"><i class="fas fa-{icon}"></i></div><h3>{s_title}</h3><p>{s_desc}</p></div>'
        cards += '</div>'
        page += section("star", "강점", "서울비디치과의", "강점", f"왜 서울비디치과에서 {title_ko}를 받아야 할까요?", cards)
    
    page += cta("..", f"{title_ko}, 궁금한 점이 있으신가요?", "전문의 상담으로 최적의 치료 계획을 세워드립니다")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page(filename, page)


# Treatment page definitions
TREATMENTS = [
    ("treatments/cavity.html", "충치치료", "tooth", "충치치료", "충치의 범위와 깊이에 따라 레진, 인레이, 크라운 등 최적의 치료를 제공합니다",
     "충치는 세균이 만들어내는 산에 의해 치아가 손상되는 질환입니다. 초기에 발견하면 간단한 레진 치료로 해결할 수 있지만, 방치하면 신경치료나 발치가 필요할 수 있습니다.",
     [("진단 및 촬영", "X-ray 및 구강 검진으로 충치 범위를 정확히 진단합니다"), ("치료 계획 수립", "충치 범위에 따라 레진, 인레이, 크라운 등 최적의 치료를 결정합니다"), ("충치 제거", "감염된 치아 조직을 정밀하게 제거합니다"), ("수복 치료", "선택한 재료로 치아를 원래 형태로 복원합니다"), ("경과 관찰", "치료 후 정기 검진으로 재발을 예방합니다")],
     [("search", "정밀 진단", "미세 충치까지 놓치지 않는 정밀 진단"), ("palette", "심미적 치료", "치아색과 동일한 자연스러운 레진 사용"), ("shield-alt", "예방 관리", "충치 재발 방지를 위한 정기 관리 프로그램")]),
    
    ("treatments/resin.html", "레진치료", "fill-drip", "레진치료", "치아색과 동일한 레진으로 자연스럽고 심미적인 충치 치료를 제공합니다",
     "레진 치료는 치아색과 동일한 복합 레진 소재를 사용하여 충치 부위를 수복하는 치료입니다. 심미적이면서도 치아 삭제량을 최소화할 수 있는 장점이 있습니다.",
     [("진단", "충치 범위와 깊이를 정확히 진단합니다"), ("충치 제거", "감염된 부위만 최소한으로 제거합니다"), ("레진 충전", "치아색에 맞는 레진을 정밀하게 충전합니다"), ("광중합", "특수 광선으로 레진을 경화시킵니다"), ("마무리", "교합 조정 및 연마로 자연스러운 형태를 만듭니다")],
     [("eye", "자연스러운 색상", "치아와 동일한 색상으로 티가 나지 않습니다"), ("cut", "최소 삭제", "건강한 치아 조직을 최대한 보존합니다"), ("clock", "당일 완료", "대부분 1회 방문으로 치료가 완료됩니다")]),
    
    ("treatments/crown.html", "크라운", "crown", "크라운", "지르코니아, 올세라믹 등 프리미엄 재료로 자연치아와 동일한 크라운을 제작합니다",
     "크라운은 손상되거나 약해진 치아를 보호하기 위해 치아 전체를 감싸는 보철물입니다. 신경치료 후, 심한 충치, 파절된 치아 등에 적용됩니다.",
     [("진단 및 상담", "치아 상태를 진단하고 적합한 크라운 재료를 상담합니다"), ("치아 삭제", "크라운이 들어갈 공간을 확보하기 위해 치아를 정밀 삭제합니다"), ("인상 채득", "디지털 스캔 또는 인상재로 정밀한 본을 뜹니다"), ("임시 크라운", "기공 기간 동안 임시 크라운을 장착합니다"), ("최종 장착", "맞춤 제작된 크라운을 장착하고 교합을 조정합니다")],
     [("gem", "프리미엄 재료", "지르코니아, 올세라믹 등 최고급 재료 사용"), ("microscope", "정밀 기공", "디지털 기공으로 정확한 적합도"), ("palette", "자연스러운 심미", "주변 치아와 조화되는 자연스러운 색상")]),
    
    ("treatments/inlay.html", "인레이/온레이", "puzzle-piece", "인레이", "충치 범위에 맞춘 맞춤형 보철로 치아를 정밀하게 수복합니다",
     "인레이/온레이는 중간 규모의 충치에 적용되는 맞춤형 보철 치료입니다. 레진 충전보다 내구성이 뛰어나고, 크라운보다 치아 삭제량이 적은 최적의 치료법입니다.",
     [("진단", "충치 범위를 정확히 진단합니다"), ("충치 제거 및 형성", "감염 부위를 제거하고 와동을 형성합니다"), ("인상 채득", "정밀한 본을 떠서 기공소에 보냅니다"), ("맞춤 제작", "금, 세라믹, 지르코니아 등으로 정밀 제작합니다"), ("접착", "제작된 인레이를 정밀하게 접착합니다")],
     [("ruler-combined", "정밀 적합", "디지털 기공으로 완벽한 적합도"), ("dumbbell", "높은 내구성", "레진보다 뛰어난 강도와 수명"), ("shield-alt", "치아 보존", "크라운보다 치아 삭제량이 적습니다")]),
    
    ("treatments/root-canal.html", "신경치료", "syringe", "신경치료", "정밀 근관치료로 자연치아를 최대한 보존합니다",
     "신경치료(근관치료)는 충치가 치수(신경)까지 진행되었을 때 감염된 신경을 제거하고 소독하여 치아를 보존하는 치료입니다.",
     [("진단", "X-ray로 감염 범위를 정확히 확인합니다"), ("마취 및 접근", "통증 없이 치아 내부에 접근합니다"), ("감염 제거", "감염된 신경 조직을 완전히 제거합니다"), ("근관 세척 및 성형", "근관 내부를 철저히 세척하고 성형합니다"), ("충전 및 보철", "근관을 밀봉하고 크라운으로 보호합니다")],
     [("crosshairs", "정밀 치료", "미세현미경 활용 정밀 근관치료"), ("tooth", "치아 보존", "자연치아를 살리는 것이 최우선"), ("user-md", "전문의 진료", "보존과 전문의가 직접 치료")]),
    
    ("treatments/whitening.html", "미백", "sun", "치아미백", "전문가 치아 미백으로 밝고 자신감 있는 미소를 되찾아 드립니다",
     "전문가 치아 미백은 치과에서 안전하게 진행되는 시술로, 집에서 하는 셀프 미백보다 효과적이고 안전합니다.",
     [("구강 검진", "미백 전 구강 상태를 확인합니다"), ("스케일링", "치석과 착색을 제거합니다"), ("미백 시술", "전문 미백제를 도포하고 광선을 조사합니다"), ("결과 확인", "미백 전후 색상을 비교합니다")],
     [("shield-alt", "안전한 시술", "치과 전문의가 직접 관리"), ("magic", "확실한 효과", "셀프 미백 대비 뚜렷한 효과"), ("clock", "빠른 시술", "1~2회 방문으로 완료")]),
    
    ("treatments/scaling.html", "스케일링", "shield-virus", "스케일링", "정기적인 스케일링으로 치석을 제거하고 잇몸 건강을 유지합니다",
     "스케일링은 잇몸과 치아 사이에 쌓인 치석을 제거하는 예방 치료입니다. 연 1회 건강보험이 적용되어 부담 없이 받으실 수 있습니다.",
     [("구강 검진", "잇몸 상태와 치석 분포를 확인합니다"), ("초음파 스케일링", "초음파 기구로 치석을 제거합니다"), ("미세 치석 제거", "수기구로 미세 치석을 꼼꼼히 제거합니다"), ("연마", "치아 표면을 매끄럽게 연마합니다"), ("불소 도포", "치아를 강화하는 불소를 도포합니다")],
     [("won-sign", "건강보험", "연 1회 건강보험 적용 (만 19세 이상)"), ("heartbeat", "잇몸 건강", "치주질환 예방의 첫걸음"), ("calendar-check", "정기 관리", "3~6개월 주기 정기 스케일링 추천")]),
    
    ("treatments/gum.html", "잇몸치료", "heartbeat", "잇몸치료", "잇몸 출혈, 부종, 치주질환을 체계적으로 치료합니다",
     "잇몸 치료는 잇몸의 염증과 치주질환을 치료하는 과정입니다. 잇몸 출혈, 부종, 구취 등이 있다면 조기 치료가 중요합니다.",
     [("진단", "잇몸 상태와 치조골을 정밀 진단합니다"), ("스케일링 및 치근활택술", "치석을 제거하고 치근면을 매끄럽게 합니다"), ("약물 치료", "필요시 항생제 및 소독제를 적용합니다"), ("경과 관찰", "치료 후 잇몸 상태를 주기적으로 확인합니다")],
     [("stethoscope", "정밀 진단", "잇몸 상태를 정밀하게 진단"), ("procedures", "체계적 치료", "단계별 체계적 잇몸 관리"), ("calendar-check", "정기 관리", "재발 방지를 위한 관리 프로그램")]),
    
    ("treatments/periodontitis.html", "치주염", "disease", "치주염", "치주염의 진행을 막고 치아와 잇몸을 보존합니다",
     "치주염은 잇몸과 치조골까지 감염이 진행된 상태입니다. 방치하면 치아 상실로 이어질 수 있어 조기 치료가 매우 중요합니다.",
     [("정밀 진단", "치주낭 검사, X-ray로 골손실 정도를 확인합니다"), ("비수술적 치료", "스케일링, 치근활택술로 감염을 제거합니다"), ("수술적 치료", "심한 경우 잇몸 수술, 골이식을 시행합니다"), ("유지 관리", "정기적 관리로 재발을 예방합니다")],
     [("search-plus", "정밀 진단", "치주낭 검사로 정확한 진단"), ("user-md", "전문의 치료", "치주과 전문의가 직접 치료"), ("sync-alt", "체계적 관리", "재발 방지를 위한 유지 관리 프로그램")]),
    
    ("treatments/wisdom-tooth.html", "사랑니 발치", "procedures", "사랑니", "안전하고 통증 최소화된 사랑니 발치를 시행합니다",
     "사랑니(제3대구치)는 나이가 들면서 문제를 일으킬 수 있습니다. 매복, 비정상 위치, 충치, 주변 치아 손상 등이 있을 때 발치를 고려합니다.",
     [("정밀 진단", "CT 촬영으로 사랑니의 위치와 신경 근접도를 확인합니다"), ("마취", "충분한 마취로 시술 중 통증을 최소화합니다"), ("발치", "구강악안면외과 전문의가 안전하게 발치합니다"), ("지혈 및 봉합", "출혈을 조절하고 필요시 봉합합니다"), ("사후 관리", "소독 및 경과 관찰을 진행합니다")],
     [("user-md", "외과 전문의", "구강악안면외과 전문의가 시술"), ("x-ray", "CT 진단", "3D CT로 안전한 발치 계획"), ("heart", "통증 최소화", "수면진정 및 섬세한 마취 기법")]),
    
    ("treatments/tmj.html", "턱관절장애", "head-side-virus", "턱관절", "턱관절 통증, 소리, 개구제한 등을 전문적으로 치료합니다",
     "턱관절장애(TMD)는 턱관절과 주변 근육의 기능 이상으로 발생하는 질환입니다. 턱 통증, 클릭 소리, 입 벌리기 어려움 등의 증상이 나타납니다.",
     [("문진 및 검사", "증상과 턱관절 기능을 정밀 검사합니다"), ("진단", "X-ray, CT 등으로 원인을 분석합니다"), ("보존적 치료", "약물, 물리치료, 교합 안정 장치를 적용합니다"), ("경과 관찰", "치료 반응을 확인하고 조절합니다")],
     [("brain", "정확한 진단", "원인에 따른 맞춤 진단"), ("pills", "보존적 치료", "비수술적 방법 우선"), ("sync-alt", "통합 관리", "교합, 근육, 관절을 종합적으로 관리")]),
    
    ("treatments/bruxism.html", "이갈이/이악물기", "teeth", "이갈이", "이갈이와 이악물기로 인한 치아 손상과 턱관절 문제를 예방합니다",
     "이갈이(bruxism)는 수면 중 또는 낮 시간에 무의식적으로 이를 갈거나 악무는 습관입니다. 치아 마모, 파절, 턱관절 통증, 두통 등을 유발합니다.",
     [("진단", "치아 마모 패턴과 턱관절을 검사합니다"), ("맞춤 장치 제작", "환자에 맞는 나이트가드를 제작합니다"), ("장착 및 조정", "장치를 장착하고 교합을 정밀 조정합니다"), ("경과 관찰", "주기적으로 상태를 확인하고 관리합니다")],
     [("moon", "수면 보호", "맞춤형 나이트가드로 수면 중 보호"), ("tooth", "치아 보존", "마모와 파절 방지"), ("user-md", "전문 관리", "주기적 점검 및 장치 조정")]),
    
    ("treatments/bridge.html", "브릿지", "link", "브릿지", "인접 치아를 이용한 고정식 보철로 빈 공간을 수복합니다",
     "브릿지는 상실된 치아의 양쪽 인접 치아를 지대치로 사용하여 연결 보철물을 장착하는 치료입니다.",
     [("진단 및 상담", "지대치 상태와 브릿지 적합성을 평가합니다"), ("지대치 삭제", "양쪽 치아를 크라운에 맞게 삭제합니다"), ("인상 채득", "정밀한 본을 떠서 기공소에 보냅니다"), ("최종 장착", "맞춤 제작된 브릿지를 장착합니다")],
     [("link", "안정적 고정", "인접 치아에 견고하게 고정"), ("clock", "빠른 치료", "임플란트 대비 빠른 치료 기간"), ("palette", "자연스러운 심미", "주변 치아와 조화되는 색상")]),
    
    ("treatments/denture.html", "틀니", "teeth-open", "틀니", "자연스럽고 편안한 맞춤형 의치를 제작합니다",
     "틀니(의치)는 다수의 치아가 상실되었을 때 기능과 심미를 회복하는 치료입니다. 부분 틀니와 완전 틀니가 있습니다.",
     [("진단 및 상담", "잔존 치아와 잇몸 상태를 평가합니다"), ("인상 채득", "정밀한 구강 본을 뜹니다"), ("교합 기록", "위아래 치아의 관계를 기록합니다"), ("시적", "제작 중간 단계에서 적합도를 확인합니다"), ("최종 장착", "맞춤 틀니를 장착하고 조정합니다")],
     [("hand-holding-heart", "맞춤 제작", "환자별 구강 구조에 맞는 정밀 제작"), ("smile", "자연스러운 심미", "자연치아와 유사한 외관"), ("sync-alt", "세심한 조정", "착용감을 위한 세밀한 조정")]),
    
    ("treatments/emergency.html", "응급진료", "ambulance", "응급진료", "365일 운영으로 치과 응급상황에 빠르게 대처합니다",
     "치통, 외상, 보철물 탈락 등 치과 응급상황은 예고 없이 발생합니다. 서울비디치과는 365일 진료로 신속하게 대처합니다.",
     [("응급 접수", "전화 또는 직접 방문으로 응급 접수합니다"), ("응급 처치", "통증 완화 및 응급 처치를 시행합니다"), ("정밀 진단", "X-ray 등으로 정확한 상태를 확인합니다"), ("치료 계획", "응급 처치 후 본격적인 치료 계획을 수립합니다")],
     [("clock", "365일 진료", "연중무휴 응급 대응"), ("bolt", "신속한 처치", "빠른 통증 완화"), ("phone", "전화 상담", "방문 전 전화 상담 가능 (041-415-2892)")]),
    
    ("treatments/prevention.html", "예방치료", "shield-alt", "예방치료", "정기 검진과 예방 관리로 구강 건강을 지킵니다",
     "예방치료는 질환이 발생하기 전에 미리 관리하는 것입니다. 정기 검진, 스케일링, 불소 도포, 실란트 등을 통해 구강 건강을 유지합니다.",
     [("구강 검진", "전반적인 구강 상태를 점검합니다"), ("스케일링", "치석을 제거하여 잇몸 건강을 유지합니다"), ("불소 도포", "치아를 강화하여 충치를 예방합니다"), ("실란트", "어금니 홈을 메워 충치를 예방합니다"), ("맞춤 관리 계획", "개인별 예방 관리 계획을 수립합니다")],
     [("calendar-check", "정기 검진", "3~6개월 주기 정기 검진 추천"), ("won-sign", "건강보험 적용", "스케일링 연 1회 건강보험"), ("heartbeat", "조기 발견", "문제 조기 발견으로 치료비 절감")]),
    
    ("treatments/gum-surgery.html", "잇몸수술", "cut", "잇몸수술", "심한 치주질환에 대한 전문적인 잇몸 수술을 시행합니다",
     "잇몸수술은 비수술적 치료만으로는 해결되지 않는 심한 치주질환에 적용됩니다. 잇몸을 절개하여 깊은 치석과 감염 조직을 제거합니다.",
     [("정밀 진단", "치주낭 깊이와 골손실을 정밀 평가합니다"), ("수술 계획", "맞춤 수술 계획을 수립합니다"), ("잇몸 수술", "잇몸을 절개하고 감염 조직을 제거합니다"), ("골이식", "필요시 골이식을 시행합니다"), ("봉합 및 관리", "봉합 후 경과를 관찰합니다")],
     [("user-md", "전문의 시술", "치주과 전문의가 직접 수술"), ("microscope", "정밀 수술", "미세 수술 기법 적용"), ("sync-alt", "사후 관리", "체계적인 수술 후 관리")]),
    
    ("treatments/re-root-canal.html", "재신경치료", "redo", "재신경치료", "이전 신경치료가 실패한 경우 재치료로 치아를 보존합니다",
     "재신경치료는 이전에 시행한 신경치료가 실패하여 재감염이 발생한 경우에 시행합니다. 기존 충전물을 제거하고 다시 깨끗하게 세척 후 충전합니다.",
     [("진단", "기존 신경치료 실패 원인을 분석합니다"), ("기존 충전물 제거", "이전 충전물을 안전하게 제거합니다"), ("재세척 및 소독", "근관을 다시 철저히 세척합니다"), ("재충전", "근관을 다시 밀봉합니다"), ("보철", "크라운 등으로 치아를 보호합니다")],
     [("undo", "재치료 전문", "실패한 신경치료 재치료 경험"), ("microscope", "미세현미경", "미세현미경으로 정밀 치료"), ("tooth", "치아 보존", "발치 전 마지막 보존 치료")]),
    
    ("treatments/apicoectomy.html", "치근단절제술", "scalpel", "치근단절제술", "신경치료만으로 해결되지 않는 치근단 감염을 수술로 치료합니다",
     "치근단절제술은 치아 뿌리 끝(치근단)에 감염이 남아있어 재신경치료로도 해결이 어려운 경우에 시행하는 미세 수술입니다.",
     [("진단", "CT로 감염 범위와 해부학적 구조를 확인합니다"), ("마취", "부위마취로 통증을 차단합니다"), ("잇몸 절개", "잇몸을 절개하여 치근단에 접근합니다"), ("감염 제거 및 절단", "감염된 치근단을 절단하고 감염 조직을 제거합니다"), ("봉합", "봉합 후 경과를 관찰합니다")],
     [("user-md", "외과 전문의", "구강악안면외과 전문의 시술"), ("tooth", "치아 보존", "발치를 피하고 자연치아 보존"), ("microscope", "미세 수술", "정밀한 미세수술 기법 적용")]),
]

def gen_all_treatments():
    for args in TREATMENTS:
        gen_treatment_detail(*args, canonical_path=args[0])

# ─── BDX ───
def gen_bdx():
    page = head("BDX 검진센터 | 서울비디치과", "서울비디치과 BDX 종합 구강검진 — 첫 방문 무료! CT, 파노라마, 구강 사진, 잇몸 검사까지 종합 구강 검진.", "천안 구강검진, BDX 검진, 서울비디치과 검진, 무료 검진", "bdx/index.html", "BDX 검진센터", prefix="..")
    page += header("..")
    page += hero("microscope", "BDX 검진센터", "BDX 종합", "구강검진", "첫 방문 검진 무료! 30분 안에 구강 상태를 완전히 파악합니다", stats=[("무료", "첫 방문 검진"), ("30분", "소요 시간"), ("3D CT", "정밀 촬영")], prefix="..", breadcrumb_current="BDX 검진센터")
    
    steps_html = '''
      <div class="bdx-step-grid reveal">
        <div class="bdx-step-card"><h3>접수 및 문진</h3><p>기본 정보 작성 및 현재 증상, 병력을 확인합니다</p></div>
        <div class="bdx-step-card"><h3>정밀 촬영</h3><p>파노라마 X-ray, 3D CT, 구강 내 사진을 촬영합니다</p></div>
        <div class="bdx-step-card"><h3>종합 검진</h3><p>충치, 잇몸, 교합, 턱관절 등을 종합적으로 검사합니다</p></div>
        <div class="bdx-step-card"><h3>결과 상담</h3><p>검진 결과를 상세히 설명하고 맞춤 치료 계획을 안내합니다</p></div>
      </div>'''
    
    page += section("clipboard-list", "검진 과정", "BDX 검진", "과정 안내", "체계적인 4단계 검진 프로세스", steps_html)
    
    items_html = '''
      <div class="info-grid reveal">
        <div class="info-card"><div class="card-icon"><i class="fas fa-x-ray"></i></div><h3>파노라마 X-ray</h3><p>전체 치아와 턱뼈를 한 장으로 촬영</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-cube"></i></div><h3>3D CT</h3><p>입체적 영상으로 정밀 진단</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-camera"></i></div><h3>구강 내 사진</h3><p>현재 구강 상태를 기록</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-heartbeat"></i></div><h3>잇몸 검사</h3><p>치주낭 깊이, 출혈 여부 확인</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-teeth"></i></div><h3>교합 검사</h3><p>위아래 치아의 맞물림 상태</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-file-medical"></i></div><h3>검진 리포트</h3><p>결과를 보기 쉽게 정리하여 제공</p></div>
      </div>'''
    
    page += section("search", "검진 항목", "종합 구강", "검진 항목", "놓치기 쉬운 구강 문제까지 철저히 검사합니다", items_html, "bg-warm")
    page += cta("..", "첫 방문 구강검진, 무료입니다", "지금 바로 BDX 검진을 예약하세요")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page("bdx/index.html", page)


def gen_column():
    page = head("칼럼 | 서울비디치과", "서울비디치과 치과 칼럼 — 치과 전문의가 전하는 유용한 구강 건강 정보.", "치과 칼럼, 구강 건강 정보, 서울비디치과 칼럼", "column/columns.html", "칼럼", prefix="..")
    page += header("..")
    page += hero("pen-fancy", "칼럼", "서울비디치과", "칼럼", "전문의가 전하는 유용한 구강 건강 정보", prefix="..", breadcrumb_current="칼럼")
    
    content = '''
      <div class="post-list reveal">
        <a href="#" class="post-item"><span class="post-badge">NEW</span><span class="post-title">임플란트 수명을 늘리는 5가지 관리법</span><span class="post-date">2026.02.08</span></a>
        <a href="#" class="post-item"><span class="post-title">인비절라인 vs 세라믹 교정 — 나에게 맞는 교정은?</span><span class="post-date">2026.02.01</span></a>
        <a href="#" class="post-item"><span class="post-title">아이 첫 치과 방문, 언제가 좋을까?</span><span class="post-date">2026.01.25</span></a>
        <a href="#" class="post-item"><span class="post-title">스케일링은 왜 6개월마다 해야 할까?</span><span class="post-date">2026.01.18</span></a>
        <a href="#" class="post-item"><span class="post-title">치아 미백 후 주의사항 총정리</span><span class="post-date">2026.01.11</span></a>
        <a href="#" class="post-item"><span class="post-title">사랑니 발치, 꼭 해야 하나요?</span><span class="post-date">2026.01.04</span></a>
      </div>'''
    
    page += section("pen-fancy", "칼럼", "최신", "칼럼", "치과 전문의가 작성한 유용한 구강 건강 정보", content)
    page += cta("..")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page("column/columns.html", page)


def gen_video():
    page = head("영상 | 서울비디치과", "서울비디치과 영상 콘텐츠 — 치과 치료 과정, 시설 소개, 건강 정보 영상.", "서울비디치과 영상, 치과 영상, 유튜브", "video/index.html", "영상", prefix="..")
    page += header("..")
    page += hero("play-circle", "영상", "서울비디치과", "영상", "치료 과정, 시설 소개, 구강 건강 정보를 영상으로 확인하세요", prefix="..", breadcrumb_current="영상")
    
    content = '''
      <div class="video-grid reveal">
        <div class="video-card"><div class="video-thumb" style="background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;"><div class="play-btn"><i class="fas fa-play"></i></div></div><div class="video-body"><h3>서울비디치과 시설 소개</h3><p>400평 5층 전문센터를 소개합니다</p></div></div>
        <div class="video-card"><div class="video-thumb" style="background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;"><div class="play-btn"><i class="fas fa-play"></i></div></div><div class="video-body"><h3>임플란트 수술 과정</h3><p>안전한 임플란트 시술의 모든 것</p></div></div>
        <div class="video-card"><div class="video-thumb" style="background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;"><div class="play-btn"><i class="fas fa-play"></i></div></div><div class="video-body"><h3>인비절라인 교정 후기</h3><p>실제 환자의 교정 경험담</p></div></div>
      </div>'''
    
    page += section("play-circle", "영상", "최신", "영상 콘텐츠", "서울비디치과의 다양한 영상을 확인하세요", content)
    page += cta("..")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page("video/index.html", page)


def gen_cases():
    page = head("비포/애프터 | 서울비디치과", "서울비디치과 치료 사례 — 실제 환자의 치료 전후 사진을 확인하세요.", "치과 비포애프터, 서울비디치과 사례, 임플란트 사례, 교정 사례", "cases/gallery.html", "비포/애프터", prefix="..")
    page += header("..")
    page += hero("images", "비포/애프터", "치료", "비포/애프터", "실제 환자분의 치료 전후 사례를 확인하세요", prefix="..", breadcrumb_current="비포/애프터")
    
    content = '''
      <div class="max-w-800">
        <div class="notice-callout reveal">
          <div class="callout-icon"><i class="fas fa-lock"></i></div>
          <div class="callout-content">
            <h4>비포/애프터 열람 안내</h4>
            <p>치료 전후 사진은 의료법에 의거하여 로그인 후 열람 가능합니다. 회원가입 후 이용해 주세요.</p>
            <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;">
              <a href="../auth/login.html" class="btn btn-primary btn-sm"><i class="fas fa-sign-in-alt"></i> 로그인</a>
              <a href="../auth/register.html" class="btn btn-outline btn-sm"><i class="fas fa-user-plus"></i> 회원가입</a>
            </div>
          </div>
        </div>
      </div>'''
    
    page += section("images", "사례 갤러리", "치료", "사례 갤러리", "다양한 진료 분야의 실제 치료 사례를 제공합니다", content)
    page += cta("..")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page("cases/gallery.html", page)


def gen_notice():
    page = head("공지사항 | 서울비디치과", "서울비디치과 공지사항 — 진료시간 변경, 이벤트, 중요 안내사항.", "서울비디치과 공지사항, 천안치과 공지", "notice/index.html", "공지사항", prefix="..")
    page += header("..")
    page += hero("bullhorn", "공지사항", "서울비디치과", "공지사항", "진료시간 변경, 이벤트 등 중요한 안내사항을 확인하세요", prefix="..", breadcrumb_current="공지사항")
    
    content = '''
      <div class="post-list reveal">
        <a href="#" class="post-item"><span class="post-badge">중요</span><span class="post-title">2026년 설 연휴 진료 안내</span><span class="post-date">2026.02.05</span></a>
        <a href="#" class="post-item"><span class="post-title">BDX 구강검진 첫 방문 무료 이벤트 연장</span><span class="post-date">2026.01.28</span></a>
        <a href="#" class="post-item"><span class="post-title">5층 검진센터 리뉴얼 오픈 안내</span><span class="post-date">2026.01.15</span></a>
        <a href="#" class="post-item"><span class="post-title">2026년 인비절라인 프로모션 안내</span><span class="post-date">2026.01.02</span></a>
      </div>'''
    
    page += section("bullhorn", "공지사항", "최신", "공지사항", "중요한 소식과 안내사항을 확인하세요", content)
    page += cta("..")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page("notice/index.html", page)


def gen_area(city_en, city_ko, distance, drive_time):
    page = head(f"{city_ko} 치과 추천 | 서울비디치과", f"{city_ko}에서 서울비디치과까지 차로 {drive_time}! 서울대 15인 원장 365일 진료. {city_ko} 임플란트·교정 추천.", f"{city_ko} 치과, {city_ko} 임플란트, {city_ko} 교정, {city_ko} 치과 추천", f"area/{city_en}.html", f"{city_ko} 치과", prefix="..")
    page += header("..")
    page += hero("map-marker-alt", f"{city_ko} 치과", f"{city_ko}에서", "가까운 전문 치과", f"차로 {drive_time} — {city_ko}에서 편하게 내원하실 수 있습니다", 
                  stats=[("15인", "서울대 원장"), ("365일", "진료"), (drive_time, f"{city_ko}에서")],
                  prefix="..", breadcrumb_current=f"{city_ko} 치과")
    
    strengths_html = '''
      <div class="info-grid reveal">
        <div class="info-card"><div class="card-icon"><i class="fas fa-graduation-cap"></i></div><h3>서울대 15인 원장</h3><p>서울대 출신 15인 원장이 협진합니다</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-calendar-check"></i></div><h3>365일 진료</h3><p>일요일·공휴일·야간 진료 가능</p></div>
        <div class="info-card"><div class="card-icon"><i class="fas fa-building"></i></div><h3>400평 5층 규모</h3><p>전문센터별 층 분류 운영</p></div>
      </div>'''
    
    page += section("star", "강점", f"{city_ko} 환자분이", "서울비디치과를 선택하는 이유", f"많은 {city_ko} 환자분이 서울비디치과를 신뢰합니다", strengths_html)
    page += cta("..", f"{city_ko}에서 오시나요?", f"차로 {drive_time}이면 서울비디치과에 도착합니다")
    page += footer("..")
    page += '\n</body>\n</html>'
    write_page(f"area/{city_en}.html", page)


def gen_misc_pages():
    # 404
    page = head("페이지를 찾을 수 없습니다 | 서울비디치과", "요청하신 페이지를 찾을 수 없습니다.", "서울비디치과, 404", "404.html", "404")
    page += header()
    page += '''
  <main id="main-content" role="main">
    <div class="error-page">
      <div>
        <div class="error-code">404</div>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <a href="/" class="btn btn-primary btn-lg"><i class="fas fa-home"></i> 홈으로 돌아가기</a>
      </div>
    </div>
'''
    page += footer()
    page += '\n</body>\n</html>'
    write_page("404.html", page)
    
    # Privacy
    page = head("개인정보 처리방침 | 서울비디치과", "서울비디치과 개인정보 처리방침", "개인정보, 서울비디치과", "privacy.html", "개인정보 처리방침")
    page += header()
    page += hero("shield-alt", "개인정보", "개인정보", "처리방침", "서울비디치과의 개인정보 처리방침을 안내합니다", breadcrumb_current="개인정보 처리방침")
    page += '''
  <section class="content-section">
    <div class="container">
      <div class="legal-content reveal">
        <h2>1. 개인정보의 수집 및 이용 목적</h2>
        <p>서울비디치과는 진료 예약, 상담, 서비스 제공을 위해 최소한의 개인정보를 수집합니다.</p>
        <ul><li>진료 예약 및 상담: 이름, 연락처, 생년월일</li><li>서비스 제공: 진료 기록, 구강 사진</li><li>마케팅: 이메일 (선택, 별도 동의)</li></ul>
        
        <h2>2. 개인정보의 보유 및 이용 기간</h2>
        <p>진료 기록은 의료법에 따라 10년간 보관합니다. 마케팅 목적의 정보는 동의 철회 시 즉시 파기합니다.</p>
        
        <h2>3. 개인정보의 제3자 제공</h2>
        <p>서울비디치과는 환자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의거한 경우는 예외입니다.</p>
        
        <h2>4. 개인정보 보호 책임자</h2>
        <p>개인정보 보호 책임자: 문석준 (대표원장)<br>연락처: 041-415-2892<br>이메일: info@bdbddc.com</p>
        
        <h2>5. 정보주체의 권리</h2>
        <p>환자분은 언제든지 개인정보의 열람, 정정, 삭제, 처리 정지를 요구하실 수 있습니다.</p>
        
        <p style="margin-top:var(--space-8);color:var(--text-muted);">시행일: 2024년 1월 1일 | 최종 개정: 2026년 1월 1일</p>
      </div>
    </div>
  </section>
'''
    page += footer()
    page += '\n</body>\n</html>'
    write_page("privacy.html", page)
    
    # Terms
    page = head("이용약관 | 서울비디치과", "서울비디치과 웹사이트 이용약관", "이용약관, 서울비디치과", "terms.html", "이용약관")
    page += header()
    page += hero("file-contract", "이용약관", "서비스", "이용약관", "서울비디치과 웹사이트 이용약관을 안내합니다", breadcrumb_current="이용약관")
    page += '''
  <section class="content-section">
    <div class="container">
      <div class="legal-content reveal">
        <h2>제1조 (목적)</h2>
        <p>본 약관은 서울비디치과(이하 "병원")가 운영하는 웹사이트(bdbddc.com)의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
        
        <h2>제2조 (용어의 정의)</h2>
        <p>"이용자"란 본 웹사이트에 접속하여 서비스를 이용하는 모든 사람을 말합니다. "서비스"란 병원이 웹사이트를 통해 제공하는 온라인 예약, 진료 정보, 콘텐츠 등을 말합니다.</p>
        
        <h2>제3조 (서비스의 내용)</h2>
        <ul><li>온라인 진료 예약</li><li>진료 안내 및 비용 정보</li><li>치과 건강 정보 (칼럼, 영상)</li><li>병원 소개 및 의료진 정보</li></ul>
        
        <h2>제4조 (면책사항)</h2>
        <p>본 웹사이트의 의료 정보는 일반적인 안내 목적이며, 전문 의료 상담을 대체하지 않습니다. 정확한 진단과 치료는 반드시 내원 상담을 통해 이루어집니다.</p>
        
        <p style="margin-top:var(--space-8);color:var(--text-muted);">시행일: 2024년 1월 1일 | 최종 개정: 2026년 1월 1일</p>
      </div>
    </div>
  </section>
'''
    page += footer()
    page += '\n</body>\n</html>'
    write_page("terms.html", page)


# ══════════════════════════════════════════════
# MAIN — Generate all pages
# ══════════════════════════════════════════════
if __name__ == "__main__":
    print("=== 서울비디치과 전체 서브페이지 생성 시작 ===\n")
    
    print("[1/8] FAQ...")
    gen_faq()
    
    print("[2/8] Directions...")
    gen_directions()
    
    print("[3/8] Floor Guide...")
    gen_floor_guide()
    
    print("[4/8] Reservation...")
    gen_reservation()
    
    print("[5/8] Doctors...")
    gen_doctors_index()
    
    print("[6/8] Treatments...")
    gen_treatments_index()
    gen_all_treatments()
    
    print("[7/8] Content pages (BDX, Column, Video, Cases, Notice)...")
    gen_bdx()
    gen_column()
    gen_video()
    gen_cases()
    gen_notice()
    
    print("[8/8] Area pages...")
    areas = [
        ("cheonan", "천안", "10km", "10분"),
        ("asan", "아산", "15km", "15분"),
        ("sejong", "세종", "40km", "40분"),
        ("daejeon", "대전", "60km", "50분"),
        ("cheongju", "청주", "70km", "55분"),
        ("pyeongtaek", "평택", "55km", "50분"),
        ("dangjin", "당진", "45km", "40분"),
        ("seosan", "서산", "65km", "55분"),
        ("gongju", "공주", "35km", "35분"),
        ("nonsan", "논산", "50km", "45분"),
        ("hongseong", "홍성", "55km", "50분"),
        ("yesan", "예산", "40km", "35분"),
        ("chungju", "충주", "80km", "1시간"),
        ("jincheon", "진천", "45km", "40분"),
        ("anseong", "안성", "50km", "45분"),
        ("buldang", "불당동", "3km", "5분"),
    ]
    for city_en, city_ko, dist, drive in areas:
        gen_area(city_en, city_ko, dist, drive)
    
    print("\n[Extra] Misc pages (404, Privacy, Terms)...")
    gen_misc_pages()
    
    print("\n=== 모든 페이지 생성 완료! ===")
