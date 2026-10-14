const ORIGIN = 'https://bdbddc.com'

type PublishedCaseImages = {
  status?: string
  beforeImage?: unknown
  afterImage?: unknown
  panBeforeImage?: unknown
  panAfterImage?: unknown
}

// Use an existing, public body image in the same order as the case detail page.
// No new treatment-result image, external host, or private API path is promoted.
export function getCaseSocialImage(cs: PublishedCaseImages): string {
  if (cs.status !== 'published') return ''
  for (const value of [cs.beforeImage, cs.afterImage, cs.panBeforeImage, cs.panAfterImage]) {
    if (typeof value !== 'string' || !value.trim()) continue
    try {
      const url = new URL(value, ORIGIN)
      if (url.origin !== ORIGIN || url.username || url.password) continue
      const pathname = decodeURIComponent(url.pathname)
      if (pathname.includes('..') || pathname.includes('\\') || /[<>"'\s\x00-\x1f\x7f]/.test(pathname)) continue
      if (!pathname.startsWith('/api/images/cases/') && !pathname.startsWith('/images/')) continue
      if (!/\.(?:jpe?g|png|webp|gif|avif)$/i.test(pathname)) continue
      url.hash = ''
      return url.href
    } catch {
      // Malformed image data must not break the case page.
    }
  }
  return ''
}

function attribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderCaseImageMeta(imageUrl: string): string {
  if (!imageUrl) return ''
  const image = attribute(imageUrl)
  return `<meta property="og:image" content="${image}">
<meta property="og:image:alt" content="공개 치료 사례 사진">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${image}">`
}
