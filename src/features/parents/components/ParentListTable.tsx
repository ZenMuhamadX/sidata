import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ParentWithStudent } from '../types/parent.types';

interface ParentListTableProps {
  parents: ParentWithStudent[];
  isLoading: boolean;
  isFiltered: boolean;
  onDelete: (parent: ParentWithStudent) => void;
}

export const ParentListTable: React.FC<ParentListTableProps> = ({
  parents,
  isLoading,
  isFiltered,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="table-loading-container">
        <div className="spinner"></div>
        <p>Memuat data orang tua...</p>
      </div>
    );
  }

  if (parents.length === 0) {
    return (
      <div className="table-empty-container">
        <p className="empty-title">
          {isFiltered ? 'Data orang tua tidak ditemukan.' : 'Belum ada data orang tua.'}
        </p>
        <p className="empty-desc">
          {isFiltered
            ? 'Coba sesuaikan kata kunci pencarian atau reset filter hubungan, kelas, dan status.'
            : 'Mulai dengan menambahkan data orang tua (ayah/ibu) untuk siswa yang terdaftar.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table parent-table">
        <thead>
          <tr>
            <th>Nama Orang Tua</th>
            <th>Hubungan</th>
            <th>NIK</th>
            <th>Siswa Terkait</th>
            <th>Kelas</th>
            <th>Status Siswa</th>
            <th className="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {parents.map((parent) => {
            const student = parent.students;
            const isStudentAktif = student?.status_siswa === 'aktif';
            const isAyah = parent.hubungan === 'ayah';

            return (
              <tr key={parent.id}>
                <td className="font-semibold text-main">
                  <button
                    type="button"
                    onClick={() => navigate(`/orang-tua/${parent.id}`)}
                    className="link-student-name"
                    title="Lihat detail orang tua"
                  >
                    {parent.nama || '-'}
                  </button>
                </td>
                <td>
                  <span className={`badge-hubungan ${isAyah ? 'badge-ayah' : 'badge-ibu'}`}>
                    {isAyah ? 'Ayah' : 'Ibu'}
                  </span>
                </td>
                <td className="font-mono text-sm">{parent.nik || '-'}</td>
                <td>
                  {student ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/siswa/${student.id}`)}
                      className="link-relation-student"
                      title="Buka profil siswa"
                    >
                      {student.nama}
                    </button>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {student ? (
                    <span className="badge-kelas">Kelas {student.kelas}</span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {student ? (
                    <span className={isStudentAktif ? 'status-badge-active' : 'status-badge-inactive'}>
                      {isStudentAktif ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="text-right">
                  <div className="action-buttons-group">
                    <button
                      type="button"
                      onClick={() => navigate(`/orang-tua/${parent.id}`)}
                      className="btn-icon"
                      title="Lihat Detail"
                      aria-label={`Lihat detail ${parent.nama || parent.hubungan}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/orang-tua/${parent.id}/edit`)}
                      className="btn-icon"
                      title="Edit Orang Tua"
                      aria-label={`Edit ${parent.nama || parent.hubungan}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(parent)}
                      className="btn-icon btn-icon-danger"
                      title="Hapus Orang Tua"
                      aria-label={`Hapus ${parent.nama || parent.hubungan}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
