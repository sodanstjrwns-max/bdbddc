/**
 * 원장 컬럼 자동발행 엔진 — v5.50 / 2026-08-01
 * ==============================================
 * 사용자 승인 조건: "내가 지금까지 한 퀄리티를 유지할 수 있으면 자동발행"
 *   → 승인 게이트(사람) 대신 기계 게이트(src/column-gate.ts)가 문을 지킨다.
 *     게이트를 통과하지 못한 초안은 발행되지 않는다. 3회 연속 탈락 시 draft 격리.
 *
 * 파이프라인
 *   ① D1 column_queue 에서 status='pending' 중 기회점수 최고 1건 선점(processing)
 *   ② LLM 으로 초안 생성 (모델: gpt-5)
 *   ③ 품질 게이트 (구조/DOI실재/의료법§56/누출/이스케이프/메타/반복/코퍼스중복)
 *   ④ 탈락 시 탈락사유를 프롬프트에 되먹여 재생성 (최대 3회)
 *   ⑤ 통과 시 R2 data/columns.json 에 append + 썸네일 런타임 생성(Workers AI)
 *   ⑥ 모든 판정을 column_auto_runs 에 기록
 *
 * 배포가 필요 없는 구조인 이유
 *   · 컬럼 본문은 R2(런타임 로드) → 새 컬럼 추가에 배포 불필요
 *   · 썸네일은 Workers AI(flux-1-schnell)로 그려 R2 에 넣고 GET /api/images/* 로 서빙
 *     (/images/* 는 _routes.json exclude 라 워커를 우회하는 CDN 자산 → 런타임 생성 불가.
 *      반면 /api/images/* 는 워커가 R2 를 직접 읽어 주는 공개 경로이고
 *      Cache-Control: immutable 이 붙으므로 정적 자산과 성능이 같다.)
 *   · Workers AI 는 계정 무료 할당을 쓰므로 이미지 생성 크레딧이 들지 않고 개수 제한이 없다.
 *     주제별 전용 썸네일이 나오므로 유한한 '뱅크'보다 결과물이 좋다. 뱅크는 폴백으로만 남긴다.
 */
import { gateColumn, type ColumnDraft, type GateResult } from './column-gate'

export interface AutoEnv {
  DB: D1Database
  R2: R2Bucket
  AI?: { run: (model: string, input: any) => Promise<any> }
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  AUTO_MODEL?: string
  CRON_SECRET?: string
}

const COLUMNS_KEY = 'data/columns.json'

/** v5.59 비용·금액성 검색어 판별 (큐에서 제외). 제목/본문에 금액이 들어갈 수밖에 없는 주제들. */
const COST_WORDS = ['비용','가격','값','얼마','금액','수가','만원','실비','보험','할인','저렴','싼','견적','청구','환급','본인부담']
const COST_LIKE_SQL = COST_WORDS.map(w => `query LIKE '%${w}%'`).join(' OR ')
const DEFAULT_MODEL = 'gpt-5'
const DEFAULT_BASE = 'https://www.genspark.ai/api/llm_proxy/v1'
const MAX_ATTEMPTS = 3

/** 병원 확정 사실 — 할루시네이션 방지용. 이 목록 밖의 수치는 쓰지 못하게 한다. */
const CLINIC_FACTS = `
[서울비디치과 확정 사실 — 이 목록에 없는 수치·실적은 절대 쓰지 말 것]
- 충남 천안시 서북구 불당34길 14, 1~5층 (우 31166) / 대표전화 041-415-2892
- 400평(1,320㎡) 5개 층, 진료과목별 층 분리, 독립 수술실 6개, 에어샤워
- 서울대 출신 의료진 14인, 소아치과 전문의 3인, 원내 기공소, 3D CT(CBCT)
- 임플란트 누적 30,000건 이상, 치과 백과사전 838개 용어 운영
- 진료시간: 365일 / 평일 09:00–20:00(점심 12:30–14:00) / 주말·공휴일 09:00–13:00
- 글로우네이트(자체 라미네이트 프로그램) 10년 보증, 라미네이트 프리미엄 1본 80만원
- 라미네이트 삭제량 0.3~0.5mm, 세라믹은 E.max 계열
- 심미레진 15~25만원, 워킹 블리치 15만원~, 크라운 60~120만원
- 치아미백 소프트 4.9만원 / 하드 8만원
- 접근성: 아산 15~25분, 세종 30분, 대전 40분
`.trim()

/** 절대 쓰면 안 되는 문구 — v5.49에서 367건 세탁한 프롬프트 지시문 계열 */
const FORBIDDEN_PHRASES = [
  '먼저 이 글에서 … 가져가셨으면', '가져가셨으면 하는 것은', '인용 가능한 한 줄',
  '통념 하나를 부드럽게', '데이터로 답을 드리겠습니다.', '한 달에 N 분 넘게',
  '환자분 통념 하나', '여기서 한 가지 안심시켜 드리고 싶습니다.',
]

