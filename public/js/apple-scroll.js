/**
 * 서울비디치과 Apple-Style Scroll Animations
 * 
 * Apple의 스크롤 기반 인터랙션 구현:
 * 1. Scroll Reveal - 스크롤 시 요소 등장
 * 2. Parallax - 배경 패럴랙스 효과
 * 3. Sticky Sections - 스티키 섹션 애니메이션
 * 4. Progress Tracking - 스크롤 진행률 표시
 * 5. Counter Animation - 숫자 카운트업
 */

(function() {
  'use strict';
  
  // ============================================
  // 1. SCROLL REVEAL - Intersection Observer
  // ============================================
  
  const revealElements = document.querySelectorAll('.apple-reveal, .apple-reveal-scale, .apple-reveal-left, .apple-reveal-right, .apple-stagger');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // 한 번 나타나면 더 이상 관찰하지 않음
        // revealObserver.unobserve(entry.target);
      } else {
        // 다시 숨기려면 아래 주석 해제
        // entry.target.classList.remove('revealed');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  });
  
  revealElements.forEach(el => revealObserver.observe(el));
  
  // ============================================
  // 2. PARALLAX EFFECT
  // ============================================
  
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  function handleParallax() {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const offset = (centerY - viewportCenter) * speed;
      
      el.style.transform = `translateY(${offset}px)`;
    });
  }
  
  // Throttle parallax for performance
  let parallaxTicking = false;
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
      requestAnimationFrame(() => {
        handleParallax();
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  }, { passive: true });
  
  // ============================================
  // 3. STICKY SECTION ANIMATION
  // ============================================
  
  const stickyContainers = document.querySelectorAll('.apple-sticky-container');
  
  stickyContainers.forEach(container => {
    const content = container.querySelector('.apple-sticky-content');
    const media = container.querySelector('.apple-sticky-media');
    const textElements = container.querySelectorAll('[data-sticky-progress]');
    
    if (!content) return;
    
    function handleStickyScroll() {
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // 스크롤 진행률 (0 ~ 1)
      const scrollProgress = Math.max(0, Math.min(1, 
        (-rect.top) / (containerHeight - viewportHeight)
      ));
      
      // CSS 변수로 진행률 전달
      container.style.setProperty('--scroll-progress', scrollProgress);
      
      // 미디어 요소 스케일/투명도 애니메이션
      if (media) {
        const scale = 0.8 + (scrollProgress * 0.2);
        const opacity = 0.5 + (scrollProgress * 0.5);
        media.style.transform = `scale(${scale})`;
        media.style.opacity = opacity;
      }
      
      // 텍스트 요소 순차 등장
      textElements.forEach((el, index) => {
        const progressStart = index * 0.25;
        const progressEnd = progressStart + 0.25;
        const elProgress = Math.max(0, Math.min(1, 
          (scrollProgress - progressStart) / (progressEnd - progressStart)
        ));
        
        el.style.opacity = elProgress;
        el.style.transform = `translateY(${40 * (1 - elProgress)}px)`;
      });
    }
    
    window.addEventListener('scroll', handleStickyScroll, { passive: true });
    handleStickyScroll(); // 초기 실행
  });
  
  // ============================================
  // 4. NAVIGATION DOTS (Section Indicator)
  // ============================================
  
  const navDotsContainer = document.querySelector('.apple-nav-dots');
  const sections = document.querySelectorAll('.apple-section[id]');
  
  if (navDotsContainer && sections.length > 0) {
    // 네비게이션 닷 생성
    sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'apple-nav-dot';
      dot.setAttribute('aria-label', `섹션 ${index + 1}로 이동`);
      dot.dataset.target = section.id;
      
      dot.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth' });
      });
      
      navDotsContainer.appendChild(dot);
    });
    
    // 현재 섹션 활성화
    const dots = navDotsContainer.querySelectorAll('.apple-nav-dot');
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetId = entry.target.id;
          dots.forEach(dot => {
            dot.classList.toggle('active', dot.dataset.target === targetId);
          });
        }
      });
    }, {
      threshold: 0.5
    });
    
    sections.forEach(section => sectionObserver.observe(section));
  }
  
  // ============================================
  // 5. COUNTER ANIMATION (숫자 카운트업)
  // ============================================
  
  const counters = document.querySelectorAll('[data-count]');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });
  
  counters.forEach(counter => counterObserver.observe(counter));
  
  function animateCounter(element) {
    const target = parseFloat(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const duration = parseInt(element.dataset.duration) || 2000;
    const decimal = parseInt(element.dataset.decimal) || 0;
    
    let startTime = null;
    const startValue = 0;
    
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }
    
    function updateCounter(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = startValue + (target - startValue) * easedProgress;
      
      element.textContent = currentValue.toFixed(decimal) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }
    
    requestAnimationFrame(updateCounter);
  }
  
  // ============================================
  // 6. SCROLL PROGRESS BAR
  // ============================================
  
  const progressBar = document.querySelector('.apple-scroll-progress');
  
  if (progressBar) {
    function updateProgressBar() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
    
    window.addEventListener('scroll', updateProgressBar, { passive: true });
    updateProgressBar();
  }
  
  // ============================================
  // 7. SMOOTH ANCHOR LINKS
  // ============================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // ============================================
  // 8. HEADER HIDE ON SCROLL DOWN
  // ============================================
  
  const header = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;
  let headerHidden = false;
  
  if (header) {
    function handleHeaderScroll() {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      
      // 100px 이상 스크롤 시 헤더 숨김
      if (scrollDelta > 0 && currentScrollY > 100 && !headerHidden) {
        header.style.transform = 'translateY(-100%)';
        headerHidden = true;
      } else if (scrollDelta < -10 || currentScrollY < 100) {
        header.style.transform = 'translateY(0)';
        headerHidden = false;
      }
      
      lastScrollY = currentScrollY;
    }
    
    // 스크롤 다운 시 헤더 숨김 기능 (옵션)
    // window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    
    // 대신 배경 투명도 조절
    function handleHeaderOpacity() {
      const scrollY = window.scrollY;
      const opacity = Math.min(scrollY / 100, 1);
      header.style.background = `rgba(0, 0, 0, ${0.5 + opacity * 0.4})`;
      header.style.backdropFilter = `blur(${10 + opacity * 10}px)`;
    }
    
    window.addEventListener('scroll', handleHeaderOpacity, { passive: true });
    handleHeaderOpacity();
  }
  
  // ============================================
  // 9. VIDEO LAZY LOADING
  // ============================================
  
  const lazyVideos = document.querySelectorAll('video[data-src]');
  
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        video.src = video.dataset.src;
        video.load();
        videoObserver.unobserve(video);
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '200px'
  });
  
  lazyVideos.forEach(video => videoObserver.observe(video));
  
  // ============================================
  // 10. TILT EFFECT ON CARDS (Optional)
  // ============================================
  
  const tiltCards = document.querySelectorAll('[data-tilt]');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
  
  // ============================================
  // 11. INITIALIZE ON DOM READY
  // ============================================
  
  function init() {
    // 페이지 로드 완료 후 body에 클래스 추가
    document.body.classList.add('apple-loaded');
    
    // 초기 스크롤 위치에서 visible 요소 처리
    setTimeout(() => {
      revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add('revealed');
        }
      });
    }, 100);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // ============================================
  // 12. PERFORMANCE - Debounce/Throttle
  // ============================================
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Export for external use
  window.AppleScroll = {
    debounce,
    throttle,
    animateCounter
  };
  
})();
