#!/usr/bin/env node
/**
 * 치료 페이지에 FAQ 아코디언 섹션 + FAQPage Schema.org 삽입
 * - treatments/*.html 파일에 </main> 직전에 FAQ 섹션 삽입
 * - <head>에 FAQPage 스키마 삽입
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'faq-data.json');
const treatmentsDir = path.join(__dirname, '..', 'treatments');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// slug 매핑 (치료 페이지 파일명 → FAQ 데이터 키)
const slugMap = {
  'implant.html': 'implant',
  'invisalign.html': 'invisalign',
  'orthodontics.html': 'orthodontics',
  'glownate.html': 'glownate',
  'sedation.html': 'sedation',
  'wisdom-tooth.html': 'wisdom-tooth',
  'pediatric.html': 'pediatric',
  'whitening.html': 'whitening',
  'cavity.html': 'cavity',
  'gum.html': 'gum',
  'tmj.html': 'tmj',
  'scaling.html': 'scaling',
  'root-canal.html': 'root-canal',
  'crown.html': 'crown',
  'denture.html': 'denture',
  'emergency.html': 'emergency'
};

// FAQ 아코디언 섹션 HTML 생성 (최대 5개 질문 + "더보기" 링크)
function generateFaqSection(slug, info) {
  const maxItems = 5;
  const faqs = info.faqs.slice(0, maxItems);
  const hasMore = info.faqs.length > maxItems;
  
  let faqItems = faqs.map((faq, i) => `          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="treat-faq-${i}">
              <span>${faq.q}</span>
              <i class="fas fa-chevron-down faq-toggle-icon"></i>
            </button>
            <div class="faq-answer" id="treat-faq-${i}">
              <p>${faq.a}</p>
            </div>
          </div>`).join('\n');

  return `
    <!-- ═══════ FAQ 섹션 (자동 삽입) ═══════ -->
    <section class="section faq-inline-section reveal">
      <div class="container">
        <h2 class="section-title"><i class="fas fa-question-circle"></i> ${info.title} 자주 묻는 질문</h2>
        <p class="section-subtitle">${info.title}에 대해 환자분들이 가장 많이 궁금해하시는 질문들입니다</p>
        <div class="faq-category" style="max-width:800px;margin:0 auto;">
${faqItems}
        </div>
${hasMore ? `        <div style="text-align:center;margin-top:2rem;">
          <a href="/faq/${slug}" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:0.5rem;">
            <i class="fas fa-list"></i> ${info.title} FAQ 전체보기 (${info.faqs.length}개)
          </a>
        </div>` : ''}
      </div>
    </section>`;
}

// FAQPage Schema.org JSON-LD 생성 (최대 5개)
function generateFaqSchema(faqs, maxItems = 5) {
  const items = faqs.slice(0, maxItems);
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
  return JSON.stringify(schema, null, 2);
}

let injected = 0;
let skippedNoFile = 0;
let skippedExisting = 0;

for (const [fileName, slug] of Object.entries(slugMap)) {
  const filePath = path.join(treatmentsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  파일 없음: treatments/${fileName}`);
    skippedNoFile++;
    continue;
  }
  
  let html = fs.readFileSync(filePath, 'utf-8');
  const info = data[slug];
  
  if (!info) {
    console.log(`⚠️  FAQ 데이터 없음: ${slug}`);
    continue;
  }
  
  // 이미 삽입된 경우 스킵
  if (html.includes('faq-inline-section')) {
    console.log(`⏭️  이미 삽입됨: treatments/${fileName}`);
    skippedExisting++;
    continue;
  }
  
  // 1. FAQ 아코디언 섹션을 section-cta 직전 또는 </main> 직전에 삽입
  const faqSection = generateFaqSection(slug, info);
  
  // section-cta 앞에 삽입 (CTA보다 먼저 보이도록)
  if (html.includes('<section class="section-cta')) {
    html = html.replace(
      /(\s*<section class="section-cta)/,
      faqSection + '\n$1'
    );
  } else if (html.includes('</main>')) {
    // fallback: </main> 직전에 삽입
    html = html.replace('</main>', faqSection + '\n  </main>');
  } else {
    console.log(`⚠️  삽입 지점 못 찾음: treatments/${fileName}`);
    continue;
  }
  
  // 2. FAQPage 스키마를 </head> 직전에 삽입
  if (!html.includes('"@type": "FAQPage"') && !html.includes('"@type":"FAQPage"')) {
    const schema = generateFaqSchema(info.faqs);
    const schemaTag = `<script type="application/ld+json">\n${schema}\n</script>\n`;
    html = html.replace('</head>', schemaTag + '</head>');
  }
  
  // 3. FAQ 토글 스크립트가 없으면 추가
  if (!html.includes('faq-question') || !html.includes("aria-expanded==='true'")) {
    // 이미 있는 DOMContentLoaded 이벤트 찾기
    if (!html.includes("querySelectorAll('.faq-question')")) {
      const faqScript = `
  <script>
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('.faq-question').forEach(function(btn){
      btn.addEventListener('click',function(){
        var item=this.parentElement;
        var expanded=this.getAttribute('aria-expanded')==='true';
        document.querySelectorAll('.faq-inline-section .faq-item.active').forEach(function(i){
          i.classList.remove('active');
          i.querySelector('.faq-question').setAttribute('aria-expanded','false');
        });
        if(!expanded){item.classList.add('active');this.setAttribute('aria-expanded','true');}
      });
    });
  });
  </script>`;
      html = html.replace('</body>', faqScript + '\n</body>');
    }
  }
  
  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✅ 삽입 완료: treatments/${fileName} (${Math.min(5, info.faqs.length)} FAQs + Schema)`);
  injected++;
}

console.log(`\n📊 결과: ${injected}개 치료 페이지에 FAQ 삽입, ${skippedExisting}개 이미 존재, ${skippedNoFile}개 파일 없음`);
