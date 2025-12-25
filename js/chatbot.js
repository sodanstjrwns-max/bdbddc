/**
 * 서울비디치과 AI 상담 챗봇
 * - GPT 기반 자연어 대화
 * - 의료법 준수 안전장치 적용
 */

(function() {
  'use strict';

  // 챗봇 상태
  const state = {
    isOpen: false,
    messages: [],
    isLoading: false
  };

  // 초기 메시지
  const INITIAL_MESSAGE = `안녕하세요! 서울비디치과 AI 상담 도우미입니다 🦷

궁금하신 점을 편하게 물어보세요:
• 진료 시간 및 예약
• 치료 비용 안내
• 임플란트, 교정, 소아치과 정보
• 오시는 길

무엇이든 도와드릴게요!`;

  // 면책 문구
  const DISCLAIMER = '※ AI 상담은 일반 정보 제공 목적이며, 정확한 진단 및 치료는 내원 상담이 필요합니다.';

  // 챗봇 HTML 생성
  function createChatbotHTML() {
    const chatbotHTML = `
      <!-- 챗봇 플로팅 버튼 -->
      <button id="chatbot-toggle" class="chatbot-toggle" aria-label="AI 상담 열기">
        <svg class="chatbot-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <svg class="chatbot-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span class="chatbot-badge">AI</span>
      </button>

      <!-- 챗봇 창 -->
      <div id="chatbot-window" class="chatbot-window">
        <!-- 헤더 -->
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">
              <span>🦷</span>
            </div>
            <div class="chatbot-header-text">
              <h3>서울비디치과 AI 상담</h3>
              <p>보통 즉시 응답</p>
            </div>
          </div>
          <button id="chatbot-close" class="chatbot-close" aria-label="닫기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 면책 문구 -->
        <div class="chatbot-disclaimer">
          ${DISCLAIMER}
        </div>

        <!-- 메시지 영역 -->
        <div id="chatbot-messages" class="chatbot-messages">
          <!-- 메시지가 여기에 추가됨 -->
        </div>

        <!-- 입력 영역 -->
        <div class="chatbot-input-area">
          <div class="chatbot-input-wrapper">
            <textarea 
              id="chatbot-input" 
              placeholder="메시지를 입력하세요..." 
              rows="1"
              maxlength="500"
            ></textarea>
            <button id="chatbot-send" class="chatbot-send" aria-label="전송">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div class="chatbot-powered">
            Powered by AI · 365일 상담 가능
          </div>
        </div>
      </div>
    `;

    // 챗봇 컨테이너 생성
    const container = document.createElement('div');
    container.id = 'chatbot-container';
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container);
  }

  // 챗봇 CSS 생성
  function createChatbotCSS() {
    const css = `
      /* 챗봇 컨테이너 */
      #chatbot-container {
        --chatbot-primary: #B8860B;
        --chatbot-primary-dark: #8B6914;
        --chatbot-bg: #0a0a0a;
        --chatbot-surface: #141414;
        --chatbot-border: #2a2a2a;
        --chatbot-text: #ffffff;
        --chatbot-text-secondary: rgba(255,255,255,0.6);
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      /* 플로팅 버튼 */
      .chatbot-toggle {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--chatbot-primary) 0%, var(--chatbot-primary-dark) 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(184, 134, 11, 0.4);
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .chatbot-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(184, 134, 11, 0.5);
      }

      .chatbot-toggle svg {
        width: 28px;
        height: 28px;
        color: white;
        transition: all 0.3s ease;
      }

      .chatbot-toggle .chatbot-icon-close {
        display: none;
      }

      .chatbot-toggle.active .chatbot-icon-chat {
        display: none;
      }

      .chatbot-toggle.active .chatbot-icon-close {
        display: block;
      }

      .chatbot-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #22c55e;
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 10px;
        border: 2px solid var(--chatbot-bg);
      }

      /* 챗봇 창 */
      .chatbot-window {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 380px;
        height: 560px;
        max-height: calc(100vh - 140px);
        background: var(--chatbot-bg);
        border-radius: 20px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.5);
        border: 1px solid var(--chatbot-border);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s ease;
      }

      .chatbot-window.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      /* 모바일 반응형 */
      @media (max-width: 480px) {
        .chatbot-window {
          width: calc(100vw - 20px);
          height: calc(100vh - 100px);
          max-height: none;
          bottom: 80px;
          right: 10px;
          border-radius: 16px;
        }
        
        .chatbot-toggle {
          bottom: 16px;
          right: 16px;
          width: 56px;
          height: 56px;
        }
      }

      /* 헤더 */
      .chatbot-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: linear-gradient(135deg, var(--chatbot-primary) 0%, var(--chatbot-primary-dark) 100%);
        border-radius: 20px 20px 0 0;
      }

      .chatbot-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chatbot-avatar {
        width: 44px;
        height: 44px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .chatbot-header-text h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: white;
      }

      .chatbot-header-text p {
        margin: 2px 0 0;
        font-size: 12px;
        color: rgba(255,255,255,0.8);
      }

      .chatbot-close {
        background: rgba(255,255,255,0.2);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .chatbot-close:hover {
        background: rgba(255,255,255,0.3);
      }

      .chatbot-close svg {
        width: 18px;
        height: 18px;
        color: white;
      }

      /* 면책 문구 */
      .chatbot-disclaimer {
        padding: 10px 16px;
        background: rgba(184, 134, 11, 0.1);
        border-bottom: 1px solid var(--chatbot-border);
        font-size: 11px;
        color: var(--chatbot-text-secondary);
        text-align: center;
        line-height: 1.4;
      }

      /* 메시지 영역 */
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .chatbot-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chatbot-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chatbot-messages::-webkit-scrollbar-thumb {
        background: var(--chatbot-border);
        border-radius: 3px;
      }

      /* 메시지 버블 */
      .chatbot-message {
        display: flex;
        gap: 10px;
        max-width: 85%;
      }

      .chatbot-message.bot {
        align-self: flex-start;
      }

      .chatbot-message.user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      .chatbot-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--chatbot-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }

      .chatbot-message.user .chatbot-message-avatar {
        background: var(--chatbot-primary);
        color: white;
        font-size: 14px;
      }

      .chatbot-message-content {
        background: var(--chatbot-surface);
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--chatbot-text);
        white-space: pre-wrap;
      }

      .chatbot-message.user .chatbot-message-content {
        background: var(--chatbot-primary);
        color: white;
        border-bottom-right-radius: 4px;
      }

      .chatbot-message.bot .chatbot-message-content {
        border-bottom-left-radius: 4px;
      }

      /* 로딩 애니메이션 */
      .chatbot-typing {
        display: flex;
        gap: 4px;
        padding: 8px 0;
      }

      .chatbot-typing span {
        width: 8px;
        height: 8px;
        background: var(--chatbot-text-secondary);
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
      }

      .chatbot-typing span:nth-child(1) { animation-delay: 0s; }
      .chatbot-typing span:nth-child(2) { animation-delay: 0.2s; }
      .chatbot-typing span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-8px); }
      }

      /* 입력 영역 */
      .chatbot-input-area {
        padding: 16px;
        border-top: 1px solid var(--chatbot-border);
      }

      .chatbot-input-wrapper {
        display: flex;
        gap: 10px;
        align-items: flex-end;
        background: var(--chatbot-surface);
        border-radius: 24px;
        padding: 8px 8px 8px 16px;
        border: 1px solid var(--chatbot-border);
        transition: border-color 0.2s;
      }

      .chatbot-input-wrapper:focus-within {
        border-color: var(--chatbot-primary);
      }

      #chatbot-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--chatbot-text);
        font-size: 14px;
        resize: none;
        max-height: 100px;
        font-family: inherit;
        line-height: 1.4;
      }

      #chatbot-input::placeholder {
        color: var(--chatbot-text-secondary);
      }

      .chatbot-send {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--chatbot-primary);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .chatbot-send:hover {
        background: var(--chatbot-primary-dark);
        transform: scale(1.05);
      }

      .chatbot-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .chatbot-send svg {
        width: 18px;
        height: 18px;
        color: white;
      }

      .chatbot-powered {
        text-align: center;
        font-size: 11px;
        color: var(--chatbot-text-secondary);
        margin-top: 10px;
      }

      /* 빠른 응답 버튼 */
      .chatbot-quick-replies {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .chatbot-quick-reply {
        background: transparent;
        border: 1px solid var(--chatbot-border);
        color: var(--chatbot-text);
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .chatbot-quick-reply:hover {
        background: var(--chatbot-primary);
        border-color: var(--chatbot-primary);
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // 메시지 추가
  function addMessage(content, isBot = true, quickReplies = null) {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${isBot ? 'bot' : 'user'}`;
    
    messageDiv.innerHTML = `
      <div class="chatbot-message-avatar">${isBot ? '🦷' : '👤'}</div>
      <div class="chatbot-message-content">${content}</div>
    `;

    messagesContainer.appendChild(messageDiv);

    // 빠른 응답 버튼 추가
    if (quickReplies && quickReplies.length > 0) {
      const quickRepliesDiv = document.createElement('div');
      quickRepliesDiv.className = 'chatbot-quick-replies';
      quickReplies.forEach(reply => {
        const btn = document.createElement('button');
        btn.className = 'chatbot-quick-reply';
        btn.textContent = reply;
        btn.onclick = () => sendMessage(reply);
        quickRepliesDiv.appendChild(btn);
      });
      messagesContainer.appendChild(quickRepliesDiv);
    }

    // 스크롤 하단으로
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // 로딩 표시
  function showLoading() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'chatbot-loading';
    loadingDiv.className = 'chatbot-message bot';
    loadingDiv.innerHTML = `
      <div class="chatbot-message-avatar">🦷</div>
      <div class="chatbot-message-content">
        <div class="chatbot-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideLoading() {
    const loading = document.getElementById('chatbot-loading');
    if (loading) loading.remove();
  }

  // 메시지 전송
  async function sendMessage(userMessage) {
    if (!userMessage.trim() || state.isLoading) return;

    // 사용자 메시지 표시
    addMessage(userMessage, false);
    
    // 입력창 초기화
    const input = document.getElementById('chatbot-input');
    if (input) input.value = '';

    // 빠른 응답 버튼 제거
    document.querySelectorAll('.chatbot-quick-replies').forEach(el => el.remove());

    // 로딩 표시
    state.isLoading = true;
    showLoading();

    try {
      // API 호출
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          history: state.messages.slice(-10) // 최근 10개 메시지만 전송
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      hideLoading();
      addMessage(data.reply, true, data.quickReplies);

      // 히스토리 저장
      state.messages.push({ role: 'user', content: userMessage });
      state.messages.push({ role: 'assistant', content: data.reply });

    } catch (error) {
      console.error('Chatbot error:', error);
      hideLoading();
      addMessage('죄송합니다. 일시적인 오류가 발생했습니다.\n잠시 후 다시 시도하시거나, 전화(041-415-2892)로 문의해 주세요.', true);
    }

    state.isLoading = false;
  }

  // 이벤트 바인딩
  function bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const window = document.getElementById('chatbot-window');
    const close = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const send = document.getElementById('chatbot-send');

    // 토글 버튼
    toggle?.addEventListener('click', () => {
      state.isOpen = !state.isOpen;
      toggle.classList.toggle('active', state.isOpen);
      window?.classList.toggle('open', state.isOpen);
      
      // 처음 열 때 초기 메시지 표시
      if (state.isOpen && state.messages.length === 0) {
        setTimeout(() => {
          addMessage(INITIAL_MESSAGE, true, ['진료시간 알려주세요', '임플란트 비용', '예약하기']);
        }, 300);
      }
    });

    // 닫기 버튼
    close?.addEventListener('click', () => {
      state.isOpen = false;
      toggle?.classList.remove('active');
      window?.classList.remove('open');
    });

    // 전송 버튼
    send?.addEventListener('click', () => {
      sendMessage(input?.value || '');
    });

    // Enter 키 전송 (Shift+Enter는 줄바꿈)
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });

    // textarea 자동 높이 조절
    input?.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }

  // 초기화
  function init() {
    createChatbotCSS();
    createChatbotHTML();
    bindEvents();
    console.log('🦷 서울비디치과 AI 챗봇 초기화 완료');
  }

  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
