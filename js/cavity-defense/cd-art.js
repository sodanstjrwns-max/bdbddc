/* ============================================================
 * CAVITY DEFENSE — 아트 모듈 (PixiJS v8)
 * "구강 판타지 전장" — 2.5D 디오라마 · 패럴랙스 · 라이팅 · 파티클
 * ============================================================ */
(function () {
  'use strict';
  const P = () => window.CD_DATA.PALETTE;

  // ---------- 유틸 ----------
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixColor(c1, c2, t) {
    const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
    const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
    return (Math.round(lerp(r1, r2, t)) << 16) | (Math.round(lerp(g1, g2, t)) << 8) | Math.round(lerp(b1, b2, t));
  }
  // Catmull-Rom 스무딩 — 유기적 곡선 경로
  function smoothPath(pts, seg) {
    seg = seg || 14;
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < seg; j++) {
        const t = j / seg, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  // ---------- 테마 라이팅 ----------
  const THEMES = {
    morning: { sky1: 0xCDEFE6, sky2: 0xF7F3EC, ambient: 0xFFFFFF, ambAlpha: 0, ridge: 0xF9B4A3, far: 0xEAD8CE },
    evening: { sky1: 0xF4C9A8, sky2: 0xF2937B, ambient: 0xFF9A5C, ambAlpha: 0.08, ridge: 0xE58A72, far: 0xD9A08E },
    night:   { sky1: 0x2A2547, sky2: 0x1E1B33, ambient: 0x1E1B33, ambAlpha: 0.32, ridge: 0x8A5F7E, far: 0x4A3D63 }
  };

  // ============================================================
  // 배경 — 패럴랙스 3레이어 디오라마
  // ============================================================
  function buildBackground(app, theme, W, H) {
    const T = THEMES[theme] || THEMES.morning;
    const root = new PIXI.Container();

    // 하늘(구강 상부) 그라데이션 — 밴드 방식
    const sky = new PIXI.Graphics();
    const bands = 24;
    for (let i = 0; i < bands; i++) {
      sky.rect(0, (H / bands) * i, W, H / bands + 1).fill(mixColor(T.sky1, T.sky2, i / bands));
    }
    root.addChild(sky);

    // [레이어1 · 원경] 목젖 실루엣 + 안개
    const far = new PIXI.Container();
    const uvula = new PIXI.Graphics();
    uvula.ellipse(W * 0.5, H * 0.06, W * 0.42, H * 0.13).fill({ color: T.far, alpha: 0.5 });
    uvula.ellipse(W * 0.5, H * 0.02, W * 0.09, H * 0.085).fill({ color: T.far, alpha: 0.75 });
    uvula.circle(W * 0.5, H * 0.1, W * 0.055).fill({ color: T.far, alpha: 0.85 });
    far.addChild(uvula);
    // 원경 어금니 능선
    const farTeeth = new PIXI.Graphics();
    for (let i = 0; i < 7; i++) {
      const tx = W * (0.02 + i * 0.16), tw = W * 0.13, th = H * (0.05 + (i % 2) * 0.016);
      farTeeth.roundRect(tx, H * 0.16 - th, tw, th + 20, 14).fill({ color: 0xFFFFFF, alpha: theme === 'night' ? 0.10 : 0.45 });
    }
    far.addChild(farTeeth);
    root.addChild(far);

    // [레이어2 · 중경] 잇몸 능선 (부드러운 언덕)
    const mid = new PIXI.Graphics();
    mid.moveTo(0, H * 0.30);
    for (let x = 0; x <= W; x += W / 24) {
      mid.lineTo(x, H * 0.26 + Math.sin(x * 0.011 + 2) * H * 0.028 + Math.sin(x * 0.004) * H * 0.02);
    }
    mid.lineTo(W, H).lineTo(0, H).closePath().fill(mixColor(T.ridge, P().gum, 0.4));
    root.addChild(mid);

    // [레이어3 · 전경] 잇몸 지형 본체
    const ground = new PIXI.Graphics();
    ground.moveTo(0, H * 0.36);
    for (let x = 0; x <= W; x += W / 20) {
      ground.lineTo(x, H * 0.33 + Math.sin(x * 0.008 + 5) * H * 0.024);
    }
    ground.lineTo(W, H).lineTo(0, H).closePath().fill(P().gum);
    // 지형 하이라이트/음영 얼룩 (유기적 질감)
    for (let i = 0; i < 26; i++) {
      const gx = Math.random() * W, gy = H * (0.4 + Math.random() * 0.55), gr = 14 + Math.random() * 42;
      ground.ellipse(gx, gy, gr, gr * 0.5).fill({ color: Math.random() > 0.5 ? P().gumLight : P().gumDark, alpha: 0.10 + Math.random() * 0.08 });
    }
    root.addChild(ground);

    // 타액 강 — 반짝임은 tick에서
    const river = new PIXI.Graphics();
    const riverPts = [];
    for (let x = -20; x <= W + 20; x += W / 16) {
      riverPts.push({ x, y: H * 0.33 + Math.sin(x * 0.008 + 5) * H * 0.024 + 6 });
    }
    river.moveTo(riverPts[0].x, riverPts[0].y);
    riverPts.forEach(p => river.lineTo(p.x, p.y));
    river.stroke({ width: 10, color: P().saliva, alpha: theme === 'night' ? 0.35 : 0.65, cap: 'round' });
    root.addChild(river);
    const sparkles = new PIXI.Container();
    const sparkleDots = [];
    for (let i = 0; i < 10; i++) {
      const d = new PIXI.Graphics();
      d.circle(0, 0, 1.6 + Math.random() * 1.6).fill({ color: 0xFFFFFF, alpha: 0.9 });
      const bp = riverPts[Math.floor(Math.random() * riverPts.length)];
      d.x = bp.x; d.y = bp.y; d._ph = Math.random() * 6.28;
      sparkles.addChild(d); sparkleDots.push(d);
    }
    root.addChild(sparkles);

    // 전경 장식 — 잇몸 돌기·미니 치아
    const deco = new PIXI.Graphics();
    for (let i = 0; i < 10; i++) {
      const dx = Math.random() * W, dy = H * (0.42 + Math.random() * 0.5);
      if (Math.random() > 0.5) {
        deco.ellipse(dx, dy, 6 + Math.random() * 7, 4 + Math.random() * 5).fill({ color: P().gumLight, alpha: 0.55 });
      } else {
        deco.roundRect(dx, dy, 9, 12, 4).fill({ color: 0xFFFFFF, alpha: theme === 'night' ? 0.14 : 0.5 });
      }
    }
    root.addChild(deco);

    return {
      container: root, sparkleDots,
      tick(t) {
        sparkleDots.forEach(d => { d.alpha = 0.3 + 0.6 * Math.abs(Math.sin(t * 1.8 + d._ph)); });
        far.x = Math.sin(t * 0.18) * 5;   // 원경 미세 패럴랙스
        mid.x = Math.sin(t * 0.18) * 2.4;
      }
    };
  }

  // 앰비언트 라이팅 오버레이 (웨이브 진행 → 아침→오후→밤)
  function buildAmbient(W, H) {
    const amb = new PIXI.Graphics();
    amb.rect(0, 0, W, H).fill(0xFFFFFF);
    amb.alpha = 0;
    // 비네트
    const vig = new PIXI.Graphics();
    const steps = 7;
    for (let i = 0; i < steps; i++) {
      const inset = i * 9;
      vig.rect(inset, inset, W - inset * 2, H - inset * 2).stroke({ width: 10, color: 0x1E1B33, alpha: 0.028 * (steps - i) });
    }
    return { amb, vig };
  }
  function setAmbient(amb, progress) {
    // progress 0~1 (웨이브 진행). 0.65부터 밤으로.
    if (progress < 0.45) { amb.tint = 0xFFF3D6; amb.alpha = progress * 0.06; }
    else if (progress < 0.7) { amb.tint = 0xFF9A5C; amb.alpha = 0.05 + (progress - 0.45) * 0.3; }
    else { amb.tint = 0x1E1B33; amb.alpha = 0.12 + (progress - 0.7) * 0.75; }
  }

  // ============================================================
  // 경로 — 잇몸 능선 위 유기적 곡선 도로
  // ============================================================
  function buildPath(points, W, H) {
    const abs = points.map(p => ({ x: p[0] * W, y: p[1] * H }));
    const sm = smoothPath(abs, 16);
    const g = new PIXI.Graphics();
    // 외곽 딥 라인
    g.moveTo(sm[0].x, sm[0].y); sm.forEach(p => g.lineTo(p.x, p.y));
    g.stroke({ width: 46, color: P().gumDark, alpha: 0.9, cap: 'round', join: 'round' });
    // 본체
    g.moveTo(sm[0].x, sm[0].y); sm.forEach(p => g.lineTo(p.x, p.y));
    g.stroke({ width: 38, color: mixColor(P().gum, 0xC96F58, 0.45), cap: 'round', join: 'round' });
    // 중앙 하이라이트
    g.moveTo(sm[0].x, sm[0].y); sm.forEach(p => g.lineTo(p.x, p.y));
    g.stroke({ width: 14, color: P().gumLight, alpha: 0.35, cap: 'round', join: 'round' });
    // 점선 발자국 (진격 방향 암시)
    const dots = new PIXI.Graphics();
    for (let i = 6; i < sm.length - 4; i += 10) {
      dots.circle(sm[i].x, sm[i].y, 2.4).fill({ color: 0xFFFFFF, alpha: 0.28 });
    }
    // 아크렝스 테이블 (등속 이동용)
    const lens = [0];
    for (let i = 1; i < sm.length; i++) {
      lens.push(lens[i - 1] + Math.hypot(sm[i].x - sm[i - 1].x, sm[i].y - sm[i - 1].y));
    }
    const total = lens[lens.length - 1];
    function at(dist) {
      if (dist <= 0) return { x: sm[0].x, y: sm[0].y, a: 0 };
      if (dist >= total) { const l = sm[sm.length - 1]; return { x: l.x, y: l.y, a: 0 }; }
      let lo = 0, hi = lens.length - 1;
      while (lo < hi - 1) { const m = (lo + hi) >> 1; if (lens[m] <= dist) lo = m; else hi = m; }
      const t = (dist - lens[lo]) / (lens[hi] - lens[lo] || 1);
      return {
        x: lerp(sm[lo].x, sm[hi].x, t), y: lerp(sm[lo].y, sm[hi].y, t),
        a: Math.atan2(sm[hi].y - sm[lo].y, sm[hi].x - sm[lo].x)
      };
    }
    const c = new PIXI.Container();
    c.addChild(g, dots);
    return { container: c, at, total, pts: sm };
  }

  // ============================================================
  // 치아 성채 (수비 목표) — 에나멜 백색 성
  // ============================================================
  function buildCastle(x, y) {
    const c = new PIXI.Container();
    c.x = x; c.y = y;
    const g = new PIXI.Graphics();
    // 그림자
    g.ellipse(0, 26, 56, 14).fill({ color: 0x000000, alpha: 0.18 });
    // 어금니 몸체 (성채)
    g.roundRect(-44, -46, 88, 72, 18).fill(P().enamel);
    g.roundRect(-44, -46, 88, 30, 18).fill({ color: 0xFFFFFF, alpha: 0.55 });
    // 치근 (성채 다리)
    g.roundRect(-38, 14, 24, 26, 9).fill(mixColor(P().enamel, P().gum, 0.18));
    g.roundRect(14, 14, 24, 26, 9).fill(mixColor(P().enamel, P().gum, 0.18));
    // 교두(치아 봉우리) = 성탑
    g.roundRect(-46, -62, 26, 30, 8).fill(P().enamel);
    g.roundRect(-10, -70, 24, 36, 8).fill(0xFFFFFF);
    g.roundRect(22, -62, 26, 30, 8).fill(P().enamel);
    // 성문
    g.roundRect(-13, -14, 26, 40, 12).fill({ color: P().plaqueDark, alpha: 0.25 });
    g.roundRect(-10, -10, 20, 36, 10).fill(0x8A6E5A);
    g.circle(4, 9, 2.2).fill(P().gold);
    // 광택
    g.ellipse(-22, -38, 10, 16).fill({ color: 0xFFFFFF, alpha: 0.7 });
    c.addChild(g);
    // 깃발
    const flag = new PIXI.Graphics();
    flag.rect(-1, -30, 2, 30).fill(0x9A8F80);
    flag.moveTo(1, -30).lineTo(20, -25).lineTo(1, -19).closePath().fill(P().mint);
    flag.x = 2; flag.y = -70;
    c.addChild(flag);
    // 균열 오버레이 (피해 누적 시)
    const crack = new PIXI.Graphics();
    crack.alpha = 0;
    crack.moveTo(-6, -46).lineTo(-2, -28).lineTo(-12, -12).lineTo(-4, 6)
      .stroke({ width: 3, color: 0x3A3226, alpha: 0.85, cap: 'round' });
    crack.moveTo(14, -40).lineTo(20, -22).lineTo(10, -8)
      .stroke({ width: 2.4, color: 0x3A3226, alpha: 0.7, cap: 'round' });
    c.addChild(crack);
    return {
      container: c, flag, crack,
      setDamage(t) { crack.alpha = Math.min(1, t * 1.2); },
      tick(t) { flag.skew.x = Math.sin(t * 3) * 0.12; }
    };
  }

  // ============================================================
  // 타워 스프라이트 — 프로시저럴 캐릭터 (5종 × 시각 3단계)
  // ============================================================
  function buildTower(type, level) {
    const c = new PIXI.Container();
    const body = new PIXI.Container();
    c.addChild(body);
    const g = new PIXI.Graphics();
    body.addChild(g);
    const lv = level; // 0,1,2
    // 공통 받침대 — 에나멜 원형 단상
    g.ellipse(0, 16, 26, 9).fill({ color: 0x000000, alpha: 0.16 });
    g.ellipse(0, 12, 24, 10).fill(mixColor(P().enamel, 0xD8CFC2, 0.4));
    g.ellipse(0, 9, 24, 10).fill(P().enamel);
    if (lv >= 1) g.ellipse(0, 9, 24, 10).stroke({ width: 2, color: P().mint, alpha: 0.8 });
    if (lv >= 2) { g.ellipse(0, 6, 27, 11).stroke({ width: 2, color: P().gold, alpha: 0.9 }); }

    let anim = { spin: null, bob: null, orbit: null };

    if (type === 'brush') {
      // 칫솔 기사 — 몸통(핸들) + 회전 브러시헤드
      const handle = new PIXI.Graphics();
      handle.roundRect(-5, -34, 10, 40, 5).fill(lv >= 2 ? 0x4A5568 : P().mint);
      handle.roundRect(-5, -34, 10, 14, 5).fill({ color: 0xFFFFFF, alpha: 0.4 });
      if (lv >= 2) { handle.circle(0, -12, 3.4).fill(P().sugar); } // 전동 버튼
      body.addChild(handle);
      const head = new PIXI.Container();
      const hg = new PIXI.Graphics();
      hg.roundRect(-16, -8, 32, 13, 6).fill(0xFFFFFF);
      const bristleCol = lv === 0 ? P().mint : lv === 1 ? 0x6FCFEA : P().sugar;
      for (let i = -12; i <= 12; i += 5) {
        hg.roundRect(i - 1.6, -16, 3.2, 9, 1.6).fill(bristleCol);
      }
      head.addChild(hg);
      head.y = -38;
      body.addChild(head);
      anim.spin = head;
      // 눈
      const face = new PIXI.Graphics();
      face.circle(-3.4, -22, 2.6).fill(0x2A2A3A); face.circle(3.4, -22, 2.6).fill(0x2A2A3A);
      face.circle(-2.7, -22.7, 0.9).fill(0xFFFFFF); face.circle(4.1, -22.7, 0.9).fill(0xFFFFFF);
      body.addChild(face);
    } else if (type === 'floss') {
      // 치실 궁수 — 실패 사이 당겨진 실 = 활
      const fg = new PIXI.Graphics();
      fg.roundRect(-16, -30, 8, 30, 4).fill(0xE8E0D0);
      fg.roundRect(8, -30, 8, 30, 4).fill(0xE8E0D0);
      for (let i = 0; i < 4; i++) {
        fg.moveTo(-12, -28 + i * 7).lineTo(12, -28 + i * 7).stroke({ width: 1.4, color: 0xFFFFFF, alpha: 0.9 });
      }
      const stringCol = lv === 0 ? 0xFFFFFF : lv === 1 ? P().mint : P().saliva;
      fg.moveTo(-12, -30).quadraticCurveTo(0, -44, 12, -30).stroke({ width: 2.4, color: stringCol });
      if (lv >= 2) { // 워터픽 노즐
        fg.roundRect(-3, -50, 6, 12, 3).fill(P().saliva);
        fg.circle(0, -52, 3).fill(0xFFFFFF);
      }
      fg.circle(-4, -14, 2.4).fill(0x2A2A3A); fg.circle(4, -14, 2.4).fill(0x2A2A3A);
      body.addChild(fg);
      const scope = new PIXI.Graphics(); // 조준 렌즈 궤도
      scope.circle(0, 0, 3).fill(P().sugar).circle(0, 0, 5).stroke({ width: 1.2, color: P().sugar, alpha: 0.7 });
      scope.y = -38;
      body.addChild(scope);
      anim.orbit = scope;
    } else if (type === 'fluoride') {
      // 불소 마법사 — 물방울 크리스탈
      const fg = new PIXI.Graphics();
      const dropCol = lv === 0 ? P().saliva : lv === 1 ? P().mint : 0x5BC8E8;
      fg.moveTo(0, -46).bezierCurveTo(15, -28, 17, -16, 0, -8).bezierCurveTo(-17, -16, -15, -28, 0, -46)
        .fill({ color: dropCol, alpha: 0.92 });
      fg.ellipse(-4, -26, 4, 7).fill({ color: 0xFFFFFF, alpha: 0.75 });
      fg.circle(-3.6, -18, 2.4).fill(0x2A3A4A); fg.circle(3.6, -18, 2.4).fill(0x2A3A4A);
      fg.moveTo(-2.4, -13).quadraticCurveTo(0, -11, 2.4, -13).stroke({ width: 1.4, color: 0x2A3A4A });
      if (lv >= 1) { fg.circle(0, -50, 3).fill(0xFFFFFF); }
      if (lv >= 2) { // 왕관
        fg.moveTo(-8, -48).lineTo(-5, -55).lineTo(0, -49).lineTo(5, -55).lineTo(8, -48).closePath().fill(P().gold);
      }
      body.addChild(fg);
      anim.bob = fg;
    } else if (type === 'rinse') {
      // 가글 포탑 — 물결 컵 대포
      const rg = new PIXI.Graphics();
      const cupCol = lv === 0 ? 0x7BC8D8 : lv === 1 ? P().mint : 0x8E7CC3;
      rg.moveTo(-18, -36).lineTo(-13, -4).quadraticCurveTo(0, 2, 13, -4).lineTo(18, -36).closePath().fill(cupCol);
      rg.ellipse(0, -36, 18, 6).fill(mixColor(cupCol, 0xFFFFFF, 0.35));
      // 출렁이는 액체
      const liquid = new PIXI.Graphics();
      liquid.ellipse(0, -33, 14, 4.4).fill({ color: 0xFFFFFF, alpha: 0.85 });
      liquid.y = 0;
      rg.circle(-4.5, -20, 2.4).fill(0x1A3A44); rg.circle(4.5, -20, 2.4).fill(0x1A3A44);
      if (lv >= 2) { rg.roundRect(-20, -42, 40, 5, 2.5).fill(P().gold); }
      body.addChild(rg); body.addChild(liquid);
      anim.bob = liquid;
    } else { // checkup
      // 검진 감시탑 — 거울 레이더
      const cg = new PIXI.Graphics();
      cg.roundRect(-3.5, -36, 7, 40, 3.5).fill(0x9AA5B1);
      body.addChild(cg);
      const mirror = new PIXI.Container();
      const mg = new PIXI.Graphics();
      mg.circle(0, 0, 13).fill(0xC8D2DC).circle(0, 0, 10).fill(0xEAF4FA);
      mg.ellipse(-3, -3, 3.4, 5).fill({ color: 0xFFFFFF, alpha: 0.9 });
      if (lv >= 1) mg.circle(0, 0, 13).stroke({ width: 2.2, color: P().mint });
      if (lv >= 2) mg.circle(0, 0, 16).stroke({ width: 1.6, color: P().gold, alpha: 0.9 });
      mirror.addChild(mg);
      mirror.y = -42;
      body.addChild(mirror);
      anim.spin = mirror;
      const eye = new PIXI.Graphics();
      eye.circle(-3.2, -14, 2.2).fill(0x2A2A3A); eye.circle(3.2, -14, 2.2).fill(0x2A2A3A);
      body.addChild(eye);
    }
    return { container: c, body, anim };
  }

  // ============================================================
  // 적 스프라이트 — 프로시저럴 세균 캐릭터
  // ============================================================
  function buildEnemy(def) {
    const c = new PIXI.Container();
    const body = new PIXI.Container();
    c.addChild(body);
    const g = new PIXI.Graphics();
    body.addChild(g);
    const s = def.size;
    const col = def.color;
    // 그림자
    const shadow = new PIXI.Graphics();
    shadow.ellipse(0, s * 0.85, s * 0.9, s * 0.32).fill({ color: 0x000000, alpha: 0.16 });
    c.addChildAt(shadow, 0);

    if (def.id === 'mutans' || def.id === 'sugarMinion') {
      g.circle(0, 0, s).fill(col);
      g.circle(0, 0, s).stroke({ width: 2, color: mixColor(col, 0x000000, 0.25) });
      // 섬모
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        g.moveTo(Math.cos(a) * s, Math.sin(a) * s)
          .lineTo(Math.cos(a) * (s + 5), Math.sin(a) * (s + 5))
          .stroke({ width: 2, color: mixColor(col, 0x000000, 0.2), cap: 'round' });
      }
      g.circle(-s * 0.3, -s * 0.15, s * 0.22).fill(0xFFFFFF); g.circle(s * 0.3, -s * 0.15, s * 0.22).fill(0xFFFFFF);
      g.circle(-s * 0.26, -s * 0.12, s * 0.11).fill(0x1A1A2A); g.circle(s * 0.34, -s * 0.12, s * 0.11).fill(0x1A1A2A);
      g.moveTo(-s * 0.25, s * 0.3).quadraticCurveTo(0, s * 0.48, s * 0.25, s * 0.3).stroke({ width: 2, color: 0x1A1A2A }); // 씩 웃음
      g.moveTo(-s*0.16, s*0.34).lineTo(-s*0.08, s*0.42).lineTo(0, s*0.34).stroke({width:1.5, color:0xFFFFFF}); // 이빨
    } else if (def.id === 'sugar') {
      // 각설탕 러너 — 달리는 큐브
      g.roundRect(-s, -s, s * 2, s * 2, 4).fill(0xFFF6DC);
      g.roundRect(-s, -s, s * 2, s * 0.8, 4).fill({ color: 0xFFFFFF, alpha: 0.8 });
      g.roundRect(-s, -s, s * 2, s * 2, 4).stroke({ width: 2, color: P().sugar });
      g.circle(-s * 0.35, -s * 0.2, 2.6).fill(0x2A2A3A); g.circle(s * 0.35, -s * 0.2, 2.6).fill(0x2A2A3A);
      g.ellipse(0, s * 0.35, 3.4, 4.4).fill(0x2A2A3A); // 헥헥 입
      // 다리
      const legs = new PIXI.Graphics();
      legs.roundRect(-s * 0.6, s * 0.85, 4, 8, 2).fill(P().sugar);
      legs.roundRect(s * 0.25, s * 0.85, 4, 8, 2).fill(P().sugar);
      body.addChild(legs);
    } else if (def.id === 'plaqueTank') {
      // 끈적 덩어리 + 헬멧
      g.moveTo(-s, s * 0.5);
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        const r = s * (0.92 + (i % 2) * 0.16);
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.9 + s * 0.1);
      }
      g.closePath().fill(col);
      g.ellipse(0, s * 0.45, s * 0.95, s * 0.3).fill(mixColor(col, 0x000000, 0.2));
      // 헬멧(방어)
      g.moveTo(-s * 0.8, -s * 0.3).quadraticCurveTo(0, -s * 1.25, s * 0.8, -s * 0.3).lineTo(s * 0.65, -s * 0.05).quadraticCurveTo(0, -s * 0.75, -s * 0.65, -s * 0.05).closePath()
        .fill(0x8A8F98);
      g.circle(-s * 0.28, 0, 3).fill(0xFF6B6B); g.circle(s * 0.28, 0, 3).fill(0xFF6B6B); // 성난 눈
      g.moveTo(-s * 0.2, s * 0.22).lineTo(s * 0.2, s * 0.22).stroke({ width: 2.4, color: 0x1A1A2A });
    } else if (def.id === 'ninja') {
      g.circle(0, 0, s).fill(col);
      // 복면 띠
      g.rect(-s, -s * 0.35, s * 2, s * 0.55).fill(0x252136);
      g.circle(-s * 0.3, -s * 0.08, 2.6).fill(0xFFE8A0); g.circle(s * 0.3, -s * 0.08, 2.6).fill(0xFFE8A0);
      // 띠 매듭
      g.moveTo(s * 0.9, -s * 0.2).lineTo(s * 1.5, -s * 0.5).lineTo(s * 1.3, 0).closePath().fill(0x252136);
    } else if (def.id === 'acid') {
      // 산성 슈터 — 방울 포탑 몸
      g.moveTo(0, -s * 1.3).bezierCurveTo(s, -s * 0.5, s * 0.9, s * 0.5, 0, s * 0.8)
        .bezierCurveTo(-s * 0.9, s * 0.5, -s, -s * 0.5, 0, -s * 1.3).fill(col);
      g.ellipse(-s * 0.25, -s * 0.4, s * 0.18, s * 0.3).fill({ color: 0xFFFFFF, alpha: 0.6 });
      g.circle(-s * 0.25, 0, 2.6).fill(0x1A2A1A); g.circle(s * 0.25, 0, 2.6).fill(0x1A2A1A);
      g.ellipse(0, s * 0.32, 3.6, 4.6).fill(0x1A2A1A);
      // 포신
      g.roundRect(s * 0.5, -s * 0.3, s * 0.75, s * 0.42, s * 0.2).fill(mixColor(col, 0x000000, 0.25));
    } else if (def.id === 'calculus') {
      // 치석 골렘 — 돌덩이
      g.moveTo(-s, s * 0.6).lineTo(-s * 0.85, -s * 0.4).lineTo(-s * 0.3, -s).lineTo(s * 0.5, -s * 0.85)
        .lineTo(s, -s * 0.1).lineTo(s * 0.8, s * 0.6).closePath().fill(col);
      g.moveTo(-s * 0.3, -s).lineTo(-s * 0.1, -s * 0.3).lineTo(s * 0.5, -s * 0.85)
        .stroke({ width: 2, color: mixColor(col, 0x000000, 0.3) });
      g.moveTo(-s * 0.85, -s * 0.4).lineTo(-s * 0.1, -s * 0.3).lineTo(s * 0.1, s * 0.6)
        .stroke({ width: 2, color: mixColor(col, 0x000000, 0.3) });
      g.circle(-s * 0.32, -s * 0.1, 3.4).fill(0xFF8C42); g.circle(s * 0.3, -s * 0.15, 3.4).fill(0xFF8C42);
      g.rect(-s * 0.25, s * 0.2, s * 0.5, 3).fill(0x1A1A2A);
      // 균열 글로우
      g.moveTo(0, s * 0.6).lineTo(s * 0.12, 0).stroke({ width: 2, color: 0xFF8C42, alpha: 0.65 });
    } else if (def.id === 'bat') {
      // 야식 박쥐 — 치킨 조각 물고 있음
      const wingL = new PIXI.Graphics();
      wingL.moveTo(0, 0).quadraticCurveTo(-s * 1.6, -s * 0.9, -s * 1.9, s * 0.2)
        .quadraticCurveTo(-s * 1.2, 0, -s * 0.9, s * 0.45).quadraticCurveTo(-s * 0.5, s * 0.2, 0, s * 0.3)
        .closePath().fill(col);
      const wingR = new PIXI.Graphics();
      wingR.moveTo(0, 0).quadraticCurveTo(s * 1.6, -s * 0.9, s * 1.9, s * 0.2)
        .quadraticCurveTo(s * 1.2, 0, s * 0.9, s * 0.45).quadraticCurveTo(s * 0.5, s * 0.2, 0, s * 0.3)
        .closePath().fill(col);
      body.addChildAt(wingL, 0); body.addChildAt(wingR, 0);
      g.circle(0, 0, s * 0.72).fill(mixColor(col, 0xFFFFFF, 0.12));
      g.moveTo(-s * 0.4, -s * 0.55).lineTo(-s * 0.55, -s * 1.0).lineTo(-s * 0.15, -s * 0.68).closePath().fill(col);
      g.moveTo(s * 0.4, -s * 0.55).lineTo(s * 0.55, -s * 1.0).lineTo(s * 0.15, -s * 0.68).closePath().fill(col);
      g.circle(-s * 0.22, -s * 0.1, 2.6).fill(0xFFE8A0); g.circle(s * 0.22, -s * 0.1, 2.6).fill(0xFFE8A0);
      // 치킨 다리
      g.ellipse(0, s * 0.55, 6, 4).fill(0xD8963C);
      g.roundRect(-1.4, s * 0.55, 2.8, 8, 1.4).fill(0xF3E8D8);
      c._wings = [wingL, wingR];
    } else if (def.boss) {
      // 보스 공통 골격 — 대형 + 오라
      const aura = new PIXI.Graphics();
      aura.circle(0, 0, s * 1.35).fill({ color: col, alpha: 0.14 });
      c.addChildAt(aura, 0);
      c._aura = aura;
      if (def.id === 'kraken') {
        // 콜라 크라켄 — 콜라캔 몸통 + 촉수
        const tent = new PIXI.Graphics();
        for (let i = 0; i < 5; i++) {
          const a = Math.PI * (0.15 + i * 0.175);
          const tx = Math.cos(a) * s, ty = Math.sin(a) * s * 0.8 + s * 0.2;
          tent.moveTo(tx * 0.4, s * 0.3)
            .quadraticCurveTo(tx * 0.9, ty + 12, tx, ty + s * 0.55)
            .stroke({ width: 8, color: mixColor(col, 0x000000, 0.15), cap: 'round' });
          tent.circle(tx, ty + s * 0.55, 5).fill(mixColor(col, 0x000000, 0.15));
        }
        body.addChildAt(tent, 0);
        c._tent = tent;
        g.roundRect(-s * 0.62, -s, s * 1.24, s * 1.5, 10).fill(0xB03A2E);
        g.roundRect(-s * 0.62, -s, s * 1.24, s * 0.4, 10).fill(0xC0392B);
        g.ellipse(0, -s * 0.98, s * 0.6, 6).fill(0x909497);
        g.roundRect(-s * 0.45, -s * 0.62, s * 0.9, s * 0.5, 6).fill({ color: 0xFFFFFF, alpha: 0.85 });
        // 로고풍 물결
        g.moveTo(-s * 0.4, -s * 0.35).quadraticCurveTo(0, -s * 0.55, s * 0.4, -s * 0.3).stroke({ width: 3.4, color: 0xB03A2E });
        g.circle(-s * 0.25, -s * 0.05, 4.4).fill(0xFFE8A0); g.circle(s * 0.25, -s * 0.05, 4.4).fill(0xFFE8A0);
        g.circle(-s * 0.25, -s * 0.05, 1.8).fill(0x1A1A2A); g.circle(s * 0.25, -s * 0.05, 1.8).fill(0x1A1A2A);
        // 거품
        g.circle(-s * 0.5, -s * 1.15, 4).fill({ color: 0xFFFFFF, alpha: 0.5 });
        g.circle(s * 0.4, -s * 1.25, 3).fill({ color: 0xFFFFFF, alpha: 0.4 });
      } else if (def.id === 'sugarlord') {
        // 미드나잇 슈가로드 — 도넛 왕관의 야식왕
        g.circle(0, 0, s).fill(col);
        g.circle(0, 0, s).stroke({ width: 3, color: mixColor(col, 0x000000, 0.3) });
        // 망토
        const cape = new PIXI.Graphics();
        cape.moveTo(-s * 0.9, -s * 0.3).quadraticCurveTo(-s * 1.5, s * 0.8, -s * 0.6, s * 1.1)
          .lineTo(s * 0.6, s * 1.1).quadraticCurveTo(s * 1.5, s * 0.8, s * 0.9, -s * 0.3)
          .closePath().fill(0x2A1F45);
        body.addChildAt(cape, 0);
        // 도넛 왕관
        g.ellipse(0, -s * 0.95, s * 0.55, s * 0.3).fill(0xE8A87C);
        g.ellipse(0, -s * 1.0, s * 0.52, s * 0.26).fill(0xF48FB1);
        g.ellipse(0, -s * 0.98, s * 0.18, s * 0.09).fill(col);
        for (let i = 0; i < 6; i++) {
          g.rect(-s * 0.4 + i * s * 0.15, -s * 1.05 + (i % 2) * 3, 4, 2).fill([0xFFF176, 0x4FC3F7, 0xAED581][i % 3]);
        }
        g.circle(-s * 0.3, -s * 0.15, 5).fill(0xFFD34D); g.circle(s * 0.3, -s * 0.15, 5).fill(0xFFD34D);
        g.circle(-s * 0.3, -s * 0.15, 2).fill(0x1A1A2A); g.circle(s * 0.3, -s * 0.15, 2).fill(0x1A1A2A);
        g.moveTo(-s * 0.3, s * 0.3).quadraticCurveTo(0, s * 0.55, s * 0.3, s * 0.3).stroke({ width: 3, color: 0x1A1A2A });
        g.moveTo(-s*0.18, s*0.36).lineTo(-s*0.06, s*0.47).lineTo(s*0.06, s*0.36).lineTo(s*0.18, s*0.45).stroke({width:2, color:0xFFFFFF});
      } else {
        // 치주염 리치 — 후드 해골 세균
        const robe = new PIXI.Graphics();
        robe.moveTo(-s * 0.85, -s * 0.5).quadraticCurveTo(0, -s * 1.3, s * 0.85, -s * 0.5)
          .lineTo(s, s * 0.9).lineTo(s * 0.5, s * 0.65).lineTo(0, s).lineTo(-s * 0.5, s * 0.65).lineTo(-s, s * 0.9)
          .closePath().fill(col);
        body.addChildAt(robe, 0);
        g.ellipse(0, -s * 0.25, s * 0.5, s * 0.55).fill(0xE8E4D8); // 해골 얼굴
        g.circle(-s * 0.2, -s * 0.32, 5).fill(0x1A1A2A); g.circle(s * 0.2, -s * 0.32, 5).fill(0x1A1A2A);
        g.circle(-s * 0.2, -s * 0.32, 2).fill(0xC0392B); g.circle(s * 0.2, -s * 0.32, 2).fill(0xC0392B);
        g.rect(-s * 0.22, -s * 0.02, s * 0.44, 3).fill(0x1A1A2A);
        for (let i = 0; i < 4; i++) g.rect(-s * 0.2 + i * s * 0.12, -s * 0.02, 2, 6).fill(0x1A1A2A);
        // 지팡이
        const staff = new PIXI.Graphics();
        staff.roundRect(-2, -s * 1.2, 4, s * 1.7, 2).fill(0x6E5A48);
        staff.circle(0, -s * 1.25, 7).fill(0x9BC53D);
        staff.circle(0, -s * 1.25, 10).stroke({ width: 2, color: 0x9BC53D, alpha: 0.5 });
        staff.x = s * 0.75;
        body.addChild(staff);
        c._staff = staff;
      }
    }
    // HP바
    const hpBg = new PIXI.Graphics();
    hpBg.roundRect(-s, -s - 14, s * 2, 5, 2.5).fill({ color: 0x000000, alpha: 0.45 });
    const hpBar = new PIXI.Graphics();
    hpBar.roundRect(-s, -s - 14, s * 2, 5, 2.5).fill(0x6BD86B);
    hpBg.visible = hpBar.visible = false;
    c.addChild(hpBg, hpBar);
    c._hpW = s * 2; c._hpY = -s - 14; c._hpX = -s;
    return { container: c, body, hpBg, hpBar };
  }

  // ============================================================
  // 파티클 시스템 (풀링)
  // ============================================================
  function buildParticles(parent, max) {
    max = max || 220;
    const pool = [];
    const active = [];
    const layer = new PIXI.Container();
    parent.addChild(layer);
    function get() {
      let p = pool.pop();
      if (!p) {
        p = new PIXI.Graphics();
        p.circle(0, 0, 3).fill(0xFFFFFF);
      }
      layer.addChild(p);
      return p;
    }
    function spawn(x, y, opts) {
      if (active.length >= max) return;
      const n = opts.count || 8;
      for (let i = 0; i < n; i++) {
        const p = get();
        const a = Math.random() * Math.PI * 2;
        const sp = (opts.speed || 80) * (0.4 + Math.random() * 0.9);
        p.x = x; p.y = y;
        p.tint = Array.isArray(opts.color) ? opts.color[i % opts.color.length] : (opts.color || 0xFFFFFF);
        p.alpha = 1;
        p.scale.set((opts.size || 1) * (0.5 + Math.random() * 0.8));
        p._vx = Math.cos(a) * sp; p._vy = Math.sin(a) * sp - (opts.up || 30);
        p._life = p._maxLife = (opts.life || 0.6) * (0.7 + Math.random() * 0.6);
        p._grav = opts.gravity !== undefined ? opts.gravity : 220;
        active.push(p);
      }
    }
    function tick(dt) {
      for (let i = active.length - 1; i >= 0; i--) {
        const p = active[i];
        p._life -= dt;
        if (p._life <= 0) {
          layer.removeChild(p); pool.push(p); active.splice(i, 1); continue;
        }
        p._vy += p._grav * dt;
        p.x += p._vx * dt; p.y += p._vy * dt;
        p.alpha = p._life / p._maxLife;
      }
    }
    return { spawn, tick, layer };
  }

  // 설치 지점 마커
  function buildSpot(x, y) {
    const c = new PIXI.Container();
    c.x = x; c.y = y;
    const g = new PIXI.Graphics();
    g.ellipse(0, 0, 20, 9).fill({ color: 0xFFFFFF, alpha: 0.22 });
    g.ellipse(0, 0, 20, 9).stroke({ width: 1.6, color: 0xFFFFFF, alpha: 0.55 });
    g.moveTo(-6, 0).lineTo(6, 0).stroke({ width: 2, color: 0xFFFFFF, alpha: 0.6 });
    g.moveTo(0, -3.5).lineTo(0, 3.5).stroke({ width: 2, color: 0xFFFFFF, alpha: 0.6 });
    c.addChild(g);
    return c;
  }

  window.CD_ART = {
    THEMES, mixColor, smoothPath,
    buildBackground, buildAmbient, setAmbient,
    buildPath, buildCastle, buildTower, buildEnemy, buildParticles, buildSpot
  };
})();
