-- Add explicit active state for locations.
SET search_path TO sigma_presensi;

DO $$
BEGIN
  CREATE TYPE location_status AS ENUM ('Non Aktif', 'Aktif');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE location
  ADD COLUMN IF NOT EXISTS status location_status NOT NULL DEFAULT 'Aktif';