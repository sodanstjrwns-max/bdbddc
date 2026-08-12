#!/usr/bin/env node
/**
 * 병렬 배치 러너: 페이지 N개 동시 번역 (기본 5)
 * 사용: node scripts/i18n/run-parallel.mjs <batch.json> [concurrency]
 * 이미 존재하는 out 파일은 스킵 → 중단 후 재실행 안전(resumable)
 */
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const batch = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const CONC = parseInt(process.argv[3] || '5', 10)

// jp-sitemap 누적 등록
const smPath = path.join(__dirname, 'jp-sitemap.json')
let sm = new Set()
try { sm = new Set(JSON.parse(fs.readFileSync(smPath, 'utf8'))) } catch {}
for (const b of batch) {
  const ko = b.path.replace(/^\/jp/, '') || '/'
  sm.add(ko === '/' ? '/' : ko.replace(/\/$/, ''))
}
fs.writeFileSync(smPath, JSON.stringify([...sm].sort(), null, 1))

const queue = batch.filter(b => !fs.existsSync(path.join(ROOT, b.out)))
console.log(`[queue] ${queue.length}/${batch.length} to translate (rest exist=skip), conc=${CONC}`)

let idx = 0, ok = 0, fail = 0
async function worker(id) {
  while (idx < queue.length) {
    const b = queue[idx++]
    const t0 = Date.now()
    await new Promise((resolve) => {
      const p = spawn('node', [path.join(__dirname, 'translate-page.mjs'), b.src, b.out, b.path], {
        cwd: ROOT, env: process.env, stdio: ['ignore', 'pipe', 'pipe'],
      })
      let err = ''
      p.stderr.on('data', d => { err += d })
      const timer = setTimeout(() => p.kill('SIGKILL'), 900000)
      p.on('close', (code) => {
        clearTimeout(timer)
        const sec = Math.round((Date.now() - t0) / 1000)
        if (code === 0) { ok++; console.log(`✅ [w${id}] ${b.out} (${sec}s) — ${ok + fail}/${queue.length}`) }
        else { fail++; console.log(`❌ [w${id}] ${b.out} (${sec}s): ${err.slice(-200)}`); try { fs.unlinkSync(path.join(ROOT, b.out)) } catch {} }
        resolve()
      })
    })
  }
}
await Promise.all(Array.from({ length: CONC }, (_, i) => worker(i + 1)))
console.log(`\n[batch done] ok=${ok} fail=${fail}`)
