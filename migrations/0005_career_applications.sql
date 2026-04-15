-- 채용 지원서 테이블
CREATE TABLE IF NOT EXISTS career_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  birth TEXT,
  position TEXT NOT NULL,
  experience TEXT,
  work_days TEXT,
  start_date TEXT,
  license TEXT,
  message TEXT,
  careers TEXT,            -- JSON array: [{company, period, role}]
  photo_key TEXT,          -- R2 image key
  status TEXT DEFAULT 'new',  -- new, reviewing, contacted, rejected, hired
  admin_note TEXT,
  email_sent INTEGER DEFAULT 0,
  applied_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_career_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applied ON career_applications(applied_at);
