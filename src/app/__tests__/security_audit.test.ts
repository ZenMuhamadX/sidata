import { describe, it, expect } from 'bun:test';
import { validateStudentForm } from '../../features/students/validation/student.validation';
import { validateParentForm } from '../../features/parents/validation/parent.validation';
import { documentService } from '../../features/documents/services/document.service';
import type { StudentFormData } from '../../features/students/types/student.types';
import type { ParentFormData } from '../../features/parents/types/parent.types';

describe('Stage 9: Validation and Integrity Tests', () => {
  describe('Student Form Validation', () => {
    const validStudent: StudentFormData = {
      nama: 'Ahmad Fauzan',
      jenis_kelamin: 'L',
      nisn: '1234567890',
      nik: '3201010101010001',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '2015-05-12',
      agama: 'Islam',
      alamat: 'Jl. Melati No. 12',
      rt: '02',
      rw: '05',
      dusun: 'Dusun Sukamaju',
      kelurahan: 'Kelurahan Maju',
      kecamatan: 'Kecamatan Makmur',
      kode_pos: '40123',
      jenis_tinggal: 'Bersama orang tua',
      alat_transportasi: 'Sepeda Motor',
      hp: '081234567890',
      kelas: 1,
      nomor_registrasi_akta_lahir: '3216-LT-29082022-0073',
      anak_ke: '1',
      ket: 'Siswa pindahan',
      status_siswa: 'aktif',
    };

    it('passes for completely valid data', () => {
      const result = validateStudentForm(validStudent);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('rejects missing required fields', () => {
      const invalid = { ...validStudent, nama: '', tempat_lahir: '', alamat: '' };
      const result = validateStudentForm(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.nama).toBeDefined();
      expect(result.errors.tempat_lahir).toBeDefined();
      expect(result.errors.alamat).toBeDefined();
    });

    it('validates NIK: must be exactly 16 numeric digits', () => {
      // 15 digits
      const res15 = validateStudentForm({ ...validStudent, nik: '123456789012345' });
      expect(res15.isValid).toBe(false);
      expect(res15.errors.nik).toContain('16 digit');

      // 17 digits
      const res17 = validateStudentForm({ ...validStudent, nik: '12345678901234567' });
      expect(res17.isValid).toBe(false);

      // Non-numeric
      const resAlpha = validateStudentForm({ ...validStudent, nik: '123456789012345A' });
      expect(resAlpha.isValid).toBe(false);
    });

    it('validates class: strictly 1 through 6', () => {
      const resZero = validateStudentForm({ ...validStudent, kelas: 0 });
      expect(resZero.isValid).toBe(false);
      expect(resZero.errors.kelas).toBeDefined();

      const resSeven = validateStudentForm({ ...validStudent, kelas: 7 });
      expect(resSeven.isValid).toBe(false);
      expect(resSeven.errors.kelas).toBeDefined();
    });

    it('validates gender: only L or P', () => {
      const res = validateStudentForm({ ...validStudent, jenis_kelamin: 'X' as any });
      expect(res.isValid).toBe(false);
      expect(res.errors.jenis_kelamin).toBeDefined();
    });

    it('validates date format: must be YYYY-MM-DD', () => {
      const res = validateStudentForm({ ...validStudent, tanggal_lahir: '12/05/2015' });
      expect(res.isValid).toBe(false);
      expect(res.errors.tanggal_lahir).toBeDefined();
    });
  });

  describe('Parent Form Validation', () => {
    const validParent: ParentFormData = {
      student_id: '550e8400-e29b-41d4-a716-446655440000',
      hubungan: 'ayah',
      nama: 'Budi Santoso',
      nik: '3201010101010002',
      tahun_lahir: '1980',
      jenjang_pendidikan: 'S1',
      pekerjaan: 'Wiraswasta',
      penghasilan: 'Rp. 5.000.000',
    };

    it('passes for valid parent data', () => {
      const res = validateParentForm(validParent);
      expect(res.isValid).toBe(true);
    });

    it('allows empty NIK for parents, but validates when provided', () => {
      const emptyNik = { ...validParent, nik: '' };
      expect(validateParentForm(emptyNik).isValid).toBe(true);

      const invalidNik = { ...validParent, nik: '123' };
      const res = validateParentForm(invalidNik);
      expect(res.isValid).toBe(false);
      expect(res.errors.nik).toContain('16 digit');
    });

    it('requires student_id and hubungan', () => {
      const noStudent = { ...validParent, student_id: '' };
      expect(validateParentForm(noStudent).isValid).toBe(false);

      const noHubungan = { ...validParent, hubungan: '' as any };
      expect(validateParentForm(noHubungan).isValid).toBe(false);
    });

    it('validates parent birth year range', () => {
      const ancientYear = { ...validParent, tahun_lahir: '1850' };
      expect(validateParentForm(ancientYear).isValid).toBe(false);

      const futureYear = { ...validParent, tahun_lahir: '2099' };
      expect(validateParentForm(futureYear).isValid).toBe(false);
    });
  });

  describe('Document File Validation', () => {
    it('rejects executable and unsafe files', () => {
      const exe = new File(['content'], 'payload.exe', { type: 'application/x-msdownload' });
      expect(documentService.validateFile(exe).isValid).toBe(false);

      const bat = new File(['echo hello'], 'script.bat', { type: 'application/x-bat' });
      expect(documentService.validateFile(bat).isValid).toBe(false);
    });

    it('rejects files larger than 5MB', () => {
      const oversizedBlob = new Blob([new Uint8Array(5.5 * 1024 * 1024)]);
      const file = new File([oversizedBlob], 'doc.pdf', { type: 'application/pdf' });
      const res = documentService.validateFile(file);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('5 MB');
    });

    it('accepts valid PDF, JPG, and PNG documents', () => {
      const pdf = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
      expect(documentService.validateFile(pdf).isValid).toBe(true);

      const jpg = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
      expect(documentService.validateFile(jpg).isValid).toBe(true);

      const png = new File(['dummy'], 'photo.png', { type: 'image/png' });
      expect(documentService.validateFile(png).isValid).toBe(true);
    });
  });
});
