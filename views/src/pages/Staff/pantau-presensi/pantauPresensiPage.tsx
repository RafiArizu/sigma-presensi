import { useEffect, useState } from 'react';
import UsersPageShell from '../../Admin/users/usersPageShell';
import '../../../styles/AdminDashboard.css';

type Attendance = { name: string; institution_type: string; institution_name: string; program_type: string; phone: string };
type AbsentParticipant = { name: string; institution_name: string; program_type: string; phone: string };
type StaffStats = { participants: number; checkedIn: number; notPresent: number; attendance: Attendance[]; absentParticipants: AbsentParticipant[] };

function MonitorIcon({ type }: { type: 'users' | 'check' | 'clock' }) {
  const paths = {
    users: 'M16 19v-1.4a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 17.6V19m6-7a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm5.4-6.2a3.5 3.5 0 0 1 0 6.4M15.4 14a3.6 3.6 0 0 1 4.6 3.4V19',
    check: 'm5 12 4 4L19 6',
    clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z',
  };
  return <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[type]} /></svg>;
}

export default function StaffAttendanceMonitorPage() {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/staff/dashboard/stats', { credentials: 'include', cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Data presensi gagal dimuat');
        return response.json() as Promise<{ metrics: Omit<StaffStats, 'attendance' | 'absentParticipants'>; attendance: Attendance[]; absentParticipants: AbsentParticipant[] }>;
      })
      .then(({ metrics, attendance, absentParticipants }) => setStats({ ...metrics, attendance, absentParticipants }))
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const checkedIn = stats?.checkedIn ?? 0;
  const participants = stats?.participants ?? 0;
  const progress = participants ? Math.min(100, Math.round((checkedIn / participants) * 100)) : 0;

  return <UsersPageShell role="staff_presensi" eyebrow="STAFF PRESENSI / PANTAU PRESENSI" title="Pantau Presensi" description="Pantau status kehadiran peserta pada hari berjalan.">
    <div className="staff-monitor-page">
      <section className="staff-monitor-heading"><div><h1>Presensi peserta hari ini</h1></div></section>
      {error && <p className="dashboard-stats-note">{error}. Coba muat ulang halaman.</p>}
      <section className="staff-monitor-metrics" aria-label="Ringkasan presensi"><article><span className="staff-monitor-icon staff-monitor-icon-navy"><MonitorIcon type="users" /></span><div><span>Peserta aktif</span><strong>{participants}</strong></div></article><article><span className="staff-monitor-icon staff-monitor-icon-teal"><MonitorIcon type="check" /></span><div><span>Sudah check-in</span><strong>{checkedIn}</strong></div></article><article><span className="staff-monitor-icon staff-monitor-icon-red"><MonitorIcon type="clock" /></span><div><span>Belum presensi</span><strong>{stats?.notPresent ?? 0}</strong></div></article></section>
      <section className="staff-dashboard-progress" aria-label="Progress presensi hari ini"><div className="staff-dashboard-progress-heading"><div><span className="admin-kicker">PROGRESS HARI INI</span><h2>Presensi peserta hari ini</h2></div><strong>{checkedIn} / {participants} peserta</strong></div><div className="staff-dashboard-progress-track"><span style={{ width: `${progress}%` }} /></div><div className="staff-dashboard-progress-meta"><span>{progress}% peserta sudah check-in</span><span>{stats?.absentParticipants.length ?? 0} belum presensi</span></div></section>
      <section className="staff-monitor-layout"><article className="staff-monitor-table-card"><div className="staff-monitor-card-heading"><div><span className="admin-kicker">SUDAH HADIR</span><h2>Peserta sudah presensi</h2></div><span className="staff-dashboard-count"><MonitorIcon type="users" /> {stats?.attendance.length ?? 0} peserta</span></div>{stats?.attendance.length ? <div className="staff-monitor-table-wrap"><table className="staff-monitor-table"><thead><tr><th>Nama</th><th>Jenis Institut Pendidikan</th><th>Nama Sekolah/Perguruan Tinggi</th><th>Jenis Prakerin</th><th>No Telp</th></tr></thead><tbody>{stats.attendance.map((participant) => <tr key={`${participant.name}-${participant.phone}`}><td>{participant.name}</td><td>{participant.institution_type}</td><td>{participant.institution_name}</td><td>{participant.program_type}</td><td>{participant.phone}</td></tr>)}</tbody></table></div> : <div className="staff-monitor-empty"><MonitorIcon type="check" /><strong>Belum ada presensi masuk hari ini</strong><span>Peserta yang berhasil check-in akan tampil di sini.</span></div>}</article><aside className="staff-monitor-absent-card"><div className="staff-monitor-card-heading"><div><span className="admin-kicker">PERLU DITINDAKLANJUTI</span><h2>Belum presensi</h2></div><strong>{stats?.absentParticipants.length ?? 0}</strong></div>{stats?.absentParticipants.length ? <div className="staff-monitor-absent-list">{stats.absentParticipants.map((participant) => <div key={`${participant.name}-${participant.phone}`}><span className="staff-monitor-absent-icon"><MonitorIcon type="users" /></span><span><strong>{participant.name}</strong><small>{participant.institution_name} · {participant.program_type}</small></span></div>)}</div> : <div className="staff-monitor-empty"><MonitorIcon type="check" /><strong>Semua peserta sudah presensi</strong></div>}</aside></section>
    </div>
  </UsersPageShell>;
}

