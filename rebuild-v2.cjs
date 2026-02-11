/**
 * 서울비디치과 진료 안내 하부 24개 페이지 완전 재구축 V2
 * 
 * 전략: 
 * - 메인 페이지(index.html)와 100% 동일한 CSS 클래스만 사용
 * - 각 페이지 콘텐츠를 JSON 데이터로 정의
 * - 구형 스타일 일절 사용하지 않음
 * - 사용하는 CSS 클래스 목록:
 *   section, container, section-header, section-badge, section-title, section-subtitle
 *   treatment-grid, card, card.featured, type-icon, type-badge, type-features, type-recommend, type-desc
 *   why-hero-card, why-grid, why-card, why-num
 *   process-timeline, process-step, step-num, step-content
 *   faq-list, faq-item, faq-question, faq-q-badge, faq-q-text, faq-answer, faq-icon
 *   reviews-grid, review-card, review-card-header, review-avatar, review-rating, review-text, review-tags
 *   cta-section, cta-box, cta-badge, cta-buttons, cta-phone
 *   patient-concerns, concerns-grid, concern-item
 *   implant-compare (table)
 *   text-gradient, reveal, delay-1..4, btn, btn-primary, btn-outline, btn-lg
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TREATMENTS_DIR = path.join(__dirname, 'public', 'treatments');
const CSS_PATH = path.join(__dirname, 'public', 'css', 'site-v5.css');
const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
const cssHash = crypto.createHash('md5').update(cssContent).digest('hex').substring(0, 8);

// Read index.html for shared parts
const indexHtml = fs.readFileSync(path.join(TREATMENTS_DIR, 'index.html'), 'utf8');

// Extract reusable parts from index.html
const headerMatch = indexHtml.match(/<header class="site-header"[\s\S]*?<\/header>\s*<div class="header-spacer"><\/div>/);
const HEADER = headerMatch ? headerMatch[0] : '';

const footerMatch = indexHtml.match(/<footer class="footer"[\s\S]*?<\/footer>/);
const FOOTER = footerMatch ? footerMatch[0] : '';

// Mobile nav + overlay + floating CTAs + mobile bottom CTA
const mobileNavMatch = indexHtml.match(/<nav class="mobile-nav"[\s\S]*?<div class="mobile-nav-overlay"[^>]*><\/div>/);
const MOBILE_NAV = mobileNavMatch ? mobileNavMatch[0] : '';

const floatingMatch = indexHtml.match(/<div class="floating-cta desktop-only">[\s\S]*?<\/div>/);
const FLOATING_CTA = floatingMatch ? floatingMatch[0] : '';

const mobileCTAMatch = indexHtml.match(/<div class="mobile-bottom-cta mobile-only"[\s\S]*?<\/div>/);
const MOBILE_BOTTOM_CTA = mobileCTAMatch ? mobileCTAMatch[0] : '';

// ═══════════════════════════════════════════════════
// SECTION GENERATORS - 메인 페이지와 100% 동일한 패턴
// ═══════════════════════════════════════════════════

function genHero(data) {
  return `
  <!-- ═══════ HERO ═══════ -->
  <section class="hero" aria-label="${data.name}">
    <div class="hero-bg-pattern" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-1" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-2" aria-hidden="true"></div>
    
    <div class="container hero-content">
      <div class="hero-text">
        <p class="hero-brand-name reveal">SEOUL BD DENTAL CLINIC</p>
        
        <h1 class="hero-headline reveal delay-1">
          ${data.heroH1}
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
          <a href="../reservation.html" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> ${data.ctaText || '상담 예약하기'}</a>
          <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
        </div>
      </div>
    </div>
    
    <div class="hero-scroll-hint" aria-hidden="true">
      <span>SCROLL</span>
      <div class="scroll-line"></div>
    </div>
  </section>`;
}

// 환자 고민 섹션 (concerns)
function genConcerns(badge, title, subtitle, concerns) {
  const items = concerns.map(c => `
            <div class="concern-item">
              <i class="fas fa-times-circle"></i>
              <span class="problem-text">"${c.problem}"</span>
              <i class="fas fa-arrow-right"></i>
              <span class="solution">${c.solution}</span>
            </div>`).join('');
  return `
    <section class="section" aria-label="${badge}">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-badge"><i class="fas fa-question-circle"></i> ${badge}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${subtitle}</p>
        </div>
        <div class="patient-concerns reveal">
          <div class="concerns-grid">${items}
          </div>
        </div>
      </div>
    </section>`;
}

// 카드 그리드 섹션 (treatment-grid + card)
function genCards(badge, title, subtitle, cards, icon) {
  const items = cards.map((c, i) => {
    const delay = `delay-${(i % 3) + 1}`;
    const featured = c.featured ? ' featured' : '';
    const badgeHtml = c.badge ? `<div class="type-badge">${c.badge}</div>` : '';
    const features = c.features ? c.features.map(f => 
      `<li><i class="fas fa-check" aria-hidden="true"></i> ${f}</li>`
    ).join('\n              ') : '';
    const featuresHtml = features ? `
            <ul class="type-features" role="list">
              ${features}
            </ul>` : '';
    const recommend = c.recommend ? `\n            <div class="type-recommend"><strong>추천:</strong> ${c.recommend}</div>` : '';
    return `
          <article class="card${featured} reveal ${delay}">
            ${badgeHtml}
            <div class="type-icon"><i class="fas fa-${c.icon || 'tooth'}"></i></div>
            <h3>${c.title}</h3>
            <p class="type-desc">${c.desc}</p>${featuresHtml}${recommend}
          </article>`;
  }).join('');
  return `
    <section class="section" aria-label="${badge}">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-badge"><i class="fas fa-${icon || 'th-large'}"></i> ${badge}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${subtitle}</p>
        </div>
        <div class="treatment-grid">${items}
        </div>
      </div>
    </section>`;
}

// Why BD 섹션 (why-hero-card + why-grid)
function genWhy(badge, title, subtitle, heroCard, items, icon) {
  const heroHtml = heroCard ? `
        <div class="why-hero-card reveal">
          <h3>${heroCard.title}</h3>
          <p>${heroCard.desc}</p>
          <span class="why-hero-badge"><i class="fas fa-award"></i> ${heroCard.badge}</span>
        </div>` : '';
  const grid = items.map((item, i) => {
    const delay = `delay-${(i % 3) + 1}`;
    return `
          <div class="why-card card reveal ${delay}">
            <div class="why-num">${String(i + 1).padStart(2, '0')}</div>
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
          </div>`;
  }).join('');
  return `
    <section class="section" aria-label="${badge}">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-badge"><i class="fas fa-${icon || 'heart'}"></i> ${badge}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${subtitle}</p>
        </div>
        ${heroHtml}
        <div class="why-grid">${grid}
        </div>
      </div>
    </section>`;
}

// 프로세스/치료과정 섹션
function genProcess(badge, title, subtitle, steps, icon) {
  const stepsHtml = steps.map((s, i) => {
    const delay = i > 0 ? ` delay-${Math.min(i, 4)}` : '';
    return `
          <div class="process-step reveal${delay}">
            <div class="step-num">${i + 1}</div>
            <div class="step-content">
              <h3>${s.title}</h3>
              <p>${s.desc}</p>
            </div>
          </div>`;
  }).join('');
  return `
    <section class="section" aria-label="${badge}">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-badge"><i class="fas fa-${icon || 'list-ol'}"></i> ${badge}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${subtitle}</p>
        </div>
        <div class="process-timeline">${stepsHtml}
        </div>
      </div>
    </section>`;
}

// FAQ 섹션
function genFAQ(faqs, treatmentName) {
  const items = faqs.map((faq, i) => `
          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-a${i + 1}">
              <span class="faq-q-badge">Q</span>
              <span class="faq-q-text">${faq.q}</span>
              <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="faq-answer" id="faq-a${i + 1}" role="region">
              <p>${faq.a}</p>
            </div>
          </div>`).join('');
  return `
    <section class="section" aria-label="자주 묻는 질문">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-badge"><i class="fas fa-comment-dots"></i> FAQ</span>
          <h2 class="section-title">자주 묻는 <span class="text-gradient">질문</span></h2>
          <p class="section-subtitle">${treatmentName}에 대해 궁금하신 점을 확인하세요</p>
        </div>
        <div class="faq-list">${items}
        </div>
      </div>
    </section>`;
}

// 후기 섹션
function genReviews(badge, title, subtitle, reviews) {
  const items = reviews.map(r => {
    const stars = '<i class="fas fa-star"></i>'.repeat(r.stars || 5);
    const tags = r.tags ? r.tags.map(t => `<span class="review-tag">${t}</span>`).join('') : '';
    return `
          <div class="review-card">
            <div class="review-card-header">
              <div class="review-avatar">${r.name.charAt(0)}</div>
              <div class="review-author-info">
                <div class="author-name">${r.name}</div>
                <span class="review-source ${r.source === '네이버' ? 'naver' : 'google'}"><i class="${r.source === '네이버' ? 'fas fa-check-circle' : 'fab fa-google'}"></i> ${r.source}</span>
              </div>
            </div>
            <div class="review-rating" aria-label="별점 5점 만점 중 ${r.stars || 5}점">${stars}</div>
            <p class="review-text">${r.text}</p>
            <div class="review-tags">${tags}</div>
          </div>`;
  }).join('');
  return `
    <section class="section" aria-label="${badge}">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-badge"><i class="fas fa-star"></i> ${badge}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${subtitle}</p>
        </div>
        <div class="reviews-grid reveal">${items}
        </div>
      </div>
    </section>`;
}

// 테이블 비교 섹션
function genCompare(badge, title, subtitle, headers, rows, note, icon) {
  const thHtml = headers.map((h, i) => `<th scope="col"${i === 0 ? '' : (h.highlight ? ' class="highlight"' : '')}>${h.text}</th>`).join('');
  const rowsHtml = rows.map(row => {
    const cells = row.map((cell, i) => {
      if (i === 0) return `<th scope="row">${cell}</th>`;
      const cls = headers[i] && headers[i].highlight ? ' class="highlight"' : '';
      return `<td${cls}>${cell}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('\n              ');
  return `
    <section class="section" aria-label="${badge}">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-badge"><i class="fas fa-${icon || 'balance-scale'}"></i> ${badge}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${subtitle}</p>
        </div>
        <div class="implant-compare reveal">
          <table>
            <thead><tr>${thHtml}</tr></thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
        ${note ? `<div class="compare-recommendation reveal"><p><i class="fas fa-info-circle"></i> ${note}</p></div>` : ''}
      </div>
    </section>`;
}

// 일반 정보 섹션 (단순 텍스트 + 리스트)
function genInfo(badge, title, subtitle, content, icon) {
  return `
    <section class="section" aria-label="${badge}">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-badge"><i class="fas fa-${icon || 'info-circle'}"></i> ${badge}</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${subtitle}</p>
        </div>
        <div class="why-hero-card reveal">
          ${content}
        </div>
      </div>
    </section>`;
}

// CTA 섹션
function genCTA(treatmentName) {
  return `
  <!-- ═══════ CTA ═══════ -->
  <section class="cta-section" aria-label="상담 안내">
    <div class="container">
      <div class="cta-box reveal">
        <span class="cta-badge"><i class="fas fa-headset"></i> 상담 안내</span>
        <h2>${treatmentName}, 더 궁금하신 점이 있으신가요?</h2>
        <p>정확한 진단을 통해 꼭 필요한 치료만 안내드립니다.</p>
        <div class="cta-buttons">
          <a href="../reservation.html" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
          <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
        </div>
        <p class="cta-phone"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
      </div>
    </div>
  </section>`;
}

// ═══════════════════════════════════════════════════
// PAGE ASSEMBLER
// ═══════════════════════════════════════════════════
function buildPage(data) {
  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},
      {"@type":"ListItem","position":2,"name":"진료 안내","item":"https://bdbddc.com/treatments/index.html"},
      {"@type":"ListItem","position":3,"name":data.name,"item":`https://bdbddc.com/treatments/${data.file}`}
    ]
  });

  const sections = data.sections.map(s => {
    switch (s.type) {
      case 'concerns': return genConcerns(s.badge, s.title, s.subtitle, s.items);
      case 'cards': return genCards(s.badge, s.title, s.subtitle, s.items, s.icon);
      case 'why': return genWhy(s.badge, s.title, s.subtitle, s.heroCard, s.items, s.icon);
      case 'process': return genProcess(s.badge, s.title, s.subtitle, s.items, s.icon);
      case 'faq': return genFAQ(s.items, data.name);
      case 'reviews': return genReviews(s.badge, s.title, s.subtitle, s.items);
      case 'compare': return genCompare(s.badge, s.title, s.subtitle, s.headers, s.rows, s.note, s.icon);
      case 'info': return genInfo(s.badge, s.title, s.subtitle, s.content, s.icon);
      default: return '';
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${data.name} | 서울비디치과</title>
  <meta name="description" content="${data.desc}">
  <meta name="keywords" content="천안 ${data.name}, 서울비디치과 ${data.name}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/${data.file}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${data.name} | 서울비디치과">
  <meta property="og:description" content="${data.desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/${data.file}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.name} | 서울비디치과">
  <meta name="twitter:description" content="${data.desc}">
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
  <link rel="stylesheet" href="../css/site-v5.css?v=${cssHash}">
  <link rel="prefetch" href="../reservation.html" as="document">
  <script type="application/ld+json">
  ${breadcrumb}
  </script>
</head>
<body>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  ${HEADER}

  <main id="main-content" role="main">
${genHero(data)}
${sections}
${genCTA(data.name)}
  </main>
  ${FOOTER}
  ${MOBILE_NAV}
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>
  ${FLOATING_CTA}
  ${MOBILE_BOTTOM_CTA}
  <script src="../js/main.js" defer></script>
  <script src="../js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});els.forEach(function(el){obs.observe(el);});});
    document.querySelectorAll('.faq-question').forEach(function(btn){btn.addEventListener('click',function(){this.parentElement.classList.toggle('open');});});
  </script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════
// 24개 페이지 데이터 정의
// ═══════════════════════════════════════════════════

const pages = [];

// Helper to push page
function addPage(data) { pages.push(data); }

// 파일은 별도 데이터 파일에서 로드
const pagesData = require('./treatment-pages-data.cjs');
pagesData.forEach(p => addPage(p));

// Build all pages
let built = 0;
pages.forEach(data => {
  const html = buildPage(data);
  const filePath = path.join(TREATMENTS_DIR, data.file);
  fs.writeFileSync(filePath, html, 'utf8');
  
  // Validate
  const openTags = (html.match(/<section[\s>]/g) || []).length;
  const closeTags = (html.match(/<\/section>/g) || []).length;
  const mainJs = (html.match(/main\.js/g) || []).length;
  const gnbJs = (html.match(/gnb\.js/g) || []).length;
  
  console.log(`✅ ${data.file}: ${openTags} sections (open=${openTags}, close=${closeTags}), main.js=${mainJs}, gnb.js=${gnbJs}`);
  built++;
});

console.log(`\n🎉 ${built}/${pages.length} pages rebuilt with CSS hash ${cssHash}`);
