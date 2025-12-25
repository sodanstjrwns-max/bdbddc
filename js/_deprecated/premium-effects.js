/**
 * 서울비디치과 Premium Effects JavaScript v2.0
 * =============================================
 * 미친 홈페이지를 위한 프리미엄 인터랙션
 */

document.addEventListener('DOMContentLoaded', function() {
    // 모든 프리미엄 효과 초기화
    initScrollProgress();
    initEnhancedClinicStatus();
    initCounterAnimation();
    // 플로팅 위젯 비활성화 - HTML의 .floating-cta만 사용
    // initPremiumFloatingWidget();
    // initQuickActionBar();
    // initChatWidget();
    initScrollAnimations();
    initParallaxEffects();
    initMicroInteractions();
});

/**
 * 스크롤 진행 표시기
 */
function initScrollProgress() {
    // 스크롤 프로그레스 바 생성
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress';
    progressContainer.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressContainer);
    
    const progressBar = progressContainer.querySelector('.scroll-progress-bar');
    
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    window.addEventListener('scroll', throttle(updateProgress, 10));
    updateProgress();
}

/**
 * 강화된 진료 상태 표시
 */
function initEnhancedClinicStatus() {
    const statusElement = document.querySelector('.clinic-status');
    if (!statusElement) return;
    
    function updateClinicStatus() {
        const now = new Date();
        const day = now.getDay(); // 0: 일요일, 1-5: 평일, 6: 토요일
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes; // 분 단위로 변환
        
        let isOpen = false;
        let closeTime = '';
        let nextOpen = '';
        
        // 운영 시간 체크
        if (day >= 1 && day <= 5) {
            // 평일: 09:00 - 20:00
            if (currentTime >= 540 && currentTime < 1200) {
                isOpen = true;
                closeTime = '20:00';
            } else if (currentTime < 540) {
                nextOpen = '오늘 09:00';
            } else {
                nextOpen = '내일 09:00';
            }
        } else if (day === 6 || day === 0) {
            // 토/일: 09:00 - 17:00
            if (currentTime >= 540 && currentTime < 1020) {
                isOpen = true;
                closeTime = '17:00';
            } else if (currentTime < 540) {
                nextOpen = '오늘 09:00';
            } else {
                nextOpen = '내일 09:00';
            }
        }
        
        // UI 업데이트
        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('.status-text');
        const statusTime = statusElement.querySelector('.status-time');
        
        if (isOpen) {
            statusElement.classList.remove('closed');
            statusElement.classList.add('open');
            if (statusText) statusText.textContent = '진료중';
            if (statusTime) statusTime.textContent = `${closeTime}까지`;
        } else {
            statusElement.classList.remove('open');
            statusElement.classList.add('closed');
            if (statusText) statusText.textContent = '진료종료';
            if (statusTime) statusTime.textContent = nextOpen;
        }
    }
    
    updateClinicStatus();
    // 1분마다 업데이트
    setInterval(updateClinicStatus, 60000);
}

/**
 * 숫자 카운터 애니메이션
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseFloat(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const duration = parseInt(element.dataset.duration) || 2000;
    const isDecimal = target % 1 !== 0;
    
    let startTime = null;
    const startValue = 0;
    
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        const current = startValue + (target - startValue) * eased;
        
        element.textContent = isDecimal 
            ? current.toFixed(1) + suffix 
            : Math.floor(current) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target + suffix;
            element.classList.add('counted');
        }
    }
    
    element.classList.add('counting');
    requestAnimationFrame(update);
}

/**
 * 프리미엄 플로팅 위젯
 */
