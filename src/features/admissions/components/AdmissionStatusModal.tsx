import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { StudentAdmissionWithRelations, AdmissionStatus } from '../types/admission.types';

interface AdmissionStatusModalProps {
  isOpen: boolean;
  admission: StudentAdmissionWithRelations | null;
  isUpdating: boolean;
  onClose: () => void;
  onSubmit: (status: AdmissionStatus) => Promise<void>;
}

export const AdmissionStatusModal: React.FC<AdmissionStatusModalProps> = ({
  isOpen,
  admission,
  isUpdating,
  onClose,
  onSubmit,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AdmissionStatus>(
    admission?.status || 'candidate'
  );

  if (!isOpen || !admission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === admission.status) {
      onClose();
      return;
    }
    await onSubmit(selectedStatus);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <CheckCircle2 size={18} className="text-primary" />
            <h3 className="modal-title">Ubah Status Calon Siswa</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            disabled={isUpdating}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>
              Siswa: <strong>{admission.student.nama}</strong> ({admission.academic_year.tahun_ajaran})
            </p>

            <div className="form-group">
              <label htmlFor="admission-status">Pilih Status Baru</label>
              <select
                id="admission-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AdmissionStatus)}
                disabled={isUpdating}
              >
                <option value="candidate">Calon (Candidate)</option>
                <option value="accepted">Diterima (Accepted)</option>
                <option value="rejected">Ditolak (Rejected)</option>
                <option value="cancelled">Dibatalkan (Cancelled)</option>
              </select>
              <span className="form-hint">
                Catatan: Mengubah status menjadi "Diterima" belum mendaftarkan siswa secara resmi.
                Pendaftaran resmi dilakukan setelah status diterima melalui tombol "Daftarkan".
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isUpdating}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Menyimpan...' : 'Simpan Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
