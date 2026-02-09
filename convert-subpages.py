#!/usr/bin/env python3
"""
서울비디치과 서브페이지 일괄 변환 스크립트
- 다크 테마(v3) → 라이트 테마(v4) 변환
- 인라인 CSS 제거, 외부 CSS로 통합
- 헤더/푸터/모바일 네비/플로팅 CTA 표준화
- SEO 최적화 (Schema 정리, 날짜 업데이트)
"""

import os
import re
import glob

BASE_DIR = '/home/user/webapp'

# ═══════════════════════════════════════
# 공통 HEAD 템플릿 (페이지별 변수 치환)
# ═══════════════════════════════════════
def build_head(title, description, keywords, canonical_path, og_image, breadcrumb_json, extra_schema='', depth=1):
    prefix = '../' * depth
    css_prefix = '/' if depth == 0 else prefix
    
    return f'''<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  
  <!-- Primary SEO -->
  <title>{title} | 서울비디치과</title>
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="google-site-verification" content="google17dbe9a80407755e">
  <link rel="canonical" href="https://bdbddc.com/{canonical_path}">
  
  <!-- Geo & Local SEO -->
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  
  <!-- AEO -->
  <meta name="subject" content="{keywords}">
  <meta name="abstract" content="{description}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:title" content="{title} | 서울비디치과">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="https://bdbddc.com/{canonical_path}">
  <meta property="og:image" content="https://bdbddc.com/{og_image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="ko_KR">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title} | 서울비디치과">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="https://bdbddc.com/{og_image}">
  
  <!-- E-E-A-T -->
  <meta name="medical-content" content="이 페이지의 의료 정보는 서울대학교 출신 치과 전문의가 검토하였습니다.">
  
  <!-- Favicon & PWA -->
  <link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#6B4226">
  
  <!-- Preconnect -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  
  <!-- Fonts & Icons (non-blocking) -->
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  
  <!-- Stylesheets — v4.0 -->
  <link rel="stylesheet" href="/css/design-system-v4.css">
  <link rel="stylesheet" href="/css/subpage-v4.css">
  
  <!-- Prefetch -->
  <link rel="prefetch" href="{prefix}reservation.html" as="document">
  
  <!-- Schema.org — BreadcrumbList -->
  <script type="application/ld+json">
  {breadcrumb_json}
  </script>
  {extra_schema}
</head>'''


# ═══════════════════════════════════════
# 공통 HEADER 
# ═══════════════════════════════════════
def build_header(depth=1):
    p = '../' * depth  # prefix for relative links
    return f'''<body>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  
  <header class="site-header" id="siteHeader">
    <div class="header-container">
      <div class="header-brand">
        <a href="{p}index.html" class="site-logo" aria-label="서울비디치과 홈">
          <span class="logo-icon">🦷</span>
          <span class="logo-text">서울비디치과</span>
        </a>
        <div class="clinic-status open" aria-live="polite">
          <span class="status-dot"></span>
          <span class="status-text">진료중</span>
          <span class="status-time">20:00까지</span>
        </div>
      </div>
      
      <nav class="main-nav" id="mainNav" aria-label="메인 네비게이션">
        <ul>
          <li class="nav-item has-dropdown">
            <a href="{p}treatments/index.html">진료 안내</a>
            <div class="mega-dropdown">
              <div class="mega-dropdown-grid">
                <div class="mega-dropdown-section">
                  <h4>전문센터</h4>
                  <ul>
                    <li><a href="{p}treatments/glownate.html">✨ 글로우네이트 <span class="badge badge-hot">HOT</span></a></li>
                    <li><a href="{p}treatments/implant.html">임플란트 <span class="badge">6개 수술실</span></a></li>
                    <li><a href="{p}treatments/invisalign.html">치아교정 <span class="badge">대규모</span></a></li>
                    <li><a href="{p}treatments/pediatric.html">소아치과 <span class="badge">전문의 3인</span></a></li>
                    <li><a href="{p}treatments/aesthetic.html">심미치료</a></li>
                  </ul>
                </div>
                <div class="mega-dropdown-section">
                  <h4>일반/보존 진료</h4>
                  <ul>
                    <li><a href="{p}treatments/cavity.html">충치치료</a></li>
                    <li><a href="{p}treatments/resin.html">레진치료</a></li>
                    <li><a href="{p}treatments/crown.html">크라운</a></li>
                    <li><a href="{p}treatments/inlay.html">인레이/온레이</a></li>
                    <li><a href="{p}treatments/root-canal.html">신경치료</a></li>
                    <li><a href="{p}treatments/whitening.html">미백</a></li>
                  </ul>
                </div>
                <div class="mega-dropdown-section">
                  <h4>잇몸/외과</h4>
                  <ul>
                    <li><a href="{p}treatments/scaling.html">스케일링</a></li>
                    <li><a href="{p}treatments/gum.html">잇몸치료</a></li>
                    <li><a href="{p}treatments/periodontitis.html">치주염</a></li>
                    <li><a href="{p}treatments/wisdom-tooth.html">사랑니 발치</a></li>
                    <li><a href="{p}treatments/tmj.html">턱관절장애</a></li>
                    <li><a href="{p}treatments/bruxism.html">이갈이/이악물기</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </li>
          <li class="nav-item"><a href="{p}doctors/index.html">의료진 소개</a></li>
          <li class="nav-item"><a href="{p}bdx/index.html">검진센터</a></li>
          <li class="nav-item has-dropdown">
            <a href="{p}column/columns.html">콘텐츠</a>
            <ul class="simple-dropdown">
              <li><a href="{p}column/columns.html"><i class="fas fa-pen-fancy"></i> 칼럼</a></li>
              <li><a href="{p}video/index.html"><i class="fab fa-youtube"></i> 영상</a></li>
              <li><a href="{p}cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li>
            </ul>
          </li>
          <li class="nav-item has-dropdown">
            <a href="{p}directions.html">병원 안내</a>
            <ul class="simple-dropdown">
              <li><a href="{p}pricing.html" class="nav-highlight">💰 비용 안내</a></li>
              <li><a href="{p}floor-guide.html">층별 안내</a></li>
              <li><a href="{p}directions.html">오시는 길</a></li>
              <li><a href="{p}faq.html">자주 묻는 질문</a></li>
              <li><a href="{p}notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li>
            </ul>
          </li>
        </ul>
      </nav>
      
      <div class="header-actions">
        <a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
        <div class="auth-buttons">
          <a href="{p}auth/login.html" class="btn-auth btn-login"><i class="fas fa-sign-in-alt"></i> 로그인</a>
          <a href="{p}auth/register.html" class="btn-auth btn-register"><i class="fas fa-user-plus"></i> 회원가입</a>
        </div>
        <a href="{p}reservation.html" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
  
  <div class="header-spacer"></div>'''


