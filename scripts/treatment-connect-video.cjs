'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {parse} = require('node-html-parser');
const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://connect.patientfunnel.kr';
const DATA = 'src/data/treatment-connect-videos.json';
const LIBRARY = 'src/data/treatment-connect-library.json';
const CSS = 'public/static/treatment-connect-video.css';
const JS = 'public/static/treatment-connect-video.js';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const words = {
 ko:{heading:'영상으로 살펴보는 치료 과정',play:'영상으로 재생',scroll:'스크롤로 살펴보기',scrollHelp:'아래로 스크롤하면 영상의 처음부터 끝까지 이동합니다. 재생 모드에서는 원래 속도로 볼 수 있습니다.',nativeHelp:'재생 버튼으로 치료 설명 영상을 볼 수 있습니다.',loading:'영상 준비 중입니다. 재생 버튼으로도 볼 수 있습니다.',fallback:'스크롤 탐색을 불러오지 못했습니다. 재생 버튼으로 영상을 볼 수 있습니다.',language:'한국어 설명 영상',related:'함께 볼 영상',open:'원본 영상 열기',error:'영상을 불러오지 못했습니다. 원본 영상 링크로 확인해 주세요.',progress:'영상 진행 위치',duration:'치료 설명 영상'},
 en:{heading:'Explore the treatment in video',play:'Play video',scroll:'Explore by scrolling',scrollHelp:'Scroll to explore the treatment explanation. Switch to playback to watch at its original speed.',nativeHelp:'Use the player controls to watch the treatment explanation.',loading:'Loading the video. You can also use the player controls.',fallback:'Scroll navigation is unavailable. Use the video player controls.',language:'This video contains Korean text.',related:'Related videos',open:'Open original video',error:'The video could not be loaded. Use the original video link.',progress:'Video position',duration:'Treatment explanation'},
 ja:{heading:'動画で見る治療の流れ',play:'動画を再生する',scroll:'スクロールで見る',scrollHelp:'スクロールすると動画の最初から最後まで移動します。再生モードでは元の速度で視聴できます。',nativeHelp:'再生ボタンで治療の説明動画をご覧いただけます。',loading:'動画を読み込んでいます。再生ボタンもご利用いただけます。',fallback:'スクロール操作を読み込めませんでした。動画の再生ボタンをご利用ください。',language:'動画内の説明は韓国語です。',related:'関連動画',open:'元の動画を開く',error:'動画を読み込めませんでした。元の動画のリンクをご利用ください。',progress:'動画の再生位置',duration:'治療の説明動画'}
};
function itemsOf(library) { return Array.isArray(library) ? library : library?.items; }
function localText(value, locale) { return typeof value === 'string' ? value : value?.[locale]; }
function localFile(siteRoot, url) {
 const base=path.resolve(siteRoot,'public'),file=path.resolve(base,'.'+url);
 if(!file.startsWith(base+path.sep))throw Error('Local media path leaves public');
 const real=fs.realpathSync(file);
 if(real!==file || !real.startsWith('/Volumes/MSJ_WORK/Workspaces/'))throw Error('Local media path must be a real SSD file without symlinks');
 return real;
}
function reviewValue(record) {
 if(record && typeof record==='object'&&!Array.isArray(record))return record;
 if(typeof record!=='string'||!record.startsWith('/Volumes/MSJ_WORK/Workspaces/')||path.extname(record)!=='.json')throw Error('Excerpt review must be a bound object or SSD JSON record');
 const real=fs.realpathSync(record);if(real!==record)throw Error('Excerpt review symlink is not allowed');
 return JSON.parse(fs.readFileSync(real,'utf8'));
}
function localMediaErrors(m, source, options, digestCache) {
 const errors=[],topic=m.topicId,validTopic=typeof topic==='string'&&/^[A-Z]{3}-\d{3}$/.test(topic),x=m.localExcerpt;
 if(m.localPoster!==undefined && (!validTopic||typeof m.localPoster!=='string'||!new RegExp('^/images/treatment-connect/'+topic+'/[0-9a-f]{12}\\.jpg$').test(m.localPoster)))errors.push('invalid local poster path');
 if(x!==undefined) {
  if(!x||typeof x!=='object'||Array.isArray(x))return [...errors,'invalid localExcerpt'];
  if(!validTopic||typeof x.src!=='string'||!new RegExp('^/videos/treatment-connect/'+topic+'/[0-9a-f]{12}\\.mp4$').test(x.src))errors.push('invalid local excerpt path');
  if(!/^[0-9a-f]{64}$/.test(x.sha256||'')||typeof x.src!=='string'||!x.src.endsWith('/'+x.sha256.slice(0,12)+'.mp4'))errors.push('excerpt filename must match full SHA256');
  if(!/^[0-9a-f]{64}$/.test(x.sourceSha256||''))errors.push('excerpt source SHA256 is required');
  const sourcePrefix=typeof m.videoKey==='string'?/^library\/[A-Z]{3}-\d{3}\/([0-9a-f]{8,16})\.mp4$/.exec(m.videoKey)?.[1]:null;
  if(!sourcePrefix||typeof x.sourceSha256!=='string'||!x.sourceSha256.startsWith(sourcePrefix))errors.push('excerpt source SHA256 does not match original video key');
  if(source?.sha256 && source.sha256!==x.sourceSha256)errors.push('excerpt source SHA256 differs from frozen source');
  if(x.startSeconds!==0||!Number.isFinite(x.endSeconds)||x.endSeconds<=0||x.endSeconds>=m.durationSeconds||!Number.isFinite(x.durationSeconds)||x.durationSeconds<=0||Math.abs(x.durationSeconds-(x.endSeconds-x.startSeconds))>.25)errors.push('excerpt must be a verified initial source interval with measured duration');
  if(!x.reviewRecord||(typeof x.reviewRecord!=='string'&&(typeof x.reviewRecord!=='object'||Array.isArray(x.reviewRecord))))errors.push('excerpt reviewRecord is required');
  if(typeof x.reviewRecord==='string'&&(!x.reviewRecord.startsWith('/Volumes/MSJ_WORK/Workspaces/')||path.extname(x.reviewRecord)!=='.json'))errors.push('excerpt reviewRecord must use an SSD JSON path');
  if(typeof x.reviewRecord==='object'||options.verifyFiles) {
   try {
    const r=reviewValue(x.reviewRecord);
    const expected={topicId:topic,videoKey:m.videoKey,sourceSha256:x.sourceSha256,excerptSha256:x.sha256,startSeconds:x.startSeconds,endSeconds:x.endSeconds,durationSeconds:x.durationSeconds};
    if(r.decision!=='accepted-excerpt'||Object.entries(expected).some(([key,value])=>r[key]!==value))errors.push('excerpt review does not approve these exact source/output bytes and interval');
   } catch(error){errors.push(error.message);}
  }
 }
 if(options.verifyFiles && !errors.length) {
  function digest(url){const file=localFile(options.siteRoot||ROOT,url);if(!digestCache.has(file))digestCache.set(file,sha(fs.readFileSync(file)));return digestCache.get(file);}
  try {
   if(x && digest(x.src)!==x.sha256)errors.push('local excerpt bytes differ from approved SHA256');
   if(m.localPoster && !m.localPoster.endsWith('/'+digest(m.localPoster).slice(0,12)+'.jpg'))errors.push('local poster filename does not match actual SHA256');
  } catch(error){errors.push(error.message);}
 }
 return errors;
}
function validate(data, library, expectedSlugs, options={}) {
 const errors=[]; const items=itemsOf(library),digestCache=new Map();
 if(!data || data.version!==1 || !data.profiles || typeof data.profiles!=='object' || Array.isArray(data.profiles)) return ['Connect video manifest version/profiles are invalid'];
 if(data.mediaOrigin!==undefined && data.mediaOrigin!==ORIGIN) errors.push('Connect media origin must be the approved public origin');
 if(!Array.isArray(items)) return [...errors,'Connect public library snapshot must contain items'];
 const slugs=Object.keys(data.profiles);
 if(expectedSlugs && JSON.stringify([...slugs].sort())!==JSON.stringify([...expectedSlugs].sort())) errors.push('Connect video profiles must cover the exact expected treatment set');
 for(const [slug,profile] of Object.entries(data.profiles)) {
  if(!/^[a-z0-9-]+$/.test(slug) || slug==='index') errors.push('Invalid treatment slug '+slug);
  for(const locale of ['ko','en','ja']) for(const field of ['title','intro']) if(typeof profile?.[field]?.[locale]!=='string' || !profile[field][locale].trim()) errors.push(slug+': missing '+locale+' '+field);
  if(profile?.supplementary!==undefined && !Array.isArray(profile.supplementary)) errors.push(slug+': supplementary must be an array');
  const media=[profile?.primary,...(Array.isArray(profile?.supplementary)?profile.supplementary:[])];
  if(media.length>5) errors.push(slug+': too many videos for one treatment page');
  const seen=new Set();
  for(const m of media) {
   if(!m || typeof m!=='object') {errors.push(slug+': missing primary/media');continue;}
   const topic=m.topicId;
   const validTopic=typeof topic==='string'&&/^[A-Z]{3}-\d{3}$/.test(topic);
   if(!validTopic) errors.push(slug+': invalid topicId');
   if(!validTopic || typeof m.videoKey!=='string' || !new RegExp('^library/'+topic+'/[0-9a-f]{8,16}\\.mp4$').test(m.videoKey)) errors.push(slug+': only original public library MP4 keys are permitted');
   if(m.posterKey!=null && (!validTopic || typeof m.posterKey!=='string' || !new RegExp('^library/'+topic+'/[0-9a-f]{8,16}\\.jpg$').test(m.posterKey))) errors.push(slug+': invalid public poster key');
   if(!Number.isFinite(m.durationSeconds) || m.durationSeconds<=0 || m.durationSeconds>86400) errors.push(slug+': invalid duration');
   if(seen.has(m.videoKey)) errors.push(slug+': repeated video');seen.add(m.videoKey);
   const item=items.find(i=>i?.key===m.libraryKey && i?.topic_id===topic);
   const source=item?.media?.find(x=>x?.media_type==='video' && x?.key===m.videoKey);
   if(!source) errors.push(slug+': video is not present in the frozen public library');
   else {
    if((source.poster_key||null)!==(m.posterKey||null)) errors.push(slug+': poster does not match public library source');
    if(!Number.isFinite(source.duration_seconds) || Math.abs(source.duration_seconds-m.durationSeconds)>0.001) errors.push(slug+': duration does not match public library source');
   }
   errors.push(...localMediaErrors(m,source,options,digestCache).map(message=>slug+': '+message));
   for(const field of ['title','description']) if(m[field]!==undefined && (typeof m[field]!=='object' || ['ko','en','ja'].some(l=>typeof m[field][l]!=='string' || !m[field][l].trim()))) errors.push(slug+': '+field+' must be localized if supplied');
  }
 }
 return errors;
}
function render(profile, locale='ko', slug, library) {
 if(!words[locale]) throw Error('Unsupported Connect video locale');
 const errors=validate({version:1,profiles:{[slug]:profile}},library);if(errors.length)throw Error(errors.join('; '));
 const w=words[locale],items=itemsOf(library);
 function figure(m,primary,index) {
  const item=items.find(i=>i.key===m.libraryKey && i.topic_id===m.topicId);
  const title=localText(m.title,locale)||item.title; const description=localText(m.description,locale)||'';
  const id='tcv-'+slug+'-'+index,videoURL=m.localExcerpt?.src||ORIGIN+'/a/'+m.videoKey,posterURL=m.localPoster||(m.posterKey?ORIGIN+'/a/'+m.posterKey:null);
  const errorText=m.localExcerpt?{ko:'영상을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',en:'The video could not be loaded. Please try again shortly.',ja:'動画を読み込めませんでした。しばらくしてからもう一度お試しください。'}[locale]:w.error;
  return '<figure class="tcv-video '+(primary?'tcv-primary':'tcv-secondary')+'" data-connect-topic="'+escape(m.topicId)+'"><video '+(primary?'data-tcv-primary ':'')+'id="'+id+'" controls playsinline crossorigin="anonymous" preload="none"'+(posterURL?' poster="'+escape(posterURL)+'"':'')+' src="'+escape(videoURL)+'" aria-label="'+escape(title)+'" aria-describedby="'+id+'-caption">'+escape(w.nativeHelp)+'</video><figcaption id="'+id+'-caption"><h3>'+escape(title)+'</h3>'+(description?'<p>'+escape(description)+'</p>':'')+'<p class="tcv-language" lang="'+locale+'">'+escape(w.language)+'</p>'+(m.localExcerpt?'':'<a href="'+ORIGIN+'/a/'+escape(m.videoKey)+'" target="_blank" rel="noopener noreferrer">'+escape(w.open)+'</a>')+'</figcaption><p data-tcv-error hidden role="status">'+escape(errorText)+'</p></figure>';
 }
 const config={locale,durationSeconds:profile.primary.localExcerpt?.durationSeconds||profile.primary.durationSeconds,desktopScrollDefault:true,labels:{...w,...(profile.primary.localExcerpt?{error:{ko:'영상을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',en:'The video could not be loaded. Please try again shortly.',ja:'動画を読み込めませんでした。しばらくしてからもう一度お試しください。'}[locale]}:{})}};
 return '<section class="tcv" id="treatment-connect-video" data-tcv data-connect-profile="'+escape(slug)+'" data-tcv-config="'+escape(JSON.stringify(config))+'" aria-labelledby="tcv-heading"><div class="tcv-wrap"><header class="tcv-heading"><p class="tcv-kicker">'+escape(w.heading)+'</p><h2 id="tcv-heading">'+escape(profile.title[locale])+'</h2><p>'+escape(profile.intro[locale])+'</p></header><div class="tcv-rail" data-tcv-rail><div class="tcv-sticky">'+figure(profile.primary,true,0)+'<div class="tcv-modes" data-tcv-modes hidden><button type="button" data-tcv-play aria-pressed="true">'+escape(w.play)+'</button><button type="button" data-tcv-scroll aria-pressed="false">'+escape(w.scroll)+'</button></div><p class="tcv-hint" data-tcv-hint>'+escape(w.nativeHelp)+'</p><div class="tcv-progress" data-tcv-progress-wrap hidden><progress data-tcv-progress max="1" value="0" aria-label="'+escape(w.progress)+'"></progress><output data-tcv-time>0:00</output></div></div></div>'+(profile.supplementary?.length?'<aside class="tcv-related"><h3>'+escape(w.related)+'</h3><div class="tcv-related-grid">'+profile.supplementary.map((m,i)=>figure(m,false,i+1)).join('')+'</div></aside>':'')+'</div></section>';
}
function assetVersion(siteRoot=ROOT) {return sha(fs.readFileSync(path.join(siteRoot,JS))+ '\n'+fs.readFileSync(path.join(siteRoot,CSS))).slice(0,12);}
function inject(html, slug, locale, data, library, version) {
 if(slug==='index') return html;
 const profile=data?.profiles?.[slug]; if(!profile) return html;
 const errors=validate({version:1,mediaOrigin:data.mediaOrigin,profiles:{[slug]:profile}},library);if(errors.length)throw Error(errors.join('; '));
 const doc=parse(html,{comment:true});const main=doc.querySelector('main'),head=doc.querySelector('head');if(!main||!head)throw Error('Missing main/head for '+slug);
 const journeys=main.querySelectorAll('#tg-journey');if(journeys.length!==1)throw Error('Expected exactly one clinical journey for '+slug);
 for(const old of doc.querySelectorAll('[data-tcv]'))old.remove();
 journeys[0].insertAdjacentHTML('afterend',render(profile,locale,slug,library));
 for(const n of doc.querySelectorAll('script[src],link[href]'))if(/^\/static\/treatment-connect-video\.(?:js|css)(?:\?|$)/.test(n.getAttribute('src')||n.getAttribute('href')||''))n.remove();
 head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="/static/treatment-connect-video.css?v='+escape(version||'1')+'"><script defer src="/static/treatment-connect-video.js?v='+escape(version||'1')+'"></script>');
 return doc.toString();
}
function syncAll({siteRoot=ROOT,destination=siteRoot,expectedSlugs,verifyFiles=true}={}) {
 const dataFile=path.join(siteRoot,DATA); if(!fs.existsSync(dataFile))return {updated:0,profiles:0,skipped:'No Connect video manifest'};
 const data=JSON.parse(fs.readFileSync(dataFile,'utf8')),library=JSON.parse(fs.readFileSync(path.join(siteRoot,LIBRARY),'utf8'));
 const expected=expectedSlugs||Object.keys(JSON.parse(fs.readFileSync(path.join(siteRoot,'src/data/treatment-page-editorial.json'),'utf8')).profiles);
 const errors=validate(data,library,expected,{verifyFiles,siteRoot});if(errors.length)throw Error(errors.join('; '));
 const version=assetVersion(siteRoot);const prepared=[];
 for(const [folder,locale] of [['','ko'],['en','en'],['jp','ja']])for(const slug of Object.keys(data.profiles)) {
  const file=path.join(destination,folder,'treatments',slug+'.html'),before=fs.readFileSync(file,'utf8');const after=inject(before,slug,locale,data,library,version);prepared.push({file,before,after});
 }
 let updated=0;for(const row of prepared)if(row.before!==row.after){fs.writeFileSync(row.file,row.after);updated++;}
 return {updated,profiles:Object.keys(data.profiles).length,pages:prepared.length,version};
}
module.exports={ORIGIN,DATA,LIBRARY,render,inject,validate,syncAll,assetVersion};
if(require.main===module)console.log(JSON.stringify(syncAll({destination:process.argv.includes('--dist')?path.join(ROOT,'dist'):ROOT})));
