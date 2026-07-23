// ============================================================
// 치아 번호 (Tooth Numbering) — 역대급 전용 페이지 + 임베드 위젯
// v5.30 | GSC 노출 1,531 최강 자산 → 인터랙티브 조회기 + 백링크 수확 구조
// - /encyclopedia/치아 번호 : 전용 리치 페이지 (기존 URL 보존)
// - /widgets/tooth-numbering : iframe 임베드용 자체완결 위젯 (noindex, frame 허용)
// ============================================================
import type { Hono } from 'hono'

// ---------- SSR용 치아 데이터 (public/js/tooth-chart.js와 동일 소스) ----------
type ToothRow = { fdi: number; ko: string; en: string; uni: string; palmer: string; eru: string; shed?: string }

const POS_PERM: Record<number, { ko: string; en: string; eruUp: string; eruLow: string }> = {
  1: { ko: '중절치', en: 'Central Incisor', eruUp: '7~8세', eruLow: '6~7세' },
  2: { ko: '측절치', en: 'Lateral Incisor', eruUp: '8~9세', eruLow: '7~8세' },
  3: { ko: '견치(송곳니)', en: 'Canine', eruUp: '11~12세', eruLow: '9~10세' },
  4: { ko: '제1소구치', en: 'First Premolar', eruUp: '10~11세', eruLow: '10~12세' },
  5: { ko: '제2소구치', en: 'Second Premolar', eruUp: '10~12세', eruLow: '11~12세' },
  6: { ko: '제1대구치', en: 'First Molar', eruUp: '6~7세', eruLow: '6~7세' },
  7: { ko: '제2대구치', en: 'Second Molar', eruUp: '12~13세', eruLow: '11~13세' },
  8: { ko: '제3대구치(사랑니)', en: 'Third Molar', eruUp: '17~25세', eruLow: '17~25세' },
}
const POS_DECID: Record<number, { ko: string; en: string; eruUp: string; eruLow: string; shed: string }> = {
  1: { ko: '유중절치', en: 'Primary Central Incisor', eruUp: '8~12개월', eruLow: '6~10개월', shed: '6~7세' },
  2: { ko: '유측절치', en: 'Primary Lateral Incisor', eruUp: '9~13개월', eruLow: '10~16개월', shed: '7~8세' },
  3: { ko: '유견치', en: 'Primary Canine', eruUp: '16~22개월', eruLow: '17~23개월', shed: '9~12세' },
  4: { ko: '제1유구치', en: 'Primary First Molar', eruUp: '13~19개월', eruLow: '14~18개월', shed: '9~11세' },
  5: { ko: '제2유구치', en: 'Primary Second Molar', eruUp: '25~33개월', eruLow: '23~31개월', shed: '10~12세' },
}
const QUAD: Record<number, { name: string; arch: 'up' | 'low'; palmer: string }> = {
  1: { name: '상악 우측(오른쪽 위)', arch: 'up', palmer: 'UR' },
  2: { name: '상악 좌측(왼쪽 위)', arch: 'up', palmer: 'UL' },
  3: { name: '하악 좌측(왼쪽 아래)', arch: 'low', palmer: 'LL' },
  4: { name: '하악 우측(오른쪽 아래)', arch: 'low', palmer: 'LR' },
  5: { name: '상악 우측(오른쪽 위)·유치', arch: 'up', palmer: 'UR' },
  6: { name: '상악 좌측(왼쪽 위)·유치', arch: 'up', palmer: 'UL' },
  7: { name: '하악 좌측(왼쪽 아래)·유치', arch: 'low', palmer: 'LL' },
  8: { name: '하악 우측(오른쪽 아래)·유치', arch: 'low', palmer: 'LR' },
}
function uniOf(q: number, p: number): string {
  if (q === 1) return String(9 - p)
  if (q === 2) return String(8 + p)
  if (q === 3) return String(25 - p)
  if (q === 4) return String(24 + p)
  if (q === 5) return 'ABCDE'[5 - p]
  if (q === 6) return 'FGHIJ'[p - 1]
  if (q === 7) return 'KLMNO'[5 - p]
  return 'PQRST'[p - 1]
}
function buildRows(deciduous: boolean): ToothRow[] {
  const rows: ToothRow[] = []
  const quads = deciduous ? [5, 6, 7, 8] : [1, 2, 3, 4]
  const maxP = deciduous ? 5 : 8
  for (const q of quads) {
    for (let p = 1; p <= maxP; p++) {
      const base = deciduous ? POS_DECID[p] : POS_PERM[p]
      const quad = QUAD[q]
      rows.push({
        fdi: q * 10 + p,
        ko: base.ko,
        en: base.en,
        uni: uniOf(q, p),
        palmer: quad.palmer + (deciduous ? 'ABCDE'[p - 1] : String(p)),
        eru: (deciduous ? '생후 ' : '') + (quad.arch === 'up' ? base.eruUp : base.eruLow),
        shed: deciduous ? (base as any).shed : undefined,
      })
    }
  }
  return rows
}
const ROWS_PERM = buildRows(false)
const ROWS_DECID = buildRows(true)

