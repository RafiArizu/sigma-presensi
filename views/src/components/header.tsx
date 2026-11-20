import { useEffect, useState } from 'react';
import type { UserRole } from './sidebar';

type HeaderProps = {
  userName: string;
  role: UserRole;
  onMenuToggle: () => void;
};

const roleLabels: Record<UserRole, string> = {
  peserta: 'Peserta',
  staff_presensi: 'Staff Presensi',
  super_admin: 'Super Admin',
};



export default function Header({ userName, role, onMenuToggle }: HeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const dateLabel = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  return (
    <header className="dashboard-header">
      <div className="header-leading">
        <button className="menu-button" type="button" aria-label="Buka navigasi" onClick={onMenuToggle}>
          <span />
          <span />
          <span />
        </button>
        <p className="header-date-live">{dateLabel}</p>
      </div>

      <div className="header-account">
        <button className="header-notification" type="button" aria-label="Notifikasi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg></button>
        <span className="header-divider" aria-hidden="true" />
        <span className="account-avatar" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H5Z" /></svg></span>
        <div className="account-copy">
          <span className="account-name">{userName}</span>
          <span className="account-role">{roleLabels[role]}</span>
        </div>
      </div>
    </header>
  );
}
