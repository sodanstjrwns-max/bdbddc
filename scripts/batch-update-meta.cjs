/**
 * 프로덕션 R2 케이스 데이터에 laminateStyle / medicalHistory 자동 추가
 * 사용법: ADMIN_COOKIE=xxx SITE_URL=https://bdbddc.com node scripts/batch-update-meta.cjs
 */

const SITE_URL = process.env.SITE_URL || 'https://seoul-bd-dental.pages.dev';
const ADMIN_COOKIE = process.env.ADMIN_COOKIE || '';

async function fetchCases() {
  const res = await fetch(`${SITE_URL}/api/cases`);
  return res.json();
}

async function batchUpdate(updates) {
  const res = await fetch(`${SITE_URL}/api/admin/cases/batch-meta`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `bd_admin_session=${ADMIN_COOKIE}`
    },
    body: JSON.stringify({ updates })
  });
  return res.json();
}

// 글로우네이트 스타일 추론 (제목+설명 기반)
function inferGlownateStyle(c) {
  const text = ((c.title || '') + ' ' + (c.description || '')).toLowerCase();
  
  // white-pretty: 하얗게, 화이트, 하얀
  if (/하얗[고게]|하얀|white|화이트닝|화이트/.test(text)) return 'white-pretty';
  
  // bright-pretty: 밝게, 환하게, 변색 치료, 반점치, 라미네이트 재치료
  if (/밝[고게]|환하[게게]|bright|변색|노랗|라미네이트.*재치료|재치료.*라미|반점치/.test(text)) return 'bright-pretty';
  
  // natural-pretty: 자연스럽게, 가지런하게, 복원, 깨짐, 왜소치, 교정후
  // (기본값 — 구조적 치료)
  return 'natural-pretty';
}

// 임플란트 병력 추론 (제목+설명 기반)
function inferMedicalHistory(c) {
  const text = ((c.title || '') + ' ' + (c.description || '')).toLowerCase();
  const history = [];
  
  if (/고혈압|혈압/.test(text)) history.push('고혈압');
  if (/당뇨/.test(text)) history.push('당뇨');
  if (/골다공증/.test(text)) history.push('골다공증');
  if (/심장|심혈관/.test(text)) history.push('심장질환');
  if (/혈액희석|항응고|아스피린|와파린/.test(text)) history.push('혈액희석제');
  if (/비스포스포네이트/.test(text)) history.push('비스포스포네이트');
  if (/흡연|담배/.test(text)) history.push('흡연');
  if (/뼈이식|골이식/.test(text)) history.push('뼈이식');
  if (/상악동거상|상악동|sinus/.test(text)) history.push('상악동거상');
  if (/무치악|전체.*틀니|틀니.*전체/.test(text)) history.push('무치악');
  if (/뇌수술|뇌경색|뇌/.test(text)) history.push('뇌경색');
  if (/유방암|암/.test(text)) history.push('암병력');
  if (/수면|미다졸람|진정/.test(text)) history.push('수면치료');
  if (/우울증/.test(text)) history.push('우울증');
  if (/트라우마|무서|겁/.test(text)) history.push('치과공포증');
  
  // 전신 질환 없으면 '건강'
  if (history.length === 0) history.push('건강');
  
  return history;
}

async function main() {
  console.log('=== 프로덕션 케이스 메타 데이터 업데이트 ===\n');
  console.log('Site:', SITE_URL);
  
  const cases = await fetchCases();
  console.log(`Total cases: ${cases.length}\n`);
  
  const updates = [];
  
  // 글로우네이트 케이스 - laminateStyle이 없는 것만
  const glownateNoStyle = cases.filter(c => c.category === 'glownate' && !c.laminateStyle);
  console.log(`Glownate without style: ${glownateNoStyle.length}`);
  
  for (const c of glownateNoStyle) {
    const style = inferGlownateStyle(c);
    console.log(`  [${c.id}] "${c.title.slice(0, 50)}" → ${style}`);
    updates.push({ id: c.id, laminateStyle: style });
  }
  
  // 임플란트 케이스 - medicalHistory가 빈 배열인 것만
  const implantNoHistory = cases.filter(c => c.category === 'implant' && (!c.medicalHistory || c.medicalHistory.length === 0));
  console.log(`\nImplant without history: ${implantNoHistory.length}`);
  
  for (const c of implantNoHistory) {
    const mh = inferMedicalHistory(c);
    console.log(`  [${c.id}] "${c.title.slice(0, 50)}" → [${mh.join(', ')}]`);
    updates.push({ id: c.id, medicalHistory: mh });
  }
  
  console.log(`\nTotal updates: ${updates.length}`);
  
  if (updates.length === 0) {
    console.log('Nothing to update!');
    return;
  }
  
  if (!ADMIN_COOKIE) {
    console.log('\n⚠️  ADMIN_COOKIE not set. Dry run only.');
    console.log('Usage: ADMIN_COOKIE=xxx node scripts/batch-update-meta.cjs');
    return;
  }
  
  console.log('\nSending batch update...');
  const result = await batchUpdate(updates);
  console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
