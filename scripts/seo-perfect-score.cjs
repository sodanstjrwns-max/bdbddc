/**
 * SEO 100점 달성 스크립트 — 5개 감점 요인 동시 해결
 * 
 * 1. 지역 86페이지 내부 링크 블록 추가 (-3점)
 * 2. description 누락 페이지 수정 (-2점)
 * 3. hreflang 하부 27페이지 적용 (-2점)
 * 4. canonical 누락 페이지 수정 (-1점)
 * 5. /doctors 링크 trailing slash 통일 (-1점) → 사이트 전체 href="/doctors" → href="/doctors/"
 */

const fs = require('fs');
const path = require('path');

let stats = { areaLinks: 0, descriptions: 0, hreflangs: 0, canonicals: 0, doctorsFix: 0 };

// ═══════════════════════════════════════════
// 지역명 매핑
// ═══════════════════════════════════════════
const cityMap = {
  anseong: '안성', boryeong: '보령', buldang: '불당동', buyeo: '부여',
  cheongju: '청주', cheongyang: '청양', chungju: '충주', daejeon: '대전',
  dangjin: '당진', eumseong: '음성', geumsan: '금산', gongju: '공주',
  gyeryong: '계룡', hongseong: '홍성', jincheon: '진천', nonsan: '논산',
  okcheon: '옥천', osan: '오산', pyeongtaek: '평택', sejong: '세종',
  seocheon: '서천', seosan: '서산', taean: '태안', yeongdong: '영동',
  yeongi: '연기', yesan: '예산', asan: '아산', cheonan: '천안',
};

// ═══════════════════════════════════════════
// TASK 1: 지역 86페이지 내부 링크 블록
// ═══════════════════════════════════════════
function generateAreaLinkBlock(cityEn, cityKo, treatment) {
  // 기본 지역: 해당 도시의 진료특화 3개 + 주요 진료 허브 + 홈/천안/아산
  // 진료특화: 형제 진료특화 + 해당 도시 기본 + 진료 허브
  
  let links = [];
  const color = '#6B4226';
  const borderColor = '#d4c4b0';
  const linkStyle = `display:inline-block;padding:7px 14px;background:#fff;color:${color};border:1px solid ${borderColor};border-radius:20px;text-decoration:none;font-size:0.82rem;font-weight:600;transition:all .2s;`;
  const navStyle = `display:inline-block;padding:9px 18px;background:#fff;color:${color};border:1.5px solid ${color};border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;`;
  const primaryStyle = `display:inline-block;padding:9px 18px;background:${color};color:#fff;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;`;

  if (!treatment) {
    // 기본 지역 페이지 → 해당 도시 진료특화 3개 링크
    const hasImplant = fs.existsSync(path.join(__dirname, '..', 'area', `${cityEn}-implant.html`));
    const hasInvisalign = fs.existsSync(path.join(__dirname, '..', 'area', `${cityEn}-invisalign.html`));
    const hasLaminate = fs.existsSync(path.join(__dirname, '..', 'area', `${cityEn}-laminate.html`));
    
    if (hasImplant) links.push(`<a href="/area/${cityEn}-implant" style="${linkStyle}">🦷 ${cityKo} 임플란트</a>`);
    if (hasInvisalign) links.push(`<a href="/area/${cityEn}-invisalign" style="${linkStyle}">😁 ${cityKo} 인비절라인</a>`);
    if (hasLaminate) links.push(`<a href="/area/${cityEn}-laminate" style="${linkStyle}">✨ ${cityKo} 라미네이트</a>`);
  } else {
    // 진료특화 페이지 → 형제 진료특화 + 기본 지역
    const siblings = ['implant', 'invisalign', 'laminate'].filter(t => t !== treatment);
    const treatmentNames = { implant: '임플란트', invisalign: '인비절라인', laminate: '라미네이트' };
    const treatmentIcons = { implant: '🦷', invisalign: '😁', laminate: '✨' };
    
    // 기본 지역 페이지
    links.push(`<a href="/area/${cityEn}" style="${linkStyle}">📍 ${cityKo}에서 오시는 길</a>`);
    
    for (const sib of siblings) {
      const sibFile = path.join(__dirname, '..', 'area', `${cityEn}-${sib}.html`);
      if (fs.existsSync(sibFile)) {
        links.push(`<a href="/area/${cityEn}-${sib}" style="${linkStyle}">${treatmentIcons[sib]} ${cityKo} ${treatmentNames[sib]}</a>`);
      }
    }
  }

  // 인근 지역 (천안/아산 항상 포함)
  if (cityEn !== 'cheonan') links.push(`<a href="/area/cheonan" style="${linkStyle}">📍 천안치과 안내</a>`);
  if (cityEn !== 'asan') links.push(`<a href="/area/asan" style="${linkStyle}">📍 아산치과 안내</a>`);

  const linksHtml = links.map(l => `          ${l}`).join('\n');

  return `
    <!-- ═══════ 관련 페이지 바로가기 (내부 링크 SEO) ═══════ -->
    <section style="padding:48px 0 0;" aria-label="관련 페이지 안내">
      <div class="container">
        <div style="background:linear-gradient(135deg,#f8f5f1 0%,#f0ebe4 100%);border-radius:20px;padding:32px 24px;text-align:center;">
          <h3 style="font-size:1.15rem;color:${color};margin-bottom:8px;font-weight:800;"><i class="fas fa-link" style="margin-right:6px;"></i>${cityKo} 관련 진료 안내</h3>
          <p style="font-size:0.88rem;color:#8B7355;margin-bottom:18px;">서울비디치과의 진료과목과 오시는 길을 확인해보세요</p>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:20px;">
${linksHtml}
          </div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid #e0d5c8;">
            <a href="/" style="${primaryStyle}"><i class="fas fa-home"></i> 서울비디치과 홈</a>
            <a href="/treatments/implant" style="${navStyle}"><i class="fas fa-tooth"></i> 임플란트 안내</a>
            <a href="/treatments/invisalign" style="${navStyle}"><i class="fas fa-teeth"></i> 인비절라인 안내</a>
            <a href="/treatments/glownate" style="${navStyle}"><i class="fas fa-star"></i> 글로우네이트 안내</a>
            <a href="/pricing" style="${navStyle}"><i class="fas fa-won-sign"></i> 비용 안내</a>
            <a href="/doctors/" style="${navStyle}"><i class="fas fa-user-md"></i> 의료진 소개</a>
          </div>
        </div>
      </div>
    </section>
`;
}

