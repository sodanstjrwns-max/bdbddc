// ============================================================
// 백과사전 슈퍼 콘텐츠 v5.38 — "제로클릭 거인" 2차 회수 8종
// GSC ctr_low 잔여분: 순위는 좋은데 클릭이 0~1인 = 제목이 병목인 용어
//   측절치(65/0, 4.6위) · 지도설(56/0, 9.2위) · 교두(47/0, 7.2위)
//   대합치(46/1, 3.5위) · 치수강(45/1, 4.1위) · 중절치(45/0, 6.0위)
//   설면(42/0, 3.2위) · 파워체인(36/0, 7.2위)
//   → 합계 382노출 / 2클릭 (CTR 0.5%)
// 공식(v5.30~v5.34 검증): 제목에 답 예고 + 인터랙티브 위젯 + 표 구조 + 검색의도 100% 해소
// 팩트 소스: pricing.html 공식 수가 = 챗봇 KB = llms.txt (4소스 정합)
// ============================================================

import type { SuperContent } from './enc-super'

const TH = 'border:1px solid #e0d4c0;padding:8px 10px;background:#f5f0eb;color:#6B4226;font-size:0.83rem;'
const TD = 'border:1px solid #e0d4c0;padding:8px 10px;font-size:0.86rem;'
const TDC = TD + 'text-align:center;'
const BOX = 'background:#faf7f3;border-left:4px solid #c9a96e;padding:14px 18px;border-radius:0 12px 12px 0;margin:16px 0;'
const WARN = 'background:#fff8ec;border:1px solid #ecd9b4;border-radius:12px;padding:14px 18px;margin:16px 0;'
const enc = (t: string) => `/encyclopedia/${encodeURIComponent(t)}`
const A = (t: string, label?: string) => `<a href="${enc(t)}" style="color:#6B4226;text-decoration:underline;text-decoration-style:dotted;font-weight:600;">${label || t}</a>`

const WBOX = 'background:linear-gradient(135deg,#faf7f3,#f5efe6);border:1px solid #e5d7c0;border-radius:16px;padding:20px;margin:22px 0;'
const WTITLE = 'font-size:1.05rem;font-weight:800;color:#3E2B1F;margin:0 0 4px;display:flex;align-items:center;gap:8px;'
const WSUB = 'font-size:0.82rem;color:#8a7a66;margin:0 0 16px;'
const WBTN = 'cursor:pointer;border:1px solid #d4b896;background:#fff;color:#6B4226;border-radius:10px;padding:9px 13px;font-size:0.85rem;font-weight:600;transition:all .18s;'

/* ============================================================
 * 위젯 A — 치아 5면 탐색기 (설면·교두 공용)
 *   치아의 다섯 면을 눌러 명칭·영문·특징·관리법을 확인
 * ============================================================ */
export const WIDGET_TOOTH_SURFACE = (uid: string, defaultKey: string) => `
<div style="${WBOX}" id="ts-${uid}">
<p style="${WTITLE}">🧭 치아 5면(面) 탐색기</p>
<p style="${WSUB}">치아의 각 면을 누르면 정식 명칭·영문 용어·해부학적 특징·관리 포인트를 알려드립니다</p>
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;" role="tablist">
<button class="ts-b" data-k="li" style="${WBTN}">설면(혀 쪽)</button>
<button class="ts-b" data-k="bu" style="${WBTN}">협면(볼 쪽)</button>
<button class="ts-b" data-k="oc" style="${WBTN}">교합면(씹는 면)</button>
<button class="ts-b" data-k="me" style="${WBTN}">근심면(앞쪽)</button>
<button class="ts-b" data-k="di" style="${WBTN}">원심면(뒤쪽)</button>
</div>
<div id="ts-${uid}-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('ts-${uid}');if(!box)return;
var panel=box.querySelector('#ts-${uid}-p');
var D={
 li:{n:'설면 / 구개면',e:'Lingual Surface / Palatal Surface',pos:'혀와 마주보는 안쪽 면',
   feat:['앞니 설면에는 오목한 함요부(Cingulum)가 있어 음식을 입천장으로 밀어 올립니다','위턱 치아의 설면은 입천장을 향하므로 <b>구개면(Palatal)</b>이라 부릅니다','아래 앞니 설면은 침샘이 바로 옆이라 <b>치석이 가장 빨리 쌓이는 부위</b>입니다'],
   care:'칫솔을 세로로 세워 위아래로 부드럽게 닦으세요. 아래 앞니 안쪽은 아무리 잘 닦아도 치석이 생기므로 6개월~1년 주기 스케일링이 필수입니다.',
   tip:'설측 교정(보이지 않는 교정)은 바로 이 면에 브라켓을 붙입니다.'},
 bu:{n:'협면 / 순면',e:'Buccal Surface / Labial Surface',pos:'볼·입술과 마주보는 바깥쪽 면',
   feat:['어금니 쪽은 볼과 닿으므로 <b>협면(Buccal)</b>, 앞니 쪽은 입술과 닿으므로 <b>순면(Labial)</b>입니다','겉으로 보이는 면이라 심미 치료(미백·라미네이트)의 주 무대입니다','칫솔이 가장 잘 닿지만, 잇몸 경계선 부위는 오히려 놓치기 쉽습니다'],
   care:'칫솔을 잇몸 경계에 45도로 대고 작게 굴리세요. 세게 문지르면 이 면이 파이는 마모(치경부 마모)가 생겨 시림의 원인이 됩니다.',
   tip:'일반 교정 브라켓이 붙는 면이며, 치아 미백 효과가 가장 눈에 띄는 면입니다.'},
 oc:{n:'교합면',e:'Occlusal Surface',pos:'위아래가 맞물려 씹는 면 (어금니에만 존재)',
   feat:['<b>교두</b>(산)와 <b>소구</b>(골짜기)가 어우러진 울퉁불퉁한 구조로 음식을 으깹니다','앞니에는 교합면이 없고 대신 날카로운 <b>절단연</b>이 있습니다','홈이 깊어 <b>충치가 가장 많이 시작되는 면</b>입니다'],
   care:'칫솔을 가로로 넣어 홈 방향으로 앞뒤로 닦아야 합니다. 어린이는 새로 난 어금니에 실란트(홈 메우기)로 미리 막는 것이 효율적입니다.',
   tip:'교두가 닳으면 씹는 효율이 떨어지고 턱관절 부담이 늘어납니다.'},
 me:{n:'근심면',e:'Mesial Surface',pos:'치열 정중앙(앞쪽)을 향한 옆면',
   feat:['입 가운데를 기준으로 <b>더 가까운</b> 쪽 면입니다','인접 치아와 맞닿아 있어 칫솔모가 들어가지 않습니다','치과 차트에서 위치를 지정할 때 쓰는 기준 방향입니다'],
   care:'칫솔로는 물리적으로 닿지 않습니다. <b>치실이나 치간칫솔이 유일한 해법</b>입니다.',
   tip:'인접면 충치는 겉으로 안 보여서 X-ray로만 발견되는 경우가 많습니다.'},
 di:{n:'원심면',e:'Distal Surface',pos:'치열 정중앙에서 먼(뒤쪽) 옆면',
   feat:['입 가운데를 기준으로 <b>더 먼</b> 쪽 면입니다','맨 뒤 어금니의 원심면은 뒤에 이웃이 없어 노출됩니다','사랑니가 있으면 앞 어금니의 원심면이 급격히 관리 불가 상태가 됩니다'],
   care:'맨 뒤 어금니의 뒷면은 칫솔을 세로로 넣어 감싸듯 닦아야 합니다. 대부분 이 면을 그냥 지나칩니다.',
   tip:'사랑니 때문에 앞 어금니 원심면에 충치가 생기는 것이 사랑니 발치의 흔한 이유입니다.'}
};
function render(k){
 var d=D[k];
 panel.innerHTML='<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px;">'+
 '<strong style="font-size:1.02rem;color:#6B4226;">'+d.n+'</strong>'+
 '<span style="font-size:0.78rem;color:#a89880;">'+d.e+'</span></div>'+
 '<p style="margin:0 0 10px;color:#7a6a58;font-size:0.85rem;">📍 '+d.pos+'</p>'+
 '<ul style="margin:0 0 10px;padding-left:18px;">'+d.feat.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;margin-bottom:8px;">🪥 <b>관리</b> · '+d.care+'</div>'+
 '<p style="font-size:0.8rem;color:#8a7a66;margin:0;">💡 '+d.tip+'</p>';
}
box.querySelectorAll('.ts-b').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.ts-b').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';render(b.dataset.k);};});
var f=box.querySelector('.ts-b[data-k="${defaultKey}"]')||box.querySelector('.ts-b');
f.style.background='#6B4226';f.style.color='#fff';render(f.dataset.k);
})();</script>`

/* ============================================================
 * 위젯 B — 앞니 심미 비율 계산기 (중절치·측절치 공용)
 *   폭/길이를 입력하면 황금비율(75~80%) 대비 진단
 * ============================================================ */
export const WIDGET_INCISOR_RATIO = `
<div style="${WBOX}" id="irCalc">
<p style="${WTITLE}">📏 앞니 심미 비율 계산기</p>
<p style="${WSUB}">위 앞니의 가로·세로를 자로 재어 입력하면, 심미 기준(황금 비율)과 비교해 드립니다</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
<label style="font-size:0.85rem;color:#6B4226;font-weight:700;">가로 폭(mm)<br>
<input id="ir-w" type="number" step="0.1" min="3" max="15" value="8.5" style="width:110px;margin-top:4px;border:1px solid #d4b896;border-radius:8px;padding:8px 10px;font-size:0.9rem;font-family:inherit;"></label>
<label style="font-size:0.85rem;color:#6B4226;font-weight:700;">세로 길이(mm)<br>
<input id="ir-h" type="number" step="0.1" min="4" max="18" value="10.5" style="width:110px;margin-top:4px;border:1px solid #d4b896;border-radius:8px;padding:8px 10px;font-size:0.9rem;font-family:inherit;"></label>
<label style="font-size:0.85rem;color:#6B4226;font-weight:700;">측정 치아<br>
<select id="ir-t" style="width:130px;margin-top:4px;border:1px solid #d4b896;border-radius:8px;padding:8px 10px;font-size:0.9rem;font-family:inherit;">
<option value="ci">중절치(1번)</option><option value="li">측절치(2번)</option></select></label>
</div>
<div id="ir-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('irCalc');if(!box)return;
var w=box.querySelector('#ir-w'),h=box.querySelector('#ir-h'),t=box.querySelector('#ir-t'),p=box.querySelector('#ir-p');
var REF={ci:{lo:75,hi:80,nw:'8.3~9.3',nh:'9.5~11.5',nm:'중절치'},li:{lo:70,hi:80,nw:'6.0~7.0',nh:'7.5~9.5',nm:'측절치'}};
function render(){
 var W=parseFloat(w.value),H=parseFloat(h.value),k=t.value,r=REF[k];
 if(!W||!H||H<=0){p.innerHTML='<p style="margin:0;color:#8a7a66;">가로·세로 값을 입력해 주세요.</p>';return;}
 var ratio=(W/H)*100, rr=ratio.toFixed(1), lv,lvc,msg,adv;
 if(ratio>=r.lo&&ratio<=r.hi){
  lv='심미 기준 범위';lvc='#2d7d46';
  msg='폭/길이 비율이 <b>'+rr+'%</b>로, '+r.nm+'의 심미적 이상 범위('+r.lo+'~'+r.hi+'%) 안에 들어갑니다. 비율 자체는 자연스러운 상태입니다.';
  adv='형태 개선이 꼭 필요한 비율은 아닙니다. 색(미백)이나 배열이 고민이라면 그쪽을 먼저 상담하시는 편이 낫습니다.';
 } else if(ratio>r.hi){
  lv='짧고 넓어 보이는 형태';lvc='#b8860b';
  msg='비율이 <b>'+rr+'%</b>로 기준('+r.lo+'~'+r.hi+'%)보다 높습니다. 가로가 세로보다 상대적으로 커서 <b>치아가 짧고 뭉툭해 보이는</b> 형태입니다.';
  adv='마모로 길이가 닳았거나, 잇몸이 치아를 덮고 있는 경우가 많습니다. 잇몸 라인을 다듬는 치료나 길이를 회복하는 심미 치료로 개선할 수 있습니다.';
 } else if(ratio>=60){
  lv='길고 좁아 보이는 형태';lvc='#b8860b';
  msg='비율이 <b>'+rr+'%</b>로 기준보다 낮습니다. 세로가 상대적으로 길어 <b>치아가 좁고 길어 보이는</b> 형태입니다.';
  adv='잇몸이 내려가 뿌리가 드러난 경우인지, 원래 치아 폭이 좁은 것인지 구분이 필요합니다. 후자라면 라미네이트로 폭을 보완하기도 합니다.';
 } else {
  lv='왜소치 가능성 — 진단 권장';lvc='#c0392b';
  msg='비율이 <b>'+rr+'%</b>로 매우 낮습니다. 특히 측절치에서 이 정도로 좁으면 <b>왜소치(peg lateral)</b>일 가능성을 확인해 볼 만합니다.';
  adv='왜소치는 인구의 1~2%에서 나타나며 라미네이트나 레진 본딩으로 형태를 회복합니다. 실제 진단은 모형·사진 분석으로 이뤄집니다.';
 }
 p.innerHTML='<div style="display:inline-block;background:'+lvc+';color:#fff;border-radius:50px;padding:5px 14px;font-size:0.82rem;font-weight:700;margin-bottom:10px;">'+lv+'</div>'+
 '<p style="margin:0 0 10px;">'+msg+'</p>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;margin-bottom:8px;">👉 '+adv+'</div>'+
 '<p style="font-size:0.78rem;color:#8a7a66;margin:0;">※ 한국인 '+r.nm+' 평균 크기는 가로 '+r.nw+'mm / 세로 '+r.nh+'mm입니다. 자가 측정은 참고용이며, 실제 심미 설계는 얼굴 비율·입술 라인·잇몸 위치를 함께 분석해 결정합니다.</p>';
}
[w,h,t].forEach(function(el){el.oninput=render;el.onchange=render;});
render();
})();</script>`

/* ============================================================
 * 위젯 C — 혀 병변 자가 감별 참고 (지도설)
 *   "모양이 변하는가"를 축으로 지도설/양성/경고 신호 구분
 *   ※ 진단이 아닌 자가 참고용 (의료광고법 안전 표현)
 * ============================================================ */
