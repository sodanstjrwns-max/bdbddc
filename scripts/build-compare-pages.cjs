#!/usr/bin/env node
/**
 * 비교백서 — 시술 A vs B 비교 페이지 빌더 (SEO/AEO 머신, 후회 백서 자매편)
 *
 * 사용: node scripts/build-compare-pages.cjs
 * 입력: data/compare-content/*.json
 * 출력: guide/compare/<slug>.html + 허브 guide/compare.html
 *
 * 타깃 검색어: "브릿지 임플란트 차이", "틀니 vs 임플란트", "인비절라인 교정 비교"
 * — 선택 직전 가장 뜨거운 검색 의도를 전용 페이지로 흡수
 * 의료광고법 안전선: 시술 간 객관 비교만. 타 의료기관·특정 상품 비하 금지.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'data/compare-content');
const OUT_DIR = path.join(ROOT, 'guide/compare');
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
    .guide-hero{background:linear-gradient(135deg,#16213e 0%,#1a1a2e 100%);color:#fff;padding:80px 0 60px;position:relative;overflow:hidden}
    .guide-hero::before{content:'';position:absolute;top:0;right:0;width:50%;height:100%;background:radial-gradient(circle at 70% 50%,rgba(126,169,200,0.1) 0%,transparent 60%)}
    .guide-hero .container{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:0 24px}
    .guide-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(126,169,200,0.18);color:#7EA9C8;padding:6px 14px;border-radius:50px;font-size:0.82rem;font-weight:600;margin-bottom:20px}
    .guide-hero h1{font-size:clamp(1.9rem,5vw,2.9rem);font-weight:900;line-height:1.25;margin-bottom:16px;letter-spacing:-0.5px}
    .guide-hero h1 .kw-a{color:#7EA9C8}
    .guide-hero h1 .kw-b{color:#C8A97E}
    .guide-hero .lead{font-size:1.1rem;color:rgba(255,255,255,0.7);line-height:1.8;max-width:700px}
    .guide-meta{display:flex;flex-wrap:wrap;gap:16px;margin-top:24px;font-size:0.85rem;color:rgba(255,255,255,0.5)}
    .guide-meta span{display:flex;align-items:center;gap:5px}
    .guide-body{max-width:900px;margin:0 auto;padding:0 24px}
    .quick-answer{background:#f0f6fb;border:2px solid #7EA9C8;border-radius:16px;padding:28px 32px;margin:48px 0 0}
    .quick-answer h2{font-size:1.15rem;font-weight:800;color:#3d6a8a;margin:0 0 10px;display:flex;align-items:center;gap:8px}
    .quick-answer p{margin:0;font-size:1.02rem;line-height:1.9;color:#3a3631}
    .toc-box{background:#f8f6f3;border:1px solid #e8e0d6;border-radius:16px;padding:32px;margin:32px 0 48px}
    .toc-box h2{font-size:1.3rem;font-weight:800;color:#1a1917;margin-bottom:20px;display:flex;align-items:center;gap:8px}
    .toc-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px 24px}
    .toc-list li{padding:8px 0;border-bottom:1px dotted #d4ccc1}
    .toc-list a{color:#3a3631;text-decoration:none;display:flex;gap:10px;align-items:baseline;font-size:0.95rem;line-height:1.5;transition:color 0.2s}
    .toc-list a:hover{color:#7EA9C8}
    .toc-num{color:#7EA9C8;font-weight:800;min-width:28px;font-size:0.85rem}
    .guide-section{padding:56px 0;border-bottom:1px solid #f0ece8}
    .guide-section:last-child{border-bottom:none}
    .guide-section h2{font-size:clamp(1.5rem,3.5vw,2rem);font-weight:800;color:#1a1917;margin-bottom:12px;line-height:1.3}
    .guide-section h2 .num{color:#7EA9C8;margin-right:12px;font-weight:900}
    .guide-section p{font-size:1rem;line-height:1.9;color:#3a3631;margin-bottom:16px}
    .guide-section ul, .guide-section ol{margin:0 0 16px 24px;line-height:1.9;color:#3a3631}
    .guide-section li{margin-bottom:6px}
    .guide-section strong{color:#1a1917;font-weight:700}
    .vs-table{width:100%;border-collapse:separate;border-spacing:0;margin:20px 0;font-size:0.95rem;border:1px solid #e8e0d6;border-radius:14px;overflow:hidden}
    .vs-table th, .vs-table td{padding:14px 16px;text-align:left;border-bottom:1px solid #e8e0d6;vertical-align:top;line-height:1.7}
    .vs-table tr:last-child th, .vs-table tr:last-child td{border-bottom:none}
    .vs-table thead th{font-weight:800;font-size:0.95rem}
    .vs-table thead th.col-label{background:#f8f6f3;color:#8a8378;width:18%}
    .vs-table thead th.col-a{background:#eef5fa;color:#3d6a8a;width:41%}
    .vs-table thead th.col-b{background:#fbf5ec;color:#8B6F3F;width:41%}
    .vs-table tbody th{background:#f8f6f3;font-weight:700;color:#1a1917;white-space:normal;font-size:0.88rem}
    .vs-table td.cell-a{background:#fcfdfe}
    .vs-table td.cell-b{background:#fffdf9}
    .choose-box{border-radius:14px;padding:24px 28px;margin:20px 0}
    .choose-box.for-a{background:#eef5fa;border:1px solid #cfe0ec}
    .choose-box.for-b{background:#fbf5ec;border:1px solid #ecdfc9}
    .choose-box ul{list-style:none;margin:0;padding:0}
    .choose-box li{position:relative;padding:10px 0 10px 34px;line-height:1.8;color:#3a3631;border-bottom:1px dotted rgba(0,0,0,0.07)}
    .choose-box li:last-child{border-bottom:none}
    .choose-box.for-a li::before{content:'✓';position:absolute;left:6px;top:9px;color:#3d6a8a;font-weight:900}
    .choose-box.for-b li::before{content:'✓';position:absolute;left:6px;top:9px;color:#8B6F3F;font-weight:900}
    .check-list{list-style:none;margin:20px 0 !important;padding:0}
    .check-list li{position:relative;padding:14px 18px 14px 48px;background:#f8f6f3;border-radius:12px;margin-bottom:10px;line-height:1.7;color:#3a3631}
    .check-list li::before{content:'!';position:absolute;left:20px;top:12px;color:#9a3b2e;font-weight:900;font-size:1.05rem}
    .regret-cross{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:20px 0}
    .regret-cross a{display:block;background:#fdf4f2;border:1px solid #efd5cf;border-left:5px solid #9a3b2e;border-radius:12px;padding:16px 20px;text-decoration:none;transition:all 0.2s}
    .regret-cross a:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(154,59,46,0.12)}
    .regret-cross strong{display:block;color:#9a3b2e;font-size:0.95rem;margin-bottom:4px}
    .regret-cross span{color:#6b645c;font-size:0.85rem;line-height:1.6}
    .cta-card{background:linear-gradient(135deg,#3d6a8a 0%,#16213e 100%);color:#fff;padding:32px;border-radius:16px;margin:32px 0;text-align:center}
    .cta-card h3{color:#fff;margin-bottom:8px;font-size:1.3rem}
    .cta-card p{color:rgba(255,255,255,0.85);margin-bottom:20px}
    .cta-card .btn-group{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .cta-card a.btn-primary{display:inline-flex;align-items:center;gap:6px;background:#fff;color:#3d6a8a;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem}
    .cta-card a.btn-secondary{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.15);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem;border:1px solid rgba(255,255,255,0.4)}
    .related-guides{background:#f8f6f3;padding:40px 24px;border-radius:16px;margin:48px 0}
    .related-guides h3{margin-top:0;color:#1a1917;margin-bottom:16px;font-size:1.2rem}
    .related-guides .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
    .related-guides a.card{display:block;background:#fff;padding:16px 18px;border-radius:12px;border:1px solid #e8e0d6;text-decoration:none;color:#1a1917;transition:all 0.2s}
    .related-guides a.card:hover{border-color:#7EA9C8;transform:translateY(-2px);box-shadow:0 4px 12px rgba(126,169,200,0.15)}
    .related-guides .card strong{display:block;font-size:0.95rem;margin-bottom:4px;color:#1a1917}
    .related-guides .card span{font-size:0.85rem;color:#6b645c}
    .sibling-strip{margin:48px 0}
    .sibling-strip h3{font-size:1.2rem;font-weight:800;color:#1a1917;margin-bottom:14px}
    .sibling-strip .chips{display:flex;flex-wrap:wrap;gap:8px}
    .sibling-strip a.chip{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #e8e0d6;border-radius:50px;padding:8px 16px;font-size:0.88rem;color:#3a3631;text-decoration:none;transition:all 0.2s}
    .sibling-strip a.chip:hover{border-color:#7EA9C8;color:#3d6a8a}
    .faq-item{border:1px solid #e8e0d6;border-radius:12px;margin-bottom:10px;overflow:hidden;background:#fff}
    .faq-item summary{padding:18px 22px;cursor:pointer;font-weight:600;color:#1a1917;list-style:none;position:relative;padding-right:48px}
    .faq-item summary::-webkit-details-marker{display:none}
    .faq-item summary::after{content:'+';position:absolute;right:22px;top:50%;transform:translateY(-50%);font-size:1.3rem;color:#7EA9C8;font-weight:300}
    .faq-item[open] summary::after{content:'−'}
    .faq-item summary span.q-mark{color:#7EA9C8;margin-right:10px;font-weight:800}
    .faq-item .answer{padding:0 22px 22px;color:#3a3631;line-height:1.9}
    .disclaimer-note{font-size:0.85rem;color:#8a8378;background:#f8f6f3;border-radius:10px;padding:16px 20px;margin:24px 0;line-height:1.7}
    .deep-dive{border-radius:14px;padding:28px 30px;margin:20px 0}
    .deep-dive.side-a{background:#f7fafd;border:1px solid #d8e6f0}
    .deep-dive.side-b{background:#fdfaf4;border:1px solid #ecdfc9}
    .deep-dive h3{font-size:1.05rem;font-weight:800;margin:20px 0 10px;display:flex;align-items:center;gap:8px}
    .deep-dive.side-a h3{color:#3d6a8a}
    .deep-dive.side-b h3{color:#8B6F3F}
    .deep-dive ul{list-style:none;margin:0 0 8px !important;padding:0}
    .deep-dive li{position:relative;padding:8px 0 8px 30px;line-height:1.8;color:#3a3631;border-bottom:1px dotted rgba(0,0,0,0.06)}
    .deep-dive li:last-child{border-bottom:none}
    .deep-dive ul.pros li::before{content:'+';position:absolute;left:4px;top:7px;font-weight:900;font-size:1.05rem;color:#3f7d4e}
    .deep-dive ul.cons li::before{content:'−';position:absolute;left:4px;top:7px;font-weight:900;font-size:1.05rem;color:#9a3b2e}
    .timeline-wrap{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin:24px 0}
    .timeline-col{background:#fff;border:1px solid #e8e0d6;border-radius:14px;padding:24px 26px}
    .timeline-col.tl-a{border-top:4px solid #7EA9C8}
    .timeline-col.tl-b{border-top:4px solid #C8A97E}
    .timeline-col h3{font-size:1.05rem;font-weight:800;margin-bottom:16px;color:#1a1917}
    .timeline-col ol{list-style:none;margin:0 !important;padding:0;counter-reset:tl}
    .timeline-col ol li{counter-increment:tl;position:relative;padding:0 0 18px 44px;margin:0;line-height:1.7}
    .timeline-col ol li::before{content:counter(tl);position:absolute;left:0;top:0;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;color:#fff}
    .timeline-col.tl-a ol li::before{background:#7EA9C8}
    .timeline-col.tl-b ol li::before{background:#C8A97E}
    .timeline-col ol li::after{content:'';position:absolute;left:13px;top:30px;bottom:2px;width:2px;background:#e8e0d6}
    .timeline-col ol li:last-child::after{display:none}
    .timeline-col ol li strong{display:block;font-size:0.95rem;margin-bottom:2px}
    .timeline-col ol li span{font-size:0.88rem;color:#6b645c}
    .scenario-card{background:#fff;border:1px solid #e8e0d6;border-radius:14px;padding:24px 28px;margin-bottom:14px}
    .scenario-card h3{font-size:1.02rem;font-weight:800;color:#1a1917;margin-bottom:12px;display:flex;align-items:center;gap:8px}
    .scenario-card h3 i{color:#7EA9C8}
    .scenario-card .sc-row{display:flex;gap:10px;margin-bottom:10px;line-height:1.8;font-size:0.95rem}
    .scenario-card .sc-tag{flex-shrink:0;font-weight:800;font-size:0.8rem;padding:3px 10px;border-radius:50px;height:fit-content;margin-top:3px}
    .scenario-card .sc-tag.t-sit{background:#f0ece8;color:#6b645c}
    .scenario-card .sc-tag.t-dec{background:#eef5fa;color:#3d6a8a}
    .scenario-card .sc-tag.t-why{background:#fbf5ec;color:#8B6F3F}
    .scenario-card p{margin:0;color:#3a3631}
    .myth-item{display:grid;grid-template-columns:auto 1fr;gap:14px;background:#fff;border:1px solid #e8e0d6;border-radius:14px;padding:22px 26px;margin-bottom:12px}
    .myth-item .m-icon{font-size:1.4rem;line-height:1}
    .myth-item .m-myth{font-weight:800;color:#9a3b2e;margin-bottom:8px;font-size:0.98rem;line-height:1.6}
    .myth-item .m-truth{color:#3a3631;line-height:1.85;font-size:0.95rem}
    .myth-item .m-truth strong{color:#3f7d4e}
</style>`;

const FOOTER = `<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand"><a href="/" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication — 정성을 다하는 헌신</p></div>
      <div class="footer-links">
        <div class="footer-col"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/implant">임플란트센터</a></li><li><a href="/treatments/invisalign">인비절라인</a></li><li><a href="/treatments/orthodontics">치아교정</a></li><li><a href="/treatments/pediatric">소아치과</a></li><li><a href="/treatments/glownate">글로우네이트</a></li></ul></div>
        <div class="footer-col"><strong class="section-heading">가이드</strong><ul><li><a href="/guide/regret">후회 백서</a></li><li><a href="/guide/compare">비교백서</a></li><li><a href="/guide/implant">임플란트 가이드</a></li><li><a href="/guide/invisalign">인비절라인 가이드</a></li><li><a href="/guide/laminate">라미네이트 가이드</a></li><li><a href="/guide/insurance">치과 실비보험 가이드</a></li><li><a href="/guide/whitening">미백 가이드</a></li><li><a href="/guide/wisdom-tooth">사랑니 가이드</a></li><li><a href="/guide/denture">틀니 가이드</a></li><li><a href="/guide/root-canal">신경치료 가이드</a></li></ul></div>
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
const stripTags = (s) => String(s).replace(/<[^>]+>/g, '');

// 후회 백서 메타 (크로스링크 카드용)
function loadRegretMeta() {
  const dir = path.join(ROOT, 'data/regret-content');
  const meta = {};
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    meta[d.slug] = { name: d.name, icon: d.chipIcon || '', n: (d.regrets || []).length };
  }
  return meta;
}

function loadExt(slug) {
  const p = path.join(ROOT, 'data/compare-content-ext', `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function buildPage(d, all, regretMeta) {
  const url = `https://bdbddc.com/guide/compare/${d.slug}`;
  const pub = d.datePublished || TODAY;
  const ext = loadExt(d.slug);
  const allFaq = ext && ext.extraFaq ? d.faq.concat(ext.extraFaq) : d.faq;

  const faqLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: allFaq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) } }))
  });
  const articleLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    '@id': `${url}#article`,
    headline: d.title, description: d.description,
    author: { '@type': 'Organization', name: '서울비디치과 의료진' },
    publisher: { '@type': 'Organization', name: '서울비디치과', logo: { '@type': 'ImageObject', url: 'https://bdbddc.com/images/logo.png' } },
    datePublished: pub, dateModified: TODAY,
    mainEntityOfPage: url, image: 'https://bdbddc.com/images/og-image-v2.jpg',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#quick-answer'] }
  });
  const medicalLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'MedicalWebPage',
    '@id': `${url}#medicalwebpage`,
    url, name: d.title, description: d.description,
    inLanguage: 'ko',
    about: [
      { '@type': 'MedicalProcedure', name: d.aName, procedureType: { '@type': 'MedicalProcedureType', name: 'Dental procedure' } },
      { '@type': 'MedicalProcedure', name: d.bName, procedureType: { '@type': 'MedicalProcedureType', name: 'Dental procedure' } }
    ],
    audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
    specialty: 'https://schema.org/Dentistry',
    lastReviewed: TODAY,
    reviewedBy: { '@type': 'MedicalOrganization', name: '서울비디치과', url: 'https://bdbddc.com/' },
    datePublished: pub, dateModified: TODAY,
    mainContentOfPage: { '@type': 'WebPageElement', cssSelector: '.guide-body' },
    significantLink: ['https://bdbddc.com/guide/compare', 'https://bdbddc.com/reservation']
  });
  const breadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://bdbddc.com/' },
      { '@type': 'ListItem', position: 2, name: '가이드', item: 'https://bdbddc.com/guide/' },
      { '@type': 'ListItem', position: 3, name: '비교백서', item: 'https://bdbddc.com/guide/compare' },
      { '@type': 'ListItem', position: 4, name: `${d.aName} vs ${d.bName}`, item: url }
    ]
  });

  const tableRows = d.rows.map(r => `      <tr><th>${r.label}</th><td class="cell-a">${r.a}</td><td class="cell-b">${r.b}</td></tr>`).join('\n');
  const chooseAItems = d.chooseA.map(x => `    <li>${x}</li>`).join('\n');
  const chooseBItems = d.chooseB.map(x => `    <li>${x}</li>`).join('\n');
  const checkItems = d.checkpoints.map(c => `    <li>${c}</li>`).join('\n');
  const faqItems = allFaq.map(f => `  <details class="faq-item">
    <summary><span class="q-mark">Q.</span>${f.q}</summary>
    <div class="answer">${f.a}</div>
  </details>`).join('\n');

  // ── 확장 콘텐츠 섹션 (data/compare-content-ext/<slug>.json) ──
  let secNum = 0;
  const nn = () => String(++secNum).padStart(2, '0');
  const tocEntries = [];
  const sections = [];

  if (ext && ext.background) {
    const n = nn();
    tocEntries.push({ id: 'background', n, label: `왜 ${d.aName} vs ${d.bName}에서 고민하게 되는가` });
    sections.push(`<section class="guide-section" id="background">
  <h2><span class="num">${n}</span>왜 ${d.aName} vs ${d.bName}에서 고민하게 되는가</h2>
${ext.background.map(p => `  <p>${p}</p>`).join('\n')}
</section>`);
  }

  {
    const n = nn();
    tocEntries.push({ id: 'vs-table', n, label: `${d.aName} vs ${d.bName} 한눈 비교표` });
    sections.push(`<section class="guide-section" id="vs-table">
  <h2><span class="num">${n}</span>${d.aName} vs ${d.bName} 한눈 비교표</h2>
  <p>${d.tableIntro}</p>
  <table class="vs-table">
    <thead><tr><th class="col-label">비교 항목</th><th class="col-a">${d.aName}</th><th class="col-b">${d.bName}</th></tr></thead>
    <tbody>
${tableRows}
    </tbody>
  </table>
  <div class="disclaimer-note"><i class="fas fa-info-circle"></i> 위 비교는 일반적인 경향을 정리한 것으로, 실제 적합한 치료는 개인의 구강 상태·전신 건강·예산에 따라 달라집니다. 비용은 치료 범위와 사용 재료에 따라 달라지므로 정확한 금액은 검진 후 안내드립니다.</div>
</section>`);
  }

  const renderDive = (dd, name, cls) => `  <div class="deep-dive ${cls}">
  <p style="margin-bottom:4px">${dd.intro}</p>
  <h3><i class="fas fa-thumbs-up"></i> ${name}의 강점</h3>
  <ul class="pros">
${dd.strengths.map(x => `    <li>${x}</li>`).join('\n')}
  </ul>
  <h3><i class="fas fa-triangle-exclamation"></i> ${name}의 한계와 주의점</h3>
  <ul class="cons">
${dd.weaknesses.map(x => `    <li>${x}</li>`).join('\n')}
  </ul>
  </div>`;

  if (ext && ext.deepDiveA) {
    const n = nn();
    tocEntries.push({ id: 'deep-a', n, label: `${d.aName} 심층 해부 — 강점과 한계` });
    sections.push(`<section class="guide-section" id="deep-a">
  <h2><span class="num">${n}</span>${d.aName} 심층 해부 — 강점과 한계</h2>
${renderDive(ext.deepDiveA, d.aName, 'side-a')}
</section>`);
  }
  if (ext && ext.deepDiveB) {
    const n = nn();
    tocEntries.push({ id: 'deep-b', n, label: `${d.bName} 심층 해부 — 강점과 한계` });
    sections.push(`<section class="guide-section" id="deep-b">
  <h2><span class="num">${n}</span>${d.bName} 심층 해부 — 강점과 한계</h2>
${renderDive(ext.deepDiveB, d.bName, 'side-b')}
</section>`);
  }

  if (ext && ext.costStructure) {
    const n = nn();
    tocEntries.push({ id: 'cost', n, label: '비용 구조, 숫자 대신 원리로 이해하기' });
    sections.push(`<section class="guide-section" id="cost">
  <h2><span class="num">${n}</span>비용 구조, 숫자 대신 원리로 이해하기</h2>
${ext.costStructure.map(p => `  <p>${p}</p>`).join('\n')}
  <div class="disclaimer-note"><i class="fas fa-info-circle"></i> 의료광고법에 따라 구체적인 금액은 표기하지 않습니다. 정확한 비용은 구강 상태 확인 후 서면으로 안내드리며, 치료를 강요하지 않습니다.</div>
</section>`);
  }

  if (ext && ext.timeline) {
    const n = nn();
    tocEntries.push({ id: 'timeline', n, label: '치료 과정 타임라인 비교' });
    const tlCol = (steps, name, cls) => `    <div class="timeline-col ${cls}">
      <h3>${name} 진행 과정</h3>
      <ol>
${steps.map(s => `        <li><strong>${s.step}</strong><span>${s.desc}</span></li>`).join('\n')}
      </ol>
    </div>`;
    sections.push(`<section class="guide-section" id="timeline">
  <h2><span class="num">${n}</span>치료 과정 타임라인 비교</h2>
  <p>${ext.timeline.intro || '두 치료가 처음 내원부터 마무리까지 어떻게 진행되는지 단계별로 비교하면, 내 생활 패턴에 어느 쪽이 맞는지 훨씬 구체적으로 그려집니다.'}</p>
  <div class="timeline-wrap">
${tlCol(ext.timeline.aSteps, d.aName, 'tl-a')}
${tlCol(ext.timeline.bSteps, d.bName, 'tl-b')}
  </div>
${ext.timeline.note ? `  <p style="font-size:0.92rem;color:#6b645c"><i class="fas fa-lightbulb" style="color:#C8A97E;margin-right:6px"></i>${ext.timeline.note}</p>` : ''}
</section>`);
  }

  {
    const n = nn();
    tocEntries.push({ id: 'choose-a', n, label: `이런 분은 ${d.aName}` });
    sections.push(`<section class="guide-section" id="choose-a">
  <h2><span class="num">${n}</span>이런 분은 ${d.aName} 쪽이 맞습니다</h2>
  <div class="choose-box for-a">
  <ul>
${chooseAItems}
  </ul>
  </div>
</section>`);
  }
  {
    const n = nn();
    tocEntries.push({ id: 'choose-b', n, label: `이런 분은 ${d.bName}` });
    sections.push(`<section class="guide-section" id="choose-b">
  <h2><span class="num">${n}</span>이런 분은 ${d.bName} 쪽이 맞습니다</h2>
  <div class="choose-box for-b">
  <ul>
${chooseBItems}
  </ul>
  </div>
</section>`);
  }

  if (ext && ext.scenarios) {
    const n = nn();
    tocEntries.push({ id: 'scenarios', n, label: '실제 갈림길 시나리오 3가지' });
    const sc = ext.scenarios.map(s => `  <div class="scenario-card">
    <h3><i class="fas fa-user"></i> ${s.title}</h3>
    <div class="sc-row"><span class="sc-tag t-sit">상황</span><p>${s.situation}</p></div>
    <div class="sc-row"><span class="sc-tag t-dec">선택</span><p>${s.decision}</p></div>
    <div class="sc-row"><span class="sc-tag t-why">이유</span><p>${s.reason}</p></div>
  </div>`).join('\n');
    sections.push(`<section class="guide-section" id="scenarios">
  <h2><span class="num">${n}</span>실제 갈림길 시나리오 3가지</h2>
  <p>진료실에서 자주 만나는 대표적인 갈림길 상황을 재구성했습니다. 특정 환자의 사례가 아닌, 흔한 판단 기준을 이해하기 쉽게 정리한 가상의 시나리오입니다.</p>
${sc}
</section>`);
  }

  if (ext && ext.myths) {
    const n = nn();
    tocEntries.push({ id: 'myths', n, label: '흔한 오해 바로잡기' });
    const my = ext.myths.map(m => `  <div class="myth-item">
    <div class="m-icon">🙅</div>
    <div><div class="m-myth">"${m.myth}"</div><div class="m-truth"><strong>사실은 —</strong> ${m.truth}</div></div>
  </div>`).join('\n');
    sections.push(`<section class="guide-section" id="myths">
  <h2><span class="num">${n}</span>흔한 오해 바로잡기</h2>
  <p>인터넷 커뮤니티와 주변 경험담에서 자주 보이는 오해들입니다. 잘못된 전제로 결정하면 방향 자체가 틀어질 수 있으니 먼저 바로잡고 갑니다.</p>
${my}
</section>`);
  }

  {
    const n = nn();
    tocEntries.push({ id: 'checkpoints', n, label: '결정 전 놓치기 쉬운 체크포인트' });
    sections.push(`<section class="guide-section" id="checkpoints">
  <h2><span class="num">${n}</span>결정 전 놓치기 쉬운 체크포인트</h2>
  <p>어느 쪽을 선택하시든, 아래 항목을 상담 때 확인하시면 후회 확률이 크게 줄어듭니다.</p>
  <ul class="check-list">
${checkItems}
  </ul>
</section>`);
  }
  {
    const n = nn();
    tocEntries.push({ id: 'faq', n, label: '자주 묻는 질문' });
    sections.push(`<section class="guide-section" id="faq">
  <h2><span class="num">${n}</span>자주 묻는 질문</h2>
${faqItems}
</section>`);
  }

  const tocHtml = tocEntries.map(t => `    <li><a href="#${t.id}"><span class="toc-num">${t.n}</span>${t.label}</a></li>`).join('\n');
  const bodySections = sections.join('\n\n');
  const readTime = ext ? (d.readTime || 6) + 6 : (d.readTime || 7);

  const regretCards = (d.regretSlugs || []).filter(s => regretMeta[s]).map(s => {
    const m = regretMeta[s];
    return `    <a href="/guide/regret/${s}"><strong><i class="fas fa-heart-crack"></i> ${m.name} 후회 백서</strong><span>${m.name} 후회 이유 ${m.n}가지와 부작용·대처법을 치과가 먼저 정리했습니다.</span></a>`;
  }).join('\n');

  const siblings = all.filter(x => x.slug !== d.slug)
    .map(x => `      <a class="chip" href="/guide/compare/${x.slug}">${x.chipIcon || '⚖️'} ${x.aName} vs ${x.bName}</a>`).join('\n');

  const related = (d.related || []).map(r => `    <a href="${r.href}" class="card"><strong>${r.title}</strong><span>${r.desc}</span></a>`).join('\n');

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
  <link rel="alternate" hreflang="ko" href="${url}">
  <link rel="alternate" hreflang="x-default" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="author" content="서울비디치과 의료진">
  <meta property="og:title" content="${esc(d.title)}">
  <meta property="og:description" content="${esc(d.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
  <meta property="article:published_time" content="${pub}T00:00:00+09:00">
  <meta property="article:modified_time" content="${TODAY}T00:00:00+09:00">
  <meta property="article:author" content="서울비디치과 의료진">
  <meta property="article:section" content="비교백서">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(d.title)}">
  <meta name="twitter:description" content="${esc(d.description)}">
  <link rel="stylesheet" href="/css/site-v5.css?v=24a633b2">
${STYLES}
  <script type="application/ld+json">${articleLd}</script>
  <script type="application/ld+json">${medicalLd}</script>
  <script type="application/ld+json">${breadcrumbLd}</script>
  <script type="application/ld+json">${faqLd}</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<header class="guide-hero">
  <div class="container">
    <div class="breadcrumb" style="margin-bottom:16px"><a href="/" style="color:rgba(255,255,255,0.5);text-decoration:none">홈</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><a href="/guide/" style="color:rgba(255,255,255,0.5);text-decoration:none">가이드</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><a href="/guide/compare" style="color:rgba(255,255,255,0.5);text-decoration:none">비교백서</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><span style="color:#7EA9C8">${d.aName} vs ${d.bName}</span></div>
    <div class="guide-badge"><i class="fas fa-scale-balanced"></i> 치과가 정직하게 비교하는 비교백서</div>
    <h1>${d.heroH1}</h1>
    <p class="lead">${d.lead}</p>
    <div class="guide-meta">
      <span><i class="fas fa-user-md"></i> 서울비디치과 의료진 작성</span>
      <span><i class="fas fa-calendar"></i> ${TODAY.slice(0, 7).replace('-', '년 ')}월 기준</span>
      <span><i class="fas fa-clock"></i> 읽는 시간 약 ${readTime}분</span>
    </div>
  </div>
</header>

<main class="guide-body">

<section class="quick-answer" id="quick-answer">
  <h2><i class="fas fa-bolt"></i> 30초 핵심 요약</h2>
  <p>${d.quickAnswer}</p>
</section>

<nav class="toc-box" aria-label="목차">
  <h2><i class="fas fa-list-ol" style="color:#7EA9C8"></i> 목차</h2>
  <ul class="toc-list">
${tocHtml}
  </ul>
</nav>

${bodySections}

${regretCards ? `<section class="guide-section" id="regret-links" style="border-bottom:none;padding-bottom:24px">
  <h2 style="font-size:1.3rem"><i class="fas fa-heart-crack" style="color:#9a3b2e;margin-right:8px"></i>선택 전에 후회 사례도 확인하세요</h2>
  <div class="regret-cross">
${regretCards}
  </div>
</section>` : ''}

<div class="cta-card">
  <h3><i class="fas fa-comments"></i> 어느 쪽이 맞는지, 검진 후 정직하게 말씀드립니다</h3>
  <p>서울비디치과는 두 치료의 장단점·비용·한계를 모두 설명드리고, 환자분 상태에 더 맞는 쪽을 권해드립니다. 필요 없는 치료를 권하지 않습니다. 당일 결제 압박, 없습니다.</p>
  <div class="btn-group">
    <a href="/reservation" class="btn-primary"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>
    <a href="/symptom-checker" class="btn-secondary"><i class="fas fa-stethoscope"></i> AI 증상체커로 자가진단</a>
  </div>
</div>

<div class="sibling-strip" aria-label="다른 비교백서">
  <h3><i class="fas fa-scale-balanced" style="color:#7EA9C8"></i> 다른 치료 비교도 확인하세요</h3>
  <div class="chips">
      <a class="chip" href="/guide/compare">📖 비교백서 전체 보기</a>
${siblings}
  </div>
</div>

${related ? `<div class="related-guides">
  <h3><i class="fas fa-book-open" style="color:#7EA9C8"></i> 함께 읽으면 좋은 가이드</h3>
  <div class="grid">
${related}
  </div>
</div>` : ''}

</main>

${FOOTER}

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</body>
</html>
`;
}

// ── 허브 페이지 ──────────────────────────────────────
function buildHub(all) {
  const url = 'https://bdbddc.com/guide/compare';
  const cats = {};
  for (const d of all) {
    (cats[d.category] = cats[d.category] || []).push(d);
  }
  const CAT_ORDER = ['임플란트·상실 치아', '치아교정', '심미치료', '보존·보철', '기타 선택'];
  const catSections = CAT_ORDER.filter(c => cats[c]).map(c => `
  <section class="hub-cat">
    <h2>${c}</h2>
    <div class="hub-grid">
${cats[c].map(d => `      <a href="/guide/compare/${d.slug}" class="hub-card">
        <span class="hc-icon">${d.chipIcon || '⚖️'}</span>
        <strong>${d.aName} <em>vs</em> ${d.bName}</strong>
        <span class="hc-desc">${d.hubDesc || d.description.slice(0, 60)}</span>
        <span class="hc-arrow">→</span>
      </a>`).join('\n')}
    </div>
  </section>`).join('\n');

  const itemListLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: '서울비디치과 비교백서', numberOfItems: all.length,
    itemListElement: all.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: `${d.aName} vs ${d.bName}`, url: `https://bdbddc.com/guide/compare/${d.slug}` }))
  });
  const breadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://bdbddc.com/' },
      { '@type': 'ListItem', position: 2, name: '가이드', item: 'https://bdbddc.com/guide/' },
      { '@type': 'ListItem', position: 3, name: '비교백서', item: url }
    ]
  });

  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
${COMMON_HEAD}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>치과 치료 비교백서 — 브릿지 vs 임플란트, 교정 vs 인비절라인 등 ${all.length}가지 정직한 비교 | 서울비디치과</title>
  <meta name="description" content="브릿지 vs 임플란트, 틀니 vs 임플란트, 장치교정 vs 인비절라인… 헷갈리는 치과 치료 ${all.length}가지를 치과가 정직하게 비교했습니다. 비용 구조·수명·통증·유지관리까지 비교표로 한눈에.">
  <meta name="keywords" content="브릿지 임플란트 비교, 틀니 임플란트, 인비절라인 교정 비교, 라미네이트 크라운, 치과 치료 비교">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="ko" href="${url}">
  <link rel="alternate" hreflang="x-default" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta property="og:title" content="치과 치료 비교백서 — ${all.length}가지 정직한 비교 | 서울비디치과">
  <meta property="og:description" content="헷갈리는 치과 치료 ${all.length}가지를 치과가 정직하게 비교표로 정리했습니다.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
  <link rel="stylesheet" href="/css/site-v5.css?v=24a633b2">
${STYLES}
  <style>
    .hub-intro{max-width:900px;margin:48px auto 0;padding:0 24px}
    .hub-cat{max-width:900px;margin:0 auto;padding:40px 24px 8px}
    .hub-cat h2{font-size:1.5rem;font-weight:800;color:#1a1917;margin-bottom:20px;padding-bottom:10px;border-bottom:3px solid #7EA9C8}
    .hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
    .hub-card{position:relative;display:flex;flex-direction:column;gap:8px;background:#fff;border:1px solid #e8e0d6;border-radius:14px;padding:22px 24px;text-decoration:none;transition:all 0.2s}
    .hub-card:hover{border-color:#7EA9C8;transform:translateY(-3px);box-shadow:0 6px 16px rgba(126,169,200,0.18)}
    .hub-card .hc-icon{font-size:1.5rem}
    .hub-card strong{color:#1a1917;font-size:1.02rem;line-height:1.5}
    .hub-card strong em{color:#7EA9C8;font-style:normal;font-weight:900;font-size:0.85rem;margin:0 4px}
    .hub-card .hc-desc{color:#6b645c;font-size:0.85rem;line-height:1.6}
    .hub-card .hc-arrow{position:absolute;right:20px;bottom:16px;color:#7EA9C8;font-weight:900}
    .hub-regret-banner{max-width:852px;margin:48px auto;padding:0 24px}
  </style>
  <script type="application/ld+json">${itemListLd}</script>
  <script type="application/ld+json">${breadcrumbLd}</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<header class="guide-hero">
  <div class="container">
    <div class="breadcrumb" style="margin-bottom:16px"><a href="/" style="color:rgba(255,255,255,0.5);text-decoration:none">홈</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><a href="/guide/" style="color:rgba(255,255,255,0.5);text-decoration:none">가이드</a><span class="sep" style="color:rgba(255,255,255,0.3);margin:0 8px">/</span><span style="color:#7EA9C8">비교백서</span></div>
    <div class="guide-badge"><i class="fas fa-scale-balanced"></i> 치과가 정직하게 비교합니다</div>
    <h1>치과 치료 <span class="kw-a">비교백서</span> — 헷갈리는 선택 ${all.length}가지, 비교표로 끝냅니다</h1>
    <p class="lead">브릿지냐 임플란트냐, 장치교정이냐 인비절라인이냐. 검색할수록 헷갈리는 이유는 광고가 한쪽 편만 들기 때문입니다. 서울비디치과는 양쪽의 장단점·비용 구조·수명·유지관리를 그대로 보여드립니다. 정답은 환자분 상태가 정합니다.</p>
    <div class="guide-meta">
      <span><i class="fas fa-user-md"></i> 서울비디치과 의료진 작성</span>
      <span><i class="fas fa-calendar"></i> ${TODAY.slice(0, 7).replace('-', '년 ')}월 기준</span>
      <span><i class="fas fa-scale-balanced"></i> 총 ${all.length}가지 비교</span>
    </div>
  </div>
</header>

<main>
${catSections}

<div class="hub-regret-banner">
  <a href="/guide/regret" style="display:block;background:#fdf4f2;border:1px solid #efd5cf;border-left:6px solid #9a3b2e;border-radius:16px;padding:26px 30px;text-decoration:none;">
    <strong style="display:block;color:#9a3b2e;font-size:1.1rem;margin-bottom:6px;"><i class="fas fa-heart-crack"></i> 비교했다면, 이제 후회 사례를 확인할 차례</strong>
    <span style="color:#6b645c;font-size:0.92rem;line-height:1.7;">치료별 후회 이유와 부작용을 치과가 먼저 정리한 후회 백서 ${Object.keys(loadRegretMeta()).length}편 →</span>
  </a>
</div>

<div class="guide-body">
<div class="cta-card">
  <h3><i class="fas fa-comments"></i> 비교표로도 결정이 어렵다면</h3>
  <p>검진 후 환자분 상태 기준으로 어느 쪽이 맞는지 정직하게 말씀드립니다. 필요 없는 치료를 권하지 않습니다.</p>
  <div class="btn-group">
    <a href="/reservation" class="btn-primary"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>
    <a href="/symptom-checker" class="btn-secondary"><i class="fas fa-stethoscope"></i> AI 증상체커</a>
  </div>
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
const regretMeta = loadRegretMeta();

for (const d of all) {
  const html = buildPage(d, all, regretMeta);
  fs.writeFileSync(path.join(OUT_DIR, `${d.slug}.html`), html);
  console.log(`✅ guide/compare/${d.slug}.html (${(html.length / 1024).toFixed(1)}KB) — ${d.title}`);
}
fs.writeFileSync(path.join(ROOT, 'guide/compare.html'), buildHub(all));
console.log(`✅ guide/compare.html (허브)`);
console.log(`\n총 ${all.length}개 비교백서 페이지 + 허브 생성 완료`);
