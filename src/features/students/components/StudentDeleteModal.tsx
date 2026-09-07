import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Student } from '../types/student.types';

interface StudentDeleteModalProps {
  student: Student | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const StudentDeleteModal: React.FC<StudentDeleteModalProps> = ({
  student,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <AlertTriangle className="modal-danger-icon" size={20} />
            <h3 id="modal-title">Konfirmasi Hapus Permanen</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isDeleting} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>
            Apakah Anda yakin ingin menghapus data siswa <strong>{student.nama}</strong> (NIK: {student.nik})?
          </p>
          <div className="danger-notice">
            Tindakan ini bersifat destruktif. Data siswa akan dihapus secara <strong>permanen</strong> dari database dan tidak dapat dipulihkan kembali.
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn-destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus Permanen'}
          </button>
        </div>
      </div>
    </div>
  );
};
