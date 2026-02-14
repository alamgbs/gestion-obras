export function formatGuaranies(amount: number): string {
  return new Intl.NumberFormat('es-PY').format(amount) + ' Gs';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
