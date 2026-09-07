import React from 'react';
import { Search } from 'lucide-react';
import type { DocumentFilters } from '../types/document.types';

interface DocumentFiltersBarProps {
  filters: DocumentFilters;
  onFilterChange: (newFilters: Partial<DocumentFilters>) => void;
  onReset: () => void;
}

export const DocumentFiltersBar: React.FC<DocumentFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="filters-container">
      {/* Search Bar */}
      <div className="search-box">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Cari nama siswa, NIK, atau NISN..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="search-input"
        />
      </div>

      {/* Filter Options */}
      <div className="filter-controls">
        {/* Kelas */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-kelas" className="filter-label">
            Kelas:
          </label>
          <select
            id="filter-kelas"
            value={filters.kelas ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                kelas: e.target.value === 'all' ? 'all' : Number(e.target.value),
              })
            }
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

        {/* Status Siswa */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-status" className="filter-label">
            Status:
          </label>
          <select
            id="filter-status"
            value={filters.status_siswa ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                status_siswa: e.target.value as 'all' | 'aktif' | 'tidak_aktif',
              })
            }
            className="filter-select"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="tidak_aktif">Tidak Aktif</option>
          </select>
        </div>

        {/* Status Kelengkapan Dokumen */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-completeness" className="filter-label">
            Kelengkapan:
          </label>
          <select
            id="filter-completeness"
            value={filters.completeness ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                completeness: e.target.value as 'all' | 'lengkap' | 'belum_lengkap',
              })
            }
            className="filter-select"
          >
            <option value="all">Semua</option>
            <option value="lengkap">Lengkap (4/4)</option>
            <option value="belum_lengkap">Belum Lengkap</option>
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
