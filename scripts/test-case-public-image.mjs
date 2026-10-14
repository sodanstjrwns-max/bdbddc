import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Hono } from 'hono';

const entry = new URL('../src/lib/case-public-image.ts', import.meta.url).pathname;
const output = await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', write: false });
const { caseImageKey, publicCaseImageUrl, isPublishedCaseImage, servePublicCaseImage } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
const filename = '1791343276268-t9dj8o.jpg';
const source = '/api/images/cases/' + filename;
const expected = 'https://bdbddc.com/case-images/' + filename;
assert.equal(caseImageKey(filename), 'cases/' + filename);
assert.equal(publicCaseImageUrl(source), expected);
assert.equal(publicCaseImageUrl('https://bdbddc.com' + source + '?v=2#view'), expected);
assert.equal(publicCaseImageUrl(expected), expected);
for (const bad of ['../data.json', '%2e%2e.jpg', 'a%2fb.jpg', 'a/b.jpg', 'a\\b.jpg', 'x.svg', 'data.json', 'x.jpg?extra', 'x.jpg#extra', 'x..jpg', 'x".jpg']) {
  assert.equal(caseImageKey(bad), null, bad);
}
for (const bad of ['https://evil.test' + source, 'http://bdbddc.com' + source, 'https://user@bdbddc.com' + source, '/api/images/private/a.jpg', '/api/images/cases/../cases/a.jpg', '/api/images/cases/%2e%2e/cases/a.jpg', '/api/images/cases/a%2fb.jpg', '/images/cases/a.jpg', ' ' + source]) {
  assert.equal(publicCaseImageUrl(bad), '', bad);
}
for (const field of ['beforeImage', 'afterImage', 'panBeforeImage', 'panAfterImage']) {
  assert.equal(isPublishedCaseImage([{ status: 'published', [field]: source }], filename), true, field);
}
assert.equal(isPublishedCaseImage([{ status: 'draft', beforeImage: source }], filename), false);
assert.equal(isPublishedCaseImage([{ beforeImage: source }], filename), false);
assert.equal(isPublishedCaseImage([{ status: 'published', description: source }], filename), false);

const bytes = Uint8Array.of(0xff, 0xd8, 0xff, 0xe0, 1, 2, 3);
const reads = [];
let records = [{ status: 'published', beforeImage: source }];
let contentType = 'image/jpeg';
let exists = true;
let readsCases = 0;
const bucket = { async get(key) {
  reads.push(key);
  if (!exists) return null;
  return { body: new Response(bytes).body, etag: 'fake-etag', httpEtag: '"fake-etag"', httpMetadata: { contentType } };
} };
const readCases = async () => { readsCases++; return records; };
const app = new Hono();
app.on(['GET', 'HEAD'], '/case-images/:filename', c => servePublicCaseImage(c.req.param('filename'), bucket, readCases, c.req.method));
let response = await app.request('/case-images/' + filename);
assert.equal(response.status, 200);
assert.equal(response.headers.get('content-type'), 'image/jpeg');
assert.equal(response.headers.get('etag'), '"fake-etag"');
assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
assert.deepEqual(reads, ['cases/' + filename]);
response = await app.request('/case-images/' + filename, { method: 'HEAD' });
assert.equal(response.status, 200);
assert.equal(await response.text(), '');
assert.equal(response.headers.get('content-type'), 'image/jpeg');
records = [{ status: 'draft', beforeImage: source }];
const beforeDraftReads = reads.length;
response = await app.request('/case-images/' + filename);
assert.equal(response.status, 404);
assert.equal(reads.length, beforeDraftReads, 'A draft must not read the object');
assert.equal(response.headers.get('cache-control'), 'no-store');
records = [];
assert.equal((await app.request('/case-images/' + filename)).status, 404);
records = [{ status: 'published', beforeImage: source }];
const beforeUnsafeReads = reads.length;
const beforeUnsafeCases = readsCases;
for (const path of ['/case-images/data.json', '/case-images/a%2fb.jpg', '/case-images/a%5cb.jpg', '/case-images/%252e%252e.jpg', '/case-images/sub/a.jpg']) {
  assert.equal((await app.request(path)).status, 404, path);
}
assert.equal(reads.length, beforeUnsafeReads);
assert.equal(readsCases, beforeUnsafeCases);
exists = false;
assert.equal((await app.request('/case-images/' + filename)).status, 404);
exists = true;
contentType = 'text/html';
assert.equal((await app.request('/case-images/' + filename)).status, 404);
assert.equal((await servePublicCaseImage(filename, undefined, readCases)).status, 503);
assert.equal((await servePublicCaseImage(filename, bucket, async () => { throw new Error('private storage error'); })).status, 503);
console.log('case public alias: published field allowlist, exact bytes/MIME, HEAD, missing objects, private keys and unsafe paths passed');
