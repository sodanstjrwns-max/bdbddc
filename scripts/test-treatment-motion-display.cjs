'use strict';
// Structural/DOM regression tests. Synthetic media fixture is not deployable or clinically reviewed.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {parse}=require('node-html-parser');
const site=path.resolve(__dirname,'..');
const {policyErrors,readMotionDisplayPolicy,motionDisplayDecision,displayDOMErrors}=require('./treatment-motion-display.cjs');
const {clinicalProcessErrors}=require('./treatment-clinical-process.cjs');
const {readProcessCopy}=require('./treatment-process-journey.cjs');
const {render,inject,syncPage}=require('./treatment-scroll.cjs');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex'),clone=x=>JSON.parse(JSON.stringify(x)),tests=[];
function test(name,fn){fn();tests.push({name,passed:true});}
const manifest=JSON.parse(fs.readFileSync(path.join(site,'src/data/treatment-motion-assets.json')));
const profiles=JSON.parse(fs.readFileSync(path.join(site,'src/data/treatment-scroll.json'))).profiles;
const copy=readProcessCopy(site),policy=readMotionDisplayPolicy(site,Object.keys(profiles));
function timeline(lengths=[144,144,144]){
 let cursor=0;const transitions=lengths.map((frameCount,i)=>{const value={from:'state-'+(i+1),to:'state-'+(i+2),startFrame:cursor,endFrameExclusive:cursor+frameCount,frameCount,durationSeconds:frameCount/24};cursor+=frameCount;return value;});
 return {version:1,fps:24,frameCount:cursor,playbackRate:1,interpolation:false,padding:false,loop:false,syntheticReverse:false,clinicalNarrativeAnchors:[Math.round(cursor*.12),Math.round(cursor*.36),Math.round(cursor*.61),Math.round(cursor*.85)].map((atFrame,i)=>({id:'step-'+(i+1),atFrame,atSeconds:atFrame/24,startFrame:Math.max(0,atFrame-10),endFrameExclusive:Math.min(cursor,atFrame+11)})),states:[0,...transitions.map(t=>t.endFrameExclusive-1)].map((atFrame,i)=>({id:'state-'+(i+1),atFrame,atSeconds:atFrame/24})),transitions};
}
function fixture(lengths){
 const t=timeline(lengths),count=t.frameCount;
 const asset=(kind,i)=>({id:'state-'+(i+1),path:site+'/.wrangler/fixture-not-real/'+kind+i,sha256:hash(kind+i),sourceJob:kind+'-'+i,provider:'fixture-not-real',model:'fixture-not-real',generatedAt:'2026-10-19T00:00:00Z',generation:{resolution:'4k',quality:'max',receipt:site+'/.wrangler/fixture-not-real/receipt-'+kind+i,receiptSHA256:hash('receipt'+kind+i)},metadata:{width:3840,height:2160,bytes:1000,sha256:hash(kind+i)}});
 const images=Array.from({length:4},(_,i)=>asset('image',i));
 const videos=Array.from({length:3},(_,i)=>{const a=asset('video',i),c=t.transitions[i];return {...a,from:c.from,to:c.to,startImageSHA256:images[i].sha256,endImageSHA256:images[i+1].sha256,metadata:{...a.metadata,fps:24,frameCount:c.frameCount+1,duration:c.durationSeconds+1/24},selection:{sourceFrameIndices:Array.from({length:c.frameCount},(_,f)=>f===c.frameCount-1?f+1:f),fps:24,playbackRate:1,interpolation:false,padding:false,loop:false,syntheticReverse:false,record:site+'/.wrangler/fixture-not-real/selection-'+i,recordSHA256:hash('selection'+i)}};});
 const config=size=>({format:'webp-chunks-v1',pattern:'/static/treatment-motion/clinical-process/implant/abcdef012345/'+size+'/chunk_{index}.bdseq',count,width:size==='desktop'?1280:800,height:size==='desktop'?720:450,start:1,pad:4,framesPerChunk:16,chunkCount:count/16});
 const pack=size=>({chunks:Array.from({length:count/16},(_,i)=>({firstFrame:i*16,count:16,bytes:1000,sha256:hash(size+'chunk'+i),frameSHA256s:Array.from({length:16},(_,j)=>hash(size+'frame'+(i*16+j)))}))});
 return {kind:'clinical-process-sequence',status:'clinical-process-reviewed',cameraPan:false,timeline:t,timelineSHA256:hash(JSON.stringify(t)),anchors:t.states.map(c=>c.atFrame/(count-1)),desktop:config('desktop'),mobile:config('mobile'),poster:'/images/treatment-process/implant/representative.jpg',representative:{stateId:'state-1',url:'/images/treatment-process/implant/representative.jpg',sourceImageSHA256:images[0].sha256,sourceJob:images[0].sourceJob},source:{mode:'four-states-three-transitions',keyframes:images,transitions:videos},processCopySHA256:hash('fixture row'),technicalOutput:{poster:{width:1200,height:630,bytes:1234,sha256:hash('fixture poster'),derivedFrom:'first-delivered-frame',sourceFrameSHA256:hash('desktopframe0')},packaging:{format:'webp-chunks-v1',reencoded:false,desktop:pack('desktop'),mobile:pack('mobile')}},review:{integrityAllFramesChecked:true,anatomicalReview:true,runtimePlaybackExercised:true,forwardEndpointObserved:true,reverseEndpointObserved:true,chapterActionMatched:true,boundaryContinuityViewed:true,narrativeAnchorsReviewed:true,boundaries:t.transitions.slice(0,2).map((c,i)=>({leftFrame:c.endFrameExclusive-1,rightFrame:c.endFrameExclusive,sharedKeyframeSHA256:images[i+1].sha256,visualContinuityPassed:true,...Object.fromEntries(['desktop','mobile'].map(size=>[size,{leftFrameSHA256:hash(size+'frame'+(c.endFrameExclusive-1)),rightFrameSHA256:hash(size+'frame'+c.endFrameExclusive)}]))})),visualSampleCount:48,continuousPlaybackViewed:false,allFramesVisuallyReviewed:false,clinicalApproval:false,userQualityApproval:false,playbackReviewScope:'real runtime forward/reverse exercised; sampled start/mid/end visuals; not every-frame review',anatomicalReviewScope:'sampled visual geometry/action screening, not clinical approval',record:site+'/.wrangler/fixture-not-real/review',recordSHA256:hash('fixture review')}};
}

