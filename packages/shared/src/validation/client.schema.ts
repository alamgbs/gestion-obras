import { z } from 'zod';

export const createClientSchema = z.object({
  document_type: z.enum(['RUC', 'CI'], {
    errorMap: () => ({ message: 'Tipo de documento invalido' }),
  }),
  document_number: z.string().min(1, 'El numero de documento es obligatorio'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  legal_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Formato de email invalido').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  client_type: z.enum(['fisica', 'juridica'], {
    errorMap: () => ({ message: 'Tipo de cliente invalido' }),
  }),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
