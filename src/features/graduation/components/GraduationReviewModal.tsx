import React from 'react';
import { AlertTriangle, GraduationCap, X } from 'lucide-react';
import type { AcademicYear } from '../../academic/types/academic.types';

interface GraduationReviewModalProps {
  isOpen: boolean;
  academicYear: AcademicYear | null;
  selectedCount: number;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const GraduationReviewModal: React.FC<GraduationReviewModalProps> = ({
  isOpen,
  academicYear,
  selectedCount,
  isProcessing,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !academicYear) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <GraduationCap size={20} className="text-primary" />
            <h3 className="modal-title">Konfirmasi Kelulusan Siswa</h3>
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
            Anda akan memproses kelulusan resmi untuk siswa SD Kelas 6 yang telah menyelesaikan studinya pada periode tahun ajaran ini.
          </p>

          <div className="promotion-summary-box">
            <div className="detail-dl">
              <div className="detail-row">
                <span className="detail-label">Tahun Ajaran</span>
                <span className="detail-val font-semibold">{academicYear.tahun_ajaran}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tingkat Kelas</span>
                <span className="detail-val font-medium">Kelas 6 (Tingkat Akhir SD)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Jumlah Siswa Diluluskan</span>
                <span className="detail-val text-primary font-bold">{selectedCount} siswa</span>
              </div>
            </div>
          </div>

          <div className="callout-warning mb-3">
            <div className="flex items-center gap-2 font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <AlertTriangle size={16} />
              <span>Dampak Perubahan Status:</span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', margin: 0 }}>
              <li>Status riwayat akademik siswa berubah menjadi <strong>Lulus (Graduated)</strong>.</li>
              <li>Status siswa pada data induk berubah menjadi <strong>Tidak Aktif (Inactive)</strong>.</li>
              <li><strong>Tidak ada Kelas 7</strong> yang dibuat (kelulusan jenjang SD bersifat final).</li>
              <li>Riwayat akademik seluruh jenjang sebelumnya tetap tersimpan utuh dan dapat dilihat kapan saja.</li>
            </ul>
          </div>

          <div className="danger-notice">
            Operasi ini dieksekusi secara <strong>atomik</strong>. Jika terjadi kegagalan validasi pada salah satu siswa, seluruh transaksi dibatalkan tanpa mengubah data.
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
            {isProcessing ? 'Memproses Kelulusan...' : 'Ya, Luluskan Siswa'}
          </button>
        </div>
      </div>
    </div>
  );
};