export const WIDGET_TONGUE_TRIAGE = `
<div style="${WBOX}" id="tgTri">
<p style="${WTITLE}">👅 혀 반점, 지도설일까? 자가 참고 체크</p>
<p style="${WSUB}">지도설의 가장 큰 특징은 '모양이 변한다'는 점입니다. 아래를 골라 참고 정보를 확인하세요</p>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">반점의 모양·위치가 며칠~몇 주 사이에 변하나요?</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="tg-b" data-v="move" style="${WBTN}">변한다 (옮겨 다닌다)</button>
<button class="tg-b" data-v="fix" style="${WBTN}">그대로 고정되어 있다</button>
<button class="tg-b" data-v="unsure" style="${WBTN}">잘 모르겠다</button>
</div></div>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">해당되는 것을 모두 골라주세요</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="tg-x" data-v="edge" style="${WBTN}">가장자리가 흰 띠 모양</button>
<button class="tg-x" data-v="spicy" style="${WBTN}">매운 음식에 따끔거린다</button>
<button class="tg-x" data-v="pain" style="${WBTN}">가만히 있어도 아프다</button>
<button class="tg-x" data-v="ulcer" style="${WBTN}">헐거나 피가 난다</button>
<button class="tg-x" data-v="long" style="${WBTN}">3주 이상 그대로다</button>
<button class="tg-x" data-v="hard" style="${WBTN}">만지면 딱딱하게 굳었다</button>
</div></div>
<div id="tg-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('tgTri');if(!box)return;
var panel=box.querySelector('#tg-p'),mv='',ex={};
function render(){
 var red=(ex.ulcer||ex.hard||(ex.long&&mv==='fix')||ex.pain);
 var lv,lvc,msg,adv;
 if(red){
  lv='구강내과 검진 권장';lvc='#c0392b';
  msg='궤양·출혈, 딱딱하게 만져지는 느낌, 3주 이상 <b>모양이 변하지 않는</b> 병변, 자발적인 통증은 지도설의 전형적 양상과는 거리가 있습니다. 이런 신호는 구강편평태선·백반증 등 다른 병변과의 감별이 필요한 영역입니다.';
  adv='자가 판단으로 미루지 말고 구강내과 진료로 확인받는 것이 가장 확실합니다. 대부분은 양성이지만, 확인해서 안심하는 편이 낫습니다.';
 } else if(mv==='move'&&ex.edge){
  lv='지도설의 전형적 양상';lvc='#2d7d46';
  msg='<b>모양이 옮겨 다니고</b> 가장자리에 흰 띠가 보이는 조합은 지도설(양성 이주성 설염)에서 가장 흔히 보고되는 양상입니다. 인구의 1~3%에서 관찰되는 양성 상태이며 전염되지 않습니다.';
  adv='특별한 치료 없이 호전과 악화를 반복하는 것이 일반적입니다. 따끔거림이 있을 때만 자극 음식을 줄이는 정도로 관리합니다.';
 } else if(mv==='move'){
  lv='지도설 가능성 참고';lvc='#2d7d46';
  msg='반점 위치가 변하는 것은 지도설의 핵심 특징입니다. 흰 띠가 뚜렷하지 않아도 시기에 따라 다르게 보일 수 있습니다.';
  adv='통증이 없다면 대개 경과를 지켜봅니다. 매운·신 음식에 따끔거릴 때는 그 시기만 피하시면 편해집니다.';
 } else if(mv==='fix'){
  lv='다른 원인 확인 권장';lvc='#b8860b';
  msg='모양이 <b>변하지 않고 고정</b>되어 있다면 지도설의 전형적 특징(이주성)과는 맞지 않습니다. 백반증·구강칸디다증·외상성 병변 등 다른 원인일 수 있습니다.';
  adv='원인이 무엇인지에 따라 대처가 완전히 달라지므로, 한 번 진료로 확인하는 편이 효율적입니다.';
 } else {
  lv='관찰 방법 안내';lvc='#b8860b';
  msg='판단의 핵심은 <b>시간에 따른 변화</b>입니다. 지도설은 며칠~몇 주 사이에 반점이 옮겨 다닙니다.';
  adv='같은 조명에서 1~2주 간격으로 혀 사진을 찍어 비교해 보세요. 모양이 그대로면 진료로 확인하시는 것이 좋습니다.';
 }
 panel.innerHTML='<div style="display:inline-block;background:'+lvc+';color:#fff;border-radius:50px;padding:5px 14px;font-size:0.82rem;font-weight:700;margin-bottom:10px;">'+lv+'</div>'+
 '<p style="margin:0 0 10px;">'+msg+'</p>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;">👉 '+adv+'</div>'+
 '<p style="font-size:0.78rem;color:#8a7a66;margin:10px 0 0;">※ 이 체크는 진단이 아닌 <b>자가 참고용</b>입니다. 실제 감별은 구강내과 진찰과 필요시 조직검사로 이뤄집니다.</p>';
}
box.querySelectorAll('.tg-b').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.tg-b').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';mv=b.dataset.v;render();};});
box.querySelectorAll('.tg-x').forEach(function(b){b.onclick=function(){
 ex[b.dataset.v]=!ex[b.dataset.v];
 b.style.background=ex[b.dataset.v]?'#c9a96e':'#fff';b.style.color=ex[b.dataset.v]?'#fff':'#6B4226';render();};});
render();
})();</script>`

/* ============================================================
 * 위젯 D — 대합치 연쇄 반응 시뮬레이터 (대합치)
 *   치아 하나를 방치하면 무슨 일이 벌어지는지 기간별로 보여줌
 * ============================================================ */
export const WIDGET_OPPOSING_CHAIN = `
<div style="${WBOX}" id="opChain">
<p style="${WTITLE}">⛓️ 어금니 하나 빠진 채로 두면? 연쇄 반응 시뮬레이터</p>
<p style="${WSUB}">방치 기간을 골라보세요. 빈 자리와 <b>마주보는 대합치</b>에 생기는 변화를 순서대로 보여드립니다</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;" role="tablist">
<button class="op-b" data-k="0" style="${WBTN}">발치 직후</button>
<button class="op-b" data-k="1" style="${WBTN}">3~6개월</button>
<button class="op-b" data-k="2" style="${WBTN}">1~2년</button>
<button class="op-b" data-k="3" style="${WBTN}">3년 이상</button>
</div>
<div id="op-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('opChain');if(!box)return;
var panel=box.querySelector('#op-p');
var S=[
 {t:'발치 직후 — 아직 아무 일도 없음',c:'#2d7d46',
  ev:['빈 자리의 잇몸과 뼈가 아무는 단계입니다','대합치(마주보던 치아)는 씹을 상대를 잃은 상태','치아 배열은 아직 원래 위치를 유지'],
  now:'이 시점이 <b>치료 계획을 세우기 가장 좋은 때</b>입니다. 뼈가 아무는 동안 임플란트·브릿지 중 어느 방향이 맞는지 결정해 두면 이후 과정이 단순해집니다.'},
 {t:'3~6개월 — 조용히 시작되는 변화',c:'#b8860b',
  ev:['빈 자리의 <b>잇몸뼈가 줄어들기 시작</b>합니다(치조골 흡수)','대합치가 씹을 상대가 없어 서서히 아래로/위로 자라 내려옵니다 → <b>과맹출</b>','옆 치아가 빈 공간 쪽으로 미세하게 기울기 시작'],
  now:'겉으로는 아무 불편이 없어 방치하기 쉬운 구간입니다. 하지만 뼈는 이미 줄고 있어, 나중에 임플란트를 할 때 뼈 이식이 추가될 확률이 이때부터 올라갑니다.'},
 {t:'1~2년 — 눈에 보이는 변화',c:'#d35400',
  ev:['대합치의 <b>과맹출이 뚜렷</b>해져 치아 높이가 어긋납니다','옆 치아가 빈 자리로 쓰러져 <b>공간이 좁아집니다</b>','좁아진 틈에 음식물이 끼고 그 부위에 충치·잇몸 염증 발생','한쪽으로만 씹게 되어 반대편 부담 증가'],
  now:'이제 문제가 하나가 아닙니다. 원래는 임플란트 1개로 끝날 일이, 대합치 교합 조정과 기울어진 옆 치아 정리까지 얹히기 시작합니다.'},
 {t:'3년 이상 — 치료 난이도와 비용이 함께 오름',c:'#c0392b',
  ev:['대합치가 많이 내려와 <b>보철물 들어갈 높이 자체가 부족</b>해질 수 있습니다','과맹출된 대합치는 뿌리가 노출되어 흔들리거나, 심하면 그 치아까지 상실','좁아진 공간 회복을 위해 <b>부분 교정</b>이 필요해지는 경우','씹는 힘이 남은 치아에 몰려 균열·파절 위험 증가','뼈 소실이 진행되어 <b>뼈 이식(골이식) 병행</b> 가능성'],
  now:'"이 하나쯤이야"가 가장 비싸지는 구간입니다. 서울비디치과 임플란트는 80~160만원이지만, 이 단계에서는 대합치 처치·골이식·교정이 더해져 계획이 훨씬 복잡해집니다.'}
];
function render(i){
 var s=S[i];
 panel.innerHTML='<div style="display:inline-block;background:'+s.c+';color:#fff;border-radius:50px;padding:5px 14px;font-size:0.82rem;font-weight:700;margin-bottom:10px;">'+s.t+'</div>'+
 '<ul style="margin:0 0 10px;padding-left:18px;">'+s.ev.map(function(e){return '<li>'+e+'</li>';}).join('')+'</ul>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;">👉 '+s.now+'</div>'+
 '<p style="font-size:0.78rem;color:#8a7a66;margin:10px 0 0;">※ 진행 속도는 개인차가 큽니다. 실제 상태는 X-ray와 모형 분석으로 확인합니다.</p>';
}
box.querySelectorAll('.op-b').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.op-b').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';render(parseInt(b.dataset.k,10));};});
var f=box.querySelector('.op-b');f.style.background='#6B4226';f.style.color='#fff';render(0);
})();</script>`

/* ============================================================
 * 위젯 E — 치아 통증 자가 참고 트리아지 (치수강)
 *   통증 양상으로 치수 상태(가역/비가역/괴사)를 참고 안내
 *   ※ 진단이 아닌 자가 참고용
 * ============================================================ */
export const WIDGET_PULP_TRIAGE = `
<div style="${WBOX}" id="plTri">
<p style="${WTITLE}">🩺 이 통증, 신경까지 갔을까? 자가 참고 체크</p>
<p style="${WSUB}">치수(신경)가 살아 있는지에 따라 치료가 완전히 달라집니다. 통증 양상을 골라주세요</p>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">찬물·단것이 닿을 때 통증이 어떻게 되나요?</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="pl-b" data-v="quick" style="${WBTN}">순간 시리고 곧 사라진다</button>
<button class="pl-b" data-v="linger" style="${WBTN}">자극 후에도 오래 남는다</button>
<button class="pl-b" data-v="none" style="${WBTN}">이제 아무 반응이 없다</button>
</div></div>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">해당되는 것을 모두 골라주세요</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="pl-x" data-v="night" style="${WBTN}">밤에 더 아파 잠을 깬다</button>
<button class="pl-x" data-v="spon" style="${WBTN}">가만히 있어도 욱신거린다</button>
<button class="pl-x" data-v="hot" style="${WBTN}">뜨거운 것에 더 아프다</button>
<button class="pl-x" data-v="bite" style="${WBTN}">씹거나 두드리면 아프다</button>
<button class="pl-x" data-v="swell" style="${WBTN}">잇몸이 붓거나 고름이 난다</button>
<button class="pl-x" data-v="dark" style="${WBTN}">치아 색이 어두워졌다</button>
</div></div>
<div id="pl-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('plTri');if(!box)return;
var panel=box.querySelector('#pl-p'),cold='',ex={};
function render(){
 var lv,lvc,msg,adv,tx;
 if(ex.swell||ex.bite&&(cold==='none'||ex.dark)){
  lv='응급도 높음 — 빠른 내원 권장';lvc='#c0392b';
  msg='잇몸이 붓거나 고름이 나오고, 두드릴 때 아픈 양상은 <b>치수의 감염이 뿌리 끝 밖으로 퍼진 상태</b>에서 흔히 보고됩니다.';
  adv='이 단계는 시간이 지나면 저절로 낫는 종류가 아닙니다. 가능한 빨리 진료받는 것이 치아를 살릴 확률을 높입니다.';
  tx='일반적으로 근관치료(신경치료)와 배농 처치가 함께 고려되는 상황입니다.';
 } else if(cold==='none'&&ex.dark){
  lv='치수 괴사 가능성 참고';lvc='#c0392b';
  msg='시린 반응이 아예 없어졌고 치아 색이 어두워졌다면, <b>치수가 이미 활력을 잃은 상태</b>일 가능성을 확인해 볼 만합니다. 통증이 사라진 것이 나은 것이 아닐 수 있습니다.';
  adv='아프지 않아서 방치하면 뿌리 끝에 병소가 커지는 경우가 있습니다. 검사로 활력 여부를 확인하는 것이 우선입니다.';
  tx='활력 검사와 X-ray 결과에 따라 근관치료, 그리고 변색된 치아는 내부 미백이 함께 논의됩니다.';
 } else if(cold==='linger'||ex.night||ex.spon||ex.hot){
  lv='비가역적 변화 가능성';lvc='#d35400';
  msg='자극이 사라진 뒤에도 통증이 남거나, <b>가만히 있어도 욱신거리고 밤에 심해지는</b> 양상은 치수의 염증이 회복하기 어려운 단계로 넘어갔을 때 흔히 나타납니다. 뜨거운 것에 더 아픈 것도 같은 방향의 신호입니다.';
  adv='이 단계에서는 충치만 제거하는 치료로 끝나지 않는 경우가 많습니다. 진통제로 버티는 동안 상태가 진행될 수 있어 조기 진료가 유리합니다.';
  tx='일반적으로 근관치료(신경치료)가 검토되며, 이후 크라운으로 치아를 보호하는 순서로 진행됩니다.';
 } else if(cold==='quick'){
  lv='가역적 단계일 수 있음';lvc='#2d7d46';
  msg='찬 것에 <b>순간 시리고 곧 사라지는</b> 양상은 치수가 아직 회복 가능한 상태에서 자주 보이는 반응입니다. 초기 충치, 잇몸 내려감, 마모 등이 원인일 수 있습니다.';
  adv='이 시점에 원인을 잡으면 신경치료 없이 끝날 가능성이 높습니다. 반대로 미루면 위 단계로 넘어갑니다.';
  tx='원인에 따라 충치 제거 후 수복, 시린이 처치, 필요시 치수를 보존하는 처치가 고려됩니다.';
 } else {
  lv='관찰 포인트 안내';lvc='#b8860b';
  msg='판단의 핵심은 <b>자극이 사라진 뒤에도 통증이 남는지</b>입니다. 여기서 치료 방향이 갈립니다.';
  adv='며칠간 통증이 언제·얼마나 지속되는지 기록해 두시면 진료 시 훨씬 정확한 판단에 도움이 됩니다.';
  tx='';
 }
 panel.innerHTML='<div style="display:inline-block;background:'+lvc+';color:#fff;border-radius:50px;padding:5px 14px;font-size:0.82rem;font-weight:700;margin-bottom:10px;">'+lv+'</div>'+
 '<p style="margin:0 0 10px;">'+msg+'</p>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;">👉 '+adv+'</div>'+
 (tx?'<p style="margin:10px 0 0;font-size:0.85rem;color:#6B4226;">🦷 '+tx+'</p>':'')+
 '<p style="font-size:0.78rem;color:#8a7a66;margin:10px 0 0;">※ 이 체크는 진단이 아닌 <b>자가 참고용</b>입니다. 실제 판단은 활력 검사·타진 검사·X-ray(필요시 CBCT)로 이뤄집니다.</p>';
}
box.querySelectorAll('.pl-b').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.pl-b').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';cold=b.dataset.v;render();};});
box.querySelectorAll('.pl-x').forEach(function(b){b.onclick=function(){
 ex[b.dataset.v]=!ex[b.dataset.v];
 b.style.background=ex[b.dataset.v]?'#c9a96e':'#fff';b.style.color=ex[b.dataset.v]?'#fff':'#6B4226';render();};});
render();
})();</script>`

/* ============================================================
 * 위젯 F — 파워체인 교체 주기 & 변색 관리 (파워체인)
 * ============================================================ */
