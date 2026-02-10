#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 * 서울비디치과 치료 하위 페이지 24개 전면 재생성 스크립트 v2
 * ═══════════════════════════════════════════════════════════
 * - head / header / footer / mobile-nav / floating CTA: 공통 함수
 * - <main> 내부: 100% 새 CSS 클래스만 사용
 * - 각 페이지별 풍부한 콘텐츠 데이터
 */
const fs = require('fs');
const path = require('path');

const TREATMENTS_DIR = path.join(__dirname, '..', 'treatments');
const CSS_VERSION = '20260210c';

// ───────── 공통 HTML 파트 생성 함수 ─────────

function head(p) {
  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${p.title} | 서울비디치과</title>
  <meta name="description" content="${p.desc}">
  <meta name="keywords" content="${p.keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/${p.file}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${p.title} | 서울비디치과">
  <meta property="og:description" content="${p.desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/${p.file}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${p.title} | 서울비디치과">
  <meta name="twitter:description" content="${p.desc}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-image.jpg">
  <link rel="icon" type="image/svg+xml" href="../images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="../manifest.json">
  <meta name="theme-color" content="#6B4226">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="../css/site-v5.css?v=${CSS_VERSION}">
  <link rel="prefetch" href="../reservation.html" as="document">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"진료 안내","item":"https://bdbddc.com/treatments/"},{"@type":"ListItem","position":3,"name":"${p.title}","item":"https://bdbddc.com/treatments/${p.file}"}]}
  </script>
