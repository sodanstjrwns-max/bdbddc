#!/usr/bin/env node
/**
 * 후회 백서 — 진료별 세부 페이지 빌더 (SEO/AEO 머신)
 *
 * 사용: node scripts/build-regret-pages.cjs
 * 입력: data/regret-content/*.json
 * 출력: guide/regret/<slug>.html
 *
 * 타깃 검색어: "<진료명> 후회", "<진료명> 부작용"
 * — 구매 직전 가장 뜨거운 검색 의도를 전용 페이지로 흡수
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'data/regret-content');
const OUT_DIR = path.join(ROOT, 'guide/regret');
const TODAY = new Date().toISOString().slice(0, 10);

const COMMON_HEAD = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3NQP355YQM"></script>
<script src="/static/bd-tag-loader.js" defer></script>
<script src="/static/bd-analytics.js" defer></script>
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','971255062435276');fbq('track','PageView');
</script>`;

const STYLES = `<style>
    .guide-hero{background:linear-gradient(135deg,#1a1917 0%,#2d2926 100%);color:#fff;padding:80px 0 60px;position:relative;overflow:hidden}
    .guide-hero::before{content:'';position:absolute;top:0;right:0;width:50%;height:100%;background:radial-gradient(circle at 70% 50%,rgba(200,169,126,0.08) 0%,transparent 60%)}
    .guide-hero .container{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:0 24px}
    .guide-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(200,169,126,0.15);color:#C8A97E;padding:6px 14px;border-radius:50px;font-size:0.82rem;font-weight:600;margin-bottom:20px}
    .guide-hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:900;line-height:1.25;margin-bottom:16px;letter-spacing:-0.5px}
    .guide-hero h1 .keyword{color:#C8A97E}
    .guide-hero .lead{font-size:1.1rem;color:rgba(255,255,255,0.7);line-height:1.8;max-width:700px}
    .guide-meta{display:flex;flex-wrap:wrap;gap:16px;margin-top:24px;font-size:0.85rem;color:rgba(255,255,255,0.5)}
    .guide-meta span{display:flex;align-items:center;gap:5px}
    .guide-body{max-width:900px;margin:0 auto;padding:0 24px}
    .quick-answer{background:#fef9f0;border:2px solid #C8A97E;border-radius:16px;padding:28px 32px;margin:48px 0 0}
    .quick-answer h2{font-size:1.15rem;font-weight:800;color:#8B6F3F;margin:0 0 10px;display:flex;align-items:center;gap:8px}
    .quick-answer p{margin:0;font-size:1.02rem;line-height:1.9;color:#3a3631}
    .toc-box{background:#f8f6f3;border:1px solid #e8e0d6;border-radius:16px;padding:32px;margin:32px 0 48px}
    .toc-box h2{font-size:1.3rem;font-weight:800;color:#1a1917;margin-bottom:20px;display:flex;align-items:center;gap:8px}
    .toc-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px 24px}
    .toc-list li{padding:8px 0;border-bottom:1px dotted #d4ccc1}
    .toc-list a{color:#3a3631;text-decoration:none;display:flex;gap:10px;align-items:baseline;font-size:0.95rem;line-height:1.5;transition:color 0.2s}
    .toc-list a:hover{color:#C8A97E}
    .toc-num{color:#C8A97E;font-weight:800;min-width:28px;font-size:0.85rem}
    .guide-section{padding:56px 0;border-bottom:1px solid #f0ece8}
    .guide-section:last-child{border-bottom:none}
    .guide-section h2{font-size:clamp(1.5rem,3.5vw,2rem);font-weight:800;color:#1a1917;margin-bottom:12px;line-height:1.3}
    .guide-section h2 .num{color:#C8A97E;margin-right:12px;font-weight:900}
    .guide-section h3{font-size:1.25rem;font-weight:700;color:#1a1917;margin:32px 0 12px}
    .guide-section p{font-size:1rem;line-height:1.9;color:#3a3631;margin-bottom:16px}
    .guide-section ul, .guide-section ol{margin:0 0 16px 24px;line-height:1.9;color:#3a3631}
    .guide-section li{margin-bottom:6px}
    .guide-section strong{color:#1a1917;font-weight:700}
    .regret-grid{display:grid;grid-template-columns:1fr;gap:0;border:1px solid #e8e0d6;border-radius:14px;overflow:hidden;margin:20px 0}
    .regret-row{display:grid;grid-template-columns:1fr;border-bottom:1px solid #e8e0d6}
    .regret-row:last-child{border-bottom:none}
    .regret-cell{padding:16px 20px}
    .regret-cell.r-what{background:#fdf4f2;font-weight:700;color:#9a3b2e}
    .regret-cell.r-why{background:#fff;color:#3a3631;font-size:0.95rem;line-height:1.8}
    .regret-cell.r-fix{background:#f2f8f4;color:#1f5c3d;font-size:0.95rem;line-height:1.8}
    .regret-cell .cell-label{display:inline-block;font-size:0.72rem;font-weight:800;letter-spacing:0.5px;padding:2px 8px;border-radius:20px;margin-bottom:6px}
    .r-what .cell-label{background:#9a3b2e;color:#fff}
    .r-why .cell-label{background:#8a8378;color:#fff}
    .r-fix .cell-label{background:#1f5c3d;color:#fff}
    @media(min-width:720px){.regret-row{grid-template-columns:1.1fr 1.4fr 1.4fr}}
    .info-table{width:100%;border-collapse:collapse;margin:20px 0;font-size:0.95rem}
    .info-table th, .info-table td{padding:12px 16px;text-align:left;border-bottom:1px solid #e8e0d6;vertical-align:top;line-height:1.7}
    .info-table th{background:#f8f6f3;font-weight:700;color:#1a1917;white-space:nowrap}
    .notfor-box{background:#fdf4f2;border:1px solid #efd5cf;border-radius:14px;padding:24px 28px;margin:20px 0}
    .notfor-box ul{margin:0 0 0 20px}
    .notfor-box li{margin-bottom:10px;line-height:1.8;color:#3a3631}
    .check-list{list-style:none;margin:20px 0 !important;padding:0}
    .check-list li{position:relative;padding:14px 18px 14px 48px;background:#f8f6f3;border-radius:12px;margin-bottom:10px;line-height:1.7;color:#3a3631}
    .check-list li::before{content:'✓';position:absolute;left:18px;top:13px;color:#1f5c3d;font-weight:900;font-size:1.05rem}
    .cta-card{background:linear-gradient(135deg,#C8A97E 0%,#8B6F3F 100%);color:#fff;padding:32px;border-radius:16px;margin:32px 0;text-align:center}
    .cta-card h3{color:#fff;margin-bottom:8px;font-size:1.3rem}
    .cta-card p{color:rgba(255,255,255,0.85);margin-bottom:20px}
    .cta-card .btn-group{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .cta-card a.btn-primary{display:inline-flex;align-items:center;gap:6px;background:#fff;color:#8B6F3F;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem}
    .cta-card a.btn-secondary{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.15);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem;border:1px solid rgba(255,255,255,0.4)}
    .related-guides{background:#f8f6f3;padding:40px 24px;border-radius:16px;margin:48px 0}
    .related-guides h3{margin-top:0;color:#1a1917;margin-bottom:16px;font-size:1.2rem}
    .related-guides .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
    .related-guides a.card{display:block;background:#fff;padding:16px 18px;border-radius:12px;border:1px solid #e8e0d6;text-decoration:none;color:#1a1917;transition:all 0.2s}
    .related-guides a.card:hover{border-color:#C8A97E;transform:translateY(-2px);box-shadow:0 4px 12px rgba(200,169,126,0.15)}
    .related-guides .card strong{display:block;font-size:0.95rem;margin-bottom:4px;color:#1a1917}
    .related-guides .card span{font-size:0.85rem;color:#6b645c}
    .sibling-strip{margin:48px 0}
    .sibling-strip h3{font-size:1.2rem;font-weight:800;color:#1a1917;margin-bottom:14px}
    .sibling-strip .chips{display:flex;flex-wrap:wrap;gap:8px}
    .sibling-strip a.chip{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #e8e0d6;border-radius:50px;padding:8px 16px;font-size:0.88rem;color:#3a3631;text-decoration:none;transition:all 0.2s}
    .sibling-strip a.chip:hover{border-color:#C8A97E;color:#8B6F3F}
    .faq-item{border:1px solid #e8e0d6;border-radius:12px;margin-bottom:10px;overflow:hidden;background:#fff}
    .faq-item summary{padding:18px 22px;cursor:pointer;font-weight:600;color:#1a1917;list-style:none;position:relative;padding-right:48px}
    .faq-item summary::-webkit-details-marker{display:none}
    .faq-item summary::after{content:'+';position:absolute;right:22px;top:50%;transform:translateY(-50%);font-size:1.3rem;color:#C8A97E;font-weight:300}
    .faq-item[open] summary::after{content:'−'}
    .faq-item summary span.q-mark{color:#C8A97E;margin-right:10px;font-weight:800}
    .faq-item .answer{padding:0 22px 22px;color:#3a3631;line-height:1.9}
    .disclaimer-note{font-size:0.85rem;color:#8a8378;background:#f8f6f3;border-radius:10px;padding:16px 20px;margin:24px 0;line-height:1.7}
</style>`;

const FOOTER = `<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand"><a href="/" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p></div>
      <div class="footer-links">
        <div class="footer-col"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/implant">임플란트센터</a></li><li><a href="/treatments/invisalign">인비절라인</a></li><li><a href="/treatments/orthodontics">치아교정</a></li><li><a href="/treatments/pediatric">소아치과</a></li><li><a href="/treatments/glownate">글로우네이트</a></li></ul></div>
        <div class="footer-col"><strong class="section-heading">가이드</strong><ul><li><a href="/guide/regret">후회 백서</a></li><li><a href="/guide/implant">임플란트 가이드</a></li><li><a href="/guide/invisalign">인비절라인 가이드</a></li><li><a href="/guide/laminate">라미네이트 가이드</a></li><li><a href="/guide/insurance">치과 실비보험 가이드</a></li><li><a href="/guide/whitening">미백 가이드</a></li><li><a href="/guide/wisdom-tooth">사랑니 가이드</a></li><li><a href="/guide/denture">틀니 가이드</a></li><li><a href="/guide/root-canal">신경치료 가이드</a></li></ul></div>
        <div class="footer-col"><strong class="section-heading">병원 안내</strong><ul><li><a href="/doctors/">의료진</a></li><li><a href="/floor-guide">비디치과 둘러보기</a></li><li><a href="/cases/gallery">Before/After</a></li><li><a href="/faq">자주 묻는 질문</a></li><li><a href="/directions">오시는 길</a></li></ul></div>
      </div>
    </div>
    <div class="footer-info">
      <div class="footer-contact"><p><i class="fas fa-map-marker-alt"></i> 충남 천안시 서북구 불당34길 14, 1~5층</p><p><i class="fas fa-phone"></i> 041-415-2892</p><div class="footer-hours"><p><i class="fas fa-clock"></i> <strong>365일 진료</strong></p><p>평일 09:00-20:00 (점심 12:30-14:00)</p><p>토·일·공휴일 09:00-13:00</p></div></div>
    </div>
    <div class="footer-bottom"><p>&copy; 2026 서울비디치과의원 불당본점. All rights reserved.</p><p><a href="/privacy">개인정보처리방침</a> | <a href="/terms">이용약관</a></p></div>
  </div>
</footer>`;

const esc = (s) => String(s).replace(/"/g, '\\"');

function buildPage(d, all) {
  const url = `https://bdbddc.com/guide/regret/${d.slug}`;

  const faqLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: d.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } }))
  });
  const articleLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    '@id': `${url}#article`,
    headline: d.title, description: d.description,
    author: { '@type': 'Organization', name: '서울비디치과 의료진' },
    publisher: { '@type': 'Organization', name: '서울비디치과', logo: { '@type': 'ImageObject', url: 'https://bdbddc.com/images/logo.png' } },
    datePublished: '2026-06-12', dateModified: TODAY,
    mainEntityOfPage: url, image: 'https://bdbddc.com/images/og-image-v2.jpg',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#quick-answer'] }
  });
  const breadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://bdbddc.com/' },
      { '@type': 'ListItem', position: 2, name: '가이드', item: 'https://bdbddc.com/guide/' },
      { '@type': 'ListItem', position: 3, name: '후회 백서', item: 'https://bdbddc.com/guide/regret' },
      { '@type': 'ListItem', position: 4, name: `${d.name} 후회·부작용`, item: url }
    ]
  });

  const regretRows = d.regrets.map((r, i) => `    <div class="regret-row">
      <div class="regret-cell r-what"><span class="cell-label">후회 ${i + 1}</span>${r.what}</div>
      <div class="regret-cell r-why"><span class="cell-label">왜 생기나</span>${r.why}</div>
      <div class="regret-cell r-fix"><span class="cell-label">예방책</span>${r.fix}</div>
    </div>`).join('\n');

  const seRows = d.sideEffects.map(s => `      <tr><td><strong>${s.name}</strong></td><td>${s.freq}</td><td>${s.action}</td></tr>`).join('\n');

  const notForItems = d.notFor.map(n => `    <li>${n}</li>`).join('\n');
  const checkItems = d.checklist.map(c => `    <li>${c}</li>`).join('\n');
  const faqItems = d.faq.map(f => `  <details class="faq-item">
    <summary><span class="q-mark">Q.</span>${f.q}</summary>
    <div class="answer">${f.a}</div>
  </details>`).join('\n');

  const siblings = all.filter(x => x.slug !== d.slug)
    .map(x => `      <a class="chip" href="/guide/regret/${x.slug}">${x.chipIcon || ''} ${x.name} 후회·부작용</a>`).join('\n');

  const related = d.related.map(r => `    <a href="${r.href}" class="card"><strong>${r.title}</strong><span>${r.desc}</span></a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
${COMMON_HEAD}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${d.title}</title>
  <meta name="description" content="${esc(d.description)}">
  <meta name="keywords" content="${d.keywords}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="author" content="서울비디치과 의료진">
  <meta property="og:title" content="${esc(d.title)}">
  <meta property="og:description" content="${esc(d.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
  <meta property="article:published_time" content="2026-06-12T00:00:00+09:00">
  <meta property="article:modified_time" content="${TODAY}T00:00:00+09:00">
  <meta property="article:author" content="서울비디치과 의료진">
  <meta property="article:section" content="후회 백서">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(d.title)}">
  <meta name="twitter:description" content="${esc(d.description)}">
  <link rel="stylesheet" href="/css/site-v5.css?v=24d559d1">
${STYLES}
  <script type="application/ld+json">${articleLd}</script>
  <script type="application/ld+json">${breadcrumbLd}</script>
  <script type="application/ld+json">${faqLd}</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<header class="guide-hero">
  <div class="container">
    <div class="breadcrumb" style="margin-bottom:16px"><a href="/" style="color:rgba(255,255,255,0.5);text-decoration:none">홈</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><a href="/guide/" style="color:rgba(255,255,255,0.5);text-decoration:none">가이드</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><a href="/guide/regret" style="color:rgba(255,255,255,0.5);text-decoration:none">후회 백서</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><span style="color:#C8A97E">${d.name}</span></div>
    <div class="guide-badge"><i class="fas fa-heart-crack"></i> 치과가 먼저 말하는 후회 백서</div>
    <h1>${d.heroH1}</h1>
    <p class="lead">${d.lead}</p>
    <div class="guide-meta">
      <span><i class="fas fa-user-md"></i> 서울비디치과 의료진 작성</span>
      <span><i class="fas fa-calendar"></i> ${TODAY.slice(0, 7).replace('-', '년 ')}월 기준</span>
      <span><i class="fas fa-clock"></i> 읽는 시간 약 ${d.readTime || 8}분</span>
    </div>
  </div>
</header>

<main class="guide-body">

<section class="quick-answer" id="quick-answer">
  <h2><i class="fas fa-bolt"></i> 30초 핵심 요약</h2>
  <p>${d.quickAnswer}</p>
</section>

<nav class="toc-box" aria-label="목차">
  <h2><i class="fas fa-list-ol" style="color:#C8A97E"></i> 목차</h2>
  <ul class="toc-list">
    <li><a href="#regrets"><span class="toc-num">01</span>${d.name} 후회하는 진짜 이유 ${d.regrets.length}가지</a></li>
    <li><a href="#side-effects"><span class="toc-num">02</span>부작용 총정리 — 빈도와 대처법</a></li>
    <li><a href="#not-for"><span class="toc-num">03</span>이런 분은 다시 생각해 보세요</a></li>
    <li><a href="#checklist"><span class="toc-num">04</span>치료 전 체크리스트</a></li>
    <li><a href="#faq"><span class="toc-num">05</span>자주 묻는 질문</a></li>
  </ul>
</nav>

<section class="guide-section" id="regrets">
  <h2><span class="num">01</span>${d.name} 후회하는 진짜 이유 ${d.regrets.length}가지</h2>
  <p>${d.regretsIntro}</p>
  <div class="regret-grid">
${regretRows}
  </div>
</section>

<section class="guide-section" id="side-effects">
  <h2><span class="num">02</span>${d.name} 부작용 총정리 — 빈도와 대처법</h2>
  <p>${d.sideEffectsIntro}</p>
  <table class="info-table">
    <thead><tr><th>부작용</th><th>빈도·양상</th><th>대처법</th></tr></thead>
    <tbody>
${seRows}
    </tbody>
  </table>
  <div class="disclaimer-note"><i class="fas fa-info-circle"></i> 빈도와 양상은 일반적인 경향을 정리한 것으로, 개인의 구강 상태·전신 건강에 따라 다를 수 있습니다. 정확한 위험도 평가는 의료진 상담을 통해 확인하세요.</div>
</section>

<section class="guide-section" id="not-for">
  <h2><span class="num">03</span>이런 분은 다시 생각해 보세요</h2>
  <p>솔직하게 말씀드립니다. ${d.name}이(가) 모든 분께 정답은 아닙니다. 아래에 해당하신다면 치료를 서두르기 전에 의료진과 대안을 먼저 상의하세요.</p>
  <div class="notfor-box">
  <ul>
${notForItems}
  </ul>
  </div>
</section>

<section class="guide-section" id="checklist">
  <h2><span class="num">04</span>치료 전 체크리스트 — 이것만 확인하면 후회 확률이 뚝 떨어집니다</h2>
  <p>어느 치과를 가시든 상관없습니다. 아래 항목에 명확히 답해 주는 병원이라면 어디서 받으셔도 좋습니다.</p>
  <ul class="check-list">
${checkItems}
  </ul>
</section>

<section class="guide-section" id="faq">
  <h2><span class="num">05</span>자주 묻는 질문</h2>
${faqItems}
</section>

<div class="cta-card">
  <h3><i class="fas fa-comments"></i> 부작용까지 먼저 말씀드리는 상담</h3>
  <p>서울비디치과는 좋은 면만 말하지 않습니다. ${d.name}의 부작용·한계·총비용까지 먼저 설명드리고, 충분히 고민할 시간을 드립니다. 당일 결제 압박, 없습니다.</p>
  <div class="btn-group">
    <a href="/reservation" class="btn-primary"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>
    <a href="/symptom-checker" class="btn-secondary"><i class="fas fa-stethoscope"></i> AI 증상체커로 자가진단</a>
  </div>
</div>

<div class="sibling-strip" aria-label="다른 진료 후회 백서">
  <h3><i class="fas fa-heart-crack" style="color:#C8A97E"></i> 다른 진료의 후회·부작용도 확인하세요</h3>
  <div class="chips">
      <a class="chip" href="/guide/regret">📖 후회 백서 전체 보기</a>
${siblings}
  </div>
</div>

<div class="related-guides">
  <h3><i class="fas fa-book-open" style="color:#C8A97E"></i> 함께 읽으면 좋은 가이드</h3>
  <div class="grid">
${related}
  </div>
</div>

</main>

${FOOTER}

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</body>
</html>
`;
}

// ── 실행 ──────────────────────────────────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
const all = files.map(f => JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8')));
all.sort((a, b) => (a.order || 99) - (b.order || 99));

for (const d of all) {
  const html = buildPage(d, all);
  fs.writeFileSync(path.join(OUT_DIR, `${d.slug}.html`), html);
  console.log(`✅ guide/regret/${d.slug}.html (${(html.length / 1024).toFixed(1)}KB) — ${d.title}`);
}
console.log(`\n총 ${all.length}개 후회 백서 세부 페이지 생성 완료`);
