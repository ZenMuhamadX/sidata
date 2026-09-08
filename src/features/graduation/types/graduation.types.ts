import type { StudentRow } from '../../../types/database';

export interface GraduationCandidateStudent {
  student_id: string;
  student: StudentRow;
  record_id: string;
  academic_year_id: string;
  kelas: number;
  status: string;
}

export interface GraduationBatchPayload {
  academic_year_id: string;
  student_ids: string[];
}

export interface GraduationBatchResult {
  success: boolean;
  academic_year: string;
  total_graduated: number;
  message: string;
}

export interface GraduationFilters {
  academic_year_id: string;
  search: string;
}
