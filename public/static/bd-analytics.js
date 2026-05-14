/**
 * bd-analytics.js v1.0
 * 서울비디치과 Amplitude 커스텀 이벤트 트래킹
 * 
 * 핵심 퍼널: Page View → Doctor View → CTA Click → Reservation/Phone/Kakao Click
 * 
 * 추적 이벤트 목록:
 *   - Page View          : 모든 페이지 조회 (페이지 타입, URL, referrer)
 *   - CTA Click          : 예약/전화/카카오 등 CTA 버튼 클릭
 *   - Reservation Click  : 예약 페이지 이동 또는 예약 폼 도달
 *   - Phone Call Click   : 전화번호 링크(tel:) 클릭
 *   - Kakao Click        : 카카오톡 상담 링크 클릭
 *   - Doctor View        : 의료진 프로필 페이지 조회
 *   - Treatment View     : 진료과목 페이지 조회
 *   - Scroll Depth       : 25/50/75/100% 스크롤 도달
 *   - Outbound Click     : 외부 링크 클릭 (네이버맵, 유튜브, 인스타 등)
 *   - FAQ Click          : FAQ 항목 클릭
 *   - Area Page View     : 지역 랜딩페이지 조회
 *   - Game Start         : 치BTI 등 게임 시작
 */
(function () {
  'use strict';

  // amplitude SDK 로드 대기
  function waitForAmplitude(cb, retries) {
    retries = retries || 0;
    if (window.amplitude && typeof window.amplitude.track === 'function') {
      cb();
    } else if (retries < 30) {
      setTimeout(function () { waitForAmplitude(cb, retries + 1); }, 100);
    }
  }

  // 중복 방지용 Set
  var _sent = {};

  /**
   * bdTrack — Amplitude 이벤트 전송 래퍼
   * @param {string} name  이벤트 이름
   * @param {Object} props 이벤트 속성
   * @param {boolean} once true면 같은 name은 세션당 1번만 전송
   */
  function bdTrack(name, props, once) {
    if (once && _sent[name]) return;
    if (once) _sent[name] = true;
    try {
      window.amplitude.track(name, props || {});
    } catch (e) { /* silent */ }
  }

  // ──────────────────────────────────────
  // 페이지 정보 감지
  // ──────────────────────────────────────
  var path = location.pathname;
  var pageType = 'other';
  var pageDetail = '';

  if (path === '/' || path === '/index.html') {
    pageType = 'home';
  } else if (path.indexOf('/treatments/') === 0 || path === '/treatments') {
    pageType = 'treatment';
    pageDetail = path.replace('/treatments/', '').replace(/\/$/, '') || 'index';
  } else if (path.indexOf('/doctors/') === 0 || path === '/doctors') {
    pageType = 'doctor';
    pageDetail = path.replace('/doctors/', '').replace(/\/$/, '') || 'index';
  } else if (path === '/reservation' || path === '/reservation/') {
    pageType = 'reservation';
  } else if (path === '/pricing' || path === '/pricing/') {
    pageType = 'pricing';
  } else if (path.indexOf('/cases') === 0) {
    pageType = 'cases';
    pageDetail = path.replace('/cases/', '').replace(/\/$/, '') || 'gallery';
  } else if (path === '/directions' || path === '/directions/') {
    pageType = 'directions';
  } else if (path.indexOf('/faq') === 0) {
    pageType = 'faq';
    pageDetail = path.replace('/faq/', '').replace(/\/$/, '') || 'index';
  } else if (path.indexOf('/area/') === 0) {
    pageType = 'area';
    pageDetail = path.replace('/area/', '').replace('.html', '').replace(/\/$/, '');
  } else if (path.indexOf('/encyclopedia') === 0) {
    pageType = 'encyclopedia';
    pageDetail = decodeURIComponent(path.replace('/encyclopedia/', '').replace(/\/$/, '')) || 'index';
  } else if (path.indexOf('/column') === 0) {
    pageType = 'column';
    pageDetail = path.replace('/column/', '').replace(/\/$/, '') || 'index';
  } else if (path === '/checkup' || path === '/checkup/') {
    pageType = 'checkup';
  } else if (path.indexOf('/blog') === 0) {
    pageType = 'blog';
  } else if (path.indexOf('/jp') === 0) {
    pageType = 'intl'; pageDetail = 'jp';
  } else if (path.indexOf('/cn') === 0) {
    pageType = 'intl'; pageDetail = 'cn';
  } else if (path.indexOf('/en') === 0) {
    pageType = 'intl'; pageDetail = 'en';
  } else if (path.indexOf('/vi') === 0) {
    pageType = 'intl'; pageDetail = 'vi';
  } else if (path.indexOf('/ru') === 0) {
    pageType = 'intl'; pageDetail = 'ru';
  } else if (path === '/games' || path === '/games/' || path === '/run' || path === '/run/') {
    pageType = 'game';
  } else if (path.indexOf('/video') === 0) {
    pageType = 'video';
  } else if (path.indexOf('/notice') === 0) {
    pageType = 'notice';
  }

  waitForAmplitude(function () {

    // ──────────────────────────────────────
    // 1. Page View (모든 페이지)
    // ──────────────────────────────────────
    bdTrack('Page View', {
      page_type: pageType,
      page_detail: pageDetail,
      page_path: path,
      page_title: document.title,
      referrer: document.referrer || '(direct)',
      referrer_domain: document.referrer ? (new URL(document.referrer)).hostname : '(direct)'
    }, true);

    // ──────────────────────────────────────
    // 2. 특화 페이지 뷰 이벤트
    // ──────────────────────────────────────
    if (pageType === 'doctor' && pageDetail && pageDetail !== 'index') {
      bdTrack('Doctor View', { doctor: pageDetail, page_path: path }, true);
    }
    if (pageType === 'treatment' && pageDetail && pageDetail !== 'index') {
      bdTrack('Treatment View', { treatment: pageDetail, page_path: path }, true);
    }
    if (pageType === 'reservation') {
      bdTrack('Reservation Page View', { referrer: document.referrer || '(direct)' }, true);
    }
    if (pageType === 'pricing') {
      bdTrack('Pricing View', { referrer: document.referrer || '(direct)' }, true);
    }
    if (pageType === 'area') {
      bdTrack('Area Page View', { area: pageDetail, page_path: path }, true);
    }

    // ──────────────────────────────────────
    // 3. 클릭 이벤트 (이벤트 위임)
    // ──────────────────────────────────────
    document.addEventListener('click', function (e) {
      var el = e.target;
      // 최대 5단계 부모까지 <a> 탐색
      for (var i = 0; i < 5 && el && el !== document; i++) {
        if (el.tagName === 'A') break;
        el = el.parentElement;
      }
      if (!el || el.tagName !== 'A') return;

      var href = el.getAttribute('href') || '';

      // (a) 전화 클릭
      if (href.indexOf('tel:') === 0) {
        bdTrack('Phone Call Click', {
          phone_number: href.replace('tel:', ''),
          page_type: pageType,
          page_path: path,
          click_text: (el.textContent || '').trim().slice(0, 80)
        });
        return;
      }

      // (b) 카카오톡 클릭
      if (href.indexOf('pf.kakao.com') > -1) {
        bdTrack('Kakao Click', {
          page_type: pageType,
          page_path: path,
          click_text: (el.textContent || '').trim().slice(0, 80)
        });
        return;
      }

      // (c) 예약 페이지 이동
      if (href === '/reservation' || href === '/reservation/') {
        bdTrack('Reservation Click', {
          page_type: pageType,
          page_path: path,
          click_text: (el.textContent || '').trim().slice(0, 80)
        });
        return;
      }

      // (d) CTA 버튼 클릭 (예약/전화/카카오 외의 CTA 클래스)
      var cls = el.className || '';
      if (typeof cls === 'string' && (cls.indexOf('cta') > -1 || cls.indexOf('CTA') > -1)) {
        bdTrack('CTA Click', {
          cta_type: href.indexOf('tel:') === 0 ? 'phone' : href.indexOf('kakao') > -1 ? 'kakao' : href === '/reservation' ? 'reservation' : 'other',
          cta_href: href.slice(0, 200),
          cta_text: (el.textContent || '').trim().slice(0, 80),
          page_type: pageType,
          page_path: path
        });
        return;
      }

      // (e) 외부 링크 클릭
      if (href.indexOf('http') === 0 && href.indexOf(location.hostname) === -1) {
        var domain = '';
        try { domain = (new URL(href)).hostname; } catch (x) { domain = href; }
        bdTrack('Outbound Click', {
          outbound_url: href.slice(0, 300),
          outbound_domain: domain,
          page_type: pageType,
          page_path: path
        });
        return;
      }

      // (f) FAQ 항목 클릭
      if (pageType === 'faq' && (cls.indexOf('faq') > -1 || el.closest('[data-faq]') || el.closest('.faq-item') || el.closest('.faq-q'))) {
        bdTrack('FAQ Click', {
          question: (el.textContent || '').trim().slice(0, 120),
          page_path: path
        });
      }
    });

    // ──────────────────────────────────────
    // 4. 스크롤 깊이 추적 (25/50/75/100%)
    // ──────────────────────────────────────
    var scrollMarks = { 25: false, 50: false, 75: false, 100: false };
    var scrollTimer = null;

    function checkScroll() {
      var docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      var winH = window.innerHeight;
      var scrolled = window.scrollY || window.pageYOffset;
      if (docH <= winH) return; // 스크롤 불필요한 짧은 페이지
      var pct = Math.round(((scrolled + winH) / docH) * 100);

      [25, 50, 75, 100].forEach(function (mark) {
        if (pct >= mark && !scrollMarks[mark]) {
          scrollMarks[mark] = true;
          bdTrack('Scroll Depth', {
            depth: mark,
            page_type: pageType,
            page_path: path
          });
        }
      });
    }

    window.addEventListener('scroll', function () {
      if (scrollTimer) return;
      scrollTimer = setTimeout(function () {
        scrollTimer = null;
        checkScroll();
      }, 300);
    }, { passive: true });

    // ──────────────────────────────────────
    // 5. 게임 이벤트 (checkup 페이지 = 치BTI)
    // ──────────────────────────────────────
    if (pageType === 'checkup' || pageType === 'game') {
      // 전역 함수로 노출하여 게임 코드에서 호출 가능
      window.bdTrackGame = function (action, props) {
        bdTrack('Game ' + action, Object.assign({ page_path: path }, props || {}));
      };
    }

    // ──────────────────────────────────────
    // 6. 전역 bdTrack 함수 노출 (다른 인라인 스크립트에서 사용 가능)
    // ──────────────────────────────────────
    window.bdTrack = bdTrack;

  }); // end waitForAmplitude

})();