# ═══════════════════════════════════════
# 공통 FOOTER + Mobile Nav + Floating + Scripts
# ═══════════════════════════════════════
def build_footer(depth=1):
    p = '../' * depth
    return f'''
  <!-- FOOTER -->
  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="{p}index.html" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a>
          <p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>전문센터</h4>
            <ul>
              <li><a href="{p}treatments/implant.html">임플란트센터</a></li>
              <li><a href="{p}treatments/invisalign.html">교정센터</a></li>
              <li><a href="{p}treatments/pediatric.html">소아치과</a></li>
              <li><a href="{p}treatments/glownate.html">심미치료</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>병원 안내</h4>
            <ul>
              <li><a href="{p}doctors/index.html">의료진 소개</a></li>
              <li><a href="{p}bdx/index.html">BDX 검진센터</a></li>
              <li><a href="{p}floor-guide.html">층별 안내</a></li>
              <li><a href="{p}cases/gallery.html">Before/After</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>고객 지원</h4>
            <ul>
              <li><a href="{p}reservation.html">예약/상담</a></li>
              <li><a href="{p}column/columns.html">칼럼/콘텐츠</a></li>
              <li><a href="{p}faq.html">자주 묻는 질문</a></li>
              <li><a href="{p}directions.html">오시는 길</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-info">
        <div class="footer-contact">
          <p><i class="fas fa-map-marker-alt"></i> 충남 천안시 서북구 불당34길 14, 1~5층</p>
          <p><i class="fas fa-phone"></i> 041-415-2892</p>
          <div class="footer-hours">
            <p><i class="fas fa-clock"></i> <strong>365일 진료</strong></p>
            <p>평일 09:00-20:00 (점심 12:30-14:00)</p>
            <p>토·일 09:00-17:00</p>
            <p>공휴일 09:00-13:00</p>
          </div>
        </div>
        <div class="footer-social">
          <a href="https://naver.me/5yPnKmqQ" target="_blank" rel="noopener" aria-label="네이버 예약"><i class="fas fa-calendar-check"></i></a>
          <a href="https://www.youtube.com/c/%EC%89%BD%EB%94%94%EC%89%AC%EC%9A%B4%EC%B9%98%EA%B3%BC%EC%9D%B4%EC%95%BC%EA%B8%B0Bdtube" target="_blank" rel="noopener" aria-label="유튜브"><i class="fab fa-youtube"></i></a>
          <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" aria-label="카카오톡"><i class="fas fa-comment"></i></a>
        </div>
      </div>
      <div class="footer-legal">
        <div class="legal-links">
          <a href="{p}privacy.html">개인정보 처리방침</a>
          <span>|</span>
          <a href="{p}terms.html">이용약관</a>
          <span>|</span>
          <a href="{p}sitemap.xml">사이트맵</a>
        </div>
        <p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수하여 제공하고 있으며, 특정 개인의 결과는 개인에 따라 달라질 수 있습니다.</p>
        <p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- Mobile Navigation -->
  <nav class="mobile-nav" id="mobileNav" aria-label="모바일 메뉴">
    <div class="mobile-nav-header">
      <span class="logo-icon">🦷</span>
      <button class="mobile-nav-close" id="mobileNavClose" aria-label="메뉴 닫기"><i class="fas fa-times"></i></button>
    </div>
    <ul class="mobile-nav-menu">
      <li class="mobile-nav-item has-submenu">
        <a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
          <i class="fas fa-tooth"></i> 진료 안내 <i class="fas fa-chevron-down toggle-icon"></i>
        </a>
        <ul class="mobile-nav-submenu">
          <li><a href="{p}treatments/index.html">전체 진료</a></li>
          <li class="submenu-divider">전문센터</li>
          <li><a href="{p}treatments/glownate.html" style="color:#6B4226;font-weight:600;">✨ 글로우네이트</a></li>
          <li><a href="{p}treatments/implant.html">임플란트센터</a></li>
          <li><a href="{p}treatments/invisalign.html">교정센터 (인비절라인)</a></li>
          <li><a href="{p}treatments/pediatric.html">소아치과</a></li>
          <li><a href="{p}treatments/aesthetic.html">심미치료</a></li>
          <li class="submenu-divider">일반 진료</li>
          <li><a href="{p}treatments/cavity.html">충치치료</a></li>
          <li><a href="{p}treatments/resin.html">레진치료</a></li>
          <li><a href="{p}treatments/scaling.html">스케일링</a></li>
          <li><a href="{p}treatments/gum.html">잇몸치료</a></li>
        </ul>
      </li>
      <li><a href="{p}doctors/index.html"><i class="fas fa-user-md"></i> 의료진 소개</a></li>
      <li><a href="{p}bdx/index.html"><i class="fas fa-microscope"></i> 검진센터</a></li>
      <li class="mobile-nav-item has-submenu">
        <a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
          <i class="fas fa-newspaper"></i> 콘텐츠 <i class="fas fa-chevron-down toggle-icon"></i>
        </a>
        <ul class="mobile-nav-submenu">
          <li><a href="{p}column/columns.html"><i class="fas fa-pen-fancy"></i> 칼럼</a></li>
          <li><a href="{p}video/index.html"><i class="fab fa-youtube"></i> 영상</a></li>
          <li><a href="{p}cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li>
        </ul>
      </li>
      <li class="mobile-nav-item has-submenu">
        <a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
          <i class="fas fa-hospital"></i> 병원 안내 <i class="fas fa-chevron-down toggle-icon"></i>
        </a>
        <ul class="mobile-nav-submenu">
          <li><a href="{p}pricing.html">💰 비용 안내</a></li>
          <li><a href="{p}floor-guide.html">층별 안내</a></li>
          <li><a href="{p}directions.html">오시는 길</a></li>
          <li><a href="{p}faq.html">자주 묻는 질문</a></li>
          <li><a href="{p}notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li>
        </ul>
      </li>
      <li><a href="{p}reservation.html" class="highlight"><i class="fas fa-calendar-check"></i> 예약하기</a></li>
    </ul>
    <div class="mobile-auth-buttons">
      <a href="{p}auth/login.html" class="btn-auth"><i class="fas fa-sign-in-alt"></i> 로그인</a>
      <a href="{p}auth/register.html" class="btn-auth"><i class="fas fa-user-plus"></i> 회원가입</a>
    </div>
    <div class="mobile-nav-footer">
      <p class="mobile-nav-hours"><i class="fas fa-clock"></i> 365일 진료 | 평일 야간진료</p>
      <div class="mobile-nav-quick-btns">
        <a href="{p}pricing.html" class="btn btn-secondary btn-lg"><i class="fas fa-won-sign"></i> 비용 안내</a>
        <a href="tel:041-415-2892" class="btn btn-primary btn-lg"><i class="fas fa-phone"></i> 전화 예약</a>
      </div>
    </div>
  </nav>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>

  <!-- Floating CTA -->
  <div class="floating-cta desktop-only">
    <a href="javascript:void(0)" class="floating-btn top" aria-label="맨 위로" id="scrollToTopBtn"><i class="fas fa-arrow-up"></i><span class="tooltip">맨 위로</span></a>
    <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="floating-btn kakao" aria-label="카카오톡 상담"><i class="fas fa-comment-dots"></i><span class="tooltip">카카오톡 상담</span></a>
    <a href="tel:0414152892" class="floating-btn phone" aria-label="전화 상담"><i class="fas fa-phone"></i><span class="tooltip">전화 상담</span></a>
  </div>

  <!-- Mobile Bottom CTA -->
  <div class="mobile-bottom-cta mobile-only" aria-label="빠른 연락">
    <a href="tel:041-415-2892" class="mobile-cta-btn phone"><i class="fas fa-phone-alt"></i><span>전화</span></a>
    <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="mobile-cta-btn kakao"><i class="fas fa-comment"></i><span>카카오톡</span></a>
    <a href="{p}reservation.html" class="mobile-cta-btn reserve primary"><i class="fas fa-calendar-check"></i><span>예약</span></a>
    <a href="{p}directions.html" class="mobile-cta-btn location"><i class="fas fa-map-marker-alt"></i><span>오시는 길</span></a>
  </div>

  <!-- Scripts -->
  <script src="/js/gnb.js" defer></script>
  <script>
    // Scroll Reveal
    document.addEventListener('DOMContentLoaded',function(){{
      var els=document.querySelectorAll('.reveal');
      if(!els.length)return;
      var obs=new IntersectionObserver(function(entries){{
        entries.forEach(function(e){{
          if(e.isIntersecting){{e.target.classList.add('visible');obs.unobserve(e.target);}}
        }});
      }},{{threshold:0.08,rootMargin:'0px 0px -40px 0px'}});
      els.forEach(function(el){{obs.observe(el);}});
    }});
    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(function(btn){{
      btn.addEventListener('click',function(){{
        var item=this.parentElement;
        var isOpen=item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function(i){{i.classList.remove('open');}});
        if(!isOpen) item.classList.add('open');
      }});
    }});
    // Scroll to top
    var topBtn=document.getElementById('scrollToTopBtn');
    if(topBtn){{
      window.addEventListener('scroll',function(){{
        topBtn.classList.toggle('visible',window.scrollY>500);
      }});
      topBtn.addEventListener('click',function(){{window.scrollTo({{top:0,behavior:'smooth'}});}});
    }}
  </script>
</body>
</html>'''


