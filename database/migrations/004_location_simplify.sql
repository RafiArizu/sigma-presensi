-- Simplify location identity: address is the user-facing location label.
SET search_path TO sigma_presensi;

ALTER TABLE location DROP CONSTRAINT IF EXISTS uq_location_code_version;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sigma_presensi' AND table_name = 'location' AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sigma_presensi' AND table_name = 'location' AND column_name = 'alamat'
  ) THEN
    ALTER TABLE location RENAME COLUMN name TO alamat;
  END IF;
END $$;

ALTER TABLE location DROP COLUMN IF EXISTS location_code;
ALTER TABLE location DROP COLUMN IF EXISTS version;