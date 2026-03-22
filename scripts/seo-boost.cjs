/**
 * SEO 일괄 강화 스크립트
 * 3대 핵심 진료 (임플란트, 인비절라인, 라미네이트) 키워드를 사이트 전반에 녹여넣기
 */
const fs = require('fs');
const path = require('path');

// === 1. 진료안내 (treatments/index.html) ===
function updateTreatmentsIndex() {
  const file = 'treatments/index.html';
  let html = fs.readFileSync(file, 'utf-8');

  html = html.replace(
    '<title>진료 안내 | 서울비디치과</title>',
    '<title>진료 안내 | 천안 임플란트·인비절라인·라미네이트 — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1서울비디치과 진료 안내 — 천안 임플란트(6개 수술실), 인비절라인 교정(다이아몬드 프로바이더), 글로우네이트(라미네이트), 소아치과 전문의 3인. 서울대 15인 원장 협진.$3'
  );
  html = html.replace(
    /(<meta name="keywords" content=")([^"]*)(">)/,
    '$1천안 임플란트, 천안 인비절라인, 천안 라미네이트, 천안치과 진료, 글로우네이트, 서울비디치과, 천안 교정, 천안 소아치과, 심미치료$3'
  );
  // OG
  html = html.replace(
    /(<meta property="og:title" content=")진료 안내 \| 서울비디치과(")/,
    '$1진료 안내 | 천안 임플란트·인비절라인·라미네이트 — 서울비디치과$2'
  );
  html = html.replace(
    /(<meta property="og:description" content=")([^"]*)(">)/,
    '$1서울비디치과 진료 안내 — 임플란트, 인비절라인 교정, 글로우네이트(라미네이트), 소아치과 등 전 분야 진료.$3'
  );
  // Twitter
  html = html.replace(
    /(<meta name="twitter:title" content=")진료 안내 \| 서울비디치과(")/,
    '$1진료 안내 | 천안 임플란트·인비절라인·라미네이트 — 서울비디치과$2'
  );
  html = html.replace(
    /(<meta name="twitter:description" content=")([^"]*)(">)/,
    '$1서울비디치과 진료 안내 — 임플란트, 인비절라인 교정, 글로우네이트(라미네이트), 소아치과 등 전 분야.$3'
  );

  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ treatments/index.html');
}

// === 2. 임플란트 페이지 ===
function updateImplant() {
  const file = 'treatments/implant.html';
  let html = fs.readFileSync(file, 'utf-8');

  html = html.replace(
    '<title>임플란트 | 천안임플란트 | 서울비디치과</title>',
    '<title>천안 임플란트 잘하는 곳 | 네비게이션 임플란트 — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1천안 임플란트 전문 서울비디치과 — 6개 독립 수술실, 네비게이션 임플란트, 수면 임플란트. 서울대 15인 원장 협진으로 고난도 케이스까지 안전하게. 365일 진료 ☎041-415-2892$3'
  );
  // keywords가 없으면 author 앞에 추가
  if (!html.includes('name="keywords"')) {
    html = html.replace(
      '<meta name="author"',
      '<meta name="keywords" content="천안 임플란트, 천안 임플란트 잘하는 곳, 임플란트 비용, 네비게이션 임플란트, 수면 임플란트, 서울비디치과 임플란트, 아산 임플란트, 세종 임플란트, 임플란트 후기">\n  <meta name="author"'
    );
  }
  // OG
  html = html.replace(
    /(<meta property="og:title" content=")임플란트 \| 천안임플란트 \| 서울비디치과(")/,
    '$1천안 임플란트 잘하는 곳 | 네비게이션 임플란트 — 서울비디치과$2'
  );
  html = html.replace(
    /(<meta property="og:description" content=")([^"]*)(">)/,
    '$1천안 임플란트 전문 — 6개 독립 수술실, 네비게이션 임플란트, 수면 임플란트. 서울대 15인 원장 협진.$3'
  );
  // Twitter
  if (html.includes('twitter:title')) {
    html = html.replace(
      /(<meta name="twitter:title" content=")([^"]*)(">)/,
      '$1천안 임플란트 잘하는 곳 | 서울비디치과$3'
    );
    html = html.replace(
      /(<meta name="twitter:description" content=")([^"]*)(">)/,
      '$1천안 임플란트 전문 — 6개 수술실, 네비게이션·수면 임플란트. 서울대 15인 원장 ☎041-415-2892$3'
    );
  }

  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ treatments/implant.html');
}

