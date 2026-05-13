/**
 * SEO/AEO 강화 스크립트: 27개 하부 페이지에 내부 링크 블록 삽입
 * - 임플란트 15개 하부 페이지: 형제 임플란트 하부 링크 + 상위 페이지 링크
 * - 인비절라인/교정 12개 하부 페이지: 형제 인비절라인/교정 하부 링크 + 상위 페이지 링크
 * 삽입 위치: CTA 섹션 직전
 */

const fs = require('fs');
const path = require('path');

// ── 임플란트 하부 페이지 정의 ──
const implantPages = [
  { file: 'implant-sedation.html', name: '수면 임플란트', icon: '😴' },
  { file: 'implant-sinus-lift.html', name: '상악동거상술', icon: '🦴' },
  { file: 'implant-navigation.html', name: '네비게이션 임플란트', icon: '🎯' },
  { file: 'implant-immediate.html', name: '발치즉시 임플란트', icon: '⚡' },
  { file: 'implant-full-mouth.html', name: '전체 임플란트', icon: '🦷' },
  { file: 'implant-advanced.html', name: '고난도 임플란트', icon: '🏔️' },
  { file: 'implant-flapless.html', name: '비절개 임플란트', icon: '🔬' },
  { file: 'implant-revision.html', name: '임플란트 재수술', icon: '🔄' },
  { file: 'implant-hybrid.html', name: '올온4·올온6', icon: '🏗️' },
  { file: 'implant-immediate-loading.html', name: '즉시로딩 임플란트', icon: '⏱️' },
  { file: 'implant-overdenture.html', name: '임플란트 틀니', icon: '🦷' },
  { file: 'implant-holiday.html', name: '공휴일 임플란트', icon: '📅' },
  { file: 'fixture-straumann-roxolid.html', name: '스트라우만 임플란트', icon: '🇨🇭' },
  { file: 'fixture-osstem-ca.html', name: '오스템 CA 임플란트', icon: '🇰🇷' },
  { file: 'fixture-osstem-soi.html', name: '오스템 SOI 임플란트', icon: '🇰🇷' },
];

// ── 인비절라인/교정 하부 페이지 정의 ──
const invisalignPages = [
  { file: 'invisalign-best.html', name: '인비절라인 컴프리헨시브', icon: '💎' },
  { file: 'invisalign-moderate.html', name: '인비절라인 모더레이트', icon: '⚖️' },
  { file: 'invisalign-light.html', name: '인비절라인 라이트', icon: '🪶' },
  { file: 'invisalign-express.html', name: '인비절라인 익스프레스', icon: '⚡' },
  { file: 'invisalign-first.html', name: '인비절라인 퍼스트', icon: '👶' },
  { file: 'ortho-best.html', name: '브라켓교정 컴프리헨시브', icon: '🏆' },
  { file: 'ortho-moderate.html', name: '브라켓교정 모더레이트', icon: '📐' },
  { file: 'ortho-light.html', name: '브라켓교정 라이트', icon: '🍃' },
  { file: 'ortho-express.html', name: '브라켓교정 익스프레스', icon: '🚀' },
  { file: 'ortho-first.html', name: '브라켓교정 퍼스트', icon: '🧒' },
  { file: 'orthodontic-clarity-ultra.html', name: '클래리티 울트라', icon: '✨' },
  { file: 'orthodontic-clippy-c.html', name: '클리피씨 교정', icon: '🔗' },
];

function getUrlFromFile(file) {
  return '/treatments/' + file.replace('.html', '');
}

