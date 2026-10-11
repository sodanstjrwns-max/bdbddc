import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Isolated application/storage/provider fixtures; no real submissions or emails.
await mkdir(resolve('.wrangler'), { recursive: true })
const temp = await mkdtemp(join(resolve('.wrangler'), 'career-mail-test-'))
const originalFetch = globalThis.fetch, originalError = console.error
const errors = []
console.error = (...args) => errors.push(args)
try {
  await build({ stdin: { contents: `import { Hono } from 'hono'; import { registerCareerApis } from './src/routes/career-api'; const app=new Hono(); registerCareerApis(app,{hasSuspiciousInput:()=>null,verifyTurnstile:async()=>true}); export default app;`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', outfile: join(temp, 'app.mjs'), logLevel: 'error' })
  const { default: app } = await import(pathToFileURL(join(temp, 'app.mjs')))
  const form = { name: '테스트 지원자', phone: '010-0000-0000', email: 'applicant@example.test', position: '치과위생사', experience: '1~3년', appliedAt: '2026-10-11T12:00:00+09:00' }
  function database({ fails=false, count=0 }={}) {
    const saved=[]
    return { saved, prepare(sql) { let values; return { bind(...args) { values=args; return this }, async first() { return {cnt:count} }, async run() { if(sql.includes('INSERT INTO career_applications')) { if(fails) throw Error('storage unavailable'); saved.push(values) } return {success:true} } } } }
  }
  const request=(db,env={},overrides={},ctx)=>app.request('https://bdbddc.com/api/careers/apply',{method:'POST',headers:{'Content-Type':'application/json','cf-connecting-ip':'192.0.2.1'},body:JSON.stringify({...form,...overrides})},{DB:db,...env},ctx)
  const deliveries=[];let activeDb
  globalThis.fetch=async(url,options)=>{
    assert.equal(url,'https://api.resend.com/emails');assert.equal(activeDb.saved.length,1,'Store before notification')
    deliveries.push({headers:options.headers,body:JSON.parse(options.body)})
    return new Response('{"id":"test-mail-id"}',{status:200})
  }
  activeDb=database();let response=await request(activeDb,{RESEND_API_KEY:'test-key',NOTIFICATION_EMAIL:'owner@example.test'})
  assert.equal(response.status,200);assert.equal((await response.json()).success,true);assert.equal(deliveries.length,1)
  const mail=deliveries[0];assert.equal(mail.headers.Authorization,'Bearer test-key');assert.deepEqual(mail.body.to,['owner@example.test']);assert.equal(mail.body.from,'서울비디치과 알림 <noreply@patientview.kr>');assert.match(mail.body.subject,/채용지원/)
  for(const value of [form.name,form.position,form.phone,form.email,form.experience,'https://bdbddc.com/admin/careers']) assert.ok(mail.body.text.includes(value))
  assert.ok(!('html' in mail.body),'User input is plaintext')
  activeDb=database();await request(activeDb,{RESEND_API_KEY:'test-key'});assert.deepEqual(deliveries[1].body.to,['sodanstjrwns@gmail.com'])
  activeDb=database();await request(activeDb,{GMAIL_APP_PASSWORD:'legacy-only'});assert.equal(deliveries.length,2);assert.equal(activeDb.saved.length,1)
  globalThis.fetch=async()=>new Response('{}',{status:403});activeDb=database();response=await request(activeDb,{RESEND_API_KEY:'test-key'});assert.equal(response.status,200);assert.equal(activeDb.saved.length,1);assert.ok(errors.some(e=>e[0]==='Career notification rejected:'&&e[1]===403))
  globalThis.fetch=async()=>{throw Error('network failure')};activeDb=database();response=await request(activeDb,{RESEND_API_KEY:'test-key'});assert.equal(response.status,200);assert.equal(activeDb.saved.length,1)
  let fetched=false;globalThis.fetch=async()=>{fetched=true;return new Response('{}')}
  activeDb=database({fails:true});response=await request(activeDb,{RESEND_API_KEY:'test-key'});assert.equal(response.status,500);assert.equal(fetched,false)
  activeDb=database();response=await request(activeDb,{RESEND_API_KEY:'test-key'},{name:''});assert.equal(response.status,400);assert.equal(activeDb.saved.length,0);assert.equal(fetched,false)
  activeDb=database({count:3});response=await request(activeDb,{RESEND_API_KEY:'test-key'});assert.equal(response.status,429);assert.equal(activeDb.saved.length,0);assert.equal(fetched,false)
  let release;const pending=[];globalThis.fetch=()=>new Promise(resolve=>{release=()=>resolve(new Response('{"id":"async-test"}',{status:200}))})
  activeDb=database();response=await request(activeDb,{RESEND_API_KEY:'test-key'},{},{waitUntil(promise){pending.push(promise)},passThroughOnException(){}})
  assert.equal(response.status,200);assert.equal(pending.length,1);release();await Promise.all(pending)
  console.log('PASS: stored applications use existing Resend/recipient and verified sender, plaintext details/admin link, shared fallback, no Gmail dependency, provider/network errors preserve receipt, rejected/failed/rate-limited submissions send nothing, and waitUntil retains background delivery')
} finally {
  globalThis.fetch=originalFetch;console.error=originalError
  await rm(temp,{recursive:true,force:true})
}
