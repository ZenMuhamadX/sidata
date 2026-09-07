-- ==============================================================================
-- STAGE 1: DATABASE SCHEMA & STORAGE SETUP (SUPABASE POSTGRESQL)
-- SCHEMA: assyifa
-- ==============================================================================

-- 0. INISIALISASI SCHEMA
CREATE SCHEMA IF NOT EXISTS assyifa;

-- 1. UTILITY: TRIGGER FUNCTION UNTUK UPDATED_AT OTOMATIS
CREATE OR REPLACE FUNCTION assyifa.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TABEL: students
CREATE TABLE IF NOT EXISTS assyifa.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    nisn TEXT NULL,
    nik TEXT NOT NULL,
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir DATE NOT NULL,
    agama TEXT NOT NULL,
    alamat TEXT NOT NULL,
    rt TEXT NULL,
    rw TEXT NULL,
    dusun TEXT NULL,
    kelurahan TEXT NOT NULL,
    kecamatan TEXT NOT NULL,
    kode_pos TEXT NULL,
    jenis_tinggal TEXT NULL,
    alat_transportasi TEXT NULL,
    hp TEXT NULL,
    kelas INTEGER NOT NULL,
    nomor_registrasi_akta_lahir TEXT NULL,
    anak_ke INTEGER NULL,
    ket TEXT NULL,
    status_siswa TEXT NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_students_jenis_kelamin CHECK (jenis_kelamin IN ('L', 'P')),
    CONSTRAINT chk_students_nik_format CHECK (nik ~ '^[0-9]{16}$'),
    CONSTRAINT uq_students_nik UNIQUE (nik),
    CONSTRAINT chk_students_agama CHECK (agama IN ('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu')),
    CONSTRAINT chk_students_kelas CHECK (kelas BETWEEN 1 AND 6),
    CONSTRAINT chk_students_status_siswa CHECK (status_siswa IN ('aktif', 'tidak_aktif'))
);

-- Trigger updated_at untuk students
DROP TRIGGER IF EXISTS trg_students_updated_at ON assyifa.students;
CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON assyifa.students
FOR EACH ROW
EXECUTE FUNCTION assyifa.set_updated_at();

-- Index untuk students
-- NISN: Unique hanya untuk nilai yang diisi (tidak NULL)
CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_students_nisn ON assyifa.students (nisn) WHERE nisn IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_nama ON assyifa.students (nama);
CREATE INDEX IF NOT EXISTS idx_students_kelas ON assyifa.students (kelas);
CREATE INDEX IF NOT EXISTS idx_students_status_siswa ON assyifa.students (status_siswa);
CREATE INDEX IF NOT EXISTS idx_students_nomor_registrasi_akta_lahir ON assyifa.students (nomor_registrasi_akta_lahir);

-- 3. TABEL: parents
CREATE TABLE IF NOT EXISTS assyifa.parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES assyifa.students(id) ON DELETE CASCADE,
    hubungan TEXT NOT NULL,
    nama TEXT NULL,
    tahun_lahir INTEGER NULL,
    jenjang_pendidikan TEXT NULL,
    pekerjaan TEXT NULL,
    penghasilan TEXT NULL,
    nik TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_parents_hubungan CHECK (hubungan IN ('ayah', 'ibu')),
    CONSTRAINT chk_parents_nik_format CHECK (nik IS NULL OR nik ~ '^[0-9]{16}$'),
    CONSTRAINT uq_parents_student_hubungan UNIQUE (student_id, hubungan)
);

-- Trigger updated_at untuk parents
DROP TRIGGER IF EXISTS trg_parents_updated_at ON assyifa.parents;
CREATE TRIGGER trg_parents_updated_at
BEFORE UPDATE ON assyifa.parents
FOR EACH ROW
EXECUTE FUNCTION assyifa.set_updated_at();

-- Index untuk parents
CREATE INDEX IF NOT EXISTS idx_parents_student_id ON assyifa.parents (student_id);

-- 4. TABEL: documents
CREATE TABLE IF NOT EXISTS assyifa.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES assyifa.students(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NULL,
    file_size BIGINT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    uploaded_by UUID NULL,

    -- Constraints
    CONSTRAINT chk_documents_type CHECK (document_type IN ('KK', 'Akta Lahir', 'KTP Ayah', 'KTP Ibu')),
    CONSTRAINT uq_documents_student_document_type UNIQUE (student_id, document_type)
);

-- Index untuk documents
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON assyifa.documents (student_id);

-- 5. STORAGE BUCKET (student-documents)
-- Bucket bersifat PRIVATE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-documents',
    'student-documents',
    false,
    NULL,
    NULL
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 6. PERMISSIONS UNTUK SCHEMA assyifa (SUPABASE API / ROLES)
GRANT USAGE ON SCHEMA assyifa TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA assyifa TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA assyifa TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA assyifa TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA assyifa GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA assyifa GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA assyifa GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 7. ROW LEVEL SECURITY (RLS) DASAR
ALTER TABLE assyifa.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assyifa.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assyifa.documents ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS dasar: Akses penuh untuk authenticated users (internal staff/admin)
DROP POLICY IF EXISTS "Authenticated users full access on students" ON assyifa.students;
CREATE POLICY "Authenticated users full access on students"
ON assyifa.students
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on parents" ON assyifa.parents;
CREATE POLICY "Authenticated users full access on parents"
ON assyifa.parents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on documents" ON assyifa.documents;
CREATE POLICY "Authenticated users full access on documents"
ON assyifa.documents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Storage Objects Policy untuk bucket 'student-documents' (Private)
DROP POLICY IF EXISTS "Authenticated users full access on student documents storage" ON storage.objects;
CREATE POLICY "Authenticated users full access on student documents storage"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'student-documents')
WITH CHECK (bucket_id = 'student-documents');
