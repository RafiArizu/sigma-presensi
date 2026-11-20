import { useEffect, useState } from 'react';
import UsersPageShell from './usersPageShell';

type UserRecord = { id: string; name: string; email: string | null; role: string; status: string };

export default function UserDetailPage() {
  const userId = window.location.pathname.split('/').filter(Boolean).pop() || '';
  const [user, setUser] = useState<UserRecord | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { fetch(`/api/admin/users/${userId}`, { credentials: 'include' }).then(async (response) => { if (!response.ok) throw new Error('User tidak ditemukan'); return response.json() as Promise<{ user: UserRecord }>; }).then(({ user: record }) => setUser(record)).catch((reason: Error) => setError(reason.message)); }, [userId]);
  return <UsersPageShell eyebrow="SUPER ADMIN / USERS / DETAIL" title="Detail akses pengguna." description="Periksa identitas, role, dan status akun sebelum melakukan perubahan.">{error ? <section className="admin-panel"><p>{error}</p></section> : !user ? <section className="user-detail-card"><p>Memuat detail user...</p></section> : <section className="user-detail-grid"><article className="user-detail-card"><div className="user-avatar-large">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><h2>{user.name}</h2><p>{user.email || 'Email belum tersedia'}</p><span className="status-pill">{user.status}</span><div className="detail-actions"><a className="primary-action" href={`/super-admin/users/${user.id}/edit`}>Edit user ↗</a><a href="/super-admin/users">Kembali ke daftar</a></div></article><article className="user-detail-card user-detail-card-dark"><p className="admin-kicker">Kewenangan</p><h2>{user.role}</h2><dl className="detail-list"><div><dt>Scope</dt><dd>{user.role === 'super_admin' ? 'Seluruh sistem' : 'Sesuai role'}</dd></div><div><dt>Status akun</dt><dd>{user.status}</dd></div><div><dt>Pengelolaan</dt><dd>Sesuai kewenangan role</dd></div></dl></article></section>}</UsersPageShell>;
}

