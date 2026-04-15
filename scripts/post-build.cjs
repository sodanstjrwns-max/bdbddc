const fs = require('fs');
const cp = require('child_process');

// 1. Copy static files to dist
const staticFiles = [
  'index.html','pricing.html','reservation.html','directions.html',
  'faq.html','floor-guide.html','privacy.html','terms.html',
  '404.html','mission.html','checkup.html','manifest.json',
  'sitemap.xml','sitemap-main.xml','sitemap-area.xml','sitemap-encyclopedia.xml',
  'robots.txt','6f74445f7ec14eccb522a4d3f253128c.txt','bdbddc2026indexnow.txt',
  'blueprint.html','llms.txt','llms-full.txt',
  'flight.html','games.html','run.html','careers.html','_redirects'
];
staticFiles.forEach(f => {
  try { fs.copyFileSync(f, 'dist/' + f); } catch(e) {}
});

// 2. Copy directories to dist
const dirs = [
  'css','js','images','treatments','doctors','column','blog',
  'video','cases','notice','auth','admin','area','faq','encyclopedia'
];
dirs.forEach(d => {
  try { cp.execSync('mkdir -p dist/' + d + ' && cp -rT ' + d + ' dist/' + d); } catch(e) {}
});
cp.execSync('mkdir -p dist/data && cp -rT public/data dist/data');

// 3. Patch _routes.json
const routes = JSON.parse(fs.readFileSync('dist/_routes.json', 'utf8'));
const includeRoutes = [
  '/encyclopedia/*','/admin/*','/admin','/cases/*',
  '/flight','/games','/run',
  '/column/*','/column','/doctors/*','/careers',
  '/bdx','/bdx/*','/local-seo','/tables/*'
];
includeRoutes.forEach(r => {
  if (!routes.include.includes(r)) routes.include.push(r);
});
routes.exclude = routes.exclude.filter(e => e !== '/cases/*' && e !== '/column/*' && e !== '/doctors/*');
fs.writeFileSync('dist/_routes.json', JSON.stringify(routes, null, 2));

// 4. Create static redirect pages for GSC 404 fix
cp.execSync('mkdir -p dist/tables/treatments/treatments');

const redirectHtml = (url) => `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${url}"><link rel="canonical" href="https://bdbddc.com${url}"></head><body>Redirecting...</body></html>`;

fs.writeFileSync('dist/tables/treatments/treatments/gum.html', redirectHtml('/pricing'));
fs.writeFileSync('dist/tables/treatments/implant.html', redirectHtml('/pricing'));

console.log('Static files synced to dist + _routes.json patched');
