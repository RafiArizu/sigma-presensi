import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database.js';

export type UserRole =
  | 'peserta'
  | 'staff_presensi'
  | 'super_admin';

export type UserStatus = 'invited' | 'active' | 'inactive';

export interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string | null;
  password_hash: string | null;
  role: UserRole;
  status: UserStatus;
}

const columns = `
  CAST(id AS CHAR) AS id,
  name,
  email,
  password_hash,
  role,
  status
`;

export const UserModel = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await pool.execute<UserRow[]>(
      `SELECT ${columns}
      FROM users
      WHERE email = ?
      LIMIT 1`,
      [email],
    );

    return rows[0] ?? null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const [rows] = await pool.execute<UserRow[]>(
      `SELECT ${columns}
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  },
};