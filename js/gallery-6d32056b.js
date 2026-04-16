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

  // ─── 라이트박스 v15: Premium Before/After Slider ───
  var lbCaseData = null;
  var sliderDragging = false;
  var sliderResizeHandler = null;

  function createLightbox() {
    if (document.getElementById('photoLightbox')) return;
    var lb = document.createElement('div');
    lb.id = 'photoLightbox';
    lb.className = 'photo-lightbox';
    lb.innerHTML =
      '<div class="lb-backdrop"></div>' +
      '<div class="lb-container">' +
        '<button class="lb-close" aria-label="닫기"><i class="fas fa-times"></i></button>' +
        /* ── v17 커튼 슬라이더 모드 ── */
        '<div class="lb-slider-wrap" id="lbSliderWrap" style="display:none;">' +
          '<div class="lb-slider" id="lbSlider">' +
            /* After 레이어: 전체 배경으로 깔림 */
            '<div class="lb-layer lb-layer-after" id="lbLayerAfter">' +
              '<img class="lb-s-img" id="lbAfterImg" alt="After" draggable="false">' +
            '</div>' +
            /* Before 레이어: width를 슬라이더 %로 제어, overflow:hidden */
            '<div class="lb-layer lb-layer-before" id="lbLayerBefore">' +
              '<img class="lb-s-img" id="lbBeforeImg" alt="Before" draggable="false">' +
            '</div>' +
            /* 핸들 */
            '<div class="lb-handle" id="lbHandle">' +
              '<div class="lb-handle-line"></div>' +
              '<div class="lb-handle-grip" id="lbGrip">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 6l-4 6 4 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6l4 6-4 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '</div>' +
              '<div class="lb-handle-line"></div>' +
            '</div>' +
            /* 라벨 */
            '<div class="lb-label lb-label-b"><i class="fas fa-arrow-left"></i> BEFORE</div>' +
            '<div class="lb-label lb-label-a">AFTER <i class="fas fa-arrow-right"></i></div>' +
            /* 잠금 */
            '<div class="lb-lock" id="lbLock">' +
              '<div class="lb-lock-inner">' +
                '<i class="fas fa-lock"></i>' +
                '<p>애프터 사진은<br>로그인 후 확인 가능합니다</p>' +
                '<a href="/auth/login" class="lb-lock-btn" id="lbLoginBtn"><i class="fas fa-sign-in-alt"></i> 로그인</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<p class="lb-hint" id="lbHint"><i class="fas fa-hand-pointer"></i> 드래그하여 치료 전후를 비교하세요</p>' +
        '</div>' +
        /* ── 단일 이미지 모드 ── */
        '<div class="lb-image-wrap" id="lbImageWrap" style="display:none;"></div>' +
        /* ── 탭 + 정보 ── */
        '<div class="lb-tabs" id="lbTabs"></div>' +
        '<div class="lb-info" id="lbInfo"></div>' +
      '</div>';
    document.body.appendChild(lb);

    /* ── v17 스타일 주입 ── */
    if (!document.getElementById('lbStylesV17')) {
      var s = document.createElement('style');
      s.id = 'lbStylesV17';
      s.textContent =
        /* 모달 기본 */
        '.photo-lightbox{display:none;position:fixed;inset:0;z-index:10001;align-items:center;justify-content:center;}' +
        '.photo-lightbox.active{display:flex;}' +
        '.lb-backdrop{position:absolute;inset:0;background:rgba(10,8,6,0.94);cursor:pointer;}' +
        '.lb-container{position:relative;width:94%;max-width:860px;max-height:92vh;display:flex;flex-direction:column;z-index:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none;}' +\n        '.lb-container::-webkit-scrollbar{display:none;}' +
        '.lb-close{position:absolute;top:-12px;right:-12px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:1rem;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;transition:all .25s cubic-bezier(.22,1,.36,1);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);}' +
        '.lb-close:hover{background:rgba(255,255,255,0.2);border-color:rgba(255,255,255,0.3);transform:scale(1.08);}' +

        /* ── v17 커튼 슬라이더 ── */
        '.lb-slider-wrap{position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:column;}' +
        '.lb-slider{position:relative;border-radius:16px;overflow:hidden;background:#0a0806;cursor:col-resize;user-select:none;-webkit-user-select:none;touch-action:none;box-shadow:0 8px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.06);}' +

        /* 레이어 공통 — 둘 다 동일 크기 */
        '.lb-layer{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;}' +
        '.lb-layer-after{z-index:1;}' +
        '.lb-layer-before{z-index:2;width:50%;}' + /* 초기 50% — JS가 덮어씀 */

        /* 이미지: 항상 슬라이더 전체 크기, 절대 변하지 않음 */
        '.lb-s-img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;}' +
        /* Before 이미지는 레이어 width가 줄어도 슬라이더 전체 크기 유지 */
        '.lb-layer-before .lb-s-img{width:var(--slider-w,100%);max-width:none;min-width:var(--slider-w,100%);}' +

        /* ── 핸들: 고급스러운 글래스 ── */
        '.lb-handle{position:absolute;top:0;bottom:0;left:50%;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateX(-50%);pointer-events:none;transition:left 0.06s cubic-bezier(.22,1,.36,1);}' +
        '.lb-handle-line{width:2.5px;flex:1;background:linear-gradient(180deg,transparent 0%,rgba(255,255,255,0.9) 12%,rgba(255,255,255,0.9) 88%,transparent 100%);border-radius:2px;box-shadow:0 0 8px rgba(200,169,126,0.3);}' +
        '.lb-handle-grip{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.97);box-shadow:0 4px 24px rgba(0,0,0,0.4),0 0 0 2px rgba(255,255,255,0.35),0 0 16px rgba(200,169,126,0.15),inset 0 1px 0 rgba(255,255,255,1);display:flex;align-items:center;justify-content:center;color:#6B4226;margin:6px 0;flex-shrink:0;transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s;}' +
        '.lb-slider:active .lb-handle-grip,.lb-slider.dragging .lb-handle-grip{transform:scale(1.15);box-shadow:0 6px 32px rgba(107,66,38,0.45),0 0 0 3px rgba(200,169,126,0.6),0 0 24px rgba(200,169,126,0.25),inset 0 1px 0 rgba(255,255,255,1);}' +

        /* ── 라벨 ── */
        '.lb-label{position:absolute;bottom:16px;padding:7px 18px;border-radius:50px;font-size:0.72rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;z-index:3;pointer-events:none;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.12);transition:opacity .4s;}' +
        '.lb-label i{font-size:0.55rem;vertical-align:middle;}' +
        '.lb-label-b{left:16px;background:rgba(107,66,38,0.8);color:rgba(255,255,255,0.95);}' +
        '.lb-label-a{right:16px;background:rgba(200,169,126,0.75);color:#fff;}' +

        /* ── 힌트 ── */
        '.lb-hint{text-align:center;color:rgba(255,255,255,0.4);font-size:0.8rem;margin-top:10px;transition:opacity .6s;letter-spacing:0.02em;}' +
        '.lb-hint i{margin-right:8px;color:rgba(200,169,126,0.6);}' +

        /* ── 잠금 ── */
        '.lb-lock{display:none;position:absolute;top:0;right:0;bottom:0;width:50%;background:rgba(10,8,6,0.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);align-items:center;justify-content:center;text-align:center;color:#fff;z-index:6;border-left:1px solid rgba(255,255,255,0.08);}' +
        '.lb-lock.active{display:flex;}' +
        '.lb-lock-inner i{font-size:2rem;color:#C8A97E;margin-bottom:12px;display:block;}' +
        '.lb-lock-inner p{font-size:0.88rem;opacity:0.7;margin-bottom:16px;line-height:1.6;}' +
        '.lb-lock-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 24px;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;border-radius:50px;font-weight:700;font-size:0.88rem;text-decoration:none;transition:all .25s;border:1px solid rgba(200,169,126,0.3);}' +
        '.lb-lock-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(107,66,38,0.4);}' +

        /* ── 단일 이미지 ── */
        '.lb-image-wrap{position:relative;border-radius:16px;overflow:hidden;background:#0a0806;min-height:200px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 40px rgba(0,0,0,0.5);}' +
        '.lb-img{display:block;max-width:100%;max-height:70vh;margin:0 auto;object-fit:contain;transition:opacity .4s;}' +
        '.lb-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);font-size:1.4rem;}' +

        /* ── 탭 ── */
        '.lb-tabs{display:flex;gap:6px;margin-top:10px;justify-content:center;}' +
        '.lb-tabs:empty{display:none;}' +
        '.lb-tab{padding:8px 22px;border-radius:50px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-size:0.8rem;font-weight:700;cursor:pointer;transition:all .25s cubic-bezier(.22,1,.36,1);backdrop-filter:blur(8px);}' +
        '.lb-tab:hover{border-color:rgba(255,255,255,0.3);color:#fff;background:rgba(255,255,255,0.1);}' +
        '.lb-tab.active{background:linear-gradient(135deg,rgba(107,66,38,0.9),rgba(139,94,60,0.9));border-color:#C8A97E;color:#fff;}' +
        '.lb-tab .lb-tab-icon{margin-right:6px;}' +

        /* ── 상세 정보 패널 v19 ── */
        '.lb-info{padding:16px 12px 8px;color:rgba(255,255,255,0.7);font-size:0.85rem;flex:0 0 auto;max-height:40vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(200,169,126,0.3) transparent;}' +
        '.lb-info::-webkit-scrollbar{width:5px;}' +
        '.lb-info::-webkit-scrollbar-thumb{background:rgba(200,169,126,0.3);border-radius:4px;}' +
        '.lb-info-header{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px;}' +
        '.lb-info-title-area{flex:1;min-width:200px;}' +
        '.lb-info-title{color:#fff;font-size:1.1rem;font-weight:800;margin:0 0 8px;line-height:1.4;}' +
        '.lb-info-meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;}' +
        '.lb-info-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:50px;font-size:0.72rem;font-weight:600;border:1px solid rgba(255,255,255,0.08);}' +
        '.lb-info-tag i{font-size:0.62rem;}' +
        '.lb-info-tag.cat{background:rgba(200,169,126,0.15);color:#C8A97E;border-color:rgba(200,169,126,0.2);}' +
        '.lb-info-tag.period{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);}' +
        '.lb-info-tag.region{background:rgba(100,180,255,0.1);color:rgba(140,195,255,0.9);}' +
        '.lb-info-tag.patient{background:rgba(180,140,255,0.1);color:rgba(190,160,255,0.9);}' +
        '.lb-info-desc{margin:12px 0;padding:12px 16px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.06);line-height:1.75;color:rgba(255,255,255,0.65);font-size:0.82rem;white-space:pre-line;}' +
        '.lb-info-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);}' +
        '.lb-info-doctor{display:flex;align-items:center;gap:10px;text-decoration:none;color:rgba(255,255,255,0.7);transition:color .2s;}' +
        '.lb-info-doctor:hover{color:#C8A97E;}' +
        '.lb-info-doctor-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.82rem;flex-shrink:0;}' +
        '.lb-info-doctor-name{font-weight:700;color:#fff;font-size:0.85rem;}' +
        '.lb-info-doctor-sub{font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:1px;}' +
        '.lb-info-cta{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;border-radius:50px;font-weight:700;font-size:0.8rem;text-decoration:none;transition:all .25s;border:1px solid rgba(200,169,126,0.3);white-space:nowrap;}' +
        '.lb-info-cta:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(107,66,38,0.4);background:linear-gradient(135deg,#7a4d2f,#9a6d4a);}' +
        '.lb-info-cta i{font-size:0.7rem;}' +
        '.lb-info-empty-desc{text-align:center;padding:8px 0;color:rgba(255,255,255,0.3);font-size:0.78rem;font-style:italic;}' +

        /* ── 반응형 ── */
        '@media(max-width:900px){.lb-container{width:100%;max-width:100%;padding:0 6px;}.lb-close{top:8px;right:14px;}}' +
        '@media(max-width:600px){.lb-container{width:100%;max-width:100%;padding:0 4px;max-height:100dvh;}.lb-tab{padding:6px 16px;font-size:0.75rem;}.lb-handle-grip{width:44px;height:44px;}.lb-handle-grip svg{width:22px;height:22px;}.lb-label{font-size:0.62rem;padding:5px 12px;bottom:10px;}.lb-img{max-height:40vh;}.lb-slider{border-radius:12px;}.lb-hint{font-size:0.75rem;}.lb-hint i{margin-right:6px;}.lb-info{max-height:45vh;padding:12px 8px 6px;}.lb-info-title{font-size:0.95rem;}.lb-info-desc{padding:10px 12px;font-size:0.78rem;}.lb-info-footer{flex-direction:column;align-items:stretch;gap:10px;}.lb-info-cta{justify-content:center;}}' +

        /* ── 애니메이션 ── */
        '@keyframes lbFadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}' +
        '.photo-lightbox.active .lb-container{animation:lbFadeIn .35s cubic-bezier(.22,1,.36,1);}';
      document.head.appendChild(s);
    }

    // 닫기 이벤트
    lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e) {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
    });

    // 슬라이더 드래그 이벤트
    initSliderDrag();
  }

  /* v19: after 이미지 로드 후 슬라이더 크기 고정 — info 패널 공간 확보 */
  function syncSliderSize(afterImg) {
    var slider = document.getElementById('lbSlider');
    if (!slider || !afterImg) return;
    var natW = afterImg.naturalWidth;
    var natH = afterImg.naturalHeight;
    if (!natW || !natH) return;
    var containerW = slider.parentElement.clientWidth;
    /* 슬라이더는 뷰포트 높이의 최대 48%(데스크탑) / 40%(모바일)만 사용 */
    var maxH = window.innerWidth <= 600 ? window.innerHeight * 0.40 : window.innerHeight * 0.48;
    var ratio = natW / natH;
    var renderW = containerW;
    var renderH = containerW / ratio;
    if (renderH > maxH) {
      renderH = maxH;
      renderW = maxH * ratio;
    }
    var w = Math.round(renderW);
    var h = Math.round(renderH);
    slider.style.width = w + 'px';
    slider.style.height = h + 'px';
    slider.style.margin = '0 auto';
    /* Before 이미지가 항상 슬라이더 전체 크기를 유지하도록 CSS 변수 설정 */
    slider.style.setProperty('--slider-w', w + 'px');
    /* info 패널이 보이도록 컨테이너 스크롤 위치 리셋 */
    var container = document.querySelector('.lb-container');
    if (container) container.scrollTop = 0;
  }

  function initSliderDrag() {
    var slider = document.getElementById('lbSlider');
    if (!slider) return;

    function getPercent(e) {
      var rect = slider.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    }

    function applyPosition(pct) {
      /* v17 커튼 방식: Before 레이어의 width를 변경 (이미지 크기는 고정) */
      var beforeLayer = document.getElementById('lbLayerBefore');
      var handle = document.getElementById('lbHandle');
      if (beforeLayer) beforeLayer.style.width = pct + '%';
      if (handle) handle.style.left = pct + '%';
      // 첫 드래그 시 힌트 숨김
      var hint = document.getElementById('lbHint');
      if (hint && hint.style.opacity !== '0') hint.style.opacity = '0';
    }

    // 마우스
    slider.addEventListener('mousedown', function(e) {
      e.preventDefault();
      sliderDragging = true;
      slider.classList.add('dragging');
      applyPosition(getPercent(e));
    });
    document.addEventListener('mousemove', function(e) {
      if (!sliderDragging) return;
      e.preventDefault();
      applyPosition(getPercent(e));
    });
    document.addEventListener('mouseup', function() {
      if (sliderDragging) {
        sliderDragging = false;
        slider.classList.remove('dragging');
      }
    });

    // 터치
    slider.addEventListener('touchstart', function(e) {
      e.preventDefault();
      sliderDragging = true;
      slider.classList.add('dragging');
      applyPosition(getPercent(e));
    }, { passive: false });
    slider.addEventListener('touchmove', function(e) {
      if (!sliderDragging) return;
      e.preventDefault();
      applyPosition(getPercent(e));
    }, { passive: false });
    slider.addEventListener('touchend', function() {
      sliderDragging = false;
      slider.classList.remove('dragging');
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

    // 탭 아이템 구성
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

    // 탭 UI (2개 이상일 때)
    if (tabItems.length > 1) {
      tabItems.forEach(function(item, idx) {
        var locked = item.isAfter && afterLocked;
        var tab = document.createElement('button');
        tab.className = 'lb-tab' + (idx === 0 ? ' active' : '');
        tab.innerHTML = '<span class="lb-tab-icon"><i class="fas ' + item.icon + '"></i></span>' + item.label + (locked ? ' <i class="fas fa-lock" style="margin-left:4px;font-size:0.6rem;opacity:0.4;"></i>' : '');
        tab.addEventListener('click', function() { switchTab(idx); });
        tabsEl.appendChild(tab);
      });
    }

    switchTab(0);

    function switchTab(idx) {
      var item = tabItems[idx];
      if (!item) return;

      // 탭 활성화 표시
      tabsEl.querySelectorAll('.lb-tab').forEach(function(t, i) { t.classList.toggle('active', i === idx); });

      var lockEl = document.getElementById('lbLock');

      if (item.mode === 'slider') {
        sliderWrap.style.display = 'block';
        imageWrap.style.display = 'none';

        var beforeLayer = document.getElementById('lbLayerBefore');
        var beforeImg = document.getElementById('lbBeforeImg');
        var afterImg = document.getElementById('lbAfterImg');
        var handle = document.getElementById('lbHandle');
        var hint = document.getElementById('lbHint');

        // v17 커튼 방식: Before 레이어 width로 제어 (이미지 크기 불변)
        beforeLayer.style.width = '50%';
        handle.style.left = '50%';
        if (hint) hint.style.opacity = '1';

        // resize 핸들러 제거 (이전 탭에서 남은 것)
        if (sliderResizeHandler) {
          window.removeEventListener('resize', sliderResizeHandler);
          sliderResizeHandler = null;
        }

        // after 이미지 로드 후 slider 크기 동기화
        afterImg.onload = function() {
          syncSliderSize(afterImg);
        };
        afterImg.src = item.after;
        beforeImg.src = item.before;

        // 창 크기 변경 시 동기화
        sliderResizeHandler = function() { syncSliderSize(afterImg); };
        window.addEventListener('resize', sliderResizeHandler);

        // 로그인 잠금
        if (afterLocked) {
          lockEl.classList.add('active');
          handle.style.display = 'none';
          beforeLayer.style.width = '100%';
          if (hint) hint.style.display = 'none';
        } else {
          lockEl.classList.remove('active');
          handle.style.display = 'flex';
          if (hint) hint.style.display = 'block';
        }
      } else {
        sliderWrap.style.display = 'none';
        imageWrap.style.display = 'flex';
        if (lockEl) lockEl.classList.remove('active');

        var isAfterType = item.isAfter;
        if (isAfterType && afterLocked) {
          imageWrap.innerHTML =
            '<div style="text-align:center;color:#fff;padding:48px 24px;">' +
              '<i class="fas fa-lock" style="font-size:2rem;color:#C8A97E;margin-bottom:14px;display:block;"></i>' +
              '<p style="font-size:0.92rem;opacity:0.7;margin-bottom:18px;line-height:1.6;">애프터 사진은 로그인 후<br>확인 가능합니다</p>' +
              '<a href="/auth/login?redirect=/cases/' + caseItem.id + '" class="lb-lock-btn"><i class="fas fa-sign-in-alt"></i> 로그인</a>' +
            '</div>';
        } else {
          imageWrap.innerHTML =
            '<img class="lb-img" id="lbImg" alt="" draggable="false" style="opacity:0">' +
            '<div class="lb-loading"><i class="fas fa-spinner fa-spin"></i></div>';
          var img = document.getElementById('lbImg');
          img.onload = function() { img.style.opacity = '1'; var ld = imageWrap.querySelector('.lb-loading'); if (ld) ld.style.display = 'none'; };
          img.onerror = function() { img.alt = '사진을 불러올 수 없습니다'; var ld = imageWrap.querySelector('.lb-loading'); if (ld) ld.style.display = 'none'; };
          img.src = item.src;
          img.alt = item.label + ' - ' + (caseItem.title || '');
        }
      }
    }

    // 케이스 상세 정보 v18
    var catLabel = CATS[caseItem.category] || caseItem.category || '';
    var catIcon = CAT_ICONS[caseItem.category] || 'fa-tooth';
    var infoEl = document.getElementById('lbInfo');
    var docNameClean = (caseItem.doctorName || '').replace(/ 원장$/, '');
    var docInitial = (docNameClean || '?').charAt(0);
    var catSlugMap = { 'front-crown': 'crown' };
    var treatmentSlug = catSlugMap[caseItem.category] || caseItem.category;

    // 메타 태그 구성
    var metaHtml = '<span class="lb-info-tag cat"><i class="fas ' + catIcon + '"></i> ' + catLabel + '</span>';
    if (caseItem.treatmentPeriod) {
      metaHtml += '<span class="lb-info-tag period"><i class="far fa-clock"></i> ' + caseItem.treatmentPeriod + '</span>';
    }
    if (caseItem.region) {
      metaHtml += '<span class="lb-info-tag region"><i class="fas fa-map-marker-alt"></i> ' + caseItem.region + '</span>';
    }
    var patientParts = [];
    if (caseItem.patientAge) patientParts.push(caseItem.patientAge);
    if (caseItem.patientGender) patientParts.push(caseItem.patientGender === 'male' ? '남성' : caseItem.patientGender === 'female' ? '여성' : '');
    var patientText = patientParts.filter(Boolean).join(' ');
    if (patientText) {
      metaHtml += '<span class="lb-info-tag patient"><i class="fas fa-user"></i> ' + patientText + '</span>';
    }

    // 설명 (전체 텍스트)
    var fullDesc = (caseItem.description || '').trim();
    var descHtml = fullDesc
      ? '<div class="lb-info-desc">' + fullDesc.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>'
      : '';

    // 원장 정보
    var doctorHtml = '';
    if (docNameClean) {
      var doctorLink = caseItem.doctorSlug ? '/doctors/' + caseItem.doctorSlug : '#';
      doctorHtml = '<a href="' + doctorLink + '" class="lb-info-doctor" onclick="event.stopPropagation()">' +
        '<div class="lb-info-doctor-avatar">' + docInitial + '</div>' +
        '<div><div class="lb-info-doctor-name">' + docNameClean + ' 원장</div>' +
        '<div class="lb-info-doctor-sub">담당 ' + catLabel + '</div></div>' +
      '</a>';
    }

    // CTA
    var ctaHtml = '<a href="/treatments/' + treatmentSlug + '" class="lb-info-cta" onclick="event.stopPropagation()"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>';

    infoEl.innerHTML =
      '<div class="lb-info-header">' +
        '<div class="lb-info-title-area">' +
          '<h3 class="lb-info-title">' + (caseItem.title || catLabel + ' 케이스') + '</h3>' +
          '<div class="lb-info-meta">' + metaHtml + '</div>' +
        '</div>' +
      '</div>' +
      descHtml +
      '<div class="lb-info-footer">' +
        doctorHtml +
        ctaHtml +
      '</div>';

    // 로그인 redirect
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
      lb.querySelectorAll('img').forEach(function(img) { img.src = ''; });
      // v16: slider 크기 리셋 & resize 핸들러 정리
      var slider = document.getElementById('lbSlider');
      if (slider) { slider.style.width = ''; slider.style.height = ''; }
      if (sliderResizeHandler) {
        window.removeEventListener('resize', sliderResizeHandler);
        sliderResizeHandler = null;
      }
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

    // 사진 영역(gc-photo) 클릭 → 비로그인: 로그인 모달 / 로그인: 라이트박스
    grid.querySelectorAll('.gc-photo[data-action="lightbox"]').forEach(function(photoDiv) {
      photoDiv.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!isLoggedIn) {
          var cardEl = photoDiv.closest('.gc-card[data-href]');
          showLoginModal(cardEl ? cardEl.getAttribute('data-href') : '/cases/gallery');
          return;
        }
        var caseId = photoDiv.getAttribute('data-case-id');
        var photoType = photoDiv.getAttribute('data-photo-type') || 'before';
        var caseItem = cases.find(function(c) { return c.id === caseId; });
        if (caseItem) openLightbox(caseItem, photoType);
      });
    });

    // 카드 클릭 이벤트 — 비로그인: 로그인 모달 / 로그인: 라이트박스(슬라이더)
    grid.querySelectorAll('.gc-card[data-href]').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('a')) return;
        if (e.target.closest('.gc-photo[data-action="lightbox"]')) return;
        var href = card.getAttribute('data-href');
        // 비로그인 → 로그인 모달
        if (!isLoggedIn) {
          showLoginModal(href);
          return;
        }
        // 로그인 → 라이트박스(슬라이더)
        var caseIdEl = card.querySelector('.gc-photo[data-case-id]');
        if (caseIdEl) {
          var id = caseIdEl.getAttribute('data-case-id');
          var caseItem = cases.find(function(c) { return c.id === id; });
          if (caseItem) { openLightbox(caseItem, 'before'); return; }
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
          var caseIdEl = card.querySelector('.gc-photo[data-case-id]');
          if (caseIdEl) {
            var id = caseIdEl.getAttribute('data-case-id');
            var caseItem = cases.find(function(c) { return c.id === id; });
            if (caseItem) { openLightbox(caseItem, 'before'); return; }
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