# ═══════════════════════════════════════
# SUBPAGE HERO 빌더
# ═══════════════════════════════════════
def build_hero(badge_icon, badge_text, h1_html, desc, stats=None, breadcrumb_items=None, depth=1):
    p = '../' * depth
    bc = ''
    if breadcrumb_items:
        items = [f'<a href="{p}index.html">홈</a>']
        for label, link in breadcrumb_items[:-1]:
            items.append(f'<span class="sep">/</span> <a href="{p}{link}">{label}</a>')
        items.append(f'<span class="sep">/</span> <span class="current">{breadcrumb_items[-1][0]}</span>')
        bc = f'<nav class="hero-breadcrumb" aria-label="현재 위치">{" ".join(items)}</nav>'
    
    stats_html = ''
    if stats:
        stat_items = ''.join(f'''
        <div class="hero-stat-item">
          <div class="hero-stat-number">{s[0]}<span>{s[1]}</span></div>
          <div class="hero-stat-label">{s[2]}</div>
        </div>''' for s in stats)
        stats_html = f'<div class="hero-stats reveal delay-3">{stat_items}</div>'
    
    return f'''
  <main id="main-content" role="main">
  
  <section class="subpage-hero" aria-label="페이지 소개">
    <div class="container">
      {bc}
      <span class="hero-badge reveal"><i class="{badge_icon}"></i> {badge_text}</span>
      <h1 class="reveal delay-1">{h1_html}</h1>
      <p class="hero-desc reveal delay-2">{desc}</p>
      {stats_html}
    </div>
  </section>'''


# ═══════════════════════════════════════
# CTA 섹션 빌더
# ═══════════════════════════════════════
def build_cta(title, desc, depth=1):
    p = '../' * depth
    return f'''
  <section class="cta-section" aria-label="상담 안내">
    <div class="container">
      <div class="cta-wrapper reveal">
        <span class="cta-badge">상담 안내</span>
        <h2>{title}</h2>
        <p>{desc}</p>
        <div class="cta-buttons">
          <a href="{p}reservation.html" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
          <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
        </div>
        <p class="cta-note"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
      </div>
    </div>
  </section>
  
  </main>'''


# ═══════════════════════════════════════
# 콘텐츠 섹션 추출기
# 기존 HTML에서 <section> 사이의 콘텐츠를 추출하고 스타일 변환
# ═══════════════════════════════════════
def extract_content_sections(html):
    """기존 HTML에서 body 내 section들의 콘텐츠를 추출하여 v4 스타일로 변환"""
    # body 내의 모든 section을 추출
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
    if not body_match:
        return ''
    
    body = body_match.group(1)
    
    # header, footer, mobile-nav, floating 등 공통 영역 제거
    body = re.sub(r'<header.*?</header>', '', body, flags=re.DOTALL)
    body = re.sub(r'<footer.*?</footer>', '', body, flags=re.DOTALL)
    body = re.sub(r'<nav class="mobile-nav.*?</nav>', '', body, flags=re.DOTALL)
    body = re.sub(r'<div class="mobile-nav-overlay.*?</div>', '', body, flags=re.DOTALL)
    body = re.sub(r'<div[^>]*style="height:\s*7[0-9]px[^"]*"[^>]*>\s*</div>', '', body, flags=re.DOTALL)
    
    # 인라인 style 태그 제거
    body = re.sub(r'<style>.*?</style>', '', body, flags=re.DOTALL)
    
    # 기존 다크 테마 클래스 변환
    body = body.replace('bg-dark', 'alt-bg')
    body = body.replace('bg-light', 'warm-bg')
    body = body.replace('glass-card', 'feature-card')
    
    # data-i18n 제거 (불필요)
    body = re.sub(r'\s*data-i18n="[^"]*"', '', body)
    
    # 기존 hero section도 제거 (새로 만들 것)
    body = re.sub(r'<section class="treatment-hero[^"]*".*?</section>', '', body, flags=re.DOTALL)
    
    # 기존 CTA 섹션 제거 (새로 만들 것)
    body = re.sub(r'<section class="section cta-section".*?</section>', '', body, flags=re.DOTALL)
    
    # script 태그 제거 (공통 스크립트로 대체)
    body = re.sub(r'<script.*?</script>', '', body, flags=re.DOTALL)
    
    # 빈 줄 정리
    body = re.sub(r'\n{3,}', '\n\n', body)
    
    return body.strip()