function tableHtml(rows: ToothRow[], deciduous: boolean): string {
  const th = 'border:1px solid #e0d4c0;padding:8px 10px;font-size:0.82rem;'
  const td = 'border:1px solid #e0d4c0;padding:7px 10px;font-size:0.85rem;text-align:center;'
  const header = `<tr style="background:#f5f0eb;color:#6B4226;"><th style="${th}">FDI</th><th style="${th}">치아 이름</th><th style="${th}">위치</th><th style="${th}">Universal</th><th style="${th}">Palmer</th><th style="${th}">맹출 시기</th>${deciduous ? `<th style="${th}">탈락 시기</th>` : ''}</tr>`
  const quadName = (fdi: number) => QUAD[Math.floor(fdi / 10)].name.replace('·유치', '')
  const body = rows.map((r, i) => {
    const isQuadStart = r.fdi % 10 === 1
    const zebra = i % 2 === 1 ? 'background:#fbf8f4;' : ''
    const quadRow = isQuadStart ? `<tr><td colspan="${deciduous ? 7 : 6}" style="border:1px solid #e0d4c0;padding:6px 10px;background:#efe6d9;font-weight:700;color:#6B4226;font-size:0.82rem;text-align:left;">${Math.floor(r.fdi / 10)}번대 — ${quadName(r.fdi)}</td></tr>` : ''
    return `${quadRow}<tr style="${zebra}"><td style="${td}font-weight:800;color:#6B4226;">${r.fdi}</td><td style="${td}text-align:left;">${r.ko} <span style="color:#a8997f;font-size:0.75rem;">${r.en}</span></td><td style="${td}">${quadName(r.fdi)}</td><td style="${td}">${r.uni}</td><td style="${td}">${r.palmer}</td><td style="${td}">${r.eru}</td>${deciduous ? `<td style="${td}">${r.shed}</td>` : ''}</tr>`
  }).join('')
  return `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;"><table style="width:100%;border-collapse:collapse;min-width:560px;">${header}${body}</table></div>`
}

// ---------- 임베드 코드 (백링크 수확 구조) ----------
const CANONICAL_PAGE = 'https://bdbddc.com/encyclopedia/%EC%B9%98%EC%95%84%20%EB%B2%88%ED%98%B8'
const EMBED_SNIPPET = `<!-- 치아 번호 조회기 by 서울비디치과 -->
<iframe src="https://bdbddc.com/widgets/tooth-numbering" width="100%" height="760" style="border:1px solid #e8e0d8;border-radius:14px;max-width:760px;" loading="lazy" title="치아 번호 조회기 — 서울비디치과"></iframe>
<p style="font-size:13px;color:#888;">출처: <a href="${CANONICAL_PAGE}" target="_blank" rel="noopener">치아 번호 읽는 법 — 서울비디치과 치과 백과사전</a></p>`

// ---------- FAQ (페이지 + FAQPage 스키마 공용) ----------
const TOOTH_FAQS: { q: string; a: string }[] = [
  { q: '치아 번호는 어떻게 읽나요?', a: '한국 치과에서 쓰는 FDI 표기는 두 자리 숫자입니다. 첫째 자리는 사분면(1=오른쪽 위, 2=왼쪽 위, 3=왼쪽 아래, 4=오른쪽 아래), 둘째 자리는 앞니 중앙에서부터 순서(1=중절치 ~ 8=사랑니)입니다. 예를 들어 26번은 왼쪽 위 제1대구치(첫 큰어금니), 48번은 오른쪽 아래 사랑니입니다.' },
  { q: '사랑니는 몇 번인가요?', a: '사랑니(제3대구치)는 각 사분면의 8번, 즉 FDI 18·28·38·48번입니다. 위 오른쪽 18번, 위 왼쪽 28번, 아래 왼쪽 38번, 아래 오른쪽 48번입니다.' },
  { q: '유치(아기 치아) 번호는 왜 51번부터 시작하나요?', a: 'FDI 체계에서 유치는 영구치(1~4번대)와 구분하기 위해 사분면 번호를 5~8로 씁니다. 상악 우측 5번대(51~55), 상악 좌측 6번대(61~65), 하악 좌측 7번대(71~75), 하악 우측 8번대(81~85)로 총 20개입니다.' },
  { q: '진료기록에 적힌 #36은 어떤 치아인가요?', a: '#36은 왼쪽 아래(3번 사분면)의 6번째 치아, 즉 하악 좌측 제1대구치(첫 큰어금니)입니다. 만 6세경에 나는 "6세 구치"로, 충치가 가장 잘 생기는 치아 중 하나입니다.' },
  { q: 'FDI와 유니버설(Universal) 번호는 무엇이 다른가요?', a: 'FDI는 국제(한국 포함) 표준으로 사분면+위치 두 자리(11~48)로 표기하고, 유니버설은 미국식으로 오른쪽 위 사랑니부터 1~32번을 순서대로 붙입니다. 같은 치아라도 FDI 16번 = Universal 3번처럼 완전히 다르므로, 해외 진료기록을 볼 때 주의해야 합니다.' },
  { q: '왼쪽·오른쪽 기준이 헷갈립니다. 누구 기준인가요?', a: '치아 번호의 좌우는 항상 "환자 본인" 기준입니다. 진료 차트를 마주 보면 좌우가 거울처럼 반대로 보이므로, 1번대(오른쪽 위)가 차트에서는 왼쪽 위에 그려집니다.' },
  { q: '6세 구치가 유치인 줄 알고 방치해도 되나요?', a: '안 됩니다. 만 6세경 제2유구치 뒤에 새로 나는 제1대구치(16·26·36·46번)는 빠지지 않는 평생 영구치입니다. 유치로 착각해 충치를 방치하는 경우가 많아, 나자마자 실란트(치아 홈 메우기)로 보호하는 것이 좋습니다.' },
  { q: '치아 번호를 알면 어떤 점이 좋은가요?', a: '진료기록·견적서·보험 청구 서류에 적힌 치료 부위를 스스로 확인할 수 있고, 상담 시 의료진과 정확하게 소통할 수 있습니다. 임플란트·교정 견적 비교 시에도 어느 치아에 대한 비용인지 명확히 파악할 수 있습니다.' },
]

