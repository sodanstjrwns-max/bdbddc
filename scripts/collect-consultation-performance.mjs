// Read-only GA4/GSC measurement check and publication-age cohorts.
// Writes aggregate reports only; never reads reservation records or exports credentials.
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { build } from 'esbuild'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const arg = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback
const day = d => new Date(d).toISOString().slice(0, 10)
const addDays = (d, n) => day(Date.parse(d + 'T12:00:00Z') + n * 86400000)
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const end = arg('--end', addDays(today, -3))
if (!/^\d{4}-\d{2}-\d{2}$/.test(end) || end > addDays(today, -2)) throw Error('Use a complete reporting date at least two days ago')
const out = path.resolve(arg('--output', '/Users/msj/bddc/reports/2026-09-17-notes-search-launch/' + today + '-performance'))
await fs.mkdir(out, { recursive: true })
try { await fs.access(path.join(out, 'report.json')); throw Error('Existing report: choose a new output directory') } catch (e) { if (e.code !== 'ENOENT') throw e }
const tmp = await fs.mkdtemp(path.join(tmpdir(), 'bd-notes-metrics-'))
let notes
try {
  await build({ entryPoints: ['src/data/patient-notes.ts'], bundle: true, format: 'esm', platform: 'node', outfile: path.join(tmp, 'notes.mjs'), logLevel: 'error' })
  notes = (await import(pathToFileURL(path.join(tmp, 'notes.mjs')))).visiblePatientNotes()
} finally { await fs.rm(tmp, { recursive: true, force: true }) }
const first = notes.map(n => n.publishedAt.slice(0, 10)).sort()[0]
const sa = JSON.parse(await fs.readFile(process.env.BDDC_GOOGLE_SA || '/Users/msj/bddc/content-pipeline/daily-watch/gcp-sa.json', 'utf8'))
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url')
const now = Math.floor(Date.now() / 1000)
const jwt = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })
const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt + '.' + crypto.createSign('RSA-SHA256').update(jwt).sign(sa.private_key).toString('base64url') }), signal: AbortSignal.timeout(30000) })
const token = await auth.json()
if (!auth.ok || !token.access_token) throw Error('Google authentication failed: ' + auth.status)
const manifest = []
async function query(name, url, request) {
  const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify(request), signal: AbortSignal.timeout(60000) })
  const response = await r.json()
  await fs.writeFile(path.join(out, name + '.json'), JSON.stringify({ fetchedAt: new Date().toISOString(), request, status: r.status, response }, null, 2))
  if (!r.ok || response.error) throw Error(name + ': API error ' + r.status)
  manifest.push({ name, rowCount: response.rowCount || response.rows?.length || 0, returned: response.rows?.length || 0, metadata: response.metadata || null })
  if (response.rowCount > (response.rows?.length || 0) || response.rows?.length >= 25000) throw Error(name + ': row limit reached; paginate before reporting')
  return response
}
const exact = (fieldName, value, matchType = 'EXACT') => ({ filter: { fieldName, stringFilter: { matchType, value } } })
const ga = (name, dimensions, metrics, dimensionFilter, start = addDays(end, -55)) => query(name, 'https://analyticsdata.googleapis.com/v1beta/properties/524641631:runReport', { dateRanges: [{ startDate: start, endDate: end }], dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })), ...(dimensionFilter ? { dimensionFilter } : {}), limit: '100000' })
const sc = (name, dimensions, filters, start) => query(name, 'https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Abdbddc.com/searchAnalytics/query', { startDate: start, endDate: end, dimensions, dataState: 'final', type: 'web', rowLimit: 25000, ...(filters ? { dimensionFilterGroups: [{ filters }] } : {}) })
const metricNames = ['sessions', 'engagedSessions', 'screenPageViews', 'userEngagementDuration']
const eventNames = ['phone_call_click', 'kakao_click', 'naver_booking_click', 'reservation_click', 'generate_lead', 'contact', 'reservation_complete', 'consultation_cta_view', 'content_read_complete']
const selectedEvents = { filter: { fieldName: 'eventName', inListFilter: { values: eventNames } } }
const cityFilter = { andGroup: { expressions: [exact('country', 'South Korea'), { filter: { fieldName: 'city', inListFilter: { values: ['Cheonan-si', 'Asan-si', 'Hongseong-gun', 'Yesan-gun', 'Dangjin-si', 'Seosan-si'] } } }] } }
const jobs = [
  ['ga_daily', () => ga('ga_daily', ['date'], metricNames)],
  ['ga_missing', () => ga('ga_missing', ['date'], metricNames, exact('landingPage', '(not set)'))],
  ['ga_events', () => ga('ga_events', ['date', 'eventName'], ['eventCount'], selectedEvents)],
  ['ga_regions', () => ga('ga_regions', ['city'], metricNames, cityFilter, addDays(end, -27))],
  ['ga_region_events', () => ga('ga_region_events', ['city', 'eventName'], ['eventCount'], { andGroup: { expressions: [cityFilter, selectedEvents] } }, addDays(end, -27))],
  ['ga_note_entries', () => ga('ga_note_entries', ['date', 'landingPage'], metricNames, exact('landingPage', '/concerns/', 'BEGINS_WITH'), first)],
  ['ga_note_intent', () => ga('ga_note_intent', ['date', 'landingPage', 'eventName'], ['eventCount'], { andGroup: { expressions: [exact('landingPage', '/concerns/', 'BEGINS_WITH'), selectedEvents] } }, first)],
  ['sc_notes', () => sc('sc_notes', ['date', 'page'], [{ dimension: 'page', operator: 'contains', expression: 'bdbddc.com/concerns/' }], first)],
  ['sc_total', () => sc('sc_total', ['date'], null, addDays(end, -55))]
]
const results = {}
for (let i = 0; i < jobs.length; i += 3) {
  const batch = await Promise.allSettled(jobs.slice(i, i + 3).map(async ([n, fn]) => { results[n] = await fn() }))
  for (const item of batch) if (item.status === 'rejected') throw item.reason
}
function rows(name) {
  const r = results[name]
  return (r.rows || []).map(row => Object.fromEntries([...(r.dimensionHeaders || []).map((h, i) => [h.name, h.name === 'date' ? row.dimensionValues[i].value.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3') : row.dimensionValues[i].value]), ...(r.metricHeaders || []).map((h, i) => [h.name, Number(row.metricValues[i].value)])]))
}
const gaEntries = rows('ga_note_entries'), gaIntent = rows('ga_note_intent')
const scNotes = (results.sc_notes.rows || []).map(r => ({ date: r.keys[0], page: r.keys[1], clicks: r.clicks, impressions: r.impressions }))
const sum = (rs, key) => rs.reduce((n, r) => n + (r[key] || 0), 0)
const cohorts = notes.map(n => {
  const start = n.publishedAt.slice(0, 10), urlPath = '/concerns/' + n.slug
  const observations = [7, 28, 56].map(days => {
    const until = addDays(start, days - 1)
    if (until > end) return { days, status: 'not_mature', availableThrough: end, completeOn: until }
    const within = r => r.date >= start && r.date <= until
    const search = scNotes.filter(r => r.page === 'https://bdbddc.com' + urlPath && within(r))
    const entry = gaEntries.filter(r => r.landingPage === urlPath && within(r))
    const events = gaIntent.filter(r => r.landingPage === urlPath && within(r))
    return { days, status: 'complete', clicks: sum(search, 'clicks'), impressions: sum(search, 'impressions'), sessionsApprox: sum(entry, 'sessions'), eventCounts: Object.fromEntries(eventNames.map(k => [k, sum(events.filter(e => e.eventName === k), 'eventCount')])) }
  })
  return { slug: n.slug, title: n.title, region: n.region, publishedAt: n.publishedAt, observations }
})
const report = { generatedAt: new Date().toISOString(), through: end, property: '524641631', measurementChanged: '2026-09-21', firstFullDayNewDefinition: '2026-09-22', definitions: { intent: ['phone_call_click', 'kakao_click', 'naver_booking_click', 'reservation_click'], savedRequest: 'generate_lead (new definition from 2026-09-22 only)', legacyDoNotSum: ['contact', 'reservation_complete'], reading: 'visible >=30 seconds and scroll >=75%; not proof of comprehension', regions: 'GA inferred city, not patient residence', cohorts: 'Calendar days starting on publication date; GA Asia/Seoul, GSC Pacific reporting dates', reservations: 'No confirmed appointments, visits, revenue or patient identities in this report' }, daily: rows('ga_daily'), missingLanding: rows('ga_missing'), events: rows('ga_events'), regions: rows('ga_regions'), regionalEvents: rows('ga_region_events'), cohorts, manifest, caveats: ['Sessions are approximate and non-additive; day sums are labelled approximate.', 'No-data API rows are reported as zero only within a completed observation window; threshold/sampling metadata must also be reviewed.', 'Historical and new event definitions must not be combined as a single conversion-rate trend.', 'New code cannot repair past missing pageviews.'] }
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
await fs.writeFile(path.join(out, 'REPORT.md'), `# 비디치과 상담 측정·고민 노트 성과\n\n수집: ${report.generatedAt} · 집계 종료: ${end}\n\n2026-09-22부터의 새 정의와 이전 데이터를 나누어 봅니다. 전화·카카오·네이버·예약 화면 클릭은 문의 의향이며, generate_lead는 서버 저장이 확인된 상담 신청입니다. 실제 예약 확정·내원은 별도입니다. 이벤트 합계를 환자 수로 계산하지 않습니다.\n\n공개 노트 ${notes.length}편. 첫 7/28/56일 관측은 발행일을 포함한 달력 날짜 기준이며, 기간이 다 지나지 않은 글은 미성숙(not_mature)으로 표시합니다. GA와 GSC 날짜 기준은 다릅니다.\n\n|노트|지역|첫 7일|첫 28일|첫 56일|\n|---|---|---|---|---|\n${cohorts.map(n => '|'+n.title.replace(/\|/g, ' ')+'|'+n.region+'|'+n.observations.map(o => o.status === 'complete' ? `${o.impressions}노출 / ${o.clicks}클릭` : '관측 중').join('|')+'|').join('\n')}\n\n측정 누락: ga_missing.json과 ga_daily.json을 날짜별로 비교합니다. 지역별 클릭: ga_region_events.json. 사이트 전체 검색 순증: sc_total.json. API 원본 및 임계값·표본 여부는 각 응답 metadata와 report.json에 보존했습니다.\n`)
console.log(JSON.stringify({ output: out, through: end, notes: notes.length, reports: manifest.length }))