# ═══════════════════════════════════════
# 페이지별 설정
# ═══════════════════════════════════════
TREATMENTS = {
    'implant': {
        'title': '임플란트센터 — 6개 수술방, 수면·비절개·고난도 전문',
        'desc': '서울비디치과 임플란트센터 — 6개 전용 수술방, 2개 회복실 완비. 수면·비절개·네비게이션 임플란트 전문. 365일 수술 가능. 서울대 출신 전문의 진료.',
        'keywords': '천안임플란트, 임플란트, 수면임플란트, 비절개임플란트, 네비게이션임플란트, 뼈이식, 서울비디치과, 아산임플란트',
        'badge_icon': 'fas fa-hospital',
        'badge_text': '4F 임플란트센터',
        'h1': '믿을 수 있는<br><span class="text-gradient">임플란트 센터</span>',
        'hero_desc': '6개 수술방, 2개 회복실 완비 — 서울대 출신 전문 원장의 체계적인 수술 시스템',
        'stats': [('6', '개', '수술방'), ('2', '개', '회복실'), ('365', '일', '수술 가능')],
        'breadcrumb': [('진료 안내', 'treatments/index.html'), ('임플란트센터', '')],
        'cta_title': '임플란트, 고민만 하지 마세요',
        'cta_desc': '15인 원장 협진과 BDX 정밀검진으로 정확한 진단과 맞춤 치료 계획을 제안드립니다.',
    },
    'invisalign': {
        'title': '치아교정 · 인비절라인 — 대규모 교정센터',
        'desc': '서울비디치과 교정센터 — 인비절라인 다이아몬드 센터. 서울대 교정 전문의 2인, 투명교정·부분교정·소아교정 전문. 365일 진료.',
        'keywords': '천안교정, 인비절라인, 투명교정, 치아교정, 부분교정, 소아교정, 서울비디치과, 아산교정',
        'badge_icon': 'fas fa-smile-beam',
        'badge_text': '1F 교정센터',
        'h1': '대규모<br><span class="text-gradient">인비절라인 교정센터</span>',
        'hero_desc': '서울대 교정 전문의 2인 — 투명교정, 부분교정, 소아교정까지 1:1 맞춤 치료',
        'stats': [('2', '인', '교정 전문의'), ('365', '일', '진료')],
        'breadcrumb': [('진료 안내', 'treatments/index.html'), ('치아교정', '')],
        'cta_title': '교정 상담, 부담 없이 시작하세요',
        'cta_desc': '디지털 구강스캐너로 교정 전/후 시뮬레이션을 미리 확인하실 수 있습니다.',
    },
    'pediatric': {
        'title': '소아치과 — 전문의 3인 상주',
        'desc': '서울비디치과 소아치과센터 — 소아치과 전문의 3인 상주. 웃음가스, 수면치료, 실란트, 불소도포. 아이가 즐겁게 오는 치과.',
        'keywords': '천안소아치과, 소아치과, 소아치과전문의, 웃음가스, 수면치료, 아이치과, 서울비디치과',
        'badge_icon': 'fas fa-child',
        'badge_text': '3F 소아치과센터',
        'h1': '아이가 웃으며 오는<br><span class="text-gradient">소아치과</span>',
        'hero_desc': '소아치과 전문의 3인 상주 — 웃음가스, 수면치료로 아이가 편안하게 치료받습니다',
        'stats': [('3', '인', '소아치과 전문의'), ('365', '일', '진료')],
        'breadcrumb': [('진료 안내', 'treatments/index.html'), ('소아치과', '')],
        'cta_title': '우리 아이 첫 치과, 긴장하지 마세요',
        'cta_desc': '소아치과 전문의가 아이 눈높이에 맞춰 편안한 진료를 제공합니다.',
    },
    'aesthetic': {
        'title': '심미치료 — 라미네이트·미백 전문',
        'desc': '서울비디치과 심미치료센터 — 라미네이트, 치아미백, 레진치료. 자연스럽고 아름다운 미소를 위한 맞춤 심미치료.',
        'keywords': '천안라미네이트, 치아미백, 심미치료, 레진치료, 서울비디치과, 천안미백',
        'badge_icon': 'fas fa-star',
        'badge_text': '심미치료센터',
        'h1': '자연스러운 아름다움<br><span class="text-gradient">심미치료</span>',
        'hero_desc': '라미네이트, 치아미백, 레진 — 자연스럽고 아름다운 미소를 위한 맞춤 치료',
        'stats': None,
        'breadcrumb': [('진료 안내', 'treatments/index.html'), ('심미치료', '')],
        'cta_title': '아름다운 미소를 위한 첫 걸음',
        'cta_desc': '디지털 스마일 디자인으로 시술 전 결과를 미리 확인하실 수 있습니다.',
    },
    'glownate': {
        'title': '글로우네이트 — 서울비디치과 시그니처 시술',
        'desc': '서울비디치과 글로우네이트 — 자연스러운 치아 빛남을 위한 시그니처 심미 시술. 하루 만에 빛나는 미소.',
        'keywords': '글로우네이트, 치아미백, 심미치료, 서울비디치과, 천안심미치과',
        'badge_icon': 'fas fa-sparkles',
        'badge_text': 'SIGNATURE',
        'h1': '하루 만에 빛나는 미소<br><span class="text-gradient">글로우네이트</span>',
        'hero_desc': '서울비디치과만의 시그니처 심미 시술 — 자연스럽고 건강한 빛남',
        'stats': None,
        'breadcrumb': [('진료 안내', 'treatments/index.html'), ('글로우네이트', '')],
        'cta_title': '빛나는 미소, 지금 만나보세요',
        'cta_desc': '글로우네이트 상담을 예약하고 나만의 미소를 디자인하세요.',
    },
}

