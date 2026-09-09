/**
 * bd-smart-cta.js v1.0 (2026-09-04)
 * 콘텐츠 페이지(가이드·칼럼·블로그) 전용 스마트 CTA
 *
 * ── 배경 ──────────────────────────────────────────────────────────
 * 월 4.4만 세션 중 다수가 /guide·/column·/blog 정보성 콘텐츠로 유입되지만,
 * 이 페이지들에는 예약으로 이어지는 다리(CTA)가 없었다.
 * 끝까지 읽은 독자(content_read_complete 75%+)가 그대로 이탈하는 구조.
 *
 * ── 동작 ──────────────────────────────────────────────────────────
 * · pageType 판별은 js/analytics.js 의 규칙을 그대로 따른다
 *   (/guide → guide, /blog·/column → content). 단 이 파일은
 *   analytics.js 가 로드되지 않는 페이지(가이드 정적 HTML, 칼럼 SSR)에서도
 *   돌아야 하므로 판별 로직을 자체 내장한다.
 * · 한국어 페이지에서만 동작 (/jp /en /cn /vi /th /ru 제외 — CTA 문구가 한국어).
 * · 본문(main) 하단에 CTA 카드 + 모바일 하단 고정 바를 삽입.
 * · /api/geo 가 local:true 면 "천안·아산에서 보고 계시다면" 배너 추가 노출.
 *   (IP·개인정보 저장 없음 — 워커가 CF 지역 필드만 읽어 boolean으로 반환)
 * · 클릭 시 gtag('event','cta_click',{page_type, area, target}) 전송.
 *
 * 로드 경로: scripts/tracking-head.html (정적 HTML, 빌드 주입)
 *          + src/lib/layout.ts TRACKING_HEAD (SSR)
 */
