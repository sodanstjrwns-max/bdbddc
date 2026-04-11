/**
 * 서울비디치과 비포/애프터 갤러리 시스템
 * - R2 API 연동 (동적 데이터)
 * - 카테고리 필터링 (24개 진료 카테고리 대응)
 * - 로그인 여부에 따른 잠금/열림 표시
 * - 반응형 카드 레이아웃
 */
(function() {
  'use strict';

  var cases = [];
  var currentFilter = 'all';
  var isLoggedIn = false;

  // 카테고리 → 필터 그룹 매핑 (admin 업로드 카테고리와 일치)
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
    'sedation': 'general', 'prevention': 'general',  // sedation도 일반치료 그룹 'tmj': 'general', 'bruxism': 'general', 'emergency': 'general',
    'scaling': 'gum', 'gum': 'gum', 'periodontitis': 'gum', 'gum-surgery': 'gum',
    'wisdom-tooth': 'gum', 'apicoectomy': 'gum'
  };

  // 카테고리 한글 라벨
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

  // 이미지 유무 확인 (API가 hasIntraoral, hasPano, hasAnyImage 플래그 제공)
  function getImgCount(c) {
    var cnt = 0;
    if (c.hasIntraoral || (c.beforeImage && !c.beforeImage.includes('favicon'))) cnt++;
    if (c.afterImage) cnt++;
    if (c.hasPano || c.panBeforeImage) cnt++;
    if (c.panAfterImage) cnt++;
    return cnt;
  }

  // 카드 렌더링 — v6: 사진+정보 완전 통합 카드 (하나의 카드 안에 전부)
  function renderCard(c) {
    var catLabel = CATS[c.category] || c.category || '';
    var catSlugMap = { 'front-crown': 'crown' };
    var treatmentSlug = catSlugMap[c.category] || c.category;
    var hasIntraoral = c.hasIntraoral || (c.beforeImage && !c.beforeImage.includes('favicon'));
    var hasPano = c.hasPano || c.panBeforeImage || c.panAfterImage;
    var imgSrc = c.thumbnailImage || c.beforeImage || c.panBeforeImage || '';
    var hasAnyImage = c.hasAnyImage || !!imgSrc;

    // 이미지 유형 뱃지
    var typeBadges = '';
    if (hasIntraoral) typeBadges += '<span class="gc-badge gc-badge-intra"><i class="fas fa-camera"></i> 구내</span>';
    if (hasPano) typeBadges += '<span class="gc-badge gc-badge-pano"><i class="fas fa-x-ray"></i> 파노</span>';

    // 이미지
    var imgTag;
    if (hasAnyImage && imgSrc) {
      imgTag = '<img src="' + imgSrc + '" alt="' + (c.title || 'Before/After') + '" class="gc-img" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
               '<div class="gc-img-placeholder" style="display:none"><i class="fas fa-teeth"></i></div>';
    } else {
      imgTag = '<div class="gc-img-placeholder"><i class="fas fa-teeth"></i></div>';
    }

    // 카테고리
    var catHtml = c.category
      ? '<a href="/treatments/' + treatmentSlug + '" onclick="event.stopPropagation()" class="gc-cat">' + catLabel + '</a>'
      : '<span class="gc-cat">' + catLabel + '</span>';

    // 기간
    var periodHtml = c.treatmentPeriod
      ? '<span class="gc-period"><i class="fas fa-clock"></i> ' + c.treatmentPeriod + '</span>'
      : '';

    // 의사
    var doctorInitial = (c.doctorName || '?').charAt(0);
    var doctorHtml = c.doctorSlug
      ? '<a href="/doctors/' + c.doctorSlug + '" onclick="event.stopPropagation()" class="gc-doctor-link">' + (c.doctorName || '') + '</a>'
      : '<span class="gc-doctor-name">' + (c.doctorName || '') + '</span>';

    // ─── 하나의 통합 카드: 사진 + 모든 정보가 한 박스 안에 ───
    return '<a href="/cases/' + c.id + '" class="gc-card" data-category="' + (filterGroupMap[c.category] || 'general') + '">' +
      '<div class="gc-visual">' +
        imgTag +
        '<div class="gc-overlay">' +
          '<div class="gc-overlay-top">' +
            '<div class="gc-ba-badges">' +
              '<span class="gc-badge gc-badge-before">BEFORE</span>' +
              '<span class="gc-badge gc-badge-after">AFTER</span>' +
            '</div>' +
            (typeBadges ? '<div class="gc-type-badges">' + typeBadges + '</div>' : '') +
          '</div>' +
          '<div class="gc-overlay-bottom">' +
            '<div class="gc-info-row">' + catHtml + periodHtml + '</div>' +
            '<h3 class="gc-title">' + (c.title || '') + '</h3>' +
            '<div class="gc-doctor">' +
              '<div class="gc-doctor-avatar">' + doctorInitial + '</div>' +
              doctorHtml +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</a>';
  }

  // 갤러리 렌더링
  function renderGallery(filter) {
    var grid = document.getElementById('galleryGrid');
    var loading = document.getElementById('loadingState');
    var empty = document.getElementById('emptyState');
    if (!grid) return;

    // 최신 케이스가 위로 (createdAt 내림차순)
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
  }

  // 통계 업데이트
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

  // R2에서 케이스 로드
  async function loadCasesFromAPI() {
    try {
      var res = await fetch('/api/cases');
      if (res.ok) {
        cases = await res.json();
      }
    } catch(e) {
      console.warn('케이스 로드 실패:', e);
      cases = [];
    }
  }

  // 로그인 상태 확인 (gnb.js의 전역 상태도 활용)
  async function checkAuth() {
    try {
      // gnb.js가 이미 /api/auth/me를 호출했으면 그 결과를 쓴다
      if (window.__bdAuth && window.__bdAuth.loggedIn) {
        isLoggedIn = true;
        return;
      }
      var res = await fetch('/api/auth/me');
      var data = await res.json();
      isLoggedIn = data.loggedIn || false;
    } catch(e) {
      isLoggedIn = false;
    }
  }

  // 초기화
  document.addEventListener('DOMContentLoaded', async function() {
    // 병렬 로드
    await Promise.all([loadCasesFromAPI(), checkAuth()]);

    updateStats();
    renderGallery('all');

    // 필터 버튼 바인딩
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderGallery(currentFilter);
      });
    });

    // 헤더 로그인 상태 업데이트는 gnb.js의 initAuthSync()가 담당
  });
})();
