/**
 * Seoul BD Dental — Mission Page Motion
 * GSAP + ScrollTrigger (Calm Confidence)
 * ----------------------------------------
 * Sections:
 *   S01 Hero         .mission-hero
 *   S02 Brand Promise .ms.ms-dark  (Why BD)
 *   S03 Mission/Vision .ms.ms-accent (mv-grid)
 *   S04 Metrics       .ms.ms-dark  (stats-grid)
 *   S05 Core Values   .ms.ms-accent (values)
 *   S06 Principles    .ms.ms-dark  (promise-grid)
 *   S07 Closing       .ms.ms-accent (philosophy)
 *   S08 CTA           .mission-cta
 */

(function () {
  'use strict';

  // ============================================
  // Motion Tokens (Calm Confidence)
  // ============================================
  const M = {
    dur: { xs: 0.35, sm: 0.6, md: 0.9, lg: 1.2, xl: 1.6 },
    ease: { soft: 'power2.out', base: 'power3.out', strong: 'expo.out', inOut: 'power2.inOut' },
    stagger: { tight: 0.04, base: 0.08, loose: 0.14 },
    y: { xs: 12, sm: 20, md: 32, lg: 48 }
  };

  // ============================================
  // Accessibility: prefers-reduced-motion
  // ============================================
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // Responsive helpers
  // ============================================
  function isMobile() { return window.innerWidth < 768; }
  function isTablet() { return window.innerWidth >= 768 && window.innerWidth < 1024; }
  function scale(v) {
    if (isMobile()) return v * 0.6;
    if (isTablet()) return v * 0.8;
    return v;
  }

  // ============================================
  // Wait for GSAP + ScrollTrigger
  // ============================================
  function waitForGSAP(cb) {
    if (window.gsap && window.ScrollTrigger) return cb();
    var attempts = 0;
    var id = setInterval(function () {
      attempts++;
      if (window.gsap && window.ScrollTrigger) { clearInterval(id); cb(); }
      if (attempts > 60) clearInterval(id); // give up after 6s
    }, 100);
  }

  waitForGSAP(function () {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Remove the old CSS reveal system (GSAP takes over)
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.remove('reveal');
      el.style.opacity = '';
      el.style.transform = '';
    });

    // ============================================
    // REDUCED MOTION FALLBACK
    // ============================================
    if (prefersReduced) {
      gsap.set('.mission-hero-content, .bd-mark, .hero-question, .hero-answer, .scroll-indicator,' +
        '.why-text, .bd-visual, .mv-card, .stat-card, .value-foundation, .value-item,' +
        '.values-summary, .promise-card, .philosophy-card, .mission-cta h2, .mission-cta p,' +
        '.cta-buttons, .ms-header, .ms-label, .ms-title, .ms-desc', {
        opacity: 1, y: 0, scale: 1, autoAlpha: 1
      });
      // Simple fade-in only with IntersectionObserver
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            gsap.to(e.target, { opacity: 1, duration: 0.4 });
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('[data-motion-section]').forEach(function (sec) {
        sec.style.opacity = '0';
        io.observe(sec);
      });
      return; // No further GSAP animations
    }

    // ============================================
    // S01 HERO
    // ============================================
    (function initHero() {
      var hero = document.querySelector('.mission-hero');
      if (!hero) return;

      var tl = gsap.timeline({ defaults: { ease: M.ease.base } });

      // BD watermark fade
      tl.from('.bd-mark', {
        opacity: 0, scale: 0.8, duration: M.dur.md, ease: M.ease.strong
      })
      // Line-by-line title reveal
      .from('.hero-question', {
        opacity: 0, y: scale(M.y.md), duration: M.dur.md
      }, '-=0.3')
      .from('.hero-answer', {
        opacity: 0, y: scale(M.y.sm), duration: M.dur.md
      }, '-=0.2')
      // Scroll indicator loop
      .from('.scroll-indicator', {
        opacity: 0, duration: M.dur.sm
      }, '-=0.2');

      // Scroll-linked subtle parallax on hero content
      gsap.to('.mission-hero-content', {
        y: scale(60),
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });

      // Scroll indicator animation (replaces CSS bounce)
      gsap.to('.scroll-indicator', {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: M.ease.inOut
      });
    })();

    // ============================================
    // S02 BRAND PROMISE (Why BD)
    // ============================================
    (function initBrandPromise() {
      var section = document.querySelector('[data-motion-section="brand-promise"]');
      if (!section) return;

      // Header reveal
      var header = section.querySelector('.ms-header');
      if (header) {
        gsap.from(header.children, {
          opacity: 0, y: scale(M.y.sm), duration: M.dur.md,
          stagger: M.stagger.base, ease: M.ease.base,
          scrollTrigger: { trigger: header, start: 'top 80%' }
        });
      }

      // Why text — left side
      gsap.from('.why-text', {
        opacity: 0, x: scale(-40), duration: M.dur.lg, ease: M.ease.base,
        scrollTrigger: { trigger: '.why-grid', start: 'top 75%' }
      });

      // BD visual — right side
      gsap.from('.bd-visual', {
        opacity: 0, x: scale(40), duration: M.dur.lg, ease: M.ease.base,
        scrollTrigger: { trigger: '.why-grid', start: 'top 75%' }
      });

      // BD large letters slide in from opposite sides
      var bdLarge = document.querySelector('.bd-large');
      if (bdLarge) {
        gsap.from(bdLarge, {
          opacity: 0, scale: 0.6, duration: M.dur.lg, ease: M.ease.strong,
          scrollTrigger: { trigger: bdLarge, start: 'top 80%' }
        });
      }

      // BD expand text
      gsap.from('.bd-expand span', {
        opacity: 0, y: scale(M.y.xs), duration: M.dur.md,
        stagger: M.stagger.loose, ease: M.ease.soft,
        scrollTrigger: { trigger: '.bd-expand', start: 'top 85%' }
      });

      // Why-quote reveal
      gsap.from('.why-quote', {
        opacity: 0, x: scale(-20), duration: M.dur.md, ease: M.ease.soft,
        scrollTrigger: { trigger: '.why-quote', start: 'top 85%' }
      });
    })();

    // ============================================
    // S03 MISSION & VISION
    // ============================================
    (function initMissionVision() {
      var section = document.querySelector('[data-motion-section="mission-vision"]');
      if (!section) return;

      // Header
      var header = section.querySelector('.ms-header');
      if (header) {
        gsap.from(header.children, {
          opacity: 0, y: scale(M.y.sm), duration: M.dur.md,
          stagger: M.stagger.base, ease: M.ease.base,
          scrollTrigger: { trigger: header, start: 'top 80%' }
        });
      }

      // Dual panel offset reveal
      var cards = section.querySelectorAll('.mv-card');
      cards.forEach(function (card, i) {
        gsap.from(card, {
          opacity: 0,
          y: scale(M.y.md),
          scale: 0.96,
          duration: M.dur.lg,
          ease: M.ease.base,
          delay: i * 0.15,
          scrollTrigger: { trigger: card, start: 'top 80%' }
        });
      });
    })();

    // ============================================
    // S04 METRICS
    // ============================================
    (function initMetrics() {
      var section = document.querySelector('[data-motion-section="metrics"]');
      if (!section) return;

      // Header
      var header = section.querySelector('.ms-header');
      if (header) {
        gsap.from(header.children, {
          opacity: 0, y: scale(M.y.sm), duration: M.dur.md,
          stagger: M.stagger.base, ease: M.ease.base,
          scrollTrigger: { trigger: header, start: 'top 80%' }
        });
      }

      // Card stagger
      var statCards = section.querySelectorAll('.stat-card');
      gsap.from(statCards, {
        opacity: 0, y: scale(M.y.md), duration: M.dur.md,
        stagger: M.stagger.base, ease: M.ease.base,
        scrollTrigger: { trigger: '.stats-grid', start: 'top 78%' }
      });

      // Count-up animation
      statCards.forEach(function (card) {
        var numEl = card.querySelector('.stat-number');
        if (!numEl) return;

        var targetText = numEl.textContent.trim();
        var targetNum = parseFloat(targetText);
        var isFloat = targetText.includes('.');
        var obj = { val: 0 };

        ScrollTrigger.create({
          trigger: card,
          start: 'top 82%',
          once: true,
          onEnter: function () {
            gsap.to(obj, {
              val: targetNum,
              duration: isFloat ? M.dur.lg : M.dur.xl,
              ease: M.ease.strong,
              onUpdate: function () {
                numEl.textContent = isFloat ? obj.val.toFixed(1) : Math.round(obj.val).toString();
              }
            });
          }
        });
      });

      // Hover lift y -4px (CSS already has hover, enhance with GSAP)
      statCards.forEach(function (card) {
        card.addEventListener('mouseenter', function () {
          gsap.to(card, { y: -4, duration: M.dur.xs, ease: M.ease.soft });
        });
        card.addEventListener('mouseleave', function () {
          gsap.to(card, { y: 0, duration: M.dur.xs, ease: M.ease.soft });
        });
      });
    })();

    // ============================================
    // S05 CORE VALUES
    // ============================================
    (function initValues() {
      var section = document.querySelector('[data-motion-section="values"]');
      if (!section) return;

      // Header
      var header = section.querySelector('.ms-header');
      if (header) {
        gsap.from(header.children, {
          opacity: 0, y: scale(M.y.sm), duration: M.dur.md,
          stagger: M.stagger.base, ease: M.ease.base,
          scrollTrigger: { trigger: header, start: 'top 80%' }
        });
      }

      // Intro paragraph
      var introP = section.querySelector('.ms-header + div');
      if (introP) {
        gsap.from(introP, {
          opacity: 0, y: scale(M.y.sm), duration: M.dur.md, ease: M.ease.base,
          scrollTrigger: { trigger: introP, start: 'top 82%' }
        });
      }

      // Foundation card (skill)
      gsap.from('.value-foundation', {
        opacity: 0, y: scale(M.y.md), scale: 0.95, duration: M.dur.lg, ease: M.ease.base,
        scrollTrigger: { trigger: '.values-flow', start: 'top 75%' }
      });

      // Arrow connector
      gsap.from('.arrow-connector', {
        opacity: 0, scale: 0.5, duration: M.dur.sm, ease: M.ease.soft,
        scrollTrigger: { trigger: '.arrow-connector', start: 'top 82%' }
      });

      // Progressive layer reveal: respect → empathy → care
      var valueItems = section.querySelectorAll('.value-item');
      valueItems.forEach(function (item, i) {
        gsap.from(item, {
          opacity: 0,
          y: scale(M.y.sm),
          duration: M.dur.md,
          delay: i * M.stagger.loose,
          ease: M.ease.base,
          scrollTrigger: { trigger: item, start: 'top 82%' }
        });
      });

      // Values summary
      gsap.from('.values-summary', {
        opacity: 0, y: scale(M.y.sm), duration: M.dur.md, ease: M.ease.base,
        scrollTrigger: { trigger: '.values-summary', start: 'top 82%' }
      });
    })();

    // ============================================
    // S06 PRINCIPLES (6 Promises) — Stagger Cards
    // ============================================
    (function initPrinciples() {
      var section = document.querySelector('[data-motion-section="principles"]');
      if (!section) return;

      // Header
      var header = section.querySelector('.ms-header');
      if (header) {
        gsap.from(header.children, {
          opacity: 0, y: scale(M.y.sm), duration: M.dur.md,
          stagger: M.stagger.base, ease: M.ease.base,
          scrollTrigger: { trigger: header, start: 'top 80%' }
        });
      }

      var promiseCards = section.querySelectorAll('.promise-card');

      if (isMobile()) {
        // Mobile: simple sequential reveals
        promiseCards.forEach(function (card) {
          gsap.from(card, {
            opacity: 0, y: scale(M.y.sm), duration: M.dur.md, ease: M.ease.base,
            scrollTrigger: { trigger: card, start: 'top 85%' }
          });
        });
      } else {
        // Desktop/Tablet: stagger with slight scale
        gsap.from(promiseCards, {
          opacity: 0,
          y: scale(M.y.md),
          scale: 0.97,
          duration: M.dur.md,
          stagger: M.stagger.base,
          ease: M.ease.base,
          scrollTrigger: {
            trigger: '.promise-grid',
            start: 'top 75%'
          }
        });
      }

      // Hover enhancement
      promiseCards.forEach(function (card) {
        card.addEventListener('mouseenter', function () {
          gsap.to(card, { y: -4, duration: M.dur.xs, ease: M.ease.soft });
        });
        card.addEventListener('mouseleave', function () {
          gsap.to(card, { y: 0, duration: M.dur.xs, ease: M.ease.soft });
        });
      });
    })();

    // ============================================
    // S07 CLOSING (Philosophy Quote)
    // ============================================
    (function initClosing() {
      var section = document.querySelector('[data-motion-section="closing"]');
      if (!section) return;

      var card = section.querySelector('.philosophy-card');
      if (!card) return;

      // Card reveal
      gsap.from(card, {
        opacity: 0, y: scale(M.y.md), scale: 0.97, duration: M.dur.xl,
        ease: M.ease.base,
        scrollTrigger: { trigger: card, start: 'top 78%' }
      });

      // Quote text reveal (clip-path mask effect)
      var quote = card.querySelector('.philosophy-quote');
      if (quote) {
        gsap.from(quote, {
          opacity: 0,
          y: scale(M.y.sm),
          duration: M.dur.xl,
          ease: M.ease.base,
          scrollTrigger: { trigger: quote, start: 'top 82%' }
        });

        // Emphasize key words (em tags) via weight/opacity
        var ems = quote.querySelectorAll('em');
        ems.forEach(function (em, i) {
          gsap.from(em, {
            opacity: 0.3,
            duration: M.dur.lg,
            delay: 0.3 + i * 0.2,
            ease: M.ease.soft,
            scrollTrigger: { trigger: quote, start: 'top 80%' }
          });
        });
      }

      // Author
      var author = card.querySelector('.philosophy-author');
      if (author) {
        gsap.from(author, {
          opacity: 0, y: scale(M.y.xs), duration: M.dur.md,
          delay: 0.4, ease: M.ease.soft,
          scrollTrigger: { trigger: author, start: 'top 88%' }
        });
      }
    })();

    // ============================================
    // S08 CTA
    // ============================================
    (function initCTA() {
      var section = document.querySelector('[data-motion-section="cta"]');
      if (!section) return;

      // Background subtle fade
      gsap.from(section, {
        opacity: 0.7, duration: M.dur.lg, ease: M.ease.soft,
        scrollTrigger: { trigger: section, start: 'top 85%' }
      });

      // Text rise
      var h2 = section.querySelector('h2');
      if (h2) {
        gsap.from(h2, {
          opacity: 0, y: scale(M.y.sm), duration: M.dur.md, ease: M.ease.base,
          scrollTrigger: { trigger: h2, start: 'top 85%' }
        });
      }

      var p = section.querySelector('p');
      if (p) {
        gsap.from(p, {
          opacity: 0, y: scale(M.y.xs), duration: M.dur.md, delay: 0.1,
          ease: M.ease.base,
          scrollTrigger: { trigger: p, start: 'top 88%' }
        });
      }

      // Buttons
      var btns = section.querySelectorAll('.cta-buttons a');
      gsap.from(btns, {
        opacity: 0, y: scale(M.y.xs), duration: M.dur.sm,
        stagger: M.stagger.base, ease: M.ease.base,
        scrollTrigger: { trigger: '.cta-buttons', start: 'top 88%' }
      });

      // Button hover lift y -2px
      btns.forEach(function (btn) {
        btn.addEventListener('mouseenter', function () {
          gsap.to(btn, { y: -2, duration: M.dur.xs, ease: M.ease.soft });
        });
        btn.addEventListener('mouseleave', function () {
          gsap.to(btn, { y: 0, duration: M.dur.xs, ease: M.ease.soft });
        });
      });
    })();

    // ============================================
    // ScrollTrigger refresh on load (web-font settle)
    // ============================================
    window.addEventListener('load', function () {
      setTimeout(function () {
        ScrollTrigger.refresh();
      }, 300);
    });

    // Refresh on resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    });
  });
})();
