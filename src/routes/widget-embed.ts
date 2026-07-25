// ============================================================
// 위젯 임베드 허브 (Widget Embed Hub) — v5.35
// 백링크 수확 구조 확장: /widgets/tooth-numbering 패턴을 21종 위젯 전체로 확산
// - /widgets/:slug        : iframe 임베드용 자체완결 위젯 (noindex, frame 허용)
// - /widgets              : 위젯 갤러리 (index 허용, 내부 허브 페이지)
// - 각 위젯 하단 → 원본 백과사전 페이지로 do-follow 백링크
// ============================================================
import type { Hono } from 'hono'
import {
  WIDGET_INLAY_COMPARE, WIDGET_CRACK_CHECK, WIDGET_IMPLANT_ANATOMY,
  WIDGET_RCT_STEPS, WIDGET_EXTRACTION_TIMELINE, WIDGET_TEETH_TIMELINE,
  WIDGET_ORTHO_COMPARE, WIDGET_WHITENING_COMPARE, WIDGET_SCALING_INSURANCE,
} from './enc-super'
import {
  WIDGET_TOOTH_EXPLORER, WIDGET_EXTRUSION_TYPE, WIDGET_TMJ_SOUND,
  WIDGET_INSURANCE_CHECK, WIDGET_MIDLINE_CHECK,
} from './enc-super-v534'
import {
  WIDGET_TOOTH_SURFACE, WIDGET_INCISOR_RATIO, WIDGET_TONGUE_TRIAGE,
  WIDGET_OPPOSING_CHAIN, WIDGET_PULP_TRIAGE, WIDGET_POWERCHAIN_CARE,
} from './enc-super-v538'

const ORIGIN = 'https://bdbddc.com'

export type WidgetDef = {
  slug: string
  title: string        // 위젯 제목
  desc: string         // 갤러리/메타용 한 줄 설명
  term: string         // 원본 백과사전 용어 (백링크 타깃)
  linkLabel: string    // 백링크 앵커 텍스트 (SEO 핵심)
  height: number       // iframe 권장 높이
  emoji: string
  html: string         // 자체완결 위젯 HTML (style+script 포함)
  /** 같은 위젯의 프리셋 변형 → 갤러리 카드에서는 숨기고 라우트·퍼가기 박스만 제공 */
  galleryHidden?: boolean
}

