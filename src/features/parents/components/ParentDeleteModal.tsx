import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { ParentWithStudent } from '../types/parent.types';

interface ParentDeleteModalProps {
  parent: ParentWithStudent | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ParentDeleteModal: React.FC<ParentDeleteModalProps> = ({
  parent,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !parent) return null;

  const relationshipLabel = parent.hubungan === 'ayah' ? 'ayah' : 'ibu';
  const studentName = parent.students?.nama || 'siswa terkait';

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="parent-modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <AlertTriangle className="modal-danger-icon" size={20} />
            <h3 id="parent-modal-title">Hapus Data Orang Tua</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isDeleting} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>
            Apakah Anda yakin ingin menghapus data <strong>{relationshipLabel}</strong> dari <strong>{studentName}</strong>
            {parent.nama ? ` (${parent.nama})` : ''}?
          </p>
          <div className="danger-notice">
            Catatan: Hanya data {relationshipLabel} yang akan dihapus. Data profil siswa dan administrasi sekolah tetap aman dan <strong>tidak terhapus</strong>.
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
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};
