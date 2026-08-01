-- 컬럼 자동발행 큐 (A+C 전략: GSC 미커버 키워드 영구 채굴)
-- v5.50 / 2026-08-01
--
-- 설계 메모
--  · 소스는 scripts/column-queue.py 산출물(column-queue.json)의 task='new-column' 행
--  · status 흐름: pending → processing → published | draft
--    - draft: 품질 게이트 3회 연속 탈락. 사람이 볼 때까지 자동 재시도 없음
--  · position(게재순위)을 반드시 보관한다. 2026-08-01 백과사전 오판의 교훈 —
--    노출·CTR만 보고 "CTR 개선 기회"라 판단했으나 실제로는 3위 제로클릭이었다.
--    순위 없이 기회를 계산하면 또 틀린다.

CREATE TABLE IF NOT EXISTS column_queue (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  query        TEXT NOT NULL UNIQUE,      -- GSC 검색어 = 컬럼 주제
  impressions  INTEGER NOT NULL DEFAULT 0,
  clicks       INTEGER NOT NULL DEFAULT 0,
  ctr          REAL    NOT NULL DEFAULT 0, -- %
  position     REAL,                       -- GSC 게재순위 (없으면 NULL)
  coverage     REAL    NOT NULL DEFAULT 0, -- 기존 코퍼스 최대 유사도
  nearest      TEXT,                       -- 최근접 기존 페이지
  score        REAL    NOT NULL DEFAULT 0, -- 기회점수 (발행 우선순위)
  status       TEXT    NOT NULL DEFAULT 'pending',
  attempts     INTEGER NOT NULL DEFAULT 0,
  slug         TEXT,                       -- 발행된 컬럼 slug
  last_error   TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_cq_pick   ON column_queue(status, score DESC);
CREATE INDEX IF NOT EXISTS idx_cq_status ON column_queue(status);

-- 실행 로그: 게이트가 무엇을 왜 막았는지 반드시 남긴다.
-- 자동발행의 신뢰는 "막힌 이유가 보인다"에서 나온다.
CREATE TABLE IF NOT EXISTS column_auto_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  queue_id    INTEGER,
  query       TEXT,
  verdict     TEXT,        -- pass | block | error
  reasons     TEXT,        -- 게이트 탈락 사유 JSON 배열
  metrics     TEXT,        -- 측정값 JSON (길이/H3/표/DOI/중복률…)
  slug        TEXT,
  model       TEXT,
  ms          INTEGER,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_car_created ON column_auto_runs(created_at DESC);
