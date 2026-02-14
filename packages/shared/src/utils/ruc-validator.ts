/**
 * Validate Paraguayan RUC format
 * RUC format: XXXXXXX-X (7+ digits, dash, check digit)
 */
export function validateRUC(ruc: string): boolean {
  const rucRegex = /^\d{1,10}-\d$/;
  return rucRegex.test(ruc);
}

/**
 * Validate Paraguayan CI (Cedula de Identidad)
 * CI format: typically 6-8 digits, optionally with dots
 */
export function validateCI(ci: string): boolean {
  const cleaned = ci.replace(/\./g, '');
  return /^\d{5,8}$/.test(cleaned);
}

export function validateDocument(type: string, number: string): { valid: boolean; message?: string } {
  if (type === 'RUC') {
    if (!validateRUC(number)) {
      return { valid: false, message: 'Formato de RUC invalido. Ejemplo: 1234567-8' };
    }
  } else if (type === 'CI') {
    if (!validateCI(number)) {
      return { valid: false, message: 'Formato de CI invalido. Debe tener entre 5 y 8 digitos' };
    }
  }
  return { valid: true };
}
