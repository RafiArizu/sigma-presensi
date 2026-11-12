import { useEffect, useState } from 'react';
import '../../styles/AdminDashboard.css';

type AdminUser = { name: string; email: string | null; role: string };
type AuthResponse = { user: AdminUser };

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Sesi tidak valid');
        return response.json() as Promise<AuthResponse>;
      })
      .then((data) => {
        if (data.user.role !== 'super_admin') throw new Error('Akses hanya untuk Super Admin');
        setUser(data.user);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <main className="admin-dashboard"><section className="admin-panel"><h1>Akses ditolak</h1><p>{error}</p><a href="/login">Kembali ke login</a></section></main>;
  if (!user) return <main className="admin-dashboard"><section className="admin-panel"><p>Memeriksa sesi...</p></section></main>;

  return <main className="admin-dashboard"><header className="admin-header"><div><p className="admin-kicker">SIGMA / SUPER ADMIN</p><h1>Dashboard sistem</h1><p>Kelola akses, kebijakan, audit, dan pemulihan aplikasi.</p></div><span className="admin-user">{user.name}</span></header><section className="admin-grid"><article><span>01</span><h2>Akun petugas</h2><p>Kelola Staff Presensi dan Super Admin.</p></article><article><span>02</span><h2>Audit sistem</h2><p>Tinjau aktivitas penting dan perubahan akses.</p></article><article><span>03</span><h2>Keamanan</h2><p>Kelola sesi aktif, kebijakan, dan pemulihan.</p></article></section></main>;
}
