const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parse } = require('node-html-parser');
const { promoteRevision, GNB_VERSION } = require('./treatment-navigation.cjs');
const revision = '/treatments/implant-revision';
function checkMenu(root, context) {
  for (const nav of root.querySelectorAll('#mainNav, #mobileNav')) {
    const implant = nav.querySelector('a[href="/treatments/implant"]');
    if (!implant) continue;
    const links = nav.querySelectorAll(`a[href="${revision}"]`);
    assert.equal(links.length, 1, context + ': one revision item per menu');
    assert.equal(implant.parentNode.nextElementSibling, links[0].parentNode, context + ': immediately after implant');
    let previous = links[0].parentNode;
    for (const [href, label] of [['/treatments/implant-hybrid','하이브리드 풀아치 임플란트(올온X)'],['/treatments/implant-sedation','의식하진정 임플란트']]) {
      const items = nav.querySelectorAll(`a[href="${href}"]`);
      assert.equal(items.length, 1, context + ': one ' + href);
      assert.equal(items[0].text, label);
      assert.equal(previous.nextElementSibling, items[0].parentNode, context + ': ordered implant submenu');
      previous = items[0].parentNode;
    }
  }
}
function checkRetreatment(root,lang,context){
 const prefix={ko:'',en:'/en',ja:'/jp'}[lang];
 for(const nav of root.querySelectorAll('#mainNav,#mobileNav')){
  const anchor=nav.querySelector('a[href="'+prefix+'/treatments/orthodontics"]');
  if(nav.querySelector('a[href*="/treatments/orthodontics"]'))assert(anchor,context+': localized orthodontics target');
  if(!anchor)continue;
  const links=nav.querySelectorAll('a[href="'+prefix+'/treatments/orthodontic-retreatment"]');
  assert.equal(links.length,1,context+': one retreatment link');
  assert.equal(anchor.parentNode.nextElementSibling,links[0].parentNode,context+': retreatment follows orthodontics');
 }
}
const sample = '<html lang="ko"><nav id="mainNav"><ul><li><a href="/treatments/implant">임플란트</a></li></ul></nav><main><a href="/treatments/implant">본문</a></main></html>';
const updated = promoteRevision(sample);
checkMenu(parse(updated), 'fixture');
assert.equal(promoteRevision(updated), updated, 'build is idempotent');
assert.equal(parse(updated).querySelector('main').toString(), parse(sample).querySelector('main').toString(), 'body is untouched');
for (const [lang,prefix,label] of [['ko','','재교정'],['en','/en','Orthodontic retreatment'],['ja','/jp','再矯正']]) {
  const fixture='<html lang="'+lang+'"><nav id="mainNav"><ul><li><a href="'+prefix+'/treatments/orthodontics">Orthodontics</a></li></ul></nav><main>Keep this body</main><script src="/js/gnb-v2.js?v=old"></script></html>';
  const result=promoteRevision(fixture),dom=parse(result),ortho=dom.querySelector('a[href="'+prefix+'/treatments/orthodontics"]');
  assert.equal(ortho.parentNode.nextElementSibling.querySelector('a').getAttribute('href'),prefix+'/treatments/orthodontic-retreatment');
  assert.equal(ortho.parentNode.nextElementSibling.text,label);
  assert.equal(promoteRevision(result),result,'localized navigation idempotent');
  assert.equal(dom.querySelector('main').text,'Keep this body');
}
const englishLegacy='<html lang="en"><nav id="mainNav"><ul><li><a href="/treatments/orthodontics">Orthodontics</a></li></ul></nav></html>';
const englishFixed=parse(promoteRevision(englishLegacy));
assert(englishFixed.querySelector('a[href="/en/treatments/orthodontics"]'));
assert(englishFixed.querySelector('a[href="/en/treatments/orthodontic-retreatment"]'));
let checked = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (['_worker.js','admin','auth','report','tables'].includes(entry.name) || entry.name.startsWith('.')) continue;
    const file = path.join(dir,entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(file,'utf8'), root = parse(html);
      const lang=(root.querySelector('html')?.getAttribute('lang')||'').split('-')[0];
      if(!['ko','en','ja'].includes(lang))continue;
      if(lang==='ko')checkMenu(root,file);
      checkRetreatment(root,lang,file); checked++;
      const script = root.querySelector('script[src*="/js/gnb-v2.js"]');
      if (script) assert.ok(script.getAttribute('src').endsWith('?v='+GNB_VERSION),file+': fresh menu script');
    }
  }
}
walk('dist');
// Execute each actual client menu builder so a later JS rewrite cannot erase links.
for(const [lang,prefix] of [['ko',''],['en','/en'],['ja','/jp']]){
 const nav={innerHTML:''},mobile={innerHTML:''};
 let js=fs.readFileSync('js/gnb-v2.js','utf8');
 js=js.replace('    function init() {','    function init() { syncNavMenus(); return;');
 vm.runInNewContext(js,{location:{pathname:prefix+'/treatments/orthodontic-retreatment'},document:{readyState:'complete',getElementById:id=>id==='mainNav'?nav:null,querySelector:selector=>selector==='.mobile-nav-menu'?mobile:null},console});
 const dom=parse('<nav id="mainNav">'+nav.innerHTML+'</nav><nav id="mobileNav">'+mobile.innerHTML+'</nav>');
 if(lang==='ko')checkMenu(dom,'client runtime');
 checkRetreatment(dom,lang,'client runtime');
 assert(mobile.innerHTML.includes(prefix+'/treatments/orthodontic-retreatment'),'mobile retreatment');
}
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
console.log(`PASS: ${checked} Korean/English/Japanese static pages, desktop/mobile runtime menus, revision metadata/FAQ/anchors/cards.`);
