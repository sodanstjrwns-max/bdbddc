const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{parse}=require('node-html-parser');
const root=path.resolve(__dirname,'..'),dir=path.resolve(root,process.argv[2]||'treatments'),profiles=require('../src/data/treatment-page-editorial.json').profiles;
const keep=new Set(['glownate','implant-revision','implant','invisalign','whitening']);const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));assert.equal(files.length,55);const titles=new Set(),report=[];const norm=s=>s.replace(/\s+/g,' ').trim();
for(const f of files){const slug=f.replace('.html',''),d=parse(fs.readFileSync(path.join(dir,f),'utf8'));assert.equal(d.querySelectorAll('h1').length,1,f+': H1');const title=d.querySelector('title').text;assert(!titles.has(title),f+': duplicate title');titles.add(title);const canonical='https://bdbddc.com/treatments/'+(slug==='index'?'':slug);assert.equal(d.querySelector('link[rel="canonical"]').getAttribute('href'),canonical,f+': canonical');assert(!/noindex/.test(d.querySelector('meta[name="robots"]').getAttribute('content')),f+': robots');const ids=d.querySelectorAll('[id]').map(n=>n.id);assert.equal(ids.length,new Set(ids).size,f+': duplicate IDs');const main=d.querySelector('main');assert(main);for(const a of main.querySelectorAll('a[href^="#"]')){const id=a.getAttribute('href').slice(1);assert(ids.includes(id),f+': missing '+id)}
const text=main.clone();text.querySelectorAll('script,style').forEach(n=>n.remove());const chars=norm(text.text).length;assert(chars>2500,f+': substantial readable text');for(const s of d.querySelectorAll('script[type="application/ld+json"]')){const j=JSON.parse(s.text);assert(!['Review','AggregateRating'].includes(j['@type']),f);}
if(slug!=='index'&&!keep.has(slug)){assert(main.text.includes(profiles[slug].primaryKeyword));for(const id of ['definition','specific','benefits','limits','indications','contraindications','care','cost','questions','sources'])assert(d.querySelector('#tg-'+id),f+': section '+id);assert(!/통증 제로|100% 성공|기억도 없음|무조건 당일|완치 보장|30~60분 후.*일상/.test(main.text),f+': unsupported promise');const faq=d.querySelectorAll('script[type="application/ld+json"]').map(x=>JSON.parse(x.text)).find(x=>x['@type']==='FAQPage');assert(faq);assert.equal(faq.mainEntity.length,main.querySelectorAll('details').length);for(const q of faq.mainEntity)assert(main.text.includes(q.name)&&main.text.includes(q.acceptedAnswer.text),f+': visible FAQ equality');}
if(keep.has(slug)){
 const visible=new Map(main.querySelectorAll('.faq-item').map(item=>[item.querySelector('.faq-q-text'),item.querySelector('.faq-answer')]).filter(([q,a])=>q&&a).map(([q,a])=>[norm(q.text),norm(a.text)]));
 function checkFaq(value){if(!value||typeof value!=='object')return;if(value['@type']==='FAQPage'&&visible.size){assert.equal(value.mainEntity.length,visible.size,f+': benchmark FAQ count');for(const q of value.mainEntity){assert(visible.has(norm(q.name)),f+': schema question must be visible');assert.equal(norm(q.acceptedAnswer.text),visible.get(norm(q.name)),f+': benchmark FAQ answer');}}for(const v of Object.values(value)){if(Array.isArray(v))v.forEach(checkFaq);else if(v&&typeof v==='object')checkFaq(v);}}
 for(const s of d.querySelectorAll('script[type="application/ld+json"]'))checkFaq(JSON.parse(s.text));
 assert(!/수술 공포증 완전 해결|통증 없는 수술 경험|완벽한 감염차단/.test(main.text),f+': unsupported legacy promise');
}
assert.equal(main.getAttribute('data-patient-narrative'),'20261013',f+': patient-first version');
if(slug!=='index'){
 assert.equal(main.querySelectorAll('.tg-patient-title').length,1,f+': patient headline');
 assert(main.querySelector('h1').text.includes(profiles[slug].primaryKeyword),f+': keyword retained in H1');
 const hero=main.querySelector('.tg-hero');assert.equal(hero.querySelectorAll('a[href="/reservation"]').length,0,f+': reading comes before booking');
 for(const id of ['understand','balance','provider'])assert(main.querySelector('#tg-'+id),f+': patient flow '+id);
 assert.equal(main.querySelectorAll('.tg-answer').length,3,f+': three patient answers');
 const all=main.toString();assert(all.indexOf('id="tg-understand"')<all.indexOf('id="tg-provider"'),f+': empathy before provider');
 assert(all.indexOf('id="tg-questions"')<all.indexOf('id="tg-provider"'),f+': remaining questions before provider');
 for(const proof of main.querySelectorAll('.tg-late-showcase'))assert(all.indexOf(proof.toString())>all.indexOf('id="tg-provider"'),f+': clinic promotion last');
}
report.push({file:f,title,canonical,readableChars:chars,h2:main.querySelectorAll('h2').length,videos:main.querySelectorAll('iframe').length,images:main.querySelectorAll('img').length});}
const hub=parse(fs.readFileSync(path.join(dir,'index.html'),'utf8'));for(const slug of Object.keys(profiles))assert(hub.querySelector('main a[href="/treatments/'+slug+'"]'),'missing hub link '+slug);
console.log(JSON.stringify({passed:true,pages:report.length,minReadableChars:Math.min(...report.map(r=>r.readableChars)),report},null,2));
