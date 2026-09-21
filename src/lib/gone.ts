// ============================================
// GSC 404/5xx 정리 (2026-09-21)
//   - 410 Gone 응답 (noindex) : 구글이 '404 재시도' 대신 색인에서 바로 제거
//   - 구 한글 slug 백과사전 URL → 현재 대표어로 해석(301) 또는 410
//   - /cases, /treatments 의 존재하지 않는 slug → 유사 slug 301, 없으면 410
//   로그는 남기지 않는다.
// ============================================

// Hono Context 의 html() 만 사용 (상태 코드 타입 충돌을 피하기 위해 느슨하게 받는다)
type Ctx = { html: (...args: any[]) => any }

const GONE_HEADERS: Record<string, string> = {
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'public, max-age=3600',
}

export function goneResponse(c: Ctx, title = '삭제된 페이지입니다', backHref = '/', backLabel = '홈으로') {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${title} — 서울비디치과</title>
<style>body{font-family:'Pretendard',-apple-system,sans-serif;background:#faf7f3;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.box{text-align:center;max-width:480px}
h1{font-size:1.4rem;color:#3E2B1F;margin-bottom:12px}
p{color:#6b5d52;line-height:1.7;margin-bottom:24px}
a{display:inline-block;padding:12px 28px;background:#6B4226;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;margin:4px}</style>
</head>
<body>
<div class="box">
<h1>${title}</h1>
<p>이 주소의 페이지는 영구적으로 삭제되었습니다.</p>
<a href="${backHref}">${backLabel}</a>
</div>
</body>
</html>`, 410, GONE_HEADERS)
}

// ── 영문 slug 유사도: 하이픈 토큰 자카드 + 첫 토큰(카테고리) 보너스 + 접두 규칙 ──
export function similarSlug(target: string, candidates: string[]): string | null {
  const norm = (s: string) => s.toLowerCase().replace(/\.html?$/, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  const t = norm(target)
  if (!t) return null
  const tTok = t.split('-').filter(Boolean)
  let best: { slug: string; score: number } | null = null
  for (const raw of candidates) {
    const cnd = norm(raw)
    if (!cnd || cnd === t) continue
    let score = 0
    // 접두 규칙 (보수적):
    //   implant2 → implant (오타 꼬리 ≤2자), implant-sinus → implant-sinus-lift (후보가 더 구체적),
    //   a-b-c-d → a-b-c (후보가 2토큰 이상인 접두일 때만; 'glownate' 같은 1토큰 허브로 뭉개지 않는다)
    const cTokN = cnd.split('-').filter(Boolean).length
    if (cnd.length >= 4 && (
      (t.startsWith(cnd) && t.length - cnd.length <= 2) ||
      (cnd.startsWith(t + '-') && cnd.length - t.length <= 12) ||
      (t.startsWith(cnd + '-') && cTokN >= 2)
    )) {
      score = 0.9 - Math.abs(t.length - cnd.length) / 100
    } else {
      const cTok = cnd.split('-').filter(Boolean)
      const inter = tTok.filter(x => cTok.includes(x)).length
      if (inter < 2) continue
      const union = new Set([...tTok, ...cTok]).size
      // 첫 토큰(진료 카테고리) 일치 +0.15, 마지막 토큰(주제어, 예: white-spot) 일치 +0.05 → 동점 시 주제가 같은 쪽
      score = inter / union
        + (tTok[0] === cTok[0] ? 0.15 : 0)
        + (tTok[tTok.length - 1] === cTok[cTok.length - 1] ? 0.05 : 0)
      if (score < 0.5) continue
    }
    if (!best || score > best.score) best = { slug: raw, score }
  }
  return best ? best.slug : null
}

// ── 백과사전 구 한글 slug 해석 ──
export type EncLike = { term: string; synonyms?: string[] }

// 자주 보이는 오타·표기 변형 (구 URL 크롤 흔적)
const ENC_LEGACY_SYNONYMS: Array<[RegExp, string]> = [
  [/구강거조증/g, '구강건조증'],
  [/보툴리누스/g, '보툴리눔'],
  [/에나멜질?/g, '법랑질'],
  [/치아미백/g, '치아 미백'],
  [/임프란트/g, '임플란트'],
  [/라미네이드/g, '라미네이트'],
]

function normalizeKo(s: string): string {
  return s.replace(/\/+$/, '').replace(/[_+]/g, ' ').replace(/\s+/g, ' ').trim()
}

// 결과: 매칭된 대표어(term) 또는 null
export function resolveLegacyEncTerm(input: string, items: EncLike[]): string | null {
  const raw = normalizeKo(input)
  if (!raw) return null
  const lower = raw.toLowerCase()
  const byTerm = new Map<string, string>()
  const bySyn = new Map<string, string>()
  for (const it of items) {
    byTerm.set(it.term.toLowerCase(), it.term)
    for (const s of it.synonyms || []) bySyn.set(s.toLowerCase(), it.term)
  }
  const exact = (s: string): string | null => byTerm.get(s.toLowerCase()) || bySyn.get(s.toLowerCase()) || null

  // (a) 정확 일치 (대표어·동의어, 대소문자 무시)
  let hit = exact(lower)
  if (hit) return hit

  // (a') 오타·표기 변형 치환 후 정확 일치
  let fixed = raw
  for (const [re, to] of ENC_LEGACY_SYNONYMS) fixed = fixed.replace(re, to)
  if (fixed !== raw) { hit = exact(fixed); if (hit) return hit }

  // (b) 대시(구 slug 구분자) 앞 첫 어절 → 조사·괄호 제거 → 대표어 접두 일치
  const head = fixed.split(/[-–—]/)[0]
    .replace(/[()（）\[\]]/g, '')
    .replace(/(이란|란|이라는|라는|은|는|이|가|을|를|의|과|와|도|에)$/, '')
    .trim()
  if (head.length >= 2) {
    hit = exact(head)
    if (hit) return hit
    // head 가 대표어로 시작하는 경우(예: '법랑질에나멜' → '법랑질'): 가장 긴 대표어
    let best = ''
    const consider = (key: string, term: string) => {
      if (key.length >= 2 && head.toLowerCase().startsWith(key) && key.length > best.length) best = term
    }
    for (const [k, t] of byTerm) consider(k, t)
    if (!best) for (const [k, t] of bySyn) consider(k, t)
    if (best) return best
    // 마지막 글자만 다른 오타(예: '보툴리누스' → '보툴리눔'): 공통 접두 ≥3 이고 대표어 길이-1 이상
    let fuzzy: string | null = null
    for (const [k, t] of byTerm) {
      if (k.length < 3) continue
      let i = 0
      const h = head.toLowerCase()
      while (i < k.length && i < h.length && k[i] === h[i]) i++
      if (i >= 3 && i >= k.length - 1 && Math.abs(h.length - k.length) <= 1) {
        if (fuzzy && fuzzy !== t) { fuzzy = null; break } // 모호하면 포기
        fuzzy = t
      }
    }
    if (fuzzy) return fuzzy
    // 첫 단어(공백 기준)만으로 정확 일치
    const firstWord = head.split(' ')[0]
    if (firstWord.length >= 2 && firstWord !== head) {
      hit = exact(firstWord)
      if (hit) return hit
    }
  }
  return null
}

// /treatments/<slug>.html 정적 페이지 목록 (index 제외) — 존재하지 않는 slug 판별용
export const TREATMENT_SLUGS = new Set([
  'aesthetic', 'apicoectomy', 'bridge', 'bruxism', 'cavity', 'crown', 'denture', 'emergency',
  'fixture-osstem-ca', 'fixture-osstem-soi', 'fixture-straumann-roxolid', 'glownate', 'gum-surgery', 'gum',
  'implant-advanced', 'implant-flapless', 'implant-full-mouth', 'implant-holiday', 'implant-hybrid',
  'implant-immediate-loading', 'implant-immediate', 'implant-navigation', 'implant-overdenture',
  'implant-revision', 'implant-sedation', 'implant-sinus-lift', 'implant', 'inlay',
  'invisalign-best', 'invisalign-express', 'invisalign-first', 'invisalign-light', 'invisalign-moderate', 'invisalign',
  'oral-medicine', 'ortho-best', 'ortho-express', 'ortho-first', 'ortho-light', 'ortho-moderate',
  'orthodontic-clarity-ultra', 'orthodontic-clippy-c', 'orthodontics', 'pediatric', 'periodontitis', 'prevention',
  're-root-canal', 'resin', 'root-canal', 'scaling', 'sedation', 'tmj', 'whitening', 'wisdom-tooth',
])
