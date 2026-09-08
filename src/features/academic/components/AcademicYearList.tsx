import React from 'react';
import { Check, CheckCircle2, Trash2 } from 'lucide-react';
import type { AcademicYearWithCount, AcademicYear } from '../types/academic.types';
import { ACADEMIC_YEAR_STATUS_LABELS } from '../types/academic.types';

interface AcademicYearListProps {
  academicYears: AcademicYearWithCount[];
  isLoading: boolean;
  onActivate: (item: AcademicYear) => void;
  onComplete: (item: AcademicYear) => void;
  onDelete: (item: AcademicYear) => void;
}

export const AcademicYearList: React.FC<AcademicYearListProps> = ({
  academicYears,
  isLoading,
  onActivate,
  onComplete,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="table-loading-container">
        <div className="spinner"></div>
        <p>Memuat daftar tahun ajaran...</p>
      </div>
    );
  }

  if (academicYears.length === 0) {
    return (
      <div className="empty-state-card">
        <p className="empty-state-title">Belum Ada Data Tahun Ajaran</p>
        <p className="empty-state-desc">
          Silakan tambahkan tahun ajaran baru untuk memulai pencatatan riwayat akademik.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tahun Ajaran</th>
            <th>Status</th>
            <th>Jumlah Siswa</th>
            <th className="th-actions">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {academicYears.map((ay) => {
            const isActive = ay.status === 'active';
            return (
              <tr key={ay.id} className={isActive ? 'table-row-highlight' : ''}>
                <td>
                  <span className="font-semibold text-main">{ay.tahun_ajaran}</span>
                  {isActive && (
                    <span className="badge-active-indicator">
                      (Sedang Berjalan)
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={
                      isActive ? 'status-badge-active' : 'status-badge-inactive'
                    }
                  >
                    {ACADEMIC_YEAR_STATUS_LABELS[ay.status] || ay.status}
                  </span>
                </td>
                <td>
                  <span className="text-secondary">
                    {ay.student_count} siswa
                  </span>
                </td>
                <td className="td-actions">
                  <div className="action-button-group">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => onActivate(ay)}
                        className="btn-secondary btn-sm"
                        title="Jadikan Tahun Ajaran Aktif"
                      >
                        <Check size={14} />
                        <span>Jadikan Aktif</span>
                      </button>
                    )}

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => onComplete(ay)}
                        className="btn-secondary btn-sm text-secondary"
                        title="Selesaikan Tahun Ajaran Ini"
                      >
                        <CheckCircle2 size={14} />
                        <span>Selesaikan</span>
                      </button>
                    )}

                    {ay.student_count === 0 && (
                      <button
                        type="button"
                        onClick={() => onDelete(ay)}
                        className="btn-icon btn-icon-danger"
                        title="Hapus tahun ajaran"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
