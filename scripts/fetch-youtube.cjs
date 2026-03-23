/**
 * 빌드 시 YouTube RSS를 JSON으로 캐싱
 * 실행: node scripts/fetch-youtube.js
 */
const fs = require('fs');
const https = require('https');

const CHANNELS = [
  { id: 'UCakJiVviUa_FJvFWgW_FDBw', key: 'bdtube', name: '쉽디 쉬운 치과이야기' },
  { id: 'UCKdzv9JtxhLJ-7EOcoIVQZQ', key: 'geoptongryung', name: '치과겁통령 | 서울비디치과' },
];

function fetchRss(channelId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    const description = (entry.match(/<media:description>([^<]*)<\/media:description>/) || [])[1] || '';
    const thumbnail = (entry.match(/media:thumbnail url="([^"]+)"/) || [])[1] || '';
    const views = (entry.match(/views="(\d+)"/) || [])[1] || '';
    
    if (videoId && title) {
      entries.push({ videoId, title, published, description, thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, views });
    }
  }
  return entries;
}

async function main() {
  const result = {};
  
  for (const ch of CHANNELS) {
    console.log(`Fetching ${ch.name} (${ch.id})...`);
    try {
      const xml = await fetchRss(ch.id);
      const entries = parseEntries(xml);
      result[ch.key] = { name: ch.name, channelId: ch.id, videos: entries, fetchedAt: new Date().toISOString() };
      console.log(`  → ${entries.length} videos found`);
    } catch (err) {
      console.error(`  → Error: ${err.message}`);
      result[ch.key] = { name: ch.name, channelId: ch.id, videos: [], fetchedAt: new Date().toISOString(), error: err.message };
    }
  }

  // public/data/ 디렉토리에 JSON 저장
  fs.mkdirSync('public/data', { recursive: true });
  fs.writeFileSync('public/data/youtube-cache.json', JSON.stringify(result, null, 2));
  console.log('\n✅ Saved to public/data/youtube-cache.json');
}

main();
