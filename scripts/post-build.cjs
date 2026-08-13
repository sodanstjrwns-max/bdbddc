const fs = require('fs');
const path = require('path');
const cp = require('child_process');

// ============================================================
// 자동 탐색 방식 post-build
// - 루트의 배포 대상 파일/디렉토리를 자동으로 찾아 dist로 복사
// - "새 파일 만들었는데 목록에 안 넣어서 배포 누락" 사고 원천 차단
// ============================================================

// 배포에서 제외할 루트 항목 (이외는 전부 자동 복사)
const EXCLUDE = new Set([
  'node_modules', 'dist', 'src', 'scripts', 'migrations', 'docs', 'public',
  '.git', '.wrangler', '.dev.vars', '.gitignore', '.cloudflare-token',
  'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts',
  'wrangler.jsonc', 'ecosystem.config.cjs', 'README.md',
]);

// 배포 대상 파일 확장자 (루트 파일 중)
const FILE_ALLOW = /\.(html|txt|xml|json|js|ico|png|svg|webmanifest)$|^_redirects$|^_headers$/;

let copiedFiles = 0, copiedDirs = 0;
for (const entry of fs.readdirSync('.', { withFileTypes: true })) {
  const name = entry.name;
  if (EXCLUDE.has(name) || name.startsWith('.')) continue;

  if (entry.isFile()) {
    if (!FILE_ALLOW.test(name)) continue;
    fs.copyFileSync(name, path.join('dist', name));
    copiedFiles++;
  } else if (entry.isDirectory()) {
    cp.execSync(`mkdir -p dist/${name} && cp -rT ${name} dist/${name}`);
    copiedDirs++;
  }
}

// public/ 하위는 dist 루트로 병합 (vite publicDir 미사용 항목 포함 안전망)
for (const sub of ['data', 'images', 'videos', 'report', 'js', 'static']) {
  const src = path.join('public', sub);
  if (fs.existsSync(src)) {
    cp.execSync(`mkdir -p dist/${sub} && cp -r ${src}/. dist/${sub}/`);
  }
}

// ============================================================
// ★ v5.67 트래킹 태그 자동 주입 (2026-08-07)
// ------------------------------------------------------------
// 문제: 다국어(/en /jp /cn /vi /th /ru)와 /blog 는 정적 HTML 파일이라
//   src/lib/layout.ts 의 TRACKING_HEAD 를 못 쓴다. 그래서 47개 중
//   GTM 보유 3개 / gtag 3개 / Clarity 1개 / Pixel 1개 뿐이었다.
//   (GA4 관리화면 "태그되지 않음" 의 실제 원인)
// 해법: 파일 47개에 손으로 복붙하지 않는다. 빌드 때 dist 의 모든
//   정적 HTML <head> 에 공통 파셜(scripts/tracking-head.html)을 주입한다.
//   → 앞으로 새 정적 페이지를 추가해도 자동으로 태그가 붙는다.
// 원칙:
//   · 원본 소스 파일은 수정하지 않는다(dist 만 가공).
//   · 블록 단위로 판단한다. 파일 전체를 스킵하지 않는다.
//     (jp/index.html 은 GTM 은 있었으나 Clarity·Pixel 이 없었다.
//      파일 단위 스킵이면 그 반쪽 상태가 그대로 남는다.)
//   · 지문 문자열 유무로 판단하므로 재빌드해도 중복 주입이 없다.
//   · Worker SSR 페이지는 대상이 아니다(이미 TRACKING_HEAD 사용 중).
// ============================================================
const TRACKING_HEAD_PARTIAL = fs.readFileSync(
  path.join(__dirname, 'tracking-head.html'), 'utf8'
);

// 파셜을 <!--BD-BLOCK 이름 지문--> 기준으로 여러 블록으로 자른다.
// 지문이 대상 HTML 에 이미 있으면 그 블록만 건너뛴다.
// → GTM 만 있고 Clarity/Pixel 은 없는 파일도 빠진 것만 정확히 채운다.
const TRACKING_BLOCKS = (function () {
  const out = [];
  const re = /<!--BD-BLOCK\s+(\S+)\s+([^>]*?)-->/g;
  const marks = [];
  let m;
  while ((m = re.exec(TRACKING_HEAD_PARTIAL)) !== null) {
    marks.push({ name: m[1], needle: m[2].trim(), start: m.index, after: m.index + m[0].length });
  }
  for (let i = 0; i < marks.length; i++) {
    const end = i + 1 < marks.length ? marks[i + 1].start : TRACKING_HEAD_PARTIAL.length;
    out.push({
      name: marks[i].name,
      needle: marks[i].needle,
      html: TRACKING_HEAD_PARTIAL.slice(marks[i].after, end).trim()
    });
  }
  return out;
})();

function injectTrackingFile(full, stats) {
  const html = fs.readFileSync(full, 'utf8');
  stats.scanned++;

  // <head> 가 없는 조각 파일(리다이렉트 stub 등)은 건너뛴다
  const m = /<head[^>]*>/i.exec(html);
  if (!m) { stats.noHead++; return; }

  // 지문 기준으로 빠진 블록만 골라낸다 (재빌드해도 중복 주입 없음)
  const missing = TRACKING_BLOCKS.filter(function (b) { return html.indexOf(b.needle) === -1; });
  if (missing.length === 0) { stats.complete++; return; }

  const add = '\n<!-- BD-TRACKING-HEAD:START (\uC790\uB3D9 \uC8FC\uC785 \u2014 scripts/tracking-head.html \uC744 \uACE0\uCE60 \uAC83) -->\n'
    + missing.map(function (b) { return b.html; }).join('\n')
    + '\n<!-- BD-TRACKING-HEAD:END -->\n';

  const at = m.index + m[0].length;
  fs.writeFileSync(full, html.slice(0, at) + add + html.slice(at));
  stats.injected++;
  for (const b of missing) stats.blocks[b.name] = (stats.blocks[b.name] || 0) + 1;
}

