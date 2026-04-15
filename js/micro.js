/**
 * 서울비디치과 Micro-Interactions & Scroll Animations v1.0
 * =========================================================
 * - 스크롤 Reveal 자동 적용 (섹션, 카드, 그리드 아이템)
 * - 숫자 카운트업 애니메이션
 * - 프로그레스 바 애니메이션
 * - GNB 스크롤 강화
 * =========================================================
 */

(function() {
  'use strict';

  // ─── 1. 스크롤 Reveal 자동 적용 ───
  function initScrollReveal() {
    // 자동으로 reveal 대상 탐색 (HTML 수정 없이!)
    const selectors = [
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
      // 치료 상세 페이지
      '.info-card',
      '.step-card',
      '.case-card',
      '.price-table',
      '.cta-section',
      '.process-step',
      // 공통 섹션
      '.section > .container > *',
    ];

    const elements = document.querySelectorAll(selectors.join(','));

    elements.forEach(el => {
      // 이미 적용된 요소 스킵
      if (el.classList.contains('mi-reveal')) return;
      // 히어로 내부는 스킵 (이미 보이는 영역)
      if (el.closest('.hero')) return;
      // 헤더/GNB 내부 스킵
      if (el.closest('.site-header') || el.closest('.mobile-nav')) return;
      // footer 내부 스킵
      if (el.closest('.site-footer') || el.closest('footer')) return;
      // 이미 animate 클래스가 있는 요소 스킵
      if (el.classList.contains('animate-fade-in-up') || el.classList.contains('animate-fade-in')) return;

      el.classList.add('mi-reveal');
    });

    // 그리드 아이템에 스태거 딜레이 적용
    const grids = document.querySelectorAll(
      '.treatment-grid, .why-grid, .philosophy-cards, .doctors-grid, .reviews-grid, .type-grid, .concerns-grid, .video-stats, .floor-stack'
    );

    grids.forEach(grid => {
      const children = grid.children;
      for (let i = 0; i < children.length && i < 6; i++) {
        if (children[i].classList.contains('mi-reveal')) {
          children[i].classList.add('mi-delay-' + (i + 1));
        }
      }
    });

    // IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // fallback: 그냥 다 보여줌
      document.querySelectorAll('.mi-reveal').forEach(el => el.classList.add('mi-visible'));
      return;
    }

    const observer = new IntersectionObserver(function(entries) {
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

  // ─── 2. 숫자 카운트업 ───
  function initCountUp() {
    // 이미 있는 숫자 요소 탐색
    const statNumbers = document.querySelectorAll(
      '.video-stat-number, .stat-number, .why-card-stat .num'
    );

    if (!statNumbers.length) return;

    const countObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.dataset.miCounted) {
          entry.target.dataset.miCounted = 'true';
          animateNumber(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function(el) {
      countObserver.observe(el);
    });
  }

  function animateNumber(el) {
    // 텍스트에서 숫자 추출
    var text = el.textContent.trim();
    var match = text.match(/[\d,]+/);
    if (!match) return;

    var numStr = match[0].replace(/,/g, '');
    var target = parseInt(numStr, 10);
    if (isNaN(target) || target === 0) return;

    // 원래 텍스트에서 숫자 부분만 교체할 준비
    var prefix = text.substring(0, text.indexOf(match[0]));
    var suffix = text.substring(text.indexOf(match[0]) + match[0].length);

    var duration = Math.min(2000, Math.max(800, target * 0.5));
    var start = performance.now();

    function update(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      var eased = 1 - Math.pow(1 - progress, 4);
      var current = Math.floor(eased * target);

      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = text; // 원래 텍스트 복원 (소수점, +, 기타 포함)
      }
    }

    el.textContent = prefix + '0' + suffix;
    requestAnimationFrame(update);
  }

  // ─── 3. GNB 스크롤 강화 (기존 보강) ───
  function enhanceHeader() {
    var header = document.getElementById('header') || document.querySelector('.site-header');
    if (!header) return;

    // 이미 initHeader()가 있으므로 추가 효과만
    var lastY = 0;
    var ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var y = window.scrollY;
          // 스크롤 방향 감지 — 아래로 갈수록 그림자 강화
          if (y > 100) {
            header.style.boxShadow = '0 2px 20px rgba(107,66,38,' + Math.min(0.08, y / 5000) + ')';
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─── 4. 맨위로 버튼 부드러운 스크롤 ───
  function enhanceScrollTop() {
    var btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── 5. 초기화 ───
  function init() {
    // DOM 로드 후 약간 딜레이 (기존 스크립트와 충돌 방지)
    setTimeout(function() {
      initScrollReveal();
      initCountUp();
      enhanceHeader();
      enhanceScrollTop();
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
