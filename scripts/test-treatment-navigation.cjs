const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parse } = require('node-html-parser');
const { promoteRevision } = require('./treatment-navigation.cjs');
const revision = '/treatments/implant-revision';
function checkMenu(root, context) {
  for (const nav of root.querySelectorAll('#mainNav, #mobileNav')) {
    const implant = nav.querySelector('a[href="/treatments/implant"]');
    if (!implant) continue;
    const links = nav.querySelectorAll(`a[href="${revision}"]`);
    assert.equal(links.length, 1, context + ': one revision item per menu');
    assert.equal(implant.parentNode.nextElementSibling, links[0].parentNode, context + ': immediately after implant');
  }
}
const sample = '<html lang="ko"><nav id="mainNav"><ul><li><a href="/treatments/implant">임플란트</a></li></ul></nav><main><a href="/treatments/implant">본문</a></main></html>';
const updated = promoteRevision(sample);
checkMenu(parse(updated), 'fixture');
assert.equal(promoteRevision(updated), updated, 'build is idempotent');
assert.equal(parse(updated).querySelector('main').toString(), parse(sample).querySelector('main').toString(), 'body is untouched');
assert.equal(promoteRevision(sample.replace('lang="ko"','lang="en"')), sample.replace('lang="ko"','lang="en"'), 'English is untouched');
assert.equal(promoteRevision(sample.replace('lang="ko"','lang="ja"')), sample.replace('lang="ko"','lang="ja"'), 'Japanese is untouched');
let checked = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (['_worker.js','admin','auth','report','tables'].includes(entry.name) || entry.name.startsWith('.')) continue;
    const file = path.join(dir,entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(file,'utf8'), root = parse(html);
      if (!(root.querySelector('html')?.getAttribute('lang') || '').startsWith('ko')) continue;
      checkMenu(root,file); checked++;
      const script = root.querySelector('script[src*="/js/gnb-v2.js"]');
      if (script) assert.match(script.getAttribute('src'), /v=20261004revision$/, file + ': fresh menu script');
    }
  }
}
walk('dist');
// Execute the actual client menu builder: a later browser rewrite must keep the link.
const nav = { innerHTML: '' }, mobile = { innerHTML: '' };
let js = fs.readFileSync('js/gnb-v2.js','utf8');
js = js.replace('    function init() {','    function init() { syncNavMenus(); return;');
vm.runInNewContext(js, { location: {pathname: '/treatments/implant-revision'}, document: {
  readyState: 'complete', getElementById: id => id === 'mainNav' ? nav : null,
  querySelector: selector => selector === '.mobile-nav-menu' ? mobile : null,
}, console });
checkMenu(parse('<nav id="mainNav">'+nav.innerHTML+'</nav><nav id="mobileNav">'+mobile.innerHTML+'</nav>'),'client runtime');
assert.ok(mobile.innerHTML.includes(revision), 'client mobile navigation');
const page = parse(fs.readFileSync('dist/treatments/implant-revision.html','utf8'));
assert.equal(page.querySelectorAll('h1').length,1);
assert.equal(page.querySelector('link[rel="canonical"]').getAttribute('href'),'https://bdbddc.com'+revision);
assert.ok(!/noindex/.test(page.querySelector('meta[name="robots"]').getAttribute('content')));
assert.equal(page.querySelector('body').getAttribute('data-consultation-tone'),'calm');
const ids=page.querySelectorAll('[id]').map(x=>x.getAttribute('id'));
assert.equal(new Set(ids).size,ids.length,'unique IDs');
for(const link of page.querySelectorAll('main a[href*="#"]'))assert.ok(page.querySelector(new URL(link.getAttribute('href'),'https://bdbddc.com').hash),'anchor exists');
const schemas=page.querySelectorAll('script[type="application/ld+json"]').map(x=>JSON.parse(x.text));
const faq=schemas.find(x=>x['@type']==='FAQPage');
const visible=page.querySelectorAll('.rv-faq details');
assert.equal(faq.mainEntity.length,visible.length);
faq.mainEntity.forEach((item,i)=>{assert.equal(item.name,visible[i].querySelector('summary').text);assert.equal(item.acceptedAnswer.text,visible[i].querySelector('p').text)});
assert.ok(page.querySelector('.rv-concerns').text.includes('제 관리를 탓할까'));
assert.ok(!/0\.1mm|다시 살리겠습니다|14인 전문의|성공률은/.test(page.text));
for (const file of ['index.html','treatments/index.html'])assert.equal(parse(fs.readFileSync('dist/'+file,'utf8')).querySelectorAll('a.treatment-card[href="'+revision+'"]').length,1);
console.log(`PASS: ${checked} Korean static pages, desktop/mobile runtime menus, revision metadata/FAQ/anchors/cards.`);
