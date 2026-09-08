import type { StudentRow } from '../../../types/database';

export type PromotionDecision = 'promoted' | 'retained';

export interface PromotionCandidateStudent {
  record_id: string;
  student_id: string;
  academic_year_id: string;
  kelas: number;
  status: string;
  student: StudentRow;
  decision: PromotionDecision;
  has_target_record?: boolean;
}

export interface PromotionDecisionItem {
  student_id: string;
  decision: PromotionDecision;
}

export interface PromotionBatchPayload {
  academic_year_from: string;
  academic_year_to: string;
  kelas_from: number;
  decisions: PromotionDecisionItem[];
}

export interface PromotionBatchResult {
  success: boolean;
  academic_year_from: string;
  academic_year_to: string;
  kelas_from: number;
  total_processed: number;
  promoted_count: number;
  retained_count: number;
  message: string;
}

export const PROMOTION_DECISION_LABELS: Record<PromotionDecision, string> = {
  promoted: 'Naik',
  retained: 'Tinggal Kelas',
};
