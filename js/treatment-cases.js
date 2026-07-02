/**
 * 진료 페이지 Before/After 케이스 카드 자동 삽입
 * 각 treatments/*.html 페이지에서 로드되며,
 * 페이지 URL에서 카테고리를 추출하여 해당 케이스를 표시합니다.
 */
(function() {
  'use strict';

  // URL → 카테고리 매핑
  const path = window.location.pathname.replace(/\/$/, '');
  const slug = path.split('/').pop();
  if (!slug) return;

  // 카테고리 한글 매핑
  const CATS = {
    implant:'임플란트', invisalign:'인비절라인', orthodontics:'치아교정',
    'front-crown':'앞니크라운', pediatric:'소아치과',
    aesthetic:'심미레진', glownate:'글로우네이트', cavity:'충치치료',
    resin:'레진치료', crown:'크라운', inlay:'인레이/온레이',
    'root-canal':'신경치료', 're-root-canal':'재신경치료',
    whitening:'미백', bridge:'브릿지', denture:'틀니',
    scaling:'스케일링', gum:'잇몸치료', periodontitis:'치주염',
    'gum-surgery':'잇몸수술', 'wisdom-tooth':'사랑니발치',
    apicoectomy:'치근단절제술', sedation:'수면치료', prevention:'예방치료',
    tmj:'턱관절(TMJ)', bruxism:'이갈이/브럭시즘', emergency:'응급치료'
  };

  const catName = CATS[slug];
  if (!catName) return; // 매핑 안 되면 무시

  // API에서 해당 카테고리 케이스 가져오기
  fetch('/api/cases?category=' + encodeURIComponent(slug))
    .then(function(res) { return res.json(); })
    .then(function(cases) {
      if (!cases || !cases.length) return;
      insertCaseSection(cases, catName, slug);
    })
    .catch(function(e) { console.warn('케이스 로드 실패:', e); });

  function insertCaseSection(cases, catName, slug) {
    // CTA 섹션 앞에 삽입
    var ctaSection = document.querySelector('.cta-section');
    if (!ctaSection) {
      // 대안: 마지막 section 앞
      var allSections = document.querySelectorAll('main > section');
      if (allSections.length > 1) {
        ctaSection = allSections[allSections.length - 3]; // CTA 앞
      }
    }
    if (!ctaSection) return;

    var section = document.createElement('section');
    section.className = 'content-section';
    section.style.cssText = 'padding:48px 0 40px;background:#faf7f3;';
    
    var maxShow = Math.min(cases.length, 6);
    var cardHtml = '';
    
    for (var i = 0; i < maxShow; i++) {
      var cs = cases[i];
      var hasImg = cs.hasAnyImage || !!cs.beforeImage;
      var imgContent;
      if (cs.beforeImage) {
        imgContent = '<img src="' + cs.beforeImage + '" alt="' + (cs.title || 'Before/After') + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">';
      } else {
        imgContent = '<div style="width:100%;height:100%;background:linear-gradient(135deg,#e8dfd6,#d4c5b5);display:flex;align-items:center;justify-content:center"><i class="fas fa-teeth" style="font-size:2rem;color:rgba(107,66,38,0.2)"></i></div>';
      }
      
      cardHtml += '<div class="ba-case-card" data-case-href="/cases/' + cs.id + '" style="display:block;background:#fff;border:1px solid #e8e0d8;border-radius:16px;overflow:hidden;text-decoration:none;color:#333;transition:all .3s;box-shadow:0 2px 8px rgba(107,66,38,0.06);cursor:pointer;">' +
        '<div style="position:relative;aspect-ratio:4/3;overflow:hidden;background:#f0ebe4;">' +
          imgContent +
          '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.6));padding:12px 14px;">' +
            '<span style="font-size:.7rem;background:rgba(255,255,255,.2);backdrop-filter:blur(4px);padding:3px 8px;border-radius:20px;color:#fff;"><i class="fas fa-images" style="margin-right:3px;"></i> Before/After</span>' +
          '</div>' +

        '</div>' +
        '<div style="padding:14px 16px;">' +
          '<div style="font-size:.95rem;font-weight:700;color:#333;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (cs.title || '케이스') + '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;font-size:.78rem;color:#888;">' +
            '<span><i class="fas fa-user-md" style="color:#c9a96e;margin-right:3px;"></i>' + (cs.doctorName || '') + '</span>' +
            (cs.treatmentPeriod ? '<span><i class="fas fa-clock" style="margin-right:3px;"></i>' + cs.treatmentPeriod + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    section.innerHTML = '<div class="container" style="max-width:1100px;margin:0 auto;padding:0 20px;">' +
      '<div style="text-align:center;margin-bottom:28px;">' +
        '<span style="display:inline-block;font-size:.75rem;font-weight:600;color:#c9a96e;background:rgba(201,169,110,.1);padding:4px 14px;border-radius:50px;margin-bottom:10px;"><i class="fas fa-images" style="margin-right:4px;"></i> REAL CASES</span>' +
        '<h2 style="font-size:1.6rem;font-weight:800;color:#333;margin:0;">' + catName + ' <span style="color:#6B4226;">Before/After</span></h2>' +
        '<p style="font-size:.9rem;color:#888;margin-top:6px;">실제 환자분들의 치료 전후 사진입니다</p>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:24px;">' +
        cardHtml +
      '</div>' +
      (cases.length > maxShow ? '<div style="text-align:center;"><a href="/cases/gallery" style="display:inline-flex;align-items:center;gap:6px;padding:12px 28px;background:#6B4226;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;font-size:.9rem;"><i class="fas fa-th"></i> 전체 ' + cases.length + '건 보기</a></div>' : '') +

    '</div>';

    ctaSection.parentNode.insertBefore(section, ctaSection);

    // 로그인 상태 확인
    var isLoggedIn = false;
    if (window.__bdAuth && window.__bdAuth.loggedIn) {
      isLoggedIn = true;
    } else {
      fetch('/api/auth/me').then(function(r) { return r.json(); }).then(function(d) {
        isLoggedIn = d.loggedIn || false;
      }).catch(function() {});
    }

    // 로그인 모달 생성 (갤러리 페이지와 동일한 디자인)
    function createLoginModal() {
      if (document.getElementById('loginPromptModal')) return;
      var modal = document.createElement('div');
      modal.id = 'loginPromptModal';
      modal.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;align-items:center;justify-content:center;';
      modal.innerHTML =
        '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);" id="loginModalBg"></div>' +
        '<div style="position:relative;background:#fff;border-radius:24px;padding:40px 36px 32px;max-width:420px;width:90%;box-shadow:0 24px 80px rgba(0,0,0,0.2);text-align:center;animation:loginModalIn .35s cubic-bezier(.22,.68,0,1.15);">' +
          '<button id="loginModalClose" style="position:absolute;top:16px;right:16px;width:36px;height:36px;border:none;background:#f5f5f4;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#78716c;font-size:0.9rem;"><i class="fas fa-times"></i></button>' +
          '<div style="margin-bottom:20px;"><div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#faf7f4,#f0e9e0);display:inline-flex;align-items:center;justify-content:center;color:#6B4226;font-size:1.4rem;border:2px solid rgba(107,66,38,0.1);"><i class="fas fa-lock"></i></div></div>' +
          '<h3 style="font-size:1.25rem;font-weight:800;color:#1c1917;margin:0 0 8px;">로그인이 필요합니다</h3>' +
          '<p style="font-size:0.88rem;color:#78716c;line-height:1.6;margin:0 0 20px;">치료 전/후 사진과 상세 케이스 정보는<br>로그인 후 확인하실 수 있습니다.</p>' +
          '<div style="background:#faf7f4;border-radius:14px;padding:16px 20px;margin-bottom:24px;text-align:left;">' +
            '<div style="font-size:0.82rem;color:#44403c;padding:5px 0;display:flex;align-items:center;gap:10px;"><i class="fas fa-check-circle" style="color:#6B4226;font-size:0.78rem;"></i> 비포/애프터 사진 전체 공개</div>' +
            '<div style="font-size:0.82rem;color:#44403c;padding:5px 0;display:flex;align-items:center;gap:10px;"><i class="fas fa-check-circle" style="color:#6B4226;font-size:0.78rem;"></i> 파노라마·구내 사진 확인</div>' +
            '<div style="font-size:0.82rem;color:#44403c;padding:5px 0;display:flex;align-items:center;gap:10px;"><i class="fas fa-check-circle" style="color:#6B4226;font-size:0.78rem;"></i> 상세 치료 과정 열람</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">' +
            '<a href="/auth/login" id="loginModalLoginBtn" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;border-radius:14px;font-size:0.92rem;font-weight:700;text-decoration:none;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;box-shadow:0 4px 16px rgba(107,66,38,0.25);"><i class="fas fa-sign-in-alt"></i> 로그인하기</a>' +
            '<a href="/auth/register" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;border-radius:14px;font-size:0.92rem;font-weight:700;text-decoration:none;background:#faf7f4;color:#6B4226;border:1px solid rgba(107,66,38,0.12);"><i class="fas fa-user-plus"></i> 회원가입 (10초)</a>' +
          '</div>' +
          '<p style="font-size:0.72rem;color:#a8a29e;margin:0;display:flex;align-items:center;justify-content:center;gap:5px;"><i class="fas fa-shield-alt" style="font-size:0.6rem;"></i> 개인정보는 안전하게 보호됩니다</p>' +
        '</div>';
      document.body.appendChild(modal);
      // 스타일 주입
      if (!document.getElementById('loginModalKeyframes')) {
        var st = document.createElement('style');
        st.id = 'loginModalKeyframes';
        st.textContent = '@keyframes loginModalIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}';
        document.head.appendChild(st);
      }
      // 이벤트
      document.getElementById('loginModalBg').addEventListener('click', closeLoginModal);
      document.getElementById('loginModalClose').addEventListener('click', closeLoginModal);
      document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLoginModal(); });
    }

    function showLoginModal(redirectPath) {
      createLoginModal();
      var modal = document.getElementById('loginPromptModal');
      var loginBtn = document.getElementById('loginModalLoginBtn');
      if (loginBtn && redirectPath) {
        loginBtn.href = '/auth/login?redirect=' + encodeURIComponent(redirectPath);
      }
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeLoginModal() {
      var modal = document.getElementById('loginPromptModal');
      if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
    }

    // 카드 클릭 + Hover
    var cards = section.querySelectorAll('.ba-case-card');
    cards.forEach(function(card) {
      card.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-4px)'; this.style.boxShadow = '0 8px 24px rgba(107,66,38,.12)'; });
      card.addEventListener('mouseleave', function() { this.style.transform = ''; this.style.boxShadow = '0 2px 8px rgba(107,66,38,.06)'; });
      card.addEventListener('click', function(e) {
        e.preventDefault();
        var href = card.getAttribute('data-case-href');
        if (!isLoggedIn) {
          showLoginModal(href);
          return;
        }
        if (href) window.location.href = href;
      });
    });
  }
})();
