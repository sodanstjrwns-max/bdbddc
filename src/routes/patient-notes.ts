import type { Hono } from 'hono'
import { patientNotes, visiblePatientNotes, noteRegions, noteTopics, type PatientNote } from '../data/patient-notes'
import { patientNoteDetails } from '../data/patient-note-details'
import { patientNotesFooter } from '../lib/patient-notes-footer'
import { TRACKING_HEAD, TRACKING_BODY } from '../lib/layout'

type NoteShell = { header: () => string; mobileNav: () => string }
const origin = 'https://bdbddc.com'
const base = '/concerns'
const pageSize = 24
const h = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')
const url = (n: PatientNote) => `${base}/${n.slug}`
const list = (items: string[]) => `<ul class="pn-list">${items.map(s => `<li>${h(s)}</li>`).join('')}</ul>`
const paragraphs = (items: string[]) => items.map(s => `<p>${h(s)}</p>`).join('')
const tags = (n: PatientNote) => `<div class="pn-tags"><a href="${base}?region=${encodeURIComponent(n.region)}">${h(n.region)}에서 상담 준비</a><a href="${base}?topic=${encodeURIComponent(n.topic)}">${h(n.topic)}</a><span>${h(n.concern)}</span></div>`

function document(shell: NoteShell, title: string, description: string, path: string, body: string, schema: unknown[], live: boolean, noindex = false) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${h(title)} | 서울비디치과</title><meta name="description" content="${h(description)}"><meta name="robots" content="${noindex || !live ? 'noindex,follow' : 'index,follow,max-image-preview:large'}"><link rel="canonical" href="${origin}${h(path)}"><meta property="og:title" content="${h(title)}"><meta property="og:description" content="${h(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${origin}${h(path)}"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="서울비디치과"><meta property="og:image" content="${origin}/images/og-image-v2.jpg?v=sq1"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"><link rel="stylesheet" href="/css/site-v5.css?v=91b2be45"><link rel="stylesheet" href="/static/patient-notes.css?v=20260916b"><script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': schema })}</script>${live ? TRACKING_HEAD : ''}</head><body class="pn">${live ? TRACKING_BODY : ''}<a class="pn-skip" href="#main">본문으로 건너뛰기</a>${shell.header().replace('class="btn-reserve"', 'class="pn-reserve"')}${!live ? '<div class="pn-preview">로컬 미리보기 · 운영 사이트 반영 전</div>' : ''}${body}${patientNotesFooter}${shell.mobileNav()}<script src="/js/gnb-v2.js?v=20260819fix" defer></script></body></html>`
}

