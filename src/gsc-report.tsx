import { Hono } from 'hono'

const app = new Hono()

app.get('/gsc-report', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GSC 분석 대시보드 — bdbddc.com</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800&display=swap');
  * { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
  body { background: #0f172a; color: #e2e8f0; }
  .glass { background: rgba(30,41,59,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(71,85,105,0.4); }
  .glass-dark { background: rgba(15,23,42,0.8); backdrop-filter: blur(12px); border: 1px solid rgba(51,65,85,0.5); }
  .metric-card { transition: all 0.3s; }
  .metric-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
  .tab-btn { transition: all 0.2s; }
  .tab-btn.active { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; }
  .tab-btn:not(.active):hover { background: rgba(59,130,246,0.15); }
  .badge-green { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
  .badge-yellow { background: rgba(234,179,8,0.15); color: #facc15; border: 1px solid rgba(234,179,8,0.3); }
  .badge-red { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
  .badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
  .badge-purple { background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); }
  .glow-green { box-shadow: 0 0 20px rgba(34,197,94,0.15); }
  .glow-blue { box-shadow: 0 0 20px rgba(59,130,246,0.15); }
  .glow-purple { box-shadow: 0 0 20px rgba(139,92,246,0.15); }
  .glow-yellow { box-shadow: 0 0 20px rgba(234,179,8,0.15); }
  .progress-bar { height: 6px; border-radius: 3px; background: rgba(51,65,85,0.5); overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
  table { border-collapse: separate; border-spacing: 0; }
  thead th { position: sticky; top: 0; z-index: 10; background: rgba(15,23,42,0.95); backdrop-filter: blur(8px); }
  tbody tr { transition: background 0.15s; }
  tbody tr:hover { background: rgba(59,130,246,0.08); }
  .scroll-table { max-height: 500px; overflow-y: auto; }
  .scroll-table::-webkit-scrollbar { width: 6px; }
  .scroll-table::-webkit-scrollbar-track { background: rgba(30,41,59,0.5); border-radius: 3px; }
  .scroll-table::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.5); border-radius: 3px; }
  .section-title { background: linear-gradient(90deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .pulse-dot { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .fade-in { animation: fadeIn 0.5s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .rank-pill-1 { background: linear-gradient(135deg, #059669, #10b981); }
  .rank-pill-2 { background: linear-gradient(135deg, #2563eb, #3b82f6); }
  .rank-pill-3 { background: linear-gradient(135deg, #d97706, #f59e0b); }
  .rank-pill-4 { background: linear-gradient(135deg, #dc2626, #ef4444); }
</style>
</head>
<body class="min-h-screen">

<!-- Header -->
<header class="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <i class="fas fa-chart-line text-white text-lg"></i>
    </div>
    <div>
      <h1 class="text-lg font-bold text-white">GSC 분석 대시보드</h1>
      <p class="text-xs text-slate-400">bdbddc.com · 서울비디치과</p>
    </div>
  </div>
  <div class="flex items-center gap-4">
    <span class="text-xs text-slate-400"><i class="far fa-calendar mr-1"></i>2026-01-28 ~ 2026-04-27</span>
    <span class="pulse-dot inline-block w-2 h-2 rounded-full bg-green-400"></span>
    <span class="text-xs text-green-400">실시간 데이터</span>
  </div>
</header>

<main class="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6" id="app">
  <div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-400"></i><p class="mt-3 text-slate-400">데이터 로딩 중...</p></div>
</main>

<script>
let DATA = null;

async function loadData() {
  const res = await fetch('/static/gsc-data.json');
  DATA = await res.json();
  render();
}

function n(v) { return v.toLocaleString('ko-KR'); }
function pct(v) { return v.toFixed(2) + '%'; }
function pos(v) { return v.toFixed(1); }

function rankBadge(p) {
  if (p <= 3) return '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-1 text-white">' + pos(p) + '</span>';
  if (p <= 10) return '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-2 text-white">' + pos(p) + '</span>';
  if (p <= 20) return '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-3 text-white">' + pos(p) + '</span>';
  return '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold rank-pill-4 text-white">' + pos(p) + '</span>';
}

function topicBadge(t) {
  const colors = {
    '임플란트': 'badge-blue', '교정': 'badge-purple', '라미네이트/심미': 'badge-green',
    '소아치과': 'badge-yellow', '일반진료': 'badge-blue', '치과용어/백과': 'badge-purple',
    '병원찾기': 'badge-green', '비용/보험': 'badge-yellow', '기타': 'badge-red'
  };
  return '<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ' + (colors[t]||'badge-blue') + '">' + t + '</span>';
}

function growthArrow(v) {
  if (v > 0) return '<span class="text-green-400 font-bold"><i class="fas fa-arrow-up text-xs"></i> +' + v + '%</span>';
  if (v < 0) return '<span class="text-red-400 font-bold"><i class="fas fa-arrow-down text-xs"></i> ' + v + '%</span>';
  return '<span class="text-slate-400">0%</span>';
}

function render() {
  const d = DATA;
  const s = d.summary;
  
  document.getElementById('app').innerHTML = \`
  <!-- KPI Cards -->
  <section class="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
    <div class="glass rounded-2xl p-5 metric-card glow-blue">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-slate-400 uppercase tracking-wider">총 클릭수</span>
        <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><i class="fas fa-mouse-pointer text-blue-400 text-sm"></i></div>
      </div>
      <div class="text-3xl font-extrabold text-white">\${n(s.total_clicks)}</div>
      <div class="mt-2 text-sm">\${d.growth ? growthArrow(d.growth.click_growth_pct) : ''} <span class="text-slate-500 text-xs">vs 전월</span></div>
    </div>
    <div class="glass rounded-2xl p-5 metric-card glow-purple">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-slate-400 uppercase tracking-wider">총 노출수</span>
        <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><i class="fas fa-eye text-purple-400 text-sm"></i></div>
      </div>
      <div class="text-3xl font-extrabold text-white">\${n(s.total_impressions)}</div>
      <div class="mt-2 text-sm">\${d.growth ? growthArrow(d.growth.imp_growth_pct) : ''} <span class="text-slate-500 text-xs">vs 전월</span></div>
    </div>
    <div class="glass rounded-2xl p-5 metric-card glow-green">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-slate-400 uppercase tracking-wider">평균 CTR</span>
        <div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center"><i class="fas fa-percentage text-green-400 text-sm"></i></div>
      </div>
      <div class="text-3xl font-extrabold text-white">\${pct(s.avg_ctr)}</div>
      <div class="mt-2 text-xs text-slate-500">업계 평균: 3-5%</div>
    </div>
    <div class="glass rounded-2xl p-5 metric-card glow-yellow">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-slate-400 uppercase tracking-wider">평균 순위</span>
        <div class="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center"><i class="fas fa-sort-amount-up text-yellow-400 text-sm"></i></div>
      </div>
      <div class="text-3xl font-extrabold text-white">\${pos(s.avg_position)}</div>
      <div class="mt-2 text-xs text-slate-500">\${s.total_keywords}개 키워드 기반</div>
    </div>
  </section>

  <!-- Sub KPIs -->
  <section class="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in">
    <div class="glass rounded-xl p-4 text-center">
      <div class="text-2xl font-bold text-white">\${n(s.total_keywords)}</div>
      <div class="text-xs text-slate-400 mt-1">발견 키워드</div>
    </div>
    <div class="glass rounded-xl p-4 text-center">
      <div class="text-2xl font-bold text-green-400">\${s.keywords_with_clicks}</div>
      <div class="text-xs text-slate-400 mt-1">클릭 발생 키워드</div>
    </div>
    <div class="glass rounded-xl p-4 text-center">
      <div class="text-2xl font-bold text-white">\${n(s.total_pages)}</div>
      <div class="text-xs text-slate-400 mt-1">인덱스 페이지</div>
    </div>
    <div class="glass rounded-xl p-4 text-center">
      <div class="text-2xl font-bold text-green-400">\${s.pages_with_clicks}</div>
      <div class="text-xs text-slate-400 mt-1">클릭 발생 페이지</div>
    </div>
  </section>

  <!-- Charts Row -->
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-chart-area text-blue-400 mr-2"></i>일별 트래픽 추이</h3>
      <canvas id="trendChart" height="200"></canvas>
    </div>
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-chart-bar text-purple-400 mr-2"></i>월별 성장 추이</h3>
      <canvas id="monthlyChart" height="200"></canvas>
    </div>
  </section>

  <!-- Rank + Brand + Device -->
  <section class="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-layer-group text-green-400 mr-2"></i>키워드 순위 분포</h3>
      <canvas id="rankChart" height="200"></canvas>
      <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500"></span>1-3위: \${d.rank_distribution['1-3위']}개</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span>4-10위: \${d.rank_distribution['4-10위']}개</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span>11-20위: \${d.rank_distribution['11-20위']}개</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500"></span>20위+: \${d.rank_distribution['20위+']}개</div>
      </div>
    </div>
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-building text-yellow-400 mr-2"></i>브랜드 vs 비브랜드</h3>
      <canvas id="brandChart" height="200"></canvas>
      <div class="mt-4 space-y-2 text-xs">
        <div class="flex justify-between"><span class="text-slate-400">브랜드 CTR</span><span class="text-green-400 font-bold">\${pct(d.brand_vs_nonbrand.brand.ctr)}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">비브랜드 CTR</span><span class="text-red-400 font-bold">\${pct(d.brand_vs_nonbrand.nonbrand.ctr)}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">비브랜드 비중</span><span class="text-yellow-400 font-bold">\${((d.brand_vs_nonbrand.nonbrand.clicks / Math.max(s.total_clicks,1))*100).toFixed(1)}%</span></div>
      </div>
    </div>
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-mobile-alt text-purple-400 mr-2"></i>디바이스별 성과</h3>
      <canvas id="deviceChart" height="200"></canvas>
      <div class="mt-4 space-y-2 text-xs">
        \${Object.entries(d.devices).map(([k,v]) => {
          const icon = k === 'desktop' ? 'fa-desktop' : k === 'mobile' ? 'fa-mobile-alt' : 'fa-tablet-alt';
          const label = k === 'desktop' ? '데스크톱' : k === 'mobile' ? '모바일' : '태블릿';
          return '<div class="flex justify-between"><span class="text-slate-400"><i class="fas ' + icon + ' mr-1"></i>' + label + '</span><span class="text-white">' + n(v.clicks) + '클릭 · ' + pct(v.ctr) + '</span></div>';
        }).join('')}
      </div>
    </div>
  </section>

  <!-- Topic + Intent -->
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-tags text-blue-400 mr-2"></i>토픽별 키워드 분포</h3>
      <canvas id="topicChart" height="220"></canvas>
    </div>
    <div class="glass rounded-2xl p-6">
      <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-compass text-green-400 mr-2"></i>검색 의도별 분포</h3>
      <canvas id="intentChart" height="220"></canvas>
    </div>
  </section>

  <!-- Section Analysis -->
  <section class="glass rounded-2xl p-6 fade-in">
    <h3 class="text-sm font-bold text-white mb-4"><i class="fas fa-sitemap text-purple-400 mr-2"></i>사이트 섹션별 성과</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      \${Object.entries(d.section_stats).sort((a,b) => b[1].impressions - a[1].impressions).map(([sec, v]) => {
        const labels = {encyclopedia:'백과사전',blog:'블로그',area:'지역페이지',treatments:'진료과목',
                       doctors:'의료진',faq:'FAQ',cases:'치료사례',main:'메인/기타'};
        const icons = {encyclopedia:'fa-book',blog:'fa-pen-fancy',area:'fa-map-marker-alt',treatments:'fa-tooth',
                      doctors:'fa-user-md',faq:'fa-question-circle',cases:'fa-images',main:'fa-home'};
        return '<div class="glass-dark rounded-xl p-3 text-center"><div class="w-8 h-8 mx-auto rounded-lg bg-blue-500/15 flex items-center justify-center mb-2"><i class="fas ' + (icons[sec]||'fa-file') + ' text-blue-400 text-xs"></i></div><div class="text-xs text-slate-400">' + (labels[sec]||sec) + '</div><div class="text-lg font-bold text-white mt-1">' + n(v.impressions) + '</div><div class="text-[10px] text-slate-500">' + v.count + '페이지 · ' + v.clicks + '클릭</div><div class="text-[10px] mt-1 ' + (v.clicks/Math.max(v.impressions,1)*100 > 2 ? 'text-green-400' : 'text-yellow-400') + '">' + (v.clicks/Math.max(v.impressions,1)*100).toFixed(1) + '% CTR</div></div>';
      }).join('')}
    </div>
  </section>

  <!-- Tabs for tables -->
  <section class="fade-in">
    <div class="flex flex-wrap gap-2 mb-4" id="tabButtons">
      <button class="tab-btn active glass rounded-lg px-4 py-2 text-sm font-medium" data-tab="quickwin">
        <i class="fas fa-rocket mr-1"></i>Quick Win (\${d.quick_wins.length})
      </button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="ctrlow">
        <i class="fas fa-exclamation-triangle mr-1"></i>CTR 개선 (\${d.ctr_low.length})
      </button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="highpotential">
        <i class="fas fa-gem mr-1"></i>숨은 기회 (\${d.high_potential.length})
      </button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="cheonan">
        <i class="fas fa-map-marker-alt mr-1"></i>천안 키워드 (\${d.cheonan_keywords.length})
      </button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="topkw">
        <i class="fas fa-trophy mr-1"></i>TOP 키워드
      </button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="toppages">
        <i class="fas fa-file-alt mr-1"></i>인기 페이지
      </button>
      <button class="tab-btn glass rounded-lg px-4 py-2 text-sm font-medium text-slate-400" data-tab="deadpages">
        <i class="fas fa-ghost mr-1"></i>Dead 페이지 (\${d.dead_pages.length})
      </button>
    </div>
    <div id="tabContent" class="glass rounded-2xl p-4"></div>
  </section>

  <!-- Action Plan -->
  <section class="glass rounded-2xl p-6 fade-in">
    <h2 class="text-lg font-bold text-white mb-4"><i class="fas fa-bullseye text-red-400 mr-2"></i>핵심 발견 & 액션 플랜</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="glass-dark rounded-xl p-4">
        <h4 class="text-sm font-bold text-red-400 mb-3"><i class="fas fa-exclamation-circle mr-1"></i>문제점 진단</h4>
        <ul class="space-y-2 text-sm text-slate-300">
          <li class="flex gap-2"><span class="text-red-400">①</span>비브랜드 클릭 비율 단 \${((d.brand_vs_nonbrand.nonbrand.clicks / Math.max(s.total_clicks,1))*100).toFixed(0)}% — 브랜드 의존도 극심</li>
          <li class="flex gap-2"><span class="text-red-400">②</span>881개 키워드 중 클릭 발생은 \${s.keywords_with_clicks}개(\${(s.keywords_with_clicks/s.total_keywords*100).toFixed(1)}%)뿐</li>
          <li class="flex gap-2"><span class="text-red-400">③</span>1-3위 키워드 \${d.rank_distribution['1-3위']}개 중 대부분 치과용어/백과 — 상업성 낮음</li>
          <li class="flex gap-2"><span class="text-red-400">④</span>"천안 임플란트" 순위 1.55위인데 노출 33, 클릭 0 — 검색량 자체 인식 미흡</li>
          <li class="flex gap-2"><span class="text-red-400">⑤</span>Dead 페이지 \${d.dead_pages.length}개 — 노출만 되고 클릭 없음</li>
          <li class="flex gap-2"><span class="text-red-400">⑥</span>비브랜드 CTR \${pct(d.brand_vs_nonbrand.nonbrand.ctr)} — 업계 평균(3-5%)의 1/10</li>
        </ul>
      </div>
      <div class="glass-dark rounded-xl p-4">
        <h4 class="text-sm font-bold text-green-400 mb-3"><i class="fas fa-check-circle mr-1"></i>긍정 시그널</h4>
        <ul class="space-y-2 text-sm text-slate-300">
          <li class="flex gap-2"><span class="text-green-400">①</span>4월 노출 폭발적 성장 (3월 대비 \${d.growth ? d.growth.imp_growth_pct + '%↑' : ''})</li>
          <li class="flex gap-2"><span class="text-green-400">②</span>881개 키워드 발견 = 구글 인덱싱 상태 양호</li>
          <li class="flex gap-2"><span class="text-green-400">③</span>"천안치과" 평균 순위 1.2 — 최상위 노출</li>
          <li class="flex gap-2"><span class="text-green-400">④</span>707페이지 인덱싱 → 콘텐츠 양 충분</li>
          <li class="flex gap-2"><span class="text-green-400">⑤</span>백과사전 섹션 8,000+ 노출 — 정보성 트래픽 기반 확보</li>
          <li class="flex gap-2"><span class="text-green-400">⑥</span>"인비절라인" 관련 검색 1위 달성 중</li>
        </ul>
      </div>
    </div>

    <div class="mt-6 glass-dark rounded-xl p-4">
      <h4 class="text-sm font-bold text-blue-400 mb-3"><i class="fas fa-tasks mr-1"></i>우선순위 액션 플랜</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="space-y-2">
          <div class="text-xs font-bold text-red-400 uppercase tracking-wider">🔥 이번 주 (긴급)</div>
          <div class="bg-red-500/10 rounded-lg p-3 space-y-1.5 text-slate-300">
            <p>1. Quick Win \${d.quick_wins.length}개 키워드 Title/Description 최적화</p>
            <p>2. Dead 페이지 상위 20개 meta 태그 개선</p>
            <p>3. "천안치과" CTR 0.91% → Title에 차별화 문구 추가</p>
            <p>4. 홈페이지 Title 개선 (현재 CTR 4.49%)</p>
          </div>
        </div>
        <div class="space-y-2">
          <div class="text-xs font-bold text-yellow-400 uppercase tracking-wider">⚡ 이번 달 (중요)</div>
          <div class="bg-yellow-500/10 rounded-lg p-3 space-y-1.5 text-slate-300">
            <p>1. 천안 로컬 키워드 전용 랜딩페이지 강화</p>
            <p>2. 블로그 → 진료페이지 내부 링크 구축</p>
            <p>3. "천안 임플란트 가격/후기" 전용 콘텐츠</p>
            <p>4. 의료포털 프로필 등록 (모두닥, 닥터나우)</p>
          </div>
        </div>
        <div class="space-y-2">
          <div class="text-xs font-bold text-blue-400 uppercase tracking-wider">📈 1-3개월 (성장)</div>
          <div class="bg-blue-500/10 rounded-lg p-3 space-y-1.5 text-slate-300">
            <p>1. 백과사전 → 진료 전환 CTA 삽입</p>
            <p>2. 비브랜드 상업성 키워드 타겟 콘텐츠</p>
            <p>3. 외부 백링크 확보 (지역 커뮤니티)</p>
            <p>4. 영상 SEO + 구조화 데이터 강화</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="text-center text-xs text-slate-600 py-6">
    Generated on 2026-04-29 · Powered by Google Search Console Data · 서울비디치과 SEO 분석
  </footer>
  \`;

  // Init charts
  initCharts();
  initTabs();
}

function initCharts() {
  const d = DATA;
  
  // Trend chart
  const ctx1 = document.getElementById('trendChart')?.getContext('2d');
  if (ctx1) {
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: d.chart.map(c => c.date.slice(5)),
        datasets: [
          { label: '클릭', data: d.chart.map(c => c.clicks), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.3, pointRadius: 1 },
          { label: '노출÷10', data: d.chart.map(c => Math.round(c.impressions/10)), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.05)', fill: true, tension: 0.3, pointRadius: 1 }
        ]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: { x: { ticks: { color: '#64748b', font: { size: 9 }, maxTicksLimit: 15 }, grid: { color: 'rgba(51,65,85,0.3)' } },
                  y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(51,65,85,0.3)' } } } }
    });
  }

  // Monthly chart
  const ctx2 = document.getElementById('monthlyChart')?.getContext('2d');
  if (ctx2) {
    const months = Object.keys(d.monthly);
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: months.map(m => m),
        datasets: [
          { label: '클릭', data: months.map(m => d.monthly[m].clicks), backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 6 },
          { label: '노출÷10', data: months.map(m => Math.round(d.monthly[m].impressions/10)), backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 6 }
        ]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                  y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } } } }
    });
  }

  // Rank distribution
  const ctx3 = document.getElementById('rankChart')?.getContext('2d');
  if (ctx3) {
    new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: Object.keys(d.rank_distribution),
        datasets: [{ data: Object.values(d.rank_distribution), backgroundColor: ['#10b981','#3b82f6','#f59e0b','#ef4444'], borderWidth: 0 }]
      },
      options: { responsive: true, cutout: '65%', plugins: { legend: { display: false } } }
    });
  }

  // Brand chart
  const ctx4 = document.getElementById('brandChart')?.getContext('2d');
  if (ctx4) {
    new Chart(ctx4, {
      type: 'doughnut',
      data: {
        labels: ['브랜드 클릭', '비브랜드 클릭'],
        datasets: [{ data: [d.brand_vs_nonbrand.brand.clicks, d.brand_vs_nonbrand.nonbrand.clicks],
                     backgroundColor: ['#3b82f6','#f59e0b'], borderWidth: 0 }]
      },
      options: { responsive: true, cutout: '65%', plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } } }
    });
  }

  // Device chart
  const ctx5 = document.getElementById('deviceChart')?.getContext('2d');
  if (ctx5) {
    new Chart(ctx5, {
      type: 'doughnut',
      data: {
        labels: ['데스크톱', '모바일', '태블릿'],
        datasets: [{ data: [d.devices.desktop.clicks, d.devices.mobile.clicks, d.devices.tablet.clicks],
                     backgroundColor: ['#3b82f6','#10b981','#8b5cf6'], borderWidth: 0 }]
      },
      options: { responsive: true, cutout: '65%', plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } } }
    });
  }

  // Topic chart
  const ctx6 = document.getElementById('topicChart')?.getContext('2d');
  if (ctx6) {
    const topics = Object.entries(d.topic_stats).sort((a,b) => b[1].impressions - a[1].impressions);
    const colors6 = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#f97316','#6366f1'];
    new Chart(ctx6, {
      type: 'bar',
      data: {
        labels: topics.map(t => t[0]),
        datasets: [
          { label: '노출', data: topics.map(t => t[1].impressions), backgroundColor: colors6.map(c => c + 'cc'), borderRadius: 4 },
          { label: '클릭', data: topics.map(t => t[1].clicks), backgroundColor: colors6.map(c => c + '55'), borderRadius: 4 }
        ]
      },
      options: { indexAxis: 'y', responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
        scales: { x: { stacked: false, ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(51,65,85,0.3)' } },
                  y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } } } }
    });
  }

  // Intent chart
  const ctx7 = document.getElementById('intentChart')?.getContext('2d');
  if (ctx7) {
    const intents = Object.entries(d.intent_stats).sort((a,b) => b[1].count - a[1].count);
    const intentColors = { informational: '#3b82f6', local: '#10b981', commercial: '#f59e0b', transactional: '#ef4444' };
    new Chart(ctx7, {
      type: 'polarArea',
      data: {
        labels: intents.map(i => ({informational:'정보성',local:'로컬',commercial:'상업성',transactional:'거래성'}[i[0]]||i[0])),
        datasets: [{ data: intents.map(i => i[1].count),
                     backgroundColor: intents.map(i => (intentColors[i[0]]||'#6366f1') + '99') }]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: { r: { ticks: { color: '#64748b', backdropColor: 'transparent' }, grid: { color: 'rgba(51,65,85,0.3)' } } } }
    });
  }
}

function initTabs() {
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.classList.add('text-slate-400'); });
      btn.classList.add('active'); btn.classList.remove('text-slate-400');
      renderTab(btn.dataset.tab);
    });
  });
  renderTab('quickwin');
}

function renderTab(tab) {
  const d = DATA;
  const el = document.getElementById('tabContent');
  
  if (tab === 'quickwin') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-amber-400"><i class="fas fa-rocket mr-1"></i>Quick Win 키워드 — 순위 11-20위, 1페이지 진입 직전!</h3><p class="text-xs text-slate-500 mt-1">Title/Description 최적화, 내부 링크 강화로 빠르게 1페이지 진입 가능</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th><th class="text-center py-2 px-3">토픽</th></tr></thead><tbody>' +
      d.quick_wins.map(k => '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">' + k.query + '</td><td class="text-right py-2 px-3 text-purple-300">' + n(k.impressions) + '</td><td class="text-right py-2 px-3">' + k.clicks + '</td><td class="text-right py-2 px-3 text-yellow-400">' + pct(k.ctr) + '</td><td class="text-right py-2 px-3">' + rankBadge(k.position) + '</td><td class="text-center py-2 px-3">' + topicBadge(k.topic) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  
  else if (tab === 'ctrlow') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-red-400"><i class="fas fa-exclamation-triangle mr-1"></i>CTR 개선 필요 — 상위 노출되지만 클릭 안됨</h3><p class="text-xs text-slate-500 mt-1">순위 10위 이내, 노출 20+ 인데 CTR 5% 미만 → Title/Description이 매력적이지 않음</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.ctr_low.map(k => '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">' + k.query + '</td><td class="text-right py-2 px-3 text-purple-300">' + n(k.impressions) + '</td><td class="text-right py-2 px-3">' + k.clicks + '</td><td class="text-right py-2 px-3 text-red-400 font-bold">' + pct(k.ctr) + '</td><td class="text-right py-2 px-3">' + rankBadge(k.position) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  
  else if (tab === 'highpotential') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-cyan-400"><i class="fas fa-gem mr-1"></i>숨은 기회 — 높은 노출, 순위 20위+ 키워드</h3><p class="text-xs text-slate-500 mt-1">전용 콘텐츠 작성으로 순위 급상승 가능한 키워드</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">순위</th><th class="text-center py-2 px-3">토픽</th></tr></thead><tbody>' +
      d.high_potential.map(k => '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">' + k.query + '</td><td class="text-right py-2 px-3 text-purple-300">' + n(k.impressions) + '</td><td class="text-right py-2 px-3">' + rankBadge(k.position) + '</td><td class="text-center py-2 px-3">' + topicBadge(k.topic) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  
  else if (tab === 'cheonan') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-green-400"><i class="fas fa-map-marker-alt mr-1"></i>천안 로컬 키워드 전체 현황</h3><p class="text-xs text-slate-500 mt-1">핵심 상업 키워드 — 이 키워드들이 매출과 직결됩니다</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.cheonan_keywords.map(k => '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-white font-medium">' + k.query + '</td><td class="text-right py-2 px-3 text-purple-300">' + n(k.impressions) + '</td><td class="text-right py-2 px-3">' + k.clicks + '</td><td class="text-right py-2 px-3 ' + (k.ctr > 3 ? 'text-green-400' : 'text-red-400') + '">' + pct(k.ctr) + '</td><td class="text-right py-2 px-3">' + rankBadge(k.position) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  
  else if (tab === 'topkw') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-blue-400"><i class="fas fa-trophy mr-1"></i>TOP 50 키워드 (노출 기준)</h3></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">#</th><th class="text-left py-2 px-3">키워드</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.top_keywords.map((k,i) => '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-slate-500">' + (i+1) + '</td><td class="py-2 px-3 text-white font-medium">' + k.query + '</td><td class="text-right py-2 px-3 text-purple-300">' + n(k.impressions) + '</td><td class="text-right py-2 px-3">' + k.clicks + '</td><td class="text-right py-2 px-3">' + pct(k.ctr) + '</td><td class="text-right py-2 px-3">' + rankBadge(k.position) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  
  else if (tab === 'toppages') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-green-400"><i class="fas fa-file-alt mr-1"></i>인기 페이지 TOP 30</h3></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">URL</th><th class="text-right py-2 px-3">클릭</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">CTR</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.high_perf_pages.map(p => '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-blue-300 text-xs truncate max-w-[300px]" title="' + p.url + '"><a href="https://bdbddc.com' + p.url + '" target="_blank" class="hover:underline">' + p.url + '</a></td><td class="text-right py-2 px-3 text-green-400 font-bold">' + p.clicks + '</td><td class="text-right py-2 px-3 text-purple-300">' + n(p.impressions) + '</td><td class="text-right py-2 px-3">' + pct(p.ctr) + '</td><td class="text-right py-2 px-3">' + rankBadge(p.position) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  
  else if (tab === 'deadpages') {
    el.innerHTML = '<div class="mb-3"><h3 class="text-sm font-bold text-slate-400"><i class="fas fa-ghost mr-1"></i>Dead 페이지 — 노출만 되고 클릭 0</h3><p class="text-xs text-slate-500 mt-1">Title/Description 개선 또는 콘텐츠 병합 필요</p></div><div class="scroll-table"><table class="w-full text-sm"><thead><tr class="text-xs text-slate-400"><th class="text-left py-2 px-3">URL</th><th class="text-right py-2 px-3">노출</th><th class="text-right py-2 px-3">순위</th></tr></thead><tbody>' +
      d.dead_pages.map(p => '<tr class="border-t border-slate-800"><td class="py-2 px-3 text-slate-400 text-xs truncate max-w-[400px]" title="' + p.url + '"><a href="https://bdbddc.com' + p.url + '" target="_blank" class="hover:text-blue-300">' + p.url + '</a></td><td class="text-right py-2 px-3 text-purple-300">' + n(p.impressions) + '</td><td class="text-right py-2 px-3">' + rankBadge(p.position) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
}

loadData();
</script>
</body>
</html>`)
})

export default app
