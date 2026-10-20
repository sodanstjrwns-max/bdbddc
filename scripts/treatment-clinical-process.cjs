'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { clinicalTimelineErrors } = require('./treatment-process-timeline.cjs');
const CLINICAL_PROCESS_KIND = 'clinical-process-sequence';
const CLINICAL_PROCESS_STATUS = 'clinical-process-reviewed';
const SHA = /^[a-f0-9]{64}$/;
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const near = (a,b,tolerance=1e-6) => typeof a === 'number' && Number.isFinite(a) && Math.abs(a-b) <= tolerance;
function fluxAligned4kSource(asset) {
  const m=asset?.metadata,fit=asset?.deliveryTransform;
  return asset?.provider==='higgsfield' && asset?.model==='flux_3_video' && m?.width===3840 && m?.height===2176 && asset?.generation?.resolution==='4k' && asset?.generation?.aspectRatio==='16:9' && fit?.fit==='contain' && fit?.crop===false && fit?.stretch===false && fit?.background==='#f4f0ea' && fit?.sourceWidth===3840 && fit?.sourceHeight===2176 && JSON.stringify(fit?.desktop)==='[1280,720]' && JSON.stringify(fit?.mobile)==='[800,450]';
}
function clinicalProcessErrors(set) {
  const errors = [], add=(ok,message)=>{if(!ok) errors.push(message);};
  if (!set || set.kind !== CLINICAL_PROCESS_KIND) return ['Expected clinical-process-sequence'];
  add(set.status === CLINICAL_PROCESS_STATUS, 'Clinical process review status is missing');
  add(set.cameraPan === false && !set.motion && !set.component && !set.processStages, 'Clinical processes cannot use synthetic motion or disjoint chapter remapping');
  const count = set.desktop?.count, timeline = set.timeline;
  errors.push(...clinicalTimelineErrors(timeline,count));
  add(set.mobile?.count === count, 'Desktop/mobile must contain the same ordered clinical frames');
  add(Array.isArray(set.anchors) && set.anchors.length === 4 && set.anchors.every((a,i)=>near(a,timeline?.states?.[i]?.atFrame/(count-1))), 'Anchors must match actual clinical state endpoints');
  const source=set.source, images=source?.keyframes, videos=source?.transitions;
  add(source?.mode === 'four-states-three-transitions', 'Source must declare four states and three clips, not a single shot');
  if (!Array.isArray(images) || images.length !== 4 || !Array.isArray(videos) || videos.length !== 3) return [...errors,'Missing four original keyframes or three original transitions'];
  const originals=[...images,...videos];
  add(new Set(originals.map(a=>a?.sourceJob)).size === 7 && new Set(originals.map(a=>a?.sha256)).size === 7, 'Each original image/video needs its own job and SHA');
  originals.forEach((asset,i)=>{
    const m=asset?.metadata;
    add(SHA.test(asset?.sha256) && typeof asset?.sourceJob === 'string' && !!asset.sourceJob && typeof asset?.provider === 'string' && !!asset.provider && typeof asset?.model === 'string' && !!asset.model && typeof asset?.generatedAt === 'string' && Number.isFinite(Date.parse(asset.generatedAt)), 'Original provenance missing ' + i);
    add(m && m.sha256 === asset.sha256 && Number.isSafeInteger(m.bytes) && m.bytes>0 && Number.isInteger(m.width) && m.width>=3840 && Number.isInteger(m.height) && m.height>=2160 && (near(m.width/m.height,16/9,.01) || (i>=4 && fluxAligned4kSource(asset))), 'Actual source file dimensions/bytes/SHA missing ' + i);
    add(asset?.generation?.resolution === '4k' && typeof asset?.generation?.receipt === 'string' && SHA.test(asset?.generation?.receiptSHA256), 'Provider 4K generation receipt missing ' + i);
    add(typeof asset?.path === 'string' && asset.path.startsWith('/Volumes/MSJ_WORK/Workspaces/'), 'Original must use an absolute SSD path ' + i);
  });
  images.forEach((image,i)=>{add(image.id === timeline?.states?.[i]?.id,'Keyframe state ID mismatch ' + i);add(image.generation?.quality==='max','Keyframe must retain maximum provider quality '+i);});
  videos.forEach((video,i)=>{
    const transition=timeline?.transitions?.[i], selection=video.selection, m=video.metadata;
    add(video.from === images[i].id && video.to === images[i+1].id && video.startImageSHA256 === images[i].sha256 && video.endImageSHA256 === images[i+1].sha256,'Transition must link the exact adjacent state images ' + i);
    add(near(m?.fps,24) && Number.isSafeInteger(m?.frameCount) && [transition?.frameCount,transition?.frameCount+1].includes(m.frameCount) && near(m?.duration,transition?.durationSeconds,1/24+1e-6),'Actual transition duration/cadence mismatch ' + i);
    const indices=selection?.sourceFrameIndices;
    add(selection?.fps === 24 && selection?.playbackRate === 1 && ['interpolation','padding','loop','syntheticReverse'].every(k=>selection?.[k] === false),'Transition selection must not fabricate frames ' + i);
    add(Array.isArray(indices) && indices.length === transition?.frameCount && indices[0] === 0 && indices.at(-1) === m?.frameCount-1 && indices.every((v,j)=>Number.isSafeInteger(v) && v>=0 && v<m.frameCount && (!j || v>indices[j-1])),'Transition selection must be ordered and preserve both actual endpoints ' + i);
    add(typeof selection?.record === 'string' && SHA.test(selection?.recordSHA256),'Transition selection evidence missing ' + i);
  });
  const rep=set.representative, image=images[0];
  add(image && rep?.stateId === image.id && rep?.sourceImageSHA256===image.sha256 && rep?.sourceJob===image.sourceJob && rep?.url===set.poster,'Representative must identify the first clinical keyframe');
  add(typeof set.poster === 'string' && /^\/images\/[a-zA-Z0-9/_-]+\.(?:jpg|webp)$/.test(set.poster),'Shared representative must use a public image URL');
  const poster=set.technicalOutput?.poster;
  add(poster?.width===1200 && poster?.height===630 && Number.isSafeInteger(poster?.bytes) && poster.bytes>0 && poster.bytes<=300000 && SHA.test(poster?.sha256),'Shared representative must be 1200x630 and <=300KB with byte SHA');
  const pack=set.technicalOutput?.packaging;
  add(poster?.derivedFrom==='first-delivered-frame' && poster?.sourceFrameSHA256===pack?.desktop?.chunks?.[0]?.frameSHA256s?.[0],'Representative poster must bind to the actual first delivered frame');
  add(pack?.format==='webp-chunks-v1' && pack?.reencoded===false,'Chunks must preserve the encoded WebP frames');
  for(const [size,w,h] of [['desktop',1280,720],['mobile',800,450]]) {
    const config=set[size], receipts=pack?.[size]?.chunks;
    add(config?.format==='webp-chunks-v1' && config?.framesPerChunk===16 && config?.chunkCount===count/16 && config?.start===1 && config?.pad===4 && config?.width===w && config?.height===h && typeof config?.pattern==='string' && /^\/static\/treatment-motion\/clinical-process\/[a-z0-9-]+\/[a-f0-9]{12,64}\/(?:desktop|mobile)\/chunk_\{index\}\.bdseq$/.test(config.pattern),'Clinical chunk configuration invalid ' + size);
    add(Array.isArray(receipts) && receipts.length===count/16,'Clinical chunk receipts missing ' + size);
    if(Array.isArray(receipts)) receipts.forEach((chunk,i)=>add(chunk?.firstFrame===i*16 && chunk?.count===16 && Number.isSafeInteger(chunk?.bytes) && chunk.bytes>=144 && chunk.bytes<=2*1024*1024 && SHA.test(chunk?.sha256) && Array.isArray(chunk?.frameSHA256s) && chunk.frameSHA256s.length===16 && chunk.frameSHA256s.every(v=>SHA.test(v)),'Invalid chunk receipt ' + size + '/' + i));
    if(Array.isArray(receipts)) {
      const hashes=receipts.flatMap(chunk=>Array.isArray(chunk?.frameSHA256s)?chunk.frameSHA256s:[]);
      for(const [index,clip] of (timeline?.transitions||[]).entries()) {
        const frames=hashes.slice(clip.startFrame,clip.endFrameExclusive);
        add(frames.length===clip.frameCount && new Set(frames).size>=Math.ceil(clip.frameCount*.75),'A transition cannot be a repeated still '+size+'/'+index);
        let run=0,last=null;for(const value of frames){run=value===last?run+1:1;last=value;add(run<=12,'Held transition exceeds twelve frames '+size+'/'+index);}
      }
    }
  }
  const review=set.review;
  add(SHA.test(set.timelineSHA256) && set.timelineSHA256===hash(JSON.stringify(timeline)),'Exact reviewed narrative timeline SHA is required');
  add(Array.isArray(review?.boundaries) && review.boundaries.length===2,'Both actual video seams need saved visual continuity evidence');
  if(Array.isArray(review?.boundaries)) review.boundaries.forEach((boundary,i)=>{
    const end=timeline?.transitions?.[i]?.endFrameExclusive;
    add(boundary?.leftFrame===end-1 && boundary?.rightFrame===end && boundary?.sharedKeyframeSHA256===images[i+1]?.sha256 && boundary?.visualContinuityPassed===true,'Transition boundary does not bind the shared input keyframe '+i);
    for(const size of ['desktop','mobile']){
      const hashes=pack?.[size]?.chunks?.flatMap(chunk=>chunk.frameSHA256s||[])||[];
      add(boundary?.[size]?.leftFrameSHA256===hashes[end-1] && boundary?.[size]?.rightFrameSHA256===hashes[end],'Transition boundary does not bind actual delivered frames '+size+'/'+i);
    }
  });
  for(const field of ['integrityAllFramesChecked','anatomicalReview','runtimePlaybackExercised','forwardEndpointObserved','reverseEndpointObserved','chapterActionMatched','boundaryContinuityViewed','narrativeAnchorsReviewed']) add(review?.[field]===true,'Recorded review is missing ' + field);
  add(Number.isSafeInteger(review?.visualSampleCount) && review.visualSampleCount>=48,'Need saved visual samples across all three transitions');
  add(review?.continuousPlaybackViewed===false && review?.allFramesVisuallyReviewed===false && review?.clinicalApproval===false && review?.userQualityApproval===false,'Do not overstate clinical or all-frame approval');
  add(review?.playbackReviewScope==='real runtime forward/reverse exercised; sampled start/mid/end visuals; not every-frame review','Playback review scope must remain precise');
  add(review?.anatomicalReviewScope==='sampled visual geometry/action screening, not clinical approval','Anatomical review scope must remain precise');
  add(typeof review?.record==='string' && SHA.test(review?.recordSHA256),'Saved process review record missing');
  add(SHA.test(set.processCopySHA256),'Exact matched clinical process row SHA is required');
  return errors;
}
function checkedFile(file,digest,label) {
  if(typeof file!=='string' || !path.isAbsolute(file) || !path.resolve(file).startsWith('/Volumes/MSJ_WORK/Workspaces/') || fs.realpathSync(file)!==path.resolve(file) || !fs.statSync(file).isFile()) throw Error(label+': expected real SSD file');
  const bytes=fs.readFileSync(file);
  if(!SHA.test(digest) || hash(bytes)!==digest) throw Error(label+': SHA mismatch');
  return bytes;
}
function validateClinicalProcessEvidence(set) {
  const errors=clinicalProcessErrors(set); if(errors.length) throw Error(errors.join('; '));
  for(const asset of [...set.source.keyframes,...set.source.transitions]){
    const bytes=checkedFile(asset.path,asset.sha256,'Original');
    if(bytes.length!==asset.metadata.bytes) throw Error('Original byte count mismatch');
    const receipt=JSON.parse(checkedFile(asset.generation.receipt,asset.generation.receiptSHA256,'Generation receipt'));
    for(const [field,expected] of Object.entries({sourceJob:asset.sourceJob,provider:asset.provider,model:asset.model,resolution:'4k'})) if(receipt[field]!==expected) throw Error('Generation provenance mismatch '+field);
    const raw=JSON.parse(checkedFile(receipt.rawReceipt?.path,receipt.rawReceipt?.sha256,'Raw provider receipt'));
    if(fluxAligned4kSource(asset)) {
      const submitted=raw.structuredContent?.results?.filter(row=>row.id===asset.sourceJob);
      if(raw.isError || receipt.aspectRatio!=='16:9' || submitted?.length!==1 || submitted[0].type!=='video' || submitted[0].model!=='flux_3_video' || submitted[0].params?.resolution!=='4k' || submitted[0].params?.aspect_ratio!=='16:9') throw Error('FLUX aligned source must bind actual 4K 16:9 submission');
    }
    if(set.source.keyframes.includes(asset) && receipt.quality!=='max') throw Error('Image generation receipt quality mismatch');
    if(set.source.transitions.includes(asset) && JSON.stringify(receipt.inputImageSHA256s)!==JSON.stringify([asset.startImageSHA256,asset.endImageSHA256])) throw Error('Video input-image receipt mismatch');
  }
  set.source.transitions.forEach((clip,i)=>{
    const receipt=JSON.parse(checkedFile(clip.selection.record,clip.selection.recordSHA256,'Selection record'));
    const expected={sourceSHA256:clip.sha256,sourceJob:clip.sourceJob,...clip.selection};
    for(const field of ['sourceSHA256','sourceJob','sourceFrameIndices','fps','playbackRate','interpolation','padding','loop','syntheticReverse'])
      if(JSON.stringify(receipt[field])!==JSON.stringify(expected[field])) throw Error('Selection evidence mismatch '+i+' '+field);
    if(clip.deliveryTransform && JSON.stringify(receipt.deliveryTransform)!==JSON.stringify(clip.deliveryTransform)) throw Error('Selection evidence does not bind contain transform '+i);
    for(const size of ['desktop','mobile']) {
      const segment=set.timeline.transitions[i];
      const hashes=set.technicalOutput.packaging[size].chunks.flatMap(chunk=>chunk.frameSHA256s).slice(segment.startFrame,segment.endFrameExclusive);
      if(JSON.stringify(receipt.outputFrameSHA256s?.[size])!==JSON.stringify(hashes)) throw Error('Selection receipt does not bind delivered '+size+' frames '+i);
    }
  });
  const review=JSON.parse(checkedFile(set.review.record,set.review.recordSHA256,'Process review'));
  for(const [field,expected] of Object.entries({kind:set.kind,processCopySHA256:set.processCopySHA256,timelineSHA256:set.timelineSHA256,sourceImageSHA256s:set.source.keyframes.map(a=>a.sha256),sourceVideoSHA256s:set.source.transitions.map(a=>a.sha256)})) if(JSON.stringify(review[field])!==JSON.stringify(expected)) throw Error('Process review identity mismatch '+field);
  for(const [field,value] of Object.entries(set.review)) if(!['record','recordSHA256'].includes(field) && JSON.stringify(review.review?.[field])!==JSON.stringify(value)) throw Error('Process review claim mismatch '+field);
  return true;
}
function validateClinicalRepresentative(set,editorial) {
  return !!editorial && editorial.src===set.poster && editorial.sha256===set.technicalOutput?.poster?.sha256 && editorial.sourceSha256===set.representative?.sourceImageSHA256 && editorial.sourceJob===set.representative?.sourceJob && editorial.width===1200 && editorial.height===630;
}
module.exports={fluxAligned4kSource,CLINICAL_PROCESS_KIND,CLINICAL_PROCESS_STATUS,clinicalProcessErrors,validateClinicalProcessEvidence,validateClinicalRepresentative};
