-- ==============================================================================
-- STAGE 11: TAHUN AJARAN & HISTORI AKADEMIK (SUPABASE POSTGRESQL)
-- SCHEMA: assyifa
-- ==============================================================================

-- 1. TABEL: academic_years
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

-- 2. TABEL: student_academic_records
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

-- Indexes untuk student_academic_records
CREATE INDEX IF NOT EXISTS idx_academic_records_student_id ON assyifa.student_academic_records (student_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_academic_year_id ON assyifa.student_academic_records (academic_year_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_kelas ON assyifa.student_academic_records (kelas);
CREATE INDEX IF NOT EXISTS idx_academic_records_status ON assyifa.student_academic_records (status);

-- 3. PERMISSIONS UNTUK SCHEMA assyifa
GRANT ALL ON TABLE assyifa.academic_years TO anon, authenticated, service_role;
GRANT ALL ON TABLE assyifa.student_academic_records TO anon, authenticated, service_role;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE assyifa.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE assyifa.student_academic_records ENABLE ROW LEVEL SECURITY;

-- Policy untuk academic_years: authenticated users full access
DROP POLICY IF EXISTS "Authenticated users full access on academic_years" ON assyifa.academic_years;
CREATE POLICY "Authenticated users full access on academic_years"
ON assyifa.academic_years
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy untuk student_academic_records: authenticated users full access
DROP POLICY IF EXISTS "Authenticated users full access on student_academic_records" ON assyifa.student_academic_records;
CREATE POLICY "Authenticated users full access on student_academic_records"
ON assyifa.student_academic_records
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 5. MIGRASI DATA AWAL (INITIAL SEEDING & DATA BACKFILL)
-- ==============================================================================

-- Buat tahun ajaran default aktif (contoh 2026/2027) jika belum ada academic_years sama sekali
INSERT INTO assyifa.academic_years (tahun_ajaran, status)
SELECT '2026/2027', 'active'
WHERE NOT EXISTS (SELECT 1 FROM assyifa.academic_years);

-- Migrasikan seluruh siswa existing dengan kelas valid (1-6) ke student_academic_records
-- untuk tahun ajaran yang aktif saat ini.
INSERT INTO assyifa.student_academic_records (student_id, academic_year_id, kelas, status)
SELECT 
    s.id AS student_id,
    ay.id AS academic_year_id,
    s.kelas AS kelas,
    'active' AS status
FROM assyifa.students s
CROSS JOIN assyifa.academic_years ay
WHERE ay.status = 'active'
  AND s.kelas BETWEEN 1 AND 6
ON CONFLICT (student_id, academic_year_id) DO NOTHING;
