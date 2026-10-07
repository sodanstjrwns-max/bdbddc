/* Flight and Run: authored PBR characters inside a continuous 3D Enamel landscape. */
import {T,loadAssets,instance,material,groundMaterial,litScene,addMesh,ring,forest,field,mountainRidge,loadingCard,lowPower} from './enamel-kit.js?v=20261007b';
const runner=document.body.dataset.arcade==='run',low=lowPower(),U=40;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
let renderer,camera,scene,hero,shield,pulse,terrain,ready=false,impact=0,last=0;
const assetsNeeded=['tooth-hero','cavity-monster','ancient-arch','mossy-cliff','island-tree','tooth-citadel'];
const objects=new Map(),props=[],pooled=new Map();const riverTime={value:0};let assets,stageLight,rockMaterial,character;const charExtras=[];let forestMeshes=[],forestPlacements=[];const treeDummy=new T.Object3D();
const startButton=document.querySelector('.btn-start-game');startButton.disabled=true;
const loader=loadingCard(document.querySelector('.arcade-launch'),'에나멜의 숲과 수호자를 불러오는 중');
const originals={render:window.render,start:window.startGame};
window.startGame=function(){if(!ready)return;originals.start();};
function entity(kind){
 const pool=pooled.get(kind)||[];pooled.set(kind,pool);if(pool.length)return pool.pop();
 const g=new T.Group();g.userData.kind=kind;
 if(kind==='shot'){
  const m=new T.MeshStandardMaterial({color:0xc4fff0,emissive:0x69efca,emissiveIntensity:3});addMesh(g,new T.CapsuleGeometry(.09,.8,3,6),m);return g;
 }
 if(['toothbrush','floss','fluoride'].includes(kind)){
  const crystal=addMesh(g,new T.OctahedronGeometry(.32,1),new T.MeshStandardMaterial({color:kind==='toothbrush'?0xe5c578:kind==='floss'?0x88cfff:0xa4edb0,metalness:.55,roughness:.22,emissive:0x346960,emissiveIntensity:.7}));
  const halo=ring(g,.47,kind==='toothbrush'?0xf7d891:kind==='floss'?0x90d6ff:0xb2f0c9);halo.rotation.x=.45;
  g.userData.crystal=crystal;return g;
 }
 if(kind==='tartar'){
  const rock=addMesh(g,new T.IcosahedronGeometry(.47,2),rockMaterial);rock.scale.set(1,1.1,.85);const face=instance(assets,'cavity-monster',.55);face.position.set(0,-.28,.25);g.add(face);return g;
 }
 const monster=instance(assets,'cavity-monster',1);monster.position.y=-.5;g.add(monster);
 // Each enemy has its own silhouette and colour cues around the same sculpted character.
 if(['sugar','coffee','soda'].includes(kind)){
  const accent=material(kind==='sugar'?0xf1b685:kind==='coffee'?0xa78168:0xb9a0de,.5,.4);
  if(kind==='soda'){const crown=addMesh(g,new T.CylinderGeometry(.35,.42,.16,8),accent,0,.3,0);crown.rotation.z=.2;}
  if(kind==='coffee'){const halo=ring(g,.45,0xd8b385);halo.rotation.x=Math.PI/2;halo.position.y=.1;}
  if(kind==='sugar')for(const x of [-.44,.44])addMesh(g,new T.OctahedronGeometry(.2),accent,x,0,0);
 }
 return g;
}
function placeModel(name,height,x,y,z,angle=0){const g=instance(assets,name,height);g.position.set(x,y,z);g.rotation.y=angle;terrain.add(g);return g;}
async function setup(){
 try{renderer=new T.WebGLRenderer({antialias:!low,powerPreference:'high-performance'});}catch(error){ready=true;startButton.disabled=false;loader.finish();document.body.dataset.renderer='canvas';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,low?1.4:1.75));renderer.domElement.id='arcade3d';renderer.domElement.setAttribute('aria-hidden','true');document.body.insertBefore(renderer.domElement,document.getElementById('gameCanvas'));
 const light=litScene(renderer);scene=light.scene;stageLight=light.sun;light.sky.visible=false;
 const sky=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({depthWrite:false,depthTest:false,vertexShader:'varying vec2 uvSky;void main(){uvSky=uv;gl_Position=vec4(position.xy,.9999,1.);}',fragmentShader:'varying vec2 uvSky;void main(){vec3 c=mix(vec3(.77,.84,.71),vec3(.24,.56,.73),uvSky.y);float sun=1.-smoothstep(.034,.045,length((uvSky-vec2(.23,.79))*vec2(1.5,1.)));c=mix(c,vec3(1.,.90,.69),sun*.9);gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));sky.frustumCulled=false;sky.renderOrder=-10;scene.add(sky);
 camera=new T.OrthographicCamera(-1,1,1,-1,.1,1000);camera.position.set(0,0,100);
 assets=await loadAssets(assetsNeeded,n=>loader.update(n*.85));
 rockMaterial=await groundMaterial('mossy_rock',1,0x9cb1a1);
 const grass=await groundMaterial('grass_ground',12,0xa3b884),stone=await groundMaterial('mossy_sandstone',6,0xd4d0b4);
 terrain=new T.Group();scene.add(terrain);scene.fog=new T.Fog(0xb6ccbc,150,400);
 const treePositions=[];
 if(runner){
  // Long side-on causeway through an actual forest, with ruins beyond the running lane.
  field(terrain,grass,{width:140,depth:68,count:low?2500:8000,skip:(x,z)=>z>1});mountainRidge(terrain,-75).position.y=-10;mountainRidge(terrain,-105).position.y=-8;terrain.position.y=0;
  const road=addMesh(terrain,new T.BoxGeometry(150,.5,3),stone,0,-.17,0);road.receiveShadow=true;
  for(let i=0;i<(low?14:24);i++){
   const x=i*(low?5:6)-70,z=-10-(i%4)*7;treePositions.push({x,y:0,z,size:9+i%4*1.4});
  }
  forestMeshes=forest(terrain,assets,treePositions);forestPlacements=treePositions;
  for(let i=0;i<10;i++){const x=i*16-75;const arch=placeModel('ancient-arch',7.5,x,0,-7-i%2*7,.2);props.push({obj:arch,x,speed:.5,span:160});}
  for(let i=0;i<12;i++){const x=i*14-80;const rock=placeModel('mossy-cliff',2+i%3,x,-.15,-5,2*i);props.push({obj:rock,x,speed:1.3,span:168});}
  placeModel('tooth-citadel',13,18,0,-65,-.2);
 }else{
  // Looking into a river canyon. Banks and islands move below the flight plane.
  terrain.rotation.x=.62;terrain.position.z=-25;
  const floor=new T.Group();floor.position.y=-2;terrain.add(floor);field(floor,grass,{width:130,depth:180,count:low?4000:9000,skip:x=>Math.abs(x)<6.3});
  const riverGeo=new T.PlaneGeometry(12,210,12,120),rp=riverGeo.attributes.position;for(let i=0;i<rp.count;i++)rp.setX(i,rp.getX(i)+Math.sin(rp.getY(i)*.065)*1.4);
  const riverMat=new T.MeshPhysicalMaterial({color:0x559696,roughness:.23,metalness:.4,transparent:true,opacity:.94});
  riverMat.onBeforeCompile=s=>{s.uniforms.riverTime=riverTime;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float riverTime; varying vec3 riverP;').replace('#include <begin_vertex>','#include <begin_vertex>\nriverP=position;transformed.z+=sin(position.y*.9+riverTime*1.5)*.025;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform float riverTime; varying vec3 riverP;').replace('#include <color_fragment>','#include <color_fragment>\nfloat ripple=pow(max(0.,sin(riverP.y*1.8+sin(riverP.x*1.1)+riverTime*2.)),18.);diffuseColor.rgb+=ripple*.009;');};
  const river=addMesh(terrain,riverGeo,riverMat,0,-1.92,0);river.rotation.x=-Math.PI/2;
  for(let i=0;i<(low?26:40);i++){const side=i%2?1:-1,x=side*(9+(i%7)*2.1),z=i*(low?6:4)-85;treePositions.push({x,y:-2,z,size:5+i%4});}
  forest(terrain,assets,treePositions);
  for(let i=0;i<18;i++){const side=i%2?1:-1,x=side*(7+i%3*6),z=i*9-75;const ruin=placeModel(i%3?'mossy-cliff':'ancient-arch',5+i%4,x,-2,z,i*1.3);props.push({obj:ruin,z,span:165,speed:3});}
  placeModel('tooth-citadel',18,0,-2,-90);
 }
 hero=new T.Group();character=instance(assets,'tooth-hero',1);character.position.y=-.5;hero.add(character);scene.add(hero);
 if(runner){
  const crystal=new T.Group();for(const x of [-.42,.42])addMesh(crystal,new T.OctahedronGeometry(.15),new T.MeshStandardMaterial({color:0xaadeff,emissive:0x668bbc,emissiveIntensity:.7,metalness:.5,roughness:.2}),x,.14,.15);hero.add(crystal);charExtras.push(crystal);
  const bracket=new T.Group();addMesh(bracket,new T.BoxGeometry(.53,.025,.04),material(0x91b8c6,.25,.65),0,.2,.4);for(const x of [-.2,0,.2])addMesh(bracket,new T.BoxGeometry(.08,.08,.06),material(0xc3d7dd,.3,.7),x,.2,.41);hero.add(bracket);charExtras.push(bracket);
  const hat=new T.Group();addMesh(hat,new T.ConeGeometry(.3,.4,16),material(0x897dbe,.8),0,.56,0);addMesh(hat,new T.SphereGeometry(.07,8,6),material(0xf1e6c7),0,.79,0);hero.add(hat);charExtras.push(hat);
 }

 if(!runner){const wingMat=material(0xd8e3ca,.65,.05);for(const s of [-1,1]){const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(s*1.0,-.18);shape.lineTo(s*.7,.22);shape.lineTo(0,.42);const wing=addMesh(hero,new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false}),wingMat,s*.16,.12,-.12);wing.rotation.y=s*.16;}}
 shield=ring(scene,.73);pulse=ring(scene,1);pulse.material.transparent=true;pulse.material.opacity=0;
 loader.update(1);size();addEventListener('resize',size);
 renderer.compile(scene,camera);ready=true;startButton.disabled=false;loader.finish();document.body.dataset.renderer='webgl';window.BD_ARCADE_VERSION='2026.10.07-enamel-assets';
 window.render=function(){if(document.body.dataset.renderer!=='webgl')return originals.render();draw();};
 const hit=window.hitPlayer;window.hitPlayer=function(...a){if(!window.player.invincible){impact=1;window.BD_ARCADE_SOUND?.('hit');}return hit(...a);};
 for(const [name,sound] of [['collectItem','item'],[runner?'jump':'fireMissile',runner?'jump':'shot']]){const fn=window[name];window[name]=function(...a){const r=fn(...a);window.BD_ARCADE_SOUND?.(sound);return r;};}
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();renderer.domElement.style.display='none';document.body.dataset.renderer='canvas';if(window.gameRunning&&!window.gamePaused)window.togglePause();});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{renderer.domElement.style.display='';document.body.dataset.renderer='webgl';});
 draw();
}
function size(){
 const w=innerWidth/U,h=innerHeight/U;renderer.setSize(innerWidth,innerHeight);Object.assign(camera,{left:-w/2,right:w/2,top:h/2,bottom:-h/2});camera.updateProjectionMatrix();
 if(runner){terrain.position.y=(innerHeight/2-window.GROUND_Y)/U;terrain.position.z=-15;terrain.rotation.x=.1;}
 if(!runner)terrain.scale.setScalar(Math.min(1.3,innerWidth/U/30));
 stageLight.target.position.set(0,runner?terrain.position.y:0,-10);stageLight.target.updateMatrixWorld();
}
function draw(){
 if(!ready)return;
 const w=window.W,h=window.H,t=window.elapsed/1000,p=window.player,now=performance.now();impact=Math.max(0,impact-(now-last)/1000*3);last=now;
 camera.position.x=reduced?0:Math.sin(now*.05)*impact*.08;camera.position.y=reduced?0:Math.cos(now*.04)*impact*.08;
 const px=runner?p.x+p.w/2:p.x,py=runner?p.y+p.h/2:p.y;
 hero.position.set((px-w/2)/U,(h/2-py)/U,runner?0:5);const heroHeight=p.h/U*1.24;hero.scale.setScalar(heroHeight);
 hero.rotation.set(0,runner?1.1:Math.max(-.55,Math.min(.55,(p.targetX-p.x)*.02)),runner?(p.onGround?Math.sin(t*22)*.055:Math.min(.3,-p.vy*.0004)):Math.sin(t*2)*.025);
 if(runner){charExtras.forEach((m,i)=>m.visible=window.selectedChar===i+1);forestMeshes.forEach(m=>{forestPlacements.forEach((pos,i)=>{treeDummy.position.set(((pos.x-t*.8+70)%140+140)%140-70,pos.y,pos.z);treeDummy.rotation.set(0,i*2.39,0);treeDummy.scale.setScalar(pos.size);treeDummy.updateMatrix();m.setMatrixAt(i,treeDummy.matrix);});m.instanceMatrix.needsUpdate=true;});}
 hero.visible=!p.invincible||p.shieldActive||Math.floor(now/100)%2===0;
 shield.position.copy(hero.position);shield.scale.setScalar(heroHeight);shield.rotation.y=t*.7;shield.visible=p.shieldActive;
 for(const prop of props){if(runner)prop.obj.position.x=((prop.x-t*prop.speed+prop.span/2)%prop.span+prop.span)%prop.span-prop.span/2;else prop.obj.position.z=((prop.z+t*prop.speed+prop.span/2)%prop.span+prop.span)%prop.span-prop.span/2;}
 if(!runner){terrain.position.y=Math.sin(t*.06)*.5;riverTime.value=t;}
 const a=window.arcadePulse;pulse.visible=Boolean(a&&a.until>window.elapsed);if(pulse.visible){const q=1-(a.until-window.elapsed)/650;pulse.position.set((a.x-w/2)/U,(h/2-a.y)/U,8);pulse.scale.setScalar(a.radius/U*q);pulse.material.opacity=1-q;}
 const seen=new Set();
 for(const [entries,kind] of [[runner?window.obstacles:window.enemies,'enemy'],[window.items,'item'],[window.missiles||[],'shot']])for(const e of entries){
  seen.add(e);let obj=objects.get(e);if(!obj){obj=entity(kind==='shot'?'shot':e.type);objects.set(e,obj);scene.add(obj);}
  const x=runner&&kind!=='shot'?e.x+e.w/2:e.x,y=runner&&kind!=='shot'?e.y+e.h/2:e.y;
  obj.position.set((x-w/2)/U,(h/2-y)/U,kind==='item'?4:2);
  if(kind==='shot'){obj.scale.set(e.w/U*1.2,e.h/U,e.w/U*1.2);obj.rotation.z=-(e.angle||0);}else{obj.scale.setScalar(e.h/U*1.22);obj.rotation.set(0,kind==='enemy'?runner?-.65:Math.sin(t+x)*.22:t*.6,kind==='item'?Math.sin(t*2)*.1:Math.sin(t*4+x)*.045);}
  obj.visible=!e.hitFlash||Math.floor(now/45)%2===0;
 }
 for(const [key,obj]of objects)if(!seen.has(key)){scene.remove(obj);pooled.get(obj.userData.kind).push(obj);objects.delete(key);}
 renderer.render(scene,camera);
 const ctx=window.ctx;ctx.clearRect(0,0,w,h);ctx.save();ctx.textAlign='center';
 for(const q of window.particles||[]){ctx.globalAlpha=q.alpha;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,Math.max(.5,q.size||2),0,Math.PI*2);ctx.fill();}
 ctx.font='600 14px Pretendard,sans-serif';for(const f of window.floatingTexts||[]){ctx.globalAlpha=f.alpha;ctx.shadowColor='#142a25';ctx.shadowBlur=5;ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;ctx.shadowBlur=0;
 for(const e of window.items||[]){ctx.fillStyle='#102e29';ctx.font='bold 10px Pretendard,sans-serif';ctx.fillText(e.type==='toothbrush'?'보호막':e.type==='floss'?'전체 정화':'회복',runner?e.x+e.w/2:e.x,(runner?e.y:e.y-e.h/2)-8);}
 if(!runner)for(const e of window.enemies){const max=window.ENEMY_TYPES[e.type]?.hp||1;if(max>1){ctx.fillStyle='#243d3b';ctx.fillRect(e.x-e.w/2,e.y-e.h*.8,e.w,3);ctx.fillStyle='#f6d393';ctx.fillRect(e.x-e.w/2,e.y-e.h*.8,e.w*Math.max(0,e.hp/max),3);}}
 ctx.textAlign='left';ctx.fillStyle='#e6efda';ctx.shadowColor='#182f2a';ctx.shadowBlur=5;ctx.font='600 11px Pretendard,sans-serif';ctx.fillText((runner?'숲의 회랑 / 구간 ':'바람의 협곡 / 웨이브 ')+String(runner?Math.floor(t/15)+1:(window.waveNumber||0)+1).padStart(2,'0'),24,h-28);
 if(!runner&&window.warningTimer>0){ctx.textAlign='center';ctx.font='700 20px Pretendard,sans-serif';ctx.fillStyle='#ffefb2';ctx.fillText(window.warningText,w/2,h*.28);}ctx.restore();
 window.BD_ARCADE_SCENE={version:window.BD_ARCADE_VERSION,models:assetsNeeded,visibleUnits:objects.size,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls};
}
setup().catch(error=>{console.error('[Enamel arcade]',error);loader.fail();});
