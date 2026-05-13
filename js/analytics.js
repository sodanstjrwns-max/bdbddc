/**
 * 서울비디치과 통합 Analytics v4
 * GTM (GTM-KKVMVZHK) → GA4 (G-3NQP355YQM) + Amplitude (c4e197a17443b1059b402ec0d16fa88f)
 * 
 * v5 변경사항 (2026-04-08):
 * - Area CTA 전용 GA4 이벤트 추적 (data-cta, data-area, data-treatment 속성 기반)
 * - area_cta_click 이벤트: 지역명·치료명·CTA유형 포함 → 어느 지역 키워드가 전환에 기여하는지 측정
 * - area_page_view 이벤트: area_seo 페이지 진입 시 지역·치료 파라미터 자동 전송
 * - 기존 CTA 이벤트(trackPhoneCall, trackKakao, trackReservation)와 이중 전송으로 호환성 유지
 *
 * v4 변경사항 (2026-04-07):
 * - GA4 표준 전환 이벤트 추가 (generate_lead, contact → 자동 주요 이벤트 인식)
 * - 예약 폼 제출 성공 추적 (trackReservationComplete)
 * - 전화 클릭: GA4 표준 contact + 커스텀 phone_call_click 이중 전송
 * - 카카오 상담: GA4 표준 contact 이벤트 추가
 * - 길찾기/네이버지도 전환 이벤트 강화
 * - 회원가입 완료 추적 (trackSignup)
 * - 로그인 추적 (trackLogin)
 * 
 * v3 변경사항 (2026-04-02):
 * - Amplitude SDK를 Script Loader 방식으로 전환 (구 인라인 스니펫 제거)
 * - SDK 중복 init 방지 (window._bdAmplitudeInitialized 플래그)
 * - autocapture 활성화 (attribution, pageViews, sessions, forms, fileDownloads)
 * - safeIdentify 래퍼 간소화 (Script Loader 자동 큐잉 활용)
 */
