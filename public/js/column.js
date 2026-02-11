/**
 * 서울비디치과 칼럼 페이지 — 인블로그 RSS 자동 연동
 * 소스: /api/inblog-rss (서버 프록시 → https://inblog.ai/bdbddc/rss)
 */
(function () {
  'use strict';

  const loadingEl = document.getElementById('loadingState');
  const emptyEl = document.getElementById('emptyState');
  const gridEl = document.getElementById('columnsGrid');
  if (!gridEl) return;

  // 카테고리 매핑
  const CATEGORY_KEYWORDS = {
    laminate: ['라미네이트', '글로우네이트', '비니어', 'laminate', 'veneer'],
    invisalign: ['인비절라인', '교정', '치아교정', 'invisalign', '투명교정'],
    implant: ['임플란트', 'implant', '뼈이식', '상악동'],
    general: ['충치', '신경치료', '크라운', '레진', '발치', '사랑니', '스케일링', '잇몸'],
    tips: ['관리', '양치', '치실', '칫솔', '구강', '예방', '치아관리']
  };

  function detectCategory(title, desc) {
    const text = (title + ' ' + desc).toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (text.includes(kw.toLowerCase())) return cat;
      }
    }
    return 'general';
  }

  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return y + '.' + m + '.' + day;
    } catch (e) {
      return '';
    }
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function truncate(text, max) {
    if (text.length <= max) return text;
    return text.substring(0, max) + '...';
  }

  function renderColumns(items) {
    if (!items.length) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    var html = '';
    items.forEach(function (item) {
      var category = detectCategory(item.title, item.desc);
      var dateStr = formatDate(item.pubDate);
      var desc = truncate(stripHtml(item.desc), 120);
      var thumb = item.image || '';
      var thumbHtml = thumb
        ? '<div class="column-thumb"><img src="' + thumb + '" alt="' + item.title + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>'
        : '';

      html += '<a href="' + item.link + '" target="_blank" rel="noopener" class="column-card" data-category="' + category + '">'
        + thumbHtml
        + '<div class="column-body">'
        + '<span class="column-date"><i class="fas fa-calendar-alt"></i> ' + dateStr + '</span>'
        + '<h3 class="column-title">' + item.title + '</h3>'
        + '<p class="column-desc">' + desc + '</p>'
        + (item.author ? '<span class="column-author"><i class="fas fa-user-md"></i> ' + item.author + '</span>' : '')
        + '</div>'
        + '</a>';
    });

    gridEl.innerHTML = html;
    gridEl.style.display = '';
    if (loadingEl) loadingEl.style.display = 'none';

    // 카테고리 필터 연결
    setupCategoryFilter(items);
  }

  function setupCategoryFilter() {
    var btns = document.querySelectorAll('.category-btn');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        var filter = this.getAttribute('data-category');
        var cards = gridEl.querySelectorAll('.column-card');
        cards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  function parseRSS(xmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlText, 'text/xml');
    var items = doc.querySelectorAll('item');
    var result = [];

    items.forEach(function (item) {
      var title = (item.querySelector('title') || {}).textContent || '';
      var link = (item.querySelector('link') || {}).textContent || '';
      var desc = (item.querySelector('description') || {}).textContent || '';
      var pubDate = (item.querySelector('pubDate') || {}).textContent || '';
      var author = (item.querySelector('author') || {}).textContent || '';
      var enclosure = item.querySelector('enclosure');
      var image = enclosure ? enclosure.getAttribute('url') : '';

      if (title) {
        result.push({ title: title, link: link, desc: desc, pubDate: pubDate, author: author, image: image });
      }
    });

    return result;
  }

  function loadColumns() {
    fetch('/api/inblog-rss')
      .then(function (res) {
        if (!res.ok) throw new Error('RSS fetch failed');
        return res.text();
      })
      .then(function (xmlText) {
        var items = parseRSS(xmlText);
        renderColumns(items);
      })
      .catch(function (err) {
        console.warn('칼럼 로드 실패:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = '';
      });
  }

  // 페이지 로드 시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadColumns);
  } else {
    loadColumns();
  }
})();
