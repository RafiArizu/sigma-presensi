import { useEffect, useState, type FormEvent } from 'react';
import UsersPageShell from './usersPageShell';

type UserRecord = { id: string; name: string; email: string | null; role: string; status: string };
type UserEditFormProps = { userId: string; onSuccess?: () => void; onCancel?: () => void };

export function UserEditForm({ userId, onSuccess, onCancel }: UserEditFormProps) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setSaving] = useState(false);

  useEffect(() => { fetch(`/api/admin/users/${encodeURIComponent(userId)}`, { credentials: 'include' }).then(async (response) => { if (!response.ok) throw new Error('User tidak ditemukan'); return response.json() as Promise<{ user: UserRecord }>; }).then(({ user: record }) => setUser(record)).catch((reason: Error) => setError(reason.message)); }, [userId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    if (!response.ok) { const body = await response.json().catch(() => null) as { message?: string } | null; setError(body?.message ?? 'User gagal diperbarui'); setSaving(false); return; }
    if (onSuccess) onSuccess(); else { window.history.pushState({}, '', `/super-admin/users/${userId}`); window.dispatchEvent(new PopStateEvent('popstate')); }
  };

  if (!user) return <section className="user-form-card user-create-form-card"><div className="user-create-form-heading"><div><span className="admin-kicker">AKUN PENGGUNA</span><h2>Edit User</h2><p>{error || 'Memuat data user...'}</p></div></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button className="secondary-action" type="button" onClick={onCancel}>Batal</button></div></section>;

  return <section className="user-form-card user-create-form-card"><div className="user-create-form-heading"><div><span className="admin-kicker">AKUN PENGGUNA</span><h2>Edit {user.name}</h2><p>Perbarui identitas dan akses pengguna.</p></div></div>{error && <p className="form-error" role="alert">{error}</p>}<form className="user-form" onSubmit={submit}><div className="user-form-grid"><label>Nama lengkap<input required defaultValue={user.name} name="name" /></label><label>Email<input required defaultValue={user.email || ''} type="email" name="email" /></label><label>Password baru<input minLength={8} type="password" name="password" placeholder="Kosongkan jika tidak berubah" /></label><label>Role<select defaultValue={user.role} name="role"><option value="staff_presensi">Staff Presensi</option><option value="peserta">Peserta</option></select></label><label>Status<select defaultValue={user.status} name="status"><option value="active">Aktif</option><option value="inactive">Nonaktif</option><option value="invited">Diundang</option></select></label></div><div className="form-actions"><button className="secondary-action" type="button" onClick={onCancel}>Batal</button><button className="primary-action" disabled={isSaving} type="submit">{isSaving ? 'Menyimpan...' : 'Simpan perubahan'} <span aria-hidden="true">↗</span></button></div></form></section>;
}

export default function UserEditPage() {
  const userId = window.location.pathname.split('/').filter(Boolean)[window.location.pathname.split('/').filter(Boolean).length - 2] || '';
  return <UsersPageShell eyebrow="SUPER ADMIN / USERS / EDIT" title="Perbarui akses dengan kontrol yang jelas." description="Perubahan role dan status memengaruhi akses berikutnya setelah sesi diperbarui."><UserEditForm userId={userId} /></UsersPageShell>;
}