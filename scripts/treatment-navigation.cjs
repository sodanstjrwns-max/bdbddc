const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('node-html-parser');
const GNB_VERSION = '20261014retreatment2';
const IMPLANT_ITEMS = [
  ['/treatments/implant-revision', '임플란트 재수술'],
  ['/treatments/implant-hybrid', '하이브리드 풀아치 임플란트(올온X)'],
  ['/treatments/implant-sedation', '의식하진정 임플란트'],
];
const locales = {ko:['','재교정'],en:['/en','Orthodontic retreatment'],ja:['/jp','再矯正']};
// Keep static crawlable navigation and the browser menu builder in agreement.
function promoteRevision(html) {
  const lang=/<html\b[^>]*\blang=["']([^"']+)["']/i.exec(html)?.[1]?.split('-')[0];
  const locale=locales[lang];if(!locale)return html;
  const [prefix,label]=locale;
  return html.replace(/<nav\b[^>]*\bid=["'](?:mainNav|mobileNav)["'][^>]*>[\s\S]*?<\/nav>/gi,nav=>{
    const dom=parse(nav);
    if(prefix)for(const a of dom.querySelectorAll('a[href]')){const href=a.getAttribute('href');if(/^\/treatments(?:\/|$)/.test(href))a.setAttribute('href',prefix+href);}
    if(lang==='ko'){
      let item=dom.querySelector('a[href="/treatments/implant"]')?.parentNode;
      if(item?.tagName==='LI')for(const [href,text] of IMPLANT_ITEMS){
        if(!dom.querySelector(`a[href="${href}"]`))item.insertAdjacentHTML('afterend',`<li><a href="${href}" style="color:#6B4226;font-weight:700;">${text}</a></li>`);
        item=dom.querySelector(`a[href="${href}"]`).parentNode;
      }
    }
    const ortho=dom.querySelector(`a[href="${prefix}/treatments/orthodontics"]`)?.parentNode;
    const href=prefix+'/treatments/orthodontic-retreatment';
    if(ortho?.tagName==='LI'&&!dom.querySelector(`a[href="${href}"]`))ortho.insertAdjacentHTML('afterend',`<li><a href="${href}" style="color:#6B4226;font-weight:700;">${label}</a></li>`);
    return dom.toString();
  }).replace(/(\/js\/gnb-v2\.js)(?:\?v=[^"'\s>]*)?(?=["'])/g,'$1?v='+GNB_VERSION);
}
function syncBuiltNavigation(dir){let updated=0;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 if(entry.name.startsWith('.')||['admin','auth','report','tables','_worker.js'].includes(entry.name))continue;
 const file=path.join(dir,entry.name);if(entry.isDirectory())updated+=syncBuiltNavigation(file);else if(entry.name.endsWith('.html')){const before=fs.readFileSync(file,'utf8'),after=promoteRevision(before);if(after!==before){fs.writeFileSync(file,after);updated++;}}
}return updated;}
module.exports={promoteRevision,syncBuiltNavigation,GNB_VERSION};
