// Release guard for the user's external-review-only policy. Does not assess medical legality.
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

function inspectReviewDisplay(html) {
  const root = parse(html);
  const issues = [];
  for (const selector of ['.review-card', '.review-card-v2', '.review-rating', '.review-stars', '.reviews-stats', '.gn-magazine-quote cite']) {
    if (root.querySelector(selector)) issues.push(`embedded testimonial: ${selector}`);
  }
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach(visit);
    const types = [].concat(value['@type'] || []);
    if (types.some(t => /^(AggregateRating|Review|Rating)$/.test(t)) || value.aggregateRating || value.reviewRating) issues.push('review/rating structured data');
    Object.values(value).forEach(visit);
  }
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try { visit(JSON.parse(script.text)); } catch { /* SEO checker separately validates JSON-LD syntax. */ }
  }
  const meta = root.querySelectorAll('meta[content]').map(n => n.getAttribute('content')).join(' ');
  root.querySelectorAll('script,style,code,pre').forEach(n => n.remove());
  const text = `${meta} ${root.text}`.replace(/\s+/g, ' ');
  const patterns = [
    [/(?:네이버|구글|Google|Naver)\s*[★⭐:]?\s*(?:[0-4]\.\d{1,2}|5(?:\.0{1,2})?)(?!\d)/i, 'clinic rating score'],
    [/(?:만족도|satisfaction)\s*[:：]?\s*\d+(?:\.\d+)?\s*%/i, 'patient satisfaction percentage'],
    [/\d+(?:\.\d+)?\s*%\+?\s*(?:환자\s*만족도|(?:patient\s*)?satisfaction|患者満足度)/i, 'patient satisfaction percentage before label'],
    [/구글 평점/, 'clinic rating label'],
    [/환자분들이 가장 많이 하시는 말씀/, 'promotional patient quotation'],
    [/라미네이트 후기에서 가장 만족도|most satisfying option in patient feedback|口コミでも満足度が最も高い/, 'testimonial-based superiority claim'],
    [/교정 실사용 후기 핵심 요약|소아 정기검진 방문 후기 핵심 요약|환자 후기에서도 색 안정성 평가|원데이 시술 후기에서는/, 'legacy blog testimonial summary'],
  ];
  for (const [pattern, label] of patterns) if (pattern.test(text)) issues.push(label);
  return [...new Set(issues)];
}

function auditDirectory(dir) {
  const rows = [];
  function walk(current) {
    for (const e of fs.readdirSync(current, { withFileTypes: true })) {
      if (['_worker.js', 'node_modules', '.git'].includes(e.name)) continue;
      const file = path.join(current, e.name);
      if (e.isDirectory()) walk(file);
      else if (e.name.endsWith('.html')) rows.push({ file: path.relative(dir, file), issues: inspectReviewDisplay(fs.readFileSync(file, 'utf8')) });
    }
  }
  walk(dir);
  return rows;
}

if (require.main === module) {
  const rows = auditDirectory(process.argv[2] || 'dist');
  const failures = rows.filter(r => r.issues.length);
  console.log(`Review display check: ${rows.length} HTML files, ${failures.length} violations`);
  for (const row of failures) console.error(JSON.stringify(row));
  if (failures.length) process.exitCode = 1;
}
module.exports = { inspectReviewDisplay, auditDirectory };
