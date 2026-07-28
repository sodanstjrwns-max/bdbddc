#!/usr/bin/env node
/**
 * 백과사전 업데이트 적용 스크립트 (레거시 · 전체 재적용)
 * data/encyclopedia-updates/*.json 파일들을 읽어
 * public/data/encyclopedia.json의 매칭 항목 detail/synonyms/link/guide 업데이트
 *
 * ⛔ 경고 (2026-07-28, v5.42) — 신규 배치에 이 스크립트를 쓰지 마세요.
 *   이 스크립트는 batch*.json 을 "문자열 정렬"로 전부 재적용합니다.
 *   batch10 이상이 존재하는 현재, 정렬 순서는 1,10,11,...,47,48,49,5,6,7,8,9 가 되어
 *   나중 번호의 배치가 batch5~9 에 의해 덮어써집니다.
 *   실제로 batch47~49 추가 후 실행했을 때 370개 항목이 퇴행했습니다
 *   (총 1,535,595자 → 1,064,915자).
 *
 * ✅ 신규 배치는 반드시 지정 적용 스크립트를 사용하세요:
 *      node scripts/apply-enc-batch.cjs batch47 batch48 batch49
 *   (축소 거부 · 자동 백업 · --dry-run 지원)
 */
if (!process.argv.includes('--i-know-this-overwrites-everything')) {
  console.error('⛔ 이 스크립트는 모든 배치를 문자열 정렬 순으로 재적용해 최신 배치를 덮어씁니다.');
  console.error('   신규 배치는 다음을 사용하세요:');
  console.error('     node scripts/apply-enc-batch.cjs batch47 batch48 batch49');
  console.error('   그래도 전체 재적용이 필요하면 --i-know-this-overwrites-everything 플래그를 붙이세요.');
  process.exit(1);
}
const fs = require('fs');
const path = require('path');

const ENCYCLOPEDIA_PATH = path.join(__dirname, '..', 'public', 'data', 'encyclopedia.json');
const UPDATES_DIR = path.join(__dirname, '..', 'data', 'encyclopedia-updates');

console.log('📖 백과사전 로딩...');
const encyclopedia = JSON.parse(fs.readFileSync(ENCYCLOPEDIA_PATH, 'utf-8'));
console.log(`   현재 ${encyclopedia.items.length}개 항목`);

// 모든 배치 파일 로드
const batchFiles = fs.readdirSync(UPDATES_DIR).filter(f => f.startsWith('batch') && f.endsWith('.json')).sort();
console.log(`\n📦 ${batchFiles.length}개 배치 파일 발견: ${batchFiles.join(', ')}`);

const allUpdates = [];
for (const batchFile of batchFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(UPDATES_DIR, batchFile), 'utf-8'));
  console.log(`   ${batchFile}: ${data.updates.length}개`);
  allUpdates.push(...data.updates);
}
console.log(`\n총 ${allUpdates.length}개 업데이트 항목`);

// 적용
let successCount = 0;
let notFoundCount = 0;
const notFoundList = [];
const beforeStats = { weak: 0, rich: 0 };
const afterStats = { weak: 0, rich: 0 };

for (const update of allUpdates) {
  const item = encyclopedia.items.find(i => i.term === update.term);
  if (!item) {
    notFoundCount++;
    notFoundList.push(update.term);
    continue;
  }
  
  const beforeLen = (item.detail || '').length;
  
  // detail 업데이트
  item.detail = update.detail;
  
  // synonyms 병합 (중복 제거)
  if (update.synonyms && Array.isArray(update.synonyms)) {
    const existing = item.synonyms || [];
    const merged = [...new Set([...existing, ...update.synonyms])];
    item.synonyms = merged;
  }
  
  // link 설정 (값이 있을 때만)
  if (update.link !== undefined) {
    item.link = update.link;
  }
  
  // guide 설정 (값이 있을 때만)
  if (update.guide !== undefined) {
    item.guide = update.guide;
  }
  
  const afterLen = item.detail.length;
  successCount++;
  console.log(`   ✅ ${item.term}: ${beforeLen}자 → ${afterLen}자 (link:${item.link ? 'Y' : 'N'}, guide:${item.guide ? 'Y' : 'N'})`);
}

// 통계 재계산
encyclopedia.items.forEach(i => {
  const len = (i.detail || '').length;
  if (len < 300) beforeStats.weak++;
  else beforeStats.rich++;
});

console.log(`\n📊 결과: ${successCount}개 성공, ${notFoundCount}개 미발견`);
if (notFoundList.length > 0) {
  console.log(`   미발견 항목: ${notFoundList.join(', ')}`);
}

// 전체 통계
const lenStats = { '<150': 0, '150-299': 0, '300-599': 0, '600-999': 0, '1000+': 0 };
encyclopedia.items.forEach(i => {
  const len = (i.detail || '').length;
  if (len < 150) lenStats['<150']++;
  else if (len < 300) lenStats['150-299']++;
  else if (len < 600) lenStats['300-599']++;
  else if (len < 1000) lenStats['600-999']++;
  else lenStats['1000+']++;
});
console.log(`\n📈 현재 콘텐츠 분포:`);
console.log(`   극빈약(<150): ${lenStats['<150']}개`);
console.log(`   빈약(150-299): ${lenStats['150-299']}개`);
console.log(`   보통(300-599): ${lenStats['300-599']}개`);
console.log(`   양호(600-999): ${lenStats['600-999']}개`);
console.log(`   풍부(1000+): ${lenStats['1000+']}개`);

// 저장
fs.writeFileSync(ENCYCLOPEDIA_PATH, JSON.stringify(encyclopedia, null, 2), 'utf-8');
console.log(`\n💾 저장 완료: ${ENCYCLOPEDIA_PATH}`);
