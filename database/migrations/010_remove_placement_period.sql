-- Placement stores the participant/staff relation only.
-- Participant prakerin period is the source of truth in peserta.
SET search_path TO sigma_presensi;

ALTER TABLE placements
  DROP COLUMN IF EXISTS program_type,
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS end_date;
