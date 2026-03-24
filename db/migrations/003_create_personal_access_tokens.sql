-- Sanctum-style personal access tokens for secure API authentication

CREATE TABLE IF NOT EXISTS personal_access_tokens (
  id BIGSERIAL PRIMARY KEY,
  tokenable_type VARCHAR(100) NOT NULL DEFAULT 'users',
  tokenable_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  abilities JSONB,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_tokens_user FOREIGN KEY (tokenable_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tokens_tokenable ON personal_access_tokens (tokenable_id, tokenable_type);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON personal_access_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_tokens_deleted_at ON personal_access_tokens (deleted_at);
