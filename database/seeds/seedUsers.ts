import { pool } from '../../config/database.js';
import { UserModel, type UserRole, type UserStatus } from '../../models/UserModel.js';
import { hashPassword } from '../../services/password.js';

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

const seedUsers: SeedUser[] = [

  // Akun Super Admin
  { name: 'Admin Sigma', email: 'adminsigma@example.com', password: 'password', role: 'super_admin', status: 'active' },
  { name: 'Admin Sigma 2', email: 'adminsigma_2@example.com', password: 'password', role: 'super_admin', status: 'active' },
  { name: 'Admin Sigma 3', email: 'adminsigma_3@example.com', password: 'password', role: 'super_admin', status: 'active' },

  // Akun Staff Presensi
  { name: 'Staff Presensi 1', email: 'staff.presensi1@example.com', password: 'password', role: 'staff_presensi', status: 'active' },
  { name: 'Staff Presensi 2', email: 'staff.presensi2@example.com', password: 'password', role: 'staff_presensi', status: 'active' },
  { name: 'Staff Presensi 3', email: 'staff.presensi3@example.com', password: 'password', role: 'staff_presensi', status: 'active' },

  // Akun peserta PKL
  { name: 'Peserta PKL 1', email: 'peserta.pkl1@example.com', password: 'password', role: 'peserta', status: 'active' },
  { name: 'Peserta PKL 2', email: 'peserta.pkl2@example.com', password: 'password', role: 'peserta', status: 'active' },
  { name: 'Peserta PKL 3', email: 'peserta.pkl3@example.com', password: 'password', role: 'peserta', status: 'active' },
];

async function main(): Promise<void> {
  for (const user of seedUsers) {
    const existing = await UserModel.findByEmail(user.email);

    if (existing) {
      console.log(`Lewati ${user.email}: akun sudah ada.`);
      continue;
    }

    const passwordHash = await hashPassword(user.password);
    await pool.query(
      `INSERT INTO users (user_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.name, user.email, passwordHash, user.role, user.status],
    );

    console.log(`Buat ${user.role}: ${user.email}`);
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Seed user gagal.');
  process.exitCode = 1;
} finally {
  await pool.end();
}



