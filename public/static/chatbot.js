/**
 * 비디 AI 상담사 — 플로팅 챗봇 v4.0 (Chat-to-Book)
 * 서울비디치과 전용
 *
 * v4.0 변경사항:
 * - 🗓️ 채팅 내 원스톱 예약 퍼널 ([BOOKING_FORM] → 인라인 예약 폼)
 * - 대화 중 날짜/시간/이름/전화 입력 → 바로 예약 완료
 * - 예약 성공 시 확인 메시지 + 애니메이션
 *
 * v3.0: 🌍 다국어 자동 감지 + 응답 (한/영/중/일/베트남어)
 * v2.0: 모바일 하단 CTA 바와 겹침 방지, 자동 재시도, 에러 세분화
 */
(function() {
  'use strict';

  // 이미 초기화되었으면 중복 실행 방지
  if (window.__bdChatbot) return;
  window.__bdChatbot = true;

  // ─── 설정 ───
  var CONFIG = {
    apiUrl: '/api/chat',
    maxMessages: 40,
    greetingDelay: 500,
    typingDelay: 600,
    maxRetries: 2,        // 네트워크 오류 시 재시도 횟수
    retryDelay: 1500      // 재시도 간격 (ms)
  };

  // ─── 상태 ───
  var state = {
    isOpen: false,
    messages: [], // {role:'user'|'assistant', content:string}
    isTyping: false,
    bookingFormShown: false,  // 예약 폼 1회만 표시
    bookingSubmitted: false   // 예약 완료 여부
  };

  // ─── 모바일 하단 CTA 높이 감지 ───
  function getMobileBottomOffset() {
    var mobileCta = document.querySelector('.mobile-bottom-cta');
    if (mobileCta && window.getComputedStyle(mobileCta).display !== 'none') {
      return mobileCta.offsetHeight + 16; // CTA 높이 + 여백
    }
    return 24; // 데스크탑 기본값
  }

  // ─── HTML 삽입 ───
  function createUI() {
    // 스타일
    var style = document.createElement('style');
    style.id = 'bd-chatbot-styles';
    style.textContent =
      // 플로팅 버튼 — 데스크탑: floating-cta 위에 배치
      '#bd-chat-fab{position:fixed;bottom:200px;right:24px;z-index:9998;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;font-size:1.5rem;box-shadow:0 4px 24px rgba(107,66,38,0.4),0 0 0 3px rgba(200,169,126,0.2);transition:all .3s cubic-bezier(.22,1,.36,1);-webkit-tap-highlight-color:transparent;}' +
      '#bd-chat-fab:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(107,66,38,0.5),0 0 0 4px rgba(200,169,126,0.3);}' +
      '#bd-chat-fab.open{transform:rotate(90deg) scale(0.9);background:rgba(107,66,38,0.8);}' +
      '#bd-chat-fab .fab-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#e74c3c;display:none;align-items:center;justify-content:center;font-size:0.6rem;font-weight:800;color:#fff;border:2px solid #fff;}' +

      // 채팅 창
      '#bd-chat-window{position:fixed;bottom:270px;right:24px;z-index:9999;width:380px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 200px);border-radius:20px;overflow:hidden;display:none;flex-direction:column;background:#faf9f7;box-shadow:0 20px 60px rgba(0,0,0,0.2),0 0 0 1px rgba(200,169,126,0.15);transform:translateY(20px) scale(0.95);opacity:0;transition:all .35s cubic-bezier(.22,1,.36,1);}' +
      '#bd-chat-window.open{display:flex;transform:translateY(0) scale(1);opacity:1;}' +

      // 헤더
      '.bd-chat-header{padding:18px 20px;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;display:flex;align-items:center;gap:12px;flex-shrink:0;}' +
      '.bd-chat-avatar{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;border:2px solid rgba(255,255,255,0.25);flex-shrink:0;}' +
      '.bd-chat-header-info h4{margin:0;font-size:0.95rem;font-weight:700;letter-spacing:-0.01em;}' +
      '.bd-chat-header-info p{margin:2px 0 0;font-size:0.72rem;opacity:0.75;font-weight:400;}' +
      '.bd-chat-header-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,0.7);font-size:1.1rem;cursor:pointer;padding:4px;transition:color .2s;-webkit-tap-highlight-color:transparent;}' +
      '.bd-chat-header-close:hover{color:#fff;}' +

      // 메시지 영역
      '.bd-chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}' +
      '.bd-chat-body::-webkit-scrollbar{width:4px;}' +
      '.bd-chat-body::-webkit-scrollbar-thumb{background:rgba(200,169,126,0.3);border-radius:4px;}' +

      // 메시지 버블
      '.bd-msg{display:flex;gap:8px;max-width:88%;animation:bdMsgIn .3s cubic-bezier(.22,1,.36,1);}' +
      '.bd-msg-user{align-self:flex-end;flex-direction:row-reverse;}' +
      '.bd-msg-avatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;flex-shrink:0;margin-top:2px;}' +
      '.bd-msg-bot .bd-msg-avatar{background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;}' +
      '.bd-msg-user .bd-msg-avatar{background:#e8e2d9;color:#6B4226;}' +
      '.bd-msg-bubble{padding:10px 14px;border-radius:16px;font-size:0.88rem;line-height:1.6;word-break:keep-all;overflow-wrap:break-word;}' +
      '.bd-msg-bot .bd-msg-bubble{background:#fff;color:#2c2419;border:1px solid rgba(200,169,126,0.15);border-top-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.04);}' +
      '.bd-msg-user .bd-msg-bubble{background:linear-gradient(135deg,#6B4226,#7a5332);color:#fff;border-top-right-radius:4px;}' +
      '.bd-msg-bubble a{color:#C8A97E;text-decoration:underline;font-weight:600;}' +
      '.bd-msg-user .bd-msg-bubble a{color:#e8d5b8;}' +

      // 재시도 버튼
      '.bd-retry-btn{display:inline-flex;align-items:center;gap:4px;margin-top:8px;padding:6px 14px;background:rgba(107,66,38,0.08);border:1px solid rgba(107,66,38,0.2);border-radius:20px;color:#6B4226;font-size:0.78rem;font-weight:600;cursor:pointer;transition:all .2s;}' +
      '.bd-retry-btn:hover{background:rgba(107,66,38,0.15);border-color:#6B4226;}' +
      '.bd-retry-btn i{font-size:0.7rem;}' +

      // 타이핑 인디케이터
      '.bd-typing{display:flex;gap:8px;max-width:88%;align-items:flex-end;}' +
      '.bd-typing .bd-msg-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;flex-shrink:0;}' +
      '.bd-typing-dots{padding:12px 16px;background:#fff;border-radius:16px;border-top-left-radius:4px;border:1px solid rgba(200,169,126,0.15);display:flex;gap:4px;align-items:center;}' +
      '.bd-typing-dot{width:6px;height:6px;border-radius:50%;background:#C8A97E;animation:bdDot 1.2s infinite;}' +
      '.bd-typing-dot:nth-child(2){animation-delay:.15s;}' +
      '.bd-typing-dot:nth-child(3){animation-delay:.3s;}' +

      // 퀵 버튼
      '.bd-quick-btns{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px;}' +
      '.bd-quick-btn{padding:7px 14px;border-radius:50px;border:1px solid rgba(200,169,126,0.35);background:rgba(200,169,126,0.08);color:#6B4226;font-size:0.78rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;-webkit-tap-highlight-color:transparent;}' +
      '.bd-quick-btn:hover{background:rgba(200,169,126,0.2);border-color:#C8A97E;}' +

      // 입력 영역
      '.bd-chat-input{padding:12px 16px;border-top:1px solid rgba(200,169,126,0.12);display:flex;gap:8px;align-items:flex-end;background:#fff;flex-shrink:0;}' +
      '.bd-chat-input textarea{flex:1;border:1px solid rgba(200,169,126,0.2);border-radius:12px;padding:10px 14px;font-size:0.88rem;resize:none;outline:none;font-family:inherit;max-height:100px;min-height:40px;line-height:1.4;transition:border-color .2s;background:#faf9f7;}' +
      '.bd-chat-input textarea:focus{border-color:#C8A97E;}' +
      '.bd-chat-input textarea::placeholder{color:rgba(107,66,38,0.35);}' +
      '.bd-chat-send{width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;font-size:1rem;transition:all .2s;flex-shrink:0;-webkit-tap-highlight-color:transparent;}' +
      '.bd-chat-send:hover{transform:scale(1.06);box-shadow:0 2px 12px rgba(107,66,38,0.35);}' +
      '.bd-chat-send:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none;}' +

      // 브랜딩
      '.bd-chat-brand{text-align:center;padding:4px;font-size:0.62rem;color:rgba(107,66,38,0.25);background:#fff;flex-shrink:0;}' +

      // 인라인 예약 폼 — 컴팩트 디자인 (스크롤 없이 전체 표시)
      '.bd-booking-form{background:linear-gradient(135deg,#faf5ee,#f5ede0);border:1px solid rgba(200,169,126,0.35);border-radius:12px;padding:12px;margin:8px 0;animation:bdMsgIn .4s ease;width:100%;box-sizing:border-box;}' +
      '.bd-booking-form h5{margin:0 0 8px;font-size:.82rem;font-weight:700;color:#6B4226;display:flex;align-items:center;gap:5px;}' +
      '.bd-booking-row{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;}' +
      '.bd-booking-row.full{grid-template-columns:1fr;}' +
      '.bd-booking-field{display:flex;flex-direction:column;gap:2px;}' +
      '.bd-booking-field label{font-size:.65rem;font-weight:600;color:#8B5E3C;letter-spacing:.3px;}' +
      '.bd-booking-field input,.bd-booking-field select{padding:7px 9px;border:1px solid rgba(200,169,126,0.3);border-radius:7px;font-size:.8rem;font-family:inherit;background:#fff;color:#2c2419;outline:none;transition:border-color .2s;-webkit-appearance:none;height:34px;box-sizing:border-box;}' +
      '.bd-booking-field input:focus,.bd-booking-field select:focus{border-color:#C8A97E;box-shadow:0 0 0 2px rgba(200,169,126,0.15);}' +
      '.bd-booking-field input::placeholder{color:rgba(107,66,38,0.3);}' +
      '.bd-booking-submit{width:100%;padding:9px;border:none;border-radius:8px;background:linear-gradient(135deg,#6B4226,#8B5E3C);color:#fff;font-size:.84rem;font-weight:700;cursor:pointer;margin-top:4px;transition:all .2s;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;}' +
      '.bd-booking-submit:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(107,66,38,0.3);}' +
      '.bd-booking-submit:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}' +
      '.bd-booking-submit .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;display:none;}' +
      '@keyframes spin{to{transform:rotate(360deg)}}' +
      '.bd-booking-success{text-align:center;padding:14px 10px;animation:bdMsgIn .4s ease;}' +
      '.bd-booking-success .check-icon{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin:0 auto 8px;animation:bdPop .5s cubic-bezier(.22,1,.36,1);}' +
      '.bd-booking-success h5{font-size:.88rem;font-weight:700;color:#22c55e;margin:0 0 4px;}' +
      '.bd-booking-success p{font-size:.76rem;color:#6B4226;margin:0;line-height:1.4;}' +
      '@keyframes bdPop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}' +
      '.bd-booking-error{font-size:.75rem;color:#e74c3c;margin-top:4px;display:none;}' +

      // 애니메이션
      '@keyframes bdMsgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}' +
      '@keyframes bdDot{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-6px);opacity:1}}' +

      // ─── 모바일 반응형 ───
      // mobile-bottom-cta 높이(~72px) + safe-area + 여백 확보
      // 1024px 이하에서 mobile-bottom-cta가 display:grid 됨
      '@media(max-width:1024px){' +
        '#bd-chat-fab{bottom:90px;right:16px;width:52px;height:52px;font-size:1.2rem;z-index:9998;}' +
      '}' +
      // 500px 이하 모바일: 채팅창 풀스크린
      '@media(max-width:500px){' +
        '#bd-chat-window{bottom:0;right:0;left:0;width:100%;max-width:100%;height:100%;max-height:100%;border-radius:0;z-index:10000;}' +
      '}';
    document.head.appendChild(style);

    // 플로팅 버튼
    var fab = document.createElement('button');
    fab.id = 'bd-chat-fab';
    fab.setAttribute('aria-label', 'AI 상담 열기');
    fab.innerHTML = '<i class="fas fa-comment-dots"></i><span class="fab-badge" id="bdFabBadge">1</span>';
    document.body.appendChild(fab);

    // 채팅 창
    var win = document.createElement('div');
    win.id = 'bd-chat-window';
    win.innerHTML =
      '<div class="bd-chat-header">' +
        '<div class="bd-chat-avatar">\uD83E\uDDB7</div>' +
        '<div class="bd-chat-header-info">' +
          '<h4>\uBE44\uB514 AI \uC0C1\uB2F4\uC0AC</h4>' +
          '<p>Seoul BD Dental \u00B7 24/7 Multilingual</p>' +
        '</div>' +
        '<button class="bd-chat-header-close" aria-label="\uB2EB\uAE30"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="bd-chat-body" id="bdChatBody"></div>' +
      '<div class="bd-quick-btns" id="bdQuickBtns"></div>' +
      '<div class="bd-chat-input">' +
        '<textarea id="bdChatInput" rows="1" placeholder="' + getPlaceholder() + '" maxlength="1000"></textarea>' +
        '<button class="bd-chat-send" id="bdChatSend" aria-label="\uC804\uC1A1"><i class="fas fa-paper-plane"></i></button>' +
      '</div>' +
      '<div class="bd-chat-brand">Powered by \uC11C\uC6B8\uBE44\uB514\uCE58\uACFC AI</div>';
    document.body.appendChild(win);

    // 모바일에서 FAB 위치 동적 보정
    adjustFabPosition();
    window.addEventListener('resize', adjustFabPosition);

    return { fab: fab, win: win };
  }

  // ─── FAB 위치 동적 조정 ───
  function adjustFabPosition() {
    var fab = document.getElementById('bd-chat-fab');
    if (!fab) return;

    // 모바일에서만 동적 계산 (1024px 이하)
    if (window.innerWidth <= 1024) {
      var offset = getMobileBottomOffset();
      fab.style.bottom = offset + 'px';
    } else {
      fab.style.bottom = ''; // CSS 기본값 사용 (200px)
    }
  }

  // ─── 다국어 감지 ───
  function detectLang() {
    // 1. Weglot 현재 언어 감지
    if (window.Weglot && typeof Weglot.getCurrentLang === 'function') {
      var wl = Weglot.getCurrentLang();
      if (wl && wl !== 'ko') return wl; // en, zh, ja, vi 등
    }
    // 2. URL 파라미터 (?lang=en)
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) return urlLang;
    // 3. 브라우저 언어
    var bl = (navigator.language || '').toLowerCase();
    if (bl.startsWith('en')) return 'en';
    if (bl.startsWith('zh')) return 'zh';
    if (bl.startsWith('ja')) return 'ja';
    if (bl.startsWith('vi')) return 'vi';
    return 'ko';
  }

  // ─── 다국어 인사말 ───
  var GREETINGS = {
    ko: '안녕하세요! 서울비디치과 AI 상담사 비디입니다 😊\n\n진료, 예약, 비용 등 궁금한 점을 편하게 물어보세요.',
    en: 'Hello! I\'m BD, the AI consultant at Seoul BD Dental 😊\n\nFeel free to ask about treatments, appointments, or costs.\nI can answer in English!',
    zh: '您好！我是首尔BD牙科的AI顾问BD 😊\n\n欢迎咨询诊疗、预约、费用等问题。\n我可以用中文回答！',
    ja: 'こんにちは！ソウルBD歯科のAIカウンセラーBDです 😊\n\n治療、予約、費用など、お気軽にご質問ください。\n日本語でお答えします！',
    vi: 'Xin chào! Tôi là BD, tư vấn viên AI của Seoul BD Dental 😊\n\nHãy thoải mái hỏi về điều trị, đặt lịch hoặc chi phí.\nTôi có thể trả lời bằng tiếng Việt!'
  };

  // ─── 다국어 플레이스홀더 ───
  function getPlaceholder() {
    var lang = detectLang();
    var placeholders = {
      ko: '궁금한 점을 물어보세요...',
      en: 'Ask me anything...',
      zh: '请输入您的问题...',
      ja: 'ご質問をどうぞ...',
      vi: 'Hãy đặt câu hỏi...'
    };
    return placeholders[lang] || placeholders.en;
  }

  // ─── 퀵 버튼 (다국어) ───
  var QUICK_QUESTIONS_MAP = {
    ko: [
      { label: '진료시간', text: '진료시간이 어떻게 되나요?' },
      { label: '오시는 길', text: '서울비디치과 위치가 어디인가요?' },
      { label: '임플란트', text: '임플란트 상담 받고 싶어요' },
      { label: '교정/인비절라인', text: '인비절라인 교정 상담 가능할까요?' },
      { label: '글로우네이트', text: '글로우네이트가 뭔가요?' },
      { label: '비용 안내', text: '치료 비용이 궁금해요' },
      { label: '예약하기', text: '상담 예약하고 싶어요' }
    ],
    en: [
      { label: 'Hours', text: 'What are your business hours?' },
      { label: 'Location', text: 'Where is Seoul BD Dental located?' },
      { label: 'Implant', text: 'I want to consult about dental implants' },
      { label: 'Invisalign', text: 'Can I get Invisalign consultation?' },
      { label: 'Glownate', text: 'What is Glownate (veneer)?' },
      { label: 'Pricing', text: 'How much do treatments cost?' },
      { label: 'Book Now', text: 'I want to make an appointment' }
    ],
    zh: [
      { label: '营业时间', text: '请问营业时间是什么时候？' },
      { label: '位置', text: '请问牙科在哪里？' },
      { label: '种植牙', text: '我想咨询种植牙' },
      { label: '隐适美', text: '可以咨询隐适美矫正吗？' },
      { label: '贴面', text: 'Glownate贴面是什么？' },
      { label: '费用', text: '治疗费用大概多少？' },
      { label: '预约', text: '我想预约咨询' }
    ],
    ja: [
      { label: '診療時間', text: '診療時間を教えてください' },
      { label: 'アクセス', text: '歯科医院の場所はどこですか？' },
      { label: 'インプラント', text: 'インプラントの相談をしたいです' },
      { label: 'インビザライン', text: 'インビザライン矯正の相談はできますか？' },
      { label: 'グロウネイト', text: 'グロウネイト（ラミネート）とは何ですか？' },
      { label: '費用', text: '治療費用はどのくらいですか？' },
      { label: '予約', text: '相談の予約をしたいです' }
    ],
    vi: [
      { label: 'Giờ làm việc', text: 'Giờ làm việc của phòng khám là gì?' },
      { label: 'Vị trí', text: 'Phòng khám ở đâu?' },
      { label: 'Implant', text: 'Tôi muốn tư vấn về cấy ghép implant' },
      { label: 'Invisalign', text: 'Tôi có thể tư vấn niềng răng Invisalign không?' },
      { label: 'Glownate', text: 'Glownate (mặt dán sứ) là gì?' },
      { label: 'Chi phí', text: 'Chi phí điều trị khoảng bao nhiêu?' },
      { label: 'Đặt lịch', text: 'Tôi muốn đặt lịch hẹn' }
    ]
  };

  function getQuickQuestions() {
    var lang = detectLang();
    return QUICK_QUESTIONS_MAP[lang] || QUICK_QUESTIONS_MAP.en;
  }

  var QUICK_QUESTIONS = getQuickQuestions();

  function renderQuickBtns() {
    var container = document.getElementById('bdQuickBtns');
    if (!container) return;
    // 대화가 시작되면 퀵 버튼 숨김
    if (state.messages.length > 1) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';
    container.innerHTML = '';
    QUICK_QUESTIONS.forEach(function(q) {
      var btn = document.createElement('button');
      btn.className = 'bd-quick-btn';
      btn.textContent = q.label;
      btn.addEventListener('click', function() {
        sendMessage(q.text);
      });
      container.appendChild(btn);
    });
  }

  // ─── 메시지 렌더링 ───
  function renderMessage(msg, options) {
    var body = document.getElementById('bdChatBody');
    if (!body) return;

    var div = document.createElement('div');
    div.className = 'bd-msg bd-msg-' + (msg.role === 'user' ? 'user' : 'bot');

    var avatar = document.createElement('div');
    avatar.className = 'bd-msg-avatar';
    avatar.textContent = msg.role === 'user' ? '\uD83D\uDC64' : '\uD83E\uDDB7';

    var bubble = document.createElement('div');
    bubble.className = 'bd-msg-bubble';
    bubble.innerHTML = formatText(msg.content);

    // [BOOKING_FORM] 처리 — 인라인 예약 폼을 별도 전폭 블록으로 삽입
    var shouldShowBookingForm = msg.role === 'assistant' && hasBookingForm(msg.content) && !state.bookingFormShown;

    // 에러 메시지에 재시도 버튼 추가
    if (options && options.showRetry && options.retryText) {
      var retryBtn = document.createElement('button');
      retryBtn.className = 'bd-retry-btn';
      retryBtn.innerHTML = '<i class="fas fa-redo"></i> \uB2E4\uC2DC \uC2DC\uB3C4';
      retryBtn.addEventListener('click', function() {
        var lastMsg = state.messages[state.messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          state.messages.pop();
          div.remove();
        }
        sendMessage(options.retryText);
      });
      bubble.appendChild(retryBtn);
    }

    div.appendChild(avatar);
    div.appendChild(bubble);
    body.appendChild(div);

    // 예약 폼은 메시지 버블 밖에, 채팅 바디 전폭으로 삽입
    if (shouldShowBookingForm) {
      state.bookingFormShown = true;
      var formWrapper = document.createElement('div');
      formWrapper.style.cssText = 'width:100%;padding:0 4px;box-sizing:border-box;animation:bdMsgIn .4s ease;';
      formWrapper.innerHTML = createBookingFormHTML();
      body.appendChild(formWrapper);
      setTimeout(function() { bindBookingForm(formWrapper); }, 50);
    }

    scrollToBottom();
  }

  // ─── 인라인 예약 폼 HTML ───
  function createBookingFormHTML() {
    // 내일부터 14일간 날짜 옵션
    var dateOptions = '';
    for (var i = 1; i <= 14; i++) {
      var d = new Date();
      d.setDate(d.getDate() + i);
      var dayNames = ['\uc77c','\uc6d4','\ud654','\uc218','\ubaa9','\uae08','\ud1a0'];
      var label = (d.getMonth()+1) + '/' + d.getDate() + ' (' + dayNames[d.getDay()] + ')';
      var val = d.toISOString().slice(0,10);
      dateOptions += '<option value="' + val + '">' + label + '</option>';
    }

    // 시간 옵션 (09~19시 30분 간격)
    var timeOptions = '';
    for (var h = 9; h <= 19; h++) {
      for (var m = 0; m < 60; m += 30) {
        if (h === 19 && m > 0) break;
        var hh = h < 10 ? '0'+h : ''+h;
        var mm = m === 0 ? '00' : '30';
        timeOptions += '<option value="' + hh + ':' + mm + '">' + hh + ':' + mm + '</option>';
      }
    }

    return '<div class="bd-booking-form" id="bdBookingForm">' +
      '<h5>\uD83D\uDCC5 \uBE60\uB978 \uC608\uC57D</h5>' +
      '<div class="bd-booking-row">' +
        '<div class="bd-booking-field">' +
          '<label>\uD76C\uB9DD \ub0a0\uc9dc</label>' +
          '<select id="bdBookDate">' + dateOptions + '</select>' +
        '</div>' +
        '<div class="bd-booking-field">' +
          '<label>\uD76C\uB9DD \uc2dc\uac04</label>' +
          '<select id="bdBookTime">' + timeOptions + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="bd-booking-row">' +
        '<div class="bd-booking-field">' +
          '<label>\uc131\ud568</label>' +
          '<input type="text" id="bdBookName" placeholder="\ud64d\uae38\ub3d9" maxlength="20" autocomplete="name">' +
        '</div>' +
        '<div class="bd-booking-field">' +
          '<label>\uc5f0\ub77d\ucc98</label>' +
          '<input type="tel" id="bdBookPhone" placeholder="010-1234-5678" maxlength="13" autocomplete="tel">' +
        '</div>' +
      '</div>' +
      '<div class="bd-booking-row full">' +
        '<div class="bd-booking-field">' +
          '<label>\uad00\uc2ec \uce58\ub8cc (\uc120\ud0dd)</label>' +
          '<select id="bdBookTreatment">' +
            '<option value="">선택해주세요</option>' +
            '<option value="implant">\uc784\ud50c\ub780\ud2b8</option>' +
            '<option value="invisalign">\uc778\ube44\uc838\ub77c\uc778 \uad50\uc815</option>' +
            '<option value="glownate">\uae00\ub85c\uc6b0\ub124\uc774\ud2b8 (\ub77c\ubbf8\ub124\uc774\ud2b8)</option>' +
            '<option value="whitening">\ubbf8\ubc31</option>' +
            '<option value="general">\uc77c\ubc18\uc9c4\ub8cc</option>' +
            '<option value="pediatric">\uc18c\uc544\uce58\uacfc</option>' +
            '<option value="root-canal">\uc2e0\uacbd\uce58\ub8cc</option>' +
            '<option value="checkup">\uac80\uc9c4</option>' +
            '<option value="etc">\uae30\ud0c0 / \uc0c1\ub2f4</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="bd-booking-error" id="bdBookError"></div>' +
      '<button class="bd-booking-submit" id="bdBookSubmit" type="button">' +
        '<span class="spinner" id="bdBookSpinner"></span>' +
        '<span id="bdBookSubmitText">\uC608\uC57D \uC644\uB8CC\uD558\uAE30</span>' +
      '</button>' +
    '</div>';
  }

  // ─── 예약 폼 이벤트 바인딩 ───
  function bindBookingForm(bubble) {
    var form = bubble.querySelector('#bdBookingForm');
    if (!form) return;

    var submitBtn = form.querySelector('#bdBookSubmit');
    if (!submitBtn) return;

    // 전화번호 자동 하이픈
    var phoneInput = form.querySelector('#bdBookPhone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function() {
        var v = this.value.replace(/[^0-9]/g, '');
        if (v.length > 3 && v.length <= 7) {
          this.value = v.slice(0,3) + '-' + v.slice(3);
        } else if (v.length > 7) {
          this.value = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7,11);
        } else {
          this.value = v;
        }
      });
    }

    submitBtn.addEventListener('click', function() {
      submitBooking(form, bubble);
    });
  }

  // ─── 예약 제출 ───
  function submitBooking(form, bubble) {
    var date = form.querySelector('#bdBookDate').value;
    var time = form.querySelector('#bdBookTime').value;
    var name = (form.querySelector('#bdBookName').value || '').trim();
    var phone = (form.querySelector('#bdBookPhone').value || '').trim();
    var treatment = form.querySelector('#bdBookTreatment').value || 'etc';
    var errEl = form.querySelector('#bdBookError');
    var btn = form.querySelector('#bdBookSubmit');
    var spinner = form.querySelector('#bdBookSpinner');
    var btnText = form.querySelector('#bdBookSubmitText');

    // 유효성 검사
    if (!name) { showBookError(errEl, '\uc131\ud568\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.'); return; }
    if (!phone || !/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.replace(/-/g, ''))) {
      showBookError(errEl, '\uc62c\ubc14\ub978 \ud734\ub300\ud3f0 \ubc88\ud638\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694.'); return;
    }

    // 로딩
    btn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = '\uc608\uc57d \ucc98\ub9ac\uc911...';
    errEl.style.display = 'none';

    fetch('/api/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        treatment: treatment,
        date: date,
        time: time,
        name: name,
        phone: phone,
        message: '\uCC57\uBD07 \uC608\uC57D',
        marketingConsent: false,
        source: 'chatbot'
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        state.bookingSubmitted = true;
        // 폼을 성공 UI로 교체
        form.innerHTML = '<div class="bd-booking-success">' +
          '<div class="check-icon"><i class="fas fa-check"></i></div>' +
          '<h5>\uC608\uC57D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!</h5>' +
          '<p><strong>' + name + '</strong>\uB2D8, ' + date + ' ' + time + '\uC5D0<br>\uC11C\uC6B8\uBE44\uB514\uCE58\uACFC\uC5D0\uC11C \uBF59\uACA0\uC2B5\uB2C8\uB2E4 \uD83D\uDE0A</p>' +
          '<p style="font-size:.72rem;color:rgba(107,66,38,.5);margin-top:8px">\uC608\uC57D \uD655\uC778 \uC5F0\uB77D\uC744 \uB4DC\uB9B4\uAC8C\uC694!</p>' +
        '</div>';
        scrollToBottom();

        // AI에게도 예약 성공 알림 (대화 맥락 유지)
        state.messages.push({
          role: 'assistant',
          content: name + '님 예약이 완료되었습니다. ' + date + ' ' + time + '에 뵙겠습니다. 궁금한 점이 더 있으시면 편하게 물어보세요!'
        });
      } else {
        showBookError(errEl, data.error || '\uc608\uc57d \ucc98\ub9ac \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.');
        btn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = '\uc608\uc57d \uc644\ub8cc\ud558\uae30';
      }
    })
    .catch(function() {
      showBookError(errEl, '\ub124\ud2b8\uc6cc\ud06c \uc624\ub958\uc785\ub2c8\ub2e4. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574\uc8fc\uc138\uc694.');
      btn.disabled = false;
      spinner.style.display = 'none';
      btnText.textContent = '\uc608\uc57d \uc644\ub8cc\ud558\uae30';
    });
  }

  function showBookError(el, msg) {
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function formatText(text) {
    // [BOOKING_FORM] 태그 제거 (별도로 처리)
    var html = text.replace(/\[BOOKING_FORM\]/g, '');
    // 줄바꿈 → <br>
    html = html.replace(/\n/g, '<br>');
    // URL → 링크
    html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    // 전화번호 → 링크
    html = html.replace(/(041-415-2892)/g, '<a href="tel:0414152892">$1</a>');
    // **굵게**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // --- 구분선 제거 (깔끔하게)
    html = html.replace(/<br>---<br>/g, '<br>');
    return html;
  }

  // 예약 폼 포함 여부 확인
  function hasBookingForm(text) {
    return text.indexOf('[BOOKING_FORM]') !== -1;
  }

  function showTyping() {
    var body = document.getElementById('bdChatBody');
    if (!body || document.getElementById('bdTyping')) return;
    var div = document.createElement('div');
    div.className = 'bd-typing';
    div.id = 'bdTyping';
    div.innerHTML =
      '<div class="bd-msg-avatar">\uD83E\uDDB7</div>' +
      '<div class="bd-typing-dots"><div class="bd-typing-dot"></div><div class="bd-typing-dot"></div><div class="bd-typing-dot"></div></div>';
    body.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById('bdTyping');
    if (el) el.remove();
  }

  function scrollToBottom() {
    var body = document.getElementById('bdChatBody');
    if (body) {
      requestAnimationFrame(function() {
        body.scrollTop = body.scrollHeight;
      });
    }
  }

  // ─── API 호출 (재시도 지원) ───
  function callChatAPI(apiMessages, retryCount) {
    retryCount = retryCount || 0;

    return fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages })
    })
    .then(function(res) {
      if (res.ok) return res.json();

      // 상태 코드별 세분화된 처리
      if (res.status === 500 || res.status === 502 || res.status === 503) {
        // 서버 오류는 재시도 가능
        if (retryCount < CONFIG.maxRetries) {
          return new Promise(function(resolve) {
            setTimeout(function() {
              resolve(callChatAPI(apiMessages, retryCount + 1));
            }, CONFIG.retryDelay * (retryCount + 1));
          });
        }
      }

      // 재시도 불가능한 에러 또는 재시도 초과
      return res.json().catch(function() { return {}; }).then(function(data) {
        var error = new Error(data.error || 'API error: ' + res.status);
        error.status = res.status;
        error.serverMessage = data.error;
        throw error;
      });
    });
  }

  function sendMessage(text) {
    if (!text || !text.trim() || state.isTyping) return;
    text = text.trim();

    // 유저 메시지 추가
    state.messages.push({ role: 'user', content: text });
    renderMessage({ role: 'user', content: text });
    renderQuickBtns(); // 퀵 버튼 숨김

    // 입력 초기화
    var input = document.getElementById('bdChatInput');
    if (input) { input.value = ''; input.style.height = 'auto'; }

    state.isTyping = true;
    updateSendBtn();
    showTyping();

    // API 요청 — 최근 대화 내역 전송
    var apiMessages = state.messages.slice(-CONFIG.maxMessages).map(function(m) {
      return { role: m.role, content: m.content };
    });

    var originalText = text; // 재시도용 보존

    callChatAPI(apiMessages)
    .then(function(data) {
      hideTyping();
      var reply = data.reply || '\uC8C4\uC1A1\uD569\uB2C8\uB2E4, \uC751\uB2F5\uC744 \uC0DD\uC131\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.';
      state.messages.push({ role: 'assistant', content: reply });
      renderMessage({ role: 'assistant', content: reply });
    })
    .catch(function(err) {
      hideTyping();
      console.error('Chat error:', err);

      var errorMsg;
      var showRetry = true;

      if (err.status === 400) {
        errorMsg = '\uBA54\uC2DC\uC9C0\uB97C \uB2E4\uC2DC \uC785\uB825\uD574 \uC8FC\uC138\uC694.';
        showRetry = false;
      } else if (err.status === 500 && err.serverMessage && err.serverMessage.indexOf('\uC900\uBE44 \uC911') !== -1) {
        errorMsg = 'AI \uC0C1\uB2F4 \uC11C\uBE44\uC2A4\uAC00 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4.\n\uC804\uD654(041-415-2892)\uB85C \uBB38\uC758\uD574 \uC8FC\uC138\uC694.';
        showRetry = false;
      } else if (err.message && err.message.indexOf('Failed to fetch') !== -1) {
        errorMsg = '\uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.\nWi-Fi \uB610\uB294 \uB370\uC774\uD130 \uC5F0\uACB0 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uBCF4\uC138\uC694.';
      } else {
        errorMsg = '\uC7A0\uC2DC \uC5F0\uACB0\uC774 \uC6D0\uD65C\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.\n\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2DC\uAC70\uB098, \uC804\uD654(041-415-2892)\uB85C \uBB38\uC758\uD574 \uC8FC\uC138\uC694.';
      }

      state.messages.push({ role: 'assistant', content: errorMsg });
      renderMessage(
        { role: 'assistant', content: errorMsg },
        { showRetry: showRetry, retryText: originalText }
      );
    })
    .finally(function() {
      state.isTyping = false;
      updateSendBtn();
    });
  }

  function updateSendBtn() {
    var btn = document.getElementById('bdChatSend');
    if (btn) btn.disabled = state.isTyping;
  }

  // ─── 토글 ───
  function toggleChat() {
    state.isOpen = !state.isOpen;
    var win = document.getElementById('bd-chat-window');
    var fab = document.getElementById('bd-chat-fab');
    if (!win || !fab) return;

    if (state.isOpen) {
      win.classList.add('open');
      fab.classList.add('open');
      fab.innerHTML = '<i class="fas fa-times"></i>';
      // 뱃지 숨김
      var badge = document.getElementById('bdFabBadge');
      if (badge) badge.style.display = 'none';
      // 첫 오픈 시 인사
      if (state.messages.length === 0) {
        setTimeout(function() {
          var lang = detectLang();
          var greeting = GREETINGS[lang] || GREETINGS.en;
          // 퀵 버튼도 현재 언어에 맞게 갱신
          QUICK_QUESTIONS = getQuickQuestions();
          state.messages.push({ role: 'assistant', content: greeting });
          renderMessage({ role: 'assistant', content: greeting });
          renderQuickBtns();
        }, CONFIG.greetingDelay);
      }
      // 포커스
      setTimeout(function() {
        var input = document.getElementById('bdChatInput');
        if (input) input.focus();
      }, 400);
    } else {
      win.classList.remove('open');
      fab.classList.remove('open');
      fab.innerHTML = '<i class="fas fa-comment-dots"></i><span class="fab-badge" id="bdFabBadge" style="display:none"></span>';
    }
  }

  // ─── 이벤트 바인딩 ───
  function bindEvents(els) {
    // 플로팅 버튼 클릭
    els.fab.addEventListener('click', toggleChat);

    // 닫기 버튼
    els.win.querySelector('.bd-chat-header-close').addEventListener('click', toggleChat);

    // 전송 버튼
    document.getElementById('bdChatSend').addEventListener('click', function() {
      var input = document.getElementById('bdChatInput');
      if (input) sendMessage(input.value);
    });

    // Enter 키 (Shift+Enter는 줄바꿈)
    document.getElementById('bdChatInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(this.value);
      }
    });

    // textarea 자동 높이
    document.getElementById('bdChatInput').addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // ESC로 닫기
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.isOpen) toggleChat();
    });
  }

  // ─── 초기화 ───
  function init() {
    // admin 페이지에서는 챗봇 미표시
    if (window.location.pathname.startsWith('/admin')) return;

    var els = createUI();
    bindEvents(els);
    renderQuickBtns();

    // 3초 후 뱃지 표시 (알림 효과)
    setTimeout(function() {
      var badge = document.getElementById('bdFabBadge');
      if (badge && !state.isOpen) {
        badge.style.display = 'flex';
      }
    }, 3000);
  }

  // DOM 준비 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
