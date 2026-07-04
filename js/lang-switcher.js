/**
 * 서울비디치과 언어 전환 버튼 (Language Switcher)
 * - 페이지 <head>의 hreflang 태그를 읽어 해당 페이지의 번역본으로 직접 이동
 * - hreflang이 없는 언어는 언어별 허브 페이지로 폴백
 * - 좌하단 플로팅 (우하단은 챗봇/퀵액션과 충돌 방지)
 */
(function () {
  'use strict';

  // 언어 정의: code → { label, flag, hub(폴백 URL), hreflang 매칭 키 }
  var LANGS = [
    { code: 'ko', label: '한국어',      flag: '🇰🇷', hub: '/',          match: ['ko'] },
    { code: 'en', label: 'English',     flag: '🇺🇸', hub: '/en/',       match: ['en', 'x-default'] },
    { code: 'ja', label: '日本語',      flag: '🇯🇵', hub: '/jp/dental', match: ['ja'] },
    { code: 'zh', label: '中文',        flag: '🇨🇳', hub: '/cn/dental', match: ['zh-CN', 'zh'] },
    { code: 'vi', label: 'Tiếng Việt',  flag: '🇻🇳', hub: '/vi/',       match: ['vi'] },
    { code: 'th', label: 'ไทย',         flag: '🇹🇭', hub: '/th/',       match: ['th'] },
    { code: 'ru', label: 'Русский',     flag: '🇷🇺', hub: '/ru/',       match: ['ru'] }
  ];

  // 현재 언어 감지 (URL 경로 기준)
  function currentLang() {
    var p = location.pathname;
    if (p.indexOf('/en/') === 0 || p === '/en') return 'en';
    if (p.indexOf('/jp/') === 0 || p === '/jp') return 'ja';
    if (p.indexOf('/cn/') === 0 || p === '/cn') return 'zh';
    if (p.indexOf('/vi/') === 0 || p === '/vi') return 'vi';
    if (p.indexOf('/th/') === 0 || p === '/th') return 'th';
    if (p.indexOf('/ru/') === 0 || p === '/ru') return 'ru';
    return 'ko';
  }

  // hreflang 태그에서 언어별 대체 URL 수집
  function collectAlternates() {
    var map = {};
    var links = document.querySelectorAll('link[rel="alternate"][hreflang]');
    for (var i = 0; i < links.length; i++) {
      var hl = links[i].getAttribute('hreflang');
      var href = links[i].getAttribute('href');
      if (hl && href) map[hl] = href;
    }
    return map;
  }

  function targetUrl(lang, alternates) {
    for (var i = 0; i < lang.match.length; i++) {
      if (alternates[lang.match[i]]) return alternates[lang.match[i]];
    }
    return lang.hub;
  }

  function init() {
    var cur = currentLang();
    var alternates = collectAlternates();

    // ── 스타일 주입 ──
    var css = [
      '#bd-lang-switcher{position:fixed;left:20px;bottom:24px;z-index:9000;font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '#bd-lang-toggle{display:flex;align-items:center;gap:7px;padding:10px 16px;background:rgba(255,255,255,.96);border:1px solid rgba(0,0,0,.08);border-radius:30px;box-shadow:0 4px 16px rgba(0,0,0,.12);cursor:pointer;font-size:.85rem;font-weight:700;color:#2D2A26;transition:transform .2s,box-shadow .2s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
      '#bd-lang-toggle:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.16)}',
      '#bd-lang-toggle .bd-globe{font-size:1.05rem;line-height:1}',
      '#bd-lang-menu{position:absolute;left:0;bottom:calc(100% + 10px);min-width:172px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.18);padding:6px;display:none;overflow:hidden}',
      '#bd-lang-menu.open{display:block;animation:bdLangFade .18s ease}',
      '@keyframes bdLangFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
      '.bd-lang-item{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:9px;text-decoration:none;color:#2D2A26;font-size:.86rem;font-weight:500;transition:background .15s}',
      '.bd-lang-item:hover{background:#F5F1E8}',
      '.bd-lang-item.active{background:#F5F1E8;font-weight:800;color:#8B6914;pointer-events:none}',
      '.bd-lang-item .bd-flag{font-size:1rem;line-height:1}',
      '.bd-lang-item .bd-check{margin-left:auto;font-size:.72rem;color:#C9A042}',
      '@media (max-width:768px){#bd-lang-switcher{left:14px;bottom:78px}#bd-lang-toggle{padding:9px 14px;font-size:.8rem}}'
    ].join('');
    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ── DOM 생성 ──
    var curDef = null;
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === cur) curDef = LANGS[i];

    var wrap = document.createElement('div');
    wrap.id = 'bd-lang-switcher';

    var toggle = document.createElement('button');
    toggle.id = 'bd-lang-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Select language / 언어 선택');
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="bd-globe" aria-hidden="true">🌐</span><span>' + (curDef ? curDef.flag + ' ' + curDef.label : 'Language') + '</span>';

    var menu = document.createElement('div');
    menu.id = 'bd-lang-menu';
    menu.setAttribute('role', 'menu');

    for (var j = 0; j < LANGS.length; j++) {
      var L = LANGS[j];
      var a = document.createElement('a');
      a.className = 'bd-lang-item' + (L.code === cur ? ' active' : '');
      a.href = L.code === cur ? '#' : targetUrl(L, alternates);
      a.setAttribute('role', 'menuitem');
      a.setAttribute('hreflang', L.code);
      a.innerHTML = '<span class="bd-flag" aria-hidden="true">' + L.flag + '</span><span>' + L.label + '</span>' + (L.code === cur ? '<span class="bd-check">✓</span>' : '');
      menu.appendChild(a);
    }

    wrap.appendChild(menu);
    wrap.appendChild(toggle);
    document.body.appendChild(wrap);

    // ── 이벤트 ──
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function () {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