# 일반 진료 페이지
GENERAL_TREATMENTS = {
    'cavity': ('충치치료', '충치치료 — 최소 삭제, 최대 보존', '충치 조기 발견부터 치료까지. 레진, 인레이, 크라운 등 상황에 맞는 최적의 충치치료를 제공합니다.', '천안충치치료,충치,충치치료비용'),
    'resin': ('레진치료', '레진치료 — 자연 치아와 같은 색상', '치아 색상과 동일한 레진 재료로 심미적이고 건강한 충치 치료. 당일 치료 가능.', '천안레진치료,레진,레진충전'),
    'crown': ('크라운', '크라운 — 치아 전체를 감싸는 보철', '심한 충치, 신경치료 후 치아를 보호하는 크라운 치료. 지르코니아, 골드, PFM 크라운.', '천안크라운,지르코니아크라운,치아크라운'),
    'inlay': ('인레이/온레이', '인레이·온레이 — 정밀한 맞춤 보철', '충치 범위에 맞는 정밀한 인레이/온레이 치료. 세라믹, 골드, 레진 소재.', '인레이,온레이,천안인레이'),
    'root-canal': ('신경치료', '신경치료 — 정확한 진단과 꼼꼼한 치료', '충치가 신경까지 진행된 경우 시행하는 신경치료. 현미경 신경치료로 정밀하게.', '천안신경치료,신경치료,치아신경치료'),
    'whitening': ('치아미백', '치아미백 — 밝고 건강한 미소', '전문가 미백, 자가 미백, 원데이 미백. 안전하고 효과적인 치아 미백 프로그램.', '천안미백,치아미백,미백치과'),
    'scaling': ('스케일링', '스케일링 — 구강 건강의 기본', '치석·치태 제거로 잇몸 건강 유지. 연 1회 건강보험 적용. 정기적 스케일링 권장.', '천안스케일링,스케일링,치석제거'),
    'gum': ('잇몸치료', '잇몸치료 — 잇몸 건강 되찾기', '잇몸 염증, 출혈, 치주질환 전문 치료. 비수술적 치료부터 잇몸 수술까지.', '천안잇몸치료,잇몸치료,치주치료'),
    'periodontitis': ('치주염 치료', '치주염 — 조기 발견과 체계적 치료', '치주염은 치아 상실의 주요 원인입니다. 단계별 체계적인 치주 치료를 제공합니다.', '천안치주염,치주염,치주질환'),
    'wisdom-tooth': ('사랑니 발치', '사랑니 발치 — 안전한 발치 전문', '매복 사랑니, 난발치 전문. 파노라마·CT 정밀 진단 후 안전한 사랑니 발치.', '천안사랑니,사랑니발치,매복사랑니'),
    'tmj': ('턱관절장애', '턱관절장애(TMJ) — 정밀 진단과 치료', '턱관절 통증, 소리, 개구장애 전문 진료. 교합 분석과 근이완 치료.', '턱관절,턱관절장애,TMJ,천안턱관절'),
    'bruxism': ('이갈이·이악물기', '이갈이·이악물기 — 치아 보호 치료', '야간 이갈이, 이악물기로 인한 치아 마모 방지. 맞춤 스플린트 치료.', '이갈이,이악물기,브럭시즘,스플린트'),
    'bridge': ('브릿지', '브릿지 — 빠진 치아 수복', '양쪽 치아를 이용한 브릿지 치료. 임플란트가 어려운 경우의 대안.', '브릿지,치아브릿지,천안브릿지'),
    'denture': ('틀니', '틀니 — 편안한 맞춤 틀니', '부분틀니, 총의치 전문 제작. 디지털 기공소에서 정밀한 맞춤 틀니를 제작합니다.', '천안틀니,틀니,부분틀니,총의치'),
    'emergency': ('응급치료', '응급 치과 — 365일 응급 대응', '치아 파절, 탈구, 급성 통증 등 응급 상황 365일 대응. 야간·공휴일 진료.', '천안응급치과,응급치과,야간치과'),
}

# 기타 진료
EXTRA_TREATMENTS = {
    'apicoectomy': ('치근단절제술', '치근단절제술 — 뿌리 끝 염증 제거', '신경치료 실패 시 치아 뿌리 끝을 절제하는 수술. 자연 치아 보존.', '치근단절제술,치아보존'),
    'gum-surgery': ('잇몸수술', '잇몸수술 — 진행된 치주질환 치료', '치주판막술, 치은절제술 등 진행된 잇몸 질환의 외과적 치료.', '잇몸수술,치주수술'),
    're-root-canal': ('재신경치료', '재신경치료 — 실패한 신경치료 재시도', '이전 신경치료가 실패한 경우 재치료. 현미경 정밀 치료.', '재신경치료'),
    'prevention': ('예방치료', '예방치료 — 질환 예방이 최고의 치료', '실란트, 불소도포, 정기검진으로 치아 질환을 사전에 예방합니다.', '예방치료,실란트,불소도포'),
}


# ═══════════════════════════════════════
# 기타 페이지 설정
# ═══════════════════════════════════════
ROOT_PAGES = {
    'faq': {
        'title': '자주 묻는 질문',
        'desc': '서울비디치과 자주 묻는 질문 — 진료시간, 임플란트 비용, 교정 상담, 예약 방법 등 궁금한 사항을 확인하세요.',
        'keywords': '서울비디치과 FAQ, 치과 자주 묻는 질문, 임플란트 비용, 교정 상담',
        'badge_icon': 'fas fa-question-circle',
        'badge_text': '자주 묻는 질문',
        'h1': '자주 묻는 <span class="text-gradient">질문</span>',
        'hero_desc': '환자분들이 가장 궁금해하시는 질문을 모았습니다',
        'breadcrumb': [('자주 묻는 질문', '')],
    },
    'pricing': {
        'title': '비용 안내',
        'desc': '서울비디치과 비용 안내 — 임플란트, 교정, 일반 진료 비용을 투명하게 안내합니다. 합리적이고 정직한 진료비.',
        'keywords': '천안 치과 비용, 임플란트 비용, 교정 비용, 서울비디치과 가격',
        'badge_icon': 'fas fa-won-sign',
        'badge_text': '비용 안내',
        'h1': '투명한 <span class="text-gradient">비용 안내</span>',
        'hero_desc': '합리적이고 정직한 진료비 — 모든 비용을 투명하게 안내합니다',
        'breadcrumb': [('비용 안내', '')],
    },
    'reservation': {
        'title': '예약/상담',
        'desc': '서울비디치과 예약/상담 — 365일 진료 예약. 온라인 상담, 전화 예약, 카카오톡 상담.',
        'keywords': '서울비디치과 예약, 치과 예약, 상담 예약, 365일 진료',
        'badge_icon': 'fas fa-calendar-check',
        'badge_text': '예약/상담',
        'h1': '편리한 <span class="text-gradient">예약 · 상담</span>',
        'hero_desc': '365일 진료 — 온라인, 전화, 카카오톡으로 편하게 예약하세요',
        'breadcrumb': [('예약/상담', '')],
    },
    'directions': {
        'title': '오시는 길',
        'desc': '서울비디치과 오시는 길 — 충남 천안시 서북구 불당34길 14, 1~5층. 무료 주차, 대중교통 안내.',
        'keywords': '서울비디치과 위치, 천안 치과 위치, 불당동 치과, 오시는 길',
        'badge_icon': 'fas fa-map-marker-alt',
        'badge_text': '오시는 길',
        'h1': '서울비디치과 <span class="text-gradient">오시는 길</span>',
        'hero_desc': '충남 천안시 서북구 불당34길 14, 1~5층 — 무료 주차 가능',
        'breadcrumb': [('오시는 길', '')],
    },
    'floor-guide': {
        'title': '층별 안내',
        'desc': '서울비디치과 층별 안내 — 1~5층 전문센터 구성. 1F 교정센터, 2F 디지털 기공소, 3F 소아치과/BDX, 4F 임플란트센터, 5F 종합센터.',
        'keywords': '서울비디치과 층별 안내, 시설 안내, 치과 시설',
        'badge_icon': 'fas fa-building',
        'badge_text': '층별 안내',
        'h1': '1~5층 <span class="text-gradient">전문센터</span> 구성',
        'hero_desc': '환자분의 편안함과 안전을 위한 프리미엄 의료 시설',
        'breadcrumb': [('층별 안내', '')],
    },
    'privacy': {
        'title': '개인정보 처리방침',
        'desc': '서울비디치과 개인정보 처리방침 — 환자분의 개인정보를 안전하게 보호합니다.',
        'keywords': '개인정보 처리방침, 서울비디치과',
        'badge_icon': 'fas fa-shield-alt',
        'badge_text': '개인정보 처리방침',
        'h1': '개인정보 <span class="text-gradient">처리방침</span>',
        'hero_desc': '환자분의 소중한 개인정보를 안전하게 보호합니다',
        'breadcrumb': [('개인정보 처리방침', '')],
    },
    'terms': {
        'title': '이용약관',
        'desc': '서울비디치과 홈페이지 이용약관 안내.',
        'keywords': '이용약관, 서울비디치과',
        'badge_icon': 'fas fa-file-contract',
        'badge_text': '이용약관',
        'h1': '<span class="text-gradient">이용약관</span>',
        'hero_desc': '서울비디치과 홈페이지 이용약관 안내',
        'breadcrumb': [('이용약관', '')],
    },
}


