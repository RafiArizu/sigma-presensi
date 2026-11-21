import { pool } from '../config/database.js';
import { hashPassword } from './password.js';

const defaultParticipantPassword = 'prakerin@vt.net';

type ParticipantInput = {
  name: string;
  email?: string | null;
  phone: string;
  institutionType: 'Sekolah' | 'Perguruan Tinggi';
  institutionName: string;
  programType: 'PKL' | 'Magang/Kerja Praktik';
  startDate: string;
  endDate: string;
};

function usernameBase(name: string): string {
  const base = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120);
  return base || 'peserta';
}

function isDuplicateError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505';
}

async function nextUsername(client: import('pg').PoolClient, name: string, startDate: string): Promise<string> {
  const base = `${usernameBase(name)}_${startDate.replaceAll('-', '')}`;
  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}_${suffix + 1}`;
    const result = await client.query('SELECT 1 FROM sigma_presensi.users WHERE LOWER(user_name) = LOWER($1) LIMIT 1', [candidate]);
    if (result.rowCount === 0) return candidate;
  }
  throw new Error('PARTICIPANT_USERNAME_UNAVAILABLE');
}

const selectByPlacement = `
  SELECT
    pl.id::text AS placement_id,
    p.user_id::text AS participant_user_id,
    u.user_name,
    u.email,
    p.nama_lengkap AS participant_name,
    p.no_telp AS phone,
    p.jenis_institut_pendidikan::text AS institution_type,
    p.nama_institut_pendidikan AS institution_name,
    p.jenis_prakerin::text AS program_type,
    p.mulai_prakerin AS start_date,
    p.selesai_prakerin AS end_date,
    pl.status::text AS placement_status
  FROM sigma_presensi.placements pl
  JOIN sigma_presensi.peserta p ON p.user_id = pl.participant_user_id
  JOIN sigma_presensi.users u ON u.id = p.user_id
  WHERE pl.id = $1 AND pl.staff_user_id = $2
    AND pl.deleted_at IS NULL AND p.deleted_at IS NULL AND u.deleted_at IS NULL
    AND u.role = 'peserta'
`;

export async function listStaffParticipants(staffUserId: string) {
  const result = await pool.query(`${selectByPlacement.replace('WHERE pl.id = $1 AND pl.staff_user_id = $2', 'WHERE pl.staff_user_id = $1')} ORDER BY CASE WHEN pl.status = 'Aktif' THEN 0 ELSE 1 END, p.nama_lengkap`, [staffUserId]);
  return result.rows;
}

export async function findStaffParticipant(staffUserId: string, placementId: string) {
  const result = await pool.query(selectByPlacement, [placementId, staffUserId]);
  return result.rows[0] ?? null;
}

export async function createStaffParticipant(staffUserId: string, input: ParticipantInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userName = await nextUsername(client, input.name, input.startDate);
    const passwordHash = await hashPassword(defaultParticipantPassword);
    const userResult = await client.query<{ id: string; user_name: string }>(
      `INSERT INTO sigma_presensi.users (user_name, email, password_hash, role, status)
       VALUES ($1, NULLIF($2, ''), $3, 'peserta', 'active')
       RETURNING id::text, user_name`,
      [userName, input.email ?? '', passwordHash],
    );
    const user = userResult.rows[0];
    if (!user) throw new Error('PARTICIPANT_USER_CREATE_FAILED');

    await client.query(
      `INSERT INTO sigma_presensi.peserta
       (user_id, nama_lengkap, no_telp, jenis_institut_pendidikan, nama_institut_pendidikan, jenis_prakerin, mulai_prakerin, selesai_prakerin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [user.id, input.name, input.phone, input.institutionType, input.institutionName, input.programType, input.startDate, input.endDate],
    );
    const placementResult = await client.query<{ id: string }>(
      `INSERT INTO sigma_presensi.placements
       (participant_user_id, staff_user_id, status)
       VALUES ($1, $2, 'Aktif') RETURNING id::text`,
      [user.id, staffUserId],
    );
    await client.query('COMMIT');
    return findStaffParticipant(staffUserId, placementResult.rows[0].id);
  } catch (error) {
    await client.query('ROLLBACK');
    if (isDuplicateError(error)) throw Object.assign(new Error('PARTICIPANT_EMAIL_EXISTS'), { code: 'PARTICIPANT_EMAIL_EXISTS' });
    throw error;
  } finally { client.release(); }
}

export async function updateStaffParticipant(staffUserId: string, placementId: string, input: ParticipantInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ownership = await client.query<{ user_id: string }>(
      `SELECT p.user_id::text FROM sigma_presensi.placements pl JOIN sigma_presensi.peserta p ON p.user_id = pl.participant_user_id
       WHERE pl.id = $1 AND pl.staff_user_id = $2 AND pl.deleted_at IS NULL AND p.deleted_at IS NULL FOR UPDATE`,
      [placementId, staffUserId],
    );
    const row = ownership.rows[0];
    if (!row) { await client.query('ROLLBACK'); return null; }
    await client.query(`UPDATE sigma_presensi.users SET email = NULLIF($1, ''), updated_at = CURRENT_TIMESTAMP(6) WHERE id = $2`, [input.email ?? '', row.user_id]);
    await client.query(
      `UPDATE sigma_presensi.peserta SET nama_lengkap = $1, no_telp = $2, jenis_institut_pendidikan = $3, nama_institut_pendidikan = $4,
       jenis_prakerin = $5, mulai_prakerin = $6, selesai_prakerin = $7, updated_at = CURRENT_TIMESTAMP(6) WHERE user_id = $8`,
      [input.name, input.phone, input.institutionType, input.institutionName, input.programType, input.startDate, input.endDate, row.user_id],
    );
    await client.query('COMMIT');
    return findStaffParticipant(staffUserId, placementId);
  } catch (error) { await client.query('ROLLBACK'); if (isDuplicateError(error)) throw Object.assign(new Error('PARTICIPANT_EMAIL_EXISTS'), { code: 'PARTICIPANT_EMAIL_EXISTS' }); throw error; }
  finally { client.release(); }
}

export async function removeStaffParticipant(staffUserId: string, placementId: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ownership = await client.query<{ user_id: string }>(`SELECT participant_user_id::text AS user_id FROM sigma_presensi.placements WHERE id = $1 AND staff_user_id = $2 AND deleted_at IS NULL FOR UPDATE`, [placementId, staffUserId]);
    const userId = ownership.rows[0]?.user_id;
    if (!userId) { await client.query('ROLLBACK'); return false; }
    await client.query(`UPDATE sigma_presensi.placements SET deleted_at = CURRENT_TIMESTAMP(6), status = 'Non Aktif', updated_at = CURRENT_TIMESTAMP(6) WHERE id = $1 AND staff_user_id = $2`, [placementId, staffUserId]);
    const activePlacement = await client.query(`SELECT 1 FROM sigma_presensi.placements WHERE participant_user_id = $1 AND deleted_at IS NULL LIMIT 1`, [userId]);
    if (activePlacement.rowCount === 0) {
      await client.query(`UPDATE sigma_presensi.peserta SET deleted_at = CURRENT_TIMESTAMP(6), updated_at = CURRENT_TIMESTAMP(6) WHERE user_id = $1`, [userId]);
      await client.query(`UPDATE sigma_presensi.users SET status = 'inactive', deleted_at = CURRENT_TIMESTAMP(6), updated_at = CURRENT_TIMESTAMP(6) WHERE id = $1`, [userId]);
    }
    await client.query('COMMIT');
    return true;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

export { defaultParticipantPassword };



