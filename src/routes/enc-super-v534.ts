// ============================================================
// 백과사전 슈퍼 콘텐츠 v5.34 — "제로클릭 거인" 8종 회수
// GSC 3개월: 노출은 높은데 클릭 0인 용어를 슈퍼 콘텐츠 공식으로 오버라이드
//   정출(157/0) · 소구치(143/0) · 치식(90/0) · 대구치(84/0)
//   정중선(80/2) · 견치(66/0) · 턱에서 소리(55/0, 순위 1위!) · 실비보험(치과실비 계 140/0)
// 공식: 제목에 답 예고 + 인터랙티브 위젯 + 표 구조 + 검색의도 100% 해소
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
 * 위젯 A — 치아 이름 탐색기 (소구치·대구치·견치·치식 공용)
 *   defaultKey로 각 페이지의 주인공 치아가 먼저 열리게 함
 * ============================================================ */
export const WIDGET_TOOTH_EXPLORER = (uid: string, defaultKey: string) => `
<div style="${WBOX}" id="tx-${uid}">
<p style="${WTITLE}">🦷 치아 이름·번호 탐색기</p>
<p style="${WSUB}">치아를 누르면 정식 명칭·FDI 치식 번호·개수·나는 시기·역할을 한눈에 보여드립니다</p>
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;" role="tablist">
<button class="tx-b" data-k="ci" style="${WBTN}">중절치</button>
<button class="tx-b" data-k="li" style="${WBTN}">측절치</button>
<button class="tx-b" data-k="cn" style="${WBTN}">견치</button>
<button class="tx-b" data-k="p1" style="${WBTN}">제1소구치</button>
<button class="tx-b" data-k="p2" style="${WBTN}">제2소구치</button>
<button class="tx-b" data-k="m1" style="${WBTN}">제1대구치</button>
<button class="tx-b" data-k="m2" style="${WBTN}">제2대구치</button>
<button class="tx-b" data-k="m3" style="${WBTN}">사랑니</button>
</div>
<div id="tx-p-${uid}" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var D={
ci:{n:'중절치 (中切齒)',nick:'앞니 한가운데 두 개',fdi:'11 · 21 · 31 · 41',cnt:'4개',age:'만 6~8세',job:'음식을 자르고 발음·미소 라인을 결정',tip:'가장 눈에 띄는 치아라 파절·변색 시 심미 치료 수요가 큽니다. 넘어짐 사고로 가장 자주 다치는 치아이기도 합니다.'},
li:{n:'측절치 (側切齒)',nick:'중절치 옆 앞니',fdi:'12 · 22 · 32 · 42',cnt:'4개',age:'만 7~9세',job:'앞니 라인을 완성하고 자르기를 보조',tip:'선천적으로 작거나(왜소치) 아예 없는 결손이 비교적 흔한 치아입니다. 앞니 사이 틈의 원인이 되기도 합니다.'},
cn:{n:'견치 (犬齒)',nick:'송곳니 · 캐나인(canine)',fdi:'13 · 23 · 33 · 43',cnt:'4개',age:'만 9~12세',job:'음식을 찢고, 턱을 옆으로 움직일 때 다른 치아를 보호(견치유도)',tip:'치근(뿌리)이 가장 길고 튼튼해 마지막까지 남는 치아로 알려져 있습니다. 위 송곳니는 잇몸 속에 묻히는 매복이 비교적 흔합니다.'},
p1:{n:'제1소구치 (第1小臼齒)',nick:'첫 번째 작은어금니 · 프리몰라',fdi:'14 · 24 · 34 · 44',cnt:'4개',age:'만 10~11세',job:'견치와 대구치 사이에서 찢기와 으깨기를 함께 담당',tip:'교정 시 공간이 부족할 때 발치를 가장 많이 검토하는 치아입니다. 유치에는 소구치가 없고, 유구치가 빠진 자리에 올라옵니다.'},
p2:{n:'제2소구치 (第2小臼齒)',nick:'두 번째 작은어금니',fdi:'15 · 25 · 35 · 45',cnt:'4개',age:'만 10~12세',job:'대구치와 함께 음식을 으깨는 역할',tip:'선천적 결손이 사랑니·측절치 다음으로 흔한 치아입니다. 유치가 늦게까지 안 빠지면 X-ray로 영구치 유무를 확인합니다.'},
m1:{n:'제1대구치 (第1大臼齒)',nick:'6세 구치 · 첫 번째 큰어금니',fdi:'16 · 26 · 36 · 46',cnt:'4개',age:'만 6세 전후',job:'씹는 힘의 핵심이자 위아래 치열이 맞물리는 기준점',tip:'유치가 빠지지 않고 유치 맨 뒤에 조용히 나기 때문에 유치로 오해하기 쉽습니다. 홈이 깊어 충치가 가장 잘 생기는 치아이므로 실란트 예방을 권합니다.'},
m2:{n:'제2대구치 (第2大臼齒)',nick:'12세 구치 · 두 번째 큰어금니',fdi:'17 · 27 · 37 · 47',cnt:'4개',age:'만 11~13세',job:'제1대구치와 함께 씹는 힘을 분담',tip:'가장 안쪽이라 칫솔이 잘 닿지 않아 충치·잇몸병 위험이 높습니다. 사랑니가 밀고 들어오면 뒷면에 충치가 생기기도 합니다.'},
m3:{n:'제3대구치 (第3大臼齒)',nick:'사랑니 · 지치(智齒)',fdi:'18 · 28 · 38 · 48',cnt:'0~4개 (사람마다 다름)',age:'만 17~25세',job:'현대인에게는 씹는 기능 기여가 거의 없는 경우가 많음',tip:'비스듬히 눕거나 잇몸에 묻히는 매복이 흔해, 앞 치아를 썩게 하거나 염증을 일으키면 발치를 검토합니다. 아예 없는 사람도 많습니다.'}
};
var box=document.getElementById('tx-${uid}');if(!box)return;
var panel=box.querySelector('#tx-p-${uid}'),tabs=box.querySelectorAll('.tx-b');
function row(l,v){return '<span style="color:#8a7a66;white-space:nowrap;">'+l+'</span><span>'+v+'</span>';}
function render(k){var d=D[k];
panel.innerHTML='<div style="font-weight:800;color:#6B4226;font-size:1.02rem;margin-bottom:2px;">'+d.n+'</div>'+
'<div style="font-size:0.82rem;color:#8a7a66;margin-bottom:10px;">'+d.nick+'</div>'+
'<div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;">'+
row('🔢 치식 번호','<b>'+d.fdi+'</b>')+row('🧮 개수',d.cnt)+row('📅 나는 시기',d.age)+row('⚙️ 역할',d.job)+
'</div><div style="margin-top:12px;padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;font-size:0.85rem;">💡 '+d.tip+'</div>';}
tabs.forEach(function(t){t.onclick=function(){tabs.forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});t.style.background='#6B4226';t.style.color='#fff';render(t.dataset.k);};});
var def=box.querySelector('[data-k="${defaultKey}"]');if(def){def.style.background='#6B4226';def.style.color='#fff';}
render('${defaultKey}');
})();</script>`

/* ============================================================
 * 위젯 B — 정출 유형 판별기
 * ============================================================ */
export const WIDGET_EXTRUSION_TYPE = `
<div style="${WBOX}" id="exType">
<p style="${WTITLE}">🔎 정출 유형 판별기</p>
<p style="${WSUB}">같은 &ldquo;정출&rdquo;이라도 원인에 따라 응급도와 치료가 완전히 다릅니다. 상황을 골라보세요</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
<button class="ex-b" data-k="tr" style="${WBTN}">사고로 치아가 튀어나왔어요</button>
<button class="ex-b" data-k="op" style="${WBTN}">치과에서 정출시킨대요</button>
<button class="ex-b" data-k="ov" style="${WBTN}">반대편 이가 없어서 자랐어요</button>
</div>
<div id="ex-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var D={
tr:{n:'외상성 정출 (정출성 탈구)',lv:'🚨 응급 — 당일 치과 방문',lvc:'#c0392b',
 what:'넘어짐·부딪힘 등 충격으로 치아가 치조골 밖으로 밀려 나온 상태입니다. 치아가 길어 보이고 흔들리며, 물면 먼저 닿아 아픕니다.',
 doo:'가능한 한 빨리(수 시간 이내) 치과에 가세요. 치아를 억지로 밀어 넣거나 흔들어 보지 마시고, 부드러운 음식만 드세요.',
 tx:'국소마취 후 원래 위치로 되돌려 고정(스플린트)하고, 보통 2~4주 고정합니다. 이후 신경이 죽는지 정기 검사하며 필요하면 신경치료를 합니다.',
 note:'빨리 조치할수록 치아를 살릴 가능성이 높아집니다. 시간이 지나면 뿌리 흡수·치아 변색·신경 괴사로 이어질 수 있습니다.'},
op:{n:'교정적 정출 (의도적 정출)',lv:'✅ 계획된 치료 — 치아를 살리기 위한 과정',lvc:'#2d7d46',
 what:'치아가 잇몸 아래로 깊게 부러졌거나 뿌리만 남았을 때, 교정 장치로 치아를 천천히 위로 끌어올려 크라운을 씌울 수 있게 만드는 치료입니다.',
 doo:'발치 대신 자연치를 살리는 선택지입니다. 보통 몇 주~몇 개월에 걸쳐 서서히 진행되며 정기 내원이 필요합니다.',
 tx:'교정 장치로 정출 → 위치 안정 대기 → 필요 시 잇몸·뼈 다듬기 → 최종 크라운 제작 순으로 진행합니다.',
 note:'모든 케이스에 가능한 것은 아니며, 남은 뿌리 길이와 뼈 상태에 따라 발치 후 임플란트가 더 나은 경우도 있습니다.'},
ov:{n:'병적 정출 (대합치 상실로 인한 과맹출)',lv:'⚠️ 서서히 진행 — 빠를수록 해결이 쉬움',lvc:'#b8860b',
 what:'맞물리던 반대편 치아가 없어지면, 남은 치아가 막아주는 상대가 없어 잇몸 밖으로 조금씩 자라 나옵니다. 이가 길어 보이고 반대쪽 잇몸에 닿기도 합니다.',
 doo:'빠진 치아 자리를 오래 비워두지 마세요. 정출이 심해지면 나중에 임플란트나 보철을 할 공간 자체가 사라집니다.',
 tx:'정도가 가벼우면 치아 삭제·교합 조정으로, 심하면 교정으로 밀어 넣거나(압하) 부득이하게 발치를 검토합니다. 근본 해결은 빠진 자리를 채우는 것입니다.',
 note:'통증이 없어 방치하기 쉽지만, 치료 난이도와 비용이 시간과 함께 커지는 대표적인 경우입니다.'}
};
var box=document.getElementById('exType');if(!box)return;
var panel=box.querySelector('#ex-p'),tabs=box.querySelectorAll('.ex-b');
function render(k){var d=D[k];
panel.innerHTML='<div style="font-weight:800;color:#6B4226;font-size:1rem;margin-bottom:6px;">'+d.n+'</div>'+
'<div style="display:inline-block;background:'+d.lvc+';color:#fff;border-radius:50px;padding:4px 12px;font-size:0.78rem;font-weight:700;margin-bottom:10px;">'+d.lv+'</div>'+
'<div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;">'+
'<span style="color:#8a7a66;white-space:nowrap;">📌 상태</span><span>'+d.what+'</span>'+
'<span style="color:#8a7a66;white-space:nowrap;">🙋 지금 할 일</span><span>'+d.doo+'</span>'+
'<span style="color:#8a7a66;white-space:nowrap;">🏥 치과 치료</span><span>'+d.tx+'</span></div>'+
'<div style="margin-top:12px;padding:10px 12px;background:#fff8ec;border:1px solid #ecd9b4;border-radius:8px;font-size:0.85rem;">💡 '+d.note+'</div>';}
tabs.forEach(function(t){t.onclick=function(){tabs.forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});t.style.background='#6B4226';t.style.color='#fff';render(t.dataset.k);};});
tabs[0].style.background='#6B4226';tabs[0].style.color='#fff';render('tr');
})();</script>`

