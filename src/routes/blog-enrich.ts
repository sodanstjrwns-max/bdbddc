// ============================================
// 블로그(인블로그 프록시) 콘텐츠 강화 모듈  — v5.41
// --------------------------------------------
// 배경:
//   /blog/* 는 우리 저장소가 아니라 외부 서비스(inblog.ai) 프록시다.
//   따라서 원본 글의 "본문"은 우리가 편집할 수 없다.
//   대신 프록시가 HTML을 가공하는 지점(cleanInblogHtml)에서
//   슬러그별 심화 블록을 주입해 동일 URL의 깊이를 끌어올린다.
//
// 목적(카니발라이제이션 해소 3️⃣안):
//   /guide/overtreatment (신규·노출0) → /blog/dental-over-treatment-guide (45클릭/8151노출) 로 301
//   하되, 신규 가이드의 자산(자가체크 위젯 / HowTo / FAQ 10 / 공적창구)을
//   기존 URL 로 이식해서 "노출 이력 + 콘텐츠 깊이" 를 동시에 확보한다.
// ============================================

export interface BlogEnrichment {
  /** 주입할 본문 HTML (본문 끝에 삽입) */
  html: string
  /** 주입할 JSON-LD (head 에 삽입) */
  jsonld: string
}

// --------------------------------------------
// 과잉진료 글 전용 심화 블록
// --------------------------------------------
const OT_BODY = `
<aside data-bd-enrich="overtreatment" style="max-width:768px;margin:40px auto;padding:0 4px;font-family:'Pretendard',-apple-system,sans-serif;color:#3a3631;line-height:1.85">

  <div style="border-top:3px solid #c9a96e;padding-top:28px">
    <p style="font-size:0.82rem;color:#a0968a;letter-spacing:0.08em;margin:0 0 6px;font-weight:700">DEEP DIVE</p>
    <h2 style="font-size:1.55rem;font-weight:800;color:#292929;margin:0 0 10px;line-height:1.35;word-break:keep-all">환자가 직접 확인할 수 있는 판단 기준</h2>
    <p style="font-size:0.95rem;color:#6b645c;margin:0 0 28px;word-break:keep-all">치료 개수나 금액으로는 과잉 여부를 판별할 수 없습니다. 아래는 <strong>진료실에서 환자분이 직접 확인 가능한</strong> 항목들입니다.</p>
  </div>

  <h3 id="bd-detail-bill" style="font-size:1.2rem;font-weight:800;color:#292929;margin:34px 0 12px;word-break:keep-all">진료비 세부내역서 읽는 법</h3>
  <p style="margin:0 0 14px;word-break:keep-all">데스크에 <strong>"진료비 세부내역서 부탁드립니다"</strong>라고 요청하시면 됩니다. 이유를 밝힐 필요는 없고, 실비보험 청구에도 쓰이는 일상적인 서류라 대부분 당일 발급됩니다. 확인할 열은 네 개입니다.</p>
  <div style="background:#faf8f5;border:1px solid #ece5db;border-radius:14px;padding:20px 22px;margin:0 0 10px">
    <ol style="margin:0;padding-left:20px">
      <li style="margin-bottom:10px"><strong>항목명</strong> — 상담 때 들은 치료명과 일치하는지</li>
      <li style="margin-bottom:10px"><strong>급여 / 비급여 구분</strong> — 건강보험 적용 여부. 비급여는 병원이 자율적으로 가격을 정합니다</li>
      <li style="margin-bottom:10px"><strong>수량</strong> — 치아 개수·횟수가 실제 받은 것과 맞는지</li>
      <li style="margin-bottom:0"><strong>단가</strong> — 같은 항목이 중복 청구되지 않았는지</li>
    </ol>
  </div>
  <p style="font-size:0.88rem;color:#7a736a;margin:0 0 8px;word-break:keep-all">※ 건강보험 적용 진료의 본인부담금이 과다했는지는 <strong>이미 치료를 받은 뒤에도</strong> 건강보험심사평가원의 「진료비 확인 요청」으로 심사받을 수 있습니다.</p>

  <h3 id="bd-second-opinion" style="font-size:1.2rem;font-weight:800;color:#292929;margin:34px 0 12px;word-break:keep-all">2차 소견(세컨드 오피니언) 제대로 받는 3단계</h3>
  <div style="display:grid;gap:14px;margin:0 0 16px">
    <div style="background:#fff;border:1px solid #e8e0d6;border-left:4px solid #c9a96e;border-radius:0 12px 12px 0;padding:18px 20px">
      <p style="margin:0 0 6px;font-weight:800;color:#6B4226;font-size:0.95rem">STEP 1 — 내 자료를 확보한다</p>
      <p style="margin:0;font-size:0.93rem;word-break:keep-all">영상 자료 사본(파노라마·치근단 X-ray·CT), 진료비 세부내역서, 치료 계획서·견적서를 요청합니다. 본인의 진료기록과 영상은 <strong>환자가 사본 발급을 청구할 수 있는 자료</strong>이며, 사유를 밝힐 의무는 없습니다.</p>
    </div>
    <div style="background:#fff;border:1px solid #e8e0d6;border-left:4px solid #c9a96e;border-radius:0 12px 12px 0;padding:18px 20px">
      <p style="margin:0 0 6px;font-weight:800;color:#6B4226;font-size:0.95rem">STEP 2 — 조건을 통제해서 물어본다</p>
      <p style="margin:0;font-size:0.93rem;word-break:keep-all">먼저 앞선 견적을 <strong>말하지 않고</strong> 자료만 보여 주며 "이 상태에서 어떤 치료가 필요할까요"라고 백지 상태로 묻습니다. 답을 들은 뒤에 기존 계획을 알려 주고 차이의 이유를 설명해 달라고 요청합니다.</p>
    </div>
    <div style="background:#fff;border:1px solid #e8e0d6;border-left:4px solid #c9a96e;border-radius:0 12px 12px 0;padding:18px 20px">
      <p style="margin:0 0 6px;font-weight:800;color:#6B4226;font-size:0.95rem">STEP 3 — 두 계획을 나란히 비교한다</p>
      <p style="margin:0;font-size:0.93rem;word-break:keep-all">진단이 같은지, 치료 시점 기준이 다른지, 치료 범위가 다른지, 재료·술식이 다른지를 비교합니다. <strong>금액이 아니라 진단·범위·근거</strong>를 비교하며, 보통 두 곳의 소견이면 충분합니다.</p>
    </div>
  </div>
  <p style="font-size:0.88rem;color:#7a736a;margin:0;word-break:keep-all">※ 두 치과의 계획이 다르다고 한쪽이 틀린 것은 아닙니다. 차이는 대개 검사 범위·치료 시점 기준·계획의 시간 지평에서 생깁니다. 다른 병원을 단정적으로 깎아내리는 설명보다, <strong>차이의 전제를 짚어 주는 설명</strong>이 일반적으로 더 신뢰할 만합니다.</p>

  <h3 style="font-size:1.2rem;font-weight:800;color:#292929;margin:34px 0 12px;word-break:keep-all">자가 체크 — 내 치료 계획 점검하기</h3>
  <p style="margin:0 0 4px;word-break:keep-all">받으신 상담을 떠올리며 해당하는 항목에 체크해 보세요. 점수가 낮다고 그 병원이 잘못했다는 뜻은 아니며, <strong>추가로 확인하거나 질문할 여지가 남았다</strong>는 의미입니다.</p>

  <div id="ot-checker" style="background:#f8f6f3;border:1px solid #e8e0d6;border-radius:16px;padding:28px 24px;margin:18px 0">
    <h4 style="margin:0;font-size:1.05rem;font-weight:800;color:#292929">치료 계획 이해도 자가 체크 (10문항)</h4>
    <form id="ot-form" style="margin:18px 0 0">
      <label class="ot-q"><input type="checkbox" value="1"> X-ray나 CT 등 <strong>영상 자료를 직접 보면서</strong> 설명을 들었다</label>
      <label class="ot-q"><input type="checkbox" value="1"> 각 치아별로 <strong>무엇이 문제인지</strong> 이해했다</label>
      <label class="ot-q"><input type="checkbox" value="1"> <strong>치료하지 않으면</strong> 어떻게 되는지 들었다</label>
      <label class="ot-q"><input type="checkbox" value="1"> <strong>다른 선택지(대안)</strong>에 대한 설명이 있었다</label>
      <label class="ot-q"><input type="checkbox" value="1"> 치료의 <strong>우선순위·순서</strong>를 안내받았다</label>
      <label class="ot-q"><input type="checkbox" value="1"> <strong>치과의사</strong>에게 직접 필요성 설명을 들었다</label>
      <label class="ot-q"><input type="checkbox" value="1"> 항목별 비용이 적힌 <strong>서면 견적서·계획서</strong>를 받았다</label>
      <label class="ot-q"><input type="checkbox" value="1"> 결정을 <strong>미루고 생각할 시간</strong>이 주어졌다</label>
      <label class="ot-q"><input type="checkbox" value="1"> 궁금한 점을 <strong>편하게 물어볼 수 있는</strong> 분위기였다</label>
      <label class="ot-q"><input type="checkbox" value="1"> 치료 후 <strong>관리·보증·재치료</strong> 기준을 안내받았다</label>
      <button type="button" id="ot-btn" style="margin-top:18px;background:#6B4226;color:#fff;border:none;border-radius:50px;padding:13px 32px;font-weight:800;font-size:0.95rem;cursor:pointer">결과 보기</button>
    </form>
    <div id="ot-result" role="status" aria-live="polite" style="display:none;margin-top:20px;background:#fff;border:1px solid #e8e0d6;border-radius:12px;padding:20px 22px"></div>
    <p style="font-size:0.8rem;color:#8a8378;margin:14px 0 0;line-height:1.7">※ 이 체크는 진단이나 특정 의료기관에 대한 평가가 아니라, 환자분이 받은 <strong>설명의 충분함</strong>을 스스로 점검해 보는 일반 정보 도구입니다. 결과는 어디에도 저장·전송되지 않습니다.</p>
  </div>

  <h3 style="font-size:1.2rem;font-weight:800;color:#292929;margin:34px 0 12px;word-break:keep-all">그대로 가져가서 쓰시라고 만든 질문 목록</h3>
  <p style="margin:0 0 12px;word-break:keep-all">캡처해 두었다가 진료실에서 그대로 읽으셔도 됩니다. 무례한 질문은 하나도 없습니다.</p>
  <div style="background:#faf8f5;border:1px solid #ece5db;border-radius:14px;padding:20px 22px;margin:0 0 8px">
    <ol style="margin:0;padding-left:20px">
      <li style="margin-bottom:8px">제 X-ray에서 문제 부위를 짚어서 보여 주실 수 있나요?</li>
      <li style="margin-bottom:8px">이 치료를 지금 안 하면, 어느 정도 기간에 어떻게 될까요?</li>
      <li style="margin-bottom:8px">이 방법 말고 다른 선택지도 있나요? 각각의 장단점은요?</li>
      <li style="margin-bottom:8px">지금 꼭 해야 하는 것과 미뤄도 되는 것으로 나눠 주실 수 있나요?</li>
      <li style="margin-bottom:8px">항목별 비용이 적힌 견적서를 받아 갈 수 있을까요?</li>
      <li style="margin-bottom:8px">오늘 결정하지 않고 생각해 봐도 괜찮을까요?</li>
      <li style="margin-bottom:0">치료 후 문제가 생기면 어떤 기준으로 관리·재치료가 되나요?</li>
    </ol>
  </div>

  <h3 style="font-size:1.2rem;font-weight:800;color:#292929;margin:34px 0 12px;word-break:keep-all">납득이 안 될 때 이용할 수 있는 공적 창구</h3>
  <div style="background:#fff;border:1px solid #e8e0d6;border-radius:14px;padding:6px 22px;margin:0 0 10px">
    <ul style="margin:16px 0;padding-left:20px">
      <li style="margin-bottom:10px"><strong>건강보험심사평가원 — 진료비 확인 요청</strong><br><span style="font-size:0.9rem;color:#6b645c">건강보험 적용 진료의 본인부담금이 과다했는지 사후 심사</span></li>
      <li style="margin-bottom:10px"><strong>한국의료분쟁조정중재원</strong><br><span style="font-size:0.9rem;color:#6b645c">의료행위로 인한 피해·분쟁 조정</span></li>
      <li style="margin-bottom:10px"><strong>한국소비자원 (1372)</strong><br><span style="font-size:0.9rem;color:#6b645c">비급여 진료비·환불 등 소비자 분쟁</span></li>
      <li style="margin-bottom:10px"><strong>관할 보건소 / 보건복지부 (129)</strong><br><span style="font-size:0.9rem;color:#6b645c">의료법 위반이 의심되는 경우</span></li>
      <li style="margin-bottom:0"><strong>국민건강보험공단 (1577-1000)</strong><br><span style="font-size:0.9rem;color:#6b645c">보험 적용 범위·자격 관련 문의</span></li>
    </ul>
  </div>
  <p style="font-size:0.88rem;color:#7a736a;margin:0 0 8px;word-break:keep-all">어느 경로든 <strong>영수증·세부내역서·계획서·영상 자료 사본</strong>을 먼저 확보해 두시면 진행이 수월합니다.</p>

  <h3 style="font-size:1.2rem;font-weight:800;color:#292929;margin:34px 0 12px;word-break:keep-all">반대편 함정 — 미루다 더 커지는 경우</h3>
  <p style="margin:0 0 14px;word-break:keep-all">과잉진료를 걱정하다 <strong>필요한 치료까지 미루는 것</strong>도 흔한 손해입니다. 아래는 미룰수록 치료 범위가 커지는 대표적인 경우입니다.</p>
  <div style="background:#fdf6f3;border:1px solid #f0ddd4;border-radius:14px;padding:18px 22px;margin:0 0 10px">
    <ul style="margin:0;padding-left:20px">
      <li style="margin-bottom:8px"><strong>시린 증상이 지속되는 충치</strong> — 레진 범위에서 끝날 것이 신경치료+크라운으로 확대될 수 있습니다</li>
      <li style="margin-bottom:8px"><strong>잇몸에서 반복되는 출혈·붓기</strong> — 스케일링·잇몸치료 단계를 지나면 치조골 소실은 되돌리기 어렵습니다</li>
      <li style="margin-bottom:8px"><strong>깨진 치아·기존 보철물 탈락</strong> — 방치 시 내부 우식이 빠르게 진행됩니다</li>
      <li style="margin-bottom:0"><strong>매복 사랑니 주변 통증</strong> — 인접 어금니까지 손상되면 치료 대상이 늘어납니다</li>
    </ul>
  </div>
  <p style="font-size:0.88rem;color:#7a736a;margin:0;word-break:keep-all">판단이 어려우실 때는 치료를 결정하기 전에 <strong>진단만 받아 두는 것</strong>도 방법입니다. 진단과 치료 결정은 같은 날 이뤄져야 하는 일이 아닙니다.</p>

  <div style="margin:40px 0 0;padding:22px 24px;background:#f8f6f3;border-radius:16px">
    <p style="margin:0 0 12px;font-weight:800;color:#292929;font-size:0.98rem">치료별로 더 알아보기</p>
    <div style="display:flex;flex-wrap:wrap;gap:9px">
      <a href="/guide/regret" style="display:inline-block;padding:9px 16px;background:#fff;border:1px solid #c9a96e;border-radius:50px;text-decoration:none;color:#6B4226;font-weight:700;font-size:0.87rem">치료별 후회 백서</a>
      <a href="/guide/insurance" style="display:inline-block;padding:9px 16px;background:#fff;border:1px solid #c9a96e;border-radius:50px;text-decoration:none;color:#6B4226;font-weight:700;font-size:0.87rem">치과 실비보험 청구</a>
      <a href="/pricing" style="display:inline-block;padding:9px 16px;background:#fff;border:1px solid #c9a96e;border-radius:50px;text-decoration:none;color:#6B4226;font-weight:700;font-size:0.87rem">비용 안내</a>
      <a href="/guide/" style="display:inline-block;padding:9px 16px;background:#fff;border:1px solid #c9a96e;border-radius:50px;text-decoration:none;color:#6B4226;font-weight:700;font-size:0.87rem">전체 가이드</a>
    </div>
  </div>

  <p style="margin:26px 0 0;padding:16px 18px;background:#fafafa;border-radius:12px;font-size:0.82rem;color:#8a8378;line-height:1.75;word-break:keep-all">본 내용은 특정 의료기관에 대한 평가나 개별 환자에 대한 진단이 아니라, 환자분이 스스로 판단하실 때 참고하실 수 있는 <strong>일반적인 정보</strong>입니다. 실제 치료의 필요 여부는 반드시 직접 진찰한 담당 의료진의 판단을 따르셔야 합니다.</p>
</aside>

<style data-bd-enrich-style>
aside[data-bd-enrich] .ot-q{display:flex;align-items:flex-start;gap:10px;padding:10px 0;font-size:0.93rem;line-height:1.65;cursor:pointer;border-bottom:1px solid #efe9e1;word-break:keep-all}
aside[data-bd-enrich] .ot-q:last-of-type{border-bottom:none}
aside[data-bd-enrich] .ot-q input{margin-top:4px;width:17px;height:17px;accent-color:#6B4226;flex-shrink:0;cursor:pointer}
aside[data-bd-enrich] h3{scroll-margin-top:80px}
</style>

<script>
(function(){
  var btn=document.getElementById('ot-btn'); if(!btn) return;
  btn.addEventListener('click', function(){
    var boxes=document.querySelectorAll('#ot-form input[type=checkbox]');
    var n=0; boxes.forEach(function(b){ if(b.checked) n++; });
    var box=document.getElementById('ot-result');
    var t,d,c;
    if(n>=9){ c='#2e7d32'; t='설명이 충분히 이뤄진 상담입니다 ('+n+'/10)';
      d='치료 개수나 금액과 무관하게, 환자분이 근거를 이해하고 선택할 수 있는 조건이 갖춰져 있었습니다. 남은 항목이 있다면 다음 내원 때 가볍게 물어보시면 됩니다.'; }
    else if(n>=6){ c='#e08e0b'; t='대체로 괜찮지만 보완할 부분이 있습니다 ('+n+'/10)';
      d='체크되지 않은 항목을 그대로 질문 목록으로 만들어 다음 내원 때 물어보세요. 특히 「안 하면 어떻게 되는지」와 「대안」 두 가지는 꼭 확인하시길 권합니다.'; }
    else if(n>=3){ c='#d9534f'; t='설명을 더 요청하실 필요가 있습니다 ('+n+'/10)';
      d='치료가 잘못됐다는 뜻이 아니라, 판단에 필요한 정보가 아직 부족한 상태입니다. 영상 자료를 함께 보며 재설명을 요청하시고, 서면 계획서를 받아 두세요. 규모가 큰 계획이라면 2차 소견도 고려해 보시길 권합니다.'; }
    else { c='#c62828'; t='결정을 미루고 정보를 먼저 모으세요 ('+n+'/10)';
      d='응급 상황이 아니라면 오늘 결정하지 않으셔도 됩니다. ① 영상 자료 사본과 세부내역서·견적서를 요청하고 ② 그 자료를 가지고 다른 치과에서 2차 소견을 들어 보신 뒤 ③ 두 계획을 비교해 결정하시는 순서를 권합니다.'; }
    box.style.display='block';
    box.innerHTML='<div style="font-weight:900;font-size:1.05rem;color:'+c+';margin-bottom:8px">'+t+'</div>'+
      '<p style="margin:0 0 12px;font-size:0.94rem;line-height:1.8;color:#3a3631">'+d+'</p>'+
      '<div style="font-size:0.86rem;color:#6b645c;line-height:1.8;border-top:1px solid #f0ece8;padding-top:12px">'+
      '다음 단계로는 <a href="#bd-second-opinion" style="color:#8B6F3F;font-weight:700">2차 소견 받는 법</a>과 '+
      '<a href="#bd-detail-bill" style="color:#8B6F3F;font-weight:700">세부내역서 읽는 법</a>을 참고하세요.</div>';
    box.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
</script>
`

