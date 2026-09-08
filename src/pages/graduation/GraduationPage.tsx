import React, { useState, useEffect, useCallback } from 'react';
import { GraduationCap, RefreshCw, Calendar } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { academicYearService } from '../../features/academic/services/academicYear.service';
import { graduationService } from '../../features/graduation/services/graduation.service';
import type { AcademicYear } from '../../features/academic/types/academic.types';
import type { GraduationCandidateStudent } from '../../features/graduation/types/graduation.types';
import { GraduationCandidateTable } from '../../features/graduation/components/GraduationCandidateTable';
import { GraduationReviewModal } from '../../features/graduation/components/GraduationReviewModal';

export const GraduationPage: React.FC = () => {
  const { user } = useAuth();

  // Academic Years state
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [isYearsLoading, setIsYearsLoading] = useState<boolean>(true);

  // Candidate students state
  const [candidates, setCandidates] = useState<GraduationCandidateStudent[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Execution state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Fetch academic years and default to active year
  const loadAcademicYears = useCallback(async () => {
    setIsYearsLoading(true);
    setFeedbackMsg(null);
    try {
      const years = await academicYearService.getAcademicYears();
      setAcademicYears(years);

      // Default to active year if available and none selected yet
      if (!selectedYearId && years.length > 0) {
        const activeYear = years.find((y) => y.status === 'active');
        setSelectedYearId(activeYear ? activeYear.id : years[0].id);
      }
    } catch (err: unknown) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal memuat data tahun ajaran.',
      });
    } finally {
      setIsYearsLoading(false);
    }
  }, [selectedYearId]);

  useEffect(() => {
    loadAcademicYears();
  }, [loadAcademicYears]);

  // 2. Fetch candidates when selected year changes
  const loadCandidates = useCallback(async () => {
    if (!selectedYearId) {
      setCandidates([]);
      setSelectedStudentIds(new Set());
      return;
    }

    setIsLoadingCandidates(true);
    try {
      const data = await graduationService.getCandidates(selectedYearId);
      setCandidates(data);
      // Default: select all candidates automatically for convenience
      setSelectedStudentIds(new Set(data.map((item) => item.student_id)));
    } catch (err: unknown) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal memuat siswa calon kelulusan.',
      });
      setCandidates([]);
      setSelectedStudentIds(new Set());
    } finally {
      setIsLoadingCandidates(false);
    }
  }, [selectedYearId]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Selection handlers
  const handleToggleSelect = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    // Check against current filtered query
    const q = searchQuery.toLowerCase().trim();
    const visibleCandidates = q
      ? candidates.filter((item) => {
          const name = item.student.nama.toLowerCase();
          const nik = item.student.nik.toLowerCase();
          const nisn = (item.student.nisn || '').toLowerCase();
          return name.includes(q) || nik.includes(q) || nisn.includes(q);
        })
      : candidates;

    const allVisibleSelected =
      visibleCandidates.length > 0 &&
      visibleCandidates.every((item) => selectedStudentIds.has(item.student_id));

    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleCandidates.forEach((item) => next.delete(item.student_id));
      } else {
        visibleCandidates.forEach((item) => next.add(item.student_id));
      }
      return next;
    });
  };

  // Execute Graduation Transaction
  const handleExecuteGraduation = async () => {
    if (!selectedYearId || selectedStudentIds.size === 0) return;

    setIsProcessing(true);
    setFeedbackMsg(null);

    try {
      const result = await graduationService.processGraduation(
        {
          academic_year_id: selectedYearId,
          student_ids: Array.from(selectedStudentIds),
        },
        user?.email
      );

      setFeedbackMsg({
        type: 'success',
        text: result.message || `${result.total_graduated} siswa berhasil diluluskan.`,
      });

      setIsReviewModalOpen(false);
      // Reload candidates
      await loadCandidates();
    } catch (err: unknown) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal memproses kelulusan siswa.',
      });
      setIsReviewModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedYearObj = academicYears.find((y) => y.id === selectedYearId) || null;

  return (
    <div className="page-container">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`feedback-banner ${feedbackMsg.type === 'success' ? 'success-banner' : 'error-banner'}`}>
          {feedbackMsg.text}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="title-with-icon">
            <GraduationCap size={22} className="text-primary" />
            <h1 className="page-title">Kelulusan Siswa</h1>
          </div>
          <p className="page-subtitle">
            Proses penetapan kelulusan resmi untuk siswa SD Kelas 6 yang telah menyelesaikan tahun ajaran.
          </p>
        </div>

        <div className="page-actions-group">
          <button
            type="button"
            onClick={() => {
              loadAcademicYears();
              loadCandidates();
            }}
            className="btn-secondary"
            disabled={isYearsLoading || isLoadingCandidates || isProcessing}
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 1. Academic Year Selector Card */}
      <div className="section-card">
        <div className="section-header">
          <div className="title-with-icon">
            <Calendar size={18} className="text-primary" />
            <h2 className="section-title">Periode Tahun Ajaran Kelulusan</h2>
          </div>
        </div>

        <div className="promotion-config-body">
          <div className="form-group" style={{ maxWidth: '400px' }}>
            <label htmlFor="select-academic-year">
              Tahun Ajaran Kelulusan <span className="required-star">*</span>
            </label>
            <select
              id="select-academic-year"
              value={selectedYearId}
              onChange={(e) => {
                setSelectedYearId(e.target.value);
                setFeedbackMsg(null);
              }}
              disabled={isYearsLoading || isProcessing}
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.tahun_ajaran} {ay.status === 'active' ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
            <span className="form-hint">
              Hanya siswa yang tercatat aktif di Kelas 6 pada periode ini yang akan dimuat.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Candidate Students Table Card */}
      <GraduationCandidateTable
        candidates={candidates}
        selectedStudentIds={selectedStudentIds}
        searchQuery={searchQuery}
        isLoading={isLoadingCandidates}
        isProcessing={isProcessing}
        onSearchChange={setSearchQuery}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenConfirmModal={() => setIsReviewModalOpen(true)}
      />

      {/* 3. Review & Confirmation Modal */}
      <GraduationReviewModal
        isOpen={isReviewModalOpen}
        academicYear={selectedYearObj}
        selectedCount={selectedStudentIds.size}
        isProcessing={isProcessing}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleExecuteGraduation}
      />
    </div>
  );
};
