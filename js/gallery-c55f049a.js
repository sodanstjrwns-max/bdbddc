/**
 * 서울비디치과 비포/애프터 갤러리 시스템 v13
 * - Weglot DOM 깨짐 방지: <div> + JS 클릭 네비게이션
 * - 비로그인 시 세련된 모달 안내 (로그인 페이지 리다이렉트 대신)
 * - 카드: 비포사진 + 카테고리 + 치료기간 + 제목 + 설명(3줄) + 원장 = 통합
 * - 비로그인 시 "애프터 사진은 로그인 후 확인" 힌트 표시
 * - 사진 클릭 시 라이트박스(큰 사진 모달) + 비포/애프터 탭 전환
 */
(function() {
  'use strict';

  var cases = [];
  var currentFilter = 'all';
  var currentRegion = 'all';
  var isLoggedIn = false;

  var filterGroupMap = {
    'implant': 'implant',
    'invisalign': 'invisalign',
    'orthodontics': 'orthodontics', 'pediatric': 'orthodontics',
    'front-crown': 'front-crown',
    'aesthetic': 'aesthetic',
    'glownate': 'glownate',
    'resin': 'resin',
    'whitening': 'whitening',
    'cavity': 'general', 'crown': 'general', 'inlay': 'general',
    'root-canal': 'general', 're-root-canal': 'general', 'bridge': 'general', 'denture': 'general',
    'sedation': 'general', 'prevention': 'general',
    'tmj': 'general', 'bruxism': 'general', 'emergency': 'general',
    'scaling': 'gum', 'gum': 'gum', 'periodontitis': 'gum', 'gum-surgery': 'gum',
    'wisdom-tooth': 'gum', 'apicoectomy': 'gum'
  };

  var CATS = {
    implant:'임플란트', invisalign:'인비절라인', orthodontics:'치아교정', pediatric:'소아치과',
    'front-crown':'앞니크라운',
    aesthetic:'심미레진', glownate:'글로우네이트', cavity:'충치치료',
    resin:'레진치료', crown:'크라운', inlay:'인레이/온레이',
    'root-canal':'신경치료', 're-root-canal':'재신경치료',
    whitening:'미백', bridge:'브릿지', denture:'틀니',
    scaling:'스케일링', gum:'잇몸치료', periodontitis:'치주염',
    'gum-surgery':'잇몸수술', 'wisdom-tooth':'사랑니발치',
    apicoectomy:'치근단절제술', sedation:'수면치료', prevention:'예방치료',
    tmj:'턱관절(TMJ)', bruxism:'이갈이/브럭시즘', emergency:'응급치료'
  };

  var CAT_ICONS = {
    implant:'fa-tooth', invisalign:'fa-teeth-open', orthodontics:'fa-teeth',
    pediatric:'fa-baby', 'front-crown':'fa-crown',
    aesthetic:'fa-sparkles', glownate:'fa-gem', cavity:'fa-fill-drip',
    resin:'fa-fill', crown:'fa-crown', inlay:'fa-puzzle-piece',
    'root-canal':'fa-syringe', 're-root-canal':'fa-syringe',
    whitening:'fa-sun', bridge:'fa-bridge', denture:'fa-teeth',
    scaling:'fa-broom', gum:'fa-hand-holding-medical', periodontitis:'fa-disease',
    'gum-surgery':'fa-scalpel', 'wisdom-tooth':'fa-tooth',
    apicoectomy:'fa-cut', sedation:'fa-bed', prevention:'fa-shield-alt',
    tmj:'fa-head-side', bruxism:'fa-compress', emergency:'fa-ambulance'
  };

  function cleanDesc(desc) {
    if (!desc) return '';
    var firstPara = desc.split(/\n\s*\n/)[0] || '';
    firstPara = firstPara.replace(/[✅❌⭐🔹🔸▶►●•]/g, '').replace(/^\d+\.\s*/gm, '').trim();
    firstPara = firstPara.replace(/\n/g, ' ').trim();
    if (firstPara.length > 120) firstPara = firstPara.substring(0, 120) + '…';
    return firstPara;
  }

  // ─── 라이트박스 v14: Before/After 드래그 슬라이더 ───
  var lbCaseData = null;
  var sliderDragging = false;

  function createLightbox() {
    if (document.getElementById('photoLightbox')) return;
    var lb = document.createElement('div');
    lb.id = 'photoLightbox';
    lb.className = 'photo-lightbox';
    lb.innerHTML =
      '<div class="lb-backdrop"></div>' +
      '<div class="lb-container">' +
        '<button class="lb-close" aria-label="닫기"><i class="fas fa-times"></i></button>' +
        // 슬라이더 모드
        '<div class="lb-slider-wrap" id="lbSliderWrap" style="display:none;">' +
          '<div class="lb-slider" id="lbSlider">' +
            '<img class="lb-slider-after" id="lbSliderAfter" alt="After" draggable="false">' +
            '<div class="lb-slider-before-clip" id="lbSliderBeforeClip">' +
              '<img class="lb-slider-before" id="lbSliderBefore" alt="Before" draggable="false">' +
            '</div>' +
            '<div class="lb-slider-handle" id="lbSliderHandle">' +
              '<div class="lb-slider-handle-line"></div>' +
              '<div class="lb-slider-handle-btn">' +
                '<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i>' +
              '</div>' +
              '<div class="lb-slider-handle-line"></div>' +
            '</div>' +
            '<div class="lb-slider-label lb-slider-label-before">BEFORE</div>' +
            '<div class="lb-slider-label lb-slider-label-after">AFTER</div>' +
            '<div class="lb-lock" id="lbLock">' +
              '<div class="lb-lock-inner">' +
                '<i class="fas fa-lock"></i>' +
                '<p>애프터 사진은 로그인 후 확인 가능합니다</p>' +
                '<a href="/auth/login" class="lb-lock-btn" id="lbLoginBtn"><i class="fas fa-sign-in-alt"></i> 로그인하기</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<p class="lb-slider-hint" id="lbSliderHint"><i class="fas fa-arrows-alt-h"></i> 좌우로 드래그하여 비교하세요</p>' +
        '</div>' +
        // 단일 이미지 모드 (파노라마 등)
        '<div class="lb-image-wrap" id="lbImageWrap" style="display:none;">' +
          '<img class="lb-img" id="lbImg" alt="" draggable="false">' +
          '<div class="lb-loading"><i class="fas fa-spinner fa-spin"></i></div>' +
        '</div>' +
        // 탭 (파노라마가 있을 때)
        '<div class="lb-tabs" id="lbTabs"></div>' +
        '<div class="lb-info" id="lbInfo"></div>' +
      '</div>';
    document.body.appendChild(lb);

    // 스타일 주입
    if (!document.getElementById('lightboxStylesV14')) {
      var s = document.createElement('style');
      s.id = 'lightboxStylesV14';
      s.textContent =
        /* 기본 레이아웃 */
        '.photo-lightbox{display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:10001;align-items:center;justify-content:center;}' +
        '.photo-lightbox.active{display:flex;}' +
        '.lb-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.92);cursor:pointer;}' +
        '.lb-container{position:relative;width:95%;max-width:820px;max-height:92vh;display:flex;flex-direction:column;z-index:1;}' +
        '.lb-close{position:absolute;top:-8px;right:-8px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:1.1rem;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;transition:all .2s;backdrop-filter:blur(8px);}' +
        '.lb-close:hover{background:rgba(255,255,255,0.3);transform:scale(1.1);}' +
        /* 슬라이더 */
        '.lb-slider-wrap{position:relative;}' +
        '.lb-slider{position:relative;border-radius:12px;overflow:hidden;background:#111;cursor:col-resize;user-select:none;-webkit-user-select:none;touch-action:pan-y pinch-zoom;}' +
        '.lb-slider-after{display:block;width:100%;max-height:70vh;object-fit:contain;pointer-events:none;}' +
        '.lb-slider-before-clip{position:absolute;top:0;left:0;bottom:0;width:50%;overflow:hidden;z-index:2;pointer-events:none;}' +
        '.lb-slider-before{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;pointer-events:none;}' +
        '.lb-slider-handle{position:absolute;top:0;bottom:0;left:50%;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateX(-50%);pointer-events:none;}' +
        '.lb-slider-handle-line{width:3px;flex:1;background:rgba(255,255,255,0.9);border-radius:2px;box-shadow:0 0 8px rgba(0,0,0,0.4);}' +
        '.lb-slider-handle-btn{width:44px;height:44px;border-radius:50%;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;gap:2px;color:#6B4226;font-size:0.7rem;margin:4px 0;flex-shrink:0;}' +
        '.lb-slider-label{position:absolute;bottom:12px;padding:6px 16px;border-radius:8px;font-size:0.75rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;z-index:3;pointer-events:none;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}' +
        '.lb-slider-label-before{left:12px;background:rgba(107,66,38,0.85);color:#fff;}' +
        '.lb-slider-label-after{right:12px;background:rgba(200,169,126,0.85);color:#fff;}' +
        '.lb-slider-hint{text-align:center;color:rgba(255,255,255,0.5);font-size:0.82rem;margin-top:8px;transition:opacity 0.5s;}' +
        '.lb-slider-hint i{margin-right:6px;}' +
        /* 로그인 잠금 (슬라이더 위) */
        '.lb-lock{display:none;position:absolute;top:0;right:0;bottom:0;width:50%;background:rgba(0,0,0,0.8);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);align-items:center;justify-content:center;text-align:center;color:#fff;z-index:6;}' +
        '.lb-lock.active{display:flex;}' +
        '.lb-lock-inner i{font-size:2.2rem;color:#C8A97E;margin-bottom:12px;display:block;}' +
        '.lb-lock-inner p{font-size:0.92rem;opacity:0.8;margin-bottom:16px;line-height:1.5;}' +
        '.lb-lock-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 24px;background:#6B4226;color:#fff;border-radius:50px;font-weight:700;font-size:0.9rem;text-decoration:none;transition:all .2s;}' +
        '.lb-lock-btn:hover{background:#8B6344;transform:translateY(-2px);}' +
        /* 단일 이미지 모드 */
        '.lb-image-wrap{position:relative;border-radius:12px;overflow:hidden;background:#111;min-height:200px;display:flex;align-items:center;justify-content:center;}' +
        '.lb-img{display:block;max-width:100%;max-height:70vh;margin:0 auto;object-fit:contain;transition:opacity .3s;}' +
        '.lb-img.loading{opacity:0;}' +
        '.lb-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);font-size:1.5rem;}' +
        /* 탭 (파노라마용) */
        '.lb-tabs{display:flex;gap:4px;margin-top:8px;justify-content:center;}' +
        '.lb-tabs:empty{display:none;}' +
        '.lb-tab{padding:8px 20px;border-radius:50px;border:2px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:0.82rem;font-weight:700;cursor:pointer;transition:all .2s;backdrop-filter:blur(8px);}' +
        '.lb-tab:hover{border-color:rgba(255,255,255,0.4);color:#fff;}' +
        '.lb-tab.active{background:rgba(107,66,38,0.9);border-color:#C8A97E;color:#fff;}' +
        '.lb-tab .lb-tab-icon{margin-right:6px;}' +
        /* 케이스 정보 */
        '.lb-info{padding:12px 4px;text-align:center;color:rgba(255,255,255,0.7);font-size:0.88rem;}' +
        '.lb-info strong{color:#fff;font-weight:700;}' +
        '.lb-info .lb-info-cat{display:inline-block;padding:2px 10px;border-radius:50px;background:rgba(200,169,126,0.2);color:#C8A97E;font-size:0.78rem;font-weight:600;margin-right:8px;}' +
        /* 반응형 */
        '@media(max-width:900px){.lb-container{width:100%;max-width:100%;padding:0 8px;}.lb-close{top:8px;right:16px;}}' +
        '@media(max-width:600px){.lb-tab{padding:6px 14px;font-size:0.76rem;}.lb-slider-handle-btn{width:36px;height:36px;font-size:0.6rem;}.lb-slider-label{font-size:0.65rem;padding:4px 10px;}.lb-slider-after,.lb-slider-before{max-height:55vh;}.lb-img{max-height:55vh;}}';
      document.head.appendChild(s);
    }

    // 이벤트 — 닫기
    lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e) {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
    });

    // 드래그 슬라이더 이벤트
    initSliderDrag();
  }

  function initSliderDrag() {
    var slider = document.getElementById('lbSlider');
    if (!slider) return;

    function getPos(e) {
      var rect = slider.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var x = clientX - rect.left;
      var pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      return pct;
    }

    function updateSlider(pct) {
      var clip = document.getElementById('lbSliderBeforeClip');
      var handle = document.getElementById('lbSliderHandle');
      if (clip) clip.style.width = pct + '%';
      if (handle) handle.style.left = pct + '%';
      // 힌트 숨김
      var hint = document.getElementById('lbSliderHint');
      if (hint && hint.style.opacity !== '0') hint.style.opacity = '0';
    }

    // 마우스
    slider.addEventListener('mousedown', function(e) {
      e.preventDefault();
      sliderDragging = true;
      updateSlider(getPos(e));
    });
    document.addEventListener('mousemove', function(e) {
      if (!sliderDragging) return;
      e.preventDefault();
      updateSlider(getPos(e));
    });
    document.addEventListener('mouseup', function() {
      sliderDragging = false;
    });

    // 터치
    slider.addEventListener('touchstart', function(e) {
      sliderDragging = true;
      updateSlider(getPos(e));
    }, { passive: true });
    slider.addEventListener('touchmove', function(e) {
      if (!sliderDragging) return;
      updateSlider(getPos(e));
    }, { passive: true });
    slider.addEventListener('touchend', function() {
      sliderDragging = false;
    });
  }

  function openLightbox(caseItem, startType) {
    createLightbox();
    lbCaseData = caseItem;

    var hasBothIntraoral = !!(caseItem.beforeImage && caseItem.afterImage);
    var hasPanoBefore = !!caseItem.panBeforeImage;
    var hasPanoAfter = !!caseItem.panAfterImage;
    var hasBothPano = hasPanoBefore && hasPanoAfter;
    var afterLocked = !isLoggedIn;

    var sliderWrap = document.getElementById('lbSliderWrap');
    var imageWrap = document.getElementById('lbImageWrap');
    var tabsEl = document.getElementById('lbTabs');
    tabsEl.innerHTML = '';

    // ─── 모드 결정 ───
    // 구내 before+after 둘 다 있으면 → 슬라이더 모드 (기본)
    // 파노라마 있으면 → 탭으로 전환 가능
    // 하나만 있으면 → 단일 이미지 모드

    var currentMode = 'slider'; // slider | pano-slider | single
    var tabItems = [];

    if (hasBothIntraoral) {
      tabItems.push({ id: 'intraoral', label: '구내 비교', icon: 'fa-camera', mode: 'slider', before: caseItem.beforeImage, after: caseItem.afterImage });
    } else if (caseItem.beforeImage) {
      tabItems.push({ id: 'before-only', label: 'BEFORE 구내', icon: 'fa-camera', mode: 'single', src: caseItem.beforeImage });
    }

    if (hasBothPano) {
      tabItems.push({ id: 'pano', label: '파노라마 비교', icon: 'fa-x-ray', mode: 'slider', before: caseItem.panBeforeImage, after: caseItem.panAfterImage });
    } else {
      if (hasPanoBefore) tabItems.push({ id: 'pano-before', label: 'BEFORE 파노', icon: 'fa-x-ray', mode: 'single', src: caseItem.panBeforeImage });
      if (hasPanoAfter) tabItems.push({ id: 'pano-after', label: 'AFTER 파노', icon: 'fa-x-ray', mode: 'single', src: caseItem.panAfterImage, isAfter: true });
    }

    if (tabItems.length === 0) return;

    // 탭 생성 (2개 이상일 때만 표시)
    if (tabItems.length > 1) {
      tabItems.forEach(function(item, idx) {
        var isAfterOnly = item.isAfter && afterLocked;
        var tab = document.createElement('button');
        tab.className = 'lb-tab' + (idx === 0 ? ' active' : '');
        tab.innerHTML = '<span class="lb-tab-icon"><i class="fas ' + item.icon + '"></i></span>' + item.label + (isAfterOnly ? ' <i class="fas fa-lock" style="margin-left:4px;font-size:0.65rem;opacity:0.5;"></i>' : '');
        tab.addEventListener('click', function() { switchTab(idx); });
        tabsEl.appendChild(tab);
      });
    }

    // 첫 번째 탭 표시
    switchTab(0);

    function switchTab(idx) {
      var item = tabItems[idx];
      if (!item) return;

      // 탭 활성화
      var tabs = tabsEl.querySelectorAll('.lb-tab');
      tabs.forEach(function(t, i) { t.classList.toggle('active', i === idx); });

      var lockEl = document.getElementById('lbLock');

      if (item.mode === 'slider') {
        sliderWrap.style.display = 'block';
        imageWrap.style.display = 'none';

        var beforeImg = document.getElementById('lbSliderBefore');
        var afterImg = document.getElementById('lbSliderAfter');
        var clip = document.getElementById('lbSliderBeforeClip');
        var handle = document.getElementById('lbSliderHandle');
        var hint = document.getElementById('lbSliderHint');

        // 초기 위치 50%
        clip.style.width = '50%';
        handle.style.left = '50%';
        if (hint) hint.style.opacity = '1';

        // 이미지 로드 — before 크기를 after에 정확히 맞춤
        function syncBeforeSize() {
          if (afterImg.naturalWidth && afterImg.offsetHeight) {
            beforeImg.style.width = afterImg.offsetWidth + 'px';
            beforeImg.style.height = afterImg.offsetHeight + 'px';
          }
        }
        beforeImg.onload = syncBeforeSize;
        afterImg.onload = syncBeforeSize;
        // 리사이즈 대응
        window.addEventListener('resize', syncBeforeSize);

        afterImg.src = item.after;
        beforeImg.src = item.before;

        // 로그인 잠금
        if (afterLocked) {
          lockEl.classList.add('active');
          handle.style.display = 'none';
          clip.style.width = '100%';
          if (hint) hint.style.display = 'none';
        } else {
          lockEl.classList.remove('active');
          handle.style.display = 'flex';
          if (hint) hint.style.display = 'block';
        }
      } else {
        // 단일 이미지 모드
        sliderWrap.style.display = 'none';
        imageWrap.style.display = 'flex';
        lockEl.classList.remove('active');

        var img = document.getElementById('lbImg');
        var isAfterType = item.isAfter;

        if (isAfterType && afterLocked) {
          img.style.display = 'none';
          // 간단한 잠금 표시
          imageWrap.innerHTML = '<img class="lb-img" id="lbImg" alt="" draggable="false" style="display:none">' +
            '<div class="lb-loading" style="display:none;"></div>' +
            '<div style="text-align:center;color:#fff;padding:40px;"><i class="fas fa-lock" style="font-size:2.5rem;color:#C8A97E;margin-bottom:16px;display:block;"></i><p style="font-size:1rem;opacity:0.8;margin-bottom:20px;">애프터 사진은 로그인 후 확인 가능합니다</p><a href="/auth/login?redirect=/cases/' + caseItem.id + '" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:#6B4226;color:#fff;border-radius:50px;font-weight:700;font-size:0.95rem;text-decoration:none;"><i class="fas fa-sign-in-alt"></i> 로그인하기</a></div>';
        } else {
          imageWrap.innerHTML = '<img class="lb-img" id="lbImg" alt="" draggable="false">' +
            '<div class="lb-loading"><i class="fas fa-spinner fa-spin"></i></div>';
          img = document.getElementById('lbImg');
          img.onload = function() { img.style.opacity = '1'; imageWrap.querySelector('.lb-loading').style.display = 'none'; };
          img.onerror = function() { img.alt = '사진을 불러올 수 없습니다'; imageWrap.querySelector('.lb-loading').style.display = 'none'; };
          img.style.opacity = '0';
          img.src = item.src;
          img.alt = item.label + ' - ' + (caseItem.title || '');
          setTimeout(function() { img.style.opacity = '1'; }, 100);
        }
      }
    }

    // 케이스 정보
    var catLabel = CATS[caseItem.category] || caseItem.category || '';
    var infoEl = document.getElementById('lbInfo');
    var docNameClean = (caseItem.doctorName || '').replace(/ 원장$/, '');
    infoEl.innerHTML = '<span class="lb-info-cat">' + catLabel + '</span> <strong>' + (caseItem.title || '') + '</strong>' + (docNameClean ? ' · ' + docNameClean + ' 원장' : '');

    // 로그인 버튼 redirect
    var loginBtn = document.getElementById('lbLoginBtn');
    if (loginBtn) loginBtn.href = '/auth/login?redirect=/cases/' + caseItem.id;

    var lb = document.getElementById('photoLightbox');
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    var lb = document.getElementById('photoLightbox');
    if (lb) {
      lb.classList.remove('active');
      document.body.style.overflow = '';
      sliderDragging = false;
      // 이미지 src 정리
      var imgs = lb.querySelectorAll('img');
      imgs.forEach(function(img) { img.src = ''; });
    }
  }

  // ─── 로그인 안내 모달 ───
  function createLoginModal() {
    if (document.getElementById('loginPromptModal')) return;
    var modal = document.createElement('div');
    modal.id = 'loginPromptModal';
    modal.className = 'login-modal';
    modal.innerHTML =
      '<div class="login-modal-backdrop"></div>' +
      '<div class="login-modal-card">' +
        '<button class="login-modal-close" aria-label="닫기"><i class="fas fa-times"></i></button>' +
        '<div class="login-modal-icon">' +
          '<div class="login-modal-icon-ring">' +
            '<i class="fas fa-lock"></i>' +
          '</div>' +
        '</div>' +
        '<h3 class="login-modal-title">로그인이 필요합니다</h3>' +
        '<p class="login-modal-desc">치료 전/후 사진과 상세 케이스 정보는<br>로그인 후 확인하실 수 있습니다.</p>' +
        '<div class="login-modal-benefits">' +
          '<div class="login-modal-benefit"><i class="fas fa-check-circle"></i> 비포/애프터 사진 전체 공개</div>' +
          '<div class="login-modal-benefit"><i class="fas fa-check-circle"></i> 파노라마·구내 사진 확인</div>' +
          '<div class="login-modal-benefit"><i class="fas fa-check-circle"></i> 상세 치료 과정 열람</div>' +
        '</div>' +
        '<div class="login-modal-actions">' +
          '<a href="/auth/login" class="login-modal-btn login-modal-btn-primary" id="loginModalLoginBtn">' +
            '<i class="fas fa-sign-in-alt"></i> 로그인하기' +
          '</a>' +
          '<a href="/auth/register" class="login-modal-btn login-modal-btn-secondary">' +
            '<i class="fas fa-user-plus"></i> 회원가입 (10초)' +
          '</a>' +
        '</div>' +
        '<p class="login-modal-note"><i class="fas fa-shield-alt"></i> 개인정보는 안전하게 보호됩니다</p>' +
      '</div>';
    document.body.appendChild(modal);

    // 이벤트 바인딩
    modal.querySelector('.login-modal-backdrop').addEventListener('click', closeLoginModal);
    modal.querySelector('.login-modal-close').addEventListener('click', closeLoginModal);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLoginModal();
    });
  }

  function showLoginModal(redirectPath) {
    createLoginModal();
    var modal = document.getElementById('loginPromptModal');
    var loginBtn = document.getElementById('loginModalLoginBtn');
    if (loginBtn && redirectPath) {
      loginBtn.href = '/auth/login?redirect=' + encodeURIComponent(redirectPath);
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLoginModal() {
    var modal = document.getElementById('loginPromptModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ─── 카드 렌더링 v13 (나이·성별 추가) ───
  function renderCard(c) {
    var catLabel = CATS[c.category] || c.category || '';
    var catSlugMap = { 'front-crown': 'crown' };
    var treatmentSlug = catSlugMap[c.category] || c.category;
    var hasIntraoral = c.hasIntraoral || (c.beforeImage && !c.beforeImage.includes('favicon'));
    var hasPano = c.hasPano || c.panBeforeImage || c.panAfterImage;
    var imgSrc = c.thumbnailImage || c.beforeImage || c.panBeforeImage || '';
    var hasAnyImage = c.hasAnyImage || !!imgSrc;
    var catIcon = CAT_ICONS[c.category] || 'fa-tooth';

    // 이미지 수
    var imgCount = 0;
    if (c.beforeImage) imgCount++;
    if (c.afterImage) imgCount++;
    if (c.panBeforeImage) imgCount++;
    if (c.panAfterImage) imgCount++;

    // 사진 영역
    var photoHtml;
    if (hasAnyImage && imgSrc) {
      photoHtml =
        '<div class="gc-photo" data-action="lightbox" data-case-id="' + c.id + '" data-photo-type="before" style="cursor:zoom-in">' +
          '<img src="' + imgSrc + '" alt="' + (c.title || 'Before') + '" class="gc-img" loading="lazy" ' +
            'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<div class="gc-ph" style="display:none"><i class="fas ' + catIcon + '"></i><span>사진 준비중</span></div>' +
          '<div class="gc-photo-overlay">' +
            '<span class="gc-badge-before">BEFORE</span>' +
            '<div class="gc-badge-types">' +
              (hasIntraoral ? '<span class="gc-badge-type"><i class="fas fa-camera"></i> 구내</span>' : '') +
              (hasPano ? '<span class="gc-badge-type gc-badge-pano"><i class="fas fa-x-ray"></i> 파노</span>' : '') +
            '</div>' +
          '</div>' +
          (imgCount > 1 ? '<div class="gc-photo-count"><i class="far fa-images"></i> ' + imgCount + '</div>' : '') +
          (!isLoggedIn ? '<div class="gc-login-hint"><i class="fas fa-lock"></i> 로그인 후 애프터 사진 확인</div>' : '') +
          '<div class="gc-zoom-hint"><i class="fas fa-search-plus"></i></div>' +
        '</div>';
    } else {
      photoHtml =
        '<div class="gc-photo">' +
          '<div class="gc-ph"><i class="fas ' + catIcon + '"></i><span>사진 준비중</span></div>' +
          '<div class="gc-photo-overlay">' +
            '<span class="gc-badge-before">BEFORE</span>' +
          '</div>' +
        '</div>';
    }

    // 설명 (3줄까지)
    var desc = cleanDesc(c.description);

    // 원장
    var doctorInitial = (c.doctorName || '?').charAt(0);
    var doctorDisplay = c.doctorSlug
      ? '<a href="/doctors/' + c.doctorSlug + '" onclick="event.stopPropagation()" class="gc-doctor-link">' + (c.doctorName || '') + '</a>'
      : '<span class="gc-doctor-name">' + (c.doctorName || '') + '</span>';

    // 지역 표시
    var regionHtml = c.region
      ? '<span class="gc-region"><i class="fas fa-map-marker-alt"></i> ' + c.region + '</span>'
      : '';

    // 환자 정보 (나이·성별)
    var patientHtml = '';
    if (c.patientAge || c.patientGender) {
      var genderText = c.patientGender === 'male' ? '남성' : c.patientGender === 'female' ? '여성' : '';
      var ageText = c.patientAge || '';
      var patientText = [ageText, genderText].filter(Boolean).join(' ');
      if (patientText) {
        patientHtml = '<span class="gc-patient"><i class="fas fa-user"></i> ' + patientText + '</span>';
      }
    }

    return '<div class="gc-card" data-href="/cases/' + c.id + '" data-category="' + (filterGroupMap[c.category] || 'general') + '" data-region="' + (c.region || '') + '" role="link" tabindex="0">' +
      photoHtml +
      '<div class="gc-body">' +
        // 상단 메타 라인: 카테고리 + 기간 + 지역
        '<div class="gc-meta">' +
          '<a href="/treatments/' + treatmentSlug + '" onclick="event.stopPropagation()" class="gc-category"><i class="fas ' + catIcon + '"></i> ' + catLabel + '</a>' +
          (c.treatmentPeriod ? '<span class="gc-period"><i class="far fa-clock"></i> ' + c.treatmentPeriod + '</span>' : '') +
          regionHtml +
          patientHtml +
        '</div>' +
        // 제목
        '<h3 class="gc-title">' + (c.title || '') + '</h3>' +
        // 설명 (3줄)
        (desc ? '<p class="gc-desc">' + desc + '</p>' : '') +
        // 하단: 원장 + CTA
        '<div class="gc-bottom">' +
          '<div class="gc-doctor">' +
            '<div class="gc-avatar">' + doctorInitial + '</div>' +
            doctorDisplay +
          '</div>' +
          '<span class="gc-cta">자세히 <i class="fas fa-chevron-right"></i></span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderGallery(filter) {
    var grid = document.getElementById('galleryGrid');
    var loading = document.getElementById('loadingState');
    var empty = document.getElementById('emptyState');
    if (!grid) return;

    var sorted = cases.slice().sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    var filtered;
    if (filter === 'all') {
      filtered = sorted;
    } else {
      filtered = sorted.filter(function(c) { return (filterGroupMap[c.category] || 'general') === filter; });
    }

    // 지역 필터 적용
    if (currentRegion !== 'all') {
      filtered = filtered.filter(function(c) {
        return (c.region || '').indexOf(currentRegion) !== -1;
      });
    }

    if (loading) loading.style.display = 'none';

    if (filtered.length === 0) {
      grid.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';
    grid.style.display = 'grid';

    var html = '';
    filtered.forEach(function(c) { html += renderCard(c); });
    grid.innerHTML = html;

    // 사진 영역(gc-photo) 클릭 → 라이트박스 열기
    grid.querySelectorAll('.gc-photo[data-action="lightbox"]').forEach(function(photoDiv) {
      photoDiv.addEventListener('click', function(e) {
        e.stopPropagation();
        var caseId = photoDiv.getAttribute('data-case-id');
        var photoType = photoDiv.getAttribute('data-photo-type') || 'before';
        var caseItem = cases.find(function(c) { return c.id === caseId; });
        if (caseItem) openLightbox(caseItem, photoType);
      });
    });

    // 카드 클릭 이벤트 — 비로그인 시 모달 표시
    grid.querySelectorAll('.gc-card[data-href]').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('a')) return;
        if (e.target.closest('.gc-photo[data-action="lightbox"]')) return;  // 사진 영역 클릭은 라이트박스로
        var href = card.getAttribute('data-href');
        if (!isLoggedIn) {
          showLoginModal(href);
          return;
        }
        if (href) window.location.href = href;
      });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var href = card.getAttribute('data-href');
          if (!isLoggedIn) {
            showLoginModal(href);
            return;
          }
          if (href) window.location.href = href;
        }
      });
    });
  }

  function updateStats() {
    var counts = { all: cases.length, implant: 0, invisalign: 0, orthodontics: 0, 'front-crown': 0, aesthetic: 0, glownate: 0, resin: 0, whitening: 0, general: 0, gum: 0 };
    cases.forEach(function(c) {
      var group = filterGroupMap[c.category] || 'general';
      counts[group] = (counts[group] || 0) + 1;
    });

    var ids = {
      all: 'countAll', implant: 'countImplant', invisalign: 'countInvisalign',
      orthodontics: 'countOrthodontics', 'front-crown': 'countFrontCrown',
      aesthetic: 'countAesthetic', glownate: 'countGlownate', resin: 'countResin',
      whitening: 'countWhitening', general: 'countGeneral', gum: 'countGum'
    };
    Object.keys(ids).forEach(function(k) {
      var el = document.getElementById(ids[k]);
      if (el) el.textContent = counts[k] || 0;
    });

    if (document.getElementById('statTotal')) document.getElementById('statTotal').textContent = cases.length;
    if (document.getElementById('statGlownate')) document.getElementById('statGlownate').textContent = (counts.glownate || 0);
    if (document.getElementById('statImplant')) document.getElementById('statImplant').textContent = counts.implant;
    if (document.getElementById('statInvisalign')) document.getElementById('statInvisalign').textContent = (counts.invisalign || 0);
    if (document.getElementById('statOrthodontics')) document.getElementById('statOrthodontics').textContent = (counts.orthodontics || 0);
    if (document.getElementById('statFrontCrown')) document.getElementById('statFrontCrown').textContent = (counts['front-crown'] || 0);
    if (document.getElementById('statAesthetic')) document.getElementById('statAesthetic').textContent = (counts.aesthetic || 0);
  }

  async function loadCasesFromAPI() {
    try {
      var res = await fetch('/api/cases');
      if (res.ok) { cases = await res.json(); }
    } catch(e) {
      console.warn('케이스 로드 실패:', e);
      cases = [];
    }
  }

  async function checkAuth() {
    try {
      if (window.__bdAuth && window.__bdAuth.loggedIn) { isLoggedIn = true; return; }
      var res = await fetch('/api/auth/me');
      var data = await res.json();
      isLoggedIn = data.loggedIn || false;
    } catch(e) { isLoggedIn = false; }
  }

  // 지역 필터 칩 동적 생성
  function buildRegionFilter() {
    var regionSection = document.getElementById('regionFilterSection');
    var wrap = document.getElementById('regionFilterWrap');
    if (!regionSection || !wrap) return;

    var regionCount = {};
    cases.forEach(function(c) {
      if (c.region) {
        var parts = c.region.split(', ');
        var key = parts.length > 1 ? parts[0] : c.region;
        regionCount[key] = (regionCount[key] || 0) + 1;
      }
    });

    var regionKeys = Object.keys(regionCount);
    if (regionKeys.length === 0) { regionSection.style.display = 'none'; return; }

    regionKeys.sort(function(a, b) { return regionCount[b] - regionCount[a]; });

    regionSection.style.display = 'block';
    var mainChips = regionKeys.slice(0, 6);
    var extraChips = regionKeys.slice(6);

    var html = '<span class="region-filter-label"><i class="fas fa-map-marker-alt"></i> 지역</span>';
    html += '<button class="region-chip active" data-region="all">전체</button>';
    mainChips.forEach(function(r) {
      html += '<button class="region-chip" data-region="' + r + '">' + r + '<span class="chip-count">' + regionCount[r] + '</span></button>';
    });

    if (extraChips.length > 0) {
      html += '<button class="region-more-btn" id="regionMoreBtn">+ ' + extraChips.length + '개 더보기</button>';
      html += '<div class="region-extra-chips" id="regionExtraChips">';
      extraChips.forEach(function(r) {
        html += '<button class="region-chip" data-region="' + r + '">' + r + '<span class="chip-count">' + regionCount[r] + '</span></button>';
      });
      html += '</div>';
    }

    wrap.innerHTML = html;

    // 더보기 버튼
    var moreBtn = document.getElementById('regionMoreBtn');
    if (moreBtn) {
      moreBtn.addEventListener('click', function() {
        var extra = document.getElementById('regionExtraChips');
        extra.classList.toggle('open');
        moreBtn.textContent = extra.classList.contains('open') ? '접기' : '+ ' + extraChips.length + '개 더보기';
      });
    }

    // 칩 이벤트
    wrap.querySelectorAll('.region-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        wrap.querySelectorAll('.region-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentRegion = chip.getAttribute('data-region');
        renderGallery(currentFilter);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', async function() {
    await Promise.all([loadCasesFromAPI(), checkAuth()]);
    updateStats();
    buildRegionFilter();
    renderGallery('all');

    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderGallery(currentFilter);
      });
    });
  });
})();
