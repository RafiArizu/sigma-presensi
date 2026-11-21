-- Restrict participant/staff uniqueness to active placements only.
SET search_path TO sigma_presensi;

DROP INDEX IF EXISTS uq_active_placement_participant_staff;
CREATE UNIQUE INDEX uq_active_placement_participant_staff
  ON placements (participant_user_id, staff_user_id)
  WHERE deleted_at IS NULL AND status = 'Aktif'::record_status;
