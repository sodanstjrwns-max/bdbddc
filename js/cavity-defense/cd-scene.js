/* Real 3D diorama, driven by the existing combat simulation and its exact path coordinates. */
import {T,loadAssets,instance,material,groundMaterial,litScene,addMesh,ring,forest,field,loadingCard,lowPower} from '../arcade/enamel-kit.js?v=20261007b';
export async function createDefenseScene(mount,snapshot,onContextLoss){
 const progress=loadingCard(mount,'에나멜 성채를 준비하고 있어요');let renderer,light,disposed=false;
 try{
 const names=['cavity-monster','brush-turret','tooth-citadel','island-tree','ancient-arch','mossy-cliff'];
 const assets=await loadAssets(names,n=>progress.update(n*.9));
 renderer=new T.WebGLRenderer({antialias:!lowPower(),alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,lowPower()?1.4:1.75));
 renderer.domElement.className='cd-scene';renderer.domElement.setAttribute('aria-hidden','true');mount.prepend(renderer.domElement);
 const initial=snapshot(),night=initial.theme==='night';light=litScene(renderer,{night,extent:60});const scene=light.scene;
 const K=100/Math.hypot(100,140),S=20;
 const camera=new T.OrthographicCamera(-1,1,1,-1,.1,300);camera.position.set(0,100,140);camera.lookAt(0,0,0);
 function point(x,y,height=0){return new T.Vector3((x-initial.width/2)/S,height,(y-initial.height/2)/S/K);}
 const ground=await groundMaterial('grass_ground',9,night?0x789d96:0xa7ba80),stone=await groundMaterial('mossy_sandstone',5,0xc9c5ac),dark=await groundMaterial('mossy_rock',4,0x8c9e86);
 const landscape=new T.Group();scene.add(landscape);field(landscape,ground,{width:100,depth:100,count:lowPower()?3500:8500,skip:(x,z)=>Math.abs(x)<10.5});
 // A real raised island edge and path paving under directional shadows.
 const slab=addMesh(scene,new T.BoxGeometry(25,.9,initial.height/S/K+3),dark,0,-.49,0);slab.receiveShadow=true;
 const pathMat=stone.clone();pathMat.color.set(0xd1ccac);
 for(const path of initial.paths){
  const pts=path.pts;const vertices=[],uv=[];for(let i=0;i<pts.length;i++){const p=point(pts[i].x,pts[i].y,.03),prev=point(pts[Math.max(0,i-1)].x,pts[Math.max(0,i-1)].y),next=point(pts[Math.min(pts.length-1,i+1)].x,pts[Math.min(pts.length-1,i+1)].y);const dx=next.x-prev.x,dz=next.z-prev.z,l=Math.hypot(dx,dz)||1;for(const sign of [-1,1]){vertices.push(p.x+sign*dz/l*.84,.04,p.z-sign*dx/l*.84);uv.push(sign===-1?0:1,i/12);}}
  const indices=[];for(let i=0;i<pts.length-1;i++){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const road=addMesh(scene,geo,pathMat);road.material.side=T.DoubleSide;
 }
 const forestPos=[];for(let i=0;i<22;i++){const side=i%2?1:-1;forestPos.push({x:side*(13+i%4*2.4),y:0,z:-30+Math.floor(i/2)*6,size:7+i%3});}forest(scene,assets,forestPos);
 for(let i=0;i<8;i++){const cliff=instance(assets,'mossy-cliff',3+i%3);cliff.position.set((i%2?1:-1)*12,-.15,-22+Math.floor(i/2)*14);cliff.rotation.y=i*1.2;scene.add(cliff);}
 const entrance=instance(assets,'ancient-arch',5);entrance.position.copy(point(initial.paths[0].pts[0].x,initial.paths[0].pts[0].y+8));scene.add(entrance);
 const castle=instance(assets,'tooth-citadel',4.5);castle.position.copy(point(initial.castle.x,initial.castle.y));scene.add(castle);
 const spotModels=[];const baseMat=stone.clone(),rimMat=material(0xdcc58c,.45,.6);
 for(const sp of initial.spots){const g=new T.Group();g.position.copy(point(sp.x,sp.y));addMesh(g,new T.CylinderGeometry(1.02,1.15,.24,24),baseMat,0,.08,0);const rim=ring(g,1.05,0x9fe8bf);rim.rotation.x=-Math.PI/2;rim.position.y=.21;const flag=addMesh(g,new T.CylinderGeometry(.032,.032,.68,6),rimMat,0,.51,0);const orb=addMesh(g,new T.OctahedronGeometry(.13),rimMat,0,.92,0);scene.add(g);spotModels.push({g,rim,flag,orb});}
 const units=new Map(),hpMat=new T.MeshBasicMaterial({color:0xb9f2aa}),hpBack=new T.MeshBasicMaterial({color:0x263e3b});
 const beam=addMesh(scene,new T.TorusGeometry(1,.04,8,64),new T.MeshBasicMaterial({color:0xb7fadc,transparent:true,opacity:.7}));beam.rotation.x=-Math.PI/2;beam.visible=false;
 function makeUnit(key,isTower){
  const root=new T.Group();let model;
  if(isTower){
   model=instance(assets,'brush-turret',2.4);root.add(model);
   const colors={brush:0xb7e9c8,floss:0xb6e8ff,fluoride:0x84f1c8,rinse:0xb7a5ff,checkup:0xffd68c};const colour=colors[key.typeId]||0xffd68c;
   const halo=ring(root,.9,colour);halo.rotation.x=Math.PI/2;halo.position.y=.26;root.userData.halo=halo;
   if(key.typeId!=='brush'){const crown=addMesh(root,key.typeId==='floss'?new T.TorusGeometry(.38,.06,8,24):new T.OctahedronGeometry(.35,1),material(colour,.35,.6),0,2.5,0);root.userData.crown=crown;}
  }else{
   const height=key.def.boss?3.4:key.def.flying?1.4:1.4;model=instance(assets,'cavity-monster',height);root.add(model);
   if(key.def.boss){const crown=addMesh(root,new T.ConeGeometry(.65,.5,5),material(0xe8c582,.3,.6),0,height,0);crown.rotation.z=Math.PI;}
   if(key.def.flying)for(const side of [-1,1]){const wing=addMesh(root,new T.ConeGeometry(.38,1,3),material(0x836db7),side*.7,.9,0);wing.rotation.z=side*Math.PI/2;}
   const back=new T.Mesh(new T.PlaneGeometry(1.1,.095),hpBack),hp=new T.Mesh(new T.PlaneGeometry(1,.065),hpMat);back.position.y=height+.3;hp.position.set(0,height+.3,.01);back.quaternion.copy(camera.quaternion);hp.quaternion.copy(camera.quaternion);root.add(back,hp);root.userData.hp=hp;
  }
  root.userData.model=model;scene.add(root);return root;
 }
 function resize(){const w=mount.clientWidth,h=mount.clientHeight;if(w<1||h<1)return;renderer.setSize(w,h);const fit=Math.min(w/initial.width,h/initial.height),vw=w/fit/S,vh=h/fit/S;camera.left=-vw/2;camera.right=vw/2;camera.top=vh/2;camera.bottom=-vh/2;camera.updateProjectionMatrix();}
 function render(){
  if(disposed)return;const s=snapshot(),seen=new Set();
  s.spots.forEach((sp,i)=>{const a=spotModels[i];a.flag.visible=a.orb.visible=!sp._occupied;a.rim.material.emissiveIntensity=sp._corrupted?.05:sp._occupied?.4:1.1;a.rim.rotation.z=s.elapsed*.15;a.orb.position.y=.88+Math.sin(s.elapsed*2+i)*.06;});
  for(const [entities,isTower]of [[s.towers,true],[s.enemies,false]])for(const e of entities){seen.add(e);let obj=units.get(e);if(!obj){obj=makeUnit(e,isTower);units.set(e,obj);}obj.position.copy(point(e.spr.x,e.spr.y,isTower?.15:e.def.flying?.7:0));
   if(isTower){const nearest=s.enemies.filter(x=>x.alive).sort((a,b)=>Math.hypot(a.spr.x-e.spr.x,a.spr.y-e.spr.y)-Math.hypot(b.spr.x-e.spr.x,b.spr.y-e.spr.y))[0];if(nearest){const p=point(nearest.spr.x,nearest.spr.y);obj.userData.model.rotation.y=Math.atan2(p.x-obj.position.x,p.z-obj.position.z);}obj.userData.model.scale.setScalar(assets['brush-turret'].scale.x*2.4*(1+e.level*.14));obj.userData.model.rotation.z=e._swingT>0?Math.sin(s.elapsed*30)*.18:0;if(obj.userData.crown)obj.userData.crown.rotation.y=s.elapsed;
   }else{const pos=e.path.at(e.dist+2);obj.userData.model.rotation.y=Math.atan2((pos.x-e.spr.x), (pos.y-e.spr.y)/K);obj.userData.model.rotation.z=Math.sin(e.wob)*.055;obj.userData.hp.scale.x=Math.max(.02,e.hp/e.maxHp);obj.visible=!e.def.stealth||e._detected||Math.sin(s.elapsed*4)>.1;}
  }
  for(const [e,obj]of units)if(!seen.has(e)){scene.remove(obj);disposeUnique(obj);units.delete(e);}
  beam.visible=s.brushActive>0;if(beam.visible){beam.position.set(0,.35,point(0,s.brushY).z);beam.scale.set(12,2,1);}
  light.sun.intensity=(night?2:2.8)-s.waveProgress*.5;renderer.render(scene,camera);
  window.BD_DEFENSE_SCENE={models:names,units:units.size,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,version:'2026.10.07-enamel-assets'};
 }
 const sharedGeometries=new Set(),sharedMaterials=new Set();for(const root of Object.values(assets))root.traverse(o=>{if(o.isMesh){sharedGeometries.add(o.geometry);sharedMaterials.add(o.material);}});
 function disposeUnique(root){root.traverse(o=>{if(!o.isMesh)return;if(!sharedGeometries.has(o.geometry))o.geometry.dispose();if(!sharedMaterials.has(o.material)&&o.material!==hpMat&&o.material!==hpBack&&o.material!==baseMat&&o.material!==rimMat)o.material.dispose();});}
 const contextLost=e=>{e.preventDefault();if(!disposed)onContextLoss();};renderer.domElement.addEventListener('webglcontextlost',contextLost);
 resize();renderer.compile(scene,camera);render();progress.finish();
 return {render,resize,destroy(){if(disposed)return;disposed=true;renderer.domElement.removeEventListener('webglcontextlost',contextLost);disposeUnique(scene);for(const m of [ground,stone,dark]){m.map?.dispose();m.normalMap?.dispose();m.dispose();}hpMat.dispose();hpBack.dispose();baseMat.dispose();rimMat.dispose();light.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
 }catch(error){progress.finish();renderer?.dispose();renderer?.domElement.remove();light?.dispose();throw error;}
}
