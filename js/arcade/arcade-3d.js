/* BD PLAY / 2026.10 — Three.js 0.180.0, local assets, original collision rules. */
import * as T from './vendor/three.module.min.js';
const runner = document.body.dataset.arcade === 'run';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const low = matchMedia('(max-width: 700px)').matches;
const colors = { ivory:0xe9f6ee, cyan:0x5ef1d6, amber:0xffc276, coral:0xff716b, violet:0xa28bff };
let enabled = false, renderer, camera, scene, hero, shield, shockwave, floor, landscape, tLast=0, impact=0;
const objects = new Map(), pools = new Map(), scenery=[];
const mat = (c,metal=.1,rough=.4)=>new T.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
const enamel=mat(colors.ivory,.18,.22), dark=mat(0x132a38,.4,.3), gold=mat(colors.amber,.55,.25);
const skins=[enamel,mat(0xb4e8fb,.65,.12),enamel,mat(0xd7cbf5,.12,.4)];
const cyan=new T.MeshStandardMaterial({color:colors.cyan,emissive:colors.cyan,emissiveIntensity:1.4});
const geo={sphere:new T.SphereGeometry(1,14,10), rock:new T.IcosahedronGeometry(1,0), box:new T.BoxGeometry(1,1,1), ring:new T.TorusGeometry(1,.035,6,40), spike:new T.ConeGeometry(.15,.6,5)};
function mesh(g,m,x=0,y=0,z=0,sx=1,sy=sx,sz=sx){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;}
function makeTooth(){
 const group=new T.Group(), shape=new T.Shape();
 shape.moveTo(-.02,.64);shape.bezierCurveTo(-.78,1.02,-.92,.2,-.54,-.4);shape.bezierCurveTo(-.42,-1,-.2,-1,-.12,-.44);shape.bezierCurveTo(-.06,-.24,.06,-.24,.12,-.44);shape.bezierCurveTo(.2,-1,.42,-1,.54,-.4);shape.bezierCurveTo(.92,.2,.78,1.02,-.02,.64);
 const g=new T.ExtrudeGeometry(shape,{depth:.36,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.13,bevelThickness:.13,curveSegments:10});g.translate(0,0,-.15);
 group.add(mesh(g,enamel));
 for(const x of [-.25,.25]){group.add(mesh(geo.sphere,dark,x,.25,.38,.055,.09,.035));group.add(mesh(geo.sphere,cyan,x+.012,.28,.415,.018));}
 const smile=new T.Mesh(new T.TorusGeometry(.14,.018,5,16,Math.PI),dark);smile.rotation.z=Math.PI;smile.position.set(0,.07,.39);group.add(smile);
 if(runner){const bracket=new T.Group();bracket.name='bracket';bracket.add(mesh(geo.box,gold,0,.1,.47,.75,.025,.04));for(const x of [-.25,0,.25])bracket.add(mesh(geo.box,dark,x,.1,.47,.13,.15,.06));group.add(bracket);}
 if(!runner){for(const x of [-.48,.48]){group.add(mesh(geo.box,gold,x,-.05,-.06,.28,.65,.36));group.add(mesh(geo.sphere,cyan,x,-.5,-.04,.12,.28,.12));}}
 return group;
}
const models=new Map();
function prototype(type){
 if(models.has(type))return models.get(type);
 const g=new T.Group(); let m;
 if(type==='hero')return makeTooth();
 if(['toothbrush','floss','fluoride'].includes(type)){
  g.add(mesh(geo.ring,cyan,0,0,0,.64));
  if(type==='toothbrush'){g.add(mesh(geo.box,gold,0,-.05,0,.12,.9,.14));g.add(mesh(geo.box,enamel,.08,.35,.05,.34,.28,.16));}
  else if(type==='floss'){g.add(mesh(geo.box,enamel,0,0,0,.6,.55,.25));g.add(mesh(geo.ring,cyan,0,.15,.15,.22));}
  else {g.add(mesh(geo.box,enamel,0,0,.04,.48,.16,.2));g.add(mesh(geo.box,enamel,0,0,.04,.16,.48,.2));}
 } else if(type==='shot'){g.add(mesh(geo.sphere,cyan,0,0,0,.18,1,.18));}
 else if(type==='sugar'){m=mat(colors.coral,.3,.15);g.add(mesh(geo.rock,m,0,0,0,.52));for(const x of [-.58,.58])g.add(mesh(geo.rock,gold,x,0,0,.22));}
 else if(type==='soda'||type==='coffee'){
  m=mat(type==='coffee'?0x9b6e51:colors.coral,.6,.22);g.add(mesh(new T.CylinderGeometry(.35,.28,.9,12),m));g.add(mesh(new T.CylinderGeometry(.38,.38,.08,12),gold,0,.48,0));g.add(mesh(geo.box,cyan,.1,.66,0,.06,.35,.06));
 } else if(type==='tartar'){
  m=mat(0x947fc1,.35,.65);g.add(mesh(geo.rock,m,0,0,0,.62));g.add(mesh(geo.rock,gold,-.32,.14,.13,.2));g.add(mesh(geo.rock,enamel,.28,.25,.16,.17));
 } else {
  m=mat(type==='plaque'?0x8c8cff:0x44c9b0,.18,.3);g.add(mesh(geo.sphere,m,0,0,0,.48));
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const s=mesh(geo.spike,m,Math.sin(a)*.52,Math.cos(a)*.52,0);s.rotation.z=-a;g.add(s);}
  for(const x of [-.17,.17]){g.add(mesh(geo.sphere,enamel,x,.08,.43,.12));g.add(mesh(geo.sphere,dark,x,.05,.54,.055));}
 }
 models.set(type,g);return g;
}
function get(type){const pool=pools.get(type)||[];pools.set(type,pool);const o=pool.pop()||prototype(type).clone(true);o.userData.kind=type;scene.add(o);return o;}
function release(o){scene.remove(o);pools.get(o.userData.kind).push(o);}
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),r=x.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.2,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=r;x.fillRect(0,0,64,64);return new T.CanvasTexture(c);}
const glowMap=glowTexture();
const sparkGeometry=new T.BufferGeometry(), sparkPositions=new Float32Array(120*3),sparkColors=new Float32Array(120*3);
sparkGeometry.setAttribute('position',new T.BufferAttribute(sparkPositions,3));sparkGeometry.setAttribute('color',new T.BufferAttribute(sparkColors,3));
const sparks=new T.Points(sparkGeometry,new T.PointsMaterial({size:16,map:glowMap,transparent:true,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending,sizeAttenuation:false}));
function setup(){
 try{renderer=new T.WebGLRenderer({antialias:!low,alpha:false,powerPreference:'high-performance'});}catch(e){document.body.dataset.renderer='canvas';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,low?1.5:2));renderer.setClearColor(runner?0x0d2631:0x060e1c);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 renderer.domElement.id='arcade3d';renderer.domElement.setAttribute('aria-hidden','true');document.body.insertBefore(renderer.domElement,document.getElementById('gameCanvas'));
 scene=new T.Scene();camera=new T.OrthographicCamera(-innerWidth/2,innerWidth/2,innerHeight/2,-innerHeight/2,.1,3000);camera.position.z=1000;
 const landscapeTexture=new T.TextureLoader().load('/images/arcade/enamel-valley.webp');landscapeTexture.colorSpace=T.SRGBColorSpace;
 landscape=mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:landscapeTexture,color:runner?0x839da5:0x456579,depthWrite:false,toneMapped:false}),0,0,-700);scene.add(landscape);
 scene.add(new T.HemisphereLight(0x8acdd7,0x16243d,2));const key=new T.DirectionalLight(0xffe2bc,3.4);key.position.set(-250,400,500);scene.add(key);const rim=new T.DirectionalLight(0x55dbdc,3);rim.position.set(350,-100,-100);scene.add(rim);
 hero=makeTooth();scene.add(hero);shield=mesh(geo.ring,cyan);scene.add(shield,sparks);shockwave=mesh(geo.ring,new T.MeshBasicMaterial({color:0xb7ffe6,transparent:true,opacity:0,depthWrite:false}));scene.add(shockwave);
 // Distant rotating enamel portals and suspended canyon pillars.
 for(let i=0;i<10;i++){
  const g=new T.Group(),h=100+(i%4)*35;
  const basalt=mat(i%2?0x243b47:0x1b3547,.15,.9),moss=mat(0x41625e,.1,.8);
  g.add(mesh(geo.rock,basalt,0,-12,0,65,45,55));g.add(mesh(new T.CylinderGeometry(49,38,9,7),moss,0,19,0));
  for(let j=0;j<3;j++){const crystal=mesh(new T.OctahedronGeometry(1),j===1?cyan:gold,-24+j*22,30+j*3,6,4,14+j*4,4);g.add(crystal);}
  g.rotation.set(.3,.35,.02);g.userData={index:i,h:50};scene.add(g);scenery.push(g);
 }
 const portal=new T.Group();for(let i=0;i<3;i++){const r=mesh(geo.ring,new T.MeshBasicMaterial({color:i===1?0xc38b53:0x2b7d87,transparent:true,opacity:.3}),0,0,0,125+i*35);r.rotation.x=.2*i;portal.add(r);}portal.position.z=-250;scene.add(portal);scenery.push(portal);
 floor=mesh(geo.box,mat(0x122c37,.55,.3),0,0,-30);scene.add(floor);const edge=mesh(geo.box,gold,0,.5,.55,1,.02,1);edge.name='edge';floor.add(edge);
 const starP=new Float32Array(130*3);for(let i=0;i<130;i++){starP[i*3]=(Math.random()-.5)*2600;starP[i*3+1]=(Math.random()-.5)*2400;starP[i*3+2]=-450;}
 const sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(starP,3));const stars=new T.Points(sg,new T.PointsMaterial({color:0x73d6cf,size:2,transparent:true,opacity:.5}));scene.add(stars);
 enabled=true;document.body.dataset.renderer='webgl';window.BD_ARCADE_VERSION='2026.10.07-3d';
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();enabled=false;renderer.domElement.style.display='none';document.body.dataset.renderer='canvas';if(window.gameRunning&&!window.gamePaused)window.togglePause?.();});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{enabled=true;renderer.domElement.style.display='';document.body.dataset.renderer='webgl';});
 function size(){renderer.setSize(innerWidth,innerHeight);camera.left=-innerWidth/2;camera.right=innerWidth/2;camera.top=innerHeight/2;camera.bottom=-innerHeight/2;camera.updateProjectionMatrix();const bh=Math.max(innerHeight*1.08,innerWidth/1.5*1.08);landscape.scale.set(bh*1.5,bh,1);}
 size();addEventListener('resize',size);
 const oldRender=window.render;window.render=function(){if(!enabled)return oldRender();draw();};
 const hit=window.hitPlayer;window.hitPlayer=function(...args){if(!window.player.invincible){impact=1;window.BD_ARCADE_SOUND?.('hit');}return hit(...args);};
 const collect=window.collectItem;window.collectItem=function(...args){window.BD_ARCADE_SOUND?.('item');return collect(...args);};
 if(runner){const jump=window.jump;window.jump=function(){const before=window.player.vy;jump();if(before!==window.player.vy){window.BD_ARCADE_SOUND?.('jump');if(window.player.jumps===2){window.spawnHitParticles?.(window.player.x+window.player.w/2,window.player.y+window.player.h,'#a3f6de');window.addFloatingText?.(window.player.x+window.player.w/2,window.player.y-16,'AIR JUMP','#d8f6df');}}};}
 else{const fire=window.fireMissile;window.fireMissile=function(){fire();window.BD_ARCADE_SOUND?.('shot');};}
}
function draw(){
 const w=window.W,h=window.H,time=window.elapsed/1000,p=window.player;
 const now=performance.now(),dt=Math.min((now-tLast)/1000,.05);tLast=now;impact=Math.max(0,impact-dt*3);
 camera.position.x=reduced?0:Math.sin(now*.07)*impact*3;camera.position.y=reduced?0:Math.cos(now*.05)*impact*2;
 const px=runner?p.x+p.w/2:p.x, py=runner?p.y+p.h/2:p.y;
 landscape.position.x=reduced?0:Math.sin(time*.025)*Math.min(32,(landscape.scale.x-w)*.35);landscape.position.y=reduced?0:Math.sin(time*.018)*8;
 if(runner){hero.children[0].material=skins[window.selectedChar]||enamel;hero.getObjectByName('bracket').visible=window.selectedChar===2;}
 hero.position.set(px-w/2,h/2-py,15);hero.scale.setScalar(p.w*.58);hero.rotation.set(.1,runner?.35:Math.max(-.5,Math.min(.5,(p.targetX-p.x)*.018)),runner?(p.onGround?Math.sin(time*22)*.08:Math.min(.35,-p.vy*.0004)):0);
 hero.visible=!p.invincible||p.shieldActive||Math.floor(now/100)%2===0;
 const pulse=window.arcadePulse;shockwave.visible=Boolean(pulse&&pulse.until>window.elapsed);if(shockwave.visible){const q=1-(pulse.until-window.elapsed)/650;shockwave.position.set(pulse.x-w/2,h/2-pulse.y,40);shockwave.scale.setScalar(pulse.radius*q);shockwave.material.opacity=1-q;}
 shield.position.copy(hero.position);shield.scale.setScalar(35+Math.sin(time*4)*2);shield.visible=p.shieldActive;
 for(let i=0;i<10;i++){const o=scenery[i];if(runner){o.position.set(((i*185-time*26)%(w+350)+w+350)%(w+350)-w/2-175,h/2-window.GROUND_Y+o.userData.h/2-10,-130-i*4);}else{o.position.set((i%2?1:-1)*(w*.37+35),((i*165+time*48)%(h+300))-h/2-150,-150);o.rotation.z=Math.sin(time*.15+i)*.06;}}
 const portal=scenery[10];portal.position.set(0,h*.26,-250);portal.scale.setScalar(.55);portal.visible=!runner;portal.rotation.z=reduced?0:time*.06;
 floor.visible=runner;if(runner){floor.position.set(0,h/2-window.GROUND_Y-(h-window.GROUND_Y)/2,-35);floor.scale.set(w,h-window.GROUND_Y,70);}
 const seen=new Set();
 for(const [entries,kind] of [[runner?window.obstacles:window.enemies,'enemy'],[window.items,'item'],[window.missiles||[],'shot']]){
  for(const e of entries){
   seen.add(e);let obj=objects.get(e);if(!obj){obj=get(kind==='shot'?'shot':e.type);objects.set(e,obj);}
   const x=runner&&kind!=='shot'?e.x+e.w/2:e.x,y=runner&&kind!=='shot'?e.y+e.h/2:e.y;
   obj.position.set(x-w/2,h/2-y,kind==='item'?25:0);
   if(kind==='shot'){obj.scale.set(e.w,e.h*.9,e.w);obj.rotation.z=-(e.angle||0);}else{obj.scale.setScalar(e.w*.78);obj.rotation.set(.22,Math.sin(time*1.5+x)*.4,kind==='item'?Math.sin(time*2)*.1:e.rotation*.25);}
   obj.visible=!e.hitFlash||Math.floor(now/45)%2===0;
  }
 }
 for(const [e,obj]of objects)if(!seen.has(e)){release(obj);objects.delete(e);}
 const ps=window.particles||[];sparkGeometry.setDrawRange(0,Math.min(ps.length,120));
 for(let i=0;i<Math.min(ps.length,120);i++){const q=ps[i];sparkPositions.set([q.x-w/2,h/2-q.y,50],i*3);const c=new T.Color(q.color);sparkColors.set([c.r*q.alpha,c.g*q.alpha,c.b*q.alpha],i*3);}
 sparkGeometry.attributes.position.needsUpdate=true;sparkGeometry.attributes.color.needsUpdate=true;renderer.render(scene,camera);
 const ctx=window.ctx;ctx.clearRect(0,0,w,h);
 // Crisp readable labels over the actual 3D scene; never alter collision positions.
 ctx.save();ctx.textAlign='center';ctx.font='600 14px Pretendard, sans-serif';
 for(const f of window.floatingTexts||[]){ctx.globalAlpha=f.alpha;ctx.shadowColor='#03121c';ctx.shadowBlur=5;ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;ctx.shadowBlur=0;
 if(!runner)for(const e of window.enemies){const max=window.ENEMY_TYPES[e.type]?.hp||1;if(max>1){ctx.fillStyle='#10252a';ctx.fillRect(e.x-e.w/2,e.y-e.h/2-8,e.w,3);ctx.fillStyle='#7ae3c9';ctx.fillRect(e.x-e.w/2,e.y-e.h/2-8,e.w*Math.max(0,e.hp/max),3);}}
 const phase=runner?Math.floor(time/15)+1:(window.waveNumber||0)+1;
 ctx.textAlign='left';ctx.fillStyle='#b4d5d3';ctx.font='500 11px Pretendard,sans-serif';ctx.fillText((runner?'ENAMEL VALLEY / 구간 ':'ORBIT / 웨이브 ')+String(phase).padStart(2,'0'),24,h-30);
 if(!runner&&window.warningTimer>0){ctx.textAlign='center';ctx.fillStyle='#ffd398';ctx.font='700 20px Pretendard,sans-serif';ctx.fillText(window.warningText,w/2,h*.28);}
 ctx.restore();
}
setup();
