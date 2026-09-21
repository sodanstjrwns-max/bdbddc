/** Consultation measurement v1, 2026-09-21.
 * One delegated owner for click intent; generate_lead only after saved form response.
 * No form fields, appointment identifiers, phone numbers or inferred residence sent.
 * Pageviews remain owned by the existing two GA configurations.
 */
(function () {
  'use strict';
  if (window.bdConversions) return;
  var path = location.pathname;
  if (/^\/(admin|auth|report)(\/|$)/.test(path)) return;
  var live = location.hostname === 'bdbddc.com';
  var pageType = /^\/concerns\//.test(path) ? 'concern' : /^\/guide/.test(path) ? 'guide' : /^\/(blog|column)\//.test(path) ? 'content' : /^\/area\//.test(path) ? 'area' : /^\/(en\/|jp\/)?reservation/.test(path) ? 'reservation' : 'other';
  var sent = Object.create(null);
  var lastIntent = { name: '', at: 0 };
  function emit(name, extra) {
    if (!live) return;
    var data = Object.assign({ page_type: pageType, page_path: path, measurement_version: '20260921' }, extra || {});
    window.dataLayer = window.dataLayer || [];
    var g = window.gtag || function () { window.dataLayer.push(arguments); };
    try { g('event', name, data); } catch (_) { /* Measurement must never block a saved request or navigation. */ }
  }
  function intent(name, placement) {
    // Inline legacy handlers and the capture listener see the same click.
    if (lastIntent.name === name && Date.now() - lastIntent.at < 500) return;
    lastIntent = { name: name, at: Date.now() };
    emit(name, { cta_location: placement || 'content' });
    if (live && typeof window.fbq === 'function' && /^(phone_call_click|kakao_click)$/.test(name)) {
      try { window.fbq('track', 'Contact', { content_name: name === 'phone_call_click' ? 'phone_call' : 'kakao_talk' }); } catch (_) {}
    }
  }
  function action(a) {
    var u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch (_) { return ''; }
    if (u.protocol === 'tel:') return 'phone_call_click';
    if (u.hostname === 'pf.kakao.com' || u.hostname === 'open.kakao.com') return 'kakao_click';
    if (u.hostname === 'booking.naver.com' || (u.hostname === 'naver.me' && u.pathname === '/5yPnKmqQ') || (/(^|\.)place\.naver\.com$/.test(u.hostname) && /\/booking(?:\/|$)/.test(u.pathname))) return 'naver_booking_click';
    if (u.origin === location.origin && /^\/(?:en\/|jp\/)?reservation(?:\.html|\/)?$/.test(u.pathname)) return 'reservation_click';
    return '';
  }
  function placement(a) {
    var owner = a.closest('[data-cta-location]');
    if (owner) return owner.getAttribute('data-cta-location');
    if (a.closest('.bd-scta-bar,.mobile-bottom-cta,.floating-cta')) return 'floating';
    if (a.closest('header,#siteHeader,#header,nav')) return 'navigation';
    if (a.closest('footer')) return 'footer';
    if (a.closest('aside')) return 'sidebar';
    return 'content';
  }
  function reservationAccepted(id) {
    if (typeof id !== 'string' || !/^rsv-\d+-[a-z0-9]+$/.test(id) || sent[id]) return false;
    var key = 'bd_lead_sent:' + id;
    try { if (sessionStorage.getItem(key)) return false; sessionStorage.setItem(key, '1'); } catch (_) { /* in-memory dedup still works */ }
    sent[id] = true;
    // The identifier is used only in this tab, never in analytics payloads.
    emit('generate_lead', { method: 'reservation_form', lead_stage: 'request_saved' });
    if (live && typeof window.fbq === 'function') { try { window.fbq('track', 'Lead', { content_name: 'consultation_request' }); } catch (_) {} }
    return true;
  }
  window.bdConversions = { intent: intent, reservationAccepted: reservationAccepted, version: '20260921' };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var name = action(a);
    if (name) intent(name, placement(a));
  }, true);
  function ready() {
    if (!live) return;
    // A visible call-to-action is an exposure, not a conversion.
    if (typeof IntersectionObserver === 'function') {
      var viewed = Object.create(null);
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
          var a = entry.target, name = action(a), where = placement(a), key = name + ':' + where;
          if (name && !viewed[key]) { viewed[key] = true; emit('consultation_cta_view', { cta_action: name, cta_location: where }); }
          observer.unobserve(a);
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('a[href]').forEach(function (a) { if (action(a)) observer.observe(a); });
    }
    if (!/^(concern|guide|content)$/.test(pageType)) return;
    var engaged = 0, last = Date.now(), reading = false;
    window.addEventListener('scroll', function () { reading = true; }, { passive: true });
    window.setInterval(function () {
      var now = Date.now();
      if (document.visibilityState === 'visible') engaged += Math.min(now - last, 1500);
      last = now;
      var height = document.documentElement.scrollHeight - window.innerHeight;
      if (!window._bdReadComplete && reading && engaged >= 30000 && (height <= 0 || window.scrollY / height >= 0.75)) {
        window._bdReadComplete = true;
        emit('content_read_complete', { reading_rule: 'visible_30s_scroll_75' });
      }
    }, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