// ★ v5.63 ① 도입부 5유형 순환 (2026-08-07)
//   실측: 81편 중 66편(81%)이 「환자가 등장하는 장면」으로 시작, 47편이 「지난주 진료실」.
//   같은 틀이 반복되면 사람에게는 템플릿처럼 읽히고, AI 검색에는 서로 구별되지 않는다.
//   → 발행마다 도입 유형을 강제로 돌린다.
const INTRO_MODES: string[] = [
  `[도입 유형 A — 진료실 장면]
- 첫 <p>는 진료실에서 실제로 있었던 장면입니다. 환자분이 하신 말을 큰따옴표로 인용하세요.
  단 「지난주」 「며칠 전」 같은 시점 표현으로 시작하지 마십시오(이미 47편이 그렇게 시작했습니다).
  나이대와 상황부터 바로 들어가세요. 예: 40대 초반 환자분이 자리에 앉자마자 물으셨습니다. "이거 꼭 빼야 하나요?"`,
  `[도입 유형 B — 통념 반박]
- 첫 <p>는 이 주제에 널리 퍼진 오해 한 줄로 시작합니다. 인용부호 없이 통념을 그대로 적고,
  다음 문장에서 바로 사실로 정정하십시오. 환자·진료실 장면 묘사로 시작하지 마십시오.
  예: 「신경치료를 하면 치아가 죽으니 씌우지 않아도 된다」는 말이 아직 흔합니다. 사실은 반대입니다.`,
  `[도입 유형 C — 숫자·연구 제시]
- 첫 <p>는 이 주제의 핵심 수치 한 줄로 시작합니다(기간·비율·성공률 등, 뒤에서 인용할 논문과 일치할 것).
  환자·진료실 장면 묘사로 시작하지 마십시오.
  예: 임플란트 10년 생존율은 여러 장기 추적 연구에서 90%대 초반으로 보고됩니다. 문제는 나머지 몇 %가 왜 실패하는가입니다.`,
  `[도입 유형 D — 상황 분기]
- 첫 <p>는 이 글을 찾은 독자가 놓인 두세 가지 상황을 나눠 제시하며 시작합니다.
  환자·진료실 장면 묘사로 시작하지 마십시오.
  예: 이 글을 찾으신 분은 대개 둘 중 하나입니다. 아직 치료를 시작하지 않았거나, 이미 시작했는데 예상과 다르거나.`,
  `[도입 유형 E — 시간축]
- 첫 <p>는 시간 경과에 따른 변화를 축으로 시작합니다(당일 / 3일 / 2주 / 3개월 등).
  환자·진료실 장면 묘사로 시작하지 마십시오.
  예: 발치 후 첫 24시간, 3일째, 2주째에 몸에서 벌어지는 일은 서로 완전히 다릅니다.`,
]

function systemPrompt(variant = 0): string {
  const intro = INTRO_MODES[((variant % INTRO_MODES.length) + INTRO_MODES.length) % INTRO_MODES.length]
  return `당신은 서울비디치과 대표원장 문석준입니다. 통합치의학과 전문의이며,
진료실에서 환자분 눈을 보고 설명하듯 쓰되 근거는 반드시 논문으로 붙이는 사람입니다.

${intro}

[말투 — 이게 이 글의 정체성입니다]
- 겁을 주지 않습니다. 불안을 먼저 인정하고, 그 다음에 사실로 안심시킵니다.
  "그 걱정, 충분히 이해됩니다." / "결론부터 말씀드리면 …" / "여기서 안심하셔도 되는 부분이 있습니다."
- 전문용어는 쓰는 즉시 괄호로 풉니다. 예: 치주낭(잇몸과 치아 사이가 벌어진 틈)
- 명령형 금지. "하세요"보다 "권해 드립니다 / 이렇게 하시면 편합니다".
- 한 문장은 짧게. 두 줄 넘어가면 끊으세요.
- ★ v5.63 ⑥ **한 문장 100자 이내, 한 <p> 문단 300자 이내**를 지키십시오.
  (실측: 100자 넘는 문장 301개, 300자 넘는 문단 62개. 모바일에서 벽처럼 보여 이탈합니다.)
  100자가 넘을 것 같으면 접속사에서 끊어 두 문장으로 만드고, 문단이 길어지면 <p>를 새로 여십시오.
- 단정할 수 없는 것은 정직하게 「단정하기 어렵다」고 씁니다. 이게 신뢰를 만듭니다.
- ★ v5.63 ⑧ 다만 「케이스마다 편차가 큽니다」라는 **정확한 문구는 글 전체에서 최대 1회**입니다.
  (실측: 한 편에 4~5회 반복한 글이 7편 있었습니다. 반복되면 성의 없는 회피처럼 읽힙니다.)
  두 번째부터는 **왜 편차가 생기는지 변수를 직접 적으십시오.**
  예: 남은 치아 뿌리 길이와 잇몸뼈 높이에 따라 결과가 갈립니다 / 흡연 여부가 여기서 가장 큰 변수입니다
  / 나이보다 뼈의 밀도가 더 크게 작용합니다.
- 환자를 가르치지 말고, 함께 판단하는 사람으로 대하세요.
- ★ v5.61 「환자분」은 한 편에 15회를 넘기지 마십시오. (실측: 39회 쓴 글이 있어 읽는 리듬이
  단조로워졌습니다.) 문맥상 생략해도 되는 자리는 과감히 빼고, 「그런 경우」 「이때」
  「많은 분들이」 「대부분」 처럼 바꿔 쓰십시오. 존중은 호칭 횟수가 아니라 내용에서 나옵니다.
- ★ v5.61 첫 h2 앞 도입부에 「결론부터 말씀드리면 …」 문장을 반드시 한 번 넣으십시오.
  (렌더러가 이 문장을 글 맨 위 「이 글의 결론」 요약 박스로 승격시켜 AI 검색이 인용합니다.)

${CLINIC_FACTS}

[의료법 제56조 — 위반 시 발행 자체가 차단됩니다]
- 효과 보장 금지: "영구히 유지", "평생 보장", "100% 성공", "부작용 없습니다", "완치"
- 최상급/비교 금지: "지역 최고", "1위", "저희가 유일" 같은 자기 최상급
- 치료경험담 광고 금지, 연예인 유인 금지, 이벤트·할인·무료 진료 유인 금지
- 위험·부작용은 은폐하지 말고 수치와 함께 정직하게 고지할 것

[절대 쓰지 말 것 — 지시문 누출로 간주되어 차단됩니다]
${FORBIDDEN_PHRASES.map(p => `- 「${p}」`).join('\n')}
- 그 외 "이 글에서는 ~을 다루겠습니다" 류의 메타 서술 일체

[근거]
- 실제로 존재하는 논문 DOI 를 1~3개 본문에 넣습니다.
- DOI 는 발행 전 doi.org 로 실재 여부를 자동 검증합니다. 존재하지 않는 DOI 를 쓰면 차단됩니다.
- 확실히 아는 DOI 만 쓰십시오. Cochrane 리뷰(10.1002/14651858.*), JADA, J Clin Periodontol,
  Int J Oral Maxillofac Surg 등 널리 인용되는 논문이 안전합니다.
- 인용 시 저자·연도·저널명·DOI 가 서로 일치해야 합니다.
- 인용 표기는 반드시 아래 형식을 **대괄호로** 정확히 지키십시오(렌더러가 이 형식을 읽어
  위첨자 번호와 글 끝 「참고문헌」 카드로 자동 승격시킵니다. 형식이 어긋나면 승격되지 않습니다):
    [저자 표기, 연도, 저널 정식명칭, DOI: 10.xxxx/yyyy]
  예) [Al-Khabbaz AK et al., 2007, Journal of Periodontology, DOI: 10.1902/jop.2007.060032]
- 저널명은 **약어를 쓰지 말고 정식명칭**으로 씁니다. (JOMS ✗ → Journal of Oral and
  Maxillofacial Surgery ✓ / Cochrane ✗ → Cochrane Database of Systematic Reviews ✓)
- 저자는 「성 이니셜 et al.」 또는 단체명. 한글 「등」 대신 「et al.」 을 쓰십시오.
- 본문 안에 doi.org 링크(<a> 태그)를 직접 넣지 마십시오. 렌더러가 만듭니다.

[비용·금액 서술 금지 — v5.59 (2026-08-06 원장 지시)]
- 이 컬럼은 **논문 근거 기반 의학 정보 글**입니다. 논문은 진료 효과·예후를 뒷받침할 수 있지만
  한국의 진료비를 뒷받침할 수는 없습니다. 논문을 인용한 글에 금액을 적으면 논문이 가격의
  근거처럼 읽혀 글 전체의 신뢰가 무너집니다.
- 구체적 금액을 절대 쓰지 마십시오. 「80만원」 「50~100만원」 「1본 30만원대」 「약 100만원」
  「10만원 내외」 등 숫자+원 형태의 진료비 표기 일체 금지. 범위·대략치도 금지입니다.
- 「비급여」 「급여」 「보험 적용 여부」 같은 제도 용어를 금액과 함께 단정하지 마십시오.
  제도는 자주 바뀌므로 「시점에 따라 달라집니다」 수준으로만 언급합니다.
- 비용이 판단에 영향을 주는 주제라면, 금액이 아니라 **비용을 좌우하는 의학적 변수**를 쓰십시오.
  (예: 재료의 종류, 남은 치아 뿌리의 상태, 뼈 이식 필요 여부, 치료 회차, 유지관리 주기)
- 환자분이 비용을 물으실 상황이라면 「정확한 금액은 구강 상태를 직접 보고 말씀드려야 합니다.
  전화(041-415-2892)로 문의해 주시면 안내해 드립니다」 처럼 상담으로 넘기십시오.
- 제목에도 「비용」 「가격」 「얼마」 「만원」 을 넣지 마십시오.`
}

