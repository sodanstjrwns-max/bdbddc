// Read-only SEO operations from existing API data and the authenticated build audit.
// No invented ranking score, AI citation count, or inferred patient visits.
export type SeoPriority = {
  kind: 'page' | 'query'; target: string; clicks: number; impressions: number;
  ctr: number; position: number | null; reason: string; action: string;
}
const BASE = 'https://bdbddc.com'
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0
const value = (v: unknown) => finite(v) ? v.toLocaleString('ko-KR') : '—'
const arr = (v: unknown): any[] => Array.isArray(v) ? v : []
const str = (v: any, keys: string[]) => keys.map(k => v?.[k]).find(x => typeof x === 'string') || ''
const ownPath = (s: string): string | null => {
  try { const u = new URL(s, BASE); return u.origin === BASE && !u.search && !u.hash && s.trim() ? u.pathname : null } catch { return null }
}

export function buildSeoPriorities(d: any): SeoPriority[] {
  if (!d || d.configured === false) return []
  const out: SeoPriority[] = []
  for (const r of arr(d.gsc?.topPages)) {
    const target = ownPath(str(r, ['page', 'url', 'path', 'name', 'key']))
    if (!target || !finite(r.clicks) || !finite(r.impressions) || r.impressions < 100 || r.clicks > r.impressions) continue
    const ctr = r.clicks / r.impressions
    if (ctr >= 0.02) continue
    out.push({ kind: 'page', target, clicks: r.clicks, impressions: r.impressions, ctr, position: null,
      reason: '노출 100회 이상·CTR 2% 미만', action: '유입 검색어와 제목·설명·첫 답변의 일치 여부 확인. 순위와 검색 의도를 함께 검토하세요.' })
  }
  for (const r of arr(d.risers)) {
    const target = str(r, ['query', 'name', 'key'])
    if (!target || !finite(r.position) || r.position < 4 || r.position > 20 || !finite(r.clicks) || !finite(r.impressions) || r.impressions < 30 || r.clicks > r.impressions) continue
    out.push({ kind: 'query', target, clicks: r.clicks, impressions: r.impressions, ctr: r.clicks / r.impressions, position: r.position,
      reason: '상승 검색어 표본 중 평균 순위 4~20위', action: 'GSC에서 이 검색어에 노출되는 URL을 확인한 뒤 기존 대표 페이지의 답변·근거·내부 링크를 보강하세요.' })
  }
  return out.sort((a, b) => b.impressions - a.impressions || a.target.localeCompare(b.target)).slice(0, 30)
}

export async function loadSeoHealth(env: any, requestUrl: string): Promise<any | null> {
  if (!env.ASSETS) return null
  try {
    const r = await env.ASSETS.fetch(new Request(new URL('/admin/seo-health.json', requestUrl).toString()))
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return null
    const text = await r.text()
    if (text.length > 1_000_000) return null
    const j = JSON.parse(text)
    return j?.version === 1 && finite(j.checkedPages) && Array.isArray(j.pages) && Array.isArray(j.issues) ? j : null
  } catch { return null }
}

