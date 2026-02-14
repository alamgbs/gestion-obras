/**
 * Format Guaranies for display: "1.500.000 Gs"
 */
export function formatGuaranies(amount: number | bigint): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('es-PY').format(num) + ' Gs';
}

/**
 * Round a decimal value to the nearest integer (for storing in BIGINT)
 */
export function roundToGuaranies(value: number): number {
  return Math.round(value);
}
