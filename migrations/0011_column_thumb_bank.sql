-- 컬럼 썸네일 뱅크 (v5.50)
--
-- 왜 '뱅크'인가
--   · 썸네일은 /images/column/*.jpg 로 서빙된다. 이 경로는 _routes.json exclude 라
--     워커를 우회하는 CDN 정적 자산이므로 런타임에 새 파일을 만들어 넣을 수 없다.
--   · LLM 프록시의 이미지 생성 엔드포인트는 403(미지원)으로 확인됐다.
--   → 현재 비주얼 스타일(3D 클레이 렌더 / 민트+피치 / 텍스트 없음 / 1376×768)로
--     미리 생성해 배포해 둔 썸네일 풀에서 발행 시 1장씩 배정한다.
--     이 구조 덕에 컬럼 자동발행에는 재배포가 전혀 필요 없다.
--
-- 뱅크가 비면 썸네일 없이 발행된다(렌더러가 thumbnailImage 부재를 이미 처리함).
-- 잔량은 /api/cron/status 로 확인하고, 소진 전에 보충한다.

CREATE TABLE IF NOT EXISTS column_thumb_bank (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  path     TEXT NOT NULL UNIQUE,   -- 예: /images/column/bank/clay-mint-01.jpg
  tone     TEXT,                   -- 색조/모티브 메모 (배정 다양성 관리용)
  used     INTEGER NOT NULL DEFAULT 0,
  used_by  TEXT,                   -- 배정된 컬럼 slug
  used_at  DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ctb_used ON column_thumb_bank(used, id);
