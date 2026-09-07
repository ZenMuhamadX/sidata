import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StudentFormData, StudentFormErrors } from '../types/student.types';
import { validateStudentForm } from '../validation/student.validation';

interface StudentFormProps {
  initialData?: StudentFormData;
  isEditing?: boolean;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (formData: StudentFormData) => Promise<void>;
}

const DEFAULT_FORM_DATA: StudentFormData = {
  nama: '',
  jenis_kelamin: 'L',
  nisn: '',
  nik: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  agama: 'Islam',
  alamat: '',
  rt: '',
  rw: '',
  dusun: '',
  kelurahan: '',
  kecamatan: '',
  kode_pos: '',
  jenis_tinggal: '',
  alat_transportasi: '',
  hp: '',
  kelas: 1,
  nomor_registrasi_akta_lahir: '',
  anak_ke: '',
  ket: '',
  status_siswa: 'aktif',
};

export const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  isEditing = false,
  isSubmitting,
  serverError,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentFormData>(initialData || DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<StudentFormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'kelas' ? Number(value) : value,
    }));

    // Clear error inline when field is modified
    if (errors[name as keyof StudentFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStudentForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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

      {/* 1. DATA IDENTITAS */}
      <div className="form-section-card">
        <div className="form-section-header">
          <h3 className="form-section-title">1. Data Identitas</h3>
          <p className="form-section-desc">Informasi pribadi dan kependudukan siswa</p>
        </div>

        <div className="form-grid">
          {/* Nama */}
          <div className="form-group col-span-2">
            <label htmlFor="nama">
              Nama Lengkap <span className="required-star">*</span>
            </label>
            <input
              id="nama"
              name="nama"
              type="text"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: Ahmad Fauzan"
              disabled={isSubmitting}
            />
            {errors.nama && <span className="field-error">{errors.nama}</span>}
          </div>

          {/* Jenis Kelamin */}
          <div className="form-group">
            <label htmlFor="jenis_kelamin">
              Jenis Kelamin <span className="required-star">*</span>
            </label>
            <select
              id="jenis_kelamin"
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
            {errors.jenis_kelamin && <span className="field-error">{errors.jenis_kelamin}</span>}
          </div>

          {/* NIK */}
          <div className="form-group">
            <label htmlFor="nik">
              NIK (16 Digit) <span className="required-star">*</span>
            </label>
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

          {/* NISN */}
          <div className="form-group">
            <label htmlFor="nisn">NISN (Opsional)</label>
            <input
              id="nisn"
              name="nisn"
              type="text"
              value={formData.nisn}
              onChange={handleChange}
              placeholder="00xxxxxxxx"
              disabled={isSubmitting}
            />
            {errors.nisn && <span className="field-error">{errors.nisn}</span>}
          </div>

          {/* Tempat Lahir */}
          <div className="form-group">
            <label htmlFor="tempat_lahir">
              Tempat Lahir <span className="required-star">*</span>
            </label>
            <input
              id="tempat_lahir"
              name="tempat_lahir"
              type="text"
              value={formData.tempat_lahir}
              onChange={handleChange}
              placeholder="Contoh: Bandung"
              disabled={isSubmitting}
            />
            {errors.tempat_lahir && <span className="field-error">{errors.tempat_lahir}</span>}
          </div>

          {/* Tanggal Lahir */}
          <div className="form-group">
            <label htmlFor="tanggal_lahir">
              Tanggal Lahir <span className="required-star">*</span>
            </label>
            <input
              id="tanggal_lahir"
              name="tanggal_lahir"
              type="date"
              value={formData.tanggal_lahir}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.tanggal_lahir && <span className="field-error">{errors.tanggal_lahir}</span>}
          </div>

          {/* Agama */}
          <div className="form-group">
            <label htmlFor="agama">
              Agama <span className="required-star">*</span>
            </label>
            <select
              id="agama"
              name="agama"
              value={formData.agama}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddha">Buddha</option>
              <option value="Konghucu">Konghucu</option>
            </select>
            {errors.agama && <span className="field-error">{errors.agama}</span>}
          </div>
        </div>
      </div>

      {/* 2. DATA ALAMAT */}
      <div className="form-section-card">
        <div className="form-section-header">
          <h3 className="form-section-title">2. Data Alamat</h3>
          <p className="form-section-desc">Domisili tempat tinggal siswa</p>
        </div>

        <div className="form-grid">
          {/* Alamat */}
          <div className="form-group col-span-3">
            <label htmlFor="alamat">
              Alamat Jalan / Tempat Tinggal <span className="required-star">*</span>
            </label>
            <textarea
              id="alamat"
              name="alamat"
              rows={2}
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Contoh: Jl. Sukamaju No. 12"
              disabled={isSubmitting}
            />
            {errors.alamat && <span className="field-error">{errors.alamat}</span>}
          </div>

          {/* RT */}
          <div className="form-group">
            <label htmlFor="rt">RT (Disimpan Teks, e.g. 01)</label>
            <input
              id="rt"
              name="rt"
              type="text"
              value={formData.rt}
              onChange={handleChange}
              placeholder="01"
              disabled={isSubmitting}
            />
          </div>

          {/* RW */}
          <div className="form-group">
            <label htmlFor="rw">RW (Disimpan Teks, e.g. 02)</label>
            <input
              id="rw"
              name="rw"
              type="text"
              value={formData.rw}
              onChange={handleChange}
              placeholder="02"
              disabled={isSubmitting}
            />
          </div>

          {/* Dusun */}
          <div className="form-group">
            <label htmlFor="dusun">Dusun / Kampung</label>
            <input
              id="dusun"
              name="dusun"
              type="text"
              value={formData.dusun}
              onChange={handleChange}
              placeholder="Contoh: Dusun Cempaka"
              disabled={isSubmitting}
            />
          </div>

          {/* Kelurahan */}
          <div className="form-group">
            <label htmlFor="kelurahan">
              Kelurahan / Desa <span className="required-star">*</span>
            </label>
            <input
              id="kelurahan"
              name="kelurahan"
              type="text"
              value={formData.kelurahan}
              onChange={handleChange}
              placeholder="Contoh: Sukajaya"
              disabled={isSubmitting}
            />
            {errors.kelurahan && <span className="field-error">{errors.kelurahan}</span>}
          </div>

          {/* Kecamatan */}
          <div className="form-group">
            <label htmlFor="kecamatan">
              Kecamatan <span className="required-star">*</span>
            </label>
            <input
              id="kecamatan"
              name="kecamatan"
              type="text"
              value={formData.kecamatan}
              onChange={handleChange}
              placeholder="Contoh: Cibinong"
              disabled={isSubmitting}
            />
            {errors.kecamatan && <span className="field-error">{errors.kecamatan}</span>}
          </div>

          {/* Kode Pos */}
          <div className="form-group">
            <label htmlFor="kode_pos">Kode Pos</label>
            <input
              id="kode_pos"
              name="kode_pos"
              type="text"
              value={formData.kode_pos}
              onChange={handleChange}
              placeholder="16911"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* 3. DATA SEKOLAH & INFORMASI TAMBAHAN */}
      <div className="form-section-card">
        <div className="form-section-header">
          <h3 className="form-section-title">3. Data Sekolah & Informasi Tambahan</h3>
          <p className="form-section-desc">Penempatan kelas dan profil pelengkap siswa</p>
        </div>

        <div className="form-grid">
          {/* Kelas */}
          <div className="form-group">
            <label htmlFor="kelas">
              Kelas <span className="required-star">*</span>
            </label>
            <select
              id="kelas"
              name="kelas"
              value={formData.kelas}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value={1}>Kelas 1</option>
              <option value={2}>Kelas 2</option>
              <option value={3}>Kelas 3</option>
              <option value={4}>Kelas 4</option>
              <option value={5}>Kelas 5</option>
              <option value={6}>Kelas 6</option>
            </select>
            {errors.kelas && <span className="field-error">{errors.kelas}</span>}
          </div>

          {/* Status Siswa */}
          <div className="form-group">
            <label htmlFor="status_siswa">
              Status Siswa <span className="required-star">*</span>
            </label>
            <select
              id="status_siswa"
              name="status_siswa"
              value={formData.status_siswa}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="aktif">Aktif</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>
            {errors.status_siswa && <span className="field-error">{errors.status_siswa}</span>}
          </div>

          {/* Nomor Registrasi Akta Lahir */}
          <div className="form-group">
            <label htmlFor="nomor_registrasi_akta_lahir">
              No Registrasi Akta Lahir (Format Bebas)
            </label>
            <input
              id="nomor_registrasi_akta_lahir"
              name="nomor_registrasi_akta_lahir"
              type="text"
              value={formData.nomor_registrasi_akta_lahir}
              onChange={handleChange}
              placeholder="3309-LT-09072020-0044"
              disabled={isSubmitting}
            />
          </div>

          {/* Anak Ke */}
          <div className="form-group">
            <label htmlFor="anak_ke">Anak Ke- (Bilangan Bulat)</label>
            <input
              id="anak_ke"
              name="anak_ke"
              type="number"
              min={1}
              value={formData.anak_ke}
              onChange={handleChange}
              placeholder="1"
              disabled={isSubmitting}
            />
            {errors.anak_ke && <span className="field-error">{errors.anak_ke}</span>}
          </div>

          {/* HP */}
          <div className="form-group">
            <label htmlFor="hp">Nomor HP</label>
            <input
              id="hp"
              name="hp"
              type="text"
              value={formData.hp}
              onChange={handleChange}
              placeholder="0812xxxxxxxx"
              disabled={isSubmitting}
            />
          </div>

          {/* Jenis Tinggal */}
          <div className="form-group">
            <label htmlFor="jenis_tinggal">Jenis Tinggal</label>
            <input
              id="jenis_tinggal"
              name="jenis_tinggal"
              type="text"
              value={formData.jenis_tinggal}
              onChange={handleChange}
              placeholder="Contoh: Bersama orang tua / Asrama"
              disabled={isSubmitting}
            />
          </div>

          {/* Alat Transportasi */}
          <div className="form-group">
            <label htmlFor="alat_transportasi">Alat Transportasi</label>
            <input
              id="alat_transportasi"
              name="alat_transportasi"
              type="text"
              value={formData.alat_transportasi}
              onChange={handleChange}
              placeholder="Contoh: Jalan kaki / Sepeda motor"
              disabled={isSubmitting}
            />
          </div>

          {/* Keterangan */}
          <div className="form-group col-span-3">
            <label htmlFor="ket">Keterangan Tambahan</label>
            <textarea
              id="ket"
              name="ket"
              rows={2}
              value={formData.ket}
              onChange={handleChange}
              placeholder="Catatan administratif siswa..."
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Form Action Footer */}
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
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Siswa'}
        </button>
      </div>
    </form>
  );
};
