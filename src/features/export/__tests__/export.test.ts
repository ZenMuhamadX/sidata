import { describe, it, expect } from 'bun:test';
import { exportService } from '../services/export.service';
import type { StudentWithParentsExport } from '../types/export.types';

describe('Export Service Unit Tests', () => {
  it('formats dates to dd-mm-yyyy correctly', () => {
    expect(exportService.formatTanggalLahir('2019-11-20')).toBe('20-11-2019');
    expect(exportService.formatTanggalLahir('2015-05-01')).toBe('01-05-2015');
    expect(exportService.formatTanggalLahir('')).toBe('');
  });

  it('generates informative filenames based on filters', () => {
    const today = new Date().toISOString().split('T')[0];

    const allFile = exportService.generateFileName();
    expect(allFile).toBe(`data-siswa-semua-${today}.xlsx`);

    const classFile = exportService.generateFileName({
      kelas: 1,
      status_siswa: 'all',
      search: '',
    });
    expect(classFile).toBe(`data-siswa-kelas-1-${today}.xlsx`);

    const statusFile = exportService.generateFileName({
      kelas: 'all',
      status_siswa: 'aktif',
      search: '',
    });
    expect(statusFile).toBe(`data-siswa-aktif-${today}.xlsx`);

    const combinedFile = exportService.generateFileName({
      kelas: 2,
      status_siswa: 'tidak_aktif',
      search: 'fauzan',
    });
    expect(combinedFile).toBe(`data-siswa-kelas-2-tidak_aktif-${today}.xlsx`);
  });

  it('calculates summary statistics accurately', () => {
    const mockData: StudentWithParentsExport[] = [
      {
        nama: 'Siswa A',
        jenis_kelamin: 'L',
        nisn: '001',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '2015-01-01',
        nik: '3201010101010001',
        agama: 'Islam',
        alamat: 'Jl. A',
        rt: '01',
        rw: '02',
        dusun: null,
        kelurahan: 'Kel A',
        kecamatan: 'Kec A',
        kode_pos: '12345',
        jenis_tinggal: 'Bersama orang tua',
        alat_transportasi: 'Jalan kaki',
        hp: '08123456789',
        kelas: 1,
        nomor_registrasi_akta_lahir: '3216-LT-0001',
        anak_ke: 1,
        ket: null,
        status_siswa: 'aktif',
        nama_ayah: 'Ayah A',
        tahun_lahir_ayah: 1980,
        jenjang_pendidikan_ayah: 'S1',
        pekerjaan_ayah: 'PNS',
        penghasilan_ayah: 'Rp. 5.000.000',
        nik_ayah: '3201010101010002',
        nama_ibu: null,
        tahun_lahir_ibu: null,
        jenjang_pendidikan_ibu: null,
        pekerjaan_ibu: null,
        penghasilan_ibu: null,
        nik_ibu: null,
      },
      {
        nama: 'Siswa B',
        jenis_kelamin: 'P',
        nisn: null,
        tempat_lahir: 'Bandung',
        tanggal_lahir: '2014-06-15',
        nik: '3201010101010003',
        agama: 'Islam',
        alamat: 'Jl. B',
        rt: null,
        rw: null,
        dusun: null,
        kelurahan: 'Kel B',
        kecamatan: 'Kec B',
        kode_pos: null,
        jenis_tinggal: null,
        alat_transportasi: null,
        hp: null,
        kelas: 2,
        nomor_registrasi_akta_lahir: null,
        anak_ke: 2,
        ket: null,
        status_siswa: 'tidak_aktif',
        nama_ayah: null,
        tahun_lahir_ayah: null,
        jenjang_pendidikan_ayah: null,
        pekerjaan_ayah: null,
        penghasilan_ayah: null,
        nik_ayah: null,
        nama_ibu: 'Ibu B',
        tahun_lahir_ibu: 1985,
        jenjang_pendidikan_ibu: 'SMA',
        pekerjaan_ibu: 'Ibu Rumah Tangga',
        penghasilan_ibu: null,
        nik_ibu: '3201010101010004',
      },
    ];

    const stats = exportService.calculateStats(mockData);
    expect(stats.total).toBe(2);
    expect(stats.active).toBe(1);
    expect(stats.inactive).toBe(1);
    expect(stats.classCounts[1]).toBe(1);
    expect(stats.classCounts[2]).toBe(1);
    expect(stats.classCounts[3]).toBe(0);
  });
});