export const WIDGET_POWERCHAIN_CARE = `
<div style="${WBOX}" id="pcCare">
<p style="${WTITLE}">🔗 파워체인, 지금 어떤 상태일까?</p>
<p style="${WSUB}">교정 중 가장 많이 받는 질문들을 상황별로 정리했습니다</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;" role="tablist">
<button class="pc-b" data-k="0" style="${WBTN}">언제 갈아야 하나</button>
<button class="pc-b" data-k="1" style="${WBTN}">색이 변했다</button>
<button class="pc-b" data-k="2" style="${WBTN}">끊어졌다</button>
<button class="pc-b" data-k="3" style="${WBTN}">너무 아프다</button>
<button class="pc-b" data-k="4" style="${WBTN}">양치가 어렵다</button>
</div>
<div id="pc-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('pcCare');if(!box)return;
var panel=box.querySelector('#pc-p');
var Q=[
 {t:'교체 주기',c:'#6B4226',
  a:'보통 <b>4~6주 간격</b>, 즉 교정 정기 점검 때마다 새것으로 교체합니다.',
  why:'고무 재질이라 시간이 지나면 늘어나 <b>당기는 힘이 절반 이하로 떨어집니다</b>. 처음 며칠이 가장 강하게 작용하고 이후 서서히 약해지므로, 힘이 다 빠지기 전에 갈아야 치아가 계획대로 움직입니다.',
  tip:'"아직 안 끊어졌으니 괜찮다"가 아닙니다. 멀쩡해 보여도 힘은 이미 빠져 있습니다. 예약을 미루면 그만큼 교정 기간이 늘어납니다.'},
 {t:'변색',c:'#b8860b',
  a:'커피·홍차·카레·김치·와인 등 <b>색소가 강한 음식</b>에 물듭니다. 흰색·투명 계열일 때 특히 잘 보입니다.',
  why:'변색은 <b>기능에는 영향이 없습니다</b>. 힘도 그대로 작용합니다. 순전히 보기 문제이며, 다음 교체 때 새것으로 바뀌면 해결됩니다.',
  tip:'신경 쓰이면 회색·은색 계열을 요청하시면 변색이 눈에 덜 띕니다. 색소 음료를 마신 뒤 물로 입을 헹구는 것만으로도 꽤 줄어듭니다.'},
 {t:'끊어졌을 때',c:'#d35400',
  a:'끊어졌거나 빠졌다면 <b>치과에 연락해 일정을 조정</b>하세요. 다음 예약까지 오래 남았다면 앞당기는 편이 좋습니다.',
  why:'파워체인이 하는 일은 공간을 닫는 것입니다. 끊어진 채 방치하면 힘이 사라져 <b>닫히던 공간이 다시 벌어지기도</b> 합니다. 되돌리는 데 그만큼 시간이 더 듭니다.',
  tip:'튀어나온 부분이 볼을 찌르면 교정용 왁스로 덮어 임시로 보호하세요. 직접 자르거나 당겨서 조정하는 것은 위험합니다.'},
 {t:'통증',c:'#b8860b',
  a:'새로 끼운 뒤 <b>2~3일간 묵직하게 아픈 것은 흔한 반응</b>입니다. 치아가 움직이고 있다는 신호입니다.',
  why:'파워체인은 지속적으로 당기는 힘을 주기 때문에 처음 며칠이 가장 강합니다. 대개 사흘 정도면 잦아듭니다.',
  tip:'그 기간은 부드러운 음식으로 넘기고, 필요하면 일반 진통제를 사용하셔도 됩니다. 다만 <b>일주일 넘게 심한 통증이 이어지거나 특정 한 치아만 콕콕 아프면</b> 점검이 필요합니다.'},
 {t:'양치·관리',c:'#2d7d46',
  a:'파워체인은 <b>음식물과 플라그가 가장 잘 끼는 장치</b>입니다. 교정 중 충치·잇몸 염증의 주요 발생 지점입니다.',
  why:'고무링 사이사이에 음식물이 걸리고, 브라켓 주변까지 겹쳐 칫솔이 닿기 어렵습니다. 관리를 놓치면 교정이 끝난 뒤 치아에 <b>흰 반점(탈회)</b>이 남을 수 있습니다.',
  tip:'교정용 칫솔(V자 홈)로 브라켓 위·아래를 나눠 닦고, <b>치간칫솔로 브라켓 사이</b>를 통과시키세요. 워터픽을 함께 쓰면 훨씬 편합니다. 교정 중에는 3~6개월마다 스케일링을 권장합니다.'}
];
function render(i){
 var q=Q[i];
 panel.innerHTML='<div style="display:inline-block;background:'+q.c+';color:#fff;border-radius:50px;padding:5px 14px;font-size:0.82rem;font-weight:700;margin-bottom:10px;">'+q.t+'</div>'+
 '<p style="margin:0 0 8px;">'+q.a+'</p>'+
 '<p style="margin:0 0 10px;color:#5a4a38;">'+q.why+'</p>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;">👉 '+q.tip+'</div>';
}
box.querySelectorAll('.pc-b').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.pc-b').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';render(parseInt(b.dataset.k,10));};});
var f=box.querySelector('.pc-b');f.style.background='#6B4226';f.style.color='#fff';render(0);
})();</script>`

export const ENC_SUPER_V538: Record<string, SuperContent> = {}

// ══════════════════════════════════════════════════════════
// 1. 측절치 (65노출 / 0클릭 / 4.6위) — "2번 치아", 왜소치·결손
// ══════════════════════════════════════════════════════════
ENC_SUPER_V538['측절치'] = {
  detail: `
<h3>측절치는 어느 이? — 앞니 옆 "2번 치아", 위아래 총 4개</h3>
<p><strong>측절치(lateral incisor)</strong>는 가운데 앞니(${A('중절치')}) 바로 옆, 송곳니와의 사이에 있는 치아입니다. 위·아래 좌우 각 1개씩 <strong>총 4개</strong>이며, 치식으로는 <strong>12·22·32·42번</strong>이라 표기합니다. 흔히 "2번 치아"라고 부르는 그 치아입니다.</p>
<p>그런데 측절치가 검색되는 이유는 위치 때문이 아닙니다. <strong>영구치 중 크기 변이와 선천적 결손이 가장 흔한 치아</strong>라서, "옆 앞니가 유독 작다" "한쪽만 안 났다"는 고민으로 찾아오시는 경우가 압도적으로 많습니다.</p>

<h3>측절치 위치와 크기 — 표로 정리</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">항목</th><th style="${TH}">측절치</th><th style="${TH}">비교: 중절치</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>치식 번호</strong></td><td style="${TDC}">12 · 22 · 32 · 42</td><td style="${TDC}">11 · 21 · 31 · 41</td></tr>
<tr><td style="${TD}"><strong>개수</strong></td><td style="${TDC}">4개</td><td style="${TDC}">4개</td></tr>
<tr><td style="${TD}"><strong>영문</strong></td><td style="${TDC}">lateral incisor</td><td style="${TDC}">central incisor</td></tr>
<tr><td style="${TD}"><strong>가로 폭(상악)</strong></td><td style="${TDC}">약 6.0~7.0mm</td><td style="${TDC}">약 8.3~9.3mm</td></tr>
<tr><td style="${TD}"><strong>나는 시기</strong></td><td style="${TDC}">상악 8~9세 / 하악 7~8세</td><td style="${TDC}">상악 7~8세 / 하악 6~7세</td></tr>
<tr><td style="${TD}"><strong>변이 빈도</strong></td><td style="${TDC}"><strong>가장 높음</strong></td><td style="${TDC}">낮음</td></tr>
</tbody></table>
<p>중절치의 약 <strong>2/3 크기</strong>로 작고 가늘며, 좌우 비대칭이 흔합니다. 뿌리가 길거나 휘어져 있는 경우도 많아 신경치료나 교정 시 난이도가 올라가기도 합니다.</p>

<h3>내 앞니 비율은 정상일까? (계산기)</h3>
<p>"측절치가 너무 작아 보인다"는 느낌이 실제 비율 문제인지, 아래 계산기로 확인해 보세요. 자로 재어 입력하면 심미 기준과 비교해 드립니다.</p>
${WIDGET_INCISOR_RATIO}

<h3>왜소치(peg lateral) — 측절치가 유독 작은 이유</h3>
<p>측절치가 비정상적으로 작거나 원뿔 모양으로 자란 상태를 <strong>왜소치(peg lateral)</strong>라 합니다. 인구의 <strong>1~2%</strong>에서 나타나며 한쪽만 또는 양쪽 모두 생길 수 있습니다. 병은 아니지만 웃을 때 치아 사이에 틈이 보여 상담으로 이어지는 경우가 많습니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">치료 방법</th><th style="${TH}">특징</th><th style="${TH}">비용(서울비디치과)</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>${A('라미네이트', '라미네이트(글로우네이트)')}</strong></td><td style="${TD}">정상 크기·형태로 회복. 가장 흔한 선택</td><td style="${TDC}">1본 80만원</td></tr>
<tr><td style="${TD}"><strong>${A('레진', '레진 본딩')}</strong></td><td style="${TD}">당일 완성·저렴하나 수명이 상대적으로 짧음</td><td style="${TDC}">진단 후 안내</td></tr>
<tr><td style="${TD}"><strong>${A('크라운')}</strong></td><td style="${TD}">치아 삭제가 많아 요즘은 잘 선택하지 않음</td><td style="${TDC}">진단 후 안내</td></tr>
<tr><td style="${TD}"><strong>교정 + 보철</strong></td><td style="${TD}">교정으로 공간을 정리한 뒤 라미네이트</td><td style="${TDC}">교정 300~700만원 별도</td></tr>
</tbody></table>
<p style="font-size:0.82rem;color:#8a7a68;">※ 서울비디치과 공시 수가 기준(비보험). 치아 상태에 따라 권장 방식이 달라집니다.</p>

<h3>측절치 결손 — "옆 앞니가 아예 안 났어요"</h3>
<p>측절치는 <strong>선천적 결손이 가장 흔한 영구치</strong>입니다(영구치 결손의 약 20%). 유치는 있는데 그 아래에 영구치 씨앗이 없는 경우로, 파노라마 X-ray로 확인합니다. 아이라면 <strong>만 7~9세에 한 번 찍어보는 것</strong>만으로 조기에 알 수 있습니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">옵션</th><th style="${TH}">방법</th><th style="${TH}">적합한 경우</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>공간 폐쇄</strong></td><td style="${TD}">교정으로 송곳니를 측절치 자리로 옮기고 형태 수정</td><td style="${TD}">치아가 큰 편이거나 총생이 있을 때</td></tr>
<tr><td style="${TD}"><strong>공간 유지 + 보철</strong></td><td style="${TD}">교정으로 공간을 확보한 뒤 ${A('임플란트')} 또는 브릿지</td><td style="${TD}">성장이 끝난 성인, 뼈 상태 양호</td></tr>
<tr><td style="${TD}"><strong>자가치아 이식</strong></td><td style="${TD}">사랑니 등을 측절치 자리로 옮겨 심음</td><td style="${TD}">성장기 환자, 조건이 맞을 때</td></tr>
</tbody></table>

<div style="${WARN}">
<strong>중요 — 성장기에는 임플란트를 하지 않습니다</strong><br>
턱뼈가 자라는 중에 임플란트를 심으면 주변 치아는 계속 자라는데 임플란트만 그 자리에 고정되어 결국 높이가 어긋납니다. 그래서 결손이 확인되면 <strong>성장이 끝날 때까지 공간을 지켜두는 장치</strong>로 관리하다가, 성인이 된 뒤 최종 치료를 진행합니다. 결손을 일찍 아는 것이 중요한 이유입니다.
</div>

<h3>측절치 치료에서 놓치기 쉬운 것 — "한 개만"이 어렵습니다</h3>
<p>측절치는 미소 라인의 정중앙 바로 옆에 있어 <strong>색과 형태의 오차가 가장 잘 보이는 자리</strong>입니다. 한 개만 라미네이트를 하면 옆 치아와 색·투명도를 맞추기가 매우 까다롭습니다. 그래서 실제로는 <strong>좌우 한 쌍을 함께</strong>, 또는 중절치·송곳니까지 포함해 <strong>앞니 4~6개를 함께 디자인</strong>하는 경우가 많습니다. 견적을 비교하실 때 "몇 개 기준인지"를 꼭 확인하셔야 합니다.</p>

<h3>측절치는 언제 나나요 — 시기와 체크 포인트</h3>
<p>유치 측절치는 <strong>생후 9~13개월</strong>에 나고, 영구치 측절치는 <strong>만 7~9세</strong>에 교체됩니다. ${A('중절치')}가 먼저(만 6~8세) 나고 그다음이 측절치입니다. 이 시기에 부모님께서 확인하실 포인트는 세 가지입니다.</p>
<ul style="line-height:1.9;">
<li><strong>좌우 대칭인가</strong> — 한쪽만 났는데 반대쪽이 <strong>6개월 이상</strong> 안 나면 결손이나 매복 가능성을 X-ray로 확인합니다.</li>
<li><strong>유치가 안 빠졌는데 영구치가 옆으로 나오는가</strong> — ${A('영구치 이소 맹출')}일 수 있어 조기 확인이 필요합니다.</li>
<li><strong>크기가 유독 작지 않은가</strong> — 왜소치는 이 시기에 확인해 두면 성장이 끝난 뒤 치료 계획을 미리 세울 수 있습니다.</li>
</ul>
<p>영구치가 나는 전체 순서는 ${A('영구치 맹출 순서')} 문서에서 표로 확인하실 수 있습니다.`,
  faqs: [
    { q: '측절치는 어느 치아인가요?', a: '가운데 앞니(중절치) 바로 옆, 송곳니와의 사이에 있는 앞니입니다. 위·아래 좌우 각 1개씩 총 4개이며 치식으로는 12·22·32·42번, 흔히 "2번 치아"라고 부릅니다. 영문으로는 lateral incisor입니다.' },
    { q: '측절치가 유독 작은데 왜 그런가요?', a: '측절치가 비정상적으로 작거나 원뿔 모양인 상태를 왜소치(peg lateral)라 하며, 인구의 1~2%에서 나타납니다. 측절치는 영구치 중 크기 변이가 가장 흔한 치아입니다. 병은 아니지만 웃을 때 틈이 보이면 라미네이트나 레진 본딩으로 형태를 회복할 수 있습니다.' },
    { q: '측절치 왜소치 라미네이트 비용은 얼마인가요?', a: '서울비디치과 라미네이트(글로우네이트)는 1본 80만원입니다(비보험). 다만 측절치 한 개만 하면 옆 치아와 색·형태를 맞추기 어려워 좌우 한 쌍이나 앞니 4~6개를 함께 디자인하는 경우가 많습니다. 정확한 계획과 비용은 진단 후 안내됩니다.' },
    { q: '측절치가 아예 안 났어요. 어떻게 하나요?', a: '측절치는 선천적 결손이 가장 흔한 영구치로 영구치 결손의 약 20%를 차지합니다. 파노라마 X-ray로 확인하며, 치료는 교정으로 공간을 닫는 방법, 공간을 유지한 뒤 임플란트·브릿지로 채우는 방법, 자가치아 이식 등이 있습니다. 나이와 뼈 상태에 따라 선택이 달라집니다.' },
    { q: '측절치 결손인데 바로 임플란트를 할 수 있나요?', a: '성장기에는 권장하지 않습니다. 턱뼈가 자라는 중에 임플란트를 심으면 주변 치아는 계속 자라는데 임플란트만 고정되어 나중에 높이가 어긋납니다. 성장이 끝날 때까지 공간유지장치로 자리를 지키다가 성인이 된 후 최종 치료를 진행하는 것이 일반적입니다.' },
    { q: '측절치는 몇 살에 나나요?', a: '위 측절치는 만 8~9세, 아래 측절치는 만 7~8세 무렵 납니다. 아이마다 6개월~1년 차이는 정상입니다. 다만 또래보다 1년 이상 늦거나 한쪽만 나지 않으면 선천적 결손이나 매복 가능성이 있어 파노라마 X-ray 확인을 권합니다.' },
    { q: '측절치가 벌어져 보이는데 교정해야 하나요?', a: '측절치가 작아서 생긴 틈인지, 치아 배열 문제인지 원인에 따라 다릅니다. 크기가 원인이면 라미네이트·레진으로 폭을 보완하는 것이 빠르고, 배열이 원인이면 교정이 근본적입니다. 두 가지가 겹친 경우는 교정으로 공간을 정리한 뒤 보철로 마무리합니다.' },
  ],
}

