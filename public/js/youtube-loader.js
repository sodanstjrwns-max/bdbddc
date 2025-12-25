<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>페이지를 찾을 수 없습니다 | 서울비디치과</title>
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦷</text></svg>">
  
  <!-- Preconnect -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  
  <!-- Fonts -->
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
  
  <!-- Icons -->
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
  
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    :root {
      --brand-primary: #8B5A2B;
      --brand-gold: #C9A962;
      --brand-gradient: linear-gradient(135deg, #8B5A2B 0%, #C9A962 100%);
      --glass-bg: rgba(20, 20, 20, 0.85);
      --glass-border: rgba(255, 255, 255, 0.1);
    }
    
    html, body {
      height: 100%;
      overflow-x: hidden;
    }
    
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1512 30%, #12100e 60%, #0a0a0a 100%);
      color: #e5e5e5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      text-align: center;
    }
    
    .error-container {
      max-width: 600px;
      width: 100%;
    }
    
    .error-icon {
      font-size: 120px;
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    
    .error-code {
      font-size: clamp(80px, 20vw, 150px);
      font-weight: 900;
      background: var(--brand-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: 16px;
    }
    
    .error-title {
      font-size: clamp(24px, 5vw, 36px);
      font-weight: 700;
      color: #fff;
      margin-bottom: 16px;
    }
    
    .error-message {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 40px;
      line-height: 1.6;
    }
    
    .error-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      margin-bottom: 48px;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      font-family: inherit;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: var(--brand-gradient);
      color: #fff;
      box-shadow: 0 4px 20px rgba(139, 90, 43, 0.4);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(139, 90, 43, 0.5);
    }
    
    .btn-secondary {
      background: var(--glass-bg);
      color: #fff;
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(10px);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .quick-links {
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 24px;
    }
    
    .quick-links-title {
      font-size: 14px;
      color: var(--brand-gold);
      font-weight: 600;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .quick-links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }
    
    .quick-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      text-decoration: none;
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      transition: all 0.3s ease;
    }
    
    .quick-link:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--brand-gold);
      color: #fff;
      transform: translateY(-2px);
    }
    
    .quick-link i {
      font-size: 20px;
      color: var(--brand-gold);
    }
    
    .footer-info {
      margin-top: 48px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .footer-info a {
      color: var(--brand-gold);
      text-decoration: none;
    }
    
    .footer-info a:hover {
      text-decoration: underline;
    }
    
    @media (max-width: 480px) {
      .error-icon {
        font-size: 80px;
      }
      
      .error-actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
      
      .quick-links-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">🦷</div>
    <div class="error-code">404</div>
    <h1 class="error-title">페이지를 찾을 수 없습니다</h1>
    <p class="error-message">
      요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br>
      아래 버튼을 통해 원하시는 페이지로 이동해 주세요.
    </p>
    
    <div class="error-actions">
      <a href="/" class="btn btn-primary">
        <i class="fas fa-home"></i>
        홈으로 가기
      </a>
      <a href="reservation.html" class="btn btn-secondary">
        <i class="fas fa-calendar-check"></i>
        예약하기
      </a>
    </div>
    
    <div class="quick-links">
      <div class="quick-links-title">인기 페이지</div>
      <div class="quick-links-grid">
        <a href="treatments/implant.html" class="quick-link">
          <i class="fas fa-tooth"></i>
          임플란트
        </a>
        <a href="treatments/invisalign.html" class="quick-link">
          <i class="fas fa-teeth"></i>
          교정
        </a>
        <a href="doctors/index.html" class="quick-link">
          <i class="fas fa-user-md"></i>
          의료진
        </a>
        <a href="pricing.html" class="quick-link">
          <i class="fas fa-won-sign"></i>
          비용안내
        </a>
        <a href="directions.html" class="quick-link">
          <i class="fas fa-map-marker-alt"></i>
          오시는 길
        </a>
        <a href="faq.html" class="quick-link">
          <i class="fas fa-question-circle"></i>
          FAQ
        </a>
      </div>
    </div>
    
    <div class="footer-info">
      <p>도움이 필요하시면 <a href="tel:041-415-2892">041-415-2892</a>로 연락해 주세요.</p>
    </div>
  </div>
</body>
</html>
