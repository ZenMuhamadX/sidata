import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { academicYearService } from '../../features/academic/services/academicYear.service';
import { promotionService } from '../../features/promotion/services/promotion.service';
import { PromotionConfigCard } from '../../features/promotion/components/PromotionConfigCard';
import { PromotionStudentTable } from '../../features/promotion/components/PromotionStudentTable';
import { PromotionReviewModal } from '../../features/promotion/components/PromotionReviewModal';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { AcademicYear } from '../../features/academic/types/academic.types';
import type {
  PromotionCandidateStudent,
  PromotionDecision,
} from '../../features/promotion/types/promotion.types';

export const ClassPromotionPage: React.FC = () => {
  const { user } = useAuth();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState<string>('');
  const [kelasFrom, setKelasFrom] = useState<number>(1);

  const [students, setStudents] = useState<PromotionCandidateStudent[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load available academic years
  const loadAcademicYears = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const years = await academicYearService.getAcademicYears();
      setAcademicYears(years);

      const active = years.find((y) => y.status === 'active');
      if (active) {
        setYearFrom(active.id);
        // Find next year if available
        const next = years.find((y) => y.tahun_ajaran > active.tahun_ajaran);
        if (next) {
          setYearTo(next.id);
        }
      } else if (years.length > 0) {
        setYearFrom(years[0].id);
      }
    } catch (err: unknown) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal memuat daftar tahun ajaran.',
      });
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAcademicYears();
  }, [loadAcademicYears]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Load eligible students
  const handleLoadStudents = async () => {
    if (!yearFrom) return;
    setIsLoadingStudents(true);
    setFeedbackMsg(null);
    try {
      const candidates = await promotionService.getEligibleStudents(yearFrom, kelasFrom, yearTo);
      setStudents(candidates);
      if (candidates.length === 0) {
        showFeedback('error', 'Tidak ada siswa aktif ditemukan di kelas dan tahun asal tersebut.');
      }
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal memuat siswa.');
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Decision Handlers
  const handleDecisionChange = (studentId: string, decision: PromotionDecision) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, decision } : s))
    );
  };

  const handleMassAction = (decision: PromotionDecision) => {
    setStudents((prev) => prev.map((s) => ({ ...s, decision })));
  };

  // Execute Batch
  const handleExecuteBatch = async () => {
    if (!yearFrom || !yearTo || students.length === 0) return;

    setIsProcessing(true);
    try {
      const payload = {
        academic_year_from: yearFrom,
        academic_year_to: yearTo,
        kelas_from: kelasFrom,
        decisions: students.map((s) => ({
          student_id: s.student_id,
          decision: s.decision,
        })),
      };

      const result = await promotionService.executePromotionBatch(payload, user?.email);
      showFeedback('success', result.message);
      setIsReviewModalOpen(false);
      // Reload students to clear processed list
      setStudents([]);
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal memproses kenaikan kelas.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedYearFromObj = academicYears.find((y) => y.id === yearFrom);
  const selectedYearToObj = academicYears.find((y) => y.id === yearTo);

  return (
    <div className="page-container">
      {feedbackMsg && (
        <div className={`feedback-banner ${feedbackMsg.type === 'success' ? 'success-banner' : 'error-banner'}`}>
          {feedbackMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="title-with-icon">
            <TrendingUp size={22} className="text-primary" />
            <h1 className="page-title">Proses Kenaikan Kelas</h1>
          </div>
          <p className="page-subtitle">
            Proses batch kenaikan atau tinggal kelas siswa SD (Kelas 1–5) ke periode tahun ajaran baru.
          </p>
        </div>

        <div className="page-actions-group">
          <button
            type="button"
            onClick={loadAcademicYears}
            className="btn-secondary"
            disabled={isInitialLoading || isLoadingStudents}
            title="Muat Ulang Konfigurasi"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          {students.length > 0 && (
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="btn-primary"
              disabled={isProcessing}
            >
              <CheckCircle2 size={16} />
              <span>Review & Proses ({students.length} Siswa)</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Configuration Filter Card */}
      <PromotionConfigCard
        academicYears={academicYears}
        yearFrom={yearFrom}
        yearTo={yearTo}
        kelasFrom={kelasFrom}
        isLoading={isInitialLoading || isLoadingStudents}
        onYearFromChange={(id) => {
          setYearFrom(id);
          setStudents([]);
        }}
        onYearToChange={(id) => {
          setYearTo(id);
          setStudents([]);
        }}
        onKelasFromChange={(k) => {
          setKelasFrom(k);
          setStudents([]);
        }}
        onLoadStudents={handleLoadStudents}
      />

      {/* 2. Candidate Students Table */}
      {students.length > 0 && (
        <div className="section-card">
          <PromotionStudentTable
            students={students}
            isLoading={isLoadingStudents}
            kelasFrom={kelasFrom}
            onDecisionChange={handleDecisionChange}
            onMassAction={handleMassAction}
          />
        </div>
      )}

      {/* 3. Review & Confirmation Modal */}
      {selectedYearFromObj && selectedYearToObj && (
        <PromotionReviewModal
          isOpen={isReviewModalOpen}
          yearFrom={selectedYearFromObj}
          yearTo={selectedYearToObj}
          kelasFrom={kelasFrom}
          students={students}
          isProcessing={isProcessing}
          onClose={() => setIsReviewModalOpen(false)}
          onConfirm={handleExecuteBatch}
        />
      )}
    </div>
  );
};