// ══════════════════════════════════════════════════════════
// 2. 중절치 (45노출 / 0클릭 / 6.0위) — "1번 치아", 황금비율·외상
// ══════════════════════════════════════════════════════════
ENC_SUPER_V538['중절치'] = {
  detail: `
<h3>중절치는 어느 이? — 가장 앞 가운데 "1번 치아", 위아래 총 4개</h3>
<p><strong>중절치(central incisor)</strong>는 입 정중앙에 있는 가장 앞쪽 치아입니다. 위·아래 각 2개씩 <strong>총 4개</strong>이며 치식으로는 <strong>11·21·31·41번</strong>, 흔히 "1번 치아"라고 부릅니다. 아이가 처음 흔들리는 이(만 6~7세)도 대개 아래 중절치입니다.</p>
<p>치아 하나가 인상 전체를 좌우한다면 그건 중절치입니다. <strong>미소의 정중앙</strong>이자, 위 중절치는 아래보다 1.5배 정도 커서 웃을 때 가장 먼저 보이는 치아입니다. 그래서 심미 치료의 출발점이자 가장 까다로운 대상이기도 합니다.</p>

<h3>중절치 위치와 크기 — 표로 정리</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">항목</th><th style="${TH}">상악 중절치</th><th style="${TH}">하악 중절치</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>치식 번호</strong></td><td style="${TDC}">11 · 21</td><td style="${TDC}">31 · 41</td></tr>
<tr><td style="${TD}"><strong>가로 폭</strong></td><td style="${TDC}">약 8.3~9.3mm</td><td style="${TDC}">약 5.0~5.5mm</td></tr>
<tr><td style="${TD}"><strong>나는 시기</strong></td><td style="${TDC}">만 7~8세</td><td style="${TDC}">만 6~7세</td></tr>
<tr><td style="${TD}"><strong>치근</strong></td><td style="${TDC}">1개 (단순)</td><td style="${TDC}">1개 (가늘고 납작)</td></tr>
<tr><td style="${TD}"><strong>영문</strong></td><td style="${TDC}" colspan="2">central incisor</td></tr>
</tbody></table>

<h3>중절치의 역할 — 외모만이 아닙니다</h3>
<ul>
<li><strong>음식 끊기</strong>: 사과·고기를 베어 무는 절단 기능의 주역입니다.</li>
<li><strong>발음</strong>: ㅅ·ㅈ·ㅊ·ㅍ·ㅂ, 영어 F·V·Th 발음에 직접 관여합니다. 중절치가 상실되거나 형태가 크게 바뀌면 <strong>발음이 새는</strong> 이유가 여기 있습니다.</li>
<li><strong>인상</strong>: 미소의 정중앙에 위치해 좌우 대칭과 비율이 얼굴 인상을 크게 좌우합니다.</li>
<li><strong>입술 지지</strong>: 위 앞니가 입술을 받쳐줍니다. 상실되면 입술이 안쪽으로 꺼져 나이 들어 보이게 됩니다.</li>
</ul>

<h3>내 중절치 비율은 황금비율일까? (계산기)</h3>
<p>심미 치과에서 말하는 <strong>황금 비율</strong>은 위 중절치의 <strong>가로 폭 ÷ 세로 길이 = 약 75~80%</strong>입니다. 이 범위일 때 가장 자연스럽다고 평가됩니다. 자로 재어 입력해 보세요.</p>
${WIDGET_INCISOR_RATIO}

<div style="${BOX}">
<strong>중절치에 대한 흔한 오해 3가지</strong>
<ul style="margin:8px 0 0;padding-left:18px;">
<li><strong>"새로 난 앞니가 누레요"</strong> → 정상입니다. 영구치는 유치보다 상아질이 두꺼워 원래 약간 누런빛입니다. 하얀 유치와 나란히 있어 더 도드라져 보일 뿐입니다.</li>
<li><strong>"앞니가 너무 커요"</strong> → 영구치는 처음부터 성인 크기로 납니다. 얼굴이 자라면서 비율이 맞아갑니다.</li>
<li><strong>"가운데가 벌어져서 났어요"</strong> → 옆 앞니와 송곳니가 나면서 대부분 좁혀집니다. 다만 만 9세 이후에도 그대로면 확인이 필요합니다.</li>
</ul>
</div>

<h3>중절치에 가장 많이 생기는 문제 — 외상</h3>
<p>중절치는 <strong>소아 치아 외상의 약 80%</strong>가 집중되는 치아입니다. 넘어지거나 부딪힐 때 가장 앞에 있어 먼저 충격을 받기 때문입니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">상황</th><th style="${TH}">대처</th><th style="${TH}">응급도</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>완전히 빠졌다</strong></td><td style="${TD}">치아 뿌리를 만지지 말고 <strong>우유나 식염수에 담가</strong> 즉시 치과로. 마른 상태로 두면 재식 성공률이 급격히 떨어집니다</td><td style="${TDC}"><strong>즉시</strong><br>(30분 내 최선)</td></tr>
<tr><td style="${TD}"><strong>흔들리거나 밀려났다</strong></td><td style="${TD}">건드리지 말고 당일 내원. ${A('정출')} 상태일 수 있어 고정 처치가 필요합니다</td><td style="${TDC}">당일</td></tr>
<tr><td style="${TD}"><strong>일부 깨졌다</strong></td><td style="${TD}">깨진 조각을 챙겨 오세요. 신경 노출 여부에 따라 ${A('레진')} 수복 또는 신경 처치</td><td style="${TDC}">1~2일 내</td></tr>
<tr><td style="${TD}"><strong>나중에 색이 어두워졌다</strong></td><td style="${TD}">외상으로 신경이 죽은 신호일 수 있습니다. ${A('신경치료')} 후 내부 미백 검토</td><td style="${TDC}">발견 시</td></tr>
</tbody></table>

<h3>중절치 심미 치료 — "한 개만"이 가장 어렵습니다</h3>
<p>중절치를 한 개만 ${A('라미네이트')}나 크라운으로 하면 <strong>옆 치아와 색·투명도·광택을 맞추는 것이 매우 어렵습니다</strong>. 정중앙이라 미세한 차이도 바로 눈에 들어오기 때문입니다. 그래서 실제로는 <strong>좌우 중절치 한 쌍을 함께</strong>, 또는 측절치·견치까지 포함해 <strong>4~6개를 함께 디자인</strong>하는 것이 결과가 안정적입니다.</p>
<p>서울비디치과 라미네이트(글로우네이트)는 <strong>1본 80만원</strong>이며, ${A('치아 미백')}으로 자연치를 먼저 밝힌 뒤 색을 맞추는 순서를 권하는 경우도 있습니다. 미백은 소프트 블리칭 <strong>4.9만원</strong>, 하드 블리칭 <strong>8만원</strong>입니다.</p>

<h3>중절치 사이가 벌어졌을 때(정중이개)</h3>
<p>위 중절치 사이 틈을 <strong>정중이개(diastema)</strong>라 합니다. 원인이 여러 가지라 대처도 달라집니다. 잇몸에서 내려온 띠(상순소대)가 두꺼워 벌어진 경우, 치아 크기가 작아 공간이 남는 경우, 배열 문제인 경우, ${A('정중선')}이 틀어져 그렇게 보이는 경우가 있습니다. 원인 확인 없이 레진으로 틈만 메우면 다시 벌어지는 일이 흔하므로, X-ray로 원인부터 구분하는 것이 순서입니다.</p>

<h3>중절치가 나는 시기 — 만 6~8세, 첫 영구치 앞니</h3>
<p>유치 중절치는 <strong>생후 6~10개월</strong>에 가장 먼저 나며 "첫 이"로 기억되는 치아입니다. 영구치 중절치는 <strong>만 6~8세</strong>에 교체되고, 아래 중절치가 위보다 보통 먼저 납니다. 이때 새 앞니가 <strong>유치보다 크고 약간 노랗게</strong> 보이는 것은 정상입니다. 영구치는 유치보다 ${A('상아질')} 비중이 커 자연히 색이 진합니다.</p>
<p>새로 난 앞니 사이가 <strong>살짝 벌어져 보이는 것도 이 시기엔 흔합니다</strong>. 옆의 ${A('측절치')}와 ${A('견치')}가 나면서 대개 좁혀지므로, 만 12세 무렵까지 경과를 보는 것이 일반적입니다. 전체 순서는 ${A('영구치 맹출 순서')}에서 확인하실 수 있습니다.`,
  faqs: [
    { q: '중절치는 어느 치아인가요?', a: '입 정중앙에 있는 가장 앞쪽 치아입니다. 위·아래 각 2개씩 총 4개이며 치식으로는 11·21·31·41번, 흔히 "1번 치아"라고 부릅니다. 영문으로는 central incisor이며, 위 중절치가 아래보다 1.5배 정도 큽니다.' },
    { q: '앞니 황금비율은 어떻게 계산하나요?', a: '위 중절치의 가로 폭을 세로 길이로 나눈 값이 약 75~80%일 때 가장 자연스럽다고 평가됩니다. 예를 들어 세로 10.5mm에 가로 8.3mm면 약 79%로 이상 범위입니다. 다만 실제 심미 설계는 얼굴 비율·입술 라인·잇몸 위치를 함께 고려해 결정합니다.' },
    { q: '아이가 넘어져 앞니가 빠졌어요. 어떻게 해야 하나요?', a: '치아 뿌리 부분을 만지지 말고 머리 쪽만 잡아 우유나 식염수에 담근 뒤 즉시 치과로 오세요. 마른 상태로 오래 두면 재식 성공률이 급격히 떨어지며, 30분 내 내원이 가장 좋습니다. 수돗물에 문질러 씻는 것은 피하셔야 합니다.' },
    { q: '외상 후 앞니 색이 어두워졌는데 왜 그런가요?', a: '외상으로 치아 내부의 신경(치수)이 손상되어 활력을 잃으면 치아가 회색·갈색으로 변색됩니다. 통증이 없어도 진행되는 경우가 많습니다. 신경치료 후 내부 미백(실활치 미백)으로 색을 개선하거나, 케이스에 따라 라미네이트·크라운을 고려합니다.' },
    { q: '중절치 라미네이트는 한 개만 할 수 있나요?', a: '가능하지만 권장되지 않습니다. 중절치는 미소 정중앙이라 한 개만 하면 옆 치아와 색·투명도·광택을 맞추기가 매우 어렵습니다. 좌우 한 쌍을 함께 하거나 측절치·견치까지 4~6개를 함께 디자인하는 편이 결과가 자연스럽습니다. 서울비디치과 라미네이트는 1본 80만원입니다.' },
    { q: '앞니 사이가 벌어졌는데 교정해야 하나요?', a: '원인에 따라 다릅니다. 잇몸에서 내려온 상순소대가 두꺼운 경우, 치아 크기가 작아 공간이 남는 경우, 배열 문제, 정중선 편위 등 원인이 여러 가지입니다. 원인 확인 없이 레진으로 틈만 메우면 재발이 흔하므로 X-ray로 원인부터 구분하는 것이 순서입니다.' },
    { q: '앞니가 없으면 발음이 새나요?', a: '네. 중절치는 ㅅ·ㅈ·ㅊ·ㅍ·ㅂ와 영어 F·V·Th 발음에 직접 관여합니다. 상실되거나 형태가 크게 바뀌면 발음이 새는 느낌이 생길 수 있습니다. 또 위 앞니는 입술을 받쳐주는 역할도 하므로, 상실되면 입술이 꺼져 나이 들어 보이게 됩니다.' },
  ],
}

// ══════════════════════════════════════════════════════════
// 3. 교두 (47노출 / 0클릭 / 7.2위) — 어금니 씹는 면의 "산"
// ══════════════════════════════════════════════════════════
ENC_SUPER_V538['교두'] = {
  detail: `
<h3>교두란? — 어금니 씹는 면의 뾰족한 "산", 치아마다 개수가 정해져 있습니다</h3>
<p><strong>교두(cusp, 咬頭)</strong>는 어금니와 송곳니 씹는 면에 솟아 있는 <strong>뾰족한 돌출부</strong>를 말합니다. 지형에 비유하면 교두는 "산봉우리"이고, 그 사이 골짜기는 <strong>소구(fissure)</strong>입니다. 이 산과 골짜기가 맞물려 음식을 <strong>가위처럼 자르고 절구처럼 으깨는</strong> 구조를 만듭니다.</p>
<p>교두가 중요한 이유는 단순합니다. <strong>교두 개수와 형태가 곧 씹는 효율</strong>이고, 교두가 닳거나 깨지면 씹는 힘이 엉뚱한 방향으로 분산되어 다른 치아와 턱관절까지 부담을 받습니다.</p>

<h3>치아별 교두 개수 — 표로 정리</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">치아</th><th style="${TH}">교두 개수</th><th style="${TH}">특징</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>${A('견치')}(송곳니)</strong></td><td style="${TDC}">1개</td><td style="${TD}">뾰족한 단일 교두. 음식을 찢고, 좌우로 갈 때 다른 치아를 보호하는 "가이드" 역할</td></tr>
<tr><td style="${TD}"><strong>${A('소구치')}(작은어금니)</strong></td><td style="${TDC}">2개</td><td style="${TD}">협면 1 + 설면 1. 이름 그대로 "두 개의 봉우리(bicuspid)"라 불립니다</td></tr>
<tr><td style="${TD}"><strong>상악 제1${A('대구치')}</strong></td><td style="${TDC}">4개 (+1)</td><td style="${TD}">4개 기본에 설면 쪽으로 <strong>카라벨리 교두</strong>라는 다섯 번째 작은 봉우리가 추가될 수 있습니다</td></tr>
<tr><td style="${TD}"><strong>하악 제1대구치</strong></td><td style="${TDC}">5개</td><td style="${TD}">교두가 가장 많아 씹는 면이 넓습니다. 그래서 <strong>충치가 가장 많이 생기는 치아</strong>이기도 합니다</td></tr>
<tr><td style="${TD}"><strong>제2대구치</strong></td><td style="${TDC}">4개</td><td style="${TD}">제1대구치보다 약간 작고 단순한 형태</td></tr>
<tr><td style="${TD}"><strong>사랑니(제3대구치)</strong></td><td style="${TDC}">불규칙</td><td style="${TD}">3~5개로 변이가 크고 형태가 뒤틀린 경우가 많습니다</td></tr>
</tbody></table>

<h3>내 치아의 어느 면인지 확인해 보세요</h3>
${WIDGET_TOOTH_SURFACE('cusp', 'oc')}

<h3>기능교두 vs 비기능교두 — 왜 구분하나요?</h3>
<p>모든 교두가 같은 일을 하지 않습니다. 실제로 대합치의 오목한 부위에 <strong>직접 박혀 음식을 으깨는 교두</strong>를 기능교두, 옆에서 음식을 가두는 역할을 하는 교두를 비기능교두라 부릅니다.</p>
<div style="${BOX}">
<p style="margin:0 0 6px;"><strong>기능교두 (working cusp)</strong> — 위턱은 설면 쪽 교두, 아래턱은 협면 쪽 교두. 씹는 힘을 직접 받으므로 <strong>가장 빨리 닳고, 크라운을 만들 때 반드시 살려야 하는 부위</strong>입니다.</p>
<p style="margin:0;"><strong>비기능교두 (balancing cusp)</strong> — 위턱은 협면, 아래턱은 설면 쪽. 음식이 밖으로 흐르지 않게 막아주는 담장 역할입니다.</p>
</div>
<p>보철을 만들 때 기능교두를 무시하고 모양만 예쁘게 만들면, 씹을 때마다 특정 지점에 힘이 몰려 <strong>보철이 깨지거나 시린 증상</strong>이 생깁니다. ${A('보철 교합 조정')}에 시간을 쓰는 이유가 바로 여기 있습니다.</p>

<h3>교두 마모 4단계 — 지금 어느 단계인가요?</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">단계</th><th style="${TH}">상태</th><th style="${TH}">증상</th><th style="${TH}">대처</th>
</tr></thead>
<tbody>
<tr><td style="${TDC}"><strong>1</strong></td><td style="${TD}">교두 끝 광택이 사라지고 반짝이는 면(facet)이 생김</td><td style="${TD}">없음</td><td style="${TD}">경과 관찰. ${A('이갈이')} 여부 확인</td></tr>
<tr><td style="${TDC}"><strong>2</strong></td><td style="${TD}">${A('법랑질')}이 닳아 안쪽 ${A('상아질')}이 노란 점으로 드러남</td><td style="${TD}">찬물에 시림</td><td style="${TD}">나이트가드 착용 검토, 불소 도포</td></tr>
<tr><td style="${TDC}"><strong>3</strong></td><td style="${TD}">교두가 평평해져 씹는 면 높이가 눈에 띄게 낮아짐</td><td style="${TD}">씹는 힘 저하, 턱 피로</td><td style="${TD}">${A('온레이')}·${A('크라운')}으로 교두 높이 회복</td></tr>
<tr><td style="${TDC}"><strong>4</strong></td><td style="${TD}">상아질을 넘어 ${A('치수')}에 가까워짐 / 치아 전체 높이 감소</td><td style="${TD}">지속적 시림·통증</td><td style="${TD}">${A('신경치료')} 가능성 + 크라운, 전악 교합 재구성 검토</td></tr>
</tbody></table>

<h3>교두가 깨졌을 때 치료 — 남은 양에 따라 4갈래</h3>
<p>교두 파절은 "얼마나 남았는지"와 "신경까지 갔는지"로 치료가 갈립니다. 크기 순서대로 계단을 오르는 구조입니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">파절 범위</th><th style="${TH}">치료</th><th style="${TH}">비용 안내</th>
</tr></thead>
<tbody>
<tr><td style="${TD}">교두 끝만 살짝</td><td style="${TD}">${A('레진')} 수복 또는 연마만</td><td style="${TD}">보험 적용 케이스 있음</td></tr>
<tr><td style="${TD}">교두 1개 파절, 신경 정상</td><td style="${TD}">${A('온레이')}(교두를 덮는 부분 수복)</td><td style="${TD}">재료에 따라 상이 — 상담 시 안내</td></tr>
<tr><td style="${TD}">교두 2개 이상 / 벽이 얇음</td><td style="${TD}">${A('크라운')}(${A('지르코니아')} 등)으로 전체 감싸기</td><td style="${TD}">재료에 따라 상이 — 상담 시 안내</td></tr>
<tr><td style="${TD}">잇몸 아래까지 갈라짐</td><td style="${TD}">보존 불가 → ${A('발치')} 후 ${A('임플란트')}</td><td style="${TD}">임플란트 80 / 100 / 160만원</td></tr>
</tbody></table>
<div style="${WARN}">
<p style="margin:0;"><strong>주의 — "안 아프면 괜찮다"가 아닙니다.</strong> 교두가 깨져도 신경까지 닿지 않으면 통증이 없습니다. 그러나 깨진 자리에 음식이 끼면서 균열이 뿌리 방향으로 진행되고(${A('치아 균열')}), 잇몸 아래까지 내려간 순간 살릴 수 있는 치아가 발치 대상으로 바뀝니다. <strong>깨진 걸 알았다면 통증과 무관하게 확인받으시는 게 가장 저렴한 선택</strong>입니다.</p>
</div>

<h3>교두를 오래 지키는 방법</h3>
<ul style="line-height:1.9;">
<li><strong>이갈이·이 악물기 관리</strong> — 교두 마모의 최대 원인입니다. 수면 중 이갈이가 있다면 나이트가드로 교두를 대신 닳게 하는 편이 훨씬 경제적입니다.</li>
<li><strong>딱딱한 음식 습관 점검</strong> — 얼음, 뼈, 게 껍질, 견과류 껍데기를 습관적으로 깨물면 교두는 한 번에 깨집니다.</li>
<li><strong>씹는 면 홈 관리</strong> — 교두 사이 깊은 홈은 칫솔모가 안 들어갑니다. 어린이·청소년은 새 어금니가 나면 실란트로 미리 메우는 것이 효율적입니다.</li>
<li><strong>산성 음료 줄이기</strong> — 탄산·과일산이 법랑질을 부드럽게 만든 상태에서 씹으면 마모 속도가 빨라집니다. 산성 음료 후 30분은 양치를 미루고 물로 헹구세요.</li>
</ul>`,
  faqs: [
    { q: '교두가 무엇인가요?', a: '어금니와 송곳니의 씹는 면에 솟아 있는 뾰족한 돌출부를 교두(cusp)라고 합니다. 그 사이의 골짜기는 소구(fissure)입니다. 교두와 소구가 위아래로 맞물려 음식을 자르고 으깨는 구조를 만듭니다.' },
    { q: '어금니에 교두는 몇 개 있나요?', a: '송곳니 1개, 작은어금니(소구치) 2개, 상악 제1대구치 4개(카라벨리 교두 포함 시 5개), 하악 제1대구치 5개, 제2대구치 4개입니다. 하악 제1대구치가 교두가 가장 많아 씹는 면이 넓고, 그만큼 충치도 가장 많이 생깁니다.' },
    { q: '카라벨리 교두는 무엇인가요?', a: '상악 제1대구치의 설면 쪽에 추가로 나타날 수 있는 다섯 번째 작은 교두입니다. 정상 변이로 병이 아니며 치료도 필요하지 않습니다. 다만 홈이 깊게 파여 있으면 충치가 시작되기 쉬우므로 관리 포인트로 봅니다.' },
    { q: '교두가 닳으면 어떻게 되나요?', a: '초기에는 증상이 없지만 법랑질이 닳아 상아질이 드러나면 시림이 시작됩니다. 더 진행되면 씹는 힘이 떨어지고 씹는 면 높이가 낮아져 턱관절 부담이 늘어납니다. 3단계 이상이면 온레이나 크라운으로 교두 높이를 회복하는 것을 검토합니다.' },
    { q: '교두가 깨졌는데 아프지 않으면 그냥 둬도 되나요?', a: '권하지 않습니다. 신경까지 닿지 않으면 통증이 없지만, 깨진 자리로 음식이 끼며 균열이 뿌리 방향으로 계속 진행됩니다. 잇몸 아래까지 갈라지면 살릴 수 있던 치아가 발치 대상이 됩니다. 통증과 무관하게 확인받는 것이 가장 저렴한 선택입니다.' },
    { q: '교두 깨진 치아는 레진으로 때울 수 있나요?', a: '교두 끝만 살짝 깨진 경우는 레진 수복이 가능합니다. 다만 교두 하나가 통째로 파절되면 레진은 씹는 힘에 다시 떨어질 확률이 높아, 교두를 덮는 온레이나 전체를 감싸는 크라운을 권합니다. 남은 치아 양과 벽 두께를 보고 결정합니다.' },
    { q: '기능교두와 비기능교두는 왜 구분하나요?', a: '위턱은 설면 쪽, 아래턱은 협면 쪽 교두가 대합치에 직접 박혀 음식을 으깨는 기능교두입니다. 보철을 만들 때 기능교두를 살리지 않으면 씹을 때 특정 지점에 힘이 몰려 보철이 깨지거나 시린 증상이 생깁니다. 그래서 교합 조정에 시간을 씁니다.' },
  ],
}

