import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import '../../styles/Login.css';

const OTP_LENGTH = 6;
const OTP_DURATION = 60;
const DEMO_OTP = '123456';

export default function ResetPasswordPage() {
  const [email_user, setEmailUser] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [remainingSeconds, setRemainingSeconds] = useState(OTP_DURATION);
  const [isOtpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setEmailUser(sessionStorage.getItem('sigma.reset.email') ?? '');
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0 || isOtpVerified) return undefined;
    const timer = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(seconds - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds, isOtpVerified]);

  const otpCode = otp.join('');
  const isExpired = remainingSeconds === 0;

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setMessage('');
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
    if (nextOtp.join('').length === OTP_LENGTH && nextOtp.join('') !== DEMO_OTP) setMessage('Kode OTP salah. Periksa email dan coba lagi.');
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }

  function verifyOtp() {
    if (isExpired) { setMessage('Kode OTP sudah kedaluwarsa. Minta kode baru.'); return; }
    if (otpCode !== DEMO_OTP) { setMessage('Kode OTP salah.'); return; }
    setOtpVerified(true);
    setMessage('Kode OTP benar. Buat password baru.');
  }

  function resendOtp() {
    setOtp(Array(OTP_LENGTH).fill(''));
    setRemainingSeconds(OTP_DURATION);
    setMessage('Kode OTP baru dikirim.');
    setTimeout(() => otpRefs.current[0]?.focus(), 0);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isOtpVerified) { verifyOtp(); return; }
    if (password.length < 8) { setMessage('Password baru minimal 8 karakter.'); return; }
    if (password !== confirmation) { setMessage('Konfirmasi password tidak cocok.'); return; }
    setMessage('Password baru siap disimpan setelah endpoint reset password tersedia.');
  }

  return (
    <main className="login-page">
      <section className="login-card reset-card" aria-labelledby="reset-password-title">
        <header className="login-header">
          <span className="login-brand">SIGMA / ACCOUNT RECOVERY</span>
          <h1 id="reset-password-title">Reset password</h1>
          <p>Kode OTP sudah dikirim ke <strong>{email_user || 'email akun Anda'}</strong>.</p>
        </header>
        <form className="login-form" onSubmit={handleSubmit}>
          {!isOtpVerified ? <>
            <div className="otp-status"><span className={`otp-status-dot ${isExpired ? 'otp-status-expired' : ''}`} aria-hidden="true" /><span>{isExpired ? 'Kode OTP kedaluwarsa' : `Kode berlaku ${remainingSeconds} detik`}</span></div>
            <div className="otp-field"><label htmlFor="otp-0">Kode OTP</label><div className="otp-inputs" role="group" aria-label="Kode OTP 6 digit">{otp.map((digit, index) => <input key={index} ref={(element) => { otpRefs.current[index] = element; }} id={`otp-${index}`} aria-label={`Digit OTP ${index + 1}`} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} value={digit} onChange={(event) => handleOtpChange(index, event.target.value)} onKeyDown={(event) => handleOtpKeyDown(index, event)} />)}</div></div>
            <button className="login-submit" type="submit">Verifikasi OTP</button>
            {isExpired && <button className="login-resend" type="button" onClick={resendOtp}>Kirim ulang OTP</button>}
          </> : <>
            <div className="otp-confirmed"><span aria-hidden="true">✓</span><span>Kode OTP terverifikasi</span></div>
            <div className="login-field"><label htmlFor="new-password">Password baru</label><input id="new-password" name="new-password" type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required /></div>
            <div className="login-field"><label htmlFor="password-confirmation">Konfirmasi password baru</label><input id="password-confirmation" name="password-confirmation" type="password" autoComplete="new-password" placeholder="Ulangi password baru" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} maxLength={128} required /></div>
            <button className="login-submit" type="submit">Simpan password baru</button>
          </>}
          <p className="login-message" role="status" aria-live="polite">{message}</p>
        </form>
        <div className="login-link-row"><a className="login-back" href="/auth/forget-password">Ganti email</a>{!isExpired && !isOtpVerified && <span className="otp-hint">Cek inbox dan spam</span>}</div>
        <footer className="login-footer">PT. Vaiotech Lintas Nusantara</footer>
      </section>
    </main>
  );
}
