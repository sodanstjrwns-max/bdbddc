/**
 * 서울비디치과 영상 페이지 — 유튜브 RSS 자동 연동
 * 소스: /api/youtube-rss (서버 프록시 → YouTube Atom Feed)
 * 채널: 쉽디 쉬운 치과이야기 (UCakJiVviUa_FJvFWgW_FDBw)
 */
(function () {
  'use strict';

  var loadingEl = document.getElementById('loadingState');
  var errorEl = document.getElementById('errorState');
  var emptyEl = document.getElementById('emptyState');
  var gridEl = document.getElementById('videosGrid');
  if (!gridEl) return;

  function formatDate(dateStr) {
    try {
      var d = new Date(dateStr);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return y + '.' + m + '.' + day;
    } catch (e) {
      return '';
    }
  }

  function formatViews(count) {
    if (!count) return '';
    var n = parseInt(count, 10);
    if (n >= 10000) return (n / 10000).toFixed(1) + '만회';
    if (n >= 1000) return (n / 1000).toFixed(1) + '천회';
    return n + '회';
  }

  function truncate(text, max) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.substring(0, max) + '...';
  }

  function parseAtomFeed(xmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlText, 'text/xml');
    var entries = doc.querySelectorAll('entry');
    var result = [];

    entries.forEach(function (entry) {
      var title = '';
      var titleEl = entry.querySelector('title');
      if (titleEl) title = titleEl.textContent || '';

      var videoId = '';
      var videoIdEl = entry.getElementsByTagNameNS('http://www.youtube.com/xml/schemas/2015', 'videoId')[0];
      if (videoIdEl) videoId = videoIdEl.textContent || '';

      var published = '';
      var pubEl = entry.querySelector('published');
      if (pubEl) published = pubEl.textContent || '';

      var description = '';
      var descEl = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'description')[0];
      if (descEl) description = descEl.textContent || '';

      var thumbnail = '';
      var thumbEl = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0];
      if (thumbEl) thumbnail = thumbEl.getAttribute('url') || '';

      var views = '';
      var statsEl = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'statistics')[0];
      if (statsEl) views = statsEl.getAttribute('views') || '';

      if (videoId && title) {
        result.push({
          videoId: videoId,
          title: title,
          published: published,
          description: description,
          thumbnail: thumbnail || 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg',
          views: views
        });
      }
    });

    return result;
  }

  function renderVideos(items) {
    if (!items.length) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    var html = '';
    items.forEach(function (item) {
      var dateStr = formatDate(item.published);
      var viewStr = formatViews(item.views);
      var desc = truncate(item.description, 100);
      var isShorts = item.title.includes('#shorts') || item.description.includes('#shorts');
      var watchUrl = isShorts
        ? 'https://www.youtube.com/shorts/' + item.videoId
        : 'https://www.youtube.com/watch?v=' + item.videoId;

      html += '<a href="' + watchUrl + '" target="_blank" rel="noopener" class="video-card">'
        + '<div class="video-thumb">'
        + '<img src="' + item.thumbnail + '" alt="' + item.title + '" loading="lazy" onerror="this.src=\'https://i.ytimg.com/vi/' + item.videoId + '/mqdefault.jpg\'">'
        + '<div class="video-play"><i class="fas fa-play"></i></div>'
        + (isShorts ? '<span class="video-badge-shorts">Shorts</span>' : '')
        + '</div>'
        + '<div class="video-body">'
        + '<h3 class="video-title">' + item.title + '</h3>'
        + '<div class="video-meta">'
        + '<span><i class="fas fa-calendar-alt"></i> ' + dateStr + '</span>'
        + (viewStr ? '<span><i class="fas fa-eye"></i> ' + viewStr + '</span>' : '')
        + '</div>'
        + (desc ? '<p class="video-desc">' + desc + '</p>' : '')
        + '</div>'
        + '</a>';
    });

    gridEl.innerHTML = html;
    gridEl.style.display = '';
    if (loadingEl) loadingEl.style.display = 'none';
  }

  // 전역으로 loadVideos 노출 (retry 버튼용)
  window.loadVideos = function () {
    if (loadingEl) loadingEl.style.display = '';
    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    gridEl.style.display = 'none';

    fetch('/api/youtube-rss')
      .then(function (res) {
        if (!res.ok) throw new Error('YouTube RSS fetch failed');
        return res.text();
      })
      .then(function (xmlText) {
        var items = parseAtomFeed(xmlText);
        renderVideos(items);
      })
      .catch(function (err) {
        console.warn('영상 로드 실패:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = '';
      });
  };

  // 페이지 로드 시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.loadVideos);
  } else {
    window.loadVideos();
  }
})();
