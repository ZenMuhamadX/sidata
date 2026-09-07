import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/siswa': 'Data Siswa',
  '/orang-tua': 'Orang Tua',
  '/dokumen': 'Dokumen',
  '/import': 'Import Data',
  '/export': 'Export Data',
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Manajemen Siswa';

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Error tercatat di service & logger
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Buka navigasi"
        >
          <Menu size={20} />
        </button>
        <h1 className="header-page-title">{currentTitle}</h1>
      </div>

      <div className="header-right">
        <div className="header-user-info">
          <span className="header-user-email" title={user?.email || ''}>
            {user?.email}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary header-logout-btn"
          title="Keluar dari sesi"
        >
          <LogOut size={15} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};
