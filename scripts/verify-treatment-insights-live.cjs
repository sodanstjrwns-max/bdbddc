#!/usr/bin/env node
const fs = require('node:fs');
const { parse } = require('node-html-parser');
const topics = require('../src/data/treatment-insight-links.json');
const args=process.argv.slice(2),arg=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const base=arg('--base','https://bdbddc.com'),output=arg('--output');
if(!output)throw Error('Pass --output with a new audit JSON path');
if(fs.existsSync(output))throw Error('Audit output already exists; use a fresh file');
const checks=[];
async function get(path){const r=await fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(30000),headers:{'user-agent':'BD-Treatment-Guide-Check/1.0','cache-control':'no-cache'}});return {status:r.status,headers:r.headers,text:await r.text()}}
async function batches(xs,fn){for(let i=0;i<xs.length;i+=4)await Promise.all(xs.slice(i,i+4).map(async x=>{try{await fn(x)}catch(e){checks.push({path:typeof x==='string'?x:x.path,passed:false,error:e.message})}}))}
(async()=>{
 const map=await get('/sitemap-main.xml'),index=await get('/sitemap.xml');
 checks.push({path:'/sitemap-main.xml',passed:map.status===200&&map.text.includes('<urlset')&&index.status===200&&index.text.includes('https://bdbddc.com/sitemap-main.xml')});
 await batches(topics,async t=>{
  const r=await get(t.path),doc=parse(r.text),canonical=doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const robots=(doc.querySelector('meta[name="robots"]')?.getAttribute('content')||'')+' '+(r.headers.get('x-robots-tag')||'');
  const prefix=t.mode==='existing-treatment'?'inside-out-':'';
  const sections=['benefits','limits','indications','contraindications','care'].every(id=>doc.querySelector('#'+prefix+id)?.text.length>150);
  const navClean=doc.querySelectorAll('#mainNav,#mobileNav').every(n=>!n.innerHTML.includes('/guide/inside-out')&&!n.text.includes('치료의 안과 밖'));
  const sitemap=(map.text.match(new RegExp('<loc>https://bdbddc.com'+t.path+'</loc>','g'))||[]).length===1;
  checks.push({path:t.path,status:r.status,canonical,indexable:!(/noindex/i.test(robots)),sections,navClean,sitemap,passed:r.status===200&&canonical==='https://bdbddc.com'+t.path&&!/noindex/i.test(robots)&&sections&&navClean&&sitemap});
 });
 await batches(topics.flatMap(t=>t.treatments.map(slug=>({path:'/treatments/'+slug,topic:t}))),async ({path,topic})=>{
  const r=await get(path),doc=parse(r.text);const target=topic.path+(topic.mode==='existing-treatment'?'#inside-out':'');
  const connected=path===topic.path&&topic.mode==='existing-treatment'?!!doc.querySelector('#inside-out'):doc.querySelector('.io-context a')?.getAttribute('href')===target;
  checks.push({path,status:r.status,connected,passed:r.status===200&&connected});
 });
 for(const p of ['/guide/inside-out/does-not-exist','/guide/inside-out']){const r=await get(p);checks.push({path:p,status:r.status,passed:r.status===404&&/noindex/.test(r.headers.get('x-robots-tag')||'')})}
 for(const t of topics.filter(t=>t.mode==='new-guide'))for(const suffix of ['.html','/']){const r=await get(t.path+suffix);checks.push({path:t.path+suffix,status:r.status,location:r.headers.get('location'),passed:r.status===301&&new URL(r.headers.get('location')||'/',base).pathname===t.path})}
 const css=await get('/css/treatment-insights.css');checks.push({path:'/css/treatment-insights.css',status:css.status,passed:css.status===200&&css.text.includes('.io-five')});
 const audit={checkedAt:new Date().toISOString(),base,allPassed:checks.every(c=>c.passed),checks};fs.writeFileSync(output,JSON.stringify(audit,null,2)+'\n');console.log(JSON.stringify({allPassed:audit.allPassed,checks:checks.length,failures:checks.filter(c=>!c.passed),output},null,2));if(!audit.allPassed)process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1});
