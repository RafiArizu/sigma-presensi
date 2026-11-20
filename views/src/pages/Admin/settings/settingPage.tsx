import { useEffect, useState } from 'react';
import Sidebar from '../../../components/sidebar';
import type { UserRole } from '../../../components/sidebar';
import Header from '../../../components/header';
import '../../../styles/AdminDashboard.css';
import { cacheUser, getCachedUser } from '../../../api/authSession';

type Profile = { id: string; name: string; email: string | null; role: UserRole };
const roleLabels: Record<UserRole, string> = { peserta: 'Peserta', staff_presensi: 'Staff Presensi', super_admin: 'Super Admin' };

export default function SettingPage() {
  const [profile, setProfile] = useState<Profile | null>(() => getCachedUser<Profile>());
  const [error, setError] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/currentUser', { credentials: 'include' })
      .then(async (response) => { if (!response.ok) throw new Error('Sesi tidak valid'); return response.json() as Promise<{ user: Profile }>; })
      .then(({ user }) => { cacheUser(user); setProfile(user); })
      .catch((reason: Error) => setError(reason.message));
  }, []);


  if (error) return <main className="admin-shell admin-shell-message"><section className="admin-panel"><p className="admin-kicker">SIGMA / PROFILE</p><h1>Akses ditolak</h1><p>{error}</p><a href="/login">Kembali ke login</a></section></main>;
  if (!profile) return null;

  const initials = profile.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return <div className="admin-shell"><Sidebar currentPath={window.location.pathname} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} role={profile.role} /><div className="admin-main"><Header userName={profile.name} role={profile.role} onMenuToggle={() => setSidebarOpen(true)} /><main className="admin-content"><section className="profile-settings-grid"><article className="profile-card"><div className="user-avatar-large">{initials}</div><h2>{profile.name}</h2><p>{profile.email || 'Email belum tersedia'}</p><span className="role-pill">{roleLabels[profile.role]}</span></article><article className="user-form-card"><div className="section-heading"><div><p className="admin-kicker">Informasi pribadi</p><h2>Edit profil</h2></div></div><form className="user-form" onSubmit={(event) => event.preventDefault()}><label>Nama lengkap<input defaultValue={profile.name} name="name" /></label><label>Email<input defaultValue={profile.email || ''} type="email" name="email" /></label><label>Nomor telepon<input name="phone" placeholder="08xxxxxxxxxx" /></label><div className="form-actions"><button className="primary-action" type="submit">Simpan profil <span aria-hidden="true">↗</span></button></div></form></article><article className="timezone-card"><div className="section-heading"><div><p className="admin-kicker">Preferensi sistem</p><h2>Zona waktu</h2></div></div><label className="timezone-field">Timezone<select defaultValue="Asia/Jakarta"><option>Asia/Jakarta</option><option>Asia/Makassar</option><option>Asia/Jayapura</option></select></label></article></section></main></div></div>;
}
