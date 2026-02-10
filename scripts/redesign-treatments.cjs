#!/usr/bin/env node
/**
 * Treatment Subpage Redesign Script
 * Extracts <head> + header/footer/mobile-nav from existing pages,
 * replaces <main> content with new design system markup.
 */
const fs = require('fs');
const path = require('path');

const treatmentsDir = path.join(__dirname, '..', 'treatments');

// ────────────────── COMMON FRAGMENTS ──────────────────

function getCommonHeader() {
  return `  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
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

function getCommonFooter() {
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
  </footer>
  <nav class="mobile-nav" id="mobileNav" aria-label="모바일 메뉴">
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
    document.addEventListener('DOMContentLoaded',function(){var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});els.forEach(function(el){obs.observe(el);});});
  </script>`;
}

function getCTA(title, desc) {
  return `
  <!-- CTA -->
  <section class="cta-section" aria-label="상담 안내">
    <div class="container">
      <div class="cta-box reveal">
        <span class="cta-badge">상담 안내</span>
        <h2>${title}</h2>
        <p>${desc}</p>
        <div class="cta-buttons">
          <a href="../reservation.html" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
          <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
        </div>
        <p class="cta-phone"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
      </div>
    </div>
  </section>`;
}

function getPageNav(prev, next) {
  let html = '\n  <!-- Page Navigation -->\n  <section class="section-sm">\n    <div class="container">\n      <div class="page-nav-v2">';
  if (prev) html += `\n        <a href="${prev.href}" class="prev"><span class="nav-label"><i class="fas fa-arrow-left"></i> 이전</span><span class="nav-title">${prev.title}</span></a>`;
  if (next) html += `\n        <a href="${next.href}" class="next"><span class="nav-label">다음 <i class="fas fa-arrow-right"></i></span><span class="nav-title">${next.title}</span></a>`;
  html += '\n      </div>\n    </div>\n  </section>';
  return html;
}

function sectionWrap(cls, inner) {
  return `\n  <section class="section${cls ? ' ' + cls : ''}">\n    <div class="container">${inner}\n    </div>\n  </section>`;
}

function sectionHeader(badge, badgeIcon, title, subtitle) {
  return `\n      <div class="section-header reveal">\n        <span class="section-badge"><i class="fas fa-${badgeIcon}"></i> ${badge}</span>\n        <h2 class="section-title">${title}</h2>\n        <p class="section-subtitle">${subtitle}</p>\n      </div>`;
}

function concernCards(items) {
  let html = '\n      <div class="concern-grid reveal">';
  items.forEach(item => {
    html += `\n        <div class="concern-card"><div class="concern-icon"><i class="fas fa-${item.icon}"></i></div><h3>${item.title}</h3><p>${item.desc}</p></div>`;
  });
  html += '\n      </div>';
  return html;
}

function concernRows(items) {
  let html = '\n      <div class="concern-rows reveal" style="max-width:700px;margin:0 auto;">';
  items.forEach(item => {
    html += `\n        <div class="concern-item-row"><span class="problem-icon"><i class="fas fa-times-circle"></i></span><span class="problem-text">"${item.problem}"</span><span class="arrow"><i class="fas fa-arrow-right"></i></span><span class="solution-text">${item.solution}</span></div>`;
  });
  html += '\n      </div>';
  return html;
}

function keySummary(text) {
  return `\n      <div class="key-summary reveal">\n        <h3><i class="fas fa-lightbulb"></i> 핵심 요약</h3>\n        <p>${text}</p>\n      </div>`;
}

function diffGrid(items) {
  let html = '\n      <div class="diff-grid reveal">';
  items.forEach((item, i) => {
    html += `\n        <div class="diff-card"><div class="diff-num">${String(i+1).padStart(2,'0')}</div><h3>${item.title}</h3><p>${item.desc}</p></div>`;
  });
  html += '\n      </div>';
  return html;
}

function processTimeline(steps) {
  let html = '\n      <div class="process-timeline-v2 reveal">';
  steps.forEach((step, i) => {
    html += `\n        <div class="process-step-v2"><div class="step-dot">${i+1}</div><h3>${step.title}</h3><p>${step.desc}</p></div>`;
  });
  html += '\n      </div>';
  return html;
}

