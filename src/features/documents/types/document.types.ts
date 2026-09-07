import type { StatusSiswa } from '../../../types/database';

export type DocumentTypeDb = 'KK' | 'Akta Lahir' | 'KTP Ayah' | 'KTP Ibu';

export type DocumentTypeKey = 'kk' | 'akta_lahir' | 'ktp_ayah' | 'ktp_ibu';

export interface DocumentTypeDefinition {
  key: DocumentTypeKey;
  dbValue: DocumentTypeDb;
  label: string;
  code: string;
}

export const DOCUMENT_TYPES: DocumentTypeDefinition[] = [
  {
    key: 'kk',
    dbValue: 'KK',
    label: 'Kartu Keluarga',
    code: 'kk',
  },
  {
    key: 'akta_lahir',
    dbValue: 'Akta Lahir',
    label: 'Akta Lahir',
    code: 'akta_lahir',
  },
  {
    key: 'ktp_ayah',
    dbValue: 'KTP Ayah',
    label: 'KTP Ayah',
    code: 'ktp_ayah',
  },
  {
    key: 'ktp_ibu',
    dbValue: 'KTP Ibu',
    label: 'KTP Ibu',
    code: 'ktp_ibu',
  },
];

export interface StudentDocument {
  id: string;
  student_id: string;
  document_type: DocumentTypeDb;
  storage_path: string;
  original_filename: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface StudentWithDocumentsSummary {
  id: string;
  nama: string;
  kelas: number;
  nik: string;
  nisn: string | null;
  status_siswa: StatusSiswa;
  documents: Record<DocumentTypeKey, StudentDocument | null>;
  completedCount: number;
  isComplete: boolean;
}

export interface DocumentFilters {
  search?: string;
  kelas?: number | 'all';
  status_siswa?: StatusSiswa | 'all';
  completeness?: 'all' | 'lengkap' | 'belum_lengkap';
  page: number;
  pageSize: number;
}

export interface DocumentListResult {
  students: StudentWithDocumentsSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
