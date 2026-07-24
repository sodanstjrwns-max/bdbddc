// ============================================================
// 백과사전 슈퍼 업그레이드 콘텐츠 (v5.31)
// GSC 노출 상위 용어를 "가이드급 본문 + 맞춤 FAQ"로 오버라이드
// — 치아 번호(v5.30) 성공 공식 복제: 제목에 답 예고 + 표 구조 + 검색 의도 100% 해소
// 대상: 레진(1,548) · 틀니(936) · 치석(660) · 법랑질(573) · 인레이(493) · 치아 균열(285/CTR 3.2%)
// 팩트 소스: pricing.html 공식 수가 = 챗봇 KB = llms.txt (4소스 정합 유지)
// ============================================================

export type SuperContent = { detail: string; faqs: { q: string; a: string }[] }

const TH = 'border:1px solid #e0d4c0;padding:8px 10px;background:#f5f0eb;color:#6B4226;font-size:0.83rem;'
const TD = 'border:1px solid #e0d4c0;padding:8px 10px;font-size:0.86rem;'
const TDC = TD + 'text-align:center;'
const BOX = 'background:#faf7f3;border-left:4px solid #c9a96e;padding:14px 18px;border-radius:0 12px 12px 0;margin:16px 0;'
const WARN = 'background:#fff8ec;border:1px solid #ecd9b4;border-radius:12px;padding:14px 18px;margin:16px 0;'
const enc = (t: string) => `/encyclopedia/${encodeURIComponent(t)}`
const A = (t: string, label?: string) => `<a href="${enc(t)}" style="color:#6B4226;text-decoration:underline;text-decoration-style:dotted;font-weight:600;">${label || t}</a>`

// ============================================================
// 인터랙티브 도구 위젯 (v5.32 티어2)
// — 모든 위젯은 자체 완결형(scoped id + inline vanilla JS), CDN 의존 없음
// — SSR HTML에 그대로 삽입되어 JS 없이도 기본 정보 노출(SEO 안전)
// ============================================================
const WBOX = 'background:linear-gradient(135deg,#faf7f3,#f5efe6);border:1px solid #e5d7c0;border-radius:16px;padding:20px;margin:22px 0;'
const WTITLE = 'font-size:1.05rem;font-weight:800;color:#3E2B1F;margin:0 0 4px;display:flex;align-items:center;gap:8px;'
const WSUB = 'font-size:0.82rem;color:#8a7a66;margin:0 0 16px;'
const WBTN = 'cursor:pointer;border:1px solid #d4b896;background:#fff;color:#6B4226;border-radius:10px;padding:10px 14px;font-size:0.88rem;font-weight:600;transition:all .18s;'

/* ── #6 인레이 재료 비교기 (골드/세라믹/지르코니아) ── */
const WIDGET_INLAY_COMPARE = `
<div style="${WBOX}" id="inlayCmp">
<p style="${WTITLE}">🔬 인레이 재료 비교기</p>
<p style="${WSUB}">재료를 눌러 장단점·가격·추천 대상을 한눈에 비교하세요 (서울비디치과 수가 기준)</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;" role="tablist">
<button class="ic-tab" data-m="ceramic" style="${WBTN}background:#6B4226;color:#fff;">세라믹(E.max)</button>
<button class="ic-tab" data-m="zir" style="${WBTN}">지르코니아</button>
<button class="ic-tab" data-m="gold" style="${WBTN}">골드(금)</button>
<button class="ic-tab" data-m="resin" style="${WBTN}">레진</button>
</div>
<div id="ic-panel" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var D={
ceramic:{n:'세라믹 인레이 (E.max)',price:'치아당 35만원',pro:'치아색과 거의 동일해 심미성 최고, 현재 가장 널리 쓰이는 표준, 알레르기 거의 없음',con:'매우 단단한 음식(얼음·마른오징어)에 파절 가능',fit:'앞쪽 소구치 등 잘 보이는 어금니, 심미가 중요한 분',life:'7~12년'},
zir:{n:'지르코니아 인레이',price:'크라운 기준 55만원 (범위 크면 크라운 전환)',pro:'세라믹보다 강도가 우수해 잘 깨지지 않음, 치아색',con:'세라믹보다 심미성은 약간 낮고 비용이 높음',fit:'씹는 힘이 강하거나 이갈이가 있는 분, 넓은 어금니',life:'10~15년'},
gold:{n:'골드(금) 인레이',price:'금 시세 연동 (상담 시 안내)',fit:'심미보다 내구성·정밀 적합이 최우선인 안쪽 어금니',pro:'적합도·내구성 최상, 씹는 면 마모가 자연치와 유사, 잘 안 깨짐',con:'금색이 눈에 띄어 최근 선택 감소'},
resin:{n:'레진 (직접 충전, 참고)',price:'부위별 5~25만원',pro:'당일 1회 완료, 치아 삭제 최소, 저렴, 부분 수리 가능',con:'인레이보다 강도·수명 낮음(넓은 충치엔 부적합)',fit:'작은~중간 충치',life:'5~10년'}
};
var box=document.getElementById('inlayCmp');if(!box)return;
var panel=box.querySelector('#ic-panel'),tabs=box.querySelectorAll('.ic-tab');
function render(m){var d=D[m];panel.innerHTML='<div style="font-weight:800;color:#6B4226;font-size:1rem;margin-bottom:8px;">'+d.n+'</div>'+
'<div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;">'+
'<span style="color:#8a7a66;">💰 가격</span><span><b>'+d.price+'</b></span>'+
(d.life?'<span style="color:#8a7a66;">⏳ 수명</span><span>'+d.life+'</span>':'')+
'<span style="color:#8a7a66;">👍 장점</span><span>'+d.pro+'</span>'+
'<span style="color:#8a7a66;">👎 단점</span><span>'+d.con+'</span>'+
'<span style="color:#8a7a66;">🎯 추천</span><span>'+d.fit+'</span></div>';}
tabs.forEach(function(t){t.onclick=function(){tabs.forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});t.style.background='#6B4226';t.style.color='#fff';render(t.dataset.m);};});
render('ceramic');
})();</script>`

/* ── #7 치아 크랙(균열) 증상 자가체커 ── */
const WIDGET_CRACK_CHECK = `
<div style="${WBOX}" id="crackChk">
<p style="${WTITLE}">🩺 치아 크랙 증상 자가 체크</p>
<p style="${WSUB}">해당하는 증상을 모두 선택하세요. 결과는 참고용이며 정확한 진단은 치과 검진이 필요합니다.</p>
<div id="cc-q" style="display:flex;flex-direction:column;gap:8px;"></div>
<button id="cc-go" style="${WBTN}background:#6B4226;color:#fff;width:100%;margin-top:14px;">결과 보기</button>
<div id="cc-res" style="display:none;margin-top:14px;background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.9rem;line-height:1.8;"></div>
</div>
<script>(function(){
var Q=[
{t:'씹는 순간 특정 부위가 순간적으로 찌릿하다',w:3},
{t:'물었다가 뗄 때 더 아프다',w:3},
{t:'찬 것에 유독 시리다',w:2},
{t:'뜨거운 것에도 아프기 시작했다',w:4},
{t:'통증 위치가 애매해 "이쪽 어딘가"라고밖에 못 한다',w:2},
{t:'단단한 것(얼음·오징어·견과류)을 씹은 뒤 시작됐다',w:2},
{t:'가만히 있어도 욱신거리거나 밤에 아프다',w:4},
{t:'잇몸이 붓거나 고름이 잡힌다',w:5}
];
var box=document.getElementById('crackChk');if(!box)return;
var q=box.querySelector('#cc-q');
Q.forEach(function(o,i){var l=document.createElement('label');l.style.cssText='display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #ece2d3;border-radius:10px;padding:11px 14px;cursor:pointer;font-size:0.88rem;color:#444;';l.innerHTML='<input type="checkbox" data-w="'+o.w+'" style="width:18px;height:18px;accent-color:#6B4226;"> '+o.t;q.appendChild(l);});
box.querySelector('#cc-go').onclick=function(){
var cbs=q.querySelectorAll('input:checked'),s=0,n=cbs.length;
cbs.forEach(function(c){s+=parseInt(c.dataset.w);});
var r=box.querySelector('#cc-res'),title,color,msg;
if(n===0){title='선택된 증상이 없습니다';color='#8a7a66';msg='증상이 없다면 정기 검진(6개월~1년)으로 충분합니다. 다만 크랙 초기(잔금)는 무증상이 많으니 이갈이가 있다면 나이트가드를 고려하세요.';}
else if(s>=9){title='⚠️ 진행된 크랙 의심 — 빠른 검진 권장';color='#c0392b';msg='신경(치수)까지 침범했거나 뿌리 손상이 진행된 신호일 수 있습니다. 방치하면 신경치료를 넘어 발치·임플란트로 커질 수 있으니 가능한 빨리 검진받으세요. 서울비디치과 041-415-2892.';}
else if(s>=5){title='크랙 가능성 있음 (3단계 골든타임 구간)';color='#d68910';msg='"씹을 때 찌릿"이 반복되는 전형적 크랙 패턴입니다. 이 단계에서 크라운으로 조기 결찰하면 신경과 치아를 살릴 가능성이 높습니다. 바이트 테스트로 정확한 부위를 확인받으세요.';}
else{title='초기 단계 또는 지각과민 가능성';color='#27ae60';msg='크랙 초기이거나 단순 시림(지각과민)일 수 있습니다. 증상이 반복·악화되면 검진을, 이갈이가 있다면 나이트가드 착용을 권합니다.';}
r.style.display='block';r.style.borderLeft='4px solid '+color;
r.innerHTML='<div style="font-weight:800;color:'+color+';margin-bottom:6px;">'+title+'</div><div style="color:#555;">'+msg+'</div><div style="margin-top:10px;font-size:0.78rem;color:#aaa;">※ 선택 '+n+'개 · 본 결과는 참고용 자가체크이며 의학적 진단이 아닙니다.</div>';
r.scrollIntoView({behavior:'smooth',block:'nearest'});
};
})();</script>`

/* ── #8 임플란트 3단 해부도 (픽스처·어버트먼트·크라운 클릭) ── */
const WIDGET_IMPLANT_ANATOMY = `
<div style="${WBOX}" id="impAna">
<p style="${WTITLE}">🦷 임플란트 3단 구조 해부도</p>
<p style="${WSUB}">각 부위를 눌러 역할·재료·체크포인트를 확인하세요. 임플란트는 "인공 치근+연결부+치아" 3단으로 이뤄집니다.</p>
<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:stretch;">
<div style="flex:0 0 120px;display:flex;flex-direction:column;gap:6px;align-items:center;">
<button class="ia-p" data-p="crown" style="${WBTN}width:110px;background:#6B4226;color:#fff;">① 크라운</button>
<div style="color:#c9a96e;">↑</div>
<button class="ia-p" data-p="abut" style="${WBTN}width:110px;">② 어버트먼트</button>
<div style="color:#c9a96e;">↑</div>
<button class="ia-p" data-p="fix" style="${WBTN}width:110px;">③ 픽스처</button>
<div style="font-size:0.68rem;color:#aaa;text-align:center;line-height:1.4;margin-top:2px;">잇몸뼈<br>(치조골)</div>
</div>
<div id="ia-panel" style="flex:1;min-width:220px;background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
</div>
<script>(function(){
var D={
crown:{n:'① 크라운 (인공 치아 머리)',r:'실제로 씹고 보이는 치아 부분. 지르코니아·세라믹 등으로 제작해 어버트먼트 위에 씌웁니다.',mat:'지르코니아 / PFM / 세라믹',chk:'색·모양이 옆 치아와 조화로운지, 씹었을 때 높이가 맞는지 확인. 서울비디치과 임플란트 크라운 포함가 안내.'},
abut:{n:'② 어버트먼트 (지대주·연결부)',r:'픽스처와 크라운을 잇는 기둥. 잇몸을 뚫고 올라와 크라운을 지지합니다.',mat:'티타늄 / 지르코니아(심미부)',chk:'기성품 vs 맞춤형(커스텀) 여부, 나사 풀림 방지 설계인지 확인.'},
fix:{n:'③ 픽스처 (인공 치근·뿌리)',r:'잇몸뼈(치조골)에 직접 심어 뼈와 단단히 붙는(골유착) 핵심 부품. 임플란트 성패를 좌우합니다.',mat:'순수 티타늄',chk:'★ 브랜드 확인 필수! 스트라우만·오스템 등 정품 인증과 보증서를 받으세요. "39만원" 초저가는 픽스처 브랜드·뼈이식 포함 여부를 반드시 따져야 합니다.'}
};
var box=document.getElementById('impAna');if(!box)return;
var panel=box.querySelector('#ia-panel'),ps=box.querySelectorAll('.ia-p');
function render(k){var d=D[k];panel.innerHTML='<div style="font-weight:800;color:#6B4226;font-size:1rem;margin-bottom:8px;">'+d.n+'</div>'+
'<div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;">'+
'<span style="color:#8a7a66;white-space:nowrap;">역할</span><span>'+d.r+'</span>'+
'<span style="color:#8a7a66;white-space:nowrap;">재료</span><span>'+d.mat+'</span>'+
'<span style="color:#8a7a66;white-space:nowrap;">체크</span><span>'+d.chk+'</span></div>';}
ps.forEach(function(t){t.onclick=function(){ps.forEach(function(x){x.style.background='#fff';x.style.color='#6B4226';});t.style.background='#6B4226';t.style.color='#fff';render(t.dataset.p);};});
render('crown');
})();</script>`

