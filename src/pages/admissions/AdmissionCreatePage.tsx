import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { admissionService } from '../../features/admissions/services/admission.service';
import { academicYearService } from '../../features/academic/services/academicYear.service';
import { validateAdmissionForm } from '../../features/admissions/validation/admission.validation';
import type { AdmissionCreateFormData } from '../../features/admissions/types/admission.types';
import type { AcademicYear } from '../../features/academic/types/academic.types';

const INITIAL_DATA: AdmissionCreateFormData = {
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
  status_siswa: 'tidak_aktif',
  academic_year_id: '',
};

export const AdmissionCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AdmissionCreateFormData>(INITIAL_DATA);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof AdmissionCreateFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    async function loadYears() {
      try {
        const years = await academicYearService.getAcademicYears();
        setAcademicYears(years);
        // Default to active academic year
        const active = years.find((y) => y.status === 'active');
        if (active) {
          setFormData((prev) => ({ ...prev, academic_year_id: active.id }));
        } else if (years.length > 0) {
          setFormData((prev) => ({ ...prev, academic_year_id: years[0].id }));
        }
      } catch {
        // Ignored
      }
    }
    loadYears();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AdmissionCreateFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateAdmissionForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await admissionService.createCandidate(formData);
      navigate(`/calon-siswa/${result.id}`, { replace: true });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Gagal menyimpan calon siswa.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="detail-top-bar">
        <button
          type="button"
          onClick={() => navigate('/calon-siswa')}
          className="btn-secondary btn-back"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Calon</span>
        </button>
      </div>

      <div className="form-header-row mb-4">
        <div>
          <h1 className="page-title">Pendaftaran Calon Siswa Baru</h1>
          <p className="page-subtitle">
            Masukkan data identitas calon siswa untuk tahun ajaran tujuan (Target Kelas 1).
          </p>
        </div>
      </div>

      {serverError && (
        <div className="feedback-banner error-banner mb-4">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="student-form-layout">
        {/* 0. TAHUN AJARAN & TARGET KELAS */}
        <div className="form-section-card">
          <div className="form-section-header">
            <h3 className="form-section-title">Informasi Pendaftaran</h3>
            <p className="form-section-desc">Tentukan tahun ajaran masuk calon siswa</p>
          </div>

          <div className="form-grid">
            <div className="form-group col-span-2">
              <label htmlFor="academic_year_id">
                Tahun Ajaran Masuk <span className="required-star">*</span>
              </label>
              <select
                id="academic_year_id"
                name="academic_year_id"
                value={formData.academic_year_id}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">-- Pilih Tahun Ajaran --</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.tahun_ajaran} {ay.status === 'active' ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
              {errors.academic_year_id ? (
                <span className="field-error">{errors.academic_year_id}</span>
              ) : (
                <span className="form-hint">Calon siswa akan didaftarkan ke tahun ajaran yang dipilih</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="target_kelas">Target Kelas</label>
              <input
                id="target_kelas"
                type="text"
                value="Kelas 1 (Siswa Baru)"
                disabled
              />
              <span className="form-hint">Pendaftaran calon siswa dikhususkan untuk Kelas 1</span>
            </div>
          </div>
        </div>

        {/* 1. DATA IDENTITAS */}
        <div className="form-section-card">
          <div className="form-section-header">
            <h3 className="form-section-title">1. Data Identitas Calon Siswa</h3>
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
                placeholder="16 digit NIK"
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
                maxLength={10}
                value={formData.nisn}
                onChange={handleChange}
                placeholder="10 digit NISN jika ada"
                disabled={isSubmitting}
              />
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
                placeholder="Kota/Kabupaten"
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
            </div>
          </div>
        </div>

        {/* 2. DATA ALAMAT */}
        <div className="form-section-card">
          <div className="form-section-header">
            <h3 className="form-section-title">2. Data Alamat Tempat Tinggal</h3>
            <p className="form-section-desc">Domisili tempat tinggal calon siswa</p>
          </div>

          <div className="form-grid">
            {/* Alamat Lengkap */}
            <div className="form-group col-span-3">
              <label htmlFor="alamat">
                Alamat Lengkap <span className="required-star">*</span>
              </label>
              <textarea
                id="alamat"
                name="alamat"
                rows={2}
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Nama jalan, nomor rumah, gang..."
                disabled={isSubmitting}
              />
              {errors.alamat && <span className="field-error">{errors.alamat}</span>}
            </div>

            {/* RT & RW */}
            <div className="form-group">
              <label htmlFor="rt">RT</label>
              <input
                id="rt"
                name="rt"
                type="text"
                value={formData.rt}
                onChange={handleChange}
                placeholder="001"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rw">RW</label>
              <input
                id="rw"
                name="rw"
                type="text"
                value={formData.rw}
                onChange={handleChange}
                placeholder="002"
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
                placeholder="Nama dusun"
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
                placeholder="Nama kelurahan/desa"
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
                placeholder="Nama kecamatan"
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
                maxLength={5}
                value={formData.kode_pos}
                onChange={handleChange}
                placeholder="Contoh: 40123"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions-footer">
          <button
            type="button"
            onClick={() => navigate('/calon-siswa')}
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
            <Save size={16} />
            <span>{isSubmitting ? 'Menyimpan Calon Siswa...' : 'Simpan Calon Siswa'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