function generateImplantLinkBlock(currentFile) {
  // 형제 링크 (자기 자신 제외, 최대 8개)
  const siblings = implantPages
    .filter(p => p.file !== currentFile)
    .slice(0, 8);

  const siblingLinks = siblings.map(p =>
    `          <a href="${getUrlFromFile(p.file)}" style="display:inline-block;padding:7px 14px;background:#fff;color:#6B4226;border:1px solid #d4c4b0;border-radius:20px;text-decoration:none;font-size:0.82rem;font-weight:600;transition:all .2s;">${p.icon} ${p.name}</a>`
  ).join('\n');

  return `
    <!-- ═══════ 관련 진료 바로가기 (내부 링크 SEO/AEO) ═══════ -->
    <section style="padding:48px 0 0;" aria-label="관련 진료 안내">
      <div class="container">
        <div style="background:linear-gradient(135deg,#f8f5f1 0%,#f0ebe4 100%);border-radius:20px;padding:32px 24px;text-align:center;">
          <h3 style="font-size:1.2rem;color:#6B4226;margin-bottom:8px;font-weight:800;"><i class="fas fa-tooth" style="margin-right:6px;"></i>천안 임플란트 세부 진료 안내</h3>
          <p style="font-size:0.88rem;color:#8B7355;margin-bottom:18px;">서울비디치과의 다양한 임플란트 진료를 확인해보세요</p>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:20px;">
${siblingLinks}
          </div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid #e0d5c8;">
            <a href="/treatments/implant" style="display:inline-block;padding:9px 18px;background:#6B4226;color:#fff;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-tooth"></i> 임플란트 전체 안내</a>
            <a href="/" style="display:inline-block;padding:9px 18px;background:#fff;color:#6B4226;border:1.5px solid #6B4226;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-home"></i> 서울비디치과 홈</a>
            <a href="/area/cheonan" style="display:inline-block;padding:9px 18px;background:#fff;color:#6B4226;border:1.5px solid #6B4226;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-map-marker-alt"></i> 천안치과 안내</a>
            <a href="/area/asan" style="display:inline-block;padding:9px 18px;background:#fff;color:#6B4226;border:1.5px solid #6B4226;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-map-marker-alt"></i> 아산치과 안내</a>
            <a href="/pricing" style="display:inline-block;padding:9px 18px;background:#fff;color:#6B4226;border:1.5px solid #6B4226;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-won-sign"></i> 비용 안내</a>
            <a href="/doctors" style="display:inline-block;padding:9px 18px;background:#fff;color:#6B4226;border:1.5px solid #6B4226;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-user-md"></i> 의료진 소개</a>
          </div>
        </div>
      </div>
    </section>
`;
}

function generateInvisalignLinkBlock(currentFile) {
  const siblings = invisalignPages
    .filter(p => p.file !== currentFile)
    .slice(0, 8);

  const siblingLinks = siblings.map(p =>
    `          <a href="${getUrlFromFile(p.file)}" style="display:inline-block;padding:7px 14px;background:#fff;color:#2E6B4F;border:1px solid #b0d4c0;border-radius:20px;text-decoration:none;font-size:0.82rem;font-weight:600;transition:all .2s;">${p.icon} ${p.name}</a>`
  ).join('\n');

  return `
    <!-- ═══════ 관련 진료 바로가기 (내부 링크 SEO/AEO) ═══════ -->
    <section style="padding:48px 0 0;" aria-label="관련 진료 안내">
      <div class="container">
        <div style="background:linear-gradient(135deg,#f1f5f8 0%,#e4ebe4 100%);border-radius:20px;padding:32px 24px;text-align:center;">
          <h3 style="font-size:1.2rem;color:#2E6B4F;margin-bottom:8px;font-weight:800;"><i class="fas fa-teeth" style="margin-right:6px;"></i>천안 인비절라인·교정 세부 진료 안내</h3>
          <p style="font-size:0.88rem;color:#5B8A72;margin-bottom:18px;">서울비디치과의 다양한 교정 프로그램을 비교해보세요</p>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:20px;">
${siblingLinks}
          </div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid #c8dcc8;">
            <a href="/treatments/invisalign" style="display:inline-block;padding:9px 18px;background:#2E6B4F;color:#fff;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-teeth"></i> 인비절라인 전체 안내</a>
            <a href="/treatments/orthodontics" style="display:inline-block;padding:9px 18px;background:#2E6B4F;color:#fff;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-teeth-open"></i> 치아교정 전체 안내</a>
            <a href="/" style="display:inline-block;padding:9px 18px;background:#fff;color:#2E6B4F;border:1.5px solid #2E6B4F;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-home"></i> 서울비디치과 홈</a>
            <a href="/area/cheonan" style="display:inline-block;padding:9px 18px;background:#fff;color:#2E6B4F;border:1.5px solid #2E6B4F;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-map-marker-alt"></i> 천안치과 안내</a>
            <a href="/area/asan" style="display:inline-block;padding:9px 18px;background:#fff;color:#2E6B4F;border:1.5px solid #2E6B4F;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-map-marker-alt"></i> 아산치과 안내</a>
            <a href="/pricing" style="display:inline-block;padding:9px 18px;background:#fff;color:#2E6B4F;border:1.5px solid #2E6B4F;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-won-sign"></i> 비용 안내</a>
            <a href="/doctors" style="display:inline-block;padding:9px 18px;background:#fff;color:#2E6B4F;border:1.5px solid #2E6B4F;border-radius:24px;text-decoration:none;font-size:0.85rem;font-weight:700;transition:all .2s;"><i class="fas fa-user-md"></i> 의료진 소개</a>
          </div>
        </div>
      </div>
    </section>
`;
}

