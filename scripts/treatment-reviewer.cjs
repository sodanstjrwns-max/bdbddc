// 진료 상세 페이지에 감수 의료진과 최종 수정일을 화면·구조화데이터 양쪽에 표시한다.
// 2026-11-10 사용자(문석준 대표원장) 결정: 진료 페이지 전체를 대표원장 감수로 표시.
// 수정일은 페이지 JSON-LD의 dateModified 가 있을 때만 쓴다. 없으면 날짜를 지어내지 않는다.
const fs = require('node:fs');
const path = require('node:path');

const REVIEWER = { name: '문석준', role: '대표원장', url: '/doctors/moon' };
const ORIGIN = 'https://bdbddc.com';
const ANCHOR = /<section\b[^>]*\bid=["']tg-understand["']/i;
const LD = /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi;

function addReviewer(node) {
  let changed = false;
  if (Array.isArray(node)) { for (const item of node) changed = addReviewer(item) || changed; return changed; }
  if (!node || typeof node !== 'object') return false;
  const types = [].concat(node['@type'] || []);
  if (types.includes('MedicalWebPage') && !node.reviewedBy) {
    node.reviewedBy = { '@type': 'Person', name: REVIEWER.name, jobTitle: REVIEWER.role, url: ORIGIN + REVIEWER.url };
    changed = true;
  }
  if (node['@graph']) changed = addReviewer(node['@graph']) || changed;
  return changed;
}

function markReviewed(html) {
  if (!ANCHOR.test(html) || html.includes('class="tg-reviewed"')) return html;
  const modified = /"dateModified"\s*:\s*"(\d{4})-(\d{2})-(\d{2})/.exec(html);
  const date = modified ? `<span> · 최종 수정 <time datetime="${modified[1]}-${modified[2]}-${modified[3]}">${modified[1]}.${modified[2]}.${modified[3]}</time></span>` : '';
  const line = `<p class="tg-reviewed" style="max-width:1200px;margin:0 auto;padding:14px 24px 0;font-size:14px;line-height:1.6;color:#78716C"><a href="${REVIEWER.url}" style="color:#6B4226;font-weight:700;text-decoration:underline;text-underline-offset:3px">감수 ${REVIEWER.name} ${REVIEWER.role}</a>${date}</p>`;
  let out = html.replace(ANCHOR, match => line + match);
  out = out.replace(LD, (whole, open, body, close) => {
    let data;
    try { data = JSON.parse(body); } catch { return whole; }
    return addReviewer(data) ? open + JSON.stringify(data) + close : whole;
  });
  return out;
}

function syncTreatmentReviewer(dist) {
  const dir = path.join(dist, 'treatments');
  let updated = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.html') || name === 'index.html') continue;
    const file = path.join(dir, name);
    const before = fs.readFileSync(file, 'utf8');
    const after = markReviewed(before);
    if (after !== before) { fs.writeFileSync(file, after); updated++; }
  }
  return updated;
}

module.exports = { markReviewed, syncTreatmentReviewer };
