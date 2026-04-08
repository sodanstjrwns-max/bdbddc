#!/usr/bin/env node
/**
 * FAQ 페이지 자동 생성 스크립트 v2 (전면 리디자인)
 * - treatment 페이지 수준의 고퀄리티 디자인
 * - 검색 기능, 카테고리 그룹, Q배지, 빠른 답변 카드
 * - 모든 16개 카테고리 FAQ 페이지 생성
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'faq-data.json');
const faqDir = path.join(__dirname, '..', 'faq');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// 카테고리별 아이콘 & FontAwesome 매핑
const categoryMeta = {
  implant: { icon: 'fa-tooth', emoji: '🦷', color: '#0ea5e9', bgGrad: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', expertTitle: '임플란트 전문의', badge: '전문센터' },
  invisalign: { icon: 'fa-teeth', emoji: '😁', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', expertTitle: '인비절라인 교정 전문의', badge: '다이아몬드 등급' },
  orthodontics: { icon: 'fa-teeth-open', emoji: '🦷', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', expertTitle: '교정 전문의', badge: '전문센터' },
  glownate: { icon: 'fa-star', emoji: '✨', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #fffbeb, #fef3c7)', expertTitle: '심미치료 전문의', badge: 'HOT' },
  sedation: { icon: 'fa-bed', emoji: '😴', color: '#6366f1', bgGrad: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', expertTitle: '수면진정 전문 의료진', badge: '안심 시스템' },
  'wisdom-tooth': { icon: 'fa-hand-holding-medical', emoji: '🦷', color: '#10b981', bgGrad: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', expertTitle: '구강외과 전문의', badge: 'CT 정밀진단' },
  pediatric: { icon: 'fa-baby', emoji: '👶', color: '#f472b6', bgGrad: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', expertTitle: '소아치과 전문의 3인', badge: '전문의 3인' },
  whitening: { icon: 'fa-sun', emoji: '🪥', color: '#06b6d4', bgGrad: 'linear-gradient(135deg, #ecfeff, #cffafe)', expertTitle: '심미치료 전문의', badge: '프리미엄' },
  cavity: { icon: 'fa-search', emoji: '🔍', color: '#3b82f6', bgGrad: 'linear-gradient(135deg, #eff6ff, #dbeafe)', expertTitle: '보존과 전문의', badge: '보존치료' },
  gum: { icon: 'fa-shield-virus', emoji: '🩸', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #fef2f2, #fee2e2)', expertTitle: '치주과 전문의', badge: '치주치료' },
  tmj: { icon: 'fa-bone', emoji: '🦴', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', expertTitle: '턱관절 전문의', badge: '턱관절센터' },
  scaling: { icon: 'fa-broom', emoji: '🧹', color: '#14b8a6', bgGrad: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', expertTitle: '치주과 전문의', badge: '예방치료' },
  'root-canal': { icon: 'fa-microscope', emoji: '🔬', color: '#6366f1', bgGrad: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', expertTitle: '보존과 전문의', badge: '정밀치료' },
  crown: { icon: 'fa-crown', emoji: '👑', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #fffbeb, #fef3c7)', expertTitle: '보철 전문의', badge: '보철치료' },
  denture: { icon: 'fa-teeth', emoji: '🦷', color: '#0ea5e9', bgGrad: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', expertTitle: '보철 전문의', badge: '보철치료' },
  emergency: { icon: 'fa-ambulance', emoji: '🚨', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #fef2f2, #fee2e2)', expertTitle: '365일 진료 의료진', badge: '365일 진료' }
};

// 카테고리별 전문가 설명
const expertTexts = {
  implant: '서울대 출신 전문의가 답변합니다',
  invisalign: '인비절라인 교정 전문의가 답변합니다',
  orthodontics: '교정 전문의가 답변합니다',
  glownate: '심미치료 전문의가 답변합니다',
  sedation: '수면진정 전문 의료진이 답변합니다',
  'wisdom-tooth': '구강외과 전문의가 답변합니다',
  pediatric: '소아치과 전문의 3인이 답변합니다',
  whitening: '심미치료 전문의가 답변합니다',
  cavity: '보존과 전문의가 답변합니다',
  gum: '치주과 전문의가 답변합니다',
  tmj: '턱관절·구강안면통증 전문의가 답변합니다',
  scaling: '치주과 전문의가 답변합니다',
  'root-canal': '보존과 전문의가 답변합니다',
  crown: '보철 전문의가 답변합니다',
  denture: '보철 전문의가 답변합니다',
  emergency: '365일 진료 전문 의료진이 답변합니다'
};

// 카테고리별 핵심 통계
const categoryStats = {
  implant: [{ value: '95~98%', label: '성공률' }, { value: '20~30년', label: '수명' }, { value: '6개', label: '전용 수술실' }],
  invisalign: [{ value: '12~18개월', label: '평균 기간' }, { value: '투명', label: '교정장치' }, { value: '다이아몬드', label: '등급' }],
  orthodontics: [{ value: '1.5~2.5년', label: '평균 기간' }, { value: '5가지+', label: '교정 방법' }, { value: '전문의', label: '협진' }],
  glownate: [{ value: '10~15년', label: '유지 기간' }, { value: '0.3mm', label: '최소 삭제' }, { value: '2~3회', label: '내원 횟수' }],
  sedation: [{ value: '안전', label: '수면치료' }, { value: '무통', label: '시술' }, { value: '365일', label: '가능' }],
  'wisdom-tooth': [{ value: '보험적용', label: '건강보험' }, { value: '3~7일', label: '회복 기간' }, { value: 'CT 정밀', label: '진단' }],
  pediatric: [{ value: '3인', label: '전문의' }, { value: '전용', label: '진료실' }, { value: '놀이방', label: '완비' }],
  whitening: [{ value: '1~2회', label: '시술 횟수' }, { value: '2~8톤', label: '밝기 개선' }, { value: '30~60분', label: '시술 시간' }],
  cavity: [{ value: '당일', label: '치료 가능' }, { value: '보험적용', label: '기본 치료' }, { value: '최소 삭제', label: '원칙' }],
  gum: [{ value: '보험적용', label: '기본 치료' }, { value: '조기 발견', label: '핵심' }, { value: '정기 관리', label: '중요' }],
  tmj: [{ value: '비수술', label: '우선 치료' }, { value: '맞춤', label: '스플린트' }, { value: '정밀 진단', label: 'CT/MRI' }],
  scaling: [{ value: '연 1회', label: '보험 적용' }, { value: '30분', label: '소요 시간' }, { value: '예방', label: '핵심' }],
  'root-canal': [{ value: '90%+', label: '성공률' }, { value: '1~3회', label: '내원 횟수' }, { value: '무통', label: '마취 시술' }],
  crown: [{ value: '10~15년', label: '수명' }, { value: '다양한', label: '재료 선택' }, { value: '맞춤', label: '제작' }],
  denture: [{ value: '맞춤', label: '제작' }, { value: '보험적용', label: '일부' }, { value: '즉일', label: '임시 틀니' }],
  emergency: [{ value: '365일', label: '진료' }, { value: '야간 20시', label: '평일' }, { value: '즉시', label: '대응' }]
};

// 카테고리별 요약 헤드라인
const heroHeadlines = {
  implant: { line1: '"다른 곳에서 안 된다고요?"', line2: '임플란트의 모든 궁금증 해결' },
  invisalign: { line1: '"교정 티 안 나게 할 수 있나요?"', line2: '투명교정의 모든 것' },
  orthodontics: { line1: '"교정, 얼마나 걸리고 아픈가요?"', line2: '치아교정 완전 가이드' },
  glownate: { line1: '"연예인 치아, 나도 가능한가요?"', line2: '글로우네이트 FAQ' },
  sedation: { line1: '"치과가 너무 무서워요"', line2: '수면치료로 편안하게' },
  'wisdom-tooth': { line1: '"사랑니, 꼭 빼야 하나요?"', line2: '사랑니 발치 완전 가이드' },
  pediatric: { line1: '"아이가 치과를 무서워해요"', line2: '소아치과 궁금증 해결' },
  whitening: { line1: '"치아 미백, 효과 있나요?"', line2: '미백의 모든 궁금증' },
  cavity: { line1: '"이가 시려요, 충치인가요?"', line2: '충치치료 완전 가이드' },
  gum: { line1: '"잇몸에서 피가 나요"', line2: '잇몸치료 궁금증 해결' },
  tmj: { line1: '"턱에서 소리가 나요"', line2: '턱관절장애 FAQ' },
  scaling: { line1: '"스케일링, 꼭 해야 하나요?"', line2: '스케일링 완전 가이드' },
  'root-canal': { line1: '"신경치료가 아프다던데..."', line2: '신경치료 궁금증 해결' },
  crown: { line1: '"크라운, 어떤 재료가 좋나요?"', line2: '크라운 완전 가이드' },
  denture: { line1: '"틀니, 잘 맞을까요?"', line2: '틀니 궁금증 해결' },
  emergency: { line1: '"치아가 갑자기 아파요!"', line2: '응급 치과 가이드' }
};

// FAQ 네비게이션 생성
function generateFaqNav(activeSlug) {
  const navItems = [
    { slug: 'implant', label: '임플란트' },
    { slug: 'invisalign', label: '인비절라인' },
    { slug: 'orthodontics', label: '치아교정' },
    { slug: 'glownate', label: '글로우네이트' },
    { slug: 'sedation', label: '수면치료' },
    { slug: 'wisdom-tooth', label: '사랑니' },
    { slug: 'pediatric', label: '소아치과' },
    { slug: 'whitening', label: '미백' },
    { slug: 'cavity', label: '충치' },
    { slug: 'gum', label: '잇몸' },
    { slug: 'root-canal', label: '신경치료' },
    { slug: 'crown', label: '크라운' },
    { slug: 'tmj', label: 'TMJ' },
    { slug: 'scaling', label: '스케일링' },
    { slug: 'denture', label: '틀니' },
    { slug: 'emergency', label: '응급' },
  ];
  return navItems.map(item => 
    `            <a href="/faq/${item.slug}" class="faq-nav-item${item.slug === activeSlug ? ' active' : ''}">${item.label}</a>`
  ).join('\n');
}

// FAQ Schema.org JSON-LD 생성
function generateFaqSchema(faqs) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
  return JSON.stringify(schema, null, 2);
}

// 인기 FAQ 3개 추출 (첫 3개 = 가장 많이 묻는 질문)
function generateTopFaqCards(faqs, slug) {
  const meta = categoryMeta[slug] || categoryMeta.implant;
  const top3 = faqs.slice(0, 3);
  return top3.map((faq, i) => {
    // 답변에서 첫 문장만 추출
    const shortAnswer = faq.a.split('.')[0] + '.';
    return `          <div class="faq-top-card" style="animation-delay: ${i * 0.1}s">
            <div class="faq-top-card-num" style="background: ${meta.color};">${i + 1}</div>
            <div class="faq-top-card-content">
              <h3>${faq.q}</h3>
              <p>${shortAnswer}</p>
            </div>
          </div>`;
  }).join('\n');
}

// FAQ 아이템 HTML 생성 (프리미엄 디자인)
function generateFaqItems(faqs) {
  return faqs.map((faq, i) => `            <div class="faq-item reveal">
                <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${i}">
                    <span class="faq-q-badge">${i + 1}</span>
                    <span class="faq-q-text">${faq.q}</span>
                    <i class="fas fa-chevron-down faq-icon"></i>
                </button>
                <div class="faq-answer" id="faq-answer-${i}">
                    <div class="faq-a-content">${faq.a}</div>
                </div>
            </div>`).join('\n');
}

// 연관 치료 페이지 링크
function getRelatedTreatmentLink(slug) {
  const map = {
    invisalign: '/treatments/invisalign',
    orthodontics: '/treatments/orthodontics',
    glownate: '/treatments/glownate',
    sedation: '/treatments/sedation',
    'wisdom-tooth': '/treatments/wisdom-tooth',
    pediatric: '/treatments/pediatric',
    whitening: '/treatments/whitening',
    cavity: '/treatments/cavity',
    gum: '/treatments/gum',
    tmj: '/treatments/tmj',
    scaling: '/treatments/scaling',
    'root-canal': '/treatments/root-canal',
    crown: '/treatments/crown',
    denture: '/treatments/denture',
    emergency: '/treatments/emergency',
    implant: '/treatments/implant'
  };
  return map[slug] || '/treatments/';
}

// 관련 FAQ 추천 (현재 카테고리 제외, 3개)
function getRelatedFaqs(currentSlug) {
  const relatedMap = {
    implant: ['crown', 'sedation', 'gum'],
    invisalign: ['orthodontics', 'whitening', 'glownate'],
    orthodontics: ['invisalign', 'wisdom-tooth', 'scaling'],
    glownate: ['whitening', 'crown', 'cavity'],
    sedation: ['implant', 'wisdom-tooth', 'pediatric'],
    'wisdom-tooth': ['sedation', 'emergency', 'scaling'],
    pediatric: ['sedation', 'cavity', 'orthodontics'],
    whitening: ['glownate', 'scaling', 'cavity'],
    cavity: ['root-canal', 'crown', 'scaling'],
    gum: ['scaling', 'root-canal', 'implant'],
    tmj: ['sedation', 'crown', 'orthodontics'],
    scaling: ['gum', 'cavity', 'whitening'],
    'root-canal': ['crown', 'cavity', 'sedation'],
    crown: ['root-canal', 'implant', 'glownate'],
    denture: ['implant', 'crown', 'gum'],
    emergency: ['wisdom-tooth', 'sedation', 'root-canal']
  };
  return (relatedMap[currentSlug] || ['implant', 'invisalign', 'scaling']).map(slug => {
    const info = data[slug];
    const meta = categoryMeta[slug] || categoryMeta.implant;
    return { slug, title: info ? info.title : slug, count: info ? info.faqs.length : 0, icon: meta.icon, color: meta.color };
  });
}

// 페이지 내 인라인 CSS (FAQ 전용 프리미엄 스타일)
function getFaqPageCSS(slug) {
  const meta = categoryMeta[slug] || categoryMeta.implant;
  return `
<style>
/* ─── FAQ Sub-page Premium Design v2 ─── */
.faq-sub-hero {
  position: relative;
  padding: 40px 24px 48px;
  ${meta.bgGrad ? `background: ${meta.bgGrad};` : ''}
  overflow: hidden;
}
.faq-sub-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, ${meta.color}08 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.faq-sub-hero .container {
  max-width: 1240px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}
