import { useEffect, useState } from 'react';
import styles from './App.module.css';

type Health = { status: string; time: string };
export function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/health').then((r) => r.json()).then(setHealth).catch(() => setError('API belum berjalan')); }, []);
  return <main className={styles.shell}>
    <section className={styles.hero}><p className={styles.kicker}>SIGMA / MVP</p><h1>Presensi PKL dan Magang yang dapat ditelusuri.</h1><p className={styles.lead}>Fondasi aplikasi sesuai PRD: akun terkontrol, sesi kerja, verifikasi, dan audit.</p><div className={styles.status}>{error || (health ? `API ${health.status} · ${new Date(health.time).toLocaleTimeString('id-ID')}` : 'Memeriksa API...')}</div></section>
    <section className={styles.cards}><article><span>01</span><h2>Peserta</h2><p>Login, presensi masuk/pulang, izin/sakit, histori, koreksi.</p></article><article><span>02</span><h2>Staff Presensi</h2><p>Kelola penempatan, enrollment, keputusan, rekap operasional.</p></article><article><span>03</span><h2>Super Admin</h2><p>Kelola akun petugas, kebijakan teknis, audit, pemulihan.</p></article></section>
  </main>;
}
