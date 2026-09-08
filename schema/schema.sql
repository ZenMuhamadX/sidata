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

-- ==============================================================================
-- 8. STAGE 11: TABEL academic_years & student_academic_records
-- ==============================================================================

-- Tabel: academic_years
CREATE TABLE IF NOT EXISTS assyifa.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tahun_ajaran TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_academic_years_format CHECK (tahun_ajaran ~ '^[0-9]{4}/[0-9]{4}$'),
    CONSTRAINT chk_academic_years_status CHECK (status IN ('active', 'completed')),
    CONSTRAINT uq_academic_years_tahun UNIQUE (tahun_ajaran)
);

-- Trigger updated_at untuk academic_years
DROP TRIGGER IF EXISTS trg_academic_years_updated_at ON assyifa.academic_years;
CREATE TRIGGER trg_academic_years_updated_at
BEFORE UPDATE ON assyifa.academic_years
FOR EACH ROW
EXECUTE FUNCTION assyifa.set_updated_at();

-- Partial unique index: Memastikan hanya SATU record yang boleh berstatus 'active'
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_active_academic_year 
ON assyifa.academic_years (status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_academic_years_status ON assyifa.academic_years (status);
CREATE INDEX IF NOT EXISTS idx_academic_years_tahun ON assyifa.academic_years (tahun_ajaran);

-- Tabel: student_academic_records
CREATE TABLE IF NOT EXISTS assyifa.student_academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES assyifa.students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES assyifa.academic_years(id) ON DELETE CASCADE,
    kelas INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_academic_records_kelas CHECK (kelas BETWEEN 1 AND 6),
    CONSTRAINT chk_academic_records_status CHECK (status IN ('active', 'promoted', 'retained', 'graduated')),
    CONSTRAINT uq_student_academic_year UNIQUE (student_id, academic_year_id)
);

-- Trigger updated_at untuk student_academic_records
DROP TRIGGER IF EXISTS trg_academic_records_updated_at ON assyifa.student_academic_records;
CREATE TRIGGER trg_academic_records_updated_at
BEFORE UPDATE ON assyifa.student_academic_records
FOR EACH ROW
EXECUTE FUNCTION assyifa.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_academic_records_student_id ON assyifa.student_academic_records (student_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_academic_year_id ON assyifa.student_academic_records (academic_year_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_kelas ON assyifa.student_academic_records (kelas);
CREATE INDEX IF NOT EXISTS idx_academic_records_status ON assyifa.student_academic_records (status);

-- RLS untuk tabel-tabel baru
ALTER TABLE assyifa.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE assyifa.student_academic_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access on academic_years" ON assyifa.academic_years;
CREATE POLICY "Authenticated users full access on academic_years"
ON assyifa.academic_years
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on student_academic_records" ON assyifa.student_academic_records;
CREATE POLICY "Authenticated users full access on student_academic_records"
ON assyifa.student_academic_records
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 9. STAGE 12: TABEL student_admissions & RPC enroll_student_admission
-- ==============================================================================

-- Tabel: student_admissions
CREATE TABLE IF NOT EXISTS assyifa.student_admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES assyifa.students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES assyifa.academic_years(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'candidate',
    target_kelas INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_admissions_status CHECK (status IN ('candidate', 'accepted', 'rejected', 'cancelled', 'enrolled')),
    CONSTRAINT chk_admissions_target_kelas CHECK (target_kelas = 1),
    CONSTRAINT uq_student_admissions_year UNIQUE (student_id, academic_year_id)
);

-- Trigger updated_at untuk student_admissions
DROP TRIGGER IF EXISTS trg_student_admissions_updated_at ON assyifa.student_admissions;
CREATE TRIGGER trg_student_admissions_updated_at
BEFORE UPDATE ON assyifa.student_admissions
FOR EACH ROW
EXECUTE FUNCTION assyifa.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_admissions_student_id ON assyifa.student_admissions (student_id);
CREATE INDEX IF NOT EXISTS idx_student_admissions_academic_year_id ON assyifa.student_admissions (academic_year_id);
CREATE INDEX IF NOT EXISTS idx_student_admissions_status ON assyifa.student_admissions (status);

-- RLS
ALTER TABLE assyifa.student_admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access on student_admissions" ON assyifa.student_admissions;
CREATE POLICY "Authenticated users full access on student_admissions"
ON assyifa.student_admissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RPC: enroll_student_admission
CREATE OR REPLACE FUNCTION assyifa.enroll_student_admission(p_admission_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_admission assyifa.student_admissions%ROWTYPE;
    v_record_id UUID;
BEGIN
    SELECT * INTO v_admission
    FROM assyifa.student_admissions
    WHERE id = p_admission_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data calon siswa tidak ditemukan.';
    END IF;

    IF v_admission.status != 'accepted' THEN
        RAISE EXCEPTION 'Hanya calon siswa berstatus "accepted" yang dapat didaftarkan sebagai siswa resmi.';
    END IF;

    -- 1. Update status admission menjadi 'enrolled'
    UPDATE assyifa.student_admissions
    SET status = 'enrolled',
        updated_at = NOW()
    WHERE id = p_admission_id;

    -- 2. Update status siswa menjadi 'aktif' dan kelas = 1
    UPDATE assyifa.students
    SET status_siswa = 'aktif',
        kelas = 1,
        updated_at = NOW()
    WHERE id = v_admission.student_id;

    -- 3. Insert ke student_academic_records
    INSERT INTO assyifa.student_academic_records (
        student_id,
        academic_year_id,
        kelas,
        status
    )
    VALUES (
        v_admission.student_id,
        v_admission.academic_year_id,
        1,
        'active'
    )
    ON CONFLICT (student_id, academic_year_id) DO UPDATE
    SET kelas = 1,
        status = 'active',
        updated_at = NOW()
    RETURNING id INTO v_record_id;

    RETURN jsonb_build_object(
        'success', true,
        'admission_id', v_admission.id,
        'student_id', v_admission.student_id,
        'academic_year_id', v_admission.academic_year_id,
        'academic_record_id', v_record_id,
        'message', 'Calon siswa berhasil didaftarkan secara resmi.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
