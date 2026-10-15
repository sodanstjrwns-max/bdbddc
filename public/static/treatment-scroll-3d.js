import * as THREE from '/js/arcade/vendor/three.module.min.js';

// Real, locally rendered 3D teaching models. No external assets, telemetry or render loop.
let active = null;
const clamp = value => Math.max(0, Math.min(1, value));
const ease = (p, a = 0, b = 1) => { const t = clamp((p - a) / Math.max(.001, b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

export function createTreatmentScene({ host, sceneName, variant = '', onError = () => {} }) {
  if (active) active.dispose();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 761 ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xf7f7f0, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'bd-scroll-canvas';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(5.8, 3.8, 12.5);
  const aim = new THREE.Vector3(0, -.25, 0);
  const world = new THREE.Group();
  scene.add(world);
  const resources = new Set();
  const updates = [];
  let progress = 0, disposed = false;
  const own = value => { resources.add(value); return value; };
  const material = options => own(new THREE.MeshPhysicalMaterial(options));
  const enamel = material({ color: 0xfff5df, roughness: .23, metalness: 0, clearcoat: .42, clearcoatRoughness: .16, ior: 1.48 });
  const rootMaterial = material({ color: 0xdec7a0, roughness: .56, metalness: 0 });
  const gumMaterial = material({ color: 0xc88d87, roughness: .62, metalness: 0, clearcoat: .08 });
  const boneMaterial = material({ color: 0xdccbaf, roughness: .82 });
  const titanium = material({ color: 0xa7b9b6, roughness: .3, metalness: .88, clearcoat: .16 });
  const titaniumDark = material({ color: 0x627e78, roughness: .38, metalness: .82 });
  const gold = material({ color: 0xc1a160, roughness: .32, metalness: .65 });
  const sage = material({ color: 0x658d7c, roughness: .54 });
  const pulpMaterial = material({ color: 0xc5796c, roughness: .63 });
  const transparent = material({ color: 0xc4e5e7, roughness: .12, metalness: 0, transparent: true, opacity: .34, depthWrite: false, clearcoat: .75, side: THREE.DoubleSide });
  const dark = material({ color: 0x584c37, roughness: .9 });
  const neutral = material({ color: 0xded9c8, roughness: .62 });
  const shadowMaterial = own(new THREE.ShadowMaterial({ color: 0x41503a, opacity: .08 }));
  const floor = new THREE.Mesh(own(new THREE.PlaneGeometry(60, 60)), shadowMaterial);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.55; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight(0xfffcf2, 0xaabda3, .9));
  const key = new THREE.DirectionalLight(0xfff5dc, 2.7);key.position.set(-5, 9, 7);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:30});key.shadow.bias=-.001;key.shadow.normalBias=.04;key.shadow.radius=6;scene.add(key);
  const fill = new THREE.DirectionalLight(0xdeeee8, .8);fill.position.set(7,4,2);scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);rim.position.set(1,5,-7);scene.add(rim);

  function mesh(geometry, mat, parent = world) { const m = new THREE.Mesh(own(geometry), mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m; }
  function sphere(radius, mat, parent=world, scale=[1,1,1]) { const m=mesh(new THREE.SphereGeometry(radius,40,28),mat,parent);m.scale.set(...scale);return m; }
  function cylinder(top,bottom,height,mat,parent=world){return mesh(new THREE.CylinderGeometry(top,bottom,height,48,1,false),mat,parent);}
  function tube(points,radius,mat,parent=world){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),80,radius,12,false),mat,parent);}
  function roundedBox(w,h,d,r,mat,parent=world){
    const s=new THREE.Shape(),x=-w/2,y=-h/2,rr=Math.min(r,w/2,h/2);s.moveTo(x+rr,y);s.lineTo(x+w-rr,y);s.quadraticCurveTo(x+w,y,x+w,y+rr);s.lineTo(x+w,y+h-rr);s.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);s.lineTo(x+rr,y+h);s.quadraticCurveTo(x,y+h,x,y+h-rr);s.lineTo(x,y+rr);s.quadraticCurveTo(x,y,x+rr,y);
    const geo=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:Math.min(.08,r/3),bevelThickness:.05,bevelSegments:3,curveSegments:16,steps:1});geo.translate(0,0,-d/2);return mesh(geo,mat,parent);
  }
  // Smooth superelliptic crown with a shallow occlusal groove and rounded cusps.
  function crownGeometry(w=1,d=.9,h=1.05,incisor=false){
    const vertices=[],indices=[],segments=64,rings=34;
    for(let j=0;j<=rings;j++){
      const t=j/rings;
      for(let i=0;i<=segments;i++){
        const a=i/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
        let radius,y;
        if(t<.72){const q=t/.72;radius=.78+.22*Math.sin(q*Math.PI*.73);y=q*h*.88;}
        else{const q=(t-.72)/.28;radius=Math.cos(q*Math.PI/2)*.95;y=h*(.88+.105*Math.sin(q*Math.PI/2));}
        let x=Math.sign(c)*Math.pow(Math.abs(c),incisor?.88:.82)*w*.5*radius;
        let z=Math.sign(s)*Math.pow(Math.abs(s),incisor?.88:.8)*d*.5*radius;
        z+=Math.sign(s)*d*.025*Math.sin(t*Math.PI)*Math.pow(Math.cos(a),2);
        if(t>.65&&!incisor){const edge=Math.sin(clamp((t-.65)/.35)*Math.PI);y+=h*.045*Math.cos(a*4)*edge;y-=h*.027*Math.exp(-Math.pow(x/(w*.07),2))*edge;}
        if(incisor)y+=h*.015*Math.cos(a*2)*Math.sin(t*Math.PI);
        vertices.push(x,y,z);
      }
    }
    for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  }
  function tooth({parent=world,x=0,y=0,z=0,scale=1,incisor=false,roots=true,mat=enamel}={}){
    const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(scale);
    mesh(crownGeometry(incisor?.8:1.04,incisor?.65:.92,incisor?1.2:1.02,incisor),mat,g);
    if(roots){const rootsCount=incisor?1:2;for(let i=0;i<rootsCount;i++){const off=rootsCount===1?0:(i-.5)*.42;const pts=[];for(let j=0;j<=20;j++){let t=j/20;pts.push(new THREE.Vector2(.17*Math.pow(1-t,.62)+.012,-t*1.33));}const m=mesh(new THREE.LatheGeometry(pts.reverse(),36),rootMaterial,g);m.position.x=off;m.rotation.z=off*.32;}}
    return g;
  }
  function bone(width=7.3){const g=new THREE.Group();world.add(g);const b=roundedBox(width,1.8,.68,.25,boneMaterial,g);b.position.set(0,-1.35,-.37);const gum=roundedBox(width+.08,.35,.86,.15,gumMaterial,g);gum.position.set(0,-.3,-.34);for(let i=0;i<26;i++){const pore=sphere(.035+(i%3)*.018,rootMaterial,g,[1.3,1,.22]);pore.position.set(-width/2+.2+(i%13)*(width-.4)/12,-.8-Math.floor(i/13)*.75+(i%3)*.12,.005);}return g;}
  function fixture(parent=world){const g=new THREE.Group();parent.add(g);const body=cylinder(.27,.20,1.55,titanium,g);body.position.y=-.78;const rim=cylinder(.32,.32,.14,titaniumDark,g);rim.position.y=.03;const points=[];for(let i=0;i<=380;i++){const t=i/380,a=t*Math.PI*2*8;const r=mix(.275,.213,t);points.push([Math.cos(a)*r,-t*1.5,Math.sin(a)*r]);}tube(points,.032,titanium,g);const opening=cylinder(.14,.14,.03,titaniumDark,g);opening.position.y=.115;return g;}
  function abutment(parent=world){const g=new THREE.Group();parent.add(g);const base=cylinder(.18,.23,.45,titanium,g);base.position.y=.23;const top=cylinder(.13,.18,.22,titaniumDark,g);top.position.y=.56;return g;}
  function arch(parent=world,{roots=false,mat=enamel,withGum=true,count=10}={}){
    const g=new THREE.Group();parent.add(g);if(withGum){const curve=[];for(let i=0;i<=36;i++){const a=-1.32+i/36*2.64;curve.push([Math.sin(a)*3.7,-.21,Math.cos(a)*2.2-1.25]);}tube(curve,.39,gumMaterial,g);}
    const teeth=[];for(let i=0;i<count;i++){const a=-1.28+i/(count-1)*2.56;const t=tooth({parent:g,x:Math.sin(a)*3.65,y:0,z:Math.cos(a)*2.18-1.25,scale:.85,incisor:i>2&&i<count-3,roots,mat});t.rotation.y=a;teeth.push(t);}return{group:g,teeth};
  }
  function ring(x,y,z,r=.65){const g=mesh(new THREE.TorusGeometry(r,.018,10,80),gold);g.position.set(x,y,z);return g;}
  function tool(parent=world){const g=new THREE.Group();parent.add(g);const handle=cylinder(.10,.14,1.55,titanium,g);handle.position.y=.65;const tip=tube([[0,-.13,0],[0,-.55,0],[-.23,-.7,0]],.027,titaniumDark,g);return g;}
  function motion(fn){updates.push(fn);}
  function transparency(meshItem,p){meshItem.visible=p>.01;}

  function implant(){
    bone();tooth({x:-2.15});tooth({x:2.15});
    const f=fixture();f.position.set(0,1.1,0);const a=abutment();const c=tooth({roots:false});
    const revision=variant.includes('revision'),sinus=variant.includes('sinus');
    if(revision){f.position.y=-.02;a.position.y=.1;c.position.y=.66;const check=ring(0,-.5,.58,1.1);motion(p=>{check.rotation.z=p*.7;check.scale.setScalar(1+.08*Math.sin(p*Math.PI));world.rotation.y=-.18+p*.36;});}
    else motion(p=>{f.position.y=mix(1.05,-.02,ease(p,.04,.44));a.position.y=mix(2.05,.1,ease(p,.35,.72));c.position.y=mix(3.3,.65,ease(p,.65,.96));world.rotation.y=-.12+p*.2;});
    if(sinus){const membrane=tube([[-1.45,-1.8,-.1],[0,-2.02,-.1],[1.45,-1.8,-.1]],.09,gumMaterial);const lower=new THREE.Group();world.add(lower);const all=[...world.children].filter(o=>o!==lower);all.forEach(o=>lower.attach(o));lower.rotation.z=Math.PI;lower.position.y=-.4;camera.position.set(6,2.8,12.5);aim.y=.3;membrane.visible=true;}
    if(variant.includes('navigation')){const guide=roundedBox(2.1,.17,1.2,.35,transparent);guide.position.set(0,.5,0);motion(p=>guide.position.y=mix(1.55,.43,ease(p,.12,.45)));}
    if(variant.includes('advanced')){const graft=sphere(.62,boneMaterial,world,[1.5,.7,.65]);graft.position.set(0,-.75,.15);}
  }
  function fullarch(){
    const fixed=arch(world,{roots:false,withGum:true});fixed.group.position.y=2.2;
    const lower=arch(world,{roots:false,withGum:true});lower.teeth.forEach(t=>t.visible=false);lower.group.position.y=-.32;
    const positions=[[-2.75,.2],[-1.1,.8],[1.1,.8],[2.75,.2]],fs=[];
    positions.forEach(([x,z],i)=>{const f=fixture();f.position.set(x,-.1,z);f.rotation.z=i===0?-.23:i===3?.23:0;fs.push(f);});
    const overdenture=variant.includes('overdenture');
    if(overdenture){fs.forEach((f,i)=>{if(i===0||i===3)f.visible=false});for(const x of[-1.1,1.1]){const ball=sphere(.22,titanium);ball.position.set(x,.27,.8);}motion(p=>{fixed.group.position.y=mix(2.1,.26,ease(p,.1,.65))+ease(p,.82,1)*.65;world.rotation.y=-.2+p*.3;});}
    else{const bar=tube([[-2.85,.23,.2],[-1.2,.23,.82],[0,.23,.98],[1.2,.23,.82],[2.85,.23,.2]],.15,titanium);motion(p=>{fixed.group.position.y=mix(2.2,.28,ease(p,.18,.78));bar.position.y=mix(.7,0,ease(p,.03,.4));world.rotation.y=-.18+p*.3;});}
    camera.position.set(7,6.8,13.8);aim.y=.35;
  }
  function align(){
    const a=arch(world,{withGum:true});const targets=a.teeth.map(t=>({x:t.position.x,z:t.position.z,r:t.rotation.y}));
    const retainer=new THREE.Group();world.add(retainer);targets.forEach((t,i)=>{const shell=tooth({parent:retainer,x:t.x,y:.03,z:t.z,scale:.9,roots:false,incisor:i>2&&i<7,mat:transparent});shell.rotation.y=t.r;});
    const invisible=variant.includes('invisalign')||variant.includes('clear');
    const brackets=/ortho-|clarity|clippy/.test(variant), bracketMeshes=[];
    if(brackets){a.teeth.forEach((t,i)=>{const bracket=roundedBox(.25,.25,.14,.05,titanium,t);bracket.position.set(0,.57,.45);bracketMeshes.push(bracket);});const wire=tube(targets.map(t=>[t.x,.49,t.z+.42]),.025,titaniumDark);motion(p=>{wire.visible=p>.22&&p<.72;bracketMeshes.forEach(b=>b.visible=p<.72);});}
    motion(p=>{const t=ease(p,.1,.8);a.teeth.forEach((toothMesh,i)=>{const q=targets[i];toothMesh.position.x=q.x+(1-t)*(i%2?.14:-.14);toothMesh.position.z=q.z+(1-t)*(i%3-1)*.25;toothMesh.rotation.y=q.r+(1-t)*(i%2?.24:-.25);});retainer.position.y=mix(2.1,.04,ease(p,invisible?.12:.75,invisible?.6:.98));retainer.visible=invisible||(brackets&&p>.72);world.rotation.y=-.1+p*.2;});
    camera.position.set(5,6,12.5);aim.y=.55;
  }
  function veneer(){
    const a=arch(world,{withGum:true,count:8});camera.position.set(3.4,2.5,11.5);aim.y=.4;
    if(variant==='aesthetic'){const patch=mesh(crownGeometry(.25,.09,.35,true),enamel);patch.position.set(.42,.1,2);motion(p=>{patch.position.z=mix(2,.99,ease(p,.14,.8));world.rotation.y=-.15+p*.25;});return;}
    if(/whiten|bleach/.test(variant)){const ivory=new THREE.Color(0xf4e1bd),natural=new THREE.Color(0xfff5df);a.teeth.forEach(t=>{t.children[0].material=material({color:ivory,roughness:.25,clearcoat:.3});});motion(p=>{a.teeth.forEach(t=>t.children[0].material.color.copy(ivory).lerp(natural,ease(p,.2,.85)*.45));world.rotation.y=-.18+p*.3;});return;}
    const shells=[];a.teeth.slice(2,6).forEach((t,i)=>{const shell=mesh(crownGeometry(.82,.11,1.05,true),enamel);shell.position.copy(t.position);shell.position.z+=1.45;shell.position.y=.08;shell.rotation.y=t.rotation.y;shells.push({m:shell,target:t.position.z+.33});});motion(p=>{shells.forEach(({m,target},i)=>m.position.z=mix(target+1.3,target,ease(p,.12+i*.07,.77+i*.04)));world.rotation.y=-.12+p*.18;});
  }
  function crown(){
    bone(5.6);tooth({x:-1.9,scale:.9});tooth({x:1.9,scale:.9});
    const t=tooth({roots:true});t.children[0].scale.set(.69,.53,.69);
    const partial=/inlay|onlay/.test(variant);const shell=partial?mesh(crownGeometry(.58,.58,.32,false),/gold/.test(variant)?gold:enamel):tooth({roots:false,scale:1.05});shell.position.y=2;
    if(partial){t.children[0].scale.set(1,.76,1);motion(p=>{shell.position.y=mix(1.85,.74,ease(p,.15,.8));world.rotation.y=-.12+p*.25;});}
    else motion(p=>{shell.position.y=mix(2.15,.25,ease(p,.15,.8));world.rotation.y=-.15+p*.3;});
    camera.position.set(5.3,3.8,11.5);
  }
  function caries(){
    const t=tooth({scale:2});const spot=sphere(.2,dark,world,[1,.48,.8]);spot.position.set(.12,1.98,.1);
    const fill=sphere(.205,enamel,world,[1,.43,.8]);fill.position.set(.12,3.1,.1);
    const drill=tool();drill.position.set(.65,3.7,.15);drill.rotation.z=-.3;
    motion(p=>{spot.scale.setScalar(1-ease(p,.18,.42));fill.position.y=mix(3.1,1.99,ease(p,.45,.85));fill.visible=p>.38;drill.position.y=mix(3.7,2.6,ease(p,.07,.29))+ease(p,.35,.55)*1.5;world.rotation.y=-.2+p*.3;});camera.position.set(4,4.5,10.5);aim.y=.5;
  }
  function endo(){
    const apical=variant.includes('apico');
    const t=tooth({scale:1.9});t.children[0].material=material({color:0xfff6df,roughness:.3,transparent:true,opacity:.45,depthWrite:false});
    const channelMat=apical?gold:pulpMaterial;
    tube([[-.21,1.65,.53],[-.14,.6,.53],[-.45,-2.22,.53]],.06,channelMat);
    tube([[.21,1.65,.53],[.14,.6,.53],[.45,-2.22,.53]],.06,channelMat);
    if(apical){
      const focus=ring(-.45,-2.08,.77,.55);
      const instrument=tool();instrument.position.set(2.7,-1.9,.8);instrument.rotation.z=-Math.PI/2;
      const seal=sphere(.075,gold,world,[1,.6,1]);seal.position.set(-.45,-2.17,.57);
      motion(p=>{instrument.position.x=mix(2.7,.38,ease(p,.18,.55))+ease(p,.72,.95)*1.8;seal.visible=p>.64;focus.scale.setScalar(1+.035*Math.sin(p*Math.PI));world.rotation.y=-.12+p*.2;});
      camera.position.set(3.7,1.2,11);aim.y=-.1;return;
    }
    const files=new THREE.Group();world.add(files);
    for(const x of[-.24,.24]){const file=cylinder(.012,.025,3.8,titanium,files);file.position.set(x,-.15,.56);const grip=cylinder(.065,.065,.25,gold,files);grip.position.set(x,1.97,.56);}
    const seal=tube([[-.21,1.55,.55],[-.16,.6,.55],[-.43,-2.2,.55]],.049,gold);
    const seal2=tube([[.21,1.55,.55],[.16,.6,.55],[.43,-2.2,.55]],.049,gold);
    motion(p=>{files.position.y=mix(3.6,0,ease(p,.12,.43))+ease(p,.5,.69)*3.6;seal.visible=seal2.visible=p>.7;world.rotation.y=-.12+p*.23;});camera.position.set(3.5,2.6,11);aim.y=.1;
  }
  function bridge(){
    bone();const left=tooth({x:-2}),right=tooth({x:2});left.children[0].scale.set(.7,.65,.7);right.children[0].scale.set(.7,.65,.7);
    const group=new THREE.Group();world.add(group);for(const x of[-2,0,2])tooth({parent:group,x,roots:false,scale:1.1});const connector=tube([[-2,.45,0],[0,.5,0],[2,.45,0]],.24,enamel,group);motion(p=>{group.position.y=mix(2.45,.25,ease(p,.1,.82));world.rotation.y=-.2+p*.4;});camera.position.set(5,3.6,12.5);
  }
  function denture(){const gum=arch(world,{withGum:true});gum.teeth.forEach(t=>t.visible=false);gum.group.position.y=-.25;const teeth=arch(world,{withGum:true});motion(p=>{teeth.group.position.y=mix(2,.27,ease(p,.15,.8));world.rotation.y=-.2+p*.35;});camera.position.set(7,7,14);aim.y=.4;}
  function gums(){
    bone();for(const x of[-2,0,2])tooth({x});
    if(variant==='gum-surgery'){
      const pocket=roundedBox(.18,.92,.11,.05,pulpMaterial);pocket.position.set(.58,-.58,.5);
      const probe=new THREE.Group();world.add(probe);const stem=cylinder(.023,.023,1.85,titanium,probe);stem.position.y=.45;const grip=cylinder(.08,.08,.75,titaniumDark,probe);grip.position.y=1.6;
      const focus=ring(.58,-.52,.66,.7);
      motion(p=>{probe.position.set(.61,mix(1.15,.02,ease(p,.15,.68)),.54);probe.rotation.z=-.06;focus.scale.setScalar(1+.04*p);world.rotation.y=-.18+p*.28;});camera.position.set(4.7,2.9,11.5);return;
    }
    const calculus=[];for(const x of[-1.45,-.55,.55,1.45]){const c=sphere(.1,gold,world,[1,.65,.55]);c.position.set(x,-.02,.36);calculus.push(c);}
    const scaler=tool();scaler.position.set(2.5,2,.5);scaler.rotation.z=-.5;
    motion(p=>{scaler.position.set(mix(2.5,-.3,ease(p,.08,.83)),mix(2,.62,ease(p,.08,.45)),.5);calculus.forEach((m,i)=>m.scale.setScalar(1-ease(p,.25+i*.1,.48+i*.1)));world.rotation.y=-.14+p*.22;});camera.position.set(5,3.6,12.5);
  }
  function wisdom(){bone(7.8);tooth({x:-2.6});tooth({x:-.9});const w=tooth({x:1.75,y:-.65});w.rotation.z=-.85;const nerve=tube([[-3.6,-1.95,.35],[0,-1.75,.35],[3.6,-1.95,.35]],.07,gold);const inspect=ring(1.65,-.65,.9,1.25);motion(p=>{world.rotation.y=-.35+p*.7;inspect.material.opacity=.75;inspect.rotation.z=p*.3;});camera.position.set(5,3.5,12.5);}
  function jaw(){
    const skull=sphere(1.6,boneMaterial,world,[1,.8,.65]);skull.position.set(-.3,1.4,-.4);const mandible=new THREE.Group();world.add(mandible);mandible.position.set(-1,1,0);tube([[0,0,0],[.1,-1.3,.1],[1.8,-2,.5],[3.8,-1.1,.4]],.28,boneMaterial,mandible);const condyle=sphere(.4,boneMaterial,mandible,[.7,1,.8]);const disc=sphere(.43,gumMaterial,world,[1,.27,.8]);disc.position.set(-1,1.3,0);const joint=ring(-1,1.1,.62,.7);motion(p=>{mandible.rotation.z=-ease(p,.2,.8)*.24;world.rotation.y=-.1+p*.3;});camera.position.set(6,3.1,12.8);aim.set(.5,.1,0);
  }
  function sedation(){
    const chair=new THREE.Group();world.add(chair);const base=roundedBox(3.7,.35,1.5,.16,sage,chair);base.position.set(-.8,-.25,0);const back=roundedBox(1.85,.33,1.5,.16,sage,chair);back.position.set(-2.9,.3,0);back.rotation.z=-.48;const foot=roundedBox(1.6,.3,1.5,.15,sage,chair);foot.position.set(1.7,-.65,0);foot.rotation.z=-.45;const support=cylinder(.22,.33,1.6,titanium,chair);support.position.set(-.5,-1.15,0);
    const head=sphere(.35,neutral);head.position.set(-3.1,.91,0);const body=roundedBox(2.1,.45,.94,.2,neutral);body.position.set(-1.75,.36,0);body.rotation.z=-.15;const legs=roundedBox(1.8,.33,.75,.15,neutral);legs.position.set(.25,.12,0);legs.rotation.z=-.12;
    const monitor=roundedBox(1.75,1.2,.2,.13,titanium);monitor.position.set(2.7,1.25,-.65);const screen=roundedBox(1.53,.95,.08,.08,material({color:0x244a40,roughness:.7}));screen.position.set(2.7,1.25,-.49);const stand=cylinder(.07,.1,2.7,titanium);stand.position.set(2.7,-.7,-.65);
    const waveform=tube([[2.05,1.25,-.41],[2.3,1.25,-.41],[2.4,1.48,-.41],[2.55,1,-.41],[2.72,1.38,-.41],[2.9,1.25,-.41],[3.3,1.25,-.41]],.018,material({color:0xc3dfa3,emissive:0x648c59,emissiveIntensity:.2}));
    const sensor=tube([[-.8,.5,.45],[.5,1,.55],[2.65,.75,-.4]],.025,titaniumDark);motion(p=>{world.rotation.y=-.12+p*.22;waveform.visible=p>.2;sensor.visible=p>.12;});camera.position.set(7,5.8,14);aim.set(-.3,.1,0);
  }
  function child(){bone(6.5);tooth({x:-1.7,scale:.75});const baby=tooth({scale:.75});tooth({x:1.7,scale:.75});const grown=tooth({y:-2.2,z:.35,scale:.9});motion(p=>{baby.position.y=ease(p,.26,.67)*2.7;baby.visible=p<.72;grown.position.y=mix(-2.2,-.03,ease(p,.45,.94));world.rotation.y=-.1+p*.15;});camera.position.set(4,3.2,11.8);aim.y=.2;}
  function prevention(){const t=tooth({scale:2});const brush=new THREE.Group();world.add(brush);const head=roundedBox(.8,.22,.5,.1,sage,brush);const handle=roundedBox(2.2,.17,.2,.07,sage,brush);handle.position.x=1.1;for(let i=0;i<7;i++)for(let j=0;j<3;j++){const bristle=cylinder(.017,.017,.32,neutral,brush);bristle.position.set(-.31+i*.1,-.25,-.17+j*.17);}motion(p=>{brush.position.set(mix(1.7,-.2,ease(p,.1,.86)),1.65+Math.sin(p*Math.PI*5)*.055,.75);brush.rotation.z=-.25;world.rotation.y=-.16+p*.2;});camera.position.set(4,4.1,10.8);aim.y=.25;}
  function consult(){const a=arch(world,{withGum:true});const lens=ring(-2.2,.7,1.1,.65);motion(p=>{lens.position.x=mix(-2.4,2.4,p);lens.position.z=1.15-Math.abs(p-.5)*.65;world.rotation.y=-.15+p*.3;});camera.position.set(5.8,5.4,12.5);aim.y=.4;}
  const scenes={implant,fullarch,align,veneer,crown,caries,endo,gum:gums,bridge,denture,wisdom,jaw,sedation,child,prevention,consult};
  const build=variant.includes('overdenture')?fullarch:variant==='inlay'?crown:(scenes[sceneName]||consult);
  build();
  camera.zoom=sceneName==='implant'?1.02:sceneName==='align'||sceneName==='consult'?1.23:sceneName==='fullarch'?1.2:1.15;
  host.appendChild(canvas);
  function resize(){if(disposed)return;const rect=host.getBoundingClientRect();if(rect.width<1||rect.height<1)return;renderer.setSize(Math.round(rect.width),Math.round(rect.height),false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();render();}
  function render(){if(disposed||document.hidden)return;camera.lookAt(aim);renderer.render(scene,camera);}
  function update(p){if(disposed)return;progress=clamp(p);updates.forEach(fn=>fn(progress));render();}
  const contextLost=event=>{event.preventDefault();host.classList.remove('has-3d');onError(new Error('WebGL context unavailable'));};canvas.addEventListener('webglcontextlost',contextLost,false);
  function dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',contextLost);resources.forEach(resource=>resource.dispose?.());key.shadow.dispose();renderer.dispose();renderer.forceContextLoss?.();canvas.remove();host.classList.remove('has-3d');if(active?.dispose===dispose)active=null;}
  const api={update,resize,dispose};active=api;
  try{update(0);resize();host.classList.add('has-3d');}catch(error){dispose();throw error;}
  return api;
}
