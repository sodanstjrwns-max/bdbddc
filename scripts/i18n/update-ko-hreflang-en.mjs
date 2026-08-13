#!/usr/bin/env node
/**
 * ko 소스 페이지에 hreflang en 역링크 삽입/갱신
 * - batch-en-all.json 기준: src(ko 파일) → path(/en/...)
 * - 기존 hreflang en 라인 있으면 URL 교체, 없으면 hreflang ko 라인 뒤에 삽입
 * - hreflang ko도 없으면 canonical 뒤에 ko+en+x-default(ko) 블록 삽입
 * - 원자적 쓰기(tmp+rename) — 배치 번역 병행 중 안전
 * usage: node scripts/i18n/update-ko-hreflang-en.mjs [--dry]
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const batch = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/i18n/batch-en-all.json'), 'utf8'));
const DRY = process.argv.includes('--dry');
const BASE = 'https://bdbddc.com';

let replaced = 0, inserted = 0, blockAdded = 0, skipped = 0, errors = 0;
const details = [];

for (const { src, path: enPath } of batch) {
  const file = path.join(ROOT, src);
  if (!fs.existsSync(file)) { errors++; details.push(`MISSING ${src}`); continue; }
  let html = fs.readFileSync(file, 'utf8');
  const enUrl = BASE + enPath;
  const enLine = `<link rel="alternate" hreflang="en" href="${enUrl}">`;

  // ko 경로 (en 경로에서 /en 제거)
  const koPath = enPath.replace(/^\/en/, '') || '/';
  const koUrl = BASE + koPath;

  const enRe = /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*">/;
  const koRe = /(<link\s+rel="alternate"\s+hreflang="ko"\s+href="[^"]*">)/;
  const canonRe = /(<link\s+rel="canonical"\s+href="[^"]*">)/;

  if (enRe.test(html)) {
    const cur = html.match(enRe)[0];
    if (cur === enLine) { skipped++; continue; }
    html = html.replace(enRe, enLine);
    replaced++; details.push(`REPLACE ${src} :: ${cur.match(/href="([^"]*)"/)[1]} -> ${enUrl}`);
  } else if (koRe.test(html)) {
    html = html.replace(koRe, `$1\n  ${enLine}`);
    inserted++; details.push(`INSERT ${src} -> ${enUrl}`);
  } else if (canonRe.test(html)) {
    const block = `$1\n  <link rel="alternate" hreflang="ko" href="${koUrl}">\n  ${enLine}\n  <link rel="alternate" hreflang="x-default" href="${koUrl}">`;
    html = html.replace(canonRe, block);
    blockAdded++; details.push(`BLOCK ${src} -> ${enUrl}`);
  } else {
    errors++; details.push(`NO-ANCHOR ${src} (canonical/hreflang 없음)`);
    continue;
  }

  if (!DRY) {
    const tmp = file + '.tmp-hreflang';
    fs.writeFileSync(tmp, html);
    fs.renameSync(tmp, file);
  }
}

console.log(details.join('\n'));
console.log(`\n=== 요약 ${DRY ? '(DRY RUN)' : ''} ===`);
console.log(`교체: ${replaced}, 삽입: ${inserted}, 블록신설: ${blockAdded}, 이미정상: ${skipped}, 오류: ${errors}`);