function processAreaPages() {
  console.log('\n🔧 [TASK 1] 지역 86페이지 내부 링크 블록 추가...');
  const areaDir = path.join(__dirname, '..', 'area');
  const files = fs.readdirSync(areaDir).filter(f => f.endsWith('.html'));
  
  for (const file of files) {
    // cheonan, asan은 이미 있으므로 스킵
    if (file === 'cheonan.html' || file === 'asan.html') continue;
    
    const filePath = path.join(areaDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // 이미 존재하면 스킵
    if (html.includes('관련 페이지 바로가기 (내부 링크 SEO)')) {
      continue;
    }
    
    // 도시명, 진료 타입 파싱
    const basename = file.replace('.html', '');
    let cityEn, treatment;
    
    if (basename.includes('-implant')) {
      cityEn = basename.replace('-implant', '');
      treatment = 'implant';
    } else if (basename.includes('-invisalign')) {
      cityEn = basename.replace('-invisalign', '');
      treatment = 'invisalign';
    } else if (basename.includes('-laminate')) {
      cityEn = basename.replace('-laminate', '');
      treatment = 'laminate';
    } else {
      cityEn = basename;
      treatment = null;
    }
    
    const cityKo = cityMap[cityEn] || cityEn;
    const linkBlock = generateAreaLinkBlock(cityEn, cityKo, treatment);
    
    // CTA 직전에 삽입
    let insertIdx = html.indexOf('<!-- ═══════ CTA ═══════ -->');
    if (insertIdx === -1) insertIdx = html.indexOf('<section class="cta-section');
    
    if (insertIdx === -1) {
      console.log(`  ⚠️  ${file} — CTA 못 찾음`);
      continue;
    }
    
    html = html.slice(0, insertIdx) + linkBlock + '\n  ' + html.slice(insertIdx);
    fs.writeFileSync(filePath, html, 'utf8');
    stats.areaLinks++;
  }
  console.log(`  ✅ ${stats.areaLinks}개 지역 페이지에 내부 링크 블록 추가`);
}

// ═══════════════════════════════════════════
// TASK 2: description 누락 페이지 수정
// ═══════════════════════════════════════════
const descriptionFixes = {
  'public/demo-trends.html': { desc: '서울비디치과 데모 트렌드 대시보드 — 진료 트렌드 및 데이터 시각화.', canonical: '/demo-trends' },
  'public/report/gsc-dashboard.html': { desc: '서울비디치과 Google Search Console 대시보드 — SEO 성과 분석 및 검색 트래픽 모니터링.', canonical: '/report/gsc-dashboard' },
  'admin/cases.html': { desc: '서울비디치과 관리자 — 진료 케이스 관리.', canonical: null, robots: 'noindex, nofollow' },
  'admin/index.html': { desc: '서울비디치과 관리자 대시보드 — 병원 운영 관리 시스템.', canonical: null, robots: 'noindex, nofollow' },
  'admin/notices.html': { desc: '서울비디치과 관리자 — 공지사항 관리.', canonical: null, robots: 'noindex, nofollow' },
  'admin/columns.html': { desc: '서울비디치과 관리자 — 칼럼 관리.', canonical: null, robots: 'noindex, nofollow' },
  'admin/reservations.html': { desc: '서울비디치과 관리자 — 예약 관리.', canonical: null, robots: 'noindex, nofollow' },
  'admin/careers.html': { desc: '서울비디치과 관리자 — 채용 관리.', canonical: null, robots: 'noindex, nofollow' },
  'admin/intl-inquiries.html': { desc: '서울비디치과 관리자 — 해외 문의 관리.', canonical: null, robots: 'noindex, nofollow' },
  'column/columns.html': { desc: '서울비디치과 칼럼 — 치과 건강 정보, 치료 가이드, 치아 관리 팁 모음.', canonical: '/column/columns' },
  'column/index.html': { desc: '서울비디치과 칼럼 — 원장이 직접 알려주는 치과 건강 정보.', canonical: '/column' },
  'report/seo-audit-2026-04-29.html': { desc: '서울비디치과 SEO 감사 보고서 (2026-04-29) — 웹사이트 최적화 분석 결과.', canonical: '/report/seo-audit-2026-04-29' },
};

// canonical도 누락인 페이지 추가
const canonicalOnlyFixes = {
  'public/report/hospital-benchmark.html': { canonical: '/report/hospital-benchmark' },
};

function fixDescriptionsAndCanonicals() {
  console.log('\n🔧 [TASK 2+4] description/canonical 누락 수정...');
  
  const allFixes = { ...descriptionFixes };
  for (const [file, fix] of Object.entries(canonicalOnlyFixes)) {
    if (!allFixes[file]) allFixes[file] = {};
    allFixes[file].canonical = fix.canonical;
  }
  
  for (const [relPath, fix] of Object.entries(allFixes)) {
    const filePath = path.join(__dirname, '..', relPath);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  ${relPath} — 파일 없음`);
      continue;
    }
    
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // description 추가
    if (fix.desc && !html.includes('name="description"')) {
      const insertAfter = html.indexOf('<title>');
      if (insertAfter !== -1) {
        const titleEnd = html.indexOf('</title>', insertAfter) + '</title>'.length;
        const descTag = `\n  <meta name="description" content="${fix.desc}">`;
        html = html.slice(0, titleEnd) + descTag + html.slice(titleEnd);
        stats.descriptions++;
        changed = true;
      }
    }
    
    // canonical 추가
    if (fix.canonical && !html.includes('rel="canonical"')) {
      const insertAfter = html.indexOf('name="description"');
      if (insertAfter !== -1) {
        const descEnd = html.indexOf('>', insertAfter) + 1;
        const canonicalTag = `\n  <link rel="canonical" href="https://bdbddc.com${fix.canonical}">`;
        html = html.slice(0, descEnd) + canonicalTag + html.slice(descEnd);
        stats.canonicals++;
        changed = true;
      } else {
        // description도 없으면 title 뒤에
        const titleEnd = html.indexOf('</title>');
        if (titleEnd !== -1) {
          const pos = html.indexOf('>', titleEnd) + 1;
          const canonicalTag = `\n  <link rel="canonical" href="https://bdbddc.com${fix.canonical}">`;
          html = html.slice(0, pos) + canonicalTag + html.slice(pos);
          stats.canonicals++;
          changed = true;
        }
      }
    }
    
    // robots noindex for admin pages
    if (fix.robots && !html.includes('name="robots"')) {
      const insertPoint = html.includes('name="description"') 
        ? html.indexOf('>', html.indexOf('name="description"')) + 1
        : html.indexOf('</title>') + '</title>'.length;
      if (insertPoint > 0) {
        const robotsTag = `\n  <meta name="robots" content="${fix.robots}">`;
        html = html.slice(0, insertPoint) + robotsTag + html.slice(insertPoint);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`  ✅ ${relPath} — 수정 완료`);
    }
  }
  console.log(`  📊 description ${stats.descriptions}개, canonical ${stats.canonicals}개 추가`);
}

// ═══════════════════════════════════════════
// TASK 3: hreflang 하부 27개 페이지 적용
// ═══════════════════════════════════════════
function addHreflangs() {
  console.log('\n🔧 [TASK 3] hreflang 하부 27개 페이지 적용...');
  
  const treatmentFiles = [
    ...fs.readdirSync(path.join(__dirname, '..', 'treatments'))
      .filter(f => f.match(/^(implant-|fixture-|invisalign-|ortho-|orthodontic-).+\.html$/))
  ];
  
  for (const file of treatmentFiles) {
    const filePath = path.join(__dirname, '..', 'treatments', file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    if (html.includes('hreflang')) continue;
    
    const slug = file.replace('.html', '');
    const url = `https://bdbddc.com/treatments/${slug}`;
    
    // canonical 태그 뒤에 hreflang 삽입
    const canonicalIdx = html.indexOf('rel="canonical"');
    if (canonicalIdx === -1) continue;
    
    const canonicalEnd = html.indexOf('>', canonicalIdx) + 1;
    const hreflangTags = `\n  <link rel="alternate" hreflang="ko" href="${url}">\n  <link rel="alternate" hreflang="x-default" href="${url}">`;
    
    html = html.slice(0, canonicalEnd) + hreflangTags + html.slice(canonicalEnd);
    fs.writeFileSync(filePath, html, 'utf8');
    stats.hreflangs++;
  }
  console.log(`  ✅ ${stats.hreflangs}개 하부 페이지에 hreflang 추가`);
}

// ═══════════════════════════════════════════
// TASK 5: /doctors → /doctors/ trailing slash 통일
// ═══════════════════════════════════════════
function fixDoctorsLinks() {
  console.log('\n🔧 [TASK 5] /doctors 링크 trailing slash 통일...');
  
  const allHtml = [];
  function findHtml(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) findHtml(fullPath);
      else if (entry.name.endsWith('.html')) allHtml.push(fullPath);
    }
  }
  findHtml(path.join(__dirname, '..'));
  
  for (const filePath of allHtml) {
    let html = fs.readFileSync(filePath, 'utf8');
    // href="/doctors" (without trailing slash, not already /doctors/) → href="/doctors/"
    // But NOT /doctors/orthodontics etc.
    const regex = /href="\/doctors"(?!\/)/g;
    if (regex.test(html)) {
      html = html.replace(/href="\/doctors"(?!\/)/g, 'href="/doctors/"');
      fs.writeFileSync(filePath, html, 'utf8');
      stats.doctorsFix++;
    }
  }
  console.log(`  ✅ ${stats.doctorsFix}개 파일에서 /doctors → /doctors/ 수정`);
}

// ═══════════════════════════════════════════
// 실행
// ═══════════════════════════════════════════
console.log('🏆 SEO 100점 달성 스크립트 시작\n');

processAreaPages();
fixDescriptionsAndCanonicals();
addHreflangs();
fixDoctorsLinks();

console.log('\n' + '═'.repeat(50));
console.log('📊 최종 결과:');
console.log(`  지역 내부 링크 블록: ${stats.areaLinks}개`);
console.log(`  description 추가: ${stats.descriptions}개`);
console.log(`  hreflang 추가: ${stats.hreflangs}개`);
console.log(`  canonical 추가: ${stats.canonicals}개`);
console.log(`  /doctors 링크 수정: ${stats.doctorsFix}개 파일`);
console.log('═'.repeat(50));
