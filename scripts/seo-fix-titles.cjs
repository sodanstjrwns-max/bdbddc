#!/usr/bin/env node
/**
 * SEO 정화 스크립트 — 천안/아산 슈퍼업그레이드
 * 작업 A: 타지역 title/og:title/twitter:title의 "천안 서울비디치과" → "서울비디치과" 오염 제거
 * 작업 B: canonical / og:url 의 .html 제거 (실제 URL은 .html 없음, 301 리다이렉트됨)
 *
 * ※ 본문(body)의 "천안 서울비디치과"는 거점 명시로 SEO에 유익하므로 절대 건드리지 않음
 * ※ 천안 본진 페이지(cheonan, buldang)는 "천안" 유지가 정상이므로 title 오염제거 제외
 */
const fs = require('fs');
const path = require('path');

const AREA_DIR = path.join(__dirname, '..', 'area');
const files = fs.readdirSync(AREA_DIR).filter(f => f.endsWith('.html'));

// 천안 본진 — title에 '천안' 유지가 정상인 페이지 (오염제거 제외)
const CHEONAN_CORE = ['cheonan', 'buldang'];

let titleFixed = 0;
let canonicalFixed = 0;
let dupFixed = 0;

for (const file of files) {
  const slug = file.replace('.html', '');
  const fp = path.join(AREA_DIR, file);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  const isCheonanCore = CHEONAN_CORE.includes(slug);

  // ── 작업 A: <title>, og:title, twitter:title 안에서만 오염 제거 ──
  if (!isCheonanCore) {
    // 1) "천안에서 천안 서울비디치과" 같은 어색한 중복은 천안 본진에서만 처리(아래)
    // 2) 타지역: title류 메타에서 "천안 서울비디치과" → "서울비디치과"
    //    단, "...에서 천안 서울비디치과" 형태에서 '천안 '만 제거

    // <title>...</title>
    html = html.replace(/<title>([^<]*)<\/title>/g, (m, inner) => {
      const fixed = inner.replace(/천안 서울비디치과/g, '서울비디치과');
      if (fixed !== inner) titleFixed++;
      return `<title>${fixed}</title>`;
    });

    // og:title / twitter:title content="..."
    html = html.replace(/(property="og:title"\s+content=")([^"]*)(")/g,
      (m, p1, inner, p3) => p1 + inner.replace(/천안 서울비디치과/g, '서울비디치과') + p3);
    html = html.replace(/(name="twitter:title"\s+content=")([^"]*)(")/g,
      (m, p1, inner, p3) => p1 + inner.replace(/천안 서울비디치과/g, '서울비디치과') + p3);
  } else {
    // ── 천안 본진: 어색한 중복 "천안에서 천안 서울비디치과" → "천안에서 서울비디치과" ──
    const dupBefore = html;
    html = html.replace(/<title>([^<]*)<\/title>/g, (m, inner) => {
      return `<title>${inner.replace(/천안에서 천안 서울비디치과/g, '천안에서 서울비디치과')}</title>`;
    });
    html = html.replace(/(property="og:title"\s+content=")([^"]*)(")/g,
      (m, p1, inner, p3) => p1 + inner.replace(/천안에서 천안 서울비디치과/g, '천안에서 서울비디치과') + p3);
    html = html.replace(/(name="twitter:title"\s+content=")([^"]*)(")/g,
      (m, p1, inner, p3) => p1 + inner.replace(/천안에서 천안 서울비디치과/g, '천안에서 서울비디치과') + p3);
    if (html !== dupBefore) dupFixed++;
  }

  // ── 작업 B: canonical / og:url 의 .html 제거 ──
  // <link rel="canonical" href="https://bdbddc.com/area/xxx.html">
  html = html.replace(
    /(rel="canonical"\s+href="https:\/\/bdbddc\.com\/area\/[a-z0-9-]+)\.html(")/g,
    (m, p1, p3) => { canonicalFixed++; return p1 + p3; }
  );
  // <meta property="og:url" content="https://bdbddc.com/area/xxx.html">
  html = html.replace(
    /(property="og:url"\s+content="https:\/\/bdbddc\.com\/area\/[a-z0-9-]+)\.html(")/g,
    (m, p1, p3) => p1 + p3
  );

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
  }
}

console.log(`✅ SEO 정화 완료`);
console.log(`   - title류 "천안 서울비디치과"→"서울비디치과" 오염 제거: ${titleFixed}건`);
console.log(`   - 천안 본진 title 중복 "천안에서 천안"→"천안에서": ${dupFixed}건`);
console.log(`   - canonical/og:url .html 제거: ${canonicalFixed}건`);
