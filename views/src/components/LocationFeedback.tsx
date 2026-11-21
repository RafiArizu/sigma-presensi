import { useEffect } from 'react';
import styles from './LocationFeedback.module.css';

type LocationFeedbackProps = { message: string; variant?: 'success' | 'danger'; resource?: 'location' | 'shift'; onClose: () => void };

export default function LocationFeedback({ message, variant = 'success', resource = 'location', onClose }: LocationFeedbackProps) {
  const label = resource === 'shift' ? 'SHIFT' : 'LOKASI';
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3600);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', onKeyDown); };
  }, [onClose]);

  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={styles.modal} role="status" aria-live="polite" aria-labelledby="feedback-title"><div className={`${styles.icon} ${variant === 'danger' ? styles.dangerIcon : ''}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4.2 4.2L19 6.5" /></svg></div><div className={styles.content}><span className={styles.kicker}>{variant === 'danger' ? `TINDAKAN ${label}` : `PEMBARUAN ${label}`}</span><h2 id="feedback-title">{message}</h2><p>{variant === 'danger' ? `Data ${label.toLowerCase()} sudah dihapus dari daftar aktif SIGMA.` : `Perubahan ${label.toLowerCase()} sudah tersimpan pada sistem SIGMA.`}</p></div><button className={styles.close} type="button" aria-label="Tutup notifikasi" onClick={onClose}>x</button></section></div>;
}



