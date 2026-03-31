/**
 * Seoul BD Dental — Mission Page Scroll Motion v4
 * 
 * STRATEGY: CSS-first, JS-enhanced
 * 
 *   1. CSS class ".will-animate" starts elements at opacity:0 + translateY
 *      (added inline in HTML, NOT by JS — so no race condition)
 *   2. IntersectionObserver adds ".is-visible" → CSS transition shows element
 *   3. GSAP is ONLY used for hero timeline + count-up numbers (bonus)
 *   4. If CSS classes are missing, elements are visible by default
 *   5. If JS fails, noscript/safety ensures visibility
 *
 * NO gsap.set(opacity:0) — elements are NEVER hidden by JS
 */

(function () {
  'use strict';

  // ================================================
  // PART 1: IntersectionObserver for all ".will-animate"
  // This works even if GSAP never loads!
  // ================================================
  var animated = document.querySelectorAll('.will-animate');
  
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px 60px 0px'  // fire 60px before entering viewport
    });

    animated.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: no IntersectionObserver → show everything immediately
    animated.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ================================================
  // SAFETY NET — 4s after load, force everything visible
  // ================================================
  function forceShowAll() {
    document.querySelectorAll('.will-animate').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
  
  if (document.readyState === 'complete') {
    setTimeout(forceShowAll, 4000);
  } else {
    window.addEventListener('load', function () {
      setTimeout(forceShowAll, 4000);
    });
  }

  // ================================================
  // PART 2: GSAP bonus animations (hero + count-up)
  // Only if GSAP is available — completely optional
  // ================================================
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isMobile() { return window.innerWidth < 768; }
  function sc(v) { return isMobile() ? v * 0.6 : v; }

  var DUR  = { sm: 0.5, md: 0.8, lg: 1.1 };
  var EASE = { base: 'power2.out', strong: 'expo.out' };

  function onGSAP(cb) {
    if (window.gsap && window.ScrollTrigger) return cb();
    var n = 0, id = setInterval(function () {
      if (++n > 60) return clearInterval(id);   // give up after 6s
      if (window.gsap && window.ScrollTrigger) { clearInterval(id); cb(); }
    }, 100);
  }

  onGSAP(function () {
    if (REDUCED) return;

    var gsap = window.gsap;
    var ST   = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    // ============================================
    // HERO TIMELINE — entrance animation
    // ============================================
    (function () {
      var hero = document.querySelector('.mission-hero');
      if (!hero) return;

      var els = hero.querySelectorAll('.bd-mark, .hero-question, .hero-answer, .scroll-indicator');
      gsap.set(els, { opacity: 0, y: sc(20) });

      var tl = gsap.timeline({ defaults: { ease: EASE.base } });
      tl.to('.bd-mark',          { opacity: 1, y: 0, scale: 1, duration: DUR.md })
        .to('.hero-question',    { opacity: 1, y: 0, duration: DUR.md }, '-=0.35')
        .to('.hero-answer',      { opacity: 1, y: 0, duration: DUR.md }, '-=0.25')
        .to('.scroll-indicator', { opacity: 1, y: 0, duration: DUR.sm }, '-=0.2');

      // subtle parallax
      gsap.to('.mission-hero-content', {
        y: sc(50), ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 }
      });

      // bounce indicator
      gsap.to('.scroll-indicator', {
        y: 8, repeat: -1, yoyo: true, duration: 1.2, ease: 'power2.inOut'
      });
    })();

    // ============================================
    // COUNT-UP for stat numbers (bonus visual)
    // ============================================
    document.querySelectorAll('.stat-card').forEach(function (card) {
      var numEl = card.querySelector('.stat-number');
      if (!numEl) return;

      var txt = numEl.textContent.trim();
      var target = parseFloat(txt);
      if (isNaN(target)) return;

      var isF = txt.indexOf('.') !== -1;
      var obj = { v: 0 };
      // Don't set text to 0 here — let IntersectionObserver handle visibility
      // Only start count-up when card becomes visible

      var countDone = false;
      
      ST.create({
        trigger: card,
        start: 'top 95%',
        once: true,
        onEnter: function () {
          if (countDone) return;
          countDone = true;
          numEl.textContent = '0';
          gsap.to(obj, {
            v: target,
            duration: DUR.lg,
            ease: EASE.strong,
            onUpdate: function () {
              numEl.textContent = isF ? obj.v.toFixed(1) : String(Math.round(obj.v));
            },
            onComplete: function () {
              // Ensure final value is exact
              numEl.textContent = txt;
            }
          });
        }
      });
    });

    // ============================================
    // QUOTE emphasis glow (bonus)
    // ============================================
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

    // Refresh on resize
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { ST.refresh(); }, 250);
    });
  });
})();
