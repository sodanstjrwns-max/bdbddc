/** Representative educational imagery shared by source generators and post-build. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const origin = 'https://bdbddc.com';
const sourceRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(sourceRoot, 'src/data/treatment-editorial-images.json');
const locales = [['ko', ''], ['en', 'en/'], ['ja', 'jp/']];
const coreSlugs = ['implant','invisalign','glownate','wisdom-tooth','pediatric','cavity'];
const disclosure = {
  ko: '이해를 돕기 위한 AI 교육 이미지입니다. 실제 환자·치료 결과 사진이 아닙니다.',
  en: 'AI-generated educational illustration; not a photograph of a patient or a treatment result.',
  ja: '理解を助けるためのAI教育用イメージです。実際の患者さんや治療結果の写真ではありません。',
};
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeJson = x => JSON.stringify(x).replace(/</g, '\\u003c');
function readManifest() { return fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { version: 1, images: {} }; }
function has(slug, manifest = readManifest()) { return Boolean(manifest.images?.[slug]); }
function canonical(slug, locale) { const prefix = locales.find(([l]) => l === locale)?.[1]; if (prefix === undefined) throw Error('Unsupported image locale: '+locale); return origin+'/'+prefix+'treatments/'+slug; }
function caption(image, locale) { const text = image.caption[locale].trim(); return /AI|人工知能/i.test(text) ? text : text+' '+disclosure[locale]; }
function jpegSize(buffer) {
  if (buffer.readUInt16BE(0) !== 0xffd8) throw Error('Not a JPEG');
  let i=2;
  while (i<buffer.length) {
    if (buffer[i] !== 255) throw Error('Invalid JPEG marker');
    while (buffer[i] === 255) i++;
    const marker=buffer[i++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length=buffer.readUInt16BE(i);
    if ([0xc0,0xc1,0xc2].includes(marker)) return [buffer.readUInt16BE(i+5),buffer.readUInt16BE(i+3)];
    if (length < 2) throw Error('Invalid JPEG segment');
    i+=length;
  }
  throw Error('JPEG dimensions missing');
}
function validate(manifest, options={}) {
  if (![1,2].includes(manifest.version) || !manifest.images || Array.isArray(manifest.images)) throw Error('Unsupported image manifest');
  const slugs=Object.keys(manifest.images).sort();
  const pending=manifest.pendingSlugs||[];
  if (!Array.isArray(pending)||pending.some(slug=>typeof slug!=='string'||slugs.includes(slug))||new Set(pending).size!==pending.length) throw Error('Invalid pending image coverage');
  if (options.expectedSlugs && JSON.stringify([...slugs,...pending].sort())!==JSON.stringify([...options.expectedSlugs].sort())) throw Error('Applied plus pending image slugs do not match the treatment profiles');
  const paths=new Map(), hashes=new Map(), coreHashes=new Set();
  for (const slug of slugs) {
    const image=manifest.images[slug];
    if (!/^[a-z0-9-]+$/.test(slug)) throw Error('Invalid slug: '+slug);
    if (!/^\/images\/treatment-editorial\/[a-z0-9-]+\/[a-f0-9]{12,64}\/representative\.jpg$/.test(image.src)) throw Error('Unexpected representative path: '+slug);
    if (image.width!==1200 || image.height!==630 || !Number.isInteger(image.bytes) || image.bytes<=0 || image.bytes>300*1024) throw Error('Invalid dimensions or size: '+slug);
    if (!/^[a-f0-9]{64}$/.test(image.sha256)) throw Error('Missing representative SHA: '+slug);
    if (paths.has(image.src) && paths.get(image.src)!==image.sha256) throw Error('One image path has different hashes: '+slug);
    paths.set(image.src,image.sha256);
    if (!hashes.has(image.sha256)) hashes.set(image.sha256,[]);
    hashes.get(image.sha256).push(slug);
    if (coreSlugs.includes(slug)) { if (coreHashes.has(image.sha256)) throw Error('Core representative image reused: '+slug); coreHashes.add(image.sha256); }
    if (image.generated!==true || image.review?.status!=='sample-reviewed' || image.review.clinicalApproval!==false || (image.review.blockingIssues||[]).length) throw Error('Image not ready for integration: '+slug);
    for (const [locale] of locales) for (const field of ['alt','caption']) if (typeof image[field]?.[locale]!=='string' || !image[field][locale].trim()) throw Error('Missing '+locale+' '+field+': '+slug);
    if (options.assetRoot) {
      const file=path.join(options.assetRoot,'public',image.src.slice(1));
      const bytes=fs.readFileSync(file);
      if (bytes.length!==image.bytes || crypto.createHash('sha256').update(bytes).digest('hex')!==image.sha256 || String(jpegSize(bytes))!=='1200,630') throw Error('Representative file mismatch: '+slug);
    }
  }
  return { images:slugs.length, pendingSlugs:pending, coverageComplete:pending.length===0, uniqueImages:hashes.size, reusedImages:[...hashes.entries()].filter(([,slugs])=>slugs.length>1).map(([sha256,slugs])=>({sha256,slugs})) };
}
function syncTreatmentPage(html, slug, locale='ko', manifest=readManifest()) {
  const image=manifest.images?.[slug];
  if (!image) return html;
  const url=canonical(slug,locale), src=origin+image.src, alt=image.alt[locale];
  // Only known representative wrappers are replaced. Clinical cases, staff, and clinic galleries remain intact.
  html=html.replace(/<figure\b[^>]*\bdata-(?:subpage-representative|treatment-editorial-image)(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/figure>/gi,'');
  html=html.replace(/<figure\b[^>]*class=["'][^"']*\btg-guide-photo\b[^"']*["'][^>]*>[\s\S]*?<\/figure>/gi, tag=> /<img\b[^>]*src=["'](?:https:\/\/bdbddc\.com)?\/images\/(?:subpage-cards|treatment-editorial)\//i.test(tag)?'':tag);
  const panel=/<aside\b[^>]*class=["'][^"']*\btg-question-panel\b[^"']*["'][^>]*>/;
  if (!panel.test(html)) throw Error('Missing patient question panel: '+locale+'/'+slug);
  const figure=`<figure class="subpage-representative" data-subpage-representative="${slug}" data-treatment-editorial-image="${slug}"><img src="${src}" width="1200" height="630" alt="${escape(alt)}" loading="eager" fetchpriority="high" decoding="async"><figcaption>${escape(caption(image,locale))}</figcaption></figure>`;
  html=html.replace(panel, tag=>tag+figure);
  // Retain the first image-meta position: later favicon/motion passes may append their own head blocks.
  const metadataAnchor='<!-- TREATMENT-EDITORIAL-METADATA-ANCHOR -->';
  let metadataFound=false;
  html=html.replace(/<meta\b[^>]*(?:property=["']og:image(?::(?:width|height|alt|type|secure_url))?["']|name=["']twitter:image(?::alt)?["'])[^>]*>\s*/gi,()=>{if(metadataFound)return '';metadataFound=true;return metadataAnchor;});
  html=html.replace(/<link\b[^>]*rel=["']preload["'][^>]*href=["']\/(?:implant|invisalign|laminate)\/frames\/[^>]*>\s*/gi,'');
  const tags=[['property','og:image',src],['property','og:image:width','1200'],['property','og:image:height','630'],['property','og:image:type','image/jpeg'],['property','og:image:alt',alt],['name','twitter:image',src],['name','twitter:image:alt',alt]].map(([attr,key,value])=>`<meta ${attr}="${key}" content="${escape(value)}">`).join('\n')+'\n';
  let pageFound=false;
  html=html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, tag=>{
    const data=JSON.parse(tag.slice(tag.indexOf('>')+1,tag.lastIndexOf('</script>')));
    let changed=false;
    function visit(x) {
      if (!x || typeof x!=='object') return;
      if (Array.isArray(x)) return x.forEach(visit);
      const types=[].concat(x['@type']||[]);
      // Entity portraits, clinic identity, case galleries, and videos are not representative-page imagery.
      if (types.some(t=>['Dentist','Organization','MedicalOrganization','MedicalClinic','LocalBusiness','Person','VideoObject','ImageObject','ImageGallery','Review','AggregateRating'].includes(t))) return;
      const page=types.some(t=>['MedicalWebPage','WebPage'].includes(t));
      const objectUrl=x.url || (x['@id']?.startsWith(origin)?x['@id'].split('#')[0]:'');
      if (page && (!objectUrl || objectUrl.replace(/\/$/,'')===url)) {
        x.image=src;
        x.primaryImageOfPage={'@type':'ImageObject',url:src,contentUrl:src,width:1200,height:630,caption:alt};
        pageFound=changed=true;
      } else if (types.includes('MedicalProcedure') && (!objectUrl || objectUrl.replace(/\/$/,'')===url)) { x.image=src; changed=true; }
      Object.values(x).forEach(visit);
    }
    visit(data);
    return changed ? tag.slice(0,tag.indexOf('>')+1)+safeJson(data)+'</script>' : tag;
  });
  if (!pageFound) {
    const name=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || alt;
    html=html.replace('</head>',`<script type="application/ld+json" data-treatment-editorial-schema>${safeJson({'@context':'https://schema.org','@type':'MedicalWebPage','@id':url+'#guidance',url,name,inLanguage:locale,image:src,primaryImageOfPage:{'@type':'ImageObject',url:src,contentUrl:src,width:1200,height:630,caption:alt},publisher:{'@id':origin+'/#dentist'}})}</script>\n</head>`);
  }
  if (!html.includes('/static/subpage-cards.css')) html=html.replace('</head>','<link rel="stylesheet" href="/static/subpage-cards.css?v=20261014">\n</head>');
  return metadataFound ? html.replace(metadataAnchor,tags) : html.replace('</head>',tags+'</head>');
}
function syncImageSitemap(xml, manifest=readManifest()) {
  if (!Object.keys(manifest.images||{}).length) return xml;
  if (!xml.includes('xmlns:image=')) xml=xml.replace(/<urlset\b/, '<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  for (const [slug,image] of Object.entries(manifest.images)) for (const [locale] of locales) {
    const url=canonical(slug,locale), entry=`<image:image><image:loc>${origin+image.src}</image:loc><image:title>${escape(image.alt[locale])}</image:title></image:image>`;
    let count=0;
    xml=xml.replace(/<url>[\s\S]*?<\/url>/g, block=>{
      if (!block.includes('<loc>'+url+'</loc>')) return block;
      count++;
      block=block.replace(/\s*<image:image>[\s\S]*?<\/image:image>/g, tag=>/<image:loc>https:\/\/bdbddc\.com\/images\/(?:subpage-cards|treatment-editorial)\//.test(tag)?'':tag);
      return block.replace('</loc>','</loc>\n    '+entry);
    });
    if (count>1) throw Error('Duplicate image sitemap page: '+url);
    if (!count) xml=xml.replace('</urlset>',`  <url><loc>${url}</loc>\n    ${entry}</url>\n</urlset>`);
  }
  return xml;
}
function syncLocalizedHome(html, locale, manifest=readManifest()) {
  if (!['en','ja'].includes(locale)) throw Error('Localized home locale must be en or ja');
  if (!Object.keys(manifest.images||{}).length) return html;
  const copy={
    en:{label:'Start with the treatment you are wondering about',more:'Explore benefits, concerns and preparation',disclosure:'AI-generated educational illustrations; not photographs of patients or treatment results.',titles:['Dental implants','Invisalign clear aligners','Glownate veneers','Wisdom teeth','Children’s dentistry','Tooth decay'],questions:['What happens during treatment, and what might be difficult?','What will wearing and caring for aligners involve?','What can veneers change, and what do I need to consider?','When might a wisdom tooth need treatment?','How can we help a child feel more comfortable at the dentist?','Why do different cavities need different treatments?']},
    ja:{label:'気になる診療からご覧ください',more:'利点・気がかり・準備を読む',disclosure:'理解を助けるためのAI教育用イメージです。実際の患者さんや治療結果の写真ではありません。',titles:['インプラント','インビザライン','グロウネイト','親知らず','小児歯科','虫歯治療'],questions:['治療はどう進み、どのような負担があるのでしょうか。','装着中の生活やお手入れはどう変わるのでしょうか。','変えられることと、事前に考えたいことを確認します。','親知らずの治療は、どのようなときに必要でしょうか。','お子さんが歯科で安心して過ごすために、できることは。','虫歯によって治療法が違うのはなぜでしょうか。']}
  }[locale];
  const prefix=locale==='en'?'en':'jp';
  html=html.replace(/<!-- TREATMENT-EDITORIAL-CARDS:START -->[\s\S]*?<!-- TREATMENT-EDITORIAL-CARDS:END -->\s*/g,'');
  const schemaAnchor='<!-- TREATMENT-EDITORIAL-HOME-SCHEMA-ANCHOR -->';
  let schemaFound=false;
  html=html.replace(/<script\b[^>]*id=["']home-treatment-cards-schema["'][^>]*>[\s\S]*?<\/script>\s*/g,()=>{if(schemaFound)return '';schemaFound=true;return schemaAnchor;});
  const grid=/<div\b[^>]*class=["'][^"']*\btreatment-grid\b[^"']*["'][^>]*>/;
  if(!grid.test(html))throw Error('Localized home treatment grid missing: '+locale);
  const cards=coreSlugs.map((slug,i)=>{
    const image=manifest.images[slug];if(!image?.thumbnail?.src)throw Error('Missing home thumbnail: '+slug);
    return {slug,image,name:copy.titles[i],question:copy.questions[i],url:`/${prefix}/treatments/${slug}`};
  });
  const {parse}=require('node-html-parser'),dom=parse(html);
  for(const a of dom.querySelectorAll('.treatment-grid > a'))if(cards.some(card=>a.getAttribute('href')===card.url))html=html.replace('        '+a.toString(),'').replace(a.toString(),'');
  const section=`<!-- TREATMENT-EDITORIAL-CARDS:START -->\n<div id="home-treatment-cards" class="subpage-card-grid" aria-label="${escape(copy.label)}">${cards.map(c=>`<a class="subpage-card" href="${c.url}"><img src="${c.image.thumbnail.src}" alt="${escape(c.image.alt[locale])}" width="600" height="600" loading="lazy" decoding="async"><div class="subpage-card-copy"><h3>${escape(c.name)}</h3><p>${escape(c.question)}</p><span class="subpage-card-more">${escape(copy.more)} <span aria-hidden="true">↗</span></span></div></a>`).join('\n')}</div>\n<p class="section-subtitle">${escape(copy.disclosure)}</p>\n<!-- TREATMENT-EDITORIAL-CARDS:END -->\n`;
  html=html.replace(grid,tag=>section+tag);
  const schema={'@context':'https://schema.org','@type':'ItemList','@id':origin+'/'+prefix+'/#treatment-cards',name:copy.label,numberOfItems:cards.length,itemListElement:cards.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,url:origin+c.url,image:origin+c.image.thumbnail.src}))};
  if(!html.includes('/static/subpage-cards.css'))html=html.replace('</head>','<link rel="stylesheet" href="/static/subpage-cards.css?v=20261014">\n</head>');
  const schemaTag=`<script type="application/ld+json" id="home-treatment-cards-schema">${safeJson(schema)}</script>\n`;
  return schemaFound ? html.replace(schemaAnchor,schemaTag) : html.replace('</head>',schemaTag+'</head>');
}
function syncAll(root, manifest=readManifest()) {
  if (!Object.keys(manifest.images||{}).length) return 0;
  let changed=0;
  function edit(file,transform) { const old=fs.readFileSync(file,'utf8'), next=transform(old); if (old!==next) { fs.writeFileSync(file,next); changed++; } }
  for (const slug of Object.keys(manifest.images)) for (const [locale,folder] of locales) edit(path.join(root,folder,'treatments',slug+'.html'),html=>syncTreatmentPage(html,slug,locale,manifest));
  edit(path.join(root,'sitemap-images.xml'),xml=>syncImageSitemap(xml,manifest));
  for(const [locale,folder]of locales)if(locale!=='ko')edit(path.join(root,folder,'index.html'),html=>syncLocalizedHome(html,locale,manifest));
  return changed;
}
module.exports={origin,locales,coreSlugs,readManifest,has,canonical,caption,jpegSize,validate,syncTreatmentPage,syncImageSitemap,syncLocalizedHome,syncAll};
if (require.main===module) console.log(JSON.stringify({changed:syncAll(path.resolve(process.argv[2]||sourceRoot))}));
