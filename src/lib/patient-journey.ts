import type { Hono } from 'hono'
import { visiblePatientNotes, type PatientNote } from '../data/patient-notes'

const h = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
const normalize = (s: string) => s.replace(/\.html$/, '').replace(/\/$/, '')
export const visitRegions = [
  { slug: 'cheonan', name: '천안', intro: '가까운 곳이어도 어느 진료부터 예약해야 할지 망설여질 수 있습니다. 처음 겪는 불편인지, 예전에 치료한 부위가 다시 불편한지부터 알려주세요.', schedule: '평일 일을 마친 뒤나 주말에 방문하려면 원하는 날짜의 진료 가능 시간과 필요한 상담 시간을 먼저 확인하세요. 진료시간과 마지막 접수시간은 같지 않을 수 있습니다.' },
  { slug: 'asan', name: '아산', intro: '아산에서 천안 불당동으로 오실 때는 거리가 가까운지보다 첫 방문에서 무엇을 확인할 수 있는지가 더 궁금할 수 있습니다. 이전 치료와 반복된 수리 내용을 짧게 정리해 주세요.', schedule: '출발하시는 동네와 교통 상황에 따라 이동 시간이 달라집니다. 퇴근 후 방문이라면 마지막 접수 가능 시간, 부품이나 추가 검사가 필요할 때의 다음 일정을 먼저 상의하세요.' },
  { slug: 'hongseong', name: '홍성', intro: '홍성에서 오려면 진료뿐 아니라 이동과 하루 일정을 함께 생각하게 됩니다. 자료를 다 갖추지 못했더라도, 지금 가진 것과 없는 것을 알려 첫 상담을 준비하실 수 있습니다.', schedule: '방문 가능한 요일과 귀가 일정을 미리 알려주세요. 이전 영상·진료기록을 가져갈 수 있는지, 첫날 확인할 범위와 추가 방문 가능성을 나누어 문의하세요.' },
  { slug: 'yesan', name: '예산', intro: '검사는 괜찮다고 들었는데 불편이 남아 있거나, 치료를 이어갈 곳을 바꾸려면 같은 설명을 다시 해야 한다는 부담이 생깁니다. 언제 어떤 상황에서 불편한지 메모 하나부터 준비해 보세요.', schedule: '예산에서 방문하기 전 기존 검사 날짜와 자료 유무를 알려주세요. 예약일에 가능한 상담 범위와 이후 경과 확인 일정을 함께 물어보면 이동 계획을 세우는 데 도움이 됩니다.' },
  { slug: 'dangjin', name: '당진', intro: '당진에서 다른 병원의 의견을 듣기 위해 오신다면 치료를 바로 결정해야 한다고 부담을 갖지 않으셔도 됩니다. 서로 다른 치료계획에서 이해하기 어려웠던 점부터 질문해 주세요.', schedule: '치료계획서나 검사 자료가 있다면 준비 방법을 문의하세요. 한 번의 방문으로 치료가 끝난다고 가정하지 않고, 검사·설명과 실제 치료 일정을 구분해 확인하세요.' },
  { slug: 'seosan', name: '서산', intro: '서산에서 시간을 내어 오는데 필요한 자료가 빠질까 걱정될 수 있습니다. 첫 방문에 모든 답을 가져오실 필요는 없습니다. 무엇이 있는지부터 알려주시면 준비할 내용을 확인할 수 있습니다.', schedule: '출발 전에 보유 자료의 파일 형식과 전달 방법, 상담에 필요한 시간, 추가 방문 가능성을 문의하세요. 대중교통을 이용한다면 귀가편까지 고려해 일정을 상의해 주세요.' }
] as const

