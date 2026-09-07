import type { ParentRow, ParentHubungan, StatusSiswa } from '../../../types/database';

export type Parent = ParentRow;

export interface StudentRelationBrief {
  id: string;
  nama: string;
  kelas: number;
  status_siswa: StatusSiswa;
  nik: string;
  nisn: string | null;
}

export interface ParentWithStudent extends Parent {
  students?: StudentRelationBrief | null;
}

export interface ParentFormData {
  student_id: string;
  hubungan: ParentHubungan;
  nama: string;
  nik: string;
  tahun_lahir: string;
  jenjang_pendidikan: string;
  pekerjaan: string;
  penghasilan: string;
}

export interface ParentFilters {
  search?: string;
  hubungan?: ParentHubungan | 'all';
  kelas?: number | 'all';
  status_siswa?: StatusSiswa | 'all';
  page: number;
  pageSize: number;
}

export interface ParentListResult {
  parents: ParentWithStudent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ParentFormErrors = Partial<Record<keyof ParentFormData, string>>;
