/**
 * Google Search Console - 색인 업데이트 요청 스크립트
 * 
 * 사용법:
 * 1. Google Cloud Console에서 OAuth2 Client ID 생성 (Web Application 타입)
 * 2. Authorized redirect URIs에 http://localhost:3333/callback 추가
 * 3. 아래 환경변수 설정 후 실행:
 *    GSC_CLIENT_ID=xxx GSC_CLIENT_SECRET=yyy node scripts/google-indexing.cjs
 * 
 * 또는 Google Cloud Console → APIs & Services → Credentials에서
 * Service Account를 만들고 Search Console에 사용자로 추가하면 자동화 가능
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// ============================================
// 설정
// ============================================
const SITE_URL = 'https://bdbddc.com';

// 색인 업데이트가 필요한 URL 목록
const URLS_TO_INDEX = [
  // 새로 추가된 픽스처 페이지
  '/treatments/fixture-osstem-ca',
  '/treatments/fixture-osstem-soi',
  '/treatments/fixture-straumann-roxolid',
  // 수정된 임플란트 메인 페이지
  '/treatments/implant',
  // 사이트맵
  '/sitemap.xml',
  '/sitemap-main.xml',
];

// ============================================
// IndexNow 제출 (Bing, Yandex, Naver, Seznam)
// ============================================
async function submitIndexNow() {
  const INDEXNOW_KEY = 'bdbddc2026indexnow';
  const engines = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  const urlList = URLS_TO_INDEX.map(path => `${SITE_URL}${path}`);
  const body = JSON.stringify({
    host: 'bdbddc.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList
  });

  console.log('\n📡 IndexNow 제출 중...');
  console.log(`   대상 URL: ${urlList.length}개`);

  for (const engine of engines) {
    try {
      const url = new URL(engine);
      const result = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });
      
      const statusEmoji = result.status === 200 || result.status === 202 ? '✅' : '⚠️';
      console.log(`   ${statusEmoji} ${url.hostname}: ${result.status}`);
    } catch (e) {
      console.log(`   ❌ ${engine}: ${e.message}`);
    }
  }
}

// ============================================
// Google Search Console Sitemap 제출 안내
// ============================================
function printGSCInstructions() {
  console.log('\n' + '═'.repeat(60));
  console.log('📋 Google Search Console 수동 작업 안내');
  console.log('═'.repeat(60));
  
  console.log('\n🔗 Step 1: Search Console에서 사이트맵 제출');
  console.log('   → https://search.google.com/search-console/sitemaps?resource_id=sc-domain:bdbddc.com');
  console.log('   → 사이트맵 URL 입력: sitemap.xml → [제출]');
  
  console.log('\n🔗 Step 2: URL 검사 도구로 개별 페이지 색인 요청');
  console.log('   → https://search.google.com/search-console/inspect');
  console.log('   → 아래 URL을 하나씩 입력 후 [색인 생성 요청] 클릭:');
  
  URLS_TO_INDEX.forEach((path, i) => {
    if (!path.includes('sitemap')) {
      console.log(`   ${i + 1}. ${SITE_URL}${path}`);
    }
  });

  console.log('\n🔗 Step 3: (선택) Google 색인 상태 확인');
  console.log('   → 구글에서 검색: site:bdbddc.com/treatments/fixture');
  console.log('   → 새 페이지가 검색 결과에 나타나면 색인 완료!');
  
  console.log('\n💡 Tip: 보통 새 페이지 색인에 24~72시간 소요됩니다.');
  console.log('   FAQPage 스키마가 있어 리치 결과 표시까지는 1~2주 걸릴 수 있습니다.');
}

// ============================================
// 현재 색인 상태 빠른 체크
// ============================================
async function checkIndexStatus() {
  console.log('\n🔍 현재 Google 색인 상태 확인 (site: 검색)...');
  
  const urls = URLS_TO_INDEX.filter(p => !p.includes('sitemap'));
  
  for (const path of urls) {
    const fullUrl = `${SITE_URL}${path}`;
    // 간단한 HTTP 접근성 체크
    try {
      const result = await new Promise((resolve, reject) => {
        https.get(fullUrl, { timeout: 5000 }, (res) => {
          resolve({ status: res.statusCode });
          res.destroy();
        }).on('error', reject);
      });
      const emoji = result.status === 200 ? '✅' : '⚠️';
      console.log(`   ${emoji} ${path} → HTTP ${result.status}`);
    } catch (e) {
      console.log(`   ❌ ${path} → ${e.message}`);
    }
  }
}

// ============================================
// 실행
// ============================================
async function main() {
  console.log('🚀 서울비디치과 — Google 색인 업데이트 작업');
  console.log('=' .repeat(60));
  console.log(`📅 실행 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
  console.log(`🌐 사이트: ${SITE_URL}`);
  console.log(`📄 대상 URL: ${URLS_TO_INDEX.length}개`);

  // 1. 페이지 접근성 확인
  await checkIndexStatus();

  // 2. IndexNow 제출
  await submitIndexNow();

  // 3. GSC 수동 작업 안내
  printGSCInstructions();

  console.log('\n' + '═'.repeat(60));
  console.log('✅ 자동 처리 완료! 위 수동 작업을 진행해주세요.');
  console.log('═'.repeat(60));
}

main().catch(console.error);
