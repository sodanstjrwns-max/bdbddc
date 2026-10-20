'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {parse}=require('node-html-parser');
const {render,inject,validate,assetVersion}=require('./treatment-connect-video.cjs');
const runtimeContext={module:{exports:{}}};require('node:vm').runInNewContext(fs.readFileSync(path.resolve(__dirname,'../public/static/treatment-connect-video.js'),'utf8'),runtimeContext);const runtime=runtimeContext.module.exports;
const root=path.resolve(__dirname,'..'),clone=x=>JSON.parse(JSON.stringify(x));
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
const media={topicId:'CRN-001',libraryKey:'drive:CRN-001',videoKey:'library/CRN-001/b87f2ec16bd7.mp4',posterKey:'library/CRN-001/6381740f5a30.jpg',durationSeconds:47.67};
const library={items:[{key:'drive:CRN-001',topic_id:'CRN-001',title:'자연치 크라운 치료 과정',media:[{key:media.videoKey,media_type:'video',poster_key:media.posterKey,duration_seconds:47.67}]}]};
const profile={title:{ko:'크라운 치료',en:'Crown treatment',ja:'クラウン治療'},intro:{ko:'치아를 준비하고 크라운을 씌우는 과정을 살펴봅니다.',en:'Explore preparation and crown placement.',ja:'形成からクラウンの装着までをご覧ください。'},primary:media,supplementary:[]};
const data={version:1,profiles:{crown:profile}};
const html='<!doctype html><html><head><link rel="canonical" href="https://bdbddc.com/treatments/crown"></head><body><main><section id="preserved"><canvas id="original-bespoke"></canvas></section><section id="tg-journey"><h2>Original process</h2><ol><li>Original step</li></ol></section><section id="after">After</section></main></body></html>';
test('valid exact public library binding',()=>assert.deepEqual(validate(data,library,['crown']),[]));
for(const [name,mutate] of [
 ['private hospital media',p=>p.primary.videoKey='h1/m1/private.mp4'],
 ['sped-up derivative',p=>p.primary.videoKey='library/CRN-001/b87f2ec16bd7-3x.mp4'],
 ['wrong topic',p=>p.primary.topicId='IMP-001'],
 ['unlisted media bytes key',p=>p.primary.videoKey='library/CRN-001/11111111.mp4'],
 ['poster mismatch',p=>p.primary.posterKey='library/CRN-001/11111111.jpg'],
 ['wrong duration',p=>p.primary.durationSeconds=48],
 ['empty locale',p=>p.title.en=''],
 ['duplicate primary as supplement',p=>p.supplementary=[clone(p.primary)]],
 ['credential/query key',p=>p.primary.videoKey+='?token=private']
])test('reject '+name,()=>{const d=clone(data);mutate(d.profiles.crown);assert(validate(d,library).length>0);});
test('reject unknown origin',()=>assert(validate({...data,mediaOrigin:'https://example.com'},library).length>0));
test('reject incomplete treatment coverage',()=>assert(validate(data,library,['crown','implant']).length>0));
test('native video includes controls/playsinline/no preload and original URL',()=>{const d=parse(render(profile,'ko','crown',library));const v=d.querySelector('video');assert(v.hasAttribute('controls'));assert(v.hasAttribute('playsinline'));assert.equal(v.getAttribute('preload'),'none');assert(!v.hasAttribute('autoplay'));assert(!v.hasAttribute('loop'));assert.equal(v.getAttribute('src'),'https://connect.patientfunnel.kr/a/'+media.videoKey);});
test('localized language disclosure',()=>{assert(render(profile,'en','crown',library).includes('This video contains Korean text.'));assert(render(profile,'ja','crown',library).includes('動画内の説明は韓国語です。'));});
test('escape all supplied labels',()=>{const p=clone(profile);p.title.ko='<img src=x onerror=alert(1)>';const d=parse(render(p,'ko','crown',library));assert.equal(d.querySelectorAll('img').length,0);assert.equal(d.querySelector('h2').text,p.title.ko);});
test('inject immediately after actual journey, preserve bespoke/main/canonical',()=>{const d=parse(inject(html,'crown','ko',data,library,'test'));assert.equal(d.querySelector('#tg-journey').nextElementSibling.id,'treatment-connect-video');assert.equal(d.querySelector('#original-bespoke').tagName,'CANVAS');assert.equal(d.querySelector('#tg-journey').text,'Original processOriginal step');assert.equal(d.querySelector('link[rel=canonical]').getAttribute('href'),'https://bdbddc.com/treatments/crown');});
test('injection idempotent and one pair of assets',()=>{const one=inject(html,'crown','ko',data,library,'test');const two=inject(one,'crown','ko',data,library,'test');assert.equal(one,two);const d=parse(two);assert.equal(d.querySelectorAll('[data-tcv]').length,1);assert.equal(d.querySelectorAll('script[src^="/static/treatment-connect-video"]').length,1);});
test('hub untouched',()=>assert.equal(inject(html,'index','ko',data,library,'test'),html));
test('missing journey fails instead of misplacing video',()=>assert.throws(()=>inject(html.replace('id="tg-journey"','id="other"'),'crown','ko',data,library,'test')));
test('whole-source time mapping clamps both endpoints',()=>{assert.equal(runtime.targetTime(0,47.67),0);assert(Math.abs(runtime.targetTime(1,47.67)-47.66)<1e-8);assert.equal(runtime.targetTime(.5,47.67),23.835);assert.equal(runtime.targetTime(-1,47.67),0);});
test('scroll forward/reverse mapping',()=>{assert.equal(runtime.scrollProgress(1000,912,3000,600,88),0);assert.equal(runtime.scrollProgress(1000,2112,3000,600,88),.5);assert.equal(runtime.scrollProgress(1000,3312,3000,600,88),1);assert.equal(runtime.scrollProgress(1000,912,3000,600,88),0);});
test('time labels preserve full runtime',()=>{assert.equal(runtime.timeLabel(47.67),'0:47');assert.equal(runtime.timeLabel(90),'1:30');});
test('asset stamp is content based',()=>assert.match(assetVersion(root),/^[0-9a-f]{12}$/));