.faq-sub-hero .breadcrumb {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.faq-sub-hero .breadcrumb a {
  color: var(--text-secondary);
  transition: color 0.2s;
}
.faq-sub-hero .breadcrumb a:hover { color: var(--brand); }
.faq-sub-hero .breadcrumb .sep { color: var(--gray-300); margin: 0 2px; }

.faq-page-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: ${meta.color}12;
  border: 1.5px solid ${meta.color}25;
  color: ${meta.color};
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 999px;
  margin-bottom: 16px;
}

.faq-sub-hero h1 {
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.25;
  color: var(--text-primary);
  margin-bottom: 12px;
}
.faq-sub-hero h1 .quote-line {
  display: block;
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: -0.01em;
  margin-bottom: 8px;
}

.faq-hero-desc {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 580px;
  margin-bottom: 24px;
}
.faq-hero-expert {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--white);
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}
.faq-hero-expert i { color: ${meta.color}; }

.faq-hero-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.faq-stat-item {
  text-align: center;
  min-width: 80px;
}
.faq-stat-value {
  font-size: 1.4rem;
  font-weight: 900;
  color: ${meta.color};
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.faq-stat-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-top: 4px;
}

/* ─── TOP FAQ Cards ─── */
.faq-top-section {
  padding: 48px 24px 32px;
  background: var(--white);
}
.faq-top-section .container { max-width: 1240px; margin: 0 auto; }
.faq-top-header {
  text-align: center;
  margin-bottom: 28px;
}
.faq-top-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.faq-top-header p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}
.faq-top-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 960px;
  margin: 0 auto;
}
.faq-top-card {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: var(--gray-50);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.25s ease;
  animation: fadeInUp 0.5s ease both;
}
.faq-top-card:hover {
  border-color: ${meta.color}30;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}
