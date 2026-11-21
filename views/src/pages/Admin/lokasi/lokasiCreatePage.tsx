import { useState, type FormEvent } from 'react';
import UsersPageShell from '../users/usersPageShell';
import LocationMap from '../../../components/LocationMap';
import styles from '../../../styles/lokasiForm.module.css';

export default function LokasiCreatePage() {
  const [coordinates, setCoordinates] = useState({ latitude: -6.2088, longitude: 106.8456, radiusMeters: 150 });
  const [error, setError] = useState('');
  const [isSaving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/locations', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alamat: form.get('alamat'), status: form.get('status'), ...coordinates }) });
    if (!response.ok) { const body = await response.json().catch(() => null) as { message?: string } | null; setError(body?.message ?? 'Lokasi gagal disimpan'); setSaving(false); return; }
    window.sessionStorage.setItem('sigma-location-feedback', 'Lokasi Berhasil Ditambahkan'); window.history.pushState({}, '', '/super-admin/lokasi'); window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return <UsersPageShell eyebrow="SUPER ADMIN / LOKASI / NEW" title="Tambah lokasi" description="Tentukan titik presensi dan radius yang berlaku."><form className={styles.form} onSubmit={submit}>
    <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.kicker}>IDENTITAS LOKASI</span><h2>Detail lokasi</h2><p>Gunakan alamat yang mudah dikenali staff.</p></div></div><div className={styles.fields}><label>Alamat lokasi<input required name="alamat" maxLength={150} placeholder="Contoh: Jl. Sudirman No. 18, Jakarta Selatan" /></label><label>Status<select name="status" defaultValue="Aktif"><option value="Aktif">Aktif</option><option value="Non Aktif">Non Aktif</option></select></label></div></section>
    <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.kicker}>TITIK PRESENSI</span><h2>Atur titik dan radius</h2><p>Klik peta atau geser marker untuk menentukan pusat lokasi.</p></div><output className={styles.radiusOutput}>{Math.round(coordinates.radiusMeters)} m radius</output></div><LocationMap {...coordinates} onChange={setCoordinates} /><div className={styles.mapControls}><label>Radius lokasi (meter)<input type="number" min="1" max="10000" step="1" value={coordinates.radiusMeters} onChange={(event) => setCoordinates((current) => ({ ...current, radiusMeters: Number(event.target.value) || 1 }))} /></label><div className={styles.coordinateReadout}><span>Latitude <strong>{coordinates.latitude.toFixed(6)}</strong></span><span>Longitude <strong>{coordinates.longitude.toFixed(6)}</strong></span></div></div></section>
    {error && <p className={styles.error} role="alert">{error}</p>}<div className={styles.actions}><a className={styles.cancel} href="/super-admin/lokasi">Batal</a><button className={styles.save} type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan lokasi'}</button></div>
  </form></UsersPageShell>;
}