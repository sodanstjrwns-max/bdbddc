/**
 * Amplitude 이벤트 추적 스크립트
 * 서울비디치과 - 주요 사용자 액션 추적
 * 
 * 추적 이벤트:
 * - reservation_click: 예약 버튼 클릭
 * - phone_click: 전화 버튼 클릭
 * - kakao_click: 카카오톡 상담 버튼 클릭
 * - doctor_profile_view: 의료진 프로필 조회
 * - treatment_view: 진료 안내 페이지 조회
 * - pricing_view: 비용 안내 페이지 조회
 * - form_submit: 예약 폼 제출
 * - cta_click: CTA 버튼 클릭
 */

(function() {
  'use strict';
  
  // 프로덕션 환경 감지
  const IS_PRODUCTION = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  const log = IS_PRODUCTION ? () => {} : console.log.bind(console, '[Amplitude]');
  const warn = IS_PRODUCTION ? () => {} : console.warn.bind(console, '[Amplitude]');
  
  // Amplitude가 로드될 때까지 대기
  function waitForAmplitude(callback, maxAttempts = 20) {
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      if (window.amplitude && typeof window.amplitude.track === 'function') {
        clearInterval(check);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(check);
        warn('Amplitude not loaded after', maxAttempts, 'attempts');
      }
    }, 250);
  }
  
  // 페이지 정보 추출
  function getPageInfo() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    const section = path.includes('/doctors/') ? 'doctors' :
                   path.includes('/treatments/') ? 'treatments' :
                   path.includes('/faq/') ? 'faq' :
                   path.includes('/area/') ? 'area' :
                   path.includes('/cases/') ? 'cases' :
                   path.includes('/column/') ? 'column' :
                   path.includes('/bdx/') ? 'bdx' :
                   path.includes('/auth/') ? 'auth' : 'main';
    
    return { path, page, section };
  }
  
  // 의사 정보 추출 (URL 파라미터 또는 페이지에서)
  function getDoctorFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('doctor') || null;
  }
  
  // 이벤트 추적 함수
  function trackEvent(eventName, properties = {}) {
    if (window.amplitude && typeof window.amplitude.track === 'function') {
      const pageInfo = getPageInfo();
      const enrichedProperties = {
        ...properties,
        page_path: pageInfo.path,
        page_name: pageInfo.page,
        page_section: pageInfo.section,
        timestamp: new Date().toISOString()
      };
      
      window.amplitude.track(eventName, enrichedProperties);
      log(eventName, enrichedProperties);
    }
  }
  
  // 예약 버튼 클릭 추적
  function setupReservationTracking() {
    // 예약 링크들 (reservation.html로 가는 모든 링크)
    const reservationLinks = document.querySelectorAll([
      'a[href*="reservation.html"]',
      'a.btn-reserve',
      'a.btn-consult',
      '.btn-cta-primary'
    ].join(','));
    
    reservationLinks.forEach(link => {
      if (!link.hasAttribute('data-amplitude-tracked')) {
        link.setAttribute('data-amplitude-tracked', 'true');
        link.addEventListener('click', function(e) {
          const doctor = getDoctorFromUrl() || 
                        this.href.match(/doctor=([^&]+)/)?.[1] || 
                        null;
          const buttonText = this.textContent.trim().substring(0, 50);
          const buttonLocation = this.closest('section')?.className || 
                                this.closest('header') ? 'header' : 
                                this.closest('footer') ? 'footer' : 'unknown';
          
          trackEvent('reservation_click', {
            button_text: buttonText,
            button_location: buttonLocation,
            doctor_selected: doctor,
            is_mobile: window.innerWidth < 768
          });
        });
      }
    });
  }
  
  // 전화 버튼 클릭 추적
  function setupPhoneTracking() {
    const phoneLinks = document.querySelectorAll([
      'a[href^="tel:"]',
      '.header-phone',
      '.btn-call',
      '.floating-btn.phone'
    ].join(','));
    
    phoneLinks.forEach(link => {
      if (!link.hasAttribute('data-amplitude-tracked')) {
        link.setAttribute('data-amplitude-tracked', 'true');
        link.addEventListener('click', function(e) {
          const phoneNumber = this.href?.replace('tel:', '') || 
                             this.textContent.match(/[\d-]+/)?.[0] || 'unknown';
          const buttonLocation = this.closest('section')?.className || 
                                this.closest('header') ? 'header' : 
                                this.closest('footer') ? 'footer' : 
                                this.classList.contains('floating-btn') ? 'floating' : 'unknown';
          
          trackEvent('phone_click', {
            phone_number: phoneNumber,
            button_location: buttonLocation,
            is_mobile: window.innerWidth < 768
          });
        });
      }
    });
  }
  
  // 카카오톡 버튼 클릭 추적
  function setupKakaoTracking() {
    const kakaoLinks = document.querySelectorAll([
      'a[href*="pf.kakao.com"]',
      '.floating-btn.kakao',
      '.kakao-widget-btn'
    ].join(','));
    
    kakaoLinks.forEach(link => {
      if (!link.hasAttribute('data-amplitude-tracked')) {
        link.setAttribute('data-amplitude-tracked', 'true');
        link.addEventListener('click', function(e) {
          const buttonLocation = this.closest('section')?.className || 
                                this.closest('header') ? 'header' : 
                                this.closest('footer') ? 'footer' : 
                                this.classList.contains('floating-btn') ? 'floating' : 'unknown';
          
          trackEvent('kakao_click', {
            button_location: buttonLocation,
            is_mobile: window.innerWidth < 768
          });
        });
      }
    });
  }
  
  // CTA 버튼 클릭 추적 (일반적인 CTA)
  function setupCtaTracking() {
    const ctaButtons = document.querySelectorAll([
      '.btn-primary',
      '.btn-secondary',
      '.cta-btn',
      '.hero-cta a',
      '.footer-cta a'
    ].join(','));
    
    ctaButtons.forEach(btn => {
      // 이미 추적 중인 예약/전화/카카오 버튼 제외
      if (!btn.hasAttribute('data-amplitude-tracked') &&
          !btn.href?.includes('reservation.html') &&
          !btn.href?.includes('tel:') &&
          !btn.href?.includes('pf.kakao.com')) {
        btn.setAttribute('data-amplitude-tracked', 'true');
        btn.addEventListener('click', function(e) {
          const buttonText = this.textContent.trim().substring(0, 50);
          const destinationUrl = this.href || 'none';
          
          trackEvent('cta_click', {
            button_text: buttonText,
            destination_url: destinationUrl,
            button_class: this.className
          });
        });
      }
    });
  }
  
  // 예약 폼 제출 추적
  function setupFormTracking() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      if (!form.hasAttribute('data-amplitude-tracked')) {
        form.setAttribute('data-amplitude-tracked', 'true');
        form.addEventListener('submit', function(e) {
          const formId = this.id || this.className || 'unknown';
          const formAction = this.action || window.location.href;
          
          // 폼 내 주요 필드 값 (개인정보 제외)
          const doctorField = this.querySelector('[name*="doctor"]')?.value || null;
          const treatmentField = this.querySelector('[name*="treatment"]')?.value || null;
          
          trackEvent('form_submit', {
            form_id: formId,
            form_action: formAction,
            doctor_selected: doctorField,
            treatment_selected: treatmentField
          });
        });
      }
    });
  }
  
  // 의료진 프로필 카드 클릭 추적
  function setupDoctorCardTracking() {
    const doctorCards = document.querySelectorAll([
      '.doctor-card',
      '.doctor-profile-card',
      'a[href*="/doctors/"]'
    ].join(','));
    
    doctorCards.forEach(card => {
      if (!card.hasAttribute('data-amplitude-tracked')) {
        card.setAttribute('data-amplitude-tracked', 'true');
        card.addEventListener('click', function(e) {
          const doctorName = this.querySelector('h3, h4, .doctor-name')?.textContent.trim() || 
                            this.href?.match(/doctors\/([^.]+)/)?.[1] || 'unknown';
          const specialty = this.querySelector('.specialty, .doctor-specialty')?.textContent.trim() || '';
          
          trackEvent('doctor_profile_view', {
            doctor_name: doctorName,
            specialty: specialty,
            click_source: 'card'
          });
        });
      }
    });
  }
  
  // 진료 페이지 링크 클릭 추적
  function setupTreatmentTracking() {
    const treatmentLinks = document.querySelectorAll('a[href*="/treatments/"]');
    
    treatmentLinks.forEach(link => {
      if (!link.hasAttribute('data-amplitude-tracked')) {
        link.setAttribute('data-amplitude-tracked', 'true');
        link.addEventListener('click', function(e) {
          const treatmentName = this.textContent.trim().substring(0, 50);
          const treatmentPage = this.href?.match(/treatments\/([^.?]+)/)?.[1] || 'unknown';
          
          trackEvent('treatment_view', {
            treatment_name: treatmentName,
            treatment_page: treatmentPage
          });
        });
      }
    });
  }
  
  // 스크롤 깊이 추적 (25%, 50%, 75%, 100%)
  function setupScrollTracking() {
    const scrollThresholds = [25, 50, 75, 100];
    const trackedThresholds = new Set();
    
    window.addEventListener('scroll', function() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      scrollThresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          trackEvent('scroll_depth', {
            depth_percent: threshold
          });
        }
      });
    }, { passive: true });
  }
  
  // 페이지 조회 이벤트 (자동 캡처 보완)
  function trackPageView() {
    const pageInfo = getPageInfo();
    const doctor = getDoctorFromUrl();
    
    // 특정 페이지에 대한 상세 추적
    if (pageInfo.section === 'doctors' && pageInfo.page !== 'index') {
      trackEvent('doctor_profile_view', {
        doctor_name: pageInfo.page,
        click_source: 'direct_visit'
      });
    }
    
    if (pageInfo.section === 'treatments' && pageInfo.page !== 'index') {
      trackEvent('treatment_view', {
        treatment_page: pageInfo.page,
        click_source: 'direct_visit'
      });
    }
    
    if (pageInfo.page === 'pricing') {
      trackEvent('pricing_view', {});
    }
    
    if (pageInfo.page === 'reservation') {
      trackEvent('reservation_page_view', {
        doctor_preselected: doctor
      });
    }
  }
  
  // 초기화
  function init() {
    log('Initializing event tracking...');
    
    // 모든 트래킹 설정
    setupReservationTracking();
    setupPhoneTracking();
    setupKakaoTracking();
    setupCtaTracking();
    setupFormTracking();
    setupDoctorCardTracking();
    setupTreatmentTracking();
    setupScrollTracking();
    
    // 페이지 조회 추적
    trackPageView();
    
    // MutationObserver로 동적 콘텐츠 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          // 새로운 노드가 추가되면 트래킹 재설정
          setupReservationTracking();
          setupPhoneTracking();
          setupKakaoTracking();
          setupCtaTracking();
          setupDoctorCardTracking();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    log('Event tracking initialized successfully');
  }
  
  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForAmplitude(init);
    });
  } else {
    waitForAmplitude(init);
  }
})();