const fixtureRoot=path.join(root,'.wrangler/connect-treatment-videos-20261021/tests/excerpt-digests');
const excerptBytes=Buffer.from('Deliberately non-video test bytes: digest guard only.');
const posterBytes=Buffer.from('Deliberately non-image test bytes: digest guard only.');
const hash=x=>require('node:crypto').createHash('sha256').update(x).digest('hex');
const excerptSHA=hash(excerptBytes),posterSHA=hash(posterBytes),sourceSHA=path.basename(media.videoKey,'.mp4')+'a'.repeat(64-path.basename(media.videoKey,'.mp4').length);
const excerptProfile=clone(profile);excerptProfile.primary.localExcerpt={src:'/videos/treatment-connect/CRN-001/'+excerptSHA.slice(0,12)+'.mp4',sha256:excerptSHA,sourceSha256:sourceSHA,startSeconds:0,endSeconds:35,durationSeconds:35,reviewRecord:{topicId:'CRN-001',videoKey:media.videoKey,sourceSha256:sourceSHA,excerptSha256:excerptSHA,startSeconds:0,endSeconds:35,durationSeconds:35,decision:'accepted-excerpt'}};
excerptProfile.primary.localPoster='/images/treatment-connect/CRN-001/'+posterSHA.slice(0,12)+'.jpg';
const excerptData={version:1,profiles:{crown:excerptProfile}};
test('excerpt remains bound to original public topic and has an explicit reviewed interval',()=>assert.deepEqual(validate(excerptData,library),[]));
test('excerpt renderer uses local source/poster, hides original link and private provenance',()=>{for(const locale of ['ko','en','ja']){const h=render(excerptProfile,locale,'crown',library),d=parse(h);assert.equal(d.querySelector('video').getAttribute('src'),excerptProfile.primary.localExcerpt.src);assert.equal(d.querySelector('video').getAttribute('poster'),excerptProfile.primary.localPoster);assert.equal(d.querySelectorAll('a').length,0);assert(!h.includes(sourceSHA));assert(!h.includes('reviewRecord'));assert(!d.text.includes('complete video'));assert(!d.text.includes('전체 영상'));}});
for(const [name,mutate] of [
 ['source interval starts late',x=>x.startSeconds=1],['unbounded source interval',x=>x.endSeconds=50],['duration mismatch',x=>x.durationSeconds=30],['unsafe local path',x=>x.src='/videos/../private.mp4'],['non-string path',x=>x.src=99],['missing source hash',x=>x.sourceSha256=''],['review mismatch',x=>x.reviewRecord.excerptSha256='f'.repeat(64)],['unaccepted review',x=>x.reviewRecord.decision='HOLD']
])test('reject excerpt '+name,()=>{const d=clone(excerptData);mutate(d.profiles.crown.primary.localExcerpt);assert(validate(d,library).length>0);});
test('wrong source SHA prefix rejected even when inline review agrees',()=>{const d=clone(excerptData);d.profiles.crown.primary.localExcerpt.sourceSha256='f'.repeat(64);d.profiles.crown.primary.localExcerpt.reviewRecord.sourceSha256='f'.repeat(64);assert(validate(d,library).some(x=>x.includes('original video key')));});
test('frozen source SHA mismatch rejected',()=>{const l=clone(library);l.items[0].media[0].sha256='b'.repeat(64);assert(validate(excerptData,l).some(x=>x.includes('source SHA256 differs')));});
const videoFile=path.join(fixtureRoot,'public',excerptProfile.primary.localExcerpt.src),posterFile=path.join(fixtureRoot,'public',excerptProfile.primary.localPoster);
fs.mkdirSync(path.dirname(videoFile),{recursive:true});fs.mkdirSync(path.dirname(posterFile),{recursive:true});fs.writeFileSync(videoFile,excerptBytes);fs.writeFileSync(posterFile,posterBytes);
test('optional actual-byte verification matches excerpt and poster digest',()=>assert.deepEqual(validate(excerptData,library,undefined,{verifyFiles:true,siteRoot:fixtureRoot}),[]));
test('changed bytes fail despite unchanged manifest',()=>{fs.writeFileSync(videoFile,Buffer.from('different digest'));assert(validate(excerptData,library,undefined,{verifyFiles:true,siteRoot:fixtureRoot}).some(x=>x.includes('bytes differ')));fs.writeFileSync(videoFile,excerptBytes);});
test('missing local files fail',()=>{assert(validate(excerptData,library,undefined,{verifyFiles:true,siteRoot:path.join(fixtureRoot,'missing')}).length>0);});

