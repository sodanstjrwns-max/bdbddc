-- ============================================
-- 0006: 페이지 조회 상세 로그 (진짜 트래픽 분석용)
-- ============================================
-- 목적:
--   기존 page_views(누적 카운터)와 별개로,
--   매 조회마다 1줄씩 상세 기록을 남긴다.
--   → 진짜 일/주/월 트래픽 + 봇 분리 + IP 중복제거 가능
--
-- 기존 page_views 테이블은 그대로 보존 (누적 1,225회 데이터 유지)

CREATE TABLE IF NOT EXISTS page_view_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  page_type   TEXT    NOT NULL,         -- 'case' | 'column' | 'notice'
  page_id     TEXT    NOT NULL,         -- 콘텐츠 ID
  ip_hash     TEXT,                     -- IP의 SHA-256 해시 앞 16자 (개인정보 보호)
  ua_short    TEXT,                     -- User-Agent 앞 200자
  is_bot      INTEGER NOT NULL DEFAULT 0,  -- 0 = 사람, 1 = 봇/크롤러
  bot_name    TEXT,                     -- 'googlebot' | 'bingbot' | 'yetibot' | 'gptbot' | ...
  referer     TEXT,                     -- Referer 헤더 앞 200자 (트래픽 소스 추적용)
  country     TEXT,                     -- Cloudflare CF-IPCountry 헤더
  viewed_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 인덱스: 시간 범위 + 타입별 집계용
CREATE INDEX IF NOT EXISTS idx_pvl_viewed_at      ON page_view_logs(viewed_at);
CREATE INDEX IF NOT EXISTS idx_pvl_type_viewed    ON page_view_logs(page_type, viewed_at);
CREATE INDEX IF NOT EXISTS idx_pvl_is_bot_viewed  ON page_view_logs(is_bot, viewed_at);
CREATE INDEX IF NOT EXISTS idx_pvl_page           ON page_view_logs(page_type, page_id, viewed_at);

-- IP 기반 중복 조회 차단용 (같은 IP가 같은 페이지를 1분 이내 재조회하면 무시)
CREATE INDEX IF NOT EXISTS idx_pvl_dedupe ON page_view_logs(page_type, page_id, ip_hash, viewed_at);
