import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const host = process.env.PGHOST ?? '127.0.0.1';
const port = Number(process.env.PGPORT ?? 5432);
const user = process.env.PGUSER ?? 'postgres';
const password = process.env.PGPASSWORD ?? '';
const database = process.env.PGDATABASE ?? 'sigma_presensi';

async function ensureDatabase(): Promise<void> {
  const client = new Client({ host, port, user, password, database: 'postgres' });
  await client.connect();
  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${database.replaceAll('"', '""')}" OWNER "${user.replaceAll('"', '""')}"`);
      console.log(`Created database: ${database}`);
    } else console.log(`Database exists: ${database}`);
  } finally {
    await client.end();
  }
}

async function run(): Promise<void> {
  await ensureDatabase();
  const client = new Client({ host, port, user, password, database, options: '-c timezone=UTC' });
  await client.connect();
  try {
    for (const file of ['001_baseline.sql', '002_security_hardening.sql', '003_peserta.sql', '004_location_simplify.sql', '005_location_soft_delete.sql', '006_location_status.sql']) {
      const sql = await fs.readFile(path.join(process.cwd(), 'database', 'migrations', file), 'utf8');
      await client.query(sql);
      console.log(`Applied: ${file}`);
    }
    const result = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM information_schema.tables
       WHERE table_schema = 'sigma_presensi' AND table_type = 'BASE TABLE'`,
    );
    const tableCount = Number(result.rows[0]?.count ?? 0);
    if (tableCount !== 18) throw new Error(`Expected 18 sigma_presensi tables, found ${tableCount}.`);
    console.log(`Verified: ${tableCount} tables in sigma_presensi`);
  } finally {
    await client.end();
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'PostgreSQL migration failed.');
  process.exitCode = 1;
});

