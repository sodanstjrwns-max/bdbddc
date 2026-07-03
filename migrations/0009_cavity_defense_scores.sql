-- CAVITY DEFENSE scores table (주간 리더보드)
CREATE TABLE IF NOT EXISTS cavity_defense_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  stage INTEGER NOT NULL DEFAULT 1,
  wave INTEGER NOT NULL DEFAULT 0,
  cleared INTEGER NOT NULL DEFAULT 0,
  rank_name TEXT,
  week_key TEXT NOT NULL,            -- 'YYYY-WW' 주간 리셋 키
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cd_scores_week ON cavity_defense_scores(week_key, score DESC);
CREATE INDEX IF NOT EXISTS idx_cd_scores_created ON cavity_defense_scores(created_at);
