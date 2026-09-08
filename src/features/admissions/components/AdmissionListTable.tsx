import React from 'react';
import { Eye, CheckCircle2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StudentAdmissionWithRelations } from '../types/admission.types';
import {
  ADMISSION_STATUS_LABELS,
  ADMISSION_STATUS_CLASSES,
} from '../types/admission.types';

interface AdmissionListTableProps {
  admissions: StudentAdmissionWithRelations[];
  isLoading: boolean;
  isFiltered: boolean;
  onUpdateStatus: (admission: StudentAdmissionWithRelations) => void;
  onEnroll: (admission: StudentAdmissionWithRelations) => void;
}

export const AdmissionListTable: React.FC<AdmissionListTableProps> = ({
  admissions,
  isLoading,
  isFiltered,
  onUpdateStatus,
  onEnroll,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="table-loading-container">
        <div className="spinner"></div>
        <p>Memuat data calon siswa...</p>
      </div>
    );
  }

  if (admissions.length === 0) {
    return (
      <div className="table-empty-container">
        <p className="empty-title">
          {isFiltered ? 'Data calon siswa tidak ditemukan.' : 'Belum ada data calon siswa.'}
        </p>
        <p className="empty-desc">
          {isFiltered
            ? 'Coba sesuaikan kata kunci pencarian atau filter tahun ajaran dan status.'
            : 'Mulai dengan menambahkan calon siswa baru ke dalam sistem.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nama Calon Siswa</th>
            <th>NIK</th>
            <th>NISN</th>
            <th>Target Kelas</th>
            <th>Tahun Ajaran</th>
            <th>Status</th>
            <th className="th-actions text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {admissions.map((item) => {
            const student = item.student;
            const academicYear = item.academic_year;
            const isAccepted = item.status === 'accepted';

            return (
              <tr key={item.id}>
                <td>
                  <div className="student-name-cell">
                    <span className="font-semibold text-main">{student?.nama || '-'}</span>
                    <span className="student-subtext">
                      {student?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                </td>
                <td className="font-mono text-sm">{student?.nik || '-'}</td>
                <td className="font-mono text-sm">{student?.nisn || '-'}</td>
                <td>
                  <span className="badge-kelas">Kelas {item.target_kelas}</span>
                </td>
                <td>
                  <span className="text-main font-medium">{academicYear?.tahun_ajaran || '-'}</span>
                  {academicYear?.status === 'active' && (
                    <span className="badge-active-indicator"> (Aktif)</span>
                  )}
                </td>
                <td>
                  <span className={ADMISSION_STATUS_CLASSES[item.status] || 'status-badge-inactive'}>
                    {ADMISSION_STATUS_LABELS[item.status] || item.status}
                  </span>
                </td>
                <td className="td-actions text-right">
                  <div className="action-button-group justify-end">
                    {/* View Detail Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/calon-siswa/${item.id}`)}
                      className="btn-icon"
                      title="Lihat Rincian Calon Siswa"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Change Status Button for non-enrolled */}
                    {item.status !== 'enrolled' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item)}
                        className="btn-secondary btn-sm"
                        title="Ubah Status Calon"
                      >
                        <CheckCircle2 size={13} />
                        <span>Status</span>
                      </button>
                    )}

                    {/* Final Enroll Button for accepted candidates */}
                    {isAccepted && (
                      <button
                        type="button"
                        onClick={() => onEnroll(item)}
                        className="btn-primary btn-sm"
                        title="Daftarkan Resmi sebagai Siswa Kelas 1"
                      >
                        <UserCheck size={13} />
                        <span>Daftarkan</span>
                      </button>
                    )}
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
