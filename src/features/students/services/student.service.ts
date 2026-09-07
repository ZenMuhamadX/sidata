import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import type {
  Student,
  StudentFormData,
  StudentFilters,
  StudentListResult,
  DashboardStats,
} from '../types/student.types';
import type { StatusSiswa, StudentInsert, StudentUpdate } from '../../../types/database';

function formatDatabaseError(err: unknown): Error {
  if (err && typeof err === 'object') {
    const pgError = err as { code?: string; message?: string; details?: string };

    // Unique constraint violation
    if (pgError.code === '23505') {
      const details = (pgError.details || pgError.message || '').toLowerCase();
      if (details.includes('nik') || details.includes('uq_students_nik')) {
        return new Error('NIK sudah digunakan oleh siswa lain.');
      }
      if (details.includes('nisn') || details.includes('uq_idx_students_nisn')) {
        return new Error('NISN sudah digunakan oleh siswa lain.');
      }
      return new Error('Data dengan identitas unik ini sudah terdaftar.');
    }

    if (pgError.message) {
      return new Error(pgError.message);
    }
  }

  return new Error('Terjadi kesalahan pada database. Silakan coba lagi.');
}

function preparePayload(formData: StudentFormData): Omit<StudentInsert, 'id' | 'created_at' | 'updated_at'> {
  return {
    nama: formData.nama.trim(),
    jenis_kelamin: formData.jenis_kelamin,
    nisn: formData.nisn?.trim() ? formData.nisn.trim() : null,
    nik: formData.nik.trim(),
    tempat_lahir: formData.tempat_lahir.trim(),
    tanggal_lahir: formData.tanggal_lahir.trim(),
    agama: formData.agama,
    alamat: formData.alamat.trim(),
    rt: formData.rt?.trim() ? formData.rt.trim() : null,
    rw: formData.rw?.trim() ? formData.rw.trim() : null,
    dusun: formData.dusun?.trim() ? formData.dusun.trim() : null,
    kelurahan: formData.kelurahan.trim(),
    kecamatan: formData.kecamatan.trim(),
    kode_pos: formData.kode_pos?.trim() ? formData.kode_pos.trim() : null,
    jenis_tinggal: formData.jenis_tinggal?.trim() ? formData.jenis_tinggal.trim() : null,
    alat_transportasi: formData.alat_transportasi?.trim() ? formData.alat_transportasi.trim() : null,
    hp: formData.hp?.trim() ? formData.hp.trim() : null,
    kelas: Number(formData.kelas),
    nomor_registrasi_akta_lahir: formData.nomor_registrasi_akta_lahir?.trim()
      ? formData.nomor_registrasi_akta_lahir.trim()
      : null,
    anak_ke: formData.anak_ke?.trim() ? parseInt(formData.anak_ke.trim(), 10) : null,
    ket: formData.ket?.trim() ? formData.ket.trim() : null,
    status_siswa: formData.status_siswa || 'aktif',
  };
}