// ── 메인 실행 ──
const treatmentsDir = path.join(__dirname, '..', 'treatments');
let modified = 0;
let skipped = 0;

function processFile(filePath, fileName, category) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 이미 내부 링크 블록이 있으면 스킵
  if (html.includes('관련 진료 바로가기 (내부 링크 SEO/AEO)')) {
    console.log(`  ⏭️  ${fileName} — 이미 존재, 스킵`);
    skipped++;
    return;
  }

  const linkBlock = category === 'implant'
    ? generateImplantLinkBlock(fileName)
    : generateInvisalignLinkBlock(fileName);

  // 삽입 위치: <!-- CTA --> 또는 <section class="cta-section"> 직전
  let insertPoint = -1;

  // 1차: <!-- CTA --> 주석 찾기
  const ctaCommentIdx = html.indexOf('<!-- CTA -->');
  if (ctaCommentIdx !== -1) {
    // 주석 바로 앞의 빈 줄 위치
    insertPoint = ctaCommentIdx;
  }

  // 2차: <section class="cta-section"> 찾기
  if (insertPoint === -1) {
    const ctaSectionIdx = html.indexOf('<section class="cta-section">');
    if (ctaSectionIdx !== -1) {
      insertPoint = ctaSectionIdx;
    }
  }

  if (insertPoint === -1) {
    console.log(`  ❌ ${fileName} — CTA 섹션을 찾을 수 없음!`);
    return;
  }

  // 삽입
  html = html.slice(0, insertPoint) + linkBlock + '\n    ' + html.slice(insertPoint);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  ✅ ${fileName} — 내부 링크 블록 삽입 완료`);
  modified++;
}

console.log('\n🔧 임플란트 하부 15페이지 처리 중...');
for (const page of implantPages) {
  const filePath = path.join(treatmentsDir, page.file);
  if (fs.existsSync(filePath)) {
    processFile(filePath, page.file, 'implant');
  } else {
    console.log(`  ⚠️  ${page.file} — 파일 없음`);
  }
}

console.log('\n🔧 인비절라인/교정 하부 12페이지 처리 중...');
for (const page of invisalignPages) {
  const filePath = path.join(treatmentsDir, page.file);
  if (fs.existsSync(filePath)) {
    processFile(filePath, page.file, 'invisalign');
  } else {
    console.log(`  ⚠️  ${page.file} — 파일 없음`);
  }
}

console.log(`\n📊 결과: ${modified}개 수정, ${skipped}개 스킵`);
