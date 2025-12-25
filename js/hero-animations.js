/**
 * 서울비디치과 Hero NEXT-LEVEL Animations v3.0 🚀
 * ================================================
 * 2024 최신 트렌드 - 남들이 안 쓰는 미친 효과
 */

(function() {
  'use strict';

  // 프로덕션 환경 감지
  const IS_PRODUCTION = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  const log = IS_PRODUCTION ? () => {} : console.log.bind(console);

  const CONFIG = {
    isMobile: window.innerWidth < 768,
    isTouch: 'ontouchstart' in window,
    particleCount: window.innerWidth < 768 ? 10 : 30,
    trailLength: 15,
    magneticStrength: 0.25
  };

  // ========================================
  // 🎬 초기화
  // ========================================
  document.addEventListener('DOMContentLoaded', () => {
    log('🚀 NEXT-LEVEL Animations Loading...');
    
    initSVGFilters();
    initLiquidMetalInteraction(); // 🫧 Liquid Metal 마우스 인터랙션
    initFilmGrain();
    initParticleSystem();
    initKineticTypography();
    initCursorMagic();
    initCardInteraction();
    initMagneticButtons();
    initCounterAnimation();
    initFloatingShapes();
    initScrollProgress();
    initTypingAnimation();
    initBeforeAfterSlider();
    
    log('✨ All NEXT-LEVEL effects ready!');
  });

  // ========================================
  // 🌊 SVG 필터 (액체 웨이브용)
  // ========================================
  function initSVGFilters() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'svg-filters');
    svg.innerHTML = `
      <defs>
        <filter id="liquid-wave-1">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" seed="1"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="liquid-wave-2">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" seed="2"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }

  // ========================================
  // 🫧 LIQUID METAL 마우스 인터랙션
  // ========================================
  function initLiquidMetalInteraction() {
    if (CONFIG.isMobile || CONFIG.isTouch) return;

    const hero = document.querySelector('.hero');
    const blobs = document.querySelectorAll('.liquid-blob');
    if (!hero || !blobs.length) return;

    let mouseX = 0, mouseY = 0;
    let blobPositions = [];

    // 블롭 초기 위치 저장
    blobs.forEach((blob, i) => {
      const rect = blob.getBoundingClientRect();
      blobPositions[i] = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        originX: 0,
        originY: 0
      };
      blob.classList.add('interactive');
    });

    // 마우스 이동 추적
    hero.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // 애니메이션 루프 - 블롭이 마우스를 피해 움직임
    function animateBlobs() {
      blobs.forEach((blob, i) => {
        const rect = blob.getBoundingClientRect();
        const blobCenterX = rect.left + rect.width / 2;
        const blobCenterY = rect.top + rect.height / 2;
        
        // 마우스와 블롭 사이 거리
        const dx = mouseX - blobCenterX;
        const dy = mouseY - blobCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 영향 범위 (300px 이내)
        const maxDistance = 300;
        
        if (distance < maxDistance) {
          // 마우스가 가까우면 밀려남
          const force = (1 - distance / maxDistance) * 50;
          const angle = Math.atan2(dy, dx);
          
          const moveX = -Math.cos(angle) * force;
          const moveY = -Math.sin(angle) * force;
          
          // 부드러운 이동
          blobPositions[i].x += (moveX - blobPositions[i].originX) * 0.1;
          blobPositions[i].y += (moveY - blobPositions[i].originY) * 0.1;
          blobPositions[i].originX = moveX;
          blobPositions[i].originY = moveY;
          
          blob.style.transform = `translate(${blobPositions[i].x}px, ${blobPositions[i].y}px)`;
        } else {
          // 원래 위치로 복귀
          blobPositions[i].x *= 0.95;
          blobPositions[i].y *= 0.95;
          blobPositions[i].originX *= 0.95;
          blobPositions[i].originY *= 0.95;
          
          if (Math.abs(blobPositions[i].x) > 0.1 || Math.abs(blobPositions[i].y) > 0.1) {
            blob.style.transform = `translate(${blobPositions[i].x}px, ${blobPositions[i].y}px)`;
          }
        }
      });
      
      requestAnimationFrame(animateBlobs);
    }

    animateBlobs();
  }

  // ========================================
  // 🎞️ FILM GRAIN TEXTURE
  // ========================================
  function initFilmGrain() {
    const hero = document.querySelector('.hero');
    if (!hero || CONFIG.isMobile) return;

    const noise = document.createElement('div');
    noise.className = 'hero-noise';
    hero.appendChild(noise);
  }

  // ========================================
  // ✨ 파티클 시스템
  // ========================================
  function initParticleSystem() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let container = hero.querySelector('.hero-particles');
    if (!container) {
      container = document.createElement('div');
      container.className = 'hero-particles';
      container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        z-index: 2;
      `;
      hero.appendChild(container);
    }

    // 파티클 생성
    for (let i = 0; i < CONFIG.particleCount; i++) {
      createParticle(container, i);
    }
  }

  function createParticle(container, index) {
    const particle = document.createElement('div');
    const size = 2 + Math.random() * 4;
    const duration = 10 + Math.random() * 10;
    const delay = Math.random() * duration;
    
    particle.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      bottom: -20px;
      width: ${size}px;
      height: ${size}px;
      background: #C9A962;
      border-radius: 50%;
      opacity: 0;
      box-shadow: 0 0 ${size * 2}px #C9A962, 0 0 ${size * 4}px rgba(201, 169, 98, 0.5);
      animation: particleRise ${duration}s ease-in-out ${delay}s infinite;
    `;
    
    container.appendChild(particle);
  }

  // CSS 애니메이션 추가
  if (!document.getElementById('particle-keyframes')) {
    const style = document.createElement('style');
    style.id = 'particle-keyframes';
    style.textContent = `
      @keyframes particleRise {
        0% {
          transform: translateY(0) translateX(0) scale(0);
          opacity: 0;
        }
        10% {
          opacity: 0.8;
          transform: translateY(-10vh) translateX(10px) scale(1);
        }
        90% {
          opacity: 0.6;
          transform: translateY(-90vh) translateX(-10px) scale(0.8);
        }
        100% {
          transform: translateY(-100vh) translateX(0) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // ⌨️ KINETIC TYPOGRAPHY
  // ========================================
  function initKineticTypography() {
    const title = document.querySelector('.hero .text-display');
    if (!title || title.dataset.kinetic) return;
    title.dataset.kinetic = 'true';

    // 그라디언트 텍스트 처리
    const gradientSpan = title.querySelector('.text-gradient-animated');
    if (gradientSpan) {
      const text = gradientSpan.textContent;
      gradientSpan.innerHTML = '';
      gradientSpan.classList.add('kinetic-text');
      
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${0.8 + i * 0.05}s`;
        gradientSpan.appendChild(span);
      });
    }
  }

  // ========================================
  // 🖱️ 커서 마법
  // ========================================
  function initCursorMagic() {
    if (CONFIG.isTouch || CONFIG.isMobile) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    // 글로우
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    // 트레일
    const trails = [];
    for (let i = 0; i < CONFIG.trailLength; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.cssText = `
        width: ${8 - i * 0.4}px;
        height: ${8 - i * 0.4}px;
        opacity: ${0.8 - i / CONFIG.trailLength * 0.8};
        transition: opacity 0.3s;
      `;
      document.body.appendChild(trail);
      trails.push({ el: trail, x: 0, y: 0 });
    }

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let isActive = false;

    hero.addEventListener('mouseenter', () => {
      isActive = true;
      glow.classList.add('active');
    });

    hero.addEventListener('mouseleave', () => {
      isActive = false;
      glow.classList.remove('active');
    });

    hero.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;

      if (isActive) {
        let px = mouseX, py = mouseY;
        trails.forEach((t, i) => {
          const speed = 0.3 - i * 0.015;
          t.x += (px - t.x) * speed;
          t.y += (py - t.y) * speed;
          t.el.style.left = `${t.x}px`;
          t.el.style.top = `${t.y}px`;
          t.el.style.transform = 'translate(-50%, -50%)';
          t.el.style.opacity = isActive ? (0.8 - i / CONFIG.trailLength * 0.8) : 0;
          px = t.x;
          py = t.y;
        });
      } else {
        trails.forEach(t => t.el.style.opacity = 0);
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ========================================
  // 🃏 카드 3D 인터랙션 + 홀로그래픽
  // ========================================
  function initCardInteraction() {
    if (CONFIG.isTouch) return;

    const cards = document.querySelectorAll('.hero-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        
        const rotateX = (y - cy) / 8;
        const rotateY = (cx - x) / 8;

        this.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateZ(20px)
          scale(1.05)
        `;

        // 홀로그래픽 하이라이트
        const glowX = (x / rect.width) * 100;
        const glowY = (y / rect.height) * 100;
        this.style.setProperty('--glow-x', `${glowX}%`);
        this.style.setProperty('--glow-y', `${glowY}%`);
      });

      card.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }

  // ========================================
  // 🧲 마그네틱 버튼
  // ========================================
  function initMagneticButtons() {
    if (CONFIG.isTouch || CONFIG.isMobile) return;

    const buttons = document.querySelectorAll('.hero-cta .btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        this.style.transform = `
          translate(${x * CONFIG.magneticStrength}px, ${y * CONFIG.magneticStrength}px)
          scale(1.05)
        `;
      });

      btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });

      // 리플 효과
      btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          left: ${e.clientX - rect.left}px;
          top: ${e.clientY - rect.top}px;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ripple 0.6s ease-out forwards;
        `;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });

    // 리플 키프레임
    if (!document.getElementById('ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes ripple {
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ========================================
  // 🔢 카운터 애니메이션 (드라마틱)
  // ========================================
  function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateNumber(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  function animateNumber(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimal = parseInt(el.dataset.decimal) || 0; // 소수점 자리수
    const duration = 2500;
    const start = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function formatNumber(num) {
      if (decimal > 0) {
        return num.toFixed(decimal);
      }
      // 천 단위 콤마 추가 (1000 이상일 때)
      if (num >= 1000) {
        return num.toLocaleString();
      }
      return Math.floor(num);
    }

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = target * easeOut(progress);
      
      el.textContent = formatNumber(value) + suffix;
      el.style.textShadow = `0 0 ${30 + progress * 30}px rgba(201, 169, 98, ${0.5 + progress * 0.5})`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = formatNumber(target) + suffix;
        // 완료 효과
        el.style.transform = 'scale(1.1)';
        el.style.textShadow = '0 0 60px #C9A962, 0 0 100px rgba(201, 169, 98, 0.5)';
        setTimeout(() => {
          el.style.transform = '';
          el.style.textShadow = '0 0 40px rgba(201, 169, 98, 0.8)';
        }, 300);
      }
    }

    requestAnimationFrame(update);
  }

  // ========================================
  // 🔮 플로팅 도형
  // ========================================
  function initFloatingShapes() {
    if (CONFIG.isMobile) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const shapes = [
      { class: 'shape-1', style: 'top: 15%; right: 10%;' },
      { class: 'shape-2', style: 'top: 60%; right: 20%;' },
      { class: 'shape-3', style: 'top: 40%; left: 5%;' }
    ];

    shapes.forEach(s => {
      const el = document.createElement('div');
      el.className = `floating-element ${s.class}`;
      el.style.cssText = s.style;
      hero.appendChild(el);
    });
  }

  // ========================================
  // 📊 스크롤 프로그레스
  // ========================================
  function initScrollProgress() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const bar = document.createElement('div');
    bar.style.cssText = `
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 80px;
      background: rgba(201, 169, 98, 0.2);
      border-radius: 3px;
      overflow: hidden;
      z-index: 10;
    `;

    const fill = document.createElement('div');
    fill.style.cssText = `
      width: 100%;
      height: 0%;
      background: linear-gradient(180deg, #C9A962, #8B5A2B);
      border-radius: 3px;
      transition: height 0.1s;
      box-shadow: 0 0 10px #C9A962;
    `;

    bar.appendChild(fill);
    hero.appendChild(bar);

    window.addEventListener('scroll', () => {
      const percent = Math.min(window.scrollY / hero.offsetHeight * 100, 100);
      fill.style.height = `${percent}%`;
    }, { passive: true });
  }

  // ========================================
  // ⌨️ 타이핑 애니메이션
  // ========================================
  function initTypingAnimation() {
    const typingElements = document.querySelectorAll('.typing-animation');
    
    typingElements.forEach(el => {
      // 애니메이션 완료 후 커서 제거
      el.addEventListener('animationend', (e) => {
        if (e.animationName === 'typing') {
          setTimeout(() => {
            el.classList.add('done');
          }, 1500); // 1.5초 후 커서 제거
        }
      });
    });
  }

  // ========================================
  // 🔄 Before/After 슬라이더
  // ========================================
  function initBeforeAfterSlider() {
    const slider = document.getElementById('heroBASlider');
    if (!slider) return;

    const handle = document.getElementById('baSliderHandle');
    const beforeImg = slider.querySelector('.ba-before');
    if (!handle || !beforeImg) return;

    let isDragging = false;

    function updateSlider(x) {
      const rect = slider.getBoundingClientRect();
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(5, Math.min(95, percent)); // 5% ~ 95% 제한
      
      handle.style.left = percent + '%';
      beforeImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    }

    function onStart(e) {
      isDragging = true;
      slider.style.cursor = 'grabbing';
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;
      const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      updateSlider(x);
    }

    function onEnd() {
      isDragging = false;
      slider.style.cursor = 'ew-resize';
    }

    // Mouse events
    handle.addEventListener('mousedown', onStart);
    slider.addEventListener('mousedown', (e) => {
      onStart(e);
      onMove(e);
    });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // Touch events
    handle.addEventListener('touchstart', onStart, { passive: false });
    slider.addEventListener('touchstart', (e) => {
      onStart(e);
      onMove(e);
    }, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  // ========================================
  // 🚀 로드 완료
  // ========================================
  window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loading-overlay');
    if (loader) {
      loader.style.transition = 'opacity 0.5s';
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
    document.body.classList.add('page-loaded');
  });

})();
