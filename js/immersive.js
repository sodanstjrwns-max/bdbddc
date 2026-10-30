/* 메인 스크롤 몰입 연출 (GSAP ScrollTrigger + Lenis)
   - 글자는 모두 HTML에 그대로 두고 움직임만 더한다(크롤러·AEO 영향 없음)
   - 동작 줄이기 사용자는 아무것도 하지 않는다 */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // micro.js 가 DOMContentLoaded+100ms 에 mi-reveal 을 붙이므로 그 뒤에 시작해 클래스를 넘겨받는다
  function boot() { setTimeout(start, 180); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  function start() {
  var root = document.documentElement;
  root.classList.add('mx');
  var mobile = matchMedia('(max-width: 767px)').matches;
  var fine = matchMedia('(pointer: fine)').matches;

  // 기존 .reveal / .mi-reveal 는 micro.css 에서 !important 로 고정돼 있어 클래스만 떼고 이쪽이 맡는다
  document.querySelectorAll('.reveal, .mi-reveal').forEach(function (el) {
    el.classList.remove('reveal', 'mi-reveal', 'mi-visible', 'visible', 'mi-delay-1', 'mi-delay-2', 'mi-delay-3', 'mi-delay-4', 'mi-delay-5', 'mi-delay-6');
  });

  // 1) 부드러운 관성 스크롤 — 마우스·트랙패드 환경만 (터치는 기본 스크롤 유지)
  if (fine && window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      });
    });
  }

  // 화면에 들어오면 한 번 재생 — 빠르게 지나쳐도 onEnter 가 불려 반드시 끝까지 재생된다
  // 끝 값은 계산값을 읽지 않고 고정한다 — 기존 CSS transition 이 돌고 있으면 읽은 값이 0 이 되어 멈춰 버린다
  var TIMING = ['duration', 'ease', 'stagger', 'delay'];
  var claimed = [];
  function claim(list) { gsap.utils.toArray(list).forEach(function (el) { claimed.push(el); }); }
  function isClaimed(el) { return claimed.some(function (c) { return c === el || c.contains(el) || el.contains(c); }); }
  function enter(targets, vars, trigger, start) {
    claim(targets);
    var from = {}, to = { opacity: 1, x: 0, y: 0, yPercent: 0, rotate: 0, rotateX: 0, rotateY: 0, scale: 1, paused: true,
      onStart: function () { gsap.set(targets, { transition: 'none' }); },
      onComplete: function () { gsap.set(targets, { clearProps: 'opacity,transform,transition' }); } };
    Object.keys(vars).forEach(function (k) { (TIMING.indexOf(k) > -1 ? to : from)[k] = vars[k]; });
    var tw = gsap.fromTo(targets, from, to);
    ScrollTrigger.create({ trigger: trigger, start: start || 'top 88%', once: true, onEnter: function () {
      tw.play();
      // 탭이 숨겨져 프레임이 멈춰도 끝 상태는 보장
      setTimeout(function () { if (tw.progress() < 1) tw.progress(1); }, (tw.totalDuration() + 0.6) * 1000);
    } });
    return tw;
  }

  // 낱말 감싸기: 하위 span·br 은 보존하고 텍스트만 낱말 단위로 나눈다
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parts = node.textContent.split(/(\s+)/);
      if (parts.join('').trim() === '') return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var w = document.createElement('span'); w.className = 'mx-w';
        var i = document.createElement('span'); i.className = 'mx-wi'; i.textContent = p;
        w.appendChild(i); frag.appendChild(w);
      });
      var host = node.parentNode;
      host.replaceChild(frag, node);
      // 글자 그라데이션(background-clip:text)은 낱말마다 다시 입혀야 보인다
      var src = host;
      while (src && src !== el.parentNode && getComputedStyle(src).backgroundImage === 'none') src = src.parentElement;
      if (src && src !== el.parentNode && getComputedStyle(host).webkitTextFillColor === 'rgba(0, 0, 0, 0)') {
        var bg = getComputedStyle(src).backgroundImage;
        host.querySelectorAll(':scope > .mx-w > .mx-wi').forEach(function (wi) {
          wi.style.backgroundImage = bg;
          wi.style.webkitBackgroundClip = 'text';
          wi.style.backgroundClip = 'text';
          wi.style.webkitTextFillColor = 'transparent';
        });
      }
    });
    return el.querySelectorAll('.mx-wi');
  }

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return gsap.utils.toArray((ctx || document).querySelectorAll(sel)); };
  function scrub(target, from, to, st) {
    claim(target);
    return gsap.fromTo(target, from, Object.assign({ ease: 'none', scrollTrigger: Object.assign({ scrub: true }, st) }, to));
  }

  // ── 히어로: 내려가면 글은 빨리, 치아 그림은 천천히 — 깊이감
  var hero = $('.hero');
  if (hero) {
    scrub($('.hero-text', hero), { y: 0, opacity: 1 }, { y: mobile ? -40 : -110, opacity: 0.15 }, { trigger: hero, start: 'top top', end: 'bottom top' });
    var vec = $('.hero-vector', hero);
    if (vec) scrub(vec, { y: 0, rotate: 0, scale: 1 }, { y: mobile ? 30 : 90, rotate: 18, scale: 0.86 }, { trigger: hero, start: 'top top', end: 'bottom top' });
    claim($$('.hero-glow', hero));
  }

  // ── 철학 문장: 스크롤에 맞춰 한 낱말씩 밝아짐
  var quote = $('.philosophy-quote h2');
  if (quote) {
    quote.classList.add('mx-read');
    claim(quote);
    gsap.fromTo(splitWords(quote), { opacity: 0.14 }, { opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: quote, start: 'top 82%', end: 'bottom 38%', scrub: true } });
  }

  // ── 모든 섹션 제목: 낱말이 마스크 아래에서 올라옴 (인라인 스타일 제목 포함)
  $$('main section h2').forEach(function (h) {
    if (h.closest('.rm-hero, .hero, .mx-scene') || h === quote) return;
    enter(splitWords(h), { yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.04 }, h, 'top 88%');
  });
  $$('main .section-badge, main .section-subtitle, .reviews-header p, .cta-badge, .cta-desc').forEach(function (el) {
    if (el.closest('.rm-hero, .hero, .philosophy-quote') || isClaimed(el)) return;
    enter(el, { y: 18, opacity: 0, duration: 0.8, ease: 'power2.out' }, el, 'top 90%');
  });

  // ── 소개 영상: 둥근 카드에서 전체 화면으로 펼쳐짐
  var video = $('.video-fullwidth');
  if (video) {
    video.classList.add('mx-video');
    scrub(video, { clipPath: mobile ? 'inset(0% 5% round 18px)' : 'inset(6% 14% round 32px)' }, { clipPath: 'inset(0% 0% round 0px)' },
      { trigger: video, start: 'top 95%', end: 'top 15%' });
  }
  var vstats = $('.video-stats');
  if (vstats) enter(vstats.children, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, vstats, 'top 88%');

  // ── 장면 전환 블록(.mx-scene): 화면을 붙잡고 한 줄씩
  var scene = $('.mx-scene');
  if (scene) {
    claim(scene);
    var tl = gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: true } });
    tl.fromTo($('.mx-scene-bg', scene), { scale: 1.18 }, { scale: 1, ease: 'none', duration: 3 }, 0);
    $$('.mx-scene-copy p > span', scene).forEach(function (ln, i) {
      tl.fromTo(ln, { opacity: 0.12, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.2 + i * 0.8);
    });
  }

  // ── 왜 비디인가: 어두운 큰 카드가 다가오며 커짐, 근거 줄은 차례로
  var whyHero = $('.why-hero-card');
  if (whyHero) scrub(whyHero, { scale: mobile ? 0.94 : 0.86, opacity: 0.4 }, { scale: 1, opacity: 1 }, { trigger: whyHero, start: 'top bottom', end: 'top 35%' });
  var proofs = $$('.why-proof-list > *');
  if (proofs.length) enter(proofs, { x: -30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 }, proofs[0], 'top 90%');

  // ── 카드 묶음: 살짝 기울어진 채 순서대로 올라옴
  ['.why-grid', '.treatment-grid', '.subpage-card-grid', '.philosophy-cards', '.patient-concerns', '.concerns-grid'].forEach(function (sel) {
    $$(sel).forEach(function (g) {
      var items = Array.prototype.filter.call(g.children, function (c) { return !/STYLE|SCRIPT/.test(c.tagName) && !isClaimed(c); });
      if (!items.length) return;
      gsap.set(g, { perspective: 1000 });
      enter(items, { y: mobile ? 36 : 70, rotateX: mobile ? 0 : 9, opacity: 0, transformOrigin: '50% 0%',
        duration: 1, ease: 'power3.out', stagger: 0.09 }, g, 'top 86%');
    });
  });

  // ── 진료 카드 사진: 카드 안에서 사진이 천천히 줌아웃
  $$('.treatment-card img, .subpage-card img').forEach(function (img) {
    var box = img.closest('picture') ? img.closest('picture').parentElement : img.parentElement;
    box.classList.add('mx-par');
    gsap.fromTo(img, { scale: 1.18, yPercent: -4 }, { scale: 1.02, yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ── 가격 안내: 가격 칩이 흩어져 있다가 튀어나오듯 모임
  var chips = $$('#home-pricing-entry nav a');
  if (chips.length) enter(chips, { y: 40, scale: 0.7, rotate: function (i) { return (i % 2 ? 1 : -1) * (4 + (i % 3) * 3); }, opacity: 0,
    duration: 0.8, ease: 'back.out(1.8)', stagger: 0.06 }, chips[0], 'top 90%');

  // ── 천안·아산: 두 카드가 양쪽에서 들어와 만남
  var cities = $$('#home-local-care .local-city');
  cities.forEach(function (c, i) {
    enter(c, { x: (i ? 1 : -1) * (mobile ? 40 : 120), opacity: 0, duration: 1.1, ease: 'power3.out' }, c, 'top 88%');
  });

  // ── 종합 가이드: 세 장이 부채처럼 펼쳐졌다 제자리로
  var guides = $$('.guide-section a[href^="/guide/"]').filter(function (a) { return a.querySelector('h3'); });
  if (guides.length) {
    var mid = (guides.length - 1) / 2;
    enter(guides, {
      x: function (i) { return mobile ? 0 : (mid - i) * 140; }, y: 120, rotate: function (i) { return mobile ? 0 : (i - mid) * 8; },
      opacity: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'power3.out', stagger: 0.08 }, guides[0], 'top 90%');
  }

  // ── 치BTI 배너: 떠다니는 이모지가 서로 다른 속도로 흐르고, 치아가 통 튀어나옴
  var chb = $('.checkup-banner-section');
  if (chb) {
    $$('div', chb).filter(function (d) { return /float\d/.test(d.getAttribute('style') || ''); }).forEach(function (d, i) {
      claim(d);
      gsap.fromTo(d, { translate: '0px ' + (60 + i * 30) + 'px' }, { translate: '0px ' + (-80 - i * 40) + 'px', ease: 'none',
        scrollTrigger: { trigger: chb, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    var tp = $('.chbti-type-preview', chb);
    if (tp) enter(tp, { scale: 0, rotate: -40, opacity: 0, duration: 1, ease: 'back.out(2.2)' }, tp, 'top 90%');
    var pills = $$('.chbti-pill', chb);
    if (pills.length) enter(pills, { y: 24, scale: 0.85, opacity: 0, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.07 }, pills[0], 'top 95%');
  }

  // ── 층별 안내: 내려가는 동안 엘리베이터처럼 한 층씩 불이 켜짐
  var floors = $$('.floor-stack .floor-item');
  if (floors.length) {
    enter(floors, { x: 60, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, floors[0], 'top 88%');
    ScrollTrigger.create({ trigger: $('.floor-stack'), start: 'top 65%', end: 'bottom 45%',
      onUpdate: function (self) {
        var idx = Math.min(floors.length - 1, Math.floor(self.progress * floors.length));
        floors.forEach(function (f, i) { f.classList.toggle('mx-on', i === idx); });
      },
      onLeave: function () { floors.forEach(function (f) { f.classList.remove('mx-on'); }); },
      onLeaveBack: function () { floors.forEach(function (f) { f.classList.remove('mx-on'); }); } });
    var illu = $('.floor-side-illust img');
    if (illu) { illu.parentElement.classList.add('mx-par'); scrub(illu, { scale: 1.1 }, { scale: 1 }, { trigger: '.floor-side', start: 'top bottom', end: 'bottom 60%' }); }
  }

  // ── 공간 둘러보기: 매거진 카드 순차 등장 + 사진 시차
  var mag = $('.fac-mag-grid');
  if (mag) enter(mag.children, { y: 80, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12 }, mag, 'top 85%');
  $$('.fac-mag-card').forEach(function (box) {
    var img = $('img', box); if (!img) return;
    box.classList.add('mx-par');
    gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, { yPercent: 7, scale: 1.16, ease: 'none',
      scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ── 특징 띠: 스크롤 속도만큼 기울었다가 돌아옴
  var band = $('.features-banner .container');
  if (band) {
    claim(band);
    var skewTo = gsap.quickTo(band, 'skewX', { duration: 0.5, ease: 'power3' });
    ScrollTrigger.create({ trigger: '.features-banner', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) { skewTo(gsap.utils.clamp(-8, 8, self.getVelocity() / -250)); } });
  }

  // ── 추천 대상: 카드가 가운데부터 뒤집히듯 펼쳐짐
  var promise = $('.promise-grid');
  if (promise) {
    gsap.set(promise, { perspective: 1200 });
    enter(promise.children, { rotateY: mobile ? 0 : -35, y: 50, opacity: 0, transformOrigin: '0% 50%',
      duration: 1, ease: 'power3.out', stagger: { each: 0.08, from: 'center' } }, promise, 'top 86%');
  }

  // ── 리뷰 링크 버튼
  var revBtns = $$('.reviews-external-links a');
  if (revBtns.length) enter(revBtns, { y: 30, scale: 0.9, opacity: 0, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.1 }, revBtns[0], 'top 92%');

  // ── 상담 예약: 박스가 화면 가득 다가옴
  var cta = $('.cta-box');
  if (cta) scrub(cta, { scale: mobile ? 0.94 : 0.84, borderRadius: '48px' }, { scale: 1, borderRadius: '24px' }, { trigger: cta, start: 'top bottom', end: 'top 30%' });
  var ctaBtns = $$('.cta-buttons > a');
  if (ctaBtns.length) enter(ctaBtns, { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, ctaBtns[0], 'top 95%');

  // ── 원장 칼럼 목록·지역 링크: 왼쪽에서 한 줄씩
  $$('main section a[href^="/column/"], main section a[href^="/area/"], main section a[href="/directions"], main section a[href="/pricing"], .bd-region-guide-links nav a').forEach(function (a) {
    if (isClaimed(a) || a.closest('#home-pricing-entry nav')) return;
    a.classList.add('mx-row');
  });
  var rowGroups = new Map();
  $$('.mx-row').forEach(function (a) { var p = a.parentElement; if (!rowGroups.has(p)) rowGroups.set(p, []); rowGroups.get(p).push(a); });
  rowGroups.forEach(function (rows, p) { enter(rows, { x: -36, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 }, p, 'top 90%'); });

  // ── 나머지 전부: 아직 아무 연출이 없는 블록은 기본 등장
  $$('main section > .container > *, main section > div > *, .bd-region-guide-links > div > *').forEach(function (el) {
    if (el.closest('.rm-hero, .hero, .mx-scene') || /STYLE|SCRIPT/.test(el.tagName) || isClaimed(el)) return;
    if (el.getBoundingClientRect().height < 8) return;
    enter(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out' }, el, 'top 90%');
  });

  // 이미지가 늦게 로드되면 위치 다시 계산
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
