import { describe, it, expect } from 'bun:test';
import { validateAdmissionForm } from '../validation/admission.validation';
import {
  ADMISSION_STATUS_LABELS,
  ADMISSION_STATUS_CLASSES,
} from '../types/admission.types';
import type { AdmissionCreateFormData } from '../types/admission.types';

describe('Stage 12: Calon Siswa / Admission Tests', () => {
  const validCandidate: AdmissionCreateFormData = {
    nama: 'Bintang Pratama',
    jenis_kelamin: 'L',
    nisn: '',
    nik: '3201010101010099',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '2019-06-15',
    agama: 'Islam',
    alamat: 'Jl. Melati No. 10',
    rt: '01',
    rw: '02',
    dusun: 'Kampung Baru',
    kelurahan: 'Kelurahan Sukamaju',
    kecamatan: 'Kecamatan Makmur',
    kode_pos: '40123',
    jenis_tinggal: 'Bersama orang tua',
    alat_transportasi: 'Jalan kaki',
    hp: '081299998888',
    kelas: 1,
    nomor_registrasi_akta_lahir: '3201-LT-01012019-0001',
    anak_ke: '1',
    ket: 'Pendaftar gelombang 1',
    status_siswa: 'tidak_aktif',
    academic_year_id: '550e8400-e29b-41d4-a716-446655440000',
  };

  describe('Admission Form Validation', () => {
    it('passes for complete and valid candidate registration data', () => {
      const res = validateAdmissionForm(validCandidate);
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors).length).toBe(0);
    });

    it('requires academic_year_id to be selected', () => {
      const res = validateAdmissionForm({
        ...validCandidate,
        academic_year_id: '',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.academic_year_id).toBeDefined();
    });

    it('enforces student validations like 16-digit NIK', () => {
      const invalidNik = validateAdmissionForm({
        ...validCandidate,
        nik: '12345',
      });
      expect(invalidNik.isValid).toBe(false);
      expect(invalidNik.errors.nik).toBeDefined();
    });

    it('enforces student validations like required name and birth place', () => {
      const missingName = validateAdmissionForm({
        ...validCandidate,
        nama: '',
        tempat_lahir: '',
      });
      expect(missingName.isValid).toBe(false);
      expect(missingName.errors.nama).toBeDefined();
      expect(missingName.errors.tempat_lahir).toBeDefined();
    });
  });

  describe('Admission Status Definitions and Badges', () => {
    it('has Indonesian labels for all 5 admission statuses', () => {
      expect(ADMISSION_STATUS_LABELS.candidate).toBe('Calon');
      expect(ADMISSION_STATUS_LABELS.accepted).toBe('Diterima');
      expect(ADMISSION_STATUS_LABELS.rejected).toBe('Ditolak');
      expect(ADMISSION_STATUS_LABELS.cancelled).toBe('Dibatalkan');
      expect(ADMISSION_STATUS_LABELS.enrolled).toBe('Terdaftar');
    });

    it('has matching badge CSS classes for all 5 statuses', () => {
      expect(ADMISSION_STATUS_CLASSES.candidate).toBe('status-badge-candidate');
      expect(ADMISSION_STATUS_CLASSES.accepted).toBe('status-badge-accepted');
      expect(ADMISSION_STATUS_CLASSES.enrolled).toBe('status-badge-enrolled');
      expect(ADMISSION_STATUS_CLASSES.rejected).toBe('status-badge-rejected');
      expect(ADMISSION_STATUS_CLASSES.cancelled).toBe('status-badge-cancelled');
    });
  });
});