// ============================================================
// 메인 페이지 렌더링 (기존 /encyclopedia/치아 번호 URL 유지)
// ============================================================
export function renderToothNumberingPage(deps: { trackingHead: string; header: string; mobileNav: string }): string {
  const pageTitle = '치아 번호 조회기 — 클릭하면 바로 아는 내 치아 번호 (FDI 11~48·유치 51~85) | 서울비디치과'
  const pageDesc = '치아 번호(치식)를 그림에서 클릭 한 번으로 확인하세요. FDI 2자리 체계(첫째 자리=사분면 1~4, 둘째 자리=앞니부터 1~8), 유치는 51~85번. FDI↔유니버설↔팔머 변환표, 맹출 시기까지 — 서울대 출신 전문의 감수 인터랙티브 조회기.'
  const canonicalUrl = CANONICAL_PAGE

  const faqHtml = TOOTH_FAQS.map(f => `
<div style="border:1px solid #e8e0d8;border-radius:12px;margin-bottom:10px;overflow:hidden;">
<button onclick="this.parentElement.classList.toggle('faq-open');this.querySelector('.faq-chevron').classList.toggle('rotated')" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#fff;border:none;cursor:pointer;text-align:left;gap:12px;">
<span style="font-weight:600;color:#333;font-size:0.95rem;flex:1;"><span style="color:#c9a96e;margin-right:8px;">Q.</span>${f.q}</span>
<i class="fas fa-chevron-down faq-chevron" style="color:#999;font-size:0.8rem;transition:transform 0.3s;"></i>
</button>
<div style="max-height:0;overflow:hidden;transition:max-height 0.3s ease;">
<div style="padding:0 20px 16px;color:#555;font-size:0.9rem;line-height:1.8;border-top:1px solid #f0ebe4;">
<p style="margin:12px 0 0;"><span style="color:#6B4226;font-weight:600;margin-right:8px;">A.</span>${f.a}</p>
</div>
</div>
</div>`).join('')

  const faqSchema = TOOTH_FAQS.map(f => `{"@type":"Question","name":${JSON.stringify(f.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(f.a)}}}`).join(',')

  const relatedTerms = ['치식', '치아 번호 체계', '중절치', '측절치', '견치', '소구치', '대구치', '사랑니', '유치', '영구치', '맹출', '실란트', '매복치']
  const relatedHtml = relatedTerms.map(t => `<a href="/encyclopedia/${encodeURIComponent(t)}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#fff;border:1px solid #e8e0d8;border-radius:50px;text-decoration:none;color:#555;font-size:0.85rem;"><i class="fas fa-book-medical" style="color:#c9a96e;font-size:0.7rem;"></i>${t}</a>`).join('')

  return `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
${deps.trackingHead}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<title>${pageTitle}</title>
<meta name="description" content="${pageDesc}">
<meta name="keywords" content="치아 번호, 치아 번호 조회기, 치식, FDI, 치아 번호 읽는 법, 사랑니 번호, 유치 번호, 치아 이름, 서울비디치과">
<meta name="author" content="서울비디치과">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${pageDesc}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="서울비디치과">
<meta property="og:image" content="https://bdbddc.com/images/og-image-v2.jpg?v=sq1">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${pageTitle}">
<meta name="twitter:description" content="${pageDesc}">
<meta name="twitter:image" content="https://bdbddc.com/images/og-image-v2.jpg?v=sq1">
<meta name="ai-summary" content="치아 번호(FDI 치식): 두 자리 중 첫째 자리는 사분면(1=우상, 2=좌상, 3=좌하, 4=우하), 둘째 자리는 앞니 중앙부터 1(중절치)~8(사랑니). 예: 26=왼쪽 위 제1대구치, 48=오른쪽 아래 사랑니. 유치는 사분면 5~8을 써서 51~85번(총 20개). 미국식 유니버설은 1~32번으로 체계가 다름. bdbddc.com에서 클릭형 치아 번호 조회기 제공.">
<link rel="icon" href="/favicon.ico?v=2" sizes="48x48"><link rel="icon" type="image/png" sizes="96x96" href="/images/icons/favicon-96.png?v=2"><link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg?v=2">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
<link rel="stylesheet" href="/css/site-v5.css?v=24d559d1">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://bdbddc.com/"},{"@type":"ListItem","position":2,"name":"치과 백과사전","item":"https://bdbddc.com/encyclopedia/"},{"@type":"ListItem","position":3,"name":"치아 구조","item":"https://bdbddc.com/encyclopedia/category/${encodeURIComponent('치아 구조')}"},{"@type":"ListItem","position":4,"name":"치아 번호","item":"${canonicalUrl}"}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"DefinedTerm","name":"치아 번호","alternateName":["치식","FDI 번호","Tooth Numbering"],"description":"치아를 식별하는 국제 번호 체계. FDI 표기는 두 자리 숫자로, 첫째 자리는 사분면(1~4, 유치는 5~8), 둘째 자리는 앞니 중앙부터의 순서(1~8, 유치는 1~5)를 나타낸다. 영구치는 11~48번(32개), 유치는 51~85번(20개).","inDefinedTermSet":{"@type":"DefinedTermSet","name":"서울비디치과 치과 백과사전","url":"https://bdbddc.com/encyclopedia/"},"url":"${canonicalUrl}"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"MedicalWebPage","name":"치아 번호 조회기 — 치과 백과사전","url":"${canonicalUrl}","description":"클릭 한 번으로 확인하는 치아 번호(FDI 치식) 인터랙티브 조회기. 영구치 11~48번, 유치 51~85번, FDI·유니버설·팔머 변환표 제공.","inLanguage":"ko-KR","about":{"@type":"MedicalEntity","name":"치아 번호"},"medicalAudience":{"@type":"MedicalAudience","audienceType":"Patient"},"reviewedBy":{"@type":"Person","name":"문석준","jobTitle":"통합치의학과 전문의 · 대표원장","url":"https://bdbddc.com/doctors/moon","affiliation":{"@type":"Dentist","@id":"https://bdbddc.com/#dentist","name":"서울비디치과"}},"publisher":{"@id":"https://bdbddc.com/#dentist"},"isPartOf":{"@type":"WebSite","name":"서울비디치과","url":"https://bdbddc.com"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${faqSchema}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"치아 번호 조회기","url":"${canonicalUrl}","applicationCategory":"HealthApplication","operatingSystem":"Web","description":"치아 그림을 클릭하면 FDI·유니버설·팔머 번호와 치아 이름, 맹출 시기를 알려주는 무료 인터랙티브 도구. 영구치·유치 모두 지원.","offers":{"@type":"Offer","price":"0","priceCurrency":"KRW"},"provider":{"@type":"Dentist","@id":"https://bdbddc.com/#dentist","name":"서울비디치과"}}
</script>
<style>
.faq-open > div:last-child { max-height: 500px !important; }
.faq-chevron.rotated { transform: rotate(180deg); }
.tn-seg { display:inline-flex; background:#f0e9df; border-radius:50px; padding:4px; gap:2px; }
.tn-seg button { border:none; background:transparent; padding:9px 20px; border-radius:50px; font-weight:700; font-size:0.9rem; color:#8a7a66; cursor:pointer; font-family:inherit; transition:all .18s; }
.tn-seg button.on { background:#6B4226; color:#fff; box-shadow:0 2px 8px rgba(107,66,38,.3); }
.tn-seg2 button { padding:8px 16px; font-size:0.82rem; }
.tn-quick-btn { border:1px solid #e0d4c0; background:#fff; color:#6B4226; padding:7px 14px; border-radius:50px; font-size:0.82rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
.tn-quick-btn:hover { background:#6B4226; color:#fff; }
@media (max-width:640px){ .tn-seg button{padding:8px 13px;font-size:0.82rem;} }
</style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

${deps.header}

<main id="main-content" role="main">
<nav class="content-tabs">
<a href="/blog/" class="tab-btn"><i class="fas fa-blog"></i> 블로그</a>
<a href="/video/" class="tab-btn"><i class="fab fa-youtube"></i> 영상</a>
<a href="/cases/gallery" class="tab-btn"><i class="fas fa-images"></i> 비포/애프터</a>
<a href="/encyclopedia/" class="tab-btn active"><i class="fas fa-book-medical"></i> 백과사전</a>
</nav>

<section class="content-section" style="padding: 40px 0 60px;">
<div class="container" style="max-width: 860px;">

<nav style="font-size:0.85rem;color:#888;margin-bottom:24px;">
<a href="/" style="color:#6B4226;text-decoration:none;">홈</a> &gt;
<a href="/encyclopedia/" style="color:#6B4226;text-decoration:none;">치과 백과사전</a> &gt;
<a href="/encyclopedia/category/${encodeURIComponent('치아 구조')}" style="color:#6B4226;text-decoration:none;">치아 구조</a> &gt;
<span>치아 번호</span>
</nav>

<article>
<!-- ═══════════ 헤더 ═══════════ -->
<header id="tooth-numbering-hero" style="margin-bottom:28px;">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
<span style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:#f5f0eb;color:#6B4226;font-weight:800;font-size:1.3rem;border-radius:12px;">🦷</span>
<h1 style="font-size:1.9rem;font-weight:800;color:#333;margin:0;">치아 번호 조회기</h1>
<span style="font-size:0.75rem;font-weight:700;padding:4px 12px;border-radius:50px;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;">무료 인터랙티브</span>
</div>
<p style="font-size:1rem;color:#6b5d52;line-height:1.8;margin:0;">궁금한 치아를 <strong style="color:#6B4226;">클릭 한 번</strong>이면 FDI·유니버설·팔머 번호와 이름, 나는 시기까지 바로 알려드립니다.<br>진료기록·견적서에 적힌 <strong style="color:#6B4226;">#26, #48</strong> 같은 숫자, 이제 직접 읽어보세요.</p>
</header>

<!-- ═══════════ 3초 공식 (AEO 즉답) ═══════════ -->
<div id="quick-answer" style="background:#faf7f3;border-left:4px solid #c9a96e;padding:18px 22px;border-radius:0 12px 12px 0;margin-bottom:28px;">
<p style="font-size:1.02rem;font-weight:700;color:#3E2B1F;margin:0 0 8px;">⚡ 치아 번호 3초 공식 (FDI)</p>
<p style="font-size:0.95rem;color:#5d4e40;line-height:1.85;margin:0;">
<strong style="color:#6B4226;">첫째 자리 = 어느 구역?</strong> 1 오른쪽 위 · 2 왼쪽 위 · 3 왼쪽 아래 · 4 오른쪽 아래 (유치는 5·6·7·8)<br>
<strong style="color:#6B4226;">둘째 자리 = 몇 번째?</strong> 앞니 중앙에서 1(중절치) → 8(사랑니) 순서<br>
예) <strong>26</strong> = 왼쪽 위 6번째 → 제1대구치 · <strong>48</strong> = 오른쪽 아래 8번째 → 사랑니
</p>
</div>

<!-- ═══════════ 인터랙티브 조회기 ═══════════ -->
<section id="tooth-chart-tool" aria-label="치아 번호 조회기" style="background:#fff;border:2px solid #e8d9c1;border-radius:20px;padding:22px 18px 18px;margin-bottom:14px;box-shadow:0 6px 24px rgba(107,66,38,0.08);">

<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
<div class="tn-seg" role="tablist" aria-label="치아 종류">
<button id="mode-perm" class="on" onclick="tnSetMode('permanent')">영구치 (11~48)</button>
<button id="mode-decid" onclick="tnSetMode('deciduous')">유치 (51~85)</button>
</div>
<div class="tn-seg tn-seg2" role="tablist" aria-label="표기법">
<button id="not-fdi" class="on" onclick="tnSetNotation('fdi')">FDI</button>
<button id="not-uni" onclick="tnSetNotation('universal')">Universal</button>
<button id="not-pal" onclick="tnSetNotation('palmer')">Palmer</button>
</div>
</div>

<!-- 번호 검색 -->
<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">
<div style="display:flex;gap:6px;flex:1;min-width:220px;">
<input id="tn-search" type="text" inputmode="numeric" placeholder="번호 입력 (예: 26, 48, 55)" aria-label="치아 번호 검색"
 style="flex:1;padding:11px 16px;border:1.5px solid #e0d4c0;border-radius:12px;font-size:0.95rem;font-family:inherit;outline:none;min-width:0;"
 onkeydown="if(event.key==='Enter')tnSearch()">
<button onclick="tnSearch()" style="padding:11px 20px;background:#6B4226;color:#fff;border:none;border-radius:12px;font-weight:700;font-size:0.9rem;cursor:pointer;font-family:inherit;white-space:nowrap;"><i class="fas fa-search"></i> 조회</button>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;">
<button class="tn-quick-btn" onclick="tnQuick(26)">#26</button>
<button class="tn-quick-btn" onclick="tnQuick(36)">#36</button>
<button class="tn-quick-btn" onclick="tnQuick(48)">#48 사랑니</button>
<button class="tn-quick-btn" onclick="tnQuick(55)">#55 유치</button>
</div>
</div>

<!-- 차트 -->
<div id="tn-chart" style="max-width:640px;margin:0 auto;"></div>

<!-- 사분면 범례 -->
<div style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin:6px 0 14px;font-size:0.78rem;color:#6b5d52;">
<span id="legend-q1"><span style="display:inline-block;width:12px;height:12px;background:#dbeafe;border:1px solid #93c5fd;border-radius:3px;vertical-align:-1px;"></span> 1번대 우상</span>
<span id="legend-q2"><span style="display:inline-block;width:12px;height:12px;background:#dcfce7;border:1px solid #86efac;border-radius:3px;vertical-align:-1px;"></span> 2번대 좌상</span>
<span id="legend-q3"><span style="display:inline-block;width:12px;height:12px;background:#fef3c7;border:1px solid #fcd34d;border-radius:3px;vertical-align:-1px;"></span> 3번대 좌하</span>
<span id="legend-q4"><span style="display:inline-block;width:12px;height:12px;background:#fce7f3;border:1px solid #f9a8d4;border-radius:3px;vertical-align:-1px;"></span> 4번대 우하</span>
</div>

<!-- 정보 패널 -->
<div id="tn-info" aria-live="polite" style="background:#faf7f3;border-radius:16px;padding:18px 18px;min-height:96px;">
<p style="margin:0;color:#a8997f;font-size:0.92rem;text-align:center;padding:24px 0;"><i class="fas fa-hand-pointer" style="margin-right:6px;"></i>위 그림에서 궁금한 치아를 클릭해 보세요</p>
</div>
</section>

<p style="font-size:0.78rem;color:#a8997f;margin:0 0 32px;text-align:right;">차트 좌우는 <strong>환자 본인 기준</strong> (마주 보는 시점에서는 거울처럼 반대) · 감수: 서울비디치과 문석준 대표원장</p>

<!-- ═══════════ 표기법 비교 ═══════════ -->
<section id="notation-compare" style="margin-bottom:36px;">
<h2 style="font-size:1.3rem;font-weight:800;color:#333;margin-bottom:14px;"><i class="fas fa-exchange-alt" style="color:#c9a96e;margin-right:8px;"></i>FDI vs 유니버설 vs 팔머 — 뭐가 다른가요?</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;">
<div style="background:#fff;border:2px solid #c9a96e;border-radius:16px;padding:18px 20px;">
<div style="font-size:0.75rem;font-weight:800;color:#fff;background:#6B4226;display:inline-block;padding:3px 12px;border-radius:50px;margin-bottom:10px;">한국 표준 ★</div>
<h3 style="font-size:1.05rem;font-weight:800;color:#3E2B1F;margin:0 0 6px;">FDI (두 자리)</h3>
<p style="font-size:0.85rem;color:#6b5d52;line-height:1.7;margin:0;">국제치과연맹 표준. <strong>사분면+순서</strong> 조합이라 번호만 봐도 위치가 바로 그려집니다. 국내 진료기록·보험 청구의 기본.</p>
<p style="font-size:0.9rem;font-weight:700;color:#6B4226;margin:10px 0 0;">예: 26 = 왼쪽 위 제1대구치</p>
</div>
<div style="background:#fff;border:1px solid #e8e0d8;border-radius:16px;padding:18px 20px;">
<div style="font-size:0.75rem;font-weight:700;color:#6b5d52;background:#f0e9df;display:inline-block;padding:3px 12px;border-radius:50px;margin-bottom:10px;">미국식</div>
<h3 style="font-size:1.05rem;font-weight:800;color:#3E2B1F;margin:0 0 6px;">Universal (1~32)</h3>
<p style="font-size:0.85rem;color:#6b5d52;line-height:1.7;margin:0;">오른쪽 위 사랑니(1번)부터 시계방향으로 한 바퀴 돌아 오른쪽 아래 사랑니(32번)까지. 유치는 A~T 알파벳.</p>
<p style="font-size:0.9rem;font-weight:700;color:#6B4226;margin:10px 0 0;">예: 14 = FDI 26과 같은 치아</p>
</div>
<div style="background:#fff;border:1px solid #e8e0d8;border-radius:16px;padding:18px 20px;">
<div style="font-size:0.75rem;font-weight:700;color:#6b5d52;background:#f0e9df;display:inline-block;padding:3px 12px;border-radius:50px;margin-bottom:10px;">교정·구강외과</div>
<h3 style="font-size:1.05rem;font-weight:800;color:#3E2B1F;margin:0 0 6px;">Palmer (기호+숫자)</h3>
<p style="font-size:0.85rem;color:#6b5d52;line-height:1.7;margin:0;">사분면을 ⌐ 모양 기호로, 순서를 1~8 숫자로 표기. 교정과 진료기록에서 자주 만나는 방식입니다.</p>
<p style="font-size:0.9rem;font-weight:700;color:#6B4226;margin:10px 0 0;">예: UL6 = FDI 26과 같은 치아</p>
</div>
</div>
</section>

<!-- ═══════════ 전체 변환표 (SSR — SEO/AEO) ═══════════ -->
<section id="conversion-tables" style="margin-bottom:36px;">
<h2 style="font-size:1.3rem;font-weight:800;color:#333;margin-bottom:6px;"><i class="fas fa-table" style="color:#c9a96e;margin-right:8px;"></i>영구치 전체 번호표 (32개, FDI 11~48)</h2>
<p style="font-size:0.85rem;color:#8a7a66;margin:0 0 14px;">FDI·유니버설·팔머 번호와 맹출(나는) 시기를 한 표로 정리했습니다.</p>
${tableHtml(ROWS_PERM, false)}

<h2 style="font-size:1.3rem;font-weight:800;color:#333;margin:32px 0 6px;"><i class="fas fa-baby" style="color:#c9a96e;margin-right:8px;"></i>유치 전체 번호표 (20개, FDI 51~85)</h2>
<p style="font-size:0.85rem;color:#8a7a66;margin:0 0 14px;">유치는 사분면 번호 5~8을 사용합니다. 탈락 시기(빠지는 나이)까지 함께 확인하세요.</p>
${tableHtml(ROWS_DECID, true)}
</section>

<!-- ═══════════ 헷갈림 포인트 ═══════════ -->
<section id="common-confusions" style="margin-bottom:36px;">
<h2 style="font-size:1.3rem;font-weight:800;color:#333;margin-bottom:14px;"><i class="fas fa-exclamation-circle" style="color:#c9a96e;margin-right:8px;"></i>자주 헷갈리는 3가지</h2>
<div style="display:grid;gap:10px;">
<div style="background:#fff;border:1px solid #e8e0d8;border-radius:14px;padding:16px 20px;display:flex;gap:14px;align-items:flex-start;">
<span style="font-size:1.4rem;">🪞</span>
<div><strong style="color:#3E2B1F;">좌우는 환자 본인 기준!</strong><p style="font-size:0.88rem;color:#6b5d52;line-height:1.7;margin:4px 0 0;">차트를 마주 보면 거울처럼 반대로 보입니다. 1번대(오른쪽 위)가 차트에선 왼쪽 위에 그려지는 이유죠.</p></div>
</div>
<div style="background:#fff;border:1px solid #e8e0d8;border-radius:14px;padding:16px 20px;display:flex;gap:14px;align-items:flex-start;">
<span style="font-size:1.4rem;">🦷</span>
<div><strong style="color:#3E2B1F;">6세 구치(16·26·36·46번)는 유치가 아닙니다!</strong><p style="font-size:0.88rem;color:#6b5d52;line-height:1.7;margin:4px 0 0;">만 6세경 유치 맨 뒤에 "새로" 나는 평생 영구치. 유치인 줄 알고 충치를 방치하면 평생 후회합니다. 나자마자 <a href="/encyclopedia/${encodeURIComponent('실란트')}" style="color:#6B4226;font-weight:600;">실란트</a>로 보호하세요.</p></div>
</div>
<div style="background:#fff;border:1px solid #e8e0d8;border-radius:14px;padding:16px 20px;display:flex;gap:14px;align-items:flex-start;">
<span style="font-size:1.4rem;">🔢</span>
<div><strong style="color:#3E2B1F;">해외 기록의 "14번"은 우리 14번이 아닐 수 있어요</strong><p style="font-size:0.88rem;color:#6b5d52;line-height:1.7;margin:4px 0 0;">미국식 Universal 14번 = FDI 26번(왼쪽 위 첫 큰어금니). 해외 진료기록·유학생 서류를 볼 때는 어떤 표기 체계인지 먼저 확인하세요.</p></div>
</div>
</div>
</section>

<!-- ═══════════ 이 위젯 퍼가기 (백링크 수확) ═══════════ -->
<section id="embed-widget" style="background:linear-gradient(135deg,#fdf9f4,#f5ecdf);border:2px dashed #c9a96e;border-radius:20px;padding:26px 24px;margin-bottom:36px;">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
<span style="font-size:1.5rem;">📋</span>
<h2 style="font-size:1.25rem;font-weight:800;color:#3E2B1F;margin:0;">이 위젯 퍼가기 — 블로그·홈페이지에 무료로 담아가세요</h2>
</div>
<p style="font-size:0.9rem;color:#6b5d52;line-height:1.8;margin:0 0 16px;">치위생과 학생, 치과 종사자, 정보 블로거 누구나 <strong style="color:#6B4226;">아래 코드를 복사해 붙여넣기</strong>만 하면 이 치아 번호 조회기를 그대로 쓸 수 있습니다. 출처 링크만 함께 유지해 주세요. 🙏</p>
<div style="position:relative;">
<pre id="embed-code" style="background:#3E2B1F;color:#e8dcc8;font-size:0.78rem;line-height:1.6;padding:18px 16px;border-radius:12px;overflow-x:auto;margin:0;white-space:pre-wrap;word-break:break-all;font-family:'SF Mono',Consolas,monospace;">${EMBED_SNIPPET.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
<button id="embed-copy-btn" onclick="tnCopyEmbed()" style="position:absolute;top:10px;right:10px;padding:8px 16px;background:#c9a96e;color:#3E2B1F;border:none;border-radius:8px;font-weight:800;font-size:0.8rem;cursor:pointer;font-family:inherit;"><i class="fas fa-copy"></i> 코드 복사</button>
</div>
<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;font-size:0.8rem;color:#8a7a66;">
<span><i class="fas fa-check" style="color:#6B4226;"></i> 무료 사용 (출처 표기 조건)</span>
<span><i class="fas fa-check" style="color:#6B4226;"></i> 모바일 반응형</span>
<span><i class="fas fa-check" style="color:#6B4226;"></i> 네이버 블로그는 스킨/HTML 편집이 가능한 티스토리·워드프레스·홈페이지에서 사용 가능</span>
</div>
<p style="font-size:0.82rem;color:#8a7a66;margin:12px 0 0;"><i class="fas fa-eye" style="margin-right:4px;"></i>미리보기: <a href="/widgets/tooth-numbering" target="_blank" rel="noopener" style="color:#6B4226;font-weight:700;">위젯 단독 화면 열기 →</a></p>
</section>

<!-- ═══════════ FAQ ═══════════ -->
<section id="tooth-number-faq" style="margin-bottom:36px;">
<h2 style="font-size:1.3rem;font-weight:800;color:#333;margin-bottom:16px;"><i class="fas fa-question-circle" style="color:#c9a96e;margin-right:8px;"></i>치아 번호 자주 묻는 질문</h2>
${faqHtml}
</section>

<!-- ═══════════ 전환 CTA ═══════════ -->
<div class="enc-helpful-cta" data-term="치아 번호" data-cta-type="info-bridge" style="background:linear-gradient(135deg,#fdf9f4,#f7efe4);border:1px solid #e8d9c1;border-radius:18px;padding:26px 24px;margin:8px 0 28px;text-align:center;">
<div style="font-size:1.5rem;margin-bottom:6px;">🔍</div>
<p style="font-size:1.12rem;font-weight:700;color:#3a2d22;margin:0 0 6px;">치아 번호, 이제 아셨죠? 그럼 내 치아는 어떤 상태일까요?</p>
<p style="font-size:0.92rem;color:#7a6a58;line-height:1.7;margin:0 0 18px;">번호를 아는 것보다 중요한 건 <strong style="color:#6B4226;">내 치아의 실제 상태</strong>입니다.<br>서울대 출신 전문의가 <strong style="color:#6B4226;">정밀 검진</strong>으로 직접 확인해드립니다.</p>
<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
<a href="/reservation" onclick="if(window.bdAnalytics)bdAnalytics.trackReservation('tooth_numbering_bridge')" style="display:inline-flex;align-items:center;gap:7px;padding:13px 26px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.97rem;box-shadow:0 4px 14px rgba(107,66,38,0.28);"><i class="fas fa-tooth"></i> 내 치아 검진 예약하기</a>
<a href="tel:041-415-2892" onclick="if(window.bdAnalytics)bdAnalytics.trackPhoneCall('tooth_numbering_bridge')" style="display:inline-flex;align-items:center;gap:7px;padding:13px 24px;background:#fff;color:#6B4226;border:2px solid #6B4226;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;"><i class="fas fa-phone"></i> 전화 문의</a>
</div>
<p style="font-size:0.78rem;color:#a8997f;margin:16px 0 0;"><i class="fas fa-clock" style="margin-right:4px;"></i> 365일 진료 · 당일 상담 가능</p>
</div>

<!-- ═══════════ 관련 용어 ═══════════ -->
<section id="related-terms" style="margin-bottom:32px;">
<h2 style="font-size:1.1rem;font-weight:700;color:#333;margin-bottom:12px;"><i class="fas fa-project-diagram" style="color:#c9a96e;margin-right:6px;"></i>함께 알면 좋은 용어</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px;">
${relatedHtml}
</div>
</section>

<div style="display:flex;justify-content:center;padding-top:20px;border-top:1px solid #e8e0d8;">
<a href="/encyclopedia/" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.85rem;"><i class="fas fa-th"></i> 백과사전 전체 보기 (838개 용어)</a>
</div>
</article>

</div>
</section>
</main>

<footer class="footer" role="contentinfo">
<div class="container">
<div class="footer-legal">
<p style="margin-bottom:8px;"><a href="https://medium.com/@sodanstjrwns" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.8rem;"><i class="fab fa-medium" style="margin-right:4px;"></i>English Clinical Articles by Dr. Moon on Medium</a></p>
<p class="legal-notice">*본 홈페이지의 모든 의료 정보는 의료법 및 보건복지부 의료광고 가이드라인을 준수합니다.</p>
<p class="copyright">&copy; 2018-2026 Seoul BD Dental Clinic. All rights reserved.</p>
</div>
</div>
</footer>

${deps.mobileNav}
<script src="/js/tooth-chart.js"></script>
<script>
var tnChart = null;
document.addEventListener('DOMContentLoaded', function(){
  tnChart = BDToothChart.render('#tn-chart', {
    onSelect: function(t){ document.getElementById('tn-info').innerHTML = BDToothChart.infoPanelHtml(t); tnSyncModeButtons(); }
  });
});
function tnSyncModeButtons(){
  var m = tnChart.getMode();
  document.getElementById('mode-perm').classList.toggle('on', m==='permanent');
  document.getElementById('mode-decid').classList.toggle('on', m==='deciduous');
}
function tnSetMode(m){
  tnChart.setMode(m); tnSyncModeButtons();
  document.getElementById('tn-info').innerHTML = '<p style="margin:0;color:#a8997f;font-size:0.92rem;text-align:center;padding:24px 0;"><i class="fas fa-hand-pointer" style="margin-right:6px;"></i>' + (m==='deciduous'?'유치(51~85번)':'영구치(11~48번)') + ' 차트에서 궁금한 치아를 클릭해 보세요</p>';
}
function tnSetNotation(n){
  tnChart.setNotation(n);
  document.getElementById('not-fdi').classList.toggle('on', n==='fdi');
  document.getElementById('not-uni').classList.toggle('on', n==='universal');
  document.getElementById('not-pal').classList.toggle('on', n==='palmer');
}
function tnSearch(){
  var v = document.getElementById('tn-search').value.trim();
  if(!v) return;
  v = v.replace(/[#번]/g,'');
  var ok = tnChart.select(v);
  if(ok){
    var t = BDToothChart.getTooth(v);
    document.getElementById('tn-info').innerHTML = BDToothChart.infoPanelHtml(t);
    tnSyncModeButtons();
    document.getElementById('tn-info').scrollIntoView({behavior:'smooth', block:'nearest'});
  } else {
    document.getElementById('tn-info').innerHTML = '<p style="margin:0;color:#b91c1c;font-size:0.9rem;text-align:center;padding:24px 0;"><i class="fas fa-exclamation-circle" style="margin-right:6px;"></i>"'+v.replace(/</g,'&lt;').slice(0,10)+'"번 치아는 없습니다. 영구치는 11~48, 유치는 51~85 사이의 FDI 번호를 입력해 주세요. (각 자리: 사분면 1~8 + 위치 1~8)</p>';
  }
}
function tnQuick(n){ document.getElementById('tn-search').value = n; tnSearch(); }
function tnCopyEmbed(){
  var code = ${JSON.stringify(EMBED_SNIPPET)};
  var btn = document.getElementById('embed-copy-btn');
  function done(){ btn.innerHTML = '<i class="fas fa-check"></i> 복사 완료!'; btn.style.background='#16a34a'; btn.style.color='#fff'; setTimeout(function(){ btn.innerHTML='<i class="fas fa-copy"></i> 코드 복사'; btn.style.background='#c9a96e'; btn.style.color='#3E2B1F'; }, 2200); if(window.dataLayer) dataLayer.push({event:'widget_embed_copy', widget:'tooth-numbering'}); }
  if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(code).then(done); }
  else { var ta=document.createElement('textarea'); ta.value=code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done(); }
}
</script>
<script src="/js/main.js" defer></script>
<script src="/js/gnb-v2.js?v=e0c7aede" defer></script>
<script src="/js/lang-switcher.js" defer></script>
</body>
</html>`
}

