export interface Unit {
  id: string;
  code: string;
  name: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface Material {
  id: string;
  code: string;
  description: string;
  category_id: string;
  purchase_unit_id: string;
  recipe_unit_id: string;
  conversion_factor: number;
  purchase_price: number;
  recipe_unit_price: number;
  stock_quantity: number;
  min_stock: number;
  supplier_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Relations
  category?: MaterialCategory;
  purchase_unit?: Unit;
  recipe_unit?: Unit;
}

export interface CreateMaterialRequest {
  code: string;
  description: string;
  category_id: string;
  purchase_unit_id: string;
  recipe_unit_id: string;
  conversion_factor: number;
  purchase_price: number;
  stock_quantity?: number;
  min_stock?: number;
  supplier_name?: string;
}

export interface UpdateMaterialRequest extends Partial<CreateMaterialRequest> {}
