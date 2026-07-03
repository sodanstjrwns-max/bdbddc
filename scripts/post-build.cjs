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
    '/en/*','/vi/*','/th/*','/ru/*','/jp/*','/cn/*'
  ]
};
fs.writeFileSync('dist/_routes.json', JSON.stringify(routes, null, 2));

// GSC 404 수정용 정적 리다이렉트 페이지
cp.execSync('mkdir -p dist/tables/treatments/treatments');
const redirectHtml = (url) => `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${url}"><link rel="canonical" href="https://bdbddc.com${url}"></head><body>Redirecting...</body></html>`;
fs.writeFileSync('dist/tables/treatments/treatments/gum.html', redirectHtml('/pricing'));
fs.writeFileSync('dist/tables/treatments/implant.html', redirectHtml('/pricing'));

console.log(`post-build done: ${copiedFiles} files + ${copiedDirs} dirs auto-copied, _routes.json patched`);
