/* Shared authored assets and lighting for BD Play's Enamel world. */
import * as T from './vendor/three.module.min.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
export {T};
const bank=new Map(), textures=new Map();
export const lowPower=()=>matchMedia('(max-width:700px)').matches;
export function material(color,roughness=.85,metalness=0){return new T.MeshStandardMaterial({color,roughness,metalness});}
export async function loadAssets(names,progress=()=>{}){
 const fractions=new Map(names.map(n=>[n,0]));
 const update=(name,value)=>{fractions.set(name,value);progress([...fractions.values()].reduce((a,b)=>a+b,0)/names.length);};
 const result={};
 await Promise.all(names.map(async name=>{
  if(!bank.has(name))bank.set(name,new GLTFLoader().loadAsync('/assets/arcade-models/'+name+'.glb',e=>update(name,e.total?e.loaded/e.total:.1)).then(gltf=>{
   const root=gltf.scene,bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
   root.position.sub(center);root.position.y+=size.y/2;
   const normalized=new T.Group();normalized.add(root);normalized.scale.setScalar(1/size.y);
   normalized.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.envMapIntensity=.55;m.roughness=Math.max(.5,m.roughness||.5);if(name==='island-tree')m.side=T.DoubleSide;}}});return normalized;
  }).catch(error=>{bank.delete(name);throw error;}));
  result[name]=await bank.get(name);update(name,1);
 }));
 return result;
}
export function instance(assets,name,height=1){const model=assets[name].clone(true);model.scale.multiplyScalar(height);return model;}
export function modelSkin(root,color){root.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.multiply(new T.Color(color));}});}
export async function groundMaterial(name,repeat=1,color=0xffffff){
 const mat=material(color);for(const suffix of ['color','normal']){const url='/assets/enamel-materials/'+name+'-'+suffix+'.jpg';if(!textures.has(url))textures.set(url,new T.TextureLoader().loadAsync(url));const map=(await textures.get(url)).clone();map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(repeat,repeat);map.anisotropy=4;if(suffix==='color'){map.colorSpace=T.SRGBColorSpace;mat.map=map;}else mat.normalMap=map;}
 mat.normalScale.set(.4,.4);return mat;
}
export function litScene(renderer,{night=false,extent=65}={}){
 const scene=new T.Scene(),sky=new T.Mesh(new T.SphereGeometry(450,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{night:{value:night?1:0}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;uniform float night;void main(){vec3 d=normalize(p);float h=clamp(d.y*.7+.25,0.,1.);vec3 c=mix(vec3(.81,.87,.76),vec3(.16,.46,.65),h);c=mix(c,c*vec3(.18,.26,.43),night);float sun=pow(max(dot(d,normalize(vec3(-.6,.6,-.3))),0.),140.);c+=vec3(1.,.79,.43)*sun*(1.-night);gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}`}));
 scene.add(sky);const envScene=new T.Scene();const es=sky.clone();es.scale.setScalar(.04);envScene.add(es);const pm=new T.PMREMGenerator(renderer),env=pm.fromScene(envScene,.02,.1,100);scene.environment=env.texture;scene.environmentIntensity=.8;pm.dispose();
 scene.add(new T.HemisphereLight(night?0x8ebaff:0xedf8e4,night?0x203135:0x637141,night?1.7:1.6));
 const sun=new T.DirectionalLight(night?0xa1dcff:0xffe5b6,night?2:2.8);sun.position.set(-35,60,40);sun.castShadow=true;sun.shadow.mapSize.set(lowPower()?1024:2048,lowPower()?1024:2048);Object.assign(sun.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent,near:1,far:240});sun.shadow.bias=-.0002;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 return {scene,sun,sky,dispose(){env.dispose();sky.geometry.dispose();sky.material.dispose();}};
}
export function addMesh(parent,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
export function ring(parent,radius,color=0xb6f3d5){const mat=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1,roughness:.35,metalness:.2});return addMesh(parent,new T.TorusGeometry(radius,.028,8,48),mat);}
export function forest(parent,assets,placements){
 const oak=assets['island-tree'];oak.updateMatrixWorld(true);const meshes=[];
 oak.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone().applyMatrix4(o.matrixWorld);const mesh=new T.InstancedMesh(geo,o.material,placements.length),d=new T.Object3D();placements.forEach((p,i)=>{d.position.set(p.x,p.y,p.z);d.rotation.set(0,i*2.39,0);d.scale.setScalar(p.size);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);});mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);meshes.push(mesh);});return meshes;
}
export function field(parent,mat,{width=70,depth=70,seed=1,count=3500,skip=()=>false}={}){
 const g=new T.PlaneGeometry(.06,.25,1,4);g.translate(0,.125,0);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const h=p.getY(i)/.25;p.setX(i,p.getX(i)*(1-h)+h*h*.08);p.setZ(i,h*h*.025);}g.computeVertexNormals();
 const m=new T.MeshLambertMaterial({color:0x81a04e,side:T.DoubleSide});const blades=new T.InstancedMesh(g,m,count),d=new T.Object3D();let s=seed;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};let n=0;
 for(let i=0;i<count;i++){const x=(rnd()-.5)*width,z=(rnd()-.5)*depth;if(skip(x,z))continue;d.position.set(x,.015,z);d.rotation.y=rnd()*Math.PI;d.scale.setScalar(.65+rnd());d.updateMatrix();blades.setMatrixAt(n++,d.matrix);}blades.count=n;parent.add(blades);const ground=addMesh(parent,new T.PlaneGeometry(width,depth,1,1),mat);ground.rotation.x=-Math.PI/2;
 const flowers=new T.InstancedMesh(new T.SphereGeometry(.045,5,3),material(0xf3dfab),300);n=0;
 for(let i=0;i<100;i++){const x=(rnd()-.5)*width,z=(rnd()-.5)*depth;if(skip(x,z))continue;for(let j=0;j<3;j++){d.position.set(x+Math.sin(j*2.09)*.035,.13,z+Math.cos(j*2.09)*.035);d.scale.set(1,.3,1);d.updateMatrix();flowers.setMatrixAt(n++,d.matrix);}}flowers.count=n;parent.add(flowers);return ground;
}
export function mountainRidge(parent,z=-80){
 const g=new T.PlaneGeometry(220,36,160,1),a=g.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i);if(a.getY(i)>0)a.setY(i,3+Math.sin(x*.09)**2*6+Math.sin(x*.2)**2*3);else a.setY(i,-20);}
 g.computeVertexNormals();const m=addMesh(parent,g,material(0x779686),0,0,z);m.castShadow=false;return m;
}
export function loadingCard(parent,label='풍경과 캐릭터를 준비하고 있어요'){
 const el=document.createElement('div');el.className='enamel-loading';el.setAttribute('role','status');el.innerHTML='<strong>'+label+'</strong><div><i></i></div><span>0%</span>';parent.append(el);return {update(n){el.querySelector('i').style.width=Math.round(n*100)+'%';el.querySelector('span').textContent=Math.round(n*100)+'%';},finish(){el.remove();},fail(){el.innerHTML='<strong>3D 자료를 불러오지 못했어요.</strong><span>연결을 확인한 뒤 새로고침해 주세요.</span><button type="button">다시 불러오기</button>';el.querySelector('button').onclick=()=>location.reload();},el};
}
