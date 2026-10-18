'use strict';
// Structural fixtures only: this does not approve or generate any clinical media.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { singleShotErrors, validateChunkBytes, visualConfig, art, runtimeFileNames } = require('./treatment-scroll.cjs');
const site = path.resolve(__dirname, '..');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const tests = [];
function test(name, fn) { fn(); tests.push({name, passed:true}); }
function fixture(duration=8) {
 const frameCount=duration*24,chunkCount=frameCount/8;
 const base='/static/treatment-motion/new-continuous-chunks/root-canal/abcdef012345/';
 const media=kind=>({path:site+'/.wrangler/structural-fixture/'+kind,sha256:hash('fixture '+kind),sourceJob:'fixture-job-'+kind,provider:'test-only',model:'fixture-only',generatedAt:'2026-10-18T00:00:00Z'});
 const image=media('image'),video=media('video');
 const sequence=size=>({format:'webp-chunks-v1',pattern:base+size+'/chunk_{index}.bdseq',count:frameCount,width:size==='desktop'?1280:800,height:size==='desktop'?720:450,start:1,pad:4,framesPerChunk:8,chunkCount});
 const packed=size=>({format:'webp-chunks-v1',count:frameCount,framesPerChunk:8,chunkCount,chunks:Array.from({length:chunkCount},(_,i)=>({index:i,firstFrame:i*8,count:8,bytes:1024,sha256:hash(size+' chunk '+i),frameSHA256s:Array.from({length:8},(_,j)=>hash(size+' frame '+(i*8+j)))}))});
 return {status:'single-shot-reviewed',kind:'single-shot-sequence',poster:base+'poster.jpg',desktop:sequence('desktop'),mobile:sequence('mobile'),anchors:[0,1/3,2/3,1],cameraPan:false,
  source:{image,video,mediaMetadata:{image:{width:3840,height:2160,bytes:1234,sha256:image.sha256},video:{width:3840,height:2160,bytes:1234,sha256:video.sha256,duration:duration+0.041667,fps:24}},durationSeconds:duration,fps:24,frameCount,chapters:[0,duration/3,2*duration/3,duration].map((atSeconds,i)=>({atSeconds,label:'fixture '+i})),declaredSingleShot:{continuous:true,cutCount:0,durationSeconds:duration},clinicalApproval:false,userQualityApproval:false},
  review:{integrityAllFramesChecked:true,runtimePlaybackExercised:true,forwardEndpointObserved:true,reverseEndpointObserved:true,playbackReviewScope:'real runtime forward/reverse exercised; sampled start/mid/end visuals; not every-frame review',continuousPlaybackViewed:false,allFramesVisuallyReviewed:false,visualSampleCount:16,anatomicalReview:true,anatomicalReviewScope:'sampled visual geometry/action screening, not clinical approval',record:site+'/.wrangler/structural-fixture/review.json',recordSHA256:hash('fixture review')},technicalOutput:{poster:{width:1200,height:630,bytes:1234,sha256:hash('poster')},packaging:{format:'webp-chunks-v1',reencoded:false,desktop:packed('desktop'),mobile:packed('mobile')}}};
}
function rejects(name, change, message) {
 test(name,()=>{ const set=fixture();change(set);const errors=singleShotErrors(set);assert(errors.length>0);if(message)assert(errors.some(e=>e.includes(message)),errors.join('; '));assert.throws(()=>visualConfig(set)); });
}
test('valid structural fixture accepts rounded 193-frame source duration',()=>assert.deepEqual(singleShotErrors(fixture()),[]));
test('six-second source remains 144 frames in 18 chunks',()=>{const s=fixture(6);assert.deepEqual(singleShotErrors(s),[]);const c=visualConfig(s);assert.equal(c.desktop.count,144);assert.equal(c.mobile.chunkCount,18);assert.deepEqual(s.source.chapters.map(x=>x.atSeconds),[0,2,4,6]);});
test('new renderer forwards chunk format without exposing source receipts',()=>{const c=visualConfig(fixture());assert.equal(c.desktop.format,'webp-chunks-v1');assert.equal(c.posterWidth,1200);assert.equal(c.posterHeight,630);assert.equal(c.source,undefined);assert.equal(c.technicalOutput,undefined);assert.match(art({config:c},'Fixture'),/width="1200" height="630"/);});
test('legacy configured output is preserved',()=>{const manifest=JSON.parse(fs.readFileSync(path.join(site,'src/data/treatment-motion-assets.json'),'utf8'));for(const set of Object.values(manifest.sets).filter(s=>s.kind!=='single-shot-sequence')){const {poster,desktop,mobile,anchors,kind,cameraPan,motion,component,processStages}=set;assert.deepEqual(visualConfig(set),{poster,desktop,mobile,anchors,kind,cameraPan,motion,component,processStages,background:'#f7f7f0',cacheSize:10,mobileBreakpoint:760});}});
rejects('unreviewed preparation cannot become production',s=>s.status='prepared-awaiting-visual-review','prepared');
rejects('legacy review label cannot promote a new single shot',s=>s.status='process-sample-reviewed','prepared');
rejects('camera pan cannot stand in for treatment movement',s=>s.cameraPan=true,'camera-only');
rejects('chapter clips cannot enter one-shot playback',s=>s.processStages=[{start:0,end:47}],'chapter');
rejects('synthetic cutout motion rejected',s=>s.component={type:'rigid-lift'},'cutout');
rejects('camera path rejected even if source is a video',s=>s.motion={scales:[1,1,1,1]},'camera-only');
rejects('nonlinear anchors rejected',s=>s.anchors[1]=.2,'global');
rejects('wrong frame count rejected',s=>s.desktop.count=191,'192');
rejects('wrong chunk layout rejected',s=>s.mobile.framesPerChunk=16,'eight-frame');
rejects('cross-treatment size paths rejected',s=>s.mobile.pattern=s.mobile.pattern.replace('root-canal','implant'),'revision');
rejects('malformed pattern object rejected without throwing',s=>s.mobile.pattern={match:true},'pattern');
rejects('non-content-addressed paths rejected',s=>s.desktop.pattern='/static/current/chunk_{index}.bdseq','content-addressed');
rejects('missing source job rejected',s=>delete s.source.video.sourceJob,'generation');
rejects('missing source receipt identity rejected',s=>s.source.mediaMetadata.image.sha256=hash('wrong'),'receipt');
rejects('non-numeric 4K dimensions rejected',s=>s.source.mediaMetadata.image.width='3840','receipt');
rejects('non-finite source duration rejected',s=>s.source.mediaMetadata.video.duration=NaN,'eight-second');
rejects('over-length video rejected',s=>s.source.mediaMetadata.video.duration=8.1,'eight-second');
rejects('low source fps rejected',s=>s.source.mediaMetadata.video.fps=12,'24fps');
rejects('multi-shot declaration rejected',s=>s.source.declaredSingleShot.cutCount=1,'single-shot');
rejects('non-numeric chapter position rejected',s=>s.source.chapters[1].atSeconds='not a number','Chapter');
rejects('unspecified clinical status rejected',s=>delete s.source.clinicalApproval,'separate');
rejects('integrity evidence is separate from visual samples',s=>s.review.integrityAllFramesChecked=false,'integrity');
rejects('15 visual samples cannot pass 16-sample requirement',s=>s.review.visualSampleCount=15,'16');
rejects('runtime playback evidence cannot be omitted',s=>s.review.runtimePlaybackExercised=false,'playback');
rejects('forward endpoint evidence cannot be omitted',s=>s.review.forwardEndpointObserved=false,'endpoint');
rejects('reverse endpoint evidence cannot be omitted',s=>s.review.reverseEndpointObserved=false,'endpoint');
rejects('sampled runtime scope cannot claim every-frame viewing',s=>s.review.playbackReviewScope='all frames watched','sampled');
rejects('continuous viewing must not be inferred from endpoint sampling',s=>s.review.continuousPlaybackViewed=true,'sampled');
rejects('all-frame visual claim cannot replace sampled inspection',s=>s.review.allFramesVisuallyReviewed=true,'every-frame');
rejects('anatomical screening scope cannot claim clinical approval',s=>s.review.anatomicalReviewScope='clinically approved','clinical');
rejects('review evidence exact hash is required',s=>delete s.review.recordSHA256,'SHA256');
rejects('review record cannot point to internal storage',s=>s.review.record='/Users/msj/review.json','SSD');
rejects('oversized poster rejected',s=>s.technicalOutput.poster.bytes=300001,'Poster');
rejects('reencoded chunks rejected',s=>s.technicalOutput.packaging.reencoded=true,'Lossless');
rejects('missing chunk receipt rejected',s=>s.technicalOutput.packaging.desktop.chunks.pop(),'incomplete');
rejects('unbounded chunk size rejected',s=>s.technicalOutput.packaging.mobile.chunks[0].bytes=2097153,'invalid');
rejects('all-identical encoded frames rejected',s=>{for(const c of s.technicalOutput.packaging.desktop.chunks)c.frameSHA256s.fill(hash('same'));},'distinct');
test('six-second frames cannot be padded to eight seconds',()=>{const s=fixture(6);s.desktop.count=192;s.desktop.chunkCount=24;assert(singleShotErrors(s).some(e=>e.includes('actual 6/8')));assert.throws(()=>visualConfig(s));});
test('six-second source cannot use eight-second chapter positions',()=>{const s=fixture(6);s.source.chapters=fixture(8).source.chapters;assert(singleShotErrors(s).some(e=>e.includes('Chapter')));});
test('six-second video cannot use eight-second duration metadata',()=>{const s=fixture(6);s.source.mediaMetadata.video.duration=8;assert(singleShotErrors(s).some(e=>e.includes('metadata')));});
test('six-second over-length source is rejected',()=>{const s=fixture(6);s.source.mediaMetadata.video.duration=6.1;assert(singleShotErrors(s).some(e=>e.includes('metadata')));});
test('six-second source cannot declare eight-second single shot',()=>{const s=fixture(6);s.source.declaredSingleShot.durationSeconds=8;assert(singleShotErrors(s).some(e=>e.includes('declaration')));});
test('six-second source needs actual 18-chunk receipts',()=>{const s=fixture(6);s.technicalOutput.packaging.mobile=fixture(8).technicalOutput.packaging.mobile;assert(singleShotErrors(s).some(e=>e.includes('incomplete')));});
test('six-second quarter motion cannot be mostly duplicate frames',()=>{const s=fixture(6);const cs=s.technicalOutput.packaging.desktop.chunks;for(let f=0;f<11;f++)cs[Math.floor(f/8)].frameSHA256s[f%8]=hash('same');assert(singleShotErrors(s).some(e=>e.includes('distinct')));});
test('unapproved seven-second duration is rejected even with consistent counts',()=>{const s=fixture(8);s.source.durationSeconds=7;assert(singleShotErrors(s).some(e=>e.includes('timeline')));});
test('thirteen identical consecutive frames cannot pass aggregate uniqueness',()=>{const s=fixture(8),cs=s.technicalOutput.packaging.desktop.chunks;for(let f=0;f<13;f++)cs[Math.floor(f/8)].frameSHA256s[f%8]=hash('held');assert(singleShotErrors(s).some(e=>e.includes('still hold')));});
// An actual old WebP is used only to verify the binary container, never as a new treatment result.
const frames=Array.from({length:8},(_,i)=>fs.readFileSync(path.join(site,'implant/frames','frame_'+String(i+1).padStart(4,'0')+'.webp')));
function chunkFixture() {
 const bytes=Buffer.alloc(80+frames.reduce((n,b)=>n+b.length,0));bytes.write('BDSEQ01\n');bytes.writeUInt32LE(0,8);bytes.writeUInt16LE(8,12);
 let offset=80;frames.forEach((b,i)=>{bytes.writeUInt32LE(offset,16+i*8);bytes.writeUInt32LE(b.length,20+i*8);b.copy(bytes,offset);offset+=b.length;});
 return {bytes,receipt:{firstFrame:0,count:8,bytes:bytes.length,sha256:hash(bytes),frameSHA256s:frames.map(hash)}};
}
function badChunk(name, mutate, expected) {test(name,()=>{const x=chunkFixture();mutate(x);assert.throws(()=>validateChunkBytes(x.bytes,x.receipt),expected);});}
test('eight actual WebP payloads retain exact SHA and order',()=>{const x=chunkFixture(),result=validateChunkBytes(x.bytes,x.receipt);assert.deepEqual(result.map(r=>r.sha256),frames.map(hash));assert.deepEqual(result.map(r=>r.index),[0,1,2,3,4,5,6,7]);});
badChunk('wrong chunk magic rejected',x=>x.bytes[0]=0,/magic/);
badChunk('wrong global range rejected',x=>x.bytes.writeUInt32LE(8,8),/range/);
badChunk('chunk byte modification rejected',x=>x.bytes[x.bytes.length-1]^=1,/receipt/);
badChunk('wrong individual frame hash rejected',x=>x.receipt.frameSHA256s[2]=hash('wrong'),/frame bytes/);
badChunk('overlapping payload offsets rejected',x=>{x.bytes.writeUInt32LE(80,24);x.receipt.sha256=hash(x.bytes);},/bounds/);
badChunk('trailing data rejected even with updated chunk hash',x=>{x.bytes=Buffer.concat([x.bytes,Buffer.from([0])]);x.receipt.bytes=x.bytes.length;x.receipt.sha256=hash(x.bytes);},/trailing/);
badChunk('non-WebP payload rejected',x=>{x.bytes[80]=0;x.receipt.sha256=hash(x.bytes);},/WebP/);
test('runtime list preserves base ordering and only hashed optional helpers',()=>{const names=runtimeFileNames();assert.deepEqual(names.slice(0,4),['treatment-scroll.js','treatment-scroll.css','treatment-scroll-sequence.js','treatment-scroll-compositor.js']);assert(names.slice(4).every(n=>/^treatment-frame-chunks\.[a-f0-9]{12}\.js$/.test(n)));});
console.log(JSON.stringify({scope:'single-shot-structural-regression',qualityAssessed:false,clinicalApproval:false,sourceFixturesAreNewMedia:false,passed:true,count:tests.length,tests},null,2));
