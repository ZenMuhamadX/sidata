import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Upload,
  Download,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Error tercatat di service & logger
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item ${isActive ? 'nav-item-active' : ''}`;

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-title">Portal Manajemen Siswa</span>
            <span className="brand-badge">Admin</span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Tutup navigasi"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Menu Utama">
          <div className="nav-section">
            <NavLink to="/dashboard" className={navItemClass} onClick={onClose}>
              <LayoutDashboard size={18} className="nav-icon" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/siswa" className={navItemClass} onClick={onClose}>
              <Users size={18} className="nav-icon" />
              <span>Data Siswa</span>
            </NavLink>
            <NavLink to="/orang-tua" className={navItemClass} onClick={onClose}>
              <UserCheck size={18} className="nav-icon" />
              <span>Orang Tua</span>
            </NavLink>
            <NavLink to="/dokumen" className={navItemClass} onClick={onClose}>
              <FileText size={18} className="nav-icon" />
              <span>Dokumen</span>
            </NavLink>
          </div>

          <div className="nav-divider" />

          <div className="nav-section">
            <NavLink to="/import" className={navItemClass} onClick={onClose}>
              <Upload size={18} className="nav-icon" />
              <span>Import Data</span>
            </NavLink>
            <NavLink to="/export" className={navItemClass} onClick={onClose}>
              <Download size={18} className="nav-icon" />
              <span>Export Data</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <span className="user-role-label">Masuk sebagai</span>
            <span className="user-email-text" title={user?.email || 'admin'}>
              {user?.email || 'Administrator'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title="Keluar dari sistem"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
