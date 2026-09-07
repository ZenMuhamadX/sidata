import React, { useState, useEffect, useCallback } from 'react';
import { Download, FileSpreadsheet, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { exportService } from '../../features/export/services/export.service';
import { ExportFiltersBar } from '../../features/export/components/ExportFiltersBar';
import type {
  ExportFilters,
  StudentWithParentsExport,
  ExportSummaryStats,
} from '../../features/export/types/export.types';

export const ExportPage: React.FC = () => {
  const [filters, setFilters] = useState<ExportFilters>({
    status_siswa: 'all',
    kelas: 'all',
    search: '',
  });

  const [previewData, setPreviewData] = useState<StudentWithParentsExport[]>([]);
  const [stats, setStats] = useState<ExportSummaryStats>({
    total: 0,
    active: 0,
    inactive: 0,
    classCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  });

  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ambil data untuk preview tabel
  const fetchPreviewData = useCallback(async () => {
    setIsLoadingPreview(true);
    setErrorMsg(null);
    try {
      const data = await exportService.getExportData(filters);
      setPreviewData(data);
      setStats(exportService.calculateStats(data));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat data pratinjau export.');
    } finally {
      setIsLoadingPreview(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPreviewData();
  }, [fetchPreviewData]);

  const handleFilterChange = (newFilters: Partial<ExportFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      status_siswa: 'all',
      kelas: 'all',
      search: '',
    });
  };

  // Export berdasarkan filter aktif
  const handleExportFiltered = async () => {
    if (previewData.length === 0) {
      setErrorMsg('Tidak ada data yang sesuai dengan filter.');
      return;
    }

    setIsExporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Selalu query ulang seluruh data sesuai filter agar tidak terpengaruh batas apa pun
      const fullData = await exportService.getExportData(filters);
      if (fullData.length === 0) {
        setErrorMsg('Tidak ada data yang sesuai dengan filter.');
        return;
      }

      const fileName = exportService.generateFileName(filters);
      exportService.generateExcel(fullData, fileName);
      setSuccessMsg(`Berhasil mengekspor ${fullData.length} data siswa ke "${fileName}".`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Export gagal. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export Semua tanpa filter
  const handleExportAll = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const allData = await exportService.getExportData();
      if (allData.length === 0) {
        setErrorMsg('Database siswa kosong. Tidak ada data untuk diekspor.');
        return;
      }

      const fileName = exportService.generateFileName();
      exportService.generateExcel(allData, fileName);
      setSuccessMsg(`Berhasil mengekspor seluruh ${allData.length} data siswa ke "${fileName}".`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Export gagal. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header Page */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Export Data Siswa (Excel)</h1>
          <p className="page-subtitle">
            Unduh seluruh data induk siswa dan orang tua ke berkas spreadsheet (.xlsx)
          </p>
        </div>

        <div className="detail-action-buttons">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportAll}
            disabled={isExporting || isLoadingPreview}
            title="Download seluruh data siswa tanpa filter"
          >
            <FileSpreadsheet size={16} />
            <span>Export Semua Data</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleExportFiltered}
            disabled={isExporting || isLoadingPreview || previewData.length === 0}
            title="Download data siswa sesuai filter saat ini"
          >
            {isExporting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Mengekspor...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Export Sesuai Filter ({previewData.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifikasi Sukses / Error */}
      {successMsg && (
        <div className="feedback-banner success-banner mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="feedback-banner error-banner mb-3 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Statistik Ringkas Data */}
      <div className="stats-grid mb-3">
        <div className="stat-card">
          <span className="stat-label">Total Sesuai Filter</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Siswa Aktif</span>
          <span className="stat-value" style={{ color: '#047857' }}>
            {stats.active}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tidak Aktif</span>
          <span className="stat-value" style={{ color: '#64748b' }}>
            {stats.inactive}
          </span>
        </div>
      </div>

      {/* Main Container Card dengan Filter & Pratinjau */}
      <div className="section-card">
        <ExportFiltersBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Tabel Pratinjau */}
        {isLoadingPreview ? (
          <div className="table-loading-container">
            <div className="spinner"></div>
            <p>Memuat data pratinjau...</p>
          </div>
        ) : previewData.length === 0 ? (
          <div className="table-empty-container">
            <p className="empty-title">Tidak ada data yang sesuai dengan filter.</p>
            <p className="empty-desc">
              Coba sesuaikan kata kunci pencarian atau ubah pilihan filter kelas dan status.
            </p>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Siswa</th>
                  <th>Kelas</th>
                  <th>NIK</th>
                  <th>NISN</th>
                  <th>JK</th>
                  <th>Tanggal Lahir</th>
                  <th>Nama Ayah</th>
                  <th>Nama Ibu</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((s, idx) => (
                  <tr key={`${s.nik}-${idx}`}>
                    <td className="text-secondary text-xs">{idx + 1}</td>
                    <td className="font-semibold text-main">{s.nama}</td>
                    <td>
                      <span className="badge-kelas">Kelas {s.kelas}</span>
                    </td>
                    <td className="font-mono text-xs">{s.nik}</td>
                    <td className="font-mono text-xs">{s.nisn || '-'}</td>
                    <td>
                      <span className="badge-jk">{s.jenis_kelamin}</span>
                    </td>
                    <td className="text-xs">
                      {exportService.formatTanggalLahir(s.tanggal_lahir)}
                    </td>
                    <td className="text-xs">{s.nama_ayah || '-'}</td>
                    <td className="text-xs">{s.nama_ibu || '-'}</td>
                    <td>
                      <span
                        className={
                          s.status_siswa === 'aktif'
                            ? 'status-badge-active'
                            : 'status-badge-inactive'
                        }
                      >
                        {s.status_siswa === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer flex-between">
          <span className="pagination-info">
            Menampilkan {previewData.length} data yang siap diekspor (35 kolom lengkap pada berkas .xlsx)
          </span>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={fetchPreviewData}
            disabled={isLoadingPreview}
            title="Muat ulang data dari database"
          >
            <RefreshCw size={13} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
