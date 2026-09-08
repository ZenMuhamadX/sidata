-- ==============================================================================
-- STAGE 14: KELULUSAN SISWA (SD KELAS 6)
-- SCHEMA: assyifa
-- ==============================================================================

-- 1. Perbarui check constraint status_siswa pada assyifa.students untuk mendukung 'inactive'
ALTER TABLE assyifa.students DROP CONSTRAINT IF EXISTS chk_students_status_siswa;
ALTER TABLE assyifa.students ADD CONSTRAINT chk_students_status_siswa 
CHECK (status_siswa IN ('aktif', 'tidak_aktif', 'inactive'));

-- 2. Stored Procedure / RPC: assyifa.process_student_graduation
-- Menjalankan kelulusan batch untuk siswa SD kelas 6 secara atomik dalam satu transaksi
CREATE OR REPLACE FUNCTION assyifa.process_student_graduation(
    p_academic_year_id UUID,
    p_student_ids UUID[]
)
RETURNS JSONB AS $$
DECLARE
    v_academic_year assyifa.academic_years%ROWTYPE;
    v_student_id UUID;
    v_student_name TEXT;
    v_record_id UUID;
    v_kelas INTEGER;
    v_status TEXT;
    v_total_graduated INTEGER := 0;
BEGIN
    -- a. Validasi Keamanan: Hanya authenticated user (admin) yang boleh mengeksekusi
    IF auth.role() IS NOT NULL AND auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Akses ditolak. Operasi kelulusan hanya untuk pengguna terotentikasi.';
    END IF;

    -- b. Validasi Input Tahun Ajaran
    IF p_academic_year_id IS NULL THEN
        RAISE EXCEPTION 'Tahun ajaran kelulusan harus ditentukan.';
    END IF;

    SELECT * INTO v_academic_year FROM assyifa.academic_years WHERE id = p_academic_year_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tahun ajaran tidak ditemukan di database.';
    END IF;

    -- c. Validasi Array ID Siswa
    IF p_student_ids IS NULL OR array_length(p_student_ids, 1) IS NULL OR array_length(p_student_ids, 1) = 0 THEN
        RAISE EXCEPTION 'Daftar siswa yang akan diluluskan tidak boleh kosong.';
    END IF;

    -- d. Loop Pemrosesan Setiap Siswa Secara Atomik
    FOREACH v_student_id IN ARRAY p_student_ids
    LOOP
        -- Ambil nama siswa untuk error reporting yang jelas
        SELECT nama INTO v_student_name FROM assyifa.students WHERE id = v_student_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Data siswa dengan ID % tidak ditemukan.', v_student_id;
        END IF;

        -- Cari dan kunci baris riwayat akademik tahun ajaran ini
        SELECT id, kelas, status INTO v_record_id, v_kelas, v_status
        FROM assyifa.student_academic_records
        WHERE student_id = v_student_id
          AND academic_year_id = p_academic_year_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Siswa "%" tidak memiliki riwayat akademik pada tahun ajaran %.', 
                v_student_name, v_academic_year.tahun_ajaran;
        END IF;

        -- Aturan 1 & 4: Hanya kelas 6 yang boleh diluluskan
        IF v_kelas != 6 THEN
            RAISE EXCEPTION 'Siswa "%" berada di Kelas %, bukan Kelas 6. Hanya siswa Kelas 6 yang dapat diluluskan.', 
                v_student_name, v_kelas;
        END IF;

        -- Aturan 9: Cegah proses kelulusan ganda
        IF v_status = 'graduated' THEN
            RAISE EXCEPTION 'Siswa "%" sudah berstatus lulus (graduated) pada tahun ajaran %.', 
                v_student_name, v_academic_year.tahun_ajaran;
        END IF;

        -- Aturan 5: Hanya siswa yang berstatus 'active' yang boleh diluluskan
        IF v_status != 'active' THEN
            RAISE EXCEPTION 'Siswa "%" memiliki status riwayat akademik "%", bukan "active". Tidak dapat diproses.', 
                v_student_name, v_status;
        END IF;

        -- Eksekusi perubahan status:
        -- 1. Update status riwayat akademik menjadi 'graduated'
        UPDATE assyifa.student_academic_records
        SET status = 'graduated',
            updated_at = NOW()
        WHERE id = v_record_id;

        -- 2. Update status siswa menjadi 'inactive'
        UPDATE assyifa.students
        SET status_siswa = 'inactive',
            updated_at = NOW()
        WHERE id = v_student_id;

        v_total_graduated := v_total_graduated + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'academic_year', v_academic_year.tahun_ajaran,
        'total_graduated', v_total_graduated,
        'message', format('%s siswa Kelas 6 berhasil dinyatakan lulus pada tahun ajaran %s.', v_total_graduated, v_academic_year.tahun_ajaran)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Berikan permission eksekusi RPC ke peran aplikasi Supabase
GRANT EXECUTE ON FUNCTION assyifa.process_student_graduation(UUID, UUID[]) TO anon, authenticated, service_role;
