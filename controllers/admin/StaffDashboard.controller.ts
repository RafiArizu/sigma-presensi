import type { RequestHandler } from 'express';
import { pool } from '../../config/database.js';

export const staffDashboardStatsController: RequestHandler = async (request, response, next) => {
  try {
    const staffId = request.session.userId;
    const today = "((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date)";
    const scope = `
      SELECT DISTINCT p.user_id
      FROM sigma_presensi.peserta p
      JOIN sigma_presensi.users u ON u.id = p.user_id
      JOIN sigma_presensi.placements pl ON pl.participant_user_id = p.user_id
      WHERE pl.staff_user_id = $1
        AND pl.status = 'Aktif'
        AND pl.deleted_at IS NULL
        AND u.role = 'peserta'
        AND u.status = 'active'
        AND u.deleted_at IS NULL
        AND p.deleted_at IS NULL
    `;
    const result = await pool.query<{ participants: string; checked_in: string; not_present: string; pending_requests: string }>(
      `WITH participant_scope AS (${scope}), checkin_scope AS (
        SELECT DISTINCT ws.participant_user_id AS user_id
        FROM sigma_presensi.attendance a
        JOIN sigma_presensi.attendance_records ar ON ar.id = a.attendance_record_id
        JOIN sigma_presensi.work_sessions ws ON ws.id = ar.work_session_id
        JOIN participant_scope ps ON ps.user_id = ws.participant_user_id
        WHERE ws.work_date = ${today} AND a.type = 'check_in'
      )
      SELECT
        (SELECT COUNT(*) FROM participant_scope)::text AS participants,
        (SELECT COUNT(*) FROM checkin_scope)::text AS checked_in,
        ((SELECT COUNT(*) FROM participant_scope) - (SELECT COUNT(*) FROM checkin_scope))::text AS not_present,
        ((SELECT COUNT(*) FROM sigma_presensi.absense_request ar JOIN participant_scope ps ON ps.user_id = ar.participant_user_id WHERE ar.status = 'pending') +
         (SELECT COUNT(*) FROM sigma_presensi.correction_request cr JOIN sigma_presensi.work_sessions ws ON ws.id = cr.work_session_id JOIN participant_scope ps ON ps.user_id = ws.participant_user_id WHERE cr.status = 'pending'))::text AS pending_requests`,
      [staffId],
    );
    const row = result.rows[0] ?? { participants: '0', checked_in: '0', not_present: '0', pending_requests: '0' };
    const attendanceResult = await pool.query<{ name: string; institution_type: string; institution_name: string; program_type: string; phone: string }>(
      `WITH participant_scope AS (${scope})
       SELECT DISTINCT ON (u.id)
         p.nama_lengkap AS name,
         p.jenis_institut_pendidikan::text AS institution_type,
         p.nama_institut_pendidikan AS institution_name,
         p.jenis_prakerin::text AS program_type,
         p.no_telp AS phone
       FROM sigma_presensi.attendance a
       JOIN sigma_presensi.attendance_records ar ON ar.id = a.attendance_record_id
       JOIN sigma_presensi.work_sessions ws ON ws.id = ar.work_session_id
       JOIN participant_scope ps ON ps.user_id = ws.participant_user_id
       JOIN sigma_presensi.peserta p ON p.user_id = ws.participant_user_id
       JOIN sigma_presensi.users u ON u.id = p.user_id
       WHERE ws.work_date = ${today} AND a.type = 'check_in'
       ORDER BY u.id, a.occurred_at_server DESC`,
      [staffId],
    );
    const absentResult = await pool.query<{ name: string; institution_name: string; program_type: string; phone: string }>(
      `WITH participant_scope AS (${scope})
       SELECT p.nama_lengkap AS name, p.nama_institut_pendidikan AS institution_name,
              p.jenis_prakerin::text AS program_type, p.no_telp AS phone
       FROM participant_scope ps
       JOIN sigma_presensi.peserta p ON p.user_id = ps.user_id
       WHERE NOT EXISTS (
         SELECT 1 FROM sigma_presensi.attendance a
         JOIN sigma_presensi.attendance_records ar ON ar.id = a.attendance_record_id
         JOIN sigma_presensi.work_sessions ws ON ws.id = ar.work_session_id
         WHERE ws.participant_user_id = ps.user_id AND ws.work_date = ${today} AND a.type = 'check_in'
       )
       ORDER BY p.nama_lengkap`,
      [staffId],
    );
    response.json({
      metrics: { participants: Number(row.participants), checkedIn: Number(row.checked_in), notPresent: Number(row.not_present), pendingRequests: Number(row.pending_requests) },
      attendance: attendanceResult.rows,
      absentParticipants: absentResult.rows,
    });
  } catch (error) {
    next(error);
  }
};
