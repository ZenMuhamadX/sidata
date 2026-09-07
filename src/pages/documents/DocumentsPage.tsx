import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { DocumentFiltersBar } from '../../features/documents/components/DocumentFiltersBar';
import { DocumentChecklistTable } from '../../features/documents/components/DocumentChecklistTable';
import { StudentPagination } from '../../features/students/components/StudentPagination';
import { documentService } from '../../features/documents/services/document.service';
import type {
  DocumentFilters,
  DocumentListResult,
} from '../../features/documents/types/document.types';

export const DocumentsPage: React.FC = () => {
  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    kelas: 'all',
    status_siswa: 'all',
    completeness: 'all',
    page: 1,
    pageSize: 20,
  });

  const [result, setResult] = useState<DocumentListResult>({
    students: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocumentChecklist(filters);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat status dokumen.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset ke halaman 1 saat filter berubah
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      kelas: 'all',
      status_siswa: 'all',
      completeness: 'all',
      page: 1,
      pageSize: 20,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleOpenDocument = async (storagePath: string) => {
    try {
      const signedUrl = await documentService.getSignedUrl(storagePath);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuka dokumen.');
    }
  };

  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dokumen Siswa</h1>
          <p className="page-subtitle">
            Pantau dan kelola kelengkapan berkas fisik siswa (KK, Akta Lahir, KTP Orang Tua)
          </p>
        </div>
      </div>

      {/* Error state if query fails */}
      {error && (
        <div className="feedback-banner error-banner mb-4">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Section Card */}
      <div className="section-card">
        {/* Filter and Search Bar */}
        <DocumentFiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Table */}
        <DocumentChecklistTable
          data={result.students}
          isLoading={isLoading}
          onOpenDocument={handleOpenDocument}
        />

        {/* Server-side Pagination */}
        {!isLoading && result.students.length > 0 && (
          <StudentPagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            totalPages={result.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};
