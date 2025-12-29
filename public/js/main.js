/**
 * 서울비디치과 Main JavaScript v1.0
 * ====================================
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initHeader();
  initMobileNav();
  initScrollAnimations();
  initFAQ();
  initSmoothScroll();
  // initFloatingCTA(); // 비활성화 - HTML의 .floating-cta 사용
});

/**
 * Header Scroll Effect
 */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });
}

/**
 * Mobile Navigation with Submenu Support
 * 최적화: 링크 클릭 시 즉시 페이지 이동 (트랜지션 대기 없음)
 */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('mobileNavClose');
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileNavOverlay');

  if (!menuBtn || !nav) return;

  function openNav() {
    nav.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 터치/클릭 최적화 - passive 이벤트 사용
  menuBtn.addEventListener('click', openNav, { passive: true });
  if (closeBtn) closeBtn.addEventListener('click', closeNav, { passive: true });
  if (overlay) overlay.addEventListener('click', closeNav, { passive: true });

  // Handle submenu toggles
  nav.querySelectorAll('.mobile-nav-submenu-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.closest('.mobile-nav-item');
      const submenu = parent.querySelector('.mobile-nav-submenu');
      
      if (parent && submenu) {
        parent.classList.toggle('expanded');
      }
    }, { passive: false });
  });

  // 링크 클릭 시 즉시 페이지 이동 (메뉴 닫힘 애니메이션 기다리지 않음)
  nav.querySelectorAll('a:not(.mobile-nav-submenu-toggle)').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // 빈 링크, javascript:void(0), 앵커 링크는 무시
      if (!href || href === '#' || href.startsWith('javascript:')) {
        return;
      }
      
      // 외부 링크 (tel:, mailto:, http로 시작하는 외부 URL)는 그대로 동작
      if (href.startsWith('tel:') || href.startsWith('mailto:') || 
          (href.startsWith('http') && !href.includes(window.location.hostname))) {
        closeNav();
        return;
      }
      
      // 내부 페이지 링크: 즉시 이동
      e.preventDefault();
      
      // 메뉴 즉시 숨기기 (트랜지션 없이)
      nav.style.transition = 'none';
      if (overlay) overlay.style.transition = 'none';
      closeNav();
      
      // 즉시 페이지 이동
      window.location.href = href;
    }, { passive: false });
  });

  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      closeNav();
    }
  });
}

/**
 * Scroll Reveal Animations
 */
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('.animate-fade-in-up, .animate-fade-in');
  
  if (!animateElements.length) return;

  // Initial state
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.classList.contains('delay-1') ? 100 :
                      el.classList.contains('delay-2') ? 200 :
                      el.classList.contains('delay-3') ? 300 :
                      el.classList.contains('delay-4') ? 400 : 0;

        setTimeout(() => {
          el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);

        observer.unobserve(el);
      }
    });
  }, observerOptions);

  animateElements.forEach(el => observer.observe(el));
}

/**
 * FAQ Accordion
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function() {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
        }
      });

      // Toggle current item
      item.classList.toggle('active', !isActive);
    });
  });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Utility: Debounce Function
 */
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

/**
 * Utility: Format Number with Commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Form Validation Helpers
 */
const FormValidation = {
  isValidEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isValidPhone: function(phone) {
    const re = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return re.test(phone.replace(/-/g, ''));
  },

  formatPhone: function(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  }
};

/**
 * Toast Notification
 */
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  // Add styles if not exist
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        padding: 16px 24px;
        background: #1f2937;
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
      }
      .toast-notification.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      .toast-success { background: #059669; }
      .toast-error { background: #dc2626; }
      .toast-warning { background: #d97706; }
      .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.7;
      }
      .toast-close:hover { opacity: 1; }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Show toast
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Lazy Load Images
 */
function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  
  if (!images.length) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy load
initLazyLoad();

/**
 * Floating CTA Button
 */
function initFloatingCTA() {
  // Create floating CTA element
  const floatingCTA = document.createElement('div');
  floatingCTA.className = 'floating-cta';
  floatingCTA.innerHTML = `
    <a href="reservation.html" class="floating-cta-main" aria-label="예약하기">
      <i class="fas fa-calendar-check"></i>
      <span>예약</span>
    </a>
    <div class="floating-cta-secondary">
      <a href="tel:041-XXX-XXXX" class="floating-cta-btn" aria-label="전화 문의">
        <i class="fas fa-phone"></i>
      </a>
      <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" class="floating-cta-btn kakao" aria-label="카카오톡 상담">
        <i class="fab fa-comment"></i>
      </a>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .floating-cta {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      pointer-events: none;
    }
    .floating-cta.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .floating-cta-main {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px;
      background: #ffffff;
      color: #000000;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    }
    .floating-cta-main:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 30px rgba(0,0,0,0.4);
    }
    .floating-cta-main i {
      font-size: 18px;
    }
    .floating-cta-secondary {
      display: flex;
      gap: 8px;
    }
    .floating-cta-btn {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #ffffff;
      text-decoration: none;
      font-size: 18px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }
    .floating-cta-btn:hover {
      background: rgba(255,255,255,0.25);
      transform: scale(1.1);
    }
    .floating-cta-btn.kakao {
      background: #FEE500;
      color: #3C1E1E;
      border-color: #FEE500;
    }
    .floating-cta-btn.kakao:hover {
      background: #FFD700;
    }
    @media (max-width: 640px) {
      .floating-cta {
        bottom: 16px;
        right: 16px;
        gap: 8px;
      }
      .floating-cta-main {
        padding: 12px 20px;
        font-size: 14px;
      }
      .floating-cta-main span {
        display: none;
      }
      .floating-cta-main {
        width: 56px;
        height: 56px;
        padding: 0;
        justify-content: center;
        border-radius: 50%;
      }
      .floating-cta-main i {
        font-size: 22px;
      }
      .floating-cta-btn {
        width: 44px;
        height: 44px;
        font-size: 16px;
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(floatingCTA);

  // Show/hide on scroll
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateFloatingCTA() {
    const scrollY = window.scrollY;
    
    // Show after scrolling down 300px
    if (scrollY > 300) {
      floatingCTA.classList.add('visible');
    } else {
      floatingCTA.classList.remove('visible');
    }
    
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateFloatingCTA);
      ticking = true;
    }
  });

  // Initial check
  updateFloatingCTA();
}

// Export utilities for global use
window.SeoulBD = {
  showToast,
  FormValidation,
  debounce,
  formatNumber
};
