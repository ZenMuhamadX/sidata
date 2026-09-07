import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import type {
  ParentWithStudent,
  ParentFormData,
  ParentFilters,
  ParentListResult,
  Parent,
} from '../types/parent.types';
import type { ParentInsert, ParentUpdate } from '../../../types/database';

function formatDatabaseError(err: unknown): Error {
  if (err && typeof err === 'object') {
    const pgError = err as { code?: string; message?: string; details?: string };

    // Unique constraint violation (student_id + hubungan)
    if (pgError.code === '23505') {
      const details = (pgError.details || pgError.message || '').toLowerCase();
      if (details.includes('uq_parents_student_hubungan') || details.includes('hubungan')) {
        return new Error('Data ayah/ibu untuk siswa ini sudah tersedia.');
      }
      return new Error('Data orang tua dengan data ini sudah terdaftar.');
    }

    if (pgError.message) {
      return new Error(pgError.message);
    }
  }

  return new Error('Terjadi kesalahan pada database. Silakan coba lagi.');
}

function preparePayload(formData: ParentFormData): ParentInsert {
  return {
    student_id: formData.student_id,
    hubungan: formData.hubungan,
    nama: formData.nama?.trim() ? formData.nama.trim() : null,
    nik: formData.nik?.trim() ? formData.nik.trim() : null,
    tahun_lahir: formData.tahun_lahir?.trim() ? parseInt(formData.tahun_lahir.trim(), 10) : null,
    jenjang_pendidikan: formData.jenjang_pendidikan?.trim() ? formData.jenjang_pendidikan.trim() : null,
    pekerjaan: formData.pekerjaan?.trim() ? formData.pekerjaan.trim() : null,
    penghasilan: formData.penghasilan?.trim() ? formData.penghasilan.trim() : null,
  };
}

export const parentService = {
  async getParents(filters: ParentFilters): Promise<ParentListResult> {
    logger.debug('Memuat daftar orang tua', {
      page: filters.page,
      search: filters.search ? '[SEARCH_APPLIED]' : undefined,
      hubungan: filters.hubungan,
      kelas: filters.kelas,
      status: filters.status_siswa,
    });

    try {
      // Query relasi ke students
      let query = supabase
        .schema('assyifa')
        .from('parents')
        .select('*, students!inner(id, nama, kelas, status_siswa, nik, nisn)', { count: 'exact' });

      // Filter Hubungan (ayah / ibu)
      if (filters.hubungan && filters.hubungan !== 'all') {
        query = query.eq('hubungan', filters.hubungan);
      }

      // Filter Kelas Siswa
      if (filters.kelas && filters.kelas !== 'all') {
        query = query.eq('students.kelas', Number(filters.kelas));
      }

      // Filter Status Siswa (default 'aktif')
      if (filters.status_siswa && filters.status_siswa !== 'all') {
        query = query.eq('students.status_siswa', filters.status_siswa);
      }

      // Search (nama orang tua, NIK orang tua, atau nama siswa)
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.trim().replace(/,/g, '');

        // Cari student_id yang namanya cocok
        const { data: matchedStudents } = await supabase
          .schema('assyifa')
          .from('students')
          .select('id')
          .ilike('nama', `%${q}%`);

        const matchedStudentIds = (matchedStudents || []).map((s) => s.id);

        if (matchedStudentIds.length > 0) {
          query = query.or(
            `nama.ilike.%${q}%,nik.ilike.%${q}%,student_id.in.(${matchedStudentIds.join(',')})`
          );
        } else {
          query = query.or(`nama.ilike.%${q}%,nik.ilike.%${q}%`);
        }
      }

      // Default sorting: nama orang tua ascending
      query = query.order('created_at', { ascending: false });

      // Pagination
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Gagal mengambil daftar orang tua', { code: error.code });
        throw formatDatabaseError(error);
      }

      const total = count ?? 0;
      const totalPages = Math.ceil(total / filters.pageSize) || 1;

      return {
        parents: (data as unknown as ParentWithStudent[]) || [],
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
      };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal memuat data orang tua. Silakan coba lagi.');
    }
  },

  async getParentById(id: string): Promise<ParentWithStudent> {
    logger.debug('Memuat detail orang tua', { parentId: id });

    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('parents')
        .select('*, students(id, nama, kelas, status_siswa, nik, nisn)')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Gagal memuat detail orang tua', { parentId: id, code: error.code });
        throw formatDatabaseError(error);
      }

      return data as unknown as ParentWithStudent;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Data orang tua tidak ditemukan.');
    }
  },

  async getParentsByStudentId(studentId: string): Promise<Parent[]> {
    logger.debug('Memuat data orang tua untuk siswa', { studentId });

    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('parents')
        .select('*')
        .eq('student_id', studentId);

      if (error) {
        logger.error('Gagal memuat orang tua siswa', { studentId, code: error.code });
        throw formatDatabaseError(error);
      }

      return (data as Parent[]) || [];
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal memuat data orang tua siswa.');
    }
  },

  async createParent(formData: ParentFormData): Promise<Parent> {
    logger.info('Menyimpan data orang tua baru', {
      studentId: formData.student_id,
      hubungan: formData.hubungan,
    });

    try {
      const payload = preparePayload(formData);
      const { data, error } = await supabase
        .schema('assyifa')
        .from('parents')
        .insert(payload)
        .select()
        .single();

      if (error) {
        logger.error('Gagal membuat data orang tua', { code: error.code });
        throw formatDatabaseError(error);
      }

      logger.info('Data orang tua berhasil disimpan', { parentId: data.id });
      return data as Parent;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal menyimpan data orang tua.');
    }
  },

  async updateParent(id: string, formData: ParentFormData): Promise<Parent> {
    logger.info('Memperbarui data orang tua', { parentId: id });

    try {
      const payload = preparePayload(formData);
      const { data, error } = await supabase
        .schema('assyifa')
        .from('parents')
        .update(payload as ParentUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Gagal memperbarui data orang tua', { parentId: id, code: error.code });
        throw formatDatabaseError(error);
      }

      logger.info('Data orang tua berhasil diperbarui', { parentId: id });
      return data as Parent;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal memperbarui data orang tua.');
    }
  },

  async deleteParent(id: string): Promise<void> {
    logger.warn('Menghapus data orang tua', { parentId: id });

    try {
      const { error } = await supabase
        .schema('assyifa')
        .from('parents')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Gagal menghapus data orang tua', { parentId: id, code: error.code });
        throw formatDatabaseError(error);
      }

      logger.info('Data orang tua berhasil dihapus', { parentId: id });
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal menghapus data orang tua.');
    }
  },

  async searchStudentsForSelector(query: string) {
    logger.debug('Mencari siswa untuk selector orang tua', { query });

    try {
      let q = supabase
        .schema('assyifa')
        .from('students')
        .select('id, nama, kelas, nik, nisn, status_siswa')
        .order('nama', { ascending: true })
        .limit(20);

      if (query && query.trim() !== '') {
        const clean = query.trim().replace(/,/g, '');
        q = q.or(`nama.ilike.%${clean}%,nik.ilike.%${clean}%,nisn.ilike.%${clean}%`);
      }

      const { data, error } = await q;

      if (error) {
        logger.error('Gagal mencari siswa', { code: error.code });
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  },
};
