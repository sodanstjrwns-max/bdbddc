const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {parse}=require('node-html-parser');
const root=path.resolve(__dirname,'..');
const {CLINICAL_PROCESS_KIND,CLINICAL_PROCESS_STATUS,clinicalProcessErrors,validateClinicalProcessEvidence,validateClinicalRepresentative}=require('./treatment-clinical-process.cjs');
const {readProcessCopy,processProfile,syncProcessJourney}=require('./treatment-process-journey.cjs');
const {readMotionDisplayPolicy,motionDisplayDecision}=require('./treatment-motion-display.cjs');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// A new single shot has stronger provenance and integrity requirements than legacy assets.
// These checks record review scope; they do not grant clinical or user-quality approval.
const SINGLE_SHOT_KIND = 'single-shot-sequence';
const SINGLE_SHOT_STATUS = 'single-shot-reviewed';
const CHUNK_FORMAT = 'webp-chunks-v1';
const SHA256 = /^[a-f0-9]{64}$/;
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
// A reviewed crop keeps the original job and metadata; only delivery timing changes.
function singleShotTimeline(source) {
 const duration = source?.durationSeconds, range = source?.sourceRange, errors = [];
 if (range === undefined) return {valid:[4,6,8].includes(duration),duration,frameCount:[4,6,8].includes(duration)?duration*24:0,originalDuration:duration,errors};
 const check=(ok,message)=>{if(!ok)errors.push('Source range: '+message);};
 check(range && range.version===1 && range.selectionPolicy==='contiguous-original-frames-v1','explicit contiguous selection policy required');
 check(range?.startFrame===0 && range?.endFrameExclusive===64 && range?.frameCount===64,'only the reviewed original interval 0..63 is supported');
 check(range?.sourceJob===source?.video?.sourceJob && range?.sourceSHA256===source?.video?.sha256 && SHA256.test(range?.sourceSHA256),'original job/SHA must remain exact');
 check(range?.originalNominalDurationSeconds===4 && [96,97].includes(range?.sourceFrameCount) && range.sourceFrameCount===source?.mediaMetadata?.video?.frameCount,'original four-second source frame count must be preserved');
 check(range?.fps===24 && source?.mediaMetadata?.video?.fps===24 && range?.playbackRate===1 && range?.constantOriginalCadence===true,'original 24fps cadence and playback rate one required');
 check(range?.interpolation===false && range?.padding===false && range?.loop===false && range?.reversed===false,'interpolation, padding, looping and synthetic reverse are forbidden');
 check(Array.isArray(range?.sourceFrameIndices) && range.sourceFrameIndices.length===64 && range.sourceFrameIndices.every((v,i)=>v===i),'all original frame indices 0..63 must appear once in order');
 check(Number.isFinite(duration) && Math.abs(duration-64/24)<1e-12 && range?.firstTimestampSeconds===0 && range?.lastTimestampSeconds===63/24 && range?.exclusiveEndSeconds===64/24,'delivery duration and original timestamps must be exactly 64/24 seconds');
 check(range?.fullSourceStatus==='hold' && range?.wholeSourceAccepted===false,'full-source HOLD must remain separate from the selected interval');
 check(nonempty(range?.reviewEvidence?.path) && range.reviewEvidence.path.startsWith('/Volumes/MSJ_WORK/Workspaces/') && SHA256.test(range?.reviewEvidence?.sha256),'exact saved interval review required');
 for(const size of ['desktop','mobile'])check(nonempty(range?.frameEvidence?.[size]?.path) && range.frameEvidence[size].path.startsWith('/Volumes/MSJ_WORK/Workspaces/') && SHA256.test(range?.frameEvidence?.[size]?.sha256),size+' frame identity evidence required');
 return {valid:errors.length===0,duration,frameCount:64,originalDuration:4,errors};
}
function validateRangeFrameRecord(record,range,hashes) {
 if(record?.sourceSHA256!==range?.sourceSHA256||record?.sourceJob!==range?.sourceJob||record?.selectionPolicy!==range?.selectionPolicy||record?.sourceCount!==range?.sourceFrameCount||record?.targetCount!==64||record?.fps!==24||record?.playbackRate!==1||record?.constantOriginalCadence!==true||record?.interpolation!==false||record?.padding!==false||record?.loop!==false||record?.reversed!==false||record?.nominalTimelineSeconds!==64/24||record?.lastSourceTimestampSeconds!==63/24||!['sourceIndices','sourceFrameIndices'].every(key=>Array.isArray(record?.[key])&&record[key].length===64&&record[key].every((v,i)=>v===i))||record?.frames?.length!==64||hashes?.length!==64||record.frames.some((f,i)=>f.index!==i||f.sourceFrameIndex!==i||f.sha256!==hashes[i]))throw Error('Output frame SHA/order/cadence does not preserve original interval');
}
function validateSourceRangeEvidence(set) {
 const range=set.source?.sourceRange;if(range===undefined)return;
 const fail=message=>{throw Error('Source range evidence: '+message);};
 const read=ref=>{if(!ref?.path?.startsWith('/Volumes/MSJ_WORK/Workspaces/')||fs.realpathSync(ref.path)!==ref.path)fail('unsafe path');const bytes=fs.readFileSync(ref.path);if(crypto.createHash('sha256').update(bytes).digest('hex')!==ref.sha256)fail('SHA differs');return JSON.parse(bytes);};
 const review=read(range.reviewEvidence),r=review.acceptedRange;
 if(review.status!=='pass_exact_contiguous_source_interval'||review.fullSourceStatus!=='hold'||review.sourceSHA256!==range.sourceSHA256||review.jobId!==range.sourceJob||r?.firstFrameInclusive!==0||r?.lastFrameInclusive!==63||r?.frameCount!==64||r?.fps!==24||r?.playbackDurationSeconds!==64/24||r?.constantOriginalCadence!==true||review.clinicalApproval!==false)fail('review does not accept this exact original interval');
 for(const size of ['desktop','mobile']){
  const record=read(range.frameEvidence[size]),hashes=set.technicalOutput?.packaging?.[size]?.chunks?.flatMap(c=>c.frameSHA256s);
  try{validateRangeFrameRecord(record,range,hashes);}catch(error){fail(size+' '+error.message);}
 }
}
function singleShotErrors(set) {
 const errors = [], check = (ok, message) => { if (!ok) errors.push(message); };
 check(set && set.kind === SINGLE_SHOT_KIND, 'Expected a single-shot sequence');
 if (!set || typeof set !== 'object') return errors;
 check(set.status === SINGLE_SHOT_STATUS, 'A prepared single shot must not be promoted automatically');
 check(set.cameraPan === false && set.motion === undefined && set.component === undefined && set.processStages === undefined, 'Single shots must not contain camera-only transforms, cutout motion or chapter clips');
 const anchors = [0, 1/3, 2/3, 1];
 check(Array.isArray(set.anchors) && set.anchors.length === 4 && set.anchors.every((v,i) => Number.isFinite(v) && Math.abs(v-anchors[i]) < 1e-9), 'Single shots need one global linear timeline');
 const source = set.source, timeline = singleShotTimeline(source), duration = timeline.duration, timelineValid = timeline.valid;
 errors.push(...timeline.errors);
 const frameCount = timeline.frameCount, chunkCount = frameCount/8;
 const prefix = /^\/static\/treatment-motion\/new-continuous-chunks\/([a-z0-9-]+)\/([a-f0-9]{12,64})\//;
 const bases = [];
 for (const [size, width, height] of [['desktop',1280,720],['mobile',800,450]]) {
  const sequence = set[size], match = typeof sequence?.pattern === 'string' ? sequence.pattern.match(prefix) : null;
  check(sequence?.format === CHUNK_FORMAT && timelineValid && sequence.count === frameCount && sequence.framesPerChunk === 8 && sequence.chunkCount === chunkCount, size + ' needs the actual 4/6/8-second timeline in eight-frame chunks (96/144/192 frames)');
  check(sequence?.width === width && sequence?.height === height && sequence?.start === 1 && sequence?.pad === 4, size + ' dimensions/range do not match the delivery format');
  check(!!match && sequence.pattern === match[0] + size + '/chunk_{index}.bdseq', size + ' needs a content-addressed local chunk pattern');
  if (match) bases.push(match[0]);
 }
 check(bases.length === 2 && bases[0] === bases[1] && set.poster === bases[0] + 'poster.jpg', 'Poster and both sizes must share one source revision');
 check(timelineValid && source.fps === 24 && source.frameCount === frameCount, 'Missing actual four-, six- or eight-second source timeline provenance');
 check(source?.declaredSingleShot?.continuous === true && source?.declaredSingleShot?.cutCount === 0 && timelineValid && source?.declaredSingleShot?.durationSeconds === timeline.originalDuration, 'Missing explicit single-shot declaration');
 check(Array.isArray(source?.chapters) && source.chapters.length === 4 && source.chapters.every((c,i) => Number.isFinite(c?.atSeconds) && Math.abs(c.atSeconds-i*duration/3)<1e-6 && nonempty(c.label)), 'Chapter labels must describe the same global timeline');
 for (const media of ['image','video']) {
  const record = source?.[media], metadata = source?.mediaMetadata?.[media];
  check(record && SHA256.test(record.sha256) && nonempty(record.sourceJob) && nonempty(record.provider) && nonempty(record.model) && nonempty(record.generatedAt) && Number.isFinite(Date.parse(record.generatedAt)), media + ' needs a generation job, source SHA, model and timestamp');
  check(metadata && metadata.sha256 === record?.sha256 && Number.isSafeInteger(metadata.bytes) && metadata.bytes > 0 && Number.isSafeInteger(metadata.width) && Number.isSafeInteger(metadata.height) && metadata.width >= 3840 && metadata.height >= 2160 && Math.abs(metadata.width/metadata.height-16/9)<0.005, media + ' metadata does not match the 4K source receipt');
 }
 const video = source?.mediaMetadata?.video;
 check(timelineValid && Number.isFinite(video?.duration) && Math.abs(video.duration-timeline.originalDuration)<=1/24+1e-6 && Number.isFinite(video?.fps) && video.fps>=24, 'Video metadata must match the declared four-, six- or eight-second source at 24fps or more');
 check(typeof source?.clinicalApproval === 'boolean' && typeof source?.userQualityApproval === 'boolean', 'Clinical approval and user acceptance must be explicit separate facts');
 const review = set.review;
 check(review?.integrityAllFramesChecked === true && review?.anatomicalReview === true && Number.isSafeInteger(review?.visualSampleCount) && review.visualSampleCount >= 16, 'Missing all-frame integrity or at least 16 sampled visual-review observations');
 check(review?.runtimePlaybackExercised === true && review?.forwardEndpointObserved === true && review?.reverseEndpointObserved === true, 'Missing actual runtime playback and both endpoint observations');
 check(review?.playbackReviewScope === 'real runtime forward/reverse exercised; sampled start/mid/end visuals; not every-frame review' && review?.continuousPlaybackViewed === false && review?.allFramesVisuallyReviewed === false, 'Runtime playback evidence must state the sampled scope without an every-frame viewing claim');
 check(review?.anatomicalReviewScope === 'sampled visual geometry/action screening, not clinical approval', 'Anatomical screening scope must remain separate from clinical approval');
 check(SHA256.test(review?.recordSHA256), 'Saved review evidence needs its exact SHA256');
 check(nonempty(review?.record) && review.record.startsWith('/Volumes/MSJ_WORK/Workspaces/'), 'A saved SSD review evidence record is required');
 const poster = set.technicalOutput?.poster;
 check(poster?.width === 1200 && poster?.height === 630 && Number.isSafeInteger(poster?.bytes) && poster.bytes > 0 && poster.bytes <= 300000 && SHA256.test(poster?.sha256), 'Poster metadata must describe a bounded 1200x630 JPEG');
 const packaging = set.technicalOutput?.packaging;
 check(packaging?.format === CHUNK_FORMAT && packaging.reencoded === false, 'Lossless chunk packaging provenance is required');
 for (const size of ['desktop','mobile']) {
  const packed = packaging?.[size];
  check(packed?.format === CHUNK_FORMAT && timelineValid && packed.count === frameCount && packed.framesPerChunk === 8 && packed.chunkCount === chunkCount && Array.isArray(packed.chunks) && packed.chunks.length === chunkCount, size + ' chunk receipts are incomplete');
  if (Array.isArray(packed?.chunks)) {
   check(packed.chunks.every((c,i) => c.index === i && c.firstFrame === i*8 && c.count === 8 && Number.isSafeInteger(c.bytes) && c.bytes > 80 && c.bytes <= 2*1024*1024 && SHA256.test(c.sha256) && Array.isArray(c.frameSHA256s) && c.frameSHA256s.length === 8 && c.frameSHA256s.every(h => SHA256.test(h))), size + ' chunk/frame receipts are invalid');
   const hashes = packed.chunks.flatMap(c => Array.isArray(c.frameSHA256s) ? c.frameSHA256s : []);
   check(timelineValid && hashes.length === frameCount && new Set(hashes).size >= frameCount*.75 && [0,1,2,3].every(q => new Set(hashes.slice(q*frameCount/4,(q+1)*frameCount/4)).size >= frameCount*.75/4), size + ' contains insufficient distinct encoded frames; direct process review is still required');
   let longestRepeat = 0, repeat = 0, previous;
   for (const digest of hashes) { repeat = digest === previous ? repeat+1 : 1; previous=digest; longestRepeat=Math.max(longestRepeat,repeat); }
   check(longestRepeat <= 12, size + ' contains an encoded still hold longer than half a second; no padding is allowed');
  }
 }
 return errors;
}
function validateChunkBytes(bytes, receipt, {framesPerChunk=8}={}) {
 const fail = message => { throw Error(message); };
 if (!Buffer.isBuffer(bytes) || bytes.length < 80 || bytes.length > 2*1024*1024) fail('Invalid chunk byte length');
 if (bytes.subarray(0,8).toString('ascii') !== 'BDSEQ01\n') fail('Invalid chunk magic');
 const firstFrame = bytes.readUInt32LE(8), count = bytes.readUInt16LE(12);
 if (![8,16].includes(framesPerChunk) || count !== framesPerChunk || bytes.readUInt16LE(14) !== 0 || firstFrame !== receipt.firstFrame || receipt.count !== count) fail('Invalid chunk frame range');
 if (receipt.bytes !== bytes.length || crypto.createHash('sha256').update(bytes).digest('hex') !== receipt.sha256) fail('Chunk receipt does not match file bytes');
 let end = 16 + count*8;
 const frames = [];
 for (let i=0;i<count;i++) {
  const offset = bytes.readUInt32LE(16+i*8), length = bytes.readUInt32LE(20+i*8);
  if (offset !== end || length < 12 || offset+length > bytes.length) fail('Invalid chunk frame bounds');
  const frame = bytes.subarray(offset,offset+length);
  if (frame.subarray(0,4).toString('ascii') !== 'RIFF' || frame.subarray(8,12).toString('ascii') !== 'WEBP' || frame.readUInt32LE(4)+8 !== length) fail('Invalid WebP frame container');
  const digest = crypto.createHash('sha256').update(frame).digest('hex');
  if (digest !== receipt.frameSHA256s?.[i]) fail('Packed frame bytes differ from original frame receipt');
  frames.push({index:firstFrame+i,sha256:digest,bytes:length}); end=offset+length;
 }
 if (end !== bytes.length) fail('Unexpected chunk trailing bytes');
 return frames;
}
function runtimeFileNames(siteRoot=root) {
 const names = ['treatment-scroll.js','treatment-scroll.css','treatment-scroll-sequence.js','treatment-scroll-compositor.js'];
 const text = fs.readFileSync(path.join(siteRoot,'public/static/treatment-scroll-sequence.js'),'utf8');
 const helpers = [...text.matchAll(/\bfrom\s*['"]\.\/(treatment-frame-chunks\.[a-f0-9]{12}\.js)['"]/g)].map(match => match[1]);
 return [...names, ...new Set(helpers)];
}
function visualConfig(set) {
 if (set.kind === SINGLE_SHOT_KIND) {
  const errors = singleShotErrors(set);
  if (errors.length) throw Error(errors.join('; '));
 } else if (set.kind === CLINICAL_PROCESS_KIND) {
  const errors=clinicalProcessErrors(set); if(errors.length) throw Error(errors.join('; '));
 } else if (!['visual-review-passed','process-sample-reviewed'].includes(set.status)) throw Error('Missing configured visual review');
 const {poster,desktop,mobile,anchors,kind,cameraPan,motion,component,processStages,timeline}=set;
 const posterSize = [SINGLE_SHOT_KIND,CLINICAL_PROCESS_KIND].includes(kind) ? {posterWidth:1200,posterHeight:630} : {};
 return {poster,desktop,mobile,anchors,kind,cameraPan,motion,component,processStages,...(timeline?{timeline}:{}),...posterSize,background:'#f7f7f0',cacheSize:10,mobileBreakpoint:760};
}

const ui={ko:{eyebrow:'SCROLL TO UNDERSTAND · 눈으로 이해하는 치료',skip:'움직임을 건너뛰고 다음 설명으로',pause:'움직임 멈추기',resume:'움직임 켜기',disclaimer:'치료 이해를 돕는 설명용 시각자료입니다. 실제 환자의 치료 전후·결과나 기간을 보여주는 장면이 아닙니다.',step:'설명으로 이동',hubTitle:'내가 걱정하는 부분부터, 차근차근.',hubIntro:'치료 이름을 고르기 전에 불편한 위치와 가능한 선택지, 이후의 생활을 함께 살펴보세요.',hubSteps:[['불편한 곳 찾기','어느 치아가 언제 불편한지, 무엇이 가장 걱정되는지부터 이야기합니다.','내 불편'],['선택지 살펴보기','검사와 상담으로 남길 수 있는 조직과 필요한 치료, 대안을 구분합니다.','선택의 기준'],['계획 이해하기','치료 범위와 단계, 비용·시간과 계획이 달라질 조건을 확인합니다.','치료 계획'],['이후 생활 준비하기','관리 방법과 점검 시점, 예상과 다른 불편이 생겼을 때의 연락 방법을 정리합니다.','치료 이후']]},en:{eyebrow:'SCROLL TO UNDERSTAND',skip:'Skip the motion and continue reading',pause:'Pause motion',resume:'Enable motion',disclaimer:'Illustrative visual guidance, not an actual patient before-and-after, result or treatment timeline.',step:'Go to step',hubTitle:'Start with the part that worries you.',hubIntro:'Explore your concern, the choices and life after treatment before choosing a treatment name.',hubSteps:[['Locate your concern','Explain where and when you feel discomfort, and what worries you most.','Your concern'],['Compare your options','An examination helps distinguish what can be preserved, treatment needs and alternatives.','Your options'],['Understand the plan','Ask about stages, costs, visits and the conditions that may change the plan.','Your plan'],['Prepare for daily life','Discuss maintenance, reviews and whom to contact if something feels unexpected.','After treatment']]},ja:{eyebrow:'SCROLL TO UNDERSTAND · 図で理解する治療',skip:'動きを飛ばして次の説明へ',pause:'動きを止める',resume:'動きを有効にする',disclaimer:'治療を理解するための説明用ビジュアルです。実際の患者の治療前後・結果や期間を示すものではありません。',step:'説明へ移動',hubTitle:'気になっているところから、一つずつ。',hubIntro:'治療名を選ぶ前に、不安や選択肢、治療後の生活を一緒に確認しましょう。',hubSteps:[['気になる場所を伝える','どの歯がいつ気になるか、何が一番不安なのかを整理します。','今の不安'],['選択肢を確認する','診察を通して残せる組織と必要な治療、別の方法を確認します。','選択の基準'],['計画を理解する','治療の範囲と段階、費用や通院、計画が変わる条件を確認します。','治療計画'],['その後の生活に備える','お手入れや定期確認、予想外の不調があった場合の連絡先を整理します。','治療後']]}};
function visualFor(slug){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'src/data/treatment-motion-assets.json'),'utf8'));
 const key=slug==='index'?manifest.hub:manifest.profiles[slug], set=manifest.sets[key];
 if(!set)throw Error('Missing configured visual for '+slug);
 return {key,config:visualConfig(set)};
}
function art(visual,title){const {config}=visual;return `<img class="bd-sequence-poster" src="${esc(config.poster)}" width="${config.posterWidth||config.desktop.width}" height="${config.posterHeight||config.desktop.height}" alt="${esc(title)}" loading="lazy" decoding="async">`;}
function displayFor(slug){const manifest=JSON.parse(fs.readFileSync(path.join(root,'src/data/treatment-motion-assets.json'),'utf8'));const policy=readMotionDisplayPolicy(root,Object.keys(manifest.profiles));return motionDisplayDecision(slug,manifest,readProcessCopy(root),policy);}
function render(profile,locale,slug){const decision=displayFor(slug);if(!decision.renderMotion)return '';const u=ui[locale],visual=visualFor(slug);if(visual.config.kind===CLINICAL_PROCESS_KIND){const data=readProcessCopy(root);if(!data)throw Error('Clinical process media requires matched process copy');const row=data.rows.find(row=>row.slug===slug),manifest=JSON.parse(fs.readFileSync(path.join(root,'src/data/treatment-motion-assets.json'),'utf8'));if(crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex')!==manifest.sets[visual.key].processCopySHA256)throw Error('Clinical process row differs from matched media '+slug);profile=processProfile(profile,slug,data);}const p=profile[locale];return `<!-- bd-treatment-scroll:start --><section class="bd-scroll" id="treatment-in-motion" aria-labelledby="bd-scroll-heading" data-scene="${esc(profile.scene)}" data-variant="${esc(slug)}" data-visual-set="${esc(visual.key)}"><div class="bd-scroll-intro"><p class="bd-scroll-eyebrow">${u.eyebrow}</p><h2 id="bd-scroll-heading">${esc(p.title)}</h2><p>${esc(p.intro)}</p><a href="#bd-scroll-after" class="bd-scroll-skip">${u.skip}</a></div><div class="bd-scroll-layout"><div class="bd-scroll-visual"><div class="bd-scroll-art" data-sequence="${esc(JSON.stringify(visual.config))}">${art(visual,p.title)}</div><div class="bd-scroll-caption"><span class="bd-scroll-counter">01 / 04</span><span class="bd-scroll-label">${esc(p.steps[0].label)}</span></div><div class="bd-scroll-progress" aria-hidden="true"><i></i></div><div class="bd-scroll-controls">${p.steps.map((step,i)=>`<button type="button" class="bd-scroll-step-control" data-step="${i}" aria-label="${u.step} ${i+1}: ${esc(step.title)}" ${i===0?'aria-current="step"':''}>0${i+1}</button>`).join('')}<button class="bd-scroll-toggle" type="button" data-pause="${u.pause}" data-resume="${u.resume}">${u.pause}</button></div><p class="bd-scroll-disclaimer">${u.disclaimer}</p></div><ol class="bd-scroll-steps">${p.steps.map((step,i)=>`<li class="bd-scroll-step" id="bd-scroll-step-${i+1}" data-label="${esc(step.label)}"><span>0${i+1}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join('')}</ol></div><div id="bd-scroll-after"></div></section><!-- bd-treatment-scroll:end -->`;}
function inject(html,profile,locale,slug,version){
 let t=html.replace(/<!-- bd-treatment-scroll:start -->[\s\S]*?<!-- bd-treatment-scroll:end -->\s*/g,'');
 const d=parse(t,{comment:true});
 d.querySelectorAll('.bd-scroll').forEach(n=>n.remove());
 d.querySelectorAll('link[href*="/static/treatment-scroll.css"],script[src*="/static/treatment-scroll.js"]').forEach(n=>n.remove());
 const body=d.querySelector('main');if(!body)throw Error('Missing main '+slug);
 const decision=displayFor(slug);
 if(decision.renderMotion){
  const insertion=body.querySelector('#tg-understand')||body.querySelector('.tg-hero');if(!insertion)throw Error('Missing patient intro '+slug);
  insertion.insertAdjacentHTML('afterend',render(profile,locale,slug));
  d.querySelector('head').insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="/static/treatment-scroll.css?v=${version}">`);
  d.querySelector('body').insertAdjacentHTML('beforeend',`<script defer src="/static/treatment-scroll.js?v=${version}"></script>`);
 }
 const result=parse(syncProcessJourney(d.toString(),slug,locale,readProcessCopy(root)),{comment:true});
 if(!decision.renderMotion){
  const journey=result.querySelector('#tg-journey');if(!journey)throw Error('Missing clinical journey '+slug);
  if(result.querySelector('#treatment-in-motion'))throw Error('Unexpected motion anchor outside the removed section '+slug);
  journey.insertAdjacentHTML('afterbegin','<span id="treatment-in-motion" data-treatment-motion-alias="clinical-process" aria-hidden="true" style="display:block;scroll-margin-top:8rem"></span>');
 }
 return result.toString();
}
function assetVersion(){return crypto.createHash('sha256').update([...runtimeFileNames().map(file=>'public/static/'+file),'src/data/treatment-motion-assets.json'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n')).digest('hex').slice(0,12);}
function hubProfile(locale){const u=ui[locale];return{scene:'consult',variant:'hub',[locale]:{title:u.hubTitle,intro:u.hubIntro,steps:u.hubSteps.map(([title,text,label])=>({title,text,label}))}};}
function syncPage(html,slug,locale='ko'){const profiles=JSON.parse(fs.readFileSync(path.join(root,'src/data/treatment-scroll.json'),'utf8')).profiles;const profile=slug==='index'?hubProfile(locale):profiles[slug];if(!profile)throw Error('Missing scroll profile '+slug);return inject(html,profile,locale,slug,assetVersion());}
function syncAll(destination=root){const data=JSON.parse(fs.readFileSync(path.join(root,'src/data/treatment-scroll.json'),'utf8'));const expected=Object.keys(require('../src/data/treatment-page-editorial.json').profiles).sort();if(JSON.stringify(Object.keys(data.profiles).sort())!==JSON.stringify(expected))throw Error('Scroll profiles must cover all 55 treatments');const version=assetVersion();let count=0;for(const [folder,locale] of [['','ko'],['en','en'],['jp','ja']]){const dir=path.join(destination,folder,'treatments');for(const [slug,profile] of [...Object.entries(data.profiles),['index',hubProfile(locale)]]){const file=path.join(dir,slug+'.html'),html=fs.readFileSync(file,'utf8'),updated=inject(html,profile,locale,slug,version);if(html!==updated){fs.writeFileSync(file,updated);count++;}}}return{updated:count,version,profiles:Object.keys(data.profiles).length};}
module.exports={displayFor,CLINICAL_PROCESS_KIND,CLINICAL_PROCESS_STATUS,clinicalProcessErrors,validateClinicalProcessEvidence,validateClinicalRepresentative,art,render,inject,syncPage,syncAll,visualConfig,singleShotErrors,singleShotTimeline,validateRangeFrameRecord,validateSourceRangeEvidence,validateChunkBytes,runtimeFileNames,SINGLE_SHOT_KIND,SINGLE_SHOT_STATUS,CHUNK_FORMAT};
if(require.main===module)console.log(JSON.stringify(syncAll(process.argv.includes('--dist')?path.join(root,'dist'):root)));
