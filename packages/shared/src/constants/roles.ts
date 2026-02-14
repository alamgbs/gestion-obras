export const ROLES = {
  ADMIN: 'admin',
  GERENCIA: 'gerencia',
  CONTABLE: 'contable',
  FISCAL_OBRA: 'fiscal_obra',
  ENCARGADO_COMPRAS: 'encargado_compras',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  gerencia: 'Gerencia',
  contable: 'Contable',
  fiscal_obra: 'Fiscal de Obra',
  encargado_compras: 'Encargado de Compras',
};

export const ALL_ROLES: Role[] = Object.values(ROLES);
