/**
 * 서울비디치과 치과 백과사전
 * - /data/encyclopedia.json에서 187개 항목 로드
 * - 카테고리 필터, 초성 필터, 실시간 검색
 * - 모달 상세 보기
 * - FAQPage 스키마 동적 생성 (SEO)
 */
(function () {
  'use strict';

  const CHOSUNG_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const DISPLAY_CHOSUNG = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  let allItems = [];
  let currentCategory = 'all';
  let currentChosung = 'all';
  let searchQuery = '';

  // ===== 초성 추출 =====
  function getChosung(char) {
    const code = char.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return char;
    return CHOSUNG_LIST[Math.floor(code / 588)];
  }

  function normalizeChosung(ch) {
    // ㄲ→ㄱ, ㄸ→ㄷ, ㅃ→ㅂ, ㅆ→ㅅ, ㅉ→ㅈ
    const map = {'ㄲ':'ㄱ','ㄸ':'ㄷ','ㅃ':'ㅂ','ㅆ':'ㅅ','ㅉ':'ㅈ'};
    return map[ch] || ch;
  }

  // ===== HTML 새니타이저 =====
  // 백과사전 detail/short에는 의도된 서식(h3, ul, table, a, strong 등)이 들어있다.
  // 신뢰된 자체 데이터이지만, 안전을 위해 위험 요소(script/iframe/on* 이벤트/javascript:)만 제거하고
  // 허용 태그는 그대로 렌더링한다.
  function sanitizeHtml(html) {
    if (!html) return '';
    if (html.indexOf('<') === -1) return html; // 평문이면 그대로
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_ELEMENT, null);
    const toRemove = [];
    let node = walker.nextNode();
    while (node) {
      const tag = node.tagName.toLowerCase();
      // 위험 태그 통째로 제거
      if (tag === 'script' || tag === 'iframe' || tag === 'object' ||
          tag === 'embed' || tag === 'style' || tag === 'link' || tag === 'meta') {
        toRemove.push(node);
      } else {
        // 위험 속성 제거 (on* 핸들러, javascript: URL)
        Array.prototype.slice.call(node.attributes).forEach(function (attr) {
          const an = attr.name.toLowerCase();
          const av = (attr.value || '').toLowerCase().replace(/\s/g, '');
          if (an.indexOf('on') === 0 ||
              ((an === 'href' || an === 'src') && av.indexOf('javascript:') === 0)) {
            node.removeAttribute(attr.name);
          }
        });
        // 외부 링크는 새 탭 안전 처리
        if (tag === 'a' && node.getAttribute('href') && /^https?:\/\//i.test(node.getAttribute('href'))) {
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }
      node = walker.nextNode();
    }
    toRemove.forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); });
    return tpl.innerHTML;
  }

  // 카드 미리보기용: 태그 제거 후 평문만 (검색 하이라이트 안전성 위해)
  function stripTags(html) {
    if (!html) return '';
    if (html.indexOf('<') === -1) return html;
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    return (tpl.content.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // ===== 필터링 =====
  function getFilteredItems() {
    return allItems.filter(item => {
      // 카테고리
      if (currentCategory !== 'all' && item.category !== currentCategory) return false;

      // 초성
      if (currentChosung !== 'all') {
        const itemNorm = normalizeChosung(item.chosung);
        if (itemNorm !== currentChosung) return false;
      }

      // 검색어
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inTerm = item.term.toLowerCase().includes(q);
        const inShort = item.short.toLowerCase().includes(q);
        const inSynonyms = (item.synonyms || []).some(s => s.toLowerCase().includes(q));
        const inTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
        if (!inTerm && !inShort && !inSynonyms && !inTags) return false;
      }

      return true;
    });
  }

  // ===== 렌더링 =====
  function renderCards(items) {
    const grid = document.getElementById('encGrid');
    const empty = document.getElementById('encEmpty');
    const count = document.getElementById('encCount');

    if (!grid) return;

    count.innerHTML = searchQuery || currentCategory !== 'all' || currentChosung !== 'all'
      ? `검색 결과 <strong>${items.length}</strong>개`
      : `전체 <strong>${items.length}</strong>개 용어`;

    if (items.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    grid.style.display = 'grid';

    // v5.17 SEO: 카드를 실제 <a href> 링크로 렌더 → 838개 SSR 용어 페이지로 내부링크 형성
    // (크롤러는 href를 따라가고, 사용자는 JS가 preventDefault 후 모달로 빠른 열람)
    grid.innerHTML = items.map(item => `
      <a class="enc-card" href="/encyclopedia/${encodeURIComponent(item.term)}" data-id="${item.id}" aria-label="${item.term} 상세 보기" style="text-decoration:none;color:inherit;">
        <div class="enc-card-header">
          <span class="enc-card-chosung">${item.chosung}</span>
          <div>
            <div class="enc-card-term">${highlightMatch(item.term)}</div>

          </div>
        </div>
        <span class="enc-card-category">${item.category}</span>
        <div class="enc-card-short">${highlightMatch(stripTags(item.short))}</div>
        <span class="enc-card-arrow"><i class="fas fa-chevron-right"></i></span>
      </a>
    `).join('');

    // 카드 클릭 이벤트 — 기본 이동 대신 모달 (Ctrl/Cmd/중간클릭은 새 탭 정상 동작)
    grid.querySelectorAll('.enc-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        openModal(parseInt(card.dataset.id));
      });
    });
  }

  function highlightMatch(text) {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background:var(--brand-gold-light);padding:0 2px;border-radius:2px;">$1</mark>');
  }

  // ===== 카테고리 버튼 =====
  function renderCategories(categories) {
    const container = document.getElementById('encCategories');
    if (!container) return;

    const categoryIcons = {
      '교정': 'fas fa-teeth',
      '구강 관리': 'fas fa-shield-alt',
      '구강내과 질환': 'fas fa-notes-medical',
      '보험·비용': 'fas fa-won-sign',
      '소아 치과': 'fas fa-baby',
      '임플란트': 'fas fa-screwdriver',
      '장비·기술': 'fas fa-microscope',
      '전문 용어': 'fas fa-language',
      '치과 재료': 'fas fa-cubes',
      '치과 질환': 'fas fa-virus',
      '치료·시술': 'fas fa-syringe',
      '치수·치아 질환': 'fas fa-bolt',
      '치아 구조': 'fas fa-tooth',
      '치주 질환': 'fas fa-teeth-open',
      '턱관절·구강외과': 'fas fa-head-side-medical'
    };

    container.innerHTML = `<button class="enc-cat-btn active" data-cat="all">전체</button>` +
      categories.map(cat =>
        `<button class="enc-cat-btn" data-cat="${cat}"><i class="${categoryIcons[cat] || 'fas fa-tag'}"></i> ${cat}</button>`
      ).join('');

    container.querySelectorAll('.enc-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.enc-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.cat;
        updateChosungBar();
        renderCards(getFilteredItems());
      });
    });
  }

  // ===== 초성 바 =====
  function renderChosungBar() {
    const bar = document.getElementById('encChosungBar');
    if (!bar) return;

    bar.innerHTML = `<button class="enc-chosung-btn active" data-ch="all">전체</button>` +
      DISPLAY_CHOSUNG.map(ch => `<button class="enc-chosung-btn" data-ch="${ch}">${ch}</button>`).join('');

    bar.querySelectorAll('.enc-chosung-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        bar.querySelectorAll('.enc-chosung-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentChosung = btn.dataset.ch;
        renderCards(getFilteredItems());
      });
    });

    updateChosungBar();
  }

  function updateChosungBar() {
    const bar = document.getElementById('encChosungBar');
    if (!bar) return;

    // 현재 카테고리+검색에서 사용 가능한 초성 구하기
    const available = new Set();
    allItems.forEach(item => {
      if (currentCategory !== 'all' && item.category !== currentCategory) return;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = item.term.toLowerCase().includes(q) ||
          item.short.toLowerCase().includes(q) ||
          (item.synonyms || []).some(s => s.toLowerCase().includes(q));
        if (!match) return;
      }
      available.add(normalizeChosung(item.chosung));
    });

    bar.querySelectorAll('.enc-chosung-btn').forEach(btn => {
      const ch = btn.dataset.ch;
      if (ch === 'all') return;
      btn.classList.toggle('disabled', !available.has(ch));
    });
  }

  // ===== 모달 =====
  function openModal(id) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modalTitle').textContent = item.term;
    // 동의어 표시 제거 (SEO 컨설팅: 동의어 리스트업 금지 — 검색·301용 데이터로만 사용)
    document.getElementById('modalSynonyms').textContent = '';
    document.getElementById('modalCategory').textContent = item.category;
    document.getElementById('modalShort').innerHTML = sanitizeHtml(item.short);
    document.getElementById('modalDetail').innerHTML = sanitizeHtml(item.detail);

    const tagsEl = document.getElementById('modalTags');
    tagsEl.innerHTML = (item.tags || []).map(t => `<span class="enc-modal-tag">#${t}</span>`).join('');

    const modal = document.getElementById('encModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // v5.17: 해시 대신 실제 경로 URL로 표기 (새로고침/공유 시 SSR 용어 페이지로 연결 → 색인 가능)
    history.replaceState(null, '', `/encyclopedia/${encodeURIComponent(item.term)}`);

    // 모달 하단에 전용 페이지 링크 노출
    var footEl = document.getElementById('modalPermalink');
    if (footEl) {
      footEl.href = `/encyclopedia/${encodeURIComponent(item.term)}`;
      footEl.style.display = '';
    }

    // v5.18: 관련 진료 CTA (item.link 있으면 진료 안내로 연결 — 백과 → 진료 퍼널 브릿지)
    var tlBox = document.getElementById('modalTreatmentLink');
    if (tlBox) {
      if (item.link) {
        var tlLabel = document.getElementById('modalTreatmentLabel');
        var tlBtn = document.getElementById('modalTreatmentBtn');
        if (tlLabel) tlLabel.textContent = item.term + ' 관련 진료 상세 안내';
        if (tlBtn) tlBtn.href = item.link;
        tlBox.style.display = 'flex';
      } else {
        tlBox.style.display = 'none';
      }
    }
  }

  function closeModal() {
    document.getElementById('encModal').classList.remove('active');
    document.body.style.overflow = '';
    history.replaceState(null, '', '/encyclopedia/');
  }

  function initModal() {
    const modal = document.getElementById('encModal');
    const closeBtn = document.getElementById('modalClose');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  // ===== FAQPage 스키마 (SEO) =====
  function generateFAQSchema(items) {
    // 상위 30개 항목으로 FAQPage 스키마 생성
    const faqItems = items.slice(0, 30).map(item => ({
      '@type': 'Question',
      'name': `${item.term}이란 무엇인가요?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `${stripTags(item.short)} ${stripTags(item.detail)}`.slice(0, 1000)
      }
    }));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqItems
    };

    const el = document.getElementById('faqSchema');
    if (el) el.textContent = JSON.stringify(schema);
  }

  // ===== 검색 디바운스 =====
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ===== URL 해시 → 자동 모달 열기 (구버전 #용어 공유 링크 하위호환) =====
  function checkHashOnLoad() {
    let hash = '';
    try { hash = decodeURIComponent(window.location.hash.slice(1)); } catch (e) { return; }
    if (!hash) return;
    const item = allItems.find(i => i.term === hash) ||
      allItems.find(i => (i.synonyms || []).includes(hash));
    if (item) {
      setTimeout(() => openModal(item.id), 300); // openModal이 경로 URL로 정규화
    } else {
      history.replaceState(null, '', '/encyclopedia/'); // 깨진 해시 정리
    }
  }

  // ===== 초기화 =====
  async function init() {
    try {
      const res = await fetch('/data/encyclopedia.json?v=' + Date.now());
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();

      allItems = data.items || [];

      // 카테고리 + 초성 + 카드 렌더링
      renderCategories(data.categories || []);
      renderChosungBar();
      renderCards(allItems);

      // FAQPage 스키마
      generateFAQSchema(allItems);

      // 모달
      initModal();

      // 검색
      const searchInput = document.getElementById('encSearch');
      if (searchInput) {
        searchInput.addEventListener('input', debounce(function () {
          searchQuery = this.value.trim();
          updateChosungBar();
          renderCards(getFilteredItems());
        }, 200));

        // SearchAction (?q=검색어) 지원 — 구조화 데이터 사이트링크 검색창 진입 시 자동 필터
        const qParam = new URLSearchParams(window.location.search).get('q');
        if (qParam) {
          searchInput.value = qParam;
          searchQuery = qParam.trim();
          updateChosungBar();
          renderCards(getFilteredItems());
        }
      }

      // URL 해시 체크
      checkHashOnLoad();

    } catch (err) {
      console.warn('백과사전 데이터 로드 실패:', err);
      const grid = document.getElementById('encGrid');
      const empty = document.getElementById('encEmpty');
      if (grid) grid.style.display = 'none';
      if (empty) {
        empty.style.display = 'block';
        empty.querySelector('h2').textContent = '데이터를 불러올 수 없습니다';
        empty.querySelector('p').textContent = '잠시 후 다시 시도해주세요.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
