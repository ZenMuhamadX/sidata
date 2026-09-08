import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import type {
  AcademicYear,
  AcademicYearWithCount,
  AcademicYearFormData,
} from '../types/academic.types';
import { validateAcademicYearForm } from '../validation/academic.validation';

export const academicYearService = {
  /**
   * Centralized method to fetch the currently active academic year.
   * Returns null if no active academic year is found.
   */
  async getActiveAcademicYear(): Promise<AcademicYear | null> {
    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        logger.error('Gagal mengambil tahun ajaran aktif', { error: error.message });
        throw new Error(`Gagal mengambil tahun ajaran aktif: ${error.message}`);
      }

      return data as AcademicYear | null;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Terjadi kesalahan saat memuat tahun ajaran aktif.');
    }
  },

  /**
   * Fetch all academic years ordered by tahun_ajaran descending,
   * including student count from student_academic_records.
   */
  async getAcademicYears(): Promise<AcademicYearWithCount[]> {
    try {
      // 1. Fetch academic years
      const { data: years, error: yearsError } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .select('*')
        .order('tahun_ajaran', { ascending: false });

      if (yearsError) {
        logger.error('Gagal memuat daftar tahun ajaran', { error: yearsError.message });
        throw new Error(`Gagal memuat daftar tahun ajaran: ${yearsError.message}`);
      }

      if (!years || years.length === 0) {
        return [];
      }

      // 2. Fetch counts per academic_year_id from student_academic_records
      const { data: records, error: recordsError } = await supabase
        .schema('assyifa')
        .from('student_academic_records')
        .select('academic_year_id');

      if (recordsError) {
        logger.error('Gagal menghitung statistik siswa tahun ajaran', { error: recordsError.message });
        // Fallback with 0 counts rather than breaking UI
        return (years as AcademicYear[]).map((y) => ({ ...y, student_count: 0 }));
      }

      const countMap: Record<string, number> = {};
      if (records) {
        for (const rec of records as { academic_year_id: string }[]) {
          if (rec.academic_year_id) {
            countMap[rec.academic_year_id] = (countMap[rec.academic_year_id] || 0) + 1;
          }
        }
      }

      return (years as AcademicYear[]).map((y) => ({
        ...y,
        student_count: countMap[y.id] || 0,
      }));
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat memuat data tahun ajaran.');
    }
  },

  /**
   * Get academic year by ID.
   */
  async getAcademicYearById(id: string): Promise<AcademicYear> {
    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        logger.error('Tahun ajaran tidak ditemukan', { id, error: error?.message });
        throw new Error('Data tahun ajaran tidak ditemukan.');
      }

      return data as AcademicYear;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat memuat tahun ajaran.');
    }
  },

  /**
   * Create a new academic year.
   * If status is 'active', existing active year will be marked 'completed' first.
   */
  async createAcademicYear(formData: AcademicYearFormData): Promise<AcademicYear> {
    const validation = validateAcademicYearForm(formData);
    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0] || 'Validasi gagal.';
      throw new Error(firstErr);
    }

    try {
      const formattedTahun = formData.tahun_ajaran.trim();

      // Check if duplicate exists
      const { data: existing } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .select('id')
        .eq('tahun_ajaran', formattedTahun)
        .maybeSingle();

      if (existing) {
        throw new Error(`Tahun ajaran "${formattedTahun}" sudah terdaftar.`);
      }

      // If new year is set to 'active', complete the existing active year first
      if (formData.status === 'active') {
        const { error: deactivateError } = await supabase
          .schema('assyifa')
          .from('academic_years')
          .update({ status: 'completed' })
          .eq('status', 'active');

        if (deactivateError) {
          logger.error('Gagal menonaktifkan tahun ajaran aktif sebelumnya', { error: deactivateError.message });
          throw new Error('Gagal memperbarui status tahun ajaran aktif sebelumnya.');
        }
      }

      const { data, error } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .insert({
          tahun_ajaran: formattedTahun,
          status: formData.status,
        })
        .select()
        .single();

      if (error || !data) {
        logger.error('Gagal membuat tahun ajaran', { error: error?.message });
        throw new Error(error?.message || 'Gagal menyimpan tahun ajaran baru.');
      }

      const created = data as AcademicYear;
      logger.info('Tahun ajaran berhasil dibuat', { id: created.id, tahun: created.tahun_ajaran });
      return created;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat membuat tahun ajaran.');
    }
  },

  /**
   * Set a specific academic year as active.
   * Completes any currently active academic year first.
   */
  async setActiveAcademicYear(id: string): Promise<AcademicYear> {
    try {
      // 1. Mark existing active as completed
      const { error: deactivateErr } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .update({ status: 'completed' })
        .eq('status', 'active');

      if (deactivateErr) {
        logger.error('Gagal memperbarui status tahun ajaran lama', { error: deactivateErr.message });
        throw new Error(`Gagal memperbarui status tahun ajaran lama: ${deactivateErr.message}`);
      }

      // 2. Set target year as active
      const { data, error: activateErr } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single();

      if (activateErr || !data) {
        logger.error('Gagal mengaktifkan tahun ajaran', { id, error: activateErr?.message });
        throw new Error(`Gagal mengaktifkan tahun ajaran: ${activateErr?.message || 'Data tidak ditemukan'}`);
      }

      const updated = data as AcademicYear;
      logger.info('Tahun ajaran berhasil diaktifkan', { id, tahun: updated.tahun_ajaran });
      return updated;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat mengaktifkan tahun ajaran.');
    }
  },

  /**
   * Mark an academic year as completed.
   */
  async completeAcademicYear(id: string): Promise<AcademicYear> {
    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .update({ status: 'completed' })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        logger.error('Gagal menyelesaikan tahun ajaran', { id, error: error?.message });
        throw new Error(`Gagal menyelesaikan tahun ajaran: ${error?.message || 'Data tidak ditemukan'}`);
      }

      const updated = data as AcademicYear;
      logger.info('Tahun ajaran berhasil diselesaikan', { id, tahun: updated.tahun_ajaran });
      return updated;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat menyelesaikan tahun ajaran.');
    }
  },

  /**
   * Delete an academic year only if no student records exist.
   */
  async deleteAcademicYear(id: string): Promise<void> {
    try {
      // Check for associated student records
      const { data: records, error: countErr } = await supabase
        .schema('assyifa')
        .from('student_academic_records')
        .select('id')
        .eq('academic_year_id', id)
        .limit(1);

      if (countErr) {
        throw new Error(`Gagal memeriksa riwayat akademik: ${countErr.message}`);
      }

      if (records && records.length > 0) {
        throw new Error('Tahun ajaran tidak dapat dihapus karena sudah memiliki data riwayat siswa.');
      }

      const { error } = await supabase
        .schema('assyifa')
        .from('academic_years')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Gagal menghapus tahun ajaran', { id, error: error.message });
        throw new Error(`Gagal menghapus tahun ajaran: ${error.message}`);
      }

      logger.info('Tahun ajaran berhasil dihapus', { id });
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat menghapus tahun ajaran.');
    }
  },
};
