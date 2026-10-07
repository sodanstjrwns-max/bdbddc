/* Common opt-in audio and accessible pause controls. No extra analytics. */
(()=>{'use strict';
 let audio, sound=false, lastShot=0;
 const soundButton=document.getElementById('arcadeSound'), pause=document.getElementById('arcadePause');
 window.BD_ARCADE_SOUND=function(kind){
  if(!sound)return;if(kind==='shot'&&performance.now()-lastShot<140)return;lastShot=performance.now();
  try{audio ||= new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();
   const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
   const notes={shot:[740,180,.055],jump:[260,740,.13],hit:[100,40,.18],item:[650,1300,.18],pulse:[150,700,.5],start:[350,700,.2]},v=notes[kind]||notes.start;
   oscillator.type=kind==='hit'?'triangle':'sine';oscillator.frequency.setValueAtTime(v[0],now);oscillator.frequency.exponentialRampToValueAtTime(v[1],now+v[2]);gain.gain.setValueAtTime(.065,now);gain.gain.exponentialRampToValueAtTime(.001,now+v[2]);oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(now+v[2]);
  }catch{sound=false;refresh();}
 };
 function refresh(){if(soundButton){soundButton.textContent=sound?'소리 켜짐':'소리 꺼짐';soundButton.setAttribute('aria-pressed',String(sound));}if(pause){pause.hidden=!window.gameRunning;pause.textContent=window.gamePaused?'계속하기':'일시정지';pause.setAttribute('aria-label',window.gamePaused?'게임 계속하기':'게임 일시정지');}document.body.classList.toggle('arcade-playing',Boolean(window.gameRunning));}
 soundButton?.addEventListener('click',()=>{sound=!sound;refresh();if(sound)window.BD_ARCADE_SOUND('start');});
 pause?.addEventListener('click',()=>{if(window.gameRunning)window.togglePause();refresh();});
 const start=window.startGame;window.startGame=function(){start();document.activeElement?.blur();refresh();window.BD_ARCADE_SOUND('start');};
 const end=window.gameOver;if(end)window.gameOver=function(...args){const r=end(...args);refresh();return r;};
 for(const name of ['togglePause','resumeGame']){const original=window[name];if(original)window[name]=function(...args){const r=original(...args);refresh();return r;};}
 addEventListener('blur',()=>{if(window.keys)window.keys={};window.inputX=null;if(window.gameRunning&&!window.gamePaused)window.togglePause();refresh();});
 document.addEventListener('visibilitychange',refresh);document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key)&&window.gameRunning&&!e.target.closest('button,a,input,textarea'))e.preventDefault();if(e.key==='Escape')queueMicrotask(refresh);});
 refresh();
})();
