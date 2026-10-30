// Exact legacy testimonial blocks observed on the proxied blog, 2026-09-21.
// Keep upstream HTML and its serialized hydration copies consistent. No clinical claims are added.
const LEGACY_BLOCKS: Array<[string, string]> = [
  [
    "<p>비용과 치료 과정을 파악하셨다면, 실제 환자들의 후기와 첫 예약을 진행하는 방법을 통해 방문 준비를 마무리하실 수 있습니다.</p>",
    "<p>리뷰는 <a href=\"https://map.naver.com/p/entry/place/1541238930?c=15,0,0,0,dh,nil,nil,nil,review\" target=\"_blank\" rel=\"noopener noreferrer\">네이버</a>와 <a href=\"https://www.google.com/maps/search/불당본점서울비디치과의원\" target=\"_blank\" rel=\"noopener noreferrer\">구글</a>에서 직접 확인하실 수 있습니다. 아래에서 첫 방문 준비와 예약 방법을 확인해 주세요.</p>"
  ],
  [
    "<h2 id=\"실제-이용-후기와-예약하는-방법-17\">실제 이용 후기와 예약하는 방법</h2>",
    "<h2 id=\"실제-이용-후기와-예약하는-방법-17\">리뷰 확인과 예약 안내</h2>"
  ],
  [
    "<p>후기와 <strong>리뷰</strong>를 보면 공통적으로 치료 과정의 투명성과 응대 친절도를 높게 평가하는 경향이 있습니다. 부분교정 8개월 사례와 소아 정기검진 경험은 대기시간, 직원 안내, 아이 동반 환경 같은 실질적인 고민에 직접적인 답이 됩니다. 아래에서 핵심 내용을 정리하고 예약방법까지 안내합니다.</p>",
    ""
  ],
  [
    "<h3 id=\"교정-실사용-후기-핵심-요약-18\">교정 실사용 후기 핵심 요약</h3>",
    ""
  ],
  [
    "<p>발치 없이 8개월 진행해 윗니 돌출이 눈에 띄게 줄고 하열 정렬이 고르게 맞춰졌다는 평가가 많습니다. 기본 비용과 월 조정비를 사전에 상세히 설명해 비용 구조가 명확했고, 매 방문마다 의료진이 변화 과정을 공유해 신뢰감이 높았다는 반응입니다. 초기 1~2일 압박감 수준으로 통증이 관리 가능했다는 경험담이 주를 이루며, 환자만족도 측면에서 긍정적인 평가가 이어집니다.</p>",
    ""
  ],
  [
    "<h3 id=\"소아-정기검진-방문-후기-핵심-요약-19\">소아 정기검진 방문 후기 핵심 요약</h3>",
    ""
  ],
  [
    "<p>초등학교 5학년 자녀와 방문한 사례에서는 프런트 안내가 차분하고 절차 설명이 명확했다는 언급이 있습니다. 대기실 레고 전시물이 아이의 긴장을 완화하는 데 도움이 됐고, 내부 위생 관리가 깔끔해 보호자 신뢰도가 높았다는 평이 있습니다. 환자 수가 적은 시간대에는 대기시간이 짧았다는 점도 장점으로 꼽혔습니다.</p>",
    ""
  ],
  [
    "<p>증례 A는 경미한 왜소치에 직접 수복을 적용해 하루 만에 형태를 개선한 케이스로, 사례 리뷰에서 자연스러운 조화를 확인할 수 있었습니다.</p>",
    ""
  ],
  [
    "<p>증례 B는 교정 후 돌출된 옆앞니를 세라믹 비니어로 정렬해 만족도를 높인 경우입니다. 환자 후기에서도 색 안정성 평가가 높게 나타났습니다.</p>",
    ""
  ],
  [
    "<p>2~4톤 개선은 쉐이드 가이드 기준으로 한 단계 이상 밝아지는 수준을 의미합니다. <strong>1회 시술 후 효과 지속성</strong>은 평균 6~12개월로 알려져 있으며, 커피·와인·흡연 습관이 있으면 유지 기간이 단축될 수 있습니다. 원데이 시술 후기에서는 촬영·면접 전 만족도가 높게 보고되며, 즉각적인 톤 업에 대한 긍정 평가가 우세합니다.</p>",
    "<p>2~4톤 개선은 쉐이드 가이드 기준으로 한 단계 이상 밝아지는 수준을 의미합니다. <strong>1회 시술 후 효과 지속성</strong>은 평균 6~12개월로 알려져 있으며, 커피·와인·흡연 습관이 있으면 유지 기간이 단축될 수 있습니다. </p>"
  ]
]

// These two approved copy changes previously ran outside the Flight framing guard.
const FEAR_COPY_FIXES: Array<[string, string]> = [
  ['놓치면 교정 선택 후회할지도 몰라요!', '내 치아가 인비절라인 적응증에 맞는지, 미리 확인해보세요.'],
  ['지금 확인 안 하면 진짜 놓칠지도 몰라요.', '협진 기준을 알면 진료과 선택이 훨씬 쉬워집니다.'],
]
const COPY_REPLACEMENTS = [...LEGACY_BLOCKS, ...FEAR_COPY_FIXES]
const REMOVED_ANCHORS = ['교정-실사용-후기-핵심-요약-18', '소아-정기검진-방문-후기-핵심-요약-19']

function replaceCopy(text: string): string {
  for (const [original, replacement] of COPY_REPLACEMENTS) text = text.split(original).join(replacement)
  for (const id of REMOVED_ANCHORS) text = text.replace(new RegExp(`<a\\b[^>]*href="#${id}"[^>]*>[\\s\\S]*?<\\/a>`, 'g'), '')
  return text
}

function rewriteJsonValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Inblog can serialize JSON (including JSON-LD) inside a Flight string.
    // Decode each JSON layer before replacing text so inserted quotes stay escaped.
    if (/^\s*[\[{"]/.test(value)) {
      try { return rewriteJsonText(value) } catch { /* Ordinary article text or HTML. */ }
    }
    return rewriteMarkupCopy(value)
  }
  if (Array.isArray(value)) {
    if (value[0] === '$' && value[1] === 'a' && REMOVED_ANCHORS.includes(value[3]?.href?.slice(1))) return null
    return value.map(rewriteJsonValue)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteJsonValue(item)]))
  }
  return value
}

function rewriteJsonText(text: string): string {
  const original = JSON.parse(text)
  const rewritten = rewriteJsonValue(original)
  if (JSON.stringify(original) === JSON.stringify(rewritten)) return text
  return JSON.stringify(rewritten).replace(/</g, '\\u003c')
}

// Script bodies are not HTML. Parse JSON scripts separately and leave executable
// scripts intact; Flight calls are protected and reconstructed by the caller.
function rewriteMarkupCopy(html: string): string {
  const scripts = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi
  let result = '', offset = 0, match: RegExpExecArray | null
  while ((match = scripts.exec(html)) !== null) {
    result += replaceCopy(html.slice(offset, match.index))
    const script = match[0]
    const parts = script.match(/^(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)$/i)!
    if (/\btype\s*=\s*["']application\/(?:ld\+)?json["']/i.test(parts[1])) {
      try { result += parts[1] + rewriteJsonText(parts[2]) + parts[3] }
      catch { result += script } // Do not make an already invalid upstream payload worse.
    } else result += script
    offset = match.index + script.length
  }
  return result + replaceCopy(html.slice(offset))
}

// React Flight T records declare UTF-8 byte lengths. Replacing HTML inside them
// without updating the length corrupts hydration, even when SSR looks correct.
export function rewriteReviewFlight(stream: string): string {
  const encoder = new TextEncoder(), decoder = new TextDecoder('utf-8', { fatal: true })
  const bytes = encoder.encode(stream)
  const result: string[] = []
  let offset = 0
  while (offset < bytes.length) {
    // Headers are ASCII. Do not decode a fixed-size slice that may end mid-character.
    const header = String.fromCharCode(...bytes.subarray(offset, offset + 80)).match(/^([0-9a-f]+):T([0-9a-f]+),/)
    if (header) {
      const start = offset + header[0].length
      const end = start + parseInt(header[2], 16)
      if (end > bytes.length) throw new Error('Incomplete blog Flight text record')
      const original = decoder.decode(bytes.subarray(start, end))
      const text = rewriteMarkupCopy(original)
      result.push(text === original ? header[0] + original : `${header[1]}:T${encoder.encode(text).length.toString(16)},${text}`)
      offset = end
    } else {
      const newline = bytes.indexOf(10, offset)
      const end = newline < 0 ? bytes.length : newline
      let line = decoder.decode(bytes.subarray(offset, end))
      const row = line.match(/^([0-9a-f]+):([A-Z]*)([\s\S]*)$/)
      if (row) {
        try { line = `${row[1]}:${row[2]}${rewriteJsonText(row[3])}` }
        catch { /* Other Flight row kinds are preserved. */ }
      }
      result.push(line + (newline < 0 ? '' : '\n'))
      offset = end + (newline < 0 ? 0 : 1)
    }
  }
  return result.join('')
}

export function rewriteInblogCopy(html: string): string {
  // Avoid parsing unrelated upstream streams; they remain byte-for-byte unchanged.
  const hasCopy = COPY_REPLACEMENTS.some(([original]) => {
    const unicodeHtml = (text: string) => text.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    let variants = [original, original.replace(/</g, '\\u003c'), unicodeHtml(original)]
    for (let level = 0; level < 3; level++) {
      if (variants.some(encoded => html.includes(encoded))) return true
      variants = variants.flatMap(encoded => {
        const escaped = JSON.stringify(encoded).slice(1, -1)
        return [escaped, escaped.replace(/</g, '\\u003c'), unicodeHtml(escaped)]
      })
    }
    return false
  })
  if (!hasCopy && !REMOVED_ANCHORS.some(id => html.includes(id))) return html
  const chunks: Array<{ original: string; payload: [number, string] }> = []
  // Match the complete JSON string, including escaped quotes and literal "])",
  // rather than stopping at the first closing bracket inside article text.
  html = html.replace(/self\.__next_f\.push\((\[\s*1\s*,\s*"(?:\\.|[^"\\])*"\s*\])\)/g, (original, payload: string) => {
    try {
      const value: [number, string] = JSON.parse(payload)
      const id = chunks.push({ original, payload: value }) - 1
      return `/*bd-review-flight-${id}*/`
    } catch { return original }
  })
  html = rewriteMarkupCopy(html)
  if (chunks.length) {
    const originalStream = chunks.map(c => c.payload[1]).join('')
    const stream = rewriteReviewFlight(originalStream)
    chunks.forEach((chunk, i) => {
      const call = stream === originalStream ? chunk.original
        : `self.__next_f.push(${JSON.stringify([chunk.payload[0], i === 0 ? stream : '']).replace(/</g, '\\u003c')})`
      html = html.replace(`/*bd-review-flight-${i}*/`, () => call)
    })
  }
  return html
}

// Preserve the existing helper entry point for callers that only need review cleanup.
export const removeLegacyBlogTestimonials = rewriteInblogCopy
