/**
 * bd-tag-loader.js v1.0
 * Amplitude SDK 지연 로더 — LCP/FCP 개선
 *
 * 기존: <head>에서 Amplitude SDK 2개(~80KB)를 동기 로드 → 렌더 블로킹
 * 개선: requestIdleCallback(최대 3초) 후 비동기 로드 → 초기 렌더에서 완전 제거
 *
 * - bd-analytics.js는 waitForAmplitude() 폴링으로 SDK 준비를 대기하므로 호환
 * - js/analytics.js의 amplitude 사용부는 전부 typeof 가드가 있어 호환
 * - GTM/GA4/Meta Pixel은 원래 async라 이 로더 대상이 아님
 */
(function () {
  'use strict';
  if (window._bdAmpLoaderRan) return;
  window._bdAmpLoaderRan = true;

  function loadScript(src, onload) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  function loadAmplitude() {
    if (window._bdAmplitudeInitialized || window._bdAmpLoading) return;
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

  // 유휴 시간에 로드 (최대 3초 내 보장), 미지원 브라우저는 1.5초 후
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadAmplitude, { timeout: 3000 });
  } else {
    setTimeout(loadAmplitude, 1500);
  }

  // 사용자 인터랙션 발생 시 즉시 로드 (이탈 전 이벤트 유실 최소화)
  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, loadAmplitude, { once: true, passive: true });
  });
})();