/* ============================================================
 * 위젯 C — 턱관절 소리 유형 체커 (GSC 1위 · 클릭 0 회수용)
 * ============================================================ */
export const WIDGET_TMJ_SOUND = `
<div style="${WBOX}" id="tmjSnd">
<p style="${WTITLE}">👂 턱에서 나는 소리, 어떤 유형인가요?</p>
<p style="${WSUB}">소리의 종류와 동반 증상을 고르면 지금 병원에 가야 할 상황인지 알려드립니다</p>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">1. 어떤 소리가 나나요?</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="tj-s" data-v="click" style="${WBTN}">딱 · 딸깍 (한 번 튀는 소리)</button>
<button class="tj-s" data-v="crep" style="${WBTN}">사각사각 · 서걱서걱 (갈리는 소리)</button>
</div></div>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">2. 함께 있는 증상을 모두 골라주세요</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="tj-x" data-v="pain" style="${WBTN}">턱이 아프다</button>
<button class="tj-x" data-v="lock" style="${WBTN}">입이 잘 안 벌어진다</button>
<button class="tj-x" data-v="catch" style="${WBTN}">벌릴 때 걸리는 느낌</button>
<button class="tj-x" data-v="head" style="${WBTN}">두통 · 귀 통증</button>
</div></div>
<div id="tj-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('tmjSnd');if(!box)return;
var panel=box.querySelector('#tj-p');
var snd='click',ex={};
function render(){
 var n=0;for(var k in ex){if(ex[k])n++;}
 var lv,lvc,msg,adv;
 if(snd==='crep'){
  lv='진료 권장';lvc='#c0392b';
  msg='사각사각·서걱서걱 갈리는 소리(염발음)는 관절 표면이 닳아 뼈끼리 마찰하는 신호일 수 있어, 딸깍 소리보다 주의 깊게 볼 필요가 있습니다.';
  adv='턱관절 골관절염 등을 감별하기 위해 영상 검사를 포함한 진료를 받아보시길 권합니다.';
 } else if(n===0){
  lv='경과 관찰 가능';lvc='#2d7d46';
  msg='통증이나 개구 제한 없이 딸깍 소리만 나는 경우는 비교적 흔하며, 당장 치료가 필요하지 않은 경우가 많습니다.';
  adv='단단하고 질긴 음식·과도한 입 벌리기·이 악물기를 줄이며 지켜보세요. 통증이나 걸림이 새로 생기면 진료받으시길 권합니다.';
 } else if(n>=2||ex.lock){
  lv='진료 권장';lvc='#c0392b';
  msg='소리에 더해 통증이나 개구 제한이 함께 있다면 관절 원판(디스크) 위치 이상이나 근육 문제가 동반됐을 가능성이 있습니다.';
  adv='입이 갑자기 안 벌어지는 급성 잠김은 빠른 처치가 도움이 되므로, 가급적 이른 시일 내 진료를 받아보세요.';
 } else {
  lv='주의 관찰';lvc='#b8860b';
  msg='소리와 함께 불편한 증상이 하나 있는 단계입니다. 아직 심하지 않더라도 생활 습관 관리가 필요한 시점입니다.';
  adv='딱딱한 음식·껌·이 악물기를 줄이고 온찜질과 휴식을 병행해 보세요. 2주 이상 지속되면 진료를 권합니다.';
 }
 panel.innerHTML='<div style="display:inline-block;background:'+lvc+';color:#fff;border-radius:50px;padding:5px 14px;font-size:0.82rem;font-weight:700;margin-bottom:10px;">'+lv+'</div>'+
 '<p style="margin:0 0 10px;">'+msg+'</p>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;">👉 '+adv+'</div>'+
 '<p style="font-size:0.78rem;color:#8a7a66;margin:10px 0 0;">※ 자가 참고용 안내이며 진단이 아닙니다. 정확한 평가는 검사 후 가능합니다.</p>';
}
box.querySelectorAll('.tj-s').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.tj-s').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';snd=b.dataset.v;render();};});
box.querySelectorAll('.tj-x').forEach(function(b){b.onclick=function(){
 ex[b.dataset.v]=!ex[b.dataset.v];
 b.style.background=ex[b.dataset.v]?'#c9a96e':'#fff';b.style.color=ex[b.dataset.v]?'#fff':'#6B4226';render();};});
var f=box.querySelector('.tj-s');f.style.background='#6B4226';f.style.color='#fff';
render();
})();</script>`

/* ============================================================
 * 위젯 D — 실비보험 치과 보장 체커
 * ============================================================ */
export const WIDGET_INSURANCE_CHECK = `
<div style="${WBOX}" id="insChk">
<p style="${WTITLE}">💳 내 치과 치료, 실비보험 될까?</p>
<p style="${WSUB}">치료를 받게 된 &ldquo;이유&rdquo;와 &ldquo;항목&rdquo;을 고르면 일반적인 처리 방향을 안내합니다</p>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">1. 치료를 받게 된 이유</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="in-c" data-v="dis" style="${WBTN}">충치·잇몸병 등 질병</button>
<button class="in-c" data-v="acc" style="${WBTN}">넘어짐·사고 등 상해</button>
<button class="in-c" data-v="est" style="${WBTN}">심미·미용 목적</button>
</div></div>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">2. 받은(받을) 치료</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="in-t" data-v="sur" style="${WBTN}">수술 · 입원</button>
<button class="in-t" data-v="gen" style="${WBTN}">일반 치과 치료</button>
<button class="in-t" data-v="pro" style="${WBTN}">임플란트 · 보철 · 교정</button>
</div></div>
<div id="in-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('insChk');if(!box)return;
var panel=box.querySelector('#in-p'),cause='dis',tx='gen';
function render(){
 var lv,lvc,msg,tip;
 if(cause==='est'||tx==='pro'){
  lv='보장 어려운 경우가 많음';lvc='#c0392b';
  msg='임플란트·보철·교정·미백처럼 실손의료보험 약관에서 보장 대상에서 제외되는 항목이거나, 미용·심미 목적의 치료는 일반적으로 실비 보장이 어렵습니다.';
  tip='이 영역은 실손보험이 아니라 별도의 치아보험(치과 전용 상품)으로 대비하는 것이 일반적입니다. 만 65세 이상 임플란트·틀니는 건강보험 부분 적용을 먼저 확인해 보세요.';
 } else if(cause==='acc'){
  lv='보장 가능성 있음';lvc='#2d7d46';
  msg='넘어짐·부딪힘 등 우연한 사고(상해)로 인한 치과 치료는 질병으로 인한 치료보다 보장 가능성이 있는 편입니다. 다만 보철·임플란트 등 제외 항목은 그대로 적용될 수 있습니다.';
  tip='사고 경위를 남기는 것이 중요합니다. 진단서·진료비 세부내역서·사고 정황 자료를 챙기고, 청구 전 보험사에 상해 처리 여부를 문의하세요.';
 } else if(tx==='sur'){
  lv='조건부 보장 가능성';lvc='#b8860b';
  msg='질병으로 인한 치료라도 수술·입원에 해당하는 경우에는 약관에 따라 급여 본인부담분 등이 보장될 수 있습니다. 다만 치과 영역은 보험사·가입 시기별 약관 차이가 큽니다.';
  tip='진료 전에 보험사에 해당 처치의 보장 여부를 확인하고, 진단명(질병코드)이 기재된 서류를 준비하는 것이 안전합니다.';
 } else {
  lv='보장 제한적';lvc='#b8860b';
  msg='충치·잇몸병 등 질병에 대한 통원 치과 치료는 실손의료보험에서 보장 범위가 제한적인 경우가 많습니다. 가입 시기와 약관에 따라 결과가 달라집니다.';
  tip='건강보험이 적용되는 항목(스케일링 연 1회, 신경치료 등)은 비용 부담 자체가 크지 않습니다. 우선 급여 적용 여부부터 확인해 보세요.';
 }
 panel.innerHTML='<div style="display:inline-block;background:'+lvc+';color:#fff;border-radius:50px;padding:5px 14px;font-size:0.82rem;font-weight:700;margin-bottom:10px;">'+lv+'</div>'+
 '<p style="margin:0 0 10px;">'+msg+'</p>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;">💡 '+tip+'</div>'+
 '<p style="font-size:0.78rem;color:#8a7a66;margin:10px 0 0;">※ 실손보험 보장 여부는 <b>가입 시기·상품·약관</b>에 따라 크게 다릅니다. 최종 판단은 반드시 본인 보험사·약관으로 확인하세요. 치과는 보험금 지급 주체가 아닙니다.</p>';
}
box.querySelectorAll('.in-c').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.in-c').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';cause=b.dataset.v;render();};});
box.querySelectorAll('.in-t').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.in-t').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';tx=b.dataset.v;render();};});
var a=box.querySelector('.in-c'),b2=box.querySelectorAll('.in-t')[1];
a.style.background='#6B4226';a.style.color='#fff';b2.style.background='#6B4226';b2.style.color='#fff';
render();
})();</script>`

