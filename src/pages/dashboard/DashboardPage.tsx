import React, { useEffect, useState } from 'react';
import { studentService } from '../../features/students/services/student.service';
import type { DashboardStats } from '../../features/students/types/student.types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentService.getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat statistik siswa.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Ringkasan data siswa (Sumber data: assyifa.students)</p>
      </div>

      {error && (
        <div className="error-state-card">
          <div className="error-state-content">
            <AlertCircle size={20} className="text-danger" />
            <div>
              <p className="error-state-title">Gagal memuat statistik dashboard.</p>
              <p className="error-state-desc">{error}</p>
            </div>
          </div>
          <button type="button" onClick={loadStats} className="btn-secondary">
            <RefreshCw size={14} />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Siswa</span>
          <span className="stat-value">{isLoading ? '...' : (stats?.total ?? 0)}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Siswa Aktif</span>
          <span className="stat-value">{isLoading ? '...' : (stats?.aktif ?? 0)}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Siswa Tidak Aktif</span>
          <span className="stat-value">{isLoading ? '...' : (stats?.tidakAktif ?? 0)}</span>
        </div>
      </div>

      {/* Breakdown per Kelas */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Jumlah Siswa per Kelas</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kelas</th>
                <th className="text-right">Jumlah Siswa</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map((kelas) => {
                const count = stats?.perKelas[kelas] ?? 0;
                return (
                  <tr key={kelas}>
                    <td>Kelas {kelas}</td>
                    <td className="text-right font-semibold">
                      {isLoading ? '...' : count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
