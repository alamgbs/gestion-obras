import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Formato de email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

export const createUserSchema = z.object({
  email: z.string().email('Formato de email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'gerencia', 'contable', 'fiscal_obra', 'encargado_compras'], {
    errorMap: () => ({ message: 'Rol invalido' }),
  }),
});

export const updateUserSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  role: z.enum(['admin', 'gerencia', 'contable', 'fiscal_obra', 'encargado_compras']).optional(),
  is_active: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
