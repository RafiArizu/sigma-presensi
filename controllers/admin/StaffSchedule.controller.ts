import type { RequestHandler } from 'express';
import { z } from 'zod';
import { pool } from '../../config/database.js';

const idSchema = z.string().regex(/^\d+$/, 'ID tidak valid');
const shiftSchema = z.object({
  name: z.string().trim().min(1, 'Nama shift wajib diisi').max(250, 'Nama shift maksimal 250 karakter'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Jam masuk tidak valid'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Jam pulang tidak valid'),
  locationId: z.coerce.number().int().positive(),
  status: z.enum(['Aktif', 'Non Aktif']),
}).superRefine((value, context) => {
  if (value.endTime <= value.startTime) context.addIssue({ code: 'custom', path: ['endTime'], message: 'Jam pulang harus setelah jam masuk' });
});

const shiftSelect = `
  SELECT s.id::text AS shift_id, s.nama_shift, s.start_shift, s.end_shift,
         s.status::text AS shift_status, s.location_id::text AS location_id,
         l.alamat, l.radius_meters
  FROM sigma_presensi.shifts s
  JOIN sigma_presensi.location l ON l.id = s.location_id
  WHERE s.staff_user_id = $1
    AND s.deleted_at IS NULL
  ORDER BY s.created_at DESC, s.nama_shift ASC
`;

async function locationIsAvailable(client: import('pg').PoolClient, locationId: number) {
  const result = await client.query(
    `SELECT id FROM sigma_presensi.location WHERE id = $1 AND deleted_at IS NULL AND status = 'Aktif'`,
    [locationId],
  );
  return (result.rowCount ?? 0) > 0;
}

export const staffSchedulesController: RequestHandler = async (request, response, next) => {
  try {
    const [schedules, locations] = await Promise.all([
      pool.query(shiftSelect, [request.session.userId]),
      pool.query(`SELECT id::text, alamat, latitude, longitude, radius_meters, status::text FROM sigma_presensi.location WHERE deleted_at IS NULL AND status = 'Aktif' ORDER BY alamat`),
    ]);
    response.json({ schedules: schedules.rows, locations: locations.rows });
  } catch (error) {
    next(error);
  }
};

export const staffScheduleCreateController: RequestHandler = async (request, response, next) => {
  const input = shiftSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({ code: 'INVALID_SHIFT_INPUT', message: 'Data shift tidak valid', details: input.error.flatten().fieldErrors });
    return;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (!(await locationIsAvailable(client, input.data.locationId))) {
      await client.query('ROLLBACK');
      response.status(400).json({ code: 'INVALID_SHIFT_LOCATION', message: 'Lokasi aktif tidak tersedia' });
      return;
    }
    const result = await client.query<{ id: string }>(
      `INSERT INTO sigma_presensi.shifts (nama_shift, staff_user_id, location_id, start_shift, end_shift, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [input.data.name, request.session.userId, input.data.locationId, input.data.startTime, input.data.endTime, input.data.status],
    );
    await client.query('COMMIT');
    response.status(201).json({ shift_id: result.rows[0]?.id });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const staffScheduleUpdateController: RequestHandler = async (request, response, next) => {
  const id = idSchema.safeParse(request.params.id);
  const input = shiftSchema.safeParse(request.body);
  if (!id.success) { response.status(400).json({ code: 'INVALID_SHIFT_ID', message: 'ID shift tidak valid' }); return; }
  if (!input.success) { response.status(400).json({ code: 'INVALID_SHIFT_INPUT', message: 'Data shift tidak valid', details: input.error.flatten().fieldErrors }); return; }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (!(await locationIsAvailable(client, input.data.locationId))) {
      await client.query('ROLLBACK');
      response.status(400).json({ code: 'INVALID_SHIFT_LOCATION', message: 'Lokasi aktif tidak tersedia' });
      return;
    }
    const result = await client.query(
      `UPDATE sigma_presensi.shifts
       SET nama_shift = $1, location_id = $2, start_shift = $3, end_shift = $4,
           status = $5, updated_at = CURRENT_TIMESTAMP(6)
       WHERE id = $6 AND staff_user_id = $7 AND deleted_at IS NULL
       RETURNING id`,
      [input.data.name, input.data.locationId, input.data.startTime, input.data.endTime, input.data.status, id.data, request.session.userId],
    );
    if (!result.rowCount) {
      await client.query('ROLLBACK');
      response.status(404).json({ code: 'SHIFT_NOT_FOUND', message: 'Shift tidak ditemukan' });
      return;
    }
    await client.query('COMMIT');
    response.json({ shift_id: id.data });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const staffScheduleDeleteController: RequestHandler = async (request, response, next) => {
  const id = idSchema.safeParse(request.params.id);
  if (!id.success) { response.status(400).json({ code: 'INVALID_SHIFT_ID', message: 'ID shift tidak valid' }); return; }
  try {
    const result = await pool.query(
      `UPDATE sigma_presensi.shifts
       SET status = 'Non Aktif', deleted_at = CURRENT_TIMESTAMP(6), updated_at = CURRENT_TIMESTAMP(6)
       WHERE id = $1 AND staff_user_id = $2 AND deleted_at IS NULL RETURNING id`,
      [id.data, request.session.userId],
    );
    if (!result.rowCount) { response.status(404).json({ code: 'SHIFT_NOT_FOUND', message: 'Shift tidak ditemukan' }); return; }
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};