#!/bin/bash
cd /home/user/webapp

echo "========== [3] 인터랙티브 기능 실제 동작 검증 =========="
echo ""
for f in checkup flight run symptom-checker; do
  echo "### $f.html ###"
  printf " - canvas:%s input:%s button:%s\n" \
    "$(grep -c '<canvas' $f.html)" "$(grep -c '<input' $f.html)" "$(grep -c '<button' $f.html)"
  printf " - JS함수:%s  fetch호출:%s\n" \
    "$(grep -cE 'function |=>|addEventListener' $f.html)" "$(grep -c 'fetch(' $f.html)"
  printf " - 호출 API: "
  grep -oE '/api/[a-z/-]+' $f.html | sort -u | tr '\n' ' '
  echo ""
  echo ""
done

echo "========== [4] 예약폼 & AI챗봇 검증 =========="
echo ""
echo "### reservation.html ###"
printf " - form:%s  fetch호출:%s\n" "$(grep -c '<form' reservation.html)" "$(grep -c 'fetch(' reservation.html)"
printf " - 호출 API: "
grep -oE '/api/[a-z/-]+' reservation.html | sort -u | tr '\n' ' '
echo ""
printf " - 입력필드: "
grep -oE 'name="[a-z_]+"' reservation.html | sort -u | tr '\n' ' '
echo ""
echo ""
echo "### AI 챗봇 ###"
printf " - OPENAI_API_KEY 참조: %s회\n" "$(grep -c 'OPENAI_API_KEY' src/index.tsx)"
printf " - 챗봇 모델: "
grep -oE 'gpt-[0-9a-z.-]+' src/index.tsx | sort -u | tr '\n' ' '
echo ""
printf " - 챗봇 UI 위젯 흔적(index.html): %s회\n" "$(grep -ciE 'chat-widget|chatbot|chat-bubble|챗봇|상담봇|ai-chat' index.html)"
echo ""

echo "========== [5] 게임/체커 결과 → 다음 행동(CTA) 연결 여부 =========="
echo ""
for f in checkup flight run symptom-checker; do
  printf "### %s: 결과화면에 예약/상담 CTA " "$f"
  grep -ciE 'reservation|예약|상담|kakao|카카오|tel:' $f.html
done
echo ""

echo "========== [6] 결제/할부/온라인결제 흔적 =========="
grep -ciE 'payment|결제|toss|iamport|카드결제|portone' index.html pricing.html reservation.html 2>/dev/null

echo ""
echo "========== [7] DB/R2 바인딩 실제 사용처 =========="
printf " - env.DB 사용: %s회 / env.R2 사용: %s회 / env.KV: %s회\n" \
  "$(grep -c 'env\.DB' src/index.tsx)" "$(grep -c 'env\.R2' src/index.tsx)" "$(grep -c 'env\.KV' src/index.tsx)"
