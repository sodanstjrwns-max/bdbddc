// GA4 동선 보고서 (읽기 전용). 측정 정의 20261111 이후 데이터용.
// 네 가지를 한 문서로 뽑는다: ① 유입에서 연락까지 ② 예약 페이지 단계별 이탈 ③ 콘텐츠 기여 ④ 버튼별 성과.
// 개인 정보는 다루지 않는다. 집계 수치만 읽고, 예약 기록은 읽지 않는다.
// 실행: node scripts/ga-journey-report.mjs [--start 2026-11-11] [--end 2026-11-17] [--out 경로.md]
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const args = process.argv.slice(2)
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d)
const day = d => new Date(d).toISOString().slice(0, 10)
const add = (d, n) => day(Date.parse(d + 'T12:00:00Z') + n * 864e5)
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
const FIRST_DAY = '2026-11-11' // 새 측정 정의가 하루 종일 적용된 첫 날
const end = arg('--end', add(today, -2))
const start = arg('--start', add(end, -6) < FIRST_DAY ? FIRST_DAY : add(end, -6))
const out = arg('--out', `/Volumes/MSJ_WORK/Workspaces/bddc/reports/ga-journey/${end}.md`)
const PROPERTY = '524641631'

const sa = JSON.parse(fs.readFileSync(process.env.BDDC_GOOGLE_SA || '/Volumes/MSJ_WORK/Workspaces/bddc/content-pipeline/daily-watch/gcp-sa.json', 'utf8'))
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url')
const now = Math.floor(Date.now() / 1000)
const head = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3000 })
const token = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: head + '.' + crypto.createSign('RSA-SHA256').update(head).sign(sa.private_key, 'base64url') }) })).json()
if (!token.access_token) throw Error('Google 인증 실패')

