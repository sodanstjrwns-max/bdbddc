/**
 * 서울비디치과 — 24개 진료 상세 페이지 전면 리빌드
 * 기존 HTML 0% 재활용, 새 CSS 클래스(site-v5.css § 27)만 사용
 * 
 * 사용 클래스: treatment-page-hero, concern-grid, concern-card, concern-item-row,
 *   stage-grid, stage-card-v2, treatment-options, treatment-option-card,
 *   diff-grid, diff-card, process-timeline-v2, process-step-v2,
 *   info-quick-grid, info-quick-card, type-grid, type-card,
 *   compare-table-wrap, compare-table, review-grid-v2, review-card-v2,
 *   prevention-grid-v2, prevention-card-v2, precaution-grid, precaution-card-v2,
 *   feature-list, feature-list-item, page-nav-v2, legal-box, key-summary
 */

const fs = require('fs');
const path = require('path');

const TREATMENTS_DIR = path.join(__dirname, '..', 'treatments');

// ════════════════════════════════════════════════════════
// § 1. 공통 파트 생성 함수
// ════════════════════════════════════════════════════════

function headHTML(title, desc, keywords, canonical) {
  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${title} | 서울비디치과</title>
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/${canonical}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${title} | 서울비디치과">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/${canonical}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} | 서울비디치과">
  <meta name="twitter:description" content="${desc}">
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
  <link rel="stylesheet" href="../css/site-v5.css?v=20260210b">
  <link rel="prefetch" href="../reservation.html" as="document">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"진료 안내","item":"https://bdbddc.com/treatments/"},{"@type":"ListItem","position":3,"name":"${title}","item":"https://bdbddc.com/treatments/${canonical}"}]}
  </script>
</head>`;
}

function headerHTML() {
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

function footerHTML() {
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
  </script>
</body>
</html>`;
}

// ════════════════════════════════════════════════════════
// § 2. 공통 섹션 빌더 함수 (새 CSS 클래스 ONLY)
// ════════════════════════════════════════════════════════

/** Hero 섹션 */
function heroSection(p) {
  let statsHTML = '';
  if (p.heroStats && p.heroStats.length) {
    statsHTML = `\n      <div class="hero-stats">\n` +
      p.heroStats.map(s => `        <div class="stat-item"><span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span></div>`).join('\n') +
      `\n      </div>`;
  }
  return `
  <main id="main-content" role="main">

  <section class="treatment-page-hero" aria-label="${p.title}">
    <div class="container">
      <div class="breadcrumb"><a href="../">홈</a><span class="sep">/</span><a href="index.html">진료 안내</a><span class="sep">/</span><span>${p.title}</span></div>
      <div class="page-badge"><i class="${p.badgeIcon}"></i> ${p.badgeText}</div>
      <h1>${p.heroH1}</h1>
      <p class="hero-desc">${p.heroDesc}</p>${statsHTML}
    </div>
  </section>`;
}

/** 공감/고민 섹션 (concern-item-row) */
function concernRowsSection(p) {
  if (!p.concerns || !p.concerns.length) return '';
  const items = p.concerns.map(c => `
          <div class="concern-item-row">
            <span class="problem-icon"><i class="fas fa-times-circle"></i></span>
            <span class="problem-text">${c.problem}</span>
            <span class="arrow"><i class="fas fa-arrow-right"></i></span>
            <span class="solution-text">${c.solution}</span>
          </div>`).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.concernTitle || '혹시 이런 <span class="text-gradient">고민</span> 하고 계시죠?'}</h2>
          <p class="section-subtitle">${p.concernSub || '많은 분들이 같은 걱정을 하십니다'}</p>
        </div>
        <div style="max-width:700px;margin:0 auto;">${items}
        </div>
      </div>
    </section>`;
}

/** 공감/증상 섹션 (concern-card grid) */
function concernCardsSection(p) {
  if (!p.concernCards || !p.concernCards.length) return '';
  const cards = p.concernCards.map(c => `
          <div class="concern-card">
            <div class="concern-icon"><i class="${c.icon}"></i></div>
            <h3>${c.title}</h3>
            <p>${c.desc}</p>
          </div>`).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.concernCardsTitle || '혹시 이런 <span class="text-gradient">증상</span>이 있으신가요?'}</h2>
          <p class="section-subtitle">${p.concernCardsSub || '해당 증상이 있다면 빠른 상담을 권해드립니다'}</p>
        </div>
        <div class="concern-grid">${cards}
        </div>
      </div>
    </section>`;
}

/** Key Summary Box */
function keySummarySection(p) {
  if (!p.keySummary) return '';
  return `

    <div class="container">
      <div class="key-summary">
        <h3><i class="${p.keySummary.icon || 'fas fa-lightbulb'}"></i> ${p.keySummary.title}</h3>
        <p>${p.keySummary.body}</p>
      </div>
    </div>`;
}

/** Type Cards (임플란트 종류, 교정 종류 등) */
function typeCardsSection(p) {
  if (!p.typeCards || !p.typeCards.length) return '';
  const cards = p.typeCards.map(c => {
    const badge = c.badge ? `\n            <div class="type-badge">${c.badge}</div>` : '';
    const featured = c.featured ? ' featured' : '';
    const features = c.features ? c.features.map(f => `              <li><i class="fas fa-check"></i> ${f}</li>`).join('\n') : '';
    const recommend = c.recommend ? `\n            <div class="type-recommend"><strong>추천:</strong> ${c.recommend}</div>` : '';
    return `
          <div class="type-card${featured}">${badge}
            <div class="type-icon"><i class="${c.icon}"></i></div>
            <h3>${c.title}</h3>
            <p>${c.desc}</p>
            <ul class="type-features">
${features}
            </ul>${recommend}
          </div>`;
  }).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.typeTitle}</h2>
          <p class="section-subtitle">${p.typeSub}</p>
        </div>
        <div class="type-grid">${cards}
        </div>
      </div>
    </section>`;
}

/** Diff/Why BD Grid */
function diffSection(p) {
  if (!p.diffs || !p.diffs.length) return '';
  const cards = p.diffs.map((d, i) => `
          <div class="diff-card">
            <div class="diff-num">${String(i + 1).padStart(2, '0')}</div>
            <h3>${d.title}</h3>
            <p>${d.desc}</p>
          </div>`).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.diffTitle || '서울비디치과 <span class="text-gradient">차별점</span>'}</h2>
          <p class="section-subtitle">${p.diffSub || '꼼꼼한 진단과 정밀한 치료로 차이를 만듭니다'}</p>
        </div>
        <div class="diff-grid">${cards}
        </div>
      </div>
    </section>`;
}

