import type { AcademicYearFormData, AcademicYearStatus } from '../types/academic.types';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

/**
 * Validates Academic Year form data.
 * Format requirement: strictly YYYY/YYYY (e.g., 2026/2027)
 * Logical check: Year 2 must equal Year 1 + 1.
 */
export function validateAcademicYearForm(data: AcademicYearFormData): ValidationResult<AcademicYearFormData> {
  const errors: Partial<Record<keyof AcademicYearFormData, string>> = {};

  const rawTahun = (data.tahun_ajaran || '').trim();

  if (!rawTahun) {
    errors.tahun_ajaran = 'Tahun ajaran wajib diisi.';
  } else {
    // Regex exact match YYYY/YYYY
    const regex = /^([0-9]{4})\/([0-9]{4})$/;
    const match = rawTahun.match(regex);

    if (!match) {
      errors.tahun_ajaran = 'Format tahun ajaran harus YYYY/YYYY (contoh: 2026/2027).';
    } else {
      const year1 = parseInt(match[1], 10);
      const year2 = parseInt(match[2], 10);

      if (year2 !== year1 + 1) {
        errors.tahun_ajaran = `Tahun ajaran tidak valid. Contoh yang benar: ${year1}/${year1 + 1}.`;
      }
    }
  }

  const validStatuses: AcademicYearStatus[] = ['active', 'completed'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.status = 'Status tahun ajaran harus "active" atau "completed".';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Helper to test if a string matches YYYY/YYYY format
 */
export function isValidAcademicYearFormat(tahunAjaran: string): boolean {
  const regex = /^([0-9]{4})\/([0-9]{4})$/;
  const match = (tahunAjaran || '').trim().match(regex);
  if (!match) return false;
  const y1 = parseInt(match[1], 10);
  const y2 = parseInt(match[2], 10);
  return y2 === y1 + 1;
}
