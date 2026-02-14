import type { BudgetStatus, CostType } from '../constants/status.js';

export interface BudgetItem {
  id: string;
  section_id: string;
  recipe_id: string | null;
  description: string;
  unit_id: string;
  quantity: number;
  material_unit_price: number;
  labor_unit_price: number;
  unit_price: number;
  subtotal: number;
  margin_percentage: number;
  final_price: number;
  sort_order: number;
  // Relations
  unit?: { id: string; code: string; name: string };
  recipe?: { id: string; code: string; name: string };
}

export interface BudgetSection {
  id: string;
  budget_id: string;
  name: string;
  sort_order: number;
  subtotal: number;
  items?: BudgetItem[];
}

export interface Budget {
  id: string;
  budget_number: string;
  client_id: string;
  project_name: string;
  description: string | null;
  location: string | null;
  budget_type: CostType;
  status: BudgetStatus;
  version: number;
  parent_id: string | null;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Relations
  client?: { id: string; name: string; document_number: string };
  sections?: BudgetSection[];
  creator?: { id: string; full_name: string };
  approver?: { id: string; full_name: string };
}

export interface BudgetItemInput {
  recipe_id?: string;
  description: string;
  unit_id: string;
  quantity: number;
  material_unit_price: number;
  labor_unit_price: number;
  margin_percentage?: number;
  sort_order?: number;
}

export interface BudgetSectionInput {
  name: string;
  sort_order?: number;
  items: BudgetItemInput[];
}

export interface CreateBudgetRequest {
  client_id: string;
  project_name: string;
  description?: string;
  location?: string;
  budget_type: CostType;
  valid_until?: string;
  notes?: string;
  discount_percentage?: number;
  tax_percentage?: number;
  sections: BudgetSectionInput[];
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {}

export interface BudgetStatusHistory {
  id: string;
  budget_id: string;
  from_status: BudgetStatus | null;
  to_status: BudgetStatus;
  changed_by: string;
  notes: string | null;
  created_at: string;
}
