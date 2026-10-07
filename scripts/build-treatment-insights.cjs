#!/usr/bin/env node
/** Canonical content refresh: retain existing regret URLs and revision article; add only missing topics. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { topics, sources, name: series } = require('../src/data/treatment-insights.json');
fs.writeFileSync(path.join(root, 'src/data/treatment-insight-links.json'), JSON.stringify(topics.map(({ slug, name, path, mode, treatments }) => ({ slug, name, path, mode, treatments })), null, 2) + '\n');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
const paragraphs = xs => xs.map(x => `<p>${esc(x)}</p>`).join('\n');
const revisionFile = path.join(root, 'treatments/implant-revision.html');
const revision = fs.readFileSync(revisionFile, 'utf8');
const absoluteLinks = html => html.replace(/(href|src)="(\.\.[^"]*|\.\/[^"]*)"/g, (_, attr, url) => `${attr}="${new URL(url, 'https://bdbddc.com/treatments/implant-revision').pathname}"`);
const header = absoluteLinks(revision.match(/<header\b[\s\S]*?<\/header>/)[0]);
const footer = absoluteLinks(revision.match(/<footer\b[\s\S]*?<\/footer>/)[0]);
const mobile = absoluteLinks(revision.match(/<!-- Mobile Nav \(auto-injected\) -->[\s\S]*?<!-- End Mobile Nav -->/)[0]);
const parts = [
 ['benefits','01','장점','기대할 수 있는 것'],
 ['limits','02','단점','감수할 부담과 한계'],
 ['indications','03','적응증','고려할 수 있는 경우'],
 ['contraindications','04','금기증','피하거나 먼저 조절할 조건'],
 ['care','05','주의사항','치료 전후의 준비']
];
const find = slug => topics.find(t => t.slug === slug);
const href = t => t.path + (t.mode === 'existing-treatment' ? '#inside-out' : '');
function references(t) {
 return `<section class="io-sources" id="${t.mode === 'existing-treatment' ? 'inside-out-' : ''}sources"><h2>설명에 참고한 자료</h2><p>공공기관·학회의 원문을 확인해 일반적인 판단 기준을 정리했습니다. 아래 자료는 이 병원의 개별 치료 결과나 의료진 감수를 뜻하지 않습니다. 개인에게 적용할 방법은 진찰과 필요한 검사를 거쳐 정합니다. 자료 확인: <time datetime="${t.updated}">${t.updated}</time>.</p><ol>${t.sources.map(id => {const s=sources[id];if(!s) throw Error(id);return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} <span class="io-sr">(새 창)</span> ↗</a><span>${esc(s.basis)}</span></li>`}).join('')}</ol></section>`;
}
function fiveSections(t, embedded = false) {
 const prefix = embedded ? 'inside-out-' : '';
 const aliases = { benefits:'quick-answer', limits:'side-effects', contraindications:'not-for' };
 return parts.map(([key,num,label,title]) => `<section class="io-section" id="${prefix}${key}" aria-labelledby="${prefix}${key}-title">
${!embedded && aliases[key] ? `<span id="${aliases[key]}" class="io-anchor"></span>` : ''}
<div class="io-section-heading"><span class="io-number">${num}</span><div><p class="io-eyebrow">${label}</p><h2 id="${prefix}${key}-title">${title}</h2></div></div>
${key === 'contraindications' ? `<p class="io-note">금기증과 주의가 필요한 상태는 구분해야 합니다. 아래는 피할 접근, 먼저 조절할 상태, 추가 평가가 필요한 조건입니다. 하나에 해당한다고 스스로 치료 가능 여부를 확정하지 마세요.</p><div class="io-conditions">${t[key].map(c=>`<div><span class="io-tag">${esc(c.level)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join('')}</div>` : paragraphs(t[key])}
${(t.depth?.[key] || []).map(d => `<div class="io-depth"><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></div>`).join('\n')}
<p class="io-evidence"><a href="#${embedded?'inside-out-':''}sources">이 설명의 근거와 한계 확인 ↓</a></p></section>`).join('\n');
}
function render(t) {
 const title = t.mode === 'existing-guide' ? `${t.name} 후회·부작용을 줄이기 위한 장단점과 주의사항 | ${series} | 서울비디치과` : `${t.name} 장단점·주의사항·적응증·금기증 | ${series} | 서울비디치과`;
 const description = `${t.name}을 고민하는 분을 위한 ${series}. ${t.title}. 장점·단점·주의사항·적응증·금기증과 상황별 판단, 상담 질문을 함께 살펴봅니다.`;
 const schema = {'@context':'https://schema.org','@type':'MedicalWebPage',name:title,description,url:'https://bdbddc.com'+t.path,inLanguage:'ko-KR',dateModified:t.updated,publisher:{'@type':'Organization',name:'서울비디치과',url:'https://bdbddc.com'}};
 return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="https://bdbddc.com${t.path}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(t.name)}, 그 안과 밖"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="https://bdbddc.com${t.path}"><meta property="og:site_name" content="서울비디치과"><meta property="og:locale" content="ko_KR">
<link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/css/site-v5.css"><link rel="stylesheet" href="/css/treatment-insights.css?v=20261007b"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<script type="application/ld+json">${json(schema)}</script></head><body data-consultation-tone="calm"><a class="skip-link" href="#main-content">본문으로 바로가기</a>${header}
<main id="main-content" class="io-page" data-insight="${t.slug}">
<section class="io-hero"><div class="io-wrap"><nav class="io-breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span> / </span><a href="/treatments/${t.treatments[0]}">${esc(t.name)} 안내</a></nav><div class="io-hero-grid"><div><p class="io-eyebrow">서울비디치과 · ${series}</p><h1>${esc(t.name)},<br><em>그 안과 밖.</em></h1><p class="io-deck">${esc(t.title)}</p><p class="io-hero-caption">좋은 점을 아는 만큼,<br>내게 맞지 않는 조건도 알아야 하니까요.</p></div><nav class="io-five" aria-label="다섯 가지 관점">${parts.map(([id,n,label,caption])=>`<a href="#${id}"><span>${n}</span><strong>${label}</strong><small>${caption}</small><b aria-hidden="true">↗</b></a>`).join('')}</nav></div></div></section>
<div class="io-wrap io-layout"><aside class="io-toc"><p>이 페이지에서</p><nav aria-label="본문 차례">${parts.map(([id,n,label])=>`<a href="#${id}">${n} ${label}</a>`).join('')}<a href="#situations">06 상황별로 생각하기</a><a href="#faq">07 더 궁금한 이야기</a><a href="#checklist">08 상담에 가져갈 질문</a></nav><p class="io-small">자료 확인<br>${t.updated}</p></aside><div class="io-content">
<div class="io-opening">${paragraphs(t.opening)}<p class="io-small">${t.mode==='existing-guide'?'후회·부작용을 고민하던 분을 위한 기존 안내를 다섯 가지 관점으로 다시 정리했습니다. ':''}이 글은 치료를 결정하기 전 설명을 이해하는 데 도움을 드리기 위한 안내입니다.</p></div>
${fiveSections(t)}
<section class="io-section" id="situations"><span id="regrets" class="io-anchor"></span><div class="io-section-heading"><span class="io-number">06</span><div><p class="io-eyebrow">내 상황에 가까운 질문</p><h2>같은 치료라도, 선택은 달라집니다</h2></div></div><p class="io-small">특정 환자분의 후기가 아닌, 이해를 돕기 위한 상황별 질문입니다.</p><div class="io-situations">${t.cases.map((c,i)=>`<article><span class="io-case-label">상황 ${String(i+1).padStart(2,'0')}</span><h3>${esc(c.title)}</h3><p class="io-direction">${esc(c.direction)}</p><p>${esc(c.reason)}</p></article>`).join('')}</div></section>
<section class="io-section" id="faq"><div class="io-section-heading"><span class="io-number">07</span><div><p class="io-eyebrow">한 걸음 더</p><h2>결정 전에 더 궁금한 이야기</h2></div></div>${t.faq.map(f=>`<details class="io-faq"><summary>${esc(f.question)}</summary><div><p>${esc(f.answer)}</p></div></details>`).join('')}</section>
<section class="io-section" id="checklist"><div class="io-section-heading"><span class="io-number">08</span><div><p class="io-eyebrow">질문을 잘 준비하지 못해도 괜찮습니다</p><h2>이 문장부터 물어보세요</h2></div></div><ol class="io-questions">${t.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol><p>가장 걱정되는 질문 하나에 표시해 두세요. 설명을 다 듣고도 이해되지 않는 부분이 남으면, 다른 말이나 사진으로 다시 설명해 달라고 요청하셔도 됩니다.</p><div class="io-consult"><h3>치료 이름보다, 지금의 불편부터</h3><p>천안·아산에서 가깝게 오시든, 홍성·예산·당진·서산에서 시간을 내어 오시든 첫날 확인할 범위와 추가 방문 가능성을 미리 상의하세요. 진료 장소는 천안 불당동 서울비디치과입니다.</p><div><a href="/reservation">내 상황으로 상담 문의하기 <span aria-hidden="true">→</span></a><a href="/directions">위치·방문 준비</a></div></div></section>
<section class="io-related" aria-labelledby="related-title"><p class="io-eyebrow">결정은 비교할수록 구체적으로</p><h2 id="related-title">함께 살펴볼 치료</h2><div>${t.related.map(slug=>{const r=find(slug);if(!r)throw Error(slug);return `<a href="${href(r)}"><strong>${esc(r.name)}</strong><span>${esc(r.title)} →</span></a>`}).join('')}</div><a class="io-back" href="/treatments/${t.treatments[0]}">${esc(t.name)} 진료 안내로 돌아가기 →</a></section>
${references(t)}
</div></div></main>${footer}${mobile}<script src="/js/main.js?v=202604190433" defer></script><script src="/js/gnb-v2.js?v=20261004revision" defer></script></body></html>\n`;
}
for (const t of topics.filter(t=>t.mode!=='existing-treatment')) {
 const file=path.join(root,t.path+'.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,render(t).replace(/[ \t]+$/gm, ''));
}
const r=topics.find(t=>t.mode==='existing-treatment');
const embedded=`<!-- treatment-insights:start -->\n<section id="inside-out" class="io-embedded io-page"><div class="io-wrap"><p class="io-eyebrow">${series}</p><h2 class="io-embedded-title">재수술을 결정하기 전,<br>다섯 가지를 함께 살펴보세요.</h2><p class="io-deck">기대할 수 있는 변화와 감수할 부담, 지금 먼저 확인할 조건까지.</p>${fiveSections(r,true)}${references(r)}</div></section>\n<!-- treatment-insights:end -->`;
let updated=revision.replace(/<!-- treatment-insights:start -->[\s\S]*?<!-- treatment-insights:end -->\s*/,'');
updated=updated.replace(/<link rel="stylesheet" href="\/css\/treatment-insights\.css[^>]*>\s*/,'');
updated=updated.replace('</head>','<link rel="stylesheet" href="/css/treatment-insights.css?v=20261007b">\n</head>');
updated=updated.replace(/ *<section id="revision-sources"/,embedded+'\n  <section id="revision-sources"');
fs.writeFileSync(revisionFile,updated);
// Append new canonical pages only; sitemap release tooling derives lastmod from Git.
const sitemapFile=path.join(root,'sitemap-main.xml');let sitemap=fs.readFileSync(sitemapFile,'utf8');
for(const t of topics.filter(t=>t.mode==='new-guide'))if(!sitemap.includes(`<loc>https://bdbddc.com${t.path}</loc>`))sitemap=sitemap.replace('</urlset>',`  <url><loc>https://bdbddc.com${t.path}</loc></url>\n</urlset>`);
fs.writeFileSync(sitemapFile,sitemap);
console.log('Treatment insights: 17 existing guide URLs refreshed, 8 new pages, revision article preserved with five-part addition.');
