-- Rename participant institution type column and store institution name.
SET search_path TO sigma_presensi;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sigma_presensi' AND table_name = 'peserta' AND column_name = 'institut_pendidikan'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sigma_presensi' AND table_name = 'peserta' AND column_name = 'jenis_institut_pendidikan'
  ) THEN
    ALTER TABLE peserta RENAME COLUMN institut_pendidikan TO jenis_institut_pendidikan;
  END IF;
END $$;

ALTER TABLE peserta
  ADD COLUMN IF NOT EXISTS nama_institut_pendidikan VARCHAR(200);

UPDATE peserta
SET nama_institut_pendidikan = jenis_institut_pendidikan::text
WHERE nama_institut_pendidikan IS NULL;

ALTER TABLE peserta
  ALTER COLUMN nama_institut_pendidikan SET NOT NULL;
