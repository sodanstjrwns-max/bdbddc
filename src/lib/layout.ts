// ============================================
// lib/layout.ts — 공통 레이아웃/트래킹 스니펫
// Meta Pixel + GTM + GA4 + Clarity 공통 트래킹 코드 (Amplitude 는 2026-09-08 영구 제거)
// (v5.7 모듈 분리 2단계: index.tsx에서 추출)
// ============================================

export const TRACKING_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KKVMVZHK');</script>
<!-- End Google Tag Manager -->
<!-- ★ v5.67 Google 태그 직접 삽입 (GA4 2개 속성: G-3NQP355YQM / G-LM9VKJSB9F)
     GTM 경유만으로는 GSC/GA4 "태그되지 않음" 판정이 남아, 정상 페이지(/pricing 등)와
     동일하게 gtag 를 직접 넣는다. 두 속성 전송은 의도된 구성이므로 제거 금지. -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3NQP355YQM"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window._bdGtagDone = 1;
gtag('js', new Date());
window.bdClassify=function(p){var m=p.match(/^\\/(en|jp|cn|vi|th|ru)(?=\\/|$)/),l=m?m[1]:'ko',q=(m?p.slice(m[0].length):p)||'/',s=q.split('/')[1]||'',t='other';
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
gtag('config', 'G-LM9VKJSB9F', P);}})();
</script>
<script src="/static/bd-conversions.js?v=20261111b" defer></script>
<!-- Microsoft Clarity -->
<script type="text/javascript">
(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","wb39d7gn5x");
</script>
<!-- 스마트 CTA — 콘텐츠성(가이드·칼럼·블로그) 페이지에서만 자체 동작 -->
<script src="/static/bd-smart-cta.js?v=20261110c" defer></script>
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '971255062435276');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=971255062435276&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
<!-- PF Web Engine 1st-party 비콘 (중앙 대시보드 방문 집계) -->
<script defer src="https://pf-dashboard-2nt.pages.dev/beacon.js"></script>`

export const TRACKING_BODY = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KKVMVZHK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`
