import React from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Error sudah ditangani di level service & logger
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div>
          <h1>Portal Manajemen Siswa</h1>
          <span className="badge-schema">Schema: assyifa</span>
        </div>
        <div className="user-nav">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Keluar (Logout)
          </button>
        </div>
      </header>

      <main className="home-content">
        <div className="status-card">
          <h2>Fondasi Sistem (Stage 2) Siap</h2>
          <p>
            Autentikasi Supabase, session management, schema <code>assyifa</code>, dan centralized logger telah terpasang dengan sukses.
          </p>
          <ul className="checklist">
            <li>✓ React + Vite + TypeScript terkoneksi</li>
            <li>✓ Schema Database: <code>assyifa</code></li>
            <li>✓ Auth Provider & Protected Route aktif</li>
            <li>✓ Logger terpusat dengan sanitasi data sensitif</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
