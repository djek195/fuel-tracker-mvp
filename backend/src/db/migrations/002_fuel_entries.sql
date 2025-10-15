-- 002_fuel_entries.sql
-- Make schema idempotent and self-healing across environments.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Ensure table exists (minimal definition)
CREATE TABLE IF NOT EXISTS fuel_entries (
                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE
    );

-- 2) Ensure all required columns exist
ALTER TABLE fuel_entries
    ADD COLUMN IF NOT EXISTS occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS odometer        NUMERIC(10,1),
    ADD COLUMN IF NOT EXISTS volume          NUMERIC(10,3),
    ADD COLUMN IF NOT EXISTS price_total     NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS price_per_unit  NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS is_full         BOOLEAN      NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS missed_fillups  SMALLINT     NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS note            TEXT,
    ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now();

-- 3) Constraints (by name if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fuel_entries_volume_check') THEN
ALTER TABLE fuel_entries ADD CONSTRAINT fuel_entries_volume_check CHECK (volume IS NULL OR volume > 0);
END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fuel_entries_odometer_check') THEN
ALTER TABLE fuel_entries ADD CONSTRAINT fuel_entries_odometer_check CHECK (odometer IS NULL OR odometer >= 0);
END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fuel_entries_price_total_check') THEN
ALTER TABLE fuel_entries ADD CONSTRAINT fuel_entries_price_total_check CHECK (price_total IS NULL OR price_total >= 0);
END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fuel_entries_price_per_unit_check') THEN
ALTER TABLE fuel_entries ADD CONSTRAINT fuel_entries_price_per_unit_check CHECK (price_per_unit IS NULL OR price_per_unit >= 0);
END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fuel_entries_missed_fillups_check') THEN
ALTER TABLE fuel_entries ADD CONSTRAINT fuel_entries_missed_fillups_check CHECK (missed_fillups >= 0);
END IF;
END $$;

-- 4) Indexes
CREATE INDEX IF NOT EXISTS fuel_entries_vehicle_date_idx ON fuel_entries (vehicle_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS fuel_entries_user_idx         ON fuel_entries (user_id);