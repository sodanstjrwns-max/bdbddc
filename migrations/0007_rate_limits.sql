-- Rate limiting 테이블 (분산 엣지 환경에서도 동작하는 공유 카운터)
-- in-memory Map은 Workers isolate 간 공유되지 않아 무력화되므로 D1로 대체
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,            -- "scope:ip" (예: "chat:1.2.3.4")
  ts INTEGER NOT NULL           -- 요청 시각 (epoch ms)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_ts ON rate_limits(key, ts);