// ══════════════════════════════════════════════════════════
// 4. 설면 (42노출 / 0클릭 / 3.2위) — 치아의 혀 쪽 면
// ══════════════════════════════════════════════════════════
ENC_SUPER_V538['설면'] = {
  detail: `
<h3>설면이란? — 치아의 "혀 쪽 면", 위턱에서는 구개면이라 부릅니다</h3>
<p><strong>설면(lingual surface, 舌面)</strong>은 치아에서 <strong>혀와 마주보는 안쪽 면</strong>입니다. 겉으로 보이지 않는 뒷면이죠. 그런데 같은 면인데도 위턱에서는 이름이 바뀝니다. 위턱 치아의 안쪽은 혀보다 <strong>입천장(구개)</strong>과 마주보기 때문에 <strong>구개면(palatal surface)</strong>이라고 부릅니다.</p>
<p>설면이 검색되는 이유는 대부분 두 가지입니다. 진료 계획서나 보험 청구서에 적힌 용어를 확인하려는 경우, 그리고 <strong>"아래 앞니 안쪽에 딱딱한 게 만져지는데 이게 뭔가요"</strong>라는 질문입니다. 결론부터 말씀드리면, 그 딱딱한 것은 대부분 ${A('치석')}입니다.</p>

<h3>치아 5면 명칭 — 한글·영문 대조표</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">면</th><th style="${TH}">영문</th><th style="${TH}">위치</th><th style="${TH}">관리 난이도</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>설면 / 구개면</strong></td><td style="${TD}">Lingual / Palatal</td><td style="${TD}">혀·입천장 쪽 안쪽 면</td><td style="${TDC}">★★★ 매우 어려움</td></tr>
<tr><td style="${TD}"><strong>${A('협면')} / 순면</strong></td><td style="${TD}">Buccal / Labial</td><td style="${TD}">볼·입술 쪽 바깥 면</td><td style="${TDC}">★ 쉬움</td></tr>
<tr><td style="${TD}"><strong>${A('교합면')}</strong></td><td style="${TD}">Occlusal</td><td style="${TD}">씹는 면 (어금니만)</td><td style="${TDC}">★★ 보통</td></tr>
<tr><td style="${TD}"><strong>${A('근심')}면</strong></td><td style="${TD}">Mesial</td><td style="${TD}">치열 정중앙을 향한 옆면</td><td style="${TDC}">★★★ 치실 필수</td></tr>
<tr><td style="${TD}"><strong>${A('원심')}면</strong></td><td style="${TD}">Distal</td><td style="${TD}">치열 뒤쪽을 향한 옆면</td><td style="${TDC}">★★★ 치실 필수</td></tr>
</tbody></table>

<h3>5면을 직접 눌러 확인해 보세요</h3>
${WIDGET_TOOTH_SURFACE('ling', 'li')}

<h3>아래 앞니 설면 — 치석이 가장 빨리 쌓이는 부위 1위</h3>
<p>아무리 열심히 닦아도 아래 앞니 안쪽에는 치석이 생깁니다. 게으른 탓이 아니라 <strong>해부학적 구조 때문</strong>입니다.</p>
<div style="${BOX}">
<p style="margin:0 0 6px;"><strong>이유 1 — 침샘 출구가 바로 옆입니다.</strong> 혀 밑 악하선·설하선의 침이 나오는 자리가 아래 앞니 안쪽입니다. 침 속 칼슘·인이 치태에 곧바로 침착되어 치석으로 굳습니다.</p>
<p style="margin:0 0 6px;"><strong>이유 2 — 칫솔이 들어가는 각도가 어렵습니다.</strong> 아래 앞니 안쪽은 공간이 좁고 혀에 가려져 칫솔모가 닿기 어렵습니다.</p>
<p style="margin:0;"><strong>이유 3 — 혀가 계속 문질러 치태를 눌러 붙입니다.</strong> 혀의 움직임이 치태를 밀착시켜 오히려 딱딱하게 만듭니다.</p>
</div>
<p>그래서 앞니 설면은 <strong>양치만으로 완전히 관리할 수 없는 유일한 부위</strong>에 가깝습니다. 6개월~1년 주기 ${A('스케일링')}이 필수인 이유입니다. ${A('스케일링 건강보험')}은 만 19세 이상이면 <strong>연 1회 본인부담 약 1~2만원</strong>이며, 비보험은 6만원입니다.</p>

<h3>설면 양치법 — 칫솔을 "세로로 세우세요"</h3>
<ul style="line-height:1.9;">
<li><strong>아래 앞니 안쪽</strong> — 칫솔을 <strong>세로로 세워</strong> 손잡이가 위를 향하게 하고, 칫솔모 끝으로 잇몸에서 치아 끝 방향으로 쓸어 올립니다. 가로로 문지르면 폭이 좁아 모가 닿지 않습니다.</li>
<li><strong>위 앞니 구개면</strong> — 칫솔을 세로로 세워 손잡이가 아래를 향하게 하고 위에서 아래로 쓸어내립니다.</li>
<li><strong>어금니 설면</strong> — 칫솔을 45도로 대고 작은 원을 그립니다. 입을 살짝 덜 벌리면 볼과 혀가 이완되어 오히려 더 잘 들어갑니다.</li>
<li><strong>보조 도구</strong> — 앞니 설면 전용으로는 <strong>끝이 뾰족한 원터프트(one-tuft) 칫솔</strong>이 압도적으로 효율적입니다. ${A('치실')}은 옆면(근심·원심)용이므로 설면은 칫솔로 따로 관리해야 합니다.</li>
</ul>

<h3>설면과 관련된 임상 상황 3가지</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">상황</th><th style="${TH}">설명</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>설측 교정</strong></td><td style="${TD}">${A('메탈 브라켓')}을 협면이 아닌 <strong>설면에 붙이는</strong> 방식입니다. 겉에서 장치가 보이지 않는 장점이 있지만 혀에 닿아 초기 적응이 필요하고 발음이 어색할 수 있습니다. 눈에 안 보이는 대안으로 ${A('인비절라인')} 같은 투명 교정도 있으며, 패키지는 300~700만원입니다.</td></tr>
<tr><td style="${TD}"><strong>산성 침식</strong></td><td style="${TD}">위산이 역류하거나 구토가 반복되면 위턱 앞니 <strong>구개면부터</strong> 법랑질이 녹아 얇아집니다. 겉에서는 정상으로 보여 놓치기 쉬운데, 치과에서 안쪽 면을 보면 특징적인 함몰이 관찰됩니다. 원인 질환 치료가 우선입니다.</td></tr>
<tr><td style="${TD}"><strong>앞니 설면 함요부 충치</strong></td><td style="${TD}">앞니 설면에는 오목한 부위(설면구)가 있어 이 안쪽으로 충치가 시작될 수 있습니다. 겉에서 안 보여 커진 뒤 발견되는 경우가 있어, 정기 검진 시 안쪽 면을 함께 확인합니다.</td></tr>
</tbody></table>
<div style="${WARN}">
<p style="margin:0;"><strong>설면 치석을 직접 긁지 마세요.</strong> 손톱이나 이쑤시개, 인터넷에서 파는 스케일러로 직접 떼려는 분이 계십니다. 잇몸이 찢어지고 치아 표면에 미세한 흠이 생겨 <strong>치석이 오히려 더 빨리, 더 단단하게</strong> 쌓입니다. 초음파 스케일링은 치아 손상 없이 치석만 분리하도록 설계된 장비입니다.</p>
</div>

<h3>진료 계획서에서 자주 보는 표기 읽는 법</h3>
<p>차트나 계획서에 <strong>"#36 L", "#11 P", "#46 MOD"</strong> 처럼 적혀 있는 것을 보고 검색하시는 분이 많습니다. 앞의 숫자는 ${A('치식')} 번호이고, 뒤의 알파벳이 면(surface)을 뜻합니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">표기</th><th style="${TH}">뜻</th><th style="${TH}">예시 해석</th>
</tr></thead>
<tbody>
<tr><td style="${TDC}"><strong>L</strong></td><td style="${TD}">Lingual — 설면</td><td style="${TD}">#36 L = 왼쪽 아래 첫 어금니 혀 쪽 면</td></tr>
<tr><td style="${TDC}"><strong>P</strong></td><td style="${TD}">Palatal — 구개면 (위턱 설면)</td><td style="${TD}">#11 P = 오른쪽 위 앞니 입천장 쪽 면</td></tr>
<tr><td style="${TDC}"><strong>B / La</strong></td><td style="${TD}">Buccal / Labial — 협면·순면</td><td style="${TD}">#16 B = 오른쪽 위 첫 어금니 볼 쪽 면</td></tr>
<tr><td style="${TDC}"><strong>O</strong></td><td style="${TD}">Occlusal — 교합면</td><td style="${TD}">#46 O = 오른쪽 아래 첫 어금니 씹는 면</td></tr>
<tr><td style="${TDC}"><strong>M / D</strong></td><td style="${TD}">Mesial / Distal — 근심면·원심면</td><td style="${TD}">#46 MOD = 근심·교합·원심 3면 수복</td></tr>
</tbody></table>
<p>따라서 <strong>MOD</strong>는 "세 면을 함께 치료한다"는 뜻으로, 면이 많아질수록 ${A('레진')}보다 ${A('인레이')}·${A('온레이')}가 유리해지는 기준이 됩니다.`,
  faqs: [
    { q: '설면이 어디인가요?', a: '치아에서 혀와 마주보는 안쪽 면입니다. 영문으로는 lingual surface이며, 위턱 치아는 혀보다 입천장(구개)과 마주보기 때문에 구개면(palatal surface)이라고 부릅니다. 반대쪽 바깥 면은 협면(볼 쪽) 또는 순면(입술 쪽)입니다.' },
    { q: '아래 앞니 안쪽에 딱딱한 게 만져지는데 뭔가요?', a: '대부분 치석입니다. 혀 밑 침샘 출구가 바로 그 자리에 있어 침 속 칼슘·인이 치태에 곧바로 침착되기 때문입니다. 양치만으로는 제거되지 않으므로 스케일링이 필요합니다. 건강보험으로 만 19세 이상 연 1회 본인부담 약 1~2만원, 비보험은 6만원입니다.' },
    { q: '설면은 왜 양치가 어렵나요?', a: '공간이 좁고 혀에 가려져 칫솔모가 닿기 어렵고, 침샘 출구가 옆에 있어 치석이 빨리 생기며, 혀가 계속 문질러 치태를 밀착시키기 때문입니다. 아래 앞니 안쪽은 양치만으로 완전히 관리하기 어려운 부위라 정기 스케일링이 필수입니다.' },
    { q: '앞니 안쪽은 어떻게 닦아야 하나요?', a: '칫솔을 세로로 세워야 합니다. 아래 앞니는 손잡이가 위를 향하게 하고 잇몸에서 치아 끝 방향으로 쓸어 올리고, 위 앞니는 손잡이가 아래를 향하게 하여 쓸어내립니다. 끝이 뾰족한 원터프트 칫솔이 이 부위에 특히 효율적입니다.' },
    { q: '설측 교정은 설면에 장치를 붙이는 건가요?', a: '맞습니다. 브라켓을 바깥쪽(협면)이 아닌 안쪽(설면)에 붙여 겉에서 장치가 보이지 않게 하는 방식입니다. 다만 혀에 닿아 초기 적응 기간이 필요하고 발음이 어색할 수 있습니다. 눈에 안 보이는 대안으로 인비절라인 같은 투명 교정이 있으며 패키지는 300~700만원입니다.' },
    { q: '위 앞니 안쪽이 파인 느낌인데 왜 그런가요?', a: '위산 역류나 반복적인 구토로 위턱 앞니 구개면 법랑질이 녹는 산성 침식일 수 있습니다. 겉에서는 정상으로 보여 놓치기 쉽습니다. 치과에서 안쪽 면을 보면 특징적인 함몰이 관찰되며, 원인 질환 치료가 우선입니다.' },
    { q: '치석을 집에서 직접 떼도 되나요?', a: '권하지 않습니다. 손톱이나 이쑤시개, 시판 스케일러로 긁으면 잇몸이 찢어지고 치아 표면에 미세한 흠이 생겨 치석이 오히려 더 빨리, 더 단단하게 쌓입니다. 초음파 스케일링은 치아 손상 없이 치석만 분리하도록 설계된 장비입니다.' },
  ],
}

