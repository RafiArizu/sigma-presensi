import { useEffect, useState } from 'react';
import UsersPageShell from './usersPageShell';
import { UserCreateForm } from './userCreatePage';
import locationStyles from '../../../styles/lokasiPage.module.css';
type UserSummaryIcon = 'users' | 'staff' | 'participants';

function UserSummaryIconView({ name }: { name: UserSummaryIcon }) {
  const paths: Record<UserSummaryIcon, string> = {
    users: 'M16 19v-1.4a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 17.6V19m6-7a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm5.4-6.2a3.5 3.5 0 0 1 0 6.4M15.4 14a3.6 3.6 0 0 1 4.6 3.4V19',
    staff: 'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 7a7 7 0 0 1 14 0',
    participants: 'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 7a7 7 0 0 1 14 0',
  };

  return <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

type UserRecord = { id: string; name: string; email: string | null; role: string; status: string };

function roleClass(role: string) {
  return role.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function statusClass(status: string) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export default function UserListPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeRole, setActiveRole] = useState('all');
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<UserRecord | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Gagal mengambil daftar user');
        return response.json() as Promise<{ users: UserRecord[] }>;
      })
      .then(({ users: records }) => setUsers(records))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!pendingDelete && !isCreateOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) { setPendingDelete(null); setCreateOpen(false); }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [pendingDelete, isCreateOpen, isDeleting]);

  const query = activeSearch.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesQuery = !query || `${user.name} ${user.email ?? ''}`.toLowerCase().includes(query);
    const matchesRole = activeRole === 'all' || user.role === activeRole;
    return matchesQuery && matchesRole;
  });

  const deleteUser = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const response = await fetch(`/api/admin/users/${pendingDelete.id}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null;
      setError(body?.message ?? 'User gagal dihapus');
      setIsDeleting(false);
      return;
    }
    setUsers((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
    setIsDeleting(false);
  };

  return (
    <UsersPageShell eyebrow="" title="" description="">
      <section className={`${locationStyles.heroCard} ${locationStyles.userHeroCard}`}><div><span className={locationStyles.kicker}>KONTROL PENGGUNA</span><h1>User Terdaftar</h1><p>Kelola akun dan akses pengguna SIGMA.</p></div><button className={locationStyles.primaryButton} type="button" onClick={() => setCreateOpen(true)}><span aria-hidden="true">+</span>Tambah User</button></section>
      <section className="users-overview" aria-label="Ringkasan user"><article className="users-overview-card users-overview-card-purple"><span className="users-overview-icon"><UserSummaryIconView name="users" /></span><div><p>Total akun</p><strong>{users.length}</strong></div></article><article className="users-overview-card users-overview-card-teal"><span className="users-overview-icon"><UserSummaryIconView name="staff" /></span><div><p>Staff Presensi</p><strong>{users.filter((user) => user.role === 'staff_presensi').length}</strong></div></article><article className="users-overview-card users-overview-card-gold"><span className="users-overview-icon"><UserSummaryIconView name="participants" /></span><div><p>Peserta Prakerin</p><strong>{users.filter((user) => user.role === 'peserta').length}</strong></div></article></section>
      <section className="users-toolbar">
        <label className="users-search"><span>Cari user</span><input type="search" value={search} onChange={(event) => { const value = event.target.value; setSearch(value); setActiveSearch(value); }} placeholder="Nama atau email" /></label>
        <label className="users-filter"><span>Role</span><select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">Semua role</option><option value="staff_presensi">Staff Presensi</option><option value="peserta">Peserta</option></select></label>
        <button className="filter-action" type="button" onClick={() => setActiveRole(role)}>Filter</button>
      </section>
      <section className="users-table-card" aria-label="User terdaftar">
        {error && <p className="form-error">{error}</p>}
        <table className="users-table"><thead><tr><th>Nama User</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
          {isLoading ? <tr><td colSpan={5} className="users-empty">Memuat user...</td></tr> : filteredUsers.length > 0 ? filteredUsers.map((user) => <tr key={user.id}><td><strong>{user.name}</strong></td><td><span className="user-email">{user.email ?? '-'}</span></td><td><span className={`role-pill role-${roleClass(user.role)}`}>{user.role === 'staff_presensi' ? 'Staff Presensi' : user.role === 'peserta' ? 'Peserta Prakerin' : user.role}</span></td><td><span className={`status-pill status-${statusClass(user.status)}`}>{user.status === 'active' ? 'Aktif' : user.status === 'inactive' ? 'Non Aktif' : user.status}</span></td><td><div className="user-row-actions"><a href={`/super-admin/users/${user.id}`}>Detail ↗</a><a href={`/super-admin/users/${user.id}/edit`}>Edit ↗</a><button className="table-delete-action" type="button" onClick={() => setPendingDelete(user)}>Hapus</button></div></td></tr>) : <tr><td className="users-empty" colSpan={5}>Tidak ada user yang sesuai filter.</td></tr>}
        </tbody></table>
      </section>
      {isCreateOpen && <div className="user-create-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false); }}><section className="user-create-modal" role="dialog" aria-modal="true" aria-labelledby="create-user-title"><UserCreateForm onCancel={() => setCreateOpen(false)} onSuccess={(userId) => { setCreateOpen(false); window.history.pushState({}, "", `/super-admin/users/${userId}`); window.dispatchEvent(new PopStateEvent("popstate")); }} /></section></div>}
      {pendingDelete && <div className="user-delete-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isDeleting) setPendingDelete(null); }}>
        <section className="user-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-user-title" aria-describedby="delete-user-description">
          <div className="user-delete-modal-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg></div>
          <p className="admin-kicker">Hapus user</p>
          <h2 id="delete-user-title">Hapus akun ini?</h2>
          <p id="delete-user-description">User <strong>{pendingDelete.name}</strong> akan dihapus permanen dari daftar pengguna.</p>
          <div className="user-delete-modal-actions"><button type="button" className="user-delete-cancel" disabled={isDeleting} onClick={() => setPendingDelete(null)}>Batal</button><button type="button" className="user-delete-confirm" disabled={isDeleting} onClick={deleteUser}>{isDeleting ? 'Menghapus...' : 'Hapus user'}</button></div>
        </section>
      </div>}    </UsersPageShell>
  );
}






