import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ParentForm } from '../../features/parents/components/ParentForm';
import { parentService } from '../../features/parents/services/parent.service';
import { studentService } from '../../features/students/services/student.service';
import type { ParentFormData } from '../../features/parents/types/parent.types';
import type { ParentHubungan } from '../../types/database';

export const ParentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryStudentId = searchParams.get('student_id') || '';
  const queryHubungan = (searchParams.get('hubungan') as ParentHubungan) || 'ayah';

  const [preloadedStudent, setPreloadedStudent] = useState<{
    id: string;
    nama: string;
    kelas: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (queryStudentId) {
      studentService
        .getStudentById(queryStudentId)
        .then((student) => {
          setPreloadedStudent({
            id: student.id,
            nama: student.nama,
            kelas: student.kelas,
          });
        })
        .catch(() => {
          // Abaikan jika tidak ditemukan
        });
    }
  }, [queryStudentId]);

  const handleSubmit = async (formData: ParentFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await parentService.createParent(formData);
      // Jika datang dari detail siswa, kembali ke detail siswa
      if (queryStudentId) {
        navigate(`/siswa/${queryStudentId}`, { replace: true });
      } else {
        navigate('/orang-tua', { replace: true });
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Gagal menyimpan data orang tua.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialData: ParentFormData = {
    student_id: queryStudentId,
    hubungan: queryHubungan,
    nama: '',
    nik: '',
    tahun_lahir: '',
    jenjang_pendidikan: '',
    pekerjaan: '',
    penghasilan: '',
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <button
            type="button"
            onClick={() => (queryStudentId ? navigate(`/siswa/${queryStudentId}`) : navigate('/orang-tua'))}
            className="btn-link-back"
          >
            <ArrowLeft size={16} />
            <span>{queryStudentId ? 'Kembali ke Detail Siswa' : 'Kembali ke Daftar Orang Tua'}</span>
          </button>
          <h2 className="page-title">Tambah Data Orang Tua</h2>
          <p className="page-subtitle">
            Tambahkan informasi ayah atau ibu siswa ({queryHubungan === 'ayah' ? 'Ayah' : 'Ibu'})
          </p>
        </div>
      </div>

      <ParentForm
        initialData={initialData}
        isEditing={false}
        lockStudent={Boolean(queryStudentId)}
        preloadedStudent={preloadedStudent}
        isSubmitting={isSubmitting}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
