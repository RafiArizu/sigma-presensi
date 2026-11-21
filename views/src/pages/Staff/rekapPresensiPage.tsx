import { useEffect, useMemo, useState } from 'react';
import UsersPageShell from '../Admin/users/usersPageShell';
import '../../styles/AdminDashboard.css';

type RecapRecord = {
  work_date: string;
  participant_name: string;
  institution_type: string;
  institution_name: string;
  program_type: string;
  check_in_at: string | null;
  check_out_at: string | null;
  attendance_status: 'Hadir' | 'Tidak Hadir' | 'Belum Presensi';
};
type RecapResponse = { period: { startDate: string; endDate: string }; summary: { total: number; present: number; absent: number; pending: number }; records: RecapRecord[] };

function todayValue() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()); }
function monthStart(value: string) { return `${value.slice(0, 8)}01`; }
function formatDate(value: string) { return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(`${value}T00:00:00+07:00`)); }
function formatTime(value: string | null) { return value ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : '-'; }

function RecapIcon({ name }: { name: 'users' | 'clock' | 'request' }) {
  const paths = {
    users: 'M16 19v-1.4a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 17.6V19m6-7a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm5.4-6.2a3.5 3.5 0 0 1 0 6.4M15.4 14a3.6 3.6 0 0 1 4.6 3.4V19',
    clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0Z',
    request: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  };
  return <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function StaffAttendanceRecapPage() {
  const today = useMemo(todayValue, []);
  const [startDate, setStartDate] = useState(monthStart(today));
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState<RecapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Semua');
  const [exporting, setExporting] = useState<'excel' | 'pdf' | ''>('');

  function load() {
    setLoading(true); setError('');
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    fetch(`/api/staff/attendance-recap?${params}`, { credentials: 'include', cache: 'no-store' })
      .then(async (response) => { const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(typeof body.message === 'string' ? body.message : 'Rekap presensi gagal dimuat'); return body as RecapResponse; })
      .then(setData)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Rekap presensi gagal dimuat'))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function exportRecap(format: 'excel' | 'pdf') {
    setExporting(format); setError('');
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate, format });
      const response = await fetch(`/api/staff/attendance-recap/export?${params}`, { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error('Export rekap gagal dibuat');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `rekap-presensi-${startDate}-${endDate}.${format === 'excel' ? 'xls' : 'pdf'}`; link.click(); URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Export rekap gagal dibuat'); } finally { setExporting(''); }
  }

  const records = data?.records.filter((record) => (status === 'Semua' || record.attendance_status === status) && `${record.participant_name} ${record.institution_name} ${record.program_type}`.toLowerCase().includes(query.toLowerCase())) ?? [];
  const summary = data?.summary ?? { total: 0, present: 0, absent: 0, pending: 0 };

  return <UsersPageShell role="staff_presensi" eyebrow="STAFF PRESENSI / REKAP PRESENSI" title="Rekap Presensi" description="Tinjau riwayat kehadiran peserta berdasarkan periode.">
    <div className="staff-recap-page">
      <section className="staff-recap-heading"><div><span className="admin-kicker">PUSAT DATA KEHADIRAN</span><h1>Rekap presensi peserta</h1><p>Gunakan periode untuk melihat catatan presensi yang tersimpan.</p></div></section>
      {error && <p className="dashboard-stats-note" role="alert">{error}</p>}
      <section className="staff-recap-filters" aria-label="Filter rekap presensi"><label><span>Mulai periode</span><input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} /></label><label><span>Sampai periode</span><input type="date" value={endDate} min={startDate} max={today} onChange={(event) => setEndDate(event.target.value)} /></label><label className="staff-recap-search"><span>Cari peserta</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama atau institusi" /></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Semua</option><option>Hadir</option><option>Tidak Hadir</option><option>Belum Presensi</option></select></label><button className="primary-action staff-recap-filter-button" type="button" onClick={load} disabled={loading}>{loading ? 'Memuat...' : 'Terapkan filter'}</button></section>
      <section className="staff-recap-summary" aria-label="Ringkasan rekap"><article className="staff-recap-metric staff-recap-metric-navy"><span className="staff-recap-metric-icon"><RecapIcon name="users" /></span><div><span>Total sesi</span><strong>{summary.total}</strong></div></article><article className="staff-recap-metric staff-recap-metric-teal"><span className="staff-recap-metric-icon"><RecapIcon name="clock" /></span><div><span>Hadir</span><strong>{summary.present}</strong></div></article><article className="staff-recap-metric staff-recap-metric-red"><span className="staff-recap-metric-icon"><RecapIcon name="users" /></span><div><span>Tidak hadir</span><strong>{summary.absent}</strong></div></article><article className="staff-recap-metric staff-recap-metric-gold"><span className="staff-recap-metric-icon"><RecapIcon name="request" /></span><div><span>Belum presensi</span><strong>{summary.pending}</strong></div></article></section>
      <section className="staff-recap-card"><div className="staff-recap-card-heading"><div><span className="admin-kicker">DAFTAR KEHADIRAN</span><h2>Riwayat presensi peserta</h2></div><div className="staff-recap-card-actions"><span className="staff-recap-period">{startDate} – {endDate}</span><button type="button" className="staff-recap-export staff-recap-export-excel" onClick={() => void exportRecap('excel')} disabled={Boolean(exporting)}>{exporting === 'excel' ? 'Menyiapkan...' : 'Export Excel'}</button><button type="button" className="staff-recap-export staff-recap-export-pdf" onClick={() => void exportRecap('pdf')} disabled={Boolean(exporting)}>{exporting === 'pdf' ? 'Menyiapkan...' : 'Export PDF'}</button></div></div><div className="staff-recap-table-wrap"><table className="staff-recap-table"><thead><tr><th>Tanggal</th><th>Peserta</th><th>Institut pendidikan</th><th>Jenis prakerin</th><th>Jam masuk</th><th>Jam pulang</th><th>Status</th></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="staff-recap-empty">Memuat data rekap...</td></tr> : records.length ? records.map((record) => <tr key={`${record.work_date}-${record.participant_name}`}><td>{formatDate(record.work_date)}</td><td><strong>{record.participant_name}</strong></td><td><strong>{record.institution_name}</strong><small>{record.institution_type}</small></td><td>{record.program_type}</td><td>{formatTime(record.check_in_at)}</td><td>{formatTime(record.check_out_at)}</td><td><span className={`staff-recap-status staff-recap-status-${record.attendance_status === 'Hadir' ? 'present' : record.attendance_status === 'Tidak Hadir' ? 'absent' : 'pending'}`}>{record.attendance_status}</span></td></tr>) : <tr><td colSpan={7} className="staff-recap-empty"><strong>Tidak ada data presensi</strong><span>Data sesuai periode dan filter akan muncul di sini.</span></td></tr>}</tbody></table></div></section>
    </div>
  </UsersPageShell>;
}


