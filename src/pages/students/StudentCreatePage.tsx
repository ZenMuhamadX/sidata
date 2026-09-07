import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StudentForm } from '../../features/students/components/StudentForm';
import { studentService } from '../../features/students/services/student.service';
import type { StudentFormData } from '../../features/students/types/student.types';

export const StudentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (formData: StudentFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const created = await studentService.createStudent(formData);
      navigate(`/siswa/${created.id}`, { replace: true });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Gagal menyimpan data siswa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <button
            type="button"
            onClick={() => navigate('/siswa')}
            className="btn-link-back"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Siswa</span>
          </button>
          <h2 className="page-title">Tambah Siswa Baru</h2>
          <p className="page-subtitle">Isi seluruh data wajib identitas, alamat, dan sekolah</p>
        </div>
      </div>

      <StudentForm
        isEditing={false}
        isSubmitting={isSubmitting}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
