import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {regions,categories,matrix,urlFor} from './build-regional-guides.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const p of matrix)if(!fs.existsSync(path.join(ROOT,p.url+'.html')))throw Error('Create the canonical guide before linking: '+p.url);
const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'public/static/regional-links.css'))).digest('hex').slice(0,12);
function block(title,description,links){return `<section id="bd-region-guide-links" class="bd-region-guide-links" aria-labelledby="bd-region-guide-title"><div><small>진료 선택과 내원 준비</small><h2 id="bd-region-guide-title">${esc(title)}</h2><p>${esc(description)}</p><nav aria-label="지역과 진료별 상세 안내">${links.map(([href,label])=>`<a href="${href}">${esc(label)} <span aria-hidden="true">→</span></a>`).join('')}</nav></div></section>`;}
function update(url,section){const p=path.join(ROOT,url==='/'?'index.html':url+'.html');let h=fs.readFileSync(p,'utf8');h=h.replace(/<section id="bd-region-guide-links"[\s\S]*?<\/section>/g,'').replace(/<link rel="stylesheet" href="\/static\/regional-links\.css[^>]*>\s*/g,'');if(!h.includes('</main>'))throw Error('Missing main '+url);h=h.replace(/\s*<\/main>/,'\n'+section+'\n</main>').replace('</head>',`<link rel="stylesheet" href="/static/regional-links.css?v=${hash}">\n</head>`);if(fs.readFileSync(p,'utf8')!==h)fs.writeFileSync(p,h);}
update('/',block('거주 지역에서 준비하는 치과 진료','천안과 아산을 비롯해 각 지역에서 치료를 고민하는 분들을 위한 안내입니다. 필요한 진료의 선택 기준과 단계, 담당 의료진과 내원 준비를 살펴보세요. 실제 진료 장소는 천안 불당동입니다.',Object.entries(regions).map(([r,n])=>[urlFor(r,'dental'),n+' 치과 안내'])));
for(const c of Object.keys(categories).filter(x=>x!=='dental'))update(categories[c].main,block(categories[c].name+' · 지역별 내원 준비','검사와 치료, 회복 확인과 장기 관리의 목적을 나누어 상담하세요. 출발 지역에 맞는 진료 안내와 질문을 확인할 수 있습니다.',Object.entries(regions).map(([r,n])=>[urlFor(r,c),n+' '+categories[c].name])));
for(const c of ['dental','implant','orthodontics','invisalign'])update(urlFor('asan',c),block('아산에서 찾는 진료별 상세 안내','고민하는 증상과 치료 범위에 따라 확인할 내용이 다릅니다. 관련 진료의 선택 기준과 실제 과정을 함께 살펴보세요.',Object.entries(categories).filter(([k])=>k!==c).map(([k,v])=>[urlFor('asan',k),'아산 '+v.name])));
const sm=path.join(ROOT,'sitemap-area.xml');let xml=fs.readFileSync(sm,'utf8');let added=0;const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());for(const p of matrix.filter(x=>x.url.startsWith('/area/'))){const loc='https://bdbddc.com'+p.url;if(!xml.includes('<loc>'+loc+'</loc>')){xml=xml.replace('</urlset>',`  <url><loc>${loc}</loc><lastmod>${date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);added++;}}
if(fs.readFileSync(sm,'utf8')!==xml)fs.writeFileSync(sm,xml);console.log(JSON.stringify({linkedCombinations:matrix.length,newSitemapURLs:added}));
