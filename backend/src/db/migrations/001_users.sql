-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table for session-store (created manually to avoid race conditions on first start)
CREATE TABLE IF NOT EXISTS user_sessions (
    sid TEXT PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS user_sessions_expire_idx ON user_sessions (expire);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    currency TEXT,
    distance_unit TEXT,   -- field name corrected
    volume_unit TEXT,
    time_zone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users (LOWER(email));

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- was uuid_generate_v4(), now consistent with pgcrypto
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year INT,
    fuel_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT vehicles_unique_userid_name UNIQUE (user_id, name)
);

-- Case-insensitive uniqueness for (user_id, name)
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_user_lower_name_uq
    ON vehicles (user_id, LOWER(name));

-- Helper index for user's vehicle list
CREATE INDEX IF NOT EXISTS vehicles_user_id_idx ON vehicles(user_id);