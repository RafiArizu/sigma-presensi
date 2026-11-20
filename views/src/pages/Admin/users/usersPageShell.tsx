import { useEffect, useState, type ReactNode } from 'react';
import Sidebar from '../../../components/sidebar';
import type { UserRole } from '../../../components/sidebar';
import Header from '../../../components/header';
import '../../../styles/AdminDashboard.css';
import { cacheUser, getCachedUser } from '../../../api/authSession';

type CurrentUser = { id: string; name: string; email: string | null; role: UserRole };

type UsersPageShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

export default function UsersPageShell({ children, eyebrow, title, description }: UsersPageShellProps) {
  const [user, setUser] = useState<CurrentUser | null>(() => getCachedUser<CurrentUser>());
  const [error, setError] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/currentUser', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Sesi tidak valid');
        return response.json() as Promise<{ user: CurrentUser }>;
      })
      .then(({ user: currentUser }) => {
        if (currentUser.role !== 'super_admin') throw new Error('Akses hanya untuk Super Admin');
        cacheUser(currentUser);
        setUser(currentUser);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) {
    return (
      <main className="admin-shell admin-shell-message">
        <section className="admin-panel">
          <p className="admin-kicker">SIGMA / USER CONTROL</p>
          <h1>Akses ditolak</h1>
          <p>{error}</p>
          <a href="/login">Kembali ke login</a>
        </section>
      </main>
    );
  }

  if (!user) return null;

  return (
    <div className="admin-shell">
      <Sidebar currentPath={window.location.pathname} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} role="super_admin" />
      <div className="admin-main">
        <Header userName={user.name} role="super_admin" onMenuToggle={() => setSidebarOpen(true)} />
        <main className="admin-content">
          {children}
        </main>
        
      </div>
    </div>
  );
}