(function () {
  'use strict';
  if (window._bdSmartCtaDone) return;
  window._bdSmartCtaDone = 1;

  var path = location.pathname;

  // 다국어 페이지 제외 (CTA 문구가 한국어)
  if (/^\/(jp|en|cn|vi|th|ru)(\/|$)/.test(path)) return;

  // pageType 판별 — js/analytics.js 와 동일 규칙의 부분집합
  var pageType = '';
  if (path.indexOf('/guide') === 0) pageType = 'guide';
  else if (path.indexOf('/blog') === 0 || path.indexOf('/column') === 0) pageType = 'content';
  if (!pageType) return;

  // 기존 대표번호·네이버예약 링크 재사용 (전 사이트 공통)
  var TEL = 'tel:041-415-2892';
  var NAVER = 'https://naver.me/5yPnKmqQ';

  var geoArea = ''; // 'cheonan' | 'asan' | ''
  var geoLocal = false;

  // gtag 셔틀 — 페이지에 gtag 가 없으면 dataLayer 큐잉 방식으로 정의
  // (tracking-head 주입으로 GTM + gtag/js 는 전 페이지에 존재)
  function fireCta(target) {
    try {
      window.dataLayer = window.dataLayer || [];
      var g = window.gtag || function () { window.dataLayer.push(arguments); };
      g('event', 'cta_click', {
        event_category: 'conversion',
        page_type: pageType,
        area: geoArea || (geoLocal ? 'chungnam' : ''),
        target: target,
        page_path: path
      });
    } catch (e) { /* silent */ }
  }

  function buildButtons(cls) {
    var telBtn = document.createElement('a');
    telBtn.href = TEL;
    telBtn.className = cls + '__btn ' + cls + '__btn--tel';
    telBtn.innerHTML = '📞 전화하기';
    telBtn.addEventListener('click', function () { fireCta('tel'); });

    var nvBtn = document.createElement('a');
    nvBtn.href = NAVER;
    nvBtn.target = '_blank';
    nvBtn.rel = 'noopener';
    nvBtn.className = cls + '__btn ' + cls + '__btn--naver';
    nvBtn.textContent = '네이버 예약';
    nvBtn.addEventListener('click', function () { fireCta('naver'); });

    return [telBtn, nvBtn];
  }

  function injectStyles() {
    var css = ''
      + '.bd-scta{max-width:900px;margin:48px auto 32px;padding:0 24px}'
      + '.bd-scta__card{background:#f8f6f3;border:1px solid #e8e0d6;border-radius:16px;padding:28px 24px;text-align:center}'
      + '.bd-scta__geo{display:none;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;border-radius:12px;padding:12px 16px;margin-bottom:16px;font-size:.95rem;font-weight:600;line-height:1.5}'
      + '.bd-scta__geo.show{display:block}'
      + '.bd-scta__title{font-size:1.15rem;font-weight:800;color:#1a1917;margin:0 0 6px}'
      + '.bd-scta__sub{font-size:.9rem;color:#78716C;margin:0 0 18px}'
      + '.bd-scta__btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}'
      + '.bd-scta__btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:48px;padding:12px 28px;border-radius:50px;font-size:1rem;font-weight:700;text-decoration:none;transition:all .2s}'
      + '.bd-scta__btn--tel{background:#6B4226;color:#fff}'
      + '.bd-scta__btn--tel:hover{background:#5a3720;color:#fff}'
      + '.bd-scta__btn--naver{background:#fff;color:#6B4226;border:2px solid #C8A97E}'
      + '.bd-scta__btn--naver:hover{background:#C8A97E;color:#fff}'
      + '.bd-scta-bar{display:none}'
      + '@media(max-width:768px){'
      +   '.bd-scta-bar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:9990;background:#fff;border-top:1px solid #e8e0d6;box-shadow:0 -4px 16px rgba(0,0,0,.08);padding:10px 12px calc(10px + env(safe-area-inset-bottom));gap:10px}'
      +   '.bd-scta-bar__btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;min-height:48px;border-radius:12px;font-size:.95rem;font-weight:700;text-decoration:none}'
      +   '.bd-scta-bar__btn--tel{background:#6B4226;color:#fff}'
      +   '.bd-scta-bar__btn--naver{background:#fff;color:#6B4226;border:2px solid #C8A97E}'
      +   'body.bd-scta-pad{padding-bottom:76px}'
      + '}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  function render() {
    injectStyles();

    // 1) 본문 하단 CTA 카드 — <main> 끝, 없으면 footer 앞, 그것도 없으면 body 끝
    var wrap = document.createElement('div');
    wrap.className = 'bd-scta';
    var card = document.createElement('div');
    card.className = 'bd-scta__card';

    var geo = document.createElement('div');
    geo.className = 'bd-scta__geo';
    geo.id = 'bdSctaGeo';
    geo.textContent = '천안·아산에서 보고 계시다면 — 서울비디치과가 가까이 있습니다';
    card.appendChild(geo);

    var title = document.createElement('p');
    title.className = 'bd-scta__title';
    title.textContent = '읽고 계신 내용, 직접 상담받아보세요';
    card.appendChild(title);

    var sub = document.createElement('p');
    sub.className = 'bd-scta__sub';
    sub.textContent = '서울비디치과 · 365일 진료 · 천안 불당동';
    card.appendChild(sub);

    var btns = document.createElement('div');
    btns.className = 'bd-scta__btns';
    buildButtons('bd-scta').forEach(function (b) { btns.appendChild(b); });
    card.appendChild(btns);
    wrap.appendChild(card);

    var main = document.querySelector('main');
    var footer = document.querySelector('footer');
    if (main) main.appendChild(wrap);
    else if (footer && footer.parentNode) footer.parentNode.insertBefore(wrap, footer);
    else document.body.appendChild(wrap);

    // 2) 모바일 하단 고정 바 (CSS 미디어쿼리로 모바일에서만 표시)
    var bar = document.createElement('div');
    bar.className = 'bd-scta-bar';
    buildButtons('bd-scta-bar').forEach(function (b) { bar.appendChild(b); });
    document.body.appendChild(bar);
    document.body.classList.add('bd-scta-pad');

    // 3) 지역 감지 — 실패해도 CTA는 그대로 (배너만 생략)
    try {
      fetch('/api/geo', { credentials: 'omit' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (d && d.local) {
            geoLocal = true;
            geoArea = d.area || '';
            geo.classList.add('show');
          }
        })
        .catch(function () { /* silent */ });
    } catch (e) { /* silent */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