export const WIDGETS: WidgetDef[] = [
  {
    slug: 'inlay-compare', emoji: '🔬',
    title: '인레이 재료 비교기',
    desc: '골드·세라믹·레진 인레이를 수명·심미성·비용으로 한눈에 비교합니다.',
    term: '인레이', linkLabel: '인레이 재료별 비교 — 서울비디치과 치과 백과사전',
    height: 700, html: WIDGET_INLAY_COMPARE,
  },
  {
    slug: 'crack-check', emoji: '🩺',
    title: '치아 크랙 증상 자가 체크',
    desc: '씹을 때 통증·시림 등 증상을 골라 치아 균열 가능성을 가늠해 봅니다.',
    term: '치아 균열', linkLabel: '치아 균열(크랙) 증상과 치료 — 서울비디치과 치과 백과사전',
    height: 720, html: WIDGET_CRACK_CHECK,
  },
  {
    slug: 'implant-anatomy', emoji: '🦷',
    title: '임플란트 3단 구조 해부도',
    desc: '픽스처·어버트먼트·크라운 3단 구조를 클릭으로 살펴봅니다.',
    term: '임플란트', linkLabel: '임플란트 구조와 비용 총정리 — 서울비디치과 치과 백과사전',
    height: 660, html: WIDGET_IMPLANT_ANATOMY,
  },
  {
    slug: 'root-canal-steps', emoji: '📊',
    title: '신경치료 단계 진행바',
    desc: '신경치료가 몇 번에 끝나는지, 각 회차에 무엇을 하는지 보여줍니다.',
    term: '신경치료', linkLabel: '신경치료 과정과 횟수 — 서울비디치과 치과 백과사전',
    height: 620, html: WIDGET_RCT_STEPS,
  },
  {
    slug: 'extraction-timeline', emoji: '🗓️',
    title: '발치 후 회복 타임라인',
    desc: '발치 당일부터 한 달까지, 시기별 주의사항을 타임라인으로 안내합니다.',
    term: '발치', linkLabel: '발치 후 주의사항과 회복 기간 — 서울비디치과 치과 백과사전',
    height: 700, html: WIDGET_EXTRACTION_TIMELINE,
  },
  {
    slug: 'teeth-timeline', emoji: '👶',
    title: '우리 아이 이갈이 시기 계산기',
    desc: '아이 나이를 넣으면 지금 어떤 영구치가 나올 시기인지 알려줍니다.',
    term: '영구치 맹출 순서', linkLabel: '영구치 맹출 순서와 시기표 — 서울비디치과 치과 백과사전',
    height: 680, html: WIDGET_TEETH_TIMELINE,
  },
  {
    slug: 'ortho-compare', emoji: '📐',
    title: '교정 장치 비교기',
    desc: '메탈·세라믹·설측·투명교정을 심미성·기간·관리 난이도로 비교합니다.',
    term: '인비절라인', linkLabel: '투명교정(인비절라인) 비교 — 서울비디치과 치과 백과사전',
    height: 700, html: WIDGET_ORTHO_COMPARE,
  },
  {
    slug: 'whitening-compare', emoji: '✨',
    title: '치아 미백 방식 비교기',
    desc: '전문가 미백·자가 미백·치약을 효과·지속기간·비용으로 비교합니다.',
    term: '치아 미백', linkLabel: '치아 미백 방법별 비교 — 서울비디치과 치과 백과사전',
    height: 680, html: WIDGET_WHITENING_COMPARE,
  },
  {
    slug: 'scaling-insurance', emoji: '💳',
    title: '스케일링 건강보험 적용 체크',
    desc: '나이·올해 사용 여부·치료 목적을 고르면 보험 적용 여부를 알려줍니다.',
    term: '스케일링 건강보험', linkLabel: '스케일링 건강보험 적용 기준 — 서울비디치과 치과 백과사전',
    height: 660, html: WIDGET_SCALING_INSURANCE,
  },
  // ── v5.34 위젯 ──
  {
    slug: 'tooth-explorer', emoji: '🦷',
    title: '치아 이름·번호 탐색기',
    desc: '중절치부터 사랑니까지, 치아 이름과 치식(FDI) 번호를 매칭해 봅니다.',
    term: '치식', linkLabel: '치식 읽는 법 — 서울비디치과 치과 백과사전',
    height: 620, html: WIDGET_TOOTH_EXPLORER('em', 'm1'),
  },
  {
    slug: 'extrusion-type', emoji: '🔎',
    title: '정출 유형 판별기',
    desc: '외상성·교정적·병적 과맹출 중 어떤 정출인지 구분해 드립니다.',
    term: '정출', linkLabel: '정출의 3가지 유형 완전 구분 — 서울비디치과 치과 백과사전',
    height: 640, html: WIDGET_EXTRUSION_TYPE,
  },
  {
    slug: 'tmj-sound', emoji: '👂',
    title: '턱 소리 자가 체커',
    desc: '딸깍 vs 사각사각, 소리 종류와 증상으로 병원 방문 필요도를 확인합니다.',
    term: '턱에서 소리', linkLabel: '턱에서 딱 소리 날 때 — 서울비디치과 치과 백과사전',
    height: 720, html: WIDGET_TMJ_SOUND,
  },
  {
    slug: 'insurance-check', emoji: '📋',
    title: '치과 실비보험 보장 체커',
    desc: '치료 원인과 종류를 고르면 실손보험 보장 가능성을 안내합니다.',
    term: '실비보험', linkLabel: '치과 실비보험 보장 범위 — 서울비디치과 치과 백과사전',
    height: 700, html: WIDGET_INSURANCE_CHECK,
  },
  {
    slug: 'midline-check', emoji: '📏',
    title: '치아 정중선 자가 체크',
    desc: '정중선이 몇 mm 어긋났는지, 교정이 필요한 수준인지 확인합니다.',
    term: '정중선', linkLabel: '치아 정중선 안 맞을 때 — 서울비디치과 치과 백과사전',
    height: 680, html: WIDGET_MIDLINE_CHECK,
  },
  // ── v5.37: 치아 탐색기 프리셋 변형 (갤러리 카드 중복 방지 → galleryHidden) ──
  // 소구치·대구치·견치 페이지도 '퍼가기' 백링크 박스를 갖도록 매핑 누락분 보수
  {
    slug: 'tooth-explorer-premolar', emoji: '🦷',
    title: '치아 이름·번호 탐색기 (소구치)',
    desc: '소구치(작은어금니)를 기본 선택한 치아 이름·치식 번호 탐색기입니다.',
    term: '소구치', linkLabel: '소구치(작은어금니) 위치와 치식 번호 — 서울비디치과 치과 백과사전',
    height: 620, html: WIDGET_TOOTH_EXPLORER('sg', 'p1'), galleryHidden: true,
  },
  {
    slug: 'tooth-explorer-molar', emoji: '🦷',
    title: '치아 이름·번호 탐색기 (대구치)',
    desc: '대구치(큰어금니)를 기본 선택한 치아 이름·치식 번호 탐색기입니다.',
    term: '대구치', linkLabel: '대구치(큰어금니) 위치와 치식 번호 — 서울비디치과 치과 백과사전',
    height: 620, html: WIDGET_TOOTH_EXPLORER('dg', 'm1'), galleryHidden: true,
  },
  {
    slug: 'tooth-explorer-canine', emoji: '🦷',
    title: '치아 이름·번호 탐색기 (견치)',
    desc: '견치(송곳니)를 기본 선택한 치아 이름·치식 번호 탐색기입니다.',
    term: '견치', linkLabel: '견치(송곳니) 위치와 치식 번호 — 서울비디치과 치과 백과사전',
    height: 620, html: WIDGET_TOOTH_EXPLORER('gc', 'cn'), galleryHidden: true,
  },
  // ── v5.38: 제로클릭 2차 회수 8종 위젯 ──
  {
    slug: 'tooth-surface', emoji: '🧭',
    title: '치아 5면 탐색기',
    desc: '설면·협면·교합면·근심면·원심면을 눌러 정식 명칭·영문 용어·관리 포인트를 확인하는 위젯입니다.',
    term: '설면', linkLabel: '설면(치아 혀 쪽 면)이란? — 서울비디치과 치과 백과사전',
    height: 620, html: WIDGET_TOOTH_SURFACE('sm', 'li'),
  },
  {
    slug: 'tooth-surface-cusp', emoji: '🧭',
    title: '치아 5면 탐색기 (교합면)',
    desc: '교합면(씹는 면)을 기본 선택한 치아 5면 탐색기입니다.',
    term: '교두', linkLabel: '교두(어금니 씹는 면의 돌출부)란? — 서울비디치과 치과 백과사전',
    height: 620, html: WIDGET_TOOTH_SURFACE('cusp', 'oc'), galleryHidden: true,
  },
  {
    slug: 'incisor-ratio', emoji: '📐',
    title: '앞니 황금비율 계산기',
    desc: '앞니 가로·세로를 입력하면 황금비율(75~80%) 범위인지, 왜소치 가능성이 있는지 알려주는 계산기입니다.',
    term: '측절치', linkLabel: '측절치(앞니 옆 2번 치아)란? — 서울비디치과 치과 백과사전',
    height: 640, html: WIDGET_INCISOR_RATIO,
  },
  {
    slug: 'incisor-ratio-central', emoji: '📐',
    title: '앞니 황금비율 계산기 (중절치)',
    desc: '중절치(1번 치아) 기준 앞니 황금비율 계산기입니다.',
    term: '중절치', linkLabel: '중절치(가장 앞 1번 치아)란? — 서울비디치과 치과 백과사전',
    height: 640, html: WIDGET_INCISOR_RATIO, galleryHidden: true,
  },
  {
    slug: 'tongue-triage', emoji: '👅',
    title: '혀 병변 자가 체크',
    desc: '혀의 무늬가 이동하는지 고정인지, 동반 증상이 있는지 체크해 참고 정보를 제공합니다. 진단이 아닌 자가 참고용입니다.',
    term: '지도설', linkLabel: '지도설(혀 지도 모양 반점)이란? — 서울비디치과 치과 백과사전',
    height: 720, html: WIDGET_TONGUE_TRIAGE,
  },
  {
    slug: 'opposing-chain', emoji: '⛓️',
    title: '대합치 연쇄 반응 시뮬레이터',
    desc: '어금니를 뽑고 방치하면 시간대별로 어떤 변화가 일어나는지 단계별로 보여주는 위젯입니다.',
    term: '대합치', linkLabel: '대합치(위아래 맞물리는 짝 치아)란? — 서울비디치과 치과 백과사전',
    height: 640, html: WIDGET_OPPOSING_CHAIN,
  },
  {
    slug: 'pulp-triage', emoji: '🩺',
    title: '치아 통증 단계 자가 체크',
    desc: '통증 양상과 동반 증상을 선택하면 가역적·비가역적 치수염 참고 단계를 알려줍니다. 진단이 아닌 자가 참고용입니다.',
    term: '치수강', linkLabel: '치수강(치아 속 신경이 있는 공간)이란? — 서울비디치과 치과 백과사전',
    height: 720, html: WIDGET_PULP_TRIAGE,
  },
  {
    slug: 'powerchain-care', emoji: '🔗',
    title: '파워체인 관리 Q&A',
    desc: '교체 주기·변색·끊어짐·통증·양치 등 파워체인 착용 중 가장 많이 묻는 5가지를 정리한 위젯입니다.',
    term: '파워체인', linkLabel: '파워체인(교정용 고무 사슬)이란? — 서울비디치과 치과 백과사전',
    height: 640, html: WIDGET_POWERCHAIN_CARE,
  },
]

