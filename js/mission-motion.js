/**
 * Seoul BD Dental — Mission Page Scroll Motion
 * GSAP 3.12 + ScrollTrigger  ·  "Calm Confidence"
 *
 * STRATEGY (bulletproof):
 *   1. All elements are VISIBLE by default (no CSS hide).
 *   2. Once GSAP loads, we add class "motion-hidden" via gsap.set()
 *      which sets opacity:0 / y:24.
 *   3. ScrollTrigger.batch() watches for viewport entry and
 *      animates TO { opacity:1, y:0 }.
 *   4. If GSAP never loads → everything stays visible.
 *   5. 3 s safety: force everything visible.
 */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- tokens --- */
  var DUR  = { sm: 0.5, md: 0.8, lg: 1.1 };
  var EASE = { base: 'power2.out', strong: 'expo.out' };
  var STAG = 0.07;

  function isMobile() { return window.innerWidth < 768; }
  function sc(v) { return isMobile() ? v * 0.6 : v; }

  /* --- wait for GSAP --- */
  function onGSAP(cb) {
    if (window.gsap && window.ScrollTrigger) return cb();
    var n = 0, id = setInterval(function () {
      if (++n > 60) return clearInterval(id);
      if (window.gsap && window.ScrollTrigger) { clearInterval(id); cb(); }
    }, 100);
  }

  onGSAP(function () {
    var gsap = window.gsap;
    var ST   = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    if (REDUCED) return; // everything stays visible

    // ==================================================
    // Collect every element we want to animate
    // ==================================================
    var targets = document.querySelectorAll([
      // S02 Brand Promise
      '.ms-label', '.ms-title', '.ms-desc',
      '.why-text', '.why-text h3', '.why-text p', '.why-quote',
      '.bd-visual', '.bd-large', '.bd-expand span',
      // S03 Mission & Vision
      '.mv-card',
      // S04 Metrics
      '.stat-card',
      // S05 Core Values
      '.value-foundation', '.arrow-connector', '.value-item', '.values-summary',
      // S06 Principles
      '.promise-card',
      // S07 Closing
      '.philosophy-card', '.philosophy-quote', '.philosophy-author',
      // S08 CTA
      '.mission-cta h2', '.mission-cta p', '.cta-buttons a'
    ].join(','));

    // ==================================================
    // Set initial hidden state via GSAP (not CSS!)
    // → if GSAP never runs, elements stay visible
    // ==================================================
    gsap.set(targets, { opacity: 0, y: sc(24) });

    // ==================================================
    // ScrollTrigger.batch — watches all targets at once
    // ==================================================
    ST.batch(targets, {
      start: 'top 95%',
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, y: 0,
          duration: DUR.md,
          ease: EASE.base,
          stagger: STAG,
          overwrite: true
        });
      },
      // if user scrolls back up then down again — still visible
      onEnterBack: function (batch) {
        gsap.to(batch, {
          opacity: 1, y: 0,
          duration: DUR.sm,
          ease: EASE.base,
          stagger: STAG,
          overwrite: true
        });
      }
    });

    // ==================================================
    // S01 HERO — immediate timeline (no scroll trigger)
    // ==================================================
    ;(function () {
      var hero = document.querySelector('.mission-hero');
      if (!hero) return;

      // hero elements were NOT in the batch, so set them visible first
      var els = hero.querySelectorAll('.bd-mark, .hero-question, .hero-answer, .scroll-indicator');
      gsap.set(els, { opacity: 0, y: sc(20) });

      var tl = gsap.timeline({ defaults: { ease: EASE.base } });
      tl.to('.bd-mark',         { opacity: 1, y: 0, scale: 1, duration: DUR.md })
        .to('.hero-question',   { opacity: 1, y: 0, duration: DUR.md }, '-=0.35')
        .to('.hero-answer',     { opacity: 1, y: 0, duration: DUR.md }, '-=0.25')
        .to('.scroll-indicator',{ opacity: 1, y: 0, duration: DUR.sm }, '-=0.2');

      // subtle parallax
      gsap.to('.mission-hero-content', {
        y: sc(50), ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 }
      });

      // bounce indicator
      gsap.to('.scroll-indicator', { y: 8, repeat: -1, yoyo: true, duration: 1.2, ease: 'power2.inOut' });
    })();

    // ==================================================
    // S04 COUNT-UP  (separate from batch)
    // ==================================================
    document.querySelectorAll('.stat-card').forEach(function (card) {
      var numEl = card.querySelector('.stat-number');
      if (!numEl) return;
      var txt = numEl.textContent.trim();
      var target = parseFloat(txt);
      if (isNaN(target)) return;
      var isF = txt.indexOf('.') !== -1;
      var obj = { v: 0 };
      numEl.textContent = '0';

      ST.create({
        trigger: card, start: 'top 95%', once: true,
        onEnter: function () {
          gsap.to(obj, {
            v: target, duration: DUR.lg, ease: EASE.strong,
            onUpdate: function () {
              numEl.textContent = isF ? obj.v.toFixed(1) : String(Math.round(obj.v));
            }
          });
        }
      });
    });

    // ==================================================
    // S07 Quote emphasis (em glow)
    // ==================================================
    var quoteEms = document.querySelectorAll('.philosophy-quote em');
    if (quoteEms.length) {
      gsap.set(quoteEms, { opacity: 0.3 });
      ST.batch(quoteEms, {
        start: 'top 95%',
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, duration: DUR.lg, ease: EASE.base, stagger: 0.15 });
        }
      });
    }

    // ==================================================
    // SAFETY NET — 3 seconds after load, show everything
    // ==================================================
    window.addEventListener('load', function () {
      setTimeout(function () { ST.refresh(); }, 300);

      setTimeout(function () {
        targets.forEach(function (el) {
          if (parseFloat(getComputedStyle(el).opacity) < 0.5) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.3, overwrite: true });
          }
        });
        // hero too
        document.querySelectorAll('.bd-mark, .hero-question, .hero-answer, .scroll-indicator').forEach(function (el) {
          if (parseFloat(getComputedStyle(el).opacity) < 0.5) {
            gsap.set(el, { opacity: 1, y: 0 });
          }
        });
      }, 3000);
    });

    // resize refresh
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { ST.refresh(); }, 250);
    });
  });
})();