function breadcrumbs(note?: PatientNote) {
  const items = [{ name: '홈', item: origin + '/' }, { name: '나의 고민 해결 노트', item: origin + base }]
  if (note) items.push({ name: note.title, item: origin + url(note) })
  return { '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) }
}

function card(note: PatientNote, index: number) {
  const detail = patientNoteDetails[note.slug]
  return `<article class="pn-card"><div class="pn-card-top"><span>${h(note.topic)}</span><span>${h(note.region)} · NOTE ${String(index + 1).padStart(2, '0')}</span></div><h2><a href="${url(note)}">${h(note.title)}</a></h2><p>${h(detail?.feeling || note.description)}</p><div class="pn-card-bottom"><span>${h(note.concern)}</span><a href="${url(note)}" aria-label="${h(note.title)} 읽기"><span>함께 생각해 보기</span> <i class="fas fa-arrow-right" aria-hidden="true"></i></a></div></article>`
}

function renderHub(shell: NoteShell, region: string, topic: string, page: number, live: boolean) {
  const all = visiblePatientNotes(!live).filter(n => (!region || n.region === region) && (!topic || n.topic === topic))
  const notes = all.slice((page - 1) * pageSize, page * pageSize)
  const pages = Math.ceil(all.length / pageSize)
  const filtered = Boolean(region || topic)
  const canonical = !filtered && page > 1 ? `${base}?page=${page}` : base
  const title = `나의 고민 해결 노트${page > 1 ? ` · ${page}페이지` : ''}`
  const options = (items: readonly string[], selected: string) => items.map(s => `<option value="${h(s)}"${s === selected ? ' selected' : ''}>${h(s)}</option>`).join('')
  const pager = Array.from({ length: pages }, (_, i) => {
    const params = new URLSearchParams()
    if (region) params.set('region', region)
    if (topic) params.set('topic', topic)
    if (i > 0) params.set('page', String(i + 1))
    return `<a href="${h(base + (params.size ? '?' + params : ''))}"${page === i + 1 ? ' aria-current="page"' : ''}>${i + 1}</a>`
  }).join('')
  const body = `<main id="main"><section class="pn-hero"><div class="container"><div class="pn-eyebrow">서울비디치과 · 당신의 이야기를 듣습니다</div><h1>나의 고민 <span>해결 노트</span></h1><p class="pn-lead">치아보다 마음이 먼저<br class="pn-mobile-break"> 불편해지는 순간이 있습니다.</p><p class="pn-intro">또 아플까 봐 조심하는 식사, 서로 다른 설명 앞의 망설임.<br>쉽게 꺼내지 못했던 걱정부터 함께 이야기합니다.</p><a class="btn btn-primary" href="#notes">내 마음과 닮은 고민 찾기 <i class="fas fa-arrow-down" aria-hidden="true"></i></a></div></section><section id="notes" class="pn-catalog container" aria-labelledby="notes-title"><div class="pn-section-head"><div><span class="pn-eyebrow">혼자 고민하지 않도록</span><h2 id="notes-title">혹시, 이런 마음이신가요?</h2></div><p>천안 · 아산 · 홍성 · 예산 · 당진 · 서산<br>상담을 준비하는 분들을 위한 이야기</p></div><form class="pn-filters" method="get" action="${base}"><label>상담을 준비하는 지역<select name="region"><option value="">모든 지역</option>${options(noteRegions, region)}</select></label><label>불편감·치료 주제<select name="topic"><option value="">모든 주제</option>${options(noteTopics, topic)}</select></label><button class="btn btn-primary" type="submit">고민 찾아보기</button>${filtered ? `<a class="pn-reset" href="${base}">전체 보기</a>` : ''}</form><p class="pn-result">${all.length}개의 이야기${filtered ? ' · 선택한 조건의 노트' : ''}</p><div class="pn-grid">${notes.length ? notes.map(n => card(n, patientNotes.indexOf(n))).join('') : `<p class="pn-empty">이 조합의 노트는 아직 준비 중입니다. <a href="${base}">전체 질문 보기</a></p>`}</div>${pages > 1 ? `<nav class="pn-pagination" aria-label="노트 목록 페이지">${pager}</nav>` : ''}</section><aside class="pn-hub-note container"><div><span class="pn-eyebrow">진료실에 오기 전에도</span><h2>걱정을 잘 설명하지 못해도 괜찮습니다.</h2><p>내 상황과 닮은 글을 읽고, 마음에 남는 질문 하나만 가져오셔도 됩니다.<br>치료의 전체 과정이 궁금하다면 진료 가이드에서 이어서 살펴보세요.</p><a class="btn btn-outline" href="/guide/">진료 가이드 보기 <i class="fas fa-arrow-right" aria-hidden="true"></i></a><p class="pn-editorial">노트는 실제 환자 후기가 아닌 가상 질문을 바탕으로 한 일반 안내입니다. 개별 진찰을 대신하지 않습니다.</p></div></aside></main>`
  return document(shell, title, '천안·아산·홍성·예산·당진·서산에서 임플란트, 신경치료와 치아 불편으로 고민하는 분들의 걱정부터 함께 풀어보는 이야기입니다.', canonical, body, [breadcrumbs(), { '@type': 'CollectionPage', '@id': origin + canonical, name: title, url: origin + canonical, hasPart: notes.map(n => ({ '@type': 'WebPage', name: n.title, url: origin + url(n) })) }], live, filtered)
}

function renderNote(shell: NoteShell, note: PatientNote, live: boolean) {
  const detail = patientNoteDetails[note.slug]
  const visibleUrls = new Set(visiblePatientNotes(!live).map(url))
  const related = note.related.filter(link => !link.href.startsWith(base + '/') || visibleUrls.has(link.href))
  const toc = [{ id: 'your-story', title: '이런 마음이 드셨나요?' }, ...detail.sections.map(s => ({ id: s.id, title: s.title })), { id: 'options', title: '검사 후 함께 생각할 선택' }, { id: 'questions', title: '조금 더 물어보고 싶은 것' }, { id: 'prepare', title: '이렇게 말해 보셔도 됩니다' }, { id: 'visit', title: `${note.region}에서 방문을 준비한다면` }]
  const tocLinks = toc.map(s => `<a href="#${s.id}">${h(s.title)}</a>`).join('')
  const body = `<main id="main" class="pn-detail container"><nav class="pn-breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span aria-hidden="true">/</span><a href="${base}">나의 고민 해결 노트</a></nav><header class="pn-note-head"><div class="pn-eyebrow">나의 고민 해결 노트</div>${tags(note)}<h1>${h(note.title)}</h1><p class="pn-situation"><span>이 글에서 함께 생각할 상황</span>${h(note.situation)}</p><p class="pn-meta">자료 정리 ${h(note.updated)} · 가상 상황을 바탕으로 쓴 글</p><details class="pn-mobile-toc"><summary>이 글에서 함께 풀어볼 걱정</summary><nav aria-label="본문 바로가기">${tocLinks}</nav></details></header><div class="pn-reading-layout"><article class="pn-article"><section id="your-story" class="pn-empathy"><span class="pn-eyebrow">그 마음에서 이야기를 시작합니다</span><h2>${h(detail.feeling)}</h2>${paragraphs(detail.opening)}</section>${detail.sections.map((s, i) => `<section id="${s.id}" class="pn-chapter"><span class="pn-chapter-label">함께 풀어볼 걱정 ${String(i + 1).padStart(2, '0')}</span><h2>${h(s.title)}</h2>${paragraphs(s.paragraphs)}</section>`).join('')}<section id="answer" class="pn-answer"><span class="pn-eyebrow">걱정에서 다음 단계로</span><h2>지금, 기억해 두셔도 좋은 것</h2><p>${h(note.answer)}</p></section><section id="check"><h2>상담에서는 이 부분을 함께 확인합니다.</h2><p>모든 내용을 알고 오실 필요는 없습니다. 아는 것과 모르는 것을 나누어 말씀하셔도 됩니다.</p>${list(note.checks)}</section><section id="options"><span class="pn-eyebrow">검사 후 달라질 수 있는 방향</span><h2>어떤 선택을 이야기하게 될까요?</h2><p>아래는 현재 상태를 확인한 뒤 상의할 수 있는 방향입니다. 내 증상과 비슷한 문장이 있다고 해서 같은 치료가 필요한 것은 아닙니다.</p><div class="pn-options">${note.choices.map((choice, i) => `<div class="pn-option"><span class="pn-option-number">${String(i + 1).padStart(2, '0')}</span><div><h3>${h(choice.condition)}</h3><p>${h(choice.option)}</p><p class="pn-limit">${h(choice.limit)}</p></div></div>`).join('')}</div><div class="pn-unknown"><strong>결정 전에 한 번 더 확인해 주세요.</strong><p>${h(note.unknown)}</p></div></section><section id="questions" class="pn-questions"><span class="pn-eyebrow">아직 마음에 남는 질문</span><h2>조금 더 물어보고 싶은 것들</h2>${detail.questions.map((q, i) => `<div class="pn-question"><h3><span aria-hidden="true">Q${i + 1}.</span> ${h(q.question)}</h3><p>${h(q.answer)}</p></div>`).join('')}</section><section id="prepare"><span class="pn-eyebrow">내 말로 상담을 시작할 때</span><h2>이렇게 말해 보셔도 됩니다.</h2><div class="pn-say"><span>예약할 때 꺼내 볼 문장</span><p>${h(detail.say)}</p></div><h3>있다면 가져오세요. 없으면 없다고 알려주세요.</h3>${list(note.prepare)}</section><section id="visit" class="pn-local"><span class="pn-eyebrow">${h(note.region)} · ${h(note.topic)} 상담 준비</span><h2>${h(note.localHeading)}</h2><p>${h(note.localAdvice)}</p><a href="${h(note.areaPath)}#visit-preparation">${h(note.region)}에서 방문하는 분을 위한 안내 <i class="fas fa-arrow-right" aria-hidden="true"></i></a></section><section class="pn-closing" data-cta-location="note_closing"><h2>마지막으로, 전하고 싶은 말</h2><p>${h(detail.closing)}</p><a class="btn btn-primary" href="/reservation">내 상황으로 상담 문의하기 <i class="fas fa-arrow-right" aria-hidden="true"></i></a></section><section class="pn-related"><h2>다음 이야기도 함께 읽어보세요.</h2>${related.map(link => `<a href="${h(link.href)}">${h(link.title)} <span aria-hidden="true">→</span></a>`).join('')}</section><section class="pn-sources"><h2>이 글의 참고 자료와 작성 기준</h2><ul>${note.sources.map(link => `<li><a href="${h(link.href)}" rel="noopener" target="_blank">${h(link.title)} ↗</a></li>`).join('')}</ul><p>자료 확인: ${h(note.updated)}. 공개 학회·기관 자료를 참고한 일반 안내입니다. 실제 환자의 말이나 진료 후기를 옮긴 글이 아닙니다. 개별 의료진 감수 기록은 아직 등록되지 않았습니다. 치료의 범위·기간·비용은 진찰 후 달라질 수 있습니다.</p><p>지역 표시는 상담·방문 맥락입니다. 서울비디치과의 진료 장소는 천안 불당동이며, 표시된 각 지역에 분원이 있다는 의미는 아닙니다.</p></section><a class="pn-back" href="${base}">← 다른 고민 노트 보기</a></article><aside class="pn-toc" aria-label="이 노트의 순서"><div class="pn-toc-sticky"><span>이 글에서 함께 풀어볼 걱정</span><nav>${tocLinks}</nav><div class="pn-aside-contact" data-cta-location="note_sidebar"><strong>설명이 서툴러도 괜찮습니다.</strong><p>지금 가장 불편한 것부터 말씀해 주세요.</p><a class="btn btn-primary" href="/reservation">상담 일정 문의</a><a class="pn-call" href="tel:0414152892">041-415-2892</a></div></div></aside></div></main>`
  return document(shell, note.title, note.description, url(note), body, [breadcrumbs(note), {
    '@type': 'MedicalWebPage', '@id': origin + url(note), url: origin + url(note), name: note.title,
    description: note.description, datePublished: note.publishedAt, dateModified: note.updated, inLanguage: 'ko-KR',
    about: { '@type': 'Thing', name: note.topic }, spatialCoverage: { '@type': 'Place', name: note.region },
    isPartOf: { '@id': origin + base }, citation: note.sources.map(s => s.href),
    publisher: { '@type': 'Dentist', name: '서울비디치과의원 불당본점', url: origin, telephone: '+82-41-415-2892', address: { '@type': 'PostalAddress', streetAddress: '서북구 불당34길 14, 1~5층', addressLocality: '천안시', addressRegion: '충청남도', addressCountry: 'KR' } }
  }], live)
}

export function registerPatientNotes(app: Hono<any>, shell: NoteShell) {
  // Local and Pages previews must not report visits or be indexed as production content.
  const live = (requestUrl: string) => new URL(requestUrl).hostname === 'bdbddc.com'
  app.get('/sitemap-concerns.xml', c => {
    const notes = visiblePatientNotes(!live(c.req.url))
    c.header('Cache-Control', 'no-store')
    const lastmod = notes.reduce((last, note) => { const date = note.publishedAt && note.publishedAt.slice(0, 10) > note.updated ? note.publishedAt : note.updated; return date > last ? date : last }, '2026-09-17')
    const entries = [{ path: base, updated: lastmod }, ...notes.map(n => ({ path: url(n), updated: n.publishedAt && n.publishedAt.slice(0, 10) > n.updated ? n.publishedAt : n.updated }))]
    c.header('Content-Type', 'application/xml; charset=utf-8')
    return c.body(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(n => `<url><loc>${origin}${n.path}</loc><lastmod>${n.updated}</lastmod></url>`).join('')}</urlset>`)
  })
  app.get(`${base}/*`, async (c, next) => {
    const pathname = new URL(c.req.url).pathname
    if (pathname.endsWith('/')) return c.redirect(pathname.replace(/\/+$/, '') + new URL(c.req.url).search, 301)
    return next()
  })
  app.get(base, c => {
    c.header('Cache-Control', 'no-store')
    const region = c.req.query('region') || ''
    const topic = c.req.query('topic') || ''
    const rawPage = c.req.query('page') || '1'
    const page = Number(rawPage)
    const count = visiblePatientNotes(!live(c.req.url)).filter(n => (!region || n.region === region) && (!topic || n.topic === topic)).length
    if ((region && !noteRegions.includes(region as typeof noteRegions[number])) || (topic && !noteTopics.includes(topic)) || !/^[1-9]\d*$/.test(rawPage) || !Number.isSafeInteger(page) || page > Math.max(1, Math.ceil(count / pageSize))) {
      c.header('X-Robots-Tag', 'noindex')
      return c.html(document(shell, '노트를 찾을 수 없습니다', '지역과 주제를 다시 선택해 주세요.', base, `<main id="main" class="pn-detail"><h1>해당 목록이 없습니다.</h1><a href="${base}">전체 노트로 돌아가기</a></main>`, [], live(c.req.url), true), 404)
    }
    return c.html(renderHub(shell, region, topic, page, live(c.req.url)))
  })
  app.get(`${base}/:slug`, c => {
    c.header('Cache-Control', 'no-store')
    const note = visiblePatientNotes(!live(c.req.url)).find(n => n.slug === c.req.param('slug'))
    if (!note) {
      c.header('X-Robots-Tag', 'noindex')
      return c.html(document(shell, '노트를 찾을 수 없습니다', '다른 고민 노트를 확인해 주세요.', base, `<main id="main" class="pn-detail"><h1>이 노트는 찾을 수 없습니다.</h1><a href="${base}">다른 고민 노트 보기</a></main>`, [], live(c.req.url), true), 404)
    }
    return c.html(renderNote(shell, note, live(c.req.url)))
  })
}