</head>`;
}

function header() {
  return `<body>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  <header class="site-header" id="siteHeader">
    <div class="header-container">
      <div class="header-brand">
        <a href="../" class="site-logo" aria-label="서울비디치과 홈"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a>
        <div class="clinic-status open" aria-live="polite"><span class="status-dot"></span><span class="status-text">진료중</span><span class="status-time">20:00까지</span></div>
      </div>
      <nav class="main-nav" id="mainNav" aria-label="메인 네비게이션">
        <ul>
          <li class="nav-item has-dropdown">
            <a href="../treatments/index.html">진료 안내</a>
            <div class="mega-dropdown"><div class="mega-dropdown-grid">
              <div class="mega-dropdown-section"><h4>전문센터</h4><ul><li><a href="../treatments/glownate.html">✨ 글로우네이트 <span class="badge badge-hot">HOT</span></a></li><li><a href="../treatments/implant.html">임플란트 <span class="badge">6개 수술실</span></a></li><li><a href="../treatments/invisalign.html">치아교정 <span class="badge">대규모</span></a></li><li><a href="../treatments/pediatric.html">소아치과 <span class="badge">전문의 3인</span></a></li><li><a href="../treatments/aesthetic.html">심미치료</a></li></ul></div>
              <div class="mega-dropdown-section"><h4>일반/보존 진료</h4><ul><li><a href="../treatments/cavity.html">충치치료</a></li><li><a href="../treatments/resin.html">레진치료</a></li><li><a href="../treatments/crown.html">크라운</a></li><li><a href="../treatments/inlay.html">인레이/온레이</a></li><li><a href="../treatments/root-canal.html">신경치료</a></li><li><a href="../treatments/whitening.html">미백</a></li></ul></div>
              <div class="mega-dropdown-section"><h4>잇몸/외과</h4><ul><li><a href="../treatments/scaling.html">스케일링</a></li><li><a href="../treatments/gum.html">잇몸치료</a></li><li><a href="../treatments/periodontitis.html">치주염</a></li><li><a href="../treatments/wisdom-tooth.html">사랑니 발치</a></li><li><a href="../treatments/tmj.html">턱관절장애</a></li><li><a href="../treatments/bruxism.html">이갈이/이악물기</a></li></ul></div>
            </div></div>
          </li>
          <li class="nav-item"><a href="../doctors/index.html">의료진 소개</a></li>
          <li class="nav-item"><a href="../bdx/index.html">검진센터</a></li>
          <li class="nav-item has-dropdown"><a href="../column/columns.html">콘텐츠</a><ul class="simple-dropdown"><li><a href="../column/columns.html"><i class="fas fa-pen-fancy"></i> 칼럼</a></li><li><a href="../video/index.html"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="../cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li></ul></li>
          <li class="nav-item has-dropdown"><a href="../directions.html">병원 안내</a><ul class="simple-dropdown"><li><a href="../pricing.html" class="nav-highlight">💰 비용 안내</a></li><li><a href="../floor-guide.html">층별 안내</a></li><li><a href="../directions.html">오시는 길</a></li><li><a href="../faq.html">자주 묻는 질문</a></li><li><a href="../notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
        <div class="auth-buttons"><a href="../auth/login.html" class="btn-auth btn-login"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="../auth/register.html" class="btn-auth btn-register"><i class="fas fa-user-plus"></i> 회원가입</a></div>
        <a href="../reservation.html" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
  <div class="header-spacer"></div>`;
}

function footer() {
  return `  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand"><a href="../" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p></div>
        <div class="footer-links">
          <div class="footer-col"><h4>전문센터</h4><ul><li><a href="../treatments/implant.html">임플란트센터</a></li><li><a href="../treatments/invisalign.html">교정센터</a></li><li><a href="../treatments/pediatric.html">소아치과</a></li><li><a href="../treatments/glownate.html">심미치료</a></li></ul></div>
          <div class="footer-col"><h4>병원 안내</h4><ul><li><a href="../doctors/index.html">의료진 소개</a></li><li><a href="../bdx/index.html">BDX 검진센터</a></li><li><a href="../floor-guide.html">층별 안내</a></li><li><a href="../cases/gallery.html">Before/After</a></li></ul></div>
          <div class="footer-col"><h4>고객 지원</h4><ul><li><a href="../reservation.html">예약/상담</a></li><li><a href="../column/columns.html">칼럼/콘텐츠</a></li><li><a href="../faq.html">자주 묻는 질문</a></li><li><a href="../directions.html">오시는 길</a></li></ul></div>
        </div>
      </div>
      <div class="footer-info">
        <div class="footer-contact"><p><i class="fas fa-map-marker-alt"></i> 충남 천안시 서북구 불당34길 14, 1~5층</p><p><i class="fas fa-phone"></i> 041-415-2892</p><div class="footer-hours"><p><i class="fas fa-clock"></i> <strong>365일 진료</strong></p><p>평일 09:00-20:00 (점심 12:30-14:00)</p><p>토·일 09:00-17:00</p><p>공휴일 09:00-13:00</p></div></div>
        <div class="footer-social"><a href="https://naver.me/5yPnKmqQ" target="_blank" rel="noopener" aria-label="네이버 예약"><i class="fas fa-calendar-check"></i></a><a href="https://www.youtube.com/c/%EC%89%BD%EB%94%94%EC%89%AC%EC%9A%B4%EC%B9%98%EA%B3%BC%EC%9D%B4%EC%95%BC%EA%B8%B0Bdtube" target="_blank" rel="noopener" aria-label="유튜브"><i class="fab fa-youtube"></i></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" aria-label="카카오톡"><i class="fas fa-comment"></i></a></div>
      </div>
      <div class="footer-legal">
        <div class="legal-links"><a href="../privacy.html">개인정보 처리방침</a><span>|</span><a href="../terms.html">이용약관</a><span>|</span><a href="../sitemap.xml">사이트맵</a></div>
        <p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수하여 제공하고 있으며, 특정 개인의 결과는 개인에 따라 달라질 수 있습니다.</p>
        <p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
}