// ══════════════════════════════════════════════════════════
// 5. 대합치 (46노출 / 1클릭 / 3.5위) — 위아래 맞물리는 짝
// ══════════════════════════════════════════════════════════
ENC_SUPER_V538['대합치'] = {
  detail: `
<h3>대합치란? — 위아래로 마주 물리는 "짝 치아"</h3>
<p><strong>대합치(opposing tooth, 對合齒)</strong>는 어떤 치아와 <strong>위아래로 맞물리는 반대편 치아</strong>를 말합니다. 오른쪽 위 첫 번째 큰어금니(치식 16번)의 대합치는 오른쪽 아래 첫 번째 큰어금니(46번)입니다.</p>
<p>치과 계획서에 "대합치 상태 확인", "대합치 정출 소견"이라고 적혀 있어 검색하시는 경우가 많습니다. 여기서 꼭 알아두실 개념이 하나 있습니다. <strong>치아는 짝이 없으면 가만히 있지 않습니다.</strong> 씹을 때 위아래가 서로 밀어주며 제자리를 유지하는데, 짝이 사라지면 남은 치아가 <strong>빈 공간을 향해 서서히 자라 나옵니다</strong>. 이것을 ${A('정출')}(과맹출)이라 부릅니다.</p>

<h3>치식으로 본 대합 관계 — 표로 정리</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">위턱 치아</th><th style="${TH}">↕</th><th style="${TH}">아래턱 대합치</th><th style="${TH}">치아 이름</th>
</tr></thead>
<tbody>
<tr><td style="${TDC}">11 · 21</td><td style="${TDC}">↕</td><td style="${TDC}">41 · 31</td><td style="${TD}">${A('중절치')} (가운데 앞니)</td></tr>
<tr><td style="${TDC}">12 · 22</td><td style="${TDC}">↕</td><td style="${TDC}">42 · 32</td><td style="${TD}">${A('측절치')} (옆 앞니)</td></tr>
<tr><td style="${TDC}">13 · 23</td><td style="${TDC}">↕</td><td style="${TDC}">43 · 33</td><td style="${TD}">${A('견치')} (송곳니)</td></tr>
<tr><td style="${TDC}">14 · 15</td><td style="${TDC}">↕</td><td style="${TDC}">44 · 45</td><td style="${TD}">${A('소구치')} (작은어금니)</td></tr>
<tr><td style="${TDC}">16 · 17</td><td style="${TDC}">↕</td><td style="${TDC}">46 · 47</td><td style="${TD}">${A('대구치')} (큰어금니)</td></tr>
</tbody></table>
<p style="font-size:0.86rem;color:#7a6a55;">※ 실제로는 위 치아 하나가 아래 치아 <strong>두 개에 걸쳐</strong> 물립니다(1치 대 2치 관계). 그래서 한 개를 뽑아도 영향은 두 개 이상에 퍼집니다. 번호 체계는 ${A('치식')}·${A('치아 번호')} 문서에서 자세히 확인하실 수 있습니다.</p>

<h3>대합치를 잃으면 어떻게 되는지 — 시간대별로 보기</h3>
${WIDGET_OPPOSING_CHAIN}

<h3>대합치 상실이 만드는 연쇄 반응 5단계</h3>
<div style="${BOX}">
<p style="margin:0 0 6px;"><strong>1. 남은 치아가 빈 공간으로 자랍니다(정출)</strong> — 잇몸 밖으로 밀려 나오며 뿌리를 감싼 ${A('치조골')}도 함께 따라 내려옵니다. 뼈까지 움직이므로 나중에 원위치로 되돌리기 어렵습니다.</p>
<p style="margin:0 0 6px;"><strong>2. 옆 치아가 기울어집니다</strong> — 빈 공간 방향으로 인접치가 쓰러지며 그 사이에 음식이 끼는 틈이 생깁니다.</p>
<p style="margin:0 0 6px;"><strong>3. 씹는 힘이 재분배됩니다</strong> — 잃은 자리의 몫을 남은 치아가 나눠 감당하면서 과부하로 ${A('치아 균열')}·보철 파절 위험이 올라갑니다.</p>
<p style="margin:0 0 6px;"><strong>4. 잇몸 문제가 따라옵니다</strong> — 기울어진 치아 사이는 칫솔·${A('치실')}이 잘 들어가지 않아 ${A('치주염')}이 시작되기 쉽습니다.</p>
<p style="margin:0;"><strong>5. 임플란트 공간이 사라집니다</strong> — 정출된 대합치가 아래로 내려와 원래 치아가 들어갈 높이를 잡아먹습니다. 이 상태에서는 임플란트 보철을 만들 공간 자체가 부족해집니다.</p>
</div>

<h3>이미 정출이 진행된 경우 — 치료 옵션</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">정출 정도</th><th style="${TH}">치료</th><th style="${TH}">특징</th>
</tr></thead>
<tbody>
<tr><td style="${TD}">1~2mm 미만</td><td style="${TD}">교합면 삭제(약간 갈아냄)</td><td style="${TD}">1회로 해결. 많이 갈면 시릴 수 있어 범위에 한계</td></tr>
<tr><td style="${TD}">2~3mm</td><td style="${TD}">${A('신경치료')} + ${A('크라운')}으로 높이 재설정</td><td style="${TD}">치아를 살리되 길이를 줄여 다시 맞춥니다</td></tr>
<tr><td style="${TD}">3mm 이상</td><td style="${TD}">${A('미니스크류')} 이용 교정적 압하</td><td style="${TD}">치아를 원위치로 밀어 넣습니다. 수개월 소요</td></tr>
<tr><td style="${TD}">뿌리까지 노출 / 흔들림</td><td style="${TD}">${A('발치')} 후 ${A('임플란트')} 또는 보철 재설계</td><td style="${TD}">임플란트 80 / 100 / 160만원</td></tr>
</tbody></table>

<h3>보철·임플란트 설계에서 대합치가 결정하는 것</h3>
<p>새 치아를 만들 때 치과의사가 가장 먼저 보는 것이 대합치입니다. 이유는 <strong>새 치아의 높이·모양·재료를 대합치가 정한다</strong>는 데 있습니다.</p>
<ul style="line-height:1.9;">
<li><strong>높이</strong> — 대합치와의 거리가 곧 보철 높이입니다. 정출된 대합치가 있으면 공간이 부족해 보철이 얇아지고, 얇으면 깨집니다.</li>
<li><strong>재료</strong> — 대합치가 자연치인지, ${A('지르코니아')} 같은 단단한 보철인지에 따라 재료 선택이 달라집니다. 단단한 것끼리 부딪히면 어느 한쪽이 닳거나 깨지기 때문입니다.</li>
<li><strong>교합 접촉점</strong> — 대합치와 몇 군데서, 어떤 힘으로 만나는지를 조정하는 ${A('보철 교합 조정')} 과정이 보철 수명을 크게 좌우합니다.</li>
<li><strong>${A('이갈이')} 여부</strong> — 대합치가 야간에 세게 갈리는 상태라면 보철도 그 힘을 그대로 받습니다. 나이트가드를 함께 계획합니다.</li>
</ul>
<div style="${WARN}">
<p style="margin:0;"><strong>"어금니 하나쯤 없어도 살 수 있다"는 가장 비싼 오해입니다.</strong> 발치 후 방치하면 대합치 정출·인접치 경사·잇몸 문제가 순차적으로 진행되어, 처음에는 임플란트 1개로 끝났을 일이 <strong>여러 개의 치료가 얽힌 계획</strong>으로 커집니다. 뽑은 자리를 어떻게 할지는 <strong>뽑은 그날 정하는 것</strong>이 가장 경제적입니다.</p>
</div>

<h3>대합치를 지키는 세 가지 원칙</h3>
<ul style="line-height:1.9;">
<li><strong>발치 계획과 수복 계획을 동시에 세우세요</strong> — "일단 뽑고 나중에 생각하자"가 가장 비용이 커지는 경로입니다. 뽑기 전에 그 자리를 임플란트·${A('브릿지')}·${A('틀니')} 중 무엇으로 채울지 함께 정하면, 정출이 시작될 틈 자체가 생기지 않습니다.</li>
<li><strong>이미 방치한 기간이 있어도 늦지 않았습니다</strong> — 정출 정도에 따라 교합면 조정, 크라운, 교정적 압하 중에서 선택지가 남아 있습니다. 문제는 시간이 지날수록 <strong>선택지가 줄고 단계가 늘어난다</strong>는 점입니다.</li>
<li><strong>정기 검진에서 대합 관계를 확인하세요</strong> — 정출은 통증이 없어 스스로 알아채기 어렵습니다. ${A('스케일링')} 받으실 때 파노라마 X-ray로 위아래 맞물림을 함께 확인하는 것이 가장 현실적인 조기 발견 방법입니다.</li>
</ul>
<p>씹는 관계 전체를 뜻하는 용어는 ${A('교합')}이며, 대합치는 그 교합을 구성하는 <strong>가장 기본 단위</strong>입니다.`,
  faqs: [
    { q: '대합치가 무슨 뜻인가요?', a: '위아래로 마주 물리는 반대편 치아를 말합니다. 예를 들어 오른쪽 위 첫 번째 큰어금니(치식 16번)의 대합치는 오른쪽 아래 첫 번째 큰어금니(46번)입니다. 실제로는 위 치아 하나가 아래 치아 두 개에 걸쳐 물리는 1치 대 2치 관계입니다.' },
    { q: '대합치가 없으면 남은 치아는 어떻게 되나요?', a: '빈 공간을 향해 서서히 자라 나옵니다. 이를 정출 또는 과맹출이라 합니다. 잇몸 밖으로 밀려 나오면서 뿌리를 감싼 치조골까지 함께 내려오므로, 시간이 지나면 원위치로 되돌리기 어려워집니다.' },
    { q: '발치 후 얼마나 지나면 대합치가 움직이나요?', a: '개인차가 크지만 3~6개월부터 미세한 변화가 시작되고, 1~2년이면 X-ray에서 명확히 확인되는 경우가 많습니다. 3년 이상 방치하면 임플란트 보철을 만들 높이가 부족해질 정도로 진행될 수 있습니다.' },
    { q: '정출된 대합치는 치료할 수 있나요?', a: '정도에 따라 다릅니다. 1~2mm 미만은 교합면을 약간 갈아 조정하고, 2~3mm는 신경치료 후 크라운으로 높이를 재설정하며, 3mm 이상은 미니스크류를 이용해 교정적으로 밀어 넣습니다. 뿌리가 노출되고 흔들리면 발치 후 임플란트를 검토합니다.' },
    { q: '어금니 하나 없어도 그냥 살면 안 되나요?', a: '권하지 않습니다. 대합치 정출, 인접치 경사, 씹는 힘 과부하, 잇몸 문제가 순차적으로 진행되어 처음엔 임플란트 1개로 끝났을 일이 여러 치아가 얽힌 계획으로 커집니다. 뽑은 자리의 계획은 뽑은 그날 정하는 것이 가장 경제적입니다.' },
    { q: '임플란트할 때 대합치를 왜 확인하나요?', a: '대합치가 새 치아의 높이·모양·재료를 결정하기 때문입니다. 정출된 대합치가 있으면 보철 공간이 부족해 얇아지고 깨지기 쉽습니다. 또 대합치가 지르코니아 같은 단단한 보철이면 재료 선택도 달라집니다.' },
    { q: '대합치가 자연치가 아니라 보철이면 문제가 되나요?', a: '문제라기보다 고려 사항입니다. 단단한 재료끼리 맞물리면 어느 한쪽이 닳거나 깨질 수 있어, 대합치의 재료를 보고 새 보철의 재료와 교합 접촉점을 설계합니다. 이갈이가 있으면 나이트가드도 함께 계획합니다.' },
  ],
}

