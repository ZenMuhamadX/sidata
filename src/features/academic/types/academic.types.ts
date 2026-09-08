import type {
  AcademicYearRow,
  AcademicYearInsert,
  AcademicYearUpdate,
  AcademicYearStatus,
  StudentAcademicRecordRow,
  StudentAcademicRecordInsert,
  StudentAcademicRecordUpdate,
  AcademicRecordStatus,
  StudentRow,
} from '../../../types/database';

export type {
  AcademicYearRow,
  AcademicYearInsert,
  AcademicYearUpdate,
  AcademicYearStatus,
  StudentAcademicRecordRow,
  StudentAcademicRecordInsert,
  StudentAcademicRecordUpdate,
  AcademicRecordStatus,
};

export interface AcademicYear extends AcademicYearRow {}

export interface AcademicYearWithCount extends AcademicYear {
  student_count: number;
}

export interface StudentAcademicRecord extends StudentAcademicRecordRow {
  academic_year?: AcademicYearRow;
  student?: StudentRow;
}

export interface AcademicYearFormData {
  tahun_ajaran: string;
  status: AcademicYearStatus;
}

export const ACADEMIC_RECORD_STATUS_LABELS: Record<AcademicRecordStatus, string> = {
  active: 'Aktif',
  promoted: 'Naik Kelas',
  retained: 'Tinggal Kelas',
  graduated: 'Lulus',
};

export const ACADEMIC_YEAR_STATUS_LABELS: Record<AcademicYearStatus, string> = {
  active: 'Aktif',
  completed: 'Selesai',
};
