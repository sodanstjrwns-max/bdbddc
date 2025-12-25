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
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.main-nav');
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown > a');

        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                menuBtn.classList.toggle('active');
                nav.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
        }

        // 모바일에서 드롭다운 토글
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
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
            
            el.textContent = current.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // ========================================
    // 초기화
    // ========================================
    function init() {
        updateClinicStatus();
        setInterval(updateClinicStatus, 60000); // 1분마다 업데이트

        initHeaderScroll();
        initMobileMenu();
        initFloatingCTA();
        initExitIntent();
        initScrollAnimations();
        initCountUp();
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