// ══════════════════════════════════════════════════════════
// 6. 치수강 (45노출 / 1클릭 / 4.1위) — 치아 속 신경이 사는 방
// ══════════════════════════════════════════════════════════
ENC_SUPER_V538['치수강'] = {
  detail: `
<h3>치수강이란? — 치아 머리 안쪽, 신경과 혈관이 사는 "방"</h3>
<p><strong>치수강(pulp chamber, 齒髓腔)</strong>은 치아 머리(${A('치관')}) 내부에 있는 <strong>빈 공간</strong>입니다. 이 안에 신경과 혈관, 결합조직이 뭉쳐 있는 ${A('치수')}가 들어 있습니다. 쉽게 말해 <strong>치수강은 "방"이고, 치수는 그 방에 사는 "주민"</strong>입니다.</p>
<p>겉의 ${A('법랑질')}과 ${A('상아질')}이 아무리 단단해도 치수강까지 세균이 도달하면 상황이 달라집니다. 여기가 치아에서 <strong>유일하게 통증을 느끼는 부위</strong>이고, ${A('신경치료')}가 필요해지는 지점입니다.</p>

<h3>치수강 vs 치근관 — 헷갈리는 두 용어</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">구분</th><th style="${TH}">치수강 (Pulp Chamber)</th><th style="${TH}">${A('치근관')} (Root Canal)</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>위치</strong></td><td style="${TD}">치아 <strong>머리</strong> 안쪽 (잇몸 위)</td><td style="${TD}">치아 <strong>뿌리</strong> 안쪽 (잇몸 아래 뼈 속)</td></tr>
<tr><td style="${TD}"><strong>모양</strong></td><td style="${TD}">치아 겉모양을 축소한 넓은 방</td><td style="${TD}">뿌리를 따라 내려가는 좁은 관</td></tr>
<tr><td style="${TD}"><strong>개수</strong></td><td style="${TDC}">치아당 1개</td><td style="${TD}">앞니 1개 / 소구치 1~2개 / 대구치 3~4개</td></tr>
<tr><td style="${TD}"><strong>연결</strong></td><td style="${TD}" colspan="2">치수강과 치근관은 하나로 이어진 공간입니다. "신경치료"는 이 둘을 함께 소독·충전하는 치료입니다</td></tr>
</tbody></table>
<p>그래서 신경치료를 영어로 <strong>root canal treatment</strong>라고 부릅니다. 실제 시술은 <strong>치수강 천공(방 열기) → 치수 제거 → 치근관 성형·소독 → 충전 → ${A('크라운')} 씌우기</strong> 순서로 진행됩니다.</p>

<h3>지금 통증이 어느 단계인지 확인해 보세요</h3>
${WIDGET_PULP_TRIAGE}

<h3>치수강이 하는 4가지 일</h3>
<div style="${BOX}">
<p style="margin:0 0 6px;"><strong>1. 감각</strong> — 차가움·뜨거움·압력을 감지합니다. 시린 느낌은 이 방에서 오는 신호입니다.</p>
<p style="margin:0 0 6px;"><strong>2. 영양 공급</strong> — 혈관이 상아질에 수분과 영양을 보내 치아를 "탄력 있는 상태"로 유지합니다. 신경치료한 치아가 잘 깨지는 이유가 이 공급이 끊기기 때문입니다.</p>
<p style="margin:0 0 6px;"><strong>3. 상아질 형성</strong> — 자극을 받으면 방 안쪽에 새 상아질(2차 상아질)을 만들어 스스로 벽을 두껍게 합니다.</p>
<p style="margin:0;"><strong>4. 방어</strong> — 세균이 침입하면 면역 반응으로 방어합니다. 다만 치수강은 단단한 벽으로 둘러싸여 있어 부어도 팽창할 공간이 없고, 그래서 압력이 올라가 <strong>극심한 통증</strong>이 생깁니다.</p>
</div>

<h3>나이가 들면 치수강이 좁아집니다</h3>
<p>치수강 크기는 평생 같지 않습니다. 자극을 받을 때마다 안쪽에 새 상아질이 쌓여 <strong>방이 점점 작아집니다</strong>. 이 현상을 협착 또는 석회화라 부릅니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">시기</th><th style="${TH}">치수강 상태</th><th style="${TH}">임상적 의미</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>어린이·청소년</strong></td><td style="${TD}">매우 넓고 표면에 가까움</td><td style="${TD}">얕은 충치도 금방 신경에 닿습니다. 조기 치료가 특히 중요한 이유</td></tr>
<tr><td style="${TD}"><strong>20~40대</strong></td><td style="${TD}">정상 크기</td><td style="${TD}">신경치료 시 접근이 비교적 수월합니다</td></tr>
<tr><td style="${TD}"><strong>50대 이상</strong></td><td style="${TD}">좁아지고 부분 석회화</td><td style="${TD}">신경치료 난이도 상승. 치료 시간이 더 걸릴 수 있습니다</td></tr>
<tr><td style="${TD}"><strong>외상·큰 수복 이력</strong></td><td style="${TD}">급격한 석회화 가능</td><td style="${TD}">신경이 거의 막혀 통증 없이 서서히 죽는 경우가 있습니다</td></tr>
</tbody></table>

<h3>가역적 vs 비가역적 — 살릴 수 있는지의 기준</h3>
<p>${A('치수염')}은 두 가지로 나뉘고, 이 구분이 <strong>신경을 살릴 수 있는지</strong>를 결정합니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">구분</th><th style="${TH}">가역적 치수염</th><th style="${TH}">비가역적 치수염</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>통증 양상</strong></td><td style="${TD}">자극이 있을 때만 아프고 <strong>제거하면 곧 사라짐</strong></td><td style="${TD}">자극이 없어도 <strong>저절로 아프고 오래 지속</strong></td></tr>
<tr><td style="${TD}"><strong>지속 시간</strong></td><td style="${TD}">수 초 이내</td><td style="${TD}">수 분~수십 분, 밤에 심해짐</td></tr>
<tr><td style="${TD}"><strong>온도 반응</strong></td><td style="${TD}">주로 찬 것에 시림</td><td style="${TD}">뜨거운 것에 특히 심함 / 찬물에 오히려 완화되기도</td></tr>
<tr><td style="${TD}"><strong>치료</strong></td><td style="${TD}">${A('레진')}·${A('인레이')} 등 수복으로 신경 보존 가능</td><td style="${TD}">${A('신경치료')} 필요</td></tr>
</tbody></table>
<div style="${WARN}">
<p style="margin:0;"><strong>"아프다가 안 아파졌으니 나았다"가 아닙니다.</strong> 치수강 안 신경이 <strong>완전히 죽으면 통증이 사라집니다</strong>. 이때 감염은 멈추지 않고 뿌리 끝으로 내려가 뼈에 고름집(치근단 병소)을 만듭니다. 통증이 갑자기 사라진 뒤 잇몸이 붓거나 씹을 때 뻐근하다면 오히려 진행된 신호일 수 있으니 확인이 필요합니다.</p>
</div>

<h3>치수강에 문제가 생기는 3가지 경로</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">경로</th><th style="${TH}">진행 방식</th><th style="${TH}">특징</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>충치</strong></td><td style="${TD}">법랑질 → 상아질 → 치수강 순서로 세균이 파고듭니다</td><td style="${TD}">가장 흔한 경로. 초기에 잡으면 ${A('레진')}으로 끝납니다</td></tr>
<tr><td style="${TD}"><strong>외상·파절</strong></td><td style="${TD}">치아가 깨지거나 균열이 치수강까지 도달합니다</td><td style="${TD}">${A('치아 균열')}은 X-ray에 잘 안 보여 진단이 까다롭습니다</td></tr>
<tr><td style="${TD}"><strong>반복 자극</strong></td><td style="${TD}">${A('이갈이')}, 과도한 삭제, 큰 수복물 반복 교체</td><td style="${TD}">서서히 진행되어 통증 없이 신경이 죽는 경우가 있습니다</td></tr>
</tbody></table>

<h3>치수강을 지키는 것이 곧 치아를 지키는 것입니다</h3>
<p>신경치료는 훌륭한 치료지만, <strong>하지 않는 것이 언제나 더 좋습니다</strong>. 치수강의 혈관이 살아 있는 치아는 자연 치아 그대로의 강도와 감각을 유지하지만, 신경을 제거하면 ${A('크라운')}이 필요해지고 장기적으로 파절 위험이 올라갑니다. 그래서 실제 진료에서는 <strong>치수를 살릴 수 있는 마지막 순간</strong>을 판단하는 데 가장 신경을 씁니다.</p>
<ul style="line-height:1.9;">
<li><strong>시린 증상을 방치하지 마세요</strong> — 가역적 단계에서 오시면 수복만으로 신경을 살릴 수 있습니다.</li>
<li><strong>정기 검진 + X-ray</strong> — 치수강에 가까워지는 충치는 겉에서 안 보입니다. 6개월~1년 주기 확인이 가장 확실합니다.</li>
<li><strong>깨진 치아는 통증과 무관하게 확인</strong> — 균열이 치수강에 닿기 전에 덮어주는 것이 관건입니다.</li>
<li><strong>이갈이 관리</strong> — 반복 자극은 치수강을 좁히고 신경을 서서히 지치게 만듭니다.</li>
</ul>`,
  faqs: [
    { q: '치수강이 무엇인가요?', a: '치아 머리(치관) 내부에 있는 빈 공간으로, 이 안에 신경과 혈관이 뭉쳐 있는 치수가 들어 있습니다. 치수강은 방이고 치수는 그 방에 사는 주민이라고 이해하시면 쉽습니다. 치아에서 유일하게 통증을 느끼는 부위입니다.' },
    { q: '치수강과 치근관은 어떻게 다른가요?', a: '치수강은 치아 머리 안쪽의 넓은 방이고, 치근관은 뿌리를 따라 내려가는 좁은 관입니다. 치수강은 치아당 1개, 치근관은 앞니 1개·소구치 1~2개·대구치 3~4개입니다. 둘은 하나로 이어져 있어 신경치료는 이 둘을 함께 소독·충전합니다.' },
    { q: '치수강이 나이에 따라 변하나요?', a: '네. 자극을 받을 때마다 안쪽에 새 상아질이 쌓여 점점 좁아집니다. 어린이는 치수강이 매우 넓어 얕은 충치도 금방 신경에 닿고, 50대 이상은 좁아지고 석회화되어 신경치료 난이도가 올라갑니다.' },
    { q: '치수염은 왜 밤에 더 아픈가요?', a: '누우면 머리 쪽으로 혈액이 몰려 치수강 내부 압력이 올라가기 때문입니다. 치수강은 단단한 벽으로 둘러싸여 있어 부어도 팽창할 공간이 없습니다. 그래서 압력이 신경을 직접 눌러 통증이 심해집니다.' },
    { q: '가역적 치수염과 비가역적 치수염의 차이는?', a: '가역적은 자극이 있을 때만 수 초간 아프고 자극을 없애면 사라지며, 수복 치료로 신경을 살릴 수 있습니다. 비가역적은 자극 없이도 저절로 아프고 수 분 이상 지속되며 밤에 심해집니다. 이 경우 신경치료가 필요합니다.' },
    { q: '아프다가 안 아파졌는데 나은 건가요?', a: '아닐 수 있습니다. 치수 신경이 완전히 죽으면 통증이 사라지지만 감염은 멈추지 않고 뿌리 끝으로 내려가 뼈에 고름집을 만듭니다. 통증이 갑자기 사라진 뒤 잇몸이 붓거나 씹을 때 뻐근하면 오히려 진행된 신호일 수 있어 확인이 필요합니다.' },
    { q: '신경치료한 치아는 왜 크라운을 씌워야 하나요?', a: '치수강의 혈관이 상아질에 수분과 영양을 공급해 치아를 탄력 있게 유지하는데, 신경치료로 이 공급이 끊기면 치아가 마른 나무처럼 부서지기 쉬워집니다. 게다가 방을 열기 위해 치아를 삭제하므로 구조가 약해져 크라운으로 감싸는 것이 표준입니다.' },
  ],
}

// ══════════════════════════════════════════════════════════
// 7. 지도설 (56노출 / 0클릭 / 9.2위) — 혀 위 지도 모양 반점
// ══════════════════════════════════════════════════════════
ENC_SUPER_V538['지도설'] = {
  detail: `
<h3>지도설이란? — 혀 위 지도 모양 반점, 대부분 치료가 필요 없는 양성 상태</h3>
<p><strong>지도설(geographic tongue)</strong>은 혀 표면에 붉은 지역과 흰 테두리가 어우러져 <strong>세계지도 같은 무늬</strong>가 나타나는 상태입니다. 정식 명칭은 <strong>양성 이주성 설염(benign migratory glossitis)</strong>이며, 이름 안에 이미 두 가지 핵심 정보가 들어 있습니다.</p>
<div style="${BOX}">
<p style="margin:0 0 6px;"><strong>"양성(benign)"</strong> — 암이 아니고, 전염되지 않으며, 대부분 특별한 치료 없이 지내도 되는 상태입니다.</p>
<p style="margin:0;"><strong>"이주성(migratory)"</strong> — 반점이 <strong>며칠 단위로 위치와 모양이 바뀝니다</strong>. 어제 오른쪽에 있던 무늬가 오늘 가운데로 옮겨가 있습니다. 이 "움직임"이 지도설을 다른 병변과 구분하는 가장 중요한 단서입니다.</p>
</div>
<p>인구의 약 1~3%에서 관찰되며, 어린이와 성인 모두에게 나타납니다. 실제 진료실에서는 <strong>"혀에 이상한 무늬가 생겼는데 혹시 암인가요"</strong> 하며 잔뜩 긴장해 오시는 분들이 대부분인데, 다행히 상당수는 이 지도설입니다.</p>

<h3>내 혀 상태를 확인해 보세요</h3>
${WIDGET_TONGUE_TRIAGE}

<h3>지도설의 특징 — 무엇을 보고 판단하나요</h3>
<ul style="line-height:1.9;">
<li><strong>붉은 지역</strong> — 혀 표면의 미세한 돌기(설유두)가 일시적으로 사라져 매끈하고 붉게 보입니다.</li>
<li><strong>흰 테두리</strong> — 붉은 지역 경계를 따라 약간 솟은 흰색 또는 노란색 띠가 둘러쌉니다. 이 테두리가 지도의 "국경선"처럼 보입니다.</li>
<li><strong>모양이 변합니다</strong> — 며칠~몇 주 간격으로 위치·크기·모양이 바뀝니다. <strong>고정되어 있지 않은 것이 핵심</strong>입니다.</li>
<li><strong>대개 통증이 없습니다</strong> — 다만 매운 음식·산성 음식·뜨거운 음식에 화끈거림을 느끼는 분이 일부 있습니다.</li>
<li><strong>혀 등과 옆면에 주로</strong> — 혀 위쪽 면과 측면에 나타나며, 혀 밑면이나 잇몸으로 번지는 경우는 드뭅니다.</li>
</ul>

<h3>비슷해 보이는 상태와의 구별 — 표로 정리</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">상태</th><th style="${TH}">모양 변화</th><th style="${TH}">특징적 소견</th><th style="${TH}">대응</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>지도설</strong></td><td style="${TD}">며칠 단위로 <strong>이동</strong></td><td style="${TD}">붉은 지역 + 흰 테두리, 통증 대개 없음</td><td style="${TD}">경과 관찰. 자극 음식 회피</td></tr>
<tr><td style="${TD}"><strong>${A('구강 칸디다증')}</strong></td><td style="${TD}">이동하지 않음</td><td style="${TD}">흰 막이 넓게 덮이며 <strong>긁으면 벗겨지고 밑이 빨갛습니다</strong></td><td style="${TD}">항진균 치료 대상 — 진료 필요</td></tr>
<tr><td style="${TD}"><strong>${A('백반증')}</strong></td><td style="${TD}"><strong>같은 자리에 고정</strong></td><td style="${TD}">흰 판이 긁어도 벗겨지지 않고 표면이 거칠 수 있음</td><td style="${TD}">추적 관찰·검사 대상 — 진료 필요</td></tr>
<tr><td style="${TD}"><strong>${A('설염')}·영양 결핍</strong></td><td style="${TD}">전체적으로 균일</td><td style="${TD}">혀 전면이 매끈하고 붉게 변하며 화끈거림</td><td style="${TD}">철·비타민B12·엽산 등 원인 평가</td></tr>
<tr><td style="${TD}"><strong>궤양·아프타</strong></td><td style="${TD}">한 자리에 생기고 낫는 패턴</td><td style="${TD}">파인 상처 형태로 통증이 뚜렷함</td><td style="${TD}">2주 이상 지속되면 확인 필요</td></tr>
</tbody></table>
<p style="font-size:0.86rem;color:#7a6a55;">※ 위 표는 이해를 돕기 위한 정리이며 <strong>자가 진단 도구가 아닙니다</strong>. 실제 구별은 시진·병력 청취·필요 시 검사를 통해 이루어집니다.</p>

<h3>왜 생기나요 — 알려진 연관 요인 6가지</h3>
<p>원인이 하나로 밝혀진 상태는 아니며, 여러 요인이 겹칠 때 잘 나타나는 것으로 알려져 있습니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">연관 요인</th><th style="${TH}">설명</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>유전적 경향</strong></td><td style="${TD}">가족 중에 같은 소견이 있는 경우가 흔합니다</td></tr>
<tr><td style="${TD}"><strong>스트레스·피로</strong></td><td style="${TD}">과로하거나 수면이 부족한 시기에 무늬가 뚜렷해진다는 분이 많습니다</td></tr>
<tr><td style="${TD}"><strong>호르몬 변화</strong></td><td style="${TD}">생리 주기·임신 등 변화 시기에 눈에 띄게 되는 경우가 있습니다</td></tr>
<tr><td style="${TD}"><strong>영양 상태</strong></td><td style="${TD}">비타민B군·아연·철분 부족이 혀 점막 상태에 영향을 줄 수 있습니다</td></tr>
<tr><td style="${TD}"><strong>알레르기 경향</strong></td><td style="${TD}">아토피·천식·알레르기 병력이 있는 분에서 더 자주 보고됩니다</td></tr>
<tr><td style="${TD}"><strong>구강 건조</strong></td><td style="${TD}">${A('구강건조증')}이 있으면 자극에 민감해져 화끈거림이 심해질 수 있습니다</td></tr>
</tbody></table>

<h3>어떻게 지내면 되나요 — 관리 원칙</h3>
<ul style="line-height:1.9;">
<li><strong>무늬 자체를 없애려 애쓰지 않아도 됩니다</strong> — 양성 상태이며 시간이 지나며 옮겨 다닙니다. 억지로 혀를 긁거나 문지르면 오히려 자극으로 화끈거림이 심해집니다.</li>
<li><strong>자극 음식을 줄이세요</strong> — 매운 음식, 신 과일·주스, 뜨거운 국물, 탄산, 알코올, 향이 강한 치약(강한 민트·계피)에서 불편감이 커지는 경우가 많습니다.</li>
<li><strong>혀 청소는 부드럽게</strong> — 혀 클리너를 세게 문지르면 표면이 더 예민해집니다. 가볍게 앞에서 뒤로 쓸어내는 정도가 적당합니다.</li>
<li><strong>수분 섭취와 구강 건조 관리</strong> — 입이 마르면 자극이 배가됩니다. 물을 자주 조금씩 드시고, 구강 건조가 심하면 원인을 함께 확인합니다.</li>
<li><strong>사진으로 기록하세요</strong> — 주 1회 같은 조명에서 혀 사진을 찍어두면 <strong>모양이 이동하는지 고정인지</strong>가 명확해집니다. 이 기록이 진료 시 가장 유용한 정보가 됩니다.</li>
</ul>
<div style="${WARN}">
<p style="margin:0 0 6px;"><strong>이런 경우에는 확인이 필요합니다.</strong></p>
<p style="margin:0;">① 흰 병변이 <strong>3주 이상 같은 자리에 고정</strong>되어 있다 ② 만졌을 때 <strong>단단하게 굳은 느낌</strong>이 있다 ③ 파인 상처가 <strong>2주 이상 낫지 않는다</strong> ④ 통증·화끈거림이 일상에 지장을 줄 정도다 ⑤ 목에 만져지는 것이 있거나 삼킬 때 불편하다.<br>
이 중 하나라도 해당되면 <strong>지도설이 아닌 다른 상태</strong>일 수 있습니다. 위 페이지의 자가 체크는 <strong>진단이 아닌 참고용</strong>이므로, 해당 시에는 구강내과 또는 치과에서 시진을 받으시기를 권합니다. ${A('구강암')} 문서도 함께 참고하실 수 있습니다.</p>
</div>`,
  faqs: [
    { q: '지도설은 무엇인가요?', a: '혀 표면에 붉은 지역과 흰 테두리가 어우러져 지도 같은 무늬가 나타나는 상태입니다. 정식 명칭은 양성 이주성 설염이며, 이름처럼 양성 상태이고 반점이 며칠 단위로 위치와 모양을 바꾸며 이동하는 것이 특징입니다.' },
    { q: '지도설은 암과 관련이 있나요?', a: '지도설 자체는 양성 상태로 암과 직접적인 관련이 없다고 알려져 있습니다. 다만 흰 병변이 3주 이상 같은 자리에 고정되어 있거나 단단하게 굳은 느낌, 2주 이상 낫지 않는 궤양이 있다면 다른 상태일 수 있으므로 시진을 받으시는 것이 안전합니다.' },
    { q: '지도설은 전염되나요?', a: '전염되지 않습니다. 세균이나 바이러스에 의한 감염성 질환이 아니라 혀 표면 돌기가 일시적으로 사라졌다 회복되는 양성 변화입니다. 가족 간에 같이 나타나는 경우는 전염이 아니라 유전적 경향 때문으로 봅니다.' },
    { q: '지도설과 구강 칸디다증은 어떻게 구별하나요?', a: '지도설은 며칠 단위로 무늬가 이동하고 통증이 대개 없습니다. 구강 칸디다증은 이동하지 않으며 흰 막이 넓게 덮이고 긁으면 벗겨지면서 밑이 빨갛게 드러나는 특징이 있습니다. 칸디다증은 치료 대상이므로 진료가 필요합니다.' },
    { q: '지도설은 치료해야 하나요?', a: '무늬 자체를 없애기 위한 치료는 일반적으로 필요하지 않습니다. 시간이 지나며 위치가 바뀌고 저절로 옅어지기도 합니다. 화끈거림이 불편하면 매운 음식·신 과일·뜨거운 국물·강한 민트 치약 같은 자극 요인을 줄이는 것이 실질적인 도움이 됩니다.' },
    { q: '왜 생기는 건가요?', a: '원인이 하나로 확정된 상태는 아닙니다. 유전적 경향, 스트레스와 피로, 호르몬 변화, 비타민B군·아연·철분 등 영양 상태, 알레르기 경향, 구강 건조가 연관 요인으로 알려져 있습니다. 여러 요인이 겹칠 때 무늬가 뚜렷해지는 경우가 많습니다.' },
    { q: '언제 병원에 가야 하나요?', a: '흰 병변이 3주 이상 같은 자리에 고정되어 있거나, 단단하게 굳은 느낌이 있거나, 파인 상처가 2주 이상 낫지 않거나, 통증이 일상에 지장을 줄 정도이거나, 목에 만져지는 것이 있으면 확인이 필요합니다. 주 1회 같은 조명에서 혀 사진을 찍어 이동 여부를 기록해 오시면 큰 도움이 됩니다.' },
  ],
}

