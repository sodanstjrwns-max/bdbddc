/* ============================================================
 * CAVITY DEFENSE — 앱 컨트롤러
 * 화면 전환 · HUD · 사운드(WebAudio 신스) · 공유 · 리더보드 · GA4
 * ============================================================ */
(function () {
  'use strict';
  const D = window.CD_DATA;
  const $ = (id) => document.getElementById(id);

  // ---------- GA4 ----------
  window.cdTrack = function (name, params) {
    try { if (typeof gtag === 'function') gtag('event', name, Object.assign({ game: 'cavity_defense' }, params || {})); } catch (e) {}
  };

  // ---------- 로컬 저장 ----------
  const SAVE_KEY = 'cd_save_v1';
  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; }
  }
  function save(patch) {
    const s = Object.assign(loadSave(), patch);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  // ---------- 사운드 (WebAudio 신스 — 파일 0KB) ----------
  let AC = null, muted = true, bgmTimer = null, bgmStep = 0;
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }
  function tone(freq, dur, type, vol, delay, slide) {
    if (muted) return;
    const ctx = ac(); if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol || 0.12, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, vol, delay) {
    if (muted) return;
    const ctx = ac(); if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = vol || 0.08;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2200;
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t0);
  }
  const SFX = {
    build: () => { tone(392, 0.1, 'triangle', 0.14); tone(523, 0.14, 'triangle', 0.14, 0.07); },
    upgrade: () => { tone(523, 0.09, 'triangle', 0.14); tone(659, 0.09, 'triangle', 0.14, 0.07); tone(784, 0.18, 'triangle', 0.15, 0.14); },
    swing: () => { noise(0.06, 0.03); },
    laser: () => { tone(1400, 0.08, 'sawtooth', 0.05, 0, 500); },
    wave: () => { noise(0.3, 0.06); tone(180, 0.3, 'sine', 0.1, 0, 90); },
    pop: () => { tone(700 + Math.random() * 300, 0.06, 'square', 0.05, 0, 300); },
    hit: () => { tone(140, 0.25, 'sawtooth', 0.16, 0, 60); noise(0.15, 0.08); },
    brush: () => { noise(0.5, 0.07); tone(880, 0.4, 'sine', 0.08, 0, 1400); tone(660, 0.4, 'sine', 0.06, 0.1, 1100); },
    bossdown: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.15, i * 0.11)); },
    acid: () => { tone(300, 0.3, 'sawtooth', 0.08, 0, 120); },
    summon: () => { tone(220, 0.2, 'square', 0.08, 0, 440); },
    corrupt: () => { tone(110, 0.5, 'sawtooth', 0.1, 0, 55); },
    click: () => { tone(600, 0.05, 'square', 0.05); }
  };
  function sfx(name) { SFX[name] && SFX[name](); }

  // 로파이 BGM — 잔잔한 아르페지오 루프
  const BGM_NOTES = [261.6, 311.1, 392.0, 466.2, 392.0, 311.1]; // Cm 어게인
  function startBGM() {
    stopBGM();
    if (muted) return;
    bgmTimer = setInterval(() => {
      if (muted) return;
      const n = BGM_NOTES[bgmStep % BGM_NOTES.length];
      tone(n / 2, 0.9, 'sine', 0.035);
      tone(n, 0.5, 'triangle', 0.022, 0.05);
      if (bgmStep % 6 === 0) tone(n / 4, 1.4, 'sine', 0.045);
      bgmStep++;
    }, 620);
  }
  function stopBGM() { if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; } }

  // ---------- 화면 전환 ----------
  const screens = { intro: $('introScreen'), game: $('gameScreen'), result: $('resultScreen') };
  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // ---------- 인트로 별 ----------
  (function stars() {
    const w = $('introStars');
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 2.4 + 's';
      w.appendChild(s);
    }
  })();

  // ---------- 스테이지 카드 ----------
  function renderStages() {
    const sv = loadSave();
    const wrap = $('stageCards');
    wrap.innerHTML = '';
    D.STAGES.forEach((st, i) => {
      const unlocked = i === 0 || (sv['clear' + (i)] === true);
      const best = sv['best' + st.id] || 0;
      const btn = document.createElement('button');
      btn.className = 'stage-card enamel-panel' + (unlocked ? '' : ' locked');
      const emo = ['🍼', '☕', '🦾'][i];
      btn.innerHTML =
        '<span class="stage-emoji">' + emo + '</span>' +
        '<span style="flex:1">' +
          '<span class="stage-name">STAGE ' + st.id + ' · ' + st.name + '</span>' +
          '<div class="stage-sub">' + st.sub + '</div>' +
          (best ? '<div class="stage-best">🏅 최고 점수 ' + best.toLocaleString() + '</div>' : '') +
        '</span>' +
        (unlocked ? (i === 0 && !best ? '<span class="stage-badge">START</span>' : '') : '<span class="stage-lock">🔒</span>');
      btn.addEventListener('click', () => {
        sfx('click');
        if (!unlocked) { alert('이전 스테이지를 클리어하면 열립니다!'); return; }
        startGame(st.id);
      });
      wrap.appendChild(btn);
    });
  }

  // ---------- 게임 인스턴스 관리 ----------
  let game = null, curStage = 1, curResult = null, scoreSubmitted = false;

  function startGame(stageId) {
    curStage = stageId;
    scoreSubmitted = false;
    show('game');
    closeMenus();
    if (game) { game.destroy(); game = null; }
    $('gameMount').innerHTML = '';
    game = new window.CavityDefense({
      mount: $('gameMount'),
      stage: stageId,
      onHUD: updateHUD,
      onToast: showToast,
      onBossIntro: showBossIntro,
      onBuildMenu: openBuildMenu,
      onTowerMenu: openTowerMenu,
      onCloseMenus: closeMenus,
      onGameOver: (r) => finish(r, false),
      onClear: (r) => finish(r, true),
      sfx: sfx
    });
    startBGM();
    window.cdTrack('game_start', { stage: stageId });
  }

  // ---------- HUD ----------
  const hudGold = $('hudGold'), hudLives = $('hudLives'), hudWave = $('hudWave');
  const waveBtn = $('waveBtn'), brushBtn = $('brushBtn'), brushCharge = $('brushCharge'), speedBtn = $('speedBtn');
  function updateHUD(h) {
    hudGold.textContent = h.gold.toLocaleString();
    hudLives.textContent = h.lives;
    hudWave.textContent = 'WAVE ' + h.wave + '/' + h.totalWaves;
    waveBtn.disabled = !h.canStart;
    waveBtn.textContent = h.canStart ? '▶ 웨이브 ' + Math.min(h.wave + 1, h.totalWaves) + ' 시작' : '⚔️ 전투 중...';
    brushCharge.textContent = h.brushCharges;
    brushBtn.disabled = h.brushCharges <= 0 || h.brushActive;
    // 웨이브 사이 + 충전 있음 = 최적 타이밍 펄스
    brushBtn.classList.toggle('pulse', h.brushCharges > 0 && h.canStart && !h.brushActive);
    speedBtn.textContent = 'x' + h.speedMult;
  }
  waveBtn.addEventListener('click', () => { sfx('click'); ac(); game && game.startWave(); });
  brushBtn.addEventListener('click', () => { game && game.useBrushTime(); });
  speedBtn.addEventListener('click', () => { sfx('click'); game && game.toggleSpeed(); });

  // 사운드 토글
  const soundBtn = $('soundBtn');
  soundBtn.addEventListener('click', () => {
    muted = !muted;
    soundBtn.textContent = muted ? '🔇' : '🔊';
    if (!muted) { ac(); startBGM(); sfx('click'); } else stopBGM();
  });

  // ---------- 토스트 ----------
  const toastWrap = $('toastWrap');
  let toastCount = 0;
  function showToast(msg, cls) {
    if (toastCount >= 3) toastWrap.firstChild && toastWrap.firstChild.remove();
    const t = document.createElement('div');
    t.className = 'toast ' + (cls || 'info');
    t.textContent = msg;
    toastWrap.appendChild(t);
    toastCount++;
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => { t.remove(); toastCount--; }, 320);
    }, cls === 'edu' ? 3400 : 2600);
  }

  // ---------- 보스 배너 ----------
  function showBossIntro(boss) {
    $('bbName').textContent = '👿 ' + boss.name;
    $('bbLine').textContent = boss.intro;
    const b = $('bossBanner');
    b.classList.add('show');
    tone(98, 0.7, 'sawtooth', 0.12, 0, 49); tone(98, 0.7, 'sawtooth', 0.12, 0.8, 49); // 심장박동
    setTimeout(() => b.classList.remove('show'), 3200);
  }

  // ---------- 건설 메뉴 ----------
  const buildMenu = $('buildMenu'), bmGrid = $('bmGrid'), bmDesc = $('bmDesc'), bmBuild = $('bmBuild');
  let bmSelected = null;
  function openBuildMenu(info) {
    closeMenus();
    bmSelected = null;
    bmBuild.disabled = true;
    bmDesc.innerHTML = '타워를 선택하세요.';
    bmGrid.innerHTML = '';
    D.TOWER_ORDER.forEach(id => {
      const tw = D.TOWERS[id];
      const cost = tw.levels[0].cost;
      const b = document.createElement('button');
      b.className = 'bm-item';
      b.disabled = info.gold < cost;
      b.innerHTML = '<span class="bm-ico">' + tw.icon + '</span><span class="bm-cost">' + cost + 'G</span>';
      b.addEventListener('click', () => {
        sfx('click');
        bmGrid.querySelectorAll('.bm-item').forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
        bmSelected = id;
        bmBuild.disabled = false;
        bmDesc.innerHTML = '<b>' + tw.icon + ' ' + tw.name + '</b> — ' + tw.desc + '<br><span style="color:#4BAF98">💡 ' + tw.eduTip + '</span>';
        game && game.previewRange(id);
      });
      bmGrid.appendChild(b);
    });
    positionMenu(buildMenu, info.screen);
    buildMenu.classList.add('show');
  }
  bmBuild.addEventListener('click', () => { if (bmSelected && game) game.buildTower(bmSelected); });
  $('bmCancel').addEventListener('click', () => { sfx('click'); game && game.clearSelection(); });

  // ---------- 타워 메뉴 ----------
  const towerMenu = $('towerMenu');
  function openTowerMenu(info) {
    closeMenus();
    $('tmIco').textContent = info.icon;
    $('tmName').textContent = info.name;
    $('tmLv').textContent = 'Lv.' + (info.level + 1) + ' · ' + info.levelName;
    const up = $('tmUp');
    if (info.nextName) {
      up.disabled = info.gold < info.nextCost;
      up.textContent = '⬆ ' + info.nextName + ' (' + info.nextCost + 'G)';
      $('tmDesc').innerHTML = '다음 단계: <b>' + info.nextName + '</b><br>처치 수: ' + info.tower.kills + '마리';
    } else {
      up.disabled = true;
      up.textContent = '최고 단계 ✨';
      $('tmDesc').innerHTML = '최종 진화 완료! 처치 수: <b>' + info.tower.kills + '마리</b>';
    }
    $('tmSell').textContent = '판매 +' + info.sellValue + 'G';
    positionMenu(towerMenu, info.screen);
    towerMenu.classList.add('show');
  }
  $('tmUp').addEventListener('click', () => { game && game.upgradeTower(); });
  $('tmSell').addEventListener('click', () => { sfx('click'); game && game.sellTower(); });

  function positionMenu(menu, sc) {
    const mount = $('gameMount').getBoundingClientRect();
    const W = 308, H = 260;
    let x = sc.x - W / 2;
    let y = sc.y + 34;
    if (y + H > mount.height - 100) y = sc.y - H - 46;
    x = Math.max(8, Math.min(mount.width - W - 8, x));
    y = Math.max(60, y);
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }
  function closeMenus() {
    buildMenu.classList.remove('show');
    towerMenu.classList.remove('show');
  }

  // ---------- 일시정지 ----------
  const pauseModal = $('pauseModal');
  $('pauseBtn').addEventListener('click', () => { sfx('click'); game && game.pause(true); pauseModal.classList.add('show'); });
  $('resumeBtn').addEventListener('click', () => { sfx('click'); pauseModal.classList.remove('show'); game && game.pause(false); });
  $('restartBtn').addEventListener('click', () => { sfx('click'); pauseModal.classList.remove('show'); startGame(curStage); });
  $('quitBtn').addEventListener('click', () => {
    sfx('click'); pauseModal.classList.remove('show');
    if (game) { game.destroy(); game = null; }
    stopBGM(); renderStages(); show('intro');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game) { game.pause(true); pauseModal.classList.add('show'); }
  });

  // ---------- 결과 ----------
  function rankOf(score) {
    let r = D.RANKS[0];
    D.RANKS.forEach(x => { if (score >= x.min) r = x; });
    return r;
  }

  function finish(result, cleared) {
    curResult = result;
    stopBGM();
    closeMenus();
    const C = D.COPY;
    const tooth = $('resTooth'), title = $('resTitle'), body = $('resBody');
    if (cleared) {
      tooth.textContent = '🦷✨'; tooth.className = 'res-tooth win';
      title.textContent = C.clear.title; title.className = 'res-title win';
      body.textContent = '스테이지 ' + result.stage + ' 「' + D.STAGES[result.stage - 1].name + '」 완전 방어 성공!';
      $('resCtaLine').innerHTML = '<b>' + C.clear.body + '</b><br>6개월마다 정기검진이 최고의 방어 타워입니다.';
      $('resCta').textContent = '🦷 비디치과 무료 상담 예약';
      $('resCta').href = '/reservation?utm_source=cavity_defense&utm_medium=game&utm_campaign=clear';
      sfx('bossdown');
      // 진행 저장
      const patch = {}; patch['clear' + result.stage] = true;
      save(patch);
    } else {
      tooth.textContent = '🦷💥'; tooth.className = 'res-tooth broken';
      title.textContent = C.gameOver.title; title.className = 'res-title lose';
      body.textContent = '웨이브 ' + result.wave + '에서 방어선이 무너졌습니다.';
      $('resCtaLine').innerHTML = '<b>게임은 다시 시작할 수 있지만,<br>실제 치아는 리셋이 없습니다.</b><br>초기 충치는 통증이 없습니다 — 보이기 전에 확인하세요.';
      $('resCta').textContent = '🦷 ' + C.gameOver.cta + ' → 검진 예약';
      $('resCta').href = '/reservation?utm_source=cavity_defense&utm_medium=game&utm_campaign=gameover';
      sfx('hit');
    }
    // 최고점 저장
    const sv = loadSave();
    if (result.score > (sv['best' + result.stage] || 0)) {
      const p = {}; p['best' + result.stage] = result.score; save(p);
    }
    $('rsScore').textContent = result.score.toLocaleString();
    $('rsWave').textContent = result.wave + '/' + result.totalWaves;
    $('rsKill').textContent = result.kills.toLocaleString();
    const rk = rankOf(result.score);
    $('rrName').textContent = rk.icon + ' ' + rk.name;
    $('rrPct').textContent = '점수 등록하면 상위 % 를 알려드립니다';
    // 닉네임 UI 리셋
    $('nickRow').style.display = 'flex';
    $('nickInput').value = (loadSave().nick || '');
    $('nickSubmit').disabled = false;
    $('nickSubmit').textContent = '등록';
    show('result');
    loadLeaderboard();
    window.cdTrack(cleared ? 'stage_clear' : 'game_over', {
      stage: result.stage, wave: result.wave, score: result.score, play_seconds: result.playSeconds
    });
    if (game) { game.destroy(); game = null; }
  }

  // ---------- 리더보드 ----------
  async function loadLeaderboard(myId) {
    const list = $('lbList');
    try {
      const res = await fetch('/api/cavity-defense/leaderboard');
      const data = await res.json();
      if (!data.scores || !data.scores.length) {
        list.innerHTML = '<div class="lb-row"><span class="lb-nick">아직 기록이 없습니다. 첫 수호자가 되어보세요!</span></div>';
        return;
      }
      list.innerHTML = data.scores.slice(0, 10).map((s, i) =>
        '<div class="lb-row' + (myId && s.id === myId ? ' me' : '') + '">' +
          '<span class="lb-no">' + (i + 1) + '</span>' +
          '<span class="lb-nick">' + escapeHtml(s.nickname) + ' <small style="opacity:.5">S' + s.stage + '</small></span>' +
          '<span class="lb-score">' + Number(s.score).toLocaleString() + '</span>' +
        '</div>').join('');
    } catch (e) {
      list.innerHTML = '<div class="lb-row"><span class="lb-nick">랭킹을 불러오지 못했습니다.</span></div>';
    }
  }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  $('nickSubmit').addEventListener('click', async () => {
    if (!curResult || scoreSubmitted) return;
    const nick = $('nickInput').value.trim().slice(0, 10) || '익명의 수호자';
    save({ nick });
    $('nickSubmit').disabled = true;
    $('nickSubmit').textContent = '등록 중...';
    try {
      const res = await fetch('/api/cavity-defense/score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nick, score: curResult.score, stage: curResult.stage,
          wave: curResult.wave, cleared: curResult.cleared,
          rank_name: rankOf(curResult.score).name
        })
      });
      const data = await res.json();
      if (data.success) {
        scoreSubmitted = true;
        $('nickSubmit').textContent = '완료 ✓';
        $('rrPct').textContent = '전체 ' + data.total_players.toLocaleString() + '명 중 상위 ' + data.top_percent + '%';
        loadLeaderboard(data.id);
      } else throw new Error();
    } catch (e) {
      $('nickSubmit').disabled = false;
      $('nickSubmit').textContent = '재시도';
    }
  });

  // ---------- 공유 ----------
  function shareText() {
    const r = curResult || { score: 0, wave: 0 };
    const rk = rankOf(r.score);
    return '🦷⚔️ 충치 디펜스 — ' + r.score.toLocaleString() + '점 · ' + rk.icon + ' ' + rk.name + ' 달성!\n입속 전장, 너도 지켜볼래?';
  }
  $('shareKakao').addEventListener('click', () => {
    window.cdTrack('share_click', { channel: 'kakao' });
    try {
      if (!Kakao.isInitialized()) Kakao.init('c5e7b6f82aaa722b63b2fb6e42cec872');
      const r = curResult || { score: 0 };
      const rk = rankOf(r.score);
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '🦷⚔️ 충치 디펜스 — ' + r.score.toLocaleString() + '점!',
          description: rk.icon + ' ' + rk.name + ' 달성! 입속은 전장이다. 너도 어금니 고지를 지켜봐.',
          imageUrl: 'https://bdbddc.com/images/og/reservation.jpg?v=cd1',
          link: { mobileWebUrl: 'https://bdbddc.com/game/cavity-defense', webUrl: 'https://bdbddc.com/game/cavity-defense' }
        },
        buttons: [{ title: '나도 방어하기', link: { mobileWebUrl: 'https://bdbddc.com/game/cavity-defense', webUrl: 'https://bdbddc.com/game/cavity-defense' } }]
      });
    } catch (e) { fallbackShare(); }
  });
  $('shareEtc').addEventListener('click', () => {
    window.cdTrack('share_click', { channel: 'native' });
    fallbackShare();
  });
  function fallbackShare() {
    const text = shareText();
    if (navigator.share) {
      navigator.share({ title: '충치 디펜스', text, url: 'https://bdbddc.com/game/cavity-defense' }).catch(() => {});
    } else {
      navigator.clipboard && navigator.clipboard.writeText(text + '\nhttps://bdbddc.com/game/cavity-defense')
        .then(() => alert('결과가 복사되었습니다! 붙여넣기로 공유하세요.'));
    }
  }

  // CTA 계측
  $('resCta').addEventListener('click', () => {
    window.cdTrack('cta_reservation_click', { from: curResult && curResult.cleared ? 'clear' : 'gameover' });
  });

  // ---------- 결과 버튼 ----------
  $('retryBtn').addEventListener('click', () => { sfx('click'); startGame(curStage); });
  $('homeBtn').addEventListener('click', () => { sfx('click'); renderStages(); show('intro'); });

  // ---------- 하우투 ----------
  $('howtoBtn').addEventListener('click', () => { sfx('click'); $('howtoModal').classList.add('show'); });
  $('howtoClose').addEventListener('click', () => { sfx('click'); $('howtoModal').classList.remove('show'); });

  // ---------- 부팅 ----------
  function boot() {
    const fill = $('loadFill');
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(100, p + 18 + Math.random() * 20);
      fill.style.width = p + '%';
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          $('loading').style.display = 'none';
          renderStages();
          show('intro');
        }, 250);
      }
    }, 110);
  }
  if (window.PIXI) boot();
  else window.addEventListener('load', boot);

  // ---------- 자동 테스트 훅 (?cd_test=1) ----------
  if (/[?&]cd_test=1/.test(location.search)) {
    window.addEventListener('error', (e) => console.log('[CD_TEST] ERROR: ' + e.message));
    setTimeout(() => {
      console.log('[CD_TEST] starting stage 1');
      try {
        startGame(1);
        setTimeout(() => {
          try {
            game.startWave();
            console.log('[CD_TEST] wave started, state=' + game.getState());
          } catch (e) { console.log('[CD_TEST] wave ERROR: ' + e.message); }
        }, 2500);
        let n = 0;
        const iv = setInterval(() => {
          n += 5;
          const st = game ? game.getState() : 'destroyed';
          console.log('[CD_TEST] t+' + n + 's state=' + st + ' wave=' + hudWave.textContent + ' lives=' + hudLives.textContent);
          // BETWEEN이면 즉시 다음 웨이브 (타워 없이 빠른 게임오버 유도)
          if (game && st === 2) game.startWave();
          if (!game || st === 3 || st === 4 || n > 90) {
            console.log('[CD_TEST] FINISHED — final state=' + st + ' resultShown=' + screens.result.classList.contains('active'));
            clearInterval(iv);
          }
        }, 5000);
      } catch (e) { console.log('[CD_TEST] start ERROR: ' + e.message); }
    }, 2200);
  }
})();
