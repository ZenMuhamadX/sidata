import * as XLSX from 'xlsx';
import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import type {
  ExportFilters,
  StudentWithParentsExport,
  ExportSummaryStats,
} from '../types/export.types';
import type { StudentRow, ParentRow } from '../../../types/database';

export const exportService = {
  /**
   * Mengambil seluruh data siswa beserta orang tua dari database sesuai filter yang diberikan.
   * Query ini TIDAK dipaginate sehingga mengambil semua data matching.
   */
  async getExportData(filters?: ExportFilters): Promise<StudentWithParentsExport[]> {
    logger.info('Mengambil data siswa untuk export Excel', { filters });

    try {
      // 1. Query data siswa
      let query = supabase
        .schema('assyifa')
        .from('students')
        .select('*');

      if (filters) {
        if (filters.status_siswa && filters.status_siswa !== 'all') {
          query = query.eq('status_siswa', filters.status_siswa);
        }

        if (filters.kelas && filters.kelas !== 'all') {
          query = query.eq('kelas', Number(filters.kelas));
        }

        if (filters.search && filters.search.trim() !== '') {
          const q = filters.search.trim().replace(/,/g, '');
          query = query.or(
            `nama.ilike.%${q}%,nik.ilike.%${q}%,nisn.ilike.%${q}%,nomor_registrasi_akta_lahir.ilike.%${q}%`
          );
        }
      }

      query = query.order('kelas', { ascending: true }).order('nama', { ascending: true });

      const { data: studentsData, error: studentsError } = await query;

      if (studentsError) {
        logger.error('Gagal query students untuk export', { error: studentsError.message });
        throw new Error('Gagal mengambil data siswa dari database.');
      }

      const students = (studentsData as StudentRow[]) || [];

      if (students.length === 0) {
        return [];
      }

      // 2. Query data orang tua berdasarkan student_id
      const studentIds = students.map((s) => s.id);
      const parentsByStudentId: Record<string, { ayah?: ParentRow; ibu?: ParentRow }> = {};

      // Chunk per 100 agar query in() aman
      for (let i = 0; i < studentIds.length; i += 100) {
        const chunk = studentIds.slice(i, i + 100);
        const { data: parentsData, error: parentsError } = await supabase
          .schema('assyifa')
          .from('parents')
          .select('*')
          .in('student_id', chunk);

        if (parentsError) {
          logger.warn('Gagal query parents chunk untuk export', { error: parentsError.message });
          // Lanjutkan tanpa menggagalkan seluruh export
        } else if (parentsData) {
          (parentsData as ParentRow[]).forEach((p) => {
            if (!parentsByStudentId[p.student_id]) {
              parentsByStudentId[p.student_id] = {};
            }
            if (p.hubungan === 'ayah') {
              parentsByStudentId[p.student_id].ayah = p;
            } else if (p.hubungan === 'ibu') {
              parentsByStudentId[p.student_id].ibu = p;
            }
          });
        }
      }

      // 3. Mapping gabungan siswa + orang tua
      const combined: StudentWithParentsExport[] = students.map((s) => {
        const parentData = parentsByStudentId[s.id] || {};
        const ayah = parentData.ayah;
        const ibu = parentData.ibu;

        return {
          nama: s.nama,
          jenis_kelamin: s.jenis_kelamin,
          nisn: s.nisn,
          tempat_lahir: s.tempat_lahir,
          tanggal_lahir: s.tanggal_lahir,
          nik: s.nik,
          agama: s.agama,
          alamat: s.alamat,
          rt: s.rt,
          rw: s.rw,
          dusun: s.dusun,
          kelurahan: s.kelurahan,
          kecamatan: s.kecamatan,
          kode_pos: s.kode_pos,
          jenis_tinggal: s.jenis_tinggal,
          alat_transportasi: s.alat_transportasi,
          hp: s.hp,
          kelas: s.kelas,
          nomor_registrasi_akta_lahir: s.nomor_registrasi_akta_lahir,
          anak_ke: s.anak_ke,
          ket: s.ket,
          status_siswa: s.status_siswa,

          // Data Ayah
          nama_ayah: ayah?.nama ?? null,
          tahun_lahir_ayah: ayah?.tahun_lahir ?? null,
          jenjang_pendidikan_ayah: ayah?.jenjang_pendidikan ?? null,
          pekerjaan_ayah: ayah?.pekerjaan ?? null,
          penghasilan_ayah: ayah?.penghasilan ?? null,
          nik_ayah: ayah?.nik ?? null,

          // Data Ibu
          nama_ibu: ibu?.nama ?? null,
          tahun_lahir_ibu: ibu?.tahun_lahir ?? null,
          jenjang_pendidikan_ibu: ibu?.jenjang_pendidikan ?? null,
          pekerjaan_ibu: ibu?.pekerjaan ?? null,
          penghasilan_ibu: ibu?.penghasilan ?? null,
          nik_ibu: ibu?.nik ?? null,
        };
      });

      return combined;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat memproses data export.');
    }
  },

  /**
   * Format tanggal lahir ke dd-mm-yyyy
   */
  formatTanggalLahir(rawDate: string): string {
    if (!rawDate) return '';
    // YYYY-MM-DD
    const parts = rawDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return rawDate;
  },

  /**
   * Menghasilkan nama file yang informatif
   */
  generateFileName(filters?: ExportFilters): string {
    const today = new Date().toISOString().split('T')[0];
    if (!filters) {
      return `data-siswa-semua-${today}.xlsx`;
    }

    const parts: string[] = ['data-siswa'];
    if (filters.kelas && filters.kelas !== 'all') {
      parts.push(`kelas-${filters.kelas}`);
    }
    if (filters.status_siswa && filters.status_siswa !== 'all') {
      parts.push(filters.status_siswa);
    }
    parts.push(today);
    return `${parts.join('-')}.xlsx`;
  },

  /**
   * Membuat file Excel .xlsx dan memicu download otomatis di browser
   */
  generateExcel(data: StudentWithParentsExport[], fileName: string): void {
    logger.info('Memulai pembuatan file Excel .xlsx', { rowCount: data.length, fileName });

    if (data.length === 0) {
      throw new Error('Tidak ada data yang sesuai dengan filter.');
    }

    // 1. Header 35 Kolom persis spesifikasi Stage 8
    const headers = [
      'No',
      'Nama',
      'JK',
      'NISN',
      'Tempat Lahir',
      'Tanggal Lahir',
      'NIK',
      'Agama',
      'Alamat',
      'RT',
      'RW',
      'Dusun',
      'Kelurahan',
      'Kecamatan',
      'Kode Pos',
      'Jenis Tinggal',
      'Alat Transportasi',
      'HP',
      'Kelas',
      'No Registrasi Akta Lahir',
      'Anak ke-berapa',
      'KET',
      'Status Siswa',
      'Nama Ayah',
      'Tahun Lahir Ayah',
      'Jenjang Pendidikan Ayah',
      'Pekerjaan Ayah',
      'Penghasilan Ayah',
      'NIK Ayah',
      'Nama Ibu',
      'Tahun Lahir Ibu',
      'Jenjang Pendidikan Ibu',
      'Pekerjaan Ibu',
      'Penghasilan Ibu',
      'NIK Ibu',
    ];

    // 2. Baris Data (Preserve teks untuk NIK, NISN, HP, RT, RW, No Akta)
    const rows = data.map((item, index) => [
      index + 1,
      item.nama || '',
      item.jenis_kelamin || '',
      item.nisn ? String(item.nisn) : '',
      item.tempat_lahir || '',
      this.formatTanggalLahir(item.tanggal_lahir),
      item.nik ? String(item.nik) : '',
      item.agama || '',
      item.alamat || '',
      item.rt ? String(item.rt) : '',
      item.rw ? String(item.rw) : '',
      item.dusun || '',
      item.kelurahan || '',
      item.kecamatan || '',
      item.kode_pos ? String(item.kode_pos) : '',
      item.jenis_tinggal || '',
      item.alat_transportasi || '',
      item.hp ? String(item.hp) : '',
      item.kelas,
      item.nomor_registrasi_akta_lahir ? String(item.nomor_registrasi_akta_lahir) : '',
      item.anak_ke ?? '',
      item.ket || '',
      item.status_siswa || '',
      item.nama_ayah || '',
      item.tahun_lahir_ayah ?? '',
      item.jenjang_pendidikan_ayah || '',
      item.pekerjaan_ayah || '',
      item.penghasilan_ayah || '',
      item.nik_ayah ? String(item.nik_ayah) : '',
      item.nama_ibu || '',
      item.tahun_lahir_ibu ?? '',
      item.jenjang_pendidikan_ibu || '',
      item.pekerjaan_ibu || '',
      item.penghasilan_ibu || '',
      item.nik_ibu ? String(item.nik_ibu) : '',
    ]);

    // 3. Bangun Worksheet 'Data Siswa'
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Format text eksplisit untuk kolom NIK, NISN, HP, RT, RW, Akta agar tidak jadi scientific notation
    // Indeks kolom (0-based):
    // 3: NISN, 6: NIK, 9: RT, 10: RW, 14: Kode Pos, 17: HP, 19: No Akta, 28: NIK Ayah, 34: NIK Ibu
    const textColIndices = [3, 6, 9, 10, 14, 17, 19, 28, 34];
    for (let R = 1; R <= data.length; R++) {
      for (const C of textColIndices) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[cellRef]) {
          ws[cellRef].t = 's'; // tipe string murni
        }
      }
    }

    // Set lebar kolom yang wajar (autowidth)
    const colWidths = headers.map((header, colIdx) => {
      let maxLen = header.length;
      for (let r = 0; r < Math.min(rows.length, 50); r++) {
        const val = rows[r][colIdx];
        if (val !== null && val !== undefined) {
          maxLen = Math.max(maxLen, String(val).length);
        }
      }
      return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
    });
    ws['!cols'] = colWidths;

    // Autofilter pada header baris 1
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}1` };

    // 4. Bangun Worksheet 'Ringkasan'
    const classCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let activeCount = 0;
    let inactiveCount = 0;

    data.forEach((d) => {
      if (d.status_siswa === 'aktif') activeCount++;
      else inactiveCount++;
      if (classCounts[d.kelas] !== undefined) {
        classCounts[d.kelas]++;
      }
    });

    const summaryData = [
      ['RINGKASAN DATA EXPORT SISWA'],
      ['Tanggal Export', new Date().toLocaleDateString('id-ID')],
      [],
      ['Kategori', 'Jumlah Siswa'],
      ['Total Siswa', data.length],
      ['Siswa Aktif', activeCount],
      ['Siswa Tidak Aktif', inactiveCount],
      [],
      ['Tingkat Kelas', 'Jumlah Siswa'],
      ['Kelas 1', classCounts[1]],
      ['Kelas 2', classCounts[2]],
      ['Kelas 3', classCounts[3]],
      ['Kelas 4', classCounts[4]],
      ['Kelas 5', classCounts[5]],
      ['Kelas 6', classCounts[6]],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }];

    // 5. Masukkan ke Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

    // 6. Download file .xlsx
    XLSX.writeFile(wb, fileName);
    logger.info('File Excel berhasil diunduh', { fileName });
  },

  /**
   * Hitung statistik dari data untuk preview
   */
  calculateStats(data: StudentWithParentsExport[]): ExportSummaryStats {
    const stats: ExportSummaryStats = {
      total: data.length,
      active: 0,
      inactive: 0,
      classCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    };

    data.forEach((item) => {
      if (item.status_siswa === 'aktif') {
        stats.active++;
      } else {
        stats.inactive++;
      }

      if (stats.classCounts[item.kelas] !== undefined) {
        stats.classCounts[item.kelas]++;
      }
    });

    return stats;
  },
};