export const studentService = {
  async getStudents(filters: StudentFilters): Promise<StudentListResult> {
    logger.debug('Memuat daftar siswa', {
      page: filters.page,
      search: filters.search ? '[SEARCH_APPLIED]' : undefined,
      kelas: filters.kelas,
      status: filters.status_siswa,
    });

    try {
      let query = supabase
        .schema('assyifa')
        .from('students')
        .select('*', { count: 'exact' });

      // Filter Status (default 'aktif' jika tidak diatur)
      if (filters.status_siswa && filters.status_siswa !== 'all') {
        query = query.eq('status_siswa', filters.status_siswa);
      }

      // Filter Kelas
      if (filters.kelas && filters.kelas !== 'all') {
        query = query.eq('kelas', Number(filters.kelas));
      }

      // Search (nama, nik, nisn, nomor_registrasi_akta_lahir)
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.trim().replace(/,/g, '');
        query = query.or(
          `nama.ilike.%${q}%,nik.ilike.%${q}%,nisn.ilike.%${q}%,nomor_registrasi_akta_lahir.ilike.%${q}%`
        );
      }

      // Sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      // Pagination
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Gagal mengambil daftar siswa', { code: error.code });
        throw formatDatabaseError(error);
      }

      const total = count ?? 0;
      const totalPages = Math.ceil(total / filters.pageSize) || 1;

      return {
        students: (data as Student[]) || [],
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
      };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal memuat data siswa. Silakan coba lagi.');
    }
  },

  async getStudentById(id: string): Promise<Student> {
    logger.debug('Memuat detail siswa', { studentId: id });

    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Gagal memuat detail siswa', { studentId: id, code: error.code });
        throw formatDatabaseError(error);
      }

      return data as Student;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Data siswa tidak ditemukan.');
    }
  },

  async createStudent(formData: StudentFormData): Promise<Student> {
    logger.info('Menyimpan data siswa baru');

    try {
      const payload = preparePayload(formData);
      const { data, error } = await supabase
        .schema('assyifa')
        .from('students')
        .insert(payload as StudentInsert)
        .select()
        .single();

      if (error) {
        logger.error('Gagal membuat data siswa', { code: error.code });
        throw formatDatabaseError(error);
      }

      logger.info('Data siswa berhasil disimpan', { studentId: data.id });
      return data as Student;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal menyimpan data siswa.');
    }
  },

  async updateStudent(id: string, formData: StudentFormData): Promise<Student> {
    logger.info('Memperbarui data siswa', { studentId: id });

    try {
      const payload = preparePayload(formData);
      const { data, error } = await supabase
        .schema('assyifa')
        .from('students')
        .update(payload as StudentUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Gagal memperbarui data siswa', { studentId: id, code: error.code });
        throw formatDatabaseError(error);
      }

      logger.info('Data siswa berhasil diperbarui', { studentId: id });
      return data as Student;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal memperbarui data siswa.');
    }
  },

  async updateStudentStatus(id: string, status: StatusSiswa): Promise<Student> {
    logger.info('Mengubah status siswa', { studentId: id, status });

    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('students')
        .update({ status_siswa: status } as StudentUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Gagal mengubah status siswa', { studentId: id, code: error.code });
        throw formatDatabaseError(error);
      }

      logger.info('Status siswa berhasil diubah', { studentId: id, status });
      return data as Student;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal mengubah status siswa.');
    }
  },

  async deleteStudent(id: string): Promise<void> {
    logger.warn('Menghapus data siswa permanen', { studentId: id });

    try {
      const { error } = await supabase
        .schema('assyifa')
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Gagal menghapus data siswa', { studentId: id, code: error.code });
        throw formatDatabaseError(error);
      }

      logger.info('Data siswa berhasil dihapus permanen', { studentId: id });
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal menghapus data siswa.');
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    logger.debug('Memuat ringkasan statistik siswa untuk dashboard');

    try {
      // Ambil total, aktif, dan tidak_aktif
      const [allRes, activeRes, inactiveRes] = await Promise.all([
        supabase.schema('assyifa').from('students').select('*', { count: 'exact', head: true }),
        supabase.schema('assyifa').from('students').select('*', { count: 'exact', head: true }).eq('status_siswa', 'aktif'),
        supabase.schema('assyifa').from('students').select('*', { count: 'exact', head: true }).eq('status_siswa', 'tidak_aktif'),
      ]);

      if (allRes.error) throw allRes.error;
      if (activeRes.error) throw activeRes.error;
      if (inactiveRes.error) throw inactiveRes.error;

      // Ambil jumlah per kelas (1 s.d. 6)
      const classPromises = [1, 2, 3, 4, 5, 6].map(async (kelas) => {
        const res = await supabase
          .schema('assyifa')
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('kelas', kelas);
        return { kelas, count: res.count ?? 0 };
      });

      const classResults = await Promise.all(classPromises);
      const perKelas: Record<number, number> = {};
      classResults.forEach((item) => {
        perKelas[item.kelas] = item.count;
      });

      return {
        total: allRes.count ?? 0,
        aktif: activeRes.count ?? 0,
        tidakAktif: inactiveRes.count ?? 0,
        perKelas,
      };
    } catch (err) {
      logger.error('Gagal memuat statistik dashboard', { err });
      throw new Error('Gagal memuat statistik siswa.');
    }
  },
};
