export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Agama = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
export type JenisKelamin = 'L' | 'P';
export type StatusSiswa = 'aktif' | 'tidak_aktif';
export type ParentHubungan = 'ayah' | 'ibu';

export interface StudentRow {
  id: string;
  nama: string;
  jenis_kelamin: JenisKelamin;
  nisn: string | null;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: Agama;
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
  status_siswa: StatusSiswa;
  created_at: string;
  updated_at: string;
}

export interface StudentInsert {
  id?: string;
  nama: string;
  jenis_kelamin: JenisKelamin;
  nisn?: string | null;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: Agama;
  alamat: string;
  rt?: string | null;
  rw?: string | null;
  dusun?: string | null;
  kelurahan: string;
  kecamatan: string;
  kode_pos?: string | null;
  jenis_tinggal?: string | null;
  alat_transportasi?: string | null;
  hp?: string | null;
  kelas: number;
  nomor_registrasi_akta_lahir?: string | null;
  anak_ke?: number | null;
  ket?: string | null;
  status_siswa?: StatusSiswa;
  created_at?: string;
  updated_at?: string;
}

export interface StudentUpdate {
  id?: string;
  nama?: string;
  jenis_kelamin?: JenisKelamin;
  nisn?: string | null;
  nik?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: Agama;
  alamat?: string;
  rt?: string | null;
  rw?: string | null;
  dusun?: string | null;
  kelurahan?: string;
  kecamatan?: string;
  kode_pos?: string | null;
  jenis_tinggal?: string | null;
  alat_transportasi?: string | null;
  hp?: string | null;
  kelas?: number;
  nomor_registrasi_akta_lahir?: string | null;
  anak_ke?: number | null;
  ket?: string | null;
  status_siswa?: StatusSiswa;
  created_at?: string;
  updated_at?: string;
}

export interface ParentRow {
  id: string;
  student_id: string;
  hubungan: ParentHubungan;
  nama: string | null;
  tahun_lahir: number | null;
  jenjang_pendidikan: string | null;
  pekerjaan: string | null;
  penghasilan: string | null;
  nik: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentInsert {
  id?: string;
  student_id: string;
  hubungan: ParentHubungan;
  nama?: string | null;
  tahun_lahir?: number | null;
  jenjang_pendidikan?: string | null;
  pekerjaan?: string | null;
  penghasilan?: string | null;
  nik?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ParentUpdate {
  id?: string;
  student_id?: string;
  hubungan?: ParentHubungan;
  nama?: string | null;
  tahun_lahir?: number | null;
  jenjang_pendidikan?: string | null;
  pekerjaan?: string | null;
  penghasilan?: string | null;
  nik?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type AcademicYearStatus = 'active' | 'completed';
export type AcademicRecordStatus = 'active' | 'promoted' | 'retained' | 'graduated';

export interface AcademicYearRow {
  id: string;
  tahun_ajaran: string;
  status: AcademicYearStatus;
  created_at: string;
  updated_at: string;
}

export interface AcademicYearInsert {
  id?: string;
  tahun_ajaran: string;
  status?: AcademicYearStatus;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicYearUpdate {
  id?: string;
  tahun_ajaran?: string;
  status?: AcademicYearStatus;
  created_at?: string;
  updated_at?: string;
}

export interface StudentAcademicRecordRow {
  id: string;
  student_id: string;
  academic_year_id: string;
  kelas: number;
  status: AcademicRecordStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentAcademicRecordInsert {
  id?: string;
  student_id: string;
  academic_year_id: string;
  kelas: number;
  status?: AcademicRecordStatus;
  created_at?: string;
  updated_at?: string;
}

export interface StudentAcademicRecordUpdate {
  id?: string;
  student_id?: string;
  academic_year_id?: string;
  kelas?: number;
  status?: AcademicRecordStatus;
  created_at?: string;
  updated_at?: string;
}

export type AdmissionStatus = 'candidate' | 'accepted' | 'rejected' | 'cancelled' | 'enrolled';

export interface StudentAdmissionRow {
  id: string;
  student_id: string;
  academic_year_id: string;
  status: AdmissionStatus;
  target_kelas: number;
  created_at: string;
  updated_at: string;
}

export interface StudentAdmissionInsert {
  id?: string;
  student_id: string;
  academic_year_id: string;
  status?: AdmissionStatus;
  target_kelas?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StudentAdmissionUpdate {
  id?: string;
  student_id?: string;
  academic_year_id?: string;
  status?: AdmissionStatus;
  target_kelas?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  assyifa: {
    Tables: {
      students: {
        Row: StudentRow;
        Insert: StudentInsert;
        Update: StudentUpdate;
        Relationships: [];
      };
      parents: {
        Row: ParentRow;
        Insert: ParentInsert;
        Update: ParentUpdate;
        Relationships: [
          {
            foreignKeyName: 'parents_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          }
        ];
      };
      documents: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      academic_years: {
        Row: AcademicYearRow;
        Insert: AcademicYearInsert;
        Update: AcademicYearUpdate;
        Relationships: [];
      };
      student_academic_records: {
        Row: StudentAcademicRecordRow;
        Insert: StudentAcademicRecordInsert;
        Update: StudentAcademicRecordUpdate;
        Relationships: [
          {
            foreignKeyName: 'student_academic_records_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_academic_records_academic_year_id_fkey';
            columns: ['academic_year_id'];
            isOneToOne: false;
            referencedRelation: 'academic_years';
            referencedColumns: ['id'];
          }
        ];
      };
      student_admissions: {
        Row: StudentAdmissionRow;
        Insert: StudentAdmissionInsert;
        Update: StudentAdmissionUpdate;
        Relationships: [
          {
            foreignKeyName: 'student_admissions_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_admissions_academic_year_id_fkey';
            columns: ['academic_year_id'];
            isOneToOne: false;
            referencedRelation: 'academic_years';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, unknown>;
    Functions: {
      enroll_student_admission: {
        Args: {
          p_admission_id: string;
        };
        Returns: {
          success: boolean;
          admission_id: string;
          student_id: string;
          academic_year_id: string;
          academic_record_id: string;
          message: string;
        };
      };
    };
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
}
