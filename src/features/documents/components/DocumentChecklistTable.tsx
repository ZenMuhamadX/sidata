import React from 'react';
import { Eye, Check, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StudentWithDocumentsSummary } from '../types/document.types';

interface DocumentChecklistTableProps {
  data: StudentWithDocumentsSummary[];
  isLoading: boolean;
  onOpenDocument: (storagePath: string) => Promise<void>;
}

export const DocumentChecklistTable: React.FC<DocumentChecklistTableProps> = ({
  data,
  isLoading,
  onOpenDocument,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="table-loading-container">
        <div className="spinner"></div>
        <p>Memuat data dokumen siswa...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-table-state">
        <p className="empty-title">Tidak ada data siswa ditemukan</p>
        <p className="empty-subtitle">
          Coba sesuaikan kata kunci pencarian atau filter yang Anda pilih.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th className="col-nama">Nama Siswa</th>
            <th className="col-kelas text-center">Kelas</th>
            <th className="col-doc text-center">KK</th>
            <th className="col-doc text-center">Akta</th>
            <th className="col-doc text-center">KTP Ayah</th>
            <th className="col-doc text-center">KTP Ibu</th>
            <th className="col-status text-center">Kelengkapan</th>
            <th className="col-actions text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student) => {
            const kk = student.documents.kk;
            const akta = student.documents.akta_lahir;
            const ktpAyah = student.documents.ktp_ayah;
            const ktpIbu = student.documents.ktp_ibu;

            return (
              <tr key={student.id}>
                {/* Nama & NIK */}
                <td className="col-nama">
                  <div className="student-name-cell">
                    <button
                      type="button"
                      onClick={() => navigate(`/siswa/${student.id}`)}
                      className="link-student-name"
                      title="Lihat detail siswa"
                    >
                      {student.nama}
                    </button>
                    <span className="student-subtext font-mono">
                      NIK: {student.nik}
                    </span>
                  </div>
                </td>

                {/* Kelas */}
                <td className="col-kelas text-center">
                  <span className="badge-kelas">Kelas {student.kelas}</span>
                </td>

                {/* KK */}
                <td className="col-doc text-center">
                  {kk ? (
                    <button
                      type="button"
                      onClick={() => onOpenDocument(kk.storage_path)}
                      className="doc-status-badge doc-available-badge"
                      title={`Buka KK: ${kk.original_filename}`}
                    >
                      <Check size={14} />
                      <span>✓</span>
                    </button>
                  ) : (
                    <span className="doc-status-badge doc-missing-badge" title="Belum tersedia">
                      <Minus size={14} />
                      <span>-</span>
                    </span>
                  )}
                </td>

                {/* Akta Lahir */}
                <td className="col-doc text-center">
                  {akta ? (
                    <button
                      type="button"
                      onClick={() => onOpenDocument(akta.storage_path)}
                      className="doc-status-badge doc-available-badge"
                      title={`Buka Akta Lahir: ${akta.original_filename}`}
                    >
                      <Check size={14} />
                      <span>✓</span>
                    </button>
                  ) : (
                    <span className="doc-status-badge doc-missing-badge" title="Belum tersedia">
                      <Minus size={14} />
                      <span>-</span>
                    </span>
                  )}
                </td>

                {/* KTP Ayah */}
                <td className="col-doc text-center">
                  {ktpAyah ? (
                    <button
                      type="button"
                      onClick={() => onOpenDocument(ktpAyah.storage_path)}
                      className="doc-status-badge doc-available-badge"
                      title={`Buka KTP Ayah: ${ktpAyah.original_filename}`}
                    >
                      <Check size={14} />
                      <span>✓</span>
                    </button>
                  ) : (
                    <span className="doc-status-badge doc-missing-badge" title="Belum tersedia">
                      <Minus size={14} />
                      <span>-</span>
                    </span>
                  )}
                </td>

                {/* KTP Ibu */}
                <td className="col-doc text-center">
                  {ktpIbu ? (
                    <button
                      type="button"
                      onClick={() => onOpenDocument(ktpIbu.storage_path)}
                      className="doc-status-badge doc-available-badge"
                      title={`Buka KTP Ibu: ${ktpIbu.original_filename}`}
                    >
                      <Check size={14} />
                      <span>✓</span>
                    </button>
                  ) : (
                    <span className="doc-status-badge doc-missing-badge" title="Belum tersedia">
                      <Minus size={14} />
                      <span>-</span>
                    </span>
                  )}
                </td>

                {/* Kelengkapan */}
                <td className="col-status text-center">
                  <span
                    className={
                      student.isComplete
                        ? 'status-badge-active'
                        : 'status-badge-inactive'
                    }
                  >
                    {student.isComplete ? 'Lengkap' : `${student.completedCount}/4 Dokumen`}
                  </span>
                </td>

                {/* Aksi: Detail Siswa */}
                <td className="col-actions text-center">
                  <button
                    type="button"
                    onClick={() => navigate(`/siswa/${student.id}`)}
                    className="btn-secondary btn-sm"
                    title="Kelola dokumen siswa di halaman detail"
                  >
                    <Eye size={14} />
                    <span>Kelola</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
