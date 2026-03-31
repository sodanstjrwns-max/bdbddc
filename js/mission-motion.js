/**
 * Seoul BD Dental — Mission Page Motion
 * GSAP + ScrollTrigger (Calm Confidence)
 * ----------------------------------------
 * IMPORTANT: uses gsap.from() with ScrollTrigger.
 * All elements must be visible by default; gsap.from() sets the
 * "start" state and animates TO the natural CSS state.
 * We add a safety net: 2 s after load, force-show anything still hidden.
 */

(function () {
  'use strict';

  /* ========== Motion Tokens ========== */
  var M = {
    dur: { xs: 0.35, sm: 0.6, md: 0.9, lg: 1.2, xl: 1.6 },
    ease: { soft: 'power2.out', base: 'power3.out', strong: 'expo.out', inOut: 'power2.inOut' },
    stagger: { tight: 0.04, base: 0.08, loose: 0.14 },
    y: { xs: 12, sm: 20, md: 32, lg: 48 }
  };

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isMobile() { return window.innerWidth < 768; }
  function isTablet() { return window.innerWidth >= 768 && window.innerWidth < 1024; }
  function sc(v) {
    if (isMobile()) return v * 0.6;
    if (isTablet()) return v * 0.8;
    return v;
  }

  /* ========== Wait for GSAP ========== */
  function waitForGSAP(cb) {
    if (window.gsap && window.ScrollTrigger) return cb();
    var n = 0;
    var id = setInterval(function () {
      n++;
      if (window.gsap && window.ScrollTrigger) { clearInterval(id); cb(); }
      if (n > 80) clearInterval(id);
    }, 100);
  }

  waitForGSAP(function () {
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    // ---- Remove old .reveal CSS class (GSAP takes over) ----
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.remove('reveal');
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
    });

    // ---- Reduced-motion: just show everything ----
    if (prefersReduced) {
      showAll(gsap);
      return;
    }

    // ============================================
    // Helper: safe gsap.from with generous trigger
    // ============================================
    function revealFrom(targets, vars, triggerEl) {
      if (!targets || (targets.length !== undefined && targets.length === 0)) return;
      var trigger = triggerEl || (targets.length !== undefined ? targets[0] : targets);
      var base = {
        ease: M.ease.base,
        duration: M.dur.md,
        scrollTrigger: {
          trigger: trigger,
          start: 'top 92%',          // ← very generous
          toggleActions: 'play none none none'
        }
      };
      // merge
      for (var k in vars) { base[k] = vars[k]; }
      // override scrollTrigger props if caller set them
      if (vars.scrollTrigger) {
        for (var j in vars.scrollTrigger) {
          base.scrollTrigger[j] = vars.scrollTrigger[j];
        }
      }
      gsap.from(targets, base);
    }

    // ============================================
    // S01 HERO (plays immediately, no scrolltrigger)
    // ============================================
    ;(function () {
      var hero = document.querySelector('.mission-hero');
      if (!hero) return;

      var tl = gsap.timeline({ defaults: { ease: M.ease.base } });
      tl.from('.bd-mark', { opacity: 0, scale: 0.8, duration: M.dur.md, ease: M.ease.strong })
        .from('.hero-question', { opacity: 0, y: sc(M.y.md), duration: M.dur.md }, '-=0.3')
        .from('.hero-answer', { opacity: 0, y: sc(M.y.sm), duration: M.dur.md }, '-=0.2')
        .from('.scroll-indicator', { opacity: 0, duration: M.dur.sm }, '-=0.2');

      // Subtle parallax
      gsap.to('.mission-hero-content', {
        y: sc(60), ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 }
      });

      // Scroll indicator bounce
      gsap.to('.scroll-indicator', {
        y: 10, repeat: -1, yoyo: true, duration: 1.2, ease: M.ease.inOut
      });
    })();

    // ============================================
    // S02 BRAND PROMISE (Why BD)
    // ============================================
    ;(function () {
      var sec = document.querySelector('[data-motion-section="brand-promise"]');
      if (!sec) return;

      var hdr = sec.querySelector('.ms-header');
      if (hdr) {
        revealFrom(hdr.children, {
          opacity: 0, y: sc(M.y.sm), stagger: M.stagger.base
        }, hdr);
      }

      revealFrom('.why-text', { opacity: 0, x: sc(-30), duration: M.dur.lg }, sec.querySelector('.why-grid'));
      revealFrom('.bd-visual', { opacity: 0, x: sc(30), duration: M.dur.lg }, sec.querySelector('.why-grid'));

      var bdL = document.querySelector('.bd-large');
      if (bdL) revealFrom(bdL, { opacity: 0, scale: 0.7, duration: M.dur.lg, ease: M.ease.strong });

      revealFrom('.bd-expand span', { opacity: 0, y: sc(M.y.xs), stagger: M.stagger.loose, ease: M.ease.soft });
      revealFrom('.why-quote', { opacity: 0, x: sc(-16), ease: M.ease.soft });
    })();

    // ============================================
    // S03 MISSION & VISION
    // ============================================
    ;(function () {
      var sec = document.querySelector('[data-motion-section="mission-vision"]');
      if (!sec) return;

      var hdr = sec.querySelector('.ms-header');
      if (hdr) revealFrom(hdr.children, { opacity: 0, y: sc(M.y.sm), stagger: M.stagger.base }, hdr);

      sec.querySelectorAll('.mv-card').forEach(function (card, i) {
        revealFrom(card, { opacity: 0, y: sc(M.y.sm), scale: 0.97, delay: i * 0.12, duration: M.dur.lg });
      });
    })();

    // ============================================
    // S04 METRICS
    // ============================================
    ;(function () {
      var sec = document.querySelector('[data-motion-section="metrics"]');
      if (!sec) return;

      var hdr = sec.querySelector('.ms-header');
      if (hdr) revealFrom(hdr.children, { opacity: 0, y: sc(M.y.sm), stagger: M.stagger.base }, hdr);

      var cards = sec.querySelectorAll('.stat-card');
      revealFrom(cards, { opacity: 0, y: sc(M.y.sm), stagger: M.stagger.base }, sec.querySelector('.stats-grid'));

      // Count-up
      cards.forEach(function (card) {
        var numEl = card.querySelector('.stat-number');
        if (!numEl) return;
        var txt = numEl.textContent.trim();
        var target = parseFloat(txt);
        var isF = txt.indexOf('.') !== -1;
        var obj = { v: 0 };

        ST.create({
          trigger: card, start: 'top 92%', once: true,
          onEnter: function () {
            gsap.to(obj, {
              v: target,
              duration: isF ? M.dur.lg : M.dur.xl,
              ease: M.ease.strong,
              onUpdate: function () {
                numEl.textContent = isF ? obj.v.toFixed(1) : Math.round(obj.v).toString();
              }
            });
          }
        });
      });
    })();

    // ============================================
    // S05 CORE VALUES
    // ============================================
    ;(function () {
      var sec = document.querySelector('[data-motion-section="values"]');
      if (!sec) return;

      var hdr = sec.querySelector('.ms-header');
      if (hdr) revealFrom(hdr.children, { opacity: 0, y: sc(M.y.sm), stagger: M.stagger.base }, hdr);

      // Intro text (direct sibling of header inside ms-container)
      var container = sec.querySelector('.ms-container');
      if (container) {
        var introDiv = container.children[1]; // second child after ms-header
        if (introDiv && !introDiv.classList.contains('values-flow')) {
          revealFrom(introDiv, { opacity: 0, y: sc(M.y.sm) });
        }
      }

      revealFrom('.value-foundation', { opacity: 0, y: sc(M.y.sm), scale: 0.96, duration: M.dur.lg }, sec.querySelector('.values-flow'));
      revealFrom('.arrow-connector', { opacity: 0, scale: 0.5, duration: M.dur.sm, ease: M.ease.soft });

      sec.querySelectorAll('.value-item').forEach(function (item, i) {
        revealFrom(item, { opacity: 0, y: sc(M.y.sm), delay: i * M.stagger.loose });
      });

      revealFrom('.values-summary', { opacity: 0, y: sc(M.y.sm) });
    })();

    // ============================================
    // S06 PRINCIPLES (6 Promises)
    // ============================================
    ;(function () {
      var sec = document.querySelector('[data-motion-section="principles"]');
      if (!sec) return;

      var hdr = sec.querySelector('.ms-header');
      if (hdr) revealFrom(hdr.children, { opacity: 0, y: sc(M.y.sm), stagger: M.stagger.base }, hdr);

      var cards = sec.querySelectorAll('.promise-card');
      if (isMobile()) {
        cards.forEach(function (c) { revealFrom(c, { opacity: 0, y: sc(M.y.sm) }); });
      } else {
        revealFrom(cards, {
          opacity: 0, y: sc(M.y.sm), scale: 0.97, stagger: M.stagger.base
        }, sec.querySelector('.promise-grid'));
      }
    })();

    // ============================================
    // S07 CLOSING (Philosophy Quote)
    // ============================================
    ;(function () {
      var sec = document.querySelector('[data-motion-section="closing"]');
      if (!sec) return;

      var card = sec.querySelector('.philosophy-card');
      if (!card) return;

      revealFrom(card, { opacity: 0, y: sc(M.y.sm), scale: 0.98, duration: M.dur.xl });

      var quote = card.querySelector('.philosophy-quote');
      if (quote) {
        revealFrom(quote, { opacity: 0, y: sc(M.y.xs), duration: M.dur.xl });
        quote.querySelectorAll('em').forEach(function (em, i) {
          revealFrom(em, { opacity: 0.3, duration: M.dur.lg, delay: 0.3 + i * 0.2, ease: M.ease.soft }, quote);
        });
      }

      var author = card.querySelector('.philosophy-author');
      if (author) revealFrom(author, { opacity: 0, y: sc(M.y.xs), delay: 0.3, ease: M.ease.soft });
    })();

    // ============================================
    // S08 CTA
    // ============================================
    ;(function () {
      var sec = document.querySelector('[data-motion-section="cta"]');
      if (!sec) return;

      var h2 = sec.querySelector('h2');
      if (h2) revealFrom(h2, { opacity: 0, y: sc(M.y.sm) });

      var p = sec.querySelector('p');
      if (p) revealFrom(p, { opacity: 0, y: sc(M.y.xs), delay: 0.1 });

      var btns = sec.querySelectorAll('.cta-buttons a');
      if (btns.length) {
        revealFrom(btns, { opacity: 0, y: sc(M.y.xs), stagger: M.stagger.base, duration: M.dur.sm }, sec.querySelector('.cta-buttons'));
      }
    })();

    // ============================================
    // Safety net: 2.5 s after load, show anything still invisible
    // ============================================
    window.addEventListener('load', function () {
      setTimeout(function () {
        ST.refresh();
      }, 300);

      // Failsafe — force visible after 2.5 s
      setTimeout(function () {
        var all = document.querySelectorAll(
          '.ms-header, .ms-label, .ms-title, .ms-desc, .mv-card, .stat-card,' +
          '.why-text, .bd-visual, .bd-large, .bd-expand, .why-quote,' +
          '.value-foundation, .value-item, .values-summary, .arrow-connector,' +
          '.promise-card, .philosophy-card, .philosophy-quote, .philosophy-author,' +
          '.mission-cta h2, .mission-cta p, .cta-buttons, .cta-buttons a'
        );
        all.forEach(function (el) {
          var op = window.getComputedStyle(el).opacity;
          if (parseFloat(op) < 0.1) {
            gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1, clearProps: 'all' });
          }
        });
      }, 2500);
    });

    // Resize → refresh
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { ST.refresh(); }, 200);
    });
  });

  /* ========== Reduced-motion: show everything ========== */
  function showAll(gsap) {
    gsap.set(
      '.mission-hero-content, .bd-mark, .hero-question, .hero-answer, .scroll-indicator,' +
      '.why-text, .bd-visual, .bd-large, .bd-expand, .why-quote,' +
      '.mv-card, .stat-card, .value-foundation, .value-item,' +
      '.values-summary, .arrow-connector, .promise-card,' +
      '.philosophy-card, .philosophy-quote, .philosophy-author,' +
      '.mission-cta h2, .mission-cta p, .cta-buttons,' +
      '.ms-header, .ms-label, .ms-title, .ms-desc',
      { opacity: 1, y: 0, x: 0, scale: 1 }
    );
  }
})();
