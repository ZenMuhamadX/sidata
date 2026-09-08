-- ==============================================================================
-- STAGE 12: CALON SISWA / ADMISSION (SUPABASE POSTGRESQL)
-- SCHEMA: assyifa
-- ==============================================================================

-- 1. TABEL: student_admissions
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

-- 2. PERMISSIONS
GRANT ALL ON TABLE assyifa.student_admissions TO anon, authenticated, service_role;

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE assyifa.student_admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access on student_admissions" ON assyifa.student_admissions;
CREATE POLICY "Authenticated users full access on student_admissions"
ON assyifa.student_admissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. RPC STORED PROCEDURE: enroll_student_admission
-- Menjalankan pendaftaran calon siswa secara atomik (status -> enrolled, student -> aktif, student_academic_records -> kelas 1 active)
CREATE OR REPLACE FUNCTION assyifa.enroll_student_admission(p_admission_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_admission assyifa.student_admissions%ROWTYPE;
    v_record_id UUID;
BEGIN
    -- Ambil data admission dengan lock FOR UPDATE
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

    -- 3. Insert ke student_academic_records jika belum ada
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

GRANT EXECUTE ON FUNCTION assyifa.enroll_student_admission(UUID) TO anon, authenticated, service_role;
