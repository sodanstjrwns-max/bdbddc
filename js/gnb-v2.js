/**
 * 서울비디치과 통합 GNB JavaScript
 * 헤더, 네비게이션, 플로팅 CTA, 진료 상태 표시 등
 */

(function() {
    'use strict';

    // ========================================
    // 실시간 진료 상태 표시
    // ========================================
    function updateClinicStatus() {
        const statusEl = document.querySelector('.clinic-status');
        if (!statusEl) return;

        const now = new Date();
        const day = now.getDay(); // 0: 일요일, 1-5: 평일, 6: 토요일
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;

        let isOpen = false;
        let statusText = '';
        let closeTime = '';

        // 진료시간 체크
        // 평일: 09:00-20:00 (점심 12:30-14:00)
        // 토/일: 09:00-17:00 (점심시간 없음)
        // 공휴일: 09:00-13:00 (점심시간 없음)

        const openTime = 9 * 60; // 09:00
        
        if (day >= 1 && day <= 5) {
            // 평일 (점심시간 12:30-14:00)
            const lunchStart = 12 * 60 + 30; // 12:30
            const lunchEnd = 14 * 60; // 14:00
            const closeTimeMin = 20 * 60; // 20:00
            
            if (currentTime >= openTime && currentTime < lunchStart) {
                isOpen = true;
                statusText = '진료중';
                closeTime = '20:00까지';
            } else if (currentTime >= lunchEnd && currentTime < closeTimeMin) {
                isOpen = true;
                statusText = '진료중';
                closeTime = '20:00까지';
            } else if (currentTime >= lunchStart && currentTime < lunchEnd) {
                isOpen = false;
                statusText = '점심시간';
                closeTime = '14:00 재개';
            } else {
                isOpen = false;
                statusText = '진료종료';
                closeTime = '내일 09:00';
            }
        } else {
            // 주말 (점심시간 없음)
            const closeTimeMin = 17 * 60; // 17:00
            
            if (currentTime >= openTime && currentTime < closeTimeMin) {
                isOpen = true;
                statusText = '진료중';
                closeTime = '17:00까지';
            } else {
                isOpen = false;
                statusText = '진료종료';
                closeTime = day === 0 ? '내일 09:00' : '월요일 09:00';
            }
        }

        // UI 업데이트
        statusEl.classList.toggle('open', isOpen);
        statusEl.classList.toggle('closed', !isOpen);
        statusEl.innerHTML = `
            <span class="status-dot"></span>
            <span class="status-text">${statusText}</span>
            <span class="status-time">${closeTime}</span>
        `;
    }

    // ========================================
    // 통일 메뉴 동적 주입 (모든 페이지에서 동일한 메뉴 보장)
    // ========================================
    function syncNavMenus() {
        // ── 데스크탑 메뉴 (canonical) ──
        var mainNav = document.getElementById('mainNav');
        if (mainNav) {
            mainNav.innerHTML =
            '<ul>' +
            // 진료 (mega dropdown)
            '<li class="nav-item has-dropdown"><a href="/treatments/">진료</a>' +
            '<div class="mega-dropdown"><div class="mega-dropdown-grid">' +
            '<div class="mega-dropdown-section"><strong class="section-heading">전문센터</strong><ul>' +
            '<li><a href="/treatments/glownate">✨ 글로우네이트</a></li>' +
            '<li><a href="/treatments/implant">임플란트 <span class="badge">6개 수술실</span></a></li>' +
            '<li><a href="/treatments/invisalign">인비절라인 <span class="badge">다이아몬드</span></a></li>' +
            '<li><a href="/treatments/orthodontics">치아교정 <span class="badge">장치교정</span></a></li>' +
            '<li><a href="/treatments/pediatric">소아치과 <span class="badge">전문의 3인</span></a></li>' +
            '<li><a href="/treatments/aesthetic">심미레진</a></li>' +
            '</ul></div>' +
            '<div class="mega-dropdown-section"><strong class="section-heading">일반/보존 진료</strong><ul>' +
            '<li><a href="/treatments/cavity">충치치료</a></li>' +
            '<li><a href="/treatments/resin">레진치료</a></li>' +
            '<li><a href="/treatments/crown">크라운</a></li>' +
            '<li><a href="/treatments/inlay">인레이/온레이</a></li>' +
            '<li><a href="/treatments/root-canal">신경치료</a></li>' +
            '<li><a href="/treatments/whitening">미백</a></li>' +
            '</ul></div>' +
            '<div class="mega-dropdown-section"><strong class="section-heading">잇몸/외과</strong><ul>' +
            '<li><a href="/treatments/scaling">스케일링</a></li>' +
            '<li><a href="/treatments/gum">잇몸치료</a></li>' +
            '<li><a href="/treatments/periodontitis">치주염</a></li>' +
            '<li><a href="/treatments/wisdom-tooth">사랑니 발치</a></li>' +
            '<li><a href="/treatments/tmj">턱관절장애</a></li>' +
            '<li><a href="/treatments/bruxism">이갈이/이악물기</a></li>' +
            '</ul></div>' +
            '</div></div></li>' +
            // 의료진
            '<li class="nav-item"><a href="/doctors/">의료진</a></li>' +
            // 비디미션
            '<li class="nav-item"><a href="/mission">비디미션</a></li>' +
            // 콘텐츠
            '<li class="nav-item has-dropdown"><a href="/cases/gallery">콘텐츠</a>' +
            '<ul class="simple-dropdown">' +
            '<li><a href="/cases/gallery" style="color:#6B4226;font-weight:600;">🔥 비포/애프터</a></li>' +
            '<li><a href="/symptom-checker" style="color:#EC4899;font-weight:600;">🩺 AI 증상체커</a></li>' +
            '<li><a href="/blog/"><i class="fas fa-blog"></i> 블로그</a></li>' +
            '<li><a href="/video/"><i class="fab fa-youtube"></i> 영상</a></li>' +
            '<li><a href="/encyclopedia/"><i class="fas fa-book-medical"></i> 치과 백과사전</a></li>' +
            '<li><a href="/column/"><i class="fas fa-pen-nib"></i> 원장 컬럼</a></li>' +
            '</ul></li>' +
            // 안내
            '<li class="nav-item has-dropdown"><a href="/directions">안내</a>' +
            '<ul class="simple-dropdown">' +
            '<li><a href="/pricing" class="nav-highlight">💰 비용 안내</a></li>' +
            '<li><a href="/floor-guide">비디치과 둘러보기</a></li>' +
            '<li><a href="/directions">오시는 길</a></li>' +
            '<li><a href="/faq">자주 묻는 질문</a></li>' +
            '<li><a href="/notice/"><i class="fas fa-bullhorn"></i> 공지사항</a></li>' +
            '<li><a href="/careers"><i class="fas fa-user-tie"></i> 상시채용</a></li>' +
            '</ul></li>' +
            // 플레이
            '<li class="nav-item has-dropdown"><a href="/games" style="color:#EC4899;font-weight:700;">🎮 플레이</a>' +
            '<ul class="simple-dropdown">' +
            '<li><a href="/flight"><i class="fas fa-rocket"></i> 치석 플라이트</a></li>' +
            '<li><a href="/run"><i class="fas fa-running"></i> 투쓰런</a></li>' +
            '<li><a href="/checkup"><i class="fas fa-dna"></i> 치BTI</a></li>' +
            '<li><a href="/games"><i class="fas fa-th"></i> 전체 게임</a></li>' +
            '</ul></li>' +
            '</ul>';
        }

        // ── 모바일 메뉴 (canonical) ──
        var mobileMenu = document.querySelector('.mobile-nav-menu');
        if (mobileMenu) {
            mobileMenu.innerHTML =
            // 진료
            '<li class="mobile-nav-item has-submenu">' +
            '<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">' +
            '<i class="fas fa-tooth"></i> 진료 <i class="fas fa-chevron-down toggle-icon"></i></a>' +
            '<ul class="mobile-nav-submenu">' +
            '<li><a href="/treatments/">전체 진료</a></li>' +
            '<li class="submenu-divider">전문센터</li>' +
            '<li><a href="/treatments/glownate" style="color:#6B4226;font-weight:600;">✨ 글로우네이트</a></li>' +
            '<li><a href="/treatments/implant">임플란트센터</a></li>' +
            '<li><a href="/treatments/invisalign">인비절라인</a></li>' +
            '<li><a href="/treatments/orthodontics">치아교정</a></li>' +
            '<li><a href="/treatments/pediatric">소아치과</a></li>' +
            '<li><a href="/treatments/aesthetic">심미레진</a></li>' +
            '<li class="submenu-divider">일반 진료</li>' +
            '<li><a href="/treatments/cavity">충치치료</a></li>' +
            '<li><a href="/treatments/resin">레진치료</a></li>' +
            '<li><a href="/treatments/scaling">스케일링</a></li>' +
            '<li><a href="/treatments/gum">잇몸치료</a></li>' +
            '</ul></li>' +
            // 의료진
            '<li><a href="/doctors/"><i class="fas fa-user-md"></i> 의료진</a></li>' +
            // 비디미션
            '<li><a href="/mission"><i class="fas fa-heart"></i> 비디미션</a></li>' +
            // 콘텐츠
            '<li class="mobile-nav-item has-submenu">' +
            '<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">' +
            '<i class="fas fa-newspaper"></i> 콘텐츠 <i class="fas fa-chevron-down toggle-icon"></i></a>' +
            '<ul class="mobile-nav-submenu">' +
            '<li><a href="/cases/gallery" style="color:#6B4226;font-weight:600;">🔥 비포/애프터</a></li>' +
            '<li><a href="/symptom-checker" style="color:#EC4899;font-weight:600;">🩺 AI 증상체커</a></li>' +
            '<li><a href="/blog/"><i class="fas fa-blog"></i> 블로그</a></li>' +
            '<li><a href="/video/"><i class="fab fa-youtube"></i> 영상</a></li>' +
            '<li><a href="/encyclopedia/"><i class="fas fa-book-medical"></i> 치과 백과사전</a></li>' +
            '<li><a href="/column/"><i class="fas fa-pen-nib"></i> 원장 컬럼</a></li>' +
            '</ul></li>' +
            // 안내
            '<li class="mobile-nav-item has-submenu">' +
            '<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false">' +
            '<i class="fas fa-hospital"></i> 안내 <i class="fas fa-chevron-down toggle-icon"></i></a>' +
            '<ul class="mobile-nav-submenu">' +
            '<li><a href="/pricing">💰 비용 안내</a></li>' +
            '<li><a href="/floor-guide">비디치과 둘러보기</a></li>' +
            '<li><a href="/directions">오시는 길</a></li>' +
            '<li><a href="/faq">자주 묻는 질문</a></li>' +
            '<li><a href="/notice/"><i class="fas fa-bullhorn"></i> 공지사항</a></li>' +
            '<li><a href="/careers"><i class="fas fa-user-tie"></i> 상시채용</a></li>' +
            '</ul></li>' +
            // 플레이
            '<li class="mobile-nav-item has-submenu">' +
            '<a href="javascript:void(0)" class="mobile-nav-submenu-toggle" role="button" aria-expanded="false" style="color:#EC4899;font-weight:700;">' +
            '🎮 플레이 <i class="fas fa-chevron-down toggle-icon"></i></a>' +
            '<ul class="mobile-nav-submenu">' +
            '<li><a href="/flight"><i class="fas fa-rocket"></i> 치석 플라이트</a></li>' +
            '<li><a href="/run"><i class="fas fa-running"></i> 투쓰런</a></li>' +
            '<li><a href="/checkup"><i class="fas fa-dna"></i> 치BTI</a></li>' +
            '<li><a href="/games"><i class="fas fa-th"></i> 전체 게임</a></li>' +
            '</ul></li>' +
            // 예약
            '<li><a href="/reservation" class="highlight"><i class="fas fa-calendar-check"></i> 예약하기</a></li>';
        }
    }

    // ========================================
    // 헤더 스크롤 효과
    // ========================================
    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // 스크롤 방향에 따른 숨김/표시 (선택적)
            // if (currentScroll > lastScroll && currentScroll > 200) {
            //     header.classList.add('hidden');
            // } else {
            //     header.classList.remove('hidden');
            // }

            lastScroll = currentScroll;
        });
    }

    // ========================================
    // 모바일 메뉴 토글
    // ========================================
    function initMobileMenu() {
        var menuBtn = document.getElementById('mobileMenuBtn');
        var nav = document.getElementById('mobileNav');
        var closeBtn = document.getElementById('mobileNavClose');
        var overlay = document.getElementById('mobileNavOverlay');

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

        // 열기/닫기 (menuBtn, closeBtn, overlay는 innerHTML로 교체되지 않으므로 1회만)
        if (!menuBtn.__gnbBound) {
            menuBtn.__gnbBound = true;
            menuBtn.addEventListener('click', openNav);
            if (closeBtn) closeBtn.addEventListener('click', closeNav);
            if (overlay) overlay.addEventListener('click', closeNav);
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && nav.classList.contains('active')) closeNav();
            });
        }

        // ★★★ 이벤트 위임 (Event Delegation) ★★★
        // nav에 한 번만 걸면 innerHTML이 교체되어도 항상 작동한다.
        // 중복 방지를 위해 플래그 사용
        if (!nav.__submenuDelegated) {
            nav.__submenuDelegated = true;

            nav.addEventListener('click', function(e) {
                // 1) 서브메뉴 토글 클릭 감지
                var toggle = e.target.closest('.mobile-nav-submenu-toggle');
                if (toggle) {
                    e.preventDefault();
                    e.stopPropagation();
                    var parent = toggle.closest('.mobile-nav-item') || toggle.parentElement;
                    if (parent) {
                        // 아코디언: 다른 서브메뉴 닫기
                        var siblings = parent.parentElement.querySelectorAll('.mobile-nav-item.expanded');
                        siblings.forEach(function(sib) {
                            if (sib !== parent) sib.classList.remove('expanded');
                        });
                        parent.classList.toggle('expanded');
                    }
                    return;
                }

                // 2) 서브메뉴 내 링크 클릭 → 메뉴 닫기
                var link = e.target.closest('a:not(.mobile-nav-submenu-toggle)');
                if (link) {
                    closeNav();
                }
            });
        }

        // 데스크톱 메가 드롭다운 토글 (모바일 뷰포트에서만 작동)
        var dropdownItems = document.querySelectorAll('.nav-item.has-dropdown > a');
        dropdownItems.forEach(function(item) {
            item.addEventListener('click', function(e) {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    item.parentElement.classList.toggle('open');
                }
            });
        });
    }

    // ========================================
    // 플로팅 CTA
    // ========================================
    function initFloatingCTA() {
        const topBtn = document.querySelector('.floating-btn.top');

        // 맨 위로 버튼
        if (topBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 500) {
                    topBtn.classList.add('visible');
                } else {
                    topBtn.classList.remove('visible');
                }
            });

            topBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // ========================================
    // 스크롤 깊이별 CTA 변화 (페이션트 퍼널)
    // 0~25%: 탐색 → 💬 무료 상담 | 25~50%: 검토 → 📋 내 케이스 진단
    // 50~75%: 확신 → 📅 지금 예약 | 75~100%: 행동 → 🔥 오늘 상담 가능!
    // ========================================
    function initScrollCTA() {
        var stages = [
            { pct: 0,  icon: 'fa-comment-dots', txt: '무료 상담 받기', mob: '상담', cls: 'cta-explore' },
            { pct: 25, icon: 'fa-clipboard-check', txt: '내 케이스 진단받기', mob: '진단', cls: 'cta-consider' },
            { pct: 50, icon: 'fa-calendar-check', txt: '지금 예약하기', mob: '예약', cls: 'cta-decide' },
            { pct: 75, icon: 'fa-fire', txt: '오늘 상담 가능!', mob: '지금 예약', cls: 'cta-action' }
        ];
        var headerBtn = document.querySelector('.btn-reserve');
        var mobileBtn = document.querySelector('.mobile-cta-btn.reserve');
        var prev = -1;
        function update() {
            var h = document.documentElement.scrollHeight - window.innerHeight;
            var pct = h > 0 ? (window.pageYOffset / h) * 100 : 0;
            var idx = pct >= 75 ? 3 : pct >= 50 ? 2 : pct >= 25 ? 1 : 0;
            if (idx === prev) return;
            prev = idx;
            var s = stages[idx];
            if (headerBtn) {
                headerBtn.innerHTML = '<i class="fas ' + s.icon + '"></i> ' + s.txt;
                headerBtn.className = 'btn-reserve ' + s.cls;
            }
            if (mobileBtn) {
                mobileBtn.querySelector('i').className = 'fas ' + s.icon;
                mobileBtn.querySelector('span').textContent = s.mob;
                mobileBtn.className = 'mobile-cta-btn reserve primary ' + s.cls;
            }
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    // ========================================
    // Exit Intent 팝업
    // ========================================
    function initExitIntent() {
        const popup = document.getElementById('exitPopup');
        if (!popup) return;

        let shown = sessionStorage.getItem('exitPopupShown');

        if (!shown) {
            document.addEventListener('mouseout', (e) => {
                if (e.clientY < 10 && !shown) {
                    popup.classList.add('active');
                    sessionStorage.setItem('exitPopupShown', 'true');
                    shown = true;
                }
            });
        }

        // 닫기 버튼
        const closeBtn = popup.querySelector('.popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popup.classList.remove('active');
            });
        }

        // 배경 클릭 시 닫기
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('active');
            }
        });
    }

    // ========================================
    // 스크롤 애니메이션 (Intersection Observer)
    // ========================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        if (animatedElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const animation = el.dataset.animate;
                    const delay = el.dataset.delay || 0;

                    setTimeout(() => {
                        el.classList.add('animated', animation);
                    }, delay);

                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ========================================
    // 숫자 카운트업 애니메이션
    // ========================================
    function initCountUp() {
        const countElements = document.querySelectorAll('[data-count]');
        
        if (countElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count);
                    const duration = parseInt(el.dataset.duration) || 2000;
                    const suffix = el.dataset.suffix || '';
                    
                    animateCount(el, 0, target, duration, suffix);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        countElements.forEach(el => observer.observe(el));
    }

    function animateCount(el, start, end, duration, suffix) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutQuart
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * eased);
            
            // Preserve <span> tag for suffix styling
            if (suffix) {
                el.innerHTML = current.toLocaleString() + '<span>' + suffix + '</span>';
            } else {
                el.textContent = current.toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // ========================================
    // 전역 로그인 상태 동기화 (헤더 + 모바일 메뉴)
    // ========================================
    function initAuthSync() {
        fetch('/api/auth/me')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (!data.loggedIn || !data.user) return;

                var name = data.user.name || '';
                var logoutFn = "(async function(){await fetch('/api/auth/logout',{method:'POST'});location.reload()})()";

                // 데스크톱 헤더 .auth-buttons
                document.querySelectorAll('.auth-buttons').forEach(function(el) {
                    el.innerHTML =
                        '<a href="/auth/mypage" class="btn-auth btn-login"><i class="fas fa-user"></i> ' + name + '님</a>' +
                        '<a href="javascript:void(0)" class="btn-auth btn-register" onclick="' + logoutFn + '"><i class="fas fa-sign-out-alt"></i> 로그아웃</a>';
                });

                // 모바일 메뉴 .mobile-auth-buttons
                document.querySelectorAll('.mobile-auth-buttons').forEach(function(el) {
                    el.innerHTML =
                        '<a href="/auth/mypage" class="btn-auth"><i class="fas fa-user"></i> ' + name + '님</a>' +
                        '<a href="javascript:void(0)" class="btn-auth" onclick="' + logoutFn + '"><i class="fas fa-sign-out-alt"></i> 로그아웃</a>';
                });

                // window 전역에 로그인 상태 공유 (gallery.js 등에서 사용)
                window.__bdAuth = { loggedIn: true, user: data.user };
            })
            .catch(function() {
                window.__bdAuth = { loggedIn: false };
            });
    }

    // ========================================
    // 초기화
    // ========================================
    function init() {
        syncNavMenus(); // 메뉴 통일 (가장 먼저 실행)
        updateClinicStatus();
        setInterval(updateClinicStatus, 60000); // 1분마다 업데이트

        initHeaderScroll();
        initMobileMenu();
        initFloatingCTA();
        initScrollCTA();
        initExitIntent();
        initScrollAnimations();
        initCountUp();
        initAuthSync();
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
