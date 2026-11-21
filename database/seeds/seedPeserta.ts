import { pool } from '../../config/database.js';

const participants = [
  { userName: 'Peserta PKL 1', phone: '081234567801', institutionType: 'Sekolah', institutionName: 'SMK Negeri 1 Sigma', program: 'PKL' },
  { userName: 'Peserta PKL 2', phone: '081234567802', institutionType: 'Perguruan Tinggi', institutionName: 'Universitas Sigma', program: 'Magang/Kerja Praktik' },
  { userName: 'Peserta PKL 3', phone: '081234567803', institutionType: 'Sekolah', institutionName: 'SMK Negeri 1 Sigma', program: 'PKL' },
] as const;

async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const participant of participants) {
      const userResult = await client.query<{ id: string }>(
        `SELECT id FROM sigma_presensi.users WHERE user_name = $1 AND role = 'peserta' AND deleted_at IS NULL LIMIT 1`,
        [participant.userName],
      );
      if (!userResult.rows[0]) throw new Error(`User ${participant.userName} tidak ditemukan. Jalankan npm run db:seed terlebih dahulu.`);
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
           mulai_prakerin = EXCLUDED.mulai_prakerin,
           selesai_prakerin = EXCLUDED.selesai_prakerin,
           deleted_at = NULL`,
        [userId, participant.userName, participant.phone, participant.institutionType, participant.institutionName, participant.program],
      );
      console.log(`Siap peserta: ${participant.userName}`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

try { await main(); } catch (error) { console.error(error instanceof Error ? error.message : 'Seed peserta gagal.'); process.exitCode = 1; } finally { await pool.end(); }

