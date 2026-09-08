import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import type {
  StudentAcademicRecord,
  StudentAcademicRecordInsert,
  AcademicRecordStatus,
} from '../types/academic.types';

export const academicRecordService = {
  /**
   * Fetch all academic history records for a specific student,
   * joined with academic_years table and ordered by tahun_ajaran descending.
   */
  async getRecordsByStudentId(studentId: string): Promise<StudentAcademicRecord[]> {
    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('student_academic_records')
        .select(`
          id,
          student_id,
          academic_year_id,
          kelas,
          status,
          created_at,
          updated_at,
          academic_years:academic_year_id (
            id,
            tahun_ajaran,
            status,
            created_at,
            updated_at
          )
        `)
        .eq('student_id', studentId);

      if (error) {
        logger.error('Gagal memuat histori akademik siswa', { studentId, error: error.message });
        throw new Error(`Gagal memuat histori akademik: ${error.message}`);
      }

      if (!data) return [];

      // Format relation to match StudentAcademicRecord type and sort by tahun_ajaran DESC
      const formatted: StudentAcademicRecord[] = (data as any[]).map((item) => ({
        id: item.id,
        student_id: item.student_id,
        academic_year_id: item.academic_year_id,
        kelas: item.kelas,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        academic_year: item.academic_years,
      }));

      // Sort by academic year descending (e.g. 2026/2027 before 2025/2026)
      return formatted.sort((a, b) => {
        const yearA = a.academic_year?.tahun_ajaran || '';
        const yearB = b.academic_year?.tahun_ajaran || '';
        return yearB.localeCompare(yearA);
      });
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat memuat riwayat akademik.');
    }
  },

  /**
   * Create a new student academic record.
   */
  async createRecord(payload: StudentAcademicRecordInsert): Promise<StudentAcademicRecord> {
    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('student_academic_records')
        .insert(payload as any)
        .select(`
          *,
          academic_years:academic_year_id (*)
        `)
        .single();

      if (error || !data) {
        logger.error('Gagal membuat riwayat akademik siswa', { payload, error: error?.message });
        throw new Error(`Gagal menyimpan riwayat akademik: ${error?.message || 'Data tidak tersimpan'}`);
      }

      const row = data as any;
      logger.info('Riwayat akademik siswa berhasil dibuat', { id: row.id, student_id: payload.student_id });
      return {
        ...row,
        academic_year: row.academic_years,
      } as StudentAcademicRecord;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat membuat riwayat akademik.');
    }
  },

  /**
   * Update student academic record status (active, promoted, retained, graduated).
   */
  async updateRecordStatus(recordId: string, status: AcademicRecordStatus): Promise<StudentAcademicRecord> {
    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('student_academic_records')
        .update({ status } as any)
        .eq('id', recordId)
        .select(`
          *,
          academic_years:academic_year_id (*)
        `)
        .single();

      if (error || !data) {
        logger.error('Gagal memperbarui status riwayat akademik', { recordId, status, error: error?.message });
        throw new Error(`Gagal memperbarui status riwayat: ${error?.message || 'Data tidak ditemukan'}`);
      }

      const row = data as any;
      logger.info('Status riwayat akademik berhasil diperbarui', { id: recordId, status });
      return {
        ...row,
        academic_year: row.academic_years,
      } as StudentAcademicRecord;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat memperbarui status riwayat akademik.');
    }
  },
};
