import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { AdmissionFilters, AdmissionStatus } from '../types/admission.types';
import type { AcademicYear } from '../../academic/types/academic.types';

interface AdmissionFiltersBarProps {
  filters: AdmissionFilters;
  academicYears: AcademicYear[];
  onChange: (newFilters: Partial<AdmissionFilters>) => void;
}

export const AdmissionFiltersBar: React.FC<AdmissionFiltersBarProps> = ({
  filters,
  academicYears,
  onChange,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onChange({ search: searchInput, page: 1 });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onChange]);

  const handleClearSearch = () => {
    setSearchInput('');
    onChange({ search: '', page: 1 });
  };

  return (
    <div className="filters-container">
      {/* Search Input */}
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama calon siswa, NIK, NISN..."
          className="search-input"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="search-clear-btn"
            title="Hapus pencarian"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="filter-controls">
        {/* Filter Tahun Ajaran */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-tahun" className="filter-label">
            Tahun Ajaran:
          </label>
          <select
            id="filter-tahun"
            value={filters.academic_year_id || 'all'}
            onChange={(e) =>
              onChange({
                academic_year_id: e.target.value,
                page: 1,
              })
            }
            className="filter-select"
          >
            <option value="all">Semua Tahun Ajaran</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.tahun_ajaran} {ay.status === 'active' ? '(Aktif)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-status" className="filter-label">
            Status:
          </label>
          <select
            id="filter-status"
            value={filters.status || 'all'}
            onChange={(e) =>
              onChange({
                status: e.target.value as AdmissionStatus | 'all',
                page: 1,
              })
            }
            className="filter-select"
          >
            <option value="all">Semua Status</option>
            <option value="candidate">Calon (Candidate)</option>
            <option value="accepted">Diterima (Accepted)</option>
            <option value="enrolled">Terdaftar (Enrolled)</option>
            <option value="rejected">Ditolak (Rejected)</option>
            <option value="cancelled">Dibatalkan (Cancelled)</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {(filters.search || filters.academic_year_id !== 'all' || filters.status !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              onChange({
                search: '',
                academic_year_id: 'all',
                status: 'all',
                page: 1,
              });
            }}
            className="btn-secondary btn-sm"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
};
