/**
 * 서울비디치과 콘텐츠 하위 페이지 완전 재구축
 * 
 * 대상 페이지:
 *   column/columns.html — 칼럼
 *   video/index.html — 영상
 *   cases/gallery.html — 비포/애프터 (갤러리)
 *   cases/index.html — 치료 사례 (정적 케이스 카드)
 * 
 * 전략:
 * - 메인 페이지(public/index.html)와 100% 동일한 공통 파츠 (헤더/푸터/모바일네비/CTA)
 * - site-v5.css 클래스만 사용
 * - 각 페이지 고유 콘텐츠 보존 (칼럼 그리드, 유튜브 그리드, 갤러리, 케이스 카드)
 * - 나머지 페이지(메인/치료/의료진/병원안내 등) 절대 건드리지 않음
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

// Extract header
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
// 서브디렉토리 경로 변환 (column/, video/, cases/)
// ═══════════════════════════════════════════════════
function convertToSubdir(html) {
  let result = html;
  
  // 절대경로 /로 시작하는 것들 → ../ 로
  result = result.replace(/(href|src|action)="\/([^"]*?)"/g, '$1="../$2"');
  
  // 상대경로 중 루트레벨 파일들
  const rootPaths = ['mission.html', 'reservation.html', 'pricing.html', 'floor-guide.html', 
                     'directions.html', 'faq.html', 'privacy.html', 'terms.html',
                     'treatments/', 'doctors/', 'column/', 'video/', 'cases/', 'auth/',
                     'notice/', 'bdx/', 'area/', 'manifest.json', 'sitemap.xml',
                     'css/', 'js/', 'images/'];
  
  for (const p of rootPaths) {
    const re = new RegExp(`(href|src)="(?!\\.\\./)(?!https?://)(${p.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')})`, 'g');
    result = result.replace(re, '$1="../$2');
  }
  
  return result;
}

// ═══════════════════════════════════════════════════
// 공통 <head> 생성
// ═══════════════════════════════════════════════════
function genHead(data) {
  const prefix = '../';
  const canonicalBase = 'https://bdbddc.com/';
  
  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${data.title} | 서울비디치과</title>
  <meta name="description" content="${data.description}">
  <meta name="keywords" content="${data.keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonicalBase}${data.canonical}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${data.title} | 서울비디치과">
  <meta property="og:description" content="${data.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalBase}${data.canonical}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title} | 서울비디치과">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-image.jpg">
  <link rel="icon" type="image/svg+xml" href="${prefix}images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="${prefix}images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="${prefix}manifest.json">
  <meta name="theme-color" content="#6B4226">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="${prefix}css/site-v5.css?v=${cssHash}">
  <link rel="prefetch" href="${prefix}reservation.html" as="document">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"${data.breadcrumb}","item":"${canonicalBase}${data.canonical}"}]}
  </script>
${data.inlineStyle ? '  <style>\n' + data.inlineStyle + '\n  </style>' : ''}
</head>`;
}

// ═══════════════════════════════════════════════════
// 공통 Hero 생성
// ═══════════════════════════════════════════════════
function genHero(data) {
  const prefix = '../';
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
// 콘텐츠 탭 네비게이션 (3개 탭 공통)
// ═══════════════════════════════════════════════════
function genContentTabs(activeTab) {
  const tabs = [
    { id: 'column', href: '../column/columns.html', icon: 'fas fa-pen-fancy', label: '칼럼' },
    { id: 'video', href: '../video/index.html', icon: 'fab fa-youtube', label: '영상' },
    { id: 'cases', href: '../cases/gallery.html', icon: 'fas fa-images', label: '비포/애프터' }
  ];
  
  const tabsHtml = tabs.map(t => {
    const cls = t.id === activeTab ? 'tab-btn active' : 'tab-btn';
    return `    <a href="${t.href}" class="${cls}"><i class="${t.icon}"></i> ${t.label}</a>`;
  }).join('\n');
  
  return `
  <!-- 콘텐츠 탭 네비게이션 -->
  <nav class="content-tabs">
${tabsHtml}
  </nav>`;
}

// ═══════════════════════════════════════════════════
// 공통 CTA 섹션 생성
// ═══════════════════════════════════════════════════
function genCTA(data) {
  const prefix = '../';
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
// 공통 스크립트
// ═══════════════════════════════════════════════════
function genScripts() {
  const prefix = '../';
  return `
  <script src="${prefix}js/main.js" defer></script>
  <script src="${prefix}js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});els.forEach(function(el){obs.observe(el);});});
  </script>`;
}

// ═══════════════════════════════════════════════════
// 페이지 조립 (모든 콘텐츠 페이지는 서브디렉토리)
// ═══════════════════════════════════════════════════
function buildPage(data) {
  let header = convertToSubdir(ROOT_HEADER);
  let footer = convertToSubdir(ROOT_FOOTER);
  let mobileNav = convertToSubdir(ROOT_MOBILE_NAV);
  let floatingCta = convertToSubdir(ROOT_FLOATING_CTA);
  let mobileBottomCta = convertToSubdir(ROOT_MOBILE_BOTTOM_CTA);
  
  const head = genHead(data);
  const hero = genHero(data);
  const contentTabs = genContentTabs(data.activeTab);
  const cta = genCTA(data);
  const scripts = genScripts();
  
  let html = `${head}
<body>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  
  <!-- HEADER -->
  ${header}

  <!-- MAIN -->
  <main id="main-content" role="main">
${hero}
${contentTabs}
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


// ═══════════════════════════════════════════════════════════════
// 1. COLUMN PAGE — column/columns.html
// ═══════════════════════════════════════════════════════════════
const columnData = {
  file: 'column/columns.html',
  activeTab: 'column',
  title: '칼럼',
  description: '서울비디치과 치과 칼럼 — 치과 전문의가 전하는 유용한 구강 건강 정보.',
  keywords: '치과 칼럼, 구강 건강 정보, 서울비디치과 칼럼',
  canonical: 'column/columns.html',
  breadcrumb: '칼럼',
  heroHeadline: '서울비디치과 <span class="text-gradient">칼럼</span>',
  heroSub: '알기 쉬운 치과 건강 정보를 전달합니다',
  ctaTitle: '구강 건강이 궁금하신가요?',
  ctaSub: '서울비디치과 전문의에게 직접 상담받으세요.',
  inlineStyle: '',
  bodyContent: `
  <!-- 카테고리 필터 -->
  <div class="category-filter">
    <button class="category-btn active" data-category="all">전체</button>
    <button class="category-btn" data-category="laminate">라미네이트</button>
    <button class="category-btn" data-category="invisalign">인비절라인</button>
    <button class="category-btn" data-category="implant">임플란트</button>
    <button class="category-btn" data-category="general">일반치료</button>
    <button class="category-btn" data-category="tips">치아관리팁</button>
  </div>
  
  <!-- 콘텐츠 영역 -->
  <section class="content-section" aria-label="칼럼 목록">
    <div class="container">
      <!-- 인블로그 출처 -->
      <div class="source-badge reveal">
        <i class="fas fa-rss"></i>
        <span>인블로그(Inblog)에서 자동 연동됩니다</span>
      </div>
      
      <!-- 로딩 상태 -->
      <div id="loadingState" class="loading-state">
        <div class="loading-spinner"></div>
        <p>칼럼을 불러오는 중...</p>
      </div>
      
      <!-- 빈 상태 -->
      <div id="emptyState" class="empty-state" style="display: none;">
        <i class="fas fa-newspaper"></i>
        <h3>아직 등록된 칼럼이 없습니다</h3>
        <p>곧 유익한 치과 건강 정보로 찾아뵙겠습니다.</p>
      </div>
      
      <!-- 칼럼 그리드 -->
      <div id="columnsGrid" class="columns-grid" style="display: none;"></div>
    </div>
  </section>`,
  pageScript: ''
};


// ═══════════════════════════════════════════════════════════════
// 2. VIDEO PAGE — video/index.html
// ═══════════════════════════════════════════════════════════════
const videoData = {
  file: 'video/index.html',
  activeTab: 'video',
  title: '영상',
  description: '서울비디치과 영상 콘텐츠 — 치과 치료 과정, 시설 소개, 건강 정보 영상.',
  keywords: '서울비디치과 영상, 치과 영상, 유튜브',
  canonical: 'video/index.html',
  breadcrumb: '영상',
  heroHeadline: '서울비디치과 <span class="text-gradient">영상</span>',
  heroSub: '진료 과정, 환자 후기, 치과 건강 정보를 영상으로 만나보세요',
  ctaTitle: '영상으로 보는 치과 정보',
  ctaSub: '궁금한 점이 있으시면 직접 상담받으세요.',
  inlineStyle: '',
  bodyContent: `
  <!-- 콘텐츠 영역 -->
  <section class="content-section" aria-label="영상 목록">
    <div class="container">
      <!-- 유튜브 채널 링크 -->
      <a href="https://www.youtube.com/@seoulbddental" target="_blank" class="channel-link reveal">
        <i class="fab fa-youtube"></i>
        <span>서울비디치과 공식 유튜브 채널</span>
        <span class="btn-subscribe">구독하기</span>
      </a>
      
      <!-- 로딩 상태 -->
      <div id="loadingState" class="loading-state">
        <div class="loading-spinner"></div>
        <p>영상을 불러오는 중...</p>
      </div>
      
      <!-- 에러 상태 -->
      <div id="errorState" class="error-state" style="display: none;">
        <i class="fas fa-exclamation-circle"></i>
        <h3>영상을 불러올 수 없습니다</h3>
        <p>네트워크 연결을 확인하고 다시 시도해주세요.</p>
        <button class="retry-btn" onclick="loadVideos()">
          <i class="fas fa-redo"></i> 다시 시도
        </button>
      </div>
      
      <!-- 빈 상태 -->
      <div id="emptyState" class="empty-state" style="display: none;">
        <i class="fab fa-youtube"></i>
        <h3>아직 등록된 영상이 없습니다</h3>
        <p>곧 유익한 치과 정보 영상으로 찾아뵙겠습니다.</p>
      </div>
      
      <!-- 영상 그리드 -->
      <div id="videosGrid" class="videos-grid" style="display: none;"></div>
    </div>
  </section>`,
  pageScript: ''
};


// ═══════════════════════════════════════════════════════════════
// 3. CASES GALLERY — cases/gallery.html
// ═══════════════════════════════════════════════════════════════
const casesGalleryData = {
  file: 'cases/gallery.html',
  activeTab: 'cases',
  title: '비포/애프터',
  description: '서울비디치과 치료 사례 — 실제 환자의 치료 전후 사진을 확인하세요.',
  keywords: '치과 비포애프터, 서울비디치과 사례, 임플란트 사례, 교정 사례',
  canonical: 'cases/gallery.html',
  breadcrumb: '비포/애프터',
  heroHeadline: '서울비디치과 <span class="text-gradient">치료 사례</span>',
  heroSub: '실제 치료 전/후 변화를 확인하세요',
  ctaTitle: '나도 이렇게 달라질 수 있을까?',
  ctaSub: '무료 상담으로 나에게 맞는 치료를 확인해 보세요.',
  inlineStyle: `    .filter-container { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 0 20px; margin-bottom: 32px; }
    .gallery-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 800px; margin: 0 auto; text-align: center; padding: 40px 20px; }
    .stat-item .number { font-size: 2rem; font-weight: 800; color: var(--brand); }
    .stat-item .label { font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px; }
    .notice-box { max-width: 800px; margin: 0 auto; background: var(--gray-50); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px 32px; }
    .notice-box h3 { font-size: 1rem; font-weight: 700; margin-bottom: 12px; }
    .notice-box h3 i { color: var(--brand-gold); margin-right: 8px; }
    .notice-box p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7; }
    .image-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center; }
    .image-modal.active { display: flex; }
    .image-modal-content { background: var(--white); border-radius: var(--radius-lg); max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; }
    .image-modal-close { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border: none; background: var(--gray-100); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 1; }
    .image-modal-info { padding: 24px; }
    .image-modal-info h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .image-modal-meta { display: flex; gap: 16px; margin-top: 12px; font-size: 0.88rem; color: var(--text-secondary); }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }`,
  bodyContent: `
  <!-- 필터 섹션 -->
  <section class="filter-section" id="filterSection">
    <div class="filter-container">
      <button class="filter-btn active" data-filter="all">전체 <span class="count" id="countAll">0</span></button>
      <button class="filter-btn" data-filter="implant">임플란트 <span class="count" id="countImplant">0</span></button>
      <button class="filter-btn" data-filter="orthodontic">교정 <span class="count" id="countOrthodontic">0</span></button>
      <button class="filter-btn" data-filter="aesthetic">심미치료 <span class="count" id="countAesthetic">0</span></button>
      <button class="filter-btn" data-filter="whitening">미백 <span class="count" id="countWhitening">0</span></button>
      <button class="filter-btn" data-filter="gum">잇몸치료 <span class="count" id="countGum">0</span></button>
    </div>
  </section>
  
  <!-- 갤러리 섹션 -->
  <section class="gallery-section" id="gallerySection">
    <div class="gallery-container">
      <div id="loadingState" class="loading-state">
        <div class="loading-spinner"></div>
        <p>케이스를 불러오는 중...</p>
      </div>
      <div id="galleryGrid" class="gallery-grid" style="display: none;"></div>
      <div id="emptyState" class="empty-state" style="display: none;">
        <i class="fas fa-images"></i>
        <h3>등록된 케이스가 없습니다</h3>
        <p>곧 새로운 치료 사례가 업데이트됩니다.</p>
      </div>
    </div>
  </section>
  
  <!-- 통계 섹션 -->
  <section class="content-section" id="statsSection" aria-label="치료 통계">
    <div class="container">
      <div class="stats-grid reveal">
        <div class="stat-item">
          <div class="number" id="statTotal">0</div>
          <div class="label">총 케이스</div>
        </div>
        <div class="stat-item">
          <div class="number" id="statImplant">0</div>
          <div class="label">임플란트</div>
        </div>
        <div class="stat-item">
          <div class="number" id="statOrthodontic">0</div>
          <div class="label">교정</div>
        </div>
        <div class="stat-item">
          <div class="number" id="statAesthetic">0</div>
          <div class="label">심미치료</div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- 주의사항 -->
  <section class="content-section" id="noticeSection" aria-label="안내사항">
    <div class="container">
      <div class="notice-box reveal">
        <h3><i class="fas fa-info-circle"></i> 안내사항</h3>
        <p>
          본 갤러리의 모든 이미지는 환자분의 동의를 받아 게시되었습니다.
          무단 복제, 배포, 상업적 사용은 엄격히 금지됩니다.
          치료 결과는 개인에 따라 다를 수 있으며, 정확한 진단은 내원 상담을 통해 받으시기 바랍니다.
        </p>
      </div>
    </div>
  </section>

  <!-- 이미지 상세보기 모달 -->
  <div class="image-modal" id="imageModal">
    <div class="image-modal-content">
      <button class="image-modal-close" onclick="closeImageModal()">
        <i class="fas fa-times"></i>
      </button>
      <div class="image-modal-grid" id="modalImageGrid"></div>
      <div class="image-modal-info">
        <h3 id="modalTitle"></h3>
        <p id="modalDescription"></p>
        <div class="image-modal-meta">
          <span><i class="fas fa-clock"></i> <span id="modalPeriod"></span></span>
          <span><i class="fas fa-user-md"></i> <span id="modalDoctor"></span></span>
        </div>
      </div>
    </div>
  </div>`,
  pageScript: `
  <script>
    function closeImageModal() {
      var m = document.getElementById('imageModal');
      if (m) m.classList.remove('active');
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeImageModal();
    });
  </script>`
};


// ═══════════════════════════════════════════════════════════════
// 4. CASES INDEX — cases/index.html (정적 치료 사례 카드)
// ═══════════════════════════════════════════════════════════════
const casesIndexData = {
  file: 'cases/index.html',
  activeTab: 'cases',
  title: '치료 사례',
  description: '서울비디치과 치료 사례 갤러리 — 실제 환자의 치료 전후 사진을 확인하세요.',
  keywords: '치료사례, 서울비디치과, Before After, 임플란트 사례, 교정 사례',
  canonical: 'cases/index.html',
  breadcrumb: '치료 사례',
  heroHeadline: '<span class="text-gradient">치료 사례</span>',
  heroSub: '서울비디치과의 다양한 치료 사례를 확인하세요',
  ctaTitle: '나도 변할 수 있을까?',
  ctaSub: '무료 상담으로 개인 맞춤 치료 계획을 확인해 보세요.',
  inlineStyle: `    .case-filter { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px; }
    .legal-banner { background: var(--gray-50); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px 24px; margin-bottom: 32px; text-align: center; }
    .legal-banner p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; }
    .legal-banner i { color: var(--brand-gold); margin-right: 6px; }
    .case-images { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; overflow: hidden; }
    .case-image { aspect-ratio: 4/3; background: var(--gray-100); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    .case-image.before { background: linear-gradient(135deg, #f5f5f5, #e8e8e8); }
    .case-image.after { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
    .case-image i { font-size: 2rem; color: var(--gray-400); }
    .case-image.after i { color: var(--green); }
    .case-image-label { position: absolute; top: 8px; left: 8px; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 100px; }
    .case-image.before .case-image-label { background: var(--gray-200); color: var(--gray-600); }
    .case-image.after .case-image-label { background: #dcfce7; color: #166534; }
    .case-content { padding: 20px; }
    .case-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .case-category { font-size: 0.8rem; font-weight: 600; color: var(--brand); background: var(--brand-gold-light); padding: 2px 10px; border-radius: 100px; }
    .case-doctor { font-size: 0.8rem; color: var(--text-secondary); }
    .case-title { font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
    .case-info { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; }
    .case-legal { font-size: 0.75rem; color: var(--gray-400); }`,
  bodyContent: `
  <!-- 케이스 섹션 -->
  <section class="content-section" aria-label="치료 사례">
    <div class="container">
      <!-- 법적 안내 배너 -->
      <div class="legal-banner reveal">
        <p>
          <i class="fas fa-info-circle"></i>
          본 페이지의 모든 치료 사례는 의료법 및 의료광고 심의 기준을 준수하여 제공됩니다.<br>
          개인별 결과는 환자의 구강 상태, 치료 방법에 따라 다를 수 있습니다.
        </p>
      </div>

      <!-- 필터 -->
      <div class="case-filter reveal">
        <button class="filter-btn active" data-filter="all">전체</button>
        <button class="filter-btn" data-filter="laminate">글로우네이트</button>
        <button class="filter-btn" data-filter="invisalign">인비절라인</button>
        <button class="filter-btn" data-filter="implant">임플란트</button>
        <button class="filter-btn" data-filter="whitening">미백</button>
        <button class="filter-btn" data-filter="general">일반진료</button>
      </div>

      <!-- Cases Grid -->
      <div class="cases-grid reveal">
        <!-- Case 1 -->
        <div class="case-card" data-category="laminate">
          <div class="case-images">
            <div class="case-image before">
              <span class="case-image-label">Before</span>
              <i class="fas fa-tooth"></i>
            </div>
            <div class="case-image after">
              <span class="case-image-label">After</span>
              <i class="fas fa-sparkles"></i>
            </div>
          </div>
          <div class="case-content">
            <div class="case-meta">
              <span class="case-category">글로우네이트</span>
              <span class="case-doctor">문석준 원장</span>
            </div>
            <h3 class="case-title">전치부 8본 라미네이트</h3>
            <p class="case-info">30대 여성 | 치료기간 3주</p>
            <p class="case-legal">*개인별 결과 차이가 있으며, 이는 특정 환자의 사례입니다.</p>
          </div>
        </div>

        <!-- Case 2 -->
        <div class="case-card" data-category="invisalign">
          <div class="case-images">
            <div class="case-image before">
              <span class="case-image-label">Before</span>
              <i class="fas fa-teeth"></i>
            </div>
            <div class="case-image after">
              <span class="case-image-label">After</span>
              <i class="fas fa-smile"></i>
            </div>
          </div>
          <div class="case-content">
            <div class="case-meta">
              <span class="case-category">인비절라인</span>
              <span class="case-doctor">협진</span>
            </div>
            <h3 class="case-title">덧니 교정</h3>
            <p class="case-info">20대 여성 | 치료기간 12개월</p>
            <p class="case-legal">*개인별 결과 차이가 있으며, 이는 특정 환자의 사례입니다.</p>
          </div>
        </div>

        <!-- Case 3 -->
        <div class="case-card" data-category="implant">
          <div class="case-images">
            <div class="case-image before">
              <span class="case-image-label">Before</span>
              <i class="fas fa-tooth"></i>
            </div>
            <div class="case-image after">
              <span class="case-image-label">After</span>
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
          <div class="case-content">
            <div class="case-meta">
              <span class="case-category">임플란트</span>
              <span class="case-doctor">협진</span>
            </div>
            <h3 class="case-title">상악동 거상술 + 임플란트 2본</h3>
            <p class="case-info">50대 남성 | 치료기간 6개월</p>
            <p class="case-legal">*개인별 결과 차이가 있으며, 이는 특정 환자의 사례입니다.</p>
          </div>
        </div>

        <!-- Case 4 -->
        <div class="case-card" data-category="laminate">
          <div class="case-images">
            <div class="case-image before">
              <span class="case-image-label">Before</span>
              <i class="fas fa-tooth"></i>
            </div>
            <div class="case-image after">
              <span class="case-image-label">After</span>
              <i class="fas fa-sparkles"></i>
            </div>
          </div>
          <div class="case-content">
            <div class="case-meta">
              <span class="case-category">글로우네이트</span>
              <span class="case-doctor">문석준 원장</span>
            </div>
            <h3 class="case-title">치아 사이 공간 개선</h3>
            <p class="case-info">20대 남성 | 치료기간 2주</p>
            <p class="case-legal">*개인별 결과 차이가 있으며, 이는 특정 환자의 사례입니다.</p>
          </div>
        </div>

        <!-- Case 5 -->
        <div class="case-card" data-category="whitening">
          <div class="case-images">
            <div class="case-image before">
              <span class="case-image-label">Before</span>
              <i class="fas fa-tooth"></i>
            </div>
            <div class="case-image after">
              <span class="case-image-label">After</span>
              <i class="fas fa-sun"></i>
            </div>
          </div>
          <div class="case-content">
            <div class="case-meta">
              <span class="case-category">미백</span>
              <span class="case-doctor">협진</span>
            </div>
            <h3 class="case-title">전문가 미백</h3>
            <p class="case-info">30대 여성 | 치료기간 2주</p>
            <p class="case-legal">*개인별 결과 차이가 있으며, 이는 특정 환자의 사례입니다.</p>
          </div>
        </div>

        <!-- Case 6 -->
        <div class="case-card" data-category="invisalign">
          <div class="case-images">
            <div class="case-image before">
              <span class="case-image-label">Before</span>
              <i class="fas fa-teeth"></i>
            </div>
            <div class="case-image after">
              <span class="case-image-label">After</span>
              <i class="fas fa-smile"></i>
            </div>
          </div>
          <div class="case-content">
            <div class="case-meta">
              <span class="case-category">인비절라인</span>
              <span class="case-doctor">협진</span>
            </div>
            <h3 class="case-title">전치부 배열 교정</h3>
            <p class="case-info">30대 남성 | 치료기간 8개월</p>
            <p class="case-legal">*개인별 결과 차이가 있으며, 이는 특정 환자의 사례입니다.</p>
          </div>
        </div>
      </div>
    </div>
  </section>`,
  pageScript: `
  <script>
    // 케이스 필터링
    document.querySelectorAll('.case-filter .filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.case-filter .filter-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        var filter = this.dataset.filter;
        document.querySelectorAll('.case-card').forEach(function(card) {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  </script>`
};


// ═══════════════════════════════════════════════════
// BUILD ALL PAGES
// ═══════════════════════════════════════════════════
const allPages = [columnData, videoData, casesGalleryData, casesIndexData];

for (const data of allPages) {
  const html = buildPage(data);
  const filePath = path.join(PUBLIC_DIR, data.file);
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, html, 'utf8');
  
  // Validate: count section open/close
  const sectionOpen = (html.match(/<section[\s>]/g) || []).length;
  const sectionClose = (html.match(/<\/section>/g) || []).length;
  const mainJsCount = (html.match(/main\.js/g) || []).length;
  const gnbJsCount = (html.match(/gnb\.js/g) || []).length;
  
  console.log(`  ✅ ${data.file} — ${sectionOpen} sections open/${sectionClose} close; main.js ×${mainJsCount}, gnb.js ×${gnbJsCount}`);
}

// Also copy to root-level mirrors for dist serving
for (const data of allPages) {
  const srcPath = path.join(PUBLIC_DIR, data.file);
  const destPath = path.join(__dirname, data.file);
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(srcPath, destPath);
}

console.log('\n🎉 콘텐츠 하위 4개 페이지 재구축 완료!');
console.log(`   CSS Hash: ${cssHash}`);
