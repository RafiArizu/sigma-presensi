import { useEffect, useState } from 'react';
import UsersPageShell from './usersPageShell';

type UserRecord = { id: string; name: string; email: string | null; role: string; status: string };
type UserDetailCardProps = { userId: string; onClose?: () => void };

function initials(name: string) { return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(); }
function roleLabel(role: string) { return role === 'staff_presensi' ? 'Staff Presensi' : role === 'peserta' ? 'Peserta Prakerin' : role; }
function statusLabel(status: string) { return status === 'active' ? 'Aktif' : status === 'inactive' ? 'Non Aktif' : status; }

export function UserDetailCard({ userId, onClose }: UserDetailCardProps) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { fetch(`/api/admin/users/${encodeURIComponent(userId)}`, { credentials: 'include' }).then(async (response) => { if (!response.ok) throw new Error('User tidak ditemukan'); return response.json() as Promise<{ user: UserRecord }>; }).then(({ user: record }) => setUser(record)).catch((reason: Error) => setError(reason.message)); }, [userId]);
  if (error) return <section className="user-detail-modal-card"><div className="user-create-form-heading"><div><span className="admin-kicker">AKUN PENGGUNA</span><h2>Detail user</h2><p className="form-error" role="alert">{error}</p></div></div><div className="form-actions"><button className="secondary-action" type="button" onClick={onClose}>Tutup</button></div></section>;
  if (!user) return <section className="user-detail-modal-card"><div className="user-create-form-heading"><div><span className="admin-kicker">AKUN PENGGUNA</span><h2>Detail user</h2><p>Memuat data user...</p></div></div></section>;
  return <section className="user-detail-modal-card"><div className="user-create-form-heading"><div><span className="admin-kicker">PROFIL PENGGUNA</span><h2>Detail akun</h2><p>Identitas dan kewenangan pengguna SIGMA.</p></div><span className={`status-pill status-${user.status}`}>{statusLabel(user.status)}</span></div><div className="user-detail-identity"><div className="user-avatar-large">{initials(user.name)}</div><div><h3>{user.name}</h3><p>{user.email || 'Email belum tersedia'}</p></div></div><div className="user-detail-info-grid"><div><span>Role</span><strong>{roleLabel(user.role)}</strong></div><div><span>Status akun</span><strong>{statusLabel(user.status)}</strong></div><div><span>Scope</span><strong>{user.role === 'super_admin' ? 'Seluruh sistem' : 'Sesuai role'}</strong></div><div><span>Pengelolaan</span><strong>Sesuai kewenangan role</strong></div></div><div className="form-actions"><button className="secondary-action" type="button" onClick={onClose}>Tutup</button><button className="primary-action" type="button" onClick={() => { window.history.pushState({}, '', `/super-admin/users/${user.id}/edit`); window.dispatchEvent(new PopStateEvent('popstate')); }}>Edit user <span aria-hidden="true">↗</span></button></div></section>;
}

export default function UserDetailPage() {
  const userId = window.location.pathname.split('/').filter(Boolean).pop() || '';
  return <UsersPageShell eyebrow="SUPER ADMIN / USERS / DETAIL" title="Detail akses pengguna." description="Periksa identitas, role, dan status akun sebelum melakukan perubahan."><UserDetailCard userId={userId} /></UsersPageShell>;
}