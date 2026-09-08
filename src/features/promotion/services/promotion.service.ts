import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import type {
  PromotionCandidateStudent,
  PromotionBatchPayload,
  PromotionBatchResult,
} from '../types/promotion.types';

export const promotionService = {
  /**
   * Fetch active students in the source academic year and class who are candidates for promotion
   */
  async getEligibleStudents(
    academicYearFromId: string,
    kelasFrom: number,
    academicYearToId?: string
  ): Promise<PromotionCandidateStudent[]> {
    if (kelasFrom < 1 || kelasFrom > 5) {
      throw new Error('Kelas asal tidak valid. Kenaikan kelas hanya untuk Kelas 1-5.');
    }

    try {
      // 1. Ambil records aktif dari tahun ajaran asal dan kelas asal
      const { data, error } = await supabase
        .schema('assyifa')
        .from('student_academic_records')
        .select(`
          id,
          student_id,
          academic_year_id,
          kelas,
          status,
          student:student_id (
            *
          )
        `)
        .eq('academic_year_id', academicYearFromId)
        .eq('kelas', kelasFrom)
        .eq('status', 'active');

      if (error) {
        logger.error('Gagal mengambil daftar siswa kenaikan kelas', { error: error.message });
        throw new Error(`Gagal memuat siswa: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // 2. Jika tahun tujuan disediakan, periksa apakah ada siswa yang sudah memiliki record di tahun tujuan
      let targetStudentIds = new Set<string>();
      if (academicYearToId) {
        const { data: targetRecords, error: targetError } = await supabase
          .schema('assyifa')
          .from('student_academic_records')
          .select('student_id')
          .eq('academic_year_id', academicYearToId);

        if (!targetError && targetRecords) {
          targetStudentIds = new Set(targetRecords.map((r) => r.student_id));
        }
      }

      // 3. Format hasil dengan default decision: 'promoted'
      const candidates: PromotionCandidateStudent[] = (data as any[]).map((row) => ({
        record_id: row.id,
        student_id: row.student_id,
        academic_year_id: row.academic_year_id,
        kelas: row.kelas,
        status: row.status,
        student: row.student,
        decision: 'promoted',
        has_target_record: targetStudentIds.has(row.student_id),
      }));

      // Urutkan berdasarkan nama siswa
      return candidates.sort((a, b) => (a.student?.nama || '').localeCompare(b.student?.nama || ''));
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat memuat siswa untuk kenaikan kelas.');
    }
  },

  /**
   * Execute atomic batch promotion via PostgreSQL stored procedure
   */
  async executePromotionBatch(
    payload: PromotionBatchPayload,
    adminEmail?: string
  ): Promise<PromotionBatchResult> {
    const logContext = {
      admin: adminEmail || 'authenticated-admin',
      academic_year_from: payload.academic_year_from,
      academic_year_to: payload.academic_year_to,
      kelas_from: payload.kelas_from,
      kelas_to: payload.kelas_from + 1,
      total_students: payload.decisions.length,
      promoted_count: payload.decisions.filter((d) => d.decision === 'promoted').length,
      retained_count: payload.decisions.filter((d) => d.decision === 'retained').length,
      timestamp: new Date().toISOString(),
    };

    logger.info('promotion_started', logContext);

    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .rpc('process_class_promotion', {
          p_academic_year_from: payload.academic_year_from,
          p_academic_year_to: payload.academic_year_to,
          p_kelas_from: payload.kelas_from,
          p_decisions: payload.decisions as any,
        });

      if (error) {
        logger.error('promotion_failed', { ...logContext, error: error.message });
        throw new Error(error.message || 'Proses kenaikan kelas gagal.');
      }

      const result = data as PromotionBatchResult;
      logger.info('promotion_completed', { ...logContext, result });
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat kenaikan kelas.';
      logger.error('promotion_failed', { ...logContext, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
};
