import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, UploadCloud } from 'lucide-react';
import type { ParsedRowData, ValidationSummary } from '../types/import.types';

interface ImportPreviewTableProps {
  rows: ParsedRowData[];
  summary: ValidationSummary;
  onConfirmImport: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  rows,
  summary,
  onConfirmImport,
  onBack,
  isLoading,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'invalid' | 'warning'>('all');

  const filteredRows = rows.filter((r) => {
    if (filterMode === 'valid') return r.isValid;
    if (filterMode === 'invalid') return !r.isValid;
    if (filterMode === 'warning') return r.warnings.length > 0;
    return true;
  });

  return (
    <div className="import-container">
      {/* Summary Stats Grid */}
      <div className="import-stats-grid">
        <div className="import-stat-box">
          <span className="import-stat-label">Total Sheet</span>
          <span className="import-stat-val">{summary.totalSheets}</span>
        </div>
        <div className="import-stat-box">
          <span className="import-stat-label">Total Baris</span>
          <span className="import-stat-val">{summary.totalRows}</span>
        </div>
        <div className="import-stat-box">
          <span className="import-stat-label">Siap Import (Valid)</span>
          <span className="import-stat-val stat-val-valid">{summary.validRows}</span>
        </div>
        <div className="import-stat-box">
          <span className="import-stat-label">Error Validasi</span>
          <span className="import-stat-val stat-val-error">{summary.errorRows}</span>
        </div>
        <div className="import-stat-box">
          <span className="import-stat-label">Peringatan</span>
          <span className="import-stat-val stat-val-warning">{summary.warningCount}</span>
        </div>
        <div className="import-stat-box">
          <span className="import-stat-label">Duplikasi</span>
          <span className="import-stat-val stat-val-error">{summary.duplicateCount}</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="section-card">
        <div className="section-header flex-between">
          <div>
            <h3 className="section-title">Pratinjau & Hasil Validasi Data Siswa</h3>
            <p className="text-xs text-muted mt-1">
              Hanya baris dengan status valid yang akan diimpor ke sistem. Baris dengan kesalahan akan dilewati.
            </p>
          </div>

          <div className="filter-controls">
            <button
              type="button"
              className={`btn-secondary btn-sm ${filterMode === 'all' ? 'active font-bold' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              Semua ({rows.length})
            </button>
            <button
              type="button"
              className={`btn-secondary btn-sm ${filterMode === 'valid' ? 'active font-bold' : ''}`}
              onClick={() => setFilterMode('valid')}
            >
              Valid ({summary.validRows})
            </button>
            <button
              type="button"
              className={`btn-secondary btn-sm ${filterMode === 'invalid' ? 'active font-bold' : ''}`}
              onClick={() => setFilterMode('invalid')}
            >
              Error ({summary.errorRows})
            </button>
            <button
              type="button"
              className={`btn-secondary btn-sm ${filterMode === 'warning' ? 'active font-bold' : ''}`}
              onClick={() => setFilterMode('warning')}
            >
              Peringatan ({summary.warningCount})
            </button>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: '550px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sheet</th>
                <th>Kelas</th>
                <th>Nama Siswa</th>
                <th>NIK</th>
                <th>NISN</th>
                <th>JK</th>
                <th>Tgl Lahir</th>
                <th>Orang Tua</th>
                <th>Status Validasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-muted">
                    Tidak ada baris pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, i) => (
                  <tr key={`${r.sheetName}-${r.rowIndex}-${i}`}>
                    <td className="text-xs font-mono">{r.sheetName}</td>
                    <td>
                      <span className="badge-kelas">Kelas {r.kelas}</span>
                    </td>
                    <td className="font-semibold text-main">{r.nama}</td>
                    <td className="font-mono text-sm">{r.nik || '-'}</td>
                    <td className="font-mono text-sm">{r.nisn || '-'}</td>
                    <td>
                      {r.jenis_kelamin ? (
                        <span className="badge-jk">{r.jenis_kelamin}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="text-xs">{r.tanggal_lahir || '-'}</td>
                    <td className="text-xs">
                      {r.father?.nama ? `A: ${r.father.nama}` : ''}
                      {r.father?.nama && r.mother?.nama ? ' | ' : ''}
                      {r.mother?.nama ? `I: ${r.mother.nama}` : ''}
                      {!r.father?.nama && !r.mother?.nama ? '-' : ''}
                    </td>
                    <td>
                      {r.isValid ? (
                        <span className="preview-status-valid">
                          <CheckCircle2 size={14} />
                          <span>Valid</span>
                        </span>
                      ) : (
                        <div>
                          <span className="preview-status-invalid">
                            <XCircle size={14} />
                            <span>Error</span>
                          </span>
                          <ul className="preview-errors-list">
                            {r.errors.map((err, errIdx) => (
                              <li key={errIdx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {r.warnings.length > 0 && (
                        <ul className="preview-warnings-list">
                          {r.warnings.map((w, wIdx) => (
                            <li key={wIdx}>
                              <AlertTriangle size={11} style={{ display: 'inline', marginRight: 3 }} />
                              {w}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.25rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirmImport}
            disabled={isLoading || summary.validRows === 0}
          >
            <UploadCloud size={16} />
            <span>
              Impor {summary.validRows} Siswa Valid Sekarang
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
