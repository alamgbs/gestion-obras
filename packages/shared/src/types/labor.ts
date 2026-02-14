import type { RateUnit } from '../constants/status.js';

export interface LaborType {
  id: string;
  code: string;
  description: string;
  rate_unit: RateUnit;
  rate_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateLaborTypeRequest {
  code: string;
  description: string;
  rate_unit: RateUnit;
  rate_amount: number;
}

export interface UpdateLaborTypeRequest extends Partial<CreateLaborTypeRequest> {}