const canonicalOf = (term: string) => `${ORIGIN}/encyclopedia/${encodeURIComponent(term)}`

export function embedSnippetOf(w: WidgetDef): string {
  return `<!-- ${w.title} by 서울비디치과 -->
<iframe src="${ORIGIN}/widgets/${w.slug}" width="100%" height="${w.height}" style="border:1px solid #e8e0d8;border-radius:14px;max-width:760px;" loading="lazy" title="${w.title} — 서울비디치과"></iframe>
<p style="font-size:13px;color:#888;">출처: <a href="${canonicalOf(w.term)}" target="_blank" rel="noopener">${w.linkLabel}</a></p>`
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ------------------------------------------------------------
// 임베드 페이지 (iframe 내부) — 위젯 본체 + 출처 백링크
// ------------------------------------------------------------
function renderEmbedPage(w: WidgetDef): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,follow">
<title>${w.title} — 서울비디치과</title>
<meta name="description" content="${w.desc}">
<link rel="canonical" href="${canonicalOf(w.term)}">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
*{box-sizing:border-box;}
body{font-family:'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif;margin:0;background:#fff;color:#333;-webkit-text-size-adjust:100%;}
.wrap{padding:12px 12px 10px;max-width:760px;margin:0 auto;}
.wrap > div:first-child{margin-top:0 !important;}
.ft{border-top:1px solid #f0e9df;margin-top:10px;padding:10px 2px 2px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:0.72rem;color:#a8997f;}
.ft a{color:#6B4226;font-weight:700;text-decoration:none;}
.ft a:hover{text-decoration:underline;}
</style>
</head>
<body>
<div class="wrap">
${w.html}
<div class="ft">
<span>서울비디치과 치과 백과사전 · 참고용 정보</span>
<span>제공: <a href="${canonicalOf(w.term)}" target="_blank" rel="noopener">${w.linkLabel}</a></span>
</div>
</div>
</body>
</html>`
}

// ------------------------------------------------------------
// 위젯 갤러리 (/widgets) — 색인 허용, 퍼가기 코드 제공
// ------------------------------------------------------------
function renderGallery(): string {
  const all = [
    { slug: 'tooth-numbering', emoji: '🦷', title: '치아 번호 조회기', desc: 'FDI 치식 번호를 입력하면 어느 치아인지 즉시 알려주는 대표 위젯입니다.', term: '치아 번호', height: 760, linkLabel: '치아 번호 읽는 법 — 서울비디치과 치과 백과사전' },
    ...WIDGETS.filter(w => !w.galleryHidden).map(w => ({ slug: w.slug, emoji: w.emoji, title: w.title, desc: w.desc, term: w.term, height: w.height, linkLabel: w.linkLabel })),
  ]
  const cards = all.map(w => `
<article style="border:1px solid #e8e0d8;border-radius:16px;padding:20px;background:#fff;display:flex;flex-direction:column;gap:10px;">
  <h2 style="font-size:1.02rem;font-weight:800;color:#3E2B1F;margin:0;display:flex;align-items:center;gap:8px;">${w.emoji} ${w.title}</h2>
  <p style="font-size:0.86rem;color:#6f6257;line-height:1.65;margin:0;flex:1;">${w.desc}</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <a href="/widgets/${w.slug}" target="_blank" rel="noopener" style="flex:1;text-align:center;background:#6B4226;color:#fff;border-radius:10px;padding:9px 12px;font-size:0.82rem;font-weight:700;text-decoration:none;">미리보기</a>
    <a href="/encyclopedia/${encodeURIComponent(w.term)}" style="flex:1;text-align:center;background:#faf7f3;color:#6B4226;border:1px solid #e0d4c0;border-radius:10px;padding:9px 12px;font-size:0.82rem;font-weight:700;text-decoration:none;">해설 보기</a>
  </div>
  <button type="button" data-slug="${w.slug}" data-h="${w.height}" data-term="${encodeURIComponent(w.term)}" data-label="${w.linkLabel.replace(/"/g, '&quot;')}" data-title="${w.title.replace(/"/g, '&quot;')}" class="cpy" style="cursor:pointer;border:1px dashed #d4b896;background:#fffdf9;color:#6B4226;border-radius:10px;padding:9px 12px;font-size:0.8rem;font-weight:700;font-family:inherit;">📋 퍼가기 코드 복사</button>
</article>`).join('')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>치과 위젯 모음 21종 — 블로그에 무료로 퍼가세요 | 서울비디치과</title>
<meta name="description" content="치아 번호 조회기, 임플란트 해부도, 스케일링 보험 체커 등 치과 인터랙티브 위젯 21종. 블로그·홈페이지에 iframe 한 줄로 무료 임베드할 수 있습니다.">
<link rel="canonical" href="${ORIGIN}/widgets">
<meta property="og:title" content="치과 위젯 모음 21종 — 블로그에 무료로 퍼가세요">
<meta property="og:description" content="치과 인터랙티브 위젯 21종을 iframe 한 줄로 무료 임베드하세요. 서울비디치과 치과 백과사전 제공.">
<meta property="og:url" content="${ORIGIN}/widgets">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '치과 위젯 모음 — 서울비디치과',
  description: '치과 인터랙티브 위젯 21종. 블로그·홈페이지에 무료 임베드 가능.',
  url: `${ORIGIN}/widgets`,
  isPartOf: { '@type': 'WebSite', name: '서울비디치과', url: ORIGIN },
  hasPart: all.map(w => ({ '@type': 'WebApplication', name: w.title, description: w.desc, url: `${ORIGIN}/widgets/${w.slug}`, applicationCategory: 'HealthApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' } })),
})}</script>
<style>
*{box-sizing:border-box;}
body{font-family:'Pretendard',-apple-system,sans-serif;margin:0;background:#faf7f3;color:#333;}
.page{max-width:1120px;margin:0 auto;padding:40px 20px 70px;}
.hero{text-align:center;margin-bottom:36px;}
.hero h1{font-size:1.85rem;font-weight:900;color:#3E2B1F;margin:0 0 12px;line-height:1.35;}
.hero p{font-size:0.95rem;color:#6f6257;line-height:1.75;margin:0 auto;max-width:640px;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;}
.note{margin-top:36px;background:#fff;border:1px solid #e8e0d8;border-radius:16px;padding:22px 24px;font-size:0.86rem;color:#6f6257;line-height:1.8;}
.note b{color:#3E2B1F;}
#toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:#3E2B1F;color:#fff;padding:12px 22px;border-radius:50px;font-size:0.85rem;font-weight:700;opacity:0;transition:all .25s;pointer-events:none;z-index:99;}
#toast.on{opacity:1;transform:translateX(-50%) translateY(0);}
@media(max-width:600px){.hero h1{font-size:1.45rem;}.page{padding:28px 16px 56px;}}
</style>
</head>
<body>
<div class="page">
<header class="hero">
<h1>🧩 치과 위젯 모음 21종<br>블로그에 무료로 퍼가세요</h1>
<p>서울비디치과 치과 백과사전이 만든 인터랙티브 위젯입니다. iframe 한 줄이면 어떤 블로그·홈페이지에도 붙습니다. 상업적 이용 포함 <b>무료</b>이며, 출처 링크만 함께 남겨 주시면 됩니다.</p>
</header>
<main class="grid">${cards}</main>
<section class="note">
<p style="margin:0 0 10px;"><b>이용 안내</b></p>
<p style="margin:0 0 6px;">• 개인 블로그, 병원 홈페이지, 커뮤니티 어디에나 자유롭게 임베드하실 수 있습니다.</p>
<p style="margin:0 0 6px;">• 위젯은 안내·참고용 정보이며 의학적 진단을 대체하지 않습니다.</p>
<p style="margin:0 0 6px;">• 코드에 포함된 <b>출처 링크는 삭제하지 말아 주세요.</b> 그 한 줄이 이 위젯을 계속 무료로 유지하는 힘입니다.</p>
<p style="margin:0;">• 문의: 서울비디치과 <a href="tel:0414152892" style="color:#6B4226;font-weight:700;">041-415-2892</a></p>
</section>
<p style="text-align:center;margin-top:28px;font-size:0.82rem;color:#a8997f;">
<a href="/encyclopedia" style="color:#6B4226;font-weight:700;text-decoration:none;">← 치과 백과사전 838개 용어 보러 가기</a>
</p>
</div>
<div id="toast">📋 코드가 복사되었습니다!</div>
<script>
(function(){
  var origin='${ORIGIN}';
  function snippet(b){
    var term=b.dataset.term,label=b.dataset.label,title=b.dataset.title,slug=b.dataset.slug,h=b.dataset.h;
    return '<!-- '+title+' by 서울비디치과 -->\\n'+
      '<iframe src="'+origin+'/widgets/'+slug+'" width="100%" height="'+h+'" style="border:1px solid #e8e0d8;border-radius:14px;max-width:760px;" loading="lazy" title="'+title+' — 서울비디치과"></iframe>\\n'+
      '<p style="font-size:13px;color:#888;">출처: <a href="'+origin+'/encyclopedia/'+term+'" target="_blank" rel="noopener">'+label+'</a></p>';
  }
  var toast=document.getElementById('toast');
  document.querySelectorAll('.cpy').forEach(function(b){
    b.onclick=function(){
      var code=snippet(b);
      var done=function(){toast.classList.add('on');setTimeout(function(){toast.classList.remove('on');},1800);};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(code).then(done).catch(function(){fb(code,done);});}
      else{fb(code,done);}
    };
  });
  function fb(code,done){
    var ta=document.createElement('textarea');ta.value=code;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done();}catch(e){alert(code);}document.body.removeChild(ta);
  }
})();
</script>
</body>
</html>`
}

// ------------------------------------------------------------
// 백과사전 본문에 삽입할 "퍼가기" 블록 (SSR)
// ------------------------------------------------------------
export function embedBoxHtml(w: WidgetDef): string {
  const code = esc(embedSnippetOf(w))
  const id = 'eb-' + w.slug
  return `
<section id="${id}" style="background:linear-gradient(135deg,#fffdf9,#faf5ee);border:1px dashed #d4b896;border-radius:16px;padding:20px;margin:26px 0;">
<h3 style="font-size:1.02rem;font-weight:800;color:#3E2B1F;margin:0 0 6px;">🧩 이 위젯, 블로그에 무료로 퍼가세요</h3>
<p style="font-size:0.84rem;color:#8a7a66;margin:0 0 14px;line-height:1.7;">아래 코드를 복사해 붙이면 <b>${w.title}</b>가 그대로 들어갑니다. 상업적 이용 포함 무료 — 출처 링크만 남겨 주세요.</p>
<pre style="background:#3E2B1F;color:#e8dcc8;font-size:0.74rem;line-height:1.65;padding:16px 14px;border-radius:12px;overflow-x:auto;margin:0 0 12px;white-space:pre-wrap;word-break:break-all;font-family:'SF Mono',Consolas,monospace;">${code}</pre>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button type="button" id="${id}-btn" style="cursor:pointer;border:none;background:#6B4226;color:#fff;border-radius:10px;padding:10px 18px;font-size:0.84rem;font-weight:700;font-family:inherit;">📋 코드 복사</button>
<a href="/widgets/${w.slug}" target="_blank" rel="noopener" style="border:1px solid #d4b896;background:#fff;color:#6B4226;border-radius:10px;padding:10px 18px;font-size:0.84rem;font-weight:700;text-decoration:none;">위젯 단독 보기</a>
<a href="/widgets" style="border:1px solid #d4b896;background:#fff;color:#6B4226;border-radius:10px;padding:10px 18px;font-size:0.84rem;font-weight:700;text-decoration:none;">위젯 21종 전체</a>
</div>
</section>
<script>(function(){
var b=document.getElementById('${id}-btn');if(!b)return;
var code=${JSON.stringify(embedSnippetOf(w))};
b.onclick=function(){
  var ok=function(){var t=b.textContent;b.textContent='✅ 복사 완료!';setTimeout(function(){b.textContent=t;},1800);};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(code).then(ok).catch(function(){f();});}else{f();}
  function f(){var ta=document.createElement('textarea');ta.value=code;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(e){}document.body.removeChild(ta);}
};
})();</script>`
}

// term → WidgetDef 조회 (백과사전 페이지에서 자동 삽입용)
export const WIDGET_BY_TERM: Record<string, WidgetDef> = {}
for (const w of WIDGETS) WIDGET_BY_TERM[w.term] = w

// ------------------------------------------------------------
// 라우트 등록
// ------------------------------------------------------------
export function registerWidgetEmbeds(app: Hono<any>) {
  // 갤러리 허브
  app.get('/widgets', (c) => {
    c.header('Cache-Control', 'public, max-age=1800, s-maxage=43200')
    return c.html(renderGallery())
  })

  // 개별 임베드 위젯
  for (const w of WIDGETS) {
    app.get(`/widgets/${w.slug}`, (c) => {
      c.header('Content-Security-Policy', 'frame-ancestors *')
      c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
      return c.html(renderEmbedPage(w))
    })
  }
}