/* ── #9 신경치료 단계 진행바 (1~4회차 인터랙티브) ── */
const WIDGET_RCT_STEPS = `
<div style="${WBOX}" id="rctStep">
<p style="${WTITLE}">📊 신경치료 단계 진행바</p>
<p style="${WSUB}">회차를 눌러 각 단계에서 무엇을 하는지 확인하세요. 치아 상태에 따라 회차는 가감될 수 있습니다.</p>
<div style="display:flex;gap:4px;margin-bottom:6px;" id="rc-bar"></div>
<div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#aaa;margin-bottom:14px;"><span>진단·발수</span><span>근관 성형</span><span>소독·확인</span><span>충전·마무리</span></div>
<div id="rc-panel" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var S=[
{n:'1회차 — 진단 & 발수(신경 제거)',d:'마취 후 치아에 구멍을 내 염증이 생긴 신경(치수)을 제거합니다. 이 단계에서 극심하던 통증이 대부분 사라집니다.',tip:'치료 후 하루 이틀 시릴 수 있으나 정상입니다.'},
{n:'2회차 — 근관 성형',d:'신경이 있던 가느다란 뿌리 통로(근관)를 기구로 넓히고 다듬어 소독약이 구석까지 닿도록 만듭니다.',tip:'임시 충전 상태이므로 딱딱한 것으로 세게 씹지 마세요.'},
{n:'3회차 — 소독 & 확인',d:'근관 내부를 반복 소독하고 염증이 가라앉았는지 확인합니다. 염증이 심하면 이 단계가 여러 번 반복될 수 있습니다.',tip:'붓기·통증이 남아있으면 회차가 늘 수 있어요. 조급해 마세요.'},
{n:'4회차 — 충전 & 마무리',d:'깨끗해진 근관을 밀폐 재료로 꽉 채우고, 약해진 치아를 보호하기 위해 크라운(지르코니아 55만원)을 씌우는 것이 표준입니다.',tip:'★ 신경치료 후 크라운을 안 씌우면 치아가 갈라져(크랙) 발치로 이어질 위험이 큽니다.'}
];
var box=document.getElementById('rctStep');if(!box)return;
var bar=box.querySelector('#rc-bar'),panel=box.querySelector('#rc-panel'),segs=[];
S.forEach(function(s,i){var b=document.createElement('button');b.style.cssText='flex:1;height:12px;border:none;border-radius:6px;background:#e5d7c0;cursor:pointer;transition:background .2s;';b.onclick=function(){sel(i);};bar.appendChild(b);segs.push(b);});
function sel(i){segs.forEach(function(b,j){b.style.background=j<=i?'#6B4226':'#e5d7c0';});var s=S[i];panel.innerHTML='<div style="font-weight:800;color:#6B4226;font-size:1rem;margin-bottom:8px;">'+s.n+'</div><div style="margin-bottom:10px;">'+s.d+'</div><div style="background:#faf7f3;border-left:3px solid #c9a96e;padding:8px 12px;border-radius:0 8px 8px 0;font-size:0.83rem;color:#6B4226;">💡 '+s.tip+'</div>';}
sel(0);
})();</script>`

/* ── #10 발치 후 회복 타임라인 슬라이더 (1일~2주) ── */
const WIDGET_EXTRACTION_TIMELINE = `
<div style="${WBOX}" id="extTL">
<p style="${WTITLE}">🗓️ 발치 후 회복 타임라인</p>
<p style="${WSUB}">슬라이더를 움직여 발치 후 시점별 정상 반응과 주의사항을 확인하세요.</p>
<input type="range" id="et-range" min="0" max="5" value="0" step="1" style="width:100%;accent-color:#6B4226;margin:6px 0 4px;">
<div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#aaa;margin-bottom:14px;"><span>당일</span><span>1~2일</span><span>3일</span><span>1주</span><span>2주</span><span>1개월</span></div>
<div id="et-panel" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var T=[
{n:'발치 당일',s:'거즈를 2시간 꽉 물어 지혈. 피가 살짝 섞인 침은 정상입니다.',do:'냉찜질(볼 바깥), 처방약 복용, 부드럽고 미지근한 음식',dont:'침 뱉기·빨대·가글·흡연·음주 금지(피떡이 빠지면 드라이소켓 위험!)'},
{n:'1~2일차',s:'붓기와 통증이 가장 심한 시기(정상). 볼이 붓고 멍이 들 수 있어요.',do:'냉찜질 지속, 약 거르지 않기, 반대쪽으로 씹기',dont:'뜨거운 음식·격한 운동·사우나 금지'},
{n:'3일차',s:'붓기가 정점을 지나 서서히 가라앉기 시작합니다. 이때부터는 온찜질로 전환.',do:'온찜질로 멍·붓기 완화, 살살 양치(발치 부위 제외)',dont:'발치 부위 직접 칫솔질·강한 헹굼 아직 금지'},
{n:'1주차',s:'실밥 제거 시기(녹는 실이면 생략). 대부분의 통증·붓기 소실.',do:'따뜻한 소금물로 부드럽게 헹구기 시작, 정상 식사에 점차 복귀',dont:'여전히 단단하고 질긴 음식은 발치 부위로 피하기'},
{n:'2주차',s:'잇몸 표면이 아물고 구멍이 점점 메워집니다. 일상 대부분 정상.',do:'평소처럼 양치·식사, 발치 부위도 부드럽게 관리',dont:'무리한 자극만 피하면 대부분 자유'},
{n:'1개월~',s:'잇몸이 거의 아물고 뼈가 서서히 차오릅니다. 임플란트 계획이 있다면 상담 시기.',do:'정기 검진, 임플란트·보철 계획 상담',dont:'—'}
];
var box=document.getElementById('extTL');if(!box)return;
var rng=box.querySelector('#et-range'),panel=box.querySelector('#et-panel');
function render(i){var t=T[i];var h='<div style="font-weight:800;color:#6B4226;font-size:1rem;margin-bottom:8px;">'+t.n+'</div><div style="margin-bottom:10px;">'+t.s+'</div>'+
'<div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;">'+
'<span style="color:#27ae60;white-space:nowrap;">✅ 하세요</span><span>'+t.do+'</span>';
if(t.dont!=='—')h+='<span style="color:#c0392b;white-space:nowrap;">🚫 마세요</span><span>'+t.dont+'</span>';
h+='</div>';panel.innerHTML=h;}
rng.oninput=function(){render(parseInt(rng.value));};render(0);
})();</script>
<div style="${WARN}">
<p style="margin:0;font-size:0.88rem;line-height:1.8;">⚠️ <strong>드라이소켓(발치와 건조증) 주의</strong>: 발치 후 3~5일에 통증이 오히려 더 심해지고 빈 구멍이 하얗게 보이면 피떡이 빠진 드라이소켓일 수 있습니다. 심한 통증이 지속되면 참지 말고 내원하세요(서울비디치과 041-415-2892). 흡연·빨대·강한 헹굼이 가장 큰 원인입니다.</p>
</div>`

/* ── #11 유치→영구치 교체 시기 계산기 (영구치 맹출 순서) ── */
const WIDGET_TEETH_TIMELINE = `
<div style="${WBOX}" id="teethTL">
<p style="${WTITLE}">🦷 우리 아이 이갈이(치아 교체) 시기 계산기</p>
<p style="${WSUB}">아이의 만 나이를 선택하면 지금 빠지고 나는 치아와 체크 포인트를 알려드립니다.</p>
<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
<span style="font-size:0.85rem;color:#6B4226;font-weight:700;">만 나이</span>
<select id="tt-age" style="border:1px solid #d4b896;border-radius:10px;padding:9px 12px;font-size:0.9rem;color:#6B4226;background:#fff;">
<option value="5">5세 이하</option><option value="6" selected>6세</option><option value="7">7세</option><option value="8">8세</option><option value="9">9세</option><option value="10">10세</option><option value="11">11세</option><option value="12">12세 이상</option>
</select>
</div>
<div id="tt-panel" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var M={
5:{t:'유치 완성기 (교체 전)',c:'#27ae60',d:'아직 유치 20개가 모두 자리한 시기입니다. 곧 아래 앞니부터 흔들리기 시작해요.',p:'유치 충치를 방치하면 영구치 자리와 건강에 영향을 줍니다. 불소 도포·정기 검진 시작 시기.'},
6:{t:'첫 영구치 등장 (아래 앞니 + 6세 구치)',c:'#6B4226',d:'아래 앞니가 빠지고 영구치가 올라오며, 유치 맨 뒤에 ‖6세 구치(첫째 큰어금니)’가 소리 없이 납니다.',p:'6세 구치는 유치가 아니라 평생 쓰는 어금니! 씹는 면 홈이 깊어 충치가 잘 생기니 실란트(홈 메우기)를 강력 권장합니다.'},
7:{t:'앞니 교체기',c:'#6B4226',d:'위·아래 가운데 앞니가 영구치로 바뀝니다. 새 앞니가 커 보이고 삐뚤게 나도 대부분 정상입니다.',p:'영구치가 유치 뒤로 이중으로 나면(상어이빨) 유치 발치가 필요할 수 있어요. 좌우 비대칭이 심하면 검진.'},
8:{t:'옆 앞니 교체기',c:'#6B4226',d:'가운데 옆 앞니(측절치)가 교체됩니다. 이후 잠시 교체가 뜸해지는 휴지기가 옵니다.',p:'앞니 배열이 눈에 띄게 틀어지거나 덧니 조짐이 보이면 소아 교정 상담(1차 검진) 시기입니다.'},
9:{t:'혼합 치열 휴지기',c:'#d68910',d:'앞니는 영구치, 뒤는 아직 유치인 ‘혼합 치열’ 시기. 송곳니·작은어금니 교체를 준비 중입니다.',p:'이 시기 파노라마 X-ray로 영구치 개수·매복 여부를 확인하면 교정 계획에 큰 도움이 됩니다.'},
10:{t:'송곳니·작은어금니 교체 시작',c:'#6B4226',d:'유치 어금니가 빠지고 작은어금니(소구치), 송곳니가 순서대로 올라옵니다.',p:'송곳니가 나올 공간이 부족하면 덧니로 이어지기 쉬운 결정적 시기. 공간 관리·교정 타이밍 상담 권장.'},
11:{t:'후반 교체기',c:'#6B4226',d:'남은 유치 어금니가 대부분 영구치로 바뀝니다. 곧 교체가 마무리됩니다.',p:'교체가 거의 끝나가는 시점이라 본격 교정을 시작하기 좋은 구간입니다.'},
12:{t:'영구치열 완성기 + 12세 구치',c:'#27ae60',d:'유치 교체가 대부분 끝나고, 맨 뒤에 ‘12세 구치(둘째 큰어금니)’가 납니다. 사랑니 제외 28개 완성.',p:'교체가 늦거나 안 빠진 유치가 남아 있다면 검진하세요. 사랑니(제3대구치)는 이후 별도로 확인.'}
};
var box=document.getElementById('teethTL');if(!box)return;
var sel=box.querySelector('#tt-age'),panel=box.querySelector('#tt-panel');
function render(){var m=M[sel.value];panel.innerHTML='<div style="font-weight:800;color:'+m.c+';font-size:1rem;margin-bottom:8px;">'+m.t+'</div><div style="margin-bottom:10px;">'+m.d+'</div><div style="background:#faf7f3;border-left:3px solid '+m.c+';border-radius:8px;padding:10px 12px;font-size:0.85rem;color:#555;">💡 <strong>체크 포인트</strong> — '+m.p+'</div><div style="margin-top:10px;font-size:0.76rem;color:#aaa;">※ 교체 시기는 아이마다 6개월~1년 이상 개인차가 있습니다. 평균 기준 참고용입니다.</div>';}
sel.onchange=render;render();
})();</script>`

/* ── #12 교정 장치 비교기 (인비절라인) ── */
const WIDGET_ORTHO_COMPARE = `
<div style="${WBOX}" id="orthoCmp">
<p style="${WTITLE}">📐 교정 장치 비교기 — 나에게 맞는 방식은?</p>
<p style="${WSUB}">방식을 눌러 심미성·비용·관리 난이도·적합한 케이스를 한눈에 비교하세요.</p>
<div id="oc-tabs" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;"></div>
<div id="oc-panel" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;"></div>
</div>
<script>(function(){
var D=[
{k:'투명교정(인비절라인)',emoji:'🫥',rows:[['심미성','★★★★★ 거의 안 보임'],['탈부착','가능 (식사·양치 편함)'],['비용','높음 (전악 500만~900만원선)'],['관리','하루 20~22시간 착용 자율성 필요'],['적합','가벼운~중등도 부정교합, 성인·직장인 선호']]},
{k:'세라믹(투명) 브라켓',emoji:'⚪',rows:[['심미성','★★★★ 치아색과 유사'],['탈부착','불가 (고정식)'],['비용','중상 (메탈보다 높음)'],['관리','고정식이라 자율성 부담 적음'],['적합','심한 케이스도 가능하면서 심미성 원할 때']]},
{k:'메탈 브라켓',emoji:'🔩',rows:[['심미성','★★ 잘 보임'],['탈부착','불가 (고정식)'],['비용','상대적으로 낮음'],['관리','고정식, 음식 낌 관리 필요'],['적합','복잡·고난도 케이스, 비용 부담 낮추고 싶을 때']]},
{k:'설측(치아 안쪽)',emoji:'🙈',rows:[['심미성','★★★★★ 밖에서 안 보임'],['탈부착','불가 (고정식)'],['비용','가장 높음'],['관리','초기 발음·혀 적응 기간 필요'],['적합','전혀 안 보이길 원하는 강한 심미 니즈']]}
];
var box=document.getElementById('orthoCmp');if(!box)return;
var tabs=box.querySelector('#oc-tabs'),panel=box.querySelector('#oc-panel');
function draw(i){
tabs.querySelectorAll('button').forEach(function(b,j){b.style.background=j===i?'#6B4226':'#fff';b.style.color=j===i?'#fff':'#6B4226';});
var d=D[i];var h='<div style="font-weight:800;color:#6B4226;font-size:1.02rem;margin-bottom:12px;">'+d.emoji+' '+d.k+'</div><div style="display:grid;grid-template-columns:auto 1fr;gap:8px 14px;font-size:0.87rem;">';
d.rows.forEach(function(r){h+='<span style="color:#8a7a66;font-weight:700;white-space:nowrap;">'+r[0]+'</span><span style="color:#444;">'+r[1]+'</span>';});
h+='</div>';panel.innerHTML=h;}
D.forEach(function(d,i){var b=document.createElement('button');b.style.cssText='${WBTN}';b.textContent=d.emoji+' '+d.k;b.onclick=function(){draw(i);};tabs.appendChild(b);});
draw(0);
})();</script>`

