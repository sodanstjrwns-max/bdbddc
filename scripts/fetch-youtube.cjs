/**
 * 빌드 시 YouTube RSS를 JSON으로 캐싱
 * - 새로 가져온 결과가 비어있으면 기존 캐시 유지
 * - 최대 3회 재시도
 * 실행: node scripts/fetch-youtube.cjs
 */
const fs = require('fs');
const https = require('https');

const CACHE_PATH = 'public/data/youtube-cache.json';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

const CHANNELS = [
  { id: 'UCakJiVviUa_FJvFWgW_FDBw', key: 'bdtube', name: '쉽디 쉬운 치과이야기' },
  { id: 'UCKdzv9JtxhLJ-7EOcoIVQZQ', key: 'geoptongryung', name: '치과겁통령 | 서울비디치과' },
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchRss(channelId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const videoId = (entry.match(/<yt:videoId>([^<]+)/) || [])[1] || '';
    const title = (entry.match(/<title>([^<]+)/) || [])[1] || '';
    const published = (entry.match(/<published>([^<]+)/) || [])[1] || '';
    const description = (entry.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1] || '';
    const thumbnail = (entry.match(/media:thumbnail url="([^"]+)"/) || [])[1] || '';
    const views = (entry.match(/views="(\d+)"/) || [])[1] || '';
    
    if (videoId && title) {
      entries.push({ videoId, title, published, description: description.trim(), thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, views });
    }
  }
  return entries;
}

async function fetchWithRetry(channelId, name) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`  ↻ 재시도 ${attempt}/${MAX_RETRIES}...`);
        await sleep(RETRY_DELAY * attempt);
      }
      const xml = await fetchRss(channelId);
      const entries = parseEntries(xml);
      if (entries.length > 0) {
        return entries;
      }
      // XML은 받았지만 entry가 없는 경우 — 재시도
    } catch (err) {
      console.warn(`  ⚠ 시도 ${attempt} 실패: ${err.message}`);
    }
  }
  return []; // 모든 시도 실패
}

function loadExistingCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

async function main() {
  const existingCache = loadExistingCache();
  const result = {};
  
  for (const ch of CHANNELS) {
    console.log(`Fetching ${ch.name} (${ch.id})...`);
    const entries = await fetchWithRetry(ch.id, ch.name);
    
    if (entries.length > 0) {
      result[ch.key] = { name: ch.name, channelId: ch.id, videos: entries, fetchedAt: new Date().toISOString() };
      console.log(`  ✅ ${entries.length} videos (fresh)`);
    } else if (existingCache[ch.key] && existingCache[ch.key].videos && existingCache[ch.key].videos.length > 0) {
      // 새 데이터 없으면 기존 캐시 유지!
      result[ch.key] = existingCache[ch.key];
      console.log(`  ⚡ ${existingCache[ch.key].videos.length} videos (cached from ${existingCache[ch.key].fetchedAt})`);
    } else {
      result[ch.key] = { name: ch.name, channelId: ch.id, videos: [], fetchedAt: new Date().toISOString() };
      console.log(`  ❌ No videos available`);
    }
  }

  // public/data/ 디렉토리에 JSON 저장
  fs.mkdirSync('public/data', { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(result, null, 2));
  console.log('\n✅ Saved to ' + CACHE_PATH);
}

main();
