import type { QueryResultRow } from 'pg';
import { pool } from '../config/database.js';

export type InstitutPendidikan = 'Sekolah' | 'Perguruan Tinggi';
export type JenisPrakerin = 'PKL' | 'Magang/Kerja Praktik';

export interface PesertaRow extends QueryResultRow {
  id: string;
  user_id: string;
  nama_lengkap: string;
  no_telp: string;
  institut_pendidikan: InstitutPendidikan;
  jenis_prakerin: JenisPrakerin;
  mulai_prakerin: string;
  selesai_prakerin: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

const table = 'sigma_presensi.peserta';
const columns = `id::text AS id, user_id::text AS user_id, nama_lengkap, no_telp,
  institut_pendidikan, jenis_prakerin, mulai_prakerin, selesai_prakerin,
  created_at, updated_at, deleted_at`;

export const PesertaModel = {
  async findById(id: string): Promise<PesertaRow | null> {
    const result = await pool.query<PesertaRow>(`SELECT ${columns} FROM ${table} WHERE id = $1 AND deleted_at IS NULL LIMIT 1`, [id]);
    return result.rows[0] ?? null;
  },
  async findByUserId(userId: string): Promise<PesertaRow | null> {
    const result = await pool.query<PesertaRow>(`SELECT ${columns} FROM ${table} WHERE user_id = $1 AND deleted_at IS NULL LIMIT 1`, [userId]);
    return result.rows[0] ?? null;
  },
  async create(input: Omit<PesertaRow, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<PesertaRow> {
    const result = await pool.query<PesertaRow>(
      `INSERT INTO ${table} (user_id, nama_lengkap, no_telp, institut_pendidikan, jenis_prakerin, mulai_prakerin, selesai_prakerin)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${columns}`,
      [input.user_id, input.nama_lengkap, input.no_telp, input.institut_pendidikan, input.jenis_prakerin, input.mulai_prakerin, input.selesai_prakerin],
    );
    const peserta = result.rows[0];
    if (!peserta) throw new Error('PESERTA_CREATE_FAILED');
    return peserta;
  },
};
