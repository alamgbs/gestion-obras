export const BUDGET_STATUS = {
  BORRADOR: 'borrador',
  ENVIADO: 'enviado',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  VENCIDO: 'vencido',
} as const;

export type BudgetStatus = (typeof BUDGET_STATUS)[keyof typeof BUDGET_STATUS];

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  vencido: 'Vencido',
};

export const BUDGET_STATUS_COLORS: Record<BudgetStatus, string> = {
  borrador: 'default',
  enviado: 'processing',
  aprobado: 'success',
  rechazado: 'error',
  vencido: 'warning',
};

export const COST_TYPE = {
  MATERIAL_AND_LABOR: 'material_and_labor',
  LABOR_ONLY: 'labor_only',
  MATERIAL_ONLY: 'material_only',
} as const;

export type CostType = (typeof COST_TYPE)[keyof typeof COST_TYPE];

export const COST_TYPE_LABELS: Record<CostType, string> = {
  material_and_labor: 'Material y Mano de Obra',
  labor_only: 'Solo Mano de Obra',
  material_only: 'Solo Material',
};

export const DOCUMENT_TYPE = {
  RUC: 'RUC',
  CI: 'CI',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export const CLIENT_TYPE = {
  FISICA: 'fisica',
  JURIDICA: 'juridica',
} as const;

export type ClientType = (typeof CLIENT_TYPE)[keyof typeof CLIENT_TYPE];

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  fisica: 'Persona Fisica',
  juridica: 'Persona Juridica',
};

export const RATE_UNIT = {
  HOURLY: 'hourly',
  DAILY: 'daily',
} as const;

export type RateUnit = (typeof RATE_UNIT)[keyof typeof RATE_UNIT];

export const RATE_UNIT_LABELS: Record<RateUnit, string> = {
  hourly: 'Por Hora',
  daily: 'Por Dia',
};
