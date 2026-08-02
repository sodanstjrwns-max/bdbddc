/**
 * bd-tag-loader.js v2.0  (2026-08-02)
 * Amplitude SDK 로더 — "사람이 만질 때만" 로드
 *
 * ── 왜 바꿨나 (실측 근거) ─────────────────────────────────────────────
 * v1.0은 requestIdleCallback(최대 3초)으로 "모든 방문"에서 SDK를 로드했다.
 * 그 결과 크롤러의 렌더링(Googlebot WRS 등)까지 전부 Amplitude MTU로 계산됐다.
 *
 *   · GSC 실제 클릭   : 월 544
 *   · Amplitude MTU  : 월 58,500   → 약 100배 괴리
 *   · 색인 페이지 수  : 187 → 838 증가에 MTU가 정확히 비례 (방문자와 무관)
 *   · 일평균 고유수   : Start Session 1,974.7 / Scroll Depth 812.0 / CTA Click 6
 *     → 하루 2,000 "사용자" 중 버튼을 누른 건 6명(0.3%). 사람이 아니다.
 *   · 초과요금       : $2,598 청구 + 익월 약 $3,100 예정 (MTU 한도 1,000)
 *
 * ── 무엇을 바꿨나 ─────────────────────────────────────────────────────
 * ❶ requestIdleCallback / setTimeout 자동 로드를 완전히 삭제.
 *    → 아무도 만지지 않으면 SDK 자체가 내려오지 않는다 = MTU 0.
 * ❷ 트리거에서 'scroll' 제거. Googlebot WRS는 lazy-load 콘텐츠를 잡으려고
 *    의도적으로 뷰포트를 스크롤한다. 실제로 Scroll Depth가 전체의 41%(812/일).
 *    scroll을 남기면 감소폭이 90%가 아니라 59%에 그치고, 월 약 $1,260(175만원)이
 *    계속 빠져나간다. → pointerdown / keydown / touchstart / click 만 남긴다.
 * ❸ 봇 가드 추가: navigator.webdriver, 알려진 크롤러 UA, 그리고 event.isTrusted.
 *
 * ── 호환성 ────────────────────────────────────────────────────────────
 * - bd-analytics.js는 waitForAmplitude() 폴링으로 대기 → SDK 미로드 시 조용히 무동작
 * - js/analytics.js의 amplitude 사용부는 전부 typeof 가드가 있어 안전
 * - GTM/GA4/Meta Pixel은 이 로더 대상이 아님 (원래 async, 별도 집계)
 * - 트레이드오프: 이탈 직전 무상호작용 방문은 집계되지 않는다. 의도된 것이다.
 *   그 "방문"의 대부분이 크롤러였다는 게 위 숫자의 결론이다.
 */
(function () {
  'use strict';
  if (window._bdAmpLoaderRan) return;
  window._bdAmpLoaderRan = true;

  // ── 봇 가드 ────────────────────────────────────────────────────────
  var BOT_UA = /bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|chrome-lighthouse|googlebot|bingbot|yeti|daum|naver|duckduckbot|baiduspider|yandex|applebot|facebookexternalhit|gptbot|oai-searchbot|chatgpt-user|claudebot|anthropic-ai|perplexitybot|bytespider|amazonbot|ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|screaming frog/i;

  function isBot() {
    try {
      if (navigator.webdriver === true) return true;
      if (BOT_UA.test(navigator.userAgent || '')) return true;
    } catch (e) { /* noop */ }
    return false;
  }

  function loadScript(src, onload) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  function loadAmplitude() {
    if (window._bdAmplitudeInitialized || window._bdAmpLoading) return;
    if (isBot()) return;
    window._bdAmpLoading = true;
    loadScript('https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz', function () {
      loadScript('https://cdn.amplitude.com/libs/plugin-autocapture-browser-0.9.0-min.js.gz', function () {
        try {
          window.amplitude.init('c4e197a17443b1059b402ec0d16fa88f', {
            autocapture: { elementInteractions: false, pageViews: false, sessions: true, formInteractions: false, fileDownloads: false }
          });
          window._bdAmplitudeInitialized = true;
        } catch (e) { /* silent */ }
      });
    });
  }
  window._bdLoadAmplitude = loadAmplitude;

  // ── 사람만 만들 수 있는 신호에서만 로드 ──────────────────────────────
  // ⚠️ 'scroll' 금지: 크롤러 렌더러가 스크롤한다 (실측 812명/일 = 전체의 41%).
  function onGesture(e) {
    if (e && e.isTrusted === false) return;   // 합성 이벤트 차단
    loadAmplitude();
  }
  ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(function (ev) {
    window.addEventListener(ev, onGesture, { once: true, passive: true, capture: true });
  });
})();
