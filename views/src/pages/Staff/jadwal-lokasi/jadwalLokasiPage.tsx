import { useEffect, useState } from 'react';
import UsersPageShell from '../../Admin/users/usersPageShell';
import '../../../styles/AdminDashboard.css';
import LocationFeedback from '../../../components/LocationFeedback';
import StaffScheduleLocationEditPage from './jadwalLokasiEditPage';
import StaffScheduleLocationCreatePage from './jadwalLokasiCreatePage';
import styles from '../../../styles/lokasiPage.module.css';

type Shift = { shift_id: string; nama_shift: string; start_shift: string; end_shift: string; alamat: string; location_id: string; radius_meters: string; shift_status: 'Aktif' | 'Non Aktif' };
type Location = { id: string; alamat: string; radius_meters: string; status: string };
function timeValue(value: string) { return value.slice(0, 5); }
async function readResponse(response: Response) { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(typeof data.message === 'string' ? data.message : 'Permintaan gagal diproses'); return data as { schedules?: Shift[]; locations?: Location[] }; }

export default function StaffScheduleLocationPage() {
  const [shifts, setShifts] = useState<Shift[]>([]); const [locations, setLocations] = useState<Location[]>([]);
  const [modal, setModal] = useState<'create' | null>(null); const [editShift, setEditShift] = useState<Shift | null>(null); const [pendingDelete, setPendingDelete] = useState<Shift | null>(null); const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  async function load() { try { setError(''); const data = await readResponse(await fetch('/api/staff/schedules', { credentials: 'include', cache: 'no-store' })); setShifts(data.schedules ?? []); setLocations(data.locations ?? []); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Data shift gagal dimuat'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  function openCreate() { setEditShift(null); setError(''); setFeedback(null); setModal('create'); }
  async function saveCreate() { await load(); setModal(null); setFeedback({ message: 'Shift berhasil dibuat.', variant: 'success' }); }
  async function saveEdit() { await load(); setEditShift(null); setFeedback({ message: 'Shift berhasil diperbarui.', variant: 'success' }); }
  async function remove() { if (!pendingDelete) return; const shift = pendingDelete; setDeletingId(shift.shift_id); setError(''); try { await readResponse(await fetch(`/api/staff/schedules/${shift.shift_id}`, { method: 'DELETE', credentials: 'include' })); await load(); setPendingDelete(null); setFeedback({ message: 'Shift berhasil dihapus.', variant: 'danger' }); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Shift gagal dihapus'); } finally { setDeletingId(null); } }
  const visible = shifts.filter((shift) => `${shift.nama_shift} ${shift.alamat} ${shift.shift_status}`.toLowerCase().includes(filter.toLowerCase()));

  return <UsersPageShell role="staff_presensi" eyebrow="STAFF PRESENSI" title="Jadwal dan Lokasi" description="Kelola shift presensi dan lokasi pemeriksaan peserta.">
    <div className="staff-shift-page">
      <section className="staff-input-card"><div><span className="staff-input-card-kicker">KONTROL SHIFT</span><h1>Jadwal dan Lokasi</h1><p>Kelola nama shift, jam presensi, dan lokasi pemeriksaan.</p></div><button className="primary-action" type="button" onClick={openCreate}><span aria-hidden="true">+</span> Tambah Shift</button></section>
      {error && <p className="dashboard-stats-note" role="alert">{error}</p>}
      <section className={styles.listCard}><div className={styles.listHeading}><div><span className={styles.kicker}>DAFTAR SHIFT</span><h2>Shift yang dikelola</h2></div><span className={styles.resultCount}>{visible.length} shift</span></div><div className={styles.toolbar}><label className={styles.search}><span className={styles.srOnly}>Cari shift</span><span aria-hidden="true" className={styles.glyph}>⌕</span><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Cari nama shift atau lokasi" /></label></div><div className={styles.locationList}>{loading && <div className={styles.emptyState}><strong>Memuat shift...</strong></div>}{!loading && visible.map((shift) => <article className={styles.locationRow} key={shift.shift_id}><span className={styles.locationMarker} aria-hidden="true"><svg className={styles.glyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2.2" /></svg></span><div className={styles.locationInfo}><div className={styles.locationTitle}><h3>{shift.nama_shift}</h3><span className={`${styles.status} ${shift.shift_status === 'Aktif' ? styles.statusActive : styles.statusInactive}`}>{shift.shift_status}</span></div><p>{shift.alamat}</p><small>Shift presensi · Radius {Number(shift.radius_meters).toLocaleString('id-ID')} m</small></div><dl className={styles.locationStats}><div><dt>Jam masuk</dt><dd>{timeValue(shift.start_shift)}</dd></div><div><dt>Jam pulang</dt><dd>{timeValue(shift.end_shift)}</dd></div></dl><div className={styles.rowActions}><button className={styles.detailButton} type="button" onClick={() => setEditShift(shift)}>Edit <span aria-hidden="true">↗</span></button><button className={`${styles.detailButton} ${styles.deleteButton}`} type="button" onClick={() => setPendingDelete(shift)}>Hapus</button></div></article>)}{!loading && !visible.length && <div className={styles.emptyState}><strong>{shifts.length ? 'Shift tidak ditemukan' : 'Belum ada shift terkelola'}</strong><span>{shifts.length ? 'Coba ubah kata kunci pencarian.' : 'Tambah shift pertama untuk mulai mengatur jadwal presensi.'}</span></div>}</div></section>
    </div>
    {modal && <StaffScheduleLocationCreatePage locations={locations} onClose={() => setModal(null)} onSaved={saveCreate} />}
    {pendingDelete && <div className={styles.deleteModalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingId) setPendingDelete(null); }}><section className={styles.deleteModal} role="dialog" aria-modal="true" aria-labelledby="delete-shift-title" aria-describedby="delete-shift-description"><div className={styles.deleteModalIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4m0 4h.01" /></svg></div><div className={styles.deleteModalContent}><span className={styles.kicker}>KONFIRMASI TINDAKAN</span><h2 id="delete-shift-title">Hapus shift?</h2><p id="delete-shift-description">Shift <strong>{pendingDelete.nama_shift}</strong> akan dihapus dari jadwal dan lokasi terkelola.</p></div><div className={styles.deleteModalActions}><button className={styles.deleteCancel} type="button" disabled={Boolean(deletingId)} onClick={() => setPendingDelete(null)}>Batal</button><button className={styles.deleteConfirm} type="button" disabled={Boolean(deletingId)} onClick={() => void remove()}>{deletingId ? 'Menghapus...' : 'Hapus shift'}</button></div></section></div>}
    {editShift && <StaffScheduleLocationEditPage shift={editShift} locations={locations} onClose={() => setEditShift(null)} onSaved={saveEdit} />}
    {feedback && <LocationFeedback resource="shift" message={feedback.message} variant={feedback.variant} onClose={() => setFeedback(null)} />}
  </UsersPageShell>;
}