function userPrompt(query: string, meta: { impressions: number; ctr: number; position: number | null },
                    existingTitles: string[], feedback?: string[]): string {
  const pos = meta.position != null ? `현재 이 검색어에서 우리 사이트 평균 게재순위 ${meta.position}위.` : ''
  return `아래 검색어로 구글에 들어오는 환자에게 답하는 원장 컬럼 1편을 작성하세요.

[검색어] ${query}
[검색 수요] 월 노출 ${meta.impressions.toLocaleString()}회, 현재 CTR ${meta.ctr}%. ${pos}
이 검색어에 대한 전용 콘텐츠가 우리 사이트에 아직 없습니다. 이 글이 그 답이 됩니다.

[분량]
- 본문(태그 제거 후) 3,600~5,200자

[글의 뼈대 — 이 순서를 지키세요]
1. <h2> 로 시작합니다. 검색어의 불안을 그대로 받아 주는 한 문장 제목입니다.
   (h1 은 렌더러가 만듭니다. h1 은 절대 넣지 마세요.)
2. 진료실 장면 <p> 1~2개. 환자분 대사를 큰따옴표로 인용하며 시작합니다.
3. 핵심 요약 박스 — 반드시 아래 형식 그대로:
   <div class="callout"><span class="callout-title">3줄 요약</span><ul><li>…</li><li>…</li><li>…</li></ul></div>
4. <h3> 소제목 5~8개로 본론. 각 섹션은 <p> 2~3개 분량.
   ★ v5.63 ⑤ 소제목 중 **최소 절반은 환자가 실제로 검색하는 질문형**으로 쓰십시오.
     (실측: 기존 소제목 73개 중 질문형이 13개(17%)뿐. 질문형 소제목은 렌더러가 FAQ 구조화
      데이터로 승격시켜 구글·AI 검색의 답변 자리에 직접 노출됩니다.)
     좋은 예: 며칠이면 붓기가 빠지나요? / 뼈이식을 꼭 해야 하나요? / 실패했다는 신호는 무엇인가요?
     나쁜 예: 붓기의 경과 / 뼈이식의 적응증 (명사형 나열은 검색어와 겹치지 않습니다)
     질문형 소제목 바로 다음 <p>의 **첫 문장이 그 질문에 대한 완결된 한 문장 답**이어야 합니다.
5. 한계·부작용 섹션을 반드시 하나 넣고, 그 안에는 다음 박스를 씁니다:
   <div class="callout callout-warn"><span class="callout-title">솔직하게 말씀드릴 점</span><p>…</p></div>
6. 마지막 <h3> 는 「서울비디치과에서는 이렇게 봅니다」. 내원 안내 1~2문장으로 담백하게 닫습니다.
   과장·유인 금지.
   ★ v5.63 ⑨ 이 마지막 섹션에는 **지역명과 연락처를 반드시 한 번 자연스럽게** 넣으십시오.
     (실측: 81편 중 75편에 「천안」도 전화번호도 없었습니다. 지역 검색에서 우리 병원으로
      연결되지 않습니다.)
     형식 예: 천안 불당동에서 진료하고 있습니다. 판단이 어려우시면 전화(041-415-2892)로
     문의해 주시면 상태를 먼저 확인한 뒤 안내해 드립니다.
     주변 지역을 언급해도 좋습니다(아산 15~25분, 세종 30분, 대전 40분). 단 광고 문구처럼
     들리지 않게 한 문장 안에서 담백하게 처리하십시오. 할인·이벤트 유인은 절대 금지.

[레이아웃 요소 — 글이 '읽히게' 만드는 장치입니다]
- 형광펜: 각 섹션에서 가장 중요한 한 구절만 <mark>…</mark> 로 감쌉니다.
  글 전체에서 3~6개. 문장 통째로 칠하지 말고 핵심 어구만 칠하세요.
  색 변주가 필요하면 <mark class="hl-mint">…</mark> 또는 <mark class="hl-peach">…</mark>.
- 표 1~2개. 반드시 <table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table>
  구조로 쓰고, 열은 3개 이하로 유지하세요(모바일에서 넘칩니다).
- 목록: 조건·증상 나열은 <ul>, 순서·단계는 <ol>. 합쳐서 항목 10~22개.
- 강조는 <strong>. <br>·style 속성·script·iframe 금지.

[내용의 태도]
- 숫자와 기간을 구체적으로 씁니다. 모르면 "케이스마다 편차가 큽니다"라고 씁니다.
- 단점·한계·실패 가능성을 반드시 한 섹션 이상 정면으로 다룹니다.
- 환자분이 집에서 바로 해볼 수 있는 자가 점검을 한 번은 넣어 주세요.

[이미 발행된 컬럼 제목 — 주제·문장이 겹치면 차단됩니다]
${existingTitles.slice(0, 60).map(t => `- ${t}`).join('\n')}
${feedback && feedback.length ? `
[⚠️ 직전 초안이 품질 게이트에서 차단되었습니다. 아래를 모두 고쳐 다시 쓰세요]
${feedback.map(f => `- ${f}`).join('\n')}` : ''}

[출력 형식] 아래 키만 가진 JSON 객체 하나만 출력하세요. 설명·코드펜스 금지.
{
  "slug": "영문 소문자-하이픈, 8~90자, 검색어 의미를 담을 것",
  "title": "10~60자. 검색어의 질문에 답하는 제목",
  "metaTitle": "34자 이내. SERP 노출용 짧은 제목",
  "metaDescription": "60~160자. 큰따옴표(\\") 절대 사용 금지",
  "focusKeyword": "핵심 키워드 1개",
  "topic": "임플란트|교정|심미치료|보존치료|구강외과|예방·관리|소아치과|보험·비용 중 하나",
  "content": "<p>…</p> 형태의 본문 HTML"
}`
}