function links(notes: PatientNote[]) {
  return `<ul class="bd-journey-links">${notes.map(n => `<li><a href="/concerns/${h(n.slug)}">${h(n.title)} <span aria-hidden="true">→</span></a></li>`).join('')}</ul>`
}
export function relatedNotes(path: string, notes = visiblePatientNotes()) {
  const p = normalize(path)
  return notes.filter(n => n.related.some(l => normalize(l.href) === p) ||
    (p === '/guide/implant' && n.topic === '임플란트') ||
    (p === '/guide/root-canal' && n.topic === '신경치료') ||
    (p === '/guide/invisalign' && n.topic === '교정 유지관리'))
}
export function visitPreparation(slug?: string) {
  const region = visitRegions.find(r => r.slug === slug)
  return `<section class="bd-journey" id="visit-preparation" aria-labelledby="visit-preparation-title" data-cta-location="visit_preparation"><div class="bd-journey-kicker">서울비디치과 · 첫 상담을 준비하는 마음</div><h2 id="visit-preparation-title">${region ? `${region.name}에서 오시기 전, 함께 확인해 주세요.` : '무엇부터 말해야 할지 막막하셔도 괜찮습니다.'}</h2><p>${region ? region.intro : '지금 가장 불편한 점 한 가지부터 말씀해 주세요. 치료 종류나 비용을 모두 알아보고 오실 필요는 없습니다. 다른 치과에서 치료받았거나 자료가 없는 경우도, 그 상황부터 알려주세요.'}</p><div class="bd-journey-grid"><div><h3>있다면 준비할 자료</h3><ul><li>이전 치료계획서·검사 영상·제품 카드 등 가지고 계신 자료</li><li>언제부터, 어느 부위가, 어떤 때 불편한지 적은 짧은 메모</li><li>서로 다른 설명을 들었다면 비교하고 싶은 질문</li></ul><p>자료가 없으면 없다고 알려주세요. 전달 방법은 예약할 때 확인하시면 됩니다.</p></div><div><h3>일정을 잡을 때 물어볼 것</h3><p>${region ? region.schedule : '첫날 가능한 평가 범위, 상담에 필요한 시간과 추가 방문 가능성을 나누어 물어보세요. 검사 결과와 부품·제작 여부에 따라 치료 일정은 달라질 수 있습니다.'}</p><p>첫 상담 예약은 당일 치료 완료를 약속하는 절차가 아닙니다. 확인된 내용부터 다음 단계를 함께 정합니다.</p></div></div><p class="bd-journey-place">진료 장소: 충남 천안시 서북구 불당34길 14, 서울비디치과. 지역 안내는 이곳으로 방문하는 분을 위한 내용입니다.</p><div class="bd-journey-actions"><a href="${region ? '/reservation' : '#rsvForm'}" class="bd-journey-primary">${region ? '내 상황으로 상담 문의하기' : '상담 신청서로 이동'}</a><a href="tel:0414152892">전화로 준비 사항 확인</a><a href="/directions">위치·주차·길찾기 확인</a></div>${!region ? `<nav class="bd-journey-regions" aria-label="지역별 방문 준비">${visitRegions.map(r => `<a href="/area/${r.slug}#visit-preparation">${r.name}에서 방문 준비</a>`).join('')}</nav>` : ''}</section>`
}

export function registerPatientJourney(app: Hono<any>) {
  app.use('*', async (c, next) => {
    const path = normalize(new URL(c.req.url).pathname)
    const region = visitRegions.find(r => path === '/area/' + r.slug)
    const guide = path.startsWith('/guide/')
    const reservation = path === '/reservation'
    if (!region && !guide && !reservation) return next()
    await next()
    if (c.res.status !== 200 || !c.res.headers.get('content-type')?.includes('text/html')) return
    const notes = visiblePatientNotes()
    const relevant = (region ? notes.filter(n => n.region === region.name) : guide ? relatedNotes(path, notes) : []).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    let addition = region || reservation ? visitPreparation(region?.slug) : ''
    if (relevant.length) addition += `<section class="bd-journey" aria-label="관련 고민 노트"><div class="bd-journey-kicker">설명 다음에는, 내 이야기</div><h2>비슷한 상황에서 이런 걱정을 하셨나요?</h2><p>치료의 전체 설명과 별개로 마음에 걸리는 구체적인 상황을 함께 살펴봅니다.</p>${links(relevant.slice(0, 6))}<a href="/concerns">다른 고민 노트 찾아보기 →</a></section>`
    if (!addition) return
    let html = await c.res.text()
    if (html.includes('id="visit-preparation"')) {
      c.res = new Response(html, { status: c.res.status, headers: c.res.headers })
      return
    }
    // Replace the original fixed note teaser with the current, publication-aware list.
    if (guide && relevant.length) html = html.replace(/<!-- patient-notes-links -->\s*<section[\s\S]*?<\/section>/, '')
    html = html.replace('</head>', '<link rel="stylesheet" href="/static/patient-journey.css?v=20260921"></head>')
    html = html.includes('</main>') ? html.replace('</main>', addition + '</main>') : html.replace(/<footer\b/, addition + '<footer')
    const headers = new Headers(c.res.headers)
    headers.delete('content-length'); headers.delete('etag')
    // Scheduled note links appear only after release time, never via a cached early list.
    headers.set('Cache-Control', 'no-store')
    c.res = new Response(html, { status: c.res.status, headers })
  })
}
