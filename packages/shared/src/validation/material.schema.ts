import { z } from 'zod';

export const createMaterialCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  sort_order: z.number().int().min(0).default(0),
});

export const createMaterialSchema = z.object({
  code: z.string().min(1, 'El codigo es obligatorio'),
  description: z.string().min(1, 'La descripcion es obligatoria'),
  category_id: z.string().uuid('Categoria invalida'),
  purchase_unit_id: z.string().uuid('Unidad de compra invalida'),
  recipe_unit_id: z.string().uuid('Unidad de receta invalida'),
  conversion_factor: z.number().positive('El factor de conversion debe ser positivo'),
  purchase_price: z.number().int().min(0, 'El precio debe ser mayor o igual a 0'),
  stock_quantity: z.number().min(0).default(0),
  min_stock: z.number().min(0).default(0),
  supplier_name: z.string().optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
