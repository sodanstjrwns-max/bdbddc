#!/usr/bin/env node
/**
 * 서울비디치과 통합 sitemap 재생성 스크립트
 *
 * 업데이트하는 파일:
 * - sitemap.xml (sitemap index)
 * - sitemap-main.xml (메인 페이지 lastmod 일괄 업데이트)
 * - sitemap-encyclopedia.xml (이미 별도 스크립트로 관리됨)
 * - sitemap-area.xml (lastmod 갱신)
 * - sitemap-intl.xml (lastmod 갱신)
 *
 * 동적 sitemap (src/index.tsx에서 처리됨):
 * - sitemap-columns.xml
 * - sitemap-cases.xml
 *
 * 사용법: node scripts/regenerate-all-sitemaps.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

console.log(`📅 Today: ${TODAY}`);
console.log('━'.repeat(60));

// ─────────────────────────────────────────────────────
// 1. sitemap.xml (인덱스) 재생성
// ─────────────────────────────────────────────────────
function regenerateSitemapIndex() {
  const indexPath = path.join(ROOT, 'sitemap.xml');

  // 각 sub-sitemap의 URL 수 계산
  const countUrls = (filename) => {
    const filepath = path.join(ROOT, filename);
    if (!fs.existsSync(filepath)) return 0;
    const content = fs.readFileSync(filepath, 'utf-8');
    return (content.match(/<loc>/g) || []).length;
  };

  const stats = {
    main: countUrls('sitemap-main.xml'),
    area: countUrls('sitemap-area.xml'),
    encyclopedia: countUrls('sitemap-encyclopedia.xml'),
    intl: countUrls('sitemap-intl.xml'),
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- ═══════════════════════════════════════════════════════════ -->
  <!-- 서울비디치과 사이트맵 인덱스 (https://bdbddc.com)              -->
  <!-- 마지막 업데이트: ${TODAY}                                      -->
  <!--                                                              -->
  <!-- 통계:                                                         -->
  <!--   - sitemap-main:         ${String(stats.main).padStart(4)} URLs (메인+진료+의료진) -->
  <!--   - sitemap-area:         ${String(stats.area).padStart(4)} URLs (지역 SEO)         -->
  <!--   - sitemap-encyclopedia: ${String(stats.encyclopedia).padStart(4)} URLs (백과사전)        -->
  <!--   - sitemap-intl:         ${String(stats.intl).padStart(4)} URLs (다국어)          -->
  <!--   - sitemap-columns:    동적 (Hono 핸들러 /src/index.tsx)    -->
  <!--   - sitemap-cases:      동적 (Hono 핸들러 /src/index.tsx)    -->
  <!-- ═══════════════════════════════════════════════════════════ -->

  <!-- 메인 페이지 + 진료 + 의료진 + 병원 안내 + 콘텐츠 허브 -->
  <sitemap>
    <loc>https://bdbddc.com/sitemap-main.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>

  <!-- 지역 SEO 페이지 (28개 기본 + 60개 진료 특화 = ${stats.area}개) -->
  <sitemap>
    <loc>https://bdbddc.com/sitemap-area.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>

  <!-- 치과 백과사전 (${stats.encyclopedia}개 URL: 카테고리 + 항목) -->
  <sitemap>
    <loc>https://bdbddc.com/sitemap-encyclopedia.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>

  <!-- 다국어 SEO 페이지 (EN/VI/JP/CN/TH/RU — ${stats.intl}개) -->
  <sitemap>
    <loc>https://bdbddc.com/sitemap-intl.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>

  <!-- 원장 컬럼 (동적 — R2/D1 실시간 반영) -->
  <sitemap>
    <loc>https://bdbddc.com/sitemap-columns.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>

  <!-- Before/After 케이스 (동적 — R2 실시간 반영) -->
  <sitemap>
    <loc>https://bdbddc.com/sitemap-cases.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>
`;

  fs.writeFileSync(indexPath, xml);
  console.log(`✅ sitemap.xml 인덱스 재생성`);
  console.log(`   - main: ${stats.main} URLs`);
  console.log(`   - area: ${stats.area} URLs`);
  console.log(`   - encyclopedia: ${stats.encyclopedia} URLs`);
  console.log(`   - intl: ${stats.intl} URLs`);
  return stats;
}

// ─────────────────────────────────────────────────────
// 2. 특정 파일의 lastmod 일괄 갱신
//   (변경 추적이 어려운 경우 — 보수적 접근)
// ─────────────────────────────────────────────────────
function bumpLastmodForUrls(filename, urlPatterns) {
  const filepath = path.join(ROOT, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  ${filename} 없음, 스킵`);
    return 0;
  }

  let content = fs.readFileSync(filepath, 'utf-8');
  let updated = 0;

  // <url> 블록 단위로 찾아서 매칭되는 것의 lastmod만 교체
  content = content.replace(
    /(<url>[\s\S]*?<\/url>)/g,
    (urlBlock) => {
      const locMatch = urlBlock.match(/<loc>([^<]+)<\/loc>/);
      if (!locMatch) return urlBlock;
      const url = locMatch[1];

      const shouldUpdate = urlPatterns.some((p) => url.includes(p));
      if (!shouldUpdate) return urlBlock;

      const newBlock = urlBlock.replace(
        /<lastmod>[^<]+<\/lastmod>/,
        `<lastmod>${TODAY}</lastmod>`
      );
      if (newBlock !== urlBlock) updated++;
      return newBlock;
    }
  );

  fs.writeFileSync(filepath, content);
  console.log(`✅ ${filename}: ${updated}개 URL의 lastmod 갱신됨`);
  return updated;
}

// ─────────────────────────────────────────────────────
// 3. sitemap-main.xml의 모든 lastmod를 오늘로 일괄 갱신
//    (전체 사이트가 SW v1.1.0 + nav 수정으로 영향받음)
// ─────────────────────────────────────────────────────
function bumpAllLastmod(filename) {
  const filepath = path.join(ROOT, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  ${filename} 없음, 스킵`);
    return 0;
  }

  let content = fs.readFileSync(filepath, 'utf-8');
  const before = (content.match(/<lastmod>/g) || []).length;

  content = content.replace(
    /<lastmod>[^<]+<\/lastmod>/g,
    `<lastmod>${TODAY}</lastmod>`
  );

  fs.writeFileSync(filepath, content);
  console.log(`✅ ${filename}: 전체 ${before}개 lastmod 갱신됨`);
  return before;
}

// ─────────────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────────────
(function main() {
  console.log('\n📋 STEP 1: sitemap-main.xml lastmod 일괄 갱신');
  bumpAllLastmod('sitemap-main.xml');

  console.log('\n📋 STEP 2: sitemap-area.xml lastmod 일괄 갱신');
  bumpAllLastmod('sitemap-area.xml');

  console.log('\n📋 STEP 3: sitemap-intl.xml lastmod 일괄 갱신');
  bumpAllLastmod('sitemap-intl.xml');

  console.log('\n📋 STEP 4: sitemap-encyclopedia.xml의 미백 관련 항목 lastmod 갱신');
  bumpLastmodForUrls('sitemap-encyclopedia.xml', [
    '%EB%AF%B8%EB%B0%B1',           // 미백
    '%EC%9B%8C%ED%82%B9%20%EB%B8%94%EB%A6%AC%EC%B9%98', // 워킹 블리치
    '%EB%82%B4%EB%B6%80%20%EB%AF%B8%EB%B0%B1',          // 내부 미백
    '%EB%B8%94%EB%A6%AC%EC%B9%AD',  // 블리칭
    'whitening',
    'glownate',
    'aesthetic',
  ]);

  console.log('\n📋 STEP 5: sitemap.xml 인덱스 재생성');
  regenerateSitemapIndex();

  console.log('\n' + '━'.repeat(60));
  console.log('🎉 모든 sitemap 갱신 완료!');
  console.log('\n다음 단계:');
  console.log('  1. npm run build');
  console.log('  2. npx wrangler pages deploy dist --project-name seoul-bd-dental --branch main');
  console.log('  3. 검색엔진에 ping (별도 가이드 참조)');
})();
