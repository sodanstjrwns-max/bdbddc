/**
 * Analytics Lazy Loader
 * =====================
 * Google Analytics와 Amplitude를 페이지 로드 후 동적으로 로딩
 * First Paint 및 LCP 성능 개선
 * 
 * v1.0.0 - 2024-12-10
 */

(function() {
  'use strict';

  // 설정
  const CONFIG = {
    GA_ID: 'G-3NQP355YQM',
    AMPLITUDE_KEY: 'c4e197a17443b1059b402ec0d16fa88f',
    LOAD_DELAY: 2000, // 페이지 로드 후 2초 대기
    DEBUG: false
  };

  // 유틸리티: 디버그 로그
  function log(...args) {
    if (CONFIG.DEBUG && window.location.hostname === 'localhost') {
      console.log('[Analytics]', ...args);
    }
  }

  // Google Analytics 로드
  function loadGoogleAnalytics() {
    return new Promise((resolve, reject) => {
      // 이미 로드되었는지 확인
      if (window.gtag) {
        log('GA already loaded');
        resolve();
        return;
      }

      // gtag.js 스크립트 로드
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_ID}`;
      script.async = true;
      
      script.onload = () => {
        // dataLayer 초기화
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', CONFIG.GA_ID, {
          'send_page_view': true,
          'cookie_flags': 'SameSite=None;Secure'
        });
        
        log('GA loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        log('GA failed to load');
        reject(new Error('Failed to load Google Analytics'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Amplitude 로드
  function loadAmplitude() {
    return new Promise((resolve, reject) => {
      // 이미 로드되었는지 확인
      if (window.amplitude && window.amplitude.getInstance) {
        log('Amplitude already loaded');
        resolve();
        return;
      }

      // Amplitude 스크립트 로드
      const script = document.createElement('script');
      script.src = `https://cdn.amplitude.com/script/${CONFIG.AMPLITUDE_KEY}.js`;
      script.async = true;
      
      script.onload = () => {
        // Amplitude 초기화
        if (window.amplitude) {
          try {
            // Session Replay 플러그인 추가 (있는 경우)
            if (window.sessionReplay && window.sessionReplay.plugin) {
              window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
            }
            
            window.amplitude.init(CONFIG.AMPLITUDE_KEY, {
              fetchRemoteConfig: true,
              autocapture: {
                attribution: true,
                fileDownloads: true,
                formInteractions: true,
                pageViews: true,
                sessions: true,
                elementInteractions: true,
                networkTracking: true,
                webVitals: true,
                frustrationInteractions: true
              }
            });
            
            log('Amplitude loaded successfully');
            resolve();
          } catch (e) {
            log('Amplitude init error:', e);
            resolve(); // 에러가 나도 계속 진행
          }
        } else {
          resolve();
        }
      };
      
      script.onerror = () => {
        log('Amplitude failed to load');
        reject(new Error('Failed to load Amplitude'));
      };
      
      document.head.appendChild(script);
    });
  }

  // 모든 Analytics 로드
  function loadAllAnalytics() {
    log('Starting analytics load...');
    
    Promise.all([
      loadGoogleAnalytics().catch(e => log('GA error:', e)),
      loadAmplitude().catch(e => log('Amplitude error:', e))
    ]).then(() => {
      log('All analytics loaded');
      
      // 커스텀 이벤트 발생 (다른 스크립트에서 사용 가능)
      window.dispatchEvent(new CustomEvent('analyticsReady'));
    });
  }

  // 초기화
  function init() {
    // requestIdleCallback 지원 시 사용 (브라우저가 유휴 상태일 때 로드)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadAllAnalytics();
      }, { timeout: CONFIG.LOAD_DELAY + 1000 });
    } else {
      // 폴백: setTimeout 사용
      setTimeout(loadAllAnalytics, CONFIG.LOAD_DELAY);
    }
  }

  // DOM 로드 후 또는 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOMContentLoaded 이후면 약간의 딜레이 후 실행
    setTimeout(init, 100);
  }

  // 전역 API 노출 (수동 로드 필요 시)
  window.AnalyticsLoader = {
    loadGA: loadGoogleAnalytics,
    loadAmplitude: loadAmplitude,
    loadAll: loadAllAnalytics
  };

})();
