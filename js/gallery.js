/**
 * 서울비디치과 비포/애프터 갤러리 시스템
 * - 카테고리 필터링
 * - 비포/애프터 슬라이더
 * - 담당 원장 연결
 * - 케이스 상세 모달
 */
(function() {
  'use strict';

  // ─── 샘플 케이스 데이터 (실제 사진 추가 시 imageBefore/imageAfter 교체) ───
  var cases = [
    {
      id: 1, category: 'implant', title: '상악 전치부 임플란트',
      description: '50대 남성, 상악 전치부 4본 임플란트 식립. 자연치아와 구분이 어려운 심미적 결과를 달성했습니다.',
      doctor: 'moon', doctorName: '문석준 원장', period: '4개월',
      tags: ['임플란트', '전치부', '심미'],
      difficulty: '상', age: '50대', gender: '남성'
    },
    {
      id: 2, category: 'implant', title: '하악 구치부 임플란트',
      description: '60대 여성, 하악 구치부 2본 임플란트. 충분한 골이식 후 안정적인 임플란트를 식립했습니다.',
      doctor: 'kim', doctorName: '김대현 원장', period: '5개월',
      tags: ['임플란트', '구치부', '골이식'],
      difficulty: '중', age: '60대', gender: '여성'
    },
    {
      id: 3, category: 'implant', title: '전악 임플란트 재건',
      description: '55대 남성, 상·하악 전악 임플란트. All-on-4 컨셉으로 최소 임플란트로 최대 효과를 달성했습니다.',
      doctor: 'moon', doctorName: '문석준 원장', period: '8개월',
      tags: ['임플란트', '전악', 'All-on-4'],
      difficulty: '최상', age: '55세', gender: '남성'
    },
    {
      id: 4, category: 'orthodontic', title: '인비절라인 교정',
      description: '25세 여성, 상·하악 총생(덧니) 교정. 인비절라인 투명교정으로 발치 없이 배열을 완료했습니다.',
      doctor: 'hyun', doctorName: '현정수 원장', period: '14개월',
      tags: ['교정', '인비절라인', '비발치'],
      difficulty: '중', age: '20대', gender: '여성'
    },
    {
      id: 5, category: 'orthodontic', title: '성인 교정 (돌출입 개선)',
      description: '30대 여성, 상악 돌출입 교정. 소구치 발치 후 인비절라인으로 돌출입을 개선했습니다.',
      doctor: 'hyun', doctorName: '현정수 원장', period: '18개월',
      tags: ['교정', '돌출입', '발치교정'],
      difficulty: '상', age: '30대', gender: '여성'
    },
    {
      id: 6, category: 'aesthetic', title: '글로우네이트 8본',
      description: '35세 여성, 상악 전치부 8본 글로우네이트. 최소 삭제로 자연스러운 미소라인을 완성했습니다.',
      doctor: 'moon', doctorName: '문석준 원장', period: '2주',
      tags: ['글로우네이트', '심미', '라미네이트'],
      difficulty: '중', age: '30대', gender: '여성'
    },
    {
      id: 7, category: 'aesthetic', title: '올세라믹 크라운',
      description: '40대 남성, 전치부 변색 치아 4본 올세라믹 크라운으로 심미적 회복을 완료했습니다.',
      doctor: 'choi', doctorName: '최영준 원장', period: '3주',
      tags: ['크라운', '심미', '올세라믹'],
      difficulty: '중', age: '40대', gender: '남성'
    },
    {
      id: 8, category: 'whitening', title: '전문가 미백',
      description: '28세 여성, ZOOM 전문가 미백 + 홈 미백 병행. 3단계 이상의 미백 효과를 달성했습니다.',
      doctor: 'lee', doctorName: '이승현 원장', period: '3주',
      tags: ['미백', 'ZOOM', '심미'],
      difficulty: '하', age: '20대', gender: '여성'
    },
    {
      id: 9, category: 'gum', title: '잇몸 성형 + 미백',
      description: '32세 여성, 거미스마일(잇몸 과노출) 개선을 위한 잇몸 성형 후 미백을 진행했습니다.',
      doctor: 'park', doctorName: '박정환 원장', period: '1개월',
      tags: ['잇몸성형', '거미스마일', '심미'],
      difficulty: '중', age: '30대', gender: '여성'
    },
    {
      id: 10, category: 'implant', title: '상악동 거상 + 임플란트',
      description: '58세 남성, 상악 구치부 골량 부족으로 상악동 거상술 후 임플란트를 식립했습니다.',
      doctor: 'moon', doctorName: '문석준 원장', period: '7개월',
      tags: ['임플란트', '상악동거상', '골이식'],
      difficulty: '최상', age: '50대', gender: '남성'
    },
    {
      id: 11, category: 'aesthetic', title: '레진 다이렉트 본딩',
      description: '22세 여성, 전치부 벌어진 틈(이개) 레진 직접수복으로 자연스럽게 마감했습니다.',
      doctor: 'kang', doctorName: '강민정 원장', period: '1일',
      tags: ['레진', '심미', '이개'],
      difficulty: '하', age: '20대', gender: '여성'
    },
    {
      id: 12, category: 'gum', title: '치주 재생 수술',
      description: '48세 남성, 심한 치주염으로 인한 골소실 부위에 골이식 + 차폐막을 이용한 재생수술을 시행했습니다.',
      doctor: 'park', doctorName: '박정환 원장', period: '6개월',
      tags: ['잇몸', '치주재생', '골이식'],
      difficulty: '상', age: '40대', gender: '남성'
    }
  ];

  // ─── 의사 프로필 매핑 ───
  var doctorProfiles = {
    'moon': { name: '문석준', role: '대표원장', specialty: '임플란트·심미', url: '/doctors/moon.html' },
    'kim': { name: '김대현', role: '원장', specialty: '임플란트·보철', url: '/doctors/kim.html' },
    'hyun': { name: '현정수', role: '원장', specialty: '치아교정', url: '/doctors/hyun.html' },
    'choi': { name: '최영준', role: '원장', specialty: '보존·심미', url: '/doctors/choi.html' },
    'lee': { name: '이승현', role: '원장', specialty: '보존·미백', url: '/doctors/lee.html' },
    'park': { name: '박정환', role: '원장', specialty: '치주·잇몸', url: '/doctors/park.html' },
    'kang': { name: '강민정', role: '원장', specialty: '심미·보존', url: '/doctors/kang.html' },
    'jo': { name: '조현우', role: '원장', specialty: '구강외과', url: '/doctors/jo.html' },
    'seo': { name: '서영민', role: '원장', specialty: '소아치과', url: '/doctors/seo.html' },
    'lim': { name: '임수진', role: '원장', specialty: '소아치과', url: '/doctors/lim.html' }
  };

  // ─── 카테고리 라벨 ───
  var categoryLabels = {
    'implant': '임플란트',
    'orthodontic': '교정',
    'aesthetic': '심미치료',
    'whitening': '미백',
    'gum': '잇몸치료'
  };

  var currentFilter = 'all';

  // ─── 카드 렌더링 ───
  function renderCard(c) {
    var doc = doctorProfiles[c.doctor] || {};
    var catLabel = categoryLabels[c.category] || c.category;
    var diffColor = c.difficulty === '최상' ? '#dc2626' : c.difficulty === '상' ? '#f59e0b' : c.difficulty === '중' ? '#3b82f6' : '#22c55e';

    var tagsHtml = '';
    (c.tags || []).forEach(function(t) {
      tagsHtml += '<span style="display:inline-block;padding:3px 10px;background:#f3f4f6;border-radius:20px;font-size:0.75rem;color:#555">' + t + '</span>';
    });

    return '<div class="gallery-card" data-category="' + c.category + '" data-id="' + c.id + '" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #f0f0f0;transition:transform 0.2s,box-shadow 0.2s;cursor:pointer" onmouseover="this.style.transform=\'translateY(-4px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,0.1)\'" onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'0 2px 12px rgba(0,0,0,0.06)\'">' +
      
      /* 비포/애프터 슬라이더 영역 */
      '<div class="ba-slider" style="position:relative;height:220px;background:#f8f8f8;overflow:hidden;user-select:none" data-case-id="' + c.id + '">' +
        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:3rem"><i class="fas fa-teeth"></i></div>' +
        '<div class="ba-label-before" style="position:absolute;top:12px;left:12px;padding:4px 12px;background:rgba(0,0,0,0.6);color:white;border-radius:20px;font-size:0.7rem;font-weight:600;z-index:2">BEFORE</div>' +
        '<div class="ba-label-after" style="position:absolute;top:12px;right:12px;padding:4px 12px;background:rgba(107,66,38,0.85);color:white;border-radius:20px;font-size:0.7rem;font-weight:600;z-index:2">AFTER</div>' +
        '<div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);padding:6px 16px;background:rgba(0,0,0,0.5);color:white;border-radius:20px;font-size:0.7rem;z-index:2"><i class="fas fa-camera"></i> 사진 준비 중</div>' +
      '</div>' +

      /* 카드 정보 */
      '<div style="padding:16px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
          '<span style="display:inline-block;padding:3px 10px;background:var(--brand,#6B4226);color:white;border-radius:20px;font-size:0.7rem;font-weight:600">' + catLabel + '</span>' +
          '<span style="display:inline-block;padding:3px 10px;border:1px solid ' + diffColor + ';color:' + diffColor + ';border-radius:20px;font-size:0.7rem;font-weight:600">난이도 ' + c.difficulty + '</span>' +
        '</div>' +
        '<h3 style="font-size:1rem;font-weight:700;margin-bottom:6px;color:#1a1a2e">' + c.title + '</h3>' +
        '<p style="font-size:0.82rem;color:#666;line-height:1.5;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + c.description + '</p>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' + tagsHtml + '</div>' +
        
        /* 담당 원장 */
        '<div style="display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid #f0f0f0">' +
          '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6B4226,#a0714f);display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">' + (doc.name ? doc.name.charAt(0) : '?') + '</div>' +
          '<div>' +
            '<a href="' + (doc.url || '#') + '" style="font-size:0.82rem;font-weight:600;color:#1a1a2e;text-decoration:none" onclick="event.stopPropagation()">' + c.doctorName + '</a>' +
            '<div style="font-size:0.72rem;color:#999">' + (doc.specialty || '') + ' · ' + c.period + '</div>' +
          '</div>' +
          '<div style="margin-left:auto;font-size:0.75rem;color:#999"><i class="fas fa-user"></i> ' + (c.age || '') + ' ' + (c.gender || '') + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ─── 갤러리 렌더링 ───
  function renderGallery(filter) {
    var grid = document.getElementById('galleryGrid');
    var loading = document.getElementById('loadingState');
    var empty = document.getElementById('emptyState');
    if (!grid) return;

    var filtered = filter === 'all' ? cases : cases.filter(function(c) { return c.category === filter; });
    
    if (loading) loading.style.display = 'none';
    
    if (filtered.length === 0) {
      grid.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    grid.style.gap = '20px';

    var html = '';
    filtered.forEach(function(c) { html += renderCard(c); });
    grid.innerHTML = html;

    // 카드 클릭 → 모달
    grid.querySelectorAll('.gallery-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var id = parseInt(card.getAttribute('data-id'));
        openModal(id);
      });
    });
  }

  // ─── 통계 업데이트 ───
  function updateStats() {
    var counts = { all: cases.length, implant: 0, orthodontic: 0, aesthetic: 0, whitening: 0, gum: 0 };
    cases.forEach(function(c) { counts[c.category] = (counts[c.category] || 0) + 1; });
    
    var ids = { all: 'countAll', implant: 'countImplant', orthodontic: 'countOrthodontic', aesthetic: 'countAesthetic', whitening: 'countWhitening', gum: 'countGum' };
    Object.keys(ids).forEach(function(k) {
      var el = document.getElementById(ids[k]);
      if (el) el.textContent = counts[k] || 0;
    });

    var statEl = { total: 'statTotal', implant: 'statImplant', orthodontic: 'statOrthodontic', aesthetic: 'statAesthetic' };
    if (document.getElementById('statTotal')) document.getElementById('statTotal').textContent = cases.length;
    if (document.getElementById('statImplant')) document.getElementById('statImplant').textContent = counts.implant;
    if (document.getElementById('statOrthodontic')) document.getElementById('statOrthodontic').textContent = counts.orthodontic;
    if (document.getElementById('statAesthetic')) document.getElementById('statAesthetic').textContent = counts.aesthetic;
  }

  // ─── 모달 열기 ───
  function openModal(id) {
    var c = cases.find(function(x) { return x.id === id; });
    if (!c) return;
    var doc = doctorProfiles[c.doctor] || {};
    var modal = document.getElementById('imageModal');
    if (!modal) return;

    document.getElementById('modalTitle').textContent = c.title;
    document.getElementById('modalDescription').textContent = c.description;
    document.getElementById('modalPeriod').textContent = '치료 기간: ' + c.period;
    document.getElementById('modalDoctor').innerHTML = '<a href="' + (doc.url || '#') + '" style="color:var(--brand,#6B4226);text-decoration:none;font-weight:600">' + c.doctorName + '</a> (' + (doc.specialty || '') + ')';

    var imgGrid = document.getElementById('modalImageGrid');
    if (imgGrid) {
      imgGrid.innerHTML = '<div style="display:flex;height:300px">' +
        '<div style="flex:1;background:#f0f0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:2px solid white">' +
          '<i class="fas fa-teeth" style="font-size:3rem;color:#ddd;margin-bottom:8px"></i>' +
          '<span style="font-size:0.85rem;font-weight:600;color:#999">BEFORE</span>' +
          '<span style="font-size:0.75rem;color:#bbb;margin-top:4px">사진 준비 중</span>' +
        '</div>' +
        '<div style="flex:1;background:#faf5f0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
          '<i class="fas fa-teeth" style="font-size:3rem;color:#d4a574;margin-bottom:8px"></i>' +
          '<span style="font-size:0.85rem;font-weight:600;color:#6B4226">AFTER</span>' +
          '<span style="font-size:0.75rem;color:#a0714f;margin-top:4px">사진 준비 중</span>' +
        '</div>' +
      '</div>';
    }

    modal.classList.add('active');
    
    // Analytics
    if (window.bdAnalytics) {
      bdAnalytics.trackCTA('gallery_case_view', c.category + '_' + c.title);
    }
  }

  // ─── 초기화 ───
  document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    renderGallery('all');

    // 필터 버튼 바인딩
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderGallery(currentFilter);

        if (window.bdAnalytics) {
          bdAnalytics.trackCTA('gallery_filter', currentFilter);
        }
      });
    });
  });

})();