/* ============================================================
 * 위젯 E — 정중선 편위 자가 체크
 * ============================================================ */
export const WIDGET_MIDLINE_CHECK = `
<div style="${WBOX}" id="mlChk">
<p style="${WTITLE}">📐 내 치아 정중선, 얼마나 틀어졌을까?</p>
<p style="${WSUB}">거울을 보며 확인한 내용을 고르면 일반적인 판단 기준을 안내합니다</p>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">앞니 가운데 선이 얼굴 중앙과 얼마나 어긋나 보이나요?</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="ml-b" data-v="0" style="${WBTN}">거의 일치</button>
<button class="ml-b" data-v="1" style="${WBTN}">살짝 어긋남 (1~2mm)</button>
<button class="ml-b" data-v="2" style="${WBTN}">눈에 띄게 어긋남 (3mm 이상)</button>
</div></div>
<div style="margin-bottom:12px;">
<p style="font-size:0.85rem;font-weight:700;color:#6B4226;margin:0 0 6px;">해당되는 것을 모두 골라주세요</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="ml-x" data-v="miss" style="${WBTN}">빠진 치아가 있다</button>
<button class="ml-x" data-v="chew" style="${WBTN}">한쪽으로만 씹는다</button>
<button class="ml-x" data-v="face" style="${WBTN}">얼굴 좌우가 달라 보인다</button>
<button class="ml-x" data-v="tmj" style="${WBTN}">턱에서 소리가 난다</button>
</div></div>
<div id="ml-p" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('mlChk');if(!box)return;
var panel=box.querySelector('#ml-p'),dev='0',ex={};
function render(){
 var n=0;for(var k in ex){if(ex[k])n++;}
 var lv,lvc,msg,adv;
 if(dev==='0'&&n===0){
  lv='특별한 문제 없음';lvc='#2d7d46';
  msg='정중선이 얼굴 중앙과 거의 맞고 동반 증상도 없다면, 지금 특별히 조치가 필요한 상태는 아닙니다.';
  adv='정기 검진 때 교합을 함께 확인받는 정도로 충분합니다.';
 } else if(dev==='2'||ex.face){
  lv='정밀 진단 권장';lvc='#c0392b';
  msg='3mm 이상 벌어지거나 얼굴 비대칭이 함께 보이면, 치아 배열만의 문제가 아니라 턱뼈(골격) 차이가 관여했을 가능성이 있습니다.';
  adv='파노라마·세팔로 X-ray 등 교정 정밀 검사로 원인이 치아인지 골격인지 구분하는 것이 먼저입니다. 원인에 따라 치료 방향이 크게 달라집니다.';
 } else if(ex.miss){
  lv='원인 해결 우선';lvc='#b8860b';
  msg='빠진 치아를 오래 방치하면 옆 치아가 그 자리로 쓰러지면서 정중선이 따라 틀어질 수 있습니다.';
  adv='정중선 자체보다 빈 자리를 채우는 것이 먼저입니다. 시간이 지날수록 공간이 좁아져 치료가 복잡해집니다.';
 } else {
  lv='경과 관찰 · 상담 권장';lvc='#b8860b';
  msg='1~2mm 정도의 어긋남은 실제로 매우 흔하며, 기능에 문제가 없다면 그 자체로 치료 대상이 아닌 경우도 많습니다.';
  adv='다만 씹는 습관이 한쪽으로 치우쳐 있거나 턱 증상이 있다면, 원인을 한 번 확인해 보는 것이 좋습니다.';
 }
 panel.innerHTML='<div style="display:inline-block;background:'+lvc+';color:#fff;border-radius:50px;padding:5px 14px;font-size:0.82rem;font-weight:700;margin-bottom:10px;">'+lv+'</div>'+
 '<p style="margin:0 0 10px;">'+msg+'</p>'+
 '<div style="padding:10px 12px;background:#faf7f3;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;">👉 '+adv+'</div>'+
 '<p style="font-size:0.78rem;color:#8a7a66;margin:10px 0 0;">※ 거울 관찰은 참고용입니다. 실제 편위량은 모형·사진·X-ray 분석으로 측정합니다.</p>';
}
box.querySelectorAll('.ml-b').forEach(function(b){b.onclick=function(){
 box.querySelectorAll('.ml-b').forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});
 b.style.background='#6B4226';b.style.color='#fff';dev=b.dataset.v;render();};});
box.querySelectorAll('.ml-x').forEach(function(b){b.onclick=function(){
 ex[b.dataset.v]=!ex[b.dataset.v];
 b.style.background=ex[b.dataset.v]?'#c9a96e':'#fff';b.style.color=ex[b.dataset.v]?'#fff':'#6B4226';render();};});
var f=box.querySelector('.ml-b');f.style.background='#6B4226';f.style.color='#fff';
render();
})();</script>`

export const ENC_SUPER_V534: Record<string, SuperContent> = {}

/* ============================================================
 * 1. 정출 — 노출 157 / 클릭 0 (제로클릭 1위)
 *    검색의도 3갈래(외상·교정·과맹출)를 판별기로 즉시 분기
 * ============================================================ */
ENC_SUPER_V534['정출'] = {
  detail: `
<h3>정출이란? — 치아가 원래 자리보다 밖으로 나온 상태</h3>
<p><strong>정출(挺出, Extrusion)</strong>은 치아가 잇몸(치조골) 밖으로 평소보다 더 솟아 나온 상태를 말합니다. 반대말은 치아가 안으로 들어가는 <strong>압하(Intrusion)</strong>죠. 그런데 검색해서 오신 분들의 상황은 대개 셋 중 하나입니다 — <strong>사고로 튀어나왔거나</strong>, <strong>치과에서 일부러 끌어올린다고 했거나</strong>, <strong>반대편 이가 없어서 저절로 자랐거나</strong>. 셋은 응급도와 치료가 완전히 다릅니다.</p>
${WIDGET_EXTRUSION_TYPE}

<h3>세 가지 정출 한눈에 비교</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">유형</th><th style="${TH}">원인</th><th style="${TH}">응급도</th><th style="${TH}">주요 치료</th></tr></thead>
<tbody>
<tr><td style="${TD}"><b>외상성 정출</b><br><span style="font-size:0.8rem;color:#8a7a66;">정출성 탈구</span></td><td style="${TD}">넘어짐·부딪힘 등 충격</td><td style="${TDC}">🚨 당일</td><td style="${TD}">위치 복원 후 고정(스플린트) 2~4주, 필요 시 ${A('신경치료')}</td></tr>
<tr><td style="${TD}"><b>교정적 정출</b><br><span style="font-size:0.8rem;color:#8a7a66;">의도적 정출</span></td><td style="${TD}">깊게 부러진 치아를 살리기 위한 계획된 치료</td><td style="${TDC}">✅ 계획</td><td style="${TD}">교정력으로 서서히 견인 → 안정 → 크라운</td></tr>
<tr><td style="${TD}"><b>병적 정출</b><br><span style="font-size:0.8rem;color:#8a7a66;">과맹출</span></td><td style="${TD}">맞물리는 ${A('대합치')} 상실 후 장기 방치</td><td style="${TDC}">⚠️ 서서히</td><td style="${TD}">교합 조정·교정적 압하, 심하면 ${A('발치')}</td></tr>
</tbody></table>

<div style="${WARN}"><strong>⏰ 외상이라면 시간이 곧 예후입니다.</strong> 사고로 치아가 밀려 나왔다면 억지로 밀어 넣지 마시고, 되도록 <strong>수 시간 이내</strong>에 치과에 방문하세요. 조기에 제 위치로 되돌려 고정할수록 치아를 살릴 가능성이 높아집니다.</div>

<h3>병적 정출이 특히 무서운 이유 — 통증이 없습니다</h3>
<p>어금니 하나를 빼고 &ldquo;당장 불편하지 않으니&rdquo; 미루는 사이, 맞물리던 반대편 치아는 상대를 잃고 조금씩 내려오거나 올라옵니다. 몇 년 뒤 임플란트를 하려고 하면 <strong>이미 정출된 치아가 공간을 침범해</strong> 그 치아를 갈아내거나, 교정으로 밀어 넣거나, 최악의 경우 멀쩡한 치아를 빼야 하는 상황이 생깁니다. ${A('임플란트')} 상담에서 &ldquo;조금만 일찍 오셨으면&rdquo;이라는 말이 나오는 대표적인 케이스죠.</p>

<h3>정출을 예방하는 가장 확실한 방법</h3>
<ul>
<li><strong>빠진 치아는 가능한 한 빨리 채우기</strong> — ${A('임플란트')}·브릿지·${A('틀니')} 중 상황에 맞는 방법을 상담하세요.</li>
<li><strong>사고 직후 지체 없이 치과 방문</strong> — 흔들리거나 길어 보이면 바로 검진받으세요.</li>
<li><strong>정기 검진에서 교합 확인</strong> — 정출은 스스로 알아채기 어렵고, 치과에서 교합지로 쉽게 확인됩니다.</li>
</ul>`,
  faqs: [
    { q: '정출이 무슨 뜻인가요?', a: '정출(Extrusion)은 치아가 원래 자리보다 잇몸 밖으로 솟아 나온 상태를 말합니다. 반대로 치아가 안쪽으로 들어가는 것은 압하(Intrusion)라고 합니다. 정출은 사고로 인한 외상성, 치료 목적의 교정적, 맞물리는 치아 상실로 인한 병적 정출로 나뉩니다.' },
    { q: '사고로 이가 튀어나왔는데 어떻게 해야 하나요?', a: '가능한 한 빨리(수 시간 이내) 치과에 방문하세요. 치아를 손으로 밀어 넣거나 흔들어 보지 말고 부드러운 음식만 드세요. 치과에서는 마취 후 원래 위치로 되돌려 2~4주 고정하며, 이후 신경 생존 여부를 정기적으로 확인합니다. 조기 처치일수록 치아를 살릴 가능성이 높습니다.' },
    { q: '치과에서 치아를 일부러 정출시킨다는데 왜 그런가요?', a: '치아가 잇몸 아래로 깊게 부러졌거나 뿌리만 남았을 때, 교정력으로 치아를 서서히 위로 끌어올려 크라운을 씌울 수 있는 높이를 확보하는 치료입니다. 발치 대신 자연치를 살리려는 시도이며, 보통 몇 주에서 몇 개월이 걸립니다.' },
    { q: '이를 빼고 오래 두면 반대편 치아가 정말 자라나요?', a: '네. 맞물리던 치아가 없어지면 남은 치아를 막아주는 상대가 사라져 조금씩 밀려 나옵니다(과맹출). 통증이 없어 방치하기 쉽지만, 나중에 임플란트나 보철을 할 공간이 부족해져 치료가 복잡해지고 비용도 커집니다.' },
    { q: '정출된 치아는 다시 원래대로 돌아갈 수 있나요?', a: '정도와 원인에 따라 다릅니다. 가벼우면 교합 조정으로 다듬고, 심하면 교정 장치로 밀어 넣는(압하) 치료를 하며, 뼈 지지가 크게 부족하면 발치를 검토하기도 합니다. 근본 해결은 원인이 된 빈 공간을 채우는 것입니다.' },
    { q: '정출 치료 비용은 얼마나 드나요?', a: '유형에 따라 차이가 큽니다. 외상 후 고정은 비교적 간단하지만 이후 신경치료·크라운(55만원)이 필요할 수 있고, 교정적 정출은 장치와 기간에 따라, 병적 정출은 교합 조정부터 교정·보철까지 범위가 다양합니다. 정확한 비용은 진단 후 안내되며 041-415-2892로 상담 가능합니다.' },
  ],
}

