import type { StudentFormData, StudentFormErrors } from '../types/student.types';

const VALID_AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

export function validateStudentForm(data: StudentFormData): {
  isValid: boolean;
  errors: StudentFormErrors;
} {
  const errors: StudentFormErrors = {};

  // 1. Data Identitas
  if (!data.nama || data.nama.trim() === '') {
    errors.nama = 'Nama siswa wajib diisi.';
  }

  if (!data.jenis_kelamin || !['L', 'P'].includes(data.jenis_kelamin)) {
    errors.jenis_kelamin = 'Pilih jenis kelamin yang valid (L atau P).';
  }

  if (!data.nik || data.nik.trim() === '') {
    errors.nik = 'NIK wajib diisi.';
  } else if (!/^\d{16}$/.test(data.nik.trim())) {
    errors.nik = 'NIK harus terdiri dari 16 digit angka.';
  }

  if (!data.tempat_lahir || data.tempat_lahir.trim() === '') {
    errors.tempat_lahir = 'Tempat lahir wajib diisi.';
  }

  if (!data.tanggal_lahir || data.tanggal_lahir.trim() === '') {
    errors.tanggal_lahir = 'Tanggal lahir wajib diisi.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.tanggal_lahir.trim())) {
    errors.tanggal_lahir = 'Format tanggal lahir tidak valid.';
  }

  if (!data.agama || !VALID_AGAMA.includes(data.agama)) {
    errors.agama = 'Pilih agama yang valid.';
  }

  // 2. Data Alamat
  if (!data.alamat || data.alamat.trim() === '') {
    errors.alamat = 'Alamat wajib diisi.';
  }

  if (!data.kelurahan || data.kelurahan.trim() === '') {
    errors.kelurahan = 'Kelurahan / Desa wajib diisi.';
  }

  if (!data.kecamatan || data.kecamatan.trim() === '') {
    errors.kecamatan = 'Kecamatan wajib diisi.';
  }

  // 3. Data Tambahan & Sekolah
  if (!data.kelas || data.kelas < 1 || data.kelas > 6) {
    errors.kelas = 'Kelas harus bernilai antara 1 sampai 6.';
  }

  if (data.anak_ke && data.anak_ke.trim() !== '') {
    const anakKeNum = Number(data.anak_ke.trim());
    if (isNaN(anakKeNum) || !Number.isInteger(anakKeNum) || anakKeNum < 1) {
      errors.anak_ke = 'Anak ke harus berupa bilangan bulat positif.';
    }
  }

  if (data.status_siswa && !['aktif', 'tidak_aktif'].includes(data.status_siswa)) {
    errors.status_siswa = 'Status siswa harus "aktif" atau "tidak_aktif".';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
