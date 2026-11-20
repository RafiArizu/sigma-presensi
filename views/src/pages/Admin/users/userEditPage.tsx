import { useEffect, useState } from 'react';
import UsersPageShell from './usersPageShell';

type UserRecord = { id: string; name: string; email: string | null; role: string; status: string };
export default function UserEditPage() {
  const userId = window.location.pathname.split('/').filter(Boolean)[window.location.pathname.split('/').filter(Boolean).length - 2] || '';
  const [user, setUser] = useState<UserRecord | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setSaving] = useState(false);
  useEffect(() => { fetch(`/api/admin/users/${userId}`, { credentials: 'include' }).then(async (response) => { if (!response.ok) throw new Error('User tidak ditemukan'); return response.json() as Promise<{ user: UserRecord }>; }).then(({ user: record }) => setUser(record)).catch((reason: Error) => setError(reason.message)); }, [userId]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); setError(''); const form = new FormData(event.currentTarget); const response = await fetch(`/api/admin/users/${userId}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) }); if (!response.ok) { const body = await response.json().catch(() => null) as { message?: string } | null; setError(body?.message ?? 'User gagal diperbarui'); setSaving(false); return; } window.history.pushState({}, '', `/super-admin/users/${userId}`); window.dispatchEvent(new PopStateEvent('popstate')); };
  return <UsersPageShell eyebrow="SUPER ADMIN / USERS / EDIT" title="Perbarui akses dengan kontrol yang jelas." description="Perubahan role dan status memengaruhi akses berikutnya setelah sesi diperbarui.">{error && <p className="form-error">{error}</p>}{!user ? <section className="user-detail-card"><p>{error ? '' : 'Memuat user...'}</p></section> : <section className="user-form-card"><div className="section-heading"><div><h2>Edit {user.name}</h2></div></div><form className="user-form" onSubmit={submit}><label>Nama lengkap<input required defaultValue={user.name} name="name" /></label><label>Email<input required defaultValue={user.email || ''} type="email" name="email" /></label><label>Password baru<input minLength={8} type="password" name="password" placeholder="Kosongkan jika tidak berubah" /></label><label>Role<select defaultValue={user.role} name="role"><option value="staff_presensi">Staff Presensi</option><option value="peserta">Peserta</option></select></label><label>Status<select defaultValue={user.status} name="status"><option value="active">Aktif</option><option value="inactive">Nonaktif</option><option value="invited">Diundang</option></select></label><div className="form-actions"><a className="secondary-action" href="/super-admin/users">Batal</a><button className="primary-action" disabled={isSaving} type="submit">{isSaving ? 'Menyimpan...' : 'Simpan perubahan'} <span aria-hidden="true">↗</span></button></div></form></section>}</UsersPageShell>;
}



