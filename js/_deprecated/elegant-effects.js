/**
 * 서울비디치과 Elegant Effects JavaScript v1.0
 * ============================================
 * 파티클 없이 세련되고 깔끔한 효과들
 */

document.addEventListener('DOMContentLoaded', function() {
    // initLiveStatusBanner(); // 제거됨 - 정신사나움
    initQuickContactBar();
    initSchedulePreview();
    // initNotificationToasts(); // 제거됨 - 정신사나움
    // initSocialProofTicker(); // 제거됨 - 데이터 업데이트 어려움
    initScrollAnimations();
    initLocationPreview();
});

/**
 * 실시간 진료 상태 배너
 */
function initLiveStatusBanner() {
    // 이미 존재하면 중복 생성 방지
    if (document.querySelector('.live-status-banner')) return;
    
    const banner = document.createElement('div');
    banner.className = 'live-status-banner';
    
    const status = getClinicStatus();
    const waitCount = Math.floor(Math.random() * 5) + 1; // 1-5명
    
    banner.innerHTML = `
        <span class="live-dot"></span>
        <span class="status-text">
            ${status.isOpen ? '🟢 현재 진료중' : '🔴 진료종료'}
            ${status.isOpen ? `<span class="wait-count">대기 ${waitCount}명</span>` : ''}
        </span>
        <span>${status.message}</span>
        <button class="close-btn" aria-label="닫기">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    if (!status.isOpen) {
        banner.classList.add('closed');
    }
    
    document.body.appendChild(banner);
    
    // 스크롤 시 표시
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 200 && scrollY > lastScrollY) {
            banner.classList.add('visible');
        } else if (scrollY < 100) {
            banner.classList.remove('visible');
        }
        
        lastScrollY = scrollY;
    }, { passive: true });
    
    // 닫기 버튼
    banner.querySelector('.close-btn').addEventListener('click', () => {
        banner.classList.remove('visible');
        banner.style.display = 'none';
    });
}

/**
 * 진료 상태 확인
 */
function getClinicStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = 일요일
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour * 100 + minute;
    
    let isOpen = false;
    let message = '';
    
    // 공휴일 체크는 생략 (실제로는 공휴일 API 연동 필요)
    
    if (day >= 1 && day <= 5) { // 평일 (점심 12:30-14:00)
        if (time >= 900 && time < 1230) {
            isOpen = true;
            message = '오전 진료' + (time >= 1200 ? ' · 점심시간 임박' : '');
        } else if (time >= 1230 && time < 1400) {
            isOpen = false;
            message = '점심시간 (14:00 재개)';
        } else if (time >= 1400 && time < 2000) {
            isOpen = true;
            message = '오후 진료';
        } else if (time < 900) {
            message = '09:00 오픈 예정';
        } else {
            message = '내일 09:00 오픈';
        }
    } else if (day === 6 || day === 0) { // 주말 (점심시간 없음)
        if (time >= 900 && time < 1700) {
            isOpen = true;
            message = '주말 진료 (점심시간 없음)';
        } else if (time < 900) {
            message = '09:00 오픈 예정';
        } else {
            message = '진료 종료';
        }
    }
    
    return { isOpen, message };
}

/**
 * 모바일 퀵 연락 바
 */
function initQuickContactBar() {
    // 이미 존재하면 중복 생성 방지
    if (document.querySelector('.quick-contact-bar')) return;
    
    const bar = document.createElement('div');
    bar.className = 'quick-contact-bar';
    
    bar.innerHTML = `
        <div class="contact-buttons">
            <a href="reservation.html" class="contact-btn primary">
                <i class="fas fa-calendar-check"></i>
                <span>예약</span>
            </a>
            <a href="pricing.html" class="contact-btn">
                <i class="fas fa-won-sign"></i>
                <span>비용</span>
            </a>
            <a href="tel:041-415-2892" class="contact-btn call">
                <i class="fas fa-phone"></i>
                <span>전화</span>
            </a>
            <a href="https://pf.kakao.com/_Cxivlxb" target="_blank" class="contact-btn kakao">
                <i class="fas fa-comment"></i>
                <span>카톡</span>
            </a>
            <a href="directions.html" class="contact-btn naver">
                <i class="fas fa-map-marker-alt"></i>
                <span>오시는길</span>
            </a>
        </div>
    `;
    
    document.body.appendChild(bar);
    
    // 스크롤 시 표시
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 500) {
            bar.classList.add('visible');
        } else {
            bar.classList.remove('visible');
        }
        
        lastScrollY = scrollY;
    }, { passive: true });
}

/**
 * 오늘의 예약 현황 미리보기
 */
function initSchedulePreview() {
    const scheduleContainer = document.querySelector('.schedule-preview');
    if (!scheduleContainer) return;
    
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = today.toLocaleDateString('ko-KR', options);
    
    // 시간대별 상태 (랜덤 시뮬레이션)
    const slots = [
        { time: '09:00', status: 'booked' },
        { time: '10:00', status: 'booked' },
        { time: '11:00', status: 'available' },
        { time: '12:00', status: 'limited' },
        { time: '14:00', status: 'available' },
        { time: '15:00', status: 'available' },
        { time: '16:00', status: 'limited' },
        { time: '17:00', status: 'available' },
        { time: '18:00', status: 'available' },
        { time: '19:00', status: 'booked' }
    ];
    
    const slotsHTML = slots.map(slot => `
        <div class="time-slot ${slot.status}">
            ${slot.time}
            ${slot.status === 'limited' ? ' (1자리)' : ''}
        </div>
    `).join('');
    
    scheduleContainer.innerHTML = `
        <div class="schedule-header">
            <h4><i class="fas fa-calendar-alt"></i> 오늘의 예약 현황</h4>
            <span class="today-date">${dateStr}</span>
        </div>
        <div class="time-slots">
            ${slotsHTML}
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 16px;">
            <i class="fas fa-info-circle"></i> 클릭하여 빈 시간에 예약하세요
        </p>
    `;
    
    // 클릭 이벤트
    scheduleContainer.querySelectorAll('.time-slot.available').forEach(slot => {
        slot.addEventListener('click', () => {
            window.location.href = 'reservation.html';
        });
    });
}

/* 알림 토스트 기능 제거됨 - 사용자 피드백 반영 */

/**
 * 소셜 프루프 티커
 */
function initSocialProofTicker() {
    const tickerContainer = document.querySelector('.social-proof-ticker');
    if (!tickerContainer) return;
    
    const items = [
        { text: '방금 전 천안시에서 예약', icon: 'fa-check-circle' },
        { text: '오늘 15건의 임플란트 수술 완료', icon: 'fa-tooth' },
        { text: '이번 주 87명 신규 환자', icon: 'fa-user-plus' },
        { text: '⭐ 4.9 Google 평점', icon: 'fa-star' },
        { text: '98.7% 환자 만족도', icon: 'fa-heart' },
        { text: '서울대 출신 15인 협진', icon: 'fa-user-md' }
    ];
    
    // 아이템 복제 (무한 스크롤 효과)
    const duplicatedItems = [...items, ...items];
    
    const tickerHTML = duplicatedItems.map(item => `
        <div class="ticker-item">
            <i class="fas ${item.icon}"></i>
            <span>${item.text}</span>
        </div>
    `).join('');
    
    tickerContainer.innerHTML = `<div class="ticker-content">${tickerHTML}</div>`;
}

/**
 * 스크롤 애니메이션
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => observer.observe(el));
}

/**
 * 위치 미리보기 인터랙션
 */
function initLocationPreview() {
    const locationPreview = document.querySelector('.location-preview .map-preview');
    if (!locationPreview) return;
    
    locationPreview.addEventListener('click', () => {
        window.location.href = 'directions.html';
    });
}

/**
 * 글로벌 함수: 토스트 표시
 */
window.SeoulBDElegant = {
    showToast: function(icon, title, message) {
        let toastContainer = document.querySelector('.notification-toast');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'notification-toast';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.innerHTML = `
            <div class="toast-icon ${icon}">
                <i class="fas ${icon === 'success' ? 'fa-check' : 'fa-info'}"></i>
            </div>
            <div class="toast-content">
                <h5>${title}</h5>
                <p>${message}</p>
            </div>
        `;
        
        toastContainer.classList.add('show');
        
        setTimeout(() => {
            toastContainer.classList.remove('show');
        }, 5000);
    },
    
    updateWaitCount: function(count) {
        const waitCountEl = document.querySelector('.live-status-banner .wait-count');
        if (waitCountEl) {
            waitCountEl.textContent = `대기 ${count}명`;
        }
    }
};
