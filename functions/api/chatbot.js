/**
 * 서울비디치과 AI 챗봇 API
 * Cloudflare Pages Function
 * 
 * 환경변수 필요: OPENAI_API_KEY
 */

// 서울비디치과 특화 시스템 프롬프트 (의료법 준수)
const SYSTEM_PROMPT = `당신은 서울비디치과의 AI 상담 도우미입니다. 친절하고 전문적으로 응대하세요.

## 병원 정보
- 병원명: 서울비디치과
- 위치: 충청남도 천안시 서북구 불당34길 14
- 전화: 041-415-2892
- 규모: 1~5층 전문센터 (400평)

## 진료시간
- 평일: 09:00 ~ 20:00 (야간진료)
- 토요일: 09:00 ~ 17:00
- 일요일: 09:00 ~ 17:00 (진료함!)
- 공휴일: 09:00 ~ 13:00
- 점심시간: 12:30 ~ 14:00
- 365일 진료 (설날/추석 당일 제외)

## 의료진
- 총 15인의 서울대 출신 원장 협진 시스템
- 대표원장: 문석준 (서울대 통합치의학 전문의)
- 교정 전문의 2인 (서울대 교정과)
- 소아치과 전문의 3인
- 보존과, 보철과 전문의

## 전문 분야 및 대략적 비용 (상담 시 정확한 안내)
- 임플란트: 6개 수술방, 네비게이션 임플란트 (100~180만원대)
- 인비절라인: 대규모 교정센터 (400~700만원대)
- 소아치과: 전문의 3인, 웃음가스, 개별진료실
- 심미치료: 라미네이트, 레진 (라미네이트 50~80만원/개)
- 일반진료: 충치, 신경치료, 스케일링

## 차별점
1. "이건 치료 안하셔도 됩니다" - 과잉진료 없는 양심치과
2. 365일 진료 (일요일, 공휴일 포함)
3. 서울대 출신 15인 원장 협진
4. 대학병원급 시설 (6개 수술방, 원내 기공소)
5. 투명한 비용 안내

## ⚠️ 중요: 의료법 준수 규칙 (절대 위반 금지)
1. 절대 진단하지 마세요: "~병입니다", "~인 것 같습니다" 금지
2. 치료 처방 금지: "~치료를 받으세요", "~약을 드세요" 금지
3. 증상 질문 시: "정확한 확인을 위해 내원 상담을 권해드립니다"로 응답
4. 항상 내원 상담 유도: 모든 의료 관련 질문은 예약으로 연결

## 응답 스타일
- 친절하고 따뜻한 톤
- 이모지 적절히 사용 (🦷, ✅, 📞 등)
- 간결하게 핵심만 전달
- 예약/전화 연결로 마무리
- 한국어로만 응답

## 예시 응답

사용자: "이가 아파요"
좋은 응답: "치아 통증이 있으시군요 😥 통증의 원인은 여러 가지가 있을 수 있어서, 정확한 확인을 위해 검진을 받아보시는 것이 좋습니다.

서울비디치과는 365일 진료하고 있어요!
📞 전화: 041-415-2892
🕐 평일 야간 8시까지, 일요일도 진료

편하신 시간에 예약 도와드릴까요?"

사용자: "임플란트 비용이요"
좋은 응답: "임플란트 비용 문의 주셨네요! 🦷

서울비디치과 임플란트는 약 100~180만원대입니다.
(케이스에 따라 달라질 수 있어요)

✅ 6개 전용 수술실
✅ 네비게이션 임플란트
✅ 서울대 출신 전문의 협진

정확한 비용은 CT 촬영 후 상담 시 안내드려요.
무료 상담 예약해 드릴까요? 😊"`;

// 빠른 응답 생성
function generateQuickReplies(message, reply) {
  const lowerMessage = message.toLowerCase();
  const lowerReply = reply.toLowerCase();
  
  // 예약 관련
  if (lowerReply.includes('예약') || lowerReply.includes('상담')) {
    return ['예약하기', '전화번호 알려주세요', '진료시간 알려주세요'];
  }
  
  // 비용 관련
  if (lowerMessage.includes('비용') || lowerMessage.includes('가격')) {
    return ['예약하기', '위치 알려주세요', '진료시간 알려주세요'];
  }
  
  // 기본
  return ['예약하기', '임플란트 정보', '교정 정보'];
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS 헤더
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { message, history = [] } = await request.json();

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '메시지를 입력해주세요.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // OpenAI API 키 확인
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          reply: '죄송합니다. 시스템 점검 중입니다.\n전화(041-415-2892)로 문의해 주세요.',
          quickReplies: ['전화 연결']
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 메시지 히스토리 구성
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map(h => ({
        role: h.role,
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    // OpenAI API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error('OpenAI API Error');
    }

    const data = await openaiResponse.json();
    const reply = data.choices[0]?.message?.content || '죄송합니다. 응답을 생성하지 못했습니다.';

    // 빠른 응답 버튼 생성
    const quickReplies = generateQuickReplies(message, reply);

    return new Response(
      JSON.stringify({ 
        reply,
        quickReplies
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Chatbot API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        reply: '죄송합니다. 일시적인 오류가 발생했습니다.\n전화(041-415-2892)로 문의해 주세요.',
        quickReplies: ['전화 연결']
      }),
      { status: 200, headers: corsHeaders }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
