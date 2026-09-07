import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Ringkasan data siswa</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Siswa</span>
          <span className="stat-value">-</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Siswa Aktif</span>
          <span className="stat-value">-</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Siswa Tidak Aktif</span>
          <span className="stat-value">-</span>
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
              {[1, 2, 3, 4, 5, 6].map((kelas) => (
                <tr key={kelas}>
                  <td>Kelas {kelas}</td>
                  <td className="text-right text-muted">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
