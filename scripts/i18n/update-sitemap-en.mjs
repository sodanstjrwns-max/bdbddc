#!/usr/bin/env node
/**
 * sitemap-intl.xml에 EN 139장 등록 (jp 선례 c8a77966 컨벤션)
 * 1) 레거시 en URL 참조 재작성: /en/implant→/en/treatments/implant,
 *    /en/invisalign→/en/treatments/invisalign, /en/laminate→/en/treatments/glownate
 * 2) batch-en-all.json의 139 경로 중 이미 <loc>로 등재된 것 제외하고
 *    <url> 블록 신규 추가: hreflang en + ko + (ja, jp 존재 시) + x-default→ko
 * usage: node scripts/i18n/update-sitemap-en.mjs [--dry]
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const SITEMAP = path.join(ROOT, 'sitemap-intl.xml');
const BATCH = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/i18n/batch-en-all.json'), 'utf8'));
const JP_PATHS = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/i18n/jp-sitemap.json'), 'utf8')));
const DRY = process.argv.includes('--dry');
const BASE = 'https://bdbddc.com';
const TODAY = '2026-08-13';

let xml = fs.readFileSync(SITEMAP, 'utf8');

// ── 1) 레거시 en URL 재작성 (loc/href 공통) ──
const legacyMap = [
  ['https://bdbddc.com/en/implant', 'https://bdbddc.com/en/treatments/implant'],
  ['https://bdbddc.com/en/invisalign', 'https://bdbddc.com/en/treatments/invisalign'],
  ['https://bdbddc.com/en/laminate', 'https://bdbddc.com/en/treatments/glownate'],
  // jp 구식 경로 (da0e0f52에서 301 처리됐으나 sitemap 미갱신분)
  ['https://bdbddc.com/jp/dental', 'https://bdbddc.com/jp/treatments/'],
  ['https://bdbddc.com/jp/implant', 'https://bdbddc.com/jp/treatments/implant'],
  ['https://bdbddc.com/jp/invisalign', 'https://bdbddc.com/jp/treatments/invisalign'],
  ['https://bdbddc.com/jp/travel-guide', 'https://bdbddc.com/jp/flight'],
];
let legacyCount = 0;
for (const [from, to] of legacyMap) {
  // 정확 매칭: 뒤에 " 또는 < 가 오는 경우만 (en/implant-advanced 등 오염 방지)
  const re = new RegExp(from.replace(/[/.]/g, '\\$&') + '(?=["<])', 'g');
  xml = xml.replace(re, () => { legacyCount++; return to; });
}

// ── 1.5) 재작성으로 생긴 중복 <loc> 블록 제거 (뒤에 나오는 구식 개편본이 아닌, 앞의 구식 블록 우선 제거가 아니라 — 최신 hreflang 세트를 가진 블록을 남기기 위해 '뒤쪽 블록'을 유지) ──
{
  const urlBlockRe = /  <url>[\s\S]*?<\/url>\n?/g;
  const blocks = [...xml.matchAll(urlBlockRe)].map(m => m[0]);
  const lastIdx = new Map(); // loc -> 마지막 등장 index (뒤쪽 = 최신 hreflang 세트 유지)
  blocks.forEach((b, i) => {
    const m = b.match(/<loc>([^<]+)<\/loc>/);
    if (m) lastIdx.set(m[1], i);
  });
  let removed = 0, idx = 0;
  xml = xml.replace(urlBlockRe, (b) => {
    const i = idx++;
    const m = b.match(/<loc>([^<]+)<\/loc>/);
    if (m && lastIdx.get(m[1]) !== i) { removed++; return ''; }
    return b;
  });
  if (removed > 0) console.log(`중복 loc 블록 제거: ${removed}건`);
}

// ── 1.7) 재작성된 en 레거시 블록은 구식 hreflang 세트(x-default→en, zh/vi/th/ru)라
//        페이지 자체 hreflang(ko/en/ja/x-default→ko)과 어긋남 → 제거 후 신규 재생성 ──
{
  const dropLocs = new Set([
    'https://bdbddc.com/en/treatments/implant',
    'https://bdbddc.com/en/treatments/invisalign',
    'https://bdbddc.com/en/treatments/glownate',
  ]);
  let dropped = 0;
  xml = xml.replace(/  <url>[\s\S]*?<\/url>\n?/g, (b) => {
    const m = b.match(/<loc>([^<]+)<\/loc>/);
    if (m && dropLocs.has(m[1])) { dropped++; return ''; }
    return b;
  });
  if (dropped) console.log(`en 레거시 블록 제거(재생성 대상): ${dropped}건`);
}

// ── 2) 기존 등재 loc 수집 ──
const existingLocs = new Set();
for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) existingLocs.add(m[1]);

// ── 3) 신규 <url> 블록 생성 ──
// batch path: '/en/...' → ko path: '/...'
let added = 0, skipped = 0;
const blocks = [];
for (const e of BATCH) {
  const enPath = e.path;                       // e.g. /en/treatments/implant, /en/doctors/
  const koPath = enPath.replace(/^\/en/, '') || '/';
  const enUrl = BASE + enPath;
  const koUrl = BASE + (koPath === '' ? '/' : koPath);
  if (existingLocs.has(enUrl)) { skipped++; continue; }
  // jp 존재 여부: jp-sitemap.json은 trailing slash 없는 형식('/','/doctors')
  const koKey = koPath === '/' ? '/' : koPath.replace(/\/$/, '');
  const hasJa = JP_PATHS.has(koKey);
  const jaUrl = BASE + '/jp' + (koKey === '/' ? '/' : koKey);
  let b = '  <url>\n';
  b += `    <loc>${enUrl}</loc>\n`;
  b += `    <lastmod>${TODAY}</lastmod>\n`;
  b += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>\n`;
  b += `    <xhtml:link rel="alternate" hreflang="ko" href="${koUrl}"/>\n`;
  if (hasJa) b += `    <xhtml:link rel="alternate" hreflang="ja" href="${jaUrl}"/>\n`;
  b += `    <xhtml:link rel="alternate" hreflang="x-default" href="${koUrl}"/>\n`;
  b += '  </url>\n';
  blocks.push(b);
  added++;
}

// ── 4) </urlset> 직전 삽입 ──
if (blocks.length) {
  xml = xml.replace(/<\/urlset>\s*$/, '\n  <!-- EN 1:1 미러 페이지 (자동 등록: update-sitemap-en.mjs · ' + TODAY + ') -->\n' + blocks.join('') + '</urlset>\n');
}

console.log(`레거시 재작성: ${legacyCount}건 / 신규 추가: ${added} / 이미 등재 스킵: ${skipped}`);
if (DRY) {
  console.log('[dry-run] 파일 미변경');
} else {
  const tmp = SITEMAP + '.tmp';
  fs.writeFileSync(tmp, xml);
  fs.renameSync(tmp, SITEMAP);
  console.log('sitemap-intl.xml 갱신 완료');
}
