#!/usr/bin/env node
/**
 * 백과사전 사이트맵 재생성 스크립트
 * 
 * 목적: GSC "발견됨-색인 미생성" 해소
 * 전략: 콘텐츠 풍부도에 따라 priority/changefreq 차등 설정
 *   - detail 1000자 이상 → priority 0.8, changefreq weekly
 *   - detail 600~1000자 → priority 0.7, changefreq weekly
 *   - detail 300~600자  → priority 0.6, changefreq monthly
 *   - detail 150~300자  → priority 0.4, changefreq monthly
 *   - detail <150자    → priority 0.2, changefreq monthly
 * 
 * 또한 link/guide 보유 항목은 +0.05 가산점
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const ENC_PATH = path.join(REPO_ROOT, 'public/data/encyclopedia.json');
const OUT_PATH = path.join(REPO_ROOT, 'sitemap-encyclopedia.xml');
const TODAY = new Date().toISOString().slice(0, 10);

const data = JSON.parse(fs.readFileSync(ENC_PATH, 'utf-8'));
const items = data.items || [];

function computePriority(item) {
  const len = (item.detail || '').length;
  let priority;
  let changefreq;
  
  if (len >= 1000) {
    priority = 0.8;
    changefreq = 'weekly';
  } else if (len >= 600) {
    priority = 0.7;
    changefreq = 'weekly';
  } else if (len >= 300) {
    priority = 0.6;
    changefreq = 'monthly';
  } else if (len >= 150) {
    priority = 0.4;
    changefreq = 'monthly';
  } else {
    priority = 0.2;
    changefreq = 'monthly';
  }
  
  // 진료/가이드 연결 보너스
  if (item.link) priority = Math.min(1.0, priority + 0.05);
  if (item.guide) priority = Math.min(1.0, priority + 0.05);
  
  return { priority: priority.toFixed(2), changefreq };
}

// 카테고리 페이지도 포함
const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

const urls = [];

// 1. 백과사전 메인
urls.push({
  loc: 'https://bdbddc.com/encyclopedia/',
  lastmod: TODAY,
  changefreq: 'weekly',
  priority: '0.9'
});

// 2. 카테고리 페이지
for (const cat of categories) {
  urls.push({
    loc: `https://bdbddc.com/encyclopedia/category/${encodeURIComponent(cat)}`,
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '0.7'
  });
}

// 3. 용어 페이지 (콘텐츠 풍부도별 priority 차등)
// 정렬: 콘텐츠 풍부한 것부터 위로 (priority 높은 순)
items.sort((a, b) => (b.detail || '').length - (a.detail || '').length);

for (const item of items) {
  const { priority, changefreq } = computePriority(item);
  urls.push({
    loc: `https://bdbddc.com/encyclopedia/${encodeURIComponent(item.term)}`,
    lastmod: TODAY,
    changefreq,
    priority
  });
}

// XML 생성
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(OUT_PATH, xml, 'utf-8');

// 통계
const stats = {
  total: urls.length,
  byPriority: {}
};
urls.forEach(u => {
  stats.byPriority[u.priority] = (stats.byPriority[u.priority] || 0) + 1;
});

console.log(`✅ ${OUT_PATH} 재생성 완료`);
console.log(`   총 URL: ${stats.total}개`);
console.log(`   카테고리: ${categories.length}개`);
console.log(`   용어: ${items.length}개`);
console.log(`   priority 분포:`);
Object.entries(stats.byPriority).sort((a,b) => parseFloat(b[0]) - parseFloat(a[0])).forEach(([p, n]) => {
  console.log(`     ${p}: ${n}개`);
});