function infoQuickCards(items) {
  let html = '\n      <div class="info-quick-grid reveal">';
  items.forEach(item => {
    html += `\n        <div class="info-quick-card"><div class="info-icon"><i class="fas fa-${item.icon}"></i></div><div class="info-label">${item.label}</div><div class="info-value">${item.value}</div></div>`;
  });
  html += '\n      </div>';
  return html;
}

function faqSection(items) {
  let html = `${sectionHeader('FAQ', 'comment-dots', '자주 묻는 <span class="text-gradient">질문</span>', '궁금하신 점을 확인하세요')}\n      <div class="faq-list reveal">`;
  items.forEach((item, i) => {
    html += `\n        <div class="faq-item"><button class="faq-question" aria-expanded="false" aria-controls="faq-${i}"><span class="faq-q-badge">Q</span><span class="faq-q-text">${item.q}</span><span class="faq-icon"><i class="fas fa-chevron-down"></i></span></button><div class="faq-answer" id="faq-${i}" role="region"><p>${item.a}</p></div></div>`;
  });
  html += '\n      </div>';
  return html;
}

function precautionCards(items) {
  let html = '\n      <div class="precaution-grid reveal">';
  items.forEach(item => {
    html += `\n        <div class="precaution-card-v2"><h3><i class="fas fa-${item.icon}"></i> ${item.title}</h3><ul>`;
    item.items.forEach(li => { html += `<li>${li}</li>`; });
    html += '</ul></div>';
  });
  html += '\n      </div>';
  return html;
}

function typeCards(items) {
  let html = '\n      <div class="type-grid reveal">';
  items.forEach(item => {
    const feat = item.featured ? ' featured' : '';
    const badge = item.badge ? `<div class="type-badge">${item.badge}</div>` : '';
    html += `\n        <div class="type-card${feat}">${badge}<div class="type-icon"><i class="fas fa-${item.icon}"></i></div><h3>${item.title}</h3><p>${item.desc}</p>`;
    if (item.features) {
      html += '<ul class="type-features">';
      item.features.forEach(f => { html += `<li><i class="fas fa-check"></i> ${f}</li>`; });
      html += '</ul>';
    }
    if (item.recommend) html += `<div class="type-recommend"><strong>추천:</strong> ${item.recommend}</div>`;
    html += '</div>';
  });
  html += '\n      </div>';
  return html;
}

function treatmentOptions(items) {
  let html = '\n      <div class="treatment-options reveal">';
  items.forEach(item => {
    html += `\n        <div class="treatment-option-card"><div class="opt-icon"><i class="fas fa-${item.icon}"></i></div><h3>${item.title}</h3><p>${item.desc}</p>`;
    if (item.tags) {
      html += '<div class="opt-tags">';
      item.tags.forEach(t => { html += `<span>${t}</span>`; });
      html += '</div>';
    }
    if (item.link) html += `<a href="${item.link}" class="opt-link">자세히 보기 <i class="fas fa-arrow-right"></i></a>`;
    html += '</div>';
  });
  html += '\n      </div>';
  return html;
}

function stageCards(items) {
  let html = '\n      <div class="stage-grid reveal">';
  items.forEach((item, i) => {
    const labelCls = item.severity === '경미' ? 'mild' : item.severity === '주의' ? 'caution' : item.severity === '심각' ? 'critical' : 'danger';
    html += `\n        <div class="stage-card-v2"><div class="stage-num">${i+1}</div><div class="stage-body"><h3>${item.title} <span class="stage-label ${labelCls}">${item.severity}</span></h3><p>${item.desc}</p>`;
    if (item.symptoms) {
      html += '<div class="stage-symptoms">';
      item.symptoms.forEach(s => { html += `<span>${s}</span>`; });
      html += '</div>';
    }
    if (item.treatment) html += `<div class="stage-treatment"><i class="fas fa-check-circle"></i> ${item.treatment}</div>`;
    html += '</div></div>';
  });
  html += '\n      </div>';
  return html;
}

function featureList(items) {
  let html = '\n      <div class="feature-list reveal">';
  items.forEach(item => {
    html += `\n        <div class="feature-list-item"><i class="fl-icon fas fa-check-circle"></i><div><strong>${item.title}</strong><p>${item.desc}</p></div></div>`;
  });
  html += '\n      </div>';
  return html;
}