.faq-top-card-num {
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 800;
}
.faq-top-card-content h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}
.faq-top-card-content p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ─── Search Box ─── */
.faq-search-bar {
  padding: 0 24px;
  margin: -16px auto 0;
  max-width: 1240px;
  position: relative;
  z-index: 10;
}
.faq-search-box {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}
.faq-search-box input {
  width: 100%;
  padding: 16px 20px 16px 48px;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  font-size: 1rem;
  font-family: var(--font-family);
  background: var(--white);
  color: var(--text-primary);
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  transition: all 0.25s ease;
  outline: none;
}
.faq-search-box input:focus {
  border-color: ${meta.color};
  box-shadow: 0 4px 20px ${meta.color}15;
}
.faq-search-box input::placeholder { color: var(--text-tertiary); }
.faq-search-box .search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 1rem;
}
.faq-search-count {
  text-align: center;
  margin-top: 10px;
  font-size: 0.82rem;
  color: var(--text-tertiary);
  display: none;
}
.faq-search-count.visible { display: block; }

/* ─── FAQ Main Section (Premium) ─── */
.faq-main-section {
  padding: 48px 24px 64px;
  background: var(--white);
}
.faq-main-section .container { max-width: 840px; margin: 0 auto; }
.faq-main-section .faq-category-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 10px;
}
.faq-total-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: ${meta.color}10;
  color: ${meta.color};
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 999px;
}

