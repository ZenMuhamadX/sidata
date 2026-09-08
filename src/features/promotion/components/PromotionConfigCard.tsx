import React from 'react';
import { ArrowRight, Filter } from 'lucide-react';
import type { AcademicYear } from '../../academic/types/academic.types';

interface PromotionConfigCardProps {
  academicYears: AcademicYear[];
  yearFrom: string;
  yearTo: string;
  kelasFrom: number;
  isLoading: boolean;
  onYearFromChange: (id: string) => void;
  onYearToChange: (id: string) => void;
  onKelasFromChange: (kelas: number) => void;
  onLoadStudents: () => void;
}

export const PromotionConfigCard: React.FC<PromotionConfigCardProps> = ({
  academicYears,
  yearFrom,
  yearTo,
  kelasFrom,
  isLoading,
  onYearFromChange,
  onYearToChange,
  onKelasFromChange,
  onLoadStudents,
}) => {
  const selectedYearFrom = academicYears.find((y) => y.id === yearFrom);
  const selectedYearTo = academicYears.find((y) => y.id === yearTo);

  // Available target years must be chronologically after the selected source year
  const availableTargetYears = academicYears.filter((y) => {
    if (!selectedYearFrom) return true;
    return y.tahun_ajaran > selectedYearFrom.tahun_ajaran;
  });

  const isConfigValid = Boolean(
    yearFrom &&
    yearTo &&
    yearFrom !== yearTo &&
    kelasFrom >= 1 &&
    kelasFrom <= 5 &&
    selectedYearFrom &&
    selectedYearTo &&
    selectedYearTo.tahun_ajaran > selectedYearFrom.tahun_ajaran
  );

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="title-with-icon">
          <Filter size={18} className="text-primary" />
          <h2 className="section-title">Konfigurasi Periode Kenaikan Kelas</h2>
        </div>
      </div>

      <div className="promotion-config-body">
        <div className="form-grid">
          {/* Tahun Ajaran Asal */}
          <div className="form-group">
            <label htmlFor="year-from">
              Tahun Ajaran Asal <span className="required-star">*</span>
            </label>
            <select
              id="year-from"
              value={yearFrom}
              onChange={(e) => onYearFromChange(e.target.value)}
              disabled={isLoading}
            >
              <option value="">-- Pilih Tahun Asal --</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.tahun_ajaran} {ay.status === 'active' ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
            <span className="form-hint">Periode asal riwayat siswa yang akan diproses</span>
          </div>

          {/* Kelas Asal (1-5 SAJA) */}
          <div className="form-group">
            <label htmlFor="kelas-from">
              Kelas Asal <span className="required-star">*</span>
            </label>
            <select
              id="kelas-from"
              value={kelasFrom}
              onChange={(e) => onKelasFromChange(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value={1}>Kelas 1 (Naik ke Kelas 2)</option>
              <option value={2}>Kelas 2 (Naik ke Kelas 3)</option>
              <option value={3}>Kelas 3 (Naik ke Kelas 4)</option>
              <option value={4}>Kelas 4 (Naik ke Kelas 5)</option>
              <option value={5}>Kelas 5 (Naik ke Kelas 6)</option>
            </select>
            <span className="form-hint">Kelas 6 tidak dapat diproses (kelulusan di Stage 14)</span>
          </div>

          {/* Tahun Ajaran Tujuan */}
          <div className="form-group">
            <label htmlFor="year-to">
              Tahun Ajaran Tujuan <span className="required-star">*</span>
            </label>
            <select
              id="year-to"
              value={yearTo}
              onChange={(e) => onYearToChange(e.target.value)}
              disabled={isLoading || !yearFrom}
            >
              <option value="">-- Pilih Tahun Tujuan --</option>
              {availableTargetYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.tahun_ajaran} {ay.status === 'active' ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
            <span className="form-hint">Harus periode setelah tahun asal</span>
          </div>
        </div>

        <div className="config-card-footer">
          <div className="config-target-info">
            {selectedYearFrom && selectedYearTo && (
              <span className="config-target-highlight">
                Target: Kelas {kelasFrom} ({selectedYearFrom.tahun_ajaran}) <ArrowRight size={14} /> Kelas {kelasFrom + 1} ({selectedYearTo.tahun_ajaran})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onLoadStudents}
            disabled={!isConfigValid || isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Memuat...' : 'Tampilkan Daftar Siswa'}
          </button>
        </div>
      </div>
    </div>
  );
};
