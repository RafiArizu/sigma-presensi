import { useEffect, useMemo, useState } from 'react';
import UsersPageShell from '../users/usersPageShell';
import LocationMap from '../../../components/LocationMap';
import styles from '../../../styles/lokasiForm.module.css';

type LocationDetail = {
  id: string;
  alamat: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  status: 'Non Aktif' | 'Aktif';
  participants: number;
  createdAt: string;
};

export default function LokasiDetailPage() {
  const id = useMemo(() => window.location.pathname.split('/').filter(Boolean).pop() ?? '', []);
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/locations/${encodeURIComponent(id)}`, { credentials: 'include' })
      .then(async (response) => {
        const body = await response.json().catch(() => null) as { location?: LocationDetail; message?: string } | null;
        if (!response.ok || !body?.location) throw new Error(body?.message ?? 'Detail lokasi gagal dimuat');
        setLocation(body.location);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (isLoading) return <UsersPageShell eyebrow="SUPER ADMIN / LOKASI / DETAIL" title="Detail lokasi" description="Memuat informasi lokasi presensi."><section className={styles.card}><p>Memuat lokasi...</p></section></UsersPageShell>;
  if (error || !location) return <UsersPageShell eyebrow="SUPER ADMIN / LOKASI / DETAIL" title="Detail lokasi" description="Informasi lokasi tidak tersedia."><section className={styles.card}><p className={styles.error} role="alert">{error || 'Lokasi tidak ditemukan'}</p><div className={styles.actions}><a className={styles.cancel} href="/super-admin/lokasi">Kembali ke lokasi</a></div></section></UsersPageShell>;

  return <UsersPageShell eyebrow="SUPER ADMIN / LOKASI / DETAIL" title="Detail lokasi" description="Lihat titik presensi dan radius yang berlaku.">
    <div className={styles.form}>
      <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.kicker}>IDENTITAS LOKASI</span><h2>Detail lokasi</h2><p>Informasi dasar lokasi presensi SIGMA.</p></div><span className={styles.statusBadge}>{location.status}</span></div><div className={styles.detailFields}><div className={styles.infoItem}><span className={styles.infoLabel}>Alamat lokasi</span><strong className={styles.infoValue}>{location.alamat}</strong></div><div className={styles.infoItem}><span className={styles.infoLabel}>Status Lokasi</span><span className={`${styles.statusBadge} ${location.status === 'Aktif' ? styles.statusActive : styles.statusInactive}`}>{location.status}</span></div></div></section>
      <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.kicker}>TITIK PRESENSI</span><h2>Lokasi dan radius</h2><p>Titik ini digunakan sebagai pusat validasi presensi.</p></div><output className={styles.radiusOutput}>{Math.round(location.radiusMeters)} m radius</output></div><LocationMap latitude={location.latitude} longitude={location.longitude} radiusMeters={location.radiusMeters} onChange={() => undefined} interactive={false} /><div className={styles.mapControls}><label>Radius lokasi (meter)<input value={Math.round(location.radiusMeters)} readOnly /></label><div className={styles.coordinateReadout}><span>Latitude <strong>{location.latitude.toFixed(6)}</strong></span><span>Longitude <strong>{location.longitude.toFixed(6)}</strong></span></div></div></section>
      <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.kicker}>RINGKASAN</span><h2>Penggunaan lokasi</h2><p>Ringkasan penggunaan titik presensi saat ini.</p></div></div><div className={styles.fields}><label>Peserta terjangkau<input value={`${location.participants} peserta`} readOnly /></label><label>Dibuat pada<input value={new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(location.createdAt))} readOnly /></label></div></section>
      <div className={styles.actions}><a className={styles.cancel} href="/super-admin/lokasi">Kembali ke lokasi</a><a className={styles.save} href={`/super-admin/lokasi/${location.id}/edit`}>Edit lokasi</a></div>
    </div>
  </UsersPageShell>;
}