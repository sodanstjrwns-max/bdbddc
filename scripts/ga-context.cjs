// GA 측정 공통 꼬리표 (측정 정의 20261111).
// 모든 페이지의 GA 설정 직전에 실행돼, 페이지 조회를 포함한 모든 이벤트에
//   page_type(페이지 유형) · treatment_topic(진료 분야) · page_lang(언어) 과
//   사용자 속성 visitor_area(천안·아산권 여부, 이전 방문에서 확인된 값) 를 붙인다.
// 운영 도메인(bdbddc.com)이 아니면 GA 설정을 하지 않아 로컬·시험 주소 기록이 섞이지 않는다.
// 개인을 식별하는 값은 다루지 않는다. 주소 경로만 본다.
// 꼬리표는 config 에도 직접 넘긴다: 운영 태그 구성에서는 gtag('set') 값이 페이지 조회에 실리지 않았다(2026-11-11 운영 확인).
//
// 이 문자열 하나가 원본이다:
//   · 정적 HTML  → scripts/post-build.cjs 가 빌드 때 dist 의 GA 설정 두 줄을 이것으로 바꾼다
//   · 서버 렌더링 → src/lib/layout.ts 의 TRACKING_HEAD 에 같은 내용이 들어 있어야 한다(빌드가 확인)
const CONTEXT = `window.bdClassify=function(p){var m=p.match(/^\\/(en|jp|cn|vi|th|ru)(?=\\/|$)/),l=m?m[1]:'ko',q=(m?p.slice(m[0].length):p)||'/',s=q.split('/')[1]||'',t='other';
if(q==='/'||q==='/index.html')t='home';
else if(s==='treatments')t=/^\\/treatments\\/?(index\\.html)?$/.test(q)?'treatment_index':'treatment';
else if(s==='doctors')t=/^\\/doctors\\/?(index\\.html)?$/.test(q)?'doctor_index':'doctor';
else if(/^pricing/.test(s))t='pricing';
else if(/^reservation/.test(s))t='reservation';
else if({area:1,guide:1,column:1,blog:1,encyclopedia:1,cases:1,video:1}[s])t=s;
else if(s==='concerns')t='concern';
else if(/^faq/.test(s))t='faq';
else if(/^symptom-checker/.test(s))t='tool';
else if(/^(about|directions|floor-guide|mission|notice|careers|tour|privacy|terms)/.test(s))t='info';
else if(/^(games?|flight|run|checkup)/.test(s))t='game';
else if(/^(auth|admin)/.test(s))t='account';
var k=q.toLowerCase(),o='none';try{k=decodeURIComponent(k)}catch(e){}
if(/implant|fixture|sinus|all-on|bone-graft|임플란트/.test(k))o='implant';
else if(/invisalign|ortho|retainer|malocclusion|교정/.test(k))o='orthodontics';
else if(/glownate|laminate|whitening|aesthetic|front-teeth|라미네이트|미백/.test(k))o='aesthetic';
else if(/pediatric|child|소아/.test(k))o='pediatric';
else if(/gum|perio|scaling|잇몸|치주|스케일링/.test(k))o='gum';
else if(/tmj|bruxism|oral-medicine|jaw|턱관절|이갈이/.test(k))o='oral_medicine';
else if(/root-canal|cavity|resin|inlay|crown|apico|tooth-crack|신경치료|충치|크라운|레진/.test(k))o='restorative';
else if(/wisdom|extraction|사랑니|발치/.test(k))o='extraction';
else if(/denture|bridge|틀니|브릿지/.test(k))o='prosthetic';
else if(/sedation|수면/.test(k))o='sedation';
return{type:t,topic:o,lang:l}};
(function(){var c=window.bdClassify(location.pathname),a='unknown';
try{var v=JSON.parse(localStorage.getItem('bd_area')||'null');if(v&&v.a&&Date.now()-v.t<6048e5)a=v.a}catch(e){}
c.area=a;c.version='20261111';window.bdPage=c;window.bdLive=location.hostname==='bdbddc.com';
var P={page_type:c.type,treatment_topic:c.topic,page_lang:c.lang,measurement_version:c.version,user_properties:{visitor_area:a}};
gtag('set',{page_type:c.type,treatment_topic:c.topic,page_lang:c.lang,measurement_version:c.version});
gtag('set','user_properties',{visitor_area:a});
if(window.bdLive){gtag('config', 'G-3NQP355YQM', Object.assign({ send_page_view: false },P));
gtag('config', 'G-LM9VKJSB9F', P);}})();`;

// 기존 GA 설정 두 줄(전 페이지 동일)을 꼬리표가 붙은 설정으로 바꾼다.
const OLD = /gtag\('config', 'G-3NQP355YQM', \{ send_page_view: false \}\);\s*gtag\('config', 'G-LM9VKJSB9F'\);/;

function applyContext(html) {
  if (html.includes('window.bdClassify=')) return html;
  return OLD.test(html) ? html.replace(OLD, () => CONTEXT) : html;
}

module.exports = { CONTEXT, applyContext };
