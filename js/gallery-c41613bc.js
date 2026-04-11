/**
 * 서울비디치과 비포/애프터 갤러리 시스템 v10
 * - Weglot DOM 깨짐 방지: <a> 대신 <div> + JS 클릭 네비게이션
 * - 프리미엄 카드: 비포사진 + 카테고리 + 제목 + 설명 + 원장 = 하나의 카드
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
    if (firstPara.length > 90) firstPara = firstPara.substring(0, 90) + '…';
    return firstPara;
  }

  // ─── 카드 렌더링 v10: Weglot-safe — <div> 사용 ───
  function renderCard(c) {
    var catLabel = CATS[c.category] || c.category || '';
    var catSlugMap = { 'front-crown': 'crown' };
    var treatmentSlug = catSlugMap[c.category] || c.category;
    var hasIntraoral = c.hasIntraoral || (c.beforeImage && !c.beforeImage.includes('favicon'));
    var hasPano = c.hasPano || c.panBeforeImage || c.panAfterImage;
    var imgSrc = c.thumbnailImage || c.beforeImage || c.panBeforeImage || '';
    var hasAnyImage = c.hasAnyImage || !!imgSrc;
    var catIcon = CAT_ICONS[c.category] || 'fa-tooth';

    // 우측 뱃지
    var rightBadges = '';
    if (hasIntraoral) rightBadges += '<span class="gc-type-tag"><i class="fas fa-camera"></i> 구내</span>';
    if (hasPano) rightBadges += '<span class="gc-type-tag gc-type-pano"><i class="fas fa-x-ray"></i> 파노</span>';

    // 사진 영역
    var photoHtml;
    if (hasAnyImage && imgSrc) {
      photoHtml =
        '<div class="gc-photo">' +
          '<img src="' + imgSrc + '" alt="' + (c.title || 'Before') + '" class="gc-img" loading="lazy" ' +
            'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<div class="gc-ph" style="display:none"><i class="fas ' + catIcon + '"></i><span>사진 준비중</span></div>' +
          '<div class="gc-photo-badges">' +
            '<span class="gc-before-label">BEFORE</span>' +
            '<div class="gc-badges-right">' + rightBadges + '</div>' +
          '</div>' +
        '</div>';
    } else {
      photoHtml =
        '<div class="gc-photo">' +
          '<div class="gc-ph"><i class="fas ' + catIcon + '"></i><span>사진 준비중</span></div>' +
          '<div class="gc-photo-badges">' +
            '<span class="gc-before-label">BEFORE</span>' +
          '</div>' +
        '</div>';
    }

    // 카테고리
    var catHtml = c.category
      ? '<a href="/treatments/' + treatmentSlug + '" onclick="event.stopPropagation()" class="gc-cat"><i class="fas ' + catIcon + '"></i> ' + catLabel + '</a>'
      : '<span class="gc-cat"><i class="fas ' + catIcon + '"></i> ' + catLabel + '</span>';

    // 기간
    var periodHtml = c.treatmentPeriod
      ? '<span class="gc-period"><i class="far fa-clock"></i> ' + c.treatmentPeriod + '</span>'
      : '';

    // 이미지 수
    var imgCount = 0;
    if (c.beforeImage) imgCount++;
    if (c.afterImage) imgCount++;
    if (c.panBeforeImage) imgCount++;
    if (c.panAfterImage) imgCount++;
    var imgCountHtml = imgCount > 0
      ? '<span class="gc-img-count"><i class="far fa-images"></i> ' + imgCount + '장</span>'
      : '';

    // 설명
    var desc = cleanDesc(c.description);
    var descHtml = desc
      ? '<p class="gc-desc">' + desc + '</p>'
      : '';

    // 담당 원장
    var doctorInitial = (c.doctorName || '?').charAt(0);
    var doctorHtml = c.doctorSlug
      ? '<a href="/doctors/' + c.doctorSlug + '" onclick="event.stopPropagation()" class="gc-doc-link">' + (c.doctorName || '') + '</a>'
      : '<span class="gc-doc-name">' + (c.doctorName || '') + '</span>';

    // ★ 핵심: <a> 대신 <div> 사용 → Weglot이 DOM 쪼개는 것 방지
    return '<div class="gc-card" data-href="/cases/' + c.id + '" data-category="' + (filterGroupMap[c.category] || 'general') + '" role="link" tabindex="0">' +
      photoHtml +
      '<div class="gc-content">' +
        '<div class="gc-tags">' + catHtml + periodHtml + imgCountHtml + '</div>' +
        '<h3 class="gc-title">' + (c.title || '') + '</h3>' +
        descHtml +
        '<div class="gc-footer">' +
          '<div class="gc-doc">' +
            '<div class="gc-doc-avatar">' + doctorInitial + '</div>' +
            doctorHtml +
          '</div>' +
          '<span class="gc-more">자세히 보기 <i class="fas fa-arrow-right"></i></span>' +
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

    // ★ 카드 클릭 이벤트 바인딩 (Weglot-safe 네비게이션)
    grid.querySelectorAll('.gc-card[data-href]').forEach(function(card) {
      card.addEventListener('click', function(e) {
        // 내부 링크(카테고리, 원장) 클릭은 무시
        if (e.target.closest('a')) return;
        var href = card.getAttribute('data-href');
        if (href) window.location.href = href;
      });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var href = card.getAttribute('data-href');
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
