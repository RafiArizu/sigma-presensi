-- Keep institution data in peserta only; placement stores participant/staff relation.
SET search_path TO sigma_presensi;

ALTER TABLE placements
  DROP COLUMN IF EXISTS institution_name;
