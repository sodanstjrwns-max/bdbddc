const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {parse}=require('node-html-parser');
const images=require('./treatment-editorial-images.cjs');
const sourceRoot=path.resolve(__dirname,'..');
const slugs=Object.keys(JSON.parse(fs.readFileSync(path.join(sourceRoot,'src/data/treatment-scroll.json'),'utf8')).profiles);
const selfTest=process.argv.includes('--self-test');
const root=path.resolve(process.argv.find((x,i)=>i>1&&!x.startsWith('--'))||sourceRoot);
const protectedTypes=new Set(['Dentist','Organization','MedicalOrganization','MedicalClinic','LocalBusiness','Person','VideoObject','ImageGallery']);
function schemas(html) { return parse(html).querySelectorAll('script[type="application/ld+json"]').map(s=>JSON.parse(s.text)); }
function walk(x,fn) { if (!x||typeof x!=='object')return;fn(x);Object.values(x).forEach(v=>walk(v,fn)); }
function protectedSchemas(html) { const rows=[];schemas(html).forEach(x=>walk(x,v=>{if([].concat(v['@type']||[]).some(t=>protectedTypes.has(t)))rows.push(JSON.stringify(v));}));return rows; }
function verifyPage(html,slug,locale,manifest) {
  const d=parse(html), image=manifest.images[slug],absolute=images.origin+image.src,url=images.canonical(slug,locale);
  for(const [key,value] of [['og:image',absolute],['og:image:width','1200'],['og:image:height','630'],['og:image:alt',image.alt[locale]],['og:image:type','image/jpeg']]){
    const tags=d.querySelectorAll(`meta[property="${key}"]`);assert.equal(tags.length,1,`${locale}/${slug} ${key} count`);assert.equal(tags[0].getAttribute('content'),value);
  }
  assert.equal(d.querySelector('meta[name="twitter:image"]').getAttribute('content'),absolute);
  assert.equal(d.querySelector('link[rel="canonical"]').getAttribute('href'),url);
  const figures=d.querySelectorAll('figure[data-treatment-editorial-image]');assert.equal(figures.length,1);
  assert.equal(d.querySelector('main img').getAttribute('src'),absolute,`${locale}/${slug}: representative must precede motion poster`);
  assert.equal(figures[0].querySelector('img').getAttribute('alt'),image.alt[locale]);
  assert.equal(figures[0].querySelector('img').getAttribute('loading'),'eager');
  assert.equal(figures[0].querySelector('figcaption').text,images.caption(image,locale));
  let pageCount=0;
  schemas(html).forEach(x=>walk(x,v=>{
    if([].concat(v['@type']||[]).some(t=>['MedicalWebPage','WebPage','MedicalProcedure'].includes(t))){
      const u=v.url||(v['@id']?.startsWith(images.origin)?v['@id'].split('#')[0]:'');
      if(!u||u.replace(/\/$/,'')===url){assert.equal(v.image,absolute);if([].concat(v['@type']).some(t=>t.includes('WebPage'))){pageCount++;assert.equal(v.primaryImageOfPage.contentUrl,absolute);assert.equal(v.primaryImageOfPage.width,1200);assert.equal(v.primaryImageOfPage.height,630);}}
    }
  }));assert(pageCount>0);
}
function verifySitemap(xml,manifest){
  for(const slug of Object.keys(manifest.images))for(const [locale]of images.locales){
    const url=images.canonical(slug,locale),rows=(xml.match(/<url>[\s\S]*?<\/url>/g)||[]).filter(x=>x.includes('<loc>'+url+'</loc>'));
    assert.equal(rows.length,1);const editorial=rows[0].match(/<image:loc>https:\/\/bdbddc\.com\/images\/(?:treatment-editorial|treatment-process)\/[^<]+<\/image:loc>/g)||[];
    assert.deepEqual(editorial,['<image:loc>'+images.origin+manifest.images[slug].src+'</image:loc>']);assert(!rows[0].includes('/images/subpage-cards/'));
  }
}
let manifest=images.readManifest();
if(selfTest){
  manifest={version:1,images:Object.fromEntries(slugs.map((slug,i)=>[slug,{src:`/images/treatment-editorial/${slug}/${crypto.createHash('sha256').update(slug).digest('hex').slice(0,12)}/representative.jpg`,width:1200,height:630,bytes:2048,sha256:crypto.createHash('sha256').update(slug).digest('hex'),generated:true,alt:{ko:`${slug} 교육 모형`,en:`${slug} educational model`,ja:`${slug}の教育用模型`},caption:{ko:'치료 설명을 위한 AI 이미지',en:'AI educational image',ja:'治療説明用のAIイメージ'},review:{status:'sample-reviewed',clinicalApproval:false,reasons:[]}}]))};
  for(const slug of images.coreSlugs)manifest.images[slug].thumbnail={src:manifest.images[slug].src.replace('representative.jpg','thumbnail.jpg')};
  const processImage=manifest.images['root-canal'];
  processImage.src=processImage.src.replace('/treatment-editorial/','/treatment-process/');
  images.validate(manifest,{expectedSlugs:slugs});
  for(const invalid of [processImage.src.replace('/root-canal/','/inlay/'),processImage.src.replace('/treatment-process/','/unknown/'),processImage.src+'?v=1',processImage.src.replace('/root-canal/','/../root-canal/')]){
    const badPath=structuredClone(manifest);badPath.images['root-canal'].src=invalid;assert.throws(()=>images.validate(badPath),/Unexpected/);
  }
  const bad=structuredClone(manifest);bad.images[slugs[0]].review.status='hold';assert.throws(()=>images.validate(bad),/not ready/);
  const duplicate=structuredClone(manifest);duplicate.images.invisalign.sha256=duplicate.images.implant.sha256;assert.throws(()=>images.validate(duplicate),/Core representative image reused/);
  const reuse=structuredClone(manifest);reuse.images['implant-hybrid']={...reuse.images.implant,reuseOf:'implant'};assert.equal(images.validate(reuse).uniqueImages,54);
  const traversal=structuredClone(manifest);traversal.images[slugs[0]].src='/../../bad.jpg';assert.throws(()=>images.validate(traversal),/Unexpected/);
}
images.validate(manifest,{expectedSlugs:slugs});
const appliedSlugs=Object.keys(manifest.images),pendingSlugs=manifest.pendingSlugs||[];
let pages=0,protectedRecords=0;
for(const slug of appliedSlugs)for(const [locale,folder]of images.locales){
  const old=fs.readFileSync(path.join(root,folder,'treatments',slug+'.html'),'utf8');
  const html=selfTest?images.syncTreatmentPage(old,slug,locale,manifest):old;
  verifyPage(html,slug,locale,manifest);
  assert.equal(images.syncTreatmentPage(html,slug,locale,manifest),html,'idempotent representative update');
  const appendedHead=html.replace('</head>','<link rel="stylesheet" href="/post-build-preserved.css"><meta name="post-build-test" content="preserve position"></head>');
  assert.equal(images.syncTreatmentPage(appendedHead,slug,locale,manifest),appendedHead,'representative update must preserve later head blocks');
  if(selfTest){assert.deepEqual(protectedSchemas(html),protectedSchemas(old));protectedRecords+=protectedSchemas(old).length;
    const oldDom=parse(old),newDom=parse(html);
    for(const node of oldDom.querySelectorAll('img')){
      const src=node.getAttribute('src')||'';
      if(/\/api\/images\/cases\/|\/images\/doctors\/|\/images\/clinic\/|\/treatment-motion\//.test(src))assert(newDom.querySelectorAll('img').some(n=>n.getAttribute('src')===src),'Preserve nonrepresentative image '+src);
    }
  }
  pages++;
}
const xml=fs.readFileSync(path.join(root,'sitemap-images.xml'),'utf8'),updated=selfTest?images.syncImageSitemap(xml,manifest):xml;
verifySitemap(updated,manifest);assert.equal(images.syncImageSitemap(updated,manifest),updated);
if(selfTest){
  const slug=slugs[0],raw='<html><head><title>Example</title><link rel="canonical" href="'+images.canonical(slug,'ko')+'"><script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Dentist',image:images.origin+'/images/og/clinic.jpg'},{'@type':'Person',image:'/portrait.jpg'},{'@type':'VideoObject',thumbnailUrl:'/video.jpg'},{'@type':'MedicalProcedure',name:'Example',image:'/old.jpg'}]})+'</script></head><body><main><aside class="tg-question-panel"><p>Concern</p></aside><img src="/api/images/cases/keep.jpg"></main></body></html>';
  const transformed=images.syncTreatmentPage(raw,slug,'ko',manifest);verifyPage(transformed,slug,'ko',manifest);assert.deepEqual(protectedSchemas(transformed),protectedSchemas(raw));
}else{
  const assetRoot=root===sourceRoot?sourceRoot:root;
  // post-build assets live directly under dist; validate metadata against those bytes.
  const hashes=new Set();
  for(const [slug,image]of Object.entries(manifest.images)){
    const file=path.join(assetRoot,root===sourceRoot?'public':'',image.src.slice(1)),bytes=fs.readFileSync(file);
    assert.deepEqual(images.jpegSize(bytes),[1200,630]);assert(bytes.length<=307200);assert.equal(bytes.length,image.bytes);const sha=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(sha,image.sha256);hashes.add(sha);
  }assert(hashes.size>=6);
  const coreHashes=new Set(images.coreSlugs.map(slug=>manifest.images[slug].sha256));assert.equal(coreHashes.size,6);
  images.validate(manifest,{expectedSlugs:slugs});
}
let localizedHomeCards=0;
for(const [locale,folder]of images.locales){
  if(locale==='ko')continue;
  const original=fs.readFileSync(path.join(root,folder,'index.html'),'utf8'),html=selfTest?images.syncLocalizedHome(original,locale,manifest):original,d=parse(html);
  const links=d.querySelectorAll('#home-treatment-cards > a'),list=JSON.parse(d.querySelector('#home-treatment-cards-schema').text);
  assert.equal(links.length,6);assert.equal(list.numberOfItems,6);assert.equal(list.itemListElement.length,6);
  links.forEach((a,i)=>{const item=list.itemListElement[i];assert.equal(item.position,i+1);assert.equal(item.name,a.querySelector('h3').text);assert.equal(item.url,images.origin+a.getAttribute('href'));assert.equal(item.image,images.origin+a.querySelector('img').getAttribute('src'));assert.equal(a.querySelector('img').getAttribute('width'),'600');});
  for(const a of d.querySelectorAll('.treatment-grid > a'))assert(!links.some(x=>x.getAttribute('href')===a.getAttribute('href')),'No duplicated core card');
  assert.equal(images.syncLocalizedHome(html,locale,manifest),html);
  const appendedHead=html.replace('</head>','<link rel="stylesheet" href="/post-build-preserved.css"></head>');
  assert.equal(images.syncLocalizedHome(appendedHead,locale,manifest),appendedHead,'home schema must preserve later head blocks');
  if(selfTest){assert.deepEqual(protectedSchemas(html),protectedSchemas(original));}
  localizedHomeCards+=links.length;
}
const reuseSummary=images.validate(manifest,{expectedSlugs:slugs});
console.log(JSON.stringify({passed:true,coverageComplete:pendingSlugs.length===0,pendingSlugs,mode:selfTest?'pure-transform-regression':'integrated-files',pages,images:Object.keys(manifest.images).length,localizedHomeCards,uniqueImages:reuseSummary.uniqueImages,reusedImages:reuseSummary.reusedImages,protectedRecords,clinicalApproval:false,visualQualityAssessed:false}));
