// Compare the actual computed styles of promoted headings with the pre-change source.
// No analytics, scripts, forms, remote resources or production writes are executed.
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const baseline = process.argv[2] || '5728b0f2';
const browserPath = process.env.CHROMIUM_PATH || '/home/user/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell';
function read(file, before) {
  try { return before ? execFileSync('git', ['show', `${baseline}:${file}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 4000000 }) : fs.readFileSync(file, 'utf8'); } catch { return ''; }
}
async function main() {
  const files = execFileSync('git', ['ls-files', '*.html'], { encoding: 'utf8' }).trim().split('\n')
    .filter(f => fs.readFileSync(f, 'utf8').includes('heading-from-h4'));
  const browser = await chromium.launch({ executablePath: browserPath, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const diffs = [];
  let comparisons = 0;
  try {
    const page = await browser.newPage();
    let before = true;
    await page.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === 'https://seo-test.invalid' && request.resourceType() === 'stylesheet') {
        return route.fulfill({ status: 200, contentType: 'text/css', headers: { 'Cache-Control': 'no-store' }, body: read(url.pathname.slice(1), before) });
      }
      return route.fulfill({ status: 200, body: '' });
    });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const file of files) {
        const snapshots = [];
        for (before of [true, false]) {
          let html = read(file, before).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
          html = html.replace(/<head[^>]*>/i, '$&<base href="https://seo-test.invalid/' + file + '">');
          html = html.replace(/href=(["'])([^"']+\.css(?:\?[^"']*)?)\1/g, (_, quote, href) => `href=${quote}${href}${href.includes('?') ? '&' : '?'}seo-test=${before ? 'before' : 'after'}${quote}`);
          await page.goto('about:blank');
          await page.setContent(html, { waitUntil: 'load' });
          snapshots.push(await page.locator(before ? 'h4' : 'h3.heading-from-h4').evaluateAll(nodes => nodes.map(n => {
            const s = getComputedStyle(n), values = {};
            for (const k of ['fontSize','fontWeight','lineHeight','color','marginTop','marginBottom','paddingTop','paddingBottom','letterSpacing','textTransform','display']) values[k] = s[k];
            return { text: n.textContent.trim(), values };
          })));
        }
        for (const heading of snapshots[1]) {
          const index = snapshots[0].findIndex(h => h.text === heading.text);
          if (index < 0) throw Error('Original heading missing: ' + file + ' ' + heading.text);
          const old = snapshots[0].splice(index, 1)[0];
          for (const key of Object.keys(old.values)) if (old.values[key] !== heading.values[key]) diffs.push({ file, width, text: heading.text.slice(0, 45), key, before: old.values[key], after: heading.values[key] });
          comparisons++;
        }
      }
    }
  } finally { await browser.close(); }
  fs.writeFileSync('.wrangler/seo-heading-visual.json', JSON.stringify({ files: files.length, comparisons, diffs }, null, 2));
  console.log(JSON.stringify({ files: files.length, comparisons, differences: diffs.length, sample: diffs.slice(0, 12) }, null, 2));
  if (diffs.length) process.exitCode = 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