function initPremiumFloatingWidget() {
    // 기존 플로팅 CTA 제거 (중복 방지)
    const existingFloat = document.querySelector('.floating-cta');
    if (existingFloat && !existingFloat.classList.contains('premium-floating-widget')) {
        existingFloat.style.display = 'none';
    }
    
    // 프리미엄 위젯 생성
    const widget = document.createElement('div');
    widget.className = 'premium-floating-widget';
    widget.innerHTML = `
        <a href="reservation.html" class="floating-main-btn btn-ripple">
            <i class="fas fa-calendar-check"></i>
            <span>빠른 예약</span>
        </a>
        <div class="floating-sub-btns">
            <a href="pricing.html" class="floating-sub-btn pricing" aria-label="비용안내">
                <i class="fas fa-won-sign"></i>
                <span class="btn-tooltip">비용안내 바로가기</span>
            </a>
            <a href="tel:0414152892" class="floating-sub-btn call" aria-label="전화상담">
                <i class="fas fa-phone-alt"></i>
                <span class="btn-tooltip">전화상담 041-415-2892</span>
            </a>
            <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" class="floating-sub-btn kakao" aria-label="카카오톡">
                <i class="fas fa-comment"></i>
                <span class="btn-tooltip">카카오톡 상담</span>
            </a>
            <button class="floating-sub-btn top" id="scrollTopBtn" aria-label="맨위로">
                <i class="fas fa-arrow-up"></i>
                <span class="btn-tooltip">맨 위로</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(widget);
    
    // 스크롤 탑 버튼 제어
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }, 100));
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * 모바일 빠른 액션 바
 */
function initQuickActionBar() {
    const actionBar = document.createElement('div');
    actionBar.className = 'quick-action-bar';
    actionBar.innerHTML = `
        <div class="quick-action-grid">
            <a href="reservation.html" class="quick-action-item highlight">
                <i class="fas fa-calendar-check"></i>
                <span>예약</span>
            </a>
            <a href="pricing.html" class="quick-action-item">
                <i class="fas fa-won-sign"></i>
                <span>비용안내</span>
                <span class="action-badge"></span>
            </a>
            <a href="tel:0414152892" class="quick-action-item">
                <i class="fas fa-phone-alt"></i>
                <span>전화</span>
            </a>
            <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" class="quick-action-item">
                <i class="fas fa-comment"></i>
                <span>카톡</span>
            </a>
            <a href="directions.html" class="quick-action-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>오시는길</span>
            </a>
        </div>
    `;
    
    document.body.appendChild(actionBar);
    
    // 스크롤 시 표시
    let lastScrollY = 0;
    window.addEventListener('scroll', throttle(() => {
        const currentScrollY = window.scrollY;
        
        if (window.innerWidth <= 768) {
            if (currentScrollY > 300) {
                actionBar.classList.add('visible');
            } else {
                actionBar.classList.remove('visible');
            }
        }
        
        lastScrollY = currentScrollY;
    }, 100));
}

/**
 * AI 스타일 채팅 위젯
 */
function initChatWidget() {
    // 채팅 트리거 버튼
    const trigger = document.createElement('button');
    trigger.className = 'chat-widget-trigger';
    trigger.innerHTML = `
        <i class="fas fa-robot"></i>
        <span class="badge">1</span>
    `;
    
    // 채팅 모달
    const modal = document.createElement('div');
    modal.className = 'chat-widget-modal';
    modal.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-info">
                <div class="chat-avatar">🦷</div>
                <div>
                    <h4>서울비디치과 상담봇</h4>
                    <p>빠른 답변 드려요!</p>
                </div>
            </div>
            <button class="chat-close">×</button>
        </div>
        <div class="chat-body">
            <div class="chat-message bot">
                <div class="avatar"><i class="fas fa-robot"></i></div>
                <div class="bubble">
                    안녕하세요! 서울비디치과입니다 😊<br>
                    <strong>365일 진료</strong>하고 있어요!<br>
                    무엇이 궁금하신가요?
                </div>
            </div>
            <div class="chat-quick-actions">
                <button class="chat-quick-btn" data-action="pricing">💰 비용 안내</button>
                <button class="chat-quick-btn" data-action="hours">🕐 진료 시간</button>
                <button class="chat-quick-btn" data-action="reserve">📅 예약하기</button>
                <button class="chat-quick-btn" data-action="location">📍 오시는 길</button>
                <button class="chat-quick-btn" data-action="implant">🦷 임플란트 문의</button>
            </div>
        </div>
        <div class="chat-footer">
            <div class="chat-input-wrapper">
                <input type="text" class="chat-input" placeholder="궁금한 점을 입력하세요...">
                <button class="chat-send-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    
    document.body.appendChild(trigger);
    document.body.appendChild(modal);
    
    // 이벤트 핸들러
    trigger.addEventListener('click', () => {
        modal.classList.toggle('active');
        trigger.querySelector('.badge').style.display = 'none';
    });
    
    modal.querySelector('.chat-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // 빠른 액션 버튼
    modal.querySelectorAll('.chat-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleChatAction(action, modal);
        });
    });
}

function handleChatAction(action, modal) {
    const chatBody = modal.querySelector('.chat-body');
    const responses = {
        pricing: {
            text: '비용 안내 페이지로 안내해 드릴까요? 각 치료별 예상 비용을 확인하실 수 있어요!',
            link: 'pricing.html'
        },
        hours: {
            text: '📅 <strong>진료 시간 안내</strong><br><br>• 평일: 09:00 ~ 20:00 (점심 12:30~14:00)<br>• 토/일: 09:00 ~ 17:00<br>• 공휴일: 09:00 ~ 13:00<br><br><strong>365일 진료</strong>하고 있어요! 🎉'
        },
        reserve: {
            text: '온라인 예약 페이지로 이동할까요? 원하시는 시간에 예약하실 수 있어요!',
            link: 'reservation.html'
        },
        location: {
            text: '📍 <strong>오시는 길</strong><br><br>충남 천안시 서북구 불당34길 14<br><br>지도 보기 페이지로 안내해 드릴까요?',
            link: 'directions.html'
        },
        implant: {
            text: '🦷 <strong>임플란트 안내</strong><br><br>서울비디치과는 <strong>6개 수술방, 2개 회복실</strong>을 갖춘 임플란트 전문 센터입니다!<br><br>• 수면 임플란트<br>• 비절개 임플란트<br>• 네비게이션 임플란트<br><br>자세한 상담을 원하시면 전화 주세요: <a href="tel:0414152892">041-415-2892</a>'
        }
    };
    
    const response = responses[action];
    if (!response) return;
    
    // 봇 응답 추가
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot';
    messageDiv.innerHTML = `
        <div class="avatar"><i class="fas fa-robot"></i></div>
        <div class="bubble">${response.text}</div>
    `;
    
    // 기존 quick-actions 제거
    const quickActions = chatBody.querySelector('.chat-quick-actions');
    if (quickActions) quickActions.remove();
    
    chatBody.appendChild(messageDiv);
    
    // 링크가 있으면 버튼 추가
    if (response.link) {
        setTimeout(() => {
            const linkBtn = document.createElement('div');
            linkBtn.className = 'chat-message bot';
            linkBtn.innerHTML = `
                <div class="avatar"><i class="fas fa-robot"></i></div>
                <div class="bubble">
                    <a href="${response.link}" class="chat-quick-btn" style="display: inline-block; margin-top: 10px;">
                        바로가기 →
                    </a>
                </div>
            `;
            chatBody.appendChild(linkBtn);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 500);
    }
    
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * 스크롤 기반 애니메이션
 */
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('[data-scroll-animation]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animateElements.forEach(el => observer.observe(el));
}

/**
 * 패럴랙스 효과
 */
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY;
        
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }, 10));
}

/**
 * 마이크로 인터랙션
 */
function initMicroInteractions() {
    // 버튼 리플 효과
    document.querySelectorAll('.btn-ripple').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%) scale(0);
                animation: ripple-effect 0.6s ease-out;
            `;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // 카드 틸트 효과
    document.querySelectorAll('.card-3d-hover').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
}

/**
 * 유틸리티: Throttle 함수
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Exit Intent 팝업 개선
 */
function initExitIntent() {
    const popup = document.getElementById('exitPopup');
    if (!popup) return;
    
    let hasShown = sessionStorage.getItem('exitPopupShown');
    
    if (!hasShown) {
        document.addEventListener('mouseout', function(e) {
            if (e.clientY < 50 && !hasShown) {
                popup.classList.add('active');
                hasShown = true;
                sessionStorage.setItem('exitPopupShown', 'true');
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
    popup.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
}

// Exit Intent 초기화
document.addEventListener('DOMContentLoaded', initExitIntent);

// 추가 CSS 스타일 (ripple 애니메이션)
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple-effect {
        to {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// 전역으로 노출
window.SeoulBDPremium = {
    animateCounter,
    initScrollAnimations,
    handleChatAction
};
