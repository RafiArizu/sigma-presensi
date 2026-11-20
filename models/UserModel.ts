import type { QueryResultRow } from 'pg';
import { pool } from '../config/database.js';

export type UserRole = 'peserta' | 'staff_presensi' | 'super_admin';
export type UserStatus = 'invited' | 'active' | 'inactive';

export interface UserRow extends QueryResultRow {
  id: string;
  name: string;
  email: string | null;
  password_hash: string | null;
  role: UserRole;
  status: UserStatus;
}

const table = 'sigma_presensi.users';
const columns = `id::text AS id, name, email, password_hash, role, status`;

export const UserModel = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(`SELECT ${columns} FROM ${table} WHERE email = $1 AND deleted_at IS NULL LIMIT 1`, [email]);
    return result.rows[0] ?? null;
  },
  async findById(id: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(`SELECT ${columns} FROM ${table} WHERE id = $1 AND deleted_at IS NULL LIMIT 1`, [id]);
    return result.rows[0] ?? null;
  },
  async findAll(): Promise<UserRow[]> {
    const result = await pool.query<UserRow>("SELECT " + columns + ` FROM ${table} WHERE role <> 'super_admin' AND deleted_at IS NULL ORDER BY created_at DESC, id DESC`);
    return result.rows;
  },
  async create(input: { name: string; email: string; passwordHash: string; role: UserRole; status: UserStatus }): Promise<UserRow> {
    const result = await pool.query<UserRow>(
      `INSERT INTO ${table} (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING ${columns}`,
      [input.name, input.email, input.passwordHash, input.role, input.status],
    );
    const user = result.rows[0];
    if (!user) throw new Error('USER_CREATE_FAILED');
    return user;
  },
  async update(id: string, input: { name: string; email: string; role: UserRole; status: UserStatus; passwordHash?: string }): Promise<UserRow | null> {
    const fields = ['name = $1', 'email = $2', 'role = $3', 'status = $4'];
    const values: Array<string> = [input.name, input.email, input.role, input.status];
    if (input.passwordHash) { fields.push(`password_hash = $${values.length + 1}`); values.push(input.passwordHash); }
    values.push(id);
    const result = await pool.query<UserRow>(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING ${columns}`, values);
    return result.rows[0] ?? null;
  },
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(`UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP(6), updated_at = CURRENT_TIMESTAMP(6) WHERE id = $1 AND deleted_at IS NULL`, [id]);
    return (result.rowCount ?? 0) > 0;
  },
};

