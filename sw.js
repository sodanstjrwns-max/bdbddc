/* ============================================
   서울비디치과 Service Worker v3.0
   Workbox 스타일 캐싱 전략 + 오프라인 지원 + 성능 최적화
   v3.0.0 (2024-12-25) - 재방문 즉시 로드 최적화
   ============================================ */

// Service Worker는 콘솔 로그를 최소화 (성능 영향 미미)
const DEBUG = false;
const log = DEBUG ? console.log.bind(console, '[SW]') : () => {};

// 캐시 버전 관리 - 버전 변경 시 자동 업데이트
const CACHE_VERSION = '3.0.0';
const PRECACHE_NAME = `seoulbd-precache-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `seoulbd-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `seoulbd-images-v${CACHE_VERSION}`;
const FONT_CACHE = `seoulbd-fonts-v${CACHE_VERSION}`;

// 캐시 만료 설정 (초 단위)
const CACHE_EXPIRATION = {
  html: 24 * 60 * 60,      // HTML: 1일
  css: 7 * 24 * 60 * 60,   // CSS: 7일
  js: 7 * 24 * 60 * 60,    // JS: 7일
  images: 30 * 24 * 60 * 60, // 이미지: 30일
  fonts: 365 * 24 * 60 * 60  // 폰트: 1년
};

// 이미지 캐시 최대 개수
const MAX_IMAGE_CACHE_ENTRIES = 100;

// 프리캐시할 정적 리소스 - 번들 최적화 버전 (필수)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  // CSS 번들
  '/css/core-bundle.min.css',
  '/css/mobile-bundle.min.css',
  // 핵심 JS
  '/js/main.js',
  '/js/gnb.js',
  // PWA
  '/manifest.json'
];

// 외부 리소스 (CDN) - 서브셋 폰트로 변경
const EXTERNAL_ASSETS = [
  // Pretendard 서브셋 (50KB → ~15KB)
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
];

// 네비게이션 프리페치 URL (백그라운드에서 미리 캐시 - 선택)
const PREFETCH_URLS = [
  '/pricing.html',
  '/reservation.html'
];

// 캐시하지 않을 URL 패턴
const EXCLUDE_FROM_CACHE = [
  /\/api\//,
  /\/tables\//,
  /google-analytics/,
  /googletagmanager/,
  /amplitude/,
  /facebook/,
  /kakao.*script/,
  /hotjar/,
  /\/admin\//
];

// ■ 설치 이벤트 - 프리캐싱 + 프리페칭
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE_NAME);
      
      // 1. 핵심 리소스 프리캐시 (필수 - 병렬 로드)
      log('프리캐싱 시작...');
      const internalPromises = PRECACHE_URLS.map(url => 
        cache.add(url).catch(err => log('프리캐시 실패:', url, err))
      );
      await Promise.all(internalPromises);
      
      // 2. 외부 CDN 리소스 프리캐시 (실패해도 계속)
      for (const url of EXTERNAL_ASSETS) {
        try {
          await cache.add(url);
          log('외부 리소스 캐시됨:', url);
        } catch (err) {
          log('외부 리소스 캐싱 실패:', url);
        }
      }
      
      // 3. 네비게이션 프리페치 (백그라운드 - 우선순위 낮음)
      setTimeout(async () => {
        for (const url of PREFETCH_URLS) {
          try {
            await cache.add(url);
            log('프리페치 완료:', url);
          } catch (err) {
            // 프리페치 실패는 무시
          }
        }
      }, 3000); // 3초 후 백그라운드 실행
      
      log('프리캐싱 완료');
      await self.skipWaiting();
    })()
  );
});

// ■ 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const currentCaches = [PRECACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, FONT_CACHE];
      
      // 오래된 캐시 삭제
      await Promise.all(
        cacheNames
          .filter(name => !currentCaches.includes(name))
          .map(name => {
            log('오래된 캐시 삭제:', name);
            return caches.delete(name);
          })
      );
      
      // 모든 클라이언트 제어
      await self.clients.claim();
      log('Service Worker 활성화됨');
    })()
  );
});

// ■ Fetch 이벤트 - 라우팅 및 캐싱 전략
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 제외 패턴 체크
  if (shouldExclude(url)) {
    return;
  }
  
  // GET 요청만 처리
  if (request.method !== 'GET') {
    return;
  }
  
  // 라우팅
  event.respondWith(handleRequest(request, url));
});

// ■ 요청 핸들러 - 리소스 타입별 전략 적용 (재방문 최적화)
async function handleRequest(request, url) {
  // 1. 네비게이션 요청 (HTML 페이지)
  // 재방문 시: 캐시 우선 반환 후 백그라운드 업데이트 (즉시 로드)
  if (request.mode === 'navigate') {
    return staleWhileRevalidateForNavigation(request);
  }
  
  // 2. 핵심 정적 리소스 (번들 CSS, JS) - 캐시 우선
  if (isCriticalAsset(url)) {
    return cacheFirst(request, PRECACHE_NAME);
  }
  
  // 3. 일반 정적 리소스 (CSS, JS)
  if (isStaticAsset(url)) {
    return staleWhileRevalidate(request, RUNTIME_CACHE);
  }
  
  // 4. 폰트 - 캐시 우선 (1년)
  if (isFontAsset(url)) {
    return cacheFirst(request, FONT_CACHE);
  }
  
  // 5. 이미지 - 캐시 우선 + 크기 제한
  if (isImageAsset(url)) {
    return cacheFirstWithLimit(request, IMAGE_CACHE, MAX_IMAGE_CACHE_ENTRIES);
  }
  
  // 6. API 요청 (네트워크 전용)
  if (url.pathname.includes('/api/') || url.pathname.includes('/tables/')) {
    return networkOnly(request);
  }
  
  // 7. 기타 요청
  return networkFirst(request, RUNTIME_CACHE);
}

