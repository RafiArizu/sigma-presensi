import { useEffect, useMemo, useState, type FormEvent } from 'react';
import UsersPageShell from '../users/usersPageShell';
import LocationMap from '../../../components/LocationMap';
import styles from '../../../styles/lokasiForm.module.css';

type LocationDetail = { id: string; alamat: string; latitude: number; longitude: number; radiusMeters: number; status: 'Non Aktif' | 'Aktif' };

export default function LokasiEditPage() {
  const id = useMemo(() => window.location.pathname.split('/').filter(Boolean)[window.location.pathname.split('/').filter(Boolean).length - 2] ?? '', []);
  const cancelPath = useMemo(() => new URLSearchParams(window.location.search).get('from') === 'detail' ? `/super-admin/lokasi/${id}` : '/super-admin/lokasi', [id]);
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0, radiusMeters: 150 });
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/locations/${encodeURIComponent(id)}`, { credentials: 'include' })
      .then(async (response) => { const body = await response.json().catch(() => null) as { location?: LocationDetail; message?: string } | null; if (!response.ok || !body?.location) throw new Error(body?.message ?? 'Lokasi gagal dimuat'); setLocation(body.location); setCoordinates({ latitude: body.location.latitude, longitude: body.location.longitude, radiusMeters: body.location.radiusMeters }); })
      .catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [id]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!location) return; setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/locations/${encodeURIComponent(id)}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alamat: form.get('alamat'), status: form.get('status'), ...coordinates }) });
    if (!response.ok) { const body = await response.json().catch(() => null) as { message?: string } | null; setError(body?.message ?? 'Lokasi gagal diperbarui'); setSaving(false); return; }
    window.sessionStorage.setItem('sigma-location-feedback', 'Data Lokasi Berhasil di ubah'); window.history.pushState({}, '', `/super-admin/lokasi/${id}`); window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (isLoading) return <UsersPageShell eyebrow="SUPER ADMIN / LOKASI / EDIT" title="Edit lokasi" description="Memuat data lokasi."><section className={styles.card}><p>Memuat lokasi...</p></section></UsersPageShell>;
  if (error || !location) return <UsersPageShell eyebrow="SUPER ADMIN / LOKASI / EDIT" title="Edit lokasi" description="Data lokasi tidak tersedia."><section className={styles.card}><p className={styles.error} role="alert">{error || 'Lokasi tidak ditemukan'}</p><div className={styles.actions}><a className={styles.cancel} href="/super-admin/lokasi">Kembali</a></div></section></UsersPageShell>;

  return <UsersPageShell eyebrow="SUPER ADMIN / LOKASI / EDIT" title="Edit lokasi" description="Perbarui titik presensi dan radius yang berlaku."><form className={styles.form} onSubmit={submit}>
    <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.kicker}>IDENTITAS LOKASI</span><h2>Detail lokasi</h2><p>Gunakan alamat yang mudah dikenali staff.</p></div></div><div className={styles.fields}><label>Alamat lokasi<input required name="alamat" maxLength={150} defaultValue={location.alamat} /></label><label>Status<select name="status" defaultValue={location.status}><option value="Aktif">Aktif</option><option value="Non Aktif">Non Aktif</option></select></label></div></section>
    <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.kicker}>TITIK PRESENSI</span><h2>Atur titik dan radius</h2><p>Klik peta atau geser marker untuk memperbarui pusat lokasi.</p></div><output className={styles.radiusOutput}>{Math.round(coordinates.radiusMeters)} m radius</output></div><LocationMap {...coordinates} onChange={setCoordinates} /><div className={styles.mapControls}><label>Radius lokasi (meter)<input type="number" min="1" max="10000" step="1" value={coordinates.radiusMeters} onChange={(event) => setCoordinates((current) => ({ ...current, radiusMeters: Number(event.target.value) || 1 }))} /></label><div className={styles.coordinateReadout}><span>Latitude <strong>{coordinates.latitude.toFixed(6)}</strong></span><span>Longitude <strong>{coordinates.longitude.toFixed(6)}</strong></span></div></div></section>
    {error && <p className={styles.error} role="alert">{error}</p>}<div className={styles.actions}><a className={styles.cancel} href={cancelPath}>Batal</a><button className={styles.save} type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan perubahan'}</button></div>
  </form></UsersPageShell>;
}