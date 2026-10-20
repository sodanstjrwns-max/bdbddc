(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else if(root.document)api.start(root);})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
 function timeLabel(seconds){const n=Math.max(0,Math.floor(seconds||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
 function scrollProgress(railTop,scrollY,railHeight,stickyHeight,top){return Math.max(0,Math.min(1,(scrollY+top-railTop)/Math.max(1,railHeight-stickyHeight)));}
 function targetTime(progress,duration){return Math.max(0,Math.min(Math.max(0,duration-.01),progress*duration));}
 function start(win){const doc=win.document;for(const section of doc.querySelectorAll('[data-tcv]'))init(section,win);}
 function init(section,win){
  if(section.dataset.tcvInitialized)return;section.dataset.tcvInitialized='1';
  let config;try{config=JSON.parse(section.dataset.tcvConfig);}catch{return;}
  const video=section.querySelector('[data-tcv-primary]'),rail=section.querySelector('[data-tcv-rail]'),sticky=section.querySelector('.tcv-sticky'),modes=section.querySelector('[data-tcv-modes]'),play=section.querySelector('[data-tcv-play]'),scrub=section.querySelector('[data-tcv-scroll]'),hint=section.querySelector('[data-tcv-hint]'),progress=section.querySelector('[data-tcv-progress]'),time=section.querySelector('[data-tcv-time]'),progressWrap=section.querySelector('[data-tcv-progress-wrap]');
  if(!video||!rail||!sticky||!modes||!play||!scrub)return;
  const labels=config.labels,reduce=win.matchMedia('(prefers-reduced-motion: reduce)'),desktop=win.matchMedia('(min-width: 900px)');
  function defaultEligible(){return desktop.matches&&win.innerHeight>=640&&!reduce.matches&&!win.navigator.connection?.saveData;}
  let mode='native',loaded=false,userSelected=false,pending=0,lastSeek=0,desired=null,seekStarted=0,metadataTimer=0,wantedDefault=defaultEligible();
  modes.hidden=false;scrub.hidden=reduce.matches;
  function measure(){section.style.setProperty('--tcv-sticky-height',sticky.offsetHeight+'px');section.style.setProperty('--tcv-run',Math.max(1600,Math.min(4200,video.duration*45||2400))+'px');}
  function setMode(next){
   if(next==='scroll'&&reduce.matches)next='native';
   const previousMode=mode,previousTop=sticky.getBoundingClientRect().top;
   mode=next;video.controls=mode==='native';section.dataset.tcvMode=mode;section.classList.toggle('tcv--scroll',mode==='scroll');play.setAttribute('aria-pressed',String(mode==='native'));scrub.setAttribute('aria-pressed',String(mode==='scroll'));progressWrap.hidden=mode!=='scroll';
   hint.textContent=mode==='scroll'?labels.scrollHelp:labels.nativeHelp;
   if(mode==='scroll'){video.pause();measure();schedule();}else{desired=null;seekStarted=0;if(previousMode==='scroll'){const delta=sticky.getBoundingClientRect().top-previousTop;if(Number.isFinite(delta)&&Math.abs(delta)>1)win.scrollBy({top:delta,behavior:'instant'});}}
  }
  function fallback(message){wantedDefault=false;setMode('native');hint.textContent=message||labels.fallback;}
  function environmentChanged(){
   scrub.hidden=reduce.matches;
   if(reduce.matches){fallback(labels.nativeHelp);}
   else if(!userSelected&&!defaultEligible()){wantedDefault=false;if(mode==='scroll')fallback(labels.nativeHelp);}
   if(mode==='scroll'){measure();schedule();}
  }
  function load(){if(loaded)return;loaded=true;video.preload='metadata';video.load();if(wantedDefault)hint.textContent=labels.loading;metadataTimer=win.setTimeout(()=>{if(video.readyState<1&&(wantedDefault||mode==='scroll'))fallback();},10000);}
  function position(){const y=win.scrollY,top=parseFloat(win.getComputedStyle(sticky).top)||0;return scrollProgress(rail.getBoundingClientRect().top+y,y,rail.offsetHeight,sticky.offsetHeight,top);}
  function attemptSeek(){
   if(mode!=='scroll'||desired===null||!Number.isFinite(video.duration)||video.duration<=0)return;
   const now=win.performance.now();
   if(video.seeking){if(seekStarted&&now-seekStarted>5000)fallback();return;}
   if(now-lastSeek<80){schedule();return;}
   const delta=Math.abs(video.currentTime-desired);if(delta<.06)return;
   try{lastSeek=now;seekStarted=now;video.currentTime=desired;}catch{fallback();}
  }
  function update(){pending=0;if(mode!=='scroll')return;desired=targetTime(position(),video.duration);attemptSeek();renderTime();}
  function schedule(){if(!pending)pending=win.requestAnimationFrame(update);}
  function renderTime(){if(!Number.isFinite(video.duration))return;progress.value=Math.min(1,video.currentTime/video.duration);time.textContent=timeLabel(video.currentTime)+' / '+timeLabel(video.duration);section.dataset.tcvCurrentTime=video.currentTime.toFixed(2);section.dataset.tcvSeeking=String(video.seeking);}
  video.addEventListener('loadedmetadata',()=>{win.clearTimeout(metadataTimer);if(!Number.isFinite(video.duration)||video.duration<=0)return fallback();environmentChanged();renderTime();if(wantedDefault&&!userSelected&&defaultEligible()){setMode('scroll');}else if(mode==='scroll'){measure();schedule();}});
  video.addEventListener('seeked',()=>{seekStarted=0;renderTime();if(mode==='scroll')schedule();});
  video.addEventListener('timeupdate',renderTime);
  video.addEventListener('play',()=>{userSelected=true;wantedDefault=false;if(mode==='scroll')setMode('native');});
  video.addEventListener('error',()=>{fallback(labels.error);section.querySelector('.tcv-primary [data-tcv-error]').hidden=false;});
  for(const other of section.querySelectorAll('.tcv-secondary video'))other.addEventListener('error',()=>{other.closest('figure').querySelector('[data-tcv-error]').hidden=false;});
  play.addEventListener('click',()=>{userSelected=true;wantedDefault=false;setMode('native');load();video.play().catch(()=>{hint.textContent=labels.nativeHelp;});});
  scrub.addEventListener('click',()=>{userSelected=true;wantedDefault=false;load();setMode('scroll');});
  win.addEventListener('scroll',schedule,{passive:true});win.addEventListener('resize',environmentChanged,{passive:true});
  reduce.addEventListener('change',environmentChanged);
  desktop.addEventListener('change',environmentChanged);
  win.navigator.connection?.addEventListener?.('change',environmentChanged);
  if('IntersectionObserver'in win){const observer=new win.IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){load();observer.disconnect();}},{rootMargin:'600px 0px'});observer.observe(section);}else load();
  // A stalled seek leaves the current decoded image/poster visible; fall back to controls.
  const watchdog=win.setInterval(()=>{if(mode==='scroll'&&seekStarted&&win.performance.now()-seekStarted>5000)fallback();if(!section.isConnected){win.clearInterval(watchdog);win.clearTimeout(metadataTimer);}},1000);
 }
 return{start,timeLabel,scrollProgress,targetTime};
});