/* Premium FAQ Item */
.faq-main-section .faq-item {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  margin-bottom: 10px;
  background: var(--white);
  transition: all 0.25s ease;
  overflow: hidden;
}
.faq-main-section .faq-item:hover {
  border-color: ${meta.color}30;
}
.faq-main-section .faq-item.active {
  border-color: ${meta.color}40;
  box-shadow: 0 4px 16px ${meta.color}10;
}
.faq-main-section .faq-question {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 18px 20px;
  cursor: pointer;
  border: none;
  background: none;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  text-align: left;
  transition: color 0.2s;
}
.faq-main-section .faq-question:hover { color: ${meta.color}; }
.faq-main-section .faq-question::after { display: none; }

.faq-main-section .faq-q-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  min-width: 30px;
  background: linear-gradient(135deg, var(--brand), #8b5a2b);
  color: #fff;
  font-weight: 800;
  font-size: 0.82rem;
  border-radius: 10px;
  flex-shrink: 0;
}
.faq-main-section .faq-item.active .faq-q-badge {
  background: linear-gradient(135deg, ${meta.color}, ${meta.color}cc);
}
.faq-main-section .faq-q-text {
  flex: 1;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.5;
}
.faq-main-section .faq-item.active .faq-q-text { color: ${meta.color}; }
.faq-main-section .faq-icon {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}
.faq-main-section .faq-item.active .faq-icon {
  transform: rotate(180deg);
  color: ${meta.color};
}

.faq-main-section .faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease, padding 0.35s ease;
}
.faq-main-section .faq-item.active .faq-answer {
  max-height: 600px;
  padding: 0 20px 20px 62px;
}
.faq-main-section .faq-a-content {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.85;
  padding: 16px 20px;
  background: var(--gray-50);
  border-radius: 12px;
  border-left: 3px solid ${meta.color};
}
.faq-no-results {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-tertiary);
  display: none;
}
.faq-no-results i { font-size: 2rem; margin-bottom: 12px; display: block; }

