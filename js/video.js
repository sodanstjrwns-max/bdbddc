/**
 * 서울비디치과 영상 페이지 — 유튜브 멀티 채널 탭
 * 데이터: /data/youtube-cache.json (빌드 시 생성)
 * 채널 1: @BDtube / 쉽디 쉬운 치과이야기
 * 채널 2: @geoptongryung / 치과겁통령
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

  // 캐시 데이터 (전체 JSON)
  var youtubeData = null;
  var currentChannel = 'bdtube';
  // 챕터 데이터 (AI 분석 기반, /data/youtube-chapters.json)
  var chaptersData = {};

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
    if (isNaN(n)) return '';
    if (n >= 10000) return (n / 10000).toFixed(1) + '만회';
    if (n >= 1000) return (n / 1000).toFixed(1) + '천회';
    return n + '회';
  }

  function truncate(text, max) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.substring(0, max) + '...';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderVideos(items) {
    if (!items || !items.length) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      gridEl.style.display = 'none';
      return;
    }

    var html = '';
    items.forEach(function (item) {
      var dateStr = formatDate(item.published);
      var viewStr = formatViews(item.views);
      var desc = truncate(item.description, 100);
      var title = item.title || '';
      // Shorts 감지: 제목이나 설명에 #shorts 있거나, 세로 썸네일
      var isShorts = title.toLowerCase().includes('#shorts') || 
                     (item.description || '').toLowerCase().includes('#shorts');
      var watchUrl = isShorts
        ? 'https://www.youtube.com/shorts/' + item.videoId
        : 'https://www.youtube.com/watch?v=' + item.videoId;

      // 챕터 HTML (있는 영상만)
      var chInfo = chaptersData[item.videoId];
      var chapterHtml = '';
      if (chInfo && chInfo.chapters && chInfo.chapters.length >= 2) {
        chapterHtml = '<div class="video-chapters">'
          + '<div class="video-chapters-title"><i class="fas fa-list-ol"></i> 챕터</div>';
        chInfo.chapters.forEach(function (ch) {
          chapterHtml += '<a href="https://www.youtube.com/watch?v=' + item.videoId + '&t=' + ch.start + 's" target="_blank" rel="noopener" class="video-chapter-item" onclick="event.stopPropagation();">'
            + '<span class="vc-time">' + ch.t + '</span>'
            + '<span class="vc-label">' + escapeHtml(ch.title) + '</span>'
            + '</a>';
        });
        chapterHtml += '</div>';
      }

      html += '<a href="' + watchUrl + '" target="_blank" rel="noopener" class="video-card' + (chapterHtml ? ' has-chapters' : '') + '">'
        + '<div class="video-thumb">'
        + '<img src="' + escapeHtml(item.thumbnail) + '" alt="' + escapeHtml(title) + '" loading="lazy" onerror="this.src=\'https://i.ytimg.com/vi/' + item.videoId + '/mqdefault.jpg\'">'
        + '<div class="video-play"><i class="fas fa-play"></i></div>'
        + (isShorts ? '<span class="video-badge-shorts">Shorts</span>' : '')
        + '</div>'
        + '<div class="video-body">'
        + '<h3 class="video-title">' + escapeHtml(title) + '</h3>'
        + '<div class="video-meta">'
        + '<span><i class="fas fa-calendar-alt"></i> ' + dateStr + '</span>'
        + (viewStr ? '<span><i class="fas fa-eye"></i> ' + viewStr + '</span>' : '')
        + '</div>'
        + (desc ? '<p class="video-desc">' + escapeHtml(desc) + '</p>' : '')
        + chapterHtml
        + '</div>'
        + '</a>';
    });

    gridEl.innerHTML = html;
    gridEl.style.display = '';
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
  }

  function showChannel(channelKey) {
    currentChannel = channelKey;
    if (youtubeData && youtubeData[channelKey]) {
      renderVideos(youtubeData[channelKey].videos);
    } else {
      if (emptyEl) emptyEl.style.display = '';
      gridEl.style.display = 'none';
    }
  }

  function loadData() {
    if (loadingEl) loadingEl.style.display = '';
    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    gridEl.style.display = 'none';

    // 챕터 데이터 병렬 로드 (실패해도 영상 목록은 정상 표시)
    var chaptersPromise = fetch('/data/youtube-chapters.json')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });

    Promise.all([
      fetch('/data/youtube-cache.json?v=' + Date.now()).then(function (res) {
        if (!res.ok) throw new Error('Cache fetch failed: ' + res.status);
        return res.json();
      }),
      chaptersPromise
    ])
      .then(function (results) {
        youtubeData = results[0];
        chaptersData = results[1] || {};
        showChannel(currentChannel);
      })
      .catch(function (err) {
        console.warn('영상 캐시 로드 실패:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = '';
      });
  }

  // 전역으로 loadVideos 노출 (retry 버튼용)
  window.loadVideos = loadData;

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

        // 영상 전환
        var channel = tab.getAttribute('data-channel');
        if (channel) {
          if (youtubeData) {
            showChannel(channel);
          } else {
            currentChannel = channel;
            loadData();
          }
        }
      });
    });
  }

  // 페이지 로드 시 데이터 로드
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }
})();
