/**
 * 서울비디치과 - Image Fallback Handler
 * 이미지 로딩 실패 시 placeholder를 자동으로 표시
 * Version: 1.0.0
 */

(function() {
  'use strict';
  
  // Placeholder SVG 데이터 URI 생성
  const placeholders = {
    // 의료진 프로필 - 사람 아이콘
    doctor: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1614"/>
            <stop offset="100%" style="stop-color:#0f0e0c"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#C9A962"/>
            <stop offset="100%" style="stop-color:#8B5A2B"/>
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#bg)"/>
        <circle cx="200" cy="140" r="60" fill="url(#gold)" opacity="0.5"/>
        <ellipse cx="200" cy="320" rx="90" ry="70" fill="url(#gold)" opacity="0.5"/>
        <text x="200" y="380" font-family="sans-serif" font-size="14" fill="#C9A962" opacity="0.6" text-anchor="middle">프로필 사진 준비 중</text>
      </svg>
    `)}`,
    
    // 시설 이미지 - 건물 아이콘
    facility: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1512"/>
            <stop offset="100%" style="stop-color:#0f0e0d"/>
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#bg2)"/>
        <rect x="200" y="100" width="200" height="200" rx="8" fill="#C9A962" opacity="0.2"/>
        <rect x="220" y="130" width="40" height="40" rx="4" fill="#C9A962" opacity="0.3"/>
        <rect x="280" y="130" width="40" height="40" rx="4" fill="#C9A962" opacity="0.3"/>
        <rect x="340" y="130" width="40" height="40" rx="4" fill="#C9A962" opacity="0.3"/>
        <rect x="220" y="190" width="40" height="40" rx="4" fill="#C9A962" opacity="0.3"/>
        <rect x="280" y="190" width="40" height="40" rx="4" fill="#C9A962" opacity="0.3"/>
        <rect x="340" y="190" width="40" height="40" rx="4" fill="#C9A962" opacity="0.3"/>
        <rect x="270" y="250" width="60" height="50" rx="4" fill="#C9A962" opacity="0.4"/>
        <text x="300" y="360" font-family="sans-serif" font-size="14" fill="#C9A962" opacity="0.5" text-anchor="middle">사진 준비 중</text>
      </svg>
    `)}`,
    
    // Hero 배경
    hero: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
        <defs>
          <radialGradient id="glow1" cx="20%" cy="30%">
            <stop offset="0%" style="stop-color:#C9A962;stop-opacity:0.15"/>
            <stop offset="50%" style="stop-color:#C9A962;stop-opacity:0"/>
          </radialGradient>
          <radialGradient id="glow2" cx="80%" cy="70%">
            <stop offset="0%" style="stop-color:#8B5A2B;stop-opacity:0.1"/>
            <stop offset="40%" style="stop-color:#8B5A2B;stop-opacity:0"/>
          </radialGradient>
          <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0908"/>
            <stop offset="30%" style="stop-color:#1a1512"/>
            <stop offset="60%" style="stop-color:#0f0e0d"/>
            <stop offset="100%" style="stop-color:#0a0908"/>
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#heroBg)"/>
        <rect width="1920" height="1080" fill="url(#glow1)"/>
        <rect width="1920" height="1080" fill="url(#glow2)"/>
      </svg>
    `)}`,
    
    // 치료 이미지
    treatment: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="treatBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#121110"/>
            <stop offset="50%" style="stop-color:#1f1a16"/>
            <stop offset="100%" style="stop-color:#121110"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#treatBg)"/>
        <circle cx="400" cy="280" r="80" fill="#C9A962" opacity="0.1"/>
        <path d="M370 250 L400 220 L430 250 L430 310 L400 340 L370 310 Z" fill="#C9A962" opacity="0.3"/>
        <text x="400" y="400" font-family="sans-serif" font-size="16" fill="#C9A962" opacity="0.5" text-anchor="middle">치료 이미지 준비 중</text>
      </svg>
    `)}`,
    
    // 갤러리 아이템
    gallery: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="galleryBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1614"/>
            <stop offset="100%" style="stop-color:#0f0e0c"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#galleryBg)"/>
        <rect x="140" y="90" width="120" height="90" rx="8" fill="#C9A962" opacity="0.2"/>
        <polygon points="160,160 200,120 240,160" fill="#C9A962" opacity="0.3"/>
        <circle cx="220" cy="115" r="15" fill="#C9A962" opacity="0.3"/>
        <text x="200" y="220" font-family="sans-serif" font-size="12" fill="#C9A962" opacity="0.5" text-anchor="middle">이미지 준비 중</text>
      </svg>
    `)}`,
    
    // 비디오 포스터
    video: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="videoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0908"/>
            <stop offset="50%" style="stop-color:#1a1512"/>
            <stop offset="100%" style="stop-color:#0a0908"/>
          </linearGradient>
          <radialGradient id="videoGlow">
            <stop offset="0%" style="stop-color:#C9A962;stop-opacity:0.2"/>
            <stop offset="70%" style="stop-color:#C9A962;stop-opacity:0"/>
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#videoBg)"/>
        <circle cx="960" cy="540" r="200" fill="url(#videoGlow)"/>
        <circle cx="960" cy="540" r="60" fill="#C9A962" opacity="0.3"/>
        <polygon points="945,515 945,565 985,540" fill="#C9A962" opacity="0.6"/>
      </svg>
    `)}`,
    
    // 기본 placeholder
    default: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="defBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1614"/>
            <stop offset="100%" style="stop-color:#0f0e0c"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#defBg)"/>
        <circle cx="200" cy="130" r="40" fill="#C9A962" opacity="0.2"/>
        <rect x="140" y="180" width="120" height="10" rx="5" fill="#C9A962" opacity="0.2"/>
        <rect x="160" y="200" width="80" height="8" rx="4" fill="#C9A962" opacity="0.15"/>
      </svg>
    `)}`
  };
  
  // 이미지 경로에 따른 placeholder 타입 결정
  function getPlaceholderType(src) {
    if (!src) return 'default';
    
    const srcLower = src.toLowerCase();
    
    if (srcLower.includes('doctor') || srcLower.includes('profile')) {
      return 'doctor';
    }
    if (srcLower.includes('facility') || srcLower.includes('clinic') || srcLower.includes('interior') || srcLower.includes('exterior')) {
      return 'facility';
    }
    if (srcLower.includes('hero') || srcLower.includes('banner')) {
      return 'hero';
    }
    if (srcLower.includes('treatment') || srcLower.includes('procedure')) {
      return 'treatment';
    }
    if (srcLower.includes('gallery') || srcLower.includes('case')) {
      return 'gallery';
    }
    if (srcLower.includes('video') || srcLower.includes('poster')) {
      return 'video';
    }
    
    return 'default';
  }
  
  // 이미지 로딩 실패 핸들러
  function handleImageError(img) {
    // 이미 처리된 이미지는 스킵
    if (img.dataset.fallbackApplied === 'true') return;
    
    const originalSrc = img.src || img.dataset.src;
    const placeholderType = getPlaceholderType(originalSrc);
    const placeholderSrc = placeholders[placeholderType];
    
    // Placeholder 이미지로 교체
    img.src = placeholderSrc;
    img.dataset.fallbackApplied = 'true';
    img.dataset.originalSrc = originalSrc;
    
    // 클래스 추가
    img.classList.add('placeholder-image');
    
    // 콘솔에 경고 (개발 모드에서만)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.info(`[Image Fallback] Placeholder applied for: ${originalSrc}`);
    }
  }
  
  // 모든 이미지에 에러 핸들러 적용
  function setupImageFallbacks() {
    // 기존 이미지들에 핸들러 적용
    document.querySelectorAll('img').forEach(img => {
      // 이미 로딩 실패한 이미지 처리
      if (!img.complete || img.naturalWidth === 0) {
        img.addEventListener('error', () => handleImageError(img), { once: true });
      }
      
      // 새로 로딩되는 이미지 처리
      if (!img.dataset.fallbackHandler) {
        img.dataset.fallbackHandler = 'true';
        img.addEventListener('error', () => handleImageError(img));
      }
    });
    
    // DOM 변경 감시 (동적으로 추가되는 이미지)
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG') {
            node.addEventListener('error', () => handleImageError(node));
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('img').forEach(img => {
              if (!img.dataset.fallbackHandler) {
                img.dataset.fallbackHandler = 'true';
                img.addEventListener('error', () => handleImageError(img));
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 페이지 로딩 완료 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupImageFallbacks);
  } else {
    setupImageFallbacks();
  }
  
  // 전역 함수로 노출 (수동 호출용)
  window.ImageFallback = {
    placeholders,
    handleError: handleImageError,
    setup: setupImageFallbacks,
    getType: getPlaceholderType
  };
})();