/* ============================================================
 * 2. 소구치 — 노출 143 / 클릭 0
 * ============================================================ */
ENC_SUPER_V534['소구치'] = {
  detail: `
<h3>소구치란? — 송곳니와 큰어금니 사이의 &lsquo;작은어금니&rsquo;</h3>
<p><strong>소구치(小臼齒, Premolar)</strong>는 송곳니(${A('견치')}) 바로 뒤, 큰어금니(${A('대구치')}) 앞에 있는 <strong>작은어금니</strong>입니다. 위아래 좌우로 2개씩, 총 <strong>8개</strong>가 있습니다. 앞니처럼 자르고 어금니처럼 으깨는 <strong>중간 역할</strong>을 맡고 있죠. 아래 탐색기에서 다른 치아들과 위치·번호를 비교해 보세요.</p>
${WIDGET_TOOTH_EXPLORER('sg', 'p1')}

<h3>소구치 기본 정보 한눈에</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">구분</th><th style="${TH}">제1소구치</th><th style="${TH}">제2소구치</th></tr></thead>
<tbody>
<tr><td style="${TD}"><b>${A('치식')} 번호</b></td><td style="${TDC}">14 · 24 · 34 · 44</td><td style="${TDC}">15 · 25 · 35 · 45</td></tr>
<tr><td style="${TD}"><b>개수</b></td><td style="${TDC}">4개</td><td style="${TDC}">4개</td></tr>
<tr><td style="${TD}"><b>나는 시기</b></td><td style="${TDC}">만 10~11세</td><td style="${TDC}">만 10~12세</td></tr>
<tr><td style="${TD}"><b>특징</b></td><td style="${TD}">교정 시 발치를 가장 많이 검토</td><td style="${TD}">선천적 결손이 비교적 흔함</td></tr>
</tbody></table>

<div style="${BOX}"><strong>💡 유치에는 소구치가 없습니다.</strong> 아이들의 유치 20개에는 소구치가 아예 없고, <strong>유구치(젖어금니)</strong>가 빠진 자리에 영구치인 소구치가 올라옵니다. 그래서 만 10~12세 무렵 &ldquo;어금니가 빠졌다&rdquo;고 놀라시는 부모님이 많은데, 대부분 정상적인 ${A('영구치 맹출 순서', '교체 과정')}입니다.</div>

<h3>교정할 때 왜 하필 소구치를 뽑을까?</h3>
<p>치아가 삐뚤빼뚤한 이유는 대개 <strong>턱 크기에 비해 치아가 클 때</strong>, 즉 공간이 부족해서입니다. 이때 공간을 만들려면 치아 하나를 빼야 하는데, <strong>제1소구치</strong>가 선택되는 경우가 많습니다. 이유는 명확합니다.</p>
<ul>
<li><strong>위치가 중간</strong> — 앞니 쪽과 어금니 쪽 어디로든 공간을 배분하기 좋습니다.</li>
<li><strong>심미 영향이 적음</strong> — 웃을 때 앞니만큼 드러나지 않습니다.</li>
<li><strong>기능 보완이 쉬움</strong> — 앞뒤 치아가 씹는 역할을 나눠 맡을 수 있습니다.</li>
</ul>
<p>물론 <strong>모든 교정이 발치를 하는 것은 아닙니다.</strong> 공간 부족이 심하지 않으면 비발치로 진행하며, ${A('인비절라인')} 같은 투명교정에서도 케이스에 따라 발치 여부가 갈립니다. 정확한 판단은 X-ray·모형 분석 후에 가능합니다.</p>

<h3>소구치, 이럴 때 주의하세요</h3>
<p>소구치는 씹는 면에 <strong>홈(교두 사이 골짜기)</strong>이 있어 음식물이 끼기 쉽고, 앞니보다 칫솔이 덜 닿아 ${A('충치')}가 잘 생깁니다. 충치가 작으면 ${A('레진')}(5~25만원), 중간 크기면 ${A('인레이')}(세라믹 35만원), 크면 ${A('크라운')}(55만원)으로 범위가 커집니다. 정기 검진으로 작을 때 잡는 것이 가장 경제적입니다.</p>`,
  faqs: [
    { q: '소구치는 몇 개이고 어디에 있나요?', a: '소구치(작은어금니)는 송곳니 뒤, 큰어금니 앞에 위치하며 위아래 좌우 2개씩 총 8개입니다. FDI 치식으로 제1소구치는 14·24·34·44번, 제2소구치는 15·25·35·45번입니다.' },
    { q: '소구치와 대구치는 어떻게 다른가요?', a: '소구치는 작은어금니로 송곳니와 큰어금니 사이에서 찢기와 으깨기를 함께 담당하며 총 8개입니다. 대구치는 큰어금니로 가장 안쪽에 있고 씹는 힘의 핵심 역할을 하며 사랑니를 제외하고 8개입니다. 대구치가 더 크고 씹는 면이 넓습니다.' },
    { q: '교정할 때 소구치를 꼭 빼야 하나요?', a: '아닙니다. 턱 크기에 비해 치아가 커서 공간이 많이 부족한 경우 제1소구치 발치를 검토하지만, 공간 부족이 심하지 않으면 비발치 교정도 가능합니다. X-ray·모형 분석 후 개인별로 판단하며, 무조건 발치하는 것은 아닙니다.' },
    { q: '아이 어금니가 빠졌는데 괜찮은가요?', a: '만 10~12세 무렵이라면 대부분 정상적인 교체 과정입니다. 유치에는 소구치가 없고 유구치(젖어금니)가 빠진 자리에 영구치인 소구치가 올라옵니다. 다만 또래보다 지나치게 이르거나 늦으면 X-ray로 영구치 상태를 확인하는 것이 좋습니다.' },
    { q: '소구치는 영어로 뭐라고 하나요?', a: 'Premolar(프리몰라) 또는 Bicuspid(바이커스피드)라고 합니다. 큰어금니인 대구치는 Molar라고 하며, premolar는 molar(어금니) 앞에 있다는 뜻입니다.' },
    { q: '소구치에 충치가 생기면 어떻게 치료하나요?', a: '충치 크기에 따라 다릅니다. 작으면 레진(부위별 5~25만원)으로 당일 충전, 중간 크기면 인레이(세라믹 35만원), 범위가 크거나 신경까지 갔다면 신경치료 후 크라운(55만원)이 필요합니다. 작을 때 발견할수록 치아를 덜 깎고 비용도 적습니다.' },
  ],
}

/* ============================================================
 * 3. 치식 — 노출 90 / 클릭 0
 * ============================================================ */