// Model metadata/viewport event ordering; this does not substitute for browser decoding tests.
function runtimeHarness(){
 const events={},windowEvents={},query={};
 const simple=()=>({hidden:false,offsetHeight:500,setAttribute(){},addEventListener(type,fn){this[type]=fn;}});
 const video={...simple(),duration:NaN,readyState:0,controls:true,currentTime:0,seeking:false,addEventListener:(e,f)=>events[e]=f,pause(){},load(){},play:()=>Promise.resolve()};
 for(const k of ['[data-tcv-rail]','.tcv-sticky','[data-tcv-modes]','[data-tcv-play]','[data-tcv-scroll]','[data-tcv-hint]','[data-tcv-progress]','[data-tcv-time]','[data-tcv-progress-wrap]'])query[k]=simple();
 query['[data-tcv-primary]']=video;query['.tcv-sticky'].getBoundingClientRect=()=>({top:88});
 const section={dataset:{tcvConfig:JSON.stringify({labels:{nativeHelp:'Native',scrollHelp:'Scroll'}})},style:{setProperty(){}},isConnected:true,classList:{toggle(){}},querySelector:k=>query[k],querySelectorAll:()=>[]};
 const desktop={matches:true,addEventListener:(e,f)=>desktop.change=f},reduce={matches:false,addEventListener:(e,f)=>reduce.change=f};
 const connection={saveData:false,addEventListener:(e,f)=>connection.change=f};
 const win={document:{querySelectorAll:()=>[section]},matchMedia:q=>q.includes('min-width')?desktop:reduce,navigator:{connection},innerHeight:900,performance:{now:()=>100},addEventListener:(e,f)=>windowEvents[e]=f,requestAnimationFrame:()=>1,clearTimeout(){},setTimeout:()=>1,setInterval:()=>1,clearInterval(){},scrollBy(){},IntersectionObserver:class{observe(){}disconnect(){}}};
 runtime.start(win);
 return {win,desktop,reduce,connection,video,query,metadata(){video.duration=50;video.readyState=1;events.loadedmetadata();},resize(){windowEvents.resize();},mode:()=>section.dataset.tcvMode||'native'};
}
test('eligible desktop metadata still enables default scroll',()=>{const h=runtimeHarness();h.metadata();assert.equal(h.mode(),'scroll');assert.equal(h.video.controls,false);});
test('metadata after desktop to mobile resize stays native',()=>{const h=runtimeHarness();h.desktop.matches=false;h.desktop.change();h.metadata();assert.equal(h.mode(),'native');assert.equal(h.video.controls,true);});
test('metadata reevaluates height even before resize event',()=>{const h=runtimeHarness();h.win.innerHeight=500;h.metadata();assert.equal(h.mode(),'native');});
test('metadata reevaluates reduced motion and save data',()=>{for(const field of ['reduce','connection']){const h=runtimeHarness();if(field==='reduce')h.reduce.matches=true;else h.connection.saveData=true;h.metadata();assert.equal(h.mode(),'native');}});
test('automatic scroll falls back on short viewport or save-data change',()=>{for(const reason of ['height','connection']){const h=runtimeHarness();h.metadata();if(reason==='height'){h.win.innerHeight=500;h.resize();}else{h.connection.saveData=true;h.connection.change();}assert.equal(h.mode(),'native');assert.equal(h.video.controls,true);}});
test('explicit scroll selection survives mobile and short viewport changes',()=>{const h=runtimeHarness();h.metadata();h.query['[data-tcv-scroll]'].click();h.desktop.matches=false;h.win.innerHeight=500;h.resize();assert.equal(h.mode(),'scroll');});
test('explicit native selection is not replaced by metadata or resize',()=>{const h=runtimeHarness();h.query['[data-tcv-play]'].click();h.metadata();h.resize();assert.equal(h.mode(),'native');});
test('reduced motion supersedes explicit scroll selection',()=>{const h=runtimeHarness();h.metadata();h.query['[data-tcv-scroll]'].click();h.reduce.matches=true;h.reduce.change();assert.equal(h.mode(),'native');});

