-- ChBTI (치BTI) 참여 결과 테이블
CREATE TABLE IF NOT EXISTS chbti_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_code TEXT NOT NULL,       -- e.g. 'PCSA', 'ENHF'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 빠른 통계 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_chbti_type_code ON chbti_results(type_code);
CREATE INDEX IF NOT EXISTS idx_chbti_created_at ON chbti_results(created_at);
