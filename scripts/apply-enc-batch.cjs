#!/usr/bin/env node
/**
 * 백과사전 "지정 배치만" 적용 스크립트 (v5.42)
 *
 * ⚠️ 왜 별도 스크립트인가:
 *   기존 apply-encyclopedia-updates.cjs 는 batch*.json 을 "문자열 정렬"로 전부 재적용한다.
 *   batch47/48/49 를 추가하면 정렬 순서가 47,48,49,5,6,7,8,9 가 되어
 *   새로 쓴 심화 내용이 옛 배치(batch5~9)에 그대로 덮어써진다. (실측 370개 항목 퇴행)
 *   따라서 신규 배치는 반드시 이 스크립트로 "지정한 파일만" 적용한다.
 *
 * 사용법:
 *   node scripts/apply-enc-batch.cjs batch47 batch48 batch49
 *   node scripts/apply-enc-batch.cjs --dry-run batch47
 *
 * 안전장치:
 *   1) 적용 전 자동 백업 (public/data/.enc-backup-<timestamp>.json)
 *   2) detail 길이가 줄어드는 항목은 기본적으로 거부 (--allow-shrink 로 해제)
 *   3) 존재하지 않는 term 은 적용하지 않고 리포트
 *   4) --dry-run 으로 변경 없이 미리보기
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENC_PATH = path.join(ROOT, 'public', 'data', 'encyclopedia.json');
const UPDATES_DIR = path.join(ROOT, 'data', 'encyclopedia-updates');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const ALLOW_SHRINK = argv.includes('--allow-shrink');
const names = argv.filter(a => !a.startsWith('--'));

if (names.length === 0) {
  console.error('사용법: node scripts/apply-enc-batch.cjs [--dry-run] [--allow-shrink] batch47 batch48 ...');
  process.exit(1);
}

const enc = JSON.parse(fs.readFileSync(ENC_PATH, 'utf-8'));
const byTerm = new Map(enc.items.map(i => [i.term, i]));
console.log(`📖 백과사전 로딩: ${enc.items.length}개 항목`);

let applied = 0, skippedShrink = 0, notFound = 0, gained = 0;
const notFoundList = [], shrinkList = [];

for (const name of names) {
  const file = path.join(UPDATES_DIR, name.endsWith('.json') ? name : `${name}.json`);
  if (!fs.existsSync(file)) { console.error(`❌ 파일 없음: ${file}`); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  console.log(`\n📦 ${path.basename(file)} — ${data.updates.length}개`);

  for (const u of data.updates) {
    const item = byTerm.get(u.term);
    if (!item) { notFound++; notFoundList.push(u.term); console.log(`   ⚠️  미발견: ${u.term}`); continue; }

    const before = (item.detail || '').length;
    const after = (u.detail || '').length;

    if (after < before && !ALLOW_SHRINK) {
      skippedShrink++; shrinkList.push(`${u.term} (${before}→${after})`);
      console.log(`   ⛔ 축소 거부: ${u.term} ${before}자 → ${after}자`);
      continue;
    }

    item.detail = u.detail;
    if (Array.isArray(u.synonyms)) {
      item.synonyms = [...new Set([...(item.synonyms || []), ...u.synonyms])];
    }
    if (u.link !== undefined) item.link = u.link;
    if (u.guide !== undefined) item.guide = u.guide;

    applied++; gained += (after - before);
    console.log(`   ✅ ${u.term}: ${before}자 → ${after}자 (+${after - before})`);
  }
}

console.log(`\n📊 적용 ${applied} / 축소거부 ${skippedShrink} / 미발견 ${notFound}`);
console.log(`📈 총 증가: +${gained.toLocaleString()}자`);
if (notFoundList.length) console.log(`   미발견 목록: ${notFoundList.join(', ')}`);
if (shrinkList.length) console.log(`   축소거부 목록: ${shrinkList.join(', ')}`);

const dist = { '<600': 0, '600-999': 0, '1000-1499': 0, '1500+': 0 };
for (const i of enc.items) {
  const n = (i.detail || '').length;
  if (n < 600) dist['<600']++;
  else if (n < 1000) dist['600-999']++;
  else if (n < 1500) dist['1000-1499']++;
  else dist['1500+']++;
}
console.log(`\n📚 분포: <600 ${dist['<600']} / 600-999 ${dist['600-999']} / 1000-1499 ${dist['1000-1499']} / 1500+ ${dist['1500+']}`);

if (DRY) { console.log('\n🔍 --dry-run: 파일을 저장하지 않았습니다.'); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(ROOT, 'public', 'data', `.enc-backup-${stamp}.json`);
fs.copyFileSync(ENC_PATH, backup);
fs.writeFileSync(ENC_PATH, JSON.stringify(enc, null, 2), 'utf-8');
console.log(`\n💾 저장 완료: ${ENC_PATH}`);
console.log(`🗄  백업: ${backup}`);
