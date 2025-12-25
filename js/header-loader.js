/**
 * 서울비디치과 - Header Component Loader v1.0.0
 * Header 컴포넌트를 동적으로 로드하여 유지보수성 향상
 * 59개 HTML 페이지의 헤더 중복 코드를 한 곳에서 관리
 * Updated: 2024-12-10
 */

(function() {
  'use strict';

  // 프로덕션 환경 감지
  const IS_PRODUCTION = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

  /**
   * 현재 페이지 depth에 따른 경로 프리픽스 계산
   * @returns {string} - './' 또는 '../' 등
   */
  function getPathPrefix() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    
    // 루트 디렉토리인 경우
    if (depth <= 0 || path === '/' || path.endsWith('index.html') && !path.includes('/')) {
      return './';
    }
    
    // 하위 디렉토리인 경우
    let prefix = '';
    for (let i = 0; i < depth; i++) {
      prefix += '../';
    }
    return prefix || './';
  }

  /**
   * 현재 페이지의 메뉴 활성화
   * @param {HTMLElement} header - 헤더 엘리먼트
   */
  function setActiveNavItem(header) {
    const currentPath = window.location.pathname;
    const navLinks = header.querySelectorAll('.main-nav a, .mobile-nav-menu a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace(/^\.\.\/|^\.\//, ''))) {
        link.classList.add('active');
        // 상위 메뉴도 활성화
        const parentItem = link.closest('.nav-item, .mobile-nav-item');
        if (parentItem) {
          parentItem.classList.add('active');
        }
      }
    });
  }

  /**
   * 진료 상태 업데이트 (영업시간 기준)
   * @param {HTMLElement} header - 헤더 엘리먼트
   */
  function updateClinicStatus(header) {
    const statusEl = header.querySelector('.clinic-status');
    if (!statusEl) return;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    // 영업시간 (분 단위)
    // 평일: 09:30 ~ 20:00, 토: 09:30 ~ 16:30, 일/공휴일: 09:30 ~ 14:30
    const schedules = {
      weekday: { open: 9 * 60 + 30, close: 20 * 60 },
      saturday: { open: 9 * 60 + 30, close: 16 * 60 + 30 },
      sunday: { open: 9 * 60 + 30, close: 14 * 60 + 30 }
    };

    let schedule;
    let closeTimeText;

    if (day === 0) { // 일요일
      schedule = schedules.sunday;
      closeTimeText = '14:30까지';
    } else if (day === 6) { // 토요일
      schedule = schedules.saturday;
      closeTimeText = '16:30까지';
    } else { // 평일
      schedule = schedules.weekday;
      closeTimeText = '20:00까지';
    }

    const isOpen = currentTime >= schedule.open && currentTime < schedule.close;

    statusEl.classList.toggle('open', isOpen);
    statusEl.classList.toggle('closed', !isOpen);

    const statusText = statusEl.querySelector('.status-text');
    const statusTime = statusEl.querySelector('.status-time');

    if (statusText) {
      statusText.textContent = isOpen ? '진료중' : '진료종료';
    }
    if (statusTime) {
      statusTime.textContent = isOpen ? closeTimeText : '내일 09:30 오픈';
    }
  }

  /**
   * Header HTML 템플릿 생성
   * @param {string} prefix - 경로 프리픽스
   * @returns {string} - 헤더 HTML
   */
  function generateHeaderTemplate(prefix) {
    // 루트 경로 사용 (프로덕션) 또는 상대 경로 (개발)
    const p = IS_PRODUCTION ? '/' : prefix;
    
    return `
    <!-- ■ 통합 헤더 -->
    <header class="site-header" id="siteHeader">
        <div class="header-container">
            <!-- 로고 + 진료상태 -->
            <div class="header-brand">
                <a href="${p}index.html" class="site-logo">
                    <span class="logo-icon">🦷</span>
                    <span class="logo-text">서울비디치과</span>
                </a>
                <div class="clinic-status open">
                    <span class="status-dot"></span>
                    <span class="status-text">진료중</span>
                    <span class="status-time">20:00까지</span>
                </div>
            </div>
            
            <!-- 메인 네비게이션 -->
            <nav class="main-nav" id="mainNav">
                <ul>
                    <!-- 진료 안내 (메가 드롭다운) -->
                    <li class="nav-item has-dropdown">
                        <a href="${p}treatments/index.html">진료 안내</a>
                        <div class="mega-dropdown">
                            <div class="mega-dropdown-grid">
                                <div class="mega-dropdown-section">
                                    <h4>전문센터</h4>
                                    <ul>
                                        <li><a href="${p}treatments/glownate.html" class="nav-highlight">✨ 글로우네이트 <span class="badge" style="background: linear-gradient(135deg, #C9A962, #8B5A2B); color: #fff;">HOT</span></a></li>
                                        <li><a href="${p}treatments/implant.html">임플란트센터 <span class="badge">6개 수술실</span></a></li>
                                        <li><a href="${p}treatments/invisalign.html">교정센터(인비절라인) <span class="badge">국내 최대</span></a></li>
                                        <li><a href="${p}treatments/pediatric.html">소아치과 <span class="badge">전문의 3인</span></a></li>
                                        <li><a href="${p}treatments/aesthetic.html">심미치료(현정민 원장)</a></li>
                                    </ul>
                                </div>
                                <div class="mega-dropdown-section">
                                    <h4>일반/보존 진료</h4>
                                    <ul>
                                        <li><a href="${p}treatments/cavity.html">충치치료</a></li>
                                        <li><a href="${p}treatments/resin.html">레진치료</a></li>
                                        <li><a href="${p}treatments/crown.html">크라운</a></li>
                                        <li><a href="${p}treatments/inlay.html">인레이/온레이</a></li>
                                        <li><a href="${p}treatments/root-canal.html">신경치료</a></li>
                                        <li><a href="${p}treatments/whitening.html">미백</a></li>
                                    </ul>
                                </div>
                                <div class="mega-dropdown-section">
                                    <h4>잇몸/외과</h4>
                                    <ul>
                                        <li><a href="${p}treatments/scaling.html">스케일링</a></li>
                                        <li><a href="${p}treatments/gum.html">잇몸치료</a></li>
                                        <li><a href="${p}treatments/periodontitis.html">치주염</a></li>
                                        <li><a href="${p}treatments/wisdom-tooth.html">사랑니 발치</a></li>
                                        <li><a href="${p}treatments/tmj.html">턱관절장애</a></li>
                                        <li><a href="${p}treatments/bruxism.html">이갈이/이악물기</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </li>
                    
                    <!-- 의료진 소개 -->
                    <li class="nav-item">
                        <a href="${p}doctors/index.html">의료진 소개</a>
                    </li>
                    
                    <!-- 검진센터 -->
                    <li class="nav-item">
                        <a href="${p}bdx/index.html">검진센터</a>
                    </li>
                    
                    <!-- 콘텐츠 (드롭다운) - 3개 메뉴 -->
                    <li class="nav-item has-dropdown">
                        <a href="${p}column/columns.html">콘텐츠</a>
                        <ul class="simple-dropdown">
                            <li><a href="${p}column/columns.html"><i class="fas fa-pen-fancy"></i> 칼럼</a></li>
                            <li><a href="${p}video/index.html"><i class="fab fa-youtube"></i> 영상</a></li>
                            <li><a href="${p}cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li>
                        </ul>
                    </li>
                    
                    <!-- 병원 안내 (드롭다운) - 공지사항 포함 -->
                    <li class="nav-item has-dropdown">
                        <a href="${p}directions.html">병원 안내</a>
                        <ul class="simple-dropdown">
                            <li><a href="${p}pricing.html" class="nav-highlight">💰 비용 안내</a></li>
                            <li><a href="${p}floor-guide.html">층별 안내</a></li>
                            <li><a href="${p}directions.html">오시는 길</a></li>
                            <li><a href="${p}faq.html">자주 묻는 질문</a></li>
                            <li><a href="${p}notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
            
            <!-- 헤더 액션 -->
            <div class="header-actions">
                <a href="tel:0414152892" class="header-phone">
                    <i class="fas fa-phone"></i>
                    041-415-2892
                </a>
                <a href="${p}reservation.html" class="btn-reserve">
                    <i class="fas fa-calendar-check"></i>
                    예약하기
                </a>
                <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </header>

    <!-- 헤더 높이만큼 여백 -->
    <div class="header-spacer" style="height: 72px;"></div>

    <!-- ■ Mobile Navigation -->
    <nav class="mobile-nav" id="mobileNav">
        <div class="mobile-nav-header">
            <span class="logo-icon">🦷</span>
            <button class="mobile-nav-close" id="mobileNavClose"><i class="fas fa-times"></i></button>
        </div>
        <ul class="mobile-nav-menu">
            <!-- 진료 안내 -->
            <li class="mobile-nav-item has-submenu">
                <a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
                    <i class="fas fa-tooth"></i> 진료 안내
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </a>
                <ul class="mobile-nav-submenu">
                    <li><a href="${p}treatments/index.html">전체 진료</a></li>
                    <li class="submenu-divider">전문센터</li>
                    <li><a href="${p}treatments/glownate.html" style="color: #C9A962; font-weight: 600; background: rgba(201, 169, 98, 0.1);">✨ 글로우네이트 <span style="background: linear-gradient(135deg, #C9A962, #8B5A2B); color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; margin-left: 6px;">HOT</span></a></li>
                    <li><a href="${p}treatments/implant.html">임플란트센터</a></li>
                    <li><a href="${p}treatments/invisalign.html">교정센터 (인비절라인)</a></li>
                    <li><a href="${p}treatments/pediatric.html">소아치과</a></li>
                    <li><a href="${p}treatments/aesthetic.html">심미치료(현정민 원장)</a></li>
                    <li class="submenu-divider">일반 진료</li>
                    <li><a href="${p}treatments/cavity.html">충치치료</a></li>
                    <li><a href="${p}treatments/resin.html">레진치료</a></li>
                    <li><a href="${p}treatments/scaling.html">스케일링</a></li>
                    <li><a href="${p}treatments/gum.html">잇몸치료</a></li>
                </ul>
            </li>
            <!-- 의료진 소개 -->
            <li><a href="${p}doctors/index.html"><i class="fas fa-user-md"></i> 의료진 소개</a></li>
            <!-- 검진센터 -->
            <li><a href="${p}bdx/index.html"><i class="fas fa-microscope"></i> 검진센터</a></li>
            <!-- 콘텐츠 (3개 메뉴) -->
            <li class="mobile-nav-item has-submenu">
                <a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
                    <i class="fas fa-newspaper"></i> 콘텐츠
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </a>
                <ul class="mobile-nav-submenu">
                    <li><a href="${p}column/columns.html"><i class="fas fa-pen-fancy"></i> 칼럼</a></li>
                    <li><a href="${p}video/index.html"><i class="fab fa-youtube"></i> 영상</a></li>
                    <li><a href="${p}cases/gallery.html"><i class="fas fa-lock"></i> 비포/애프터</a></li>
                </ul>
            </li>
            <!-- 병원 안내 (공지사항 포함) -->
            <li class="mobile-nav-item has-submenu">
                <a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">
                    <i class="fas fa-hospital"></i> 병원 안내
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </a>
                <ul class="mobile-nav-submenu">
                    <li><a href="${p}pricing.html" class="nav-highlight">💰 비용 안내</a></li>
                    <li><a href="${p}floor-guide.html">층별 안내</a></li>
                    <li><a href="${p}directions.html">오시는 길</a></li>
                    <li><a href="${p}faq.html">자주 묻는 질문</a></li>
                    <li><a href="${p}notice/index.html"><i class="fas fa-bullhorn"></i> 공지사항</a></li>
                </ul>
            </li>
            <!-- 예약하기 -->
            <li><a href="${p}reservation.html" class="highlight"><i class="fas fa-calendar-check"></i> 예약하기</a></li>
        </ul>
        <div class="mobile-nav-footer">
            <p class="mobile-nav-hours"><i class="fas fa-clock"></i> 365일 진료 | 평일 야간진료</p>
            <div class="mobile-nav-quick-btns">
                <a href="${p}pricing.html" class="btn btn-secondary btn-lg">
                    <i class="fas fa-won-sign"></i> 비용 안내
                </a>
                <a href="tel:041-415-2892" class="btn btn-primary btn-lg">
                    <i class="fas fa-phone"></i> 전화 예약
                </a>
            </div>
        </div>
    </nav>
    <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>

    <!-- ■ 플로팅 CTA 버튼 -->
    <div class="floating-cta">
        <a href="javascript:void(0)" class="floating-btn top" aria-label="맨 위로" role="button" id="scrollToTopBtn">
            <i class="fas fa-arrow-up"></i>
            <span class="tooltip">맨 위로</span>
        </a>
        <a href="https://pf.kakao.com/_Cxivlxb" class="floating-btn kakao" target="_blank" aria-label="카카오톡 상담">
            <i class="fas fa-comment"></i>
            <span class="tooltip">카카오톡 상담</span>
        </a>
        <a href="tel:0414152892" class="floating-btn phone" aria-label="전화 상담">
            <i class="fas fa-phone"></i>
            <span class="tooltip">전화 상담</span>
        </a>
    </div>

    <!-- 카카오톡 상담 위젯 -->
    <div class="kakao-widget" id="kakaoWidget">
        <button class="kakao-widget-close" aria-label="닫기">×</button>
        <div class="kakao-widget-header">
            <div class="icon">💬</div>
            <div>
                <h4>카카오톡 상담</h4>
                <p>서울비디치과</p>
            </div>
        </div>
        <div class="kakao-widget-body">
            <p>궁금한 점이 있으시면 편하게 문의해 주세요! 빠르게 답변 드리겠습니다.</p>
            <a href="https://pf.kakao.com/_Cxivlxb" class="kakao-widget-btn" target="_blank">
                카카오톡으로 상담하기
            </a>
        </div>
    </div>
    `;
  }

  /**
   * 헤더 초기화 함수
   */
  function initHeader() {
    // 헤더를 삽입할 위치 찾기
    const headerPlaceholder = document.getElementById('header-placeholder');
    const bodyFirst = document.body.firstElementChild;
    
    // 경로 프리픽스 계산
    const prefix = getPathPrefix();
    
    // 헤더 HTML 생성
    const headerHTML = generateHeaderTemplate(prefix);
    
    // 임시 컨테이너 생성
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = headerHTML;
    
    // 헤더 삽입
    if (headerPlaceholder) {
      // placeholder가 있으면 교체
      headerPlaceholder.outerHTML = headerHTML;
    } else if (bodyFirst) {
      // body 첫 번째 요소 앞에 삽입
      while (tempDiv.firstChild) {
        bodyFirst.parentNode.insertBefore(tempDiv.firstChild, bodyFirst);
      }
    }
    
    // 헤더 요소 참조
    const header = document.getElementById('siteHeader');
    if (!header) return;
    
    // 진료 상태 업데이트
    updateClinicStatus(header);
    
    // 현재 페이지 활성화
    setActiveNavItem(header);
    
    // 매 분마다 진료 상태 업데이트
    setInterval(() => updateClinicStatus(header), 60000);
    
    // 모바일 메뉴 이벤트 바인딩
    initMobileMenu();
    
    // 플로팅 버튼 이벤트
    initFloatingButtons();
    
    console.log('[Header Loader] Header initialized successfully');
  }

  /**
   * 모바일 메뉴 초기화
   */
  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');

    if (!mobileMenuBtn || !mobileNav) return;

    function openMobileNav() {
      mobileNav.classList.add('open');
      mobileNavOverlay?.classList.add('show');
      document.body.style.overflow = 'hidden';
      mobileMenuBtn.classList.add('active');
    }

    function closeMobileNav() {
      mobileNav.classList.remove('open');
      mobileNavOverlay?.classList.remove('show');
      document.body.style.overflow = '';
      mobileMenuBtn.classList.remove('active');
    }

    mobileMenuBtn.addEventListener('click', openMobileNav);
    mobileNavClose?.addEventListener('click', closeMobileNav);
    mobileNavOverlay?.addEventListener('click', closeMobileNav);

    // 서브메뉴 토글
    const submenuToggles = document.querySelectorAll('.mobile-nav-submenu-toggle');
    submenuToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        const parent = this.closest('.has-submenu');
        const isOpen = parent.classList.contains('open');
        
        // 다른 열린 메뉴 닫기
        document.querySelectorAll('.mobile-nav-item.open').forEach(item => {
          if (item !== parent) item.classList.remove('open');
        });
        
        parent.classList.toggle('open', !isOpen);
        this.setAttribute('aria-expanded', !isOpen);
      });
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMobileNav();
      }
    });
  }

  /**
   * 플로팅 버튼 초기화
   */
  function initFloatingButtons() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const floatingCta = document.querySelector('.floating-cta');
    
    if (scrollToTopBtn) {
      // 스크롤 탑 버튼
      scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      // 스크롤 위치에 따라 표시/숨김
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (floatingCta) {
          floatingCta.classList.toggle('visible', currentScroll > 300);
        }
        
        lastScroll = currentScroll;
      }, { passive: true });
    }
    
    // 카카오 위젯
    const kakaoBtn = document.querySelector('.floating-btn.kakao');
    const kakaoWidget = document.getElementById('kakaoWidget');
    const kakaoWidgetClose = kakaoWidget?.querySelector('.kakao-widget-close');
    
    if (kakaoBtn && kakaoWidget) {
      kakaoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        kakaoWidget.classList.toggle('show');
      });
      
      kakaoWidgetClose?.addEventListener('click', () => {
        kakaoWidget.classList.remove('show');
      });
    }
  }

  // DOM Ready 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }

  // 전역 API 노출 (선택적)
  window.SeoulBDHeader = {
    init: initHeader,
    updateClinicStatus: () => {
      const header = document.getElementById('siteHeader');
      if (header) updateClinicStatus(header);
    }
  };

})();