/** Stage Cards (충치 단계 등) */
function stageSection(p) {
  if (!p.stages || !p.stages.length) return '';
  const cards = p.stages.map((s, i) => {
    const label = s.label ? ` <span class="stage-label ${s.labelClass || ''}">${s.label}</span>` : '';
    const symptoms = s.symptoms ? `\n            <div class="stage-symptoms">${s.symptoms.map(sy => `<span>${sy}</span>`).join('')}</div>` : '';
    const treatment = s.treatment ? `\n            <span class="stage-treatment"><i class="fas fa-check-circle"></i> ${s.treatment}</span>` : '';
    return `
          <div class="stage-card-v2">
            <div class="stage-num">${i + 1}</div>
            <div class="stage-body">
              <h3>${s.title}${label}</h3>
              <p>${s.desc}</p>${symptoms}${treatment}
            </div>
          </div>`;
  }).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.stageTitle}</h2>
          <p class="section-subtitle">${p.stageSub}</p>
        </div>
        <div class="stage-grid">${cards}
        </div>
      </div>
    </section>`;
}

/** Treatment Options Grid */
function treatmentOptionsSection(p) {
  if (!p.treatmentOptions || !p.treatmentOptions.length) return '';
  const cards = p.treatmentOptions.map(o => {
    const tags = o.tags ? `\n            <div class="opt-tags">${o.tags.map(t => `<span>${t}</span>`).join('')}</div>` : '';
    const link = o.link ? `\n            <a href="${o.link}" class="opt-link">자세히 보기 <i class="fas fa-arrow-right"></i></a>` : '';
    return `
          <div class="treatment-option-card">
            <div class="opt-icon"><i class="${o.icon}"></i></div>
            <h3>${o.title}</h3>
            <p>${o.desc}</p>${tags}${link}
          </div>`;
  }).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.treatmentOptionsTitle}</h2>
          <p class="section-subtitle">${p.treatmentOptionsSub}</p>
        </div>
        <div class="treatment-options">${cards}
        </div>
      </div>
    </section>`;
}

/** Process Timeline */
function processSection(p) {
  if (!p.process || !p.process.length) return '';
  const steps = p.process.map((s, i) => `
          <div class="process-step-v2">
            <div class="step-dot">${i + 1}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
          </div>`).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.processTitle}</h2>
          <p class="section-subtitle">${p.processSub}</p>
        </div>
        <div class="process-timeline-v2">${steps}
        </div>
      </div>
    </section>`;
}

/** Compare Table */
function compareSection(p) {
  if (!p.compareTable) return '';
  const t = p.compareTable;
  const ths = t.headers.map((h, i) => i === t.highlightCol ? `<th scope="col" class="col-highlight">${h}</th>` : (i === 0 ? `<th scope="col">${h}</th>` : `<th scope="col">${h}</th>`)).join('');
  const rows = t.rows.map(r => {
    const tds = r.map((cell, i) => i === 0 ? `<td>${cell}</td>` : (i === t.highlightCol ? `<td class="col-highlight">${cell}</td>` : `<td>${cell}</td>`));
    return `              <tr>${tds.join('')}</tr>`;
  }).join('\n');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${t.title}</h2>
          <p class="section-subtitle">${t.sub}</p>
        </div>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead><tr>${ths}</tr></thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
        ${t.note ? `<p style="text-align:center;margin-top:var(--space-lg);font-size:var(--text-sm);color:var(--color-gray-500);"><i class="fas fa-info-circle" style="color:var(--color-primary);margin-right:4px;"></i>${t.note}</p>` : ''}
      </div>
    </section>`;
}

/** Info Quick Cards */
function infoQuickSection(p) {
  if (!p.infoQuick || !p.infoQuick.length) return '';
  const cards = p.infoQuick.map(c => `
        <div class="info-quick-card">
          <div class="info-icon"><i class="${c.icon}"></i></div>
          <div class="info-label">${c.label}</div>
          <div class="info-value">${c.value}</div>
        </div>`).join('');
  return `

    <div class="container">
      <div class="info-quick-grid">${cards}
      </div>
    </div>`;
}

/** Reviews */
function reviewsSection(p) {
  if (!p.reviews || !p.reviews.length) return '';
  const cards = p.reviews.map(r => {
    const stars = '<i class="fas fa-star"></i>'.repeat(r.stars || 5);
    const sourceClass = r.source === '네이버' ? 'naver' : 'google';
    const tags = r.tags ? `\n            <div class="review-tags">${r.tags.map(t => `<span>${t}</span>`).join('')}</div>` : '';
    return `
          <div class="review-card-v2">
            <div class="review-header">
              <div class="review-avatar">${r.name[0]}</div>
              <div><div class="review-name">${r.name}</div><span class="review-source ${sourceClass}">${r.source}</span></div>
            </div>
            <div class="review-stars">${stars}</div>
            <p class="review-text">${r.text}</p>${tags}
          </div>`;
  }).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.reviewTitle || '실제 <span class="text-gradient">환자 후기</span>'}</h2>
          <p class="section-subtitle">${p.reviewSub || '네이버·구글에서 검증된 실제 후기입니다'}</p>
        </div>
        <div class="review-grid-v2">${cards}
        </div>
      </div>
    </section>`;
}

/** Prevention Grid */
function preventionSection(p) {
  if (!p.prevention || !p.prevention.length) return '';
  const cards = p.prevention.map(c => `
          <div class="prevention-card-v2">
            <div class="prev-icon"><i class="${c.icon}"></i></div>
            <div>
              <h4>${c.title}</h4>
              <p>${c.desc}</p>
            </div>
          </div>`).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.preventionTitle || '효과적인 <span class="text-gradient">예방법</span>'}</h2>
          <p class="section-subtitle">${p.preventionSub || '가장 좋은 치료는 예방입니다'}</p>
        </div>
        <div class="prevention-grid-v2">${cards}
        </div>
      </div>
    </section>`;
}