/* ── #13 미백 방식 비교기 (치아 미백) ── */
const WIDGET_WHITENING_COMPARE = `
<div style="${WBOX}" id="whCmp">
<p style="${WTITLE}">✨ 치아 미백 방식 비교기</p>
<p style="${WSUB}">방식을 눌러 효과·속도·유지력·비용을 비교하고 나에게 맞는 방법을 찾아보세요.</p>
<div id="wh-tabs" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;"></div>
<div id="wh-panel" style="background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;"></div>
</div>
<script>(function(){
var D=[
{k:'전문가 미백(오피스)',emoji:'🏥',rows:[['방법','병원에서 고농도 약제+광조사, 1~3회'],['효과','★★★★★ 즉각적·강력'],['속도','1회 1시간 내외, 바로 밝아짐'],['유지','1~2년 (관리·식습관에 좌우)'],['비용','중상 (회당/코스별 상이)'],['주의','시술 후 며칠 시림 가능, 색소 음식 절제']]},
{k:'자가 미백(홈)',emoji:'🏠',rows:[['방법','맞춤 트레이+저농도 약제, 집에서 2~4주'],['효과','★★★★ 서서히 자연스럽게'],['속도','수 주 소요'],['유지','꾸준히 하면 안정적'],['비용','중 (트레이 제작 포함)'],['주의','착용 시간 지키기, 잇몸 자극 주의']]},
{k:'병행(오피스+홈)',emoji:'🔗',rows:[['방법','병원 시술로 빠르게 + 집에서 유지'],['효과','★★★★★ 가장 확실'],['속도','초기 빠르고 유지력 좋음'],['유지','가장 오래 (권장 조합)'],['비용','상'],['주의','치과 지시대로 병행']]},
{k:'내부 미백(실활치)',emoji:'🦷',rows:[['방법','신경치료로 변색된 죽은 치아 내부에 약제'],['효과','★★★★ 변색치 전용'],['속도','1~수 회 내원'],['유지','케이스별 상이'],['비용','중'],['주의','신경치료 받은 치아만 해당, 일반 미백과 다름']]},
{k:'미백 치약·스트립',emoji:'🪥',rows:[['방법','시중 제품 자가 사용'],['효과','★★ 착색 제거 위주, 한계 큼'],['속도','매우 느림'],['유지','짧음'],['비용','저'],['주의','과도한 사용은 시림·마모 유발, 근본 미백 아님']]}
];
var box=document.getElementById('whCmp');if(!box)return;
var tabs=box.querySelector('#wh-tabs'),panel=box.querySelector('#wh-panel');
function draw(i){
tabs.querySelectorAll('button').forEach(function(b,j){b.style.background=j===i?'#6B4226':'#fff';b.style.color=j===i?'#fff':'#6B4226';});
var d=D[i];var h='<div style="font-weight:800;color:#6B4226;font-size:1.02rem;margin-bottom:12px;">'+d.emoji+' '+d.k+'</div><div style="display:grid;grid-template-columns:auto 1fr;gap:8px 14px;font-size:0.87rem;">';
d.rows.forEach(function(r){h+='<span style="color:#8a7a66;font-weight:700;white-space:nowrap;">'+r[0]+'</span><span style="color:#444;">'+r[1]+'</span>';});
h+='</div>';panel.innerHTML=h;}
D.forEach(function(d,i){var b=document.createElement('button');b.style.cssText='${WBTN}';b.textContent=d.emoji+' '+d.k;b.onclick=function(){draw(i);};tabs.appendChild(b);});
draw(0);
})();</script>`

/* ── #14 스케일링 건강보험 체크 (스케일링 건강보험) ── */
const WIDGET_SCALING_INSURANCE = `
<div style="${WBOX}" id="scIns">
<p style="${WTITLE}">💳 스케일링 건강보험 적용 체크</p>
<p style="${WSUB}">몇 가지만 선택하면 올해 스케일링 보험 적용 여부와 예상 부담을 알려드립니다.</p>
<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">
<label style="font-size:0.85rem;color:#6B4226;font-weight:700;">만 나이<select id="sc-age" style="width:100%;margin-top:5px;border:1px solid #d4b896;border-radius:10px;padding:9px 12px;font-size:0.9rem;color:#6B4226;background:#fff;"><option value="adult">만 19세 이상</option><option value="minor">만 19세 미만</option></select></label>
<label style="font-size:0.85rem;color:#6B4226;font-weight:700;">올해(1/1~12/31) 이미 보험 스케일링을 받았나요?<select id="sc-used" style="width:100%;margin-top:5px;border:1px solid #d4b896;border-radius:10px;padding:9px 12px;font-size:0.9rem;color:#6B4226;background:#fff;"><option value="no">아직 안 받음</option><option value="yes">이미 받음</option></select></label>
<label style="font-size:0.85rem;color:#6B4226;font-weight:700;">치주 치료 목적인가요?<select id="sc-perio" style="width:100%;margin-top:5px;border:1px solid #d4b896;border-radius:10px;padding:9px 12px;font-size:0.9rem;color:#6B4226;background:#fff;"><option value="no">단순 예방 스케일링</option><option value="yes">잇몸병(치주) 치료 목적</option></select></label>
</div>
<button id="sc-go" style="${WBTN}width:100%;background:#6B4226;color:#fff;border-color:#6B4226;">결과 확인</button>
<div id="sc-res" style="display:none;margin-top:14px;background:#fff;border:1px solid #ece2d3;border-radius:12px;padding:16px 18px;font-size:0.88rem;line-height:1.75;color:#444;"></div>
</div>
<script>(function(){
var box=document.getElementById('scIns');if(!box)return;
box.querySelector('#sc-go').onclick=function(){
var age=box.querySelector('#sc-age').value,used=box.querySelector('#sc-used').value,perio=box.querySelector('#sc-perio').value;
var r=box.querySelector('#sc-res'),title,color,msg;
if(perio==='yes'){title='✅ 치주 치료 스케일링 — 연 1회 제한과 별개로 보험 적용';color='#27ae60';msg='잇몸병(치주염) 치료 목적의 스케일링은 예방 목적 ‘연 1회’ 한도와 별도로 건강보험이 적용됩니다. 잇몸 상태에 따라 치료 계획이 달라지니 검진 후 정확히 안내받으세요.';}
else if(age==='minor'){title='ℹ️ 만 19세 미만 — 예방 스케일링 연 1회 혜택 대상 아님';color='#d68910';msg='국가 지원 ‘연 1회 예방 스케일링’은 만 19세 이상이 대상입니다. 다만 잇몸 치료가 필요하거나 교정 전 처치 등은 별도 기준으로 보험이 적용될 수 있으니 상담받으세요.';}
else if(used==='yes'){title='⚠️ 올해 보험 혜택은 이미 사용 — 추가는 비보험';color='#c0392b';msg='예방 스케일링 보험 혜택은 매년 1/1~12/31 기준 ‘1회’입니다. 올해 이미 받으셨다면 추가 스케일링은 비보험(자비)입니다. 혜택은 매년 1월 1일 초기화되니 내년 초를 노려보세요. (치주 치료 목적이면 별도 적용)';}
else{title='✅ 보험 적용 가능! (연 1회 예방 스케일링)';color='#27ae60';msg='만 19세 이상이고 올해 아직 안 받으셨다면 건강보험 예방 스케일링 ‘연 1회’가 적용됩니다. 본인부담금은 보통 1만~2만원 안팎(치과·상태에 따라 상이). 잊기 쉬우니 올해가 가기 전에 챙기세요! 서울비디치과 041-415-2892.';}
r.style.display='block';r.style.borderLeft='4px solid '+color;
r.innerHTML='<div style="font-weight:800;color:'+color+';margin-bottom:6px;">'+title+'</div><div style="color:#555;">'+msg+'</div><div style="margin-top:10px;font-size:0.76rem;color:#aaa;">※ 보험 기준은 정책·개인 상태에 따라 달라질 수 있으며, 정확한 적용 여부는 내원 후 확인이 필요합니다.</div>';
r.scrollIntoView({behavior:'smooth',block:'nearest'});
};
})();</script>`

export const ENC_SUPER: Record<string, SuperContent> = {}

/* ============================================================
 * 1. 레진 — 노출 1,548 / CTR 0.26% → 클릭 회수 1순위
 * ============================================================ */
ENC_SUPER['레진'] = {
  detail: `
<h3>레진(복합레진)이란?</h3>
<p><strong>레진(Composite Resin)</strong>은 치아색 플라스틱 기질에 세라믹 필러 입자를 섞은 충전 재료로, 충치를 제거한 자리를 <strong>당일 한 번의 내원</strong>으로 메울 수 있는 가장 대표적인 치료법입니다. 파란 광중합기 빛을 쬐면 수십 초 만에 단단하게 굳으며, 치아와 거의 같은 색이라 어디를 치료했는지 티가 나지 않는 것이 최대 장점입니다.</p>

<h3>이런 경우 레진으로 치료합니다</h3>
<ul>
<li><strong>초·중기 ${A('충치')}</strong> — 범위가 크지 않을 때 (치아 삭제량 최소)</li>
<li><strong>앞니 파절</strong> — 부딪혀 깨진 앞니를 그날 바로 복원</li>
<li><strong>치경부 마모(목 패임)</strong> — 잇몸 근처 파인 부위 (시린 증상 개선)</li>
<li><strong>다이아스테마·블랙트라이앵글</strong> — 앞니 틈새·잇몸 사이 공간 메우기(심미레진)</li>
</ul>

<h3>레진 vs 인레이 vs 크라운 — 언제 뭘 쓰나요?</h3>
<p>충치 치료는 <strong>충치의 크기·깊이</strong>에 따라 재료가 결정됩니다. 한 표로 정리하면:</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;min-width:520px;">
<tr><th style="${TH}"></th><th style="${TH}">레진</th><th style="${TH}">${A('인레이')}</th><th style="${TH}">${A('크라운')}</th></tr>
<tr><td style="${TD}font-weight:700;">충치 범위</td><td style="${TDC}">작음~중간</td><td style="${TDC}">중간~넓음</td><td style="${TDC}">광범위·신경치료 후</td></tr>
<tr><td style="${TD}font-weight:700;">치아 삭제량</td><td style="${TDC}">최소 ✅</td><td style="${TDC}">중간</td><td style="${TDC}">가장 많음(전체 삭제)</td></tr>
<tr><td style="${TD}font-weight:700;">내원 횟수</td><td style="${TDC}">1회 (당일)</td><td style="${TDC}">2회 (본뜨기→접착)</td><td style="${TDC}">2회 이상</td></tr>
<tr><td style="${TD}font-weight:700;">평균 수명</td><td style="${TDC}">약 5~10년</td><td style="${TDC}">약 7~12년</td><td style="${TDC}">약 10~15년</td></tr>
<tr><td style="${TD}font-weight:700;">서울비디치과 수가</td><td style="${TDC}">부위별 5~25만원</td><td style="${TDC}">세라믹 35만원</td><td style="${TDC}">지르코니아 55만원</td></tr>
</table>
<p style="font-size:0.85rem;color:#8a7a66;">핵심 원칙: <strong>치아는 한 번 깎으면 되돌릴 수 없으므로, 가능한 한 적게 깎는 치료(레진)부터 검토</strong>하고, 범위가 넓어 레진의 강도로 버티기 어려울 때 인레이·크라운으로 올라갑니다.</p>

<h3>레진 치료 과정 (당일 1회, 약 30분~1시간)</h3>
<ol>
<li><strong>마취</strong> — 필요 시 부분 마취 (얕은 충치는 마취 없이도 가능)</li>
<li><strong>충치 제거</strong> — 감염된 부분만 최소한으로 삭제</li>
<li><strong>산부식·접착제 도포</strong> — 레진이 치아에 단단히 붙도록 표면 처리</li>
<li><strong>레진 적층 충전 + 광중합</strong> — 얇게 쌓고 빛으로 굳히기를 반복</li>
<li><strong>교합 조정·연마</strong> — 씹었을 때 편하도록 다듬고 광택 마무리</li>
</ol>

<div style="${BOX}">
<p style="margin:0 0 6px;font-weight:700;color:#3E2B1F;">💳 보험 적용 기준 (중요)</p>
<p style="margin:0;font-size:0.9rem;line-height:1.8;">
· <strong>만 12세 이하 아동의 영구치 광중합 레진</strong>은 건강보험이 적용됩니다.<br>
· 성인 레진은 비급여이며, 서울비디치과 기준 <strong>부위별 5~25만원</strong>(뺨측·어금니 좁은 부위 10만원 / 넓은 부위 25만원), 앞니 파절 복원은 <strong>12~70만원</strong>입니다.<br>
· 치과마다 가격이 다른 이유: 충치의 <strong>면(面) 수</strong>·재료 등급·술자의 심미 난이도에 따라 달라지기 때문입니다. 견적서에 "몇 개 치아, 몇 면"인지 확인하면 비교가 쉬워집니다.</p>
</div>

<h3>레진 수명과 관리</h3>
<p>레진의 평균 수명은 <strong>5~10년</strong>입니다. 경계 부위가 착색되거나 일부 마모되어도 전체를 교체하지 않고 <strong>부분 수리(리페어)</strong>가 가능한 것이 레진의 큰 장점입니다. 치료 직후 24시간은 커피·카레 등 착색 음식을 피하고, 정기 검진에서 경계부 상태를 확인하면 수명을 늘릴 수 있습니다.</p>`,
  faqs: [
    { q: '레진 치료는 아픈가요?', a: '얕은 충치는 마취 없이도 가능하며, 깊은 충치는 부분 마취 후 진행하므로 치료 중 통증은 거의 없습니다. 치료 후 며칠간 씹을 때 약간 시릴 수 있으나 대부분 1~2주 내 사라집니다. 시림이 계속 심해지면 충치가 신경 가까이 깊었다는 신호일 수 있으니 재내원이 필요합니다.' },
    { q: '레진 치료 비용은 얼마인가요?', a: '서울비디치과 기준 부위별 5~25만원입니다(뺨측·어금니 좁은 부위 10만원, 넓은 부위 25만원). 앞니 파절 복원은 난이도에 따라 12~70만원입니다. 만 12세 이하 아동의 영구치 광중합 레진은 건강보험이 적용됩니다.' },
    { q: '레진과 인레이 중 뭘 선택해야 하나요?', a: '충치 범위가 기준입니다. 범위가 작으면 치아를 가장 적게 깎는 레진, 씹는 면을 넓게 차지해 레진 강도로 버티기 어려우면 세라믹 인레이(서울비디치과 35만원)를 권합니다. 어떤 재료가 맞는지는 X-ray와 구강 검진으로 정확히 판단할 수 있습니다.' },
    { q: '레진 수명은 얼마나 되나요? 다시 해야 하나요?', a: '평균 5~10년입니다. 경계부 착색·마모·미세 누출이 생기면 재치료 시기이며, 레진은 전체 교체 대신 부분 수리가 가능한 경우가 많습니다. 정기 검진(6개월~1년)에서 상태를 확인하는 것이 가장 경제적입니다.' },
    { q: '레진 치료 후 커피 마셔도 되나요?', a: '광중합 레진은 빛을 쬔 즉시 굳지만, 표면 안정화를 위해 치료 후 24시간은 커피·차·카레 등 착색이 강한 음식을 피하는 것이 좋습니다. 이후에는 일상 식사에 제한이 없으며, 다만 장기적으로 착색 음식을 즐긴다면 정기 폴리싱으로 광택을 유지할 수 있습니다.' },
    { q: '레진 치료는 당일에 끝나나요?', a: '네, 레진의 가장 큰 장점입니다. 충치 제거부터 충전·연마까지 1회 내원(약 30분~1시간)에 끝납니다. 본뜨기와 기공 제작이 필요한 인레이(2회 내원)·크라운과 달리 임시 충전 기간도 없습니다.' },
  ],
}

/* ============================================================
 * 2. 인레이 — 노출 493, 레진과 세트 (상호 링크)
 * ============================================================ */
