import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ParentFormData, ParentFormErrors } from '../types/parent.types';
import { validateParentForm } from '../validation/parent.validation';
import { StudentSearchSelector } from './StudentSearchSelector';

interface ParentFormProps {
  initialData?: ParentFormData;
  isEditing?: boolean;
  lockStudent?: boolean;
  preloadedStudent?: { id: string; nama: string; kelas: number } | null;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (formData: ParentFormData) => Promise<void>;
}

const DEFAULT_PARENT_FORM: ParentFormData = {
  student_id: '',
  hubungan: 'ayah',
  nama: '',
  nik: '',
  tahun_lahir: '',
  jenjang_pendidikan: '',
  pekerjaan: '',
  penghasilan: '',
};

export const ParentForm: React.FC<ParentFormProps> = ({
  initialData,
  isEditing = false,
  lockStudent = false,
  preloadedStudent = null,
  isSubmitting,
  serverError,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ParentFormData>(initialData || DEFAULT_PARENT_FORM);
  const [errors, setErrors] = useState<ParentFormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ParentFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStudentSelect = (student: { id: string; nama: string; kelas: number } | null) => {
    setFormData((prev) => ({
      ...prev,
      student_id: student ? student.id : '',
    }));
    if (errors.student_id) {
      setErrors((prev) => ({ ...prev, student_id: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateParentForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="student-form" noValidate>
      {serverError && (
        <div className="error-alert" role="alert">
          {serverError}
        </div>
      )}

      {/* Relasi Siswa & Hubungan */}
      <div className="form-section-card">
        <div className="form-section-header">
          <h3 className="form-section-title">1. Relasi Siswa & Hubungan</h3>
          <p className="form-section-desc">Kaitkan data orang tua dengan siswa yang terdaftar di sekolah</p>
        </div>

        <div className="form-grid">
          {/* Student Selector */}
          <div className="form-group col-span-2">
            <label>
              Siswa Terkait <span className="required-star">*</span>
            </label>
            <StudentSearchSelector
              selectedStudentId={formData.student_id}
              preloadedStudent={preloadedStudent}
              disabled={isSubmitting || lockStudent}
              onSelect={handleStudentSelect}
            />
            {errors.student_id && <span className="field-error">{errors.student_id}</span>}
          </div>

          {/* Hubungan */}
          <div className="form-group">
            <label htmlFor="hubungan">
              Hubungan <span className="required-star">*</span>
            </label>
            <select
              id="hubungan"
              name="hubungan"
              value={formData.hubungan}
              onChange={handleChange}
              disabled={isSubmitting || isEditing}
            >
              <option value="ayah">Ayah</option>
              <option value="ibu">Ibu</option>
            </select>
            {errors.hubungan && <span className="field-error">{errors.hubungan}</span>}
            {isEditing && (
              <span className="field-help-text">Hubungan (ayah/ibu) tidak dapat diubah saat edit.</span>
            )}
          </div>
        </div>
      </div>

      {/* Data Identitas & Pekerjaan */}
      <div className="form-section-card">
        <div className="form-section-header">
          <h3 className="form-section-title">2. Data Pribadi & Pekerjaan Orang Tua</h3>
          <p className="form-section-desc">Informasi opsional profil orang tua siswa</p>
        </div>

        <div className="form-grid">
          {/* Nama */}
          <div className="form-group col-span-2">
            <label htmlFor="nama">Nama Lengkap (Opsional)</label>
            <input
              id="nama"
              name="nama"
              type="text"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Nama lengkap ayah/ibu"
              disabled={isSubmitting}
            />
            {errors.nama && <span className="field-error">{errors.nama}</span>}
          </div>

          {/* NIK */}
          <div className="form-group">
            <label htmlFor="nik">NIK (16 Digit, Opsional)</label>
            <input
              id="nik"
              name="nik"
              type="text"
              maxLength={16}
              value={formData.nik}
              onChange={handleChange}
              placeholder="3201xxxxxxxxxxxx"
              disabled={isSubmitting}
            />
            {errors.nik && <span className="field-error">{errors.nik}</span>}
          </div>

          {/* Tahun Lahir */}
          <div className="form-group">
            <label htmlFor="tahun_lahir">Tahun Lahir (Contoh: 1980)</label>
            <input
              id="tahun_lahir"
              name="tahun_lahir"
              type="number"
              min={1920}
              max={new Date().getFullYear()}
              value={formData.tahun_lahir}
              onChange={handleChange}
              placeholder="1980"
              disabled={isSubmitting}
            />
            {errors.tahun_lahir && <span className="field-error">{errors.tahun_lahir}</span>}
          </div>

          {/* Jenjang Pendidikan */}
          <div className="form-group">
            <label htmlFor="jenjang_pendidikan">Jenjang Pendidikan</label>
            <input
              id="jenjang_pendidikan"
              name="jenjang_pendidikan"
              type="text"
              value={formData.jenjang_pendidikan}
              onChange={handleChange}
              placeholder="Contoh: SMA / S1"
              disabled={isSubmitting}
            />
          </div>

          {/* Pekerjaan */}
          <div className="form-group">
            <label htmlFor="pekerjaan">Pekerjaan</label>
            <input
              id="pekerjaan"
              name="pekerjaan"
              type="text"
              value={formData.pekerjaan}
              onChange={handleChange}
              placeholder="Contoh: Wiraswasta / PNS"
              disabled={isSubmitting}
            />
          </div>

          {/* Penghasilan */}
          <div className="form-group col-span-3">
            <label htmlFor="penghasilan">Penghasilan (Input Bebas / Manual)</label>
            <input
              id="penghasilan"
              name="penghasilan"
              type="text"
              value={formData.penghasilan}
              onChange={handleChange}
              placeholder="Contoh: Rp3.500.000 / Tidak berpenghasilan"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="form-actions-footer">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Batal
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Orang Tua'}
        </button>
      </div>
    </form>
  );
};