/** Precautions */
function precautionSection(p) {
  if (!p.precautions || !p.precautions.length) return '';
  const cards = p.precautions.map(c => {
    const items = c.items.map(i => `<li>${i}</li>`).join('');
    return `
          <div class="precaution-card-v2">
            <h3><i class="${c.icon}"></i> ${c.title}</h3>
            <ul>${items}</ul>
          </div>`;
  }).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.precautionTitle || '치료 후 <span class="text-gradient">주의사항</span>'}</h2>
          <p class="section-subtitle">${p.precautionSub || '더 나은 결과를 위해 꼭 지켜주세요'}</p>
        </div>
        <div class="precaution-grid">${cards}
        </div>
      </div>
    </section>`;
}

/** Feature List */
function featureListSection(p) {
  if (!p.featureList || !p.featureList.length) return '';
  const items = p.featureList.map(f => `
          <div class="feature-list-item">
            <i class="fas fa-check-circle fl-icon"></i>
            <div><strong>${f.title}</strong><p>${f.desc}</p></div>
          </div>`).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${p.featureListTitle || '서울비디치과 <span class="text-gradient">특장점</span>'}</h2>
          <p class="section-subtitle">${p.featureListSub || ''}</p>
        </div>
        <div class="feature-list">${items}
        </div>
      </div>
    </section>`;
}

/** FAQ */
function faqSection(p) {
  if (!p.faqs || !p.faqs.length) return '';
  const items = p.faqs.map((f, i) => `
          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-${i+1}">
              <span class="faq-q-badge">Q</span>
              <span class="faq-q-text">${f.q}</span>
              <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="faq-answer" id="faq-${i+1}" role="region"><p>${f.a}</p></div>
          </div>`).join('');
  return `

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>자주 묻는 <span class="text-gradient">질문</span></h2>
          <p class="section-subtitle">${p.faqSub || '궁금한 점을 확인하세요'}</p>
        </div>
        <div class="faq-list">${items}
        </div>
      </div>
    </section>`;
}

/** CTA + Page Nav + Legal + close main */
function ctaAndNavSection(p) {
  const prev = p.prevPage ? `<a href="${p.prevPage.file}" class="prev"><span class="nav-label"><i class="fas fa-arrow-left"></i> 이전</span><span class="nav-title">${p.prevPage.title}</span></a>` : '';
  const next = p.nextPage ? `<a href="${p.nextPage.file}" class="next"><span class="nav-label">다음 <i class="fas fa-arrow-right"></i></span><span class="nav-title">${p.nextPage.title}</span></a>` : '';
  return `

    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <span class="cta-badge">상담 안내</span>
          <h2>${p.ctaH2}</h2>
          <p>${p.ctaDesc}</p>
          <div class="cta-buttons">
            <a href="../reservation.html" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
            <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
          </div>
          <p class="cta-phone"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
        </div>
      </div>
    </section>

    <section class="section-sm">
      <div class="container">
        <div class="page-nav-v2">
          ${prev}
          ${next}
        </div>
      </div>
    </section>

    <section class="section-sm">
      <div class="container">
        <div class="legal-box">*본 정보는 의료법 및 의료광고 심의 기준을 준수하며, 개인에 따라 결과가 다를 수 있습니다. 반드시 전문의와 상담 후 결정하시기 바랍니다.</div>
      </div>
    </section>

  </main>`;
}

// ════════════════════════════════════════════════════════
// § 3. 페이지별 전체 HTML 조립
// ════════════════════════════════════════════════════════

function buildPage(p) {
  let html = headHTML(p.title, p.metaDesc, p.keywords, p.file);
  html += '\n' + headerHTML();
  html += heroSection(p);
  if (p.infoQuick) html += infoQuickSection(p);
  if (p.keySummary) html += keySummarySection(p);
  if (p.concernCards) html += concernCardsSection(p);
  if (p.concerns) html += concernRowsSection(p);
  if (p.stages) html += stageSection(p);
  if (p.typeCards) html += typeCardsSection(p);
  if (p.treatmentOptions) html += treatmentOptionsSection(p);
  if (p.diffs) html += diffSection(p);
  if (p.featureList) html += featureListSection(p);
  if (p.process) html += processSection(p);
  if (p.compareTable) html += compareSection(p);
  if (p.prevention) html += preventionSection(p);
  if (p.precautions) html += precautionSection(p);
  if (p.reviews) html += reviewsSection(p);
  html += faqSection(p);
  html += ctaAndNavSection(p);
  html += '\n' + footerHTML();
  return html;
}

// ════════════════════════════════════════════════════════
// § 4. 24개 페이지 콘텐츠 데이터
// ════════════════════════════════════════════════════════

const pages = [];