// ============================================================
// 임베드 위젯 페이지 (iframe용 자체완결 HTML)
// ============================================================
function renderWidgetPage(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>치아 번호 조회기 — 서울비디치과</title>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<style>
*{box-sizing:border-box;}
body{font-family:'Pretendard',-apple-system,sans-serif;margin:0;background:#fff;color:#333;}
.wrap{padding:16px 14px 12px;max-width:720px;margin:0 auto;}
.hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
.hd h1{font-size:1.05rem;font-weight:800;color:#3E2B1F;margin:0;display:flex;align-items:center;gap:7px;}
.seg{display:inline-flex;background:#f0e9df;border-radius:50px;padding:3px;gap:2px;}
.seg button{border:none;background:transparent;padding:7px 14px;border-radius:50px;font-weight:700;font-size:0.78rem;color:#8a7a66;cursor:pointer;font-family:inherit;transition:all .18s;}
.seg button.on{background:#6B4226;color:#fff;}
.searchrow{display:flex;gap:6px;margin-bottom:8px;}
.searchrow input{flex:1;padding:9px 14px;border:1.5px solid #e0d4c0;border-radius:10px;font-size:0.88rem;font-family:inherit;outline:none;min-width:0;}
.searchrow button{padding:9px 16px;background:#6B4226;color:#fff;border:none;border-radius:10px;font-weight:700;font-size:0.82rem;cursor:pointer;font-family:inherit;white-space:nowrap;}
#w-info{background:#faf7f3;border-radius:14px;padding:14px;min-height:80px;margin-top:4px;}
.ft{border-top:1px solid #f0e9df;margin-top:12px;padding:10px 2px 2px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:0.72rem;color:#a8997f;}
.ft a{color:#6B4226;font-weight:700;text-decoration:none;}
.ft a:hover{text-decoration:underline;}
</style>
</head>
<body>
<div class="wrap">
<div class="hd">
<h1>🦷 치아 번호 조회기</h1>
<div class="seg">
<button id="wm-perm" class="on" onclick="wSetMode('permanent')">영구치</button>
<button id="wm-decid" onclick="wSetMode('deciduous')">유치</button>
</div>
</div>
<div class="searchrow">
<input id="w-search" type="text" inputmode="numeric" placeholder="번호 입력 (예: 26, 48, 55)" onkeydown="if(event.key==='Enter')wSearch()">
<button onclick="wSearch()"><i class="fas fa-search"></i> 조회</button>
</div>
<div id="w-chart"></div>
<div id="w-info"><p style="margin:0;color:#a8997f;font-size:0.85rem;text-align:center;padding:20px 0;"><i class="fas fa-hand-pointer" style="margin-right:5px;"></i>궁금한 치아를 클릭해 보세요</p></div>
<div class="ft">
<span>FDI 국제 표준 · 좌우는 환자 본인 기준</span>
<span>제공: <a href="${CANONICAL_PAGE}" target="_blank" rel="noopener">서울비디치과 치과 백과사전</a></span>
</div>
</div>
<script src="https://bdbddc.com/js/tooth-chart.js"></script>
<script>
(function(){
  // 로컬/프리뷰 환경에서 절대경로 스크립트 로드 실패 시 상대경로 폴백
  if (!window.BDToothChart) {
    var s = document.createElement('script');
    s.src = '/js/tooth-chart.js';
    s.onload = init;
    document.body.appendChild(s);
  } else { init(); }
  var wChart = null;
  function init(){
    wChart = BDToothChart.render('#w-chart', {
      onSelect: function(t){ document.getElementById('w-info').innerHTML = BDToothChart.infoPanelHtml(t); wSync(); }
    });
    window.wChart = wChart;
  }
  window.wSync = function(){
    var m = wChart.getMode();
    document.getElementById('wm-perm').classList.toggle('on', m==='permanent');
    document.getElementById('wm-decid').classList.toggle('on', m==='deciduous');
  };
  window.wSetMode = function(m){
    wChart.setMode(m); window.wSync();
    document.getElementById('w-info').innerHTML = '<p style="margin:0;color:#a8997f;font-size:0.85rem;text-align:center;padding:20px 0;"><i class="fas fa-hand-pointer" style="margin-right:5px;"></i>' + (m==='deciduous'?'유치(51~85번)':'영구치(11~48번)') + ' 차트에서 클릭해 보세요</p>';
  };
  window.wSearch = function(){
    var v = document.getElementById('w-search').value.trim().replace(/[#번]/g,'');
    if(!v) return;
    if(wChart.select(v)){
      document.getElementById('w-info').innerHTML = BDToothChart.infoPanelHtml(BDToothChart.getTooth(v));
      window.wSync();
    } else {
      document.getElementById('w-info').innerHTML = '<p style="margin:0;color:#b91c1c;font-size:0.82rem;text-align:center;padding:20px 0;">해당 번호가 없습니다. 영구치 11~48 / 유치 51~85 범위로 입력해 주세요.</p>';
    }
  };
})();
</script>
</body>
</html>`
}

// ============================================================
// 라우트 등록
// ============================================================
export function registerToothNumberingWidget(app: Hono<any>) {
  app.get('/widgets/tooth-numbering', (c) => {
    // iframe 임베드 허용: 전역 X-Frame-Options(SAMEORIGIN)은 index.tsx 미들웨어에서 /widgets/* 예외 처리
    c.header('Content-Security-Policy', 'frame-ancestors *')
    c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
    return c.html(renderWidgetPage())
  })
}
