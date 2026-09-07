import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Student } from '../types/student.types';
import { formatIndonesianDate } from '../utils/formatters';

interface StudentListTableProps {
  students: Student[];
  isLoading: boolean;
  isFiltered: boolean;
  onDelete: (student: Student) => void;
}

export const StudentListTable: React.FC<StudentListTableProps> = ({
  students,
  isLoading,
  isFiltered,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="table-loading-container">
        <div className="spinner"></div>
        <p>Memuat data siswa...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="table-empty-container">
        <p className="empty-title">
          {isFiltered ? 'Data siswa tidak ditemukan.' : 'Belum ada data siswa.'}
        </p>
        <p className="empty-desc">
          {isFiltered
            ? 'Coba sesuaikan kata kunci pencarian atau reset filter kelas dan status.'
            : 'Mulai dengan menambahkan data siswa baru ke dalam sistem.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table student-table">
        <thead>
          <tr>
            <th>Nama Siswa</th>
            <th>NIK</th>
            <th>NISN</th>
            <th>JK</th>
            <th>Tempat / Tgl Lahir</th>
            <th>Kelas</th>
            <th>Status</th>
            <th className="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const isAktif = student.status_siswa === 'aktif';
            return (
              <tr key={student.id}>
                <td className="font-semibold text-main">
                  <button
                    type="button"
                    onClick={() => navigate(`/siswa/${student.id}`)}
                    className="link-student-name"
                    title="Lihat detail siswa"
                  >
                    {student.nama}
                  </button>
                </td>
                <td className="font-mono text-sm">{student.nik}</td>
                <td className="font-mono text-sm">{student.nisn || '-'}</td>
                <td>
                  <span className="badge-jk">{student.jenis_kelamin}</span>
                </td>
                <td>
                  {student.tempat_lahir}, {formatIndonesianDate(student.tanggal_lahir)}
                </td>
                <td>
                  <span className="badge-kelas">Kelas {student.kelas}</span>
                </td>
                <td>
                  <span className={isAktif ? 'status-badge-active' : 'status-badge-inactive'}>
                    {isAktif ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </td>
                <td className="text-right">
                  <div className="action-buttons-group">
                    <button
                      type="button"
                      onClick={() => navigate(`/siswa/${student.id}`)}
                      className="btn-icon"
                      title="Lihat Detail"
                      aria-label={`Lihat detail ${student.nama}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/siswa/${student.id}/edit`)}
                      className="btn-icon"
                      title="Edit Siswa"
                      aria-label={`Edit ${student.nama}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(student)}
                      className="btn-icon btn-icon-danger"
                      title="Hapus Siswa"
                      aria-label={`Hapus ${student.nama}`}
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