async function callLLM(env: AutoEnv, messages: any[], model: string): Promise<string> {
  const base = (env.OPENAI_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '')
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY || ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, response_format: { type: 'json_object' } }),
  })
  if (!r.ok) throw new Error(`LLM ${r.status} ${(await r.text()).slice(0, 200)}`)
  const j: any = await r.json()
  const c = j?.choices?.[0]?.message?.content
  if (!c) throw new Error('LLM 응답에 content 없음')
  return c
}

function parseDraft(raw: string): ColumnDraft {
  let s = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const o = JSON.parse(s)
  return (Array.isArray(o) ? o[0] : o) as ColumnDraft
}

async function loadColumns(env: AutoEnv): Promise<any[]> {
  const obj = await env.R2.get(COLUMNS_KEY)
  if (!obj) return []
  return await obj.json()
}

/* ────────────────────────── 썸네일 (Workers AI 런타임 생성) ──────────────────────────
   기존 74편 썸네일의 톤을 재현하는 고정 스타일 프롬프트.
   3D 클레이 / 파스텔 민트+피치 / 크림 배경 / 글자 없음.
   flux-1-schnell 은 1024x1024 고정 출력이다. 카드(.cc-thumb)와 목록(.dr-col-thumb)은
   aspect-ratio:16/9 + object-fit:cover 라 그대로 써도 되지만, 상세 히어로는
   1376x768 을 선언하고 있어 CLS 가 생긴다 → 렌더러에서 /api/images/* 는 별도 처리. */
/* v5.50a 실측 교훈: 색상을 형용사로만 주면(“pastel mint green and peach coral palette”)
   민트가 아예 빠진 결과가 나온다. 그리고 피사체가 작게 나오면 16:9 크롭에서 더 빈약해진다.
   → 민트를 '받침 원반'이라는 구조물로 못 박고, 피사체 크기를 명시한다. */
export const THUMB_STYLE = (subject: string) =>
  `3D clay render illustration, soft matte clay texture, ${subject}, ` +
  `resting on a pastel mint green rounded clay disc, peach coral clay subject, ` +
  `soft studio lighting, rounded friendly shapes, cream beige background, ` +
  `centered composition, subject fills most of the frame, ` +
  `no text, no letters, no words, no numbers`

