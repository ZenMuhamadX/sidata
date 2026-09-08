import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { admissionService } from '../../features/admissions/services/admission.service';
import { academicYearService } from '../../features/academic/services/academicYear.service';
import { AdmissionListTable } from '../../features/admissions/components/AdmissionListTable';
import { AdmissionFiltersBar } from '../../features/admissions/components/AdmissionFiltersBar';
import { AdmissionStatusModal } from '../../features/admissions/components/AdmissionStatusModal';
import { AdmissionEnrollModal } from '../../features/admissions/components/AdmissionEnrollModal';
import { StudentPagination } from '../../features/students/components/StudentPagination';
import type {
  StudentAdmissionWithRelations,
  AdmissionFilters,
  AdmissionStatus,
} from '../../features/admissions/types/admission.types';
import type { AcademicYear } from '../../features/academic/types/academic.types';

export const AdmissionsPage: React.FC = () => {
  const navigate = useNavigate();

  const [admissions, setAdmissions] = useState<StudentAdmissionWithRelations[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters State
  const [filters, setFilters] = useState<AdmissionFilters>({
    search: '',
    academic_year_id: 'all',
    status: 'all',
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Status Change Modal State
  const [statusTarget, setStatusTarget] = useState<StudentAdmissionWithRelations | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Enroll Modal State
  const [enrollTarget, setEnrollTarget] = useState<StudentAdmissionWithRelations | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

  // Load Academic Years for filtering dropdown
  useEffect(() => {
    async function loadYears() {
      try {
        const years = await academicYearService.getAcademicYears();
        setAcademicYears(years);
      } catch {
        // Ignored, filter will simply show 'all'
      }
    }
    loadYears();
  }, []);

  const fetchAdmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await admissionService.getAdmissions(filters);
      setAdmissions(result.admissions);
      setTotalCount(result.total);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal memuat data calon siswa.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleFilterChange = (newFilters: Partial<AdmissionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleStatusSubmit = async (newStatus: AdmissionStatus) => {
    if (!statusTarget) return;
    setIsUpdatingStatus(true);
    try {
      await admissionService.updateAdmissionStatus(statusTarget.id, newStatus);
      showFeedback('success', `Status calon siswa berhasil diubah menjadi "${newStatus}".`);
      setStatusTarget(null);
      fetchAdmissions();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal mengubah status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEnrollConfirm = async () => {
    if (!enrollTarget) return;
    setIsEnrolling(true);
    try {
      await admissionService.enrollCandidate(enrollTarget.id);
      showFeedback(
        'success',
        `Siswa ${enrollTarget.student.nama} berhasil didaftarkan secara resmi ke Kelas 1!`
      );
      setEnrollTarget(null);
      fetchAdmissions();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal mendaftarkan siswa.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const isFiltered = Boolean(
    filters.search || filters.academic_year_id !== 'all' || filters.status !== 'all'
  );

  return (
    <div className="page-container">
      {feedbackMsg && (
        <div className={`feedback-banner ${feedbackMsg.type === 'success' ? 'success-banner' : 'error-banner'}`}>
          {feedbackMsg.text}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="title-with-icon">
            <UserPlus size={22} className="text-primary" />
            <h1 className="page-title">Calon Siswa & Penerimaan</h1>
          </div>
          <p className="page-subtitle">
            Kelola data pendaftaran calon siswa baru dan proses registrasi resmi ke Kelas 1.
          </p>
        </div>

        <div className="page-actions-group">
          <button
            type="button"
            onClick={fetchAdmissions}
            className="btn-secondary"
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/calon-siswa/tambah')}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Tambah Calon Siswa</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <AdmissionFiltersBar
        filters={filters}
        academicYears={academicYears}
        onChange={handleFilterChange}
      />

      {/* Table Section */}
      <div className="section-card p-0">
        <AdmissionListTable
          admissions={admissions}
          isLoading={isLoading}
          isFiltered={isFiltered}
          onUpdateStatus={(item) => setStatusTarget(item)}
          onEnroll={(item) => setEnrollTarget(item)}
        />

        {/* Pagination */}
        {admissions.length > 0 && (
          <StudentPagination
            page={filters.page}
            totalPages={totalPages}
            total={totalCount}
            pageSize={filters.pageSize}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        )}
      </div>

      {/* Status Modal */}
      <AdmissionStatusModal
        isOpen={Boolean(statusTarget)}
        admission={statusTarget}
        isUpdating={isUpdatingStatus}
        onClose={() => setStatusTarget(null)}
        onSubmit={handleStatusSubmit}
      />

      {/* Enroll Modal */}
      <AdmissionEnrollModal
        isOpen={Boolean(enrollTarget)}
        admission={enrollTarget}
        isEnrolling={isEnrolling}
        onClose={() => setEnrollTarget(null)}
        onConfirm={handleEnrollConfirm}
      />
    </div>
  );
};
