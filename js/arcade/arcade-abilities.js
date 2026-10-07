/* Flight: a player-triggered, rechargeable rescue pulse. Score uses the same kill path. */
(()=>{'use strict';
 const pulse=window.arcadePulse={charge:100,until:0,x:0,y:0,radius:220};
 const button=document.createElement('button');button.id='arcadePulse';button.className='arcade-pulse';button.hidden=true;button.type='button';document.body.appendChild(button);
 let lastKills=0,lastLabel='';
 function refresh(){
  button.hidden=!window.gameRunning;button.disabled=pulse.charge<100||window.gamePaused;
  const label=pulse.charge>=100?'충격파 준비 완료 · E':'충격파 충전 '+Math.floor(pulse.charge)+'%';
  if(label!==lastLabel){button.textContent=label;button.setAttribute('aria-label',label);lastLabel=label;}
  button.style.setProperty('--charge',pulse.charge+'%');
 }
 function activate(){
  if(!window.gameRunning||window.gamePaused||pulse.charge<100)return;
  pulse.charge=0;pulse.x=window.player.x;pulse.y=window.player.y;pulse.until=window.elapsed+650;
  window.player.shieldActive=true;window.player.shieldTimer=Math.max(window.player.shieldTimer,1200);window.player.invincible=true;
  // Snapshot first: coffee fragments created by a kill cannot be hit again by this pulse.
  const targets=window.enemies.filter(e=>Math.hypot(e.x-pulse.x,e.y-pulse.y)<=pulse.radius);
  for(const enemy of targets){const index=window.enemies.indexOf(enemy);if(index<0)continue;enemy.hp-=4;enemy.hitFlash=150;if(enemy.hp<=0)window.destroyEnemyAt(index);}
  lastKills=window.killCount;window.spawnHitParticles(pulse.x,pulse.y,'#9ef0dc');window.addFloatingText(pulse.x,pulse.y-50,'PULSE','#e5f8d6');window.BD_ARCADE_SOUND?.('pulse');refresh();
 }
 button.addEventListener('click',activate);
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e'&&!e.repeat&&!e.target.closest('input,textarea,button,a')){e.preventDefault();activate();}});
 const update=window.update;window.update=function(dt){update(dt);pulse.charge=Math.min(100,pulse.charge+dt*.004+Math.max(0,window.killCount-lastKills)*6);lastKills=window.killCount;refresh();};
 const start=window.startGame;window.startGame=function(){pulse.charge=100;pulse.until=0;lastKills=0;start();refresh();};
 const over=window.gameOver;window.gameOver=function(...a){over(...a);refresh();};
 for(const name of ['togglePause','resumeGame']){const original=window[name];window[name]=function(...a){original(...a);refresh();};}
 const render=window.render;window.render=function(){render();if(pulse.until>window.elapsed){const t=1-(pulse.until-window.elapsed)/650,c=window.ctx;c.save();c.globalAlpha=1-t;c.strokeStyle='#abffe7';c.shadowColor='#71dccc';c.shadowBlur=16;c.lineWidth=5;c.beginPath();c.arc(pulse.x,pulse.y,pulse.radius*t,0,Math.PI*2);c.stroke();c.restore();}};
 refresh();
})();
