/**
 * 서울비디치과 World Class Effects JavaScript v1.0
 * =================================================
 * 전세계 최고의 치과 홈페이지를 위한 효과
 */

document.addEventListener('DOMContentLoaded', function() {
    initCursorTrail();
    initGoogleRatingWidget();
    initStatsInfographic();
    initScrollIndicator();
    initPremiumAnimations();
    // initSmoothReveal(); // 제거됨 - 함수 미정의
});

/* 파티클 효과 제거됨 - 사용자 피드백 반영 */

/**
 * 마우스 커서 트레일 효과
 */
function initCursorTrail() {
    // 모바일에서는 비활성화
    if ('ontouchstart' in window) return;
    
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);
    
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 점은 즉시 따라감
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });
    
    // 트레일은 부드럽게 따라감
    function animateTrail() {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;
        
        trail.style.left = trailX + 'px';
        trail.style.top = trailY + 'px';
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
    
    // 링크/버튼 호버 시 커서 확대
    const interactiveElements = document.querySelectorAll('a, button, .btn, [role="button"]');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            trail.style.transform = 'translate(-50%, -50%) scale(2)';
            dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            trail.style.transform = 'translate(-50%, -50%) scale(1)';
            dot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
}

/**
 * 구글 평점 위젯 (수동 업데이트 방식)
 * ⚠️ 평점은 관리자가 수동으로 업데이트해야 합니다
 */
function initGoogleRatingWidget() {
    const trustSection = document.querySelector('.trust-section .trust-banner');
    if (!trustSection) return;
    
    // 구글 평점 위젯 생성
    const widget = document.createElement('div');
    widget.className = 'google-rating-widget';
    widget.innerHTML = `
        <div class="google-logo">
            <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
        </div>
        <div class="rating-display">
            <div class="rating-score" data-count="4.9">4.9</div>
            <div class="rating-stars">
                <div class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <span class="review-count">리뷰 <strong>127</strong>개</span>
            </div>
        </div>
        <a href="https://g.page/r/서울비디치과/review" target="_blank" class="review-link">
            <i class="fas fa-external-link-alt"></i>
            리뷰 작성하기
        </a>
    `;
    
    // 섹션 시작 부분에 삽입
    trustSection.parentNode.insertBefore(widget, trustSection);
}

/**
 * 치료 통계 인포그래픽
 */
function initStatsInfographic() {
    // 리뷰 섹션 앞에 통계 섹션 추가
    const reviewsSection = document.querySelector('.reviews-section');
    if (!reviewsSection) return;
    
    const statsSection = document.createElement('section');
    statsSection.className = 'stats-infographic';
    statsSection.innerHTML = `
        <div class="container">
            <div class="section-title animate-fade-in-up" style="text-align: center; margin-bottom: 50px;">
                <span style="display: inline-block; background: rgba(139, 90, 43, 0.3); color: #C9A962; padding: 8px 20px; border-radius: 50px; font-size: 0.85rem; font-weight: 600; margin-bottom: 20px;">📊 숫자로 보는 서울비디치과</span>
                <h2 style="color: white; font-size: 2.2rem;">누적 치료 <span style="color: #C9A962;">실적</span></h2>
                <p style="color: #b8a99a;">수치로 증명하는 신뢰</p>
            </div>
            <div class="stats-grid">
                <div class="stat-card-premium" data-animate="zoom-in" data-delay="0">
                    <div class="stat-icon"><i class="fas fa-tooth"></i></div>
                    <div class="stat-number" data-count="15000">0<span class="suffix">+</span></div>
                    <div class="stat-label">임플란트 식립</div>
                    <div class="stat-sublabel">식립 케이스</div>
                </div>
                <div class="stat-card-premium" data-animate="zoom-in" data-delay="100">
                    <div class="stat-icon"><i class="fas fa-teeth"></i></div>
                    <div class="stat-number" data-count="8500">0<span class="suffix">+</span></div>
                    <div class="stat-label">교정 치료</div>
                    <div class="stat-sublabel">인비절라인 포함</div>
                </div>
                <div class="stat-card-premium" data-animate="zoom-in" data-delay="200">
                    <div class="stat-icon"><i class="fas fa-child"></i></div>
                    <div class="stat-number" data-count="12000">0<span class="suffix">+</span></div>
                    <div class="stat-label">소아 진료</div>
                    <div class="stat-sublabel">진료 케이스</div>
                </div>
                <div class="stat-card-premium" data-animate="zoom-in" data-delay="300">
                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                    <div class="stat-number" data-count="50000">0<span class="suffix">+</span></div>
                    <div class="stat-label">누적 환자</div>
                    <div class="stat-sublabel">내원 환자 수</div>
                </div>
            </div>
        </div>
    `;
    
    reviewsSection.parentNode.insertBefore(statsSection, reviewsSection);
    
    // 통계 카운터 애니메이션
    const statNumbers = statsSection.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(el => observer.observe(el));
}

function animateStatCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2500;
    const suffix = element.querySelector('.suffix')?.textContent || '';
    
    let startTime = null;
    
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        const current = Math.floor(target * eased);
        
        // 천 단위 콤마
        const formatted = current.toLocaleString();
        element.innerHTML = formatted + `<span class="suffix">${suffix}</span>`;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * 스크롤 인디케이터 (사이드)
 */
function initScrollIndicator() {
    const sections = [
        { id: 'hero', name: '홈' },
        { id: 'implant-center', name: '임플란트' },
        { id: 'ortho-center', name: '교정' },
        { id: 'pedo-center', name: '소아치과' },
        { id: 'floor-section', name: '층별안내' },
        { id: 'reviews-section', name: '후기' }
    ];
    
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator-premium';
    
    sections.forEach(section => {
        const dot = document.createElement('div');
        dot.className = 'indicator-dot';
        dot.dataset.section = section.id;
        dot.innerHTML = `<span class="tooltip">${section.name}</span>`;
        
        dot.addEventListener('click', () => {
            const target = document.querySelector(`.${section.id}, #${section.id}, [class*="${section.id}"]`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        indicator.appendChild(dot);
    });
    
    document.body.appendChild(indicator);
    
    // 스크롤 시 활성 섹션 표시
    window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY + window.innerHeight / 2;
        
        indicator.querySelectorAll('.indicator-dot').forEach((dot, index) => {
            const sectionClass = sections[index].id;
            const section = document.querySelector(`.${sectionClass}, #${sectionClass}, [class*="${sectionClass}"]`);
            
            if (section) {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                
                if (scrollY >= top && scrollY < bottom) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            }
        });
    }, 100));
}

/**
 * 프리미엄 애니메이션 초기화
 */
function initPremiumAnimations() {
    // data-animate 속성이 있는 요소들 애니메이션
    const animateElements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    animateElements.forEach(el => observer.observe(el));
    
    // 글로우 효과를 주요 버튼에 추가
    document.querySelectorAll('.btn-primary.btn-lg').forEach(btn => {
        btn.classList.add('glow-effect');
    });
}

/**
 * 헤더 색상 변화 (스크롤 기반)
 */
function initHeaderColorShift() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    const sections = document.querySelectorAll('section[data-header-color]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const color = entry.target.dataset.headerColor;
                header.className = 'site-header scrolled ' + (color || '');
            }
        });
    }, { threshold: 0.3 });
    
    sections.forEach(section => observer.observe(section));
}

/**
 * 유틸리티: Throttle
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

// 전역 노출
window.SeoulBDWorldClass = {
    updateGoogleRating: function(score, reviewCount) {
        // 관리자용: 구글 평점 수동 업데이트
        const scoreEl = document.querySelector('.google-rating-widget .rating-score');
        const countEl = document.querySelector('.google-rating-widget .review-count strong');
        if (scoreEl) scoreEl.textContent = score;
        if (countEl) countEl.textContent = reviewCount;
    }
};

// 프로덕션에서는 로그 비활성화
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    console.log('🦷 서울비디치과 World Class Effects 로드 완료!');
    console.log('💡 구글 평점 수동 업데이트: SeoulBDWorldClass.updateGoogleRating(4.9, 127)');
}
