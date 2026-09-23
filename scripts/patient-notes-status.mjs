import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { dailyNoteLimit } from './patient-notes-policy.mjs'

const temp = await mkdtemp(join(tmpdir(), 'bd-notes-status-'))
try {
  await build({ stdin: { contents: `export { patientNotes } from './src/data/patient-notes';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', outfile: join(temp, 'notes.mjs'), logLevel: 'error' })
  const { patientNotes } = await import(pathToFileURL(join(temp, 'notes.mjs')))
  const now = Date.now()
  const kstDate = value => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
  const today = process.argv[2] || kstDate(now)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('Use YYYY-MM-DD in Asia/Seoul')
  const scheduled = patientNotes.filter(n => n.publishedAt)
  if (scheduled.some(n => !Number.isFinite(Date.parse(n.publishedAt)))) throw new Error('Invalid publication timestamp')
  const slots = scheduled.filter(n => kstDate(n.publishedAt) === today)
  const limitPerDay = dailyNoteLimit(today)
  const brief = n => ({ slug: n.slug, region: n.region, title: n.title, publishedAt: n.publishedAt, url: 'https://bdbddc.com/concerns/' + n.slug })
  console.log(JSON.stringify({
    checkedAt: new Date(now).toISOString(), kstDate: today, limitPerDay,
    allocatedToday: slots.map(brief), remainingSlotsToday: Math.max(0, limitPerDay - slots.length),
    currentlyPublicInSource: scheduled.filter(n => Date.parse(n.publishedAt) <= now).map(brief),
    upcoming: scheduled.filter(n => Date.parse(n.publishedAt) > now).sort((a, b) => a.publishedAt.localeCompare(b.publishedAt)).map(brief),
    drafts: patientNotes.filter(n => !n.publishedAt).map(brief),
    note: 'Source schedule only. Verify live URLs and sitemap before claiming publication; a failed deployment does not create more daily slots.'
  }, null, 2))
} finally {
  await rm(temp, { recursive: true, force: true })
}
