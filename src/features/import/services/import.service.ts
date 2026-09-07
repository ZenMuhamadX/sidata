import * as XLSX from 'xlsx';
import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import {
  detectClassFromSheetName,
  normalizeAgama,
  normalizeExcelDate,
  normalizeJK,
  sanitizeNik,
  sanitizeString,
} from '../utils/excelParser.utils';
import type {
  ImportResultSummary,
  ParsedRowData,
  SheetInfo,
  ValidationSummary,
} from '../types/import.types';
import type { StudentInsert, ParentInsert } from '../../../types/database';

export const importService = {
  /**
   * Baca file .xlsx dan ekstrak daftar sheet beserta deteksi kelas
   */
  async inspectWorkbook(file: File): Promise<{ workbook: XLSX.WorkBook; sheets: SheetInfo[] }> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    const sheets: SheetInfo[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      // Hitung baris data
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const rowCount = Math.max(0, range.e.r); // Baris setelah header

      const { detected, isAmbiguous } = detectClassFromSheetName(sheetName);

      sheets.push({
        name: sheetName,
        detectedClass: detected,
        assignedClass: detected || 1, // Default ke 1 jika tidak terdeteksi
        isAmbiguous: isAmbiguous || detected === null,
        rowCount,
      });
    }

    return { workbook, sheets };
  },

  /**
   * Parse baris dari seluruh sheets sesuai kelas yang dipilih
   */
  parseWorkbookData(workbook: XLSX.WorkBook, sheets: SheetInfo[]): ParsedRowData[] {
    const allRows: ParsedRowData[] = [];

    for (const sheetInfo of sheets) {
      const worksheet = workbook.Sheets[sheetInfo.name];
      if (!worksheet) continue;

      // Konversi sheet ke array of objects
      // defval: null agar tidak undefined
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        raw: true,
        defval: null,
      });

      rows.forEach((row, idx) => {
        // Cari key kolom dengan case-insensitive match & fuzzy
        const getVal = (candidates: string[]): unknown => {
          for (const cand of candidates) {
            const lowerCand = cand.toLowerCase().replace(/[\s_.-]/g, '');
            for (const key of Object.keys(row)) {
              const lowerKey = key.toLowerCase().replace(/[\s_.-]/g, '');
              if (lowerKey === lowerCand) {
                return row[key];
              }
            }
          }
          return null;
        };

        const nama = sanitizeString(getVal(['Nama', 'Nama Siswa', 'Nama Lengkap']));
        // Lewati jika nama kosong total
        if (!nama) return;

        const nik = sanitizeNik(getVal(['NIK', 'NIK Siswa', 'No Induk Kependudukan']));
        const nisnVal = sanitizeString(getVal(['NISN', 'Nomor Induk Siswa Nasional']));
        const nisn = nisnVal === '-' || nisnVal === '' ? null : nisnVal;
        const jk = normalizeJK(getVal(['JK', 'Jenis Kelamin', 'Gender']));
        const tempatLahir = sanitizeString(getVal(['Tempat Lahir']));
        const tanggalLahir = normalizeExcelDate(getVal(['Tanggal Lahir', 'Tgl Lahir']));
        const agama = normalizeAgama(getVal(['Agama']));
        const alamat = sanitizeString(getVal(['Alamat', 'Alamat Lengkap', 'Alamat Tempat Tinggal']));
        const rtVal = sanitizeString(getVal(['RT']));
        const rwVal = sanitizeString(getVal(['RW']));
        const dusunVal = sanitizeString(getVal(['Dusun', 'Kampung']));
        const kelurahan = sanitizeString(getVal(['Kelurahan', 'Desa', 'Kelurahan/Desa']));
        const kecamatan = sanitizeString(getVal(['Kecamatan']));
        const kodePosVal = sanitizeString(getVal(['Kode Pos']));
        const jenisTinggalVal = sanitizeString(getVal(['Jenis Tinggal']));
        const alatTransportasiVal = sanitizeString(getVal(['Alat Transportasi', 'Transportasi']));
        const hpVal = sanitizeString(getVal(['HP', 'No HP', 'Nomor HP', 'Telepon']));
        const noAktaVal = sanitizeString(getVal(['No Registrasi Akta Lahir', 'Nomor Registrasi Akta Lahir', 'Akta Lahir']));
        const anakKeRaw = getVal(['Anak ke-berapa', 'Anak ke', 'Anak Ke']);
        const anakKe = anakKeRaw ? parseInt(String(anakKeRaw), 10) || null : null;
        const ketVal = sanitizeString(getVal(['KET', 'Keterangan']));

        // Rombel Saat Ini check
        const rombelVal = sanitizeString(getVal(['Rombel Saat Ini', 'Rombel']));
        let rombelWarning: string | undefined;
        if (rombelVal) {
          const matchRombel = rombelVal.match(/([1-6])/);
          if (matchRombel && parseInt(matchRombel[1], 10) !== sheetInfo.assignedClass) {
            rombelWarning = `Rombel Saat Ini (${rombelVal}) berbeda dengan kelas sheet (Kelas ${sheetInfo.assignedClass}). Tetap menggunakan Kelas ${sheetInfo.assignedClass}.`;
          }
        }

        // Data Ayah
        const ayahNama = sanitizeString(getVal(['Nama Ayah', 'Nama Ayah Kandung']));
        const ayahThn = parseInt(String(getVal(['Tahun Lahir Ayah', 'Tahun Lahir Ayah Kandung'])), 10) || null;
        const ayahPendidikan = sanitizeString(getVal(['Jenjang Pendidikan Ayah', 'Pendidikan Ayah']));
        const ayahPekerjaan = sanitizeString(getVal(['Pekerjaan Ayah', 'Pekerjaan Ayah Kandung']));
        const ayahPenghasilan = sanitizeString(getVal(['Penghasilan Ayah', 'Penghasilan Ayah Kandung']));
        const ayahNik = sanitizeNik(getVal(['NIK Ayah', 'NIK Ayah Kandung']));

        const hasAyahData = Boolean(
          ayahNama || ayahThn || ayahPendidikan || ayahPekerjaan || ayahPenghasilan || ayahNik
        );

        const fatherData = hasAyahData
          ? {
              nama: ayahNama || null,
              tahun_lahir: ayahThn,
              jenjang_pendidikan: ayahPendidikan || null,
              pekerjaan: ayahPekerjaan || null,
              penghasilan: ayahPenghasilan && ayahPenghasilan !== '-' ? ayahPenghasilan : null,
              nik: ayahNik || null,
            }
          : null;

        // Data Ibu
        const ibuNama = sanitizeString(getVal(['Nama Ibu', 'Nama Ibu Kandung']));
        const ibuThn = parseInt(String(getVal(['Tahun Lahir Ibu', 'Tahun Lahir Ibu Kandung'])), 10) || null;
        const ibuPendidikan = sanitizeString(getVal(['Jenjang Pendidikan Ibu', 'Pendidikan Ibu']));
        const ibuPekerjaan = sanitizeString(getVal(['Pekerjaan Ibu', 'Pekerjaan Ibu Kandung']));
        const ibuPenghasilan = sanitizeString(getVal(['Penghasilan Ibu', 'Penghasilan Ibu Kandung']));
        const ibuNik = sanitizeNik(getVal(['NIK Ibu', 'NIK Ibu Kandung']));

        const hasIbuData = Boolean(
          ibuNama || ibuThn || ibuPendidikan || ibuPekerjaan || ibuPenghasilan || ibuNik
        );

        const motherData = hasIbuData
          ? {
              nama: ibuNama || null,
              tahun_lahir: ibuThn,
              jenjang_pendidikan: ibuPendidikan || null,
              pekerjaan: ibuPekerjaan || null,
              penghasilan: ibuPenghasilan && ibuPenghasilan !== '-' ? ibuPenghasilan : null,
              nik: ibuNik || null,
            }
          : null;

        allRows.push({
          rowIndex: idx + 2, // Header row 1, data row 2
          sheetName: sheetInfo.name,
          raw: row,

          nama,
          jenis_kelamin: jk,
          nisn,
          nik,
          tempat_lahir: tempatLahir,
          tanggal_lahir: tanggalLahir,
          agama,
          alamat,
          rt: rtVal || null,
          rw: rwVal || null,
          dusun: dusunVal || null,
          kelurahan,
          kecamatan,
          kode_pos: kodePosVal || null,
          jenis_tinggal: jenisTinggalVal || null,
          alat_transportasi: alatTransportasiVal || null,
          hp: hpVal || null,
          kelas: sheetInfo.assignedClass,
          nomor_registrasi_akta_lahir: noAktaVal || null,
          anak_ke: anakKe,
          ket: ketVal || null,

          father: fatherData,
          mother: motherData,

          rombelWarning,
          errors: [],
          warnings: rombelWarning ? [rombelWarning] : [],
          isValid: true,
        });
      });
    }

    return allRows;
  },

  /**
   * Validasi seluruh baris data termasuk cek duplicate workbook & duplicate database
   */
  async validateRows(rows: ParsedRowData[]): Promise<{
    validatedRows: ParsedRowData[];
    summary: ValidationSummary;
  }> {
    // 1. Validasi field dasar per row
    const nikCountInWorkbook: Record<string, number> = {};
    const nisnCountInWorkbook: Record<string, number> = {};

    rows.forEach((r) => {
      if (r.nik) {
        nikCountInWorkbook[r.nik] = (nikCountInWorkbook[r.nik] || 0) + 1;
      }
      if (r.nisn) {
        nisnCountInWorkbook[r.nisn] = (nisnCountInWorkbook[r.nisn] || 0) + 1;
      }
    });

    // 2. Cek duplicate di Database (fetch NIK & NISN yang ada di database)
    const workbookNiks = Array.from(new Set(rows.map((r) => r.nik).filter(Boolean)));
    const workbookNisns = Array.from(new Set(rows.map((r) => r.nisn).filter(Boolean))) as string[];

    const existingNiksInDb = new Set<string>();
    const existingNisnsInDb = new Set<string>();

    if (workbookNiks.length > 0) {
      // Chunk per 100 agar query tidak overflow
      for (let i = 0; i < workbookNiks.length; i += 100) {
        const chunk = workbookNiks.slice(i, i + 100);
        const { data } = await supabase
          .schema('assyifa')
          .from('students')
          .select('nik')
          .in('nik', chunk);
        (data || []).forEach((d) => existingNiksInDb.add(d.nik));
      }
    }

    if (workbookNisns.length > 0) {
      for (let i = 0; i < workbookNisns.length; i += 100) {
        const chunk = workbookNisns.slice(i, i + 100);
        const { data } = await supabase
          .schema('assyifa')
          .from('students')
          .select('nisn')
          .in('nisn', chunk);
        (data || []).forEach((d) => {
          if (d.nisn) existingNisnsInDb.add(d.nisn);
        });
      }
    }

    // 3. Jalankan evaluasi per baris
    let validCount = 0;
    let errorCount = 0;
    let warningTotal = 0;
    let duplicateTotal = 0;

    const validated = rows.map((r) => {
      const errs: string[] = [];
      const warns: string[] = [...r.warnings];

      // Required fields
      if (!r.nama) errs.push('Nama wajib diisi.');
      if (!r.nik) {
        errs.push('NIK wajib diisi.');
      } else if (!/^\d{16}$/.test(r.nik)) {
        errs.push(`NIK harus terdiri dari tepat 16 digit angka (ditemukan: ${r.nik}).`);
      }

      if (!r.tempat_lahir) errs.push('Tempat Lahir wajib diisi.');
      if (!r.tanggal_lahir) errs.push('Tanggal Lahir tidak valid atau kosong.');
      if (!r.agama) errs.push('Agama wajib diisi dan harus valid.');
      if (!r.alamat) errs.push('Alamat wajib diisi.');
      if (!r.kelurahan) errs.push('Kelurahan wajib diisi.');
      if (!r.kecamatan) errs.push('Kecamatan wajib diisi.');
      if (!r.kelas || r.kelas < 1 || r.kelas > 6) errs.push('Kelas harus antara 1 sampai 6.');

      if (!r.jenis_kelamin) {
        errs.push('Jenis Kelamin harus L (Laki-laki) atau P (Perempuan).');
      }

      // Cek duplicate NIK / NISN di workbook
      if (r.nik && nikCountInWorkbook[r.nik] > 1) {
        errs.push(`NIK ${r.nik} terduplikasi di dalam file Excel.`);
        duplicateTotal++;
      }
      if (r.nisn && nisnCountInWorkbook[r.nisn] > 1) {
        errs.push(`NISN ${r.nisn} terduplikasi di dalam file Excel.`);
        duplicateTotal++;
      }

      // Cek duplicate NIK / NISN di database
      if (r.nik && existingNiksInDb.has(r.nik)) {
        errs.push(`NIK ${r.nik} sudah terdaftar di database.`);
        duplicateTotal++;
      }
      if (r.nisn && existingNisnsInDb.has(r.nisn)) {
        errs.push(`NISN ${r.nisn} sudah terdaftar di database.`);
        duplicateTotal++;
      }

      // Validasi NIK orang tua jika diisi
      if (r.father?.nik && !/^\d{16}$/.test(r.father.nik)) {
        errs.push(`NIK Ayah harus 16 digit angka jika diisi (ditemukan: ${r.father.nik}).`);
      }
      if (r.mother?.nik && !/^\d{16}$/.test(r.mother.nik)) {
        errs.push(`NIK Ibu harus 16 digit angka jika diisi (ditemukan: ${r.mother.nik}).`);
      }

      const isValid = errs.length === 0;
      if (isValid) {
        validCount++;
      } else {
        errorCount++;
      }
      warningTotal += warns.length;

      return {
        ...r,
        errors: errs,
        warnings: warns,
        isValid,
      };
    });

    const sheetSet = new Set(rows.map((r) => r.sheetName));

    return {
      validatedRows: validated,
      summary: {
        totalSheets: sheetSet.size,
        totalRows: rows.length,
        validRows: validCount,
        errorRows: errorCount,
        warningCount: warningTotal,
        duplicateCount: duplicateTotal,
      },
    };
  },

  /**
   * Eksekusi import data ke assyifa.students & assyifa.parents
   * Mengimpor hanya baris yang valid (isValid == true)
   */
  async executeImport(
    validRows: ParsedRowData[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<ImportResultSummary> {
    logger.info('Memulai eksekusi import Excel', { totalValidRows: validRows.length });

    let studentsCount = 0;
    let fatherCount = 0;
    let motherCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Proses berurutan per siswa agar jika 1 gagal tidak memutus yang lain dan orang tua terikat student_id
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];

      try {
        // 1. Insert Student
        const studentPayload: StudentInsert = {
          nama: row.nama,
          jenis_kelamin: row.jenis_kelamin!,
          nisn: row.nisn,
          nik: row.nik,
          tempat_lahir: row.tempat_lahir,
          tanggal_lahir: row.tanggal_lahir!,
          agama: row.agama!,
          alamat: row.alamat,
          rt: row.rt,
          rw: row.rw,
          dusun: row.dusun,
          kelurahan: row.kelurahan,
          kecamatan: row.kecamatan,
          kode_pos: row.kode_pos,
          jenis_tinggal: row.jenis_tinggal,
          alat_transportasi: row.alat_transportasi,
          hp: row.hp,
          kelas: row.kelas,
          nomor_registrasi_akta_lahir: row.nomor_registrasi_akta_lahir,
          anak_ke: row.anak_ke,
          ket: row.ket,
          status_siswa: 'aktif',
        };

        const { data: studentData, error: studentError } = await supabase
          .schema('assyifa')
          .from('students')
          .insert(studentPayload)
          .select('id')
          .single();

        if (studentError || !studentData) {
          throw new Error(studentError?.message || 'Gagal menyimpan data siswa');
        }

        const studentId = studentData.id;
        studentsCount++;

        // 2. Insert Ayah jika ada
        if (row.father && (row.father.nama || row.father.nik)) {
          const fatherPayload: ParentInsert = {
            student_id: studentId,
            hubungan: 'ayah',
            nama: row.father.nama,
            tahun_lahir: row.father.tahun_lahir,
            jenjang_pendidikan: row.father.jenjang_pendidikan,
            pekerjaan: row.father.pekerjaan,
            penghasilan: row.father.penghasilan,
            nik: row.father.nik,
          };

          const { error: fatherError } = await supabase
            .schema('assyifa')
            .from('parents')
            .insert(fatherPayload);

          if (!fatherError) {
            fatherCount++;
          } else {
            logger.warn('Gagal menyimpan data ayah', { studentId, error: fatherError.message });
          }
        }

        // 3. Insert Ibu jika ada
        if (row.mother && (row.mother.nama || row.mother.nik)) {
          const motherPayload: ParentInsert = {
            student_id: studentId,
            hubungan: 'ibu',
            nama: row.mother.nama,
            tahun_lahir: row.mother.tahun_lahir,
            jenjang_pendidikan: row.mother.jenjang_pendidikan,
            pekerjaan: row.mother.pekerjaan,
            penghasilan: row.mother.penghasilan,
            nik: row.mother.nik,
          };

          const { error: motherError } = await supabase
            .schema('assyifa')
            .from('parents')
            .insert(motherPayload);

          if (!motherError) {
            motherCount++;
          } else {
            logger.warn('Gagal menyimpan data ibu', { studentId, error: motherError.message });
          }
        }
      } catch (err) {
        failedCount++;
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
        errors.push(`Baris ${row.rowIndex} (${row.nama}): ${msg}`);
        logger.error('Gagal import baris siswa', {
          sheet: row.sheetName,
          row: row.rowIndex,
          nama: row.nama,
          error: msg,
        });
      }

      if (onProgress) {
        onProgress(i + 1, validRows.length);
      }
    }

    logger.info('Import Excel selesai', {
      studentsCount,
      fatherCount,
      motherCount,
      failedCount,
    });

    return {
      studentsCount,
      fatherCount,
      motherCount,
      failedCount,
      errors,
    };
  },
};
