-- 페이지 조회수 추적 테이블
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_type TEXT NOT NULL,       -- 'case', 'column', 'notice'
  page_id TEXT NOT NULL,         -- 콘텐츠 ID
  view_count INTEGER DEFAULT 0,
  last_viewed_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- 복합 인덱스: page_type + page_id 조합으로 빠른 조회
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_views_type_id ON page_views(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_count ON page_views(view_count DESC);