// ── 페이지 순서(네비게이션용) ──
const NAV_ORDER = [
  { file: 'glownate.html', title: '글로우네이트' },
  { file: 'implant.html', title: '임플란트' },
  { file: 'invisalign.html', title: '치아교정' },
  { file: 'pediatric.html', title: '소아치과' },
  { file: 'aesthetic.html', title: '심미치료' },
  { file: 'cavity.html', title: '충치치료' },
  { file: 'resin.html', title: '레진치료' },
  { file: 'crown.html', title: '크라운' },
  { file: 'inlay.html', title: '인레이/온레이' },
  { file: 'root-canal.html', title: '신경치료' },
  { file: 'whitening.html', title: '미백' },
  { file: 'bridge.html', title: '브릿지' },
  { file: 'denture.html', title: '틀니' },
  { file: 're-root-canal.html', title: '재신경치료' },
  { file: 'apicoectomy.html', title: '치근단절제술' },
  { file: 'scaling.html', title: '스케일링' },
  { file: 'gum.html', title: '잇몸치료' },
  { file: 'gum-surgery.html', title: '잇몸수술' },
  { file: 'periodontitis.html', title: '치주염' },
  { file: 'wisdom-tooth.html', title: '사랑니 발치' },
  { file: 'emergency.html', title: '응급진료' },
  { file: 'tmj.html', title: '턱관절장애' },
  { file: 'bruxism.html', title: '이갈이/이악물기' },
  { file: 'prevention.html', title: '예방치료' },
];

function getNav(file) {
  const idx = NAV_ORDER.findIndex(n => n.file === file);
  return {
    prevPage: idx > 0 ? NAV_ORDER[idx - 1] : null,
    nextPage: idx < NAV_ORDER.length - 1 ? NAV_ORDER[idx + 1] : null,
  };
}

// ═══════════════════════════════════════
// 1. 글로우네이트
// ═══════════════════════════════════════
pages.push({
  file: 'glownate.html', title: '글로우네이트',
  metaDesc: '서울비디치과 글로우네이트 — 라미네이트 + 잇몸성형 + 미백 = 글로우네이트 — 원스톱 스마일 메이크오버',
  keywords: '천안 글로우네이트, 서울비디치과 글로우네이트, 라미네이트, 잇몸성형',
  badgeIcon: 'fas fa-sparkles', badgeText: '전문센터 · HOT',
  heroH1: '라미네이트 + 잇몸성형 + 미백<br><span class="text-gradient">= 글로우네이트</span>',
  heroDesc: '세 가지 시술을 하나로. 치아 색상, 형태, 잇몸 라인까지 한 번에 완성하는 원스톱 스마일 메이크오버 프로그램입니다.',
  heroStats: [
    { value: '1,200+', label: '시술 케이스' },
    { value: '원스톱', label: '3-in-1 시술' },
    { value: '당일', label: '임시치아 제공' },
  ],
  concerns: [
    { problem: '"치아가 작고 들쭉날쭉해요"', solution: '라미네이트로 형태·크기 개선' },
    { problem: '"잇몸이 많이 보여요 (거미스마일)"', solution: '잇몸성형으로 라인 정리' },
    { problem: '"치아 색이 누래요"', solution: '전문 미백으로 밝기 UP' },
    { problem: '"여러 곳에서 각각 해야 하나요?"', solution: '서울비디에서 원스톱 진행' },
  ],
  typeCards: [
    { icon: 'fas fa-gem', title: '라미네이트', desc: '치아 표면에 얇은 세라믹을 부착하여 형태와 색상을 동시에 개선합니다.', features: ['최소 삭제 (0.3~0.5mm)', '자연스러운 투명감', '변색 없는 세라믹', '10년+ 수명'], recommend: '치아 형태·색상 동시 개선', badge: '', featured: false, icon: 'fas fa-gem' },
    { icon: 'fas fa-cut', title: '잇몸성형', desc: '잇몸 라인을 정돈하여 치아가 더 길고 균일하게 보이도록 합니다.', features: ['레이저 시술 가능', '빠른 회복', '거미스마일 개선', '자연스러운 라인'], recommend: '잇몸 노출 과다, 비대칭 잇몸', icon: 'fas fa-cut' },
    { icon: 'fas fa-sun', title: '전문 미백', desc: '전문의가 진행하는 고농도 미백으로 확실한 톤 업 효과를 보장합니다.', features: ['전문의 직접 시술', '고농도 미백제', '시린 증상 최소화', '6개월+ 유지'], recommend: '누런 치아, 착색, 톤 UP', icon: 'fas fa-sun' },
  ],
  typeTitle: '<span class="text-gradient">글로우네이트</span> 구성',
  typeSub: '세 가지 시술을 환자 상태에 맞춰 최적 조합합니다',
  process: [
    { title: '1:1 상담 & 스마일 디자인', desc: '원장이 직접 얼굴 비율, 치아 상태, 잇몸 라인을 분석하고 디지털 스마일 디자인을 진행합니다.' },
    { title: '잇몸성형 (필요시)', desc: '잇몸이 과도하게 보이거나 비대칭인 경우 잇몸 라인을 먼저 정돈합니다.' },
    { title: '치아 최소 삭제 & 인상', desc: '라미네이트를 위해 치아 표면을 0.3~0.5mm만 최소 삭제하고 정밀 인상을 채득합니다.' },
    { title: '미백 시술', desc: '라미네이트를 부착하지 않는 나머지 치아의 톤을 라미네이트 색상에 맞춰 화이트닝합니다.' },
    { title: '라미네이트 부착', desc: '원내 기공소에서 제작한 맞춤 라미네이트를 정밀하게 부착합니다.' },
    { title: '최종 점검 & 유지관리', desc: '교합 확인, 컬러 매칭을 최종 점검하고 유지관리 프로그램을 안내합니다.' },
  ],
  processTitle: '체계적인 <span class="text-gradient">시술 과정</span>',
  processSub: '상담부터 완성까지 6단계',
  diffs: [
    { title: '원스톱 시스템', desc: '라미네이트, 잇몸성형, 미백을 한 곳에서 한 번에. 여러 병원을 다닐 필요 없이 서울비디에서 모든 것이 해결됩니다.' },
    { title: '원내 기공소', desc: '충남권 대규모 원내 기공소에서 라미네이트를 직접 제작합니다. 색상·형태 디테일까지 정밀 컨트롤이 가능합니다.' },
    { title: '디지털 스마일 디자인', desc: '디지털 장비로 시술 전 결과를 미리 시뮬레이션합니다. 환자분과 함께 확인하고 결정합니다.' },
    { title: '15인 협진', desc: '보철과·심미·교정 전문의가 협진하여 최적의 결과를 도출합니다.' },
  ],
  diffTitle: '왜 <span class="text-gradient">서울비디 글로우네이트</span>인가',
  diffSub: '다른 곳에서는 경험할 수 없는 차이',
  reviews: [
    { name: '최**님', source: '네이버', stars: 5, text: '라미네이트랑 잇몸성형 같이 했는데 <mark>한 번에 다 되니까 정말 편했어요</mark>. 결과도 너무 자연스럽고 만족합니다!', tags: ['글로우네이트', '원스톱'] },
    { name: '정**님', source: '네이버', stars: 5, text: '거미스마일이 콤플렉스였는데 <mark>잇몸성형 후 라미네이트까지 하니 완전 달라졌어요</mark>. 친구들이 다 물어봅니다.', tags: ['잇몸성형', '라미네이트'] },
    { name: '한**님', source: '구글', stars: 5, text: '미백까지 같이 하니까 <mark>전체적으로 톤이 밝아져서 얼굴이 환해졌어요</mark>. 원장님이 꼼꼼하게 설명해주셔서 좋았습니다.', tags: ['미백', '스마일메이크오버'] },
  ],
  faqs: [
    { q: '글로우네이트 시술 기간은 얼마나 걸리나요?', a: '보통 2~3주 정도 소요됩니다. 잇몸성형이 필요한 경우 잇몸 회복 기간이 추가될 수 있으며, 임시 라미네이트를 제공하여 일상에 불편함이 없습니다.' },
    { q: '라미네이트 수명은 얼마나 되나요?', a: '관리에 따라 10~15년 이상 사용 가능합니다. 정기 검진과 올바른 구강 관리가 중요하며, 딱딱한 음식(얼음, 견과류)을 직접 깨물지 않도록 주의하면 오래 유지됩니다.' },
    { q: '치아 삭제가 많이 되나요?', a: '글로우네이트에 사용되는 라미네이트는 치아 표면을 0.3~0.5mm만 최소 삭제합니다. 크라운에 비해 치아 보존량이 월등히 높습니다.' },
    { q: '시술 중 통증이 있나요?', a: '국소 마취 하에 진행되므로 시술 중 통증은 없습니다. 잇몸성형의 경우 레이저 시술로 출혈과 통증이 최소화됩니다.' },
    { q: '비용은 얼마인가요?', a: '라미네이트, 잇몸성형, 미백 구성에 따라 달라집니다. 정확한 비용은 상담 후 안내드리며, 무이자 할부도 가능합니다. <a href="../pricing.html" style="color:var(--color-primary);font-weight:600;">비용 안내 페이지</a>에서 확인하세요.' },
    { q: '누구나 글로우네이트를 할 수 있나요?', a: '대부분 가능하지만, 치아 상태(심한 부정교합, 잇몸 질환 등)에 따라 선행 치료가 필요할 수 있습니다. 정밀 검진 후 최적의 시술 계획을 수립합니다.' },
  ],
  ctaH2: '스마일이 달라지면 인생이 달라집니다',
  ctaDesc: '글로우네이트 상담, 지금 바로 시작하세요.',
  ...getNav('glownate.html'),
});

