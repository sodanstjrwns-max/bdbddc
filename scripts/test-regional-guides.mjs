import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'node-html-parser';
import {regions,categories,matrix,urlFor} from './build-regional-guides.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.argv[2];
const errors=[],warnings=[];const fail=(condition,message)=>{if(!condition)errors.push(message)};
const data=fs.readdirSync(path.join(ROOT,'src/data/regional-guides')).filter(f=>f.endsWith('.json')&&f!=='doctors.json').flatMap(f=>JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/regional-guides',f))));
const expectedAuthored=matrix.filter(p=>p.category==='dental'?p.region!=='asan':p.region!=='cheonan'&&!(p.region==='asan'&&['implant','orthodontics','invisalign'].includes(p.category)));
fail(data.length===expectedAuthored.length,`Authored count ${data.length}; expected ${expectedAuthored.length}`);
const pageKeys=data.map(d=>d.region+':'+d.category);fail(new Set(pageKeys).size===pageKeys.length,'Repeated authored key');for(const p of expectedAuthored)fail(pageKeys.includes(p.region+':'+p.category),'Missing authored '+p.url);
const strings=v=>typeof v==='string'?v:Array.isArray(v)?v.map(strings).join(' '):v&&typeof v==='object'?Object.values(v).map(strings).join(' '):'';
const prose=d=>strings([d.intro,d.focusTitle,d.focus,d.sections.map(({title,paragraphs,bullets})=>[title,paragraphs,bullets||[]]),d.decisions,d.visitTitle,d.visitParagraphs,d.visitChecklist,d.faq]);
const normalized=s=>s.replace(/천안|아산|예산|서산|홍성|당진|평택|안성/g,'지역').replace(/\s+/g,' ').trim();
const gram=s=>{s=normalized(s).replace(/\s/g,'');return new Set(Array.from({length:Math.max(0,s.length-7)},(_,i)=>s.slice(i,i+8)))};
const jaccard=(a,b)=>{let count=0;for(const x of a)if(b.has(x))count++;return count/(a.size+b.size-count)};
const authored=data.map(d=>({slug:d.slug,url:urlFor(d.region,d.category),category:d.category,characters:prose(d).length,descriptionCharacters:d.description.length,grams:gram(prose(d))}));
for(const [i,d] of data.entries()){
 const row=authored[i];fail(row.characters>=4200,`${d.slug}: ${row.characters} authored characters <4200`);fail(d.description.length>=110&&d.description.length<=160,`${d.slug}: meta description ${d.description.length} chars`);
 fail(d.faq.length>=6,`${d.slug}: too few distinct FAQs`);fail(d.sections.length>=4,`${d.slug}: incomplete guide`);fail(d.sources.length>=3,`${d.slug}: missing source coverage`);fail(new Set(d.faq.map(x=>x.q)).size===d.faq.length,`${d.slug}: duplicate FAQ`);
 for(const x of d.sources)fail(/^https:\/\//.test(x.url),`${d.slug}: invalid source URL`);
 for(const x of d.related)fail(x.startsWith('/')&&!x.startsWith('//'),`${d.slug}: invalid internal link`);
}
const pairs=[];for(let i=0;i<authored.length;i++)for(let j=i+1;j<authored.length;j++)if(authored[i].category===authored[j].category){const score=jaccard(authored[i].grams,authored[j].grams);pairs.push({a:authored[i].slug,b:authored[j].slug,similarity:Number(score.toFixed(4))});if(score>.45)warnings.push(`Review high 8-char shingle overlap ${score.toFixed(3)}: ${authored[i].slug}, ${authored[j].slug}`);}
const titles=new Set(),descriptions=new Set(),checks=[];
for(const p of matrix){const f=path.join(ROOT,p.url+'.html');if(!fs.existsSync(f)){errors.push('Missing canonical file '+f);continue}const doc=parse(fs.readFileSync(f,'utf8'));const main=doc.querySelector('main');if(!main){errors.push(p.url+': no main');continue}const title=doc.querySelector('title')?.text||'',desc=doc.querySelector('meta[name="description"]')?.getAttribute('content')||'';
 fail(!titles.has(title),p.url+': duplicate title');titles.add(title);fail(!descriptions.has(desc),p.url+': duplicate description');descriptions.add(desc);
 fail(doc.querySelectorAll('h1').length===1,p.url+': expected one H1');fail(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')==='https://bdbddc.com'+p.url,p.url+': canonical mismatch');fail(!/noindex/i.test(doc.querySelector('meta[name="robots"]')?.getAttribute('content')||''),p.url+': noindex');
 const ids=doc.querySelectorAll('[id]').map(x=>x.id);fail(new Set(ids).size===ids.length,p.url+': repeated DOM ids');
 for(const a of main.querySelectorAll('a[href^="#"]'))fail(ids.includes(a.getAttribute('href').slice(1)),p.url+': missing anchor '+a.getAttribute('href'));
 let faq=[];for(const e of doc.querySelectorAll('script[type="application/ld+json"]'))try{const obj=JSON.parse(e.textContent);const list=obj['@graph']||[obj];for(const x of list){fail(!['Review','AggregateRating'].includes(x['@type']),p.url+': review schema');if(x['@type']==='FAQPage')faq.push(x);if(x['@type']==='Dentist')fail(/천안/.test(JSON.stringify(x.address)),p.url+': fake address');}}catch(e){errors.push(p.url+': invalid JSONLD '+e.message)}
 if(p.region!=='cheonan'||p.category==='dental'){fail(faq.length===1,p.url+': one FAQ schema required');for(const q of faq.flatMap(x=>x.mainEntity||[])){fail(main.textContent.replace(/\s/g,'').includes(q.name.replace(/\s/g,'')),p.url+': FAQ question not visible '+q.name);fail(main.textContent.replace(/\s/g,'').includes(q.acceptedAnswer.text.replace(/\s/g,'')),p.url+': FAQ answer not visible '+q.name);}}
 checks.push({...p,title,h1:doc.querySelector('h1')?.text.trim(),images:main.querySelectorAll('img').length,videos:main.querySelectorAll('video').length});
}
const sitemap=fs.readFileSync(path.join(ROOT,'sitemap-area.xml'),'utf8');for(const p of matrix.filter(x=>x.url.startsWith('/area/')))fail(sitemap.includes('<loc>https://bdbddc.com'+p.url+'</loc>'),p.url+': sitemap absent');
const links=new Map();for(const u of ['/',...new Set(matrix.map(p=>p.url))]){const f=path.join(ROOT,u==='/'?'index.html':u+'.html');if(!fs.existsSync(f))continue;const doc=parse(fs.readFileSync(f,'utf8'));links.set(u,new Set(doc.querySelectorAll('a[href]').map(x=>x.getAttribute('href').replace(/\.html(?=#|$)/,'').split('#')[0])));}
const seen=new Set(['/']),q=['/'];while(q.length){const u=q.shift();for(const v of links.get(u)||[])if(!seen.has(v)){seen.add(v);if(links.has(v))q.push(v)}}for(const p of matrix)fail(seen.has(p.url),p.url+': no crawlable link path from home through target guides');
const report={checkedAt:new Date().toISOString(),matrix:matrix.length,authored:authored.map(({grams,...x})=>x),pages:checks,similarityMethod:'Character 8-gram Jaccard after masking region names; diagnostic only, not a search-engine duplicate guarantee. Shared navigation and clinician cards are excluded; factual prose is retained. Values over .45 require editorial review.',similarityPairs:pairs.sort((a,b)=>b.similarity-a.similarity),errors,warnings,allPassed:errors.length===0};if(output){if(!path.resolve(output).startsWith('/Volumes/MSJ_WORK/Workspaces/'))throw Error('SSD output required');fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n')}console.log(JSON.stringify({matrix:matrix.length,authored:data.length,errors,warnings,topOverlap:pairs.sort((a,b)=>b.similarity-a.similarity).slice(0,5),allPassed:report.allPassed},null,2));if(errors.length)process.exitCode=1;
