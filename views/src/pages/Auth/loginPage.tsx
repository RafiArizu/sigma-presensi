import { useState, type FormEvent } from 'react';
import '../../styles/Login.css';
import { cacheUser } from '../../api/authSession';
import AuthMessage from '../../components/AuthMessage';

type LoginResponse = { user: { id: string; name: string; user_name: string; email: string | null; role: string } };

export default function Login() {
  const [identifier, setIdentifier] = useState('');
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
        body: JSON.stringify({ identifier, password }),
      });
      const rawResponse = await response.text();
      let data: (LoginResponse & { message?: string }) | null = null;
      if (rawResponse.trim()) {
        try { data = JSON.parse(rawResponse) as LoginResponse & { message?: string }; }
        catch { data = null; }
      }

      if (!response.ok) throw new Error(data?.message ?? ('Server gagal memproses login (HTTP ' + response.status + ').'));
      if (!data?.user) throw new Error('Response login tidak valid. Coba muat ulang halaman.');
      cacheUser(data.user);
      const redirectPath = data.user.role === 'super_admin'
        ? '/super-admin/dashboard'
        : data.user.role === 'staff_presensi'
          ? '/staff/dashboard'
          : '/peserta/dashboard';
      window.location.assign(redirectPath);
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
            <label htmlFor="identifier">Email atau username</label>
            <input id="identifier" name="identifier" type="text" autoComplete="username" placeholder="nama@contoh.com atau username peserta" value={identifier} onChange={(event) => setIdentifier(event.target.value)} maxLength={254} required />
          </div>
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.target.value)} maxLength={128} required />
          </div>
          <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Masuk'}</button>
        </form>
        <a className="login-forgot" href="/auth/forget-password">Lupa password?</a>
        <footer className="login-footer">PT. Vaiotech Lintas Nusantara</footer>
      </section>
      <AuthMessage message={message} onClose={() => setMessage('')} />
    </main>
  );
}




