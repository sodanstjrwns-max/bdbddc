# BD PLAY — 2026-10-07

기존 `/games`, `/flight`, `/run`, `/game/cavity-defense`를 유지하는 개편입니다.

- Flight / Run: Three.js 0.180.0으로 캐릭터·적·아이템·발사체를 실제 3D mesh로 표시합니다. 기존 좌표와 충돌 판정은 유지합니다. WebGL 초기화 실패 시 기존 Canvas 2D 렌더러가 동작하고, 실행 중 context loss 시 일시정지 후 기본 그래픽으로 계속할 수 있습니다.
- Flight: E 또는 화면 버튼으로 충격파. 반경220px, 피해4, 보호막1.2초. 시간 및 일반 격파로 충전하며 자신의 충격파 격파는 다시 충전하지 않습니다. 커피 분열·점수·콤보는 일반 발사체와 `destroyEnemyAt`을 공유합니다.
- Run: 공중에서 한 번 더 점프. 세 번째 점프는 막히며 착지 시 충전됩니다. 기존 캐릭터 해금·선택·기록 보존.
- Defense: 생성한 전장 아트 + PixiJS 8.6.6의 실시간 유닛·경로·파티클. 다음 웨이브의 실제 편성을 HUD에 표시. READY=0 복원, 일시정지 중 애니메이션 정지, 회전 시 캔버스/메뉴 좌표 조정, 재시작 리소스 정리.
- 소리는 기본 꺼짐. 비행/러닝은 공통 효과음, 디펜스는 기존 WebAudio 유지. `prefers-reduced-motion`에서는 장식 전환/카메라 흔들림을 줄입니다. 게임 진행에 필요한 움직임은 유지합니다.
- 점수 API·회원·예약·분석 정의 변경 없음. 게임 중 겹치던 상담/언어 플로팅 UI만 숨깁니다. 게임 점수는 구강 건강 평가가 아닙니다.

## 자산

`images/arcade/enamel-world.webp`, `enamel-valley.webp`, `defense-island.webp`: 내장 imagegen으로 생성한 런치/환경/전장 아트. PNG 원본을 보존하고 ffmpeg libwebp로 변환. 실제 플레이는 Three.js/PixiJS이며 Unreal Engine을 사용하지 않습니다.

- 런치: ivory tooth hero with brass jetpack, floating enamel mountains, teal river, golden evening light, cinematic 3D art, no text.
- 환경: same enamel world without the hero, distant tooth mountains and floating islands, open teal river, no text/UI.
- 전장: top-down portrait floating slate island, open calm stone center, perimeter enamel monoliths and mint crystals, brass accents, no units/roads/UI.

원본/프롬프트/시각검수/스크린샷: `/Users/msj/bddc/reports/2026-10-07-play-upgrade/`. Hub `*-preview.webp`는 개편 게임의 실제 브라우저 플레이 캡처입니다.

Three.js와 PixiJS는 pinned 버전을 자체 호스팅하며 MIT LICENSE를 `js/arcade/vendor/`에 보존합니다. 추가 유료 API나 런타임 생성 호출은 없습니다.

## 검증

브라우저 회귀 스크립트 `gameplay-qa.cjs`(위 보고서 폴더): 1280/390/320px에서 시작·이동·2단 점프 제한·충격파 범위/분열/충전·아이템·피격·일시정지·재시작·WebGL loss fallback, 디펜스 타워 배치/웨이브/속도/회전/재시작. 검사 중 POST를 차단하여 테스트 점수를 운영 랭킹에 남기지 않습니다.

새 자산/CSS/JS 버전, HTTP 응답, 정적 파일 SHA와 실제 운영 플레이를 배포 후 별도 확인합니다. 브라우저 에뮬레이션 검증은 모든 실제 휴대폰의 성능 검증을 뜻하지 않습니다.
