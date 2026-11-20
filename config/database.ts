import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST ?? '127.0.0.1',
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD ?? '',
  database: process.env.PGDATABASE ?? 'sigma_presensi',
  max: 10,
  options: '-c timezone=UTC',
});

pool.on('connect', (client) => {
  void client.query('SET search_path TO sigma_presensi, public');
});

