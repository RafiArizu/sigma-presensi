import { useEffect, useRef, useState } from 'react';
import { ArcElement, BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, PieController, Tooltip } from 'chart.js';
import Sidebar from '../../../components/sidebar';
import type { UserRole } from '../../../components/sidebar';
import Header from '../../../components/header';
import { cacheUser, getCachedUser } from '../../../api/authSession';
import '../../../styles/AdminDashboard.css';

Chart.register(ArcElement, BarController, BarElement, CategoryScale, Legend, LinearScale, PieController, Tooltip);

type SuperAdminUser = { id: string; name: string; email: string | null; role: string };
type AuthResponse = { user: SuperAdminUser };
type DashboardIconName = 'users' | 'person' | 'folder' | 'alert' | 'clock' | 'check';
type DashboardStats = {
  metrics: { participants: number; staff: number; photos: number; overload: 'safe' | 'warning' | 'danger' };
  attendanceTrend: { day: string; total: number }[];
  storage: { status: string; total: number }[];
};

type DashboardMetric = { label: string; value: number; icon: DashboardIconName; tone: 'amber' | 'teal' | 'gold' | 'navy' };
const activityItems = [
  { label: 'Mengatur Retensi Waktu', time: '09:00', icon: 'clock' as DashboardIconName },
  { label: 'Menambah Users', time: '08:58', icon: 'users' as DashboardIconName },
  { label: 'Mengatur Retensi Waktu', time: '08:56', icon: 'folder' as DashboardIconName },
];

