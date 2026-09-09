// Isolated regression tests: no production requests, real users or account writes.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { parse } = require('node-html-parser');
const { chromium } = require('playwright');
const executablePath = process.env.CHROMIUM_PATH || '/home/user/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell';
async function main() {
  const files = execFileSync('git', ['ls-files', 'doctors/*.html', 'en/doctors/*.html', 'jp/doctors/*.html'], { encoding: 'utf8' }).trim().split('\n').filter(f => fs.readFileSync(f, 'utf8').includes('profile-photo-placeholder'));
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let fallbackChecks = 0;
  const writes = [], errors = [];
  try {
    const page = await browser.newPage();
    let loggedIn = true;
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', async route => {
      const req = route.request(), u = new URL(req.url());
      if (req.method() !== 'GET') writes.push({ path: u.pathname, method: req.method() });
      if (u.pathname === '/api/auth/me') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ loggedIn, user: { name: '테스트 회원', email: 'test@example.com', marketingConsent: false } }) });
      if (u.pathname === '/api/auth/marketing' || u.pathname === '/api/auth/change-password') return route.fulfill({ contentType: 'application/json', body: '{"success":true}' });
      if (req.resourceType() === 'image') return route.fulfill({ contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64') });
      if (req.resourceType() === 'stylesheet' && u.origin === 'https://copy-test.invalid') {
        const file = u.pathname.slice(1);
        return route.fulfill({ contentType: 'text/css', body: fs.existsSync(file) ? fs.readFileSync(file) : '' });
      }
      return route.fulfill({ status: 200, body: '' });
    });
    const stripScripts = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    for (const file of files) {
      let html = stripScripts(fs.readFileSync(file, 'utf8')).replace(/<head[^>]*>/i, '$&<base href="https://copy-test.invalid/' + file + '">');
      await page.setContent(html, { waitUntil: 'load' });
      const count = await page.locator('.profile-photo-placeholder,.gallery-item-placeholder').evaluateAll(nodes => {
        for (const n of nodes) {
          if (getComputedStyle(n).display !== 'none') throw Error('Fallback visible before failure');
          n.previousElementSibling.dispatchEvent(new Event('error'));
          if (getComputedStyle(n).display !== 'flex' || n.previousElementSibling.style.display !== 'none') throw Error('Photo failure did not reveal accurate fallback');
          if (/예정|coming soon|scheduled|to be taken|撮影予定/i.test(n.textContent)) throw Error('Unfinished fallback text');
        }
        return nodes.length;
      });
      fallbackChecks += count;
    }
    const game = parse(fs.readFileSync('games.html', 'utf8'));
    assert.equal(game.querySelectorAll('.game-card.disabled').length, 0);
    assert(game.querySelectorAll('a.game-card[href]').length > 0);
    const member = fs.readFileSync('auth/mypage.html', 'utf8');
    const logic = parse(member).querySelectorAll('script').find(s => s.rawText.includes("fetch('/api/auth/me')"))?.rawText;
    assert(logic);
    for (loggedIn of [true, false]) {
      await page.setContent(stripScripts(member).replace(/<head[^>]*>/i, '$&<base href="https://copy-test.invalid/auth/mypage">'), { waitUntil: 'load' });
      await page.addScriptTag({ content: logic });
      await page.waitForFunction(() => document.getElementById('authLoader').style.display === 'none');
      assert.equal(await page.locator('#loggedInContent').isVisible(), loggedIn);
      if (!loggedIn) continue;
      assert.equal(await page.locator('#profileName').textContent(), '테스트 회원님');
      assert.equal(await page.locator('#profileEdit,.profile-stats').count(), 0);
      assert.equal(await page.locator('a:has-text("탈퇴 문의")').getAttribute('href'), 'tel:0414152892');
      assert.equal(await page.locator('a:has-text("예약 확인 문의")').getAttribute('href'), 'tel:0414152892');
      await page.locator('#pwChangeToggle').click();
      await page.locator('#newPassword').fill('test-password');
      await page.locator('#confirmNewPassword').fill('test-password');
      await page.locator('#pwChangeBtn').click();
      await page.waitForFunction(() => document.getElementById('pwChangeForm').style.display === 'none');
      await page.locator('#marketingAgree').check();
      await page.waitForFunction(() => document.getElementById('marketingStatus').textContent === '동의');
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(writes.map(w => w.path), ['/api/auth/change-password', '/api/auth/marketing']);
    console.log(JSON.stringify({ doctorPages: files.length, fallbackChecks, memberStates: 2, unavailableGameCards: 0, mockedWrites: writes, runtimeErrors: errors }, null, 2));
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
