#!/usr/bin/env node
/**
 * 가이드 페이지 빌더
 * 
 * 사용: node scripts/build-guide-pages.cjs
 * 
 * 입력: data/guide-content/*.json (각 가이드의 본문 데이터)
 * 출력: guide/<slug>.html
 * 
 * 디자인은 기존 guide/implant.html과 동일한 톤앤매너 유지
 * SEO 메타태그, JSON-LD 스키마, 토픽 클러스터 링크 자동 삽입
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'data/guide-content');
const OUT_DIR = path.join(REPO_ROOT, 'guide');
const TODAY = new Date().toISOString().slice(0, 10);

// 기존 가이드와 동일한 공통 스타일/스크립트
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

const GUIDE_STYLES = `<style>
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
    .toc-box{background:#f8f6f3;border:1px solid #e8e0d6;border-radius:16px;padding:32px;margin:48px 0}
    .toc-box h2{font-size:1.3rem;font-weight:800;color:#1a1917;margin-bottom:20px;display:flex;align-items:center;gap:8px}
    .toc-list{list-style:none;padding:0;margin:0;counter-reset:toc;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px 24px}
    .toc-list li{padding:8px 0;border-bottom:1px dotted #d4ccc1}
    .toc-list a{color:#3a3631;text-decoration:none;display:flex;gap:10px;align-items:baseline;font-size:0.95rem;line-height:1.5;transition:color 0.2s}
    .toc-list a:hover{color:#C8A97E}
    .toc-num{color:#C8A97E;font-weight:800;min-width:28px;font-size:0.85rem}
    .guide-section{padding:56px 0;border-bottom:1px solid #f0ece8}
    .guide-section:last-child{border-bottom:none}
    .guide-section h2{font-size:clamp(1.5rem,3.5vw,2rem);font-weight:800;color:#1a1917;margin-bottom:12px;line-height:1.3}
    .guide-section h2 .num{color:#C8A97E;margin-right:12px;font-weight:900}
    .guide-section h3{font-size:1.25rem;font-weight:700;color:#1a1917;margin:32px 0 12px}
    .guide-section h4{font-size:1.05rem;font-weight:700;color:#2d2926;margin:24px 0 8px}
    .guide-section p{font-size:1rem;line-height:1.9;color:#3a3631;margin-bottom:16px}
    .guide-section ul, .guide-section ol{margin:0 0 16px 24px;line-height:1.9;color:#3a3631}
    .guide-section li{margin-bottom:6px}
    .guide-section strong{color:#1a1917;font-weight:700}
    .section-intro{font-size:1.1rem;color:#6b645c;line-height:1.8;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #f0ece8}
    .highlight-box{background:#fef9f0;border-left:4px solid #C8A97E;padding:20px 24px;margin:24px 0;border-radius:0 12px 12px 0}
    .highlight-box h4{margin-top:0;color:#8B6F3F}
    .info-table{width:100%;border-collapse:collapse;margin:20px 0;font-size:0.95rem}
    .info-table th, .info-table td{padding:12px 16px;text-align:left;border-bottom:1px solid #e8e0d6}
    .info-table th{background:#f8f6f3;font-weight:700;color:#1a1917}
    .info-table tbody tr:hover{background:#fcfaf7}
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
    .faq-item{border:1px solid #e8e0d6;border-radius:12px;margin-bottom:10px;overflow:hidden;background:#fff}
    .faq-item summary{padding:18px 22px;cursor:pointer;font-weight:600;color:#1a1917;list-style:none;position:relative;padding-right:48px}
    .faq-item summary::-webkit-details-marker{display:none}
    .faq-item summary::after{content:'+';position:absolute;right:22px;top:50%;transform:translateY(-50%);font-size:1.3rem;color:#C8A97E;font-weight:300}
    .faq-item[open] summary::after{content:'−'}
    .faq-item summary span.q-mark{color:#C8A97E;margin-right:10px;font-weight:800}
    .faq-item .answer{padding:0 22px 22px;color:#3a3631;line-height:1.9}
    .faq-item .answer p{margin-bottom:12px}
</style>`;

const FOOTER_HTML = `<!-- Footer -->
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand"><a href="/" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p></div>
      <div class="footer-links">
        <div class="footer-col"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/implant">임플란트센터</a></li><li><a href="/treatments/invisalign">인비절라인</a></li><li><a href="/treatments/orthodontics">치아교정</a></li><li><a href="/treatments/pediatric">소아치과</a></li><li><a href="/treatments/glownate">글로우네이트</a></li></ul></div>
        <div class="footer-col"><strong class="section-heading">가이드</strong><ul><li><a href="/guide/implant">임플란트 가이드</a></li><li><a href="/guide/invisalign">인비절라인 가이드</a></li><li><a href="/guide/laminate">라미네이트 가이드</a></li><li><a href="/guide/scaling">스케일링 가이드</a></li><li><a href="/guide/whitening">미백 가이드</a></li><li><a href="/guide/wisdom-tooth">사랑니 가이드</a></li><li><a href="/guide/denture">틀니 가이드</a></li><li><a href="/guide/root-canal">신경치료 가이드</a></li><li><a href="/guide/orthodontics">교정 가이드</a></li></ul></div>
        <div class="footer-col"><strong class="section-heading">병원 안내</strong><ul><li><a href="/doctors/">의료진</a></li><li><a href="/floor-guide">비디치과 둘러보기</a></li><li><a href="/cases/gallery">Before/After</a></li><li><a href="/faq">자주 묻는 질문</a></li><li><a href="/directions">오시는 길</a></li></ul></div>
      </div>
    </div>
    <div class="footer-info">
      <div class="footer-contact"><p><i class="fas fa-map-marker-alt"></i> 충남 천안시 서북구 불당34길 14, 1~5층</p><p><i class="fas fa-phone"></i> 041-415-2892</p><div class="footer-hours"><p><i class="fas fa-clock"></i> <strong>365일 진료</strong></p><p>평일 09:00-20:00 (점심 12:30-14:00)</p><p>토·일 09:00-17:00</p><p>공휴일 09:00-13:00</p></div></div>
    </div>
    <div class="footer-bottom"><p>&copy; 2026 서울비디치과의원 불당본점. All rights reserved.</p><p><a href="/privacy">개인정보처리방침</a> | <a href="/terms">이용약관</a></p></div>
  </div>
</footer>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">`;

/**
 * 가이드 페이지 HTML 생성
 * @param {Object} g - 가이드 데이터 객체
 */