ENC_SUPER['인레이'] = {
  detail: `
<h3>인레이(Inlay)란?</h3>
<p><strong>인레이</strong>는 충치를 제거한 자리를 본떠서 <strong>기공소에서 맞춤 제작한 세라믹·금 조각을 접착</strong>하는 "간접 수복" 치료입니다. 입안에서 직접 굳히는 ${A('레진')}과 달리, 밖에서 정밀하게 만들어 붙이기 때문에 <strong>넓은 충치도 단단하고 정확하게</strong> 복원할 수 있습니다.</p>

<h3>인레이 vs 온레이 vs 크라운 — 덮는 범위의 차이</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;min-width:480px;">
<tr><th style="${TH}">구분</th><th style="${TH}">덮는 범위</th><th style="${TH}">이런 경우</th></tr>
<tr><td style="${TDC}font-weight:700;">인레이</td><td style="${TD}">씹는 면의 <strong>홈 안쪽</strong>만</td><td style="${TD}">중간 크기 충치, 교두(뾰족한 부분)는 건강할 때</td></tr>
<tr><td style="${TDC}font-weight:700;">${A('온레이')}</td><td style="${TD}">씹는 면 + <strong>교두 일부</strong>까지</td><td style="${TD}">충치가 교두를 침범했지만 전체를 씌울 정도는 아닐 때</td></tr>
<tr><td style="${TDC}font-weight:700;">${A('크라운')}</td><td style="${TD}">치아 <strong>전체</strong>를 씌움</td><td style="${TD}">광범위 파괴, 신경치료 후 (지르코니아 55만원)</td></tr>
</table>

<h3>레진 vs 인레이 — 뭐가 다른가요?</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;min-width:480px;">
<tr><th style="${TH}"></th><th style="${TH}">레진 (직접 충전)</th><th style="${TH}">인레이 (간접 수복)</th></tr>
<tr><td style="${TD}font-weight:700;">제작 방식</td><td style="${TDC}">입안에서 바로 충전</td><td style="${TDC}">본떠서 기공 제작 후 접착</td></tr>
<tr><td style="${TD}font-weight:700;">적합한 충치</td><td style="${TDC}">작음~중간</td><td style="${TDC}">중간~넓음</td></tr>
<tr><td style="${TD}font-weight:700;">내원 횟수</td><td style="${TDC}">1회</td><td style="${TDC}">2회</td></tr>
<tr><td style="${TD}font-weight:700;">강도·정밀도</td><td style="${TDC}">좋음</td><td style="${TDC}">더 우수 (넓은 면적에서)</td></tr>
<tr><td style="${TD}font-weight:700;">서울비디치과 수가</td><td style="${TDC}">부위별 5~25만원</td><td style="${TDC}">세라믹 35만원</td></tr>
</table>

<h3>재료별 인레이</h3>
<ul>
<li><strong>세라믹 인레이</strong> — 치아색과 거의 동일, 현재 가장 널리 쓰이는 표준. 서울비디치과 <strong>치아당 35만원</strong></li>
<li><strong>골드 인레이</strong> — 강도·적합도가 우수하나 색이 눈에 띄어 최근에는 선택 빈도 감소</li>
<li><strong>레진 인레이</strong> — 세라믹보다 저렴하나 마모·변색이 상대적으로 빠름</li>
</ul>

<h3>치료 과정 (2회 내원)</h3>
<ol>
<li><strong>1차 내원</strong> — 충치 제거 → 정밀 본뜨기(또는 디지털 스캔) → 임시 충전</li>
<li><strong>기공 제작</strong> — 맞춤 세라믹 조각 제작 (수일 소요)</li>
<li><strong>2차 내원</strong> — 임시 충전 제거 → 적합 확인 → 접착 → 교합 조정</li>
</ol>
<div style="${WARN}">
<p style="margin:0;font-size:0.88rem;line-height:1.8;">⚠️ <strong>임시 충전 기간 주의사항</strong>: 1차와 2차 내원 사이에는 임시 재료가 들어가 있습니다. 끈적한 음식(캐러멜·젤리)과 딱딱한 음식은 피하고, 임시 충전물이 빠지면 바로 연락 주세요. 방치하면 치아가 미세하게 움직여 완성된 인레이가 맞지 않을 수 있습니다.</p>
</div>

<h3>수명과 관리</h3>
<p>세라믹 인레이의 평균 수명은 <strong>7~12년</strong>입니다. 접착 경계부에 2차 충치가 생기지 않도록 치실 사용과 정기 검진(6개월~1년)이 핵심이며, 얼음·마른오징어처럼 매우 단단한 음식을 즐겨 씹는 습관은 세라믹 파절의 원인이 되므로 주의가 필요합니다.</p>
${WIDGET_INLAY_COMPARE}`,
  faqs: [
    { q: '인레이와 레진의 차이는 무엇인가요?', a: '레진은 입안에서 직접 충전해 1회에 끝나는 치료(작은~중간 충치), 인레이는 본떠서 기공소에서 맞춤 제작 후 접착하는 치료(중간~넓은 충치)입니다. 충치가 넓어 레진의 강도로 버티기 어려울 때 인레이를 선택합니다. 서울비디치과 기준 레진 5~25만원, 세라믹 인레이 35만원입니다.' },
    { q: '인레이 가격은 얼마인가요?', a: '서울비디치과의 세라믹 인레이는 치아당 35만원입니다. 충치가 교두까지 번져 온레이나 크라운(지르코니아 55만원)이 필요한 경우 범위에 따라 달라지므로, 정확한 비용은 X-ray 검진 후 안내드립니다.' },
    { q: '인레이 치료는 몇 번 와야 하나요?', a: '보통 2회입니다. 1차 내원에서 충치 제거와 본뜨기(임시 충전), 기공 제작 후 2차 내원에서 접착합니다. 1차와 2차 사이 임시 충전 기간에는 끈적하거나 딱딱한 음식을 피해주세요.' },
    { q: '인레이 한 치아가 씹을 때 아파요. 왜 그런가요?', a: '접착 직후 며칠간의 민감함은 정상 범위입니다. 그러나 수개월~수년 뒤 씹을 때 통증이 생겼다면 경계부 2차 충치, 접착 세멘트 노화, 또는 치아 균열 가능성이 있으므로 검진이 필요합니다.' },
    { q: '인레이 수명은 얼마나 되고, 언제 교체하나요?', a: '세라믹 인레이는 평균 7~12년 사용합니다. 경계부가 검게 변하거나(2차 충치 신호) 조각이 깨지면 교체 시기입니다. 정기 검진에서 조기에 발견하면 더 큰 치료(크라운·신경치료)로 번지는 것을 막을 수 있습니다.' },
  ],
}

/* ============================================================
 * 3. 틀니 — 노출 936 ("틀니 영어로") → 치과 용어 영어 사전 확장
 * ============================================================ */
ENC_SUPER['틀니'] = {
  detail: `
<h3>틀니는 영어로 Denture(덴처)</h3>
<p><strong>틀니의 영어 표기는 Denture(덴처)</strong>입니다. 여러 개의 치아를 인공 치아와 잇몸 모양의 틀로 한 번에 회복하는 착탈식(끼웠다 뺐다 하는) 보철물로, 전체 치아가 없으면 <strong>Complete Denture(완전틀니)</strong>, 일부만 없으면 <strong>Partial Denture(부분틀니)</strong>라고 부릅니다.</p>

<h3>완전틀니 vs 부분틀니 vs 임플란트 틀니</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;min-width:520px;">
<tr><th style="${TH}"></th><th style="${TH}">완전틀니</th><th style="${TH}">부분틀니</th><th style="${TH}">임플란트 틀니</th></tr>
<tr><td style="${TD}font-weight:700;">대상</td><td style="${TDC}">치아가 하나도 없을 때</td><td style="${TDC}">일부 치아가 남아있을 때</td><td style="${TDC}">틀니 유지력이 부족할 때</td></tr>
<tr><td style="${TD}font-weight:700;">유지 방식</td><td style="${TDC}">잇몸 흡착</td><td style="${TDC}">남은 치아에 고리(클라스프)</td><td style="${TDC}">${A('임플란트')} 2~4개에 딸깍 고정</td></tr>
<tr><td style="${TD}font-weight:700;">씹는 힘</td><td style="${TDC}">자연치의 약 20~30%</td><td style="${TDC}">약 30~40%</td><td style="${TDC}">약 60~80% ✅</td></tr>
<tr><td style="${TD}font-weight:700;">서울비디치과 수가</td><td style="${TDC}">150만원</td><td style="${TDC}">150만원</td><td style="${TDC}">200만원</td></tr>
</table>

<div style="${BOX}">
<p style="margin:0 0 6px;font-weight:700;color:#3E2B1F;">💳 만 65세 이상 건강보험 적용</p>
<p style="margin:0;font-size:0.9rem;line-height:1.8;">만 65세 이상이면 완전틀니·부분틀니 모두 건강보험이 적용되어 <strong>본인부담 30%</strong>로 제작할 수 있습니다(7년마다 1회). 임플란트도 만 65세 이상 평생 2개까지 보험 적용(본인부담 30%, 약 50~60만원)되므로, "임플란트 틀니" 조합 시 부담을 크게 줄일 수 있습니다.</p>
</div>

<h3>틀니 적응 기간 — 처음 2~4주가 고비</h3>
<ul>
<li><strong>1주차</strong>: 이물감·침 증가·발음 어색함이 정상입니다. 빼지 말고 착용 시간을 늘려가세요.</li>
<li><strong>2~4주차</strong>: 부드러운 음식부터 양쪽으로 나눠 씹는 연습. 아픈 부위가 생기면 참지 말고 조정받으세요(보통 2~3회 조정).</li>
<li><strong>이후</strong>: 잇몸뼈는 서서히 변하므로 <strong>1년에 1회 검진</strong>으로 맞춤 상태를 확인하고, 헐거워지면 내면 개조(리라이닝)로 수명을 연장합니다.</li>
</ul>

<h3>틀니 관리법 3원칙</h3>
<ol>
<li><strong>밤에는 빼서 물에 보관</strong> — 잇몸도 쉬어야 하며, 마른 채 두면 변형됩니다.</li>
<li><strong>치약 대신 틀니 전용 세정제</strong> — 일반 치약의 연마제는 틀니 표면에 미세 흠집을 내 세균이 번식합니다. 흐르는 물 + 전용 브러시 + 주 2~3회 세정제 담그기.</li>
<li><strong>떨어뜨림 주의</strong> — 세면대에 물을 받거나 수건을 깔고 세척하세요. 파손 원인 1위가 낙하입니다.</li>
</ol>

<h3>📖 보너스 — 헷갈리는 치과 용어 영어 표기 총정리</h3>
<p>틀니처럼 영어 표기가 궁금한 치과 용어를 한 표에 모았습니다. (치위생과 학생·치과 종사자분들은 즐겨찾기 추천!)</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;min-width:480px;">
<tr><th style="${TH}">한국어</th><th style="${TH}">영어</th><th style="${TH}">읽기</th></tr>
<tr><td style="${TDC}">틀니(의치)</td><td style="${TDC}"><strong>Denture</strong></td><td style="${TDC}">덴처</td></tr>
<tr><td style="${TDC}">${A('임플란트')}</td><td style="${TDC}">Dental Implant</td><td style="${TDC}">덴탈 임플란트</td></tr>
<tr><td style="${TDC}">${A('크라운')}</td><td style="${TDC}">Crown</td><td style="${TDC}">크라운</td></tr>
<tr><td style="${TDC}">${A('충치')}</td><td style="${TDC}">Cavity / Dental Caries</td><td style="${TDC}">캐비티 / 카리에스</td></tr>
<tr><td style="${TDC}">${A('신경치료')}</td><td style="${TDC}">Root Canal Treatment</td><td style="${TDC}">루트 캐널 트리트먼트</td></tr>
<tr><td style="${TDC}">${A('스케일링')}</td><td style="${TDC}">Scaling</td><td style="${TDC}">스케일링</td></tr>
<tr><td style="${TDC}">발치</td><td style="${TDC}">(Tooth) Extraction</td><td style="${TDC}">익스트랙션</td></tr>
<tr><td style="${TDC}">교정</td><td style="${TDC}">Orthodontics / Braces</td><td style="${TDC}">오소돈틱스 / 브레이시스</td></tr>
<tr><td style="${TDC}">${A('사랑니')}</td><td style="${TDC}">Wisdom Tooth</td><td style="${TDC}">위즈덤 투스</td></tr>
<tr><td style="${TDC}">잇몸</td><td style="${TDC}">Gum / Gingiva</td><td style="${TDC}">검 / 진자이바</td></tr>
<tr><td style="${TDC}">브릿지</td><td style="${TDC}">Dental Bridge</td><td style="${TDC}">덴탈 브릿지</td></tr>
<tr><td style="${TDC}">${A('법랑질')}</td><td style="${TDC}">Enamel</td><td style="${TDC}">에나멜</td></tr>
</table>`,
  faqs: [
    { q: '틀니는 영어로 뭐라고 하나요?', a: 'Denture(덴처)입니다. 전체 치아가 없을 때 쓰는 완전틀니는 Complete Denture, 일부 치아가 남아있을 때 쓰는 부분틀니는 Partial Denture라고 합니다. 의치(義齒)도 같은 말입니다.' },
    { q: '틀니 가격은 얼마인가요?', a: '서울비디치과 기준 부분틀니·완전틀니 각 150만원, 임플란트로 고정하는 임플란트 틀니는 200만원입니다. 만 65세 이상은 건강보험이 적용되어 본인부담 30%로 제작 가능합니다(7년 1회).' },
    { q: '틀니 건강보험은 어떻게 적용되나요?', a: '만 65세 이상이면 완전틀니·부분틀니 모두 보험 적용 대상으로 본인부담률 30%입니다. 같은 종류 틀니는 7년에 1회 적용되며, 임플란트도 만 65세 이상 평생 2개까지 보험이 됩니다(본인부담 약 50~60만원).' },
    { q: '틀니 적응 기간은 얼마나 걸리나요?', a: '평균 2~4주입니다. 첫 주에는 이물감·침 분비 증가·발음 어색함이 정상이며, 아픈 부위가 생기면 참지 말고 내원해 2~3회 조정을 받는 것이 적응의 지름길입니다. 잇몸뼈는 계속 변하므로 이후에도 1년 1회 검진을 권합니다.' },
    { q: '임플란트 틀니는 일반 틀니와 뭐가 다른가요?', a: '임플란트 2~4개를 심고 그 위에 틀니를 딸깍 고정하는 방식입니다. 잇몸 흡착에만 의존하는 일반 틀니(씹는 힘 자연치의 20~30%)보다 훨씬 안정적이어서 씹는 힘이 60~80%까지 회복됩니다. 서울비디치과 기준 200만원입니다.' },
    { q: '틀니는 밤에 끼고 자도 되나요?', a: '권하지 않습니다. 밤에는 빼서 잇몸을 쉬게 하고, 틀니는 마르지 않도록 물이나 전용 세정액에 담가 보관하세요. 계속 끼고 자면 잇몸 염증·구내염 위험이 커지고 잇몸뼈 흡수도 빨라집니다.' },
  ],
}

