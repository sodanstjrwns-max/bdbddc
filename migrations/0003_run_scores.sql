-- TOOTH RUN scores table
CREATE TABLE IF NOT EXISTS run_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survival_time REAL NOT NULL,
  grade TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_run_scores_time ON run_scores(survival_time DESC);
CREATE INDEX IF NOT EXISTS idx_run_scores_created ON run_scores(created_at);
