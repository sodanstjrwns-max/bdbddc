import * as T from '../arcade/vendor/three.module.min.js';
// Small local HDR pipeline: bloom, depth contact shading, restrained edge vignette.
// The game remains playable on the direct-render mobile path.
export class Atmosphere {
 constructor(renderer){
  this.renderer=renderer;this.size=new T.Vector2();this.scene=new T.Scene();this.camera=new T.OrthographicCamera(-1,1,1,-1,0,1);this.quad=new T.Mesh(new T.PlaneGeometry(2,2),null);this.scene.add(this.quad);
  this.color=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:4});this.color.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);this.blurA=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false});this.blurB=this.blurA.clone();
  const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  this.blur=new T.ShaderMaterial({uniforms:{inputTex:{value:null},direction:{value:new T.Vector2()},threshold:{value:1}},vertexShader,fragmentShader:`varying vec2 vUv;uniform sampler2D inputTex;uniform vec2 direction;uniform float threshold;
vec3 read(vec2 uv){vec3 c=texture2D(inputTex,uv).rgb;float l=max(max(c.r,c.g),c.b);return c*max(0.,l-threshold)/max(l,.001);}
void main(){vec3 c=read(vUv)*.227027;c+=read(vUv+direction*1.384615)*.316216;c+=read(vUv-direction*1.384615)*.316216;c+=read(vUv+direction*3.230769)*.070270;c+=read(vUv-direction*3.230769)*.070270;gl_FragColor=vec4(c,1.);}`});
  this.output=new T.ShaderMaterial({uniforms:{sceneTex:{value:this.color.texture},bloomTex:{value:this.blurB.texture},depthTex:{value:this.color.depthTexture},pixel:{value:new T.Vector2()},nearFar:{value:new T.Vector2(.1,1800)}},vertexShader,fragmentShader:`varying vec2 vUv;uniform sampler2D sceneTex,bloomTex,depthTex;uniform vec2 pixel,nearFar;
float viewDepth(vec2 uv){float d=texture2D(depthTex,uv).x;return nearFar.x*nearFar.y/(nearFar.y-d*(nearFar.y-nearFar.x));}
void main(){vec3 c=texture2D(sceneTex,vUv).rgb;float z=viewDepth(vUv);float ao=0.;for(int i=0;i<8;i++){float a=float(i)*.785398;vec2 offset=vec2(cos(a),sin(a))*pixel*5.;float diff=z-viewDepth(vUv+offset);ao+=smoothstep(.035,.25,diff)*(1.-smoothstep(.7,2.5,diff));}c*=1.-ao*.021;c+=texture2D(bloomTex,vUv).rgb*.30;vec2 p=(vUv-.5)*2.;c*=1.-dot(p,p)*.045;gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}`});
 }
 resize(){this.renderer.getDrawingBufferSize(this.size);const w=this.size.x,h=this.size.y;this.color.setSize(w,h);this.blurA.setSize(Math.max(1,w>>2),Math.max(1,h>>2));this.blurB.setSize(Math.max(1,w>>2),Math.max(1,h>>2));this.output.uniforms.pixel.value.set(1/w,1/h);}
 render(scene,camera){const r=this.renderer;r.setRenderTarget(this.color);r.render(scene,camera);this.quad.material=this.blur;this.blur.uniforms.inputTex.value=this.color.texture;this.blur.uniforms.threshold.value=.92;this.blur.uniforms.direction.value.set(4/this.size.x,0);r.setRenderTarget(this.blurA);r.render(this.scene,this.camera);this.blur.uniforms.inputTex.value=this.blurA.texture;this.blur.uniforms.threshold.value=0;this.blur.uniforms.direction.value.set(0,4/this.size.y);r.setRenderTarget(this.blurB);r.render(this.scene,this.camera);this.quad.material=this.output;this.output.uniforms.nearFar.value.set(camera.near,camera.far);r.setRenderTarget(null);r.render(this.scene,this.camera);}
 dispose(){for(const r of [this.color,this.blurA,this.blurB])r.dispose();this.blur.dispose();this.output.dispose();this.quad.geometry.dispose();}
}
