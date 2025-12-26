/**
 * 서울비디치과 다국어 시스템 (Language Switcher)
 * v2.1 - 프로덕션 최적화 버전
 * 한국어(기본), 영어, 일어, 중국어 지원
 * v2.1.0 (2024-12-06) - 콘솔 로그 조건부 처리
 */

(function() {
    'use strict';
    
    // 프로덕션 환경 감지 (콘솔 로그 비활성화)
    const IS_PRODUCTION = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
    const warn = IS_PRODUCTION ? () => {} : console.warn.bind(console);
    
    // 지원 언어 설정
    const SUPPORTED_LANGUAGES = {
        ko: { name: '한국어', native: 'Korean', flag: '🇰🇷', code: 'KO' },
        en: { name: 'English', native: '영어', flag: '🇺🇸', code: 'EN' },
        ja: { name: '日本語', native: '일본어', flag: '🇯🇵', code: 'JA' },
        zh: { name: '中文', native: '중국어', flag: '🇨🇳', code: 'ZH' }
    };
    
    const DEFAULT_LANGUAGE = 'ko';
    const STORAGE_KEY = 'seoulbd_language';
    
    // 번역 데이터 (translations.js에서 로드)
    let translations = window.TRANSLATIONS || {};
    let translationsLoaded = !!window.TRANSLATIONS;
    
    /**
     * 번역 파일 지연 로딩
     * 모든 언어 전환 시 필요 (한국어 복원을 위해서도 필요)
     */
    async function loadTranslationsIfNeeded() {
        // 이미 로드된 경우
        if (translationsLoaded && Object.keys(translations).length > 0) {
            return true;
        }
        
        // window.TRANSLATIONS가 이미 있는 경우
        if (window.TRANSLATIONS && Object.keys(window.TRANSLATIONS).length > 0) {
            translations = window.TRANSLATIONS;
            translationsLoaded = true;
            return true;
        }
        
        // translations.js 동적 로드
        try {
            if (!document.querySelector('script[src*="translations.js"]')) {
                const script = document.createElement('script');
                script.src = getScriptBasePath() + 'translations.js';
                script.async = true;
                
                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        translations = window.TRANSLATIONS || {};
                        translationsLoaded = true;
                        resolve();
                    };
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            return true;
        } catch (e) {
            warn('translations.js 로드 실패:', e);
            return false;
        }
    }
    
    /**
     * 스크립트 기본 경로 계산
     */
    function getScriptBasePath() {
        const path = window.location.pathname;
        if (path.includes('/treatments/') || path.includes('/doctors/') || 
            path.includes('/cases/') || path.includes('/column/') || 
            path.includes('/bdx/') || path.includes('/faq/') || 
            path.includes('/area/') || path.includes('/auth/')) {
            return '../js/';
        }
        return 'js/';
    }
    
    /**
     * 현재 언어 가져오기
     */
    function getCurrentLanguage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES[stored]) {
            return stored;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && SUPPORTED_LANGUAGES[urlLang]) {
            return urlLang;
        }
        
        const browserLang = navigator.language.split('-')[0];
        if (SUPPORTED_LANGUAGES[browserLang]) {
            return browserLang;
        }
        
        return DEFAULT_LANGUAGE;
    }
    
    /**
     * 번역 텍스트 가져오기
     * 항상 한국어 기본값을 반환하도록 보장
     */
    function t(key, lang) {
        lang = lang || getCurrentLanguage();
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        // 해당 언어 값이 없으면 항상 한국어로 폴백
        return value[lang] || value[DEFAULT_LANGUAGE] || null;
    }
    
    /**
     * 언어 설정 및 번역 적용
     */
    async function setLanguage(lang) {
        if (!SUPPORTED_LANGUAGES[lang]) {
            warn('Unsupported language:', lang);
            return;
        }
        
        showLoadingIndicator();
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        
        // 항상 번역 파일을 로드하도록 변경 (한국어 복원을 위해 필요)
        await loadTranslationsIfNeeded();
        
        // 모든 번역 적용
        applyAllTranslations(lang);
        
        // UI 업데이트
        updateLanguageSwitcherUI(lang);
        
        setTimeout(() => {
            document.body.classList.add('lang-changed');
            hideLoadingIndicator();
            
            setTimeout(() => {
                document.body.classList.remove('lang-changed');
            }, 500);
        }, 100);
        
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
    
    /**
     * 모든 번역 적용
     */
    function applyAllTranslations(lang) {
        // 1. data-i18n 속성으로 번역
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key, lang);
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
        
        // 2. data-i18n-html 속성 (HTML 포함)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            const translation = t(key, lang);
            if (translation) {
                el.innerHTML = translation.replace(/\n/g, '<br>');
            }
        });
        
        // 3. 자동 번역 (클래스 기반)
        applyAutoTranslations(lang);
        
        // 4. 페이지별 특수 번역
        applyPageSpecificTranslations(lang);
    }
    
    /**
     * 자동 번역 (공통 요소)
     */
    function applyAutoTranslations(lang) {
        // 로고 텍스트
        document.querySelectorAll('.logo-text, .site-logo .logo-text').forEach(el => {
            el.textContent = t('common.clinicName', lang);
        });
        
        // 예약 버튼
        document.querySelectorAll('.btn-reserve, [class*="reserve"]').forEach(el => {
            const icon = el.querySelector('i');
            const iconHtml = icon ? icon.outerHTML + ' ' : '';
            if (el.textContent.includes('예약') || el.textContent.includes('Book') || el.textContent.includes('予約') || el.textContent.includes('预约')) {
                el.innerHTML = iconHtml + t('common.reserve', lang);
            }
        });
        
        // 진료중/종료 상태
        document.querySelectorAll('.status-text').forEach(el => {
            if (el.textContent.includes('진료중') || el.textContent.includes('Open')) {
                el.textContent = t('common.open', lang);
            } else if (el.textContent.includes('진료종료') || el.textContent.includes('Closed')) {
                el.textContent = t('common.closed', lang);
            }
        });
        
        // 네비게이션 메뉴
        translateNavigation(lang);
        
        // 푸터
        translateFooter(lang);
    }
    
    /**
     * 네비게이션 번역
     */
    function translateNavigation(lang) {
        const navMappings = {
            '진료 안내': 'nav.treatments',
            'Treatments': 'nav.treatments',
            '의료진 소개': 'nav.doctors',
            'Our Doctors': 'nav.doctors',
            '검진센터': 'nav.checkup',
            'Checkup Center': 'nav.checkup',
            '칼럼/케이스': 'nav.column',
            'Articles': 'nav.column',
            '병원 안내': 'nav.about',
            'About Us': 'nav.about',
            '비용 안내': 'nav.pricing',
            'Pricing': 'nav.pricing',
            '오시는 길': 'nav.directions',
            'Directions': 'nav.directions',
            '자주 묻는 질문': 'nav.faq',
            'FAQ': 'nav.faq',
            '층별 안내': 'nav.floorGuide',
            'Floor Guide': 'nav.floorGuide'
        };
        
        document.querySelectorAll('.main-nav a, .nav-item > a, .simple-dropdown a, .mega-dropdown a').forEach(el => {
            const text = el.textContent.trim().split('\n')[0].trim();
            for (const [original, key] of Object.entries(navMappings)) {
                if (text.includes(original) || text === original) {
                    const badge = el.querySelector('.badge');
                    const badgeHtml = badge ? ' ' + badge.outerHTML : '';
                    el.innerHTML = t(key, lang) + badgeHtml;
                    break;
                }
            }
        });
        
        // 전문센터 메뉴
        const centerMappings = {
            '임플란트센터': 'centers.implant',
            '교정센터': 'centers.orthodontics',
            '소아치과': 'centers.pediatric',
            '심미치료': 'centers.aesthetic',
            '글로우네이트': 'centers.glownate'
        };
        
        document.querySelectorAll('.mega-dropdown a').forEach(el => {
            const text = el.textContent.trim();
            for (const [original, key] of Object.entries(centerMappings)) {
                if (text.includes(original)) {
                    const badge = el.querySelector('.badge');
                    const badgeHtml = badge ? ' ' + badge.outerHTML : '';
                    const style = el.getAttribute('style') || '';
                    el.innerHTML = t(key, lang) + badgeHtml;
                    if (style) el.setAttribute('style', style);
                    break;
                }
            }
        });
        
        // 치료 항목 메뉴
        const treatmentMappings = {
            '충치치료': 'treatments.cavity',
            '레진': 'treatments.resin',
            '크라운': 'treatments.crown',
            '신경치료': 'treatments.rootCanal',
            '미백': 'treatments.whitening',
            '스케일링': 'treatments.scaling',
            '잇몸치료': 'treatments.gumTreatment',
            '사랑니': 'treatments.wisdomTooth',
            '턱관절': 'treatments.tmj'
        };
        
        document.querySelectorAll('.mega-dropdown-section a').forEach(el => {
            const text = el.textContent.trim();
            for (const [original, key] of Object.entries(treatmentMappings)) {
                if (text.includes(original)) {
                    el.textContent = t(key, lang);
                    break;
                }
            }
        });
        
        // 섹션 헤더 번역
        document.querySelectorAll('.mega-dropdown-section h4').forEach(el => {
            const text = el.textContent.trim();
            if (text.includes('전문센터')) {
                el.textContent = t('centers.specialCenters', lang);
            } else if (text.includes('일반') || text.includes('보존')) {
                el.textContent = t('treatments.generalTreatment', lang);
            } else if (text.includes('잇몸') || text.includes('외과')) {
                el.textContent = t('treatments.gumSurgery', lang);
            }
        });
    }
    
    /**
     * 푸터 번역
     */
    function translateFooter(lang) {
        // 병원명
        document.querySelectorAll('.footer h3, .footer-info h3').forEach(el => {
            el.textContent = t('common.clinicName', lang);
        });
        
        // 진료시간 제목
        document.querySelectorAll('.footer h4, .footer-hours h4').forEach(el => {
            if (el.textContent.includes('진료시간') || el.textContent.includes('Hours')) {
                el.textContent = t('hours.title', lang);
            }
        });
        
        // 주소
        document.querySelectorAll('.footer-info p, .footer p').forEach(el => {
            const text = el.textContent;
            if (text.includes('충남') || text.includes('천안') || text.includes('Cheonan') || text.includes('불당')) {
                el.textContent = t('contact.address', lang);
            } else if (text.includes('대표전화') || text.includes('Phone')) {
                el.textContent = t('contact.phone', lang) + ': ' + t('contact.phoneNumber', lang);
            }
        });
        
        // 진료시간 상세
        document.querySelectorAll('.footer-hours p, .footer p').forEach(el => {
            const text = el.textContent;
            if (text.includes('평일') || text.includes('Weekday')) {
                el.textContent = t('hours.weekday', lang) + ': ' + t('hours.weekdayHours', lang) + ' (' + t('hours.lunch', lang) + ' ' + t('hours.lunchHours', lang) + ')';
            } else if (text.includes('토/일') || text.includes('Sat/Sun')) {
                el.textContent = t('hours.weekend', lang) + ': ' + t('hours.weekendHours', lang);
            } else if (text.includes('공휴일') || text.includes('Holiday')) {
                el.textContent = t('hours.holiday', lang) + ': ' + t('hours.holidayHours', lang);
            }
        });
        
        // 저작권
        document.querySelectorAll('.footer-copyright p').forEach(el => {
            el.textContent = t('footer.copyright', lang);
        });
        
        // 푸터 링크
        document.querySelectorAll('.footer-links a, .footer a').forEach(el => {
            const text = el.textContent.trim();
            if (text.includes('사이트맵') || text === 'Sitemap') {
                el.textContent = t('footer.sitemap', lang);
            } else if (text === 'FAQ' || text.includes('자주 묻는')) {
                el.textContent = t('nav.faq', lang);
            } else if (text.includes('오시는 길') || text === 'Directions') {
                el.textContent = t('nav.directions', lang);
            }
        });
    }
    
    /**
     * 페이지별 특수 번역
     */
    function applyPageSpecificTranslations(lang) {
        const path = window.location.pathname;
        
        // 심미치료 페이지
        if (path.includes('aesthetic')) {
            translateAestheticPage(lang);
        }
        // 예약 페이지
        else if (path.includes('reservation')) {
            translateReservationPage(lang);
        }
        // 임플란트 페이지
        else if (path.includes('implant')) {
            translateImplantPage(lang);
        }
        // 인비절라인 페이지
        else if (path.includes('invisalign')) {
            translateInvisalignPage(lang);
        }
        // 소아치과 페이지
        else if (path.includes('pediatric')) {
            translatePediatricPage(lang);
        }
        // 메인 페이지
        else if (path === '/' || path.includes('index.html') || path.endsWith('/')) {
            translateHomePage(lang);
        }
        // FAQ 페이지
        else if (path.includes('faq')) {
            translateFaqPage(lang);
        }
        // 오시는 길 페이지
        else if (path.includes('directions')) {
            translateDirectionsPage(lang);
        }
    }
    
    /**
     * 심미치료 페이지 번역
     */
    function translateAestheticPage(lang) {
        // 히어로 섹션
        document.querySelectorAll('.aesthetic-hero h1').forEach(el => {
            el.innerHTML = '✨ ' + t('aesthetic.heroTitle', lang);
        });
        
        document.querySelectorAll('.aesthetic-hero .lead').forEach(el => {
            const text = t('aesthetic.heroSubtitle', lang);
            el.innerHTML = text + '<br>' + t('aesthetic.doctorName', lang) + (lang === 'ko' ? '이 직접 상담부터 치료까지 책임집니다' : '');
        });
        
        // 의사 소개
        document.querySelectorAll('.doctor-intro-card .doctor-info h3').forEach(el => {
            el.textContent = t('aesthetic.doctorName', lang);
        });
        
        document.querySelectorAll('.doctor-intro-card .doctor-info p').forEach(el => {
            el.innerHTML = t('aesthetic.doctorDesc', lang).replace(/\n/g, '<br>');
        });
        
        // 섹션 타이틀
        document.querySelectorAll('.treatments-section .section-title h2').forEach(el => {
            el.innerHTML = '🎨 ' + (lang === 'ko' ? '심미치료 종류' : lang === 'en' ? 'Treatment Types' : lang === 'ja' ? '審美治療の種類' : '治疗类型');
        });
        
        // 치료 카드
        const cards = document.querySelectorAll('.treatment-card');
        if (cards[0]) {
            cards[0].querySelector('.card-header h3').textContent = t('aesthetic.oneDayResin', lang);
            cards[0].querySelector('.card-header .subtitle').textContent = t('aesthetic.oneDayResinDesc', lang);
        }
        if (cards[1]) {
            cards[1].querySelector('.card-header h3').textContent = t('aesthetic.laminateVeneer', lang);
            cards[1].querySelector('.card-header .subtitle').textContent = t('aesthetic.laminateDesc', lang);
        }
        if (cards[2]) {
            cards[2].querySelector('.card-header h3').textContent = t('aesthetic.cadcam', lang);
            cards[2].querySelector('.card-header .subtitle').textContent = t('aesthetic.cadcamDesc', lang);
        }
        if (cards[3]) {
            cards[3].querySelector('.card-header h3').textContent = t('aesthetic.simulation', lang);
            cards[3].querySelector('.card-header .subtitle').textContent = t('aesthetic.simulationDesc', lang);
        }
        
        // 케이스북 섹션
        document.querySelectorAll('.casebook-section h2').forEach(el => {
            el.innerHTML = '📚 ' + t('aesthetic.casebook', lang);
        });
        
        document.querySelectorAll('.casebook-section .section-desc').forEach(el => {
            el.textContent = t('aesthetic.casebookDesc', lang);
        });
        
        // 프로세스 섹션
        document.querySelectorAll('.process-section h2').forEach(el => {
            el.innerHTML = '🔄 ' + t('aesthetic.process', lang);
        });
        
        const steps = document.querySelectorAll('.process-step h4');
        if (steps[0]) steps[0].textContent = t('aesthetic.step1', lang);
        if (steps[1]) steps[1].textContent = t('aesthetic.step2', lang);
        if (steps[2]) steps[2].textContent = t('aesthetic.step3', lang);
        if (steps[3]) steps[3].textContent = t('aesthetic.step4', lang);
        if (steps[4]) steps[4].textContent = t('aesthetic.step5', lang);
        
        // 차별점 섹션
        document.querySelectorAll('.differentiators h2').forEach(el => {
            el.innerHTML = '💎 ' + t('aesthetic.whySpecial', lang);
        });
        
        // FAQ 섹션
        document.querySelectorAll('.faq-section h2').forEach(el => {
            el.innerHTML = '❓ ' + t('faq.title', lang);
        });
        
        document.querySelectorAll('.faq-section .faq-subtitle').forEach(el => {
            el.textContent = lang === 'ko' ? '심미치료에 대해 궁금한 모든 것' : 
                            lang === 'en' ? 'Everything you want to know about cosmetic dentistry' :
                            lang === 'ja' ? '審美治療について知りたいすべて' : '关于美学治疗您想知道的一切';
        });
        
        // CTA 섹션
        document.querySelectorAll('.cta-section h2').forEach(el => {
            el.textContent = t('aesthetic.ctaTitle', lang);
        });
        
        document.querySelectorAll('.cta-section > p').forEach(el => {
            el.innerHTML = t('aesthetic.ctaDesc', lang).replace(/\n/g, '<br>');
        });
        
        // CTA 버튼 - 한국어는 HTML 텍스트 유지
        document.querySelectorAll('.cta-btn.primary').forEach(el => {
            if (lang !== 'ko') {
                el.textContent = t('common.reserve', lang);
            }
        });
    }
    
    /**
     * 예약 페이지 번역
     */
    function translateReservationPage(lang) {
        document.querySelectorAll('h1').forEach(el => {
            if (el.textContent.includes('예약') || el.textContent.includes('Reservation')) {
                el.textContent = t('reservation.title', lang);
            }
        });
        
        // 폼 라벨 번역
        document.querySelectorAll('label').forEach(el => {
            const text = el.textContent.trim();
            if (text.includes('이름') || text === 'Name') {
                el.textContent = t('reservation.name', lang);
            } else if (text.includes('연락처') || text === 'Phone') {
                el.textContent = t('reservation.phone', lang);
            } else if (text.includes('날짜') || text.includes('Date')) {
                el.textContent = t('reservation.date', lang);
            } else if (text.includes('시간') || text.includes('Time')) {
                el.textContent = t('reservation.time', lang);
            } else if (text.includes('진료') || text.includes('Treatment')) {
                el.textContent = t('reservation.treatment', lang);
            } else if (text.includes('문의') || text.includes('Message')) {
                el.textContent = t('reservation.message', lang);
            }
        });
        
        // 제출 버튼
        document.querySelectorAll('button[type="submit"], .submit-btn').forEach(el => {
            el.textContent = t('reservation.submit', lang);
        });
    }
    
    /**
     * 홈페이지 번역 (전체)
     */
    function translateHomePage(lang) {
        // 스킵 링크
        document.querySelectorAll('.skip-link').forEach(el => {
            el.textContent = t('home.skipToMain', lang);
        });
        
        // 히어로 섹션 배지
        document.querySelectorAll('.hero-badge').forEach(el => {
            const text = el.textContent;
            if (text.includes('365')) {
                const icon = el.querySelector('i');
                el.innerHTML = (icon ? icon.outerHTML + ' ' : '') + t('hero.stats365', lang);
            } else if (text.includes('야간') || text.includes('Evening')) {
                const icon = el.querySelector('i');
                el.innerHTML = (icon ? icon.outerHTML + ' ' : '') + t('hero.statsNight', lang);
            }
        });
        
        // BD = Best Dedication 설명
        document.querySelectorAll('.hero-brand-meaning').forEach(el => {
            const bdLogo = el.querySelector('.bd-logo');
            if (bdLogo) {
                const sloganPart = t('common.slogan', lang).split(' - ')[1] || t('common.slogan', lang);
                el.innerHTML = '<span class="bd-logo">BD</span> = <strong>Best Dedication</strong> ' +
                    '<span class="bd-korean">' + sloganPart + '</span>';
            }
        });
        
        // 히어로 메인 타이틀
        document.querySelectorAll('.hero h1.text-display').forEach(el => {
            if (lang === 'ko') {
                el.innerHTML = '치과 경험의 혁신을 위한<br><span class="text-gradient text-gradient-animated">헌신</span>,<br>그 중심에 환자분을 둡니다';
            } else if (lang === 'en') {
                el.innerHTML = 'Dedication to<br><span class="text-gradient text-gradient-animated">Innovation</span><br>in Dental Care';
            } else if (lang === 'ja') {
                el.innerHTML = '歯科体験の革新への<br><span class="text-gradient text-gradient-animated">献身</span>,<br>患者様を中心に';
            } else if (lang === 'zh') {
                el.innerHTML = '致力于牙科<br><span class="text-gradient text-gradient-animated">创新</span>,<br>以患者为中心';
            }
        });
        
        // 히어로 설명
        document.querySelectorAll('.hero-desc.text-body-lg').forEach(el => {
            if (lang === 'ko') {
                el.innerHTML = '서울대 출신 15인 원장 체계적 협진 시스템<br><strong>일요일도, 공휴일도, 365일 진료합니다</strong>';
            } else if (lang === 'en') {
                el.innerHTML = '15 Seoul National University Dentists<br><strong>Open 365 days including Sundays & Holidays</strong>';
            } else if (lang === 'ja') {
                el.innerHTML = 'ソウル大出身15名の院長による体系的な協診<br><strong>日曜・祝日も365日診療</strong>';
            } else if (lang === 'zh') {
                el.innerHTML = '首尔大学15位院长系统化协诊<br><strong>周日、节假日365天诊疗</strong>';
            }
        });
        
        // 히어로 CTA 버튼 - 한국어는 HTML 텍스트 유지
        document.querySelectorAll('.hero-cta .btn-primary').forEach(el => {
            if (lang !== 'ko') {
                const icon = el.querySelector('i');
                el.innerHTML = (icon ? icon.outerHTML + ' ' : '') + t('common.reserve', lang);
            }
        });
        document.querySelectorAll('.hero-cta .btn-secondary').forEach(el => {
            const icon = el.querySelector('i');
            el.innerHTML = (icon ? icon.outerHTML + ' ' : '') + t('common.call', lang);
        });
        document.querySelectorAll('.hero-cta .btn-accent').forEach(el => {
            const icon = el.querySelector('i');
            el.innerHTML = (icon ? icon.outerHTML + ' ' : '') + t('home.pricingGuide', lang);
        });
        
        // 히어로 카드 라벨
        const heroCards = document.querySelectorAll('.hero-card');
        if (heroCards[0]) {
            const label = heroCards[0].querySelector('.hero-card-label');
            if (label) label.textContent = t('home.heroCard1Label', lang);
        }
        if (heroCards[1]) {
            const label = heroCards[1].querySelector('.hero-card-label');
            if (label) label.textContent = t('home.heroCard2Label', lang);
        }
        if (heroCards[2]) {
            const label = heroCards[2].querySelector('.hero-card-label');
            if (label) label.textContent = t('home.heroCard3Label', lang);
        }
        
        // 스크롤 텍스트
        document.querySelectorAll('.hero-scroll span').forEach(el => {
            el.textContent = t('home.scroll', lang);
        });
        
        // 특징 배너
        const featureItems = document.querySelectorAll('.feature-item');
        const featureKeys = ['feature365', 'featureNight', 'feature15Doctors', 'featureScale', 'featureHygiene'];
        featureItems.forEach((item, idx) => {
            if (featureKeys[idx]) {
                const icon = item.querySelector('i');
                const span = item.querySelector('span');
                if (span) span.textContent = t('home.' + featureKeys[idx], lang);
            }
        });
        
        // Why Choose Us 섹션
        document.querySelectorAll('.section-badge').forEach(el => {
            if (el.textContent.includes('왜') || el.textContent.includes('Why')) {
                const icon = el.querySelector('i');
                el.innerHTML = (icon ? icon.outerHTML + ' ' : '') + t('home.whyBadge', lang);
            }
        });
        
        // Why 섹션 타이틀
        document.querySelectorAll('.why-choose-section h2').forEach(el => {
            if (el.textContent.includes('치과') || el.textContent.includes('Where')) {
                el.innerHTML = t('home.whyTitle', lang).replace('어디서 치료받으시겠어요?', 
                    '<span class="text-gradient" style="background: linear-gradient(135deg, #C9A962, #8B5A2B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">' + 
                    (lang === 'ko' ? '어디서 치료받으시겠어요?' : lang === 'en' ? 'Where will you get treatment?' : lang === 'ja' ? 'どこで治療を受けますか？' : '在哪里接受治疗？') + '</span>');
            }
        });
        document.querySelectorAll('.why-choose-section .section-subtitle').forEach(el => {
            el.textContent = t('home.whySubtitle', lang);
        });
        
        // 핵심 차별화 카드
        const mainCard = document.querySelector('.why-card-large');
        if (mainCard) {
            const h3 = mainCard.querySelector('h3');
            const subtitle = mainCard.querySelector('.why-subtitle');
            const desc = mainCard.querySelector('.why-desc');
            const badge = mainCard.querySelector('.why-badge');
            if (h3) h3.textContent = t('home.mainDiffTitle', lang);
            if (subtitle) subtitle.textContent = t('home.mainDiffSubtitle', lang);
            if (desc) desc.innerHTML = t('home.mainDiffDesc', lang).replace(/\n/g, '<br>');
            if (badge) badge.textContent = t('home.mainDiffBadge', lang);
        }
        
        // Why 카드들
        const whyCards = document.querySelectorAll('.why-choose-grid > .why-card');
        const cardData = [
            { title: 'card15Title', desc: 'card15Desc', stat: '15', unit: 'card15Stat' },
            { title: 'card365Title', desc: 'card365Desc', stat: '365', unit: 'card365Stat' },
            { title: 'cardFacilityTitle', desc: 'cardFacilityDesc', stat: '5', unit: 'cardFacilityStat' },
            { title: 'cardExplainTitle', desc: 'cardExplainDesc', stat: '100', unit: 'cardExplainStat' },
            { title: 'cardHygieneTitle', desc: 'cardHygieneDesc', stat: '1:1', unit: 'cardHygieneStat' },
            { title: 'cardLabTitle', desc: 'cardLabDesc', stat: '5', unit: 'cardLabStat' }
        ];
        whyCards.forEach((card, idx) => {
            if (cardData[idx]) {
                const h3 = card.querySelector('h3');
                const p = card.querySelector('p:not(.why-stat *)');
                const statUnit = card.querySelector('.stat-unit');
                if (h3) h3.textContent = t('home.' + cardData[idx].title, lang);
                if (p) p.innerHTML = t('home.' + cardData[idx].desc, lang).replace(/\n/g, '<br>');
                if (statUnit) statUnit.textContent = t('home.' + cardData[idx].unit, lang);
            }
        });
        
        // 환자 고민 섹션
        document.querySelectorAll('.patient-concerns h3').forEach(el => {
            const icon = el.querySelector('i');
            el.innerHTML = (icon ? icon.outerHTML + ' ' : '') + t('home.concernsTitle', lang);
        });
        
        const concerns = document.querySelectorAll('.concern-item');
        const concernData = [
            { problem: 'concern1Problem', solution: 'concern1Solution' },
            { problem: 'concern2Problem', solution: 'concern2Solution' },
            { problem: 'concern3Problem', solution: 'concern3Solution' },
            { problem: 'concern4Problem', solution: 'concern4Solution' }
        ];
        concerns.forEach((item, idx) => {
            if (concernData[idx]) {
                const spans = item.querySelectorAll('span');
                if (spans[0]) spans[0].textContent = t('home.' + concernData[idx].problem, lang);
                const solution = item.querySelector('.solution');
                if (solution) solution.textContent = t('home.' + concernData[idx].solution, lang);
            }
        });
        
        // 진료 안내 섹션
        document.querySelectorAll('.treatment-summary-section h2').forEach(el => {
            el.textContent = t('home.treatmentQuestion', lang);
        });
        document.querySelectorAll('.treatment-summary-section .section-title p').forEach(el => {
            el.textContent = t('home.treatmentDesc', lang);
        });
        
        // 치료 카드
        const treatmentCards = document.querySelectorAll('.treatment-card');
        const treatmentData = [
            { title: 'glownateTitle', desc: 'glownateDesc' },
            { title: 'invisalignTitle', desc: 'invisalignDesc' },
            { title: 'implantTitle', desc: 'implantDesc' },
            { title: 'bdxTitle', desc: 'bdxDesc' },
            { title: 'pediatricTitle', desc: 'pediatricDesc' },
            { title: 'aestheticTitle', desc: 'aestheticDesc' }
        ];
        treatmentCards.forEach((card, idx) => {
            if (treatmentData[idx]) {
                const h3 = card.querySelector('h3');
                const p = card.querySelector('p');
                if (h3) h3.textContent = t('home.' + treatmentData[idx].title, lang);
                if (p) p.innerHTML = t('home.' + treatmentData[idx].desc, lang).replace(/\n/g, '<br>');
            }
        });
        
        // 전체 진료 안내 보기 버튼
        document.querySelectorAll('.treatment-cta a').forEach(el => {
            const icon = el.querySelector('i');
            el.innerHTML = t('home.viewAllTreatments', lang) + (icon ? ' ' + icon.outerHTML : ' <i class="fas fa-arrow-right"></i>');
        });
        
        // 층별 안내 섹션
        document.querySelectorAll('.floor-section h2').forEach(el => {
            el.textContent = t('home.floorTitle', lang);
        });
        document.querySelectorAll('.floor-section .section-title p').forEach(el => {
            el.textContent = t('home.floorSubtitle', lang);
        });
        
        // 층별 정보
        const floors = document.querySelectorAll('.floor-visual > div > div');
        const floorData = [
            { name: 'floor5Name', desc: 'floor5Desc' },
            { name: 'floor4Name', desc: 'floor4Desc' },
            { name: 'floor3Name', desc: 'floor3Desc' },
            { name: 'floor2Name', desc: 'floor2Desc' },
            { name: 'floor1Name', desc: 'floor1Desc' }
        ];
        floors.forEach((floor, idx) => {
            if (floorData[idx]) {
                const h3 = floor.querySelector('h3');
                const p = floor.querySelector('p');
                if (h3) h3.textContent = t('home.' + floorData[idx].name, lang);
                if (p) p.textContent = t('home.' + floorData[idx].desc, lang);
            }
        });
        
        // 층별 안내 버튼
        document.querySelectorAll('.floor-cta a').forEach(el => {
            const icon = el.querySelector('i');
            el.innerHTML = t('home.viewFloorGuide', lang) + (icon ? ' ' + icon.outerHTML : ' <i class="fas fa-arrow-right"></i>');
        });
        
        // 철학 섹션
        document.querySelectorAll('span').forEach(el => {
            if (el.textContent.includes('우리의 철학') || el.textContent.includes('Our Philosophy')) {
                const icon = el.querySelector('i');
                el.innerHTML = (icon ? icon.outerHTML + ' ' : '<i class="fas fa-quote-left" style="margin-right: 8px;"></i> ') + t('home.philosophyBadge', lang);
            }
        });
        
        // 신뢰 섹션
        document.querySelectorAll('.trust-section .trust-headline span').forEach(el => {
            el.textContent = t('home.trustBadge', lang);
        });
        document.querySelectorAll('.trust-section h2').forEach(el => {
            el.innerHTML = t('home.trustTitle', lang).replace(/\n/g, '<br>').replace('서울비디치과', '<span style="color: #C9A962;">서울비디치과</span>').replace('Seoul BD Dental', '<span style="color: #C9A962;">Seoul BD Dental</span>');
        });
        
        // 신뢰 통계
        const trustStats = document.querySelectorAll('.trust-section [style*="text-align: center"]');
        const trustLabels = ['trustSatisfaction', 'trustRevisit', 'trustReferral', 'trustRating'];
        trustStats.forEach((stat, idx) => {
            if (trustLabels[idx]) {
                const label = stat.querySelectorAll('span');
                if (label.length >= 3) {
                    label[label.length - 1].textContent = t('home.' + trustLabels[idx], lang);
                }
            }
        });
        
        // 후기 섹션
        document.querySelectorAll('.reviews-header span').forEach(el => {
            if (el.textContent.includes('환자 후기') || el.textContent.includes('Patient')) {
                el.textContent = t('home.reviewsBadge', lang);
            }
        });
        document.querySelectorAll('.reviews-header h2').forEach(el => {
            el.innerHTML = t('home.reviewsTitle', lang).replace('생생한 후기', '<span style="color: #C9A962;">생생한 후기</span>').replace('Real reviews', '<span style="color: #C9A962;">Real reviews</span>');
        });
        document.querySelectorAll('.reviews-header p').forEach(el => {
            el.textContent = t('home.reviewsSubtitle', lang);
        });
        
        // 리뷰 통계 라벨
        const reviewStats = document.querySelectorAll('.reviews-stats > div');
        const reviewLabels = ['trustRating', 'trustSatisfaction', 'trustRevisit', 'trustReferral'];
        reviewStats.forEach((stat, idx) => {
            if (reviewLabels[idx]) {
                const labels = stat.querySelectorAll('div');
                if (labels.length >= 3) {
                    labels[labels.length - 1].textContent = t('home.' + reviewLabels[idx], lang);
                }
            }
        });
    }
    
    /**
     * FAQ 페이지 번역
     */
    function translateFaqPage(lang) {
        document.querySelectorAll('h1').forEach(el => {
            if (el.textContent.includes('자주 묻는') || el.textContent.includes('FAQ')) {
                el.textContent = t('faq.title', lang);
            }
        });
    }
    
    /**
     * 오시는 길 페이지 번역
     */
    function translateDirectionsPage(lang) {
        document.querySelectorAll('h1').forEach(el => {
            if (el.textContent.includes('오시는 길') || el.textContent.includes('Directions')) {
                el.textContent = t('nav.directions', lang);
            }
        });
        
        // 주소 번역
        document.querySelectorAll('.address, [class*="address"]').forEach(el => {
            if (el.textContent.includes('충남') || el.textContent.includes('천안')) {
                el.textContent = t('contact.address', lang);
            }
        });
    }
    
    /**
     * 임플란트 페이지 번역
     */
    function translateImplantPage(lang) {
        document.querySelectorAll('.treatment-hero h1, .hero h1').forEach(el => {
            if (el.textContent.includes('임플란트') || el.textContent.includes('Implant')) {
                el.textContent = t('implant.heroTitle', lang);
            }
        });
        
        document.querySelectorAll('.hero-desc, .treatment-hero p').forEach(el => {
            if (el.textContent.includes('6개 수술방') || el.textContent.includes('Operating')) {
                el.textContent = t('implant.heroSubtitle', lang);
            }
        });
    }
    
    /**
     * 인비절라인 페이지 번역
     */
    function translateInvisalignPage(lang) {
        document.querySelectorAll('.treatment-hero h1, .hero h1').forEach(el => {
            if (el.textContent.includes('인비절라인') || el.textContent.includes('Invisalign')) {
                el.textContent = t('invisalign.heroTitle', lang);
            }
        });
    }
    
    /**
     * 소아치과 페이지 번역
     */
    function translatePediatricPage(lang) {
        document.querySelectorAll('.treatment-hero h1, .hero h1').forEach(el => {
            if (el.textContent.includes('소아') || el.textContent.includes('Pediatric')) {
                el.textContent = t('pediatric.heroTitle', lang);
            }
        });
    }
    
    /**
     * 언어 전환 UI 초기화
     */
    async function initLanguageSwitcher() {
        const currentLang = getCurrentLanguage();
        
        // 헤더에 언어 전환 버튼 추가
        const headerActions = document.querySelector('.header-actions');
        if (headerActions && !document.querySelector('.language-switcher')) {
            const switcher = createLanguageSwitcher(currentLang);
            headerActions.insertBefore(switcher, headerActions.firstChild);
        }
        
        // 초기 언어 적용
        document.documentElement.lang = currentLang;
        
        // 번역 파일 로드 (모든 언어에서 필요)
        await loadTranslationsIfNeeded();
        
        // 현재 언어로 번역 적용
        if (translationsLoaded) {
            applyAllTranslations(currentLang);
        }
        
        updateLanguageSwitcherUI(currentLang);
    }
    
    /**
     * 언어 전환 UI 생성
     */
    function createLanguageSwitcher(currentLang) {
        const langInfo = SUPPORTED_LANGUAGES[currentLang];
        
        const container = document.createElement('div');
        container.className = 'language-switcher';
        container.innerHTML = `
            <button class="lang-current" aria-label="언어 선택" aria-expanded="false">
                <span class="lang-icon">${langInfo.flag}</span>
                <span class="lang-code">${langInfo.code}</span>
                <span class="lang-arrow">▼</span>
            </button>
            <div class="lang-dropdown" role="menu">
                ${Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => `
                    <a href="#" class="lang-option ${code === currentLang ? 'active' : ''}" 
                       data-lang-switch="${code}" role="menuitem">
                        <span class="lang-flag">${info.flag}</span>
                        <span class="lang-name">${info.name}</span>
                        <span class="lang-native">${info.native}</span>
                    </a>
                `).join('')}
            </div>
        `;
        
        const currentBtn = container.querySelector('.lang-current');
        
        currentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            container.classList.toggle('open');
            currentBtn.setAttribute('aria-expanded', container.classList.contains('open'));
        });
        
        container.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang-switch');
                setLanguage(lang);
                container.classList.remove('open');
            });
        });
        
        document.addEventListener('click', () => {
            container.classList.remove('open');
            currentBtn.setAttribute('aria-expanded', 'false');
        });
        
        return container;
    }
    
    /**
     * 언어 전환 UI 업데이트
     */
    function updateLanguageSwitcherUI(lang) {
        const langInfo = SUPPORTED_LANGUAGES[lang];
        
        const currentBtn = document.querySelector('.lang-current');
        if (currentBtn) {
            const icon = currentBtn.querySelector('.lang-icon');
            const code = currentBtn.querySelector('.lang-code');
            if (icon) icon.textContent = langInfo.flag;
            if (code) code.textContent = langInfo.code;
        }
        
        document.querySelectorAll('.lang-option, .mobile-lang-btn').forEach(option => {
            const optionLang = option.getAttribute('data-lang-switch');
            option.classList.toggle('active', optionLang === lang);
        });
    }
    
    /**
     * 로딩 인디케이터
     */
    function showLoadingIndicator() {
        let indicator = document.querySelector('.lang-loading');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'lang-loading';
            document.body.appendChild(indicator);
        }
        requestAnimationFrame(() => indicator.classList.add('active'));
    }
    
    function hideLoadingIndicator() {
        const indicator = document.querySelector('.lang-loading');
        if (indicator) indicator.classList.remove('active');
    }
    
    // 전역 API
    window.SeoulBDLang = {
        getCurrentLanguage,
        setLanguage,
        t,
        SUPPORTED_LANGUAGES
    };
    
    // 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
    } else {
        initLanguageSwitcher();
    }
    
})();
