import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { AcademicYearFormData } from '../types/academic.types';
import { validateAcademicYearForm } from '../validation/academic.validation';

interface AcademicYearModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (formData: AcademicYearFormData) => Promise<void>;
}

export const AcademicYearModal: React.FC<AcademicYearModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<AcademicYearFormData>({
    tahun_ajaran: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AcademicYearFormData, string>>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AcademicYearFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAcademicYearForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ tahun_ajaran: '', status: 'active' });
      setErrors({});
    } catch {
      // Error handled by parent component toast/feedback
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-title">Tambah Tahun Ajaran Baru</h3>
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="tahun_ajaran">
                Tahun Ajaran <span className="required-star">*</span>
              </label>
              <input
                id="tahun_ajaran"
                name="tahun_ajaran"
                type="text"
                placeholder="Contoh: 2026/2027"
                value={formData.tahun_ajaran}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.tahun_ajaran ? (
                <span className="field-error">{errors.tahun_ajaran}</span>
              ) : (
                <span className="form-hint">Format harus YYYY/YYYY (contoh: 2026/2027)</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status">
                Status Awal
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="active">Aktif</option>
                <option value="completed">Selesai</option>
              </select>
              <span className="form-hint">
                {formData.status === 'active'
                  ? 'Jika diset Aktif, tahun ajaran aktif sebelumnya otomatis diselesaikan.'
                  : 'Tahun ajaran baru akan disimpan dengan status Selesai.'}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Tahun Ajaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
