import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../features/students/services/student.service';
import { StudentFiltersBar } from '../../features/students/components/StudentFiltersBar';
import { StudentListTable } from '../../features/students/components/StudentListTable';
import { StudentPagination } from '../../features/students/components/StudentPagination';
import { StudentDeleteModal } from '../../features/students/components/StudentDeleteModal';
import type { Student, StudentFilters } from '../../features/students/types/student.types';

export const StudentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    kelas: 'all',
    status_siswa: 'aktif', // default aktif
    page: 1,
    pageSize: 20,
    sortBy: 'nama',
    sortOrder: 'asc',
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await studentService.getStudents(filters);
      setStudents(result.students);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data siswa.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleFilterChange = (newFilters: Partial<StudentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      await studentService.deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
      setFeedbackMsg(`Siswa "${studentToDelete.nama}" berhasil dihapus permanen.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchStudents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus data siswa.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered =
    Boolean(filters.search) ||
    filters.kelas !== 'all' ||
    (filters.status_siswa !== 'all' && filters.status_siswa !== 'aktif');

  return (
    <div className="page-container">
      {/* Top Header & Tambah Action */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Data Siswa</h2>
          <p className="page-subtitle">Manajemen data profil dan status administrasi siswa</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/siswa/tambah')}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>Tambah Siswa</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="feedback-banner success-banner">
          {feedbackMsg}
        </div>
      )}

      {/* Error state with retry */}
      {error && (
        <div className="error-state-card">
          <div className="error-state-content">
            <AlertCircle size={20} className="text-danger" />
            <div>
              <p className="error-state-title">Gagal memuat data siswa.</p>
              <p className="error-state-desc">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchStudents}
            className="btn-secondary"
          >
            <RefreshCw size={14} />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Main Section Card */}
      <div className="section-card">
        {/* Filters */}
        <StudentFiltersBar filters={filters} onChange={handleFilterChange} />

        {/* Table */}
        <StudentListTable
          students={students}
          isLoading={isLoading}
          isFiltered={isFiltered}
          onDelete={(student) => setStudentToDelete(student)}
        />

        {/* Pagination */}
        {!isLoading && (
          <StudentPagination
            page={filters.page}
            pageSize={filters.pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={(newPage) => handleFilterChange({ page: newPage })}
          />
        )}
      </div>

      {/* Permanent Delete Modal */}
      <StudentDeleteModal
        student={studentToDelete}
        isOpen={Boolean(studentToDelete)}
        isDeleting={isDeleting}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