function mobileNav() {
  return `  <nav class="mobile-nav" id="mobileNav" aria-label="모바일 메뉴">
    <div class="mobile-nav-header"><span class="logo-icon">🦷</span><button class="mobile-nav-close" id="mobileNavClose" aria-label="메뉴 닫기"><i class="fas fa-times"></i></button></div>
    <ul class="mobile-nav-menu">
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-tooth"></i> 진료 안내 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="../treatments/index.html">전체 진료</a></li><li class="submenu-divider">전문센터</li><li><a href="../treatments/glownate.html" style="color:#6B4226;font-weight:600;">✨ 글로우네이트</a></li><li><a href="../treatments/implant.html">임플란트센터</a></li><li><a href="../treatments/invisalign.html">교정센터</a></li><li><a href="../treatments/pediatric.html">소아치과</a></li><li><a href="../treatments/aesthetic.html">심미치료</a></li><li class="submenu-divider">일반 진료</li><li><a href="../treatments/cavity.html">충치치료</a></li><li><a href="../treatments/resin.html">레진치료</a></li><li><a href="../treatments/scaling.html">스케일링</a></li><li><a href="../treatments/gum.html">잇몸치료</a></li></ul></li>
      <li><a href="../doctors/index.html"><i class="fas fa-user-md"></i> 의료진 소개</a></li>
      <li><a href="../bdx/index.html"><i class="fas fa-microscope"></i> 검진센터</a></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-newspaper"></i> 콘텐츠 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="../column/columns.html"><i class="fas fa-pen-fancy"></i> 칼럼</a></li><li><a href="../video/index.html"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="../cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li></ul></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-hospital"></i> 병원 안내 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="../pricing.html">💰 비용 안내</a></li><li><a href="../floor-guide.html">층별 안내</a></li><li><a href="../directions.html">오시는 길</a></li><li><a href="../faq.html">자주 묻는 질문</a></li><li><a href="../notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
      <li><a href="../reservation.html" class="highlight"><i class="fas fa-calendar-check"></i> 예약하기</a></li>
    </ul>
    <div class="mobile-auth-buttons"><a href="../auth/login.html" class="btn-auth"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="../auth/register.html" class="btn-auth"><i class="fas fa-user-plus"></i> 회원가입</a></div>
    <div class="mobile-nav-footer"><p class="mobile-nav-hours"><i class="fas fa-clock"></i> 365일 진료 | 평일 야간진료</p><div class="mobile-nav-quick-btns"><a href="../pricing.html" class="btn btn-secondary btn-lg"><i class="fas fa-won-sign"></i> 비용 안내</a><a href="tel:041-415-2892" class="btn btn-primary btn-lg"><i class="fas fa-phone"></i> 전화 예약</a></div></div>
  </nav>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>
  <div class="floating-cta desktop-only"><a href="javascript:void(0)" class="floating-btn top" aria-label="맨 위로" id="scrollToTopBtn"><i class="fas fa-arrow-up"></i><span class="tooltip">맨 위로</span></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="floating-btn kakao" aria-label="카카오톡 상담"><i class="fas fa-comment-dots"></i><span class="tooltip">카카오톡 상담</span></a><a href="tel:0414152892" class="floating-btn phone" aria-label="전화 상담"><i class="fas fa-phone"></i><span class="tooltip">전화 상담</span></a></div>
  <div class="mobile-bottom-cta mobile-only" aria-label="빠른 연락"><a href="tel:041-415-2892" class="mobile-cta-btn phone"><i class="fas fa-phone-alt"></i><span>전화</span></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="mobile-cta-btn kakao"><i class="fas fa-comment"></i><span>카카오톡</span></a><a href="../reservation.html" class="mobile-cta-btn reserve primary"><i class="fas fa-calendar-check"></i><span>예약</span></a><a href="../directions.html" class="mobile-cta-btn location"><i class="fas fa-map-marker-alt"></i><span>오시는 길</span></a></div>
  <script src="../js/main.js" defer></script>
  <script src="../js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){
      // FAQ toggle
      document.querySelectorAll('.faq-question').forEach(function(btn){
        btn.addEventListener('click',function(){
          var item=this.parentElement;
          var expanded=this.getAttribute('aria-expanded')==='true';
          document.querySelectorAll('.faq-item.active').forEach(function(i){i.classList.remove('active');i.querySelector('.faq-question').setAttribute('aria-expanded','false');});
          if(!expanded){item.classList.add('active');this.setAttribute('aria-expanded','true');}
        });
      });
      // Reveal animation
      var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});els.forEach(function(el){obs.observe(el);});
    });
  </script>
</body>
</html>`;
}