/** 주제 → 영어 모티프. 검색어·키워드·카테고리를 붙인 문자열로 매칭한다. */
const MOTIF: [RegExp, string][] = [
  [/사랑니|매복|발치|뽑/, 'a single wisdom tooth gently held by rounded clay forceps'],
  [/임플란트|식립|뼈이식|골이식/, 'a clay dental implant screw standing beside a molar tooth'],
  [/교정|투명|브라켓|덧니|돌출입|정중선/, 'a single clay tooth with a tiny clay orthodontic bracket and wire on its front'],
  [/라미네이트|심미|미백|화이트닝|베니어|글로우네이트/, 'a bright glossy clay front tooth with a soft sparkle'],
  [/충치|레진|우식|때우/, 'a clay molar with a small dark cavity spot and a tiny clay filling piece'],
  [/신경치료|근관|크라운|보철|인레이|씌우/, 'a clay molar with a golden crown cap floating above it'],
  [/잇몸|치주|스케일링|풍치|치석|출혈/, 'clay gums cradling three teeth next to a soft rounded toothbrush'],
  [/틀니|의치/, 'a clay denture arch resting on a rounded pedestal'],
  [/소아|어린이|아이|유치|젖니/, 'a small smiling clay milk tooth character'],
  [/비용|가격|보험|실비|급여|할부|견적/, 'a clay tooth beside a small stack of clay coins and a tiny calculator'],
  [/턱|악관절|교합|이갈이|턱관절/, 'a clay lower jaw model with a soft glowing highlight at the joint'],
  [/구취|입냄새|구강건조|침/, 'a clay tooth with soft mint leaves and a gentle air swirl'],
  [/칫솔|양치|치실|가글|관리|예방/, 'a rounded clay toothbrush and dental floss spool beside a clean tooth'],
  [/사진|엑스레이|ct|파노라마|검진/i, 'a clay tooth next to a rounded clay magnifying glass'],
  [/치아|이빨|구강|치과|어금니|앞니/, 'a single stylized molar tooth'],
]
function motifOf(hint: string): string {
  for (const [re, m] of MOTIF) if (re.test(hint)) return m
  return 'a single stylized molar tooth beside a small rounded clay magnifying glass'
}

/** Workers AI 로 썸네일 1장 생성 → R2 저장 → 공개 경로 반환. 실패하면 null. */
export async function genThumb(env: AutoEnv, slug: string, hint: string): Promise<string | null> {
  if (!env.AI) return null
  try {
    const prompt = THUMB_STYLE(motifOf(hint))
    const out: any = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', { prompt })
    const b64 = out?.image
    if (typeof b64 !== 'string' || b64.length < 5000) return null
    const bin = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0))
    if (bin.length < 8000) return null            // 깨진 응답 방어
    const key = `column-thumbs/${slug}.jpg`
    await env.R2.put(key, bin, {
      httpMetadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' },
    })
    return `/api/images/${key}`
  } catch {
    return null   // 썸네일 실패가 발행을 막지는 않는다
  }
}

/* ────────────────────────── ★ v5.63 ③ 본문 삽화 (2026-08-07) ──────────────────────────
   실측: 81편 전부 본문 이미지 0장. 4,000자 넘는 글이 텍스트 벽으로만 이어져
   중간 이탈이 생기고, 이미지 검색 유입 경로도 통째로 비어 있었다.
   ⚠️ 크론 본문 생성이 이미 110초/125초를 쓰고 있으므로 삽화는 '별도 요청'에서 만든다.
   히어로 썸네일과 구도를 달리해(측면·수평) 같은 그림이 두 번 나오지 않게 한다. */
/** ★ v5.64 본문 삽화 전면 교체 (2026-08-07)
 *  ⚠️ 원장 판단: AI는 임필란트 스후·근관 단면·잔법 구조를 거의 다 틀리게 그린다.
 *  치사 컴럼에 틀린 구조도가 박혀 있으면 삽화가 아니라 사고다.
 *  → 구조물·진료장면을 전부 버리고, 「환자가 걱정하는 상황」을 귀엽게 그린다.
 *  치아·장비·기구는 프롬프트 단계에서 명시적으로 제외한다.
 *  ❗ 하이로 쓸네일(THUMB_STYLE)은 건드리지 않는다 — 원장 확정 지식. */
const FIG_STYLE = (subject: string) =>
  `cute 3D clay render illustration, soft matte clay texture, kawaii style, ` +
  `${subject}, ` +
  `chubby rounded simple shapes, tiny dot eyes and a simple curved mouth, ` +
  `pastel mint green and peach coral clay accents, cream beige background, ` +
  `soft diffused studio lighting, gentle warm mood, wide horizontal composition, ` +
  `centered, subject fills the frame, ` +
  `no text, no letters, no words, no numbers, ` +
  `no teeth, no tooth shapes, no gums, no jaw, no dental anatomy, ` +
  `no syringe, no drill, no dental instruments, no medical devices, ` +
  `no blood, no wounds, no realistic human faces`

