import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StudentPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const StudentPagination: React.FC<StudentPaginationProps> = ({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}) => {
  if (total === 0) return null;

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Menampilkan <strong>{startIdx}–{endIdx}</strong> dari <strong>{total}</strong> siswa
      </div>

      <div className="pagination-actions">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary pagination-btn"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
          <span>Sebelumnya</span>
        </button>

        <span className="pagination-page-indicator">
          Halaman {page} dari {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary pagination-btn"
          aria-label="Halaman selanjutnya"
        >
          <span>Selanjutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
