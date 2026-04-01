-- 치석 플라이트 점수 테이블
CREATE TABLE IF NOT EXISTS flight_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flight_score ON flight_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_flight_created_at ON flight_scores(created_at);
