import type { QueryResultRow } from 'pg';
import { pool } from '../config/database.js';

export type LocationStatus = 'Non Aktif' | 'Aktif';
export interface LocationRow extends QueryResultRow { id: string; alamat: string; latitude: string; longitude: string; radius_meters: string; status: LocationStatus; created_by: string; created_at: Date; deleted_at: Date | null; participants: number; }
const table = 'sigma_presensi.location';
const columns = `l.id::text AS id, l.alamat, l.latitude::text AS latitude, l.longitude::text AS longitude, l.radius_meters::text AS radius_meters, l.status, l.created_by::text AS created_by, l.created_at, l.deleted_at, COUNT(DISTINCT sp.participant_user_id)::int AS participants`;
const from = `FROM ${table} l LEFT JOIN sigma_presensi.work_sessions ws ON ws.location_id = l.id LEFT JOIN sigma_presensi.shift_participants sp ON sp.shift_id = ws.shift_id AND sp.participant_user_id = ws.participant_user_id`;

export const LocationModel = {
  async findById(id: string): Promise<LocationRow | null> {
    const result = await pool.query<LocationRow>(`SELECT ${columns} ${from} WHERE l.id = $1 AND l.deleted_at IS NULL GROUP BY l.id`, [id]);
    return result.rows[0] ?? null;
  },
  async findAll(): Promise<LocationRow[]> {
    const result = await pool.query<LocationRow>(`SELECT ${columns} ${from} WHERE l.deleted_at IS NULL GROUP BY l.id ORDER BY l.created_at DESC`);
    return result.rows;
  },
  async create(input: { alamat: string; latitude: number; longitude: number; radiusMeters: number; status: LocationStatus; createdBy: string }): Promise<LocationRow> {
    const result = await pool.query<LocationRow>(`INSERT INTO ${table} (alamat, latitude, longitude, radius_meters, status, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, alamat, latitude::text AS latitude, longitude::text AS longitude, radius_meters::text AS radius_meters, status, created_by::text AS created_by, created_at, deleted_at, 0::int AS participants`, [input.alamat, input.latitude, input.longitude, input.radiusMeters, input.status, input.createdBy]);
    const location = result.rows[0];
    if (!location) throw new Error('LOCATION_CREATE_FAILED');
    return location;
  },
  async update(id: string, input: { alamat: string; latitude: number; longitude: number; radiusMeters: number; status: LocationStatus }): Promise<LocationRow | null> {
    const result = await pool.query<LocationRow>(`UPDATE ${table} SET alamat = $1, latitude = $2, longitude = $3, radius_meters = $4, status = $5 WHERE id = $6 AND deleted_at IS NULL RETURNING id, alamat, latitude::text AS latitude, longitude::text AS longitude, radius_meters::text AS radius_meters, status, created_by::text AS created_by, created_at, deleted_at, 0::int AS participants`, [input.alamat, input.latitude, input.longitude, input.radiusMeters, input.status, id]);
    return result.rows[0] ?? null;
  },
  async remove(id: string): Promise<boolean> {
    const result = await pool.query(`UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP(6) WHERE id = $1 AND deleted_at IS NULL`, [id]);
    return (result.rowCount ?? 0) > 0;
  },
};