def make_breadcrumb_json(items, canonical_base):
    entries = [f'{{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"}}']
    for i, (name, _) in enumerate(items):
        pos = i + 2
        if i == len(items) - 1:
            entries.append(f'{{"@type":"ListItem","position":{pos},"name":"{name}"}}')
        else:
            entries.append(f'{{"@type":"ListItem","position":{pos},"name":"{name}","item":"https://bdbddc.com/{_}"}}')
    return f'{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{",".join(entries)}]}}'


def convert_page(filepath, config, depth=1):
    """페이지를 v4 디자인으로 변환"""
    
    # 기존 파일 읽기
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            old_html = f.read()
    except:
        print(f"  SKIP (파일 없음): {filepath}")
        return False
    
    # 기존 콘텐츠 추출
    content = extract_content_sections(old_html)
    
    canonical = filepath.replace(BASE_DIR + '/', '')
    breadcrumb_items = config.get('breadcrumb', [])
    bc_json = make_breadcrumb_json(breadcrumb_items, canonical)
    
    # 기존 FAQ Schema 추출
    extra_schema = ''
    faq_matches = re.findall(r'(<script type="application/ld\+json">\s*\{[^}]*"@type"\s*:\s*"FAQPage".*?</script>)', old_html, re.DOTALL)
    if faq_matches:
        extra_schema += '\n  ' + faq_matches[0]
    
    # 기존 MedicalProcedure / HowTo Schema 추출
    for schema_type in ['MedicalProcedure', 'HowTo', 'Product']:
        matches = re.findall(rf'(<script type="application/ld\+json">\s*\{{[^}}]*"@type"\s*:\s*"{schema_type}".*?</script>)', old_html, re.DOTALL)
        if matches:
            extra_schema += '\n  ' + matches[0]
    
    # 빌드
    head = build_head(
        title=config['title'],
        description=config['desc'],
        keywords=config['keywords'],
        canonical_path=canonical,
        og_image='images/og-image.jpg',
        breadcrumb_json=bc_json,
        extra_schema=extra_schema,
        depth=depth
    )
    
    header = build_header(depth=depth)
    
    hero = build_hero(
        badge_icon=config['badge_icon'],
        badge_text=config['badge_text'],
        h1_html=config['h1'],
        desc=config['hero_desc'],
        stats=config.get('stats'),
        breadcrumb_items=breadcrumb_items,
        depth=depth
    )
    
    cta_title = config.get('cta_title', '궁금한 점이 있으신가요?')
    cta_desc = config.get('cta_desc', '15인 원장 협진 시스템으로 정확한 진단과 맞춤 치료를 제안드립니다.')
    cta = build_cta(cta_title, cta_desc, depth=depth)
    
    footer = build_footer(depth=depth)
    
    new_html = f'''<!DOCTYPE html>
<html lang="ko">
{head}
{header}
{hero}

{content}

{cta}
{footer}'''
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)
    
    print(f"  OK: {filepath}")
    return True


