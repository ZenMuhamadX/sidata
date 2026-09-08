import type {
  StudentAdmissionRow,
  StudentAdmissionInsert,
  StudentAdmissionUpdate,
  AdmissionStatus,
  StudentRow,
  AcademicYearRow,
} from '../../../types/database';
import type { StudentFormData } from '../../students/types/student.types';

export type {
  StudentAdmissionRow,
  StudentAdmissionInsert,
  StudentAdmissionUpdate,
  AdmissionStatus,
};

export interface StudentAdmission extends StudentAdmissionRow {}

export interface StudentAdmissionWithRelations extends StudentAdmission {
  student: StudentRow;
  academic_year: AcademicYearRow;
}

export type AdmissionSortField = 'created_at' | 'status' | 'student.nama';

export interface AdmissionFilters {
  search?: string;
  academic_year_id?: string | 'all';
  status?: AdmissionStatus | 'all';
  page: number;
  pageSize: number;
  sortBy: AdmissionSortField;
  sortOrder: 'asc' | 'desc';
}

export interface AdmissionListResult {
  admissions: StudentAdmissionWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdmissionCreateFormData extends StudentFormData {
  academic_year_id: string;
}

export const ADMISSION_STATUS_LABELS: Record<AdmissionStatus, string> = {
  candidate: 'Calon',
  accepted: 'Diterima',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
  enrolled: 'Terdaftar',
};

export const ADMISSION_STATUS_CLASSES: Record<AdmissionStatus, string> = {
  candidate: 'status-badge-candidate',
  accepted: 'status-badge-accepted',
  rejected: 'status-badge-rejected',
  cancelled: 'status-badge-cancelled',
  enrolled: 'status-badge-enrolled',
};
