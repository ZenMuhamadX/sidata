import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, RefreshCw } from 'lucide-react';
import { academicYearService } from '../../features/academic/services/academicYear.service';
import { AcademicYearList } from '../../features/academic/components/AcademicYearList';
import { AcademicYearModal } from '../../features/academic/components/AcademicYearModal';
import { AcademicYearConfirmModal } from '../../features/academic/components/AcademicYearConfirmModal';
import type {
  AcademicYearWithCount,
  AcademicYear,
  AcademicYearFormData,
} from '../../features/academic/types/academic.types';

export const AcademicYearsPage: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYearWithCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Confirm Modal (activate / complete / delete)
  const [confirmType, setConfirmType] = useState<'activate' | 'complete' | 'delete' | null>(null);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await academicYearService.getAcademicYears();
      setAcademicYears(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data tahun ajaran.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleCreateSubmit = async (formData: AcademicYearFormData) => {
    setIsSubmitting(true);
    try {
      const created = await academicYearService.createAcademicYear(formData);
      showFeedback('success', `Tahun ajaran ${created.tahun_ajaran} berhasil ditambahkan.`);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal membuat tahun ajaran.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedYear || !confirmType) return;
    setIsProcessing(true);
    try {
      if (confirmType === 'activate') {
        await academicYearService.setActiveAcademicYear(selectedYear.id);
        showFeedback('success', `Tahun ajaran ${selectedYear.tahun_ajaran} sekarang menjadi aktif.`);
      } else if (confirmType === 'complete') {
        await academicYearService.completeAcademicYear(selectedYear.id);
        showFeedback('success', `Tahun ajaran ${selectedYear.tahun_ajaran} berhasil diselesaikan.`);
      } else if (confirmType === 'delete') {
        await academicYearService.deleteAcademicYear(selectedYear.id);
        showFeedback('success', `Tahun ajaran ${selectedYear.tahun_ajaran} berhasil dihapus.`);
      }
      setConfirmType(null);
      setSelectedYear(null);
      fetchData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal memperbarui tahun ajaran.');
    } finally {
      setIsProcessing(false);
    }
  };

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
            <Calendar size={22} className="text-primary" />
            <h1 className="page-title">Manajemen Tahun Ajaran</h1>
          </div>
          <p className="page-subtitle">
            Kelola periode tahun ajaran aktif dan histori tahun ajaran sekolah.
          </p>
        </div>

        <div className="page-actions-group">
          <button
            type="button"
            onClick={fetchData}
            className="btn-secondary"
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Tambah Tahun Ajaran</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="feedback-banner error-banner">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="section-card p-0">
        <AcademicYearList
          academicYears={academicYears}
          isLoading={isLoading}
          onActivate={(ay) => {
            setSelectedYear(ay);
            setConfirmType('activate');
          }}
          onComplete={(ay) => {
            setSelectedYear(ay);
            setConfirmType('complete');
          }}
          onDelete={(ay) => {
            setSelectedYear(ay);
            setConfirmType('delete');
          }}
        />
      </div>

      {/* Create Modal */}
      <AcademicYearModal
        isOpen={isCreateModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Confirm Action Modal */}
      <AcademicYearConfirmModal
        isOpen={Boolean(confirmType && selectedYear)}
        type={confirmType}
        academicYear={selectedYear}
        isProcessing={isProcessing}
        onClose={() => {
          setConfirmType(null);
          setSelectedYear(null);
        }}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};
