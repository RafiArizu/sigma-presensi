import type { RequestHandler } from 'express';
import { pool } from '../../config/database.js';

export const dashboardStatsController: RequestHandler = async (_request, response, next) => {
  try {
    const [counts, attendanceTrend, storage] = await Promise.all([
      pool.query<{ participants: string; staff: string; photos: string }>(`
        SELECT
          COUNT(*) FILTER (WHERE role = 'peserta')::text AS participants,
          COUNT(*) FILTER (WHERE role = 'staff_presensi')::text AS staff,
          (SELECT COUNT(*)::text FROM sigma_presensi.attendance_photos WHERE deleted_at IS NULL) AS photos
        FROM sigma_presensi.users
        WHERE role <> 'super_admin'
      `),
      pool.query<{ day: string; total: string }>(`
        SELECT day::date::text, COUNT(a.id)::text AS total
        FROM generate_series(
          (CURRENT_DATE - INTERVAL '6 days')::date,
          CURRENT_DATE,
          INTERVAL '1 day'
        ) AS days(day)
        LEFT JOIN sigma_presensi.attendance a
          ON a.occurred_at_server >= days.day
         AND a.occurred_at_server < days.day + INTERVAL '1 day'
        GROUP BY day
        ORDER BY day
      `),
      pool.query<{ status: string; total: string }>(`
        SELECT status, COUNT(*)::text AS total
        FROM sigma_presensi.attendance_photos
        WHERE deleted_at IS NULL
        GROUP BY status
        ORDER BY status
      `),
    ]);

    const row = counts.rows[0] ?? { participants: '0', staff: '0', photos: '0' };
    const photoTotal = Number(row.photos);
    const overload = photoTotal > 80 ? 'danger' : photoTotal > 50 ? 'warning' : 'safe';

    response.json({
      metrics: {
        participants: Number(row.participants),
        staff: Number(row.staff),
        photos: photoTotal,
        overload,
      },
      attendanceTrend: attendanceTrend.rows.map((item) => ({ day: item.day, total: Number(item.total) })),
      storage: storage.rows.map((item) => ({ status: item.status, total: Number(item.total) })),
    });
  } catch (error) {
    next(error);
  }
};