function buildGuideHtml(g) {
  const { slug, title, h1, lead, keyword, metaDesc, keywords, readingTime, sections, faqs, relatedGuides, relatedEncyclopedia, treatmentLink } = g;
  
  // 목차 생성
  const tocItems = sections.map((s, i) => 
    `<li><a href="#${s.id}"><span class="toc-num">${String(i+1).padStart(2,'0')}</span> ${s.tocLabel || s.h2}</a></li>`
  ).join('\n      ');
  
  // 본문 섹션 생성
  const sectionsHtml = sections.map((s, i) => {
    const num = String(i+1).padStart(2, '0');
    return `<section class="guide-section" id="${s.id}">
  <h2><span class="num">${num}</span>${s.h2}</h2>
  ${s.intro ? `<p class="section-intro">${s.intro}</p>` : ''}
  ${s.body}
</section>`;
  }).join('\n\n');
  
  // FAQ 섹션
  const faqHtml = faqs && faqs.length ? `
<section class="guide-section" id="faq">
  <h2><span class="num">${String(sections.length+1).padStart(2,'0')}</span>자주 묻는 질문</h2>
  <p class="section-intro">${keyword}에 대해 환자분들이 가장 많이 물으시는 질문을 정리했습니다.</p>
  ${faqs.map(f => `
  <details class="faq-item">
    <summary><span class="q-mark">Q.</span>${f.q}</summary>
    <div class="answer">${f.a.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
  </details>`).join('')}
</section>` : '';
  
  // 관련 가이드 카드
  const relatedGuidesHtml = relatedGuides && relatedGuides.length ? `
<div class="related-guides">
  <h3><i class="fas fa-link" style="color:#C8A97E;margin-right:8px"></i>함께 보면 좋은 가이드</h3>
  <div class="grid">
  ${relatedGuides.map(r => `<a href="${r.link}" class="card"><strong>${r.title}</strong><span>${r.desc}</span></a>`).join('\n  ')}
  </div>
</div>` : '';
  
  // 관련 백과사전 용어 (토픽 클러스터 강화)
  const relatedEncyclopediaHtml = relatedEncyclopedia && relatedEncyclopedia.length ? `
<div class="related-guides" style="background:#fef9f0;border:1px solid #f0e5d0">
  <h3><i class="fas fa-book-medical" style="color:#C8A97E;margin-right:8px"></i>관련 치과 용어 (백과사전)</h3>
  <div class="grid">
  ${relatedEncyclopedia.map(t => `<a href="/encyclopedia/${encodeURIComponent(t)}" class="card"><strong>${t}</strong><span>치과 백과사전</span></a>`).join('\n  ')}
  </div>
</div>` : '';
  
  // 최종 CTA
  const ctaHtml = `
<div class="cta-card">
  <h3>${keyword}에 대해 더 궁금하신가요?</h3>
  <p>서울비디치과 전문의가 직접 상담해 드립니다. 첫 상담은 무료입니다.</p>
  <div class="btn-group">
    <a href="/reservation" class="btn-primary"><i class="fas fa-calendar-check"></i> 무료 상담 예약</a>
    ${treatmentLink ? `<a href="${treatmentLink}" class="btn-secondary"><i class="fas fa-stethoscope"></i> 진료 안내 보기</a>` : ''}
    <a href="tel:041-415-2892" class="btn-secondary"><i class="fas fa-phone"></i> 041-415-2892</a>
  </div>
</div>`;
  
  // JSON-LD 스키마: Article + BreadcrumbList + FAQPage
  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: h1.replace(/<[^>]+>/g, '').replace(/\n/g, ' '),
    description: metaDesc,
    author: { '@type': 'Organization', name: '서울비디치과 의료진' },
    publisher: { '@type': 'Organization', name: '서울비디치과', logo: { '@type': 'ImageObject', url: 'https://bdbddc.com/images/logo.png' } },
    datePublished: TODAY,
    dateModified: TODAY,
    mainEntityOfPage: `https://bdbddc.com/guide/${slug}`,
    image: 'https://bdbddc.com/images/og-image-v2.jpg'
  });
  
  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://bdbddc.com/' },
      { '@type': 'ListItem', position: 2, name: '가이드', item: 'https://bdbddc.com/guide/' },
      { '@type': 'ListItem', position: 3, name: title.split('|')[0].trim(), item: `https://bdbddc.com/guide/${slug}` }
    ]
  });
  
  const faqSchema = faqs && faqs.length ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  }) : null;
  
  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
