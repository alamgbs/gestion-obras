import { z } from 'zod';

export const createRecipeCategorySchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  sort_order: z.number().int().min(0).default(0),
});

export const recipeMaterialInputSchema = z.object({
  material_id: z.string().uuid('Material invalido'),
  quantity: z.number().positive('La cantidad debe ser positiva'),
  sort_order: z.number().int().min(0).optional(),
});

export const recipeLaborInputSchema = z.object({
  labor_type_id: z.string().uuid('Tipo de mano de obra invalido'),
  quantity: z.number().positive('La cantidad debe ser positiva'),
  sort_order: z.number().int().min(0).optional(),
});

export const createRecipeSchema = z.object({
  code: z.string().min(1, 'El codigo es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  category_id: z.string().uuid('Categoria invalida'),
  cost_type: z.enum(['material_and_labor', 'labor_only', 'material_only'], {
    errorMap: () => ({ message: 'Tipo de costo invalido' }),
  }),
  output_unit_id: z.string().uuid('Unidad de salida invalida'),
  output_quantity: z.number().positive('La cantidad de salida debe ser positiva'),
  margin_percentage: z.number().min(0).max(100).default(0),
  materials: z.array(recipeMaterialInputSchema).optional(),
  labor: z.array(recipeLaborInputSchema).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