// ───────── 섹션 빌더 함수들 ─────────

function heroSection(p) {
  let statsHtml = '';
  if (p.heroStats && p.heroStats.length) {
    statsHtml = `\n      <div class="hero-stats">\n${p.heroStats.map(s => `        <div class="stat-item"><span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span></div>`).join('\n')}\n      </div>`;
  }
  return `
  <section class="treatment-page-hero" aria-label="${p.title}">
    <div class="container">
      <div class="breadcrumb"><a href="../">홈</a><span class="sep">/</span><a href="index.html">진료 안내</a><span class="sep">/</span><span>${p.title}</span></div>
      <div class="page-badge"><i class="${p.badgeIcon}"></i> ${p.badgeText}</div>
      <h1>${p.heroH1}</h1>
      <p class="hero-desc">${p.heroDesc}</p>${statsHtml}
    </div>
  </section>`;
}

function concernSection(p) {
  if (!p.concerns || !p.concerns.length) return '';
  const isGrid = p.concernType === 'grid';
  const h2 = p.concernH2 || `혹시 이런 <span class="text-gradient">고민</span> 하고 계시죠?`;
  const sub = p.concernSub || '많은 분들이 같은 걱정을 하십니다';
  
  if (isGrid) {
    return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${h2}</h2>
          <p class="section-subtitle">${sub}</p>
        </div>
        <div class="concern-grid">
${p.concerns.map(c => `          <div class="concern-card">
            <div class="concern-icon"><i class="${c.icon}"></i></div>
            <h3>${c.title}</h3>
            <p>${c.text}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;
  }
  // problem→solution rows
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${h2}</h2>
          <p class="section-subtitle">${sub}</p>
        </div>
        <div style="max-width:700px;margin:0 auto;">
${p.concerns.map(c => `          <div class="concern-item-row">
            <span class="problem-icon"><i class="fas fa-times-circle"></i></span>
            <span class="problem-text">"${c.problem}"</span>
            <span class="arrow"><i class="fas fa-arrow-right"></i></span>
            <span class="solution-text">${c.solution}</span>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;
}

function stageSection(p) {
  if (!p.stages || !p.stages.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.stageH2}</h2>
          <p class="section-subtitle">${p.stageSub}</p>
        </div>
        <div class="stage-grid">
${p.stages.map((s, i) => {
  const symptoms = s.symptoms ? `\n            <div class="stage-symptoms">${s.symptoms.map(sym => `<span>${sym}</span>`).join('')}</div>` : '';
  const treatment = s.treatment ? `\n            <div class="stage-treatment"><strong>치료:</strong> ${s.treatment}</div>` : '';
  const label = s.label ? `<span class="stage-label ${s.labelClass || ''}">${s.label}</span>` : '';
  return `          <div class="stage-card-v2">
            <div class="stage-num">${i + 1}</div>
            <div class="stage-body">
              <h3>${s.title} ${label}</h3>
              <p>${s.desc}</p>${symptoms}${treatment}
            </div>
          </div>`;
}).join('\n')}
        </div>
      </div>
    </section>`;
}

function typeSection(p) {
  if (!p.types || !p.types.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.typeH2}</h2>
          <p class="section-subtitle">${p.typeSub}</p>
        </div>
        <div class="type-grid">
${p.types.map(t => {
  const badge = t.badge ? `\n            <div class="type-badge">${t.badge}</div>` : '';
  const featured = t.featured ? ' featured' : '';
  const features = t.features ? `\n            <ul class="type-features">\n${t.features.map(f => `              <li><i class="fas fa-check"></i> ${f}</li>`).join('\n')}\n            </ul>` : '';
  const recommend = t.recommend ? `\n            <div class="type-recommend"><strong>추천:</strong> ${t.recommend}</div>` : '';
  return `          <div class="type-card${featured}">${badge}
            <div class="type-icon"><i class="${t.icon}"></i></div>
            <h3>${t.title}</h3>
            <p>${t.desc}</p>${features}${recommend}
          </div>`;
}).join('\n')}
        </div>
      </div>
    </section>`;
}

function diffSection(p) {
  if (!p.diffs || !p.diffs.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.diffH2}</h2>
          <p class="section-subtitle">${p.diffSub}</p>
        </div>
        <div class="diff-grid">
${p.diffs.map((d, i) => `          <div class="diff-card">
            <div class="diff-num">${String(i + 1).padStart(2, '0')}</div>
            <h3>${d.title}</h3>
            <p>${d.desc}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;
}

function processSection(p) {
  if (!p.process || !p.process.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.processH2}</h2>
          <p class="section-subtitle">${p.processSub}</p>
        </div>
        <div class="process-timeline-v2">
${p.process.map((s, i) => `          <div class="process-step-v2">
            <div class="step-dot">${i + 1}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;
}

function compareSection(p) {
  if (!p.compare) return '';
  const c = p.compare;
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${c.h2}</h2>
          <p class="section-subtitle">${c.sub}</p>
        </div>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead><tr>${c.cols.map((col, i) => `<th scope="col"${i === c.highlight ? ' class="col-highlight"' : ''}>${col}</th>`).join('')}</tr></thead>
            <tbody>
${c.rows.map(row => `              <tr>${row.map((cell, i) => `<td${i === c.highlight ? ' class="col-highlight"' : ''}>${cell}</td>`).join('')}</tr>`).join('\n')}
            </tbody>
          </table>
        </div>
${c.note ? `        <p style="text-align:center;margin-top:var(--space-lg);font-size:var(--text-sm);color:var(--color-gray-500);"><i class="fas fa-info-circle" style="color:var(--color-primary);margin-right:4px;"></i>${c.note}</p>` : ''}
      </div>
    </section>`;
}

function optionSection(p) {
  if (!p.options || !p.options.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.optionH2}</h2>
          <p class="section-subtitle">${p.optionSub}</p>
        </div>
        <div class="treatment-options">
${p.options.map(o => {
  const tags = o.tags ? `\n            <div class="opt-tags">${o.tags.map(t => `<span>${t}</span>`).join('')}</div>` : '';
  const link = o.link ? `\n            <a href="${o.link}" class="opt-link">자세히 보기 <i class="fas fa-arrow-right"></i></a>` : '';
  return `          <div class="treatment-option-card">
            <div class="opt-icon"><i class="${o.icon}"></i></div>
            <h3>${o.title}</h3>
            <p>${o.desc}</p>${tags}${link}
          </div>`;
}).join('\n')}
        </div>
      </div>
    </section>`;
}

function preventionSection(p) {
  if (!p.prevention || !p.prevention.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.preventionH2 || '예방이 <span class="text-gradient">최선</span>입니다'}</h2>
          <p class="section-subtitle">${p.preventionSub || '올바른 관리 습관으로 건강한 치아를 유지하세요'}</p>
        </div>
        <div class="prevention-grid-v2">
${p.prevention.map(v => `          <div class="prevention-card-v2">
            <div class="prev-icon"><i class="${v.icon}"></i></div>
            <h4>${v.title}</h4>
            <p>${v.text}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;
}

function precautionSection(p) {
  if (!p.precautions || !p.precautions.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.precautionH2 || '치료 전후 <span class="text-gradient">주의사항</span>'}</h2>
          <p class="section-subtitle">${p.precautionSub || '성공적인 치료를 위해 꼭 확인해주세요'}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--space-lg);">
${p.precautions.map(pc => `          <div class="precaution-card-v2">
            <h3><i class="${pc.icon}"></i> ${pc.title}</h3>
            <ul>
${pc.items.map(item => `              <li>${item}</li>`).join('\n')}
            </ul>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;
}

function reviewSection(p) {
  if (!p.reviews || !p.reviews.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>실제 <span class="text-gradient">환자 후기</span></h2>
          <p class="section-subtitle">네이버·구글에서 검증된 실제 후기입니다</p>
        </div>
        <div class="review-grid-v2">
${p.reviews.map(r => `          <div class="review-card-v2">
            <div class="review-header">
              <div class="review-avatar">${r.name[0]}</div>
              <div><div class="review-name">${r.name}</div><span class="review-source ${r.source}">${r.source === 'naver' ? '네이버' : '구글'}</span></div>
            </div>
            <div class="review-stars">${'<i class="fas fa-star"></i>'.repeat(5)}</div>
            <p class="review-text">${r.text}</p>
            <div class="review-tags">${r.tags.map(t => `<span>${t}</span>`).join('')}</div>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;
}

function faqSection(p) {
  if (!p.faqs || !p.faqs.length) return '';
  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>자주 묻는 <span class="text-gradient">질문</span></h2>
          <p class="section-subtitle">궁금한 점을 확인하세요</p>
        </div>
        <div class="faq-list">
${p.faqs.map((f, i) => `          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-${i + 1}">
              <span class="faq-q-badge">Q</span>
              <span class="faq-q-text">${f.q}</span>
              <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="faq-answer" id="faq-${i + 1}" role="region"><p>${f.a}</p></div>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;
}

function ctaSection(p) {
  return `
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <span class="cta-badge">상담 안내</span>
          <h2>${p.ctaH2 || p.title + ', 전문가와 상담하세요'}</h2>
          <p>${p.ctaDesc || '정확한 진단을 통해 꼭 필요한 치료만 안내드립니다.'}</p>
          <div class="cta-buttons">
            <a href="../reservation.html" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
            <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
          </div>
          <p class="cta-phone"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
        </div>
      </div>
    </section>`;
}

function pageNavSection(p) {
  if (!p.prevPage && !p.nextPage) return '';
  const prev = p.prevPage ? `<a href="${p.prevPage.file}" class="prev"><span class="nav-label"><i class="fas fa-arrow-left"></i> 이전</span><span class="nav-title">${p.prevPage.title}</span></a>` : '<span></span>';
  const next = p.nextPage ? `<a href="${p.nextPage.file}" class="next"><span class="nav-label">다음 <i class="fas fa-arrow-right"></i></span><span class="nav-title">${p.nextPage.title}</span></a>` : '<span></span>';
  return `
    <section class="section-sm">
      <div class="container">
        <div class="page-nav-v2">
          ${prev}
          ${next}
        </div>
      </div>
    </section>`;
}

function legalSection() {
  return `
    <section class="section-sm">
      <div class="container">
        <div class="legal-box">*본 정보는 의료법 및 의료광고 심의 기준을 준수하며, 개인에 따라 결과가 다를 수 있습니다. 반드시 전문의와 상담 후 결정하시기 바랍니다.</div>
      </div>
    </section>`;
}

// ───────── 전체 페이지 조립 ─────────

function buildPage(p) {
  let mainContent = heroSection(p);
  mainContent += concernSection(p);
  if (p.stages) mainContent += stageSection(p);
  if (p.types) mainContent += typeSection(p);
  if (p.options) mainContent += optionSection(p);
  if (p.diffs) mainContent += diffSection(p);
  mainContent += processSection(p);
  if (p.compare) mainContent += compareSection(p);
  if (p.prevention) mainContent += preventionSection(p);
  if (p.precautions) mainContent += precautionSection(p);
  mainContent += reviewSection(p);
  mainContent += faqSection(p);
  mainContent += ctaSection(p);
  mainContent += pageNavSection(p);
  mainContent += legalSection();

  return `${head(p)}
${header()}
  <main id="main-content" role="main">
${mainContent}
  </main>
${footer()}
${mobileNav()}`;
}

// ───────── 페이지 데이터 로드 ─────────
const pages = require('./treatment-pages-data.cjs');

// ───────── 실행 ─────────
let ok = 0, fail = 0;
pages.forEach(p => {
  try {
    const html = buildPage(p);
    fs.writeFileSync(path.join(TREATMENTS_DIR, p.file), html, 'utf8');
    const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
    console.log(`✅ ${p.file} (${kb}KB)`);
    ok++;
  } catch (e) {
    console.error(`❌ ${p.file}: ${e.message}`);
    fail++;
  }
});

console.log(`\n═══ DONE: ${ok} rebuilt, ${fail} failed ═══`);
