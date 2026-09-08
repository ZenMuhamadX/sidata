import React from 'react';
import { UserCheck, X } from 'lucide-react';
import type { StudentAdmissionWithRelations } from '../types/admission.types';

interface AdmissionEnrollModalProps {
  isOpen: boolean;
  admission: StudentAdmissionWithRelations | null;
  isEnrolling: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const AdmissionEnrollModal: React.FC<AdmissionEnrollModalProps> = ({
  isOpen,
  admission,
  isEnrolling,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !admission) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <UserCheck size={18} className="text-primary" />
            <h3 className="modal-title">Daftarkan sebagai Siswa Resmi</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            disabled={isEnrolling}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>
            Apakah Anda yakin ingin mendaftarkan calon siswa <strong>{admission.student.nama}</strong> secara resmi ke <strong>Kelas 1</strong> pada tahun ajaran <strong>{admission.academic_year.tahun_ajaran}</strong>?
          </p>

          <div className="callout-warning">
            <p className="text-sm">
              Proses ini akan:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', fontSize: '0.8125rem' }}>
              <li>Mengubah status pendaftaran menjadi <strong>Terdaftar (Enrolled)</strong>.</li>
              <li>Mengaktifkan status siswa di sekolah.</li>
              <li>Mencatat histori akademik Kelas 1 pada tahun ajaran {admission.academic_year.tahun_ajaran}.</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isEnrolling}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary"
            disabled={isEnrolling}
          >
            {isEnrolling ? 'Mendaftarkan...' : 'Ya, Daftarkan Resmi'}
          </button>
        </div>
      </div>
    </div>
  );
};
