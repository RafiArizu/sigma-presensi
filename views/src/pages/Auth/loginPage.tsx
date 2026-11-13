import { useState, type FormEvent } from 'react';
import '../../styles/Login.css';

type LoginResponse = { user: { role: string } };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as LoginResponse & { message?: string };

      if (!response.ok) throw new Error(data.message ?? 'Login gagal');
      window.location.assign(data.user.role === 'super_admin' ? '/admin/dashboard' : '/');
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Login gagal');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <header className="login-header">
          <span className="login-brand">SIGMA</span>
          <h1 id="login-title">Masuk ke akun</h1>
          <p>Sistem Presensi PKL dan Magang</p>
        </header>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" placeholder="nama@contoh.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
          </div>
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.target.value)} maxLength={128} required />
          </div>
          <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Masuk'}</button>
          <p className="login-message" role="status" aria-live="polite">{message}</p>
        </form>
        <footer className="login-footer">PT. Vaiotech Lintas Nusantara</footer>
      </section>
    </main>
  );
}

