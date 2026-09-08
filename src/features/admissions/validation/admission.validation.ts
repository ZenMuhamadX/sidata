import type { AdmissionCreateFormData } from '../types/admission.types';
import { validateStudentForm } from '../../students/validation/student.validation';

export interface AdmissionValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof AdmissionCreateFormData, string>>;
}

export function validateAdmissionForm(formData: AdmissionCreateFormData): AdmissionValidationResult {
  const studentValidation = validateStudentForm(formData);
  const errors: Partial<Record<keyof AdmissionCreateFormData, string>> = {
    ...studentValidation.errors,
  };

  if (!formData.academic_year_id || formData.academic_year_id.trim() === '') {
    errors.academic_year_id = 'Tahun ajaran tujuan wajib dipilih.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