// === 3. 인비절라인 페이지 ===
function updateInvisalign() {
  const file = 'treatments/invisalign.html';
  let html = fs.readFileSync(file, 'utf-8');

  html = html.replace(
    '<title>치아교정(인비절라인) | 천안치과교정 | 서울비디치과</title>',
    '<title>천안 인비절라인 | 치아교정 잘하는 곳 — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1천안 인비절라인 전문 서울비디치과 — 다이아몬드 프로바이더, 서울대 교정 전문의 상주, ClinCheck 3D 시뮬레이션. 투명교정 인비절라인으로 편안한 교정 치료. 1층 전용 교정센터.$3'
  );
  if (!html.includes('name="keywords"')) {
    html = html.replace(
      '<meta name="author"',
      '<meta name="keywords" content="천안 인비절라인, 천안 치아교정, 인비절라인 잘하는 곳, 투명교정, 인비절라인 비용, 서울비디치과 교정, 아산 인비절라인, 세종 인비절라인, 인비절라인 후기, 다이아몬드 프로바이더">\n  <meta name="author"'
    );
  } else {
    html = html.replace(
      /(<meta name="keywords" content=")([^"]*)(">)/,
      '$1천안 인비절라인, 천안 치아교정, 인비절라인 잘하는 곳, 투명교정, 인비절라인 비용, 서울비디치과 교정, 아산 인비절라인, 세종 인비절라인, 인비절라인 후기, 다이아몬드 프로바이더$3'
    );
  }
  // OG
  html = html.replace(
    /(<meta property="og:title" content=")[^"]*(")/,
    '$1천안 인비절라인 | 치아교정 잘하는 곳 — 서울비디치과$2'
  );
  html = html.replace(
    /(<meta property="og:description" content=")([^"]*)(">)/,
    '$1천안 인비절라인 — 다이아몬드 프로바이더, 서울대 교정 전문의, ClinCheck 3D 시뮬레이션. 1층 전용 교정센터.$3'
  );
  // Twitter
  if (html.includes('twitter:title')) {
    html = html.replace(
      /(<meta name="twitter:title" content=")([^"]*)(">)/,
      '$1천안 인비절라인 | 치아교정 잘하는 곳 — 서울비디치과$3'
    );
    html = html.replace(
      /(<meta name="twitter:description" content=")([^"]*)(">)/,
      '$1천안 인비절라인 전문 — 다이아몬드 프로바이더, 서울대 교정 전문의. ☎041-415-2892$3'
    );
  }

  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ treatments/invisalign.html');
}

// === 4. 비용안내 ===
function updatePricing() {
  const file = 'pricing.html';
  let html = fs.readFileSync(file, 'utf-8');

  html = html.replace(
    '<title>비용 안내 | 서울비디치과</title>',
    '<title>비용 안내 | 천안 임플란트·인비절라인·라미네이트 비용 — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1서울비디치과 비용 안내 — 천안 임플란트, 인비절라인 교정, 글로우네이트(라미네이트) 비용을 투명하게 안내합니다. 추가 비용 없는 정직한 견적서 제공. ☎041-415-2892$3'
  );
  if (html.includes('name="keywords"')) {
    html = html.replace(
      /(<meta name="keywords" content=")([^"]*)(">)/,
      '$1천안 임플란트 비용, 인비절라인 비용, 라미네이트 비용, 천안치과 비용, 글로우네이트 비용, 서울비디치과 가격, 임플란트 가격, 교정 비용$3'
    );
  } else {
    html = html.replace(
      '<meta name="author"',
      '<meta name="keywords" content="천안 임플란트 비용, 인비절라인 비용, 라미네이트 비용, 천안치과 비용, 글로우네이트 비용, 서울비디치과 가격, 임플란트 가격, 교정 비용">\n  <meta name="author"'
    );
  }
  // OG
  html = html.replace(
    /(<meta property="og:title" content=")비용 안내 \| 서울비디치과(")/,
    '$1비용 안내 | 천안 임플란트·인비절라인·라미네이트 — 서울비디치과$2'
  );
  html = html.replace(
    /(<meta property="og:description" content=")([^"]*)(">)/,
    '$1천안 임플란트·인비절라인·라미네이트 비용 투명 안내. 추가 비용 없는 정직한 견적서.$3'
  );

  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ pricing.html');
}

// === 5. 예약 ===
function updateReservation() {
  const file = 'reservation.html';
  let html = fs.readFileSync(file, 'utf-8');

  html = html.replace(
    '<title>예약/상담 | 서울비디치과</title>',
    '<title>예약/상담 | 천안 임플란트·인비절라인·라미네이트 예약 — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1서울비디치과 온라인 예약 — 임플란트, 인비절라인 교정, 글로우네이트(라미네이트) 상담 예약. 365일 진료, 평일 야간 20시까지. ☎041-415-2892$3'
  );
  if (html.includes('name="keywords"')) {
    html = html.replace(
      /(<meta name="keywords" content=")([^"]*)(">)/,
      '$1천안치과 예약, 임플란트 상담, 인비절라인 상담, 라미네이트 상담, 서울비디치과 예약, 천안 치과 예약$3'
    );
  } else {
    html = html.replace(
      '<meta name="author"',
      '<meta name="keywords" content="천안치과 예약, 임플란트 상담, 인비절라인 상담, 라미네이트 상담, 서울비디치과 예약, 천안 치과 예약">\n  <meta name="author"'
    );
  }

  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ reservation.html');
}

// === 6. FAQ 페이지들 ===
function updateFAQ() {
  // faq.html
  let file = 'faq.html';
  let html = fs.readFileSync(file, 'utf-8');
  html = html.replace(
    '<title>자주 묻는 질문 | 서울비디치과</title>',
    '<title>자주 묻는 질문 | 천안 임플란트·인비절라인·라미네이트 FAQ — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1서울비디치과 자주 묻는 질문 — 천안 임플란트, 인비절라인 교정, 라미네이트 비용·기간·후기 관련 FAQ를 안내합니다.$3'
  );
  html = html.replace(
    /(<meta name="keywords" content=")([^"]*)(">)/,
    '$1천안치과 FAQ, 임플란트 질문, 인비절라인 질문, 라미네이트 질문, 교정 비용, 임플란트 비용, 서울비디치과$3'
  );
  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ faq.html');

  // faq/implant.html
  file = 'faq/implant.html';
  html = fs.readFileSync(file, 'utf-8');
  html = html.replace(
    '<title>임플란트 FAQ | 서울비디치과</title>',
    '<title>임플란트 자주 묻는 질문 | 천안 임플란트 FAQ — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="keywords" content=")([^"]*)(">)/,
    '$1임플란트 FAQ, 천안 임플란트 질문, 임플란트 비용, 임플란트 수명, 임플란트 통증, 서울비디치과$3'
  );
  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ faq/implant.html');

  // faq/orthodontics.html
  file = 'faq/orthodontics.html';
  html = fs.readFileSync(file, 'utf-8');
  html = html.replace(
    '<title>교정 FAQ | 서울비디치과</title>',
    '<title>인비절라인·교정 자주 묻는 질문 | 천안 교정 FAQ — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="keywords" content=")([^"]*)(">)/,
    '$1교정 FAQ, 인비절라인 질문, 천안 교정, 인비절라인 비용, 투명교정, 서울비디치과 교정$3'
  );
  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ faq/orthodontics.html');
}

// === 7. 지역 랜딩페이지 16개 ===
function updateAreaPages() {
  const areas = [
    { file: 'area/cheonan.html',   name: '천안', nameKw: '천안' },
    { file: 'area/buldang.html',   name: '불당동', nameKw: '불당동' },
    { file: 'area/asan.html',      name: '아산', nameKw: '아산' },
    { file: 'area/sejong.html',    name: '세종', nameKw: '세종' },
    { file: 'area/daejeon.html',   name: '대전', nameKw: '대전' },
    { file: 'area/cheongju.html',  name: '청주', nameKw: '청주' },
    { file: 'area/pyeongtaek.html',name: '평택', nameKw: '평택' },
    { file: 'area/anseong.html',   name: '안성', nameKw: '안성' },
    { file: 'area/chungju.html',   name: '충주', nameKw: '충주' },
    { file: 'area/dangjin.html',   name: '당진', nameKw: '당진' },
    { file: 'area/gongju.html',    name: '공주', nameKw: '공주' },
    { file: 'area/hongseong.html', name: '홍성', nameKw: '홍성' },
    { file: 'area/jincheon.html',  name: '진천', nameKw: '진천' },
    { file: 'area/nonsan.html',    name: '논산', nameKw: '논산' },
    { file: 'area/seosan.html',    name: '서산', nameKw: '서산' },
    { file: 'area/yesan.html',     name: '예산', nameKw: '예산' },
  ];

  areas.forEach(({ file: f, name, nameKw }) => {
    let html = fs.readFileSync(f, 'utf-8');

    // title: "OO 치과 추천" → "OO 치과 | 임플란트·인비절라인·라미네이트 추천"
    html = html.replace(
      `<title>${name} 치과 추천 | 서울비디치과</title>`,
      `<title>${name} 치과 | 임플란트·인비절라인·라미네이트 — 서울비디치과</title>`
    );

    // description: 라미네이트·인비절라인 추가
    html = html.replace(
      /임플란트·교정 추천\./,
      '임플란트·인비절라인·라미네이트 추천.'
    );

    // keywords: 라미네이트·인비절라인 추가
    html = html.replace(
      new RegExp(`${nameKw} 치과, ${nameKw} 임플란트, ${nameKw} 교정, ${nameKw} 치과 추천`),
      `${nameKw} 치과, ${nameKw} 임플란트, ${nameKw} 인비절라인, ${nameKw} 라미네이트, ${nameKw} 교정, ${nameKw} 치과 추천`
    );

    // OG title
    const ogOld = `<meta property="og:title" content="${name} 치과 추천 | 서울비디치과">`;
    const ogNew = `<meta property="og:title" content="${name} 치과 | 임플란트·인비절라인·라미네이트 — 서울비디치과">`;
    html = html.replace(ogOld, ogNew);

    // OG description
    if (html.includes('og:description')) {
      html = html.replace(
        /(<meta property="og:description" content=")([^"]*임플란트·교정)([^"]*)(">)/,
        '$1$2·인비절라인·라미네이트$3$4'
      );
    }

    // Twitter title
    if (html.includes('twitter:title')) {
      const twitterOld = `<meta name="twitter:title" content="${name} 치과 추천 | 서울비디치과">`;
      const twitterNew = `<meta name="twitter:title" content="${name} 치과 | 임플란트·인비절라인·라미네이트 — 서울비디치과">`;
      html = html.replace(twitterOld, twitterNew);
    }

    fs.writeFileSync(f, html, 'utf-8');
    console.log(`✅ ${f}`);
  });
}

// === 8. 의료진 페이지 ===
function updateDoctors() {
  // doctors/index.html
  let file = 'doctors/index.html';
  let html = fs.readFileSync(file, 'utf-8');
  html = html.replace(
    '<title>의료진 소개 | 서울비디치과</title>',
    '<title>의료진 소개 | 천안 임플란트·인비절라인·라미네이트 전문의 — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1서울비디치과 의료진 소개 — 서울대 출신 15인 원장 협진. 임플란트, 인비절라인 교정, 라미네이트(글로우네이트) 각 분야 전문의가 최적의 치료를 제공합니다.$3'
  );
  if (html.includes('name="keywords"')) {
    html = html.replace(
      /(<meta name="keywords" content=")([^"]*)(">)/,
      '$1서울비디치과 의료진, 천안 치과 원장, 임플란트 전문의, 교정 전문의, 라미네이트 전문의, 서울대 치과의사$3'
    );
  }
  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ doctors/index.html');

  // doctors/moon.html
  file = 'doctors/moon.html';
  html = fs.readFileSync(file, 'utf-8');
  html = html.replace(
    '<title>문석준 원장 | 서울비디치과</title>',
    '<title>문석준 원장 | 천안 임플란트·인비절라인·라미네이트 — 서울비디치과 대표원장</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1서울비디치과 문석준 대표원장 — 서울대 통합치의학과 전문의. 천안 임플란트·인비절라인·글로우네이트(라미네이트) 전문. 페이션트 퍼널 창립자. ☎041-415-2892$3'
  );
  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ doctors/moon.html');
}

// === 9. 오시는 길 ===
function updateDirections() {
  const file = 'directions.html';
  let html = fs.readFileSync(file, 'utf-8');
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1천안 임플란트·인비절라인·라미네이트 전문 서울비디치과 오시는 길 — 충남 천안시 서북구 불당34길 14. 자가용, 대중교통, 주차 안내.$3'
  );
  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ directions.html');
}

