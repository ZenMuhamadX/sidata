import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { PromotionCandidateStudent, PromotionDecision } from '../types/promotion.types';

interface PromotionStudentTableProps {
  students: PromotionCandidateStudent[];
  isLoading: boolean;
  kelasFrom: number;
  onDecisionChange: (studentId: string, decision: PromotionDecision) => void;
  onMassAction: (decision: PromotionDecision) => void;
}

export const PromotionStudentTable: React.FC<PromotionStudentTableProps> = ({
  students,
  isLoading,
  kelasFrom,
  onDecisionChange,
  onMassAction,
}) => {
  if (isLoading) {
    return (
      <div className="table-loading-container">
        <div className="spinner"></div>
        <p>Memuat siswa yang memenuhi syarat...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="table-empty-container">
        <p className="empty-title">Tidak ada siswa aktif ditemukan.</p>
        <p className="empty-desc">
          Pastikan siswa memiliki catatan akademik aktif di kelas dan tahun ajaran asal yang dipilih.
        </p>
      </div>
    );
  }

  const promotedCount = students.filter((s) => s.decision === 'promoted').length;
  const retainedCount = students.filter((s) => s.decision === 'retained').length;
  const hasDuplicates = students.some((s) => s.has_target_record);

  return (
    <div>
      {/* Mass Actions & Stats Bar */}
      <div className="promotion-table-toolbar">
        <div className="promotion-stats-group">
          <span className="promotion-stat-item">
            Total Siswa: <strong>{students.length}</strong>
          </span>
          <span className="promotion-stat-item promotion-stat-success">
            Naik: <strong>{promotedCount}</strong>
          </span>
          <span className="promotion-stat-item promotion-stat-warning">
            Tinggal: <strong>{retainedCount}</strong>
          </span>
        </div>

        <div className="promotion-actions-group">
          <span className="filter-label">Atur Semua:</span>
          <button
            type="button"
            onClick={() => onMassAction('promoted')}
            className="btn-secondary btn-sm"
          >
            <CheckCircle2 size={14} className="text-success" />
            <span>Semua Naik</span>
          </button>
          <button
            type="button"
            onClick={() => onMassAction('retained')}
            className="btn-secondary btn-sm"
          >
            <XCircle size={14} className="text-warning" />
            <span>Semua Tinggal</span>
          </button>
        </div>
      </div>

      {hasDuplicates && (
        <div className="promotion-callout-warning">
          <div className="promotion-callout-header">
            <AlertTriangle size={16} />
            <span>Peringatan: Terdapat Siswa yang Sudah Terdaftar di Tahun Tujuan</span>
          </div>
          <p className="promotion-callout-desc">
            Beberapa siswa yang ditandai dengan peringatan sudah memiliki catatan akademik di tahun tujuan. Eksekusi batch akan ditolak database jika siswa tersebut tetap diproses.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>No</th>
              <th>Nama Siswa</th>
              <th>NIK</th>
              <th>NISN</th>
              <th>Kelas Asal</th>
              <th>Status Target</th>
              <th className="th-actions text-center">Keputusan</th>
            </tr>
          </thead>
          <tbody>
            {students.map((item, index) => {
              const student = item.student;
              const isPromoted = item.decision === 'promoted';

              return (
                <tr key={item.student_id} className={item.has_target_record ? 'row-has-target-record' : ''}>
                  <td className="text-secondary text-sm">{index + 1}</td>
                  <td>
                    <div className="student-name-cell">
                      <span className="font-semibold text-main">{student.nama}</span>
                      <span className="student-subtext">
                        {student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{student.nik}</td>
                  <td className="font-mono text-sm">{student.nisn || '-'}</td>
                  <td>
                    <span className="badge-kelas">Kelas {kelasFrom}</span>
                  </td>
                  <td>
                    {isPromoted ? (
                      <span className="status-badge-promoted">
                        Naik ke Kelas {kelasFrom + 1}
                      </span>
                    ) : (
                      <span className="status-badge-retained">
                        Tetap di Kelas {kelasFrom}
                      </span>
                    )}
                    {item.has_target_record && (
                      <span className="badge-destructive text-xs ml-2" title="Sudah memiliki record di tahun tujuan">
                        Terdaftar di Tujuan
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="decision-btn-group">
                      <button
                        type="button"
                        onClick={() => onDecisionChange(item.student_id, 'promoted')}
                        className={`decision-btn ${isPromoted ? 'active-promote' : ''}`}
                      >
                        Naik
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecisionChange(item.student_id, 'retained')}
                        className={`decision-btn ${!isPromoted ? 'active-retain' : ''}`}
                      >
                        Tinggal
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