(function() {
  'use strict';

  // ─── GA4 gtag 초기화 (GTM과 병행) ───
  // GTM은 dataLayer만 생성하고 gtag() 전역 함수를 만들지 않음
  // analytics.js에서 gtag()를 직접 호출하므로 여기서 정의 필요
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag; // 전역에서도 접근 가능하게
  gtag('js', new Date());
  gtag('config', 'G-3NQP355YQM', { send_page_view: false }); // GTM이 page_view 처리

  // ─── Amplitude 초기화 ───
  // SDK(analytics-browser-2.11.1) + autocapture plugin은 HTML <head>에서 로드됨
  // <head>에서 amplitude.init('c4e197a17443b1059b402ec0d16fa88f', {...}) 이미 호출됨
  // → analytics.js에서 두 번째 init()을 호출하면 세션/이벤트가 꼬일 수 있으므로
  //   이미 init된 경우 건너뜀.
  //
  // init 여부 감지 방법 (3가지 폴백):
  //  1. amplitude.getSessionId() — init 후에만 유효한 세션ID 반환
  //  2. window._bdAmplitudeInitialized — HTML <head>에서 세팅한 플래그
  //  3. amplitude.config?.apiKey — SDK 내부 config 객체
  //
  // 폴백: <head> init이 누락된 극히 드문 경우만 대비
  if (typeof window.amplitude !== 'undefined') {
    var hasSession = false;
    try { hasSession = !!(amplitude.getSessionId && amplitude.getSessionId()); } catch(e) {}
    var alreadyInitialized = hasSession ||
                              window._bdAmplitudeInitialized ||
                              (window.amplitude._isInitialized === true);
    if (!alreadyInitialized) {
      window._bdAmplitudeInitialized = true;
      amplitude.init('c4e197a17443b1059b402ec0d16fa88f', {
        autocapture: {
          attribution: true,
          pageViews: true,
          sessions: true,
          formInteractions: true,
          fileDownloads: true,
          elementInteractions: true
        },
        serverZone: 'US',
        minIdLength: 1,
        flushIntervalMillis: 1000,
        flushQueueSize: 30,
        logLevel: 0 // None in production
      });
    }
    // <head>에서 init됐거나 여기서 init됐거나 — 이후 track() 정상 동작
  }

  // ═══════════════════════════════════════════════════════
  // 1. 유틸리티 함수들
  // ═══════════════════════════════════════════════════════

  // UTM 파라미터 추출
  function getUTM() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || ''
    };
  }

  // 리퍼러 소스 분류
  function classifyReferrer(ref) {
    if (!ref) return { channel: 'direct', source: 'direct' };
    try {
      var hostname = new URL(ref).hostname.toLowerCase();
    } catch(e) {
      return { channel: 'other', source: ref };
    }

    // 자사 도메인
    if (hostname.includes('bdbddc.com') || hostname.includes('seoul-bd-dental')) {
      return { channel: 'internal', source: 'self' };
    }

    // 검색엔진
    if (hostname.includes('google')) return { channel: 'organic_search', source: 'google' };
    if (hostname.includes('naver')) return { channel: 'organic_search', source: 'naver' };
    if (hostname.includes('daum') || hostname.includes('kakao') && hostname.includes('search')) return { channel: 'organic_search', source: 'daum' };
    if (hostname.includes('bing')) return { channel: 'organic_search', source: 'bing' };
    if (hostname.includes('yahoo')) return { channel: 'organic_search', source: 'yahoo' };

    // 소셜미디어
    if (hostname.includes('instagram')) return { channel: 'social', source: 'instagram' };
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return { channel: 'social', source: 'facebook' };
    if (hostname.includes('t.co') || hostname.includes('twitter') || hostname.includes('x.com')) return { channel: 'social', source: 'twitter' };
    if (hostname.includes('youtube')) return { channel: 'social', source: 'youtube' };
    if (hostname.includes('tiktok')) return { channel: 'social', source: 'tiktok' };
    if (hostname.includes('blog.naver')) return { channel: 'social', source: 'naver_blog' };
    if (hostname.includes('cafe.naver')) return { channel: 'social', source: 'naver_cafe' };
    if (hostname.includes('band.us')) return { channel: 'social', source: 'band' };

    // 메신저
    if (hostname.includes('kakao') && !hostname.includes('search')) return { channel: 'messenger', source: 'kakao' };
    if (hostname.includes('line.me')) return { channel: 'messenger', source: 'line' };

    // 지도
    if (hostname.includes('map.naver') || hostname.includes('map.kakao') || hostname.includes('maps.google')) {
      return { channel: 'map', source: hostname.includes('naver') ? 'naver_map' : hostname.includes('kakao') ? 'kakao_map' : 'google_map' };
    }

    return { channel: 'referral', source: hostname };
  }

  // 디바이스 타입 감지
  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/tablet|iPad/i.test(ua)) return 'tablet';
    if (/mobile|iPhone|Android(?!.*tablet)/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  // 브라우저 감지
  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
    if (ua.includes('KAKAOTALK')) return 'KakaoTalk';
    if (ua.includes('NAVER')) return 'Naver App';
    if (ua.includes('Instagram')) return 'Instagram';
    if (ua.includes('FB') || ua.includes('FBAN')) return 'Facebook';
    if (ua.includes('CriOS')) return 'Chrome iOS';
    if (ua.includes('FxiOS')) return 'Firefox iOS';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other';
  }

  // 시간대 분류 (한국 기준)
  function getTimeSlot() {
    var h = new Date().getHours();
    if (h >= 6 && h < 9) return 'early_morning';    // 이른 아침 6-9
    if (h >= 9 && h < 12) return 'morning';          // 오전 9-12
    if (h >= 12 && h < 14) return 'lunch';            // 점심 12-14
    if (h >= 14 && h < 18) return 'afternoon';        // 오후 14-18
    if (h >= 18 && h < 21) return 'evening';          // 저녁 18-21
    if (h >= 21 || h < 1) return 'night';             // 밤 21-01
    return 'late_night';                               // 심야 01-06
  }

  // 요일 (한국어)
  function getDayOfWeek() {
    return ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];
  }

  // ═══════════════════════════════════════════════════════
  // 2. 유저 프로퍼티 세팅 (안전한 지연 실행)
  // ═══════════════════════════════════════════════════════

  var utm = getUTM();
  var refInfo = classifyReferrer(document.referrer);
  var deviceType = getDeviceType();
  var browser = getBrowser();

  // Identify 안전 실행 래퍼 — Script Loader가 자동 큐잉 지원
  function safeIdentify(fn) {
    try {
      if (typeof amplitude !== 'undefined' && amplitude.Identify) {
        var id = new amplitude.Identify();
        fn(id);
        amplitude.identify(id);
      }
    } catch(e) {
      // Amplitude SDK 아직 로드 중 — 200ms 후 재시도 (최대 1회)
      if (!safeIdentify._retried) {
        safeIdentify._retried = true;
        setTimeout(function() { safeIdentify(fn); }, 200);
      }
    }
  }

  // 기본 유저 프로퍼티 세팅
  safeIdentify(function(identify) {
    // 디바이스/브라우저 (매번 갱신)
    identify.set('device_type', deviceType);
    identify.set('browser', browser);
    identify.set('screen_width', window.screen.width);
    identify.set('screen_height', window.screen.height);
    identify.set('language', navigator.language || 'ko');
    identify.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul');

    // 마지막 방문 채널 (매번 갱신)
    identify.set('last_channel', refInfo.channel);
    identify.set('last_source', refInfo.source);

    // UTM이 있으면 갱신
    if (utm.utm_source) {
      identify.set('last_utm_source', utm.utm_source);
      identify.set('last_utm_medium', utm.utm_medium);
      identify.set('last_utm_campaign', utm.utm_campaign);
    }

    // 첫 방문 소스 (최초 한 번만 — setOnce)
    identify.setOnce('first_channel', refInfo.channel);
    identify.setOnce('first_source', refInfo.source);
    identify.setOnce('first_referrer', document.referrer || 'direct');
    identify.setOnce('first_landing_page', window.location.pathname);
    identify.setOnce('first_visit_date', new Date().toISOString().split('T')[0]);
    if (utm.utm_source) {
      identify.setOnce('first_utm_source', utm.utm_source);
      identify.setOnce('first_utm_medium', utm.utm_medium);
      identify.setOnce('first_utm_campaign', utm.utm_campaign);
    }

    // 누적 카운터
    identify.add('total_visits', 1);
  });

  // ═══════════════════════════════════════════════════════
  // 3. 페이지 정보 추출 + 페이지뷰
  // ═══════════════════════════════════════════════════════

  var path = window.location.pathname;
  var pageType = 'other';
  var pageName = document.title;

  if (path === '/' || path === '/index.html') pageType = 'home';
  else if (path.startsWith('/treatments/')) pageType = 'treatment';
  else if (path === '/treatments' || path === '/treatments/') pageType = 'treatment_index';
  else if (path.startsWith('/doctors/')) pageType = 'doctor';
  else if (path === '/doctors' || path === '/doctors/') pageType = 'doctor_index';
  else if (path.startsWith('/area/')) pageType = 'area_seo';
  else if (path.startsWith('/faq')) pageType = 'faq';
  else if (path.startsWith('/blog') || path.startsWith('/column') || path.startsWith('/video') || path.startsWith('/cases')) pageType = 'content';
  else if (path.startsWith('/encyclopedia')) pageType = 'encyclopedia';
  else if (path.includes('reservation')) pageType = 'reservation';
  else if (path.includes('pricing')) pageType = 'pricing';
  else if (path.includes('directions')) pageType = 'directions';
  else if (path.includes('mission')) pageType = 'about';
  else if (path.includes('floor-guide')) pageType = 'floor_guide';
  else if (path.includes('notice')) pageType = 'notice';
  else if (path.includes('flight')) pageType = 'game';
  else if (path.includes('checkup')) pageType = 'game';
  else if (path.includes('games')) pageType = 'game_hub';

  // 서브 카테고리 추출
  var treatmentName = '';
  if (pageType === 'treatment') {
    var m1 = path.match(/\/treatments\/([^/.]+)/);
    if (m1) treatmentName = m1[1];
  }

  var doctorName = '';
  if (pageType === 'doctor') {
    var m2 = path.match(/\/doctors\/([^/.]+)/);
    if (m2) doctorName = m2[1];
  }

  var areaName = '';
  var areaTreatment = '';
  if (pageType === 'area_seo') {
    var m3 = path.match(/\/area\/([^/.]+)/);
    if (m3) {
      areaName = m3[1];
      // area slug에서 지역명과 치료명 분리: e.g., 'asan-implant' → area='asan', treatment='implant'
      var areaParts = areaName.split('-');
      if (areaParts.length >= 2) {
        areaTreatment = areaParts[areaParts.length - 1]; // 'implant', 'invisalign', 'laminate'
        areaName = areaParts.slice(0, -1).join('-'); // 'asan', 'pyeongtaek' etc.
      }
    }
  }

  var gameName = '';
  if (path.includes('flight')) gameName = 'chistone_flight';
  else if (path.includes('checkup')) gameName = 'chbti';

  var contentType = '';
  if (path.startsWith('/blog')) contentType = 'blog';
  else if (path.startsWith('/video')) contentType = 'video';
  else if (path.startsWith('/cases')) contentType = 'cases';
  else if (path.startsWith('/column')) contentType = 'column';

  // GA4 커스텀 이벤트: 페이지뷰 상세
  if (typeof gtag === 'function') {
    gtag('event', 'page_view_detail', {
      page_type: pageType,
      treatment_name: treatmentName,
      doctor_name: doctorName,
      area_name: areaName,
      device_type: deviceType,
      channel: refInfo.channel,
      source: refInfo.source
    });
  }

  // Amplitude 페이지뷰 상세
  amplitude.track('Page View', {
    page_type: pageType,
    page_path: path,
    page_title: pageName,
    treatment_name: treatmentName,
    doctor_name: doctorName,
    area_name: areaName,
    content_type: contentType,
    game_name: gameName,
    referrer: document.referrer,
    channel: refInfo.channel,
    source: refInfo.source,
    device_type: deviceType,
    browser: browser,
    time_slot: getTimeSlot(),
    day_of_week: getDayOfWeek(),
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign
  });

  // 페이지 타입별 유저 프로퍼티 누적
  safeIdentify(function(pid) {
    if (pageType === 'treatment') {
      pid.add('treatments_viewed', 1);
      pid.append('viewed_treatments', treatmentName);
    } else if (pageType === 'doctor') {
      pid.add('doctors_viewed', 1);
    } else if (pageType === 'pricing') {
      pid.set('viewed_pricing', true);
    } else if (pageType === 'reservation') {
      pid.set('visited_reservation', true);
    } else if (pageType === 'game' || pageType === 'game_hub') {
      pid.add('game_pages_viewed', 1);
    } else if (pageType === 'encyclopedia') {
      pid.add('encyclopedia_viewed', 1);
    } else if (pageType === 'content') {
      pid.add('content_viewed', 1);
    }
  });

  // ═══════════════════════════════════════════════════════
  // 4. 세션 트래킹 (체류 시간 + 페이지 수)
  // ═══════════════════════════════════════════════════════

  var sessionStart = Date.now();
  var sessionPageKey = 'bd_session_pages';
  var sessionPages = parseInt(sessionStorage.getItem(sessionPageKey) || '0') + 1;
  sessionStorage.setItem(sessionPageKey, sessionPages);

  // 페이지 이탈 시 체류 시간 전송
  function sendEngagement() {
    var engagementSec = Math.round((Date.now() - sessionStart) / 1000);
    if (engagementSec < 1 || engagementSec > 1800) return; // 1초 미만이거나 30분 초과는 무시

    amplitude.track('Page Engagement', {
      page_type: pageType,
      page_path: path,
      engagement_seconds: engagementSec,
      session_page_count: sessionPages,
      scroll_reached: window._bdMaxScroll || 0
    });
  }

  // visibilitychange (모바일) + beforeunload (데스크톱)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') sendEngagement();
  });
  window.addEventListener('beforeunload', sendEngagement);

  // ═══════════════════════════════════════════════════════
  // 5. 이벤트 트래킹 함수 (bdAnalytics)
  // ═══════════════════════════════════════════════════════

  window.bdAnalytics = {

    // ── 전환 이벤트 (Conversion) ──

    // 예약 버튼 클릭
    trackReservation: function(source) {
      var data = {
        source: source || pageType,
        page_type: pageType,
        page_path: path,
        treatment_name: treatmentName,
        channel: refInfo.channel,
        device_type: deviceType
      };
      if (typeof gtag === 'function') {
        // GA4 커스텀 이벤트 (기존 호환)
        gtag('event', 'reservation_click', {
          event_category: 'conversion',
          event_label: source || pageType,
          page_type: pageType,
          treatment_name: treatmentName
        });
      }
      amplitude.track('Reservation Click', data);
      safeIdentify(function(rid) {
        rid.add('reservation_clicks', 1);
        rid.set('last_reservation_source', pageType);
        if (treatmentName) rid.set('last_reservation_treatment', treatmentName);
      });
    },

    // 예약 폼 제출 성공 (★ 핵심 전환 이벤트)
    trackReservationComplete: function(reservationData) {
      var data = {
        source: pageType,
        page_path: path,
        treatment: reservationData.treatment || '',
        has_message: !!(reservationData.message),
        marketing_agreed: !!(reservationData.marketing),
        channel: refInfo.channel,
        device_type: deviceType
      };
      if (typeof gtag === 'function') {
        // ★ GA4 표준 이벤트: generate_lead (자동 주요 이벤트 인식)
        gtag('event', 'generate_lead', {
          currency: 'KRW',
          value: 100000,
          event_category: 'conversion',
          method: 'reservation_form',
          treatment: reservationData.treatment || ''
        });
        // 커스텀 이벤트 (상세 분석용)
        gtag('event', 'reservation_complete', {
          event_category: 'conversion',
          treatment: reservationData.treatment || '',
          marketing_agreed: !!(reservationData.marketing)
        });
      }
      amplitude.track('Reservation Complete', data);
      // Meta Pixel: Lead 이벤트
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', { content_name: reservationData.treatment || 'general' });
      }
      safeIdentify(function(rid) {
        rid.add('reservations_completed', 1);
        rid.set('last_reservation_treatment', reservationData.treatment || '');
        rid.set('is_lead', true);
      });
    },

    // 전화 클릭
    trackPhoneCall: function(source) {
      if (typeof gtag === 'function') {
        // ★ GA4 표준 이벤트: contact (자동 주요 이벤트 인식 가능)
        gtag('event', 'contact', {
          event_category: 'conversion',
          method: 'phone',
          event_label: source || pageType,
          page_type: pageType
        });
        // 커스텀 이벤트 (기존 호환 + 상세 분석)
        gtag('event', 'phone_call_click', {
          event_category: 'conversion',
          event_label: source || pageType,
          page_type: pageType
        });
      }
      amplitude.track('Phone Call Click', {
        source: source || pageType,
        page_type: pageType,
        page_path: path,
        treatment_name: treatmentName,
        device_type: deviceType
      });
      // Meta Pixel: Contact 이벤트
      if (typeof fbq === 'function') {
        fbq('track', 'Contact', { content_name: 'phone_call' });
      }
      safeIdentify(function(pid) { pid.add('phone_clicks', 1); });
    },

    // 카카오 상담 클릭
    trackKakao: function(source) {
      if (typeof gtag === 'function') {
        // ★ GA4 표준 이벤트: contact (method로 구분)
        gtag('event', 'contact', {
          event_category: 'conversion',
          method: 'kakao',
          event_label: source || pageType
        });
        // 커스텀 이벤트 (기존 호환)
        gtag('event', 'kakao_click', {
          event_category: 'conversion',
          event_label: source || pageType
        });
      }
      amplitude.track('Kakao Click', {
        source: source || pageType,
        page_type: pageType,
        page_path: path,
        device_type: deviceType
      });
      // Meta Pixel: Contact 이벤트
      if (typeof fbq === 'function') {
        fbq('track', 'Contact', { content_name: 'kakao_talk' });
      }
      safeIdentify(function(kid) { kid.add('kakao_clicks', 1); });
    },

    // ── 참여 이벤트 (Engagement) ──

    // 치료 페이지 조회
    trackTreatmentView: function(name) {
      if (typeof gtag === 'function') {
        gtag('event', 'treatment_view', {
          event_category: 'engagement',
          treatment_name: name || treatmentName
        });
      }
      amplitude.track('Treatment View', {
        treatment_name: name || treatmentName,
        page_path: path,
        channel: refInfo.channel,
        device_type: deviceType
      });
    },

    // 의사 프로필 조회
    trackDoctorView: function(name) {
      if (typeof gtag === 'function') {
        gtag('event', 'doctor_view', {
          event_category: 'engagement',
          doctor_name: name || doctorName
        });
      }
      amplitude.track('Doctor View', {
        doctor_name: name || doctorName,
        page_path: path,
        device_type: deviceType
      });
    },

    // 가격표 조회
    trackPricingView: function() {
      if (typeof gtag === 'function') {
        gtag('event', 'pricing_view', { event_category: 'engagement' });
      }
      amplitude.track('Pricing View', {
        page_path: path,
        referrer: document.referrer,
        channel: refInfo.channel,
        device_type: deviceType
      });
    },

    // FAQ 클릭
    trackFaqClick: function(question) {
      if (typeof gtag === 'function') {
        gtag('event', 'faq_click', { event_category: 'engagement', event_label: question });
      }
      amplitude.track('FAQ Click', { question: question, page_path: path });
    },

    // 스크롤 깊이
    trackScroll: function(depth) {
      if (typeof gtag === 'function') {
        gtag('event', 'scroll_depth', { event_category: 'engagement', value: depth, page_type: pageType });
      }
      amplitude.track('Scroll Depth', { depth: depth, page_type: pageType, page_path: path });
      // 최대 스크롤 기록
      window._bdMaxScroll = Math.max(window._bdMaxScroll || 0, depth);
    },

    // 지도/길찾기 클릭
    trackMapClick: function(mapType) {
      if (typeof gtag === 'function') {
        // ★ GA4: 지도 클릭도 전환으로 추적
        gtag('event', 'map_click', {
          event_category: 'conversion',
          event_label: mapType,
          method: mapType
        });
      }
      amplitude.track('Map Click', { map_type: mapType, page_path: path, device_type: deviceType });
      safeIdentify(function(mid) { mid.add('map_clicks', 1); });
    },

    // 길찾기 클릭 (네이버지도/카카오맵/구글맵 길찾기 버튼)
    trackDirections: function(mapType) {
      if (typeof gtag === 'function') {
        gtag('event', 'directions_click', {
          event_category: 'conversion',
          event_label: mapType || 'unknown',
          method: mapType || 'unknown'
        });
      }
      amplitude.track('Directions Click', {
        map_type: mapType || 'unknown',
        page_type: pageType,
        page_path: path,
        device_type: deviceType
      });
    },

    // 회원가입 완료
    trackSignup: function(method) {
      if (typeof gtag === 'function') {
        // ★ GA4 표준 이벤트: sign_up
        gtag('event', 'sign_up', {
          method: method || 'email'
        });
      }
      amplitude.track('Sign Up', {
        method: method || 'email',
        page_path: path,
        device_type: deviceType
      });
      if (typeof fbq === 'function') {
        fbq('track', 'CompleteRegistration', { content_name: method || 'email' });
      }
      safeIdentify(function(sid) {
        sid.set('is_registered', true);
        sid.set('signup_method', method || 'email');
        sid.setOnce('signup_date', new Date().toISOString().split('T')[0]);
      });
    },

    // 로그인
    trackLogin: function(method) {
      if (typeof gtag === 'function') {
        // ★ GA4 표준 이벤트: login
        gtag('event', 'login', {
          method: method || 'email'
        });
      }
      amplitude.track('Login', {
        method: method || 'email',
        page_path: path,
        device_type: deviceType
      });
      safeIdentify(function(lid) { lid.add('login_count', 1); });
    },

    // CTA 클릭 (범용)
    trackCTA: function(ctaName, ctaLocation) {
      if (typeof gtag === 'function') {
        gtag('event', 'cta_click', { event_category: 'conversion', event_label: ctaName, cta_location: ctaLocation });
      }
      amplitude.track('CTA Click', {
        cta_name: ctaName,
        cta_location: ctaLocation,
        page_type: pageType,
        page_path: path,
        device_type: deviceType
      });
    },

    // 외부 링크 클릭
    trackOutboundClick: function(url, label) {
      amplitude.track('Outbound Click', {
        url: url,
        label: label || '',
        page_type: pageType,
        page_path: path
      });
    },

    // ── 게임 이벤트 (Game) ──

    trackGameStart: function(game, extra) {
      var g = game || gameName;
      var data = Object.assign({ game_name: g, page_path: path, device_type: deviceType }, extra || {});
      if (typeof gtag === 'function') {
        gtag('event', 'game_start', { event_category: 'game', event_label: g, game_name: g });
      }
      amplitude.track('Game Start', data);
      safeIdentify(function(gid) {
        gid.add('games_played', 1);
        gid.append('played_games', g);
      });
    },

    trackGameOver: function(game, score, grade, playtimeSeconds, extra) {
      var g = game || gameName;
      var data = Object.assign({
        game_name: g,
        score: score || 0,
        grade: grade || '',
        playtime_seconds: playtimeSeconds || 0,
        page_path: path,
        device_type: deviceType
      }, extra || {});
      if (typeof gtag === 'function') {
        gtag('event', 'game_over', {
          event_category: 'game',
          event_label: g,
          game_name: g,
          value: score || 0,
          grade: grade || '',
          playtime_seconds: playtimeSeconds || 0
        });
      }
      amplitude.track('Game Over', data);
    },

    trackGameShare: function(game, method, extra) {
      var g = game || gameName;
      var data = Object.assign({
        game_name: g,
        share_method: method || 'unknown',
        page_path: path,
        device_type: deviceType
      }, extra || {});
      if (typeof gtag === 'function') {
        gtag('event', 'game_share', {
          event_category: 'game',
          event_label: g,
          share_method: method || 'unknown'
        });
      }
      amplitude.track('Game Share', data);
      safeIdentify(function(sid) { sid.add('game_shares', 1); });
    },

    trackGameResult: function(game, resultType, extra) {
      var g = game || gameName;
      var data = Object.assign({
        game_name: g,
        result_type: resultType || '',
        page_path: path
      }, extra || {});
      if (typeof gtag === 'function') {
        gtag('event', 'game_result', {
          event_category: 'game',
          event_label: g,
          result_type: resultType || ''
        });
      }
      amplitude.track('Game Result', data);
    },

    trackGameSelect: function(game, source) {
      if (typeof gtag === 'function') {
        gtag('event', 'game_select', {
          event_category: 'game',
          event_label: game,
          source: source || 'game_hub'
        });
      }
      amplitude.track('Game Select', {
        game_name: game,
        source: source || 'game_hub',
        page_path: path
      });
    },

    trackGameItem: function(game, itemName, extra) {
      var g = game || gameName;
      var data = Object.assign({
        game_name: g,
        item_name: itemName || '',
        page_path: path
      }, extra || {});
      amplitude.track('Game Item', data);
    },

    trackGameRestart: function(game, lastScore) {
      var g = game || gameName;
      if (typeof gtag === 'function') {
        gtag('event', 'game_restart', { event_category: 'game', event_label: g, last_score: lastScore || 0 });
      }
      amplitude.track('Game Restart', { game_name: g, last_score: lastScore || 0, page_path: path });
    }
  };

  // ═══════════════════════════════════════════════════════
  // 6. 자동 이벤트 바인딩 (DOM Ready)
  // ═══════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function() {

    // 1. 예약 링크 자동 감지
    document.querySelectorAll('a[href*="reservation"]').forEach(function(el) {
      el.addEventListener('click', function() {
        bdAnalytics.trackReservation(el.closest('section') ? el.closest('section').className : 'unknown');
      });
    });

    // 2. 전화 링크 자동 감지
    document.querySelectorAll('a[href^="tel:"]').forEach(function(el) {
      el.addEventListener('click', function() {
        bdAnalytics.trackPhoneCall(el.closest('section') ? el.closest('section').className : 'unknown');
      });
    });

    // 3. 카카오 링크 자동 감지
    document.querySelectorAll('a[href*="kakao"], a[href*="pf.kakao"]').forEach(function(el) {
      el.addEventListener('click', function() {
        bdAnalytics.trackKakao(el.closest('section') ? el.closest('section').className : 'unknown');
      });
    });

    // 4. 지도 링크 자동 감지
    document.querySelectorAll('a[href*="map.naver"], a[href*="map.kakao"], a[href*="google.com/maps"], a[href*="naver.me"], a[href*="nmap"]').forEach(function(el) {
      el.addEventListener('click', function() {
        var mapType = 'unknown';
        if (el.href.includes('naver') || el.href.includes('nmap')) mapType = 'naver';
        else if (el.href.includes('kakao')) mapType = 'kakao';
        else if (el.href.includes('google')) mapType = 'google';
        // 길찾기 링크인지 확인
        if (el.href.includes('direction') || el.href.includes('route') || el.href.includes('길찾기') || el.textContent.includes('길찾기') || el.textContent.includes('오시는')) {
          bdAnalytics.trackDirections(mapType);
        } else {
          bdAnalytics.trackMapClick(mapType);
        }
      });
    });

    // 4-1. 길찾기 버튼 자동 감지 (data-directions 속성 또는 텍스트 기반)
    document.querySelectorAll('[data-directions], a:not([href*="map"])').forEach(function(el) {
      if (el.dataset && el.dataset.directions) {
        el.addEventListener('click', function() {
          bdAnalytics.trackDirections(el.dataset.directions);
        });
      }
    });

    // 5. 외부 링크 자동 감지
    document.querySelectorAll('a[href^="http"]').forEach(function(el) {
      if (el.href && !el.href.includes('bdbddc.com') && !el.href.includes('localhost')) {
        el.addEventListener('click', function() {
          bdAnalytics.trackOutboundClick(el.href, el.textContent.trim().substring(0, 50));
        });
      }
    });

    // 6. 치료 페이지 자동 이벤트
    if (pageType === 'treatment' && treatmentName) {
      bdAnalytics.trackTreatmentView(treatmentName);
    }

    // 7. 의사 페이지 자동 이벤트
    if (pageType === 'doctor' && doctorName) {
      bdAnalytics.trackDoctorView(doctorName);
    }

    // 8. 가격 페이지 자동 이벤트
    if (pageType === 'pricing') {
      bdAnalytics.trackPricingView();
    }

    // 9. 스크롤 깊이 트래킹 (25%, 50%, 75%, 100%)
    var scrollMarks = { 25: false, 50: false, 75: false, 100: false };
    window._bdMaxScroll = 0;
    window.addEventListener('scroll', function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) return;
      var scrollPercent = Math.round((scrollTop / docHeight) * 100);

      [25, 50, 75, 100].forEach(function(mark) {
        if (scrollPercent >= mark && !scrollMarks[mark]) {
          scrollMarks[mark] = true;
          bdAnalytics.trackScroll(mark);
        }
      });
    }, { passive: true });

    // 10. FAQ 아코디언 자동 감지
    document.querySelectorAll('.faq-question, [data-faq], details summary, .accordion-header').forEach(function(el) {
      el.addEventListener('click', function() {
        bdAnalytics.trackFaqClick(el.textContent.trim().substring(0, 100));
      });
    });

    // 11. Area 페이지 전용 CTA 정밀 추적 (data-area + data-treatment + data-cta)
    // → GA4에서 '어느 지역 키워드가 전환(전화/예약/카카오)으로 이어지는지' 측정
    document.querySelectorAll('[data-cta][data-area][data-treatment]').forEach(function(el) {
      el.addEventListener('click', function() {
        var ctaType = el.dataset.cta;          // 'phone', 'reservation', 'kakao', 'directions'
        var ctaArea = el.dataset.area;          // 'asan', 'daejeon', 'sejong'
        var ctaTreatment = el.dataset.treatment; // 'implant', 'invisalign', 'laminate'
        var ctaSection = el.closest('section') ? el.closest('section').getAttribute('aria-label') || el.closest('section').className : 'unknown';

        // ★ GA4 커스텀 이벤트: area_cta_click (핵심 전환 이벤트)
        if (typeof gtag === 'function') {
          gtag('event', 'area_cta_click', {
            event_category: 'area_conversion',
            cta_type: ctaType,
            area_name: ctaArea,
            treatment_type: ctaTreatment,
            cta_section: ctaSection,
            page_path: path
          });
        }
        // Amplitude 이벤트
        amplitude.track('Area CTA Click', {
          cta_type: ctaType,
          area_name: ctaArea,
          treatment_type: ctaTreatment,
          cta_section: ctaSection,
          page_path: path,
          device_type: deviceType,
          channel: refInfo.channel
        });
        // Meta Pixel: 지역별 전환 이벤트
        if (typeof fbq === 'function' && (ctaType === 'phone' || ctaType === 'reservation' || ctaType === 'kakao')) {
          fbq('trackCustom', 'AreaConversion', {
            area: ctaArea,
            treatment: ctaTreatment,
            cta_type: ctaType
          });
        }
      });
    });

    // 11-1. 일반 CTA 버튼 자동 감지 (area CTA가 아닌 경우)
    document.querySelectorAll('[data-cta]:not([data-area]), .btn-cta, .cta-btn').forEach(function(el) {
      el.addEventListener('click', function() {
        var name = el.dataset.cta || el.textContent.trim().substring(0, 30);
        bdAnalytics.trackCTA(name, el.closest('section') ? el.closest('section').className : 'unknown');
      });
    });

    // 12. 회원가입/로그인 폼 자동 감지
    document.querySelectorAll('form[action*="register"], form[action*="signup"], #registerForm').forEach(function(el) {
      el.addEventListener('submit', function() {
        bdAnalytics.trackSignup('email');
      });
    });

    // 13. Area 페이지 진입 시 area_page_view 이벤트 (지역·치료 파라미터 포함)
    if (pageType === 'area_seo' && areaName) {
      if (typeof gtag === 'function') {
        gtag('event', 'area_page_view', {
          event_category: 'area_engagement',
          area_name: areaName,
          treatment_type: areaTreatment || 'general',
          channel: refInfo.channel,
          source: refInfo.source,
          device_type: deviceType
        });
      }
      amplitude.track('Area Page View', {
        area_name: areaName,
        treatment_type: areaTreatment || 'general',
        page_path: path,
        channel: refInfo.channel,
        source: refInfo.source,
        device_type: deviceType
      });
      // 지역 SEO 페이지 방문 유저 프로퍼티 누적
      safeIdentify(function(aid) {
        aid.add('area_pages_viewed', 1);
        aid.append('viewed_areas', areaName);
        if (areaTreatment) aid.append('viewed_area_treatments', areaTreatment);
      });
    }

    console.log('[BD Analytics v5] GA4 전환추적 강화 + Area CTA 정밀추적 + Amplitude(Script Loader) 초기화 완료 | page_type=' + pageType + (areaName ? ' | area=' + areaName + '/' + areaTreatment : '') + ' | channel=' + refInfo.channel + '/' + refInfo.source);
  });

})();
