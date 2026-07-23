/* ============================================================
 * 서울비디치과 — 치아 번호 조회기 (Interactive Tooth Chart)
 * https://bdbddc.com/encyclopedia/치아 번호
 * FDI · Universal · Palmer 3표기 지원 / 영구치 32 + 유치 20
 * 의존성 없음 (Vanilla JS + inline SVG) — 페이지·임베드 위젯 공용 엔진
 * © Seoul BD Dental Clinic — 퍼가실 때 출처 링크를 남겨주세요 🙏
 *
 * API:
 *   var chart = BDToothChart.render('#el', { onSelect: fn(tooth) })
 *   chart.setMode('permanent'|'deciduous') / chart.getMode()
 *   chart.setNotation('fdi'|'universal'|'palmer')
 *   chart.select('26') -> boolean (FDI 번호로 선택, 필요 시 모드 자동 전환)
 *   BDToothChart.getTooth('26') -> tooth 객체
 *   BDToothChart.infoPanelHtml(tooth) -> 정보 패널 HTML
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 치아 기본 데이터 ---------- */
  var POS_PERM = {
    1: { ko: '중절치', en: 'Central Incisor', type: 'incisor',
         erupt: { U: '7~8세', L: '6~7세' }, roots: { U: 1, L: 1 },
         fact: '웃을 때 가장 먼저 보이는 "미소의 주인공". 부딪혀 깨지는 외상이 가장 잦은 치아이기도 합니다.' },
    2: { ko: '측절치', en: 'Lateral Incisor', type: 'incisor',
         erupt: { U: '8~9세', L: '7~8세' }, roots: { U: 1, L: 1 },
         fact: '중절치 옆의 작은 앞니. 선천적으로 없거나(결손치) 유난히 작게 나는(왜소치) 경우가 종종 있는 위치입니다.' },
    3: { ko: '견치(송곳니)', en: 'Canine', type: 'canine',
         erupt: { U: '11~12세', L: '9~10세' }, roots: { U: 1, L: 1 },
         fact: '전체 치아 중 뿌리가 가장 길어 수명도 가장 긴 치아. 입꼬리 라인을 지탱해 인상에도 큰 영향을 줍니다.' },
    4: { ko: '제1소구치', en: 'First Premolar', type: 'premolar',
         erupt: { U: '10~11세', L: '10~12세' }, roots: { U: 2, L: 1 },
         fact: '교정 치료에서 공간 확보를 위해 발치 1순위로 자주 언급되는 치아입니다. (위쪽은 뿌리가 2개인 경우가 많아요)' },
    5: { ko: '제2소구치', en: 'Second Premolar', type: 'premolar',
         erupt: { U: '10~12세', L: '11~12세' }, roots: { U: 1, L: 1 },
         fact: '음식을 잘게 부수는 중간 어금니. 영구치 선천 결손이 비교적 흔한 위치라 소아 검진에서 꼭 확인합니다.' },
    6: { ko: '제1대구치', en: 'First Molar', type: 'molar',
         erupt: { U: '6~7세', L: '6~7세' }, roots: { U: 3, L: 2 },
         fact: '만 6세쯤 나오는 최초의 영구치, 일명 "6세 구치". 평생 씹기의 기둥이지만 충치가 가장 잘 생기는 치아라 실란트를 꼭 검토하세요!' },
    7: { ko: '제2대구치', en: 'Second Molar', type: 'molar',
         erupt: { U: '12~13세', L: '11~13세' }, roots: { U: 3, L: 2 },
         fact: '만 12세쯤 나오는 "12세 구치". 칫솔이 잘 닿지 않는 안쪽이라 충치·잇몸 관리가 특히 중요합니다.' },
    8: { ko: '제3대구치(사랑니)', en: 'Third Molar (Wisdom)', type: 'molar',
         erupt: { U: '17~25세', L: '17~25세' }, roots: { U: 3, L: 2 },
         fact: '17~25세에 나오는 마지막 치아. 누워서 나거나(매복) 일부만 나오는 경우가 흔해 발치 여부 검진이 필요합니다.' }
  };
  var POS_DECID = {
    1: { ko: '유중절치', en: 'Primary Central Incisor', type: 'incisor',
         erupt: { U: '생후 8~12개월', L: '생후 6~10개월' }, shed: '6~7세', succ: 1,
         fact: '생후 6개월쯤 아래 앞니부터 "첫 이"가 납니다. 이가 나면서부터 거즈·유아용 칫솔 관리를 시작하세요.' },
    2: { ko: '유측절치', en: 'Primary Lateral Incisor', type: 'incisor',
         erupt: { U: '생후 9~13개월', L: '생후 10~16개월' }, shed: '7~8세', succ: 2,
         fact: '앞니 4개가 나면 이유식 씹기가 본격 시작됩니다. 밤중 수유는 앞니 충치(우유병 우식)의 주범이에요.' },
    3: { ko: '유견치', en: 'Primary Canine', type: 'canine',
         erupt: { U: '생후 16~22개월', L: '생후 17~23개월' }, shed: '9~12세', succ: 3,
         fact: '유치 중 가장 늦게까지 남는 치아 중 하나. 너무 일찍 빠지면 영구치 자리가 좁아질 수 있어 공간 관리가 필요합니다.' },
    4: { ko: '제1유구치', en: 'Primary First Molar', type: 'premolar',
         erupt: { U: '생후 13~19개월', L: '생후 14~18개월' }, shed: '9~11세', succ: 4,
         fact: '아이가 밥을 씹기 시작하게 해주는 첫 어금니. 빠진 자리는 제1소구치(4번)가 이어받습니다.' },
    5: { ko: '제2유구치', en: 'Primary Second Molar', type: 'molar',
         erupt: { U: '생후 25~33개월', L: '생후 23~31개월' }, shed: '10~12세', succ: 5,
         fact: '주의! 이 치아 "뒤"에서 만 6세쯤 나는 어금니는 유치가 아니라 평생 쓸 영구치(6세 구치)입니다. 헷갈려 방치하면 안 돼요!' }
  };
  var QUAD = {
    1: { ko: '상악 우측', pos: '오른쪽 위', palmer: 'UR', arch: 'U' },
    2: { ko: '상악 좌측', pos: '왼쪽 위', palmer: 'UL', arch: 'U' },
    3: { ko: '하악 좌측', pos: '왼쪽 아래', palmer: 'LL', arch: 'L' },
    4: { ko: '하악 우측', pos: '오른쪽 아래', palmer: 'LR', arch: 'L' },
    5: { ko: '상악 우측 (유치)', pos: '오른쪽 위', palmer: 'UR', arch: 'U' },
    6: { ko: '상악 좌측 (유치)', pos: '왼쪽 위', palmer: 'UL', arch: 'U' },
    7: { ko: '하악 좌측 (유치)', pos: '왼쪽 아래', palmer: 'LL', arch: 'L' },
    8: { ko: '하악 우측 (유치)', pos: '오른쪽 아래', palmer: 'LR', arch: 'L' }
  };
  // 사분면별 파스텔 컬러 (페이지 범례와 동일)
  var QCOLOR = {
    1: { fill: '#dbeafe', stroke: '#93c5fd', text: '#1d4ed8' },
    2: { fill: '#dcfce7', stroke: '#86efac', text: '#15803d' },
    3: { fill: '#fef3c7', stroke: '#fcd34d', text: '#b45309' },
    4: { fill: '#fce7f3', stroke: '#f9a8d4', text: '#be185d' }
  };
  function qColor(q) { return QCOLOR[q > 4 ? q - 4 : q]; }
  var UNI_DECID = { 5: 'EDCBA', 6: 'FGHIJ', 7: 'ONMLK', 8: 'PQRST' };

  /* ---------- 표기 변환 ---------- */
  function toUniversal(q, p) {
    if (q === 1) return String(9 - p);
    if (q === 2) return String(8 + p);
    if (q === 3) return String(25 - p);
    if (q === 4) return String(24 + p);
    return UNI_DECID[q].charAt(p - 1);
  }
  function toPalmer(q, p) {
    return QUAD[q].palmer + (q <= 4 ? String(p) : 'ABCDE'.charAt(p - 1));
  }
  function validFdi(q, p) {
    if (q >= 1 && q <= 4) return p >= 1 && p <= 8;
    if (q >= 5 && q <= 8) return p >= 1 && p <= 5;
    return false;
  }

  /* ---------- tooth 객체 ---------- */
  function getTooth(fdiRaw) {
    var s = String(fdiRaw).trim().replace(/[^0-9]/g, '');
    if (s.length !== 2) return null;
    var q = +s[0], p = +s[1];
    if (!validFdi(q, p)) return null;
    var dec = q >= 5;
    var base = dec ? POS_DECID[p] : POS_PERM[p];
    var arch = QUAD[q].arch;
    var t = {
      fdi: s, q: q, p: p, deciduous: dec,
      ko: base.ko, en: base.en, type: base.type,
      quadKo: QUAD[q].ko, posKo: QUAD[q].pos,
      uni: toUniversal(q, p), palmer: toPalmer(q, p),
      erupt: base.erupt[arch], fact: base.fact
    };
    if (dec) {
      t.shed = base.shed;
      t.succFdi = String(q - 4) + String(base.succ);
      t.succKo = POS_PERM[base.succ].ko;
    } else {
      t.roots = base.roots[arch];
    }
    return t;
  }

  /* ---------- 정보 패널 HTML ---------- */
  function chip(label, val) {
    return '<div style="background:#fff;border:1px solid #e8dcc8;border-radius:10px;padding:6px 4px;text-align:center;min-width:74px;">' +
      '<p style="margin:0;font-size:0.65rem;color:#a08c6f;">' + label + '</p>' +
      '<p style="margin:0;font-size:0.98rem;font-weight:800;color:#6B4226;">' + val + '</p></div>';
  }
  function infoPanelHtml(t) {
    if (!t) return '';
    var h = '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;">';
    h += '<div style="flex:1;min-width:230px;">';
    h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
      '<span style="display:flex;align-items:center;justify-content:center;min-width:52px;height:52px;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;font-weight:800;font-size:1.3rem;border-radius:14px;padding:0 8px;">' + t.fdi + '</span>' +
      '<div><p style="margin:0;font-size:1.1rem;font-weight:800;color:#3E2B1F;">' + t.ko + '</p>' +
      '<p style="margin:0;font-size:0.76rem;color:#a08c6f;">' + t.en + '</p></div></div>';
    h += '<p style="margin:0 0 4px;font-size:0.87rem;color:#555;">📍 <strong style="color:#3E2B1F;">위치:</strong> ' + t.quadKo + ' — ' + t.posKo + '에서 ' + t.p + '번째</p>';
    h += '<p style="margin:0 0 4px;font-size:0.87rem;color:#555;">🌱 <strong style="color:#3E2B1F;">' + (t.deciduous ? '나는 시기' : '맹출 시기') + ':</strong> ' + t.erupt + '</p>';
    if (t.deciduous) {
      h += '<p style="margin:0 0 4px;font-size:0.87rem;color:#555;">🍂 <strong style="color:#3E2B1F;">빠지는 시기:</strong> ' + t.shed + '</p>';
      h += '<p style="margin:0 0 4px;font-size:0.87rem;color:#555;">🔁 <strong style="color:#3E2B1F;">뒤이어 나는 영구치:</strong> ' + t.succFdi + '번 ' + t.succKo + '</p>';
    } else {
      h += '<p style="margin:0 0 4px;font-size:0.87rem;color:#555;">🌳 <strong style="color:#3E2B1F;">뿌리 개수(평균):</strong> ' + t.roots + '개</p>';
    }
    h += '</div>';
    h += '<div style="display:flex;gap:6px;align-items:flex-start;">' + chip('FDI', t.fdi) + chip('Universal', t.uni) + chip('Palmer', t.palmer) + '</div>';
    h += '</div>';
    h += '<div style="background:#fff;border-left:3px solid #c9a96e;border-radius:0 10px 10px 0;padding:10px 12px;margin-top:10px;">' +
      '<p style="margin:0;font-size:0.83rem;color:#6b5d52;line-height:1.7;">💡 ' + t.fact + '</p></div>';
    return h;
  }

  /* ---------- SVG 치아 모양 (교합면 뷰) ---------- */
  function scaleP(d, s) {
    return d.replace(/-?\d+(\.\d+)?/g, function (n) { return (parseFloat(n) * s).toFixed(2); });
  }
  function toothPath(type, s) {
    if (type === 'incisor')
      return scaleP('M -8,-13 Q -10,-16 -6,-16 L 6,-16 Q 10,-16 8,-13 L 9,10 Q 9,15 0,15 Q -9,15 -9,10 Z', s);
    if (type === 'canine')
      return scaleP('M 0,-17 Q 8,-15 10,-6 Q 12,6 6,12 Q 0,16 -6,12 Q -12,6 -10,-6 Q -8,-15 0,-17 Z', s);
    if (type === 'premolar')
      return scaleP('M -10,-11 Q -12,-14 -7,-14 L 7,-14 Q 12,-14 10,-11 L 11,8 Q 11,14 0,14 Q -11,14 -11,8 Z', s);
    return scaleP('M -13,-12 Q -15,-15 -9,-15 L 9,-15 Q 15,-15 13,-12 L 14,9 Q 14,15 5,15 L -5,15 Q -14,15 -14,9 Z', s);
  }
  function grooves(type, s, col) {
    if (type === 'molar')
      return '<path d="' + scaleP('M -7,-4 Q 0,0 7,-4 M -7,6 Q 0,2 7,6', s) + '" fill="none" stroke="' + col + '" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>';
    if (type === 'premolar')
      return '<path d="' + scaleP('M -6,1 Q 0,-3 6,1', s) + '" fill="none" stroke="' + col + '" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>';
    if (type === 'incisor')
      return '<path d="' + scaleP('M -5,9 L 5,9', s) + '" fill="none" stroke="' + col + '" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>';
    return '<circle r="' + (2.2 * s).toFixed(1) + '" cy="' + (-2 * s).toFixed(1) + '" fill="' + col + '" opacity="0.6"/>';
  }

  /* ---------- 아치 좌표 ---------- */
  function buildTeeth(mode) {
    // 화면 = 환자를 마주 본 시점 (화면 왼쪽 = 환자의 오른쪽)
    var perm = mode === 'permanent';
    var count = perm ? 16 : 10;
    var half = count / 2;
    var CX = 380, RX = perm ? 320 : 244, RY = perm ? 226 : 172;
    var CYU = 282, CYL = 366;
    var qU_R = perm ? 1 : 5, qU_L = perm ? 2 : 6;   // 상악: 화면 왼쪽=환자 우측
    var qL_R = perm ? 4 : 8, qL_L = perm ? 3 : 7;   // 하악
    var teeth = [];
    for (var i = 0; i < count; i++) {
      var th = Math.PI + (i + 0.5) * Math.PI / count; // π→2π (왼→오)
      var cs = Math.cos(th), sn = Math.sin(th);       // sn ≤ 0
      var x = CX + RX * cs;
      var yU = CYU + RY * sn;   // 위로 볼록 (∩)
      var yL = CYL - RY * sn;   // 아래로 볼록 (U)
      var p, qU, qL;
      if (i < half) { qU = qU_R; qL = qL_R; p = half - i; }
      else { qU = qU_L; qL = qL_L; p = i - half + 1; }
      // 바깥 법선: 상악 (cs,sn) / 하악 (cs,-sn)
      teeth.push({ q: qU, p: p, x: x, y: yU, nx: cs, ny: sn,
        rot: Math.atan2(sn, cs) * 180 / Math.PI + 90 });
      teeth.push({ q: qL, p: p, x: x, y: yL, nx: cs, ny: -sn,
        rot: Math.atan2(-sn, cs) * 180 / Math.PI + 90 });
    }
    return teeth;
  }

  /* ---------- SVG 렌더 ---------- */
  function labelFor(q, p, notation) {
    if (notation === 'universal') return toUniversal(q, p);
    if (notation === 'palmer') return toPalmer(q, p);
    return String(q) + String(p);
  }

  function renderSVG(state) {
    var perm = state.mode === 'permanent';
    var teeth = buildTeeth(state.mode);
    var sBase = perm ? 0.98 : 0.92;
    var out = [];
    out.push('<svg viewBox="0 0 760 648" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="치아 번호 차트 (' + (perm ? '영구치 32개' : '유치 20개') + ')" style="width:100%;height:auto;display:block;">');
    out.push('<defs><filter id="bdtcSh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.4" flood-color="#8a6a45" flood-opacity="0.22"/></filter></defs>');
    // 정중선 + 라벨
    out.push('<line x1="380" y1="20" x2="380" y2="628" stroke="#d9cbb5" stroke-width="1.5" stroke-dasharray="6 6"/>');
    out.push('<text x="380" y="14" text-anchor="middle" font-size="11" fill="#a08c6f">정중선</text>');
    out.push('<text x="380" y="272" text-anchor="middle" font-size="13" font-weight="700" fill="#b09a7a">상악 (위턱)</text>');
    out.push('<text x="380" y="384" text-anchor="middle" font-size="13" font-weight="700" fill="#b09a7a">하악 (아래턱)</text>');
    out.push('<text x="16" y="318" font-size="11" fill="#a08c6f">환자의 오른쪽 →</text>');
    out.push('<text x="744" y="318" font-size="11" fill="#a08c6f" text-anchor="end">← 환자의 왼쪽</text>');

    teeth.forEach(function (t) {
      var base = t.q >= 5 ? POS_DECID[t.p] : POS_PERM[t.p];
      var typeScale = { incisor: 0.95, canine: 0.95, premolar: 1.0, molar: 1.08 }[base.type] || 1;
      var s = sBase * typeScale;
      var fdi = String(t.q) + String(t.p);
      var sel = state.selected === fdi;
      var col = qColor(t.q);
      var lblDist = perm ? 36 : 34;
      var lx = (t.nx * lblDist).toFixed(1), ly = (t.ny * lblDist + 4).toFixed(1);
      out.push('<g class="bdtc-tooth" data-fdi="' + fdi + '" transform="translate(' + t.x.toFixed(1) + ',' + t.y.toFixed(1) + ')" style="cursor:pointer;" tabindex="0" role="button" aria-label="FDI ' + fdi + '번 ' + base.ko + '">');
      out.push('<g transform="rotate(' + t.rot.toFixed(1) + ')" filter="url(#bdtcSh)">');
      out.push('<path d="' + toothPath(base.type, s) + '" fill="' + (sel ? '#ffdf9e' : col.fill) + '" stroke="' + (sel ? '#6B4226' : col.stroke) + '" stroke-width="' + (sel ? 3 : 1.5) + '" class="bdtc-shape"/>');
      out.push(grooves(base.type, s, sel ? '#b98a3e' : col.stroke));
      out.push('</g>');
      out.push('<text x="' + lx + '" y="' + ly + '" text-anchor="middle" font-size="' + (state.notation === 'palmer' ? 10.5 : 12.5) + '" font-weight="' + (sel ? '800' : '700') + '" fill="' + (sel ? '#6B4226' : col.text) + '" style="pointer-events:none;">' + labelFor(t.q, t.p, state.notation) + '</text>');
      out.push('</g>');
    });
    out.push('</svg>');
    return out.join('');
  }

  var CSS = '.bdtc-tooth:hover .bdtc-shape{stroke:#6B4226;stroke-width:2.6;}' +
    '.bdtc-tooth:focus{outline:none;}.bdtc-tooth:focus .bdtc-shape{stroke:#6B4226;stroke-width:2.6;}' +
    '.bdtc-tooth .bdtc-shape{transition:stroke .12s, fill .12s;}';

  /* ---------- 컨트롤러 ---------- */
  function render(selector, opts) {
    opts = opts || {};
    var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return null;
    if (!document.getElementById('bdtc-style')) {
      var st = document.createElement('style');
      st.id = 'bdtc-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var state = { mode: opts.mode || 'permanent', notation: opts.notation || 'fdi', selected: null };

    function paint() { el.innerHTML = renderSVG(state); }

    function fireSelect(fdi) {
      state.selected = fdi;
      paint();
      if (opts.onSelect) {
        var t = getTooth(fdi);
        try { opts.onSelect(t); } catch (e) {}
      }
      if (window.dataLayer) {
        try { window.dataLayer.push({ event: 'tooth_chart_click', tooth_fdi: fdi }); } catch (e) {}
      }
    }

    el.addEventListener('click', function (e) {
      var g = e.target.closest ? e.target.closest('.bdtc-tooth') : null;
      if (g) fireSelect(g.getAttribute('data-fdi'));
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var g = e.target.closest ? e.target.closest('.bdtc-tooth') : null;
        if (g) { e.preventDefault(); fireSelect(g.getAttribute('data-fdi')); }
      }
    });

    var ctrl = {
      setMode: function (m) {
        if (m !== 'permanent' && m !== 'deciduous') return;
        if (state.mode !== m) { state.mode = m; state.selected = null; paint(); }
      },
      getMode: function () { return state.mode; },
      setNotation: function (n) {
        if (n !== 'fdi' && n !== 'universal' && n !== 'palmer') return;
        state.notation = n; paint();
      },
      getNotation: function () { return state.notation; },
      getSelected: function () { return state.selected; },
      select: function (v) {
        var t = getTooth(v);
        if (!t) return false;
        var need = t.deciduous ? 'deciduous' : 'permanent';
        if (state.mode !== need) state.mode = need;
        state.selected = t.fdi;
        paint();
        return true;
      }
    };
    paint();

    // ?t=26 딥링크 자동 선택 (임베드/공유용)
    try {
      var qp = new URLSearchParams(window.location.search).get('t');
      if (qp && ctrl.select(qp.replace(/[#번]/g, '')) && opts.onSelect) {
        opts.onSelect(getTooth(state.selected));
      }
    } catch (e) {}

    return ctrl;
  }

  window.BDToothChart = {
    render: render,
    getTooth: getTooth,
    infoPanelHtml: infoPanelHtml,
    toUniversal: toUniversal,
    toPalmer: toPalmer
  };
})();
