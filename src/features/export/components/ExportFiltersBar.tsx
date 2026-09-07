import React from 'react';
import { Search } from 'lucide-react';
import type { ExportFilters } from '../types/export.types';
import type { StatusSiswa } from '../../../types/database';

interface ExportFiltersBarProps {
  filters: ExportFilters;
  onChange: (newFilters: Partial<ExportFilters>) => void;
  onReset: () => void;
}

export const ExportFiltersBar: React.FC<ExportFiltersBarProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="filters-container">
      {/* Search Input */}
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Cari nama siswa, NIK, NISN, atau no registrasi akta..."
          className="search-input"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="filter-controls">
        {/* Filter Kelas */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-export-kelas" className="filter-label">
            Kelas:
          </label>
          <select
            id="filter-export-kelas"
            value={filters.kelas}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              onChange({ kelas: val });
            }}
            className="filter-select"
          >
            <option value="all">Semua Kelas</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-export-status" className="filter-label">
            Status:
          </label>
          <select
            id="filter-export-status"
            value={filters.status_siswa}
            onChange={(e) => {
              const val = e.target.value as StatusSiswa | 'all';
              onChange({ status_siswa: val });
            }}
            className="filter-select"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="tidak_aktif">Tidak Aktif</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary btn-reset"
          title="Reset semua filter"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
