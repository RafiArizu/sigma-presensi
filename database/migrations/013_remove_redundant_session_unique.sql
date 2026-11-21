-- Keep one canonical daily-session uniqueness rule per participant.
SET search_path TO sigma_presensi;

DROP INDEX IF EXISTS uq_work_sessions_shift_participant_date;