${COMMON_HEAD}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${title}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="keywords" content="${keywords}">
  <link rel="canonical" href="https://bdbddc.com/guide/${slug}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="author" content="서울비디치과 의료진">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://bdbddc.com/guide/${slug}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
  <meta property="article:published_time" content="${TODAY}T00:00:00+09:00">
  <meta property="article:modified_time" content="${TODAY}T00:00:00+09:00">
  <meta property="article:author" content="서울비디치과 의료진">
  <meta property="article:section" content="치과 가이드">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDesc}">
  <link rel="stylesheet" href="/css/site-v5.css?v=24d559d1">
  ${GUIDE_STYLES}
  <script type="application/ld+json">${articleSchema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>
  ${faqSchema ? `<script type="application/ld+json">${faqSchema}</script>` : ''}
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<header class="guide-hero">
  <div class="container">
    <div class="breadcrumb" style="margin-bottom:16px"><a href="/" style="color:rgba(255,255,255,0.5);text-decoration:none">홈</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><a href="/guide/" style="color:rgba(255,255,255,0.5);text-decoration:none">가이드</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><span style="color:#C8A97E">${keyword}</span></div>
    <div class="guide-badge"><i class="fas fa-book-medical"></i> 치과의사가 쓴 종합 가이드</div>
    <h1>${h1}</h1>
    <p class="lead">${lead}</p>
    <div class="guide-meta">
      <span><i class="fas fa-user-md"></i> 서울비디치과 의료진 집필</span>
      <span><i class="fas fa-calendar"></i> ${TODAY.slice(0,7).replace('-','.')} 업데이트</span>
      <span><i class="fas fa-clock"></i> 읽는 시간 약 ${readingTime}분</span>
    </div>
  </div>
</header>

<main class="guide-body">

  <!-- 목차 -->
  <nav class="toc-box" aria-label="목차">
    <h2><i class="fas fa-list-ol" style="color:#C8A97E"></i> 목차</h2>
    <ol class="toc-list">
      ${tocItems}
      ${faqs && faqs.length ? `<li><a href="#faq"><span class="toc-num">${String(sections.length+1).padStart(2,'0')}</span> 자주 묻는 질문</a></li>` : ''}
    </ol>
  </nav>

  ${sectionsHtml}

  ${faqHtml}

  ${relatedEncyclopediaHtml}
  ${relatedGuidesHtml}

  ${ctaHtml}

</main>

${FOOTER_HTML}
</body>
</html>
`;
}

// 실행
if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
  console.error(`   data/guide-content/*.json 파일들을 먼저 작성해 주세요`);
  process.exit(1);
}

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
console.log(`📚 ${files.length}개 가이드 콘텐츠 파일 발견`);

let success = 0;
let failed = 0;

for (const file of files) {
  try {
    const filepath = path.join(CONTENT_DIR, file);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const html = buildGuideHtml(data);
    const outpath = path.join(OUT_DIR, `${data.slug}.html`);
    fs.writeFileSync(outpath, html, 'utf-8');
    
    const wordCount = html.replace(/<[^>]+>/g, '').length;
    console.log(`✅ ${data.slug}.html (${(wordCount/1000).toFixed(1)}k chars)`);
    success++;
  } catch (e) {
    console.error(`❌ ${file}: ${e.message}`);
    failed++;
  }
}

console.log(`\n📊 결과: ${success}개 성공, ${failed}개 실패`);