function DashboardIcon({ name }: { name: DashboardIconName }) {
  const paths: Record<DashboardIconName, string> = {
    users: 'M16 19v-1.4a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 17.6V19m6-7a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm5.4-6.2a3.5 3.5 0 0 1 0 6.4M15.4 14a3.6 3.6 0 0 1 4.6 3.4V19',
    person: 'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 7a7 7 0 0 1 14 0',
    folder: 'M3 6.5h6l2 2h10v9.8A1.7 1.7 0 0 1 19.3 20H4.7A1.7 1.7 0 0 1 3 18.3V6.5Z',
    alert: 'M12 3 22 20H2L12 3Zm0 6v5m0 3h.01',
    check: 'm5 12 4 4L19 6',
    clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  };

  return <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<SuperAdminUser | null>(() => getCachedUser<SuperAdminUser>());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [authError, setAuthError] = useState('');
  const [statsError, setStatsError] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const attendanceChartRef = useRef<HTMLCanvasElement>(null);
  const storageChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch('/api/auth/currentUser', { credentials: 'include' })
      .then(async (response) => { if (!response.ok) throw new Error('Sesi tidak valid'); return response.json() as Promise<AuthResponse>; })
      .then((data) => { if (data.user.role !== 'super_admin') throw new Error('Akses hanya untuk Super Admin'); cacheUser(data.user); setUser(data.user); })
      .catch((reason: Error) => setAuthError(reason.message));
  }, []);

  useEffect(() => {
    fetch('/api/admin/dashboard/stats', { credentials: 'include' })
      .then(async (response) => { if (!response.ok) throw new Error('Statistik dashboard gagal dimuat'); return response.json() as Promise<DashboardStats>; })
      .then(setStats)
      .catch((reason: Error) => setStatsError(reason.message));
  }, []);

  useEffect(() => {
    if (!stats || !attendanceChartRef.current || !storageChartRef.current) return;
    const attendanceChart = new Chart(attendanceChartRef.current, {
      type: 'bar',
      data: {
        labels: stats.attendanceTrend.map((item) => new Intl.DateTimeFormat('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(`${item.day}T12:00:00+07:00`))),
        datasets: [{ label: 'Presensi', data: stats.attendanceTrend.map((item) => item.total), backgroundColor: '#2C58A2', borderRadius: 4, borderSkipped: false }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#BCCFEF' } }, x: { grid: { display: false } } } },
    });
    const storageLabels = stats.storage.length ? stats.storage.map((item) => item.status) : ['Belum ada foto'];
    const storageValues = stats.storage.length ? stats.storage.map((item) => item.total) : [1];
    const storageColors = stats.storage.length ? ['#244E96', '#D7A156', '#7C8CA8', '#56A77A'] : ['#BCCFEF'];
    const storageChart = new Chart(storageChartRef.current, {
      type: 'pie',
      data: {
        labels: storageLabels,
        datasets: [{ data: storageValues, backgroundColor: storageColors, borderColor: '#EEF3F9', borderWidth: 3 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    });
    return () => { attendanceChart.destroy(); storageChart.destroy(); };
  }, [stats]);

  if (authError) return <main className="admin-shell admin-shell-message"><section className="admin-panel"><p className="admin-kicker">SIGMA / SYSTEM CONTROL</p><h1>Akses ditolak</h1><p>{authError}</p><a href="/login">Kembali ke login</a></section></main>;
  if (!user) return null;

  const dashboardMetrics: DashboardMetric[] = [
    { label: 'Total Peserta Prakerin', value: stats?.metrics.participants ?? 0, icon: 'person', tone: 'navy' },
    { label: 'Total Staff Presensi', value: stats?.metrics.staff ?? 0, icon: 'person', tone: 'teal' },
    { label: 'Data Foto Presensi', value: stats?.metrics.photos ?? 0, icon: 'folder', tone: 'gold' },
  ];
  const overload = stats?.metrics.overload ?? 'safe';
  const overloadIcon: DashboardIconName = overload === 'safe' ? 'check' : 'alert';

  return <div className="admin-shell">
    <Sidebar currentPath={window.location.pathname} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} role={user.role as UserRole} />
    <div className="admin-main">
      <Header userName={user.name} role={user.role as UserRole} onMenuToggle={() => setSidebarOpen(true)} />
      <main className="admin-content">
        <div className="dashboard-page dashboard-figma">
          <section className="users-page-heading dashboard-page-heading"><h1>Dashboard Super Admin</h1></section>
          <section className="dashboard-summary-grid" aria-label="Ringkasan data SIGMA">
            {dashboardMetrics.map((metric) => <article className="dashboard-summary-card" key={metric.label}><span className={`dashboard-summary-icon dashboard-summary-icon-${metric.tone}`}><DashboardIcon name={metric.icon} /></span><div><p>{metric.label}</p><strong>{metric.value.toLocaleString('id-ID')}</strong></div></article>)}
            <article className="dashboard-summary-card dashboard-overload-card"><span className={`dashboard-summary-icon dashboard-overload-icon dashboard-overload-${overload}`}><DashboardIcon name={overloadIcon} /></span><div><div className="dashboard-overload-status"><span>{overload === 'safe' ? 'Penyimpanan Aman Terkendali' : overload === 'warning' ? 'Penyimpanan mulai menumpuk' : 'Penyimpanan overload, segera hapus foto!'}</span></div><strong>{(stats?.metrics.photos ?? 0).toLocaleString('id-ID')} foto tercatat</strong></div><a className={`dashboard-overload-action dashboard-overload-action-${overload}`} href="/super-admin/data-governance">Kelola Data</a></article>
          </section>
          <section className="dashboard-main-grid" aria-label="Ringkasan operasional">
            <article className="dashboard-chart-card"><div className="dashboard-card-heading"><h2>Grafik Presensi</h2><span className="dashboard-chart-caption">7 hari terakhir</span></div><div className="dashboard-chart-canvas"><canvas ref={attendanceChartRef} aria-label="Grafik presensi tujuh hari terakhir" role="img" /></div></article>
            <article className="dashboard-chart-card dashboard-deviation-card"><div className="dashboard-card-heading"><h2>Grafik Penyimpanan Data</h2><span className="dashboard-chart-caption">Status foto</span></div><div className="dashboard-chart-canvas dashboard-pie-canvas"><canvas ref={storageChartRef} aria-label="Grafik status penyimpanan data foto" role="img" /></div></article>
          </section>
          {statsError && <p className="dashboard-stats-note">Data statistik belum dapat dimuat. Nilai kartu menampilkan data sementara.</p>}
          <section className="dashboard-bottom-grid"><article className="dashboard-activity-panel"><h2>Log Activity</h2><div className="dashboard-activity-list">{activityItems.map((item) => <div className="dashboard-activity-row" key={`${item.label}-${item.time}`}><DashboardIcon name={item.icon} /><span>{item.label}</span><time>{item.time}</time></div>)}</div></article><article className="dashboard-actions-panel"><h2>Aksi Cepat</h2><div className="dashboard-action-list"><a href="/super-admin/users"><DashboardIcon name="users" /><span>Tambah User</span></a><a href="/super-admin/data-governance"><DashboardIcon name="clock" /><span>Atur Retensi</span></a><a href="/super-admin/data-governance"><DashboardIcon name="folder" /><span>Hapus Foto</span></a></div></article></section>
        </div>
      </main>
    </div>
  </div>;
}