const OT_JSONLD = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"HowTo","name":"치과 2차 소견(세컨드 오피니언) 제대로 받는 법","description":"다른 치과에서 치료 계획에 대한 2차 소견을 정확하게 받기 위한 3단계 절차.","totalTime":"P3D","step":[{"@type":"HowToStep","position":1,"name":"내 자료를 확보한다","text":"다니던 치과에서 영상 자료 사본(파노라마·치근단 X-ray·CT), 진료비 세부내역서, 치료 계획서·견적서를 요청합니다. 본인의 진료기록과 영상은 환자가 사본 발급을 청구할 수 있는 자료이며, 사유를 밝힐 의무는 없습니다.","url":"https://bdbddc.com/blog/dental-over-treatment-guide#bd-second-opinion"},{"@type":"HowToStep","position":2,"name":"조건을 통제해서 물어본다","text":"먼저 앞선 견적을 말하지 않고 자료만 보여 주며 '이 상태에서 어떤 치료가 필요할까요'라고 백지 상태로 묻습니다. 답을 들은 뒤에 기존 계획을 알려 주고 차이의 이유를 설명해 달라고 요청합니다.","url":"https://bdbddc.com/blog/dental-over-treatment-guide#bd-second-opinion"},{"@type":"HowToStep","position":3,"name":"두 계획을 나란히 비교한다","text":"진단이 같은지, 치료 시점 기준이 다른지, 치료 범위가 다른지, 재료·술식이 다른지, 어느 쪽 설명이 이해되는지를 비교합니다. 금액이 아니라 진단·범위·근거를 비교하며, 보통 두 곳의 소견이면 충분합니다.","url":"https://bdbddc.com/blog/dental-over-treatment-guide#bd-second-opinion"}]}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"치과에서 충치가 10개라는데, 과잉진료인가요?","acceptedAnswer":{"@type":"Answer","text":"개수만으로는 판단할 수 없습니다. 정밀 검사를 하면 초기 우식까지 포함해 개수가 늘어나는 것이 일반적이고, 파노라마 한 장만 본 곳은 적게 나올 수 있습니다. 확인해야 할 것은 개수가 아니라 ①10개가 모두 지금 치료가 필요한 단계인지 ②그중 지켜봐도 되는 것은 없는지 ③각각을 영상에서 짚어 보여 줄 수 있는지입니다. 답이 명확하지 않다면 영상 자료 사본을 받아 2차 소견을 들어 보시길 권합니다."}},{"@type":"Question","name":"진료비 세부내역서는 어떻게 받나요? 이유를 말해야 하나요?","acceptedAnswer":{"@type":"Answer","text":"데스크에 '진료비 세부내역서 부탁드립니다'라고 요청하시면 됩니다. 이유를 밝힐 필요는 없습니다. 실비보험 청구에도 쓰이는 일상적인 서류라 대부분 당일 발급됩니다. 항목명·급여/비급여 구분·수량·단가가 표시되므로, 상담 때 들은 계획과 실제 시행 내용을 대조할 수 있습니다."}},{"@type":"Question","name":"다른 치과에서 2차 소견을 받으려면 무엇을 챙겨야 하나요?","acceptedAnswer":{"@type":"Answer","text":"가장 중요한 것은 영상 자료 사본(파노라마·치근단 X-ray·CT)입니다. 여기에 치료 계획서·견적서, 이미 치료를 받았다면 진료비 세부내역서를 함께 가져가시면 됩니다. 자료 없이 가면 처음부터 다시 촬영하게 되어 비용도 방사선 노출도 중복됩니다. 이 자료들은 모두 환자 본인이 요청할 수 있으며, 사본 발급에는 소정의 수수료가 있을 수 있습니다."}},{"@type":"Question","name":"원래 다니던 치과에 자료를 달라고 하면 실례 아닌가요?","acceptedAnswer":{"@type":"Answer","text":"전혀 아닙니다. 본인의 진료기록과 영상 자료는 환자에게 열람·사본 발급을 청구할 권리가 있는 자료이며, 요청 사유를 설명할 의무도 없습니다. 의료기관 입장에서도 전원·2차 소견·보험 청구 등으로 자주 들어오는 요청입니다."}},{"@type":"Question","name":"두 치과의 치료 계획이 다르면 어느 쪽이 맞나요?","acceptedAnswer":{"@type":"Answer","text":"둘 다 의학적으로 타당한 경우가 많습니다. 차이는 대개 검사 범위, 치료 시점 기준, 계획의 시간 지평에서 나옵니다. '누가 맞나'보다 '차이가 왜 생겼는지 설명되는가'를 보시는 편이 정확합니다. 다른 병원을 단정적으로 깎아내리는 설명보다, 두 계획의 전제 차이를 짚어 주는 설명이 일반적으로 더 신뢰할 만합니다. 견적이 낮은 쪽이 정답인 것도 아닙니다."}},{"@type":"Question","name":"비급여 진료비가 병원마다 다른 건 정상인가요?","acceptedAnswer":{"@type":"Answer","text":"정상입니다. 임플란트·레진·크라운·교정 등 비급여 항목은 의료기관이 자율적으로 가격을 정합니다. 다만 같은 항목명이라도 사용 재료, 포함되는 검사·보철 범위, 보증 조건이 다를 수 있어 금액만 단순 비교하면 오해가 생깁니다. '이 가격에 무엇이 포함되어 있나요'를 함께 물어보시는 것이 정확한 비교 방법입니다."}},{"@type":"Question","name":"과잉진료가 의심되는데 어디에 문의하면 되나요?","acceptedAnswer":{"@type":"Answer","text":"사안의 성격에 따라 창구가 다릅니다. 건강보험 적용 진료의 본인부담금이 과다한지는 건강보험심사평가원의 진료비 확인 요청, 의료행위로 인한 피해·분쟁은 한국의료분쟁조정중재원, 비급여 진료비·환불 등 소비자 분쟁은 한국소비자원(1372), 의료법 위반 의심은 관할 보건소나 보건복지부(129)로 문의하실 수 있습니다. 어느 경로든 영수증·세부내역서·계획서·영상 자료 사본을 먼저 확보해 두시면 진행이 수월합니다."}},{"@type":"Question","name":"'오늘 결제하시면 할인' 같은 안내를 받았는데 괜찮은 건가요?","acceptedAnswer":{"@type":"Answer","text":"급성 통증·감염·외상 같은 응급 상황이 아니라면, 치과 치료 대부분은 며칠 생각할 시간을 가져도 되는 일입니다. 시간 압박이 의학적 근거가 아니라 결제 조건에 붙어 있다면, 서면 견적서를 받아 집에서 검토하신 뒤 결정하셔도 늦지 않습니다."}},{"@type":"Question","name":"라미네이트·임플란트 같은 특정 치료의 부작용이 걱정되는데요?","acceptedAnswer":{"@type":"Answer","text":"치료별로 실제 부작용과 후회 지점을 따로 정리해 두었습니다. 라미네이트, 임플란트, 교정, 신경치료 등 치료별 후회 백서 페이지에서 확인하실 수 있습니다. 치료를 받을지 결정하기 전에 부작용과 대안을 먼저 읽어 보시는 것이 후회를 줄이는 방법입니다."}},{"@type":"Question","name":"이미 치료를 다 받은 뒤인데, 지금 확인해도 의미가 있나요?","acceptedAnswer":{"@type":"Answer","text":"있습니다. 진료비 세부내역서로 실제 시행된 항목과 수량을 확인할 수 있고, 건강보험 적용 진료의 본인부담금이 과다했는지는 심사평가원의 진료비 확인 요청으로 사후에도 심사받을 수 있습니다. 이미 받은 치료의 이후 관리·보증·재치료 기준을 확인해 두는 것도 중요합니다."}}]}
</script>`

// --------------------------------------------
// 슬러그 → 강화 블록 매핑
// --------------------------------------------
export const BLOG_ENRICHMENTS: Record<string, BlogEnrichment> = {
  'dental-over-treatment-guide': { html: OT_BODY, jsonld: OT_JSONLD },
}

/**
 * 블로그 경로에서 슬러그를 뽑아 해당하는 강화 블록을 반환.
 * @param path  c.req.path (예: '/blog/dental-over-treatment-guide')
 */
export function getBlogEnrichment(path: string): BlogEnrichment | null {
  const slug = path.replace(/^\/blog\/?/, '').replace(/\/+$/, '').split('?')[0]
  if (!slug) return null
  return BLOG_ENRICHMENTS[slug] || null
}
