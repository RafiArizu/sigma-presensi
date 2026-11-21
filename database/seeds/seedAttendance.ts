import crypto from 'node:crypto';
import { pool } from '../../config/database.js';

const participants = [
  { email: 'peserta.pkl1@example.com', name: 'Peserta PKL 1', phone: '081234567801', institutionType: 'Sekolah', institutionName: 'SMK Negeri 1 Sigma', program: 'PKL' },
  { email: 'peserta.pkl2@example.com', name: 'Peserta PKL 2', phone: '081234567802', institutionType: 'Perguruan Tinggi', institutionName: 'Universitas Sigma', program: 'Magang/Kerja Praktik' },
  { email: 'peserta.pkl3@example.com', name: 'Peserta PKL 3', phone: '081234567803', institutionType: 'Sekolah', institutionName: 'SMK Negeri 1 Sigma', program: 'PKL' },
] as const;

async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const staffResult = await client.query<{ id: string }>(
      `SELECT id FROM sigma_presensi.users WHERE email = 'staff.presensi1@example.com' LIMIT 1`,
    );
    if (!staffResult.rows[0]) throw new Error('Akun staff.presensi1@example.com belum ada. Jalankan npm run db:seed terlebih dahulu.');
    const staffId = staffResult.rows[0].id;

    let locationResult = await client.query<{ id: string }>(
      `SELECT id FROM sigma_presensi.location WHERE deleted_at IS NULL AND status = 'Aktif' ORDER BY id LIMIT 1`,
    );
    if (!locationResult.rows[0]) {
      locationResult = await client.query<{ id: string }>(
        `INSERT INTO sigma_presensi.location (alamat, latitude, longitude, radius_meters, created_by, status)
         VALUES ('Kantor SIGMA', -6.2000000, 106.8166667, 100, $1, 'Aktif')
         RETURNING id`,
        [staffId],
      );
    }
    const locationId = locationResult.rows[0].id;

    for (const participant of participants) {
      const userResult = await client.query<{ id: string }>(
        `SELECT id FROM sigma_presensi.users WHERE email = $1 AND role = 'peserta' LIMIT 1`,
        [participant.email],
      );
      if (!userResult.rows[0]) throw new Error(`Akun ${participant.email} belum ada. Jalankan npm run db:seed terlebih dahulu.`);
      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO sigma_presensi.peserta (user_id, nama_lengkap, no_telp, jenis_institut_pendidikan, nama_institut_pendidikan, jenis_prakerin, mulai_prakerin, selesai_prakerin)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE - 14, CURRENT_DATE + 76)
         ON CONFLICT (user_id) DO UPDATE SET
           nama_lengkap = EXCLUDED.nama_lengkap,
           no_telp = EXCLUDED.no_telp,
           jenis_institut_pendidikan = EXCLUDED.jenis_institut_pendidikan,
           nama_institut_pendidikan = EXCLUDED.nama_institut_pendidikan,
           jenis_prakerin = EXCLUDED.jenis_prakerin,
           deleted_at = NULL`,
        [userId, participant.name, participant.phone, participant.institutionType, participant.institutionName, participant.program],
      );

      const placementResult = await client.query<{ id: string }>(
        `SELECT pl.id FROM sigma_presensi.placements pl
         JOIN sigma_presensi.peserta p ON p.user_id = pl.participant_user_id
         WHERE pl.participant_user_id = $1 AND pl.staff_user_id = $2
           AND p.mulai_prakerin <= CURRENT_DATE AND p.selesai_prakerin >= CURRENT_DATE
         ORDER BY pl.id LIMIT 1`,
        [userId, staffId],
      );
      const placementId = placementResult.rows[0]?.id ?? (await client.query<{ id: string }>(
        `INSERT INTO sigma_presensi.placements (participant_user_id, staff_user_id, status)
         VALUES ($1, $2, 'Aktif')
         RETURNING id`,
        [userId, staffId],
      )).rows[0].id;

      const shiftResult = await client.query<{ id: string }>(
        `SELECT id FROM sigma_presensi.shifts
         WHERE staff_user_id = $1 AND location_id = $2 AND start_shift = TIME '08:00' AND end_shift = TIME '17:00'
           AND status = 'Aktif' AND deleted_at IS NULL
         ORDER BY id LIMIT 1`,
        [staffId, locationId],
      );
      const shiftId = shiftResult.rows[0]?.id ?? (await client.query<{ id: string }>(
        `INSERT INTO sigma_presensi.shifts (nama_shift, staff_user_id, location_id, start_shift, end_shift, status)
         VALUES ('Shift seed 08:00-17:00', $1, $2, TIME '08:00', TIME '17:00', 'Aktif') RETURNING id`,
        [staffId, locationId],
      )).rows[0]?.id;
      if (!shiftId) throw new Error('SEED_SHIFT_CREATE_FAILED');
      await client.query(
        `INSERT INTO sigma_presensi.shift_participants (shift_id, participant_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [shiftId, userId],
      );
      const sessionResult = await client.query<{ id: string }>(
        `SELECT id FROM sigma_presensi.work_sessions WHERE participant_user_id = $1 AND work_date = CURRENT_DATE ORDER BY id LIMIT 1`,
        [userId],
      );`r`n      const sessionId = sessionResult.rows[0]?.id ?? (await client.query<{ id: string }>(
        `INSERT INTO sigma_presensi.work_sessions (shift_id, participant_user_id, policy_snapshot, location_id, work_date, start_at_utc, end_at_utc, timezone, status)
         VALUES ($1, $2, $3::json, $4, CURRENT_DATE, CURRENT_DATE + TIME '08:00', CURRENT_DATE + TIME '17:00', 'Asia/Jakarta', 'in_progress')
         RETURNING id`,
        [shiftId, userId, JSON.stringify({ source: 'seed', radius_meters: 100 }), locationId],
      )).rows[0].id;

      const recordResult = await client.query<{ id: string }>(
        `SELECT id FROM sigma_presensi.attendance_records WHERE work_session_id = $1 LIMIT 1`,
        [sessionId],
      );
      const recordId = recordResult.rows[0]?.id ?? (await client.query<{ id: string }>(
        `INSERT INTO sigma_presensi.attendance_records (work_session_id, effective_check_in_at, status)
         VALUES ($1, CURRENT_TIMESTAMP, 'in_progress')
         RETURNING id`,
        [sessionId],
      )).rows[0].id;

      const eventResult = await client.query<{ id: string }>(
        `SELECT id FROM sigma_presensi.attendance WHERE attendance_record_id = $1 AND type = 'check_in' LIMIT 1`,
        [recordId],
      );
      if (!eventResult.rows[0]) {
        const tokenHash = crypto.createHash('sha256').update(`seed-check-in-${participant.email}-${new Date().toISOString().slice(0, 10)}`).digest('hex');
        const verificationResult = await client.query<{ id: string }>(
          `INSERT INTO sigma_presensi.verification (token_hash, user_id, work_session_id, action, status, expires_at, consumed_at)
           VALUES ($1, $2, $3, 'check_in', 'consumed', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP)
           ON CONFLICT (token_hash) DO UPDATE SET consumed_at = CURRENT_TIMESTAMP
           RETURNING id`,
          [tokenHash, userId, sessionId],
        );
        await client.query(
          `INSERT INTO sigma_presensi.attendance (attendance_record_id, verification_id, type, source)
           VALUES ($1, $2, 'check_in', 'seed')
           ON CONFLICT (attendance_record_id, type) DO NOTHING`,
          [recordId, verificationResult.rows[0].id],
        );
      }
      console.log(`Siap: ${participant.email}`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Seed attendance gagal.');
  process.exitCode = 1;
} finally {
  await pool.end();
}





