import { z } from 'zod';

export const createLaborTypeSchema = z.object({
  code: z.string().min(1, 'El codigo es obligatorio'),
  description: z.string().min(1, 'La descripcion es obligatoria'),
  rate_unit: z.enum(['hourly', 'daily'], {
    errorMap: () => ({ message: 'Tipo de tarifa invalido' }),
  }),
  rate_amount: z.number().int().min(0, 'La tarifa debe ser mayor o igual a 0'),
});

export const updateLaborTypeSchema = createLaborTypeSchema.partial();

export type CreateLaborTypeInput = z.infer<typeof createLaborTypeSchema>;
export type UpdateLaborTypeInput = z.infer<typeof updateLaborTypeSchema>;