// ══════════════════════════════════════════════════════════
// 8. 파워체인 (36노출 / 0클릭 / 7.2위) — 치아 간격 닫는 고무 사슬
// ══════════════════════════════════════════════════════════
ENC_SUPER_V538['파워체인'] = {
  detail: `
<h3>파워체인이란? — 치아를 서로 끌어당겨 틈을 닫는 "고무 사슬"</h3>
<p><strong>파워체인(power chain)</strong>은 교정 치료에서 사용하는 <strong>고리가 사슬처럼 연결된 고무 밴드</strong>입니다. 정식 명칭은 <strong>엘라스토메릭 체인(elastomeric chain)</strong>, 백과사전에서는 ${A('교정용 탄성체인')}으로도 표기합니다. 브라켓마다 하나씩 끼우는 낱개 고무링과 달리, <strong>여러 치아를 한 줄로 묶어 서로 끌어당기는</strong> 것이 핵심입니다.</p>
<p>교정 중 어느 시점에 "이제 파워체인 걸겠습니다"라는 말을 들으면 대개 좋은 신호입니다. <strong>배열이 어느 정도 정리되어 이제 공간을 닫는 단계</strong>에 들어섰다는 뜻이기 때문입니다.</p>

<h3>파워체인은 언제 사용하나요 — 4가지 목적</h3>
<div style="${BOX}">
<p style="margin:0 0 6px;"><strong>1. 발치 공간 닫기</strong> — 교정을 위해 ${A('소구치')}를 뽑은 자리를 앞뒤 치아를 당겨 메웁니다. 파워체인의 가장 대표적인 용도입니다.</p>
<p style="margin:0 0 6px;"><strong>2. 치아 사이 틈 닫기</strong> — 앞니 사이 틈(정중이개)이나 벌어진 치열의 공간을 좁힙니다.</p>
<p style="margin:0 0 6px;"><strong>3. 치열 안정화</strong> — 배열이 끝난 구간을 한 줄로 묶어 다시 벌어지지 않게 유지합니다.</p>
<p style="margin:0;"><strong>4. 회전 보정</strong> — 살짝 돌아간 치아를 원하는 방향으로 당겨 각도를 잡습니다.</p>
</div>

<h3>파워체인 종류 — 고리 간격에 따라 3가지</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">종류</th><th style="${TH}">고리 간격</th><th style="${TH}">힘</th><th style="${TH}">주요 용도</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>Closed</strong> (밀착형)</td><td style="${TD}">고리가 붙어 있음</td><td style="${TDC}">가장 강함</td><td style="${TD}">좁은 간격을 강하게 당길 때</td></tr>
<tr><td style="${TD}"><strong>Short</strong> (중간형)</td><td style="${TD}">고리 사이 짧은 연결부</td><td style="${TDC}">중간</td><td style="${TD}">일반적인 발치 공간 폐쇄</td></tr>
<tr><td style="${TD}"><strong>Long / Open</strong> (개방형)</td><td style="${TD}">연결부가 길어 간격 넓음</td><td style="${TDC}">약함</td><td style="${TD}">치아를 건너뛰어 걸 때, 부드러운 힘이 필요할 때</td></tr>
</tbody></table>
<p>어떤 종류를 쓰는지는 목표 이동량, 치아 간 거리, 뿌리 상태에 따라 담당의가 결정합니다. <strong>강한 것이 항상 좋은 것은 아닙니다.</strong> 과한 힘은 뿌리와 뼈에 부담을 주고 오히려 이동을 방해합니다.</p>

<h3>파워체인 관리 — 가장 많이 묻는 5가지</h3>
${WIDGET_POWERCHAIN_CARE}

<h3>교체 주기 — 왜 4~6주마다 바꾸나요</h3>
<p>고무는 시간이 지나면 늘어나며 힘을 잃습니다. 이것을 <strong>힘 감쇠(force decay)</strong>라 하는데, 실제로는 <strong>착용 첫 24시간 안에 초기 힘의 상당 부분이 빠지고</strong>, 이후 서서히 감소해 <strong>4~6주 무렵에는 치아를 움직일 만한 힘이 거의 남지 않습니다</strong>.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr>
<th style="${TH}">시점</th><th style="${TH}">상태</th><th style="${TH}">체감</th>
</tr></thead>
<tbody>
<tr><td style="${TD}"><strong>당일~2일</strong></td><td style="${TD}">힘이 가장 강하게 작용</td><td style="${TD}">뻐근하고 씹을 때 아픕니다. 정상 반응입니다</td></tr>
<tr><td style="${TD}"><strong>3일~1주</strong></td><td style="${TD}">힘이 안정 구간으로 진입</td><td style="${TD}">통증이 눈에 띄게 줄어듭니다</td></tr>
<tr><td style="${TD}"><strong>2~4주</strong></td><td style="${TD}">완만하게 힘 감소, 이동 진행</td><td style="${TD}">거의 느껴지지 않습니다</td></tr>
<tr><td style="${TD}"><strong>4~6주</strong></td><td style="${TD}">유효 힘 소진 + 변색·늘어짐</td><td style="${TD}">교체 시점. 내원해 새로 걸어야 진도가 유지됩니다</td></tr>
</tbody></table>
<div style="${WARN}">
<p style="margin:0;"><strong>예약을 미루면 진도가 멈춥니다.</strong> 힘이 빠진 파워체인은 그냥 걸려 있을 뿐 치아를 움직이지 않습니다. 한두 달 미루면 그만큼 <strong>전체 교정 기간이 늘어납니다</strong>. 교정에서 가장 확실하게 기간을 단축하는 방법은 새 장비가 아니라 <strong>예약을 지키는 것</strong>입니다.</p>
</div>

<h3>변색·끊어짐·통증 — 상황별 대처</h3>
<ul style="line-height:1.9;">
<li><strong>색이 노랗게 변했다</strong> — 커리·김치·커피·홍차·와인 색소가 스며든 것입니다. 힘에는 영향이 없으며 교체하면 원래대로 돌아옵니다. 신경 쓰이면 색소가 강한 음식을 줄이거나, 애초에 회색·투명 계열 체인을 요청해 보실 수 있습니다.</li>
<li><strong>중간이 끊어졌다</strong> — 응급은 아니지만 <strong>그 구간의 힘이 0이 되어 진도가 멈춥니다</strong>. 치과에 연락해 일정을 앞당기세요. 남은 조각이 잇몸을 찌른다면 깨끗한 손으로 조심히 제거하셔도 됩니다.</li>
<li><strong>많이 아프다</strong> — 새로 걸고 1~3일은 뻐근함이 정상입니다. 부드러운 음식과 미온수, 필요 시 진통제로 넘기시면 됩니다. 다만 <strong>특정 치아 하나만 심하게 아프거나 흔들림·잇몸 부종이 함께 있으면</strong> 힘이 잘못 걸린 신호일 수 있어 확인이 필요합니다.</li>
<li><strong>잇몸이 눌린다</strong> — 체인이 잇몸을 압박하면 국소 염증이 생길 수 있습니다. 자가 조정하지 말고 내원해 위치를 조정받으세요.</li>
</ul>

<h3>파워체인 착용 중 양치 — 여기가 승부처입니다</h3>
<p>파워체인이 걸린 구간은 <strong>치태가 가장 잘 끼는 지형</strong>입니다. 고리 아래와 브라켓 주변에 음식물이 갇히기 때문입니다. 교정 중 ${A('치은염')}과 하얀 탈회 반점(white spot)이 이 구간에서 유독 많이 생깁니다.</p>
<ul style="line-height:1.9;">
<li><strong>교정용 칫솔(V자형)</strong>로 브라켓 위·아래를 따로 닦습니다. 한 번에 훑으면 고리 아래가 남습니다.</li>
<li><strong>치간칫솔</strong>을 체인과 치아 사이로 통과시켜 갇힌 음식물을 빼냅니다. 파워체인 구간에서는 ${A('치실')}보다 치간칫솔이 실용적입니다.</li>
<li><strong>불소 치약 + ${A('불소 도포')}</strong>로 탈회를 예방합니다. 교정 중 흰 반점은 장치를 떼도 남기 때문에 예방이 유일한 해법에 가깝습니다.</li>
<li><strong>교정 중 ${A('스케일링')}</strong>을 3~6개월 주기로 받으세요. 장치 주변 ${A('치석')}은 칫솔로 제거되지 않습니다. ${A('스케일링 건강보험')}은 만 19세 이상 연 1회 본인부담 약 1~2만원, 비보험은 6만원입니다.</li>
<li><strong>끈적하고 질긴 음식 회피</strong> — 엿·캐러멜·떡은 체인을 잡아당겨 끊거나 브라켓을 떨어뜨립니다.</li>
</ul>

<h3>공간이 닫힌 다음 — 유지장치가 진짜 마무리입니다</h3>
<p>파워체인으로 틈을 닫아도 치아는 <strong>원래 자리로 돌아가려는 성질(재발)</strong>이 있습니다. 특히 발치 공간을 닫은 구간과 앞니 사이 틈은 재발이 잘 나타나는 부위입니다. 그래서 장치를 뗀 직후부터 ${A('유지장치')} 착용이 시작됩니다.</p>
<p>서울비디치과 유지장치는 <strong>양악 25만원 / 편악 15만원</strong>입니다. 투명 교정으로 진행하시는 경우 ${A('인비절라인')} 패키지는 익스프레스 300만원, 퍼스트 400만원, 라이트 450만원, 모더레이트 550만원, 컴프리헨시브 700만원입니다.</p>`,
  faqs: [
    { q: '파워체인이 무엇인가요?', a: '교정에서 사용하는 고리가 사슬처럼 연결된 고무 밴드입니다. 정식 명칭은 엘라스토메릭 체인이며, 브라켓마다 하나씩 끼우는 낱개 고무링과 달리 여러 치아를 한 줄로 묶어 서로 끌어당겨 틈을 닫는 역할을 합니다.' },
    { q: '파워체인은 얼마나 자주 교체하나요?', a: '보통 4~6주마다 교체합니다. 고무는 착용 첫 24시간 안에 초기 힘의 상당 부분을 잃고 이후 서서히 감소해, 4~6주 무렵에는 치아를 움직일 만한 힘이 거의 남지 않습니다. 예약을 미루면 그만큼 전체 교정 기간이 늘어납니다.' },
    { q: '파워체인 색이 변했는데 괜찮나요?', a: '괜찮습니다. 커리·김치·커피·홍차·와인 색소가 스며든 것으로 힘에는 영향이 없고 교체하면 원래대로 돌아옵니다. 신경 쓰이시면 색소가 강한 음식을 줄이거나, 회색·투명 계열 체인을 요청해 보실 수 있습니다.' },
    { q: '파워체인이 끊어졌어요. 응급인가요?', a: '응급은 아니지만 그 구간의 힘이 0이 되어 치아 이동이 멈춥니다. 치과에 연락해 일정을 앞당기시는 것이 좋습니다. 남은 조각이 잇몸을 찌른다면 깨끗한 손으로 조심히 제거하셔도 됩니다.' },
    { q: '파워체인을 걸면 왜 아픈가요?', a: '치아에 지속적인 힘이 걸리면서 뿌리 주변 조직에 변화가 일어나기 때문입니다. 새로 걸고 1~3일 뻐근한 것은 정상이며 부드러운 음식과 필요 시 진통제로 넘기면 됩니다. 다만 특정 치아 하나만 심하게 아프거나 흔들림·잇몸 부종이 함께 있으면 확인이 필요합니다.' },
    { q: '파워체인 착용 중 양치는 어떻게 하나요?', a: '고리 아래와 브라켓 주변에 음식물이 갇히므로 교정용 V자 칫솔로 브라켓 위·아래를 따로 닦고, 치간칫솔을 체인과 치아 사이로 통과시켜 빼냅니다. 불소 치약으로 탈회를 예방하고, 3~6개월 주기 스케일링을 병행하세요.' },
    { q: '파워체인으로 틈을 닫으면 다시 벌어지지 않나요?', a: '치아는 원래 자리로 돌아가려는 성질이 있어 유지장치 없이는 재발할 수 있습니다. 특히 발치 공간을 닫은 구간과 앞니 사이 틈이 재발이 잘 나타납니다. 장치를 뗀 직후부터 유지장치 착용이 시작되며, 서울비디치과 유지장치는 양악 25만원 / 편악 15만원입니다.' },
  ],
}