/* ============================================================
 * 4. 치석 — 노출 660, 스케일링(보험) 깔때기 입구
 * ============================================================ */
ENC_SUPER['치석'] = {
  detail: `
<h3>치석이란? — 플라크가 돌처럼 굳은 것</h3>
<p><strong>치석(Calculus, Tartar)</strong>은 양치 후에도 남은 세균막(${A('치태', '플라크')})이 침 속 미네랄과 결합해 <strong>돌처럼 딱딱하게 굳은 것</strong>입니다. 플라크는 단 며칠이면 굳기 시작하며, 한번 치석이 되면 <strong>칫솔로는 절대 제거할 수 없습니다.</strong></p>

<h3>치석이 유독 잘 생기는 자리</h3>
<p>치석은 <strong>침샘 출구 근처</strong>에 집중적으로 생깁니다. 거울로 확인해 보세요:</p>
<ul>
<li><strong>아래 앞니 안쪽(혀 쪽)</strong> — 혀 밑 침샘 바로 앞. 치석이 가장 먼저, 가장 많이 쌓이는 자리</li>
<li><strong>위 어금니 바깥쪽(뺨 쪽)</strong> — 귀밑샘 침이 나오는 위치</li>
<li><strong>잇몸 속(치은연하 치석)</strong> — 눈에 안 보이는 검은 치석. 잇몸 염증의 주범으로, 스케일링으로만 확인·제거 가능</li>
</ul>

<h3>치석을 방치하면 — 단계별 진행</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;min-width:500px;">
<tr><th style="${TH}">단계</th><th style="${TH}">상태</th><th style="${TH}">증상</th><th style="${TH}">회복 가능성</th></tr>
<tr><td style="${TDC}font-weight:700;">1. 치석 침착</td><td style="${TD}">잇몸 경계에 누런 띠</td><td style="${TD}">입냄새, 거친 느낌</td><td style="${TDC}">스케일링으로 완전 회복 ✅</td></tr>
<tr><td style="${TDC}font-weight:700;">2. ${A('치은염')}</td><td style="${TD}">잇몸 붉어짐·부음</td><td style="${TD}">양치 시 피가 남</td><td style="${TDC}">스케일링+관리로 회복 ✅</td></tr>
<tr><td style="${TDC}font-weight:700;">3. ${A('치주염')}</td><td style="${TD}">잇몸뼈가 녹기 시작</td><td style="${TD}">잇몸 내려앉음, 시림</td><td style="${TDC}">진행 중단은 가능, 뼈는 회복 ❌</td></tr>
<tr><td style="${TDC}font-weight:700;">4. 치아 상실</td><td style="${TD}">치아 흔들림</td><td style="${TD}">씹기 어려움</td><td style="${TDC}">발치 → ${A('임플란트')}·보철</td></tr>
</table>
<p style="font-size:0.85rem;color:#8a7a66;">핵심: <strong>2단계(치은염)까지는 100% 되돌릴 수 있습니다.</strong> 잇몸에서 피가 나는 지금이 스케일링의 골든타임입니다.</p>

<div style="${BOX}">
<p style="margin:0 0 6px;font-weight:700;color:#3E2B1F;">💳 치석 제거(스케일링) 비용 — 보험 적용</p>
<p style="margin:0;font-size:0.9rem;line-height:1.8;">
· <strong>만 19세 이상은 연 1회 건강보험 적용</strong> → 본인부담 <strong>약 1.5만원</strong><br>
· 보험 횟수를 이미 사용한 경우 비보험 <strong>6만원</strong> (서울비디치과 기준)<br>
· 매년 7월 1일에 보험 횟수가 초기화되므로, 상·하반기로 나눠 연 2회 받는 분들이 많습니다.</p>
</div>

<h3>치석 예방 4원칙</h3>
<ol>
<li><strong>잇몸 경계 45도 칫솔질</strong> — 치석은 잇몸 경계부터 생깁니다. 칫솔모를 잇몸 쪽 45도로 기울여 진동하듯 닦으세요.</li>
<li><strong>치실은 선택이 아닌 필수</strong> — 치아 사이 플라크는 칫솔이 닿지 않습니다.</li>
<li><strong>아래 앞니 안쪽 집중 관리</strong> — 칫솔을 세워서 안쪽 면을 긁어내듯.</li>
<li><strong>6개월~1년 주기 스케일링</strong> — 이미 굳은 치석은 관리로 없어지지 않습니다.</li>
</ol>`,
  faqs: [
    { q: '치석은 혼자 제거할 수 있나요?', a: '불가능합니다. 치석은 플라크가 침 속 미네랄과 결합해 돌처럼 굳은 것이라 칫솔·치실로는 제거되지 않으며, 시중의 "치석 제거 도구"로 무리하게 긁으면 잇몸과 치아 표면이 손상됩니다. 초음파 스케일러를 이용한 전문 스케일링이 유일한 제거 방법입니다.' },
    { q: '치석 제거(스케일링) 비용은 얼마인가요?', a: '만 19세 이상은 연 1회 건강보험이 적용되어 본인부담 약 1.5만원입니다. 보험 횟수를 사용한 뒤 추가로 받으면 비보험 6만원(서울비디치과 기준)입니다. 보험 횟수는 매년 7월 1일 초기화됩니다.' },
    { q: '스케일링 후 이가 시린데 정상인가요?', a: '정상입니다. 치석이 덮고 있던 치아 뿌리 부분이 드러나면서 1~2주간 일시적으로 시릴 수 있습니다. 이는 스케일링의 부작용이 아니라 치석이 그만큼 쌓여 있었다는 신호이며, 시림은 대부분 저절로 사라집니다.' },
    { q: '스케일링하면 이 사이가 벌어진다던데 사실인가요?', a: '오해입니다. 원래 치석이 차지하고 있던 공간이 비면서 벌어져 "보이는" 것일 뿐, 스케일링이 치아를 깎거나 잇몸을 벌리지 않습니다. 그 공간을 치석으로 다시 채우면 잇몸뼈가 녹아 진짜로 치아를 잃게 됩니다.' },
    { q: '양치할 때 피가 나요. 치석 때문인가요?', a: '가능성이 높습니다. 잇몸 출혈은 치석·플라크에 의한 치은염의 대표 신호입니다. 치은염 단계에서는 스케일링과 올바른 칫솔질로 100% 회복이 가능하지만, 방치해 치주염으로 진행되면 녹은 잇몸뼈는 되돌릴 수 없습니다. 피가 날 때가 검진의 골든타임입니다.' },
    { q: '스케일링은 얼마나 자주 받아야 하나요?', a: '일반적으로 6개월~1년에 1회를 권합니다. 치석이 빨리 생기는 체질(침의 미네랄 농도가 높은 경우), 흡연자, 교정장치 착용자는 3~6개월 주기가 좋습니다. 서울비디치과에서 검진 시 본인에게 맞는 주기를 안내드립니다.' },
  ],
}

/* ============================================================
 * 5. 법랑질 — 노출 573 → "치아 구조 완전 해부"로 확장
 * ============================================================ */
ENC_SUPER['법랑질'] = {
  detail: `
<h3>법랑질(에나멜) — 몸에서 가장 단단하지만, 재생되지 않는 조직</h3>
<p><strong>법랑질(Enamel, 에나멜)</strong>은 치아 머리 부분을 덮고 있는 최외곽 보호층입니다. <strong>96%가 무기질(수산화인회석)</strong>로 이루어져 인체에서 가장 단단하며(뼈보다 단단), 그 대신 살아있는 세포가 없어 <strong>한번 손상되면 스스로 재생되지 않습니다.</strong> 이 두 가지 특성이 치아 관리의 모든 것을 설명합니다.</p>

<h3>치아의 4층 구조 한눈에 보기</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;min-width:520px;">
<tr><th style="${TH}">구조</th><th style="${TH}">위치</th><th style="${TH}">특징</th><th style="${TH}">손상되면</th></tr>
<tr><td style="${TDC}font-weight:700;">법랑질</td><td style="${TD}">${A('치관')}(머리) 최외곽</td><td style="${TD}">인체 최강 경도, 신경 없음, 재생 ❌</td><td style="${TD}">통증 없이 진행 (충치 초기가 안 아픈 이유)</td></tr>
<tr><td style="${TDC}font-weight:700;">${A('상아질')}</td><td style="${TD}">법랑질 안쪽 본체</td><td style="${TD}">신경과 연결된 미세관(상아세관) 존재</td><td style="${TD}">시리고 아프기 시작</td></tr>
<tr><td style="${TDC}font-weight:700;">${A('치수')}</td><td style="${TD}">치아 중심부</td><td style="${TD}">신경·혈관 다발 ("치아의 심장")</td><td style="${TD}">극심한 통증 → ${A('신경치료')}</td></tr>
<tr><td style="${TDC}font-weight:700;">${A('백악질')}</td><td style="${TD}">${A('치근')}(뿌리) 표면</td><td style="${TD}">뿌리를 잇몸뼈에 연결</td><td style="${TD}">뿌리 노출 시림·치주 질환 관련</td></tr>
</table>
<p style="font-size:0.85rem;color:#8a7a66;">기억할 것: <strong>법랑질은 "통증 경보기가 없는 방패"</strong>입니다. 아프기 시작했다면 이미 방패가 뚫려 상아질까지 진행됐다는 뜻 — 정기 검진이 필요한 이유입니다.</p>

<h3>법랑질이 손상되는 5가지 원인</h3>
<ol>
<li><strong>산(酸) — 탄산음료·과일산·역류성 식도염</strong>: 법랑질은 pH 5.5 이하에서 녹기 시작합니다(산부식). 탄산음료를 입에 오래 머금는 습관이 특히 위험합니다.</li>
<li><strong>${A('이갈이')}</strong>: 수면 중 체중 이상의 힘이 가해져 법랑질이 갈려 나가고 ${A('치아 균열', '균열(크랙)')}의 원인이 됩니다.</li>
<li><strong>과도한 칫솔질</strong>: 단단한 칫솔로 옆으로 세게 문지르면 잇몸 근처 법랑질이 파입니다(치경부 마모).</li>
<li><strong>${A('충치')}</strong>: 세균이 만드는 산이 법랑질을 녹이며 침투합니다.</li>
<li><strong>외상·잘못된 습관</strong>: 얼음 깨물기, 병뚜껑 따기, 오징어·견과류 과다.</li>
</ol>

<h3>시림의 정체 — 법랑질과 상아세관</h3>
<p>법랑질이 마모되거나 잇몸이 내려가 <strong>상아질이 노출</strong>되면, 상아질 속 미세한 관(상아세관)을 통해 찬 자극이 신경까지 그대로 전달됩니다. 이것이 "이가 시리다"의 정체입니다. 시림이 시작됐다면 법랑질 방패에 이미 틈이 생겼다는 신호입니다.</p>

<div style="${BOX}">
<p style="margin:0 0 6px;font-weight:700;color:#3E2B1F;">🛡️ 법랑질을 지키는 5가지 습관</p>
<p style="margin:0;font-size:0.9rem;line-height:1.9;">
1. 탄산·과일주스 후 <strong>30분 뒤 양치</strong> (산에 약해진 표면을 바로 문지르지 않기, 먼저 물로 헹구기)<br>
2. <strong>불소 치약</strong> 사용 — 불소는 법랑질 표면을 더 단단한 결정으로 재무장시킵니다(재광화)<br>
3. 부드러운 칫솔모 + 가벼운 힘 (연필 잡듯)<br>
4. 이갈이가 있다면 <strong>나이트가드</strong> 착용<br>
5. 얼음·병뚜껑 등 "치아를 도구로 쓰는" 습관 금지</p>
</div>

<h3>이미 손상된 법랑질은 어떻게 치료하나요?</h3>
<ul>
<li><strong>초기 탈회(하얀 반점)</strong> — 불소 도포로 재광화 유도 가능한 유일한 단계</li>
<li><strong>치경부 마모·작은 결손</strong> — ${A('레진')}으로 당일 복원</li>
<li><strong>넓은 손상·파절</strong> — ${A('인레이')}·${A('크라운')}으로 보호</li>
<li><strong>착색이 고민이라면</strong> — 법랑질 안쪽 착색은 ${A('미백', '치아 미백')}으로 개선 (법랑질을 깎지 않는 치료)</li>
</ul>`,
  faqs: [
    { q: '법랑질은 재생되나요?', a: '재생되지 않습니다. 법랑질은 96%가 무기질로 살아있는 세포가 없어 한번 마모·파절되면 스스로 회복하지 못합니다. 단, 산에 의해 미네랄이 빠져나가기 시작한 "초기 탈회(하얀 반점)" 단계에서는 불소 도포로 재광화(재무장)가 가능합니다. 이 단계를 놓치지 않는 것이 정기 검진의 핵심입니다.' },
    { q: '이가 시린 것은 법랑질 때문인가요?', a: '네, 대부분 법랑질 마모나 잇몸 퇴축으로 상아질이 노출된 것이 원인입니다. 상아질 속 미세관(상아세관)을 통해 찬 자극이 신경으로 전달되어 시림을 느낍니다. 시린 부위가 명확하고 지속된다면 치경부 마모·충치·크랙 감별을 위해 검진을 받아보세요.' },
    { q: '탄산음료가 정말 치아를 녹이나요?', a: '사실입니다. 법랑질은 pH 5.5 이하에서 녹기 시작하는데 콜라는 pH 2.5~3.0 수준입니다. 특히 입에 오래 머금거나 조금씩 자주 마시는 습관이 가장 해롭습니다. 마신 뒤에는 물로 헹구고, 양치는 30분 뒤에 하는 것이 법랑질을 지키는 방법입니다.' },
    { q: '칫솔질을 세게 하면 좋은 것 아닌가요?', a: '반대입니다. 단단한 칫솔로 옆으로 세게 문지르면 잇몸 근처의 얇은 법랑질이 파여 나가는 치경부 마모가 생깁니다. 부드러운 칫솔모로 연필 잡듯 가볍게, 잇몸 경계 45도 각도로 닦는 것이 플라크 제거 효과도 더 좋습니다.' },
    { q: '법랑질·상아질·치수는 뭐가 다른가요?', a: '치아는 4층 구조입니다. 법랑질(최외곽 방패, 신경 없음·재생 불가) → 상아질(본체, 신경과 연결된 미세관 존재) → 치수(중심의 신경·혈관) 순으로 깊어지고, 뿌리 표면은 백악질이 덮고 있습니다. 충치가 법랑질에 머물면 안 아프고, 상아질에 닿으면 시리고, 치수까지 가면 극심한 통증과 함께 신경치료가 필요해집니다.' },
    { q: '미백을 하면 법랑질이 상하나요?', a: '전문 미백은 법랑질을 깎거나 녹이는 치료가 아니라, 법랑질 안쪽에 침착된 착색 분자를 분해하는 치료입니다. 시술 후 일시적 시림이 있을 수 있으나 법랑질 자체가 손상되는 것은 아닙니다. 서울비디치과는 소프트 블리칭 4.9만원(1회 30분), 하드 블리칭 8만원(2회 60분)으로 진행합니다.' },
  ],
}

