import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../features/students/services/student.service';
import { parentService } from '../../features/parents/services/parent.service';
import { StudentDetail } from '../../features/students/components/StudentDetail';
import { StudentDeleteModal } from '../../features/students/components/StudentDeleteModal';
import { ParentDeleteModal } from '../../features/parents/components/ParentDeleteModal';
import type { Student } from '../../features/students/types/student.types';
import type { Parent, ParentWithStudent } from '../../features/parents/types/parent.types';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Parent deletion state
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [isDeletingParent, setIsDeletingParent] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [studentData, parentsData] = await Promise.all([
        studentService.getStudentById(id),
        parentService.getParentsByStudentId(id),
      ]);
      setStudent(studentData);
      setParents(parentsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data siswa.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStatus = async () => {
    if (!student) return;
    const nextStatus = student.status_siswa === 'aktif' ? 'tidak_aktif' : 'aktif';
    setIsUpdatingStatus(true);
    try {
      const updated = await studentService.updateStudentStatus(student.id, nextStatus);
      setStudent(updated);
      setFeedbackMsg(
        `Status siswa berhasil diubah menjadi "${nextStatus === 'aktif' ? 'Aktif' : 'Tidak Aktif'}".`
      );
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status siswa.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!student) return;
    setIsDeleting(true);
    try {
      await studentService.deleteStudent(student.id);
      navigate('/siswa', { replace: true });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus siswa.');
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteParent = async () => {
    if (!parentToDelete) return;
    setIsDeletingParent(true);
    try {
      await parentService.deleteParent(parentToDelete.id);
      const hub = parentToDelete.hubungan === 'ayah' ? 'ayah' : 'ibu';
      setFeedbackMsg(`Data ${hub} berhasil dihapus.`);
      setParentToDelete(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus data orang tua.');
    } finally {
      setIsDeletingParent(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="table-loading-container">
          <div className="spinner"></div>
          <p>Memuat rincian data siswa...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="page-container">
        <div className="error-state-card">
          <p className="error-state-title">Data Siswa Tidak Ditemukan</p>
          <p className="error-state-desc">{error || 'ID siswa tidak valid atau data telah dihapus.'}</p>
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

  // Format parentToDelete for ParentDeleteModal
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
        <div className="feedback-banner success-banner">
          {feedbackMsg}
        </div>
      )}

      <StudentDetail
        student={student}
        parents={parents}
        isUpdatingStatus={isUpdatingStatus}
        onToggleStatus={handleToggleStatus}
        onDelete={() => setIsDeleteModalOpen(true)}
        onDeleteParent={(parent) => setParentToDelete(parent)}
      />

      {/* Delete Student Modal */}
      <StudentDeleteModal
        student={student}
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
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
