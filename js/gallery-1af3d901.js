/**
 * 서울비디치과 비포/애프터 갤러리 시스템 v9
 * - 비포사진 + 카테고리 + 제목 + 설명 + 원장 = 하나의 카드
 * - 임플란트: 환자 병력 태그 표시 + 병력별 서브필터 (필터 클릭 시 동적 생성)
 * - 글로우네이트: 시술 스타일 태그 표시 + 스타일별 서브필터 (필터 클릭 시 동적 생성)
 * - v9: 서브필터 강제 표시 + toggleSubFilters에서 build 호출 + 애니메이션
 */
(function() {
  'use strict';

  var cases = [];
  var currentFilter = 'all';
  var currentRegion = 'all';
  var currentStyle = 'all';     // 글로우네이트 스타일 서브필터
  var currentMedical = 'all';   // 임플란트 병력 서브필터
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

  // 카테고리별 아이콘
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

  // 병력 아이콘 맵
  var MEDICAL_ICONS = {
    '고혈압': 'fa-heartbeat', '당뇨': 'fa-tint', '골다공증': 'fa-bone',
    '심장질환': 'fa-heart', '혈액희석제': 'fa-pills', '비스포스포네이트': 'fa-capsules',
    '흡연': 'fa-smoking', '뼈이식': 'fa-teeth', '상악동거상': 'fa-lungs',
    '무치악': 'fa-tooth', '건강': 'fa-check-circle'
  };

  // 스타일 라벨 맵
  var STYLE_LABELS = {
    'white-pretty': { icon: '🤍', label: '하얗고 예쁘게' },
    'bright-pretty': { icon: '✨', label: '밝고 예쁘게' },
    'natural-pretty': { icon: '🌿', label: '자연스럽고 예쁘게' }
  };

  // 설명 텍스트 정리
  function cleanDesc(desc) {
    if (!desc) return '';
    var firstPara = desc.split(/\n\s*\n/)[0] || '';
    firstPara = firstPara.replace(/[✅❌⭐🔹🔸▶►●•]/g, '').replace(/^\d+\.\s*/gm, '').trim();
    firstPara = firstPara.replace(/\n/g, ' ').trim();
    if (firstPara.length > 80) firstPara = firstPara.substring(0, 80) + '…';
    return firstPara;
  }

  // ─── 카드 렌더링 v8: 병력 태그 + 스타일 태그 추가 ───
  function renderCard(c) {
    var catLabel = CATS[c.category] || c.category || '';
    var catSlugMap = { 'front-crown': 'crown' };
    var treatmentSlug = catSlugMap[c.category] || c.category;
    var hasIntraoral = c.hasIntraoral || (c.beforeImage && !c.beforeImage.includes('favicon'));
    var hasPano = c.hasPano || c.panBeforeImage || c.panAfterImage;
    var imgSrc = c.thumbnailImage || c.beforeImage || c.panBeforeImage || '';
    var hasAnyImage = c.hasAnyImage || !!imgSrc;
    var catIcon = CAT_ICONS[c.category] || 'fa-tooth';

    // 이미지 유형 뱃지
    var typeBadges = '';
    if (hasIntraoral) typeBadges += '<span class="gc-type-tag"><i class="fas fa-camera"></i> 구내</span>';
    if (hasPano) typeBadges += '<span class="gc-type-tag gc-type-pano"><i class="fas fa-x-ray"></i> 파노</span>';

    // 비포 사진 또는 예쁜 플레이스홀더
    var photoHtml;
    if (hasAnyImage && imgSrc) {
      photoHtml =
        '<div class="gc-photo">' +
          '<img src="' + imgSrc + '" alt="' + (c.title || 'Before') + '" class="gc-img" loading="lazy" ' +
            'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<div class="gc-ph" style="display:none"><i class="fas ' + catIcon + '"></i><span>사진 준비중</span></div>' +
          '<div class="gc-photo-badges">' +
            '<span class="gc-before-label">BEFORE</span>' +
            typeBadges +
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

    // 설명
    var desc = cleanDesc(c.description);
    var descHtml = desc ? '<p class="gc-desc">' + desc + '</p>' : '';

    // 담당 원장
    var doctorInitial = (c.doctorName || '?').charAt(0);
    var doctorHtml = c.doctorSlug
      ? '<a href="/doctors/' + c.doctorSlug + '" onclick="event.stopPropagation()" class="gc-doc-link">' + (c.doctorName || '') + '</a>'
      : '<span class="gc-doc-name">' + (c.doctorName || '') + '</span>';

    // 이미지 수
    var imgCount = 0;
    if (c.beforeImage) imgCount++;
    if (c.afterImage) imgCount++;
    if (c.panBeforeImage) imgCount++;
    if (c.panAfterImage) imgCount++;
    var imgCountHtml = imgCount > 0
      ? '<span class="gc-img-count"><i class="far fa-images"></i> ' + imgCount + '장</span>'
      : '';

    // 지역
    var regionHtml = c.region
      ? '<span class="gc-region"><i class="fas fa-map-marker-alt"></i> ' + c.region + '</span>'
      : '';

    // 환자 정보
    var patientHtml = '';
    if (c.patientAge || c.patientGender) {
      var genderText = c.patientGender === 'male' ? '남성' : c.patientGender === 'female' ? '여성' : '';
      var ageText = c.patientAge || '';
      var patientText = [ageText, genderText].filter(Boolean).join(' ');
      if (patientText) {
        patientHtml = '<span class="gc-patient"><i class="fas fa-user"></i> ' + patientText + '</span>';
      }
    }

    // ★ 임플란트 병력 태그
    var medicalHtml = '';
    if (c.category === 'implant' && c.medicalHistory && c.medicalHistory.length > 0) {
      var tags = c.medicalHistory.map(function(tag) {
        var icon = MEDICAL_ICONS[tag] || 'fa-notes-medical';
        return '<span class="gc-medical-tag"><i class="fas ' + icon + '"></i> ' + tag + '</span>';
      }).join('');
      medicalHtml = '<div class="gc-medical-tags">' + tags + '</div>';
    }

    // ★ 글로우네이트 스타일 태그
    var styleHtml = '';
    if (c.category === 'glownate' && c.laminateStyle && STYLE_LABELS[c.laminateStyle]) {
      var s = STYLE_LABELS[c.laminateStyle];
      styleHtml = '<span class="gc-style-tag ' + c.laminateStyle + '">' + s.icon + ' ' + s.label + '</span>';
    }

    return '<a href="/cases/' + c.id + '" class="gc-card" data-category="' + (filterGroupMap[c.category] || 'general') + '" data-region="' + (c.region || '') + '">' +
      photoHtml +
      '<div class="gc-content">' +
        '<div class="gc-tags">' + catHtml + styleHtml + periodHtml + imgCountHtml + regionHtml + patientHtml + '</div>' +
        '<h3 class="gc-title">' + (c.title || '') + '</h3>' +
        medicalHtml +
        descHtml +
        '<div class="gc-footer">' +
          '<div class="gc-doc">' +
            '<div class="gc-doc-avatar">' + doctorInitial + '</div>' +
            doctorHtml +
          '</div>' +
          '<span class="gc-more">자세히 보기 <i class="fas fa-arrow-right"></i></span>' +
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

    // ★ 글로우네이트 스타일 서브필터 적용
    if (filter === 'glownate' && currentStyle !== 'all') {
      filtered = filtered.filter(function(c) {
        return c.laminateStyle === currentStyle;
      });
    }

    // ★ 임플란트 병력 서브필터 적용
    if (filter === 'implant' && currentMedical !== 'all') {
      filtered = filtered.filter(function(c) {
        return c.medicalHistory && c.medicalHistory.indexOf(currentMedical) !== -1;
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
  }

  // 통계
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

  // ★ 글로우네이트 스타일 서브필터 동적 생성
  function buildGlownateSubFilter() {
    var wrap = document.querySelector('#glownateSubFilter .sub-filter-wrap');
    if (!wrap) return;

    var styleCounts = { 'white-pretty': 0, 'bright-pretty': 0, 'natural-pretty': 0 };
    var glownateTotal = 0;
    cases.forEach(function(c) {
      if ((filterGroupMap[c.category] || 'general') === 'glownate') {
        glownateTotal++;
        if (c.laminateStyle && styleCounts.hasOwnProperty(c.laminateStyle)) {
          styleCounts[c.laminateStyle]++;
        }
      }
    });

    var html = '<span class="sub-filter-label"><i class="fas fa-palette"></i> 시술 스타일</span>';
    html += '<button class="sub-chip active" data-style="all">전체 <span class="sub-count">' + glownateTotal + '</span></button>';
    html += '<button class="sub-chip" data-style="white-pretty"><span class="sub-chip-icon">' + STYLE_LABELS['white-pretty'].icon + '</span> ' + STYLE_LABELS['white-pretty'].label + ' <span class="sub-count">' + styleCounts['white-pretty'] + '</span></button>';
    html += '<button class="sub-chip" data-style="bright-pretty"><span class="sub-chip-icon">' + STYLE_LABELS['bright-pretty'].icon + '</span> ' + STYLE_LABELS['bright-pretty'].label + ' <span class="sub-count">' + styleCounts['bright-pretty'] + '</span></button>';
    html += '<button class="sub-chip" data-style="natural-pretty"><span class="sub-chip-icon">' + STYLE_LABELS['natural-pretty'].icon + '</span> ' + STYLE_LABELS['natural-pretty'].label + ' <span class="sub-count">' + styleCounts['natural-pretty'] + '</span></button>';

    wrap.innerHTML = html;

    // 이벤트 바인딩
    wrap.querySelectorAll('.sub-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        wrap.querySelectorAll('.sub-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentStyle = chip.getAttribute('data-style');
        renderGallery(currentFilter);
      });
    });
  }

  // ★ 임플란트 병력 서브필터 동적 생성
  function buildImplantSubFilter() {
    var wrap = document.querySelector('#implantSubFilter .sub-filter-wrap');
    if (!wrap) return;

    // 병력 카운트 수집
    var medCounts = {};
    cases.forEach(function(c) {
      if ((filterGroupMap[c.category] || 'general') === 'implant' && c.medicalHistory && c.medicalHistory.length > 0) {
        c.medicalHistory.forEach(function(tag) {
          medCounts[tag] = (medCounts[tag] || 0) + 1;
        });
      }
    });

    var tags = Object.keys(medCounts);

    // 카운트 내림차순 정렬
    tags.sort(function(a, b) { return medCounts[b] - medCounts[a]; });

    var implantTotal = cases.filter(function(c) { return (filterGroupMap[c.category] || 'general') === 'implant'; }).length;
    var html = '<span class="sub-filter-label"><i class="fas fa-notes-medical"></i> 환자 병력</span>';
    html += '<button class="sub-chip active" data-medical="all">전체 <span class="sub-count">' + implantTotal + '</span></button>';
    if (tags.length > 0) {
      tags.forEach(function(tag) {
        var icon = MEDICAL_ICONS[tag] || 'fa-notes-medical';
        html += '<button class="sub-chip" data-medical="' + tag + '"><i class="fas ' + icon + '"></i> ' + tag + ' <span class="sub-count">' + medCounts[tag] + '</span></button>';
      });
    }

    wrap.innerHTML = html;

    // 이벤트 바인딩
    wrap.querySelectorAll('.sub-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        wrap.querySelectorAll('.sub-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentMedical = chip.getAttribute('data-medical');
        renderGallery(currentFilter);
      });
    });
  }

  // ★ 서브필터 표시/숨기기 토글 — v9: build 함수 재호출 + 애니메이션
  function toggleSubFilters(filter) {
    var glownateFilter = document.getElementById('glownateSubFilter');
    var implantFilter = document.getElementById('implantSubFilter');

    if (glownateFilter) {
      if (filter === 'glownate') {
        // 서브필터 칩 리빌드 (최신 데이터 반영)
        buildGlownateSubFilter();
        glownateFilter.style.display = 'block';
        glownateFilter.style.opacity = '0';
        glownateFilter.style.transform = 'translateY(-8px)';
        setTimeout(function() {
          glownateFilter.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          glownateFilter.style.opacity = '1';
          glownateFilter.style.transform = 'translateY(0)';
        }, 10);
        console.log('[Gallery v9] 글로우네이트 스타일 서브필터 표시');
      } else {
        glownateFilter.style.display = 'none';
      }
    }
    if (implantFilter) {
      if (filter === 'implant') {
        // 서브필터 칩 리빌드 (최신 데이터 반영)
        buildImplantSubFilter();
        implantFilter.style.display = 'block';
        implantFilter.style.opacity = '0';
        implantFilter.style.transform = 'translateY(-8px)';
        setTimeout(function() {
          implantFilter.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          implantFilter.style.opacity = '1';
          implantFilter.style.transform = 'translateY(0)';
        }, 10);
        console.log('[Gallery v9] 임플란트 병력 서브필터 표시');
      } else {
        implantFilter.style.display = 'none';
      }
    }

    // 필터 변경 시 서브필터 리셋
    if (filter !== 'glownate') currentStyle = 'all';
    if (filter !== 'implant') currentMedical = 'all';
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
      html += '<button class="region-more-btn" id="regionMoreBtn" onclick="document.getElementById(\'regionExtraChips\').classList.toggle(\'open\');this.textContent=this.textContent.includes(\'+\')?\'접기\':\'+ ' + extraChips.length + '개 더보기\'">+ ' + extraChips.length + '개 더보기</button>';
      html += '<div class="region-extra-chips" id="regionExtraChips">';
      extraChips.forEach(function(r) {
        html += '<button class="region-chip" data-region="' + r + '">' + r + '<span class="chip-count">' + regionCount[r] + '</span></button>';
      });
      html += '</div>';
    }

    wrap.innerHTML = html;

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
    buildGlownateSubFilter();
    buildImplantSubFilter();
    buildRegionFilter();
    renderGallery('all');

    console.log('[Gallery v9] 로드 완료 — 케이스: ' + cases.length + ' | 서브필터 빌드 완료');

    // 메인 카테고리 필터 버튼
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        toggleSubFilters(currentFilter);
        renderGallery(currentFilter);
      });
    });
  });
})();
