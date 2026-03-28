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

  // 카테고리 → 필터 그룹 매핑 (24개 → 6개 그룹)
  var filterGroupMap = {
    'implant': 'implant',
    'invisalign': 'orthodontic', 'pediatric': 'orthodontic',
    'aesthetic': 'aesthetic', 'glownate': 'aesthetic',
    'cavity': 'general', 'resin': 'general', 'crown': 'general', 'inlay': 'general',
    'root-canal': 'general', 're-root-canal': 'general', 'bridge': 'general', 'denture': 'general',
    'whitening': 'whitening',
    'scaling': 'gum', 'gum': 'gum', 'periodontitis': 'gum', 'gum-surgery': 'gum',
    'wisdom-tooth': 'gum', 'apicoectomy': 'gum',
    'prevention': 'general', 'tmj': 'general', 'bruxism': 'general', 'emergency': 'general'
  };

  // 카테고리 한글 라벨
  var CATS = {
    implant:'임플란트', invisalign:'교정(인비절라인)', pediatric:'소아치과',
    aesthetic:'심미치료', glownate:'글로우네이트', cavity:'충치치료',
    resin:'레진치료', crown:'크라운', inlay:'인레이/온레이',
    'root-canal':'신경치료', 're-root-canal':'재신경치료',
    whitening:'미백', bridge:'브릿지', denture:'틀니',
    scaling:'스케일링', gum:'잇몸치료', periodontitis:'치주염',
    'gum-surgery':'잇몸수술', 'wisdom-tooth':'사랑니발치',
    apicoectomy:'치근단절제술', prevention:'예방치료',
    tmj:'턱관절(TMJ)', bruxism:'이갈이/브럭시즘', emergency:'응급치료'
  };

  // 카드 렌더링
  function renderCard(c) {
    var catLabel = CATS[c.category] || c.category || '';
    var hasImage = c.beforeImage && !c.beforeImage.includes('favicon');
    var imgSrc = hasImage ? c.beforeImage : '';

    var imageHtml;
    if (hasImage) {
      imageHtml = '<div style="position:relative;height:220px;overflow:hidden;background:#f0ebe4">' +
        '<img src="' + imgSrc + '" alt="Before" style="width:100%;height:100%;object-fit:cover;' + (isLoggedIn ? '' : 'filter:blur(10px) brightness(0.8);') + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div style=\\\'display:flex;height:100%;align-items:center;justify-content:center;color:#ccc;font-size:3rem\\\"><i class=\\\'fas fa-teeth\\\'></i></div>\'">' +
        '<div style="position:absolute;top:12px;left:12px;padding:4px 12px;background:rgba(0,0,0,0.6);color:white;border-radius:20px;font-size:0.7rem;font-weight:600;z-index:2">BEFORE</div>' +
        '<div style="position:absolute;top:12px;right:12px;padding:4px 12px;background:rgba(107,66,38,0.85);color:white;border-radius:20px;font-size:0.7rem;font-weight:600;z-index:2">AFTER</div>' +
        (isLoggedIn ? '' : '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3;"><i class="fas fa-lock" style="font-size:2rem;color:rgba(255,255,255,0.9);margin-bottom:8px;text-shadow:0 2px 8px rgba(0,0,0,0.3)"></i><span style="color:#fff;font-size:0.8rem;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.5)">로그인 후 확인</span></div>') +
        '</div>';
    } else {
      imageHtml = '<div style="height:180px;background:linear-gradient(135deg,#f5f0eb,#e8dfd6);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#c9a96e">' +
        '<i class="fas fa-teeth" style="font-size:3rem;margin-bottom:8px;opacity:0.5"></i>' +
        '<span style="font-size:0.8rem;color:#999">사진 준비 중</span>' +
        '</div>';
    }

    return '<a href="/cases/' + c.id + '" class="gallery-card" data-category="' + (filterGroupMap[c.category] || 'general') + '" style="display:block;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #f0f0f0;transition:transform 0.2s,box-shadow 0.2s;text-decoration:none;color:inherit" onmouseover="this.style.transform=\'translateY(-4px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,0.1)\'" onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'0 2px 12px rgba(0,0,0,0.06)\'">' +
      imageHtml +
      '<div style="padding:16px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
          '<span style="display:inline-block;padding:3px 10px;background:#6B4226;color:white;border-radius:20px;font-size:0.7rem;font-weight:600">' + catLabel + '</span>' +
          (c.treatmentPeriod ? '<span style="font-size:0.72rem;color:#999"><i class="fas fa-clock" style="margin-right:3px"></i>' + c.treatmentPeriod + '</span>' : '') +
        '</div>' +
        '<h3 style="font-size:1rem;font-weight:700;margin-bottom:6px;color:#1a1a2e">' + (c.title || '') + '</h3>' +
        '<div style="display:flex;align-items:center;gap:8px;padding-top:10px;border-top:1px solid #f0f0f0">' +
          '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6B4226,#a0714f);display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:700">' + ((c.doctorName || '?').charAt(0)) + '</div>' +
          '<span style="font-size:0.82rem;font-weight:600;color:#333">' + (c.doctorName || '') + '</span>' +
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

    // 이미지 없는 케이스 필터링 (beforeImage가 없거나 favicon인 경우 맨 뒤로)
    var sorted = cases.slice().sort(function(a, b) {
      var aHas = a.beforeImage && !a.beforeImage.includes('favicon') ? 1 : 0;
      var bHas = b.beforeImage && !b.beforeImage.includes('favicon') ? 1 : 0;
      return bHas - aHas;
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
    var counts = { all: cases.length, implant: 0, orthodontic: 0, aesthetic: 0, whitening: 0, gum: 0, general: 0 };
    cases.forEach(function(c) {
      var group = filterGroupMap[c.category] || 'general';
      counts[group] = (counts[group] || 0) + 1;
    });

    var ids = { all: 'countAll', implant: 'countImplant', orthodontic: 'countOrthodontic', aesthetic: 'countAesthetic', whitening: 'countWhitening', gum: 'countGum' };
    Object.keys(ids).forEach(function(k) {
      var el = document.getElementById(ids[k]);
      if (el) el.textContent = counts[k] || 0;
    });

    if (document.getElementById('statTotal')) document.getElementById('statTotal').textContent = cases.length;
    if (document.getElementById('statImplant')) document.getElementById('statImplant').textContent = counts.implant;
    if (document.getElementById('statOrthodontic')) document.getElementById('statOrthodontic').textContent = counts.orthodontic;
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

  // 로그인 상태 확인
  async function checkAuth() {
    try {
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

    // 로그인 상태에 따라 헤더 업데이트
    if (isLoggedIn) {
      try {
        var res = await fetch('/api/auth/me');
        var data = await res.json();
        if (data.loggedIn && data.user) {
          document.querySelectorAll('.auth-buttons').forEach(function(el) {
            el.innerHTML = '<a href="/auth/mypage" class="btn-auth btn-login"><i class="fas fa-user"></i> ' + data.user.name + '님</a>' +
              '<a href="javascript:void(0)" class="btn-auth btn-register" onclick="(async function(){await fetch(\'/api/auth/logout\',{method:\'POST\'});location.reload()})()"><i class="fas fa-sign-out-alt"></i> 로그아웃</a>';
          });
          document.querySelectorAll('.mobile-auth-buttons').forEach(function(el) {
            el.innerHTML = '<a href="/auth/mypage" class="btn-auth"><i class="fas fa-user"></i> ' + data.user.name + '님</a>' +
              '<a href="javascript:void(0)" class="btn-auth" onclick="(async function(){await fetch(\'/api/auth/logout\',{method:\'POST\'});location.reload()})()"><i class="fas fa-sign-out-alt"></i> 로그아웃</a>';
          });
        }
      } catch(e) {}
    }
  });
})();
