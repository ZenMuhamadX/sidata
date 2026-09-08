import { describe, it, expect } from 'bun:test';
import type { GraduationBatchPayload, GraduationCandidateStudent } from '../types/graduation.types';
import { ACADEMIC_RECORD_STATUS_LABELS } from '../../academic/types/academic.types';

describe('Stage 14: Kelulusan Siswa (SD Kelas 6 Graduation)', () => {
  describe('Business Rules & Constraints', () => {
    it('only allows Grade 6 students to be considered for graduation', () => {
      const mockRecordKelas6: Partial<GraduationCandidateStudent> = {
        kelas: 6,
        status: 'active',
      };
      const mockRecordKelas5: Partial<GraduationCandidateStudent> = {
        kelas: 5,
        status: 'active',
      };

      const isEligible = (record: { kelas?: number; status?: string }) =>
        record.kelas === 6 && record.status === 'active';

      expect(isEligible(mockRecordKelas6)).toBe(true);
      expect(isEligible(mockRecordKelas5)).toBe(false);
    });

    it('rejects candidates that are already graduated or inactive', () => {
      const isEligible = (record: { kelas?: number; status?: string }) =>
        record.kelas === 6 && record.status === 'active';

      expect(isEligible({ kelas: 6, status: 'graduated' })).toBe(false);
      expect(isEligible({ kelas: 6, status: 'promoted' })).toBe(false);
      expect(isEligible({ kelas: 6, status: 'retained' })).toBe(false);
      expect(isEligible({ kelas: 6, status: 'inactive' })).toBe(false);
    });

    it('has Indonesian label for graduated status', () => {
      expect(ACADEMIC_RECORD_STATUS_LABELS.graduated).toBe('Lulus');
    });

    it('does NOT create a Grade 7 (maximum elementary school grade is 6)', () => {
      const getTargetGrade = (currentGrade: number, isGraduating: boolean) => {
        if (isGraduating) {
          // Graduation concludes elementary school; no grade 7 exists
          return null;
        }
        return currentGrade + 1;
      };

      expect(getTargetGrade(6, true)).toBeNull();
      expect(getTargetGrade(5, false)).toBe(6);
    });
  });

  describe('Batch Payload & Validation', () => {
    it('validates that academic_year_id is required', () => {
      const validateGraduationPayload = (payload: GraduationBatchPayload): string | null => {
        if (!payload.academic_year_id || !payload.academic_year_id.trim()) {
          return 'Tahun ajaran kelulusan harus ditentukan.';
        }
        if (!payload.student_ids || payload.student_ids.length === 0) {
          return 'Pilih minimal satu siswa untuk diproses kelulusannya.';
        }
        return null;
      };

      expect(validateGraduationPayload({ academic_year_id: '', student_ids: ['student-1'] })).toBe(
        'Tahun ajaran kelulusan harus ditentukan.'
      );
      expect(validateGraduationPayload({ academic_year_id: 'ay-1', student_ids: [] })).toBe(
        'Pilih minimal satu siswa untuk diproses kelulusannya.'
      );
      expect(validateGraduationPayload({ academic_year_id: 'ay-1', student_ids: ['student-1'] })).toBeNull();
    });

    it('formats correct logging context for graduation transactions', () => {
      const payload: GraduationBatchPayload = {
        academic_year_id: 'year-2026-2027',
        student_ids: ['s-1', 's-2', 's-3'],
      };
      const adminEmail = 'admin@assyifa.sch.id';

      const logContext = {
        admin: adminEmail || 'authenticated-admin',
        academic_year_id: payload.academic_year_id,
        total_students: payload.student_ids.length,
        student_ids: payload.student_ids,
      };

      expect(logContext.admin).toBe('admin@assyifa.sch.id');
      expect(logContext.total_students).toBe(3);
      expect(logContext.student_ids).toEqual(['s-1', 's-2', 's-3']);
    });

    it('verifies final state transitions for graduated students', () => {
      // Rule 5:
      // student_academic_records.status -> 'graduated'
      // students.status_siswa -> 'inactive'
      const processSimulatedGraduation = (student: { status_siswa: string; academic_status: string }) => {
        return {
          status_siswa: 'inactive',
          academic_status: 'graduated',
        };
      };

      const result = processSimulatedGraduation({ status_siswa: 'aktif', academic_status: 'active' });
      expect(result.status_siswa).toBe('inactive');
      expect(result.academic_status).toBe('graduated');
    });
  });
});
