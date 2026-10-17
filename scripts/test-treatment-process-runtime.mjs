import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const ROOT=fileURLToPath(new URL('..',import.meta.url)).replace(/\/$/,'');
const runtimePath=ROOT+'/public/static/treatment-scroll-sequence.js';
const source=fs.readFileSync(runtimePath,'utf8');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const sets=JSON.parse(fs.readFileSync(ROOT+'/src/data/treatment-motion-assets.json','utf8')).sets;
const processConfig=sets['fixed-fullarch'];
assert(processConfig.processStages,'Actual process asset configuration must exist');
const clone=x=>JSON.parse(JSON.stringify(x));
const micro=async()=>{for(let i=0;i<18;i++)await Promise.resolve();};
function events(){const listeners=new Map();return {listeners,addEventListener(k,f){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(f);},removeEventListener(k,f){listeners.get(k)?.delete(f);},emit(k){for(const f of listeners.get(k)||[])f();}};}
function harness(config=processConfig,{mobile=false,reduced=false,holdDecode=false,renderFrame,observed=false}={}){
 const requests=[],images=[],draws=[],fills=[],errors=[],ready=[],canvases=[],observers=[];const decodeControl={hold:holdDecode};const size={width:1200,height:675};const rafs=new Map(),timers=new Map();let clock=0,nextId=1;
 const reducedQ={...events(),matches:reduced};const mobileQ={...events(),matches:mobile};
 const win={...events(),devicePixelRatio:1,matchMedia:q=>q.includes('prefers-reduced')?reducedQ:mobileQ};
 const classes=new Set();const container={children:[],classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},getBoundingClientRect:()=>({...size}),appendChild(c){this.children.push(c);c.parent=this;}};
 const document={...events(),hidden:false,createElement(tag){
  assert.equal(tag,'canvas');let width=0,height=0;
  const c={id:canvases.length,pixels:[],dataset:{},style:{},setAttribute(){},remove(){c.removed=true;container.children=container.children.filter(x=>x!==c);}};
  Object.defineProperties(c,{width:{get:()=>width,set:value=>{width=value;c.pixels=[];}},height:{get:()=>height,set:value=>{height=value;c.pixels=[];}}});
  const ctx={globalAlpha:1,fillRect(...args){fills.push({canvas:c.id,args});c.pixels=[];},drawImage(image,...args){
   assert(!image.closed,'Closed bitmap was painted');
   const pixels=image.pixels||[{frame:image.fileFrame,weight:1}];
   const alpha=this.globalAlpha;
   c.pixels=[...c.pixels.map(p=>({...p,weight:p.weight*(1-alpha)})),...pixels.map(p=>({...p,weight:p.weight*alpha}))].filter(p=>p.weight>0.000001);
   if(image.fileFrame)draws.push({canvas:c.id,fileFrame:image.fileFrame,url:image.url,args,alpha});
  }};
  c.getContext=()=>ctx;canvases.push(c);return c;
 }};
 const decodePending=[];
 const sandbox={window:win,document,DOMException,AbortController,performance:{now:()=>clock},requestAnimationFrame:fn=>{const id=nextId++;rafs.set(id,fn);return id;},cancelAnimationFrame:id=>rafs.delete(id),setTimeout:fn=>{const id=nextId++;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),fetch(url,options){return new Promise((resolve,reject)=>requests.push({url,options,resolve,reject,settled:false}));},createImageBitmap(blob,opts){const image={width:opts.resizeWidth,height:opts.resizeHeight,url:blob.url,fileFrame:Number(blob.url.match(/frame_(\d+)\.webp/)[1]),closed:false,close(){this.closed=true;}};images.push(image);if(decodeControl.hold)return new Promise(resolve=>decodePending.push({image,resolve,settled:false}));return Promise.resolve(image);}};
 if(observed){const IO=class{constructor(callback,options){this.callback=callback;this.options=options;this.disconnected=false;observers.push(this);}observe(target){this.target=target;}disconnect(){this.disconnected=true;}emit(isIntersecting){this.callback([{target:this.target,isIntersecting}]);}};win.IntersectionObserver=IO;sandbox.IntersectionObserver=IO;}
 vm.createContext(sandbox);new vm.Script(source.replace('export function createSequence','function createSequence')+'\nglobalThis.createSequence=createSequence;',{filename:runtimePath}).runInContext(sandbox);
 const sequence=sandbox.createSequence({container,config:clone(config),renderFrame,onReady:x=>ready.push(x),onError:(e,x)=>errors.push({message:e.message,...x})});
 const canvas=container.children[0];
 const settle=async(req,status=200)=>{assert(req&&!req.settled);req.settled=true;req.resolve({ok:status===200,status,blob:async()=>({size:1000,type:'image/webp',url:req.url})});await micro();};
 const pending=()=>requests.filter(r=>!r.settled);
 const drain=async(status=200)=>{for(let i=0;i<120;i++){const batch=pending();if(!batch.length){await micro();if(!pending().length)return;}for(const r of batch)await settle(r,status);}throw Error('Fetch drain did not quiesce');};
 const tick=async(ms)=>{clock+=ms;const callbacks=[...rafs.values()];rafs.clear();for(const f of callbacks)f(clock);await micro();};
 const finishDecode=async entry=>{assert(entry&&!entry.settled);entry.settled=true;entry.resolve(entry.image);await micro();};
 const setReduced=async value=>{reducedQ.matches=value;reducedQ.emit('change');await micro();};
 const setMobile=async value=>{mobileQ.matches=value;mobileQ.emit('change');await micro();};
 return {sequence,canvas,container,requests,pending,settle,drain,tick,setReduced,setMobile,rafs,timers,images,draws,fills,errors,ready,reducedQ,mobileQ,document,win,decodePending,decodeControl,finishDecode,canvases,observers,size};
}
const results=[];
async function test(name,fn){const started=Date.now();try{await fn();results.push({name,passed:true,durationMs:Date.now()-started});}catch(error){results.push({name,passed:false,error:error.stack,durationMs:Date.now()-started});}}
await test('Reject overlapping/out-of-bounds process stages and synthetic motion before rendering',async()=>{
 for(const mutate of [c=>c.processStages[1].start=0,c=>c.processStages[2].end=217,c=>c.processStages[0].start=-1,c=>c.mobile.count=216,c=>c.component={},c=>c.cameraPan=true]){
  const c=clone(processConfig);mutate(c);assert.throws(()=>harness(c),/Process/);
 }
});
await test('Actual four-stage boundaries never request or display an out-of-range frame',async()=>{
 const h=harness();await h.drain();
 const cases=[[-10,1,0],[0,1,0],[1/6-0.00001,1,0],[1/6,2,1],[1/3,[37,38],1],[.5-.00001,73,1],[.5,74,2],[2/3,[109,110],2],[5/6-.00001,145,2],[5/6,146,3],[1,217,3],[20,217,3]];
 for(const [p,frame,phase] of cases){h.sequence.update(p,{instant:true});await h.drain();assert((Array.isArray(frame)?frame:[frame]).includes(Number(h.canvas.dataset.frame)),`p=${p}, actual=${h.canvas.dataset.frame}, expected=${frame}`);assert.equal(Number(h.canvas.dataset.processStage),phase,`phase p=${p}`);}
 assert(h.requests.every(r=>{const n=Number(r.url.match(/frame_(\d+)/)[1]);return n>=1&&n<=217;}));h.sequence.dispose();assert.equal(h.rafs.size,0);
});
await test('Rapid 0→1→0 preserves current-stage image when obsolete end-stage responses arrive',async()=>{
 const h=harness();await h.drain();assert.equal(h.canvas.dataset.frame,'1');h.sequence.update(1);const stale=h.pending().slice();assert(stale.some(r=>r.url.endsWith('frame_0217.webp')));h.sequence.update(0);const start=h.draws.length;
 for(const r of stale)await h.settle(r);await h.drain();assert.equal(h.canvas.dataset.frame,'1');assert.equal(h.canvas.dataset.processStage,'0');assert(h.draws.slice(start).every(d=>d.fileFrame===1),'Old chapter flashed after reverse scroll');assert.equal(h.rafs.size,0);h.sequence.dispose();
});
await test('A stalled new chapter retains real pixels and never labels them as the waiting chapter',async()=>{
 const h=harness();await h.drain();h.sequence.update(1/3);const stale=h.pending().slice();await h.tick(250);
 const heldFrame=h.canvas.dataset.frame,heldStage=h.canvas.dataset.processStage,paintCount=h.draws.length,fillCount=h.fills.length;
 h.sequence.update(1);assert.equal(h.canvas.dataset.frame,heldFrame);assert.equal(h.canvas.dataset.processStage,heldStage);assert.equal(h.canvas.dataset.targetStage,'3');assert.equal(h.canvas.dataset.waiting,'true');assert.equal(h.canvas.dataset.settled,'false');assert(h.canvas.pixels.length);
 for(const r of stale)await h.settle(r);
 assert.equal(h.canvas.dataset.frame,heldFrame);assert.equal(h.draws.length,paintCount,'Stale chapter response repainted');assert.equal(h.fills.length,fillCount,'Waiting erased the last real frame');assert(h.canvas.pixels.length);
 await h.drain();await h.tick(250);assert.equal(h.canvas.dataset.frame,'217');assert.equal(h.canvas.dataset.processStage,'3');assert.equal(h.canvas.dataset.waiting,'false');assert.equal(h.canvas.dataset.settled,'true');assert.equal(h.canvas.pixels.length,1);assert.equal(h.canvas.pixels[0].frame,217);h.sequence.dispose();
});
await test('Paused scroll remains still; deliberate step changes exactly one snapshot without RAF',async()=>{
 const h=harness();await h.drain();h.sequence.setPaused(true);h.sequence.update(1);await h.drain();assert.equal(h.canvas.dataset.frame,'1');assert.equal(h.rafs.size,0);
 h.sequence.update(.5,{instant:true});await h.drain();assert.equal(h.canvas.dataset.frame,'74');assert.equal(h.rafs.size,0);const count=h.draws.length;await h.tick(1000);assert.equal(h.draws.length,count);h.sequence.update(.8);await h.drain();assert.equal(h.canvas.dataset.frame,'74');assert.equal(h.rafs.size,0);h.sequence.dispose();
});
await test('Reduced motion aborts pending requests, releases decoded images, hides canvas, prevents RAF/fetch',async()=>{
 const h=harness();await h.drain();h.sequence.update(.2);await h.drain();h.sequence.update(.3);assert(h.rafs.size>0);await h.tick(100);const pending=h.pending().slice();const initialCount=h.requests.length;await h.setReduced(true);assert.equal(h.rafs.size,0);assert.equal(h.timers.size,0);assert(pending.every(r=>r.options.signal.aborted));assert(h.images.every(i=>i.closed));assert.equal(h.canvas.style.opacity,'0');assert(!h.container.classList.contains('has-sequence'));h.sequence.update(.9,{instant:true});await h.tick(1000);assert.equal(h.requests.length,initialCount);for(const r of pending)await h.settle(r);assert.equal(h.canvas.style.opacity,'0');h.sequence.dispose();assert.equal(h.container.children.length,0);assert.equal(h.reducedQ.listeners.get('change').size,0);assert.equal(h.mobileQ.listeners.get('change').size,0);
});
await test('Bitmap finishing after reduced-motion cancellation is closed and never painted',async()=>{
 const h=harness(processConfig,{holdDecode:true});await h.settle(h.pending()[0]);assert.equal(h.decodePending.length,1);await h.setReduced(true);h.decodePending[0].resolve(h.decodePending[0].image);await micro();assert(h.decodePending[0].image.closed);assert.equal(h.draws.length,0);assert.equal(h.ready.length,0);assert.equal(h.canvas.style.opacity,'0');h.sequence.dispose();
});
await test('Initial stage repeated HTTP 503 retries once then restores poster without infinite requests',async()=>{
 const h=harness();await h.drain(503);assert.equal(h.requests.length,2);assert.equal(h.errors.length,2);assert.equal(h.canvas.style.opacity,'0');assert(!h.container.classList.contains('has-sequence'));assert.equal(h.pending().length,0);assert.equal(h.rafs.size,0);assert.equal(h.timers.size,0);h.sequence.update(0);await micro();assert.equal(h.requests.length,2);h.sequence.dispose();
});
await test('Transient initial HTTP 503 recovers on the single retry',async()=>{
 const h=harness();await h.settle(h.pending()[0],503);assert.equal(h.pending().length,1);await h.drain();assert.equal(h.requests.filter(r=>r.url.endsWith('frame_0001.webp')).length,2);assert(h.requests.some(r=>r.url.endsWith('frame_0002.webp')),'Recovered first frame should prefetch the adjacent chapter');assert.equal(h.canvas.dataset.frame,'1');assert.equal(h.canvas.style.opacity,'1');assert.equal(h.errors.length,1);h.sequence.dispose();
});
await test('Entire later chapter failing restores poster; later healthy chapter still works',async()=>{
 const h=harness();await h.drain();h.sequence.update(1);await h.drain(503);assert.equal(h.canvas.style.opacity,'0');assert(!h.container.classList.contains('has-sequence'));const counts=new Map();for(const r of h.requests)counts.set(r.url,(counts.get(r.url)||0)+1);assert([...counts.values()].every(n=>n<=2));h.sequence.update(2/3);await h.drain();assert(['109','110'].includes(h.canvas.dataset.frame));assert.equal(h.canvas.style.opacity,'1');h.sequence.dispose();
});
await test('Existing 67/34-frame sequence keeps interpolation, reverse direction and viewport remapping',async()=>{
 const h=harness(sets['existing-single-implant']);await h.drain();h.sequence.update(1);await h.tick(1000);await h.drain();assert.equal(h.canvas.dataset.frame,'67');h.sequence.update(0);await h.tick(1000);await h.drain();assert.equal(h.canvas.dataset.frame,'1');h.sequence.update(.5,{instant:true});await h.drain();assert.equal(h.canvas.dataset.frame,'34');await h.setMobile(true);await h.drain();assert.equal(h.canvas.dataset.frame,'18');assert(h.requests.filter(r=>r.url.includes('/mobile/')).every(r=>Number(r.url.match(/frame_(\d+)/)[1])<=34));h.sequence.dispose();
});
await test('Component renderer still uses only frame zero and receives changing progress',async()=>{
 const c=clone(sets['existing-single-implant']);c.component={type:'test-component'};const custom=[];const h=harness(c,{renderFrame:x=>{custom.push({index:x.index,progress:x.progress});return true;}});await h.drain();h.sequence.update(1);await h.tick(1000);await h.drain();assert(h.requests.every(r=>r.url.endsWith('frame_0001.webp')));assert(custom.every(x=>x.index===0));assert(custom.some(x=>x.progress===1));assert.equal(h.draws.length,0);h.sequence.dispose();
});
await test('Disposal blocks late fetch completion and releases listeners/resources',async()=>{
 const h=harness();const pending=h.pending().slice();h.sequence.dispose();for(const r of pending)await h.settle(r);assert.equal(h.draws.length,0);assert.equal(h.container.children.length,0);assert.equal(h.rafs.size,0);assert.equal(h.timers.size,0);assert.equal(h.reducedQ.listeners.get('change').size,0);assert.equal(h.win.listeners.get('resize').size,0);assert.equal(h.document.listeners.get('visibilitychange').size,0);
});
await test('All three cuts blend decoded real images in both directions with no empty paint',async()=>{
 const h=harness();await h.drain();
 const steps=[1/6,.5,5/6,5/6-.00001,.5-.00001,1/6-.00001];
 for(const p of steps){
  const oldStage=Number(h.canvas.dataset.processStage),before=h.canvas.pixels.map(p=>({...p}));
  h.sequence.update(p,{instant:true});await h.drain();
  const stage=Math.round(p*3);assert.notEqual(stage,oldStage);assert.equal(h.canvas.dataset.transition,'0.00000');assert.equal(h.canvas.dataset.transitionFromStage,String(oldStage));assert.deepEqual(h.canvas.pixels,before,'Cut must start with the previous actual pixels');assert.equal(h.canvas.dataset.settled,'false');
  await h.tick(110);assert(h.canvas.pixels.length>=2,'Middle of a cut must contain both actual images');assert(Number(h.canvas.dataset.transition)>0&&Number(h.canvas.dataset.transition)<1);
  await h.tick(110);assert.equal(h.canvas.pixels.length,1);assert.equal(Number(h.canvas.dataset.processStage),stage);assert.equal(h.canvas.dataset.settled,'true');assert.equal(h.canvas.dataset.transition,undefined);assert.equal(h.rafs.size,0);
 }
 h.sequence.dispose();assert(h.canvases.slice(1).every(c=>c.width===0&&c.height===0),'Cut snapshots must be released');
});
await test('Decode stalls and fast reversals coalesce targets without stale-chapter flash or cache growth',async()=>{
 const h=harness();await h.drain();h.decodeControl.hold=true;h.sequence.update(1);const pending=h.pending().slice();for(const r of pending)await h.settle(r);assert(h.decodePending.length>0);
 for(const p of [.5,.8,.2,1,.4,0])h.sequence.update(p);assert.equal(h.canvas.dataset.processStage,'0');assert.equal(h.canvas.dataset.frame,'1');assert(h.canvas.pixels.length);
 h.decodeControl.hold=false;for(const d of h.decodePending.filter(d=>!d.settled))await h.finishDecode(d);await h.drain();await h.tick(300);assert.equal(h.canvas.dataset.frame,'1');assert.equal(h.canvas.dataset.processStage,'0');assert.equal(h.canvas.dataset.settled,'true');assert(h.canvas.pixels.every(p=>p.frame===1));
 for(let i=0;i<30;i++){h.sequence.update((i%4)/3,{instant:true});assert(h.pending().length<=2);await h.drain();await h.tick(230);assert(h.images.filter(i=>!i.closed).length<=16,'Decoded bitmap cache exceeded 16');assert(h.canvases.slice(1).filter(c=>c.width&&c.height).length<=1,'More than one transition snapshot');}
 h.sequence.dispose();assert(h.images.every(i=>i.closed));assert(h.canvases.slice(1).every(c=>!c.width&&!c.height));
});
await test('Pausing a cut freezes its pixels; resume completes it; an explicit paused step has no fade',async()=>{
 const h=harness();await h.drain();h.sequence.update(1/3);await h.drain();await h.tick(80);assert(h.canvas.pixels.length>=2);h.sequence.setPaused(true);const frozen=clone(h.canvas.pixels),count=h.draws.length;await h.tick(1000);assert.deepEqual(h.canvas.pixels,frozen);assert.equal(h.draws.length,count);assert.equal(h.rafs.size,0);
 h.sequence.setPaused(false);await h.tick(220);await h.drain();assert.equal(h.canvas.pixels.length,1);assert.equal(h.canvas.dataset.transition,undefined);
 h.sequence.setPaused(true);h.sequence.update(2/3,{instant:true});await h.drain();assert.equal(h.canvas.pixels.length,1);assert.equal(h.canvas.dataset.processStage,'2');assert.equal(h.canvas.dataset.transition,undefined);assert.equal(h.rafs.size,0);h.sequence.dispose();
});
await test('Resize during a stalled chapter repaints the held image without an empty canvas',async()=>{
 const h=harness();await h.drain();h.sequence.update(1);assert.equal(h.canvas.dataset.waiting,'true');const held=h.canvas.dataset.frame;h.size.width=600;h.size.height=338;h.sequence.resize();assert(h.canvas.pixels.length);assert.equal(h.canvas.dataset.frame,held);assert.equal(h.canvas.dataset.processStage,'0');assert.equal(h.canvas.dataset.settled,'false');await h.drain();await h.tick(230);assert.equal(h.canvas.dataset.processStage,'3');h.sequence.dispose();
});
await test('Reduced motion releases an active transition snapshot and blocks every animation loop',async()=>{
 const h=harness();await h.drain();h.sequence.update(1/3);await h.drain();await h.tick(80);assert(h.canvas.dataset.transition!==undefined);await h.setReduced(true);assert.equal(h.rafs.size,0);assert(h.images.every(i=>i.closed));assert(h.canvases.slice(1).every(c=>!c.width&&!c.height));assert.equal(h.canvas.style.opacity,'0');h.sequence.dispose();
});
await test('Offscreen and hidden transitions do not animate; returning settles the current chapter',async()=>{
 const h=harness(processConfig,{observed:true});assert.equal(h.requests.length,0);h.observers[0].emit(true);h.observers[1].emit(true);await h.drain();h.sequence.update(1/3);await h.drain();await h.tick(70);h.observers[1].emit(false);const frozen=clone(h.canvas.pixels);assert.equal(h.rafs.size,0);await h.tick(1000);assert.deepEqual(h.canvas.pixels,frozen);h.observers[1].emit(true);await h.tick(250);assert.equal(h.canvas.dataset.transition,undefined);
 h.sequence.update(2/3);await h.drain();await h.tick(50);h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(h.rafs.size,0);const hidden=clone(h.canvas.pixels);await h.tick(1000);assert.deepEqual(h.canvas.pixels,hidden);h.document.hidden=false;h.document.emit('visibilitychange');await h.drain();await h.tick(250);assert.equal(h.canvas.dataset.processStage,'2');assert.equal(h.canvas.dataset.settled,'true');h.sequence.dispose();assert(h.observers.every(o=>o.disconnected));assert(h.canvases.slice(1).every(c=>!c.width&&!c.height));
});
const current=fs.readFileSync(runtimePath,'utf8');const report={checkedAt:new Date().toISOString(),runtimePath,runtimeSha256:digest(source),sourceUnchangedDuringRun:current===source,actualProcessConfig:processConfig,scope:'Deterministic actual createSequence execution in VM with DOM, canvas, RAF, fetch and bitmap mocks. No real browser, actual image decoding, visual/clinical/user quality claim.',passed:results.every(r=>r.passed)&&current===source,results};
const destination=process.argv.find(arg=>arg.startsWith('--output='))?.slice(9);
if(destination){if(!destination.startsWith('/Volumes/MSJ_WORK/Workspaces/'))throw Error('Output must be an absolute SSD workspace path');fs.writeFileSync(destination,JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
console.log(JSON.stringify({report:destination||null,sourceSha256:report.runtimeSha256,passed:report.passed,tests:results.map(({name,passed,error})=>({name,passed,...(error?{error}:{} )}))},null,2));if(!report.passed)process.exitCode=1;
