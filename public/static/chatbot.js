/**
 * 비디 AI 상담사 — 플로팅 챗봇 v1.0
 * 서울비디치과 전용
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
    typingDelay: 600
  };

  // ─── 상태 ───
  var state = {
    isOpen: false,
    messages: [], // {role:'user'|'assistant', content:string}
    isTyping: false
  };

  // ─── HTML 삽입 ───
  function createUI() {
    // 스타일
    var style = document.createElement('style');
    style.id = 'bd-chatbot-styles';
    style.textContent =
      // 플로팅 버튼
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

      // 애니메이션
      '@keyframes bdMsgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}' +
      '@keyframes bdDot{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-6px);opacity:1}}' +

      // 모바일 반응형
      '@media(max-width:500px){' +
        '#bd-chat-window{bottom:0;right:0;left:0;width:100%;max-width:100%;height:100%;max-height:100%;border-radius:0;}' +
        '#bd-chat-fab{bottom:80px;right:16px;width:54px;height:54px;font-size:1.3rem;}' +
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
        '<div class="bd-chat-avatar">🦷</div>' +
        '<div class="bd-chat-header-info">' +
          '<h4>비디 AI 상담사</h4>' +
          '<p>서울비디치과 · 24시간 응답</p>' +
        '</div>' +
        '<button class="bd-chat-header-close" aria-label="닫기"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="bd-chat-body" id="bdChatBody"></div>' +
      '<div class="bd-quick-btns" id="bdQuickBtns"></div>' +
      '<div class="bd-chat-input">' +
        '<textarea id="bdChatInput" rows="1" placeholder="궁금한 점을 물어보세요..." maxlength="1000"></textarea>' +
        '<button class="bd-chat-send" id="bdChatSend" aria-label="전송"><i class="fas fa-paper-plane"></i></button>' +
      '</div>' +
      '<div class="bd-chat-brand">Powered by 서울비디치과 AI</div>';
    document.body.appendChild(win);

    return { fab: fab, win: win };
  }

  // ─── 퀵 버튼 ───
  var QUICK_QUESTIONS = [
    { label: '진료시간', text: '진료시간이 어떻게 되나요?' },
    { label: '오시는 길', text: '서울비디치과 위치가 어디인가요?' },
    { label: '임플란트', text: '임플란트 상담 받고 싶어요' },
    { label: '교정/인비절라인', text: '인비절라인 교정 상담 가능할까요?' },
    { label: '글로우네이트', text: '글로우네이트가 뭔가요?' },
    { label: '비용 안내', text: '치료 비용이 궁금해요' },
    { label: '예약하기', text: '상담 예약하고 싶어요' }
  ];

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
  function renderMessage(msg) {
    var body = document.getElementById('bdChatBody');
    if (!body) return;

    var div = document.createElement('div');
    div.className = 'bd-msg bd-msg-' + (msg.role === 'user' ? 'user' : 'bot');

    var avatar = document.createElement('div');
    avatar.className = 'bd-msg-avatar';
    avatar.textContent = msg.role === 'user' ? '👤' : '🦷';

    var bubble = document.createElement('div');
    bubble.className = 'bd-msg-bubble';
    bubble.innerHTML = formatText(msg.content);

    div.appendChild(avatar);
    div.appendChild(bubble);
    body.appendChild(div);
    scrollToBottom();
  }

  function formatText(text) {
    // 줄바꿈 → <br>
    var html = text.replace(/\n/g, '<br>');
    // URL → 링크
    html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    // 전화번호 → 링크
    html = html.replace(/(041-415-2892)/g, '<a href="tel:0414152892">$1</a>');
    // **굵게**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return html;
  }

  function showTyping() {
    var body = document.getElementById('bdChatBody');
    if (!body || document.getElementById('bdTyping')) return;
    var div = document.createElement('div');
    div.className = 'bd-typing';
    div.id = 'bdTyping';
    div.innerHTML =
      '<div class="bd-msg-avatar">🦷</div>' +
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

  // ─── API 호출 ───
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

    fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('API error: ' + res.status);
      return res.json();
    })
    .then(function(data) {
      hideTyping();
      var reply = data.reply || '죄송합니다, 응답을 생성하지 못했습니다.';
      state.messages.push({ role: 'assistant', content: reply });
      renderMessage({ role: 'assistant', content: reply });
    })
    .catch(function(err) {
      hideTyping();
      console.error('Chat error:', err);
      var errorMsg = '네트워크 오류가 발생했습니다. 전화(041-415-2892)로 문의해 주세요.';
      state.messages.push({ role: 'assistant', content: errorMsg });
      renderMessage({ role: 'assistant', content: errorMsg });
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
          var greeting = '안녕하세요! 서울비디치과 AI 상담사 비디입니다 😊\n\n진료, 예약, 비용 등 궁금한 점을 편하게 물어보세요.';
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
