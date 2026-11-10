// 진료 상세 페이지 첫 화면 아래에 「한눈에 보기」 요약을 넣는다 (2026-11-10, 문석준 대표원장 시안 승인).
// - 무엇인가요: src/data/treatment-process-copy.json 의 ko.intro (이미 페이지 본문에 실려 있는 문장) 그대로.
// - 비용: 아래 COST 표. 값은 비급여 수가표(src/data/price-seed.ts)에 있는 항목만 옮겼다.
//   수가표에 해당 항목이 없는 진료는 금액을 쓰지 않고 수가표 링크만 둔다.
// - 기간: 넣지 않는다. 사이트 원고는 기간을 숫자로 약속하지 않는 방침이고, 근거 있는 수치가 없다.
// 수가표가 바뀌면 COST 도 함께 고친다(scripts/test 없이 값이 어긋나면 checkCosts 가 빌드에서 알린다).
const fs = require('node:fs');
const path = require('node:path');

const IMPLANT = '1개 80만~160만 원(오스템 CA 80만 · 오스템 SOI 100만 · 스트라우만 BLX 160만).';
const COST = {
  implant: IMPLANT + ' 골이식·상악동 거상술은 필요할 때 추가됩니다.',
  'implant-advanced': '단순 골이식 30만 원 · 복잡 골이식 50만 원 · 상악동 거상술 50만~100만 원. 임플란트 비용은 별도입니다.',
  'implant-sinus-lift': '단순 상악동 거상술 50만 원 · 복잡 상악동 거상술 100만 원. 임플란트 비용은 별도입니다.',
  'implant-flapless': '임플란트 비용에 비절개·네비게이션 수술 10만~30만 원이 추가됩니다.',
  'implant-navigation': '임플란트 비용에 비절개·네비게이션 수술 10만~30만 원이 추가됩니다.',
  'implant-sedation': '수면마취 20만 원. 임플란트 비용은 별도입니다.',
  'implant-overdenture': '임플란트 틀니 200만 원.',
  'fixture-osstem-ca': '오스템 CA 1개 80만 원.',
  'fixture-osstem-soi': '오스템 SOI 1개 100만 원.',
  sedation: '수면마취 20만 원.',
  invisalign: '300만~700만 원(익스프레스 300만 · 퍼스트 400만 · 라이트 450만 · 모더레이트 550만 · 컴프레시브 700만).',
  'invisalign-express': '인비절라인 익스프레스 300만 원.',
  'invisalign-first': '인비절라인 퍼스트 400만 원.',
  'invisalign-light': '인비절라인 라이트 450만 원.',
  'invisalign-moderate': '인비절라인 모더레이트 550만 원.',
  orthodontics: '클리피씨 500만 원 · 클라리티 울트라 550만 원.',
  'orthodontic-clippy-c': '클리피씨 500만 원.',
  'orthodontic-clarity-ultra': '클라리티 울트라 550만 원.',
  glownate: '글로우네이트 프리미엄 80만 원.',
  aesthetic: '앞니 파절 12만~70만 원 · 다이아스테마 30만~50만 원 · 블랙트라이앵글 25만 원.',
  resin: '부위와 범위에 따라 5만~25만 원.',
  cavity: '레진 5만~25만 원 · 세라믹 인레이 35만 원 · 지르코니아 크라운 55만 원.',
  inlay: '세라믹 인레이 치아당 35만 원.',
  crown: '지르코니아 크라운 치아당 55만 원.',
  denture: '부분틀니 150만 원 · 전체틀니 150만 원 · 임시 틀니 30만 원.',
  scaling: '비보험 스케일링 6만 원.',
  whitening: '소프트 블리칭 1회 4.9만 원 · 하드 블리칭 2회 8만 원.',
  bruxism: '이갈이 장치 100만 원 · 턱보톡스 7만 원.',
  pediatric: '유치 레진 6만~10만 원 · 불소 3만 원 · 웃음가스 1만 원.',
};

