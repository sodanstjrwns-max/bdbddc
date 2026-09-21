// Validate and repair YouTube structured data using verified public source metadata.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const metadata = new Map(require('../data/video-metadata.json').map(v => [v.id, v]));
const chapters = require('../public/data/youtube-chapters.json');
const scriptRE = /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi;
const videoId = v => (String(v.embedUrl || '') + ' ' + String(v.contentUrl || '')).match(/(?:embed\/|[?&]v=|youtu\.be\/)([\w-]{11})/)?.[1];
function visit(value, fn) {
  if (!value || typeof value !== 'object') return;
  if (value['@type'] === 'VideoObject') fn(value);
  for (const v of Object.values(value)) visit(v, fn);
}
function repair(html) {
  const blocks = [];
  for (const match of html.matchAll(scriptRE)) {
    let data;
    try { data = JSON.parse(match[2]); } catch { continue; }
    blocks.push({ match, data });
    visit(data, v => {
      const id = videoId(v), source = metadata.get(id);
      if (!source?.uploadDate || !source.lengthSeconds) throw Error('Missing verified video metadata: ' + id);
      v.uploadDate = source.uploadDate;
      v.duration = `PT${source.lengthSeconds}S`;
      // A YouTube watch page is not a direct video file. embedUrl identifies its player.
      if (/^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//.test(v.contentUrl || '')) delete v.contentUrl;
      if (v.author?.name === '문석준' && !v.author.url) v.author.url = 'https://bdbddc.com/doctors/moon';
      if (v.hasPart) {
        v.hasPart = v.hasPart.flatMap(clip => {
          if (clip['@type'] !== 'Clip') return [clip];
          const chapter = chapters[id]?.chapters?.find(c => c.start === clip.startOffset);
          const end = clip.endOffset ?? chapter?.end;
          if (!Number.isFinite(end) || end <= clip.startOffset || clip.startOffset >= source.lengthSeconds) return [];
          return [{ ...clip, endOffset: Math.min(end, source.lengthSeconds) }];
        });
        if (!v.hasPart.length) delete v.hasPart;
      }
    });
  }
  // Collapse repeated root/array declarations while preserving the localized metadata and verified clips.
  const seen = new Map();
  const DROP = Symbol("duplicate-video");
  function unique(data, removable = true) {
    if (Array.isArray(data)) return data.map(v => unique(v, true)).filter(v => v !== DROP);
    if (!data || typeof data !== 'object') return data;
    if (data['@type'] !== 'VideoObject') {
      for (const key of Object.keys(data)) data[key] = unique(data[key], false);
      return data;
    }
    const id = videoId(data), first = seen.get(id);
    if (!first) { seen.set(id, data); return data; }
    if (data.hasPart?.length) {
      const parts = [...(first.hasPart || []), ...data.hasPart];
      first.hasPart = parts.filter((c, i) => parts.findIndex(p => p.startOffset === c.startOffset && p.endOffset === c.endOffset) === i);
    }
    if (removable) return DROP;
    first['@id'] ||= 'https://www.youtube.com/watch?v=' + id;
    return { '@id': first['@id'] };
  }
  for (const block of blocks) block.data = unique(block.data);
  for (const block of blocks.reverse()) {
    const { match, data } = block;
    const changed = JSON.stringify(data) !== JSON.stringify(JSON.parse(match[2]));
    if (!changed) continue;
    const replacement = data === DROP || !data || (Array.isArray(data) && data.length === 0) ? '' : match[1] + JSON.stringify(data, null, match[2].includes('\n') ? 2 : undefined) + match[3];
    let start = match.index;
    if (!replacement) {
      const lineStart = html.lastIndexOf('\n', start - 1) + 1;
      if (/^[ \t]*$/.test(html.slice(lineStart, start))) start = lineStart;
    }
    html = html.slice(0, start) + replacement + html.slice(match.index + match[0].length);
  }
  return html;
}
function validate(html, label) {
  const errors = [], seen = new Set(); let count = 0;
  for (const match of html.matchAll(scriptRE)) {
    let data; try { data = JSON.parse(match[2]); } catch { errors.push(label + ': invalid JSON-LD'); continue; }
    visit(data, v => {
      count++; const id = videoId(v);
      if (!v.name || !v.thumbnailUrl || !v.embedUrl) errors.push(label + ': required video field missing');
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(v.uploadDate || '') || !Number.isFinite(Date.parse(v.uploadDate))) errors.push(label + ': invalid uploadDate');
      if (/^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//.test(v.contentUrl || '')) errors.push(label + ': contentUrl is a watch page');
      if (seen.has(id)) errors.push(label + ': duplicate video ' + id); seen.add(id);
      for (const clip of v.hasPart || []) if (clip['@type'] === 'Clip' && !(Number.isFinite(clip.startOffset) && Number.isFinite(clip.endOffset) && clip.endOffset > clip.startOffset)) errors.push(label + ': invalid clip bounds');
      if (v.author?.['@type'] === 'Person' && !v.author.url) errors.push(label + ': author URL missing');
    });
  }
  return { errors, count };
}
if (require.main === module) {
  const write = process.argv.includes('--write');
  const build = process.argv.includes('--dist');
  const files = build ? (function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []); })(path.join(ROOT, 'dist')) : cp.execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').map(f => path.join(ROOT, f));
  const errors = []; let changed = 0, count = 0;
  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    if (!original.includes('VideoObject')) continue;
    const html = write ? repair(original) : original;
    const result = validate(html, path.relative(ROOT, file)); errors.push(...result.errors); count += result.count;
    if (html !== original) { fs.writeFileSync(file, html); changed++; }
  }
  console.log(JSON.stringify({ files: files.length, videos: count, changed, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { repair, validate };
