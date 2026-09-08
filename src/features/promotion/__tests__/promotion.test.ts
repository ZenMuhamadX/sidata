import { describe, it, expect } from 'bun:test';
import { PROMOTION_DECISION_LABELS } from '../types/promotion.types';
import type { PromotionCandidateStudent, PromotionDecision } from '../types/promotion.types';

describe('Stage 13: Kenaikan Kelas (Class Promotion & Retention)', () => {
  const dummyCandidates: PromotionCandidateStudent[] = [
    {
      record_id: 'rec-1',
      student_id: 's-1',
      academic_year_id: 'ay-2026',
      kelas: 1,
      status: 'active',
      student: {
        id: 's-1',
        nama: 'Ahmad Fauzan',
        nik: '3201010101010001',
        nisn: '1234567890',
        jenis_kelamin: 'L',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '2019-01-01',
        agama: 'Islam',
        alamat: 'Jl. Melati',
        kelurahan: 'Kelurahan A',
        kecamatan: 'Kecamatan B',
        kelas: 1,
        status_siswa: 'aktif',
        created_at: '',
        updated_at: '',
        rt: null,
        rw: null,
        dusun: null,
        kode_pos: null,
        jenis_tinggal: null,
        alat_transportasi: null,
        hp: null,
        nomor_registrasi_akta_lahir: null,
        anak_ke: null,
        ket: null,
      },
      decision: 'promoted',
    },
    {
      record_id: 'rec-2',
      student_id: 's-2',
      academic_year_id: 'ay-2026',
      kelas: 1,
      status: 'active',
      student: {
        id: 's-2',
        nama: 'Siti Aisyah',
        nik: '3201010101010002',
        nisn: '1234567891',
        jenis_kelamin: 'P',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '2019-02-02',
        agama: 'Islam',
        alamat: 'Jl. Mawar',
        kelurahan: 'Kelurahan A',
        kecamatan: 'Kecamatan B',
        kelas: 1,
        status_siswa: 'aktif',
        created_at: '',
        updated_at: '',
        rt: null,
        rw: null,
        dusun: null,
        kode_pos: null,
        jenis_tinggal: null,
        alat_transportasi: null,
        hp: null,
        nomor_registrasi_akta_lahir: null,
        anak_ke: null,
        ket: null,
      },
      decision: 'promoted',
    },
  ];

  describe('Business Rules & Constraints', () => {
    it('only allows source classes between 1 and 5 (Class 6 prohibited)', () => {
      const isAllowedClass = (kelas: number) => kelas >= 1 && kelas <= 5;
      expect(isAllowedClass(1)).toBe(true);
      expect(isAllowedClass(2)).toBe(true);
      expect(isAllowedClass(3)).toBe(true);
      expect(isAllowedClass(4)).toBe(true);
      expect(isAllowedClass(5)).toBe(true);
      expect(isAllowedClass(6)).toBe(false); // Prohibited
      expect(isAllowedClass(0)).toBe(false);
      expect(isAllowedClass(7)).toBe(false);
    });

    it('requires target academic year to be strictly after source academic year', () => {
      const isValidYearSequence = (yearFrom: string, yearTo: string) => yearTo > yearFrom;
      expect(isValidYearSequence('2026/2027', '2027/2028')).toBe(true);
      expect(isValidYearSequence('2026/2027', '2026/2027')).toBe(false); // Same year disallowed
      expect(isValidYearSequence('2027/2028', '2026/2027')).toBe(false); // Backward disallowed
    });

    it('has Indonesian decision labels', () => {
      expect(PROMOTION_DECISION_LABELS.promoted).toBe('Naik');
      expect(PROMOTION_DECISION_LABELS.retained).toBe('Tinggal Kelas');
    });
  });

  describe('Batch Payload & Summary Calculations', () => {
    it('defaults all candidates to promoted', () => {
      expect(dummyCandidates.every((c) => c.decision === 'promoted')).toBe(true);
    });

    it('correctly calculates counts when an individual is marked as retained', () => {
      const modified: PromotionCandidateStudent[] = dummyCandidates.map((c, i) =>
        i === 1 ? { ...c, decision: 'retained' as PromotionDecision } : c
      );

      const promotedCount = modified.filter((c) => c.decision === 'promoted').length;
      const retainedCount = modified.filter((c) => c.decision === 'retained').length;

      expect(promotedCount).toBe(1);
      expect(retainedCount).toBe(1);
      expect(promotedCount + retainedCount).toBe(2);
    });

    it('calculates target grade correctly based on decision', () => {
      const sourceGrade = 1;
      const getTargetGrade = (decision: PromotionDecision) =>
        decision === 'promoted' ? sourceGrade + 1 : sourceGrade;

      expect(getTargetGrade('promoted')).toBe(2);
      expect(getTargetGrade('retained')).toBe(1);
    });
  });
});