// === 10. 심미치료 ===
function updateAesthetic() {
  const file = 'treatments/aesthetic.html';
  let html = fs.readFileSync(file, 'utf-8');
  html = html.replace(
    '<title>심미치료 | 천안심미치과 | 서울비디치과</title>',
    '<title>심미치료·라미네이트 | 천안 글로우네이트 — 서울비디치과</title>'
  );
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(">)/,
    '$1서울비디치과 심미치료 — 글로우네이트(라미네이트), 올세라믹, 잇몸성형 등 자연스럽고 아름다운 미소를 위한 맞춤 심미 치료. 천안 라미네이트 전문.$3'
  );
  if (html.includes('name="keywords"')) {
    html = html.replace(
      /(<meta name="keywords" content=")([^"]*)(">)/,
      '$1천안 심미치료, 천안 라미네이트, 글로우네이트, 올세라믹, 잇몸성형, 포세린 라미네이트, 서울비디치과 심미$3'
    );
  }
  fs.writeFileSync(file, html, 'utf-8');
  console.log('✅ treatments/aesthetic.html');
}

// 실행
console.log('🚀 SEO 일괄 강화 시작...\n');
updateTreatmentsIndex();
updateImplant();
updateInvisalign();
updatePricing();
updateReservation();
updateFAQ();
updateAreaPages();
updateDoctors();
updateDirections();
updateAesthetic();
console.log('\n✨ 전체 SEO 강화 완료!');
