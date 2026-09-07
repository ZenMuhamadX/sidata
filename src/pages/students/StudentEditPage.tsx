import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StudentForm } from '../../features/students/components/StudentForm';
import { studentService } from '../../features/students/services/student.service';
import type { Student, StudentFormData } from '../../features/students/types/student.types';

export const StudentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    studentService
      .getStudentById(id)
      .then((data) => {
        setStudent(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setFetchError(err instanceof Error ? err.message : 'Gagal memuat data siswa.');
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (formData: StudentFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setServerError(null);

    try {
      await studentService.updateStudent(id, formData);
      navigate(`/siswa/${id}`, { replace: true });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Gagal memperbarui data siswa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="table-loading-container">
          <div className="spinner"></div>
          <p>Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !student) {
    return (
      <div className="page-container">
        <div className="error-state-card">
          <p className="error-state-title">Data Siswa Tidak Ditemukan</p>
          <p className="error-state-desc">{fetchError || 'ID siswa tidak valid.'}</p>
          <button
            type="button"
            onClick={() => navigate('/siswa')}
            className="btn-secondary"
          >
            Kembali ke Daftar Siswa
          </button>
        </div>
      </div>
    );
  }

  const initialFormData: StudentFormData = {
    nama: student.nama,
    jenis_kelamin: student.jenis_kelamin,
    nisn: student.nisn || '',
    nik: student.nik,
    tempat_lahir: student.tempat_lahir,
    tanggal_lahir: student.tanggal_lahir,
    agama: student.agama,
    alamat: student.alamat,
    rt: student.rt || '',
    rw: student.rw || '',
    dusun: student.dusun || '',
    kelurahan: student.kelurahan,
    kecamatan: student.kecamatan,
    kode_pos: student.kode_pos || '',
    jenis_tinggal: student.jenis_tinggal || '',
    alat_transportasi: student.alat_transportasi || '',
    hp: student.hp || '',
    kelas: student.kelas,
    nomor_registrasi_akta_lahir: student.nomor_registrasi_akta_lahir || '',
    anak_ke: student.anak_ke !== null ? String(student.anak_ke) : '',
    ket: student.ket || '',
    status_siswa: student.status_siswa,
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/siswa/${id}`)}
            className="btn-link-back"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Detail Siswa</span>
          </button>
          <h2 className="page-title">Edit Data Siswa: {student.nama}</h2>
          <p className="page-subtitle">Perbarui data profil atau informasi kesiswaan</p>
        </div>
      </div>

      <StudentForm
        initialData={initialFormData}
        isEditing={true}
        isSubmitting={isSubmitting}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
