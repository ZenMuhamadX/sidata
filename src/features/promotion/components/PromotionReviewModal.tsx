import React from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import type { AcademicYear } from '../../academic/types/academic.types';
import type { PromotionCandidateStudent } from '../types/promotion.types';

interface PromotionReviewModalProps {
  isOpen: boolean;
  yearFrom: AcademicYear;
  yearTo: AcademicYear;
  kelasFrom: number;
  students: PromotionCandidateStudent[];
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const PromotionReviewModal: React.FC<PromotionReviewModalProps> = ({
  isOpen,
  yearFrom,
  yearTo,
  kelasFrom,
  students,
  isProcessing,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const total = students.length;
  const promotedCount = students.filter((s) => s.decision === 'promoted').length;
  const retainedCount = students.filter((s) => s.decision === 'retained').length;
  const kelasTo = kelasFrom + 1;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <AlertTriangle size={18} className="text-warning" />
            <h3 className="modal-title">Konfirmasi Kenaikan Kelas</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            disabled={isProcessing}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-sm">
            Kenaikan kelas akan membuat histori akademik baru untuk tahun ajaran tujuan dan mengubah status histori tahun ajaran asal. Pastikan keputusan siswa sudah benar.
          </p>

          <div className="promotion-summary-box">
            <div className="detail-dl">
              <div className="detail-row">
                <span className="detail-label">Tahun Ajaran Asal</span>
                <span className="detail-val font-medium">{yearFrom.tahun_ajaran}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tahun Ajaran Tujuan</span>
                <span className="detail-val font-medium">{yearTo.tahun_ajaran}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Perubahan Kelas</span>
                <span className="detail-val font-medium">
                  Kelas {kelasFrom} <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} /> Kelas {kelasTo}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Siswa Diproses</span>
                <span className="detail-val font-semibold">{total} siswa</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Jumlah Naik Kelas</span>
                <span className="detail-val text-success font-semibold">{promotedCount} siswa</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Jumlah Tinggal Kelas</span>
                <span className="detail-val text-warning font-semibold">{retainedCount} siswa</span>
              </div>
            </div>
          </div>

          <div className="danger-notice">
            Operasi ini akan dieksekusi secara <strong>atomik</strong>. Jika terjadi kegagalan atau benturan data duplikat pada salah satu siswa, seluruh proses akan dibatalkan secara otomatis tanpa merusak data yang sudah ada.
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isProcessing}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary"
            disabled={isProcessing}
          >
            {isProcessing ? 'Memproses Batch...' : 'Ya, Jalankan Kenaikan Kelas'}
          </button>
        </div>
      </div>
    </div>
  );
};