# ═══════════════════════════════════════
# 메인 실행
# ═══════════════════════════════════════
def main():
    count = 0
    
    print("=== 전문 진료 페이지 변환 ===")
    for slug, config in TREATMENTS.items():
        filepath = os.path.join(BASE_DIR, 'treatments', f'{slug}.html')
        if convert_page(filepath, config, depth=1):
            count += 1
    
    print("\n=== 일반 진료 페이지 변환 ===")
    for slug, (display_name, title, desc, keywords) in GENERAL_TREATMENTS.items():
        config = {
            'title': title,
            'desc': f'서울비디치과 {desc}',
            'keywords': keywords + ',서울비디치과',
            'badge_icon': 'fas fa-tooth',
            'badge_text': display_name,
            'h1': f'<span class="text-gradient">{display_name}</span>',
            'hero_desc': desc.split('—')[-1].strip() if '—' in desc else desc,
            'stats': None,
            'breadcrumb': [('진료 안내', 'treatments/index.html'), (display_name, '')],
            'cta_title': f'{display_name}, 궁금한 점이 있으신가요?',
            'cta_desc': '정확한 진단 후 최적의 치료 방법을 안내드립니다. 부담 없이 상담하세요.',
        }
        filepath = os.path.join(BASE_DIR, 'treatments', f'{slug}.html')
        if convert_page(filepath, config, depth=1):
            count += 1
    
    print("\n=== 추가 진료 페이지 변환 ===")
    for slug, (display_name, title, desc, keywords) in EXTRA_TREATMENTS.items():
        config = {
            'title': title,
            'desc': f'서울비디치과 {desc}',
            'keywords': keywords + ',서울비디치과',
            'badge_icon': 'fas fa-tooth',
            'badge_text': display_name,
            'h1': f'<span class="text-gradient">{display_name}</span>',
            'hero_desc': desc.split('—')[-1].strip() if '—' in desc else desc,
            'stats': None,
            'breadcrumb': [('진료 안내', 'treatments/index.html'), (display_name, '')],
            'cta_title': f'{display_name}, 궁금한 점이 있으신가요?',
            'cta_desc': '정확한 진단 후 최적의 치료 방법을 안내드립니다.',
        }
        filepath = os.path.join(BASE_DIR, 'treatments', f'{slug}.html')
        if convert_page(filepath, config, depth=1):
            count += 1
    
    # ─── treatments/index.html ───
    print("\n=== 진료 안내 인덱스 ===")
    config = {
        'title': '진료 안내 — 전문 진료과목',
        'desc': '서울비디치과 진료 안내 — 임플란트, 인비절라인, 소아치과, 심미치료, 일반진료. 서울대 출신 15인 원장이 전문 분야별로 진료합니다.',
        'keywords': '천안치과진료,임플란트,인비절라인,소아치과,심미치료,일반진료,서울비디치과',
        'badge_icon': 'fas fa-teeth',
        'badge_text': '진료 안내',
        'h1': '서울비디치과 <span class="text-gradient">진료 안내</span>',
        'hero_desc': '서울대 출신 15인 원장이 전문 분야별로 정성을 다해 진료합니다',
        'stats': [('15', '인', '서울대 출신 원장'), ('6', '개', '수술방'), ('3', '인', '소아치과 전문의')],
        'breadcrumb': [('진료 안내', '')],
        'cta_title': '어떤 치료가 필요하신가요?',
        'cta_desc': '정확한 진단을 통해 꼭 필요한 치료만 안내드립니다.',
    }
    filepath = os.path.join(BASE_DIR, 'treatments', 'index.html')
    if convert_page(filepath, config, depth=1):
        count += 1
    
    # ─── Root-level pages ───
    print("\n=== 루트 레벨 페이지 변환 ===")
    for slug, config in ROOT_PAGES.items():
        filepath = os.path.join(BASE_DIR, f'{slug}.html')
        config.setdefault('cta_title', '궁금한 점이 있으신가요?')
        config.setdefault('cta_desc', '365일 진료하는 서울비디치과에 부담 없이 문의하세요.')
        if convert_page(filepath, config, depth=0):
            count += 1
    
    # ─── doctors/index.html ───
    print("\n=== 의료진 소개 ===")
    config = {
        'title': '의료진 소개 — 서울대 출신 15인 원장',
        'desc': '서울비디치과 의료진 소개 — 서울대 출신 15인 원장. 각 분야 전문의가 협진 시스템으로 최적의 치료를 제공합니다.',
        'keywords': '서울비디치과 의료진, 천안 치과 원장, 서울대 치과, 문석준 원장',
        'badge_icon': 'fas fa-user-md',
        'badge_text': '의료진 소개',
        'h1': '서울대 출신 <span class="text-gradient">15인 원장</span>',
        'hero_desc': '각 분야 전문의가 협진 시스템으로 최적의 치료를 제공합니다',
        'stats': [('15', '인', '서울대 출신 원장'), ('4', '명', '전문의')],
        'breadcrumb': [('의료진 소개', '')],
        'cta_title': '어떤 원장님께 진료받고 싶으신가요?',
        'cta_desc': '예약 시 희망 원장님을 선택하실 수 있습니다.',
    }
    filepath = os.path.join(BASE_DIR, 'doctors', 'index.html')
    if convert_page(filepath, config, depth=1):
        count += 1
    
    # ─── 개별 의사 프로필 ───
    print("\n=== 개별 의사 프로필 ===")
    doctor_files = glob.glob(os.path.join(BASE_DIR, 'doctors', '*.html'))
    doctor_name_map = {
        'moon': '문석준', 'park': '박정우', 'kim': '김영운', 'lee': '이명진',
        'kang': '강경호', 'seo': '서형석', 'hyun': '현정민', 'choi': '최종호',
        'jo': '조한나', 'kang-mj': '강민정', 'kim-mg': '김민경', 'kim-mj': '김민지',
        'lee-bm': '이보민', 'park-sb': '박수빈', 'lim': '임수현'
    }
    for fpath in doctor_files:
        fname = os.path.basename(fpath).replace('.html', '')
        if fname in ('index', 'doctor-template', 'profile-template'):
            continue
        dr_name = doctor_name_map.get(fname, fname)
        config = {
            'title': f'{dr_name} 원장 — 서울비디치과',
            'desc': f'서울비디치과 {dr_name} 원장 — 서울대학교 치의학대학원 출신. 전문 분야별 진료.',
            'keywords': f'{dr_name} 원장, 서울비디치과, 천안 치과 원장',
            'badge_icon': 'fas fa-user-md',
            'badge_text': '의료진 소개',
            'h1': f'<span class="text-gradient">{dr_name}</span> 원장',
            'hero_desc': '서울대학교 치의학대학원 출신 — 전문 분야별 진료',
            'stats': None,
            'breadcrumb': [('의료진 소개', 'doctors/index.html'), (f'{dr_name} 원장', '')],
            'cta_title': f'{dr_name} 원장님께 진료받고 싶으시다면',
            'cta_desc': '예약 시 희망 원장님을 선택하실 수 있습니다.',
        }
        if convert_page(fpath, config, depth=1):
            count += 1
    
    # ─── bdx, column, video, cases, notice ───
    print("\n=== 콘텐츠 페이지 ===")
    content_pages = {
        'bdx/index.html': {
            'title': 'BDX 검진센터 — 정밀 치과 검진',
            'desc': '서울비디치과 BDX 검진센터 — 3D CT, 구강스캐너, 파노라마 등 첨단 장비로 정밀 검진. 빅데이터 기반 진단.',
            'keywords': 'BDX검진센터, 치과검진, 정밀검진, 서울비디치과',
            'badge_icon': 'fas fa-microscope',
            'badge_text': '3F BDX 검진센터',
            'h1': '빅데이터 기반<br><span class="text-gradient">정밀 검진</span>',
            'hero_desc': '3D CT, 구강스캐너, 파노라마 — 첨단 장비로 정밀하게 진단합니다',
            'stats': None,
            'breadcrumb': [('BDX 검진센터', '')],
        },
        'column/columns.html': {
            'title': '칼럼 — 치과 건강 정보',
            'desc': '서울비디치과 칼럼 — 임플란트, 교정, 소아치과 등 치과 건강 정보를 알기 쉽게 전달합니다.',
            'keywords': '치과 칼럼, 치과 정보, 임플란트 정보, 서울비디치과',
            'badge_icon': 'fas fa-pen-fancy',
            'badge_text': '칼럼',
            'h1': '서울비디치과 <span class="text-gradient">칼럼</span>',
            'hero_desc': '알기 쉬운 치과 건강 정보를 전달합니다',
            'stats': None,
            'breadcrumb': [('칼럼', '')],
        },
        'video/index.html': {
            'title': '영상 — 진료 정보 영상',
            'desc': '서울비디치과 유튜브 영상 — 진료 과정, 환자 후기, 치과 건강 정보 영상.',
            'keywords': '서울비디치과 영상, 치과 유튜브, 진료 영상',
            'badge_icon': 'fab fa-youtube',
            'badge_text': '영상',
            'h1': '서울비디치과 <span class="text-gradient">영상</span>',
            'hero_desc': '진료 과정, 환자 후기, 치과 건강 정보를 영상으로 만나보세요',
            'stats': None,
            'breadcrumb': [('영상', '')],
        },
        'cases/gallery.html': {
            'title': '비포/애프터 — 치료 사례',
            'desc': '서울비디치과 치료 사례 — 임플란트, 교정, 심미치료 비포/애프터 갤러리.',
            'keywords': '치료사례, 비포애프터, 임플란트사례, 교정사례, 서울비디치과',
            'badge_icon': 'fas fa-images',
            'badge_text': '비포/애프터',
            'h1': '서울비디치과 <span class="text-gradient">치료 사례</span>',
            'hero_desc': '실제 치료 전/후 변화를 확인하세요',
            'stats': None,
            'breadcrumb': [('비포/애프터', '')],
        },
        'cases/index.html': {
            'title': '치료 사례',
            'desc': '서울비디치과 치료 사례 갤러리.',
            'keywords': '치료사례, 서울비디치과',
            'badge_icon': 'fas fa-images',
            'badge_text': '치료 사례',
            'h1': '<span class="text-gradient">치료 사례</span>',
            'hero_desc': '서울비디치과의 다양한 치료 사례를 확인하세요',
            'stats': None,
            'breadcrumb': [('치료 사례', '')],
        },
        'notice/index.html': {
            'title': '공지사항',
            'desc': '서울비디치과 공지사항 — 진료 안내, 이벤트, 공지 사항을 확인하세요.',
            'keywords': '서울비디치과 공지사항, 치과 공지',
            'badge_icon': 'fas fa-bullhorn',
            'badge_text': '공지사항',
            'h1': '<span class="text-gradient">공지사항</span>',
            'hero_desc': '서울비디치과의 최신 소식을 확인하세요',
            'stats': None,
            'breadcrumb': [('공지사항', '')],
        },
    }
    for rel_path, config in content_pages.items():
        filepath = os.path.join(BASE_DIR, rel_path)
        config.setdefault('cta_title', '궁금한 점이 있으신가요?')
        config.setdefault('cta_desc', '365일 진료하는 서울비디치과에 부담 없이 문의하세요.')
        if convert_page(filepath, config, depth=1):
            count += 1
    
    # ─── 지역 페이지 ───
    print("\n=== 지역 페이지 ===")
    area_map = {
        'cheonan': ('천안', '천안시'),
        'buldang': ('불당동', '불당동'),
        'asan': ('아산', '아산시'),
    }
    for slug, (area_name, full_name) in area_map.items():
        config = {
            'title': f'{area_name} 치과 추천 — 서울비디치과',
            'desc': f'{full_name} 치과 추천 서울비디치과 — 서울대 출신 15인 원장 협진, 365일 진료, 임플란트·교정·소아치과 전문.',
            'keywords': f'{area_name}치과,{area_name}임플란트,{area_name}교정,서울비디치과',
            'badge_icon': 'fas fa-map-marker-alt',
            'badge_text': f'{area_name} 치과',
            'h1': f'{area_name}에서 가까운<br><span class="text-gradient">서울비디치과</span>',
            'hero_desc': f'{full_name}에서 서울비디치과까지 — 서울대 출신 15인 원장, 365일 진료',
            'stats': None,
            'breadcrumb': [(f'{area_name} 치과', '')],
            'cta_title': f'{area_name}에서 서울비디치과까지',
            'cta_desc': f'{full_name}에서 편하게 방문하실 수 있습니다. 365일 진료, 야간진료 가능.',
        }
        filepath = os.path.join(BASE_DIR, 'area', f'{slug}.html')
        if convert_page(filepath, config, depth=1):
            count += 1
    
    # ─── FAQ 서브 ───
    print("\n=== FAQ 서브 페이지 ===")
    faq_pages = {
        'faq/implant.html': ('임플란트 FAQ', '임플란트 자주 묻는 질문', '천안임플란트FAQ,임플란트비용,임플란트통증'),
        'faq/orthodontics.html': ('교정 FAQ', '교정 자주 묻는 질문', '천안교정FAQ,인비절라인비용,교정기간'),
    }
    for rel_path, (title, desc, keywords) in faq_pages.items():
        config = {
            'title': title,
            'desc': f'서울비디치과 {desc} — 궁금한 사항을 확인하세요.',
            'keywords': keywords + ',서울비디치과',
            'badge_icon': 'fas fa-question-circle',
            'badge_text': title,
            'h1': f'<span class="text-gradient">{title}</span>',
            'hero_desc': desc,
            'stats': None,
            'breadcrumb': [('자주 묻는 질문', 'faq.html'), (title, '')],
            'cta_title': '더 궁금한 점이 있으신가요?',
            'cta_desc': '전화나 카카오톡으로 부담 없이 문의해주세요.',
        }
        filepath = os.path.join(BASE_DIR, rel_path)
        if convert_page(filepath, config, depth=1):
            count += 1
    
    # ─── 404 페이지 ───
    print("\n=== 404 페이지 ===")
    config_404 = {
        'title': '페이지를 찾을 수 없습니다',
        'desc': '요청하신 페이지를 찾을 수 없습니다.',
        'keywords': '404, 서울비디치과',
        'badge_icon': 'fas fa-exclamation-triangle',
        'badge_text': '404',
        'h1': '페이지를 찾을 수 <span class="text-gradient">없습니다</span>',
        'hero_desc': '요청하신 페이지가 존재하지 않거나 이동되었습니다',
        'stats': None,
        'breadcrumb': [('404', '')],
        'cta_title': '서울비디치과 홈으로 돌아가기',
        'cta_desc': '홈페이지에서 원하시는 정보를 찾아보세요.',
    }
    filepath = os.path.join(BASE_DIR, '404.html')
    if convert_page(filepath, config_404, depth=0):
        count += 1
    
    # ─── Auth 페이지 ───
    print("\n=== Auth 페이지 ===")
    for slug, title in [('login', '로그인'), ('register', '회원가입'), ('mypage', '마이페이지')]:
        config = {
            'title': title,
            'desc': f'서울비디치과 {title}',
            'keywords': f'{title},서울비디치과',
            'badge_icon': 'fas fa-sign-in-alt' if slug == 'login' else 'fas fa-user-plus',
            'badge_text': title,
            'h1': f'<span class="text-gradient">{title}</span>',
            'hero_desc': f'서울비디치과 {title}',
            'stats': None,
            'breadcrumb': [(title, '')],
        }
        filepath = os.path.join(BASE_DIR, 'auth', f'{slug}.html')
        if convert_page(filepath, config, depth=1):
            count += 1
    
    # ─── Admin 페이지 ───
    print("\n=== Admin 페이지 ===")
    for slug, title in [('index', '관리자'), ('cases', '사례 관리'), ('notices', '공지 관리')]:
        config = {
            'title': f'관리자 — {title}',
            'desc': f'서울비디치과 관리자 페이지',
            'keywords': '관리자,서울비디치과',
            'badge_icon': 'fas fa-cog',
            'badge_text': '관리자',
            'h1': f'<span class="text-gradient">{title}</span>',
            'hero_desc': '서울비디치과 관리자 페이지',
            'stats': None,
            'breadcrumb': [(title, '')],
        }
        filepath = os.path.join(BASE_DIR, 'admin', f'{slug}.html')
        if convert_page(filepath, config, depth=1):
            count += 1
    
    print(f"\n✅ 총 {count}개 서브페이지 변환 완료!")


if __name__ == '__main__':
    main()
