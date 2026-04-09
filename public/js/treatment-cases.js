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
      var thumb = cs.beforeImage || '/images/icons/favicon.svg';
      var date = new Date(cs.createdAt).toLocaleDateString('ko-KR', {year:'numeric',month:'short'});
      
      cardHtml += '<a href="/cases/' + cs.id + '" class="ba-case-card" style="display:block;background:#fff;border:1px solid #e8e0d8;border-radius:16px;overflow:hidden;text-decoration:none;color:#333;transition:all .3s;box-shadow:0 2px 8px rgba(107,66,38,0.06);">' +
        '<div style="position:relative;aspect-ratio:4/3;overflow:hidden;background:#f0ebe4;">' +
          '<img src="' + thumb + '" alt="' + (cs.title || 'Before/After') + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.src=\'/images/icons/favicon.svg\'">' +
          '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.6));padding:12px 14px;">' +
            '<span style="font-size:.7rem;background:rgba(255,255,255,.2);backdrop-filter:blur(4px);padding:3px 8px;border-radius:20px;color:#fff;"><i class="fas fa-images" style="margin-right:3px;"></i> Before/After</span>' +
          '</div>' +
          '<div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);padding:3px 10px;border-radius:20px;">' +
            '<i class="fas fa-lock" style="font-size:.6rem;color:#fff;margin-right:3px;"></i><span style="font-size:.65rem;color:#fff;">로그인 후 보기</span>' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 16px;">' +
          '<div style="font-size:.95rem;font-weight:700;color:#333;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (cs.title || '케이스') + '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;font-size:.78rem;color:#888;">' +
            '<span><i class="fas fa-user-md" style="color:#c9a96e;margin-right:3px;"></i>' + (cs.doctorName || '') + '</span>' +
            (cs.treatmentPeriod ? '<span><i class="fas fa-clock" style="margin-right:3px;"></i>' + cs.treatmentPeriod + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</a>';
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
      '<div style="text-align:center;margin-top:16px;font-size:.75rem;color:#aaa;"><i class="fas fa-lock" style="margin-right:4px;"></i> Before/After 상세 사진은 로그인 후 확인 가능합니다 · <a href="/auth/login" style="color:#6B4226;text-decoration:underline;">로그인하기</a></div>' +
    '</div>';

    ctaSection.parentNode.insertBefore(section, ctaSection);

    // Hover effect
    var cards = section.querySelectorAll('.ba-case-card');
    cards.forEach(function(card) {
      card.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-4px)'; this.style.boxShadow = '0 8px 24px rgba(107,66,38,.12)'; });
      card.addEventListener('mouseleave', function() { this.style.transform = ''; this.style.boxShadow = '0 2px 8px rgba(107,66,38,.06)'; });
    });
  }
})();
