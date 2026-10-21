import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parse} from 'node-html-parser';
import {matrix} from './build-regional-guides.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [base,output]=process.argv.slice(2);
if(!base||!output?.startsWith('/Volumes/MSJ_WORK/Workspaces/')||fs.existsSync(output))throw Error('Origin and new SSD output file required');
const errors=[],pages=[],assets=new Map(),links=new Map(),documents=new Map();
let completed=false,phase='pages';
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const compact=s=>String(s||'').replace(/\s/g,'');
const save=()=>fs.writeFileSync(output,JSON.stringify({checkedAt:new Date().toISOString(),base,phase,completed,pages,assetChecks,linkChecks,errors,allPassed:completed&&pages.length===matrix.length&&!errors.length},null,2)+'\n');
const assetChecks=[],linkChecks=[];
async function request(u,options={}){return fetch(u,{...options,signal:AbortSignal.timeout(30000)});}
async function parallel(items,fn,n=4){const queue=[...items];await Promise.all(Array.from({length:n},async()=>{while(queue.length)await fn(queue.shift())}));}
await parallel(matrix,async p=>{try{
 const r=await request(base+p.url),h=await r.text(),d=parse(h),m=d.querySelector('main');documents.set(p.url,d);
 const src=parse(fs.readFileSync(path.join(ROOT,'dist',p.url+'.html'),'utf8'));
 const check=(v,msg)=>{if(!v)errors.push(p.url+': '+msg)};
 check(r.status===200,'HTTP '+r.status);check(!!m,'main absent');check(d.querySelector('title')?.text===src.querySelector('title')?.text,'title differs from build');
 check(d.querySelector('meta[name="description"]')?.getAttribute('content')===src.querySelector('meta[name="description"]')?.getAttribute('content'),'description differs from build');
 check(d.querySelector('link[rel="canonical"]')?.getAttribute('href')==='https://bdbddc.com'+p.url,'canonical');
 check(!/noindex|none/i.test((d.querySelector('meta[name="robots"]')?.getAttribute('content')||'')+' '+(r.headers.get('x-robots-tag')||'')),'indexing blocked');
 check(d.querySelectorAll('h1').length===1,'H1 count');
 if(m){const visible=parse(m.outerHTML);visible.querySelectorAll('section.bd-journey[aria-label="관련 고민 노트"],section.io-context[data-treatment-insight-link][aria-label="치료의 안과 밖"]').forEach(x=>x.remove());check(norm(visible.text)===norm(src.querySelector('main')?.text),'main differs from built content');
 const liveSources=m.querySelectorAll('video source').map(x=>x.getAttribute('src'));check(JSON.stringify(liveSources)===JSON.stringify(src.querySelectorAll('main video source').map(x=>x.getAttribute('src'))),'video sources differ');
 for(const e of m.querySelectorAll('img,video,source'))for(const attr of ['src','poster']){const v=e.getAttribute(attr);if(v)assets.set(new URL(v,base).href,attr==='src'&&['VIDEO','SOURCE'].includes(e.tagName)?'video':'image')}
 for(const e of d.querySelectorAll('link[rel="stylesheet"]')){const v=e.getAttribute('href');if(v?.startsWith('/static/regional-'))assets.set(new URL(v,base).href,'css')}
 for(const e of m.querySelectorAll('a[href]')){const v=e.getAttribute('href');if(v?.startsWith('/')&&!v.startsWith('//'))links.set(new URL(v,base).href,true)}
 let faqs=0;for(const e of d.querySelectorAll('script[type="application/ld+json"]')){let v;try{v=JSON.parse(e.text)}catch{check(false,'invalid JSON-LD');continue}if(v['@type']==='FAQPage'){faqs++;for(const q of v.mainEntity||[]){check(compact(m.text).includes(compact(q.name)),'FAQ question absent');check(compact(m.text).includes(compact(q.acceptedAnswer.text)),'FAQ answer absent')}}}
 if(p.region!=='cheonan'||p.category==='dental')check(faqs===1,'FAQ schema count');
 pages.push({...p,status:r.status,title:d.querySelector('title')?.text,h1:d.querySelector('h1')?.text,characters:norm(m.text).length,videos:liveSources.length,images:m.querySelectorAll('img').length,etag:r.headers.get('etag')});
 }save();
}catch(e){errors.push(p.url+': '+e.message);save()}});
phase='sitemaps';save();const siteMaps=[];for(const sm of ['/sitemap-area.xml','/sitemap-main.xml']){try{const r=await request(base+sm);if(r.status!==200)errors.push(sm+': HTTP '+r.status);siteMaps.push(await r.text())}catch(e){errors.push(sm+': '+e.message)}}
for(const p of matrix)if(!siteMaps.some(x=>x.includes('<loc>https://bdbddc.com'+p.url+'</loc>')))errors.push(p.url+': sitemap absent');
phase='assets';save();
await parallel([...assets],async([url,type])=>{try{const r=await request(url,{headers:type==='video'?{Range:'bytes=0-1023'}:{}}),bytes=Buffer.from(await r.arrayBuffer()),ct=r.headers.get('content-type')||'';let passed=(type==='video'?[200,206].includes(r.status):r.status===200)&&ct.startsWith(type==='css'?'text/css':type+'/');let matchesBuild;
 const u=new URL(url);if(type==='css'){matchesBuild=crypto.createHash('sha256').update(bytes).digest('hex')===crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'dist',u.pathname))).digest('hex');passed=passed&&matchesBuild}
 if(!passed)errors.push('Asset '+url+': '+r.status+' '+ct);assetChecks.push({url,type,status:r.status,contentType:ct,bytes:bytes.length,matchesBuild,passed});
}catch(e){errors.push('Asset '+url+': '+e.message)}});
phase='links';save();
await parallel([...links.keys()],async url=>{try{const u=new URL(url),local=documents.get(u.pathname);let d=local,status=200;if(!d){const r=await request(base+u.pathname+u.search);status=r.status;d=parse(await r.text())}const anchorExists=!u.hash||d.querySelectorAll('[id]').some(e=>e.id===decodeURIComponent(u.hash.slice(1)));const passed=status===200&&anchorExists;if(!passed)errors.push('Link '+url+': '+status+' anchor '+anchorExists);linkChecks.push({url,status,anchorExists,passed})}catch(e){errors.push('Link '+url+': '+e.message)}});
completed=true;phase='complete';save();console.log(JSON.stringify({pages:pages.length,assets:assetChecks.length,links:linkChecks.length,errors,allPassed:pages.length===matrix.length&&!errors.length},null,2));if(errors.length||pages.length!==matrix.length)process.exitCode=1;
