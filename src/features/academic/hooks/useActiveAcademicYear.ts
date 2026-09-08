import { useState, useEffect, useCallback } from 'react';
import { academicYearService } from '../services/academicYear.service';
import type { AcademicYear } from '../types/academic.types';

export interface UseActiveAcademicYearResult {
  activeYear: AcademicYear | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Centralized hook for accessing the active academic year.
 * Prevents redundant querying across components.
 */
export function useActiveAcademicYear(): UseActiveAcademicYearResult {
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveYear = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const year = await academicYearService.getActiveAcademicYear();
      setActiveYear(year);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat tahun ajaran aktif.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveYear();
  }, [fetchActiveYear]);

  return {
    activeYear,
    isLoading,
    error,
    refetch: fetchActiveYear,
  };
}
