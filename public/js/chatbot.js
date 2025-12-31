/**
 * 서울비디치과 AI 챗봇
 * GPT-4o-mini 기반 상담 도우미
 */

(function() {
  // 이미 로드되었으면 종료
  if (window.seoulBDChatbot) return;
  
  // 챗봇 HTML 삽입
  const chatbotHTML = `
    <div id="chatbot-container">
      <!-- 플로팅 버튼 -->
      <button id="chatbot-toggle" class="chatbot-toggle" aria-label="AI 상담 열기">
        <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span class="chatbot-badge">AI</span>
      </button>
      
      <!-- 채팅창 -->
      <div id="chatbot-window" class="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h3>서울비디치과 AI</h3>
              <span class="chatbot-status">온라인</span>
            </div>
          </div>
          <button id="chatbot-minimize" class="chatbot-minimize" aria-label="최소화">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
        
        <div id="chatbot-messages" class="chatbot-messages">
          <div class="chat-message bot">
            <div class="message-content">
              안녕하세요! 🦷 서울비디치과 AI 상담 도우미입니다.<br><br>
              진료 상담, 비용 문의, 예약 안내 등 궁금한 점을 물어보세요!
            </div>
          </div>
        </div>
        
        <div class="chatbot-quick-actions">
          <button class="quick-btn" data-message="진료 시간이 어떻게 되나요?">🕐 진료시간</button>
          <button class="quick-btn" data-message="임플란트 비용이 궁금해요">💰 비용문의</button>
          <button class="quick-btn" data-message="예약하고 싶어요">📅 예약하기</button>
          <button class="quick-btn" data-message="위치가 어디인가요?">📍 오시는길</button>
        </div>
        
        <form id="chatbot-form" class="chatbot-input-area">
          <input type="text" id="chatbot-input" placeholder="메시지를 입력하세요..." autocomplete="off">
          <button type="submit" id="chatbot-send" aria-label="전송">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;
  
  // CSS 삽입
  const chatbotCSS = `
    <style id="chatbot-styles">
      #chatbot-container {
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 9999;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      
      /* 플로팅 버튼 */
      .chatbot-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #C9A962 0%, #8B5A2B 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(201, 169, 98, 0.4);
        transition: all 0.3s ease;
        position: relative;
      }
      
      .chatbot-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(201, 169, 98, 0.5);
      }
      
      .chatbot-toggle svg {
        width: 28px;
        height: 28px;
        color: white;
      }
      
      .chatbot-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 10px;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      /* 채팅창 */
      .chatbot-window {
        position: absolute;
        bottom: 80px;
        left: 0;
        width: 380px;
        height: 520px;
        background: #1a1a1a;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(201, 169, 98, 0.2);
        animation: slideUp 0.3s ease;
      }
      
      .chatbot-window.active {
        display: flex;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* 헤더 */
      .chatbot-header {
        background: linear-gradient(135deg, #C9A962 0%, #8B5A2B 100%);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .chatbot-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .chatbot-avatar {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .chatbot-avatar svg {
        width: 24px;
        height: 24px;
        color: white;
      }
      
      .chatbot-header h3 {
        color: white;
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
      }
      
      .chatbot-status {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .chatbot-status::before {
        content: '';
        width: 8px;
        height: 8px;
        background: #4ade80;
        border-radius: 50%;
      }
      
      .chatbot-minimize {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .chatbot-minimize svg {
        width: 16px;
        height: 16px;
        color: white;
      }
      
      /* 메시지 영역 */
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .chatbot-messages::-webkit-scrollbar {
        width: 6px;
      }
      
      .chatbot-messages::-webkit-scrollbar-thumb {
        background: rgba(201, 169, 98, 0.3);
        border-radius: 3px;
      }
      
      .chat-message {
        display: flex;
        max-width: 85%;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .chat-message.bot {
        align-self: flex-start;
      }
      
      .chat-message.user {
        align-self: flex-end;
      }
      
      .message-content {
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 0.9rem;
        line-height: 1.5;
      }
      
      .chat-message.bot .message-content {
        background: rgba(255, 255, 255, 0.08);
        color: #e5e5e5;
        border-bottom-left-radius: 4px;
      }
      
      .chat-message.user .message-content {
        background: linear-gradient(135deg, #C9A962 0%, #8B5A2B 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }
      
      .chat-message.typing .message-content {
        display: flex;
        gap: 4px;
        padding: 16px 20px;
      }
      
      .typing-dot {
        width: 8px;
        height: 8px;
        background: #C9A962;
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out;
      }
      
      .typing-dot:nth-child(1) { animation-delay: 0s; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      
      @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
      
      /* 빠른 액션 버튼 */
      .chatbot-quick-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        overflow-x: auto;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .chatbot-quick-actions::-webkit-scrollbar {
        display: none;
      }
      
      .quick-btn {
        flex-shrink: 0;
        padding: 8px 14px;
        background: rgba(201, 169, 98, 0.15);
        border: 1px solid rgba(201, 169, 98, 0.3);
        border-radius: 20px;
        color: #C9A962;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      
      .quick-btn:hover {
        background: rgba(201, 169, 98, 0.25);
        transform: translateY(-1px);
      }
      
      /* 입력 영역 */
      .chatbot-input-area {
        display: flex;
        gap: 8px;
        padding: 16px;
        background: rgba(0, 0, 0, 0.3);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      #chatbot-input {
        flex: 1;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        color: white;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s;
      }
      
      #chatbot-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
      
      #chatbot-input:focus {
        border-color: #C9A962;
      }
      
      #chatbot-send {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #C9A962 0%, #8B5A2B 100%);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }
      
      #chatbot-send:hover {
        transform: scale(1.05);
      }
      
      #chatbot-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      #chatbot-send svg {
        width: 20px;
        height: 20px;
        color: white;
      }
      
      /* 반응형 */
      @media (max-width: 480px) {
        #chatbot-container {
          bottom: 16px;
          left: 16px;
          right: 16px;
        }
        
        .chatbot-window {
          width: calc(100vw - 32px);
          height: calc(100vh - 120px);
          max-height: 500px;
          left: 0;
          right: 0;
        }
        
        .chatbot-toggle {
          width: 54px;
          height: 54px;
        }
      }
    </style>
  `;
  
  // DOM에 삽입
  document.head.insertAdjacentHTML('beforeend', chatbotCSS);
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  
  // 요소 참조
  const container = document.getElementById('chatbot-container');
  const toggleBtn = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('chatbot-window');
  const minimizeBtn = document.getElementById('chatbot-minimize');
  const messagesContainer = document.getElementById('chatbot-messages');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  const quickBtns = document.querySelectorAll('.quick-btn');
  const iconChat = toggleBtn.querySelector('.icon-chat');
  const iconClose = toggleBtn.querySelector('.icon-close');
  
  let isOpen = false;
  let isLoading = false;
  let chatHistory = [];
  
  // 토글 기능
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('active', isOpen);
    iconChat.style.display = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';
    
    if (isOpen) {
      input.focus();
    }
  }
  
  toggleBtn.addEventListener('click', toggleChat);
  minimizeBtn.addEventListener('click', toggleChat);
  
  // 메시지 추가
  function addMessage(content, isBot = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
    msgDiv.innerHTML = `<div class="message-content">${content}</div>`;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // 타이핑 인디케이터
  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }
  
  // API 호출
  async function sendMessage(message) {
    if (isLoading || !message.trim()) return;
    
    isLoading = true;
    sendBtn.disabled = true;
    
    // 사용자 메시지 추가
    addMessage(message, false);
    chatHistory.push({ role: 'user', content: message });
    input.value = '';
    
    // 타이핑 표시
    showTyping();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          history: chatHistory.slice(-6)
        })
      });
      
      const data = await response.json();
      
      hideTyping();
      
      if (data.reply) {
        addMessage(data.reply, true);
        chatHistory.push({ role: 'assistant', content: data.reply });
      } else {
        addMessage('죄송합니다. 일시적인 오류가 발생했어요. 다시 시도해 주세요.', true);
      }
      
    } catch (error) {
      hideTyping();
      addMessage('네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.', true);
    }
    
    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }
  
  // 폼 제출
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });
  
  // 빠른 액션 버튼
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sendMessage(btn.dataset.message);
    });
  });
  
  // 전역 객체
  globalThis.seoulBDChatbot = {
    open: () => { if (!isOpen) toggleChat(); },
    close: () => { if (isOpen) toggleChat(); },
    send: sendMessage
  };
  
})();
