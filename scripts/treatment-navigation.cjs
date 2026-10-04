const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('node-html-parser');

const REVISION = '/treatments/implant-revision';
const GNB_VERSION = '20261004revision';

// Static pages contain older copies of the header. Keep their crawlable menus
// consistent with the SSR header and js/gnb-v2.js without rewriting their bodies.
function promoteRevision(html) {
  if (!/<html\b[^>]*\blang=["']ko(?:-KR)?["']/i.test(html)) return html;
  return html.replace(/<nav\b[^>]*\bid=["'](?:mainNav|mobileNav)["'][^>]*>[\s\S]*?<\/nav>/gi, nav => {
    const root = parse(nav);
    const implant = root.querySelector('a[href="/treatments/implant"]');
    if (!implant || root.querySelector(`a[href="${REVISION}"]`)) return nav;
    const item = implant.parentNode;
    if (item?.tagName !== 'LI') return nav;
    item.insertAdjacentHTML('afterend', `<li><a href="${REVISION}" style="color:#6B4226;font-weight:700;">임플란트 재수술</a></li>`);
    return root.toString();
  }).replace(/(\/js\/gnb-v2\.js)(?:\?v=[^"'\s>]*)?(?=["'])/g, '$1?v=' + GNB_VERSION);
}

function syncBuiltNavigation(dir) {
  let updated = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['admin', 'auth', 'report', 'tables', '_worker.js'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) updated += syncBuiltNavigation(file);
    else if (entry.name.endsWith('.html')) {
      const before = fs.readFileSync(file, 'utf8');
      const after = promoteRevision(before);
      if (after !== before) { fs.writeFileSync(file, after); updated++; }
    }
  }
  return updated;
}

module.exports = { promoteRevision, syncBuiltNavigation };
