-- ==============================================================================
-- STAGE 13: KENAIKAN KELAS & TINGGAL KELAS (SUPABASE POSTGRESQL)
-- SCHEMA: assyifa
-- ==============================================================================

-- Stored Procedure / RPC: assyifa.process_class_promotion
-- Menjalankan kenaikan/tinggal kelas batch secara atomik dengan validasi integritas database ketat
CREATE OR REPLACE FUNCTION assyifa.process_class_promotion(
    p_academic_year_from UUID,
    p_academic_year_to UUID,
    p_kelas_from INTEGER,
    p_decisions JSONB -- Array of {"student_id": "...", "decision": "promoted"|"retained"}
)
RETURNS JSONB AS $$
DECLARE
    v_year_from assyifa.academic_years%ROWTYPE;
    v_year_to assyifa.academic_years%ROWTYPE;
    v_decision_item JSONB;
    v_student_id UUID;
    v_decision_type TEXT;
    v_source_record_id UUID;
    v_target_kelas INTEGER;
    v_promoted_count INTEGER := 0;
    v_retained_count INTEGER := 0;
    v_total_students INTEGER := 0;
    v_student_name TEXT;
BEGIN
    -- 1. Validasi Keamanan: Hanya authenticated user yang boleh mengeksekusi
    IF auth.role() IS NOT NULL AND auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Akses ditolak. Operasi kenaikan kelas hanya untuk pengguna terotentikasi.';
    END IF;

    -- 2. Validasi Kelas Asal: Hanya kelas 1 sampai 5. Kelas 6 DILARANG pada stage ini.
    IF p_kelas_from < 1 OR p_kelas_from > 5 THEN
        RAISE EXCEPTION 'Kelas asal tidak valid (%). Kenaikan kelas hanya diperuntukkan bagi Kelas 1 sampai 5. Kelas 6 diproses melalui kelulusan.', p_kelas_from;
    END IF;

    -- 3. Validasi Tahun Ajaran
    IF p_academic_year_from IS NULL OR p_academic_year_to IS NULL THEN
        RAISE EXCEPTION 'Tahun ajaran asal dan tahun ajaran tujuan harus ditentukan.';
    END IF;

    IF p_academic_year_from = p_academic_year_to THEN
        RAISE EXCEPTION 'Tahun ajaran tujuan tidak boleh sama dengan tahun ajaran asal.';
    END IF;

    SELECT * INTO v_year_from FROM assyifa.academic_years WHERE id = p_academic_year_from;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tahun ajaran asal tidak ditemukan di database.';
    END IF;

    SELECT * INTO v_year_to FROM assyifa.academic_years WHERE id = p_academic_year_to;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tahun ajaran tujuan tidak ditemukan di database.';
    END IF;

    -- Validasi urutan tahun ajaran berdasarkan teks tahun YYYY/YYYY
    IF v_year_to.tahun_ajaran <= v_year_from.tahun_ajaran THEN
        RAISE EXCEPTION 'Tahun ajaran tujuan (%) harus merupakan periode setelah tahun ajaran asal (%).', v_year_to.tahun_ajaran, v_year_from.tahun_ajaran;
    END IF;

    -- 4. Validasi Array Keputusan
    IF p_decisions IS NULL OR jsonb_array_length(p_decisions) = 0 THEN
        RAISE EXCEPTION 'Daftar keputusan siswa kosong. Tidak ada data yang dapat diproses.';
    END IF;

    v_total_students := jsonb_array_length(p_decisions);

    -- 5. Loop Pemrosesan Setiap Siswa Secara Atomik
    FOR v_decision_item IN SELECT * FROM jsonb_array_elements(p_decisions)
    LOOP
        v_student_id := (v_decision_item->>'student_id')::UUID;
        v_decision_type := lower(trim(v_decision_item->>'decision'));

        IF v_student_id IS NULL THEN
            RAISE EXCEPTION 'Terdapat data siswa dengan ID tidak valid dalam keputusan batch.';
        END IF;

        IF v_decision_type NOT IN ('promoted', 'retained') THEN
            RAISE EXCEPTION 'Keputusan tidak valid (%) untuk siswa %. Hanya "promoted" atau "retained" yang diizinkan.', v_decision_type, v_student_id;
        END IF;

        -- Ambil nama siswa untuk pesan error yang informatif
        SELECT nama INTO v_student_name FROM assyifa.students WHERE id = v_student_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Data siswa dengan ID % tidak ditemukan.', v_student_id;
        END IF;

        -- Cek ketersediaan record aktif di tahun asal
        SELECT id INTO v_source_record_id
        FROM assyifa.student_academic_records
        WHERE student_id = v_student_id
          AND academic_year_id = p_academic_year_from
          AND kelas = p_kelas_from
          AND status = 'active'
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Siswa "%" tidak memiliki catatan akademik aktif di Kelas % pada tahun ajaran %.', v_student_name, p_kelas_from, v_year_from.tahun_ajaran;
        END IF;

        -- Idempotency Check: Pastikan siswa belum pernah memiliki record pada tahun ajaran tujuan
        IF EXISTS (
            SELECT 1 FROM assyifa.student_academic_records
            WHERE student_id = v_student_id
              AND academic_year_id = p_academic_year_to
        ) THEN
            RAISE EXCEPTION 'Siswa "%" sudah memiliki riwayat akademik pada tahun ajaran tujuan (%). Batch dibatalkan untuk menghindari duplikasi data.', v_student_name, v_year_to.tahun_ajaran;
        END IF;

        -- Tentukan kelas tujuan
        IF v_decision_type = 'promoted' THEN
            v_target_kelas := p_kelas_from + 1;
            v_promoted_count := v_promoted_count + 1;
        ELSE
            v_target_kelas := p_kelas_from;
            v_retained_count := v_retained_count + 1;
        END IF;

        -- a. Update status record di tahun ajaran asal
        UPDATE assyifa.student_academic_records
        SET status = v_decision_type,
            updated_at = NOW()
        WHERE id = v_source_record_id;

        -- b. Insert record baru di tahun ajaran tujuan
        INSERT INTO assyifa.student_academic_records (
            student_id,
            academic_year_id,
            kelas,
            status
        ) VALUES (
            v_student_id,
            p_academic_year_to,
            v_target_kelas,
            'active'
        );

        -- c. Update students.kelas untuk backward compatibility
        UPDATE assyifa.students
        SET kelas = v_target_kelas,
            updated_at = NOW()
        WHERE id = v_student_id;

    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'academic_year_from', v_year_from.tahun_ajaran,
        'academic_year_to', v_year_to.tahun_ajaran,
        'kelas_from', p_kelas_from,
        'total_processed', v_total_students,
        'promoted_count', v_promoted_count,
        'retained_count', v_retained_count,
        'message', format('Kenaikan kelas berhasil diproses: %s siswa naik kelas, %s siswa tinggal kelas.', v_promoted_count, v_retained_count)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION assyifa.process_class_promotion(UUID, UUID, INTEGER, JSONB) TO anon, authenticated, service_role;