ENC_SUPER_V534['치식'] = {
  detail: `
<h3>치식이란? — 치과에서 부르는 &lsquo;치아 주소&rsquo;</h3>
<p>진료실에서 &ldquo;<strong>46번</strong> 우식&rdquo; 같은 말을 듣고 무슨 뜻인지 궁금하셨다면, 그것이 바로 <strong>치식(齒式, Dental Notation)</strong>입니다. 치아마다 붙은 고유 번호이자, 어느 치아인지 헷갈리지 않게 정한 <strong>세계 공통 주소 체계</strong>죠. 우리나라 치과에서 가장 널리 쓰는 방식은 <strong>FDI 표기법</strong>(두 자리 숫자)입니다.</p>
${WIDGET_TOOTH_EXPLORER('cs', 'm1')}

<h3>FDI 치식 읽는 법 — 딱 두 자리면 끝</h3>
<p>FDI 치식은 <strong>[앞자리 = 사분면] + [뒷자리 = 치아 순서]</strong> 구조입니다.</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">앞자리(사분면)</th><th style="${TH}">위치</th><th style="${TH}">번호 범위</th></tr></thead>
<tbody>
<tr><td style="${TDC}"><b>1</b></td><td style="${TD}">위 오른쪽 (환자 기준)</td><td style="${TDC}">11 ~ 18</td></tr>
<tr><td style="${TDC}"><b>2</b></td><td style="${TD}">위 왼쪽</td><td style="${TDC}">21 ~ 28</td></tr>
<tr><td style="${TDC}"><b>3</b></td><td style="${TD}">아래 왼쪽</td><td style="${TDC}">31 ~ 38</td></tr>
<tr><td style="${TDC}"><b>4</b></td><td style="${TD}">아래 오른쪽</td><td style="${TDC}">41 ~ 48</td></tr>
</tbody></table>
<p>뒷자리는 <strong>가운데 앞니부터 안쪽으로 1→8</strong> 순서입니다. 즉 <strong>1·2번 = 앞니, 3번 = ${A('견치', '송곳니')}, 4·5번 = ${A('소구치', '작은어금니')}, 6·7번 = ${A('대구치', '큰어금니')}, 8번 = 사랑니</strong>. 그래서 <strong>46번</strong>은 &ldquo;아래 오른쪽(4) + 여섯 번째(6) = 아래 오른쪽 첫 번째 큰어금니&rdquo;가 됩니다.</p>

<div style="${BOX}"><strong>🔢 사랑니는 언제나 8번.</strong> 위 오른쪽 사랑니는 18, 위 왼쪽은 28, 아래 왼쪽은 38, 아래 오른쪽은 48입니다. 진료실에서 &ldquo;38번 발치&rdquo;라고 하면 아래 왼쪽 사랑니를 뺀다는 뜻이죠.</div>

<h3>유치(젖니)에도 번호가 있습니다 — 51~85번</h3>
<p>어린이 유치는 사분면 번호가 <strong>5·6·7·8</strong>로 바뀌고, 치아는 각 5개씩입니다(51~55, 61~65, 71~75, 81~85). 소아치과에서 &ldquo;<strong>74번</strong> 유구치&rdquo;처럼 부르는 것이 이 방식입니다.</p>

<h3>치식 표기법은 하나가 아닙니다</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">표기법</th><th style="${TH}">방식</th><th style="${TH}">아래 오른쪽 첫 큰어금니</th></tr></thead>
<tbody>
<tr><td style="${TD}"><b>FDI</b> (국내 표준)</td><td style="${TD}">사분면+순서 두 자리</td><td style="${TDC}"><b>46</b></td></tr>
<tr><td style="${TD}"><b>Universal</b> (미국)</td><td style="${TD}">1~32번 일련번호</td><td style="${TDC}">30</td></tr>
<tr><td style="${TD}"><b>Palmer</b> (영국·교정)</td><td style="${TD}">기호 + 1~8</td><td style="${TDC}">⌐6</td></tr>
</tbody></table>
<p>세 방식을 서로 변환해 보고 싶다면 ${A('치아 번호', '치아 번호 조회기')}에서 클릭형 치아 차트로 확인하실 수 있습니다.</p>

<h3>치식을 알면 좋은 점</h3>
<p>치료 계획서나 견적서에 &ldquo;#16 크라운, #46 ${A('인레이')}&rdquo;처럼 적힌 항목이 <strong>정확히 어느 치아인지</strong> 스스로 확인할 수 있습니다. 어느 치아에 무슨 치료가 들어가는지 알고 동의하는 것 — 그것이 과잉진료를 걸러내는 가장 쉬운 방법입니다. 궁금한 번호가 있으면 진료실에서 편하게 물어보세요.</p>`,
  faqs: [
    { q: '치식이 무슨 뜻인가요?', a: '치식(Dental Notation)은 각 치아에 붙인 고유 번호 체계로, 치과에서 어느 치아인지 정확히 지칭하기 위해 사용합니다. 국내에서는 두 자리 숫자로 표기하는 FDI 방식이 가장 널리 쓰입니다.' },
    { q: '치식 46번은 어느 치아인가요?', a: '아래 오른쪽 첫 번째 큰어금니(제1대구치)입니다. 앞자리 4는 아래 오른쪽 사분면, 뒷자리 6은 가운데 앞니부터 여섯 번째 치아라는 뜻입니다. 만 6세 무렵 나는 6세 구치로, 씹는 힘의 핵심 치아입니다.' },
    { q: 'FDI 치식 읽는 법을 알려주세요.', a: '앞자리는 사분면(1=위 오른쪽, 2=위 왼쪽, 3=아래 왼쪽, 4=아래 오른쪽), 뒷자리는 가운데 앞니부터 안쪽으로 1~8번입니다. 1·2번 앞니, 3번 송곳니, 4·5번 작은어금니, 6·7번 큰어금니, 8번 사랑니입니다.' },
    { q: '사랑니는 치식으로 몇 번인가요?', a: '사랑니(제3대구치)는 항상 8번입니다. 위 오른쪽 18번, 위 왼쪽 28번, 아래 왼쪽 38번, 아래 오른쪽 48번입니다.' },
    { q: '유치도 치식 번호가 있나요?', a: '네. 유치는 사분면 번호가 5~8로 바뀌고 각 5개씩입니다. 위 오른쪽 51~55, 위 왼쪽 61~65, 아래 왼쪽 71~75, 아래 오른쪽 81~85번으로 표기합니다.' },
    { q: '치식 표기법이 여러 개인가요?', a: '네. 국내 표준인 FDI(두 자리), 미국에서 쓰는 Universal(1~32 일련번호), 영국·교정에서 쓰는 Palmer(기호+숫자) 방식이 있습니다. 같은 치아라도 표기가 달라지므로, 서울비디치과 치아 번호 조회기에서 세 방식을 서로 변환해 확인할 수 있습니다.' },
  ],
}

/* ============================================================
 * 4. 대구치 — 노출 84 / 클릭 0
 * ============================================================ */
ENC_SUPER_V534['대구치'] = {
  detail: `
<h3>대구치란? — 씹는 힘을 책임지는 &lsquo;큰어금니&rsquo;</h3>
<p><strong>대구치(大臼齒, Molar)</strong>는 입 안 가장 안쪽에 있는 <strong>큰어금니</strong>입니다. 사랑니를 제외하면 위아래 좌우 2개씩 총 <strong>8개</strong>이고, 사랑니(제3대구치)까지 모두 나면 12개가 됩니다. 씹는 면이 넓고 뿌리가 2~3개로 튼튼해 <strong>실제 저작력의 대부분</strong>을 담당합니다.</p>
${WIDGET_TOOTH_EXPLORER('dg', 'm1')}

<h3>대구치 3형제 비교</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">구분</th><th style="${TH}">제1대구치</th><th style="${TH}">제2대구치</th><th style="${TH}">제3대구치</th></tr></thead>
<tbody>
<tr><td style="${TD}"><b>별칭</b></td><td style="${TDC}">6세 구치</td><td style="${TDC}">12세 구치</td><td style="${TDC}">사랑니·지치</td></tr>
<tr><td style="${TD}"><b>${A('치식')}</b></td><td style="${TDC}">16·26·36·46</td><td style="${TDC}">17·27·37·47</td><td style="${TDC}">18·28·38·48</td></tr>
<tr><td style="${TD}"><b>나는 시기</b></td><td style="${TDC}">만 6세 전후</td><td style="${TDC}">만 11~13세</td><td style="${TDC}">만 17~25세</td></tr>
<tr><td style="${TD}"><b>개수</b></td><td style="${TDC}">4개</td><td style="${TDC}">4개</td><td style="${TDC}">0~4개</td></tr>
<tr><td style="${TD}"><b>중요도</b></td><td style="${TD}">교합의 기준점, 최우선 보존</td><td style="${TD}">저작력 분담</td><td style="${TD}">기능 기여 적음, 문제 시 ${A('발치')}</td></tr>
</tbody></table>

<div style="${WARN}"><strong>⚠️ 제1대구치(6세 구치)가 가장 중요합니다.</strong> 만 6세 무렵 <strong>유치가 빠지지 않고</strong> 유치 맨 뒤에 조용히 올라오기 때문에, 많은 부모님이 &ldquo;아직 유치겠지&rdquo; 하고 관리를 놓칩니다. 하지만 이 치아는 <strong>평생 쓰는 첫 영구 어금니</strong>이자 위아래 치열이 맞물리는 기준점입니다. 씹는 면 홈이 깊어 충치가 가장 잘 생기므로 <strong>나오자마자 ${A('실란트', '실란트(홈 메우기)')}</strong>를 권합니다.</div>

<h3>대구치를 잃으면 생기는 연쇄 반응</h3>
<p>어금니 하나가 빠지면 단순히 &ldquo;하나 없는 것&rdquo;으로 끝나지 않습니다.</p>
<ul>
<li><strong>옆 치아가 쓰러집니다</strong> — 빈 공간 쪽으로 기울면서 치열이 무너집니다.</li>
<li><strong>맞물리던 치아가 자랍니다</strong> — 상대를 잃은 치아가 ${A('정출')}(과맹출)되어 나중에 보철 공간을 침범합니다.</li>
<li><strong>반대쪽으로만 씹게 됩니다</strong> — 저작 편측화로 ${A('턱관절 장애')}나 잇몸 문제가 생기기도 합니다.</li>
</ul>
<p>그래서 어금니 상실은 <strong>&ldquo;안 불편하니 나중에&rdquo;가 가장 비싼 선택</strong>이 되는 부위입니다. 서울비디치과 임플란트는 픽스처에 따라 <strong>80만원(CA) · 100만원(오스템 SOI) · 160만원(스트라우만 BLX)</strong>이며, 만 65세 이상은 평생 2개까지 건강보험이 적용됩니다.</p>

<h3>대구치 관리 3원칙</h3>
<ul>
<li><strong>칫솔을 안쪽 끝까지</strong> — 가장 안쪽 치아의 <strong>뒷면</strong>은 놓치기 쉬운 대표 부위입니다.</li>
<li><strong>홈은 실란트로 미리 막기</strong> — 특히 6세 구치·12세 구치.</li>
<li><strong>딱딱한 것 조심</strong> — 씹는 힘이 집중돼 ${A('치아 균열', '크랙')}이 잘 생깁니다. 얼음·뼈·마른오징어는 피하세요.</li>
</ul>`,
  faqs: [
    { q: '대구치는 몇 개인가요?', a: '사랑니를 제외하면 위아래 좌우 2개씩 총 8개(제1·제2대구치)입니다. 사랑니(제3대구치) 4개까지 모두 나면 최대 12개가 되지만, 사랑니는 없거나 매복된 경우도 많습니다.' },
    { q: '6세 구치가 대구치인가요?', a: '네. 6세 구치는 제1대구치로, 만 6세 무렵 유치 맨 뒤에 새로 나는 첫 번째 영구 어금니입니다. 유치가 빠지지 않고 조용히 올라와 유치로 오해하기 쉽지만 평생 쓰는 치아이며, 씹는 힘과 교합의 기준이 되는 가장 중요한 어금니입니다.' },
    { q: '대구치와 소구치의 차이는 무엇인가요?', a: '대구치(큰어금니)는 가장 안쪽에 있고 씹는 면이 넓으며 뿌리가 2~3개로 저작력의 핵심을 담당합니다. 소구치(작은어금니)는 송곳니와 대구치 사이에 있고 크기가 작으며 찢기와 으깨기를 함께 담당합니다. FDI 치식으로 소구치는 4·5번, 대구치는 6·7·8번입니다.' },
    { q: '어금니를 빼고 그냥 두면 안 되나요?', a: '권장하지 않습니다. 옆 치아가 빈 공간으로 쓰러지고, 맞물리던 치아가 정출되어 자라 나오며, 반대쪽으로만 씹게 되어 턱관절이나 잇몸에 부담이 갑니다. 시간이 지날수록 임플란트 공간이 부족해져 치료가 복잡해지고 비용도 커집니다.' },
    { q: '대구치 임플란트 비용은 얼마인가요?', a: '서울비디치과 기준 픽스처 종류에 따라 CA 80만원, 오스템 SOI 100만원, 스트라우만 BLX 160만원입니다. 만 65세 이상은 평생 2개까지 건강보험이 적용됩니다. 뼈 상태에 따라 뼈이식 등 부가 처치가 필요할 수 있어 정확한 비용은 검사 후 안내됩니다.' },
    { q: '대구치는 영어로 무엇인가요?', a: 'Molar(몰라)라고 합니다. 제1대구치는 first molar, 제2대구치는 second molar, 사랑니인 제3대구치는 third molar 또는 wisdom tooth라고 부릅니다.' },
  ],
}

