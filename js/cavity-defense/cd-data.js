/* ============================================================
 * CAVITY DEFENSE — 데이터/밸런스 모듈
 * 서울비디치과 공식 게임 · 타워 디펜스
 * ============================================================ */
(function () {
  'use strict';

  // ---------- 컬러 팔레트 (작업지시서 고정) ----------
  const PALETTE = {
    enamel: 0xF7F3EC,
    gum: 0xF2937B,
    gumDark: 0xD97862,
    gumLight: 0xF9B4A3,
    mint: 0x7BD8C2,
    mintDark: 0x4BAF98,
    plaque: 0x6B4E8E,
    plaqueDark: 0x4A3563,
    sugar: 0xFFD34D,
    night: 0x1E1B33,
    saliva: 0xA8DDF0,
    danger: 0xE85D5D,
    gold: 0xFFC24B
  };

  // ---------- 타워 정의 (5종 × 3단계) ----------
  // dmg: 공격력, rate: 공격 쿨(초), range: 사거리(논리px), cost: 골드
  const TOWERS = {
    brush: {
      id: 'brush', name: '칫솔 타워', icon: '🪥',
      desc: '근접 회전 스윙. 빠른 공속으로 물량을 갈아낸다.',
      eduTip: '하루 3번, 한 번에 3분. 기본기가 최강입니다.',
      hitsAir: false, type: 'melee',
      levels: [
        { name: '일반 칫솔', cost: 100, dmg: 14, rate: 0.55, range: 105 },
        { name: '미세모 칫솔', cost: 90, dmg: 22, rate: 0.45, range: 118 },
        { name: '전동 칫솔', cost: 160, dmg: 30, rate: 0.24, range: 132 }
      ]
    },
    floss: {
      id: 'floss', name: '치실 타워', icon: '🧵',
      desc: '단일 저격 레이저. 치간 은신 세균을 유일하게 감지·저격.',
      eduTip: '칫솔이 못 닿는 치아 사이 40%는 치실만이 지킵니다.',
      hitsAir: true, type: 'snipe', detects: true,
      levels: [
        { name: '왁스 치실', cost: 140, dmg: 42, rate: 1.15, range: 190 },
        { name: '치실 고리', cost: 130, dmg: 74, rate: 1.0, range: 215 },
        { name: '워터픽', cost: 220, dmg: 105, rate: 0.85, range: 245, pierce: 2 }
      ]
    },
    fluoride: {
      id: 'fluoride', name: '불소 타워', icon: '💧',
      desc: '장판 버프. 범위 내 적 슬로우 + 성채 방어 강화.',
      eduTip: '불소는 에나멜을 단단하게. 정기 불소도포의 힘.',
      hitsAir: true, type: 'aura',
      levels: [
        { name: '불소 도포', cost: 120, dmg: 4, rate: 0.5, range: 120, slow: 0.30 },
        { name: '불소 바니시', cost: 110, dmg: 7, rate: 0.5, range: 140, slow: 0.42 },
        { name: '고농도 불소', cost: 190, dmg: 11, rate: 0.5, range: 162, slow: 0.55, regen: true }
      ]
    },
    rinse: {
      id: 'rinse', name: '가글 타워', icon: '🌊',
      desc: '쿨타임 광역 파도. 경로의 적을 쓸어내리고 치석을 부순다.',
      eduTip: '치석은 칫솔로 못 뺍니다. 스케일링(전문 관리)이 답.',
      hitsAir: true, type: 'nova',
      levels: [
        { name: '가글', cost: 180, dmg: 55, rate: 3.6, range: 150, vsArmor: 3 },
        { name: '항균 가글', cost: 170, dmg: 90, rate: 3.3, range: 172, vsArmor: 4 },
        { name: '클로르헥시딘', cost: 260, dmg: 150, rate: 3.0, range: 196, vsArmor: 6 }
      ]
    },
    checkup: {
      id: 'checkup', name: '검진 타워', icon: '🔍',
      desc: '서포트. 맵 전체 은신 감지 + 주기적 골드 수급.',
      eduTip: '6개월마다 정기검진. 초기 충치는 보여야 잡습니다.',
      hitsAir: true, type: 'support', detectsGlobal: true,
      levels: [
        { name: '정기 검진', cost: 160, dmg: 0, rate: 6.0, range: 999, income: 28 },
        { name: '파노라마 촬영', cost: 150, dmg: 0, rate: 5.0, range: 999, income: 46 },
        { name: '3D CT 정밀검진', cost: 230, dmg: 0, rate: 4.0, range: 999, income: 70 }
      ]
    }
  };
  const TOWER_ORDER = ['brush', 'floss', 'fluoride', 'rinse', 'checkup'];

  // ---------- 적 정의 (7종) ----------
  // hp/speed/gold: 기본값. armor: 피해 감산. flying: 비행. stealth: 은신.
  const ENEMIES = {
    mutans: {
      id: 'mutans', name: '뮤탄스 졸병', hp: 46, speed: 62, gold: 8,
      dmgToBase: 1, size: 15, color: PALETTE.plaque,
      desc: '충치균 대표주자. 물량으로 밀어붙인다.'
    },
    sugar: {
      id: 'sugar', name: '당분 러너', hp: 30, speed: 118, gold: 10,
      dmgToBase: 1, size: 13, color: PALETTE.sugar,
      desc: '설탕가루를 흩날리며 질주. 빠르다!'
    },
    plaqueTank: {
      id: 'plaqueTank', name: '플라그 탱커', hp: 210, speed: 34, gold: 22,
      dmgToBase: 2, size: 22, color: PALETTE.plaqueDark, armor: 3,
      corrodeOnDeath: true,
      desc: '느리지만 단단. 죽으면 부식 장판을 남긴다.'
    },
    ninja: {
      id: 'ninja', name: '치간 닌자', hp: 58, speed: 84, gold: 16,
      dmgToBase: 1, size: 14, color: 0x3E3A52, stealth: true,
      desc: '치아 사이에 숨는다. 치실·검진 타워만 감지 가능.'
    },
    acid: {
      id: 'acid', name: '산성 슈터', hp: 88, speed: 46, gold: 18,
      dmgToBase: 1, size: 16, color: 0x9BC53D, shooter: true, shootRange: 170, shootRate: 2.2, shootDmg: 6,
      desc: '원거리에서 타워를 산성 공격으로 마비시킨다.'
    },
    calculus: {
      id: 'calculus', name: '치석 골렘', hp: 480, speed: 24, gold: 40,
      dmgToBase: 3, size: 26, color: 0xB8B09A, armor: 9, weakToNova: true,
      desc: '플라그가 굳었다. 방어 극강 — 가글(스케일링)에 약하다.'
    },
    bat: {
      id: 'bat', name: '야식 박쥐', hp: 64, speed: 96, gold: 15,
      dmgToBase: 1, size: 15, color: 0x5D4B8C, flying: true,
      desc: '밤에만 난다. 칫솔 근접 공격이 닿지 않는다.'
    }
  };

  // ---------- 보스 3종 ----------
  const BOSSES = {
    kraken: {
      id: 'kraken', name: '콜라 크라켄', hp: 2600, speed: 20, gold: 250,
      dmgToBase: 10, size: 44, color: 0x6B3A2A, armor: 4, boss: true,
      skill: 'acidRain', skillRate: 7,
      intro: '탄산의 심연에서 콜라 크라켄이 떠올랐다!',
      desc: '산성비를 소환해 타워를 침식시킨다.'
    },
    sugarlord: {
      id: 'sugarlord', name: '미드나잇 슈가로드', hp: 4200, speed: 18, gold: 400,
      dmgToBase: 10, size: 48, color: 0x8E44AD, armor: 5, boss: true,
      skill: 'summon', skillRate: 6.5,
      intro: '밤 12시. 야식왕이 강림했다. 지휘관님, 양치 타임을 아껴두셨습니까?',
      desc: '밤을 부르고 졸병을 무한 소환한다.'
    },
    lich: {
      id: 'lich', name: '치주염 리치', hp: 6400, speed: 16, gold: 600,
      dmgToBase: 10, size: 50, color: 0x2E4053, armor: 7, boss: true,
      skill: 'corrupt', skillRate: 9,
      intro: '잇몸 깊은 곳의 지배자, 치주염 리치가 깨어났다.',
      desc: '잇몸 지형 자체를 잠식한다. 타워 설치 타일이 침식된다.'
    }
  };

  // ---------- 웨이브 생성기 ----------
  // 각 스테이지 20웨이브. [type, count, interval(초), delay(초)]
  function buildWaves(stage) {
    const W = [];
    const push = (arr) => W.push(arr);
    if (stage === 1) {
      push([['mutans', 6, 1.3]]);
      push([['mutans', 9, 1.1]]);
      push([['mutans', 6, 1.0], ['sugar', 4, 0.9, 4]]);
      push([['sugar', 10, 0.75]]);
      push([['mutans', 10, 0.9], ['sugar', 5, 0.8, 5]]);
      push([['plaqueTank', 2, 3.5], ['mutans', 8, 0.9, 2]]);
      push([['sugar', 8, 0.7], ['plaqueTank', 3, 3.0, 3]]);
      push([['mutans', 14, 0.7], ['sugar', 6, 0.8, 6]]);
      push([['plaqueTank', 4, 2.6], ['sugar', 8, 0.65, 2]]);
      push([['kraken', 1, 1]]); // 미드보스
      push([['mutans', 12, 0.65], ['ninja', 3, 2.0, 4]]);
      push([['ninja', 6, 1.4], ['sugar', 8, 0.7, 3]]);
      push([['mutans', 16, 0.6], ['plaqueTank', 3, 3.0, 5]]);
      push([['sugar', 14, 0.55], ['ninja', 4, 1.8, 4]]);
      push([['plaqueTank', 6, 2.2], ['mutans', 10, 0.7, 3]]);
      push([['mutans', 18, 0.55], ['sugar', 10, 0.6, 5], ['ninja', 4, 2.0, 8]]);
      push([['plaqueTank', 5, 2.4], ['ninja', 6, 1.5, 3]]);
      push([['sugar', 18, 0.5], ['plaqueTank', 4, 2.8, 6]]);
      push([['mutans', 20, 0.5], ['ninja', 8, 1.2, 4], ['plaqueTank', 4, 3.0, 8]]);
      push([['kraken', 1, 1], ['mutans', 10, 1.2, 8]]); // 최종보스
    } else if (stage === 2) {
      push([['mutans', 10, 0.9]]);
      push([['sugar', 10, 0.7], ['mutans', 8, 0.9, 3]]);
      push([['ninja', 5, 1.6], ['sugar', 8, 0.7, 2]]);
      push([['acid', 3, 2.5], ['mutans', 10, 0.8, 2]]);
      push([['plaqueTank', 4, 2.5], ['acid', 3, 2.5, 4]]);
      push([['bat', 6, 1.2]]);
      push([['bat', 8, 1.0], ['sugar', 10, 0.6, 3]]);
      push([['acid', 5, 2.0], ['ninja', 6, 1.4, 3]]);
      push([['plaqueTank', 6, 2.0], ['bat', 6, 1.2, 4]]);
      push([['calculus', 1, 1], ['mutans', 12, 0.7, 3]]); // 미드보스급
      push([['mutans', 18, 0.55], ['acid', 4, 2.2, 5]]);
      push([['bat', 10, 0.9], ['ninja', 6, 1.3, 3]]);
      push([['calculus', 2, 5.0], ['sugar', 14, 0.55, 3]]);
      push([['acid', 7, 1.7], ['plaqueTank', 5, 2.2, 4]]);
      push([['bat', 12, 0.8], ['sugar', 12, 0.55, 4]]);
      push([['calculus', 2, 5.0], ['ninja', 8, 1.2, 3], ['mutans', 14, 0.6, 6]]);
      push([['acid', 8, 1.5], ['bat', 10, 0.9, 4]]);
      push([['plaqueTank', 8, 1.8], ['calculus', 2, 6.0, 5]]);
      push([['mutans', 24, 0.45], ['bat', 10, 0.9, 5], ['acid', 6, 1.8, 8]]);
      push([['sugarlord', 1, 1]]); // 야식왕
    } else {
      push([['mutans', 14, 0.7], ['sugar', 8, 0.7, 3]]);
      push([['ninja', 8, 1.2], ['acid', 4, 2.2, 3]]);
      push([['plaqueTank', 6, 2.0], ['bat', 8, 1.0, 3]]);
      push([['calculus', 2, 4.5], ['sugar', 12, 0.55, 3]]);
      push([['acid', 8, 1.5], ['ninja', 8, 1.2, 4]]);
      push([['bat', 14, 0.75], ['mutans', 14, 0.6, 4]]);
      push([['calculus', 3, 4.0], ['acid', 6, 1.8, 4]]);
      push([['plaqueTank', 10, 1.5], ['ninja', 10, 1.0, 4]]);
      push([['sugar', 22, 0.42], ['bat', 12, 0.8, 4]]);
      push([['kraken', 1, 1], ['calculus', 2, 6.0, 8]]);
      push([['mutans', 26, 0.42], ['acid', 8, 1.4, 5]]);
      push([['ninja', 14, 0.85], ['bat', 12, 0.8, 3]]);
      push([['calculus', 4, 3.5], ['plaqueTank', 8, 1.6, 4]]);
      push([['acid', 10, 1.3], ['sugar', 20, 0.42, 4]]);
      push([['bat', 18, 0.6], ['ninja', 12, 0.9, 4]]);
      push([['sugarlord', 1, 1], ['mutans', 14, 0.7, 8]]);
      push([['calculus', 5, 3.2], ['acid', 10, 1.2, 4]]);
      push([['plaqueTank', 12, 1.3], ['bat', 16, 0.65, 5]]);
      push([['mutans', 30, 0.36], ['ninja', 14, 0.8, 5], ['calculus', 4, 4.0, 10]]);
      push([['lich', 1, 1], ['bat', 12, 1.0, 10]]); // 치주염 리치
    }
    return W;
  }

  // 웨이브 스케일링 — 스테이지·웨이브 진행에 따라 강해짐
  function enemyScale(stage, wave) {
    const s = 1 + (stage - 1) * 0.55;
    const w = 1 + (wave - 1) * 0.085;
    return { hp: s * w, speed: Math.min(1.35, 1 + (wave - 1) * 0.012), gold: 1 + (stage - 1) * 0.2 };
  }

  // ---------- 스테이지 정의 ----------
  // path: 0~1 정규화 좌표 (세로 모바일 기준 뷰). spots: 타워 설치 지점.
  const STAGES = [
    {
      id: 1, name: '유치 시대', sub: '6살의 입속 — 젖니 성채를 지켜라',
      theme: 'morning', lives: 10, gold: 320,
      clearTip: '경로 1개. 사탕 군단의 물량전. 칫솔 기본기를 다지세요.',
      paths: [
        [[0.08, -0.05], [0.16, 0.12], [0.42, 0.18], [0.72, 0.14], [0.88, 0.26],
         [0.78, 0.40], [0.42, 0.44], [0.16, 0.50], [0.14, 0.64], [0.38, 0.70],
         [0.70, 0.68], [0.86, 0.78], [0.66, 0.90], [0.50, 0.97]]
      ],
      spots: [
        [0.28, 0.10], [0.58, 0.09], [0.80, 0.17], [0.62, 0.24], [0.30, 0.28],
        [0.86, 0.40], [0.58, 0.36], [0.30, 0.52], [0.14, 0.42], [0.50, 0.56],
        [0.26, 0.72], [0.54, 0.80], [0.78, 0.60], [0.86, 0.88], [0.40, 0.88]
      ]
    },
    {
      id: 2, name: '영구치 전선', sub: '20대의 입속 — 커피와 야식이 몰려온다',
      theme: 'evening', lives: 10, gold: 380,
      clearTip: '경로 2갈래 + 비행 야식 박쥐. 치실·가글 배치가 승부처.',
      paths: [
        [[0.10, -0.05], [0.14, 0.14], [0.36, 0.22], [0.30, 0.40], [0.12, 0.50],
         [0.20, 0.66], [0.46, 0.72], [0.50, 0.85], [0.50, 0.97]],
        [[0.90, -0.05], [0.86, 0.16], [0.64, 0.24], [0.72, 0.42], [0.88, 0.52],
         [0.78, 0.68], [0.54, 0.72], [0.50, 0.85], [0.50, 0.97]]
      ],
      spots: [
        [0.25, 0.10], [0.75, 0.10], [0.50, 0.18], [0.48, 0.32], [0.18, 0.30],
        [0.82, 0.32], [0.50, 0.47], [0.30, 0.56], [0.70, 0.58], [0.10, 0.62],
        [0.90, 0.66], [0.34, 0.80], [0.66, 0.82], [0.50, 0.60], [0.18, 0.80], [0.82, 0.88]
      ]
    },
    {
      id: 3, name: '임플란트 요새', sub: '60대의 입속 — 최후의 방어선',
      theme: 'night', lives: 10, gold: 440,
      clearTip: '경로 3갈래. 치주염 리치가 설치 타일을 잠식한다. 최고 난이도.',
      paths: [
        [[0.06, -0.05], [0.12, 0.18], [0.30, 0.30], [0.24, 0.52], [0.38, 0.66], [0.50, 0.80], [0.50, 0.97]],
        [[0.50, -0.05], [0.54, 0.16], [0.46, 0.34], [0.56, 0.52], [0.48, 0.68], [0.50, 0.80], [0.50, 0.97]],
        [[0.94, -0.05], [0.88, 0.18], [0.70, 0.30], [0.76, 0.52], [0.62, 0.66], [0.50, 0.80], [0.50, 0.97]]
      ],
      spots: [
        [0.24, 0.12], [0.70, 0.10], [0.40, 0.22], [0.62, 0.22], [0.14, 0.36],
        [0.86, 0.38], [0.36, 0.42], [0.66, 0.44], [0.50, 0.44], [0.12, 0.58],
        [0.88, 0.60], [0.36, 0.56], [0.64, 0.57], [0.28, 0.72], [0.72, 0.74],
        [0.50, 0.60], [0.38, 0.86], [0.62, 0.88]
      ]
    }
  ];

  // ---------- 양치 타임 (시그니처) ----------
  const BRUSH_TIME = {
    chargeWaves: 3,          // 3웨이브 클리어마다 1회 충전
    maxCharges: 2,
    duration: 3.33,          // 연출상 3.33초 (3분 33초의 게임 압축)
    dmgFull: 260,            // 웨이브 사이(식후) 발동 시
    dmgHalf: 130,            // 웨이브 도중 발동 시 (효율 반감)
    label: '양치 타임',
    hint: '웨이브 사이(식후)에 발동하면 효과 2배!'
  };

  // ---------- 계급 (점수 공유) ----------
  const RANKS = [
    { min: 0, name: '플라그 견습생', icon: '🦠' },
    { min: 3000, name: '치실 기사', icon: '🗡️' },
    { min: 8000, name: '불소 마법사', icon: '🧙' },
    { min: 16000, name: '에나멜 수호자', icon: '🛡️' },
    { min: 28000, name: 'BD 그랜드마스터', icon: '👑' }
  ];

  // ---------- 카피 ----------
  const COPY = {
    waveWarn: [
      '세균 군단이 접근 중입니다. 방어선을 점검하십시오.',
      '당분 냄새가 납니다... 러너들이 옵니다.',
      '플라그가 뭉치고 있습니다. 단단히 준비하십시오.',
      '치아 사이가 수상합니다. 치실은 준비되셨습니까?',
      '야식 군단이 접근 중입니다. 지휘관님, 양치 타임을 아껴두셨습니까?'
    ],
    calculusWarn: '플라그가 굳었습니다. 이제 칫솔로는 늦었습니다. — 가글(스케일링)을 배치하십시오.',
    bossClear: ['밤 12시를 사수했습니다. 내일 아침도 부탁합니다.', '전선은 지켜졌다. 하지만 세균은 매일 돌아온다.'],
    gameOver: {
      title: '충치가 발생했습니다.',
      body: '게임은 다시 시작할 수 있지만,\n실제 치아는 리셋이 없습니다.',
      cta: '내 치아 상태 확인하기'
    },
    clear: {
      title: '입속 전장을 사수했습니다!',
      body: '현실에서도 이 방어력, 유지하고 계신가요?'
    }
  };

  window.CD_DATA = { PALETTE, TOWERS, TOWER_ORDER, ENEMIES, BOSSES, STAGES, buildWaves, enemyScale, BRUSH_TIME, RANKS, COPY };
})();