function injectTracking(dir, stats, recurse) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (recurse !== false) injectTracking(full, stats, recurse);
      continue;
    }
    if (!/\.html$/i.test(e.name)) continue;
    injectTrackingFile(full, stats);
  }
}

// ★ v5.70: 주입 대상을 dist 전체로 확대 (기존: 다국어+blog+루트만)
//   → area/guide/game/treatments 등 "gtag 로더만 있고 config 없는" 반쪽
//     파일 223개가 사각지대였다. 블록 지문도 로더/config 로 분리했으므로
//     빠진 config 만 정확히 채워진다.
//   제외 목록: 방문자 분석 대상이 아닌 내부/유틸 페이지.
//     admin/report — 내부 운영 페이지 (트래킹 노이즈)
//     auth         — 비번 재설정 등 유틸
//     tables       — GSC 404 수정용 리다이렉트 스텁 (즉시 이동)
const INJECT_SKIP = new Set(['admin', 'report', 'auth', 'tables']);
const trkStats = { scanned: 0, injected: 0, complete: 0, noHead: 0, blocks: {} };
for (const e of fs.readdirSync('dist', { withFileTypes: true })) {
  if (!e.isDirectory() || INJECT_SKIP.has(e.name)) continue;
  injectTracking(path.join('dist', e.name), trkStats);
}
// 루트 정적 HTML(index / pricing / blueprint / symptom-checker 등)도 대상.
injectTracking('dist', trkStats, false);
console.log('[tracking-inject]', JSON.stringify(trkStats));

// _routes.json 패치
// include /* : 모든 요청이 Worker 경유 (seoulbddc.com → bdbddc.com 리디렉트 필요)
// 정적 자산은 exclude로 Worker 오버헤드 없이 직접 서빙
const routes = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/css/*','/js/*','/images/*','/static/*','/data/*',
    '/manifest.json','/sitemap.xml','/sitemap-main.xml','/sitemap-area.xml','/sitemap-encyclopedia.xml',
    '/sitemap-intl.xml',
    '/favicon.ico','/apple-touch-icon.png',
    '/robots.txt','/6f74445f7ec14eccb522a4d3f253128c.txt','/bdbddc2026indexnow.txt',
    '/llms.txt','/llms-full.txt','/sw.js','/report/*','/videos/*',
    '/laminate/frames/*',
    '/implant/frames/*',
    '/invisalign/frames/*',
    // ⚠️ v5.39: '/en/*' 와일드카드 금지!
    // /en/dictionary/* 는 Worker SSR 라우트이므로 exclude 되면 404 가 된다.
    // 정적 파일이 실제로 존재하는 /en/ 경로만 개별 열거한다.
    // (public/_routes.json 과 동일하게 유지할 것)
    // v5.86: EN 전체 미러 139장 — 레거시 implant/invisalign/laminate.html은
    //        삭제됨(Worker 301 필요하므로 exclude 금지)
    '/en','/en/','/en/index.html',
    '/en/pricing.html','/en/directions.html','/en/reservation.html',
    '/en/checkup','/en/checkup.html',
    '/en/flight','/en/flight.html',
    '/en/floor-guide','/en/floor-guide.html',
    '/en/faq','/en/faq.html','/en/faq/*',
    '/en/guide','/en/guide/*',
    '/en/treatments','/en/treatments/*',
    '/en/doctors','/en/doctors/*',
    // ⚠️ '/jp/*' 와일드카드 금지! (v5.39 '/en/*' 과 같은 함정)
    // /jp/column/* 는 Worker SSR 라우트이므로 exclude 되면 404 가 된다.
    // 정적 파일이 실제로 존재하는 /jp/ 경로만 열거한다.
    // (public/_routes.json 과 동일하게 유지할 것)
    '/jp','/jp/','/jp/index.html',
    '/jp/checkup.html','/jp/directions.html','/jp/faq.html','/jp/flight.html',
    '/jp/floor-guide.html','/jp/pricing.html','/jp/reservation.html',
    '/jp/checkup','/jp/directions','/jp/faq','/jp/flight',
    '/jp/floor-guide','/jp/pricing','/jp/reservation',
    '/jp/treatments','/jp/treatments/*',
    '/jp/doctors','/jp/doctors/*',
    '/jp/faq/*',
    '/jp/guide','/jp/guide/*',
    '/vi/*','/th/*','/ru/*','/cn/*'
  ]
};
fs.writeFileSync('dist/_routes.json', JSON.stringify(routes, null, 2));

// GSC 404 수정용 정적 리다이렉트 페이지
cp.execSync('mkdir -p dist/tables/treatments/treatments');
const redirectHtml = (url) => `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${url}"><link rel="canonical" href="https://bdbddc.com${url}"></head><body>Redirecting...</body></html>`;
fs.writeFileSync('dist/tables/treatments/treatments/gum.html', redirectHtml('/pricing'));
fs.writeFileSync('dist/tables/treatments/implant.html', redirectHtml('/pricing'));

console.log(`post-build done: ${copiedFiles} files + ${copiedDirs} dirs auto-copied, _routes.json patched`);
console.log(
  `tracking inject: scanned ${trkStats.scanned} / injected ${trkStats.injected} / ` +
  `complete ${trkStats.complete} / noHead ${trkStats.noHead} / ` +
  `blocks ${JSON.stringify(trkStats.blocks)}`
);