export function renderSeoOperations(d: any, health: any): string {
  const configured = d && d.configured !== false
  const split = configured ? d.brandSplit : null
  const total = split && finite(split.brandClicks) && finite(split.nonBrandClicks) ? split.brandClicks + split.nonBrandClicks : null
  const nonBrandShare = total && split ? (split.nonBrandClicks / total * 100).toFixed(1) + '%' : '—'
  const priorities = buildSeoPriorities(d)
  const date = (v: any) => typeof v === 'string' && Number.isFinite(Date.parse(v)) ? esc(v.replace('T', ' ').replace('Z', ' UTC')) : '확인 불가'
  const range = d?.range?.start && d?.range?.end ? `${esc(d.range.start)} ~ ${esc(d.range.end)}` : '기간 정보 없음'
  const events = configured ? arr(d.convEvents).filter(r => typeof r.event === 'string' && finite(r.count)) : []
  const eventLabel: Record<string, string> = {
    phone_click: '전화 버튼 클릭 (통화 연결 아님)', naver_booking_click: '네이버 예약으로 이동 (완료 아님)',
    reservation_click: '예약 화면 이동', reservation_complete: '상담 신청 완료 이벤트 (예약 확정 아님)',
    form_submit_success: '폼 제출 성공 이벤트', form_submit_attempt: '폼 제출 시도',
    cta_click: '콘텐츠 CTA 클릭', generate_lead: 'GA 리드 이벤트 (정의 확인 필요)'
  }
  const local = configured && d.localStats?.supported === true ? arr(d.localStats.tables) : []
  const localValue = (name: string) => local.find(r => r.name === name)?.cur
  const priorityRows = priorities.map(p => `<tr data-seo-kind="${p.kind}"><td>${p.kind === 'page' ? '페이지' : '검색어'}</td><td class="txt">${p.kind === 'page' ? `<a href="${esc(p.target)}" target="_blank" rel="noopener noreferrer">${esc(p.target)}</a>` : esc(p.target)}</td><td class="num">${value(p.impressions)}</td><td class="num">${value(p.clicks)}</td><td class="num">${(p.ctr * 100).toFixed(2)}%</td><td class="num">${p.position === null ? '미제공' : p.position.toFixed(1)}</td><td class="txt">${esc(p.reason)}<br><small>${esc(p.action)}</small></td></tr>`).join('')
  const focus = [
    ['/treatments/implant', '임플란트'], ['/treatments/sedation', '수면·진정치료'],
    ['/treatments/glownate', '글로우네이트'], ['/treatments/invisalign', '인비절라인']
  ]
  const focusRows = focus.map(([path, label]) => {
    const r = arr(d?.gsc?.topPages).find(x => ownPath(str(x, ['page', 'url', 'path', 'name', 'key'])) === path)
    const checked = arr(health?.pages).find(x => x.url === path)
    return `<tr><td><a href="${path}" target="_blank" rel="noopener noreferrer">${label}</a></td><td>${checked?.decisionGuide ? '선택 가이드 확인' : '빌드 확인 필요'}</td><td class="num">${value(r?.clicks)}</td><td class="num">${value(r?.impressions)}</td><td>${!r ? '상위 페이지 표본에 없음 / 미제공' : 'GSC 상위 페이지 표본'}</td></tr>`
  }).join('')
  const issueNames: Record<string, string> = {
    'jsonld-invalid': '구조화 데이터 문법', 'duplicate-title': '제목 중복', 'canonical-invalid': '대표 URL',
    'heading-count': 'H1 개수', 'description-missing': '검색 설명', 'language-mismatch': '언어 연결',
    'language-group-conflict': '번역 연결 충돌', 'decision-link-missing': '진료 안내 링크', 'crawler-private-path': '크롤러 제외 규칙'
  }
  const audit = health ? `<p>빌드 생성: ${date(health.generatedAt)} · 소스 커밋 ${esc(health.commit)}</p>
    <div class="grid metrics"><div class="card metric"><span class="m-label">검사한 정적 페이지</span><strong>${value(health.checkedPages)}</strong></div><div class="card metric"><span class="m-label">배포 차단 오류</span><strong>${value(health.errors)}</strong></div><div class="card metric"><span class="m-label">수동 검토 경고</span><strong>${value(health.warnings)}</strong></div><div class="card metric"><span class="m-label">동기화한 언어 묶음</span><strong>${value(health.fixes?.languageGroups)}</strong></div></div>
    <p class="seo-help">canonical·제목·JSON 문법·언어 연결·주요 진료 링크·비공개 파일 제외를 검사합니다. 실제 색인·검색 순위·스키마 리치결과 자격·의학적 정확성·방문자 속도를 인증하는 점수가 아닙니다. 동적 칼럼·백과사전 전체는 별도 운영 검증이 필요합니다.</p>
    ${health.issues.length ? `<ul>${health.issues.slice(0,30).map((i:any)=>`<li>${esc(issueNames[i.code] || i.code)} · ${esc(i.url)} — ${esc(i.message)}</li>`).join('')}</ul>` : '<p>현재 빌드 검사 범위에서 발견된 오류·경고가 없습니다.</p>'}
    <a href="/admin/seo-health.json" download="seo-build-audit.json">전체 빌드 검사 JSON 다운로드</a>` : '<p class="seo-help">빌드 검사 결과를 불러오지 못했습니다. 정상이라고 표시하지 않습니다. 최신 빌드와 ASSETS 연결을 확인해주세요.</p>'
  const serialized = JSON.stringify(priorities).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
  return `<section id="seo-operations" class="seo-operations" aria-labelledby="seo-operations-title">
    <style>.seo-operations{scroll-margin-top:20px}.seo-operations .card{margin-bottom:18px}.seo-help{font-size:.84rem;color:var(--sub);line-height:1.8;margin:10px 0 16px}.seo-tools{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.seo-tools input,.seo-tools select,.seo-tools button{background:var(--bg);color:var(--text);padding:10px 12px;border:1px solid var(--border);border-radius:8px;max-width:100%}.seo-tools button{cursor:pointer}.seo-scroll{overflow:auto}.seo-operations table{min-width:560px}.seo-operations small{color:var(--sub)}.seo-operations h2{line-height:1.5}.seo-operations ul{padding-left:20px;overflow-wrap:anywhere}.seo-operations a{color:var(--accent)}.seo-operations .metric strong{font-size:1.35rem}</style>
    <h2 id="seo-operations-title">SEO·AEO 운영 점검</h2>
    <p class="seo-help">실측 기간: ${range} · 중앙 데이터 갱신: ${date(d?.updatedAt)}<br>확인되지 않은 값은 ‘—’로 표시합니다. 개선 후보는 점검을 돕는 규칙이며 순위 상승·AI 인용을 보장하지 않습니다.</p>
    <section class="card"><h2>브랜드 검색과 새로운 환자 유입을 분리해서 보기</h2><div class="grid metrics">
      <div class="metric"><span class="m-label">브랜드 검색 클릭</span><strong>${value(split?.brandClicks)}</strong></div>
      <div class="metric"><span class="m-label">비브랜드 검색 클릭</span><strong>${value(split?.nonBrandClicks)}</strong></div>
      <div class="metric"><span class="m-label">분류된 클릭 중 비브랜드 비중</span><strong>${nonBrandShare}</strong></div>
      <div class="metric"><span class="m-label">AI 서비스 유입 세션</span><strong>${value(configured ? d.ai?.sessions : null)}</strong></div>
    </div><p class="seo-help">브랜드 분류는 중앙 API 정의를 따르며 검색어 비공개·집계 범위 차이로 전체 GSC와 다를 수 있습니다. AI 유입은 클릭해서 들어온 세션이며 AI 답변의 인용 횟수가 아닙니다.</p></section>
    <section class="card"><h2>어떤 페이지부터 손볼까요?</h2><p class="seo-help">상위 페이지 및 상승 검색어 표본만 사용합니다. 노출 100회 이상·CTR 2% 미만 페이지, 또는 노출 30회 이상·평균 순위 4~20위 상승 검색어를 노출순으로 표시합니다. 이는 내부 점검 기준이지 검색엔진 기준이 아닙니다. 검색어별 노출 URL은 GSC에서 추가 확인하세요.</p>
      <div class="seo-tools"><label>종류 <select id="seo-kind"><option value="all">전체</option><option value="page">페이지</option><option value="query">검색어</option></select></label><label>찾기 <input id="seo-filter" type="search" placeholder="페이지 또는 검색어"></label><button type="button" id="seo-export" ${priorities.length ? '' : 'disabled'}>개선 후보 CSV 다운로드</button></div>
      <div class="seo-scroll"><table id="seo-priorities"><thead><tr><th>종류</th><th>대상</th><th>노출</th><th>클릭</th><th>CTR</th><th>평균 순위</th><th>선정 이유·다음 행동</th></tr></thead><tbody>${priorityRows}</tbody></table></div><p id="seo-filter-status" class="seo-help" role="status">${priorities.length ? priorities.length + '개 점검 후보' : '현재 데이터 표본에서 조건에 맞는 후보가 없거나 데이터가 미제공 상태입니다.'}</p>
    </section>
    <section class="card"><h2>핵심 진료 4개 페이지</h2><div class="seo-scroll"><table><thead><tr><th>진료</th><th>구현</th><th>검색 클릭</th><th>검색 노출</th><th>데이터 범위</th></tr></thead><tbody>${focusRows}</tbody></table></div><p class="seo-help">상위 10개에 없다는 이유로 방문이 0이거나 색인되지 않았다고 판단하지 않습니다.</p></section>
    <section class="card"><h2>클릭·신청·내원은 다른 지표입니다</h2><div class="grid metrics"><div class="metric"><span class="m-label">국내 상담 접수 기록</span><strong>${value(localValue('reservations'))}</strong></div><div class="metric"><span class="m-label">외국인 상담 접수 기록</span><strong>${value(localValue('intl-reservations'))}</strong></div><div class="metric"><span class="m-label">예약 확정</span><strong>—</strong><small>현재 API에서 미제공</small></div><div class="metric"><span class="m-label">실제 내원</span><strong>—</strong><small>현재 API에서 미제공</small></div></div>
      <div class="seo-scroll"><table><thead><tr><th>이벤트 의미</th><th>이번 기간</th><th>이전 기간</th></tr></thead><tbody>${events.map(r=>`<tr><td>${esc(eventLabel[r.event] || r.label || r.event)}<br><small>${esc(r.event)}</small></td><td class="num">${value(r.count)}</td><td class="num">${value(r.prevCount)}</td></tr>`).join('')}</tbody></table></div><p class="seo-help">이벤트는 한 사람이 여러 번 발생시킬 수 있어 합산하면 중복됩니다. 접수 기록도 예약 확정·실제 내원이 아닙니다. 페이지별 접수·내원 기여도는 현재 응답에 없어 계산하지 않습니다.</p></section>
    <section class="card"><h2>AI 인용·실제 색인은 원본 도구에서 확인</h2><p>AI 답변 인용 횟수: <strong>미연동</strong> · 페이지별 실제 색인 여부: <strong>미연동</strong></p><div class="seo-tools"><a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Google Search Console</a><a href="https://www.bing.com/webmasters/" target="_blank" rel="noopener noreferrer">Bing Webmaster Tools · AI Performance</a><a href="https://searchadvisor.naver.com/" target="_blank" rel="noopener noreferrer">네이버 서치어드바이저</a></div><p class="seo-help">계정에서 제공되는 보고서 범위를 확인하세요. Bing AI 인용 지표를 모든 AI 서비스의 인용 수치로 해석하지 않습니다.</p></section>
    <section class="card" id="seo-build-health"><h2>배포 전 기술 검사</h2>${audit}</section>
    <script>(function(){
      var rows=${serialized};var kind=document.getElementById('seo-kind'),input=document.getElementById('seo-filter');
      function filter(){var n=0;document.querySelectorAll('#seo-priorities tbody tr').forEach(function(tr){var show=(kind.value==='all'||tr.dataset.seoKind===kind.value)&&tr.textContent.toLowerCase().includes(input.value.trim().toLowerCase());tr.hidden=!show;if(show)n++;});document.getElementById('seo-filter-status').textContent=n+'개 점검 후보';}
      kind.addEventListener('change',filter);input.addEventListener('input',filter);
      document.getElementById('seo-export').addEventListener('click',function(){
        function cell(v){var s=String(v==null?'':v);if(/^\\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
        var table=[['종류','대상','노출','클릭','CTR(%)','평균 순위','선정 이유','다음 행동']].concat(rows.map(function(r){return[r.kind,r.target,r.impressions,r.clicks,(r.ctr*100).toFixed(2),r.position,r.reason,r.action];}));
        var blob=new Blob(['\\uFEFF'+table.map(function(r){return r.map(cell).join(',');}).join('\\r\\n')],{type:'text/csv;charset=utf-8'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='seo-improvement-candidates.csv';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);
      });
    })();</script>
  </section>`
}
