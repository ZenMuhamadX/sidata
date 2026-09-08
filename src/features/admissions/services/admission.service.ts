import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import type {
  StudentAdmissionWithRelations,
  AdmissionFilters,
  AdmissionListResult,
  AdmissionCreateFormData,
  AdmissionStatus,
} from '../types/admission.types';
import { validateAdmissionForm } from '../validation/admission.validation';
import type { StudentInsert } from '../../../types/database';

export const admissionService = {
  /**
   * Fetch paginated list of admissions with filters
   */
  async getAdmissions(filters: AdmissionFilters): Promise<AdmissionListResult> {
    logger.debug('Memuat daftar calon siswa', { filters });

    try {
      let query = supabase
        .schema('assyifa')
        .from('student_admissions')
        .select(`
          id,
          student_id,
          academic_year_id,
          status,
          target_kelas,
          created_at,
          updated_at,
          student:student_id (
            id,
            nama,
            jenis_kelamin,
            nisn,
            nik,
            tempat_lahir,
            tanggal_lahir,
            agama,
            alamat,
            rt,
            rw,
            dusun,
            kelurahan,
            kecamatan,
            kode_pos,
            jenis_tinggal,
            alat_transportasi,
            hp,
            kelas,
            nomor_registrasi_akta_lahir,
            anak_ke,
            ket,
            status_siswa,
            created_at,
            updated_at
          ),
          academic_year:academic_year_id (
            id,
            tahun_ajaran,
            status,
            created_at,
            updated_at
          )
        `, { count: 'exact' });

      // Filter Status
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Filter Academic Year
      if (filters.academic_year_id && filters.academic_year_id !== 'all') {
        query = query.eq('academic_year_id', filters.academic_year_id);
      }

      // Sorting
      query = query.order('created_at', { ascending: filters.sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        logger.error('Gagal memuat calon siswa', { error: error.message });
        throw new Error(`Gagal memuat calon siswa: ${error.message}`);
      }

      let formatted = ((data || []) as any[]).map((item) => ({
        id: item.id,
        student_id: item.student_id,
        academic_year_id: item.academic_year_id,
        status: item.status,
        target_kelas: item.target_kelas,
        created_at: item.created_at,
        updated_at: item.updated_at,
        student: item.student,
        academic_year: item.academic_year,
      })) as StudentAdmissionWithRelations[];

      // Client-side search filtering across student relation fields
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.trim().toLowerCase();
        formatted = formatted.filter((item) => {
          const s = item.student;
          if (!s) return false;
          return (
            (s.nama && s.nama.toLowerCase().includes(q)) ||
            (s.nik && s.nik.includes(q)) ||
            (s.nisn && s.nisn.includes(q)) ||
            (s.nomor_registrasi_akta_lahir && s.nomor_registrasi_akta_lahir.toLowerCase().includes(q))
          );
        });
      }

      const total = count ?? formatted.length;
      const totalPages = Math.ceil(total / filters.pageSize) || 1;

      // Slice for pagination
      const from = (filters.page - 1) * filters.pageSize;
      const paginated = formatted.slice(from, from + filters.pageSize);

      return {
        admissions: paginated,
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
      };
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat memuat data calon siswa.');
    }
  },

  /**
   * Get admission details by admission ID
   */
  async getAdmissionById(id: string): Promise<StudentAdmissionWithRelations> {
    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('student_admissions')
        .select(`
          id,
          student_id,
          academic_year_id,
          status,
          target_kelas,
          created_at,
          updated_at,
          student:student_id (
            *
          ),
          academic_year:academic_year_id (
            *
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        logger.error('Data calon siswa tidak ditemukan', { id, error: error?.message });
        throw new Error('Data calon siswa tidak ditemukan.');
      }

      const row = data as any;
      return {
        id: row.id,
        student_id: row.student_id,
        academic_year_id: row.academic_year_id,
        status: row.status,
        target_kelas: row.target_kelas,
        created_at: row.created_at,
        updated_at: row.updated_at,
        student: row.student,
        academic_year: row.academic_year,
      };
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal memuat rincian calon siswa.');
    }
  },

  /**
   * Create candidate student and admission record.
   * Student is created with status_siswa = 'tidak_aktif' and kelas = 1.
   */
  async createCandidate(formData: AdmissionCreateFormData): Promise<StudentAdmissionWithRelations> {
    const validation = validateAdmissionForm(formData);
    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0] || 'Validasi formulir calon siswa gagal.';
      throw new Error(firstErr);
    }

    let createdStudentId: string | null = null;

    try {
      // 1. Prepare student payload
      const studentPayload: StudentInsert = {
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
        kelas: 1, // Target kelas awal default 1
        nomor_registrasi_akta_lahir: formData.nomor_registrasi_akta_lahir?.trim()
          ? formData.nomor_registrasi_akta_lahir.trim()
          : null,
        anak_ke: formData.anak_ke?.trim() ? parseInt(formData.anak_ke.trim(), 10) : null,
        ket: formData.ket?.trim() ? formData.ket.trim() : null,
        status_siswa: 'tidak_aktif', // Calon siswa belum berstatus aktif
      };

      // 2. Insert student record
      const { data: studentData, error: studentError } = await supabase
        .schema('assyifa')
        .from('students')
        .insert(studentPayload)
        .select()
        .single();

      if (studentError || !studentData) {
        if (studentError?.code === '23505') {
          throw new Error('NIK atau NISN siswa sudah terdaftar.');
        }
        throw new Error(`Gagal menyimpan data identitas calon siswa: ${studentError?.message || ''}`);
      }

      createdStudentId = studentData.id;

      // 3. Insert student_admissions record
      const { data: admissionData, error: admissionError } = await supabase
        .schema('assyifa')
        .from('student_admissions')
        .insert({
          student_id: studentData.id,
          academic_year_id: formData.academic_year_id,
          status: 'candidate',
          target_kelas: 1,
        })
        .select(`
          id,
          student_id,
          academic_year_id,
          status,
          target_kelas,
          created_at,
          updated_at,
          academic_year:academic_year_id (*)
        `)
        .single();

      if (admissionError || !admissionData) {
        // Rollback created student to avoid orphaned records
        await supabase.schema('assyifa').from('students').delete().eq('id', studentData.id);
        if (admissionError?.code === '23505') {
          throw new Error('Siswa ini sudah memiliki pendaftaran untuk tahun ajaran tersebut.');
        }
        throw new Error(`Gagal membuat data pendaftaran calon siswa: ${admissionError?.message || ''}`);
      }

      const row = admissionData as any;
      return {
        id: row.id,
        student_id: row.student_id,
        academic_year_id: row.academic_year_id,
        status: row.status,
        target_kelas: row.target_kelas,
        created_at: row.created_at,
        updated_at: row.updated_at,
        student: studentData,
        academic_year: row.academic_year,
      };
    } catch (err: unknown) {
      // Cleanup if needed
      if (createdStudentId) {
        await supabase.schema('assyifa').from('students').delete().eq('id', createdStudentId);
      }
      if (err instanceof Error) throw err;
      throw new Error('Gagal memproses pendaftaran calon siswa.');
    }
  },

  /**
   * Update admission status (e.g. accepted, rejected, cancelled)
   */
  async updateAdmissionStatus(admissionId: string, status: AdmissionStatus): Promise<void> {
    try {
      if (status === 'enrolled') {
        throw new Error('Gunakan aksi "Daftarkan sebagai Siswa" untuk status enrolled.');
      }

      const { error } = await supabase
        .schema('assyifa')
        .from('student_admissions')
        .update({ status })
        .eq('id', admissionId);

      if (error) {
        logger.error('Gagal mengubah status pendaftaran', { admissionId, status, error: error.message });
        throw new Error(`Gagal mengubah status: ${error.message}`);
      }

      logger.info('Status pendaftaran berhasil diperbarui', { admissionId, status });
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal mengubah status calon siswa.');
    }
  },

  /**
   * Atomic enrollment using RPC function
   */
  async enrollCandidate(admissionId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .rpc('enroll_student_admission', {
          p_admission_id: admissionId,
        });

      if (error) {
        logger.error('Gagal mendaftarkan calon siswa secara resmi (RPC)', { admissionId, error: error.message });
        throw new Error(`Pendaftaran resmi gagal: ${error.message}`);
      }

      logger.info('Calon siswa berhasil didaftarkan secara resmi', { admissionId, result: data });
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat mendaftarkan calon siswa.');
    }
  },
};