async function report(dimensions, metrics, eventNames, extraFilter) {
  const filters = []
  if (eventNames) filters.push({ filter: { fieldName: 'eventName', inListFilter: { values: eventNames } } })
  if (extraFilter) filters.push(extraFilter)
  const body = { dateRanges: [{ startDate: start, endDate: end }], dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })), limit: 5000 }
  if (filters.length) body.dimensionFilter = filters.length === 1 ? filters[0] : { andGroup: { expressions: filters } }
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, { method: 'POST', headers: { Authorization: 'Bearer ' + token.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const j = await r.json()
  if (!r.ok) throw Error(`GA 조회 실패(${dimensions.join(',')}): ${j.error?.message || r.status}`)
  return (j.rows || []).map(row => ({ d: row.dimensionValues.map(v => v.value), m: row.metricValues.map(v => Number(v.value)) }))
}
const is = (fieldName, value) => ({ filter: { fieldName, stringFilter: { matchType: 'EXACT', value } } })
const CONTACT = ['phone_call_click', 'kakao_click', 'naver_booking_click', 'reservation_click']
const KO = { phone_call_click: '전화', kakao_click: '카카오톡', naver_booking_click: '네이버 예약', reservation_click: '예약 페이지 이동', generate_lead: '상담 신청 완료' }
const pct = (a, b) => (b ? (a / b * 100).toFixed(1) + '%' : '-')
const table = (head, rows) => rows.length ? ['| ' + head.join(' | ') + ' |', '|' + head.map(() => '---').join('|') + '|', ...rows.map(r => '| ' + r.join(' | ') + ' |')].join('\n') : '_아직 데이터가 없습니다._'
const sum = (rows, pick) => rows.filter(pick).reduce((a, r) => a + r.m[0], 0)

const lines = [`# 홈페이지 동선 보고서 ${start} ~ ${end}`, '', `측정 정의 20261111 기준. 사용자 수는 GA 추정치이며, 새 맞춤 항목은 등록(2026-11-11) 이후 데이터만 있습니다.`, '']

// ① 유입에서 연락까지 — 지역별
{
  const users = await report(['customUser:visitor_area'], ['totalUsers'], ['page_context'])
  const decision = await report(['customUser:visitor_area'], ['totalUsers'], ['page_context'], { filter: { fieldName: 'customEvent:page_type', inListFilter: { values: ['treatment', 'doctor', 'pricing', 'reservation'] } } })
  const contact = await report(['customUser:visitor_area'], ['totalUsers'], CONTACT)
  const lead = await report(['customUser:visitor_area'], ['totalUsers'], ['generate_lead'])
  const get = (rows, k) => rows.find(r => r.d[0] === k)?.m[0] || 0
  const areas = [...new Set(users.map(r => r.d[0]))].sort((a, b) => get(users, b) - get(users, a))
  const label = { cheonan: '천안', asan: '아산', chungnam: '충남 기타', outside: '그 외 지역', unknown: '첫 페이지(미확인)', '(not set)': '미확인' }
  lines.push('## 1. 유입에서 연락까지 (방문자 지역별)', '', table(['지역', '방문자', '진료·의료진·비용·예약 페이지를 본 사람', '연락 버튼을 누른 사람', '상담 신청 완료'],
    areas.map(a => [label[a] || a, get(users, a), `${get(decision, a)} (${pct(get(decision, a), get(users, a))})`, `${get(contact, a)} (${pct(get(contact, a), get(users, a))})`, get(lead, a)])), '')
  const channel = await report(['sessionDefaultChannelGroup'], ['sessions'], null)
  const channelContact = await report(['sessionDefaultChannelGroup'], ['sessions'], CONTACT)
  lines.push('유입 경로별:', '', table(['유입 경로', '방문', '연락 버튼을 누른 방문'],
    channel.sort((a, b) => b.m[0] - a.m[0]).slice(0, 8).map(r => { const c = channelContact.find(x => x.d[0] === r.d[0])?.m[0] || 0; return [r.d[0], r.m[0], `${c} (${pct(c, r.m[0])})`] })), '')
}

// ② 예약 페이지 단계별 이탈
{
  const steps = [['reservation_view', '예약 페이지 도착'], ['reservation_form_start', '폼 입력 시작'], ['reservation_submit_attempt', '신청 버튼 누름'], ['generate_lead', '상담 신청 완료']]
  const rows = await report(['eventName'], ['totalUsers'], steps.map(s => s[0]).concat('reservation_submit_error'))
  const get = k => rows.find(r => r.d[0] === k)?.m[0] || 0
  const first = get('reservation_view')
  lines.push('## 2. 예약 페이지 단계별 이탈', '', table(['단계', '사람 수', '도착 대비'], steps.map(([k, name]) => [name, get(k), pct(get(k), first)])), '')
  lines.push(`신청 버튼을 눌렀지만 저장되지 않은 사람: ${get('reservation_submit_error')}명`, '')
  const other = await report(['eventName'], ['totalUsers'], ['phone_call_click', 'kakao_click', 'naver_booking_click'], is('customEvent:page_type', 'reservation'))
  lines.push('예약 페이지에서 폼 대신 다른 수단을 누른 사람:', '', table(['수단', '사람 수'], other.map(r => [KO[r.d[0]], r.m[0]])), '')
}

// ③ 콘텐츠 기여
{
  const types = ['encyclopedia', 'guide', 'column', 'blog', 'concern', 'area', 'cases', 'video']
  const views = await report(['customEvent:page_type'], ['totalUsers'], ['page_context'])
  const nav = await report(['customEvent:page_type', 'customEvent:link_target_type'], ['totalUsers'], ['nav_click'])
  const contact = await report(['customEvent:page_type'], ['totalUsers'], CONTACT)
  const read = await report(['customEvent:page_type'], ['totalUsers'], ['content_read_complete'])
  const get = (rows, k) => rows.find(r => r.d[0] === k)?.m[0] || 0
  const name = { encyclopedia: '백과사전', guide: '가이드', column: '컬럼', blog: '블로그', concern: '고민 노트', area: '지역 안내', cases: '치료 사례', video: '영상' }
  lines.push('## 3. 콘텐츠 기여', '', table(['콘텐츠', '본 사람', '끝까지 읽은 사람', '진료·의료진·비용으로 이동', '연락 버튼 누름'],
    types.map(t => { const v = get(views, t), n = sum(nav, r => r.d[0] === t); return [name[t], v, `${get(read, t)} (${pct(get(read, t), v)})`, `${n} (${pct(n, v)})`, `${get(contact, t)} (${pct(get(contact, t), v)})`] })), '')
  const topic = await report(['customEvent:treatment_topic'], ['totalUsers'], ['page_context'])
  const topicContact = await report(['customEvent:treatment_topic'], ['totalUsers'], CONTACT)
  lines.push('진료 분야별:', '', table(['진료 분야', '본 사람', '연락 버튼 누름'],
    topic.filter(r => r.d[0] !== 'none' && r.d[0] !== '(not set)').sort((a, b) => b.m[0] - a.m[0]).map(r => { const c = get(topicContact, r.d[0]); return [r.d[0], r.m[0], `${c} (${pct(c, r.m[0])})`] })), '')
}

// ④ 버튼별 성과
{
  const rows = await report(['customEvent:cta_location', 'eventName'], ['eventCount'], CONTACT)
  const where = { navigation: '상단 메뉴', floating: '하단·떠 있는 버튼', content: '본문', toc: '목차 줄', footer: '하단 정보', sidebar: '옆 영역', article_end: '글 끝 카드', article_related: '글 끝 관련 진료', note_closing: '고민 노트 끝', note_sidebar: '고민 노트 옆', note_hub: '고민 노트 목록', note_treatment: '고민 노트 진료 링크' }
  const locs = [...new Set(rows.map(r => r.d[0]))].map(l => [l, sum(rows, r => r.d[0] === l)]).sort((a, b) => b[1] - a[1])
  lines.push('## 4. 버튼별 성과', '', table(['버튼 위치', '전화', '카카오톡', '네이버 예약', '예약 페이지 이동', '합계'],
    locs.map(([l, total]) => [where[l] || l, ...CONTACT.map(e => rows.find(r => r.d[0] === l && r.d[1] === e)?.m[0] || 0), total])), '')
  const sections = await report(['customEvent:section_name'], ['totalUsers'], ['section_view'])
  const label = { summary: '한눈에 보기', cost: '비용·일정', price_table: '가격표', doctors: '의료진', videos: '영상', videos_more: '영상 더 보기 펼침', related_treatment: '관련 진료 링크', closing_contact: '글 끝 상담 카드' }
  lines.push('구간 도달(사람 수):', '', table(['구간', '도달한 사람'], sections.sort((a, b) => b.m[0] - a.m[0]).map(r => [label[r.d[0]] || r.d[0], r.m[0]])), '')
  const video = await report(['eventName'], ['eventCount', 'totalUsers'], ['video_play', 'faq_open'])
  lines.push(table(['행동', '횟수', '사람 수'], video.map(r => [r.d[0] === 'video_play' ? '영상 재생' : 'FAQ 펼침', r.m[0], r.m[1]])), '')
}

fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, lines.join('\n') + '\n')
console.log(`보고서 저장: ${out} (${start} ~ ${end})`)
