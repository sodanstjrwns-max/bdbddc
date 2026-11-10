/** Consultation and journey measurement v2, 2026-11-11 (v1: 2026-09-21).
 * One delegated owner for click intent; generate_lead only after a saved form response.
 * No form fields, appointment identifiers, phone numbers or symptom text are sent.
 * Pageviews remain owned by the GA config in the page head, which also tags every
 * event with page_type / treatment_topic / page_lang (scripts/ga-context.cjs).
 *
 * v2 adds, all without personal data:
 *  - visitor_area user property (Cheonan / Asan / Chungnam / outside), from /api/geo
 *  - reservation funnel: reservation_view -> reservation_form_start ->
 *    reservation_submit_attempt -> generate_lead (plus reservation_submit_error)
 *  - journey signals: nav_click (to treatment / doctor / pricing / cases pages),
 *    section_view (summary, cost, price table, doctors), video_play, faq_open
 *  - consultation_cta_view once per page instead of once per button position
 *  - passive events stop 25 minutes after load, so a tab left open does not start
 *    a new session that has no page view
 */
(function () {
  'use strict';
  if (window.bdConversions) return;
  var path = location.pathname;
  if (/^\/(admin|auth|report)(\/|$)/.test(path)) return;
  var live = location.hostname === 'bdbddc.com';
  var debug = !live && /[?&]bd_debug=1/.test(location.search);
  var classify = typeof window.bdClassify === 'function' ? window.bdClassify : function () { return { type: 'other', topic: 'none', lang: 'ko' }; };
  var page = window.bdPage || classify(path);
  var pageType = page.type;
  var loadedAt = Date.now();
  var PASSIVE_WINDOW = 25 * 60 * 1000;
  var sent = Object.create(null);
  var once = Object.create(null);
  var lastIntent = { name: '', at: 0 };

  function emit(name, extra, after) {
    if (debug) { (window.bdEventLog = window.bdEventLog || []).push([name, extra || {}]); }
    if (!live) { if (after) after(); return; }
    // The live GTM/connected-tag configuration does not reliably route the default group.
    // Explicit destinations preserve the two existing properties without another config/pageview.
    var data = Object.assign({ send_to: ['G-LM9VKJSB9F', 'G-3NQP355YQM'], page_type: pageType, treatment_topic: page.topic, page_lang: page.lang, page_path: path, measurement_version: '20261111' }, extra || {});
    window.dataLayer = window.dataLayer || [];
    var g = window.gtag || function () { window.dataLayer.push(arguments); };
    if (after) {
      var finished = false, remaining = data.send_to.length;
      function done() { if (finished) return; finished = true; window.clearTimeout(timer); after(); }
      // Never leave a patient waiting if a tag is blocked or its callback is missing.
      var timer = window.setTimeout(done, 700);
      data.send_to.forEach(function (destination) {
        var acknowledged = false;
        try { g('event', name, Object.assign({}, data, { send_to: destination, event_timeout: 600, event_callback: function () {
          if (acknowledged) return; acknowledged = true;
          if (--remaining === 0) done();
        } })); } catch (_) { done(); }
      });
    } else {
      try { g('event', name, data); } catch (_) { /* Measurement must never block navigation. */ }
    }
  }
  // Passive events describe what the page showed, not what the visitor did.
  function passive(name, extra) { if (Date.now() - loadedAt <= PASSIVE_WINDOW) emit(name, extra); }
  function emitOnce(key, name, extra, isPassive) {
    if (once[key]) return;
    once[key] = true;
    (isPassive ? passive : emit)(name, extra);
  }

  function intent(name, placement, after) {
    // Inline legacy handlers and the capture listener see the same click.
    if (lastIntent.name === name && Date.now() - lastIntent.at < 500) { if (after) after(); return; }
    lastIntent = { name: name, at: Date.now() };
    emit(name, { cta_location: placement || 'content' }, after);
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
    if (a.closest('.bd-toc')) return 'toc';
    if (a.closest('header,#siteHeader,#header,nav')) return 'navigation';
    if (a.closest('footer')) return 'footer';
    if (a.closest('aside')) return 'sidebar';
    return 'content';
  }
  // Clicks that move a visitor toward a decision page. Same-page anchors and repeat targets are ignored.
  var NAV_TARGETS = { treatment: 1, treatment_index: 1, doctor: 1, doctor_index: 1, pricing: 1, cases: 1 };
  function navTarget(a) {
    var u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch (_) { return null; }
    if (u.origin !== location.origin || u.pathname === path) return null;
    var target = classify(u.pathname);
    return NAV_TARGETS[target.type] ? target : null;
  }
  function reservationAccepted(id, after) {
    if (typeof id !== 'string' || !/^rsv-\d+-[a-z0-9]+$/.test(id) || sent[id]) { if (after) after(); return false; }
    var key = 'bd_lead_sent:' + id;
    try { if (sessionStorage.getItem(key)) { if (after) after(); return false; } sessionStorage.setItem(key, '1'); } catch (_) { /* in-memory dedup still works */ }
    sent[id] = true;
    // The identifier is used only in this tab, never in analytics payloads.
    emit('generate_lead', { method: 'reservation_form', lead_stage: 'request_saved' }, after);
    if (live && typeof window.fbq === 'function') { try { window.fbq('track', 'Lead', { content_name: 'consultation_request' }); } catch (_) {} }
    return true;
  }
  window.bdConversions = { intent: intent, reservationAccepted: reservationAccepted, version: '20261111' };

  var navigating = false;
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var name = action(a);
    if (name === 'reservation_click' && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !a.getAttribute('download') && (!a.getAttribute('target') || a.getAttribute('target') === '_self')) {
      e.preventDefault();
      if (navigating) return;
      navigating = true;
      var destination = a.href;
      intent(name, placement(a), function () { window.location.assign(destination); });
      return;
    }
    if (name) { intent(name, placement(a)); return; }
    var target = navTarget(a);
    if (target) emit('nav_click', { link_target_type: target.type, link_target_topic: target.topic, cta_location: placement(a) });
  }, true);

  // Coarse visitor area as a user property. The worker reads only Cloudflare's region fields and returns
  // {local, area}; nothing is stored server-side. Cached for a week so later page views carry it from the start.
  function resolveArea() {
    if (page.area && page.area !== 'unknown') return;
    try {
      fetch('/api/geo', { credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d) return;
        var area = d.area || (d.local ? 'chungnam' : 'outside');
        try { localStorage.setItem('bd_area', JSON.stringify({ a: area, t: Date.now() })); } catch (_) {}
        page.area = area;
        if (live) { try { (window.gtag || function () { window.dataLayer.push(arguments); })('set', 'user_properties', { visitor_area: area }); } catch (_) {} }
        if (debug) (window.bdEventLog = window.bdEventLog || []).push(['user_property', { visitor_area: area }]);
      }).catch(function () { /* the area tag is optional */ });
    } catch (_) {}
  }

  function reservationFunnel() {
    var form = document.getElementById('rsvForm');
    if (!form) return;
    emitOnce('rsv:view', 'reservation_view', { funnel_step: 1 });
    form.addEventListener('focusin', function (e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) emitOnce('rsv:start', 'reservation_form_start', { funnel_step: 2 });
    });
    // The browser blocks the submit event while required fields are empty, so the button press is the attempt.
    var attempts = 0, flagged = 0;
    var button = document.getElementById('rsvSubmit');
    if (button) button.addEventListener('click', function () {
      attempts++;
      emit('reservation_submit_attempt', { funnel_step: 3, attempt: attempts });
    }, true);
    function failed(reason) {
      if (!attempts || flagged === attempts) return;
      flagged = attempts;
      emit('reservation_submit_error', { funnel_step: 3, attempt: attempts, error_kind: reason });
    }
    // Only the fact and kind of failure are sent, never the field contents or message text.
    form.addEventListener('invalid', function () { failed('missing_required'); }, true);
    var err = document.getElementById('rsvErr');
    if (err && typeof MutationObserver === 'function') {
      new MutationObserver(function () { if (err.textContent.trim()) failed('rejected'); })
        .observe(err, { childList: true, characterData: true, subtree: true });
    }
  }

  var SECTIONS = [
    ['.tg-glance', 'summary'],
    ['#tg-cost', 'cost'],
    ['#tg-provider', 'doctors'],
    ['[data-bdtube-latest]', 'videos'],
    ['.pn-treatment', 'related_treatment'],
    ['.bd-scta__card', 'closing_contact'],
  ];
  function ready() {
    resolveArea();
    // The page_view on this site is sent by the tag setup without our page tags (checked live 2026-11-11),
    // so one page_context event per load carries page_type / treatment_topic / page_lang for path and funnel reports.
    emitOnce('page_context', 'page_context', {});
    if (pageType === 'reservation') reservationFunnel();

    if (typeof IntersectionObserver === 'function') {
      // A visible call-to-action is an exposure, not a conversion. Counted once per page.
      var ctaObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
          var a = entry.target, name = action(a);
          if (name) emitOnce('cta_view', 'consultation_cta_view', { cta_action: name, cta_location: placement(a) }, true);
          ctaObserver.unobserve(a);
          if (once.cta_view) ctaObserver.disconnect();
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('a[href]').forEach(function (a) { if (action(a)) ctaObserver.observe(a); });

      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var name = entry.target.getAttribute('data-bd-section');
          emitOnce('section:' + name, 'section_view', { section_name: name }, true);
          sectionObserver.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      var watchSections = function () {
        SECTIONS.forEach(function (pair) {
          var el = document.querySelector(pair[0]);
          if (el && !el.getAttribute('data-bd-section')) { el.setAttribute('data-bd-section', pair[1]); sectionObserver.observe(el); }
        });
        // Fee tables are marked up differently per page; the heading text is the stable signal.
        if (!document.querySelector('[data-bd-section="price_table"]')) {
          var heads = document.querySelectorAll('main h2');
          for (var i = 0; i < heads.length; i++) {
            if (/수가표|가격 안내/.test(heads[i].textContent)) {
              var box = heads[i].closest('section') || heads[i];
              box.setAttribute('data-bd-section', 'price_table'); sectionObserver.observe(box); break;
            }
          }
        }
      };
      watchSections();
      window.setTimeout(watchSections, 2500); // blocks injected after load (closing contact card)
    }

    // A click inside a YouTube frame never reaches the page; focus moving into the frame is the signal.
    window.addEventListener('blur', function () {
      window.setTimeout(function () {
        var f = document.activeElement;
        if (!f || f.tagName !== 'IFRAME') return;
        var m = /(?:youtube(?:-nocookie)?\.com\/embed\/)([\w-]{11})/.exec(f.getAttribute('src') || '');
        if (m) emitOnce('video:' + m[1], 'video_play', { video_id: m[1], cta_location: f.closest('[data-bdtube-latest]') ? 'doctor_videos' : 'content' });
      }, 0);
    });

    // Opening an answer is a deliberate read. The question text is not sent, only its position.
    document.addEventListener('toggle', function (e) {
      var d = e.target;
      if (!d || d.tagName !== 'DETAILS' || !d.open || !d.closest('main')) return;
      if (d.closest('[data-bdtube-latest]')) { emitOnce('videos:more', 'section_view', { section_name: 'videos_more' }); return; }
      var all = Array.prototype.slice.call(document.querySelectorAll('main details'));
      emitOnce('faq:' + all.indexOf(d), 'faq_open', { faq_position: all.indexOf(d) + 1 });
    }, true);

    if (!/^(concern|guide|column|blog|encyclopedia)$/.test(pageType)) return;
    var engaged = 0, last = Date.now(), reading = false;
    window.addEventListener('scroll', function () { reading = true; }, { passive: true });
    window.setInterval(function () {
      var now = Date.now();
      if (document.visibilityState === 'visible') engaged += Math.min(now - last, 1500);
      last = now;
      var height = document.documentElement.scrollHeight - window.innerHeight;
      if (!window._bdReadComplete && reading && engaged >= 30000 && (height <= 0 || window.scrollY / height >= 0.75)) {
        window._bdReadComplete = true;
        passive('content_read_complete', { reading_rule: 'visible_30s_scroll_75' });
      }
    }, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