/* ============================================================
 * 5. 견치 — 노출 66 / 클릭 0
 * ============================================================ */
ENC_SUPER_V534['견치'] = {
  detail: `
<h3>견치란? — 가장 오래 버티는 치아, 송곳니</h3>
<p><strong>견치(犬齒, Canine)</strong>는 앞니 옆에 뾰족하게 솟은 <strong>송곳니</strong>입니다. 위아래 좌우 1개씩 총 <strong>4개</strong>이며, ${A('치식')} 번호로는 <strong>13·23·33·43번</strong>입니다. 이름 그대로 개의 송곳니처럼 끝이 뾰족해 음식을 찢는 데 유리하죠.</p>
${WIDGET_TOOTH_EXPLORER('gc', 'cn')}

<h3>견치의 진짜 역할 — &lsquo;견치유도&rsquo;</h3>
<p>견치는 단순히 찢는 치아가 아닙니다. 턱을 <strong>옆으로 움직일 때</strong>, 견치가 먼저 닿아 다른 치아들이 서로 부딪히지 않게 <strong>들어 올려주는 역할</strong>을 합니다. 이를 <strong>견치유도(canine guidance)</strong>라고 부릅니다.</p>
<div style="${BOX}"><strong>🛡️ 견치는 치열의 보디가드입니다.</strong> 견치가 제 역할을 하면 어금니에 가해지는 옆 방향 힘이 줄어들어 ${A('치아 균열', '크랙')}이나 마모를 막아줍니다. 그래서 교정에서도 견치 위치를 특히 중요하게 다룹니다.</div>

<h3>왜 &lsquo;가장 마지막까지 남는 치아&rsquo;일까?</h3>
<p>견치는 <strong>치근(뿌리)이 가장 길고 굵어</strong> 뼈 속에 깊이 박혀 있습니다. 그래서 잇몸병이 진행돼도 비교적 오래 버티며, 나이가 들어 다른 치아를 잃어도 마지막까지 남아 있는 경우가 많습니다. ${A('틀니')}를 만들 때 견치가 남아 있으면 <strong>지지대 역할</strong>을 해 훨씬 안정적입니다.</p>

<h3>견치에서 흔한 문제 — 매복과 덧니</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">상황</th><th style="${TH}">설명</th><th style="${TH}">대처</th></tr></thead>
<tbody>
<tr><td style="${TD}"><b>매복 견치</b></td><td style="${TD}">위 송곳니가 잇몸·뼈 속에 묻혀 안 나오는 경우 (사랑니 다음으로 흔함)</td><td style="${TD}">X-ray 확인 후 교정적 견인으로 끌어내리는 치료</td></tr>
<tr><td style="${TD}"><b>덧니(팔자 송곳니)</b></td><td style="${TD}">공간이 부족해 견치가 바깥쪽 높은 위치로 밀려난 상태</td><td style="${TD}">${A('인비절라인', '교정')}으로 배열, 공간 부족 시 ${A('소구치')} 발치 검토</td></tr>
<tr><td style="${TD}"><b>견치 마모</b></td><td style="${TD}">이갈이·이 악물기로 뾰족한 끝이 닳아 평평해짐</td><td style="${TD}">마우스가드, 필요 시 ${A('레진')}·보철로 형태 회복</td></tr>
</tbody></table>

<h3>&ldquo;덧니가 매력적이다&rdquo; 그냥 둬도 될까요?</h3>
<p>심미적 선호는 개인의 몫입니다. 다만 기능적으로 보면, 덧니는 <strong>칫솔이 닿기 어려워 ${A('충치')}·잇몸병 위험이 높고</strong>, 견치유도가 제대로 되지 않아 다른 치아에 부담이 갈 수 있습니다. 당장 불편이 없다면 급하지 않지만, <strong>잇몸이 자주 붓거나 그 부위만 충치가 반복된다면</strong> 한 번 상담받아 보시길 권합니다.</p>`,
  faqs: [
    { q: '견치가 송곳니인가요?', a: '네. 견치(犬齒)는 송곳니의 정식 명칭으로, 영어로는 Canine이라고 합니다. 앞니 옆에 뾰족하게 솟은 치아이며 위아래 좌우 1개씩 총 4개, FDI 치식으로 13·23·33·43번입니다.' },
    { q: '견치는 왜 중요한가요?', a: '턱을 옆으로 움직일 때 견치가 먼저 닿아 다른 치아들이 부딪히지 않게 보호하는 견치유도 역할을 합니다. 또한 뿌리가 가장 길고 튼튼해 잇몸병이 진행돼도 오래 버티며, 틀니를 할 때 지지대 역할도 합니다.' },
    { q: '송곳니가 안 나오는데(매복) 어떻게 하나요?', a: '위 송곳니 매복은 사랑니 다음으로 흔합니다. X-ray로 위치를 확인한 뒤, 잇몸을 열어 장치를 붙이고 교정력으로 서서히 끌어내리는 교정적 견인 치료를 합니다. 성장기에 조기 발견할수록 치료가 수월하므로 또래보다 늦으면 검진을 권합니다.' },
    { q: '덧니(팔자 송곳니)는 꼭 교정해야 하나요?', a: '반드시 그런 것은 아닙니다. 다만 덧니는 칫솔이 닿기 어려워 충치·잇몸병 위험이 높고, 견치유도가 잘 되지 않아 다른 치아에 부담이 갈 수 있습니다. 그 부위에 충치가 반복되거나 잇몸이 자주 붓는다면 교정 상담을 권합니다.' },
    { q: '견치가 뾰족한 게 싫은데 갈아내도 되나요?', a: '가능하지만 신중해야 합니다. 견치 끝을 다듬는 것 자체는 간단하지만, 지나치게 갈면 견치유도가 사라져 어금니에 옆 방향 힘이 몰릴 수 있습니다. 소량 조정으로 충분한 경우가 많으니 상담 후 결정하시길 권합니다.' },
    { q: '송곳니는 언제 나나요?', a: '영구치 송곳니는 만 9~12세 무렵 납니다. 영구치 교체 과정에서 비교적 늦게 나오는 편이라, 이미 다른 치아가 자리를 채운 뒤 공간이 부족하면 바깥쪽으로 밀려 덧니가 되기도 합니다.' },
  ],
}

/* ============================================================
 * 6. 턱에서 소리 — 노출 55 / 클릭 0 / 순위 1.0위 (제목만 바꿔도 회수)
 * ============================================================ */
