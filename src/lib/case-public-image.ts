const CASE_ORIGIN = 'https://bdbddc.com'
const CASE_IMAGE_FIELDS = ['beforeImage', 'afterImage', 'panBeforeImage', 'panAfterImage'] as const
const IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])

type CaseImageRecord = { status?: string } & Partial<Record<typeof CASE_IMAGE_FIELDS[number], unknown>>

// Uploads use a single generated filename. Never turn a path, private object,
// encoded separator, or untrusted origin into an R2 key through this public alias.
export function caseImageKey(filename: string): string | null {
  if (filename.length > 255 || filename.includes('..') || !/^[a-z0-9][a-z0-9._-]*\.(?:jpe?g|png|webp|gif|avif)$/i.test(filename)) return null
  return `cases/${filename}`
}

export function publicCaseImageUrl(value: unknown): string {
  if (typeof value !== 'string' || !value || value.includes('..') || /[\\\s\x00-\x1f\x7f]|%(?:2e|2f|5c)/i.test(value)) return ''
  try {
    const url = new URL(value, CASE_ORIGIN)
    if (url.origin !== CASE_ORIGIN || url.username || url.password) return ''
    const match = url.pathname.match(/^\/(?:api\/images\/cases|case-images)\/([^/]+)$/)
    if (!match || !caseImageKey(match[1])) return ''
    return `${CASE_ORIGIN}/case-images/${match[1]}`
  } catch { return '' }
}

export function isPublishedCaseImage(cases: CaseImageRecord[], filename: string): boolean {
  if (!caseImageKey(filename)) return false
  const expected = `${CASE_ORIGIN}/case-images/${filename}`
  return cases.some(cs => cs.status === 'published' && CASE_IMAGE_FIELDS.some(field => publicCaseImageUrl(cs[field]) === expected))
}

// Render-time alias only: the original API, case records, and R2 objects stay intact.
export async function servePublicCaseImage(
  filename: string,
  r2: R2Bucket | undefined,
  readCases: () => Promise<CaseImageRecord[]>,
  method = 'GET'
): Promise<Response> {
  const missing = () => new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  const key = caseImageKey(filename)
  if (!key) return missing()
  if (!r2) return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  try {
    if (!isPublishedCaseImage(await readCases(), filename)) return missing()
    const object = await r2.get(key)
    if (!object) return missing()
    const contentType = object.httpMetadata?.contentType || ''
    if (!IMAGE_CONTENT_TYPES.has(contentType.toLowerCase())) {
      await object.body.cancel()
      return missing()
    }
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'ETag': object.httpEtag || object.etag
    })
    if (method === 'HEAD') {
      await object.body.cancel()
      return new Response(null, { headers })
    }
    return new Response(object.body, { headers })
  } catch {
    return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
