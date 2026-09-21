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

export function removeLegacyBlogTestimonials(html: string): string {
  const unicodeHtml = (text: string) => text.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  for (const [original, replacement] of LEGACY_BLOCKS) {
    let from = original, to = replacement
    for (let level = 0; level < 3; level++) {
      html = html.split(from).join(to)
      html = html.split(unicodeHtml(from)).join(unicodeHtml(to))
      from = JSON.stringify(from).slice(1, -1)
      to = JSON.stringify(to).slice(1, -1)
    }
  }
  // Remove the two obsolete TOC entries in both SSR markup and React Flight data.
  const removedAnchors = ['교정-실사용-후기-핵심-요약-18', '소아-정기검진-방문-후기-핵심-요약-19']
  for (const id of removedAnchors) html = html.replace(new RegExp(`<a\\b[^>]*href="#${id}"[^>]*>[\\s\\S]*?<\\/a>`, 'g'), '')
  html = html.replace(/self\.__next_f\.push\((\[[\s\S]*?\])\)/g, (original, payload: string) => {
    try {
      const chunk = JSON.parse(payload)
      if (typeof chunk[1] !== 'string') return original
      chunk[1] = chunk[1].split('\n').map((line: string) => {
        const row = line.match(/^([0-9a-f]+):(\[.*)$/)
        if (!row) return line
        try {
          const element = JSON.parse(row[2])
          return element[1] === 'a' && removedAnchors.includes(element[3]?.href?.slice(1)) ? `${row[1]}:null` : line
        } catch { return line }
      }).join('\n')
      return `self.__next_f.push(${JSON.stringify(chunk).replace(/</g, '\\u003c')})`
    } catch { return original }
  })
  return html
}
