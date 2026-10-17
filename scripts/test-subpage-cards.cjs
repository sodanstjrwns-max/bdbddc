const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {parse}=require('node-html-parser');
const {cards,syncTreatmentPage,syncHome,syncImageSitemap}=require('./subpage-cards.cjs');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..')),origin='https://bdbddc.com';
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assetFile=f=>{const rel=f.replace(/^\/+/,''),pub=path.join(root,'public',rel);return fs.existsSync(pub)?pub:path.join(root,rel);};
function jpegSize(b){assert.equal(b.readUInt16BE(0),0xffd8);let i=2;while(i<b.length){assert.equal(b[i],255);const marker=b[i+1],len=b.readUInt16BE(i+2);if([0xc0,0xc1,0xc2].includes(marker))return[b.readUInt16BE(i+7),b.readUInt16BE(i+5)];i+=2+len;}throw Error('JPEG size missing');}
const hashes=new Set(),sitemap=read('sitemap-images.xml');
for(const c of cards){
  const html=read('treatments/'+c.slug+'.html'),d=parse(html),image=origin+c.image;
  const images=d.querySelectorAll('meta[property="og:image"]');assert.equal(images.length,1);assert.equal(images[0].getAttribute('content'),image);
  for(const [name,value] of [['width','1200'],['height','630']])assert.equal(d.querySelector(`meta[property="og:image:${name}"]`).getAttribute('content'),value);
  assert.equal(d.querySelector('main img').getAttribute('src'),image);
  assert.equal(d.querySelector('main img').getAttribute('loading'),'eager');
  assert.equal(d.querySelector('link[rel="canonical"]').getAttribute('href'),origin+'/treatments/'+c.slug);
  const schemas=d.querySelectorAll('script[type="application/ld+json"]').map(s=>JSON.parse(s.text));let webPages=0;
  function visit(x){if(!x||typeof x!=='object')return;if(typeof x.image==='string')assert(!x.image.includes('/images/og/'),c.slug+' old category image');if(['MedicalWebPage','WebPage','MedicalProcedure'].includes(x['@type'])){assert.equal(x.image,image,`${c.slug} ${x['@type']} image`);if(x['@type'].includes('WebPage'))webPages++;}Object.values(x).forEach(visit);}
  schemas.forEach(visit);assert(webPages>0);
  const entry=sitemap.match(/<url>[\s\S]*?<\/url>/g).filter(e=>e.includes('<loc>'+origin+'/treatments/'+c.slug+'</loc>'));assert.equal(entry.length,1);assert(entry[0].includes('<image:loc>'+image+'</image:loc>'));
  for(const [file,size]of[[c.image,[1200,630]],[c.thumbnail,[600,600]]]){const b=fs.readFileSync(assetFile(file));assert.deepEqual(jpegSize(b),size);assert(b.length<=300*1024);hashes.add(crypto.createHash('sha256').update(b).digest('hex'));}
  assert.equal(syncTreatmentPage(syncTreatmentPage(html,c.slug),c.slug),syncTreatmentPage(html,c.slug),'repeat image update');
}
assert.equal(hashes.size,12);
const home=read('index.html'),d=parse(home),links=d.querySelectorAll('#home-treatment-cards > a'),list=JSON.parse(d.querySelector('#home-treatment-cards-schema').text);
assert.equal(links.length,6);assert.equal(list.numberOfItems,6);assert.equal(list.itemListElement.length,6);
links.forEach((a,i)=>{const item=list.itemListElement[i];assert.equal(item.position,i+1);assert.equal(item.name,a.querySelector('h3').text);assert.equal(item.url,origin+a.getAttribute('href'));assert.equal(item.image,origin+a.querySelector('img').getAttribute('src'));assert.equal(a.querySelector('img').getAttribute('width'),'600');});
assert.equal(syncHome(syncHome(home)),syncHome(home));assert.equal(syncImageSitemap(syncImageSitemap(sitemap)),syncImageSitemap(sitemap));
const area=parse(read('area/cheonan.html'));let areaLinks=0;
for(const a of area.querySelectorAll('a[href]')){const u=new URL(a.getAttribute('href'),origin+'/area/cheonan');if(u.origin===origin&&u.pathname.startsWith('/treatments/')){assert(!u.pathname.endsWith('.html'),u.href);areaLinks++;}}
assert(areaLinks>10);
console.log(JSON.stringify({passed:true,root,treatmentPages:cards.length,uniqueImages:hashes.size,homeCards:links.length,canonicalAreaLinks:areaLinks}));
