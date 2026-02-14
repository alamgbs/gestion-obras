import { z } from 'zod';

export const budgetItemInputSchema = z.object({
  recipe_id: z.string().uuid().optional(),
  description: z.string().min(1, 'La descripcion es obligatoria'),
  unit_id: z.string().uuid('Unidad invalida'),
  quantity: z.number().positive('La cantidad debe ser positiva'),
  material_unit_price: z.number().int().min(0).default(0),
  labor_unit_price: z.number().int().min(0).default(0),
  margin_percentage: z.number().min(0).max(100).default(0),
  sort_order: z.number().int().min(0).optional(),
});

export const budgetSectionInputSchema = z.object({
  name: z.string().min(1, 'El nombre de la seccion es obligatorio'),
  sort_order: z.number().int().min(0).optional(),
  items: z.array(budgetItemInputSchema).min(1, 'La seccion debe tener al menos un item'),
});

export const createBudgetSchema = z.object({
  client_id: z.string().uuid('Cliente invalido'),
  project_name: z.string().min(1, 'El nombre del proyecto es obligatorio'),
  description: z.string().optional(),
  location: z.string().optional(),
  budget_type: z.enum(['material_and_labor', 'labor_only', 'material_only'], {
    errorMap: () => ({ message: 'Tipo de presupuesto invalido' }),
  }),
  valid_until: z.string().optional(),
  notes: z.string().optional(),
  discount_percentage: z.number().min(0).max(100).default(0),
  tax_percentage: z.number().min(0).max(100).default(10),
  sections: z.array(budgetSectionInputSchema).min(1, 'El presupuesto debe tener al menos una seccion'),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
