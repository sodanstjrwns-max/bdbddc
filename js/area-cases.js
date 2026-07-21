/**
 * 지역 페이지 Before/After 케이스 카드 자동 삽입 (v5.18s)
 * area/{loc}.html 및 area/{loc}-{implant|invisalign|laminate}.html 에서 로드.
 * - 해당 지역에서 내원한 환자 케이스를 우선 노출 (region 필드 매칭)
 * - 부족하면 같은 시술군 최신 케이스로 보충 (각 카드에 실제 지역 배지 표기 — 정직성 유지)
 * - 비로그인 클릭 시 로그인 안내 모달 (기존 treatment-cases.js와 동일 UX)
 */
(function() {
  'use strict';

  // ── URL에서 지역 slug / 시술 추출 ──
  var path = window.location.pathname.replace(/\/$/, '').replace(/\.html$/, '');
  var parts = path.split('/');
  if (parts[parts.length - 2] !== 'area' && parts[parts.length - 2] !== '') {
    // /area/xxx 형태만 처리
  }
  var slug = parts[parts.length - 1];
  if (!slug) return;

  var SERVICES = { implant: '임플란트', invisalign: '인비절라인', laminate: '라미네이트(글로우네이트)' };
  var svc = '';
  var locSlug = slug;
  var m = slug.match(/^(.+)-(implant|invisalign|laminate)$/);
  if (m) { locSlug = m[1]; svc = m[2]; }

  var LOC_NAMES = {
    anseong: '안성', asan: '아산', boryeong: '보령', buldang: '불당동', buyeo: '부여',
    cheonan: '천안', cheongju: '청주', cheongyang: '청양', chungju: '충주', daejeon: '대전',
    dangjin: '당진', eumseong: '음성', geumsan: '금산', gongju: '공주', gyeryong: '계룡',
    hongseong: '홍성', jincheon: '진천', nonsan: '논산', okcheon: '옥천', osan: '오산',
    pyeongtaek: '평택', sejong: '세종', seocheon: '서천', seosan: '서산', taean: '태안',
    yeongdong: '영동', yeongi: '연기', yesan: '예산'
  };
  var locName = LOC_NAMES[locSlug];
  if (!locName) return;

  // region 매칭용 지역명 (불당동은 천안 소속)
  var matchName = locSlug === 'buldang' ? '천안' : locName;

  // 시술군 → 케이스 카테고리 매핑
  var CAT_GROUPS = {
    implant: ['implant'],
    invisalign: ['invisalign', 'orthodontics'],
    laminate: ['glownate', 'aesthetic', 'front-crown', 'whitening']
  };

  var MAX_CARDS = 6;

  fetch('/api/cases')
    .then(function(r) { return r.json(); })
    .then(function(cases) {
      if (!cases || !cases.length) return;

      // 시술군 필터 (콤보 페이지) / 전체 (메인 지역 페이지)
      var pool = cases;
      if (svc) {
        var okCats = CAT_GROUPS[svc];
        pool = cases.filter(function(c) { return okCats.indexOf(c.category) !== -1; });
      }
      // 이미지 있는 케이스만
      pool = pool.filter(function(c) { return !!c.beforeImage; });
      if (!pool.length) return;

      // 지역 케이스 우선, 나머지는 최신순 보충
      var regional = pool.filter(function(c) { return (c.region || '').indexOf(matchName) !== -1; });
      var others = pool.filter(function(c) { return (c.region || '').indexOf(matchName) === -1; });
      var picked = regional.slice(0, MAX_CARDS);
      if (picked.length < MAX_CARDS) {
        picked = picked.concat(others.slice(0, MAX_CARDS - picked.length));
      }
      if (!picked.length) return;

      insertSection(picked, regional.length);
    })
    .catch(function(e) { console.warn('지역 케이스 로드 실패:', e); });

  function insertSection(picked, regionalCount) {
    // 삽입 위치: FAQ 섹션 앞 (aria-label에 '질문' 포함) → 폴백: 미백 프로모 → 마지막 섹션
    var anchor = null;
    var sections = document.querySelectorAll('section[aria-label]');
    for (var i = 0; i < sections.length; i++) {
      var al = sections[i].getAttribute('aria-label') || '';
      if (al.indexOf('질문') !== -1) { anchor = sections[i]; break; }
    }
    if (!anchor) anchor = document.getElementById('whitening-promo');
    if (!anchor) {
      var all = document.querySelectorAll('main > section, body > section');
      if (all.length > 1) anchor = all[all.length - 1];
    }
    if (!anchor) return;

    var svcLabel = svc ? SERVICES[svc] : '';
    var title, sub;
    if (regionalCount > 0) {
      title = locName + ' 환자분들의 <span style="color:#6B4226;">Before/After</span>';
      sub = '실제로 ' + locName + '에서 내원하신 환자분들의 치료 전후 기록입니다' + (regionalCount > MAX_CARDS ? ' (' + regionalCount + '건 중 일부)' : '');
    } else {
      title = (svcLabel || '서울비디치과') + ' <span style="color:#6B4226;">Before/After</span>';
      sub = '서울비디치과의 실제 ' + (svcLabel ? svcLabel + ' ' : '') + '치료 전후 기록입니다 (카드의 지역 표기는 각 환자분의 실제 내원 지역)';
    }

    var cardHtml = '';
    for (var i = 0; i < picked.length; i++) {
      var cs = picked[i];
      var isLocal = (cs.region || '').indexOf(matchName) !== -1;
      var regionBadge = cs.region
        ? '<span style="font-size:.68rem;padding:3px 9px;border-radius:20px;font-weight:600;' +
          (isLocal
            ? 'background:#6B4226;color:#fff;'
            : 'background:rgba(255,255,255,.85);color:#6B4226;border:1px solid rgba(107,66,38,.2);') +
          '"><i class="fas fa-map-marker-alt" style="margin-right:3px;font-size:.6rem;"></i>' + cs.region.split(',')[0] + '</span>'
        : '';

      cardHtml += '<div class="area-case-card" data-case-href="/cases/' + (cs.slug || cs.id) + '" role="link" tabindex="0" style="background:#fff;border:1px solid #e8e0d8;border-radius:16px;overflow:hidden;color:#333;transition:all .3s;box-shadow:0 2px 8px rgba(107,66,38,0.06);cursor:pointer;">' +
        '<div style="position:relative;aspect-ratio:4/3;overflow:hidden;background:#f0ebe4;">' +
          '<img src="' + cs.beforeImage + '" alt="' + (cs.title || 'Before/After') + ' — 치료 전" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">' +
          '<div style="position:absolute;top:10px;left:10px;display:flex;gap:6px;">' + regionBadge + '</div>' +
          '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.6));padding:12px 14px;">' +
            '<span style="font-size:.7rem;background:rgba(255,255,255,.2);backdrop-filter:blur(4px);padding:3px 8px;border-radius:20px;color:#fff;"><i class="fas fa-images" style="margin-right:3px;"></i> Before/After</span>' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 16px;">' +
          '<div style="font-size:.92rem;font-weight:700;color:#333;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (cs.title || '케이스') + '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;font-size:.76rem;color:#888;flex-wrap:wrap;">' +
            (cs.doctorName ? '<span><i class="fas fa-user-md" style="color:#c9a96e;margin-right:3px;"></i>' + cs.doctorName + '</span>' : '') +
            (cs.treatmentPeriod ? '<span><i class="fas fa-clock" style="margin-right:3px;"></i>' + cs.treatmentPeriod + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    var section = document.createElement('section');
    section.id = 'areaCasesSection';
    section.className = 'why-section section';
    section.setAttribute('aria-label', locName + ' 환자 치료 케이스');
    section.style.cssText = 'padding:48px 0 40px;background:#faf7f3;';
    section.innerHTML = '<div class="container" style="max-width:1100px;margin:0 auto;padding:0 20px;">' +
      '<div style="text-align:center;margin-bottom:28px;">' +
        '<span style="display:inline-block;font-size:.75rem;font-weight:600;color:#c9a96e;background:rgba(201,169,110,.1);padding:4px 14px;border-radius:50px;margin-bottom:10px;"><i class="fas fa-images" style="margin-right:4px;"></i> REAL CASES</span>' +
        '<h2 style="font-size:1.6rem;font-weight:800;color:#333;margin:0;">' + title + '</h2>' +
        '<p style="font-size:.9rem;color:#888;margin-top:6px;">' + sub + '</p>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:24px;">' + cardHtml + '</div>' +
      '<div style="text-align:center;"><a href="/cases/gallery" style="display:inline-flex;align-items:center;gap:6px;padding:12px 28px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:.9rem;"><i class="fas fa-th"></i> 전체 케이스 갤러리 보기</a></div>' +
    '</div>';

    anchor.parentNode.insertBefore(section, anchor);

    // ── 로그인 상태 확인 + 잠금 모달 (treatment-cases.js 패턴) ──
    var isLoggedIn = false;
    if (window.__bdAuth && window.__bdAuth.loggedIn) {
      isLoggedIn = true;
    } else {
      fetch('/api/auth/me').then(function(r) { return r.json(); }).then(function(d) {
        isLoggedIn = d.loggedIn || false;
      }).catch(function() {});
    }

    function createLoginModal() {
      if (document.getElementById('loginPromptModal')) return;
      var modal = document.createElement('div');
      modal.id = 'loginPromptModal';
      modal.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;align-items:center;justify-content:center;';
      modal.innerHTML =
        '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);" id="loginModalBg"></div>' +
        '<div style="position:relative;background:#fff;border-radius:24px;padding:40px 36px 32px;max-width:420px;width:90%;box-shadow:0 24px 80px rgba(0,0,0,0.2);text-align:center;">' +
          '<button id="loginModalClose" style="position:absolute;top:16px;right:16px;width:36px;height:36px;border:none;background:#f5f5f4;border-radius:50%;cursor:pointer;color:#78716c;font-size:0.9rem;"><i class="fas fa-times"></i></button>' +
          '<div style="margin-bottom:20px;"><div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#faf7f4,#f0e9e0);display:inline-flex;align-items:center;justify-content:center;color:#6B4226;font-size:1.4rem;border:2px solid rgba(107,66,38,0.1);"><i class="fas fa-lock"></i></div></div>' +
          '<h3 style="font-size:1.25rem;font-weight:800;color:#1c1917;margin:0 0 8px;">로그인이 필요합니다</h3>' +
          '<p style="font-size:0.88rem;color:#78716c;line-height:1.6;margin:0 0 20px;">치료 전/후 사진과 상세 케이스 정보는<br>로그인 후 확인하실 수 있습니다.</p>' +
          '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">' +
            '<a href="/auth/login" id="loginModalLoginBtn" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;border-radius:14px;font-size:0.92rem;font-weight:700;text-decoration:none;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;"><i class="fas fa-sign-in-alt"></i> 로그인하기</a>' +
            '<a href="/auth/register" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;border-radius:14px;font-size:0.92rem;font-weight:700;text-decoration:none;background:#faf7f4;color:#6B4226;border:1px solid rgba(107,66,38,0.12);"><i class="fas fa-user-plus"></i> 회원가입 (10초)</a>' +
          '</div>' +
          '<p style="font-size:0.72rem;color:#a8a29e;margin:0;"><i class="fas fa-shield-alt" style="font-size:0.6rem;margin-right:4px;"></i>개인정보는 안전하게 보호됩니다</p>' +
        '</div>';
      document.body.appendChild(modal);
      document.getElementById('loginModalBg').addEventListener('click', closeLoginModal);
      document.getElementById('loginModalClose').addEventListener('click', closeLoginModal);
      document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLoginModal(); });
    }
    function showLoginModal(redirectPath) {
      createLoginModal();
      var modal = document.getElementById('loginPromptModal');
      var btn = document.getElementById('loginModalLoginBtn');
      if (btn && redirectPath) btn.href = '/auth/login?redirect=' + encodeURIComponent(redirectPath);
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    function closeLoginModal() {
      var modal = document.getElementById('loginPromptModal');
      if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
    }

    section.querySelectorAll('.area-case-card').forEach(function(card) {
      card.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-4px)'; this.style.boxShadow = '0 8px 24px rgba(107,66,38,.12)'; });
      card.addEventListener('mouseleave', function() { this.style.transform = ''; this.style.boxShadow = '0 2px 8px rgba(107,66,38,.06)'; });
      card.addEventListener('click', function(e) {
        e.preventDefault();
        var href = card.getAttribute('data-case-href');
        if (!isLoggedIn) { showLoginModal(href); return; }
        if (href) window.location.href = href;
      });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });
  }
})();
