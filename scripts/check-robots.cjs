const fs = require('node:fs');
const assert = require('node:assert/strict');

// Match the agents and path rules used in this robots.txt. Longer matching paths
// take precedence; Allow wins equal-length ties. '*' is a wildcard, '$' an end anchor.
function parseGroups(text) {
  const groups = [];
  let group;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split('#')[0].trim();
    const match = /^([^:]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1].toLowerCase(), value = match[2].trim();
    if (key === 'user-agent') {
      group = { agent: value.toLowerCase(), rules: [] };
      groups.push(group);
    } else if (group && /^(allow|disallow)$/.test(key) && value) {
      group.rules.push({ allow: key === 'allow', path: value });
    }
  }
  return groups;
}

function allowed(text, agent, path) {
  const groups = parseGroups(text);
  const specific = groups.filter(g => g.agent === agent.toLowerCase());
  const selected = specific.length ? specific : groups.filter(g => g.agent === '*');
  const matched = selected.flatMap(g => g.rules).filter(rule => {
    const end = rule.path.endsWith('$');
    const body = end ? rule.path.slice(0, -1) : rule.path;
    const expression = body.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    return new RegExp('^' + expression + (end ? '$' : '')).test(path);
  }).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
  return matched[0]?.allow ?? true;
}

function check(text) {
  // A restrictive general query rule must not override a more specific public route.
  const fixture = 'User-agent: *\nDisallow: /*?doctor=*\nAllow: /column/?doctor=\nDisallow: /admin/\n';
  assert(allowed(fixture, 'Googlebot', '/column/?doctor=moon'));
  assert(!allowed(fixture, 'Googlebot', '/other/?doctor=moon'));
  assert(!allowed(fixture, 'Googlebot', '/admin/?doctor=moon'));
  assert(allowed('User-agent: *\nDisallow: /same\nAllow: /same\n', 'Googlebot', '/same'));
  const groups = parseGroups(text);
  const crawlAgents = groups.filter(g => g.rules.some(r => !r.allow && r.path === '/*?doctor=*')).map(g => g.agent);
  assert(crawlAgents.includes('googlebot'), 'Googlebot group must be checked');
  for (const agent of crawlAgents) {
    for (const path of ['/column/', '/column/?doctor=moon', '/column/?doctor=kim', '/column/?doctor=park-sb', '/column/?doctor=moon&utm_source=nav', '/concerns/implant-clinic-closed', '/treatments/implant', '/doctors/moon']) {
      assert(allowed(text, agent, path), `${agent} unexpectedly blocks ${path}`);
    }
    for (const path of ['/admin/reservations', '/auth/login', '/api/reservation', '/reservation?ref_category=implant', '/en/reservation?ref_category=implant', '/blog/category/broken', '/other/?doctor=moon', '/admin/?doctor=moon']) {
      assert(!allowed(text, agent, path), `${agent} unexpectedly permits ${path}`);
    }
  }
  for (const agent of ['DotBot', 'MJ12bot', 'BLEXBot', 'DataForSeoBot']) assert(!allowed(text, agent, '/column/?doctor=moon'), `${agent} blanket block changed`);
  console.log(`robots check: ${crawlAgents.length} crawler groups; public doctor-column archives allowed; private, tracking and blanket blocks preserved`);
}

module.exports = { allowed, check };
if (require.main === module) check(fs.readFileSync(process.argv[2] || 'robots.txt', 'utf8'));