/* ─── Related FAQ Cards ─── */
.faq-related-section {
  padding: 48px 24px;
  background: var(--gray-50);
}
.faq-related-section .container { max-width: 1240px; margin: 0 auto; }
.faq-related-header {
  text-align: center;
  margin-bottom: 24px;
}
.faq-related-header h2 { font-size: 1.4rem; font-weight: 800; }
.faq-related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 840px;
  margin: 0 auto;
}
.faq-related-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.25s ease;
}
.faq-related-card:hover {
  border-color: var(--brand-gold-light);
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}
.faq-related-card-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.1rem;
}
.faq-related-card-body h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}
.faq-related-card-body span {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .faq-top-grid { grid-template-columns: 1fr; }
  .faq-related-grid { grid-template-columns: 1fr; }
  .faq-hero-stats { gap: 16px; }
  .faq-stat-item { min-width: 60px; }
  .faq-sub-hero { padding: 32px 20px 40px; }
  .faq-main-section .faq-item.active .faq-answer { padding: 0 16px 16px 16px; }
  .faq-main-section .faq-question { padding: 16px; }
  .faq-main-section .faq-q-badge { width: 26px; height: 26px; min-width: 26px; font-size: 0.75rem; border-radius: 8px; }
}
</style>`;
}

// HTML 페이지 생성
function generateFaqPage(slug, info) {
  const meta = categoryMeta[slug] || categoryMeta.implant;
  const expert = expertTexts[slug] || '서울대 출신 전문의가 답변합니다';
  const faqCount = info.faqs.length;
  const treatmentLink = getRelatedTreatmentLink(slug);
  const stats = categoryStats[slug] || [];
  const headline = heroHeadlines[slug] || { line1: `"${info.title} 궁금하시죠?"`, line2: `${info.title} FAQ` };
  const relatedFaqs = getRelatedFaqs(slug);

  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<!-- End Google Tag Manager -->
<!-- GA4 gtag.js -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3NQP355YQM"></script>
<!-- Amplitude Script Loader -->
<script src="https://cdn.amplitude.com/script/87529341cb075dcdbefabce3994958aa.js"></script>
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '971255062435276');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=971255062435276&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${info.title} 자주 묻는 질문 | 천안 ${info.title} FAQ - 서울비디치과</title>
  <meta name="description" content="${info.description}">
  <meta name="abstract" content="${info.description}">
  <meta name="ai-summary" content="${info.description}">
  <meta name="keywords" content="${info.keywords}">
  <meta name="author" content="서울비디치과">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://bdbddc.com/faq/${slug}">
  <meta name="geo.region" content="KR-44">
  <meta name="geo.placename" content="천안시, 충청남도">
  <meta name="geo.position" content="36.8151;127.1139">
  <meta property="og:title" content="${info.title} FAQ | 서울비디치과">
  <meta property="og:description" content="${info.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bdbddc.com/faq/${slug}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="서울비디치과">
  <meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${info.title} FAQ | 서울비디치과">
  <meta name="twitter:description" content="${info.description}">
  <meta name="twitter:image" content="https://bdbddc.com/images/og-image-v2.jpg">
  <link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.svg">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#6B4226">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="../css/site-v5.css?v=b413d3a5">
  <link rel="prefetch" href="/reservation" as="document">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"FAQ","item":"https://bdbddc.com/faq"},{"@type":"ListItem","position":3,"name":"${info.title} FAQ","item":"https://bdbddc.com/faq/${slug}"}]}
  </script>
<script type="application/ld+json">
${generateFaqSchema(info.faqs)}
</script>
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Dentist",
  "@id": "https://bdbddc.com/#dentist",
  "name": "서울비디치과",
  "telephone": "+82-41-415-2892",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "불당34길 14, 1~5층",
    "addressLocality": "천안시 서북구 불당동",
    "addressRegion": "충청남도",
    "addressCountry": "KR"
  },
  "sameAs": ["https://pf.kakao.com/_Cxivlxb","https://www.youtube.com/@BDtube","https://www.youtube.com/@geoptongryung","https://naver.me/5yPnKmqQ"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "2847",
    "bestRating": "5"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.8151,
    "longitude": 127.1139
  },
  "openingHoursSpecification": [
    {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"20:00"},
    {"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"09:00","closes":"17:00"},
    {"@type":"OpeningHoursSpecification","dayOfWeek":"PublicHolidays","opens":"09:00","closes":"13:00"}
  ],
  "areaServed": [
    {"@type":"City","name":"천안시"},{"@type":"City","name":"아산시"},{"@type":"City","name":"세종시"},
    {"@type":"City","name":"대전시"},{"@type":"City","name":"청주시"},{"@type":"City","name":"평택시"},
    {"@type":"City","name":"공주시"},{"@type":"City","name":"당진시"},{"@type":"City","name":"서산시"},
    {"@type":"City","name":"논산시"},{"@type":"City","name":"예산군"},{"@type":"City","name":"홍성군"},
    {"@type":"City","name":"충주시"},{"@type":"City","name":"진천군"},{"@type":"City","name":"안성시"}
  ]
}</script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebPage","speakable":{"@type":"SpeakableSpecification","cssSelector":[".faq-sub-hero h1",".faq-hero-desc",".faq-category-title"]}}
  </script>
<script src="/js/analytics.js?v=20260408v6" defer></script>
<!-- Weglot Multilingual -->
<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>
<script>
    Weglot.initialize({
        api_key: 'wg_cd7087d43782c81ecb41e27570c3bfcd2'
    });
</script>
${getFaqPageCSS(slug)}
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  <header class="site-header" id="siteHeader">
    <div class="header-container">
      <div class="header-brand">
        <a href="/" class="site-logo" aria-label="서울비디치과 홈"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a>
        <div class="clinic-status open" aria-live="polite"><span class="status-dot"></span><span class="status-text">진료중</span><span class="status-time">20:00까지</span></div>
      </div>
      <nav class="main-nav" id="mainNav" aria-label="메인 네비게이션">
        <ul>
          <li class="nav-item has-dropdown">
            <a href="/treatments/">진료</a>
            <div class="mega-dropdown"><div class="mega-dropdown-grid">
              <div class="mega-dropdown-section"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/glownate">✨ 글로우네이트 <span class="badge badge-hot">HOT</span></a></li><li><a href="/treatments/implant">임플란트 <span class="badge">6개 수술실</span></a></li><li><a href="/treatments/invisalign">인비절라인 <span class="badge">다이아몬드</span></a></li><li><a href="/treatments/orthodontics">치아교정 <span class="badge badge-hot">NEW</span></a></li><li><a href="/treatments/pediatric">소아치과 <span class="badge">전문의 3인</span></a></li><li><a href="/treatments/aesthetic">심미레진</a></li></ul></div>
              <div class="mega-dropdown-section"><strong class="section-heading">일반/보존 진료</strong><ul><li><a href="/treatments/cavity">충치치료</a></li><li><a href="/treatments/resin">레진치료</a></li><li><a href="/treatments/crown">크라운</a></li><li><a href="/treatments/inlay">인레이/온레이</a></li><li><a href="/treatments/root-canal">신경치료</a></li><li><a href="/treatments/whitening">미백</a></li></ul></div>
              <div class="mega-dropdown-section"><strong class="section-heading">잇몸/외과</strong><ul><li><a href="/treatments/scaling">스케일링</a></li><li><a href="/treatments/gum">잇몸치료</a></li><li><a href="/treatments/periodontitis">치주염</a></li><li><a href="/treatments/wisdom-tooth">사랑니 발치</a></li><li><a href="/treatments/tmj">턱관절장애</a></li><li><a href="/treatments/bruxism">이갈이/이악물기</a></li></ul></div>
            </div></div>
          </li>
          <li class="nav-item"><a href="/doctors/">의료진</a></li>
          <li class="nav-item"><a href="/mission">비디미션</a></li>
          <li class="nav-item has-dropdown"><a href="/blog/">콘텐츠</a><ul class="simple-dropdown"><li><a href="/blog/"><i class="fas fa-blog"></i> 블로그</a></li><li><a href="/video/"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="/cases/gallery"><i class="fas fa-lock"></i> 비포/애프터</a></li><li><a href="/encyclopedia/"><i class="fas fa-book-medical"></i> 치과 백과사전</a></li></ul></li>
          <li class="nav-item has-dropdown"><a href="/directions">안내</a><ul class="simple-dropdown"><li><a href="/pricing" class="nav-highlight">💰 비용 안내</a></li><li><a href="/floor-guide">비디치과 둘러보기</a></li><li><a href="/directions">오시는 길</a></li><li><a href="/faq">자주 묻는 질문</a></li><li><a href="/notice/"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
          <li class="nav-item has-dropdown"><a href="/games" style="color:#EC4899;font-weight:700;">🎮 플레이</a><ul class="simple-dropdown"><li><a href="/flight"><i class="fas fa-rocket"></i> 치석 플라이트</a></li><li><a href="/run"><i class="fas fa-running"></i> 투쓰런</a></li><li><a href="/checkup"><i class="fas fa-dna"></i> 치BTI</a></li><li><a href="/games"><i class="fas fa-th"></i> 전체 게임</a></li></ul></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="tel:0414152892" class="header-phone" aria-label="전화 문의"><i class="fas fa-phone"></i></a>
        <div class="auth-buttons"><a href="/auth/login" class="btn-auth btn-login"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="/auth/register" class="btn-auth btn-register"><i class="fas fa-user-plus"></i> 회원가입</a></div>
        <a href="/reservation" class="btn-reserve"><i class="fas fa-calendar-check"></i> 예약하기</a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
  <div class="header-spacer"></div>

  <main id="main-content" role="main">

    <!-- ═══════ Treatment-style Sub Hero ═══════ -->
    <section class="faq-sub-hero" aria-label="${info.title} FAQ">
      <div class="container">
        <div class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><a href="/faq">FAQ</a><span class="sep">/</span><span>${info.title}</span></div>
        <div class="faq-page-badge"><i class="fas ${meta.icon}"></i> ${meta.badge}</div>
        <h1>
          <span class="quote-line">${headline.line1}</span>
          <span class="text-gradient">${headline.line2}</span>
        </h1>
        <p class="faq-hero-desc">${info.description}</p>
        <div class="faq-hero-expert"><i class="fas fa-user-md"></i> ${expert}</div>
        <div class="faq-hero-stats">
${stats.map(s => `          <div class="faq-stat-item"><span class="faq-stat-value">${s.value}</span><span class="faq-stat-label">${s.label}</span></div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- ═══════ FAQ Category Navigation ═══════ -->
    <section class="faq-nav">
        <div class="faq-nav-container">
