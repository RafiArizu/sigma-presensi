-- Security hardening for PostgreSQL runtime.
SET search_path TO sigma_presensi;

CREATE TABLE IF NOT EXISTS public.express_sessions (
  sid VARCHAR(255) NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMPTZ(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_express_sessions_expire ON public.express_sessions (expire);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (LOWER(email)) WHERE email IS NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('peserta', 'staff_presensi', 'super_admin'));
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('invited', 'active', 'inactive'));
ALTER TABLE attendance_photos DROP CONSTRAINT IF EXISTS attendance_photos_status_check;
ALTER TABLE attendance_photos ADD CONSTRAINT attendance_photos_status_check CHECK (status IN ('temporary', 'available', 'deleted'));
