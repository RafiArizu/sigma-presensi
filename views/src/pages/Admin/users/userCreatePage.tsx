import { useState, type FormEvent } from 'react';
import UsersPageShell from './usersPageShell';

type UserCreateFormProps = { onSuccess?: (userId: string) => void; onCancel?: () => void };

export function UserCreateForm({ onSuccess, onCancel }: UserCreateFormProps) {
  const [error, setError] = useState('');
  const [isSaving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/users', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    if (!response.ok) { const body = await response.json().catch(() => null) as { message?: string } | null; setError(body?.message ?? 'User gagal dibuat'); setSaving(false); return; }
    const { user } = await response.json() as { user: { id: string } };
    if (onSuccess) onSuccess(user.id);
    else { window.history.pushState({}, '', `/super-admin/users/${user.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }
  };

  return <section className="user-form-card user-create-form-card"><div className="user-create-form-heading"><div><span className="admin-kicker">IDENTITAS AKUN</span><h2>Tambah User Baru</h2><p>Isi data dasar pengguna dan tetapkan aksesnya.</p></div></div>{error && <p className="form-error" role="alert">{error}</p>}<form className="user-form" onSubmit={submit}><div className="user-form-grid"><label>Nama lengkap<input required name="name" placeholder="Contoh: Rania Putri" /></label><label>Email<input required type="email" name="email" placeholder="nama@sigma.local" /></label><label>Password<input required minLength={8} type="password" name="password" placeholder="Minimal 8 karakter" /></label><label>Role<select defaultValue="staff_presensi" name="role"><option value="staff_presensi">Staff Presensi</option><option value="peserta">Peserta</option></select></label><label>Status<select defaultValue="active" name="status"><option value="active">Aktif</option><option value="inactive">Nonaktif</option><option value="invited">Diundang</option></select></label></div><div className="form-actions"><button className="secondary-action" type="button" onClick={onCancel ?? (() => window.history.back())}>Batal</button><button className="primary-action" disabled={isSaving} type="submit">{isSaving ? 'Menyimpan...' : 'Simpan user'} <span aria-hidden="true">↗</span></button></div></form></section>;
}

export default function UserCreatePage() {
  return <UsersPageShell eyebrow="SUPER ADMIN / USERS / NEW" title="Buat akun dengan batas jelas." description="Tambahkan identitas baru dan tetapkan role sesuai kewenangan yang disetujui."><UserCreateForm /></UsersPageShell>;
}