/* ============================================================
 * 6. 치아 균열(크랙) — 노출 285 / CTR 3.2% (백과 최고) → 강화
 * ============================================================ */
ENC_SUPER['치아 균열'] = {
  detail: `
<h3>치아 크랙(균열) — "씹을 때만 찌릿"하면 의심하세요</h3>
<p><strong>치아 균열(Cracked Tooth Syndrome, 치아 크랙)</strong>은 치아에 눈에 잘 보이지 않는 금이 간 상태입니다. 한국인은 질기고 단단한 음식(오징어·깍두기·견과류)을 즐기는 식문화 탓에 크랙 발생률이 특히 높으며, <strong>X-ray에도 잘 보이지 않아</strong> "아픈데 이상이 없다"는 말을 듣고 방치되기 쉬운 질환입니다.</p>

<h3>자가 체크 — 이 중 2개 이상이면 크랙 의심</h3>
<ul>
<li>✅ <strong>씹는 순간</strong> 특정 부위에서 찌릿한 통증 (계속 아픈 게 아니라 "순간")</li>
<li>✅ 물었다가 <strong>뗄 때</strong> 더 아프다</li>
<li>✅ 찬 것에 유독 시리다 (뜨거운 것까지 아프면 진행된 신호)</li>
<li>✅ 통증 위치가 애매하다 — "이쪽 어딘가"라고밖에 말 못 함</li>
<li>✅ 단단한 것을 씹은 뒤부터 증상이 시작됐다</li>
</ul>

<h3>크랙의 5단계 — 어디까지 갔느냐가 치료를 결정합니다</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;min-width:540px;">
<tr><th style="${TH}">단계</th><th style="${TH}">상태</th><th style="${TH}">증상</th><th style="${TH}">치료</th></tr>
<tr><td style="${TDC}font-weight:700;">1. crack line<br>(잔금)</td><td style="${TD}">${A('법랑질')} 표면의 미세한 금</td><td style="${TD}">대부분 무증상</td><td style="${TD}">경과 관찰 + 이갈이 관리</td></tr>
<tr><td style="${TDC}font-weight:700;">2. 교두 파절</td><td style="${TD}">씹는 면 모서리가 깨짐</td><td style="${TD}">혀에 걸리는 느낌, 시림</td><td style="${TD}">${A('레진')}·${A('온레이')}·${A('크라운')}</td></tr>
<tr><td style="${TDC}font-weight:700;">3. 균열치<br>(cracked tooth)</td><td style="${TD}">금이 ${A('상아질')}까지 진행</td><td style="${TD}">씹을 때 찌릿 (전형적 크랙 증상)</td><td style="${TD}"><strong>크라운으로 조기 결찰 ★골든타임</strong></td></tr>
<tr><td style="${TDC}font-weight:700;">4. 치수 침범</td><td style="${TD}">금이 신경(${A('치수')})까지 도달</td><td style="${TD}">뜨거운 것에도 통증, 자발통</td><td style="${TD}">${A('신경치료')} + 크라운</td></tr>
<tr><td style="${TDC}font-weight:700;">5. 치근 수직 파절</td><td style="${TD}">뿌리까지 세로로 갈라짐</td><td style="${TD}">잇몸 붓기·고름, 씹기 불가</td><td style="${TD}">대부분 발치 → ${A('임플란트')}</td></tr>
</table>
<p style="font-size:0.85rem;color:#8a7a66;">핵심: <strong>3단계에서 크라운을 씌우면 신경과 치아를 살립니다.</strong> 크랙은 저절로 붙지 않고 한 방향으로만 진행하므로, "씹을 때 찌릿"이 반복되면 미루지 마세요.</p>

<h3>왜 X-ray에 안 보이나요?</h3>
<p>크랙은 대부분 <strong>씹는 힘 방향(수직)</strong>으로 생기는데, X-ray는 치아를 옆에서 투과해 보기 때문에 종잇장처럼 얇은 균열선이 겹쳐 보이지 않습니다. 그래서 크랙 진단은 장비보다 <strong>임상 검사</strong>가 핵심입니다:</p>
<ul>
<li><strong>바이트 테스트</strong> — 특수 기구를 교두별로 물어보며 통증 유발 지점을 특정</li>
<li><strong>치과 현미경·강한 광선(투과 검사)</strong> — 균열선을 직접 확인</li>
<li><strong>염색 검사</strong> — 균열 틈으로 스며드는 염색액으로 경로 추적</li>
</ul>

<h3>크랙을 만드는 원인 — 예방이 여기서 나옵니다</h3>
<ol>
<li><strong>단단·질긴 음식</strong>: 얼음 깨물기, 마른오징어, 게 껍데기, 깍두기 무·누룽지</li>
<li><strong>${A('이갈이')}·이 악물기</strong>: 수면 중 체중 이상의 힘 → 나이트가드가 최선의 예방</li>
<li><strong>큰 충전물이 있는 치아</strong>: ${A('아말감')}·레진이 크게 들어간 치아는 남은 벽이 얇아 취약</li>
<li><strong>${A('신경치료')} 받은 치아</strong>: 수분 공급이 끊겨 나뭇가지처럼 약해짐 — 크라운 보호가 표준인 이유</li>
<li><strong>나이</strong>: 40~50대 이상에서 법랑질 피로 누적으로 급증</li>
</ol>

<div style="${WARN}">
<p style="margin:0;font-size:0.88rem;line-height:1.8;">⚠️ <strong>"안 아파졌으니 나았겠지"가 가장 위험합니다.</strong> 통증이 사라진 것은 균열이 붙어서가 아니라 신경이 서서히 죽어가고 있다는 신호일 수 있습니다. 신경이 완전히 죽으면 통증 없이 뿌리 끝 염증·잇몸 고름으로 진행되고, 치료 기회를 놓치면 발치까지 갈 수 있습니다.</p>
</div>
${WIDGET_CRACK_CHECK}`,
  faqs: [
    { q: '치아 크랙은 저절로 낫나요?', a: '낫지 않습니다. 크랙은 뼈와 달리 다시 붙지 않으며, 씹는 힘을 받을 때마다 한 방향(신경·뿌리 쪽)으로만 진행합니다. 통증이 사라졌다면 나은 것이 아니라 신경이 죽어가는 신호일 수 있어 더 위험합니다. 조기에 크라운으로 결찰하면 신경과 치아를 살릴 수 있습니다.' },
    { q: '씹을 때만 찌릿하고 평소엔 괜찮은데 크랙인가요?', a: '전형적인 크랙 증상입니다. 씹는 순간 균열 틈이 미세하게 벌어지며 신경을 자극하고, 힘을 빼면(특히 뗄 때 통증) 다시 닫히기 때문에 "순간 통증"으로 나타납니다. 지속 통증이 아니라고 안심하지 말고 바이트 테스트로 확인받으세요.' },
    { q: 'X-ray에서 이상이 없다는데 계속 아파요. 왜 그런가요?', a: '크랙은 대부분 수직 방향이라 X-ray에 겹쳐 보이지 않습니다. 크랙 진단은 바이트 테스트(교두별로 물어보며 통증 지점 특정), 현미경·광선 투과 검사, 염색 검사 같은 임상 검사가 핵심입니다. "X-ray 정상 + 씹을 때 통증" 조합이면 크랙 정밀 검사를 요청하세요.' },
    { q: '치아 크랙은 꼭 크라운을 씌워야 하나요?', a: '균열이 상아질까지 진행된 3단계부터는 크라운이 표준 치료입니다. 크라운은 치아 전체를 띠처럼 감싸 씹는 힘에 균열이 더 벌어지지 않게 "결찰"하는 역할을 합니다. 표면 잔금(1단계)은 경과 관찰, 신경까지 침범(4단계)하면 신경치료+크라운, 뿌리까지 갈라지면(5단계) 발치가 필요할 수 있어, 단계 진단이 먼저입니다.' },
    { q: '크랙을 방치하면 어떻게 되나요?', a: '균열이 신경에 도달하면 신경치료가 필요해지고, 뿌리까지 세로로 갈라지는 수직 치근 파절로 진행되면 대부분 발치 후 임플란트를 해야 합니다. 크라운 하나로 끝낼 수 있던 치료가 방치로 인해 임플란트로 커지는 대표적인 케이스가 크랙입니다.' },
    { q: '이갈이가 있으면 크랙이 잘 생기나요?', a: '네, 가장 강력한 위험 요인 중 하나입니다. 수면 중 이갈이는 체중 이상의 힘을 치아에 반복적으로 가해 법랑질 피로 균열을 만듭니다. 나이트가드(서울비디치과 이갈이 장치 80만원, 이병민 구강내과 전문의 담당) 착용이 크랙·교두 파절 예방에 가장 효과적입니다.' },
  ],
}

/* ============================================================
 * 7. 임플란트 — 파생 키워드 다수(뼈이식·식립·구조) → 3단 해부도
 * ============================================================ */
ENC_SUPER['임플란트'] = {
  detail: `
<h3>임플란트란? — 잃어버린 치아 하나를 통째로 되살리는 치료</h3>
<p><strong>임플란트(Dental Implant)</strong>는 치아가 빠진 자리의 잇몸뼈(치조골)에 <strong>인공 치근(픽스처)</strong>을 심고, 그 위에 연결부(어버트먼트)와 인공 치아(크라운)를 올려 자연치처럼 씹는 기능을 회복하는 치료입니다. 브릿지처럼 옆의 멀쩡한 치아를 깎지 않고, ${A('틀니')}처럼 뺐다 꼈다 하지 않아 현재 결손치 수복의 표준으로 자리 잡았습니다.</p>

<h3>임플란트는 3단 구조입니다 (아래 해부도로 눌러보세요)</h3>
<p>임플란트를 이해하는 가장 쉬운 방법은 <strong>"인공 뿌리 + 연결 기둥 + 치아 머리"</strong> 3단으로 나눠 보는 것입니다. 특히 맨 아래 <strong>픽스처의 브랜드</strong>가 임플란트 수명과 안전을 좌우하므로, 견적을 받을 때 반드시 확인하세요.</p>
${WIDGET_IMPLANT_ANATOMY}

<h3>임플란트 치료 과정과 기간</h3>
<ol>
<li><strong>진단·계획</strong> — CBCT(3D 촬영)로 뼈의 양·신경 위치를 정밀 측정</li>
<li><strong>1차 수술(식립)</strong> — 픽스처를 잇몸뼈에 심음</li>
<li><strong>골유착 대기</strong> — 픽스처가 뼈와 단단히 붙는 기간(보통 2~4개월)</li>
<li><strong>2차·보철</strong> — 어버트먼트 연결 → 본뜨기 → 크라운 장착</li>
</ol>
<p style="font-size:0.85rem;color:#8a7a66;">뼈가 부족하면 <strong>뼈이식</strong>, 위 어금니 부위는 <strong>${A('상악동 거상술')}</strong>을 병행할 수 있어 기간이 늘어날 수 있습니다.</p>

<div style="${BOX}">
<p style="margin:0 0 6px;font-weight:700;color:#3E2B1F;">💳 비용과 "39만원" 초저가의 진실</p>
<p style="margin:0;font-size:0.9rem;line-height:1.8;">
· 서울비디치과 기준 <strong>임플란트 1개 200만원</strong>(진단·식립·어버트먼트·크라운 포함)<br>
· 광고의 "39만원"은 <strong>픽스처 브랜드·뼈이식·크라운 재료가 별도</strong>인 경우가 많습니다. 총액과 포함 항목을 반드시 확인하세요.<br>
· <strong>만 65세 이상은 평생 2개까지 건강보험 적용</strong>(본인부담 30%, 약 50~60만원)됩니다.</p>
</div>

<h3>임플란트 수명과 관리 — 관리하면 반영구</h3>
<p>임플란트는 잘 관리하면 <strong>10~20년 이상</strong> 사용할 수 있습니다. 다만 자연치의 완충 장치인 ${A('치주인대')}가 없어 <strong>과부하와 염증에 더 취약</strong>합니다. 자연치의 잇몸병이 '치주염'이라면 임플란트 주위 염증은 '임플란트 주위염'으로, 방치하면 뼈가 녹아 임플란트를 잃을 수 있습니다. <strong>정기 검진·치실·나이트가드(이갈이 시)</strong>가 수명의 핵심입니다.</p>`,
  faqs: [
    { q: '임플란트 1개 비용은 얼마인가요?', a: '서울비디치과 기준 1개 200만원으로, 진단·식립·어버트먼트·크라운이 포함된 가격입니다. 광고의 "39만원" 같은 초저가는 픽스처 브랜드·뼈이식·크라운 재료가 별도인 경우가 많아 총액 확인이 필요합니다. 만 65세 이상은 평생 2개까지 건강보험이 적용됩니다(본인부담 약 50~60만원).' },
    { q: '임플란트는 얼마나 아픈가요?', a: '식립 수술은 국소 마취로 진행되어 수술 중 통증은 거의 없습니다. 마취가 풀린 뒤 1~3일간 붓기와 뻐근함이 있을 수 있으나 처방약으로 조절되며, 대부분 발치보다 덜 아프다고 느낍니다.' },
    { q: '임플란트 치료 기간은 얼마나 걸리나요?', a: '픽스처가 뼈와 붙는 골유착 기간이 필요해 보통 2~4개월, 뼈이식이나 상악동 거상술을 병행하면 더 길어질 수 있습니다. 최근에는 조건이 맞으면 발치 즉시 식립하는 방법도 있어 정확한 기간은 CBCT 진단 후 안내됩니다.' },
    { q: '픽스처 브랜드가 왜 중요한가요?', a: '픽스처는 잇몸뼈에 직접 심어 평생 뼈와 붙어 있는 핵심 부품이라, 브랜드에 따라 골유착 성공률·장기 안정성·부품 호환성이 달라집니다. 스트라우만·오스템 같은 검증된 정품인지, 보증서를 받는지 확인하세요. 저가 임플란트는 브랜드가 불명확하거나 사후 부품 수급이 어려울 수 있습니다.' },
    { q: '임플란트 수명은 얼마나 되나요?', a: '관리에 따라 10~20년 이상 사용 가능합니다. 다만 자연치의 완충 역할을 하는 치주인대가 없어 과부하·염증에 취약하므로, 정기 검진과 치실 관리, 이갈이가 있다면 나이트가드 착용이 수명을 크게 좌우합니다.' },
    { q: '임플란트와 틀니, 브릿지 중 뭐가 좋나요?', a: '임플란트는 옆 치아를 깎지 않고 씹는 힘이 자연치의 60~80%까지 회복돼 가장 이상적이지만 비용·기간 부담이 있습니다. 브릿지는 빠르지만 양옆 치아를 깎아야 하고, 틀니는 경제적이지만 씹는 힘이 약합니다. 남은 치아·뼈 상태·예산에 따라 다르므로 검진 후 상담을 권합니다.' },
  ],
}

