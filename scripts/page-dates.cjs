// 지역·의료진·FAQ 페이지 구조화데이터에 실제 최종 수정일(dateModified)을 넣는다.
// 날짜는 원본 파일의 마지막 Git 커밋 날짜다. Git 기록을 읽을 수 없으면 아무것도 넣지 않는다(날짜를 지어내지 않는다).
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const TARGETS = ['area', 'doctors', 'faq', 'faq.html'];
const PAGE_TYPES = ['MedicalWebPage', 'WebPage', 'FAQPage', 'ProfilePage', 'CollectionPage', 'AboutPage'];
const LD = /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi;

function lastCommitDates(root) {
  const dates = new Map();
  let out;
  try {
    out = cp.execFileSync('git', ['log', '--format=@%cs', '--name-only', '--', ...TARGETS], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  } catch { return dates; }
  let current = '';
  for (const line of out.split('\n')) {
    if (line.startsWith('@')) current = line.slice(1);
    else if (line && !dates.has(line)) dates.set(line, current);
  }
  return dates;
}

function findPage(node) {
  if (Array.isArray(node)) { for (const item of node) { const found = findPage(item); if (found) return found; } return null; }
  if (!node || typeof node !== 'object') return null;
  if ([].concat(node['@type'] || []).some(type => PAGE_TYPES.includes(type))) return node;
  return node['@graph'] ? findPage(node['@graph']) : null;
}

function stamp(html, date) {
  if (/"dateModified"/.test(html)) return html;
  let done = false;
  return html.replace(LD, (whole, open, body, close) => {
    if (done) return whole;
    let data;
    try { data = JSON.parse(body); } catch { return whole; }
    const page = findPage(data);
    if (!page) return whole;
    page.dateModified = date;
    done = true;
    return open + JSON.stringify(data) + close;
  });
}

function syncPageDates(dist, root = path.join(__dirname, '..')) {
  const dates = lastCommitDates(root);
  let updated = 0, skipped = 0;
  for (const [file, date] of dates) {
    if (!file.endsWith('.html') || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const target = path.join(dist, file);
    if (!fs.existsSync(target)) continue;
    const before = fs.readFileSync(target, 'utf8');
    const after = stamp(before, date);
    if (after !== before) { fs.writeFileSync(target, after); updated++; } else skipped++;
  }
  return { updated, alreadyDatedOrNoPageNode: skipped, known: dates.size };
}

module.exports = { syncPageDates, stamp };
