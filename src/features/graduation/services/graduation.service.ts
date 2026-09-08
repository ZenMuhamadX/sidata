import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import type {
  GraduationCandidateStudent,
  GraduationBatchPayload,
  GraduationBatchResult,
} from '../types/graduation.types';

export const graduationService = {
  /**
   * Mengambil daftar siswa Kelas 6 yang berstatus 'active' pada tahun ajaran yang dipilih
   */
  async getCandidates(academicYearId: string): Promise<GraduationCandidateStudent[]> {
    if (!academicYearId) return [];

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
          student:students (
            id,
            nama,
            nik,
            nisn,
            jenis_kelamin,
            status_siswa,
            kelas
          )
        `)
        .eq('academic_year_id', academicYearId)
        .eq('kelas', 6)
        .eq('status', 'active');

      if (error) {
        logger.error('Gagal mengambil daftar siswa calon kelulusan', { error: error.message });
        throw new Error(error.message || 'Gagal memuat daftar siswa kelas 6.');
      }

      if (!data) return [];

      // Format dan urutkan berdasarkan nama siswa
      const candidates: GraduationCandidateStudent[] = data
        .filter((row: any) => row.student && (row.student.status_siswa === 'aktif' || row.student.status_siswa === 'active'))
        .map((row: any) => ({
          student_id: row.student_id,
          student: row.student,
          record_id: row.id,
          academic_year_id: row.academic_year_id,
          kelas: row.kelas,
          status: row.status,
        }))
        .sort((a, b) => a.student.nama.localeCompare(b.student.nama));

      return candidates;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memuat calon lulusan.';
      logger.error('graduation_load_failed', { academicYearId, error: message });
      throw new Error(message);
    }
  },

  /**
   * Menjalankan transaksi kelulusan batch secara atomik melalui Supabase RPC
   */
  async processGraduation(
    payload: GraduationBatchPayload,
    adminEmail?: string
  ): Promise<GraduationBatchResult> {
    const logContext = {
      admin: adminEmail || 'authenticated-admin',
      academic_year_id: payload.academic_year_id,
      total_students: payload.student_ids.length,
      student_ids: payload.student_ids,
      timestamp: new Date().toISOString(),
    };

    logger.info('graduation_started', logContext);

    try {
      if (!payload.academic_year_id) {
        throw new Error('Tahun ajaran kelulusan harus ditentukan.');
      }

      if (!payload.student_ids || payload.student_ids.length === 0) {
        throw new Error('Pilih minimal satu siswa untuk diproses kelulusannya.');
      }

      const { data, error } = await supabase
        .schema('assyifa')
        .rpc('process_student_graduation', {
          p_academic_year_id: payload.academic_year_id,
          p_student_ids: payload.student_ids,
        });

      if (error) {
        logger.error('graduation_failed', { ...logContext, error: error.message });
        throw new Error(error.message || 'Proses kelulusan gagal dieksekusi.');
      }

      const result = data as GraduationBatchResult;
      logger.info('graduation_completed', { ...logContext, result });
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memproses kelulusan.';
      logger.error('graduation_failed', { ...logContext, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
};
