import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { parentService } from '../../features/parents/services/parent.service';
import { ParentDeleteModal } from '../../features/parents/components/ParentDeleteModal';
import type { ParentWithStudent } from '../../features/parents/types/parent.types';

export const ParentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [parent, setParent] = useState<ParentWithStudent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchParent = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await parentService.getParentById(id);
      setParent(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data orang tua.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchParent();
  }, [fetchParent]);

  const handleConfirmDelete = async () => {
    if (!parent) return;
    setIsDeleting(true);
    try {
      await parentService.deleteParent(parent.id);
      navigate('/orang-tua', { replace: true });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus data orang tua.');
      setIsDeleting(false);
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

  if (error || !parent) {
    return (
      <div className="page-container">
        <div className="error-state-card">
          <p className="error-state-title">Data Orang Tua Tidak Ditemukan</p>
          <p className="error-state-desc">{error || 'ID orang tua tidak valid.'}</p>
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

  const student = parent.students;
  const isAyah = parent.hubungan === 'ayah';

  return (
    <div className="page-container">
      {/* Detail Top Bar */}
      <div className="detail-top-bar">
        <button
          type="button"
          onClick={() => navigate('/orang-tua')}
          className="btn-secondary btn-back"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Orang Tua</span>
        </button>

        <div className="detail-action-buttons">
          <button
            type="button"
            onClick={() => navigate(`/orang-tua/${parent.id}/edit`)}
            className="btn-secondary"
          >
            <Edit2 size={16} />
            <span>Edit Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn-destructive"
          >
            <Trash2 size={16} />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="section-card student-main-header-card">
        <div className="student-header-info">
          <div>
            <h2 className="student-name-heading">{parent.nama || '(Nama belum diisi)'}</h2>
            <p className="student-sub-info">
              Hubungan: <strong>{isAyah ? 'Ayah' : 'Ibu'}</strong> | NIK: <span className="font-mono">{parent.nik || '-'}</span>
            </p>
          </div>
          <div>
            <span className={`badge-hubungan ${isAyah ? 'badge-ayah' : 'badge-ibu'}`}>
              {isAyah ? 'Ayah' : 'Ibu'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Data Orang Tua & Data Siswa Terkait */}
      <div className="detail-sections-grid">
        {/* Data Orang Tua */}
        <div className="section-card detail-group-card">
          <div className="section-header">
            <h3 className="section-title">Data Profil Orang Tua</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Hubungan</span>
              <span className="detail-val">{isAyah ? 'Ayah' : 'Ibu'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nama Lengkap</span>
              <span className="detail-val">{parent.nama || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">NIK</span>
              <span className="detail-val font-mono">{parent.nik || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tahun Lahir</span>
              <span className="detail-val">{parent.tahun_lahir || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Jenjang Pendidikan</span>
              <span className="detail-val">{parent.jenjang_pendidikan || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Pekerjaan</span>
              <span className="detail-val">{parent.pekerjaan || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Penghasilan</span>
              <span className="detail-val">{parent.penghasilan || '-'}</span>
            </div>
          </div>
        </div>

        {/* Data Siswa Terkait */}
        <div className="section-card detail-group-card">
          <div className="section-header">
            <h3 className="section-title">Data Siswa Terkait</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Nama Siswa</span>
              <span className="detail-val">
                {student ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/siswa/${student.id}`)}
                    className="link-relation-student"
                    title="Buka data profil siswa"
                  >
                    {student.nama}
                  </button>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Kelas</span>
              <span className="detail-val">
                {student ? <span className="badge-kelas">Kelas {student.kelas}</span> : '-'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status Siswa</span>
              <span className="detail-val">
                {student ? (
                  <span
                    className={
                      student.status_siswa === 'aktif'
                        ? 'status-badge-active'
                        : 'status-badge-inactive'
                    }
                  >
                    {student.status_siswa === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">NIK Siswa</span>
              <span className="detail-val font-mono">{student?.nik || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">NISN Siswa</span>
              <span className="detail-val font-mono">{student?.nisn || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <ParentDeleteModal
        parent={parent}
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
