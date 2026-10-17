const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('node-html-parser');
const cards = require('../src/data/subpage-cards.json');
const editorialImages = require('./treatment-editorial-images.cjs');
const origin = 'https://bdbddc.com';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = x => JSON.stringify(x).replace(/</g, '\\u003c');
const style = '<link rel="stylesheet" href="/static/subpage-cards.css?v=20261014">';
function withStyle(html) {
  return html.includes('/static/subpage-cards.css') ? html : html.replace('</head>', style+'\n</head>');
}
function syncTreatmentPage(html, slug) {
  if (editorialImages.has(slug)) return editorialImages.syncTreatmentPage(html, slug, 'ko');
  const card = cards.find(c => c.slug === slug);
  if (!card) return html;
  const image = origin + card.image, url = origin + '/treatments/' + slug;
  html = html.replace(/<meta\b[^>]*(?:property=["']og:image(?::(?:width|height|alt|type|secure_url))?["']|name=["']twitter:image(?::alt)?["'])[^>]*>\s*/gi, '');
  const metadata = `<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="${esc(card.alt)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${esc(card.alt)}">\n`;
  html = html.replace(/<figure\b[^>]*data-subpage-representative[^>]*>[\s\S]*?<\/figure>/g, '');
  const figure = `<figure class="subpage-representative" data-subpage-representative="${slug}"><img src="${image}" width="1200" height="630" alt="${esc(card.alt)}" loading="eager" fetchpriority="high" decoding="async"><figcaption>${esc(card.caption)}</figcaption></figure>`;
  const panel = /(<aside\b[^>]*class="tg-question-panel"[^>]*>)/;
  if (!panel.test(html)) throw Error('Patient-first question panel missing: '+slug);
  html = html.replace(panel, '$1'+figure);
  // These legacy frame preloads no longer represent the patient-first hero.
  html = html.replace(/<link\b[^>]*rel=["']preload["'][^>]*href=["']\/(?:implant|invisalign|laminate)\/frames\/[^>]*>\s*/gi, '');
  let pageFound = false;
  html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, tag => {
    const value = JSON.parse(tag.slice(tag.indexOf('>')+1, tag.lastIndexOf('</script>')));
    let changed = false;
    function visit(x) {
      if (!x || typeof x !== 'object') return;
      if (typeof x.image === 'string' && x.image.startsWith(origin+'/images/og/')) { x.image=image; changed=true; }
      if (['MedicalWebPage','WebPage'].includes(x['@type']) && (!x.url || x.url.replace(/\/$/,'') === url)) {
        x.image = image;
        x.primaryImageOfPage = {'@type':'ImageObject', url:image, contentUrl:image, width:1200, height:630, caption:card.alt};
        pageFound = changed = true;
      } else if (x['@type'] === 'MedicalProcedure') { x.image = image; changed = true; }
      for (const value of Object.values(x)) if (value && typeof value === 'object') visit(value);
    }
    visit(value);
    return changed ? '<script type="application/ld+json">'+json(value)+'</script>' : tag;
  });
  if (!pageFound) html = html.replace('</head>', '<script type="application/ld+json">'+json({'@context':'https://schema.org','@type':'MedicalWebPage','@id':url+'#guidance',url,name:card.title,inLanguage:'ko-KR',image,primaryImageOfPage:{'@type':'ImageObject',url:image,contentUrl:image,width:1200,height:630,caption:card.alt},publisher:{'@id':origin+'/#dentist'}})+'</script>\n</head>');
  return withStyle(html).replace('</head>', metadata+'</head>');
}
function syncHome(html) {
  // Nested legacy home grids must fit 320px screens as well as the new photo cards.
  html = html.replace(/minmax\(280px,1fr\)/g, 'minmax(min(280px,100%),1fr)');
  html = html.replace(/<!-- SUBPAGE-CARDS:START -->[\s\S]*?<!-- SUBPAGE-CARDS:END -->\s*/g, '');
  html = html.replace(/<script\b[^>]*id="home-treatment-cards-schema"[^>]*>[\s\S]*?<\/script>\s*/g, '');
  const section = `<!-- SUBPAGE-CARDS:START -->
<div id="home-treatment-cards" class="subpage-card-grid" aria-label="궁금한 진료부터 살펴보기">${cards.map(c => `<a class="subpage-card" href="/treatments/${c.slug}"><img src="${c.thumbnail}" alt="${esc(c.alt)}" width="600" height="600" loading="lazy" decoding="async"><div class="subpage-card-copy"><h3>${esc(c.title)}</h3><p>${esc(c.question)}</p><span class="subpage-card-more">장점·부담·준비 사항 읽기 <span aria-hidden="true">↗</span></span></div></a>`).join('\n')}</div>
<!-- SUBPAGE-CARDS:END -->\n`;
  if (!html.includes('<aside id="home-symptom-checker"')) throw Error('Home treatment anchor missing');
  html = html.replace('<aside id="home-symptom-checker"', section+'      <aside id="home-symptom-checker"');
  html = html.replace('천안치과 각 분야 전문 원장이 직접 진료합니다','내가 겪게 될 일이 궁금하다면, 기대와 부담을 함께 살펴보세요.');
  // Keep the other choices; the four repeated links are now the photo cards above.
  const dom = parse(html);
  for (const a of dom.querySelectorAll('.treatment-grid > a')) {
    if (cards.some(c => a.getAttribute('href') === '/treatments/'+c.slug)) html = html.replace('        '+a.toString(), '').replace(a.toString(), '');
  }
  const schema = {'@context':'https://schema.org','@type':'ItemList','@id':origin+'/#treatment-cards',name:'궁금한 진료부터 살펴보기',numberOfItems:cards.length,itemListElement:cards.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.title,url:origin+'/treatments/'+c.slug,image:origin+c.thumbnail}))};
  return withStyle(html).replace('</head>', '<script type="application/ld+json" id="home-treatment-cards-schema">'+json(schema)+'</script>\n</head>');
}
function syncImageSitemap(xml) {
  if (Object.keys(editorialImages.readManifest().images).length) return editorialImages.syncImageSitemap(xml);
  for (const c of cards) {
    const url=origin+'/treatments/'+c.slug;
    const entry=`<image:image><image:loc>${origin+c.image}</image:loc><image:title>${esc(c.alt)}</image:title></image:image>`;
    let found=false;
    xml=xml.replace(/<url>[\s\S]*?<\/url>/g, block=>{
      if (!block.includes('<loc>'+url+'</loc>')) return block;
      found=true;
      block=block.replace(/\s*<image:image>[\s\S]*?<\/image:image>/g, img=>img.includes(origin+c.image)?'':img);
      return block.replace('</loc>', '</loc>\n    '+entry);
    });
    if (!found) xml=xml.replace('</urlset>',`  <url><loc>${url}</loc>\n    ${entry}</url>\n</urlset>`);
  }
  return xml;
}
function syncAll(root) {
  let changed=0;
  function edit(rel, fn) { const file=path.join(root,rel),old=fs.readFileSync(file,'utf8'),next=fn(old);if(next!==old){fs.writeFileSync(file,next);changed++;} }
  cards.forEach(c=>edit('treatments/'+c.slug+'.html',h=>syncTreatmentPage(h,c.slug)));
  edit('index.html',syncHome);
  edit('area/cheonan.html',h=>require('./treatment-navigation.cjs').promoteRevision(h.replace(/href=(["'])([^"']+)\1/g,(tag,quote,href)=>{
    const u=new URL(href,origin+'/area/cheonan');
    if(u.origin!==origin||!/^\/treatments\/[^/]+\.html$/.test(u.pathname)) return tag;
    const pathname=u.pathname==='/treatments/index.html'?'/treatments/':u.pathname.replace(/\.html$/,'');
    return 'href='+quote+pathname+u.search+u.hash+quote;
  })));
  edit('sitemap-images.xml',syncImageSitemap);
  changed += editorialImages.syncAll(root);
  return changed;
}
module.exports={cards,syncTreatmentPage,syncHome,syncImageSitemap,syncAll};
if(require.main===module) console.log('[subpage-cards]',syncAll(path.resolve(process.argv[2]||path.join(__dirname,'..'))),'files updated');
