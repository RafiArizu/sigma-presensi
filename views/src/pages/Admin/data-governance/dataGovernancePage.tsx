import { useEffect, useState, type FormEvent } from 'react';
import Sidebar from '../../../components/sidebar';
import type { UserRole } from '../../../components/sidebar';
import Header from '../../../components/header';
import '../../../styles/AdminDashboard.css';
import { cacheUser, getCachedUser } from '../../../api/authSession';

type CurrentUser = { id: string; name: string; email: string | null; role: UserRole };
type AttendancePhoto = { id: string; participant: string; capturedAt: string; location: string; retentionUntil: string; status: string };
const attendancePhotos: AttendancePhoto[] = [];

function WarningIcon() {
  return <span className="governance-warning-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 22 20H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></svg></span>;
}

export default function DataGovernancePage() {
  const [user, setUser] = useState<CurrentUser | null>(() => getCachedUser<CurrentUser>());
  const [error, setError] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [photos, setPhotos] = useState(attendancePhotos);
  const [retentionDays, setRetentionDays] = useState(30);
  const [retentionMessage, setRetentionMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/currentUser', { credentials: 'include' })
      .then(async (response) => { if (!response.ok) throw new Error('Sesi tidak valid'); return response.json() as Promise<{ user: CurrentUser }>; })
      .then(({ user: currentUser }) => { if (currentUser.role !== 'super_admin') throw new Error('Akses hanya untuk Super Admin'); cacheUser(currentUser); setUser(currentUser); })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <main className="admin-shell admin-shell-message"><section className="admin-panel"><p className="admin-kicker">SIGMA / DATA GOVERNANCE</p><h1>Akses ditolak</h1><p>{error}</p><a href="/login">Kembali ke login</a></section></main>;
  useEffect(() => {
    const saved = Number(localStorage.getItem('sigma.retention.days'));
    if (Number.isFinite(saved) && saved > 0) setRetentionDays(saved);
  }, []);

  if (!user) return null;

  const deletePhoto = (id: string) => { if (window.confirm('Hapus metadata foto presensi ini?')) setPhotos((current) => current.filter((photo) => photo.id !== id)); };
  const saveRetention = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); localStorage.setItem('sigma.retention.days', String(retentionDays)); setRetentionMessage(`Retensi ${retentionDays} hari tersimpan.`); };
  return <div className="admin-shell"><Sidebar currentPath={window.location.pathname} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} role="super_admin" /><div className="admin-main"><Header userName={user.name} role="super_admin" onMenuToggle={() => setSidebarOpen(true)} /><main className="admin-content">
    <section className="governance-page-heading"><h1>Kelola Penyimpanan Data</h1></section>
    <section className="governance-note" aria-labelledby="governance-policy-title"><WarningIcon /><div><p className="admin-kicker">Kebijakan</p><h2 id="governance-policy-title">File foto tetap privat.</h2></div><p>Metadata foto dikelola di halaman ini. Penghapusan produksi harus mencabut akses dan menghapus file fisik dari storage sesuai durasi retensi yang diatur Super Admin.</p></section>    <section className="retention-settings-card governance-retention-card"><div><p className="admin-kicker">Kelola Data</p><h2>Durasi hapus foto otomatis</h2><p>Atur jumlah hari penyimpanan bukti foto sebelum proses penghapusan otomatis berjalan.</p></div><form className="retention-form" onSubmit={saveRetention}><label>Durasi retensi (hari)<input type="number" min="1" max="3650" value={retentionDays} onChange={(event) => setRetentionDays(Number(event.target.value))} /></label><button className="primary-action" type="submit">Simpan durasi ↗</button>{retentionMessage && <span className="retention-message">{retentionMessage}</span>}</form></section>
    <section className="governance-table-card" aria-labelledby="attendance-photo-title"><div className="section-heading"><div><h2 id="attendance-photo-title">Daftar foto presensi</h2></div></div><div className="governance-table-wrap"><table className="governance-table"><thead><tr><th>No.</th><th>Foto Presensi</th><th>Akun peserta yang presensi</th><th>Lokasi dan Waktu foto</th><th>Retensi otomatis dihapus</th><th>Aksi</th></tr></thead><tbody>{photos.length ? photos.map((photo, index) => <tr key={photo.id}><td>{index + 1}</td><td><span className="photo-private-badge">Privat</span><small>{photo.status}</small></td><td><strong>{photo.participant}</strong><small>{photo.id}</small></td><td><strong>{photo.location}</strong><small>{photo.capturedAt}</small></td><td>{photo.retentionUntil}</td><td><div className="governance-row-actions"><a href={`/super-admin/data-governance/${photo.id}`}>Detail</a><a href={`/super-admin/data-governance/${photo.id}/edit`}>Edit</a><button type="button" onClick={() => deletePhoto(photo.id)}>Delete</button></div></td></tr>) : <tr><td className="governance-empty" colSpan={6}>Belum ada data foto presensi. Data akan tampil setelah endpoint attendance photos terhubung.</td></tr>}</tbody></table></div></section>
  </main></div></div>;
}





