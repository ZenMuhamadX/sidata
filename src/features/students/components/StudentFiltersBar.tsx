import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { StudentFilters, StudentSortField } from '../types/student.types';
import type { StatusSiswa } from '../../../types/database';

interface StudentFiltersBarProps {
  filters: StudentFilters;
  onChange: (newFilters: Partial<StudentFilters>) => void;
}

export const StudentFiltersBar: React.FC<StudentFiltersBarProps> = ({ filters, onChange }) => {
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
          placeholder="Cari nama, NIK, NISN, atau no registrasi..."
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
        {/* Filter Kelas */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-kelas" className="filter-label">
            Kelas:
          </label>
          <select
            id="filter-kelas"
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

        {/* Filter Status */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-status" className="filter-label">
            Status:
          </label>
          <select
            id="filter-status"
            value={filters.status_siswa ?? 'aktif'}
            onChange={(e) => {
              const val = e.target.value as StatusSiswa | 'all';
              onChange({ status_siswa: val, page: 1 });
            }}
            className="filter-select"
          >
            <option value="aktif">Aktif</option>
            <option value="tidak_aktif">Tidak Aktif</option>
            <option value="all">Semua Status</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-sort" className="filter-label">
            Urutkan:
          </label>
          <select
            id="filter-sort"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [StudentSortField, 'asc' | 'desc'];
              onChange({ sortBy: field, sortOrder: order, page: 1 });
            }}
            className="filter-select"
          >
            <option value="nama-asc">Nama (A - Z)</option>
            <option value="nama-desc">Nama (Z - A)</option>
            <option value="kelas-asc">Kelas (1 - 6)</option>
            <option value="kelas-desc">Kelas (6 - 1)</option>
            <option value="status_siswa-asc">Status (Aktif dulu)</option>
          </select>
        </div>

        {/* Page Size */}
        <div className="filter-select-wrap">
          <label htmlFor="filter-size" className="filter-label">
            Tampil:
          </label>
          <select
            id="filter-size"
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
