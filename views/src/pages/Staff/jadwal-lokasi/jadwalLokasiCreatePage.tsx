import { useState, type FormEvent } from 'react';
import '../../../styles/AdminDashboard.css';

type Location = { id: string; alamat: string; radius_meters: string; status: string };
type FormState = { name: string; startTime: string; endTime: string; locationId: string; status: 'Aktif' | 'Non Aktif' };
type CreateProps = { locations: Location[]; onClose: () => void; onSaved: () => void | Promise<void> };
const emptyForm: FormState = { name: '', startTime: '08:00', endTime: '16:00', locationId: '', status: 'Aktif' };

async function readResponse(response: Response) { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(typeof data.message === 'string' ? data.message : 'Permintaan gagal diproses'); return data; }

export default function StaffScheduleLocationCreatePage({ locations, onClose, onSaved }: CreateProps) {
  const [form, setForm] = useState<FormState>({ ...emptyForm, locationId: locations[0]?.id ?? '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await readResponse(await fetch('/api/staff/schedules', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }));
      await onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Shift gagal dibuat');
    } finally {
      setSaving(false);
    }
  }
  return <div className="user-create-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="user-create-modal staff-shift-modal" role="dialog" aria-modal="true" aria-labelledby="shift-create-modal-title"><div className="staff-participant-modal-heading"><div><span className="admin-kicker">SHIFT BARU</span><h2 id="shift-create-modal-title">Tambah shift presensi</h2></div><button type="button" onClick={onClose} aria-label="Tutup">×</button></div>{error && <p className="dashboard-stats-note" role="alert">{error}</p>}<form className="staff-participant-form staff-shift-form" onSubmit={submit}><label>Nama shift<input required maxLength={250} value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Contoh: Shift Pagi" /></label><label>Lokasi presensi<select required value={form.locationId} onChange={(event) => update('locationId', event.target.value)}><option value="">Pilih lokasi aktif</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.alamat} · radius {Number(location.radius_meters).toLocaleString('id-ID')} m</option>)}</select></label><label>Status<select required value={form.status} onChange={(event) => update('status', event.target.value as FormState['status'])}><option value="Aktif">Aktif</option><option value="Non Aktif">Non Aktif</option></select></label><div className="staff-shift-form-row"><label>Jam masuk<input required type="time" value={form.startTime} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => update('startTime', event.target.value)} /></label><label>Jam pulang<input required type="time" value={form.endTime} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => update('endTime', event.target.value)} /></label></div><div className="staff-participant-form-actions"><button type="button" className="secondary-action" onClick={onClose}>Batal</button><button type="submit" className="primary-action" disabled={saving || !locations.length}>{saving ? 'Menyimpan...' : 'Buat shift'}</button></div></form></section></div>;
}
