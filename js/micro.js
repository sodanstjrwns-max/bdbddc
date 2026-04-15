/**
 * 서울비디치과 Micro-Interactions & Scroll Animations v2.0
 * =========================================================
 * v1.0 — 스크롤 Reveal, 카운트업, GNB 강화
 * v2.0 — 후기 스태거, 마우스 글로우, 히어로 효과 추가
 * =========================================================
 */

(function() {
  'use strict';

  // ─── 1. 스크롤 Reveal 자동 적용 ───
  function initScrollReveal() {
    var selectors = [
      '.section-header',
      '.section-badge',
      '.treatment-card',
      '.treatment-grid',
      '.why-card',
      '.why-hero-card',
      '.philosophy-card',
      '.doctor-card-v2',
      '.doctors-grid',
      '.review-card',
      '.type-card',
      '.floor-item',
      '.video-stat',
      '.video-wrapper',
      '.patient-concerns',
      '.philosophy-quote',
      '.features-banner',
      '.hero-cta-group',
      '.hero-trust-row',
      '.faq-category',
      '.concern-item',
      '.info-card',
      '.step-card',
      '.case-card',
      '.price-table',
      '.cta-section',
      '.process-step',
      // 시설 매거진
      '.fac-mag-stat',
      '.fac-mag-card',
      // 공통
      '.section > .container > *',
    ];

    var elements = document.querySelectorAll(selectors.join(','));

    elements.forEach(function(el) {
      if (el.classList.contains('mi-reveal')) return;
      if (el.closest('.hero')) return;
      if (el.closest('.site-header') || el.closest('.mobile-nav')) return;
      if (el.closest('.site-footer') || el.closest('footer')) return;
      if (el.classList.contains('animate-fade-in-up') || el.classList.contains('animate-fade-in')) return;
      el.classList.add('mi-reveal');
    });

    // 그리드 스태거 딜레이
    var grids = document.querySelectorAll(
      '.treatment-grid, .why-grid, .philosophy-cards, .doctors-grid, .reviews-grid, .type-grid, .concerns-grid, .video-stats, .floor-stack'
    );

    grids.forEach(function(grid) {
      var children = grid.children;
      for (var i = 0; i < children.length && i < 6; i++) {
        if (children[i].classList.contains('mi-reveal')) {
          children[i].classList.add('mi-delay-' + (i + 1));
        }
      }
    });

    // IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.mi-reveal').forEach(function(el) { el.classList.add('mi-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('mi-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.08
    });

    document.querySelectorAll('.mi-reveal').forEach(function(el) {
      observer.observe(el);
    });
  }

  // ─── 2. 숫자 카운트업 (v2: innerHTML 보존) ───
  function initCountUp() {
    var statNumbers = document.querySelectorAll(
      '.video-stat-number, .stat-number, .why-card-stat .num, .fac-mag-stat-num'
    );

    if (!statNumbers.length) return;

    var countObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.dataset.miCounted) {
          entry.target.dataset.miCounted = 'true';
          animateNumber(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach(function(el) {
      countObserver.observe(el);
    });
  }

  function animateNumber(el) {
    // innerHTML 기반 — <span> 태그 보존
    var html = el.innerHTML;
    var textOnly = el.textContent.trim();

    // "1~5" 같은 범위 숫자는 스킵
    if (textOnly.match(/[~\-\/]/)) return;
    // "1:1" 같은 비율 숫자는 스킵
    if (textOnly.match(/^\d+:\d+$/)) return;

    var match = textOnly.match(/^(\d[\d,]*)/);
    if (!match) return;

    var numStr = match[1].replace(/,/g, '');
    var target = parseInt(numStr, 10);
    if (isNaN(target) || target === 0) return;

    // innerHTML에서 숫자 부분의 위치 찾기
    var numInHtml = html.indexOf(match[1]);
    if (numInHtml === -1) return;

    var beforeNum = html.substring(0, numInHtml);
    var afterNum = html.substring(numInHtml + match[1].length);

    var duration = target >= 100 ? 1800 : 1200;
    var start = performance.now();

    function update(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      var current = Math.floor(eased * target);

      el.innerHTML = beforeNum + (target >= 1000 ? current.toLocaleString() : current) + afterNum;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.innerHTML = html; // 원래 HTML 복원
      }
    }

    el.innerHTML = beforeNum + '0' + afterNum;
    requestAnimationFrame(update);
  }

  // ─── 3. GNB 스크롤 강화 ───
  function enhanceHeader() {
    var header = document.getElementById('header') || document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var y = window.scrollY;
          if (y > 100) {
            header.style.boxShadow = '0 2px 20px rgba(107,66,38,' + Math.min(0.08, y / 5000) + ')';
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─── 4. 맨위로 버튼 ───
  function enhanceScrollTop() {
    var btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ═══════════════════════════════════════════
  //  v2.0 신규 기능
  // ═══════════════════════════════════════════

  // ─── 5. 후기 카드 스태거 등장 ───
  function initReviewStagger() {
    var reviewsGrid = document.querySelector('.reviews-grid');
    if (!reviewsGrid) return;

    var cards = reviewsGrid.querySelectorAll('.review-card');
    cards.forEach(function(card, i) {
      card.style.transitionDelay = (i * 120) + 'ms';
    });
  }

  // ─── 6. 마우스 글로우 효과 ───
  function initMouseGlow() {
    // 카드에 마우스 따라다니는 은은한 빛
    var glowTargets = document.querySelectorAll(
      '.treatment-card, .why-card, .philosophy-card, .type-card, .review-card, .why-hero-card'
    );

    if (!glowTargets.length) return;
    // 모바일은 스킵
    if (window.matchMedia('(hover: none)').matches) return;

    glowTargets.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--glow-x', x + 'px');
        card.style.setProperty('--glow-y', y + 'px');
      });
    });
  }

  // ─── 7. 히어로 텍스트 순차 페이드 효과 ───
  function initHeroEntrance() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    // 히어로 내부 reveal 요소들 순차 등장
    var reveals = hero.querySelectorAll('.reveal');
    if (!reveals.length) return;

    reveals.forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';

      setTimeout(function() {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + (i * 150));
    });
  }

  // ─── 8. 히어로 CTA 버튼 호버 빛 효과 ───
  function initCtaShine() {
    var ctaBtns = document.querySelectorAll('.hero-cta-group .btn, .btn-primary.btn-lg');
    if (!ctaBtns.length) return;
    if (window.matchMedia('(hover: none)').matches) return;

    ctaBtns.forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        btn.style.setProperty('--shine-x', x + '%');
      });
    });
  }

  // ─── 9. 스크롤 프로그레스 인디케이터 (상단 바) ───
  function initScrollProgress() {
    // 메인 페이지에서만
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;

    var bar = document.createElement('div');
    bar.className = 'mi-scroll-progress';
    document.body.appendChild(bar);

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var scrollTop = window.scrollY;
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var progress = docHeight > 0 ? (scrollTop / docHeight * 100) : 0;
          bar.style.width = progress + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ─── 10. 초기화 ───
  function init() {
    setTimeout(function() {
      // v1.0
      initScrollReveal();
      initCountUp();
      enhanceHeader();
      enhanceScrollTop();
      // v2.0
      initReviewStagger();
      initMouseGlow();
      initHeroEntrance();
      initCtaShine();
      initScrollProgress();
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
