import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const path = new URL('../src/lib/case-social-image.ts', import.meta.url);
const result = await transform(await readFile(path, 'utf8'), { loader: 'ts', format: 'esm' });
const { getCaseSocialImage, renderCaseImageMeta } = await import('data:text/javascript;base64,' + Buffer.from(result.code).toString('base64'));
const published = { status: 'published' };
const image = '/api/images/cases/before.jpg';
const expected = 'https://bdbddc.com' + image;
assert.equal(getCaseSocialImage({ ...published, beforeImage: image, afterImage: '/api/images/cases/after.jpg' }), expected);
assert.equal(getCaseSocialImage({ ...published, afterImage: image, panBeforeImage: '/api/images/cases/pano.jpg' }), expected);
assert.equal(getCaseSocialImage({ ...published, panBeforeImage: image }), expected);
assert.equal(getCaseSocialImage({ ...published, panAfterImage: image }), expected);
assert.equal(getCaseSocialImage({ ...published, beforeImage: '/images/case-photo.webp?v=2' }), 'https://bdbddc.com/images/case-photo.webp?v=2');
assert.equal(getCaseSocialImage({ status: 'draft', beforeImage: image }), '');
assert.equal(getCaseSocialImage({ beforeImage: image }), '');
assert.equal(getCaseSocialImage(published), '');
for (const beforeImage of [
  'javascript:alert(1)', 'data:image/png;base64,YQ==', 'https://example.com/photo.jpg',
  '//example.com/photo.jpg', 'http://bdbddc.com' + image,
  '/api/images/private/a.jpg', '/api/images/cases-private/a.jpg', '/api/admin/images/cases/a.jpg',
  '/api/images/cases/../private/a.jpg', '/api/images/cases/%2e%2e/private/a.jpg',
  '/api/images/cases/%2e%2e%2fprivate/a.jpg', '/api/images/cases/data.json',
  '/api/images/cases/a%22.jpg', '/api/images/cases/a%00.jpg',
]) {
  const selected = getCaseSocialImage({ ...published, beforeImage });
  assert.equal(selected, '', beforeImage);
}
assert.equal(renderCaseImageMeta(''), '');
assert(renderCaseImageMeta(expected).includes(`property="og:image" content="${expected}"`));
assert(renderCaseImageMeta(expected + '?a=1&b=2').includes('?a=1&amp;b=2'));
assert(!renderCaseImageMeta(expected).includes('og:image:width'), 'Do not invent dimensions of existing R2 photos');
console.log('case social image: published-only body order, allowed public paths, unsafe URLs, and escaped metadata passed');
