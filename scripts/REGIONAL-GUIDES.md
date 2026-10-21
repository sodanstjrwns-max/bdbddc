# 지역 × 진료 안내 운영

8개 지역(천안·아산·예산·서산·홍성·당진·평택·안성), 9개 범주(치과·임플란트·임플란트 재수술·치아교정·라미네이트·인비절라인·구강내과·풀아치 하이브리드 임플란트·턱관절)를 다룬다.

## URL과 원고 원본

- 치과 허브는 기존 `/area/<region>`을 유지한다.
- 천안의 8개 진료는 기존 `/treatments/*`가 대표 URL이다. 라미네이트는 `/treatments/glownate`이다. 중복되는 천안 지역 진료 URL을 새로 만들지 않는다.
- 아산 허브·임플란트·교정·인비절라인은 기존 상세 원고를 보존한다.
- 새로 작성하거나 재작성한 60개 페이지의 편집 원본은 `src/data/regional-guides/*.json`이다. `doctors.json`은 공개 프로필의 사실·출처 위치를 담는다.
- `scripts/templates/regional-guide.html`은 공통 사이트 외곽, `public/static/regional-guide.css`는 이 페이지군의 스타일이다.
- 범위와 URL 매핑은 `scripts/build-regional-guides.mjs`가 관리한다. 다른 진료·지역을 임의로 추가하지 않는다.

## 편집과 확인

SSD 원본에서 프로젝트 지침에 따라 변경한 뒤 `npm run build:regional-guides`를 실행한다. 원고를 HTML로 렌더링하고, 기존 아산 상세페이지·천안 진료페이지·홈에서 지역 안내로 이어지는 링크와 새 사이트맵 항목을 맞춘다. 이미 있는 URL의 과거 발행 의미를 바꾸거나 다른 날의 사이트맵 전체를 임의 갱신하지 않는다.

`npm run test:regional-guides`는 72개 대표 조합, 원고 60개, 최소 분량, 제목·메타·canonical·FAQ의 일치, 실제 천안 주소와 본문 앵커, 홈부터의 링크 경로를 확인한다. 지역명을 가린 같은 진료 원고의 문자 구간 겹침도 보고한다. 이 수치는 편집 점검용이며 검색엔진의 중복 판단·순위·색인을 보증하지 않는다. 의학적 사실은 유사도를 낮추기 위해 바꾸지 않는다.

의료진 경력·수가·진료 시간은 현재 공개 원본에서 확인한다. 실제 진료 장소는 천안 불당동이며 지역 분원이 있는 것으로 표현하지 않는다. 사례·결과·무통·기간을 만들거나, 환자 리뷰·별점·만족도·Review/AggregateRating을 넣지 않는다. 외부 네이버·구글 리뷰 링크는 공통 `review-links.cjs`를 사용한다.

## 치료 영상

기존 Patient Connect 자료를 `treatment-connect-videos.json`과 `treatment-connect-library.json`의 주제·미디어 키로 연결한다. 원본 전체 사용이 허용되지 않은 영상은 기존 검수된 발췌만 사용한다. 일반 교육 영상과 해당 환자분의 실제 치료 계획을 구별한다. `regional-guides-media.json`은 페이지에 보이는 설명으로, 원본의 강한 표현을 무비판적으로 복사하지 않는다.

새 선택 또는 파일 변경 시 BDDC의 `docs/knowledge/dental-media-quality.md`에 따라 최신 전체 인벤토리·해시·근거를 확인한다. 과거 통과가 현재 파일과 일치하는 경우에만 검수 결과를 재사용한다. 제한된 표본 시각검수를 전프레임 검수나 임상 승인으로 기록하지 않는다.

## 배포 확인

로컬 SEO·환자 여정 회귀 검사, 엄격 타입 검사, `git diff --check`, 빌드를 수행한다. 정식 Cloudflare Pages 프로젝트는 `seoul-bd-dental`이며 Git push와 실제 운영 배포는 별도다.

빌드한 결과를 기준으로 `node scripts/verify-regional-guides-live.mjs <origin> <새 SSD 감사파일.json>`을 실행한다. 72개 페이지의 HTTP·본문·메타·canonical·색인 허용·FAQ·사이트맵, 연결 URL과 앵커, 이미지·영상 응답 및 신규 CSS 동일성을 확인한다. 상세 원고의 PC·모바일 배치, 영상 실제 재생은 브라우저에서 따로 확인한다. IndexNow 접수는 색인 완료와 구별하고 기존 접수 기록을 보존한다.
