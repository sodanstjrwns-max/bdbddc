/* ============================================================
 * CAVITY DEFENSE — 게임 엔진 (PixiJS v8)
 * 경로 이동 · 타워 전투 · 웨이브 · 양치 타임 · 이코노미 · 보스 기믹
 * ============================================================ */
(function () {
  'use strict';
  const D = () => window.CD_DATA;
  const A = () => window.CD_ART;

  const GameState = { READY: 0, WAVE: 1, BETWEEN: 2, OVER: 3, CLEAR: 4, PAUSED: 5 };

  function CavityDefense(opts) {
    // opts: { mount, stage, onGameOver, onClear, onHUD, onToast, onBossIntro, sfx }
    const self = this;
    const DATA = D(), ART = A();
    const stageDef = DATA.STAGES[opts.stage - 1];
    const waves = DATA.buildWaves(opts.stage);
    const TOTAL_WAVES = waves.length;

    // ---------- 논리 해상도 (세로 모바일 퍼스트) ----------
    const mountEl = opts.mount;
    const mw = mountEl.clientWidth, mh = mountEl.clientHeight;
    const LW = 420;
    const LH = Math.max(640, Math.min(920, LW * (mh / Math.max(1, mw))));

    // ---------- 상태 ----------
    let state = GameState.READY;
    let gold = stageDef.gold;
    let lives = stageDef.lives;
    let waveIdx = 0;             // 0-based, 표시 +1
    let score = 0;
    let speedMult = 1;
    let elapsed = 0;
    let playSeconds = 0;
    let brushCharges = 1;
    let brushProgress = 0;       // 웨이브 단위 충전
    let brushActive = 0;         // 남은 지속시간
    let killCount = 0;
    let destroyed = false;

    const enemies = [];
    const towers = [];
    const bullets = [];
    const corrodeZones = [];     // {x,y,r,life,g}
    const spawnQueue = [];       // {type, at(초), pathIdx}
    let waveTimer = 0, spawning = false;
    let selectedSpot = null, selectedTower = null, buildType = null;

    // ---------- PIXI 초기화 ----------
    const app = new PIXI.Application();
    let ready = app.init({
      width: mw, height: mh,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      autoDensity: true
    }).then(() => {
      mountEl.appendChild(app.canvas);
      setup();
    });

    const world = new PIXI.Container();
    let bg, ambient, particles, castle, paths = [], spots = [];
    const layers = {};

    function setup() {
      const scale = Math.min(mw / LW, mh / LH);
      world.scale.set(scale);
      world.x = (mw - LW * scale) / 2;
      world.y = (mh - LH * scale) / 2;
      app.stage.addChild(world);

      bg = ART.buildBackground(app, stageDef.theme, LW, LH);
      world.addChild(bg.container);

      layers.path = new PIXI.Container();
      layers.zone = new PIXI.Container();
      layers.spot = new PIXI.Container();
      layers.unit = new PIXI.Container();   // 타워+적 (y-sort)
      layers.fx = new PIXI.Container();
      layers.ui = new PIXI.Container();
      world.addChild(layers.path, layers.zone, layers.spot, layers.unit, layers.fx, layers.ui);

      // 경로
      stageDef.paths.forEach(pd => {
        const p = ART.buildPath(pd, LW, LH);
        layers.path.addChild(p.container);
        paths.push(p);
      });

      // 성채 — 모든 경로의 종점(하단 중앙)
      const end = paths[0].at(paths[0].total);
      castle = ART.buildCastle(end.x, end.y - 8);
      layers.unit.addChild(castle.container);

      // 설치 지점
      stageDef.spots.forEach((sp, i) => {
        const m = ART.buildSpot(sp[0] * LW, sp[1] * LH);
        m.eventMode = 'static'; m.cursor = 'pointer';
        m._idx = i; m._occupied = false; m._corrupted = false;
        m.on('pointertap', () => onSpotTap(m));
        // 터치 히트영역 확대
        m.hitArea = new PIXI.Circle(0, 0, 30);
        layers.spot.addChild(m);
        spots.push(m);
      });

      particles = ART.buildParticles(layers.fx);

      // 앰비언트 & 비네트
      const av = ART.buildAmbient(LW, LH);
      ambient = av.amb;
      world.addChild(ambient, av.vig);

      // 사거리 미리보기
      rangeG = new PIXI.Graphics();
      layers.ui.addChild(rangeG);

      // 배경 탭 → 선택 해제
      const bgHit = new PIXI.Graphics();
      bgHit.rect(0, 0, LW, LH).fill({ color: 0xffffff, alpha: 0.001 });
      bgHit.eventMode = 'static';
      bgHit.on('pointertap', () => { clearSelection(); });
      world.addChildAt(bgHit, 1);

      app.ticker.add(tick);
      pushHUD();
    }

    let rangeG = null;

    // ---------- HUD 브릿지 ----------
    function pushHUD() {
      opts.onHUD && opts.onHUD({
        gold: Math.floor(gold), lives, wave: Math.min(waveIdx + (state === GameState.WAVE ? 1 : 0), TOTAL_WAVES),
        totalWaves: TOTAL_WAVES, score: Math.floor(score),
        brushCharges, brushProgress, brushActive: brushActive > 0,
        state, speedMult,
        canStart: state === GameState.READY || state === GameState.BETWEEN
      });
    }
    function toast(msg, cls) { opts.onToast && opts.onToast(msg, cls); }

    // ---------- 웨이브 ----------
    function startWave() {
      if (state !== GameState.READY && state !== GameState.BETWEEN) return;
      if (waveIdx >= TOTAL_WAVES) return;
      state = GameState.WAVE;
      spawning = true;
      waveTimer = 0;
      spawnQueue.length = 0;
      const groups = waves[waveIdx];
      let hasBoss = false, hasCalculus = false, hasNinja = false, hasBat = false;
      groups.forEach(gr => {
        const [type, count, interval, delay] = gr;
        const def = DATA.ENEMIES[type] || DATA.BOSSES[type];
        if (def && def.boss) hasBoss = true;
        if (type === 'calculus') hasCalculus = true;
        if (type === 'ninja') hasNinja = true;
        if (type === 'bat') hasBat = true;
        for (let i = 0; i < count; i++) {
          spawnQueue.push({ type, at: (delay || 0) + i * interval, pathIdx: i % paths.length });
        }
      });
      spawnQueue.sort((a, b) => a.at - b.at);
      // 경고 카피
      const C = DATA.COPY;
      if (hasBoss) {
        const bossType = groups.map(g => g[0]).find(t => DATA.BOSSES[t]);
        if (bossType) opts.onBossIntro && opts.onBossIntro(DATA.BOSSES[bossType]);
      } else if (hasCalculus && waveIdx > 0 && !self._calcWarned) {
        self._calcWarned = true; toast(C.calculusWarn, 'warn');
      } else if (hasNinja && !self._ninjaWarned) {
        self._ninjaWarned = true; toast('치간 닌자 출현! 치실·검진 타워만 감지할 수 있습니다.', 'warn');
      } else if (hasBat && !self._batWarned) {
        self._batWarned = true; toast('야식 박쥐가 날아옵니다! 칫솔 근접 공격이 닿지 않습니다.', 'warn');
      } else {
        toast(C.waveWarn[Math.min(Math.floor(waveIdx / 4), C.waveWarn.length - 1)], 'info');
      }
      window.cdTrack && window.cdTrack('wave_start', { stage: opts.stage, wave: waveIdx + 1 });
      pushHUD();
    }

    function endWave() {
      waveIdx++;
      score += 120 + waveIdx * 22;
      gold += 55 + waveIdx * 7;
      killGoldTick();
      // 양치 타임 충전
      brushProgress++;
      if (brushProgress >= DATA.BRUSH_TIME.chargeWaves && brushCharges < DATA.BRUSH_TIME.maxCharges) {
        brushProgress = 0; brushCharges++;
        toast('🪥 양치 타임 충전 완료! ' + DATA.BRUSH_TIME.hint, 'good');
      }
      window.cdTrack && window.cdTrack('wave_clear', { stage: opts.stage, wave: waveIdx, gold: Math.floor(gold) });
      if (waveIdx >= TOTAL_WAVES) {
        state = GameState.CLEAR;
        score += lives * 300;
        setTimeout(() => opts.onClear && opts.onClear(collectResult()), 900);
      } else {
        state = GameState.BETWEEN;
        toast(`웨이브 ${waveIdx}/${TOTAL_WAVES} 클리어! +${55 + waveIdx * 7}G`, 'good');
        // 자동 진행 (5초 후) — 수동 시작도 가능
        autoNextTimer = 5;
      }
      pushHUD();
    }
    let autoNextTimer = 0;
    function killGoldTick() {}

    // ---------- 적 스폰 ----------
    function spawnEnemy(type, pathIdx, fromBoss) {
      const def = DATA.ENEMIES[type] || DATA.BOSSES[type];
      if (!def) return;
      const sc = DATA.enemyScale(opts.stage, waveIdx + 1);
      const spr = ART.buildEnemy(def);
      const e = {
        def, spr: spr.container, body: spr.body, hpBg: spr.hpBg, hpBar: spr.hpBar,
        hp: def.hp * sc.hp * (fromBoss ? 0.55 : 1),
        maxHp: def.hp * sc.hp * (fromBoss ? 0.55 : 1),
        speed: def.speed * sc.speed,
        baseSpeed: def.speed * sc.speed,
        dist: 0, path: paths[pathIdx % paths.length],
        gold: Math.round(def.gold * sc.gold),
        slow: 0, slowT: 0, alive: true,
        shootCd: def.shooter ? 1.2 : 0,
        skillCd: def.boss ? 3 : 0,
        wob: Math.random() * 6.28
      };
      const st = e.path.at(0);
      e.spr.x = st.x; e.spr.y = st.y;
      layers.unit.addChild(e.spr);
      enemies.push(e);
    }

    // ---------- 타워 ----------
    function onSpotTap(m) {
      if (state === GameState.OVER || state === GameState.CLEAR) return;
      if (m._corrupted) { toast('치주염에 잠식된 타일입니다!', 'warn'); return; }
      if (m._occupied) {
        // 타워 선택 → 업그레이드 패널
        const t = towers.find(t => t.spot === m);
        if (t) selectTower(t);
        return;
      }
      selectedTower = null;
      selectedSpot = m;
      opts.onBuildMenu && opts.onBuildMenu({
        x: m.x, y: m.y, gold: Math.floor(gold),
        screen: worldToScreen(m.x, m.y)
      });
      drawRange(null);
    }

    function worldToScreen(x, y) {
      const s = world.scale.x;
      return { x: world.x + x * s, y: world.y + y * s, scale: s };
    }

    function buildTower(typeId) {
      if (!selectedSpot) return false;
      const def = DATA.TOWERS[typeId];
      const cost = def.levels[0].cost;
      if (gold < cost) { toast('골드가 부족합니다!', 'warn'); return false; }
      gold -= cost;
      const spr = ART.buildTower(typeId, 0);
      spr.container.x = selectedSpot.x; spr.container.y = selectedSpot.y;
      layers.unit.addChild(spr.container);
      const t = {
        def, typeId, level: 0, spr: spr.container, anim: spr.anim, body: spr.body,
        spot: selectedSpot, cd: 0, incomeCd: def.levels[0].rate || 5,
        stunned: 0, kills: 0
      };
      selectedSpot._occupied = true;
      towers.push(t);
      particles.spawn(t.spr.x, t.spr.y - 10, { count: 12, color: [0x7BD8C2, 0xFFFFFF], speed: 90, life: 0.5, up: 60 });
      sfx('build');
      toast(`${def.name} 배치! — ${def.eduTip}`, 'edu');
      clearSelection();
      pushHUD();
      return true;
    }

    function selectTower(t) {
      selectedTower = t; selectedSpot = null;
      const lv = t.def.levels[t.level];
      const next = t.def.levels[t.level + 1];
      drawRange(t);
      opts.onTowerMenu && opts.onTowerMenu({
        tower: t, name: t.def.name, icon: t.def.icon,
        levelName: lv.name, level: t.level,
        nextName: next ? next.name : null, nextCost: next ? next.cost : null,
        sellValue: sellValue(t), gold: Math.floor(gold),
        screen: worldToScreen(t.spr.x, t.spr.y)
      });
    }

    function sellValue(t) {
      let v = 0;
      for (let i = 0; i <= t.level; i++) v += t.def.levels[i].cost;
      return Math.floor(v * 0.6);
    }

    function upgradeTower() {
      const t = selectedTower;
      if (!t) return;
      const next = t.def.levels[t.level + 1];
      if (!next) return;
      if (gold < next.cost) { toast('골드가 부족합니다!', 'warn'); return; }
      gold -= next.cost;
      t.level++;
      // 스프라이트 재생성
      layers.unit.removeChild(t.spr);
      const spr = ART.buildTower(t.typeId, t.level);
      spr.container.x = t.spot.x; spr.container.y = t.spot.y;
      layers.unit.addChild(spr.container);
      t.spr = spr.container; t.anim = spr.anim; t.body = spr.body;
      particles.spawn(t.spr.x, t.spr.y - 14, { count: 16, color: [0xFFC24B, 0xFFFFFF, 0x7BD8C2], speed: 110, life: 0.6, up: 80 });
      sfx('upgrade');
      selectTower(t);
      pushHUD();
    }

    function sellTower() {
      const t = selectedTower;
      if (!t) return;
      gold += sellValue(t);
      t.spot._occupied = false;
      layers.unit.removeChild(t.spr);
      towers.splice(towers.indexOf(t), 1);
      particles.spawn(t.spr.x, t.spr.y, { count: 10, color: 0xFFC24B, speed: 70, life: 0.5 });
      clearSelection();
      pushHUD();
    }

    function clearSelection() {
      selectedSpot = null; selectedTower = null; buildType = null;
      drawRange(null);
      opts.onCloseMenus && opts.onCloseMenus();
    }

    function drawRange(t) {
      rangeG.clear();
      if (!t) return;
      const lv = t.def.levels[t.level];
      if (lv.range >= 999) return;
      rangeG.circle(t.spr.x, t.spr.y, lv.range).fill({ color: 0x7BD8C2, alpha: 0.10 });
      rangeG.circle(t.spr.x, t.spr.y, lv.range).stroke({ width: 1.6, color: 0x7BD8C2, alpha: 0.55 });
    }
    // 건설 메뉴에서 미리보기
    function previewRange(typeId) {
      rangeG.clear();
      if (!selectedSpot || !typeId) return;
      const lv = DATA.TOWERS[typeId].levels[0];
      if (lv.range >= 999) return;
      rangeG.circle(selectedSpot.x, selectedSpot.y, lv.range).fill({ color: 0x7BD8C2, alpha: 0.10 });
      rangeG.circle(selectedSpot.x, selectedSpot.y, lv.range).stroke({ width: 1.6, color: 0x7BD8C2, alpha: 0.55 });
    }

    // ---------- 양치 타임 ----------
    function useBrushTime() {
      if (brushCharges <= 0 || brushActive > 0) return;
      brushCharges--;
      brushActive = DATA.BRUSH_TIME.duration;
      const full = (state !== GameState.WAVE); // 웨이브 사이 = 식후 양치 = 풀효율
      self._brushDmg = full ? DATA.BRUSH_TIME.dmgFull : DATA.BRUSH_TIME.dmgHalf;
      self._brushWavePos = 0;
      toast(full ? '🪥 완벽한 타이밍! 식후 양치 — 풀 파워 클렌징!' : '🪥 양치 타임! (전투 중 발동 — 효율 반감)', full ? 'good' : 'info');
      // 부식 장판 제거
      corrodeZones.forEach(z => { z.life = 0; });
      sfx('brush');
      window.cdTrack && window.cdTrack('brush_time', { stage: opts.stage, wave: waveIdx + 1, full: full ? 1 : 0 });
      pushHUD();
    }

    // ---------- 총알 ----------
    function fireBullet(t, target, lv) {
      const kind = t.def.type;
      if (kind === 'melee') {
        // 즉시 광역 스윙
        t.anim.spin && swing(t);
        enemies.forEach(e => {
          if (!e.alive || e.def.flying) return;
          if (dist2(t.spr, e.spr) <= lv.range * lv.range) damageEnemy(e, lv.dmg, t);
        });
        particles.spawn(t.spr.x, t.spr.y - 26, { count: 5, color: [0x7BD8C2, 0xFFFFFF], speed: 120, life: 0.3, gravity: 60, up: 10 });
        sfx('swing');
      } else if (kind === 'snipe') {
        // 레이저 라인
        const line = new PIXI.Graphics();
        line.moveTo(t.spr.x, t.spr.y - 34).lineTo(target.spr.x, target.spr.y)
          .stroke({ width: 3, color: 0xFFFFFF, alpha: 0.95, cap: 'round' });
        line.moveTo(t.spr.x, t.spr.y - 34).lineTo(target.spr.x, target.spr.y)
          .stroke({ width: 7, color: 0x7BD8C2, alpha: 0.35, cap: 'round' });
        layers.fx.addChild(line);
        bullets.push({ fx: line, life: 0.12, type: 'laser' });
        damageEnemy(target, lv.dmg, t);
        // 관통
        if (lv.pierce) {
          let hit = 1;
          const dx = target.spr.x - t.spr.x, dy = target.spr.y - t.spr.y;
          enemies.forEach(e => {
            if (hit >= lv.pierce + 1 || !e.alive || e === target) return;
            const ex = e.spr.x - t.spr.x, ey = e.spr.y - t.spr.y;
            const dot = (ex * dx + ey * dy) / (dx * dx + dy * dy);
            if (dot > 0 && dot < 1.4) {
              const px = t.spr.x + dx * dot, py = t.spr.y + dy * dot;
              if ((e.spr.x - px) ** 2 + (e.spr.y - py) ** 2 < 500) { damageEnemy(e, lv.dmg * 0.7, t); hit++; }
            }
          });
        }
        particles.spawn(target.spr.x, target.spr.y, { count: 4, color: 0xFFFFFF, speed: 60, life: 0.3 });
        sfx('laser');
      } else if (kind === 'nova') {
        // 파도 링
        const ring = new PIXI.Graphics();
        ring.circle(0, 0, 10).stroke({ width: 6, color: 0x7BC8D8, alpha: 0.9 });
        ring.x = t.spr.x; ring.y = t.spr.y;
        layers.fx.addChild(ring);
        bullets.push({ fx: ring, life: 0.4, type: 'nova', maxR: lv.range, t, lv });
        enemies.forEach(e => {
          if (!e.alive) return;
          if (dist2(t.spr, e.spr) <= lv.range * lv.range) {
            const dmg = e.def.weakToNova ? lv.dmg * lv.vsArmor : lv.dmg;
            damageEnemy(e, dmg, t, true); // 노바는 방어 무시 배율
            // 넉백
            const kb = e.def.boss ? 0 : 26;
            e.dist = Math.max(0, e.dist - kb);
          }
        });
        particles.spawn(t.spr.x, t.spr.y - 20, { count: 14, color: [0x7BC8D8, 0xFFFFFF, 0xA8DDF0], speed: 140, life: 0.55, up: 40 });
        sfx('wave');
      }
    }
    function swing(t) {
      if (!t.anim.spin) return;
      t._swingT = 0.3;
    }

    // ---------- 데미지 ----------
    function damageEnemy(e, dmg, t, ignoreArmor) {
      if (!e.alive) return;
      const armor = ignoreArmor ? 0 : (e.def.armor || 0);
      const real = Math.max(1, dmg - armor);
      e.hp -= real;
      e.hpBg.visible = e.hpBar.visible = true;
      // HP바 갱신
      const r = Math.max(0, e.hp / e.maxHp);
      e.hpBar.clear();
      e.hpBar.roundRect(e.spr._hpX, e.spr._hpY, e.spr._hpW * r, 5, 2.5)
        .fill(r > 0.5 ? 0x6BD86B : r > 0.25 ? 0xFFC24B : 0xE85D5D);
      // 히트 플래시
      e.body.tint = 0xFF9999;
      e._flashT = 0.08;
      if (e.hp <= 0) killEnemy(e, t);
    }

    function killEnemy(e, t) {
      e.alive = false;
      killCount++;
      if (t) t.kills++;
      gold += e.gold;
      score += e.gold * 6 + (e.def.boss ? 1500 : 0);
      // 사망 파티클
      const cols = e.def.id === 'sugar' ? [0xFFF6DC, 0xFFD34D, 0xFFFFFF]
        : e.def.id === 'calculus' ? [0xB8B09A, 0x8A8F98]
        : [0x6B4E8E, 0x9B7EC8, 0xFFFFFF];
      particles.spawn(e.spr.x, e.spr.y, {
        count: e.def.boss ? 40 : 10, color: cols,
        speed: e.def.boss ? 200 : 110, life: e.def.boss ? 1.0 : 0.55, size: e.def.boss ? 1.6 : 1
      });
      // 골드 팝
      spawnGoldPop(e.spr.x, e.spr.y, e.gold);
      // 플라그 탱커 → 부식 장판
      if (e.def.corrodeOnDeath) spawnCorrode(e.spr.x, e.spr.y);
      if (e.def.boss) {
        toast(DATA.COPY.bossClear[Math.floor(Math.random() * DATA.COPY.bossClear.length)], 'good');
        sfx('bossdown');
        if (self._nightPulse) self._nightPulse = 0;
      } else {
        sfx('pop');
      }
      layers.unit.removeChild(e.spr);
      pushHUD();
    }

    function spawnGoldPop(x, y, amount) {
      const txt = new PIXI.Text({
        text: '+' + amount + 'G',
        style: { fontFamily: 'Arial', fontSize: 13, fontWeight: '900', fill: 0xFFC24B, stroke: { color: 0x4A3200, width: 3 } }
      });
      txt.anchor.set(0.5); txt.x = x; txt.y = y - 16;
      layers.fx.addChild(txt);
      bullets.push({ fx: txt, life: 0.8, type: 'pop' });
    }

    function spawnCorrode(x, y) {
      const g = new PIXI.Graphics();
      g.ellipse(0, 0, 30, 14).fill({ color: 0x6B4E8E, alpha: 0.4 });
      g.ellipse(0, 0, 22, 9).fill({ color: 0x4A3563, alpha: 0.5 });
      g.x = x; g.y = y;
      layers.zone.addChild(g);
      corrodeZones.push({ x, y, r: 34, life: 8, g });
    }

    // ---------- 보스 스킬 ----------
    function bossSkill(e) {
      const sk = e.def.skill;
      if (sk === 'acidRain') {
        // 무작위 타워 1개 마비 + 산성비 파티클
        const alive = towers.filter(t => t.stunned <= 0);
        if (alive.length) {
          const t = alive[Math.floor(Math.random() * alive.length)];
          t.stunned = 3.2;
          t.body.tint = 0x9BC53D;
          particles.spawn(t.spr.x, t.spr.y - 30, { count: 14, color: [0x9BC53D, 0x6B8E23], speed: 60, life: 0.8, gravity: 300, up: -40 });
          toast('☔ 산성비! 타워가 침식되어 잠시 마비됩니다!', 'warn');
          sfx('acid');
        }
      } else if (sk === 'summon') {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => { if (!destroyed && e.alive) spawnEnemy('mutans', Math.floor(Math.random() * paths.length), true); }, i * 350);
        }
        particles.spawn(e.spr.x, e.spr.y, { count: 12, color: [0x8E44AD, 0xFFD34D], speed: 120, life: 0.6 });
        self._nightPulse = 1;
        sfx('summon');
      } else if (sk === 'corrupt') {
        // 미점유 타일 1개 잠식
        const free = spots.filter(s => !s._occupied && !s._corrupted);
        if (free.length) {
          const s = free[Math.floor(Math.random() * free.length)];
          s._corrupted = true;
          const cg = new PIXI.Graphics();
          cg.ellipse(0, 0, 24, 11).fill({ color: 0x2E4053, alpha: 0.75 });
          cg.ellipse(0, 0, 24, 11).stroke({ width: 2, color: 0x9BC53D, alpha: 0.6 });
          s.addChild(cg);
          toast('🦠 치주염이 타일을 잠식했습니다! 설치 지점이 줄어듭니다!', 'warn');
          sfx('corrupt');
        }
      }
    }

    // ---------- 유틸 ----------
    function dist2(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; }
    function sfx(name) { opts.sfx && opts.sfx(name); }

    // ---------- 메인 루프 ----------
    function tick(ticker) {
      if (destroyed) return;
      const rawDt = Math.min(0.05, ticker.deltaMS / 1000);
      const dt = rawDt * speedMult;
      elapsed += dt;
      if (state === GameState.WAVE || state === GameState.BETWEEN) playSeconds += rawDt;
      bg.tick(elapsed);
      castle.tick(elapsed);
      particles.tick(dt);

      // 앰비언트 라이팅 (웨이브 진행 → 시간대)
      let amb = waveIdx / TOTAL_WAVES;
      if (self._nightPulse) amb = Math.min(1, amb + 0.35);
      ART.setAmbient(ambient, amb);

      if (state === GameState.PAUSED || state === GameState.OVER || state === GameState.CLEAR) return;

      // BETWEEN 자동 진행
      if (state === GameState.BETWEEN && autoNextTimer > 0) {
        autoNextTimer -= dt;
        if (autoNextTimer <= 0) startWave();
      }

      // 스폰
      if (spawning) {
        waveTimer += dt;
        while (spawnQueue.length && spawnQueue[0].at <= waveTimer) {
          const s = spawnQueue.shift();
          spawnEnemy(s.type, s.pathIdx);
        }
        if (!spawnQueue.length) spawning = false;
      }

      // 양치 타임
      if (brushActive > 0) {
        brushActive -= dt;
        self._brushWavePos += dt * (LH / DATA.BRUSH_TIME.duration) * 1.15;
        // 파도 라인 시각화
        if (!self._brushG) {
          self._brushG = new PIXI.Graphics();
          layers.fx.addChild(self._brushG);
        }
        const bw = self._brushG;
        bw.clear();
        const wy = -40 + self._brushWavePos;
        bw.moveTo(0, wy);
        for (let x = 0; x <= LW; x += 16) bw.lineTo(x, wy + Math.sin(x * 0.05 + elapsed * 8) * 8);
        bw.stroke({ width: 26, color: 0x7BD8C2, alpha: 0.5, cap: 'round' });
        bw.moveTo(0, wy - 8);
        for (let x = 0; x <= LW; x += 16) bw.lineTo(x, wy - 8 + Math.sin(x * 0.05 + elapsed * 8) * 8);
        bw.stroke({ width: 8, color: 0xFFFFFF, alpha: 0.7, cap: 'round' });
        // 파도에 닿은 적 피해
        enemies.forEach(e => {
          if (!e.alive || e._brushed) return;
          if (Math.abs(e.spr.y - wy) < 30) {
            e._brushed = true;
            damageEnemy(e, self._brushDmg, null, true);
            particles.spawn(e.spr.x, e.spr.y, { count: 8, color: [0x7BD8C2, 0xFFFFFF], speed: 100, life: 0.5 });
          }
        });
        if (brushActive <= 0) {
          layers.fx.removeChild(self._brushG); self._brushG = null;
          enemies.forEach(e => { e._brushed = false; });
          pushHUD();
        }
      }

      // 적 이동
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e.alive) { enemies.splice(i, 1); continue; }
        // 슬로우 (불소 장판)
        let slowF = 1;
        towers.forEach(t => {
          if (t.def.type !== 'aura' || t.stunned > 0) return;
          const lv = t.def.levels[t.level];
          if (dist2(t.spr, e.spr) <= lv.range * lv.range) slowF = Math.min(slowF, 1 - lv.slow);
        });
        e.speed = e.baseSpeed * slowF;
        // 히트 플래시 복구
        if (e._flashT > 0) { e._flashT -= dt; if (e._flashT <= 0) e.body.tint = 0xFFFFFF; }
        // 보스 스킬
        if (e.def.boss) {
          e.skillCd -= dt;
          if (e.skillCd <= 0) { e.skillCd = e.def.skillRate; bossSkill(e); }
          if (e.spr._aura) e.spr._aura.scale.set(1 + Math.sin(elapsed * 3) * 0.08);
          if (e.spr._tent) e.spr._tent.rotation = Math.sin(elapsed * 2) * 0.06;
          if (e.spr._staff) e.spr._staff.rotation = Math.sin(elapsed * 2.4) * 0.1;
        }
        // 산성 슈터 — 타워 공격
        if (e.def.shooter) {
          e.shootCd -= dt;
          if (e.shootCd <= 0) {
            const near = towers.filter(t => t.stunned <= 0 && dist2(t.spr, e.spr) <= e.def.shootRange * e.def.shootRange);
            if (near.length) {
              e.shootCd = e.def.shootRate;
              const t = near[0];
              t.stunned = 1.4; t.body.tint = 0xB8D86B;
              const line = new PIXI.Graphics();
              line.moveTo(e.spr.x, e.spr.y).lineTo(t.spr.x, t.spr.y - 20)
                .stroke({ width: 3, color: 0x9BC53D, alpha: 0.8, cap: 'round' });
              layers.fx.addChild(line);
              bullets.push({ fx: line, life: 0.15, type: 'laser' });
            }
          }
        }
        // 이동
        e.dist += e.speed * dt;
        const pos = e.path.at(e.dist);
        e.spr.x = pos.x;
        // 비행체 부유 + 지상체 바운스
        e.wob += dt * 7;
        if (e.def.flying) {
          e.spr.y = pos.y - 26 + Math.sin(e.wob) * 5;
          if (e.spr._wings) {
            e.spr._wings[0].rotation = Math.sin(e.wob * 2.2) * 0.45;
            e.spr._wings[1].rotation = -Math.sin(e.wob * 2.2) * 0.45;
          }
        } else {
          e.spr.y = pos.y - Math.abs(Math.sin(e.wob)) * (e.def.boss ? 2 : 3.5);
          e.body.rotation = Math.sin(e.wob * 0.9) * 0.09;
        }
        // 은신 시각화
        if (e.def.stealth) {
          const detected = towers.some(t => {
            if (t.stunned > 0) return false;
            const lv = t.def.levels[t.level];
            if (t.def.detectsGlobal) return true;
            if (t.def.detects) return dist2(t.spr, e.spr) <= lv.range * lv.range;
            return false;
          });
          e._detected = detected;
          e.spr.alpha = detected ? 0.95 : 0.32;
        }
        // 성채 도달
        if (e.dist >= e.path.total - 4) {
          e.alive = false;
          layers.unit.removeChild(e.spr);
          enemies.splice(i, 1);
          lives -= e.def.dmgToBase;
          castle.setDamage(1 - lives / stageDef.lives);
          particles.spawn(castle.container.x, castle.container.y - 20, { count: 12, color: [0xE85D5D, 0x6B4E8E], speed: 130, life: 0.6 });
          sfx('hit');
          // 화면 흔들림
          world._shake = 0.35;
          if (lives <= 0) {
            lives = 0;
            state = GameState.OVER;
            pushHUD();
            setTimeout(() => opts.onGameOver && opts.onGameOver(collectResult()), 800);
            return;
          }
          pushHUD();
        }
      }

      // 화면 흔들림
      if (world._shake > 0) {
        world._shake -= dt;
        const sc = world.scale.x;
        world.x = (mw - LW * sc) / 2 + (Math.random() - 0.5) * 10 * world._shake;
        world.y = (mh - LH * sc) / 2 + (Math.random() - 0.5) * 10 * world._shake;
      }

      // 타워 로직
      towers.forEach(t => {
        const lv = t.def.levels[t.level];
        if (t.stunned > 0) {
          t.stunned -= dt;
          if (t.stunned <= 0) t.body.tint = 0xFFFFFF;
          return;
        }
        // 애니메이션
        if (t.anim.spin) {
          t.anim.spin.rotation += dt * (t._swingT > 0 ? 18 : (t.def.type === 'support' ? 1.2 : 2.5));
          if (t._swingT > 0) t._swingT -= dt;
        }
        if (t.anim.bob) t.anim.bob.y = Math.sin(elapsed * 2.4 + t.spr.x) * 3;
        if (t.anim.orbit) {
          t.anim.orbit.x = Math.cos(elapsed * 1.8) * 10;
        }
        // 검진 타워 — 골드 수급
        if (t.def.type === 'support') {
          t.incomeCd -= dt;
          if (t.incomeCd <= 0) {
            t.incomeCd = lv.rate;
            gold += lv.income;
            spawnGoldPop(t.spr.x, t.spr.y - 40, lv.income);
            particles.spawn(t.spr.x, t.spr.y - 40, { count: 5, color: 0xFFC24B, speed: 50, life: 0.5, up: 40 });
            pushHUD();
          }
          return;
        }
        // 불소 — 도트 오라
        if (t.def.type === 'aura') {
          t.cd -= dt;
          if (t.cd <= 0) {
            t.cd = lv.rate;
            let hitAny = false;
            enemies.forEach(e => {
              if (!e.alive) return;
              if (e.def.stealth && !e._detected) return;
              if (dist2(t.spr, e.spr) <= lv.range * lv.range) { damageEnemy(e, lv.dmg, t, true); hitAny = true; }
            });
            if (hitAny) {
              const ring = new PIXI.Graphics();
              ring.circle(0, 0, 8).stroke({ width: 3, color: 0x7BD8C2, alpha: 0.7 });
              ring.x = t.spr.x; ring.y = t.spr.y;
              layers.fx.addChild(ring);
              bullets.push({ fx: ring, life: 0.5, type: 'nova', maxR: lv.range });
            }
          }
          return;
        }
        // 공격 타워
        t.cd -= dt;
        if (t.cd > 0) return;
        // 타겟 탐색
        let target = null, best = -1;
        enemies.forEach(e => {
          if (!e.alive) return;
          if (e.def.flying && !t.def.hitsAir) return;
          if (e.def.stealth && !e._detected) return;
          if (dist2(t.spr, e.spr) > lv.range * lv.range) return;
          if (e.dist > best) { best = e.dist; target = e; }
        });
        if (t.def.type === 'melee') {
          // 근접은 사거리 내 지상 적 존재 시 발동
          const any = enemies.some(e => e.alive && !e.def.flying && !(e.def.stealth && !e._detected) && dist2(t.spr, e.spr) <= lv.range * lv.range);
          if (any) { t.cd = lv.rate; fireBullet(t, null, lv); }
        } else if (t.def.type === 'nova') {
          const any = enemies.some(e => e.alive && !(e.def.stealth && !e._detected) && dist2(t.spr, e.spr) <= lv.range * lv.range);
          if (any) { t.cd = lv.rate; fireBullet(t, null, lv); }
        } else if (target) {
          t.cd = lv.rate;
          fireBullet(t, target, lv);
        }
      });

      // 이펙트 수명
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.life -= dt;
        if (b.type === 'nova') {
          const p = 1 - b.life / 0.4;
          b.fx.scale.set(1 + p * (b.maxR ? b.maxR / 10 : 8));
          b.fx.alpha = 1 - p;
        } else if (b.type === 'pop') {
          b.fx.y -= 40 * dt;
          b.fx.alpha = Math.min(1, b.life * 2.4);
        } else {
          b.fx.alpha = b.life / 0.15;
        }
        if (b.life <= 0) { layers.fx.removeChild(b.fx); bullets.splice(i, 1); }
      }

      // 부식 장판
      for (let i = corrodeZones.length - 1; i >= 0; i--) {
        const z = corrodeZones[i];
        z.life -= dt;
        z.g.alpha = Math.min(1, z.life);
        // 장판 위 타워 마비는 없음 — 대신 아군 스폿 시각 경고만
        if (z.life <= 0) { layers.zone.removeChild(z.g); corrodeZones.splice(i, 1); }
      }

      // 웨이브 종료 판정
      if (state === GameState.WAVE && !spawning && enemies.length === 0) endWave();

      // y-sort
      layers.unit.children.sort((a, b) => a.y - b.y);
    }

    function collectResult() {
      return {
        stage: opts.stage, score: Math.floor(score),
        wave: Math.min(waveIdx + 1, TOTAL_WAVES), totalWaves: TOTAL_WAVES,
        kills: killCount, lives, playSeconds: Math.floor(playSeconds),
        cleared: state === GameState.CLEAR
      };
    }

    // ---------- 공개 API ----------
    this.ready = ready;
    this.startWave = startWave;
    this.buildTower = buildTower;
    this.previewRange = previewRange;
    this.upgradeTower = upgradeTower;
    this.sellTower = sellTower;
    this.clearSelection = clearSelection;
    this.useBrushTime = useBrushTime;
    this.toggleSpeed = function () { speedMult = speedMult === 1 ? 2 : 1; pushHUD(); return speedMult; };
    this.pause = function (p) {
      if (state === GameState.OVER || state === GameState.CLEAR) return;
      if (p && state !== GameState.PAUSED) { self._prevState = state; state = GameState.PAUSED; }
      else if (!p && state === GameState.PAUSED) { state = self._prevState || GameState.BETWEEN; }
      pushHUD();
    };
    this.getState = () => state;
    this.destroy = function () {
      destroyed = true;
      try { app.ticker.remove(tick); app.destroy(true, { children: true }); } catch (e) {}
    };
  }

  window.CavityDefense = CavityDefense;
  window.CD_STATE = GameState;
})();
