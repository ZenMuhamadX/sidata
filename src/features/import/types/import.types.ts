import type { Agama, JenisKelamin } from '../../../types/database';

export interface SheetInfo {
  name: string;
  detectedClass: number | null;
  assignedClass: number; // 1 - 6
  isAmbiguous: boolean;
  rowCount: number;
}

export interface ParentDataImport {
  nama: string | null;
  tahun_lahir: number | null;
  jenjang_pendidikan: string | null;
  pekerjaan: string | null;
  penghasilan: string | null;
  nik: string | null;
}

export interface ParsedRowData {
  rowIndex: number;
  sheetName: string;
  raw: Record<string, unknown>;

  // Student fields
  nama: string;
  jenis_kelamin: JenisKelamin | null;
  nisn: string | null;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string | null;
  agama: Agama | null;
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

  // Parents
  father: ParentDataImport | null;
  mother: ParentDataImport | null;

  // Validation
  rombelWarning?: string;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface ValidationSummary {
  totalSheets: number;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningCount: number;
  duplicateCount: number;
}

export interface ImportResultSummary {
  studentsCount: number;
  fatherCount: number;
  motherCount: number;
  failedCount: number;
  errors: string[];
}
