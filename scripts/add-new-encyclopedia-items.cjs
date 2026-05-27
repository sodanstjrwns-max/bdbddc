#!/usr/bin/env node
/**
 * 백과사전에 신규 항목 추가 스크립트
 * data/encyclopedia-updates/batch*.json의 항목 중 매칭 안 된 것들을 신규 추가
 */
const fs = require('fs');
const path = require('path');

const ENCYCLOPEDIA_PATH = path.join(__dirname, '..', 'public', 'data', 'encyclopedia.json');
const UPDATES_DIR = path.join(__dirname, '..', 'data', 'encyclopedia-updates');

// 한글 초성 추출
function getChosung(str) {
  const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const ch = str.charAt(0);
  const code = ch.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return '#';
  return CHOSUNG[Math.floor(code / 588)];
}

// 카테고리 매핑 (신규 항목용)
const CATEGORY_MAP = {
  '임플란트 보철': '임플란트',
  '임플란트 임시치아': '임플란트',
  '치주 포켓': '치주 질환',
  '치아 흔들림': '치주 질환',
  '잇몸 이식': '치료·시술',
  '턱관절 디스크': '턱관절·구강외과',
  '턱에서 소리': '턱관절·구강외과',
  '안면 비대칭': '턱관절·구강외과',
  '보툴리눔': '치료·시술',
  '교합 안정장치': '턱관절·구강외과',
  '치과 응급': '치료·시술',
  '치아 재식술 후 관리': '치료·시술',
  '치아 변위': '치과 질환',
  '소아 진정치료': '소아 치과',
  '행동조절': '소아 치과',
  '우식 위험도 평가': '구강 관리',
  '핏 앤 피셔 실란트': '소아 치과',
  '정기검진': '구강 관리',
  '구강검진': '구강 관리',
  '구강위생관리': '구강 관리',
  '타액검사': '구강 관리',
  // Batch 6 (151-180)
  '치주 수술 후 관리': '치주 질환',
  '잇몸 색소침착': '치주 질환',
  '약물성 치은 증식': '치주 질환',
  '부착치은': '치주 질환',
  '백반증': '구강 점막 질환',
  '홍반증': '구강 점막 질환',
  '구강암 자가검진': '구강 점막 질환',
  '점액낭종': '구강 점막 질환',
  '노인 구강관리': '전신 건강',
  '항암치료 환자 치과': '전신 건강',
  '당뇨 환자 치과': '전신 건강',
  '골다공증 환자 치과': '전신 건강',
  '심혈관 환자 치과': '전신 건강',
  '임신성 치은염': '여성·임산부 치과',
  '임신 중 치과치료': '여성·임산부 치과',
  '폐경기 구강건조': '여성·임산부 치과',
  '호르몬과 치과': '여성·임산부 치과',
  '거미스마일': '심미 치과',
  '치아 형태 수정': '심미 치과',
  '라미네이트 종류': '심미 치과',
  // Batch 7 (181-210)
  '디지털 인상': '디지털 치과',
  '3D 프린팅 치과': '디지털 치과',
  '가이드 수술': '디지털 치과',
  '디지털 보철': '디지털 치과',
  '국소마취': '마취·진정',
  '침윤마취': '마취·진정',
  '전달마취': '마취·진정',
  '수면 진정': '마취·진정',
  '아산화질소': '마취·진정',
  '임플란트 골유착 실패': '임플란트',
  '임플란트 신경 손상': '임플란트',
  '임플란트 상악동': '임플란트',
  '1급 부정교합': '교정',
  '2급 부정교합': '교정',
  '3급 부정교합': '교정',
  '공간': '교정',
  '정중선 불일치': '교정',
  '풀지르코니아': '보철',
  '보철 수명': '보철',
  '치근 천공': '신경치료',
  '파일 파절': '신경치료',
  '치근단 수술': '신경치료',
  // Batch 8 (211-240) - 17 new entries
  '어린이 충치 예방': '소아 치과',
  '치아 맹출 지연': '소아 치과',
  '턱관절 자가운동': '턱관절·구강외과',
  '턱관절 주사': '턱관절·구강외과',
  '만성 두통과 턱관절': '턱관절·구강외과',
  '이갈이 보톡스': '턱관절·구강외과',
  '단순 발치': '턱관절·구강외과',
  '복잡 발치': '턱관절·구강외과',
  '발치 후 통증': '턱관절·구강외과',
  '발치 후 출혈': '턱관절·구강외과',
  '골유도 재생술(GBR)': '치주 질환',
  '치은 이식 종류': '치주 질환',
  '치근 피개술': '치주 질환',
  '치주 유지관리': '치주 질환',
  '클리어얼라이너 부착물': '교정',
  '입술 열상': '턱관절·구강외과',
  '치아 변색(외상성)': '치수·치아 질환',
  // Batch 9 (241-270) - 27 new entries
  '힐링 어버트먼트': '임플란트',
  '임플란트 인상': '임플란트',
  '커스텀 어버트먼트': '임플란트',
  '임플란트 시멘트 vs 스크류': '임플란트',
  '마진(보철 변연)': '보철',
  '보철 색조 선택': '보철',
  '보철 교합 조정': '보철',
  '보철 시적': '보철',
  '보철 본드 시멘테이션': '보철',
  '노인 구강건조증': '전신 건강',
  '노인 뿌리 우식': '치수·치아 질환',
  '노인 의치 적응': '보철',
  '노인 연하장애': '전신 건강',
  '노인 치과 진정': '마취·진정',
  '비급여 동의서': '보험·비용',
  '실비보험 청구': '보험·비용',
  '치과 산정특례': '보험·비용',
  '치과 본인부담금': '보험·비용',
  '디지털 스마일 디자인(DSD)': '디지털 치과',
  'CAD/CAM 당일 보철': '디지털 치과',
  '디지털 진단 모형': '디지털 치과',
  '인트라오럴 카메라': '장비·기술',
  'AI 영상 판독': '장비·기술',
  '컴포짓 레진': '치과 재료',
  '인상재 종류': '치과 재료',
  '러버댐': '장비·기술',
  '마이크로스코프': '장비·기술',
};

