/**
 * 서울비디치과 Advanced Effects JavaScript v1.0
 * =============================================
 * 더 미친 홈페이지를 위한 고급 인터랙션
 */

document.addEventListener('DOMContentLoaded', function() {
    initWaitStatusBanner();
    initPhoneCopyFeature();
    // initLiveNotifications(); // 제거됨 - 사용자 피드백
    initAdvancedAnimations();
    initFloorInteraction();
    initBeforeAfterSlider();
});

/**
 * 실시간 대기 현황 배너 (시뮬레이션)
 */
function initWaitStatusBanner() {
    // 헤더 바로 아래에 배너 추가
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    const banner = document.createElement('div');
    banner.className = 'wait-status-banner';
    banner.innerHTML = `
        <div class="wait-info">
            <span>🏥 현재 서울비디치과</span>
            <span class="divider"></span>
            <span class="wait-count">
                <i class="fas fa-users"></i>
                대기 <span class="count-num" id="waitCount">3</span>명
            </span>
            <span class="divider"></span>
            <span>예상 대기시간 약 <strong id="waitTime">15</strong>분</span>
            <span class="divider"></span>
            <a href="reservation.html" style="color: white; text-decoration: underline;">온라인 예약으로 대기 없이!</a>
        </div>
    `;
    
    // 헤더 높이 여백 div 뒤에 삽입
    const spacer = document.querySelector('[style*="height: 72px"]');
    if (spacer) {
        spacer.after(banner);
    }
    
    // 주기적으로 대기 인원 업데이트 (시뮬레이션)
    function updateWaitCount() {
        const countEl = document.getElementById('waitCount');
        const timeEl = document.getElementById('waitTime');
        if (countEl && timeEl) {
            const count = Math.floor(Math.random() * 5) + 1; // 1~5명
            const time = count * 5 + Math.floor(Math.random() * 10); // 대기시간 계산
            countEl.textContent = count;
            timeEl.textContent = time;
        }
    }
    
    // 30초마다 업데이트
    setInterval(updateWaitCount, 30000);
}

/**
 * 전화번호 복사 기능
 */
function initPhoneCopyFeature() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    phoneLinks.forEach(link => {
        // 복사 버튼 추가
        link.classList.add('phone-copy-btn');
        link.setAttribute('title', '클릭: 전화 걸기 | 길게 누르기: 번호 복사');
        
        const tooltip = document.createElement('span');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '번호가 복사되었습니다!';
        link.appendChild(tooltip);
        
        // 길게 누르기로 복사
        let pressTimer;
        
        link.addEventListener('mousedown', function(e) {
            pressTimer = setTimeout(() => {
                e.preventDefault();
                const phoneNumber = this.getAttribute('href').replace('tel:', '').replace(/-/g, '');
                copyToClipboard(phoneNumber);
                this.classList.add('copied');
                setTimeout(() => this.classList.remove('copied'), 2000);
            }, 500);
        });
        
        link.addEventListener('mouseup', () => clearTimeout(pressTimer));
        link.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        // 터치 디바이스
        link.addEventListener('touchstart', function(e) {
            pressTimer = setTimeout(() => {
                e.preventDefault();
                const phoneNumber = this.getAttribute('href').replace('tel:', '').replace(/-/g, '');
                copyToClipboard(phoneNumber);
                this.classList.add('copied');
                setTimeout(() => this.classList.remove('copied'), 2000);
            }, 500);
        });
        
        link.addEventListener('touchend', () => clearTimeout(pressTimer));
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

/**
 * 실시간 알림 (예약 완료 등)
 */
function initLiveNotifications() {
    const notifications = [
        { icon: '📅', title: '방금 예약 완료!', content: '김**님이 임플란트 상담을 예약했습니다', time: '방금 전' },
        { icon: '⭐', title: '새 리뷰 등록!', content: '"친절하고 꼼꼼하게 설명해주세요" - 박**님', time: '3분 전' },
        { icon: '🦷', title: '치료 완료!', content: '오늘 25명의 환자분 치료 완료', time: '10분 전' },
        { icon: '📞', title: '상담 문의', content: '인비절라인 상담 문의가 접수되었습니다', time: '5분 전' }
    ];
    
    let notificationIndex = 0;
    
    function showNotification() {
        // 기존 알림 제거
        const existing = document.querySelector('.live-notification');
        if (existing) existing.remove();
        
        const notif = notifications[notificationIndex];
        const el = document.createElement('div');
        el.className = 'live-notification';
        el.innerHTML = `
            <div class="notif-icon">${notif.icon}</div>
            <div class="notif-content">
                <h4>${notif.title}</h4>
                <p>${notif.content}</p>
                <span class="notif-time">${notif.time}</span>
            </div>
            <button class="notif-close">×</button>
        `;
        
        document.body.appendChild(el);
        
        // 애니메이션
        setTimeout(() => el.classList.add('show'), 100);
        
        // 닫기 버튼
        el.querySelector('.notif-close').addEventListener('click', () => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 500);
        });
        
        // 자동 닫기
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 500);
        }, 5000);
        
        notificationIndex = (notificationIndex + 1) % notifications.length;
    }
    
    // 첫 알림은 10초 후, 이후 60초마다
    setTimeout(() => {
        showNotification();
        setInterval(showNotification, 60000);
    }, 10000);
}

