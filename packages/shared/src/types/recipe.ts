import type { CostType } from '../constants/status.js';
import type { Unit } from './material.js';

export interface RecipeCategory {
  id: string;
  parent_id: string | null;
  name: string;
  depth: number;
  sort_order: number;
  is_active: boolean;
  children?: RecipeCategory[];
}

export interface RecipeMaterial {
  id: string;
  recipe_id: string;
  material_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  sort_order: number;
  // Relations
  material?: {
    id: string;
    code: string;
    description: string;
    recipe_unit?: Unit;
  };
}

export interface RecipeLabor {
  id: string;
  recipe_id: string;
  labor_type_id: string;
  quantity: number;
  rate_amount: number;
  subtotal: number;
  sort_order: number;
  // Relations
  labor_type?: {
    id: string;
    code: string;
    description: string;
    rate_unit: string;
  };
}

export interface Recipe {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category_id: string;
  cost_type: CostType;
  output_unit_id: string;
  output_quantity: number;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
  margin_percentage: number;
  final_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Relations
  category?: RecipeCategory;
  output_unit?: Unit;
  materials?: RecipeMaterial[];
  labor?: RecipeLabor[];
}

export interface RecipeMaterialInput {
  material_id: string;
  quantity: number;
  sort_order?: number;
}

export interface RecipeLaborInput {
  labor_type_id: string;
  quantity: number;
  sort_order?: number;
}

export interface CreateRecipeRequest {
  code: string;
  name: string;
  description?: string;
  category_id: string;
  cost_type: CostType;
  output_unit_id: string;
  output_quantity: number;
  margin_percentage: number;
  materials?: RecipeMaterialInput[];
  labor?: RecipeLaborInput[];
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {}
