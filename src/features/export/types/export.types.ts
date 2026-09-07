import type { StatusSiswa } from '../../../types/database';

export interface ExportFilters {
  status_siswa: StatusSiswa | 'all';
  kelas: number | 'all';
  search: string;
}

export interface StudentWithParentsExport {
  // Siswa
  nama: string;
  jenis_kelamin: string;
  nisn: string | null;
  tempat_lahir: string;
  tanggal_lahir: string;
  nik: string;
  agama: string;
  alamat: string;
  rt: string | null;
  rw: string | null;
  dusun: string | null;
  kelurahan: string;
  kecamatan: string;
  kode_pos: string | null;
  jenis_tinggal: string | null;
  alat_transportasi: string | null;
  hp: string | null;
  kelas: number;
  nomor_registrasi_akta_lahir: string | null;
  anak_ke: number | null;
  ket: string | null;
  status_siswa: string;

  // Ayah
  nama_ayah: string | null;
  tahun_lahir_ayah: number | null;
  jenjang_pendidikan_ayah: string | null;
  pekerjaan_ayah: string | null;
  penghasilan_ayah: string | null;
  nik_ayah: string | null;

  // Ibu
  nama_ibu: string | null;
  tahun_lahir_ibu: number | null;
  jenjang_pendidikan_ibu: string | null;
  pekerjaan_ibu: string | null;
  penghasilan_ibu: string | null;
  nik_ibu: string | null;
}

export interface ExportSummaryStats {
  total: number;
  active: number;
  inactive: number;
  classCounts: Record<number, number>;
}
