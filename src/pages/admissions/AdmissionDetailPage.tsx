import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UserCheck, User, Plus, Edit2, Trash2 } from 'lucide-react';
import { admissionService } from '../../features/admissions/services/admission.service';
import { parentService } from '../../features/parents/services/parent.service';
import { AdmissionStatusModal } from '../../features/admissions/components/AdmissionStatusModal';
import { AdmissionEnrollModal } from '../../features/admissions/components/AdmissionEnrollModal';
import { StudentDocumentsSection } from '../../features/documents/components/StudentDocumentsSection';
import { ParentDeleteModal } from '../../features/parents/components/ParentDeleteModal';
import { formatIndonesianDate } from '../../features/students/utils/formatters';
import type {
  StudentAdmissionWithRelations,
  AdmissionStatus,
} from '../../features/admissions/types/admission.types';
import type { Parent, ParentWithStudent } from '../../features/parents/types/parent.types';
import {
  ADMISSION_STATUS_LABELS,
  ADMISSION_STATUS_CLASSES,
} from '../../features/admissions/types/admission.types';

export const AdmissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [admission, setAdmission] = useState<StudentAdmissionWithRelations | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status Change Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Enroll Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

  // Parent deletion state
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [isDeletingParent, setIsDeletingParent] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const admissionData = await admissionService.getAdmissionById(id);
      setAdmission(admissionData);

      if (admissionData.student_id) {
        const parentsData = await parentService.getParentsByStudentId(admissionData.student_id);
        setParents(parentsData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat rincian calon siswa.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleStatusSubmit = async (newStatus: AdmissionStatus) => {
    if (!admission) return;
    setIsUpdatingStatus(true);
    try {
      await admissionService.updateAdmissionStatus(admission.id, newStatus);
      showFeedback('success', `Status calon siswa berhasil diubah menjadi "${newStatus}".`);
      setIsStatusModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal mengubah status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEnrollConfirm = async () => {
    if (!admission) return;
    setIsEnrolling(true);
    try {
      await admissionService.enrollCandidate(admission.id);
      showFeedback(
        'success',
        `Siswa ${admission.student.nama} berhasil didaftarkan secara resmi ke Kelas 1!`
      );
      setIsEnrollModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal mendaftarkan calon siswa.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleConfirmDeleteParent = async () => {
    if (!parentToDelete) return;
    setIsDeletingParent(true);
    try {
      await parentService.deleteParent(parentToDelete.id);
      showFeedback('success', `Data orang tua berhasil dihapus.`);
      setParentToDelete(null);
      fetchData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menghapus data orang tua.');
    } finally {
      setIsDeletingParent(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="table-loading-container">
          <div className="spinner"></div>
          <p>Memuat rincian calon siswa...</p>
        </div>
      </div>
    );
  }

  if (error || !admission) {
    return (
      <div className="page-container">
        <div className="error-state-card">
          <p className="error-state-title">Data Calon Siswa Tidak Ditemukan</p>
          <p className="error-state-desc">{error || 'ID calon siswa tidak valid.'}</p>
          <button
            type="button"
            onClick={() => navigate('/calon-siswa')}
            className="btn-secondary"
          >
            Kembali ke Daftar Calon
          </button>
        </div>
      </div>
    );
  }

  const student = admission.student;
  const academicYear = admission.academic_year;
  const isAccepted = admission.status === 'accepted';
  const ayah = parents.find((p) => p.hubungan === 'ayah');
  const ibu = parents.find((p) => p.hubungan === 'ibu');

  const parentToDeleteFormatted: ParentWithStudent | null = parentToDelete
    ? {
        ...parentToDelete,
        students: {
          id: student.id,
          nama: student.nama,
          kelas: student.kelas,
          status_siswa: student.status_siswa,
          nik: student.nik,
          nisn: student.nisn,
        },
      }
    : null;

  return (
    <div className="page-container">
      {feedbackMsg && (
        <div className={`feedback-banner ${feedbackMsg.type === 'success' ? 'success-banner' : 'error-banner'}`}>
          {feedbackMsg.text}
        </div>
      )}

      {/* Top Action Bar */}
      <div className="detail-top-bar">
        <button
          type="button"
          onClick={() => navigate('/calon-siswa')}
          className="btn-secondary btn-back"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Calon</span>
        </button>

        <div className="detail-action-buttons">
          {admission.status !== 'enrolled' && (
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              className="btn-secondary"
            >
              <CheckCircle2 size={16} />
              <span>Ubah Status</span>
            </button>
          )}

          {isAccepted && (
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(true)}
              className="btn-primary"
            >
              <UserCheck size={16} />
              <span>Daftarkan sebagai Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Candidate Card */}
      <div className="section-card student-main-header-card">
        <div className="student-header-info">
          <div>
            <h2 className="student-name-heading">{student.nama}</h2>
            <p className="student-sub-info">
              NIK: <span className="font-mono">{student.nik}</span> | NISN: <span className="font-mono">{student.nisn || '-'}</span>
            </p>
          </div>
          <div className="student-badges-group">
            <span className="badge-kelas">Target Kelas {admission.target_kelas}</span>
            <span className={ADMISSION_STATUS_CLASSES[admission.status] || 'status-badge-inactive'}>
              {ADMISSION_STATUS_LABELS[admission.status] || admission.status}
            </span>
          </div>
        </div>
      </div>

      {/* Grouped Information Grid */}
      <div className="detail-sections-grid">
        {/* 1. DATA PENERIMAAN */}
        <div className="section-card detail-group-card">
          <div className="section-header">
            <h3 className="section-title">Data Penerimaan (Admission)</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Tahun Ajaran Masuk</span>
              <span className="detail-val">{academicYear?.tahun_ajaran || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Target Kelas</span>
              <span className="detail-val">Kelas {admission.target_kelas} (Siswa Baru)</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status Penerimaan</span>
              <span className="detail-val">
                <span className={ADMISSION_STATUS_CLASSES[admission.status] || 'status-badge-inactive'}>
                  {ADMISSION_STATUS_LABELS[admission.status] || admission.status}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tanggal Mendaftar</span>
              <span className="detail-val">{formatIndonesianDate(admission.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 2. IDENTITAS */}
        <div className="section-card detail-group-card">
          <div className="section-header">
            <h3 className="section-title">Identitas Calon Siswa</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Nama Lengkap</span>
              <span className="detail-val">{student.nama}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Jenis Kelamin</span>
              <span className="detail-val">
                {student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">NIK</span>
              <span className="detail-val font-mono">{student.nik}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">NISN</span>
              <span className="detail-val font-mono">{student.nisn || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tempat / Tgl Lahir</span>
              <span className="detail-val">
                {student.tempat_lahir}, {formatIndonesianDate(student.tanggal_lahir)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Agama</span>
              <span className="detail-val">{student.agama}</span>
            </div>
          </div>
        </div>

        {/* 3. ALAMAT */}
        <div className="section-card detail-group-card col-span-2">
          <div className="section-header">
            <h3 className="section-title">Alamat Domisili</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Alamat Lengkap</span>
              <span className="detail-val">{student.alamat}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">RT / RW</span>
              <span className="detail-val">
                {student.rt ? `RT ${student.rt}` : '-'} / {student.rw ? `RW ${student.rw}` : '-'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Kelurahan / Kecamatan</span>
              <span className="detail-val">
                {student.kelurahan}, {student.kecamatan}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Kode Pos</span>
              <span className="detail-val font-mono">{student.kode_pos || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DATA ORANG TUA */}
      <div className="section-card student-parents-card mt-4">
        <div className="section-header">
          <div className="title-with-icon">
            <User size={18} className="text-primary" />
            <h3 className="section-title">Data Orang Tua Calon Siswa</h3>
          </div>
        </div>

        <div className="parents-grid-layout">
          {/* AYAH */}
          <div className="parent-box">
            <div className="parent-box-header">
              <div className="parent-box-title">
                <span className="badge-hubungan badge-ayah">Ayah</span>
                <span className="parent-name-text">{ayah ? ayah.nama || '(Nama belum diisi)' : ''}</span>
              </div>
              {ayah ? (
                <div className="parent-box-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/orang-tua/${ayah.id}/edit`)}
                    className="btn-secondary btn-sm"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParentToDelete(ayah)}
                    className="btn-icon btn-icon-danger"
                    title="Hapus data ayah"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/orang-tua/tambah?student_id=${student.id}&hubungan=ayah`)
                  }
                  className="btn-primary btn-sm"
                >
                  <Plus size={14} />
                  <span>+ Tambah Ayah</span>
                </button>
              )}
            </div>

            <div className="parent-box-body">
              {ayah ? (
                <div className="detail-dl">
                  <div className="detail-row">
                    <span className="detail-label">Nama</span>
                    <span className="detail-val">{ayah.nama || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">NIK</span>
                    <span className="detail-val font-mono">{ayah.nik || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pekerjaan</span>
                    <span className="detail-val">{ayah.pekerjaan || '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="parent-empty-box">
                  <p className="parent-empty-text">Data ayah belum tersedia.</p>
                </div>
              )}
            </div>
          </div>

          {/* IBU */}
          <div className="parent-box">
            <div className="parent-box-header">
              <div className="parent-box-title">
                <span className="badge-hubungan badge-ibu">Ibu</span>
                <span className="parent-name-text">{ibu ? ibu.nama || '(Nama belum diisi)' : ''}</span>
              </div>
              {ibu ? (
                <div className="parent-box-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/orang-tua/${ibu.id}/edit`)}
                    className="btn-secondary btn-sm"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParentToDelete(ibu)}
                    className="btn-icon btn-icon-danger"
                    title="Hapus data ibu"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/orang-tua/tambah?student_id=${student.id}&hubungan=ibu`)
                  }
                  className="btn-primary btn-sm"
                >
                  <Plus size={14} />
                  <span>+ Tambah Ibu</span>
                </button>
              )}
            </div>

            <div className="parent-box-body">
              {ibu ? (
                <div className="detail-dl">
                  <div className="detail-row">
                    <span className="detail-label">Nama</span>
                    <span className="detail-val">{ibu.nama || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">NIK</span>
                    <span className="detail-val font-mono">{ibu.nik || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pekerjaan</span>
                    <span className="detail-val">{ibu.pekerjaan || '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="parent-empty-box">
                  <p className="parent-empty-text">Data ibu belum tersedia.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. DOKUMEN CALON SISWA */}
      <StudentDocumentsSection
        studentId={student.id}
        studentName={student.nama}
      />

      {/* Status Modal */}
      <AdmissionStatusModal
        isOpen={isStatusModalOpen}
        admission={admission}
        isUpdating={isUpdatingStatus}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusSubmit}
      />

      {/* Enroll Modal */}
      <AdmissionEnrollModal
        isOpen={isEnrollModalOpen}
        admission={admission}
        isEnrolling={isEnrolling}
        onClose={() => setIsEnrollModalOpen(false)}
        onConfirm={handleEnrollConfirm}
      />

      {/* Delete Parent Modal */}
      <ParentDeleteModal
        parent={parentToDeleteFormatted}
        isOpen={Boolean(parentToDelete)}
        isDeleting={isDeletingParent}
        onClose={() => setParentToDelete(null)}
        onConfirm={handleConfirmDeleteParent}
      />
    </div>
  );
};
