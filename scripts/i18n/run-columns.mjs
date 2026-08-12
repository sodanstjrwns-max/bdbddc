#!/usr/bin/env node
/**
 * 컬럼 일어 배치 러너: 슬러그 목록 → translate-column.mjs 병렬 실행 (resumable)
 * 사용: node scripts/i18n/run-columns.mjs <slugs.txt> [concurrency=2]
 */
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'jp-columns')
const slugs = fs.readFileSync(process.argv[2], 'utf8').split('\n').map(s => s.trim()).filter(Boolean)
const CONC = parseInt(process.argv[3] || '2', 10)

const queue = slugs.filter(s => !fs.existsSync(path.join(OUT_DIR, `${s}.json`)))
console.log(`[queue] ${queue.length}/${slugs.length} to translate, conc=${CONC}`)

let idx = 0, ok = 0, fail = 0
async function worker(id) {
  while (idx < queue.length) {
    const s = queue[idx++]
    const t0 = Date.now()
    await new Promise((resolve) => {
      const p = spawn('node', [path.join(__dirname, 'translate-column.mjs'), s], {
        env: process.env, stdio: ['ignore', 'pipe', 'pipe'],
      })
      let err = ''
      p.stderr.on('data', d => { err += d })
      const timer = setTimeout(() => p.kill('SIGKILL'), 900000)
      p.on('close', (code) => {
        clearTimeout(timer)
        const sec = Math.round((Date.now() - t0) / 1000)
        if (code === 0) { ok++; console.log(`✅ [w${id}] ${s} (${sec}s) — ${ok + fail}/${queue.length}`) }
        else { fail++; console.log(`❌ [w${id}] ${s} (${sec}s): ${err.slice(-200)}`); try { fs.unlinkSync(path.join(OUT_DIR, `${s}.json`)) } catch {} }
        resolve()
      })
    })
  }
}
await Promise.all(Array.from({ length: CONC }, (_, i) => worker(i + 1)))
console.log(`\n[columns done] ok=${ok} fail=${fail}`)
