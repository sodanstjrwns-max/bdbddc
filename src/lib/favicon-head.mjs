// Shared by Worker HTML responses and the static post-build pass.
// Supplied, approved artwork is copied verbatim; clinic logo/schema are separate.
export const FAVICON_VERSION = 'fav20261014';
export const FAVICON_HEAD = `<!-- BD-FAVICON:START -->
<link rel="icon" href="/favicon.ico?v=${FAVICON_VERSION}" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="/images/icons/favicon-48.png?v=${FAVICON_VERSION}">
<link rel="icon" type="image/png" sizes="96x96" href="/images/icons/favicon-96.png?v=${FAVICON_VERSION}">
<link rel="icon" type="image/png" sizes="192x192" href="/images/icons/favicon-192.png?v=${FAVICON_VERSION}">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=${FAVICON_VERSION}">
<link rel="manifest" href="/manifest.json?v=${FAVICON_VERSION}">
<!-- BD-FAVICON:END -->`;

export function normalizeFaviconHead(html) {
  return html.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head\s*>)/i, (_all, open, head, close) => {
    const cleaned = head
      .replace(/\s*<!-- BD-FAVICON:START -->[\s\S]*?<!-- BD-FAVICON:END -->\s*/g, '')
      .replace(/<link\b[^>]*>/gi, tag => {
        const rel = /\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
        const tokens = (rel?.[1] ?? rel?.[2] ?? rel?.[3] ?? '').toLowerCase().split(/\s+/);
        return tokens.some(value => ['icon', 'apple-touch-icon', 'apple-touch-icon-precomposed', 'mask-icon', 'manifest'].includes(value)) ? '' : tag;
      })
      .trimEnd();
    return `${open}${cleaned}\n${FAVICON_HEAD}\n${close}`;
  });
}
