const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { parse } = require('node-html-parser');
const { Hono } = require('hono');
const { buildSync } = require('esbuild');
const data = require('../src/data/treatment-insights.json');
const links = require('../src/data/treatment-insight-links.json');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const revisionBefore = execFileSync('git', ['show','HEAD:treatments/implant-revision.html'], {encoding:'utf8'});
const allFiles = data.topics.map(t=>'.'+t.path+'.html');
const before = allFiles.map(f=>fs.readFileSync(f,'utf8'));
execFileSync(process.execPath,['scripts/build-treatment-insights.cjs']);
assert.deepEqual(allFiles.map(f=>fs.readFileSync(f,'utf8')), before, 'generator must be idempotent');
const allTreatments = fs.readdirSync('treatments').filter(f=>f.endsWith('.html') && f!=='index.html').map(f=>f.replace('.html','')).sort();
const mapped=links.flatMap(t=>t.treatments).sort();
assert.deepEqual(mapped,allTreatments,'every existing treatment has one clinical-topic link, with no duplicates');
assert.equal(links.filter(t=>t.mode==='new-guide').length,8);
assert.equal(links.filter(t=>t.mode==='existing-guide').length,17);
const sitemap=fs.readFileSync('sitemap-main.xml','utf8');
for(const t of data.topics){
 const file='.'+t.path+'.html', html=fs.readFileSync(file,'utf8'), doc=parse(html);
 assert.equal(doc.querySelectorAll('h1').length,1,file);
 assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'),'https://bdbddc.com'+t.path);
 const ids=doc.querySelectorAll('[id]').map(n=>n.id);assert.equal(ids.length,new Set(ids).size,file+': duplicate IDs');
 assert.ok(sitemap.includes('<loc>https://bdbddc.com'+t.path+'</loc>'),file+': sitemap');
 for(const nav of doc.querySelectorAll('#mainNav, #mobileNav'))assert.ok(!/치료의 안과 밖|\/guide\/inside-out/.test(nav.text+nav.innerHTML),'not in main menu');
 const prefix=t.mode==='existing-treatment'?'inside-out-':'';
 for(const id of ['benefits','limits','indications','contraindications','care'])assert.ok(doc.querySelector('#'+prefix+id)?.text.length>150,`${file}: ${id}`);
 for(const a of doc.querySelectorAll('.io-page a[href^="#"]'))assert.ok(doc.querySelector(a.getAttribute('href')),file+': missing anchor '+a.getAttribute('href'));
 for(const a of doc.querySelectorAll('.io-related a')) {
  const url=new URL(a.getAttribute('href'),'https://bdbddc.com');assert.ok(fs.existsSync('.'+url.pathname+'.html'),file+': missing related page');
 }
 for(const script of doc.querySelectorAll('script[type="application/ld+json"]'))JSON.parse(script.text);
 if(t.mode!=='existing-treatment') {
  assert.equal(doc.querySelectorAll('.io-faq').length,t.faq.length);
  for(const id of ['benefits','limits','indications','contraindications','care']){
   assert.ok(t.depth?.[id]?.length,`${t.slug}: authored depth missing for ${id}`);
   for(const d of t.depth[id]){assert.ok(doc.querySelector('#'+id).text.includes(d.title));assert.ok(doc.querySelector('#'+id).text.includes(d.text));}
  }
  assert.ok(!/후회.*80%|100% 성공|완치 보장|Review|AggregateRating/.test(html));
  for(const a of doc.querySelectorAll('.io-sources a'))assert.ok(a.getAttribute('href').startsWith('https://'));
 }
}
// Existing long-form revision content, videos, figures and FAQ must survive the supplement.
const oldMain=parse(revisionBefore).querySelector('main');const newMain=parse(fs.readFileSync('treatments/implant-revision.html','utf8')).querySelector('main');
oldMain.querySelector('#inside-out')?.remove();
newMain.querySelector('#inside-out').remove();
assert.equal(newMain.text.replace(/\s+/g,''),oldMain.text.replace(/\s+/g,''),'revision article text preserved');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'bd-insights-'));
const bundle=path.join(temp,'module.cjs');
buildSync({entryPoints:['src/lib/treatment-insights.ts'],bundle:true,platform:'node',format:'cjs',outfile:bundle});
const {registerTreatmentInsightLinks,registerTreatmentInsightRoutes}=require(bundle);
(async()=>{
 const app=new Hono();registerTreatmentInsightLinks(app);registerTreatmentInsightRoutes(app);
 app.get('/treatments/:slug',c=>c.html('<html><head></head><body><main><h1>기존 진료</h1></main></body></html>'));
 app.get('/concerns/:slug',c=>c.html('<html><head></head><body><main><h1>고민 노트</h1></main></body></html>'));
 const env={ASSETS:{fetch:async req=>{const file='.'+new URL(req.url).pathname+'.html';return fs.existsSync(file)?new Response(fs.readFileSync(file,'utf8'),{headers:{'Content-Type':'text/html'}}):new Response('not found',{status:404})}}};
 for(const t of links.filter(t=>t.mode==='new-guide')) {
  const res=await app.request(t.path,{},env);assert.equal(res.status,200);
  assert.ok((await res.text()).includes(`data-insight="${t.slug}"`));
  for(const suffix of ['.html','/']){const redirect=await app.request(t.path+suffix,{},env);assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),t.path)}
 }
 for(const p of ['/guide/inside-out','/guide/inside-out/not-real','/guide/inside-out/not-real/deeper']){const res=await app.request(p,{},env);assert.equal(res.status,404);assert.equal(res.headers.get('x-robots-tag'),'noindex')}
 for(const t of links)for(const slug of t.treatments){const html=await(await app.request('/treatments/'+slug,{},env)).text();if(slug==='implant-revision')assert.ok(!html.includes('data-treatment-insight-link'));else assert.ok(html.includes('href="'+t.path+(t.mode==='existing-treatment'?'#inside-out':'')+'"'),slug)}
 const unknown=await(await app.request('/concerns/not-a-published-note',{},env)).text();assert.ok(!unknown.includes('data-treatment-insight-link'));
 fs.rmSync(temp,{recursive:true,force:true});
 console.log('PASS: 26 topics, 54 treatment mappings, 17 reused/8 new URLs, unchanged revision article, idempotent generator, anchors/metadata/menu exclusions, real 404s and contextual middleware.');
})().catch(e=>{fs.rmSync(temp,{recursive:true,force:true});console.error(e);process.exitCode=1});
