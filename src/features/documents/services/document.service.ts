import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import {
  type DocumentFilters,
  type DocumentListResult,
  type DocumentTypeDefinition,
  type StudentDocument,
  type StudentWithDocumentsSummary,
} from '../types/document.types';

const BUCKET_NAME = 'student-documents';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

export const documentService = {
  validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'File dokumen belum dipilih.' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Ukuran file terlalu besar. Maksimum diperbolehkan adalah 5 MB.`,
      };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        error: `Format file tidak didukung (.${ext}). Harap gunakan format PDF, JPG, JPEG, atau PNG.`,
      };
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: `Tipe MIME (${file.type}) tidak diizinkan. Harap unggah dokumen atau gambar yang valid.`,
      };
    }

    return { isValid: true };
  },

  async getDocumentsByStudentId(studentId: string): Promise<StudentDocument[]> {
    logger.debug('Memuat daftar dokumen siswa', { studentId });

    try {
      const { data, error } = await supabase
        .schema('assyifa')
        .from('documents')
        .select('*')
        .eq('student_id', studentId);

      if (error) {
        logger.error('Gagal memuat dokumen siswa', { studentId, code: error.code });
        throw new Error('Gagal memuat daftar dokumen siswa.');
      }

      return (data as unknown as StudentDocument[]) || [];
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Terjadi kesalahan saat memuat dokumen.');
    }
  },

  async uploadDocument(
    studentId: string,
    docDef: DocumentTypeDefinition,
    file: File
  ): Promise<StudentDocument> {
    logger.info('Memulai upload dokumen siswa', {
      studentId,
      documentType: docDef.dbValue,
      originalFilename: file.name,
      fileSize: file.size,
    });

    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Ambil authenticated user UUID
    const { data: sessionData } = await supabase.auth.getSession();
    const uploadedBy = sessionData?.session?.user?.id || null;

    const year = new Date().getFullYear();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const storagePath = `${year}/${studentId}/${docDef.code}.${ext}`;

    // Cek jika sudah ada dokumen sebelumnya
    const { data: existingDocs } = await supabase
      .schema('assyifa')
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .eq('document_type', docDef.dbValue);

    const oldDoc = existingDocs && existingDocs.length > 0 ? (existingDocs[0] as unknown as StudentDocument) : null;

    // 1. Upload ke Supabase Storage (Private)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream',
      });

    if (uploadError) {
      logger.error('Gagal mengunggah file ke Supabase Storage', {
        storagePath,
        error: uploadError.message,
      });
      throw new Error(`Gagal mengunggah file ${docDef.label}: ${uploadError.message}`);
    }

    // 2. Simpan atau Update metadata pada assyifa.documents
    try {
      const payload = {
        student_id: studentId,
        document_type: docDef.dbValue,
        storage_path: storagePath,
        original_filename: file.name,
        mime_type: file.type || null,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: uploadedBy,
      };

      const { data: savedDoc, error: dbError } = await supabase
        .schema('assyifa')
        .from('documents')
        .upsert(payload, { onConflict: 'student_id, document_type' })
        .select()
        .single();

      if (dbError) {
        logger.error('Database metadata insert gagal, membersihkan file storage', {
          storagePath,
          error: dbError.message,
        });
        // Rollback storage file jika database gagal agar tidak orphan
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
        throw new Error(`Gagal menyimpan metadata dokumen: ${dbError.message}`);
      }

      // 3. Jika replace dan path lama berbeda ekstensi, hapus file lama dari storage
      if (oldDoc && oldDoc.storage_path && oldDoc.storage_path !== storagePath) {
        logger.info('Menghapus file lama yang berbeda ekstensi dari storage', {
          oldPath: oldDoc.storage_path,
        });
        await supabase.storage.from(BUCKET_NAME).remove([oldDoc.storage_path]);
      }

      logger.info('Dokumen berhasil diunggah dan disimpan', {
        docId: (savedDoc as { id: string }).id,
        storagePath,
      });

      return savedDoc as unknown as StudentDocument;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error(`Gagal menyimpan dokumen ${docDef.label}.`);
    }
  },

  async deleteDocument(document: StudentDocument): Promise<void> {
    logger.warn('Menghapus dokumen siswa', {
      docId: document.id,
      studentId: document.student_id,
      storagePath: document.storage_path,
    });

    try {
      // 1. Hapus dari Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([document.storage_path]);

      if (storageError) {
        logger.error('Gagal menghapus file dari storage', {
          storagePath: document.storage_path,
          error: storageError.message,
        });
        throw new Error(`Gagal menghapus file dari storage: ${storageError.message}`);
      }

      // 2. Hapus record dari assyifa.documents
      const { error: dbError } = await supabase
        .schema('assyifa')
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) {
        logger.error('Gagal menghapus metadata dokumen dari database', {
          docId: document.id,
          error: dbError.message,
        });
        throw new Error(`Gagal menghapus metadata dokumen dari database: ${dbError.message}`);
      }

      logger.info('Dokumen berhasil dihapus dari storage dan database', {
        docId: document.id,
      });
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal menghapus dokumen.');
    }
  },

  async getSignedUrl(storagePath: string): Promise<string> {
    logger.debug('Membuat signed URL untuk dokumen', { storagePath });

    try {
      // Signed URL berlaku selama 5 menit (300 detik)
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, 300);

      if (error || !data?.signedUrl) {
        logger.error('Gagal membuat signed URL', { storagePath, error });
        throw new Error('Gagal menghasilkan tautan akses aman dokumen.');
      }

      return data.signedUrl;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Gagal mengakses dokumen.');
    }
  },

  async getDocumentChecklist(filters: DocumentFilters): Promise<DocumentListResult> {
    logger.debug('Memuat daftar checklist dokumen siswa', {
      page: filters.page,
      search: filters.search ? '[SEARCH_APPLIED]' : undefined,
      kelas: filters.kelas,
      status: filters.status_siswa,
      completeness: filters.completeness,
    });

    try {
      // 1. Query siswa dengan filter dan search
      let studentQuery = supabase
        .schema('assyifa')
        .from('students')
        .select('id, nama, kelas, nik, nisn, status_siswa', { count: 'exact' });

      if (filters.status_siswa && filters.status_siswa !== 'all') {
        studentQuery = studentQuery.eq('status_siswa', filters.status_siswa);
      }

      if (filters.kelas && filters.kelas !== 'all') {
        studentQuery = studentQuery.eq('kelas', Number(filters.kelas));
      }

      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.trim().replace(/,/g, '');
        studentQuery = studentQuery.or(
          `nama.ilike.%${q}%,nik.ilike.%${q}%,nisn.ilike.%${q}%`
        );
      }

      studentQuery = studentQuery.order('nama', { ascending: true });

      // Jika filter kelengkapan aktif, ambil semua data untuk dihitung kelengkapannya,
      // lalu lakukan pagination client-side, atau jika 'all', gunakan range server-side
      const isCompletenessFiltered = filters.completeness && filters.completeness !== 'all';

      let studentsData: Array<{
        id: string;
        nama: string;
        kelas: number;
        nik: string;
        nisn: string | null;
        status_siswa: string;
      }> = [];

      let totalStudents = 0;

      if (!isCompletenessFiltered) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        const { data, count, error } = await studentQuery.range(from, to);
        if (error) throw error;
        studentsData = data || [];
        totalStudents = count ?? 0;
      } else {
        const { data, count, error } = await studentQuery;
        if (error) throw error;
        studentsData = data || [];
        totalStudents = count ?? 0;
      }

      if (studentsData.length === 0) {
        return {
          students: [],
          total: 0,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages: 1,
        };
      }

      // 2. Ambil seluruh dokumen untuk siswa-siswa tersebut
      const studentIds = studentsData.map((s) => s.id);
      const { data: docsData, error: docsError } = await supabase
        .schema('assyifa')
        .from('documents')
        .select('*')
        .in('student_id', studentIds);

      if (docsError) throw docsError;

      const docsByStudentId: Record<string, Record<string, StudentDocument>> = {};
      (docsData || []).forEach((d) => {
        const doc = d as unknown as StudentDocument;
        if (!docsByStudentId[doc.student_id]) {
          docsByStudentId[doc.student_id] = {};
        }
        docsByStudentId[doc.student_id][doc.document_type] = doc;
      });

      // 3. Gabungkan summary
      let summaries: StudentWithDocumentsSummary[] = studentsData.map((s) => {
        const studentDocs = docsByStudentId[s.id] || {};
        const docsMap: Record<string, StudentDocument | null> = {
          kk: studentDocs['KK'] || null,
          akta_lahir: studentDocs['Akta Lahir'] || null,
          ktp_ayah: studentDocs['KTP Ayah'] || null,
          ktp_ibu: studentDocs['KTP Ibu'] || null,
        };

        const completedCount = Object.values(docsMap).filter(Boolean).length;
        const isComplete = completedCount === 4;

        return {
          id: s.id,
          nama: s.nama,
          kelas: s.kelas,
          nik: s.nik,
          nisn: s.nisn,
          status_siswa: s.status_siswa as 'aktif' | 'tidak_aktif',
          documents: docsMap as Record<'kk' | 'akta_lahir' | 'ktp_ayah' | 'ktp_ibu', StudentDocument | null>,
          completedCount,
          isComplete,
        };
      });

      // 4. Jika filter kelengkapan aktif, saring dan potong sesuai page
      if (isCompletenessFiltered) {
        if (filters.completeness === 'lengkap') {
          summaries = summaries.filter((s) => s.isComplete);
        } else if (filters.completeness === 'belum_lengkap') {
          summaries = summaries.filter((s) => !s.isComplete);
        }

        totalStudents = summaries.length;
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize;
        summaries = summaries.slice(from, to);
      }

      const totalPages = Math.ceil(totalStudents / filters.pageSize) || 1;

      return {
        students: summaries,
        total: totalStudents,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
      };
    } catch (err) {
      logger.error('Gagal memuat checklist dokumen', { err });
      throw new Error('Gagal memuat daftar checklist dokumen siswa.');
    }
  },
};