${generateFaqNav(slug)}
        </div>
    </section>

    <!-- ═══════ TOP 3 FAQ Cards ═══════ -->
    <section class="faq-top-section">
      <div class="container">
        <div class="faq-top-header">
          <h2><i class="fas fa-fire" style="color: #ef4444;"></i> 가장 많이 묻는 질문</h2>
          <p>환자분들이 가장 궁금해하는 TOP 3</p>
        </div>
        <div class="faq-top-grid">
${generateTopFaqCards(info.faqs, slug)}
        </div>
      </div>
    </section>

    <!-- ═══════ Search ═══════ -->
    <div class="faq-search-bar">
      <div class="faq-search-box">
        <i class="fas fa-search search-icon"></i>
        <input type="text" id="faqSearchInput" placeholder="${info.title} FAQ 검색... (예: 비용, 통증, 기간)" autocomplete="off">
      </div>
      <p class="faq-search-count" id="faqSearchCount"></p>
    </div>

    <!-- ═══════ FAQ Main Content ═══════ -->
    <section class="faq-main-section">
        <div class="container">
            <h2 class="faq-category-title">
              <i class="fas ${meta.icon}" style="color: ${meta.color};"></i>
              ${info.title} 자주 묻는 질문
              <span class="faq-total-badge">${faqCount}개</span>
            </h2>
${generateFaqItems(info.faqs)}
            <div class="faq-no-results" id="faqNoResults">
              <i class="fas fa-search"></i>
              <p>검색 결과가 없습니다.<br>다른 키워드로 검색해 보세요.</p>
            </div>
        </div>
    </section>

    <!-- ═══════ CTA Section ═══════ -->
    <section class="section-cta reveal">
      <div class="container">
        <div class="cta-card">
          <h2 class="cta-headline">더 궁금한 점이 있으신가요?</h2>
          <p class="cta-sub">${info.title} 관련 궁금한 점은 서울비디치과 전문의에게 직접 상담받으세요.</p>
          <div class="cta-buttons">
            <a href="/reservation" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> 상담 예약</a>
            <a href="tel:041-415-2892" class="btn btn-outline btn-lg"><i class="fas fa-phone"></i> 041-415-2892</a>
          </div>
          <p class="cta-phone"><i class="fas fa-clock"></i> 365일 진료 | 평일 09:00-20:00 | 토·일 09:00-17:00</p>
        </div>
      </div>
    </section>

    <!-- ═══════ Related FAQ ═══════ -->
    <section class="faq-related-section">
      <div class="container">
        <div class="faq-related-header">
          <h2>다른 FAQ도 확인해 보세요</h2>
        </div>
        <div class="faq-related-grid">
