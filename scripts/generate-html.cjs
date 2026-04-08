#!/usr/bin/env node
/**
 * HTML 생성 엔진 — 임플란트 세부 진료 페이지 v3.0
 * /tmp/implant-types.json 에서 데이터를 읽어 treatments/ 에 HTML 생성
 */
const fs = require('fs');
const path = require('path');
const outputDir = path.join(__dirname, '..', 'treatments');
const data = JSON.parse(fs.readFileSync('/tmp/implant-types.json', 'utf8'));
const { implantTypes, allCards } = data;

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function getHead(t) {
  const faqSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"FAQPage",
    "mainEntity": t.faqs.map(f => ({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))
  });
  const procSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"MedicalProcedure","name":t.title,
    "description":t.heroDesc,
    "procedureType":"https://schema.org/SurgicalProcedure",
    "body":{"@type":"AnatomicalStructure","name":"치아·잇몸뼈"},
    "howPerformed": t.process.map(p => p.step + ': ' + p.detail).join(' → '),
    "provider":{"@type":"Dentist","name":"서울비디치과","@id":"https://bdbddc.com/#dentist","telephone":"+82-41-415-2892","address":{"@type":"PostalAddress","addressLocality":"천안시","addressRegion":"충청남도","addressCountry":"KR"}}
  });
  const breadSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"BreadcrumbList",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},
      {"@type":"ListItem","position":2,"name":"임플란트","item":"https://bdbddc.com/treatments/implant"},
      {"@type":"ListItem","position":3,"name":t.title,"item":"https://bdbddc.com/treatments/"+t.slug}
    ]
  });
  const speakable = JSON.stringify({"@context":"https://schema.org","@type":"WebPage","speakable":{"@type":"SpeakableSpecification","cssSelector":["h1",".section-subtitle",".hero-desc"]}});