console.log('📖 백과사전 로딩...');
const encyclopedia = JSON.parse(fs.readFileSync(ENCYCLOPEDIA_PATH, 'utf-8'));
const existingTerms = new Set(encyclopedia.items.map(i => i.term));
console.log(`   현재 ${encyclopedia.items.length}개 항목`);

// 모든 배치 파일 로드
const batchFiles = fs.readdirSync(UPDATES_DIR).filter(f => f.startsWith('batch') && f.endsWith('.json')).sort();

const newItems = [];
let nextId = Math.max(...encyclopedia.items.map(i => parseInt(i.id) || 0)) + 1;

for (const batchFile of batchFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(UPDATES_DIR, batchFile), 'utf-8'));
  for (const update of data.updates) {
    if (existingTerms.has(update.term)) continue;  // 기존 항목 스킵
    
    const category = CATEGORY_MAP[update.term];
    if (!category) {
      console.log(`   ⚠️  ${update.term}: 카테고리 매핑 없음, 스킵`);
      continue;
    }
    
    // short: detail의 첫 문장 추출 (~150자)
    const plainText = (update.detail || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const short = plainText.length > 150 ? plainText.substring(0, 147) + '...' : plainText;
    
    const newItem = {
      id: String(nextId++),
      term: update.term,
      chosung: getChosung(update.term),
      category: category,
      short: short,
      detail: update.detail,
      tags: [category],
      synonyms: update.synonyms || [],
    };
    
    if (update.link) newItem.link = update.link;
    if (update.guide) newItem.guide = update.guide;
    
    newItems.push(newItem);
    existingTerms.add(update.term);
    console.log(`   ➕ ${update.term} (${category}, ${update.detail.length}자)`);
  }
}

console.log(`\n📊 신규 추가: ${newItems.length}개`);

// 추가 후 정렬 (id 기준)
encyclopedia.items.push(...newItems);
encyclopedia.totalItems = encyclopedia.items.length;

fs.writeFileSync(ENCYCLOPEDIA_PATH, JSON.stringify(encyclopedia, null, 2), 'utf-8');
console.log(`\n💾 저장 완료: 총 ${encyclopedia.items.length}개 항목`);

// 통계
const stats = { extreme: 0, weak: 0, medium: 0, good: 0, rich: 0 };
encyclopedia.items.forEach(i => {
  const len = (i.detail || '').length;
  if (len < 150) stats.extreme++;
  else if (len < 300) stats.weak++;
  else if (len < 600) stats.medium++;
  else if (len < 1000) stats.good++;
  else stats.rich++;
});
console.log('\n📈 콘텐츠 분포:');
console.log(`   극빈약(<150): ${stats.extreme}개`);
console.log(`   빈약(150-299): ${stats.weak}개`);
console.log(`   보통(300-599): ${stats.medium}개`);
console.log(`   양호(600-999): ${stats.good}개`);
console.log(`   풍부(1000+): ${stats.rich}개`);