/**
 * 핵심 에셋 판별 (번들 파일)
 */
function isCriticalAsset(url) {
  const criticalPaths = [
    '/css/core-bundle.min.css',
    '/css/mobile-bundle.min.css',
    '/js/main.js',
    '/js/gnb.js'
  ];
  return criticalPaths.some(path => url.pathname === path);
}

/**
 * Stale While Revalidate for Navigation
 * 재방문 시 캐시 즉시 반환 + 백그라운드 업데이트
 * 첫 방문 시 네트워크 우선
 */
async function staleWhileRevalidateForNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  // 캐시가 있으면 즉시 반환 (재방문 시 즉시 로드)
  if (cachedResponse) {
    // 백그라운드에서 업데이트
    fetch(request)
      .then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch(() => {}); // 오프라인이어도 무시
    
    return cachedResponse;
  }
  
  // 캐시 없음: 네트워크에서 가져오기 (첫 방문)
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // 오프라인 폴백
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// ■ 캐싱 전략 함수들

/**
 * Network First with Timeout
 * 네트워크 우선, 타임아웃 시 캐시 폴백
 */
async function networkFirstWithTimeout(request, timeout = 3000) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    log('네트워크 실패, 캐시 폴백:', request.url);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 오프라인 폴백 페이지
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Cache First
 * 캐시 우선, 없으면 네트워크
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Resource not available', { status: 503 });
  }
}

/**
 * Cache First with Limit
 * 캐시 우선 + 캐시 항목 수 제한
 */
async function cacheFirstWithLimit(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 캐시 크기 제한
      await limitCacheSize(cacheName, maxEntries);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // 이미지 로드 실패 시 플레이스홀더 반환
    return createPlaceholderImage();
  }
}

/**
 * Stale While Revalidate
 * 캐시 반환 후 백그라운드에서 업데이트
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

/**
 * Network First
 * 네트워크 우선
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

/**
 * Network Only
 * 네트워크 전용 (캐시 없음)
 */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Network error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ■ 유틸리티 함수들

function shouldExclude(url) {
  return EXCLUDE_FROM_CACHE.some(pattern => pattern.test(url.href));
}

function isStaticAsset(url) {
  return /\.(css|js)(\?.*)?$/i.test(url.pathname);
}

function isFontAsset(url) {
  return /\.(woff2?|ttf|otf|eot)(\?.*)?$/i.test(url.pathname) ||
         (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('font'));
}

function isImageAsset(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico|avif)(\?.*)?$/i.test(url.pathname);
}

/**
 * 캐시 크기 제한
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // 오래된 항목 삭제 (FIFO)
    const deleteCount = keys.length - maxItems;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
    log(`캐시 정리: ${deleteCount}개 항목 삭제`);
  }
}

/**
 * 플레이스홀더 이미지 생성
 */
function createPlaceholderImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect fill="#1a1a1a" width="200" height="200"/>
    <text fill="#666" font-family="sans-serif" font-size="14" text-anchor="middle" x="100" y="105">이미지 로드 실패</text>
  </svg>`;
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// ■ 메시지 이벤트 (캐시 제어)
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;
      
    case 'CACHE_URLS':
      if (payload && Array.isArray(payload.urls)) {
        cacheUrls(payload.urls).then(() => {
          event.ports[0]?.postMessage({ success: true });
        });
      }
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0]?.postMessage(status);
      });
      break;
  }
});

/**
 * 모든 캐시 삭제
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  log('모든 캐시 삭제됨');
}

/**
 * URL 목록 캐싱
 */
async function cacheUrls(urls) {
  const cache = await caches.open(RUNTIME_CACHE);
  await Promise.allSettled(urls.map(url => cache.add(url)));
  log('URL 캐싱 완료:', urls.length);
}

/**
 * 캐시 상태 조회
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }
  
  return status;
}

// ■ 백그라운드 동기화 (향후 확장용)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-reservations') {
    event.waitUntil(syncReservations());
  }
});

async function syncReservations() {
  // 오프라인에서 저장된 예약 데이터 동기화
  log('예약 동기화 시작...');
  // 구현 예정
}

// ■ 푸시 알림
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '서울비디치과에서 알림이 도착했습니다.',
      icon: '/images/icon-192.png',
      badge: '/images/badge-72.png',
      vibrate: [100, 50, 100],
      tag: data.tag || 'notification',
      renotify: true,
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      },
      actions: data.actions || [
        { action: 'view', title: '보기' },
        { action: 'close', title: '닫기' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || '서울비디치과', options)
    );
  } catch (err) {
    log('푸시 알림 처리 오류:', err);
  }
});

// ■ 알림 클릭
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // 이미 열린 탭이 있으면 포커스
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // 없으면 새 탭 열기
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ■ 에러 핸들링
self.addEventListener('error', event => {
  log('Service Worker 에러:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  log('Unhandled Promise rejection:', event.reason);
});

log('Service Worker v2.0.0 로드됨');
