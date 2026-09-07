CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campuses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('GH', 'NG')),
  city TEXT NOT NULL,
  initials TEXT NOT NULL,
  email_domain TEXT,
  status TEXT NOT NULL DEFAULT 'official' CHECK (status IN ('official', 'user_added', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campus_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('GH', 'NG')),
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  username CITEXT UNIQUE,
  about TEXT NOT NULL DEFAULT '',
  avatar_key TEXT,
  campus_id TEXT REFERENCES campuses (id),
  verified TEXT NOT NULL DEFAULT 'unverified' CHECK (verified IN ('unverified', 'pending', 'verified')),
  school_email TEXT NOT NULL DEFAULT '',
  two_step_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  low_data_mode BOOLEAN NOT NULL DEFAULT TRUE,
  auto_download_photos BOOLEAN NOT NULL DEFAULT FALSE,
  auto_download_documents BOOLEAN NOT NULL DEFAULT FALSE,
  show_last_seen BOOLEAN NOT NULL DEFAULT TRUE,
  read_receipts BOOLEAN NOT NULL DEFAULT TRUE,
  show_campus_badge BOOLEAN NOT NULL DEFAULT TRUE,
  notifications JSONB NOT NULL DEFAULT '{
    "messages": true,
    "groups": true,
    "preview": true,
    "sound": true,
    "vibrate": false
  }'::jsonb,
  theme_mode TEXT NOT NULL DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark', 'system')),
  theme_color TEXT NOT NULL DEFAULT '#145C38',
  wallpaper TEXT NOT NULL DEFAULT '#FFFFFF',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campuses_name_idx ON campuses (lower(name));
CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens (user_id);