function preventionGrid(items) {
  let html = '\n      <div class="prevention-grid-v2 reveal">';
  items.forEach(item => {
    html += `\n        <div class="prevention-card-v2"><div class="prev-icon"><i class="fas fa-${item.icon}"></i></div><div><h4>${item.title}</h4><p>${item.desc}</p></div></div>`;
  });
  html += '\n      </div>';
  return html;
}

function reviewCards(items) {
  let html = '\n      <div class="review-grid-v2 reveal">';
  items.forEach(item => {
    html += `\n        <div class="review-card-v2"><div class="review-header"><div class="review-avatar">${item.name[0]}</div><div><div class="review-name">${item.name}</div><span class="review-source ${item.source}">${item.source === 'naver' ? '<i class="fas fa-check-circle"></i> 네이버' : '<i class="fab fa-google"></i> 구글'}</span></div></div><div class="review-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p class="review-text">${item.text}</p>`;
    if (item.tags) {
      html += '<div class="review-tags">';
      item.tags.forEach(t => { html += `<span>${t}</span>`; });
      html += '</div>';
    }
    html += '</div>';
  });
  html += '\n      </div>';
  return html;
}

// ────────────────── BUILD PAGE ──────────────────

function buildPage(data) {
  const { slug, title, metaDesc, keywords, canonical,
          heroTitle, heroDesc, heroBadge, heroBadgeIcon, heroStats,
          mainContent, ctaTitle, ctaDesc, prevPage, nextPage } = data;

  const shortTitle = title.replace(' | 서울비디치과', '');
  
  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${title}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/${slug}.html">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/${slug}.html">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDesc}">
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
  <link rel="stylesheet" href="../css/site-v5.css?v=20260210">
  <link rel="prefetch" href="../reservation.html" as="document">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"진료 안내","item":"https://bdbddc.com/treatments/"},{"@type":"ListItem","position":3,"name":"${shortTitle}","item":"https://bdbddc.com/treatments/${slug}.html"}]}
  </script>
</head>
<body>
${getCommonHeader()}

  <main id="main-content" role="main">

  <!-- Hero -->
  <section class="treatment-page-hero" aria-label="${shortTitle}">
    <div class="container">
      <div class="breadcrumb reveal"><a href="../">홈</a><span class="sep">/</span><a href="index.html">진료 안내</a><span class="sep">/</span><span>${shortTitle}</span></div>
      <div class="page-badge reveal"><i class="fas fa-${heroBadgeIcon}"></i> ${heroBadge}</div>
      <h1 class="reveal">${heroTitle}</h1>
      <p class="hero-desc reveal">${heroDesc}</p>
      ${heroStats ? (() => {
        let s = '<div class="hero-stats reveal">';
        heroStats.forEach(st => { s += `<div class="stat-item"><span class="stat-value">${st.value}</span><span class="stat-label">${st.label}</span></div>`; });
        s += '</div>';
        return s;
      })() : ''}
    </div>
  </section>
${mainContent}
${getCTA(ctaTitle, ctaDesc)}
${getPageNav(prevPage, nextPage)}

  <!-- Legal -->
  <section class="section-sm">
    <div class="container">
      <div class="legal-box">*본 정보는 의료법 및 의료광고 심의 기준을 준수하며, 개인에 따라 결과가 다를 수 있습니다. 반드시 전문의와 상담 후 결정하시기 바랍니다.</div>
    </div>
  </section>

  </main>
${getCommonFooter()}

