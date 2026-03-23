/**
 * 서울비디치과 영상 페이지 — 유튜브 RSS 자동 연동 (멀티 채널 탭)
 * 채널 1: @BDtube / 쉽디 쉬운 치과이야기 (UCakJiVviUa_FJvFWgW_FDBw)
 * 채널 2: @geoptongryung / 치과겁통령 (UCKdzv9JtxhLJ-7EOcoIVQZQ)
 */
(function () {
  'use strict';

  var loadingEl = document.getElementById('loadingState');
  var errorEl = document.getElementById('errorState');
  var emptyEl = document.getElementById('emptyState');
  var gridEl = document.getElementById('videosGrid');
  var channelSubscribe = document.getElementById('channelSubscribe');
  var channelNameEl = document.getElementById('channelName');
  if (!gridEl) return;

  // 현재 활성 API URL
  var currentApi = '/api/youtube-rss';

  // 캐시: API URL → 영상 배열
  var cache = {};

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

  function loadVideos(apiUrl) {
    if (!apiUrl) apiUrl = currentApi;
    currentApi = apiUrl;

    // 캐시 히트 — 즉시 렌더링
    if (cache[apiUrl]) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'none';
      renderVideos(cache[apiUrl]);
      return;
    }

    if (loadingEl) loadingEl.style.display = '';
    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    gridEl.style.display = 'none';

    fetch(apiUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('YouTube RSS fetch failed');
        return res.text();
      })
      .then(function (xmlText) {
        var items = parseAtomFeed(xmlText);
        cache[apiUrl] = items; // 캐시 저장
        renderVideos(items);
      })
      .catch(function (err) {
        console.warn('영상 로드 실패:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = '';
      });
  }

  // 전역으로 loadVideos 노출 (retry 버튼용)
  window.loadVideos = function () {
    cache = {}; // 리트라이 시 캐시 클리어
    loadVideos(currentApi);
  };

  // === 탭 전환 로직 ===
  var tabsContainer = document.getElementById('channelTabs');
  if (tabsContainer) {
    var tabs = tabsContainer.querySelectorAll('.channel-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        // 활성 탭 전환
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        // 채널 구독 링크 업데이트
        var url = tab.getAttribute('data-url');
        var label = tab.querySelector('.tab-label');
        if (channelSubscribe && url) {
          channelSubscribe.href = url;
        }
        if (channelNameEl && label) {
          channelNameEl.textContent = label.textContent;
        }

        // 영상 로드
        var api = tab.getAttribute('data-api');
        if (api) loadVideos(api);
      });
    });
  }

  // 페이지 로드 시 첫 번째 채널 로드
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { loadVideos('/api/youtube-rss'); });
  } else {
    loadVideos('/api/youtube-rss');
  }
})();