/* ============================================================
 * 8. 신경치료 — "신경치료 비용" 노출 1,038 폭발 → 단계 진행바
 * ============================================================ */
ENC_SUPER['신경치료'] = {
  detail: `
<h3>신경치료(근관치료)란? — 치아를 뽑지 않고 살리는 마지막 방법</h3>
<p><strong>신경치료(근관치료, Root Canal Treatment)</strong>는 충치나 균열로 <strong>치아 속 신경(${A('치수')})까지 세균이 침투</strong>했을 때, 감염된 신경을 제거하고 그 빈 통로(근관)를 소독·밀폐해 <strong>내 치아를 뽑지 않고 보존</strong>하는 치료입니다. "신경을 죽인다"는 말 때문에 무섭게 느껴지지만, 사실은 발치를 피하고 자연치를 살리는 치료입니다.</p>

<h3>이럴 때 신경치료가 필요합니다</h3>
<ul>
<li>가만히 있어도 욱신거리고 <strong>밤에 더 아픈</strong> 통증(자발통·야간통)</li>
<li>뜨거운 것에 아프고, 찬 것을 대면 오히려 시원한 느낌</li>
<li>깊은 ${A('충치')}가 신경까지 도달했을 때</li>
<li>${A('치아 균열', '치아 크랙')}이 신경까지 진행됐을 때</li>
<li>치아 외상으로 신경이 죽어 변색됐을 때</li>
</ul>

<h3>신경치료는 보통 몇 번에 끝나나요? (진행바로 확인)</h3>
<p>신경치료는 <strong>보통 3~4회 내원</strong>이 필요합니다. 염증이 심할수록 소독 단계가 늘어납니다. 각 회차에 무엇을 하는지 아래 진행바를 눌러 확인하세요.</p>
${WIDGET_RCT_STEPS}

<div style="${BOX}">
<p style="margin:0 0 6px;font-weight:700;color:#3E2B1F;">💳 신경치료 비용 — 대부분 건강보험 적용</p>
<p style="margin:0;font-size:0.9rem;line-height:1.8;">
· <strong>신경치료 자체는 건강보험이 적용</strong>되어 부담이 크지 않습니다(치아·근관 수에 따라 수만 원대).<br>
· 단, 치료 후 씌우는 <strong>크라운은 재료에 따라 비급여</strong>일 수 있습니다(서울비디치과 지르코니아 크라운 55만원).<br>
· "신경치료 비용"이 크게 느껴지는 이유는 대부분 이 <strong>크라운 비용</strong> 때문입니다. 치료비(보험)와 크라운(보철)을 나눠서 이해하면 명확합니다.</p>
</div>

<h3>신경치료 후 왜 크라운을 꼭 씌워야 하나요?</h3>
<p>신경을 제거한 치아는 <strong>영양·수분 공급이 끊겨 나뭇가지처럼 부서지기 쉬워집니다.</strong> 이 상태로 그냥 두고 씹으면 세로로 쫙 갈라지는(수직 치근 파절) 사고가 나기 쉽고, 이렇게 갈라지면 살릴 방법 없이 발치해야 합니다. 그래서 <strong>신경치료 후 크라운으로 감싸 보호하는 것이 표준</strong>이며, 이를 생략하면 애써 살린 치아를 잃을 수 있습니다.</p>`,
  faqs: [
    { q: '신경치료 비용은 얼마인가요?', a: '신경치료 자체는 건강보험이 적용되어 치아·근관 수에 따라 수만 원대로 부담이 크지 않습니다. 다만 치료 후 약해진 치아를 보호하기 위해 씌우는 크라운은 재료에 따라 비급여이며, 서울비디치과 지르코니아 크라운은 55만원입니다. "신경치료 비용"이 비싸게 느껴지는 것은 대부분 이 크라운 비용 때문입니다.' },
    { q: '신경치료는 몇 번 받아야 하나요?', a: '보통 3~4회 내원이 필요합니다. 1회차에 신경을 제거(발수), 이후 근관을 넓히고 반복 소독한 뒤 마지막에 충전·크라운으로 마무리합니다. 염증이 심하면 소독 단계가 늘어 회차가 추가될 수 있습니다.' },
    { q: '신경치료는 많이 아픈가요?', a: '마취 후 진행하므로 치료 중 통증은 거의 없습니다. 오히려 극심하던 치통이 첫 회차 신경 제거 후 대부분 사라집니다. 치료 사이사이 하루 이틀 시리거나 뻐근할 수 있으나 정상 범위이며 대부분 가라앉습니다.' },
    { q: '신경치료 후 꼭 크라운을 씌워야 하나요?', a: '네, 표준입니다. 신경을 제거한 치아는 수분·영양 공급이 끊겨 부서지기 쉬워, 그냥 씹다가 세로로 갈라지면(수직 치근 파절) 살릴 수 없어 발치해야 합니다. 크라운으로 감싸 보호해야 애써 살린 치아를 오래 씁니다.' },
    { q: '신경치료한 치아도 다시 아플 수 있나요?', a: '드물지만 가능합니다. 근관이 복잡해 소독이 완벽히 안 됐거나 시간이 지나 재감염되면 뿌리 끝에 염증이 생겨 재신경치료나 치근단 절제술이 필요할 수 있습니다. 정기 검진으로 조기에 확인하는 것이 좋습니다.' },
    { q: '신경치료 대신 그냥 뽑으면 안 되나요?', a: '가능하면 자연치를 살리는 신경치료가 우선입니다. 아무리 좋은 임플란트도 내 치아만큼 감각과 완충 기능이 완벽하진 않고, 발치하면 임플란트(200만원)·브릿지 등 추가 비용과 시간이 듭니다. 살릴 수 있는 치아라면 신경치료로 보존하는 것이 대부분 이득입니다.' },
  ],
}

/* ============================================================
 * 9. 발치 — 사랑니 클러스터 2,199 연계 → 회복 타임라인 + 드라이소켓
 * ============================================================ */
ENC_SUPER['발치'] = {
  detail: `
<h3>발치(拔齒)란? — 언제 치아를 뽑아야 할까</h3>
<p><strong>발치</strong>는 더 이상 살리기 어렵거나 남겨두면 해가 되는 치아를 뽑는 시술입니다. 치아는 한번 뽑으면 되돌릴 수 없으므로 신중히 결정하지만, 아래 경우엔 발치가 오히려 최선입니다.</p>
<ul>
<li>충치·염증이 너무 심해 ${A('신경치료')}로도 살릴 수 없는 치아</li>
<li>뿌리까지 세로로 갈라진 ${A('치아 균열', '치아 크랙')}(수직 치근 파절)</li>
<li>심한 ${A('치주염')}으로 잇몸뼈가 녹아 심하게 흔들리는 치아</li>
<li>매복되거나 염증을 반복하는 ${A('사랑니')}</li>
<li>교정을 위해 공간이 필요한 경우</li>
</ul>

<h3>발치 후 회복, 시점별로 무엇이 정상일까? (슬라이더로 확인)</h3>
<p>발치 후 가장 궁금한 것이 "이게 정상인가?"입니다. 아래 슬라이더를 당일부터 1개월까지 움직여 시점별 정상 반응과 주의사항을 확인하세요.</p>
${WIDGET_EXTRACTION_TIMELINE}

<h3>발치 후 가장 중요한 것 — 피떡(혈병)을 지켜라</h3>
<p>발치 자리엔 <strong>피가 굳은 덩어리(혈병, 피떡)</strong>가 생겨 상처를 덮고 뼈·잇몸이 차오르는 발판이 됩니다. 이 피떡이 빠지면 뼈가 노출돼 극심한 통증이 오는 <strong>드라이소켓(발치와 건조증)</strong>이 생깁니다. 그래서 발치 후 <strong>침 뱉기·빨대·강한 헹굼·흡연</strong>이 금지되는 것입니다 — 모두 피떡을 빨아내는 행동이거든요.</p>

<h3>발치 후 빈자리, 그냥 두면 안 되나요?</h3>
<p>어금니를 뽑고 오래 방치하면 <strong>양옆 치아가 빈 공간으로 기울고, 맞물리던 치아가 솟아 올라와</strong> 교합이 무너집니다. 결국 한 개의 상실이 여러 치아 문제로 번지므로, 발치 후에는 ${A('임플란트')}·브릿지·${A('틀니')} 등으로 빈자리를 회복하는 계획을 세우는 것이 좋습니다(잇몸이 아무는 발치 1개월 후부터 상담).</p>`,
  faqs: [
    { q: '발치 후 언제까지 아픈가요?', a: '보통 발치 후 1~2일에 붓기와 통증이 가장 심하고, 3일째부터 가라앉기 시작해 1주일이면 대부분 편해집니다. 만약 3~5일째 통증이 오히려 더 심해지면 드라이소켓(발치와 건조증)일 수 있으니 내원하세요.' },
    { q: '발치 후 하면 안 되는 것은 무엇인가요?', a: '발치 당일과 며칠간은 침 뱉기·빨대 사용·강한 가글·흡연·음주·격한 운동·사우나를 피해야 합니다. 모두 상처를 덮은 피떡(혈병)을 빠지게 해 드라이소켓과 출혈을 유발하는 행동입니다. 냉찜질은 붓기 완화에 도움이 됩니다.' },
    { q: '드라이소켓이 뭔가요? 어떻게 예방하나요?', a: '발치 자리의 피떡이 빠져 뼈가 노출되면서 극심한 통증이 생기는 상태입니다. 보통 발치 3~5일에 통증이 더 심해지고 빈 구멍이 하얗게 보입니다. 예방의 핵심은 피떡을 지키는 것 — 흡연·빨대·강한 헹굼을 피하는 것입니다. 발생 시 치과에서 처치받으면 빠르게 호전됩니다.' },
    { q: '발치는 많이 아픈 시술인가요?', a: '국소 마취로 진행되어 뽑는 동안 통증은 거의 없고, 미는 듯한 압박감 정도만 느껴집니다. 매복 사랑니처럼 난이도가 높은 경우 시간이 더 걸리고 발치 후 붓기가 클 수 있으나, 처방약으로 조절 가능합니다.' },
    { q: '발치한 자리는 그냥 둬도 되나요?', a: '앞니처럼 심미 문제만 있는 경우가 아니라면, 특히 어금니는 방치하면 양옆 치아가 기울고 맞물리는 치아가 솟아 교합이 무너집니다. 결국 여러 치아 문제로 번지므로 임플란트·브릿지·틀니로 회복하는 것이 좋습니다. 잇몸이 아무는 발치 약 1개월 후부터 상담을 시작할 수 있습니다.' },
    { q: '발치 후 언제부터 식사할 수 있나요?', a: '마취가 풀린 뒤(약 2~3시간)부터 부드럽고 미지근한 음식을 반대쪽으로 씹어 드세요. 뜨겁거나 딱딱·질긴 음식은 며칠간 피하고, 빨대는 사용하지 마세요. 1주일쯤 지나 통증이 없어지면 점차 정상 식사로 복귀할 수 있습니다.' },
  ],
}

ENC_SUPER['영구치 맹출 순서'] = {
  detail: `
<h3>유치는 언제 빠지고, 영구치는 언제 날까? (이갈이 시기)</h3>
<p>아이 입에서 첫 유치가 흔들리기 시작하면 부모님은 반갑기도, 불안하기도 합니다. <strong>유치(젖니) 20개</strong>는 만 6세 무렵부터 <strong>영구치(간니) 28개</strong>(사랑니 제외)로 순서대로 교체됩니다. 이 과정을 흔히 '이갈이'라고 부르죠. 아래 계산기로 우리 아이 나이에 맞는 교체 상황과 체크 포인트를 확인하세요.</p>
${WIDGET_TEETH_TIMELINE}

<h3>영구치가 나는 순서 — 큰 흐름만 기억하세요</h3>
<p>개인차는 있지만 대체로 <strong>아래 앞니 → 6세 구치(첫 영구 어금니) → 위·아래 앞니 → 옆 앞니 → 작은어금니·송곳니 → 12세 구치</strong> 순으로 진행됩니다. 특히 <strong>6세 구치</strong>는 유치가 빠지는 것 없이 유치 맨 뒤에 '조용히' 나기 때문에 어금니로 오해하기 쉽지만, <strong>평생 쓰는 첫 번째 영구 어금니</strong>입니다.</p>

<h3>부모가 꼭 알아야 할 이갈이 주의사항</h3>
<ul>
<li><strong>6세 구치 실란트</strong>: 씹는 면 홈이 깊어 충치가 가장 잘 생기는 치아입니다. 나오자마자 ${A('실란트', '실란트(홈 메우기)')}로 예방하세요.</li>
<li><strong>상어이빨(이중치열)</strong>: 유치가 안 빠졌는데 영구치가 뒤로 올라오는 경우. 대부분 유치 ${A('유치 발치', '발치')}가 필요하니 검진받으세요.</li>
<li><strong>교체가 너무 늦을 때</strong>: 또래보다 1년 이상 늦으면 영구치 결손·매복 가능성이 있으니 파노라마 X-ray로 확인하는 것이 좋습니다.</li>
<li><strong>교정 타이밍</strong>: 덧니·부정교합 조짐이 보이면 ${A('소아 교정')} 1차 상담(보통 만 7~9세)이 권장됩니다.</li>
</ul>`,
  faqs: [
    { q: '아이 이갈이(치아 교체)는 몇 살에 시작하나요?', a: '보통 만 6세 무렵 아래 앞니부터 흔들리며 시작해, 만 12세 전후에 대부분 마무리됩니다. 다만 아이마다 6개월~1년 이상 개인차가 있어 조금 빠르거나 늦어도 대부분 정상입니다.' },
    { q: '6세 구치가 무엇인가요? 유치인가요?', a: '만 6세 무렵 유치 맨 뒤에 새로 나는 첫 번째 영구 어금니로, 유치가 빠지는 것 없이 조용히 올라옵니다. 유치로 오해해 관리를 소홀히 하기 쉽지만 평생 쓰는 치아이며, 씹는 면 홈이 깊어 충치가 잘 생기므로 실란트(홈 메우기) 예방을 권장합니다.' },
    { q: '유치가 안 빠졌는데 영구치가 뒤에서 났어요(상어이빨). 괜찮나요?', a: '영구치가 유치 안쪽/뒤쪽으로 이중으로 나는 \'상어이빨(이중치열)\'은 비교적 흔합니다. 유치가 저절로 빠지면 영구치가 제자리를 찾기도 하지만, 그렇지 않으면 유치 발치가 필요합니다. 배열이 틀어질 수 있으니 치과 검진을 권합니다.' },
    { q: '이갈이 순서가 아이마다 다른데 정상인가요?', a: '네, 나는 순서와 시기는 아이마다 차이가 큽니다. 큰 흐름(앞니→어금니 방향)만 크게 벗어나지 않으면 대부분 정상입니다. 다만 좌우 비대칭이 심하거나 또래보다 1년 이상 늦으면 X-ray 확인이 도움이 됩니다.' },
    { q: '영구치는 총 몇 개인가요?', a: '사랑니(제3대구치)를 제외하면 영구치는 28개입니다. 사랑니 4개까지 모두 나면 최대 32개가 되지만, 사랑니는 없거나 매복되는 경우도 많습니다. 유치는 20개입니다.' },
    { q: '교정은 이갈이가 끝난 뒤에 해야 하나요?', a: '꼭 그렇지는 않습니다. 부정교합 유형에 따라 유치·혼합 치열 시기에 시작하는 1차 교정이 유리한 경우가 있습니다. 보통 만 7~9세에 1차 교정 상담을 받아 아이에게 맞는 타이밍을 정하는 것을 권장합니다.' },
  ],
}

