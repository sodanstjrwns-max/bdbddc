/**
 * 서울비디치과 진료 안내 하부 24개 페이지 풀 리컨스트럭션
 * 
 * 전략:
 * 1. 각 페이지의 <main> 내부 본문 콘텐츠를 추출
 * 2. Hero 섹션은 통일된 구조로 재생성 (기존 텍스트 보존)
 * 3. 본문 섹션들은 통일된 CSS 클래스 구조로 래핑
 * 4. CTA, 푸터, 모바일 네비 등은 index.html에서 가져와 통일
 * 5. FAQ 섹션은 통일된 구조로 재래핑
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TREATMENTS_DIR = path.join(__dirname, 'public', 'treatments');
const CSS_PATH = path.join(__dirname, 'public', 'css', 'site-v5.css');

// Generate CSS cache bust hash
const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
const cssHash = crypto.createHash('md5').update(cssContent).digest('hex').substring(0, 8);

// Read index.html for template parts
const indexHtml = fs.readFileSync(path.join(TREATMENTS_DIR, 'index.html'), 'utf8');

// Extract header from index.html (everything from <header to </header> + header-spacer)
const headerMatch = indexHtml.match(/<header class="site-header"[\s\S]*?<\/header>\s*<div class="header-spacer"><\/div>/);
const HEADER_HTML = headerMatch ? headerMatch[0] : '';

// Extract footer
const footerMatch = indexHtml.match(/<footer class="footer"[\s\S]*?<\/footer>/);
const FOOTER_HTML = footerMatch ? footerMatch[0] : '';

// Extract mobile nav + overlay + floating CTA + mobile bottom CTA + scripts
const afterFooterMatch = indexHtml.match(/<nav class="mobile-nav"[\s\S]*?<\/html>/);
let AFTER_FOOTER = afterFooterMatch ? afterFooterMatch[0].replace('</html>', '').replace('</body>', '') : '';
// Remove script tags from AFTER_FOOTER to avoid duplication (we add them at the end)
AFTER_FOOTER = AFTER_FOOTER.replace(/<script src="\.\.\/js\/main\.js"[^>]*><\/script>/g, '');
AFTER_FOOTER = AFTER_FOOTER.replace(/<script src="\.\.\/js\/gnb\.js"[^>]*><\/script>/g, '');
// Remove inline reveal/FAQ scripts
AFTER_FOOTER = AFTER_FOOTER.replace(/<script>\s*document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>/g, '');

// CTA section (shared)
function generateCTA(treatmentName) {
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

// Get all treatment HTML files (except index.html)
const files = fs.readdirSync(TREATMENTS_DIR)
  .filter(f => f.endsWith('.html') && f !== 'index.html');

console.log(`\n🔨 Starting full reconstruction of ${files.length} treatment pages...\n`);

let rebuilt = 0;
let errors = [];

files.forEach(file => {
  const name = file.replace('.html', '');
  const filePath = path.join(TREATMENTS_DIR, file);
  const html = fs.readFileSync(filePath, 'utf8');

  try {
    // ═══════ Extract metadata ═══════
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || `${name} | 서울비디치과`;
    const desc = html.match(/name="description" content="([^"]+)"/)?.[1] || '';
    const keywords = html.match(/name="keywords" content="([^"]+)"/)?.[1] || '';
    
    // Extract treatment display name from title
    const treatmentName = title.replace(' | 서울비디치과', '');

    // ═══════ Extract Hero content ═══════
    const heroH1Match = html.match(/<h1 class="hero-headline[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
    const heroH1 = heroH1Match ? heroH1Match[1].trim() : `<span class="text-gradient">${treatmentName}</span>`;
    
    const heroSubMatch = html.match(/<p class="hero-sub[^"]*"[^>]*>([\s\S]*?)<\/p>/);
    let heroSub = heroSubMatch ? heroSubMatch[1].trim() : desc;
    // Clean up hero sub - take only first sentence if too long (remove duplicate text)
    if (heroSub.length > 200) {
      // Find the first period or line break
      const firstBreak = heroSub.search(/\.\s|<br|。/);
      if (firstBreak > 50 && firstBreak < 200) {
        heroSub = heroSub.substring(0, firstBreak + 1);
      }
    }

    // Hero CTA text
    const heroCTAMatch = html.match(/hero-cta-group[\s\S]*?<a[^>]*class="btn btn-primary[^"]*"[^>]*>([\s\S]*?)<\/a>/);
    const heroCTAText = heroCTAMatch ? heroCTAMatch[1].trim() : `<i class="fas fa-calendar-check"></i> 상담 예약하기`;

    // ═══════ Extract body sections (between hero and CTA/footer) ═══════
    let bodyContent = '';
    
    // Strategy: find all <section> tags after the hero, before CTA
    const allSections = html.match(/<section[\s\S]*?<\/section>/g) || [];
    
    // Filter out hero section and CTA section
    const contentSections = allSections.filter(s => {
      const isHero = s.includes('class="hero"');
      const isCTA = s.includes('class="cta-section"') || s.includes('cta-box');
      return !isHero && !isCTA;
    });

    // Process each section to ensure clean class structure
    bodyContent = contentSections.map(section => {
      // Ensure section has proper class
      let processed = section;
      
      // Replace old class patterns with unified ones
      // section-dark -> section bg-dark
      processed = processed.replace(/class="([^"]*?)section-dark([^"]*?)"/g, 'class="$1section bg-dark$2"');
      processed = processed.replace(/class="([^"]*?)section-gradient([^"]*?)"/g, 'class="$1section bg-secondary$2"');
      processed = processed.replace(/class="([^"]*?)alt-bg([^"]*?)"/g, 'class="$1bg-secondary$2"');
      
      // Ensure all sections have base "section" class
      if (!processed.includes('class="') || processed.match(/^<section>/)) {
        processed = processed.replace('<section>', '<section class="section">');
      }
      
      // Replace old section-title/desc patterns with unified ones  
      // section-desc -> section-subtitle
      processed = processed.replace(/class="section-desc"/g, 'class="section-subtitle"');
      
      // text-shimmer -> text-gradient (unified)
      processed = processed.replace(/text-shimmer/g, 'text-gradient');
      
      // Ensure section-header wrapper exists for section-badge + section-title combos
      // If section-badge is a div, change to span
      processed = processed.replace(/<div class="section-badge">/g, '<span class="section-badge">');
      processed = processed.replace(/<\/div>(\s*<h2 class="section-title")/g, '</span>$1');
      
      // data-animate -> reveal (for intersection observer)
      processed = processed.replace(/data-animate="[^"]*"/g, '');
      processed = processed.replace(/data-stagger/g, '');
      
      // Add reveal classes to cards that don't have them
      // empathy-card, difference-card, prevention-card etc
      const cardTypes = ['empathy-card', 'difference-card', 'prevention-card', 'stage-card', 'treatment-option', 'why-card', 'benefit-card', 'comparison-card', 'warning-card', 'tip-card', 'info-card'];
      cardTypes.forEach(cardClass => {
        const cardRegex = new RegExp(`class="(${cardClass})(?![^"]*reveal)`, 'g');
        processed = processed.replace(cardRegex, `class="$1 reveal`);
      });
      
      // Ensure FAQ items have unified structure
      // Fix FAQ buttons that don't have onclick handler
      processed = processed.replace(
        /<button class="faq-question"(?!\s+onclick)[^>]*>/g,
        '<button class="faq-question" onclick="this.parentElement.classList.toggle(\'open\')">'
      );
      
      // Fix faq-answer-content -> faq-answer (simplify)
      // Keep existing structure but ensure it works
      
      return processed;
    }).join('\n\n    ');

    // ═══════ Generate the unified page ═══════
    const breadcrumbJSON = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://bdbddc.com/" },
        { "@type": "ListItem", "position": 2, "name": treatmentName, "item": `https://bdbddc.com/treatments/${file}` }
      ]
    });

    const output = `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/treatments/${file}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/treatments/${file}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
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
  <link rel="stylesheet" href="../css/site-v5.css?v=${cssHash}">
  <link rel="prefetch" href="../reservation.html" as="document">
  <script type="application/ld+json">
  ${breadcrumbJSON}
  </script>
</head>
<body>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  ${HEADER_HTML}

  <main id="main-content" role="main">

  <!-- ═══════ HERO ═══════ -->
  <section class="hero" aria-label="${treatmentName}">
    <div class="hero-bg-pattern" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-1" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-2" aria-hidden="true"></div>
    
    <div class="container hero-content">
      <div class="hero-text">
        <p class="hero-brand-name reveal">SEOUL BD DENTAL CLINIC</p>
        
        <h1 class="hero-headline reveal delay-1">
          ${heroH1}
        </h1>
        
        <p class="hero-sub reveal delay-2">
          ${heroSub}
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
          <a href="../reservation.html" class="btn btn-primary btn-lg">${heroCTAText}</a>
          <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
        </div>
      </div>
    </div>
    
    <div class="hero-scroll-hint" aria-hidden="true">
      <span>SCROLL</span>
      <div class="scroll-line"></div>
    </div>
  </section>

    ${bodyContent}

${generateCTA(treatmentName)}
  
  </main>
  ${FOOTER_HTML}
  ${AFTER_FOOTER}
  <script src="../js/main.js" defer></script>
  <script src="../js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){var els=document.querySelectorAll('.reveal');if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});els.forEach(function(el){obs.observe(el);});});
    document.querySelectorAll('.faq-question').forEach(function(btn){btn.addEventListener('click',function(){this.parentElement.classList.toggle('open');});});
  </script>

</body>
</html>`;

    fs.writeFileSync(filePath, output, 'utf8');
    rebuilt++;
    
    // Validate output
    const openTags = (output.match(/<(section|article|div|main|header|footer|nav|aside)\b/g) || []).length;
    const closeTags = (output.match(/<\/(section|article|div|main|header|footer|nav|aside)>/g) || []).length;
    const diff = openTags - closeTags;
    const hasFAQ = output.includes('faq-item') || output.includes('faq-question');
    const hasCTA = output.includes('cta-section');
    
    const status = diff === 0 ? '✅' : `⚠️ diff=${diff}`;
    console.log(`${status} ${file} — sections: ${contentSections.length}, FAQ: ${hasFAQ ? 'yes' : 'no'}, CTA: ${hasCTA ? 'yes' : 'no'}, tags: ${openTags}/${closeTags}`);
    
    if (diff !== 0) {
      errors.push({ file, diff, openTags, closeTags });
    }

  } catch (err) {
    console.error(`❌ ${file}: ${err.message}`);
    errors.push({ file, error: err.message });
  }
});

console.log(`\n✨ Rebuilt: ${rebuilt}/${files.length} pages`);
if (errors.length > 0) {
  console.log(`⚠️  Issues: ${errors.length}`);
  errors.forEach(e => console.log(`   - ${e.file}: ${e.error || `tag diff=${e.diff}`}`));
}
console.log(`📎 CSS hash: ${cssHash}`);
