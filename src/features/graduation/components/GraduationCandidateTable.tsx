import React, { useMemo } from 'react';
import { Search, X, CheckSquare, Square, GraduationCap } from 'lucide-react';
import type { GraduationCandidateStudent } from '../types/graduation.types';

interface GraduationCandidateTableProps {
  candidates: GraduationCandidateStudent[];
  selectedStudentIds: Set<string>;
  searchQuery: string;
  isLoading: boolean;
  isProcessing: boolean;
  onSearchChange: (query: string) => void;
  onToggleSelect: (studentId: string) => void;
  onToggleSelectAll: () => void;
  onOpenConfirmModal: () => void;
}

export const GraduationCandidateTable: React.FC<GraduationCandidateTableProps> = ({
  candidates,
  selectedStudentIds,
  searchQuery,
  isLoading,
  isProcessing,
  onSearchChange,
  onToggleSelect,
  onToggleSelectAll,
  onOpenConfirmModal,
}) => {
  // Filter candidates by search query
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const q = searchQuery.toLowerCase().trim();
    return candidates.filter((item) => {
      const name = item.student.nama.toLowerCase();
      const nik = item.student.nik.toLowerCase();
      const nisn = (item.student.nisn || '').toLowerCase();
      return name.includes(q) || nik.includes(q) || nisn.includes(q);
    });
  }, [candidates, searchQuery]);

  const isAllFilteredSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((item) => selectedStudentIds.has(item.student_id));

  const selectedCount = selectedStudentIds.size;

  return (
    <div className="section-card">
      {/* Search & Actions Toolbar */}
      <div className="filters-container">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama siswa kelas 6, NIK, atau NISN..."
            className="search-input"
            disabled={isLoading || isProcessing}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="search-clear-btn"
              title="Hapus pencarian"
              disabled={isLoading || isProcessing}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Selection Summary Toolbar */}
      <div className="promotion-table-toolbar">
        <div className="promotion-stats-group">
          <button
            type="button"
            onClick={onToggleSelectAll}
            disabled={isLoading || isProcessing || filteredCandidates.length === 0}
            className="btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isAllFilteredSelected ? <CheckSquare size={15} className="text-primary" /> : <Square size={15} />}
            <span>{isAllFilteredSelected ? 'Batalkan Semua' : 'Pilih Semua'}</span>
          </button>

          <span className="promotion-stat-item">
            Total Kelas 6: <strong>{candidates.length}</strong>
          </span>
          <span className="promotion-stat-item promotion-stat-success">
            Terpilih: <strong>{selectedCount}</strong> siswa
          </span>
        </div>

        <div className="promotion-actions-group">
          <button
            type="button"
            onClick={onOpenConfirmModal}
            disabled={selectedCount === 0 || isLoading || isProcessing}
            className="btn-primary"
            title="Luluskan siswa yang dipilih"
          >
            <GraduationCap size={16} />
            <span>Luluskan Siswa ({selectedCount})</span>
          </button>
        </div>
      </div>

      {/* Table / Empty / Loading State */}
      {isLoading ? (
        <div className="table-loading-container py-4">
          <div className="spinner"></div>
          <p>Memuat daftar siswa kelas 6...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="table-empty-container">
          <p className="empty-title">
            {searchQuery
              ? 'Siswa tidak ditemukan untuk pencarian ini.'
              : 'Tidak ada siswa Kelas 6 aktif pada tahun ajaran yang dipilih.'}
          </p>
          <p className="empty-desc">
            {searchQuery
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : 'Pastikan siswa memiliki catatan akademik aktif di Kelas 6 pada tahun ajaran ini.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={onToggleSelectAll}
                    disabled={isProcessing}
                    aria-label="Pilih semua siswa di tabel"
                    style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                  />
                </th>
                <th style={{ width: '50px' }}>No</th>
                <th>Nama Siswa</th>
                <th>NIK</th>
                <th>NISN</th>
                <th>Kelas</th>
                <th>Status Akademik</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((item, index) => {
                const isSelected = selectedStudentIds.has(item.student_id);

                return (
                  <tr
                    key={item.student_id}
                    onClick={() => !isProcessing && onToggleSelect(item.student_id)}
                    style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                    className={isSelected ? 'row-has-target-record' : ''}
                  >
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item.student_id)}
                        disabled={isProcessing}
                        aria-label={`Pilih ${item.student.nama}`}
                        style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                      />
                    </td>
                    <td className="text-secondary text-sm">{index + 1}</td>
                    <td>
                      <div className="student-name-cell">
                        <span className="font-semibold text-main">{item.student.nama}</span>
                        <span className="student-subtext">
                          {item.student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{item.student.nik}</td>
                    <td className="font-mono text-sm">{item.student.nisn || '-'}</td>
                    <td>
                      <span className="badge-kelas">Kelas 6</span>
                    </td>
                    <td>
                      <span className="status-badge-active">Aktif</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
