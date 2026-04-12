/**
 * 서울비디치과 비포/애프터 갤러리 시스템 v12
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

  // ─── 라이트박스 (사진 확대 모달) ───
  function createLightbox() {
    if (document.getElementById('photoLightbox')) return;
    var lb = document.createElement('div');
    lb.id = 'photoLightbox';
    lb.className = 'photo-lightbox';
    lb.innerHTML =
      '<div class="lb-backdrop"></div>' +
      '<div class="lb-container">' +
        '<button class="lb-close" aria-label="닫기"><i class="fas fa-times"></i></button>' +
        '<div class="lb-tabs" id="lbTabs"></div>' +
        '<div class="lb-image-wrap">' +
          '<img class="lb-img" id="lbImg" alt="">' +
          '<div class="lb-loading"><i class="fas fa-spinner fa-spin"></i></div>' +
          '<div class="lb-lock" id="lbLock">' +
            '<div class="lb-lock-inner">' +
              '<i class="fas fa-lock"></i>' +
              '<p>애프터 사진은 로그인 후 확인 가능합니다</p>' +
              '<a href="/auth/login" class="lb-lock-btn" id="lbLoginBtn"><i class="fas fa-sign-in-alt"></i> 로그인하기</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="lb-info" id="lbInfo"></div>' +
        '<div class="lb-nav">' +
          '<button class="lb-nav-btn lb-prev" id="lbPrev" aria-label="이전"><i class="fas fa-chevron-left"></i></button>' +
          '<button class="lb-nav-btn lb-next" id="lbNext" aria-label="다음"><i class="fas fa-chevron-right"></i></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(lb);

    // 스타일 주입
    if (!document.getElementById('lightboxStyles')) {
      var style = document.createElement('style');
      style.id = 'lightboxStyles';
      style.textContent =
        '.photo-lightbox{display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:10001;align-items:center;justify-content:center;}' +
        '.photo-lightbox.active{display:flex;}' +
        '.lb-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.92);cursor:pointer;}' +
        '.lb-container{position:relative;width:95%;max-width:800px;max-height:92vh;display:flex;flex-direction:column;z-index:1;}' +
        '.lb-close{position:absolute;top:-8px;right:-8px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:1.1rem;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;transition:all .2s;backdrop-filter:blur(8px);}' +
        '.lb-close:hover{background:rgba(255,255,255,0.3);transform:scale(1.1);}' +
        '.lb-tabs{display:flex;gap:4px;margin-bottom:8px;justify-content:center;}' +
        '.lb-tab{padding:8px 20px;border-radius:50px;border:2px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:0.85rem;font-weight:700;cursor:pointer;transition:all .2s;backdrop-filter:blur(8px);}' +
        '.lb-tab:hover{border-color:rgba(255,255,255,0.4);color:#fff;}' +
        '.lb-tab.active{background:rgba(107,66,38,0.9);border-color:#C8A97E;color:#fff;}' +
        '.lb-tab .lb-tab-icon{margin-right:6px;}' +
        '.lb-image-wrap{position:relative;border-radius:12px;overflow:hidden;background:#111;min-height:200px;display:flex;align-items:center;justify-content:center;}' +
        '.lb-img{display:block;max-width:100%;max-height:70vh;margin:0 auto;object-fit:contain;transition:opacity .3s;}' +
        '.lb-img.loading{opacity:0;}' +
        '.lb-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);font-size:1.5rem;}' +
        '.lb-lock{display:none;position:absolute;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);align-items:center;justify-content:center;text-align:center;color:#fff;}' +
        '.lb-lock.active{display:flex;}' +
        '.lb-lock-inner i{font-size:2.5rem;color:#C8A97E;margin-bottom:16px;display:block;}' +
        '.lb-lock-inner p{font-size:1rem;opacity:0.8;margin-bottom:20px;}' +
        '.lb-lock-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:#6B4226;color:#fff;border-radius:50px;font-weight:700;font-size:0.95rem;text-decoration:none;transition:all .2s;}' +
        '.lb-lock-btn:hover{background:#8B6344;transform:translateY(-2px);}' +
        '.lb-info{padding:12px 4px;text-align:center;color:rgba(255,255,255,0.7);font-size:0.88rem;}' +
        '.lb-info strong{color:#fff;font-weight:700;}' +
        '.lb-info .lb-info-cat{display:inline-block;padding:2px 10px;border-radius:50px;background:rgba(200,169,126,0.2);color:#C8A97E;font-size:0.78rem;font-weight:600;margin-right:8px;}' +
        '.lb-nav-btn{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.12);border:none;color:#fff;font-size:1.1rem;cursor:pointer;transition:all .2s;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;}' +
        '.lb-nav-btn:hover{background:rgba(255,255,255,0.25);}' +
        '.lb-nav-btn:disabled{opacity:0.2;cursor:default;}' +
        '.lb-prev{left:-56px;}' +
        '.lb-next{right:-56px;}' +
        '@media(max-width:900px){.lb-prev{left:8px;}.lb-next{right:8px;}.lb-container{width:100%;max-width:100%;padding:0 8px;}.lb-close{top:8px;right:16px;}}' +
        '@media(max-width:600px){.lb-tab{padding:6px 14px;font-size:0.78rem;}.lb-nav-btn{width:36px;height:36px;font-size:0.9rem;}.lb-img{max-height:55vh;}}';
      document.head.appendChild(style);
    }

    // 이벤트
    lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e) {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
    document.getElementById('lbPrev').addEventListener('click', function() { navigateLightbox(-1); });
    document.getElementById('lbNext').addEventListener('click', function() { navigateLightbox(1); });
  }

  var lbPhotos = [];  // [{label, type, src}]
  var lbCurrentIdx = 0;
  var lbCaseData = null;

  function openLightbox(caseItem, startType) {
    createLightbox();
    lbCaseData = caseItem;
    lbPhotos = [];

    // 사진 목록 구성
    if (caseItem.beforeImage) lbPhotos.push({ label: 'BEFORE 구내', type: 'before', src: caseItem.beforeImage });
    if (caseItem.panBeforeImage) lbPhotos.push({ label: 'BEFORE 파노', type: 'before-pano', src: caseItem.panBeforeImage });
    if (caseItem.afterImage) lbPhotos.push({ label: 'AFTER 구내', type: 'after', src: caseItem.afterImage });
    if (caseItem.panAfterImage) lbPhotos.push({ label: 'AFTER 파노', type: 'after-pano', src: caseItem.panAfterImage });

    if (lbPhotos.length === 0) return;

    // 시작 인덱스
    lbCurrentIdx = 0;
    if (startType) {
      for (var i = 0; i < lbPhotos.length; i++) {
        if (lbPhotos[i].type === startType) { lbCurrentIdx = i; break; }
      }
    }

    // 탭 생성
    var tabsEl = document.getElementById('lbTabs');
    tabsEl.innerHTML = '';
    lbPhotos.forEach(function(p, idx) {
      var isAfter = p.type.startsWith('after');
      var locked = isAfter && !isLoggedIn;
      var tab = document.createElement('button');
      tab.className = 'lb-tab' + (idx === lbCurrentIdx ? ' active' : '');
      tab.innerHTML = '<span class="lb-tab-icon"><i class="fas ' + (isAfter ? 'fa-star' : 'fa-camera') + '"></i></span>' + p.label + (locked ? ' <i class="fas fa-lock" style="margin-left:4px;font-size:0.7rem;opacity:0.6;"></i>' : '');
      tab.addEventListener('click', function() { showLightboxPhoto(idx); });
      tabsEl.appendChild(tab);
    });

    showLightboxPhoto(lbCurrentIdx);

    // 케이스 정보
    var catLabel = CATS[caseItem.category] || caseItem.category || '';
    var infoEl = document.getElementById('lbInfo');
    infoEl.innerHTML = '<span class="lb-info-cat">' + catLabel + '</span> <strong>' + (caseItem.title || '') + '</strong>' + (caseItem.doctorName ? ' · ' + caseItem.doctorName + ' 원장' : '');

    // 로그인 버튼 redirect
    var loginBtn = document.getElementById('lbLoginBtn');
    if (loginBtn) loginBtn.href = '/auth/login?redirect=/cases/' + caseItem.id;

    var lb = document.getElementById('photoLightbox');
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function showLightboxPhoto(idx) {
    if (idx < 0 || idx >= lbPhotos.length) return;
    lbCurrentIdx = idx;
    var photo = lbPhotos[idx];
    var isAfter = photo.type.startsWith('after');
    var locked = isAfter && !isLoggedIn;

    var img = document.getElementById('lbImg');
    var lockEl = document.getElementById('lbLock');

    // 탭 활성화
    var tabs = document.querySelectorAll('#lbTabs .lb-tab');
    tabs.forEach(function(t, i) { t.classList.toggle('active', i === idx); });

    // 네비게이션 버튼
    document.getElementById('lbPrev').disabled = (idx === 0);
    document.getElementById('lbNext').disabled = (idx === lbPhotos.length - 1);

    if (locked) {
      img.style.display = 'none';
      lockEl.classList.add('active');
    } else {
      lockEl.classList.remove('active');
      img.style.display = 'block';
      img.classList.add('loading');
      img.onload = function() { img.classList.remove('loading'); };
      img.onerror = function() { img.classList.remove('loading'); img.alt = '사진을 불러올 수 없습니다'; };
      img.src = photo.src;
      img.alt = photo.label + ' - ' + (lbCaseData ? lbCaseData.title : '');
    }
  }

  function navigateLightbox(dir) {
    var newIdx = lbCurrentIdx + dir;
    if (newIdx >= 0 && newIdx < lbPhotos.length) {
      showLightboxPhoto(newIdx);
    }
  }

  function closeLightbox() {
    var lb = document.getElementById('photoLightbox');
    if (lb) {
      lb.classList.remove('active');
      document.body.style.overflow = '';
      var img = document.getElementById('lbImg');
      if (img) img.src = '';
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

  // ─── 카드 렌더링 v11 ───
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

    return '<div class="gc-card" data-href="/cases/' + c.id + '" data-category="' + (filterGroupMap[c.category] || 'general') + '" role="link" tabindex="0">' +
      photoHtml +
      '<div class="gc-body">' +
        // 상단 메타 라인: 카테고리 + 기간
        '<div class="gc-meta">' +
          '<a href="/treatments/' + treatmentSlug + '" onclick="event.stopPropagation()" class="gc-category"><i class="fas ' + catIcon + '"></i> ' + catLabel + '</a>' +
          (c.treatmentPeriod ? '<span class="gc-period"><i class="far fa-clock"></i> ' + c.treatmentPeriod + '</span>' : '') +
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

  document.addEventListener('DOMContentLoaded', async function() {
    await Promise.all([loadCasesFromAPI(), checkAuth()]);
    updateStats();
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