/** 모티프 — 전부 「감정·상황」이다. 해부 구조는 한 개도 없다. */
const FIG_MOTIF: [RegExp, string][] = [
  // ── 공포·긴장 ──
  [/공포|무섭|긴장|부담|뜻부|떨린|트라우마|수면진정/,
   'a small round pastel clay character taking a deep calm breath, eyes gently closed, a tiny heart floating above, a soft folded blanket beside it'],
  // ── 통증·부기 ──
  [/통증|부기|봇기|심한|아파|쓰린|지읃|진통제/,
   'a small round pastel clay character resting one hand on its cheek with a worried expression, a light blue clay ice pack and a mug of warm water beside it'],
  // ── 음식·식사 ──
  [/음식|식사|식단|맑|죽|묹|샘백|커피|음주|담배|금연/,
   'a warm clay bowl of soft porridge with a small spoon, a cup of water and a soft banana, arranged in a row, a tiny happy clay character sitting beside them'],
  // ── 기간·경과·회복 ──
  [/며칠|기간|기다|회복|경과|날|주일|달|언제|시기|유지|수명|후얰상/,
   'a soft clay wall calendar with three small check marks and a tiny alarm clock, a small round clay character waving happily beside it'],
  // ── 밤·수면·이갈이 ──
  [/밤|자는|수면|이갈이|코골이|장치|퇴퇴|턱관절|이생통/,
   'a small round pastel clay character sleeping peacefully on a fluffy pillow, a crescent moon and two tiny stars floating above'],
  // ── 아이·소아 ──
  [/소아|어린이|아이|유치|젬니|도드라|어머니|부모|첨방|진정/,
   'a tiny round clay child character holding hands with a slightly larger clay parent character, a small clay teddy bear beside them'],
  // ── 상담·설명·결정 ──
  [/상담|설명|상담실|질문|궁금|선택|결정|반대|변화|차이|버하/,
   'two small round clay characters sitting across a low clay table talking, a small clay speech bubble and a clipboard between them'],
  // ── 관리·윈생·생할 ──
  [/양치|칫솔|치실|가글|관리|생할|윈생|스토리|예방|검진|정기/,
   'a soft clay bathroom shelf with a rounded cup, a folded towel and a small potted plant, a tiny cheerful clay character standing in front of it'],
  // ── 미소·자슰감·사진 ──
  [/미소|웃|사진|증명사진|자슰|생기는|인상|면접|결혼|예뻐|심미|하얀/,
   'a small round pastel clay character smiling brightly in front of a rounded clay mirror, three tiny sparkles floating around'],
  // ── 보장·사후처리·보험 ──
  [/보장|재치료|사후|A\/S|보험|생응|실패|다시|재수술/,
   'a soft clay shield badge with a small ribbon and a folded certificate, a tiny reassured clay character giving a thumbs up beside them'],
  // ── 비용 외 — 수치·자료 ──
  [/연구|논문|통계|자료|기준|학회|데이터|근거/,
   'a small round clay character holding a rounded clay book, a soft stack of papers and a magnifying glass beside it'],
  // ── 기본 (매칭 안 될 때) ──
  [/./,
   'a small round pastel clay character sitting on a soft clay cushion with a calm gentle smile, a mug of warm water and a tiny potted plant beside it'],
]
function figMotifOf(hint: string): string {
  for (const [re, m] of FIG_MOTIF) if (re.test(hint)) return m
  return 'four clay teeth of different shapes lined up on a clay platform'
}

/** 본문 삽화 1장 생성 → R2 저장 → 공개 경로 반환. 실패하면 null. */
export async function genFigure(env: AutoEnv, slug: string, hint: string): Promise<string | null> {
  if (!env.AI) return null
  try {
    const prompt = FIG_STYLE(figMotifOf(hint))
    const out: any = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', { prompt })
    const b64 = out?.image
    if (typeof b64 !== 'string' || b64.length < 5000) return null
    const bin = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0))
    if (bin.length < 8000) return null
    const key = `column-figures/${slug}.jpg`
    await env.R2.put(key, bin, {
      httpMetadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' },
    })
    return `/api/images/${key}`
  } catch {
    return null
  }
}

