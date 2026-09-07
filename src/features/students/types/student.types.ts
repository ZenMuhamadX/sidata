import type { StudentRow, Agama, JenisKelamin, StatusSiswa } from '../../../types/database';

export type Student = StudentRow;

export interface StudentFormData {
  nama: string;
  jenis_kelamin: JenisKelamin;
  nisn: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: Agama;
  alamat: string;
  rt: string;
  rw: string;
  dusun: string;
  kelurahan: string;
  kecamatan: string;
  kode_pos: string;
  jenis_tinggal: string;
  alat_transportasi: string;
  hp: string;
  kelas: number;
  nomor_registrasi_akta_lahir: string;
  anak_ke: string; // kept as string in form, parsed to int or null on submit
  ket: string;
  status_siswa: StatusSiswa;
}

export type StudentSortField = 'nama' | 'kelas' | 'status_siswa';

export interface StudentFilters {
  search?: string;
  kelas?: number | 'all';
  status_siswa?: StatusSiswa | 'all';
  page: number;
  pageSize: number;
  sortBy: StudentSortField;
  sortOrder: 'asc' | 'desc';
}

export interface StudentListResult {
  students: Student[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  total: number;
  aktif: number;
  tidakAktif: number;
  perKelas: Record<number, number>;
}

export type StudentFormErrors = Partial<Record<keyof StudentFormData, string>>;
