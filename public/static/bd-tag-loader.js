/**
 * bd-tag-loader.js v3.0  (2026-09-08)
 * Amplitude 완전 차단 — 킬 스위치
 *
 * ── 왜 ───────────────────────────────────────────────────────────────
 * v2.0(2026-08-02)은 사람 제스처(pointerdown/keydown/touchstart/click)에서만 SDK를
 * 불러오도록 게이트를 걸었지만 2026-09 MTU가 다시 폭주했다.
 * (v1.0 시절 실측: GSC 클릭 월 544 vs Amplitude MTU 월 58,500, 초과요금 $2,598 청구)
 * 사용자 결정(2026-09-08): Amplitude 자체를 끈다. GA4 / GTM / Clarity / Meta Pixel은 그대로.
 *
 * ── 무엇을 ───────────────────────────────────────────────────────────
 * - cdn.amplitude.com SDK 로드 코드 전부 제거. 이 파일이 사이트에서 SDK를 받는 유일한 경로였다.
 * - window._bdAmpLoaderRan = true 는 유지 → js/analytics.js 의 "로더 폴백 주입"이 재실행되지 않는다.
 * - window._bdLoadAmplitude 는 무동작 함수로 남겨 호출부 호환.
 * - bd-analytics.js / bd-smart-cta.js / js/analytics.js 는 전부 typeof window.amplitude 가드가
 *   있어 SDK 미로드 시 조용히 무동작한다 (폴링은 최대 15초 뒤 스스로 끝난다).
 *
 * ── 다시 켜려면 ──────────────────────────────────────────────────────
 * git 에서 v2.0(커밋 1125b041)의 이 파일을 복원한다. 자동 로드(v1.0)로는 절대 되돌리지 말 것.
 *
 * ⚠️ 이 파일은 GTM 컨테이너(GTM-KKVMVZHK) 안에 Amplitude 태그가 있다면 그것까지 막지 못한다.
 *    GTM 쪽은 GTM 에서 따로 일시중지해야 하고, 확실한 차단은 Amplitude 프로젝트 설정에서
 *    API 키를 삭제/교체하는 것이다.
 */
(function () {
  'use strict';
  if (window._bdAmpLoaderRan) return;
  window._bdAmpLoaderRan = true;
  window._bdAmplitudeDisabled = true;
  window._bdLoadAmplitude = function () { /* Amplitude 비활성 (v3.0) */ };
})();