/** 폴백: 미리 만들어 둔 정적 썸네일 뱅크에서 미사용 1장 배정 */
async function takeBankThumb(env: AutoEnv, slug: string): Promise<string | null> {
  try {
    const row: any = await env.DB.prepare(
      `SELECT id, path FROM column_thumb_bank WHERE used = 0 ORDER BY id LIMIT 1`).first()
    if (!row) return null
    await env.DB.prepare(
      `UPDATE column_thumb_bank SET used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(slug, row.id).run()
    return row.path as string
  } catch {
    return null   // 뱅크 테이블이 없어도 파이프라인은 멈추지 않는다
  }
}

/** 썸네일 확보: Workers AI 우선 → 뱅크 폴백 → 없으면 null(렌더러가 플레이스홀더 처리) */
async function takeThumb(env: AutoEnv, slug: string, hint: string): Promise<string | null> {
  return (await genThumb(env, slug, hint)) || (await takeBankThumb(env, slug))
}

export interface RunResult {
  picked?: string
  slug?: string
  verdict: 'pass' | 'block' | 'error' | 'empty'
  attempts: number
  blocks?: string[]
  warns?: string[]
  metrics?: Record<string, any>
  ms: number
  /** ★ v5.55 2단계 발행: 썸네일 단계에 넘길 프롬프트 힌트 */
  thumbHint?: string
}

/** 하루 1회 실행되는 본체 */
/* ★ v5.55 실측 사고 (2026-08-03)
   한 건 발행이 125.1초가 걸려 Cloudflare 엣지의 응답 상한을 넘겼다(HTTP 524).
   크론 워커의 wallTime 도 125.086초로 정확히 일치 → 8/2·8/3 발행이 조용히 유실.
   내역: 본문 생성+게이트 64.3초 / 썸네일 생성+R2 커밋 60.8초.
   → skipThumb 로 썸네일을 떼어내 두 번의 짧은 요청으로 쪼갠다.
     ① POST /api/cron/publish-column?nothumb=1   (약 70초)
     ② POST /api/cron/thumb?slug=…&hint=…&patch=1 (약 55초)
   두 호출 모두 절벽 아래로 내려간다. 크론 워커의 scheduled() 는 엣지 상한이
   적용되지 않으므로(최대 15분) 순차로 두 번 부르면 된다. */
export async function runAutoPublish(env: AutoEnv, opts: { dryRun?: boolean; skipThumb?: boolean; maxAttempts?: number } = {}): Promise<RunResult> {
  const t0 = Date.now()
  // ★ v5.62 시간 예산 (2026-08-07)
  //   실측 사고: 8/6·8/7 크론 wallTime 125,074ms / 125,076ms → 엣지 응답 상한에서 잘려
  //   이틀 연속 조용한 유실(컬럼 80편 정체). 원인은 썸네일이 아니라
  //   「게이트 탈락 시 같은 요청 안에서 LLM 재호출」이었다.
  //   본문 생성 1회 실측 = 64s → 79s → 109s (프롬프트가 커지며 계속 늘었다).
  //   2회 호출하면 무조건 125초를 넘는다. → 요청 1개당 LLM 1회로 제한하고
  //   재시도는 크론 워커가 '새 요청'으로 돌린다(scheduled 수명은 15분).
  const budgetMs = 95_000        // 엣지 상한 125초 − 안전여유 30초
  const llmEstMs = 62_000        // 본문 생성 1회 실측 상한
  const maxAttempts = Math.max(1, Math.min(MAX_ATTEMPTS, opts.maxAttempts ?? MAX_ATTEMPTS))
  const model = env.AUTO_MODEL || DEFAULT_MODEL

  // ⓞ 좌초 행 회수 — 30분 넘게 'processing' 인 행은 실패로 보고 큐로 되돌린다.
  //   워커 요청이 중간에 취소되면(클라이언트 연결 끊김 등) 행이 processing 에 갇혀
  //   그 검색어가 영구히 발행되지 않는다. 무인 운영에서는 이게 조용한 유실이 된다.
  await env.DB.prepare(
    `UPDATE column_queue
     SET status = CASE WHEN attempts + 1 >= ? THEN 'draft' ELSE 'pending' END,
         attempts = attempts + 1,
         last_error = COALESCE(last_error, '') || ' | 좌초(processing 30분 초과) 회수',
         updated_at = CURRENT_TIMESTAMP
     WHERE status = 'processing'
       AND updated_at < datetime('now', '-30 minutes')`).bind(MAX_ATTEMPTS).run()

  // ① 큐 선점 — 동시 실행되어도 한 건만 잡히도록 status 조건을 UPDATE 에 건다
  // ★ v5.59 비용·금액성 주제 제외 (2026-08-06 원장 지시)
  //   이 컬럼은 논문 DOI 를 붙이는 의학 정보 글이다. 논문은 진료 효과를 뒷받침하지만
  //   한국의 진료비를 뒷받침하지 못한다. 「틀니 비용」 같은 검색어를 논문 인용 글로 쓰면
  //   논문이 가격표의 근거처럼 읽혀 글 전체의 신뢰가 무너진다. 게다가 금액은 반년이면
  //   틀린 정보가 되어 SEO 자산이 부채로 바뀐다. → 큐 단계에서 아예 뽑지 않는다.
  //   (해당 검색어는 큐에 남겨두되 status='skipped_cost' 로 빼서 기록을 보존한다)
  await env.DB.prepare(
    `UPDATE column_queue
     SET status='skipped_cost',
         last_error='v5.59 비용·금액성 주제 제외 (논문 근거 글에 부적합)',
         updated_at=CURRENT_TIMESTAMP
     WHERE status='pending' AND (${COST_LIKE_SQL})`).run()

  const cand: any = await env.DB.prepare(
    `SELECT * FROM column_queue WHERE status = 'pending' ORDER BY score DESC LIMIT 1`).first()
  if (!cand) return { verdict: 'empty', attempts: 0, ms: Date.now() - t0 }
  const claim = await env.DB.prepare(
    `UPDATE column_queue SET status='processing', updated_at=CURRENT_TIMESTAMP
     WHERE id = ? AND status='pending'`).bind(cand.id).run()
  if (!claim.meta.changes) return { verdict: 'empty', attempts: 0, ms: Date.now() - t0 }

  const existing = await loadColumns(env)
  const titles = existing.map((c: any) => c.title).filter(Boolean)
  const meta = { impressions: cand.impressions, ctr: cand.ctr, position: cand.position }

  // ★ v5.62 이전 요청의 게이트 지적을 D1 last_error 에서 복원한다.
  //   요청을 쪼개면 in-process feedback 이 사라져 LLM 이 같은 실수를 반복한다.
  let feedback: string[] | undefined =
    (Number(cand.attempts || 0) > 0 && cand.last_error)
      ? String(cand.last_error).split(' | ').map((x: string) => x.trim()).filter(Boolean).slice(0, 8)
      : undefined
  let last: GateResult | null = null
  // ★ v5.63 ① 도입 유형 순환 — 지금까지 발행된 컬럼 수를 기준으로 5유형을 돌린다.
  //   같은 요청 안에서 재시도해도 유형은 유지된다(게이트 지적만 고치게 한다).
  const introVariant = titles.length % 5
  let draft: ColumnDraft | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // ★ v5.62 예산 초과 → 재호출하지 않고 넘긴다(응답이 잘리는 편이 훨씬 나쁘다).
    if (attempt > 1 && Date.now() - t0 + llmEstMs > budgetMs) break
    try {
      const raw = await callLLM(env, [
        { role: 'system', content: systemPrompt(introVariant) },
        { role: 'user', content: userPrompt(cand.query, meta, titles, feedback) },
      ], model)
      draft = parseDraft(raw)
    } catch (e: any) {
      await logRun(env, cand, 'error', [String(e?.message || e)], null, null, model, Date.now() - t0)
      await env.DB.prepare(
        `UPDATE column_queue SET status='pending', attempts=attempts+1, last_error=?,
         updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(String(e?.message || e).slice(0, 400), cand.id).run()
      return { picked: cand.query, verdict: 'error', attempts: attempt, blocks: [String(e?.message || e)], ms: Date.now() - t0 }
    }

    last = await gateColumn(draft, { online: true, corpus: existing, layout: true })
    if (last.pass) break
    feedback = last.blocks
  }

  // ④ 판정
  if (!last || !last.pass) {
    await logRun(env, cand, 'block', last?.blocks || [], last?.metrics || null, draft?.slug || null, model, Date.now() - t0)
    await env.DB.prepare(
      `UPDATE column_queue SET status = CASE WHEN attempts+1 >= ? THEN 'draft' ELSE 'pending' END,
       attempts=attempts+1, last_error=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(MAX_ATTEMPTS, (last?.blocks || []).join(' | ').slice(0, 900), cand.id).run()
    return {
      picked: cand.query, slug: draft?.slug, verdict: 'block', attempts: MAX_ATTEMPTS,
      blocks: last?.blocks, warns: last?.warns, metrics: last?.metrics, ms: Date.now() - t0,
    }
  }

  // ⑤ 발행
  const now = new Date().toISOString()
  const thumbHint = [cand.query, draft!.focusKeyword || '', draft!.category || '', draft!.title || ''].join(' ')
  const thumb = (opts.dryRun || opts.skipThumb) ? null : await takeThumb(env, draft!.slug!, thumbHint)
  // ⚠️ 필드 정합 (v5.51 실측 사고)
  //   사이트 전체가 createdAt 기준으로 정렬한다(목록·관련글·사이트맵·RSS 등 13곳).
  //   createdAt 이 없으면 new Date(0) = 1970년으로 계산돼 새 글이 목록 맨 뒤로 밀린다.
  //   실제로 자동발행 3편이 전부 목록 하단에 처박혀 "발행이 안 됐다"고 보였다.
  //   doctorName / id 도 기존 74편이 모두 가진 필드다(저자 박스·구조화 데이터가 참조).
  //   category 는 기존 74편이 전부 '진료 이야기' 다 — 뱃지 표기를 통일한다.
  //   LLM 이 고른 진료과목은 topic 에 따로 담아 내부 분류로만 쓴다.
  const record: any = {
    id: `col-${Date.now()}-auto`,
    ...draft,
    category: '진료 이야기',
    doctorName: '문석준 원장',
    status: 'published',
    createdAt: now,
    publishedAt: now,
    updatedAt: now,
    autoGenerated: true,
    sourceQuery: cand.query,
    ...(thumb ? { thumbnailImage: thumb } : {}),
  }

  if (!opts.dryRun) {
    // ★ v5.58 R2 덮어쓰기 경합 방지 (2026-08-05 실측 사고)
    //   existing 은 작업 시작 시점(약 75초 전)에 읽은 스냅샷이다. 그 스냅샷에
    //   push 해서 통째로 put 하면, 그 사이에 추가된 컬럼이 조용히 사라진다.
    //   실제로 8/5 실행에서 verdict=pass 인데도 컬럼 수가 79편에서 늘지 않았다.
    //   → 쓰기 직전에 R2 를 다시 읽어 최신 배열에 append 한다.
    const fresh = await loadColumns(env)
    // 같은 slug 가 이미 있으면(중복 발행) 덧붙이지 않는다.
    if (fresh.some((x: any) => x?.slug === record.slug)) {
      await env.DB.prepare(
        `UPDATE column_queue SET status='published', slug=?, published_at=CURRENT_TIMESTAMP,
         last_error='중복 slug — 기존 발행 유지', updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(draft!.slug, cand.id).run()
      return {
        picked: cand.query, slug: draft!.slug, verdict: 'pass', attempts: 1,
        warns: [...(last.warns || []), '이미 같은 slug 가 발행돼 있어 덧붙이지 않았습니다'],
        metrics: last.metrics, thumbHint, ms: Date.now() - t0,
      }
    }
    fresh.push(record)
    await env.R2.put(COLUMNS_KEY, JSON.stringify(fresh), {
      httpMetadata: { contentType: 'application/json' },
    })
    await env.DB.prepare(
      `UPDATE column_queue SET status='published', slug=?, published_at=CURRENT_TIMESTAMP,
       last_error=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(draft!.slug, cand.id).run()
  } else {
    await env.DB.prepare(
      `UPDATE column_queue SET status='pending', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(cand.id).run()
  }
  await logRun(env, cand, 'pass', last.warns, last.metrics, draft!.slug!, model, Date.now() - t0)

  return {
    picked: cand.query, slug: draft!.slug, verdict: 'pass', attempts: 1,
    warns: last.warns, metrics: { ...last.metrics, thumbnail: thumb || '(썸네일 없음)' },
    thumbHint,
    ms: Date.now() - t0,
  }
}

async function logRun(env: AutoEnv, cand: any, verdict: string, reasons: string[] | undefined,
                      metrics: any, slug: string | null, model: string, ms: number) {
  try {
    await env.DB.prepare(
      `INSERT INTO column_auto_runs (queue_id, query, verdict, reasons, metrics, slug, model, ms)
       VALUES (?,?,?,?,?,?,?,?)`)
      .bind(cand.id, cand.query, verdict, JSON.stringify(reasons || []),
            JSON.stringify(metrics || {}), slug, model, ms).run()
  } catch { /* 로그 실패가 발행을 막지는 않는다 */ }
}
