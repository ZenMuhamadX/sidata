import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { ParentFilters } from '../types/parent.types';
import type { ParentHubungan, StatusSiswa } from '../../../types/database';

interface ParentFiltersBarProps {
  filters: ParentFilters;
  onChange: (newFilters: Partial<ParentFilters>) => void;
}

export const ParentFiltersBar: React.FC<ParentFiltersBarProps> = ({ filters, onChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search 400ms
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
          placeholder="Cari nama orang tua, NIK, atau nama siswa..."
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
        {/* Hubungan */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-hubungan" className="filter-label">
            Hubungan:
          </label>
          <select
            id="filter-hubungan"
            value={filters.hubungan ?? 'all'}
            onChange={(e) => {
              const val = e.target.value as ParentHubungan | 'all';
              onChange({ hubungan: val, page: 1 });
            }}
            className="filter-select"
          >
            <option value="all">Semua Hubungan</option>
            <option value="ayah">Ayah</option>
            <option value="ibu">Ibu</option>
          </select>
        </div>

        {/* Kelas Siswa */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-parent-kelas" className="filter-label">
            Kelas:
          </label>
          <select
            id="filter-parent-kelas"
            value={filters.kelas ?? 'all'}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              onChange({ kelas: val, page: 1 });
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

        {/* Status Siswa */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-parent-status" className="filter-label">
            Status Siswa:
          </label>
          <select
            id="filter-parent-status"
            value={filters.status_siswa ?? 'aktif'}
            onChange={(e) => {
              const val = e.target.value as StatusSiswa | 'all';
              onChange({ status_siswa: val, page: 1 });
            }}
            className="filter-select"
          >
            <option value="aktif">Siswa Aktif</option>
            <option value="tidak_aktif">Siswa Tidak Aktif</option>
            <option value="all">Semua Status</option>
          </select>
        </div>

        {/* Per Page */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-parent-size" className="filter-label">
            Tampil:
          </label>
          <select
            id="filter-parent-size"
            value={filters.pageSize}
            onChange={(e) => onChange({ pageSize: Number(e.target.value), page: 1 })}
            className="filter-select"
          >
            <option value="10">10 data</option>
            <option value="20">20 data</option>
            <option value="50">50 data</option>
          </select>
        </div>
      </div>
    </div>
  );
};
