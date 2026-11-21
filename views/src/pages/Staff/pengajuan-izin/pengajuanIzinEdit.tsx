import { useEffect, useState, type FormEvent } from 'react';
import '../../../styles/AdminDashboard.css';

type RequestStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';
export type LeaveRequest = { id: string; participant_name: string; leave_type: string; request_date: string; reason: string; status: RequestStatus };
type Props = { request: LeaveRequest; onClose: () => void; onSaved: (request: LeaveRequest) => void };

export default function PengajuanIzinEdit({ request, onClose, onSaved }: Props) {
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [reason, setReason] = useState(request.reason);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setStatus(request.status); setReason(request.reason); }, [request]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch('/api/staff/leave-requests/' + request.id, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, reason }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.message === 'string' ? data.message : 'Pengajuan izin gagal diperbarui');
      onSaved({ ...request, status, reason });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Pengajuan izin gagal diperbarui'); } finally { setSaving(false); }
  }
  return <div className="user-create-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}><section className="user-create-modal staff-leave-modal" role="dialog" aria-modal="true" aria-labelledby="leave-edit-title"><div className="staff-participant-modal-heading"><div><span className="admin-kicker">TINDAKAN PENGAJUAN</span><h2 id="leave-edit-title">Perbarui pengajuan izin</h2></div><button type="button" onClick={onClose} aria-label="Tutup" disabled={saving}>×</button></div><div className="staff-leave-meta"><span><small>Peserta</small><strong>{request.participant_name}</strong></span><span><small>Tanggal</small><strong>{request.request_date}</strong></span><span><small>Jenis izin</small><strong>{request.leave_type}</strong></span></div>{error && <p className="dashboard-stats-note" role="alert">{error}</p>}<form className="staff-participant-form staff-leave-form" onSubmit={submit}><label>Status pengajuan<select value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}><option>Menunggu</option><option>Disetujui</option><option>Ditolak</option></select></label><label>Alasan<textarea required value={reason} onChange={(event) => setReason(event.target.value)} rows={4} /></label><div className="staff-participant-form-actions"><button type="button" className="secondary-action" onClick={onClose} disabled={saving}>Batal</button><button type="submit" className="primary-action" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button></div></form></section></div>;
}
