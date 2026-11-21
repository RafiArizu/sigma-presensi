import { useEffect } from 'react';

type AuthMessageProps = {
  message: string;
  tone?: 'error' | 'success';
  onClose: () => void;
};

export default function AuthMessage({ message, tone = 'error', onClose }: AuthMessageProps) {
  useEffect(() => {
    if (!message) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="auth-message-layer" role="presentation">
      <div className={`auth-message auth-message-${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'}>
        <span className="auth-message-mark" aria-hidden="true">{tone === 'error' ? '!' : 'OK'}</span>
        <p>{message}</p>
        <button type="button" className="auth-message-close" onClick={onClose} aria-label="Tutup pesan">x</button>
      </div>
    </div>
  );
}
