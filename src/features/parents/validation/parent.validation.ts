import type { ParentFormData, ParentFormErrors } from '../types/parent.types';

export function validateParentForm(data: ParentFormData): {
  isValid: boolean;
  errors: ParentFormErrors;
} {
  const errors: ParentFormErrors = {};

  if (!data.student_id || data.student_id.trim() === '') {
    errors.student_id = 'Pilih siswa yang terkait.';
  }

  if (!data.hubungan || !['ayah', 'ibu'].includes(data.hubungan)) {
    errors.hubungan = 'Hubungan harus dipilih antara Ayah atau Ibu.';
  }

  // NIK is optional, but if filled must be exactly 16 numeric digits
  if (data.nik && data.nik.trim() !== '') {
    if (!/^\d{16}$/.test(data.nik.trim())) {
      errors.nik = 'NIK harus terdiri dari 16 digit angka.';
    }
  }

  // Tahun lahir is optional, but if filled must be reasonable integer
  if (data.tahun_lahir && data.tahun_lahir.trim() !== '') {
    const year = Number(data.tahun_lahir.trim());
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || !Number.isInteger(year) || year < 1920 || year > currentYear) {
      errors.tahun_lahir = `Tahun lahir harus berupa angka tahun yang valid (contoh: 1980).`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