ENC_SUPER['인비절라인'] = {
  detail: `
<h3>인비절라인(투명교정)이란?</h3>
<p><strong>인비절라인(Invisalign)</strong>은 브라켓·와이어를 붙이지 않고, 투명한 플라스틱 <strong>교정 장치(얼라이너)</strong>를 단계별로 갈아 끼우며 치아를 조금씩 이동시키는 투명교정의 대표 브랜드입니다. 눈에 잘 띄지 않고 <strong>식사·양치 때 빼낼 수 있다</strong>는 점 때문에 성인·직장인에게 특히 인기가 높습니다.</p>

<h3>인비절라인 vs 다른 교정 장치 — 뭐가 다를까? (비교기)</h3>
<p>교정은 '무조건 안 보이는 게 최고'가 아니라 <strong>내 케이스의 난이도·심미 니즈·비용·생활 패턴</strong>에 맞춰 골라야 합니다. 아래 비교기로 대표 장치들을 나란히 놓고 확인하세요.</p>
${WIDGET_ORTHO_COMPARE}

<h3>인비절라인의 최대 변수 — '착용 시간'</h3>
<p>투명교정은 편하지만, 성공의 열쇠는 <strong>스스로 하루 20~22시간 착용</strong>하는 것입니다. 빼놓는 시간이 길어지면 치아가 계획대로 움직이지 않아 기간이 늘고 결과가 나빠집니다. 자율성이 필요한 장치라, 착용 습관을 못 지킬 것 같다면 고정식(브라켓)이 더 나을 수 있습니다.</p>

<h3>어떤 케이스에 적합할까?</h3>
<p>가벼운~중등도의 부정교합, 치아 사이 공간, 경미한 덧니 등에는 투명교정이 잘 맞습니다. 반면 <strong>골격성 부정교합이나 발치가 필요한 복잡한 케이스</strong>는 ${A('메탈 브라켓', '고정식 브라켓')}이 더 유리할 수 있습니다. 정확한 판단은 X-ray·모형 분석 후 가능하니 상담받으세요.</p>`,
  faqs: [
    { q: '인비절라인(투명교정)은 정말 안 보이나요?', a: '투명한 얼라이너를 치아에 씌우는 방식이라 가까이서 유심히 보지 않으면 잘 티가 나지 않습니다. 다만 치아 이동을 돕는 작은 부착물(어태치먼트)이 붙는 경우가 있어 완전히 100% 안 보이는 것은 아닙니다.' },
    { q: '인비절라인과 일반 철사 교정, 뭐가 더 좋나요?', a: '우열이 아니라 케이스에 따라 다릅니다. 가벼운~중등도 부정교합·심미가 중요한 성인에겐 투명교정이, 복잡·고난도 케이스나 비용을 낮추고 싶을 때는 고정식 브라켓이 유리합니다. 위 비교기와 상담으로 맞는 방식을 정하세요.' },
    { q: '투명교정은 하루에 얼마나 착용해야 하나요?', a: '하루 20~22시간 이상 착용이 원칙입니다. 식사·양치 때만 빼고 거의 종일 착용해야 계획대로 치아가 움직입니다. 착용 시간을 지키지 못하면 기간이 늘고 결과가 나빠질 수 있어, 자기 관리가 성공의 핵심입니다.' },
    { q: '투명교정으로 모든 부정교합을 해결할 수 있나요?', a: '아닙니다. 가벼운~중등도 케이스에는 잘 맞지만, 골격성 문제나 발치가 필요한 복잡한 케이스는 고정식 교정이 더 적합할 수 있습니다. X-ray·모형 분석 후 적응증을 판단해야 합니다.' },
    { q: '교정 비용은 얼마인가요?', a: '장치 종류·난이도·기간에 따라 편차가 큽니다. 일반적으로 투명교정(인비절라인)이 메탈 브라켓보다 높은 편이고, 설측(안쪽) 교정이 가장 높습니다. 정확한 비용은 진단 후 개인별로 안내되며, 서울비디치과 041-415-2892로 상담 가능합니다.' },
    { q: '교정 후에도 유지장치를 껴야 하나요?', a: '네. 교정으로 옮긴 치아는 원래 위치로 돌아가려는 성질이 있어, 교정이 끝난 뒤 유지장치(리테이너)를 반드시 착용해야 합니다. 초기에는 오래, 이후 점차 착용 시간을 줄이며 관리합니다. 유지 관리를 소홀히 하면 재발할 수 있습니다.' },
  ],
}

ENC_SUPER['치아 미백'] = {
  detail: `
<h3>치아 미백이란? — 착색과 변색을 밝게</h3>
<p><strong>치아 미백</strong>은 커피·와인·흡연·노화 등으로 누렇게 변한 치아를 과산화수소·과산화요소 계열 약제로 밝게 만드는 시술입니다. 치아를 깎지 않고 색만 개선하는 <strong>비교적 보존적인 심미 치료</strong>지만, 방식마다 효과·속도·유지력·비용이 크게 다릅니다.</p>

<h3>미백 방식, 어떤 게 나에게 맞을까? (비교기)</h3>
<p>'미백'이라고 다 같은 게 아닙니다. 병원에서 한 번에 밝히는 방식부터 집에서 서서히, 신경치료 받은 죽은 치아 전용 방식까지 다양합니다. 아래 비교기로 확인하세요.</p>
${WIDGET_WHITENING_COMPARE}

<h3>미백이 잘 안 되는 경우도 있어요</h3>
<p>미백은 만능이 아닙니다. <strong>테트라사이클린 착색(회색·띠 모양)</strong>이나 심한 <strong>불소증</strong>, ${A('레진')}·크라운 같은 <strong>보철물</strong>은 미백 약제로 색이 바뀌지 않습니다. 이런 경우는 ${A('라미네이트')}나 크라운 등 다른 심미 치료가 필요할 수 있으니 상담으로 원인을 먼저 확인하세요.</p>

<h3>미백 후 시림과 관리</h3>
<p>미백 후 며칠간 <strong>이가 시린 증상</strong>은 흔하며 대부분 자연히 가라앉습니다. 밝아진 색을 오래 유지하려면 <strong>커피·홍차·와인·카레 등 색소 강한 음식</strong>을 시술 직후 며칠간 절제하고, 금연이 큰 도움이 됩니다. 정기적인 ${A('스케일링')}으로 착색을 관리하는 것도 좋습니다.</p>`,
  faqs: [
    { q: '치아 미백은 치아를 상하게 하지 않나요?', a: '적정 농도로 올바르게 시행하면 치아 구조 자체를 손상시키지 않는 보존적 시술입니다. 시술 후 일시적으로 시릴 수 있지만 대부분 며칠 내 회복됩니다. 다만 시중 제품을 과도하게 남용하면 시림·잇몸 자극·마모가 생길 수 있어 전문가 관리가 안전합니다.' },
    { q: '전문가 미백(오피스)과 자가 미백(홈), 뭐가 더 좋나요?', a: '오피스 미백은 고농도 약제로 병원에서 빠르고 강력하게, 자가 미백은 맞춤 트레이로 집에서 서서히 밝힙니다. 가장 확실한 것은 둘을 병행하는 방식입니다. 급하면 오피스, 자연스럽고 경제적으로는 홈, 유지력까지 원하면 병행을 고려하세요.' },
    { q: '미백 효과는 얼마나 오래가나요?', a: '보통 1~2년가량 유지되지만 식습관·흡연 여부에 따라 크게 달라집니다. 커피·와인·흡연이 잦으면 더 빨리 착색됩니다. 유지 관리를 위해 색소 음식 절제, 금연, 정기 스케일링, 필요시 홈 미백 보충을 권장합니다.' },
    { q: '신경치료 받은 변색된 치아도 미백되나요?', a: '일반 미백으로는 잘 안 됩니다. 신경치료로 죽어 어둡게 변한 치아는 치아 \'내부\'에 약제를 넣는 내부 미백(실활치 미백)이라는 별도 방식으로 밝힙니다. 케이스에 따라 크라운·라미네이트가 더 나을 수도 있어 상담이 필요합니다.' },
    { q: '레진이나 크라운도 같이 미백되나요?', a: '아니요. 미백 약제는 자연치아에만 작용하고 레진·크라운·라미네이트 같은 보철물의 색은 바꾸지 못합니다. 그래서 앞니에 보철물이 있는 경우, 미백으로 자연치를 밝힌 뒤 색을 맞춰 보철물을 새로 하는 순서로 진행하기도 합니다.' },
    { q: '미백 치약이나 스트립도 효과가 있나요?', a: '표면 착색 제거에는 어느 정도 도움이 되지만, 치아 자체를 밝히는 효과는 전문가·자가 미백에 비해 제한적입니다. 과도하게 사용하면 시림과 마모를 유발할 수 있으니 근본적인 미백을 원한다면 치과 상담을 권합니다.' },
  ],
}

ENC_SUPER['스케일링 건강보험'] = {
  detail: `
<h3>스케일링, 건강보험 되나요? — 한 줄 요약</h3>
<p>네! <strong>만 19세 이상</strong>이면 <strong>연 1회(매년 1월 1일~12월 31일 기준)</strong> 예방 목적 스케일링에 건강보험이 적용됩니다. 본인부담금은 보통 <strong>1만~2만원 안팎</strong>(치과·상태에 따라 상이)이죠. 아래 체크로 올해 내 적용 여부를 바로 확인하세요.</p>
${WIDGET_SCALING_INSURANCE}

<h3>스케일링 보험, 이것만은 알아두세요</h3>
<ul>
<li><strong>기준일은 '연도'</strong>: 보험 혜택은 매년 1월 1일에 초기화됩니다. 작년 12월에 받았어도 올해 1월이면 다시 받을 수 있어요. (마지막 시술로부터 1년이 아님!)</li>
<li><strong>연 1회 초과분은 비보험</strong>: 예방 목적으로 올해 이미 받았다면 추가 스케일링은 자비입니다.</li>
<li><strong>치주 치료는 별도</strong>: 잇몸병(${A('치주염')}) 치료 목적의 스케일링·치석 제거는 예방 연 1회 한도와 별개로 보험이 적용됩니다.</li>
<li><strong>만 19세 미만</strong>: 국가 지원 '연 1회 예방 스케일링' 대상은 아니지만, 치료 목적 등은 별도 기준으로 적용될 수 있습니다.</li>
</ul>

<h3>왜 매년 챙겨야 할까?</h3>
<p>스케일링은 칫솔로 절대 안 떨어지는 ${A('치석')}을 제거하는 유일한 방법입니다. 치석을 방치하면 잇몸병으로 이어지고, 결국 잇몸뼈가 녹아 ${A('발치')}·${A('임플란트')}로 커질 수 있습니다. <strong>연 1회 보험 스케일링은 가장 저렴하게 큰 병을 막는 투자</strong>인 셈이니, 올해가 가기 전에 꼭 챙기세요.</p>`,
  faqs: [
    { q: '스케일링 건강보험은 얼마나 자주 받을 수 있나요?', a: '만 19세 이상이면 매년 1회(1월 1일~12월 31일 기준) 예방 스케일링에 건강보험이 적용됩니다. 본인부담금은 보통 1만~2만원 안팎입니다. 잇몸병 치료 목적의 스케일링은 이 연 1회 한도와 별개로 적용됩니다.' },
    { q: '작년 12월에 받았는데 지금 또 보험이 되나요?', a: '네. 보험 혜택 기준은 \'마지막 시술로부터 1년\'이 아니라 \'연도(1/1~12/31)\'입니다. 작년 12월에 받았어도 해가 바뀌어 1월이 되면 새로 연 1회 혜택이 생깁니다.' },
    { q: '스케일링 보험 본인부담금은 얼마인가요?', a: '치과와 상태에 따라 다르지만 보통 1만~2만원 안팎입니다. 비보험(추가·비적용) 스케일링은 이보다 비쌀 수 있습니다. 정확한 금액은 내원 치과에서 안내받으세요.' },
    { q: '올해 이미 스케일링을 받았는데 또 받고 싶어요.', a: '예방 목적 보험 혜택은 연 1회이므로, 올해 이미 받았다면 추가 스케일링은 비보험(자비)입니다. 다만 잇몸병 치료가 필요한 경우엔 치주 치료 기준으로 별도 적용될 수 있으니 검진 후 확인하세요. 예방 혜택은 내년 1월 1일에 다시 생깁니다.' },
    { q: '만 19세 미만 자녀도 스케일링 보험이 되나요?', a: '국가 지원 \'연 1회 예방 스케일링\'은 만 19세 이상이 대상이라 그대로는 적용되지 않습니다. 다만 잇몸 치료가 필요하거나 교정 전 처치 등 치료 목적일 경우 별도 기준으로 보험이 적용될 수 있으니 상담받으세요.' },
    { q: '스케일링을 꼭 매년 받아야 하나요?', a: '권장합니다. 스케일링은 칫솔로 제거되지 않는 치석을 없애는 유일한 방법이며, 치석을 방치하면 잇몸병→잇몸뼈 소실→발치로 이어질 수 있습니다. 연 1회 보험 스케일링은 큰 병을 저렴하게 예방하는 좋은 투자입니다.' },
  ],
}
