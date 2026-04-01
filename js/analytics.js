/**
 * 서울비디치과 통합 Analytics
 * GTM (GTM-KKVMVZHK) → GA4 (G-3NQP355YQM) + Amplitude (87529341cb075dcdbefabce3994958aa)
 * 핵심 이벤트 자동 트래킹 — GA4는 GTM에서 관리, Amplitude는 직접 SDK
 */
(function() {
  'use strict';

  // ─── Amplitude SDK 초기화 ───
  !function(){"use strict";!function(e,t){var r=e.amplitude||{_q:[],_iq:{}};if(r.invoked)e.console&&console.error&&console.error("Amplitude snippet has been loaded.");else{var n=function(e,t){e.prototype[t]=function(){return this._q.push({name:t,args:Array.prototype.slice.call(arguments,0)}),this}},s=function(e,t,r){return function(n){e._q.push({name:t,args:Array.prototype.slice.call(arguments,0),resolve:n})}},o=function(e,t,r){e._q.push({name:t,args:Array.prototype.slice.call(arguments,0)})},i=function(e,t,r){e[t]=function(){if(r)return{promise:new Promise(s(e,t,r))};o(e,t,r)}},a=function(e){for(var t=0;t<m.length;t++)i(e,m[t],!1);for(var r=0;r<g.length;r++)i(e,g[r],!0)};r.invoked=!0;var u=t.createElement("script");u.type="text/javascript",u.crossOrigin="anonymous",u.async=!0,u.src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz",u.onload=function(){e.amplitude.runQueuedFunctions||console.log("[Amplitude] Error: could not load SDK")};var c=t.getElementsByTagName("script")[0];c.parentNode.insertBefore(u,c);var l=function(){return this._q=[],this},p=["add","append","clearAll","prepend","set","setOnce","unset","preInsert","postInsert","remove","getUserProperties"];for(var d=0;d<p.length;d++)n(l,p[d]);r.Identify=l;var f=function(){return this._q=[],this},v=["getEventProperties","setProductId","setQuantity","setPrice","setRevenue","setRevenueType","setEventProperties"];for(var h=0;h<v.length;h++)n(f,v[h]);r.Revenue=f;var m=["getDeviceId","setDeviceId","getSessionId","setSessionId","getUserId","setUserId","setOptOut","setTransport","reset","setLibrary"],g=["init","add","remove","track","logEvent","identify","groupIdentify","setGroup","revenue","flush"];a(r),r.createInstance=function(e){return r._iq[e]={_q:[]},a(r._iq[e]),r._iq[e]},e.amplitude=r}}(window,document)}();

  amplitude.init('87529341cb075dcdbefabce3994958aa', {
    defaultTracking: {
      pageViews: true,
      sessions: true,
      formInteractions: true,
      fileDownloads: true
    },
    serverZone: 'US',
    minIdLength: 1
  });

  // ─── 페이지 정보 추출 ───
  var path = window.location.pathname;
  var pageType = 'other';
  var pageName = document.title;

  if (path === '/' || path === '/index.html') pageType = 'home';
  else if (path.startsWith('/treatments/')) pageType = 'treatment';
  else if (path.startsWith('/doctors/')) pageType = 'doctor';
  else if (path.startsWith('/area/')) pageType = 'area_seo';
  else if (path.startsWith('/faq')) pageType = 'faq';
  else if (path.startsWith('/column') || path.startsWith('/video')) pageType = 'content';
  else if (path.startsWith('/cases')) pageType = 'cases';
  else if (path.includes('reservation')) pageType = 'reservation';
  else if (path.includes('pricing')) pageType = 'pricing';
  else if (path.includes('directions')) pageType = 'directions';
  else if (path.includes('mission')) pageType = 'about';
  else if (path.includes('floor-guide')) pageType = 'about';
  else if (path.includes('notice')) pageType = 'notice';
  else if (path.includes('flight')) pageType = 'game';
  else if (path.includes('checkup')) pageType = 'game';
  else if (path.includes('games')) pageType = 'game_hub';

  // 게임 이름 추출
  var gameName = '';
  if (path.includes('flight')) gameName = 'chistone_flight';
  else if (path.includes('checkup')) gameName = 'chbti';

  // 치료 이름 추출
  var treatmentName = '';
  if (pageType === 'treatment') {
    var match = path.match(/\/treatments\/([^/.]+)/);
    if (match) treatmentName = match[1];
  }

  // 의사 이름 추출
  var doctorName = '';
  if (pageType === 'doctor') {
    var match2 = path.match(/\/doctors\/([^/.]+)/);
    if (match2) doctorName = match2[1];
  }

  // 지역 추출
  var areaName = '';
  if (pageType === 'area_seo') {
    var match3 = path.match(/\/area\/([^/.]+)/);
    if (match3) areaName = match3[1];
  }

  // ─── GA4 커스텀 이벤트: 페이지뷰 상세 ───
  if (typeof gtag === 'function') {
    gtag('event', 'page_view_detail', {
      page_type: pageType,
      treatment_name: treatmentName,
      doctor_name: doctorName,
      area_name: areaName
    });
  }

  // ─── Amplitude 페이지뷰 상세 ───
  amplitude.track('Page View', {
    page_type: pageType,
    page_path: path,
    page_title: pageName,
    treatment_name: treatmentName,
    doctor_name: doctorName,
    area_name: areaName,
    referrer: document.referrer
  });

  // ─── 이벤트 트래킹 함수들 ───
  window.bdAnalytics = {
    // 예약 버튼 클릭
    trackReservation: function(source) {
      if (typeof gtag === 'function') {
        gtag('event', 'reservation_click', {
          event_category: 'conversion',
          event_label: source || pageType,
          page_type: pageType,
          treatment_name: treatmentName
        });
      }
      amplitude.track('Reservation Click', {
        source: source || pageType,
        page_type: pageType,
        page_path: path,
        treatment_name: treatmentName
      });
    },

    // 전화 클릭
    trackPhoneCall: function(source) {
      if (typeof gtag === 'function') {
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
        treatment_name: treatmentName
      });
    },

    // 카카오 상담 클릭
    trackKakao: function(source) {
      if (typeof gtag === 'function') {
        gtag('event', 'kakao_click', {
          event_category: 'conversion',
          event_label: source || pageType
        });
      }
      amplitude.track('Kakao Click', {
        source: source || pageType,
        page_type: pageType,
        page_path: path
      });
    },

    // 치료 페이지 조회 (상세)
    trackTreatmentView: function(name) {
      if (typeof gtag === 'function') {
        gtag('event', 'treatment_view', {
          event_category: 'engagement',
          treatment_name: name || treatmentName
        });
      }
      amplitude.track('Treatment View', {
        treatment_name: name || treatmentName,
        page_path: path
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
        page_path: path
      });
    },

    // 가격표 조회
    trackPricingView: function() {
      if (typeof gtag === 'function') {
        gtag('event', 'pricing_view', { event_category: 'engagement' });
      }
      amplitude.track('Pricing View', { page_path: path, referrer: document.referrer });
    },

    // FAQ 클릭
    trackFaqClick: function(question) {
      if (typeof gtag === 'function') {
        gtag('event', 'faq_click', { event_category: 'engagement', event_label: question });
      }
      amplitude.track('FAQ Click', { question: question, page_path: path });
    },

    // 스크롤 깊이 (자동)
    trackScroll: function(depth) {
      if (typeof gtag === 'function') {
        gtag('event', 'scroll_depth', { event_category: 'engagement', value: depth, page_type: pageType });
      }
      amplitude.track('Scroll Depth', { depth: depth, page_type: pageType, page_path: path });
    },

    // 지도 클릭
    trackMapClick: function(mapType) {
      if (typeof gtag === 'function') {
        gtag('event', 'map_click', { event_category: 'engagement', event_label: mapType });
      }
      amplitude.track('Map Click', { map_type: mapType, page_path: path });
    },

    // CTA 클릭 (범용)
    trackCTA: function(ctaName, ctaLocation) {
      if (typeof gtag === 'function') {
        gtag('event', 'cta_click', { event_category: 'conversion', event_label: ctaName, cta_location: ctaLocation });
      }
      amplitude.track('CTA Click', { cta_name: ctaName, cta_location: ctaLocation, page_type: pageType, page_path: path });
    },

    // ─── 게임 전용 이벤트 ───

    // 게임 시작
    trackGameStart: function(game, extra) {
      var g = game || gameName;
      var data = Object.assign({ game_name: g, page_path: path }, extra || {});
      if (typeof gtag === 'function') {
        gtag('event', 'game_start', { event_category: 'game', event_label: g, game_name: g });
      }
      amplitude.track('Game Start', data);
    },

    // 게임 종료 (점수, 등급, 플레이시간 등)
    trackGameOver: function(game, score, grade, playtimeSeconds, extra) {
      var g = game || gameName;
      var data = Object.assign({
        game_name: g,
        score: score || 0,
        grade: grade || '',
        playtime_seconds: playtimeSeconds || 0,
        page_path: path
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

    // 게임 결과 공유
    trackGameShare: function(game, method, extra) {
      var g = game || gameName;
      var data = Object.assign({
        game_name: g,
        share_method: method || 'unknown',
        page_path: path
      }, extra || {});
      if (typeof gtag === 'function') {
        gtag('event', 'game_share', {
          event_category: 'game',
          event_label: g,
          share_method: method || 'unknown'
        });
      }
      amplitude.track('Game Share', data);
    },

    // 게임 결과 조회 (치BTI 등)
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

    // 게임 허브에서 게임 선택 클릭
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

    // 게임 내 아이템 획득
    trackGameItem: function(game, itemName, extra) {
      var g = game || gameName;
      var data = Object.assign({
        game_name: g,
        item_name: itemName || '',
        page_path: path
      }, extra || {});
      amplitude.track('Game Item', data);
    },

    // 게임 재시작
    trackGameRestart: function(game, lastScore) {
      var g = game || gameName;
      if (typeof gtag === 'function') {
        gtag('event', 'game_restart', { event_category: 'game', event_label: g, last_score: lastScore || 0 });
      }
      amplitude.track('Game Restart', { game_name: g, last_score: lastScore || 0, page_path: path });
    }
  };

  // ─── 자동 이벤트 바인딩 (DOM Ready) ───
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
    document.querySelectorAll('a[href*="map.naver"], a[href*="map.kakao"], a[href*="google.com/maps"]').forEach(function(el) {
      el.addEventListener('click', function() {
        var mapType = 'unknown';
        if (el.href.includes('naver')) mapType = 'naver';
        else if (el.href.includes('kakao')) mapType = 'kakao';
        else if (el.href.includes('google')) mapType = 'google';
        bdAnalytics.trackMapClick(mapType);
      });
    });

    // 5. 치료 페이지 자동 이벤트
    if (pageType === 'treatment' && treatmentName) {
      bdAnalytics.trackTreatmentView(treatmentName);
    }

    // 6. 의사 페이지 자동 이벤트
    if (pageType === 'doctor' && doctorName) {
      bdAnalytics.trackDoctorView(doctorName);
    }

    // 7. 가격 페이지 자동 이벤트
    if (pageType === 'pricing') {
      bdAnalytics.trackPricingView();
    }

    // 8. 스크롤 깊이 트래킹 (25%, 50%, 75%, 100%)
    var scrollMarks = { 25: false, 50: false, 75: false, 100: false };
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

    // 9. FAQ 아코디언 자동 감지
    document.querySelectorAll('.faq-question, [data-faq], details summary, .accordion-header').forEach(function(el) {
      el.addEventListener('click', function() {
        bdAnalytics.trackFaqClick(el.textContent.trim().substring(0, 100));
      });
    });

    console.log('[BD Analytics] GA4 + Amplitude 초기화 완료');
  });

})();
