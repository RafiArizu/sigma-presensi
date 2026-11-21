-- Username foundation for participant account creation.
SET search_path TO sigma_presensi;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sigma_presensi' AND table_name = 'users' AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'sigma_presensi' AND table_name = 'users' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE users RENAME COLUMN name TO user_name;
  END IF;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS user_name VARCHAR(150);
ALTER TABLE users ALTER COLUMN user_name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_user_name_lower
  ON users (LOWER(user_name));

ALTER TABLE placements ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ(6) NULL;
CREATE INDEX IF NOT EXISTS idx_placements_staff_active
  ON placements (staff_user_id, deleted_at, status);
CREATE INDEX IF NOT EXISTS idx_placements_participant_active
  ON placements (participant_user_id, deleted_at);