/**
 * 고급 스크롤 애니메이션
 */
function initAdvancedAnimations() {
    const animateElements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animateElements.forEach(el => observer.observe(el));
}

/**
 * 층별 안내 인터랙션
 */
function initFloorInteraction() {
    const floorItems = document.querySelectorAll('.floor-building .floor-item');
    
    floorItems.forEach(item => {
        item.addEventListener('click', function() {
            // 모든 아이템에서 active 제거
            floorItems.forEach(i => i.classList.remove('active'));
            // 클릭한 아이템에 active 추가
            this.classList.add('active');
        });
        
        // 호버 시 다른 아이템 살짝 흐리게
        item.addEventListener('mouseenter', function() {
            floorItems.forEach(i => {
                if (i !== this) {
                    i.style.opacity = '0.5';
                }
            });
        });
        
        item.addEventListener('mouseleave', function() {
            floorItems.forEach(i => {
                i.style.opacity = '1';
            });
        });
    });
}

/**
 * Before/After 슬라이더 (케이스 갤러리용)
 */
function initBeforeAfterSlider() {
    const sliders = document.querySelectorAll('.before-after-slider');
    
    sliders.forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const afterImg = slider.querySelector('.after-img');
        if (!handle || !afterImg) return;
        
        let isDragging = false;
        
        function updateSlider(x) {
            const rect = slider.getBoundingClientRect();
            let percentage = ((x - rect.left) / rect.width) * 100;
            percentage = Math.max(0, Math.min(100, percentage));
            
            handle.style.left = `${percentage}%`;
            afterImg.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
        }
        
        handle.addEventListener('mousedown', () => isDragging = true);
        document.addEventListener('mouseup', () => isDragging = false);
        document.addEventListener('mousemove', (e) => {
            if (isDragging) updateSlider(e.clientX);
        });
        
        // 터치 지원
        handle.addEventListener('touchstart', () => isDragging = true);
        document.addEventListener('touchend', () => isDragging = false);
        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                updateSlider(e.touches[0].clientX);
            }
        });
        
        // 슬라이더 클릭으로도 이동
        slider.addEventListener('click', (e) => {
            if (e.target !== handle) {
                updateSlider(e.clientX);
            }
        });
    });
}

/**
 * 스크롤 기반 배경색 변화
 */
function initColorShift() {
    const sections = document.querySelectorAll('.color-shift-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const color = entry.target.dataset.scrollColor;
                document.body.style.transition = 'background-color 0.5s';
                // 색상 변경 로직
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
}

/**
 * 평점 위젯 (네이버 플레이스)
 */
function initRatingWidget() {
    // 평점 위젯을 특정 위치에 추가
    const trustSection = document.querySelector('.trust-section');
    if (!trustSection) return;
    
    const widget = document.createElement('div');
    widget.className = 'rating-widget';
    widget.innerHTML = `
        <div class="rating-source naver">
            <i class="fas fa-map-marker-alt"></i>
            네이버 플레이스
        </div>
        <div class="rating-score">
            <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
            </div>
            <span class="score">4.9</span>
        </div>
        <span class="review-count">리뷰 500+</span>
    `;
    
    // 적절한 위치에 삽입
}

// 전역 노출
window.SeoulBDAdvanced = {
    showNotification: function(icon, title, content) {
        const el = document.createElement('div');
        el.className = 'live-notification';
        el.innerHTML = `
            <div class="notif-icon">${icon}</div>
            <div class="notif-content">
                <h4>${title}</h4>
                <p>${content}</p>
            </div>
            <button class="notif-close">×</button>
        `;
        document.body.appendChild(el);
        setTimeout(() => el.classList.add('show'), 100);
        el.querySelector('.notif-close').addEventListener('click', () => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 500);
        });
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 500);
        }, 5000);
    },
    copyPhone: copyToClipboard
};
