// ============================================================
// 치아 차트 SVG — 서버 사이드 렌더러 (v5.54)
// public/js/tooth-chart.js 의 renderSVG() 를 그대로 서버로 옮긴 것.
//
// 왜 필요한가:
//   기존에는 <div id="tn-chart"></div> 가 빈 채로 나가고 브라우저 JS가 채웠다.
//   → GPTBot·PerplexityBot·ClaudeBot 등 JS를 실행하지 않는 크롤러에게는
//     이 페이지의 핵심 자산(32개 치아 번호 도해)이 통째로 "존재하지 않는" 상태였다.
//   → LCP도 JS 다운로드·실행 이후로 밀렸고, JS를 끄면 아무것도 안 보였다.
//
// 렌더 결과는 클라이언트 renderSVG(state) 와 바이트 단위로 동일해야 한다.
//   (BDToothChart.render() 가 마운트 직후 innerHTML 을 덮어쓰므로,
//    다르면 하이드레이션 순간 화면이 튄다. 좌표 계산식·toFixed 자릿수를 건드리지 말 것.)
// ============================================================

type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar'

const SVG_POS_PERM: Record<number, { ko: string; type: ToothType }> = {
  1: { ko: '중절치', type: 'incisor' },
  2: { ko: '측절치', type: 'incisor' },
  3: { ko: '견치(송곳니)', type: 'canine' },
  4: { ko: '제1소구치', type: 'premolar' },
  5: { ko: '제2소구치', type: 'premolar' },
  6: { ko: '제1대구치', type: 'molar' },
  7: { ko: '제2대구치', type: 'molar' },
  8: { ko: '제3대구치(사랑니)', type: 'molar' },
}
const SVG_POS_DECID: Record<number, { ko: string; type: ToothType }> = {
  1: { ko: '유중절치', type: 'incisor' },
  2: { ko: '유측절치', type: 'incisor' },
  3: { ko: '유견치', type: 'canine' },
  4: { ko: '제1유구치', type: 'premolar' },
  5: { ko: '제2유구치', type: 'molar' },
}
const SVG_QPALMER: Record<number, string> = {
  1: 'UR', 2: 'UL', 3: 'LL', 4: 'LR', 5: 'UR', 6: 'UL', 7: 'LL', 8: 'LR',
}
const SVG_QCOLOR: Record<number, { fill: string; stroke: string; text: string }> = {
  1: { fill: '#dbeafe', stroke: '#93c5fd', text: '#1d4ed8' },
  2: { fill: '#dcfce7', stroke: '#86efac', text: '#15803d' },
  3: { fill: '#fef3c7', stroke: '#fcd34d', text: '#b45309' },
  4: { fill: '#fce7f3', stroke: '#f9a8d4', text: '#be185d' },
}
const SVG_UNI_DECID: Record<number, string> = { 5: 'EDCBA', 6: 'FGHIJ', 7: 'ONMLK', 8: 'PQRST' }

function qColor(q: number) { return SVG_QCOLOR[q > 4 ? q - 4 : q] }

function toUniversal(q: number, p: number): string {
  if (q === 1) return String(9 - p)
  if (q === 2) return String(8 + p)
  if (q === 3) return String(25 - p)
  if (q === 4) return String(24 + p)
  return SVG_UNI_DECID[q].charAt(p - 1)
}
function toPalmer(q: number, p: number): string {
  return SVG_QPALMER[q] + (q <= 4 ? String(p) : 'ABCDE'.charAt(p - 1))
}
function labelFor(q: number, p: number, notation: string): string {
  if (notation === 'universal') return toUniversal(q, p)
  if (notation === 'palmer') return toPalmer(q, p)
  return String(q) + String(p)
}

function scaleP(d: string, s: number): string {
  return d.replace(/-?\d+(\.\d+)?/g, (n) => (parseFloat(n) * s).toFixed(2))
}
function toothPath(type: ToothType, s: number): string {
  if (type === 'incisor')
    return scaleP('M -8,-13 Q -10,-16 -6,-16 L 6,-16 Q 10,-16 8,-13 L 9,10 Q 9,15 0,15 Q -9,15 -9,10 Z', s)
  if (type === 'canine')
    return scaleP('M 0,-17 Q 8,-15 10,-6 Q 12,6 6,12 Q 0,16 -6,12 Q -12,6 -10,-6 Q -8,-15 0,-17 Z', s)
  if (type === 'premolar')
    return scaleP('M -10,-11 Q -12,-14 -7,-14 L 7,-14 Q 12,-14 10,-11 L 11,8 Q 11,14 0,14 Q -11,14 -11,8 Z', s)
  return scaleP('M -13,-12 Q -15,-15 -9,-15 L 9,-15 Q 15,-15 13,-12 L 14,9 Q 14,15 5,15 L -5,15 Q -14,15 -14,9 Z', s)
}
function grooves(type: ToothType, s: number, col: string): string {
  if (type === 'molar')
    return '<path d="' + scaleP('M -7,-4 Q 0,0 7,-4 M -7,6 Q 0,2 7,6', s) + '" fill="none" stroke="' + col + '" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>'
  if (type === 'premolar')
    return '<path d="' + scaleP('M -6,1 Q 0,-3 6,1', s) + '" fill="none" stroke="' + col + '" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>'
  if (type === 'incisor')
    return '<path d="' + scaleP('M -5,9 L 5,9', s) + '" fill="none" stroke="' + col + '" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>'
  return '<circle r="' + (2.2 * s).toFixed(1) + '" cy="' + (-2 * s).toFixed(1) + '" fill="' + col + '" opacity="0.6"/>'
}

