import folderIcon from '../assets/icons/folder-sidebar.svg';
import homeIcon from '../assets/icons/home-sidebar.svg';
import logoutIcon from '../assets/icons/logout-sidebar.svg';
import lokasiIcon from '../assets/icons/lokasi-sidebar.svg';
import logoIcon from '../assets/icons/logo-sementara.svg';
import { clearCachedUser } from '../api/authSession';
import settingsIcon from '../assets/icons/settings-sidebar.svg';
import userIcon from '../assets/icons/user-sidebar.svg';

import styles from '../styles/Sidebar.module.css';

export type UserRole = 'peserta' | 'staff_presensi' | 'super_admin';

type IconName = 'Dashboard' | 'users' | 'lokasi' | 'data' | 'settings' | 'logout' | 'clock' | 'history' | 'request' | 'profile';
type NavigationItem = { label: string; href: string; icon: IconName };
type SidebarProps = { currentPath: string; isOpen: boolean; onClose: () => void; role: UserRole };



function SidebarIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    Dashboard: 'M4 10.5 12 4l8 6.5v8.25a1.25 1.25 0 0 1-1.25 1.25h-4.5v-5h-4.5v5h-4.5A1.25 1.25 0 0 1 4 18.75V10.5Z',
    lokasi: 'M12 21s7-6.2 7-12A7 7 0 0 0 5 9c0 5.8 7 12 7 12Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    users: 'M15.5 19.5v-1.25A3.25 3.25 0 0 0 12.25 15H6.75a3.25 3.25 0 0 0-3.25 3.25v1.25M9.5 11.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM16 5.25a3.25 3.25 0 0 1 0 6.32M16.75 15a3.25 3.25 0 0 1 3.75 3.25v1.25',
    data: 'M4 5.5h16M4 12h16M4 18.5h16',
    settings: 'M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5ZM19.25 12a7.3 7.3 0 0 0-.1-1.15l1.6-1.25-1.75-3.02-1.9.8a7.3 7.3 0 0 0-1.98-1.15L14.85 4h-3.5l-.3 2.23a7.3 7.3 0 0 0-1.98 1.15l-1.9-.8-1.75 3.02 1.6 1.25a7.3 7.3 0 0 0 0 2.3l-1.6 1.25 1.75 3.02 1.9-.8a7.3 7.3 0 0 0 1.98 1.15l.3 2.23h3.5l.3-2.23a7.3 7.3 0 0 0 1.98-1.15l1.9.8 1.75-3.02-1.6-1.25c.07-.37.1-.76.1-1.15Z',
    logout: 'M13 5h6v14h-6M10 16l4-4-4-4M14 12H3',
    clock: 'M12 6v6l4 2',
    history: 'M4 12a8 8 0 1 0 2.35-5.65L4 8.7M4 4v4.7h4.7',
    request: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
    profile: 'M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 20a7 7 0 0 1 14 0',
  };

  const iconAssets: Partial<Record<IconName, string>> = { Dashboard: homeIcon, users: userIcon, lokasi: lokasiIcon, data: folderIcon, settings: settingsIcon, logout: logoutIcon };
  const asset = iconAssets[name];

  if (asset) return <img className={styles.navIconImage} src={asset} alt="" aria-hidden="true" />;

  return <svg className={styles.navIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

const navigationByRole: Record<UserRole, NavigationItem[]> = {
  peserta: [
    { label: 'Dashboard', href: '/peserta/dashboard', icon: 'Dashboard' },
    { label: 'Presensi', href: '/peserta/presensi', icon: 'clock' },
    { label: 'Riwayat', href: '/peserta/riwayat', icon: 'history' },
    { label: 'Izin & koreksi', href: '/peserta/izin', icon: 'request' },
    { label: 'Profil', href: '/peserta/profil', icon: 'profile' },
  ],
  staff_presensi: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'Dashboard' },
    { label: 'Pantau Presensi', href: '/admin/pantau-presensi', icon: 'clock' },
    { label: 'Peserta dan Penempatan', href: '/admin/peserta', icon: 'users' },
    { label: 'Jadwal dan Lokasi', href: '/admin/jadwal-lokasi', icon: 'clock' },
    { label: 'Pengajuan Izin', href: '/admin/izin', icon: 'request' },
    { label: 'Rekap Presensi', href: '/admin/rekap', icon: 'history' },
  ],
  super_admin: [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: 'Dashboard' },
    { label: 'Users', href: '/super-admin/users', icon: 'users' },
    { label: 'Lokasi', href: '/super-admin/lokasi', icon: 'lokasi' },
    { label: 'Kelola data', href: '/super-admin/data-governance', icon: 'data' },
  ],
};

const settingsPaths: Record<UserRole, string> = { peserta: '/peserta/settings', staff_presensi: '/admin/settings', super_admin: '/super-admin/settings' };
const roleLabels: Record<UserRole, string> = { peserta: 'Peserta', staff_presensi: 'Staff Presensi', super_admin: 'Super Admin' };

export default function Sidebar({ currentPath, isOpen, onClose, role }: SidebarProps) {
  const navigationItems = navigationByRole[role];
  const roleLabel = roleLabels[role];
  const linkClass = (active: boolean) => `${styles.navLink} ${active ? styles.navLinkActive : ''}`;

  return (
    <>
      <button className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`} type="button" aria-label="Tutup navigasi" onClick={onClose} />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`} aria-label={`Navigasi ${roleLabel}`}>
        <div className={styles.brand}>
          <div className={styles.brandContent}><img className={styles.brandLogo} src={logoIcon} alt="" aria-hidden="true" /><p className={styles.brandName}>SIGMA</p></div>
          <button className={styles.closeButton} type="button" aria-label="Tutup navigasi" onClick={onClose}>×</button>
        </div>
        <nav className={styles.nav}>
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            return <a className={linkClass(isActive)} href={item.href} key={item.href} aria-current={isActive ? 'page' : undefined} onClick={onClose}><span className={styles.navIcon}><SidebarIcon name={item.icon} /></span><span>{item.label}</span></a>;
          })}
        </nav>
        <div className={styles.note} />
        <div className={styles.accountActions}>
          <a className={`${styles.accountLink} ${currentPath === settingsPaths[role] ? styles.accountLinkActive : ''}`} href={settingsPaths[role]} onClick={onClose}><span className={styles.navIcon}><SidebarIcon name="settings" /></span><span>Settings</span></a>
          <button className={`${styles.accountLink} ${styles.logoutButton}`} type="button" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); clearCachedUser(); window.location.assign('/login'); }}><span className={styles.navIcon}><SidebarIcon name="logout" /></span><span>Keluar</span></button>
        </div>
      </aside>
    </>
  );
}

