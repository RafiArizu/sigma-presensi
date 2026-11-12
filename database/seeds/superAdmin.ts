import 'dotenv/config';
import { pool } from '../../config/database.js';
import { UserModel } from '../../models/UserModel.js';
import { hashPassword } from '../../services/password.js';

async function main(): Promise<void> {
  const name = process.env.SEED_ADMIN_NAME?.trim();
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
 

  if (!name || !email || !password) {
    throw new Error(
      'SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, dan SEED_ADMIN_PASSWORD wajib diisi.',
    );
  }

  if (email.length > 50 || name.length > 150) {
    throw new Error('Kode atau nama melebihi batas kolom database.');
  }

  if (password.length < 8 || password.length > 128) {
    throw new Error('Password awal harus terdiri dari 15–128 karakter.');
  }

  const existing = await UserModel.findByEmail(email);

  if (existing) {
    throw new Error(
      'Kode akun sudah terdaftar. Seed tidak mengubah akun yang ada.',
    );
  }

  const passwordHash = await hashPassword(password);

  await pool.execute(
    `INSERT INTO users
       (name, email, password_hash, role, status)
     VALUES (?, ?, ?, 'super_admin', 'active')`,
    [name, email, passwordHash],
  );

  console.log('Akun Super Admin berhasil dibuat.');
}

try {
  await main();
} catch (error) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'email' in error
  ) {
    console.error(
      'Seed gagal. Periksa koneksi database dan kemungkinan kode duplikat.',
    );
  } else {
    console.error(
      error instanceof Error ? error.message : 'Seed gagal.',
    );
  }

  process.exitCode = 1;
} finally {
  await pool.end();
}