import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { auditPublication } from './verify-patient-notes-live.mjs'

const RealDate = Date
let clock = RealDate.parse('2026-09-20T23:59:59+09:00')
globalThis.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [clock])) }
  static now() { return clock }
}
const temp = await mkdtemp(join(tmpdir(), 'bd-publication-regression-'))
try {
  await build({ stdin: { contents: `export { default as app } from './src/index'; export { patientNotes } from './src/data/patient-notes'; export { patientNoteDetails } from './src/data/patient-note-details';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', target: 'node22', outfile: join(temp, 'fixture.mjs'), logLevel: 'error' })
  const { app, patientNotes, patientNoteDetails } = await import(pathToFileURL(join(temp, 'fixture.mjs')))
  const today = '2026-09-20'
  const brief = n => ({ ...n, url: 'https://bdbddc.com/concerns/' + n.slug })
  const state = () => ({ kstDate: today, allocatedToday: patientNotes.filter(n => n.publishedAt?.startsWith(today)).map(brief), currentlyPublicInSource: patientNotes.filter(n => n.publishedAt && RealDate.parse(n.publishedAt) <= clock).map(brief), upcoming: patientNotes.filter(n => n.publishedAt && RealDate.parse(n.publishedAt) > clock).map(brief) })
  const get = async url => {
    if (url.endsWith('/sitemap.xml')) return { status: 200, headers: {}, html: await readFile('sitemap.xml', 'utf8') }
    const r = await app.request(url, {}, {})
    return { status: r.status, headers: Object.fromEntries(r.headers), html: await r.text() }
  }
  const result = await auditPublication({ state: state(), get })
  assert.equal(result.stage, 'published')
  assert.equal(result.today.length, 2)
  // The exact missed-publication failure: old pages work but today's slots are empty.
  await assert.rejects(auditPublication({ state: { ...state(), allocatedToday: [] }, get }), /expected two assigned notes/)
  const missingUrl = result.today[0].url
  await assert.rejects(auditPublication({ state: state(), get: async u => u === missingUrl ? { status: 404, html: '', headers: {} } : get(u) }), /HTTP 404/)
  await assert.rejects(auditPublication({ state: state(), get: async u => {
    const r = await get(u)
    return u === missingUrl ? { ...r, headers: { ...r.headers, 'x-robots-tag': 'noindex' } } : r
  } }), /canonical or index mismatch/)
  await assert.rejects(auditPublication({ state: state(), get: async u => {
    const r = await get(u)
    return u.endsWith('/sitemap-concerns.xml') ? { ...r, html: r.html.replace(missingUrl, missingUrl + '-missing') } : r
  } }), /sitemap does not match/)
  const targets = patientNotes.filter(n => n.publishedAt?.startsWith(today))
  const originals = targets.map(n => n.publishedAt)
  targets.forEach(n => { n.publishedAt = today + 'T09:00:00+09:00' })
  clock = RealDate.parse(today + 'T08:30:00+09:00')
  const scheduled = await auditPublication({ state: state(), get, allowScheduled: true })
  assert.equal(scheduled.stage, 'scheduled')
  assert.equal(scheduled.future.length, 2)
  await assert.rejects(auditPublication({ state: state(), get }), /not fully public/)
  clock = RealDate.parse(today + 'T09:00:00+09:00')
  assert.equal((await auditPublication({ state: state(), get })).stage, 'published')
  // Reachability survives more than 24 notes with the existing catalog order.
  const template = patientNotes[0]
  for (let i = 0; i < 20; i++) {
    const slug = 'publication-fixture-' + i
    patientNotes.splice(6, 0, { ...template, slug, title: 'Fixture ' + i })
    patientNoteDetails[slug] = patientNoteDetails[template.slug]
  }
  assert.equal((await auditPublication({ state: state(), get })).stage, 'published')
  targets.forEach((n, i) => { n.publishedAt = originals[i] })
  console.log('PASS: publication proof, empty daily slots, missing live URL, robots block, sitemap mismatch, 08:30 scheduled versus 09:00 public, and catalog pagination')
} finally {
  globalThis.Date = RealDate
  await rm(temp, { recursive: true, force: true })
}