ENC_SUPER_V534['턱에서 소리'] = {
  detail: `
<h3>턱에서 딱 소리가 나요 — 병원 가야 할까요?</h3>
<p>입을 벌리거나 음식을 씹을 때 턱에서 <strong>&ldquo;딱&rdquo;, &ldquo;딸깍&rdquo;</strong> 소리가 나는 경험, 생각보다 아주 흔합니다. 결론부터 말씀드리면 — <strong>통증도 없고 입도 잘 벌어지는데 소리만 난다면, 당장 치료가 필요하지 않은 경우가 많습니다.</strong> 다만 소리의 <strong>종류</strong>와 <strong>동반 증상</strong>에 따라 이야기가 달라집니다.</p>
${WIDGET_TMJ_SOUND}

<h3>소리 종류로 구분하기</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">소리</th><th style="${TH}">추정 원인</th><th style="${TH}">일반적 판단</th></tr></thead>
<tbody>
<tr><td style="${TD}"><b>딱 · 딸깍</b><br><span style="font-size:0.8rem;color:#8a7a66;">클릭음</span></td><td style="${TD}">관절 사이 <strong>디스크(관절원판)</strong>가 제 위치를 벗어났다가 다시 끼워지며 나는 소리</td><td style="${TD}">통증·개구 제한이 없으면 경과 관찰 가능</td></tr>
<tr><td style="${TD}"><b>사각사각 · 서걱서걱</b><br><span style="font-size:0.8rem;color:#8a7a66;">염발음</span></td><td style="${TD}">관절 표면이 닳아 <strong>뼈끼리 마찰</strong>하며 나는 소리</td><td style="${TD}">퇴행성 변화 가능성 — 진료 권장</td></tr>
</tbody></table>

<div style="${WARN}"><strong>🚨 이런 경우엔 미루지 마세요.</strong><br>
① 입이 <strong>손가락 세 개(약 40mm)</strong>가 안 들어갈 만큼 안 벌어질 때<br>
② 갑자기 턱이 <strong>잠겨서</strong> 벌어지지 않거나 다물어지지 않을 때<br>
③ 턱·귀 앞·관자놀이 <strong>통증</strong>이 지속될 때<br>
④ 소리가 <strong>딸깍에서 사각사각으로 바뀌었을 때</strong></div>

<h3>왜 소리가 날까 — 흔한 배경</h3>
<ul>
<li><strong>이 악물기·이갈이</strong> — 수면 중 무의식적으로 관절에 과부하를 줍니다.</li>
<li><strong>한쪽으로만 씹기</strong> — ${A('대구치', '어금니')} 상실이나 통증 때문에 편측 저작이 굳어진 경우.</li>
<li><strong>턱을 크게 벌리는 습관</strong> — 하품, 큰 음식 베어 물기, 장시간 치과 치료.</li>
<li><strong>스트레스·자세</strong> — 긴장 시 저작근이 수축하고, 거북목 자세도 영향을 줍니다.</li>
<li><strong>외상</strong> — 턱 부위 충격 이후 시작된 경우.</li>
</ul>

<h3>오늘부터 할 수 있는 관리</h3>
<ul>
<li><strong>턱 쉬게 하기</strong> — 껌·오징어·바게트 등 질긴 음식 줄이기, 음식은 작게 잘라 먹기.</li>
<li><strong>하품 조심</strong> — 크게 벌어질 것 같으면 주먹으로 턱 아래를 가볍게 받쳐주세요.</li>
<li><strong>온찜질</strong> — 근육 긴장이 원인일 때 도움이 됩니다(급성 부종·염증 시엔 냉찜질).</li>
<li><strong>이 악물기 자각</strong> — 평상시 위아래 치아는 <strong>닿지 않는 것</strong>이 정상입니다. 붙어 있다면 의식적으로 떼세요.</li>
<li><strong>양쪽으로 씹기</strong> — 한쪽만 쓰게 만드는 원인(빠진 치아·통증)이 있다면 그것부터 해결해야 합니다.</li>
</ul>
<p>2주 이상 지속되거나 통증·개구 제한이 동반된다면 ${A('턱관절 장애')} 평가를 받아보시길 권합니다. 서울비디치과는 365일 진료하며 041-415-2892로 상담 가능합니다.</p>`,
  faqs: [
    { q: '턱에서 딱 소리가 나는데 병원에 가야 하나요?', a: '통증이 없고 입도 잘 벌어지면서 소리만 난다면 비교적 흔한 현상으로, 당장 치료가 필요하지 않은 경우가 많습니다. 다만 통증이 있거나 입이 잘 안 벌어지거나, 소리가 사각사각 갈리는 소리로 바뀌었다면 진료를 권합니다.' },
    { q: '딸깍 소리와 사각사각 소리는 어떻게 다른가요?', a: '딸깍(클릭음)은 관절 디스크가 제자리를 벗어났다 돌아오며 나는 소리로 비교적 흔합니다. 사각사각·서걱서걱(염발음)은 관절 표면이 닳아 뼈끼리 마찰하며 나는 소리로, 퇴행성 변화 가능성이 있어 더 주의 깊게 봐야 합니다.' },
    { q: '턱에서 소리가 나는 이유는 무엇인가요?', a: '이갈이·이 악물기로 인한 관절 과부하, 한쪽으로만 씹는 습관, 턱을 크게 벌리는 습관, 스트레스로 인한 저작근 긴장, 외상 등이 흔한 배경입니다. 어금니 상실로 편측 저작이 굳어진 경우도 자주 관찰됩니다.' },
    { q: '턱 소리를 없애려면 어떻게 해야 하나요?', a: '질긴 음식과 껌을 줄이고, 하품할 때 턱을 받쳐주며, 평상시 위아래 치아가 닿지 않도록 의식하는 것이 기본입니다. 온찜질과 양쪽으로 씹기도 도움이 됩니다. 소리만 나는 경우 소리 자체를 완전히 없애는 것보다 통증·기능 유지가 치료 목표입니다.' },
    { q: '입이 갑자기 안 벌어져요. 응급인가요?', a: '턱이 잠겨 입이 벌어지지 않거나 다물어지지 않는 급성 잠김은 빠른 처치가 도움이 됩니다. 무리하게 힘으로 벌리지 마시고 가급적 이른 시일 내 치과에 방문하세요. 손가락 세 개(약 40mm)가 들어가지 않는다면 개구 제한으로 봅니다.' },
    { q: '턱관절 소리를 방치하면 어떻게 되나요?', a: '소리만 있는 상태로 오래 유지되는 경우도 많지만, 일부는 통증·개구 제한으로 진행하거나 관절 표면 퇴행으로 이어질 수 있습니다. 특히 이갈이·편측 저작 같은 원인이 계속되면 악화 가능성이 높아지므로 습관 관리가 중요합니다.' },
  ],
}

/* ============================================================
 * 7. 정중선 — 노출 80 / 클릭 2
 * ============================================================ */
ENC_SUPER_V534['정중선'] = {
  detail: `
<h3>정중선이란? — 얼굴과 치아의 &lsquo;가운데 기준선&rsquo;</h3>
<p><strong>정중선(正中線, Midline)</strong>은 얼굴과 치열의 한가운데를 지나는 세로 기준선입니다. 치과에서는 보통 두 가지를 봅니다 — <strong>얼굴 정중선</strong>(미간·코끝·인중을 잇는 선)과 <strong>치아 정중선</strong>(위·아래 앞니 두 개 사이의 선). 이 둘이 잘 맞으면 웃을 때 안정적인 인상을 줍니다.</p>
${WIDGET_MIDLINE_CHECK}

<h3>&ldquo;내 정중선이 안 맞는데 비정상인가요?&rdquo;</h3>
<p>안심하셔도 됩니다. <strong>정중선이 완벽하게 일치하는 사람은 오히려 드뭅니다.</strong> 일반적으로 <strong>1~2mm 정도의 차이는 육안으로 잘 인지되지 않고</strong>, 기능적으로도 문제를 일으키지 않는 경우가 많습니다. 다만 <strong>3mm 이상</strong> 벌어지거나 얼굴 비대칭이 함께 보이면 원인을 확인해 볼 필요가 있습니다.</p>

<h3>정중선이 틀어지는 원인</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">원인</th><th style="${TH}">설명</th><th style="${TH}">해결 방향</th></tr></thead>
<tbody>
<tr><td style="${TD}"><b>치아 상실</b></td><td style="${TD}">빠진 자리로 옆 치아들이 쓰러지며 중심이 이동</td><td style="${TD}">빈 공간 회복이 우선 (${A('임플란트')}·브릿지)</td></tr>
<tr><td style="${TD}"><b>공간 부족</b></td><td style="${TD}">치아가 턱 크기보다 커서 한쪽으로 밀림</td><td style="${TD}">${A('인비절라인', '교정')}, 필요 시 ${A('소구치')} 발치</td></tr>
<tr><td style="${TD}"><b>편측 저작 습관</b></td><td style="${TD}">한쪽으로만 씹어 근육·교합이 비대칭</td><td style="${TD}">원인 치료 + 습관 교정</td></tr>
<tr><td style="${TD}"><b>골격 비대칭</b></td><td style="${TD}">턱뼈 자체의 좌우 성장 차이</td><td style="${TD}">교정 정밀검사, 심하면 턱교정 수술 검토</td></tr>
<tr><td style="${TD}"><b>선천적 결손</b></td><td style="${TD}">${A('측절치')} 등이 한쪽만 없어 좌우 개수 불일치</td><td style="${TD}">교정으로 공간 배분 후 보철</td></tr>
</tbody></table>

<div style="${BOX}"><strong>🔍 핵심은 &lsquo;치아 문제냐, 뼈 문제냐&rsquo;입니다.</strong> 치아 배열만의 문제라면 교정으로 비교적 수월하게 개선되지만, 턱뼈 자체가 비대칭이면 교정만으로는 한계가 있어 접근이 달라집니다. 그래서 파노라마·세팔로 X-ray 등 <strong>정밀 검사로 원인을 먼저 구분</strong>하는 것이 순서입니다.</div>

<h3>교정하면 정중선이 무조건 맞춰지나요?</h3>
<p>꼭 그렇지는 않습니다. 교정 계획에서 정중선은 중요한 목표 중 하나지만, <strong>골격 차이가 크거나 좌우 치아 개수가 다른 경우</strong>에는 완전히 일치시키기 어려울 수 있습니다. 이럴 때는 <strong>무리하게 맞추기보다 씹는 기능과 전체 조화를 우선</strong>하는 편이 결과적으로 더 낫습니다. 상담 때 &ldquo;내 케이스에서 정중선을 어디까지 맞출 수 있는지&rdquo;를 구체적으로 물어보시길 권합니다.</p>`,
  faqs: [
    { q: '정중선이 무엇인가요?', a: '정중선(Midline)은 얼굴과 치열의 한가운데를 지나는 기준선입니다. 얼굴 정중선(미간·코끝·인중을 잇는 선)과 치아 정중선(위·아래 앞니 사이 선)으로 나눠 보며, 두 선이 잘 맞을수록 안정적인 인상을 줍니다.' },
    { q: '정중선이 안 맞는데 비정상인가요?', a: '아닙니다. 정중선이 완벽히 일치하는 경우는 오히려 드물며, 1~2mm 차이는 육안으로 잘 인지되지 않고 기능적 문제도 없는 경우가 많습니다. 다만 3mm 이상 벌어지거나 얼굴 비대칭이 동반되면 원인 확인을 권합니다.' },
    { q: '정중선이 틀어지는 원인은 무엇인가요?', a: '치아 상실 후 옆 치아가 쓰러지는 경우, 공간 부족으로 치아가 한쪽으로 밀린 경우, 한쪽으로만 씹는 습관, 턱뼈 자체의 좌우 성장 차이, 측절치 등의 선천적 결손 등이 있습니다. 원인에 따라 치료 방향이 크게 달라집니다.' },
    { q: '교정하면 정중선이 맞춰지나요?', a: '치아 배열 문제라면 교정으로 개선되는 경우가 많습니다. 다만 턱뼈 비대칭이 크거나 좌우 치아 개수가 다르면 완전히 일치시키기 어려울 수 있고, 이때는 무리하게 맞추기보다 씹는 기능과 전체 조화를 우선하는 것이 낫습니다.' },
    { q: '정중선 때문에 얼굴이 비대칭으로 보일 수도 있나요?', a: '치아 정중선이 크게 틀어지면 웃을 때 비대칭 인상을 줄 수 있습니다. 다만 반대로 턱뼈 비대칭이 원인이 되어 치아 정중선까지 틀어진 경우도 많습니다. 어느 쪽이 원인인지는 X-ray를 포함한 정밀 검사로 구분해야 합니다.' },
    { q: '정중선을 맞추려면 검사를 어떻게 하나요?', a: '파노라마·세팔로 X-ray, 구내외 사진, 치아 모형(또는 구강스캔) 분석으로 편위량과 원인을 확인합니다. 치아성인지 골격성인지에 따라 교정 단독, 교정+보철, 턱교정 수술 병행 등으로 계획이 나뉩니다.' },
  ],
}