return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3NQP355YQM"></script>
<script src="https://cdn.amplitude.com/script/87529341cb075dcdbefabce3994958aa.js"></script>
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '971255062435276');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=971255062435276&ev=PageView&noscript=1"
/></noscript>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${esc(t.metaTitle)}</title>
  <meta name="description" content="${esc(t.metaDesc)}">
  <meta name="keywords" content="${esc(t.keywords)}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/${t.slug}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${esc(t.metaTitle)}">
  <meta property="og:description" content="${esc(t.metaDesc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/${t.slug}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-implant.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(t.metaTitle)}">
  <meta name="twitter:description" content="${esc(t.metaDesc)}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-implant.jpg">
  <link rel="icon" type="image/svg+xml" href="../images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="../manifest.json">
  <meta name="theme-color" content="#6B4226">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="../css/site-v5.css?v=b413d3a5">
  <script type="application/ld+json">${breadSchema}</script>
  <script type="application/ld+json">${faqSchema}</script>
  <script type="application/ld+json">${procSchema}</script>
  <script type="application/ld+json">${speakable}</script>
  <meta name="ai-summary" content="서울비디치과 ${t.title} — ${t.heroSub}. 서울대 출신 15인 전문의, 6개 수술실, 365일 진료.">
  <script src="/js/analytics.js?v=20260408v6" defer></script>`;
}

function getNav() {
return `<header class="site-header" id="siteHeader">
    <div class="header-container">
      <div class="header-brand">
        <a href="../" class="site-logo" aria-label="서울비디치과 홈"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a>
        <div class="clinic-status open" aria-live="polite"><span class="status-dot"></span><span class="status-text">진료중</span><span class="status-time">20:00까지</span></div>
      </div>
      <nav class="main-nav" id="mainNav" aria-label="메인 네비게이션">
        <ul>
          <li class="nav-item has-dropdown">
            <a href="/treatments/">진료</a>
            <div class="mega-dropdown"><div class="mega-dropdown-grid">
              <div class="mega-dropdown-section"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/glownate">✨ 글로우네이트 <span class="badge badge-hot">HOT</span></a></li><li><a href="/treatments/implant">임플란트 <span class="badge">6개 수술실</span></a></li><li><a href="/treatments/invisalign">인비절라인 <span class="badge">다이아몬드</span></a></li><li><a href="/treatments/orthodontics">치아교정 <span class="badge badge-hot">NEW</span></a></li><li><a href="/treatments/pediatric">소아치과 <span class="badge">전문의 3인</span></a></li><li><a href="/treatments/aesthetic">심미레진</a></li></ul></div>
              <div class="mega-dropdown-section"><strong class="section-heading">일반/보존 진료</strong><ul><li><a href="/treatments/cavity">충치치료</a></li><li><a href="/treatments/resin">레진치료</a></li><li><a href="/treatments/crown">크라운</a></li><li><a href="/treatments/inlay">인레이/온레이</a></li><li><a href="/treatments/root-canal">신경치료</a></li><li><a href="/treatments/whitening">미백</a></li></ul></div>
              <div class="mega-dropdown-section"><strong class="section-heading">잇몸/외과</strong><ul><li><a href="/treatments/scaling">스케일링</a></li><li><a href="/treatments/gum">잇몸치료</a></li><li><a href="/treatments/periodontitis">치주염</a></li><li><a href="/treatments/wisdom-tooth">사랑니 발치</a></li><li><a href="/treatments/tmj">턱관절장애</a></li><li><a href="/treatments/bruxism">이갈이/이악물기</a></li></ul></div>
            </div></div>
          </li>
          <li class="nav-item has-dropdown"><a href="/doctors/">의료진</a><ul class="simple-dropdown"><li><a href="/doctors/">전체 의료진</a></li><li><a href="/doctors/moon">문석준 대표원장</a></li></ul></li>
          <li class="nav-item"><a href="/reviews/">후기</a></li>
          <li class="nav-item"><a href="/faq">FAQ</a></li>
          <li class="nav-item"><a href="/directions">오시는 길</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="tel:041-415-2892" class="header-phone" aria-label="전화"><i class="fas fa-phone"></i></a>
        <a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약</a>
      </div>
    </div>
  </header>
  <div class="header-spacer"></div>`;
}

function getFooter() {
return `<footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand"><a href="../" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p></div>
        <div class="footer-links">
          <div class="footer-col"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/implant">임플란트센터</a></li><li><a href="/treatments/invisalign">인비절라인</a></li><li><a href="/treatments/orthodontics">치아교정</a></li><li><a href="/treatments/pediatric">소아치과</a></li><li><a href="/treatments/glownate">심미레진</a></li></ul></div>
          <div class="footer-col"><strong class="section-heading">병원 안내</strong><ul><li><a href="/doctors/">의료진</a></li><li><a href="/mission">비디미션</a></li><li><a href="/floor-guide">비디치과 둘러보기</a></li><li><a href="/cases/gallery">Before/After</a></li><li><a href="/column/">원장 컬럼</a></li></ul></div>
          <div class="footer-col"><strong class="section-heading">고객 지원</strong><ul><li><a href="/reservation">예약/상담</a></li><li><a href="../blog/">블로그/콘텐츠</a></li><li><a href="/faq">자주 묻는 질문</a></li><li><a href="/directions">오시는 길</a></li></ul></div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-info">
          <p><strong>서울비디치과의원</strong> | 대표원장: 문석준 | 사업자등록번호: 312-29-72180</p>
          <p>충남 천안시 동남구 만남로 38, 비디메디컬빌딩 2~6F | ☎ 041-415-2892</p>
          <p>평일 09:00-20:00 | 토·일·공휴일 09:00-17:00 | 365일 진료</p>
        </div>
        <p class="footer-copy">&copy; 2025 서울비디치과의원. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
}

