import React, { useEffect, useState, useCallback } from 'react';
import { History } from 'lucide-react';
import { academicRecordService } from '../services/academicRecord.service';
import type { StudentAcademicRecord } from '../types/academic.types';
import { ACADEMIC_RECORD_STATUS_LABELS } from '../types/academic.types';

interface StudentAcademicHistorySectionProps {
  studentId: string;
}

export const StudentAcademicHistorySection: React.FC<StudentAcademicHistorySectionProps> = ({
  studentId,
}) => {
  const [records, setRecords] = useState<StudentAcademicRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await academicRecordService.getRecordsByStudentId(studentId);
      setRecords(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat akademik.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-badge-active';
      case 'promoted':
        return 'status-badge-promoted';
      case 'graduated':
        return 'status-badge-graduated';
      case 'retained':
        return 'status-badge-retained';
      default:
        return 'status-badge-inactive';
    }
  };

  return (
    <div className="section-card student-academic-history-card">
      <div className="section-header">
        <div className="title-with-icon">
          <History size={18} className="text-primary" />
          <h3 className="section-title">Riwayat Akademik</h3>
        </div>
      </div>

      <div className="section-content">
        {isLoading ? (
          <div className="table-loading-container py-3">
            <div className="spinner"></div>
            <p>Memuat riwayat akademik siswa...</p>
          </div>
        ) : error ? (
          <div className="feedback-banner error-banner mb-0">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="history-empty-box">
            <p className="history-empty-text">Belum ada catatan riwayat akademik untuk siswa ini.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tahun Ajaran</th>
                  <th>Kelas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const tahun = rec.academic_year?.tahun_ajaran || '-';
                  return (
                    <tr key={rec.id}>
                      <td>
                        <span className="font-semibold text-main">{tahun}</span>
                        {rec.academic_year?.status === 'active' && (
                          <span className="badge-active-indicator"> (Aktif)</span>
                        )}
                      </td>
                      <td>
                        <span className="badge-kelas">Kelas {rec.kelas}</span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(rec.status)}>
                          {ACADEMIC_RECORD_STATUS_LABELS[rec.status] || rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
