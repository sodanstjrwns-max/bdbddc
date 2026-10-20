/** Eight legacy or sixteen clinical WebP files per chunk; decode only the requested frame. */
export const CHUNK_FORMAT='webp-chunks-v1', FRAMES_PER_CHUNK=8, MAX_FRAMES_PER_CHUNK=16, MAX_CHUNK_BYTES=2*1024*1024;
const MAGIC=new Uint8Array([66,68,83,69,81,48,49,10]); // BDSEQ01\n
const abortError=()=>new DOMException('Frame request cancelled','AbortError');
export function parseChunk(buffer,{firstFrame,count,maxBytes=MAX_CHUNK_BYTES}={}) {
  if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<24||buffer.byteLength>maxBytes)throw Error('Invalid chunk byte length');
  const bytes=new Uint8Array(buffer),v=new DataView(buffer);
  if(MAGIC.some((x,i)=>bytes[i]!==x))throw Error('Invalid chunk magic');
  const first=v.getUint32(8,true),length=v.getUint16(12,true);
  if(v.getUint16(14,true)!==0||length<1||length>MAX_FRAMES_PER_CHUNK||(firstFrame!==undefined&&first!==firstFrame)||(count!==undefined&&length!==count))throw Error('Invalid chunk frame range');
  let end=16+length*8;const entries=[];
  if(end>buffer.byteLength)throw Error('Truncated chunk table');
  for(let i=0;i<length;i++) {
    const offset=v.getUint32(16+i*8,true),size=v.getUint32(20+i*8,true);
    if(offset!==end||size<12||size>2*1024*1024||offset+size>buffer.byteLength)throw Error('Invalid chunk frame bounds');
    if(bytes[offset]!==82||bytes[offset+1]!==73||bytes[offset+2]!==70||bytes[offset+3]!==70||bytes[offset+8]!==87||bytes[offset+9]!==69||bytes[offset+10]!==66||bytes[offset+11]!==80)throw Error('Chunk frame is not WebP');
    const declared=v.getUint32(offset+4,true)+8;
    if(declared!==size)throw Error('Invalid WebP RIFF length');
    entries.push({offset,length:size});end=offset+size;
  }
  if(end!==buffer.byteLength)throw Error('Unexpected chunk trailing bytes');
  return {buffer,firstFrame:first,count:length,entries};
}
export function encodeChunk(frames,firstFrame) {
  if(!Array.isArray(frames)||frames.length<1||frames.length>MAX_FRAMES_PER_CHUNK||!Number.isInteger(firstFrame)||firstFrame<0)throw Error('Invalid chunk inputs');
  const inputs=frames.map(f=>f instanceof Uint8Array?f:new Uint8Array(f));
  const header=16+inputs.length*8,total=header+inputs.reduce((n,f)=>n+f.byteLength,0);
  if(total>MAX_CHUNK_BYTES)throw Error('Chunk exceeds 2 MiB; do not silently reduce image quality');
  const buffer=new ArrayBuffer(total),bytes=new Uint8Array(buffer),v=new DataView(buffer);bytes.set(MAGIC);v.setUint32(8,firstFrame,true);v.setUint16(12,inputs.length,true);
  let offset=header;inputs.forEach((input,i)=>{v.setUint32(16+i*8,offset,true);v.setUint32(20+i*8,input.byteLength,true);bytes.set(input,offset);offset+=input.byteLength;});
  parseChunk(buffer,{firstFrame,count:inputs.length});return buffer;
}
function spec(source,index) {
  const size=source?.framesPerChunk;
  if(source?.format!==CHUNK_FORMAT||![8,16].includes(size)||!Number.isInteger(source.count)||source.count<1||source.chunkCount!==Math.ceil(source.count/size)||typeof source.pattern!=='string'||!/^\/(?!\/)/.test(source.pattern)||!source.pattern.includes('{index}')||/[\\\u0000-\u001f]/.test(source.pattern)||!Number.isInteger(index)||index<0||index>=source.count)throw Error('Invalid chunk source or frame index');
  const chunk=Math.floor(index/size),firstFrame=chunk*size;
  const url=source.pattern.replaceAll('{index}',String(chunk+(source.start??1)).padStart(source.pad??4,'0'));
  return {url,firstFrame,count:Math.min(size,source.count-firstFrame),local:index-firstFrame};
}
export function createFrameChunkLoader({fetcher=globalThis.fetch,maxChunks=3,maxBytes=6*1024*1024,timeoutMs=15000,maxConcurrent=2}={}) {
  if(typeof fetcher!=='function'||!Number.isInteger(maxChunks)||maxChunks<1||maxChunks>3||maxBytes<MAX_CHUNK_BYTES||maxBytes>6*1024*1024||!Number.isInteger(maxConcurrent)||maxConcurrent<1||maxConcurrent>2)throw Error('Invalid bounded chunk loader options');
  const cache=new Map(),requests=new Map(),queue=[];
  let active=0,bytes=0,disposed=false,peakActive=0,peakBytes=0,peakChunks=0,totalFetches=0;
  function touch(key){const v=cache.get(key);if(v){cache.delete(key);cache.set(key,v);}return v;}
  function remember(key,value){if(cache.has(key))bytes-=cache.get(key).buffer.byteLength;cache.delete(key);cache.set(key,value);bytes+=value.buffer.byteLength;while(cache.size>maxChunks||bytes>maxBytes){const old=cache.keys().next().value;bytes-=cache.get(old).buffer.byteLength;cache.delete(old);}peakBytes=Math.max(peakBytes,bytes);peakChunks=Math.max(peakChunks,cache.size);}
  async function body(response,controller) {
    const declared=Number(response.headers?.get('content-length'));
    if(declared>MAX_CHUNK_BYTES)throw Error('Chunk response exceeds 2 MiB');
    if(!response.body?.getReader){const b=await response.arrayBuffer();if(b.byteLength>MAX_CHUNK_BYTES)throw Error('Chunk response exceeds 2 MiB');return b;}
    const reader=response.body.getReader(),parts=[];let size=0;
    try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_CHUNK_BYTES){controller.abort();throw Error('Chunk response exceeds 2 MiB');}parts.push(value);}}
    finally{reader.releaseLock();}
    const buffer=new Uint8Array(size);let offset=0;for(const part of parts){buffer.set(part,offset);offset+=part.byteLength;}return buffer.buffer;
  }
  function finish(r,error,value){for(const sub of [...r.subscribers]){sub.detach();if(error)sub.reject(error);else sub.resolve(value);}r.subscribers.clear();}
  function pump(){
    if(disposed)return;
    while(active<maxConcurrent&&queue.length){const r=queue.shift();if(!r.subscribers.size||requests.get(r.url)!==r)continue;r.started=true;active++;peakActive=Math.max(peakActive,active);totalFetches++;r.controller=new AbortController();r.timer=setTimeout(()=>{r.timedOut=true;r.controller.abort();},timeoutMs);
      (async()=>{try{const response=await fetcher(r.url,{signal:r.controller.signal,cache:'force-cache',credentials:'same-origin'});if(!response.ok)throw Error('Chunk request returned HTTP '+response.status);const buffer=await body(response,r.controller);if(disposed||!r.subscribers.size)throw abortError();const value=parseChunk(buffer,{firstFrame:r.firstFrame,count:r.count});remember(r.url,value);finish(r,null,value);}
      catch(error){finish(r,r.timedOut?new Error('Chunk request timed out'):error);}
      finally{clearTimeout(r.timer);active--;if(requests.get(r.url)===r)requests.delete(r.url);pump();}})();
    }
  }
  function getChunk(s,signal){
    if(disposed||signal?.aborted)return Promise.reject(abortError());const known=touch(s.url);if(known)return Promise.resolve(known);
    let r=requests.get(s.url);if(!r){r={...s,subscribers:new Set(),started:false};requests.set(s.url,r);queue.push(r);}
    return new Promise((resolve,reject)=>{const sub={resolve,reject,detach:()=>signal?.removeEventListener('abort',abort)};const abort=()=>{sub.detach();r.subscribers.delete(sub);reject(abortError());if(!r.subscribers.size){if(requests.get(r.url)===r)requests.delete(r.url);r.controller?.abort();}};r.subscribers.add(sub);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();pump();});
  }
  return {
    async getFrame(source,index,{signal}={}){const s=spec(source,index),chunk=await getChunk(s,signal);if(disposed||signal?.aborted)throw abortError();if(chunk.firstFrame!==s.firstFrame||chunk.count!==s.count)throw Error('Cached chunk source mismatch');const e=chunk.entries[s.local];return new Blob([new Uint8Array(chunk.buffer,e.offset,e.length)],{type:'image/webp'});},
    clear(){cache.clear();bytes=0;},
    dispose(){if(disposed)return;disposed=true;cache.clear();bytes=0;for(const r of requests.values()){r.controller?.abort();finish(r,abortError());}requests.clear();queue.length=0;},
    stats(){return {cacheChunks:cache.size,cacheBytes:bytes,pendingChunks:requests.size,activeRequests:active,peakActive,peakBytes,peakChunks,totalFetches,disposed};}
  };
}
