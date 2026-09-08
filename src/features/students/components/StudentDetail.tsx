import React from 'react';
import { Edit2, Trash2, ArrowLeft, CheckCircle2, XCircle, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Student } from '../types/student.types';
import type { Parent } from '../../parents/types/parent.types';
import { formatIndonesianDate } from '../utils/formatters';
import { StudentDocumentsSection } from '../../documents/components/StudentDocumentsSection';
import { StudentAcademicHistorySection } from '../../academic/components/StudentAcademicHistorySection';

interface StudentDetailProps {
  student: Student;
  parents?: Parent[];
  isUpdatingStatus: boolean;
  onToggleStatus: () => Promise<void>;
  onDelete: () => void;
  onDeleteParent?: (parent: Parent) => void;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({
  student,
  parents = [],
  isUpdatingStatus,
  onToggleStatus,
  onDelete,
  onDeleteParent,
}) => {
  const navigate = useNavigate();
  const isAktif = student.status_siswa === 'aktif';

  const ayah = parents.find((p) => p.hubungan === 'ayah');
  const ibu = parents.find((p) => p.hubungan === 'ibu');

  return (
    <div className="student-detail-wrapper">
      {/* Detail Top Header */}
      <div className="detail-top-bar">
        <button
          type="button"
          onClick={() => navigate('/siswa')}
          className="btn-secondary btn-back"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar</span>
        </button>

        <div className="detail-action-buttons">
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={isUpdatingStatus}
            className={`btn-secondary ${isAktif ? 'btn-status-deactivate' : 'btn-status-activate'}`}
            title={isAktif ? 'Nonaktifkan siswa' : 'Aktifkan kembali siswa'}
          >
            {isAktif ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{isUpdatingStatus ? 'Mengubah...' : isAktif ? 'Nonaktifkan Siswa' : 'Aktifkan Siswa'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/siswa/${student.id}/edit`)}
            className="btn-secondary"
          >
            <Edit2 size={16} />
            <span>Edit Data</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="btn-destructive"
          >
            <Trash2 size={16} />
            <span>Hapus Permanen</span>
          </button>
        </div>
      </div>

      {/* Main Student Header Card */}
      <div className="section-card student-main-header-card">
        <div className="student-header-info">
          <div>
            <h2 className="student-name-heading">{student.nama}</h2>
            <p className="student-sub-info">
              NIK: <span className="font-mono">{student.nik}</span> | NISN: <span className="font-mono">{student.nisn || '-'}</span>
            </p>
          </div>
          <div className="student-badges-group">
            <span className="badge-kelas">Kelas {student.kelas}</span>
            <span className={isAktif ? 'status-badge-active' : 'status-badge-inactive'}>
              {isAktif ? 'Siswa Aktif' : 'Tidak Aktif'}
            </span>
          </div>
        </div>
      </div>

      {/* Grouped Details Grid */}
      <div className="detail-sections-grid">
        {/* 1. IDENTITAS */}
        <div className="section-card detail-group-card">
          <div className="section-header">
            <h3 className="section-title">Data Identitas</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Nama Lengkap</span>
              <span className="detail-val">{student.nama}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Jenis Kelamin</span>
              <span className="detail-val">
                {student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">NIK</span>
              <span className="detail-val font-mono">{student.nik}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">NISN</span>
              <span className="detail-val font-mono">{student.nisn || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tempat Lahir</span>
              <span className="detail-val">{student.tempat_lahir}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tanggal Lahir</span>
              <span className="detail-val">{formatIndonesianDate(student.tanggal_lahir)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Agama</span>
              <span className="detail-val">{student.agama}</span>
            </div>
          </div>
        </div>

        {/* 2. ALAMAT */}
        <div className="section-card detail-group-card">
          <div className="section-header">
            <h3 className="section-title">Data Alamat</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Alamat Lengkap</span>
              <span className="detail-val">{student.alamat}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">RT / RW</span>
              <span className="detail-val">
                {student.rt ? `RT ${student.rt}` : '-'} / {student.rw ? `RW ${student.rw}` : '-'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dusun / Kampung</span>
              <span className="detail-val">{student.dusun || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Kelurahan / Desa</span>
              <span className="detail-val">{student.kelurahan}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Kecamatan</span>
              <span className="detail-val">{student.kecamatan}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Kode Pos</span>
              <span className="detail-val font-mono">{student.kode_pos || '-'}</span>
            </div>
          </div>
        </div>

        {/* 3. DATA SEKOLAH */}
        <div className="section-card detail-group-card">
          <div className="section-header">
            <h3 className="section-title">Data Sekolah</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Kelas</span>
              <span className="detail-val">Kelas {student.kelas}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">No Registrasi Akta Lahir</span>
              <span className="detail-val font-mono">
                {student.nomor_registrasi_akta_lahir || '-'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Anak Ke-</span>
              <span className="detail-val">{student.anak_ke ?? '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status Siswa</span>
              <span className="detail-val">
                <span className={isAktif ? 'status-badge-active' : 'status-badge-inactive'}>
                  {isAktif ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* 4. INFORMASI TAMBAHAN */}
        <div className="section-card detail-group-card">
          <div className="section-header">
            <h3 className="section-title">Informasi Tambahan</h3>
          </div>
          <div className="detail-dl">
            <div className="detail-row">
              <span className="detail-label">Jenis Tinggal</span>
              <span className="detail-val">{student.jenis_tinggal || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Alat Transportasi</span>
              <span className="detail-val">{student.alat_transportasi || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nomor HP</span>
              <span className="detail-val font-mono">{student.hp || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Keterangan</span>
              <span className="detail-val">{student.ket || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. DATA ORANG TUA (STAGE 5 INTEGRATION) */}
      <div className="section-card student-parents-card">
        <div className="section-header">
          <div className="flex-between">
            <div className="title-with-icon">
              <User size={18} className="text-primary" />
              <h3 className="section-title">Data Orang Tua Siswa</h3>
            </div>
          </div>
        </div>

        <div className="parents-grid-layout">
          {/* Section: AYAH */}
          <div className="parent-box">
            <div className="parent-box-header">
              <div className="parent-box-title">
                <span className="badge-hubungan badge-ayah">Ayah</span>
                <span className="parent-name-text">{ayah ? ayah.nama || '(Nama belum diisi)' : ''}</span>
              </div>
              {ayah ? (
                <div className="parent-box-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/orang-tua/${ayah.id}/edit`)}
                    className="btn-secondary btn-sm"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  {onDeleteParent && (
                    <button
                      type="button"
                      onClick={() => onDeleteParent(ayah)}
                      className="btn-icon btn-icon-danger"
                      title="Hapus data ayah"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/orang-tua/tambah?student_id=${student.id}&hubungan=ayah`)
                  }
                  className="btn-primary btn-sm"
                >
                  <Plus size={14} />
                  <span>+ Tambah Ayah</span>
                </button>
              )}
            </div>

            <div className="parent-box-body">
              {ayah ? (
                <div className="detail-dl">
                  <div className="detail-row">
                    <span className="detail-label">Nama</span>
                    <span className="detail-val">{ayah.nama || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">NIK</span>
                    <span className="detail-val font-mono">{ayah.nik || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tahun Lahir</span>
                    <span className="detail-val">{ayah.tahun_lahir || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pendidikan</span>
                    <span className="detail-val">{ayah.jenjang_pendidikan || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pekerjaan</span>
                    <span className="detail-val">{ayah.pekerjaan || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Penghasilan</span>
                    <span className="detail-val">{ayah.penghasilan || '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="parent-empty-box">
                  <p className="parent-empty-text">Data ayah belum tersedia.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section: IBU */}
          <div className="parent-box">
            <div className="parent-box-header">
              <div className="parent-box-title">
                <span className="badge-hubungan badge-ibu">Ibu</span>
                <span className="parent-name-text">{ibu ? ibu.nama || '(Nama belum diisi)' : ''}</span>
              </div>
              {ibu ? (
                <div className="parent-box-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/orang-tua/${ibu.id}/edit`)}
                    className="btn-secondary btn-sm"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  {onDeleteParent && (
                    <button
                      type="button"
                      onClick={() => onDeleteParent(ibu)}
                      className="btn-icon btn-icon-danger"
                      title="Hapus data ibu"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/orang-tua/tambah?student_id=${student.id}&hubungan=ibu`)
                  }
                  className="btn-primary btn-sm"
                >
                  <Plus size={14} />
                  <span>+ Tambah Ibu</span>
                </button>
              )}
            </div>

            <div className="parent-box-body">
              {ibu ? (
                <div className="detail-dl">
                  <div className="detail-row">
                    <span className="detail-label">Nama</span>
                    <span className="detail-val">{ibu.nama || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">NIK</span>
                    <span className="detail-val font-mono">{ibu.nik || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tahun Lahir</span>
                    <span className="detail-val">{ibu.tahun_lahir || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pendidikan</span>
                    <span className="detail-val">{ibu.jenjang_pendidikan || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pekerjaan</span>
                    <span className="detail-val">{ibu.pekerjaan || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Penghasilan</span>
                    <span className="detail-val">{ibu.penghasilan || '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="parent-empty-box">
                  <p className="parent-empty-text">Data ibu belum tersedia.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. RIWAYAT AKADEMIK SISWA (STAGE 11 INTEGRATION) */}
      <StudentAcademicHistorySection studentId={student.id} />

      {/* 7. DOKUMEN SISWA (STAGE 6 INTEGRATION) */}
      <StudentDocumentsSection
        studentId={student.id}
        studentName={student.nama}
      />
    </div>
  );
};
