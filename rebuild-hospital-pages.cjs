/**
 * 서울비디치과 병원 안내 하위 5개 페이지 완전 재구축
 * 
 * 대상 페이지:
 *   pricing.html, floor-guide.html, directions.html, faq.html, notice/index.html
 * 
 * 전략:
 * - 메인 페이지(public/index.html)와 100% 동일한 공통 파츠 (헤더/푸터/모바일네비/CTA)
 * - site-v5.css 클래스만 사용
 * - 각 페이지 고유 콘텐츠 + 인라인 스타일은 보존
 * - 나머지 페이지(치료/의료진 등) 절대 건드리지 않음
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PUBLIC_DIR = path.join(__dirname, 'public');
const CSS_PATH = path.join(PUBLIC_DIR, 'css', 'site-v5.css');
const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
const cssHash = crypto.createHash('md5').update(cssContent).digest('hex').substring(0, 8);

// ═══════════════════════════════════════════════════
// 메인 페이지에서 공통 파츠 추출 (ROOT level)
// ═══════════════════════════════════════════════════
const mainIndexHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');

// Extract header (루트 레벨 경로 사용)
const headerMatch = mainIndexHtml.match(/<header class="site-header"[\s\S]*?<\/header>\s*<div class="header-spacer"><\/div>/);
const ROOT_HEADER = headerMatch ? headerMatch[0] : '';

// Extract footer
const footerMatch = mainIndexHtml.match(/<footer class="footer"[\s\S]*?<\/footer>/);
const ROOT_FOOTER = footerMatch ? footerMatch[0] : '';

// Mobile nav + overlay
const mobileNavMatch = mainIndexHtml.match(/<nav class="mobile-nav"[\s\S]*?<div class="mobile-nav-overlay"[^>]*><\/div>/);
const ROOT_MOBILE_NAV = mobileNavMatch ? mobileNavMatch[0] : '';

// Floating CTA (desktop)
const floatingMatch = mainIndexHtml.match(/<div class="floating-cta desktop-only">[\s\S]*?<\/div>\s*<\/div>/);
const ROOT_FLOATING_CTA = floatingMatch ? floatingMatch[0] : 
  `<div class="floating-cta desktop-only">
    <a href="javascript:void(0)" class="floating-btn top" aria-label="맨 위로" id="scrollToTopBtn"><i class="fas fa-arrow-up"></i><span class="tooltip">맨 위로</span></a>
    <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="floating-btn kakao" aria-label="카카오톡 상담"><i class="fas fa-comment-dots"></i><span class="tooltip">카카오톡 상담</span></a>
    <a href="tel:0414152892" class="floating-btn phone" aria-label="전화 상담"><i class="fas fa-phone"></i><span class="tooltip">전화 상담</span></a>
  </div>`;

// Mobile bottom CTA
const mobileCTAMatch = mainIndexHtml.match(/<div class="mobile-bottom-cta mobile-only"[\s\S]*?<\/div>\s*<\/div>/);
const ROOT_MOBILE_BOTTOM_CTA = mobileCTAMatch ? mobileCTAMatch[0] :
  `<div class="mobile-bottom-cta mobile-only" aria-label="빠른 연락">
    <a href="tel:041-415-2892" class="mobile-cta-btn phone"><i class="fas fa-phone-alt"></i><span>전화</span></a>
    <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="mobile-cta-btn kakao"><i class="fas fa-comment"></i><span>카카오톡</span></a>
    <a href="reservation.html" class="mobile-cta-btn reserve primary"><i class="fas fa-calendar-check"></i><span>예약</span></a>
    <a href="directions.html" class="mobile-cta-btn location"><i class="fas fa-map-marker-alt"></i><span>오시는 길</span></a>
  </div>`;

console.log('✅ 메인 페이지 공통 파츠 추출 완료');
console.log(`   Header: ${ROOT_HEADER.length} chars`);
console.log(`   Footer: ${ROOT_FOOTER.length} chars`);
console.log(`   Mobile Nav: ${ROOT_MOBILE_NAV.length} chars`);
console.log(`   Floating CTA: ${ROOT_FLOATING_CTA.length} chars`);
console.log(`   Mobile Bottom CTA: ${ROOT_MOBILE_BOTTOM_CTA.length} chars`);

// ═══════════════════════════════════════════════════
// notice/index.html은 ../경로 필요 → 경로 변환 함수
// ═══════════════════════════════════════════════════
function convertToSubdir(html) {
  // 루트 레벨 href="xxx.html" → href="../xxx.html"
  // 루트 레벨 href="/xxx" → href="../xxx" (절대경로)
  // 루트 레벨 src="/js/xxx" → src="../js/xxx"
  
  let result = html;
  
  // 절대경로 /로 시작하는 것들 → ../ 로
  result = result.replace(/(href|src|action)="\/([^"]*?)"/g, '$1="../$2"');
  
  // 상대경로 중 루트레벨 파일들 (xxx.html, treatments/xxx 등)
  // href="mission.html" → href="../mission.html"
  // href="reservation.html" → href="../reservation.html"
  // href="treatments/xxx" → href="../treatments/xxx"
  // href="doctors/xxx" → href="../doctors/xxx"
  const rootPaths = ['mission.html', 'reservation.html', 'pricing.html', 'floor-guide.html', 
                     'directions.html', 'faq.html', 'privacy.html', 'terms.html',
                     'treatments/', 'doctors/', 'column/', 'video/', 'cases/', 'auth/',
                     'notice/', 'bdx/', 'area/', 'manifest.json', 'sitemap.xml',
                     'css/', 'js/', 'images/'];
  
  for (const p of rootPaths) {
    // href="mission.html" → href="../mission.html" (but not if already ../)
    const re = new RegExp(`(href|src)="(?!\\.\\./)(?!https?://)(${p.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')})`, 'g');
    result = result.replace(re, '$1="../$2');
  }
  
  return result;
}

// ═══════════════════════════════════════════════════
// 공통 <head> 생성
// ═══════════════════════════════════════════════════
function genHead(data, isSubdir = false) {
  const prefix = isSubdir ? '../' : '';
  const canonicalBase = 'https://bdbddc.com/';
  
  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  
  <!-- Primary SEO -->
  <title>${data.title} | 서울비디치과</title>
  <meta name="description" content="${data.description}">
  <meta name="keywords" content="${data.keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  
  <!-- Canonical & Geo -->
  <link rel="canonical" href="${canonicalBase}${data.canonical}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${data.title} | 서울비디치과">
  <meta property="og:description" content="${data.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalBase}${data.canonical}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title} | 서울비디치과">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-image.jpg">
  
  <!-- Favicon & PWA -->
  <link rel="icon" type="image/svg+xml" href="${prefix}images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="${prefix}images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="${prefix}manifest.json">
  <meta name="theme-color" content="#6B4226">
  
  <!-- Preconnect -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  
  <!-- Fonts & Icons -->
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="${prefix}css/site-v5.css?v=${cssHash}">
  
  <!-- Prefetch -->
  <link rel="prefetch" href="${prefix}reservation.html" as="document">
  
  <!-- Schema.org BreadcrumbList -->
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"${data.breadcrumb}","item":"${canonicalBase}${data.canonical}"}]}
  </script>
${data.inlineStyle ? '\n  <style>\n' + data.inlineStyle + '\n  </style>' : ''}
</head>`;
}

// ═══════════════════════════════════════════════════
// 공통 Hero 생성
// ═══════════════════════════════════════════════════
function genHero(data, isSubdir = false) {
  const prefix = isSubdir ? '../' : '';
  return `
  <!-- HERO -->
  <section class="hero" aria-label="${data.heroAriaLabel || '서울비디치과'}">
    <div class="hero-bg-pattern" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-1" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-2" aria-hidden="true"></div>
    
    <div class="container hero-content">
      <div class="hero-text">
        <p class="hero-brand-name reveal">SEOUL BD DENTAL CLINIC</p>
        
        <h1 class="hero-headline reveal delay-1">
          ${data.heroHeadline}
        </h1>
        
        <p class="hero-sub reveal delay-2">
          ${data.heroSub}
        </p>
        
        <div class="hero-trust-row reveal delay-3">
          <span class="hero-trust-item"><i class="fas fa-graduation-cap"></i> 서울대 15인 협진</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-calendar-check"></i> 365일 진료</span>
          <span class="hero-trust-divider"></span>
          <span class="hero-trust-item"><i class="fas fa-clock"></i> 평일 야간 20시</span>
          <span class="hero-trust-divider desktop-only"></span>
          <span class="hero-trust-item desktop-only"><i class="fas fa-map-marker-alt"></i> 천안 불당동</span>
        </div>
        
        <div class="hero-cta-group reveal delay-4">
          <a href="${prefix}reservation.html" class="btn btn-primary btn-lg">
            <i class="fas fa-calendar-check"></i> 상담 예약하기
          </a>
          <a href="tel:0414152892" class="btn btn-outline btn-lg">
            <i class="fas fa-phone"></i> 041-415-2892
          </a>
        </div>
      </div>
    </div>
    
    <div class="hero-scroll-hint" aria-hidden="true">
      <span>SCROLL</span>
      <div class="scroll-line"></div>
    </div>
  </section>`;
}

// ═══════════════════════════════════════════════════
// 공통 CTA 섹션 생성
// ═══════════════════════════════════════════════════
function genCTA(data, isSubdir = false) {
  const prefix = isSubdir ? '../' : '';
  return `
  <!-- CTA -->
  <section class="cta-section" aria-label="상담 예약">
    <div class="container">
      <div class="cta-box reveal">
        <div class="cta-content">
          <span class="cta-badge"><i class="fas fa-calendar-check"></i> 무료 상담</span>
          <h2>${data.ctaTitle || '궁금한 점이 있으신가요?'}</h2>
          <p>${data.ctaSub || '365일 진료하는 서울비디치과에 부담 없이 문의하세요.'}</p>
          <div class="cta-buttons">
            <a href="${prefix}reservation.html" class="btn-cta-primary"><i class="fas fa-calendar-check"></i> 무료 상담 예약</a>
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
  </section>`;
}

// ═══════════════════════════════════════════════════
// 공통 스크립트 (Scroll Reveal)
// ═══════════════════════════════════════════════════
function genScripts(isSubdir = false) {
  const prefix = isSubdir ? '../' : '';
  return `
  <!-- Scripts -->
  <script src="${prefix}js/main.js" defer></script>
  <script src="${prefix}js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});els.forEach(function(el){obs.observe(el);});});
  </script>`;
}

// ═══════════════════════════════════════════════════
// 페이지 조립
// ═══════════════════════════════════════════════════
function buildPage(data) {
  const isSubdir = data.isSubdir || false;
  
  // 헤더/푸터/모바일네비: 서브디렉토리용은 경로 변환
  let header = ROOT_HEADER;
  let footer = ROOT_FOOTER;
  let mobileNav = ROOT_MOBILE_NAV;
  let floatingCta = ROOT_FLOATING_CTA;
  let mobileBottomCta = ROOT_MOBILE_BOTTOM_CTA;
  
  if (isSubdir) {
    header = convertToSubdir(header);
    footer = convertToSubdir(footer);
    mobileNav = convertToSubdir(mobileNav);
    floatingCta = convertToSubdir(floatingCta);
    mobileBottomCta = convertToSubdir(mobileBottomCta);
  }
  
  const head = genHead(data, isSubdir);
  const hero = genHero(data, isSubdir);
  const cta = genCTA(data, isSubdir);
  const scripts = genScripts(isSubdir);
  
  let html = `${head}
<body>
  <!-- Skip Navigation -->
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  
  <!-- HEADER -->
  ${header}

  <!-- MAIN -->
  <main id="main-content" role="main">
${hero}
${data.bodyContent}
${cta}
  </main>

  <!-- FOOTER -->
  ${footer}

  <!-- Mobile Navigation -->
  ${mobileNav}

  <!-- Floating CTA -->
  ${floatingCta}
  ${mobileBottomCta}

${scripts}
${data.pageScript || ''}
</body>
</html>`;

  return html;
}

// ═══════════════════════════════════════════════════
// 페이지별 고유 콘텐츠 정의
// ═══════════════════════════════════════════════════

// 1. PRICING PAGE
const pricingData = {
  file: 'pricing.html',
  title: '비용 안내',
  description: '서울비디치과 비용 안내 — 임플란트, 교정, 일반 진료 비용을 투명하게 안내합니다. 추가 비용 없는 정직한 견적서 제공. ☎ 041-415-2892',
  keywords: '천안 치과 비용, 임플란트 비용, 교정 비용, 서울비디치과 가격, 천안 임플란트 가격',
  canonical: 'pricing.html',
  breadcrumb: '비용 안내',
  heroHeadline: '투명한 <span class="text-gradient">비용 안내</span>',
  heroSub: '추가 비용 없는 정직한 견적서 제공<br>서울비디치과는 불필요한 치료를 권유하지 않습니다',
  ctaTitle: '비용이 걱정되시나요?',
  ctaSub: '부담 없이 상담받으세요. 정확한 진단 후 맞춤 견적서를 제공해 드립니다.',
  inlineStyle: `    .pricing-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; justify-content: center; }
    .pricing-tab { padding: 12px 24px; border: 2px solid var(--border-color); border-radius: 100px; background: var(--white); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s; color: var(--text-secondary); }
    .pricing-tab:hover { border-color: var(--brand); color: var(--brand); }
    .pricing-tab.active { background: var(--brand); color: var(--white); border-color: var(--brand); }
    .pricing-tab i { margin-right: 6px; }
    .pricing-content { display: none; }
    .pricing-content.active { display: block; animation: fadeInUp 0.4s ease; }
    .pricing-table-wrapper { overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
    .treatment-name i { color: var(--green); margin-right: 8px; }
    .price { font-weight: 700; color: var(--brand); font-size: 1.05rem; }
    .note { font-size: 0.85rem; color: var(--text-secondary); }
    .popular-badge { display: inline-block; background: linear-gradient(135deg, var(--brand-gold), var(--brand)); color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; font-weight: 600; margin-left: 8px; vertical-align: middle; }
    .payment-methods { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
    .payment-method { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px 16px; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-lg); transition: all 0.3s; }
    .payment-method:hover { border-color: var(--brand-gold-light); box-shadow: var(--shadow-card); transform: translateY(-2px); }
    .payment-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--brand-gold-light), var(--brand-gold)); border-radius: 50%; color: var(--brand-dark); font-size: 1.2rem; }
    .payment-method span { font-weight: 600; font-size: 0.9rem; }
    .max-w-800 { max-width: 800px; margin: 0 auto; }
    .mt-8 { margin-top: 32px; }
    .info-box { background: var(--gray-50); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 32px; margin-bottom: 24px; }
    .info-box h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .info-box h3 i { color: var(--green); }
    .info-box ul { list-style: none; padding: 0; }
    .info-box li { padding: 8px 0; padding-left: 24px; position: relative; color: var(--text-secondary); }
    .info-box li::before { content: "\\f00c"; font-family: "Font Awesome 6 Free"; font-weight: 900; position: absolute; left: 0; color: var(--brand-gold); font-size: 0.85rem; }
    .notice-callout { display: flex; gap: 16px; padding: 20px 24px; background: #FFF7ED; border: 1px solid #FED7AA; border-radius: var(--radius-lg); }
    .callout-icon { width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--brand); color: var(--white); border-radius: 50%; font-size: 0.9rem; }
    .callout-content h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; }
    .callout-content p { font-size: 0.88rem; color: var(--gray-600); line-height: 1.6; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 768px) { .pricing-tab { padding: 10px 16px; font-size: 0.85rem; } }`,
  bodyContent: `
  <!-- 가격 정책 -->
  <section class="content-section" aria-label="가격 정책">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-shield-alt"></i> 가격 정책</span>
        <h2 class="section-title">서울비디치과의 <span class="text-gradient">가격 정책</span></h2>
        <p class="section-subtitle">환자분께 투명하고 정직한 진료비를 안내드립니다</p>
      </div>
      <div class="info-grid reveal">
        <div class="info-card">
          <div class="card-icon"><i class="fas fa-search"></i></div>
          <h3>정확한 진단 후 견적</h3>
          <p>환자분의 상태를 정확히 진단한 후 맞춤 치료 계획과 견적을 안내드립니다.</p>
        </div>
        <div class="info-card">
          <div class="card-icon"><i class="fas fa-file-alt"></i></div>
          <h3>서면 견적서 제공</h3>
          <p>치료 항목과 비용이 명시된 견적서를 제공해 드립니다. 투명한 정보 공개.</p>
        </div>
        <div class="info-card">
          <div class="card-icon"><i class="fas fa-hand-holding-heart"></i></div>
          <h3>불필요한 치료 지양</h3>
          <p>필요하지 않은 치료를 권유하지 않습니다. 환자 중심의 정직한 진료.</p>
        </div>
        <div class="info-card">
          <div class="card-icon"><i class="fas fa-comments"></i></div>
          <h3>충분한 상담</h3>
          <p>비용에 대한 모든 궁금증을 해소해 드립니다. 부담 없이 질문하세요.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 치료별 비용 -->
  <section class="content-section bg-warm" aria-label="치료별 비용">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-calculator"></i> 예상 비용</span>
        <h2 class="section-title">치료별 <span class="text-gradient">예상 비용</span></h2>
        <p class="section-subtitle">아래 비용은 참고용이며, 정확한 비용은 상담 후 안내드립니다</p>
      </div>
      
      <div class="pricing-tabs reveal">
        <button class="pricing-tab active" data-tab="implant"><i class="fas fa-tooth"></i> 임플란트</button>
        <button class="pricing-tab" data-tab="ortho"><i class="fas fa-teeth"></i> 교정</button>
        <button class="pricing-tab" data-tab="pediatric"><i class="fas fa-child"></i> 소아치과</button>
        <button class="pricing-tab" data-tab="aesthetic"><i class="fas fa-sparkles"></i> 심미치료</button>
        <button class="pricing-tab" data-tab="general"><i class="fas fa-stethoscope"></i> 일반진료</button>
      </div>
      
      <div class="pricing-content active" id="implant">
        <div class="pricing-table-wrapper reveal">
          <table class="pricing-table">
            <thead><tr><th>치료 항목</th><th>예상 비용</th><th>비고</th></tr></thead>
            <tbody>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 일반 임플란트</td><td><span class="price">100만원대~</span></td><td class="note">브랜드별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 프리미엄 임플란트 <span class="popular-badge">인기</span></td><td><span class="price">150만원대~</span></td><td class="note">스트라우만, 오스템 등</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 네비게이션 임플란트</td><td><span class="price">180만원대~</span></td><td class="note">정밀 디지털 가이드</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 수면 임플란트</td><td><span class="price">+별도</span></td><td class="note">수면마취 비용 별도</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 뼈이식</td><td><span class="price">30~80만원</span></td><td class="note">범위에 따라 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 상악동 거상술</td><td><span class="price">50~100만원</span></td><td class="note">상태에 따라 상이</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pricing-content" id="ortho">
        <div class="pricing-table-wrapper">
          <table class="pricing-table">
            <thead><tr><th>치료 항목</th><th>예상 비용</th><th>비고</th></tr></thead>
            <tbody>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 인비절라인 풀 <span class="popular-badge">추천</span></td><td><span class="price">500~700만원</span></td><td class="note">전체 교정</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 인비절라인 라이트</td><td><span class="price">300~400만원</span></td><td class="note">부분 교정</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 인비절라인 퍼스트</td><td><span class="price">400~500만원</span></td><td class="note">소아 전용</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 세라믹 교정</td><td><span class="price">350~500만원</span></td><td class="note">심미 브라켓</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 메탈 교정</td><td><span class="price">300~400만원</span></td><td class="note">일반 브라켓</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 부분 앞니 교정</td><td><span class="price">150~250만원</span></td><td class="note">전치부 한정</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pricing-content" id="pediatric">
        <div class="pricing-table-wrapper">
          <table class="pricing-table">
            <thead><tr><th>치료 항목</th><th>예상 비용</th><th>비고</th></tr></thead>
            <tbody>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 실란트 (치면열구전색)</td><td><span class="price">1~2만원/개</span></td><td class="note">충치 예방</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 불소 도포 <span class="popular-badge">예방</span></td><td><span class="price">2~3만원</span></td><td class="note">정기 예방</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 유치 레진 치료</td><td><span class="price">5~10만원</span></td><td class="note">범위별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 유치 크라운</td><td><span class="price">10~15만원</span></td><td class="note">재질별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 유치 신경치료</td><td><span class="price">8~15만원</span></td><td class="note">상태별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 공간유지장치</td><td><span class="price">15~25만원</span></td><td class="note">유형별 상이</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pricing-content" id="aesthetic">
        <div class="pricing-table-wrapper">
          <table class="pricing-table">
            <thead><tr><th>치료 항목</th><th>예상 비용</th><th>비고</th></tr></thead>
            <tbody>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 라미네이트 <span class="popular-badge">인기</span></td><td><span class="price">50~80만원/개</span></td><td class="note">개당 가격</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 올세라믹 크라운</td><td><span class="price">40~70만원</span></td><td class="note">재질별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 지르코니아 크라운</td><td><span class="price">50~80만원</span></td><td class="note">프리미엄</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 심미 레진 치료</td><td><span class="price">8~20만원</span></td><td class="note">범위별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 전문가 미백</td><td><span class="price">30~50만원</span></td><td class="note">방문 횟수별</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> CAD/CAM 원데이</td><td><span class="price">40~60만원</span></td><td class="note">당일 완료</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pricing-content" id="general">
        <div class="pricing-table-wrapper">
          <table class="pricing-table">
            <thead><tr><th>치료 항목</th><th>예상 비용</th><th>비고</th></tr></thead>
            <tbody>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 스케일링</td><td><span class="price">1~1.5만원</span></td><td class="note">건강보험 적용 시</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 충치 치료 (레진)</td><td><span class="price">8~15만원</span></td><td class="note">범위별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 신경 치료</td><td><span class="price">10~20만원</span></td><td class="note">치아별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 사랑니 발치</td><td><span class="price">3~15만원</span></td><td class="note">난이도별 상이</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> 잇몸 치료</td><td><span class="price">일부 보험</span></td><td class="note">건강보험 일부 적용</td></tr>
              <tr><td class="treatment-name"><i class="fas fa-check-circle"></i> BDX 종합검진 <span class="popular-badge">무료</span></td><td><span class="price">첫 방문 무료</span></td><td class="note">구강 종합검진</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- 건강보험 안내 -->
  <section class="content-section" aria-label="건강보험 안내">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-heartbeat"></i> 건강보험</span>
        <h2 class="section-title">건강보험 <span class="text-gradient">적용 안내</span></h2>
        <p class="section-subtitle">국민건강보험이 적용되는 진료를 안내해 드립니다</p>
      </div>
      <div class="max-w-800">
        <div class="info-box reveal">
          <h3><i class="fas fa-check-circle"></i> 건강보험 적용 항목</h3>
          <ul>
            <li>스케일링 (연 1회, 만 19세 이상)</li>
            <li>만 12세 이하 아동 레진 충전 (광중합형 복합레진)</li>
            <li>치석 제거, 잇몸 치료 (치주 처치)</li>
            <li>파노라마 X-ray, 치근단 촬영</li>
            <li>신경치료 (근관치료)</li>
            <li>치아 발치 (사랑니 포함)</li>
            <li>65세 이상 임플란트 (부분 적용)</li>
          </ul>
        </div>
        <div class="notice-callout reveal">
          <div class="callout-icon"><i class="fas fa-info"></i></div>
          <div class="callout-content">
            <h4>비급여 항목 안내</h4>
            <p>인비절라인 교정, 라미네이트, 심미 보철, 미백 등은 비급여 항목으로 건강보험이 적용되지 않습니다. 자세한 사항은 내원 상담 시 안내드립니다.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 결제 안내 -->
  <section class="content-section bg-warm" aria-label="결제 안내">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-credit-card"></i> 결제 방법</span>
        <h2 class="section-title">편리한 <span class="text-gradient">결제 안내</span></h2>
        <p class="section-subtitle">다양한 결제 방법으로 편리하게 이용하실 수 있습니다</p>
      </div>
      <div class="payment-methods reveal">
        <div class="payment-method"><div class="payment-icon"><i class="fas fa-credit-card"></i></div><span>신용카드</span></div>
        <div class="payment-method"><div class="payment-icon"><i class="fas fa-university"></i></div><span>계좌이체</span></div>
        <div class="payment-method"><div class="payment-icon"><i class="fas fa-mobile-alt"></i></div><span>간편결제</span></div>
        <div class="payment-method"><div class="payment-icon"><i class="fas fa-calendar-alt"></i></div><span>무이자 할부</span></div>
        <div class="payment-method"><div class="payment-icon"><i class="fas fa-money-bill-wave"></i></div><span>현금</span></div>
      </div>
      <div class="max-w-800 mt-8">
        <div class="notice-callout reveal">
          <div class="callout-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="callout-content">
            <h4>비용 관련 주의사항</h4>
            <p>본 페이지의 비용은 참고용이며, 환자분의 구강 상태에 따라 달라질 수 있습니다. 정확한 비용은 내원 상담 및 진단 후 안내드리며, 치료 전 서면 동의를 받습니다.</p>
          </div>
        </div>
      </div>
    </div>
  </section>`,
  pageScript: `
  <script>
    // Pricing Tab Switching
    document.addEventListener('DOMContentLoaded', function() {
      var tabs = document.querySelectorAll('.pricing-tab');
      var contents = document.querySelectorAll('.pricing-content');
      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          tabs.forEach(function(t) { t.classList.remove('active'); });
          contents.forEach(function(c) { c.classList.remove('active'); });
          tab.classList.add('active');
          var target = document.getElementById(tab.dataset.tab);
          if (target) target.classList.add('active');
        });
      });
    });
  </script>`
};

// 2. FLOOR-GUIDE PAGE
const floorGuideData = {
  file: 'floor-guide.html',
  title: '층별 안내',
  description: '서울비디치과 층별 안내 — 400평 규모 5층 전문센터. 1층 교정센터, 2층 기공·위생, 3층 검진·소아, 4층 임플란트, 5층 종합진료',
  keywords: '천안치과 층별안내, 서울비디치과 시설, 400평 치과',
  canonical: 'floor-guide.html',
  breadcrumb: '층별 안내',
  heroHeadline: '1~5층 <span class="text-gradient">전문센터</span> 구성',
  heroSub: '400평 규모 — 환자분의 편안함과 안전을 위한 프리미엄 의료 시설',
  inlineStyle: `    .floor-card { display: grid; grid-template-columns: 120px 1fr; gap: 32px; padding: 40px; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-xl); margin-bottom: 24px; transition: all 0.4s; position: relative; overflow: hidden; }
    .floor-card::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-radius: 4px 0 0 4px; }
    .floor-card.f5::before { background: #6366F1; }
    .floor-card.f4::before { background: #3B82F6; }
    .floor-card.f3::before { background: #10B981; }
    .floor-card.f2::before { background: #F59E0B; }
    .floor-card.f1::before { background: var(--brand); }
    .floor-card:hover { border-color: var(--brand-gold-light); box-shadow: 0 12px 40px rgba(107,66,38,0.08); transform: translateY(-4px); }
    .floor-badge { text-align: center; }
    .floor-badge-num { display: block; font-size: 3rem; font-weight: 900; line-height: 1; }
    .floor-card.f5 .floor-badge-num { color: #6366F1; }
    .floor-card.f4 .floor-badge-num { color: #3B82F6; }
    .floor-card.f3 .floor-badge-num { color: #10B981; }
    .floor-card.f2 .floor-badge-num { color: #F59E0B; }
    .floor-card.f1 .floor-badge-num { color: var(--brand); }
    .floor-badge-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .floor-body h3 { font-size: 1.35rem; font-weight: 800; margin-bottom: 4px; }
    .floor-body .floor-en { font-size: 0.8rem; color: var(--text-tertiary); margin-bottom: 16px; font-weight: 500; }
    .floor-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .floor-tag { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: var(--gray-50); border: 1px solid var(--border-color); border-radius: 100px; font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); }
    .floor-tag i { font-size: 0.75rem; color: var(--brand-gold); }
    .floor-body p.floor-desc-text { font-size: 0.92rem; color: var(--text-secondary); line-height: 1.7; }
    .floor-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 60px; }
    .overview-stat { text-align: center; padding: 28px 16px; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-lg); transition: all 0.3s; }
    .overview-stat:hover { border-color: var(--brand-gold-light); box-shadow: var(--shadow-card); }
    .overview-stat .stat-icon { font-size: 1.5rem; color: var(--brand); margin-bottom: 12px; }
    .overview-stat .stat-value { font-size: 1.8rem; font-weight: 900; color: var(--brand); }
    .overview-stat .stat-label { font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; }
    @media (max-width: 768px) {
      .floor-card { grid-template-columns: 1fr; gap: 16px; padding: 24px; }
      .floor-badge { display: flex; align-items: center; gap: 12px; }
      .floor-badge-num { font-size: 2rem; }
      .floor-overview { grid-template-columns: repeat(2, 1fr); }
    }`,
  bodyContent: `
  <!-- 시설 개요 -->
  <section class="content-section" aria-label="시설 개요">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-building"></i> 시설 개요</span>
        <h2 class="section-title">서울비디치과 <span class="text-gradient">시설 규모</span></h2>
      </div>

      <div class="floor-overview reveal">
        <div class="overview-stat"><div class="stat-icon"><i class="fas fa-building"></i></div><div class="stat-value">400평</div><div class="stat-label">총 규모</div></div>
        <div class="overview-stat"><div class="stat-icon"><i class="fas fa-layer-group"></i></div><div class="stat-value">5층</div><div class="stat-label">전문센터</div></div>
        <div class="overview-stat"><div class="stat-icon"><i class="fas fa-procedures"></i></div><div class="stat-value">6개</div><div class="stat-label">독립 수술실</div></div>
        <div class="overview-stat"><div class="stat-icon"><i class="fas fa-user-md"></i></div><div class="stat-value">15명</div><div class="stat-label">서울대 전문의</div></div>
      </div>

      <div class="floor-card f5 reveal">
        <div class="floor-badge"><span class="floor-badge-num">5F</span><span class="floor-badge-label">Floor</span></div>
        <div class="floor-body">
          <h3>종합진료센터</h3><p class="floor-en">General Treatment Center</p>
          <div class="floor-tags">
            <span class="floor-tag"><i class="fas fa-tooth"></i> 충치 치료</span>
            <span class="floor-tag"><i class="fas fa-syringe"></i> 신경 치료</span>
            <span class="floor-tag"><i class="fas fa-spray-can"></i> 스케일링</span>
            <span class="floor-tag"><i class="fas fa-band-aid"></i> 잇몸 치료</span>
            <span class="floor-tag"><i class="fas fa-sun"></i> 미백</span>
            <span class="floor-tag"><i class="fas fa-teeth-open"></i> 사랑니 발치</span>
          </div>
          <p class="floor-desc-text">충치 치료, 신경 치료, 잇몸 치료, 미백, 사랑니 발치 등 일반적인 치과 치료가 진행됩니다. 보존 및 치주 전문 의료진이 환자 한 분 한 분에게 맞는 정성껏 진료합니다.</p>
        </div>
      </div>

      <div class="floor-card f4 reveal">
        <div class="floor-badge"><span class="floor-badge-num">4F</span><span class="floor-badge-label">Floor</span></div>
        <div class="floor-body">
          <h3>임플란트센터</h3><p class="floor-en">Implant Center</p>
          <div class="floor-tags">
            <span class="floor-tag"><i class="fas fa-teeth-open"></i> 임플란트 수술</span>
            <span class="floor-tag"><i class="fas fa-bed"></i> 수면 임플란트</span>
            <span class="floor-tag"><i class="fas fa-crosshairs"></i> 네비게이션 임플란트</span>
            <span class="floor-tag"><i class="fas fa-bone"></i> 뼈이식 수술</span>
            <span class="floor-tag"><i class="fas fa-procedures"></i> 6개 수술방</span>
            <span class="floor-tag"><i class="fas fa-couch"></i> 2개 회복실</span>
          </div>
          <p class="floor-desc-text">첨단 설비를 갖춘 6개 수술방과 2개 회복실에서 임플란트 수술이 진행됩니다. 네비게이션 시스템을 활용한 정밀 수술과 수면 임플란트로 편안하고 안전한 치료를 제공합니다.</p>
        </div>
      </div>

      <div class="floor-card f3 reveal">
        <div class="floor-badge"><span class="floor-badge-num">3F</span><span class="floor-badge-label">Floor</span></div>
        <div class="floor-body">
          <h3>BDX 검진센터 · 소아치과센터</h3><p class="floor-en">BDX Checkup &amp; Pediatric Center</p>
          <div class="floor-tags">
            <span class="floor-tag"><i class="fas fa-microscope"></i> BDX 정밀검진</span>
            <span class="floor-tag"><i class="fas fa-x-ray"></i> CT · 파노라마</span>
            <span class="floor-tag"><i class="fas fa-child"></i> 소아치과 전문의 3인</span>
            <span class="floor-tag"><i class="fas fa-laugh-beam"></i> 웃음가스 진정</span>
            <span class="floor-tag"><i class="fas fa-door-closed"></i> 소아 전용 진료실</span>
          </div>
          <p class="floor-desc-text">BDX 정밀검진센터에서 CT, 파노라마, 구강카메라 등을 이용한 종합 검진이 진행됩니다. 서울대 소아치과 전문의 3인이 아이 눈높이에서 편안한 치료를 제공합니다.</p>
        </div>
      </div>

      <div class="floor-card f2 reveal">
        <div class="floor-badge"><span class="floor-badge-num">2F</span><span class="floor-badge-label">Floor</span></div>
        <div class="floor-body">
          <h3>디지털기공센터 · 위생관리센터</h3><p class="floor-en">Digital Lab &amp; Hygiene Center</p>
          <div class="floor-tags">
            <span class="floor-tag"><i class="fas fa-cogs"></i> 디지털 기공소</span>
            <span class="floor-tag"><i class="fas fa-shield-virus"></i> 위생관리센터</span>
            <span class="floor-tag"><i class="fas fa-desktop"></i> CAD/CAM 시스템</span>
            <span class="floor-tag"><i class="fas fa-users-cog"></i> 전략기획실</span>
            <span class="floor-tag"><i class="fas fa-user-tie"></i> 기공사 5인</span>
          </div>
          <p class="floor-desc-text">충남권 대규모의 원내 디지털 기공소에서 맞춤형 보철물을 당일 제작합니다. 에어샤워 시스템을 갖춘 철저한 감염관리로 안전한 진료 환경을 유지합니다.</p>
        </div>
      </div>

      <div class="floor-card f1 reveal">
        <div class="floor-badge"><span class="floor-badge-num">1F</span><span class="floor-badge-label">Floor</span></div>
        <div class="floor-body">
          <h3>인비절라인 치아교정센터</h3><p class="floor-en">Invisalign Orthodontic Center</p>
          <div class="floor-tags">
            <span class="floor-tag"><i class="fas fa-teeth"></i> 인비절라인</span>
            <span class="floor-tag"><i class="fas fa-user-md"></i> 서울대 교정 전문의 2인</span>
            <span class="floor-tag"><i class="fas fa-cube"></i> iTero 구강스캐너</span>
            <span class="floor-tag"><i class="fas fa-laptop-medical"></i> 3D 클린체크</span>
            <span class="floor-tag"><i class="fas fa-award"></i> 대규모 교정센터</span>
          </div>
          <p class="floor-desc-text">대규모 인비절라인 전문 센터입니다. 서울대 교정과 전문의 2인이 iTero 구강 스캐너와 3D 시뮬레이션(클린체크)으로 정밀한 교정 치료를 제공합니다. 일요일 진료로 바쁜 직장인도 편하게 방문하실 수 있습니다.</p>
        </div>
      </div>
    </div>
  </section>`
};

// 3. DIRECTIONS PAGE
const directionsData = {
  file: 'directions.html',
  title: '오시는 길',
  description: '서울비디치과 오시는 길 — 충남 천안시 서북구 불당34길 14. 자가용, 대중교통, 주차 안내.',
  keywords: '천안치과 위치, 서울비디치과 길찾기, 불당동 치과, 천안 불당34길 14',
  canonical: 'directions.html',
  breadcrumb: '오시는 길',
  heroHeadline: '서울비디치과 <span class="text-gradient">오시는 길</span>',
  heroSub: '충남 천안시 서북구 불당34길 14, 1~5층 — 무료 주차 가능',
  inlineStyle: `    .location-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
    .map-container { border-radius: var(--radius-xl); overflow: hidden; }
    .google-map-wrapper { border-radius: var(--radius-lg); overflow: hidden; }
    .map-actions { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
    .location-info { display: flex; flex-direction: column; gap: 20px; }
    .dir-info-card { padding: 24px; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
    .dir-info-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--brand-gold-light), var(--brand-gold)); border-radius: 50%; color: var(--brand-dark); font-size: 1rem; margin-bottom: 12px; }
    .dir-info-content h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .address-main { font-size: 1.05rem; font-weight: 600; }
    .address-detail, .postal-code { font-size: 0.88rem; color: var(--text-secondary); }
    .copy-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--gray-50); border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.85rem; cursor: pointer; transition: all 0.3s; margin-top: 12px; }
    .copy-btn:hover { background: var(--brand); color: var(--white); border-color: var(--brand); }
    .hours-table { width: 100%; }
    .hours-table td { padding: 8px 4px; font-size: 0.92rem; }
    .hours-note { margin-top: 12px; padding: 8px 12px; background: #FFF7ED; border-radius: var(--radius-md); font-size: 0.88rem; }
    .transport-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .transport-card { padding: 32px 24px; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-lg); position: relative; }
    .transport-card.highlight { border-color: var(--brand-gold); }
    .transport-badge { position: absolute; top: -12px; right: 16px; background: var(--brand); color: var(--white); padding: 4px 16px; border-radius: 100px; font-size: 0.8rem; font-weight: 700; }
    .transport-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: var(--gray-50); border-radius: 50%; font-size: 1.3rem; color: var(--brand); margin-bottom: 16px; }
    .transport-card h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 16px; }
    .transport-content h4 { font-size: 0.92rem; font-weight: 700; margin: 16px 0 8px; color: var(--brand); }
    .transport-content ul { list-style: none; padding: 0; }
    .transport-content li { padding: 4px 0; font-size: 0.9rem; color: var(--text-secondary); }
    .bus-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .bus-num { padding: 4px 12px; border-radius: 4px; font-size: 0.82rem; font-weight: 700; color: white; }
    .bus-num.blue { background: #3B82F6; }
    .bus-num.green { background: #10B981; }
    .bus-num.red { background: #EF4444; }
    .landmarks-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .landmark-item { text-align: center; padding: 24px 16px; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-lg); transition: all 0.3s; }
    .landmark-item:hover { border-color: var(--brand-gold-light); transform: translateY(-2px); }
    .landmark-item i { font-size: 1.5rem; color: var(--brand); margin-bottom: 8px; display: block; }
    .landmark-item span { display: block; font-weight: 600; font-size: 0.92rem; }
    .landmark-item small { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }
    .amenities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .amenity-item { text-align: center; padding: 28px 16px; }
    .amenity-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--brand-gold-light), var(--brand-gold)); border-radius: 50%; color: var(--brand-dark); font-size: 1.2rem; margin: 0 auto 16px; }
    .amenity-item h4 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
    .amenity-item p { font-size: 0.85rem; color: var(--text-secondary); }
    .contact-tel a { color: var(--brand); font-size: 1.2rem; text-decoration: none; }
    .contact-sub { font-size: 0.88rem; color: var(--text-secondary); }
    @media (max-width: 768px) {
      .location-grid { grid-template-columns: 1fr; }
      .transport-grid { grid-template-columns: 1fr; }
      .landmarks-grid { grid-template-columns: repeat(2, 1fr); }
    }`,
  bodyContent: `
  <!-- Location Info -->
  <section class="content-section" aria-label="위치 정보">
    <div class="container">
      <div class="location-grid">
        <div class="map-container">
          <div class="google-map-wrapper">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3180.7589788377!2d127.1051!3d36.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b285e48d9f1d1%3A0x7c0c3f4d5e5f6a7b!2z7LWo64Ko7LKc7JWI7Iuc7ISc67aB6rWsIOu2iOuLuTM06ri4IDE0!5e0!3m2!1sko!2skr!4v1701500000000!5m2!1sko!2skr" width="100%" height="400" style="border:0; border-radius: 16px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <div class="map-actions">
            <a href="https://www.google.com/maps/search/충남+천안시+서북구+불당34길+14" target="_blank" class="btn btn-primary"><i class="fab fa-google"></i> 구글 지도에서 보기</a>
            <a href="https://map.naver.com/v5/search/서울비디치과" target="_blank" class="btn btn-secondary"><i class="fas fa-map"></i> 네이버 지도</a>
            <a href="https://map.kakao.com/?q=서울비디치과" target="_blank" class="btn btn-secondary"><i class="fas fa-map-marker-alt"></i> 카카오맵</a>
          </div>
        </div>
        <div class="location-info">
          <div class="dir-info-card">
            <div class="dir-info-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="dir-info-content">
              <h3>주소</h3>
              <p class="address-main">충남 천안시 서북구 불당34길 14</p>
              <p class="address-detail">1~5층 (불당동 1841)</p>
              <p class="postal-code">우편번호: 31156</p>
              <button class="copy-btn" data-copy="충남 천안시 서북구 불당34길 14"><i class="fas fa-copy"></i> 주소 복사</button>
            </div>
          </div>
          <div class="dir-info-card">
            <div class="dir-info-icon"><i class="fas fa-phone-alt"></i></div>
            <div class="dir-info-content">
              <h3>연락처</h3>
              <p class="contact-tel"><a href="tel:041-415-2892"><strong>041-415-2892</strong></a></p>
              <p class="contact-sub">팩스: 041-415-2893</p>
              <p class="contact-sub">이메일: info@bdbddc.com</p>
            </div>
          </div>
          <div class="dir-info-card">
            <div class="dir-info-icon"><i class="fas fa-clock"></i></div>
            <div class="dir-info-content">
              <h3>진료 시간</h3>
              <table class="hours-table">
                <tr><td>평일 (월~금)</td><td><strong>09:00 - 20:00</strong></td></tr>
                <tr><td>토·일요일</td><td><strong>09:00 - 17:00</strong></td></tr>
                <tr><td>공휴일</td><td><strong>09:00 - 13:00</strong></td></tr>
                <tr><td>점심시간 (평일)</td><td>12:30 - 14:00</td></tr>
              </table>
              <p class="hours-note"><i class="fas fa-star"></i> <strong>365일 진료</strong> - 일요일, 공휴일도 진료합니다!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Transportation -->
  <section class="content-section bg-warm" aria-label="교통 안내">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-route"></i> 교통 안내</span>
        <h2 class="section-title">다양한 방법으로 <span class="text-gradient">방문하세요</span></h2>
      </div>
      <div class="transport-grid reveal">
        <div class="transport-card">
          <div class="transport-icon"><i class="fas fa-car"></i></div>
          <h3>자가용</h3>
          <div class="transport-content">
            <h4>네비게이션 검색</h4>
            <p><strong>"서울비디치과"</strong> 또는<br><strong>"천안시 불당34길 14"</strong></p>
            <h4>주요 경로</h4>
            <ul>
              <li><strong>천안IC</strong>에서 약 15분</li>
              <li><strong>천안아산역</strong>에서 약 10분</li>
              <li><strong>불당동 CGV</strong>에서 도보 3분</li>
            </ul>
          </div>
        </div>
        <div class="transport-card highlight">
          <div class="transport-badge">무료 주차</div>
          <div class="transport-icon"><i class="fas fa-parking"></i></div>
          <h3>주차 안내</h3>
          <div class="transport-content">
            <h4>건물 내 주차장</h4>
            <ul>
              <li>진료 시간 동안 <strong>무료 주차</strong></li>
              <li>주차 가능 대수: <strong>약 30대</strong></li>
              <li>주차 도장은 안내 데스크에서</li>
            </ul>
            <h4>인근 주차장</h4>
            <ul>
              <li>불당동 공영주차장 (도보 2분)</li>
              <li>시간당 1,000원</li>
            </ul>
          </div>
        </div>
        <div class="transport-card">
          <div class="transport-icon"><i class="fas fa-bus"></i></div>
          <h3>대중교통</h3>
          <div class="transport-content">
            <h4>버스</h4>
            <p><strong>"불당동 XX정류장"</strong> 하차 (도보 3분)</p>
            <div class="bus-list">
              <span class="bus-num blue">11</span>
              <span class="bus-num blue">12</span>
              <span class="bus-num green">21</span>
              <span class="bus-num green">22</span>
              <span class="bus-num red">300</span>
            </div>
            <h4>KTX / SRT</h4>
            <ul>
              <li><strong>천안아산역</strong> 하차</li>
              <li>택시 약 10분 / 버스 약 20분</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Landmarks -->
  <section class="content-section" aria-label="주변 랜드마크">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-map-pin"></i> 주변 정보</span>
        <h2 class="section-title">주변 <span class="text-gradient">랜드마크</span></h2>
        <p class="section-subtitle">찾아오실 때 참고하세요</p>
      </div>
      <div class="landmarks-grid reveal">
        <div class="landmark-item"><i class="fas fa-film"></i><span>불당 CGV</span><small>도보 3분</small></div>
        <div class="landmark-item"><i class="fas fa-shopping-bag"></i><span>갤러리아 백화점</span><small>도보 5분</small></div>
        <div class="landmark-item"><i class="fas fa-coffee"></i><span>스타벅스 불당점</span><small>도보 2분</small></div>
        <div class="landmark-item"><i class="fas fa-utensils"></i><span>불당동 먹자골목</span><small>도보 5분</small></div>
      </div>
    </div>
  </section>

  <!-- Amenities -->
  <section class="content-section bg-warm" aria-label="편의 시설">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-badge"><i class="fas fa-concierge-bell"></i> 편의 시설</span>
        <h2 class="section-title">편안한 <span class="text-gradient">방문</span>을 위해</h2>
      </div>
      <div class="amenities-grid reveal">
        <div class="amenity-item"><div class="amenity-icon"><i class="fas fa-wheelchair"></i></div><h4>휠체어 접근</h4><p>건물 입구 및 원내 전체 휠체어 이용 가능</p></div>
        <div class="amenity-item"><div class="amenity-icon"><i class="fas fa-elevator"></i></div><h4>엘리베이터</h4><p>1층~5층 엘리베이터 완비</p></div>
        <div class="amenity-item"><div class="amenity-icon"><i class="fas fa-baby"></i></div><h4>유아 시설</h4><p>기저귀 교환대, 수유실 완비</p></div>
        <div class="amenity-item"><div class="amenity-icon"><i class="fas fa-wifi"></i></div><h4>무료 Wi-Fi</h4><p>대기실 전체 무료 와이파이</p></div>
        <div class="amenity-item"><div class="amenity-icon"><i class="fas fa-couch"></i></div><h4>편안한 대기실</h4><p>넓은 공간과 음료 서비스</p></div>
        <div class="amenity-item"><div class="amenity-icon"><i class="fas fa-tv"></i></div><h4>키즈 공간</h4><p>아이들을 위한 놀이 공간</p></div>
      </div>
    </div>
  </section>`,
  pageScript: `
  <script>
    // Address Copy Button
    document.querySelectorAll('.copy-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        var text=this.dataset.copy;
        if(navigator.clipboard){
          navigator.clipboard.writeText(text).then(function(){
            btn.innerHTML='<i class="fas fa-check"></i> 복사 완료!';
            btn.style.color='var(--green)';
            setTimeout(function(){btn.innerHTML='<i class="fas fa-copy"></i> 주소 복사';btn.style.color='';},2000);
          });
        }else{
          var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
          btn.innerHTML='<i class="fas fa-check"></i> 복사 완료!';
          setTimeout(function(){btn.innerHTML='<i class="fas fa-copy"></i> 주소 복사';},2000);
        }
      });
    });
  </script>`
};

// 4. FAQ PAGE - load from existing file since it's huge
const faqData = {
  file: 'faq.html',
  title: '자주 묻는 질문',
  description: '서울비디치과 자주 묻는 질문 — 임플란트, 교정, 비용, 예약 관련 궁금한 점을 안내합니다.',
  keywords: '천안치과 FAQ, 임플란트 질문, 교정 비용, 서울비디치과 자주 묻는 질문',
  canonical: 'faq.html',
  breadcrumb: '자주 묻는 질문',
  heroHeadline: '자주 묻는 <span class="text-gradient">질문</span>',
  heroSub: '환자분들이 가장 궁금해하시는 질문을 모았습니다',
  inlineStyle: `    .faq-search-section { padding: 40px 0 0; }
    .faq-search-box { display: flex; align-items: center; gap: 16px; padding: 16px 24px; background: var(--white); border: 2px solid var(--border-color); border-radius: 100px; max-width: 600px; margin: 0 auto; transition: all 0.3s; }
    .faq-search-box:focus-within { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(107,66,38,0.1); }
    .faq-search-box i { color: var(--text-tertiary); font-size: 1.1rem; }
    .faq-search-box input { border: none; outline: none; width: 100%; font-size: 1rem; font-family: var(--font-family); background: transparent; }
    .faq-search-box input::placeholder { color: var(--text-tertiary); }
    .faq-q-badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--brand); color: white; font-size: 0.75rem; font-weight: 800; border-radius: 6px; flex-shrink: 0; }
    .faq-q-text { flex: 1; }
    .faq-icon { display: none; }
    .faq-a-content { padding: 20px 0 8px; }
    .faq-a-content ul { padding-left: 20px; margin: 8px 0; }
    .faq-a-content li { padding: 4px 0; color: var(--text-secondary); font-size: 0.92rem; }
    .faq-note, .faq-highlight { margin-top: 12px; padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.88rem; }
    .faq-note { background: var(--gray-50); color: var(--gray-600); }
    .faq-highlight { background: #ECFDF5; color: #065F46; }
    .faq-note i, .faq-highlight i { margin-right: 6px; }
    .faq-table { width: 100%; margin: 8px 0; }
    .faq-table td { padding: 8px 12px; font-size: 0.92rem; border-bottom: 1px solid var(--border-color); }
    .no-results-icon { font-size: 3rem; color: var(--text-tertiary); margin-bottom: 16px; }
    .faq-no-results { text-align: center; padding: 60px 20px; }
    .faq-no-results h3 { font-size: 1.2rem; margin-bottom: 8px; }
    .faq-no-results p { color: var(--text-secondary); margin-bottom: 20px; }`,
};

// For FAQ, we'll extract the body content from the existing file
const existingFaq = fs.readFileSync(path.join(PUBLIC_DIR, 'faq.html'), 'utf8');
// Extract everything between hero close and CTA open
const faqBodyMatch = existingFaq.match(/<\/section>\s*(<!-- Page Header -->[\s\S]*?)<!-- Mobile Nav -->/);
const faqBodyAlt = existingFaq.match(/<\/section>\s*\n\s*(<!-- Quick Search[\s\S]*?<\/section>\s*)\n\s*<!-- Still/);
// Better: extract from after hero to before CTA
const faqSearchAndContent = existingFaq.match(/<!-- Quick Search[\s\S]*?<\/section>\s*\n\s*<!-- FAQ Categories[\s\S]*?<\/section>\s*\n/);
// Simplest approach: extract between first </section> after hero and last CTA
let faqBody = '';
{
  // Find end of hero section
  const heroEnd = existingFaq.indexOf('</section>', existingFaq.indexOf('hero-scroll-hint'));
  const ctaStart = existingFaq.indexOf('<section class="cta-section"');
  if (heroEnd > 0 && ctaStart > heroEnd) {
    faqBody = existingFaq.substring(heroEnd + '</section>'.length, ctaStart).trim();
  }
}
faqData.bodyContent = '\n' + faqBody;
faqData.pageScript = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // FAQ Accordion
      document.querySelectorAll('.faq-question').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var item = this.parentElement;
          var isActive = item.classList.contains('active');
          var group = item.closest('.faq-category-group');
          if (group) {
            group.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('active'); });
          }
          if (!isActive) item.classList.add('active');
          this.setAttribute('aria-expanded', !isActive);
        });
      });

      // Category Tabs
      var catBtns = document.querySelectorAll('.faq-category-btn');
      var catGroups = document.querySelectorAll('.faq-category-group');
      
      catBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var cat = this.dataset.category;
          catBtns.forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          catGroups.forEach(function(g) {
            g.style.display = (cat === 'all' || g.dataset.category === cat) ? '' : 'none';
          });
          document.getElementById('faqNoResults').style.display = 'none';
        });
      });

      // Search
      var searchInput = document.getElementById('faqSearch');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          var query = this.value.toLowerCase().trim();
          var items = document.querySelectorAll('.faq-item');
          var hasResults = false;
          catBtns.forEach(function(b) { b.classList.remove('active'); });
          document.querySelector('.faq-category-btn[data-category="all"]').classList.add('active');
          catGroups.forEach(function(g) { g.style.display = ''; });
          if (!query) {
            items.forEach(function(item) { item.style.display = ''; });
            document.getElementById('faqNoResults').style.display = 'none';
            return;
          }
          items.forEach(function(item) {
            var text = item.textContent.toLowerCase();
            if (text.indexOf(query) > -1) { item.style.display = ''; hasResults = true; }
            else { item.style.display = 'none'; }
          });
          document.getElementById('faqNoResults').style.display = hasResults ? 'none' : 'block';
        });
      }
    });
  </script>`;

// 5. NOTICE PAGE
const noticeData = {
  file: 'notice/index.html',
  isSubdir: true,
  title: '공지사항',
  description: '서울비디치과 공지사항 — 진료시간 변경, 이벤트, 중요 안내사항.',
  keywords: '서울비디치과 공지사항, 천안치과 공지',
  canonical: 'notice/index.html',
  breadcrumb: '공지사항',
  heroHeadline: '<span class="text-gradient">공지사항</span>',
  heroSub: '서울비디치과의 최신 소식을 확인하세요',
  inlineStyle: `    .notice-list { max-width: 800px; margin: 0 auto; }
    .notice-item { padding: 24px; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-lg); margin-bottom: 16px; transition: all 0.3s; cursor: pointer; }
    .notice-item:hover { border-color: var(--brand-gold-light); box-shadow: var(--shadow-card); transform: translateY(-2px); }
    .notice-item.pinned { border-left: 4px solid var(--brand); }
    .notice-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .notice-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; }
    .notice-badge.important { background: #FEE2E2; color: #991B1B; }
    .notice-badge.event { background: #DBEAFE; color: #1E40AF; }
    .notice-badge.info { background: #E8E6E3; color: var(--gray-700); }
    .notice-badge.pin { background: var(--brand); color: white; }
    .notice-date { font-size: 0.82rem; color: var(--text-tertiary); }
    .notice-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 4px; }
    .notice-excerpt { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; }`,
  bodyContent: `
  <!-- 공지사항 목록 -->
  <section class="content-section" aria-label="공지사항 목록">
    <div class="container">
      <div class="notice-list reveal">
        <div class="notice-item pinned">
          <div class="notice-meta">
            <span class="notice-badge pin"><i class="fas fa-thumbtack"></i> 고정</span>
            <span class="notice-badge important">중요</span>
            <span class="notice-date">2026.02.01</span>
          </div>
          <h3 class="notice-title">2026년 설 연휴 진료 안내</h3>
          <p class="notice-excerpt">설 연휴 기간(1/27~1/30) 중 진료 시간이 변경됩니다. 1/28(화)~1/30(목)은 09:00~13:00 진료, 1/27(월)은 정상 진료합니다. 응급 환자는 전화 문의해 주세요.</p>
        </div>
        <div class="notice-item pinned">
          <div class="notice-meta">
            <span class="notice-badge pin"><i class="fas fa-thumbtack"></i> 고정</span>
            <span class="notice-badge event">이벤트</span>
            <span class="notice-date">2026.01.15</span>
          </div>
          <h3 class="notice-title">글로우네이트 신규 상담 이벤트</h3>
          <p class="notice-excerpt">2026년 2월 한 달간 글로우네이트(라미네이트) 신규 상담 시 BDX 정밀검진을 무료로 제공해 드립니다. 아름다운 미소를 위한 첫 걸음, 부담 없이 상담받으세요.</p>
        </div>
        <div class="notice-item">
          <div class="notice-meta">
            <span class="notice-badge info">안내</span>
            <span class="notice-date">2026.01.10</span>
          </div>
          <h3 class="notice-title">주차장 이용 안내 변경</h3>
          <p class="notice-excerpt">1월부터 건물 내 주차장 이용 방법이 변경됩니다. 진료 후 안내 데스크에서 주차 확인을 받으시면 2시간 무료 주차가 가능합니다.</p>
        </div>
        <div class="notice-item">
          <div class="notice-meta">
            <span class="notice-badge info">안내</span>
            <span class="notice-date">2025.12.20</span>
          </div>
          <h3 class="notice-title">인비절라인 교정 상담 대기 안내</h3>
          <p class="notice-excerpt">교정 상담 수요가 많아 현재 약 1~2주 정도의 대기가 발생하고 있습니다. 빠른 상담을 원하시는 분은 온라인 예약을 이용해 주세요.</p>
        </div>
        <div class="notice-item">
          <div class="notice-meta">
            <span class="notice-badge event">이벤트</span>
            <span class="notice-date">2025.12.01</span>
          </div>
          <h3 class="notice-title">연말 스케일링 캠페인</h3>
          <p class="notice-excerpt">올해 건강보험 스케일링을 아직 받지 않으신 분들을 위해, 12월 스케일링 + 구강검진 패키지를 운영합니다. 연 1회 건보 적용 스케일링을 놓치지 마세요!</p>
        </div>
      </div>
    </div>
  </section>`
};

// ═══════════════════════════════════════════════════
// 빌드 실행
// ═══════════════════════════════════════════════════
const pages = [pricingData, floorGuideData, directionsData, faqData, noticeData];
let built = 0;

for (const data of pages) {
  try {
    const html = buildPage(data);
    const outPath = path.join(PUBLIC_DIR, data.file);
    
    // Ensure directory exists
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(outPath, html, 'utf8');
    built++;
    
    // Validation
    const openSections = (html.match(/<section/g) || []).length;
    const closeSections = (html.match(/<\/section>/g) || []).length;
    const hasMainJs = html.includes('main.js');
    const hasGnbJs = html.includes('gnb.js');
    const mainJsCount = (html.match(/main\.js/g) || []).length;
    const gnbJsCount = (html.match(/gnb\.js/g) || []).length;
    const hasBidiMission = html.includes('비디미션') || html.includes('Our Mission');
    
    console.log(`✅ ${data.file} — ${openSections} sections (open=${openSections}, close=${closeSections}) | main.js×${mainJsCount} gnb.js×${gnbJsCount} | mission: ${hasBidiMission ? '✅' : '❌'}`);
  } catch (err) {
    console.error(`❌ ${data.file} — ERROR: ${err.message}`);
  }
}

// Also copy to root level for build script
for (const data of pages) {
  try {
    const srcPath = path.join(PUBLIC_DIR, data.file);
    const destPath = path.join(__dirname, data.file);
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  } catch (err) {
    console.error(`⚠️ Copy to root failed for ${data.file}: ${err.message}`);
  }
}

console.log(`\n🎉 ${built}/${pages.length} hospital info pages rebuilt with CSS hash ${cssHash}`);
