// Exact replacements verified against GSC examples and live targets on 2026-09-21.
// Unknown URLs intentionally remain 404; never redirect an arbitrary missing page.
export const gscLegacyRedirects: Record<string, string> = {
  "/encyclopedia/법랑질에나멜이란-몸에서-가장-단단하지만-재생-안-되는-조직": "/encyclopedia/법랑질",
  "/encyclopedia/보툴리누스": "/encyclopedia/보툴리눔",
  "/encyclopedia/노인 구강거조증": "/encyclopedia/노인 구강건조증",
  "/encyclopedia/치주소파술": "/encyclopedia/치주 소파술",
  "/encyclopedia/교정 와이어": "/encyclopedia/교정용 와이어",
  "/encyclopedia/2급-부정교합": "/encyclopedia/2급 부정교합",
  "/encyclopedia/3급-부정교합": "/encyclopedia/3급 부정교합",
  "/encyclopedia/디지털-스마일-디자인": "/encyclopedia/디지털 스마일 디자인(DSD)",
  "/encyclopedia/디지털-인상": "/encyclopedia/디지털 인상",
  "/encyclopedia/가이드-수술": "/encyclopedia/가이드 수술",
  "/encyclopedia/수면-진정": "/encyclopedia/수면 진정",
  "/encyclopedia/핏-앤-피셔-실란트": "/encyclopedia/핏 앤 피셔 실란트",
  "/encyclopedia/임플란트 오버덴쳘": "/encyclopedia/오버덴처",
  "/encyclopedia/무절개-임플란트": "/encyclopedia/무절개 임플란트",
  "/encyclopedia/치근활택술": "/encyclopedia/치근 활택술",
  "/encyclopedia/치근단농양": "/encyclopedia/치근단 농양",
  "/encyclopedia/거타퍼차": "/encyclopedia/구타페르카",
  "/encyclopedia/드라이소켓": "/encyclopedia/드라이 소켓",
  "/encyclopedia/잇몸뼈 흡수": "/encyclopedia/치조골 흡수",
  "/encyclopedia/악교정수술": "/encyclopedia/악교정 수술",
  "/encyclopedia/오버덴쳐": "/encyclopedia/오버덴처",
  "/encyclopedia/구강외과": "/encyclopedia/구강 외과",
  "/encyclopedia/구강 건조증": "/encyclopedia/구강건조증",
  "/encyclopedia/삼차 신경통": "/encyclopedia/삼차신경통",
  "/treatments/fracture": "/encyclopedia/치아 파절",
  "/treatments/digital-implant": "/treatments/implant-navigation",
  "/treatments/gummy-smile": "/encyclopedia/거미스마일",
  "/treatments/fluoride": "/encyclopedia/불소 도포",
  "/treatments/orthognathic": "/encyclopedia/악교정 수술",
  "/treatments/trauma": "/encyclopedia/치아 외상",
  "/treatments/gum-graft": "/encyclopedia/치은 이식술",
  "/treatments/onlay": "/encyclopedia/온레이",
  "/treatments/periodontal": "/treatments/periodontitis",
  "/treatments/gum-recession": "/encyclopedia/치은 퇴축",
  "/treatments/extraction": "/encyclopedia/발치",
  "/treatments/composite": "/treatments/resin",
  "/booking": "/reservation",
  "/widgets/": "/widgets",
  "/column/jeongjungseon-dental-midline": "/column/dental-midline-deviation",
  "/column/if-you-dont-remove-wisdom-teeth": "/column/what-if-you-dont-remove-wisdom-teeth",
  "/column/denture-cost-korea-price-guide": "/column/dentures-price-insurance-cost-guide-korea",
  "/blog/sitemap.xml": "/sitemap-blog.xml"
}

export function gscLegacyTarget(path: string): string | undefined {
  let decoded: string
  try { decoded = decodeURIComponent(path) } catch { return undefined }
  return gscLegacyRedirects[decoded] || gscLegacyRedirects[decoded.replace(/\/$/, "")]
}