type Placed = { q: number; p: number; x: number; y: number; nx: number; ny: number; rot: number }
function buildTeeth(mode: string): Placed[] {
  // 화면 = 환자를 마주 본 시점 (화면 왼쪽 = 환자의 오른쪽)
  const perm = mode === 'permanent'
  const count = perm ? 16 : 10
  const half = count / 2
  const CX = 380, RX = perm ? 320 : 244, RY = perm ? 226 : 172
  const CYU = 282, CYL = 366
  const qU_R = perm ? 1 : 5, qU_L = perm ? 2 : 6
  const qL_R = perm ? 4 : 8, qL_L = perm ? 3 : 7
  const teeth: Placed[] = []
  for (let i = 0; i < count; i++) {
    const th = Math.PI + (i + 0.5) * Math.PI / count
    const cs = Math.cos(th), sn = Math.sin(th)
    const x = CX + RX * cs
    const yU = CYU + RY * sn
    const yL = CYL - RY * sn
    let p: number, qU: number, qL: number
    if (i < half) { qU = qU_R; qL = qL_R; p = half - i }
    else { qU = qU_L; qL = qL_L; p = i - half + 1 }
    teeth.push({ q: qU, p, x, y: yU, nx: cs, ny: sn, rot: Math.atan2(sn, cs) * 180 / Math.PI + 90 })
    teeth.push({ q: qL, p, x, y: yL, nx: cs, ny: -sn, rot: Math.atan2(-sn, cs) * 180 / Math.PI + 90 })
  }
  return teeth
}

/** 클라이언트 renderSVG(state) 와 동일한 출력. */
export function renderToothSVG(
  mode: 'permanent' | 'deciduous' = 'permanent',
  notation: 'fdi' | 'universal' | 'palmer' = 'fdi',
  selected: string | null = null,
): string {
  const perm = mode === 'permanent'
  const teeth = buildTeeth(mode)
  const sBase = perm ? 0.98 : 0.92
  const out: string[] = []
  out.push('<svg viewBox="0 0 760 648" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="치아 번호 차트 (' + (perm ? '영구치 32개' : '유치 20개') + ')" style="width:100%;height:auto;display:block;">')
  out.push('<defs><filter id="bdtcSh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.4" flood-color="#8a6a45" flood-opacity="0.22"/></filter></defs>')
  out.push('<line x1="380" y1="20" x2="380" y2="628" stroke="#d9cbb5" stroke-width="1.5" stroke-dasharray="6 6"/>')
  out.push('<text x="380" y="14" text-anchor="middle" font-size="11" fill="#a08c6f">정중선</text>')
  out.push('<text x="380" y="272" text-anchor="middle" font-size="13" font-weight="700" fill="#b09a7a">상악 (위턱)</text>')
  out.push('<text x="380" y="384" text-anchor="middle" font-size="13" font-weight="700" fill="#b09a7a">하악 (아래턱)</text>')
  out.push('<text x="16" y="318" font-size="11" fill="#a08c6f">환자의 오른쪽 →</text>')
  out.push('<text x="744" y="318" font-size="11" fill="#a08c6f" text-anchor="end">← 환자의 왼쪽</text>')

  for (const t of teeth) {
    const base = t.q >= 5 ? SVG_POS_DECID[t.p] : SVG_POS_PERM[t.p]
    const typeScale = ({ incisor: 0.95, canine: 0.95, premolar: 1.0, molar: 1.08 } as Record<string, number>)[base.type] || 1
    const s = sBase * typeScale
    const fdi = String(t.q) + String(t.p)
    const sel = selected === fdi
    const col = qColor(t.q)
    const lblDist = perm ? 36 : 34
    const lx = (t.nx * lblDist).toFixed(1), ly = (t.ny * lblDist + 4).toFixed(1)
    out.push('<g class="bdtc-tooth" data-fdi="' + fdi + '" transform="translate(' + t.x.toFixed(1) + ',' + t.y.toFixed(1) + ')" style="cursor:pointer;" tabindex="0" role="button" aria-label="FDI ' + fdi + '번 ' + base.ko + '">')
    out.push('<g transform="rotate(' + t.rot.toFixed(1) + ')" filter="url(#bdtcSh)">')
    out.push('<path d="' + toothPath(base.type, s) + '" fill="' + (sel ? '#ffdf9e' : col.fill) + '" stroke="' + (sel ? '#6B4226' : col.stroke) + '" stroke-width="' + (sel ? 3 : 1.5) + '" class="bdtc-shape"/>')
    out.push(grooves(base.type, s, sel ? '#b98a3e' : col.stroke))
    out.push('</g>')
    out.push('<text x="' + lx + '" y="' + ly + '" text-anchor="middle" font-size="' + (notation === 'palmer' ? 10.5 : 12.5) + '" font-weight="' + (sel ? '800' : '700') + '" fill="' + (sel ? '#6B4226' : col.text) + '" style="pointer-events:none;">' + labelFor(t.q, t.p, notation) + '</text>')
    out.push('</g>')
  }
  out.push('</svg>')
  return out.join('')
}

/**
 * 클라이언트 tooth-chart.js 가 <head>에 주입하는 CSS 와 동일.
 * SSR에서 미리 넣어두면 JS 로드 전에도 hover/focus가 살아있고,
 * id가 같아 클라이언트 쪽 중복 주입도 자동으로 건너뛴다.
 */
export const TOOTH_SVG_STYLE =
  '<style id="bdtc-style">.bdtc-tooth:hover .bdtc-shape{stroke:#6B4226;stroke-width:2.6;}' +
  '.bdtc-tooth:focus{outline:none;}.bdtc-tooth:focus .bdtc-shape{stroke:#6B4226;stroke-width:2.6;}' +
  '.bdtc-tooth .bdtc-shape{transition:stroke .12s, fill .12s;}</style>'