test('display policy requires exact 55 unique detail slugs',()=>{
 assert.deepEqual(policyErrors(policy,Object.keys(profiles)),[]);
 for(const bad of [{...policy,detailMode:'all'},{...policy,version:2},{...policy,detailSlugs:policy.detailSlugs.slice(1)},{...policy,detailSlugs:[...policy.detailSlugs.slice(1),policy.detailSlugs[1]]},{...policy,detailSlugs:[...policy.detailSlugs.slice(1),'unknown']}]){
  assert(policyErrors(bad,Object.keys(profiles)).length);
  assert.throws(()=>motionDisplayDecision('root-canal',manifest,copy,bad));
 }
});
test('all 55 installed legacy visual records remain archived without display',()=>{
 for(const slug of Object.keys(profiles)) { const decision=motionDisplayDecision(slug,manifest,copy,policy);assert.equal(decision.mode,'body-only');assert.equal(decision.renderMotion,false);assert.equal(render(profiles[slug],'ko',slug),''); }
});
test('missing clinical copy cannot become a body-only success',()=>{
 assert.throws(()=>motionDisplayDecision('root-canal',manifest,null,policy));
 const bad=clone(copy);bad.rows=bad.rows.filter(row=>row.slug!=='root-canal');assert.throws(()=>motionDisplayDecision('root-canal',manifest,bad,policy));
});
test('missing locale, repeated steps, or unresolved source rejects even with motion suppressed',()=>{
 for(const change of [row=>delete row.en,row=>row.ja.steps[1]=clone(row.ja.steps[0]),row=>row.sourceIds=['missing']]) {
  const bad=clone(copy);change(bad.rows.find(row=>row.slug==='root-canal'));assert.throws(()=>motionDisplayDecision('root-canal',manifest,bad,policy));
 }
});
test('unknown treatment and missing media mapping fail closed',()=>{
 assert.throws(()=>motionDisplayDecision('unknown',manifest,copy,policy));
 const bad=clone(manifest);delete bad.sets[bad.profiles['root-canal']];assert.throws(()=>motionDisplayDecision('root-canal',bad,copy,policy));
});
test('status relabelling cannot promote an old single shot to a process',()=>{
 const bad=clone(manifest);bad.sets[bad.profiles['root-canal']].status='clinical-process-reviewed';assert.throws(()=>motionDisplayDecision('root-canal',bad,copy,policy));
 bad.sets[bad.profiles['root-canal']].kind='clinical-process-sequence';assert.throws(()=>motionDisplayDecision('root-canal',bad,copy,policy));
});
function fixtureManifest(){const set=fixture();set.processCopySHA256=hash(JSON.stringify(copy.rows.find(row=>row.slug==='implant')));const m=clone(manifest);m.sets[m.profiles.implant]=set;return m;}
test('structurally complete matched clinical fixture selects the clinical branch',()=>{
 const m=fixtureManifest();assert.deepEqual(clinicalProcessErrors(m.sets[m.profiles.implant]),[]);assert.equal(motionDisplayDecision('implant',m,copy,policy).mode,'clinical-process');
});
test('new process requires exact copy, four states, three transitions and recorded action review',()=>{
 for(const change of [set=>set.processCopySHA256=hash('wrong row'),set=>set.source.keyframes.pop(),set=>set.source.transitions.pop(),set=>set.review.chapterActionMatched=false,set=>set.status='pending',set=>set.timeline.padding=true]){
  const m=fixtureManifest();change(m.sets[m.profiles.implant]);assert.throws(()=>motionDisplayDecision('implant',m,copy,policy));
 }
});
test('existing hub remains enabled independently of detail policy',()=>assert.equal(motionDisplayDecision('index',manifest,copy,policy).mode,'existing-hub'));
let checkedPages=0;
function preserved(doc){
 doc=parse(doc.toString());
 const main=doc.querySelector('main').clone();main.querySelectorAll('.bd-scroll,[data-treatment-motion-alias]').forEach(node=>node.remove());
 return {title:doc.querySelector('title')?.text,canonical:doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),og:doc.querySelectorAll('meta[property^="og:"]').map(node=>node.toString()),mainText:main.text.replace(/\s+/gu,' ').trim(),mainLinks:main.querySelectorAll('a[href]').map(a=>a.getAttribute('href')),images:main.querySelectorAll('img').map(n=>n.toString()),canvas:main.querySelectorAll('canvas').map(n=>n.toString()),originalLoader:doc.querySelectorAll('script').filter(n=>n.text.includes('FRAME_COUNT')).map(n=>n.toString()),schema:doc.querySelectorAll('script[type="application/ld+json"]').map(n=>JSON.parse(n.text))};
}
test('all 165 details retain exact body/SEO/schema/original canvas and one valid deep-link alias',()=>{
 for(const [folder,lang] of [['','ko'],['en','en'],['jp','ja']])for(const slug of Object.keys(profiles)){
  const html=fs.readFileSync(path.join(site,folder,'treatments',slug+'.html'),'utf8'),out=inject(html,profiles[slug],lang,slug,'test-version'),doc=parse(out,{comment:true}),decision=motionDisplayDecision(slug,manifest,copy,policy);
  assert.deepEqual(displayDOMErrors(doc,decision),[],folder+'/'+slug);
  assert.deepEqual(preserved(doc),preserved(parse(html)),folder+'/'+slug);
  assert.equal(doc.querySelectorAll('#tg-journey ol.tg-steps > li').length,4);
  assert.equal(out,inject(out,profiles[slug],lang,slug,'test-version'),folder+'/'+slug+' idempotence');
  const ids=doc.querySelectorAll('[id]').map(n=>n.id);assert.equal(ids.length,new Set(ids).size);
  checkedPages++;
 }
 assert.equal(checkedPages,165);
});
const slug='root-canal',good=inject(fs.readFileSync(path.join(site,'treatments',slug+'.html'),'utf8'),profiles[slug],'ko',slug,'test-version'),decision=motionDisplayDecision(slug,manifest,copy,policy);
test('read-only DOM audit detects a reinserted old block and loader',()=>{
 for(const fragment of ['<section class="bd-scroll"></section>','<div class="bd-scroll-art" data-sequence="{}"></div>','<script src="/static/treatment-scroll.js?v=old"></script>','<link rel="stylesheet" href="/static/treatment-scroll.css?v=old">','<!-- bd-treatment-scroll:start -->']){
  const bad=good.replace('</main>',fragment+'</main>');assert(displayDOMErrors(parse(bad,{comment:true}),decision).length,fragment);
 }
});
test('generation strips a reinserted old block and dedicated loaders',()=>{
 const bad=good.replace('</main>','<section class="bd-scroll"><p>old single motion</p></section></main>').replace('</body>','<script src="/static/treatment-scroll.js?v=old"></script></body>').replace('</head>','<link href="/static/treatment-scroll.css?v=old" rel="stylesheet"></head>');
 const out=inject(bad,profiles[slug],'ko',slug,'test-version');assert.deepEqual(displayDOMErrors(parse(out,{comment:true}),decision),[]);assert(!out.includes('old single motion'));
});
test('missing or misplaced or duplicate deep-link aliases fail the DOM audit',()=>{
 const without=good.replace(/<span id="treatment-in-motion"[^>]*><\/span>/,'');
 assert(displayDOMErrors(parse(without,{comment:true}),decision).length);
 assert(displayDOMErrors(parse(without.replace('</main>','<span id="treatment-in-motion" data-treatment-motion-alias="clinical-process"></span></main>'),{comment:true}),decision).length);
 assert(displayDOMErrors(parse(good.replace('</main>','<span id="treatment-in-motion"></span></main>'),{comment:true}),decision).length);
});
test('enabled motion must not retain the obsolete journey alias',()=>{
 assert(displayDOMErrors(parse('<main><section class="bd-scroll"></section><span data-treatment-motion-alias="clinical-process"></span></main>'),{renderMotion:true}).length);
 assert.deepEqual(displayDOMErrors(parse('<main><section class="bd-scroll"></section></main>'),{renderMotion:true}),[]);
});
test('all three hubs remain unchanged apart from current runtime cache version',()=>{
 for(const [folder,lang] of [['','ko'],['en','en'],['jp','ja']]) {
  const html=fs.readFileSync(path.join(site,folder,'treatments/index.html'),'utf8'),out=syncPage(html,'index',lang);
  const normalize=s=>s.replace(/(treatment-scroll\.(?:js|css)\?v=)[a-zA-Z0-9_-]+/g,'$1VERSION');
  assert.equal(normalize(out),normalize(html),lang+' hub');
 }
});
console.log(JSON.stringify({passed:tests.length,checkedDetailPages:checkedPages,scope:'policy and delivery integrity; not visual or clinical approval',fixtureOnly:true,tests},null,2));
