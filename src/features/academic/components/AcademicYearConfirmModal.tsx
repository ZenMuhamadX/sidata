import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { AcademicYear } from '../types/academic.types';

interface AcademicYearConfirmModalProps {
  isOpen: boolean;
  type: 'activate' | 'complete' | 'delete' | null;
  academicYear: AcademicYear | null;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const AcademicYearConfirmModal: React.FC<AcademicYearConfirmModalProps> = ({
  isOpen,
  type,
  academicYear,
  isProcessing,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !academicYear || !type) return null;

  const config = {
    activate: {
      title: 'Jadikan Tahun Ajaran Aktif',
      desc: `Apakah Anda yakin ingin mengaktifkan tahun ajaran ${academicYear.tahun_ajaran}? Tahun ajaran yang saat ini aktif akan otomatis diselesaikan (completed).`,
      btnText: 'Ya, Aktifkan',
      btnClass: 'btn-primary',
    },
    complete: {
      title: 'Selesaikan Tahun Ajaran',
      desc: `Apakah Anda yakin ingin menyelesaikan (menutup) tahun ajaran ${academicYear.tahun_ajaran}?`,
      btnText: 'Ya, Selesaikan',
      btnClass: 'btn-secondary',
    },
    delete: {
      title: 'Hapus Tahun Ajaran',
      desc: `Apakah Anda yakin ingin menghapus tahun ajaran ${academicYear.tahun_ajaran}? Aksi ini hanya dapat dilakukan jika belum ada riwayat siswa.`,
      btnText: 'Ya, Hapus',
      btnClass: 'btn-destructive',
    },
  }[type];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <AlertTriangle size={18} className="modal-danger-icon" />
            <h3 className="modal-title">{config.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>{config.desc}</p>
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
            className={config.btnClass}
            disabled={isProcessing}
          >
            {isProcessing ? 'Memproses...' : config.btnText}
          </button>
        </div>
      </div>
    </div>
  );
};