// Exercise the same injector against all current localized pages without writing production HTML.
const slugs=Object.keys(JSON.parse(fs.readFileSync(path.join(root,'src/data/treatment-page-editorial.json'),'utf8')).profiles);
let pages=0;
test('all 165 actual detail pages preserve journey and existing canvas/SEO',()=>{
 for(const [folder,locale] of [['','ko'],['en','en'],['jp','ja']])for(const slug of slugs){
  const before=fs.readFileSync(path.join(root,folder,'treatments',slug+'.html'),'utf8');const a=parse(before);const m={version:1,profiles:{[slug]:profile}};const after=inject(before,slug,locale,m,library,'test');const b=parse(after);
  assert.equal(b.querySelectorAll('[data-tcv]').length,1);assert.equal(a.querySelector('#tg-journey').toString(),b.querySelector('#tg-journey').toString());
  assert.deepEqual(a.querySelectorAll('canvas').map(n=>n.toString()),b.querySelectorAll('canvas').map(n=>n.toString()));
  for(const selector of ['title','link[rel="canonical"]','h1','meta[name="robots"]'])assert.equal(a.querySelector(selector)?.toString(),b.querySelector(selector)?.toString());
  assert.deepEqual(a.querySelectorAll('script[type="application/ld+json"]').map(n=>n.toString()),b.querySelectorAll('script[type="application/ld+json"]').map(n=>n.toString()));
  assert.equal(inject(after,slug,locale,m,library,'test'),after);pages++;
 }
 assert.equal(pages,165);
});
console.log(JSON.stringify({passed:count,actualPagesChecked:pages,clinicalApproval:false,browserRuntimeTested:false,productionHTMLWritten:false}));