${relatedFaqs.map(r => `          <a href="/faq/${r.slug}" class="faq-related-card">
            <div class="faq-related-card-icon" style="background: ${r.color}12; color: ${r.color};"><i class="fas ${r.icon}"></i></div>
            <div class="faq-related-card-body"><h3>${r.title} FAQ</h3><span>${r.count}개 질문</span></div>
          </a>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- ═══════ Page Nav ═══════ -->
    <section class="section-sm">
      <div class="container">
        <div class="page-nav-v2">
          <a href="/faq" class="prev"><span class="nav-label"><i class="fas fa-arrow-left"></i> 이전</span><span class="nav-title">전체 FAQ</span></a>
          <a href="${treatmentLink}" class="next"><span class="nav-label">자세히 <i class="fas fa-arrow-right"></i></span><span class="nav-title">${info.title} 상세 안내</span></a>
        </div>
      </div>
    </section>

    <section class="section-sm">
      <div class="container">
        <div class="legal-box">*본 정보는 의료법 및 의료광고 심의 기준을 준수하며, 개인에 따라 결과가 다를 수 있습니다. 반드시 전문의와 상담 후 결정하시기 바랍니다.</div>
      </div>
    </section>
  </main>
  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand"><a href="/" class="footer-logo"><span class="logo-icon">🦷</span><span class="logo-text">서울비디치과</span></a><p class="footer-slogan">Best Dedication - 정성을 다하는 헌신</p></div>
        <div class="footer-links">
          <div class="footer-col"><strong class="section-heading">전문센터</strong><ul><li><a href="/treatments/implant">임플란트센터</a></li><li><a href="/treatments/invisalign">인비절라인</a></li><li><a href="/treatments/orthodontics">치아교정</a></li><li><a href="/treatments/pediatric">소아치과</a></li><li><a href="/treatments/glownate">심미레진</a></li></ul></div>
          <div class="footer-col"><strong class="section-heading">병원 안내</strong><ul><li><a href="/doctors/">의료진</a></li><li><a href="/mission">비디미션</a></li><li><a href="/floor-guide">비디치과 둘러보기</a></li><li><a href="/cases/gallery">Before/After</a></li><li><a href="/column/">원장 컬럼</a></li></ul></div>
          <div class="footer-col"><strong class="section-heading">고객 지원</strong><ul><li><a href="/reservation">예약/상담</a></li><li><a href="/blog/">블로그/콘텐츠</a></li><li><a href="/faq">자주 묻는 질문</a></li><li><a href="/directions">오시는 길</a></li></ul></div>
        </div>
      </div>
      <div class="footer-info">
        <div class="footer-contact"><p><i class="fas fa-map-marker-alt"></i> 충남 천안시 서북구 불당34길 14, 1~5층</p><p><i class="fas fa-phone"></i> 041-415-2892</p><div class="footer-hours"><p><i class="fas fa-clock"></i> <strong>365일 진료</strong></p><p>평일 09:00-20:00 (점심 12:30-14:00)</p><p>토·일 09:00-17:00</p><p>공휴일 09:00-13:00</p></div></div>
        <div class="footer-social"><a href="https://naver.me/5yPnKmqQ" target="_blank" rel="noopener" aria-label="네이버 예약"><i class="fas fa-calendar-check"></i></a><a href="https://www.youtube.com/@BDtube" target="_blank" rel="noopener" aria-label="유튜브"><i class="fab fa-youtube"></i></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" aria-label="카카오톡"><i class="fas fa-comment"></i></a></div>
      </div>
      <div class="footer-legal">
        <div class="legal-links"><a href="/privacy">개인정보 처리방침</a><span>|</span><a href="/terms">이용약관</a><span>|</span><a href="/sitemap.xml">사이트맵</a></div>
        <p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수하여 제공하고 있으며, 특정 개인의 결과는 개인에 따라 달라질 수 있습니다.</p>
        <p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
        <div class="business-info" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:0.72rem;color:rgba(255,255,255,0.35);line-height:1.8;">
          <p>상호: 불당본점서울비디치과의원 | 대표자: 현정민 외 2명 | 사업자등록번호: 228-11-02956</p>
          <p>주소: 충청남도 천안시 서북구 불당34길 14, 1~5층 | 개업일: 2021.05.24</p>
          <p>전화: 041-415-2892 | <a href="/images/business-license.png" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.45);text-decoration:underline;">사업자등록증 보기</a></p>
        </div>
      </div>
    </div>
  </footer>
  <nav class="mobile-nav" id="mobileNav" aria-label="모바일 메뉴">
    <div class="mobile-nav-header"><span class="logo-icon">🦷</span><button class="mobile-nav-close" id="mobileNavClose" aria-label="메뉴 닫기"><i class="fas fa-times"></i></button></div>
    <ul class="mobile-nav-menu">
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-tooth"></i> 진료 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="/treatments/">전체 진료</a></li><li class="submenu-divider">전문센터</li><li><a href="/treatments/glownate" style="color:#6B4226;font-weight:600;">✨ 글로우네이트</a></li><li><a href="/treatments/implant">임플란트센터</a></li><li><a href="/treatments/invisalign">인비절라인</a></li><li><a href="/treatments/orthodontics">치아교정</a></li><li><a href="/treatments/pediatric">소아치과</a></li><li><a href="/treatments/aesthetic">심미레진</a></li><li class="submenu-divider">일반 진료</li><li><a href="/treatments/cavity">충치치료</a></li><li><a href="/treatments/resin">레진치료</a></li><li><a href="/treatments/scaling">스케일링</a></li><li><a href="/treatments/gum">잇몸치료</a></li></ul></li>
      <li><a href="/doctors/"><i class="fas fa-user-md"></i> 의료진</a></li>
      <li><a href="/mission"><i class="fas fa-heart"></i> 비디미션</a></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-newspaper"></i> 콘텐츠 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="/blog/"><i class="fas fa-blog"></i> 블로그</a></li><li><a href="/video/"><i class="fab fa-youtube"></i> 영상</a></li><li><a href="/cases/gallery"><i class="fas fa-lock"></i> 비포/애프터</a></li><li><a href="/encyclopedia/"><i class="fas fa-book-medical"></i> 치과 백과사전</a></li></ul></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false"><i class="fas fa-hospital"></i> 안내 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="/pricing">💰 비용 안내</a></li><li><a href="/floor-guide">비디치과 둘러보기</a></li><li><a href="/directions">오시는 길</a></li><li><a href="/faq">자주 묻는 질문</a></li><li><a href="/notice/"><i class="fas fa-bullhorn"></i> 공지사항</a></li></ul></li>
      <li class="mobile-nav-item has-submenu"><a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false" style="color:#EC4899;font-weight:700;">🎮 플레이 <i class="fas fa-chevron-down toggle-icon"></i></a><ul class="mobile-nav-submenu"><li><a href="/flight"><i class="fas fa-rocket"></i> 치석 플라이트</a></li><li><a href="/run"><i class="fas fa-running"></i> 투쓰런</a></li><li><a href="/checkup"><i class="fas fa-dna"></i> 치BTI</a></li><li><a href="/games"><i class="fas fa-th"></i> 전체 게임</a></li></ul></li>
      <li><a href="/reservation" class="highlight"><i class="fas fa-calendar-check"></i> 예약하기</a></li>
    </ul>
    <div class="mobile-auth-buttons"><a href="/auth/login" class="btn-auth"><i class="fas fa-sign-in-alt"></i> 로그인</a><a href="/auth/register" class="btn-auth"><i class="fas fa-user-plus"></i> 회원가입</a></div>
    <div class="mobile-nav-footer"><p class="mobile-nav-hours"><i class="fas fa-clock"></i> 365일 진료 | 평일 야간진료</p><div class="mobile-nav-quick-btns"><a href="/pricing" class="btn btn-secondary btn-lg"><i class="fas fa-won-sign"></i> 비용 안내</a><a href="tel:041-415-2892" class="btn btn-primary btn-lg"><i class="fas fa-phone"></i> 전화 예약</a></div></div>
  </nav>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>
  <div class="floating-cta desktop-only"><a href="javascript:void(0)" class="floating-btn top" aria-label="맨 위로" id="scrollToTopBtn"><i class="fas fa-arrow-up"></i><span class="tooltip">맨 위로</span></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="floating-btn kakao" aria-label="카카오톡 상담"><i class="fas fa-comment-dots"></i><span class="tooltip">카카오톡 상담</span></a><a href="tel:0414152892" class="floating-btn phone" aria-label="전화 상담"><i class="fas fa-phone"></i><span class="tooltip">전화 상담</span></a></div>
  <div class="mobile-bottom-cta mobile-only" aria-label="빠른 연락"><a href="tel:041-415-2892" class="mobile-cta-btn phone"><i class="fas fa-phone-alt"></i><span>전화</span></a><a href="https://pf.kakao.com/_Cxivlxb" target="_blank" rel="noopener" class="mobile-cta-btn kakao"><i class="fas fa-comment"></i><span>카카오톡</span></a><a href="/reservation" class="mobile-cta-btn reserve primary"><i class="fas fa-calendar-check"></i><span>예약</span></a><a href="/directions" class="mobile-cta-btn location"><i class="fas fa-map-marker-alt"></i><span>오시는 길</span></a></div>
  <script src="/js/main.js" defer></script>
  <script src="/js/gnb.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded',function(){
      // FAQ toggle (premium)
      document.querySelectorAll('.faq-main-section .faq-question').forEach(function(btn){
        btn.addEventListener('click',function(){
          var item=this.parentElement;
          var expanded=this.getAttribute('aria-expanded')==='true';
          // Close all
          document.querySelectorAll('.faq-main-section .faq-item.active').forEach(function(i){
            i.classList.remove('active');
            i.querySelector('.faq-question').setAttribute('aria-expanded','false');
          });
          // Open if was closed
          if(!expanded){
            item.classList.add('active');
            this.setAttribute('aria-expanded','true');
            // Smooth scroll into view
            setTimeout(function(){ item.scrollIntoView({behavior:'smooth',block:'nearest'}); }, 100);
          }
        });
      });

      // FAQ Search
      var searchInput=document.getElementById('faqSearchInput');
      var searchCount=document.getElementById('faqSearchCount');
      var noResults=document.getElementById('faqNoResults');
      if(searchInput){
        searchInput.addEventListener('input',function(){
          var q=this.value.toLowerCase().trim();
          var items=document.querySelectorAll('.faq-main-section .faq-item');
          var visible=0;
          items.forEach(function(item){
            var text=item.textContent.toLowerCase();
            if(!q||text.indexOf(q)!==-1){
              item.style.display='';
              visible++;
            } else {
              item.style.display='none';
            }
          });
          if(q){
            searchCount.textContent=visible+'개 결과';
            searchCount.classList.add('visible');
            noResults.style.display=visible===0?'block':'none';
          } else {
            searchCount.classList.remove('visible');
            noResults.style.display='none';
          }
        });
      }

      // Reveal animation
      var els=document.querySelectorAll('.reveal');
      if(!els.length)return;
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}
        });
      },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
      els.forEach(function(el){obs.observe(el);});
    });
  </script>
</body>
</html>`;
}

// 메인 실행
let created = 0;

for (const [slug, info] of Object.entries(data)) {
  const html = generateFaqPage(slug, info);
  const outPath = path.join(faqDir, `${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`✅ CREATED: faq/${slug}.html (${info.faqs.length} FAQs, ${(html.length / 1024).toFixed(1)}KB)`);
  created++;
}

console.log(`\n📊 결과: ${created}개 생성`);
console.log(`📁 총 FAQ 페이지: ${created}개`);

// 전체 FAQ 수 계산
let totalFaqs = 0;
for (const info of Object.values(data)) {
  totalFaqs += info.faqs.length;
}
console.log(`❓ 총 FAQ 질문 수: ${totalFaqs}개`);
