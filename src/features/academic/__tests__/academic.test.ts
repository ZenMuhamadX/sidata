import { describe, it, expect } from 'bun:test';
import {
  validateAcademicYearForm,
  isValidAcademicYearFormat,
} from '../validation/academic.validation';
import {
  ACADEMIC_RECORD_STATUS_LABELS,
  ACADEMIC_YEAR_STATUS_LABELS,
} from '../types/academic.types';
import type { AcademicYearFormData } from '../types/academic.types';

describe('Stage 11: Academic Year & Histori Validation Tests', () => {
  describe('validateAcademicYearForm', () => {
    it('passes for valid YYYY/YYYY sequential format (e.g. 2026/2027)', () => {
      const validData: AcademicYearFormData = {
        tahun_ajaran: '2026/2027',
        status: 'active',
      };
      const result = validateAcademicYearForm(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('passes for valid completed status', () => {
      const validData: AcademicYearFormData = {
        tahun_ajaran: '2025/2026',
        status: 'completed',
      };
      const result = validateAcademicYearForm(validData);
      expect(result.isValid).toBe(true);
    });

    it('rejects empty or whitespace-only tahun_ajaran', () => {
      const result = validateAcademicYearForm({
        tahun_ajaran: '   ',
        status: 'active',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.tahun_ajaran).toBeDefined();
    });

    it('rejects invalid hyphen format (e.g. 2026-2027)', () => {
      const result = validateAcademicYearForm({
        tahun_ajaran: '2026-2027',
        status: 'active',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.tahun_ajaran).toContain('YYYY/YYYY');
    });

    it('rejects single year format (e.g. 2026)', () => {
      const result = validateAcademicYearForm({
        tahun_ajaran: '2026',
        status: 'active',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.tahun_ajaran).toContain('YYYY/YYYY');
    });

    it('rejects short year format (e.g. 2026/27)', () => {
      const result = validateAcademicYearForm({
        tahun_ajaran: '2026/27',
        status: 'active',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.tahun_ajaran).toContain('YYYY/YYYY');
    });

    it('rejects non-consecutive years (e.g. 2026/2028 or 2027/2026)', () => {
      const resultGap = validateAcademicYearForm({
        tahun_ajaran: '2026/2028',
        status: 'active',
      });
      expect(resultGap.isValid).toBe(false);

      const resultReverse = validateAcademicYearForm({
        tahun_ajaran: '2027/2026',
        status: 'active',
      });
      expect(resultReverse.isValid).toBe(false);
    });

    it('rejects invalid status', () => {
      const result = validateAcademicYearForm({
        tahun_ajaran: '2026/2027',
        status: 'pending' as any,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.status).toBeDefined();
    });
  });

  describe('isValidAcademicYearFormat helper', () => {
    it('returns true only for strict YYYY/YYYY sequential', () => {
      expect(isValidAcademicYearFormat('2026/2027')).toBe(true);
      expect(isValidAcademicYearFormat('2024/2025')).toBe(true);
      expect(isValidAcademicYearFormat('2026-2027')).toBe(false);
      expect(isValidAcademicYearFormat('2026')).toBe(false);
      expect(isValidAcademicYearFormat('2026/27')).toBe(false);
      expect(isValidAcademicYearFormat('2026/2028')).toBe(false);
    });
  });

  describe('Status Labels mapping', () => {
    it('has Indonesian labels for all 4 academic record statuses', () => {
      expect(ACADEMIC_RECORD_STATUS_LABELS.active).toBe('Aktif');
      expect(ACADEMIC_RECORD_STATUS_LABELS.promoted).toBe('Naik Kelas');
      expect(ACADEMIC_RECORD_STATUS_LABELS.retained).toBe('Tinggal Kelas');
      expect(ACADEMIC_RECORD_STATUS_LABELS.graduated).toBe('Lulus');
    });

    it('has Indonesian labels for academic year statuses', () => {
      expect(ACADEMIC_YEAR_STATUS_LABELS.active).toBe('Aktif');
      expect(ACADEMIC_YEAR_STATUS_LABELS.completed).toBe('Selesai');
    });
  });
});