// ═══════════════════════════════════════
// 2. 임플란트
// ═══════════════════════════════════════
pages.push({
  file: 'implant.html', title: '임플란트',
  metaDesc: '서울비디치과 임플란트 — 6개 독립 수술실, 네비게이션 임플란트, 수면 임플란트 — 고난도 케이스까지 안전하게',
  keywords: '천안 임플란트, 서울비디치과 임플란트, 네비게이션 임플란트, 수면 임플란트',
  badgeIcon: 'fas fa-hospital', badgeText: '전문센터',
  heroH1: '"다른 곳에서 안 된다고요?"<br><span class="text-gradient">저희가 해드리겠습니다</span>',
  heroDesc: '6개 전용 수술방, 2개 회복실 — 서울대 출신 전문 원장 15인의 협진 시스템으로 뼈이식부터 전악 재건까지, 365일 안전한 임플란트를 약속합니다.',
  heroStats: [
    { value: '6개', label: '전용 수술실' },
    { value: '15인', label: '협진 전문의' },
    { value: '365일', label: '수술 가능' },
  ],
  concerns: [
    { problem: '"수술이 너무 무서워요"', solution: '수면 임플란트로 편안하게' },
    { problem: '"뼈가 부족하다고 안 된대요"', solution: '뼈이식·상악동 수술 전문' },
    { problem: '"주말에만 시간이 나요"', solution: '일요일·공휴일도 수술 OK' },
    { problem: '"비용이 너무 부담돼요"', solution: '투명 비용 안내 + 무이자 할부' },
    { problem: '"다른 치과에서 실패했어요"', solution: '재수술 전문 · 원인 분석' },
    { problem: '"오래 걸린다던데..."', solution: '네비게이션으로 수술 시간 단축' },
  ],
  typeCards: [
    { icon: 'fas fa-bed', title: '수면 임플란트', desc: '수면 상태에서 편안하게 수술받으세요. 치과 공포증 환자분들께 특히 추천드립니다.', features: ['수술 공포증 완전 해결', '통증 없는 수술 경험', '다수 임플란트 동시 식립', '전문 마취 시스템 운영'], recommend: '치과 공포증, 다수 식립, 고령 환자' },
    { icon: 'fas fa-cut', title: '비절개 임플란트', desc: '잇몸 절개 없이 최소 침습으로 수술합니다. 당일 일상 복귀가 가능합니다.', features: ['잇몸 절개 없는 수술', '빠른 회복 (당일 일상)', '출혈·붓기 최소화', '디지털 가이드 사용'], recommend: '빠른 회복, 바쁜 직장인' },
    { icon: 'fas fa-crosshairs', title: '네비게이션 임플란트', desc: '3D CT 기반 시뮬레이션으로 0.1mm 오차의 정밀한 식립을 실현합니다.', features: ['3D CT 기반 시뮬레이션', '0.1mm 오차 정밀 식립', '수술 시간 대폭 단축', '안전한 신경 회피'], recommend: '정밀 수술, 신경 인접 케이스', badge: 'BEST', featured: true },
    { icon: 'fas fa-bone', title: '고난도 임플란트', desc: '뼈가 부족해도 임플란트가 가능합니다. 타원 불가 판정 케이스도 상담해보세요.', features: ['뼈이식 (GBR)', '상악동 거상술', '블록뼈 이식', '올온포 임플란트'], recommend: '타원 불가 판정, 뼈 부족, 전악 재건' },
    { icon: 'fas fa-sync-alt', title: '임플란트 재수술', desc: '실패한 임플란트도 다시 살립니다. 정밀 분석 후 재식립을 진행합니다.', features: ['실패 원인 정밀 분석', '안전한 임플란트 제거', '골재생 후 재식립', '타원 케이스 환영'], recommend: '임플란트 실패, 재수술 필요' },
    { icon: 'fas fa-calendar-alt', title: '공휴일 수술', desc: '일요일·공휴일에도 수술 가능합니다. 바쁜 일정에도 치료를 미루지 마세요.', features: ['365일 수술 운영', '주말·공휴일 가능', '야간 진료 (평일 20시)', '당일 응급 수술 대응'], recommend: '직장인, 주말만 가능한 분' },
  ],
  typeTitle: '서울비디치과 <span class="text-gradient">임플란트 종류</span>',
  typeSub: '환자 상태에 맞는 최적의 임플란트 방법을 제안드립니다',
  diffs: [
    { title: '15인 협진 시스템', desc: '서울대 출신 15인 원장이 케이스를 함께 검토합니다. 어려운 케이스도 최적의 치료 방향을 찾습니다.' },
    { title: '6개 수술방 완비', desc: '전문 수술실 6개와 회복실 2개를 갖춰 안전하고 쾌적한 환경에서 수술받으실 수 있습니다.' },
    { title: '디지털 정밀 수술', desc: '3D CT, 구강스캐너, 네비게이션 시스템으로 0.1mm 단위의 정밀한 임플란트 식립을 실현합니다.' },
    { title: '원내 기공소', desc: '충남권 대규모 원내 기공소에서 프리미엄 보철물을 제작합니다. 정확한 맞춤 제작이 가능합니다.' },
    { title: '철저한 감염관리', desc: '개별 멸균 수술실, 1인 1기구 원칙, 높은 수준의 멸균 시스템으로 안전한 수술 환경을 제공합니다.' },
    { title: '365일 수술 가능', desc: '일요일, 공휴일에도 수술이 가능합니다. 바쁜 직장인도 편하게 일정을 잡으실 수 있습니다.' },
  ],
  diffTitle: '임플란트, <span class="text-gradient">어디서 하느냐</span>가 결과를 바꿉니다',
  diffSub: '같은 임플란트라도 시스템이 다르면 결과가 다릅니다',
  process: [
    { title: 'BDX 정밀검진', desc: '3D CT 촬영, 구강스캐너, 파노라마 등 디지털 장비로 구강 상태를 정밀하게 분석합니다.' },
    { title: '협진 & 치료계획', desc: '15인 원장 협진 시스템으로 최적의 치료 계획을 수립합니다. 예상 비용과 기간을 투명하게 안내드립니다.' },
    { title: '3D 시뮬레이션', desc: '디지털 가이드로 임플란트 식립 위치를 미리 시뮬레이션합니다.' },
    { title: '임플란트 식립', desc: '네비게이션 시스템과 디지털 가이드를 활용해 0.1mm 단위로 정확한 위치에 식립합니다.' },
    { title: '골유착 기간', desc: '임플란트와 잇몸뼈가 단단히 결합되는 기간입니다. 일반 2~4개월, SLActive 시 6~8주.' },
    { title: '보철물 완성', desc: '원내 기공소에서 맞춤 제작한 프리미엄 지르코니아 크라운을 장착합니다.' },
  ],
  processTitle: '체계적인 <span class="text-gradient">6단계</span> 치료 과정',
  processSub: '정밀 검진부터 보철물 완성까지',
  compareTable: {
    title: '세계적으로 검증된 <span class="text-gradient">프리미엄 임플란트</span>',
    sub: '환자의 구강 상태에 따라 최적의 제품을 추천드립니다',
    headers: ['비교 항목', '오스템 (Osstem)', '스트라우만 (Straumann)', '네오 (Neo)'],
    highlightCol: 2,
    rows: [
      ['원산지', '한국', '스위스', '한국'],
      ['글로벌 점유율', '세계 1위', '세계 2위', '국내 인기'],
      ['골유착 기간', '2~4개월', '6~8주 (SLActive)', '2~4개월'],
      ['표면 처리', 'SA', 'SLActive® (초친수성)', 'RBM'],
      ['임상 데이터', '30년+', '40년+ (최다)', '15년+'],
      ['보증 기간', '10년', '평생 (조건부)', '10년'],
      ['가격대', '합리적', '프리미엄', '합리적'],
    ],
    note: '환자의 구강 상태, 골질, 부위에 따라 최적의 임플란트를 추천드립니다.',
  },
  reviews: [
    { name: '이**님', source: '네이버', stars: 5, text: '임플란트 후기! 수술시간 30분 정도로 잘 마무리되었어요. <mark>4층 전체가 임플란트센터라 전문적이고</mark> 수술 후 따뜻한 죽까지 주시는 세심한 배려에 감동했어요!', tags: ['임플란트', '전문 수술실'] },
    { name: '박**님', source: '네이버', stars: 5, text: '다른 치과에서 뼈가 부족해 안 된다고 했는데 <mark>서울비디에서 뼈이식과 함께 성공적으로 해주셨어요.</mark> CT 보면서 자세히 설명해주신 것도 좋았습니다.', tags: ['고난도 임플란트', '뼈이식'] },
    { name: '김**님', source: '구글', stars: 5, text: '수면 임플란트 받았는데 <mark>정말 자고 일어나니까 끝나있었어요.</mark> 무서워서 계속 미뤘는데 진작 올 걸 그랬습니다.', tags: ['수면 임플란트', '공포증 극복'] },
  ],
  faqs: [
    { q: '임플란트 수술이 아프나요?', a: '수면임플란트를 제공합니다. 수면 상태에서 수술이 진행되어 통증이나 공포 없이 편안하게 치료받으실 수 있습니다. 일반 수술도 충분한 마취로 수술 중 통증은 없습니다.' },
    { q: '임플란트 수술 기간은 얼마나 걸리나요?', a: '일반적으로 식립 후 2~4개월의 골유착 기간이 필요합니다. 뼈이식 시 추가 3~6개월 소요됩니다. 스트라우만 SLActive 사용 시 6~8주로 단축됩니다.' },
    { q: '뼈가 부족해도 임플란트가 가능한가요?', a: '네, 가능합니다. 뼈이식(GBR), 상악동거상술, 블록뼈이식 등 고난도 임플란트를 전문으로 합니다. 다른 치과에서 어렵다고 한 케이스도 상담해보세요.' },
    { q: '임플란트 수명은 얼마나 되나요?', a: '관리에 따라 20년 이상 사용 가능합니다. 정기적인 검진과 올바른 구강 관리가 중요합니다.' },
    { q: '임플란트 비용은 얼마인가요?', a: '픽스쳐 종류, 뼈이식 필요 여부 등에 따라 달라집니다. 정확한 비용은 검진 후 안내드리며, 무이자 할부도 가능합니다. <a href="../pricing.html" style="color:var(--color-primary);font-weight:600;">비용 안내 페이지</a>에서 확인하세요.' },
    { q: '당뇨병 환자도 임플란트가 가능한가요?', a: '당뇨병이 잘 조절되고 있다면 가능합니다. 골유착 기간이 더 길어질 수 있으며, 수술 전 내과 협진이 필요할 수 있습니다.' },
    { q: '임플란트와 브릿지의 차이점은?', a: '임플란트는 인접 치아 삭제 없이 독립적으로 식립됩니다. 브릿지는 양쪽 치아를 삭제해야 하고 수명이 7~10년입니다. 장기적으로 임플란트가 더 경제적입니다.' },
    { q: '임플란트를 한 치아도 MRI 촬영이 가능한가요?', a: '네, 가능합니다. 임플란트는 주로 티타늄으로 만들어져 MRI 자기장에 영향을 받지 않습니다.' },
  ],
  ctaH2: '임플란트, 어디서 하느냐가 결과를 바꿉니다',
  ctaDesc: '포기하지 마세요. 다른 곳에서 안 된다고 했어도 방법을 찾아드리겠습니다.',
  ...getNav('implant.html'),
});

