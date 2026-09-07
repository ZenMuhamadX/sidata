import React from 'react';
import { CheckCircle2, AlertTriangle, Users, User, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ImportResultSummary } from '../types/import.types';

interface ImportResultViewProps {
  result: ImportResultSummary;
  onReset: () => void;
}

export const ImportResultView: React.FC<ImportResultViewProps> = ({ result, onReset }) => {
  const navigate = useNavigate();

  return (
    <div className="import-container">
      <div className="section-card">
        <div className="section-header">
          <div className="title-with-icon">
            <CheckCircle2 size={20} style={{ color: '#047857' }} />
            <h3 className="section-title">Hasil Proses Import Data Excel</h3>
          </div>
          <p className="text-xs text-muted mt-1">
            Data siswa dan relasi orang tua berhasil diproses ke database sekolah.
          </p>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div className="result-success-grid">
            <div className="result-card-box">
              <span className="text-xs text-muted">Siswa Berhasil Diimpor</span>
              <div className="flex items-center gap-2 mt-1">
                <Users size={18} style={{ color: '#047857' }} />
                <span className="font-semibold text-lg" style={{ color: '#047857' }}>
                  {result.studentsCount} Data
                </span>
              </div>
            </div>

            <div className="result-card-box">
              <span className="text-xs text-muted">Data Ayah Terhubung</span>
              <div className="flex items-center gap-2 mt-1">
                <User size={18} className="text-primary" />
                <span className="font-semibold text-lg text-main">
                  {result.fatherCount} Data
                </span>
              </div>
            </div>

            <div className="result-card-box">
              <span className="text-xs text-muted">Data Ibu Terhubung</span>
              <div className="flex items-center gap-2 mt-1">
                <User size={18} className="text-primary" />
                <span className="font-semibold text-lg text-main">
                  {result.motherCount} Data
                </span>
              </div>
            </div>

            {result.failedCount > 0 && (
              <div className="result-card-box" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                <span className="text-xs text-danger">Gagal Diimpor</span>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle size={18} style={{ color: '#b91c1c' }} />
                  <span className="font-semibold text-lg" style={{ color: '#b91c1c' }}>
                    {result.failedCount} Baris
                  </span>
                </div>
              </div>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="callout-danger mt-4">
              <p className="font-semibold text-sm mb-1">Daftar Baris yang Gagal:</p>
              <ul className="text-xs" style={{ listStyle: 'disc', marginLeft: '1.25rem' }}>
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.25rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onReset}
          >
            <RotateCcw size={16} />
            <span>Impor File Lain</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/siswa')}
          >
            <span>Lihat Data Siswa</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
