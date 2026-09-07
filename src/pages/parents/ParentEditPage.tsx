import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ParentForm } from '../../features/parents/components/ParentForm';
import { parentService } from '../../features/parents/services/parent.service';
import type { ParentWithStudent, ParentFormData } from '../../features/parents/types/parent.types';

export const ParentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [parent, setParent] = useState<ParentWithStudent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    parentService
      .getParentById(id)
      .then((data) => {
        setParent(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setFetchError(err instanceof Error ? err.message : 'Gagal memuat data orang tua.');
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (formData: ParentFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setServerError(null);

    try {
      await parentService.updateParent(id, formData);
      navigate(`/orang-tua/${id}`, { replace: true });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Gagal memperbarui data orang tua.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="table-loading-container">
          <div className="spinner"></div>
          <p>Memuat data orang tua...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !parent) {
    return (
      <div className="page-container">
        <div className="error-state-card">
          <p className="error-state-title">Data Orang Tua Tidak Ditemukan</p>
          <p className="error-state-desc">{fetchError || 'ID orang tua tidak valid.'}</p>
          <button
            type="button"
            onClick={() => navigate('/orang-tua')}
            className="btn-secondary"
          >
            Kembali ke Daftar Orang Tua
          </button>
        </div>
      </div>
    );
  }

  const initialFormData: ParentFormData = {
    student_id: parent.student_id,
    hubungan: parent.hubungan,
    nama: parent.nama || '',
    nik: parent.nik || '',
    tahun_lahir: parent.tahun_lahir !== null ? String(parent.tahun_lahir) : '',
    jenjang_pendidikan: parent.jenjang_pendidikan || '',
    pekerjaan: parent.pekerjaan || '',
    penghasilan: parent.penghasilan || '',
  };

  const preloadedStudent = parent.students
    ? {
        id: parent.students.id,
        nama: parent.students.nama,
        kelas: parent.students.kelas,
      }
    : null;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/orang-tua/${id}`)}
            className="btn-link-back"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Detail Orang Tua</span>
          </button>
          <h2 className="page-title">
            Edit Data {parent.hubungan === 'ayah' ? 'Ayah' : 'Ibu'}: {parent.nama || '-'}
          </h2>
          <p className="page-subtitle">Perbarui data orang tua siswa</p>
        </div>
      </div>

      <ParentForm
        initialData={initialFormData}
        isEditing={true}
        lockStudent={true}
        preloadedStudent={preloadedStudent}
        isSubmitting={isSubmitting}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