</body>
</html>`;
}

// ────────────────── PAGE DATA ──────────────────

const pageOrder = [
  'glownate','implant','invisalign','pediatric','aesthetic',
  'cavity','resin','inlay','crown','root-canal','whitening','bridge','denture',
  're-root-canal','apicoectomy',
  'scaling','gum','gum-surgery','periodontitis','wisdom-tooth','emergency',
  'tmj','bruxism','prevention'
];

function getNavLinks(slug) {
  const idx = pageOrder.indexOf(slug);
  const prev = idx > 0 ? { href: pageOrder[idx-1]+'.html', title: getShortName(pageOrder[idx-1]) } : { href: 'index.html', title: '전체 진료 안내' };
  const next = idx < pageOrder.length - 1 ? { href: pageOrder[idx+1]+'.html', title: getShortName(pageOrder[idx+1]) } : null;
  return { prev, next };
}

function getShortName(slug) {
  const map = {
    'glownate':'글로우네이트','implant':'임플란트','invisalign':'치아교정','pediatric':'소아치과',
    'aesthetic':'심미치료','cavity':'충치치료','resin':'레진치료','inlay':'인레이/온레이',
    'crown':'크라운','root-canal':'신경치료','whitening':'미백','bridge':'브릿지','denture':'틀니',
    're-root-canal':'재신경치료','apicoectomy':'치근단절제술',
    'scaling':'스케일링','gum':'잇몸치료','gum-surgery':'잇몸수술',
    'periodontitis':'치주염','wisdom-tooth':'사랑니 발치','emergency':'응급진료',
    'tmj':'턱관절장애','bruxism':'이갈이/이악물기','prevention':'예방치료'
  };
  return map[slug] || slug;
}

// ────────────────── INDIVIDUAL PAGE BUILDERS ──────────────────

function buildGlownate() {
  const nav = getNavLinks('glownate');
  let content = '';
  content += sectionWrap('', 
    keySummary('<strong>글로우네이트</strong>는 서울비디치과만의 시그니처 심미 시술입니다. 라미네이트 + 잇몸성형 + 미백을 결합한 원스톱 스마일 메이크오버로, 0.3~0.5mm의 최소 삭제만으로 자연스러운 미소를 완성합니다.') +
    concernCards([
      { icon: 'frown', title: '치아 색이 어두워요', desc: '미백으로 해결되지 않는 심한 변색도 자연스럽게 개선합니다' },
      { icon: 'teeth', title: '치아가 벌어져 있어요', desc: '교정 없이 단기간에 가지런한 치아 배열을 만듭니다' },
      { icon: 'smile', title: '웃을 때 자신 없어요', desc: '얼굴형에 맞는 맞춤 스마일 디자인을 제공합니다' },
      { icon: 'tooth', title: '형태가 불규칙해요', desc: '치아 크기와 모양을 균일하게 개선합니다' }
    ])
  );
  content += sectionWrap('',
    sectionHeader('Features', 'gem', '글로우네이트 <span class="text-gradient">특징</span>', '서울비디치과만의 프리미엄 라미네이트 브랜드') +
    featureList([
      { title: '최소 삭제 기법', desc: '0.3~0.5mm의 최소한의 치아 삭제로 자연치아를 최대한 보존합니다.' },
      { title: '디지털 디자인 시스템', desc: '3D 스캔과 디지털 시뮬레이션으로 치료 전 결과를 미리 확인합니다.' },
      { title: '원내 기공소 협업', desc: '디지털 기공소에서 즉각적인 피드백과 정밀한 보철물을 제작합니다.' },
      { title: '자연스러운 투명도', desc: '프리미엄 세라믹 소재로 자연치아와 동일한 투명도를 구현합니다.' }
    ])
  );
  content += sectionWrap('',
    sectionHeader('Process', 'list-ol', '치료 <span class="text-gradient">과정</span>', '정밀한 단계별 프로세스로 만족스러운 결과를 만듭니다') +
    processTimeline([
      { title: '정밀 검진', desc: 'BDX 검진으로 구강 상태를 정밀 분석합니다' },
      { title: '디자인 상담', desc: '3D 시뮬레이션으로 결과를 미리 확인합니다' },
      { title: '최소 삭제', desc: '0.3~0.5mm 최소 삭제로 치아를 준비합니다' },
      { title: '정밀 인상', desc: '디지털 스캔으로 정밀한 인상을 채득합니다' },
      { title: '맞춤 제작', desc: '원내 기공소에서 맞춤 보철물을 제작합니다' },
      { title: '정밀 부착', desc: '특수 접착제로 라미네이트를 부착합니다' },
      { title: '마무리 조정', desc: '교합 및 심미성을 최종 조정합니다' }
    ]) +
    infoQuickCards([
      { icon: 'clock', label: '치료 기간', value: '2~3주' },
      { icon: 'hospital', label: '내원 횟수', value: '2~3회' },
      { icon: 'infinity', label: '유지 기간', value: '10~15년+' }
    ])
  );
  content += sectionWrap('',
    sectionHeader('Why BD', 'star', '서울비디 글로우네이트가 <span class="text-gradient">특별한 이유</span>', '차별화된 기술과 시스템') +
    diffGrid([
      { title: 'BDX 정밀 검진', desc: '치료 전 정밀 검진으로 최적의 치료 계획을 수립합니다.' },
      { title: '심미 전문 협진', desc: '심미보철 전문 의료진들이 함께 좋은 결과를 만듭니다.' },
      { title: '원내 디지털 기공소', desc: '즉각적인 피드백과 높은 품질의 보철물을 제작합니다.' },
      { title: '자연스러운 디자인', desc: '환자 얼굴형과 피부톤에 맞는 맞춤 디자인을 제공합니다.' },
      { title: '최소 삭제 원칙', desc: '자연치아를 최대한 보존하는 보존적 접근법을 적용합니다.' },
      { title: '체계적 사후 관리', desc: '정기 검진과 케어 프로그램으로 오랜 유지를 돕습니다.' }
    ])
  );
  content += sectionWrap('',
    sectionHeader('주의사항', 'shield-alt', '치료 전후 <span class="text-gradient">주의사항</span>', '더 좋은 결과를 위해 확인해주세요') +
    precautionCards([
      { icon: 'clipboard-check', title: '치료 전', items: ['충치나 잇몸 질환이 있다면 먼저 치료가 필요합니다','이갈이가 심한 경우 사전 상담이 필요합니다','디지털 시뮬레이션으로 결과를 충분히 확인하세요'] },
      { icon: 'procedures', title: '치료 당일', items: ['시술 후 당일은 끈적이는 음식을 피해주세요','임시 보철물 착용 시 딱딱한 음식은 피해주세요','약간의 시린 증상은 정상입니다'] },
      { icon: 'heart', title: '치료 후 관리', items: ['딱딱한 음식을 앞니로 베어 무는 것을 피해주세요','이갈이가 있다면 나이트가드 착용을 권장합니다','정기적인 검진으로 상태를 확인하세요'] }
    ])
  );
  content += sectionWrap('',
    faqSection([
      { q: '라미네이트는 얼마나 오래 사용할 수 있나요?', a: '관리 상태에 따라 평균 <strong>10~15년 이상</strong> 사용 가능합니다. 올바른 칫솔질, 정기 검진, 딱딱한 음식 주의 등의 관리가 중요합니다.' },
      { q: '치아를 많이 깎아야 하나요?', a: '서울비디치과의 글로우네이트는 <strong>최소 삭제 기법</strong>을 사용합니다. 0.3~0.5mm 정도의 최소한의 삭제만으로 치료가 진행됩니다.' },
      { q: '시술 후 착색되나요?', a: '세라믹 라미네이트는 일반 치아보다 <strong>착색에 강합니다</strong>. 표면이 매끄럽고 비다공성이어서 착색 물질이 쉽게 침투하지 않습니다.' },
      { q: '빠지거나 깨질 수 있나요?', a: '현대적인 접착 기술로 <strong>탈락 가능성은 매우 낮습니다</strong>. 다만, 딱딱한 음식이나 이갈이가 있는 경우 손상 위험이 있습니다.' },
      { q: '글로우네이트와 일반 라미네이트의 차이점은?', a: '<strong>글로우네이트</strong>는 서울비디치과만의 프리미엄 브랜드입니다. 최소 삭제, 디지털 디자인, 원내 기공소 협업으로 더 정밀하고 자연스러운 결과를 제공합니다.' },
      { q: '시술 비용은 어떻게 되나요?', a: '치아 상태, 개수, 재료에 따라 달라집니다. 정밀 검진 후 <strong>합리적인 치료 계획</strong>을 제안드립니다. <a href="../pricing.html">비용 가이드 보기</a>' }
    ])
  );
  return buildPage({
    slug: 'glownate', title: '글로우네이트 | 서울비디치과',
    metaDesc: '서울비디치과 글로우네이트 — 라미네이트 + 잇몸성형 + 미백 = 글로우네이트 — 원스톱 스마일 메이크오버',
    keywords: '천안 글로우네이트, 서울비디치과 글로우네이트, 라미네이트',
    heroBadge: 'Signature', heroBadgeIcon: 'gem',
    heroTitle: '하루 만에 빛나는 미소<br><span class="text-gradient">글로우네이트</span>',
    heroDesc: '서울비디치과만의 시그니처 심미 시술 — 라미네이트 + 잇몸성형 + 미백의 원스톱 스마일 메이크오버',
    heroStats: [{ value: '0.3mm', label: '최소 삭제' },{ value: '2~3주', label: '치료 기간' },{ value: '15년+', label: '유지 기간' }],
    mainContent: content,
    ctaTitle: '빛나는 미소, 지금 만나보세요',
    ctaDesc: '글로우네이트 상담을 예약하고 나만의 미소를 디자인하세요.',
    prevPage: nav.prev, nextPage: nav.next
  });
}

// Since this is getting very long, let me create a generic builder that extracts content from existing pages
function buildGenericPage(slug) {
  const nav = getNavLinks(slug);
  const shortName = getShortName(slug);
  
  // Read existing file to extract content
  const existingPath = path.join(treatmentsDir, `${slug}.html`);
  const existing = fs.readFileSync(existingPath, 'utf-8');
  
  // Extract meta
  const titleMatch = existing.match(/<title>([^<]+)<\/title>/);
  const descMatch = existing.match(/name="description" content="([^"]+)"/);
  const keywordsMatch = existing.match(/name="keywords" content="([^"]+)"/);
  
  const fullTitle = titleMatch ? titleMatch[1] : `${shortName} | 서울비디치과`;
  const metaDesc = descMatch ? descMatch[1] : `서울비디치과 ${shortName}`;
  const keywords = keywordsMatch ? keywordsMatch[1] : `천안 ${shortName}, 서울비디치과 ${shortName}`;

  // Extract hero content
  const heroHeadlineMatch = existing.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  let heroTitle = heroHeadlineMatch ? heroHeadlineMatch[1].trim().replace(/\s+/g, ' ') : `<span class="text-gradient">${shortName}</span>`;
  
  const heroSubMatch = existing.match(/hero-sub[^>]*>([\s\S]*?)<\/p>/);
  let heroDesc = heroSubMatch ? heroSubMatch[1].trim().replace(/\s+/g, ' ').replace(/<br\s*\/?>/g, ' ') : metaDesc;
  
  // Extract all sections between <main> and </main>
  const mainMatch = existing.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) {
    console.error(`  [WARN] No <main> found in ${slug}.html, using fallback`);
    return null;
  }
  
  let mainHTML = mainMatch[1];
  
  // Remove old hero section
  mainHTML = mainHTML.replace(/<section class="hero"[\s\S]*?<\/section>/g, '');
  
  // Remove duplicate <main> tags
  mainHTML = mainHTML.replace(/<main[^>]*>/g, '').replace(/<\/main>/g, '');
  
  // Remove old header comments
  mainHTML = mainHTML.replace(/<!-- Header[^-]*-->/g, '');
  mainHTML = mainHTML.replace(/<!-- Hero Section -->/g, '');
  
  // Fix old class names to new design system
  mainHTML = mainHTML.replace(/class="empathy-section"/g, 'class="section"');
  mainHTML = mainHTML.replace(/class="stages-section section-dark"/g, 'class="section"');
  mainHTML = mainHTML.replace(/class="treatments-section"/g, 'class="section"');
  mainHTML = mainHTML.replace(/class="difference-section"/g, 'class="section"');
  mainHTML = mainHTML.replace(/class="prevention-section section-gradient"/g, 'class="section"');
  mainHTML = mainHTML.replace(/class="faq-section"/g, 'class="section"');
  mainHTML = mainHTML.replace(/class="cta-section"/g, 'class="section cta-section"');
  
  // Fix data-animate and data-stagger attributes
  mainHTML = mainHTML.replace(/ data-animate="[^"]*"/g, '');
  mainHTML = mainHTML.replace(/ data-stagger/g, '');
  
  // Fix section-badge divs to spans
  mainHTML = mainHTML.replace(/<div class="section-badge">/g, '<span class="section-badge">');
  mainHTML = mainHTML.replace(/<\/div>(\s*<h2 class="section-title">)/g, '</span>$1');
  
  // Fix section-desc to section-subtitle
  mainHTML = mainHTML.replace(/class="section-desc"/g, 'class="section-subtitle"');
  
  // Fix text-shimmer to text-gradient
  mainHTML = mainHTML.replace(/text-shimmer/g, 'text-gradient');
  
  // Add reveal class to sections
  mainHTML = mainHTML.replace(/class="section-header"/g, 'class="section-header reveal"');
  
  // Remove duplicate cta-sections (keep only the last one)
  const ctaSections = mainHTML.match(/<section class="[^"]*cta-section[^"]*"[\s\S]*?<\/section>/g);
  if (ctaSections && ctaSections.length > 1) {
    // Remove all but the last CTA
    for (let i = 0; i < ctaSections.length - 1; i++) {
      mainHTML = mainHTML.replace(ctaSections[i], '');
    }
  }
  
  // Remove the remaining CTA section - we'll add our own
  mainHTML = mainHTML.replace(/<section class="[^"]*cta-section[^"]*"[\s\S]*?<\/section>/g, '');
  
  // Remove page-nav sections - we'll add our own
  mainHTML = mainHTML.replace(/<section class="section-sm">[\s\S]*?<div class="page-nav">[\s\S]*?<\/section>/g, '');
  
  // Remove legal notice sections - we'll add our own
  mainHTML = mainHTML.replace(/<section class="section-sm">[\s\S]*?<div class="legal-notice">[\s\S]*?<\/section>/g, '');
  
  // Determine hero badge
  const categoryMap = {
    'glownate': ['Signature', 'gem'],
    'implant': ['전문센터', 'hospital'],
    'invisalign': ['전문센터', 'teeth'],
    'pediatric': ['전문센터', 'child'],
    'aesthetic': ['전문센터', 'sparkles'],
    'cavity': ['보존치료', 'tooth'],
    'resin': ['보존치료', 'fill-drip'],
    'inlay': ['보존치료', 'puzzle-piece'],
    'crown': ['보존치료', 'crown'],
    'root-canal': ['보존치료', 'stethoscope'],
    'whitening': ['심미치료', 'sun'],
    'bridge': ['보철치료', 'bridge'],
    'denture': ['보철치료', 'teeth-open'],
    're-root-canal': ['보존치료', 'redo'],
    'apicoectomy': ['외과치료', 'cut'],
    'scaling': ['예방치료', 'shower'],
    'gum': ['잇몸치료', 'heartbeat'],
    'gum-surgery': ['잇몸치료', 'scalpel'],
    'periodontitis': ['잇몸치료', 'disease'],
    'wisdom-tooth': ['외과치료', 'tooth'],
    'emergency': ['응급진료', 'ambulance'],
    'tmj': ['전문치료', 'head-side-cough'],
    'bruxism': ['전문치료', 'teeth'],
    'prevention': ['예방치료', 'shield-alt']
  };
  
  const ctaMap = {
    'glownate': ['빛나는 미소, 지금 만나보세요', '글로우네이트 상담을 예약하고 나만의 미소를 디자인하세요.'],
    'implant': ['임플란트, 어디서 하느냐가 결과를 바꿉니다', '포기하지 마세요. 다른 곳에서 안 된다고 했어도 방법을 찾아드리겠습니다.'],
    'invisalign': ['투명 교정, 지금 시작하세요', '인비절라인 상담을 예약하고 가지런한 미소를 만나세요.'],
    'pediatric': ['우리 아이 첫 치과, 서울비디가 함께합니다', '소아치과 전문의가 아이의 구강 건강을 지켜드립니다.'],
    'aesthetic': ['자연스럽고 아름다운 미소를 만나보세요', '심미치료 상담을 예약하시고 최적의 치료를 확인하세요.'],
    'cavity': ['충치는 빠를수록 간단합니다', '정기 검진으로 초기에 발견하고 간단하게 치료하세요.'],
    'resin': ['당일 완료, 자연스러운 레진치료', '충치 크기에 맞는 최적의 레진치료를 제안드립니다.'],
    'inlay': ['정밀하고 오래가는 인레이/온레이', '충치 범위에 맞는 최적의 수복 치료를 안내드립니다.'],
    'crown': ['치아를 지키는 마지막 보루, 크라운', '크라운 상담으로 최적의 보철 재료를 선택하세요.'],
    'root-canal': ['아픈 치아도 살릴 수 있습니다', '정밀 신경치료로 자연치아를 지켜드립니다.'],
    'whitening': ['하얗고 밝은 미소를 선물하세요', '전문가 미백 상담을 받아보세요.'],
    'bridge': ['빠진 치아, 브릿지로 해결하세요', '브릿지 상담으로 최적의 치료를 확인하세요.'],
    'denture': ['편안하고 자연스러운 틀니', '맞춤 틀니 상담을 받아보세요.'],
    're-root-canal': ['재신경치료, 포기하지 마세요', '이전 신경치료 실패도 살릴 수 있습니다.'],
    'apicoectomy': ['신경치료 후에도 통증이 있다면', '치근단절제술 상담을 받아보세요.'],
    'scaling': ['건강한 잇몸의 첫 걸음, 스케일링', '정기 스케일링으로 잇몸 건강을 지키세요.'],
    'gum': ['잇몸 건강이 치아 건강입니다', '잇몸치료 상담을 받아보세요.'],
    'gum-surgery': ['심한 잇몸질환도 치료할 수 있습니다', '잇몸수술 상담을 예약하세요.'],
    'periodontitis': ['치주염, 조기 치료가 중요합니다', '치주염 검진을 받아보세요.'],
    'wisdom-tooth': ['사랑니, 안전하게 발치하세요', '사랑니 발치 상담을 받아보세요.'],
    'emergency': ['365일 응급진료 가능합니다', '긴급한 상황, 먼저 전화주세요.'],
    'tmj': ['턱관절 통증, 참지 마세요', '턱관절장애 전문 상담을 받아보세요.'],
    'bruxism': ['이갈이, 방치하면 치아가 망가집니다', '이갈이/이악물기 상담을 받아보세요.'],
    'prevention': ['예방이 최고의 치료입니다', '정기 검진으로 구강 건강을 지키세요.']
  };
  
  const [heroBadge, heroBadgeIcon] = categoryMap[slug] || ['진료', 'tooth'];
  const [ctaTitle, ctaDesc] = ctaMap[slug] || [`${shortName} 상담을 받아보세요`, '편하게 문의해주세요.'];
  
  // Fix icon names that don't exist
  const iconFixes = {
    'redo': 'sync-alt',
    'bridge': 'archway',
    'disease': 'virus',
    'scalpel': 'cut',
    'shower': 'tint',
    'sparkles': 'star',
    'teeth-open': 'teeth'
  };
  const fixedIcon = iconFixes[heroBadgeIcon] || heroBadgeIcon;
  
  return buildPage({
    slug, title: fullTitle, metaDesc, keywords,
    heroBadge, heroBadgeIcon: fixedIcon,
    heroTitle, heroDesc,
    heroStats: null,
    mainContent: mainHTML.trim(),
    ctaTitle, ctaDesc,
    prevPage: nav.prev, nextPage: nav.next
  });
}

// ────────────────── MAIN ──────────────────

console.log('Starting treatment page redesign...\n');

// Special pages with fully custom content
const specialPages = {
  'glownate': buildGlownate
};

let count = 0;
let errors = [];

for (const slug of pageOrder) {
  try {
    let html;
    if (specialPages[slug]) {
      html = specialPages[slug]();
    } else {
      html = buildGenericPage(slug);
    }
    
    if (html) {
      const outPath = path.join(treatmentsDir, `${slug}.html`);
      fs.writeFileSync(outPath, html, 'utf-8');
      count++;
      console.log(`  ✅ ${slug}.html (${(html.length/1024).toFixed(1)}KB)`);
    } else {
      errors.push(slug);
      console.log(`  ❌ ${slug}.html - SKIPPED (no content)`);
    }
  } catch (err) {
    errors.push(slug);
    console.error(`  ❌ ${slug}.html - ERROR: ${err.message}`);
  }
}

console.log(`\nDone! ${count}/${pageOrder.length} pages rebuilt.`);
if (errors.length) console.log(`Errors: ${errors.join(', ')}`);