function buildPage(t) {
  // Get 6 other implant cards (excluding current)
  const otherCards = allCards.filter(c => c.slug !== t.slug).slice(0, 6);
  
  const painPointsHTML = t.painPoints.map(p => `
          <div class="concern-item-row">
            <span class="problem-icon"><i class="fas fa-times-circle"></i></span>
            <span class="problem-text">"${esc(p.problem)}"</span>
            <span class="arrow"><i class="fas fa-arrow-right"></i></span>
            <span class="solution-text">${esc(p.solution)}</span>
          </div>`).join('');

  const featuresHTML = t.features.map(f => `
          <div class="why-card">
            <div class="why-card-icon"><i class="fas ${f.icon}"></i></div>
            <h3>${esc(f.title)}</h3>
            <p>${esc(f.desc)}</p>
          </div>`).join('');

  const diffHTML = t.diffPoints.map(d => `
          <div class="diff-card">
            <div class="diff-num">${d.num}</div>
            <h3>${esc(d.title)}</h3>
            <p>${esc(d.desc)}</p>
          </div>`).join('');

  const processHTML = t.process.map((p,i) => `
          <div class="process-step-v2">
            <div class="step-dot">${i+1}</div>
            <h3>${esc(p.step)}</h3>
            <p>${esc(p.detail)}</p>
          </div>`).join('');

  const compHeaders = t.comparison.headers.map((h,i) => 
    i === t.comparison.highlightCol ? `<th scope="col" class="col-highlight">${esc(h)}</th>` : `<th scope="col">${esc(h)}</th>`
  ).join('');
  const compRows = t.comparison.rows.map(row => 
    '<tr>' + row.map((c,i) => i === t.comparison.highlightCol ? `<td class="col-highlight">${esc(c)}</td>` : `<td>${esc(c)}</td>`).join('') + '</tr>'
  ).join('\n              ');

  const reviewsHTML = t.reviews.map(r => `
          <div class="review-card-v2">
            <div class="review-header">
              <div class="review-avatar">${r.name.charAt(0)}</div>
              <div><div class="review-name">${esc(r.name)}님</div><span class="review-source ${r.source}">${r.source === 'naver' ? '네이버' : '구글'}</span></div>
            </div>
            <div class="review-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            <p class="review-text">${r.text}</p>
            <div class="review-tags">${r.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
          </div>`).join('');

  const recommendHTML = t.recommend.map(r => `
            <span style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(107,66,38,0.06);border-radius:var(--radius-full);font-weight:600;color:var(--brand);font-size:0.95rem;"><i class="fas fa-check-circle" style="color:var(--brand-gold);"></i>${esc(r)}</span>`).join('');

  const faqsHTML = t.faqs.map((f,i) => `
          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-${i}">
              <span class="faq-q-badge">Q</span>
              <span class="faq-q-text">${esc(f.q)}</span>
              <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="faq-answer" id="faq-${i}" role="region"><p>${esc(f.a)}</p></div>
          </div>`).join('');

  const glossaryHTML = t.glossary.map(g => `
          <a href="/encyclopedia/${encodeURIComponent(g.term)}" class="enc-term-link" style="display:block;padding:10px 14px;background:#fff;border:1px solid #e8e0d8;border-radius:10px;text-decoration:none;color:#333;transition:all 0.2s;">
            <strong style="color:#6B4226;font-size:0.95rem;">${esc(g.term)}</strong>
            <span style="display:block;font-size:0.8rem;color:#888;margin-top:2px;">${esc(g.desc)}</span>
          </a>`).join('');

  const otherCardsHTML = otherCards.map(c => {
    let badgeStr = c.badge ? `\n            <div class="type-badge${c.badgeClass === 'featured' ? '' : ' ' + c.badgeClass}">${c.badge}</div>` : '';
    let cls = c.badgeClass === 'featured' ? ' featured' : '';
    return `
          <a href="/treatments/${c.slug}" class="type-card${cls}">${badgeStr}
            <span class="type-card-arrow"><i class="fas fa-arrow-right"></i></span>
            <div class="type-icon"><i class="fas ${c.icon}"></i></div>
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.desc)}</p>
          </a>`;
  }).join('');

  const statsHTML = t.heroStats.map(s => `
        <div class="stat-item"><span class="stat-value">${esc(s.value)}</span><span class="stat-label">${esc(s.label)}</span></div>`).join('');

return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
${getHead(t)}
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>

  ${getNav()}

  <main id="main-content">
    <!-- Breadcrumb -->
    <div style="padding:12px 0;background:var(--gray-50);">
      <div class="container">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:var(--text-tertiary);">
          <a href="/" style="color:var(--text-secondary);">홈</a>
          <span style="margin:0 6px;">›</span>
          <a href="/treatments/implant" style="color:var(--text-secondary);">임플란트</a>
          <span style="margin:0 6px;">›</span>
          <span style="color:var(--brand);font-weight:600;">${esc(t.title)}</span>
        </nav>
      </div>
    </div>

    <!-- Hero -->
    <section class="hero" style="min-height:auto;padding:var(--space-4xl) 0 var(--space-3xl);">
      <div class="hero-bg-pattern"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <p class="hero-brand-name">서울비디치과 임플란트센터</p>
            <h1 class="hero-headline" style="font-size:var(--fs-h1);">${esc(t.title)}</h1>
            <p class="hero-sub">${esc(t.heroSub)}</p>
            <p class="hero-desc" style="font-size:1rem;color:var(--text-secondary);line-height:1.7;max-width:600px;margin-bottom:var(--space-xl);">${esc(t.heroDesc)}</p>
            <div class="hero-stats">${statsHTML}
            </div>
            <div class="hero-cta-group" style="margin-top:var(--space-xl);">
              <a href="/reservation" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
              <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 정의 -->
    <section class="section" style="padding:var(--space-2xl) 0;">
      <div class="container">
        <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:1.2rem 1.5rem;border-radius:0 8px 8px 0;max-width:800px;margin:0 auto;">
          <h2 style="font-size:1.15rem;font-weight:700;color:#0369a1;margin:0 0 0.5rem 0;">${esc(t.definition.title)}</h2>
          <p style="margin:0;color:#334155;line-height:1.7;font-size:0.95rem;">${esc(t.definition.text)}</p>
        </div>
      </div>
    </section>

    <!-- 고민 공감 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>혹시 이런 <span class="text-gradient">고민</span> 하고 계시죠?</h2>
          <p class="section-subtitle">많은 분들이 같은 걱정을 하십니다</p>
        </div>
        <div style="max-width:700px;margin:0 auto;">${painPointsHTML}
        </div>
      </div>
    </section>

    <!-- 특징 6개 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2><span class="text-gradient">${esc(t.title)}</span>의 특징</h2>
          <p class="section-subtitle">서울비디치과가 자신 있게 제안하는 이유</p>
        </div>
        <div class="why-grid" style="grid-template-columns:repeat(3,1fr);">${featuresHTML}
        </div>
      </div>
    </section>

    <!-- 비디치과 차별점 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>${esc(t.title)}, <span class="text-gradient">어디서 하느냐</span>가 결과를 바꿉니다</h2>
          <p class="section-subtitle">서울비디치과만의 차별점</p>
        </div>
        <div class="diff-grid">${diffHTML}
        </div>
      </div>
    </section>

    <!-- 치료 과정 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>체계적인 <span class="text-gradient">${t.process.length}단계</span> 치료 과정</h2>
          <p class="section-subtitle">정밀 검진부터 보철물 완성까지</p>
        </div>
        <div class="process-timeline-v2">${processHTML}
        </div>
      </div>
    </section>

    <!-- 비교표 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2><span class="text-gradient">${esc(t.comparison.title)}</span></h2>
        </div>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead><tr>${compHeaders}</tr></thead>
            <tbody>
              ${compRows}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 비용 안내 -->
    <section class="section" style="background:var(--gray-50);padding:var(--space-2xl) 0;">
      <div class="container">
        <div style="max-width:700px;margin:0 auto;padding:28px;background:var(--white);border:1px solid var(--border-color);border-radius:var(--radius-xl);text-align:center;">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:12px;"><i class="fas fa-won-sign" style="color:var(--brand-gold);margin-right:8px;"></i>비용 안내</h3>
          <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:16px;">${esc(t.costInfo)}</p>
          <a href="/pricing" class="btn btn-outline" style="font-size:0.95rem;"><i class="fas fa-calculator"></i> 비용 안내 페이지 바로가기</a>
        </div>
      </div>
    </section>

    <!-- 환자 후기 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>실제 <span class="text-gradient">환자 후기</span></h2>
          <p class="section-subtitle">네이버·구글에서 검증된 실제 후기입니다</p>
        </div>
        <div class="review-grid-v2">${reviewsHTML}
        </div>
      </div>
    </section>

    <!-- 추천 대상 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>이런 분께 <span class="text-gradient">추천</span>합니다</h2>
        </div>
        <div style="max-width:700px;margin:0 auto;padding:32px;background:var(--white);border:1px solid var(--border-color);border-radius:var(--radius-xl);">
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">${recommendHTML}
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>자주 묻는 <span class="text-gradient">질문</span></h2>
          <p class="section-subtitle">${esc(t.title)}에 대해 궁금한 점을 확인하세요</p>
        </div>
        <div class="faq-list" style="max-width:800px;margin:0 auto;">${faqsHTML}
        </div>
      </div>
    </section>

    <!-- 관련 용어 -->
    <section class="section-sm" style="padding:40px 0;">
      <div class="container">
        <div style="background:#faf7f3;border-radius:16px;padding:28px 24px;">
          <h2 style="font-size:1.15rem;font-weight:700;color:#333;margin-bottom:16px;">
            <i class="fas fa-book-medical" style="color:#c9a96e;margin-right:8px;"></i>
            관련 치과 백과사전 용어 (${t.glossary.length}개)
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">${glossaryHTML}
          </div>
          <div style="text-align:center;margin-top:16px;">
            <a href="/encyclopedia/" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.85rem;">
              <i class="fas fa-book-medical"></i> 전체 500개 용어 보기
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 다른 임플란트 종류 -->
    <section class="section" style="background:var(--gray-50);">
      <div class="container">
        <div class="section-header">
          <h2>다른 <span class="text-gradient">임플란트 종류</span></h2>
          <p class="section-subtitle">환자 상태에 맞는 최적의 방법을 찾아보세요</p>
        </div>
        <div class="type-grid" style="grid-template-columns:repeat(3,1fr);">${otherCardsHTML}
        </div>
        <p class="type-grid-hint"><i class="fas fa-hand-pointer"></i> 각 카드를 눌러 자세한 내용을 확인하세요</p>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <span class="cta-badge">상담 안내</span>
          <h2>${esc(t.title)}, 경험이 결과를 만듭니다</h2>
          <p>궁금한 점이 있으시면 부담 없이 상담 예약해주세요.</p>
          <div class="cta-buttons">
            <a href="/reservation" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
            <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
          </div>
          <p class="cta-phone"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
        </div>
      </div>
    </section>

    <!-- 법적 고지 -->
    <section class="section-sm">
      <div class="container">
        <div class="legal-box">*본 정보는 의료법 및 의료광고 심의 기준을 준수하며, 개인에 따라 결과가 다를 수 있습니다. 반드시 전문의와 상담 후 결정하시기 바랍니다.</div>
      </div>
    </section>
  </main>

  ${getFooter()}
  <script src="../js/site-v5.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){
      document.querySelectorAll('.faq-question').forEach(function(btn){
        btn.addEventListener('click',function(){
          var item=this.parentElement;
          var expanded=this.getAttribute('aria-expanded')==='true';
          document.querySelectorAll('.faq-item.active').forEach(function(i){i.classList.remove('active');i.querySelector('.faq-question').setAttribute('aria-expanded','false');});
          if(!expanded){item.classList.add('active');this.setAttribute('aria-expanded','true');}
        });
      });
    });
  </script>
</body>
</html>`;
}

// Generate all 12 pages
let count = 0;
for (const t of implantTypes) {
  const html = buildPage(t);
  const filePath = path.join(outputDir, t.slug + '.html');
  fs.writeFileSync(filePath, html, 'utf8');
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`  ✅ ${t.slug}.html — ${t.faqs.length} FAQs, ${kb} KB`);
  count++;
}
console.log(`\n🎉 총 ${count}개 프리미엄 임플란트 상세 페이지 생성 완료!`);