const ANCHOR = /<section\b[^>]*\bid=["']tg-understand["']/i;
const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// COST 에 적은 금액이 수가표에 실제로 있는 금액인지 확인한다. 없는 금액이 있으면 그 진료는 금액 없이 링크만 낸다.
function knownPrices(root) {
  const seed = fs.readFileSync(path.join(root, 'src/data/price-seed.ts'), 'utf8');
  const numbers = new Set();
  for (const cell of seed.match(/class=\\"price\\">[^<]*/g) || []) {
    for (const n of cell.replace(/^.*>/, '').match(/\d+(?:\.\d+)?/g) || []) numbers.add(n);
  }
  return numbers;
}
function checkCosts(root) {
  const known = knownPrices(root);
  const bad = {};
  for (const [slug, text] of Object.entries(COST)) {
    const missing = (text.match(/\d+(?:\.\d+)?(?=만)/g) || []).filter(n => !known.has(n));
    if (missing.length) bad[slug] = missing;
  }
  return bad;
}

function glance(name, intro, cost) {
  const costLine = cost
    ? `${esc(cost)} 정확한 금액은 진찰 후 서면으로 안내합니다. <a href="/pricing" style="color:#6B4226;font-weight:700;">전체 수가표</a>`
    : `상태와 치료 범위에 따라 달라 진찰 후 서면으로 안내합니다. <a href="/pricing" style="color:#6B4226;font-weight:700;">비급여 수가표 보기</a>`;
  // 넓은 화면에서는 '항목 | 내용' 두 칸, 좁은 화면에서는 내용이 항목 아래로 내려간다.
  const dt = 'style="margin:0;flex:0 0 84px;font-weight:800;color:#6B4226;font-size:15px;line-height:1.75;"';
  const dd = 'style="margin:0 0 8px;flex:1 1 calc(100% - 110px);min-width:240px;color:#44403C;font-size:16px;line-height:1.75;word-break:keep-all;"';
  return `<section class="tg-glance" aria-label="${esc(name)} 한눈에 보기" style="max-width:1200px;margin:0 auto;padding:20px 24px 0;"><div style="background:#FAF7F3;border:1px solid #EDE6DD;border-radius:16px;padding:22px 24px;"><h2 style="margin:0 0 14px;font-size:18px;font-weight:800;color:#292524;">${esc(name)} 한눈에 보기</h2><dl style="margin:0;display:flex;flex-wrap:wrap;gap:6px 18px;"><dt ${dt}>무엇인가요</dt><dd ${dd}>${esc(intro)}</dd><dt ${dt}>비용</dt><dd ${dd}>${costLine}</dd></dl></div></section>`;
}

// 원문에는 '아래 과정은 …'처럼 본문의 과정 그림을 가리키는 문장이 섞여 있다. 요약 자리에서는 그 문장만 뺀다.
function standalone(intro) {
  const sentences = intro.match(/[^.!?]+[.!?]+/g) || [intro];
  const kept = sentences.map(x => x.trim()).filter(x => !/^아래|아래 과정|여기서는/.test(x));
  return (kept.length ? kept : sentences.slice(0, 1)).join(' ').trim();
}

function syncTreatmentGlance(dist, root = path.join(__dirname, '..')) {
  const rows = JSON.parse(fs.readFileSync(path.join(root, 'src/data/treatment-process-copy.json'), 'utf8')).rows;
  const mismatched = checkCosts(root);
  let updated = 0, withCost = 0;
  for (const row of rows) {
    const file = path.join(dist, 'treatments', row.slug + '.html');
    if (!fs.existsSync(file) || !row.ko || !row.ko.intro) continue;
    const html = fs.readFileSync(file, 'utf8');
    if (!ANCHOR.test(html) || html.includes('class="tg-glance"')) continue;
    const keyword = /class="tg-title-keyword">([^<]+)</.exec(html);
    const name = keyword ? keyword[1].replace(/^천안\s*/, '').trim() : row.slug;
    const cost = mismatched[row.slug] ? '' : COST[row.slug] || '';
    if (cost) withCost++;
    fs.writeFileSync(file, html.replace(ANCHOR, match => glance(name, standalone(row.ko.intro), cost) + match));
    updated++;
  }
  return { updated, withCost, costMismatch: mismatched };
}

module.exports = { syncTreatmentGlance, checkCosts, COST };
