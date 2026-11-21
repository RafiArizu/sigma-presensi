import { useState, type FormEvent } from 'react';
import '../../styles/Login.css';
import AuthMessage from '../../components/AuthMessage';

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMessage('Masukkan email yang valid.');
      return;
    }
    sessionStorage.setItem('sigma.reset.email', email.trim());
    window.location.assign('/auth/reset-password');
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="forgot-password-title">
        <header className="login-header">
          <span className="login-brand">SIGMA</span>
          <h1 id="forgot-password-title">Lupa password?</h1>
          <p>Masukkan email akun untuk menerima kode OTP.</p>
        </header>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="forgot-email">Email akun</label>
            <input id="forgot-email" name="email" type="email" autoComplete="email" placeholder="nama@contoh.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
          </div>
          <button className="login-submit" type="submit">Lanjutkan</button>
        </form>
        <a className="login-back" href="/login">Kembali ke login</a>
        <footer className="login-footer">PT. Vaiotech Lintas Nusantara</footer>
      </section>
      <AuthMessage message={message} onClose={() => setMessage('')} />
    </main>
  );
}