/* ============================================================
 * 8. 실비보험 — "치과실비"(69) + "치과 실비"(39) + "치과치료실비"(22) + "실비 치과"(10) = 140 노출 / 클릭 0
 * ============================================================ */
ENC_SUPER_V534['실비보험'] = {
  detail: `
<h3>치과 치료도 실비보험 되나요? — 먼저 알아야 할 한 가지</h3>
<p>가장 많이 받는 질문이자, 가장 오해가 많은 주제입니다. 결론부터 말씀드리면 — <strong>치과 치료라고 다 되는 것도, 다 안 되는 것도 아닙니다.</strong> 핵심은 <strong>&ldquo;치료를 받게 된 이유&rdquo;와 &ldquo;치료 항목&rdquo;</strong>이며, 무엇보다 <strong>가입한 상품과 약관</strong>에 따라 결과가 달라집니다.</p>
${WIDGET_INSURANCE_CHECK}

<h3>실비보험(실손의료보험)이란?</h3>
<p><strong>실손의료보험</strong>은 실제 부담한 의료비의 일정 부분을 보상해 주는 보험입니다. 다만 <strong>모든 의료비를 보장하지는 않으며</strong>, 약관에 <strong>보장 제외 항목</strong>이 명시돼 있습니다. 치과 영역에서는 이 제외 항목에 해당하는 치료가 적지 않습니다.</p>

<h3>일반적인 구분 — 왜 &lsquo;임플란트는 안 된다&rsquo;고 할까?</h3>
<table style="width:100%;border-collapse:collapse;margin:14px 0;">
<thead><tr><th style="${TH}">구분</th><th style="${TH}">예시</th><th style="${TH}">일반적 경향</th></tr></thead>
<tbody>
<tr><td style="${TD}"><b>보장 어려운 편</b></td><td style="${TD}">${A('임플란트')}·크라운 등 보철, 교정, ${A('치아 미백', '미백')}·${A('라미네이트')} 등 심미 치료</td><td style="${TD}">약관상 제외 항목이거나 미용 목적으로 분류</td></tr>
<tr><td style="${TD}"><b>조건부 가능성</b></td><td style="${TD}">질병으로 인한 수술·입원에 해당하는 처치</td><td style="${TD}">약관·가입 시기에 따라 급여 본인부담분 등 보장 여부가 갈림</td></tr>
<tr><td style="${TD}"><b>상대적으로 유리</b></td><td style="${TD}">넘어짐·부딪힘 등 <strong>사고(상해)</strong>로 인한 치료</td><td style="${TD}">상해 처리 가능성이 있는 편 (단, 제외 항목은 동일 적용)</td></tr>
</tbody></table>

<div style="${WARN}"><strong>⚠️ 가장 중요한 안내드립니다.</strong> 실손보험 보장 여부는 <strong>가입 시기(1~4세대)·상품·약관</strong>에 따라 크게 다르며, 최종 판단과 지급은 <strong>보험사</strong>가 합니다. 치과는 진료와 서류 발급을 담당할 뿐 보험금 지급 주체가 아닙니다. <strong>치료 전에 본인 보험사에 문의</strong>하시는 것이 가장 정확합니다.</div>

<h3>실비보다 먼저 확인할 것 — 건강보험</h3>
<p>실비보험을 알아보기 전에, <strong>건강보험이 적용되는 항목부터 챙기는 편이 확실합니다.</strong></p>
<ul>
<li><strong>${A('스케일링 건강보험', '스케일링')}</strong> — 만 19세 이상 연 1회, 본인부담 약 1~2만원</li>
<li><strong>${A('신경치료')}</strong> — 건강보험 적용 (크라운은 별도)</li>
<li><strong>만 65세 이상 ${A('임플란트')}</strong> — 평생 2개까지 부분 적용</li>
<li><strong>만 65세 이상 ${A('틀니')}</strong> — 부분·전체 틀니 부분 적용</li>
<li><strong>만 12세 이하 어금니 ${A('실란트')}</strong> — 충치 예방 목적 적용</li>
</ul>

<h3>청구할 때 챙기면 좋은 서류</h3>
<ul>
<li><strong>진료비 계산서·영수증</strong></li>
<li><strong>진료비 세부산정내역서</strong> — 항목별 금액이 나뉘어 있어 판단에 중요합니다</li>
<li><strong>진단서 또는 소견서</strong> — 진단명(질병코드)이 기재된 서류</li>
<li><strong>사고 관련 자료</strong> — 상해로 인한 경우</li>
</ul>
<p>서울비디치과는 비급여 항목을 <strong>${'<a href="/pricing" style="color:#6B4226;font-weight:600;text-decoration:underline;text-decoration-style:dotted;">공식 수가표</a>'}</strong>로 투명하게 공개하고 있으며, 필요한 서류 발급을 도와드립니다. 문의는 041-415-2892로 주세요.</p>`,
  faqs: [
    { q: '치과 치료도 실비보험이 되나요?', a: '치료를 받게 된 이유와 항목에 따라 다릅니다. 임플란트·보철·교정·미백 등은 약관상 보장이 어려운 경우가 많고, 사고(상해)로 인한 치료나 수술·입원에 해당하는 처치는 보장 가능성이 있습니다. 다만 가입 시기와 약관에 따라 결과가 크게 달라지므로 본인 보험사 확인이 필수입니다.' },
    { q: '임플란트는 왜 실비보험이 안 되나요?', a: '임플란트·크라운 등 보철 치료는 실손의료보험 약관에서 보장 대상에서 제외되는 경우가 일반적이기 때문입니다. 대신 만 65세 이상은 건강보험으로 평생 2개까지 부분 적용을 받을 수 있고, 별도의 치아보험 상품으로 대비하기도 합니다.' },
    { q: '넘어져서 이가 부러졌는데 실비 처리가 되나요?', a: '사고(상해)로 인한 치과 치료는 질병으로 인한 치료보다 보장 가능성이 있는 편입니다. 다만 치료 항목이 보철·임플란트라면 제외 조항이 그대로 적용될 수 있습니다. 사고 경위 자료와 진단서·세부내역서를 준비하고, 청구 전 보험사에 상해 처리 여부를 확인하세요.' },
    { q: '실비 청구할 때 어떤 서류가 필요한가요?', a: '진료비 계산서·영수증, 진료비 세부산정내역서, 진단명이 기재된 진단서 또는 소견서가 기본입니다. 사고로 인한 경우 사고 경위 자료를 함께 준비합니다. 필요한 서류는 보험사마다 다를 수 있어 미리 확인하는 것이 좋습니다.' },
    { q: '실비보험과 치아보험은 다른 건가요?', a: '네. 실손의료보험은 실제 부담한 의료비 일부를 보상하는 상품으로 치과 보철·교정 등은 제외되는 경우가 많습니다. 치아보험은 임플란트·크라운·틀니 등 치과 치료를 목적으로 설계된 별도 상품입니다. 보철 수요를 대비하려면 치아보험 쪽이 일반적입니다.' },
    { q: '치과에서 실비보험 처리를 해주나요?', a: '치과는 진료와 서류 발급을 담당하며, 보험금 지급 여부를 결정하는 주체는 보험사입니다. 서울비디치과는 진료비 세부내역서 등 청구에 필요한 서류 발급을 도와드리며, 비급여 항목은 공식 수가표로 투명하게 공개하고 있습니다. 보장 여부는 반드시 본인 보험사에 확인하세요.' },
  ],
}

