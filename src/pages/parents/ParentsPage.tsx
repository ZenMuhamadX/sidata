import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parentService } from '../../features/parents/services/parent.service';
import { ParentFiltersBar } from '../../features/parents/components/ParentFiltersBar';
import { ParentListTable } from '../../features/parents/components/ParentListTable';
import { StudentPagination } from '../../features/students/components/StudentPagination';
import { ParentDeleteModal } from '../../features/parents/components/ParentDeleteModal';
import type { ParentWithStudent, ParentFilters } from '../../features/parents/types/parent.types';

export const ParentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ParentFilters>({
    search: '',
    hubungan: 'all',
    kelas: 'all',
    status_siswa: 'aktif', // default status siswa aktif
    page: 1,
    pageSize: 20,
  });

  const [parents, setParents] = useState<ParentWithStudent[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete state
  const [parentToDelete, setParentToDelete] = useState<ParentWithStudent | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchParents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await parentService.getParents(filters);
      setParents(result.parents);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data orang tua.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleFilterChange = (newFilters: Partial<ParentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleConfirmDelete = async () => {
    if (!parentToDelete) return;

    setIsDeleting(true);
    try {
      await parentService.deleteParent(parentToDelete.id);
      const relationship = parentToDelete.hubungan === 'ayah' ? 'ayah' : 'ibu';
      const studentName = parentToDelete.students?.nama || 'siswa';
      setParentToDelete(null);
      setFeedbackMsg(`Data ${relationship} dari ${studentName} berhasil dihapus.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchParents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus data orang tua.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered =
    Boolean(filters.search) ||
    filters.hubungan !== 'all' ||
    filters.kelas !== 'all' ||
    (filters.status_siswa !== 'all' && filters.status_siswa !== 'aktif');

  return (
    <div className="page-container">
      {/* Top Header & Tambah Action */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Data Orang Tua</h2>
          <p className="page-subtitle">Informasi profil ayah dan ibu siswa yang terdaftar di sekolah</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/orang-tua/tambah')}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>Tambah Orang Tua</span>
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
              <p className="error-state-title">Gagal memuat data orang tua.</p>
              <p className="error-state-desc">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchParents}
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
        <ParentFiltersBar filters={filters} onChange={handleFilterChange} />

        {/* Table */}
        <ParentListTable
          parents={parents}
          isLoading={isLoading}
          isFiltered={isFiltered}
          onDelete={(parent) => setParentToDelete(parent)}
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
      <ParentDeleteModal
        parent={parentToDelete}
        isOpen={Boolean(parentToDelete)}
        isDeleting={isDeleting}
        onClose={() => setParentToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
