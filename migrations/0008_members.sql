-- 회원 데이터 R2 JSON → D1 이관
-- R2 members.json은 동시 가입 시 race condition(마지막 쓰기 승리) 위험이 있어 D1로 이관
-- 기존 R2 데이터는 코드 레벨 lazy migration으로 1회 자동 임포트 (data/members.json은 백업으로 보존)
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  password_hash TEXT DEFAULT '',
  password_salt TEXT DEFAULT '',
  google_id TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  provider TEXT DEFAULT 'email',
  privacy_consent INTEGER DEFAULT 1,
  marketing_consent INTEGER DEFAULT 0,
  marketing_consent_updated_at TEXT DEFAULT '',
  reset_token_hash TEXT DEFAULT '',
  reset_token_expires INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_created ON members(created_at);
