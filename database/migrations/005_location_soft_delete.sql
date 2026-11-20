-- Remove temporal validity fields and add soft-delete support for locations.
SET search_path TO sigma_presensi;

ALTER TABLE location DROP COLUMN IF EXISTS valid_from;
ALTER TABLE location DROP COLUMN IF EXISTS valid_to;
ALTER TABLE location ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ(6) NULL;

CREATE INDEX IF NOT EXISTS idx_location_deleted_at ON location (deleted_at);