// ═══════════════════════════════════════
// 3. 인비절라인 (치아교정)
// ═══════════════════════════════════════
pages.push({
  file: 'invisalign.html', title: '치아교정',
  metaDesc: '서울비디치과 인비절라인 치아교정 — 투명교정 전문, 블루 다이아몬드 등급 — 보이지 않는 교정으로 자신감 UP',
  keywords: '천안 인비절라인, 서울비디치과 치아교정, 투명교정, 인비절라인',
  badgeIcon: 'fas fa-teeth', badgeText: '전문센터',
  heroH1: '보이지 않는 교정<br><span class="text-gradient">인비절라인</span>',
  heroDesc: '투명 교정장치로 일상 속에서 티 나지 않게 교정합니다. 인비절라인 블루 다이아몬드 등급 전문의가 직접 진료합니다.',
  heroStats: [
    { value: '블루 다이아몬드', label: '인비절라인 등급' },
    { value: '3,000+', label: '교정 케이스' },
    { value: '전문의 3인', label: '교정과 전문의' },
  ],
  concerns: [
    { problem: '"교정기가 보이는 게 싫어요"', solution: '투명 장치로 티 안 나게' },
    { problem: '"교정 기간이 너무 길어요"', solution: '인비절라인으로 기간 단축' },
    { problem: '"식사할 때 불편할까봐"', solution: '탈착식이라 식사 자유' },
    { problem: '"통증이 심하다던데"', solution: '부드러운 힘으로 불편 최소' },
  ],
  typeCards: [
    { icon: 'fas fa-gem', title: '인비절라인 컴프리헨시브', desc: '복잡한 교정 케이스에 적합합니다. 장치 교체 횟수 제한 없이 완벽한 결과를 추구합니다.', features: ['무제한 장치 교체', '복잡한 교정 가능', '디지털 시뮬레이션', '정밀 어태치먼트'], recommend: '돌출입, 심한 부정교합', badge: 'BEST', featured: true },
    { icon: 'fas fa-smile', title: '인비절라인 모더레이트', desc: '중등도 교정에 최적화되어 합리적인 비용으로 교정할 수 있습니다.', features: ['26개 장치 제공', '중등도 교정 적합', '합리적 비용', '빠른 교정 가능'], recommend: '가벼운 덧니, 벌어진 치아' },
    { icon: 'fas fa-magic', title: '인비절라인 라이트/Go', desc: '가벼운 교정에 적합한 프로그램입니다. 짧은 기간, 합리적 비용으로 미소를 바꿉니다.', features: ['7~14개 장치', '3~6개월 완료', '가장 합리적 비용', '간단한 교정'], recommend: '경미한 삐뚤어짐, 재교정' },
  ],
  typeTitle: '<span class="text-gradient">인비절라인</span> 프로그램',
  typeSub: '케이스에 맞는 최적의 교정 프로그램을 제안드립니다',
  diffs: [
    { title: '블루 다이아몬드 등급', desc: '인비절라인 최상위 등급 전문의가 직접 진료합니다. 풍부한 경험으로 정확한 교정 결과를 보장합니다.' },
    { title: '디지털 교정 시뮬레이션', desc: 'iTero 구강스캐너로 3D 시뮬레이션을 통해 교정 전·후 결과를 미리 확인할 수 있습니다.' },
    { title: '교정과 전문의 3인', desc: '교정과 전문의 3인이 상주하여 다양한 교정 케이스에 전문적으로 대응합니다.' },
    { title: '교정+심미 연계 치료', desc: '교정과 동시에 미백, 라미네이트 등 심미 치료를 연계하여 최상의 스마일을 완성합니다.' },
  ],
  diffTitle: '왜 서울비디 <span class="text-gradient">인비절라인</span>인가',
  diffSub: '교정의 결과는 전문의의 실력이 좌우합니다',
  process: [
    { title: '무료 교정 상담', desc: '교정과 전문의가 구강 상태를 확인하고 교정 가능 여부와 방법을 안내합니다.' },
    { title: '정밀 검사 & 스캔', desc: 'iTero 구강스캐너, 3D CT, 세팔로 촬영으로 정밀 데이터를 수집합니다.' },
    { title: '클린체크 시뮬레이션', desc: '교정 결과를 3D로 미리 시뮬레이션하여 환자와 함께 확인합니다.' },
    { title: '장치 제작 & 착용', desc: '맞춤 제작된 투명 장치를 착용합니다. 1~2주마다 새 장치로 교체합니다.' },
    { title: '정기 모니터링', desc: '4~6주 간격으로 교정 진행 상황을 확인하고 필요시 조정합니다.' },
    { title: '유지장치 & 완료', desc: '교정 완료 후 유지장치를 착용하여 결과를 오래 유지합니다.' },
  ],
  processTitle: '<span class="text-gradient">인비절라인</span> 교정 과정',
  processSub: '상담부터 완료까지 체계적으로',
  reviews: [
    { name: '김**님', source: '네이버', stars: 5, text: '투명교정이라 <mark>회사에서 아무도 교정 중인 걸 몰랐어요</mark>. 식사도 자유롭고 6개월 만에 완료!', tags: ['인비절라인', '직장인'] },
    { name: '이**님', source: '네이버', stars: 5, text: '<mark>교정 전후 시뮬레이션을 보니 결과가 바로 눈에 보여서</mark> 확신이 생겼어요. 결과도 시뮬레이션 그대로!', tags: ['디지털 시뮬레이션', '투명교정'] },
    { name: '박**님', source: '구글', stars: 5, text: '블루 다이아몬드 등급이라 안심하고 맡겼어요. <mark>복잡한 케이스인데도 깔끔하게 교정됐습니다</mark>.', tags: ['블루 다이아몬드', '복잡 교정'] },
  ],
  faqs: [
    { q: '인비절라인 교정 기간은 얼마나 걸리나요?', a: '케이스에 따라 다르지만, 가벼운 교정은 3~6개월, 일반적인 교정은 12~18개월 정도 소요됩니다.' },
    { q: '인비절라인 장치를 끼고 식사할 수 있나요?', a: '아니요, 식사 시에는 장치를 빼고 드시면 됩니다. 탈착이 자유로워 식사와 양치에 불편함이 없습니다.' },
    { q: '인비절라인 비용은 얼마인가요?', a: '프로그램(라이트, 모더레이트, 컴프리헨시브)에 따라 다릅니다. 정확한 비용은 상담 후 안내드리며 무이자 할부 가능합니다.' },
    { q: '인비절라인으로 돌출입 교정도 되나요?', a: '네, 가능합니다. 컴프리헨시브 프로그램으로 돌출입, 심한 부정교합도 교정 가능합니다. 정밀 검사 후 적합 여부를 판단합니다.' },
    { q: '성인도 교정이 가능한가요?', a: '물론입니다. 인비절라인은 성인 교정에 특히 적합합니다. 직장 생활, 사회생활에 지장 없이 교정할 수 있습니다.' },
    { q: '하루에 얼마나 착용해야 하나요?', a: '하루 20~22시간 착용이 권장됩니다. 식사와 양치 시에만 빼주시면 됩니다.' },
  ],
  ctaH2: '보이지 않게, 확실하게 교정하세요',
  ctaDesc: '인비절라인 무료 상담으로 교정 전후를 미리 확인하세요.',
  ...getNav('invisalign.html'),
});

// 나머지 21개 페이지는 별도 파일에서 로드
const morePages = require('./treatment-data-rest.cjs');
pages.push(...morePages);

// ════════════════════════════════════════════════════════
// § 5. 전체 페이지 생성 실행
// ════════════════════════════════════════════════════════

let success = 0;
let fail = 0;

pages.forEach(p => {
  try {
    const html = buildPage(p);
    const filePath = path.join(TREATMENTS_DIR, p.file);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ ${p.file} (${(html.length / 1024).toFixed(1)}KB)`);
    success++;
  } catch (err) {
    console.error(`❌ ${p.file}: ${err.message}`);
    fail++;
  }
});

console.log(`\n═══ DONE: ${success}/${pages.length} rebuilt, ${fail} failed ═══`);
