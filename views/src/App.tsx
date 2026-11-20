import { useEffect, useState } from 'react';
import AdminDashboard from './pages/Admin/dashboard/dashboardPage';
import DataGovernancePage from './pages/Admin/data-governance/dataGovernancePage';
import UserListPage from './pages/Admin/users/userListPage';
import UserCreatePage from './pages/Admin/users/userCreatePage';
import UserDetailPage from './pages/Admin/users/userDetailPage';
import UserEditPage from './pages/Admin/users/userEditPage';
import SettingPage from './pages/Admin/settings/settingPage';
import LokasiPage from './pages/Admin/lokasi/lokasiPage';
import LokasiCreatePage from './pages/Admin/lokasi/lokasiCreatePage';
import LokasiDetailPage from './pages/Admin/lokasi/lokasiDetailPage';
import LokasiEditPage from './pages/Admin/lokasi/lokasiEditPage';
import Login from './pages/Auth/loginPage';
import ForgetPasswordPage from './pages/Auth/forget-password';
import ResetPasswordPage from './pages/Auth/reset-password';

type Page = 'forgot-password' | 'reset-password' | 'login' | 'admin-dashboard' | 'data-governance' | 'lokasi' | 'lokasi-create' | 'lokasi-detail' | 'lokasi-edit' | 'users' | 'user-create' | 'user-detail' | 'user-edit' | 'settings' | 'not-found';

function getPage(pathname: string): Page {
  const path = pathname.toLowerCase();
  if (path === '/login' || path === '/auth/login' || path === '/') return 'login';
  if (path === '/auth/forget-password' || path === '/forget-password') return 'forgot-password';
  if (path === '/auth/reset-password' || path === '/reset-password') return 'reset-password';
  if (path === '/super-admin/dashboard' || path === '/admin/dashboard' || path === '/admin/dashboard/index') return 'admin-dashboard';
  if (path === '/super-admin/data-governance' || path === '/super-admin/data-governance/') return 'data-governance';
  if (path === '/super-admin/lokasi/create') return 'lokasi-create';
  if (/^\/super-admin\/lokasi\/[^/]+\/edit$/.test(path)) return 'lokasi-edit';
  if (/^\/super-admin\/lokasi\/[^/]+$/.test(path)) return 'lokasi-detail';
  if (path === '/super-admin/lokasi' || path === '/super-admin/lokasi/') return 'lokasi';
  if (path === '/super-admin/users' || path === '/super-admin/users/') return 'users';
  if (path === '/super-admin/users/create') return 'user-create';
  if (path === '/super-admin/settings' || path === '/admin/settings' || path === '/peserta/settings') return 'settings';
  if (/^\/super-admin\/users\/[^/]+\/edit$/.test(path)) return 'user-edit';
  if (/^\/super-admin\/users\/[^/]+$/.test(path)) return 'user-detail';
  return 'not-found';
}

export function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const page = getPage(pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
      setPathname(url.pathname);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', onDocumentClick);
    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', onDocumentClick);
    };
  }, []);
  if (page === 'login') return <Login />;
  if (page === 'forgot-password') return <ForgetPasswordPage />;
  if (page === 'reset-password') return <ResetPasswordPage />;
  if (page === 'admin-dashboard') return <AdminDashboard />;
  if (page === 'data-governance') return <DataGovernancePage />;
  if (page === 'lokasi-create') return <LokasiCreatePage />;
  if (page === 'lokasi-detail') return <LokasiDetailPage />;
  if (page === 'lokasi-edit') return <LokasiEditPage />;
  if (page === 'lokasi') return <LokasiPage />;
  if (page === 'users') return <UserListPage />;
  if (page === 'user-create') return <UserCreatePage />;
  if (page === 'user-detail') return <UserDetailPage />;
  if (page === 'user-edit') return <UserEditPage />;
  if (page === 'settings') return <SettingPage />;
  return <main className="not-found-page"><p className="header-kicker">SIGMA / 404</p><h1>Halaman tidak ditemukan.</h1><a href="/login">Kembali ke login</a></main>;
}

