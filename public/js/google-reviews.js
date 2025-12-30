/**
 * 서울비디치과 구글 리뷰 실시간 연동
 * Google Places API 사용
 */

const GOOGLE_PLACE_ID = 'ChIJGW_8w4coezURxnwkO_3piX0';
const GOOGLE_API_KEY = 'AIzaSyD9PuRUYq7vHfzXGlqm4v7nakzBUptk2-0';

// 캐시 설정 (1시간)
const CACHE_KEY = 'seoulbd_google_reviews';
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

/**
 * 구글 리뷰 데이터 가져오기
 */
async function fetchGoogleReviews() {
  // 캐시 확인
  const cached = getFromCache();
  if (cached) {
    console.log('📦 캐시된 리뷰 데이터 사용');
    return cached;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=rating,user_ratings_total&key=${GOOGLE_API_KEY}`;
    
    // CORS 우회를 위한 프록시 사용 (Cloudflare Workers에서 처리)
    const response = await fetch(`/api/google-reviews`);
    
    if (!response.ok) {
      throw new Error('API 요청 실패');
    }
    
    const data = await response.json();
    
    const reviewData = {
      rating: data.result?.rating || 4.9,
      reviewCount: data.result?.user_ratings_total || 228,
      updatedAt: Date.now()
    };
    
    // 캐시에 저장
    saveToCache(reviewData);
    
    return reviewData;
  } catch (error) {
    console.warn('구글 리뷰 API 에러:', error);
    // 기본값 반환
    return { rating: 4.9, reviewCount: 228 };
  }
}

/**
 * 캐시에서 데이터 가져오기
 */
function getFromCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    // 캐시 만료 확인
    if (now - data.updatedAt > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

/**
 * 캐시에 데이터 저장
 */
function saveToCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 용량 초과 등 에러 무시
  }
}

/**
 * 페이지의 리뷰 데이터 업데이트
 */
async function updateReviewDisplay() {
  const data = await fetchGoogleReviews();
  
  // 평점 표시 요소 업데이트
  document.querySelectorAll('[data-google-rating]').forEach(el => {
    el.textContent = data.rating;
  });
  
  // 리뷰 개수 표시 요소 업데이트
  document.querySelectorAll('[data-google-review-count]').forEach(el => {
    el.textContent = data.reviewCount.toLocaleString();
  });
  
  // 스키마 마크업 업데이트 (SEO)
  updateSchemaMarkup(data);
  
  console.log(`✅ 구글 리뷰 업데이트: ${data.rating}점 (${data.reviewCount}개)`);
}

/**
 * JSON-LD 스키마 마크업 업데이트
 */
function updateSchemaMarkup(data) {
  // 기존 스키마 찾아서 업데이트
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const schema = JSON.parse(script.textContent);
      
      if (schema.aggregateRating) {
        schema.aggregateRating.ratingValue = String(data.rating);
        schema.aggregateRating.reviewCount = String(data.reviewCount);
        script.textContent = JSON.stringify(schema, null, 2);
      }
    } catch {
      // 파싱 에러 무시
    }
  });
}

// 페이지 로드 시 자동 실행 (지연 로드)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateReviewDisplay, 2000); // 2초 후 실행
  });
} else {
  setTimeout(updateReviewDisplay, 2000);
}

// 전역 함수로 내보내기
window.GoogleReviews = {
  fetch: fetchGoogleReviews,
  update: updateReviewDisplay,
  PLACE_ID: GOOGLE_PLACE_ID
};
